# Test Adequacy

A test earns its place only if it fails when the behavior it names breaks. Before calling code tested, prove it:

- **Revert and run.** For each load-bearing line the diff adds (guards, filters, writes, wakes, validation, cleanup), revert it and confirm the test named for it fails when run alone. Enumerate from the diff, not memory; the lines that don't come to mind are the ones that ship untested. For `if (cond) act()`, mutate both ways: drop the call, and drop only the guard.
- **Assert the claimed state.** Check the exact value or absence the test name promises, not a proxy that holds either way.
- **No tautologies.** Don't test what the compiler or type system already enforces, and don't recompute the production formula in the assertion. Test errors, ranges, boundaries, round-trips, and invariants.
- **Branches and boundaries.** A pure helper with branches gets a case per branch and per boundary; export it to test it.
- **Test the glue.** A function that composes tested parts still needs tests for the wiring it adds itself. If deleting that wiring breaks no test, coverage is missing.

A line no test can observe changes no output: it is dead code. Remove it instead of testing it.

*Source: learned regressions (purecontext-platform, evolution-sim, finpulse, healthpulse — tests that passed with the guarded line deleted).*
