# Extract on the Second Copy

When a helper or a non-trivial expression is about to appear in a second file, extract it to a shared module first and give it a unit test. Pasting "the established pattern" is still duplication; copies drift, and a fix lands in one of them.

Within a single file, two similar lines are fine. The trigger is the second file, or the third copy anywhere.

*Source: learned regression (finpulse — one inline pattern grew to 18 copies).*
