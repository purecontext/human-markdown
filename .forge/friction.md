# Friction Log

## 2026-10-20 — chore/forge-housekeeping
**Friction:** Crucible round 1 found three problems. The new `check` script left out the build, a CLAUDE.md pointer to a nonexistent file survived, and a registry gate contradicted a project rule. Then `pnpm check` itself failed lint on the gitignored `.forge/dev-state.json`.
**Root cause:** The local gate was written without reading the CI workflow, and it was verified on a checkout that already had a `dist/`. A sentence was rewritten without checking the path it named. The gate sync never compared the regenerated gates against `.claude/rules/`. Biome didn't read `.gitignore`.
**Category:** crucible-rework

## 2026-10-21 — fix/webview-host-boundary
**Friction:** Crucible took 3 rounds. Round 1 found 5 fix-now items: a drive-letter scheme bypass, unbounded confirm modals, a missing `.catch`, a test seam above the side effects, and lexical-only containment. Round 2 found 2 more missing `.catch`es that round 1's fix had introduced.
**Root cause:** The test-hook branch returned before the side effects, so the integration tests proved only classification. Containment was designed lexically, without considering committed symlinks. The scheme regex wasn't checked against Windows paths. Fire-and-forget chains were written without the catch the rule requires.
**Category:** crucible-rework

## 2026-10-21 — fix/svg-sanitizer-allowlist
**Friction:** Crucible took 3 rounds plus a post-approval check. Round 1: no ready events for the lazy loaders, a CSP recorder that started too late, an uncaught Shiki highlighting promise, and ADR drift. Round 2: the new waiter hung when a bundle failed. During implementation, `pnpm dedupe` re-resolved Milkdown's tree and broke 7 round-trip tests; the lockfile was reverted and the upgrades redone as targeted adds.
**Root cause:** The lazy-loading ordering wasn't modelled when the fail-closed sanitizer check was added. `pnpm dedupe` was run as tidy-up without measuring its scope.
**Category:** crucible-rework
