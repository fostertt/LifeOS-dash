# LifeOS Vision Document

**Version:** 2.0  
**Date:** February 3, 2026  
**Status:** Active Vision

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Core Principles](#core-principles)
3. [User Experience Philosophy](#user-experience-philosophy)
4. [Navigation & Interface Model](#navigation--interface-model)
5. [Focus vs Deep Mode](#focus-vs-deep-mode)
6. [Core Feature Areas](#core-feature-areas)
   - [Projects](#projects)
   - [All (Tasks, Habits, Reminders)](#all-tasks-habits-reminders)
   - [Calendar](#calendar)
   - [Vault (Notes & Lists)](#vault-notes--lists)
   - [Recipes & Meal Planning](#recipes--meal-planning)
   - [Documentation](#documentation)
7. [Cross-System Integration](#cross-system-integration)
8. [Data Model Concepts](#data-model-concepts)
9. [Technical Architecture Requirements](#technical-architecture-requirements)
10. [Future Considerations](#future-considerations)

---

## Product Vision

**LifeOS is a comprehensive personal and family productivity system that serves as the single source of truth for everything that matters.**

### What LifeOS Is

LifeOS combines task management, project planning, knowledge management, habit tracking, meal planning, and documentation into one cohesive system. It's designed to be the interface layer between a person's life and their goals - capturing everything from fleeting thoughts to complex multi-phase projects.

### What Makes LifeOS Different

- **Everything in one place:** No more context switching between todo apps, note apps, meal planners, and documentation systems
- **Intelligent linking:** Everything can connect to everything else through projects, tags, and direct relationships
- **Adaptive interface:** Same system works on phone (Focus mode) or desktop (Deep mode) with appropriate information density
- **Private & self-hosted:** Runs on personal infrastructure (foster-forge) with full data control
- **AI-native:** Built to integrate with AI assistants for context-aware help and automation

### Target Users

- Primary: Tyrrell and family (private family system)
- Future: Potentially shareable with other power users who want comprehensive life management

---

## Core Principles

### 1. **Capture Everything, Filter Later**
The system should make it trivially easy to capture any thought, task, or information. Organization and processing happen after capture, not during.

### 2. **Projects Are Optional, Not Mandatory**
Everything CAN be organized into projects, but nothing REQUIRES a project to exist. Orphaned items are valid and expected.

### 3. **Universal Tagging**
Tags work across all entity types. A single tag like "project-x" can filter tasks, notes, docs, and recipes simultaneously.

### 4. **Context-Appropriate Density**
The same data should be viewable at different levels of detail depending on device, mode, and user need. Mobile doesn't mean limited - it means focused.

### 5. **Do It Right Over Do It Fast**
Build for longevity. Avoid shortcuts that create technical debt. When speed conflicts with quality, choose quality.

### 6. **Flexibility Over Convention**
Users define their own workflows. The system provides structure but doesn't enforce rigid processes.

---

## User Experience Philosophy

### Typical User Journeys

**Morning Routine:**
1. Open LifeOS on phone (Focus mode)
2. Check Calendar view - see today's schedule with habits and tasks
3. Complete morning routine habits (check off items)
4. Review "All" view filtered to today's active tasks
5. Quick capture voice note about something remembered

**Planning a New Project:**
1. Open LifeOS on desktop (Deep mode)
2. Navigate to Documentation → create new doc for project brainstorm
3. Flesh out ideas, add structure
4. Create Project in Projects area
5. Link documentation to project
6. Create initial tasks in All view, assign to project
7. Set project sync to server, enable git version control

**Meal Planning:**
1. Open Recipes on tablet
2. Browse saved recipes, filter by dietary tags
3. Assign 5 recipes to next week's calendar dates
4. Review recipe ingredients, check what's already in pantry
5. Send unchecked ingredients to grocery list
6. View grocery list in Vault before shopping

**Development Work:**
1. Claude Code reads LifeOS documentation via API for project context
2. Works on code in VS Code on foster-forge
3. Updates project status, creates tasks for bugs found
4. Commits documentation changes via LifeOS git integration
5. Adds notes about architectural decisions to project docs

---

## Navigation & Interface Model

### Home Dashboard

The home screen presents 6 main navigation cards/links:

```
┌─────────────────────────────────────┐
│          LifeOS Home                │
├─────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐      │
│  │ Projects  │  │    All    │      │
│  └───────────┘  └───────────┘      │
│  ┌───────────┐  ┌───────────┐      │
│  │ Calendar  │  │   Vault   │      │
│  └───────────┘  └───────────┘      │
│  ┌───────────┐  ┌───────────┐      │
│  │  Recipes  │  │   Docs    │      │
│  └───────────┘  └───────────┘      │
│                                     │
│  [Quick Action Button - FAB]        │
└─────────────────────────────────────┘
```

**Navigation Pattern:**
- Click card → navigate to dedicated page for that area
- Back button returns to home
- Home button always accessible
- No bottom nav bar
- Quick Action FAB present on all pages for rapid capture

**Future Enhancement:**
Cards can become widgets showing snapshot data (upcoming tasks, today's habits, etc.)

---

## Focus vs Deep Mode

### Conceptual Difference

**Focus Mode:**
- Mobile-optimized interface
- Essential information only
- Simplified views for quick action
- "I need to do this thing right now"
- Appropriate for phone/tablet in portrait
- Still fully functional, just streamlined

**Deep Mode:**
- Desktop-optimized interface  
- All data columns visible
- Advanced filtering and grouping
- Power user features exposed
- "I need to see everything and make complex decisions"
- Appropriate for desktop/tablet in landscape
- Knowledge base integrations visible

### Key Behaviors

- Mode toggle available on any page
- Toggle persists per device (phone defaults to Focus, desktop defaults to Deep)
- User can override at any time
- Mode affects UI density, not functionality
- Same data, different presentation

### Examples of Mode Differences

**Calendar View:**
- Focus: Today + tomorrow, timeline view, 2-hour increments
- Deep: Week view, compact list, all event details visible

**All (Tasks) View:**
- Focus: Active tasks only, 3 key columns (name, due date, project)
- Deep: All states visible, 8+ columns, advanced filters, bulk actions

**Documentation View:**
- Focus: Document content only, simple editor
- Deep: Sidebar with doc tree, version history, metadata panel, advanced editor

---

## Core Feature Areas

## Projects

### Purpose
Projects are organizational containers that group related tasks, documentation, notes, and other items. They represent ongoing areas of focus or discrete initiatives.

### Key Features

**Project Properties:**
- Name (required)
- Description
- Status (e.g., Active, Backlog, In Progress, Done)
- Tags (universal tagging system)
- Start/end dates (optional)
- Priority level
- Color coding (for visual distinction)

**Project Relationships:**
- Can contain multiple tasks (one-to-many)
- Can link to documentation (one-to-many)
- Can link to notes (one-to-many)
- Can link to recipes (for projects like "Meal Prep Sunday")
- Appears in filters across all other areas

**Project View (Page):**

Focus Mode:
- List of projects with name, status badge, task count
- Tap to expand → see linked tasks inline
- Quick status update
- Search/filter by status or tag

Deep Mode:
- Table view with all project metadata
- Sortable/filterable columns
- Bulk operations (update status, add tags)
- Nested view showing project → task hierarchy
- Project timeline visualization (future)

### Usage Patterns

- Not all items require a project
- Projects can be created before tasks exist ("planning phase")
- Projects can be created after tasks exist ("I should organize these")
- Projects can have extensive documentation or minimal notes

---

## All (Tasks, Habits, Reminders)

### Purpose
The "All" view is the actionable items dashboard - everything that needs doing, tracking, or remembering appears here.

### Entity Types

#### Tasks
**Properties:**
- Title (required)
- Description/notes
- Project (optional, foreign key)
- State: Active, In Progress, Blocked, Complete, Archived
- Priority: Low, Medium, High, Critical
- Due date (optional)
- Scheduled date/time (when you plan to work on it)
- Reminder timestamp (optional)
- Tags
- Subtasks (nested tasks)
- Attachments/links

**Behaviors:**
- Tasks with scheduled times appear on Calendar
- Tasks can exist independently or within projects
- Completing a task marks it done but doesn't delete it
- Archived tasks hidden by default but searchable
- Subtasks can be expanded/collapsed inline

#### Habits
**Properties:**
- Name (required)
- Description
- Frequency: Daily, Weekly, Custom schedule
- Routine membership (e.g., "Morning Routine", "Evening Routine")
- Start time (for calendar placement)
- Duration estimate
- Streak tracking (consecutive completions)
- Tags

**Behaviors:**
- Habits appear on Calendar at their scheduled times
- Checking off a habit increments streak
- Missing a habit breaks streak (or has grace period?)
- Routines group related habits (Morning Routine: 5 habits starting at 5:30 AM)
- Habits can have reminders just like tasks

#### Reminders
**Properties:**
- Text (required)
- Reminder datetime (required)
- Recurrence pattern (optional)
- Tags
- Project (optional)

**Behaviors:**
- Lightweight, time-based pings
- "Remind me to ask my wife about X at 6pm"
- Appears on calendar at reminder time
- Can be converted to task if it becomes more complex
- Eventually: push notifications

**Distinction from Tasks:**
Reminders are ephemeral nudges. Tasks are items to complete. A reminder might prompt you to create a task.

### All View (Page)

**Default View:**
Shows all three entity types (tasks, habits, reminders) in unified list/table

**Grouping Options:**
- By State (Active, In Progress, etc.)
- By Project
- By Priority
- By Due Date
- By Type (Task vs Habit vs Reminder)

**Filtering:**
- Text search across titles/descriptions
- Filter by project
- Filter by tag
- Filter by state
- Filter by date range
- Filter by type

**Focus Mode:**
- Simple list view filterable and groupable
- Swipe actions? (complete, defer, archive)
- Quick edit inline

**Deep Mode:**
- Table view with 10+ columns
- Multi-select with bulk actions
- Advanced filtering UI
- Sortable columns
- Expandable subtasks
- Related items preview (linked notes, docs)

### Quick Capture

Quick Action FAB (present on all pages):
- Tap → modal with quick capture options
- Type selection: Task, Habit, Reminder, Note, Recipe
- Minimal required fields, everything else optional
- Capture instantly, organize later
- Voice capture integration (future)

---

## Calendar

### Purpose
Unified timeline view showing all time-sensitive items: tasks with dates, habits, meal plans, and calendar events.

### Data Sources

- Tasks with scheduled or due dates
- Habits with time schedules
- Reminders at specific times
- Recipes assigned to meal dates
- External calendar feeds (iCal integration)

### View Options

**Timeline (Current Implementation):**
- Single day view with hourly slots
- Items displayed at their scheduled times
- Scroll through hours
- Navigate between days

**Compact (Google Calendar Style):**
- List-based view of items
- Grouped by time of day (Morning, Afternoon, Evening)
- More items visible at once
- Less precise time representation

**Additional Views Needed:**
- **Week View:** 7-day column layout with time slots
- **Work Week:** Monday-Friday only
- **Month View:** Calendar grid with items as dots/bars
- **Next X Days:** Configurable rolling window (e.g., next 7 days as list)

### Calendar Behaviors

**Overdue Items:**
- Prominently displayed at top with warning indicator
- "Clear" button to dismiss or reschedule

**Drag and Drop (Desktop/Deep Mode):**
- Drag items to different time slots to reschedule
- Drag item boxes bigger or smaller to change duration
- Drag between days in week view

**Time Zoom:**
- Adjustable time granularity (15min, 30min, 1hr, 2hr increments)

**Color Coding:**
- Undecided

### Integration with Other Areas

- Click item → navigate to full detail view in respective area
- Add to calendar from any area (task creation, recipe assignment)
- Calendar feeds don't create duplicate entities in LifeOS

---

## Vault (Notes & Lists)

### Purpose
The Vault is the repository for reference information, quick captures, and structured data that doesn't fit into tasks or projects. It's the "everything else" bucket.

### Note Types

#### Standard Note
- Free-form text (markdown)
- Title + body content
- Tags
- Project link (optional)
- Timestamps (created, updated)
- Rich content: embedded images, links

#### List Note
- Title + structured list items
- Items can be checkable (like todos but not actionable tasks)
- Items can be nested (sub-items)
- Reorderable items
- Use cases: brainstorming, shopping prep, packing lists

**Special List: Grocery List**
- Permanent list-type note (never auto-deletes)
- Checked items move to "Completed" section at bottom (Google Keep style)
- Manual clear of completed section to prevent bloat
- Can be pinned to top of Vault
- Integration with Recipes (ingredients populate this list)

#### Voice Note
- Audio recording
- Auto-transcription (future)
- Timestamp
- Playback in-app
- Tags and project links like other notes

#### Image/Picture Note
- Image upload
- Caption/description
- Tags and project links
- Used for: screenshots, diagrams, reference photos

### Vault View (Page)

**Default View:**
- List of all notes, sorted by most recently updated
- Search bar at top
- Filter by note type, tag, project
- Pinned notes appear at top (like Google Keep)

**Focus Mode:**
- Simplified list
- Note preview (first few lines of content)
- Tap to open full note

**Deep Mode:**
- Table view option (title, type, tags, project, updated date)
- Preview pane (click note → preview on right side without leaving list)
- Bulk tagging/organization

### Note Editing

**Rich Text Editor:**
- Markdown-based with toolbar assistance
- Toolbar buttons: bold, italic, headers, lists, links, images, code blocks
- Live preview toggle or split-pane (edit | preview)
- Can write raw markdown if preferred
- Auto-save drafts

**Linking & Embedding:**
- Link to other notes, tasks, projects, docs (internal linking)
- Embed images (stored in LifeOS, referenced by URL)
- Future: embed other note types (voice note in standard note)

---

## Recipes & Meal Planning

### Purpose
Centralized recipe storage and meal planning system that integrates with calendar and grocery shopping.

### Recipe Properties

- **Name** (required)
- **Description/Summary**
- **Ingredients:** Structured list with quantities and units
  - Item name
  - Amount (numeric)
  - Unit (cups, tbsp, lbs, etc.)
  - Notes (e.g., "diced", "room temperature")
- **Instructions:** Ordered steps
- **Prep Time** (minutes)
- **Cook Time** (minutes)
- **Total Time** (auto-calculated)
- **Servings** (numeric, adjustable)
- **Cuisine Type** (tag: Italian, Mexican, etc.)
- **Dietary Tags** (vegetarian, vegan, gluten-free, dairy-free, etc.)
- **Meal Type** (breakfast, lunch, dinner, snack, dessert)
- **Difficulty** (easy, medium, hard)
- **Recipe Notes:** Free-form text field for modifications, substitutions, feedback
- **Images:** Multiple photos (finished dish, process photos)
- **Source:** URL or text (where recipe came from)
- **Rating** (1-5 stars, personal)
- **Tags** (universal tagging system)

### Recipe Import Methods

**Current/Phase 1:**
- Manual entry via form
- Copy/paste from websites (user manually inputs structured data)

**Future:**
- URL scraping (auto-extract ingredients and instructions)
- Image import with OCR (take photo of cookbook recipe)
- Voice dictation ("Add a recipe: ...ingredients, ...instructions")

### Meal Planning

**Assigning Recipes to Calendar:**
- From recipe detail view → "Add to Calendar" button
- Select date and meal type (breakfast, lunch, dinner)
- Recipe appears on Calendar at appropriate time slot
- Can assign same recipe multiple times (meal prep scenarios)

**Meal Plan View (within Recipes or Calendar):**
- Week-at-a-glance showing planned meals
- Drag and drop to reschedule meals
- Gaps indicate meals not yet planned

### Grocery List Integration

**From Recipe to Grocery List:**
- Recipe detail view shows all ingredients
- Checkbox per ingredient: "I have this" (inventory tracking, visual only)
- Arrow/send button per ingredient: "Add to grocery list"
- "Add All" button: sends all unchecked ingredients to grocery list
- "Check All" button: marks all ingredients as "I have"

**Grocery List Behavior:**
- Lives in Vault as special List-type note
- Can be pinned to top of Vault
- Never auto-deletes (manually managed)
- Checked items move to "Completed" section at bottom
- Manual "Clear Completed" action to prevent bloat
- Items added from recipes include quantities
- Can manually add items (not from recipes)

**Multiple Grocery Lists:**
- Phase 1: Single master list
- Future: Support for multiple lists (Costco, local store, pharmacy)

### Recipes View (Page)

**Focus Mode:**
- Card-based layout with recipe images
- Filter by tags (cuisine, dietary, meal type)
- Search by name or ingredient
- Tap card → full recipe detail

**Deep Mode:**
- Table view option showing all recipe metadata
- Advanced filtering (cook time range, servings, rating)
- Bulk tagging/organization
- Recipe detail in preview pane

---

## Documentation

### Purpose
Documentation is the knowledge base - comprehensive, structured reference material that evolves over time. Unlike Notes (quick captures), Documentation consists of well-structured guides, how-tos, project retrospectives, and technical specifications.

Think: Notion pages, Confluence, internal wiki.

### Use Cases

- Homelab setup guides (network map, server configurations)
- Project documentation (architecture decisions, phase plans, retrospectives)
- How-to guides (workflows, procedures)
- Reference material (research findings, learning notes)
- Meeting notes that become formalized documentation
- READMEs and roadmaps

### Document Properties

- **Title** (required)
- **Content** (markdown with rich formatting)
- **Parent Document** (for hierarchical structure, nullable)
- **Project Link** (optional)
- **Tags** (universal)
- **Status** (Draft, Active, Archived)
- **Author** (user who created it)
- **Created/Updated Timestamps**
- **Sync Settings** (see Server Integration below)

### Hierarchical Structure

Documents can be nested in parent-child relationships:

```
Project X Documentation (parent)
├── README (child)
├── Architecture Overview (child)
├── Phase 1 (child)
│   ├── Requirements (grandchild)
│   └── Implementation Notes (grandchild)
└── Phase 2 (child)
```

**Navigation:**
- Folder-style tree view in sidebar (Deep Mode)
- Breadcrumbs showing path (Focus Mode)
- Documents can be reordered within parent
- Drag-and-drop to reorganize (Deep Mode)

### Content Editing

**Markdown Editor:**
- Toolbar for common formatting (headers, bold, italic, lists, links, code blocks, images)
- Live preview toggle or split-pane
- Syntax highlighting for code blocks
- Can write raw markdown directly
- Auto-save drafts

**Rich Content Support:**
- Embed images (stored in LifeOS, referenced by URL)
- Embed links to internal entities (tasks, projects, other docs)
- Embed external links
- Future: embed videos, mind maps, diagrams

**Version Control:**
- Document edit history stored (timestamp, author, changes)
- "Revert to version" capability
- Diff view between versions (future)

### Server Integration & Git Sync

**Why Sync to Server:**
- Claude Code needs access to documentation for context
- Dev project docs should live alongside code in repos
- Version control via Git for important documentation
- Bidirectional sync keeps LifeOS and server in sync

**Sync Tiers:**

**Tier 1: LifeOS-only docs**
- Stored in PostgreSQL only
- No filesystem sync
- Fast, simple, low overhead
- Examples: personal reference, quick how-tos

**Tier 2: Synced docs**
- Stored in PostgreSQL + synced to foster-forge filesystem
- User enables sync per-doc or per-project
- Syncs as markdown files to configured path
- Claude Code can read/edit directly on filesystem

**Tier 3: Synced + Git-controlled docs**
- Everything in Tier 2, plus Git version control
- Manual commit with optional commit message
- Manual push to remote
- Enables collaboration, history, backup

**Sync Configuration:**

**Git Repos Table:**
User configures one or more git repositories:
- Name (e.g., "Homelab Docs", "Project X Repo")
- Local path on server (e.g., `/home/claude/homelab-docs/`)
- Remote URL (e.g., `git@github.com:user/homelab.git`)
- Description

**Per-Document Settings:**
- **Sync Enabled:** Yes/No (checkbox)
- **Git Repo:** Dropdown to select configured repo (or "Default")
- **Server Path:** Relative path within repo (e.g., `docs/phase-1.md`)
- **Git Enabled:** Yes/No (checkbox, only if sync enabled)

**Sync Workflow:**

1. User creates doc in LifeOS → stored in database only
2. Enable sync → choose git repo + specify filename
3. LifeOS writes markdown file to server at specified path
4. Claude Code can now read/edit file on filesystem
5. File watcher on server detects external changes → updates LifeOS cache
6. User enables git → "Commit" and "Push" buttons appear in LifeOS UI
7. User makes changes → click "Commit" → enter optional message → file committed locally
8. Click "Push" → changes pushed to remote repo

**Default Sync Location:**
- User sets default git repo in settings (e.g., "LifeOS Default Docs")
- New docs default to this location if sync enabled
- Can be changed later to project-specific repo

**Conflict Resolution:**
- If file changed on server and in LifeOS simultaneously → flag conflict
- User chooses: keep LifeOS version, keep server version, or manual merge
- Future: auto-merge if possible

**Images in Synced Docs:**
- Images stored in LifeOS database (blob storage or filesystem)
- Markdown references images by URL (e.g., `![screenshot](/api/images/abc123)`)
- Prevents repo bloat with binary files
- Server can access images via LifeOS API

### Documentation View (Page)

**Focus Mode:**
- Document list (flat or grouped by project)
- Search and filter by tag/project
- Tap doc → full-screen editor/viewer
- Back button returns to list

**Deep Mode:**
- Split view: doc tree sidebar | content pane
- Hierarchical tree shows parent-child relationships
- Click doc in tree → content loads in right pane
- Metadata panel (tags, version info, sync status)
- Version history accessible
- Commit/Push buttons if git-enabled

---

## Cross-System Integration

### Universal Tagging

**How It Works:**
- Tags are user-defined strings (e.g., "project-x", "urgent", "homelab")
- Any entity can have multiple tags
- Tags stored in many-to-many relationship tables
- Filtering by tag returns all entities with that tag

**Filterable Entities:**
- Projects
- Tasks
- Habits
- Reminders
- Notes (all types)
- Documents
- Recipes

**User Experience:**
- Tag input is autocomplete (suggests existing tags)
- Create new tags on-the-fly
- Tag management page to rename/merge/delete tags (future)
- Filter by multiple tags (AND/OR logic)

### Project Linking

**Direct Relationships:**
- Tasks have `project_id` (foreign key, nullable)
- Documents have `project_id` (nullable)
- Notes have `project_id` (nullable)
- Recipes have `project_id` (nullable)

**Query Pattern:**
"Show me everything related to Project X"
- Query tasks, docs, notes, recipes where `project_id = X`
- Also query by tag "project-x" to catch loosely-related items

**Orphaned Items:**
- Items without `project_id` are valid and expected
- Can be filtered to show "unassigned" items
- Can assign to project later via quick action

### Calendar Integration

**What Appears on Calendar:**
- Tasks with `scheduled_date` or `due_date`
- Habits with `start_time`
- Reminders with `reminder_datetime`
- Recipes assigned to meal dates
- External calendar events (iCal feed)

**Interaction:**
- Click calendar item → navigate to source entity detail
- Reschedule via drag-and-drop (updates source entity)
- Complete/check off directly from calendar view

### Grocery List ← Recipes

**Flow:**
1. User views recipe
2. Clicks ingredient "send to grocery" arrow
3. Ingredient added to Grocery List (special note in Vault) with quantity
4. Grocery list is permanent, user checks off items while shopping
5. Checked items move to "Completed" section
6. User manually clears completed section periodically

**Data Model:**
- Grocery list is a Note with type "list"
- List items have `checked` boolean
- Recipe ingredients have `quantity`, `unit`, `name`
- When sent to grocery, creates list item with formatted text: "2 cups flour"

### Voice Capture Integration (Future)

**Voice → Entity Routing:**
- User records voice note via Quick Action FAB
- Transcription engine converts to text
- NLP/LLM analyzes intent:
  - "Remind me to..." → create Reminder
  - "I need to..." → create Task
  - "Note: ..." → create Note
  - "Add recipe..." → create Recipe (advanced)
- User reviews and confirms before saving

**Use Case:**
"Microwave moments" - capturing fleeting thoughts before they disappear

---

## Data Model Concepts

### Core Entities

**Users**
- id, name, email, settings
- Initially single-user system (Tyrrell)
- Future: multi-user for family members

**Projects**
- id, name, description, status, start_date, end_date, priority, color, tags
- Parent for tasks, docs, notes

**Tasks**
- id, title, description, project_id (nullable), state, priority, due_date, scheduled_date, reminder_time, tags, created_at, updated_at, completed_at
- Subtasks: self-referential foreign key `parent_task_id`

**Habits**
- id, name, description, frequency, routine_id (nullable), start_time, duration, streak, tags

**Reminders**
- id, text, reminder_datetime, recurrence, project_id (nullable), tags

**Notes**
- id, type (standard, list, voice, image), title, content, project_id (nullable), tags, created_at, updated_at
- Note items (for list-type): id, note_id, text, checked, order, parent_item_id (for nesting)

**Documents**
- id, title, content (markdown), parent_doc_id (nullable), project_id (nullable), status, tags, sync_enabled, git_enabled, git_repo_id (nullable), server_path, created_at, updated_at
- Document versions: id, document_id, content, author_id, timestamp, commit_message

**Recipes**
- id, name, description, prep_time, cook_time, servings, cuisine_type, meal_type, difficulty, rating, source, notes, tags, created_at, updated_at
- Recipe ingredients: id, recipe_id, name, amount, unit, notes, order
- Recipe instructions: id, recipe_id, step_number, instruction_text

**Meal Plans**
- id, recipe_id, date, meal_type (breakfast/lunch/dinner)

**Git Repos**
- id, name, local_path, remote_url, description

**Tags**
- id, name
- Polymorphic relationships: taggable_id, taggable_type (task, note, doc, etc.)

**Calendar Events** (external)
- id, title, start_time, end_time, source (iCal feed URL), external_id

### Relationships

```
Projects
├── Tasks (one-to-many)
├── Documents (one-to-many)
├── Notes (one-to-many)
└── Recipes (one-to-many, optional)

Tasks
├── Project (many-to-one, nullable)
├── Subtasks (self-referential)
└── Tags (many-to-many)

Habits
├── Routine (many-to-one, nullable)
└── Tags (many-to-many)

Reminders
├── Project (many-to-one, nullable)
└── Tags (many-to-many)

Notes
├── Project (many-to-one, nullable)
├── Note Items (one-to-many, for list-type)
└── Tags (many-to-many)

Documents
├── Parent Document (self-referential, nullable)
├── Project (many-to-one, nullable)
├── Git Repo (many-to-one, nullable)
├── Versions (one-to-many)
└── Tags (many-to-many)

Recipes
├── Ingredients (one-to-many)
├── Instructions (one-to-many)
├── Meal Plans (one-to-many)
└── Tags (many-to-many)
```

---

## Technical Architecture Requirements

### Current Stack

- **Backend:** Node.js (Express or similar)
- **Database:** PostgreSQL (hosted on foster-forge)
- **Frontend:** React with Tailwind CSS
- **Deployment:** Docker containers on foster-forge
- **Access:** Cloudflare tunnel for secure remote access
- **Mobile:** PWA (Progressive Web App) for mobile experience

### Server Infrastructure

**foster-forge:**
- Ubuntu server (AI development + LifeOS production)
- RTX 5060Ti 16GB for AI inference
- Docker for containerization
- Nginx reverse proxy
- PostgreSQL database
- Filesystem for synced documentation

**foster-core:**
- Production services (Plex, Pi-hole, Vaultwarden)
- Tailscale VPN access
- Dual Pi-hole DNS servers

### API Design

**RESTful endpoints:**
- `/api/projects`, `/api/tasks`, `/api/habits`, `/api/reminders`, `/api/notes`, `/api/documents`, `/api/recipes`
- CRUD operations for all entities
- Filtering, sorting, pagination
- Batch operations for bulk updates

**Special endpoints:**
- `/api/calendar` - aggregated view of time-based items
- `/api/grocery-list` - special note endpoint
- `/api/documents/sync` - trigger filesystem sync
- `/api/documents/commit` - git commit action
- `/api/tags/autocomplete` - tag suggestions

**Authentication:**
- Initially: basic auth or session-based (single-user system)
- Future: multi-user auth with role-based access

### File Sync Mechanism

**Architecture:**
1. LifeOS API writes markdown files to server filesystem on document save (if sync enabled)
2. File watcher service (e.g., chokidar, inotify) monitors sync directories for external changes
3. Watcher detects change → triggers API call → updates LifeOS database cache
4. Conflicts flagged for manual resolution

**Git Integration:**
- Use `simple-git` (Node.js library) for git operations
- API endpoints: `/api/documents/:id/commit`, `/api/documents/:id/push`
- Commit message input optional (defaults to timestamp)
- Push button triggers `git push` to configured remote

### Image Storage

**Options:**
1. **Database (blob storage):** Store images in PostgreSQL as bytea
2. **Filesystem:** Store in Docker volume, reference by file path
3. **S3-compatible storage:** MinIO or similar (future)

**Recommendation:** Filesystem for simplicity, with API endpoint to serve images

### Performance Considerations

- **Pagination:** Large lists (tasks, notes) must paginate (50-100 items per page)
- **Indexing:** Database indexes on frequently queried fields (tags, project_id, dates)
- **Caching:** Redis for frequently accessed data (future)
- **Lazy Loading:** Deep Mode loads full data, Focus Mode loads minimal data

### PWA Requirements

- Service worker for offline access (view cached data)
- App manifest for install prompt
- Responsive design for all screen sizes
- Push notifications (future, for reminders)

---

## Future Considerations

### Phase Priorities

**Phase 1 (Current/Near-term):**
- Home dashboard navigation
- Projects, Tasks, Calendar, Vault, Recipes basic functionality
- Focus vs Deep mode UI differentiation
- Universal tagging

**Phase 2:**
- Documentation with sync to server
- Git integration for version control
- Grocery list ← recipe integration
- Calendar view enhancements (week, month)

**Phase 3:**
- Voice capture with transcription
- Image OCR for recipe import
- Advanced filtering and search
- Knowledge graph visualization (entity relationships)

**Phase 4:**
- Multi-user support for family
- Shared projects and tasks
- Permissions and access control
- Collaborative editing (conflict resolution)

### AI Integration Ideas

**Context-Aware Assistance:**
- Claude Code reads LifeOS via API for project context during development
- LLM-powered task suggestions based on project and calendar
- Natural language task creation ("Add a task to fix the bug in the auth module")
- Smart tagging (AI suggests tags based on content)

**Voice Capture Intelligence:**
- Transcription + intent detection
- Automatically route to correct entity type
- Extract structured data (due dates, priorities) from natural language

**Recipe Intelligence:**
- URL scraping for recipe import
- Image OCR for cookbook recipes
- Ingredient substitution suggestions
- Nutritional analysis

**Knowledge Base Queries:**
- Ask questions across all documentation
- "What did I decide about database architecture in Project X?"
- Semantic search across notes and docs

### Advanced Features

**Dashboards:**
- Home dashboard widgets (upcoming tasks, habit streaks, meal plan)
- Project dashboards (progress, burndown charts, timeline)
- Personal analytics (task completion rates, habit adherence)

**Automation:**
- Recurring tasks (daily, weekly, monthly)
- Task templates (e.g., "Onboard new project" creates 10 tasks)
- Webhook integrations (IFTTT, Zapier)

**Collaboration:**
- Assign tasks to family members
- Shared grocery lists
- Comment threads on tasks/projects

**Mobile App:**
- Native app (React Native) for better performance
- Offline-first architecture
- Push notifications for reminders

**Integrations:**
- Google Calendar sync (bidirectional)
- Todoist/Asana import
- Notion import
- Email to task (forward email → creates task)

---

## Conclusion

LifeOS is an ambitious, comprehensive personal productivity system designed to be the single source of truth for all aspects of life management. It prioritizes flexibility, integration, and intelligent design over rigid workflows.

The system is built incrementally, with each phase adding meaningful value while maintaining a cohesive vision. Core principles of optional organization, universal tagging, and context-appropriate interfaces ensure the system adapts to the user rather than forcing the user to adapt to the system.

This vision document serves as the reference for all implementation planning, design decisions, and feature prioritization going forward.

---

**Document Status:** Active Vision - v2.0  
**Next Steps:** Create detailed implementation plan with phased approach based on this vision.
