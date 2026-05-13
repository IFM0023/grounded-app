/**
 * Grounded — first open of the day (daily arrival ritual).
 * Waits for window.groundedDailyArrivalShellBlockersActive() (shared with progress-popup gating).
 */
(function (global) {
  'use strict';

  var STEP_COUNT = 5;
  var POLL_MS = 130;
  /** While onboarding is still finishing, keep polling (same session). */
  var MAX_DEFER_POLLS = 6000;
  /** Modal / overlay blockers — separate cap so we don’t confuse with defer. */
  var MAX_BLOCKER_POLLS = 500;
  var SETTLE_AFTER_BLOCKERS_MS = 480;
  var SETTLE_CLEAN_MS = 140;
  var HANDOFF_MS = 560;
  var BOOT_DELAY_MS = 620;

  /** Full 5-step ritual for first visits, early days, long absence, or forced deep mode. */
  var FULL_FLOW_MIN_COMPLETIONS = 3;
  var INACTIVITY_MS = 14 * 24 * 60 * 60 * 1000;

  var ALL_FOCUS_KEYS = [
    'quiet_moment',
    'perspective',
    'peace',
    'slowing_down',
    'encouragement',
    'clarity'
  ];

  var sessionMode = 'full';
  /** Lightweight daily pick: slider | focus | emotion | none */
  var sessionInteraction = 'slider';
  /** Ordered physical step indices visited this session (e.g. [0,1,2,4] or [0,1,3,4]). */
  var sessionFlowSequence = [0, 1, 2, 3, 4];
  /** @type {string} */
  var selectedEmotion = '';
  /** @type {string} */
  var pendingMomentTab = 'feed';

  function todayKeyFn() {
    try {
      if (typeof global.todayDateKey === 'function') return global.todayDateKey();
    } catch (_) {}
    return '';
  }

  function hashString(s) {
    var h = 0;
    var str = String(s || '');
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function readCompletionCount() {
    try {
      var raw = global.localStorage.getItem('grounded_daily_arrival_complete_count');
      if (raw != null && raw !== '') {
        var n = parseInt(raw, 10);
        return isNaN(n) ? 0 : Math.max(0, n);
      }
      if (global.localStorage.getItem('grounded_da_complete_count_migrated') === '1') {
        return 0;
      }
      var legacy =
        global.localStorage.getItem('grounded_daily_arrival_slider_date') ||
        global.localStorage.getItem('grounded_daily_focus_date');
      if (legacy) {
        global.localStorage.setItem('grounded_daily_arrival_complete_count', String(FULL_FLOW_MIN_COMPLETIONS));
        global.localStorage.setItem('grounded_da_complete_count_migrated', '1');
        return FULL_FLOW_MIN_COMPLETIONS;
      }
    } catch (_) {}
    return 0;
  }

  function readLastCompleteTs() {
    try {
      var n = parseInt(global.localStorage.getItem('grounded_daily_arrival_last_complete_ts') || '0', 10);
      return isNaN(n) ? 0 : n;
    } catch (_) {
      return 0;
    }
  }

  function forceFullFlowStorage() {
    try {
      return global.localStorage.getItem('grounded_daily_arrival_force_full') === '1';
    } catch (_) {
      return false;
    }
  }

  function shouldUseFullDailyArrivalFlow() {
    if (forceFullFlowStorage()) return true;
    if (readCompletionCount() < FULL_FLOW_MIN_COMPLETIONS) return true;
    var ts = readLastCompleteTs();
    if (ts > 0 && Date.now() - ts > INACTIVITY_MS) return true;
    return false;
  }

  /**
   * Gentle rotation: avoid repeating the same lightweight interaction many days in a row.
   * Per-day pick cached in localStorage (same ritual if reopened same day).
   */
  function getOrPickLightweightInteraction(todayKey) {
    try {
      if (global.localStorage.getItem('grounded_da_daily_pick_date') === todayKey) {
        var frozen = global.localStorage.getItem('grounded_da_daily_pick_type');
        if (frozen) return frozen;
      }
    } catch (_) {}

    var chainStr = '';
    try {
      chainStr = global.localStorage.getItem('grounded_da_recent_chain') || '';
    } catch (_) {}
    var chain = chainStr.split(',').filter(Boolean);
    var banned = '';
    if (chain.length >= 2 && chain[chain.length - 1] === chain[chain.length - 2]) {
      banned = chain[chain.length - 1];
    }

    var pool = ['slider', 'focus', 'emotion', 'none'].filter(function (x) {
      return x !== banned;
    });
    if (!pool.length) pool = ['slider', 'focus', 'emotion', 'none'];

    var picked = pool[hashString(todayKey + '|daPickv2') % pool.length];
    try {
      global.localStorage.setItem('grounded_da_daily_pick_date', todayKey);
      global.localStorage.setItem('grounded_da_daily_pick_type', picked);
    } catch (_) {}

    return picked;
  }

  function carryForwardFocusKey() {
    try {
      var fk = String(global.localStorage.getItem('grounded_daily_focus') || '').trim();
      if (ALL_FOCUS_KEYS.indexOf(fk) !== -1) return fk;
    } catch (_) {}
    return '';
  }

  /** Tab id from "Choose your moment" → legacy `grounded_daily_focus` key. */
  var TAB_TO_FOCUS = {
    scriptureplus: 'perspective',
    word: 'perspective',
    reflect: 'clarity',
    prayer: 'peace',
    pilates: 'quiet_moment',
    feed: 'encouragement'
  };

  var EMOTION_DISPLAY = {
    overwhelmed: 'Overwhelmed',
    distracted: 'Distracted',
    tired: 'Tired',
    peaceful: 'Peaceful',
    anxious: 'Anxious',
    hopeful: 'Hopeful',
    heavy: 'Heavy',
    grateful: 'Grateful'
  };

  /** Short reflection + paired verse + one quiet line (editable copy). */
  var EMOTION_GUIDED = {
    overwhelmed: {
      lead: 'When everything demands attention at once, the mind stops sorting and starts spinning.',
      verse: 'Cast all your anxiety on him because he cares for you.',
      ref: '1 Peter 5:7',
      micro: 'Naming one weight out loud often shrinks it faster than managing it silently.'
    },
    anxious: {
      lead: 'Anxiety often arrives as rehearsal—your body living tomorrow before today has evidence.',
      verse: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
      ref: 'Philippians 4:6',
      micro: 'Prayer here is not performance. It is handing the script back to someone who can read it without panic.'
    },
    tired: {
      lead: 'Weariness is not always laziness. Sometimes it is the truth catching up with the pace.',
      verse: 'Come to me, all you who are weary and burdened, and I will give you rest.',
      ref: 'Matthew 11:28',
      micro: 'Rest is not a verdict on your character. It is a physical fact you can cooperate with—or fight.'
    },
    peaceful: {
      lead: 'Quiet moods are rare; they deserve to be noticed before the next wave of noise.',
      verse: 'He makes me lie down in green pastures, he leads me beside quiet waters.',
      ref: 'Psalm 23:2',
      micro: 'Let this be a snapshot you remember later—not proof you have life sorted, proof you can receive a gentle hour.'
    },
    distracted: {
      lead: 'Attention frays when the inner queue gets longer than the outer day.',
      verse: 'Be still, and know that I am God.',
      ref: 'Psalm 46:10',
      micro: 'Stillness is not emptying the mind. It is choosing one place for your eyes to rest.'
    },
    hopeful: {
      lead: 'Hope is often thinner than optimism—it stays without demanding a guarantee.',
      verse: 'May the God of hope fill you with all joy and peace as you trust in him.',
      ref: 'Romans 15:13',
      micro: 'A small opening is still an opening. Light does not need a wide door.'
    },
    heavy: {
      lead: 'Some sadness sits underneath competence—the part of you that never got to put the burden down.',
      verse: 'The Lord is my strength and my shield; my heart trusts in him, and he helps me.',
      ref: 'Psalm 28:7',
      micro: 'God does not wait for a polished paragraph. Grief is already a kind of honesty he can read.'
    },
    grateful: {
      lead: 'Gratitude is sometimes less a mood than a decision to look at what did not collapse today.',
      verse: 'Give thanks in all circumstances; for this is God\u2019s will for you in Christ Jesus.',
      ref: '1 Thessalonians 5:18',
      micro: 'One concrete detail is enough. Specificity keeps thankfulness from floating away as a slogan.'
    }
  };

  function emotionToSlider(emotionId) {
    var m = {
      overwhelmed: 84,
      anxious: 80,
      heavy: 78,
      tired: 60,
      distracted: 55,
      peaceful: 36,
      hopeful: 42,
      grateful: 30
    };
    var v = m[emotionId];
    return typeof v === 'number' ? v : 50;
  }

  function firstPhysicalAfter(fromStep, skipStep) {
    var ix = sessionFlowSequence.indexOf(fromStep);
    if (ix < 0) return 4;
    for (var j = ix + 1; j < sessionFlowSequence.length; j++) {
      var s = sessionFlowSequence[j];
      if (skipStep != null && s === skipStep) continue;
      return s;
    }
    return 4;
  }

  function skipEmotionFromCheckin() {
    selectedEmotion = '';
    sliderVal = 50;
    var range = root && root.querySelector('#dailyArrivalMoodRange');
    if (range) {
      range.value = '50';
      range.setAttribute('aria-valuenow', '50');
    }
    if (root) {
      root.querySelectorAll('[data-da-emotion-tile]').forEach(function (b) {
        b.classList.remove('is-selected');
      });
    }
    goStep(firstPhysicalAfter(1, 2));
  }

  function hydrateVerseArrival() {
    try {
      if (typeof global.groundedDailyArrivalHydrateVerseStep === 'function') {
        global.groundedDailyArrivalHydrateVerseStep();
      }
    } catch (_) {}
  }

  function hydrateGuidedPanel() {
    if (!root) return;
    var badge = root.querySelector('#dailyArrivalGuidedBadge');
    var lead = root.querySelector('#dailyArrivalGuidedLead');
    var vSoft = root.querySelector('#dailyArrivalGuidedVerseSoft');
    var vr = root.querySelector('#dailyArrivalGuidedVerseRef');
    var wrap = root.querySelector('#dailyArrivalGuidedScriptureWrap');
    var micro = root.querySelector('#dailyArrivalGuidedMicro');
    var spec = selectedEmotion && EMOTION_GUIDED[selectedEmotion] ? EMOTION_GUIDED[selectedEmotion] : EMOTION_GUIDED.peaceful;
    var label = selectedEmotion && EMOTION_DISPLAY[selectedEmotion] ? EMOTION_DISPLAY[selectedEmotion] : 'Today';
    if (badge) badge.textContent = selectedEmotion ? 'You named: ' + label : 'A pause before the verse';
    if (lead) lead.textContent = spec.lead || '';

    var verseFull = String(spec.verse || '').trim();
    var ref = String(spec.ref || '').trim();
    var maxQuote = 118;
    var showQuote = verseFull.length > 0 && verseFull.length <= maxQuote;

    if (vSoft) {
      vSoft.textContent = showQuote ? '\u201c' + verseFull + '\u201d' : '';
      vSoft.hidden = !showQuote;
      vSoft.style.display = showQuote ? '' : 'none';
    }
    if (vr) vr.textContent = ref;
    if (wrap) {
      wrap.classList.toggle('daily-arrival-guided-scripture-soft--ref-only', !!ref && !showQuote);
      var hasSupport = !!(ref || showQuote);
      wrap.hidden = !hasSupport;
      wrap.style.display = hasSupport ? '' : 'none';
    }

    if (micro) micro.textContent = spec.micro || '';
  }

  function hydrateCompletionStreak() {
    if (!root) return;
    var nEl = root.querySelector('#dailyArrivalStreakNum');
    var strip = root.querySelector('#dailyArrivalWeekStrip');
    var n = 1;
    try {
      if (typeof global.getDisplayProgressDays === 'function') {
        n = global.getDisplayProgressDays();
      } else if (typeof global.getGroundedDaysCount === 'function') {
        n = Math.max(1, global.getGroundedDaysCount() || 1);
      }
    } catch (_) {}
    if (nEl) nEl.textContent = String(n);
    if (strip) {
      strip.innerHTML = '';
      var filled = Math.min(7, Math.max(1, n));
      for (var i = 0; i < 7; i++) {
        var d = document.createElement('span');
        d.className = 'daily-arrival-week-dot' + (i < filled ? ' daily-arrival-week-dot--on' : '');
        strip.appendChild(d);
      }
    }
  }

  function prepareArrivalChrome() {
    if (!root) return;
    var moodTitle = root.querySelector('#dailyArrivalMoodTitle');
    var moodHint = root.querySelector('#dailyArrivalMoodHint');
    if (moodTitle) moodTitle.textContent = 'How are you arriving today?';
    if (moodHint) moodHint.textContent = 'Mixed is fine. Sharp is fine. You are only naming what is already true.';
  }

  function buildLightSequence(interaction) {
    if (interaction === 'slider' || interaction === 'emotion') return [0, 1, 2, 4];
    if (interaction === 'focus') return [0, 1, 3, 4];
    return [0, 1, 4];
  }

  function nextInSequence(physicalStep) {
    var ix = sessionFlowSequence.indexOf(physicalStep);
    if (ix < 0 || ix >= sessionFlowSequence.length - 1) return physicalStep;
    return sessionFlowSequence[ix + 1];
  }

  function applyFlowChromeCopy() {
    if (!root) return;
    var titleEl = root.querySelector('#dailyArrivalFlowTitle');
    if (!titleEl) return;
    titleEl.textContent = 'Daily arrival';
  }

  function applyFlowProgressNav() {
    if (!root) return;
    var fullNav = root.querySelector('.daily-arrival-progress--full');
    var light4 = root.querySelector('.daily-arrival-progress--light-4');
    var light3 = root.querySelector('.daily-arrival-progress--light-3');

    [fullNav, light4, light3].forEach(function (nav) {
      if (!nav) return;
      nav.setAttribute('hidden', '');
      nav.classList.remove('daily-arrival-progress--active');
    });

    var active = fullNav;
    if (sessionMode === 'light') {
      active = sessionFlowSequence.length <= 3 ? light3 : light4;
    }
    if (active) {
      active.removeAttribute('hidden');
      active.classList.add('daily-arrival-progress--active');
    }
  }

  function wireNavigationButtons() {
    if (!root) return;
    var b0 = root.querySelector('[data-daily-step="0"] [data-daily-next]');
    if (b0) b0.setAttribute('data-daily-next', String(nextInSequence(0)));
    var s2btn = root.querySelector('[data-daily-step="2"] [data-daily-next]');
    if (s2btn) s2btn.setAttribute('data-daily-next', String(nextInSequence(2)));

    try {
      root.setAttribute('data-da-flow', sessionMode);
      root.setAttribute('data-da-interaction', sessionInteraction);
    } catch (_) {}
  }

  /** Run each time the overlay opens. */
  function applyFlowConfiguration() {
    var todayK = todayKeyFn();
    sessionMode = shouldUseFullDailyArrivalFlow() ? 'full' : 'light';

    if (sessionMode === 'full') {
      sessionInteraction = 'slider';
      sessionFlowSequence = [0, 1, 2, 3, 4];
    } else {
      sessionInteraction = getOrPickLightweightInteraction(todayK);
      sessionFlowSequence = buildLightSequence(sessionInteraction);
    }

    prepareArrivalChrome();
    applyFlowChromeCopy();
    applyFlowProgressNav();
    wireNavigationButtons();
  }

  function debugDailyArrivalEnabled() {
    try {
      return global.localStorage.getItem('grounded_debug_daily_arrival') === '1';
    } catch (_) {
      return false;
    }
  }

  function daLog() {
    if (!debugDailyArrivalEnabled()) return;
    var args = ['[DailyArrival]'].concat([].slice.call(arguments));
    try {
      global.console.log.apply(global.console, args);
    } catch (_) {}
  }

  function snapshotBlockersForLog() {
    try {
      if (typeof global.groundedDailyArrivalExplainBlockers === 'function') {
        return global.groundedDailyArrivalExplainBlockers();
      }
    } catch (_) {}
    return { shellBlocking: shellBlocking() };
  }

  var root = null;
  var step = 0;
  var sliderVal = 50;
  var selectedFocus = '';
  var opts = {};
  var popDocBound = false;

  function shellBlocking() {
    try {
      if (
        typeof global.groundedDailyArrivalShellBlockersActive === 'function' &&
        global.groundedDailyArrivalShellBlockersActive()
      ) {
        return true;
      }
    } catch (_) {}
    return false;
  }

  function setBodyActive(on) {
    var v = !!on;
    try {
      document.documentElement.classList.toggle('daily-arrival-active', v);
    } catch (_) {}
    try {
      document.body.classList.toggle('daily-arrival-active', v);
    } catch (_) {}
    try {
      if (typeof global.updateAppStoreCtaVisibility === 'function') global.updateAppStoreCtaVisibility();
    } catch (_) {}
  }

  function closePopovers() {
    if (!root) return;
    root.querySelectorAll('.daily-arrival-popover--open').forEach(function (p) {
      p.classList.remove('daily-arrival-popover--open');
    });
    root.querySelectorAll('[data-daily-infotoggle]').forEach(function (bt) {
      bt.setAttribute('aria-expanded', 'false');
    });
  }

  function onDocPointerDown(ev) {
    if (!root || root.hasAttribute('hidden')) return;
    if (root.contains(ev.target)) return;
    closePopovers();
  }

  function bindPopoverDismiss() {
    if (popDocBound) return;
    popDocBound = true;
    global.document.addEventListener('pointerdown', onDocPointerDown, false);
    global.document.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape') closePopovers();
      },
      false
    );
  }

  function prefersReducedMotion() {
    try {
      return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  function revealVisible() {
    if (!root) return;
    root.classList.add('daily-arrival-root--visible');
    setBodyActive(true);
  }

  function showRoot() {
    if (!root) return;
    setBodyActive(true);
    root.removeAttribute('hidden');
    root.setAttribute('aria-hidden', 'false');
    root.classList.remove('daily-arrival-root--leaving', 'daily-arrival-root--handoff');
    void root.offsetWidth;
    step = 0;
    sliderVal = 50;
    selectedFocus = '';
    selectedEmotion = '';
    pendingMomentTab = 'feed';
    var range = root.querySelector('#dailyArrivalMoodRange');
    if (range) {
      range.value = '50';
      range.setAttribute('aria-valuenow', '50');
      sliderVal = 50;
    }
    root.querySelectorAll('[data-da-emotion-tile]').forEach(function (b) {
      b.classList.remove('is-selected');
    });
    root.querySelectorAll('[data-daily-moment-tab]').forEach(function (b) {
      b.classList.remove('is-selected');
    });
    applyFlowConfiguration();
    goStep(0);

    if (prefersReducedMotion()) {
      revealVisible();
      return;
    }
    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(revealVisible);
    });
  }

  function finalizeHidden() {
    if (!root) return;
    try {
      document.body.classList.remove('daily-arrival-handoff');
    } catch (_) {}
    root.classList.remove('daily-arrival-root--leaving', 'daily-arrival-root--handoff', 'daily-arrival-root--visible');
    root.setAttribute('hidden', '');
    root.setAttribute('aria-hidden', 'true');
    closePopovers();
    try {
      if (typeof global.updateAppStoreCtaVisibility === 'function') global.updateAppStoreCtaVisibility();
    } catch (_) {}
  }

  function hideRoot() {
    if (!root) return;
    closePopovers();
    root.classList.remove('daily-arrival-root--visible');
    root.classList.add('daily-arrival-root--leaving');
    setBodyActive(false);
    global.setTimeout(finalizeHidden, prefersReducedMotion() ? 120 : 380);
  }

  function finishCompleteHandoff() {
    var range = root && root.querySelector('#dailyArrivalMoodRange');
    if (sessionMode === 'light' && sessionInteraction === 'none') {
      sliderVal = 50;
      if (range) {
        range.value = '50';
        range.setAttribute('aria-valuenow', '50');
      }
    } else if (selectedEmotion) {
      sliderVal = emotionToSlider(selectedEmotion);
      if (range) {
        range.value = String(sliderVal);
        range.setAttribute('aria-valuenow', String(sliderVal));
      }
    } else if (range) {
      sliderVal = parseInt(range.value, 10) || sliderVal;
    }

    var mapped = pendingMomentTab && TAB_TO_FOCUS[pendingMomentTab];
    if (mapped && ALL_FOCUS_KEYS.indexOf(mapped) !== -1) {
      selectedFocus = mapped;
    } else if (!selectedFocus) {
      selectedFocus = carryForwardFocusKey();
    }

    if (sessionMode === 'light') {
      try {
        var ch = (global.localStorage.getItem('grounded_da_recent_chain') || '').split(',').filter(Boolean);
        ch.push(sessionInteraction);
        global.localStorage.setItem('grounded_da_recent_chain', ch.slice(-2).join(','));
      } catch (_) {}
    }

    try {
      if (selectedEmotion) {
        global.localStorage.setItem('grounded_da_last_emotion', selectedEmotion);
      }
    } catch (_) {}

    try {
      if (typeof global.groundedApplyDailyArrivalComplete === 'function') {
        global.groundedApplyDailyArrivalComplete({ slider: sliderVal, focus: selectedFocus });
      }
    } catch (_) {}

    closePopovers();
    var rm = prefersReducedMotion();
    if (rm) {
      setBodyActive(false);
      finalizeHidden();
      return;
    }
    try {
      document.body.classList.add('daily-arrival-handoff');
    } catch (_) {}
    root.classList.add('daily-arrival-root--handoff');
    setBodyActive(false);
    global.setTimeout(finalizeHidden, HANDOFF_MS);
  }

  function finishSkip() {
    try {
      if (typeof global.groundedDismissDailyArrival === 'function') global.groundedDismissDailyArrival();
    } catch (_) {}
    hideRoot();
  }

  function goStep(n) {
    step = Math.max(0, Math.min(STEP_COUNT - 1, n));
    closePopovers();
    var panels = root.querySelectorAll('[data-daily-step]');
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      var sn = parseInt(p.getAttribute('data-daily-step'), 10);
      var on = sn === step;
      p.classList.toggle('daily-arrival-step--active', on);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    try {
      root.setAttribute('data-da-step', String(step));
    } catch (_) {}
    var progItems = root.querySelectorAll('[data-daily-progress-index]');
    for (var pi = 0; pi < progItems.length; pi++) {
      var pel = progItems[pi];
      var pidx = parseInt(pel.getAttribute('data-daily-progress-index'), 10);
      if (isNaN(pidx)) continue;
      pel.classList.toggle('daily-arrival-progress-item--done', pidx < step);
      pel.classList.toggle('daily-arrival-progress-item--current', pidx === step);
    }
    var dots = root.querySelectorAll('[data-daily-dot]');
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('daily-arrival-dot--active', d <= step);
    }
    if (step === 0) {
      hydrateGreeting();
      hydrateVerseArrival();
    }
    if (step === 2) hydrateGuidedPanel();
    var live = root.querySelector('#dailyArrivalLiveTitle');
    if (live) {
      if (sessionMode === 'full') {
        var titlesFull = [
          'Daily arrival',
          'Check-in',
          'Insight',
          'Choose a moment',
          'Complete'
        ];
        live.textContent = titlesFull[step] || '';
      } else {
        var lt = ['Arrival', 'Check-in', 'Insight', 'Moment', 'Home'];
        live.textContent = lt[step] || '';
      }
    }
    if (step === 4) hydrateCompletionStreak();
  }

  function hydrateGreeting() {
    var h = root.querySelector('#dailyArrivalGreetingHeadline');
    var s = root.querySelector('#dailyArrivalGreetingSub');
    try {
      if (typeof global.groundedDailyArrivalGreetingLines === 'function') {
        var L = global.groundedDailyArrivalGreetingLines();
        if (h && L.headline) h.textContent = L.headline;
        if (s && L.sub) s.textContent = L.sub;
      }
    } catch (_) {}
  }

  function devHelpersAllowed() {
    try {
      var h = global.location && global.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1') return true;
    } catch (_) {}
    try {
      return global.localStorage.getItem('grounded_enable_daily_arrival_dev') === '1';
    } catch (_) {}
    return false;
  }

  /** Bind DOM once; safe if boot and dev force both run. */
  function ensureRootWired() {
    if (!root) {
      root = global.document.getElementById('dailyArrivalRoot');
      if (root) wire();
    }
    return !!root;
  }

  function wire() {
    if (!root) return;
    if (root.getAttribute('data-grounded-da-wired') === '1') return;
    root.setAttribute('data-grounded-da-wired', '1');

    bindPopoverDismiss();

    root.querySelectorAll('[data-daily-skip]').forEach(function (btn) {
      btn.addEventListener('click', finishSkip);
    });

    root.querySelectorAll('[data-daily-skip-forward]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.closest('[data-daily-step]');
        var sn = panel ? parseInt(panel.getAttribute('data-daily-step'), 10) : step;
        if (sn === 1) skipEmotionFromCheckin();
      });
    });

    root.querySelectorAll('[data-daily-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var to = parseInt(btn.getAttribute('data-daily-next'), 10);
        if (isNaN(to)) return;
        goStep(to);
      });
    });

    root.querySelectorAll('[data-da-emotion-tile]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedEmotion = btn.getAttribute('data-da-emotion-tile') || '';
        sliderVal = emotionToSlider(selectedEmotion);
        var moodRange = root.querySelector('#dailyArrivalMoodRange');
        if (moodRange) {
          moodRange.value = String(sliderVal);
          moodRange.setAttribute('aria-valuenow', String(sliderVal));
        }
        root.querySelectorAll('[data-da-emotion-tile]').forEach(function (b) {
          b.classList.toggle('is-selected', b === btn);
        });
        goStep(nextInSequence(1));
      });
    });

    root.querySelectorAll('[data-daily-moment-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pendingMomentTab = btn.getAttribute('data-daily-moment-tab') || 'feed';
        root.querySelectorAll('[data-daily-moment-tab]').forEach(function (b) {
          b.classList.toggle('is-selected', b === btn);
        });
        goStep(nextInSequence(3));
      });
    });

    var range = root.querySelector('#dailyArrivalMoodRange');
    if (range) {
      var syncAria = function () {
        sliderVal = parseInt(range.value, 10) || 50;
        range.setAttribute('aria-valuenow', String(sliderVal));
      };
      range.addEventListener('input', syncAria);
      range.addEventListener('change', syncAria);
    }

    var enter = root.querySelector('[data-daily-enter]');
    if (enter) {
      enter.addEventListener('click', function () {
        var dest = pendingMomentTab || 'feed';
        try {
          if (typeof global.switchTab === 'function') {
            global.switchTab(dest, { fromDailyArrivalComplete: true });
          }
        } catch (_) {}
        finishCompleteHandoff();
      });
    }

    root.querySelectorAll('[data-daily-infotoggle]').forEach(function (bt) {
      bt.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = bt.getAttribute('aria-controls');
        var pop = id ? document.getElementById(id) : null;
        if (!pop) return;
        var willOpen = !pop.classList.contains('daily-arrival-popover--open');
        closePopovers();
        if (willOpen) {
          pop.classList.add('daily-arrival-popover--open');
          bt.setAttribute('aria-expanded', 'true');
        }
      });
    });

    root.querySelectorAll('[data-daily-popclose]').forEach(function (x) {
      x.addEventListener('click', function (e) {
        e.stopPropagation();
        var pop = x.closest('.daily-arrival-popover');
        if (pop) pop.classList.remove('daily-arrival-popover--open');
        var tid = pop ? pop.getAttribute('id') : '';
        if (tid) {
          var toggle = root.querySelector('[aria-controls="' + tid + '"]');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    root.querySelectorAll('.daily-arrival-popover').forEach(function (pop) {
      pop.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    });
  }

  function tryShowFromPoll() {
    if (!root) {
      daLog('tryShow: no root');
      return;
    }
    if (opts.shouldAbortLaunch && opts.shouldAbortLaunch()) {
      daLog('tryShow: aborted (legal / already completed today)');
      return;
    }
    if (opts.shouldShow && !opts.shouldShow()) {
      daLog('tryShow: deferred (not ready — e.g. onboarding)');
      return;
    }
    daLog('tryShow: opening overlay');
    showRoot();
  }

  function boot() {
    if (!ensureRootWired()) {
      daLog('boot: #dailyArrivalRoot missing');
      return;
    }
    var deferPolls = 0;
    var blockerPolls = 0;
    var sawBlocker = false;

    function tick() {
      if (opts.shouldAbortLaunch && opts.shouldAbortLaunch()) {
        daLog('tick: abort — skip launch entirely', snapshotBlockersForLog());
        return;
      }

      if (opts.shouldShow && !opts.shouldShow()) {
        deferPolls++;
        if (deferPolls > MAX_DEFER_POLLS) {
          daLog('give up: shouldShow stayed false (onboarding timeout)', deferPolls);
          return;
        }
        if (deferPolls === 1 || (debugDailyArrivalEnabled() && deferPolls % 40 === 0)) {
          daLog('defer poll', deferPolls, '(waiting for shouldShow, e.g. onboarding complete)');
        }
        global.setTimeout(tick, POLL_MS);
        return;
      }

      if (shellBlocking()) {
        sawBlocker = true;
        blockerPolls++;
        if (blockerPolls > MAX_BLOCKER_POLLS) {
          daLog('give up: shell blockers did not clear', blockerPolls, snapshotBlockersForLog());
          return;
        }
        if (blockerPolls === 1 || (debugDailyArrivalEnabled() && blockerPolls % 25 === 0)) {
          daLog('blocked by shell', blockerPolls, snapshotBlockersForLog());
        }
        global.setTimeout(tick, POLL_MS);
        return;
      }

      var settle = sawBlocker ? SETTLE_AFTER_BLOCKERS_MS : SETTLE_CLEAN_MS;
      daLog('blockers clear — scheduling show', { sawBlocker: sawBlocker, settleMs: settle });
      global.setTimeout(tryShowFromPoll, settle);
    }

    daLog('boot scheduled', { bootDelayMs: BOOT_DELAY_MS });
    global.setTimeout(tick, BOOT_DELAY_MS);
  }

  global.GroundedDailyArrival = {
    init: function (o) {
      opts = o || {};
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
      } else {
        boot();
      }
    },
    tryShow: tryShowFromPoll,
    devHelpersAllowed: devHelpersAllowed,
    /** localhost / 127.0.0.1 / localStorage grounded_enable_daily_arrival_dev=1 — opens overlay (same transitions as normal). */
    forceShowForDev: function () {
      if (!devHelpersAllowed()) {
        try {
          global.console.warn(
            '[DailyArrival dev] Disabled. Use localhost, 127.0.0.1, or localStorage.setItem("grounded_enable_daily_arrival_dev","1") then reload.'
          );
        } catch (_) {}
        return false;
      }
      if (!ensureRootWired()) return false;
      closePopovers();
      try {
        global.document.body.classList.remove('daily-arrival-handoff');
      } catch (_) {}
      showRoot();
      return true;
    },
    /** Dev / debugging: mode picked for the current open overlay (after showRoot). */
    getSessionFlowDebug: function () {
      return {
        mode: sessionMode,
        interaction: sessionInteraction,
        sequence: sessionFlowSequence.slice()
      };
    }
  };
})(typeof window !== 'undefined' ? window : this);
