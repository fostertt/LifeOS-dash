# LifeOS - Project-Specific Gemini Instructions

## Role
Operational support for Next.js/Postgres environment.

## Key Responsibilities
- **Database Management**: Checking DB state, running Prisma Studio
- **Environment**: Managing .env files and port conflicts
- **Logs**: Monitoring standard output for dev server errors

## Common Commands
### Development (foster-forge)
- `npm run dev`: Start server (Port 3000)
- `npx prisma studio`: GUI for database (Port 5555)
- `npx prisma migrate dev`: Apply schema changes

### Production (foster-core)
- **Location**: `~/projects/dashboard/`
- **Check Status**: `ps aux | grep next`
- **Restart**: `npm run start` (or process manager)

## Memory Access
- Check `./docs/notes/key_facts.md` for ports/paths.
- Log operational issues in `./docs/notes/bugs.md`.