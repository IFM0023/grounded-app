# Grounded — Phase 1 Safety & Rollback Plan

**Date:** 2026-05-13
**Phase:** 1 — `store.js` central storage layer
**Status:** Pre-implementation. No code changes have been made yet.

---

## 0. Hard Constraints (Restated)

This plan binds Phase 1 to the following rules. Any step that would violate one of these rules is out of scope for Phase 1 and gets deferred to Phase 6 or 7.

1. Do **not** break existing app functionality.
2. Do **not** remove or rewrite any existing storage system.
3. All changes must be **additive** and **reversible**.
4. Existing `localStorage` behavior must continue working **exactly as it does now**.
5. Existing users must not lose **any** saved data — onboarding state, settings, journals, streaks, saved verses, reminder preferences, themes, plan progress, or anything else inventoried in `phase-0-audit.md`.

---

## 1. Files That Will Be Touched

Phase 1 is the minimum possible change set: one new file, two existing files modified by a single addition each.

| # | Path | Status | Type of change |
|---|---|---|---|
| 1 | `js/store.js` | **NEW** | Create file. Defines `window.GroundedStore`. |
| 2 | `index.html` | Modified | Add **one** `<script src="js/store.js"></script>` tag near the existing script block (around line 5573). No other lines changed. |
| 3 | `sw.js` | Modified | Add **one** `shellUrl('js/store.js'),` entry to the `APP_SHELL` array and bump `CACHE_VERSION` from `grounded-v187` to `grounded-v188`. No other lines changed. |

**No other source files are touched.**

Specifically, the following files are **not** modified in Phase 1:

- `js/app-themes.js`
- `js/onboarding.js`
- `js/grounded-native-notifications.js`
- `js/weekly-themes.js`
- `js/study-app.js`
- `js/study-data.js`
- `js/grounded-home-weekly-themes-data.js`
- `js/grounded-home-weekly-theme-meta.js`
- `js/grounded-moment-theme-maps.js`
- `js/cap-local-notifications.js`
- `js/cap-push-notifications.js`
- `bibleData.js`
- `css/*` (no CSS change)
- `manifest.json`
- `widget.html`
- `capacitor.config.ts`
- `scripts/build-www.cjs`
- `package.json`, `package-lock.json` (already dirty for unrelated reasons; do not include in Phase 1 commit)

### 1a. Build-Time Derived Files

`scripts/build-www.cjs` copies `index.html`, `sw.js`, and the `js/` directory into `www/`. On the next `npm run build`, the following are regenerated automatically:

- `www/index.html`
- `www/sw.js`
- `www/js/store.js` (new)

These are build outputs. They are **derived** from the source changes in the table above. Do not hand-edit them.

---

## 2. Exactly What Will Change in Each File

### 2a. `js/store.js` (NEW)

A self-contained IIFE that exposes one global, `window.GroundedStore`. The contents are specified in `docs/modularization-plan.md` §1a.

Properties of this file:

- **Pure read/write wrappers** over `localStorage`, all wrapped in `try/catch`. Cannot throw.
- **No side effects on load.** The IIFE only attaches `GroundedStore` to `window`. It does not read or write any storage key during initialization.
- **No call sites yet.** Nothing in `index.html`, `app-themes.js`, `onboarding.js`, `study-app.js`, or anywhere else calls `GroundedStore.*` during Phase 1.
- **Backward-compatible accessors.** For the three dual-key legacy pairs identified in `phase-0-audit.md` §5a (`grounded_user_name`/`userName`, `grounded_bible_version`/`bibleVersion`, `grounded_reminder_type`/`reminderType`), the getters fall back to the legacy key and the setters write **both** keys. This matches current app behavior exactly.

Because nothing calls `GroundedStore` yet, this file is **dead code at runtime** during Phase 1. Loading it has the same observable effect as not loading it, aside from registering the global.

### 2b. `index.html` (one-line addition)

Current state, lines 5573–5585:

```5573:5585:index.html
  <script src="js/capacitor.js"></script>
  <script src="js/cap-local-notifications.js"></script>
  <script src="js/cap-push-notifications.js"></script>
  <script src="js/grounded-native-notifications.js"></script>
  <script src="js/app-themes.js"></script>
  <script src="js/onboarding.js"></script>
  <script src="js/grounded-home-weekly-themes-data.js"></script>
  <script src="js/grounded-home-weekly-theme-meta.js"></script>
  <script src="js/weekly-themes.js"></script>
  <script src="js/grounded-moment-theme-maps.js"></script>

  <script src="js/study-data.js"></script>
  <script src="js/study-app.js"></script>
```

Planned change: insert **exactly one line** as the first `<script src="js/...">` tag, before `capacitor.js`:

```html
  <script src="js/store.js"></script>
  <script src="js/capacitor.js"></script>
  ...
```

Nothing else in `index.html` is edited. The inline `<script>` block, all `localStorage.*` call sites, all DOM, and all CSS remain byte-identical.

**Why before all other scripts:** so that any later phase can assume `window.GroundedStore` exists. During Phase 1 this is unused, so the ordering has no observable effect.

### 2c. `sw.js` (two-line change)

Current state of `CACHE_VERSION` and `APP_SHELL`:

```13:43:sw.js
const CACHE_VERSION = 'grounded-v187';
/* Resolve shell URLs from this script's folder so the app works in a subpath. */
const SW_DIR = new URL('./', self.location.href);
function shellUrl(path) {
  return new URL(path, SW_DIR).href;
}
const INDEX_HTML = shellUrl('index.html');
const APP_SHELL = [
  SW_DIR.href,
  INDEX_HTML,
  shellUrl('widget.html'),
  shellUrl('bibleData.js'),
  shellUrl('js/app-themes.js'),
  shellUrl('js/onboarding.js'),
  shellUrl('js/grounded-home-weekly-themes-data.js'),
  shellUrl('js/grounded-home-weekly-theme-meta.js'),
  shellUrl('js/study-data.js'),
  shellUrl('js/study-app.js'),
  ...
];
```

Planned changes:

1. Bump `CACHE_VERSION` from `'grounded-v187'` to `'grounded-v188'`.
2. Add `shellUrl('js/store.js'),` to `APP_SHELL`, ideally as the first JS entry so it precaches with the other app scripts.

That's it. No fetch handler, install handler, activate handler, or SPA fallback code is touched.

**Effect of bumping `CACHE_VERSION`:** on next page load, the activate handler deletes the old cache (`grounded-v187`) and pre-caches the new app shell, which now includes `js/store.js`. This is the **existing** cache-busting mechanism — same code path the app has shipped many times.

---

## 3. Rollback Procedure

Phase 1 is designed to be revertable in three independent ways, in increasing order of speed.

### 3a. Level 1 — Git revert (the primary mechanism)

If Phase 1 has been committed as a single atomic commit:

```powershell
git revert <phase-1-commit-sha>
```

This re-deletes `js/store.js`, restores the script tag in `index.html`, and restores `sw.js` to `grounded-v187`. The working tree returns to byte-identical state.

If Phase 1 has not yet been committed:

```powershell
git restore --staged js/store.js index.html sw.js
git restore index.html sw.js
git clean -f js/store.js
```

### 3b. Level 2 — Branch-level rollback

The recommended workflow is to do Phase 1 on a feature branch:

```powershell
git checkout -b phase-1-store
# ... implement Phase 1 ...
git checkout main          # rollback = check out main, ignore the branch
git branch -D phase-1-store  # optional, only after you're sure
```

This makes rollback a no-op: you simply never merge `phase-1-store` into `main`.

### 3c. Level 3 — Manual file rollback (if git is unavailable)

| File | Rollback action |
|---|---|
| `js/store.js` | Delete the file. |
| `index.html` | Remove the single inserted `<script src="js/store.js"></script>` line. |
| `sw.js` | Change `'grounded-v188'` back to `'grounded-v187'` and delete the `shellUrl('js/store.js'),` line. |
| `www/*` (if rebuilt) | Run `npm run build` after the source rollback to regenerate. |

### 3d. Service worker cache rollback note

If `CACHE_VERSION` was bumped and users have loaded Phase 1 before the rollback, their service worker will hold cache `grounded-v188`. When the rollback ships (whether by revert or by deploying the next version with `grounded-v189` or a re-bump), the activate handler will delete `grounded-v188` and reinstall the app shell. No user data in `localStorage` is touched by this — service worker caches and `localStorage` are entirely separate stores in the browser.

### 3e. Recovery time estimate

| Scenario | Recovery time |
|---|---|
| Uncommitted local changes | < 30 seconds (`git restore` + `git clean`) |
| Committed, not pushed | < 1 minute (`git reset --hard HEAD~1`) |
| Committed and pushed, not deployed | < 2 minutes (`git revert`, push) |
| Deployed to web (Vercel) | < 5 minutes (revert + redeploy via Vercel dashboard) |
| Deployed to iOS via Capacitor | Next App Store / TestFlight build cycle — **but Phase 1 cannot break the iOS app** because no behavior changes (see §4 below) |

---

## 4. Confirmation: No Existing Functionality Is Removed

Audit of each constraint:

| Existing behavior | Removed in Phase 1? | Why not |
|---|---|---|
| All 176 `localStorage.*` calls in `index.html` | **No** | The inline `<script>` block is not edited. |
| 30 `localStorage.*` calls in `onboarding.js` | **No** | File not edited. |
| 15 calls in `grounded-native-notifications.js` | **No** | File not edited. |
| 7 calls in `app-themes.js` | **No** | File not edited. |
| 5 calls in `study-app.js` | **No** | File not edited. |
| 4 calls in `weekly-themes.js` | **No** | File not edited. |
| `readJson`/`writeJson` helpers in `study-app.js` | **No** | File not edited. |
| Onboarding completion gate (`onboardingCompleted`) | **No** | Not read or written by Phase 1 code. |
| Onboarding state object (`grounded_onboarding_state`) | **No** | Same. |
| Streak / engagement keys (`lastCheckInDate`, `groundedDaysCount`, etc.) | **No** | Same. |
| Saved verses, journals, prayers, declarations, Scripture+ saves | **No** | Same. |
| Reminder settings (all 8 keys) | **No** | Same. |
| Bible version, theme, focus, rhythm settings | **No** | Same. |
| Cross-tab handoff via `sessionStorage` | **No** | Phase 1 does not touch `sessionStorage` at all. |
| Service worker fetch / install / activate / SPA fallback logic | **No** | Only `CACHE_VERSION` and one `APP_SHELL` entry change. |
| iOS WebView behavior | **No** | iOS picks up the new `js/store.js` via the existing Capacitor sync; the file is never invoked, so behavior is identical to current iOS build. |
| Vercel deployment | **No** | One additional static asset (`js/store.js`) is served; no `/api/*` routes touched. |

**Result:** Phase 1 removes zero behavior and zero functionality.

---

## 5. Confirmation: Phase 1 Is Infrastructure-Only, No Migration

Per `docs/modularization-plan.md` §1c, Phase 1 explicitly states:

> *"No existing behavior changed (nothing in the app calls `GroundedStore` yet)"*

Audit of each kind of migration that is **deferred** out of Phase 1:

| Migration | Phase | Why not in Phase 1 |
|---|---|---|
| Replace `localStorage.getItem('grounded_user_name')` in `index.html` with `GroundedStore.getUserName()` | Phase 6 (Group B) | Migrating callers risks behavior change. Phase 1 ships the shim only. |
| Replace `localStorage.getItem('grounded_theme')` callers | Phase 6 (Group A) | Same. |
| Replace `readJson`/`writeJson` calls in `study-app.js` | Phase 7c | Same. |
| Retire `LS_DAILY_ON`, `LS_TIME`, `LS_THEME_TITLE` constants in `grounded-native-notifications.js` | Phase 7 | Same. |
| Retire duplicate `GROUNDED_THEME_OVERRIDE_KEY` in `weekly-themes.js` | Phase 7 | Same. |
| Consolidate the 5 write sites of `grounded_journal_entries` | Phase 6 | Requires touching `index.html`. Not in Phase 1. |
| Stop writing `grounded_last_study_chapter` (no reader) | Phase 6 or 7 | Touches existing write sites. Not in Phase 1. |
| Fix the misleading `reminderType` "canonical" comment | Phase 6 | Touches `index.html` content. Not in Phase 1. |
| Schema-version migration of any key | Future phase (post-7) | Phase 1 ships `SCHEMA_VERSION = 1`, no migrator runs. |

**The only thing Phase 1 ships is:**

1. A new file that registers `window.GroundedStore`.
2. A `<script>` tag that loads it.
3. A service worker entry that caches it.

No call site in the app uses any method on `GroundedStore`. The app continues to read and write `localStorage` exactly as it does today.

---

## 6. Recommended Backup / Snapshot Procedure

Run **all six** steps below before creating `js/store.js`. They are ordered fastest-first; the first three are mandatory, the last three are recommended for full safety.

### Step 1 — Commit or stash pre-existing dirty state (mandatory)

The working tree currently has uncommitted changes:

```
 M package-lock.json
 M package.json
?? architecture-report.md
?? docs/modularization-plan.md
?? docs/phase-0-audit.md
?? docs/technical-risk-report.md
?? docs/phase-1-safety-plan.md   (this file)
```

These are **not** part of Phase 1. Commit (or stash) them separately so the Phase 1 commit can be isolated and reverted cleanly.

Suggested:

```powershell
git add docs/ architecture-report.md
git commit -m "docs: phase 0 audit, modularization plan, risk report, phase 1 safety plan"

# Decide separately whether to commit the package.json / package-lock.json drift.
git status
```

### Step 2 — Create a feature branch for Phase 1 (mandatory)

```powershell
git checkout -b phase-1-store
```

All Phase 1 work happens on this branch. `main` stays untouched until verification passes.

### Step 3 — Tag the pre-Phase-1 commit (mandatory)

```powershell
git tag pre-phase-1 main
git push origin pre-phase-1   # optional but recommended
```

This gives you a named anchor to return to:

```powershell
git checkout pre-phase-1   # back to exact pre-Phase-1 state
```

### Step 4 — Take a full working-tree snapshot (recommended)

For belt-and-suspenders safety against accidental file deletion in `node_modules` or the working tree:

```powershell
# From the repo's parent directory:
Compress-Archive -Path .\grounded-app -DestinationPath .\grounded-app-pre-phase-1.zip -Force
```

Or rsync to a backup folder:

```powershell
# From the repo's parent directory:
robocopy .\grounded-app .\grounded-app-pre-phase-1 /MIR /XD node_modules .vercel /XF .env.local
```

### Step 5 — Capture a live-device `localStorage` snapshot (recommended)

This protects against the only Phase 1 risk that is **not** code-level: a user who hits the Phase 1 build mid-session.

On a real device (or any browser DevTools), in the Console for the deployed app:

```js
copy(JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
```

Save the clipboard contents to a file (`localStorage-snapshot-pre-phase-1.json`) and store it somewhere outside the repo. If anything goes wrong post-deploy, an individual user's keys can be restored by pasting back:

```js
const snap = /* paste JSON */;
for (const [k, v] of Object.entries(snap)) localStorage.setItem(k, v);
```

You should do this for at least one device per user category:

- A device that has completed onboarding
- A device mid-onboarding (if available)
- A device with a populated journal and saved verses

### Step 6 — Verify the service worker version baseline (recommended)

On a deployed instance, open DevTools → Application → Service Workers and confirm the active version is `grounded-v187`. Note the timestamp. If Phase 1 causes any cache-related regression, you have a reference point.

---

## 7. Post-Implementation Verification Steps

After Phase 1 is implemented (but before merging to `main`), run the following on a clean browser profile and on a profile that has completed onboarding:

| # | Check | Pass criterion |
|---|---|---|
| 1 | Open the app | Loads without console errors related to `js/store.js`. |
| 2 | Open DevTools Console, type `window.GroundedStore` | Returns the object, not `undefined`. |
| 3 | Run `GroundedStore.getUserName()` | Returns the same string as `localStorage.getItem('grounded_user_name') \|\| localStorage.getItem('userName') \|\| ''`. |
| 4 | Run `GroundedStore.isOnboardingComplete()` | Returns `true` on a device that has completed onboarding; `false` otherwise. |
| 5 | Inspect `localStorage` in DevTools → Application → Local Storage | Same keys, same values as before Phase 1. |
| 6 | Walk through every tab (Feed, Word, Reflect, Prayer, Reset, Study) | All render and behave identically to pre-Phase-1. |
| 7 | Trigger onboarding replay | Completes normally. |
| 8 | Save a verse, complete a check-in, add a journal entry | All persist and read back correctly on reload. |
| 9 | Open settings; toggle a reminder; change Bible version | All settings persist and the legacy mirror keys are still written. |
| 10 | DevTools → Application → Cache Storage → `grounded-v188` | Contains `js/store.js` alongside the other shell files. |
| 11 | Reload twice; confirm `grounded-v187` cache is gone (only `grounded-v188` remains) | Activate handler ran correctly. |
| 12 | Search `index.html` and all `js/*.js` files | Zero call sites use `GroundedStore.*` — Phase 1 must not migrate any caller. |

If any check fails, do not merge. Rollback per §3 and diagnose.

---

## 8. Rollback Triggers

These are conditions that should cause an **immediate** rollback before Phase 1 is merged or deployed:

- Any console error mentioning `store.js` on initial page load.
- `window.GroundedStore` is `undefined` after page load.
- Any difference in `localStorage` contents pre- vs post-Phase-1 page load for the same user state.
- Any tab fails to render, or any modal fails to open.
- Service worker fails to install or activate with `CACHE_VERSION = grounded-v188`.
- Verification check 12 fails — i.e. someone accidentally migrated a caller within the Phase 1 change set.

---

## 9. Summary

| Question | Answer |
|---|---|
| Files touched | 3 (`js/store.js` new, `index.html` +1 line, `sw.js` +1 line + version bump) |
| Existing files rewritten | 0 |
| Existing functionality removed | 0 |
| Existing `localStorage` calls migrated | 0 (deferred to Phases 6–7) |
| User data at risk | None — Phase 1 does not read or write any storage key at runtime |
| Reversibility | Single-commit revert; or branch never merged |
| Required snapshots before starting | Branch + tag + zipped working tree |
| Recommended additional snapshots | Live-device `localStorage` JSON, service worker version baseline |

Phase 1 is the safest possible step the modularization plan defines. It exists precisely so that everything riskier (Phases 6 and 7) can be done one key at a time on top of an already-shipped, already-tested shim layer.
