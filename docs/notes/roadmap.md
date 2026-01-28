# Life OS - Feature Roadmap & Vision

**Last Updated:** January 25, 2026

## Core Philosophy
Life OS is a family productivity hub focused on practical daily coordination - tasks, meals, schedules, and family communication. Built to solve real family needs first, with potential to scale to friends and beyond.

---

## ✅ Completed Features

### Core Task Management
- **Smart Lists with Metadata** ✅
  - Priority levels (high/medium/low)
  - Effort estimates (easy/medium/hard)
  - Duration tracking (15min through 2+ weeks)
  - Focus levels (deep/light/background)
  - Smart filtering by any combination

- **Unified Item Model** ✅
  - Tasks, Habits, Reminders in single table
  - Sub-items/sub-tasks support
  - Completion tracking (one-time and recurring)
  - Parent-child relationships

- **Calendar Integration** ✅
  - Google Calendar sync (read-only)
  - Event display on Today/Week views
  - Calendar color coding
  - Event detail modal

- **Multi-View Interface** ✅
  - Today view (date navigation)
  - Week view (7-day grid)
  - Lists view (smart filtering)
  - Calendar view (basic)

### Technical Foundation
- **Next.js 16 + TypeScript** ✅
- **PostgreSQL with Prisma ORM** ✅
- **NextAuth with Google OAuth** ✅
- **Multi-user database schema** ✅ (exists, not fully utilized yet)
- **Production deployment on foster-forge** ✅ (PM2 process manager)

---

## 🎯 Current Roadmap: Mobile-First Enhancement Plan

**Goal:** Make LifeOS fully mobile-ready and usable for daily family coordination.

### Phase 1: Duration Options ✅ COMPLETE (Jan 25, 2026)

**Changes:**
- Updated duration dropdown from vague (Quick/Medium/Long) to specific time values
- New options: 15min, 30min, 1hr, 1-2hrs, 2-4hrs, 4-8hrs, 1-3days, 4-7days, 1-2weeks, 2+weeks
- Applied to: Today view, Week view, Lists view (smart filters)

**Testing:**
- ✅ Can create tasks with new duration options
- ✅ Smart list filtering works with new durations
- ✅ Duration displays correctly on task cards

---

### Phase 2: Mobile Responsive Fixes ✅ COMPLETE (Jan 26-28, 2026)

**Status:** Mobile and desktop UI has been further optimized for responsive design

**Completed:**

**A. PWA Foundation** ✅
- manifest.json with standalone mode
- Purple theme (#9333ea)
- App icons (192x192, 512x512)
- Viewport meta tags
- Works on mobile and desktop

**B. Hamburger Navigation** ✅
- Slide-out sidebar with Today/Week/Lists/Calendars/Sign Out
- Compact mobile header (☰ + title + profile)
- Sticky positioning
- Desktop unchanged (exposed nav tabs)

**C. Visual Cleanup & UX Improvements** ✅ (Jan 28, 2026)
- **Priority indicators simplified:**
  - High: Red exclamation mark (!)
  - Medium: Nothing displayed
  - Low: Gray dash (-)
- **Checkbox styling unified:**
  - Always gray, regardless of priority
  - Completed items: gray filled with white checkmark
- **Removed visual clutter:**
  - Category icons (🎯, ✅, 🔔, 📅) removed from tasks/events
  - Type badges ("Task", "Event", "Habit") removed
  - Edit buttons removed - items now clickable to open
- **Recurring icon repositioned:**
  - Moved inline to the right of item name
- **Completed task reordering:**
  - Completed items automatically move to bottom of list
  - Applies to both one-time and recurring tasks
- **Navigation improvements:**
  - Desktop: Full nav buttons restored (Today/Week/Lists/Calendars)
  - Desktop: Filter button added to nav bar (right of Calendars)
  - Mobile: Filter button in header (left of profile icon)
  - Week view: Day headers clickable to navigate to day detail
  - Week view: Inline navigation (← date → matching Today view)
  - Week view: Removed duplicate "Week View" heading
- **Metadata display logic:**
  - Effort/duration/focus metadata shown on desktop
  - Hidden on mobile to reduce clutter

**D. Today View Mobile Optimization** ✅
- Compact date navigation (← date → on mobile)
- Removed "Today" heading on mobile
- Reduced text sizes (~30% smaller)
- Tighter spacing (p-3 vs p-8)
- FAB positioned bottom-4 right-4

**E. Overflow Prevention** ✅
- Added overflow-x-hidden to container
- Removed horizontal scroll issues

---

### Phase 2.5: Advanced Scheduling & Recurring Tasks (Next Up)

**Goal:** Enhanced scheduling capabilities and complex recurring patterns

**Planned Features:**

**A. Schedule View**
- Timeline/day-planner view with hourly slots
- Visual representation of time blocks
- Drag-and-drop time scheduling
- "Schedule for later" functionality
- Time conflict detection

**B. Complex Recurring Patterns**
- Weekly patterns (specific days: Mon, Wed, Fri)
- Monthly patterns (1st/2nd/3rd weekday, specific dates)
- Custom intervals (every X days/weeks)
- Recurring exceptions (skip specific dates)
- End conditions (after X occurrences, by date, or never)

**C. Recurring Task Management**
- Better visualization of recurring series
- Edit single instance vs. all future
- History of completed recurring instances
- "Skip this instance" without deleting

**Notes:**
- Branch from master for this work
- Keep Phase 1 visual cleanup separate
- Consider UI/UX for mobile vs desktop

---

### Phase 3: Calendar View Improvements (2-3 Weeks)

**A. Week View - Time Slots**
- Add time column (12am - 11pm)
- Position events at actual times
- All-day events at top
- Google Calendar style layout

**B. Month View (NEW)**
- Calendar grid (7 cols x 5-6 rows)
- Events as colored bars
- Event count for multiple events
- Click day → detail modal
- Prev/next month navigation

**C. Custom Duration Views**
- Next 3 days
- Next 7 days
- Work week (Mon-Fri)
- Next 5 days
- Dropdown or button group selector

---

### Phase 4: Task Sharing with Wife (3-4 Weeks)

**A. User Model & Database Schema**
- User model updates (already exists, needs enhancement)
- Task model: `assignedToId`, `assignedById` (nullable)
- List model: `sharedWith` (array of user IDs)
- Prisma migrations

**B. Task Assignment UI**
- "Assign to" dropdown: Me / Wife / Both / Unassigned
- Filter options: My Tasks / Wife's Tasks / Shared / All
- Visual indicator for assigned tasks
- Show who assigned in detail view

**C. Shared Lists**
- "Share with" option on lists
- Grocery list defaults to shared
- Visual indicator for shared lists
- Both users can edit

**D. Multi-User Authentication**
- Update NextAuth for two users
- Keep Google OAuth OR add email/password
- Session tracks current user
- Queries filter by user (unless shared)

**Testing Checklist:**
- [ ] Can assign tasks to wife
- [ ] She can see assigned tasks when logged in
- [ ] Shared lists visible to both users
- [ ] Filters work correctly

---

### Phase 5: Meal Planning Foundation (4-6 Weeks)

**A. Recipe Storage**
- Recipe model: name, ingredients, instructions, notes
- Recipe library/collection
- Search and filter recipes
- Tag/categorize recipes

**B. Meal Calendar**
- Weekly meal planning view
- Drag-and-drop recipes to days
- Quick "what's for dinner" lookup
- Meal history tracking

**C. Grocery List Integration**
- Generate grocery list from planned meals
- Combine with manual items
- Auto-categorize ingredients
- Mark items as purchased

---

### Phase 6: Voice Input & Smart Reminders (6-8 Weeks)

**A. Voice Integration (Whisper Backend)**
- Record button in web UI
- Voice → Whisper transcription (foster-forge)
- AI cleanup of messy voice input
- Parse: task name, priority, list type, due date
- Works while cooking, driving, or busy

**B. Smart Reminder System**
- Python service with systemd timer
- Check database every 5-15 minutes
- Multiple notification channels:
  - Email (immediate)
  - Push notification (PWA)
  - Optional: SMS, Telegram/Discord
- Reminder types:
  - Time-based: "Remind me at 3pm"
  - Recurring: "Every Sunday at 10am"
  - Context-aware: "When I have 30+ min free"

---

## 🔮 Future Vision (Phase 7+)

### AI-Powered Intelligence

**Schedule Optimization:**
- "Leave 10 minutes early tomorrow - rain expected"
- "You have 30 minutes before your next meeting - here's a quick task"
- "Traffic is bad, consider rescheduling that 5pm errand"

**Meal Planning AI:**
- "What can I cook with [ingredients]?"
- "You have chicken thawing and 45 minutes tonight - here are 3 recipes"
- "Based on this week's schedule, here's a meal plan"
- Recipe substitutions/modifications
- Meal suggestions based on schedule/preferences

**Task Intelligence:**
- "What should I do right now?" (considers: time, energy, priorities)
- "What should I tackle after work?" (based on evening schedule)
- Suggest tasks based on:
  - Time available
  - Energy level patterns (learn productivity rhythms)
  - Weather (outdoor tasks)
  - Location (errands near you)
  - Dependencies (what's blocking other tasks)

**Proactive Notifications:**
- "You wanted to meal prep on Sundays - here's your reminder"
- "You haven't completed X habit in 3 days"
- "This task has been pending for a week and is marked high priority"

### Recipe Cooking Assistant

**Active Cooking Mode:**
- Recipe display optimized for cooking
- Real-time note-taking during cooking
- Voice input for notes ("add more garlic next time")
- Modification history (what worked, what didn't)
- Timer integration
- Hands-free navigation

### Family Coordination Features

**Communication Hub:**
- Quick family notes/announcements
- Shared photos for family moments
- Important document storage (warranties, papers)
- Message board for household info

**Chore & Task Management:**
- Chore assignment/rotation
- "Who's getting what" for shared shopping lists
- Location-based task handoff
- Family calendar coordination

### Location-Based Features

**Smart Reminders:**
- "Pick up milk" reminder when near grocery store
- Suggest errands based on current location
- Smart grouping of errands by proximity
- Route optimization for multiple stops

### Mobile Strategy Evolution

**Phase 1: PWA (Current Plan)**
- Works on all devices
- Offline capability
- Push notifications
- Single codebase
- "Add to Home Screen" functionality

**Phase 2: Quick Access Bridge (Optional)**
- Telegram or Discord bot for quick capture
- Voice message → Whisper → LifeOS database
- Text message parsing → auto-add items
- Full management still via web UI

**Phase 3: Native Apps (If Needed)**
- Only if PWA limitations become blocking
- Better push notifications
- App store presence
- Enhanced offline performance
- Better OS integration

### Additional Feature Ideas

**Template System:**
- Template tasks/routines (morning routine, bedtime routine)
- Weekly planning templates
- Meal plan templates
- Recurring project patterns

**Gamification (Maybe):**
- Habit streaks
- Achievement badges
- Progress visualization
- Family challenges

**Smart Home Integration (Future):**
- Control basics (lights, thermostat)
- Integration with routine automation
- "Leaving home" / "Coming home" routines
- Device-triggered reminders

**Wall Kiosk View:**
- Large screen optimized layout
- Family dashboard display
- Shared calendar + upcoming tasks
- At-a-glance daily view
- Touch-free voice control

**Social Features:**
- Extend beyond family to friends
- Shared grocery runs
- Event planning with others
- Recipe sharing
- Group meal coordination

---

## 🚫 Explicitly NOT Prioritizing

These are out of scope for now (but could revisit later):

- ~~Financial tracking/budgeting~~
- ~~Wellness/health tracking~~ (basic habits cover this)
- ~~Home maintenance schedules~~ (will live in tasks/reminders)
- ~~Kid-specific features~~ (chore charts, allowances)
- ~~Detailed analytics/insights~~ (beyond basic AI suggestions)
- ~~Medication tracking module~~ (not a current family need)
- ~~Custom Android OS~~ (too large scope)

---

## 🔧 Technical Decisions & Open Questions

### Decided

✅ **Mobile Strategy:** PWA first, evaluate native apps later
✅ **Voice Input:** Whisper (local, open source, private)
✅ **Reminder System:** Python service + systemd timer
✅ **Multi-User:** Database schema exists, implement UI in Phase 4
✅ **Deployment:** foster-forge with PM2

### Still Open

❓ **AI Provider:** Continue with Claude? Cost implications at scale?
❓ **File Storage:** Where do photos/documents live? (Need cloud storage?)
❓ **Push Notifications:** Firebase? OneSignal? Native only?
❓ **Voice Service:** Whisper only or add Web Speech API fallback?
❓ **Scaling Architecture:** When to think about multi-tenant beyond family?

---

## 💡 Design Principles

### From Research & Experience

1. **Voice First, Not Voice Also**
   - Design assuming voice input is primary
   - Text input is backup, not default

2. **Allow Messy, Organize Later**
   - Capture workflow should be frictionless
   - AI cleans up afterwards
   - Don't force structure during capture

3. **Proactive, Not Passive**
   - Dashboard for management
   - Notifications for action
   - AI suggests, doesn't just wait to be asked

4. **Mobile Input, Web Management**
   - Quick capture anywhere (mobile)
   - Full features on big screen (web)
   - Sync seamlessly

5. **Local Where Possible**
   - Whisper on our server (privacy)
   - Data in our database (control)
   - Cloud APIs only when necessary

6. **Build Incrementally**
   - PWA before native apps
   - Voice input before AI intelligence
   - Core features before advanced automation

7. **Do Things Right Over Easy**
   - Don't cut corners to save time
   - Add error handling when things break, not upfront
   - Technical debt is okay if it's documented

---

## 📅 Review Schedule

- **Weekly:** Progress check during active development
- **Monthly:** Reprioritize phases based on usage/feedback
- **Quarterly:** Revisit long-term vision and technical decisions

**Next Review:** After Phase 2 completion (mobile responsive) or when hitting blockers

---

**This is a living document - add ideas as they come!**
