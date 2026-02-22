# Next Session — Start Here

**Last Updated:** 2026-02-22
**Branch:** master (committed & pushed)
**Master Plan:** `docs/plans/lifeos-roadmap.md`

---

## What Just Happened (Feb 22, 2026)

Fixed 3 bugs from previous session:

1. **Checkbox opening modal** — added `onClick` stopPropagation on Today view checkbox
2. **Weekly recurring won't complete** — added `daily`/`weekly`/`monthly` to advancing recurrence branch with date math (+1d/+7d/+1mo). Fixed completions API to return all ItemCompletions (removed `scheduleType: "daily"` filter).
3. **All view flicker on complete** — optimistic update + silent background refresh

Also cleaned up docs: consolidated 7 planning/session docs into `docs/plans/lifeos-roadmap.md`.

---

## What To Do Now: Wire Voice Pipeline to Inbox

**One-line change on pipeline side** — POST body includes `source: "voice"`. LifeOS API already accepts it (ADR-020 implemented Feb 21). Test that inbox shows voice captures.

---

## Then: Drag and Drop (ADR-018) — The Big One

This is the next major feature. Details in `docs/plans/lifeos-roadmap.md` Tier 2.

- Library: `@dnd-kit/core`
- Today view: vertical drag, 15-min snap
- Week view: 2D drag (time + day)
- GCal events: read-only
- Resize: deferred

---

## Known Bugs (Not Blocking)

| Bug | Where |
|-----|-------|
| Voice note rename re-triggers processing | Pipeline side — file watcher issue |
| Auto-refresh unreliable on Android | `lib/useRefreshOnFocus.ts` — may need polling |

See `docs/notes/bugs.md` for full details.

---

## Key Architecture Decisions

- **ADR-020:** Inbox (source + reviewedAt fields, replaces Home tab)
- **ADR-019:** 3 states (backlog / active / completed)
- **ADR-018:** Drag-and-drop (@dnd-kit, pending implementation)
- **ADR-017:** Today view reorder (Overdue → Unscheduled → Time grid)
- **ADR-014:** Two recurrence completion models

All ADRs in `docs/notes/decisions.md`.

---

## PM2

`pm2 restart lifeos-dev` — runs `next start -p 3002`. Port baked into package.json start script.
