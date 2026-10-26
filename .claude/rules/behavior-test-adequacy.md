# Test Adequacy

A test earns its place only by failing when the behavior it names breaks:

- **Revert and run, where you doubt.** Revert a load-bearing line you doubt a test observes; its named test must fail alone. Guards have fail-open twins too (`behavior-fail-closed-guards`). A judgment, no count; `/crucible:mutation-check` does the pass on a declared boundary or documented guarantee.
- **Assert the claimed state, no tautologies.** Check the exact value or absence the name promises: no proxy, no recomputed production formula, nothing the type system already enforces. No independent derivation: measure once, encode the numbers.
- **Branches and glue.** A pure helper gets a case per branch and boundary, exported to test it. Wiring over tested parts needs its own test; deleting it must break one.

A line no test can observe is dead code.

*Source: purecontext-platform, evolution-sim, finpulse, healthpulse, tvforge — tests passed with the guarded line deleted.*
