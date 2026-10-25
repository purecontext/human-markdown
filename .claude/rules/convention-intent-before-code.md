# Intent Changes Come Before Code

The intent docs say what the product is meant to be: `docs/product/`, `docs/design/`, the entries of `docs/roadmap.md` (which ones, their scope, their order) and the existing files in `docs/decisions/`. They change only in a planning bout (`/foundry:plan`), on a planning branch. A build branch reads them and does not edit them.

- **A task that needs the intent to change stops before the branch.** If it alters a requirement or acceptance criterion, drops or changes a user flow, renames a concept the PRD defines, contradicts an accepted decision, or widens a roadmap entry past its one line: say which docs and lines, and that `/foundry:plan <feature>` edits them first. Do not implement the new intent and fix the docs after.
- **Found mid-task, it becomes a divergence, not an edit.** When implementation shows the intent is wrong or unbuildable as written, finish what the intent covers and append an entry to `docs/product/divergence.md` (kind, the intent quote with its path, what the code does, the date). The planning bout resolves it: change the intent, schedule the work, or drop it with a note.
- **As-built docs are yours.** `docs/architecture/`, `docs/guides/`, `docs/reference/`, `docs/plans/<slug>/`, `docs/README.md`, `CLAUDE.md` and a new ADR in `docs/decisions/` change with the code, in the same PR.
- **Roadmap edits a build branch may make:** checking an entry off, adding a sub-plan line under it. Nothing else.

*Source: Forge split design, 2026-10-23 (foundry owns intent, forge owns as-built; the build agent edited PRD scope in code PRs and the plan and the product silently diverged).*
