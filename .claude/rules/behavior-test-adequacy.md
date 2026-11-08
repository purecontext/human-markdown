---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/*_test.*"
  - "**/test_*.*"
  - "**/test/**"
  - "**/tests/**"
  - "**/__tests__/**"
---
# Test Adequacy

A test earns its place only by failing when the behavior it names breaks:

- **Never mutate code to check a test.** No reverts, sweeps or survivor counts; judge a test by reading what it asserts.
- **Assert the claimed state, no tautologies.** Check the exact value or absence the name promises: no proxy, no recomputed production formula, nothing the type system already enforces. No independent derivation: measure once, encode the numbers.
- **Outside shapes from recordings.** A parser, validator or error mapping for what another program, device or runtime produces is tested over values recorded from it, kept as a fixture, with one row per failure mode triggered on the installed runtime; a shape written from memory or the docs refuses real values or passes a guess off as known, and one no recording holds gets its row marked `[Assumption: …]`.
- **Branches and glue.** A pure helper gets a case per branch and boundary, exported to test it. Wiring over tested parts needs its own test.

A test that asserts less than its name claims hides the regression it was written to catch; a line no test exercises is unverified.
