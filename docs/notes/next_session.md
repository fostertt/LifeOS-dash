# Next Session — Start Here

**Last Updated:** 2026-02-22
**Branch:** master (committed & pushed)
**Master Plan:** `docs/plans/lifeos-roadmap.md`

---

## What Just Happened (Feb 22, 2026 — Session 2)

1. **Week view DnD wired up (ADR-018 extended)**
   - Wrapped week time-grid cells with `DroppableTimeSlot` (id: `week-slot-{date}-{hour}`)
   - Wrapped no-time row cells with `DroppableTimeSlot` (id: `week-notime-{date}`)
   - Made week items, no-time items, and overdue items draggable via `DraggableTaskCard`
   - Updated `handleDragEnd` with `week-slot-*` and `week-notime-*` cases
   - Fixed `handleDragStart` to search raw `items` array (not just `categorizedData`) so week view items are found
   - Fixed `handleDragEnd` to extract item ID from drag event as fallback
   - Added `DragOverlay` ghost pill (color-coded by item type)
   - **Known UX issue:** Week pills are very small, making drag awkward. Works but not great. Future fix: longer press-to-drag or drag handles.

2. **Click-to-create on week time cells** — clicking empty cell opens task create modal pre-filled with that cell's date and time.

3. **Deleted dead `/week` route** — removed `app/week/page.tsx` (1727 lines), cleaned refs in `Header.tsx` and `BottomTabBar.tsx`.

4. **Reduced drag activation distance** from 8px to 3px for better small-target responsiveness.

---

## Known Bugs (Not Blocking)

| Bug | Where |
|-----|-------|
| Week view DnD pills too small for comfortable drag | `app/calendar/page.tsx` — needs drag handles or press-to-enlarge UX |
| Voice note rename re-triggers processing | Pipeline side — file watcher issue |
| Auto-refresh unreliable on Android | `lib/useRefreshOnFocus.ts` — may need polling |

See `docs/notes/bugs.md` for full details.

---

## What To Do Next

Continue with roadmap Tier 2 items in `docs/plans/lifeos-roadmap.md`. Candidates:
- Week view DnD UX improvements (drag handles, press-to-enlarge)
- 15-min snap grid for timeline drag
- Any remaining roadmap features

---

## Key Architecture Decisions

- **ADR-020:** Inbox (source + reviewedAt fields, replaces Home tab)
- **ADR-019:** 3 states (backlog / active / completed)
- **ADR-018:** Drag-and-drop (@dnd-kit) — Today view works well, Week view wired but UX limited by small pill targets
- **ADR-017:** Today view reorder (Overdue → Unscheduled → Time grid)
- **ADR-014:** Two recurrence completion models

All ADRs in `docs/notes/decisions.md`.

---

## PM2

`pm2 restart lifeos-dev` — runs `next start -p 3002`. **Must `npm run build` first** (production mode, not dev).
