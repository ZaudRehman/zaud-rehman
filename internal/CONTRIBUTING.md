# Contributing to Tributary

## Getting Started

1. Clone the repository
2. Install dev dependencies: `pip install -e ".[dev]"`
3. Run tests: `pytest`

## Code Standards

- **Type hints:** Required on all public functions (PEP 484)
- **Line length:** 100 characters max (enforced by ruff)
- **Zero runtime dependencies:** The core runtime must not import any package
  outside the Python standard library. Only the CLI may use `click` and `rich`.
- **Testing:** Every new feature requires tests. Every bugfix requires a regression
  test. Property-based tests (hypothesis) are preferred for protocol/storage logic.
- **Commits:** Conventional commit messages (feat:, fix:, docs:, test:, refactor:)

## Architecture Rules

- **Never** block the asyncio event loop. All disk I/O must use `run_in_executor`.
- **Never** use threads for broker logic. Only `os.pwrite` and `os.fsync` may use
  the thread pool executor.
- **Never** add a runtime dependency. If a feature requires a third-party package,
  it goes in `[project.optional-dependencies]`, not `dependencies`.
- **Always** verify CRC on every record read. Corrupt records are skipped, not
  returned to clients.
- **Always** make state mutations on the event loop thread. No locks needed if
  this rule is followed.
- **Always** handle connection reset gracefully. A dead consumer connection must
  trigger a group rebalance.

## Testing Checklist (for PRs)

- [ ] Unit tests for new modules
- [ ] Property-based tests for protocol/storage (hypothesis)
- [ ] Integration test if the change affects broker/consensus/consumer layers
- [ ] `pytest --cov` shows >90% line coverage for changed files
- [ ] `mypy --strict` passes with no errors
- [ ] `ruff check` passes with no errors
