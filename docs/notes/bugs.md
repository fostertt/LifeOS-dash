
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
- **Cause:** User logged in via JWT but record does not exist in `users` table.
- **Solution:** Manually INSERT user with Google ID (see `key_facts.md` for SQL).
