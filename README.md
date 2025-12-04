# Life OS Dashboard

A comprehensive family productivity system that unifies calendar, tasks, habits, reminders, and meal planning in one place.

**Production:** https://lifeos.foster-home.net

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL 16 (Docker)
- **ORM:** Prisma
- **Auth:** NextAuth.js (JWT sessions)
- **Styling:** Tailwind CSS
- **Deployment:** PM2 on Ubuntu Server

## Features

- ✅ Tasks with sub-tasks and hierarchical completion
- ✅ Habits with sub-habits and streaks
- ✅ Reminders and notifications
- ✅ Smart Lists with two-way sync
- ✅ Google Calendar integration (read)
- ✅ Today and Week views
- 🚧 Outlook Calendar integration (in progress)
- 🚧 Event creation with multi-calendar support
- 📋 Meal planning and recipes (planned)
- 📋 PWA support (planned)

## Quick Start

### Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Production Deployment
```bash
git pull origin master
npm run build
pm2 restart lifeos
# Live at https://lifeos.foster-home.net
```

## Common Commands

```bash
# Database
docker exec -it lifeos_postgres psql -U lifeos_admin -d lifeos_db

# Logs
pm2 logs lifeos
pm2 logs lifeos --err

# Process management
pm2 status
pm2 restart lifeos
pm2 monit
```

## Documentation

- [AI Workflow Guide](AI_NOTES.md) - How to work with AI assistants on this project
- [Current State](docs/current-state.md) - Complete system overview
- [Calendar Integration](docs/calendar-integration.md) - Multi-calendar implementation guide
- [Architecture](docs/architecture.md) - System design decisions

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://lifeos_admin:PASSWORD@localhost:5432/lifeos_db"
NEXTAUTH_URL="https://lifeos.foster-home.net"
NEXTAUTH_SECRET="generated-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## Project Structure

```
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities (auth, API clients, database)
├── prisma/           # Database schema and migrations
├── types/            # TypeScript definitions
├── public/           # Static assets
└── docs/             # Documentation
```

## License

Private project - Not open source

---

**Maintained by:** Tyrrell Foster  
**Server:** foster-server (192.168.50.75)
