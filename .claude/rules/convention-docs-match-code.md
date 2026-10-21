---
paths:
  - "docs/**"
  - "**/*.md"
---

# Docs Match Code

Specs, plans, and task descriptions are load-bearing: later tasks build against them. Every claim in one is checked against its source before it is written.

- **Derived numbers:** recompute from every row, not the headline one. A ratio that varies across rows is a range, not an average.
- **Lists that read as complete** ("all callers", "covers steps 3–5"): count against the source of truth (grep, the enum, the schema). If a list can't be complete, say "not exhaustive" or "as of <version>".
- **Facts about an external system** (another repo, a runtime, an engine) come from its code, with the file it came from, not from its design prose.
- **Plans name goals, constraints, and verification.** They don't pre-design refactors; the traced inventory is the task's first deliverable.

## When something changes

When implementation finds a constraint that invalidates documented behavior, or an interface's contract changes, grep the docs for every forward-looking mention (plan criteria, specs, schema comments, shared type docs) and fix them all in the same commit. Fixing only the summary bullet you were editing leaves the next task building against the old contract. Leave historical records (ADRs, changelogs, completed-task notes) alone.

*Source: learned regressions (rustforge — 6 review rounds on unverified doc claims; purecontext-platform — plan criteria drifted from the endpoint; blender-workbench — target facts copied from prose were wrong).*
