# Life OS - Current State & Technical Overview
**Last Updated:** November 24, 2024  
**Status:** ✅ Production - Fully Operational

---

## 🎯 What's Working

### Core Functionality
- ✅ User authentication (Google OAuth via NextAuth.js)
- ✅ Tasks, Habits, and Reminders with full CRUD operations
- ✅ Sub-items/sub-tasks with hierarchical organization
- ✅ Smart Lists with filtering
- ✅ Date navigation (Today view + Week view)
- ✅ Task metadata (priority, effort, duration, focus)
- ✅ Recurring items (daily schedules)
- ✅ **Google Calendar Integration** - Two-way sync with calendar events
- ✅ Calendar event display with color coding
- ✅ Multi-calendar support with enable/disable toggles

### Technical Infrastructure
- ✅ Production deployment at https://lifeos.foster-home.net
- ✅ PostgreSQL database (Docker container: `lifeos_postgres`)
- ✅ SSL/HTTPS via Nginx Proxy Manager + Cloudflare
- ✅ Tailscale VPN for secure remote access
- ✅ PM2 process management with auto-restart
- ✅ Automatic startup on server reboot
- ✅ OAuth token auto-refresh (no hourly re-authentication)

---

## 🏗️ Architecture

### Tech Stack
```
Frontend:  Next.js 16 (React, TypeScript, Tailwind CSS)
Backend:   Next.js API Routes
Database:  PostgreSQL 16 (via Prisma ORM)
Auth:      NextAuth.js with JWT sessions
Hosting:   Self-hosted Ubuntu Server (foster-server)
Proxy:     Nginx Proxy Manager
DNS:       Cloudflare (foster-home.net)
Process:   PM2 process manager
```

### Key Technologies

**Next.js 16**
- App Router (not Pages Router)
- Server-side rendering
- API routes for backend
- Turbopack for fast builds

**Prisma ORM**
- Type-safe database queries
- Migration management
- Schema at `prisma/schema.prisma`

**NextAuth.js**
- JWT session strategy (not database sessions)
- Google OAuth provider
- Automatic token refresh
- Session data stored in encrypted HTTP-only cookies

**PM2**
- Process manager for Node.js
- Auto-restart on crash
- Auto-start on server reboot
- Log management
- Currently running: `lifeos` process

---

## 🔐 Authentication Architecture

### Session Strategy: JWT (Changed Nov 2024)

**Previous Setup (Broken):**
- Database sessions with PrismaAdapter
- Caused `OAuthAccountNotLinked` errors
- Required complex account linking logic

**Current Setup (Working):**
```typescript
// lib/auth.ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

**How It Works:**
1. User signs in with Google → Google returns OAuth tokens
2. NextAuth creates encrypted JWT cookie with:
   - User ID (from Google)
   - Access token
   - Refresh token
   - Token expiration time
3. Every request includes JWT cookie
4. Token auto-refreshes ~5 minutes before expiration
5. No database queries for session checking (faster!)

**Important Files:**
- `lib/auth.ts` - NextAuth configuration
- `types/next-auth.d.ts` - TypeScript type definitions for session
- User record created manually in database with Google ID

### OAuth Tokens

**Access Token:**
- Used for Google Calendar API calls
- Expires after 1 hour
- Auto-refreshes via `refreshAccessToken()` function

**Refresh Token:**
- Long-lived token (doesn't expire)
- Used to get new access tokens
- Stored in JWT session

**Scopes Required:**
```
openid
email
profile
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
```

---

## 📁 Project Structure

```
dashboard/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main dashboard (Today view)
│   ├── week/page.tsx            # Week view
│   ├── lists/                   # Smart lists
│   ├── settings/calendars/      # Calendar settings
│   ├── auth/signin/             # Sign-in page
│   └── api/                     # Backend API routes
│       ├── auth/[...nextauth]/  # NextAuth endpoint
│       ├── items/               # Tasks/habits/reminders CRUD
│       ├── habits/              # Habit-specific endpoints
│       ├── completions/         # Completion tracking
│       ├── lists/               # Smart lists
│       └── calendar/            # Google Calendar integration
│           ├── events/          # Fetch calendar events
│           ├── list/            # List available calendars
│           └── settings/        # Calendar sync settings
├── components/                  # React components
│   ├── Header.tsx
│   ├── ProtectedRoute.tsx
│   ├── SessionProvider.tsx
│   └── EventDetailModal.tsx
├── lib/                         # Utility libraries
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client
│   ├── session.ts               # Session helpers
│   └── google-calendar.ts       # Google Calendar API client
├── types/                       # TypeScript definitions
│   └── next-auth.d.ts          # NextAuth type extensions
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── .env                         # Environment variables
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema

### Key Tables

**users**
- Stores user profile information
- `id` = Google account ID (not auto-generated UUID)
- Links to all other user data

**items**
- Unified table for tasks, habits, and reminders
- `itemType`: 'habit' | 'task' | 'reminder'
- Supports sub-items via `parentItemId`
- Completion tracking via `item_completions` table

**habits** (Legacy)
- Separate habit tracking (being phased out?)
- Uses `habit_completions` for tracking

**calendar_syncs**
- Tracks which Google Calendars are enabled
- Per-calendar sync status and settings

**calendar_events**
- Stores Life OS-created events
- Links to Google Calendar events via `googleEventId`

**lists**
- Smart lists with filtering
- `listType`: 'simple' | 'smart'
- Links to `list_items`

**accounts** (NextAuth)
- OAuth account info (created by PrismaAdapter)
- Currently not used with JWT sessions
- Still in schema for potential future use

**sessions** (NextAuth)
- Database sessions (not used anymore)
- JWT sessions don't use this table

---

## 🌐 Google Calendar Integration

### How It Works

1. **Initial Setup:**
   - User signs in with Google (OAuth)
   - Requests calendar scopes during OAuth flow
   - Google returns access token + refresh token

2. **Calendar Sync:**
   - User goes to Settings → Calendars
   - Clicks "Sync Now"
   - Fetches all calendars from Google Calendar API
   - Stores calendar list in `calendar_syncs` table
   - Each calendar can be enabled/disabled

3. **Displaying Events:**
   - When viewing Today/Week view
   - Queries enabled calendars from `calendar_syncs`
   - Fetches events from Google Calendar API for date range
   - Displays alongside tasks/habits/reminders
   - Events show with calendar color coding

4. **Token Refresh:**
   - Access tokens expire after 1 hour
   - JWT callback checks expiration (`Date.now() < expiresAt`)
   - If expired, calls `refreshAccessToken()` function
   - Gets new access token from Google using refresh token
   - Updates JWT with new token
   - Process is automatic and invisible to user

### API Endpoints

**GET /api/calendar/list**
- Fetches available calendars from Google
- Syncs to database
- Returns list of calendars with sync status

**GET /api/calendar/events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD**
- Fetches events for date range
- Only from enabled calendars
- Combines Google events + Life OS events
- Returns unified event list

**GET /api/calendar/settings**
- Returns current sync settings
- List of calendars and enabled status

### Google Cloud Console Setup

**Project:** dashboard-477701 (ID: 190986435595)

**Enabled APIs:**
- Google Calendar API ✅

**OAuth 2.0 Credentials:**
- Client ID: `190986435595-h4qnpqq4n9vk0dtu0l71s9ojbup6enot.apps.googleusercontent.com`
- Client Secret: (stored in `.env`)

**Authorized Redirect URIs:**
- https://lifeos.foster-home.net/api/auth/callback/google

---

## 🚀 Deployment & Operations

### Server Details

**Host:** foster-server (Ubuntu 24.04)  
**IP:** 192.168.50.75 (local) / Tailscale IP  
**Domain:** lifeos.foster-home.net  
**User:** fostertt

### Docker Containers

```bash
# PostgreSQL Database
docker ps | grep postgres
# Container: lifeos_postgres
# Port: 5432
# Image: postgres:16-alpine

# Nginx Proxy Manager
docker ps | grep nginx
# Handles SSL/HTTPS
# Admin: http://192.168.50.75:81
```

### PM2 Process Management

**Current Process:**
```bash
pm2 status
# Name: lifeos
# Status: online
# Mode: fork
# User: fostertt
```

**Useful Commands:**
```bash
pm2 logs lifeos          # View live logs
pm2 restart lifeos       # Restart app
pm2 stop lifeos          # Stop app
pm2 start lifeos         # Start app
pm2 monit                # Real-time monitoring
pm2 flush                # Clear logs
pm2 save                 # Save process list
```

**Startup Service:**
- systemd service: `pm2-fostertt.service`
- Auto-starts PM2 on boot
- PM2 resurrects saved process list
- Life OS starts automatically

### Making Code Changes

**Development Workflow:**
```bash
# 1. SSH to server
ssh fostertt@foster-server

# 2. Navigate to project
cd ~/projects/dashboard

# 3. Make your changes (via VS Code Remote-SSH)

# 4. Rebuild
npm run build

# 5. Restart
pm2 restart lifeos

# 6. Watch logs
pm2 logs lifeos
```

**For Database Changes:**
```bash
# 1. Update schema
nano prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Rebuild and restart
npm run build
pm2 restart lifeos
```

### Environment Variables

**Location:** `/home/fostertt/projects/dashboard/.env`

```bash
# Database
DATABASE_URL="postgresql://lifeos_admin:PASSWORD@localhost:5432/lifeos_db"

# NextAuth
NEXTAUTH_URL="https://lifeos.foster-home.net"
NEXTAUTH_SECRET="[generated secret]"

# Google OAuth
GOOGLE_CLIENT_ID="190986435595-h4qnpqq4n9vk0dtu0l71s9ojbup6enot.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="[secret from Google Cloud Console]"
```

**Security Notes:**
- Never commit `.env` to git (in `.gitignore`)
- Keep credentials secure
- Rotate secrets periodically

---

## 🔧 Common Operations

### Accessing the Database

```bash
# Via Docker
docker exec -it lifeos_postgres psql -U lifeos_admin -d lifeos_db

# Common queries
SELECT id, email, name FROM users;
SELECT id, name, "itemType" FROM items WHERE "userId" = 'YOUR_GOOGLE_ID';
SELECT * FROM calendar_syncs WHERE "userId" = 'YOUR_GOOGLE_ID';

# Exit
\q
```

### Viewing Logs

```bash
# PM2 logs (app logs)
pm2 logs lifeos

# Just errors
pm2 logs lifeos --err

# Last 100 lines
pm2 logs lifeos --lines 100

# Docker logs (database)
docker logs lifeos_postgres
```

### Restarting Services

```bash
# Restart Life OS app
pm2 restart lifeos

# Restart PostgreSQL
docker restart lifeos_postgres

# Restart Nginx Proxy Manager
cd ~/nginx-proxy-manager
docker compose restart
```

### Checking Status

```bash
# Life OS app
pm2 status

# Docker containers
docker ps

# System resources
pm2 monit

# Network connectivity
curl https://lifeos.foster-home.net
```

---

## 🐛 Troubleshooting

### Sign-In Issues

**Problem:** OAuth loop or errors

**Solutions:**
1. Check Google Cloud Console:
   - Calendar API enabled?
   - Correct redirect URI?
   - OAuth consent screen configured?

2. Check environment variables:
   ```bash
   cat .env | grep GOOGLE
   ```

3. Check PM2 logs for errors:
   ```bash
   pm2 logs lifeos --lines 50
   ```

4. Clear browser cookies and try incognito

### Calendar Not Loading

**Problem:** Events not showing or 401 errors

**Solutions:**
1. Check token hasn't expired (should auto-refresh):
   ```bash
   pm2 logs lifeos | grep "Token"
   ```

2. Re-sync calendars:
   - Go to Settings → Calendars
   - Click "Sync Now"

3. Check Calendar API is enabled:
   - https://console.cloud.google.com/apis/api/calendar-json.googleapis.com

4. Check access token in database:
   ```sql
   SELECT "access_token", "expires_at" FROM accounts WHERE provider = 'google';
   ```

### App Not Starting

**Problem:** PM2 shows app as errored or stopped

**Solutions:**
1. Check PM2 status:
   ```bash
   pm2 status
   pm2 logs lifeos --err
   ```

2. Try restarting:
   ```bash
   pm2 restart lifeos
   ```

3. Check for build errors:
   ```bash
   cd ~/projects/dashboard
   npm run build
   ```

4. Check database is running:
   ```bash
   docker ps | grep postgres
   ```

### Database Connection Errors

**Problem:** Can't connect to database

**Solutions:**
1. Check PostgreSQL container:
   ```bash
   docker ps | grep postgres
   docker logs lifeos_postgres
   ```

2. Restart if needed:
   ```bash
   docker restart lifeos_postgres
   ```

3. Verify DATABASE_URL in `.env`

4. Test connection:
   ```bash
   docker exec -it lifeos_postgres psql -U lifeos_admin -d lifeos_db
   ```

---

## 📝 Recent Changes (November 2025)

### OAuth Account Linking Fix

**Problem:**
- Users stuck in OAuth sign-in loop
- Error: `OAuthAccountNotLinked`
- Calendar integration completely broken

**Root Cause:**
- Using database session strategy with PrismaAdapter
- Adapter failed to link OAuth accounts properly
- Session couldn't be established

**Solution:**
- Switched to JWT session strategy
- Removed PrismaAdapter dependency for sessions
- Tokens now stored in encrypted JWT cookie
- Added automatic token refresh function
- No more database account linking needed

**Files Changed:**
- `lib/auth.ts` - Complete rewrite of session strategy
- `types/next-auth.d.ts` - Added TypeScript definitions
- `app/api/calendar/events/route.ts` - Fixed null handling
- `app/api/habits/[id]/route.ts` - Fixed Prisma relation name
- `app/page.tsx` - Fixed TypeScript date handling
- `app/week/page.tsx` - Fixed TypeScript Set typing

### TypeScript Improvements

- Added proper type definitions for NextAuth session
- Fixed type narrowing issues with Date types
- Added type assertions for dueDate handling
- Fixed Prisma relation names (habit_completions vs completions)

### Database Updates

- User ID changed to match Google OAuth ID
- Manual user record creation required (not auto-generated)
- Database sessions table no longer used

---

## 🔮 Known Limitations

1. **Session Management**
   - JWT sessions can't be revoked server-side
   - Must wait for cookie expiration (30 days)
   - Signing out clears client-side cookie only

2. **Calendar Sync**
   - One-way sync (Google → Life OS)
   - Can't create/edit Google Calendar events from Life OS
   - Manual sync required (not automatic background sync)

3. **Multi-User**
   - No family/team features yet
   - Each user has separate data
   - No shared lists or calendars

4. **Mobile**
   - No native mobile app
   - PWA not yet implemented
   - Works in mobile browser but not optimized

5. **Offline Support**
   - Requires internet connection
   - No offline mode
   - No background sync

---

## 🎯 Future Improvements (Roadmap)

### Short Term
- [ ] PWA implementation for mobile
- [ ] Background calendar sync (automatic)
- [ ] Two-way calendar sync (create events in Life OS)
- [ ] Notification system for reminders
- [ ] Dark mode

### Medium Term
- [ ] Multi-user/family features
- [ ] Shared lists and calendars
- [ ] Recipe storage and meal planning
- [ ] Grocery list integration
- [ ] Mobile app optimization

### Long Term
- [ ] Native mobile apps (iOS/Android)
- [ ] Voice assistant integration
- [ ] AI-powered task suggestions
- [ ] Advanced analytics and insights
- [ ] Third-party integrations (Todoist, Trello, etc.)

---

## 📚 Resources & Documentation

### Project Documentation
- README.md - Project overview
- MIGRATION_PHASE1.md - Original migration notes
- FIX-GOOGLE-OAUTH.md - OAuth troubleshooting guide
- FIX-AUTH-LOOP.md - Auth loop fix documentation

### External Documentation
- Next.js: https://nextjs.org/docs
- NextAuth.js: https://next-auth.js.org/
- Prisma: https://www.prisma.io/docs
- Google Calendar API: https://developers.google.com/calendar/api
- PM2: https://pm2.keymetrics.io/docs

### GitHub Repository
- Repo: https://github.com/fostertt/LifeOS-dash
- Branch: master
- Latest commit includes all OAuth fixes

---

## 👤 User Information

**Primary User:** Tyrrell Foster  
**Email:** tyrrellfoster@gmail.com  
**Google ID:** 110753093651931352478  
**Timezone:** America/New_York

**Database User ID:** 110753093651931352478  
(Must match Google ID for calendar integration to work)

---

## ✅ Quick Reference

### Daily Operations
```bash
# Check if app is running
pm2 status

# View logs
pm2 logs lifeos

# Restart app
pm2 restart lifeos
```

### After Code Changes
```bash
cd ~/projects/dashboard
npm run build
pm2 restart lifeos
pm2 logs lifeos
```

### Database Access
```bash
docker exec -it lifeos_postgres psql -U lifeos_admin -d lifeos_db
```

### Emergency Restart
```bash
pm2 restart lifeos
docker restart lifeos_postgres
cd ~/nginx-proxy-manager && docker compose restart
```

---

**Document Version:** 1.0  
**Last Verified:** November 24, 2024  
**Status:** All systems operational ✅
