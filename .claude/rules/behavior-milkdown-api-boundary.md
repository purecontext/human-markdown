---
paths:
  - "webview/**"
---

# Milkdown API Boundary (ADR-001)

When changing how the WYSIWYG editor behaves, do it through Milkdown's plugin API; do not call ProseMirror APIs directly outside of plugin implementations.

No direct DOM manipulation in the webview for editing purposes. Content changes flow through Milkdown's document model, not the DOM, because remark serializes from that model: an edit made only in the DOM is lost on save.
