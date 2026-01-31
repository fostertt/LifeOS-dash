# Next Session - Start Here

**Last Updated:** January 31, 2026
**Current Status:** Phase 3.5 Complete ✅
**Branch:** `feature/phase-3.1-foundation-data-model`
**Production:** https://lifeos-dev.foster-home.net (PM2 on port 3002)

---

## Quick Start

```bash
# Start dev server
npm run dev

# Dev server runs on port 3002
# Access at: http://localhost:3002
```

---

## What's Complete

### ✅ Phase 3.1 - Data Model & Migration
- Schema updated with state, tags, complexity, energy fields
- Migration applied successfully
- All fields working in UI

### ✅ Phase 3.2 - Tag System
- TagInput component with autocomplete
- Multi-tag support on tasks and lists
- Tag filtering functional

### ✅ Phase 3.3 - All Tasks View
- `/tasks` route shows all tasks with filtering
- State badges (unscheduled, scheduled, in progress, on hold)
- Complexity, energy, tag filters
- **Known Issue:** Clicking task navigates to Today instead of opening modal

### ✅ Phase 3.4 - Calendar View Modes
- Timeline mode (hour axis 5am-11pm, zoom controls)
- Compact mode (categorized list)
- View toggle (desktop + mobile)
- Duration auto-calculation
- Pin to today feature (showOnCalendar)
- Categorized sections (Reminders, Overdue, In Progress, Scheduled, Quick Captures)

**See:** `docs/notes/phase-3.4-complete-summary.md` for details

### ✅ Phase 3.5 - Notes Feature
- Note API routes (GET, POST, PATCH, DELETE at `/api/notes`)
- NoteCard and NoteForm components with tag support
- Combined "Notes & Lists" page at `/lists`
- List description field added to schema and UI
- Filtering: All | Notes | Lists
- Sorting: Recent | Alphabetical
- Pin/unpin functionality for both Notes and Lists
- Pinned items section at top
- Delete functionality for both types
- ListCard component for consistency

**Components:** `components/NoteCard.tsx`, `components/NoteForm.tsx`, `components/ListCard.tsx`

---

## Next: Phase 3.6 - Navigation Refactor

**Goal:** Swipeable navigation between All Tasks ↔ Calendar ↔ Notes/Lists

### What to Build

1. **Note API Routes**
   - GET /api/notes - List all notes
   - POST /api/notes - Create note
   - PATCH /api/notes/[id] - Update note
   - DELETE /api/notes/[id] - Delete note

2. **Note Components**
   - NoteCard - Display component
   - NoteForm - Create/edit modal
   - Optional title field
   - Freeform textarea for content
   - Tag support (reuse TagInput from Phase 3.2)

3. **Rename Lists Page**
   - Route: `/lists` → `/notes-and-lists` or keep `/lists`
   - Page title: "Notes & Lists"
   - Combined view showing both types

4. **List Enhancements**
   - Add description field to list model/forms
   - Description displays below title
   - Keep list items simple (text + checkbox)

5. **Combined View Features**
   - Filter toggle: All | Notes | Lists
   - Sort options: Recent, Alphabetical, Pinned first
   - Pin/unpin button on both Notes and Lists
   - Pinned items always at top

### Database Schema

Note model already exists in schema (from Phase 3.1):
```prisma
model Note {
  id        Int      @id @default(autoincrement())
  userId    String   @map("user_id")
  title     String?  // Optional title
  content   String   // Freeform text content
  tags      Json?    @db.JsonB // Array of tag strings
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("notes")
}
```

List model needs description field added:
- Add `description String?` to List model
- Migration needed for this field

### Reference Files

- **Phase plan:** `docs/notes/phase-3-implementation-plan.md` (see Phase 3.5)
- **Schema:** `prisma/schema.prisma`
- **Existing Lists page:** `app/lists/page.tsx`
- **Tag component:** `components/TagInput.tsx`

### Success Criteria

- [ ] Can create notes with optional title and content
- [ ] Can create lists with description
- [ ] Notes and Lists both display on same page
- [ ] Can filter by type (All | Notes | Lists)
- [ ] Can add tags to notes
- [ ] Can pin/unpin notes and lists
- [ ] Pinned items sort to top
- [ ] Sort options work (Recent, Alphabetical)

---

## Known Issues to Address

### From Phase 3.3
**All Tasks Click Bug:**
- Symptom: Clicking task in /tasks navigates to Today instead of opening modal
- Location: `app/tasks/page.tsx`
- Likely cause: onClick handler or navigation logic
- Priority: Medium (functionality works, just wrong behavior)

### General
- No critical bugs blocking development
- All features from 3.1-3.5 working as designed
- Production build deployed and accessible at https://lifeos-dev.foster-home.net

---

## Git Status

**Branch:** `feature/phase-3.1-foundation-data-model`
**Uncommitted changes:** Phase 3.5 complete (needs commit)
**Last pushed commit:** `a070941` Phase 3.4 complete

**To commit and push:**
```bash
git add .
git commit -m "Phase 3.5: Notes feature with filtering and pinning"
git push origin feature/phase-3.1-foundation-data-model
```

**To create new branch for 3.5:**
```bash
# Option 1: Continue on same branch (recommended)
# Just keep working on feature/phase-3.1-foundation-data-model

# Option 2: New branch
git checkout -b feature/phase-3.5-notes
git push -u origin feature/phase-3.5-notes
```

---

## Important Reminders

1. **Port 3002** - Dev server runs on 3002, NOT 3000 (that's OpenWebUI)
2. **After schema changes** - Run `npx prisma generate` and restart dev server
3. **Timezone:** Server runs UTC, client handles local time conversion
4. **Phase 3.1-3.4** are all on the same branch (feature/phase-3.1-foundation-data-model)
5. **Task list** - Use TaskCreate/TaskUpdate tools to track progress if needed

---

## After Phase 3.5

**Phase 3.6:** Navigation Refactor (swipeable All Tasks ↔ Calendar ↔ Notes/Lists)
**Phase 3.7:** FAB Menu (global add button)
**Phase 3.8:** Drag & Drop Scheduling
**Phase 3.9:** UI Polish & Bug Fixes

See `phase-3-implementation-plan.md` for full roadmap.

---

**Session Management:** This file updated at end of each session. Delete or archive when project reaches clean state.
