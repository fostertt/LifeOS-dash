# LifeOS Vision

**Version:** 3.0
**Date:** February 3, 2026
**Status:** Active Vision

---

## Product Identity

**LifeOS is a personal productivity system combining task management, calendar, meal planning, and AI assistance.**

### What LifeOS Is

A focused productivity app that helps you:
- Manage tasks, habits, and reminders in one place
- Plan your calendar and schedule
- Organize recipes and meal planning
- Capture notes and lists
- Organize work into projects
- Get AI assistance with voice capture and context-aware help

### What LifeOS Is NOT

- ❌ Not Notion (we're not building a wiki/collaboration platform)
- ❌ Not endless customization (we focus on doing a few things well)
- ❌ Not a team collaboration tool (personal/family use)
- ❌ Not trying to replace every app (focused feature set)

---

## Core Principles

1. **Simple Over Complex** - Do a few things well rather than everything poorly
2. **Capture Everything Easily** - Low friction for getting things into the system
3. **Projects Are Optional** - Tasks can exist without projects (organized chaos is fine)
4. **AI-Assisted, Not AI-Driven** - AI helps you, doesn't make decisions for you
5. **Mobile-First, Desktop-Capable** - Works great on phone, powerful on desktop
6. **Private & Self-Hosted** - Your data stays on your infrastructure

---

## Main Areas

LifeOS has 5 main areas (6th coming later):

### 1. Projects
**Purpose:** Organize related tasks and content under projects

**Features:**
- Create/edit/delete projects
- Project properties: name, description, status, tags, dates
- View all tasks associated with a project
- Filter projects by status/tags
- Optional - tasks don't need projects to exist

**Status:** Database exists, UI needs to be built

---

### 2. All (Tasks, Habits, Reminders)
**Purpose:** Unified view of all actionable items

**Entity Types (all in one `items` table):**
- **Tasks:** One-time or ongoing work items
- **Habits:** Recurring activities to track
- **Reminders:** Time-based notifications

**Features:**
- Single view with all three types
- Filter by type, project, tags, state, dates
- Group by project, state, due date
- States: backlog, active, in_progress, completed
- Drag-and-drop scheduling
- Parent/child task relationships

**Status:** ✅ Complete and working

---

### 3. Calendar
**Purpose:** Unified timeline of scheduled tasks, habits, events, and meals

**Data Sources:**
- Tasks with scheduled dates/times
- Habits with schedules
- Reminders
- Google Calendar events (synced)
- Meal plans (future)

**Views:**
- Day (timeline view with hourly slots)
- Week (7-day view)
- Month (calendar grid) - future
- Next X Days - future

**Features:**
- Drag-and-drop rescheduling
- Overdue persistence (items stay marked overdue until cleared)
- Visual distinction for different item types
- Quick create from any date

**Status:** Day and Week views complete, Month view planned

---

### 4. Vault (Lists & Notes)
**Purpose:** Reference storage for notes, checklists, and quick captures

**Note Types:**
- **Lists:** Checkable items (grocery lists, packing lists, todo lists)
- **Notes:** Freeform text notes with markdown support
- **Research Clips:** URL bookmarks with tags and notes

**Features:**
- Tagging for organization
- Link notes to projects
- Pin important items to top
- Special list: Grocery list (permanent, never auto-deletes)

**Status:** ✅ Basic functionality complete

---

### 5. Recipes & Meal Planning
**Purpose:** Recipe storage and meal planning with grocery list integration

**Recipe Features:**
- Recipe CRUD (create, read, update, delete)
- Ingredients (structured list with quantities)
- Instructions (step-by-step)
- Tags (cuisine, dietary, meal type, etc.)
- Photos (optional)
- Notes for tweaks/observations

**Meal Planning:**
- Assign recipes to calendar dates/meal times
- Week view of planned meals
- Drag-and-drop meal assignment
- Simple meals without recipes ("Leftovers", "Sausages")

**Grocery List Integration:**
- Send recipe ingredients to grocery list
- Mark pantry items as "already have"
- Generate shopping list from meal plan
- Grocery list lives in Vault

**Status:** ❌ Not started (Phase 4 priority)

---

### 6. Documentation (Future)
**Purpose:** Knowledge base and project documentation

**Planned Features:**
- Markdown documents with rich formatting
- Hierarchical organization (folders/nesting)
- Link docs to projects
- Optional: Sync to filesystem for git version control
- Optional: Read by AI assistants for context

**Status:** ❌ Future phase (Phase 6+)

---

## Cross-System Features

### Universal Tagging
- Tags work across all entity types (tasks, notes, projects, recipes)
- Autocomplete suggests existing tags
- Filter any view by tags
- Create tags on-the-fly

### Project Linking
- Tasks can belong to projects (optional)
- Notes can link to projects
- Recipes can link to projects (e.g., "Meal Prep Sunday")
- Filter views to show "everything related to Project X"

### Calendar Integration
- Tasks with dates appear on calendar
- Habits with schedules appear on calendar
- Recipes assigned to meals appear on calendar
- External calendar events (Google Calendar) appear on calendar
- Drag-and-drop to reschedule from any source

---

## User Experience

### Home Dashboard
Landing page with navigation cards:

```
┌─────────────────────────────────┐
│         LifeOS Home             │
├─────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐    │
│  │ Projects │  │   All    │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │ Calendar │  │  Vault   │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │ Recipes  │  │   Docs   │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  [Quick Action Button]          │
└─────────────────────────────────┘
```

**Navigation:**
- Click card → navigate to that area
- Back button returns to home
- Quick Action FAB for rapid capture (task/note/recipe)

**Status:** ❌ Not built yet (Phase 3.5 priority)

---

### Quick Capture
Floating Action Button (FAB) on all pages:
- Tap to expand options
- Create task, note, list, recipe (later: voice capture)
- Minimal required fields (capture fast, organize later)
- Default to simple input (title + date), "Show more" for details

---

### Mobile vs Desktop
Same features on both, optimized for each:

**Mobile:**
- Compact UI with hamburger menu
- Touch-optimized interactions
- Swipe gestures
- PWA (installable as app)

**Desktop:**
- Top navigation bar
- More information density
- Keyboard shortcuts
- Sidebar layouts

**Future:** Focus/Deep mode toggle (mobile-optimized vs information-dense views)

---

## Data Model

### Core Entities

**Users**
- id, name, email, auth info
- Multi-user ready (family members)

**Items** (Tasks, Habits, Reminders)
- id, userId, itemType, name, description
- state, tags, priority, complexity, energy, duration
- scheduleType, scheduledTime, dueDate, dueTime
- parentItemId (for subtasks), projectId
- isOverdue (persistent flag), isCompleted
- Supports: tasks, habits, reminders all in one table

**Projects**
- id, userId, name, description, status
- start_date, targetDate (end date), priority, color
- tags, blockedBy
- Relations: tasks, documents, notes, recipes (all one-to-many, optional)

**Lists**
- id, userId, name, listType, color, tags
- description, pinned

**ListItems**
- id, listId, text, isChecked, order
- taskId (optional link to Item)

**Notes**
- id, userId, title, content
- tags, pinned, parentNoteId (hierarchy)

**ResearchClips**
- id, userId, url, title, screenshot
- notes, tags, projectRef

**Recipes** (future)
- id, userId, name, description
- prepTime, cookTime, servings, difficulty
- cuisine, mealType, tags, rating, source
- notes (personal tweaks/observations)
- createdAt, updatedAt

**RecipeIngredients** (future)
- id, recipeId, name, amount, unit
- notes (e.g., "diced", "room temperature")
- order (for display sequence)

**RecipeInstructions** (future)
- id, recipeId, step_number, instruction_text

**MealPlans** (future)
- id, userId, recipeId (nullable), date
- mealType (breakfast/lunch/dinner/snack)
- mealNameOverride (for simple meals like "Leftovers")
- notes

**CalendarSync**
- id, userId, calendarId, calendarName
- isEnabled, syncToken, lastSyncedAt

**CalendarEvents**
- id, userId, googleEventId, title
- startTime, endTime, isAllDay

---

### Entity Relationships

```
Projects
├── Items/Tasks (one-to-many via Items.projectId, nullable)
├── Documents (one-to-many, future)
├── Notes (one-to-many via Notes.projectId, nullable)
└── Recipes (one-to-many via Recipes.projectId, optional, future)

Items (Tasks, Habits, Reminders - unified table)
├── Project (many-to-one, nullable)
├── Subtasks (self-referential via parentItemId)
└── Tags (JSON array, stored in tags field)

Notes
├── Project (many-to-one, nullable)
├── Parent Note (self-referential via parentNoteId, for hierarchy)
└── Tags (JSON array)

Lists
├── ListItems (one-to-many)
└── Tags (JSON array)

ListItems
└── Task (many-to-one via taskId, optional - links checklist item to task)

Recipes (future)
├── Ingredients (one-to-many via RecipeIngredients)
├── Instructions (one-to-many via RecipeInstructions)
├── Meal Plans (one-to-many via MealPlans)
├── Project (many-to-one, optional)
└── Tags (JSON array)

MealPlans (future)
├── Recipe (many-to-one, nullable - can be simple meal without recipe)
└── User (many-to-one)
```

**Tagging Strategy:**
- Current: Tags stored as JSON arrays in each table
- Future: Consider proper many-to-many relationship if tag management becomes complex
- Universal: Same tag can be used across Projects, Items, Notes, Recipes, etc.

---

## Technical Architecture

### Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** NextAuth.js (Google OAuth)
- **Deployment:** PM2 on foster-forge (Docker + Cloudflare tunnel)
- **Mobile:** PWA (Progressive Web App)

### Server Infrastructure
- **Production:** foster-forge (192.168.50.3)
- **Database:** PostgreSQL on foster-forge
- **Access:** Cloudflare tunnel (lifeos.foster-home.net)
- **Process Manager:** PM2

---

## Implementation Phases

See `lifeos-implementation-plan.md` for detailed roadmap.

**Summary:**
- ✅ **Phase 3:** Task management system (complete)
- 🚧 **Phase 3.5:** Home dashboard + calendar enhancements (next)
- 📋 **Phase 4:** Recipes & meal planning
- 📋 **Phase 5:** Projects UI
- 📋 **Phase 6:** Voice capture & AI integration
- 📋 **Phase 7:** Documentation system
- 📋 **Phase 8:** Polish & refinements

---

## Future Enhancements

**AI Integration:**
- Voice-to-task/note capture ("microwave moments")
- Context-aware task suggestions
- Natural language processing for quick entry
- Smart scheduling suggestions
- Recipe suggestions based on pantry/preferences

**Advanced Features:**
- Inventory tracking (what's in pantry/fridge)
- Nutrition tracking from recipes
- Habit streaks and analytics
- Project timelines and progress tracking
- Recurring task templates

**Integrations:**
- Bidirectional Google Calendar sync
- Recipe URL scraping (auto-import from websites)
- Export to standard formats

---

## Success Criteria

**LifeOS is successful if:**
- ✅ Daily task management is faster than pen and paper
- ✅ Calendar view provides at-a-glance clarity
- ✅ Meal planning saves time vs. current methods
- ✅ Voice capture actually gets used (solves "microwave moments")
- ✅ System becomes single source of truth (not abandoned)
- ✅ Mobile experience is excellent (not desktop-only)
- ✅ Family members adopt it willingly

**LifeOS has failed if:**
- ❌ Too complex to use daily
- ❌ Trying to do too many things
- ❌ Becomes another abandoned productivity app
- ❌ Sacrifices simplicity for features

---

**Document Status:** Active Vision v3.0
**Last Updated:** February 3, 2026
**Next Review:** After Phase 4 (Recipes) completion
