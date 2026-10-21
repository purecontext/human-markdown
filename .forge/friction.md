# Friction Log

## 2026-10-20 — chore/forge-housekeeping
**Friction:** Crucible round 1 found three problems. The new `check` script left out the build, a CLAUDE.md pointer to a nonexistent file survived, and a registry gate contradicted a project rule. Then `pnpm check` itself failed lint on the gitignored `.forge/dev-state.json`.
**Root cause:** The local gate was written without reading the CI workflow, and it was verified on a checkout that already had a `dist/`. A sentence was rewritten without checking the path it named. The gate sync never compared the regenerated gates against `.claude/rules/`. Biome didn't read `.gitignore`.
**Category:** crucible-rework
