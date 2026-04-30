# Onboarding + product themes

## Files

| File | Role |
|------|------|
| `js/app-themes.js` | Maps **Neutral** / **Blush** to existing `data-theme` values (`neutral` / `soft`), persists onboarding JSON, bootstraps initial theme before the main bundle runs. |
| `js/onboarding.js` | Step UI (6 steps), local persistence, completion → Reset tab + Quick Reset modal. |
| `css/onboarding.css` | Onboarding-only layout and warm neutrals (no app-wide style changes). |
| `index.html` | Links CSS, loads scripts before `bibleData.js`, markup for `#onboardingRoot`, `GroundedThemes.bootstrap(setTheme)`, `GroundedOnboarding.init({...})`. |
| `sw.js` | Pre-cache onboarding assets; bump `CACHE_VERSION` when those files change. |

## Storage

- **Canonical:** `localStorage['grounded_onboarding_state']` — JSON with  
  `selectedTheme`, `userIntent`, `dailyTime`, `preferredTime`, `onboardingCompleted`, `step`, `version`.
- **Completion (authoritative):** `localStorage['onboardingCompleted']` — must be exactly the string `true` after the user finishes the flow; used on every launch to decide whether to show onboarding.
- **Mirrored on complete only:** `selectedTheme`, `userIntent`, `dailyTime`, `preferredTime`, `onboardingCompleted` (top-level key must be the literal string `true` after the user taps the final Continue).
- **Completion gate:** On launch, onboarding shows unless `localStorage.getItem('onboardingCompleted') === 'true'`. JSON in `grounded_onboarding_state` alone does not skip onboarding.

## Theme mapping

| Product | `document.documentElement` | Existing Settings labels |
|---------|----------------------------|---------------------------|
| `neutral` | `data-theme="neutral"` | “Neutral” |
| `blush` | `data-theme="soft"` | “Soft” (same palette) |

`setTheme()` from the main app still owns profile toggle sync; `GroundedThemes.applyProductTheme` calls it with the mapped value.
