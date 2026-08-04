# Architecture Reference — Tributary

## System Topology and Deployment Patterns

**Version:** 0.1.0-draft  
**Date:** 2026-07-16  

---

## 1. System Topology

A Tributary cluster consists of N broker nodes (odd number recommended, minimum 3)
running on the same machine via different localhost ports. Each node is an independent
process with its own storage directory, Raft state, and asyncio event loop.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HOST MACHINE                                │
│                     (Linux / macOS / WSL2)                          │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Node 1        │  │   Node 2        │  │   Node 3        │      │
│  │   :7001         │  │   :7002         │  │   :7003         │      │
│  │                 │  │                 │  │                 │      │
│  │  ┌────────────┐ │  │  ┌────────────┐ │  │  ┌────────────┐ │      │
│  │  │ Broker     │ │  │  │ Broker     │ │  │  │ Broker     │ │      │
│  │  │ (asyncio)  │ │  │  │ (asyncio)  │ │  │  │ (asyncio)  │ │      │
│  │  └─────┬──────┘ │  │  └─────┬──────┘ │  │  └─────┬──────┘ │      │
│  │        │        │  │        │        │  │        │        │      │
│  │  ┌─────▼──────┐ │  │  ┌─────▼──────┐ │  │  ┌─────▼──────┐ │      │
│  │  │ Raft       │ │  │  │ Raft       │ │  │  │ Raft       │ │      │
│  │  │ (leader/   │ │  │  │ (follower) │ │  │  │ (follower) │ │      │
│  │  │  leader)   │ │  │  │            │ │  │  │            │ │      │
│  │  └─────┬──────┘ │  │  └─────┬──────┘ │  │  └─────┬──────┘ │      │
│  │        │        │  │        │        │  │        │        │      │
│  │  ┌─────▼──────┐ │  │  ┌─────▼──────┐ │  │  ┌─────▼──────┐ │      │
│  │  │ Storage    │ │  │  │ Storage    │ │  │  │ Storage    │ │      │
│  │  │ data/      │ │  │  │ data/      │ │  │  │ data/      │ │      │
│  │  │  node-1/   │ │  │  │  node-2/   │ │  │  │  node-3/   │ │      │
│  │  │   topics/  │ │  │  │   topics/  │ │  │  │   topics/  │ │      │
│  │  │   raft/    │ │  │  │   raft/    │ │  │  │   raft/    │ │      │
│  │  └────────────┘ │  │  └────────────┘ │  │  └────────────┘ │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│          │                    │                    │                │
│          └────────────────────┼────────────────────┘                │
│                               │                                     │
│                    Raft RPCs (AppendEntries,                        │
│                    RequestVote) via TCP                             │
└─────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          │           Client connections (TCP)
          │                    │                    │
┌─────────▼──────────┐  ┌──────▼───────────┐   ┌──────▼───────────┐
│  Producer Client    │ │  Consumer Client   │ │  Admin CLI        │
│  (batching, acks)   │ │  (long-poll,       │ │  (topics, meta)   │
│                     │ │   rebalance)       │ │                   │
└─────────────────────┘ └────────────────────┘ └───────────────────┘
```

---

## 2. Process Model

### 2.1 Broker Node

- **Process:** Independent Python process (`tributary broker start`)
- **Event Loop:** Single asyncio event loop handles:
  - Client TCP connections (produce, fetch, admin)
  - Raft peer-to-peer TCP connections (AppendEntries, RequestVote)
  - Disk I/O via `run_in_executor` (pwrite, fsync)
  - Timers (election timeout, heartbeat interval, batch flush)
- **Storage:** Each node has its own `data/` directory with subdirectories for
  topic partitions and Raft persistent state.

### 2.2 Client Process

- **Producer:** Independent Python process using `TributaryProducer` async client.
  Maintains a connection to the current leader for each partition. Batches messages
  and flushes on size/time threshold.
- **Consumer:** Independent Python process using `TributaryConsumer` async client.
  Joins a consumer group, receives partition assignment, long-polls for messages,
  commits offsets periodically.

---

## 3. Network Architecture

### 3.1 Connection Types

Each broker node maintains two categories of TCP connections:

**Client Connections (port 7001, 7002, 7003):**
- Producer connections: long-lived, multiplexed (pipelined requests)
- Consumer connections: long-lived, long-poll fetches
- Admin connections: short-lived (request-response)

**Raft Peer Connections (same ports, different message types):**
- Leader -> Follower: AppendEntries RPCs (heartbeats + log replication)
- Candidate -> Peers: RequestVote RPCs
- All connections are multiplexed on the same TCP port via message type dispatch

### 3.2 Connection Lifecycle

```
1. Client connects to any broker (bootstrap)
2. Client sends METADATA request
3. Broker responds with cluster metadata (leaders, replicas, ISR)
4. Client connects to the correct partition leader
5. Client sends PRODUCE/FETCH directly to leader
6. If leader changes (failover), client gets ERROR, refreshes metadata, reconnects
```

### 3.3 Backpressure

```
Producer sends batch
        |
        v
+------------------+     +-------------------+
| Connection write |---->| OS TCP send buffer|
| buffer (1MB)     |     | (SO_SNDBUF)       |
+------------------+     +-------------------+
                                 |
                                 v
                        +-------------------+
                        | Broker recv buffer|
                        | (SO_RCVBUF)       |
                        +-------------------+
                                 |
                                 v
                        +-------------------+
                        | asyncio event loop|
                        | processes frame   |
                        +-------------------+
```

If the broker cannot process frames fast enough:
1. OS recv buffer fills up
2. TCP window closes (implicit flow control)
3. Producer OS send buffer fills up
4. `writer.drain()` blocks on the producer side
5. Producer stops sending until broker catches up

This is zero-config flow control at the TCP level. The explicit `max_inflight_bytes`
parameter adds an additional application-level window for finer control.

---

## 4. Data Model

### 4.1 Record

```python
@dataclass(frozen=True)
class Record:
    offset: int          # Partition-relative, monotonic
    timestamp: int       # Unix epoch milliseconds
    key: bytes | None    # Optional partitioning key
    value: bytes         # Message payload
    crc32c: int          # CRC32C of (offset + timestamp + key + value)
```

### 4.2 Topic

```python
@dataclass
class Topic:
    name: str
    partitions: list[Partition]
    replication_factor: int
    config: TopicConfig

@dataclass
class TopicConfig:
    segment_max_bytes: int = 1048576    # 1MB
    retention_hours: int = 168          # 7 days
    index_interval_bytes: int = 4096    # 4KB
    compression: str = "zlib"
```

### 4.3 Partition

```python
@dataclass
class Partition:
    topic: str
    partition_id: int
    leader: str                    # node_id of current leader
    replicas: list[str]            # all node_ids with a copy
    isr: list[str]                 # in-sync replicas
    wal: WALManager                # segment-based storage
    leader_epoch: int              # incremented on leadership change
```

### 4.4 Consumer Group

```python
@dataclass
class ConsumerGroup:
    group_id: str
    members: dict[str, ConsumerMember]   # consumer_id -> member
    generation_id: int                   # incremented on rebalance
    assignments: dict[str, list[TopicPartition]]  # consumer_id -> partitions

@dataclass
class ConsumerMember:
    consumer_id: str
    topics: list[str]
    last_heartbeat: float
    session_timeout_ms: int
```

### 4.5 Raft Persistent State

```python
@dataclass
class RaftPersistentState:
    current_term: int
    voted_for: str | None
    log: list[RaftLogEntry]
    # Serialized to data/raft/state.json
```

### 4.6 Frame

```python
@dataclass(frozen=True)
class Frame:
    magic: bytes           # b"\x74\x72" (0x7472)
    version: int           # 0x01
    msg_type: MsgType
    correlation_id: int
    body: bytes            # Optionally zlib-compressed
    body_crc32c: int       # CRC32C of body (before compression)
```

---

## 5. Sequence Diagram: Produce (Replicated)

```
Producer      Leader Broker              Follower 1         Follower 2
   |               |                         |                  |
   |-- PRODUCE -->|                         |                  |
   |  (batch:     |                         |                  |
   |   500 msgs)  |                         |                  |
   |               |                         |                  |
   |               |-- append to Raft log   |                  |
   |               |  (term=5, index=101)   |                  |
   |               |                         |                  |
   |               |-- APPEND_ENTRIES ------>|                  |
   |               |  (term=5, prev_idx=100,|                  |
   |               |   entries=[101])       |                  |
   |               |                         |-- append to log |
   |               |<-- APPEND_RESP --------|                  |
   |               |  (success, match=101)  |                  |
   |               |                         |                  |
   |               |-- APPEND_ENTRIES ------------------------->|
   |               |  (term=5, prev_idx=100,                    |
   |               |   entries=[101])                            |
   |               |                         |                  |-- append to log
   |               |<-- APPEND_RESP ----------------------------|
   |               |  (success, match=101)                      |
   |               |                                            |
   |               |-- majority acked (2/3) ->                  |
   |               |  commit entry 101                          |
   |               |                                            |
   |               |-- apply to partition WAL                   |
   |               |   (500 records, 1 fsync)                   |
   |               |                                            |
   |<-- ACK ------|                                            |
   |  (offsets:   |                                            |
   |   0-499)     |                                            |
```

---

## 6. Sequence Diagram: Leader Failover

```
                   Follower 1 (new leader)    Follower 2      Leader (dead)
                        |                         |               |
                        |                         |               |
                   [election timeout]             |          [process killed]
                        |                         |               X
                        |                         |               |
                        |-- REQUEST_VOTE ------->|               |
                        |  (term=6, last_idx=101)|               |
                        |                         |               |
                        |<-- VOTE_GRANTED -------|               |
                        |  (term=6)               |               |
                        |                         |               |
                   [majority = 2/3]               |               |
                        |                         |               |
                        |-- become LEADER        |               |
                        |-- send heartbeats ----->|               |
                        |-- send heartbeats ---------------------->| (X, no response)
                        |                         |               |
                        |                         |               |
   Producer             |                         |               |
      |                 |                         |               |
      |-- PRODUCE ---->|                         |               |
      |  (to old leader, port 7001)              |               |
      |                 |                         |               |
      |<-- ERROR ------|                         |               |
      |  (not leader)  |                         |               |
      |                 |                         |               |
      |-- METADATA --->| (any broker)            |               |
      |<-- metadata ---|  (new leader = node-2)  |               |
      |                 |                         |               |
      |-- PRODUCE ---->| (to new leader)         |               |
      |<-- ACK --------|                         |               |
```

---

## 7. Storage Layout

```
data/
  node-1/
    raft/
      state.json                # current_term, voted_for
      log/                      # Raft log segments
        00000000000000000001.log
        00000000000000000001.idx
    topics/
      my-topic/
        partition-0/
          00000000000000000000.log      # WAL segment (append-only)
          00000000000000000000.idx       # Sparse index
          00000000000000102454.log      # Rolled segment
          00000000000000102454.idx
          leader-epoch.chkpt            # Leader epoch checkpoint
        partition-1/
          ...
      __offsets/                        # Internal topic for consumer offsets
        partition-0/
          00000000000000000000.log
          00000000000000000000.idx
      __metadata/                        # Internal topic for topic configs
        partition-0/
          00000000000000000000.log
          00000000000000000000.idx
```

---

## 8. Deployment: 3-Node Local Cluster

### Prerequisites

- Python 3.11+
- Linux, macOS, or WSL2
- No external dependencies

### Setup

```bash
# Install (dev mode, no runtime deps)
pip install -e ".[dev]"

# Create 3 config files
cat > node-1.toml << 'EOF'
[broker]
node_id = "node-1"
host = "127.0.0.1"
port = 7001
data_dir = "./data/node-1"

[cluster]
peers = [
    { id = "node-1", host = "127.0.0.1", port = 7001 },
    { id = "node-2", host = "127.0.0.1", port = 7002 },
    { id = "node-3", host = "127.0.0.1", port = 7003 },
]
EOF

# Repeat for node-2.toml (port 7002) and node-3.toml (port 7003)

# Start 3 broker nodes (in separate terminals)
tributary broker start --config node-1.toml
tributary broker start --config node-2.toml
tributary broker start --config node-3.toml

# Create a topic
tributary topic create orders --partitions 3 --replication-factor 3

# Produce messages
tributary produce orders --key "cust-1" --value '{"order_id": 1}'

# Consume messages
tributary consume orders --group order-processor

# Check cluster state
tributary cluster metadata
tributary cluster nodes
```

---

## 9. Observability

### 9.1 Metrics

The broker exposes metrics via a simple HTTP endpoint (stdlib `http.server`):

```
GET /metrics

# Metrics format (Prometheus-compatible text)
tributary_messages_produced_total{topic="orders",partition="0"} 15423
tributary_messages_consumed_total{topic="orders",partition="0"} 15000
tributary_bytes_produced_total{topic="orders"} 45678901
tributary_partition_lag{topic="orders",partition="0",group="proc-1"} 423
tributary_isr_size{topic="orders",partition="0"} 3
tributary_raft_term 5
tributary_raft_state{node="node-1"} "leader"
tributary_connections_active 42
tributary_uptime_seconds 3600
```

### 9.2 Structured Logging

All log entries include a correlation ID for request tracing:

```json
{"timestamp": "2026-07-16T11:28:00Z", "level": "INFO", "correlation_id": 12345,
 "event": "produce", "topic": "orders", "partition": 0, "offset": 15423,
 "batch_size": 500, "latency_ms": 2.3}
```

### 9.3 CLI Inspection

```bash
# Show all topics with partition leaders and ISR
tributary cluster metadata

# Show all nodes and their Raft role
tributary cluster nodes

# Inspect WAL segments for a partition
tributary wal inspect orders --partition 0

# Verify CRC of all records in a partition
tributary wal verify orders --partition 0
```

---

## 10. Extension Points

| Extension Point | Interface | Example |
|----------------|-----------|---------|
| Storage Engine | `StorageBackend` protocol | Add LMDB or RocksDB backend |
| Assignment Strategy | `AssignmentStrategy` protocol | Range assignment, sticky assignment |
| Compression Algorithm | `Compressor` protocol | Add zstd, lz4 |
| Metrics Exporter | `MetricsExporter` protocol | Prometheus, StatsD |
| Authentication | `AuthHandler` protocol | SASL PLAIN, mTLS |
| Partitioning Strategy | `Partitioner` protocol | Key-based, round-robin, custom |

---

## 11. Failure Injection for Testing

### 11.1 Network Partition Simulation

```python
# In tests, inject latency between specific nodes
class PartitionedTransport:
    """Wraps the real transport and drops/delays messages between
    specified node pairs."""

    def __init__(self, real_transport: Transport, partitioned_pairs: set[tuple[str, str]]):
        self.real = real_transport
        self.blocked = partitioned_pairs

    async def send(self, target: str, frame: Frame) -> None:
        if (self.node_id, target) in self.blocked:
            # Drop the message silently
            return
        await self.real.send(target, frame)
```

### 11.2 Disk Fault Injection

```python
# Monkeypatch os.fsync to simulate slow disk
@pytest.fixture
def slow_disk(monkeypatch):
    original_fsync = os.fsync
    def slow_fsync(fd):
        time.sleep(0.5)  # 500ms delay
        original_fsync(fd)
    monkeypatch.setattr(os, "fsync", slow_fsync)
```

### 11.3 Clock Injection

```python
# Use a virtual clock for deterministic election timing
class VirtualClock:
    def __init__(self):
        self._now = 0.0

    def advance(self, seconds: float) -> None:
        self._now += seconds

    def time(self) -> float:
        return self._now
```

Using a virtual clock in tests makes election timeouts deterministic — advance the
clock by exactly 300ms to trigger an election, rather than sleeping and hoping the
scheduler fires at the right time.
