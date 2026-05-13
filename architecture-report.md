# Grounded App — Architecture Report

**Date:** 2026-05-13  
**Version:** 1.0.1 (`com.lindsay.grounded`)  
**Production URL:** https://www.getgroundedapp.com

---

## Overview

Grounded is a faith and wellness app — a quiet daily companion for Bible reading, guided reflection, journaling, prayer, and movement. It is delivered as a **Progressive Web App (PWA)** hosted on Vercel and as a **native iOS app** via Capacitor, both served from the same production web origin.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Client (Browser / iOS)                 │
│  Vanilla JS SPA · index.html · Service Worker (PWA)      │
│  localStorage for all user data (no auth, no server DB)  │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP POST /api/*
┌────────────────────▼─────────────────────────────────────┐
│              Vercel Serverless Functions                   │
│  Node.js ES modules · OpenAI GPT-4o-mini · 1 024 MB      │
└────────────────────┬─────────────────────────────────────┘
                     │ REST API
┌────────────────────▼─────────────────────────────────────┐
│                 OpenAI API (GPT-4o-mini)                  │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (no framework), HTML, CSS |
| Deployment | Vercel (static + serverless functions) |
| AI Provider | OpenAI GPT-4o-mini (via direct REST) |
| Native Mobile | Capacitor 6 (iOS wrapper, points to production URL) |
| Mobile CI/CD | Codemagic → App Store Connect → TestFlight |
| PWA | Service Worker (cache-first), Web App Manifest |
| Build | Custom Node.js scripts (`scripts/build-www.cjs`) |
| Local Dev | `live-server` (static), `vercel dev` (with API) |

---

## Repository Structure

```
grounded-app/
├── index.html              # SPA entry point (all tabs, all views, all CSS)
├── bibleData.js            # Client-side Bible data (offline)
├── widget.html             # "Today's Verse" PWA shortcut page
├── sw.js                   # Service worker — cache-first strategy (v187)
├── manifest.json           # PWA manifest
├── capacitor.config.ts     # Capacitor — appId, production server URL
├── vercel.json             # Routing rewrites, function memory/timeout config
├── codemagic.yaml          # iOS App Store CI/CD pipeline
│
├── js/                     # Frontend JavaScript modules
│   ├── app-themes.js       # Theme management + onboarding state source of truth
│   ├── onboarding.js       # 5-step first-run onboarding flow
│   ├── study-app.js        # Bible study tab (book/chapter/verse navigation)
│   ├── study-data.js       # Reading plans and study content
│   ├── weekly-themes.js    # Weekly theme resolver (ISO calendar, Mon–Sun)
│   ├── grounded-home-weekly-themes-data.js   # Weekly theme content data
│   ├── grounded-home-weekly-theme-meta.js    # Weekly theme metadata
│   ├── grounded-moment-theme-maps.js         # Daily moment → theme mappings
│   ├── capacitor.js                          # Capacitor bridge init
│   ├── cap-local-notifications.js            # Local notification scheduling
│   ├── cap-push-notifications.js             # Push notification registration
│   └── grounded-native-notifications.js      # Unified notification layer
│
├── css/
│   └── onboarding.css      # Onboarding-only layout (no app-wide impact)
│
├── api/                    # Vercel serverless functions (Node.js ESM)
│   ├── verse-explanation.js          # 1–2 sentence verse explanation
│   ├── verse-breakdown.js            # Verse tap short reflection
│   ├── verse-explain-structured.js   # Structured JSON: anchor/meaning/reflection
│   ├── chapter-explain.js            # Chapter summary JSON (themes, takeaway)
│   ├── chapter-explain-structured.js # Structured chapter explanation (longer)
│   ├── book-overview.js              # Full biblical book overview
│   ├── prayer.js                     # Generates a short formatted Christian prayer
│   ├── reflect-meaning.js            # Reflects on user journal entry + verse
│   ├── load-local-env.js             # Loads .env.local for local development
│   └── read-request-json.js          # Reliable POST body parser for Vercel
│
├── scripts/
│   ├── build-www.cjs                 # Builds output into www/
│   ├── copy-capacitor-runtime.cjs    # Copies Capacitor JS into www/ post-install
│   └── inject_weekly_reflections.py  # Injects weekly reflection content
│
├── www/                    # Build output (Vercel outputDirectory, Capacitor webDir)
│   ├── index.html
│   ├── js/ (mirrors js/)
│   ├── css/ (mirrors css/)
│   ├── assets/
│   └── ...
│
├── ios/                    # Capacitor-generated Xcode project
├── docs/                   # Internal documentation
│   └── onboarding.md
└── assets/                 # Images and static assets
```

---

## Frontend

### Single-Page Application

The app is a **framework-free vanilla JS SPA**. `index.html` is the sole entry point and contains all inline CSS (themes, layout, components) and loads JS modules as `<script>` tags in order. All tab navigation and view transitions happen client-side without page reloads.

### Visual Themes

Two user-facing themes, mapped to CSS `data-theme` attributes on `<html>`:

| Product Theme | `data-theme` | Character |
|---|---|---|
| `neutral` | `neutral` | Clean, minimal, cool whites |
| `blush` | `soft` | Warm rose tones (default palette) |

Themes are managed by `js/app-themes.js` (`GroundedThemes`), which bootstraps the selected theme before the main bundle runs to avoid flash-of-wrong-theme.

### Core Tabs / Features

| Tab | Description |
|---|---|
| Home | Daily verse, verse explanation (AI), weekly themed moments |
| Scripture | Daily Bible verse card, "Go Deeper" reflection flow |
| Study | Book/chapter/verse navigator, AI explanations, reading plans, journal |
| Prayer | AI-generated contextual prayers |
| Reset | Pilates & meditation (body, mind, spirit) |
| Settings | Theme picker, notification preferences, onboarding replay |

### Weekly Themes

`js/weekly-themes.js` resolves the current theme by ISO calendar week (Monday–Sunday). Each week maps to a named spiritual theme; each day within the week maps to a specific Daily Moment. Theme rotation is deterministic and offline — no server call needed.

### Onboarding

A 5-step first-run flow (`js/onboarding.js`, `css/onboarding.css`) collects:
1. User name
2. Goals / intent (multi-select from 10 options)
3. Visual theme (Neutral / Blush)
4. Daily time commitment (2–3 min / 5 min / 10+ min)
5. Preferred time of day (morning / midday / night / flexible)

**Completion gate:** `localStorage.getItem('onboardingCompleted') === 'true'`. The onboarding shows on every launch until this key is set to the literal string `"true"`.

### Service Worker & PWA

`sw.js` implements a **cache-first** strategy:
- **Install:** pre-caches the full app shell (HTML, JS, CSS, images, manifest)
- **Fetch:** serves from cache for same-origin GETs; falls back to network and opportunistically caches new assets
- **Activate:** deletes all prior cache versions for clean deploys
- **Cache key:** `grounded-v187` — bump on every deploy touching cached assets

The app is installable as a PWA (standalone display mode) and includes a `widget.html` shortcut for "Today's Verse" pinned to the home screen.

---

## Backend — Vercel Serverless Functions

All AI calls are server-side. The client never holds the OpenAI API key.

### API Endpoints

| Endpoint | Purpose | Max Duration |
|---|---|---|
| `POST /api/verse-explanation` | 1–2 sentence warm verse explanation | 30 s |
| `POST /api/verse-breakdown` | Short verse tap reflection | 30 s |
| `POST /api/verse-explain-structured` | JSON: anchor, meaning, reflection | 45 s |
| `POST /api/chapter-explain` | Chapter summary: themes + takeaway (JSON) | 60 s |
| `POST /api/chapter-explain-structured` | Detailed chapter explanation (JSON) | 60 s |
| `POST /api/book-overview` | Full biblical book overview | 60 s |
| `POST /api/prayer` | 5–6 line formatted Christian prayer | 30 s |
| `POST /api/reflect-meaning` | 2–3 sentence reflection on journal entry + verse | 30 s |

All functions: 1 024 MB memory, Node.js ESM, same pattern — load env → parse body → call OpenAI → sanitize → return JSON.

### AI Model

- **Model:** `gpt-4o-mini`
- **Temperature:** 0.7 (most functions)
- **Key env vars:** `OPENAI_API_KEY` (with fallbacks: `OPEN_AI_KEY`, `OPENAI_KEY`)
- All prompts are system-prompt + single user message; no conversation history sent

### Routing (vercel.json)

SPA routes (`/privacy`, `/terms`, `/contact`) are rewritten to `index.html`. API functions under `api/*.js` are auto-detected by Vercel.

---

## Data Storage

All user data lives in **`localStorage`** — there is no server-side user database or authentication.

| Key | Contents |
|---|---|
| `onboardingCompleted` | `"true"` once onboarding is finished (authoritative gate) |
| `grounded_onboarding_state` | JSON: name, goals, theme, dailyTime, preferredTime, step, version |
| `grounded_user_name` | String name (mirrored from onboarding state) |
| `grounded_why` | JSON array of goal label strings |
| `grounded_study_journal` | Array of journal entries (max 200, newest first) |
| `grounded_study_plan_progress_v1` | Object: planId → last completed day |
| `grounded_book_overview_cache_v1` | Cache of AI book overview responses |

---

## Mobile (iOS)

The iOS app is a **Capacitor 6** wrapper with `server.url` pointing to the production web app (`https://www.getgroundedapp.com`). The native shell provides:

- Push notifications (`@capacitor/push-notifications`)
- Local notifications (`@capacitor/local-notifications`)
- Native status bar / safe area behaviour

The web layer handles everything else. There is no native Swift code beyond the Capacitor scaffold.

### iOS CI/CD (Codemagic)

```
git push → Codemagic (mac_mini_m2)
  └─ npm ci
  └─ npm run build          (builds www/)
  └─ npx cap sync ios       (copies www/ into Xcode project)
  └─ pod install
  └─ xcode-project build-ipa
  └─ App Store Connect → TestFlight
```

---

## Build Pipeline

```
npm run build
  └─ scripts/build-www.cjs   (copies source into www/)

npm run postinstall (automatic after npm ci)
  └─ scripts/copy-capacitor-runtime.cjs
```

Local development:
- `npm run dev` — static preview via `live-server` on port 5500
- `npm run dev:api` — full stack via `vercel dev` (requires `.env.local` with `OPENAI_API_KEY`)

---

## Key Architectural Decisions

**No framework.** The frontend is entirely vanilla JS. This keeps the bundle small, eliminates dependency churn, and works offline-first without a build step for the web layer.

**Capacitor points to production.** The iOS app loads from `www.getgroundedapp.com` rather than a bundled copy. This means web updates ship instantly without an App Store release. The tradeoff is that the app requires internet for first load.

**All AI is server-side.** OpenAI keys never reach the client. Serverless functions are stateless and independently scaled per endpoint.

**No user accounts.** All state is in `localStorage`. This simplifies the architecture significantly and removes privacy/GDPR concerns around user data storage, but means data does not sync across devices.

**Cache-first service worker.** The app shell is fully cached after first visit, enabling offline use for all non-AI features. AI features gracefully degrade when offline.

---

## Dependencies

**Runtime (npm)**

| Package | Purpose |
|---|---|
| `@capacitor/local-notifications` | iOS local notification scheduling |
| `@capacitor/push-notifications` | iOS push notification registration |
| `@capacitor/assets` | Icon/splash generation |
| `@vercel/speed-insights` | Web performance analytics |

**Dev**

| Package | Purpose |
|---|---|
| `@capacitor/cli` / `@capacitor/core` / `@capacitor/ios` | Capacitor toolchain |
| `live-server` | Local static dev server |
| `typescript` | Type checking (`capacitor.config.ts`) |
