**Project:** Tributary  
**Status:** Draft  
**Target Release:** v1.0 hardening line  
**Last Updated:** 2026-07-18

---

## 1. Purpose

This document defines the production security architecture for Tributary and the engineering work required to move from the current trusted-network v0.1 posture to a secure-by-default deployment model. 

The current design explicitly states that v0.1 has no TLS, no authentication, and no ACLs, and the roadmap lists TLS, SASL authentication, and per-topic ACLs as future work. 

This document covers:

- Threat model.
- Security goals and non-goals.
- Authentication architecture.
- Authorization model.
- Transport security.
- Secret and credential handling.
- Auditability and observability.
- Failure modes.
- Validation and release gates.

---

## 2. Current Baseline

Tributary already provides a versioned binary protocol over TCP, request correlation IDs, structured logging with correlation IDs, leader-aware metadata routing, and a multi-node cluster topology with both client and peer traffic flowing over broker connections. 

The current architecture also uses a single asyncio event loop per broker node and multiplexes different message types on the same connection model, which means authentication and authorization must integrate cleanly into connection establishment and request dispatch rather than being bolted on as CLI-only checks. 

### Current Security Posture

The current v0.1 posture is:

- No authentication. 
- No TLS. 
- No ACLs. 
- Trusted-network assumption for all clients and peers. 

That is acceptable for the portfolio reference implementation, but it is incompatible with any claim of production readiness. 

---

## 3. Security Goals

Security work for Tributary v1.0 must satisfy the following goals:

1. All non-development deployments use encrypted transport by default. 
2. Every client and peer connection has a strongly bound authenticated identity before normal request handling begins. 
3. Every broker operation is authorized against an explicit policy model rather than network location alone. 
4. Security failures fail closed, not open.
5. Secrets and credentials are never exposed in logs, metrics, or error messages.
6. The security design remains consistent with the current stdlib-first architecture and versioned binary protocol. 
7. Security controls are testable under unit, integration, and chaos conditions using the existing testing discipline already present in the project. 

### Non-Goals

The following are out of scope for the first hardened security release unless later promoted:

- End-user SSO integration.
- Cross-datacenter trust federation.
- Hardware security module integration.
- Fine-grained field-level encryption inside message payloads.
- Exactly-once cryptographic audit trails.

---

## 4. Threat Model

The supported threat model should match the intended deployment scope: private infrastructure, bounded internal workloads, and broker-managed client access rather than public anonymous internet exposure. 

### Threats In Scope

- Passive network eavesdropping on client or peer traffic.
- Active man-in-the-middle modification of broker traffic.
- Unauthorized client produce, fetch, topic creation, topic deletion, or metadata access.
- Unauthorized consumer-group access and offset manipulation.
- Unauthorized peer impersonation in Raft traffic.
- Secret leakage through config files, logs, or CLI output.
- Resource abuse by authenticated or unauthenticated clients, including connection flooding and request flooding.
- Privilege escalation from topic-level access to cluster-admin access.

### Threats Partially In Scope

- Malicious but authenticated tenants within the same deployment.
- Poison messages, replay abuse, and schema abuse.
- Insider misuse of administrative credentials.

### Threats Out of Scope

- Kernel compromise on broker hosts.
- Full host takeover before broker process start.
- Physical media theft without disk encryption at the platform layer.
- Nation-state adversaries with control of the operating environment.

---

## 5. Security Architecture Options

Two viable approaches exist for the first production-grade security implementation. 

### Option A: TLS + SASL + ACLs

This approach follows the v0.2 roadmap directly: TLS for transport, SASL for client identity, and ACL checks in the broker. 

**Advantages**
- Closely matches the roadmap already documented for v0.2. 
- Separates transport encryption from application identity.
- Works well for mixed client types and future external integrations.

**Costs**
- Requires protocol handshake extensions.
- Requires secure password storage and verification.
- Requires more moving parts than certificate-only identity.

### Option B: Mutual TLS + ACLs

This approach uses mTLS for both encryption and identity and binds principal identity to the peer certificate subject or SAN. 

**Advantages**
- Simpler initial protocol surface because identity is established during TLS handshake.
- Strong identity for broker-to-broker traffic.
- Removes password storage from the first release.

**Costs**
- Certificate issuance and rotation are operationally heavier for some users.
- Less convenient for lightweight clients and local developer workflows unless a dev mode exists.

### Chosen Path

The recommended design is a **hybrid model**:

- **Peer traffic:** mandatory mTLS.  
- **Client traffic:** TLS mandatory, with mTLS or a simple SASL mechanism as the client auth layer. 

This keeps broker-to-broker trust strong and operationally explicit, while allowing client identity to evolve without weakening transport guarantees. 

For the first hardened release, the narrowest viable secure implementation is:

1. TLS on every listener.
2. mTLS for peer connections.
3. One supported client authentication mode first, either mTLS or SASL PLAIN over TLS with a documented migration path to SCRAM.

If speed of delivery is the top priority, mTLS for both peers and clients is the simplest secure first cut. If usability for client applications matters more, TLS plus SASL for clients is the better long-term contract. 

---

## 6. Transport Security

The current system uses raw asyncio TCP connections with a custom framed binary protocol. 

Security must preserve that architecture while introducing encrypted channels and peer identity validation. 

### Requirements

- All client listeners use TLS by default.
- All peer listeners use TLS by default.
- Plaintext mode is allowed only in explicit development mode.
- Certificate validation is mandatory in production mode.
- Peer identity must be bound to configured node identity before Raft traffic is accepted.

### Listener Model

Define separate logical listener classes even if they share implementation:

- **Client listener:** accepts producer, consumer, and admin traffic. 
- **Peer listener:** accepts Raft AppendEntries, RequestVote, and snapshot traffic. 

Do not rely solely on message type to separate trust domains when both classes of traffic share a port shape today. The hardened design should allow separate listener configuration, separate trust stores, and separate auth policy for client and peer traffic. 

### TLS Policy

Minimum expected policy:

- TLS required in production mode.
- Strong cipher suite defaults from the platform `ssl` implementation.
- Hostname or SAN verification for client-side validation where applicable.
- Certificate chain validation against configured CA roots.
- Optional certificate revocation integration later; not required for first hardened release.

### Peer Identity Validation

For broker-to-broker traffic:

- The certificate must map to a configured node identity.
- The node ID in broker config must match the presented peer identity before Raft requests are accepted.
- Connection success alone is insufficient; identity binding must be explicit.

This is necessary because the architecture depends on distinct broker nodes with persistent Raft state and peer-aware routing. 

---

## 7. Authentication

Authentication must happen before request dispatch enters normal broker operations, because the current handler architecture is message-type driven and otherwise would allow unauthenticated access to produce, fetch, metadata, group, or admin paths. 

### 7.1 Authentication Model

Each connection must move through these states:

1. TCP accepted.
2. TLS established.
3. Peer or client identity established.
4. Connection principal attached to connection context.
5. Authorization enforced per request.

No normal broker request should be processed before state 4 completes.

### 7.2 Principal Model

Represent identity as a normalized principal structure:

- `principal_type`: `peer`, `service`, `user`, `admin`.
- `principal_name`: canonical identity string.
- `auth_mechanism`: `mtls`, `sasl_plain`, `sasl_scram`.
- `authenticated_at`: timestamp.
- `auth_context`: certificate metadata or SASL metadata.

### 7.3 Client Authentication Choices

#### Option 1: mTLS Clients

Use client certificates for all clients.

**Pros**
- Strong identity.
- Minimal protocol changes.
- Easy mapping from certificate to principal.

**Cons**
- Higher operational burden for client onboarding.

#### Option 2: SASL Over TLS

Keep TLS for confidentiality, then run an application-level auth handshake.

**Pros**
- Easier client onboarding.
- Supports username/password-style service identities.

**Cons**
- Requires secure verifier storage and handshake design.

### 7.4 Recommended Client Rollout

Phase security implementation like this:

- **Security Phase 1:** mTLS for peers, optional mTLS for clients, insecure mode still available in development only.  
- **Security Phase 2:** TLS mandatory, SASL or mTLS mandatory for clients, ACLs enforced.  
- **Security Phase 3:** SCRAM or stronger verifier-based auth replaces any transitional plaintext-equivalent password handling.

This ordering minimizes risk while keeping the first secure cut implementable. 

### 7.5 Authentication Handshake Requirements

If SASL is used, the protocol must gain explicit auth message types and connection-state gating.

At minimum, add:

- `AUTH_REQUEST`
- `AUTH_CHALLENGE`
- `AUTH_RESPONSE`
- `AUTH_SUCCESS`
- `AUTH_FAILURE`

These should be versioned within the existing binary protocol framework, which already supports typed messages and protocol versioning. 

### 7.6 Credential Storage

For password-based auth:

- Never store plaintext passwords.
- Store salted verifier material only.
- Separate principal store from ACL policy store.
- Restrict file permissions on credential material.
- Do not include secrets in config dumps or stack traces.

---

## 8. Authorization

Authorization is absent in v0.1, and the design explicitly allows any client to create or delete topics. 

That must change before production claims are made. 

### 8.1 Authorization Model

Use an explicit ACL engine keyed by:

- `principal`
- `resource_type`
- `resource_name`
- `action`

Recommended resource types:

- `topic`
- `consumer_group`
- `cluster`
- `broker_node`
- `internal_topic`

Recommended actions:

- `produce`
- `fetch`
- `create`
- `delete`
- `describe`
- `list`
- `join_group`
- `leave_group`
- `heartbeat`
- `commit_offset`
- `fetch_offset`
- `admin`
- `wal_inspect`
- `wal_verify`

### 8.2 Default Policy

- Deny by default.
- Explicit allow required.
- Internal topics such as offsets or metadata require elevated handling because they back core broker behavior. 
- Administrative operations require cluster-level permission and should never be implied by topic-level access.

### 8.3 Authorization Points

ACL checks must occur at all externally reachable broker operations:

- Produce. 
- Fetch. 
- Topic create/list/delete. 
- Metadata requests. 
- Join group, leave group, heartbeat. 
- Commit offset, fetch offset. 
- Cluster nodes and metadata CLI-backed operations. 
- WAL inspect and verify operations. 

### 8.4 Internal Operations

Internal broker actions must not route through external ACL policy in a way that deadlocks broker correctness. For example, internal offset writes and replication traffic should execute under system principals or internal-only authorization paths, not under whichever client triggered them. 

That distinction matters because offsets are stored in internal topics and replication is applied through the broker/consensus stack. 

---

## 9. Quotas and Abuse Control

The roadmap already identifies quota enforcement as future work, and the current system already has transport backpressure and connection tracking. 

Security hardening should treat quotas as part of abuse resistance, not just performance tuning. 

### Required Controls

- Maximum concurrent connections per listener.
- Maximum authenticated sessions per principal.
- Maximum frame size.
- Per-principal request rate limits.
- Per-principal produce byte quotas.
- Per-principal fetch bandwidth quotas.
- Authentication failure rate limiting to resist brute-force attempts.

### Failure Behavior

- Quota exceedance returns deterministic typed errors.
- Repeated auth failure can trigger temporary principal or source lockout.
- Broker remains available under abusive client behavior and avoids unbounded memory growth, which is consistent with the project’s existing backpressure goals. 

---

## 10. Secrets and Key Material

Security-sensitive material includes:

- TLS private keys.
- CA trust bundles.
- Password verifiers or auth database files.
- ACL policy files.
- Admin bootstrap credentials.
- Any token material added in future revisions.

### Requirements

- Secrets must never appear in logs.
- Secrets must never appear in metrics labels.
- Secrets must never be echoed back through CLI errors.
- File permissions for secret-bearing files must be validated at startup where the platform permits it.
- Private keys and auth database paths must be configurable separately from general runtime config.

### Rotation

For the first hardened release:

- Restart-based rotation is acceptable.
- In-process hot reload is optional.
- Rotation procedure must be documented and tested.

---

## 11. Auditability and Observability

The broker already supports structured JSON logging and correlation IDs. 

Security must extend that foundation so operators can answer who connected, who authenticated, who was denied, and what administrative actions were attempted. 

### Required Audit Events

- TLS handshake success and failure, without leaking secrets.
- Peer identity acceptance and rejection.
- Authentication success and failure.
- ACL allow and deny decisions for admin and security-sensitive operations.
- Principal creation, deletion, or credential rotation.
- ACL policy changes.
- Listener startup in insecure development mode.

### Log Requirements

Every security event log should include:

- Timestamp.
- Event type.
- Correlation ID when applicable. 
- Principal identity if known.
- Remote address.
- Listener type.
- Resource and action for authorization events.
- Outcome and reason code.

### Metrics Requirements

At minimum expose counters or gauges for:

- Auth successes.
- Auth failures.
- ACL denies.
- Peer validation failures.
- Active authenticated connections.
- Quota rejections.
- TLS listener status.

---

## 12. Failure Modes

The design doc already enumerates several system failures such as connection reset, split-brain prevention through majority semantics, disk full, and slow follower handling. 

The hardened security layer adds additional failure modes that must be explicitly handled. 

| Failure Mode | Detection | Required Response |
|---|---|---|
| Invalid client certificate | TLS handshake failure or identity mismatch | Reject connection, log audit event, increment security counter |
| Invalid peer certificate | Peer handshake failure or node ID mismatch | Reject peer connection, do not admit Raft traffic, alert operator |
| Wrong password or bad SASL exchange | Auth failure response | Reject or close connection after failure threshold, log reason |
| Missing ACL | Authorization deny | Return typed authorization error, log principal/resource/action |
| Expired certificate | TLS validation failure | Reject connection, surface expiry details safely |
| Secret file permission too broad | Startup validation | Fail fast in production mode |
| Auth backend unavailable | Startup or runtime check | Fail closed for new auth operations; preserve existing authenticated sessions only if explicitly allowed by policy |
| Certificate rotation mismatch across peers | Peer reconnect failures | Preserve quorum if majority remains; alert and block mismatched peer |
| Brute-force attempts | Elevated auth failure rate | Apply rate limit or temporary lockout, emit alert |
| Insecure mode enabled in production | Startup validation | Refuse to start unless explicit development override is set |

---

## 13. Secure Configuration Model

The current design already defines broker, cluster, storage, raft, protocol, transport, and consumer configuration families. 

The hardened security model should add a dedicated security section with explicit startup validation.

### Recommended Config Structure

```toml
[security]
mode = "production"                  # production | development
tls_enabled = true
client_auth_mode = "mtls"            # mtls | sasl_plain | sasl_scram
peer_auth_mode = "mtls"
acl_enabled = true
quota_enabled = true

[security.tls.client]
certfile = "/etc/tributary/client-listener.crt"
keyfile = "/etc/tributary/client-listener.key"
cafile = "/etc/tributary/ca.crt"
require_client_cert = true

[security.tls.peer]
certfile = "/etc/tributary/peer-listener.crt"
keyfile = "/etc/tributary/peer-listener.key"
cafile = "/etc/tributary/peer-ca.crt"
require_client_cert = true

[security.auth]
principal_store = "/etc/tributary/principals.json"

[security.acl]
policy_file = "/etc/tributary/acls.json"
default_decision = "deny"
```

### Validation Rules

- `mode=production` implies TLS enabled.
- `peer_auth_mode=mtls` is mandatory in production.
- `acl_enabled=false` is invalid in production.
- Missing cert/key/CA paths fail startup.
- Overly permissive secret file permissions fail startup where supported.
- Insecure development mode must require explicit operator acknowledgement.

---

## 14. Testing Strategy

The roadmap and architecture already establish strong unit, integration, and chaos testing discipline, including fault injection and connection-flood scenarios. 

Security testing should extend those patterns rather than creating a separate testing culture. 

### Unit Tests

- Principal parsing and identity normalization.
- ACL matcher behavior.
- Policy precedence and deny-by-default behavior.
- Secret redaction helpers.
- Auth state-machine transitions.
- TLS config validation.

### Integration Tests

- Authenticated client can produce/fetch when authorized.
- Authenticated client is denied when unauthorized.
- Unauthenticated client cannot issue normal requests.
- Peer with wrong certificate cannot join Raft traffic.
- Offsets and internal topics remain functional under ACL enforcement.
- Admin operations require cluster-admin privileges.

### Negative Tests

- Expired cert.
- Wrong CA.
- Wrong principal mapping.
- Missing ACL.
- Repeated bad-password attempts.
- Oversized frames from authenticated and unauthenticated clients.
- Mixed-version auth handshake failures.

### Chaos and Game-Day Tests

- Peer certificate rollover on one node.
- Client CA rotation.
- Authentication backend file corruption.
- Connection flood during auth failures.
- Majority-preserving peer-cert mismatch scenario.

---

## 15. Release Checklist

A security-hardened release is blocked until all of the following are complete.

### Transport
- [ ] TLS is enabled by default.
- [ ] Production mode refuses plaintext listeners.
- [ ] Peer traffic requires mTLS.
- [ ] Node identity is validated against peer identity.

### Authentication
- [ ] All non-development client traffic authenticates before request handling.
- [ ] Authenticated principal is attached to connection context.
- [ ] Failed auth attempts are rate-limited or otherwise controlled.
- [ ] No plaintext credential storage exists.

### Authorization
- [ ] ACL engine is deny-by-default.
- [ ] Produce, fetch, metadata, group, offset, and admin paths enforce ACLs.
- [ ] Internal broker operations have explicit system-principal handling.
- [ ] ACL changes are auditable.

### Secrets
- [ ] Secret-bearing files are redacted from logs and diagnostics.
- [ ] Startup validates secret file presence and permissions.
- [ ] Rotation procedure is documented and tested.

### Observability
- [ ] Security audit events are logged in structured form.
- [ ] Security counters are exported in metrics.
- [ ] Alerts exist for auth spikes, ACL denies, peer validation failures, and insecure mode use.

### Validation
- [ ] Unit, integration, and negative security tests pass.
- [ ] Peer-auth chaos scenarios pass.
- [ ] Development-mode bypasses are impossible in production mode.

---

## 16. Implementation Order

The recommended implementation sequence is:

1. **Separate listener security configuration** for client and peer paths. 
2. **TLS enablement** with production-mode validation.
3. **mTLS for peer traffic** with node ID binding.
4. **Connection auth state machine** for client traffic.
5. **ACL engine** integrated into request dispatch.
6. **Quota and abuse controls** for auth and request paths.
7. **Security audit logs and metrics** built on existing structured logging and metrics infrastructure. 
8. **Rotation and operational procedures**.
9. **Compatibility and migration notes** for client rollout.

This order reduces the risk of exposing partially secured request paths and aligns with the current broker layering, where transport and handler boundaries are already clear. 

---

## 17. Exit Criteria

Tributary security can be described as production-capable for its supported deployment scope only when:

1. Every production connection is encrypted.  
2. Every peer connection has verified node identity.  
3. Every client request runs under an authenticated principal.  
4. Every externally reachable operation enforces authorization.  
5. Secrets are protected in config, logs, and runtime behavior.  
6. Security failures fail closed and are operator-visible.  
7. The full security design is backed by repeatable tests and documented procedures.  

Until those criteria are met, Tributary should continue to be described as a trusted-network reference implementation with planned security hardening rather than a secure production broker. 