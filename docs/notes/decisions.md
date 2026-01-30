# LifeOS Architecture Decisions

### ADR-007: Mobile-First Visual Simplification (2026-01-28)

**Context:**
- Mobile views were cluttered with icons, badges, and buttons
- Priority indicators used colored checkboxes which conflicted with completion state
- Multiple redundant ways to indicate task type (icon + badge + color)
- Edit buttons took up space and weren't necessary on clickable cards

**Decision:**
Simplify visual language to reduce cognitive load on mobile:
- **Priority:** Text indicators only (! for high, - for low, nothing for medium)
- **Checkboxes:** Always gray, completion shows via filled state (not color)
- **Task type:** No icons or badges - context makes it clear
- **Interaction:** Entire card clickable (no separate Edit button)
- **Recurring:** Small inline icon instead of separate row
- **Completed items:** Auto-sort to bottom to reduce visual noise

**Alternatives Considered:**
- Keep priority colors → Rejected: conflicts with completion state
- Keep type icons → Rejected: redundant with context
- Keep Edit buttons → Rejected: unnecessary click target

**Consequences:**
- ✅ Cleaner, more scannable mobile interface
- ✅ Reduced visual clutter on small screens
- ✅ Consistent interaction pattern (click anywhere on card)
- ✅ Priority still visible but less dominant
- ⚠️ Type information less immediately obvious (relies on context)

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

### ADR-009: Smart Lists Architecture Rethink (PENDING)

**Context:**
- Current implementation: Smart lists are separate filtered views in Lists section
- Real-world usage observation: "Smart lists are basically just a filter of my other tasks"
- User wants to see everything in one place, then apply filters
- Current filter UI only shows item types, not metadata (priority, effort, focus, duration)

**Question:**
Should we replace "smart lists" concept with:
- Single "All" view showing all items
- Comprehensive filter panel (all metadata fields)
- Premade filter presets (e.g., "Quick Wins" = low effort + short duration)
- Remove separate smart list navigation?

**Options Under Consideration:**

**Option A: Keep Smart Lists, Enhance Filters**
- Maintain current smart list navigation
- Add comprehensive filter panel to each view
- Smart lists remain separate sections
- Pros: No breaking changes, familiar structure
- Cons: Redundancy between smart lists and filters

**Option B: Replace with "All" + Filters + Presets**
- Remove smart list concept
- Add "All" view (everything in one list)
- Comprehensive filter panel (all metadata)
- Premade filter presets user can click
- Pros: Single source of truth, more flexible
- Cons: Need to migrate existing smart list logic

**Option C: Hybrid Approach**
- Keep smart lists as "preset filters"
- Add "All" view as first option
- Clicking smart list = applying that preset filter to All view
- Pros: Preserves smart list concept, adds flexibility
- Cons: May be confusing if not designed well

**Impact:**
- Affects Lists view architecture
- Changes how users think about task organization
- May require UI redesign
- Filter component needs major expansion

**Status:** PENDING - Need to prototype and test with real usage

**Next Steps:**
1. Review current smart list usage patterns
2. Design comprehensive filter UI mockup
3. Test with real tasks to validate approach
4. Choose option and implement in Phase 2.6

### ADR-010: Quick Add UI Simplification (PENDING)

**Context:**
- Current + button shows all fields: title, date, time, priority, effort, focus, duration, recurrence
- Real-world usage: Most quick captures only need title + maybe date
- 8 fields is overwhelming for "I just want to jot this down"
- Mobile screen space is precious

**Proposal:**
- Default quick add: Title + Date only (minimal)
- "Advanced" button/toggle reveals: Time, Priority, Effort, Focus, Duration, Recurrence
- Save space, reduce cognitive load
- Power users can still access all fields

**Alternatives:**

**Option A: Two-Step Quick Add**
- Step 1: Title only (inline input, like Google Keep)
- Step 2: Click created item to add metadata
- Pros: Fastest capture possible
- Cons: Extra step for users who want to add priority immediately

**Option B: Smart Defaults with Progressive Disclosure**
- Show: Title, Date (with calendar icon)
- Hide by default: Time, Priority, Effort, Focus, Duration, Recurrence
- "Show more" link reveals additional fields
- Pros: Balance of speed and power
- Cons: Need to design good progressive disclosure UI

**Option C: Context-Aware Quick Add**
- Today view: Show date, hide others
- Week view: Show date + time, hide others
- Lists view: Show title only, hide others
- Pros: Adapts to context
- Cons: Inconsistent across views

**Impact:**
- Affects + button modal design
- Changes quick capture workflow
- Mobile UX significantly improved
- Desktop users may prefer full form

**Status:** PENDING - Need to design and test approach

**Next Steps:**
1. Design mockup of simplified quick add
2. Test with real usage patterns
3. Consider context-aware vs. universal approach
4. Implement in Phase 2.6 or 2.7

### ADR-011: Effort vs Focus Field Consolidation (PENDING)

**Context:**
- Current fields:
  - **Effort**: How hard the task is (easy/medium/hard)
  - **Focus**: How much concentration required (deep/light/background)
- User observation: "I think effort and focus might be the same thing"
- Both relate to mental/physical energy required
- May be redundant in practice

**Question:**
Should we consolidate Effort and Focus into a single field?

**Analysis Needed:**
1. Review real usage: Are users setting both? Do they correlate?
2. Check filter patterns: Do users filter by both independently?
3. Consider use cases:
   - Easy task but deep focus (reading documentation?)
   - Hard task but light focus (manual data entry?)
   - Are these common scenarios?

**Options:**

**Option A: Keep Both Fields**
- Maintain distinction between difficulty and concentration
- Some tasks may genuinely differ (easy but focused)
- Pros: More granular filtering
- Cons: Redundancy, user confusion, extra form field

**Option B: Consolidate to Single "Effort" Field**
- Remove Focus, expand Effort options if needed
- Example: Trivial, Light, Moderate, Intense, Demanding
- Pros: Simpler UI, less user decision fatigue
- Cons: Lose ability to distinguish effort from concentration

**Option C: Consolidate to Single "Energy" Field**
- Rename to "Energy Required"
- Options: Low, Medium, High
- Covers both effort and focus conceptually
- Pros: Clear, simple, covers both concepts
- Cons: Less precise than two separate fields

**Impact:**
- Data model migration (existing tasks have both fields)
- Filter UI simplification
- Quick add form has one less field
- May affect smart list/filter presets

**Status:** PENDING - Need usage analysis before deciding

**Next Steps:**
1. Query database: How often are effort and focus set to different values?
2. User testing: Can we distinguish "easy but focused" tasks in real usage?
3. If consolidating, choose new field name and options
4. Plan migration strategy for existing data
5. Implement in Phase 2.6 if consolidating
