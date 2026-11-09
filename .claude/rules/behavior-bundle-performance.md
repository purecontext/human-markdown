---
paths:
  - "webview/**"
  - "esbuild.config.mjs"
  - "package.json"
---

# Bundle Size and Performance

Use selective Milkdown imports, not the Crepe batteries-included bundle, because Crepe alone is 415KB gzipped of the 520KB budget below. Import only the specific plugins needed.

Lazy-load heavy rendering plugins (Mermaid, KaTeX) — only load them when the document contains those block types. Do not include them in the initial bundle.

Performance targets:
- File open to rendered content: < 200ms for files under 500 lines
- Mode toggle (WYSIWYG ↔ raw): < 100ms perceived
- Block edit to re-render: < 50ms
- Webview bundle: < 520KB gzipped
