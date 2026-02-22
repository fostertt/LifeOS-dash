# LifeOS Roadmap

**Last Updated:** 2026-02-22
**Replaces:** lifeos-implementation-plan.md, lifeos-vision.md, ui-polish-plan.md, phase4-ux-improvements.md, ADR-012-revised

---

## What LifeOS Is

Personal productivity dashboard — single place for tasks, notes, lists, habits, reminders, and calendar. Single-user (Tyrrell), mobile-first PWA. Self-hosted on foster-forge.

**Production URL:** lifeos.foster-home.net
**Dev URL:** lifeos-dev.foster-home.net (port 3002)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **ORM:** Prisma 6, PostgreSQL (foster-forge)
- **Auth:** NextAuth v4, Google OAuth (JWT strategy)
- **Integrations:** Google Calendar API (read + write OAuth), Voice Pipeline (separate Python FastAPI project)
- **Deployment:** PM2 on foster-forge

---

## What's Built & Working (as of Feb 22, 2026)

### Core
- **Items** (tasks, habits, reminders) — unified `Item` model with `itemType` discriminator
- **3-state model:** backlog | active | completed (ADR-019, collapsed from 4)
- **6 recurrence types:** daily, weekly, monthly (advancing — advances dueDate), every_n_days, every_n_weeks, days_after_completion (also advancing). Habits use per-date completion via ItemCompletion table.
- **Sub-items** on tasks/habits/reminders
- **Tags** (JSON array) on items, notes, lists
- **Overdue persistence** — `isOverdue` flag stays until explicitly cleared or completed (ADR-013)

### Calendar
- **4 views:** Today (timeline), Schedule (list), Week (time grid), Month (calendar grid)
- **Compact mobile headers** on all views with date nav + view/filter toggles
- **Google Calendar** — events displayed in all views, correct timezone handling (America/New_York)
- **Today view layout:** Reminders → Overdue → Habits → Unscheduled (no-time + undated) → Time grid (ADR-017)
- **Collapsible sections** everywhere

### Vault
- **Notes + Lists** — Keep-style full-page editors with color, tags, pin toggle
- **Bottom panel** pinned to viewport in editors (UX-010)

### Inbox (ADR-020)
- **Schema:** `source String?`, `reviewedAt DateTime?` on Item, Note, List
- **Inbox page** replaces Home — shows unreviewed items from voice, quick capture, system
- **Bottom tab bar:** Inbox | All | [+] | Calendar | Vault (with badge count)
- **Quick capture** = title-only → inbox for triage

### Voice Pipeline (separate project)
- Python FastAPI on foster-forge, watches for voice memo files
- Transcribes → Gemini classification → POST to LifeOS API
- Work email routing (say "work" → tags + emails)
- **Not yet wired:** pipeline doesn't send `source: "voice"` yet — inbox won't show voice items until this is done

### Drag and Drop (ADR-018)
- Today view: vertical drag with ghost pill overlay, color-coded by item type
- Week view: 2D drag (time + day columns), click-to-create on empty cells
- Google Calendar events read-only (not draggable)
- Drop auto-advances backlog → active
- 3px activation distance for small targets

### UI Polish (Phases 1–8 complete)
- Swipe navigation removed, bottom tab bar, compact task cards, chronological sorting
- Collapsible sections, filter panels, compact headers
- Month view with navigation, week numbers, fiscal weeks
- View consolidation (5 views → 4, "Today" replaces "Timeline"/"Compact")
- Vault compact Google Keep-style grid layout
- FAB redesign: clean Lucide SVG icons, rotation animation

---

## Roadmap: What's Next

### Completed Tiers

**Vault Polish (Phase 7)** — DONE (Feb 2026)
- Compact Google Keep-style grid layout with filtering/sorting
- FAB clean Lucide icons + animations (Phase 8) — DONE

**Drag and Drop (ADR-018)** — DONE (Feb 2026)
- Today view: vertical drag with DragOverlay ghost pill
- Week view: 2D drag (time + day columns) + click-to-create on empty cells
- Google Calendar events: read-only, not draggable
- Drop logic: sets date/time, auto-advances backlog → active
- **Known DnD issues (not blocking):**
  - Week view pills very small — drag awkward on mobile. Needs drag handles or press-to-enlarge UX.
  - 15-minute snap grid not yet implemented (items land on nearest hour).
  - Resize handles deferred.

**Voice Pipeline to Inbox** — MOSTLY DONE (Feb 2026)
- Items API accepts `source` field and routes to inbox correctly
- **Small gaps:** Notes and Lists POST handlers don't pass `source` field yet. Note content still required (should be optional).

### Tier 1: Next Major Features

**Projects UI**
- `/projects` page with list + detail views
- Project properties: name, description, status, priority, color, tags, task count
- Task assignment: dropdown in TaskForm, filter by project on All page
- `projectId` already on Item, Note, List (added in ADR-020 schema)
- **Not started** — database column exists but UI is placeholder

**Recipes & Meal Planning**
- Recipe CRUD (ingredients, instructions, tags, ratings)
- Meal planning: assign recipes to calendar dates (breakfast/lunch/dinner)
- Grocery list integration (add ingredients to Vault list)
- **Not started** — needs schema design and architecture discussion

### Tier 2: Daily Briefing & Voice Rollup (ADR-016)

**After inbox is battle-tested.**

- **Voice capture rollup:** Query `WHERE source = 'voice' AND createdAt` in period → create summary Note with `source: "system"`
- **Daily briefing:** Cron at 2 AM → Note with today's scheduled, overdue, yesterday's completions, voice captures
- Both are pure DB queries formatted as markdown. Zero API cost.

### Tier 3: Future / Backlog

- **15-min snap grid** for DnD timeline drag
- **DnD drag handles / press-to-enlarge** for week view small pills
- **GCal write-back** — OAuth scope already includes write, implement as follow-up
- **Rich text notes** (FEAT-003) — markdown editor with preview
- **Dark mode** — full app (currently only partial)
- **Calendar auto-create from voice** — pipeline calls GCal API on datetime captures
- **Voice notes in Vault** — browse transcripts/summaries
- **Pattern detection** — analyze captures over time (needs data volume)
- **Documentation system** — markdown docs with hierarchy, optional filesystem sync
- **Bulk operations** — multi-select on All page (UX-007)
- **Habit streaks/analytics**
- **Recipe URL scraping**
- **Notes/Lists source field** — add `source` to POST handlers for `/api/notes` and `/api/lists`
- **Note content optional** — remove required validation on note content field

---

## Known Bugs

See `docs/notes/bugs.md` for full details. Active bugs:

| Bug | Priority | Notes |
|-----|----------|-------|
| Mobile width overflow on All page | Low | Needs browser dev tools inspection. `overflow-x: hidden` on body is a workaround. |
| Voice note rename re-triggers processing | Medium | File watcher treats rename as new file. Pipeline side fix. |
| Google Calendar dateless events on Today | Low | Deferred. Only affects synced items without dates. |
| Auto-refresh unreliable on Android | Medium | `visibilitychange`/`focus` don't fire reliably. May need polling or service worker. |
| Enter key sub-items on Android | Low | GBoard sends keyCode 229. Desktop works fine. Deferred. |

---

## Architecture Decisions (Quick Reference)

All ADRs in `docs/notes/decisions.md`. Key ones:

| ADR | Decision |
|-----|----------|
| 020 | Inbox: `source` + `reviewedAt` fields, inbox replaces Home tab |
| 019 | 3 states: backlog / active / completed |
| 018 | Drag-and-drop: @dnd-kit/core, 15-min snap, GCal read-only |
| 017 | Today view: Overdue → Unscheduled → Time grid |
| 016 | Daily briefing + voice rollup as system-generated Notes |
| 015 | Keep-style full-page editors for notes/lists |
| 014 | Two recurrence completion models (per-date vs advancing) |
| 013 | Persistent isOverdue flag |
| 004 | Unified Item model (task/habit/reminder in one table) |
| 003 | JWT sessions (not database sessions) |

---

## Database Schema (Current)

See `prisma/schema.prisma` for full schema. Key models:

- **Item** — tasks, habits, reminders. Has recurrence fields, sub-items, completions, source/reviewedAt (inbox), projectId
- **Note** — freeform notes with color, tags, source/reviewedAt, projectId
- **List** / **ListItem** — checkable lists with color, tags, source/reviewedAt, projectId
- **ItemCompletion** — per-date completion records (habits + advancing recurrence history)
- **CalendarEvent** — cached Google Calendar events
- **CalendarSync** — Google Calendar sync state per calendar

---

## Key Files

| File | What it does |
|------|-------------|
| `app/calendar/page.tsx` | All calendar views (~3200 lines) |
| `app/all/page.tsx` | All items page with filters/groups |
| `app/page.tsx` | Inbox page |
| `app/vault/page.tsx` | Vault (notes + lists cards) |
| `app/vault/notes/[id]/page.tsx` | Note editor |
| `app/vault/lists/[id]/page.tsx` | List editor |
| ~~`app/week/page.tsx`~~ | Deleted — week view consolidated into `app/calendar/page.tsx` |
| `components/TaskForm.tsx` | Task/habit/reminder create+edit form |
| `components/BottomTabBar.tsx` | Mobile bottom navigation with inbox badge |
| `components/Header.tsx` | Desktop nav, mobile compact header (customMobileContent prop) |
| `app/api/inbox/route.ts` | Inbox API (GET aggregated, PATCH confirm) |
| `app/api/items/[id]/toggle/route.ts` | Toggle completion (per-date vs advancing logic) |
| `app/api/completions/route.ts` | Get all completions for a date |
| `app/api/calendar/items/route.ts` | Calendar items with categorization |

---

## Constraints / Conventions

- **Tailwind v4:** `wrap-break-word` not `break-words`, `bg-linear-to-r` not `bg-gradient-to-r`, `shrink-0` not `flex-shrink-0`
- **TypeScript strict mode** — Prisma returns `null`, TS expects `undefined`, use `field || undefined`
- **No custom CSS** — Tailwind only
- **Mobile-first** — test at 375px, BottomTabBar is 64px fixed bottom
- **Quality over speed** — do it right, add error handling when things break
- **Single user** — schema is multi-user ready (userId everywhere) but UI is single-user
