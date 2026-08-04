**Project:** Tributary  
**Status:** Draft  
**Target Release:** v1.0 hardening line built on top of v0.1 core  
**Last Updated:** 2026-07-18

---

## 1. Purpose and Scope

This document defines the additional engineering work required to move Tributary from a portfolio-grade v0.1 reference implementation to a production-capable release for bounded, internal workloads.

Tributary already implements the core broker stack: custom binary protocol, segment-based WAL storage, crash recovery, Raft consensus, partition replication, consumer groups, backpressure, metrics, structured logging, CLI tooling, integration tests, and chaos tests.

This document does **not** restate broker internals already covered in `PRD.md`, `DESIGN.md`, and `ARCHITECTURE.md`; it focuses only on the delta between the current baseline and a deployable, operable, supportable release.

### Scope

The production target for Tributary v1.0 is:

- Single-region deployments.
- Small to medium clusters using the current broker architecture and Raft replication model.
- Internal event distribution, service-to-service messaging, and local or private deployment scenarios where the current architecture is a good fit. 
- At-least-once delivery semantics, strict per-partition ordering, WAL durability, and replicated failover. 

### Non-Goals

The following remain out of scope for v1.0 unless explicitly promoted by a later revision:

- Cross-datacenter replication and geo-distribution. 
- Kafka wire protocol compatibility. 
- Transactions and exactly-once delivery. 
- Hyperscale throughput claims beyond the existing localhost-oriented performance envelope in the PRD. 
- Replacing the current architecture with a different runtime before hardening evidence justifies it. 

---

## 2. Current Baseline

Tributary has completed phases 1-8 of the roadmap, including the broker core, replication, consumer groups, batching, compression, metrics, structured logging, async client library, integration testing, and chaos testing. 

### Implemented Today

- Binary framed TCP protocol with message typing, correlation IDs, CRC checks, versioning, and optional compression.
- Segment-based WAL with sparse indexes, mmap-backed reads, CRC validation, and crash recovery by truncating corrupt tails and rebuilding indexes. 
- Single-node produce/fetch and topic lifecycle operations. 
- Raft-based leader election, replication, persistent state, and snapshot support. 
- Partition leader routing, ISR-aware metadata, and leader failover behavior. 
- Consumer groups, heartbeats, rebalancing, and internal-topic offset storage. 
- Backpressure via connection-level in-flight byte limits and producer batching. 
- Prometheus-format metrics and structured JSON logging with correlation IDs. 
- CLI commands for broker control, topic management, cluster metadata, node listing, WAL inspection, and WAL verification. 

### Verified Today

- The roadmap records 183 passing tests at Phase 8, clean mypy results across 41 source files, and chaos coverage for leader isolation, connection flood, and repeated leader failure scenarios. 
- The PRD sets the current non-functional envelope at zero runtime dependencies, localhost-oriented throughput targets, sub-2-second failover, and crash recovery without committed data loss. 
- The architecture uses a single asyncio event loop per broker node, with `run_in_executor` only for blocking disk writes and fsync operations. 

### Gaps Blocking Production Claims

The current design explicitly places v0.1 in a trusted-network model with no TLS, no authentication, and no ACLs, and the PRD explicitly states that v0.1 is not intended for production deployment at scale. 

The current deployment guidance is local-machine, multi-process cluster startup rather than packaged, repeatable production deployment with upgrade, backup, restore, and runbook discipline. 

The current observability surface provides metrics and structured logs, but it does not yet define production alerting, SLOs, dashboards, or operator response procedures. 

---

## 3. Production Strategy

Two viable paths exist from the current baseline. 

### Option A: Harden the Current Runtime

Keep the current pure-Python architecture, retain the zero-runtime-dependency core, and add the missing production controls around security, deployment, operations, and validation. 

**Advantages**

- Preserves the existing architecture, test suite, and documentation. 
- Aligns with the project’s current design choices, including asyncio, WAL storage, Raft replication, and stdlib-first runtime constraints. 
- Minimizes rewrite risk and allows production claims to be supported by incremental hardening evidence. 

**Risks**

- The GIL and single-event-loop design cap throughput and CPU scaling. 
- TLS, authentication, quotas, and stronger validation increase protocol and operational complexity. 

### Option B: Split the Runtime

Keep the control plane and most broker logic in Python, but move selected hot paths such as protocol parsing, CRC-heavy paths, or WAL write primitives behind optional native extensions after production benchmarking identifies bottlenecks. 

**Advantages**

- Preserves API and architecture while creating a path to higher throughput. 
- Avoids a full rewrite before measured bottlenecks are known. 

**Risks**

- Breaks the current “zero external runtime dependencies” guarantee for the hardened line unless managed as an optional acceleration path. 
- Increases build, packaging, CI, and support complexity. 

### Chosen Path

**Option A is the recommended v1.0 path.** The current codebase already satisfies the core distributed-systems requirements and has strong phase-complete coverage, so the shortest credible route to production is hardening, not rewriting. 

Optional acceleration work should be deferred until benchmark evidence shows that the existing runtime cannot meet the target workload envelope with acceptable latency and operational stability. 

---

## 4. Gap Matrix

| Area | Current State | Gap | Required Outcome |
|---|---|---|---|
| Security | Trusted-network posture, no TLS, no authentication, no ACLs.  | No secure transport, no client identity, no authorization boundary. | TLS-enabled transport, authenticated clients and peers, topic/admin authorization. |
| Config Safety | Runtime behavior and tuning knobs are documented, but there is no production-grade config validation contract.  | Invalid or unsafe config may reach runtime. | Typed config schema, fail-fast validation, safe defaults, redacted secret handling. |
| Deployment | Local 3-node deployment is documented via manual process startup.  | No reproducible packaging, orchestration manifests, or upgrade path. | Container image, systemd/Kubernetes manifests, readiness/liveness checks, rolling restart procedure. |
| Observability | Metrics endpoint and JSON logging exist.  | No SLOs, dashboards, alerts, or incident signals defined. | Operator dashboards, alert rules, symptom-to-cause mapping, on-call runbook. |
| Capacity Control | Backpressure and batching exist.  | No quotas, admission control, or disk-watermark policy at production level. | Client quotas, disk high-water and low-water behavior, bounded resource exhaustion policy. |
| Data Safety | WAL durability, CRC recovery, and replication exist.  | No backup/restore contract, schema guardrails, DLQ policy, or corruption drill. | Snapshot/backup workflow, restore verification, schema enforcement mode, replay and DLQ handling. |
| Client Stability | Async clients and CLI exist.  | No compatibility policy, retry/backoff contract, or long-term API support statement. | Versioned client guarantees, retry policy, compatibility matrix, deprecation process. |
| Operations | Failure modes are documented at design level.  | No production runbooks, maintenance workflow, or release evidence package. | Runbooks for startup, shutdown, failover, restore, disk pressure, and upgrade rollback. |

---

## 5. Workstreams

### 5.1 Security

The current design explicitly states that v0.1 accepts any TCP connection, uses plaintext transport, and applies no ACLs. 

That posture is the single largest blocker to any production claim. 

#### Decisions

1. Add TLS for both client traffic and peer traffic.
2. Add authentication before request dispatch.
3. Add authorization for topic operations and cluster-admin operations.
4. Make insecure mode explicit, non-default, and development-only.

#### Recommended Design

**Transport security**
- Add TLS using Python `ssl` as the baseline path, which is consistent with the documented v0.2 roadmap. 
- Support separate listener configuration for client traffic and Raft peer traffic to avoid accidental trust-boundary collapse.
- Require certificate-based peer identity for broker-to-broker connections or, at minimum, a dedicated authenticated peer mode distinct from client auth.

**Authentication**
- Implement a versioned authentication handshake before normal request handling.
- Support one secure default path first; the cleanest initial choice is mTLS or a simple SASL mechanism aligned with the documented roadmap. 
- Bind authenticated identity to the connection context and propagate it to authorization and logging.

**Authorization**
- Enforce ACL checks on:
  - Produce.
  - Fetch.
  - Topic create/delete.
  - Metadata.
  - Group join/leave.
  - Offset commit/fetch.
  - Cluster-admin and WAL inspection commands.
- Model permissions as `(principal, resource, action)` with explicit deny on missing rule.

**Secrets handling**
- Do not store credentials or private key material in plaintext logs.
- Redact secrets from config dumps and error messages.
- Support certificate and credential reload on broker restart first; in-process rotation can follow later.

#### Release Gates

- All client and peer traffic is encrypted by default.
- Unauthenticated connections are rejected before request processing.
- Unauthorized produce/fetch/admin requests return deterministic authorization errors.
- Integration tests cover successful auth, failed auth, expired credentials, bad certs, and ACL denial.
- Chaos tests prove that TLS/auth failures degrade safely and do not deadlock the broker.

---

### 5.2 Config and Safety

The current docs define many runtime knobs — including election timeouts, heartbeat interval, retention, frame limits, connection limits, and in-flight byte windows — but they do not define a production-grade configuration contract or validation regime. 

#### Decisions

1. Introduce a single canonical config schema.
2. Validate all config at startup and fail fast on invalid combinations.
3. Separate user-tunable values from expert-only values.
4. Treat config compatibility as part of the public API.

#### Required Controls

- Strong validation for port ranges, directory paths, replication-factor bounds, timeout relationships, and frame-size limits.
- Explicit defaults for retention, segment size, compression, max connections, inflight bytes, and heartbeat timing based on the documented settings model. 
- Read-only mode under disk exhaustion, which is already part of the documented failure handling model and should become an operator-visible state. 
- Graceful shutdown that stops admission, flushes WAL work, drains in-flight operations, and closes connections deterministically, matching the PRD requirement for graceful shutdown. 

#### Release Gates

- Invalid config fails before the server starts.
- Secrets are never logged.
- Graceful shutdown preserves ACK semantics and leaves no partially applied committed state.
- Disk-full behavior is deterministic, observable, and tested.

---

### 5.3 Deployment

The current architecture and setup documentation describe a local 3-node cluster started manually with separate config files and local data directories. 

That is appropriate for development and demonstration, but not for repeatable production deployment. 

#### Decisions

1. Define one supported production deployment model first.
2. Package the broker for immutable deployment.
3. Make storage layout, probes, and restart policy explicit.

#### Recommended First Deployment Target

Choose **containerized single-region deployment** as the first-class path, with either systemd-managed hosts or Kubernetes StatefulSets as the top-level operational model.

#### Required Deliverables

- Minimal production image.
- Deterministic startup command and env/config contract.
- Persistent volume contract for broker data directories and Raft state, which already have a documented on-disk layout. 
- Readiness check that fails on uninitialized or unsafe startup state.
- Liveness check that distinguishes transient slowness from fatal deadlock.
- Rolling restart procedure that preserves quorum.
- Upgrade and rollback procedure with version-compatibility notes.

#### Release Gates

- Fresh cluster bootstrap works from packaged artifacts.
- Node restart preserves local WAL and Raft state.
- Rolling restart of a 3-node cluster completes without violating quorum.
- Persistent volumes survive container replacement.
- Upgrade and rollback are scripted and rehearsed.

---

### 5.4 Observability

The broker already exposes Prometheus-format metrics over HTTP and structured JSON logging with correlation IDs. 

That is a strong base, but observability is not production-ready until operators can detect, triage, and respond to failure modes within defined SLOs. 

#### Decisions

1. Define SLOs before adding dashboards.
2. Map every major failure mode to at least one metric signal and one log signature.
3. Make broker health visible at cluster, node, topic, partition, and consumer-group levels.

#### Required SLOs

Initial SLOs should be derived from the PRD’s current targets and then validated under hardened deployment conditions:

- Availability target based on single-node failure survival and sub-2-second reelection intent. 
- Durability target based on WAL persistence and replicated survival semantics. 
- Recovery target based on crash-recovery correctness and restore drills. 
- Latency and throughput targets aligned with the documented localhost envelope, but restated as tested production limits for the supported deployment class. 

#### Required Metrics and Alerts

At minimum, alert on:

- Leader change frequency.
- ISR shrink events.
- Replication lag.
- WAL append failures.
- Disk free space and read-only mode entry.
- Connection saturation.
- Auth failures and ACL denials.
- Consumer lag growth.
- Rebalance storm rate.
- Crash-recovery duration.

#### Release Gates

- Dashboard coverage exists for cluster, node, topic, partition, and consumer-group views.
- Alerts are tested against injected faults.
- Every page-worthy alert has an operator runbook entry.
- Correlation IDs link request-path logs across the broker and client interactions already supported by structured logging. 

---

### 5.5 Capacity and Resource Control

Backpressure, pipelining, and producer batching are already implemented, and the architecture explicitly documents connection-level flow control. 

However, production operation requires policy decisions for overload, not just mechanisms for transport slowdown. 

#### Decisions

1. Add admission control at the broker boundary.
2. Bound all growth surfaces.
3. Prefer explicit rejection over silent resource exhaustion.

#### Required Controls

- Per-connection and per-principal quotas for bytes/sec and requests/sec.
- Hard maximum frame size enforcement.
- Topic-level or partition-level write rejection under disk high-water conditions, which extends the PRD’s high-water-mark requirement. 
- Bounded queues for background work.
- Explicit behavior for slow consumers and slow followers, building on the documented ISR-drop model for lagging followers. 

#### Release Gates

- Load tests prove no unbounded memory growth under slow-consumer and flood scenarios.
- Quota breaches are observable and deterministic.
- Disk watermark behavior is tested and documented.
- Overload returns stable, typed errors rather than timing-dependent failures.

---

### 5.6 Data Safety

Tributary already provides WAL durability, CRC validation, recovery truncation, sparse indexing, and replicated commit semantics. 

Production use still requires stronger guarantees around operator recovery, data governance, and bad-message handling. 

#### Decisions

1. Define backup and restore as a first-class supported workflow.
2. Add message-validation controls at the topic boundary.
3. Add explicit replay and isolation behavior for malformed or poison messages.

#### Required Deliverables

- Backup procedure for node data directories and Raft state, based on the documented storage layout. 
- Restore procedure that verifies recovered segments, indexes, and Raft state before node admission.
- Restore drill proving that a destroyed node can be rebuilt and rejoined safely.
- Optional schema-enforcement mode for structured workloads.
- Dead-letter topic policy for consumer-side poison-message handling.
- Replay tooling for WAL or topic-level reprocessing using existing inspection primitives as a base. 

#### Release Gates

- Backup and restore are documented, scripted, and tested.
- Corrupt-tail recovery remains correct after restore.
- Operator can rebuild a node without manual filesystem surgery.
- DLQ and replay behavior are deterministic for the supported message-validation mode.

---

### 5.7 Client and Protocol Stability

The broker already has a versioned protocol, typed message families, CLI support, and async admin/producer/consumer clients. 

That is enough to begin a compatibility policy, but not enough to promise long-term client stability without an explicit contract. 

#### Decisions

1. Freeze protocol v1 once security handshake changes land.
2. Define compatibility guarantees for additive vs breaking changes.
3. Make retry, reconnect, and metadata-refresh behavior explicit.

#### Required Deliverables

- Protocol compatibility table.
- Message versioning rules.
- Retry and backoff policy for produce, fetch, metadata refresh, and leader redirection.
- Stable error taxonomy.
- Deprecation policy for fields, message types, and CLI flags.

#### Release Gates

- Old clients fail clearly against unsupported brokers.
- Compatible clients interoperate across rolling upgrades where declared.
- Protocol-fuzz and downgrade tests pass.
- Client docs specify reconnection, retry, timeout, and auth-refresh behavior.

---

### 5.8 Operations and Runbooks

The design doc already records major failure modes such as broker crash mid-append, leader crash, split-brain minority behavior, disk full, slow follower, connection reset, and index corruption. 

Production readiness requires converting that design-level knowledge into operator procedures. 

#### Required Runbooks

- Cluster bootstrap.
- Graceful node shutdown.
- Unclean node crash recovery.
- Disk-full response.
- Leader flapping investigation.
- Follower lag and ISR shrink response.
- Backup and restore.
- Rolling restart.
- Failed upgrade rollback.
- Credential or certificate replacement.

#### Release Gates

- Every sev-1 or sev-2 alert maps to a runbook.
- Runbooks are validated during game days.
- On-call steps are deterministic and do not rely on source-code inspection.
- Maintenance procedures specify quorum implications and expected client impact.

---

### 5.9 Performance and Capacity Validation

The PRD defines a localhost-oriented target envelope including sub-millisecond single produce/fetch aspirations, 50K+ messages/sec sustained throughput, and sub-2-second failover. 

Those values are useful engineering targets, but production claims must be based on reproducible benchmark methodology under the chosen deployment model. 

#### Decisions

1. Treat performance as an evidence package, not a marketing statement.
2. Publish supported workload envelopes instead of universal claims.
3. Validate steady-state and degraded-state behavior separately.

#### Required Benchmark Classes

- Single producer / single partition latency.
- Batched producer throughput.
- Multi-producer contention.
- Consumer lag under sustained load.
- Leader failover during active writes.
- Crash recovery time by dataset size.
- Disk-pressure behavior.
- TLS-on vs TLS-off overhead.

#### Release Gates

- Benchmark suite is automated and repeatable.
- Published numbers include hardware, OS, config, message size, replication factor, and acks mode.
- Capacity guidance defines safe cluster size, client count, and storage assumptions for the supported deployment class.
- Regression thresholds are enforced in CI for the benchmark subset that is deterministic enough to gate.

---

## 6. Validation Matrix

| Workstream | Test Types | Evidence Required |
|---|---|---|
| Security | Unit, integration, negative auth tests, expired cert tests, ACL matrix tests | Test report, config examples, failure screenshots/log samples |
| Config Safety | Startup validation tests, invalid-combination tests, shutdown tests, disk-full tests | Schema doc, passing suite, operator notes |
| Deployment | Fresh install, restart, rolling restart, upgrade, rollback, PV persistence tests | Deployment manifests, install guide, rehearsal record |
| Observability | Alert-fire drills, metric verification, log correlation tests, dashboard review | Dashboard export, alert rules, runbook links |
| Capacity Control | Flood, slow-consumer, slow-follower, large-frame, disk-watermark tests | Load test output, memory profile, rejection policy doc |
| Data Safety | Backup/restore drill, corruption recovery test, node rebuild drill, replay tests | Restore transcript, recovery timing, validation checklist |
| Client Stability | Compatibility tests, rolling-upgrade tests, fuzz tests, retry/backoff tests | Compatibility matrix, protocol version notes |
| Operations | Game days, failover drills, incident walk-throughs | Signed runbooks, drill logs, remediation actions |

---

## 7. Release Checklist

A production release is blocked until **all** items below are complete.

### Security
- [ ] TLS enabled by default for client traffic.
- [ ] Secure peer-to-peer transport enabled by default.
- [ ] Authentication required for all non-development deployments.
- [ ] ACL enforcement implemented and tested.
- [ ] Secret redaction verified in logs and CLI output.

### Config and Safety
- [ ] Startup config validation fails fast on invalid inputs.
- [ ] Graceful shutdown behavior is tested under active load.
- [ ] Disk-full mode is deterministic and observable.
- [ ] Frame-size, connection, and quota limits are enforced.

### Deployment
- [ ] Supported deployment model documented end-to-end.
- [ ] Container or service packaging is reproducible.
- [ ] Persistent storage contract documented.
- [ ] Rolling restart tested on a 3-node cluster.
- [ ] Upgrade and rollback procedure rehearsed.

### Observability
- [ ] SLOs documented.
- [ ] Dashboard set published.
- [ ] Alert rules tested.
- [ ] Correlation IDs visible across critical request flows. 
- [ ] Every high-severity alert maps to a runbook.

### Data Safety
- [ ] Backup procedure documented.
- [ ] Restore procedure documented.
- [ ] Restore drill completed successfully.
- [ ] Corruption recovery validated post-restore.
- [ ] Replay and DLQ behavior documented.

### Client and Protocol
- [ ] Protocol compatibility rules documented.
- [ ] Stable error model documented.
- [ ] Client retry and reconnect semantics documented.
- [ ] Rolling-upgrade interoperability tested where supported.

### Performance
- [ ] Benchmark suite automated.
- [ ] Published performance envelope approved.
- [ ] No unbounded memory growth under flood or slow-consumer tests.
- [ ] TLS overhead and failover impact measured.

### Operations
- [ ] Runbooks approved.
- [ ] Game day completed.
- [ ] On-call troubleshooting path verified.
- [ ] Release evidence package archived.

---

## 8. Execution Plan

The recommended execution order is:

### Phase A: Security First
Implement TLS, authentication, and ACLs before any packaging or scale validation, because the current trusted-network model is the largest production blocker. 

### Phase B: Safety Controls
Add config validation, quotas, disk-watermark behavior, graceful shutdown hardening, and explicit overload policy to make the runtime safe under operator error and resource pressure. 

### Phase C: Deployment Contract
Package the broker, define the supported production deployment model, and rehearse restart, upgrade, rollback, and node-rebuild procedures using the documented storage layout. 

### Phase D: Observability and Operations
Promote existing metrics and structured logs into dashboards, SLOs, alerts, and runbooks, then validate them through game days and injected faults. 

### Phase E: Data Safety and Compatibility
Add backup/restore support, replay tooling, optional schema controls, and protocol/client compatibility guarantees. 

### Phase F: Benchmarks and Sign-Off
Freeze the hardened release only after benchmark, failover, restore, and operational evidence is complete and reproducible. 

---

## 9. Exit Criteria

Tributary can be described as a production-capable broker for its supported workload envelope only when the following are simultaneously true:

1. The security model is secure by default rather than trusted-network by assumption. 
2. The deployment model is reproducible and state-safe. 
3. Operators have tested runbooks for failure, maintenance, and recovery. 
4. Observability is sufficient to detect and explain the documented failure modes. 
5. Performance claims are backed by repeatable measurements under the supported deployment class. 
6. Backup, restore, and node rebuild are tested workflows rather than undocumented filesystem operations. 
7. Client and protocol compatibility rules are explicit. 

Until those criteria are met, Tributary should continue to be described as a complete distributed broker implementation with strong educational and engineering value, but not as a generally production-ready system. 