---
paths:
  - "src/**"
  - "webview/**"
---

# CustomTextEditorProvider Ownership (ADR-002)

All webview content goes through `CustomTextEditorProvider`. Do not create standalone `WebviewPanel` instances for preview or editing.

The raw mode toggle swaps between Milkdown and the embedded CodeMirror inside the same webview (ADR-007). Do not switch editor providers for it: `vscode.openWith` always opens a separate tab. `openWith` is only for opening a file in Human Markdown in the first place.

Dispose the webview only when the editor tab closes.

Any test-only command surface for the custom editor must be gated in both places it can execute: extension-host command registration and webview message handling. Production webviews must ignore test-only messages.
