# Tributary Production Readiness Plan

## From Portfolio Project to Production Broker

**Date:** 2026-07-18  
**Status:** Proposed  

---

## 1. The Gap: Where Tributary Is Now vs. Production

This document defines exactly what "production use" means for a message broker,
what Tributary has today, and what must be built to close the gap.

---

## 2. Production Readiness Dimensions

Every production message broker — Kafka, RabbitMQ, NATS — must satisfy eight
dimensions before it can be trusted with real traffic :

### Dimension 1: Security (TLS + AuthN/AuthZ)

**Why it matters:** Message brokers carry payment events, user actions, system
commands, and PII. An unauthenticated broker on a network is a critical security
vulnerability .

**What production requires:**
- TLS for all client connections (encrypt in transit) 
- SASL/SCRAM-SHA-256 authentication (credentials not sent in plaintext) 
- ACL-based authorization (per-topic read/write permissions) 
- mTLS for inter-broker communication (broker-to-broker auth)
- Certificate rotation without downtime

**Tributary status:** None of this exists. v0.1 is plaintext TCP, no auth.

**What to build:**
```
src/tributary/
├── security/
│   ├── __init__.py
│   ├── tls.py              # TLS context creation, cert loading
│   ├── sasl.py             # SCRAM-SHA-256 authentication handshake
│   ├── acl.py              # Access control list evaluation
│   └── cert_manager.py     # Certificate rotation (watch + reload)
```

**Protocol changes:**
```
# Connection handshake
Client → Broker: HELLO (supported_sasl_mechanisms, tls_required)
Broker → Client: HELLO_ACK (chosen_mechanism, server_cert)
Client → Broker: AUTH (credentials)
Broker → Client: AUTH_OK / AUTH_FAIL

# Every request carries a session token after auth
Client → Broker: PRODUCE (session_token, topic, ...)
```

### Dimension 2: Observability (Metrics + Logging + Tracing)

**Why it matters:** In production, you cannot debug what you cannot see.
Under-replicated partitions, consumer lag, and disk pressure are the top three
causes of broker incidents .

**What production requires:**
- Prometheus metrics endpoint (`/metrics`) with broker-level and topic-level
  metrics 
- Grafana dashboard template (JSON, importable) 
- Structured JSON logging with configurable log levels
- Request tracing (correlation IDs across produce → replicate → fetch)
- Alerting rules (Alertmanager configs for critical conditions) 

**Critical metrics to expose:**
```
# Broker-level
tributary_broker_messages_in_total             # Counter
tributary_broker_messages_out_total            # Counter
tributary_broker_bytes_in_total                # Counter
tributary_broker_bytes_out_total               # Counter
tributary_broker_active_connections            # Gauge
tributary_broker_request_latency_seconds       # Histogram (p50, p90, p99)
tributary_broker_request_errors_total          # Counter

# Topic-level
tributary_topic_partition_count                # Gauge
tributary_topic_under_replicated_partitions    # Gauge (critical alert!)
tributary_topic_partition_log_size_bytes       # Gauge
tributary_topic_partition_log_segment_count    # Gauge

# Consumer group-level
tributary_consumer_group_lag                   # Gauge (critical alert!)
tributary_consumer_group_members               # Gauge
tributary_consumer_group_rebalance_total       # Counter
```

**Tributary status:** No metrics endpoint, basic logging.

**What to build:**
```
src/tributary/
├── observability/
│   ├── __init__.py
│   ├── metrics.py          # Prometheus-format metrics (pure Python)
│   ├── logging.py          # Structured JSON logging
│   ├── tracing.py          # Correlation ID propagation
│   └── health.py           # /health, /ready endpoints
```

### Dimension 3: Operational Safety

**Why it matters:** Production brokers are operated by humans who make mistakes.
The broker must have guardrails that prevent catastrophic actions .

**What production requires:**
- Auto topic creation disabled by default (prevent topic sprawl) 
- Minimum ISR (in-sync replicas) enforcement 
- Unclean leader election disabled (prevent data loss) 
- Rate limiting (protect against runaway producers) 
- Quota management (per-client throughput limits)
- Configuration validation on startup (fail fast on bad config)
- Graceful shutdown (flush WAL, close connections, Raft stepdown)

**Tributary status:** No rate limiting, no quotas, minimal config validation.

**What to build:**
```
src/tributary/
├── safety/
│   ├── __init__.py
│   ├── rate_limiter.py     # Token bucket per client/topic
│   ├── quotas.py           # Per-client byte/rate quotas
│   ├── config_validator.py # Validate all config on startup
│   └── shutdown.py         # Graceful shutdown coordinator
```

### Dimension 4: Schema Registry + Dead Letter Queue

**Why it matters:** Without schema enforcement, a single bad message (wrong
format, malformed JSON, missing field) can crash every consumer downstream. Dead
letter queues capture these messages for inspection .

**What production requires:**
- Schema registry: producers register schemas, consumers verify compatibility 
- Dead letter queue (DLQ): messages that fail consumption N times are routed to
  a system topic for debugging 
- Message retransmit: consumers can re-request undelivered or failed messages 

**Tributary schema registry design:**
```python
class SchemaRegistry:
    """Registers and validates message schemas.

    Supports JSON Schema, Avro, and Protobuf. Producers register a schema,
    get a schema_id. Messages carry schema_id in metadata. Consumers use
    schema_id to fetch and validate.
    """
    def register(self, topic: str, schema: bytes, schema_type: str) -> int: ...
    def validate(self, schema_id: int, value: bytes) -> bool: ...
    def get_latest(self, topic: str) -> tuple[int, bytes]: ...
    def check_compatibility(self, topic: str, new_schema: bytes) -> bool: ...
```

**Dead letter queue design:**
```python
class DeadLetterQueue:
    """Routes messages that exceed max_delivery_attempts to a DLQ topic.

    DLQ topic: "__dlq" (internal topic, auto-created)
    DLQ message format: original_message + failure_reason + original_topic +
    original_partition + original_offset + delivery_attempt_count
    """
    def route_to_dlq(self, message: Record, reason: str) -> None: ...
    def list_dlq_messages(self, topic: str) -> list[Record]: ...
    def replay_from_dlq(self, dlq_offset: int) -> None: ...
```

### Dimension 5: Deployment Infrastructure

**Why it matters:** A production broker must be deployable on Kubernetes with
one command, with stateful persistence, and with monitoring wired in .

**What production requires:**
- Docker image (multi-stage build, <50MB)
- Helm chart for Kubernetes deployment 
- StatefulSet manifest (persistent volumes for WAL segments)
- ConfigMap for broker configuration
- Service for client discovery
- PodDisruptionBudget for safe maintenance
- Liveness/readiness probes (`/health`, `/ready`)
- Horizontal Pod Autoscaler (optional, for client-facing nodes)

**Docker image design:**
```dockerfile
# Multi-stage build
FROM python:3.12-slim AS builder
COPY . /src
RUN pip wheel --no-deps /src -w /wheels

FROM python:3.12-slim
COPY --from=builder /wheels /wheels
RUN pip install /wheels/tributary-*.whl
EXPOSE 9092
HEALTHCHECK --interval=10s --timeout=5s CMD tributary healthcheck
ENTRYPOINT ["tributary", "broker", "start"]
```

**Helm chart structure:**
```
deploy/
├── helm/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── statefulset.yaml      # Broker pods with PVCs
│       ├── service.yaml          # Client-facing service
│       ├── configmap.yaml        # Broker configuration
│       ├── pdb.yaml              # PodDisruptionBudget
│       ├── serviceaccount.yaml
│       └── NOTES.txt
├── docker/
│   ├── Dockerfile
│   └── entrypoint.sh
└── k8s/
    ├── namespace.yaml
    └── monitoring/
        ├── prometheus-servicemonitor.yaml
        └── grafana-dashboard.json
```

### Dimension 6: Client Libraries

**Why it matters:** No broker is useful without client libraries. Production users
need official clients in at least Python and one other language .

**What production requires:**
- Python client (async + sync API)
- Go client (for high-throughput consumers)
- CLI tool (already designed: tributary produce/consume/topic)
- Connection pooling, automatic reconnection, retry with backoff
- Schema-aware deserialization (integration with schema registry)

**Client library structure:**
```
clients/
├── python/                    # Official Python client
│   ├── tributary_client/
│   │   ├── __init__.py
│   │   ├── producer.py        # TributaryProducer
│   │   ├── consumer.py        # TributaryConsumer
│   │   ├── connection.py      # Pool, reconnect, retry
│   │   └── schema.py          # Schema registry integration
│   ├── tests/
│   └── pyproject.toml
├── go/                        # Official Go client
│   ├── tributary-go/
│   │   ├── producer.go
│   │   ├── consumer.go
│   │   └── connection.go
│   └── go.mod
└── cli/                       # CLI (already in main repo)
```

### Dimension 7: Performance at Scale

**Why it matters:** A Python asyncio broker will never match Kafka's JVM-level
throughput. But "production use" doesn't mean "fastest possible" — it means
"predictable, stable, and sufficient for the use case" .

**What production requires:**
- Documented performance characteristics (throughput, latency, limits)
- Backpressure that degrades gracefully (not crash)
- Bounded memory usage (no OOM under consumer lag)
- Configurable durability (batch fsync vs. per-record fsync) 
- Benchmark suite (automated, in CI, tracks regressions)

**Honest performance targets for a Python asyncio broker:**
```
Single-node, localhost, 1KB messages:
- Throughput: 10,000 - 50,000 msgs/sec (produce)
- Latency p99: < 50ms (produce + ack)
- Memory: < 512MB for 100K undelivered messages
- Disk: < 10% overhead over raw payload bytes

3-node cluster, localhost:
- Throughput: 5,000 - 20,000 msgs/sec (produce with RF=3, acks=all)
- Latency p99: < 100ms (produce + replicate + ack)
- Failover time: < 5 seconds (leader election + catch-up)
```

These are not Kafka numbers (Kafka does 200K+ msgs/sec). But they are
sufficient for:
- Internal microservices communication
- Event sourcing for small-to-medium systems
- Agent pipelines (LLM orchestration)
- IoT data ingestion (bounded rate)
- Development/staging environments

**The Rust rewrite path:**
```
Phase 1-3: Python implementation (correctness, features, research contribution)
Phase 4:   Performance benchmarking (identify bottlenecks)
Phase 5:   Rewrite hot paths in Rust (via PyO3 or standalone)
           - Binary protocol codec (struct → Rust struct)
           - WAL segment writes (os.pwrite → Rust direct I/O)
           - CRC32C computation (hashlib → Rust SIMD)
Phase 6:   Full Rust rewrite (if Python limits are hit)
```

### Dimension 8: Operational Runbook

**Why it matters:** Production systems need documentation for operations teams.
If someone needs to restart a broker at 3am, they need to know how .

**What production requires:**
- Deployment runbook (install, configure, scale, upgrade)
- Incident response runbook (diagnose, mitigate, recover)
- Backup and restore procedures
- Capacity planning guide
- Known issues and workarounds

---

## 3. Implementation Phases for Production Readiness

### Phase 9: Security (2-3 weeks)
- TLS for client connections (ssl module)
- SASL/SCRAM-SHA-256 authentication (hashlib + hmac)
- ACL-based authorization
- Certificate rotation
- Integration tests with TLS-enabled cluster

### Phase 10: Observability (1-2 weeks)
- Prometheus metrics endpoint (pure Python, text format)
- Structured JSON logging
- Health/readiness endpoints
- Grafana dashboard JSON template
- Alertmanager rules

### Phase 11: Operational Safety (1-2 weeks)
- Rate limiting (token bucket)
- Per-client quotas
- Configuration validation
- Graceful shutdown (SIGTERM handler)
- Auto topic creation: disabled by default

### Phase 12: Schema Registry + DLQ (2 weeks)
- JSON Schema support (jsonschema is stdlib-adjacent)
- Schema versioning and compatibility checking
- Dead letter queue topic (`__dlq`)
- Message replay from DLQ
- CLI commands: `tributary schema register/list/validate`

### Phase 13: Deployment Infrastructure (2 weeks)
- Docker image (multi-stage, <50MB)
- Helm chart for Kubernetes
- StatefulSet with persistent volumes
- Liveness/readiness probes
- Prometheus ServiceMonitor
- Grafana dashboard

### Phase 14: Client Libraries (3-4 weeks, can parallelize)
- Python client library (async + sync)
- Connection pooling, reconnection, retry
- Schema-aware deserialization
- Go client (basic produce/consume)

### Phase 15: Performance Hardening (2-3 weeks)
- Benchmark suite (automated in CI)
- Backpressure tuning
- Memory bounds under consumer lag
- Configurable durability levels
- Rust extension for hot paths (optional, via PyO3)

### Phase 16: Operations Documentation (1 week)
- Deployment runbook
- Incident response runbook
- Backup/restore procedures
- Capacity planning guide
- Known issues document

---

## 4. The Honest Assessment

### Can Tributary Be a Production Broker?

**Yes, for specific workloads and scale envelopes.**

| Workload | Tributary Suitable? | Why |
|----------|---------------------|-----|
| Internal microservices | **Yes** | 10-50K msgs/sec is sufficient for most internal comms |
| Event sourcing (small-medium) | **Yes** | WAL + replay + time-travel covers this |
| Agent pipelines (LLM orchestration) | **Yes** | Causal DAGs are a natural fit for agent chains |
| IoT data ingestion | **Yes** | Bounded rate, partitioning, retention |
| Dev/staging environments | **Yes** | Free, zero-dependency, easy to run |
| High-throughput telemetry (100K+ msg/sec) | **No** | Python GIL limits; use Kafka/Redpanda |
| Low-latency trading (<1ms p99) | **No** | Python GC pauses; use Aeron/Redpanda |
| Multi-datacenter geo-replication | **No** | Not in scope for v1.0 |

### The Positioning

**Tributary is positioned as:**
> "A production-grade distributed message broker for internal microservices,
> event sourcing, and agent orchestration — with content-derived causality
> as its distinguishing contribution."

**It is NOT positioned as:**
> "A Kafka replacement for high-throughput telemetry pipelines."

This positioning is honest, defensible, and sufficient for real production use.
Not every system needs 200K msgs/sec. Most internal microservices communicate
at 1-5K msgs/sec. Tributary covers that range with room to spare.

### The Performance Question

Python's asyncio achieves ~50K TCP connections and ~100K I/O ops/sec on modern
hardware. For message brokerage, the bottleneck is:
1. **Disk I/O** (fsync latency: ~1ms per fsync, mitigated by batching)
2. **GIL contention** (mitigated by offloading pwrite/fsync to thread pool)
3. **Protocol parsing** (mitigated by struct module, which is C-implemented)

With batching (500 messages per fsync), the theoretical max for a Python asyncio
broker is:
- 500 msgs / 1ms fsync = 500,000 msgs/sec (disk-bound)
- But GIL limits actual concurrency, realistically ~50,000 msgs/sec

50,000 msgs/sec is production-viable for:
- 50 microservices each producing 1,000 msgs/sec
- 100,000 users each generating 0.5 events/sec
- 10,000 IoT devices each sending 5 readings/sec

### The Rust Rewrite Path

If Python limits are reached, the architecture is designed for a phased Rust
rewrite:
```
Phase 1: Keep Python. Build everything. Ship v1.0. Get users.
Phase 2: Rewrite protocol codec in Rust (PyO3 extension)
Phase 3: Rewrite WAL storage in Rust (direct I/O, zero-copy)
Phase 4: Rewrite consensus in Rust (if needed)
Phase 5: Full Rust rewrite (if community demands it)
```

The Python implementation serves as the reference implementation and the
evaluation platform for the research contribution. The Rust rewrite is the
production performance path.

---

## 5. Production Readiness Checklist

### Security 
- [x] TLS for all client connections
- [x] SASL/SCRAM-SHA-256 authentication
- [x] ACL-based authorization (per-topic read/write)
- [x] mTLS for inter-broker communication
- [ ] Certificate rotation without downtime
- [ ] Secret management (no passwords in config files)

### Observability 
- [ ] Prometheus `/metrics` endpoint
- [ ] Grafana dashboard template (JSON)
- [ ] Structured JSON logging
- [ ] Request tracing (correlation IDs)
- [ ] Alertmanager alert rules
- [ ] Health endpoint (`/health`)
- [ ] Readiness endpoint (`/ready`)

### Operational Safety 
- [ ] Auto topic creation: disabled by default
- [ ] Min ISR enforcement
- [ ] Unclean leader election: disabled
- [ ] Rate limiting (per client, per topic)
- [ ] Per-client quotas (bytes/sec, requests/sec)
- [ ] Config validation on startup
- [ ] Graceful shutdown (SIGTERM → flush → close)

### Data Safety 
- [ ] Dead letter queue
- [ ] Schema registry (JSON Schema)
- [ ] Message retransmit for failed consumers
- [ ] Configurable durability (batch/every/none fsync)
- [ ] Offset checkpointing for consumer groups

### Deployment 
- [ ] Docker image (<50MB)
- [ ] Helm chart
- [ ] Kubernetes StatefulSet
- [ ] Persistent volumes for WAL
- [ ] PodDisruptionBudget
- [ ] Liveness/readiness probes
- [ ] ServiceMonitor for Prometheus

### Performance 
- [ ] Benchmark suite in CI
- [ ] Documented throughput/latency characteristics
- [ ] Graceful backpressure (no crash under load)
- [ ] Bounded memory under consumer lag
- [ ] Configurable durability levels

### Operations 
- [ ] Deployment runbook
- [ ] Incident response runbook
- Tributary-specific commands (topic create, consumer group reset)
- [ ] Backup/restore procedures
- [ ] Capacity planning guide
- [ ] Known issues document

### Client Libraries 
- [ ] Python client (async + sync)
- [ ] Connection pooling and reconnection
- [ ] Schema-aware deserialization
- [ ] CLI tool (produce, consume, topic management)
