cat > ~/projects/lifeos/docs/notes/key_facts.md << 'EOF'
# LifeOS Project Facts

## Deployment Architecture
- **Production (Stable)**: Runs on **foster-core** (192.168.50.76)
  - **Path**: `~/projects/dashboard/`
  - **Status**: Live (Next.js 16)
  - **Database**: Local PostgreSQL (foster-core)
  
- **Development (Active)**: Runs on **foster-forge** (192.168.50.3)
  - **Path**: `~/projects/lifeos/`
  - **Status**: Active Development
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
EOF