---
paths:
  - "webview/**"
---

# Milkdown API Boundary (ADR-001)

All WYSIWYG editing goes through Milkdown's plugin API. Use Milkdown's plugin system to extend editor behavior — do not call ProseMirror APIs directly outside of plugin implementations.

No direct DOM manipulation in the webview for editing purposes. Content changes flow through Milkdown's document model, not the DOM.

*Source: docs/decisions/001-milkdown-wysiwyg-engine.md.*
