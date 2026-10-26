# Human Markdown

A WYSIWYG markdown editor for VSCode. Open a markdown file, read it rendered, edit it inline. Toggle to raw with one keystroke. Theme it to match your blog or GitHub.

**Repo:** github.com/purecontext/human-markdown
**License:** MIT

## Git Workflow

Feature branches → PR → merge to main. Branch prefixes: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`. Never commit directly to main.

## Tech Stack

TypeScript (strict), pnpm, esbuild (dual CJS/ESM), Vitest, Biome, husky + lint-staged. Milkdown (ProseMirror + Remark) for WYSIWYG editing. Shiki for syntax highlighting. GitHub Actions for CI/CD.

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm build` | Build extension (extension host + webview) |
| `pnpm dev` | Watch mode |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm lint` | Lint + format check (Biome) |
| `pnpm lint:fix` | Auto-fix |
| `pnpm package` | Package as .vsix |
| `pnpm typecheck` | Type checking |
| `pnpm check` | Lint + typecheck + build + unit tests, in CI order (local pre-PR gate) |

F5 in VSCode launches the Extension Development Host for testing.

## Architecture

Two runtime contexts connected by `postMessage`:

- **Extension Host (Node.js):** `CustomTextEditorProvider` manages webview lifecycle and `TextDocument` sync. Configuration manager handles themes and settings.
- **Webview (Browser):** Milkdown editor for WYSIWYG editing. Shiki and Mermaid as separate IIFE bundles for code/diagram rendering. Theme engine applies CSS custom properties.

See `docs/README.md` for the docs index (`docs/product/`, `docs/architecture/`, `docs/roadmap.md`) and `docs/decisions/` for architectural decisions.

## Conventions

- Extension host source: `src/`, webview source: `webview/`. Never import across that boundary or assume the other context's APIs; everything crosses by `postMessage`. esbuild builds CJS for the host and ESM for the webview, never mixed in one bundle
- Theme tokens are CSS custom properties defined once (`webview/shared/theme`); no inline styles in the webview (ADR-008). There is no shared markdown-it pipeline: Milkdown renders through its own Remark pipeline and nodeViews (ADR-003 retired)
- Files: kebab-case. Classes: PascalCase. Functions/variables: camelCase.
- Tests co-located (`*.test.ts` next to source)
- Biome: single quotes, 2-space indent, 100 line width, semicolons as needed

## Testing

Unit tests with Vitest (`pnpm test`). Integration tests (`pnpm test:integration`) launch a real VS Code Extension Host and exercise custom-editor webview flows; the run needs an unsandboxed launch and a short `/tmp` root, so read `docs/architecture/testing.md` before debugging a launch failure. Focus on round-trip fidelity (markdown → edit → markdown), theme token injection, bundle size budgets, and editor state restoration.

## Development Roadmap

See `docs/roadmap.md` for the plan queue. The forge plugin provides development workflow skills (`/forge:next`, `/forge:ship`, `/forge:wrap`, etc.).
