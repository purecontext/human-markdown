# Fail-Closed Guards Get Fail-Open Twins

A guard whose job is to refuse the unexpected (`type !== 'user'`, an allowlist, an unset-means-default env read) passes a deletion check and can still ship untested. Deleting it breaks the obvious rows; weakening it breaks none of them.

When you write such a guard, write the row only it can refuse: a value outside both expected cases (missing, unknown enum value, wrong case). `!== 'user'` weakened to `=== 'system'`, or an allowlist turned denylist, passes every other row; this row is what tells the twin from the guard. Two more weakenings to think about while writing it:

- **The input source production uses.** A default parameter (`env = process.env`), a module-level read, a config path. If every test passes the input explicitly while the entry point calls with no argument, one test calls with no argument (stubbing the real source and restoring it afterwards).
- **Deletion.** The `behavior-test-adequacy` check, where you doubt the guard is observed at all.

On a declared safety boundary (`mutation.paths` in `.forge/config.json`) or a component documented as a guarantee, `/crucible:mutation-check` runs the three mutants (delete, twin, broken source) and a surviving twin is a finding. Elsewhere, the row is the work: no count, no every-guard pass.

A comment, ADR or PR body that says a check "fails closed" is a claim about the twin. Write it when the row exists, or when the runner's record shows the twin killed.

*Source: learned regression (mailpulse — fail-open twin and untested env default passed deletion-only checks, 2 occurrences). The three-way mutation of every guard was retired 2026-10-26: mutation checks are on demand.*
