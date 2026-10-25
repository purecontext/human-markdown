# Fail-Closed Guards Get Fail-Open Mutations

A guard whose job is to refuse the unexpected (`type !== 'user'`, an allowlist, an unset-means-default env read) passes a deletion-only mutation check and can still ship untested. Deleting it breaks the obvious rows; weakening it breaks none of them.

For each such guard, mutate it three ways and confirm a test fails each time:

- **Delete it.** The `behavior-test-adequacy` check.
- **Swap it for its fail-open twin.** `!== 'user'` becomes `=== 'system'`, an allowlist becomes a denylist. Then add a row with a value outside both expected cases (missing, unknown enum value, wrong case) that only this guard can refuse. Without that row, the twin is indistinguishable.
- **Break the input source production uses.** A default parameter (`env = process.env`), a module-level read, a config path. If every test passes the input explicitly while the entry point calls with no argument, replace the default with an empty value and confirm a test that calls with no argument (stubbing the real source and restoring it afterwards) fails.

A comment, ADR, or PR body that says a check "fails closed" is a claim about the twin mutation. Write it only after that mutation has been shown to fail a test.

*Source: learned regression (mailpulse — fail-open twin and untested env default passed deletion-only checks, 2 occurrences).*
