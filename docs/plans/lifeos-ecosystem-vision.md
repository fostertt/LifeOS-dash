# LifeOS Ecosystem Vision

**Created:** 2026-03-26
**Status:** Planning — architectural direction agreed, not yet implemented

---

## What LifeOS Becomes

LifeOS is not a to-do app. It's the **single brain** behind every screen and microphone in the house. One backend, one set of data connections, one AI routing layer — many endpoints.

The reason LifeOS isn't being used today isn't a UI problem. It's that the most useful interactions require an AI that can reason across data sources — "what's on my calendar tomorrow," "what recipe uses these ingredients," "add this to my grocery list." Right now, the only way to get that experience is opening a laptop and talking to Claude Code. The goal is to put that capability inside LifeOS itself, accessible from a tablet on the counter, a voice device at the desk, or a speaker in a kid's room.

---

## Architecture: One Brain, Many Screens

```
┌─────────────────────────────────────────────────┐
│                  LifeOS Backend                  │
│              (Next.js on forge)                   │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Existing │  │ AI Chat  │  │ Data Connectors│  │
│  │ Web App  │  │ Endpoint │  │                │  │
│  │ (tasks,  │  │ (new)    │  │ - LifeOS DB    │  │
│  │  notes,  │  │          │  │ - Recipe DB    │  │
│  │  inbox,  │  │          │  │ - Fitness DB   │  │
│  │  vault)  │  │          │  │ - Music DB     │  │
│  └─────────┘  └──────────┘  │ - Google Cal   │  │
│                              │ - Weather API  │  │
│                              │ - Block Sched  │  │
│                              └────────────────┘  │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │         Model Routing Layer              │    │
│  │                                          │    │
│  │  Simple queries ──→ Gemini Flash (free)  │    │
│  │  or local Ollama    (already in stack)   │    │
│  │                                          │    │
│  │  Complex reasoning ──→ Claude API        │    │
│  │  (architecture, multi-step, analysis)    │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
         │              │              │
    ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
    │ Tablets  │   │ Jetson  │   │  Pi     │
    │ (touch, │   │ (desk,  │   │ Satel-  │
    │  browser │   │  voice, │   │  lites  │
    │  UI)    │   │  always │   │ (rooms, │
    │         │   │  on)    │   │  inter- │
    │         │   │         │   │  com)   │
    └─────────┘   └─────────┘   └─────────┘
```

### Endpoints

| Endpoint | Hardware | Role | Interface |
|----------|----------|------|-----------|
| Kitchen wall | Fire tablet or Skylight replacement | Family view — photos, calendar, weather, schedule | Touch, browser (LifeOS) |
| Kitchen counter / desk | Tablet (S7 FE or similar) | Full assistant — chat, tasks, queries | Touch + optional voice, browser (LifeOS) |
| Office desk | Jetson Orin Nano | Always-listening voice assistant — flagship endpoint | Voice (wake word → local STT → LifeOS API → local TTS) |
| Kids' rooms / garage / other | Raspberry Pi 5 + mic + speaker | Voice satellite + intercom receiver | Voice (wake word → STT → LifeOS API → TTS) + broadcast receive |
| Phone / any browser | Fold 6, laptop, any device | Full LifeOS web app | Touch/keyboard, browser |

### Why Jetson, Not Just Pi Everywhere

The Jetson Orin Nano runs local STT (Whisper) and TTS at near-real-time on its GPU — the voice interaction feels instant. Pi endpoints are cheaper but have 1-2 second STT latency. Jetson is the flagship desk endpoint; Pis are the cheap room satellites. Both hit the same LifeOS backend.

---

## AI Model Strategy

Claude API is too expensive for 20+ daily conversational queries. Tiered approach:

| Tier | Model | Cost | Use Case |
|------|-------|------|----------|
| Routine | Gemini Flash (free tier) | $0 | Calendar queries, weather, simple lookups, task creation |
| Routine alt | Ollama on forge (local) | $0 | Same as above, offline-capable, no rate limits |
| Complex | Claude API (Sonnet or Haiku) | $$  | Multi-step reasoning, analysis, recommendations, meal planning from ingredients |

**Routing logic (simple to start):** Keyword/intent classification at the API layer. Most queries are structured data lookups — model just needs to pick the right tool call. Start with Gemini Flash for everything, add Claude tier later only if quality demands it.

**Key insight:** The AI doesn't need to be brilliant for most queries. "What's on my calendar tomorrow" is a DB query with a sentence wrapper. The model's job is intent parsing + tool selection, not deep reasoning. Gemini Flash or even a local model handles that fine.

---

## Data Sources to Wire Up

These already exist — the AI layer connects them, it doesn't rebuild them:

| Source | Location | Access Method |
|--------|----------|---------------|
| Tasks, notes, reminders | LifeOS PostgreSQL (forge, port 5433) | Prisma / direct SQL |
| Recipes | recipe-db (SQLite, MCP) | SQLite query |
| Fitness data | fitness_data.db (SQLite) | SQLite query |
| Music library | music_library.db (SQLite, MCP) | SQLite query |
| Movie tracker | movie_tracker.db (SQLite, MCP) | SQLite query |
| Google Calendar | Google Calendar API | OAuth (already configured, GCloud project: homelab-apis) |
| Weather | Weather API (OpenWeatherMap or similar) | REST API |
| Block schedule | ~/homelab/reference/block-schedule.md | File read |

---

## What This Replaces / Absorbs

| Old Concept | What Happens |
|-------------|-------------|
| CASPER assistant (someday-maybe) | This IS CASPER — voice-first, always-available, local + cloud fallback. Built into LifeOS instead of standalone. |
| Jetson as standalone project | Jetson is a LifeOS client/endpoint. No separate architecture, no separate RAG, no separate DB connections. |
| "LifeOS mobile access strategy" question | Conversational interface IS the mobile strategy. PWA + chat + voice. |
| Pi intercom (someday-maybe) | Pi satellites are LifeOS voice endpoints that also receive broadcasts. Same backend. |
| RAG system (planning-queue) | Complementary — RAG handles unstructured knowledge (docs, PDFs, notes). LifeOS AI handles structured queries (tasks, calendar, recipes). Could share the same model routing layer. |

---

## Skylight Replacement (Family Hub View)

The existing Skylight digital frame is dead (won't power on — may be fixable with a reset, but long-term replacement is LifeOS).

**What LifeOS needs for this role:**
- A "family view" mode — simplified, touch-friendly, auto-rotating content
- Photo slideshow (pull from a folder or Google Photos API)
- Today's calendar (family events)
- Weather
- Family schedule highlights
- NOT the full task/inbox/vault UI — this is a glanceable display, not a productivity tool

**Hardware:** Wall-mounted Fire tablet (already assigned in device ecosystem plan) or a dedicated display tablet. Fully Kiosk Browser to lock it to LifeOS family view URL.

---

## Implementation Path (Pragmatic)

The key is to get something working fast enough to prove the pull exists, then expand.

### Phase 1: Chat Endpoint + 2-3 Data Sources
- Add `/api/chat` endpoint to LifeOS Next.js app
- Wire up Gemini Flash (already have API key from voice pipeline)
- Tool definitions for: query tasks (LifeOS DB), query calendar (Google Calendar API), get weather
- Basic chat UI component in LifeOS — a new page/view, not a sidebar
- Test from a tablet for a week: does the pull exist? Do you actually walk up and use it?

### Phase 2: Expand Data Sources + Voice Input
- Add recipe, fitness, music tool definitions
- Browser Speech-to-text API for hands-free input on tablets
- Refine model routing if Gemini Flash isn't good enough for some queries

### Phase 3: Jetson Voice Endpoint
- Set up Jetson with local Whisper + TTS (Piper)
- Wake word detection (openWakeWord or Porcupine)
- Connects to same `/api/chat` endpoint as tablets
- Always-on at the desk

### Phase 4: Family View + Skylight Replacement
- Build family view mode in LifeOS (photos, calendar, weather)
- Wall-mount a Fire tablet, lock to family view URL
- Optional: photo integration (local folder or Google Photos)

### Phase 5: Pi Satellites
- Replicate Jetson voice endpoint pattern on Pi 5 (slower STT but same backend)
- Add broadcast/intercom capability (forge pushes TTS to all Pi endpoints)
- Deploy to rooms as needed

---

## Open Questions

- **Voice pipeline integration:** Does the existing voice pipeline (Syncthing → Whisper → Gemini → DB) merge with the chat endpoint, or stay separate? Voice pipeline is async (record → process later). Chat is synchronous (ask → answer now). Probably stay separate but share the model routing layer.
- **Auth for chat endpoint:** LifeOS uses NextAuth/Google OAuth. Jetson and Pi endpoints need to authenticate to the chat API. API key? JWT? Local network only (no auth needed if behind Tailscale/firewall)?
- **Conversation history:** Does the chat endpoint maintain conversation context? Or is each query stateless? Start stateless, add history if it matters.
- **Offline capability:** If forge is down, should Jetson fall back to a local model for basic queries? Nice-to-have, not required for v1.

---

## Relationship to Existing Roadmap

This vision doesn't replace the existing LifeOS roadmap (`lifeos-roadmap.md`). The current roadmap covers the **web app features** (projects UI, recipes, drag-and-drop, inbox improvements). This document covers the **AI layer and multi-endpoint architecture** that sits on top of and alongside those features.

Priority order:
1. Finish existing Tier 1 features if they're close (Projects UI, Recipes schema)
2. Build Phase 1 chat endpoint — this is the highest-leverage thing for actual usage
3. Continue web app improvements in parallel as needed

The chat endpoint doesn't require Projects UI or Recipes to be done first. It queries whatever data sources exist today and grows as more are added.
