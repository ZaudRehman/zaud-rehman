# Testing Guide — Tributary

**Project:** Tributary.
**Status:** Draft.
**Applies To:** v0.1.x line.

## 1. Purpose

This document defines the testing strategy, test layers, invariants, and release gates for Tributary.
The PRD explicitly requires a comprehensive test suite with property-based tests and failure injection, and the roadmap shows that those layers have been implemented across protocol, storage, consensus, replication, client, CLI, integration, and chaos testing.

Testing in Tributary is not a secondary quality check. It is the primary mechanism for validating correctness of a distributed broker that implements framing, persistence, recovery, replication, and failover in pure Python.

## 2. Testing Principles

The PRD requires deterministic tests with fixed seeds and controlled timing, and the architecture document explicitly recommends virtual clocks and fault injection to avoid scheduler-dependent behavior.
Tests must therefore prefer simulated timing, injected transport faults, and bounded concurrency over sleep-heavy or wall-clock-sensitive behavior.

The project also guarantees zero external runtime dependencies for core modules, with testing dependencies limited to `pytest`, `pytest-asyncio`, and `hypothesis`.
Any test addition should preserve that discipline and avoid introducing heavyweight infrastructure or nondeterministic external services.

### Core rules

- Prefer unit isolation before cluster-level validation.
- Validate invariants, not only happy paths.
- Cover crash recovery and corruption handling, not only request success.
- Make concurrency tests bounded and reproducible.
- Treat chaos tests as regression tests for already specified failure modes.

## 3. Test Matrix

The current roadmap documents the following implemented test layers and counts.

| Area | Scope | Current evidence |
|---|---|---|
| Protocol | Framing, CRC, truncation, compression, round-trips | 16 tests in `test_protocol.py` |
| Transport | Send/receive, pipelining, payloads, concurrent connections | 8 tests in `test_transport.py` |
| Backpressure | Window tracking and blocking behavior | 11 tests in `test_backpressure.py` |
| Storage | Record, segment, sparse index, WAL manager, recovery | 33 tests in `test_storage.py` |
| Broker | Topic manager, partition behavior, handler integration | 25 tests in `test_broker.py` |
| Consensus | Election, append, stale term, snapshots, transport | 22 tests in `test_consensus.py` |
| Replication | Leader detection, not-leader handling, ISR metadata | 10 tests in `test_replication.py` |
| Consumer groups | Assignment, offsets, heartbeats, rebalances | 18 tests in `test_consumer.py` |
| Metrics and logging | Counters, gauges, latency, JSON logs | 16 tests in `test_phase7.py` |
| CLI | Version, help, command-group behavior | 10 tests in `test_cli.py` |
| Client library | Admin, producer, consumer APIs | 12 tests in `test_client.py` |
| Integration | End-to-end 3-node cluster flow | 1 integration test |
| Chaos | Partition, flood, repeated leader failure | 3 chaos tests |

The roadmap also states the suite passes with 183 tests and `mypy` clean across 41 source files at the Phase 8 checkpoint.
That number is the current baseline and should be treated as a floor, not a target to remain static.

## 4. Unit Testing Scope

Unit tests must own correctness of local behavior before distributed tests are allowed to rely on it.
For Tributary, this is especially important because higher-level failures often originate in local correctness bugs in framing, CRC calculation, index lookup, or timeout state transitions.

### Protocol

Protocol tests must cover:

- Header encode/decode round-trip.
- Magic-byte validation.
- Body CRC mismatch detection.
- Truncated frame handling.
- Message codec round-trips for all implemented message types.
- Compression round-trips where supported.

### Storage

Storage unit tests must cover:

- Record encode/decode and auto-CRC behavior.
- Segment append and ordered reads.
- `read_at()` behavior for indexed and unindexed paths.
- Segment roll conditions.
- Sparse index persistence and binary-search lookup.
- Recovery behavior for clean, truncated, corrupt, and empty partitions.

### Consensus

Consensus unit tests must cover:

- Leader election with deterministic timing controls.
- Vote granting, stale term rejection, and step-down behavior.
- Append success and log mismatch handling.
- Snapshot creation, installation, and corruption handling.
- At-most-one-leader-per-term invariants in controlled cluster fixtures.

### Broker and consumer logic

Broker and consumer tests must cover:

- Topic creation, deletion, and listing.
- Partition produce and fetch behavior.
- Not-leader responses and leader-aware routing.
- Consumer join, leave, heartbeat, and timeout eviction.
- Offset commit and fetch semantics over the internal `__offsets` topic.

## 5. Property-Based Testing

The PRD explicitly calls for property-based testing, and the roadmap shows Hypothesis coverage in protocol and storage paths, including random payload round-trips, `read_at()` correctness, and recovery preservation before truncation points.

Property-based tests are required wherever correctness depends on many input shapes rather than a small number of examples.
The best current candidates are frame parsing, record encoding, sparse index lookup, WAL recovery, offset resolution, and log-replication ordering.

### Required properties

- Encode/decode round-trip preserves semantic message equality for valid inputs.
- `read_at(offset)` returns the exact record for any valid appended offset.
- Recovery preserves all records before the first corruption point.
- Offsets in a partition remain monotonic and never reused.
- Fetch results preserve partition order by offset.
- Consumer offset resolution returns the latest committed value per group/topic/partition key.

### Rules for Hypothesis use

- Keep generated examples bounded in size to preserve CI time.
- Favor semantic assertions over snapshot-style output checks.
- Shrink to minimal failing examples and convert important regressions into explicit unit tests.
- Avoid combining broad random input with real network timing in the same test.

## 6. Integration Testing

Integration tests validate that assembled components behave correctly across process boundaries or controlled in-memory cluster boundaries.
The roadmap already includes a 3-node integration test covering leader election, topic creation via leader, producing messages, and fetching them back.

The minimum integration flow for every release should include:

1. Start a 3-node cluster.
2. Wait for leader election.
3. Create a topic with replication.
4. Produce a batch through the leader path.
5. Fetch the produced records and verify order and payload integrity.
6. Confirm metadata exposes leader, replicas, and ISR information.

Integration tests should also validate client bootstrap behavior, because the architecture explicitly defines a metadata-first lifecycle followed by direct leader connections.
That means routing correctness is part of end-to-end behavior, not merely a client convenience.

## 7. Chaos Testing

Chaos testing is justified directly by the PRD risk model and by the architecture document’s fault-injection patterns for network partitions, slow disks, and virtual clocks.
Its purpose is not random breakage but controlled validation of documented failure-mode handling.

The current chaos inventory includes:

- Leader isolation with re-election and healing.
- Connection flood under load.
- Repeated rapid leader failures with continued term progression and availability.

### Mandatory chaos scenarios

| Scenario | Why it matters | Expected invariant |
|---|---|---|
| Network partition | Raft split-brain resistance | Only majority side makes progress |
| Leader crash | Failover correctness | New leader elected, writes resume |
| Connection flood | Transport robustness | Broker remains responsive within bounds |
| Slow disk / delayed fsync | Storage latency resilience | No data corruption; backpressure or latency increase only |
| Index corruption | Recovery correctness | Rebuild from WAL succeeds |
| Corrupt WAL tail | Crash recovery correctness | Tail truncated at last valid record |
| Consumer timeout | Group correctness | Rebalance occurs and stale member is evicted |

Chaos tests should be deterministic and scenario-driven.
Do not add probabilistic monkey tests that fail intermittently without identifying which system invariant was violated.

## 8. Determinism Requirements

The architecture guide explicitly recommends a virtual clock to make election testing deterministic, and the PRD names determinism as a non-functional requirement.
Any test that depends on timeout or election behavior should use injected time or controlled advancement wherever possible rather than `sleep()` loops.

For concurrency-heavy tests:

- Cap connection counts and payload sizes explicitly.
- Bound all awaits with timeouts.
- Avoid dependence on task scheduling order unless the order itself is the subject under test.
- Use controlled in-memory transport fixtures when validating consensus invariants.

A test is unacceptable if it passes only on a fast laptop or fails sporadically under CI load.
In Tributary, nondeterminism is a test bug unless the test is specifically proving eventual stabilization and has bounded criteria for success.

## 9. Static Verification

The roadmap states that `mypy` is clean across 41 source files at the completed Phase 8 checkpoint, and multiple earlier phases also call out strict typing checks and clean `ruff` status.
Static verification is therefore a release gate, not an optional hygiene step.

### Required checks

- `python -m mypy src/` passes clean.
- Linting passes clean under the configured toolchain, which the roadmap reports as `ruff clean`.
- Type changes in protocol, storage, and consensus code must be reviewed for compatibility with public dataclasses and APIs already documented in the design and architecture docs.

Because the system is heavily dataclass- and protocol-driven, static typing is especially valuable for message definitions, handler dispatch, state-machine transitions, and storage interfaces.

## 10. Test Environment

The documented deployment and test scope is Python 3.11+ on Linux, macOS, or WSL2, with Windows marked best-effort due to `mmap` differences.
Tests should therefore run primarily in POSIX-like environments, and storage tests must remain aware of platform-specific I/O behavior.

The core runtime uses only stdlib imports, while CLI tests may rely on optional development dependencies such as Click and Rich.
Keep test fixtures local and self-contained, and do not introduce real external brokers, databases, or network services into the standard suite.

## 11. Release Gates

A Tributary change is not releasable unless the relevant test layers pass for the surface area it modifies.
At minimum, every release candidate must satisfy the current documented suite baseline and preserve the project’s key guarantees around durability, ordering, crash recovery, failover, and backpressure.

### Minimum gate by subsystem

| Changed subsystem | Required gate |
|---|---|
| Protocol / transport | Protocol, transport, backpressure, CLI/client smoke coverage |
| Storage | Storage unit tests, Hypothesis recovery properties, WAL CLI verification paths |
| Broker routing | Broker, replication, integration tests |
| Consensus / Raft | Consensus, integration, chaos partition and failover scenarios |
| Consumer groups | Consumer tests plus integration path covering offsets |
| Metrics / logging | Phase 7 tests plus regression checks for structured output |
| CLI / client | CLI tests, client tests, one end-to-end flow |

### Full release gate

- All tests pass.
- `mypy` passes on `src/`.
- Lint passes clean.
- No regression in crash recovery behavior.
- No regression in leader failover behavior.
- No regression in monotonic offset ordering or at-least-once semantics.

## 12. Required Invariants

The design document already states several system guarantees that should be encoded directly into tests.
These invariants are more important than incidental implementation details.

### Must-hold invariants

- Messages acknowledged with `acks=1` or `acks=all` satisfy the documented durability contract.
- Offsets within a partition are strictly increasing and never reused.
- Messages within a partition are fetched in offset order.
- Crash recovery preserves committed data and truncates only invalid WAL tail data.
- At most one leader exists per term in a healthy controlled cluster model.
- Minority partitions cannot commit writes during network partition.
- Consumer replay after crash follows at-least-once semantics via last committed offset.
- Backpressure prevents unbounded producer overwhelm on slow consumers or congested connections.

When adding features, first define the invariant, then add unit tests, then add scenario tests.
Do not start with CLI-level tests for behavior that has no subsystem invariant written down.

## 13. Failure Reproduction Guidance

The architecture doc already provides concrete fault-injection examples for partitioned transport, slow disk simulation, and virtual clocks.
Those should be the preferred patterns for reproducing failures in tests because they isolate the cause and preserve determinism.

Examples of acceptable failure reproduction methods:

- Drop or delay messages between selected node pairs to simulate partition.
- Monkeypatch `os.fsync` to simulate slow or blocking disk.
- Advance a virtual clock to trigger elections or timeouts deterministically.
- Corrupt the tail of a WAL segment to validate recovery truncation.
- Corrupt an index file to validate WAL-driven rebuild behavior.

Prefer direct state perturbation over broad resource exhaustion when the bug class is known.
For example, corrupting a segment tail is a better test of recovery logic than hard-killing a process at random instruction points.

## 14. Coverage Priorities for Future Changes

The roadmap lists future work such as TLS, SASL, ACLs, pre-vote, idempotent producer support, dead-letter queues, and transactional behavior.
Each of those features must arrive with new invariants and matching unit, integration, and negative tests before being merged.

Highest-priority future additions to the test suite are:

- Security handshake and auth failure tests once TLS and auth exist.
- Pre-vote election stabilization tests once that mechanism is added.
- Idempotent producer deduplication properties once sequence numbers exist.
- Snapshot recovery and catch-up integration scenarios beyond current unit coverage.
- Retention and compaction tests if those optional storage behaviors are expanded.

## 15. Daily Developer Workflow

Every nontrivial change should run its nearest unit suite first, then the affected subsystem suite, then at least one end-to-end scenario.
Do not rely on the final full-suite run to discover local protocol, storage, or consensus regressions that could have been caught earlier.

A practical default workflow is:

1. Run targeted tests for the edited subsystem.
2. Run type checking on `src/`.
3. Run one integration or chaos path if the change touches cross-node or persistence behavior.
4. Run the full suite before merge.
