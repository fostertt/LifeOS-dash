# LifeOS Architecture Decisions

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