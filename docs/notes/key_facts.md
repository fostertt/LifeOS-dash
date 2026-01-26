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
  - Used for Tasks and To-Dos.
  - **Key Fields**: `priority`, `effort`, `dueDate`, `isCompleted`.
  - **Recursive**: Can have sub-items via `parentItemId`.
- **Habit**: 
  - Tracks recurring habits.
  - **Key Fields**: `scheduleType`, `scheduleDays`.
  - **Tracking**: Logs history in `HabitCompletion` model.
- **List / ListItem**: 
  - Generic checklist functionality separate from robust "Items".

### Auth & Multi-Tenancy
- **User**: Standard NextAuth user extended with `firstName`, `lastName`.
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
- **2026-01-26**: Phase 2 mobile redesign - hamburger menu, compact UI, priority-colored checkboxes
- **2026-01-25**: Duration options updated to time-based values (15min, 30min, 1hr, etc.)
- **2026-01-25**: Production deployment moved to foster-forge with PM2 process manager

## Mobile-Specific Behavior
- **Navigation**: Hamburger sidebar on mobile (<768px), full nav on desktop
- **Today View**: Compact header, hidden metadata badges (Task, duration, sub-task count)
- **Priority Display**: Checkbox border colors (red=high, green=medium, gray=low) on mobile
- **Spacing**: Tighter padding on mobile (p-3 vs p-8 on desktop)
- **PWA**: Installable as standalone app on mobile devices