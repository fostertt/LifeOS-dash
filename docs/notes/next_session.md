# Next Session - Start Here

**Last Updated:** February 11, 2026
**Current Status:** UI Polish Phase 5 COMPLETE ✅ — Ready for Phase 6
**Branch:** master (committed & pushed)
**Production:** <https://lifeos-dev.foster-home.net> (PM2 on port 3002)

---

## 🎯 NEXT UP: Phase 6 — Calendar Week View Improvements (COMPLEX)

**Goal:** Make week view more compact and fix navigation behaviors.

**What needs to happen:**
1. **Fix horizontal scrolling** — Week grid should scroll, not whole page
2. **Tighten time column** — Smaller labels, less width, reference `week.jpg`
3. **Reduce overdue section size** — Smaller cards/headers (collapse already works from Phase 4)
4. **Fix week header navigation** — Show "February FW5" instead of full date; arrows navigate by week

**Key file:** `app/calendar/page.tsx` (large file ~3000 lines, week view rendering around line 1950+)

**See:** `docs/notes/ui-polish-plan.md` Phase 6 for detailed implementation notes.

---

## ✅ COMPLETED: UI Polish Phase 5 (Feb 11, 2026)

**Phase 5 — Calendar Month View Improvements:**

### Phase 5a (earlier session):
1. ✅ Compact month cells — smaller date numbers, tighter padding, smaller item pills
2. ✅ Month header shows "February 2026" with month-level arrow navigation
3. ✅ Day clicking navigates to THAT day's timeline view
4. ✅ Week number clicking navigates to THAT week's view
5. ✅ Week numbers as small badges inside Monday cells

### Phase 5b (this session):
1. ✅ **Compact mobile header** — Single sticky row: `[☰] [←] February 2026 [→] [⊞ view] [▽ filter]`
2. ✅ **Header.tsx `customMobileContent` prop** — Render prop for page-specific mobile headers (zero impact on other pages)
3. ✅ **Redundant rows hidden** — Date nav card + mobile view switcher hidden on mobile in month view
4. ✅ **Grid icon for view switcher** — 4-square icon distinguishes it from hamburger
5. ✅ **Month text = "Today" button** — Tapping month name goes to today; purple text when not current month
6. ✅ **Taller cells (110px)** — More room for event/item pills
7. ✅ **Smaller pill fonts (9px)** — Shows time OR title (not both) to fit more content
8. ✅ **Compact overdue indicator** — `⚠️ 5` instead of `⚠️ 5 pending`
9. ✅ **4 items per cell** — Up from 3, with "+N more" overflow
10. ✅ **Back button fix** — Month nav uses `router.replace()` to avoid stacking history entries
11. ✅ **URL↔state sync** — `useEffect` on `searchParams` so browser back properly restores view+date

**Files Changed:** `components/Header.tsx`, `app/calendar/page.tsx`

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
| 6 | Calendar Week View | **NEXT** | Complex |
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

- `app/calendar/page.tsx` — All calendar views (~3000 lines, main target for Phase 6)
- `app/all/page.tsx` — All tasks page (Phase 4 complete)
- `app/vault/page.tsx` — Vault page (Phase 7 target)
- `components/FAB.tsx` — Plus button (Phase 8 target)
- `app/globals.css` — Global styles (has `overflow-x: hidden` on body)
- `components/Header.tsx` — Desktop nav bar, mobile compact header, `customMobileContent` render prop
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
