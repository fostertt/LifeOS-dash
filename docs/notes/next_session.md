# Next Session — Start Here

**Last Updated:** 2026-02-22
**Branch:** master (uncommitted changes present)
**Master Plan:** `docs/plans/lifeos-roadmap.md`

---

## What Just Happened (Feb 22, 2026 — Session 4)

1. **Fixed Quick Capture save failure** — `GlobalCreateManager.tsx` was sending `title` but items API expects `name`. Changed payload field.
2. **Fixed title-only note creation** — Note editor UI enforced content client-side (`if (!content.trim()) return` + disabled button). Changed guards to require title OR content. Also sent `null` instead of `""` for empty content.
3. **Fixed NoteCard crash on null content** — `NoteCard.tsx` called `.length`/`.substring()` on `content` which is now nullable. Added null guards. Also fixed `Note` interface in vault page.
4. **Fixed Quick Capture input text visibility** — Added `text-gray-900 placeholder-gray-400` to input.

---

## Known DnD Issues (Not Blocking — Track for Later)

| Issue | Where |
|-------|-------|
| Week view pills too small for comfortable drag | `app/calendar/page.tsx` — needs drag handles or press-to-enlarge |
| 15-min snap grid not yet implemented | Items land on nearest hour, not 15-min intervals |
| Resize handles deferred | Wait until drag UX is solid |

---

## Known Bugs (Older — Not Blocking)

| Bug | Where |
|-----|-------|
| Voice note rename re-triggers processing | Pipeline side — file watcher issue |
| Auto-refresh unreliable on Android | `lib/useRefreshOnFocus.ts` — may need polling |
| Mobile width overflow on All page | `app/all/page.tsx` — needs dev tools inspection |

See `docs/notes/bugs.md` for full details.

---

## What To Do Next

**Tier 1 is now Projects UI and Recipes & Meal Planning.**

Both need architecture discussion before implementation:

- **Projects UI:** `projectId` column already exists on Item/Note/List. Needs `/projects` page, list+detail views, TaskForm dropdown, filtering. Schema ready, UI not started.
- **Recipes & Meal Planning:** Needs schema design from scratch. Recipe CRUD, meal calendar, grocery list integration. No existing schema.

See `docs/plans/lifeos-roadmap.md` for full details.

---

## Key Architecture Decisions

- **ADR-020:** Inbox (source + reviewedAt fields, replaces Home tab)
- **ADR-019:** 3 states (backlog / active / completed)
- **ADR-018:** Drag-and-drop (@dnd-kit) — Today + Week views working
- **ADR-017:** Today view reorder (Overdue → Unscheduled → Time grid)
- **ADR-014:** Two recurrence completion models

All ADRs in `docs/notes/decisions.md`.

---

## PM2

`pm2 restart lifeos-dev` — runs `next start -p 3002`. **Must `npm run build` first** (production mode, not dev).
