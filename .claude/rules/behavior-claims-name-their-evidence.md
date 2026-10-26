# Claims Name Their Evidence

A count, coverage word or measured decision in a PR body, task note or session context states what was actually checked. Reviewers read "all killed" or "enforced" as a guarantee.

- **A mutation count is the runner's sentence or nothing.** When `/crucible:mutation-check` ran, its sentence is the PR body's count, verbatim. When it did not run, write no count: say in words which lines you reverted and ran, and leave "every guard tested" unwritten. A hand-written count is the overclaim class this rule comes from.
- **A claim names its reach tier.** A check documented as a guarantee ("refuses any…", "never…") is held to every way it can fail. A check documented as best-effort names what it does not reach, in the doc that describes it, and is held to that list. The project's CLAUDE.md names its safety boundaries; a component inside them is a guarantee whatever its docs say, one outside them may be best-effort. Pick the tier when you write the doc, not when review finds the hole.
- **A measured decision gets a guard.** "X isn't needed, measured" (a banner, a polyfill, an exclusion) lands with a test that fails when the measurement stops holding. Without the test, write it as an observation dated to the version measured.
- **Coverage words name the forms.** Replace "every", "all", "enforced" and "covered" with the list of forms the tests exercise. If the list can't be complete, say so.
- **Correct the claim where it was made.** When a count or claim turns out wrong, fix the PR body or doc and say what the first version got wrong.

*Source: learned regression (tvforge — PR bodies claimed "69/69" and "12/12" mutants killed while guards added in the same diff had none, and a "measured, not needed" decision had no test; 2 + 2 occurrences). The hand-enumerated count this rule once asked for was retired 2026-10-26: mutation checks are on demand.*
