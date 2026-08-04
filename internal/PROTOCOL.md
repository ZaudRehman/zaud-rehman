# Tributary Wire Protocol v1

## Frame Format

Every message on the wire is a fixed-header **Frame**:

```
┌──────────────────────────────────────────────────┐
│ Magic       (4 bytes)  0x54 0x52 0x42 0x52      │  "T R B R"
│ Version     (1 byte)   0x01                      │
│ MsgType     (2 bytes)  big-endian uint16         │
│ CRC32C      (4 bytes)  CRC-32C of body           │
│ BodyLength  (4 bytes)  big-endian uint32         │
│ Body        (N bytes)  MsgType-specific payload   │
└──────────────────────────────────────────────────┘
```

- Magic: `TRBR`
- Version: `1` (current)
- CRC32C covers only the Body (not the header)
- Body may use zlib compression when the `compress` flag is set in the encoder

## Message Types

| Code | Name | Direction | Payload |
|------|------|-----------|---------|
| 1 | `PRODUCE` | C→B | topic, partition, key, value, acks |
| 2 | `FETCH` | C→B | topic, partition, offset, max_bytes, max_wait_ms |
| 3 | `CREATE_TOPIC` | C→B | topic, partitions, replication_factor |
| 4 | `DELETE_TOPIC` | C→B | topic |
| 5 | `LIST_TOPICS` | C→B | (empty) |
| 6 | `COMMIT_OFFSET` | C→B | group_id, topic, partition, offset |
| 7 | `FETCH_OFFSET` | C→B | group_id, topic, partition |
| 8 | `JOIN_GROUP` | C→B | group_id, consumer_id, topics, session_timeout_ms |
| 9 | `LEAVE_GROUP` | C→B | group_id, consumer_id |
| 10 | `HEARTBEAT` | C→B | group_id, consumer_id, generation_id |
| 11 | `METADATA` | C→B | (empty) |
| 12 | `AUTH_REQUEST` | C→B | mechanism, credentials |
| 13 | `AUTH_RESPONSE` | B↔C | mechanism, challenge |
| 14 | `AUTH_SUCCESS` | B→C | principal_identity, session_token |
| 15 | `AUTH_FAILURE` | B→C | reason |
| 16 | `DLQ_FETCH` | C→B | subject, partition, offset, max_records, max_wait_ms |
| 17 | `DLQ_FETCH_RESP` | B→C | subject, partition, records |
| 18 | `DLQ_REPLAY` | C→B | subject, partition, offset, max_count |
| 19 | `DLQ_REPLAY_RESP` | B→C | subject, partition, replayed_count |
| 50 | `RAFT_VOTE_REQ` | B↔B | term, candidate_id, last_log_index, last_log_term |
| 51 | `RAFT_VOTE_RESP` | B↔B | term, vote_granted |
| 52 | `RAFT_APPEND_REQ` | B↔B | term, leader_id, prev_log_index, prev_log_term, entries, leader_commit |
| 53 | `RAFT_APPEND_RESP` | B↔B | term, success, match_index |
| 54 | `RAFT_SNAPSHOT_REQ` | B↔B | term, leader_id, last_included_index, last_included_term, data |
| 55 | `RAFT_SNAPSHOT_RESP` | B↔B | term, success |
| 100 | `ACK` | B→C | message |
| 101 | `ERROR` | B→C | code, message |
| 110 | `PRODUCE_RESP` | B→C | topic, partition, offset |
| 111 | `FETCH_RESP` | B→C | topic, partition, records, high_watermark |
| 112 | `LIST_TOPICS_RESP` | B→C | topics |
| 113 | `CREATE_TOPIC_RESP` | B→C | uses ACK |
| 114 | `DELETE_TOPIC_RESP` | B→C | uses ACK |
| 115 | `METADATA_RESP` | B→C | topics, broker_nodes, read_only |
| 116 | `NOT_LEADER` | B→C | topic, partition, leader_id, leader_host, leader_port |
| 120 | `FETCH_OFFSET_RESP` | B→C | group_id, topic, partition, offset |
| 121 | `JOIN_GROUP_RESP` | B→C | group_id, consumer_id, generation_id, assigned_partitions |

(C = Client, B = Broker)

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1 | UNSUPPORTED_MSG_TYPE | Unknown or unsupported message type |
| 3 | INVALID_REQUEST | Request body failed to decode or is malformed |
| 5 | NOT_LEADER | Requested partition leader is on a different node |
| 6 | UNKNOWN_TOPIC_OR_PARTITION | Topic or partition does not exist |
| 7 | INVALID_TOPIC | Topic name contains invalid characters |
| 10 | UNAUTHORIZED | ACL check denied the operation |
| 11 | UNAUTHENTICATED | Connection has not completed SASL authentication |
| 12 | QUOTA_EXCEEDED | Producer rate limit exceeded |
| 13 | READ_ONLY | Broker is in read-only mode (disk pressure) |
| 99 | INTERNAL_ERROR | Unhandled server-side error |

## Compatibility

### Additive changes (safe — do not break existing clients)
- Adding new message types (codes not yet assigned)
- Adding optional trailing fields to response payloads (decoders ignore extra bytes)
- Adding new error codes

### Breaking changes (require coordinated upgrade)
- Changing the Frame header (magic, version, CRC scope)
- Removing or renaming existing message types
- Changing field order or type within an existing message body
- Changing the semantics of a successful response (e.g. a field that was always present becomes optional)

### Version negotiation
- The `Version` byte in the Frame header is currently always `1`
- Future versions may add a version-negotiation exchange during connection setup
- Until then, clients and brokers must agree on the wire version

## Client Behaviour

### Retry
- **Idempotent requests** (FETCH, METADATA, LIST_TOPICS, FETCH_OFFSET, HEARTBEAT): retry on connection failure with exponential backoff (100ms base, 5s ceiling, 1.5× multiplier).
- **Non-idempotent requests** (PRODUCE, COMMIT_OFFSET): retry only on `NOT_LEADER` (code 5) and `INTERNAL_ERROR` (code 99). Do NOT retry on `QUOTA_EXCEEDED` (12) without backpressure; wait and re-send.
- **Authentication requests**: do not retry; fail fast and surface the error.
- **DLQ operations** (`DLQ_FETCH`, `DLQ_REPLAY`): retry on connection failure with the same backoff as idempotent requests.

### Backoff
- Default: exponential backoff starting at 100ms, multiplying by 1.5 each attempt, capped at 5s.
- After `QUOTA_EXCEEDED`: the broker's `RateLimiter` enforces a token-bucket delay; the client should wait at least the `Retry-After` equivalent (currently not sent — clients should use a fixed 1s backoff).
- After a successful retry, reset the backoff to the base interval.

### Reconnect
- On connection loss: close the old connection immediately, open a new one, re-authenticate (if SASL is configured), and retry any in-flight idempotent requests.
- On `NOT_LEADER` response: close the connection to the old leader, fetch metadata to discover the new leader, connect to it, and re-send the request.
- Metadata refresh: the client should refresh metadata on `NOT_LEADER` and on any persistent `UNKNOWN_TOPIC_OR_PARTITION` error. An idle metadata refresh every 60s is recommended.

### Timeouts
- Connection timeout: 5s
- Request timeout: 30s (configurable)
- Session timeout: defaults to 10s, must be less than the broker's `group.min.session.timeout.ms`

## Deprecation Policy

### Message types
1. Mark a message type as deprecated in the source (comment + changelog entry).
2. Keep it in the codec for at least 2 minor releases.
3. Remove it in the next major version.

### Fields
1. Add the replacement field alongside the deprecated one.
2. Deprecate the old field in the docstring.
3. Remove the old field in the next major version.

### CLI flags
1. Mark as deprecated in `--help` output.
2. Keep for at least 2 minor releases.
3. Remove in the next major version.

### Behavioural changes
1. Gate behind a feature flag or configuration default.
2. Document the old and new behaviour.
3. Remove the flag after 2 minor releases, keeping the new behaviour.
