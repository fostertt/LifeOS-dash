# Next Session — Start Here

**Last Updated:** 2026-03-27
**Branch:** master
**Master Plan:** `docs/plans/lifeos-roadmap.md`
**Ecosystem Vision:** `docs/plans/lifeos-ecosystem-vision.md`

---

## What Just Happened (Mar 27, 2026)

Architecture session for the AI conversational layer. No code written — decisions made and recorded.

**Key decisions (ADR-021 in `docs/notes/decisions.md`):**
- AI chat endpoint at `/api/chat`, brain logic in `lib/ai/` (framework-agnostic)
- Gemini Flash (free) for Phase 1, Claude API tier added later
- OpenAI-compatible function calling format (works with both Gemini and Claude)
- Non-streaming, stateless per request for Phase 1
- Auth: session cookie (browser) + API key env var (Jetson/Pi)
- Chat UI: new `/chat` page, center position in bottom tab bar
- Open-Meteo for weather (free, no API key)
- Recipes: use Mealie (self-hosted) instead of building in LifeOS — wire as AI data source later
- Three-layer vision: capture → retrieve → converse

---

## Implementation Plan: Phase 1 Chat Endpoint

### Step 1: lib/ai/ foundation
Create the framework-agnostic AI brain:
- `lib/ai/types.ts` — Message, ToolDefinition, ToolResult, ChatRequest/Response types
- `lib/ai/tools/index.ts` — Tool registry (collects definitions, dispatches handlers)
- `lib/ai/router.ts` — Model routing (Gemini Flash only for now). Owns the tool execution loop: model calls tool → execute handler → feed result back → model responds.

### Step 2: First three tools
- `lib/ai/tools/tasks.ts` — Query LifeOS tasks by status/date/keyword, create tasks. Uses Prisma.
- `lib/ai/tools/calendar.ts` — Get Google Calendar events for a date range. Uses existing GCal OAuth.
- `lib/ai/tools/weather.ts` — Current conditions + forecast via Open-Meteo API. No key needed.

### Step 3: Gemini Flash integration
- Install `@google/generative-ai` npm package
- Wire Gemini API key (reuse from voice pipeline or add to LifeOS `.env`)
- Implement `geminiChat()` in router.ts — sends messages + tool definitions, handles tool call loop
- Test from a script or API client before building UI

### Step 4: /api/chat endpoint
- `app/api/chat/route.ts` — POST handler
- Auth: check NextAuth session OR Bearer API key from env
- Request: `{ messages: [{ role, content }] }`
- Response: `{ role: "assistant", content: "..." }`
- Error handling: model failures, tool failures, auth failures

### Step 5: Chat UI
- `app/chat/page.tsx` — Full-screen chat view
- Message list (scrollable, newest at bottom)
- Text input + send button at bottom (above tab bar, touch-friendly)
- Mobile-first, works on phone (375px) and tablet
- Loading state while waiting for response

### Step 6: Bottom tab bar update
- Add Chat tab in center position (between existing tabs)
- Icon: MessageCircle or similar from Lucide
- Rearrange existing tabs around it

### Step 7: Test and iterate
- Test from phone (PWA) for real-world usage
- Try: "what's on my calendar tomorrow", "what's overdue", "add buy groceries to my tasks", "what's the weather this weekend"
- Identify where Gemini Flash feels too dumb → inform Claude tier decisions

---

## Future phases (not this session)
- Mealie deployment + recipe tool
- Fitness DB / music DB tools
- File-read tools for homelab notes, project docs, session logs (layer 3: converse)
- Browser Speech-to-text for voice input on tablets
- Conversation history / context window
- Jetson voice endpoint (Phase 3 in ecosystem vision)

---

## Known DnD Issues (Not Blocking — Track for Later)

| Issue                                          | Where                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| Week view pills too small for comfortable drag | `app/calendar/page.tsx` — needs drag handles or press-to-enlarge |
| 15-min snap grid not yet implemented           | Items land on nearest hour, not 15-min intervals                 |
| Resize handles deferred                        | Wait until drag UX is solid                                      |

---

## Known Bugs (Older — Not Blocking)

| Bug                                      | Where                                           |
| ---------------------------------------- | ----------------------------------------------- |
| Voice note rename re-triggers processing | Pipeline side — file watcher issue              |
| Auto-refresh unreliable on Android       | `lib/useRefreshOnFocus.ts` — may need polling   |
| Mobile width overflow on All page        | `app/all/page.tsx` — needs dev tools inspection |

See `docs/notes/bugs.md` for full details.

---

## Key Architecture Decisions

- **ADR-021:** AI conversational layer — Phase 1 architecture (chat endpoint, Gemini Flash, 3 tools)
- **ADR-020:** Inbox (source + reviewedAt fields, replaces Home tab)
- **ADR-019:** 3 states (backlog / active / completed)
- **ADR-018:** Drag-and-drop (@dnd-kit) — Today + Week views working
- **ADR-017:** Today view reorder (Overdue → Unscheduled → Time grid)
- **ADR-014:** Two recurrence completion models

All ADRs in `docs/notes/decisions.md`.

---

## PM2

`pm2 restart lifeos-dev` — runs `next start -p 3002`. **Must `npm run build` first** (production mode, not dev).
