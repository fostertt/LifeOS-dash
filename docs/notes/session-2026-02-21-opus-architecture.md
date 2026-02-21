# Session Summary: Opus Architecture Session — 2026-02-21

## What Was Done

### 1. Architecture Decisions (ADRs 016-020)
Discussed and decided 5 architecture questions from `docs/plans/opus-architecture-session.md`. All ADRs written to `docs/notes/decisions.md`.

### 2. ADR-019: State Collapse (IMPLEMENTED)
- Collapsed 4 states → 3: `backlog` | `active` | `completed`
- Removed `in_progress` from all UI (TaskForm dropdown, FilterPanel pills, All page groups, Calendar page sections)
- Removed `inProgress` bucket from calendar items API
- Migrated 2 existing `in_progress` items to `active`
- **Files changed**: `prisma/schema.prisma`, `components/TaskForm.tsx`, `components/FilterPanel.tsx`, `app/all/page.tsx`, `app/calendar/page.tsx`, `app/api/calendar/items/route.ts`, `app/api/items/[id]/route.ts`

### 3. ADR-020: Inbox System (IMPLEMENTED)
- **Schema**: Added `source String?`, `reviewedAt DateTime?` to Item, Note, List models. Added `projectId Int?` to Note and List (Item already had it).
- **Migration**: `prisma/migrations/20260221232457_adr020_inbox_source_reviewed_at/`. Backfilled `reviewedAt = createdAt` for all existing records.
- **API**: Created `app/api/inbox/route.ts` — GET (aggregated unreviewed items) + PATCH (confirm/review)
- **Items POST**: Updated to accept `source` field. Manual creates auto-reviewed; items with source start unreviewed.
- **Inbox page**: Replaced Home page (`app/page.tsx`) with inbox view showing unreviewed items. Items (tasks) open TaskForm inline. Notes/Lists navigate to Vault editors.
- **Bottom tab bar**: Home → Inbox with inbox icon. Badge count fetched from `/api/inbox`, polls every 30s, re-fetches on navigation.
- **Test data**: Created 3 test inbox items (2 tasks, 1 note) — can be deleted after testing.

### 4. Today View: Scheduled No Time Moved Up
- "Scheduled (No Time)" section moved from below time grid to above it in Today view
- Order is now: Reminders → Overdue → Habits → Scheduled (No Time) → Today (time grid)

## What's Left (Next Session)

### Still TODO from ADR-017 (Today View Reorder)
- Full reorder not done yet: want Overdue → Unscheduled (active, no date) → Time grid
- Currently: Reminders → Overdue → Habits → Scheduled No Time → Time grid
- Need to add "Unscheduled" section for active items with no date
- Remove state section labels from Today context
- Make Overdue and Unscheduled sections collapsible

### ADR-018: Drag and Drop (Not Started)
- Library: `@dnd-kit/core`
- Today view: vertical drag, 15-min snap
- Week view: 2D drag (time + day)
- GCal events: read-only with lock icon
- Resize handles: deferred

### ADR-016: Daily Briefing + Voice Rollup (Not Started)
- Voice capture rollup: query `source='voice'`, create summary Note
- Daily briefing: cron at 2 AM, scheduled + overdue + completions + voice captures
- Both create Notes with `source: "system"`
- Lower priority — after inbox is battle-tested

### Phase 4 Remaining Items
- UX-008: Pin to Today mobile overflow fix
- UX-009: Complete button in task edit modal
- UX-010: Pin bottom panel to viewport in note/list editors (HIGH)
- Auto-refresh on Android (1.1) — still unreliable

### Voice Pipeline Integration
- Pipeline needs to send `source: "voice"` in POST body to LifeOS API
- No other pipeline changes needed for inbox to work
- Calendar auto-create and pattern detection deferred

## Key Files for Next Session
- `prisma/schema.prisma` — current schema with inbox fields
- `app/page.tsx` — Inbox page
- `app/api/inbox/route.ts` — Inbox API
- `components/BottomTabBar.tsx` — Updated with inbox tab + badge
- `docs/notes/decisions.md` — All ADRs (016-020)
- `docs/plans/opus-architecture-session.md` — Original architecture questions
