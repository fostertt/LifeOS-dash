# Phase 3.0 - Foundation Refactor
## Task Management Architecture Overhaul

**Status:** Planning Complete - Ready for Implementation  
**Started:** January 30, 2026  
**Target Completion:** TBD (estimated 2-3 weeks)

---

## Executive Summary

Phase 2.6 plans have been superseded by this foundation refactor. Real-world usage revealed fundamental architecture gaps:
- Tasks forced onto Today if unscheduled (no capture/backlog system)
- No project organization (needed: tags/categories)
- Inflexible workflow (needed: task states beyond complete/incomplete)

This refactor addresses these core issues before continuing feature development.

---

## Architectural Decisions

### ADR-009: Smart Lists Architecture
**Decision:** Replace separate smart list sections with "All" view + preset filters  
**Rationale:** Smart lists are filtered views, not distinct navigation items. Single source of truth is more flexible and matches mental model.  
**Status:** Deferred - Will implement after foundation is solid

### ADR-010: Quick Add Simplification  
**Decision:** Default to Title + Date, "Show more" toggle reveals other fields  
**Rationale:** 90% of captures need minimal fields. Progressive disclosure balances speed with power.  
**Implementation:** Phase 3.9

### ADR-011: Effort vs Focus → Complexity vs Energy
**Decision:** Keep two separate fields, rename for clarity  
- **Complexity** (1-5): How hard to think through?
- **Energy** (1-5): What state do I need to be in?  
**Rationale:** These are complementary dimensions, not redundant. Low complexity + high energy = routine task when tired. High complexity + high energy = deep work requiring peak state.  
**Implementation:** Phase 3.1 (schema rename)

### ADR-012: Task State Model
**Decision:** Implement 5-state system  
- **Unscheduled** - Captured, not on calendar yet
- **Scheduled** - Has a date/time, on calendar
- **In Progress** - Actively working on it
- **On Hold** - Paused/blocked, waiting on something
- **Completed** - Done

**Rationale:** Supports GTD-style workflow (capture → organize → schedule). "On Hold" is distinct from "someday/maybe" (use tags for that) - it means there's a specific blocker.  
**Implementation:** Phase 3.1 (schema), Phase 3.3 (UI)

### ADR-013: Tagging System
**Decision:** Freeform, multi-tag support on Tasks, Lists, and Notes  
**Format:** User-created tags, case-insensitive matching, stored as string array  
**Use cases:** Projects ("The Deck"), contexts ("@home", "@work"), areas ("Health", "Career")  
**Rationale:** Maximum flexibility. Users organize their way. Tags can reference across item types (task, list, note all tagged "The Deck").  
**Implementation:** Phase 3.2

### ADR-014: Navigation Structure
**Decision:** 3-page swipeable main area with hamburger for secondary features  

**Main Swipeable Area:**
- Left: **Unscheduled** (captured tasks, filterable by tag/complexity/energy)
- Center: **Calendar** (scheduled items, multiple view modes)
- Right: **Notes & Lists** (reference materials, also filterable by tags)

**Calendar View Modes:**
- Day (replaces old Today page)
- Week (replaces old Week page)
- Month (NEW)
- Custom: Work Week, Next 7 Days

**Hamburger Menu:**
- Habits
- Reminders
- Settings
- Future modules (Meals & Recipes, etc.)

**Rationale:** Related content views (Unscheduled ↔ Calendar ↔ Reference) in main swipe area. Less-frequent features in menu. Modern UX pattern.  
**Implementation:** Phase 3.6

### ADR-015: Notes as Distinct Type
**Decision:** Notes are separate from Lists, both coexist on same page  

**Notes:**
- Optional title
- Freeform text content
- Can have tags

**Lists:**
- Title + description (at list level)
- Checkbox items (simple text + completed state)
- Can have tags
- Can be pinned to top

**Rationale:** Different mental models. Notes = freeform capture. Lists = structured checklist. Both are reference material. Google Keep does this well.  
**Implementation:** Phase 3.5

---

## Data Model Changes

### Task Model (Updated)
```typescript
{
  id: string
  title: string
  description?: string              // notes field
  state: 'unscheduled' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed'
  date?: string                     // NULLABLE now
  time?: string
  duration?: number
  priority?: number
  complexity?: 1-5                  // renamed from effort
  energy?: 1-5                      // renamed from focus
  tags?: string[]                   // NEW
  recurrence?: {...}
  subtasks?: [{text, completed}]
  parentTaskId?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Note Model (NEW)
```typescript
{
  id: string
  title?: string                    // optional
  content: string                   // freeform text
  tags?: string[]
  createdAt: timestamp
  updatedAt: timestamp
}
```

### List Model (Updated)
```typescript
{
  id: string
  title: string
  description?: string              // NEW
  items: [{text, completed}]
  tags?: string[]                   // NEW
  pinned?: boolean                  // NEW - keep at top of view
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Event, Habit, Reminder Models
No changes needed for Phase 3.0. Can add tags later if desired.

---

## Implementation Phases

### Phase 3.1 - Data Model & Migration
**Goal:** Update schema, migrate existing data safely

**Tasks:**
1. Examine current schema (Prisma/TypeORM/SQL)
2. Create migration:
   - Add `state` enum to tasks (default: 'scheduled')
   - Add `tags` JSONB/array column to tasks, lists
   - Add `description` text to lists
   - Add `pinned` boolean to lists
   - Rename `effort` → `complexity`
   - Rename `focus` → `energy`
   - Make `date` nullable in tasks
3. Migrate existing data (all tasks → 'scheduled' state)
4. Update TypeScript types
5. Test migration locally

**Branch:** `feature/phase-3.1-data-model`

**Success Criteria:**
- [ ] Schema updated with all new fields
- [ ] Migration runs successfully  
- [ ] Existing data preserved
- [ ] TypeScript types match schema
- [ ] App runs without errors
- [ ] Can create/read/update tasks with new fields

---

### Phase 3.2 - Tag System
**Goal:** Build tagging infrastructure and UI components

**Tasks:**
1. Create TagInput component:
   - Multi-select interface
   - Autocomplete from existing tags
   - Create new tags on-the-fly
   - Remove tags (X button)
   - Visual: chip/badge display
2. Create TagFilter component:
   - Filter items by selected tags
   - AND/OR logic options
3. Tag management utilities:
   - Get all unique tags (for autocomplete)
   - Case-insensitive matching
   - Tag search
4. Update forms:
   - Add TagInput to task create/edit
   - Add TagInput to list create/edit
   - Prepare for notes (will use in Phase 3.5)

**Branch:** `feature/phase-3.2-tags`

**Success Criteria:**
- [ ] Can add tags to tasks
- [ ] Can add tags to lists
- [ ] Tags autocomplete from existing
- [ ] Can filter by tags
- [ ] Tags display as chips/badges
- [ ] Case-insensitive matching works

---

### Phase 3.3 - Unscheduled View
**Goal:** Create dedicated view for unscheduled tasks (inbox/backlog)

**Tasks:**
1. Create Unscheduled page component:
   - Display all tasks with state='unscheduled'
   - Empty state message
   - Task cards with drag handles
2. Filtering interface:
   - By tags (multi-select)
   - By complexity (1-5 range)
   - By energy (1-5 range)
   - By priority
3. Grouping options:
   - Group by tag
   - Group by complexity
   - Group by energy
   - Flat list (default)
4. Task state management:
   - When task gets a date → auto-change to 'scheduled'
   - When date removed → back to 'unscheduled'
   - Manual state changes: → 'in_progress', → 'on_hold'
   - State indicator badges on task cards
5. Update task creation:
   - If no date provided → state='unscheduled'
   - If date provided → state='scheduled'

**Branch:** `feature/phase-3.3-unscheduled-view`

**Success Criteria:**
- [ ] Unscheduled page exists and routes correctly
- [ ] Shows only unscheduled tasks
- [ ] Filtering works (tags, complexity, energy)
- [ ] Grouping options work
- [ ] State transitions work automatically
- [ ] Can manually change states
- [ ] Task cards show current state

---

### Phase 3.4 - Calendar Updates
**Goal:** Update Calendar to only show scheduled items, add view modes

**Tasks:**
1. Update Calendar data queries:
   - Only fetch tasks in 'scheduled' or 'in_progress' states
   - Continue showing events, habits, reminders as before
2. Add filter bar to Calendar:
   - All | Tasks | Events | Habits | Reminders
   - Apply across all view modes
   - Persist filter selection
3. Implement view mode switching:
   - Day view (migrate Today page logic)
   - Week view (existing Week page logic)
   - Month view (NEW - calendar grid component)
   - Custom views: Work Week (Mon-Fri), Next 7 Days
4. Month view specifics:
   - Calendar grid showing all days
   - Click day → switch to Day view for that date
   - Click week number → switch to Week view for that week
   - Show item counts per day
5. View mode persistence:
   - Remember user's preferred default view (localStorage or DB)
   - Setting to choose default on app open

**Branch:** `feature/phase-3.4-calendar-views`

**Success Criteria:**
- [ ] Calendar only shows scheduled/in-progress items
- [ ] Filter bar works across all views
- [ ] Day view works (migrated from Today)
- [ ] Week view works (existing logic)
- [ ] Month view displays correctly
- [ ] Can switch between view modes
- [ ] Month → Day/Week navigation works
- [ ] Default view setting works

---

### Phase 3.5 - Notes Feature
**Goal:** Add Notes as distinct type alongside Lists

**Tasks:**
1. Create Note schema and API:
   - Database model (already planned in 3.1, now implement)
   - API routes: create, read, update, delete
   - Validation
2. Rename "Lists" page → "Notes & Lists":
   - Update route
   - Update navigation labels
3. Create Note components:
   - NoteCard (display)
   - NoteForm (create/edit)
   - Freeform textarea with optional title
   - Tag support (use TagInput from Phase 3.2)
4. Update Lists:
   - Add description field to list forms
   - Description displays below title
   - List items remain simple (text + checkbox)
5. Combined view:
   - Show both Notes and Lists on same page
   - Filter toggle: All | Notes | Lists
   - Sort options: Recent, Alphabetical, Pinned first
6. Pin/unpin functionality:
   - Pin button on Notes and Lists
   - Pinned items always at top regardless of sort

**Branch:** `feature/phase-3.5-notes`

**Success Criteria:**
- [ ] Can create notes with optional title
- [ ] Can edit notes (inline or modal)
- [ ] Can add tags to notes
- [ ] Lists have description field
- [ ] Notes & Lists page shows both types
- [ ] Filter toggle works
- [ ] Can pin/unpin items
- [ ] Pinned items stay at top

---

### Phase 3.6 - Navigation Refactor
**Goal:** Implement swipeable 3-page navigation

**Tasks:**
1. Choose swipe library:
   - Evaluate: framer-motion, react-swipeable, react-spring
   - Implement chosen solution
2. Create SwipeContainer component:
   - Manages 3 pages: Unscheduled | Calendar | Notes/Lists
   - Smooth animations between pages
   - Touch gesture support
   - Keyboard navigation (arrow keys)
3. Page indicators:
   - Dots or tabs showing current page
   - Can tap to jump to page (not just swipe)
4. Update hamburger menu:
   - Remove: Today, Tasks, Week, Lists (now in swipe nav)
   - Keep: Habits, Reminders, Settings
   - Future: Meals & Recipes section
5. Default page on app open:
   - Calendar (center page)
   - Or remember last viewed page
6. Handle navigation from other pages:
   - Habits page → how to get back to swipe area?
   - Consider breadcrumb or back button

**Branch:** `feature/phase-3.6-navigation`

**Success Criteria:**
- [ ] Can swipe between 3 pages
- [ ] Animations are smooth
- [ ] Page indicators show current page
- [ ] Can tap indicators to jump
- [ ] Hamburger menu updated correctly
- [ ] Default page opens correctly
- [ ] Navigation from other pages works

---

### Phase 3.7 - FAB Menu
**Goal:** Global floating action button for creating items

**Tasks:**
1. Create FAB component:
   - Floating button (bottom-right on mobile, accessible position)
   - Plus icon default state
   - Expandable menu on click/tap
2. Menu options:
   - Task
   - Event
   - Habit
   - Reminder
   - List
   - Note
3. Menu behavior:
   - Expands upward (most common pattern)
   - Icons + labels for each option
   - Closes on selection or outside click
   - Animated expand/collapse
4. Wire to creation flows:
   - Each option opens appropriate form
   - Forms open as modal or slide-in panel
   - Pre-populate context if relevant (e.g., date if on Calendar)
5. Global positioning:
   - Works on all pages
   - Doesn't overlap critical content
   - Z-index management
6. Accessibility:
   - Keyboard accessible
   - Screen reader labels
   - Focus management

**Branch:** `feature/phase-3.7-fab`

**Success Criteria:**
- [ ] FAB visible on all pages
- [ ] Menu expands/collapses smoothly
- [ ] All 6 creation options work
- [ ] Forms open correctly
- [ ] FAB doesn't block content
- [ ] Keyboard accessible
- [ ] Mobile and desktop friendly

---

### Phase 3.8 - Drag & Drop Scheduling
**Goal:** Enable dragging tasks from Unscheduled → Calendar to schedule them

**Tasks:**
1. Choose drag-drop library:
   - Evaluate: react-beautiful-dnd, dnd-kit, react-dnd
   - Implement chosen solution
2. Make Unscheduled tasks draggable:
   - Drag handle on task cards
   - Visual feedback during drag (ghost image)
   - Constraints (can't drop on invalid targets)
3. Make Calendar dates/times droppable:
   - Drop zones in Day view (time slots)
   - Drop zones in Week view (day columns, time rows)
   - Drop zones in Month view (day cells)
   - Visual feedback on hover (highlight drop zone)
4. Handle drop:
   - Update task with new date/time
   - Change state: 'unscheduled' → 'scheduled'
   - Optimistic UI update
   - API call to persist
   - Error handling (revert on failure)
5. Reverse drag (scheduled → unscheduled):
   - Can drag task off Calendar
   - Special "Unscheduled" drop zone (sidebar or dedicated area)
   - Clears date, changes state back to 'unscheduled'
6. Within-calendar drag:
   - Drag scheduled task to different date/time
   - Updates date, keeps 'scheduled' state
7. Mobile considerations:
   - Long-press to initiate drag on touch devices
   - Touch feedback
   - Auto-scroll when dragging near edge

**Branch:** `feature/phase-3.8-drag-drop`

**Success Criteria:**
- [ ] Can drag unscheduled tasks
- [ ] Can drop on calendar dates/times
- [ ] Task gets scheduled correctly
- [ ] State changes to 'scheduled'
- [ ] Can drag scheduled tasks off calendar
- [ ] Task becomes unscheduled, date cleared
- [ ] Can reschedule by dragging within calendar
- [ ] Visual feedback works
- [ ] Works on mobile (touch)
- [ ] Error handling works

---

### Phase 3.9 - UI Polish & Bug Fixes
**Goal:** Address original Phase 2.6 issues, polish UX

**Tasks:**
1. Fix list editing bugs (BUG-001 from old Phase 2.6):
   - Text input shows full content (no overflow)
   - Fix title styling (too large)
   - Remove "Simple" tag
   - Restore quick add button at bottom of lists
2. Text wrapping fixes:
   - List items wrap properly
   - Task titles wrap in cards
   - No horizontal overflow anywhere
3. Quick Add simplification:
   - Default view: Title + Date only
   - "Show more" toggle button
   - Expanded view: Time, Priority, Complexity, Energy, Duration, Recurrence, Tags
   - Smooth expand/collapse animation
4. General UX improvements:
   - Loading states
   - Empty states with helpful messages
   - Error messages (user-friendly)
   - Success feedback (toasts/snackbars)
   - Confirm dialogs for destructive actions
5. Responsive design check:
   - Test all new features on mobile
   - Adjust layouts for small screens
   - Touch target sizes (min 44px)
6. Performance:
   - Optimize queries (only fetch what's needed)
   - Lazy load components
   - Debounce search/filter inputs
7. Testing:
   - Manual testing of all workflows
   - Test state transitions
   - Test data integrity
   - Test on different devices/browsers

**Branch:** `feature/phase-3.9-polish`

**Success Criteria:**
- [ ] List editing works correctly
- [ ] Text wrapping fixed everywhere
- [ ] Quick Add has simplified default view
- [ ] "Show more" toggle works
- [ ] All empty states have helpful messages
- [ ] Error handling is user-friendly
- [ ] Responsive on mobile
- [ ] Performance is acceptable
- [ ] No critical bugs

---

## Testing Strategy

### Per-Phase Testing
- Unit tests for new utilities/functions
- Component tests for new UI components
- Integration tests for state management
- Manual testing of user workflows

### End-to-End Testing (after Phase 3.9)
- Complete user journeys:
  - Capture task → tag it → schedule it → complete it
  - Create note → tag it → pin it → edit it
  - Create list → add items → check off → unpin
- Cross-feature interactions:
  - Tags work across tasks, notes, lists
  - Filters work correctly
  - Drag-drop updates states correctly
- Edge cases:
  - Empty states
  - No network
  - Concurrent edits
  - Long content

### Regression Testing
- Ensure existing features still work:
  - Events
  - Habits
  - Reminders
  - Recurrence

---

## Migration Strategy

### Development
1. Work in feature branches
2. Merge to `develop` branch for integration testing
3. Test full Phase 3.0 together before merging to `main`

### Database Migration
1. Backup production database before migration
2. Run migration on staging environment first
3. Verify data integrity
4. If successful, run on production
5. Keep rollback script ready

### User Communication
- If this is a shared/family app, notify users of upcoming changes
- Provide changelog or what's new guide
- Offer brief tutorial on new features (especially Unscheduled view, tags, states)

---

## Rollback Plan

If Phase 3.0 causes critical issues:

1. **Code rollback:** Revert to last stable commit on `main`
2. **Database rollback:** Restore from pre-migration backup
3. **Investigate issue:** Determine what went wrong
4. **Fix in feature branch:** Address the issue
5. **Re-test thoroughly:** Ensure fix works
6. **Re-deploy:** Try again when confident

---

## Post-Phase 3.0 Roadmap

Once foundation is solid, future phases can include:

### Phase 3.10 - Smart List Presets (ADR-009)
- Implement preset filters as buttons
- "Quick Wins" (low complexity, low energy)
- "Deep Work" (high complexity, high energy)
- "Waiting On" (state = on_hold)
- User-definable presets

### Phase 3.11 - Advanced Recurrence
- More flexible recurrence patterns
- Exclusions (every day except holidays)
- Nth day of month (first Monday, last Friday)

### Phase 3.12 - Collaboration Features
- Share tasks/lists with family members
- Assign tasks
- Comments/notes on tasks

### Phase 3.13 - Integrations
- Calendar sync (Google Calendar, Apple Calendar)
- Import/export
- Email → task

---

## Notes & Considerations

### Why Not Just Use Existing Tools?
This project is about building a tailored system that fits your family's workflow. Off-the-shelf tools require adapting to their models. This is your model.

### Technical Debt Decisions
- Not implementing robust error handling upfront (add when issues arise)
- Not building comprehensive test suite initially (focus on user-facing features)
- These are conscious trade-offs for speed; revisit as app matures

### AI Context Management
- Comprehensive inline comments in code
- Session wrap-up .md files capturing decisions
- This plan itself serves as context for future AI sessions
- Update this plan as phases complete or requirements change

---

## Session Management

After each work session:
1. Update phase status in this document
2. Check off completed success criteria
3. Document any deviations from plan
4. Update `next_session.md` with where to pick up
5. Commit changes with descriptive messages

---

**This document is the source of truth for Phase 3.0. Update it as the project evolves.**
