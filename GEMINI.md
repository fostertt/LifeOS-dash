# GEMINI.md — Life OS Project Configuration

**Primary Context:** See AI_NOTES.md in project root for full context.

## Quick Gemini Scan Shortcuts
- Calendar logic: `lib/google-calendar.ts` + `app/api/calendar/*`
- Authentication: `lib/auth.ts`, `app/api/auth/*`
- Database schema: `prisma/schema.prisma`
- Full architecture: `@./`

## Current State (Dec 12, 2025)
- Recently recovered to working state
- JWT sessions (not database sessions)
- PostgreSQL with Prisma
- See docs/20251212_RECOVERY-SESSION-STATUS.md

## Key Constraints
- Don't suggest switching from JWT to database sessions
- Don't recommend schema rewrites without asking
- Check AI_NOTES.md for architectural decisions