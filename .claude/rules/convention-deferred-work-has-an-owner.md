---
paths:
  - "docs/**"
---
# Deferred Work Has an Owner

When a doc or task list defers work ("moves to F3", "until then", "for now"), or implements half of a paired requirement, name the owner in the same change: the destination task's line, a cited ticket, or a divergence entry, something a fresh clone sees (a note in the gitignored `.forge/session-context.md` is not). An unowned deferral reads as done: the epic looks complete with no task for its criterion, and later tasks assume someone else holds the other half, so the criterion is lost.

If the work is not coming, state the limit as current behavior ("supported launch: terminal"), not a promise.

Before shipping, grep the diff's added lines for "moves to", "until", "later", "for now" and "follow-up"; each points at something that exists.
