# Grounded — Phased Modularization Plan

**Date:** 2026-05-13  
**Constraint:** No framework migration. No app rewrites. Every phase must be independently releasable and independently revertable.

---

## Guiding Principles

1. **Ship nothing broken.** Each phase ends with the app in a better state than it started, not a worse-but-in-progress state.
2. **New files before changed files.** Create the new infrastructure first, then migrate callers one at a time.
3. **The build system is a file copy.** Adding a new file to `js/` or `css/` means adding it to three places: the `<script>`/`<link>` in `index.html`, the `APP_SHELL` array in `sw.js`, and (for JS files) the build already picks up the entire `js/` dir automatically.
4. **Don't fix what isn't broken yet.** Reading plans, weekly themes, onboarding steps — these are working and isolated. Leave them alone until a premium feature actually needs to touch them.
5. **Every phase has a definition of done.** If the criteria aren't met, the phase isn't complete.

---

## Phase Map

```
Phase 0 │ Pre-work: audit + measure              (1–2 hrs)
Phase 1 │ store.js: central storage layer        (3–4 hrs)
Phase 2 │ CSS extraction: split index.html CSS   (2–3 hrs)
Phase 3 │ Z-index tokens + modal stack manager   (2–3 hrs)
Phase 4 │ entitlement.js: premium gate           (2–3 hrs)
Phase 5 │ nav.js: navigation coordinator         (3–4 hrs)
Phase 6 │ Migrate index.html to store.js         (4–6 hrs, can be spread across sessions)
Phase 7 │ Migrate JS modules to store.js         (2–3 hrs)
```

Phases 1–4 are independent and can run in any order.  
Phase 5 should follow Phase 3 (they share the modal/body-class problem).  
Phases 6–7 should follow Phase 1.

---

## Phase 0 — Pre-work

**Goal:** Know exactly what you're working with before touching anything.

### 0a. Measure bibleData.js

```
# In PowerShell
(Get-Item bibleData.js).Length / 1MB
```

If it is under 2 MB, no action needed. If it is over 3 MB, add a note to split it by Testament in Phase 6. This measurement informs whether Phase 6 needs a lazy-load split.

### 0b. Full localStorage key inventory

The grep below finds every key string used in `index.html` and the JS files. Run it, deduplicate, and produce a single table. This becomes the schema for `store.js`.

```
# All localStorage keys across the project (excluding node_modules)
grep -ohE "localStorage\.(getItem|setItem|removeItem)\(['\"][^'\"]+['\"]" \
  index.html js/*.js | grep -ohE "'[^']+'|\"[^\"]+\"" | sort -u
```

Known keys already identified (not exhaustive — the audit will add more):

| Key | Owner | Type | Notes |
|---|---|---|---|
| `onboardingCompleted` | app-themes.js | `"true"` string | Auth gate |
| `grounded_onboarding_state` | app-themes.js, onboarding.js | JSON object | |
| `grounded_user_name` | onboarding.js | string | |
| `userName` | index.html | string | Legacy alias for `grounded_user_name` |
| `grounded_why` | index.html | JSON array | |
| `grounded_feeling` | index.html | string | |
| `grounded_feeling_date` | index.html | string | |
| `grounded_feeling_onboarding_preset` | index.html | `"1"` flag | |
| `grounded_theme` | index.html | string | `"soft"` or `"neutral"` |
| `grounded_lastIdx` | index.html | JSON number | |
| `grounded_saved` | index.html | JSON array | |
| `activeTab` | index.html | string | |
| `bibleVersion` | index.html | string | Legacy alias |
| `grounded_bible_version` | index.html | string | |
| `reminderType` | index.html | string | |
| `grounded_time_pref` | index.html | string | |
| `grounded_time_of_day` | index.html | string | |
| `grounded_onboarding_completed_day` | index.html | date string | |
| `grounded_weekly_theme_notify_title` | index.html | string | |
| `grounded_theme_choice_note` | index.html | `"1"` flag | |
| `grounded_current_verse` | index.html | string | |
| `selectedMood` | index.html | string | Legacy |
| `grounded_study_journal` | study-app.js | JSON array | max 200 |
| `grounded_study_plan_progress_v1` | study-app.js | JSON object | |
| `grounded_book_overview_cache_v1` | study-app.js | JSON object | max 80 entries |
| `lastStudyContext` | study-app.js | JSON object | |
| `grounded_sermon_notes` | study-app.js | JSON array | Read-only; writer unknown |
| `grounded_premium` | (does not exist yet) | `"true"` flag | Reserved for Phase 4 |

### 0c. Definition of done

- [ ] `bibleData.js` size is documented
- [ ] Full localStorage key table is complete (run the grep, add any missing rows)
- [ ] Z-index ladder table matches the one in `technical-risk-report.md` (verify no new values were added since the audit)

---

## Phase 1 — `store.js`: Central Storage Layer

**Goal:** One place to read and write every `localStorage` key. Nothing in the app uses it yet — this phase only creates the module.

**Break risk: Very Low.** This phase creates a new file and registers it. It does not touch any existing code.

### 1a. Create `js/store.js`

The module exposes a single global `window.GroundedStore`. It provides:
- Typed getters/setters for every known key
- A migration shim for dual-key legacy pairs
- A safe JSON wrapper (never throws on corrupt data)
- A schema version number for future migrations

```js
// js/store.js
(function (global) {
  'use strict';

  var SCHEMA_VERSION = 1;

  // ─── Safe JSON helpers ───────────────────────────────────────────────────
  function safeGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return raw;
    } catch (_) { return fallback; }
  }

  function safeGetJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (_) { return fallback; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function safeSetJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  // ─── Legacy dual-key migration ───────────────────────────────────────────
  // Some keys exist under two names from a partial rename.
  // Always write both; read from the new name with fallback to old.
  function legacyGet(preferredKey, legacyKey, fallback) {
    var v = safeGet(preferredKey, null);
    if (v !== null) return v;
    var leg = safeGet(legacyKey, null);
    if (leg !== null) {
      safeSet(preferredKey, leg); // migrate forward
      return leg;
    }
    return fallback;
  }

  function legacySet(preferredKey, legacyKey, value) {
    safeSet(preferredKey, value);
    safeSet(legacyKey, value); // keep in sync until callers are fully migrated
  }

  // ─── Public API ──────────────────────────────────────────────────────────
  var Store = {

    // Onboarding
    isOnboardingComplete: function () {
      return safeGet('onboardingCompleted', '') === 'true';
    },
    setOnboardingComplete: function () {
      safeSet('onboardingCompleted', 'true');
    },
    getOnboardingState: function () {
      return safeGetJson('grounded_onboarding_state', null);
    },
    setOnboardingState: function (obj) {
      safeSetJson('grounded_onboarding_state', obj);
    },

    // User identity
    getUserName: function () {
      return legacyGet('grounded_user_name', 'userName', '');
    },
    setUserName: function (name) {
      legacySet('grounded_user_name', 'userName', name);
    },

    // Theme
    getTheme: function () {
      return safeGet('grounded_theme', 'soft');
    },
    setTheme: function (t) {
      safeSet('grounded_theme', t);
    },

    // Bible version
    getBibleVersion: function () {
      return legacyGet('grounded_bible_version', 'bibleVersion', 'KJV');
    },
    setBibleVersion: function (v) {
      legacySet('grounded_bible_version', 'bibleVersion', v);
    },

    // Active tab
    getActiveTab: function () {
      return safeGet('activeTab', 'feed');
    },
    setActiveTab: function (tab) {
      safeSet('activeTab', tab);
    },

    // Feeling / mood
    getFeeling: function () {
      return { mood: safeGet('grounded_feeling', ''), date: safeGet('grounded_feeling_date', '') };
    },
    setFeeling: function (mood, date) {
      safeSet('grounded_feeling', mood);
      safeSet('grounded_feeling_date', date);
    },
    clearFeeling: function () {
      safeRemove('grounded_feeling');
      safeRemove('grounded_feeling_date');
      safeRemove('grounded_current_verse');
      safeRemove('selectedMood'); // legacy key
    },

    // Study journal
    getJournalEntries: function () {
      var a = safeGetJson('grounded_study_journal', []);
      return Array.isArray(a) ? a : [];
    },
    pushJournalEntry: function (entry) {
      var a = this.getJournalEntries();
      a.unshift(entry);
      safeSetJson('grounded_study_journal', a.slice(0, 200));
    },

    // Study plan progress
    getPlanProgress: function () {
      var o = safeGetJson('grounded_study_plan_progress_v1', {});
      return o && typeof o === 'object' ? o : {};
    },
    setPlanDay: function (planId, day) {
      var o = this.getPlanProgress();
      o[planId] = { day: Math.max(0, Math.min(6, day | 0)) };
      safeSetJson('grounded_study_plan_progress_v1', o);
    },

    // Book overview cache
    getBookOverview: function (book) {
      var c = safeGetJson('grounded_book_overview_cache_v1', {});
      return c && typeof c === 'object' ? c[String(book).trim()] || null : null;
    },
    setBookOverview: function (book, data) {
      var c = safeGetJson('grounded_book_overview_cache_v1', {});
      if (!c || typeof c !== 'object') c = {};
      c[String(book).trim()] = data;
      var keys = Object.keys(c);
      if (keys.length > 80) keys.slice(0, keys.length - 80).forEach(function (k) { delete c[k]; });
      safeSetJson('grounded_book_overview_cache_v1', c);
    },

    // Last study context (cross-tab handoff)
    getLastStudyContext: function () {
      var o = safeGetJson('lastStudyContext', null);
      if (!o || !o.book || !o.chapter) return null;
      return { book: String(o.book), chapter: parseInt(o.chapter, 10) || 1 };
    },
    setLastStudyContext: function (book, chapter) {
      safeSetJson('lastStudyContext', { book: book, chapter: chapter });
    },

    // Saved verses
    getSavedIds: function () {
      var a = safeGetJson('grounded_saved', []);
      return Array.isArray(a) ? a : [];
    },
    setSavedIds: function (arr) {
      safeSetJson('grounded_saved', arr);
    },

    // Premium entitlement (Phase 4 will use this)
    isPremiumUser: function () {
      return safeGet('grounded_premium', '') === 'true';
    },
    setPremiumUser: function (val) {
      safeSet('grounded_premium', val ? 'true' : 'false');
    },

    // Reminder type
    getReminderType: function () {
      return legacyGet('grounded_reminder_type', 'reminderType', '');
    },
    setReminderType: function (v) {
      legacySet('grounded_reminder_type', 'reminderType', v);
    },

    // Schema version (reserved for future migrations)
    SCHEMA_VERSION: SCHEMA_VERSION
  };

  global.GroundedStore = Store;

}(window));
```

### 1b. Wire it into the page

In `index.html`, add before all other `<script src="...">` tags:
```html
<script src="js/store.js"></script>
```

In `sw.js`, add to `APP_SHELL`:
```js
shellUrl('js/store.js'),
```

### 1c. Definition of done

- [ ] `js/store.js` exists and loads without errors on page load
- [ ] `window.GroundedStore` is accessible in the browser console
- [ ] `GroundedStore.getUserName()` returns the same value as `localStorage.getItem('grounded_user_name') || localStorage.getItem('userName')`
- [ ] `GroundedStore.isOnboardingComplete()` returns `true` on a device that has completed onboarding
- [ ] No existing behavior changed (nothing in the app calls `GroundedStore` yet)

---

## Phase 2 — CSS Extraction

**Goal:** Move all modal, overlay, and component CSS out of `index.html` into separate files. This makes `index.html` smaller, makes individual CSS sections editable without searching through thousands of lines, and sets up the z-index token work in Phase 3.

**Break risk: Low.** This is a pure cut-and-paste refactor. Styles are moved, not changed.

### 2a. Files to create

| File | Contents | Approximate line count |
|---|---|---|
| `css/tokens.css` | All CSS custom properties from `:root`, theme blocks, spacing scale | ~60 lines |
| `css/reset.css` | The `*,*::before` reset, `html`, `body`, `button`, `a`, `img` rules | ~30 lines |
| `css/typography.css` | Font family declarations, `.serif`, `.script`, `.display-font`, `.body-font`, the labeled font blocks | ~80 lines |
| `css/layout.css` | `.main-container`, `.header.app-header`, `.bottom-nav`, `.screen`, `.app-shell-screen`, `@keyframes fadeIn` | ~80 lines |
| `css/modals.css` | All overlay/sheet CSS: `.settings-overlay`, `.vb-overlay`, `.verse-fs-overlay`, `.cqf-overlay`, `.theme-education-sheet`, `.theme-picker-overlay`, `.theme-week-complete-overlay`, `.reflect-journey-detail-overlay`, `.gm-modal-layer` | ~200 lines |
| `css/cards.css` | `.verse-card`, `.reflection-card`, `.study-verse-card`, `.word-vod-card` | ~60 lines |
| `css/home.css` | All `.home-*`, `.walk-with-god`, `.guided-moment-screen`, weekly theme block styles | ~300 lines |
| `css/study.css` | All `.study-*`, `.word-bible-shell`, `.bf-*`, `.cr-*` | ~300 lines |
| `css/prayer.css` | `#prayerScreen`, `.prayer-*`, `.pgp-*` | ~80 lines |
| `css/scripture.css` | `.word-screen`, `.scripture-screen`, `#screen-scriptureplus`, `.spx-*` | ~150 lines |

The existing `css/onboarding.css` already exists — leave it as-is.

### 2b. Load order in `index.html`

Replace the entire `<style>` block in `<head>` with:

```html
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/typography.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/cards.css">
<link rel="stylesheet" href="css/home.css">
<link rel="stylesheet" href="css/study.css">
<link rel="stylesheet" href="css/prayer.css">
<link rel="stylesheet" href="css/scripture.css">
<link rel="stylesheet" href="css/modals.css">
<link rel="stylesheet" href="css/onboarding.css">
```

**Important:** The `body,body *{transition:...}` wildcard rule should **not** be moved — it should be deleted. The specific elements that need transitions already have their own `transition:` declarations. Deleting the wildcard rule is the one change that is not a pure move.

### 2c. Wire into build and service worker

In `build-www.cjs`, the `dirs` array already includes `'css'`, so all new files are automatically copied. No build change needed.

In `sw.js`, add each new CSS file to `APP_SHELL`:
```js
shellUrl('css/tokens.css'),
shellUrl('css/reset.css'),
shellUrl('css/typography.css'),
shellUrl('css/layout.css'),
shellUrl('css/cards.css'),
shellUrl('css/home.css'),
shellUrl('css/study.css'),
shellUrl('css/prayer.css'),
shellUrl('css/scripture.css'),
shellUrl('css/modals.css'),
```

Bump `CACHE_VERSION` in `sw.js`.

### 2d. Definition of done

- [ ] `index.html` has no `<style>` block
- [ ] App renders identically to before on both themes (soft and neutral)
- [ ] All modals, overlays, and sheets open and close correctly
- [ ] Service worker pre-caches all new CSS files (verify in DevTools → Application → Cache)
- [ ] The wildcard `body *{transition}` rule is gone; spot-check that tab transitions and card press animations still work

---

## Phase 3 — Z-index Tokens + Modal Stack Manager

**Goal:** Replace ad-hoc z-index numbers with CSS tokens. Introduce a tiny JS utility that tracks which overlay is currently open, so that closing one overlay doesn't leave a conflicting body class behind.

**Break risk: Low for tokens, Medium for stack manager.** Token replacement is mechanical and visually verifiable. The stack manager is a new file that existing code opts into gradually.

### 3a. Z-index token system in `css/tokens.css`

Add to the `:root` block (these go alongside the existing spacing and color tokens):

```css
:root {
  /* ─── Z-INDEX SCALE ─── */
  --z-content:    1;      /* in-flow content layers */
  --z-sticky:    12;      /* sticky headers within panels */
  --z-chrome:   100;      /* app header, floating toolbars */
  --z-nav:      200;      /* bottom nav */
  --z-panel:    400;      /* settings panel, bible shell overlay */
  --z-modal:    600;      /* sheets, bottom drawers (theme-picker, education sheet) */
  --z-overlay:  800;      /* fullscreen overlays (verse-fs, cqf, vb-overlay) */
  --z-toast:   1000;      /* toasts, transient notifications */
  /* Always add new layers here rather than hardcoding. */
}
```

Then in `css/modals.css`, replace every hardcoded z-index with its token:

| Current value | Token to use | Element |
|---|---|---|
| `z-index: 90` | `var(--z-panel)` | `.word-bible-shell` |
| `z-index: 120` | `var(--z-chrome)` | `.scripture-highlight-toolbar`, `.gm-modal-layer` |
| `z-index: 158`/`160` | `var(--z-panel)` | `.spx-browse-layer`, `.spx-passage-layer` |
| `z-index: 200` | `var(--z-nav)` | `.bottom-nav` |
| `z-index: 960` | `var(--z-modal)` | `.theme-picker-overlay` |
| `z-index: 999`/`1000` | `var(--z-modal)` | `.settings-overlay`, `.settings-panel` |
| `z-index: 1400` | `var(--z-overlay)` | `.theme-week-complete-overlay`, `.reflect-journey-detail-overlay` |
| `z-index: 2500`–`2700` | `var(--z-overlay)` | `.verse-fs-overlay`, `.cqf-overlay`, `.vb-overlay` |
| `z-index: 2600` | `var(--z-toast)` | `.verse-fs-toast` |
| **`z-index: 10080`** | **`var(--z-overlay)`** | **`.theme-education-sheet`** — the outlier; bringing it back into the scale fixes the breakage that caused it to be 10080 in the first place |

**Note on the theme-education-sheet fix:** Its z-index of 10080 means it was being obscured by something. Before changing its value, identify what was covering it. The likely culprit is `.vb-overlay` at 2700 or `.cqf-overlay` at 2650. The fix is ensuring those overlays are closed before the education sheet opens, which the modal stack (below) handles.

### 3b. `js/modal-stack.js`

A minimal stack tracker. It does not manage animations or DOM — that stays in the existing code. It only tracks what is currently open, enforces single-active-overlay at a time for the fullscreen layers, and provides a consistent close-all path.

```js
// js/modal-stack.js
(function (global) {
  'use strict';

  // Stack of currently open modal IDs, most-recent-first.
  var _stack = [];

  // Registry: id → { open: fn, close: fn, isOpen: fn }
  var _registry = {};

  var ModalStack = {

    // Register a modal so the stack knows how to open and close it.
    // id        — unique string key (e.g. 'verse-fs', 'vb', 'settings')
    // handlers  — { open: fn, close: fn, isOpen: fn }
    register: function (id, handlers) {
      _registry[id] = handlers;
    },

    // Open a modal by id. Optionally close others first.
    open: function (id, opts) {
      var options = opts || {};
      if (!_registry[id]) { return; }
      // If already open, do nothing.
      if (_registry[id].isOpen()) { return; }
      // Close the topmost open overlay if exclusive mode (default true for fullscreens).
      if (options.exclusive !== false) {
        var top = _stack[0];
        if (top && _registry[top] && _registry[top].isOpen()) {
          _registry[top].close();
          _stack.shift();
        }
      }
      _registry[id].open();
      _stack.unshift(id);
    },

    // Close a specific modal by id.
    close: function (id) {
      if (!_registry[id]) { return; }
      _registry[id].close();
      _stack = _stack.filter(function (s) { return s !== id; });
    },

    // Close whatever is on top of the stack (back-button / swipe-down behavior).
    closeLast: function () {
      var top = _stack[0];
      if (top) { this.close(top); }
    },

    // Close everything — used during tab switches.
    closeAll: function () {
      _stack.slice().forEach(function (id) {
        if (_registry[id]) { _registry[id].close(); }
      });
      _stack = [];
    },

    // Check if any overlay is open (for back-button interception).
    hasOpen: function () {
      return _stack.length > 0;
    },

    // Returns the top-of-stack id, or null.
    current: function () {
      return _stack[0] || null;
    }

  };

  global.ModalStack = ModalStack;

}(window));
```

### 3c. Wire it into the page

In `index.html`, after `store.js` and before all other `<script src="...">` tags:
```html
<script src="js/modal-stack.js"></script>
```

In `sw.js`, add:
```js
shellUrl('js/modal-stack.js'),
```

### 3d. Register existing modals (in the main `<script>` block in `index.html`)

Find the initialization block near line 5587 and add registrations. This is **opt-in** — unregistered modals continue working exactly as before:

```js
// Register modals with the stack after DOM is ready.
// Pattern for each: tell ModalStack how to open/close this modal
// using the same DOM manipulation that already exists.

ModalStack.register('settings', {
  isOpen:  function () { return !!document.querySelector('.settings-overlay.open'); },
  open:    function () { /* existing openSettings() call */ },
  close:   function () { /* existing closeSettings() call */ }
});

ModalStack.register('verse-fs', {
  isOpen:  function () { return document.body.classList.contains('verse-fs-open'); },
  open:    function () { /* existing openVerseFs() call */ },
  close:   function () { /* existing closeVerseFs() call */ }
});

ModalStack.register('vb', {
  isOpen:  function () { return !!document.querySelector('.vb-overlay.open'); },
  open:    function () { /* existing openVb() call */ },
  close:   function () { /* existing closeVb() call */ }
});

ModalStack.register('cqf', {
  isOpen:  function () { return document.body.classList.contains('content-quote-fs-open'); },
  open:    function () { /* existing openCqf() call */ },
  close:   function () { /* existing closeCqf() call */ }
});

ModalStack.register('theme-education', {
  isOpen:  function () { return !!document.querySelector('.theme-education-sheet--open'); },
  open:    function () { /* existing open call */ },
  close:   function () { /* existing close call */ }
});
```

### 3e. Definition of done

- [ ] All z-index values in `css/modals.css` use CSS token variables (no raw numbers)
- [ ] `theme-education-sheet` z-index is back in the token scale (at `var(--z-overlay)`)
- [ ] `window.ModalStack` is accessible in the console
- [ ] Opening the verse fullscreen, then trying to open the verse breakdown modal from behind it — one closes before the other opens
- [ ] The app header hides correctly when fullscreen overlays open (existing body class behavior unchanged)

---

## Phase 4 — `entitlement.js`: Premium Gate Infrastructure

**Goal:** Introduce a real premium entitlement check. Wire the three currently-fake locked cards in `study-app.js` to show an upgrade prompt on tap. Build the gate cleanly so adding real in-app purchase later is a one-file change.

**Break risk: Very Low.** This phase adds new behavior (tap handler on locked cards) without changing any existing behavior.

### 4a. Create `js/entitlement.js`

```js
// js/entitlement.js
(function (global) {
  'use strict';

  // Feature keys — every gated feature is listed here.
  // Adding a new premium feature: add a key here, pass it to canAccess().
  var FEATURES = {
    THEN_VS_NOW:          'then_vs_now',
    CROSS_REFERENCES:     'cross_references',
    WORD_STUDY:           'word_study',
    // Future features get added here, not scattered through the codebase.
  };

  function isPremiumUser() {
    // Phase 4: localStorage flag only (stub).
    // Phase N (IAP integration): replace this body with receipt verification.
    // The rest of the app never calls localStorage directly for this check.
    if (global.GroundedStore) {
      return global.GroundedStore.isPremiumUser();
    }
    try {
      return localStorage.getItem('grounded_premium') === 'true';
    } catch (_) {
      return false;
    }
  }

  function canAccess(featureKey) {
    // For now, all features require premium.
    // Future: individual features can be unlocked differently (free trial, etc.)
    return isPremiumUser();
  }

  // Called when a locked card is tapped.
  // Shows a placeholder upgrade sheet. Replace with real paywall in Phase N.
  function promptUpgrade(featureKey, sourceEl) {
    var el = document.getElementById('premiumUpgradeSheet');
    if (!el) {
      // Render the placeholder sheet if it doesn't exist yet.
      el = document.createElement('div');
      el.id = 'premiumUpgradeSheet';
      el.className = 'premium-upgrade-sheet';
      el.innerHTML = [
        '<div class="premium-upgrade-backdrop" id="premiumUpgradeBackdrop"></div>',
        '<div class="premium-upgrade-panel">',
        '  <button class="premium-upgrade-close" id="premiumUpgradeClose" aria-label="Close">✕</button>',
        '  <p class="premium-upgrade-kicker">GROUNDED PREMIUM</p>',
        '  <h2 class="premium-upgrade-title">Go deeper</h2>',
        '  <p class="premium-upgrade-body">Cross references, original language study, historical context, and more — coming soon.</p>',
        '  <button class="premium-upgrade-cta" id="premiumUpgradeCta">Join the waitlist</button>',
        '</div>'
      ].join('');
      document.body.appendChild(el);

      document.getElementById('premiumUpgradeBackdrop').onclick = Entitlement.closeUpgradeSheet;
      document.getElementById('premiumUpgradeClose').onclick   = Entitlement.closeUpgradeSheet;
      document.getElementById('premiumUpgradeCta').onclick     = function () {
        // Phase N: replace with actual purchase flow.
        Entitlement.closeUpgradeSheet();
      };
    }
    el.classList.add('premium-upgrade-sheet--open');
    if (global.ModalStack) {
      ModalStack.register('premium-upgrade', {
        isOpen:  function () { return el.classList.contains('premium-upgrade-sheet--open'); },
        open:    function () { el.classList.add('premium-upgrade-sheet--open'); },
        close:   function () { Entitlement.closeUpgradeSheet(); }
      });
    }
  }

  function closeUpgradeSheet() {
    var el = document.getElementById('premiumUpgradeSheet');
    if (el) el.classList.remove('premium-upgrade-sheet--open');
    if (global.ModalStack) ModalStack.close('premium-upgrade');
  }

  var Entitlement = {
    FEATURES:          FEATURES,
    isPremiumUser:     isPremiumUser,
    canAccess:         canAccess,
    promptUpgrade:     promptUpgrade,
    closeUpgradeSheet: closeUpgradeSheet
  };

  global.GroundedEntitlement = Entitlement;

}(window));
```

### 4b. Add upgrade sheet CSS to `css/modals.css`

```css
/* ─── PREMIUM UPGRADE SHEET ─── */
.premium-upgrade-sheet {
  position: fixed; inset: 0; z-index: var(--z-overlay);
  display: flex; align-items: flex-end; justify-content: center;
  pointer-events: none; opacity: 0; visibility: hidden;
  transition: opacity 0.3s ease, visibility 0s linear 0.3s;
}
.premium-upgrade-sheet--open {
  pointer-events: auto; opacity: 1; visibility: visible;
  transition-delay: 0s;
}
.premium-upgrade-backdrop {
  position: absolute; inset: 0;
  background: rgba(40, 30, 25, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.premium-upgrade-panel {
  position: relative; z-index: 1;
  width: 100%; max-width: 420px;
  background: var(--bg);
  border-radius: 20px 20px 0 0;
  padding: 28px 24px max(28px, env(safe-area-inset-bottom));
  box-sizing: border-box;
  transform: translateY(110%);
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}
.premium-upgrade-sheet--open .premium-upgrade-panel { transform: translateY(0); }
.premium-upgrade-close {
  position: absolute; top: 14px; right: 14px;
  width: 32px; height: 32px; border: none; background: transparent;
  font-size: 18px; color: var(--text-light); cursor: pointer;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.premium-upgrade-kicker {
  font-size: 10px; font-weight: 600; letter-spacing: 2px;
  text-transform: uppercase; color: var(--accent-strong); margin: 0 0 8px;
}
.premium-upgrade-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px; font-weight: 500; color: var(--text);
  margin: 0 0 10px; letter-spacing: -0.02em;
}
.premium-upgrade-body {
  font-size: 14px; line-height: 1.65; color: var(--text-light); margin: 0 0 24px;
}
.premium-upgrade-cta {
  display: block; width: 100%; padding: 15px 20px;
  border-radius: 100px; border: none;
  background: var(--rose-btn); color: #fff;
  font-size: 14px; font-weight: 600; font-family: inherit;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.premium-upgrade-cta:active { transform: scale(0.98); opacity: 0.92; }
```

### 4c. Wire locked cards in `study-app.js`

Find the `ctxLockedPremiumCard` function in `study-app.js` and update it to add a `data-act`:

```js
function ctxLockedPremiumCard(title, featureKey) {
  return (
    '<article class="study-ctx-card study-ctx-card--locked" data-act="premium-locked" data-arg="' +
    esc(featureKey || '') + '">' +
    CTX_LOCK_SVG +
    '<p class="study-ctx-card-label">' + esc(title) + '</p>' +
    '<p class="study-ctx-lock-copy">Go deeper with Premium →</p>' +
    '</article>'
  );
}
```

Update the three call sites to pass the feature key:
```js
ctxLockedPremiumCard('Then vs. Now',                    'then_vs_now')
ctxLockedPremiumCard('Cross References',                'cross_references')
ctxLockedPremiumCard('Original Hebrew/Greek Word Study','word_study')
```

In the `wire()` function's `onclick` handler in `study-app.js`, add the `premium-locked` action:
```js
} else if (act === 'premium-locked') {
  if (global.GroundedEntitlement) {
    global.GroundedEntitlement.promptUpgrade(arg, t);
  }
}
```

### 4d. Wire into the page

```html
<!-- in index.html, after modal-stack.js -->
<script src="js/entitlement.js"></script>
```

```js
// in sw.js APP_SHELL
shellUrl('js/entitlement.js'),
```

### 4e. Definition of done

- [ ] `window.GroundedEntitlement` is accessible in console
- [ ] `GroundedEntitlement.isPremiumUser()` returns `false` by default
- [ ] Setting `localStorage.setItem('grounded_premium', 'true')` and refreshing makes `isPremiumUser()` return `true`
- [ ] Tapping any locked study card opens the upgrade sheet
- [ ] The upgrade sheet closes on backdrop tap, close button, and CTA tap
- [ ] The upgrade sheet z-index sits within the token scale (no 10080-style escape hatch)
- [ ] No existing study behavior changed (unlocked cards still function as before)

---

## Phase 5 — `nav.js`: Navigation Coordinator

**Goal:** Replace the four parallel navigation systems (body data attribute, `.screen.active`, body class flags, study-app internal state) with a single function that coordinates them. No tab behavior changes — only where the coordination lives.

**Break risk: Medium.** This touches the tab-switching path. Run through all five tabs, both fullscreen overlays, the Bible reader, and the settings panel after this change.

### 5a. Audit first

Before writing `nav.js`, locate every place that switches tabs in `index.html`:

```
grep -n "data-active-tab\|activeTab\|switchTab\|screen\.active\|classList.*active" index.html | head -60
```

Map each one: what triggers it, what it sets, what cleanup it does. This audit prevents `nav.js` from missing a case.

### 5b. Create `js/nav.js`

```js
// js/nav.js
(function (global) {
  'use strict';

  // Body classes that fullscreen overlays set — they must be cleared on tab switch.
  var OVERLAY_CLASSES = [
    'word-bible-open',
    'verse-fs-open',
    'content-quote-fs-open'
  ];

  var _currentTab = null;

  function setTab(tabId) {
    if (!tabId) return;

    // 1. Close any open overlays/modals via the stack.
    if (global.ModalStack) ModalStack.closeAll();

    // 2. Clear overlay body classes.
    OVERLAY_CLASSES.forEach(function (cls) {
      document.body.classList.remove(cls);
    });

    // 3. Update the data attribute (drives CSS tab visibility).
    document.body.setAttribute('data-active-tab', tabId);

    // 4. Deactivate old screen, activate new one.
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function (s) { s.classList.remove('active'); });
    var next = document.getElementById('screen-' + tabId) ||
               document.querySelector('[data-tab="' + tabId + '"]');
    if (next) next.classList.add('active');

    // 5. Persist (same key as existing code).
    if (global.GroundedStore) {
      GroundedStore.setActiveTab(tabId);
    } else {
      try { localStorage.setItem('activeTab', tabId); } catch (_) {}
    }

    _currentTab = tabId;

    // 6. Fire a custom event so individual tab modules can react.
    try {
      document.dispatchEvent(new CustomEvent('grounded:tabchange', { detail: { tab: tabId } }));
    } catch (_) {}
  }

  function getTab() {
    return _currentTab || document.body.getAttribute('data-active-tab') || 'feed';
  }

  var Nav = {
    setTab: setTab,
    getTab: getTab
  };

  global.GroundedNav = Nav;

}(window));
```

### 5c. Migration strategy

Replace existing tab-switch calls **one tab at a time**, verifying each before moving to the next:

1. Feed tab → `GroundedNav.setTab('feed')`
2. Scripture tab → `GroundedNav.setTab('word')`
3. Prayer tab → `GroundedNav.setTab('prayer')`
4. Reset tab → `GroundedNav.setTab('reset')`
5. Study tab → `GroundedNav.setTab('study')`

The `bridge().switchTab` calls inside `study-app.js` should delegate to `GroundedNav.setTab` when available:

```js
// In the bridge assignment (index.html), update the switchTab property:
switchTab: function(tab) {
  if (global.GroundedNav) {
    GroundedNav.setTab(tab);
  } else {
    // existing code as fallback
  }
},
```

### 5d. Wire into the page

```html
<!-- in index.html, after modal-stack.js -->
<script src="js/nav.js"></script>
```

```js
// in sw.js APP_SHELL
shellUrl('js/nav.js'),
```

### 5e. Definition of done

- [ ] All five tabs switch correctly
- [ ] Switching tabs while the Bible reader is open closes the reader first
- [ ] Switching tabs while a fullscreen overlay is open closes the overlay first
- [ ] The settings panel opens and closes correctly from any tab
- [ ] `GroundedNav.getTab()` returns the correct current tab
- [ ] `document.dispatchEvent('grounded:tabchange')` fires on every tab switch (verify in console)

---

## Phase 6 — Migrate `index.html` to `store.js`

**Goal:** Replace the 153 `localStorage` calls in `index.html` with `GroundedStore` calls. This phase can be spread across multiple sessions — each key migration is independent.

**Break risk: Medium.** Migrate one key cluster at a time. Do not batch key migrations.

### 6a. Migration order (safest to most-used)

Migrate keys in this order, verifying app behavior after each group:

**Group A — Simple string reads/writes (10 min each)**
- `grounded_theme` → `GroundedStore.getTheme()` / `GroundedStore.setTheme()`
- `grounded_bible_version` + `bibleVersion` → `GroundedStore.getBibleVersion()` / `setBibleVersion()`
- `reminderType` → `GroundedStore.getReminderType()` / `setReminderType()`
- `grounded_time_pref`, `grounded_time_of_day` — add methods to store.js, then migrate

**Group B — User identity (20 min)**
- `grounded_user_name` + `userName` → `GroundedStore.getUserName()` / `setUserName()`
- `grounded_why` — add method, then migrate

**Group C — Feeling/mood (20 min)**
- `grounded_feeling`, `grounded_feeling_date`, `grounded_feeling_onboarding_preset`, `grounded_current_verse`, `selectedMood` → `GroundedStore.getFeeling()` / `setFeeling()` / `clearFeeling()`

**Group D — Saved verses and active tab (15 min)**
- `grounded_saved` → `GroundedStore.getSavedIds()` / `setSavedIds()`
- `activeTab` → `GroundedStore.getActiveTab()` / `setActiveTab()`

**Group E — Flags and one-time keys (30 min)**
- `grounded_lastIdx`, `grounded_onboarding_completed_day`, `grounded_weekly_theme_notify_title`, `grounded_theme_choice_note`, SETTINGS_KEYS flags — add typed methods, then migrate

**Group F — Verify dual keys are dead (10 min)**
- After Groups A and B, confirm that `localStorage.getItem('userName')` and `localStorage.getItem('bibleVersion')` are no longer called directly anywhere in `index.html`. The legacy methods in `store.js` handle backward compatibility.

### 6b. Definition of done

- [ ] No direct `localStorage.getItem`/`setItem` calls remain in `index.html`
- [ ] All keys still return the correct values for existing users (old data is read correctly through the legacy shims in `store.js`)
- [ ] Onboarding flow completes without errors
- [ ] Settings panel reads and writes all settings correctly

---

## Phase 7 — Migrate JS Modules to `store.js`

**Goal:** Migrate `app-themes.js`, `onboarding.js`, and `study-app.js` to use `GroundedStore` instead of their own `readJson`/`writeJson` helpers.

**Break risk: Low.** By this point, `store.js` is well-tested and all the methods exist. This is cleanup.

### 7a. `app-themes.js`

Replace the direct `localStorage` calls with:
- `GroundedStore.isOnboardingComplete()`
- `GroundedStore.getOnboardingState()` / `setOnboardingState()`
- `GroundedStore.getTheme()` / `setTheme()`

Remove the local `readOnboardingCompletedExplicit` function — it is now `GroundedStore.isOnboardingComplete()`.

### 7b. `onboarding.js`

Replace:
- `localStorage.setItem('onboardingCompleted', 'true')` → `GroundedStore.setOnboardingComplete()`
- `localStorage.setItem('grounded_user_name', ...)` → `GroundedStore.setUserName(...)`
- `localStorage.setItem('grounded_why', ...)` → `GroundedStore.setWhy(...)` (add method)

### 7c. `study-app.js`

Replace the local `readJson`/`writeJson` helpers and their callers:
- `readJson(JOURNAL_KEY, [])` / `writeJson(JOURNAL_KEY, ...)` → `GroundedStore.getJournalEntries()` / `pushJournalEntry()`
- `readJson(PLANS_KEY, {})` / `writeJson(PLANS_KEY, ...)` → `GroundedStore.getPlanProgress()` / `setPlanDay()`
- `readJson(OVERVIEW_CACHE, {})` / `writeJson(OVERVIEW_CACHE, ...)` → `GroundedStore.getBookOverview()` / `setBookOverview()`
- `localStorage.getItem('lastStudyContext')` → `GroundedStore.getLastStudyContext()`

After this migration, the `readJson` and `writeJson` helpers inside `study-app.js` can be removed entirely.

### 7d. Definition of done

- [ ] `study-app.js` has no `localStorage` calls and no local `readJson`/`writeJson`
- [ ] `app-themes.js` has no `localStorage` calls
- [ ] `onboarding.js` has no `localStorage` calls
- [ ] All features work correctly end-to-end (journal, plans, overview cache, onboarding, themes)

---

## Completion State

After all seven phases, the app will have:

| Concern | Before | After |
|---|---|---|
| CSS location | One 10,000+ line `<style>` block in `index.html` | 11 focused CSS files, each under 300 lines |
| localStorage | 153 scattered calls across 4 files; 10+ duplicate/legacy key pairs | One `store.js`, single access point, typed methods, legacy aliases handled in one place |
| Z-index | 11 hardcoded values including a 10,080 escape hatch | 7 CSS token variables; no hardcoded values |
| Modal management | Each overlay manages its own open/close; no cross-awareness | `ModalStack` registry; tab switches close all overlays automatically |
| Premium gate | 3 static HTML locked cards with no behavior | `entitlement.js` with `canAccess()` and `promptUpgrade()`; IAP can be added in one function |
| Tab navigation | 4 parallel systems; body classes left behind on crashes | `GroundedNav.setTab()` as single coordinator; fires `grounded:tabchange` event |

No frameworks added. No app structure changed. All existing features continue to work exactly as they did.

---

## What This Plan Deliberately Excludes

- **`bibleData.js` splitting** — depends on the Phase 0 size measurement. If under 2 MB, not needed. If over 3 MB, add as Phase 8 after Phase 6 is complete.
- **API request cancellation** — the request token pattern described in the risk report should be added to `study-app.js` when a premium AI feature is being built that can trigger concurrent requests.
- **`GroundedStudyBridge` documentation** — add JSDoc to `study-app.js` during Phase 7 while already editing that file.
- **Reactive state or component system** — not needed. The existing innerHTML mutation pattern works correctly with the data-act event delegation already in place.
