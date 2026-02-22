# LifeOS Issues & Enhancements

**Last Updated:** February 22, 2026

---

## 🐛 Bugs (Blocking Real Usage)

### ~~BUG-001: Cannot Edit List Items~~ FIXED
**Discovered:** Jan 30, 2026 | **Fixed:** Feb 21, 2026
**Resolution:** Implemented Keep-style full-page list editor at `/vault/lists/[id]`. Inline checklist editing with add/remove/check/uncheck. (Phase 4 Group 8)

---

## 🔧 UX Issues (Real-World Friction)

### ~~UX-001: List Input Not Smooth~~ FIXED
**Discovered:** Jan 30, 2026 | **Fixed:** Feb 21, 2026
**Resolution:** Keep-style inline list editor — type an item, press Enter, next field appears. No modal required. (Phase 4 Group 8)

### ~~UX-002: List Text Doesn't Wrap~~ FIXED
**Discovered:** Jan 30, 2026 | **Fixed:** Feb 21, 2026
**Resolution:** Full-page list editor uses proper flex layout with text-wrap. No more horizontal overflow. (Phase 4 Group 8)

### ~~UX-003: Filter Button Missing Most Options~~ FIXED
**Discovered:** Jan 30, 2026 | **Fixed:** Feb 2026
**Resolution:** Expanded filter panel on All page covers Priority, State, Type, Tags, and sorting. Unified filter pattern across Calendar and All views. (Phase 4 Group 4)

### UX-004: Quick Add Too Complex
**Discovered:** Jan 30, 2026
**Priority:** Medium
**Description:** Plus button shows all fields at once, overwhelming for quick capture.
**Current:** All fields visible (title, date, time, priority, effort, focus, duration, recurrence)
**Desired:** Simple quick add by default, "Advanced" toggle for full fields
**Use Case:** Most captures are just "title + maybe date", don't need 8 fields
**Related:** Pending ADR-010 in decisions.md

### ~~UX-005: Date/Time Picker Not Intuitive~~ FIXED
**Discovered:** Jan 30, 2026 | **Fixed:** Phase 2.5
**Resolution:** Date/Time icon buttons trigger native pickers directly via `showPicker()`. Compact, no extra modal. (Phase 4 Group 2)

### ~~UX-006: No Delete Button When Viewing a Task Detail (All Page)~~ FIXED
**Discovered:** Feb 18, 2026 | **Fixed:** Feb 18, 2026
**Resolution:** Added `onDelete` prop to `TaskForm` component with confirmation dialog. Wired up in All page.

### UX-007: No Multi-Select for Bulk Delete on All Page
**Discovered:** Feb 18, 2026
**Priority:** Low
**Description:** No way to select multiple tasks at once for bulk deletion or other bulk actions.
**Idea:** Long-press or checkbox mode to select multiple, then bulk delete.
**Status:** Approach not decided — needs design consideration before implementing.
**File:** `app/all/page.tsx`

### ~~UX-008: Cannot Delete Notes~~ FIXED
**Discovered:** Feb 19, 2026 | **Fixed:** Feb 19, 2026
**Resolution:** Added `onDelete` prop to `NoteForm` with confirmation dialog. DELETE API endpoint already existed but was never wired to UI.

### UX-008: Pin to Today Checkbox Cut Off on Mobile Task Form
**Discovered:** Feb 21, 2026
**Priority:** Medium
**Description:** On mobile, the "Pin to Today" checkbox is off-screen to the right of the recurrence dropdown. User has to scroll horizontally to see/access it. Need a more compact representation — possibly a pin icon button instead of checkbox+text.
**Screenshot:** `docs/screenshots/task1.jpg`
**File:** `components/TaskForm.tsx`

### ~~UX-009: Tag Chips Too Faint on Mobile~~ FIXED
**Discovered:** Feb 19, 2026 | **Fixed:** Feb 19, 2026
**Resolution:** Bumped tag chip styling from `bg-blue-100 text-blue-800` to `bg-blue-200 text-blue-900 font-medium`. Also improved autocomplete dropdown: larger tap targets (`py-3`), `text-base font-medium text-gray-900`.

### UX-009: No Complete Button in Edit Task Modal
**Discovered:** Feb 21, 2026
**Priority:** Medium
**Description:** When opening a task from month view (or any view) via the edit modal, there's no way to mark it complete without going back to a list view. Should have a "Complete" checkbox in the modal header row, next to "Edit Task" title.
**File:** `components/TaskForm.tsx`

### ~~UX-010: Tag Autocomplete Not Showing Existing Tags~~ FIXED
**Discovered:** Feb 19, 2026 | **Fixed:** Feb 19, 2026
**Resolution:** TagInput only showed suggestions when typing. Added focus state tracking so all available tags show on focus with "Existing tags" header.

### UX-010: Note/List Editor Bottom Panel Should Be Fixed
**Discovered:** Feb 21, 2026
**Priority:** High
**Description:** Color picker, tags, pin toggle, and Save/Delete buttons are currently inline in the editor body and scroll with content. Should be pinned to the bottom of the viewport with content scrolling above it. Must account for BottomTabBar height on mobile.
**Reference:** `docs/screenshots/note-list.jpg`
**Files:** `app/vault/notes/[id]/page.tsx`, `app/vault/lists/[id]/page.tsx`

### ~~UX-011: Data Doesn't Refresh Without Page Reload~~ FIXED
**Discovered:** Feb 19, 2026 | **Fixed:** Feb 19, 2026
**Resolution:** Created `useRefreshOnFocus` hook (`lib/useRefreshOnFocus.ts`) using `visibilitychange` + `focus` events with 5s throttle. Applied to all 4 pages. Still unreliable on Android (see phase4 plan item 1.1).

---

## ✨ Feature Requests (Missing Capabilities)

### ~~FEAT-001: Lists Need Notes Field~~ FIXED
**Discovered:** Jan 30, 2026 | **Fixed:** Feb 21, 2026
**Resolution:** Keep-style list editor supports full item content. (Phase 4 Group 8)

### ~~FEAT-002: Tasks Need Description/Notes Field~~ FIXED
**Discovered:** Jan 30, 2026 | **Fixed:** Feb 21, 2026
**Resolution:** TaskForm has a Description field visible in the main form area. Notes stored as `description` on the Item model. (Phase 4 Group 2)

### FEAT-003: Rich Text / Markdown Support in Notes
**Discovered:** Feb 19, 2026
**Priority:** Medium
**Description:** Notes are plain text only (textarea). Would benefit from markdown support for headers, bold, lists, etc.
**Approach:** Markdown with preview recommended over full rich text editor. Needs ADR.
**File:** `components/NoteForm.tsx`

### FEAT-004: Voice Capture Inbox / Triage View — ADR DECIDED
**Discovered:** Feb 21, 2026 | **Architecture decided:** Feb 21, 2026
**Priority:** High — next major feature
**ADR:** ADR-020 (Voice Capture Inbox & Triage)
**Summary:** `source String?` + `reviewedAt DateTime?` + `projectId Int?` on Item, Note, List. Inbox replaces Home tab. Quick capture (title-only) also flows through inbox. See ADR-020 for full details.
**Status:** Ready for implementation

### FEAT-005: Drag and Drop to Reschedule (Week + Today Views)
**Discovered:** Feb 21, 2026
**Priority:** Medium
**Description:** Drag items on the time grid to reschedule them. Resize handles to change duration (defer until drag is solid).
**Google Calendar events:** Either read-only for dragging OR implement GCal write via Calendar API. Do not allow silent state divergence between local and GCal.
**Files:** `app/week/page.tsx`, `app/calendar/page.tsx`

### UX-012: Unscheduled Items at Top of Today View — ADR DECIDED
**Discovered:** Feb 21, 2026 | **Architecture decided:** Feb 21, 2026
**Priority:** Medium
**ADR:** ADR-017 (Today View Layout Reorder)
**Summary:** Reorder to Overdue → Unscheduled → Time grid. Both sections collapsible. Unscheduled = active items with today-no-time OR no date. Backlog excluded. State labels removed from Today context.
**Status:** Ready for implementation
**File:** `app/calendar/page.tsx`

---

## 🤔 Architectural Questions (Need Discussion)

### ~~ARCH-001: Smart Lists Rethink~~ DECIDED
**Discovered:** Jan 30, 2026 | **Decided:** Feb 2026
**Resolution:** Separate smart list concept removed. All page now has comprehensive filtering (Priority, State, Type, Tags, sorting). Smart lists were just saved filters — not implemented as a separate concept. (Phase 4 Group 4)

### ~~ARCH-002: Effort vs Focus Redundancy~~ DECIDED
**Discovered:** Jan 30, 2026 | **Decided:** Feb 2026
**Resolution:** Keeping both fields for now. Usage data doesn't yet justify removing either. Revisit if real-world usage shows consistent redundancy.

---

## 📋 Implementation Status

**See `docs/plans/lifeos-roadmap.md` for full roadmap.**

**Completed (Feb 2026):**
- [X] UI Polish Phases 1–6.5 (All page, Calendar views, compact headers, view consolidation)
- [X] Habits/reminders integration, type filters, sub-tasks
- [X] Google Calendar integration (read, display, timezone fix)
- [X] Keep-style note/list editors (ADR-015)
- [X] Recurring task options — 6 types, two completion models (ADR-014)
- [X] Inbox system — source/reviewedAt fields, inbox replaces Home tab (ADR-020)
- [X] State collapse — backlog/active/completed (ADR-019)
- [X] Today view reorder — Overdue → Unscheduled → Time grid (ADR-017)
- [X] UX-008: Pin to Today icon button
- [X] UX-009: Complete button in task edit modal
- [X] UX-010: Bottom panel pinned in note/list editors

**Next Up:**
- [ ] Vault polish (Phase 7) — compact layout, note refresh fix, content optional
- [ ] FAB redesign (Phase 8) — Lucide icons, clean popup
- [ ] Wire voice pipeline to inbox — pipeline sends `source: "voice"`
- [ ] Drag and drop to reschedule (ADR-018) — @dnd-kit on Today + Week
- [ ] Daily briefing + voice rollup (ADR-016) — after inbox is battle-tested

**Backlog:**
- [~] Auto-refresh on Android — unreliable, may need polling/service worker
- [ ] Click-to-add on week view — implemented, unverified
- [⏸] Enter key sub-item advancement — Android keyboard blocker
- [ ] Voice pipeline → calendar auto-create
- [ ] Projects UI
- [ ] Recipes & meal planning
