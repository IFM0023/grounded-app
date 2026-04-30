/**
 * Capacitor local notifications: daily verse reminder + weekly theme (native only).
 * Depends on: js/capacitor.js, js/cap-local-notifications.js (and cap-push-notifications.js) loaded before this file.
 */
(function (global) {
  var LS_NOTIF = 'grounded_notifications';
  var LS_TIME = 'grounded_reminder_time';
  var LS_DAILY_ON = 'grounded_daily_reminder_on';
  var LS_THEME_TITLE = 'grounded_weekly_theme_notify_title';
  var ID_DAILY = 91001;
  var ID_WEEKLY = 91002;

  function isCapNative() {
    try {
      return (
        global.Capacitor &&
        typeof global.Capacitor.isNativePlatform === 'function' &&
        global.Capacitor.isNativePlatform()
      );
    } catch (e) {
      return false;
    }
  }

  function getLocalNotifications() {
    try {
      return global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.LocalNotifications;
    } catch (e) {
      return null;
    }
  }

  function getVerseRefBody() {
    try {
      var v = JSON.parse(localStorage.getItem('grounded_current_verse') || 'null');
      var ref = v && String(v.ref || '').trim();
      if (ref) return ref;
    } catch (e) {}
    return 'Take a moment with God today.';
  }

  function getWeeklyThemeName() {
    var t = (localStorage.getItem(LS_THEME_TITLE) || '').trim();
    if (t) return t;
    var el = document.getElementById('homeWeeklyThemeTitle');
    return el ? String(el.textContent || '').trim() : '';
  }

  function parseTimeHHMM(s) {
    var d = String(s || '08:00').trim();
    var m = d.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return { hour: 8, minute: 0 };
    var h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
    var min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
    return { hour: h, minute: min };
  }

  function dailyReminderEnabled() {
    var raw = localStorage.getItem(LS_DAILY_ON);
    if (raw === null || raw === '') return true;
    return raw === 'true' || raw === '1';
  }

  function setDailyReminderEnabled(on) {
    localStorage.setItem(LS_DAILY_ON, on ? 'true' : 'false');
  }

  function getReminderTimeStr() {
    var t = localStorage.getItem(LS_TIME);
    if (t && /^\d{1,2}:\d{2}/.test(String(t).trim())) return String(t).trim();
    return '08:00';
  }

  function notifPermissionStoredGranted() {
    return (localStorage.getItem(LS_NOTIF) || '').trim() === 'granted';
  }

  function cancelDaily() {
    var LN = getLocalNotifications();
    if (!LN) return Promise.resolve();
    return LN.cancel({ notifications: [{ id: ID_DAILY }] }).catch(function () {});
  }

  function cancelWeekly() {
    var LN = getLocalNotifications();
    if (!LN) return Promise.resolve();
    return LN.cancel({ notifications: [{ id: ID_WEEKLY }] }).catch(function () {});
  }

  function scheduleWeeklyIfAllowed(canSchedule) {
    if (!canSchedule || !isCapNative()) return Promise.resolve();
    var LN = getLocalNotifications();
    if (!LN) return Promise.resolve();
    var theme = getWeeklyThemeName() || 'This week';
    var body = theme + ' — tap to begin your week';
    return cancelWeekly().then(function () {
      return LN.schedule({
        notifications: [
          {
            id: ID_WEEKLY,
            title: "This week's theme is live",
            body: body,
            schedule: {
              every: 'week',
              on: { weekday: 2, hour: 8, minute: 0 },
              repeats: true
            },
            extra: { groundedOpenTab: 'feed' }
          }
        ]
      });
    });
  }

  function scheduleDailyIfAllowed(canSchedule) {
    if (!canSchedule || !isCapNative()) return Promise.resolve();
    if (!dailyReminderEnabled()) {
      return cancelDaily();
    }
    var LN = getLocalNotifications();
    if (!LN) return Promise.resolve();
    var hm = parseTimeHHMM(getReminderTimeStr());
    var body = getVerseRefBody();
    return cancelDaily().then(function () {
      return LN.schedule({
        notifications: [
          {
            id: ID_DAILY,
            title: 'Your daily moment',
            body: body,
            schedule: {
              every: 'day',
              on: { hour: hm.hour, minute: hm.minute },
              repeats: true
            },
            extra: { groundedOpenTab: 'feed' }
          }
        ]
      });
    });
  }

  function syncAllScheduled() {
    if (!isCapNative()) return Promise.resolve();
    var LN = getLocalNotifications();
    if (!LN) return Promise.resolve();
    if (!notifPermissionStoredGranted()) {
      return cancelDaily().then(function () {
        return cancelWeekly();
      });
    }
    return LN.checkPermissions().then(function (st) {
      if (!st || st.display !== 'granted') return Promise.resolve();
      return scheduleDailyIfAllowed(true).then(function () {
        return scheduleWeeklyIfAllowed(true);
      });
    });
  }

  global.groundedRescheduleNativeDailyVerseNotification = function () {
    syncAllScheduled();
  };

  function wireActionListener() {
    if (!isCapNative()) return;
    var LN = getLocalNotifications();
    if (!LN || global.__groundedLocalNotifActionWired) return;
    global.__groundedLocalNotifActionWired = true;
    LN.addListener('localNotificationActionPerformed', function (info) {
      try {
        var n = info && info.notification;
        if (!n) return;
        var openTab = n.extra && n.extra.groundedOpenTab;
        var id = n.id;
        if (openTab === 'feed' || id === ID_DAILY || id === ID_WEEKLY) {
          if (typeof global.switchTab === 'function') global.switchTab('feed');
        }
      } catch (e) {}
    }).catch(function () {});
  }

  function showSoftPrompt() {
    var root = document.getElementById('groundedNotifPermissionPrompt');
    if (!root) return;
    root.removeAttribute('hidden');
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
  }

  function hideSoftPrompt() {
    var el = document.getElementById('groundedNotifPermissionPrompt');
    if (!el) return;
    el.setAttribute('hidden', '');
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
  }

  function maybeShowPostOnboardingPrompt() {
    if (!isCapNative()) return;
    var notifState = (localStorage.getItem(LS_NOTIF) || '').trim();
    if (notifState) return;
    try {
      if (localStorage.getItem('onboardingCompleted') !== 'true') return;
    } catch (e) {
      return;
    }
    setTimeout(function () {
      showSoftPrompt();
    }, 600);
  }

  function wireSoftPromptButtons() {
    var root = document.getElementById('groundedNotifPermissionPrompt');
    if (!root) return;
    var yes = document.getElementById('groundedNotifPromptYes');
    var later = document.getElementById('groundedNotifPromptLater');
    if (yes && !yes.dataset.groundedBound) {
      yes.dataset.groundedBound = '1';
      yes.addEventListener('click', function () {
        hideSoftPrompt();
        var LN = getLocalNotifications();
        if (!LN) return;
        LN.requestPermissions()
          .then(function (res) {
            if (res && res.display === 'granted') {
              localStorage.setItem(LS_NOTIF, 'granted');
              if (!localStorage.getItem(LS_TIME)) {
                localStorage.setItem(LS_TIME, '08:00');
              }
              if (localStorage.getItem(LS_DAILY_ON) === null) {
                setDailyReminderEnabled(true);
              }
              return syncAllScheduled();
            }
            localStorage.setItem(LS_NOTIF, 'denied');
          })
          .catch(function () {
            localStorage.setItem(LS_NOTIF, 'denied');
          });
      });
    }
    if (later && !later.dataset.groundedBound) {
      later.dataset.groundedBound = '1';
      later.addEventListener('click', function () {
        hideSoftPrompt();
        localStorage.setItem(LS_NOTIF, 'later');
      });
    }
  }

  function onDomReady() {
    wireActionListener();
    wireSoftPromptButtons();
    maybeShowPostOnboardingPrompt();
    syncAllScheduled();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDomReady);
  } else {
    onDomReady();
  }

  global.groundedNativeNotificationsOnOnboardingComplete = function () {
    maybeShowPostOnboardingPrompt();
  };

  global.groundedNativeNotifSyncFromSettings = function () {
    return syncAllScheduled();
  };

  global.groundedNativeNotifGetDailyReminderOn = dailyReminderEnabled;
  global.groundedNativeNotifSetDailyReminderOn = setDailyReminderEnabled;
})(typeof window !== 'undefined' ? window : this);
