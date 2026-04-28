# Onboarding + product themes

## Files

| File | Role |
|------|------|
| `js/app-themes.js` | Maps **Neutral** / **Blush** to existing `data-theme` values (`neutral` / `soft`), migrates legacy users, persists onboarding JSON, bootstraps initial theme before the main bundle runs. |
| `js/onboarding.js` | Step UI (6 steps), local persistence, completion → Reset tab + Quick Reset modal. |
| `css/onboarding.css` | Onboarding-only layout and warm neutrals (no app-wide style changes). |
| `index.html` | Links CSS, loads scripts before `bibleData.js`, markup for `#onboardingRoot`, `GroundedThemes.bootstrap(setTheme)`, `GroundedOnboarding.init({...})`. |
| `sw.js` | Pre-cache onboarding assets; bump `CACHE_VERSION` when those files change. |

## Storage

- **Canonical:** `localStorage['grounded_onboarding_state']` — JSON with  
  `selectedTheme`, `userIntent`, `dailyTime`, `preferredTime`, `onboardingCompleted`, `step`, `version`.
- **Mirrored on complete only:** `selectedTheme`, `userIntent`, `dailyTime`, `preferredTime`, `onboardingCompleted` (top-level keys for quick inspection).

Legacy detection (saved posts, journal, scripture progress, etc.) auto-sets `onboardingCompleted` so existing installs are not forced through the flow.

## Theme mapping

| Product | `document.documentElement` | Existing Settings labels |
|---------|----------------------------|---------------------------|
| `neutral` | `data-theme="neutral"` | “Neutral” |
| `blush` | `data-theme="soft"` | “Soft” (same palette) |

`setTheme()` from the main app still owns profile toggle sync; `GroundedThemes.applyProductTheme` calls it with the mapped value.
