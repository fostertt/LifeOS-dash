# LifeOS Implementation Plan

**Version:** 1.0  
**Date:** February 3, 2026  
**Companion Document:** lifeos-vision.md v2.0

---

## Overview

This document outlines the phased implementation approach for LifeOS. Each phase builds on the previous, delivering functional value incrementally while maintaining architectural consistency with the vision.

**Key Principles:**
- Ship working features, test in real use, iterate
- Do it right over do it fast (avoid technical debt)
- Each phase should be usable and valuable on its own
- Reference vision doc for detailed specs - this is the roadmap

---

## Current State Assessment

**What's Working:**
- Core task management system
- Calendar integration (iCal feeds)
- PostgreSQL database on foster-forge
- PWA with mobile responsive design
- Production deployment via Docker/Cloudflare tunnel
- Basic UI/navigation structure

**What's In Progress:**
- Focus UI implementation

**What's Not Built:**
- Habits system (habits exist and can be created - need to verify if this constitutes full "system")
- Reminders system (reminders exist and can be created - need to verify if this constitutes full "system")
- Recipes & meal planning
- Projects structure (need to verify current state)
- Documentation sync/git integration (planned for much later phase)
- Universal tagging across entities (tagging exists but may not be as robust as needed)

---

## Phase 1: Foundation & Core Workflows

**Goal:** Establish home dashboard navigation, complete core task/project management, implement Focus/Deep mode distinction

### 1.1 Home Dashboard & Navigation
**What:**
- 6-card home screen (Projects, All, Calendar, Vault, Recipes, Docs)
- Navigation pattern: card → dedicated page, back to home
- Quick Action FAB on all pages
- Mode toggle accessible on all pages

**Technical:**
- React routing for each main area
- Shared layout component with FAB and mode toggle
- Persist mode preference per device (localStorage)

**Acceptance:**
- User can navigate to all 6 main areas from home
- Mode toggle works and persists
- Quick Action FAB triggers appropriate capture modal

### 1.2 Projects System
**What:**
- See vision doc "Projects" section for full spec
- CRUD operations for projects
- Project properties: name, description, status, tags, dates, priority, color
- Project filtering by status/tags

**UI:**
- Focus mode: list view with expand-to-see-tasks
- Deep mode: table view with all columns, bulk operations

**Technical:**
- Database: projects table (see vision doc data model)
- API: `/api/projects` with CRUD + filtering
- Tags polymorphic relationship

**Acceptance:**
- Can create/edit/delete projects
- Can assign tasks to projects (already working?)
- Project filters work in both modes
- Color coding visible

### 1.3 All View (Tasks + Habits + Reminders)
**What:**
- Unified view showing all three entity types
- Filter/group by type, project, date, status, tags
- Focus mode: fewer columns by default, scrollable
- Deep mode: more columns, advanced filters, bulk actions

**Technical:**
- Database: habits table, reminders table (tasks already exist)
- API: `/api/habits`, `/api/reminders`
- UI: shared table component that adapts to mode

**Habits specifics:**
- See vision doc "Habits & Routines" section
- Check-off tracking with completion history
- Optional routine grouping
- Recurrence patterns (daily, weekly, custom)

**Reminders specifics:**
- See vision doc "Reminders" section
- One-time or recurring
- Snooze functionality
- Optional project association

**Acceptance:**
- All three types visible in unified view
- Can create/edit/delete habits and reminders
- Habit check-offs record completion history
- Filters work across all three types
- Mode toggle changes visible columns appropriately

### 1.4 Calendar View Enhancements
**What:**
- Day timeline view (generally working)
- Week compact view
- Month grid view
- Mode toggle affects information density, not which views available

**Technical:**
- Calendar component with three view modes
- Aggregates tasks (with due dates), habits (scheduled), events (iCal), reminders

**Acceptance:**
- All three view types accessible in both modes
- Information density differs by mode
- Events/tasks/habits render with appropriate color coding

**Phase 1 Deliverable:** Functional task/project/habit/reminder system with home navigation and mode distinction

---

## Phase 2: Vault & Enhanced Organization

**Goal:** Add notes/lists capability, strengthen tagging system, improve filtering

### 2.1 Vault - Notes & Lists
**What:**
- See vision doc "Vault (Notes & Lists)" section
- Note types (may not all be implemented immediately): freeform, list, picture, voice
- List items can be checked off (for grocery lists, packing lists, etc.)
- Can link notes to projects
- Universal tagging

**UI:**
- Focus mode: note content only, simple editor
- Deep mode: sidebar with note tree, metadata panel

**Technical:**
- Database: notes table, note_items table (for lists)
- API: `/api/notes`, `/api/notes/:id/items`
- Rich text editor (e.g., TipTap, Quill)

**Acceptance:**
- Can create freeform and list-type notes
- List items checkable
- Notes filterable by project/tags
- Grocery list specifically accessible (special filter or flag)

### 2.2 Universal Tagging System
**What:**
- Tags work across all entity types
- Tag autocomplete on creation
- Tag filtering across views
- Tag management (rename, merge, delete)

**Technical:**
- Polymorphic tags table (already in data model)
- API: `/api/tags/autocomplete`, `/api/tags/:id` (CRUD)
- UI: tag input component with autocomplete

**Acceptance:**
- Can add tags to projects, tasks, habits, reminders, notes
- Tag autocomplete works
- Can filter any view by tag
- Tag management UI works (rename/delete)

### 2.3 Advanced Filtering & Search
**What:**
- Saved filter presets (e.g., "Today's tasks", "Active projects")
- Multi-criteria filtering (project + tag + date range)
- Search across entity types

**Technical:**
- API: filter query parameters (expand existing endpoints)
- UI: filter builder component
- Optional: saved filters stored in user preferences table

**Acceptance:**
- Can filter views by multiple criteria
- Search returns relevant results across types
- Saved filters persist (optional)

**Phase 2 Deliverable:** Full note-taking capability, robust tagging/filtering, organized information retrieval

---

## Phase 3: Recipes & Meal Planning

**Goal:** Complete meal planning workflow from recipe storage to grocery list generation

### 3.1 Recipes System
**What:**
- See vision doc "Recipes & Meal Planning" section
- Recipe CRUD with ingredients, instructions, metadata
- Tagging (cuisine, dietary restrictions, meal type)
- Image storage (optional)

**Technical:**
- Database: recipes, recipe_ingredients, recipe_instructions tables
- API: `/api/recipes` with nested ingredient/instruction endpoints
- Image storage: filesystem with API serving

**Acceptance:**
- Can create/edit/delete recipes
- Ingredients and instructions structured properly
- Recipe search/filter by tags works

### 3.2 Meal Planning & Calendar Integration
**What:**
- Assign recipes to calendar dates/meal types
- Week view of meal plan
- Drag-and-drop recipe assignment

**Technical:**
- Database: meal_plans table (recipe_id, date, meal_type)
- API: `/api/meal-plans`
- UI: calendar view with meal plan overlay

**Acceptance:**
- Can assign recipes to dates
- Calendar shows meal plan alongside events/tasks
- Can view week's meal plan at a glance

### 3.3 Grocery List Integration
**What:**
- Generate grocery list from meal plan
- Mark pantry items as "already have"
- Send unchecked items to grocery list note
- Grocery list in Vault as special list-type note

**Technical:**
- API: `/api/meal-plans/grocery-list` (generates from date range)
- Pantry tracking (optional enhancement: pantry_items table)
- UI: grocery list generation flow, pantry checklist

**Acceptance:**
- Can generate grocery list from selected recipes
- Pantry items can be marked as owned
- Grocery list appears in Vault
- Can check off items while shopping

**Phase 3 Deliverable:** Full meal planning workflow, recipe database, automated grocery list creation

---

## Phase 4: Documentation & Knowledge Management

**Goal:** Add comprehensive documentation system with optional sync/git integration

### 4.1 Documentation Core
**What:**
- See vision doc "Documentation" section
- Hierarchical document structure (folders/nesting)
- Rich markdown editor
- Document metadata (tags, linked projects)

**Technical:**
- Database: documents table with parent_document_id for hierarchy
- API: `/api/documents` with tree structure support
- Markdown editor with preview (e.g., react-markdown-editor-lite)

**Acceptance:**
- Can create/edit/delete documents
- Documents can nest in folders
- Markdown rendering works
- Can link docs to projects

### 4.2 Filesystem Sync (Optional per Document)
**What:**
- Enable sync for specific documents
- LifeOS writes .md files to foster-forge filesystem
- File watcher detects external changes, updates LifeOS cache
- Conflict flagging for manual resolution

**Technical:**
- Filesystem path configured per document
- Sync service (Node.js with chokidar for file watching)
- API: `/api/documents/:id/sync` (enable/disable, trigger manual sync)

**Acceptance:**
- Can enable sync on a document
- Changes in LifeOS write to filesystem
- External file changes update LifeOS
- Conflicts detected and flagged

### 4.3 Git Integration (Optional per Document)
**What:**
- Enable git version control for synced documents
- Commit, push, view history
- Commit messages optional (default to timestamp)

**Technical:**
- Database: git_repos table, document_versions table
- Git operations via simple-git library
- API: `/api/documents/:id/commit`, `/api/documents/:id/push`

**Acceptance:**
- Can commit document changes with message
- Can push to remote repo
- Version history viewable (Deep mode)

### 4.4 Documentation UI (Focus vs Deep)
**What:**
- Focus mode: document content only, simple editor
- Deep mode: sidebar with doc tree, version history panel, metadata

**Technical:**
- Conditional rendering based on mode
- Sidebar navigation component
- Version diff viewer (optional enhancement)

**Acceptance:**
- Focus mode shows clean content
- Deep mode shows tree navigation and metadata
- Mode toggle works seamlessly

**Phase 4 Deliverable:** Full documentation system with optional sync/git for power users

---

## Phase 5: Voice Capture & AI Integration

**Goal:** Solve "microwave moments" with voice capture, add AI-powered features

### 5.1 Voice Capture System
**What:**
- Quick voice recording from Quick Action FAB
- Transcription (Whisper API or similar)
- Intent detection: route to task, note, reminder, or generic capture
- Optional: extract structured data (due dates, priorities)

**Technical:**
- Audio recording in browser (MediaRecorder API)
- Transcription service integration
- API: `/api/voice-capture` (upload audio, return transcript)
- LLM integration for intent detection (Claude API)

**Hardware:**
- Evaluate dedicated voice recorder (Soundcore Work AI, etc.)
- OR: use phone as capture device

**Acceptance:**
- Can record voice note from any page
- Transcription accurate enough for usability
- Transcript routed to appropriate entity type
- Can manually correct/adjust before saving

### 5.2 AI Context API
**What:**
- API endpoint for external AI tools to read LifeOS data
- Authentication for Claude Code, other assistants
- Structured data export (project docs, tasks, notes)

**Technical:**
- API: `/api/context` (returns filtered/formatted data)
- Authentication: API key or session token
- Query parameters: project filter, date range, entity types

**Acceptance:**
- Claude Code can read project docs via API
- AI assistants can query tasks/notes for context
- Data returned in structured format (JSON)

### 5.3 AI-Powered Features (Optional Enhancements)
**What:**
- Smart tagging suggestions
- Natural language task creation
- Recipe URL scraping
- Document Q&A (semantic search)

**Technical:**
- LLM API integration (Claude, local Ollama)
- Embeddings for semantic search (optional: vector DB)

**Acceptance:**
- (Per feature as implemented)

**Phase 5 Deliverable:** Voice capture working, AI context API functional, "microwave moments" solved

---

## Phase 6: Polish & Multi-User

**Goal:** Refine UX, add family collaboration features

### 6.1 UX Refinements
**What:**
- Dashboards with widgets (home page)
- Personal analytics (task completion rates, habit streaks)
- Project dashboards (progress visualization)
- Keyboard shortcuts (Deep mode)

### 6.2 Multi-User Support
**What:**
- User accounts with authentication
- Assign tasks to family members
- Shared projects and lists
- Permissions and access control

**Technical:**
- Database: users table, role-based permissions
- Authentication: JWT or session-based
- API: user-scoped data filtering

**Acceptance:**
- Multiple users can log in
- Tasks can be assigned to users
- Shared vs personal items distinguished

### 6.3 Mobile App (Optional)
**What:**
- React Native app for better mobile performance
- Offline-first architecture
- Push notifications for reminders

**Phase 6 Deliverable:** Production-ready system with family collaboration

---

## Phase 7: Advanced Integrations

**Goal:** Connect LifeOS to external systems

### 7.1 Calendar Sync
**What:**
- Bidirectional Google Calendar sync
- CalDAV support for other calendars

### 7.2 Import/Export
**What:**
- Import from Todoist, Asana, Notion
- Export to standard formats (JSON, CSV, Markdown)

### 7.3 Automation & Webhooks
**What:**
- Recurring tasks
- Task templates
- Webhook integrations (IFTTT, Zapier)
- Email-to-task

**Phase 7 Deliverable:** Ecosystem integration, enhanced automation

---

## Implementation Notes

### General Development Approach
1. Build feature in isolation (branch)
2. Test manually in Focus and Deep modes
3. Test on mobile (PWA)
4. Merge to main, deploy to foster-forge
5. Use in real life for 1-2 weeks
6. Iterate based on actual usage

### Testing Strategy
- Manual testing as primary (single-user system initially)
- Add error handling when things break, not upfront
- Document bugs as tasks in LifeOS itself

### Documentation Requirements
- Inline code comments sufficient for AI context
- Session wrap-ups as .md files when needed
- Update this implementation plan as phases complete

### Technical Debt Management
- Flag shortcuts explicitly when taken
- Revisit before shipping phase (decide: fix or accept)
- Document known limitations in vision doc

---

## Next Steps

1. Review this plan, adjust priorities if needed
2. Choose starting point (likely Phase 1.1 or 1.3 depending on current state)
3. Break chosen phase into concrete tasks in LifeOS
4. Begin implementation

---

**Document Status:** Active Implementation Plan v1.0  
**Last Updated:** February 3, 2026
