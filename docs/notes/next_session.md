# Next Session - Start Here

**Last Updated:** February 19, 2026
**Current Status:** UI Polish Phase 6 COMPLETE ✅ — Ready for Phase 7
**Branch:** master (committed & pushed)
**Production:** <https://lifeos-dev.foster-home.net> (PM2 on port 3002)

---

## ✅ COMPLETED: Calendar Bug Fixes — Dark Mode + Google Calendar Day Assignment (Feb 19, 2026)

1. ✅ **Dark mode time labels** — Changed to `text-gray-800 font-bold` on both week and timeline views; readable on white background regardless of OS dark mode
2. ✅ **Google Calendar events on wrong days** — Fixed 3 interconnected bugs:
   - API route now uses America/New_York timezone boundaries (server runs UTC)
   - All-day date-only strings no longer parsed through `new Date()` (avoided UTC shift)
   - Added client-side `filteredEventsForDay` as safety net for timeline/today views
3. ✅ **All-day events in week view** — Excluded from hourly grid, added dedicated "ALL" row above time grid
4. ✅ **Multi-day event fetching** — Week/month/schedule views now fetch correct date ranges instead of single day

**Files Changed:** `app/calendar/page.tsx`, `app/api/calendar/events/route.ts`

---

## ✅ COMPLETED: Habits/Reminders Integration & All Page Overhaul (Feb 18, 2026)

1. ✅ **All page loads all item types** — Removed `?type=task` filter; shows tasks, habits, and reminders
2. ✅ **Type filter on All page** — Toggle Task/Habit/Reminder visibility, "By Type" grouping option
3. ✅ **Delete button in task detail modal** — `TaskForm` now has `onDelete` prop with confirmation dialog
4. ✅ **Habit recurrence options** — Frequency picker: Daily, Weekdays, Weekends, Specific days (day-of-week pills)
5. ✅ **Habits default to Active state** — API and form both default habits to "active" instead of "backlog"
6. ✅ **State selector for all item types** — Was tasks-only, now visible for habits and reminders too
7. ✅ **Sub-tasks restored in TaskForm** — Add/edit/remove sub-items for tasks, habits, and reminders
8. ✅ **Habits in calendar views** — Today view has "Habits" section; Schedule view shows habits per-day
9. ✅ **Calendar schedule matching** — All views handle daily/weekdays/weekends/specific_days schedule types
10. ✅ **Wiped test data** — Script at `scripts/wipe-test-data.mjs` clears all items/lists/notes, preserves auth

**Files Changed:** `app/all/page.tsx`, `app/calendar/page.tsx`, `app/week/page.tsx`, `app/api/items/route.ts`, `app/api/calendar/items/route.ts`, `components/TaskForm.tsx`

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
- ~~Full dark mode support (week view has dark: classes, rest of app doesn't — causes mismatch on phones with dark mode)~~ FIXED Feb 19 (used dark-on-white text)
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
9. ✅ **Week view dark mode bug** — FIXED Feb 19 (text-gray-800 font-bold)

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

PM2 runs `npm start` → `next start -p 3002`. Port is baked into `package.json` `start` script (fixed Feb 18, 2026 after power loss caused restart on wrong port). Just `pm2 restart lifeos-dev` is sufficient.

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

- ~~**Google Calendar token expired** — `invalid_grant` errors in PM2 logs.~~ FIXED by re-auth (Feb 19)
- ~~**No delete in task detail (All page)** — UX-006 in issues.md.~~ FIXED Feb 18
- **No multi-select/bulk delete (All page)** — UX-007 in issues.md. Approach not decided.
- **Voice pipeline: rename re-triggers processing** — Renaming a voice note file causes it to be re-sent through the pipeline. See bugs.md.
- See `docs/notes/bugs.md` for other known issues (server IP changes, OAuth loops, foreign key violations).

## Voice Pipeline Status (Feb 19, 2026)
- Pipeline is operational and working well. Work email routing added (say "work" → tags items + sends email to work address).
- Known bug: renaming a voice note re-processes it — see bugs.md.

### Voice Pipeline → LifeOS Integration Ideas (backlog)

These require work in both projects. Not prioritized yet — capturing for when LifeOS focus shifts to integrations.

**Calendar auto-creation (medium effort)**
Gemini already extracts `due_date` with time. Pipeline could call Google Calendar API when a datetime is present — create an event automatically. Needs: OAuth token on pipeline side, decision on which calendar to use.

**Voice notes in Vault (medium effort)**
Add a "Voice" section or filter in Vault to browse processed voice note transcripts/summaries. Pipeline already writes JSON output per note — LifeOS would need a `voice_notes` table or a notes tag filter. Good for searchability.

**Rollup summaries as LifeOS notes (easy once decided)**
Daily or weekly cron on pipeline that summarizes all processed notes for the period and pushes a single LifeOS note. Needs: schedule decision, summary format, whether it also emails.

**Pattern detection (future — needs data volume)**
Analyze LifeOS items created via voice over time — surface recurring themes, stalled tasks, capture frequency. Needs months of data before it's useful. Good someday-maybe candidate.

---

## Architecture Decisions to Remember

- ADR-012: 4-state model (backlog, active, in_progress, completed)
- ADR-013: Overdue persistence (isOverdue flag)
- ADR-007: Mobile-first visual simplification
- Tailwind v4 — use `wrap-break-word` not `break-words`, use `bg-linear-to-r` not `bg-gradient-to-r`
