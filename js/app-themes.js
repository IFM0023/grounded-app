/**
 * Grounded — product theme + onboarding state (central source of truth).
 *
 * Product themes (user-facing):
 *   - neutral  → data-theme="neutral" (clean, soft, minimal)
 *   - blush    → data-theme="soft"   (warm, gentle; existing app palette)
 *
 * Persisted under localStorage key: grounded_onboarding_state
 * Shape: { version, step (0–4), selectedTheme, userIntent, onboardingGoals[], dailyTime, preferredTime, userName, onboardingCompleted }
 */
(function (global) {
  var ONBOARDING_STATE_KEY = 'grounded_onboarding_state';
  var STATE_VERSION = 3;

  var LEGACY_KEYS = [
    'grounded_saved',
    'grounded_study_entries',
    'grounded_scripture',
    'grounded_journal_entries',
    'grounded_feeling',
    'grounded_saved_prayers',
    'grounded_favorite_verses'
  ];

  var ONBOARDING_GOAL_KEYS = {
    grow_closer: 1,
    quiet_moment: 1,
    anxious_peace: 1,
    overwhelmed: 1,
    guidance_now: 1,
    daily_habit: 1,
    disconnected: 1,
    difficult_season: 1,
    consistent: 1,
    feel_better_today: 1
  };

  function normalizeOnboardingGoals(arr, legacyIntent) {
    var out = [];
    if (Array.isArray(arr)) {
      for (var i = 0; i < arr.length; i++) {
        var k = String(arr[i] == null ? '' : arr[i]).trim();
        if (ONBOARDING_GOAL_KEYS[k]) out.push(k);
      }
    }
    if (out.length === 0 && legacyIntent && typeof legacyIntent === 'string') {
      if (legacyIntent === 'closer') out.push('grow_closer');
      else if (legacyIntent === 'quiet') out.push('quiet_moment');
    }
    return out;
  }

  function defaultOnboardingState() {
    return {
      version: STATE_VERSION,
      step: 0,
      selectedTheme: 'neutral',
      userIntent: '',
      onboardingGoals: [],
      dailyTime: '',
      preferredTime: '',
      userName: '',
      onboardingCompleted: false
    };
  }

  /** Map v1 6-step flow (0 welcome … 5 final) to v2 4-step flow. */
  function mapStepV1toV2(old) {
    if (typeof old !== 'number' || isNaN(old)) return 0;
    if (old <= 1) return 0;
    if (old === 2) return 0;
    if (old === 3) return 1;
    if (old === 4) return 2;
    if (old >= 5) return 3;
    return 0;
  }

  function normalizeState(o) {
    var d = defaultOnboardingState();
    if (!o || typeof o !== 'object') return d;
    var ver = typeof o.version === 'number' ? o.version : 1;
    var rawStep = typeof o.step === 'number' ? o.step : 0;
    var stepFlat;
    if (ver >= 3) {
      stepFlat = Math.max(0, Math.min(4, rawStep));
    } else {
      var stepV2;
      if (ver >= 2) {
        stepV2 = Math.max(0, Math.min(3, rawStep));
      } else {
        stepV2 = mapStepV1toV2(rawStep);
      }
      /* v1/v2: insert name step at 0 — old 0–3 become new 1–4 */
      stepFlat = Math.min(4, stepV2 + 1);
    }
    var goals = normalizeOnboardingGoals(
      o.onboardingGoals,
      typeof o.userIntent === 'string' ? o.userIntent : ''
    );
    var uname = typeof o.userName === 'string' ? o.userName.trim() : '';
    return {
      version: STATE_VERSION,
      step: stepFlat,
      selectedTheme: o.selectedTheme === 'blush' ? 'blush' : 'neutral',
      userIntent: goals.length > 0 ? goals[0] : '',
      onboardingGoals: goals,
      dailyTime: typeof o.dailyTime === 'string' ? o.dailyTime : '',
      preferredTime: typeof o.preferredTime === 'string' ? o.preferredTime : '',
      userName: uname,
      onboardingCompleted: o.onboardingCompleted === true
    };
  }

  var REPLAY_ONBOARDING_SESSION = 'grounded_replay_onboarding';

  /**
   * ?onboarding=1 (or ?replayOnboarding=1) resets onboarding for this visit.
   * sessionStorage blocks migrateLegacyOnboarding() from auto-completing for people with
   * existing app data, so the flow is visible. Cleared when onboarding finishes.
   */
  function applyOnboardingReplayFromQuery() {
    var has = false;
    try {
      var q = new URLSearchParams(
        (typeof location !== 'undefined' && location.search) || ''
      );
      if (q.get('onboarding') === '1' || q.get('replayOnboarding') === '1') {
        has = true;
      }
    } catch (_) {}
    if (!has) return;
    try {
      sessionStorage.setItem(REPLAY_ONBOARDING_SESSION, '1');
    } catch (_) {}
    try {
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(defaultOnboardingState()));
      localStorage.setItem('onboardingCompleted', 'false');
    } catch (_) {}
    try {
      if (typeof location === 'undefined' || typeof URL === 'undefined') return;
      var u = new URL(location.href);
      u.searchParams.delete('onboarding');
      u.searchParams.delete('replayOnboarding');
      var pl = String(u.pathname || '/').replace(/\/$/, '').toLowerCase();
      var onCleanLegal =
        pl === '/privacy' ||
        pl === '/terms' ||
        pl === '/contact' ||
        (function () {
          var segs = pl.split('/').filter(Boolean);
          var last = segs.length ? segs[segs.length - 1] : '';
          return last === 'privacy' || last === 'terms' || last === 'contact';
        })();
      /* Never re-apply a hash fragment on clean legal URLs (avoids /privacy → /privacy#/privacy). */
      var path = onCleanLegal ? u.pathname + (u.search || '') : u.pathname + (u.search || '') + (u.hash || '');
      if (typeof history !== 'undefined' && history.replaceState) {
        history.replaceState(null, '', path);
      } else {
        location.replace(u.origin + path);
      }
    } catch (_) {}
  }

  function loadOnboardingState() {
    try {
      var raw = localStorage.getItem(ONBOARDING_STATE_KEY);
      if (!raw) return defaultOnboardingState();
      return normalizeState(JSON.parse(raw));
    } catch (_) {
      return defaultOnboardingState();
    }
  }

  function saveOnboardingState(partial) {
    var next = normalizeState(Object.assign({}, loadOnboardingState(), partial || {}));
    try {
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(next));
    } catch (_) {}
    return next;
  }

  function hasMeaningfulLocalValue(key) {
    var v = localStorage.getItem(key);
    if (!v || v === 'null') return false;
    if (v === '[]' || v === '{}') return false;
    try {
      var p = JSON.parse(v);
      if (Array.isArray(p)) return p.length > 0;
      if (p && typeof p === 'object') return Object.keys(p).length > 0;
    } catch (_) {
      return v.length > 0;
    }
    return false;
  }

  function detectLegacyAppUse() {
    for (var i = 0; i < LEGACY_KEYS.length; i++) {
      if (hasMeaningfulLocalValue(LEGACY_KEYS[i])) return true;
    }
    var verse = localStorage.getItem('grounded_current_verse');
    if (verse && verse !== 'null') {
      try {
        var o = JSON.parse(verse);
        if (o && o.ref) return true;
      } catch (_) {}
    }
    return false;
  }

  /** If they used the app before onboarding existed, mark complete without showing UI. */
  function migrateLegacyOnboarding() {
    try {
      if (sessionStorage.getItem(REPLAY_ONBOARDING_SESSION) === '1') return;
    } catch (_) {}
    if (!detectLegacyAppUse()) return;
    var s = loadOnboardingState();
    if (s.onboardingCompleted) return;
    var dt = localStorage.getItem('grounded_theme') || 'soft';
    var product = dt === 'soft' ? 'blush' : 'neutral';
    saveOnboardingState({
      onboardingCompleted: true,
      selectedTheme: product,
      step: 0
    });
  }

  var _setTheme = null;

  function applyProductTheme(product) {
    var dt = product === 'blush' ? 'soft' : 'neutral';
    if (typeof _setTheme === 'function') {
      _setTheme(dt);
    } else {
      try {
        document.documentElement.setAttribute('data-theme', dt);
        localStorage.setItem('grounded_theme', dt);
      } catch (_) {}
    }
  }

  function productFromDataTheme(dt) {
    return dt === 'soft' ? 'blush' : 'neutral';
  }

  function shouldShowOnboardingUI() {
    migrateLegacyOnboarding();
    var s = loadOnboardingState();
    return s.onboardingCompleted !== true;
  }

  function bootstrapTheme(setThemeFn) {
    _setTheme = setThemeFn;
    migrateLegacyOnboarding();
    var s = loadOnboardingState();

    if (s.onboardingCompleted === true && s.selectedTheme) {
      applyProductTheme(s.selectedTheme);
      return;
    }

    if (!shouldShowOnboardingUI()) {
      var saved = 'soft';
      try {
        saved = localStorage.getItem('grounded_theme') || 'soft';
      } catch (_) {}
      setThemeFn(saved);
      return;
    }

    // First-time onboarding will run — calm default + resume partial picks
    applyProductTheme(s.selectedTheme === 'blush' ? 'blush' : 'neutral');
  }

  applyOnboardingReplayFromQuery();

  global.GroundedThemes = {
    REPLAY_ONBOARDING_SESSION: REPLAY_ONBOARDING_SESSION,
    ONBOARDING_STATE_KEY: ONBOARDING_STATE_KEY,
    applyOnboardingReplayFromQuery: applyOnboardingReplayFromQuery,
    applyProductTheme: applyProductTheme,
    productFromDataTheme: productFromDataTheme,
    bootstrap: bootstrapTheme,
    shouldShowOnboardingUI: shouldShowOnboardingUI,
    loadOnboardingState: loadOnboardingState,
    saveOnboardingState: saveOnboardingState,
    defaultOnboardingState: defaultOnboardingState,
    migrateLegacyOnboarding: migrateLegacyOnboarding
  };
})(typeof window !== 'undefined' ? window : this);
