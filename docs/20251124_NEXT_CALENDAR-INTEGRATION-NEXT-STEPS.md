# Life OS Calendar Integration - Next Steps
**Ready to Start When You Are**

---

## 🎯 What We're Building

**The Vision:**
- See Google + Outlook calendars in one unified Life OS view
- Create events super fast in Life OS, push to any calendar
- Edit complex stuff in native Google/Outlook apps (via buttons)
- Everything stays in sync automatically

**What You Get:**
- ✅ Unified calendar view (work + personal in one place)
- ✅ Quick event creation (10 seconds to add dentist appointment)
- ✅ Push to Google, Outlook, or both
- ✅ Optional simple recurring (daily/weekly/monthly)
- ✅ "Edit in Google/Outlook" buttons for complex stuff
- ✅ Background sync keeps everything consistent

**What You DON'T Build:**
- ❌ Complex event editor
- ❌ Attendee management
- ❌ Room booking
- ❌ Time zone complex pickers
- ❌ Conflict resolution

**Timeline:** 2 weekends (~12-15 hours total with AI help)

---

## 📋 Step-by-Step Plan

### Step 0: Power Automate Setup (15 minutes - Do First!)

**Purpose:** Keeps Google ↔ Outlook in sync when you edit in native apps

**Instructions:**

1. **Go to:** https://make.powerautomate.microsoft.com

2. **Create Flow 1: Outlook → Google**
   - Click "Create" → "Automated cloud flow"
   - Name: "Sync Outlook to Google"
   - Trigger: "When an event is added, updated or deleted" (Office 365 Outlook)
   - Action: Search for "Google Calendar"
   - Choose appropriate action (Create/Update/Delete event)
   - Map fields: Title → Summary, Start → Start, End → End, etc.
   - Save

3. **Create Flow 2: Google → Outlook**
   - Click "Create" → "Automated cloud flow"
   - Name: "Sync Google to Outlook"
   - Trigger: "When an event is added, updated or deleted" (Google Calendar)
   - Action: Search for "Office 365 Outlook"
   - Choose appropriate action (Create/Update/Delete event)
   - Map fields accordingly
   - Save

4. **Test It:**
   - Add event in Google Calendar
   - Wait 2-5 minutes
   - Check if it appears in Outlook
   - Try the reverse

**Alternative:** Look for existing templates in Power Automate (search "Google Calendar Outlook sync")

**Free Tier Limits:**
- 750 runs/month = ~25 syncs per day
- Should be plenty for personal use
- Can upgrade or switch to n8n later if needed

**Troubleshooting:**
- If flows don't trigger, check permissions
- Make sure you've authorized both Google and Microsoft accounts
- Check flow run history for errors

---

### Step 1: Add Outlook Read Support (Weekend 1: 6-8 hours)

**Goal:** Life OS can display events from both Google and Outlook calendars

**What You'll Do:**
1. Add Microsoft OAuth to NextAuth
2. Create Microsoft Graph API client
3. Update calendar events API to fetch from both sources
4. Add UI elements (source badges, "Edit in Outlook" buttons)
5. Add "Sync" button to refresh both calendars

---

#### 1.1: Microsoft OAuth Setup

**Open:** `lib/auth.ts`

**Claude Code Prompt:**
```
Add Microsoft OAuth provider to NextAuth configuration:

1. Import MicrosoftProvider from next-auth/providers/microsoft
2. Add to providers array alongside GoogleProvider
3. Configure with these scopes:
   - openid
   - profile
   - email
   - Calendars.Read
   - Calendars.ReadWrite
4. Set authorization params:
   - access_type: offline
   - prompt: consent
5. Update JWT callback to handle Microsoft tokens alongside Google tokens
6. Update session callback to include Microsoft tokens

Environment variables needed:
- MICROSOFT_CLIENT_ID
- MICROSOFT_CLIENT_SECRET

Follow the same pattern as Google OAuth but for Microsoft.
```

**You'll Need to Do:**
1. Create Microsoft Azure App Registration:
   - Go to https://portal.azure.com
   - Azure Active Directory → App registrations → New registration
   - Name: "Life OS"
   - Redirect URI: `https://lifeos.foster-home.net/api/auth/callback/microsoft`
   - After creation, go to "Certificates & secrets" → New client secret
   - Copy Client ID and Client Secret to `.env`

2. Add to `.env`:
   ```
   MICROSOFT_CLIENT_ID=your_client_id_here
   MICROSOFT_CLIENT_SECRET=your_client_secret_here
   ```

3. Update `types/next-auth.d.ts` to include Microsoft tokens:
   ```typescript
   interface JWT {
     userId?: string;
     googleAccessToken?: string;
     googleRefreshToken?: string;
     googleExpiresAt?: number;
     microsoftAccessToken?: string;     // ADD
     microsoftRefreshToken?: string;    // ADD
     microsoftExpiresAt?: number;       // ADD
     error?: string;
   }
   ```

---

#### 1.2: Create Microsoft Graph API Client

**Create:** `lib/microsoft-calendar.ts`

**Claude Code Prompt:**
```
Create a Microsoft Graph API client for Outlook Calendar, similar to lib/google-calendar.ts:

1. Import necessary dependencies (@microsoft/microsoft-graph-client)
2. Create getMicrosoftGraphClient() function that:
   - Gets access token from session (similar to getCalendarClient)
   - Creates and returns Microsoft Graph client
   - Handles token refresh if expired

3. Export helper function to format Outlook events to match our CalendarEvent interface

Reference the existing google-calendar.ts file for the pattern.

The Graph API endpoint for calendar events is: /me/calendar/events
```

**You'll Need to Install:**
```bash
npm install @microsoft/microsoft-graph-client
npm install @microsoft/microsoft-graph-types
```

---

#### 1.3: Update Calendar Events API

**Edit:** `app/api/calendar/events/route.ts`

**Claude Code Prompt:**
```
Update the calendar events API to fetch from both Google and Outlook:

1. Import the new getMicrosoftGraphClient from lib/microsoft-calendar.ts

2. In the GET handler, after fetching Google events:
   - Check if user has Microsoft token in session
   - If yes, fetch Outlook events using Graph API:
     - GET /me/calendar/events
     - Filter by timeMin and timeMax (use startDateTime and endDateTime parameters)
   - Format Outlook events to match CalendarEvent interface
   - Add source: 'outlook' to each event

3. Combine googleEvents and outlookEvents arrays

4. Sort combined array by startTime

5. Return combined, sorted array

Handle errors gracefully - if Outlook fetch fails, just return Google events.
```

---

#### 1.4: Update UI - Event Display

**Edit:** `app/page.tsx` and `app/week/page.tsx`

**Claude Code Prompt:**
```
Update the event display to show calendar source and add edit buttons:

1. For each event card, add a badge showing the source:
   - "Google" badge (current blue/green color)
   - "Outlook" badge (different color, maybe orange)

2. Add action buttons to each event:
   - "View Details" button (existing)
   - "Edit in Google →" button (if source is google)
   - "Edit in Outlook →" button (if source is outlook)

3. The edit buttons should:
   - Open in new tab using window.open(url, '_blank')
   - Google URL: https://calendar.google.com/calendar/event?eid={event.id}
   - Outlook URL: https://outlook.office.com/calendar/item/{event.id}

4. Style the buttons to be clear but not intrusive

Make it obvious which calendar each event is from.
```

---

#### 1.5: Add "Sync" Button

**Edit:** `app/page.tsx` and `app/week/page.tsx`

**Claude Code Prompt:**
```
Add a "Sync" button to refresh calendar events:

1. Add a button near the date navigation or filter menu
2. Button should say "Sync" with a refresh icon
3. On click:
   - Show loading state (spinner or disable button)
   - Call loadData() to refetch events from both calendars
   - Hide loading state when complete
   - Show brief success toast: "Calendars synced!"

4. Optional: Add last synced timestamp
   - "Last synced: 2 minutes ago"
   - Updates on each sync

Keep it simple and clear.
```

---

#### 1.6: Update Settings Page

**Edit:** `app/settings/calendars/page.tsx`

**Claude Code Prompt:**
```
Update the calendar settings page to show Microsoft connection status:

1. Check if user has Microsoft tokens in session

2. Display connection status:
   - Google Calendar: Connected ✓ (existing)
   - Outlook Calendar: Connected ✓ or Not Connected (new)

3. If not connected, show "Connect Outlook" button:
   - onClick: signIn('microsoft')
   - This will trigger OAuth flow

4. If connected, show:
   - "Connected as: user@example.com"
   - "Disconnect" button (optional for now)

5. Show sync status for both calendars

Match the existing Google Calendar UI pattern.
```

---

#### Weekend 1 Testing Checklist

After implementing all of the above, test:

- [ ] Can sign in with Microsoft (OAuth flow works)
- [ ] Microsoft tokens stored in JWT session
- [ ] Can see Outlook events in Life OS
- [ ] Can see Google events in Life OS (still works)
- [ ] Events show correct source badge (Google vs Outlook)
- [ ] "Edit in Google" button opens Google Calendar in new tab
- [ ] "Edit in Outlook" button opens Outlook in new tab
- [ ] "Sync" button refreshes both calendars
- [ ] Settings page shows both connections
- [ ] Power Automate is syncing changes between calendars

**If all checked:** Weekend 1 is DONE! ✅

---

### Step 2: Add Event Creation (Weekend 2: 6-8 hours)

**Goal:** Create events in Life OS and push to selected calendar(s)

**What You'll Do:**
1. Create event creation form UI
2. Add calendar selector (Google/Outlook/Both)
3. Optional: Add simple recurring toggle
4. Create POST endpoint to push to APIs
5. Handle success/error feedback

---

#### 2.1: Create Event Form UI

**Edit:** `app/page.tsx` and/or create new component `components/EventCreateModal.tsx`

**Claude Code Prompt:**
```
Create an event creation form, similar to the existing task/habit creation modal:

Form fields:
1. Title (text input, required)
2. Date (date picker, required)
3. Time (time picker, required)
4. Calendar selector (dropdown):
   - Options: "Google Calendar", "Outlook Calendar", "Both Calendars"
   - Default to user's preference or Google
5. Optional: Recurring toggle
   - Checkbox: "Make this recurring"
   - If checked, show simple options: Daily / Weekly / Monthly
6. Description (textarea, optional)
7. Create button

Modal should:
- Open from existing "+" button or new "Add Event" button
- Have validation (title, date, time required)
- Show loading state when creating
- Close on success
- Show error if creation fails

Match the existing modal styling from task/habit creation.
```

---

#### 2.2: Create Event API Endpoint

**Create/Edit:** `app/api/calendar/events/route.ts` (add POST handler)

**Claude Code Prompt:**
```
Add a POST handler to create calendar events:

Input (from request body):
{
  title: string,
  date: string (YYYY-MM-DD),
  time: string (HH:MM),
  calendar: 'google' | 'outlook' | 'both',
  recurring?: { type: 'daily' | 'weekly' | 'monthly' },
  description?: string
}

Logic:
1. Get session and verify user is authenticated
2. Parse date/time into ISO format
3. If calendar includes 'google':
   - Get Google Calendar client
   - Create event using calendar.events.insert()
   - Include recurrence if provided (use Google's recurrence format)
4. If calendar includes 'outlook':
   - Get Microsoft Graph client
   - Create event using msGraph.api('/me/events').post()
   - Include recurrence if provided (use Outlook's recurrence format)
5. Return success with created event IDs

Error handling:
- If one calendar fails but other succeeds, return partial success
- Return clear error messages

Google recurrence format:
['RRULE:FREQ=DAILY'] for daily
['RRULE:FREQ=WEEKLY'] for weekly
['RRULE:FREQ=MONTHLY'] for monthly

Outlook recurrence format:
{
  pattern: { type: 'daily' | 'weekly' | 'monthly' },
  range: { type: 'noEnd' }
}
```

---

#### 2.3: Connect Form to API

**Claude Code Prompt:**
```
Wire up the event creation form to the API:

1. On form submit:
   - Validate all required fields
   - Show loading state
   - Call POST /api/calendar/events with form data
   - Handle response:
     - Success: Close modal, show success toast, refresh calendar
     - Error: Show error message, keep modal open

2. Success toast should say:
   - "Event created in Google Calendar" (if google)
   - "Event created in Outlook Calendar" (if outlook)  
   - "Event created in both calendars" (if both)

3. After creation, automatically refresh the calendar view to show new event

4. Clear form after successful creation (if modal is reused)
```

---

#### 2.4: Add "New Event" Button

**Edit:** `app/page.tsx` and `app/week/page.tsx`

**Claude Code Prompt:**
```
Add "New Event" option to the existing "+" add menu:

In the add menu that currently has:
- Add Habit
- Add Task
- Add Reminder

Add:
- Add Event (with 📅 emoji)

When clicked:
- Open the event creation modal
- Pre-fill date with currently selected date (if on Today view)
- Focus on title field
```

---

#### Weekend 2 Testing Checklist

After implementing event creation, test:

- [ ] "New Event" option appears in add menu
- [ ] Event creation form opens
- [ ] Can create event with just title, date, time
- [ ] Can select Google calendar → event appears in Google
- [ ] Can select Outlook calendar → event appears in Outlook
- [ ] Can select "Both" → event appears in both calendars
- [ ] Can add description (optional field works)
- [ ] Can make event recurring (daily/weekly/monthly)
- [ ] Success message shows after creation
- [ ] Calendar view refreshes to show new event
- [ ] "Edit in Google/Outlook" button works on newly created events
- [ ] Power Automate syncs the event to other calendar
- [ ] Error handling works (try with no network)

**If all checked:** Weekend 2 is DONE! ✅

---

## 🎯 After Both Weekends

**You'll Have:**
- ✅ Unified view of Google + Outlook calendars
- ✅ Fast event creation from Life OS
- ✅ Push to any calendar with one click
- ✅ Optional simple recurring events
- ✅ Easy editing in native apps (one button away)
- ✅ Background sync keeping everything consistent
- ✅ "Sync" button for manual refresh

**Total Time Invested:**
- 15 minutes (Power Automate)
- ~12-15 hours (2 weekends with Claude Code)

**Total Cost:**
- $0/month (using Power Automate free tier)

**What You Didn't Build:**
- Complex event editor
- Attendee management
- Room booking
- Advanced recurrence rules
- Time zone pickers
- Meeting schedulers

**Why This Is Perfect:**
- 80% of calendar use = viewing/quick creating (Life OS nails this)
- 20% of calendar use = complex editing (Google/Outlook nail this)
- Everything stays in sync automatically
- Low maintenance
- More time for Life OS unique features (recipes, meal planning, family coordination)

---

## 📚 Resources You'll Need

### Documentation Links
- **NextAuth Microsoft Provider:** https://next-auth.js.org/providers/microsoft
- **Microsoft Graph API (Calendar):** https://learn.microsoft.com/en-us/graph/api/resources/calendar
- **Google Calendar API:** https://developers.google.com/calendar/api/guides/overview
- **Power Automate:** https://make.powerautomate.microsoft.com

### Azure Setup
- **Azure Portal:** https://portal.azure.com
- **App Registration Guide:** https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app

### Your Existing Setup
- **Life OS:** https://lifeos.foster-home.net
- **GitHub:** https://github.com/fostertt/LifeOS-dash
- **Server:** foster-server (~/projects/dashboard)
- **Current State Doc:** LIFEOS-CURRENT-STATE-NOV-2025.md

---

## 💡 Tips for Success

### Working with Claude Code

**Best Practices:**
1. Give one clear prompt per task
2. Let it write the code
3. Test thoroughly
4. If something doesn't work, give it the error message
5. It will iterate and fix

**Example Prompt Structure:**
```
[What to build]
[Key requirements]
[Code structure/pattern to follow]
[Dependencies needed]
[Testing criteria]
```

### Testing Strategy

**After Each Major Change:**
1. Restart PM2: `pm2 restart lifeos`
2. Check logs: `pm2 logs lifeos`
3. Test in browser (incognito for clean slate)
4. Check both Google and Outlook calendars
5. Test error cases (network off, wrong input, etc.)

### Git Workflow

**Commit Often:**
```bash
git add -A
git commit -m "Add Outlook OAuth support"
git push origin master
```

**Before Big Changes:**
```bash
git checkout -b calendar-integration
# Do your work
git checkout master
git merge calendar-integration
```

### When You Get Stuck

**Check These First:**
1. PM2 logs: `pm2 logs lifeos --lines 50`
2. Browser console (F12)
3. Network tab (see API calls)
4. Database (user record has correct ID?)

**Common Issues:**
- OAuth not working → Check redirect URIs match exactly
- Tokens expired → Check refresh logic
- Events not showing → Check API response in network tab
- Power Automate not syncing → Check flow run history

---

## 🚀 Quick Start (When Ready)

### Day 1 (15 minutes):
1. Set up Power Automate flows
2. Test they work (create event in Google, wait, check Outlook)

### Weekend 1 (Saturday):
1. Create Azure app registration (30 min)
2. Add Microsoft OAuth to NextAuth (1 hour with Claude Code)
3. Create Microsoft Graph client (1 hour with Claude Code)
4. Test OAuth flow works (30 min)

### Weekend 1 (Sunday):
1. Update calendar events API (2 hours with Claude Code)
2. Add UI badges and edit buttons (2 hours with Claude Code)
3. Add sync button (30 min with Claude Code)
4. Test everything (1 hour)

### Weekend 2 (Saturday):
1. Create event form UI (2 hours with Claude Code)
2. Create POST endpoint (2 hours with Claude Code)
3. Test basic creation (1 hour)

### Weekend 2 (Sunday):
1. Add recurring event support (2 hours with Claude Code)
2. Polish UI and error handling (2 hours with Claude Code)
3. Final testing (2 hours)

### Done! 🎉

---

## 📝 Environment Variables Checklist

Make sure these are in your `.env` file:

```bash
# Existing
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://lifeos.foster-home.net"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# New (you'll add these)
MICROSOFT_CLIENT_ID="..." # From Azure App Registration
MICROSOFT_CLIENT_SECRET="..." # From Azure App Registration
```

---

## ✅ Success Criteria

**You'll know it's working when:**

1. **OAuth:**
   - Can sign in with Microsoft
   - Can see both Google and Microsoft in settings
   - Tokens are in session (check PM2 logs)

2. **Reading:**
   - See events from both calendars in Life OS
   - Events have correct source badges
   - "Edit in Google/Outlook" buttons work
   - "Sync" button refreshes view

3. **Creating:**
   - Can create event in Life OS
   - Can choose calendar (Google/Outlook/Both)
   - Event appears in selected calendar(s)
   - Can make events recurring
   - Success feedback is clear

4. **Syncing:**
   - Power Automate copies events between calendars
   - Edits in Google show up in Outlook (and vice versa)
   - Life OS shows updates after sync

5. **Real Usage:**
   - You actually use it daily
   - Saves you time
   - Everything stays consistent
   - No weird bugs or sync issues

---

## 🎊 You're Ready!

When you're ready to start:

1. **Copy this document** to start a fresh chat
2. **Begin with Step 0** (Power Automate - takes 15 min)
3. **Use Claude Code** for all the coding (Weekends 1 & 2)
4. **Test thoroughly** after each step
5. **Commit to git** often

**You've got this!** The plan is solid, the tools are ready, and Claude Code will do the heavy lifting.

**See you when you're ready to build!** 🚀

---

**Questions Before You Start?**
- Ping me in a new chat with this document
- I'll remember everything we discussed
- We'll get you unstuck fast

**After You Finish:**
- Update LIFEOS-CURRENT-STATE-NOV-2024.md
- Add calendar integration section
- Celebrate! 🎉
