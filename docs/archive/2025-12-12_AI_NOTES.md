# AI_NOTES.md - Life OS

**Last Updated:** December 12, 2025  
**Project Type:** Web Application - Family Productivity Platform  
**Primary AI Tool:** Claude (Desktop Commander for file ops, Claude Pro for planning)  
**Status:** Active - Recently Recovered to Working State

---

## 📋 Quick Context

Life OS is a self-hosted family productivity platform combining tasks, habits, reminders, smart lists, and Google Calendar integration into a unified dashboard. Replaces scattered Google services (Calendar, Keep, Tasks) with a single interface optimized for family coordination and daily planning.

---

## 🔄 Last Session (Dec 12, 2025)

- **Completed:** Restored working state from Dec 4 snapshot (commit 3cdf3fd), fixed TypeScript error in calendar events route, manually created user record in database, committed to new branch `working-dec-12-2025`
- **Next:** Systematically test all features (especially calendar sync), fix auto user creation for new sign-ins, verify week view and habit tracking
- **Blocked:** None currently
- **Details:** See `docs/20251212_RECOVERY-SESSION-STATUS.md` for comprehensive recovery documentation

---

## 🛠️ Tech Stack

- **Languages:** TypeScript, JavaScript
- **Framework:** Next.js 16 (App Router, React, Tailwind CSS)
- **Infrastructure:** Self-hosted Ubuntu Server 24.04, PM2 process manager, Docker (PostgreSQL only), Nginx Proxy Manager, Cloudflare DNS
- **Database:** PostgreSQL 16 (Docker container `lifeos_postgres`)
- **Key Dependencies:** NextAuth.js (OAuth), Prisma ORM, Google Calendar API, googleapis

---

## 🎯 AI Tool Routing

- **Planning/Architecture:** Claude Pro
- **Implementation:** Claude Code (web interface or VS Code extension)
- **Codebase Scanning:** Gemini CLI (if project grows >50 files)
- **Quick Scripts:** Gemini Pro/CLI (token-efficient for simple tasks)
- **Documentation:** Either tool can update AI_NOTES.md and session docs
- **Troubleshooting:** Claude Pro (better with logs/debugging)

---

## 🔒 Key Decisions (Do Not Break Without Asking)

### Decision 1: JWT Sessions Without Database Adapter

**Made:** November 24, 2025  
**Reasoning:** Database sessions with PrismaAdapter caused `OAuthAccountNotLinked` errors and sign-in loops. JWT strategy stores tokens in encrypted cookies, eliminates account linking complexity, enables auto token refresh.  
**Alternatives Considered:** Database sessions (broken), hybrid approach (too complex)  
**Current Issue:** Users don't auto-create in database, requires manual SQL insert

### Decision 2: Unified Item Model for Tasks/Habits/Reminders

**Made:** November 2025 (Phase 4 migration)  
**Reasoning:** Single `items` table with `itemType` discriminator enables cross-tool workflows, shared metadata (priority, effort, duration, focus), and unified querying.  
**Alternatives Considered:** Separate tables (limits shared features), complete merge with legacy habits table (too risky)

### Decision 3: Self-Hosted on Home Server

**Made:** Project inception  
**Reasoning:** Full control, no subscription costs, family data stays private, learning opportunity for infrastructure management.  
**Alternatives Considered:** Cloud hosting (recurring costs), managed services (less control)

### Decision 4: PostgreSQL Over SQLite

**Made:** November 2025  
**Reasoning:** Multi-machine access required, SQLite had locking issues, PostgreSQL better for concurrent users and future family features.  
**Alternatives Considered:** SQLite (broken for multi-machine), MySQL (no compelling advantage)

---

## 📊 Current State

**Status:** Active - Core Features Working  
**Last Worked:** December 12, 2025  
**Working?** Yes - Core CRUD operations verified, calendar integration present but needs testing

**What's Working:**

- Google OAuth authentication (JWT sessions)
- Creating/editing tasks, habits, reminders
- Smart lists with filtering
- Date navigation (Today and Week views)
- PM2 process management with auto-restart
- HTTPS via Nginx Proxy Manager + Cloudflare
- Database persistence (PostgreSQL)

**What's Not Working / Known Issues:**

- [ ] New user sign-in doesn't auto-create database record (requires manual SQL)
- [ ] Google Calendar sync button present but functionality untested post-recovery
- [ ] Week view needs verification
- [ ] Habit completion tracking needs testing
- [ ] Task recurrence needs testing
- [ ] Calendar event creation (if implemented) status unknown

**Next Actions (Prioritized):**

1. [ ] Test Google Calendar sync end-to-end
2. [ ] Fix auto user creation in JWT callback or add back adapter properly
3. [ ] Systematically test all features and document status
4. [ ] Create stable git tag for this working state
5. [ ] Set up database backup strategy

---

## 🧩 Project Structure

```
dashboard/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Today view (main dashboard)
│   ├── week/page.tsx            # Week view
│   ├── lists/                   # Smart lists management
│   ├── settings/calendars/      # Calendar sync settings
│   ├── auth/signin/             # Sign-in page
│   └── api/                     # Backend API routes
│       ├── auth/[...nextauth]/  # NextAuth OAuth handler
│       ├── items/               # Tasks/habits/reminders CRUD
│       ├── lists/               # Smart lists API
│       └── calendar/            # Google Calendar integration
├── components/                   # React components
├── lib/                         # Utilities (auth, prisma, google-calendar)
├── types/                       # TypeScript definitions
├── prisma/                      # Database schema & migrations
├── docs/                        # Project documentation
├── AI_NOTES.md                  # This file - AI context
└── .env                         # Environment variables (not in git)
```

---

## ⚡ Common Commands

### Development

```bash
# Navigate to project
cd ~/projects/dashboard

# Build for production
npm run build

# Start with PM2
pm2 start npm --name lifeos -- start

# Or restart existing
pm2 restart lifeos

# Watch logs
pm2 logs lifeos
pm2 logs lifeos --err  # errors only
```

### Database

```bash
# Access PostgreSQL
docker exec -it lifeos_postgres psql -U lifeos_admin -d lifeos_db

# Common queries
SELECT id, email FROM users;
SELECT id, name, "itemType" FROM items WHERE "userId" = '110753093651931352478';

# Manual user creation (when needed)
INSERT INTO users (id, email, name, email_verified, created_at, updated_at)
VALUES ('GOOGLE_ID_HERE', 'email@example.com', 'Name', NOW(), NOW(), NOW());

# Exit
\q
```

### Deployment

```bash
# After code changes
cd ~/projects/dashboard
git pull origin master  # or working branch
npm run build
pm2 restart lifeos

# Save PM2 config (after changes)
pm2 save

# Check status
pm2 status
docker ps | grep postgres
curl http://localhost:3000  # test local
```

### Maintenance

```bash
# Check Nginx routing
# Open http://192.168.50.76:81 (Nginx Proxy Manager admin)

# Restart all services
pm2 restart lifeos
docker restart lifeos_postgres

# Check logs
pm2 logs lifeos --lines 50
docker logs lifeos_postgres
```

---

## 🚨 Known Issues / Gotchas

**Issue 1: Server IP Address Changes**

- **Symptoms:** Site returns 502 Bad Gateway despite app running
- **Cause:** DHCP or network changes update server IP, Nginx proxy still points to old IP
- **Workaround:** Update Nginx Proxy Manager destination to current IP (check with `hostname -I`)
- **Permanent Fix:** Set static IP reservation in router for foster-server

**Issue 2: OAuth Sign-In Loops**

- **Symptoms:** "State cookie was missing" errors, endless redirect to /api/auth/callback/google
- **Cause:** Stale OAuth state cookies from previous attempts, or adapter/JWT strategy mismatch
- **Workaround:** Clear browser cookies for lifeos.foster-home.net, use incognito window, ensure JWT strategy (not database)
- **Permanent Fix:** Already using JWT correctly, just need fresh browser session

**Issue 3: Foreign Key Constraint Violations**

- **Symptoms:** Error creating items/lists: `items_user_id_fkey` constraint violated
- **Cause:** User record doesn't exist in database (JWT doesn't auto-create users)
- **Workaround:** Manually INSERT user with Google ID from session
- **Permanent Fix:** Add user upsert to JWT callback or properly configure adapter

**Issue 4: TypeScript Null Handling**

- **Symptoms:** Build fails with "Type 'null' is not assignable to type 'string | undefined'"
- **Cause:** Prisma returns `null` for nullable fields, TypeScript expects `undefined`
- **Workaround:** Use `field || undefined` to convert null to undefined
- **Permanent Fix:** Applied to calendarColor in calendar events route

---

## 📝 Development Patterns & Preferences

### Code Style

- Use TypeScript strict mode, handle null/undefined explicitly
- Prefer functional React components with hooks
- Use Tailwind for styling (utility-first CSS)
- API routes return `NextResponse.json()` with proper status codes

### Error Handling

- Log errors to PM2 logs with `console.error()`
- Return user-friendly error messages in API responses
- Foreign key errors indicate missing database records (check user exists)
- OAuth errors usually need fresh browser session or environment variable check

### Testing Strategy

- Manual testing in production (no automated tests currently)
- Test in incognito window after auth changes
- Check PM2 logs after every deployment
- Verify database state with direct SQL queries when debugging

### Git Workflow

- Create feature branches for new work
- Commit working states before experimenting
- Use descriptive commit messages with "WORKING STATE:" prefix for stable checkpoints
- Push to GitHub frequently to preserve history

---

## 🔗 References

- **Repository:** https://github.com/fostertt/LifeOS-dash
- **Production URL:** https://lifeos.foster-home.net
- **Documentation:** `docs/` folder in project root
- **Server Access:** SSH via `fostertt@foster-server` or Desktop Commander at `\\foster-server.local\projects\dashboard`
- **Google Cloud Console:** Project ID `dashboard-477701`
- **Domain:** Managed via Namecheap, DNS via Cloudflare

---

## 💡 Context for AI

### When working on this project, AI should:

- Check git status and current branch before suggesting changes
- Verify PM2 is running and rebuild after code changes
- Test database user existence before assuming foreign key errors are code bugs
- Use Desktop Commander for direct file edits when working on live server
- Check `docs/` folder for recent session notes and context
- Respect the Dec 4 snapshot (commit 3cdf3fd) as the last known good state

### When working on this project, AI should NOT:

- Switch from JWT sessions back to database sessions (causes OAuth loops)
- Remove Prisma schema models without checking foreign key dependencies
- Suggest migrating from PostgreSQL to SQLite (already tried, broken)
- Remove the PrismaAdapter import (still needed even with JWT for account storage)
- Make changes directly to master branch (use feature branches)
- Assume calendar integration works without testing (just restored, status unclear)

---

## 📈 Success Metrics

- [x] Family member (me) uses Life OS daily for task management
- [ ] Google Calendar events display correctly alongside tasks
- [ ] Zero unplanned downtime for 30 consecutive days
- [ ] All features from Nov 24 working state verified functional
- [ ] Wife can sign in and use (requires fixing auto user creation)
- [ ] Mobile browser experience is usable (responsive design working)

---

## 🎯 Future Enhancements

**Short-term (Next 1-2 months):**

- Fix auto user creation for new sign-ins
- Test and verify Google Calendar sync functionality
- Add database backup automation
- Create stable release tags in git
- Document all working features comprehensively

**Medium-term (Next 3-6 months):**

- Multi-user/family features (shared lists, family calendar view)
- PWA implementation for mobile home screen install
- Notification system for reminders
- Recipe storage and meal planning integration
- Two-way calendar sync (create events in Life OS)

**Long-term (6+ months):**

- Native mobile apps (iOS/Android) or fully optimized PWA
- Voice assistant integration
- AI-powered task suggestions and smart scheduling
- Third-party integrations (Todoist, Trello, etc.)
- Advanced analytics and productivity insights

---

## 📅 Change Log (Recent Major Changes)

### Dec 12, 2025 - Recovery Session: Restored Working State

- Reset to Dec 4 snapshot (commit 3cdf3fd) after feature/google-calendar-push branch broke everything
- Fixed TypeScript error in calendar events route (calendarColor null handling)
- Manually created user record with Google ID 110753093651931352478
- Committed working state to new branch `working-dec-12-2025`
- Updated Nginx Proxy Manager to point to new server IP (.76 instead of .75)
- Full recovery details in `docs/20251212_RECOVERY-SESSION-STATUS.md`

### Nov 24, 2025 - OAuth Fix and Calendar Integration

- Switched from database sessions to JWT sessions (fixed sign-in loops)
- Removed PrismaAdapter dependency for sessions (kept for account storage)
- Added automatic OAuth token refresh mechanism
- Implemented Google Calendar integration (read-only display)
- All features working and documented in `docs/20251124_LIFEOS-CURRENT-STATE-NOV-2025.md`

### Nov 2025 - Item Model Migration (Phase 4)

- Unified tasks, habits, and reminders into single `items` table
- Added metadata fields: priority, effort, duration, focus
- Implemented hierarchical sub-items
- Migrated from SQLite to PostgreSQL for multi-machine support

---

## 🔧 Environment Configuration

**Critical Environment Variables (.env):**

```bash
# Database
DATABASE_URL="postgresql://lifeos_admin:PASSWORD@localhost:5432/lifeos_db"

# NextAuth
NEXTAUTH_URL="https://lifeos.foster-home.net"
NEXTAUTH_SECRET="[generated secret]"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="190986435595-h4qnpqq4n9vk0dtu0l71s9ojbup6enot.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="[secret]"
```

**User Information (for manual user creation):**

- **Google ID:** 110753093651931352478
- **Email:** tyrrellfoster@gmail.com
- **Name:** Tyrrell Foster

---

## 📁 Important Branches

- `master` - Should point to latest working state (needs update to match working-dec-12-2025)
- `working-dec-12-2025` - Current working state (Dec 12 recovery)
- `feature/google-calendar-push` - **DO NOT USE** - Contains broken WIP code
- `baseline-working` - Minimal working state with calendar code removed (functional but limited)

---

**INSTRUCTIONS FOR AI:**

1. Read this file completely before making suggestions
2. Check `docs/20251212_RECOVERY-SESSION-STATUS.md` for detailed current state
3. Respect Key Decisions - don't suggest reverting JWT sessions or database strategy
4. Always verify user exists in database when seeing foreign key errors
5. Test locally (localhost:3000) before assuming server deployment issues
6. Update this file when major decisions are made or architecture changes
7. Use Claude Code (web or VS Code) for generating implementation code, Claude Pro for planning/debugging. Apply code via copy-paste or direct commits as needed.

---

_This file is your project's AI context anchor. Update the "Last Session" section at the top after each work session to maintain continuity across Claude instances and time._
