# Product Requirements Document (PRD)

## Tributary — Distributed Persistent Message Broker

**Version:** 0.1.0-draft  
**Date:** 2026-07-16  
**Status:** Draft for Review  
**Author:** Principal Python Systems Engineer  

---

## 1. Problem Statement

Every senior backend engineering role evaluates candidates on distributed systems
fundamentals: consensus, replication, partitioning, durability, and backpressure.
Most candidates can *describe* these concepts. Very few have *implemented* them.

Existing Python distributed-systems projects are almost exclusively key-value stores
with Raft consensus bolted on. They demonstrate
consensus but not the full backend stack — no binary protocol, no segmented storage
engine, no consumer groups, no backpressure, no crash recovery.

**There is no from-scratch, pure-Python, zero-dependency message broker that
demonstrates the complete backend engineering stack in a single codebase.** Tributary
fills that gap.

---

## 2. Product Vision

> A from-scratch distributed message broker built in pure Python with asyncio —
> binary protocol, segment-based WAL storage, Raft consensus, partitioned topics,
> consumer groups, and backpressure — using zero external dependencies for the core
> runtime.

Tributary is not a wrapper around Redis, RabbitMQ, or Kafka. It is a ground-up
implementation of the same architectural patterns, designed to prove deep backend
engineering competence.

---

## 3. Goals & Non-Goals

### Goals

1. Implement a complete message broker: produce, fetch, topics, partitions,
   consumer groups, offset management.
2. Custom binary wire protocol with framing, compression, and versioning.
3. Segment-based write-ahead log storage with sparse indexes and crash recovery.
4. Raft consensus for cluster coordination, leader election, and log replication.
5. Partition replication across broker nodes with leader/follower semantics.
6. Consumer groups with partition assignment, rebalancing, and offset commits.
7. Backpressure and flow control for producers and consumers.
8. Zero external dependencies for the core runtime (Python stdlib only).
9. Runnable 3-node cluster on a single laptop via localhost ports.
10. Comprehensive test suite with property-based tests and failure injection.

### Non-Goals

1. Tributary is not intended for production deployment at scale. It is a
   portfolio-grade reference implementation.
2. Tributary does not implement Kafka wire protocol compatibility. The protocol is
   custom but architecturally similar.
3. Tributary does not support ACLs, authentication, or TLS in v0.1. These are
   v0.2 features.
4. Tributary does not support cross-datacenter replication or geo-distribution.
5. Tributary does not implement transactions or exactly-once delivery in v0.1.
   At-least-once with idempotent producer is the v0.1 target.

---

## 4. Stakeholders & Users

| Stakeholder | Interest |
|-------------|----------|
| Backend engineer (builder) | Deep learning of distributed systems through implementation |
| Hiring manager | Evidence of systems-level engineering competence |
| Open-source community | Reference implementation for learning broker internals |
| ML/AI engineer | Local message broker for agent pipelines without cloud cost |

---

## 5. Functional Requirements

### 5.1 Broker Core

| ID | Requirement | Priority |
|----|-------------|----------|
| B-01 | Broker accepts TCP connections via asyncio event loop | P0 |
| B-02 | Broker parses binary protocol frames and dispatches by message type | P0 |
| B-03 | Broker manages topic lifecycle: create, delete, list | P0 |
| B-04 | Each topic has N partitions (configurable at creation) | P0 |
| B-05 | Broker routes produce requests to the correct partition leader | P0 |
| B-06 | Broker returns metadata (leaders, replicas, ISR) to clients | P0 |
| B-07 | Broker handles graceful shutdown: flush WAL, close connections | P0 |
| B-08 | Broker recovers WAL state on restart (replay + CRC verification) | P0 |

### 5.2 Storage Engine

| ID | Requirement | Priority |
|----|-------------|----------|
| S-01 | Each partition is a directory of rolling segment files | P0 |
| S-02 | Active segment is append-only; rolls at configurable size (default 1MB) | P0 |
| S-03 | Each WAL record: offset, timestamp, key, value, CRC32C | P0 |
| S-04 | Sparse index file maps every Nth offset to byte position in segment | P0 |
| S-05 | Index supports binary search for offset-to-position lookup | P0 |
| S-06 | Segment files use mmap for zero-copy reads | P0 |
| S-07 | Retention: time-based and size-based deletion of old segments | P1 |
| S-08 | Crash recovery: detect and truncate corrupt WAL tail on startup | P0 |
| S-09 | Log compaction: retain latest value per key (optional per-topic) | P2 |

### 5.3 Binary Protocol

| ID | Requirement | Priority |
|----|-------------|----------|
| P-01 | Custom binary frame format with magic bytes, version, type, correlation ID | P0 |
| P-02 | Frame includes body length prefix for length-prefixed framing | P0 |
| P-03 | Message types: PRODUCE, FETCH, CREATE_TOPIC, LIST_TOPICS, DELETE_TOPIC | P0 |
| P-04 | Message types: COMMIT_OFFSET, FETCH_OFFSET, JOIN_GROUP, HEARTBEAT | P0 |
| P-05 | Message types: METADATA, RAFT_VOTE, RAFT_APPEND, RAFT_SNAPSHOT | P0 |
| P-06 | Body supports optional zlib compression (negotiated per connection) | P1 |
| P-07 | Protocol versioning for backward compatibility | P1 |
| P-08 | CRC32C checksum on every frame for corruption detection | P0 |

### 5.4 Raft Consensus

| ID | Requirement | Priority |
|----|-------------|----------|
| R-01 | Leader election with randomized election timeouts (150-300ms) | P0 |
| R-02 | Log replication via AppendEntries RPCs (asyncio tasks) | P0 |
| R-03 | Persistent state on disk: current_term, voted_for, log entries | P0 |
| R-04 | Volatile state: commit_index, last_applied | P0 |
| R-05 | Snapshotting when Raft log exceeds threshold; log truncation | P1 |
| R-06 | Cluster membership changes: add/remove nodes at runtime | P2 |
| R-07 | Leader election handles network partition and split-brain | P0 |
| R-08 | Log consistency check on AppendEntries (prevLogIndex, prevLogTerm) | P0 |

### 5.5 Partition Replication

| ID | Requirement | Priority |
|----|-------------|----------|
| PR-01 | Each partition has one leader and N followers (replication factor) | P0 |
| PR-02 | Producers write to partition leader; leader replicates to followers | P0 |
| PR-03 | Producer acks: 0 (fire-and-forget), 1 (leader ack), all (ISR ack) | P0 |
| PR-04 | In-Sync Replica (ISR) set tracked by leader | P0 |
| PR-05 | Follower fetches missing log entries from leader (catch-up) | P0 |
| PR-06 | Leader failover: ISR elects new leader when current leader fails | P0 |

### 5.6 Consumer Groups

| ID | Requirement | Priority |
|----|-------------|----------|
| CG-01 | Consumers join a group with a group ID | P0 |
| CG-02 | Partitions assigned to consumers via consistent hashing | P0 |
| CG-03 | Consumer offsets stored in internal __offsets topic | P0 |
| CG-04 | Offset commit: at-least-once semantics | P0 |
| CG-05 | Rebalancing on consumer join/leave with generation counter | P0 |
| CG-06 | Long-polling fetch: consumer waits up to N ms for new messages | P0 |
| CG-07 | Consumer can reset offset to earliest, latest, or specific position | P1 |

### 5.7 Backpressure & Flow Control

| ID | Requirement | Priority |
|----|-------------|----------|
| F-01 | Broker limits in-flight bytes per connection (sliding window) | P0 |
| F-02 | Producer client batches messages and flushes on size or time threshold | P0 |
| F-03 | Broker rejects produce when partition WAL exceeds high-water mark | P1 |
| F-04 | Consumer fetch respects max_bytes limit per response | P0 |
| F-05 | Broker applies TCP_NODELAY and SO_SNDBUF/SO_RCVBUF tuning | P1 |

### 5.8 CLI & Observability

| ID | Requirement | Priority |
|----|-------------|----------|
| C-01 | CLI to start a broker node with config file | P0 |
| C-02 | CLI to create/list/delete topics | P0 |
| C-03 | CLI to produce messages from stdin or file | P0 |
| C-04 | CLI to consume messages (tail mode) | P0 |
| C-05 | CLI to query cluster metadata (leaders, ISR, offsets) | P0 |
| C-06 | CLI to inspect WAL segments and indexes | P1 |
| C-07 | Metrics endpoint: messages/sec, bytes/sec, partition lag, ISR size | P1 |
| C-08 | Structured logging with correlation IDs for request tracing | P0 |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Cost** | ₹0. Pure Python stdlib for core runtime. pytest + hypothesis for testing. No paid services. |
| **Latency** | Single produce: <1ms. Single fetch: <1ms. Batch produce (1K msgs): <10ms. |
| **Throughput** | 50,000+ messages/sec sustained on localhost (batched, small messages). |
| **Durability** | Messages survive broker restart (WAL on disk). Replicated messages survive single-node failure. |
| **Availability** | Cluster remains available during single-node failure (Raft re-election <2s). |
| **Scalability** | Single machine, 3-5 node cluster on localhost. Horizontal scaling is a non-goal for v0.1. |
| **Reliability** | Crash recovery via WAL replay. CRC verification on every record. |
| **Determinism** | Tests are deterministic with fixed seeds and controlled timing. |
| **Portability** | Linux, macOS, WSL2. Windows best-effort (mmap semantics differ). |
| **Dependencies** | Zero external runtime dependencies. Testing: pytest, hypothesis only. |

---

## 7. Free Resource Budget

| Resource | Implementation | Cost |
|----------|---------------|------|
| Network I/O | asyncio + socket (Python stdlib) | ₹0 |
| Binary protocol | struct module (Python stdlib) | ₹0 |
| WAL storage | os + mmap (Python stdlib) | ₹0 |
| Index files | struct + mmap (Python stdlib) | ₹0 |
| Consensus | Raft implementation (pure Python) | ₹0 |
| Metadata | sqlite3 (Python stdlib) | ₹0 |
| Compression | zlib / lzma (Python stdlib) | ₹0 |
| CRC checksums | binascii.crc32 (Python stdlib) | ₹0 |
| Testing | pytest + hypothesis (pip install, free) | ₹0 |
| Cluster | 3-5 nodes on localhost (different ports) | ₹0 |

**Total cost: ₹0**

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Single produce latency | <1ms | Time from send to ack (localhost) |
| Batch throughput | 50K+ msgs/sec | 1000-msg batches, small payload, localhost |
| Failover time | <2s | Time from leader crash to new leader elected |
| Crash recovery | 0 data loss | Produce 10K msgs, kill broker, restart, verify all present |
| Replication lag | <50ms | Follower offset vs leader offset under load |
| Test coverage | >90% | pytest-cov line coverage |
| External dependencies | 0 | pip install tributary installs no runtime deps |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| asyncio event loop blocking | High | High | All I/O uses async APIs; CPU-heavy work offloaded to thread pool |
| GIL limits throughput | Medium | Medium | Batch processing amortizes GIL cost; I/O-bound workload benefits from asyncio |
| mmap portability issues | Low | Medium | Fallback to regular file I/O on platforms without mmap |
| Raft implementation bugs | Medium | High | Property-based testing with hypothesis; chaos testing with network partition injection |
| Disk I/O bottleneck | Medium | Medium | Batched writes with single fsync per batch; mmap for reads |
| Election instability | Low | Medium | Randomized timeouts; pre-vote phase to prevent disruption |
| Consumer rebalance storms | Low | Medium | Generation counter; rebalance throttle |

---

## 10. Release Plan

| Phase | Scope | Deliverable |
|-------|-------|-------------|
| **Phase 1** | Binary protocol, asyncio TCP server, connection management | Broker accepts connections, parses frames, echoes back |
| **Phase 2** | Segment-based WAL storage, sparse index, crash recovery | Broker stores and retrieves messages on disk |
| **Phase 3** | Topic/partition management, produce/fetch handlers | Single-node broker: produce and fetch messages |
| **Phase 4** | Raft consensus: leader election, log replication | 3-node cluster with replicated state |
| **Phase 5** | Partition replication, ISR, leader failover | Replicated topics with automatic failover |
| **Phase 6** | Consumer groups, offset management, rebalancing | Consumer group with partition assignment |
| **Phase 7** | Backpressure, batching, compression, metrics | Production-quality performance |
| **Phase 8** | CLI, integration tests, chaos tests, documentation | Complete portfolio-grade project |

---

## 11. Open Questions

1. Should the protocol support multiplexing multiple requests over a single TCP
   connection (pipelining), or one-request-one-response framing?
2. Should Raft snapshots use the segment format directly, or a separate compact
   serialization?
3. Should consumer offsets be stored in an internal topic (Kafka-style) or in
   sqlite3 (simpler but less elegant)?
4. Should the producer client support idempotent delivery (sequence numbers) in
   v0.1, or defer to v0.2?
