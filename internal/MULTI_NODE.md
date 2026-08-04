# Multi-Node Tributary Workflow

## Architecture

3 Tributary broker nodes (`node-1`, `node-2`, `node-3`) run in Docker containers on an overlay network. Each publishes its broker port (`7001` internal) to a unique host port (`7001`, `7002`, `7003`).

```
Client ──127.0.0.1:7001──► node-1 (broker port 7001)
Client ──127.0.0.1:7002──► node-2 (broker port 7001)
Client ──127.0.0.1:7003──► node-3 (broker port 7001)

Inter-node (Docker DNS):
  node-1 ──node-2:7001──► node-2
  node-1 ──node-3:7001──► node-3
  node-2 ──node-1:7001──► node-1
  node-2 ──node-3:7001──► node-3
  node-3 ──node-1:7001──► node-1
  node-3 ──node-2:7001──► node-2
```

Each node runs two TCP servers:
- **TributaryServer** (port 7001) — accepts client connections AND peer Raft connections
- **RaftTransport** — outgoing TCP connections to each peer (for sending Raft messages)

## Startup Sequence

```
Time
│
├─ t=0s    Containers start simultaneously
│          entrypoint.sh reads env vars, builds CLI flags
│          tributary broker start runs on each node
│
├─ t=0.1s  RaftTransport created with peer list
│          connect_all() → tries 10× (0.5s apart) to connect to peers
│          └─ fails (peers' servers not listening yet)
│          Starts reconnect loop (tries every 1s)
│
├─ t=3s    startup_grace=3.0 expires
│          Election timer armed (150-300ms random)
│          TributaryServer created and started (listening on 7001)
│
├─ t=3.2s  First election fires
│          └─ If reconnected: sends RAFT_VOTE_REQ → receives votes → leader elected
│          └─ If not reconnected: no votes, step down, retry in 150-300ms
│
├─ t=4s    Reconnect loop fires (servers listening for 1s now → connects succeed)
│
├─ t=4.2s  Second election fires with connections
│          └─ One node wins (first whose timer fires, gets majority)
│          └─ Winner becomes leader, starts heartbeat loop (every 50ms)
│          └─ Losers become followers, reset election timers
│
├─ t=4.3s  Leader established → cluster stable
│          Leader sends AppendEntries (heartbeats) every 50ms
│          Followers reset election timers on each heartbeat
└─
```

## Inter-Node Communication

### Two TCP connections per peer pair

Each pair of nodes has TWO TCP connections (one in each direction):

```
node-1 TributaryServer ◄──TCP socket──► node-2 RaftTransport (outgoing to node-1)
node-2 TributaryServer ◄──TCP socket──► node-1 RaftTransport (outgoing to node-2)
```

### Raft Message Flow (outgoing)

When node-1 (leader) sends AppendEntries to node-2:

```
1. node-1 RaftTransport.send("node-2", APPEND_REQ)
   → conn.write_frame(APPEND_REQ)         writes to node-1→node-2 TCP socket
   → conn.read_frame()                     blocks, waiting for response

2. node-2 TributaryServer._on_connect loop
   → conn.read_frame()                     reads APPEND_REQ from node-1→node-2 socket
   → handler.handle(frame, conn)
     → raft_node.handle_frame(APPEND_REQ)
       → _handle_append_request()
         → resets election timer
         → returns APPEND_RESP
   → conn.write_frame(APPEND_RESP)         writes to same TCP socket

3. node-1 conn.read_frame() returns APPEND_RESP
   send() returns the response
```

### Raft Message Flow (incoming via server)

When node-3 receives a RAFT_VOTE_REQ from node-2 (via node-3's TributaryServer):

```
node-3 TributaryServer._on_connect loop
  → conn.read_frame() → RAFT_VOTE_REQ
  → handler.handle(frame)
    → raft_node.handle_frame(RAFT_VOTE_REQ)
      → _handle_vote_request()
        → grants/denies vote based on term & log state
        → returns RAFT_VOTE_RESP
  → conn.write_frame(RAFT_VOTE_RESP)      response goes back to node-2
```

## Raft State Machine

### Node Roles
- **FOLLOWER** — default role, receives heartbeats, resets election timer
- **CANDIDATE** — election timer expired, starts election, votes for self
- **LEADER** — elected, sends heartbeats, handles client produce/consume

### Election
```
FOLLOWER → (timer expires) → CANDIDATE
  → current_term++
  → vote for self
  → send RAFT_VOTE_REQ to all peers (sequentially)
  → collect responses
  → if votes >= majority (⌊n/2⌋+1) → LEADER
  → else → FOLLOWER, reset timer
```

### Log Replication (Heartbeat)
```
LEADER → every 50ms:
  for each peer:
    send RAFT_APPEND_REQ(term, prev_log_index, prev_log_term, entries[], leader_commit)
    on response:
      if higher term → step down
      if success → advance match_index/next_index for that peer
      if failure → decrement next_index, retry
```

### Heartbeat Condition
The leader sends **empty** AppendEntries (entries=[]) as heartbeats even when there are no new log entries. This resets followers' election timers, preventing new elections.

## Client Interaction

### Topic Creation
```
Client ──CREATE_TOPIC──► Leader
  Leader proposes raft entry "TOPIC_CREATE:my-topic"
  Raft replicates to followers
  Entry committed & applied on all nodes
  Leader returns success
```

### Produce
```
Client ──PRODUCE──► Any Node
  ├─ Node has partition locally → handle locally
  ├─ Node doesn't have partition:
  │   ├─ Known Raft leader ≠ this node → NOT_LEADER(leader_host:leader_port)
  │   │   Client auto-redirects to leader
  │   ├─ Known Raft leader = this node → "partition not found" (code 4)
  │   └─ No known leader → "no leader available" (code 5)
  └─ Node is partition leader → accept produce
```

### Consume
```
Client ──FETCH──► Any Node
  Same redirect logic as produce
  If partition leader: fetch records from local WAL
```

### Auto-Redirect (Client-side)
When a client receives NOT_LEADER:
1. Extract leader_id, leader_host, leader_port
2. Close current connection
3. Open new connection to leader_host:leader_port
4. Retry the request
5. If NOT_LEADER again → loop (max 5 retries)
6. If "no leader available" → sleep 1s, retry

## Failover

### Leader Failure
```
Stable cluster (3 nodes, leader=node-1)
  │
  ├─ node-1 dies
  │
  ├─ node-2, node-3 stop receiving heartbeats (from node-1)
  │
  ├─ t+150-300ms: node-2's election timer fires
  │   └─ becomes CANDIDATE, sends RAFT_VOTE_REQ to node-3
  │
  ├─ node-3 receives vote request
  │   └─ votes for node-2 (higher term, log up-to-date)
  │
  ├─ node-2 receives vote → 2 votes (self + node-3) ≥ majority (2)
  │   └─ becomes LEADER
  │
  └─ t+~500ms: new leader established
      └─ Clients can now produce/consume via node-2 or node-3
```

### After Failover
- With 2 nodes remaining, majority still = 2 (⌊2/2⌋+1 = 2)
- Both votes required for any decision
- New leader handles client requests + Raft replication to sole follower
- If follower also dies → leader continues alone, but cannot commit new entries

## Configuration (docker-compose.yml)

| Environment Variable | Purpose |
|---|---|
| `NODE_ID` | Unique identifier (node-1, node-2, node-3) |
| `HOST=0.0.0.0` | Listen on all interfaces (needed for inter-container) |
| `PORT=7001` | Internal broker port |
| `PEERS` | Comma-separated `id:host:port` for Raft (Docker DNS names) |
| `ADVERTISED_HOST=127.0.0.1` | Client-reachable host (for redirects) |
| `ADVERTISED_PORT` | Client-reachable port (maps to published host port) |
| `ADVERTISED_PEERS` | Client-reachable addresses for all peers |
| `SECURITY_MODE=development` | Plaintext mode (no TLS) |

## Key Files

| File | Purpose |
|---|---|
| `src/tributary/consensus/raft.py` | Raft state machine: elections, log replication, heartbeats |
| `src/tributary/consensus/transport.py` | Raft peer connections: connect, reconnect, send, broadcast |
| `src/tributary/transport/server.py` | TCP server: accept connections, dispatch to handler |
| `src/tributary/transport/connection.py` | Framed TCP connection: read_frame, write_frame |
| `src/tributary/broker/handler.py` | Request dispatch: produce, fetch, create/delete topic |
| `src/tributary/broker/replication.py` | Partition leadership, advertised addresses, state machine |
| `src/tributary/broker/manager.py` | Topic/partition management |
| `src/tributary/cli/main.py` | CLI entrypoint, server setup, client auto-redirect |
| `entrypoint.sh` | Docker entrypoint: env → CLI flags |
| `deploy/docker-compose.yml` | 3-node Docker Compose definition |

## Debug Commands

```bash
# Check which node is the stable leader
docker compose -f deploy/docker-compose.yml logs --tail=20 | grep "became leader" | sort | uniq -c

# Watch Raft transport connections
docker compose -f deploy/docker-compose.yml logs --tail=50 | grep "reconnect\|transport\|raft_transport"

# Check full startup logs of one node
docker compose -f deploy/docker-compose.yml logs node-2 | head -60

# Test inter-container TCP (from inside container)
docker compose -f deploy/docker-compose.yml exec node-2 python -c "import socket; s=socket.create_connection(('node-1',7001), timeout=3); print('OK'); s.close()"

# Check env vars reach the container
docker compose -f deploy/docker-compose.yml exec node-1 env | grep ADVERTISED

# Clean rebuild
docker compose -f deploy/docker-compose.yml down -v
docker compose -f deploy/docker-compose.yml build
docker compose -f deploy/docker-compose.yml up -d
```
