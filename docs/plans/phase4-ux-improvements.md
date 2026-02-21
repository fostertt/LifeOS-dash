# LifeOS Phase 4: UX Improvements Plan

**Created**: 2026-02-21
**Status**: In Progress

## Context
Tyrrell has compiled ~20 UX improvements from real-world usage of LifeOS on mobile. These range from bug fixes (auto-refresh not working, day-click navigation wrong) to UX polish (compact modal, bottom nav) to new features (recurring options, click-to-add on timeline). This plan groups them into logical batches to be implemented sequentially.

---

## Group 1: Bug Fixes & Quick Wins
*Small, independent fixes. Do these first.*

### 1.1 [~] Fix auto-refresh not triggering
- **Problem**: `useRefreshOnFocus` hook works but `loadData` is recreated every render, and the hook's `useEffect` deps include `callback` — causing the listener to constantly re-register. On the All page, the `enabled` param is `!loading` which is `false` during the refresh itself, potentially unregistering the listener.
- **Fix**: Wrap `loadData` in `useCallback` on each page (all, calendar, week, vault). Remove the `enabled` guard that disables during loading — just keep the throttle.
- **Files**: `app/all/page.tsx`, `app/calendar/page.tsx`, `app/week/page.tsx`, `app/vault/page.tsx`, `lib/useRefreshOnFocus.ts`
- **Note**: Improved (pageshow + ref fix) but still unreliable on Android. Needs further investigation.

### 1.2 ✅ Fix week view day-click navigating to wrong page
- **Problem**: `week/page.tsx:836` — clicking day header navigates to `/?date=${dateStr}` (home/cards page). Should navigate to `/calendar?date=${dateStr}`.
- **Fix**: Change `router.push(/?date=...)` to `router.push(/calendar?date=...)`. Only the day header div (with day name/number) should be clickable, not the items area below.
- **File**: `app/week/page.tsx:836`

### 1.3 ✅ Default task state: active instead of backlog
- **Problem**: `TaskForm.tsx:185` defaults new tasks to `"backlog"`. API route also defaults to backlog if no date.
- **Fix**: Change default to `"active"` in TaskForm (line 82, 134, 185). Update API POST route to default to `"active"`. Remove the ADR-012 constraint that backlog clears dates.
- **Files**: `components/TaskForm.tsx`, `app/api/items/route.ts`

### 1.4 ✅ Fix grouping button text readability (All page)
- **Problem**: Group-by dropdown uses `text-xs` with default border, hard to read.
- **Fix**: Change to `text-sm font-medium text-gray-700` and add better border styling.
- **File**: `app/all/page.tsx:389-401`

**Status**: [~] Partial — 1.1 improved but still unreliable on Android; 1.2, 1.3, 1.4 complete

---

## Group 2: TaskForm / Modal Compactness
*Tighten the create/edit modal so Create button is visible without scrolling.*

### 2.1 ✅ Add "Advanced" collapsible section
- Move State, Priority, Complexity, Energy into a collapsible "Advanced" section (collapsed by default for new items, expanded if editing and any values are set).
- Keep Name, Description, Date/Time, Tags, and action buttons always visible.
- **File**: `components/TaskForm.tsx`
- **Note**: Also replaced the large schedule block with separate Date / Time icon buttons (each calls `showPicker()` directly). Habit form compacted to match task/reminder layout. Recurring + Pin to Today on same line.

### 2.2 ✅ Compact sub-items section
- Remove "No sub-tasks added yet" text — just show the "Add Sub-Task" button.
- Sub-items list uses tighter spacing (gap-1 instead of gap-2).
- **File**: `components/TaskForm.tsx:503-544`

### 2.3 ✅ Fix sub-task date picker overflow
- Replace inline `<input type="date">` with a small calendar icon button that opens a date picker popover/popup positioned within viewport.
- **File**: `components/TaskForm.tsx:520-530`
- **Note**: Implemented via `showPicker()` on a hidden input — goes straight to the native date picker with no intermediate popover.

### 2.4 [⏸] Enter key advances to next sub-item/list-item
- In sub-task name inputs: pressing Enter creates a new sub-item and focuses it.
- Same behavior for list items in ListForm.
- **Files**: `components/TaskForm.tsx`, `components/ListForm.tsx`
- **Note**: Deferred — Android virtual keyboards send keyCode 229 in keydown so `e.key === 'Enter'` never matches; `beforeinput` with `inputType === 'insertLineBreak'` also doesn't fire reliably on Android/GBoard. Desktop Enter works fine. Needs a different approach (e.g. `<textarea rows={1}>` detecting `\n` in onChange). ListForm inline items are a Group 8 concern anyway.

**Status**: [~] Partial — 2.1, 2.2, 2.3 complete; 2.4 deferred (Android keyboard limitation)

---

## Group 3: Navigation Redesign (Bottom Tab Bar)
*Replace hamburger-only mobile nav with bottom tab bar.*

### 3.1 ✅ Create BottomTabBar component
- 5-tab fixed bottom bar (mobile only, hidden on md+): Home | All | [+] | Calendar | Vault
- Active tab: purple icon/text + thin purple bar at top
- Center [+] opens a create menu (dispatches `lifeos:create` custom event); `GlobalCreateManager` listens and opens the appropriate modal. FAB hidden on mobile, kept on desktop.
- Calendar tab: tapping when already on a calendar view opens a view-switcher popup (Today / Schedule / Week / Month) above the tab. Reads current `?view=` from `window.location` to highlight active view.
- iOS safe area: `paddingBottom: env(safe-area-inset-bottom)` on the nav element.
- **New file**: `components/BottomTabBar.tsx`

### 3.2 ✅ Update layout to include BottomTabBar
- Added `<BottomTabBar />` to `ClientRootLayout`
- Wrapped children in `pb-16 md:pb-0` so page content clears the fixed bar
- **Files**: `components/ClientRootLayout.tsx`

### 3.3 ✅ Slim down Sidebar to secondary nav
- Sidebar now shows only: Projects, Recipes, Settings (formerly "Calendars")
- **Files**: `components/Sidebar.tsx`

### 3.4 ✅ Calendar header cleanup
- Removed 4-dot view-switcher icon from all 3 calendar mobile headers (Month, Week, Day/Schedule) — view switching moved to bottom tab Calendar popup
- Moved hamburger from left to right on all calendar mobile headers (matches default Header.tsx which already had it right)
- **File**: `app/calendar/page.tsx`

**Status**: ✅ Complete

### Future task (Group 9+): Unify mobile header compactness
- All pages currently use the default Header.tsx mobile header (LifeOS title centered, hamburger right).
- The calendar page has a compact custom header: `[< label >] [spacer] [filter] [hamburger]` — no wasted title row.
- Apply the same compact single-row header pattern to: Home, All, Vault, Projects, Recipes pages.
- Each page would show its own contextual title/controls in the compact row instead of the generic "LifeOS" centered title.

---

## Group 4: Filter & Sorting Improvements

### 4.1 Tag filter as searchable dropdown (All page)
- Replace tag buttons list with a combobox/autocomplete dropdown — type to search, click to select.
- Reuse existing `TagInput` component pattern (already has autocomplete).
- **File**: `app/all/page.tsx:449-469`

### 4.2 Compact metadata display (All page)
- Show Priority, Complexity, Energy as small inline labels (like State/Type badges) on the same line as the task name.
- Reduce vertical padding so each item card is one line when possible.
- **File**: `app/all/page.tsx:586-668`

### 4.3 Unify filter panel across Calendar and All views
- Extract filter state and UI into a shared `FilterPanel` component.
- Use it in both `/all` and `/calendar` pages.
- **New file**: `components/FilterPanel.tsx`
- **Files**: `app/all/page.tsx`, `app/calendar/page.tsx`

### 4.4 Back button closes filter instead of navigating away
- When filter panel opens, push a history state. On popstate, close filter instead of navigating.
- Same pattern already used by TaskForm (line 111-126).
- **Files**: `components/FilterPanel.tsx` (or wherever filter toggle lives)

### 4.5 Vault filter improvements
- Add tag filtering (same autocomplete dropdown style).
- Keep existing sort (recent/alphabetical). Add sort to All page too.
- **Files**: `app/vault/page.tsx`, `app/all/page.tsx`

**Status**: ✅ Complete

---

## Group 5: Swipe Navigation
*Add swipe left/right to navigate between days/weeks/months.*

### 5.1 Wire up SwipeContainer on calendar views
- Calendar (today) view: swipe left = next day, swipe right = previous day
- Week view: swipe left = next week, swipe right = previous week
- Month view: swipe left = next month, swipe right = previous month
- `SwipeContainer` component already exists — wire callbacks to existing nav functions.
- **Files**: `app/calendar/page.tsx`, `app/week/page.tsx`

**Status**: ✅ Complete

---

## Group 6: Click-to-Add on Timeline
*Click empty time slots to quick-add tasks.*

### 6.1 ✅ Add click handler to timeline time slots (Calendar/Today view)
- Clicking an empty time slot opens TaskForm with date and time pre-filled.
- Replaced old inline calendar modal with `TaskForm` component for both create and edit.
- Added `prefill?: { date?, time? }` prop to `TaskForm` for pre-seeding new items.
- **Files**: `app/calendar/page.tsx`, `components/TaskForm.tsx`

### 6.2 ✅ Show timeline even when no events scheduled
- Today section now always renders (removed `scheduled.length > 0` guard).
- Default changed to 'grid' (removed `"Today-grid"` from initial collapsed set).
- **File**: `app/calendar/page.tsx`

### 6.3 [~] Click-to-add on week view
- Day cells are clickable — tap empty space to create task for that day.
- Item/event cards use `e.stopPropagation()` to avoid bubbling.
- Week view now uses `TaskForm` for edit too.
- **Files**: `app/week/page.tsx`
- **Note**: Implemented but not yet confirmed working — needs testing/debugging.

**Status**: [~] Partial — 6.1 and 6.2 complete; 6.3 wired up but unverified

---

## Group 7: Recurring Task Options (Schema + UI)
*Expand recurrence beyond just "daily". Use Opus for schema design.*

### 7.1 ✅ Database schema update
- Added recurrence fields to Item model: `recurrenceType`, `recurrenceInterval`, `recurrenceUnit`, `recurrenceAnchor`
- Types: `daily`, `weekly`, `monthly_day`, `every_n_days`, `every_n_weeks`, `days_after_completion`
- **File**: `prisma/schema.prisma`

### 7.2 ✅ Recurrence UI in TaskForm
- Replaced simple "Recurring (daily)" checkbox with full recurrence picker
- Supports: Every day / Every N days / Every week on [days] / Every N weeks / This day of month / N days after completion
- Shows human-readable summary
- **File**: `components/TaskForm.tsx`

### 7.3 ✅ Update toggle/completion logic for new recurrence types
- Two completion models: per-date (daily/weekly/monthly) and advancing (every_n/days_after_completion)
- Per-date uses ItemCompletion table; advancing advances dueDate on completion
- **Files**: `app/api/items/[id]/toggle/route.ts`, `app/week/page.tsx`, `app/calendar/page.tsx`
- **ADR**: ADR-014 in decisions.md

**Status**: ✅ Complete

---

## Group 8: Notes/Lists UX Improvements
*Keep-style full-page editors replacing modal-based editing.*

### 8.1 ✅ Keep-style note editing
- Full-page editor at `/vault/notes/[id]` (numeric ID or "new")
- Title at top, freeform content area, inline color/tags/pin/Save/Delete below
- Back arrow = cancel (no save), explicit Save button
- Added `color` field to Note model (migration: `add_color_to_notes`)
- Old `NoteForm.tsx` modal deleted
- **Files**: `app/vault/notes/[id]/page.tsx`, `prisma/schema.prisma`, `app/api/notes/route.ts`, `app/api/notes/[id]/route.ts`

### 8.2 ✅ Keep-style list editing
- Full-page editor at `/vault/lists/[id]` (numeric ID or "new")
- Title at top, checkbox items with inline add, color/tags/pin/Save/Delete below
- New lists: "Add item" always visible, eagerly creates list on first item add
- Smart lists: read-only filtered task view preserved
- Old `ListForm.tsx` modal deleted, `/vault/[id]` redirects to `/vault/lists/[id]`
- **Files**: `app/vault/lists/[id]/page.tsx`, `app/vault/[id]/page.tsx`

### 8.3 [⏸] Optional checkboxes in Notes
- Skipped for now — deferred to future design review
- Notes can optionally have checklist items (toggle to add checkboxes)

### 8.4 ✅ Tags on Lists
- Wired existing `tags` JSON field to list editor UI via inline TagInput
- Tags show as chips on ListCard (same style as NoteCard)
- API PATCH route updated to accept `tags`
- List tags included in vault page tag aggregation
- **Files**: `app/api/lists/[id]/route.ts`, `components/ListCard.tsx`

### 8.5 [TODO] Pin bottom panel to viewport
- Color/tags/pin/Save/Delete buttons are currently inline and scroll with content
- Need to fix them to the bottom of the viewport so content scrolls above
- Must account for BottomTabBar height on mobile
- Tracked as UX-010 in issues.md
- **Reference**: `docs/screenshots/note-list.jpg`

**Status**: [~] Partial — 8.1, 8.2, 8.4 complete; 8.3 deferred; 8.5 TODO
**ADR**: ADR-015 in decisions.md

---

## Implementation Order

| Priority | Group | Effort | Notes |
|----------|-------|--------|-------|
| 1 | Group 1: Bug Fixes | Small | Quick wins, immediate value |
| 2 | Group 2: TaskForm | Medium | High-frequency pain point |
| 3 | Group 3: Bottom Nav | Medium | Major UX improvement |
| 4 | Group 4: Filters | Medium | Consistency across views |
| 5 | Group 5: Swipe | Small | SwipeContainer already exists |
| 6 | Group 6: Click-to-Add | Small-Med | Timeline enhancement |
| 7 | Group 7: Recurring | Large | ✅ Complete |
| 8 | Group 8: Notes/Lists | Large | [~] 8.5 remaining (fixed bottom panel) |

---

## Model Recommendations

- **Groups 1-6**: Use Sonnet — straightforward UI changes, bug fixes, component work
- **Group 7**: Start with Opus for schema/logic design, Sonnet for implementation
- **Group 8**: Use Opus for architectural decisions, then Sonnet for coding

---

## Workflow Per Group

After completing each group:
1. `npm run build` — ensure no TypeScript errors
2. `pm2 restart` the process on port 3002 — deploy to dev
3. Tyrrell tests on mobile + desktop
4. If good, commit before moving to next group
5. If issues found, fix and re-test before committing

## Build & Deploy Commands
```bash
npm run build
pm2 restart lifeos-dev  # or whatever the PM2 process name is on port 3002
```

## Session Continuity
This plan lives at `docs/plans/phase4-ux-improvements.md` for use across sessions. Each session should:
1. Check which groups are done (look at git log for commits)
2. Pick up the next incomplete group
3. Reference this plan for file paths and approach
