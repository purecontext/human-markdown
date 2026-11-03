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
- **Branches and glue.** A pure helper gets a case per branch and boundary, exported to test it. Wiring over tested parts needs its own test.

A test that asserts less than its name claims hides the regression it was written to catch; a line no test exercises is unverified.
