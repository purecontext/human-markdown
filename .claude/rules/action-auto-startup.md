# Auto-Startup

On the first user message of a session, run `/forge:startup` before
responding — unless the message is itself `/forge:startup` or a
non-work command (`/clear`, `/help`, `/config`).

The user should never need to remember to run startup manually.

## Detection

No startup has run yet if dev-state and recall context haven't been
loaded this session. If uncertain, run it — startup is idempotent.
