# LifeOS UI Polish & Cleanup Plan

**Created:** February 4, 2026
**Status:** Ready for Review
**Estimated Effort:** 11-14 hours (2-3 sessions)

---

## Overview

Comprehensive UI redesign to make LifeOS more compact, clean, and professional across 6 main areas: Home, All, Calendar (Month/Week), Vault, and FAB. Total of 31 individual improvements organized into 8 logical phases.

**Design Philosophy:** Google Tasks/Keep/Calendar aesthetic - minimal, compact, professional.

**Reference Screenshots:**
- `tasks.jpg` - Google Tasks (compact task cards)
- `month.jpg` - Calendar month view (tight spacing)
- `week.jpg` - Calendar week view (efficient time grid)
- `keep1.jpg` - Google Keep (minimal card design)

---

## Phase 1: Disable Swipe Navigation (Foundation)

**Goal:** Remove swipe navigation system to simplify mobile UX and prepare for other changes.

**Addresses:**
- Item 2.j: Turn off swipe navigation
- Item 1.b: Remove page indicator (automatic when swipe disabled)

### Changes

#### 1.1 Modify ClientRootLayout
**File:** `/components/ClientRootLayout.tsx`

- Remove conditional SwipeContainer rendering
- Always render `children` directly (no swipe wrapper)
- Keep GlobalCreateManager (FAB) functionality
- Remove or disable SwipeContext provider

**Impact:**
- Removes page indicators automatically
- Removes horizontal swipe between pages
- Simplifies navigation flow
- Makes Header visible on all pages

---

## Phase 2: Home Page Cleanup

**Goal:** Simplify home page to remove redundant navigation elements and reduce vertical spacing.

**Addresses:**
- Item 1.a: Remove hamburger/Home/profile block
- Item 1.c: Change "Welcome to LifeOS" to "LifeOS"
- Item 1.d: Remove helper text

### Changes

#### 2.1 Remove Mobile Header Elements
**File:** `/app/page.tsx`

- Conditionally hide Header on mobile home page only
- OR modify Header to not show hamburger/title/profile on home route
- Keep desktop Header with nav tabs

#### 2.2 Update Welcome Section
**File:** `/app/page.tsx`

- Change "Welcome to LifeOS" + subtitle → just "LifeOS" as header
- Remove centered styling, make left-aligned
- Reduce `mb-12` (48px) → `mb-6` (24px)

#### 2.3 Remove Helper Text
**File:** `/app/page.tsx`

- Remove entire "Use the + button to..." section

#### 2.4 Adjust Card Grid Spacing
**File:** `/app/page.tsx`

- Reduce `gap-4 md:gap-6` → `gap-3` (12px uniform)
- Consider reducing outer padding

---

## Phase 3: Navigation Updates

**Goal:** Add missing pages to navigation and reduce gaps.

**Addresses:**
- Item 2.h: Reduce gap between nav and content
- Item 2.i: Add other pages to top nav bar
- Item 3.b: Put top nav bar on calendar pages

### Changes

#### 3.1 Update Header Navigation
**File:** `/components/Header.tsx`

- Desktop: Already has all pages (Home, Projects, All, Calendar, Vault, Recipes, Calendars)
- Mobile: Ensure hamburger sidebar has same pages
- Verify Calendar pages show Header (currently they have hamburger)

#### 3.2 Reduce Header Spacing
**File:** `/components/Header.tsx`

- Mobile header: Reduce `mb-4` → `mb-2` (16px → 8px)
- Desktop header: Consider reducing `mb-8` → `mb-4` (32px → 16px)

#### 3.3 Reduce Page Container Padding
**Files:** `/app/all/page.tsx`, `/app/calendar/page.tsx`, `/app/vault/page.tsx`

- All pages: `py-8` → `py-4` (32px → 16px)
- Vault: Reduce 32px outer padding → 16px

---

## Phase 4: All Page Redesign (COMPLEX)

**Goal:** Redesign task cards to be compact, clean, with inline date/time and checkboxes.

**Addresses:**
- Item 2.a: Fix mobile width issue
- Item 2.b: Remove badges, inline date/time, add checkbox
- Item 2.c: Reference tasks.jpg for cleaner design
- Item 2.d: Chronological order
- Item 2.e: Section order (In Progress → Active → Backlog → Complete)
- Item 2.f: Filter/group UI cleanup
- Item 2.g: Group by on left, filter icon on right

### Changes

#### 4.1 Fix Mobile Width Issue
**File:** `/app/all/page.tsx`

- Investigate why content extends past screen width
- Reduce padding or adjust max-width
- Test on actual device viewport

#### 4.2 Redesign Task Card Layout
**File:** `/app/all/page.tsx`

**Reference:** Google Tasks (tasks.jpg) - checkbox left, task name + inline date, star right

**New Layout:**
```
[ ] Task Name · Mon, Feb 3, 15:30        ⭐
    Mon, Feb 3 at 15:30 (if can't fit inline)
    tag1 tag2 tag3 (optional, smaller)
```

**Implementation:**
- Remove state badge next to title (Active, Backlog, etc.)
- Remove metadata badges (complexity, energy, duration)
- Show date/time inline with task name if space allows
- If not enough space, show date/time on second line
- Add checkbox on left side (currently only in expanded view)
- Optional: Add star/priority indicator on right
- Keep tags but make them smaller/optional

**Styling:**
- Simpler card: `border border-gray-200 rounded-lg p-3` (not shadow-lg)
- Reduce padding: `p-4` → `p-3`
- Title + date on same line with separator: "Task Name · Mon, Feb 3"
- Subtle text colors for secondary info

#### 4.3 Reorder Sections
**File:** `/app/all/page.tsx`

**Current:** Active → Backlog → In Progress → Completed
**New:** In Progress → Active → Backlog → Completed

- Update section rendering order in code
- Consider section header styling (smaller, less prominent)

#### 4.4 Add Chronological Sorting
**File:** `/app/all/page.tsx`

- Within each section, sort by scheduledFor date (earliest first)
- Items without dates go at end of section
- Update sort logic in filtering/grouping code

#### 4.5 Redesign Filter/Group UI
**File:** `/app/all/page.tsx`

**Current:** Large collapsible panel with many filter buttons
**New:** Compact header bar with dropdowns

**Target Layout:**
```
[Group by: State ▾]                    [🔍 Filter]
```

- Move "Group by" dropdown to left side (clean dropdown, not large button)
- Move filter icon to right (opens compact filter panel)
- Tags filter: Convert to searchable dropdown (not button pills)
- State filter: Keep as toggle pills but more compact
- Other filters: Keep as dropdowns but reduce spacing

**Styling:**
- Reduce vertical space: Less margin between filter section and tasks
- Make filter panel slide-in or popover instead of always-visible
- Compact controls: `text-sm`, less padding

#### 4.6 Update Filter Panel Spacing
**File:** `/app/all/page.tsx`

- Reduce gap between "All" button and "More Filters"
- Make "More Filters" expansion smoother
- Consider putting most filters behind "Filter" button

---

## Phase 5: Calendar Month View Improvements

**Goal:** Make month view more compact and fix navigation behaviors.

**Addresses:**
- Item 3.a: Make more compact (reference month.jpg)
- Item 3.c: Show month name instead of "day"
- Item 3.d: Clicking day should go to THAT day, not today
- Item 3.e: Clicking fiscal week should go to THAT week
- Item 3.f: Week numbers as "FW#" outside grid
- Item 3.g: Calendar should scroll, not whole screen

### Changes

#### 5.1 Make Month View More Compact
**File:** `/app/calendar/page.tsx` (lines 1982-2138)

**Reference:** month.jpg - tighter spacing, smaller text

**Styling Changes:**
- Reduce cell min-height (currently tall cells)
- Smaller date numbers: `text-2xl` → `text-lg` or `text-base`
- Reduce padding in cells: `p-2` → `p-1`
- Smaller item pills: `text-xs` → `text-[10px]`, less padding
- Tighter grid gaps if any

#### 5.2 Fix Month Header Navigation
**File:** `/app/calendar/page.tsx`

**Current:** Shows "Wednesday, February 4, 2026" with arrows
**New:** Show month name "February 2026" when in month view

- Check current view mode
- If `view === 'month'`, show format "MMMM YYYY"
- Arrows navigate to previous/next month (not day)

#### 5.3 Fix Day Clicking Behavior
**File:** `/app/calendar/page.tsx`

**Current:** Clicking any day goes to today
**Problem:** Not passing clicked date to navigation

**Fix:**
- On day click, call `handleDateChange(clickedDate)` AND switch to timeline view
- Pass actual clicked date, not `new Date()`
- Update URL: `?view=timeline&date=YYYY-MM-DD`

#### 5.4 Fix Week Number Clicking
**File:** `/app/calendar/page.tsx`

**Current:** Clicking any week goes to current week
**Problem:** Same as day clicking - not passing correct date

**Fix:**
- On week number click, calculate Monday of that week
- Call `handleDateChange(mondayOfWeek)` AND switch to week view
- Update URL: `?view=week&date=YYYY-MM-DD`

#### 5.5 Move Week Numbers Outside Grid
**File:** `/app/calendar/page.tsx`

**Current:** "Wk" column inside grid (8 columns total)
**New:** "FW#" labels outside grid (7 columns for days)

**Implementation:**
- Separate week numbers from calendar grid
- Position week numbers in absolute or separate column
- Reduce width of week number column
- Style as "FW5", "FW6" etc.

#### 5.6 Fix Horizontal Scrolling
**File:** `/app/calendar/page.tsx`

**Current:** Whole page scrolls horizontally
**Problem:** Parent container has scroll, not calendar

**Fix:**
- Calendar container: `overflow-x-auto`
- Parent containers: Remove `overflow-x-auto`
- Ensure calendar table has `min-w-fit` or fixed width
- Test on mobile: swipe should scroll calendar, not change pages

#### 5.7 Make Overdue Section Collapsible
**File:** `/app/calendar/page.tsx`

**New Feature:** Add collapsible overdue section

**Implementation:**
- Add toggle button to overdue section header
- Store collapsed state in localStorage (persist across sessions)
- When collapsed: Show "⚠️ 5 Overdue Items" with expand arrow
- When expanded: Show full list of overdue items
- Apply to all calendar views (Timeline, Compact, Schedule, Week, Month)

---

## Phase 6: Calendar Week View Improvements

**Goal:** Make week view more compact and fix scrolling/navigation.

**Addresses:**
- Item 4.a: Same scroll issue as month
- Item 4.b: Tighten up time column
- Item 4.c: Make Overdue section smaller
- Item 4.d: Show "Month FW#" in header

### Changes

#### 6.1 Fix Horizontal Scrolling
**File:** `/app/calendar/page.tsx` (lines 1854-1981)

- Same approach as month view
- Week grid should scroll, not whole page
- Apply `overflow-x-auto` to week grid container only

#### 6.2 Tighten Time Column
**File:** `/app/calendar/page.tsx`

**Reference:** week.jpg - compact time labels

**Current:** Large time labels with spacing
**New:** Smaller, tighter

- Reduce time label size: `text-sm` → `text-xs`
- Reduce time cell width
- Reduce vertical spacing between hours
- Consider showing fewer hours (only 7 AM - 9 PM if typical)

#### 6.3 Make Overdue Section Smaller & Collapsible
**File:** `/app/calendar/page.tsx`

**Current:** Large overdue section with big cards
**New:** Compact, collapsible overdue section

- Reduce card size in overdue section
- Make section header smaller: `text-lg` → `text-sm`
- Reduce padding: `p-4` → `p-2`
- **Add collapse/expand toggle** (same as 5.7)
- Show overdue count in header
- Use localStorage to persist collapsed state

#### 6.4 Fix Week Header Navigation
**File:** `/app/calendar/page.tsx`

**Current:** Shows "Wednesday, February 4, 2026"
**New:** Show "Month FW#" when in week view (e.g., "February FW5")

**Implementation:**
- Calculate fiscal week number from selected date
- Format: "MMMM FW#"
- Arrows navigate to previous/next week
- Update click handler to move by 7 days

---

## Phase 7: Vault Improvements

**Goal:** Make vault more compact like Google Keep and fix data refresh bug.

**Addresses:**
- Item 5.a: Compact design (reference keep.jpg)
- Item 5.b: Fix click behavior (verify direct click works)
- Item 5.c: New notes not showing up
- Item 5.d: Make Content field optional

### Changes

#### 7.1 Make Layout More Compact
**File:** `/app/vault/page.tsx`

**Reference:** keep1.jpg - minimal padding, tight spacing

**Styling:**
- Reduce outer container padding: `p-8` → `p-4`
- Reduce grid gap: `gap-4` → `gap-2 md:gap-3`
- Reduce card padding: `p-5` → `p-3`
- Remove or minimize card borders (rely on shadows)
- Simpler background (remove gradient, use flat color)

#### 7.2 Fix Click Behavior
**File:** `/app/vault/page.tsx`

**Current:** Already works - direct click opens modal
**Verify:** Ensure no swipe required after Phase 1 changes
**Test:** Click should open NoteForm modal immediately

#### 7.3 Fix New Notes Not Showing Up
**Files:** `/app/vault/page.tsx`, `/components/GlobalCreateManager.tsx`

**Current:** Data only fetches on mount, doesn't refresh after creation
**Problem:** GlobalCreateManager creates note but Vault doesn't know

**Recommended Fix:**
- In GlobalCreateManager, after successful note/list creation, emit event:
  `window.dispatchEvent(new Event('notes-updated'))`
- In Vault page, add listener:
  `window.addEventListener('notes-updated', loadNotes)`
- Clean up listener on unmount

#### 7.4 Make Content Field Optional
**File:** `/components/NoteForm.tsx`

**Current:** Validation requires content: `if (!content.trim()) return;`
**New:** Allow empty content

**Changes:**
- Remove content validation check
- Allow saving note with just title
- Update save button disabled state
- Verify API `/api/notes` accepts empty content

---

## Phase 8: FAB Redesign

**Goal:** Make plus button popup "sleek and professional".

**Addresses:**
- Item 6.a: Clean up plus button popup

### Changes

#### 8.1 Redesign FAB Popup
**File:** `/components/FAB.tsx`

**Current:** Vertical stack of pill buttons with emojis
**New:** Clean, modern popup

**Recommended Design:**
```
┌─────────────────┐
│ ✓ Task          │
│ ↻ Habit         │
│ ⏰ Reminder      │
│ 📝 Note          │
│ 📋 List          │
└─────────────────┘
```

**Implementation:**
- Replace emoji icons with Lucide React icons
- Cleaner typography: `text-sm font-medium`
- Remove color backgrounds (use monochrome with color accents)
- Add subtle animations (fade + slide up entrance)
- Better spacing: `gap-2` instead of `gap-3`
- Shadow: `shadow-lg` with blur
- Consider backdrop blur: `backdrop-blur-sm`

**Styling Example:**
```tsx
className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50
           rounded-lg shadow-md hover:shadow-lg transition-all duration-200
           text-gray-700 hover:text-gray-900"
```

**Dependencies:**
- Install `lucide-react` if not already installed

---

## Implementation Order

**Recommended Sequence:**

1. **Phase 1** (Disable Swipe) - 30 min - Foundation, affects all other pages
2. **Phase 2** (Home Page) - 30 min - Quick wins, visible improvement
3. **Phase 3** (Navigation) - 1 hour - Affects all pages, good to do early
4. **Phase 8** (FAB) - 1 hour - Quick win, independent of other work
5. **Phase 7** (Vault) - 1-2 hours - Medium complexity, independent
6. **Phase 4** (All Page) - 3-4 hours - Complex, can take time
7. **Phase 5** (Month View) - 2-3 hours - Complex, calendar-specific
8. **Phase 6** (Week View) - 2 hours - Complex, calendar-specific

**Total:** 11-14 hours

---

## Critical Files Summary

### Core Navigation
- `/components/ClientRootLayout.tsx` - Swipe disable
- `/components/Header.tsx` - Nav bar updates
- `/components/Sidebar.tsx` - Mobile menu

### Pages
- `/app/page.tsx` - Home page cleanup
- `/app/all/page.tsx` - Task list redesign (MAJOR CHANGES)
- `/app/calendar/page.tsx` - Calendar views (MAJOR CHANGES)
- `/app/vault/page.tsx` - Vault compact design

### Components
- `/components/FAB.tsx` - Plus button redesign
- `/components/NoteForm.tsx` - Content validation
- `/components/GlobalCreateManager.tsx` - Event emission
- `/components/DraggableTaskCard.tsx` - May need updates

### Potentially New Components
- `CompactTaskCard.tsx` - New task card design
- `FilterBar.tsx` - Compact filter UI

---

## Testing Strategy

After each phase:

1. **Visual Testing:**
   - Mobile viewport (375px width)
   - Desktop viewport (1920px width)
   - Test all affected pages

2. **Functional Testing:**
   - Navigation works (clicks go to correct pages)
   - Data displays correctly
   - Forms save successfully
   - Filters/groups apply correctly

3. **Interaction Testing:**
   - Scrolling works correctly (calendar scrolls, not whole page)
   - Clicking dates navigates to correct day/week
   - Checkboxes toggle completion
   - FAB opens and creates items

4. **Responsive Testing:**
   - No horizontal overflow on mobile
   - All content fits on screen
   - Touch targets are adequate size

---

## Success Criteria

When all phases complete:

✅ Home page is clean without redundant navigation
✅ Swipe navigation disabled, all pages use standard nav
✅ All page shows compact task cards with inline dates and checkboxes
✅ Calendar month view is compact, navigation works correctly
✅ Calendar week view is compact with working navigation
✅ Vault is compact like Google Keep, new notes appear immediately
✅ FAB popup is sleek and professional
✅ No horizontal scrolling issues on mobile
✅ Overall design feels clean, minimal, and professional
✅ Mobile and desktop both work well

---

## Next Steps

1. Review this plan
2. Start with Phase 1 (disable swipe) to establish foundation
3. Work through phases sequentially or tackle quick wins first
4. Test thoroughly after each phase
5. Commit changes incrementally

**Ready to start when you are!**
