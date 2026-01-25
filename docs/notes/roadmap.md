# Life OS - Feature Roadmap & Vision

**Last Updated:** November 14, 2025

## Core Philosophy
Life OS is a family productivity hub focused on practical daily coordination - tasks, meals, schedules, and family communication. Built to solve real family needs first, with potential to scale to friends and beyond.

---

## Priority Features

### Push Notifications
- Task/habit reminders
- Shared list updates (someone added to grocery list)
- Calendar event alerts
- Time-to-leave notifications (AI-driven, traffic/weather aware)

### Smart Lists & Tasks
**The Problem:** Google Keep is too simple. Need priority + effort for smart filtering.

**Key Features:**
- Priority levels (high/medium/low)
- Effort estimates (quick/medium/long OR time-based)
- Quick filters: "Show me easy tasks I can do in 1 hour"
- List types:
  - General todo
  - Grocery/shopping
  - Custom lists as needed
- Shared lists with real-time sync
- Who can see/edit what

**Multi-User Support:**
- Wife can add items
- Extended family/friends (future consideration)
- Permissions system (who can add/complete/delete)

### Calendar Integration
- Sync with existing Google Calendar(s)
- Shared family calendars
- Color coding by person
- Integration with AI for schedule optimization

### Recipe & Meal Planning
**The Vision:** More than just recipe storage - active cooking assistant

**Features:**
- Recipe storage with notes
- Cooking mode with real-time note-taking
- AI integration:
  - "What can I make with these ingredients?"
  - Recipe substitutions/modifications
  - Meal suggestions based on schedule/preferences
  - Grocery list generation from recipes
- Modification history (what worked, what didn't)

### Voice Integration
**Use Cases:**
- "Add milk to grocery list" (hands-free while cooking)
- "Mark habit complete" 
- "What's on my list for today?"
- "What should I do next?"
- Works while driving, cooking, or busy

### AI-Powered Intelligence
**Smart Suggestions & Insights:**

**Schedule Optimization:**
- "Leave 10 minutes early tomorrow - rain expected"
- "You have 30 minutes before your next meeting - here's a quick task"
- "Traffic is bad, consider rescheduling that 5pm errand"

**Meal Planning:**
- "What can I cook with [ingredients]?"
- "You have chicken thawing and 45 minutes tonight - here are 3 recipes"
- "Based on this week's schedule, here's a meal plan"

**Task Intelligence:**
- "What should I do right now?" (context: time available, energy, priorities)
- "What should I tackle after work?" (based on evening schedule)
- Suggest tasks based on:
  - Time available
  - Energy level patterns (learn when you're most productive)
  - Weather (outdoor tasks)
  - Location (errands near you)
  - Dependencies (what's blocking other tasks)

**Proactive Notifications:**
- "You wanted to meal prep on Sundays - here's your reminder"
- "You haven't completed X habit in 3 days"
- "This task has been pending for a week"

### Mobile & Accessibility
**Must Work:**
- On phone (primary interface)
- Away from home
- Offline capability (sync when back online)
- Fast, responsive UI

---

## Additional Features to Consider

### Family Coordination
- Shared shopping lists with "who's getting what" indicators
- Chore assignment/rotation
- Family message board for quick notes
- Photo sharing for family moments
- Document storage (important papers, warranties, etc.)

### Communication Hub
- Quick family notes/announcements
- Shared photos
- Important document storage

### Location-Based Features
- "Pick up milk" reminder when near grocery store
- Suggest errands based on current location
- Smart grouping of errands by location

### Smart Home Integration (Future)
- Control basics (lights, thermostat)
- Integration with routine automation
- "Leaving home" routines

---

## Technical Considerations

### Scalability Architecture
**Current Scope:** Family + a few friends  
**Future Possibility:** "Going big"

**Planning Ahead:**
- Multi-tenant architecture from the start
- Proper permission/sharing model
- Data isolation between families/groups
- Invitation system for adding users

### Mobile Strategy
**Decision Needed:**
- Progressive Web App (PWA) - works on all devices, easier to maintain
- Native apps (iOS/Android) - better performance, more features
- Hybrid approach - PWA first, native later if needed

**Requirements:**
- Offline-first architecture
- Push notifications (requires service worker or native)
- Fast, app-like experience

### AI Implementation
**Key Questions:**
- Where does AI processing happen? (Claude API, local, hybrid?)
- Cost management (you're cost-conscious)
- Privacy considerations with family data
- Which AI features are priority vs nice-to-have?

**Cost Considerations:**
- Per-request API costs
- Caching strategies for common queries
- Local processing where possible
- Usage limits/quotas if scaling to others

### Data & Sharing Model
**Current:** Single-user OAuth with Google  
**Needed:**
- Multi-user per household
- Shared vs private items
- Permission levels
- Family/group concept
- Invitation system

---

## Features Explicitly NOT Prioritizing (For Now)

- ~~Financial tracking/budgeting~~
- ~~Wellness/health tracking~~ (habits cover this for now)
- ~~Home maintenance schedules~~ (will live in tasks/reminders)
- ~~Kid-specific features~~ (chore charts, allowances, etc.)
- ~~Detailed analytics/insights~~ (beyond basic AI suggestions)

---

## Open Questions & Decisions Needed

1. **Mobile Strategy:** PWA vs Native? When?
2. **AI Provider:** Continue with Claude? Cost implications at scale?
3. **File Storage:** Where do photos/documents live? (Cloud storage needed)
4. **Push Notifications:** What infrastructure? (Firebase? OneSignal? Native?)
5. **Multi-user Architecture:** When to build this in? (Phase 5 or later?)
6. **Voice Integration:** Which service? (Google Assistant? Custom? Device-specific?)

---

## Phase Planning Ideas

### Phase 5 (Current Priority)
- Refine current Item model
- Add basic task completion flows
- Improve UI/UX for existing features

### Phase 6-7 (Near Term)
- Multi-user support
- Shared lists
- Basic calendar integration
- Mobile optimization

### Phase 8+ (Future)
- Recipe system
- AI integration
- Voice commands
- Advanced notifications
- Location-based features

---

## Notes & Ideas Parking Lot

*Add random ideas here as they come up*

- Consider integrations with existing tools (Google Keep import?)
- Apple Watch integration for quick task completion?
- Alexa/Google Home integration for voice?
- Weekly planning view (Sunday planning session feature?)
- Template tasks/routines (morning routine, bedtime routine)
- Gamification for habits? (streaks, achievements)

---

## AI Features - Deep Dive

### Conversational AI Assistant
**"Hey, what should I do right now?"**

AI considers:
- Current time and upcoming calendar events
- Available time window
- Historical productivity patterns (when are you most productive?)
- Pending tasks with priority/effort ratings
- Weather (don't suggest outdoor tasks in rain)
- Location (if available)
- Recent completion patterns (avoid burnout)

**"What can I cook tonight?"**

AI considers:
- Ingredients on hand (if tracked)
- Time available (calendar integration)
- Recent meal history (avoid repetition)
- Dietary preferences
- Skill level/effort desired

### Proactive Intelligence
**Without being asked:**
- "You have 45 minutes before your next meeting - perfect time for [medium task]"
- "Heavy rain tomorrow morning - leave 10 minutes early for your 9am"
- "You usually meal prep on Sundays - want to add it to tomorrow?"
- "This task has been pending for a week and is marked high priority"

### Learning & Adaptation
- Learn your productivity patterns (morning person vs night owl)
- Understand effort estimates (your "quick" vs actual time)
- Recognize task dependencies
- Adapt to your response patterns (what suggestions you actually follow)

---
---

## Recent Insights & Feature Refinements

### Voice Input - Priority Elevated
**Status:** Now a near-term priority (Phase 6-7)  
**Why:** LifeOS isn't meant to be desktop-only. Voice capture is essential for:
- Adding items while cooking (hands busy)
- Capturing thoughts while driving
- Quick task entry without context switching
- ADHD-friendly workflow (reduce friction)

**Implementation Path:**
1. **Backend:** Integrate Whisper (open source, runs on foster-forge)
   - ~3-5 second transcription time
   - Fully private (no cloud APIs)
   - One-time setup
2. **Interface Options:**
   - Web UI: Record button → Whisper → text field
   - Mobile bridge: Voice message to Telegram/Discord → LifeOS
   - Future: Direct app integration
3. **Smart Processing:**
   - AI cleans up messy voice input
   - Extracts: task, priority, list type
   - "Hey add milk and eggs to grocery list" → 2 items, correct list

**Cost:** Minimal (Whisper is open source, runs locally)

---

### Smart Reminders - Already Planned, Adding Detail
**Implementation Strategy:**
- Systemd timer on foster-server (checks every 5-15 minutes)
- Queries LifeOS database for due items
- Sends notifications via:
  - Email (immediate)
  - Push notification (requires PWA or native)
  - SMS (optional, costs money)
  - Telegram/Discord (if using bridge)

**Reminder Types:**
1. **Time-based:** "Remind me at 3pm"
2. **Recurring:** "Every Sunday at 10am"
3. **Location-based:** (future) "When I'm near grocery store"
4. **Context-aware:** "When I have 30+ minutes free"

**AI Integration:**
- Learns patterns: "You usually meal prep Sundays at 10am"
- Proactive: "Task X has been pending 1 week (high priority)"
- Smart timing: "You have 45 min before next meeting - here's a task"

---

### Mobile Strategy - Refined Approach

**Phase 1: PWA (Progressive Web App)**
- Start here - works on all devices
- Offline capability with service workers
- Push notifications (with some limitations)
- No app store needed
- Single codebase

**Phase 2: Quick Access Bridge (Optional)**
- Telegram or Discord bot
- Quick capture: voice or text → LifeOS database
- Full management via web UI
- For when PWA isn't installed/convenient

**Phase 3: Native Apps (If Needed)**
- Only if PWA limitations become blocking
- Better push notifications
- App store presence
- Offline performance

**Decision Point:** Build PWA first, evaluate after family testing

---

### Patterns from Community Research

**Voice-First Philosophy (from CASPER project):**
- Design for voice input as primary, not secondary
- Reduce friction: voice is faster than typing
- Proactive notifications (not passive dashboard)
- "Always available" mindset

**Quick Capture Workflow (from Telegram bot project):**
- Allow messy input, AI organizes it
- Don't force structure during capture
- Clean up / organize asynchronously
- Example: "milk eggs maybe some bread and oh yeah trash bags" → 4 separate grocery items

**Whisper Integration Benefits:**
- Open source (no API costs)
- Runs on foster-forge (private, no cloud)
- ~3-5 second processing time (acceptable)
- Works offline

**Reminder System Design (from systemd pattern):**
- Separate from web app (runs independently)
- Checks database on interval
- Multiple notification channels
- Logged for debugging (journald)

---

## Updated Phase Priorities

### Phase 5 (Current - Immediate)
- Refine Item model and database schema
- Task completion flows
- UI/UX improvements
- Data model for multi-user (even if not implemented yet)

### Phase 6 (Next - Within 1-2 Months)
- **Voice Input Integration** (Whisper backend + web UI)
- **Smart Reminder System** (systemd + notifications)
- **PWA Setup** (offline, installable, push notifications)
- Multi-user foundation (database schema, permissions model)

### Phase 7 (Near Term - 2-4 Months)
- Shared lists functionality
- Basic calendar integration (read-only Google Calendar sync)
- Recipe system foundation
- Mobile bridge (optional - Telegram/Discord bot)

### Phase 8+ (Future - 4+ Months)
- Full multi-user/family coordination
- AI integration (proactive suggestions)
- Location-based features
- Advanced notifications
- Recipe cooking mode with AI

---

## Technical Decisions - Updated

### Voice Input: Whisper (Local)
**Decision:** Use Whisper running on foster-forge  
**Reasoning:**
- ✅ Open source, no ongoing costs
- ✅ Private (data stays on our server)
- ✅ Good accuracy for English
- ✅ Runs on existing infrastructure
- ⚠️ ~3-5 second processing (acceptable)
- ❌ Requires server connectivity

**Alternative Considered:** Web Speech API (browser-based)
- ❌ Privacy concerns (goes to Google/Apple)
- ❌ Limited offline capability
- ✅ No setup required
- ✅ Instant results

**Decision:** Start with Whisper, can add Web Speech API as fallback

---

### Mobile Strategy: PWA First
**Decision:** Build Progressive Web App, defer native apps  
**Reasoning:**
- ✅ Works on all devices (iOS, Android, desktop)
- ✅ Single codebase (easier maintenance)
- ✅ Can be installed like an app
- ✅ Offline capability
- ✅ Push notifications (with some limitations)
- ❌ Not quite as polished as native
- ❌ Push notifications require user to "install" PWA

**Alternative Considered:** Native apps (React Native or separate iOS/Android)
- ❌ 2x development effort
- ❌ App store approvals
- ✅ Better push notifications
- ✅ Better offline performance

**Decision:** PWA first, revisit native if family testing shows need

---

### Quick Capture Bridge: Optional Telegram Bot
**Decision:** Build if PWA proves insufficient for quick capture  
**Reasoning:**
- ⏸️ Defer until PWA tested
- ✅ Easy to add later (separate service)
- ✅ Good for voice messages on the go
- ❌ Another system to maintain
- ❌ Fragments user experience

**Pattern to Follow:**
- Telegram/Discord bot (input only)
- Voice message → Whisper → LifeOS database
- Text message → parsed → LifeOS database
- Full management still via web UI
- Bot is quick capture, not replacement

---

### Reminder System: Systemd + Multi-Channel Notifications
**Decision:** Build Python service with systemd timer  
**Reasoning:**
- ✅ Simple, reliable (systemd handles scheduling)
- ✅ Runs independently of web app
- ✅ Easy to debug (journald logs)
- ✅ Multiple notification channels (email, push, SMS, etc.)
- ✅ Can add channels incrementally

**Implementation:**
1. Python script: queries PostgreSQL for due items
2. Systemd timer: runs every 5 minutes
3. Notification service: sends via configured channels
4. Logging: all notifications logged to journald

---

## Not Doing (Clarifications)

### ❌ Medication Tracking Module
- Not a current need for the family
- Could add later if needed
- Simple task/reminder covers most use cases

### ❌ Custom Android OS (CASPER-style)
- Too large scope
- Can achieve similar with PWA + voice input
- Steal ideas (voice-first, proactive), not implementation

### ❌ Separate Life Database System
- LifeOS is our system, enhance it
- Don't build parallel systems
- Integrate patterns (voice, reminders) into LifeOS

### ❌ Telegram-Specific Design
- Mobile bridge could be Telegram, Discord, or anything
- Don't lock into one platform
- Design for platform-agnostic quick capture

---

## Key Principles from Research

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

---

**Updated:** January 25, 2026
**Next Review:** After Phase 6 completion or when hitting blockers

---

## Mobile-First Enhancement Plan (January 2026)

**Goal:** Make LifeOS fully mobile-ready with PWA support and responsive design.

### Phase 1: Duration Options ✅ COMPLETE (Jan 25, 2026)
**Status:** Completed
**Changes:**
- Updated duration dropdown from vague (Quick/Medium/Long) to specific time values
- New options: 15min, 30min, 1hr, 1-2hrs, 2-4hrs, 4-8hrs, 1-3days, 4-7days, 1-2weeks, 2+weeks
- Applied to: Today view, Week view, Lists view (smart filters)

**Testing:**
- ✅ Can create tasks with new duration options
- ✅ Smart list filtering works with new durations
- ✅ Duration displays correctly on task cards

---

### Phase 2: Mobile Responsive Fixes (NEXT - 4-6 hours)

**Target:** Make current UI usable on mobile screens

**Components to Fix:**

**A. Navigation Buttons**
- Problem: Cut off on mobile screens
- Solution: Stack vertically OR horizontal scroll OR hamburger menu on mobile (<768px)
- Touch targets: Minimum 44px tall

**B. Week View Mobile Layout**
- Problem: 7 columns don't fit on mobile
- Solution: Horizontal scroll OR vertical day-by-day list
- Desktop: Keep 7-column layout

**C. Today View Mobile Optimization**
- Task cards: Full width on mobile
- Metadata badges: Proper wrapping
- Touch targets: 44px minimum
- Floating + button: Don't cover content

**D. PWA Configuration**
- manifest.json: Proper icons (192x192, 512x512)
- Display mode: "standalone"
- Theme color: Match purple branding
- Add viewport meta tag
- Test "Add to Home Screen" on Android

**Files to Update:**
- `components/Header.tsx` - Navigation
- `app/week/page.tsx` - Week view layout
- `app/page.tsx` - Today view cards
- `public/manifest.json` - PWA config
- `app/layout.tsx` - Viewport meta

---

### Phase 3: Calendar View Improvements (2-3 weeks)

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

### Phase 4: Task Sharing with Wife (3-4 weeks)

**A. User Model & Database Schema**
- User model: id, email, name, password
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

**D. Simple Authentication**
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

### Post-Phase 4: Future Enhancements

**Phase 5: Meal Planning** (TBD)
- Recipe management
- Meal calendar
- Grocery list automation
- AI recipe suggestions

**Phase 6: AI Integration** (TBD)
- Recipe adjustments
- Proactive task suggestions
- Smart scheduling

**Phase 7: Wall Kiosk View** (TBD)
- Large screen optimized layout
- Family dashboard
- Shared calendar + tasks
- At-a-glance view

---

**This is a living document - add ideas as they come!**
