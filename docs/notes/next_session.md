# Next Session - Start Here

**Last Updated:** February 1, 2026
**Current Status:** Phase 3.5 Complete ✅ | Phase 3.6 Next
**Branch:** `feature/phase-3.1-foundation-data-model`
**Production:** https://lifeos-dev.foster-home.net (PM2 on port 3002)

---

## Quick Start

```bash
# SSH to foster-forge, then:
npm run dev
# Dev server runs on port 3002
# Access at: http://localhost:3002
```

---

## Architecture Context (Read This First)

LifeOS is a **two-mode, single-platform** system. Understanding this shapes every decision:

**Focused Mode** — streamlined, low cognitive load. 3-page swipe. Quick capture and status checks. This is what Phase 3 builds. Route group: `/app/(focused)`.

**Deep Mode** — full interface. Sidebar nav, table views, project tracking, knowledge base, research clips. Same data as focused mode, richer UI. Built after Phase 3 stabilizes. Route group: `/app/(deep)` (future).

Both modes available on any device. Default on first launch: focused on mobile, deep on desktop. After that, app persists last mode + last page. Mode only changes on explicit user toggle.

**Full architecture doc:** `phase-3-implementation-plan.md` — this is the source of truth.

---

## What's Complete

### ✅ Phase 3.1 - Data Model & Migration
- Schema: state, tags, complexity, energy, nullable dates, subtasks, showOnCalendar, durationMinutes
- Migration applied, all fields working
- **Supplemental migrations (Feb 1, 2026):**
  - ✅ `blockedBy` on tasks (JSONB array) — ADR-016
  - ✅ `ResearchClip` model — ADR-017
  - ✅ `parentNoteId` on notes — ADR-018
  - ✅ `Project` model (name, description, status, blockedBy, targetDate, tags)
  - ✅ `projectId` on tasks (optional association)

### ✅ Phase 3.2 - Tag System
- TagInput with autocomplete, multi-tag on tasks and lists, tag filtering

### ✅ Phase 3.3 - All Tasks View
- `/tasks` route, state/tag/complexity/energy filtering, state badges
- Click bug fixed in Phase 3.5 (TaskForm modal opens correctly)

### ✅ Phase 3.4 - Calendar View Modes
- Timeline mode (hour axis 5am–11pm, zoom) and compact mode
- View toggle persists. Duration auto-calc. Pin to today. Categorized sections.
- See `phase-3.4-complete-summary.md`

### ✅ Phase 3.5 - Notes + UI Polish
- Notes API (`/api/notes` — GET/POST/PATCH/DELETE)
- NoteCard, NoteForm, ListCard components
- Combined "Notes & Lists" page at `/lists`
- Filter (All | Notes | Lists), sort (Recent | Alphabetical), pin/unpin
- FAB component added
- All modals have back button/gesture
- All Tasks click bug fixed (TaskForm modal)

---

## Next: Phase 3.6 - Navigation Refactor

**Goal:** Swipeable 3-page navigation. This IS the focused mode layout.

### What to Build

1. **Choose swipe library** — evaluate framer-motion, react-swipeable, react-spring
2. **SwipeContainer component:**
   - 3 pages: All Tasks ↔ Calendar ↔ Notes & Lists
   - Smooth animations, touch gestures, keyboard nav (arrow keys)
3. **Page indicators** — dots or tabs, tappable to jump between pages
4. **Update hamburger menu:**
   - Remove from nav: Today, Tasks, Week, Lists (these are now the swipe pages)
   - Keep: Habits, Reminders, Settings
   - Future placeholder: Meals & Recipes
5. **Default page:** Calendar (center page). Persist last viewed page across sessions.
6. **Back navigation** from Habits/Reminders/Settings back to swipe area

### Route Structure
```
/app/(focused)/          — focused mode layout with swipe container
  page.tsx               — SwipeContainer with 3 child pages
  tasks/                 — All Tasks page (currently at /tasks)
  calendar/              — Calendar page (currently at /)
  lists/                 — Notes & Lists page (currently at /lists)
  habits/                — Habits (from hamburger)
  reminders/             — Reminders (from hamburger)
  settings/              — Settings (from hamburger)
```

### Success Criteria
- [ ] Can swipe between 3 pages smoothly
- [ ] Page indicators show current page, are tappable
- [ ] Hamburger menu updated (removed swipe pages, kept secondary)
- [ ] Calendar is default on first open
- [ ] Last viewed page persists across app close/reopen
- [ ] Navigation from Habits/Reminders/Settings back to swipe works

### Branch
`feature/phase-3.6-navigation`

---

## Remaining UI Polish (do after Phase 3.6)

1. **Sidebar label** — update to "Notes & Lists" in `components/Sidebar.tsx`
2. **TaskForm styling** — make consistent with NoteForm/ListForm modals (`components/TaskForm.tsx`)
3. **Pin inside list detail** — add pin/unpin button in `app/lists/[id]/page.tsx`
4. **Delete in detail views** — add delete buttons inside note/list/task detail views (removed from cards, not yet added to details)

---

## Known Issues

- No critical bugs blocking development
- All Phase 3.1–3.5 features working as designed
- Production build deployed and accessible

---

## After Phase 3.6

| Phase | What | Notes |
|---|---|---|
| 3.7 | FAB Menu expansion | FAB component exists, needs multi-option menu wired to all creation forms |
| 3.8 | Drag & Drop | Unscheduled ↔ Calendar scheduling via drag |
| 3.9 | UI Polish | Quick Add simplification, text wrapping, loading/empty/error states |
| 3.10 | Schema supplement | blockedBy, ResearchClip, parentNoteId (if not added earlier) |
| 3.11 | Deep Mode UI | Second interface layer — sidebar nav, tables, project tracking, knowledge base |

See `phase-3-implementation-plan.md` for full details on all phases.

---

## Important Reminders

1. **Port 3002** — dev server is 3002, NOT 3000 (that's OpenWebUI)
2. **After schema changes** — run `npx prisma generate` and restart dev server
3. **Timezone** — server runs UTC, client handles local time conversion
4. **All Phase 3.1–3.5** on same branch: `feature/phase-3.1-foundation-data-model`
5. **Route group naming** — focused mode is `/app/(focused)`, not `/app/(mobile)`

---

**This file updated at end of each session. It is the starting point for the next Claude Code session.**
