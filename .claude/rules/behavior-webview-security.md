# Webview Security

Every webview must set a strict Content Security Policy:
- `script-src` uses nonces, `webview.cspSource`, and `unsafe-eval` — no inline scripts, no `javascript:` URIs. `unsafe-eval` is required because mermaid's dependency tree uses `Function("return this")` to resolve the global object (ADR-011). Heavy libraries (mermaid) are loaded as separate IIFE bundles via static `<script>` tags, not dynamic `import()` (which doesn't work in `vscode-webview://`).
- `style-src` allows inline styles (needed for theme CSS custom properties)
- No `connect-src` — no network requests from the webview

## The extension host is the boundary

The webview renders untrusted markdown (cloned READMEs, PR branches), so assume script can run in it. The sandbox denies it the filesystem, Node and fetch, but not `postMessage` to the fully privileged host, and `img-src https:` can still carry data out. Defend at the host:

- Every webview message passes `parseWebviewMessage` (`src/webview-message-guard.ts`) before any handler sees it. A new message type gets a parser and a drop test there.
- Links go through `classifyHref` (`src/link-policy.ts`): http/https/mailto open, `command:`/`file:`/`javascript:`/`data:` are refused, any other scheme needs a modal naming the full URL. Relative links and image paths stay inside the workspace or document folder via `isPathContained`.

## Rendering hygiene

Escape all frontmatter values before rendering. Never use `innerHTML` with user-provided data — use DOM APIs or a sanitization library. Run Mermaid with `securityLevel: 'strict'` and KaTeX in strict mode; both parse untrusted input.

Each sink that handles untrusted markup keeps adversarial tests next to it: the SVG sanitizer, frontmatter escaping, the message guard, and the link policy. Output containing `<script`, `onerror`, `javascript:`, or an unescaped event-handler attribute fails the test. A new sink gets its own tests in the same PR.
