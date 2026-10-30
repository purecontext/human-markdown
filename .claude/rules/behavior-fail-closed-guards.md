# Fail-Closed Guards Get Fail-Open Twins

A guard that refuses the unexpected (`type !== 'user'`, an allowlist, an env default) passes a deletion check and ships untested: deleting it breaks the obvious rows, weakening it breaks none.

Write the row only the guard can refuse: a value outside both cases (missing, unknown enum, wrong case). `!== 'user'` weakened to `=== 'system'`, or an allowlist turned denylist, passes every other row. Cover two more: the input source production uses (one test calls with no argument, stubbing the real source and restoring it), and deletion (the `behavior-test-adequacy` revert).

On a declared safety boundary (`mutation.paths`) or a documented guarantee, `/crucible:mutation-check` runs the three mutants and a surviving twin is a finding. Elsewhere the row is the work, and "fails closed" in a PR body is a claim about it.
