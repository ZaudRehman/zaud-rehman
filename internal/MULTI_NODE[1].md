# Tributary: Pure-Python Distributed Message Broker

A lightweight, Raft-consensus-based distributed message broker with zero external runtime dependencies.

---

## 1. System Components

### 1.1 Broker Core

| Component | Location | Purpose |
|---|---|---|
| `TributaryServer` | `transport/server.py` | Async TCP listener, accepts client & peer connections, TLS, connection limits |
| `Connection` | `transport/connection.py` | Framed TCP connection — reads/writes length-delimited protocol frames |
| `RequestHandler` | `broker/handler.py` | Frame dispatcher — routes messages to produce, fetch, topic create/delete, Raft handlers |
| `TopicManager` | `broker/manager.py` | In-memory topic & partition registry, metadata queries |
| `Partition` | `broker/partition.py` | Single partition — backed by WAL (write-ahead log) for persistence |
| `ReplicationManager` | `broker/replication.py` | Bridges Raft state machine to partition leadership, advertised address resolution |

### 1.2 Raft Consensus

| Component | Location | Purpose |
|---|---|---|
| `RaftNode` | `consensus/raft.py` | Raft state machine — elections, log replication, heartbeats, term management |
| `RaftTransport` | `consensus/transport.py` | Outgoing peer TCP connections — connect, reconnect, send, broadcast |
| `PersistentState` | `consensus/raft.py` | Raft durable state: current_term, voted_for, log |
| `VolatileState` | `consensus/raft.py` | Raft volatile state: commit_index, last_applied |
| `LeaderState` | `consensus/raft.py` | Leader-only state: next_index, match_index per peer |

### 1.3 Protocol

| Component | Location | Purpose |
|---|---|---|
| `Frame` | `protocol/frames.py` | Wire format — 17-byte header (magic, version, msg_type, correlation_id, body_length, checksum) + body |
| `MsgType` | `protocol/messages.py` | All message type enums (PRODUCE, FETCH, RAFT_VOTE_REQ, etc.) |
| Message types | `protocol/messages.py` | Typed request/response dataclasses for every operation |

### 1.4 CLI & Client

| Component | Location | Purpose |
|---|---|---|
| `cli` | `cli/main.py` | Click-based CLI: `broker start`, `topic create`, `produce`, `consume`, `admin`, `cluster`, `dlq`, `schema`, `wal` |
| `Producer` | `client/producer.py` | Client-side produce with batching, retry, redirect-following |
| `Consumer` | `client/consumer.py` | Client-side consume with consumer groups, offset tracking, redirect-following |
| `_request_with_redirect` | `cli/main.py` | Auto-follow NOT_LEADER redirects (up to 5 hops), retry on "no leader" with 1s backoff |

### 1.5 Storage

| Component | Location | Purpose |
|---|---|---|
| `WAL` | `storage/wal.py` | Write-ahead log — sequential append, fsync, replay on restart |
| `Segment` | `storage/segment.py` | WAL segment file — fixed-size rolling files |
| `SnapshotManager` | `consensus/snapshot.py` | Raft snapshot — compacts the log, stored as files |

### 1.6 Security

| Component | Location | Purpose |
|---|---|---|
| `SecurityConfig` | `security/config.py` | TLS, auth mode, ACL configuration |
| `AuthResult` | `security/auth.py` | Authentication — SASL plain, mTLS, principal extraction |
| `CertManager` | `security/cert.py` | TLS certificate loading & hot-reload (polls every 5s) |
| ACL | `security/acl.py` | Access control lists per topic/operation |

### 1.7 Operations

| Component | Location | Purpose |
|---|---|---|
| `ConsumerGroupCoordinator` | `broker/coordinator.py` | Consumer group management, offset commit/fetch |
| `OffsetManager` | `broker/offset.py` | Offset storage (WAL-backed per group/partition) |
| `BackpressureController` | `transport/backpressure.py` | Per-connection backpressure (max inflight bytes, pause/resume reads) |
| `DiskWatermark` | `safety/disk_watermark.py` | Read-only mode when disk usage exceeds threshold |
| `MetricsRegistry` | `utils/metrics.py` | Prometheus-style metrics (counters, gauges, histograms) |
| `MetricsServer` | `utils/metrics.py` | HTTP endpoint `/metrics` and `/health` |
| DLQ Manager | `broker/dlq.py` | Dead-letter queue — stores failed messages |

---

## 2. How Each Component Works

### 2.1 TributaryServer (`server.py`)

```
Start → asyncio.start_server(accept, host, port, ssl)
         │
         ▼
accept_connection(reader, writer):
  1. Check connection limit (max 1000)
  2. Create Connection(reader, writer, backpressure)
  3. Add to active_connections set
  4. Call _on_connect callback (blocking — connection held open)
  5. On return/exception → remove from set, close connection
```

- Each accepted connection blocks in `_on_connect` until the client disconnects.
- One coroutine per connection (asyncio handles thousands).
- TCP keepalive enabled on listening sockets.

### 2.2 Connection (`connection.py`)

Frame wire format (17-byte header):

```
┌────────┬─────────┬──────────┬────────────────┬──────────────┬──────────┐
│ magic  │ version │ msg_type │ correlation_id │ body_length  │ checksum │
│  2B    │   1B    │   2B     │      4B        │     4B       │    4B    │
└────────┴─────────┴──────────┴────────────────┴──────────────┴──────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│  Body (body_length bytes, may be 0)                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

- `read_frame()` reads exactly HEADER_SIZE (17) bytes, then body_length more bytes.
- Returns `None` on EOF or decode failure.
- `write_frame()` encodes frame, writes with backpressure wait, drains.
- `close()` — sets `_closed=True`, closes writer.

### 2.3 RequestHandler (`handler.py`)

```
handle(frame, conn):
  │
  ├─ Frame is RAFT type → raft_node.handle_frame(frame) → return response
  ├─ Frame is PRODUCE   → _handle_produce(frame, conn)
  ├─ Frame is FETCH     → _handle_fetch(frame, conn)
  ├─ Frame is CREATE_TOPIC → _handle_create_topic(frame)
  ├─ Frame is DELETE_TOPIC → _handle_delete_topic(frame)
  ├─ Frame is OFFSET_COMMIT/FETCH → coordinator methods
  └─ Frame is METADATA  → return cluster metadata
```

**Produce flow:**
1. Look up partition in TopicManager
2. If not found locally AND Raft is active:
   - If known Raft leader ≠ this node → **NOT_LEADER** with leader's advertised host:port
   - If known Raft leader = this node → **partition not found** (truly doesn't exist)
   - If no known leader → **no leader available**
3. If partition found locally AND replication is active:
   - Check partition leader via ReplicationManager
   - If not partition leader → NOT_LEADER with advertised info
4. If partition leader → check quota, write to WAL, replicate via Raft, respond

**Topic Create flow:**
1. Check if this node is the Raft leader
2. If not → redirect via get_not_leader()
3. If yes → propose Raft entry `TOPIC_CREATE:<name>`
   - Entry replicated to followers via Raft log
   - On commit → all nodes apply to state machine (create topic locally)
4. Respond success

### 2.4 RaftNode (`consensus/raft.py`)

Three roles:

```
FOLLOWER ──(election timer expires)──► CANDIDATE
CANDIDATE ──(wins election)──────────► LEADER
LEADER   ──(higher term discovered)──► FOLLOWER (step down)
CANDIDATE ──(loses election)─────────► FOLLOWER
```

**Election sequence:**
1. Increment `current_term`
2. Vote for self (`voted_for = node_id`)
3. Send `RAFT_VOTE_REQ` to each peer sequentially via `RaftTransport.send()`
4. For each response: if vote_granted, add to `_vote_responses`
5. If `votes >= majority (⌊peers+1⌋/2 + 1)` → become leader
6. Otherwise → step down, reset election timer

**Leader responsibilities:**
- Heartbeat loop: every 50ms, send AppendEntries to all peers
- Handle client produces: propose entries to log, replicate, commit
- On step-down: cancel heartbeat task, reset election timer, clear leader state

**Heartbeat (AppendEntries):**
- `_replicate_to_peer(peer_id)` sends RAFT_APPEND_REQ
- Entries is `log[next_idx - snapshot_last_index - 1:]` — may be empty list (heartbeat)
- Empty entries still reset follower's election timer
- On rejection (term mismatch): decrement `next_index`, retry
- On higher term in response: step down immediately

### 2.5 RaftTransport (`consensus/transport.py`)

**Connection lifecycle:**
```
Start → connect_all()
  │
  ├── for each peer: _connect_one(peer_id, info)
  │     └── retries 10× with 0.5s delay
  │
  └── _reconnect_loop (asyncio task, runs every 1s)
        └── for each peer not in _connections:
              try: asyncio.open_connection(host, port, ssl)
              except: pass (retry next cycle)
```

**send(peer_id, frame):**
1. Look up connection for peer_id
2. `conn.write_frame(frame)` — encode & send
3. `conn.read_frame()` — wait for response
4. If response is None (EOF) → remove connection → return None
5. On OSError/ConnectionError → remove connection → return None

**broadcast(frame):**
- Calls `send(peer_id, frame)` sequentially for each connected peer
- Returns dict of {peer_id: response_or_None}

### 2.6 WAL (Write-Ahead Log)

```
produce(key, value):
  entry = WalEntry(offset, key_len, key, value_len, value, timestamp, crc32)
  segment.write(entry)
  fsync()
  return offset
```

- Segments roll over at `SEGMENT_SIZE` (default ~512MB)
- Replay on startup: scan all segments, rebuild offset map
- Each message has CRC32 for integrity verification

### 2.7 ReplicationManager (`replication.py`)

Bridges Raft to partition ownership:

- `get_partition_leader(topic, partition)` — returns node ID that owns the partition
  - If this node is Raft leader → returns `self._node_id`
  - Otherwise → returns Raft leader's ID
- `get_not_leader(topic, partition)` — builds NOT_LEADER frame with advertised host:port
- `get_leader_info()` — returns dict of all node IDs → (advertised_host, advertised_port)
- `set_peer_info(peers)` — sets internal cluster topology
- `set_advertised_peer_info(peers)` — sets client-reachable addresses for redirects

### 2.8 CLI Client (`main.py`)

**`_request_with_redirect(conn_func, topic, ...)`:**
1. Create TCP connection to broker
2. Send request frame
3. Read response
4. If NOT_LEADER → close connection, reconnect to leader's advertised address, retry (max 5×)
5. If code 5 ("no leader available") → sleep 1s, reconnect, retry
6. Return final response

**Produce client (`produce` command):**
1. Parse args (topic, key, value, broker, acks, batch)
2. `_request_with_redirect` sends PRODUCE frame
3. On success: print partition & offset
4. Batch mode: collect messages, flush on batch_size or batch_timeout

**Consume client (`consume` command):**
1. Parse args (topic, group, partition, offset, broker, count, follow)
2. `_request_with_redirect` sends FETCH frame
3. On success: print records
4. If `--follow`: long-poll, keep fetching until interrupted

---

## 3. Wire Protocol (Frame)

Every message on the wire is a `Frame`:

```python
HEADER_STRUCT = struct.Struct("!HBHIIi")  # 17 bytes
# magic:2B, version:1B, msg_type:2B, correlation_id:4B, body_length:4B, checksum:4B
```

Message types flow like:

| Direction | Request | Response |
|---|---|---|
| Client → Broker | `PRODUCE` | `PRODUCE_RESP` |
| Client → Broker | `FETCH` | `FETCH_RESP` |
| Client → Broker | `CREATE_TOPIC` | `CREATE_TOPIC_RESP` |
| Client → Broker | `DELETE_TOPIC` | `DELETE_TOPIC_RESP` |
| Client → Broker | `METADATA` | `METADATA_RESP` |
| Client → Broker | `OFFSET_COMMIT` / `OFFSET_FETCH` | `OFFSET_COMMIT_RESP` / `OFFSET_FETCH_RESP` |
| Broker → Client | `NOT_LEADER` | (redirect instruction) |
| Peer → Peer | `RAFT_VOTE_REQ` | `RAFT_VOTE_RESP` |
| Peer → Peer | `RAFT_APPEND_REQ` | `RAFT_APPEND_RESP` |
| Peer → Peer | `RAFT_SNAPSHOT_REQ` | `RAFT_SNAPSHOT_RESP` |

Error codes in response:
- `4` — partition not found
- `5` — no leader available
- `7` — read-only (disk full)
- `8` — quota exceeded
- `99` — internal error

---

## 4. Multi-Node Docker Setup

### docker-compose.yml
```yaml
services:
  node-1:
    ports: ["7001:7001", "9101:9100"]
    environment:
      NODE_ID: node-1
      HOST: "0.0.0.0"
      PORT: "7001"
      PEERS: "node-2:node-2:7001,node-3:node-3:7001"
      ADVERTISED_HOST: "127.0.0.1"
      ADVERTISED_PORT: "7001"
      ADVERTISED_PEERS: "node-2:127.0.0.1:7002,node-3:127.0.0.1:7003"
```

### entrypoint.sh
Reads env vars, builds CLI flags:
```
PEERS → --peer node-2:node-2:7001 --peer node-3:node-3:7001
ADVERTISED_HOST → --advertised-host 127.0.0.1
ADVERTISED_PEERS → --advertised-peer node-2:127.0.0.1:7002 ...
```

### Startup synchronization
- All 3 containers start simultaneously
- `connect_all()` retries 10× (5s total) — usually fails because peers' servers aren't up
- `startup_grace=3.0` seconds in `raft_node.start()` delays first election
- Reconnect loop runs every 1s, eventually establishes all peer connections
- First election with connections → stable leader emerges

---

## 5. All CLI Commands

```bash
# Start a broker node
tributary broker start --node-id node-1 --host 0.0.0.0 --port 7001 \
  --data-dir /var/lib/tributary \
  --peer node-2:node-2:7001 --peer node-3:node-3:7001 \
  --advertised-host 127.0.0.1 --advertised-port 7001 \
  --advertised-peer node-2:127.0.0.1:7002 --advertised-peer node-3:127.0.0.1:7003

# Manage topics
tributary topic create my-topic --partitions 3 --replication-factor 1 --broker 127.0.0.1:7001
tributary topic delete my-topic --broker 127.0.0.1:7001

# Produce messages
tributary produce my-topic --key k1 --value "hello" --broker 127.0.0.1:7001
tributary produce my-topic --batch-size 100 --batch-timeout 1000 --broker 127.0.0.1:7001

# Consume messages
tributary consume my-topic --group my-group --broker 127.0.0.1:7001
tributary consume my-topic --partition 0 --offset 0 --count 10 --broker 127.0.0.1:7001
tributary consume my-topic --follow --broker 127.0.0.1:7001

# Cluster info
tributary cluster metadata --broker 127.0.0.1:7001

# Admin
tributary admin backup --output /tmp/backup --broker 127.0.0.1:7001
tributary admin restore --input /tmp/backup --broker 127.0.0.1:7001

# Dead letter queue
tributary dlq list --topic my-topic --broker 127.0.0.1:7001
tributary dlq replay --topic my-topic --broker 127.0.0.1:7001

# Schema registry
tributary schema register my-topic --schema '{"type":"record"}' --broker 127.0.0.1:7001

# WAL inspection
tributary wal tail --path /var/lib/tributary/data/my-topic-0 --lines 10
tributary wal verify --path /var/lib/tributary/data/my-topic-0
```

Docker wrapper (all of the above via the container):
```bash
docker compose -f deploy/docker-compose.yml exec node-1 tributary topic list
```

---

## 6. File Layout

```
src/tributary/
├── broker/
│   ├── handler.py          # Request dispatch (produce, fetch, create, delete)
│   ├── manager.py          # Topic & partition management
│   ├── partition.py        # Single partition (WAL-backed)
│   ├── replication.py      # Raft state machine bridge + advertised addresses
│   ├── coordinator.py      # Consumer group coordinator
│   ├── offset.py           # Offset storage
│   └── dlq.py              # Dead-letter queue
├── client/
│   ├── producer.py         # Client produce with batching
│   └── consumer.py         # Client consume with groups
├── cli/
│   └── main.py             # Click CLI (all commands)
├── consensus/
│   ├── raft.py             # Raft state machine
│   ├── transport.py        # Raft peer connections
│   └── snapshot.py         # Raft snapshot manager
├── protocol/
│   ├── frames.py           # Wire format (encode/decode)
│   └── messages.py         # Message types & dataclasses
├── transport/
│   ├── server.py           # TCP server
│   ├── connection.py       # Framed TCP connection
│   └── backpressure.py     # Per-connection flow control
├── storage/
│   ├── wal.py              # Write-ahead log
│   └── segment.py          # WAL segment files
├── security/
│   ├── config.py           # TLS & auth config
│   ├── auth.py             # Authentication
│   ├── cert.py             # TLS certificates
│   └── acl.py              # Access control
└── utils/
    └── metrics.py          # Prometheus metrics + HTTP endpoint
```

---

## 7. Multi-Node Testing Commands

```bash
# Build & start
docker compose -f deploy/docker-compose.yml build
docker compose -f deploy/docker-compose.yml up -d
sleep 12

# Verify stable leader (should show 1 node)
docker compose logs --tail=20 | grep "became leader" | sort | uniq -c

# Check Raft transport connections
docker compose logs --tail=50 | grep -i "reconnect\|connected\|raft"

# Full workflow
tributary topic create my-topic --broker 127.0.0.1:7001
tributary produce my-topic --key k1 --value v1 --broker 127.0.0.1:7001
tributary consume my-topic --broker 127.0.0.1:7001

# Redirect test (hit non-leader)
tributary produce my-topic --key k2 --value v2 --broker 127.0.0.1:7002
tributary consume my-topic --broker 127.0.0.1:7002

# Failover test
docker compose stop node-1
sleep 8
tributary produce my-topic --key k3 --value v3 --broker 127.0.0.1:7002
tributary consume my-topic --broker 127.0.0.1:7002

# Clean up
docker compose down -v
```

---

## 8. Summary of Fixed Bugs

| Bug | File | Line | Symptom | Fix |
|---|---|---|---|---|
| Heartbeats never sent on empty log | `consensus/raft.py` | 414 | Endless re-elections, no stable leader | Changed `>=` to `>` so empty AppendEntries are sent |
| Zombie connections not cleaned | `consensus/transport.py` | 99 | Stale connections block reconnection | Remove connection when `read_frame()` returns None (EOF) |
| Empty host/port in NOT_LEADER | `broker/handler.py` | 247, 352 | Client couldn't follow redirect | Use `get_leader_info()` for advertised address |
| Step-down didn't clear leader_id | `consensus/raft.py` | 648 | Stale leader_id caused redirect loops | Added `self._leader_id = None` |
| Create/delete topic leader check bug | `broker/handler.py` | 388, 427 | Wrong role check for topic ops | Use `get_partition_leader()` + `leader_id != node_id` |
