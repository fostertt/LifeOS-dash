# Next Session — Start Here

**Last Updated:** 2026-02-22
**Branch:** master (committed & pushed)
**Master Plan:** `docs/plans/lifeos-roadmap.md`

---

## What Just Happened (Feb 22, 2026)

1. **Wired voice pipeline to inbox** — Added `source: "voice"` to all 5 INSERT statements in `/home/fostertt/voice-pipeline/pipeline.py` (tasks, notes, reminders, meeting notes, fallback notes). Committed to voice-pipeline repo (no remote). Service restarted. Pending test with LilyGo recording.

2. Fixed 3 bugs from earlier in the day:
   - **Checkbox opening modal** — added `onClick` stopPropagation on Today view checkbox
   - **Weekly recurring won't complete** — added `daily`/`weekly`/`monthly` to advancing recurrence branch with date math (+1d/+7d/+1mo). Fixed completions API to return all ItemCompletions (removed `scheduleType: "daily"` filter).
   - **All view flicker on complete** — optimistic update + silent background refresh

Also cleaned up docs: consolidated 7 planning/session docs into `docs/plans/lifeos-roadmap.md`.

---

## What To Do Now: Test Voice → Inbox Flow

Record a voice note on the LilyGo and confirm it appears in LifeOS Inbox with the "Voice" badge. Watch logs: `sudo journalctl -u voice-pipeline -f`

If that works, voice → inbox is done (ADR-020 complete end-to-end).

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
