# ADR-012 REVISED: Task State Model
**Replaces:** Original ADR-012 (5-state: unscheduled | scheduled | in_progress | on_hold | completed)
**Status:** Approved — requires migration before Phase 3.8 drag-and-drop work continues

---

## Decision

4-state system. Scheduling (whether a task has a date) is a separate property, NOT a state.

| State | Meaning | Date allowed? | Shows on calendar? |
|---|---|---|---|
| **backlog** | Parked. Ideas, maybes, deferred, waiting. Not acting on it. | No — date is cleared if moved here | No (unless `showOnCalendar` is set, but see note below) |
| **active** | On your plate. Queued up, next up, planning. You've decided this is happening. | Yes (optional) | Yes, if it has a date. Also shows on Today if `showOnCalendar` is true. |
| **in_progress** | You're in it right now. Actively working this. | Yes (optional) | Yes, if it has a date. Also shows on Today if `showOnCalendar` is true. |
| **completed** | Done. | Preserved as-is (historical record) | No (unless user wants to see completed items — filter decision) |

> **Note on Backlog + showOnCalendar:** A Backlog item should not be pinned to Today. If something is pinned to Today, it's Active by definition. If state is moved to Backlog, both `date` and `showOnCalendar` should clear.

---

## State Transition Rules

These are the ONLY constraints in the system. Everything else is free movement.

### Rule 1: Backlog cannot have a date
- Moving a task TO Backlog → clears `date` (and `showOnCalendar`)
- Setting a date ON a Backlog task → auto-moves state to `active` first, then sets date
- This is the ONLY auto state transition in the system

### Rule 2: All other state transitions are free
- Active ↔ In Progress: no side effects. Date untouched.
- Active or In Progress → Completed: no side effects. Date untouched.
- Completed → Active or In Progress: allowed (task reopened). Date untouched.
- Any state → Backlog: Rule 1 applies (date clears).

### Rule 3: Calendar drag is a date operation only
- Drag onto calendar → sets date. State does NOT change (exception: if task is in Backlog, Rule 1 auto-advances to Active first).
- Drag off calendar → clears date. State does NOT change. Task stays in whatever state it was in.
- Drag within calendar (reschedule) → updates date. State untouched.

### Rule 4: State changes on All Tasks view are state operations only
- Dragging between state groups (kanban-style) changes state only.
- If dragged INTO Backlog, Rule 1 applies (date clears).
- Otherwise, date is untouched.

---

## What changed and why

| Old model | Problem | New model |
|---|---|---|
| `unscheduled` and `scheduled` were states | Redundant with whether `date` is populated. Forced the coder to gate drag sources by state instead of by date. | Scheduling is just whether `date` exists. States only track workflow position. |
| `on_hold` was a distinct state | In practice, "on hold" and "backlog" are the same bin — not acting on it. Internal distinctions (waiting, deferred, someday) are tag/label jobs. | Collapsed into `backlog`. Tags handle the nuance inside it. |
| No clear separation between "queued" and "executing" | `unscheduled` was doing double duty as both "idea" and "ready to go." | `backlog` = parked. `active` = queued/next/planning. `in_progress` = executing. Clear separation. |

---

## Schema change needed

**Migration:** Update `state` enum on tasks table.

```
OLD: 'unscheduled' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed'
NEW: 'backlog' | 'active' | 'in_progress' | 'completed'
```

**State mapping for existing data:**
- `unscheduled` → `backlog` (no date = parked)
- `scheduled` → `active` (has a date = on your plate)
- `in_progress` → `in_progress` (no change)
- `on_hold` → `backlog` (parked)
- `completed` → `completed` (no change)

**Verify after migration:** Any task mapped to `backlog` that still has a `date` value needs the date cleared. This shouldn't happen if the old model was consistent, but check anyway.

---
---

# Phase 3.8 - Drag & Drop (Updated)

**Prerequisite:** ADR-012 migration must be complete before this phase's drag logic is implemented. The old state-based drag gating is being replaced entirely.

---

## Tasks

### 1. Run ADR-012 migration
- Update state enum on tasks table
- Map existing task states per the table above
- Clear `date` and `showOnCalendar` on any task that ended up in `backlog` with a date
- Verify data integrity

### 2. Choose and set up drag-drop library
- Evaluate: dnd-kit vs react-beautiful-dnd
- dnd-kit is the stronger pick — more flexible, better maintained, works well with touch. But evaluate based on what's already in the project deps.

### 3. Make tasks draggable
- Drag handle on each task card
- Ghost image during drag
- Works on: All Tasks view (any state), Calendar view (scheduled items)

### 4. Calendar drop targets (scheduling)
- **Timeline mode:** drop on time slots → sets date + time
- **Compact mode:** drop on day sections → sets date
- **On drop logic:**
  - If task state is `backlog` → auto-set state to `active`, then set date (Rule 1)
  - If task state is `active` or `in_progress` → set date only. State untouched.
  - If task state is `completed` → do not allow drop (completed tasks don't get rescheduled)
- Optimistic UI update, then persist to backend

### 5. Drag off calendar (unscheduling)
- Drag a task that has a date off the calendar (or onto a "remove date" drop zone if needed for UX clarity)
- **On drop logic:** clear `date` only. State stays exactly as-is. No state change.
- If task was `active` → stays `active`, just no date now
- If task was `in_progress` → stays `in_progress`, just no date now

### 6. Within-calendar reschedule
- Drag scheduled task to different time slot or day on the calendar
- Updates `date` (and `time` if timeline mode). State untouched.

### 7. All Tasks view — kanban-style state drag
- Tasks grouped by state: Backlog | Active | In Progress | Completed
- Drag between groups = state change
- **On drop logic:**
  - Dropped into `backlog` → state = backlog, clear `date` and `showOnCalendar` (Rule 1)
  - Dropped into `active` → state = active. Date untouched.
  - Dropped into `in_progress` → state = in_progress. Date untouched.
  - Dropped into `completed` → state = completed. Date untouched.
- Do NOT allow drag into `completed` from the kanban board — completing should be an explicit action (tap/button), not a casual drag. Up for debate but flagging as a recommendation.

### 8. Mobile support
- Long-press to initiate drag
- Touch feedback during drag
- Auto-scroll near screen edges during drag

---

## Success Criteria
- [ ] Migration complete, data verified
- [ ] Can drag any non-completed task onto calendar → gets scheduled
- [ ] Backlog task dragged onto calendar → auto-advances to Active, gets date
- [ ] Dragging task off calendar → clears date, state unchanged
- [ ] Can reschedule within calendar via drag
- [ ] Can drag between state groups on All Tasks (kanban)
- [ ] Dragging into Backlog clears date
- [ ] Works on mobile (touch)
- [ ] Visual feedback throughout all drag operations

**Branch:** `feature/phase-3.8-drag-drop`
