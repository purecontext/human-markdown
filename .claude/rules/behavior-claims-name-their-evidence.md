# Claims Name Their Evidence

A count, coverage word or measured decision in a PR body, task note or session context states what was actually checked. Reviewers read "all killed" or "enforced" as a guarantee.

- **Mutation counts come from the diff.** Enumerate one mutant per guard line the diff adds (each `if`, `continue`, `break`, set entry, config setting), plus fail-open twins. Don't reuse the previous round's script. Name every line you skipped and why ("`target`: no test can observe it"), in the same sentence as the count.
- **A measured decision gets a guard.** "X isn't needed, measured" (a banner, a polyfill, an exclusion) lands with a test that fails when the measurement stops holding. Without the test, write it as an observation dated to the version measured.
- **Coverage words name the forms.** Replace "every", "all", "enforced" and "covered" with the list of forms the tests exercise. If the list can't be complete, say so.
- **Correct the claim where it was made.** When a count or claim turns out wrong, fix the PR body or doc and say what the first version got wrong.

*Source: learned regression (tvforge — PR bodies claimed "69/69" and "12/12" mutants killed while guards added in the same diff had none, and a "measured, not needed" decision had no test; 2 + 2 occurrences).*
