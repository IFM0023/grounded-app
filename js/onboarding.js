/**
 * Grounded — first-time onboarding (5 guided steps, local persistence).
 * Depends on: js/app-themes.js (GroundedThemes)
 */
(function (global) {
  var STEP_COUNT = 5;
  var TRANSITION_LOCK_MS = 300;

  function $(id) {
    return document.getElementById(id);
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
        // Always read latest from storage — `state` in this closure is the object passed
        // at init; persist() replaces the outer `state` binding, so the param stays stale
        // and would drop prior picks if we read state.onboardingGoals here.
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

  function pickFinalHeadline(goals) {
    var i;
    var id;
    for (i = 0; i < goals.length; i++) {
      id = String(goals[i] || '');
      if (id.indexOf('anxious') !== -1 || id.indexOf('overwhelmed') !== -1) {
        return "You don\u2019t have to have it all together. Just come as you are.";
      }
    }
    for (i = 0; i < goals.length; i++) {
      id = String(goals[i] || '');
      if (id.indexOf('growth') !== -1 || id.indexOf('grow') !== -1 || id === 'consistent') {
        return "You\u2019re building something meaningful. Just keep showing up.";
      }
    }
    return "You don\u2019t need to be perfect. Just show up.";
  }

  function applyFinalStepCopy(root, state) {
    var h = root.querySelector('#onboardH3');
    if (!h) return;
    h.textContent = pickFinalHeadline(parseGoalsForFinalMessage(state));
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
    function persist(partial) {
      state = GroundedThemes.saveOnboardingState(partial);
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
    var animating = false;

    function updateContinueState() {
      if (!btnContinue) return;
      var onFinal = step === STEP_COUNT - 1;
      btnContinue.textContent = onFinal ? 'Begin' : 'Continue';
      var can = canProceed(step, state);
      var disabled = !onFinal && !can;
      btnContinue.disabled = disabled;
      btnContinue.setAttribute('aria-disabled', disabled ? 'true' : 'false');
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

    function goTo(s) {
      if (s < 0 || s >= STEP_COUNT || s === step) return;
      if (animating) return;
      if (s > step && !canProceed(step, state)) return;
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

    GroundedThemes.applyProductTheme(state.selectedTheme === 'blush' ? 'blush' : 'neutral');

    var onPick = function () {
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
        if (step > 0) goTo(step - 1);
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
          if (typeof GroundedThemes !== 'undefined' && GroundedThemes.REPLAY_ONBOARDING_SESSION) {
            try {
              sessionStorage.removeItem(GroundedThemes.REPLAY_ONBOARDING_SESSION);
            } catch (_) {}
          }
        } catch (_) {}
        root.classList.remove('is-visible');
        document.body.classList.remove('onboarding-active');
        setTimeout(function () {
          root.setAttribute('hidden', '');
          root.setAttribute('aria-hidden', 'true');
        }, 380);

        if (typeof startFirstMoment === 'function') {
          setTimeout(function () {
            startFirstMoment();
          }, 0);
        } else if (typeof global.startFirstMoment === 'function') {
          setTimeout(function () {
            global.startFirstMoment();
          }, 0);
        }
      });
    }
  }

  global.GroundedOnboarding = { init: init };
})(typeof window !== 'undefined' ? window : this);
