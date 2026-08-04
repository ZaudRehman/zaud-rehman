# Service Level Objectives — Tributary v0.1.0

**Date:** 2026-07-23  
**Derived from:** `internal/CAPACITY_ENVELOPE.md`, `scripts/run_benchmarks.py`, `tests/test_benchmarks.py`

---

## 1. Availability

| SLO | Target | Measurement | Source |
|-----|--------|-------------|--------|
| Single-node failure survival | 100% quorum preserved | 3-node cluster, leader failover < 6s | `test_cluster.sh`, `test_chaos.py` |
| Re-election time | < 6s (P99) | Time from leader stop to new leader accepting writes | Game Day Drills |
| Rolling restart | Zero data loss | Sequential node restart, verify offset monotonicity | `scripts/game_day_drills.sh` |
| Connection flood survival | 100% | 500 concurrent connections, all served | `test_chaos.py:test_500_concurrent_connections` |
| Auth flood survival | Valid auth + produce accepted | 100 bad-credential connections interleaved with valid traffic | `test_chaos.py:test_auth_flood_does_not_block_valid_traffic` |

## 2. Durability

| SLO | Target | Measurement | Source |
|-----|--------|-------------|--------|
| WAL append durability | fsync per produce (acks=1) | Every produce triggers `os.fsync()` via executor | `storage/segment.py` |
| Raft log replication | All committed entries survive minority failure | 3-node cluster, stop 1 node, verify committed entries readable | `test_integration.py` |
| Crash recovery | 100% record accuracy | CRC32C per record + index rebuild, zero silent corruption | `test_storage.py` |
| Backup integrity | SHA256 manifest verified on restore | `tributary admin restore` validates checksums | `test_backup.py` |

## 3. Latency (P99, single partition, 100B payload, acks=1)

| SLO | Target | Current Baseline | Conditions |
|-----|--------|-----------------|------------|
| Produce latency (P99) | < 10 ms | ~2–5 ms | Localhost, SSD, single producer |
| Produce latency (P50) | < 5 ms | ~1.2–1.5 ms | Same |
| Fetch latency (P99) | < 50 ms | ~5–15 ms | 50 records per poll, idle partition |
| TLS produce latency overhead | < 60% vs plaintext | +13–57% | TLS 1.3, persistent connection |
| Batched produce (batch=10) | < 20 ms P99 | ~5–10 ms | Amortized fsync cost |

## 4. Throughput (single partition, 100B payload, acks=1)

| SLO | Target | Current Baseline | Conditions |
|-----|--------|-----------------|------------|
| Single-producer throughput | > 100 ops/sec | ~600–800 msg/s | Sequential sends, acks=1 |
| Batched throughput (batch=100) | > 500 ops/sec | ~800 msg/s | Bounded by fsync, not batch |
| Multi-producer throughput (5 prods) | > 200 ops/sec | ~450–500 msg/s | Single partition, lock-contended |
| Consumer drain rate | > 50 ops/sec | ~10 msg/s | Single consumer, single partition |

**Note:** Consumer drain rate is currently bound by the poll-based fetch model (each fetch returns one record at a time). Multi-record fetch batches will improve this in a future release.

## 5. Capacity

| SLO | Target | Current Baseline | Conditions |
|-----|--------|-----------------|------------|
| Max connections per broker | > 500 | 1,000 (configurable) | Default `max_connections` |
| Max partitions per topic | > 50 | 100 | WAL file descriptor limits |
| Max topics per cluster | > 100 | 500 | Metadata size grows linearly |
| Max consumer groups per cluster | > 50 | 100 | `__consumer_groups` topic bottleneck |
| WAL segment recovery rate | > 500 rec/s | ~700–1000 rec/s | SSD, CRC + index rebuild |
| Max frame size | 10 MB | 10 MB (configurable) | Do not exceed 100 MB |

## 6. Safety

| SLO | Target | Measurement | Source |
|-----|--------|-------------|--------|
| Disk full → read-only | 100% deterministic | Produce returns error code 13 when `disk_usage > high_water` | `test_safety.py` |
| Graceful shutdown | Zero in-flight message loss | Drains active produces before closing connections | `test_safety.py:test_graceful_shutdown_drains_active_requests` |
| Quota enforcement | 100% | Token bucket rejects over-limit produce/fetch | `test_safety.py` |
| Unauthenticated connection rejection | 100% | Error code 11 returned before any request processing | `test_security.py` |
| Unauthorized request rejection | 100% | Error code 10 returned when ACL denies action | `test_security.py` |

## 7. Security

| SLO | Target | Measurement | Source |
|-----|--------|-------------|--------|
| TLS 1.3 handshake | Required for production | `--security-mode production` enforces TLS | `test_security.py` |
| SASL/SCRAM-SHA-256 auth | All non-peer connections | Challenge-response, no plaintext password over wire | `test_security.py:TestScramSha256` |
| mTLS peer auth | Required for production | Certificate-based peer authentication | `test_security.py` |
| ACL enforcement | Default deny | All principal/resource/action combos denied unless explicitly allowed | `test_security.py:TestAclManager` |

## 8. Regression Thresholds (CI)

These thresholds are enforced when `TRIBUTARY_CI=1`:

| Benchmark | Threshold | Rationale |
|-----------|-----------|-----------|
| Single-producer mean latency | < 1000 ms | Generous for CI variability |
| Single-producer p99 latency | < 5000 ms | Generous for CI variability |
| Throughput (batch=1) | > 10 ops/sec | Minimal functional check |
| Crash recovery (100 records) | < 30 s | Generous for slow CI runners |
| Recovery record accuracy | 100% | No silent corruption tolerated |
| TLS throughput | > 0 ops/sec | Functional check |
| Plaintext throughput | > 0 ops/sec | Functional check |

## 9. Measurement Methodology

- **Latency:** Measured from `client.send()` to receipt of `PRODUCE_RESP` ACK frame (round-trip).
- **Throughput:** Total records produced divided by elapsed wall-clock time.
- **Recovery time:** Time from `CrashRecovery.recover()` call to completion, measured via `time.monotonic()`.
- **Consumer lag:** Difference between latest committed offset and consumer's committed offset.
- **TLS overhead:** Percentage change in mean latency between plaintext and TLS modes on the same hardware.

All measurements collected on the reference hardware (see `CAPACITY_ENVELOPE.md`). Results on different hardware or under different load profiles may vary.
