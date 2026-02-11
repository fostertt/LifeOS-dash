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
