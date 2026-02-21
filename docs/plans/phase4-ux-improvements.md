# LifeOS Phase 4: UX Improvements Plan

**Created**: 2026-02-21
**Status**: In Progress

## Context
Tyrrell has compiled ~20 UX improvements from real-world usage of LifeOS on mobile. These range from bug fixes (auto-refresh not working, day-click navigation wrong) to UX polish (compact modal, bottom nav) to new features (recurring options, click-to-add on timeline). This plan groups them into logical batches to be implemented sequentially.

---

## Group 1: Bug Fixes & Quick Wins
*Small, independent fixes. Do these first.*

### 1.1 Fix auto-refresh not triggering
- **Problem**: `useRefreshOnFocus` hook works but `loadData` is recreated every render, and the hook's `useEffect` deps include `callback` — causing the listener to constantly re-register. On the All page, the `enabled` param is `!loading` which is `false` during the refresh itself, potentially unregistering the listener.
- **Fix**: Wrap `loadData` in `useCallback` on each page (all, calendar, week, vault). Remove the `enabled` guard that disables during loading — just keep the throttle.
- **Files**: `app/all/page.tsx`, `app/calendar/page.tsx`, `app/week/page.tsx`, `app/vault/page.tsx`, `lib/useRefreshOnFocus.ts`

### 1.2 Fix week view day-click navigating to wrong page
- **Problem**: `week/page.tsx:836` — clicking day header navigates to `/?date=${dateStr}` (home/cards page). Should navigate to `/calendar?date=${dateStr}`.
- **Fix**: Change `router.push(/?date=...)` to `router.push(/calendar?date=...)`. Only the day header div (with day name/number) should be clickable, not the items area below.
- **File**: `app/week/page.tsx:836`

### 1.3 Default task state: active instead of backlog
- **Problem**: `TaskForm.tsx:185` defaults new tasks to `"backlog"`. API route also defaults to backlog if no date.
- **Fix**: Change default to `"active"` in TaskForm (line 82, 134, 185). Update API POST route to default to `"active"`. Remove the ADR-012 constraint that backlog clears dates.
- **Files**: `components/TaskForm.tsx`, `app/api/items/route.ts`

### 1.4 Fix grouping button text readability (All page)
- **Problem**: Group-by dropdown uses `text-xs` with default border, hard to read.
- **Fix**: Change to `text-sm font-medium text-gray-700` and add better border styling.
- **File**: `app/all/page.tsx:389-401`

**Status**: [~] Partial — 1.1 auto-refresh improved (pageshow + ref fix) but still unreliable on Android; 1.2, 1.3, 1.4 complete

---

## Group 2: TaskForm / Modal Compactness
*Tighten the create/edit modal so Create button is visible without scrolling.*

### 2.1 Add "Advanced" collapsible section
- Move State, Priority, Complexity, Energy into a collapsible "Advanced" section (collapsed by default for new items, expanded if editing and any values are set).
- Keep Name, Description, Date/Time, Tags, and action buttons always visible.
- **File**: `components/TaskForm.tsx`

### 2.2 Compact sub-items section
- Remove "No sub-tasks added yet" text — just show the "Add Sub-Task" button.
- Sub-items list uses tighter spacing (gap-1 instead of gap-2).
- **File**: `components/TaskForm.tsx:503-544`

### 2.3 Fix sub-task date picker overflow
- Replace inline `<input type="date">` with a small calendar icon button that opens a date picker popover/popup positioned within viewport.
- **File**: `components/TaskForm.tsx:520-530`

### 2.4 Enter key advances to next sub-item/list-item
- In sub-task name inputs: pressing Enter creates a new sub-item and focuses it.
- Same behavior for list items in ListForm.
- **Files**: `components/TaskForm.tsx`, `components/ListForm.tsx`

**Status**: [ ] Not started

---

## Group 3: Navigation Redesign (Bottom Tab Bar)
*Replace hamburger-only mobile nav with bottom tab bar.*

### 3.1 Create BottomTabBar component
- Fixed bottom bar (mobile only, hidden on md+) with 4-5 tabs: Home, All, Calendar, Vault
- Active tab highlighted with purple indicator
- Each tab has icon + small label
- **New file**: `components/BottomTabBar.tsx`

### 3.2 Update layout to include BottomTabBar
- Add BottomTabBar to `ClientRootLayout` (appears on all pages when authenticated)
- Add bottom padding to pages to account for tab bar height
- **Files**: `components/ClientRootLayout.tsx`, various page files

### 3.3 Slim down Sidebar to secondary nav
- Keep hamburger button in header but sidebar now only shows: Projects, Recipes, Settings (formerly "Calendars")
- Rename "Calendars" to "Settings" in sidebar. Settings page shows calendar selection + future settings.
- **Files**: `components/Sidebar.tsx`, `components/Header.tsx`

**Status**: [ ] Not started

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

**Status**: [ ] Not started

---

## Group 5: Swipe Navigation
*Add swipe left/right to navigate between days/weeks/months.*

### 5.1 Wire up SwipeContainer on calendar views
- Calendar (today) view: swipe left = next day, swipe right = previous day
- Week view: swipe left = next week, swipe right = previous week
- Month view: swipe left = next month, swipe right = previous month
- `SwipeContainer` component already exists — wire callbacks to existing nav functions.
- **Files**: `app/calendar/page.tsx`, `app/week/page.tsx`

**Status**: [ ] Not started

---

## Group 6: Click-to-Add on Timeline
*Click empty time slots to quick-add tasks.*

### 6.1 Add click handler to timeline time slots (Calendar/Today view)
- Clicking an empty time slot opens the task creation modal with date and time pre-filled.
- Only works on views with time slots (today/calendar view, week view).
- **Files**: `app/calendar/page.tsx`, `app/week/page.tsx`

### 6.2 Show timeline even when no events scheduled
- Add toggle/option in today view to always show the timeline grid (6am-10pm time slots).
- Default: show timeline always.
- **File**: `app/calendar/page.tsx`

**Status**: [ ] Not started

---

## Group 7: Recurring Task Options (Schema + UI)
*Expand recurrence beyond just "daily". Use Opus for schema design.*

### 7.1 Database schema update
- Add fields to Item model (some may already exist): `recurrenceType`, `recurrenceInterval`, `recurrenceUnit`, `recurrenceAnchor`
- Types: `daily`, `weekly`, `monthly_day`, `every_n_days`, `every_n_weeks`, `days_after_completion`
- **File**: `prisma/schema.prisma` (migration needed)

### 7.2 Recurrence UI in TaskForm
- Replace the simple "Recurring (daily)" checkbox with a recurrence picker:
  - Every day / Every N days / Every week on [days] / Every N weeks / This day of month / N days after completion
- Show a human-readable summary: "Every 3 days", "Every Tuesday", "Monthly on the 15th"
- **File**: `components/TaskForm.tsx`

### 7.3 Update toggle/completion logic for new recurrence types
- Completion logic in `/api/items/[id]/toggle` needs to handle new recurrence patterns.
- Next occurrence calculation for each type.
- **Files**: `app/api/items/[id]/toggle/route.ts`, `app/week/page.tsx` (isScheduledForDay), `app/calendar/page.tsx`

**Status**: [ ] Not started

---

## Group 8: Notes/Lists UX Improvements (Deferred - Design TBD)
*These need more design discussion and reference image review.*

### 8.1 Google Keep-style note editing
- Notes: Title at top, freeform content area below, bottom toolbar with actions (like notes1.jpg)
- Inline editing instead of modal-based editing
- **Files**: `app/vault/[id]/page.tsx`, `components/NoteForm.tsx`

### 8.2 Google Keep-style list editing
- Lists: Title at top, checkbox + item inline, "+" to add item (like list1.jpg)
- Enter key creates next item
- Bottom toolbar with color/tag options
- **Files**: `app/vault/[id]/page.tsx`, `components/ListForm.tsx`

### 8.3 Optional checkboxes in Notes
- Notes can optionally have checklist items (toggle to add checkboxes)
- Keeps notes and lists as separate types in DB
- **Files**: `components/NoteForm.tsx`, `app/api/notes/[id]/route.ts`, `prisma/schema.prisma`

### 8.4 Tags on Lists (replace color circles)
- Add tag support to lists (same as notes already have)
- Keep color picker but as a "highlight color" feature available on both notes and lists
- **Files**: `components/ListForm.tsx`, `components/ListCard.tsx`

**Status**: [ ] Not started

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
| 7 | Group 7: Recurring | Large | Schema change + logic |
| 8 | Group 8: Notes/Lists | Large | Needs design iteration |

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
