---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs}"
---
# Catch Fire-and-Forget Promises

Every promise nobody awaits gets a `.catch()`. An unhandled rejection crashes a Node process by default, and in the browser it vanishes into the console with no recovery.

## What to check

- `doWork().then(...)` with no `.catch()` — append `.catch((err) => log(err))`.
- A promise chained inside a `new Promise()` executor — route failures to the outer promise: `.then(resolve).catch(reject)`. A throw inside `.then` does not reach the outer `reject` on its own.
- An `async` function passed as an event handler (`emitter.on('x', async () => ...)`, `setTimeout(async () => ...)`) — the emitter ignores the returned promise. Wrap the body in `try/catch`.
- `void doWork()` silences the lint rule, not the rejection. It still needs a `.catch()`.

## Pattern

```ts
emitter.on('message', (msg) => {
  handle(msg).catch((err) => logger.error('message handler failed', err))
})
```

Omit the `.catch()` only when the caller awaits the promise and handles rejection there. Fire-and-forget means nobody awaits, so the rejection has nowhere to go but `unhandledRejection`.

*Source: learned regression (localhost — un-awaited promise chains with no rejection handler).*
