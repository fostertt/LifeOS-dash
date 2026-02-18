### Active Bug: Week View Time Numbers Invisible on Phone Dark Mode
- **Status:** UNRESOLVED (Feb 11, 2026) — requires proper dark mode implementation
- **Symptoms:** Week view hour numbers (6, 7, 8...) on the left time column are completely invisible on phones with OS-level dark mode enabled.
- **Cause:** Phone's dark mode inverts/overrides colors, but Tailwind's `dark:` CSS classes don't activate because the app has no dark mode detection (`class="dark"` on `<html>`). The `dark:text-white` class has no effect.
- **Impact:** Week view time column is unusable on phones with dark mode.
- **Solution:** Implement proper dark mode support app-wide (Phase 9 in ui-polish-plan.md). Need to either:
  - Add `darkMode: 'class'` to Tailwind config + detect `prefers-color-scheme`
  - Or add `darkMode: 'media'` so Tailwind auto-detects OS preference
- **Screenshot:** `docs/screenshots/white_numbers.jpg`
- **File:** `app/calendar/page.tsx` (week view time column)

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
