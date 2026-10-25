---
title: "Roadmap"
project: human-markdown
date: 2026-10-25
---

# Roadmap

The one list of what gets built, in order. Build agents check entries off and add sub-plans under them; a planning session (`/foundry:plan`) adds, rescopes or reorders top-level entries. Migrated from the plans backlog and shipped list on 2026-10-25.

## Now

No active detailed plan selected.

## Next

_(none)_

## Later

- [ ] **cursor-position-mapping** — Map cursor position between raw mode (line:column) and WYSIWYG mode (ProseMirror node position) across mode toggles. Currently only scroll position is preserved. Non-trivial but nice-to-have.
- [ ] **custom-theming** — Custom CSS stylesheet injection (workspace-level `.human-markdown.css` auto-detected, or `humanMarkdown.customStylesheet` setting). Scoped under `.hm-content` parent selector to prevent editor UI breakage. Lets users preview markdown styled as their blog/site. Low priority — unclear if anyone would maintain a separate CSS file for this.
- [ ] **spell-checking** — Spell check in WYSIWYG view (rendered prose, not raw syntax). Blocked: VSCode sets `spellcheck: false` at the Electron BrowserWindow level ([#214367](https://github.com/microsoft/vscode/issues/214367)). Native browser spellcheck is not viable. Would require a JS-based spellcheck library (nspell + ProseMirror decorations) to implement.
- [ ] **export** — HTML standalone export, copy as rich text
- [ ] **search** — `Cmd+F` searches rendered content in WYSIWYG mode

## Shipped

Real VS Code Extension Host integration suite covering document sync, editor
state, multiple panels, round-trip fidelity, and UI smoke paths. Batches 1-6 are
complete: sync risk spine, core extension host behavior, mode/editor state,
multiple panels, round-trip fidelity in real VS Code, and toolbar/autosave/
conflict/find/image/link UI smoke tests.

CodeMirror raw editor embedded in the same webview as Milkdown WYSIWYG. Preview/Markdown toggle buttons in toolbar, Cmd+Shift+V keybinding. Extension owns .md files by default. Zoom compensation, font-family matching with generic fallback, syntax highlighting with VSCode-matching colors.

WYSIWYG editing, rendering, toggle, themes, stability. 7 epics, 37 tasks.

- [x] Epic 1: Project Scaffolding
- [x] Epic 2: Prototype Spike (GATE)
- [x] Epic 3: Extension Shell
- [x] Epic 4: Rendering Pipeline
- [x] Epic 5: WYSIWYG Editor
- [x] Epic 6: Theming
- [x] Epic 7: Stability & Security
