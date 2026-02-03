# Overdue Persistence Feature

**Implementation Date:** February 3, 2026
**Status:** ✅ COMPLETE - All features working
**Phase:** 3.10

---

## Overview

Implemented persistent overdue flag system that keeps tasks marked as overdue even after rescheduling, until explicitly cleared by the user.

---

## Database Changes

### Migration
- **File:** `prisma/migrations/20260203140618_add_is_overdue_field/migration.sql`
- **Added Field:** `isOverdue Boolean? @default(false) @map("is_overdue")`
- **Location:** `items` table

### Schema Update
```prisma
isOverdue Boolean? @default(false) @map("is_overdue") // Phase 3.10: Persistent overdue flag
```

---

## Backend Implementation

### Auto-Set Logic
**File:** `app/api/calendar/items/route.ts`

Tasks automatically marked `isOverdue=true` when:
- `state = 'active'`
- `dueDate < today`
- `isCompleted = false`
- `isOverdue = false` (not already marked)

**Implementation:** Lines 116-140
```typescript
const tasksToMarkOverdue = allItems.filter((item) => {
  return (
    item.state === "active" &&
    item.dueDate &&
    !item.isCompleted &&
    !item.isOverdue &&
    formatDate(new Date(item.dueDate)) < formatDate(today)
  );
});

if (tasksToMarkOverdue.length > 0) {
  await prisma.item.updateMany({
    where: { id: { in: idsToUpdate } },
    data: { isOverdue: true },
  });
}
```

### Categorization Logic
**File:** `app/api/calendar/items/route.ts` (Lines 189-195)

Overdue tasks appear in BOTH:
1. Overdue section (always)
2. Scheduled sections (if they have a date/time)

```typescript
if (item.isOverdue && !isCompleted) {
  overdue.push(item);
  // Don't continue - let overdue items also appear in scheduled sections
}
```

### Auto-Clear Logic
**File:** `app/api/items/[id]/route.ts`

`isOverdue` automatically cleared when:
- Task state changes to `"backlog"` or `"completed"`
- `isCompleted` set to `true`

```typescript
if (body.state === "backlog") {
  updateData.isOverdue = false;
}

if (body.state === "completed") {
  updateData.isOverdue = false;
}

if (body.isCompleted === true) {
  updateData.isOverdue = false;
}
```

### PATCH Endpoint Fix
**File:** `app/api/items/[id]/route.ts` (Lines 130-158)

**Critical Fix:** Changed from setting all fields (even undefined ones) to only updating fields present in request body. This prevents drag-and-drop from accidentally clearing `isOverdue`.

---

## Frontend Implementation

### TypeScript Interface
**File:** `app/page.tsx` (Line 60)
```typescript
interface Item {
  // ... existing fields
  isOverdue?: boolean; // Phase 3.10: Persistent overdue flag
}
```

### Visual Styling

#### Compact/Scheduled View
**File:** `app/page.tsx` (Lines 851-857)
- Red border and background: `border-red-300 bg-gradient-to-r from-red-50 to-orange-50`
- Red warning icon: ⚠
- Red text color for task name

#### Timeline View
**File:** `app/page.tsx` (Lines 1207-1213)
- Red background: `bg-red-50 border-red-400 hover:bg-red-100`
- Tasks display in their scheduled time slot with red styling

### Clear Overdue Actions

#### 1. Clear Button on Task Card
**File:** `app/page.tsx` (Lines 1043-1063)
- Small "Clear" button appears next to checkbox on overdue tasks
- Directly calls API to set `isOverdue=false`
- Toast notification: "Cleared overdue status"

#### 2. Clear Button in TaskForm Modal
**File:** `components/TaskForm.tsx` (Lines 288-312)
- Red warning banner appears when editing overdue task
- Shows explanation text
- "Clear" button to remove overdue flag

#### 3. Drag to Overdue Section
**File:** `app/page.tsx` (Lines 752-758)

Overdue section made droppable with `id="overdue-drop-zone"`

When task dropped on overdue section:
```typescript
updateData = {
  dueDate: null,
  dueTime: null,
};
```
- Clears both date and time (unschedules completely)
- Keeps `isOverdue=true`
- Task appears ONLY in Overdue section

---

## User Workflows

### Workflow 1: Task Becomes Overdue
1. User creates task with past due date
2. System auto-sets `isOverdue=true` on page load
3. Task appears in:
   - Overdue section (red, at top)
   - Timeline/scheduled section (red, at scheduled time)

### Workflow 2: Reschedule Overdue Task
1. User drags overdue task from Overdue section to timeline
2. Task gets scheduled time
3. Task STAYS in Overdue section (persistence working)
4. Task also appears on timeline in red

### Workflow 3: Clear Overdue Status
Three options:
- **Click "Clear" button** on task card
- **Drag to Overdue section** (unschedules completely)
- **Complete the task** (auto-clears)

### Workflow 4: Complete Overdue Task
1. User checks off overdue task
2. `isOverdue` auto-cleared
3. Task moves to completed state

---

## Known Issues

### ✅ FIXED: Can't Drag After Overdue→Timeline→Overdue Cycle
**Status:** Fixed
**Discovered:** February 3, 2026 (end of session)
**Fixed:** February 3, 2026

**Root Cause:**
When an overdue task had a scheduled time, it appeared in BOTH the Overdue section and the Timeline section. Both instances used the same draggable ID (`task-{id}`), creating duplicate IDs in the DOM. This violated dnd-kit's requirement for unique draggable IDs. When dragging through the cycle changed the number of rendered instances (1→2→1), dnd-kit lost track of the elements.

**Solution:**
Added a `context` prop to `DraggableTaskCard` that gets prepended to each draggable ID:
- Overdue section: `task-compact-overdue-{id}` or `task-timeline-overdue-{id}`
- Timeline: `task-timeline-scheduled-{id}`
- Backlog: `task-backlog-{id}`
- Other sections: Similar contextual prefixes

This ensures every draggable has a unique ID, even when the same task appears in multiple sections.

**Files Modified:**
- `components/DraggableTaskCard.tsx` - Added optional `context` prop
- `app/page.tsx` - Updated `renderItemCard()`, timeline rendering, and `handleDragStart()` to use contexts
- `components/BacklogSidebar.tsx` - Added context="backlog"

**Additional Fixes:**
- Removed debug console.log statements
- Fixed misleading toast message ("Cleared overdue status!" → "Task unscheduled")

---

## Files Modified

### Database/Schema
- `prisma/schema.prisma`
- `prisma/migrations/20260203140618_add_is_overdue_field/migration.sql`

### Backend API
- `app/api/calendar/items/route.ts` (categorization + auto-set logic)
- `app/api/items/[id]/route.ts` (PATCH endpoint + auto-clear logic)

### Frontend
- `app/page.tsx` (Item interface, renderItemCard styling, timeline styling, Clear button, drag handlers)
- `components/TaskForm.tsx` (interface updates, Clear overdue banner)

### Documentation
- `docs/notes/decisions.md` (Added ADR-013)
- `docs/notes/next_session.md` (Updated with Phase 3.10 completion)

---

## Testing Checklist

- [x] Task auto-marked overdue when date passes
- [x] Overdue task appears in both Overdue section and timeline
- [x] Overdue task shows red styling (border, background, icon)
- [x] Drag overdue task to timeline - stays overdue (persists)
- [x] Clear button on task card works
- [x] Clear button in TaskForm modal works
- [x] Drag to Overdue section unschedules task
- [x] Complete overdue task - auto-clears overdue flag
- [x] Move to backlog - auto-clears overdue flag
- [x] Timeline view shows overdue tasks in red
- [x] Can drag task multiple times after overdue→timeline→overdue cycle

---

## Architecture Decision

See **ADR-013** in `docs/notes/decisions.md` for full rationale.

**Key Decision:** Use persistent boolean flag instead of dynamic date calculation.

**Rationale:**
- Dynamic: Tasks automatically leave overdue when rescheduled (easy to lose track)
- Persistent: Tasks stay overdue until explicitly cleared (user control)

---

## Next Steps

1. **Mobile testing** - Verify touch drag works for all overdue workflows
2. **Consider UX refinements:**
   - Should Overdue section always be visible (even when empty)?
   - Visual feedback when dragging over Overdue drop zone?
   - Keyboard shortcut to clear overdue?
