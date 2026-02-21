# LifeOS Architecture Decisions

### ADR-020: Voice Capture Inbox & Triage (2026-02-21)

**Context:**
- Voice pipeline creates items directly in their classified location (task → Items, note → Vault)
- No review step — misclassified items get lost
- No single view of "what did I capture today via voice"
- Quick Add (UX-004/ADR-010) is too complex — 8 fields for a simple capture
- These two problems have a shared solution

**Decision:**
Add `source String?` and `reviewedAt DateTime?` fields to Item, Note, and List models. Build an Inbox view that shows all unreviewed items (`WHERE source IS NOT NULL AND reviewedAt IS NULL`).

**Schema changes:**
```
// Added to Item, Note, and List models:
source        String?    // "voice" | "quick_capture" | "system" | null (legacy)
reviewedAt    DateTime?  // null = unreviewed, timestamp = when confirmed
projectId     Int?       // Pre-work for future Projects feature (no FK yet)
```

**Key design decisions:**
- Items land in their classified location AND the inbox simultaneously. Inbox is a filtered overlay, not a holding pen.
- "Confirm" sets `reviewedAt = now()` — item stays where it is, just leaves the inbox.
- Tapping an inbox item opens the full editor for that type. User can change type, add metadata, then confirm.
- Quick Add (ADR-010) becomes title-only. Creates `type: "task"`, `state: "active"`, `source: "quick_capture"`. Triaged later in inbox.
- Voice captures also land as `state: "active"` — capture implies intent.
- `source` is a string (not enum) for extensibility without migrations.
- `reviewedAt` as DateTime (not boolean) gives timestamp for rollup features.

**Migration note:** Existing records get `reviewedAt = createdAt` so they don't flood the inbox.

**UI:** Inbox replaces Home tab in bottom nav bar. Badge count shows unreviewed items.

**Resolves:** FEAT-004, ADR-010 (Quick Add), UX-004

**Consequences:**
- Inbox is additive — if you never open it, items still work normally
- Voice pipeline only needs to send one extra field (`source: "voice"`)
- Quick capture workflow is fast (title only) without losing metadata (add during triage)
- Three-table query for inbox is fine at single-user scale; add composite index on `(source, reviewedAt, createdAt)` if needed

### ADR-019: Collapse Item States to Three (2026-02-21)

**Context:**
- Current states: `backlog` | `active` | `in_progress` | `completed`
- `active` vs `in_progress` distinction is meaningful on team kanban boards but redundant for single-user productivity
- Users don't need the system to track "I've started this" — if you're working on it, you know
- Extra state adds cognitive load to the UI (state labels, filter options, section headers)

**Decision:**
Collapse to three states: `backlog` | `active` | `completed`. Migrate all `in_progress` records to `active`.

**State semantics:**
- `backlog` — Someday/maybe. Not on my radar right now. Hidden from Today view.
- `active` — I intend to do this. Shows in Today view (if dated today or undated).
- `completed` — Done. Sorted to bottom in lists.

**Migration:** `UPDATE items SET state = 'active' WHERE state = 'in_progress';`

**Impact on Today view:** Active items with today's date (timed or untimed) + active items with no date = shown. Backlog items never shown. No state section labels in Today context.

**Consequences:**
- Simpler mental model — two real choices: "do I want to do this?" (active) or "not yet" (backlog)
- Cleaner Today view without In Progress / Active section headers
- One fewer filter option, one fewer form field value
- If "started" tracking is ever needed, add `startedAt DateTime?` instead of a state

### ADR-018: Drag and Drop Rescheduling (2026-02-21)

**Context:**
- Today and Week views show items on a time grid but rescheduling requires opening the edit form
- Want drag-to-reschedule for time changes and cross-day moves

**Decision:**
Use `@dnd-kit/core` for drag-and-drop on time grid views.

**Library choice reasoning:**
- `react-beautiful-dnd` — deprecated, no React 19 support. Rejected.
- Native HTML5 drag — no mobile touch support without polyfills. Rejected.
- `@dnd-kit/core` — actively maintained, React 19 compatible, first-class touch/pointer support, built-in snap grid modifiers. Chosen.

**Behavior:**
- **Today view:** Vertical drag only (change time, same day). 15-minute snap grid via `createSnapModifier`.
- **Week view:** 2D drag — vertical = time, horizontal across day columns = date change. Standard calendar behavior.
- **Google Calendar events:** Read-only, not draggable. Visual distinction: lock icon or different border style.
- **Resize handles:** Deferred until drag is solid and tested.

**GCal write-back:** OAuth scope already includes `calendar.events` write access. Implement as a follow-up phase — not in initial drag release. No silent local-only divergence allowed (ADR principle).

**Consequences:**
- Single library handles both touch (mobile) and pointer (desktop)
- Snap grid keeps times clean (no 10:07 AM scheduling)
- GCal events are clearly non-interactive, avoiding user confusion

### ADR-017: Today View Layout Reorder (2026-02-21)

**Context:**
- Today view layout: Overdue → Time grid → "Scheduled No Time" at bottom
- Unscheduled items buried at bottom are easy to miss
- State section labels (In Progress, Active) add noise in a single-day context

**Decision:**
Reorder Today view: **Overdue → Unscheduled → Time grid**. Remove state section labels from Today context.

**What counts as "unscheduled" in Today:**
- Active items with today's date but no time
- Active items with no date at all (undated = available today)
- Backlog items are excluded (not relevant to "today")

**Sections are collapsible** — tap header to toggle. Once reviewed, compress and get straight to the time grid.

**Consequences:**
- Most actionable items (overdue + unscheduled) are immediately visible
- Time grid starts lower but that's correct — timed items have their time slot, they don't need to be "above the fold"
- Collapsible sections prevent clutter when sections are large

### ADR-016: Daily Briefing & Voice Rollup (2026-02-21)

**Context:**
- Tyrrell asks Claude to summarize voice captures manually — wants it automated
- Voice captures are contextually different from manually created items and deserve their own summary
- A broader daily briefing (all scheduled + overdue + completed) is also valuable
- These are two related but distinct features

**Decision:**
Two rollup features, both LifeOS-native (no external API calls):

**1. Voice capture rollup:**
- Query: `WHERE source = 'voice' AND createdAt` within period
- Creates a Note with `source: "system"` summarizing voice captures
- Priority: after Inbox is built (depends on `source` field)

**2. Daily briefing:**
- Cron job at 2:00 AM, creates a Note with `source: "system"`
- Sections: today's scheduled items, overdue items, yesterday's completions, voice captures
- Pure database query — no Gemini, no external API calls
- Priority: lower, nice-to-have after inbox and voice rollup

**Consequences:**
- Zero API cost — both features are DB queries formatted as markdown notes
- Voice rollup preserves the "what did I say today" context that feels different from typed tasks
- Daily briefing replaces the manual "ask Claude to summarize" workflow
- Both create Notes, so they're browsable in Vault with `source: "system"` filter

### ADR-015: Keep-Style Note & List Editors (2026-02-21)

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

### ADR-010: Quick Add UI Simplification — RESOLVED by ADR-020

**Status:** RESOLVED — Superseded by Inbox/Triage design (ADR-020, 2026-02-21)

**Resolution:** Quick Add becomes title-only capture. Creates `type: "task"`, `state: "active"`, `source: "quick_capture"`. Item goes to Inbox for triage where metadata is added. No progressive disclosure needed — the Inbox IS the second step.

### ADR-015: Keep-Style Note & List Editors (2026-02-21)

**Context:**
- Notes used modal-based editing which felt clunky on mobile
- Lists required a two-step create-then-add-items flow
- No color or tag support exposed in the UI for lists (schema had tags field but unused)
- Notes had no color field at all

**Decision:**
Replace modals with full-page inline editors for both notes and lists:
- **Layout:** Back arrow at top (cancel/no save), title input, content/items area, then color/tags/pin/buttons pinned at bottom
- **Save model:** Explicit Save/Update button (not auto-save on back). Back = cancel.
- **New lists:** "Add item" input always visible; eagerly creates list on server when first item is added (no two-step flow)
- **Colors:** Added `color` field to Note model. Shared `VAULT_COLORS` constant. Color swatches inline in editor.
- **Tags on lists:** Wired existing `tags` JSON field to UI via inline TagInput. Tags show as chips on ListCard.
- **Navigation:** Vault page cards navigate to `/vault/notes/[id]` and `/vault/lists/[id]`. FAB removed from vault page (BottomTabBar already has Note/List in create menu).
- **Old modals deleted:** NoteForm.tsx, ListForm.tsx removed. GlobalCreateManager updated to navigate instead of opening modals.
- **Legacy redirect:** `/vault/[id]` redirects to `/vault/lists/[id]`

**TODO:** Pin color/tags/buttons section to bottom of viewport so content scrolls independently (currently inline, scrolls with content).

**Key Files:**
- `app/vault/notes/[id]/page.tsx` — Note editor
- `app/vault/lists/[id]/page.tsx` — List editor
- `lib/constants.ts` — VAULT_COLORS shared constant
- `prisma/schema.prisma` — color field on Note model

**Consequences:**
- Mobile UX significantly improved — full-page editors feel native
- Consistent experience between notes and lists
- Tags now usable on lists (were schema-only before)

### ADR-014: Recurring Task Completion Models (2026-02-21)

**Context:**
- Tasks/reminders only supported a simple "Recurring (daily)" checkbox
- Schema already had `recurrenceType`, `recurrenceInterval`, `recurrenceAnchor` fields unused
- Need richer recurrence: every N days, weekly on specific days, monthly, days after completion

**Decision:**
Two completion models based on recurrence type:

- **Per-date completion** (daily, weekly, monthly): Uses `ItemCompletion` table, same as habits. Task reappears each scheduled day. `scheduleType` is set so existing toggle logic works.
- **Advancing completion** (every_n_days, every_n_weeks, days_after_completion): On completion, records history in `ItemCompletion`, advances `dueDate` to next occurrence, keeps task uncompleted. Task "completes and reappears" on next due date.

**Field mapping:**
- `recurrenceType`: daily, every_n_days, weekly, every_n_weeks, monthly, days_after_completion
- `recurrenceInterval`: frequency (e.g., every 3 days)
- `recurrenceAnchor`: context-dependent (day names for weekly, day number for monthly, start date for every_n)
- `recurrenceUnit`: not used — type encodes unit

**Consequences:**
- Per-date types integrate with existing habit completion infrastructure
- Advancing types use a complete→advance→uncomplete pattern in a single toggle call
- Calendar week view shows no-time items in per-day row (not bottom flat list)

### ADR-013: Persistent Overdue Flag (2026-02-03)

**Context:**
- Users reported that overdue items automatically leave the "Overdue" section when rescheduled
- This made it easy to lose track of tasks that had fallen behind
- Current behavior: overdue calculated as `state='active' AND dueDate < today`
- Desired: items stay marked as overdue until explicitly cleared or completed

**Decision:**
Add persistent `isOverdue` boolean field to track overdue status independently of the due date.

**Implementation:**
- Database: Added `isOverdue` field (default false) to `items` table
- Auto-set: Tasks automatically marked `isOverdue=true` when date passes and task is active + not completed
- Persistence: Flag remains true even after rescheduling
- Auto-clear: Flag cleared when:
  - Task is completed
  - Task is moved to backlog
  - User explicitly clicks "Clear" button
- UI: TaskForm shows red warning banner with "Clear" button for overdue tasks

**Alternatives Considered:**
- **Option A: Keep dynamic calculation** → Rejected: loses track of overdue tasks when rescheduled
- **Option B: Separate "Overdue History" log** → Rejected: too complex, doesn't solve the UI issue
- **Option C: Persistent flag (chosen)** → Simple, preserves intent, gives user control

**Consequences:**
- ✅ Users can see which tasks fell behind, even after rescheduling
- ✅ Explicit clear action prevents accidental dismissal
- ✅ Auto-clear on completion keeps system clean
- ⚠️ Requires user action to clear flag (by design)
- ⚠️ Tasks marked overdue before this change need manual update (migration handles new items only)

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
