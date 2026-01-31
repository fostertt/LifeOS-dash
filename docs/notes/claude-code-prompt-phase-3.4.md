# Claude Code Prompt - Phase 3.4: Calendar Updates
**Status:** ✅ COMPLETE (January 31, 2026)
**See:** `phase-3.4-complete-summary.md` for implementation details

---

## Context

You've just completed Phase 3.3 (All Tasks view with filtering). Now moving to Phase 3.4: Calendar view updates.

**What's been completed:**
- Phase 3.1: Data model updated (state, tags, complexity, energy, nullable dates)
- Phase 3.2: Tag system with filtering
- Phase 3.3: All Tasks view with state/tag/complexity/energy filters

**Reference:** See `docs/notes/phase-3-implementation-plan.md` for full context.

---

## Phase 3.4 Overview

Update the Calendar to:
1. Show only relevant items (not all unscheduled tasks)
2. Add Timeline vs Compact view modes
3. Handle overdue items
4. Support tasks with/without times
5. Proper sectioning and visual hierarchy

---

## Calendar Display Rules

### What Shows on Calendar Day View

**1. Reminders (top section)**
- All reminders with `date <= today`
- Overdue reminders show in red/warning state
- No timeline association - just listed

**2. Overdue Tasks (below reminders, in red)**
- Tasks with `state='scheduled'` AND `date < today` AND not completed
- Display in warning/red color
- Stay red until either completed OR rescheduled to new date
- Show original due date

**3. In Progress Tasks**
- Tasks with `state='in_progress'` regardless of date
- Always show on Today
- Different visual indicator (badge, border color)

**4. Scheduled for Today**
- Tasks with `state='scheduled'` AND `date = today`
- Split into two sub-sections:
  - **With time:** Goes on timeline (if in Timeline mode)
  - **Without time:** Listed below timeline in "Scheduled (no time)" section

**5. Pinned to Today (bottom section)**
- Tasks with `showOnCalendar=true` (regardless of state/date)
- Labeled "Quick Captures" or "Also Today"
- Stay until completed or unpinned

**6. Events for today** (scheduled in timeline if they have time)

**7. Habits for today** (separate section or integrated - your current implementation)

### Filter Bar

Add filter toggle at top of Calendar:
- **All** (default - shows everything above)
- **Tasks** (only tasks, no events/habits/reminders)
- **Events** (only events)
- **Habits** (only habits)
- **Reminders** (only reminders)

Filter applies across all view modes and persists.

---

## View Modes: Timeline vs Compact

Add toggle button at top of Calendar Day view: **[Timeline] | [Compact]**

### Timeline Mode (Full Schedule)

**Purpose:** See time blocks, gaps, duration visualization. Needed for drag & drop scheduling.

**Layout:**
```
┌─────────────────────────────────┐
│ [Timeline] | Compact             │
│ Filter: [All ▾]                  │
├─────────────────────────────────┤
│ REMINDERS                       │
│ • Pick up prescription          │
├─────────────────────────────────┤
│ OVERDUE (red)                   │
│ ⚠ 1/28 - Fix bug from Monday   │
├─────────────────────────────────┤
│ IN PROGRESS                     │
│ 🔵 Working on deck design       │
├─────────────────────────────────┤
│ 6:00  ─────────────────────     │
│ 7:00  ─────────────────────     │
│ 8:00  ┌─────────────────┐       │
│       │ Morning standup │       │
│ 9:00  └─────────────────┘       │
│ 10:00 ┌─────────────────┐       │
│       │ Client meeting  │       │
│       │                 │       │
│ 11:00 └─────────────────┘       │
│ 12:00 ┌─────────────────┐       │
│       │ Lunch w/ Sarah  │       │
│ 1:00  └─────────────────┘       │
│ 2:00  ─────────────────────     │
│ ...                             │
├─────────────────────────────────┤
│ SCHEDULED (no time)             │
│ □ Review Q1 report              │
│ □ Send invoice to client        │
├─────────────────────────────────┤
│ QUICK CAPTURES                  │
│ □ Pick up milk                  │
│ □ Fix door knob                 │
└─────────────────────────────────┘
```

**Key features:**
- Left axis shows hours (configurable start/end, default 6am-10pm)
- Scheduled items with time render as blocks
- Block height = duration of task/event
- Empty time slots show clearly (gaps)
- Can see scheduling conflicts (overlapping blocks)

### Compact Mode

**Purpose:** Dense view of what needs doing, no whitespace for empty time slots.

**Layout:**
```
┌─────────────────────────────────┐
│ Timeline | [Compact]             │
│ Filter: [All ▾]                  │
├─────────────────────────────────┤
│ REMINDERS                       │
│ • Pick up prescription          │
│                                 │
│ OVERDUE (red)                   │
│ ⚠ 1/28 - Fix bug from Monday   │
│                                 │
│ IN PROGRESS                     │
│ 🔵 Working on deck design       │
│                                 │
│ SCHEDULED                       │
│ 8:00  Morning standup (30m)    │
│ 10:00 Client meeting (1h)      │
│ 12:00 Lunch w/ Sarah (1h)      │
│ 2:30  Dentist (45m)            │
│                                 │
│ SCHEDULED (no time)             │
│ □ Review Q1 report              │
│ □ Send invoice                  │
│                                 │
│ QUICK CAPTURES                  │
│ □ Pick up milk                  │
│ □ Fix door knob                 │
└─────────────────────────────────┘
```

**Key features:**
- No timeline axis
- Chronological list (earliest first)
- Shows time and duration in text (e.g., "10:00 (1h)")
- No visual gaps between items
- Compact, scrollable

---

## Data Model Additions Needed

**Check if these fields exist from Phase 3.1, add if missing:**

### Task model needs:
- `showOnCalendar` (boolean, default: false) - for "pinned to today"
- `duration` (integer, nullable, minutes) - for timeline visualization
  - Default: 30 minutes if not set
  - Used for rendering block height in Timeline
  - Used for calculating "earliest available time" in Compact mode drag-drop

### Reminder model needs:
- `date` field (should already exist)
- Query for reminders where `date <= today`

**If these fields don't exist yet, add them now before building UI.**

---

## Implementation Tasks

### Task 1: Update Data Model (if needed)
- [ ] Add `showOnCalendar` boolean to tasks if not present
- [ ] Add `duration` integer to tasks if not present
- [ ] Run migration if needed
- [ ] Update TypeScript types

### Task 2: Update Calendar Query Logic
- [ ] Modify query to fetch:
  - Reminders: `date <= today`
  - Tasks: `(state='scheduled' AND date <= today) OR state='in_progress' OR showOnCalendar=true`
  - Events: `date = today`
  - Habits: for today
- [ ] Don't fetch tasks with `state='unscheduled'` AND `showOnCalendar=false`
- [ ] Sort overdue by original due date
- [ ] Sort scheduled by time (nulls last)

### Task 3: Create View Mode Toggle
- [ ] Add state for current view mode: 'timeline' | 'compact'
- [ ] Toggle button component in Calendar header
- [ ] Persist preference (localStorage or user settings)

### Task 4: Build Timeline Mode
- [ ] Time axis component (6am-10pm default, configurable?)
- [ ] Render scheduled items as blocks:
  - Calculate position based on time
  - Calculate height based on duration
  - Handle items without time (separate section)
- [ ] Visual indicators:
  - Overdue items: red/warning styling
  - In Progress: blue badge or border
  - Normal: default styling
- [ ] Section headers:
  - Reminders (top)
  - Overdue (if any)
  - In Progress (if any)
  - Timeline
  - Scheduled (no time)
  - Quick Captures (showOnCalendar items)

### Task 5: Build Compact Mode
- [ ] Chronological list (no timeline)
- [ ] Display format: "time (duration)" 
  - e.g., "10:00 (1h 30m)" or "10:00 (90m)"
- [ ] Same sections as Timeline but no gaps
- [ ] Same visual indicators (red for overdue, etc.)

### Task 6: Add Filter Bar
- [ ] Filter dropdown/buttons: All | Tasks | Events | Habits | Reminders
- [ ] Apply filter to current view
- [ ] Persist filter selection
- [ ] Update query based on filter

### Task 7: Handle Overdue Styling
- [ ] Red/warning color for overdue tasks and reminders
- [ ] Show original due date
- [ ] Clear visual distinction from on-time items

### Task 8: "Pin to Today" UI
- [ ] Add toggle in task create/edit forms: "Pin to today"
- [ ] Sets `showOnCalendar=true`
- [ ] In All Tasks view, add "pin" icon/button on task cards
- [ ] Quick toggle on/off
- [ ] Pinned items show in "Quick Captures" section on Calendar

### Task 9: Duration Field UI
- [ ] Add duration input to task forms (optional)
- [ ] Format: hours and minutes (e.g., "1h 30m" or just "30m")
- [ ] Store as total minutes in database
- [ ] Default to 30min if not provided
- [ ] Show duration in Timeline mode visually
- [ ] Show duration in Compact mode as text

### Task 10: Testing
- [ ] Test Timeline mode with various durations
- [ ] Test Compact mode layout
- [ ] Test overdue items appear correctly (create test task with past date)
- [ ] Test "pin to today" functionality
- [ ] Test filters work in both modes
- [ ] Test switching between modes preserves filter
- [ ] Test tasks with time vs without time
- [ ] Test empty states (no items for the day)

---

## Success Criteria

Before declaring Phase 3.4 complete:

- [ ] Calendar only shows relevant items (scheduled, overdue, in-progress, pinned)
- [ ] Unscheduled tasks (not pinned) do NOT appear on Calendar
- [ ] Timeline mode displays with time axis and duration blocks
- [ ] Compact mode displays chronologically without gaps
- [ ] Can toggle between Timeline and Compact modes
- [ ] Filter bar works (All | Tasks | Events | Habits | Reminders)
- [ ] Overdue items show in red at top
- [ ] In Progress tasks show on Today
- [ ] Pinned tasks show in bottom section
- [ ] Tasks can have duration field (optional, default 30min)
- [ ] Tasks can be pinned to today via showOnCalendar boolean
- [ ] Reminders show at very top
- [ ] View mode preference persists
- [ ] Filter preference persists
- [ ] Mobile responsive (both modes work on small screens)

---

## UI/UX Notes

### Visual Hierarchy
1. **Reminders** - always top, distinct icon
2. **Overdue** - red/warning, eye-catching
3. **In Progress** - blue indicator, shows you're working on it
4. **Timeline/Scheduled** - main body
5. **No time scheduled** - below timeline
6. **Quick Captures** - bottom, different styling (lighter/secondary)

### Color Coding Suggestions
- Overdue: Red (#EF4444 or similar)
- In Progress: Blue (#3B82F6 or similar)
- Normal: Default theme colors
- Pinned: Gray or muted secondary color

### Accessibility
- Color is not the only indicator (use icons/text too)
- Clear labels for sections
- Keyboard navigation between sections
- Screen reader friendly labels

---

## Edge Cases to Handle

1. **Task with duration > 4 hours:**
   - Display full duration in Timeline
   - When drag-dropping (Phase 3.8), will cap at 4hrs
   - For now, just display accurately

2. **Overlapping scheduled items:**
   - Allow them to overlap visually
   - User deals with conflicts manually
   - Phase 3.8 will handle this in drag-drop

3. **Empty day:**
   - Show friendly empty state
   - "Nothing scheduled for today"
   - Suggest checking All Tasks or pinning items

4. **Very long duration (weeks):**
   - Display sensibly in Timeline (truncate with indicator?)
   - Phase 3.8 will cap at 4hrs for scheduling

5. **Task scheduled for today but marked "on hold":**
   - State "on hold" overrides date
   - Does NOT show on Calendar
   - Only shows in All Tasks view
   - This is intentional - on hold means not actively working

---

## Questions to Consider

Before implementing, verify:

1. **What hours should Timeline default to?** (6am-10pm? 8am-8pm? Configurable?)
2. **Should Timeline scroll or be fixed height?** (Probably scroll)
3. **How to handle midnight-crossing items?** (events/tasks after midnight)
4. **Should Compact mode show duration at all, or just time?** (Recommendation: show both)
5. **Mobile: which mode is default?** (Compact is probably better for mobile)

---

## Next Steps

After Phase 3.4 is complete:
- **Phase 3.5:** Notes feature (separate note type, Notes & Lists page)
- **Phase 3.6:** Swipeable navigation (All Tasks ↔ Calendar ↔ Notes/Lists)
- **Phase 3.7:** FAB menu (global add button)
- **Phase 3.8:** Drag & drop scheduling (includes resize, earliest-available logic)

**Do NOT proceed to Phase 3.5 until Phase 3.4 is confirmed complete.**

---

## Start Here

**Your first actions:**
1. Examine current Calendar implementation
2. Check if `showOnCalendar` and `duration` fields exist in Task model
3. Report current state and propose implementation approach
4. Ask any clarifying questions before building

Remember: Read `docs/notes/phase-3-implementation-plan.md` for full project context.
