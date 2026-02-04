# Next Session - Start Here

**Last Updated:** February 4, 2026
**Current Status:** Phase 3.5 COMPLETE ✅ - Ready for Phase 4 or Polish
**Branch:** feature/phase-3.5-home-dashboard (3 commits, not pushed yet)
**Production:** <https://lifeos-dev.foster-home.net> (PM2 on port 3002)

---

## 🎯 NEXT UP: Phase 4 (Recipes) or Polish Phase 3.5

**Options:**

1. Continue with Phase 4 - Recipe Management (per implementation plan)
2. Polish Phase 3.5 - UI tweaks, mobile refinements, testing
3. Push Phase 3.5 to remote and deploy

---

## ✅ COMPLETED: Phase 3.5.3 - Calendar View Switcher (Feb 4, 2026)

**Implemented unified calendar system with 5 views:**

1. **Timeline** (existing) - Hourly grid for single day
2. **Compact** (existing) - Single day, collapsed empty space
3. **Schedule** (NEW) - 14-day vertical list with date circles
4. **Week** (NEW) - 7-day grid (Mon-Sun), 6 AM-11 PM
5. **Month** (NEW) - Calendar grid with pill badges

**View Switcher:**

- ✅ Hamburger menu (☰) replaces old Timeline/Compact toggle
- ✅ Slide-in sidebar with radio-style view selection
- ✅ Date picker and "Go to Today" button included
- ✅ URL routing: `/calendar?view=month&date=2026-02-04`
- ✅ localStorage persistence (last-used view)
- ✅ Default: Timeline (desktop), Compact (mobile)

**View Features:**

- ✅ Schedule: 14 days forward, week dividers, colored cards with times
- ✅ Week: Monday start, clickable day headers → navigate to day
- ✅ Month: ISO week numbers (clickable → open week view), pill badges with times
- ✅ All views maintain overdue (top) and scheduledNoTime (bottom) sections
- ✅ Color-coded pills: Habits (purple), Tasks (orange), Reminders (yellow), Events (green)

**Mobile Fixes:**

- ✅ Removed `overflow-x-hidden` from main container
- ✅ Added `overflow-x-auto` to Week and Month views
- ✅ Horizontal scrolling works on mobile
- ✅ Week numbers column in Month view (8 columns total)

**Files Changed:**

- `app/calendar/page.tsx` - Added 3 new views, hamburger button, helper functions
- `components/ViewSwitcherSidebar.tsx` - New sidebar component

**Git Status:**

- Commit 1: Phase 3.5.1 (Home Dashboard)
- Commit 2: Phase 3.5.2 (Route Renames)
- Commit 3: Phase 3.5.3 (Calendar Views + Mobile Fixes)

---

### What Just Happened (Feb 4 Morning Session)

**Phase 3.5.1 - Home Dashboard ✅ COMPLETE:**

- ✅ Created new home dashboard at `/` with 6 navigation cards
- ✅ Moved Today view from `app/page.tsx` to `app/calendar/page.tsx`
- ✅ Added placeholder pages for Projects and Recipes with "Coming Soon" badges
- ✅ Updated Header and Sidebar with new navigation structure
- ✅ Text-based navigation (no emoji icons per user request)
- ✅ Responsive grid layout: 2 cols mobile, 3 cols desktop
- ✅ Updated calendar routing from `/?date=` to `/calendar?date=`
- ✅ Fixed PM2 port configuration issue (was on 3001, now on 3002)

**Phase 3.5.2 - URL Route Renames ✅ COMPLETE:**

- ✅ Renamed `app/tasks/` → `app/all/`
- ✅ Renamed `app/lists/` → `app/vault/`
- ✅ Updated all navigation links (Header, Sidebar, Home dashboard)
- ✅ Updated ClientRootLayout swipe routes
- ✅ Updated router.push calls in vault pages
- ✅ Maintained backward compatibility in route detection
- ✅ Build and deployment successful

**Current State:**

- Home dashboard is live and working
- All routes renamed and functional
- Navigation structure complete
- Both phases committed to feature branch (not pushed to remote yet)

**Git Status:**

```
Branch: feature/phase-3.5-home-dashboard
Commits: 2 (Phase 3.5.1 and 3.5.2)
Status: Ready to push (authentication needed)
```

---

## 🚀 What to Build Next: Phase 3.5.3

### What Just Happened (Feb 3 Evening Session)

**Planning & Vision Cleanup:**

- ✅ Reviewed all planning documents vs. actual codebase
- ✅ Identified disconnect: vision docs described much bigger system than what's built
- ✅ Clarified actual product goals with Tyrrell
- ✅ Created NEW simplified vision doc (v3.0)
- ✅ Created NEW focused implementation plan (v3.0)
- ✅ Archived old planning docs for reference
- ✅ Fixed data models: Projects, Recipes, RecipeIngredients, RecipeInstructions

**Key Decisions:**

- ✅ LifeOS is NOT Notion (focused on todo + calendar + AI + meal planning)
- ✅ Home dashboard with 5-6 navigation cards (not widgets)
- ✅ Habits/Reminders stay in "All" view (no separate pages)
- ✅ Focus/Deep mode is future enhancement (not core requirement)
- ✅ Keep it simple - do a few things well

**Documents Updated:**

- `docs/notes/lifeos-vision.md` (v3.0) - Simplified, focused vision
- `docs/notes/lifeos-implementation-plan.md` (v3.0) - Actionable roadmap
- Moved old plans to `docs/archive/`

---

## 🚀 What to Build Next: Phase 3.5

### Goal

Replace single-page app with home dashboard navigation structure and add Month calendar view.

### Sub-Phases

#### 3.5.1 Home Dashboard (1-2 days)

**Create `/` as landing page with 6 navigation cards:**

```
┌─────────────────────────────────┐
│         LifeOS Home             │
├─────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐    │
│  │ Projects │  │   All    │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │ Calendar │  │  Vault   │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │ Recipes  │  │   Docs   │    │
│  └──────────┘  └──────────┘    │
│      (soon)      (future)       │
│                                 │
│  [Quick Action Button]          │
└─────────────────────────────────┘
```

**Tasks:**

- [ ] Create new `/` route with card grid component
- [ ] Card component: icon, title, optional badge (e.g., "5 active tasks")
- [ ] Grid layout: 2 cols mobile, 3 cols desktop
- [ ] Recipes card shows "Coming Soon" state
- [ ] Docs card shows "Future" or grayed out state
- [ ] Quick Action FAB works from home page
- [ ] Home button/logo always accessible

**Technical Notes:**

- Don't build widgets/previews yet - just navigation cards
- Cards can show counts later (Phase 8 polish)
- Keep it simple for now

---

#### 3.5.2 Update Navigation & Routing (1 day)

**Reorganize URL structure:**

**Old Routes:**

- `/` → Today view
- `/week` → Week view
- `/tasks` → All tasks
- `/lists` → Notes & Lists
- `/settings/calendars` → Calendar settings

**New Routes:**

- `/` → **Home Dashboard** ⭐ NEW
- `/calendar` → Calendar views (Day/Week/Month) - move Today here
- `/all` → All tasks/habits/reminders (rename from /tasks)
- `/projects` → Projects page ⭐ NEW (placeholder for Phase 5)
- `/vault` → Notes & Lists (rename from /lists)
- `/recipes` → Recipes ⭐ NEW (placeholder/"Coming Soon" for Phase 4)
- `/settings/calendars` → Keep as-is

**Tasks:**

- [ ] Create `/calendar` route, move Today view code there
- [ ] Rename `/tasks` → `/all`
- [ ] Rename `/lists` → `/vault`
- [ ] Create placeholder `/projects` page (simple "Projects - Coming in Phase 5" message)
- [ ] Create placeholder `/recipes` page (simple "Recipes - Coming in Phase 4" message)
- [ ] Update Header component navigation links
- [ ] Update Sidebar component menu items
- [ ] Test all deep links still work
- [ ] Update any hardcoded navigation URLs in components

**Header/Sidebar Menu Items (Desktop & Mobile):**

```
Home → Projects → All → Calendar → Vault → Recipes → Calendars
```

---

#### 3.5.3 Calendar Enhancements (2-3 days)

**Add Month view and improve calendar navigation**

**Month View:**

- [ ] Calendar grid component (7 columns × 4-6 rows)
- [ ] Show items as dots or mini-cards on dates
- [ ] Click date → navigate to Day view for that date
- [ ] Visual distinction for different item types
- [ ] Overdue items marked clearly (red indicator)
- [ ] Responsive grid layout (mobile vs desktop)

**Calendar Navigation:**

- [ ] View switcher: Day | Week | Month (tabs or dropdown)
- [ ] Date picker for quick navigation
- [ ] "Today" button to return to current date
- [ ] URL state for selected date and view type (e.g., `/calendar?view=month&date=2026-02-15`)
- [ ] Preserve view preference in localStorage (optional)

**Calendar Route Structure:**

- `/calendar` → Default to Day view, today's date
- `/calendar?view=day&date=2026-02-03` → Day view for specific date
- `/calendar?view=week&date=2026-02-03` → Week view starting that date
- `/calendar?view=month&date=2026-02-03` → Month view for that month

**Technical:**

- Shared data fetching for all calendar views
- Month view needs to fetch entire month's items
- Optimize queries (don't fetch too much at once)
- Consider caching frequently accessed dates

---

### Phase 3.5 Success Criteria

**When to consider Phase 3.5 complete:**

- ✅ Home dashboard is the landing page
- ✅ All 6 main areas are accessible from home
- ✅ Navigation feels intuitive (< 2 clicks to any area)
- ✅ URL structure is logical and shareable
- ✅ Month view displays items correctly
- ✅ Calendar view switcher works smoothly
- ✅ Mobile and desktop both work well
- ✅ No confusion about where to find things

**Total Effort:** 4-6 days

---

## Current Codebase State

### What's Working (Phase 3 Complete ✅)

- Task management (Items: tasks/habits/reminders in one table)
- States: backlog, active, in_progress, completed
- Calendar views: Day (timeline), Week
- Drag-and-drop scheduling
- Overdue persistence (Phase 3.10)
- Parent/child tasks
- Project association (projectId field)
- Notes & Lists
- ResearchClips (URL bookmarks)
- Google Calendar sync
- Multi-user auth + families
- PWA, mobile-responsive

### Database Models Exist (UI Not Built)

- **Projects** - Need to add: start_date, priority, color fields via migration
- **Notes** - Working, accessible via /lists (will become /vault)
- **Lists/ListItems** - Working, accessible via /lists (will become /vault)

### Not in Database Yet

- Recipes (Phase 4)
- RecipeIngredients (Phase 4)
- RecipeInstructions (Phase 4)
- MealPlans (Phase 4)
- Documents (Phase 7)

---

## Data Model Reference

### Projects (Needs Migration Before Phase 5)

**Current fields:**

- id, userId, name, description, status, blockedBy, targetDate, tags

**Need to add:**

- start_date (DateTime, nullable)
- priority (String, nullable)
- color (String, nullable)

### Recipes (Phase 4 - Full Schema)

See `lifeos-implementation-plan.md` Phase 4.1 for complete Prisma schema including:

- Recipe (with notes field)
- RecipeIngredient (with notes field)
- RecipeInstruction (separate table for numbered steps)
- MealPlan (with userId, recipeId, mealNameOverride)

---

## Important Files to Know

### Navigation Components

- `components/Header.tsx` - Desktop nav bar, mobile compact header
- `components/Sidebar.tsx` - Mobile hamburger menu
- `app/layout.tsx` - Root layout wrapper

### Current Routes

- `app/page.tsx` - Today view (will become home dashboard)
- `app/week/page.tsx` - Week view (will move to /calendar)
- `app/tasks/page.tsx` - All tasks (will become /all)
- `app/lists/page.tsx` - Notes & Lists (will become /vault)
- `app/lists/[id]/page.tsx` - Individual list view

### Components

- `components/FAB.tsx` - Quick Action floating button
- `components/TaskForm.tsx` - Task creation/edit modal
- `components/DraggableTaskCard.tsx` - Drag-and-drop task cards
- `components/BacklogSidebar.tsx` - Backlog drop zone

---

## Tips for Next Session

### Starting Phase 3.5.1 (Home Dashboard)

1. **Create branch:**

   ```bash
   git checkout -b feature/phase-3.5-home-dashboard
   ```

2. **Read current home page:**
   - `app/page.tsx` is currently the Today view
   - We'll move this to `app/calendar/page.tsx`
   - Replace `app/page.tsx` with new home dashboard

3. **Build home dashboard component:**
   - Keep it simple: just cards with icons and titles
   - No counts/widgets for now (Phase 8)
   - Use Tailwind grid layout
   - Reuse existing navigation patterns

4. **Test on mobile early:**
   - 2-column grid on mobile
   - Large tap targets
   - PWA still works

### Quick Wins

- Copy existing card patterns from UI
- Icons can be emoji for now (🎯 📅 📋 🍽️ 📖)
- Don't overthink it - get navigation working first
- Polish later in Phase 8

---

## Architecture Decisions to Remember

**From decisions.md:**

- ADR-012: 4-state model (backlog, active, in_progress, completed)
- ADR-013: Overdue persistence (isOverdue flag)
- ADR-007: Mobile-first visual simplification

**What LifeOS IS:**

- Todo app + calendar + AI assistance + meal planning
- Private, self-hosted
- Simple over complex

**What LifeOS is NOT:**

- Not Notion (no wiki/collaboration)
- Not endless customization
- Not trying to replace every app

---

## Questions? Check These Docs

- **Vision:** `docs/notes/lifeos-vision.md` (v3.0)
- **Implementation Plan:** `docs/notes/lifeos-implementation-plan.md` (v3.0)
- **Decisions:** `docs/notes/decisions.md`
- **Key Facts:** `docs/notes/key_facts.md`
- **Bugs:** `docs/notes/bugs.md`

---

**Ready to build?** Start with Phase 3.5.1 - Home Dashboard!
