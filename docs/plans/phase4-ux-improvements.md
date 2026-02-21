# LifeOS Phase 4: Remaining UX Work

**Created**: 2026-02-21
**Updated**: 2026-02-21
**Status**: In Progress — remaining items only

---

## Open Items

### UX-010: Pin Bottom Panel to Viewport

**Priority**: High
**Description**: Color picker, tags, pin toggle, and Save/Delete buttons are currently inline in the note/list editor body and scroll with content. Should be fixed to the bottom of the viewport with content scrolling above. Must account for BottomTabBar height on mobile.
**Reference**: `docs/screenshots/note-list.jpg`
**Files**: `app/vault/notes/[id]/page.tsx`, `app/vault/lists/[id]/page.tsx`

---

### UX-008: Pin to Today Checkbox Cut Off on Mobile

**Priority**: Medium
**Description**: "Pin to Today" checkbox sits to the right of the recurrence dropdown and is off-screen on mobile — requires horizontal scroll to reach. Should be a compact pin icon button instead of checkbox+label.
**Screenshot**: `docs/screenshots/task1.jpg`
**File**: `components/TaskForm.tsx`

---

### UX-009: No Complete Button in Edit Task Modal

**Priority**: Medium
**Description**: No way to mark a task complete from the edit modal (reached from month view or any card click). Should have a "Complete" checkbox or button in the modal header row next to the "Edit Task" title.
**File**: `components/TaskForm.tsx`

---

### 6.3: Click-to-Add on Week View (Unverified)

**Priority**: Medium
**Description**: Week view day cells have click handlers wired to open TaskForm with the day pre-filled. Item/event cards use `e.stopPropagation()`. Week view now uses TaskForm for edit too. Implemented but not confirmed working — needs testing and likely debugging.
**File**: `app/week/page.tsx`

---

### 1.1: Auto-Refresh Unreliable on Android

**Priority**: Medium
**Description**: `useRefreshOnFocus` hook was improved (pageshow + ref fix) but still doesn't reliably trigger on Android after returning from background. The `visibilitychange` + `focus` approach may not fire consistently on Android Chrome/WebView. Needs a different strategy — possibly polling on resume or a service worker approach.
**Files**: `lib/useRefreshOnFocus.ts`, `app/all/page.tsx`, `app/calendar/page.tsx`, `app/week/page.tsx`, `app/vault/page.tsx`

---

### UX-004: Quick Add Simplification

**Priority**: Medium
**Description**: The FAB create form shows all fields at once (title, date, time, priority, effort, focus, duration, recurrence) — too much for quick capture. Most creates are just title + maybe date.
**Desired**: Simple view by default, "Advanced" toggle reveals remaining fields.
**Status**: Pending ADR-010 in decisions.md — decision needed before implementing.
**File**: `components/TaskForm.tsx` (or new QuickAdd component)

---

### 2.4: Enter Key Advances to Next Sub-Item (Deferred)

**Priority**: Low — deferred
**Description**: Pressing Enter in a sub-task should create the next item and focus it. Desktop Enter works fine. Android/GBoard sends `keyCode 229` on keydown so `e.key === 'Enter'` never fires; `beforeinput` with `inputType === 'insertLineBreak'` also unreliable. Needs a different approach (e.g. `<textarea rows={1}>` detecting `\n` in onChange).
**Files**: `components/TaskForm.tsx`

---

## Workflow

After completing each item:

1. `npm run build` — ensure no TypeScript errors
2. `pm2 restart lifeos-dev` — deploy to dev (port 3002)
3. Test on mobile + desktop
4. Commit before moving to next item
