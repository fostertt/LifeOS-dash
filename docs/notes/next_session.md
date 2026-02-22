# Next Session — Start Here

**Last Updated:** 2026-02-22
**Branch:** master (committed & pushed)
**Master Plan:** `docs/plans/lifeos-roadmap.md`

---

## What Just Happened (Feb 22, 2026)

Fixed 3 bugs from previous session:
1. **Checkbox opening modal** — added `onClick` stopPropagation on Today view checkbox
2. **Weekly recurring won't complete** — added `daily`/`weekly`/`monthly` to advancing recurrence branch with date math (+1d/+7d/+1mo). Fixed completions API to return all ItemCompletions (removed `scheduleType: "daily"` filter).
3. **All view flicker on complete** — optimistic update + silent background refresh

Also cleaned up docs: consolidated 7 planning/session docs into `docs/plans/lifeos-roadmap.md`.

---

## What To Do Now: Vault Polish (Phase 7) + FAB Redesign (Phase 8)

These are the last remaining UI polish items. Both are medium complexity, ~2-3 hours total.

### Phase 7: Vault Improvements

**Goal:** Make vault more compact like Google Keep.

**7.1 Compact layout** (`app/vault/page.tsx`)
- Reduce outer padding: `p-8` → `p-4`
- Reduce grid gap: `gap-4` → `gap-2 md:gap-3`
- Reduce card padding: `p-5` → `p-3`
- Simpler cards: minimal borders, rely on subtle shadows
- Reference: Google Keep (`docs/screenshots/keep1.jpg`)

**7.2 Fix new notes not showing** (`app/vault/page.tsx`, `components/GlobalCreateManager.tsx`)
- After creating a note/list, GlobalCreateManager dispatches `window.dispatchEvent(new Event('notes-updated'))`
- Vault page listens: `window.addEventListener('notes-updated', loadNotes)`
- Clean up listener on unmount

**7.3 Make Content field optional** (`app/vault/notes/[id]/page.tsx` or relevant note API)
- Remove content validation — allow saving note with just title
- Verify API `/api/notes` accepts empty content

**7.4 Verify click behavior**
- Ensure direct click opens editor after Phase 1 swipe removal (likely already works)

### Phase 8: FAB Redesign

**Goal:** Clean up the plus button popup.

**File:** `components/FAB.tsx` (or `components/GlobalCreateManager.tsx` — check which renders the popup)

- Replace emoji icons with Lucide React icons
- Clean typography: `text-sm font-medium`
- Monochrome with subtle color accents
- Fade + slide-up animation
- `shadow-lg` with backdrop blur

---

## After Vault/FAB: Wire Voice Pipeline to Inbox

**One-line change on pipeline side** — POST body includes `source: "voice"`. LifeOS API already accepts it (ADR-020 implemented Feb 21). Test that inbox shows voice captures.

---

## Then: Drag and Drop (ADR-018) — The Big One

This is the next major feature. Details in `docs/plans/lifeos-roadmap.md` Tier 2.

- Library: `@dnd-kit/core`
- Today view: vertical drag, 15-min snap
- Week view: 2D drag (time + day)
- GCal events: read-only
- Resize: deferred

---

## Known Bugs (Not Blocking)

| Bug | Where |
|-----|-------|
| Mobile width overflow on All page | `app/all/page.tsx` — needs dev tools inspection |
| Voice note rename re-triggers processing | Pipeline side — file watcher issue |
| Google Calendar dateless events on Today | `app/calendar/page.tsx` — deferred |
| Auto-refresh unreliable on Android | `lib/useRefreshOnFocus.ts` — may need polling |

See `docs/notes/bugs.md` for full details.

---

## Key Architecture Decisions

- **ADR-020:** Inbox (source + reviewedAt fields, replaces Home tab)
- **ADR-019:** 3 states (backlog / active / completed)
- **ADR-018:** Drag-and-drop (@dnd-kit, pending implementation)
- **ADR-017:** Today view reorder (Overdue → Unscheduled → Time grid)
- **ADR-014:** Two recurrence completion models

All ADRs in `docs/notes/decisions.md`.

---

## PM2

`pm2 restart lifeos-dev` — runs `next start -p 3002`. Port baked into package.json start script.
