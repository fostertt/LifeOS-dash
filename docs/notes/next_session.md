# Next Session - Start Here

**Last Updated:** February 11, 2026
**Current Status:** UI Polish Phase 6 COMPLETE ✅ — Ready for Phase 7
**Branch:** master (committed & pushed)
**Production:** <https://lifeos-dev.foster-home.net> (PM2 on port 3002)

---

## 🎯 NEXT UP: Phase 7 — Vault Improvements (MEDIUM)

**Goal:** Make vault more compact like Google Keep and fix data refresh bug.

**What needs to happen:**
1. **Compact layout** — Reduce padding, tighter grid, minimal card borders (reference `keep1.jpg`)
2. **Fix new notes not showing** — GlobalCreateManager creates note but Vault doesn't refresh
3. **Make Content field optional** — Allow saving note with just a title
4. **Verify click behavior** — Ensure direct click opens modal after Phase 1 swipe removal

**Key files:** `app/vault/page.tsx`, `components/NoteForm.tsx`, `components/GlobalCreateManager.tsx`

**See:** `docs/notes/ui-polish-plan.md` Phase 7 for detailed implementation notes.

---

## ⏳ Future Calendar Polish
- Day header event count badges in week view
- Full dark mode support (week view has dark: classes, rest of app doesn't — causes mismatch on phones with dark mode)
- Google Calendar dateless events showing on today (see bugs.md)
- Consider merging Schedule view into Today view as a 4th state (collapsed → list → multi-day list → grid) to reduce view count from 4 to 3

---

## ✅ COMPLETED: UI Polish Phase 6.5 (Feb 11, 2026)

**Phase 6.5 — Calendar View Consolidation & Polish:**

1. ✅ **Merged compact into timeline** — 5 views → 4 (today, schedule, week, month)
2. ✅ **Renamed to "Today"** — View switcher shows "Today" instead of "Timeline"/"Compact"
3. ✅ **3-state "Today" section** — Collapsed → list (events + scheduled as cards) → grid (time grid) → collapsed
4. ✅ **Default state** — Overdue collapsed, Today in list mode on page load
5. ✅ **Compact mobile headers for all views** — Today and schedule now have `[☰] [←] Wed, Feb 11 [→] [⊞] [▽]`
6. ✅ **Today view scroll fix** — Pinned header like week view (`h-screen overflow-hidden`)
7. ✅ **Timeline time labels** — Removed AM/PM, hour number only, darker font (`text-gray-700 font-semibold`)
8. ✅ **Week view time labels** — 12px, `text-black font-bold`, wider column (`w-9`)
9. ⚠️ **Week view dark mode bug** — Time numbers invisible on phone dark mode (needs Phase 9)

**Files Changed:** `app/calendar/page.tsx`, `components/ViewSwitcherSidebar.tsx`

---

## ✅ COMPLETED: UI Polish Phase 6 (Feb 11, 2026)

**Phase 6 — Calendar Week View Improvements:**

1. ✅ **Compact mobile header** — `[☰] [←] February FW7 [→] [⊞ view] [▽ filter]` (same pattern as month)
2. ✅ **Tight time column** — w-7 (28px), 10px font, hour numbers only, 48px rows
3. ✅ **Overdue as compact pills** — Small wrapping `⚠ Task name` tags instead of full cards
4. ✅ **Week header navigation** — "February FW7" format, arrows navigate by week, tap to go to today
5. ✅ **Fixed viewport scroll** — `h-screen overflow-hidden` layout; only time grid scrolls, headers stay pinned
6. ✅ **Edge-to-edge layout** — Reduced padding (`px-1`, `p-1`) for maximum screen usage
7. ✅ **Section arrows moved right** — All collapsible sections (calendar + All page) have chevron on far right
8. ✅ **Fixed dueDate comparison bug** — ISO date vs YYYY-MM-DD mismatch fixed across week, schedule, and month views
9. ✅ **Week-aware "Scheduled No Time"** — Shows items for full week, not just selected day

**Files Changed:** `app/calendar/page.tsx`, `app/all/page.tsx`

---

## ✅ COMPLETED: UI Polish Phase 5 (Feb 11, 2026)

**Phase 5 — Calendar Month View Improvements:**

### Phase 5a (earlier session):
1. ✅ Compact month cells — smaller date numbers, tighter padding, smaller item pills
2. ✅ Month header shows "February 2026" with month-level arrow navigation
3. ✅ Day clicking navigates to THAT day's timeline view
4. ✅ Week number clicking navigates to THAT week's view
5. ✅ Week numbers as small badges inside Monday cells

### Phase 5b:
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

## ✅ Earlier Phases (1-4, 3.5.3) — See ui-polish-plan.md for details

---

## Remaining UI Polish Phases

| Phase | Description | Status | Complexity |
|-------|------------|--------|------------|
| 7 | Vault Improvements | **NEXT** | Medium |
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

- `app/calendar/page.tsx` — All calendar views (~3200 lines, Phase 6 complete)
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
