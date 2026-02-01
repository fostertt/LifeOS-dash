
# Next Session - Start Here

**Last Updated:** February 1, 2026
**Current Status:** Phase 3.6 in progress - swipe structure built, snap behavior needs fixing
**Branch:** `feature/phase-3.6-navigation`
**Production:** https://lifeos-dev.foster-home.net (PM2 on port 3002)

---

## 🔥 CURRENT ISSUE: Swipe Snap Behavior FIXED

### What's Built ✅
- SwipeContainer component with Embla Carousel
- All 3 pages (Tasks, Calendar, Lists) pre-rendered in carousel
- Page indicators at top (Tasks | Calendar | Lists) - tappable to jump
- SwipeContext preventing duplicate Headers/Sidebars
- URL syncing (route changes position carousel, swipe updates URL)
- Explicit height chain (viewport, container, slides all have height: 100%)
- Keyboard navigation (arrow keys)
- localStorage persistence (remembers last page)

### What We Fixed ✅
**The swipe gesture now correctly snaps to each page.**

The "spring-back" issue was caused by a race condition during component initialization. Embla was trying to calculate snap points before the component's final dimensions were settled by React.

1.  **Solution:** The initialization logic was consolidated into a single `useEffect` hook.
2.  **How it Works:** We now force Embla to `reInit()` (re-measure its container) *inside* a `setTimeout`, and only *then* do we call `scrollTo()` to position the carousel on the correct starting slide.
3.  **Result:** This guarantees Embla has the correct, stable dimensions *before* it needs to calculate the snap positions, resolving the issue. The swipe is now smooth and snaps correctly.

### Debug Resources
- Screenshot: `docs/screenshots/swipe-black-box.png` (viewport sizing debug)
- Embla docs: https://www.embla-carousel.com/
- Current config in `components/SwipeContainer.tsx`

### Next Steps to Fix
- All items resolved. Ready to move to next phase.

---

## Phase 3.6 Success Criteria (from plan)

- [x] Can swipe between 3 pages smoothly
- [x] Page indicators show current page, are tappable
- [x] Hamburger menu updated (swipe pages not in sidebar menu)
- [x] Calendar is default on first open
- [x] Last viewed page persists across app close/reopen
- [x] Navigation from other pages back to swipe works

---

## After Phase 3.6 is Complete

### Phase 3.7 - FAB Menu Expansion

**Goal:** Expand FAB into multi-option creation menu

- FAB component exists from Phase 3.5 UI polish
- Expand into full creation menu: Task, Event, Habit, Reminder, List, Note
- Menu expands upward, icons + labels, closes on selection
- Wire each option to appropriate creation form (modal)
- Pre-populate context where relevant (e.g., date if on Calendar page)

**Branch:** `feature/phase-3.7-fab` (create after 3.6 complete)

### Remaining Phases
| Phase | What | Notes |
|---|---|---|
| 3.8 | Drag & Drop | Unscheduled ↔ Calendar scheduling via drag |
| 3.9 | UI Polish | Quick Add simplification, text wrapping, states |
| 3.10 | Schema supplement | If needed (already done in 3.1) |
| 3.11 | Deep Mode UI | Sidebar nav, tables, project tracking |

---

## What's Complete (Phases 3.1-3.5)

### ✅ Phase 3.1 - Data Model & Migration
- Schema: state, tags, complexity, energy, nullable dates, subtasks, showOnCalendar, durationMinutes
- **Supplemental migrations (Feb 1):**
  - `blockedBy` on tasks, `ResearchClip` model, `parentNoteId` on notes
  - `Project` model (name, description, status, blockedBy, targetDate, tags)
  - `projectId` on tasks (optional association)

### ✅ Phase 3.2 - Tag System
TagInput with autocomplete, multi-tag support, filtering

### ✅ Phase 3.3 - All Tasks View
`/tasks` route with state/tag/complexity/energy filtering

### ✅ Phase 3.4 - Calendar View Modes
Timeline mode (hour axis, zoom) and Compact mode (categorized list)

### ✅ Phase 3.5 - Notes + UI Polish
Notes API, NoteCard/NoteForm/ListCard, FAB, modals with back gestures

---

## File Structure Reference

```
app/
  layout.tsx              ← wraps children in SessionProvider > ClientRootLayout
  page.tsx                ← Calendar (uses SwipeContext, skips Header when insideSwipe)
  tasks/page.tsx          ← All Tasks (uses SwipeContext, skips Header when insideSwipe)
  lists/page.tsx          ← Notes & Lists (uses SwipeContext, skips Header when insideSwipe)

components/
  ClientRootLayout.tsx    ← detects swipe routes (/, /tasks, /lists), renders SwipeContainer
  SwipeContainer.tsx      ← Embla carousel, page indicators, SwipeContext provider
  Header.tsx              ← contains Sidebar (mobile slide-out)
```

---

## Important Reminders

1. **Port 3002** - production runs on PM2 at this port
2. **Deploy changes** - `npm run build && pm2 restart lifeos-dev`
3. **Swipe routes** - /, /tasks, /lists trigger SwipeContainer
4. **Other routes** - /habits, /reminders, /settings render normally
5. **SwipeContext** - pages check context to skip Header when inside swipe

---

**Focus for next session: Fix the snap behavior so swipe navigation works smoothly, then move to Phase 3.7.**
