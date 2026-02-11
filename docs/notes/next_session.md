# Next Session - Start Here

**Last Updated:** February 11, 2026
**Current Status:** UI Polish Phase 4 COMPLETE ✅ — Ready for Phase 5
**Branch:** master (committed & pushed)
**Production:** <https://lifeos-dev.foster-home.net> (PM2 on port 3002)

---

## 🎯 NEXT UP: Phase 5 — Calendar Month View Improvements (COMPLEX)

**Goal:** Make month view more compact and fix navigation behaviors.

**What needs to happen:**
1. **Make month view more compact** — Reduce cell height, smaller date numbers, tighter padding, smaller item pills (reference `docs/screenshots/month.jpg`)
2. **Fix month header** — Show "February 2026" instead of full date when in month view; arrows navigate by month
3. **Fix day clicking** — Clicking a day should navigate to THAT day's timeline view (currently goes to today)
4. **Fix week number clicking** — Clicking a week number should navigate to THAT week's view (currently goes to current week)
5. **Move week numbers outside grid** — Change from "Wk" column inside grid (8 cols) to "FW#" labels outside (7 cols for days)
6. **Fix scrolling** — Calendar grid should scroll horizontally on mobile, not the whole page
7. **Collapsible overdue** — ALREADY DONE in Phase 4 ✅

**Key file:** `app/calendar/page.tsx` (large file ~2900 lines, month view rendering starts around line 2030)

**See:** `docs/notes/ui-polish-plan.md` Phase 5 (sections 5.1–5.6) for detailed implementation notes.

---

## ✅ COMPLETED: UI Polish Phase 4 (Feb 11, 2026)

**Phase 4 — All Page Redesign + Collapsible Sections:**

1. ✅ **Mobile width bug FIXED** — Added `overflow-x: hidden` to `body` in `globals.css` (covers all pages)
2. ✅ **Task card redesign** — Checkbox on RIGHT side, inline date/time with task name, removed state/metadata badges, simpler styling
3. ✅ **Section reordering** — In Progress → Active → Backlog → Completed
4. ✅ **Checkbox functionality** — Fixed toggle API (was missing `date` parameter), checkboxes now work
5. ✅ **Chronological sorting** — Items sorted by due date within each section (earliest first, no-date last)
6. ✅ **Collapsible sections on All page** — Tap group headers to collapse/expand with chevron indicator
7. ✅ **Collapsible sections on ALL Calendar views** — All 17 sections across compact, timeline, schedule, week, and month views are collapsible (Overdue, In Progress, Reminders, Events, Scheduled, Scheduled No Time, Quick Captures, Timeline)
8. ✅ **Filter panel compacting** — Shorter labels, removed redundant text, smaller controls
9. ✅ **Completed items visible by default** — All states shown including completed

**Git Commit:** `3fdcfd8` — UI Polish Phase 4: All page redesign + collapsible sections
**Files Changed:** `app/all/page.tsx`, `app/calendar/page.tsx`, `app/globals.css`
**Tested:** Yes ✅

---

## ✅ COMPLETED: UI Polish Phase 3 (Feb 5, 2026 Morning)

**Phase 3 — Navigation Spacing & Week View Time Column:**
- ✅ Reduced desktop header spacing: mb-8 → mb-4
- ✅ Reduced All/Calendar/Vault page container padding
- ✅ Refactored week view time column to be compact (fixed w-14, right-aligned)

**Git Commit:** `f73e2c7`

---

## ✅ COMPLETED: UI Polish Phases 1-2 (Feb 4, 2026 Evening)

**Phase 1 — Disable Swipe Navigation:**
- ✅ Simplified ClientRootLayout, removed SwipeContainer

**Phase 2 — Mobile Header Cleanup:**
- ✅ "LifeOS" centered in mobile header, hamburger on right

**Git Commits:** `df9c81f`, `59b3449`, `0ea12f0`

---

## ✅ COMPLETED: Phase 3.5.3 - Calendar View Switcher (Feb 4, 2026 Morning)

5 calendar views (Timeline, Compact, Schedule, Week, Month) with hamburger sidebar, URL routing, localStorage persistence.

---

## Remaining UI Polish Phases

| Phase | Description | Status | Complexity |
|-------|------------|--------|------------|
| 5 | Calendar Month View | **NEXT** | Complex |
| 6 | Calendar Week View | Pending | Complex |
| 7 | Vault Improvements | Pending | Medium |
| 8 | FAB Redesign | Pending | Easy |

---

## PM2 Configuration

**Important:** PM2 must run on port 3002. Start command:
```bash
pm2 start "npm start -- -p 3002" --name lifeos-dev --cwd ~/projects/lifeos-dev
```
The default `npm start` (without `-p 3002`) starts on port 3001 which causes 502 errors.

---

## Important Files to Know

- `app/calendar/page.tsx` — All calendar views (~2900 lines, main target for Phase 5-6)
- `app/all/page.tsx` — All tasks page (Phase 4 complete)
- `app/vault/page.tsx` — Vault page (Phase 7 target)
- `components/FAB.tsx` — Plus button (Phase 8 target)
- `app/globals.css` — Global styles (has `overflow-x: hidden` on body)
- `components/Header.tsx` — Desktop nav bar, mobile compact header
- `components/ClientRootLayout.tsx` — Simplified layout wrapper

---

## Known Issues

- **Google Calendar token expired** — `invalid_grant` errors in PM2 logs. Needs re-auth but doesn't affect UI.
- See `docs/notes/bugs.md` for other known issues (server IP changes, OAuth loops, foreign key violations).

---

## Architecture Decisions to Remember

- ADR-012: 4-state model (backlog, active, in_progress, completed)
- ADR-013: Overdue persistence (isOverdue flag)
- ADR-007: Mobile-first visual simplification
- Tailwind v4 — use `wrap-break-word` not `break-words`, use `bg-linear-to-r` not `bg-gradient-to-r`
