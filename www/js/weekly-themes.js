/**
 * Weekly theme sequences — every Daily Moment is day N of 7 under one theme.
 * resolveGroundedWeeklyMoment(now) picks the theme for the ISO-calendar week (Mon–Sun)
 * and the day index (Mon = 1 … Sun = 7).
 */
(function (global) {
  'use strict';

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function dateKeyLocal(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /** Monday 00:00 local for the week containing `d`. */
  function startOfMondayLocal(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = x.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  /** 1 = Monday … 7 = Sunday */
  function dayIndexMon1Sun7(d) {
    const day = d.getDay();
    return day === 0 ? 7 : day;
  }

  function hashString(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  var THEMES = [
    {
      id: 'letting-go-control',
      theme: 'Letting Go of Control',
      themeDescription: 'Trusting God when things feel uncertain',
      totalDays: 7,
      days: [
        {
          day: 1,
          title: "Recognizing what you're holding onto",
          pause: 'Notice what your mind keeps circling — without fixing it yet.',
          scripture: {
            reference: 'Psalm 46:10',
            text: 'Be still, and know that I am God.'
          },
          reflection: [
            'Control often shows up as replaying the same worry.',
            'Naming it kindly is the first step toward release.'
          ],
          prompt: 'What are you trying to hold together today?',
          prayer:
            'God, I admit how tight my grip has been. Help me see what I\u2019m carrying so I don\u2019t have to carry it alone. Meet me in the stillness and remind me that you are God. Amen.',
          carry: 'One honest breath of surrender is enough for today.'
        },
        {
          day: 2,
          title: "Trusting what you can't see",
          pause: 'Faith rarely comes with a map — only the next step.',
          scripture: {
            reference: 'Hebrews 11:1',
            text: 'Faith is confidence in what we hope for and assurance about what we do not see.'
          },
          reflection: [
            'Not seeing the outcome doesn\u2019t mean nothing is happening beneath the surface.',
            'You can take the next step without full clarity.'
          ],
          prompt: 'Where do you need courage to trust without proof?',
          prayer:
            'Lord, I can\u2019t see around the bend. Give me courage to trust you in the unseen places. Teach my heart that your presence is steady even when the path is not. Amen.',
          carry: 'Trust is built in small steps, not perfect certainty.'
        },
        {
          day: 3,
          title: 'Releasing the need to fix everything',
          pause: 'You were never meant to be the savior of every situation.',
          scripture: {
            reference: 'Matthew 11:28',
            text: 'Come to me, all you who are weary and burdened, and I will give you rest.'
          },
          reflection: [
            'Some burdens are invitations to hand over, not problems to solve.',
            'Rest begins when you stop pretending you can carry it all.'
          ],
          prompt: 'What would it feel like to release one thing you cannot fix?',
          prayer:
            'Jesus, I\u2019m tired from trying to hold everything upright. I bring you what I cannot fix and ask for rest that reaches deeper than relief. Carry what is yours to carry. Amen.',
          carry: 'Release is not failure — it is partnership with God.'
        },
        {
          day: 4,
          title: 'Finding peace in uncertainty',
          pause: 'Peace is not the absence of questions — it is presence with you in them.',
          scripture: {
            reference: 'Philippians 4:6-7',
            text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.'
          },
          reflection: [
            'Uncertainty can feel like a threat — or a doorway to prayer.',
            'God\u2019s peace guards what you cannot secure on your own.'
          ],
          prompt: 'What request do you want to place in God\u2019s hands today?',
          prayer:
            'God, I bring you what I cannot predict. I choose gratitude in the middle of the unknown. Guard my heart with your peace that doesn\u2019t depend on everything making sense. Amen.',
          carry: 'Peace is a guard around your heart — not a guarantee of answers.'
        },
        {
          day: 5,
          title: "Letting God carry what you can't",
          pause: 'There is weight only God was meant to hold.',
          scripture: {
            reference: '1 Peter 5:7',
            text: 'Cast all your anxiety on him because he cares for you.'
          },
          reflection: [
            'Casting is an active choice — again and again if needed.',
            'You are not weak for needing help; you are human.'
          ],
          prompt: 'What anxiety do you want to cast onto God right now?',
          prayer:
            'Father, you care for me more than I know how to care for myself. I cast what I cannot carry onto you — not as a formula, but as trust. Hold me while I let go. Amen.',
          carry: 'God cares for you — not only for your outcomes.'
        },
        {
          day: 6,
          title: 'Choosing surrender over stress',
          pause: 'Surrender is not giving up — it is choosing a gentler way forward.',
          scripture: {
            reference: 'Proverbs 3:5-6',
            text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.'
          },
          reflection: [
            'Stress often signals a fight for control.',
            'Submission is the path where wisdom meets peace.'
          ],
          prompt: 'Where could submission feel like relief instead of defeat?',
          prayer:
            'Lord, I want my ways submitted to you — not perfectly, but honestly. Straight paths don\u2019t always mean easy paths; give me wisdom to walk today with a quieter heart. Amen.',
          carry: 'Surrender clears space for God to lead.'
        },
        {
          day: 7,
          title: 'Resting in trust',
          pause: 'The week ends not with answers — with a deeper seat at the table.',
          scripture: {
            reference: 'Isaiah 26:3',
            text: 'You will keep in perfect peace those whose minds are steadfast, because they trust in you.'
          },
          reflection: [
            'Steadfast trust is practiced in small returns — day after day.',
            'Rest is trust repeated until it becomes home.'
          ],
          prompt: 'What truth about God do you want to anchor in this week?',
          prayer:
            'God, thank you for walking this week with me. Keep my mind steadied on you. Let trust be more than an idea — let it be rest I can return to. Amen.',
          carry: 'You can begin again tomorrow — trust doesn\u2019t expire.'
        }
      ]
    },
    {
      id: 'finding-rest',
      theme: 'Finding Rest',
      themeDescription: 'Learning to receive God\u2019s pace in a hurried world',
      totalDays: 7,
      days: [
        {
          day: 1,
          title: 'Noticing your pace',
          pause: 'Slow enough to feel your breath — that is the invitation.',
          scripture: { reference: 'Mark 6:31', text: 'Come with me by yourselves to a quiet place and get some rest.' },
          reflection: ['Hurry often hides hunger for presence.', 'Rest starts with honest noticing.'],
          prompt: 'What pace have you been running on lately?',
          prayer:
            'Jesus, invite me to the quiet place. Help me notice the speed I\u2019ve been keeping and choose a gentler rhythm with you. Amen.',
          carry: 'Noticing is the doorway to rest.'
        },
        {
          day: 2,
          title: 'Permission to pause',
          pause: 'Pause is not wasted time — it is sacred space.',
          scripture: { reference: 'Psalm 23:2-3', text: 'He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.' },
          reflection: ['Sometimes God leads you to lie down before you feel “finished.”', 'Refreshment follows permission.'],
          prompt: 'Where do you need permission to pause without guilt?',
          prayer:
            'Good Shepherd, lead me beside quiet waters. Refresh my soul where I have been running on empty. Amen.',
          carry: 'You are allowed to pause.'
        },
        {
          day: 3,
          title: 'Releasing the hurry',
          pause: 'Hurry is often fear wearing a productive mask.',
          scripture: { reference: 'Matthew 6:34', text: 'Therefore do not worry about tomorrow, for tomorrow will worry about itself.' },
          reflection: ['Each day has enough — and enough grace.', 'Tomorrow is not yours to carry today.'],
          prompt: 'What tomorrow are you trying to solve today?',
          prayer:
            'Lord, I release tomorrow back to you. Give me grace for today only — and trust that tomorrow will meet me with mercy. Amen.',
          carry: 'Today is the only day you are asked to live.'
        },
        {
          day: 4,
          title: 'Listening in the quiet',
          pause: 'God often speaks in a voice quiet enough to require leaning in.',
          scripture: { reference: '1 Kings 19:12', text: 'After the fire came a gentle whisper.' },
          reflection: ['Noise competes for your attention; whisper invites it.', 'Lean in — you will not be interrupted by God.'],
          prompt: 'What quiet would help you listen today?',
          prayer:
            'God, quiet the noise inside me. Teach me to recognize your gentle whisper and to treasure it above the rush. Amen.',
          carry: 'Listening is love with attention.'
        },
        {
          day: 5,
          title: 'Body and soul together',
          pause: 'You are not a machine — you are embodied and beloved.',
          scripture: { reference: 'Psalm 127:2', text: 'In vain you rise early and stay up late, toiling for food to eat — for he grants sleep to those he loves.' },
          reflection: ['Sleep is not a reward for productivity; it is a gift.', 'God loves you when you are still.'],
          prompt: 'What would honoring your body look like tonight?',
          prayer:
            'Father, thank you for loving me when I stop producing. Help me receive sleep and stillness as gifts, not guilt. Amen.',
          carry: 'Rest is not earned — it is given.'
        },
        {
          day: 6,
          title: 'Sabbath heart',
          pause: 'A sabbath heart stops striving — even in the middle of a busy week.',
          scripture: { reference: 'Hebrews 4:9-10', text: 'There remains, then, a Sabbath-rest for the people of God; for anyone who enters God\u2019s rest also rests from their works, just as God did from his.' },
          reflection: ['Rest mirrors trust: God holds what you set down.', 'You can rest from works without resting from love.'],
          prompt: 'What work do you want to rest from emotionally today?',
          prayer:
            'Lord, I want the Sabbath-rest you promise. Help me rest from striving and trust that you complete what I cannot. Amen.',
          carry: 'Trust looks like closing the laptop of the soul.'
        },
        {
          day: 7,
          title: 'Carrying rest forward',
          pause: 'What you practiced this week can become a rhythm.',
          scripture: { reference: 'Matthew 11:29', text: 'Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.' },
          reflection: ['Jesus\u2019 yoke is shared — not solo strength.', 'Gentleness is a place your soul can live.'],
          prompt: 'What one rhythm of rest do you want to keep next week?',
          prayer:
            'Jesus, thank you for rest that reaches my soul. Help me keep what you\u2019ve started this week — gentle steps with you. Amen.',
          carry: 'Rest can travel with you into the next week.'
        }
      ]
    }
  ];

  function resolveGroundedWeeklyMoment(now) {
    var d = now ? new Date(now) : new Date();
    if (!THEMES.length) return null;
    var mon = startOfMondayLocal(d);
    var weekKey = dateKeyLocal(mon);
    var dayIndex = dayIndexMon1Sun7(d);
    var themeIdx = hashString(weekKey) % THEMES.length;
    var themeWeek = THEMES[themeIdx];
    var dayObj = null;
    for (var i = 0; i < themeWeek.days.length; i++) {
      if (themeWeek.days[i].day === dayIndex) {
        dayObj = themeWeek.days[i];
        break;
      }
    }
    if (!dayObj) dayObj = themeWeek.days[0];
    return {
      weekKey: weekKey,
      dayIndex: dayIndex,
      theme: themeWeek.theme,
      themeDescription: themeWeek.themeDescription,
      themeId: themeWeek.id,
      totalDays: themeWeek.totalDays || 7,
      day: dayObj
    };
  }

  /** Week 1 begins Jan 1 (local); clamp to 1–52 for WEEKLY_THEMES index. */
  function momentFlowYearWeekIndexFromJan1(d) {
    var y = d.getFullYear();
    var start = new Date(y, 0, 1);
    var cur = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var day0 = Math.floor((cur - start) / 86400000);
    var wk = Math.floor(day0 / 7) + 1;
    if (wk < 1) wk = 1;
    if (wk > 52) wk = 52;
    return wk;
  }

  function collectVersesFromLegacyThemes() {
    var out = [];
    for (var t = 0; t < THEMES.length; t++) {
      var days = THEMES[t].days || [];
      for (var i = 0; i < days.length; i++) {
        var sc = days[i].scripture;
        if (sc && sc.reference && sc.text) {
          out.push({ reference: String(sc.reference).trim(), text: String(sc.text).trim() });
        }
      }
    }
    return out;
  }

  function buildMomentFlowWeeklyThemes52() {
    var verses = collectVersesFromLegacyThemes();
    if (!verses.length) {
      verses = [{ reference: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' }];
    }
    var WFM_FOCUS = ['Stillness', 'Trust', 'Release', 'Return', 'Listen'];
    var WFM_PROMPTS = [
      'What is one thing you want to bring to God today?',
      'Where do you notice God meeting you in the ordinary?',
      'What would it look like to receive today without rushing?',
      'What truth do you need to anchor in this week?',
      'What would gentleness look like toward yourself right now?',
      'Where are you invited to trust one step further?',
      'What are you grateful for that you almost overlooked?',
      'What do you want God to know about your heart today?',
      'Where could you make a little room for peace?',
      'What would honesty with God sound like in a single sentence?',
      'What helps you remember you are not alone?',
      'What small act of love could you say yes to today?'
    ];
    var SUBS = [
      'Learning to receive God\u2019s pace in a hurried world',
      'Trusting God when things feel uncertain',
      'Walking with Jesus through ordinary days',
      'Letting scripture shape your inner conversation',
      'Making space for God\u2019s voice in the noise',
      'Choosing presence over pressure',
      'Finding steadiness when life feels uneven',
      'Practicing gratitude without pretending everything is easy'
    ];
    var A = [
      'Quiet',
      'Gentle',
      'Sacred',
      'Simple',
      'Deep',
      'Steady',
      'Holy',
      'Humble',
      'Bold',
      'Calm',
      'Honest',
      'Open',
      'Whole',
      'True',
      'Bright',
      'Still',
      'Patient',
      'Faithful',
      'Mercy',
      'Renewed',
      'Rooted',
      'Lifted',
      'Led',
      'Held',
      'Known',
      'Loved',
      'Blessed',
      'Chosen',
      'Filled',
      'Stilled',
      'Welcoming',
      'Tender',
      'Strong',
      'Safe',
      'Free',
      'Clear',
      'Warm',
      'Soft',
      'Rich',
      'Sweet',
      'Wild',
      'Awakened',
      'Refreshed',
      'Sustained',
      'Sheltered',
      'Treasured',
      'Gathered',
      'Nourished',
      'Renewed',
      'Called',
      'Sent',
      'Prepared',
      'Welcomed'
    ];
    var B = [
      'Trust',
      'Rest',
      'Hope',
      'Peace',
      'Prayer',
      'Grace',
      'Faith',
      'Love',
      'Joy',
      'Light',
      'Return',
      'Release',
      'Surrender',
      'Courage',
      'Presence',
      'Rhythm',
      'Refuge',
      'Shelter',
      'Strength',
      'Silence',
      'Song',
      'Shepherd',
      'Shield',
      'Step',
      'Story',
      'Way',
      'Word',
      'Witness',
      'Work',
      'Welcome',
      'Wonder',
      'Bread',
      'Breath',
      'Blessing',
      'Bend',
      'River',
      'Rain',
      'Root',
      'Rock',
      'Room',
      'Rise',
      'Reach',
      'Rely',
      'Reveal',
      'Receive',
      'Renew',
      'Rest',
      'Path',
      'Promise',
      'Praise',
      'Purpose',
      'Patience',
      'Mercy'
    ];
    var themes = [];
    for (var w = 0; w < 52; w++) {
      var days = [];
      for (var di = 0; di < 5; di++) {
        var v = verses[(w * 5 + di) % verses.length];
        days.push({
          focus: WFM_FOCUS[di % WFM_FOCUS.length],
          verse: { text: v.text, reference: v.reference },
          prompt: WFM_PROMPTS[(w * 2 + di) % WFM_PROMPTS.length]
        });
      }
      themes.push({
        title: A[w % A.length] + ' ' + B[(w * 3) % B.length],
        subtitle: SUBS[w % SUBS.length],
        hook: 'This week is a gentle invitation to stay present with God in small, honest moments.',
        intro:
          'This week is a gentle invitation to stay present with God in small, honest moments. You do not have to perform or rush; inner work here is about noticing what is true and letting God meet you in it.',
        anchorVerse: { text: v.text, reference: v.reference },
        closingPrayer:
          'God, thank you for the quiet ways you have walked with us this week. Hold what mattered, soften what was hard, and lead us gently forward. Amen.',
        themeCompleteLine: 'What you practiced in quiet this week was never wasted.',
        days: days
      });
    }
    return themes;
  }

  /** Pad curated home themes (48) to 52 slots so ISO week-of-year 1–52 always resolves. */
  function ensureMomentFlowThemes52(homeArr) {
    if (!homeArr || !homeArr.length) return null;
    var out = homeArr.slice();
    var n = out.length;
    var i = 0;
    while (out.length < 52) {
      out.push(homeArr[i % n]);
      i++;
    }
    return out;
  }

  var WEEKLY_THEMES =
    typeof global.GROUNDED_HOME_WEEKLY_THEMES_52 !== 'undefined' &&
    global.GROUNDED_HOME_WEEKLY_THEMES_52 &&
    global.GROUNDED_HOME_WEEKLY_THEMES_52.length
      ? ensureMomentFlowThemes52(global.GROUNDED_HOME_WEEKLY_THEMES_52)
      : buildMomentFlowWeeklyThemes52();

  /** Curated home themes ship without `intro` / `verseContext`; enrich so moment flow can use them. */
  (function enrichHomeWeeklyThemesForMomentFlow() {
    if (!WEEKLY_THEMES || !WEEKLY_THEMES.length) return;
    for (var ti = 0; ti < WEEKLY_THEMES.length; ti++) {
      var theme = WEEKLY_THEMES[ti];
      if (!theme) continue;
      if (!theme.intro && theme.subtitle) {
        theme.intro =
          String(theme.subtitle).trim() +
          ' This week is a gentle orientation to stay present with God—no performance, no rush.';
      }
      var days = theme.days;
      if (!days || !days.length) continue;
      for (var di = 0; di < days.length; di++) {
        var day = days[di];
        if (!day || day.verseContext) continue;
        var foc = day.focus != null ? String(day.focus).trim() : '';
        var ref =
          day.verse &&
          ((day.verse.reference != null && String(day.verse.reference).trim()) ||
            (day.verse.ref != null && String(day.verse.ref).trim()) ||
            '');
        if (theme.title === 'Anxiety and Peace' && foc === 'Peace' && ref.indexOf('4:7') !== -1) {
          day.verseContext =
            "Paul wrote this from prison — his peace wasn't about his circumstances. It was about what he trusted.";
          continue;
        }
        var rot = di % 3;
        if (rot === 0) {
          day.verseContext =
            'For "' +
            (theme.title || 'this week') +
            '"—especially ' +
            (foc || 'today') +
            (ref ? '—this passage (' + ref + ') names something God wants you to hear in the middle of real life.' : '—these words meet you in the middle of real life.');
        } else if (rot === 1) {
          day.verseContext =
            (ref ? 'These lines (' + ref + ') ' : 'This scripture ') +
            'belongs to the week’s theme of ' +
            (theme.title || 'walking with God') +
            ' and to today’s focus on ' +
            (foc || 'your heart') +
            '. Let them be a companion, not a quiz.';
        } else {
          day.verseContext =
            'Today’s invitation—' +
            (foc || 'presence') +
            (ref
              ? '—finds a home in ' + ref + ', because God speaks into ordinary days, not only ideal ones.'
              : '—finds a home in this week’s arc with God.');
        }
      }
    }
  })();

  var GROUNDED_THEME_OVERRIDE_KEY = 'grounded_theme_override';

  /** @returns {number|null} theme index in WEEKLY_THEMES, or null */
  function readGroundedThemeOverride(d) {
    try {
      if (!global.localStorage) return null;
      var raw = global.localStorage.getItem(GROUNDED_THEME_OVERRIDE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || typeof o.themeIndex !== 'number') return null;
      if (o.themeIndex < 0 || o.themeIndex >= WEEKLY_THEMES.length) return null;
      if (typeof o.untilEpoch === 'number') {
        if (Date.now() > o.untilEpoch) {
          try {
            global.localStorage.removeItem(GROUNDED_THEME_OVERRIDE_KEY);
          } catch (e2) {}
          return null;
        }
        return o.themeIndex;
      }
      var wk = momentFlowYearWeekIndexFromJan1(d || new Date());
      if (typeof o.week !== 'number') return null;
      if (o.week !== wk) {
        try {
          global.localStorage.removeItem(GROUNDED_THEME_OVERRIDE_KEY);
        } catch (e3) {}
        return null;
      }
      return o.themeIndex;
    } catch (e) {
      return null;
    }
  }

  /** First-week personalization: pinned theme index for ~7 days (untilEpoch ms). */
  function writeGroundedThemeOverride(themeIndex, days) {
    try {
      if (!global.localStorage) return;
      var ix = typeof themeIndex === 'number' ? themeIndex : parseInt(themeIndex, 10);
      if (isNaN(ix) || ix < 0 || ix >= WEEKLY_THEMES.length) return;
      var d = typeof days === 'number' && days > 0 ? days : 7;
      var until = Date.now() + d * 86400000;
      global.localStorage.setItem(
        GROUNDED_THEME_OVERRIDE_KEY,
        JSON.stringify({ themeIndex: ix, untilEpoch: until })
      );
    } catch (e) {}
  }

  /** Mon=1 … Fri=5 for content; Sat/Sun use Friday (5). */
  function getMomentFlowWeeklyContext(now) {
    var d = now ? new Date(now) : new Date();
    if (!WEEKLY_THEMES || WEEKLY_THEMES.length < 52) return null;
    var weekNum = momentFlowYearWeekIndexFromJan1(d);
    var dow = d.getDay();
    var isWeekend = dow === 0 || dow === 6;
    var contentDayIndex = isWeekend ? 5 : dow;
    var displayDayIndex = isWeekend ? 5 : dow;
    var overrideIdx = readGroundedThemeOverride(d);
    var themeSlot = overrideIdx != null ? overrideIdx : weekNum - 1;
    var theme = WEEKLY_THEMES[themeSlot];
    if (!theme || !theme.days || theme.days.length < 5) return null;
    var dayObj = theme.days[contentDayIndex - 1];
    if (!dayObj) return null;
    return {
      weekNum: weekNum,
      themeTitle: theme.title,
      subtitle: theme.subtitle,
      dayIndex: displayDayIndex,
      isWeekend: isWeekend,
      day: dayObj
    };
  }

  global.GROUNDED_WEEKLY_THEMES = THEMES;
  global.resolveGroundedWeeklyMoment = resolveGroundedWeeklyMoment;
  global.WEEKLY_THEMES = WEEKLY_THEMES;
  global.getMomentFlowWeeklyContext = getMomentFlowWeeklyContext;
  global.momentFlowYearWeekIndexFromJan1 = momentFlowYearWeekIndexFromJan1;
  global.readGroundedThemeOverride = readGroundedThemeOverride;
  global.writeGroundedThemeOverride = writeGroundedThemeOverride;
})(typeof window !== 'undefined' ? window : this);
