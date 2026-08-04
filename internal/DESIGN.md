# Design Document — Tributary

## Distributed Persistent Message Broker

**Version:** 0.1.0-draft  
**Date:** 2026-07-16  
**Status:** Draft for Review  

---

## 1. Architecture Overview

Tributary is a distributed message broker built entirely in Python using asyncio. The
system follows a layered architecture where each layer has a single responsibility and
a well-defined interface to the layer above and below it.

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Producer     │  │  Consumer     │  │  Admin CLI             │ │
│  │  (batching,   │  │  (long-poll,  │  │  (topics, metadata,   │ │
│  │   acks, retry)│  │   rebalance)  │  │   WAL inspect)        │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
└─────────┼──────────────────┼─────────────────────┼──────────────┘
          │                  │                      │
┌─────────▼──────────────────▼─────────────────────▼──────────────┐
│                      PROTOCOL LAYER                               │
│  ┌───────────┐  ┌───────────────┐  ┌──────────────────────────┐ │
│  │  Frame     │  │  Message      │  │  Codec                    │ │
│  │  Parser     │  │  Dispatcher   │  │  (serialize/deserialize   │ │
│  │  (struct)   │  │  (by type)     │  │   using struct + zlib)   │ │
│  └──────┬─────┘  └───────┬───────┘  └──────────────────────────┘ │
└─────────┼─────────────────┼──────────────────────────────────────┘
          │                  │
┌─────────▼─────────────────▼──────────────────────────────────────┐
│                      TRANSPORT LAYER                              │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │  TCP Server        │  │  Connection Manager                  │ │
│  │  (asyncio, accept) │  │  (per-conn state, read/write buf,   │ │
│  │                    │  │   backpressure, idle timeout)        │ │
│  └─────────┬──────────┘  └────────────────┬───────────────────┘ │
└────────────┼──────────────────────────────┼────────────────────┘
             │                              │
┌────────────▼──────────────────────────────▼────────────────────┐
│                      BROKER LAYER                               │
│  ┌───────────┐  ┌───────────────┐  ┌───────────┐  ┌─────────┐ │
│  │  Topic     │  │  Partition     │  │  Consumer  │  │ Offset  │ │
│  │  Manager   │  │  Leader        │  │  Group     │  │ Manager │ │
│  │            │  │  (route, ack)  │  │  Coord.    │  │         │ │
│  └─────┬─────┘  └───────┬───────┘  └─────┬─────┘  └────┬────┘ │
│        │                │                 │             │      │
│        └────────────────┼─────────────────┼─────────────┘      │
│                         │                 │                    │
│  ┌──────────────────────▼─────────────────▼──────────────────┐ │
│  │                   Request Handler                         │ │
│  │  (dispatch by msg type, error handling, correlation)      │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    CONSENSUS LAYER                               │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │  Raft State   │  │  Log          │  │  Election            │ │
│  │  Machine      │  │  Replication  │  │  (timeout, vote)     │ │
│  │  (leader/     │  │  (AppendEnt.  │  │                      │ │
│  │   follower/   │  │   RPC)        │  │                      │ │
│  │   candidate)  │  │               │  │                      │ │
│  └──────┬───────┘  └───────┬───────┘  └──────────────────────┘ │
│         │                  │                                    │
│  ┌──────▼──────────────────▼──────────────────────────────────┐ │
│  │                   Snapshot Manager                          │ │
│  │  (log compaction, state serialization, restore)            │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     STORAGE LAYER                                │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │  Segment      │  │  Sparse Index  │  │  WAL Manager          │ │
│  │  (append-only │  │  (offset →     │  │  (segment lifecycle,  │ │
│  │   binary file │  │   byte pos,    │  │   crash recovery,    │ │
│  │   + mmap)     │  │   binary sch)  │  │   retention)         │ │
│  └──────────────┘  └───────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Module Responsibilities

### 2.1 `tributary.protocol` — Binary Wire Protocol

#### Frame Format

Every message on the wire is a frame with the following layout:

```
Offset  Size  Field           Description
0       2     magic           0x7472 ("tr" — Tributary magic bytes)
2       1     version         Protocol version (currently 0x01)
3       2     msg_type        Message type (uint16, big-endian)
5       4     correlation_id   Request ID for matching responses (uint32, big-endian)
9       4     body_length      Length of body in bytes (uint32, big-endian)
13      4     body_crc32c      CRC32C of body (uint32, big-endian)
17      N     body             Message payload (optionally zlib-compressed)
```

**Frame header size:** 17 bytes.  
**Total frame size:** 17 + body_length bytes.

#### Message Types

```python
class MsgType(IntEnum):
    # Client-facing
    PRODUCE        = 1
    FETCH          = 2
    CREATE_TOPIC   = 3
    DELETE_TOPIC   = 4
    LIST_TOPICS    = 5
    COMMIT_OFFSET  = 6
    FETCH_OFFSET   = 7
    JOIN_GROUP     = 8
    LEAVE_GROUP    = 9
    HEARTBEAT      = 10
    METADATA       = 11

    # Raft internal
    RAFT_VOTE_REQ     = 50
    RAFT_VOTE_RESP    = 51
    RAFT_APPEND_REQ   = 52
    RAFT_APPEND_RESP  = 53
    RAFT_SNAPSHOT_REQ = 54
    RAFT_SNAPSHOT_RESP= 55

    # System
    ACK     = 100
    ERROR   = 101
```

#### Codec

Each message type has a corresponding struct format string for serialization.
The codec module provides:

```python
def encode(msg: Message) -> bytes: ...
def decode(data: bytes, msg_type: MsgType) -> Message: ...
```

Compression is negotiated at connection time. If both sides support zlib, the body
field is zlib-compressed before CRC computation. The frame header is always
uncompressed.

### 2.2 `tributary.transport` — asyncio TCP Layer

#### TCP Server

```python
class TributaryServer:
    def __init__(self, host: str, port: int, handler: RequestHandler): ...
    async def start(self) -> None: ...
    async def stop(self) -> None: ...
```

Uses `asyncio.start_server()` with a custom protocol factory. Each accepted connection
gets a `Connection` object.

#### Connection

```python
class Connection:
    def __init__(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter): ...

    async def read_frame(self) -> Frame | None:
        # Read exactly one frame. Returns None on EOF.
        ...

    async def write_frame(self, frame: Frame) -> None:
        # Write one frame. Applies backpressure via drain().
        ...

    async def close(self) -> None: ...
```

#### Backpressure

The connection tracks in-flight bytes (bytes written but not yet acknowledged by the
OS). If in-flight bytes exceed `max_inflight_bytes` (default 1MB), `write_frame()`
blocks on `writer.drain()` until the OS buffer drains.

This prevents a fast producer from overwhelming a slow consumer network buffer.

### 2.3 `tributary.storage` — Segment-Based WAL

#### Record Format (on-disk)

Each record in a WAL segment file:

```
Offset  Size    Field           Description
0       8       offset          Monotonic partition offset (uint64_be)
8       8       timestamp       Unix epoch milliseconds (uint64_be)
16      4       key_length      Length of key (uint32_be); 0 = no key
20      K       key             Key bytes (if key_length > 0)
20+K    4       value_length    Length of value (uint32_be)
24+K    V       value           Value bytes
24+K+V  4       crc32c          CRC32C of (offset + timestamp + key + value)
```

**Minimum record size:** 28 bytes (no key, no value).  
**Maximum record size:** 2^32 - 1 bytes (4GB value).

#### Segment

```python
class Segment:
    # A single append-only log file with a sparse index.

    def __init__(self, path: Path, index_path: Path, base_offset: int): ...

    async def append(self, record: Record) -> int:
        # Append a record. Returns the assigned offset.
        ...

    async def read(self, offset: int, max_bytes: int) -> list[Record]:
        # Read records starting at offset, up to max_bytes.
        ...

    async def read_at(self, offset: int) -> Record | None:
        # Read a single record at exact offset.
        ...

    def size(self) -> int: ...

    def should_roll(self, max_size: int) -> bool: ...

    async def close(self) -> None: ...
```

#### Sparse Index

```python
class SparseIndex:
    # Binary-searchable index mapping offsets to byte positions.

    def __init__(self, path: Path): ...

    def write_entry(self, offset: int, position: int) -> None:
        # Add an index entry. Called every Nth append.
        ...

    def lookup(self, offset: int) -> int:
        # Return byte position of the record at or before offset.
        # Uses binary search. O(log N) complexity.
        ...

    def close(self) -> None: ...
```

**Index entry format:** 12 bytes each: `[offset: uint64_be][position: uint32_be]`  
**Sparsity:** One index entry per 4KB of log data (configurable). A 1MB segment
has ~256 index entries; binary search takes <=8 comparisons.

#### Crash Recovery

```python
class CrashRecovery:
    # Recover a partition WAL on startup.

    @staticmethod
    async def recover(partition_path: Path) -> RecoveryResult:
        # 1. List all segment files, sort by base offset.
        # 2. For each segment, iterate records.
        # 3. Verify CRC32C on each record.
        # 4. If CRC fails, truncate segment at the last valid record.
        # 5. Rebuild index from valid records.
        # 6. Return RecoveryResult with last_valid_offset and any truncations.
        ...
```

### 2.4 `tributary.consensus` — Raft Consensus

#### Raft State Machine

```python
class NodeRole(Enum):
    FOLLOWER = "follower"
    CANDIDATE = "candidate"
    LEADER = "leader"

@dataclass
class PersistentState:
    # Stored on disk. Survives restarts.
    current_term: int
    voted_for: str | None
    log: list[RaftLogEntry]

@dataclass
class VolatileState:
    # In-memory only.
    commit_index: int
    last_applied: int

@dataclass
class LeaderState:
    # Only present on leader.
    next_index: dict[str, int]
    match_index: dict[str, int]

class RaftNode:
    role: NodeRole
    persistent: PersistentState
    volatile: VolatileState
    leader_state: LeaderState | None

    # Election
    election_timeout: float
    last_heartbeat: float

    async def start_election(self) -> None: ...
    async def handle_vote_request(self, req: VoteRequest) -> VoteResponse: ...
    async def handle_vote_response(self, resp: VoteResponse) -> None: ...

    # Log replication
    async def append_entries(self) -> None: ...
    async def handle_append_request(self, req: AppendEntriesRequest) -> AppendEntriesResponse: ...

    # Snapshotting
    async def maybe_snapshot(self) -> None: ...
    async def install_snapshot(self, peer: str) -> None: ...
```

#### Raft Log Entry

```python
@dataclass(frozen=True)
class RaftLogEntry:
    term: int
    index: int
    command: bytes
    entry_type: EntryType  # DATA | CONFIG | SNAPSHOT_REF
```

#### Election Flow

```
1. Follower election timer fires (randomized 150-300ms since last heartbeat)
2. Follower becomes Candidate:
   - Increment current_term
   - Vote for self
   - Reset election timer
   - Send RequestVote RPC to all peers
3. Candidate receives votes:
   - If majority: become Leader, send heartbeats
   - If higher term seen: become Follower
   - If timeout with no majority: new election (increment term)
4. Leader sends AppendEntries heartbeats at 50ms intervals
```

#### Log Replication Flow

```
1. Client sends PRODUCE to broker
2. Broker (if leader) appends to Raft log
3. Leader sends AppendEntries RPC to all followers with new log entries
4. Followers append to their Raft logs, respond with success
5. When majority of followers acknowledge: leader commits entry
6. Leader applies committed entry to partition WAL
7. Leader responds to client with success
```

### 2.5 `tributary.broker` — Broker Core

#### Request Handler

```python
class RequestHandler:
    # Dispatches incoming requests by message type.

    def __init__(self, topic_mgr: TopicManager, consensus: RaftNode, ...): ...

    async def handle(self, frame: Frame, conn: Connection) -> Frame | None:
        match frame.msg_type:
            case MsgType.PRODUCE:
                return await self._handle_produce(frame, conn)
            case MsgType.FETCH:
                return await self._handle_fetch(frame, conn)
            case MsgType.CREATE_TOPIC:
                return await self._handle_create_topic(frame, conn)
            ...
```

#### Topic Manager

```python
class TopicManager:
    topics: dict[str, Topic]

    async def create_topic(self, name: str, partitions: int, replication_factor: int) -> Topic: ...
    async def delete_topic(self, name: str) -> None: ...
    def list_topics(self) -> list[TopicMetadata]: ...
    def get_partition_leader(self, topic: str, partition: int) -> str | None: ...
```

#### Partition (Leader)

```python
class Partition:
    def __init__(self, topic: str, partition_id: int, wal: WALManager, ...): ...

    async def produce(self, key: bytes | None, value: bytes) -> int:
        # Append to WAL. Returns assigned offset.
        ...

    async def fetch(self, offset: int, max_bytes: int, max_wait_ms: int) -> list[Record]:
        # Read records. Long-poll if no data available.
        ...

    async def replicate_to(self, followers: list[str]) -> ReplicationResult:
        # Send new log entries to follower replicas.
        ...
```

### 2.6 `tributary.consumer` — Consumer Groups

#### Consumer Group Coordinator

```python
class ConsumerGroupCoordinator:
    groups: dict[str, ConsumerGroup]

    async def join_group(self, group_id: str, consumer_id: str, topics: list[str]) -> Assignment: ...
    async def leave_group(self, group_id: str, consumer_id: str) -> None: ...
    async def heartbeat(self, group_id: str, consumer_id: str) -> None: ...
    async def rebalance(self, group_id: str) -> None: ...
```

#### Assignment Strategy

Consistent hashing: each consumer ID is hashed onto a ring. Partitions are assigned
to the consumer whose hash is closest on the ring. This minimizes partition
reassignment during rebalancing.

#### Offset Management

Offsets are stored in an internal topic `__offsets` with key format
`{group_id}:{topic}:{partition}`. This mirrors Kafka design and means offset storage
benefits from the same WAL + replication infrastructure as regular topics.

```python
class OffsetManager:
    async def commit(self, group_id: str, topic: str, partition: int, offset: int) -> None: ...
    async def fetch(self, group_id: str, topic: str, partition: int) -> int: ...
```

### 2.7 `tributary.client` — Async Client Library

#### Producer

```python
class TributaryProducer:
    def __init__(self, brokers: list[str], ...): ...

    async def start(self) -> None: ...
    async def send(self, topic: str, key: bytes | None, value: bytes) -> ProduceResult: ...
    async def flush(self) -> None: ...
    async def close(self) -> None: ...

    _batch: dict[str, list[Message]]
    _batch_size: int = 500
    _batch_timeout_ms: int = 50
```

#### Consumer

```python
class TributaryConsumer:
    def __init__(self, brokers: list[str], group_id: str, topics: list[str], ...): ...

    async def start(self) -> None: ...
    async def poll(self, max_messages: int, timeout_ms: int) -> list[Message]: ...
    async def commit(self) -> None: ...
    async def close(self) -> None: ...
```

### 2.8 `tributary.cli` — Command-Line Interface

```
tributary broker start --config node.toml
tributary topic create my-topic --partitions 3
tributary topic list
tributary topic delete my-topic
tributary produce my-topic --key k --value v
tributary produce my-topic --file messages.jsonl
tributary consume my-topic --group g1
tributary cluster metadata
tributary cluster nodes
tributary wal inspect my-topic --partition 0
tributary wal verify my-topic --partition 0
```

---

## 3. Data Flow: Produce (Single-Node)

```
Producer              Broker                     Storage
   |                    |                           |
   |-- PRODUCE ------->|                           |
   |  (topic, part,    |                           |
   |   key, value)     |                           |
   |                    |-- route to partition -->   |
   |                    |                           |
   |                    |-- append to WAL --------->|
   |                    |                   Segment.append()
   |                    |                   Index.write_entry()
   |                    |<-- offset ----------------|
   |                    |                           |
   |<-- ACK (offset) --|                           |
```

---

## 4. Data Flow: Produce (Replicated)

```
Producer         Leader Broker           Follower Broker(s)
   |                 |                         |
   |-- PRODUCE ----->|                         |
   |                 |                         |
   |                 |-- append to Raft log -->|
   |                 |  (not yet committed)     |
   |                 |                         |
   |                 |-- RAFT_APPEND_REQ ------>|
   |                 |  (log entries)           |
   |                 |                         |-- append to Raft log
   |                 |<-- RAFT_APPEND_RESP ----|
   |                 |  (success)              |
   |                 |                         |
   |                 |-- majority acked ->     |
   |                 |  commit entry           |
   |                 |                         |
   |                 |-- apply to partition WAL>|
   |                 |                         |-- apply to partition WAL
   |                 |                         |
   |<-- ACK (offset) |                         |
   |  (acks=all)     |                         |
```

---

## 5. Data Flow: Fetch (Long-Poll)

```
Consumer             Broker                      Storage
   |                   |                           |
   |-- FETCH --------->|                           |
   |  (topic, part,    |                           |
   |   offset,         |                           |
   |   max_bytes,      |                           |
   |   max_wait_ms)    |                           |
   |                   |                           |
   |                   |-- check if data at offset |
   |                   |  is available             |
   |                   |                           |
   |           +--- data available?                |
   |           |                                       |
   |      YES  |   NO (wait up to max_wait_ms)     |
   |           |                                       |
   |           |   +- schedule timer -+             |
   |           |   |  for max_wait_ms |             |
   |           |   +------------------+             |
   |           |                                       |
   |           |   +- new data arrives ->           |
   |           |   |  (via produce)                  |
   |           |   +------------------+             |
   |           |                                       |
   |           v                                       |
   |                   |-- read from WAL ----------->|
   |                   |  via mmap + index lookup    |
   |                   |<-- records -----------------|
   |                   |                           |
   |<-- FETCH_RESP ---|                           |
   |  (records)        |                           |
```

---

## 6. Concurrency Model

### 6.1 Single Event Loop

Tributary uses a single asyncio event loop per broker node. This is I/O-bound
workload (network reads/writes, file I/O) where asyncio excels.

**Rationale:** A single event loop avoids GIL contention, simplifies reasoning about
state, and eliminates the need for locks on broker-internal data structures. All
state mutations happen on the event loop thread.

### 6.2 File I/O

WAL appends use `os.pwrite()` (positional write, no seek needed) via
`loop.run_in_executor()` to avoid blocking the event loop. Reads use `mmap.mmap()`
which maps file pages into process memory: zero-copy reads with no syscall per fetch.

### 6.3 Batched Writes

The producer client batches messages and sends them in a single PRODUCE frame. The
broker appends all records in a batch with a single `os.fsync()` call. This amortizes
the most expensive operation (disk sync) across many messages.

### 6.4 No Thread Pools for Core Logic

Raft timers, election logic, and log replication are all asyncio tasks. The only
thread pool usage is for `os.pwrite()` and `os.fsync()`.

### 6.5 Connection-Level Pipelining

Each TCP connection supports request pipelining: a client can send multiple frames
without waiting for responses. The broker processes them concurrently and sends
responses in order.

---

## 7. Security Model

### v0.1 Security Posture

Tributary v0.1 operates in a trusted network model:

- No authentication (any TCP connection is accepted)
- No TLS (plaintext protocol)
- No ACLs (any client can create/delete topics)

**Rationale:** v0.1 is a portfolio project demonstrating architecture, not a
production deployment. Security is a v0.2 concern.

### v0.2 Security Roadmap

- TLS via `ssl` module (Python stdlib)
- SASL PLAIN/SCRAM authentication
- Per-topic ACLs
- Quota enforcement (bytes/sec per producer)

---

## 8. Failure Modes and Handling

| Failure Mode | Detection | Recovery |
|--------------|-----------|----------|
| Producer sends to non-leader | Metadata response has correct leader | Client refreshes metadata, retries |
| Broker crash mid-append | CRC verification on startup | Truncate WAL at last valid record |
| WAL segment corruption | CRC32C check on every record read | Skip corrupt record, log error, continue |
| Leader crash | Follower election timeout fires | New leader elected from ISR |
| Network partition (split-brain) | Raft majority check | Minority cannot commit; majority elects new leader |
| Consumer crash mid-processing | Offset not committed | On rejoin, reads from last committed offset (at-least-once) |
| Disk full | OSError on write | Broker enters read-only mode; rejects produces, allows fetches |
| Slow follower | Leader tracks follower offset | Leader drops slow follower from ISR; continues with remaining replicas |
| Election instability | Multiple elections in short period | Pre-vote phase (v0.2); exponential backoff |
| Connection reset | ConnectionResetError on read/write | Clean up connection state; trigger group rebalance |
| Index file corruption | Index lookup returns invalid position | Rebuild index from WAL segment (full scan) |

---

## 9. Design Trade-Offs

### 9.1 asyncio vs. Multi-Threaded

**Chosen:** asyncio single event loop.

**Trade-off:** Cannot utilize multiple CPU cores for broker logic. But message broker
workloads are I/O-bound, not CPU-bound. The GIL would limit multi-threaded Python
anyway. asyncio provides higher concurrency for I/O than threads.

**Rejected:** Multi-process with shared memory. Adds complexity (IPC, state
synchronization) without clear benefit for I/O-bound workloads.

### 9.2 Internal Topic for Offsets vs. sqlite3

**Chosen:** Internal `__offsets` topic (Kafka-style).

**Trade-off:** More complex to implement (offset operations go through the same
produce/fetch path). But offset storage benefits from the same WAL durability,
replication, and crash recovery as regular topics.

**Rejected:** sqlite3. Simpler, but introduces a separate storage engine with
different durability and crash-recovery semantics.

### 9.3 Custom Binary Protocol vs. HTTP/JSON

**Chosen:** Custom binary protocol with struct module.

**Trade-off:** More complex to implement (hand-rolled serialization, framing, CRC).
But demonstrates wire-protocol design skills and achieves far better performance
than HTTP/JSON (no header overhead, no string parsing, compact binary encoding).

**Rejected:** HTTP/JSON. Trivial to implement but teaches nothing about protocol
design, framing, or binary serialization. Not portfolio-grade.

### 9.4 Segment-Based WAL vs. Single Append-Only File

**Chosen:** Rolling segment files (1MB each) with sparse indexes.

**Trade-off:** More complex (segment lifecycle, rolling, index management). But
enables efficient retention (delete old segments without copying), efficient reads
(binary search on index), and mimics Kafka storage design.

**Rejected:** Single append-only file. Simpler, but retention requires copying,
reads require linear scan, and the file grows unbounded.

### 9.5 asyncio TCP vs. ZeroMQ / nanomsg

**Chosen:** Raw asyncio TCP with custom protocol.

**Trade-off:** More low-level work (connection management, framing, backpressure).
But zero dependencies and full control over the protocol.

**Rejected:** ZeroMQ. Removes protocol design and framing from the project, which
is a core learning objective.

---

## 10. Package Layout

```
tributary/
├── pyproject.toml
├── README.md
├── LICENSE
├── docs/
│   ├── PRD.md
│   ├── DESIGN.md
│   └── ARCHITECTURE.md
├── src/tributary/
│   ├── __init__.py
│   ├── __main__.py
│   ├── protocol/
│   │   ├── __init__.py
│   │   ├── frames.py
│   │   ├── messages.py
│   │   └── codec.py
│   ├── transport/
│   │   ├── __init__.py
│   │   ├── server.py
│   │   ├── connection.py
│   │   └── backpressure.py
│   ├── storage/
│   │   ├── __init__.py
│   │   ├── segment.py
│   │   ├── index.py
│   │   ├── partition.py
│   │   └── recovery.py
│   ├── consensus/
│   │   ├── __init__.py
│   │   ├── raft.py
│   │   ├── log.py
│   │   ├── election.py
│   │   └── snapshot.py
│   ├── broker/
│   │   ├── __init__.py
│   │   ├── topic.py
│   │   ├── manager.py
│   │   ├── partition.py
│   │   └── handler.py
│   ├── consumer/
│   │   ├── __init__.py
│   │   ├── group.py
│   │   ├── offset.py
│   │   └── assignment.py
│   ├── client/
│   │   ├── __init__.py
│   │   ├── producer.py
│   │   ├── consumer.py
│   │   └── admin.py
│   ├── cli/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── display.py
│   └── utils/
│       ├── __init__.py
│       ├── crc.py
│       ├── compress.py
│       ├── metrics.py
│       └── logging.py
└── tests/
    ├── conftest.py
    ├── test_protocol.py
    ├── test_storage.py
    ├── test_consensus.py
    ├── test_broker.py
    ├── test_consumer.py
    ├── test_backpressure.py
    └── test_integration.py
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

- `test_protocol.py`: Pack a frame, unpack it, verify all fields. Corrupt one byte,
  verify CRC fails. Test compression: encode -> compress -> decompress -> decode.
- `test_storage.py`: Append 1000 records to a segment, read back all, verify offsets
  and CRCs. Test index lookup: binary search returns correct position. Crash recovery:
  truncate segment mid-record, verify recovery truncates to last valid record.
- `test_consensus.py`: Single-node election (becomes leader immediately). Two-node
  election (one wins). Log replication: leader has 10 entries, follower has 5,
  verify catch-up.
- `test_broker.py`: Create topic with 3 partitions. Produce to each partition.
  Fetch from each. Verify offsets are monotonic per partition.
- `test_consumer.py`: Join group with 3 consumers, 6 partitions. Verify each consumer
  gets 2 partitions. Kill one consumer, verify rebalance redistributes.
- `test_backpressure.py`: Send 10MB of data to a connection with 1KB buffer. Verify
  `drain()` blocks until buffer drains. No data loss.

### 11.2 Property-Based Tests (hypothesis)

- **Frame round-trip:** For any valid message, `decode(encode(msg)) == msg`.
- **Index consistency:** For any sequence of appends, `lookup(offset)` returns a
  position such that `read_at(offset)` returns the correct record.
- **Crash recovery:** For any truncation point in a segment, recovery truncates to
  the last valid record and no data before that point is lost.
- **Election safety:** For any cluster state, at most one leader is elected per term.
- **Log consistency:** After replication, all followers have identical logs up to
  commit_index.

### 11.3 Integration Tests

- `test_integration.py`: Start 3 broker nodes on localhost ports 7001, 7002, 7003.
  Create topic with replication factor 3. Produce 10,000 messages. Kill leader node.
  Verify new leader is elected. Verify all 10,000 messages are readable from the new
  leader. Restart killed node. Verify it catches up.

### 11.4 Chaos Tests

- **Network partition:** Inject `asyncio.sleep()` to simulate partition between leader
  and one follower. Verify leader continues with majority.
- **Slow disk:** Monkeypatch `os.fsync` to add 500ms delay. Verify broker does not
  block other connections.
- **Connection flood:** Open 1000 connections simultaneously. Verify broker handles
  all gracefully (no crash, no OOM).

---

## 12. Performance Characteristics

| Operation | Target (localhost) | Bottleneck |
|-----------|--------------------|-----------| 
| Single produce (acks=1) | <1ms | fsync latency |
| Single produce (acks=0) | <0.5ms | TCP + append |
| Batch produce (1K msgs, acks=1) | <10ms | Single fsync for batch |
| Single fetch | <1ms | mmap read + index lookup |
| Sustained throughput (batched) | 50K+ msgs/sec | Disk I/O + GIL |
| Leader failover | <2s | Election timeout (150-300ms) + state transfer |
| Crash recovery (10K msgs) | <5s | WAL replay + CRC verification |
| Follower catch-up (10K msgs) | <3s | Network transfer + WAL append |

**Bottleneck analysis:**

- **fsync is the primary bottleneck** for durability. Batched writes amortize this:
  1 fsync per 500 messages instead of 1 per message.
- **GIL limits CPU parallelism** but broker work is I/O-bound. asyncio concurrency
  handles thousands of connections without GIL contention.
- **mmap reads have zero syscall overhead** after initial page fault. Fetch latency
  is dominated by TCP round-trip, not disk read.
- **Election timeout (150-300ms) sets the failover floor.** Lower timeouts risk
  false elections; higher timeouts increase downtime.

---

## 13. Configuration

```toml
# node.toml

[broker]
node_id = "node-1"
host = "127.0.0.1"
port = 7001
data_dir = "./data"

[cluster]
peers = [
    { id = "node-1", host = "127.0.0.1", port = 7001 },
    { id = "node-2", host = "127.0.0.1", port = 7002 },
    { id = "node-3", host = "127.0.0.1", port = 7003 },
]

[storage]
segment_max_bytes = 1048576
index_interval_bytes = 4096
retention_hours = 168
wal_sync_mode = "batch"

[raft]
election_timeout_min_ms = 150
election_timeout_max_ms = 300
heartbeat_interval_ms = 50
snapshot_threshold_entries = 10000

[protocol]
version = 1
compression = "zlib"
max_frame_size = 10485760

[transport]
max_connections = 1000
max_inflight_bytes = 1048576
connection_timeout_seconds = 300
tcp_nodelay = true

[consumer]
session_timeout_ms = 30000
rebalance_timeout_ms = 10000
max_poll_records = 500
```

---

## 14. API Guarantees

1. **Durability:** Once a producer receives an ACK with acks=1 or acks=all, the
   message is persisted to disk (WAL) and/or replicated to a majority of nodes.
2. **Ordering:** Messages within a partition are strictly ordered by offset.
3. **At-least-once delivery:** Consumers may see duplicate messages in failure
   scenarios (crash before offset commit). Exactly-once is a v0.2 goal.
4. **Crash recovery:** On restart, the broker recovers all committed messages from
   the WAL. No committed data is lost.
5. **Partition tolerance:** The cluster remains available during single-node failure
   (assuming majority remains). Raft ensures only one leader per term.
6. **Backpressure:** A fast producer cannot overwhelm the broker. The sliding window
   flow control throttles the producer TCP connection.
7. **Monotonic offsets:** Offsets within a partition are strictly increasing and
   never reused.
8. **Zero dependencies:** `pip install tributary` installs no runtime dependencies.
