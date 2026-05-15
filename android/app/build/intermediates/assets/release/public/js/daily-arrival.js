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
  var emotionChoiceCommitted = false;

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

  /** Seeded subset of focus keys for lightweight focus days (2–3 options). */
  function pickLightFocusSubset(todayKey) {
    var want = 2 + (hashString(todayKey + '|nfc') % 2);
    var arr = ALL_FOCUS_KEYS.slice();
    var seed = hashString(todayKey + '|fshuffle');
    for (var i = arr.length - 1; i > 0; i--) {
      seed = ((seed * 1103515245 + 12345) & 0x7fffffff) >>> 0;
      var j = seed % (i + 1);
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr.slice(0, want);
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

  function timeOfDayBucket() {
    try {
      var h = new Date().getHours();
      if (h >= 5 && h < 12) return 'morning';
      if (h >= 12 && h < 17) return 'day';
      if (h >= 17 && h < 22) return 'evening';
      return 'night';
    } catch (_) {
      return 'day';
    }
  }

  /** Sync mood value from the range input for completion copy (step may be ahead of last input event). */
  function syncSliderValFromDomForNudge() {
    if (!root) return;
    if (sessionMode === 'light' && sessionInteraction === 'none') return;
    var range = root.querySelector('#dailyArrivalMoodRange');
    if (!range) return;
    var isEmotion = sessionMode === 'light' && sessionInteraction === 'emotion';
    var block = root.querySelector('#dailyArrivalSliderBlock');
    if (!isEmotion && block && block.hasAttribute('hidden')) return;
    var v = parseInt(range.value, 10);
    if (!isNaN(v)) sliderVal = v;
  }

  function resolveEffectiveFocusForNudge() {
    if (selectedFocus && ALL_FOCUS_KEYS.indexOf(selectedFocus) !== -1) {
      return selectedFocus;
    }
    try {
      var picked = root.querySelector('[data-daily-focus].is-selected:not([hidden])');
      if (picked) {
        var ks = picked.getAttribute('data-daily-focus') || '';
        if (ALL_FOCUS_KEYS.indexOf(ks) !== -1) return ks;
      }
      var first = root.querySelector('[data-daily-focus]:not([hidden])');
      if (first) {
        var kf = first.getAttribute('data-daily-focus') || '';
        if (ALL_FOCUS_KEYS.indexOf(kf) !== -1) return kf;
      }
    } catch (_) {}
    return carryForwardFocusKey();
  }

  function moodBandForNudge() {
    var v = sliderVal;
    if (v >= 65) return 'heavy';
    if (v <= 42) return 'light';
    return 'mid';
  }

  function pickNudgeLine(pool, seed) {
    if (!pool || !pool.length) return '';
    return pool[hashString(seed) % pool.length];
  }

  function buildCompletionNudgeLine() {
    syncSliderValFromDomForNudge();
    var focusKey = resolveEffectiveFocusForNudge();
    var band = moodBandForNudge();
    var timeB = timeOfDayBucket();
    var seedBase =
      String(todayKeyFn() || '') +
      '|daNudge|' +
      focusKey +
      '|' +
      band +
      '|' +
      sessionMode +
      '|' +
      sessionInteraction +
      '|' +
      timeB;

    var genericHeavy = [
      'A quiet reset may help today.',
      'Stillness may feel kind right now.',
      'There is no rush from here.',
      'One small pause may be enough.',
      'Today can move at your pace.'
    ];
    var genericMid = [
      'A quiet moment may feel good when you are ready.',
      'Today\u2019s verse may be a gentle anchor.',
      'Begin with prayer when it feels right.',
      'Reflection could meet you where you are.'
    ];
    var genericLight = [
      'Today\u2019s reflection may invite you in gently.',
      'Reflection may feel grounding today.',
      'Today\u2019s verse may widen the view a little.',
      'You might enjoy starting with an affirmation.'
    ];

    var pools = {
      peace: {
        heavy: [
          'Today may call for stillness.',
          'Stillness first may help.',
          'A quiet moment may feel good today.'
        ],
        mid: [
          'A quiet moment may feel good today.',
          'Begin with today\u2019s prayer.',
          'Today may call for stillness.'
        ],
        light: [
          'Begin with today\u2019s prayer.',
          'Stillness may hold you gently today.',
          'Prayer may feel grounding when you are ready.'
        ]
      },
      encouragement: {
        heavy: [
          'Today\u2019s reflection leans softer.',
          'An affirmation may meet you gently.',
          'Something gentle may help first.'
        ],
        mid: [
          'Today\u2019s affirmation may meet you gently.',
          'Reassurance may be waiting in today\u2019s content.',
          'Today\u2019s reflection leans softer.'
        ],
        light: [
          'You may find reassurance in today\u2019s affirmation.',
          'Today\u2019s reflection may feel especially gentle.',
          'An affirmation may land softly today.'
        ]
      },
      clarity: {
        heavy: [
          'Today\u2019s verse may bring perspective.',
          'Reflection may feel simple today.',
          'One verse may be enough for now.'
        ],
        mid: [
          'Today\u2019s journal prompt may help slow things down.',
          'Begin with reflection today.',
          'Today\u2019s verse may bring perspective.'
        ],
        light: [
          'Reflection may help sort the noise gently.',
          'Today\u2019s verse may widen the frame.',
          'The journal may invite clarity without hurry.'
        ]
      },
      slowing_down: {
        heavy: [
          'Start gently today.',
          'Today doesn\u2019t need to move quickly.',
          'Small steps are enough.'
        ],
        mid: [
          'Start gently today.',
          'A quiet reset may help first.',
          'Today doesn\u2019t need to move quickly.'
        ],
        light: [
          'A quiet reset may help first.',
          'You can ease into the day slowly.',
          'Stillness before motion may feel right.'
        ]
      },
      perspective: {
        heavy: [
          'Today\u2019s verse may widen the view.',
          'One slower read may help.',
          'Perspective often arrives quietly.'
        ],
        mid: [
          'Today\u2019s verse may widen the view.',
          'Reflection may feel grounding today.',
          'Scripture may offer a wider frame.'
        ],
        light: [
          'Reflection may feel grounding today.',
          'Today\u2019s reading may shift the angle gently.',
          'Perspective may come through verse today.'
        ]
      },
      quiet_moment: {
        heavy: [
          'A hush may help before anything else.',
          'Stillness may be the kindest first step.',
          'Quiet may feel like enough today.'
        ],
        mid: [
          'A quiet moment may feel good today.',
          'Begin with a small pause when you are ready.',
          'Stillness may open the day gently.'
        ],
        light: [
          'A longer quiet may feel restorative.',
          'You might linger in prayer a little today.',
          'Unhurried time may feel like a gift.'
        ]
      }
    };

    var pool;
    if (!focusKey || !pools[focusKey]) {
      pool = band === 'heavy' ? genericHeavy : band === 'light' ? genericLight : genericMid;
      return pickNudgeLine(pool, seedBase);
    }
    var spec = pools[focusKey];
    pool = spec[band] || spec.mid;
    if (!pool || !pool.length) pool = spec.mid;
    return pickNudgeLine(pool, seedBase);
  }

  function hydrateCompletionNudge() {
    if (!root) return;
    var el = root.querySelector('#dailyArrivalCompletionNudge');
    var textEl = root.querySelector('#dailyArrivalCompletionNudgeText');
    if (!el || !textEl) return;
    var line = buildCompletionNudgeLine();
    if (!line) {
      textEl.textContent = '';
      el.setAttribute('hidden', '');
      return;
    }
    textEl.textContent = line;
    el.removeAttribute('hidden');
  }

  function applyFocusSubsetVisibility(isLightFocusDay) {
    if (!root) return;
    var keys = null;
    if (isLightFocusDay) {
      keys = pickLightFocusSubset(todayKeyFn() || String(Date.now()));
    }
    root.querySelectorAll('[data-daily-focus]').forEach(function (btn) {
      var k = btn.getAttribute('data-daily-focus') || '';
      if (!keys) {
        btn.removeAttribute('hidden');
        btn.style.display = '';
        return;
      }
      var show = keys.indexOf(k) !== -1;
      btn.toggleAttribute('hidden', !show);
      btn.style.display = show ? '' : 'none';
      if (!show) btn.classList.remove('is-selected');
    });
  }

  function configureSliderVersusEmotionUI() {
    if (!root) return;
    var step2 = root.querySelector('[data-daily-step="2"]');
    var sliderWrap = root.querySelector('#dailyArrivalSliderBlock');
    var emotionWrap = root.querySelector('#dailyArrivalEmotionBlock');
    var moodTitle = root.querySelector('#dailyArrivalMoodTitle');
    var moodHint = root.querySelector('#dailyArrivalMoodHint');

    var isEmotion =
      sessionMode === 'light' && sessionInteraction === 'emotion';

    if (sliderWrap) sliderWrap.toggleAttribute('hidden', !!isEmotion);
    if (emotionWrap) emotionWrap.toggleAttribute('hidden', !isEmotion);

    if (moodTitle && moodHint) {
      if (isEmotion) {
        moodTitle.textContent = 'How does today feel?';
        moodHint.textContent = 'Two gentle choices — pick what fits.';
      } else {
        moodTitle.textContent = 'How are you arriving today?';
        moodHint.textContent =
          'Nothing about today has to be perfect. Just notice where you are.';
      }
    }

    if (step2) {
      step2.classList.toggle('daily-arrival-step--emotion-pair', !!isEmotion);
    }

    root.querySelectorAll('[data-da-emotion-choice]').forEach(function (b) {
      b.classList.remove('is-selected');
    });
    emotionChoiceCommitted = false;

    if (isEmotion) {
      sliderVal = 50;
      var range = root.querySelector('#dailyArrivalMoodRange');
      if (range) {
        range.value = '50';
        range.setAttribute('aria-valuenow', '50');
      }
    }
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
    titleEl.textContent = 'Your daily moment';
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
    var verseBtn = root.querySelector('[data-daily-step="1"] [data-daily-next]');
    if (verseBtn) verseBtn.setAttribute('data-daily-next', String(nextInSequence(1)));

    var s2btn = root.querySelector('[data-daily-step="2"] [data-daily-next]');
    if (s2btn) s2btn.setAttribute('data-daily-next', String(nextInSequence(2)));

    var s3btn = root.querySelector('[data-daily-step="3"] [data-daily-next]');
    if (s3btn) s3btn.setAttribute('data-daily-next', String(nextInSequence(3)));

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
      applyFocusSubsetVisibility(false);
    } else {
      sessionInteraction = getOrPickLightweightInteraction(todayK);
      sessionFlowSequence = buildLightSequence(sessionInteraction);
      applyFocusSubsetVisibility(sessionInteraction === 'focus');
    }

    configureSliderVersusEmotionUI();
    applyFlowChromeCopy();
    applyFlowProgressNav();
    wireNavigationButtons();

    var wf = root.querySelector('#dailyArrivalWhatFocus');
    var ws = root.querySelector('#dailyArrivalWhatSlider');
    if (sessionMode === 'light') {
      if (wf) wf.setAttribute('hidden', '');
      if (ws) ws.setAttribute('hidden', '');
    } else {
      if (wf) wf.removeAttribute('hidden');
      if (ws) ws.removeAttribute('hidden');
    }
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
    try {
      document.body.classList.toggle('daily-arrival-active', !!on);
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
    root.removeAttribute('hidden');
    root.setAttribute('aria-hidden', 'false');
    root.classList.remove('daily-arrival-root--leaving', 'daily-arrival-root--handoff');
    void root.offsetWidth;
    step = 0;
    sliderVal = 50;
    selectedFocus = '';
    var range = root.querySelector('#dailyArrivalMoodRange');
    if (range) {
      range.value = '50';
      range.setAttribute('aria-valuenow', '50');
      sliderVal = 50;
    }
    root.querySelectorAll('[data-daily-focus]').forEach(function (b) {
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
    } else if (range) {
      sliderVal = parseInt(range.value, 10) || sliderVal;
    }

    if (!selectedFocus) {
      var first = root.querySelector('[data-daily-focus]:not([hidden])');
      if (first) {
        selectedFocus = first.getAttribute('data-daily-focus') || '';
        root.querySelectorAll('[data-daily-focus]').forEach(function (b) {
          b.classList.toggle('is-selected', b === first);
        });
      }
    }
    if (!selectedFocus && sessionMode === 'light' && sessionInteraction === 'none') {
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
    if (step === 0) hydrateGreeting();
    if (step === 1) {
      try {
        if (typeof global.groundedDailyArrivalHydrateVerseStep === 'function') {
          global.groundedDailyArrivalHydrateVerseStep();
        }
      } catch (_) {}
    }
    var live = root.querySelector('#dailyArrivalLiveTitle');
    if (live) {
      if (sessionMode === 'full') {
        var titlesFull = [
          'Greeting',
          'Today\u2019s verse',
          'Quick check-in',
          'What would help most',
          'You\u2019re all set'
        ];
        live.textContent = titlesFull[step] || '';
      } else {
        var lt = ['Greeting', 'Verse', 'Pause', 'Pause', 'Welcome in'];
        if (step === 2) {
          lt[2] = sessionInteraction === 'emotion' ? 'Checking in' : 'Arriving';
        }
        if (step === 3) lt[3] = 'Something gentle';
        live.textContent = lt[step] || '';
      }
    }
    if (step === 4) hydrateCompletionNudge();
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
        if (sn === 2) {
          goStep(nextInSequence(2));
          return;
        }
        if (sn === 3) {
          if (!selectedFocus) {
            var first = root.querySelector('[data-daily-focus]:not([hidden])');
            if (first) {
              selectedFocus = first.getAttribute('data-daily-focus') || '';
              root.querySelectorAll('[data-daily-focus]').forEach(function (b) {
                b.classList.toggle('is-selected', b === first);
              });
            }
          }
          goStep(nextInSequence(3));
        }
      });
    });

    root.querySelectorAll('[data-daily-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var to = parseInt(btn.getAttribute('data-daily-next'), 10);
        if (isNaN(to)) return;
        if (step === 3 && !selectedFocus) {
          var first = root.querySelector('[data-daily-focus]:not([hidden])');
          if (first) {
            selectedFocus = first.getAttribute('data-daily-focus') || '';
            root.querySelectorAll('[data-daily-focus]').forEach(function (b) {
              b.classList.toggle('is-selected', b === first);
            });
          }
        }
        goStep(to);
      });
    });

    root.querySelectorAll('[data-daily-focus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedFocus = btn.getAttribute('data-daily-focus') || '';
        root.querySelectorAll('[data-daily-focus]').forEach(function (b) {
          b.classList.toggle('is-selected', b === btn);
        });
      });
    });

    root.querySelectorAll('[data-da-emotion-choice]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.getAttribute('data-da-emotion-choice') || '';
        sliderVal = kind === 'steady' ? 38 : kind === 'weighted' ? 76 : 50;
        emotionChoiceCommitted = true;
        root.querySelectorAll('[data-da-emotion-choice]').forEach(function (b) {
          b.classList.toggle('is-selected', b === btn);
        });
        var moodRange = root.querySelector('#dailyArrivalMoodRange');
        if (moodRange) {
          moodRange.value = String(sliderVal);
          moodRange.setAttribute('aria-valuenow', String(sliderVal));
        }
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
    if (enter) enter.addEventListener('click', finishCompleteHandoff);

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
