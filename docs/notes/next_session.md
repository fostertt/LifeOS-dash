# Next Session - Start Here

**Last Updated:** February 1, 2026
**Current Status:** Phase 3.6 in progress - swipe structure built, snap behavior needs fixing
**Branch:** `feature/phase-3.6-navigation`
**Production:** https://lifeos-dev.foster-home.net (PM2 on port 3002)

---

## 🔥 CURRENT ISSUE: Swipe Snap Behavior Not Working

### What's Built ✅
- SwipeContainer component with Embla Carousel
- All 3 pages (Tasks, Calendar, Lists) pre-rendered in carousel
- Page indicators at top (Tasks | Calendar | Lists) - tappable to jump
- SwipeContext preventing duplicate Headers/Sidebars
- URL syncing (route changes position carousel, swipe updates URL)
- Explicit height chain (viewport, container, slides all have height: 100%)
- Keyboard navigation (arrow keys)
- localStorage persistence (remembers last page)

### What's Broken ❌
**Swipe gesture moves slides but doesn't snap to pages**

- Embla initializes correctly (emblaApi ready)
- Slides render at full viewport width
- Touch gestures are detected (slides move when swiped)
- **But slides don't snap to position** - they move partway and spring back
- reInit() called 100ms after mount to re-measure layout
- touchAction: 'pan-y' added to viewport and container
- Inline styles used (flex: '0 0 100%', minWidth: 0, height: '100%')

### What We Tried
1. ✅ Fixed viewport sizing (was 480px, now full width)
2. ✅ Removed Sidebar conflict (was rendering 3x, now skipped in swipe mode)
3. ✅ Added explicit heights at every level
4. ✅ Added touchAction: 'pan-y' to prevent browser scroll interception
5. ✅ Used inline styles instead of Tailwind classes
6. ✅ Added reInit() after mount to re-measure
7. ✅ Embla config: removed align, added containScroll, slidesToScroll
8. ❌ **Snap still not working** - slides move but spring back

### Debug Resources
- Screenshot: `docs/screenshots/swipe-black-box.png` (viewport sizing debug)
- Embla docs: https://www.embla-carousel.com/
- Current config in `components/SwipeContainer.tsx`

### Next Steps to Fix
1. **Check Embla options** - try different containScroll values, add dragThreshold
2. **Verify slide widths** - inspect computed styles, ensure 100vw actual width
3. **Test scroll snap CSS** - try CSS scroll-snap as fallback if Embla not working
4. **Check for conflicting styles** - something might be preventing snap
5. **Consider alternative library** - framer-motion if Embla too complex

---

## Phase 3.6 Success Criteria (from plan)

- [ ] Can swipe between 3 pages smoothly ← **BLOCKED: snap not working**
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
