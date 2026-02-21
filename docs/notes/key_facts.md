# LifeOS Project Facts

## Deployment Architecture
- **Production (Active)**: Runs on **foster-forge** (192.168.50.3, Tailscale: 100.71.138.51)
  - **Path**: `~/projects/lifeos/`
  - **URL**: lifeos.foster-home.net
  - **Process Manager**: PM2
  - **Build**: `npm run build` (Next.js production build)
  - **Status**: Live (Next.js 16)
  - **Database**: Local PostgreSQL (foster-forge)

## Tech Stack (Versions Critical)
- **Framework**: Next.js 16.0.1 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4 (PostCSS)
- **ORM**: Prisma 6.18.0
- **Auth**: NextAuth.js v4.24.13 (w/ Prisma Adapter)
- **Integrations**: Google APIs (Calendar)

## Environment Configuration
- **Production URL**: http://192.168.50.76:[PORT]
- **Development URL**: http://localhost:3000
- **Env File**: `.env` (Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, Google Client IDs)

## Database Schema (Key Models)
*See `prisma/schema.prisma` for full definition.*

### Core Domain
- **Item** (The "Task" model):
  - Used for Tasks, Habits, and Reminders (unified via `itemType` discriminator).
  - **States**: `backlog` | `active` | `completed` (ADR-019, 3-state model)
  - **Key Fields**: `priority`, `complexity`, `energy`, `dueDate`, `isCompleted`, `source`, `reviewedAt`.
  - **Recursive**: Can have sub-items via `parentItemId`.
- **Note**:
  - Freeform text notes with color and tags.
  - **Inbox fields**: `source`, `reviewedAt`, `projectId` (ADR-020)
- **List / ListItem**:
  - Checklist functionality with inline editing.
  - **Inbox fields**: `source`, `reviewedAt`, `projectId` (ADR-020)
- **Inbox System** (ADR-020):
  - Items with `source IS NOT NULL AND reviewedAt IS NULL` appear in inbox
  - Sources: `voice` | `quick_capture` | `system` | null (manual/legacy)
  - API: `GET /api/inbox` (aggregated view), `PATCH /api/inbox` (confirm/review)
  - Bottom tab bar: Inbox replaces Home, badge shows unreviewed count

### Auth & Multi-Tenancy
- **User**: Standard NextAuth user extended with `firstName`, `lastName`.
  - **Tyrrell's User ID**: `110753093651931352478` (Google OAuth ID)
  - **Recovery Script**: `scripts/add-user.mjs` (run after DB resets)
- **Family**: Groups users together.
- **FamilyUser**: Join table for User-Family membership with roles (`owner`, `admin`, `member`).

### Integrations
- **CalendarSync**: Stores Google Calendar sync tokens and config.
- **CalendarEvent**: Local cache of Google Calendar events.
- **flask_dance_oauth**: Legacy/migration artifact? (Contains `browser_session_key`).

## Key Directories
- `/app` - Next.js App Router pages
- `/components` - React components
- `/lib` - Utility functions, Prisma client instance
- `/prisma` - Schema and migrations

## Recent Updates
- **2026-02-21**: ADR-019 — State collapse: 3 states (backlog/active/completed), removed in_progress
- **2026-02-21**: ADR-020 — Inbox system: `source`/`reviewedAt`/`projectId` fields on Item/Note/List. Inbox page replaces Home tab. Inline TaskForm editing from inbox. Badge count on tab bar.
- **2026-02-21**: Today view: Scheduled (No Time) section moved above time grid
- **2026-02-21**: Architecture session: ADRs 016-020 decided (inbox, states, drag-drop, today layout, rollups)
- **2026-01-28**: Phase 1 visual cleanup - unified priority indicators, gray checkboxes, removed clutter
- **2026-01-28**: Filter button added to desktop nav bar and mobile header
- **2026-01-28**: Completed task reordering (moves to bottom automatically)
- **2026-01-28**: Week view improvements - clickable day headers, inline navigation
- **2026-01-26**: Phase 2 mobile redesign - hamburger menu, compact UI
- **2026-01-25**: Duration options updated to time-based values (15min, 30min, 1hr, etc.)
- **2026-01-25**: Production deployment moved to foster-forge with PM2 process manager

## Visual Design (Phase 1 Cleanup - Jan 28, 2026)
- **Priority Indicators**: Red ! (high), gray - (low), nothing (medium)
- **Checkboxes**: Always gray (completed = gray filled with white checkmark)
- **Removed Clutter**: No category icons, no type badges, no Edit buttons
- **Recurring Icon**: Inline to the right of item name
- **Item Interaction**: Click entire item card to edit (not separate button)
- **Completed Tasks**: Automatically move to bottom of list

## Mobile-Specific Behavior
- **Navigation**: Hamburger sidebar on mobile (<768px), full nav on desktop
- **Filter Button**: In header next to profile icon on mobile, in nav bar on desktop
- **Today/Week Views**: Compact header, hidden metadata badges (Task, duration, sub-task count)
- **Spacing**: Tighter padding on mobile (p-3 vs p-8 on desktop)
- **PWA**: Installable as standalone app on mobile devices

## Desktop Navigation
- **Exposed Tabs**: Today, Week, Lists, Calendars visible in top nav bar
- **Filter Button**: Positioned right of Calendars tab
- **Consistent Layout**: Same navigation structure across all main pages