# Operations Guide — Tributary

**Project:** Tributary.
**Status:** Draft.
**Applies To:** v0.1.x line.

## 1. Purpose

This document defines how to deploy, start, stop, inspect, back up, restore, and troubleshoot a Tributary cluster in its current implementation.
It complements the design, architecture, roadmap, and PRD by translating system behavior into repeatable operator procedures.

## 2. Operating Model

A Tributary cluster consists of independent broker processes, with an odd node count recommended and a minimum of 3 nodes for clustered operation.
Each node runs its own asyncio event loop, owns its own storage directory, maintains separate Raft state, and communicates over TCP for both client traffic and Raft traffic.

The current implementation is designed for a single machine or similarly bounded environment using localhost-style deployment patterns, and the PRD explicitly states that horizontal scale and hardened production deployment are non-goals for v0.1.
Operators should therefore treat this guide as the runbook for a controlled reference system with strong durability and failover behavior, but not as a public multi-tenant service guide.

## 3. Deployment Scope

Supported environments are Linux, macOS, and WSL2, with Python 3.11+ and no external runtime dependencies in the core broker runtime.
A standard local cluster uses three broker nodes on distinct ports such as 7001, 7002, and 7003, each with its own config file and `data/` subtree.

The broker process is started with `tributary broker start`, and the CLI also supports topic management, producing, consuming, cluster inspection, and WAL inspection workflows.
Current operational commands include `topic create|list|delete`, `produce`, `consume`, `cluster metadata`, `cluster nodes`, `wal inspect`, and `wal verify`.

## 4. Storage Layout

Each node stores broker data under its own `data/` directory, including topic partitions and Raft state.
The architecture document shows `data/node-<id>/raft/` for persistent consensus state and `data/node-<id>/topics/` for partition WAL segments and indexes.

Topic partitions use rolling segment files plus sparse index files, and internal topics such as `__offsets` and `__metadata` use the same storage pattern.
This matters operationally because backup, restore, and corruption inspection must include both user topics and internal topics, not only application data.

## 5. Startup Procedure

Before starting a cluster, ensure each node has a unique `node_id`, host, port, and `data_dir`, and ensure every node has a consistent peer list.
The reference deployment pattern defines these fields in per-node TOML config files.

Start all broker nodes in separate processes, then verify leader election and cluster visibility with `tributary cluster nodes` and `tributary cluster metadata`.
A healthy 3-node cluster should elect one leader and keep the remaining nodes as followers, because Raft leader election is a core implemented feature in the current system.

After cluster formation, create topics explicitly before producing data, using the topic CLI with partition count and replication factor.
For smoke testing, create a topic, produce a small message, consume it back, and confirm metadata shows leaders, replicas, and ISR membership.

## 6. Shutdown Procedure

Graceful shutdown is a P0 requirement in the PRD, and the broker is expected to flush WAL state and close connections cleanly during shutdown.
Operators should prefer controlled process termination over kill-style termination whenever possible to reduce recovery work on restart.

For a single node in a healthy cluster, stop one broker process at a time and verify the remaining nodes still report a leader and respond to metadata requests.
For planned maintenance on a 3-node cluster, do not stop two nodes at once, because majority quorum is required for Raft progress and leader election.

After shutdown, verify that file descriptors are released and no further writes are occurring in the node’s `data/` tree before moving or backing up its storage.
If an unclean shutdown occurs, the restart path must rely on WAL recovery and CRC verification rather than assuming the last append completed cleanly.

## 7. Health Checks

The primary operator checks are cluster role visibility, produce/fetch correctness, WAL verification, and metrics exposure.
At minimum, verify that one node reports leadership, client metadata resolves current leaders, and produces and fetches succeed against the active leader.

The broker exposes metrics through an HTTP `/metrics` endpoint using a Prometheus-compatible text format when metrics are enabled.
Relevant signals include produced message counters, produced bytes, partition lag, ISR size, Raft term, Raft role, active connections, and uptime.

Structured JSON logs should be enabled for operational troubleshooting because the logging model includes correlation IDs for request tracing.
Use correlation IDs to trace a produce, fetch, rebalance, or error event end-to-end across logs during incident analysis.

## 8. Backup Policy

The minimal correct backup unit is the full node data directory, including Raft state, topic partitions, indexes, and internal topics.
Backing up only application topic files is insufficient because consensus state and internal topics are part of correctness and recovery behavior.

The safest backup point is after a controlled shutdown of the target node, because it guarantees the broker has flushed WAL state and stopped mutating files.
If online backups are attempted, operators must treat them as crash-consistent rather than application-quiesced and must validate them through restore testing.

Before accepting a backup as usable, run WAL verification on restored data and confirm the node can recover and rejoin cluster operations.
Because recovery logic rebuilds indexes and truncates corrupt tails when necessary, a restore test is the only meaningful proof that a backup is operationally valid.

## 9. Restore Procedure

To restore a node, stop the broker process, replace its `data_dir` with the desired backup contents, and restart the broker using the original node identity and cluster configuration.
On startup, Tributary recovery scans segments, verifies CRC32C values, truncates corrupt tails, and rebuilds sparse indexes from valid records.

After restart, verify the node rejoins the cluster, confirm its role through cluster inspection, and confirm metadata, produce, and fetch operations succeed.
If the restored node is behind, follower catch-up and Raft replication should bring it forward as long as the cluster still has a healthy majority and compatible state.

If restoration is being used after corruption, also run `tributary wal inspect` and `tributary wal verify` on critical partitions to confirm segment structure and CRC integrity.
Do not delete suspect WAL or index files manually before recovery unless recovery tooling has already been exhausted, because the designed recovery path expects to inspect and repair the on-disk state.

## 10. Routine Operator Tasks

### Topic administration

Create topics explicitly with the desired partition count and replication factor using the admin CLI.
List and inspect topics regularly to confirm partition leaders, replicas, and ISR membership match expectations.

### WAL inspection

Use `tributary wal inspect <topic> --partition <id>` to inspect segment structure and `tributary wal verify <topic> --partition <id>` to verify CRC correctness.
These commands are the primary first-line tools when investigating corruption, recovery behavior, or unexpected fetch results.

### Consumer-group checks

Consumer groups use consistent hashing for assignment and store committed offsets in the internal `__offsets` topic.
When investigating replay or duplicate processing, first determine whether the consumer committed offsets before failure, because the documented delivery contract is at-least-once.

## 11. Incident Runbooks

### Non-leader writes

If a producer sends to a non-leader, the system returns leader information through metadata or not-leader handling, and the client is expected to refresh metadata and retry.
Operationally, verify the current leader with `cluster metadata`, then retest produces against the reported leader node.

### Broker crash mid-append

A crash during append is detected on restart through CRC verification, and the broker truncates the WAL to the last valid record.
After restart, verify that the node recovered, inspect recent segment tails if needed, and compare post-recovery fetch results with expected committed data.

### WAL or index corruption

The design defines CRC32C checks on records and index rebuild from the WAL when the index is corrupt or invalid.
Use `wal verify` first, then allow recovery to rebuild indexes from valid WAL contents instead of attempting manual index repair.

### Leader failure

If the leader crashes, followers detect the missing heartbeat through election timeout and elect a new leader when quorum is intact.
Verify term advancement and new leadership through cluster inspection, then retest client metadata and produces against the new leader.

### Network partition

In a split-brain scenario, only the majority side can elect a leader and commit entries, while the minority side cannot make progress.
During incident response, first determine which nodes still form quorum, then restore connectivity before expecting the isolated side to accept writes.

### Disk full

If the disk fills, the documented behavior is for the broker to enter read-only mode, reject produces, and continue serving fetches.
Free space, confirm the storage path is writable again, and then retest produce behavior before declaring the node recovered.

### Consumer crash or replay

If a consumer crashes before committing its offset, it resumes from the last committed offset on rejoin, which can produce duplicate processing.
Treat this as expected at-least-once behavior unless the committed offset record itself is missing or inconsistent.

### Election instability

The design identifies repeated elections in a short period as a failure mode and points to pre-vote plus exponential backoff as future mitigation rather than a current guarantee.
In current operations, investigate peer connectivity, process restarts, and scheduler or resource instability before assuming a protocol bug.

## 12. Performance and Capacity Checks

The PRD targets sub-millisecond single produce and fetch latency, batch produce under 10 ms for 1K messages, and 50,000+ messages per second on localhost with small batched messages.
Treat those as reference targets for controlled environments, not guaranteed production SLOs across arbitrary hardware.

The current design is optimized around a single asyncio event loop, batched writes, `pwrite` plus `fsync` offloading, mmap reads, and connection-level backpressure.
When performance degrades, inspect batch size, inflight window behavior, disk latency, connection counts, and whether clients are targeting leaders directly after metadata refresh.

Slow followers are tracked by the leader and may be dropped from ISR while the cluster continues with remaining replicas.
If ISR shrinks, check follower liveness, replication lag, disk health, and network delay before reintroducing the node into normal expectations.

## 13. Change Management

Make topology, config, and storage changes one node at a time and verify cluster health after each step.
This is especially important in a 3-node cluster because stopping or breaking two nodes at once removes majority availability.

Validate any operational change with the existing observability surface: cluster commands, metrics, structured logs, produce/fetch smoke tests, and WAL verification where relevant.
For upgrades or refactors that touch consensus, storage, or transport behavior, rerun integration and chaos coverage because the roadmap documents explicit tests for leader failure, network partition, connection flood, and instability scenarios.

## 14. Recovery Standards

A node is considered recovered only when it starts successfully, rejoins the cluster, reports an expected role, serves or follows correctly, and passes basic produce/fetch validation.
A backup is considered valid only when it has been restored into a node and that node has completed startup recovery successfully.

A cluster is considered healthy only when quorum is intact, one leader is stable, metadata is consistent, and clients can complete their normal request paths.
Because v0.1 explicitly prioritizes durability, crash recovery, failover, and backpressure as core system guarantees, those are the operational invariants that matter most during incident review.

## 15. Container Deployment

### 15.1 Docker Image

Build the image from the project root:

```bash
docker build -t tributary-broker:latest .
```

The image uses a multi-stage build: a builder stage compiles the wheel with `hatchling`, and a runtime stage installs only the wheel plus `entrypoint.sh`. The base image is `python:3.12-slim`.

Environment variables configure all runtime behavior (see `entrypoint.sh` for the full contract). The container exposes port 7001 (client TCP) and 9100 (HTTP metrics/health).

### 15.2 Docker Compose (Local Cluster)

A 3-node compose file is provided at `deploy/docker-compose.yml`:

```bash
docker compose -f deploy/docker-compose.yml up -d
```

Each node gets a named volume for persistent storage. Metrics are mapped to distinct host ports (9101, 9102, 9103).

### 15.3 Kubernetes (Helm)

A Helm chart is provided at `deploy/helm/tributary/`:

```bash
helm install tributary deploy/helm/tributary/ \
    --set replicaCount=3 \
    --set image.repository=tributary-broker \
    --set image.tag=latest
```

The chart deploys:
- **StatefulSet** with `podManagementPolicy: OrderedReady` and 60s termination grace period
- **Headless Service** for stable DNS (`<pod>.<svc>`) used as Raft peer addresses
- **PersistentVolumeClaim** template (10 GiB default, configurable via `persistence.size`)
- **PodDisruptionBudget** — maxUnavailable: 1
- **ServiceAccount** with minimal RBAC (endpoint watching only)
- **Liveness probe** — HTTP GET `/health` on metrics port
- **Readiness probe** — HTTP GET `/ready` on metrics port
- **Prometheus ServiceMonitor** (requires `prometheus-operator`)

Each pod derives its `NODE_ID` from `metadata.name` (e.g. `tributary-0`). The `PEERS` env var is auto-generated for a 3-node cluster using the StatefulSet DNS pattern.

## 16. Rolling Restart Procedure

Goal: restart all nodes one at a time without losing quorum or dropping committed data.

1. Verify cluster health:
   ```bash
   tributary cluster nodes
   tributary cluster metadata
   ```

2. Restart node-1 (or pod `tributary-0`):
   ```bash
   # Docker Compose
   docker compose -f deploy/docker-compose.yml restart node-1

   # Kubernetes
   kubectl rollout restart statefulset/tributary --cascade=orphan
   # (StatefulSet restart respects ordering automatically)
   ```

3. Wait for readiness:
   ```bash
   # Docker — wait for /ready to return 200
   until curl -sf http://localhost:9101/ready; do sleep 2; done

   # Kubernetes
   kubectl rollout status statefulset/tributary --timeout=120s
   ```

4. Verify quorum is intact:
   ```bash
   tributary cluster nodes
   ```

5. Repeat for each remaining node, waiting for readiness and verifying after each.

**Constraints:**
- Never restart more than one node at once in a 3-node cluster (loses majority).
- Wait for the restarted node to show a follower or leader role before proceeding.
- If the leader was restarted, allow up to 2 election timeouts (~600ms) for a new leader to be elected.

## 17. Upgrade Procedure

Goal: replace the broker binary with a newer version while preserving data and quorum.

1. Build the new image:
   ```bash
   docker build -t tributary-broker:<new-version> .
   ```

2. Follow the rolling restart procedure (Section 16), but replace the image tag for each node:
   ```bash
   # Docker Compose — update image tag in docker-compose.yml, then
   docker compose -f deploy/docker-compose.yml up -d node-1

   # Kubernetes
   kubectl set image statefulset/tributary tributary=tributary-broker:<new-version>
   kubectl rollout status statefulset/tributary --timeout=120s
   ```

3. After all nodes are upgraded, run smoke tests:
   ```bash
   tributary cluster nodes
   tributary topic list
   echo "hello" | tributary produce smoke-test-topic
   tributary consume smoke-test-topic --from-beginning
   ```

**Compatibility notes:**
- v0.1.x upgrades are in-place compatible (same wire protocol, same storage format).
- Downgrades are not supported once WAL or Raft log format changes.
- Check the release notes for any required config migration steps.

## 18. Rollback Procedure

Goal: revert to the previous broker version after a failed upgrade.

1. Identify the failing condition (e.g. crash loop, quorum loss, data corruption).

2. If any node is still running the new version, stop it gracefully:
   ```bash
   docker compose -f deploy/docker-compose.yml stop node-1
   ```

3. Restore the previous image tag and restart:
   ```bash
   # Update image tag in docker-compose.yml, then
   docker compose -f deploy/docker-compose.yml up -d node-1
   ```

4. Follow the rolling restart procedure to revert all nodes.

5. Verify cluster health and data integrity:
   ```bash
   tributary cluster nodes
   tributary wal verify <topic> --partition 0
   ```

**Prerequisites:**
- The previous image must still be available in the registry or locally cached.
- WAL and Raft state are forward-compatible within the same minor version line only.

## 19. Node Rebuild from Backup

Goal: replace a failed or corrupted node from a known-good backup of another node in the same cluster.

1. Identify the replacement node identity (same `node_id`, host, port as the failed node).

2. If the node process is still running, stop it gracefully:
   ```bash
   docker compose -f deploy/docker-compose.yml stop node-1
   ```

3. Remove the existing data directory (after verifying backup exists):
   ```bash
   rm -rf /var/lib/tributary/*
   ```

4. Restore the backup taken from the same node (or a compatible peer):
   ```bash
   tar xzf backup-node-1-$(date +%F).tar.gz -C /var/lib/tributary/
   ```

5. Verify WAL integrity before starting:
   ```bash
   tributary wal verify <critical-topic> --partition 0 --data-dir /var/lib/tributary
   ```

6. Start the node:
   ```bash
   docker compose -f deploy/docker-compose.yml up -d node-1
   ```

7. Verify the node rejoins the cluster:
   ```bash
   tributary cluster nodes
   ```

8. If the node is a follower and lagging, Raft catch-up will replicate missing entries from the leader.

**Important:**
- Rebuilding from a peer's backup requires the restored node's identity (node_id, Raft state) to match the failed node.
- If you restore a backup from a different node, Raft will reject the log because term/entry indices will conflict.
- Always take a fresh backup before attempting a rebuild, in case the procedure uncovers further corruption.

## 20. Exit Criteria for Daily Operations

Daily operations are acceptable when broker nodes start cleanly, metrics are available, logs are structured, metadata is consistent, and sample produce/fetch paths succeed.
Before ending any maintenance window, verify leadership, confirm no unexpected WAL errors, and confirm consumers can resume from committed offsets as expected.
