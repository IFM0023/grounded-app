/**
 * Study tab: Landing Mode (default entry) vs Context Mode (verse/chapter from Scripture).
 * Expects window.GroundedStudyBridge (assigned from index.html before first render).
 */
(function (global) {
  'use strict';

  var BOOKS = global.STUDY_BIBLE_BOOKS || [];
  var JOURNAL_KEY = 'grounded_study_journal';
  var PLANS_KEY = 'grounded_study_plan_progress_v1';
  var OVERVIEW_CACHE = 'grounded_book_overview_cache_v1';

  var state = {
    view: 'home',
    book: '',
    chapter: 1,
    verse: null,
    planId: null,
    list: null,
    fromScripture: false
  };

  function syncStudyScreenChrome() {
    var screen = document.getElementById('screen-study');
    if (!screen) return;
    var landing = state.view === 'home';
    screen.classList.toggle('study-screen--landing', landing);
    screen.classList.toggle('study-screen--context', !landing);
  }

  function bridge() {
    return global.GroundedStudyBridge || {};
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function el(root, sel) {
    return root ? root.querySelector(sel) : null;
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var o = JSON.parse(raw);
      return o == null ? fallback : o;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function journalEntries() {
    var a = readJson(JOURNAL_KEY, []);
    return Array.isArray(a) ? a : [];
  }

  function pushJournal(entry) {
    var a = journalEntries();
    a.unshift(entry);
    writeJson(JOURNAL_KEY, a.slice(0, 200));
  }

  function planProgress() {
    var o = readJson(PLANS_KEY, {});
    return o && typeof o === 'object' ? o : {};
  }

  function setPlanDay(planId, day) {
    var o = planProgress();
    o[planId] = { day: Math.max(0, Math.min(6, day | 0)) };
    writeJson(PLANS_KEY, o);
  }

  function getPlanDay(planId) {
    var o = planProgress();
    var p = o[planId];
    return p && typeof p.day === 'number' ? p.day : 0;
  }

  function overviewCacheGet(book) {
    var c = readJson(OVERVIEW_CACHE, {});
    return c && typeof c === 'object' ? c[String(book).trim()] || null : null;
  }

  function overviewCacheSet(book, data) {
    var c = readJson(OVERVIEW_CACHE, {});
    if (!c || typeof c !== 'object') c = {};
    c[String(book).trim()] = data;
    var keys = Object.keys(c);
    if (keys.length > 80) {
      keys.slice(0, keys.length - 80).forEach(function (k) {
        delete c[k];
      });
    }
    writeJson(OVERVIEW_CACHE, c);
  }

  var READING_PLANS = [
    {
      id: 'anxiety-peace',
      title: 'Anxiety and Peace',
      description: 'Seven short stops in Scripture when worry rises and you need God’s steadiness.',
      passages: [
        { book: 'Philippians', chapter: 4, line: 'Prayer instead of panic' },
        { book: 'Psalms', chapter: 23, line: 'The Lord as shepherd' },
        { book: 'Matthew', chapter: 6, line: 'Do not worry about tomorrow' },
        { book: 'Isaiah', chapter: 41, line: 'Fear not, for I am with you' },
        { book: 'Psalms', chapter: 46, line: 'Be still and know' },
        { book: 'John', chapter: 14, line: 'Peace I leave with you' },
        { book: '1 Peter', chapter: 5, line: 'Cast all your anxiety on him' }
      ]
    },
    {
      id: 'who-jesus',
      title: 'Who is Jesus',
      description: 'Seven Gospel moments that introduce his heart, authority, and kindness.',
      passages: [
        { book: 'John', chapter: 1, line: 'The Word became flesh' },
        { book: 'Luke', chapter: 4, line: 'Jesus reads Isaiah in Nazareth' },
        { book: 'Matthew', chapter: 5, line: 'The Beatitudes' },
        { book: 'John', chapter: 4, line: 'Living water' },
        { book: 'Mark', chapter: 4, line: 'Peace in the storm' },
        { book: 'Luke', chapter: 15, line: 'The lost sheep' },
        { book: 'John', chapter: 11, line: 'I am the resurrection' }
      ]
    },
    {
      id: 'life-hard',
      title: 'When life is hard',
      description: 'Seven passages for heavy seasons — honest words and God’s presence.',
      passages: [
        { book: 'Psalms', chapter: 34, line: 'The Lord is close to the brokenhearted' },
        { book: 'Psalms', chapter: 42, line: 'Why, my soul, are you downcast?' },
        { book: 'Lamentations', chapter: 3, line: 'Great is your faithfulness' },
        { book: 'Romans', chapter: 8, line: 'In all things God works for good' },
        { book: '2 Corinthians', chapter: 1, line: 'The God of all comfort' },
        { book: 'Psalms', chapter: 73, line: 'Nevertheless I am always with you' },
        { book: 'Revelation', chapter: 21, line: 'He will wipe every tear' }
      ]
    }
  ];

  function bookMeta(name) {
    for (var i = 0; i < BOOKS.length; i++) {
      if (BOOKS[i].name.toLowerCase() === String(name).toLowerCase()) return BOOKS[i];
    }
    return null;
  }

  function api(path, body) {
    var b = bridge();
    var url = typeof b.apiUrl === 'function' ? b.apiUrl(path) : path;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body || {})
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error((data && data.error) || 'Request failed');
        return data;
      });
    });
  }

  function labelRow(label, text) {
    if (!String(text || '').trim()) return '';
    return (
      '<div class="study-fact-row">' +
      '<span class="study-fact-label">' +
      esc(label) +
      '</span>' +
      '<p class="study-fact-value">' +
      esc(text).replace(/\n/g, '<br>') +
      '</p></div>'
    );
  }

  /** Chapter breakdown: collapsible <details> (collapsed until opened). */
  function studyChapterFold(label, text) {
    if (!String(text || '').trim()) return '';
    return (
      '<details class="word-details study-chapter-fold">' +
      '<summary><span class="study-fact-label">' +
      esc(label) +
      '</span></summary>' +
      '<div class="word-details-body study-chapter-fold__body"><p class="study-fact-value">' +
      esc(text).replace(/\n/g, '<br>') +
      '</p></div></details>'
    );
  }

  /** Same as studyChapterFold but body is pre-built HTML; summary uses `summaryClass` (trusted). */
  function studyChapterFoldHtml(label, innerHtml, summaryClass) {
    if (!String(innerHtml || '').trim()) return '';
    var sc = summaryClass || 'study-fact-label';
    return (
      '<details class="word-details study-chapter-fold">' +
      '<summary><span class="' +
      sc +
      '">' +
      esc(label) +
      '</span></summary>' +
      '<div class="word-details-body study-chapter-fold__body">' +
      innerHtml +
      '</div></details>'
    );
  }

  function chip(t) {
    return '<span class="study-theme-chip">' + esc(t) + '</span>';
  }

  function btnPrimary(text, dataAttr, dataVal) {
    return (
      '<button type="button" class="word-pray-btn display-font study-app-btn" ' +
      (dataAttr ? 'data-act="' + esc(dataAttr) + '" data-arg="' + esc(dataVal || '') + '"' : '') +
      '>' +
      esc(text) +
      '</button>'
    );
  }

  function btnGhost(text, dataAttr, dataVal) {
    return (
      '<button type="button" class="word-continue-link study-app-link" ' +
      (dataAttr ? 'data-act="' + esc(dataAttr) + '" data-arg="' + esc(dataVal || '') + '"' : '') +
      '>' +
      esc(text) +
      '</button>'
    );
  }

  function card(inner, cls) {
    return '<div class="study-app-card' + (cls ? ' ' + cls : '') + '">' + inner + '</div>';
  }

  var CTX_LOCK_SVG =
    '<svg class="study-ctx-lock-ic" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5 8V6a5 5 0 0 1 10 0v2h.5A1.5 1.5 0 0 1 17 9.5v8A1.5 1.5 0 0 1 15.5 19h-11A1.5 1.5 0 0 1 3 17.5v-8A1.5 1.5 0 0 1 4.5 8H5zm2-2a3 3 0 0 1 6 0v2H7V6z"/></svg>';

  function ctxParagraph(text, placeholder) {
    var t = String(text || '').trim();
    if (!t) {
      return (
        '<p class="study-ctx-body study-ctx-body--muted">' +
        esc(placeholder || 'Still gathering this…') +
        '</p>'
      );
    }
    return '<p class="study-ctx-body">' + esc(t).replace(/\n/g, '<br>') + '</p>';
  }

  function ctxInsightCard(title, bodyHtml) {
    return (
      '<article class="study-ctx-card study-ctx-card--insight">' +
      '<p class="study-ctx-card-label">' +
      esc(title) +
      '</p>' +
      bodyHtml +
      '</article>'
    );
  }

  function ctxLockedPremiumCard(title) {
    return (
      '<article class="study-ctx-card study-ctx-card--locked">' +
      CTX_LOCK_SVG +
      '<p class="study-ctx-card-label">' +
      esc(title) +
      '</p>' +
      '<p class="study-ctx-lock-copy">Go deeper with Premium</p>' +
      '</article>'
    );
  }

  function chapterExcerpt(verses, maxLen) {
    var lim = maxLen || 420;
    var n = Math.min(verses.length, 5);
    var parts = [];
    for (var i = 0; i < n; i++) {
      parts.push(String(i + 1) + '. ' + String(verses[i] || '').trim());
    }
    var s = parts.join(' ');
    if (s.length > lim) s = s.slice(0, lim - 1) + '…';
    return s;
  }

  function chapterMeaningBody(d) {
    var bits = [d.theme, d.message, d.purpose].filter(function (x) {
      return String(x || '').trim();
    });
    return ctxParagraph(bits.join(' '), null);
  }

  function chapterContextBody(d, written) {
    var parts = [];
    if (written) parts.push(written);
    ;[d.setting, d.whereFits, d.anchor].forEach(function (x) {
      if (String(x || '').trim()) parts.push(String(x).trim());
    });
    return ctxParagraph(parts.join('\n\n'), null);
  }

  function chapterKeyWordsHtml(d) {
    var ow = [];
    if (d.keyVerse && String(d.keyVerse.text || '').trim()) {
      ow.push({
        term: String(d.keyVerse.reference || 'Key verse').trim() || 'Key verse',
        def: String(d.keyVerse.text || '').trim().slice(0, 240)
      });
    }
    var theme = String(d.theme || '').trim();
    if (theme) {
      theme.split(/[,;]|–|—/).forEach(function (chunk) {
        var t = chunk.replace(/^\s+|\s+$/g, '');
        if (t && ow.length < 5 && t.length < 90)
          ow.push({
            term: t,
            def: String(d.message || d.purpose || '').trim().slice(0, 220)
          });
      });
    }
    if (!ow.length) return ctxParagraph('', 'Key phrases will appear here as you study.');
    var rows = ow
      .map(function (row) {
        return (
          '<div class="study-ctx-kw-row">' +
          '<span class="study-ctx-kw-term">' +
          esc(row.term) +
          '</span>' +
          '<p class="study-ctx-kw-def">' +
          esc(row.def) +
          '</p></div>'
        );
      })
      .join('');
    return '<div class="study-ctx-kw-list">' + rows + '</div>';
  }

  function verseKeyWordsHtml(words) {
    if (!words || !words.length)
      return ctxParagraph(
        'Original-language highlights will appear here when available.',
        null
      );
    var rows = words
      .map(function (w) {
        return (
          '<div class="study-ctx-kw-row">' +
          '<span class="study-ctx-kw-term">' +
          esc(w.english) +
          ' · ' +
          esc(w.original) +
          '</span>' +
          '<p class="study-ctx-kw-def">' +
          esc(w.literal) +
          '</p></div>'
        );
      })
      .join('');
    return '<div class="study-ctx-kw-list">' + rows + '</div>';
  }

  function ctxPrayerVerse(d) {
    var m = String(d.meaning || d.anchor || '').trim();
    if (m.length > 160) m = m.slice(0, 157) + '…';
    if (!m) m = 'your Word in this moment.';
    return ctxParagraph(
      'God, thank you that your Word is true. Would you press ' +
        m +
        ' into my heart today? Give me courage to live it. Amen.',
      null
    );
  }

  function ctxPrayerChapter(d) {
    var r = String(d.reflection || d.message || '').trim();
    if (r.length > 240) r = r.slice(0, 237) + '…';
    if (!r) r = 'Meet me in this part of your story today.';
    return ctxParagraph(r + ' Amen.', null);
  }

  function renderStudyContextVerse(root, book, chapter, verseNum, ref, text, d) {
    root.classList.remove('study-app-root--mode-landing');
    root.classList.add('study-app-root--mode-context', 'study-app-root--study-ctx');
    var passage = esc(String(verseNum) + '. ' + String(text || '').trim()).replace(/\n/g, '<br>');
    var saveArg = book + '|' + chapter + '|verse|' + verseNum;
    root.innerHTML =
      '<div class="study-ctx-screen">' +
      '<div class="study-app-toolbar study-ctx-toolbar">' +
      btnGhost('← Back', 'ctx-back', '') +
      '</div>' +
      '<header class="study-ctx-header">' +
      '<p class="study-ctx-kicker">STUDY</p>' +
      '<h1 class="study-ctx-title display-font">' +
      esc(ref) +
      '</h1>' +
      '<p class="study-ctx-subtitle body-font">Go deeper into the meaning, context, and application.</p>' +
      '</header>' +
      '<section class="study-ctx-passage-card" aria-labelledby="studyCtxPassageLabel">' +
      '<p class="study-ctx-passage-label" id="studyCtxPassageLabel">SELECTED PASSAGE</p>' +
      '<div class="study-ctx-passage-text display-font">' +
      passage +
      '</div>' +
      '<div class="study-ctx-passage-actions">' +
      '<button type="button" class="study-ctx-pill study-ctx-pill--rose" data-act="reflect-v">Reflect on this →</button>' +
      '<button type="button" class="study-ctx-pill study-ctx-pill--neutral" data-act="save-insight" data-arg="' +
      esc(saveArg) +
      '">Save</button>' +
      '</div></section>' +
      '<div class="study-ctx-stack">' +
      ctxInsightCard('Meaning', ctxParagraph(d.meaning, null)) +
      ctxInsightCard('Context', ctxParagraph(d.anchor, null)) +
      ctxInsightCard('For You', ctxParagraph(d.reflection, null)) +
      ctxInsightCard('Key Words', verseKeyWordsHtml(d.originalWords)) +
      ctxInsightCard('Prayer From This Passage', ctxPrayerVerse(d)) +
      ctxLockedPremiumCard('Then vs. Now') +
      ctxLockedPremiumCard('Cross References') +
      ctxLockedPremiumCard('Original Hebrew/Greek Word Study') +
      '</div></div>';
  }

  function renderStudyContextChapter(root, book, chapter, d, verses) {
    root.classList.remove('study-app-root--mode-landing');
    root.classList.add('study-app-root--mode-context', 'study-app-root--study-ctx');
    var written = [d.writtenBy, d.date].filter(Boolean).join(' · ');
    var excerpt = chapterExcerpt(verses || [], 440);
    var saveArg = book + '|' + chapter + '|chapter';
    var title = book + ' ' + chapter;
    root.innerHTML =
      '<div class="study-ctx-screen">' +
      '<div class="study-app-toolbar study-ctx-toolbar">' +
      btnGhost('← Back', 'ctx-back', '') +
      '</div>' +
      '<header class="study-ctx-header">' +
      '<p class="study-ctx-kicker">STUDY</p>' +
      '<h1 class="study-ctx-title display-font">' +
      esc(title) +
      '</h1>' +
      '<p class="study-ctx-subtitle body-font">Go deeper into the meaning, context, and application.</p>' +
      '</header>' +
      '<section class="study-ctx-passage-card" aria-labelledby="studyCtxChPassageLabel">' +
      '<p class="study-ctx-passage-label" id="studyCtxChPassageLabel">SELECTED PASSAGE</p>' +
      '<div class="study-ctx-passage-text study-ctx-passage-text--chapter body-font">' +
      esc(excerpt).replace(/\n/g, '<br>') +
      '</div>' +
      '<div class="study-ctx-passage-actions">' +
      '<button type="button" class="study-ctx-pill study-ctx-pill--rose" data-act="reflect-ch" data-arg="' +
      esc(book + '|' + chapter) +
      '">Reflect on this →</button>' +
      '<button type="button" class="study-ctx-pill study-ctx-pill--neutral" data-act="save-insight" data-arg="' +
      esc(saveArg) +
      '">Save</button>' +
      '</div></section>' +
      '<div class="study-ctx-stack">' +
      ctxInsightCard('Meaning', chapterMeaningBody(d)) +
      ctxInsightCard('Context', chapterContextBody(d, written)) +
      ctxInsightCard('For You', ctxParagraph(d.reflection, null)) +
      ctxInsightCard('Key Words', chapterKeyWordsHtml(d)) +
      ctxInsightCard('Prayer From This Passage', ctxPrayerChapter(d)) +
      ctxLockedPremiumCard('Then vs. Now') +
      ctxLockedPremiumCard('Cross References') +
      ctxLockedPremiumCard('Original Hebrew/Greek Word Study') +
      '</div></div>';
  }

  function readLastStudyContext() {
    try {
      var raw = localStorage.getItem('lastStudyContext');
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !o.book || !o.chapter) return null;
      return { book: String(o.book), chapter: parseInt(o.chapter, 10) || 1 };
    } catch (e2) {
      return null;
    }
  }

  function landingWeeklySection() {
    var b = bridge();
    var info = typeof b.getWeeklyReading === 'function' ? b.getWeeklyReading() : null;
    if (!info || !info.book) return '';
    var refLine = info.book + ' ' + info.chapter;
    return (
      '<section class="study-landing-section" aria-labelledby="studyLandingWeekHeading">' +
      '<h2 class="study-app-section-title" id="studyLandingWeekHeading">This week</h2>' +
      card(
        '<p class="study-landing-week-theme display-font">' +
          esc(info.themeTitle || 'Weekly theme') +
          '</p>' +
          '<p class="study-landing-week-ref">' +
          esc(refLine) +
          '</p>' +
          '<p class="study-app-note">' +
          esc(info.note || '') +
          '</p>' +
          btnPrimary('Study this chapter', 'chapter', info.book + '|' + info.chapter),
        'study-app-card--theme'
      ) +
      '</section>'
    );
  }

  function landingPrimaryCards() {
    var ctx = readLastStudyContext();
    var card2 =
      ctx &&
      '<button type="button" class="study-landing-action-card study-landing-action-card--secondary" data-act="resume-scripture">' +
        '<span class="study-landing-action-title display-font">Continue from Scripture</span>' +
        '<span class="study-landing-action-sub body-font">Pick up where you were reading</span>' +
        '<span class="study-landing-action-meta">' +
        esc(ctx.book + ' ' + ctx.chapter) +
        '</span>' +
        '<span class="study-landing-action-cta">Resume →</span>' +
        '</button>';
    var solo = !ctx ? ' study-landing-actions--solo' : '';
    return (
      '<div class="study-landing-actions' +
      solo +
      '" role="group" aria-label="Study actions">' +
      '<button type="button" class="study-landing-action-card study-landing-passage-card" data-act="study-start-search">' +
      '<span class="study-landing-action-title display-font">Study any passage</span>' +
      '<span class="study-landing-action-sub body-font">Enter a verse, chapter, or topic to explore</span>' +
      '<span class="study-landing-passage-cta body-font">Start studying →</span>' +
      '</button>' +
      (card2 || '') +
      '</div>'
    );
  }

  function landingStudySearchPanel() {
    return (
      '<div class="study-landing-search-panel" id="studyLandingSearchPanel" hidden>' +
      '<label class="study-landing-search-label body-font" for="studyLandingSearchInput">Find a passage</label>' +
      '<input type="text" class="study-landing-search-input body-font" id="studyLandingSearchInput" ' +
      'placeholder="e.g. John 3:16, Psalm 23, Romans 8" enterkeyhint="go" autocomplete="off">' +
      '<div class="study-landing-search-actions">' +
      '<button type="button" class="word-pray-btn display-font study-app-btn study-landing-search-go" data-act="study-search-submit">Start studying →</button>' +
      '<button type="button" class="word-continue-link study-app-link" data-act="study-search-cancel">Cancel</button>' +
      '</div></div>'
    );
  }

  function hideStudySearchPanel(root) {
    var pan = root.querySelector('#studyLandingSearchPanel');
    if (pan) pan.hidden = true;
    var inp = root.querySelector('#studyLandingSearchInput');
    if (inp) inp.value = '';
  }

  function showStudySearchPanel(root) {
    var pan = root.querySelector('#studyLandingSearchPanel');
    if (!pan) return;
    pan.hidden = false;
    var inp = root.querySelector('#studyLandingSearchInput');
    if (inp) {
      setTimeout(function () {
        inp.focus();
      }, 60);
    }
  }

  function submitStudyLandingSearch(root) {
    var inp = root.querySelector('#studyLandingSearchInput');
    var q = inp ? String(inp.value || '').trim() : '';
    var brid = bridge();
    if (!q) {
      if (inp) inp.focus();
      return;
    }
    var res =
      typeof brid.resolveStudyLandingQuery === 'function' ? brid.resolveStudyLandingQuery(q) : null;
    if (!res) {
      if (typeof window.alert === 'function')
        window.alert('Try a reference like John 3:16 or a book and chapter, such as Psalm 23.');
      return;
    }
    hideStudySearchPanel(root);
    if (res.kind === 'keyword') {
      if (typeof brid.openScriptureBrowse === 'function') brid.openScriptureBrowse();
      else if (typeof brid.switchTab === 'function') brid.switchTab('word');
      return;
    }
    if (res.kind === 'chapter') {
      if (brid.openScriptureReader) brid.openScriptureReader(res.book, res.chapter);
      return;
    }
    if (res.kind === 'verse' && brid.loadChapterVerses) {
      brid
        .loadChapterVerses(res.book, res.chapter)
        .then(function (pack) {
          var verses = pack && pack.verses ? pack.verses : [];
          var vn = res.verse;
          var txt = verses[vn - 1] != null ? String(verses[vn - 1]) : '';
          var ref = (res.ref || res.book + ' ' + res.chapter + ':' + vn).trim();
          try {
            sessionStorage.setItem(
              'grounded_study_pending_verse',
              JSON.stringify({
                book: res.book,
                chapter: res.chapter,
                verse: vn,
                text: txt,
                ref: ref
              })
            );
            sessionStorage.setItem('grounded_study_handoff', 'scripture');
          } catch (e1) {}
          if (typeof brid.switchTab === 'function') brid.switchTab('study');
          if (global.GroundedStudyApp && typeof global.GroundedStudyApp.onTabShown === 'function')
            global.GroundedStudyApp.onTabShown();
        })
        .catch(function () {
          if (brid.openScriptureReader) brid.openScriptureReader(res.book, res.chapter);
        });
    }
  }

  function plansBlock() {
    var html = READING_PLANS.map(function (plan) {
      var day = getPlanDay(plan.id);
      var lines = plan.passages
        .map(function (p, i) {
          var status =
            i < day ? ' study-plan-day--done' : i === day ? ' study-plan-day--current' : ' study-plan-day--future';
          return (
            '<div class="study-plan-day' +
            status +
            '" data-act="plan-day" data-arg="' +
            esc(plan.id + '|' + i) +
            '">' +
            '<span class="study-plan-day-n">Day ' +
            (i + 1) +
            '</span>' +
            '<span class="study-plan-day-txt">' +
            esc(p.book + ' ' + p.chapter) +
            ' — ' +
            esc(p.line) +
            '</span></div>'
          );
        })
        .join('');
      return card(
        '<p class="study-app-card-title display-font">' +
          esc(plan.title) +
          '</p>' +
          '<p class="study-app-note">' +
          esc(plan.description) +
          '</p>' +
          '<div class="study-plan-block" data-plan-id="' +
          esc(plan.id) +
          '">' +
          '<div class="study-plan-days">' +
          lines +
          '</div>' +
          '<button type="button" class="study-plan-days-toggle body-font" data-act="plan-days-toggle" data-arg="' +
          esc(plan.id) +
          '" aria-expanded="false">Show all days</button>' +
          '</div>' +
          btnPrimary('Continue plan', 'plan-continue', plan.id),
        'study-app-card--plan'
      );
    }).join('');
    return (
      '<section class="study-landing-section study-landing-plans" aria-labelledby="studyLandingPlansHeading">' +
      '<h2 class="study-app-section-title" id="studyLandingPlansHeading">Reading plans</h2>' +
      '<div class="study-landing-plan-list">' +
      html +
      '</div></section>'
    );
  }

  function landingBrowseFooter() {
    return (
      '<footer class="study-landing-browse">' +
      '<p class="study-landing-browse-label body-font">Browse the whole Bible</p>' +
      '<div class="study-browse-grid">' +
      '<button type="button" class="study-browse-tile" data-act="list" data-arg="ot">Old Testament<span class="study-browse-meta">39 books</span></button>' +
      '<button type="button" class="study-browse-tile" data-act="list" data-arg="nt">New Testament<span class="study-browse-meta">27 books</span></button>' +
      '</div></footer>'
    );
  }

  /** Landing Mode — default when opening the Study tab (no Scripture handoff). */
  function renderLanding(root) {
    root.classList.remove('study-app-root--study-ctx');
    root.innerHTML =
      '<div class="study-landing">' +
      '<header class="study-landing-header study-landing-header--tagline-only">' +
      '<p class="study-landing-tagline body-font">Context, meaning, and space to understand.</p>' +
      '</header>' +
      landingPrimaryCards() +
      landingStudySearchPanel() +
      landingWeeklySection() +
      plansBlock() +
      landingBrowseFooter() +
      '</div>';
  }

  function renderBookList(root, testament) {
    root.classList.remove('study-app-root--study-ctx');
    var list = BOOKS.filter(function (b) {
      return b.testament === testament;
    });
    var title = testament === 'ot' ? 'Old Testament' : 'New Testament';
    var rows = list
      .map(function (b) {
        return (
          '<button type="button" class="study-book-row" data-act="book" data-arg="' +
          esc(b.name) +
          '">' +
          '<span class="study-book-row-name">' +
          esc(b.name) +
          '</span>' +
          '<span class="study-book-row-meta">' +
          b.chapters +
          ' ch</span></button>'
        );
      })
      .join('');
    root.innerHTML =
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'home', '') +
      '</div><h2 class="study-app-h2 display-font">' +
      esc(title) +
      '</h2><div class="study-book-list">' +
      rows +
      '</div>';
  }

  function renderBookOverview(root, book, data) {
    root.classList.remove('study-app-root--study-ctx');
    var m = bookMeta(book) || { name: book, chapters: 1, genre: '' };
    var themes = (data.themes || []).map(chip).join('');
    var jesus =
      data.pointsToJesus && String(data.pointsToJesus).trim()
        ? card(
            '<p class="study-app-eyebrow">Connections to Jesus</p>' +
              '<p class="study-fact-label">Points to Jesus</p>' +
              '<p class="study-fact-value">' +
              esc(data.pointsToJesus).replace(/\n/g, '<br>') +
              '</p>',
            'study-app-card--jesus'
          )
        : '';
    root.innerHTML =
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'list', state.list || 'ot') +
      '</div>' +
      '<p class="study-app-eyebrow">Book overview</p>' +
      '<h2 class="study-app-h1 display-font">' +
      esc(m.name) +
      '</h2>' +
      '<p class="study-app-note">' +
      m.chapters +
      ' chapters · ' +
      esc(m.genre) +
      '</p>' +
      card(
        labelRow('Written by', data.author) +
          labelRow('Audience', data.audience) +
          labelRow('Period', data.period) +
          labelRow('Purpose', data.purpose) +
          labelRow('Why read it', data.whyReadIt) +
          labelRow('Fits in the story', data.fitsInStory),
        'study-app-card--facts'
      ) +
      (themes ? '<div class="study-theme-chips">' + themes + '</div>' : '') +
      jesus +
      btnPrimary('Start reading ' + m.name, 'chapter', m.name + '|1');
  }

  function findPlanById(id) {
    for (var i = 0; i < READING_PLANS.length; i++) {
      if (READING_PLANS[i].id === id) return READING_PLANS[i];
    }
    return null;
  }

  function renderChapterLoading(root, book, chapter, chBack) {
    root.classList.remove('study-app-root--study-ctx');
    root.innerHTML =
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'ch-back', chBack || 'home') +
      '</div>' +
      '<p class="study-app-eyebrow">Chapter breakdown</p>' +
      '<h2 class="study-app-h2 display-font">' +
      esc(book + ' ' + chapter) +
      '</h2>' +
      '<p class="study-app-note">Gathering context…</p>';
  }

  function sermonMatch(book, chapter) {
    var raw = null;
    try {
      raw = localStorage.getItem('grounded_sermon_notes');
    } catch (e) {}
    if (!raw) return null;
    try {
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return null;
      var canon = (bridge().canonicalBook && bridge().canonicalBook(book)) || book;
      for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        if (!e) continue;
        var eb = String(e.book || e.bookName || '').trim();
        var ec = parseInt(e.chapter, 10);
        if (eb.toLowerCase() === String(canon).toLowerCase() && ec === chapter) return e;
      }
    } catch (e2) {}
    return null;
  }

  function renderVerse(root, book, chapter, verseNum, ref, text, d) {
    root.classList.remove('study-app-root--study-ctx');
    var ow = d.originalWords && d.originalWords.length ? d.originalWords : [];
    var chips = ow
      .map(function (w) {
        return (
          '<div class="study-ow-chip">' +
          '<span class="study-ow-main">' +
          esc(w.english) +
          ' · ' +
          esc(w.original) +
          '</span>' +
          '<span class="study-ow-lit">' +
          esc(w.literal) +
          '</span></div>'
        );
      })
      .join('');
    root.innerHTML =
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'back-verse', book + '|' + chapter) +
      '</div>' +
      '<p class="study-app-eyebrow">Verse study</p>' +
      '<p class="study-verse-quote display-font"><em>' +
      esc(text) +
      '</em></p>' +
      '<p class="study-key-ref">' +
      esc(ref) +
      '</p>' +
      btnGhost('Save insight', 'save-insight', book + '|' + chapter + '|verse|' + verseNum) +
      card(
        labelRow('Meaning', d.meaning || '') +
          labelRow('Context', d.anchor || '') +
          labelRow('For you', d.reflection || ''),
        'study-app-card--facts'
      ) +
      (chips
        ? '<div class="study-app-section"><p class="study-app-eyebrow">Original language</p><div class="study-ow-wrap">' +
          chips +
          '</div></div>'
        : '') +
      '<div class="study-verse-dual-pills">' +
      '<button type="button" class="cr-chapter-pill cr-chapter-pill--study" data-act="highlight-v" data-arg="">Highlight</button>' +
      '<button type="button" class="cr-chapter-pill cr-chapter-pill--reflect" data-act="reflect-v" data-arg="">Reflect on this →</button>' +
      '</div>' +
      '<div class="study-app-actions-row">' +
      btnPrimary('Pray with this', 'pray-v', '') +
      '</div>';
  }

  function renderJournalAll(root) {
    root.classList.remove('study-app-root--study-ctx');
    var entries = journalEntries();
    var rows = entries
      .map(function (e) {
        var ref = e.book + ' ' + e.chapter + (e.verse ? ':' + e.verse : '');
        return card(
          '<span class="study-journal-preview-ref">' +
            esc(ref) +
            '</span>' +
            '<p class="study-fact-value">' +
            esc(e.insight) +
            '</p><p class="study-app-note">' +
            esc(e.date || '') +
            ' · ' +
            esc(e.type || '') +
            '</p>'
        );
      })
      .join('');
    root.innerHTML =
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'home', '') +
      '</div><h2 class="study-app-h2 display-font">Study journal</h2>' +
      (rows || '<p class="study-app-note">No entries yet.</p>');
  }

  function wire(root) {
    root.onclick = function (ev) {
      var t = ev.target.closest('[data-act]');
      if (!t || !root.contains(t)) return;
      var act = t.getAttribute('data-act');
      var arg = t.getAttribute('data-arg') || '';
      if (act === 'home') {
        state = {
          view: 'home',
          book: '',
          chapter: 1,
          verse: null,
          planId: null,
          list: null,
          fromScripture: false
        };
        renderLanding(root);
        wire(root);
      } else if (act === 'study-start-search') {
        showStudySearchPanel(root);
      } else if (act === 'study-search-cancel') {
        hideStudySearchPanel(root);
      } else if (act === 'study-search-submit') {
        submitStudyLandingSearch(root);
      } else if (act === 'resume-scripture') {
        var rctx = readLastStudyContext();
        if (rctx && bridge().openScriptureReader) bridge().openScriptureReader(rctx.book, rctx.chapter);
      } else if (act === 'ctx-back') {
        if (state.fromScripture) {
          var swb = bridge().switchTab;
          if (typeof swb === 'function') swb('word');
        } else if (state.view === 'verse') {
          openChapter(root, state.book, state.chapter);
        } else if (state.view === 'chapter') {
          if (state.chapterBack === 'home') {
            state = {
              view: 'home',
              book: '',
              chapter: 1,
              verse: null,
              planId: null,
              list: null,
              fromScripture: false
            };
            renderLanding(root);
            wire(root);
          } else if (String(state.chapterBack || '').indexOf('book:') === 0) {
            openBookOverview(root, state.chapterBack.slice(5));
          } else if (String(state.chapterBack || '').indexOf('list:') === 0) {
            var ltb = state.chapterBack.slice(5);
            state = {
              view: 'list',
              list: ltb,
              book: '',
              chapter: 1,
              verse: null,
              planId: null,
              fromScripture: false
            };
            renderBookList(root, ltb);
            wire(root);
          }
        } else {
          state = {
            view: 'home',
            book: '',
            chapter: 1,
            verse: null,
            planId: null,
            list: null,
            fromScripture: false
          };
          renderLanding(root);
          wire(root);
        }
      } else if (act === 'list') {
        state = {
          view: 'list',
          list: arg,
          book: '',
          chapter: 1,
          verse: null,
          planId: null,
          fromScripture: false
        };
        renderBookList(root, arg);
        wire(root);
      } else if (act === 'book') {
        openBookOverview(root, arg);
      } else if (act === 'chapter') {
        var parts = arg.split('|');
        openChapter(root, parts[0], parseInt(parts[1], 10) || 1);
      } else if (act === 'weekly') {
        var b = bridge();
        var w = typeof b.getWeeklyReading === 'function' ? b.getWeeklyReading() : null;
        if (w && w.book) openChapter(root, w.book, w.chapter);
      } else if (act === 'plan-days-toggle') {
        var block = root.querySelector('.study-plan-block[data-plan-id="' + arg + '"]');
        if (!block) return;
        var expanded = block.classList.toggle('study-plan-block--expanded');
        var pbtn = block.querySelector('.study-plan-days-toggle');
        if (pbtn) {
          pbtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
          pbtn.textContent = expanded ? 'Show fewer days' : 'Show all days';
        }
      } else if (act === 'plan-day') {
        var pd = arg.split('|');
        var pid = pd[0];
        var dayIx = parseInt(pd[1], 10) || 0;
        var pl = findPlanById(pid);
        if (pl && pl.passages[dayIx]) {
          setPlanDay(pid, dayIx);
          openChapter(root, pl.passages[dayIx].book, pl.passages[dayIx].chapter);
        }
      } else if (act === 'plan-continue') {
        var planC = findPlanById(arg);
        if (!planC) return;
        var dayC = getPlanDay(planC.id);
        var psgC = planC.passages[dayC];
        if (psgC) openChapter(root, psgC.book, psgC.chapter);
      } else if (act === 'go-deeper-ch') {
        var gd = arg.split('|');
        openChapter(root, gd[0], parseInt(gd[1], 10) || 1);
      } else if (act === 'ch-back') {
        if (arg === 'home') {
          state = {
          view: 'home',
          book: '',
          chapter: 1,
          verse: null,
          planId: null,
          list: null,
          fromScripture: false
        };
          renderLanding(root);
          wire(root);
        } else if (arg.indexOf('book:') === 0) {
          openBookOverview(root, arg.slice(5));
        } else if (arg.indexOf('list:') === 0) {
          var lt = arg.slice(5);
          state = {
            view: 'list',
            list: lt,
            book: '',
            chapter: 1,
            verse: null,
            planId: null,
            fromScripture: false
          };
          renderBookList(root, lt);
          wire(root);
        }
      } else if (act === 'journal-all') {
        state.view = 'journal-all';
        renderJournalAll(root);
        wire(root);
      } else if (act === 'journal-open') {
        state.view = 'journal-all';
        renderJournalAll(root);
        wire(root);
      } else if (act === 'save-insight') {
        openSaveInsight(arg);
      } else if (act === 'reflect-ch') {
        var rc = arg.split('|');
        if (bridge().openReflectWithPassage) bridge().openReflectWithPassage(rc[0], parseInt(rc[1], 10));
      } else if (act === 'pray-ch') {
        var pc = arg.split('|');
        if (bridge().openPrayerWithPassage) bridge().openPrayerWithPassage(pc[0], parseInt(pc[1], 10));
      } else if (act === 'back-verse') {
        var bv = arg.split('|');
        openChapter(root, bv[0], parseInt(bv[1], 10) || 1);
      } else if (act === 'highlight-v') {
        if (bridge().highlightVerse && state.book && state.verse)
          bridge().highlightVerse(state.book, state.chapter, state.verse);
      } else if (act === 'reflect-v') {
        if (bridge().openReflectWithVerse && state.book && state.verse && state.verseText)
          bridge().openReflectWithVerse(state.book, state.chapter, state.verse, state.verseText);
      } else if (act === 'pray-v') {
        if (bridge().openPrayerWithVerse && state.book && state.verse && state.verseText)
          bridge().openPrayerWithVerse(state.book, state.chapter, state.verse, state.verseText);
      }
    };
    root.onkeydown = function (ev) {
      if (state.view !== 'home') return;
      if (ev.key !== 'Enter') return;
      var tg = ev.target;
      if (tg && tg.id === 'studyLandingSearchInput') {
        ev.preventDefault();
        submitStudyLandingSearch(root);
      }
    };
    syncStudyScreenChrome();
    if (state.view === 'home') {
      root.classList.add('study-app-root--mode-landing');
      root.classList.remove('study-app-root--mode-context');
      root.classList.remove('study-app-root--landing-enter');
      void root.offsetWidth;
      root.classList.add('study-app-root--landing-enter');
    } else {
      root.classList.remove('study-app-root--mode-landing');
      root.classList.add('study-app-root--mode-context');
      root.classList.remove('study-app-root--landing-enter');
    }
  }

  function openSaveInsight(encoded) {
    var parts = encoded.split('|');
    var book = parts[0];
    var chapter = parseInt(parts[1], 10) || 1;
    var typ = parts[2] === 'verse' ? 'verse' : 'chapter';
    var verse = typ === 'verse' ? parseInt(parts[3], 10) : null;
    var insight = window.prompt('What did you learn?');
    if (!insight || !String(insight).trim()) return;
    pushJournal({
      date: new Date().toLocaleString(),
      book: book,
      chapter: chapter,
      verse: verse,
      insight: String(insight).trim(),
      type: typ
    });
    var root = document.getElementById('studyAppRoot');
    if (!root) return;
    if (state.view === 'home') {
      renderLanding(root);
      wire(root);
    } else if (state.view === 'chapter' && state.chapterPayload) {
      if (state.fromScripture)
        renderStudyContextChapter(root, book, chapter, state.chapterPayload, state.chapterVerses || []);
      else
        renderChapterFull(root, book, chapter, state.chapterPayload, state.chapterVerses || []);
      wire(root);
    } else if (state.view === 'verse') {
      if (state.fromScripture)
        renderStudyContextVerse(
          root,
          book,
          chapter,
          verse != null ? verse : state.verse,
          state.verseRef,
          state.verseText,
          state.versePayload || {}
        );
      else
        renderVerse(
          root,
          book,
          chapter,
          verse != null ? verse : state.verse,
          state.verseRef,
          state.verseText,
          state.versePayload || {}
        );
      wire(root);
    }
  }

  function openBookOverview(root, book) {
    state = {
      view: 'book',
      book: book,
      chapter: 1,
      verse: null,
      planId: null,
      list: state.list,
      fromScripture: false
    };
    var cached = overviewCacheGet(book);
    if (cached) {
      renderBookOverview(root, book, cached);
      wire(root);
      return;
    }
    root.innerHTML =
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'list', state.list || 'ot') +
      '</div><p class="study-app-note">Loading overview…</p>';
    wire(root);
    var meta = bookMeta(book);
    var testament = meta && meta.testament === 'nt' ? 'nt' : 'ot';
    api('/api/book-overview', { book: book, testament: testament })
      .then(function (data) {
        overviewCacheSet(book, data);
        renderBookOverview(root, book, data);
        wire(root);
      })
      .catch(function () {
        root.innerHTML =
          '<div class="study-app-toolbar">' +
          btnGhost('← Back', 'list', state.list || 'ot') +
          '</div><p class="study-app-note">Could not load overview. Try again later.</p>';
        wire(root);
      });
  }

  function openChapter(root, book, chapter, options) {
    options = options || {};
    var fromScripture = !!options.fromScripture;
    if (!fromScripture) {
      try {
        sessionStorage.removeItem('grounded_study_handoff');
      } catch (eH) {}
    }
    var prevView = state.view;
    var prevList = state.list;
    var prevBook = state.book;
    var chBack = 'home';
    if (prevView === 'book' && prevBook === book) chBack = 'book:' + book;
    else if (prevView === 'list') chBack = 'list:' + (prevList || 'ot');
    state = {
      view: 'chapter',
      book: book,
      chapter: chapter,
      verse: null,
      planId: null,
      list: prevList,
      chapterBack: chBack,
      chapterPayload: null,
      chapterVerses: null,
      fromScripture: fromScripture
    };
    try {
      localStorage.setItem(
        'grounded_last_study_chapter',
        JSON.stringify({ book: book, chapter: chapter, ts: Date.now() })
      );
    } catch (e) {}
    if (fromScripture) {
      root.innerHTML =
        '<div class="study-ctx-screen study-ctx-screen--loading">' +
        '<div class="study-app-toolbar study-ctx-toolbar">' +
        btnGhost('← Back', 'ctx-back', '') +
        '</div>' +
        '<header class="study-ctx-header">' +
        '<p class="study-ctx-kicker">STUDY</p>' +
        '<h1 class="study-ctx-title display-font">' +
        esc(book + ' ' + chapter) +
        '</h1>' +
        '<p class="study-ctx-subtitle body-font">Go deeper into the meaning, context, and application.</p>' +
        '</header>' +
        '<p class="study-ctx-loading-note">Gathering insight for this chapter…</p>' +
        '</div>';
    } else {
      renderChapterLoading(root, book, chapter, chBack);
    }
    wire(root);
    var b = bridge();
    if (typeof b.loadChapterVerses !== 'function') {
      var noteEl = root.querySelector('.study-app-note') || root.querySelector('.study-ctx-loading-note');
      if (noteEl) noteEl.textContent = 'Reader unavailable.';
      return;
    }
    b
      .loadChapterVerses(book, chapter)
      .then(function (pack) {
        var verses = pack && pack.verses ? pack.verses : [];
        var versesText = verses.map(function (t, i) {
          return String(i + 1) + ' ' + String(t || '').trim();
        }).join('\n');
        return api('/api/chapter-explain-structured', {
          book: book,
          chapter: chapter,
          versesText: versesText
        }).then(function (data) {
          state.chapterPayload = data;
          state.chapterVerses = verses;
          if (fromScripture) {
            renderStudyContextChapter(root, book, chapter, data, verses);
            wire(root);
          } else renderChapterFull(root, book, chapter, data, verses);
        });
      })
      .catch(function () {
        root.innerHTML =
          '<div class="study-app-toolbar">' +
          btnGhost(
            '← Back',
            fromScripture ? 'ctx-back' : 'ch-back',
            fromScripture ? '' : chBack || 'home'
          ) +
          '</div><p class="study-app-note">Could not load this chapter. Try again.</p>';
        wire(root);
      });
  }

  function renderChapterFull(root, book, chapter, d, verses) {
    root.classList.remove('study-app-root--study-ctx');
    var written = [d.writtenBy, d.date].filter(Boolean).join(' · ');
    var keyInner =
      d.keyVerse && (d.keyVerse.text || d.keyVerse.reference)
        ? '<p class="study-key-verse display-font"><em>' +
          esc(d.keyVerse.text) +
          '</em></p><p class="study-key-ref">' +
          esc(d.keyVerse.reference) +
          '</p>'
        : '';
    var verseListInner = '';
    for (var i = 0; i < verses.length; i++) {
      var n = i + 1;
      verseListInner +=
        '<button type="button" class="study-inline-verse" data-act="v-open" data-arg="' +
        esc(book + '|' + chapter + '|' + n + '|' + encodeURIComponent(verses[i])) +
        '"><span class="study-inline-vn">' +
        n +
        '</span> ' +
        esc(String(verses[i] != null ? verses[i] : '')) +
        '</button>';
    }
    var verseBlock =
      '<div class="study-app-section">' +
      studyChapterFoldHtml(
        'Read verse by verse',
        '<div class="study-verse-inline-list">' + verseListInner + '</div>',
        'study-app-eyebrow study-chapter-fold__title'
      ) +
      '</div>';

    var people =
      d.people && d.people.length
        ? '<div class="study-app-section">' +
          studyChapterFoldHtml(
            'People in this passage',
            d.people
              .map(function (p) {
                return card(
                  '<p class="study-person-name">' +
                    esc(p.name) +
                    '</p><p class="study-app-note">' +
                    esc(p.who) +
                    '</p><p class="study-app-note">' +
                    esc(p.why) +
                    '</p>'
                );
              })
              .join(''),
            'study-app-eyebrow study-chapter-fold__title'
          ) +
          '</div>'
        : '';
    var difficult =
      d.difficultPassage && String(d.difficultPassage).trim()
        ? card(
            '<p class="study-app-eyebrow">Why is this here?</p><p class="study-fact-value">' +
              esc(d.difficultPassage).replace(/\n/g, '<br>') +
              '</p>',
            'study-app-card--difficult'
          )
        : '';
    var crosses =
      d.crossReferences && d.crossReferences.length
        ? '<div class="study-app-section"><p class="study-app-eyebrow">Connects to</p>' +
          d.crossReferences
            .map(function (c) {
              return card(
                '<p class="study-cr-ref">' +
                  esc(c.reference) +
                  '</p><p class="study-app-note">' +
                  esc(c.preview) +
                  '</p>'
              );
            })
            .join('') +
          '</div>'
        : '';
    var hq =
      d.honestQuestion && (d.honestQuestion.question || d.honestQuestion.answer)
        ? card(
            '<p class="study-app-eyebrow">An honest question</p><p class="study-fact-value"><strong>' +
              esc(d.honestQuestion.question) +
              '</strong></p><p class="study-fact-value">' +
              esc(d.honestQuestion.answer).replace(/\n/g, '<br>') +
              '</p>',
            'study-app-card--hq'
          )
        : '';
    var ser = sermonMatch(book, chapter);
    var serHtml = ser
      ? card(
          '<p class="study-app-note">Your church covered this — ' +
            esc(ser.date || ser.sermonDate || 'recently') +
            '</p>' +
            (ser.link || ser.url
              ? '<a class="word-continue-link" href="' +
                esc(ser.link || ser.url) +
                '">Open notes</a>'
              : ''),
          'study-app-card--sermon'
        )
      : '';

    root.innerHTML =
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'ch-back', state.chapterBack || 'home') +
      '</div>' +
      '<p class="study-app-eyebrow">Chapter breakdown</p>' +
      '<h2 class="study-app-h2 display-font">' +
      esc(book + ' ' + chapter) +
      '</h2>' +
      '<button type="button" class="word-continue-link study-app-link" data-act="save-insight" data-arg="' +
      esc(book + '|' + chapter + '|chapter') +
      '">Save insight</button>' +
      card(
        labelRow('Written by', written) +
          studyChapterFold('Setting', d.setting) +
          studyChapterFold('Theme', d.theme) +
          studyChapterFold('Purpose', d.purpose) +
          studyChapterFold('Message', d.message),
        'study-app-card--facts'
      ) +
      (keyInner ? card(keyInner, 'study-app-card--key') : '') +
      (d.then ? card('<p class="study-app-eyebrow">Then</p><p class="study-fact-value">' + esc(d.then).replace(/\n/g, '<br>') + '</p>') : '') +
      (d.now ? card('<p class="study-app-eyebrow">Now</p><p class="study-fact-value">' + esc(d.now).replace(/\n/g, '<br>') + '</p>') : '') +
      people +
      difficult +
      (d.whereFits && String(d.whereFits).trim()
        ? card(
            studyChapterFoldHtml(
              'Where this fits',
              '<p class="study-fact-value">' + esc(d.whereFits) + '</p>',
              'study-app-eyebrow study-chapter-fold__title'
            )
          )
        : '') +
      crosses +
      hq +
      serHtml +
      verseBlock +
      '<div class="cr-chapter-dual-actions study-chapter-dual">' +
      '<div class="cr-chapter-dual-col">' +
      '<button type="button" class="cr-chapter-pill cr-chapter-pill--study" data-act="go-deeper-ch" data-arg="' +
      esc(book + '|' + chapter) +
      '">Go deeper</button>' +
      '<span class="cr-chapter-pill-hint">Context, history, meaning</span>' +
      '</div>' +
      '<div class="cr-chapter-dual-col">' +
      '<button type="button" class="cr-chapter-pill cr-chapter-pill--reflect" data-act="reflect-ch" data-arg="' +
      esc(book + '|' + chapter) +
      '">Reflect on this chapter</button>' +
      '<span class="cr-chapter-pill-hint">Personal, journal, prayer</span>' +
      '</div>' +
      '</div>';

    wire(root);
    root.querySelectorAll('[data-act="v-open"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var a = btn.getAttribute('data-arg').split('|');
        var bk = a[0];
        var ch = parseInt(a[1], 10);
        var vn = parseInt(a[2], 10);
        var txt = decodeURIComponent(a.slice(3).join('|'));
        var ref = bk + ' ' + ch + ':' + vn;
        openVerse(root, bk, ch, vn, ref, txt, { fromScripture: !!state.fromScripture });
      });
    });
  }

  function openVerse(root, book, chapter, verseNum, ref, text, opts) {
    opts = opts || {};
    var fromScripture = !!opts.fromScripture;
    var keepList = state.list;
    state = {
      view: 'verse',
      book: book,
      chapter: chapter,
      verse: verseNum,
      planId: null,
      list: keepList,
      verseRef: ref,
      verseText: text,
      versePayload: null,
      fromScripture: fromScripture
    };
    if (fromScripture) {
      root.innerHTML =
        '<div class="study-ctx-screen study-ctx-screen--loading">' +
        '<div class="study-app-toolbar study-ctx-toolbar">' +
        btnGhost('← Back', 'ctx-back', '') +
        '</div>' +
        '<header class="study-ctx-header">' +
        '<p class="study-ctx-kicker">STUDY</p>' +
        '<h1 class="study-ctx-title display-font">' +
        esc(ref) +
        '</h1>' +
        '<p class="study-ctx-subtitle body-font">Go deeper into the meaning, context, and application.</p>' +
        '</header>' +
        '<p class="study-ctx-loading-note">Gathering insight for this verse…</p>' +
        '</div>';
    } else {
      root.innerHTML =
        '<div class="study-app-toolbar">' +
        btnGhost('← Back', 'back-verse', book + '|' + chapter) +
        '</div><p class="study-app-note">Opening verse…</p>';
    }
    wire(root);
    api('/api/verse-explain-structured', {
      verse: text,
      reference: ref,
      book: book,
      chapter: String(chapter),
      verseNumber: String(verseNum)
    })
      .then(function (data) {
        state.versePayload = data;
        if (fromScripture) renderStudyContextVerse(root, book, chapter, verseNum, ref, text, data);
        else renderVerse(root, book, chapter, verseNum, ref, text, data);
        wire(root);
      })
      .catch(function () {
        var empty = { meaning: '', anchor: '', reflection: '', originalWords: [] };
        state.versePayload = empty;
        if (fromScripture) renderStudyContextVerse(root, book, chapter, verseNum, ref, text, empty);
        else renderVerse(root, book, chapter, verseNum, ref, text, empty);
        wire(root);
      });
  }

  function onTabShown() {
    var root = document.getElementById('studyAppRoot');
    if (!root) return;
    try {
      var rawV = sessionStorage.getItem('grounded_study_pending_verse');
      if (rawV) {
        var fromVs = false;
        try {
          fromVs = sessionStorage.getItem('grounded_study_handoff') === 'scripture';
          sessionStorage.removeItem('grounded_study_handoff');
        } catch (eHm) {}
        sessionStorage.removeItem('grounded_study_pending_verse');
        var ov = JSON.parse(rawV);
        if (ov && ov.book && ov.verse != null) {
          var refV =
            ov.ref ||
            ov.book + ' ' + (parseInt(ov.chapter, 10) || 1) + ':' + parseInt(ov.verse, 10);
          var txtV = String(ov.text != null ? ov.text : '').trim();
          openVerse(
            root,
            ov.book,
            parseInt(ov.chapter, 10) || 1,
            parseInt(ov.verse, 10),
            refV,
            txtV,
            { fromScripture: fromVs }
          );
          return;
        }
      }
    } catch (eV) {}
    try {
      var raw = sessionStorage.getItem('grounded_study_pending_chapter');
      if (raw) {
        var fromCh = false;
        try {
          fromCh = sessionStorage.getItem('grounded_study_handoff') === 'scripture';
          sessionStorage.removeItem('grounded_study_handoff');
        } catch (eHm2) {}
        sessionStorage.removeItem('grounded_study_pending_chapter');
        var o = JSON.parse(raw);
        if (o && o.book) {
          openChapter(root, o.book, parseInt(o.chapter, 10) || 1, { fromScripture: fromCh });
          return;
        }
      }
    } catch (e) {}
    if (state.view === 'chapter' && state.book) {
      if (state.fromScripture) {
        if (state.chapterPayload && state.chapterVerses)
          renderStudyContextChapter(root, state.book, state.chapter, state.chapterPayload, state.chapterVerses);
        else openChapter(root, state.book, state.chapter, { fromScripture: true });
      } else {
        renderChapterLoading(root, state.book, state.chapter, state.chapterBack || 'home');
      }
      wire(root);
      return;
    }
    if (state.view === 'list') {
      renderBookList(root, state.list || 'ot');
      wire(root);
      return;
    }
    if (state.view === 'book' && state.book) {
      openBookOverview(root, state.book);
      return;
    }
    if (state.view === 'verse' && state.book && state.verse) {
      if (state.versePayload && state.verseRef && state.verseText != null) {
        if (state.fromScripture)
          renderStudyContextVerse(
            root,
            state.book,
            state.chapter,
            state.verse,
            state.verseRef,
            state.verseText,
            state.versePayload
          );
        else
          renderVerse(root, state.book, state.chapter, state.verse, state.verseRef, state.verseText, state.versePayload);
        wire(root);
      } else {
        openVerse(root, state.book, state.chapter, state.verse, state.verseRef, state.verseText, {
          fromScripture: !!state.fromScripture
        });
      }
      return;
    }
    if (state.view === 'journal-all') {
      renderJournalAll(root);
      wire(root);
      return;
    }
    renderLanding(root);
    wire(root);
  }

  function openChapterExternal(book, chapter) {
    try {
      sessionStorage.setItem(
        'grounded_study_pending_chapter',
        JSON.stringify({ book: book, chapter: chapter })
      );
      sessionStorage.setItem('grounded_study_handoff', 'scripture');
    } catch (e) {}
    var root = document.getElementById('studyAppRoot');
    if (root && document.getElementById('screen-study') && document.getElementById('screen-study').classList.contains('active')) {
      onTabShown();
    }
  }

  function openVerseExternal(book, chapter, verse, text, ref) {
    try {
      sessionStorage.setItem(
        'grounded_study_pending_verse',
        JSON.stringify({
          book: book,
          chapter: chapter,
          verse: verse,
          text: text,
          ref: ref || ''
        })
      );
      sessionStorage.setItem('grounded_study_handoff', 'scripture');
    } catch (e) {}
    var root = document.getElementById('studyAppRoot');
    if (root && document.getElementById('screen-study') && document.getElementById('screen-study').classList.contains('active')) {
      onTabShown();
    }
  }

  global.GroundedStudyApp = {
    onTabShown: onTabShown,
    openChapter: openChapterExternal,
    openVerse: openVerseExternal
  };
})(typeof window !== 'undefined' ? window : this);
