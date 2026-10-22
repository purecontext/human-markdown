---
paths:
  - "webview/editor/*-loader.ts"
  - "webview/editor/*-view.ts"
  - "webview/editor/*-plugin.ts"
---

# Lazy Library Loaders Announce Themselves

Heavy libraries (Mermaid, Shiki, KaTeX) load as `async` IIFE bundles, so a node view can construct before its library exists. Every loader and every consumer follows one contract:

- **Loader:** set its `window.__<name>` globals, then dispatch `<name>-ready` **synchronously while the bundle runs**, never after an `await`. Async scripts delay the window `load` event, and waiters treat `load` as "the library failed"; a ready event fired later is lost.
- **Consumer:** when the library or anything it needs (such as `__sanitizeSvg`) is missing, render a fallback and wait through `createLibraryWaiter` (`webview/editor/library-ready.ts`). Never `return` and leave the view broken. Call `dispose()` in the view's `destroy`.
- **Failure:** pass `onUnavailable`. A view whose fallback is a loading message must swap it for an error once the page loads without the library. A view whose fallback is real content (plain code, plain YAML) can leave it.

Check: a new `*-loader.ts` dispatches its ready event synchronously, and every `getX()` null branch in a view either waits or renders final content.
