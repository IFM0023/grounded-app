// js/store.js
//
// Grounded — Central Storage Layer
//
// PHASE 1 STATUS: Infrastructure-only.
// Nothing in the app currently calls GroundedStore.* — this file is dead code
// at runtime. It exists so that Phase 6 (index.html migration) and Phase 7
// (JS module migration) can move callers one cluster at a time onto a single,
// typed surface for localStorage access.
//
// Design notes:
//  - All reads/writes are wrapped in try/catch and cannot throw.
//  - Dual-key legacy pairs (grounded_user_name / userName, etc.) are handled
//    by legacyGet / legacySet — every set writes BOTH keys, every read prefers
//    the canonical key and falls back to legacy. This mirrors current app
//    behavior exactly.
//  - There is one subtle additive behavior: legacyGet performs a forward
//    migration write (canonical := legacy) on the first read after a user has
//    only the legacy key. This is harmless under current quota and matches
//    what every existing dual-write site would have done on next save anyway.
//    Because nothing calls legacyGet in Phase 1, this write does not occur
//    until Phase 6 callers are migrated.

(function (global) {
  'use strict';

  var SCHEMA_VERSION = 1;

  // ─── Safe storage primitives ─────────────────────────────────────────────
  // Every primitive returns the fallback on any failure. They never throw.

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

  // ─── Dual-key legacy shim ────────────────────────────────────────────────
  // Three pairs were identified in the Phase 0 audit:
  //   grounded_user_name      / userName
  //   grounded_bible_version  / bibleVersion
  //   grounded_reminder_type  / reminderType
  // Always write both. Read canonical first; fall back to legacy.

  function legacyGet(preferredKey, legacyKey, fallback) {
    var v = safeGet(preferredKey, null);
    if (v !== null) return v;
    var leg = safeGet(legacyKey, null);
    if (leg !== null) {
      safeSet(preferredKey, leg);
      return leg;
    }
    return fallback;
  }

  function legacySet(preferredKey, legacyKey, value) {
    safeSet(preferredKey, value);
    safeSet(legacyKey, value);
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

    // User identity (dual-key)
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

    // Bible version (dual-key)
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
      return {
        mood: safeGet('grounded_feeling', ''),
        date: safeGet('grounded_feeling_date', '')
      };
    },
    setFeeling: function (mood, date) {
      safeSet('grounded_feeling', mood);
      safeSet('grounded_feeling_date', date);
    },
    clearFeeling: function () {
      safeRemove('grounded_feeling');
      safeRemove('grounded_feeling_date');
      safeRemove('grounded_current_verse');
      safeRemove('selectedMood');
    },

    // Study journal (study-app.js's local journal — NOT the Reflect-tab journal)
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

    // Book overview cache (max 80 entries; oldest evicted)
    getBookOverview: function (book) {
      var c = safeGetJson('grounded_book_overview_cache_v1', {});
      return c && typeof c === 'object' ? c[String(book).trim()] || null : null;
    },
    setBookOverview: function (book, data) {
      var c = safeGetJson('grounded_book_overview_cache_v1', {});
      if (!c || typeof c !== 'object') c = {};
      c[String(book).trim()] = data;
      var keys = Object.keys(c);
      if (keys.length > 80) {
        keys.slice(0, keys.length - 80).forEach(function (k) { delete c[k]; });
      }
      safeSetJson('grounded_book_overview_cache_v1', c);
    },

    // Last study context (cross-tab handoff key written by index.html, read by study-app.js)
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

    // Premium entitlement (Phase 4 will use this; key does not exist on users yet)
    isPremiumUser: function () {
      return safeGet('grounded_premium', '') === 'true';
    },
    setPremiumUser: function (val) {
      safeSet('grounded_premium', val ? 'true' : 'false');
    },

    // Reminder type (dual-key; canonical is grounded_reminder_type — see audit §5a)
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
