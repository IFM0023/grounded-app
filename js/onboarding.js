/**
 * Grounded — first-time onboarding (5 guided steps, local persistence).
 * Depends on: js/app-themes.js (GroundedThemes)
 */
(function (global) {
  var STEP_COUNT = 5;
  var TRANSITION_LOCK_MS = 300;

  /** Human-readable "why" strings (aligned with WHY_THEME_MAP on the host page). */
  var GOAL_ID_TO_WHY_LABEL = {
    grow_closer: 'I want to grow closer to God',
    quiet_moment: 'I just need a quiet moment',
    anxious_peace: 'I feel anxious and need peace',
    overwhelmed: 'I feel overwhelmed',
    guidance_now: 'I need guidance right now',
    daily_habit: 'I want to build a daily habit',
    difficult_season: 'I’m going through something difficult',
    disconnected: 'I feel disconnected from God',
    consistent: 'I want to be more consistent',
    feel_better_today: 'I just want to feel better today'
  };

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

  /** Primary “why” goal: saved intent if still selected, else first in list (Why are you here?). */
  function pickPrimaryGoalId(state) {
    var goals = parseGoalsForFinalMessage(state);
    var intent = state && state.userIntent != null ? String(state.userIntent).trim() : '';
    if (intent && hasGoalInList(goals, intent)) return intent;
    return goals.length ? String(goals[0] || '').trim() : '';
  }

  function pickFinalSubline(primaryGoalId) {
    var id = String(primaryGoalId || '');
    var lines = {
      grow_closer: 'Every day you show up is a day you grow.',
      anxious_peace: 'Peace is here. It starts with a few quiet minutes.',
      overwhelmed: 'Peace is here. It starts with a few quiet minutes.',
      quiet_moment: 'You gave yourself permission to pause. That matters.',
      daily_habit: 'Small and consistent beats perfect and rare.',
      consistent: 'Small and consistent beats perfect and rare.',
      guidance_now: "You don't have to figure it out alone."
    };
    return lines[id] || 'This is your space. Come back to it every day.';
  }

  function readSkippedFromStorage() {
    try {
      return localStorage.getItem('grounded_onboarding_skipped') === 'true';
    } catch (_) {
      return false;
    }
  }

  function applyFinalStepCopy(root, state) {
    var h = root.querySelector('#onboardH3');
    var t = root.querySelector('#onboardH3trans');
    if (readSkippedFromStorage()) {
      if (h) h.textContent = 'You can always come back to this.';
      if (t) t.textContent = 'You can update your preferences anytime in Settings.';
      return;
    }
    if (h) {
      var rawName = readDisplayNameForFinal(state);
      var displayName = rawName ? rawName : 'Friend';
      h.textContent = displayName + ', you\u2019re in the right place.';
    }
    if (t) t.textContent = pickFinalSubline(pickPrimaryGoalId(state));
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
      root.classList.remove('is-visible');
      document.body.classList.remove('onboarding-active');
      return;
    }

    if (!GroundedThemes.shouldShowOnboardingUI()) {
      root.setAttribute('hidden', '');
      root.setAttribute('aria-hidden', 'true');
      root.classList.remove('is-visible');
      document.body.classList.remove('onboarding-active');
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
    root.removeAttribute('hidden');
    root.setAttribute('aria-hidden', 'false');
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
      var foot = $('onboardingFinalBtnHint');
      if (foot) {
        if (onFinal && !userSkippedPath) {
          foot.removeAttribute('hidden');
        } else {
          foot.setAttribute('hidden', '');
        }
      }
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
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          try {
            el.focus({ preventScroll: true });
          } catch (e) {
            try {
              el.focus();
            } catch (e2) {}
          }
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
          localStorage.setItem('onboardingCompleted', 'true');
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
        root.classList.remove('is-visible');
        document.body.classList.remove('onboarding-active');
        setTimeout(function () {
          root.setAttribute('hidden', '');
          root.setAttribute('aria-hidden', 'true');
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
