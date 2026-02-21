# LifeOS Architecture Session — Opus Context

**Created:** 2026-02-21
**Purpose:** Feed this to Claude Opus to discuss architectural decisions before implementation.

---

## What is LifeOS

Personal productivity dashboard — Tyrrell's single place for tasks, notes, lists, habits, reminders, and calendar. Built and used solo, single-user (family multi-tenancy in schema but not active). Mobile-first PWA running as a web app on his phone.

**Production URL:** lifeos.foster-home.net (runs on foster-forge, 192.168.50.3)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, server components + API routes)
- **UI:** React 19, Tailwind CSS v4
- **ORM:** Prisma 6 with PostgreSQL (on foster-forge)
- **Auth:** NextAuth v4 with Google OAuth
- **Integrations:** Google Calendar API (read + write OAuth), Voice Pipeline (separate Python project on same server)

---

## Current Database Schema (Key Models)

```prisma
model Item {
  id              Int       @id @default(autoincrement())
  userId          String
  title           String
  description     String?
  type            String    // "task" | "habit" | "reminder"
  state           String    // "backlog" | "active" | "in_progress" | "completed"
  priority        String?   // "low" | "medium" | "high"
  effort          String?
  focus           String?
  duration        String?
  dueDate         DateTime?
  scheduledFor    DateTime?
  isCompleted     Boolean   @default(false)
  isPinned        Boolean   @default(false)
  isOverdue       Boolean   @default(false)
  tags            Json?     // string[]
  parentItemId    Int?
  subItems        Item[]    @relation("SubItems")
  parent          Item?     @relation("SubItems", fields: [parentItemId], references: [id])
  completions     ItemCompletion[]
  // Recurrence fields (added Phase 4 Group 7):
  recurrenceType  String?   // "daily"|"weekly"|"monthly_day"|"every_n_days"|"every_n_weeks"|"days_after_completion"
  recurrenceInterval Int?
  recurrenceUnit  String?
  recurrenceAnchor String?  // JSON: {days: string[]} for weekly
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Note {
  id        Int      @id @default(autoincrement())
  userId    String
  title     String
  content   String?
  color     String?  // hex color for Keep-style cards
  isPinned  Boolean  @default(false)
  tags      Json?    // string[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model List {
  id        Int        @id @default(autoincrement())
  userId    String
  title     String
  color     String?
  isPinned  Boolean    @default(false)
  tags      Json?      // string[]
  items     ListItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model ListItem {
  id          Int      @id @default(autoincrement())
  listId      Int
  content     String
  isCompleted Boolean  @default(false)
  position    Int      @default(0)
  list        List     @relation(fields: [listId], references: [id], onDelete: Cascade)
}

model CalendarEvent {
  // Local cache of Google Calendar events
  id          Int      @id @default(autoincrement())
  userId      String
  googleId    String   @unique
  title       String
  start       DateTime
  end         DateTime
  isAllDay    Boolean  @default(false)
  calendarId  String?
  color       String?
}
```

---

## Voice Pipeline (Separate Project)

A Python FastAPI service on foster-forge. Flow:
1. Tyrrell records a voice memo (phone app)
2. File uploaded to a watched directory on forge
3. Pipeline transcribes → sends to Gemini for classification + extraction
4. Gemini returns structured JSON: `{ type: "task"|"note"|"reminder", title, content, due_date, tags, ... }`
5. Pipeline POSTs to LifeOS API to create the item

**Current behavior:** Pipeline creates the item directly in the right place. No "pending review" concept exists — items land immediately as tasks/notes/lists.

**Known gap:** If Gemini misclassifies or the capture is ambiguous, the item lands in the wrong place and can be hard to find. There's also no consolidated view of "what did I capture today via voice."

---

## Current App Structure (Pages)

- `/` — Home (card links to each section)
- `/all` — All items (tasks/habits/reminders), grouped + filtered, collapsible sections
- `/calendar` — Calendar views: Today (time grid), Schedule (list), Week, Month
- `/week` — Week view (separate route, time grid by day)
- `/vault` — Notes + Lists (Keep-style cards, full-page editors at `/vault/notes/[id]` and `/vault/lists/[id]`)
- `/projects` — Placeholder (not implemented)

**Bottom tab bar (mobile):** Home | All | [+] | Calendar | Vault

---

## What's Already Built / Working Well

- Phase 4 UX work is largely complete: compact TaskForm with Advanced toggle, Bottom Tab Bar, filter panels, swipe navigation on calendar, Keep-style note/list editors, recurring task options (6 recurrence types, two completion models), click-to-add on timeline
- Google Calendar integration: read events, display in all views, correct timezone handling
- Voice pipeline: operational, classifies and creates items in LifeOS

---

## Phase 4 Remaining Items (Not Architecture — Just Implementation)

These are already decided, just need coding. Listed here for completeness:

1. **UX-010 (HIGH):** Pin bottom panel (color/tags/Save/Delete) to viewport bottom in note/list editors — content scrolls above, panel stays fixed. Must clear BottomTabBar height.
2. **UX-008:** "Pin to Today" checkbox is off-screen right on mobile in TaskForm — replace with icon button.
3. **UX-009:** No "Complete" button in task edit modal — add checkbox to modal header.
4. **6.3:** Click-to-add on week view — implemented but unverified, needs testing.
5. **1.1:** Auto-refresh unreliable on Android — `visibilitychange`/`focus` approach doesn't fire reliably.
6. **UX-004:** Quick Add simplification — pending ADR-010 (simple form by default, Advanced toggle).

---

## Architecture Questions to Discuss

### 1. Voice Capture Inbox / Triage (FEAT-004) — Biggest Decision

**The problem:** Voice items land in their place immediately. No review step. Misclassified items get lost. No single view of "what did I capture today."

**Tyrrell's idea:** An "Inbox" that shows all unreviewed voice captures regardless of type. You can confirm it's right (removes from inbox, item stays in place) or adjust via + button first. The inbox view gives you a running list of recent captures to process — like a capture buffer.

**Questions for Opus:**
- How should `source` and `reviewed` be modeled? Separate fields on each model (Item, Note, List)? Or a separate `Capture` table that references any of them?
- Where does the Inbox live in the UI? New bottom tab? Section on All page? Separate route?
- Should items land in their classified location AND the inbox simultaneously? Or only in the inbox until confirmed?
- What happens to items that aren't voice-captured — should the inbox also accept manual "quick capture" that gets triaged later? (This is related to UX-004 quick add)
- The capture review UX: what does "confirm" look like vs "adjust"? Does adjusting open the full edit form?

**Tyrrell's additional context:** He sometimes asks Claude on foster-forge to summarize his captures for the day/week. Wants that to eventually happen inside LifeOS. Also wants a place for things the pipeline might not have caught at all (context: sometimes voice notes don't get classified as tasks even when they should be).

---

### 2. Drag and Drop to Reschedule (FEAT-005)

**Desired:** Drag items on the time grid (Today and Week views) to change their scheduled time. Resize to change duration.

**Google Calendar events question:** If you drag a GCal event, should it:
- (A) Be read-only — no drag allowed (simplest)
- (B) Update locally only — silent divergence from Google (bad UX, not recommended)
- (C) Write back to Google Calendar API (right answer long-term, OAuth already exists)

**Questions for Opus:**
- Best drag-and-drop library for Next.js 16 / React 19? (`@dnd-kit/core` vs `react-beautiful-dnd` vs native HTML5 drag)
- How to handle 15-minute snap grid?
- For GCal write-back: is the existing OAuth token sufficient or does it need different scopes?
- Should drag be limited to the current day in Today view, or can you drag an item to a different day in Week view?

---

### 3. Unscheduled Items in Today View (UX-012)

**Current:** Today view shows: Overdue section → Time grid → "Scheduled No Time" at bottom
**Desired:** Overdue → Unscheduled (no time) → Time grid. Also: remove state section labels (In Progress, Active, etc.) from Today context — they're noise when you're looking at a single day.

**Questions for Opus:**
- Is there a smarter way to handle "unscheduled but active" items in a day view? E.g., a compact sidebar or a collapsible band above the time grid?
- Should unscheduled items on Today view be limited to items without a date entirely, or items with today's date but no time?

---

### 4. Voice Pipeline → LifeOS Integrations (Backlog)

Not prioritized yet. Capturing for discussion:

**A. Calendar auto-creation via natural language**
Pipeline extracts `due_date` with time. When datetime is present AND the note sounds like a scheduled event, pipeline calls Google Calendar API to create an event directly.
- Voice example: "schedule the birthday party between 2 and 4 on Saturday" → calendar event
- Needs: OAuth token on pipeline side, which calendar to target, how to avoid double-creation if LifeOS also creates it

**B. Voice notes in Vault**
Processed voice transcripts and summaries browsable in Vault. Pipeline already writes JSON per note. LifeOS needs a way to display them — either a `voice_notes` table or tag-based filtering on Notes.

**C. Daily/weekly rollup summaries as LifeOS notes**
Cron on pipeline that summarizes all captures for the day/week and pushes one LifeOS note. Tyrrell already asks Claude to do this in separate sessions — wants it automated.

**D. Pattern detection (future)**
Analyze captures over time — recurring themes, stalled tasks, capture frequency trends. Needs months of data first.

**Questions for Opus:**
- Should voice captures integrate via the existing Item/Note/List models with source flags, or does voice pipeline data deserve its own table(s)?
- For calendar auto-creation: one-way (pipeline → Google only) or bidirectional (also update LifeOS Item)?
- For rollup summaries: what's the right granularity and format? Would this replace Tyrrell's current habit of asking Claude on forge?

---

### 5. Projects (Not in scope yet, but shapes inbox design)

Tyrrell mentioned Projects as a future feature. Currently `/projects` is a placeholder. The inbox/triage concept and voice captures both naturally want to connect to projects eventually (assign a capture to a project during triage). Worth keeping this in mind when designing the inbox schema so it's not a dead end.

**Question:** Should a `projectId` foreign key be roughed in on Item/Note/List now, even empty, to make future migration easier?

---

## Constraints / Style Notes

- Tyrrell is single user but schema is multi-user ready (userId everywhere)
- Tailwind v4: use `wrap-break-word` not `break-words`, `bg-linear-to-r` not `bg-gradient-to-r`
- TypeScript strict mode — Prisma returns `null`, TS expects `undefined`, use `field || undefined`
- No custom CSS — Tailwind only
- Mobile-first — test at 375px width, BottomTabBar is 64px fixed at bottom on mobile
- Quality over speed — do it right, add error handling when things break

---

## What Opus Should Help Produce

1. **Schema recommendation for FEAT-004 (Inbox):** How to model `source`, `reviewed`, and the inbox concept across Item/Note/List
2. **Inbox UI recommendation:** Where it lives, how triage flow works
3. **Drag and drop library recommendation** with reasoning for the tech stack
4. **Voice pipeline integration priority order** and any schema pre-work worth doing now
5. **Any gotchas or concerns** with the approaches described above

After this conversation, the output will be turned into ADRs and then handed to Sonnet for implementation.
