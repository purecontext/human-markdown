---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs}"
---
# Safe Number Conversion

Never call bare `Number()` (or unary `+`) on user input: query params, URL search params, form values, headers. `Number('abc')` is `NaN`, which flows through arithmetic and database comparisons without error and returns an empty result indistinguishable from "no data." `Number('')` is `0`, so a blank field becomes a real filter.

Parse through one shared helper that returns `undefined` for anything that isn't a finite number, and let the caller decide between a default and a 400.

## Pattern

```ts
export function safeNumber(value: string | null | undefined): number | undefined {
  if (value == null || value.trim() === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}
```

Use it on both sides: server-side request parsing and client-side URL-state parsing. Keep one helper per side, not an inline copy per route. Where the value must be an integer or in a range, validate after parsing (or use a schema validator that rejects instead of coercing).

Doesn't apply to values the program produced itself (its own JSON, typed config): there `NaN` means a bug upstream, and it should fail loudly.

*Source: learned regression (finpulse — NaN propagated to silent empty results, 3 occurrences).*
