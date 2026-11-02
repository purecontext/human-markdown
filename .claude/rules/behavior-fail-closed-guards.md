# Fail-Closed Guards Get a Refusal Row

A guard that refuses the unexpected (`type !== 'user'`, an allowlist, an env default) ships untested when every row sends a value the guard was written to let through or an obvious bad one.

Write the row only the guard can refuse: send an unexpected value (missing, unknown enum, wrong case) and expect the refusal. Add a row for the input source production uses: one test calls with no argument, stubbing the real source and restoring it.

On every guard the row is the work, and "fails closed" in a PR body is a claim about it.
