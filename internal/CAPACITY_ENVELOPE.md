# Capacity Envelope — Tributary v0.1.0

**Date:** 2026-07-23  
**Status:** Draft — based on localhost benchmarks (Windows 11, Python 3.13, SSD)

---

## Hardware & Environment

- **CPU:** 11th Gen Intel Core i7-11800H @ 2.30GHz (8 cores / 16 threads)
- **RAM:** 16 GB DDR4
- **Storage:** NVMe SSD (WAL + indexes)
- **OS:** Windows 11
- **Python:** 3.13.1
- **Runtime:** single asyncio event loop, `run_in_executor` for disk I/O

---

## Performance Envelope

All measurements are for **single-producer, single-partition, acks=1**, 100B payload, broker on localhost (loopback).

| Metric | Value | Conditions |
|--------|-------|------------|
| Mean produce latency | ~1.2–1.5 ms | 100B payload, acks=1, batch=1 |
| P99 produce latency | ~2–5 ms | Same |
| Producer throughput | ~600–800 msgs/sec | Single connection, sequential sends |
| Batched throughput | ~600–800 msgs/sec | batch=1..100 (bounded by disk fsync) |
| Multi-producer throughput | ~450–500 msgs/sec | 5 concurrent producers, 1 partition |
| Consumer poll latency | ~5–15 ms | 50 records per poll |
| Consumer drain rate | ~10 msgs/sec | Single partition, single consumer |
| TLS overhead | ~13–57% latency increase | Self-signed cert, TLS 1.3 |
| Crash recovery | ~700–1000 records/sec | 10–10,000 records, SSD |
| Max connections | 1,000 (configurable) | Default max_connections |
| Max inflight bytes | 1 MB per connection (default) | Backpressure threshold |

---

## Message Size Impact

| Payload Size | Mean Latency | Throughput |
|-------------|-------------|------------|
| 100 B | ~1.5 ms | ~640 msgs/sec |
| 1 KB | ~1.2 ms | ~865 msgs/sec |
| 10 KB | ~1.6 ms | ~615 msgs/sec |

Throughput is bounded by WAL fsync (per-append), not network bandwidth at these payload sizes.

---

## TLS Overhead

| Mode | Mean Latency | Throughput |
|------|-------------|------------|
| Plaintext | ~1.6 ms | ~600 msgs/sec |
| TLS 1.3 | ~1.9–2.8 ms | ~360–535 msgs/sec |
| Overhead | +13–57% | –10–40% |

TLS overhead is dominated by per-connection handshake cost. For persistent connections the per-request overhead is minimal after the initial handshake.

---

## Crash Recovery Performance

| Records | Recovery Time | Rate |
|---------|---------------|------|
| 10 | ~14 ms | ~715 rec/s |
| 20 | ~20 ms | ~970 rec/s |
| 100 | ~80 ms (est.) | ~1250 rec/s |
| 10,000 | ~5–10 s (est.) | ~1000–2000 rec/s |

Recovery time scales linearly with segment size. CRC validation and index rebuild are the dominant costs.

---

## Safe Operating Assumptions

### Cluster Size
- **Minimum:** 1 node (development)
- **Recommended:** 3 nodes (production, Raft quorum)
- **Maximum:** 7 nodes (Raft overhead grows with peer count)

### Client Count
- **Maximum per broker:** 500 active connections (below default 1,000 limit)
- **Maximum consumer groups:** 100 per cluster
- **Maximum partitions per topic:** 100 (WAL file descriptor limits)

### Storage
- **Segment size:** 1 MB (default) — tune based on message size
- **Retention:** 168 hours (7 days) default
- **WAL sync mode:** batch (default) — trades durability for throughput
- **Disk watermark:** 90% high / 80% low (default)

### Configuration Bounds
- **Election timeout:** 150–300 ms (default)
- **Heartbeat interval:** 50 ms (default)
- **Max frame size:** 10 MB (default) — do not exceed 100 MB
- **Max inflight bytes:** 1 MB per connection (default)

---

## Throughput Bottlenecks

1. **WAL fsync per append** — Each produce triggers `os.fsync()` via thread pool. This is the primary throughput bottleneck (~0.5–2 ms per call on SSD).
2. **Python GIL** — Single event loop processes all connections. CPU-bound operations (CRC, serialization) compete for the GIL.
3. **Single-threaded segment append lock** — Concurrent produces to the same partition are serialized by `asyncio.Lock`.

---

## Scaling Guidance

- **Increase batch size** — Larger batches amortize fsync cost across multiple messages.
- **Use more partitions** — Distribute writes across partitions to reduce lock contention.
- **acks=0** — Fire-and-forget mode avoids fsync wait (best throughput, no durability).
- **acks=2** — Waits for all replicas, adds network round-trip overhead.
- **SSD storage** — Required for acceptable WAL write performance. HDD will be significantly slower.

---

## Regression Thresholds (CI)

These thresholds are enforced when `TRIBUTARY_CI=1`:

| Benchmark | Threshold |
|-----------|-----------|
| Single-producer mean latency | < 1.0 s (1000 ms) |
| Single-producer p99 latency | < 5.0 s (5000 ms) |
| Throughput (batch=1) | > 10 ops/sec |
| Crash recovery (100 records) | < 30 s |
| Recovery record accuracy | 100% (all records accounted for) |
| TLS throughput | > 0 ops/sec (functional check) |
| Plaintext throughput | > 0 ops/sec (functional check) |

These thresholds are intentionally generous to accommodate CI environment variability. Tighter thresholds should be set based on target hardware.
