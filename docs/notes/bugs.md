### Resolved Bug: Quick Capture Fails to Save (2026-02-22)

- **Status:** RESOLVED (Feb 22, 2026)
- **Root cause:** Client sent `title` field but items API expects `name`. Validation rejected the payload.
- **Fix:** Changed `title` to `name` in the Quick Capture POST body.
- **File:** `components/GlobalCreateManager.tsx`

### Resolved Bug: Title-Only Notes Fail to Create (2026-02-22)

- **Status:** RESOLVED (Feb 22, 2026)
- **Root cause:** Two client-side issues in note editor: (1) `handleSave` had `if (!content.trim()) return` bail-out, (2) save button was `disabled={!content.trim()}`. API was never reached. Additionally, `NoteCard` crashed on null content (`.length`/`.substring()` on null), taking down the entire vault page.
- **Fix:** Changed guards to require title OR content. Sent `null` instead of empty string for content. Updated `Note` interface and `NoteCard` to handle optional content.
- **Files:** `app/vault/notes/[id]/page.tsx`, `components/NoteCard.tsx`, `app/vault/page.tsx`

### Resolved Bug: Quick Capture Input Text Nearly Invisible (2026-02-22)

- **Status:** RESOLVED (Feb 22, 2026)
- **Fix:** Added `text-gray-900 placeholder-gray-400` to the Quick Capture input element.
- **File:** `components/GlobalCreateManager.tsx`

---

### Resolved Bug: Today View Checkboxes Open Edit Modal (2026-02-22)

- **Status:** RESOLVED (Feb 22, 2026)
- **Fix:** Added `onClick={(e) => e.stopPropagation()}` to checkbox input in `renderItemCard`. The `click` event was bubbling to the parent card's `onClick` before `onChange` fired.
- **File:** `app/calendar/page.tsx`

---

### Resolved Bug: Weekly Recurring Task Won't Complete (2026-02-22)

- **Status:** RESOLVED (Feb 22, 2026)
- **Symptom:** Tasks with `recurrenceType: "weekly"` (e.g., every Sunday) didn't advance their due date on completion.
- **Root cause:** Toggle route only recognized `every_n_days`/`every_n_weeks`/`days_after_completion` as advancing recurrence. `daily`/`weekly`/`monthly` recurrenceTypes fell into the non-recurring branch and got permanently completed.
- **Fix:** Added `daily`/`weekly`/`monthly` to `isAdvancingRecurring` with proper date math (+1 day, +7 days, +1 month). Also broadened completions API to return all ItemCompletions for the user (removed `scheduleType: "daily"` filter).
- **Note:** Previous session's analysis incorrectly suggested these should use per-date (ItemCompletion) model like habits. They should advance the due date, same as `every_n_days`.
- **Files:** `app/api/items/[id]/toggle/route.ts`, `app/api/completions/route.ts`

---

### Resolved Bug: All View Requires Pull-to-Refresh After Completing (2026-02-22)

- **Status:** RESOLVED (Feb 22, 2026)
- **Fix:** Added optimistic update to `toggleCompletion` — immediately flips `isCompleted`/`state` in local state. Added `silentRefresh()` that fetches without `setLoading(true)` to avoid full-list flicker. Reverts on API failure.
- **File:** `app/all/page.tsx`

---

### Resolved Bug: Week View Time Numbers Invisible on Phone Dark Mode
- **Status:** RESOLVED (Feb 19, 2026)
- **Fix:** Changed time labels to `text-gray-800 font-bold` — dark text on the white background area, readable regardless of OS dark mode. Applied to both week view and timeline view time columns.
- **File:** `app/calendar/page.tsx`

### Active Bug: Mobile Width Overflow on All Page

- **Status:** UNRESOLVED (as of Feb 5, 2026 Evening)
- **Symptoms:** Horizontal scrolling on mobile. Page content extends beyond viewport width. Checkboxes on task cards cut off at right edge.
- **Affected Page:** `/all` (All tasks page)
- **Screenshots:**
  - `docs/screenshots/all_width.jpg` - Initial state
  - `docs/screenshots/all_width2.jpg` - After padding adjustments
  - `docs/screenshots/all_width3.jpg` - After filter panel compacting
- **Attempted Fixes:**
  - ✅ Added `overflow-x-hidden` to main container
  - ✅ Increased container padding: `px-4` → `px-6`
  - ✅ Reduced card padding: `p-3` → `p-2` (mobile)
  - ✅ Reduced gaps: `gap-2` → `gap-1`
  - ✅ Compacted filter panel (removed labels, smaller text)
  - ❌ None resolved the issue
- **Next Steps:**
  - Inspect with browser dev tools to find exact overflow source
  - Check if filter panel `<select>` dropdown has fixed width
  - Check if long task names or tags force width
  - Consider using `truncate` on task names
  - May need `max-w-full` on all child elements
- **File:** `app/all/page.tsx`
- **Context:** Part of UI Polish Phase 4 work

### Resolved Bug: Google Calendar Events Showing on Wrong Days
- **Status:** RESOLVED (Feb 19, 2026)
- **Symptoms:** All-day events (e.g., "Pay Day" on Wednesday) appeared on the next day. Recurring timed events (e.g., Monday 6:10 PM gymnastics) appeared on both the correct day and the next.
- **Root causes (3 interconnected bugs):**
  1. **API UTC timezone mismatch:** Server runs in UTC, so `new Date("2026-02-19")` = midnight UTC. Google API query window started/ended at wrong local times, including events from adjacent days.
  2. **Client-side `new Date()` on date-only strings:** All-day events with `startTime: "2026-02-19"` parsed as midnight UTC = 7 PM previous day in EST. `toDateString()` then returned wrong local date.
  3. **All-day events in week view hourly grid:** All-day events landed in the 7 PM hour slot instead of being displayed separately.
- **Fixes applied:**
  - API route now constructs query boundaries in America/New_York with dynamic EST/EDT offset via `Intl.DateTimeFormat`
  - Added `getEventDateStr()` helper: returns date-only strings as-is for all-day events, extracts local date for timed events
  - Added `filteredEventsForDay` for timeline/today views (client-side date filtering safety net)
  - Week view: all-day events excluded from hourly grid, shown in dedicated "ALL" row
- **Files:** `app/api/calendar/events/route.ts`, `app/calendar/page.tsx`

### Known Issue: Google Calendar Dateless Events Showing on Today
- **Status:** NOTED (Feb 11, 2026) — deferring fix
- **Symptoms:** Google Calendar all-day events/reminders without a specific date (e.g., "Stay at Best Western Morton Inn") show up on today's timeline view.
- **Cause:** App logic treats items with no date as "carry to today until completed." Google Calendar synced events without dates get caught by this rule, but users can't complete them since they're external events.
- **Impact:** Low — only affects Google Calendar synced items without dates.
- **Possible Solutions:**
  - Filter out Google Calendar events that have no date match for the current day
  - Add a "dismiss" action for external events
  - Only apply "no date = today" logic to user-created items, not synced events
- **File:** `app/calendar/page.tsx` (categorization logic)

### Active Bug: Renaming a Voice Note Re-Triggers Processing Pipeline
- **Status:** UNRESOLVED (Feb 18, 2026)
- **Symptoms:** Renaming a voice note file causes it to be re-sent through the voice processing pipeline, resulting in duplicate processing.
- **Context:** Voice pipeline is operational as of Feb 18, 2026.
- **Cause:** Unknown — likely the file watcher treating a rename as a new file event, not a modification.
- **Impact:** Medium — creates duplicate notes/tasks from the same recording.
- **Suspected Fix Direction:** Check if the file watcher distinguishes between `rename` and `add` events; filter rename events or fingerprint files by content rather than name to avoid re-processing.

### Known Issue: Server IP Address Changes
- **Symptoms:** Site returns 502 Bad Gateway.
- **Cause:** DHCP updates server IP, but Nginx Proxy Manager points to old IP.
- **Solution:** Update NPM destination to current IP (`hostname -I`) or set static IP reservation.

### Known Issue: OAuth Sign-In Loops
- **Symptoms:** "State cookie was missing" or endless redirects.
- **Cause:** Stale cookies or mixing JWT/DB session strategies.
- **Solution:** Clear browser cookies for domain, use incognito, ensure JWT strategy is active.

### Known Issue: Foreign Key Constraint Violations
- **Symptoms:** Error `items_user_id_fkey` when creating items.
- **Cause:** User logged in via JWT but record does not exist in `users` table (happens after database resets).
- **Solution:** Run `node scripts/add-user.mjs` to recreate the user record.
- **User ID:** `110753093651931352478` (Tyrrell's Google ID)
