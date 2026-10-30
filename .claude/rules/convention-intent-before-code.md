# Intent Changes Come Before Code

The intent docs (`docs/product/`, `docs/design/`, `docs/roadmap.md` entries, existing `docs/decisions/`) change only in a planning bout (`/foundry:plan`). A build branch reads them and does not edit them; otherwise the intent drifts to match whatever was built.

- **A task that needs the intent to change stops before the branch.** A changed requirement, user flow, PRD concept, accepted decision or roadmap scope: name the docs and lines; `/foundry:plan <feature>` edits them first. Never build the new intent and fix the docs after.
- **Found mid-task, it is a divergence, not an edit.** Finish what the intent covers and append to `docs/product/divergence.md`; the planning bout resolves it.
- **As-built docs are yours.** Everything else under `docs/`, `CLAUDE.md` and new ADRs change with the code. A build branch may check a roadmap entry off or add a sub-plan line, nothing else.
