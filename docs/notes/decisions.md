# LifeOS Architecture Decisions


### ADR-006: Vaultwarden Integration Strategy (Planned)
**Context:** Need to integrate password management without compromising security.
**Decision:** - LifeOS is for **Organization**; Vaultwarden is for **Encryption**.
- **Allowed:** "Send to Vaultwarden" links, pre-filled URLs, Client-side only.
- **Prohibited:** Server-to-server API calls, storing secrets in LifeOS DB, using Vaultwarden as Auth provider.
**Consequences:** Zero-knowledge architecture is preserved. LifeOS never sees raw secrets.


### ADR-001: Migrate from Flask to Next.js (2025-12-20)
**Context:** - Original implementation in Python Flask
- Needed real-time updates and better client-side state management
- Team more experienced with TypeScript than Python

**Decision:** Rewrite in Next.js 14 with TypeScript, Prisma ORM, PostgreSQL

**Alternatives:**
- Remix → Rejected: less mature ecosystem
- SvelteKit → Rejected: team unfamiliar with Svelte
- Continue with Flask → Rejected: poor real-time support

**Consequences:**
- ✅ Better developer experience with TypeScript
- ✅ Real-time updates via React state
- ⚠️  One-time migration effort (3 weeks estimated)

### ADR-002: Use Prisma ORM (2025-12-22)
**Context:** Need type-safe database access without SQL string concatenation

**Decision:** Use Prisma as ORM layer over PostgreSQL

**Alternatives:**
- Raw SQL → Rejected: no type safety, hard to maintain
- TypeORM → Rejected: less intuitive migration system
- Drizzle → Considered but Prisma more mature

**Consequences:**
- ✅ Full TypeScript type safety from DB to UI
- ✅ Automatic migrations with schema changes
- ⚠️  Slightly heavier than raw SQL

### ADR-003: JWT Sessions for Auth (2025-11-24)
**Context:** Database sessions with PrismaAdapter caused `OAuthAccountNotLinked` errors and infinite sign-in loops.
**Decision:** Use JWT strategy (encrypted cookies) instead of database sessions.
**Consequences:** - ✅ Eliminates account linking complexity and loops.
- ⚠️ Users are not auto-created in DB; requires manual SQL insert or upsert logic in callback.
- **CRITICAL:** Do not switch back to database sessions without fixing the linking logic.

### ADR-004: Unified Item Model (2025-11-01)
**Context:** Needed shared metadata (priority, effort) across Tasks, Habits, and Reminders.
**Decision:** Use a single `items` table with an `itemType` discriminator.
**Alternatives:** Separate tables (rejected: limits cross-tool workflows).
**Consequences:** Enables unified querying and easier frontend logic.

### ADR-005: PostgreSQL on Home Server (2025-11-01)
**Context:** SQLite failed with file locking issues when accessing from multiple machines.
**Decision:** Host PostgreSQL on Docker (`lifeos_postgres`).
**Consequences:** Robust multi-user support, requires Docker management.

### ADR-007: Production on foster-forge with PM2 (2026-01-25)
**Context:** Originally deployed on foster-core, but foster-forge has better compute for development and production.
**Decision:** Move production deployment to foster-forge, use PM2 for process management.
**Alternatives:**
- Keep on foster-core → Rejected: less resources, not where active development happens
- Use systemd service → Considered but PM2 provides better monitoring and auto-restart
**Consequences:**
- ✅ Single server for dev and production simplifies deployment
- ✅ PM2 provides process monitoring, logs, and auto-restart
- ✅ Development and production use same database (careful with migrations)
- ⚠️  Need to be careful not to interfere with dev work during production usage

### ADR-008: Time-Based Duration Options (2026-01-25)
**Context:** Original duration options (Quick/Medium/Long) were too vague and didn't help with time-boxing tasks.
**Decision:** Replace with specific time-based options: 15min, 30min, 1hr, 1-2hrs, 2-4hrs, 4-8hrs, 1-3days, 4-7days, 1-2weeks, 2+weeks.
**Alternatives:**
- Keep vague options → Rejected: users couldn't accurately estimate or filter
- Free-text duration → Rejected: hard to filter and inconsistent
**Consequences:**
- ✅ Better time-boxing and planning
- ✅ Smart list filtering more useful
- ✅ Can filter tasks by available time window
- ⚠️  Existing tasks with old values (quick/medium/long) still display but won't match new filters
