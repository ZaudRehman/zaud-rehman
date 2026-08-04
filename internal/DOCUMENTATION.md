# Documentation Standard — Tributary

**Project:** Tributary
**Status:** Draft
**Applies To:** v0.1.x line

## 1. Purpose

This document defines repository-wide documentation rules for Tributary.
It standardizes code docstrings, architecture docs, operational guides, testing docs, and user-facing package documentation so the project remains maintainable as a multi-module distributed system.

## 2. Documentation Principles

Tributary is not a toy script collection. It is a distributed persistent message broker with protocol, transport, storage, consensus, broker, consumer, client, CLI, observability, and testing surfaces.
Documentation must therefore be written as production-grade engineering documentation: precise, current, minimal in ambiguity, and explicit about guarantees, failure modes, and operating assumptions.

All documentation must satisfy these rules:

- Prefer exact behavior over aspirational wording.
- Distinguish implemented behavior from roadmap behavior.
- State invariants and failure modes, not only happy-path usage.
- Keep API reference close to code and system reference close to repository docs.
- Update docs in the same change that modifies public behavior.
- Do not hide important constraints in code comments only.

## 3. Documentation Set

The repository documentation is split by audience and purpose.
Every nontrivial feature must be documented in the correct layer rather than overloaded into `README.md`.

### 3.1 Required top-level documents

The repository should maintain these top-level documents:

- `README.md` — project purpose, quick start, installation, first successful workflow.
- `PRD.md` — product goals, non-goals, requirements, success metrics.
- `DESIGN.md` — internal design, data flow, trade-offs, guarantees.
- `ARCHITECTURE.md` — topology, deployment model, storage layout, network model, observability.
- `ROADMAP.md` — phase plan, implementation status, future scope.
- `OPERATIONS.md` — deployment, health checks, backup, restore, incident procedures.
- `TESTING.md` — test policy, invariants, release gates, deterministic test expectations.
- `SECURITY.md` — trust model, threat boundaries, current limitations, future hardening plan.
- `CONTRIBUTING.md` — development workflow, quality gates, commit expectations, doc-update policy.
- `CHANGELOG.md` — user-visible behavior changes by version.

### 3.2 Audience split

Use these document classes consistently:

- **Tutorial:** a guided first run for new users.
- **How-to guide:** a task-oriented procedure such as restoring a node or verifying a WAL.
- **Explanation:** why the design works the way it does and what trade-offs were chosen.
- **Reference:** exact API, protocol, config, and command behavior.

A single document may contain more than one class only when the boundary is still obvious.
Do not mix deep design rationale into quick-start instructions.

## 4. Source of Truth Rules

Each documentation type has a primary source of truth:

- Public behavior and guarantees: code plus tests.
- Package metadata, dependency policy, and supported Python versions: `pyproject.toml`.
- Current implementation status: `ROADMAP.md`.
- Product intent and non-goals: `PRD.md`.
- Internal behavior and trade-offs: `DESIGN.md` and `ARCHITECTURE.md`.
- Operator procedures: `OPERATIONS.md`.
- Test expectations and release gates: `TESTING.md`.

If a conflict exists, resolve it immediately in code and docs within the same change.
Never leave contradictory statements across `README.md`, design docs, and CLI help text.

## 5. Docstring Standard

Tributary follows PEP 257 semantics for docstrings, with one repository-wide style applied consistently.
The chosen house style is Google-style docstrings with imperative one-line summaries, because they read cleanly in source and can be rendered easily by standard Python tooling.

### 5.1 Objects that require docstrings

A docstring is required for:

- Every public module.
- Every public class, dataclass, enum, exception, and protocol.
- Every public function and method.
- Every `async` public function and method.
- Every CLI command callback that implements externally visible behavior.

A docstring is not required for:

- Private helpers whose purpose is obvious and local.
- Test-local fixtures with narrow scope and self-explanatory names.
- Trivial `__repr__`, `__str__`, or one-line wrappers unless behavior is non-obvious.

### 5.2 One-line summary rule

The first line must be a short imperative summary ending with a period.
Examples:

- `"""Encode a message body into the Tributary wire format."""`
- `"""Recover a partition WAL from on-disk segments."""`
- `"""Return broker metadata for all known topics."""`

Avoid weak summaries such as:

- `"""This function is used to..."""`
- `"""Helper function."""`
- `"""Handles produce."""`

### 5.3 Multi-line structure

Use this structure for multi-line docstrings:

```python
async def fetch(self, offset: int, max_bytes: int, max_wait_ms: int) -> list[Record]:
    """Fetch records from the partition.

    Return records beginning at ``offset`` up to ``max_bytes``. If no records are
    currently available, wait up to ``max_wait_ms`` before returning an empty list.

    Args:
        offset: Partition-relative starting offset.
        max_bytes: Maximum response payload size in bytes.
        max_wait_ms: Long-poll wait budget in milliseconds.

    Returns:
        A list of records in strictly increasing offset order.

    Raises:
        ValueError: If ``offset`` is negative.
        StorageError: If the WAL cannot be read.
    """
```

### 5.4 Required sections for public callables

Use sections only when they add information. For public APIs, the default allowed sections are:

- `Args:`
- `Returns:`
- `Raises:`
- `Yields:`
- `Attributes:`
- `Example:` or `Examples:`
- `Notes:`
- `Warnings:`

Do not add sections for type information already obvious from hints unless semantics need clarification.
Docstrings must explain meaning and constraints, not rephrase type annotations.

### 5.5 Async-specific rules

For `async def`, explicitly document:

- Whether the method performs network I/O, disk I/O, or both.
- Whether it may block on backpressure, leader election, or long-poll waits.
- Whether cancellation is safe and what state remains durable after cancellation.
- Ordering or concurrency assumptions if they matter.

This is mandatory in modules such as `transport`, `storage`, `consensus`, `broker`, and `client`.

### 5.6 Exception documentation

Document raised exceptions when callers are expected to handle them or when failure semantics are part of the contract.
Do not list impossible or fully internal exceptions just to appear thorough.

### 5.7 Dataclass and enum documentation

Public dataclasses must have a class docstring describing the concept and any invariants.
Field-level meaning should be documented in an `Attributes:` section when names alone are insufficient.

Example:

```python
@dataclass(frozen=True)
class Record:
    """Represent an immutable WAL record.

    Attributes:
        offset: Partition-relative monotonic offset.
        timestamp: Unix epoch time in milliseconds.
        key: Optional partitioning key.
        value: Serialized message payload.
        crc32c: CRC of the encoded record body.
    """
```

## 6. Module Documentation

Every public module must begin with a module docstring.
The module docstring must help a reader decide whether they are in the right file before they scroll through implementation details.

### 6.1 Required module docstring content

A public module docstring should normally include:

- The module responsibility.
- The primary exported types or functions.
- Key invariants or constraints.
- Important failure behavior, if relevant.
- Any concurrency or performance assumptions for low-level modules.

Example module skeleton:

```python
"""Implement segment-based WAL storage.

This module defines immutable record encoding, append-only segment files, sparse
index lookup, and crash recovery helpers for partition storage.

The append path guarantees monotonic offsets and CRC validation. Read paths are
optimized for mmap-backed sequential fetch and indexed point lookup.
"""
```

### 6.2 Modules that require stronger detail

The following modules must document invariants and failure semantics explicitly:

- `tributary.protocol`
- `tributary.transport`
- `tributary.storage`
- `tributary.consensus`
- `tributary.broker`
- `tributary.consumer`
- `tributary.client`

These are not convenience modules; they define externally relevant system behavior.

## 7. Comment Policy

Comments are allowed only when they add information not obvious from well-named code and docstrings.
Use comments for protocol edge cases, crash-recovery subtleties, concurrency hazards, binary layouts, and rationale that would otherwise be lost.

Do not use comments to narrate code line by line.
Do not use stale comments that repeat names without explaining why the code is shaped a certain way.

Allowed comment categories:

- Non-obvious invariants.
- Wire-format offsets and binary-layout notes.
- Crash-recovery reasoning.
- Concurrency or cancellation hazards.
- Compatibility caveats.
- Security-relevant assumptions.

## 8. README Standard

`README.md` is the entry point, not the full manual.
It must remain concise enough for a first visit while still proving the project is real and runnable.

### 8.1 README required sections

`README.md` must include:

- Project summary.
- Why the project exists.
- Feature list matching implemented behavior only.
- Installation instructions.
- Quick-start example for a local cluster or single-node flow.
- CLI entrypoint examples.
- Link map to deeper docs.
- Development and test entrypoints.
- Current limitations and trust model.

### 8.2 README forbidden patterns

Do not:

- Promise roadmap features as if they already exist.
- Paste large internal architecture explanations into the README.
- Duplicate complete CLI reference tables that belong in dedicated docs.
- Mix operator runbooks with onboarding content.

## 9. API and CLI Reference Rules

Reference documentation must be exact, dense, and mechanically reviewable.
If a command, config key, message type, or public method exists, its documented inputs and outputs must match implementation names exactly.

### 9.1 Public Python API reference

For each public class or function, document:

- Purpose.
- Parameters.
- Return value.
- Exceptions or error results.
- Ordering, durability, or retry semantics where relevant.
- Thread-safety or event-loop expectations if relevant.

### 9.2 CLI reference

For each CLI command, document:

- Command synopsis.
- Required arguments.
- Optional flags with defaults.
- Output shape.
- Exit behavior on expected failure modes.
- One minimal example.

CLI documentation must match `--help` output in naming and defaults.
If the implementation changes a flag name, the docs change in the same commit.

### 9.3 Protocol and config reference

Protocol docs must specify exact field names, sizes, encoding, versioning rules, CRC behavior, and message-type semantics.
Config docs must specify default values, units, valid ranges, and failure behavior for invalid configuration.

## 10. Architecture and Design Docs

Architecture and design docs must explain why the system is built as it is, not merely restate code structure.
They must also distinguish between current implementation and future intent.

### 10.1 Required content for design-grade docs

Design and architecture documents should cover:

- Problem constraints.
- Topology and process model.
- Data model and storage layout.
- Wire protocol and state transitions.
- Concurrency model.
- Performance characteristics and bottlenecks.
- Failure modes and recovery behavior.
- Security posture and explicit non-goals.
- Trade-offs and rejected alternatives.

### 10.2 Documentation of non-goals

Non-goals must be written explicitly when omission could be mistaken for a bug.
Examples for Tributary include lack of TLS, ACLs, or internet-hardened deployment in v0.1.

## 11. Testing and Operations Documentation Rules

Testing and operations docs are mandatory for distributed systems work of this size.
These are not auxiliary notes; they are part of the deliverable.

### 11.1 Testing docs

`TESTING.md` must document:

- Test layers.
- Invariants.
- Property-based testing scope.
- Determinism requirements.
- Chaos and failure-injection strategy.
- Release gates.

### 11.2 Operations docs

`OPERATIONS.md` must document:

- Deployment shape.
- Startup and shutdown.
- Health checks.
- Backup and restore.
- Routine administration.
- Incident runbooks.
- Recovery standards.

## 12. Security Documentation Rules

If a security feature does not exist, say so plainly.
Do not imply protections that the current implementation does not enforce.

`SECURITY.md` must include:

- Current trust model.
- Authentication and encryption status.
- Authorization status.
- Secure deployment assumptions.
- Known limitations.
- Planned hardening features separated clearly as future work.

Security wording must avoid ambiguous phrases such as `enterprise-ready`, `secure`, or `production-grade` unless the document scopes those claims precisely.

## 13. Change-Coupled Documentation Policy

Documentation updates are required in the same pull request or change set when any of the following change:

- Public Python API.
- CLI flags or behavior.
- Config schema or defaults.
- Protocol fields or message semantics.
- Storage layout or recovery behavior.
- Consensus behavior visible to operators or clients.
- Metrics names or structured log shape.
- Security assumptions.
- Test gates or required workflows.

A change is incomplete if code merges without the corresponding documentation delta.

### 13.1 Minimum reviewer checklist

Every nontrivial review should ask:

- Did any public behavior change?
- Did any operator behavior change?
- Did any invariant or failure mode change?
- Did any example command or config become stale?
- Did any docstring contract diverge from tests?

If the answer is yes, documentation changes are required before approval.

## 14. Style Rules

Use plain, technical English.
Write short declarative sentences when defining behavior and slightly longer paragraphs when explaining trade-offs.

### 14.1 Required style

- Prefer present tense for current behavior.
- Use RFC-style words only when intentional: `must`, `must not`, `should`, `may`.
- Define units explicitly: `ms`, `seconds`, `bytes`, `records`, `partitions`.
- Use exact identifiers for code symbols, flags, paths, and message types.
- Prefer tables for config keys, message fields, and command matrices.
- Prefer numbered procedures for operator workflows.

### 14.2 Forbidden style

- Marketing adjectives without measurable meaning.
- Vague phrases like `handles stuff`, `various errors`, or `fast enough`.
- Unbounded claims like `never loses data` unless scoped to a documented guarantee.
- Future tense in reference docs for already implemented features.
- Undocumented abbreviations introduced without expansion.

## 15. Examples Policy

Examples must be runnable, minimal, and aligned with the actual CLI and public APIs.
Do not include pseudo-APIs or aspirational code snippets in reference material.

Rules for examples:

- Keep examples small enough to read in one pass.
- Show imports explicitly for Python API examples.
- Use realistic values for node IDs, ports, topics, and offsets.
- Prefer examples that demonstrate one concept at a time.
- Mark partial or schematic examples clearly when they are not copy-paste runnable.

## 16. Documentation Quality Gates

Documentation is part of release quality.
A release candidate is not documentation-complete unless all required documentation classes are current.

### 16.1 Merge gate

Before merge, confirm:

- Public docstrings exist for changed public APIs.
- README examples still work.
- CLI names and defaults match implementation.
- Design or architecture docs reflect any behavior-level changes.
- Testing and operations docs reflect changes that affect operators or contributors.
- Security docs reflect current, not aspirational, posture.

### 16.2 Release gate

Before release, confirm:

- Top-level docs are internally consistent.
- Quick-start path is runnable.
- Operational procedures match current storage and cluster behavior.
- Test instructions match current pytest markers and tooling.
- Version-specific behavior changes are captured in `CHANGELOG.md`.

## 17. Recommended Repository Mapping

Use this mapping as the default documentation responsibility model:

| Area | Primary doc location |
|---|---|
| Installation and first run | `README.md` |
| Product goals and non-goals | `PRD.md` |
| System internals and trade-offs | `DESIGN.md` |
| Topology and deployment patterns | `ARCHITECTURE.md` |
| Phase status and future work | `ROADMAP.md` |
| Operator runbooks | `OPERATIONS.md` |
| Test policy and release gates | `TESTING.md` |
| Security posture | `SECURITY.md` |
| Contributor workflow | `CONTRIBUTING.md` |
| Versioned user-visible changes | `CHANGELOG.md` |
| Public API semantics | docstrings + generated API reference |

## 18. Default Templates

### 18.1 Public function template

```python
def create_topic(name: str, partitions: int, replication_factor: int) -> Topic:
    """Create a topic in the broker.

    Validate the requested topic shape and register the topic with the local
    topic manager.

    Args:
        name: Unique topic name.
        partitions: Number of partitions to create.
        replication_factor: Number of replicas requested for each partition.

    Returns:
        The created topic metadata object.

    Raises:
        ValueError: If the topic definition is invalid.
        TopicExistsError: If the topic already exists.
    """
```

### 18.2 Public class template

```python
class TributaryProducer:
    """Produce messages to Tributary brokers.

    This client batches messages, refreshes metadata as needed, and sends produce
    requests to the current partition leader.

    Attributes:
        batch_size: Maximum messages buffered before flush.
        batch_timeout_ms: Maximum delay before automatic flush.
        acks: Required acknowledgement level for produce requests.
    """
```

### 18.3 Module template

```python
"""Implement Raft leader election and log replication.

This module defines the broker-local consensus engine used for leader election,
heartbeat processing, replicated log management, and commit advancement.

The implementation assumes a single asyncio event loop per node and persists term,
vote, and log state to disk.
"""
```

## 19. Final Rule

If a future maintainer cannot answer `what does this do`, `what does it guarantee`, `how does it fail`, and `where do I operate it` without reading implementation details, the documentation is incomplete.
