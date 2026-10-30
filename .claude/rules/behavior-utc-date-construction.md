---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs}"
---
# UTC Date Construction

Pick one lane per calendar-day value and stay in it. Never mix local methods (`getDate`, `setDate`, `getMonth`) with UTC ones (`getUTCDate`, `toISOString`) on the same value; the mismatch shifts the date by a day near midnight.

Where the code has no lane yet, use UTC: build calendar dates with `Date.UTC(year, month, day)`, not `new Date(year, month, day)`. The local constructor creates midnight in the machine's timezone, so the same calendar date yields different epoch ms on different machines — dedup keys, cache keys and date-range filters silently disagree. For relative offsets, use epoch arithmetic (`Date.now() - days * 86_400_000`), not `setDate()` on a local date.

Where calendar days are already handled consistently in local time (dates that mean "the day on the user's wall clock" and never become keys compared across machines), stay local. Converting one call site to UTC is the mixing this rule exists to prevent.

When displaying a UTC-constructed date, pass `timeZone: 'UTC'` to `toLocaleDateString` / `toLocaleString` / `Intl.DateTimeFormat`, because they format in local time by default: midnight UTC on the 1st renders as the last day of the previous month west of Greenwich.

## Pattern

```ts
const start = new Date(Date.UTC(2026, 0, 1))
start.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' })
```

Doesn't apply to instants (timestamps of events, "now"); those are already timezone-free epoch values. It applies when the value means a calendar day.
