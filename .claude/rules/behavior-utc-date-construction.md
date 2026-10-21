---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs}"
---
# UTC Date Construction

Build calendar dates with `Date.UTC(year, month, day)`, never `new Date(year, month, day)`. The local constructor creates midnight in the machine's timezone, so the same calendar date yields different epoch ms on different machines — dedup keys, cache keys and date-range filters silently disagree.

For relative offsets, use epoch arithmetic (`Date.now() - days * 86_400_000`), not `setDate()` on a local date.

Pick one lane and stay in it. Never mix local methods (`getDate`, `setDate`, `getMonth`) with UTC ones (`getUTCDate`, `toISOString`) on the same value; the mismatch shifts the date by a day near midnight.

When displaying a UTC-constructed date, pass `timeZone: 'UTC'` to `toLocaleDateString` / `toLocaleString` / `Intl.DateTimeFormat`, because they format in local time by default: midnight UTC on the 1st renders as the last day of the previous month west of Greenwich.

## Pattern

```ts
const start = new Date(Date.UTC(2026, 0, 1))
start.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' })
```

Doesn't apply to instants (timestamps of events, "now"); those are already timezone-free epoch values. It applies when the value means a calendar day.

*Source: learned regression (finpulse — timezone-dependent dates, 3 occurrences).*
