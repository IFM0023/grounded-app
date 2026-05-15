/**
 * Grounded — first-time onboarding (5 guided steps, local persistence).
 * Depends on: js/app-themes.js (GroundedThemes)
 */
(function (global) {
  var STEP_COUNT = 5;
  var TRANSITION_LOCK_MS = 420;

  /** Human-readable “why” strings (aligned with ONBOARDING_GOAL_KEYS in app-themes.js). */
  var GOAL_ID_TO_WHY_LABEL = {
    anxious_peace: 'I feel anxious and need peace',
    overwhelmed: 'I feel overwhelmed',
    guidance_now: 'I need guidance right now',
    difficult_season: 'I’m going through something difficult',
    disconnected: 'I feel disconnected from God',
    miss_close_god: 'I miss feeling close to God',
    consistent: 'I want to be more consistent'
  };

  function escapeOnboardingHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function $(id) {
    return document.getElementById(id);
  }

  function mapDailyTimeToPref(code) {
    if (code === '2-3') return 'quick';
    if (code === '5') return 'daily';
    if (code === '10+') return 'deeper';
    return 'daily';
  }

  function mapPreferredTimeToStored(w) {
    if (w === 'night') return 'evening';
    if (w === 'flex') return 'flexible';
    if (w === 'morning' || w === 'midday') return w;
    return 'flexible';
  }

  function goalsToWhyLabels(goalIds) {
    var out = [];
    if (!Array.isArray(goalIds)) return out;
    for (var i = 0; i < goalIds.length; i++) {
      var id = String(goalIds[i] || '').trim();
      var lab = GOAL_ID_TO_WHY_LABEL[id];
      if (lab) out.push(lab);
    }
    return out;
  }

  function syncGroundedPreferenceKeys(state) {
    if (!state || typeof state !== 'object') return;
    try {
      var name = typeof state.userName === 'string' ? String(state.userName).trim() : '';
      if (name) {
        localStorage.setItem('grounded_user_name', name);
      }
      var why = goalsToWhyLabels(state.onboardingGoals);
      localStorage.setItem('grounded_why', JSON.stringify(why));
      if (typeof state.dailyTime === 'string' && state.dailyTime) {
        localStorage.setItem('grounded_time_pref', mapDailyTimeToPref(state.dailyTime));
      }
      if (typeof state.preferredTime === 'string' && state.preferredTime) {
        localStorage.setItem('grounded_time_of_day', mapPreferredTimeToStored(state.preferredTime));
      }
    } catch (_) {}
  }

  function setStepVisibility(root, step) {
    var panels = root.querySelectorAll('[data-on-step]');
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      var n = parseInt(p.getAttribute('data-on-step'), 10);
      var on = n === step;
      p.classList.toggle('onboarding-step--active', on);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    var dots = root.querySelectorAll('.onboarding-dots .on-dot');
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('on-dot--active', d === step);
    }
  }

  function hasGoalInList(arr, id) {
    if (!Array.isArray(arr)) return false;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === id) return true;
    }
    return false;
  }

  function toggleGoalInList(arr, id) {
    var g = arr && Array.isArray(arr) ? arr.slice() : [];
    for (var i = 0; i < g.length; i++) {
      if (g[i] === id) {
        g.splice(i, 1);
        return g;
      }
    }
    g.push(id);
    return g;
  }

  function syncOnboardingGoalButtons(root, state) {
    var opts = root.querySelectorAll('[data-on-goal]');
    var goals = state && Array.isArray(state.onboardingGoals) ? state.onboardingGoals : [];
    for (var j = 0; j < opts.length; j++) {
      var el = opts[j];
      var id = el.getAttribute('data-on-goal') || '';
      var sel = hasGoalInList(goals, id);
      el.classList.toggle('is-selected', sel);
      el.setAttribute('aria-pressed', sel ? 'true' : 'false');
    }
  }

  function wireOnboardingGoals(root, save, onPick) {
    var opts = root.querySelectorAll('[data-on-goal]');
    for (var i = 0; i < opts.length; i++) {
      opts[i].addEventListener('click', function () {
        var v = this.getAttribute('data-on-goal') || '';
        if (!v) return;
        var latest = null;
        if (typeof GroundedThemes !== 'undefined' && typeof GroundedThemes.loadOnboardingState === 'function') {
          latest = GroundedThemes.loadOnboardingState();
        }
        var base =
          latest && Array.isArray(latest.onboardingGoals) ? latest.onboardingGoals : [];
        var g = toggleGoalInList(base, v);
        var first = g.length > 0 ? g[0] : '';
        save({ onboardingGoals: g, userIntent: first });
        syncOnboardingGoalButtons(root, { onboardingGoals: g });
        if (typeof onPick === 'function') onPick();
      });
    }
  }

  function wireSingleChoice(root, attr, field, state, save, onPick) {
    var opts = root.querySelectorAll('[' + attr + ']');
    for (var i = 0; i < opts.length; i++) {
      opts[i].addEventListener('click', function () {
        var v = this.getAttribute(attr) || '';
        state[field] = v;
        var patch = {};
        patch[field] = v;
        save(patch);
        for (var j = 0; j < opts.length; j++) {
          opts[j].classList.toggle('is-selected', opts[j] === this);
        }
        if (typeof onPick === 'function') onPick();
      });
    }
  }

  /** Load goal ids for the closing screen: state first, then localStorage mirror. */
  function parseGoalsForFinalMessage(state) {
    if (state && Array.isArray(state.onboardingGoals) && state.onboardingGoals.length) {
      return state.onboardingGoals;
    }
    try {
      var raw = localStorage.getItem('onboardingGoals');
      if (!raw) return [];
      var p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch (_) {
      return [];
    }
  }

  function readDisplayNameForFinal(state) {
    var n = '';
    if (state && typeof state.userName === 'string') n = String(state.userName).trim();
    if (!n) {
      try {
        n = String(localStorage.getItem('userName') || localStorage.getItem('grounded_user_name') || '').trim();
      } catch (_) {
        n = '';
      }
    }
    return n;
  }

  function readSkippedFromStorage() {
    try {
      return localStorage.getItem('grounded_onboarding_skipped') === 'true';
    } catch (_) {
      return false;
    }
  }

  function goalSetFromIds(goalIds) {
    var g = {};
    if (!Array.isArray(goalIds)) return g;
    for (var i = 0; i < goalIds.length; i++) {
      var id = String(goalIds[i] || '').trim();
      if (id) g[id] = true;
    }
    return g;
  }

  /**
   * Final recap: short, selection-aware copy — quiet observations, not slogans.
   * Order matters: blend overlapping signals; never echo choices literally.
   * Returns 1–4 short lines (plain sentences); rendered as separate paragraphs.
   */
  function buildPersonalizedRecapParts(goalIds) {
    var g = goalSetFromIds(goalIds);
    var overwhelmed = !!g.overwhelmed;
    var anxious = !!g.anxious_peace;
    var stress = overwhelmed || anxious;
    var distant = !!(g.disconnected || g.miss_close_god);
    var season = !!g.difficult_season;
    var guide = !!g.guidance_now;
    var steady = !!g.consistent;

    if (stress && steady) {
      return [
        "Showing up consistently hasn't felt easy lately.",
        'Grounded is designed to help you slow down and reconnect in a way that feels manageable.'
      ];
    }
    if (distant && stress) {
      return [
        "You don't need to have everything figured out before coming back here.",
        'Grounded stays straightforward — a little time, whenever you have it.'
      ];
    }
    if (distant && steady) {
      return [
        'You can keep a small rhythm without having everything sorted first.',
        'Grounded fits short windows — plain language, small steps.'
      ];
    }
    if (distant && season) {
      return [
        "You don't need to have everything figured out before coming back here.",
        'A difficult season rarely needs a tidy explanation — just a steady place to land.'
      ];
    }
    if (distant && guide) {
      return [
        'Direction can feel fuzzy long before it feels clear.',
        'Use this as a slower space to think — without needing every answer upfront.'
      ];
    }
    if (distant) {
      return ["You don't need to have everything figured out before coming back here."];
    }
    if (season && guide) {
      return ['This can simply be a place to pause, reflect, and reset when you need it.'];
    }
    if (stress && guide) {
      return [
        'When everything feels urgent, perspective rarely shows up all at once.',
        'This can be a slower place to sort through what matters — without forcing a neat ending.'
      ];
    }
    if (stress && season) {
      return [
        'Hard stretches rarely need a grand gesture.',
        'Small pauses still help, even when they\u2019re brief.'
      ];
    }
    if (steady && guide && !stress && !distant && !season) {
      return [
        "You don't need the whole answer today.",
        'Grounded fits short windows — enough room to think without rushing a conclusion.'
      ];
    }
    if (anxious && !overwhelmed && steady) {
      return [
        'Consistency is harder when your mind keeps racing ahead.',
        'Grounded is built for short, steady check-ins — not performance.'
      ];
    }
    if (overwhelmed && !anxious && steady) {
      return [
        'When everything feels full, showing up is its own kind of discipline.',
        'Grounded is designed to help you slow down and reconnect in a way that feels manageable.'
      ];
    }
    if (anxious && !overwhelmed && !steady && !guide && !season) {
      return [
        'A few quiet minutes can change the tone of an entire day.',
        'Grounded is built for small entries — nothing loud required.'
      ];
    }
    if (overwhelmed && !anxious && !steady && !guide && !season) {
      return [
        'When the load runs high, tiny anchors help.',
        'Grounded keeps things contained so you can step in without a big production.'
      ];
    }
    if (stress) {
      return [
        'When the load runs high, tiny anchors help.',
        'Grounded keeps things contained so you can step in without a big production.'
      ];
    }
    if (guide) {
      return [
        "You don't need the whole answer today.",
        'Think it through here in shorter stretches — one moment, then the next.'
      ];
    }
    if (season) {
      return [
        'Some weeks ask for less performance, not more noise.',
        'This can be one steady place to pause without the right words lined up first.'
      ];
    }
    if (steady) {
      return [
        'Consistency rarely looks perfect.',
        'Grounded fits short windows — the kind real calendars actually have.'
      ];
    }
    return [
      'Nothing here needs to be earned first.',
      'When you have a few minutes, this will be here.'
    ];
  }

  function normalizeRecapParts(parts) {
    var out = [];
    if (!Array.isArray(parts)) return out;
    for (var i = 0; i < parts.length && out.length < 4; i++) {
      var s = String(parts[i] == null ? '' : parts[i]).trim();
      if (s) out.push(s);
    }
    return out;
  }

  function buildPersonalizedRecapHtml(parts) {
    var lines = normalizeRecapParts(parts);
    if (!lines.length) return '';
    var html = '<div class="onboarding-final-recap-personalized">';
    if (lines.length === 1) {
      html +=
        '<p class="onboarding-final-recap-personalized-line onboarding-final-recap-single">' +
        escapeOnboardingHtml(lines[0]) +
        '</p>';
    } else {
      for (var i = 0; i < lines.length; i++) {
        var cls = i === 0 ? 'onboarding-final-recap-lead' : 'onboarding-final-recap-body';
        html +=
          '<p class="onboarding-final-recap-personalized-line ' +
          cls +
          '">' +
          escapeOnboardingHtml(lines[i]) +
          '</p>';
      }
    }
    html += '</div>';
    return html;
  }

  function applyFinalStepCopy(root, state) {
    var ready = root.querySelector('#onboardFinalReady');
    var wrap = root.querySelector('#onboardRecapWrap');
    var tag = root.querySelector('#onboardH3trans');
    if (readSkippedFromStorage()) {
      if (ready) ready.textContent = 'You can always come back to this.';
      if (wrap) {
        wrap.classList.remove('onboarding-final-recap-host--visible');
        wrap.innerHTML =
          '<p class="onboarding-final-recap-single">' +
          escapeOnboardingHtml('You can update your preferences anytime in Settings.') +
          '</p>';
        void wrap.offsetWidth;
        wrap.classList.add('onboarding-final-recap-host--visible');
      }
      if (tag) {
        tag.setAttribute('hidden', '');
        tag.hidden = true;
      }
      return;
    }
    if (ready) ready.textContent = 'Your space is ready 🤍';
    if (tag) {
      tag.removeAttribute('hidden');
      tag.hidden = false;
      tag.textContent = 'Small and consistent beats perfect and rare.';
    }
    var goals = parseGoalsForFinalMessage(state);
    var parts = buildPersonalizedRecapParts(goals);
    if (wrap) {
      wrap.classList.remove('onboarding-final-recap-host--visible');
      var recapHtml = buildPersonalizedRecapHtml(parts);
      if (!recapHtml) {
        recapHtml = buildPersonalizedRecapHtml([
          'Nothing here needs to be earned first.',
          'When you have a few minutes, this will be here.'
        ]);
      }
      wrap.innerHTML = recapHtml;
      void wrap.offsetWidth;
      wrap.classList.add('onboarding-final-recap-host--visible');
    }
  }

  /** Apple / store review: clean URLs like /privacy load index.html; do not overlay onboarding. */
  function isLegalMarketingPathname() {
    try {
      var p = String(location.pathname || '/')
        .replace(/\/+$/, '')
        .replace(/\/$/, '') || '/';
      var pl = p.toLowerCase();
      if (pl === '/privacy' || pl === '/terms' || pl === '/contact') return true;
      var segs = pl.split('/').filter(Boolean);
      var last = segs.length ? segs[segs.length - 1] : '';
      return last === 'privacy' || last === 'terms' || last === 'contact';
    } catch (e) {
      return false;
    }
  }

  function canProceed(step, state) {
    if (step >= STEP_COUNT - 1) return true;
    if (step === 0) return true;
    if (step === 1) {
      return Array.isArray(state.onboardingGoals) && state.onboardingGoals.length > 0;
    }
    if (step === 2) return !!state.dailyTime;
    if (step === 3) return !!state.preferredTime;
    return false;
  }

  function init(options) {
    var startFirstMoment = options && options.startFirstMoment;

    var root = $('onboardingRoot');
    if (!root || typeof GroundedThemes === 'undefined') return;

    if (isLegalMarketingPathname()) {
      root.setAttribute('hidden', '');
      root.setAttribute('aria-hidden', 'true');
      root.classList.remove('is-visible', 'onboarding-root--closing');
      document.body.classList.remove('onboarding-active');
      try {
        if (typeof global.updateAppStoreCtaVisibility === 'function') global.updateAppStoreCtaVisibility();
      } catch (_) {}
      return;
    }

    if (!GroundedThemes.shouldShowOnboardingUI()) {
      root.setAttribute('hidden', '');
      root.setAttribute('aria-hidden', 'true');
      root.classList.remove('is-visible', 'onboarding-root--closing');
      document.body.classList.remove('onboarding-active');
      try {
        if (typeof global.updateAppStoreCtaVisibility === 'function') global.updateAppStoreCtaVisibility();
      } catch (_) {}
      return;
    }

    var state = GroundedThemes.loadOnboardingState();
    var userSkippedPath = readSkippedFromStorage();

    function persist(partial) {
      state = GroundedThemes.saveOnboardingState(partial);
      syncGroundedPreferenceKeys(state);
      try {
        if (Array.isArray(state.onboardingGoals)) {
          localStorage.setItem('onboardingGoals', JSON.stringify(state.onboardingGoals));
        }
        if (typeof state.preferredTime === 'string') {
          localStorage.setItem('preferredTime', state.preferredTime);
        }
      } catch (_) {}
    }

    document.body.classList.add('onboarding-active');
    root.classList.remove('onboarding-root--closing');
    root.removeAttribute('hidden');
    root.setAttribute('aria-hidden', 'false');
    try {
      if (typeof global.updateAppStoreCtaVisibility === 'function') global.updateAppStoreCtaVisibility();
    } catch (_) {}
    try {
      var activeTab = document.body.getAttribute('data-active-tab') || 'feed';
      if (activeTab !== 'feed' && typeof global.switchTab === 'function') {
        global.switchTab('feed');
      }
    } catch (eSwFeed) {}
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add('is-visible');
      });
    });

    var step = typeof state.step === 'number' ? state.step : 0;
    if (step < 0 || step >= STEP_COUNT) step = 0;

    var btnContinue = $('onboardingContinueBtn');
    var btnBack = $('onboardingBackBtn');
    var btnSkip = $('onboardingSkipBtn');
    var animating = false;

    function updateSkipLinkVisibility() {
      if (!btnSkip) return;
      var show = step >= 0 && step <= 3;
      btnSkip.hidden = !show;
      btnSkip.setAttribute('aria-hidden', show ? 'false' : 'true');
    }

    function updateContinueState() {
      if (!btnContinue) return;
      var onFinal = step === STEP_COUNT - 1;
      btnContinue.textContent = onFinal ? 'Take my first moment \u2192' : 'Continue';
      var can = canProceed(step, state);
      var disabled = !onFinal && !can;
      btnContinue.disabled = disabled;
      btnContinue.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      updateSkipLinkVisibility();
    }

    function readNameForInput() {
      var n = (state && typeof state.userName === 'string' && state.userName) ? String(state.userName) : '';
      if (n) return n;
      try {
        n = localStorage.getItem('userName') || localStorage.getItem('grounded_user_name') || '';
      } catch (_) {
        n = '';
      }
      return n || '';
    }

    function saveNameToStorage(overrideValue) {
      var raw;
      if (typeof overrideValue === 'string') {
        raw = overrideValue;
      } else {
        var inp = $('onboardingNameInput');
        raw = inp && typeof inp.value === 'string' ? inp.value : '';
      }
      var name = String(raw).trim();
      try {
        localStorage.setItem('userName', name);
        localStorage.setItem('grounded_user_name', name);
      } catch (_) {}
      persist({ userName: name });
      if (typeof global.updateGreeting === 'function') {
        try {
          global.updateGreeting();
        } catch (_) {}
      }
    }

    function focusNameInput() {
      var el = $('onboardingNameInput');
      if (!el) return;
      var attempt = function () {
        try {
          el.focus({ preventScroll: true });
        } catch (e1) {
          try {
            el.focus();
          } catch (e2) {}
        }
      };
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          attempt();
          setTimeout(attempt, 80);
          setTimeout(attempt, 280);
        });
      });
    }

    function reflectChoices() {
      var nameInp = $('onboardingNameInput');
      if (nameInp) nameInp.value = readNameForInput();
      syncOnboardingGoalButtons(root, state);
      var times = root.querySelectorAll('[data-on-time]');
      for (var t = 0; t < times.length; t++) {
        var e = times[t];
        e.classList.toggle('is-selected', e.getAttribute('data-on-time') === state.dailyTime);
      }
      var whens = root.querySelectorAll('[data-on-when]');
      for (var w = 0; w < whens.length; w++) {
        var we = whens[w];
        we.classList.toggle('is-selected', we.getAttribute('data-on-when') === state.preferredTime);
      }
    }

    function goTo(s, force) {
      if (s < 0 || s >= STEP_COUNT || s === step) return;
      if (animating) return;
      if (!force && s > step && !canProceed(step, state)) return;
      animating = true;
      step = s;
      persist({ step: step });
      setStepVisibility(root, step);
      if (step === STEP_COUNT - 1) {
        applyFinalStepCopy(root, state);
      }
      if (btnBack) btnBack.hidden = step === 0;
      if (step === 0) focusNameInput();
      updateContinueState();
      setTimeout(function () {
        animating = false;
      }, TRANSITION_LOCK_MS);
    }

    function skipToFinalScreen() {
      userSkippedPath = true;
      try {
        localStorage.setItem('grounded_onboarding_skipped', 'true');
        localStorage.setItem('grounded_time_pref', 'daily');
        localStorage.setItem('grounded_time_of_day', 'flexible');
        localStorage.setItem('grounded_why', '[]');
        localStorage.removeItem('grounded_theme_override');
        localStorage.removeItem('grounded_theme_choice_note');
      } catch (_) {}
      var cleared = GroundedThemes.saveOnboardingState({
        onboardingGoals: [],
        userIntent: '',
        dailyTime: '5',
        preferredTime: 'flex',
        step: STEP_COUNT - 1
      });
      state = cleared;
      syncGroundedPreferenceKeys(state);
      try {
        localStorage.setItem('onboardingGoals', '[]');
        localStorage.setItem('dailyTime', '5');
        localStorage.setItem('preferredTime', 'flex');
      } catch (_) {}
      reflectChoices();
      goTo(STEP_COUNT - 1, true);
    }

    GroundedThemes.applyProductTheme(state.selectedTheme === 'blush' ? 'blush' : 'neutral');

    var onPick = function () {
      if (userSkippedPath && step < STEP_COUNT - 1) {
        try {
          localStorage.removeItem('grounded_onboarding_skipped');
        } catch (_) {}
        userSkippedPath = false;
      }
      updateContinueState();
    };
    wireOnboardingGoals(root, persist, onPick);
    wireSingleChoice(root, 'data-on-time', 'dailyTime', state, persist, onPick);
    wireSingleChoice(root, 'data-on-when', 'preferredTime', state, persist, onPick);

    var nameInp = $('onboardingNameInput');
    if (nameInp) {
      nameInp.addEventListener('input', function () {
        var v = this.value != null ? String(this.value) : '';
        persist({ userName: v });
      });
    }

    if (btnSkip && !btnSkip.dataset.bound) {
      btnSkip.dataset.bound = '1';
      btnSkip.addEventListener('click', function () {
        skipToFinalScreen();
      });
    }

    reflectChoices();
    setStepVisibility(root, step);
    if (step === STEP_COUNT - 1) {
      applyFinalStepCopy(root, state);
    }
    if (btnBack) btnBack.hidden = step === 0;
    if (step === 0) focusNameInput();
    updateContinueState();
    persist({ step: step });

    if (btnBack) {
      btnBack.addEventListener('click', function () {
        if (step > 0) {
          if (step === STEP_COUNT - 1) {
            try {
              localStorage.removeItem('grounded_onboarding_skipped');
            } catch (_) {}
            userSkippedPath = false;
            applyFinalStepCopy(root, state);
          }
          goTo(step - 1);
        }
      });
    }

    if (btnContinue) {
      btnContinue.addEventListener('click', function () {
        if (btnContinue.disabled) return;
        if (step < STEP_COUNT - 1) {
          if (!canProceed(step, state)) return;
          if (step === 0) saveNameToStorage();
          goTo(step + 1);
          return;
        }
        saveNameToStorage();
        if (!userSkippedPath) {
          try {
            localStorage.setItem('grounded_onboarding_skipped', 'false');
          } catch (_) {}
        }
        var skippedFinish = userSkippedPath;
        try {
          localStorage.setItem('onboardingCompleted', 'true');
        } catch (_) {}
        var done = GroundedThemes.saveOnboardingState({
          onboardingCompleted: true,
          step: STEP_COUNT - 1
        });
        try {
          localStorage.setItem('selectedTheme', done.selectedTheme || '');
          localStorage.setItem('userIntent', done.userIntent || '');
          localStorage.setItem('onboardingGoals', JSON.stringify(done.onboardingGoals || []));
          localStorage.setItem('dailyTime', done.dailyTime || '');
          localStorage.setItem('preferredTime', done.preferredTime || '');
          syncGroundedPreferenceKeys(done);
          if (typeof GroundedThemes !== 'undefined' && GroundedThemes.REPLAY_ONBOARDING_SESSION) {
            try {
              sessionStorage.removeItem(GroundedThemes.REPLAY_ONBOARDING_SESSION);
            } catch (_) {}
          }
        } catch (_) {}
        if (typeof global.applyGroundedOnboardingFinish === 'function') {
          try {
            global.applyGroundedOnboardingFinish({ skipped: skippedFinish, state: done });
          } catch (e) {}
        }
        root.classList.add('onboarding-root--closing');
        root.classList.remove('is-visible');
        document.body.classList.remove('onboarding-active');
        setTimeout(function () {
          root.classList.remove('onboarding-root--closing');
          root.setAttribute('hidden', '');
          root.setAttribute('aria-hidden', 'true');
          try {
            if (typeof global.updateAppStoreCtaVisibility === 'function') global.updateAppStoreCtaVisibility();
          } catch (_) {}
        }, 380);

        if (typeof startFirstMoment === 'function') {
          setTimeout(function () {
            startFirstMoment({ skipped: skippedFinish });
          }, 0);
        } else if (typeof global.startFirstMoment === 'function') {
          setTimeout(function () {
            global.startFirstMoment({ skipped: skippedFinish });
          }, 0);
        }
      });
    }
  }

  global.GroundedOnboarding = { init: init };
})(typeof window !== 'undefined' ? window : this);
