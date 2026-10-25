---
title: "Docs"
path: docs/README.md
---

# Docs

The planning and as-built documentation for human-markdown. Intent docs (product, design, roadmap) change only through a planning session (`/foundry:plan`); as-built docs are the build agent's.

| Path | Holds |
|---|---|
| `roadmap.md` | What gets built, in order. The one list. |
| `product/` | Vision, PRD, personas, journeys, metrics. Intent. |
| `design/` | Information architecture, UI spec, design system. Intent. |
| `architecture/` | Overview, stack, schema, API, infra, security, testing. As-built after handoff. |
| `decisions/` | Architecture decision records. Append-only. |
| `research/` | Dated snapshots: landscape, validation, interviews, forward notes. |
| `plans/<feature>/` | One plan per roadmap entry: `spec.md` and `tasks.md`. |

Migrated to this layout on 2026-10-25; the pre-migration files are in git history under `docs/spec/` and `docs/adrs/`.
