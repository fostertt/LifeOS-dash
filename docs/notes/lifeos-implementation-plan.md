# LifeOS Implementation Plan

**Version:** 3.0
**Date:** February 3, 2026
**Companion Document:** lifeos-vision.md v3.0

---

## Overview

This document outlines the phased implementation approach for LifeOS - a focused productivity system combining task management, calendar, meal planning, and AI assistance.

**Key Principles:**
- Ship working features, test in real use, iterate
- Keep it simple - avoid over-engineering
- Each phase should be usable and valuable on its own
- Reference vision doc for feature details

---

## Current State (Phase 3 Complete ✅)

### What's Working
- ✅ Task management system (Items table: tasks/habits/reminders)
- ✅ States: backlog, active, in_progress, completed
- ✅ Calendar integration with drag-and-drop scheduling
- ✅ Day and Week calendar views
- ✅ Task relationships (parent/child, project association)
- ✅ Overdue persistence (stays red until explicitly cleared)
- ✅ Notes & Lists (freeform notes + checkable lists)
- ✅ ResearchClips (URL bookmarks with tags)
- ✅ Projects (database model exists, basic UI)
- ✅ Google Calendar sync
- ✅ Multi-user auth (NextAuth + Google OAuth)
- ✅ Family/multi-tenancy system
- ✅ PWA with mobile-responsive design
- ✅ Tags on tasks, notes, projects

### What's Not Built
- ❌ Home dashboard with navigation cards
- ❌ Projects dedicated page/UI
- ❌ Recipes & meal planning
- ❌ Month calendar view
- ❌ Documentation system
- ❌ Voice capture
- ❌ AI integration

### Current Navigation
```
Today → Week → All Tasks → Notes & Lists → Calendars
```

Desktop: Top nav bar with tabs
Mobile: Hamburger sidebar menu

---

## Phase 3.5: Home Dashboard & Navigation

**Goal:** Establish the main navigation structure and home landing page

**Status:** 🚧 Next Up

### 3.5.1 Home Dashboard

**What:**
Create a landing page at `/` with navigation cards for main areas:
- Projects
- All (tasks/habits/reminders)
- Calendar
- Vault (notes & lists)
- Recipes
- Docs (grayed out/"Coming Soon")

**Technical:**
- New route: `/` (replaces current Today view)
- Move Today view to `/calendar` or `/calendar/today`
- Card component with icon, title, optional count badge
- Grid layout: 2 columns mobile, 3 columns desktop
- Quick Action FAB remains on all pages

**UI Design:**
- Simple card grid (no widgets/previews for Phase 1)
- Click card → navigate to that area
- Home button always accessible to return
- Clean, minimal design

**Acceptance:**
- ✅ User can navigate to all main areas from home
- ✅ Quick Action FAB works from home page
- ✅ Mobile and desktop layouts work well
- ✅ URL structure is logical (/calendar, /all, /projects, etc.)

**Effort:** 1-2 days

---

### 3.5.2 Update Navigation Structure

**What:**
Update routing and navigation to match new structure

**Changes:**
- `/` → Home dashboard
- `/calendar` → Calendar views (Day/Week/Month)
- `/all` → All tasks/habits/reminders (rename from `/tasks`)
- `/projects` → Projects page (new)
- `/vault` → Notes & Lists (rename from `/lists`)
- `/recipes` → Recipes (placeholder/"Coming Soon")
- `/settings/calendars` → Calendar sync settings (keep as-is)

**Technical:**
- Update Header component nav links
- Update Sidebar component menu items
- Update route files (rename where needed)
- Add breadcrumb navigation for clarity
- Ensure deep linking still works

**Acceptance:**
- ✅ All routes work correctly
- ✅ Navigation is intuitive
- ✅ Back button behavior makes sense
- ✅ Mobile hamburger menu updated

**Effort:** 1 day

---

### 3.5.3 Calendar Enhancements

**What:**
Add Month view and improve calendar navigation

**Month View Features:**
- Calendar grid (7 columns × 4-6 rows)
- Show items as dots or mini-cards on dates
- Click date → navigate to Day view for that date
- Visual distinction for different item types
- Overdue items marked clearly

**Navigation Improvements:**
- View switcher: Day | Week | Month
- Date picker for quick navigation
- "Today" button to return to current date
- Swipe gestures on mobile (optional)

**Technical:**
- New calendar component for Month view
- Shared data fetching for all views
- URL state for selected date and view type
- Responsive grid layout

**Acceptance:**
- ✅ Month view displays correctly
- ✅ Can switch between Day/Week/Month views
- ✅ Items appear on correct dates
- ✅ Clicking date/item navigates appropriately
- ✅ Mobile and desktop both work well

**Effort:** 2-3 days

---

### Phase 3.5 Deliverable
Home dashboard with navigation to 6 main areas, improved calendar with Month view, clean URL structure.

**Total Effort:** 4-6 days

---

## Phase 4: Recipes & Meal Planning

**Goal:** Complete recipe storage and meal planning workflow

**Status:** 📋 Planned

### 4.1 Recipe Database Schema

**What:**
Add database models for recipes, ingredients, and meal plans

**Models:**
```prisma
model Recipe {
  id          Int      @id @default(autoincrement())
  userId      String
  name        String
  description String?
  prepTime    Int?     // minutes
  cookTime    Int?     // minutes
  servings    Int?
  difficulty  String?  // easy, medium, hard
  cuisine     String?  // tag or field
  mealType    String?  // breakfast, lunch, dinner, snack
  rating      Int?     // 1-5 stars
  source      String?  // URL or text
  notes       String?  // personal tweaks/observations
  tags        Json?    @db.JsonB
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  ingredients  RecipeIngredient[]
  instructions RecipeInstruction[]
  mealPlans    MealPlan[]
  user         User     @relation(...)
}

model RecipeIngredient {
  id       Int     @id @default(autoincrement())
  recipeId Int
  name     String  // "flour", "olive oil"
  amount   String? // "2", "1/2"
  unit     String? // "cups", "tbsp"
  notes    String? // "diced", "room temperature"
  order    Int     @default(0)

  recipe   Recipe  @relation(...)
}

model RecipeInstruction {
  id              Int    @id @default(autoincrement())
  recipeId        Int
  stepNumber      Int    // order of instruction
  instructionText String // step description

  recipe   Recipe  @relation(...)
}

model MealPlan {
  id               Int       @id @default(autoincrement())
  userId           String
  date             DateTime  // which day
  mealType         String    // breakfast, lunch, dinner
  recipeId         Int?      // optional - links to recipe
  mealNameOverride String?   // for simple meals ("Leftovers", "Sausages")
  notes            String?
  createdAt        DateTime  @default(now())

  recipe   Recipe? @relation(...)
  user     User    @relation(...)
}
```

**Migration:**
- Create Prisma migration
- Update Prisma client
- Test migration on dev database

**Effort:** 1 day

---

### 4.2 Recipe CRUD

**What:**
Build recipe creation, editing, viewing, and deletion

**Pages:**
- `/recipes` - List all recipes (card grid or table)
- `/recipes/new` - Create new recipe
- `/recipes/[id]` - View recipe detail
- `/recipes/[id]/edit` - Edit recipe

**Features:**
- Recipe form with fields: name, description, prep/cook time, servings, difficulty, tags
- Ingredient list builder (add/remove rows, reorder)
- Instructions list builder (numbered steps, add/remove, reorder)
- Tag autocomplete (reuse existing tag system)
- Photo upload (optional, can be future enhancement)
- Delete with confirmation

**UI Components:**
- RecipeCard (for list view)
- RecipeForm (create/edit)
- RecipeDetail (view mode with print-friendly layout)
- IngredientInput (dynamic list builder)
- InstructionInput (dynamic numbered step builder)

**Acceptance:**
- ✅ Can create recipes with ingredients and instructions
- ✅ Can edit existing recipes
- ✅ Can delete recipes
- ✅ Can search/filter recipes by tags
- ✅ Recipe detail view is clean and usable while cooking

**Effort:** 3-4 days

---

### 4.3 Meal Planning

**What:**
Assign recipes to calendar dates and meal times

**Features:**
- Meal planning view (week grid with breakfast/lunch/dinner rows)
- Drag recipes from list onto meal slots
- Type simple meal names ("Sausages", "Leftovers") with autocomplete
- Click meal → view recipe detail
- Meal plans appear on main calendar
- Unschedule meals (drag back to recipe list or delete)

**UI:**
- Week view with 3 rows per day (B/L/D)
- Recipe picker sidebar or modal
- Drag-and-drop from recipe list to calendar
- Quick text input for simple meals (autocomplete previous entries)

**Technical:**
- MealPlan API endpoints (CRUD)
- Integrate with main calendar data fetching
- Drag-and-drop using existing DnD library
- Autocomplete for meal name override

**Acceptance:**
- ✅ Can assign recipes to specific dates/meal times
- ✅ Can type simple meal names without recipes
- ✅ Meals appear on main calendar view
- ✅ Can view recipe from meal plan
- ✅ Can reschedule or remove meals

**Effort:** 3-4 days

---

### 4.4 Grocery List Integration

**What:**
Generate grocery list from recipe ingredients

**Features:**
- Recipe detail view: "Add to Grocery List" button
- Select specific ingredients or "Add All"
- Optional: Mark pantry items as "already have"
- Ingredients added to special grocery list in Vault
- Grocery list shows quantities and recipe sources
- Check off items while shopping

**Grocery List Behavior:**
- Lives as special List in Vault (listType = "grocery")
- Never auto-deletes (manually managed)
- Checked items move to "Completed" section at bottom
- Manual "Clear Completed" action

**Technical:**
- Update List model if needed (ensure grocery type supported)
- API: POST /api/lists/grocery/items (add ingredients)
- UI: Ingredient selector in recipe detail view
- Grocery list view shows recipe references

**Acceptance:**
- ✅ Can add recipe ingredients to grocery list
- ✅ Quantities preserved from recipe
- ✅ Can manually add non-recipe items to grocery list
- ✅ Check off items while shopping
- ✅ Clear completed items manually

**Effort:** 2-3 days

---

### 4.5 Recipe Browsing & Search

**What:**
Find recipes easily with filters and search

**Features:**
- Search by name or ingredient
- Filter by tags (cuisine, dietary, meal type)
- Filter by difficulty, cook time, rating
- Sort by: recently added, recently used, rating, name
- Favorites (mark recipes as favorites)

**UI:**
- Search bar at top
- Filter dropdowns or sidebar
- Card grid or list view (toggle)
- Quick filter chips for common searches

**Technical:**
- Recipe API with query parameters (search, filters, sort)
- Client-side state for filter selections
- Efficient database queries (indexes on common fields)

**Acceptance:**
- ✅ Can search recipes by name/ingredient
- ✅ Filters work correctly
- ✅ Sort options work
- ✅ Results update quickly (< 500ms)

**Effort:** 2 days

---

### Phase 4 Deliverable
Complete recipe and meal planning system: create recipes, plan meals on calendar, generate grocery lists.

**Total Effort:** 11-15 days (~2-3 weeks)

---

## Phase 5: Projects UI

**Goal:** Build dedicated Projects page and improve project workflows

**Status:** 📋 Planned

### 5.1 Projects Page

**What:**
Create `/projects` page with project list and detail views

**Database Updates Needed:**
- Add missing fields to Projects table via migration:
  - `start_date` (DateTime, nullable)
  - `priority` (String, nullable - low/medium/high/critical)
  - `color` (String, nullable - hex color or preset for visual distinction)

**Features:**
- List all projects (card or table view)
- Project properties visible: name, status, priority, color, tags, task count, dates
- Filter by status (backlog, in_progress, on_hold, completed)
- Filter by tags, priority
- Click project → view project detail
- Create new project (Quick Action FAB or "+ New Project" button)

**Project Detail View:**
- Project info (name, description, status, priority, start/target dates, color, tags)
- List of associated tasks (with inline actions)
- Quick add task to project
- Edit project details
- Archive/delete project

**Technical:**
- Migration: Add start_date, priority, color fields to projects table
- Routes: `/projects`, `/projects/[id]`
- Project API already exists (update to handle new fields)
- ProjectCard component (show color badge/border, priority indicator)
- ProjectForm component (create/edit modal or page with new fields)
- ProjectDetail component

**Acceptance:**
- ✅ Can view all projects
- ✅ Can create/edit/delete projects
- ✅ Can see tasks associated with project
- ✅ Filters work correctly
- ✅ Mobile and desktop layouts work well

**Effort:** 3-4 days

---

### 5.2 Project Task Assignment

**What:**
Improve task-to-project assignment workflow

**Features:**
- When creating task: dropdown to select project (optional)
- Autocomplete project names
- Bulk assign tasks to project (from All Tasks view)
- Move task between projects
- "Unassigned tasks" filter on All Tasks page

**Technical:**
- Update TaskForm with project selector
- Update Item API to accept projectId on create/update
- Add project filter to All Tasks view
- Bulk action: select multiple tasks → assign to project

**Acceptance:**
- ✅ Can assign task to project on creation
- ✅ Can change task's project
- ✅ Can remove task from project
- ✅ Bulk assignment works
- ✅ Unassigned tasks filterable

**Effort:** 2 days

---

### 5.3 Project Dashboard (Optional)

**What:**
Visual overview of project progress

**Features (nice-to-have):**
- Task completion percentage
- Upcoming tasks and deadlines
- Tags/categories used in project
- Activity timeline (recent completions)

**Effort:** 2-3 days (deprioritize if not needed)

---

### Phase 5 Deliverable
Dedicated Projects page with clean UI, easy task assignment, good project organization.

**Total Effort:** 5-9 days (~1-2 weeks)

---

## Phase 6: Voice Capture & AI Integration

**Goal:** Solve "microwave moments" with voice capture, add AI assistance

**Status:** 📋 Future

### 6.1 Voice Capture

**What:**
Quick voice recording that converts to tasks/notes

**Features:**
- Voice recording via Quick Action FAB
- Auto-transcription (Whisper API or similar)
- Intent detection (is this a task, note, reminder, or recipe idea?)
- User reviews transcript before saving
- Option to edit before committing

**Technical:**
- Browser MediaRecorder API or dedicated voice recorder hardware
- Transcription service (OpenAI Whisper, Google Speech-to-Text, or local)
- LLM for intent classification (Claude API, local Ollama)
- API endpoint: POST /api/voice-capture (upload audio, return transcript + suggestion)

**Effort:** 5-7 days

---

### 6.2 AI Context API

**What:**
Allow Claude Code and other AI tools to read LifeOS data for context

**Features:**
- API endpoint: GET /api/context (returns filtered project/task/note data)
- Authentication (API key or session token)
- Query parameters: project filter, date range, entity types
- Structured JSON output

**Technical:**
- New API route: `/api/context`
- Authentication middleware
- Data serialization for AI consumption
- Rate limiting (prevent abuse)

**Effort:** 2-3 days

---

### 6.3 AI-Powered Features (Optional Enhancements)

**Ideas:**
- Smart task suggestions based on calendar and context
- Natural language task creation ("Remind me to call John tomorrow at 2pm")
- Recipe suggestions based on pantry and preferences
- Auto-tagging suggestions
- Smart scheduling (find best time slot for task)

**Effort:** Varies per feature (3-10 days each)

---

### Phase 6 Deliverable
Voice capture working and used regularly, AI context API enabling smarter assistance.

**Total Effort:** 7-10+ days (~1.5-2 weeks for core features)

---

## Phase 7: Documentation System

**Goal:** Knowledge base for project docs, guides, and reference material

**Status:** 📋 Future (Lower Priority)

### 7.1 Documentation Core

**What:**
Markdown-based documentation system

**Features:**
- Create/edit/delete documents
- Hierarchical structure (folders/nesting)
- Rich markdown editor (with preview)
- Link docs to projects
- Tags for organization
- Search across documents

**Technical:**
- Database: documents table with parent_document_id
- API: /api/documents (CRUD + tree structure)
- Markdown editor component (react-markdown, TipTap, or similar)
- Document tree navigation component

**Effort:** 5-7 days

---

### 7.2 Filesystem Sync (Optional)

**What:**
Sync documents to foster-forge filesystem for git version control

**Features:**
- Enable sync per-document (opt-in)
- Write markdown files to configured path
- File watcher detects external changes, updates LifeOS
- Conflict detection (manual resolution)

**Technical:**
- Filesystem sync service (Node.js with chokidar)
- API: /api/documents/:id/sync (enable/disable, trigger)
- Git integration (simple-git library)
- Conflict detection logic

**Effort:** 5-7 days

---

### Phase 7 Deliverable
Documentation system with optional sync/git for advanced users.

**Total Effort:** 5-14 days (~1-3 weeks depending on scope)

---

## Phase 8: Polish & Refinements

**Goal:** UI/UX improvements, performance optimization, nice-to-have features

**Status:** 📋 Ongoing (after major features)

### Potential Enhancements

**UI/UX:**
- Focus vs Deep mode toggle (mobile-optimized vs information-dense)
- Dark mode
- Customizable home dashboard (reorder cards, hide unused areas)
- Keyboard shortcuts (desktop power user features)
- Improved drag-and-drop visual feedback
- Better empty states
- Loading skeletons

**Performance:**
- Database query optimization
- Caching frequently accessed data (Redis)
- Lazy loading for large lists
- Pagination improvements

**Features:**
- Recurring tasks (auto-create based on schedule)
- Task templates (create multiple tasks from template)
- Habit streaks and analytics
- Export data (JSON, CSV, Markdown)
- Bulk operations (archive completed tasks, etc.)
- Custom filters (saved filter presets)

**Integrations:**
- Bidirectional Google Calendar sync (write events to Google)
- Recipe URL scraping (auto-import from websites)
- Email-to-task (forward email → creates task)

**Effort:** Ongoing, prioritize based on real usage

---

## Development Approach

### General Workflow
1. Build feature in isolation (feature branch)
2. Test manually in both mobile and desktop views
3. Test on real devices (phone + desktop)
4. Merge to master, deploy to production
5. Use in real life for 1-2 weeks
6. Gather feedback, iterate
7. Move to next feature

### Testing Strategy
- Manual testing as primary (single-user initially)
- Add error handling when things break (not upfront)
- Document bugs as tasks in LifeOS itself
- Test on real devices (phone, tablet, desktop)

### Documentation Requirements
- Inline code comments for AI context
- Update this implementation plan as phases complete
- Update vision doc if direction changes
- Session wrap-ups as needed (in docs/archive/)

### Technical Debt Management
- Flag shortcuts explicitly when taken (TODOs in code)
- Revisit before shipping phase (decide: fix or accept)
- Document known limitations in bugs.md or decisions.md
- Keep a running list in issues.md

---

## Success Metrics

### Phase 3.5 Success
- ✅ Home dashboard feels intuitive (< 2 clicks to any area)
- ✅ Month view is usable and helpful
- ✅ No confusion about where to find things

### Phase 4 Success
- ✅ Can add recipes faster than current method
- ✅ Grocery list generation saves measurable time
- ✅ Meal planning actually gets used weekly
- ✅ System handles both recipes and simple meal names smoothly

### Phase 5 Success
- ✅ Projects provide value (tasks are easier to find)
- ✅ Project view feels organized, not cluttered
- ✅ Optional nature works (tasks without projects are fine)

### Phase 6 Success
- ✅ Voice capture actually gets used (solves "microwave moments")
- ✅ AI suggestions are helpful more often than annoying
- ✅ System feels proactive without being intrusive

### Overall Success
- ✅ LifeOS becomes single source of truth (not abandoned)
- ✅ Daily usage is faster than alternatives
- ✅ System is simple enough to maintain
- ✅ Family members adopt it willingly

---

## Next Steps

**Immediate (This Week):**
1. Build home dashboard with 6 navigation cards
2. Update routing structure (/calendar, /all, /projects, /vault, /recipes)
3. Update Header and Sidebar navigation
4. Test on mobile and desktop

**Short Term (Next 2-3 Weeks):**
1. Add Month calendar view
2. Improve calendar navigation (view switcher, date picker)
3. Test and polish calendar UX

**Medium Term (1-2 Months):**
1. Build recipe system (CRUD, ingredients, instructions)
2. Implement meal planning (assign recipes to calendar)
3. Grocery list integration
4. Recipe search and filtering

**Long Term (3+ Months):**
1. Projects UI and workflows
2. Voice capture and AI integration
3. Documentation system (optional)
4. Ongoing polish and refinements

---

**Document Status:** Active Implementation Plan v3.0
**Last Updated:** February 3, 2026
**Next Review:** After Phase 3.5 completion
