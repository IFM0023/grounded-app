# Grounded — Technical Risk Report

**Date:** 2026-05-13  
**Scope:** Risks that will compound as premium features are added. No rewrites proposed — only targeted, reversible fixes.

---

## Summary

The app is well-structured for its current size. The vanilla-JS, no-framework approach is a strength for performance and simplicity. The risks below are not blockers today — they are accumulation problems. Each new premium feature added without addressing them doubles the cost of the next one.

---

## Risk 1 — Z-index Ladder Out of Control

**Severity: High**

The overlay stack has grown ad-hoc. The current layer assignments in `index.html`:

| Layer | Element | z-index |
|---|---|---|
| Bottom nav | `.bottom-nav` | 200 |
| Settings panel | `.settings-panel` | 1000 |
| Week complete overlay | `.theme-week-complete-overlay` | 1400 |
| Verse fullscreen | `.verse-fs-overlay` | 2500 |
| Share backdrop | `.verse-fs-share-backdrop` | 2515 |
| Share sheet | `.verse-fs-share-sheet` | 2520 |
| Content quote fullscreen | `.cqf-overlay` | 2650 |
| Verse breakdown modal | `.vb-overlay` | 2700 |
| **Theme education sheet** | `.theme-education-sheet` | **10,080** |

The `theme-education-sheet` at `z-index: 10080` is the tell. That value was chosen to escape a conflict — which means the ladder has already broken once and been patched by jumping to an arbitrary large number rather than fixing the stack. The verse breakdown modal at 2700 sits below `cqf-overlay` at 2650 only by 50 units, while the theme sheet has an 8000-unit gap above everything. Adding any premium modal (paywall gate, subscription sheet, cross-reference panel) will force another round of renumbering.

There is also no mechanism for exclusive modal focus. If a user triggers both `.verse-fs-overlay` and `.vb-overlay` through rapid tapping (possible on iOS with 300ms touches), both will be `open` simultaneously with no back-stack to dismiss them cleanly.

**Fix before adding more overlays:** Define a CSS token system — `--z-nav: 100`, `--z-modal: 400`, `--z-overlay: 600`, `--z-toast: 800` — and a 5-line JS modal stack that tracks what is open and what to restore focus to on close. This does not require a rewrite; it is a refactor of the CSS variables and a small utility added to the page.

---

## Risk 2 — Monolithic `index.html` (1 MB+)

**Severity: High**

`index.html` exceeds 256 KB — it could not be read as a single file by standard tools. It contains:
- All inline CSS (thousands of lines)
- All HTML for every tab, every modal, every overlay
- Inline `<script>` blocks

Every premium feature added to the app adds more CSS and HTML to this file. The parse cost is paid on every cold load. On a mid-range Android device on 4G, a 1MB+ HTML file parse can block the main thread for 200–400ms before any content paints.

There is also a single `body,body *{transition:background-color 0.3s,color 0.3s,box-shadow 0.3s,border-color 0.3s,transform 0.25s}` rule that applies CSS transitions to **every element on the page**. This is expensive during scrolling and makes any animated entrance potentially janky because unrelated elements are also transitioning.

**Fix before adding more screens:** Separate CSS into per-feature files loaded lazily, or at minimum extract the overlay/modal CSS into a `modals.css` file. Remove the `body *` transition rule and only apply transitions to the specific elements that need them (currently ~30 explicit classes already have their own transitions). This is a safe split that can be done incrementally.

---

## Risk 3 — No Central State Store (localStorage Fragmentation)

**Severity: High**

User data is split across at least 10 independently managed `localStorage` keys:

```
onboardingCompleted
grounded_onboarding_state
grounded_user_name
grounded_why
grounded_study_journal
grounded_study_plan_progress_v1
grounded_book_overview_cache_v1
lastStudyContext
grounded_study_pending_verse     ← sessionStorage
grounded_study_handoff           ← sessionStorage
grounded_sermon_notes            ← referenced in study-app.js:829 but not written anywhere visible
```

Each module defines its own `readJson`/`writeJson` helpers and reads/writes keys directly. The identical pattern exists in at least `study-app.js` and `app-themes.js`. There is no schema version on most keys — if a key's shape changes, old data silently persists in the wrong shape and the app reads it until the user clears storage.

The `grounded_book_overview_cache_v1` key stores AI responses. Each entry can be several KB; the code caps it at 80 books, which at ~3–5 KB per entry is 240–400 KB just for that one key. Combined with journal entries, plan progress, and onboarding state, the app is approaching the typical 5 MB localStorage quota on a well-used device.

The cross-module handoff via `sessionStorage` (`grounded_study_pending_verse` + `grounded_study_handoff`) is particularly fragile. On iOS, when the app is backgrounded and the WebView is suspended, `sessionStorage` can be cleared. A user who taps a verse in the Bible reader, backgrounds the app to respond to a text, and returns will find the handoff gone and the Study tab showing its landing state with no indication of why.

**Fix before adding premium data:** Create a single `store.js` module with versioned, typed read/write methods. This does not mean a reactive state system — even a simple `window.GroundedStore = { get, set, clear }` with a schema version number prevents the silent corruption that will happen when premium features add new keys.

---

## Risk 4 — Premium Gate Is UI-Only Scaffolding

**Severity: High**

The locked premium cards in `study-app.js` are static HTML:

```js
// study-app.js:296
function ctxLockedPremiumCard(title) {
  return (
    '<article class="study-ctx-card study-ctx-card--locked">' +
    CTX_LOCK_SVG +
    '<p class="study-ctx-card-label">' + esc(title) + '</p>' +
    '<p class="study-ctx-lock-copy">Go deeper with Premium</p>' +
    '</article>'
  );
}
```

Three features are locked this way: "Then vs. Now", "Cross References", and "Original Hebrew/Greek Word Study". There is:
- No subscription check (no `isPremium()` call)
- No paywall/upgrade flow wired to the tap
- No purchase receipt stored anywhere
- No server-side verification of premium status
- No distinction between "locked because not subscribed" and "locked because not yet built"

This means the first time you unlock one of these features, you have to simultaneously build: the feature itself, the subscription infrastructure, the purchase flow, the receipt verification, and the gate check — all in one PR. That is an extremely high-risk delivery.

**Fix before building any premium feature:** Add a single `isPremiumUser()` function that reads a `grounded_premium` localStorage flag (or a stub that always returns false). Wire the existing locked cards to call it and show a basic upgrade modal on tap. This is ~30 lines of code and decouples "can the gate work" from "does the feature work."

---

## Risk 5 — AI Request Management Has No Client-Side Cancellation

**Severity: Medium**

Each serverless function uses an `AbortController` with a server-side timeout (10–30 seconds depending on function). But on the client side, there is no cancellation when a user navigates away from a view mid-request. In `study-app.js`, the chapter/verse explanation is fired with a plain `fetch()` call that keeps running even if the user taps "← Back".

The practical risk: a user tapping quickly through several Bible chapters fires multiple concurrent AI requests. Each resolves eventually and calls `root.innerHTML = ...`, which replaces whatever the user is currently viewing. On a slow connection, this means the UI can be overwritten by a response from a navigation path the user abandoned 10 seconds ago.

The verse breakdown modal has its own `fetch()` call. If you open the modal, start loading, close it, then reopen it on a different verse, the first response can still land and fill the modal with the wrong verse's content.

**Fix:** Attach a request token to each navigation state. On each new navigation, increment the token. When a response arrives, check whether the token still matches the current state before calling `root.innerHTML`. This is ~10 lines in the navigation handlers and does not require restructuring the fetch calls.

---

## Risk 6 — Navigation State Is Distributed Across Four Systems

**Severity: Medium**

The app tracks active navigation state in four separate places simultaneously:

1. `body[data-active-tab]` attribute — drives CSS tab visibility
2. `.screen.active` class — drives which screen div is shown
3. `body.word-bible-open` class — drives Bible reader overlay mode
4. `state` object in `study-app.js` IIFE — drives study tab sub-navigation

These four systems do not know about each other. A consequence visible in the CSS: there are rules like:
```css
body.word-bible-open .header.app-header { display: none }
body.verse-fs-open .header.app-header { display: none }
body.content-quote-fs-open .header.app-header { display: none !important }
```

The header visibility is driven by body classes set by three separate code paths. If any one of them fails to unset its class on close — a thrown JS error, a navigated-away user, a Capacitor lifecycle interrupt — the header stays hidden or stays shown incorrectly, and no code has visibility into which class is responsible.

The study tab's internal `state` object resets to `{ view: 'home' }` on navigation, but if an error occurs mid-render, `state.view` and the actual DOM are out of sync. The only recovery is a full page reload.

**Fix:** Introduce a single `nav.setTab(tabId)` function that sets `data-active-tab`, toggles `.screen.active`, and clears the `word-bible-open`/`verse-fs-open`/`content-quote-fs-open` classes in one place. This is not a router — it is a 30-line coordinator that replaces four independent setters with one authoritative one.

---

## Risk 7 — Global Bridge Objects With No Guaranteed Shape

**Severity: Medium**

`study-app.js` communicates with the rest of the app entirely through `window.GroundedStudyBridge`, an object expected to be set by `index.html` before the module runs. The module calls `bridge().apiUrl`, `bridge().switchTab`, `bridge().openScriptureReader`, `bridge().loadChapterVerses`, `bridge().resolveStudyLandingQuery`, `bridge().getWeeklyReading`, `bridge().canonicalBook`, and others — all guarded with `typeof x === 'function'` checks.

This is a workable pattern for the current size, but has two compounding problems:

**a.** If `index.html` adds a premium feature that needs to call *into* `study-app.js`, the direction reverses. Currently `GroundedStudyApp.onTabShown()` is already being called from `index.html` — the reverse direction exists. Two-way bridge coupling without a contract definition means a typo in the bridge method name silently degrades a feature rather than throwing.

**b.** The bridge is assigned once at page load. If a premium feature needs to update the bridge (e.g., pass a `isUserPremium` function), it must patch the global object, which is fragile if the timing is wrong.

**Fix:** Document the expected shape of `GroundedStudyBridge` in a JSDoc block in `study-app.js` (not a rewrite — just the type signature). Add a single validation call on module init that warns in console if expected methods are missing. This surfaces integration bugs during development instead of in production.

---

## Risk 8 — CSS Specificity Accumulation

**Severity: Low-Medium**

The inline CSS in `index.html` has accumulated highly specific selectors to fix layout bugs:

```css
body[data-active-tab]:not([data-active-tab="feed"]) #appHeaderPageIntro {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  /* ... */
}
```

There are at least 8 `!important` declarations in the layout section alone, plus compound selectors like `#verseBreakdownModal .bf-meaning-list li`. These are not wrong — they work — but each one is a load-bearing override that makes the next feature harder to style correctly without adding another `!important`.

Adding a premium feature with its own card layout will require either matching the existing specificity (which escalates it) or accepting unintentional style leaks from the existing rules.

**Fix:** No immediate action needed. Track this as a "don't make it worse" constraint: new premium feature CSS should live in its own clearly delimited comment block (like the existing `/* ─── SETTINGS MODAL ─── */` pattern), and should not use `!important` unless targeting an existing `!important` rule.

---

## Risk 9 — `bibleData.js` Is Unquantified

**Severity: Low-Medium**

`bibleData.js` is pre-cached by the service worker and loaded synchronously before all other scripts in `index.html`. If it contains full Bible text (which is the likely intent), it is several MB of JavaScript that must be parsed on first load before the app is interactive. The cache handles repeat visits, but the first cold load on a new install — which is the onboarding moment — is where parse time matters most.

The actual size of this file was not readable (it exceeds the read limit), but it is the largest risk factor for first-contentful-paint on low-end devices.

**Fix:** Measure the current first-load parse time on a throttled device before adding any premium features. If `bibleData.js` is over 2MB, consider splitting it into Testament-level chunks loaded on demand.

---

## Recommended Pre-Premium Checklist

These are ordered by risk-of-blocking, not by effort. Items 1–3 are the minimum safe baseline before shipping a first premium feature.

| Priority | Action | Effort | Unlocks |
|---|---|---|---|
| 1 | Add `isPremiumUser()` stub + wire locked cards to show an upgrade modal | 1–2 hours | Premium gate can be tested independently of subscription build |
| 2 | Define CSS z-index token variables; fix `theme-education-sheet` to use the token | 30 min | New overlays/modals won't cause conflicts |
| 3 | Create `store.js` with `get/set/clear` wrappers for all localStorage keys | 2–3 hours | Prevents silent data corruption as new premium keys are added |
| 4 | Add navigation state coordinator (`nav.setTab`) | 2–3 hours | Eliminates header/nav visibility bugs under premium deep-link flows |
| 5 | Add request token check in study-app render paths | 1 hour | Prevents stale AI responses overwriting current view |
| 6 | Measure and document `bibleData.js` size | 30 min | Informs whether a lazy-load split is needed before premium content adds more data |
| 7 | JSDoc the `GroundedStudyBridge` shape | 1 hour | Prevents silent integration failures in premium features |

Items 4–7 can wait until the first premium feature is in progress, but should be completed before the second.
