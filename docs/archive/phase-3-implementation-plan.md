# Phase 3.0 - Foundation Refactor
## Task Management Architecture Overhaul

**Status:** Phases 3.1–3.8 Complete ✅ | 3.9 Next
**Started:** January 30, 2026
**Last Updated:** February 2, 2026
**Branch:** `feature/phase-3.8-drag-drop` (merging to master)
**Production:** https://lifeos-dev.foster-home.net (PM2 on port 3002)

---

## Executive Summary

Phase 2.6 plans have been superseded by this foundation refactor. Real-world usage revealed fundamental architecture gaps:
- Tasks forced onto Today if unscheduled (no capture/backlog system)
- No project organization (needed: tags/categories)
- Inflexible workflow (needed: task states beyond complete/incomplete)

This refactor addresses these core issues. It also establishes the data foundation for the broader LifeOS system architecture decided on February 1 — see **Section: System Architecture** below for the full picture of where Phase 3 fits.

---

## System Architecture (Decided February 1, 2026)

Phase 3 isn't just a task app refactor. It's the shared data foundation for a three-layer system. Understanding this context matters for every schema and UI decision we make.

### The Three Layers

**Layer 1 — Knowledge Base** (source of truth, full detail)
Everything at its richest form: recipes with all variations, project roadmaps with dependencies, research captures, inventory, journals, homelab docs. This is the "Notion-like" layer. It is NOT a separate app — it is the **deep mode** interface of LifeOS.

**Layer 2 — LifeOS Quick-Access Portal** (what Phase 3 is building)
Surfaces relevant pieces of the knowledge base based on context. Optimized for speed and low cognitive load: what's due today, quick task capture, shopping lists, quick notes. This is the **focused mode** interface of LifeOS.

**Layer 3 — AI** (connective tissue, future)
Sees both layers. Processes voice captures into knowledge base entries, surfaces knowledge base context into tasks, proactive notifications, day summaries, dependency watching. The voice capture pipeline already in progress is the first proof-of-concept of this layer.

### The Two Modes (REPLACES the old /mobile and /desktop concept)

The UI distinction is **context-based, not device-based.** Two modes available on any device:

**Focused Mode** — streamlined, low cognitive load. 3-page swipe navigation. Quick capture, status checks, glance-and-go. Default on mobile (first launch only).

**Deep Mode** — full interface, all features. Sidebar/top nav. Table views, project tracking with completion and dependencies, configurable columns, knowledge base browsing, research clips, nested project content. Default on desktop (first launch only).

**Mode behavior:**
- Defaults are device-based on first-ever launch only
- After that, the app persists last state — both mode AND last page open
- App close and reopen returns to exactly where you left off
- Mode changes only on explicit user toggle
- Toggle location: TBD, likely single-tap icon in top bar (revisit during UI design)

**Route group naming:**
- `/app/(focused)` — focused mode (was previously called `/app/(mobile)`)
- `/app/(deep)` — deep mode (future phase, built after Phase 3 stabilizes)

### What Builds on What (Sequencing)

1. **Phase 3 as planned** — shared data foundation for both modes
2. **Blocked-by and research clips added to Phase 3 schema** — small additions now, not bolted on later
3. **Focused mode IS Phase 3's UI** — just with updated naming/mental model
4. **Deep mode comes after Phase 3 stabilizes** — new UI layer on same data
5. **Knowledge base content** (recipes, inventory, lists, homelab docs) — populated into deep mode after it exists
6. **AI layer and voice capture** — separate workstream, integrates once both knowledge base and capture pipeline are functional

---

## Architectural Decisions

### ADR-009: Smart Lists Architecture
**Decision:** Replace separate smart list sections with "All" view + preset filters
**Rationale:** Smart lists are filtered views, not distinct navigation items. Single source of truth is more flexible.
**Status:** Deferred — will implement after foundation is solid

### ADR-010: Quick Add Simplification
**Decision:** Default to Title + Date, "Show more" toggle reveals other fields
**Rationale:** 90% of captures need minimal fields. Progressive disclosure balances speed with power.
**Implementation:** Phase 3.9

### ADR-011: Effort vs Focus → Complexity vs Energy
**Decision:** Keep two separate fields, rename for clarity
- **Complexity** (1-5): How hard to think through?
- **Energy** (1-5): What state do I need to be in?
**Rationale:** Complementary dimensions. Low complexity + high energy = routine task when tired. High complexity + high energy = deep work requiring peak state.
**Implementation:** Phase 3.1 ✅ COMPLETE

### ADR-012: Task State Model
**Decision:** 5-state system
- **Unscheduled** — Captured, not on calendar yet
- **Scheduled** — Has a date/time, on calendar
- **In Progress** — Actively working on it
- **On Hold** — Paused, waiting on something (reason is contextual, not structural)
- **Completed** — Done

**Rationale:** Supports GTD-style workflow. "On Hold" is distinct from "someday/maybe" (use tags for that) — it means there's a specific reason it's paused. It is also distinct from "Blocked By" — see ADR-016.
**Implementation:** Phase 3.1 ✅ COMPLETE

### ADR-013: Tagging System
**Decision:** Freeform, multi-tag support on Tasks, Lists, Notes, and Research Clips
**Format:** User-created tags, case-insensitive matching, stored as string array
**Use cases:** Projects ("The Deck"), contexts ("@home", "@work"), areas ("Health", "Career")
**Rationale:** Maximum flexibility. Tags are the primary way to organize across item types. A task, a note, a recipe, and a research clip can all be tagged "The Deck" and the system treats them as related.
**Implementation:** Phase 3.2 ✅ COMPLETE

### ADR-014: Navigation Structure
**Decision:** 3-page swipeable main area (focused mode) with hamburger for secondary features

**Focused Mode — Main Swipeable Area:**
- Left: **All Tasks** (all tasks with filtering by state/tag/complexity/energy)
- Center: **Calendar** (scheduled items, timeline and compact view modes)
- Right: **Notes & Lists** (reference materials, filterable by tags)

**Focused Mode — Hamburger Menu:**
- Habits
- Reminders
- Settings
- Future modules (Meals & Recipes, etc.)

**Deep Mode — Navigation (future phase):**
- Sidebar or top nav giving access to: Tasks, Projects, Calendar, Knowledge Base, Research Clips, Inventory, and other content areas
- Table views with configurable columns
- Project boards and timelines

**Rationale:** Focused mode keeps the surface area tight for quick interactions. Deep mode opens everything up for planning and organizing. Same data, different presentation density.
**Implementation:** Phase 3.6 (focused mode nav)

### ADR-015: Notes as Distinct Type
**Decision:** Notes are separate from Lists, both coexist on same page
- **Notes:** Optional title, freeform text content, tags
- **Lists:** Title + description, checkbox items, tags, pinnable
**Rationale:** Different mental models. Notes = freeform capture. Lists = structured checklist.
**Implementation:** Phase 3.5 ✅ COMPLETE

### ADR-016: Blocked-By as a Relationship (NEW — February 1)
**Decision:** "Blocked By" is a structural dependency relationship, distinct from "On Hold" state

| Concept | What it means | How the system knows | AI behavior |
|---|---|---|---|
| On Hold | Paused by choice or circumstance ("waiting for spring") | State field on task | Surfaces periodically to check if conditions changed |
| Blocked By | Hard dependency on another task/project ("need server build done first") | Foreign key relationship to blocker task(s) | Watches blocker; notifies when blocker completes |

A task can be On Hold AND Blocked By simultaneously, or either independently. They are orthogonal.

**Schema:** `blockedBy: TaskID[]` — many-to-many relationship on tasks
**Rationale:** The AI layer needs structured dependency data to do useful things like "hey, you finished the server build, this service deployment is unblocked now." That only works if the dependency is a relationship in the database, not just a status.
**Implementation:** Phase 3.1 schema addition (migration)

### ADR-017: Research Capture as Content Type (NEW — February 1)
**Decision:** Research clips are a distinct content type alongside Tasks, Notes, and Lists

**Use case:** You find a Reddit thread, blog post, or image while browsing. You want to pin it to a project or topic so it lives in your knowledge base and is findable later.

**Schema:**
```
ResearchClip {
  id
  url: string (required)
  title: string (auto-populated from page title, editable)
  screenshot: image (optional)
  notes: text (optional — user's commentary)
  tags: string[] (same tagging system as everything else)
  projectRef: TaskID or ProjectTag (optional, links to a project)
  createdAt: timestamp
}
```

**Capture scope:** Available on both mobile and desktop. Mobile = quick capture (url + tag). Desktop = full detail editing.
**Rationale:** Research capture is core to the knowledge base layer. It uses the same tagging system so clips are findable alongside related tasks and notes. Quick capture on mobile fits the focused mode philosophy — grab it fast, flesh it out later in deep mode.
**Implementation:** Phase 3.1 schema addition (migration). UI in a later phase.

### ADR-018: Nested Content in Projects (NEW — February 1)
**Decision:** Projects can contain nested pages/content, constrained to ~2-3 levels max

**Example:** Project "The Deck" → Planning (page) → Material List, Timeline, Design Ideas (child pages)

**Model:** Parent-child relationship on notes/pages within a project context. Not arbitrary-depth nesting — shallow hierarchy for organization.
**Rationale:** Users need to organize related content under a project without it becoming a full document tree. Tags handle the "what project does this belong to" question. Nesting handles the "how is the content within this project organized" question.
**Implementation:** Schema support in Phase 3.1. UI in deep mode (future phase).

---

## Data Model

### Task Model (Current — Phase 3.1 complete)
```typescript
{
  id: string
  title: string
  description?: string
  state: 'unscheduled' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed'
  date?: string                     // nullable
  time?: string
  duration?: string                 // user-friendly ("1-2hours")
  durationMinutes?: number          // auto-calculated for timeline rendering
  priority?: number
  complexity?: 1-5                  // renamed from effort
  energy?: 1-5                      // renamed from focus
  tags?: string[]
  recurrence?: {...}
  subtasks?: [{text, completed}]
  parentTaskId?: string
  projectId?: number                // NEW (Phase 3.6) — optional association to a Project
  showOnCalendar?: boolean          // pin to today feature
  blockedBy?: string[]              // NEW (ADR-016) — array of task IDs this task depends on
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Note Model (Current — Phase 3.5 complete)
```typescript
{
  id: string
  title?: string                    // optional
  content: string                   // freeform text
  tags?: string[]
  pinned?: boolean
  parentNoteId?: string             // NEW (ADR-018) — for nested content, nullable
  createdAt: timestamp
  updatedAt: timestamp
}
```

### List Model (Current — Phase 3.5 complete)
```typescript
{
  id: string
  title: string
  description?: string
  items: [{text, completed}]
  tags?: string[]
  pinned?: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### ResearchClip Model (NEW — ADR-017, needs migration)
```typescript
{
  id: string
  url: string                       // required
  title: string                     // auto-populated, editable
  screenshot?: string               // image path/url, optional
  notes?: string                    // user commentary
  tags?: string[]                   // same tagging system
  projectRef?: string               // optional tag or task ID linking to a project
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Project Model (NEW — Phase 3.6, added Feb 1 2026)
```typescript
{
  id: number
  userId: string
  name: string                      // Project name
  description?: string              // Optional description
  status: 'backlog' | 'in_progress' | 'on_hold' | 'completed'
  blockedBy?: number[]              // Array of project IDs this project depends on
  targetDate?: DateTime             // Optional target completion date
  tags?: string[]                   // Same tagging system
  createdAt: timestamp
  updatedAt: timestamp
  tasks: Item[]                     // Tasks associated with this project
}
```

**Note:** Tasks have an optional `projectId` field linking them to a Project. This is an association, not containment — tasks remain in the `items` table and optionally reference a project.

### Event, Habit, Reminder Models
No changes needed for Phase 3.0. Can add tags later if desired.

---

## Implementation Phases

### Phase 3.1 - Data Model & Migration ✅ COMPLETE
**Completed:** January 30, 2026 (initial), February 1, 2026 (supplement)

What was built: state enum, tags, complexity/energy rename, nullable dates, subtasks, showOnCalendar, durationMinutes.

**Supplemental migrations (February 1, 2026):**
- ✅ `blockedBy` field on tasks (JSONB array) — ADR-016
- ✅ `ResearchClip` model — ADR-017
- ✅ `parentNoteId` on notes (nullable) — ADR-018
- ✅ `Project` model with status, blockedBy, targetDate, tags
- ✅ `projectId` on tasks (optional association)

All schema foundations complete and ready for future phases.

---

### Phase 3.2 - Tag System ✅ COMPLETE
**Completed:** January 30, 2026

TagInput component with autocomplete, multi-tag support on tasks and lists, tag filtering. Works across all item types that have tags.

---

### Phase 3.3 - All Tasks View ✅ COMPLETE
**Completed:** January 30, 2026

`/tasks` route with filtering by state, tags, complexity, energy. State badges. 

**Known issue:** Clicking task in /tasks previously navigated to Today instead of opening modal. **Fixed in Phase 3.5 UI polish** — TaskForm modal now opens correctly.

---

### Phase 3.4 - Calendar View Modes ✅ COMPLETE
**Completed:** January 31, 2026
**See:** `phase-3.4-complete-summary.md` for full details

Timeline mode (hour axis 5am–11pm, zoom controls) and compact mode (categorized list). View toggle persists. Duration auto-calculation. Pin to today. Categorized sections: Reminders, Overdue, In Progress, Scheduled, Quick Captures.

**What was originally planned but deferred:** Week/Month views. Current implementation focuses on single-day with two visualization modes (timeline vs compact). Week/Month views can be added later if needed.

---

### Phase 3.5 - Notes Feature + UI Polish ✅ COMPLETE
**Completed:** January 31, 2026

Notes API (GET/POST/PATCH/DELETE at `/api/notes`). NoteCard and NoteForm components. Combined "Notes & Lists" page at `/lists`. Filtering (All | Notes | Lists), sorting (Recent | Alphabetical), pin/unpin. ListCard component. FAB replaces header buttons. Back button/gesture on all modals.

**UI Polish completed in this phase:**
- Header → "Notes & Lists"
- Removed duplicate heading, delete buttons from cards, Smart Lists feature and Simple badges
- FAB (Floating Action Button) added
- Back button/gesture support on all modals (NoteForm, ListForm, TaskForm)
- All Tasks click bug fixed (TaskForm modal)

**Still to do (post Phase 3.6):**
- Sidebar label update to "Notes & Lists" in `components/Sidebar.tsx`
- TaskForm styling consistency with other modals
- Pin button inside list detail view
- Delete buttons inside detail views (note/list/task)

---

### Phase 3.6 - Navigation Refactor
**Goal:** Swipeable 3-page navigation (focused mode)

**Tasks:**
1. Choose swipe library (evaluate: framer-motion, react-swipeable, react-spring)
2. Create SwipeContainer component:
   - 3 pages: All Tasks ↔ Calendar ↔ Notes & Lists
   - Smooth animations
   - Touch gesture support
   - Keyboard navigation (arrow keys)
3. Page indicators (dots or tabs, tappable to jump)
4. Update hamburger menu:
   - Remove: Today, Tasks, Week, Lists (now in swipe nav)
   - Keep: Habits, Reminders, Settings
   - Future: Meals & Recipes
5. Default page: Calendar (center). Remember last viewed page.
6. Handle navigation back from Habits/Reminders/Settings pages

**Route group:** This navigation IS the focused mode layout. Route group should be `/app/(focused)`.

**Success Criteria:**
- [ ] Can swipe between 3 pages
- [ ] Animations smooth
- [ ] Page indicators show current page, tappable
- [ ] Hamburger menu updated
- [ ] Last viewed page persists across app close/reopen
- [ ] Navigation from secondary pages (Habits, etc.) works

**Branch:** `feature/phase-3.6-navigation`

---

### Phase 3.7 - FAB Menu
**Goal:** Global floating action button for creating any item type

**Note:** FAB component already exists from Phase 3.5 UI polish. This phase expands it into a full creation menu.

**Tasks:**
1. Expand FAB into multi-option menu:
   - Task, Event, Habit, Reminder, List, Note
   - Future: Research Clip (once UI is built)
2. Menu behavior: expands upward, icons + labels, closes on selection or outside click, animated
3. Wire each option to appropriate creation form (modal or slide-in)
4. Pre-populate context where relevant (e.g., date if on Calendar page)
5. Global positioning — works on all pages, doesn't overlap content

**Success Criteria:**
- [ ] FAB visible on all pages
- [ ] Menu expands/collapses smoothly
- [ ] All creation options work
- [ ] Context pre-population works
- [ ] Keyboard accessible

**Branch:** `feature/phase-3.7-fab`

---

### Phase 3.8 - Drag & Drop Scheduling ✅ COMPLETE
**Completed:** February 2, 2026
**Goal:** Bidirectional drag-and-drop following ADR-012 state model

**What Was Built:**
1. ✅ Implemented ADR-012 revised state model (4 states: backlog | active | in_progress | completed)
2. ✅ Fixed date timezone bug (parseLocalDate helper for both saving and display)
3. ✅ Added BacklogSidebar component (droppable)
4. ✅ TaskForm auto-promotes backlog→active when date is added
5. ✅ Forward drag operations:
   - Drag from Backlog → Timeline (schedules with time)
   - Drag from Scheduled → Timeline (reschedules)
   - Drag from Overdue → Timeline (reschedules)
6. ✅ Reverse drag operations:
   - Drag from Timeline → Backlog Sidebar (unschedules)
   - Drag from Timeline → "Scheduled (No Time)" (removes time, keeps date)
   - Drag within Timeline (reschedule)
7. ✅ Visual feedback on all drop zones
8. ✅ Desktop functionality fully tested and working

**Success Criteria:**
- [x] Can drag tasks onto calendar from backlog/scheduled/overdue
- [x] Task gets scheduled correctly (date, time, state auto-promotion per ADR-012)
- [x] Can drag tasks off calendar to backlog (unschedules completely)
- [x] Can drag tasks to scheduled-no-time (removes time)
- [x] Can reschedule within calendar
- [x] Visual feedback throughout
- [ ] Works on mobile (touch) - **Testing in Phase 3.9**

**Branch:** `feature/phase-3.8-drag-drop`

---

### Phase 3.9 - Mobile Testing, UI Polish & Bug Fixes
**Goal:** Test mobile D&D, polish UX, fix bugs, simplify Quick Add

**Status:** Next Up

**Tasks:**
1. **Mobile D&D Testing:**
   - Test all drag-and-drop operations on mobile/touch devices
   - Verify touch sensors work correctly (250ms delay, 5px tolerance)
   - Adjust mobile UX if needed (touch feedback, scroll behavior, hit targets)
   - Test on both phone and tablet sizes

2. **Quick Add Simplification (ADR-010):**
   - Default: Title + Date only
   - "Show more" toggle reveals: Time, Priority, Complexity, Energy, Duration, Recurrence, Tags
   - Applies to TaskForm when creating new tasks

3. **UI Polish:**
   - TaskForm styling consistency with other modals
   - Text wrapping fixes across all components
   - Empty states, loading states, error messages
   - Success feedback, confirm dialogs where appropriate

4. **Bug Fixes:**
   - Address any small bugs discovered during testing
   - Edge case handling (long content, empty data, etc.)

5. **Performance:**
   - Optimize queries if needed
   - Check for any lag during drag operations
   - Debounce inputs where appropriate

6. **Full Manual Testing:**
   - Test all features across devices (phone, tablet, desktop)
   - Verify all Phase 3.8 features work on production

**Success Criteria:**
- [ ] Drag-and-drop works smoothly on mobile devices
- [ ] Quick Add form simplified and tested
- [ ] No visual bugs or UX issues
- [ ] Performance is acceptable on all devices
- [ ] All edge cases handled gracefully

**Branch:** `feature/phase-3.9-polish`

---

## Post-Phase 3.0 Roadmap

### Phase 3.10 - Overdue Persistence Feature
**Goal:** Make overdue status persistent until explicitly cleared

**User Request:** "Overdue items stay red at the top even after getting a new date/time. They don't leave overdue status until explicitly unmarked or completed."

**Current behavior:** Overdue is calculated as `state='active' AND date < today`, so rescheduling automatically removes items from overdue section.

**Implementation:**
1. Add `isOverdue` boolean flag to task schema (requires migration)
2. Add "Clear Overdue" action button/UI element
3. Update overdue logic:
   - Item becomes overdue when date passes AND not completed
   - Item stays overdue even after rescheduling until explicitly cleared
   - Clearing overdue: manual action OR completing the task
4. Update UI to show overdue flag and clear action

**Success Criteria:**
- [ ] Task becomes marked overdue when date passes
- [ ] Rescheduling task doesn't clear overdue flag
- [ ] User can explicitly clear overdue status
- [ ] Completing task clears overdue flag
- [ ] Overdue items visually distinct (red, at top)

**Branch:** `feature/phase-3.10-overdue-persistence`

---

### Phase 3.11 - Schema Migration Supplement (if needed)
Add any remaining items from ADR-016, ADR-017, ADR-018 if not already added during Phase 3.1 patch:
- `blockedBy` on tasks
- `ResearchClip` model
- `parentNoteId` on notes

**Note:** Most of these were added in Phase 3.1 migrations. This is a catch-all for any missed items.

### Phase 3.12 - Deep Mode UI (Future)
The second interface layer. Sidebar nav, table views with configurable columns, project tracking (completion %, blocked-by visualization), knowledge base browsing, research clip management, nested project content. Built on the same data as focused mode — no new backend work, just a richer frontend.

### Phase 3.13 - Smart List Presets (ADR-009)
Preset filter buttons: "Quick Wins" (low complexity, low energy), "Deep Work" (high complexity, high energy), "Waiting On" (on hold), user-definable presets.

### Phase 3.14 - Collaboration Features
Share tasks/lists with family. Assign tasks. Both users see shared recipes, movie lists, calendars. Basic shared family account — not a full permission system.

### Phase 3.15 - Integrations
Google Calendar (already done — read-only sync). Gmail integration (future). Extensible integration layer so adding new sources isn't a rebuild each time.

### Phase 3.16 - Research Clip UI
Capture interface on both mobile (quick: url + tag) and desktop (full detail). Browse and filter clips. Link clips to projects via tags.

---

## Testing Strategy

### Per-Phase
- Component and integration testing as features are built
- Manual testing of user workflows after each phase
- Test on mobile (phone + tablet) and desktop

### End-to-End (after Phase 3.9)
- Full user journeys: capture → tag → schedule → complete
- Cross-feature: tags work across tasks/notes/lists/clips, filters correct, drag-drop updates states
- Edge cases: empty states, long content, concurrent edits

### Regression
- Events, Habits, Reminders, Recurrence still work after each phase

---

## Migration Strategy

1. Work in feature branches
2. Merge to develop for integration testing
3. Full Phase 3.0 test before merging to main
4. Backup production DB before any migration
5. Run migration on staging first, verify, then production
6. Keep rollback script ready

---

## Rollback Plan

1. Code rollback to last stable commit on main
2. Database restore from pre-migration backup
3. Investigate, fix in feature branch, re-test, re-deploy

---

## Notes & Considerations

### Why Not Just Use Existing Tools?
This project is about building a system tailored to your family's workflow. Off-the-shelf tools require adapting to their models. This is your model. The composable headless approach (Vikunja/Memos as backends) was explored and rejected — custom build gives full control over schema, UI, and AI integration without fighting someone else's abstractions.

### Technical Debt Decisions
- Not implementing robust error handling upfront (add when issues arise)
- Not building comprehensive test suite initially (focus on user-facing features)
- Conscious trade-offs for speed; revisit as app matures

### AI Context Management
- Inline comments in code
- Session wrap-up .md files
- This plan is the source of truth — update it as phases complete or requirements change

---

## Session Management

After each work session:
1. Update phase status in this document
2. Document any deviations from plan
3. Update `next_session.md` with where to pick up
4. Commit with descriptive messages

---

**This document is the source of truth for Phase 3.0 and the LifeOS system architecture. Update it as the project evolves.**
