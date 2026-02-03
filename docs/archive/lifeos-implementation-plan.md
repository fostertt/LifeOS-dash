# LifeOS Implementation Plan

_Last Updated: February 2, 2026_

## System Architecture

LifeOS is not just a task app—it's a three-layer system with a shared data foundation. Understanding this context matters for every schema and UI decision.

### The Three Layers

**Layer 1 — Knowledge Base** (source of truth, full detail)  
Everything at its richest form: recipes with all variations, project roadmaps with dependencies, research captures, inventory, journals, homelab docs. This is the "Notion-like" layer. It is NOT a separate app—it is the Deep Mode interface of LifeOS.

**Layer 2 — LifeOS Quick-Access Portal** (what Phase 3 is building)  
Surfaces relevant pieces of the knowledge base based on context. Optimized for speed and low cognitive load: what's due today, quick task capture, shopping lists, quick notes. This is the Focused Mode interface of LifeOS.

**Layer 3 — AI** (connective tissue, future)  
Sees both layers. Processes voice captures into knowledge base entries, surfaces knowledge base context into tasks, proactive notifications, day summaries, dependency watching. The voice capture pipeline already in progress is the first proof-of-concept of this layer.

### The Two Modes

The UI distinction is context-based, not device-based. Two modes available on any device:

**Focused Mode** — streamlined, low cognitive load. Multi-page navigation. Quick capture, status checks, glance-and-go. Default on mobile (first launch only).

**Deep Mode** — full interface, all features. Sidebar/top nav. Table views, project tracking with completion and dependencies, configurable columns, knowledge base browsing, research clips, nested project content. Default on desktop (first launch only).

**Mode Behavior:**

- Defaults are device-based on first-ever launch only
- After that, the app persists last state—both mode AND last page open
- App close and reopen returns to exactly where you left off
- Mode changes only on explicit user toggle
- Toggle location: TBD, likely single-tap icon in top bar

---

## Phase 3: Task Management System

### Status: ~95% Complete

**Completed:**

- ✅ Core task CRUD operations
- ✅ Task states: Active, Backlog, Someday, Snoozed, Completed, Cancelled
- ✅ Calendar integration with drag-and-drop scheduling
- ✅ Task relationships (parent/child with context switching)
- ✅ Quick capture flow
- ✅ PostgreSQL migration from SQLite
- ✅ Basic filtering and search

**Remaining Cleanup:**

- Items in next_session.md
- Polish UI/UX based on real usage
- Performance optimization if needed
- Minor bug fixes as discovered

### Current Focused Mode Views

1. **Today** - Single day view of scheduled tasks
2. **Backlog** - Unscheduled tasks
3. **Search** - Filter and find tasks

---

## Phase 3.5: Calendar Enhancements

### Goal

Replace single-day "Today" view with flexible calendar views that can show multiple days/weeks/months.

### Calendar Views

**View Options:**

- **Today** (single day) - default
- **Week** (7 days)
- **Work Week** (Monday-Friday)
- **Next X Days** (user configurable, 2-31 days)
- **Month** (calendar month view)

**Features:**

- Tasks display on their scheduled dates
- Drag-and-drop to reschedule
- Visual distinction for different task states
- Quick create from any date cell

**Implementation Notes:**

- User can switch between views via dropdown/tabs/swipe
- Preference persists across sessions
- All views share same underlying task data
- Must work in both mobile and desktop layouts

**Build Priority:** Complete before Recipe/Meal System

---

## Phase 3.75: Recipe & Meal Planning System

### Overview

A recipe management and meal planning system integrated into LifeOS. Recipes are searchable, taggable, and can be planned onto a calendar. Simple meals without recipes (like "Sausages" or "Leftovers") are also supported.

### Data Model

#### Core Tables

**recipes**

- id
- name
- instructions (markdown)
- personal_notes (single editable text field for tweaks/observations)
- prep_time, cook_time, servings
- is_favorite (boolean)
- last_used_at (timestamp)
- created_at, updated_at

**recipe_ingredients**

- id
- recipe_id
- item_name
- quantity
- unit
- order (for display sequence)

**tags**

- id
- name
- created_at

**recipe_tags** (many-to-many)

- recipe_id
- tag_id

**meal_plans**

- id
- date
- meal_time (breakfast, lunch, dinner)
- recipe_id (nullable - links to specific recipe)
- meal_name_override (nullable - for simple meals like "Sausages", "Leftovers")
- notes
- created_at

**grocery_lists**

- id
- name
- is_default (boolean)
- created_at

**grocery_items**

- id
- list_id
- item_name
- quantity
- unit
- recipe_id (nullable - tracks source for context)
- checked (boolean)
- added_at

### Key Concepts

**Recipes Are Independent Entities**

- Recipes exist on their own (no mandatory "meal" grouping)
- Can have 500 recipes in the system
- Each recipe is searchable, taggable, browsable
- Some might be linked to meal plans, some might never be used

**Tags Replace Meal Categories**

- User creates tags: "quick", "mac n cheese", "fancy", "one pot", "pasta", "kids", etc.
- Recipes can have multiple tags
- Filter/search by any combination of tags
- No special "meal type" distinction—all tags are equal

**Meal Planning Flexibility**

- Can drag a recipe to a calendar slot (breakfast/lunch/dinner)
- Can type a simple meal name for things without recipes ("Sausages", "Leftovers")
- Autocomplete suggests: recipe names, previously used meal_name_override entries
- Click planned meal → opens recipe (if linked) or just shows notes

**Grocery List Integration**

- From a recipe, quick-add specific ingredients or "add all"
- Quantities preserved from recipe
- Source recipe tracked for context
- Check off items while shopping

### User Flows

#### Flow 1: Add Standalone Recipe

1. Create new recipe "Grandma's Meatloaf"
2. Add ingredients (paste-and-parse or manual entry)
3. Add instructions, notes, times
4. Tag it: "comfort food", "meat", "weeknight"
5. Recipe is now searchable/browsable

#### Flow 2: Plan Recipe on Calendar

1. Open meal planning view (calendar-like interface)
2. Search/filter recipes by tags, favorites, or recents
3. Drag "Grandma's Meatloaf" to Wednesday dinner
4. Calendar shows "Grandma's Meatloaf"
5. Click it → opens full recipe for cooking

#### Flow 3: Plan Simple Meal (No Recipe)

1. Click Thursday dinner slot
2. Type "Sausages"
3. Autocomplete suggests previous uses
4. Select or create new entry
5. Calendar shows "Sausages"
6. Click it → just shows notes field (no recipe to open)

#### Flow 4: Add Ingredients to Grocery List

1. Open recipe "Grandma's Meatloaf"
2. Click "Add to Grocery List"
3. Select specific ingredients or "Add All"
4. Ingredients added with quantities to default grocery list
5. Can view/edit grocery list, check items off

#### Flow 5: Browse and Filter Recipes

1. Open recipe browse view
2. Filter by tag "quick" → see all quick recipes
3. Filter by tag "mac n cheese" → see all mac variations
4. Filter by "favorites" → see starred recipes
5. Sort by "recently used" → see what you've cooked lately

### Ingredient Paste-and-Parse

**Goal:** Let users copy/paste ingredient lists from websites and auto-parse into structured data.

**Approach:**

- Accept raw text input (e.g., "2 cups flour", "1 tablespoon olive oil", "3 cloves garlic, minced")
- Parse into: quantity, unit, item_name
- Show parsed result for user to review/edit before saving
- Handle 80%+ of common recipe formats
- Manual fallback for weird formats

**Implementation:** Build parser that looks for patterns, not perfect AI solution.

### Focused Mode UI

**Recipe Browse View:**

- Searchable list of all recipes
- Filter by tags (multi-select)
- Filter by favorites
- Sort by: name, recently used, recently added
- Click recipe → view full recipe

**Meal Planning View:**

- Calendar-like interface showing week or month
- Three rows per day: Breakfast, Lunch, Dinner
- Drag recipes from browse panel onto meal slots
- Type meal names directly into slots (autocomplete)
- Visual distinction between recipes and simple meals
- Click meal → open recipe or notes

**Recipe Detail View (Cooking Mode):**

- Recipe name and tags
- Prep/cook time, servings
- Ingredients list (with quick-add to grocery)
- Instructions
- Personal notes (editable)
- "Add to Grocery List" button

**Recipe Ideas:**

- Simple notes section (not tied to specific recipes)
- Capture links to recipes found online
- Jot down meal ideas or thoughts
- No complex structure—just a scratchpad

### Deep Mode UI

**Status:** Design TBD

**Concept:**

- All recipe/meal planning info accessible on one view
- Possible layout: weekly meal plan across top, today's recipe in center, notes on left, grocery list on right, idea bar across bottom
- Easier navigation and editing than Focused Mode
- Full keyboard shortcuts and power-user features

**Note:** Deep Mode design will be revisited after Focused Mode is complete and in use.

### Build Order

**Phase 1: Core Recipe System**

1. Database migrations (all tables above)
2. Recipe CRUD (create/edit/delete)
3. Ingredient paste-and-parse feature
4. Tag management (create tags, apply to recipes)
5. Recipe browsing (search, filter by tags, favorites, recents)

**Phase 2: Meal Planning** 6. Meal planning calendar view (week/month layouts) 7. Drag recipes to calendar slots 8. Type simple meal names with autocomplete 9. Click to view recipe or notes

**Phase 3: Grocery Integration** 10. Quick-add ingredients from recipe 11. Grocery list CRUD 12. Check off items while shopping

**Phase 4: Polish** 13. Recipe ideas notes section 14. UX refinements based on real usage 15. Performance optimization

**Phase 5: Deep Mode (Future)** 16. Design all-in-one Deep Mode layout 17. Implement keyboard shortcuts and power features

---

## Future: Deep Mode (Needs Planning)

### Concept

Deep Mode is the full-featured "Notion-lite" interface for LifeOS. It provides access to the complete knowledge base with all entities at their richest detail.

### Planned Entities

**Projects**

- Roadmaps with dependencies
- Task rollup and completion tracking
- Project-level notes and documentation
- Timeline views

**Recipes** (Deep Mode view)

- See Phase 3.75 above for data model
- Deep Mode provides all-in-one editing and meal planning view

**Research & Knowledge Clips**

- Capture information from various sources
- Tag and categorize
- Link to projects and tasks

**Homelab Documentation**

- Infrastructure docs
- Configuration details
- Troubleshooting notes
- **Note:** Need to determine relationship with existing homelab repo—sync, import, or replace as source of truth?

**Inventory** (Future)

- Track what you have
- Low stock alerts
- Auto-suggest grocery list items
- Integration with recipes (what can I make with what I have?)

**Journals & Notes**

- Daily journals
- General notes and ideas
- Quick capture that doesn't fit elsewhere

### Design Considerations

**Navigation:**

- Sidebar navigation (always visible)
- Quick switcher (keyboard shortcut to jump between entities)
- Breadcrumbs for nested content

**Layout:**

- Configurable columns/panels
- Drag-and-drop organization
- Table views with sortable/filterable columns

**Mode Toggle:**

- Single button/icon to switch between Focused and Deep modes
- Maintains context (what you were viewing)
- Location: Top bar, always accessible

### Open Questions

- Which entity to build first? (Recommendation: Projects, since they tie to existing tasks)
- Do all entities need to be complete before Phase 4 AI, or build iteratively?
- How does homelab documentation integrate? (Sync from repo, or LifeOS becomes source of truth?)
- What's the relationship between Projects in Deep Mode and tasks in Focused Mode?

**Status:** This section requires dedicated planning session before implementation.

---

## Phase 4: AI Integration

### Goal

Layer 3 of the system architecture—AI that sees both Focused and Deep modes and acts as connective tissue.

### Planned Features

**Voice Capture Pipeline** (In Progress)

- Capture fleeting thoughts before they disappear ("microwave moments")
- Process voice into structured entries (tasks, notes, meal ideas, etc.)
- Context-aware placement (routing to correct entity)

**Task Suggestions**

- AI suggests next actions based on projects and context
- Proactive notifications for upcoming deadlines
- Dependency watching (alert when blockers are resolved)

**Day Summaries**

- End-of-day recap of what was accomplished
- Morning briefing of what's coming up
- Insights on patterns and productivity

**Knowledge Base Context**

- Surface relevant knowledge base entries when viewing tasks
- Suggest recipes based on what's in inventory
- Link research clips to active projects

**Advanced Filtering**

- Natural language queries ("show me quick dinners I haven't made in a while")
- Smart suggestions based on usage patterns

### Implementation Notes

- Requires both Focused and Deep modes to be functional
- Voice capture is first proof-of-concept
- Build incrementally based on real usage patterns

**Status:** Phase 4 begins after Phase 3.75 (Recipe System) is complete and in production use.

---

## Parking Lot: Future Enhancements

Ideas for later consideration:

**Inventory Management**

- Track pantry/fridge/freezer contents
- "What can I make with what I have?" feature
- Auto-add to grocery list when last item used
- Low stock alerts

**Recipe Scaling**

- Automatically adjust ingredient quantities for different serving sizes
- Unit conversion (cups to grams, etc.)

**Meal Prep Planning**

- Multi-day meal prep scheduling
- Batch cooking support
- Leftover tracking and usage

**Time Tracking** (from original Phase 4 concept)

- Track actual time spent on tasks
- Compare estimates to actuals
- Productivity insights

**Mobile Optimization** (from original Phase 4 concept)

- Native mobile app considerations
- Offline support
- Mobile-specific UX refinements

**Advanced Project Features**

- Gantt charts
- Resource allocation
- Budget tracking

---

## Technical Decisions Log

### Database: PostgreSQL

- Migrated from SQLite in Phase 3
- Supports complex queries and relationships
- Scales with future growth

### Frontend: Next.js + TypeScript

- Server-side rendering for performance
- Type safety across codebase
- Good DX for rapid iteration

### Hosting: Dual-server homelab

- **foster-forge:** Development and AI workloads (RTX 5060Ti 16GB)
- **foster-core:** Production services (Plex, Pi-hole, Vaultwarden, LifeOS prod)
- VS Code Remote-SSH for all server work

### Development Workflow

- Separate dev and prod environments
- Git-based deployments
- Incremental rollout of features

---

## Success Criteria

**Phase 3 (Task Management):**

- ✅ Daily task management works smoothly
- ✅ Can schedule, reschedule, and complete tasks without friction
- ✅ Quick capture is genuinely quick
- ✅ Parent/child relationships work as expected

**Phase 3.5 (Calendar Enhancements):**

- Can view tasks across multiple days/weeks/months
- Drag-and-drop works across all calendar views
- Performance is acceptable with 100+ scheduled tasks

**Phase 3.75 (Recipe System):**

- Can add recipes and plan meals faster than current manual methods
- Grocery list generation saves measurable time
- System handles both detailed recipes and simple meal names
- In production use for 2+ weeks before considering it "done"

**Deep Mode:**

- Provides value beyond Focused Mode (not just "more features")
- Power users prefer it for complex work
- Doesn't slow down quick interactions

**Phase 4 (AI Integration):**

- Voice capture actually gets used (solves real "microwave moments")
- AI suggestions are helpful more often than annoying
- System feels proactive without being intrusive

---

## Next Steps

**Immediate (This Week):**

1. ✅ Finalize recipe/meal system architecture (DONE)
2. Begin calendar enhancements (multi-day views)
3. Design initial calendar UI/UX

**Short Term (Next 2-4 Weeks):**

1. Complete calendar enhancements
2. Begin recipe system Phase 1 (core recipe CRUD)
3. Build ingredient paste-and-parse
4. Get recipe browsing working

**Medium Term (1-2 Months):**

1. Complete recipe system Focused Mode
2. Get system into production use
3. Gather usage feedback
4. Plan Deep Mode design session

**Long Term (3+ Months):**

1. Deep Mode implementation
2. Phase 4 AI integration
3. Iterative improvements based on real usage
