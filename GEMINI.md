# GEMINI.md — Life OS Project Configuration

## Project Context
This is the Life OS family productivity app.
Tech stack:
- Next.js 16 (App Router)
- TypeScript
- Prisma & PostgreSQL
- Tailwind CSS
- NextAuth (Google OAuth)
- PM2 deployment on Ubuntu server

## Gemini Behavior Preferences
- Keep responses structured with headings and bullet points.
- If asked to analyze architecture, scan: app/, lib/, prisma/.
- When discussing calendars, prioritize: app/api/calendar/, lib/google-calendar.ts.
- Assume JWT sessions, not database sessions.
- Do NOT recommend rewriting the schema unless specifically requested.
- When uncertain, propose multiple solution paths.
- Keep explanations concise unless requested otherwise.

## Large Codebase Guidance
If asked to:
- "Find all calendar logic" → scan `lib/google-calendar.ts` + `app/api/calendar/*`
- "Explain event creation flow" → scan calendar routes + prisma models
- "Audit authentication" → scan `lib/auth.ts`, `app/api/auth/*`
- "Map project architecture" → scan entire project with `@./`

## Output Style
- Prefer short summaries first, detailed analysis second.
- Provide code examples in TypeScript by default.
- Avoid unnecessary changes or over-engineering.
- Refer to actual file paths in your explanations.

