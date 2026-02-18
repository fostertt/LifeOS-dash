# LifeOS Issues & Enhancements

**Last Updated:** January 30, 2026

---

## 🐛 Bugs (Blocking Real Usage)

### BUG-001: Cannot Edit List Items
**Discovered:** Jan 30, 2026 (real-world usage testing)
**Severity:** High - core functionality missing
**Description:** List items cannot be edited after creation. Must delete and recreate.
**Expected:** Click list item → edit modal → save changes
**Actual:** No edit interface exists for list items
**Related:** Phase 2.6 - Lists & Input UX Polish

---

## 🔧 UX Issues (Real-World Friction)

### UX-001: List Input Not Smooth
**Discovered:** Jan 30, 2026
**Priority:** High
**Description:** Current list input requires modal, separate actions. Should be inline like Google Keep.
**Current Flow:** Click + → Modal → Type → Save → Repeat
**Desired Flow:** Type in inline field → Enter → Next item appears
**Reference:** `docs/screenshots/google_keep_list.png`
**Related:** Phase 2.6

### UX-002: List Text Doesn't Wrap
**Discovered:** Jan 30, 2026
**Priority:** Medium
**Description:** Long list text overflows horizontally, making it unreadable on mobile.
**Expected:** Text wraps to multiple lines, full content visible
**Actual:** Text cuts off or scrolls horizontally
**Related:** Phase 2.6

### UX-003: Filter Button Missing Most Options
**Discovered:** Jan 30, 2026
**Priority:** Medium
**Description:** Filter only shows item types (task/reminder/event/routine). Missing all metadata fields.
**Missing Filters:** Priority, Effort, Focus, Duration, Date range, Completion status
**Impact:** Can't use smart list filtering effectively
**Related:** Phase 2.6, Smart Lists rethink

### UX-004: Quick Add Too Complex
**Discovered:** Jan 30, 2026
**Priority:** Medium
**Description:** Plus button shows all fields at once, overwhelming for quick capture.
**Current:** All fields visible (title, date, time, priority, effort, focus, duration, recurrence)
**Desired:** Simple quick add by default, "Advanced" toggle for full fields
**Use Case:** Most captures are just "title + maybe date", don't need 8 fields
**Related:** Pending ADR-010 in decisions.md

### UX-005: Date/Time Picker Not Intuitive
**Discovered:** Jan 30, 2026
**Priority:** Low
**Description:** Current date/time are separate text inputs. Should be calendar widget like Google Calendar.
**Desired:** Calendar icon → picker modal → date/time/recurrence in one interface
**Benefits:** Saves space, more familiar UX, groups related fields
**Related:** Phase 2.5 (scheduled)

---

## ✨ Feature Requests (Missing Capabilities)

### FEAT-001: Lists Need Notes Field
**Discovered:** Jan 30, 2026
**Priority:** High
**Description:** List items should support longer-form notes/descriptions beyond just the title.
**Use Case:** Grocery list item "Chicken" → note: "3 lbs, organic if available, for Sunday dinner"
**Related:** FEAT-002 (all items need this)

### FEAT-002: Tasks Need Description/Notes Field
**Discovered:** Jan 30, 2026
**Priority:** High
**Description:** Tasks (and all items added via + button) need free-text description field.
**Use Case:** Task "Fix deck" → notes: "Loose boards near steps, need 10 screws, check for rot"
**Applies To:** Tasks, Events, Reminders, Routines (all item types)
**Related:** Phase 2.6

### ~~UX-006: No Delete Button When Viewing a Task Detail (All Page)~~ FIXED
**Discovered:** Feb 18, 2026 | **Fixed:** Feb 18, 2026
**Resolution:** Added `onDelete` prop to `TaskForm` component with confirmation dialog. Wired up in All page.

### UX-007: No Multi-Select for Bulk Delete on All Page
**Discovered:** Feb 18, 2026
**Priority:** Low
**Description:** No way to select multiple tasks at once for bulk deletion or other bulk actions. Would be useful for clearing out many completed/unwanted tasks quickly.
**Idea:** Long-press or checkbox mode to select multiple tasks, then a bulk delete action.
**Status:** Approach not decided yet — needs design consideration before implementing.
**File:** `app/all/page.tsx`

---

## 🤔 Architectural Questions (Need Discussion)

### ARCH-001: Smart Lists Rethink
**Discovered:** Jan 30, 2026
**Current Behavior:** Smart lists are separate filtered views
**Observation:** "Smart lists are basically just a filter of my other tasks"
**Proposed:**
- Add "All" section showing everything
- Apply filters to see "smart list" results
- Create premade filter options (Quick Wins, Deep Work, etc.)
- Remove separate "smart list" concept
**Impact:** Significant UX change, affects Lists view architecture
**Status:** Needs ADR-009 in decisions.md

### ARCH-002: Effort vs Focus Redundancy
**Discovered:** Jan 30, 2026
**Question:** "I think effort and focus might be the same thing...get rid of one?"
**Current:**
- Effort: How hard the task is
- Focus: How much concentration required
**Observation:** These may overlap in practice
**Need To:** Review actual usage data, decide if consolidation makes sense
**Impact:** Data model change, affects filters and UI
**Status:** Needs ADR-011 in decisions.md

---

## 📋 Implementation Checklist

**Phase 2.6 Priorities:**
1. [ ] Fix BUG-001 (can't edit lists) - BLOCKING
2. [ ] Add notes field to all item types (FEAT-001, FEAT-002)
3. [ ] Implement Google Keep-style list input (UX-001)
4. [ ] Fix text wrapping in lists (UX-002)
5. [ ] Expand filter options (UX-003)
6. [ ] Decide on smart lists architecture (ARCH-001)
7. [ ] Decide on effort/focus consolidation (ARCH-002)
8. [ ] Implement quick add simplification (UX-004) - pending ADR-010
9. [ ] Calendar-style date/time picker (UX-005) - Phase 2.5

---

**Note:** Issues discovered through real-world usage testing (Jan 30, 2026) after deploying mobile-responsive Phase 2 improvements.
