# 📘 AI_PLAYBOOK.md  
*Project: Life OS (Next.js PWA)*  
*Author: Tyrrell Foster*  
*Server: foster-server (192.168.50.75)*  

---

# 🧩 TL;DR for Any AI (Read This First)

If you are **ChatGPT**, **Claude**, **Gemini**, or **NotebookLM**, follow these rules:

- **Read this file top-to-bottom before offering advice.**
- Respect all **Decisions** in this document unless explicitly told to revisit them.
- When making suggestions, prefer **incremental improvements**, not rewrites.
- Default tech assumptions:
  - **Next.js 16**
  - **React**
  - **TypeScript**
  - **Prisma**
  - **PostgreSQL**
  - **Server-centric dev (VS Code Remote SSH)**
- When the task involves:
  - **Architecture, infra, planning → ChatGPT**
  - **Coding & implementation → Claude**
  - **Large codebase scanning → Gemini CLI**
  - **Long-term project memory → NotebookLM**
- Avoid reinventing wheels (custom sync engines, etc.).
- Keep answers focused, practical, and aligned with the project’s real-world scope.

---

# 🎯 Project Purpose

Life OS is a comprehensive family productivity application that unifies:

- Google Calendar  
- Google Keep  
- Google Tasks  
- + Additional features like:
  - Meal planning  
  - Recipes  
  - Notifications  
  - Shared lists  
  - Enhanced filtering  
  - Family-centric workflows  

**Core Philosophy:**  
Solve *family productivity* first — broader product strategy comes second.

**Tech Stack:**

- Next.js 16, TypeScript  
- Prisma ORM  
- PostgreSQL  
- Docker + PM2 on Ubuntu  
- Nginx Proxy Manager + Cloudflare  
- OAuth via NextAuth.js (JWT sessions)  
- Production URL: https://lifeos.foster-home.net  

---

# 👥 AI Roles (Full Expanded Version)

## 🧠 ChatGPT (GPT‑5.1 Thinking) — **The Architect**
Use ChatGPT for:

- Architecture & system design  
- Database schema & data modeling  
- Infrastructure (Docker, PM2, Nginx, reverse proxy)  
- DevOps + homelab tasks  
- Tradeoff analysis  
- Planning & roadmaps  
- Designing complex features (meal planning, cross-calendar logic)

**Example prompts:**

- “Design the data model for meal planning.”  
- “Help plan the NFL scraper architecture for Spring 2026.”  
- “Compare Server Actions vs API routes for Life OS.”  
- “How should I structure multi-calendar integration?”  

---

## 🧠 Claude Sonnet 4.5 — **The Builder**
Use Claude Code to:

- Implement features  
- Write TypeScript  
- Fix bugs  
- Refactor  
- Review and optimize code  
- Explain unfamiliar code  
- Apply changes across multiple files
- Follow your project instructions automatically

This is your **primary coding AI**.

**Workflow:**

1. Get architectural direction from ChatGPT  
2. Implement in VS Code Remote SSH  
3. Test & debug  
4. Deploy using PM2 or Stream Deck  

---

## 🧠 Gemini Pro + CLI — **The Analyst**
Use Gemini CLI for:

- Large‑context scanning  
- Repo-wide analysis  
- Pattern detection  
- Finding references across entire project  
- Security & implementation checks  
- Test coverage mapping  

**Examples:**

```bash
gemini -p "@./ Give me an overview of the entire project"

gemini -p "@src/ @lib/ Has dark mode been implemented?"

gemini -p "@src/ @middleware/ Is JWT auth implemented properly?"

gemini -p "@src/payment/ @tests/ Is payment module fully tested?"
```

**When to use:**

- Repo > 50 files  
- Complex multi-file searches  
- NFL scraper (Spring 2026)  
- Research-heavy tasks  

---

## 🧠 NotebookLM — **The Historian** (Use Later)

Feed it:

- Architecture decisions  
- Long-term planning notes  
- Deep-feature docs  
- Meeting notes  
- Multi-month project evolution  

Use when the project becomes long-lived or complex.

---

# 🧩 Key Decisions (Do Not Break Without Asking)

### 🧩 PostgreSQL Over SQLite  
**Reason:** Reliability, concurrency, multi-machine access, production-grade performance.

### 🧩 JWT Sessions Over Database Sessions  
**Reason:** Fixed OAuth linking issues, simplified auth, improved performance.

### 🧩 “View Here, Edit There” Calendar Behavior  
Life OS:
- Creates simple events  
- Redirects user to Google/Outlook for complex editing  
**Reason:** Avoid rebuilding entire calendar UX.

### 🧩 Use Power Automate (or n8n) for Sync  
**Reason:** Avoid custom sync engines — too complex, high maintenance.

### 🧩 Next.js + TypeScript + Prisma Required  
Established best match for long-term maintainability.

### 🧩 Server-Centric Dev Environment  
Everything lives in:  
`/home/fostertt/projects/dashboard/`  
developed through VS Code Remote SSH.

---

# 🚫 Please Avoid (Important Guardrails)

AI should NOT:

- Suggest building a full sync engine  
- Replace PostgreSQL with SQLite  
- Propose rewrites unless explicitly requested  
- Add heavy dependencies for small tasks  
- Create overly complex architectures  
- Suggest editing calendars entirely inside Life OS  
- Write CSS without Tailwind unless asked  
- Override server-centric dev workflow  

---

# 📁 Project Structure (Canonical)

```
/home/fostertt/projects/dashboard/
├── app/
│   ├── api/
│   ├── page.tsx
│   ├── week/
│   └── settings/
├── components/
├── lib/
│   ├── auth.ts
│   ├── google-calendar.ts
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── public/
├── types/
└── ...
```

Future repos:

```
/projects/
├── dashboard/        # Life OS
├── nfl-scraper/      # Spring 2026
├── ai-playground/
└── infra/
```

---

## 🔧 Common Development Tasks

### Deploy Life OS
```bash
cd /home/fostertt/projects/dashboard
git pull origin master
npm run build
pm2 restart lifeos
# Verify: https://lifeos.foster-home.net
```

**Future: Stream Deck button does all this in one press**

### Check Logs
```bash
pm2 logs lifeos
pm2 logs lifeos --lines 50
pm2 logs lifeos --err  # Errors only
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it lifeos_postgres psql -U lifeos_admin -d lifeos_db

# Common queries
SELECT * FROM users;
SELECT * FROM calendar_syncs;
SELECT COUNT(*) FROM items WHERE type = 'task';
```

### View Running Services
```bash
pm2 status              # Life OS process
docker ps              # All containers
docker logs lifeos_postgres  # DB logs
```

### Git Workflow
```bash
# Standard workflow
git status
git add -A
git commit -m "descriptive message"
git push origin master

# Feature branches (for big changes)
git checkout -b calendar-integration
# ... do work ...
git checkout master
git merge calendar-integration
```

---

## 🎯 Current Project State (Nov 2025)

### ✅ Completed Features
- Task, habit, and reminder management
- Sub-tasks and sub-habits with hierarchical completion
- Smart Lists with two-way sync
- Date navigation (Today and Week views)
- Google OAuth authentication with JWT sessions
- Automatic token refresh (no hourly re-auth)
- Google Calendar read integration
- Calendar event display with color coding
- "Edit in Google" buttons for native editing

### 🚧 In Progress
- **Calendar Integration (Weekends 1-2):**
  - Add Outlook OAuth and read support
  - Multi-calendar unified view
  - Event creation from Life OS
  - Push to Google/Outlook/Both
  - "Sync" button for manual refresh

### 📋 Upcoming Features
- **Short-term (Next 3 months):**
  - Microsoft Outlook calendar support (Weekends 1-2)
  - Event creation with calendar selector (Weekend 2)
  - Stream Deck workflow integration

- **Medium-term (Next 6 months):**
  - Recipe storage and meal planning
  - PWA capabilities for mobile
  - Enhanced family sharing features
  - Dark mode

- **Long-term (2026):**
  - NFL web scraper project (Spring 2026)
  - Multi-user support expansion
  - Health app integration
  - Mobile app (maybe - PWA preferred) 

---
## 🔑 Key Technical Decisions

### Why JWT Sessions Over Database Sessions?
**Decision:** Switched from database sessions (with PrismaAdapter) to JWT sessions  
**Date:** November 2025  
**Reason:** Fixed OAuthAccountNotLinked errors, simplified token management, faster performance  
**Trade-off:** Can't revoke sessions server-side (acceptable for family use)

### Why PostgreSQL Over SQLite?
**Decision:** Migrated from SQLite to PostgreSQL  
**Date:** Earlier in 2025  
**Reason:** Multi-machine access, better reliability, production-ready  
**Implementation:** Docker container with proper backups

### Why Power Automate for Calendar Sync?
**Decision:** Use Power Automate (free tier) for Google ↔ Outlook sync  
**Date:** November 2025  
**Reason:** Don't build a sync engine (complex, maintenance burden). Focus on Life OS unique features.  
**Alternative:** n8n (self-hosted) if free tier insufficient

### Why "View Here, Edit There" for Calendars?
**Decision:** Create events in Life OS, edit complex stuff in Google/Outlook  
**Reason:** Don't rebuild features (attendees, rooms, recurrence rules) that native apps handle perfectly  
**User benefit:** 10 seconds to create, full power of native apps for complexity

---

## 💡 Development Patterns & Preferences

### My Working Style
- **Conceptualize architecture myself** (with ChatGPT help)
- **Use AI for implementation** (Claude Code primary)
- **Handle debugging myself** (browser dev tools, logs, database queries)
- **Deploy and manage infrastructure myself** (Docker, PM2, Nginx)
- **Systematic approach:** Plan → Implement → Test → Debug → Deploy

### Code Quality Preferences
- TypeScript strict mode (catch errors early)
- Explicit error handling (no silent failures)
- Clear variable names (readability over brevity)
- Comments for complex logic only (code should be self-documenting)
- Consistent formatting (Prettier)

### Cost-Effectiveness
- Prefer self-hosted solutions (server already running)
- Use free tiers when available (Power Automate, Cloudflare)
- AI assistance for speed, not dependency
- Build only what's needed (avoid over-engineering)

## 🚀 Stream Deck Integration Plans

**Purchase Decision:** Stream Deck for Christmas 2025  
**Why:** Speeds up multi-app workflows, perfect for Life OS + server management + future NFL scraper

### Planned Button Layout

**Server Management Page:**
```
┌─────────┬─────────┬─────────┬─────────┐
│ Deploy  │  Logs   │  PM2    │ Docker  │
│ Life OS │ Life OS │ Status  │ Status  │
├─────────┼─────────┼─────────┼─────────┤
│  SSH    │  DB     │  Nginx  │ Restart │
│ Server  │ Query   │  Logs   │   All   │
├─────────┼─────────┼─────────┼─────────┤
│ Vault   │  Plex   │ Pi-hole │ Backup  │
│ warden  │  Web    │  Admin  │  Check  │
└─────────┴─────────┴─────────┴─────────┘
```

**Life OS Development Page:**
```
┌─────────┬─────────┬─────────┬─────────┐
│ Open    │ Claude  │  Test   │ Deploy  │
│ VS Code │  Code   │ Changes │ & Open  │
├─────────┼─────────┼─────────┼─────────┤
│ New     │  Sync   │  View   │ Health  │
│ Event   │  Cals   │ Today   │  Appt   │
├─────────┼─────────┼─────────┼─────────┤
│ChatGPT  │ Gemini  │ GitHub  │  Docs   │
│Architect│  Scan   │  Repo   │ Notion  │
└─────────┴─────────┴─────────┴─────────┘
```

**NFL Scraper Page (Future - Spring 2026):**
```
┌─────────┬─────────┬─────────┬─────────┐
│  Run    │  Check  │  View   │ Export  │
│ Scrape  │ Status  │ Results │  Data   │
├─────────┼─────────┼─────────┼─────────┤
│ Today's │ Weekly  │ Season  │ Player  │
│ Games   │  Stats  │  Stats  │  Lookup │
└─────────┴─────────┴─────────┴─────────┘
```

---

## 📚 Important Documentation

### Primary Docs
- **Current State:** `LIFEOS-CURRENT-STATE-NOV-2025.md` - Complete system overview
- **Calendar Next Steps:** `CALENDAR-INTEGRATION-NEXT-STEPS.md` - Detailed implementation guide
- **This File:** `AI_NOTES.md` - AI workflow and development patterns

### External Resources
- **GitHub Repo:** https://github.com/fostertt/LifeOS-dash
- **Production URL:** https://lifeos.foster-home.net
- **Google Cloud Console:** Project ID 190986435595
- **Azure Portal:** For Outlook OAuth (to be set up)

### Server Access
- **SSH:** `ssh fostertt@foster-server` or `ssh fostertt@192.168.50.75`
- **Samba:** `\\192.168.50.75\projects`
- **Tailscale:** Remote access when away from home
- **VS Code Remote SSH:** Primary development method

---

## 🔄 Typical Development Workflow

### Starting a New Feature

**Step 1: Architecture (ChatGPT)**
```
Open ChatGPT
Ask: "Design the meal planning feature for Life OS"
Get: Data model, API structure, component hierarchy
Document decision in this file or ARCHITECTURE.md
```

**Step 2: Implementation (Claude Code)**
```
Open VS Code Remote SSH to foster-server
Open /home/fostertt/projects/dashboard
Start Claude Code session
Share ChatGPT's architecture
Say: "Implement this meal planning feature"
Claude writes code across multiple files
```

**Step 3: Testing (Manual)**
```
npm run build
pm2 restart lifeos
Open https://lifeos.foster-home.net
Test feature thoroughly
Check logs for errors
Test edge cases
```

**Step 4: Debug (Claude + Browser Tools)**
```
If bugs found:
  - Check browser console (F12)
  - Check network tab (API calls)
  - Check PM2 logs
  - Share errors with Claude
  - Claude suggests fixes
  - Iterate until working
```

**Step 5: Deploy & Document**
```
git add -A
git commit -m "Add meal planning feature"
git push origin master
Update AI_NOTES.md with decision
Update LIFEOS-CURRENT-STATE.md with feature status
```
---

## 🐛 Troubleshooting Quick Reference

### OAuth Issues
- **Check:** Redirect URIs match exactly in Google/Azure console
- **Check:** Tokens in JWT session (inspect session cookie)
- **Check:** Refresh token logic working
- **Tool:** Browser dev tools → Application → Cookies

### Calendar Not Showing Events
- **Check:** API response in Network tab
- **Check:** User ID matches in database
- **Check:** Token scopes include calendar permissions
- **Try:** Re-authenticate to get fresh tokens

### Database Issues
- **Check:** PostgreSQL container running: `docker ps`
- **Check:** Connection string in `.env`
- **Try:** Direct query: `docker exec -it lifeos_postgres psql -U lifeos_admin -d lifeos_db`
- **Check:** Prisma migrations: `npx prisma migrate status`

### Build/Deploy Issues
- **Check:** PM2 logs: `pm2 logs lifeos --err`
- **Check:** Build output: `npm run build`
- **Check:** Node version: `node --version` (should be 18+)
- **Check:** Disk space: `df -h`

### Server Access Issues
- **Check:** Server is powered on (duh)
- **Check:** Tailscale connected (if remote)
- **Check:** SSH keys: `ssh -v fostertt@foster-server`
- **Check:** Nginx Proxy Manager status  

---

## 📝 Quick Commands Reference

### Life OS Operations
```bash
# Deploy
cd ~/projects/dashboard && git pull && npm run build && pm2 restart lifeos

# Logs
pm2 logs lifeos
pm2 logs lifeos --lines 100 --err

# Status
pm2 status
pm2 monit  # Real-time monitoring

# Restart
pm2 restart lifeos
pm2 restart all

# Stop/Start
pm2 stop lifeos
pm2 start lifeos
```

### Database Operations
```bash
# Connect
docker exec -it lifeos_postgres psql -U lifeos_admin -d lifeos_db

# Common queries (inside psql)
\dt                                    # List tables
\d users                              # Describe table
SELECT * FROM users;                  # View users
SELECT * FROM calendar_syncs;        # View calendar sync status
SELECT COUNT(*) FROM items;           # Total items
SELECT * FROM items WHERE type='task' AND "isCompleted"=false;  # Active tasks
```

### Docker Operations
```bash
# Status
docker ps
docker ps -a  # Include stopped containers

# Logs
docker logs lifeos_postgres
docker logs nginx-proxy-manager

# Restart
docker restart lifeos_postgres
docker restart nginx-proxy-manager

# Rebuild
docker compose down
docker compose up -d
```

### Git Operations
```bash
# Status and diff
git status
git diff
git log --oneline -10

# Commit and push
git add -A
git commit -m "message"
git push origin master

# Branches
git checkout -b feature-name
git checkout master
git merge feature-name
git branch -d feature-name

# Undo (careful!)
git reset --hard HEAD  # Discard all changes
git reset HEAD~1       # Undo last commit
```

---

## 🎉 Success Metrics

**You'll know this workflow is working when:**
- [ ] Can open any project from any machine via Remote SSH
- [ ] Know immediately which AI to ask for what
- [ ] Development feels smooth (not fighting tools)
- [ ] Deployments are fast and reliable
- [ ] Can pick up projects after weeks away
- [ ] Documentation stays current
- [ ] Stream Deck saves 10+ minutes per day
- [ ] Family actually uses Life OS daily
- [ ] NFL scraper delivers value next fall

---

## 🚀 Next Actions (Prioritized)

### Immediate (This Week)
1. Create this AI_NOTES.md file in Life OS repo
2. Set up Power Automate for Google ↔ Outlook sync (15 min)
3. Order Stream Deck for Christmas

### Short-term (Next 2 Weeks)
4. Weekend 1: Add Outlook read support to Life OS
5. Weekend 2: Add event creation with calendar selector
6. Test multi-calendar workflow

### Medium-term (Next Month)
7. Weekend 3: Health Plex integration
8. Set up Stream Deck with initial button layout
9. Optimize Stream Deck workflow based on usage

### Long-term (Next 3-6 Months)
10. Add meal planning and recipes to Life OS
11. Start NFL scraper development (Spring 2026)
12. Create proper AI_PLAYBOOK files for NFL scraper
13. Consider NotebookLM if project complexity warrants

---

**Last Updated:** November 25, 2025 
**Next Review:** January 2026 (after calendar integration complete)

---

*This is a living document. Update as workflows evolve, decisions are made, and new patterns emerge.*  
