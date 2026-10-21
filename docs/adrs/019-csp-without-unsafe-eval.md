# ADR-019: CSP Without unsafe-eval

## Status

Accepted. Supersedes [ADR-011](011-csp-unsafe-eval-mermaid.md).

## Context

ADR-011 added `'unsafe-eval'` to `script-src` because Mermaid was found to crash the webview without it. In October 2026, the webview→host security work (PRs #143, #144) re-tested that finding against the shipped bundles:

- **No real eval in Mermaid.** The Mermaid bundle contains no `new Function(` or `eval(`. Its `Function("return this")` calls are lodash-style global lookups (`freeGlobal || freeSelf || Function("return this")()`). In a browser `self` is defined, so the expression short-circuits and `Function` never runs.
- **Mermaid renders without it.** With `'unsafe-eval'` removed, Mermaid 11.15.0 and 11.17.2 both render sequence, class, state, ER, gantt, pie, journey, gitGraph, mindmap, timeline, quadrant, XY and flowchart diagrams. The webview reports no `securitypolicyviolation`.
- **Shiki was the real dependency.** The one thing in the build that needed an eval allowance was Shiki. `shiki-loader.ts` had drifted from [ADR-017](017-shiki-selective-grammars.md): it called `createHighlighter` from the full `shiki` entry. That entry bundles every grammar plus the WASM Oniguruma engine, and compiling the WASM needs `wasm-eval`, which `'unsafe-eval'` silently granted. Without it, highlighting failed with no visible error.

Whether ADR-011's original crash came from an older Mermaid or from this Shiki path can no longer be determined.

## Decision

- Remove `'unsafe-eval'` from the webview CSP. `script-src` is nonce plus `webview.cspSource` only.
- Restore ADR-017's design in `shiki-loader.ts`: `shiki/core`, static imports from `@shikijs/langs` and `@shikijs/themes`, and `createJavaScriptRegexEngine()` in its strict mode. For all 15 configured languages, the strict JS engine's tokens match the Oniguruma engine's.
- Guard both with integration tests:
  - With test hooks on, the webview records every `securitypolicyviolation`.
  - The tests require zero violations, highlighted code blocks, and rendered diagrams across the diagram types above.

## Alternatives Considered

1. **Keep `'unsafe-eval'`.** Rejected: nothing in the build needs it, and it lets an XSS foothold turn strings into code.
2. **Replace it with `'wasm-unsafe-eval'` and keep the full Shiki bundle.** Narrower, but it leaves ADR-017 violated. It also keeps a 1.6MB-gzipped Shiki bundle (1,640KB); the core build is 207KB.

## Consequences

### Positive

- The CSP no longer allows string-to-code evaluation or WASM compilation.
- The Shiki bundle drops from 9.2MB raw (1,640KB gzipped) to 1.6MB raw (207KB gzipped), about 8x smaller gzipped.
- CSP regressions now fail the test suite instead of failing silently in the field.

### Negative

- A future library that genuinely needs eval or WASM will fail these tests. That is intended: it has to justify a CSP change in a new ADR.
- Languages outside the 15 imported grammars stay unhighlighted. Adding one is an import in `shiki-loader.ts`.

## Related Decisions

- [ADR-011](011-csp-unsafe-eval-mermaid.md): superseded by this ADR
- [ADR-017](017-shiki-selective-grammars.md): Shiki core with the JS regex engine (now implemented as written)
- [ADR-005](005-heavy-libraries-iife-bundles.md): heavy libraries as IIFE bundles
