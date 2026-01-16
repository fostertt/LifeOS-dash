# LifeOS Project Facts

## Deployment Architecture
- **Production (Stable)**: Runs on **foster-core** (192.168.50.76)
  - **Path**: `~/projects/dashboard/`
  - **Status**: Live (Next.js)
  - **Database**: Local PostgreSQL (foster-core)
  
- **Development (Active)**: Runs on **foster-forge** (192.168.50.3)
  - **Path**: `~/projects/lifeos/`
  - **Status**: Active Development
  - **Database**: Local PostgreSQL (foster-forge)

## Environment Configuration
- **Production URL**: http://192.168.50.76:[PORT] (Check .env on core)
- **Development URL**: http://localhost:3000
- **Environment variables**: `.env.local` (gitignored)
- **Database URL**: `DATABASE_URL` in .env

## Key Directories
- `/app` - Next.js App Router pages
- `/components` - Reusable React components
- `/lib` - Utility functions, Prisma client
- `/prisma` - Database schema and migrations

## Database Schema
- **User** - Authentication and profile
- **Habit** - Daily habit tracking
- **Task** - Parent/child task hierarchy
- **Journal** - Daily journal entries

## Development Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npx prisma migrate dev  # Run migrations
npx prisma studio    # Database GUI