/**
 * Study tab: Landing Mode (default entry) vs Context Mode (verse/chapter from Scripture).
 * Expects window.GroundedStudyBridge (assigned from index.html before first render).
 */
(function (global) {
  'use strict';

  var BOOKS = global.STUDY_BIBLE_BOOKS || [];
  var JOURNAL_KEY = 'grounded_study_journal';
  var PLANS_KEY = 'grounded_study_plan_progress_v1';
  var ACTIVE_PLAN_KEY = 'grounded_study_active_plan_id_v1';
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
    var landing = state.view === 'home' || state.view === 'plans-all';
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
    var pl = findPlanById(planId);
    var maxIx = pl && pl.passages && pl.passages.length ? pl.passages.length - 1 : 6;
    var o = planProgress();
    var prev = o[planId] && typeof o[planId] === 'object' ? o[planId] : {};
    var ct = typeof prev.completedThrough === 'number' ? prev.completedThrough : -1;
    o[planId] = { day: Math.max(0, Math.min(maxIx, day | 0)), completedThrough: ct };
    writeJson(PLANS_KEY, o);
  }

  function getPlanDay(planId) {
    var o = planProgress();
    var p = o[planId];
    return p && typeof p.day === 'number' ? p.day : 0;
  }

  function getPlanCompletedThrough(planId) {
    var o = planProgress();
    var p = o[planId];
    return p && typeof p.completedThrough === 'number' ? p.completedThrough : -1;
  }

  function markPlanDayCompleted(planId, dayIx) {
    var o = planProgress();
    var prev = o[planId] && typeof o[planId] === 'object' ? o[planId] : {};
    var d = typeof prev.day === 'number' ? prev.day : getPlanDay(planId);
    var ct = typeof prev.completedThrough === 'number' ? prev.completedThrough : -1;
    o[planId] = { day: d, completedThrough: Math.max(ct, dayIx | 0) };
    writeJson(PLANS_KEY, o);
  }

  function getActivePlanId() {
    var id = readJson(ACTIVE_PLAN_KEY, null);
    if (id && findPlanById(id)) return String(id);
    return null;
  }

  function setActivePlanId(planId) {
    writeJson(ACTIVE_PLAN_KEY, String(planId));
  }

  function findLandingActivePlan() {
    var byId = getActivePlanId();
    if (byId) return findPlanById(byId);
    var o = planProgress();
    for (var i = 0; i < READING_PLANS.length; i++) {
      if (o[READING_PLANS[i].id] != null) return READING_PLANS[i];
    }
    return null;
  }

  function planTagline(plan) {
    if (plan.tagline && String(plan.tagline).trim()) return String(plan.tagline).trim();
    var d = String(plan.description || '').trim();
    var ix = d.indexOf('.');
    return ix >= 0 ? d.slice(0, ix + 1) : d;
  }

  function planDaysRowsHtml(plan, stepBack) {
    var day = getPlanDay(plan.id);
    var doneThrough = getPlanCompletedThrough(plan.id);
    var backSeg = stepBack ? '|' + stepBack : '';
    var totalDays = plan.passages.length;
    return plan.passages
      .map(function (p, i) {
        var status =
          i === day ? ' study-plan-day--current' : i <= doneThrough ? ' study-plan-day--done' : ' study-plan-day--future';
        return (
          '<div class="study-plan-day' +
          status +
          '" data-act="plan-day" data-arg="' +
          esc(plan.id + '|' + i + backSeg) +
          '">' +
          '<span class="study-plan-day-n">Day ' +
          (i + 1) +
          ' of ' +
          totalDays +
          '</span>' +
          '<span class="study-plan-day-txt">' +
          esc(p.book + ' ' + p.chapter) +
          ' — ' +
          esc(p.line) +
          '</span></div>'
        );
      })
      .join('');
  }

  function planDetailCardAll(plan) {
    var lines = planDaysRowsHtml(plan, 'plans-all');
    return card(
      '<p class="study-app-card-title display-font">' +
        esc(plan.title) +
        '</p>' +
        '<p class="study-app-note">' +
        esc(plan.description) +
        '</p>' +
        '<p class="study-plan-pace-note body-font">One day at a time is enough.</p>' +
        '<div class="study-plan-block" data-plan-id="' +
        esc(plan.id) +
        '">' +
        '<div class="study-plan-days">' +
        lines +
        '</div>' +
        '<button type="button" class="study-plan-days-toggle body-font" data-act="plan-days-toggle" data-arg="' +
        esc(plan.id) +
        '" aria-expanded="false">View full journey →</button>' +
        '</div>' +
        btnPrimary('Continue plan', 'plan-continue', plan.id, 'data-plan-step-back="plans-all"'),
      'study-app-card--plan'
    );
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
        { book: 'Philippians', chapter: 4, line: 'Prayer instead of panic', verse: 6 },
        { book: 'Psalms', chapter: 23, line: 'The Lord as shepherd', verse: 1 },
        { book: 'Matthew', chapter: 6, line: 'Do not worry about tomorrow', verse: 34 },
        { book: 'Isaiah', chapter: 41, line: 'Fear not, for I am with you', verse: 10 },
        { book: 'Psalms', chapter: 46, line: 'Be still and know', verse: 10 },
        { book: 'John', chapter: 14, line: 'Peace I leave with you', verse: 27 },
        { book: '1 Peter', chapter: 5, line: 'Cast all your anxiety on him', verse: 7 }
      ]
    },
    {
      id: 'who-jesus',
      title: 'Who is Jesus',
      description: 'Seven Gospel moments that introduce his heart, authority, and kindness.',
      passages: [
        { book: 'John', chapter: 1, line: 'The Word became flesh', verse: 14 },
        { book: 'Luke', chapter: 4, line: 'Jesus reads Isaiah in Nazareth', verse: 18 },
        { book: 'Matthew', chapter: 5, line: 'The Beatitudes', verse: 3 },
        { book: 'John', chapter: 4, line: 'Living water', verse: 14 },
        { book: 'Mark', chapter: 4, line: 'Peace in the storm', verse: 39 },
        { book: 'Luke', chapter: 15, line: 'The lost sheep', verse: 6 },
        { book: 'John', chapter: 11, line: 'I am the resurrection', verse: 25 }
      ]
    },
    {
      id: 'life-hard',
      title: 'When life feels heavy',
      description: 'Seven passages for heavy seasons — honest words and God’s presence.',
      passages: [
        { book: 'Psalms', chapter: 34, line: 'The Lord is close to the brokenhearted', verse: 18 },
        { book: 'Psalms', chapter: 42, line: 'Why, my soul, are you downcast?', verse: 5 },
        { book: 'Lamentations', chapter: 3, line: 'Great is your faithfulness', verse: 23 },
        { book: 'Romans', chapter: 8, line: 'In all things God works for good', verse: 28 },
        { book: '2 Corinthians', chapter: 1, line: 'The God of all comfort', verse: 3 },
        { book: 'Psalms', chapter: 73, line: 'Nevertheless I am always with you', verse: 26 },
        { book: 'Revelation', chapter: 21, line: 'He will wipe every tear', verse: 4 }
      ]
    }
  ];

  /** Per-day copy: arrive, meaning, insight, application, reflectQ, close, optional prayer (Respond). Reflect step falls back to passage.reflection if meaning missing. */
  var PLAN_DAY_ENRICH = {
    'anxiety-peace': [
      {
        arrive: 'Worry is loud. Before you read, let your body unclench for one honest breath.',
        meaning:
          'Paul is not telling you to pretend you are fine. He is rerouting anxiety from solo spinning into shared conversation with God—requests voiced, thanks mixed in, so your mind is not the only place the problem lives.',
        insight:
          'We often treat prayer like a last resort after control fails. The text assumes the opposite order: bring the situation before God first, and let thanksgiving sit beside the ask so fear does not get the only microphone.',
        application:
          'Name one situation you have been rehearsing alone. Say it plainly to God, then name one small thing you are thankful for in the same breath—no fixing required.',
        reflectQ:
          'Which anxious thought did you just hand over—and what changes when thanks gets a seat at the table with it?',
        close:
          'You traded some noise for honesty. Rest in that. Tomorrow the Shepherd walks beside you through valleys, not around them.',
        prayer:
          'God, I bring you what I keep circling in my mind—not to perform calm, but to be heard. I ask for what I need and I thank you for one true gift I can name right now. Guard my heart with your peace. Amen.'
      },
      {
        arrive: 'Today is about being led—not performing, not fixing everything at once.',
        meaning:
          'The shepherd image is not sentiment; it is provision and direction. Sheep are not shamed for needing guidance; they are kept, fed, and brought through terrain they cannot map alone.',
        insight:
          'Many of us want God as emergency backup but keep our hands on the wheel as default. The psalm quietly asks whether you will let someone else carry the map while you learn to walk at a sustainable pace.',
        application:
          'Picture one area where you are over-functioning (work, parenting, money, a relationship). What would it look like to take one step as a sheep—not the CEO of outcomes?',
        reflectQ:
          'Where are you most afraid to be led because it might mean slowing down or looking less capable?',
        close:
          'Being led is not weakness here; it is relief. Tomorrow Jesus speaks directly to the part of you that tries to live tomorrow today.',
        prayer:
          'Lord, I admit I like my own map. Teach me what it feels like to be led in kindness—not controlled, carried. Show me one next step I do not have to white-knuckle. Amen.'
      },
      {
        arrive: 'Jesus does not shame your mind for racing ahead. He speaks to the part of you that is tired of predicting the worst.',
        meaning:
          'Tomorrow has enough trouble without you borrowing it early. Jesus is not minimizing real problems; he is naming the cost of mental time travel—how it drains the strength you need for today’s actual work.',
        insight:
          'Anxiety often disguises itself as responsibility. The line between wise planning and compulsive pre-solving is whether your body can rest when the planning stops.',
        application:
          'Catch yourself forecasting once today. Pause and ask: is this a task I can act on in the next hour? If not, name it aloud as “not mine to carry yet” and return to one present-moment task.',
        reflectQ:
          'What tomorrow-problem are you rehearsing—and what permission would you need from God to leave it in tomorrow?',
        close:
          'One less borrowed worry is still mercy. Tomorrow we read God’s promise to be with you when fear shouts loudest.',
        prayer:
          'Jesus, my mind runs ahead of my feet. For this hour, help me stay inside today’s boundary. Give me courage to release what I cannot pre-solve and strength for what is actually mine to do. Amen.'
      },
      {
        arrive: 'Fear is not the opposite of faith. It is often where faith asks to be chosen again.',
        meaning:
          'God’s words to a people in exile are not “stop feeling.” They are presence and help: I am with you; I will strengthen you. The promise is companionship in danger, not the erasure of risk.',
        insight:
          'We often want a feeling of safety before we obey. Isaiah invites the opposite—strengthening that arrives while you are still afraid enough to need it.',
        application:
          'Where do you brace as if you are alone? Say one sentence of fear to God, then one sentence of his promise from this passage. Let them coexist without demanding a winner yet.',
        reflectQ:
          'What fear have you been treating as a verdict about the future—and what would it mean to let God’s “with you” sit beside that verdict today?',
        close:
          'Truth and fear shared one room today. That is enough. Tomorrow stillness becomes a doorway—not emptiness, but space.',
        prayer:
          'God, I feel small next to what I fear. You say you are with me and you strengthen me. I choose that truth again today—not because I feel brave, because I need help. Amen.'
      },
      {
        arrive: 'Stillness is not emptiness. It is making space so love can be heard.',
        meaning:
          '“Be still” is a command to stop striving long enough to recognize God’s authority in the chaos. It is not about achieving a zen state; it is about ceasing long enough to know who is God and who is not.',
        insight:
          'If you only pray on the move, your soul may mistake productivity for trust. Stillness exposes what you have been using noise to avoid.',
        application:
          'Set a timer for one minute. No fixing, no planning—only breathing and one repeated phrase: “You are God.” Notice what rises when the doing pauses.',
        reflectQ:
          'What part of you resists stillness because you are afraid of what you might feel or remember there?',
        close:
          'Stillness counted. Tomorrow peace is personal—a gift tied to Jesus, not a mood you manufacture.',
        prayer:
          'God, I stop long enough to remember you are not rushed or panicked. Quiet the part of me that thinks stillness is irresponsible. Let me know you—not only manage my problems. Amen.'
      },
      {
        arrive: 'Peace here is personal: a gift, not a prize you earn by calming yourself perfectly.',
        meaning:
          'Jesus gives peace as his own presence—not the world’s temporary relief. His peace can coexist with unresolved circumstances because it guards heart and mind in him.',
        insight:
          'We often treat peace as a reward for having everything figured out. The text offers peace as a person’s gift received while life is still messy.',
        application:
          'Where are you punishing yourself for not being “peaceful enough”? Replace one self-critical line with Jesus’ line: “My peace I give you.” Say it slowly until your shoulders respond.',
        reflectQ:
          'If Jesus’ peace is given before you prove anything, what would you stop arguing with yourself about tonight?',
        close:
          'You let peace be a gift, not a grade. Tomorrow we end this plan by naming weight—and practicing what it is to cast it.',
        prayer:
          'Jesus, thank you for peace that is not the same as everything being fixed. Guard my mind where it spirals; guard my heart where it hardens. I receive what you give. Amen.'
      },
      {
        arrive: 'Last stop: honest weight, gentle hands. You do not have to carry this alone.',
        meaning:
          'Peter tells anxious people to cast cares on God because God cares for you—the reason is relational, not mechanical. You are not bothering heaven; you are handing weight to someone who wants to carry it.',
        insight:
          '“Casting” is not a one-time event; it is an ongoing transfer because anxiety returns. The lie is that you must be strong enough to hold it all quietly.',
        application:
          'Write one worry on paper or in a note, then pray it aloud—literally hand it over. Delete or tear the paper if it helps your body believe the release.',
        reflectQ:
          'What habit keeps you picking the same anxiety back up—and what would one gentle boundary around that habit look like tonight?',
        close:
          'Seven small arcs of trust add up. Close gently; come back when worry rises. You learned language for the load—keep using it.',
        prayer:
          'God, I cast what I cannot carry onto you—not because it is small, because you care for me. Hold what I named; steady what I could not. Teach me to return here without shame when anxiety comes back. Amen.'
      }
    ],
    'who-jesus': [
      {
        arrive: 'We begin where God steps into skin—close enough to touch.',
        meaning:
          'John says the Word—God’s self-expression—became flesh and dwelt among us. Incarnation means God enters ordinary human life with glory shown in humility, not spectacle.',
        insight:
          'We can admire Jesus from a distance like an idea. The text presses closer: God is knowable in a body, in time, in neighbor-space.',
        application:
          'Where do you keep God abstract because closeness feels risky? Choose one ordinary place today (kitchen, commute, inbox) and invite Jesus there as fully human, not only cosmic.',
        reflectQ:
          'Which feels more vulnerable right now: believing God is near, or believing God is pleased with you when he sees you up close?',
        close:
          'You met the Word in flesh. Tomorrow Jesus reads good news in his hometown—and chooses the overlooked.',
        prayer:
          'God, thank you for not staying far off. In Jesus you came close enough to be touched, tired, interrupted. Meet me in my ordinary day with that same nearness. Amen.'
      },
      {
        arrive: 'Good news sounds different when it is spoken to people who feel overlooked.',
        meaning:
          'Jesus reads Isaiah’s liberation text and claims it is fulfilled in their hearing. The kingdom arrives first as announcement to the poor, captive, blind, and oppressed—not as a private spirituality upgrade.',
        insight:
          'We often spiritualize “good news” until it has no teeth for real injustice or pain. Luke keeps it grounded: Jesus’ mission starts with people the world speeds past.',
        application:
          'Name one person or group easily dismissed in your world. Ask God how your attitude or generosity could align with Jesus’ Nazareth sermon—not heroics, one concrete kindness.',
        reflectQ:
          'Who have you treated as “too ordinary” for God to prioritize—and how does Jesus’ choice challenge that reflex?',
        close:
          'You listened for mission, not performance. Tomorrow blessing widens on a hillside—without asking you to be perfect first.',
        prayer:
          'Jesus, you spoke good news over people others underestimated. Align my eyes with yours. Show me one person I can honor today the way you honored Nazareth. Amen.'
      },
      {
        arrive: 'Blessed is not “perfect.” Blessed is God leaning toward the places we hurt.',
        meaning:
          'The Beatitudes bless people in pain, humility, and hunger—not the self-sufficient. Jesus redefines flourishing as receiving God’s kingdom where you are empty enough to need it.',
        insight:
          'Many of us secretly believe blessing looks like strength, visibility, and control. Jesus blesses dependence, grief, mercy, and peacemaking—places ego cannot brag.',
        application:
          'Pick one beatitude. Instead of debating whether you qualify, ask: where is this true in me already? Where do I resist it because it threatens my image?',
        reflectQ:
          'Which beatitude exposes the story you tell about who deserves goodness—and what would it cost to let Jesus bless you there without arguing?',
        close:
          'Blessing widened today. Tomorrow living water meets thirst without shame—at a well.',
        prayer:
          'Jesus, your blessings do not sound like the world’s scoreboard. Give me courage to receive a kingdom-shaped life—even when it looks like humility. Amen.'
      },
      {
        arrive: 'Thirst is not failure. It is the body telling the truth about what it needs.',
        meaning:
          'Jesus offers living water to someone carrying relational shame. The offer is ongoing relationship with God, not a single transaction—water that becomes a spring inside you.',
        insight:
          'We often hide thirst behind competence or cynicism. The woman’s story shows Jesus naming thirst without humiliating the person who feels it.',
        application:
          'What are you medicating (scrolling, avoidance, anger, overwork)? For ten minutes, swap the numbing habit for one honest sentence of thirst spoken to God.',
        reflectQ:
          'What are you thirsty for under the surface—and what would it mean to stop shaming that thirst and tell Jesus the truth about it?',
        close:
          'Living water is patient kindness. Tomorrow the boat rocks—and Jesus speaks to storms.',
        prayer:
          'Jesus, I bring you thirst I have tried to hide. Meet me without contempt. Let what you offer become a spring in my daily life, not a slogan. Amen.'
      },
      {
        arrive: 'Storms do not mean you took a wrong turn. Sometimes they mean you are in the boat with him.',
        meaning:
          'The disciples are obeying Jesus—crossing the lake—yet wind and waves still hit. Jesus calms the storm after they wake him, revealing authority over chaos and presence in fear.',
        insight:
          'Faith is not storm-free travel. The turning point is whether you will bother Jesus with your fear instead of narrating it alone.',
        application:
          'Think of your loudest stressor right now. Say one blunt sentence to Jesus (“I am scared because…”). Do not add a tidy resolution—let presence be the point.',
        reflectQ:
          'What storm makes you assume God is absent or disappointed—and what changes if Jesus is in the boat before it gets calm?',
        close:
          'Peace spoke today. Tomorrow mercy searches for one—because one matters.',
        prayer:
          'Jesus, wind and waves are loud in my life. I wake you because I want to know you are near before everything feels solved. Speak peace to what overwhelms me. Amen.'
      },
      {
        arrive: 'You are allowed to be the one who wandered and still be wanted.',
        meaning:
          'The shepherd leaves ninety-nine to pursue one lost sheep—not because the ninety-nine are worthless, but because God’s heart refuses to treat any wanderer as disposable.',
        insight:
          'We often rehearse shame for needing rescue. Jesus reframes being lost as the beginning of being carried, not the end of being loved.',
        application:
          'Where have you been hiding “lost” parts of your story? Tell God one sentence you are afraid to admit. Imagine being carried, not scolded, on the way home.',
        reflectQ:
          'Where do you feel most “lost” lately—and what would it feel like in your body to be found without a lecture?',
        close:
          'Mercy is stubborn. Tomorrow we stand at a grave—and hear life speak plainly.',
        prayer:
          'Jesus, I am more tired of performing than I admit. Thank you for a shepherd who comes after wanderers. Carry what I cannot fix in myself. Amen.'
      },
      {
        arrive: 'We end where death is not the last word.',
        meaning:
          'Jesus claims to be resurrection and life before the tomb is opened. Hope here is not denial of grief; it is trust that God’s life is stronger than death’s finality.',
        insight:
          'We often want resurrection as an idea and resist it as hope for small, ordinary deaths—dreams, relationships, health. Jesus speaks life into places that feel sealed.',
        application:
          'Name one grief or ending you carry. Ask God for a small, honest resurrection hope—not a timeline, a next breath of life where you assumed only endings.',
        reflectQ:
          'What would resurrection hope look like if it were small and real in your week—not fireworks, just faithful life where you expected none?',
        close:
          'Seven glimpses—and still a beginning. Return when you need nearness. Jesus does not rush past tears to make a point.',
        prayer:
          'Jesus, you are resurrection and life in a world that still dies. Meet my grief with truth and tenderness. Give me one small hope that feels honest, not hollow. Amen.'
      }
    ],
    'life-hard': [
      {
        arrive: 'Heavy seasons need honest words, not shiny answers. Start gentle.',
        meaning:
          'God draws near to the crushed, not only the cheerful. Brokenhearted is not a spiritual failure; it is a human condition God refuses to treat as contagious.',
        insight:
          'We sometimes infer distance from pain—“If I hurt this much, God left.” The psalm reverses the logic: closeness is promised precisely where hearts break.',
        application:
          'Where are you editing pain to sound more acceptable? Write or speak one unpolished sentence of hurt to God or a trusted person—no resolution clause required.',
        reflectQ:
          'Where do you feel brokenhearted most honestly—and what would kindness from God sound like there if it were not fixing you fast?',
        close:
          'God stays near pain. Tomorrow a downcast soul still talks to God—and that counts as faith.',
        prayer:
          'God, my heart feels cracked open. Thank you for not flinching. Sit with me where it hurts; do not rush me to sound strong. Bind what is torn with your gentleness. Amen.'
      },
      {
        arrive: 'Downcast is not faithlessness. It is the soul telling the truth about thirst.',
        meaning:
          'The psalmist talks to himself honestly—“Why are you downcast?”—while still addressing God. Despair and dialogue can coexist; the song keeps both in the same room.',
        insight:
          'We often silence downcast feelings to protect faith’s image. Scripture keeps arguing with despair out loud until hope becomes believable again.',
        application:
          'Use the psalm’s pattern: ask your soul one honest question, then tell God one true thing you remember about him—even if memory feels thin.',
        reflectQ:
          'What question have you been afraid to say out loud to God—and what might change if you let the question be prayer instead of doubt you have to hide?',
        close:
          'Honest questions stayed in the room. Tomorrow faithfulness shows up in ruins—not only after tidy healing.',
        prayer:
          'God, my soul feels downcast and I do not have a bow to tie on it. Hear my “why” without scolding me. Help me remember you as I wait in the ache. Amen.'
      },
      {
        arrive: 'Mercy shows up in the middle of ruin—not only after everything is tidy.',
        meaning:
          'Lamentations holds grief and hope in the same breath: faithfulness is great, yet the speaker still walks through bitterness. Mercy is remembered in the wreckage, not after the wreckage disappears.',
        insight:
          'We want a clean story arc. The text blesses incremental hope—new mercies—without erasing what was lost.',
        application:
          'Name one ruin (small or large). Look for one mercy that exists alongside it without canceling the hurt—a friend, sleep, beauty, help you did not earn.',
        reflectQ:
          'What part of your story feels ruined—and where can you let mercy be real without forcing closure you do not yet have?',
        close:
          'Complexity stayed honest. Tomorrow we ask how God works good without lying about harm.',
        prayer:
          'God, great is your faithfulness, even when my feelings argue. Thank you for mercy that meets me mid-ruin. Give me courage to hope without pretending. Amen.'
      },
      {
        arrive: '“Good” here is not tidy—it is God weaving meaning without erasing what hurt.',
        meaning:
          'Paul says God works in all things for good for those who love him. “Good” is God-shaped, not comfort-shaped—it includes formation, endurance, and future glory, not only immediate relief.',
        insight:
          'This verse is often weaponized to silence pain. In context it is a promise that God is not absent in harm, not a demand that you call evil “fine.”',
        application:
          'Separate two lists mentally: what hurt you, and where you have seen God carry you anyway. Let both be true. Avoid using the verse to shame your grief.',
        reflectQ:
          'Which “all things” are you scared to hand to God because you fear he will call evil good—or ignore what happened?',
        close:
          'You held complexity without flattening it. Tomorrow comfort is personal—the God of all comfort, not a pep talk.',
        prayer:
          'God, I bring you what I cannot make sense of. Work your good in me without asking me to pretend harm was small. Hold my story with truth and tenderness. Amen.'
      },
      {
        arrive: 'Comfort is not a lecture. It is God bending low toward what aches.',
        meaning:
          'Paul names God as the Father of compassion and God of all comfort—comfort that flows through Christ and then through people who have suffered and been comforted.',
        insight:
          'We often try to pay forward comfort before we receive it, which burns people out. The text starts with receiving comfort so you can comfort others from fullness, not fumes.',
        application:
          'Who has comforted you lately? Thank them or God specifically. Then ask: who around me might need one gentle check-in without advice attached?',
        reflectQ:
          'What comfort do you actually need today—and what belief makes it hard to receive comfort instead of only giving it?',
        close:
          'Comfort became relational today. Tomorrow staying with God when answers are thin is still faithfulness.',
        prayer:
          'Father of compassion, bend low toward what aches in me. Let your comfort land as presence, not pressure. Prepare me to pass on what I have received—when I have truly received it. Amen.'
      },
      {
        arrive: 'Sometimes faith is simply staying in the room with God when answers are thin.',
        meaning:
          'The psalmist admits envy and confusion, yet ends anchored: God is the strength of my heart, my portion forever. “Nevertheless” is faith’s stubborn refusal to leave when feelings do not cooperate.',
        insight:
          'We treat doubt as contamination. Here doubt is carried into worship—God stays the chosen portion even when the path feels unfair compared to others.',
        application:
          'When you feel distant, do not add a performance. Speak one “nevertheless” sentence you can still stand on (a truth about God you are not ready to feel yet).',
        reflectQ:
          'What part of you wants to bolt when God feels quiet—and what would nevertheless faith look like in your real schedule today?',
        close:
          'Staying counted. Tomorrow tears are named and honored—no rush past grief.',
        prayer:
          'God, my heart envies, wanders, and argues—and I still choose you as my portion. Hold me on the days when “nevertheless” is all I have. Amen.'
      },
      {
        arrive: 'We close with a promise that does not rush past grief.',
        meaning:
          'John sees God wiping tears—death, mourning, crying, and pain addressed directly. The promise is not “stop hurting now,” but an end where grief is fully honored and healed.',
        insight:
          'Hope can feel cruel if it skips pain. This vision keeps grief real while refusing to let it be the final word.',
        application:
          'Name a loss that still needs naming. Let hope be a whisper: “This will not always be the whole story,” without forcing yourself to feel ready for joy.',
        reflectQ:
          'What loss still needs naming—and what hope would feel honest in your mouth tonight, not hollow?',
        close:
          'Seven honest stops. Carry what helped; leave the rest with God. Return when life feels heavy—this path stays open.',
        prayer:
          'God, you promise to wipe tears, not shame them. Hold my grief gently until the day you make all things new. Until then, stay close. Amen.'
      }
    ]
  };

  function getPlanDayEnrich(planId, dayIx) {
    var row = PLAN_DAY_ENRICH[String(planId)] || [];
    return row[dayIx] || {};
  }

  function planDotsForDayIndex(dayIx, total) {
    var s = '';
    for (var i = 0; i < total; i++) {
      s += i <= dayIx ? '\u25cf' : '\u25cb';
    }
    return s;
  }

  function planKickerLine(planId, dayIx, total) {
    return 'Day ' + (dayIx + 1) + ' of ' + total + ' \u00b7 ' + planDotsForDayIndex(dayIx, total);
  }

  function planPassageArriveLine(plan, psg, dayIx) {
    var en = getPlanDayEnrich(plan.id, dayIx);
    if (en.arrive && String(en.arrive).trim()) return String(en.arrive).trim();
    var line = String(psg.line || '').trim();
    var t = String(plan.title || '').trim();
    if (line && t) return 'Inside \u201c' + t + '\u201d, today stays with: ' + line + '.';
    return 'You do not have to arrive polished. Show up as you are.';
  }

  function planPassageCloseEncouragement(plan, psg, dayIx) {
    var en = getPlanDayEnrich(plan.id, dayIx);
    if (en.close && String(en.close).trim()) return String(en.close).trim();
    var line = String(psg.line || '').trim();
    return line
      ? 'You gave this day a little room. Let one word from it travel with you—and pick it up again tomorrow.'
      : 'Small steps add up. Rest in that—and return when you are ready for the next day.';
  }

  function planReflectQuestionPlain(plan, psg, dayIx) {
    var en = getPlanDayEnrich(plan.id, dayIx);
    if (en.reflectQ && String(en.reflectQ).trim()) return String(en.reflectQ).trim();
    if (psg.reflection && String(psg.reflection).trim()) return String(psg.reflection).trim();
    var line = String(psg.line || '').trim();
    if (line) {
      var lc = line.charAt(0).toLowerCase() + line.slice(1);
      return 'What is God inviting you to notice about ' + lc + ' in your real life today?';
    }
    return 'What is one honest sentence you want to remember from this passage?';
  }

  /** Reflect step: meaning, insight, application (reuse study-app-note), then question (study-plan-step-prompt). */
  function planReflectBodyHtml(plan, psg, dayIx) {
    var en = getPlanDayEnrich(plan.id, dayIx);
    function paraNote(txt) {
      var s = txt != null ? String(txt).trim() : '';
      if (!s) return '';
      return (
        '<p class="study-app-note body-font">' + esc(s).replace(/\n/g, '<br>') + '</p>'
      );
    }
    var meaning = en.meaning != null && String(en.meaning).trim() ? String(en.meaning).trim() : '';
    var insight = en.insight != null && String(en.insight).trim() ? String(en.insight).trim() : '';
    var application = en.application != null && String(en.application).trim() ? String(en.application).trim() : '';
    if (!meaning && psg.reflection && String(psg.reflection).trim()) {
      meaning = String(psg.reflection).trim();
    }
    var rq = planReflectQuestionPlain(plan, psg, dayIx);
    return (
      paraNote(meaning) +
      paraNote(insight) +
      paraNote(application) +
      '<p class="study-plan-step-prompt body-font">' +
      esc(rq).replace(/\n/g, '<br>') +
      '</p>'
    );
  }

  function planDescriptionShort(plan) {
    var d = String(plan.description || '').trim();
    if (d.length <= 160) return d;
    var cut = d.slice(0, 157).trim();
    var dot = cut.lastIndexOf('.');
    if (dot > 60) cut = cut.slice(0, dot + 1);
    return cut + '\u2026';
  }

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

  /** Verse-by-verse list: collapsed by default; toggle + animated panel (shared .g-vbb styles in index.html). */
  function studyVerseByVerseCollapsibleHtml(verseListInner) {
    if (!String(verseListInner || '').trim()) return '';
    var chev =
      '<svg class="g-vbb-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    return (
      '<div class="g-vbb" data-g-vbb="1">' +
      '<div class="g-vbb-divider" aria-hidden="true"></div>' +
      '<p class="g-vbb-title study-app-eyebrow">Read verse by verse</p>' +
      '<button type="button" class="g-vbb-toggle" data-act="vbb-toggle" aria-expanded="false">' +
      '<span class="g-vbb-toggle-label">Show verses</span>' +
      chev +
      '</button>' +
      '<div class="g-vbb-panel" aria-hidden="true">' +
      '<div class="g-vbb-panel-inner study-verse-inline-list">' +
      verseListInner +
      '</div></div></div>'
    );
  }

  function chip(t) {
    return '<span class="study-theme-chip">' + esc(t) + '</span>';
  }

  function btnPrimary(text, dataAttr, dataVal, extraAttrs) {
    return (
      '<button type="button" class="word-pray-btn display-font study-app-btn" ' +
      (dataAttr ? 'data-act="' + esc(dataAttr) + '" data-arg="' + esc(dataVal || '') + '"' : '') +
      (extraAttrs ? ' ' + extraAttrs : '') +
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
      '<span class="study-landing-passage-cta body-font">Begin study →</span>' +
      '</button>' +
      (card2 || '') +
      '</div>'
    );
  }

  function landingStudySearchPanel() {
    return (
      '<div class="study-landing-search-panel" id="studyLandingSearchPanel" hidden>' +
      '<h2 class="study-landing-search-modal-title display-font">Begin your study</h2>' +
      '<p class="study-landing-search-modal-sub body-font">Enter a verse, chapter, or topic \u2014 and we\u2019ll guide you through it.</p>' +
      '<label class="visually-hidden" for="studyLandingSearchInput">Verse, chapter, or topic</label>' +
      '<input type="text" class="study-landing-search-input body-font" id="studyLandingSearchInput" ' +
      'placeholder="Try Psalm 23, John 3:16, or anxiety" enterkeyhint="go" autocomplete="off">' +
      '<p class="study-landing-search-keyword-note body-font" id="studyLandingSearchKeywordNote" hidden>' +
      'We couldn\u2019t match that to a specific passage yet. Try a book and chapter (e.g. Psalm 23) or a verse (John 3:16).</p>' +
      '<p class="study-landing-search-modal-hint body-font">Not sure where to start? Try a feeling or topic.</p>' +
      '<div class="study-landing-search-actions">' +
      '<button type="button" class="word-pray-btn display-font study-app-btn study-landing-search-go" data-act="study-search-submit">Begin study \u2192</button>' +
      '<button type="button" class="word-continue-link study-app-link" data-act="study-search-cancel">Cancel</button>' +
      '</div></div>'
    );
  }

  function hideStudySearchPanel(root) {
    var pan = root.querySelector('#studyLandingSearchPanel');
    if (pan) pan.hidden = true;
    var inp = root.querySelector('#studyLandingSearchInput');
    if (inp) inp.value = '';
    var kw = root.querySelector('#studyLandingSearchKeywordNote');
    if (kw) kw.hidden = true;
  }

  function showStudySearchPanel(root) {
    var pan = root.querySelector('#studyLandingSearchPanel');
    if (!pan) return;
    pan.hidden = false;
    var kw = root.querySelector('#studyLandingSearchKeywordNote');
    if (kw) kw.hidden = true;
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
    var kwN = root.querySelector('#studyLandingSearchKeywordNote');
    if (kwN) kwN.hidden = true;
    if (res.kind === 'keyword') {
      if (kwN) kwN.hidden = false;
      if (inp) inp.focus();
      return;
    }
    hideStudySearchPanel(root);
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
    var active = findLandingActivePlan();
    var activeHtml = '';
    if (active) {
      var dayIx = getPlanDay(active.id);
      var total = active.passages.length;
      var psg = active.passages[dayIx] || active.passages[0];
      var dayProminent = 'Day ' + (dayIx + 1) + ' of ' + total;
      var dayLine = psg.book + ' ' + psg.chapter + ' — ' + psg.line;
      activeHtml =
        '<div class="study-guided-active">' +
        card(
          '<p class="study-app-eyebrow study-guided-active-label">Your current plan</p>' +
            '<p class="study-app-card-title display-font">' +
            esc(active.title) +
            '</p>' +
            '<p class="study-guided-active-progress display-font">' +
            esc(dayProminent) +
            '</p>' +
            '<p class="study-app-note study-guided-active-day">' +
            esc(dayLine) +
            '</p>' +
            '<p class="study-guided-active-pace body-font">Take today\'s step at your own pace.</p>' +
            '<button type="button" class="study-guided-cta" data-act="plan-continue" data-arg="' +
            esc(active.id) +
            '">Continue plan</button>',
          'study-app-card--guided-active'
        ) +
        '</div>';
    }
    var featured = READING_PLANS.filter(function (p) {
      return !active || p.id !== active.id;
    }).slice(0, 3);
    var featGridClass =
      'study-guided-featured' + (featured.length > 1 ? ' study-guided-featured--grid' : '');
    var featHtml = featured
      .map(function (plan) {
        return card(
          '<p class="study-app-card-title display-font">' +
            esc(plan.title) +
            '</p>' +
            '<p class="study-app-note study-guided-featured-desc">' +
            esc(planTagline(plan)) +
            '</p>' +
            '<button type="button" class="study-guided-cta" data-act="plan-start" data-arg="' +
            esc(plan.id) +
            '" data-plan-step-back="home">Start plan</button>',
          'study-app-card--guided-feature'
        );
      })
      .join('');
    return (
      '<section class="study-landing-section study-landing-guided" aria-labelledby="studyLandingGuidedHeading">' +
      '<h2 class="study-app-section-title" id="studyLandingGuidedHeading">Guided for you</h2>' +
      activeHtml +
      '<div class="' +
      featGridClass +
      '">' +
      featHtml +
      '</div>' +
      '<p class="study-guided-viewall">' +
      '<button type="button" class="study-guided-viewall-btn body-font" data-act="plans-all">View all plans →</button></p>' +
      '</section>'
    );
  }

  function renderPlansAll(root) {
    root.classList.remove('study-app-root--study-ctx', 'study-app-root--plan-step');
    var blocks = READING_PLANS.map(function (plan) {
      return planDetailCardAll(plan);
    }).join('');
    root.innerHTML =
      '<div class="study-landing">' +
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'home', '') +
      '</div>' +
      '<h2 class="study-app-h2 display-font study-plans-all-title">All reading plans</h2>' +
      '<p class="study-app-note study-plans-all-sub">Each plan is built for one day at a time. You can always open any day when you expand the journey.</p>' +
      '<div class="study-plans-all-list">' +
      blocks +
      '</div></div>';
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
    root.classList.remove('study-app-root--study-ctx', 'study-app-root--plan-step');
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
    root.classList.remove('study-app-root--study-ctx', 'study-app-root--plan-step');
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
    root.classList.remove('study-app-root--study-ctx', 'study-app-root--plan-step');
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

  function planPassageVerse(psg) {
    var v = psg.verse;
    if (v != null && parseInt(v, 10) > 0) return parseInt(v, 10) | 0;
    return 1;
  }

  function planPassagePrayerText(plan, psg, dayIx) {
    var ix = typeof dayIx === 'number' ? dayIx : 0;
    var en = getPlanDayEnrich(plan.id, ix);
    if (en.prayer && String(en.prayer).trim()) return String(en.prayer).trim();
    var p = psg.prayer && String(psg.prayer).trim();
    if (p) return p;
    var line = String(psg.line || '').trim();
    var t = String(plan.title || '').trim();
    var arc = t || 'this journey with you';
    var mid = line
      ? 'what you want me to notice in \u201c' + line + '\u201d'
      : 'what you want me to notice here';
    return (
      'God, I\u2019m walking through \u201c' +
      arc +
      '.\u201d Meet me in ' +
      mid +
      ', and help one honest word from your Word stay with me today. Amen.'
    );
  }

  function openPlanPreview(root, planId, planPreviewStepBack) {
    var plan = findPlanById(planId);
    if (!plan || !plan.passages[0]) return;
    setActivePlanId(planId);
    var keepList = state.list;
    state = {
      view: 'plan-preview',
      planPreviewId: planId,
      planPreviewStepBack: planPreviewStepBack === 'plans-all' ? 'plans-all' : 'home',
      book: '',
      chapter: 1,
      verse: null,
      planId: null,
      list: keepList,
      fromScripture: false
    };
    renderPlanPreview(root, plan, state.planPreviewStepBack);
    wire(root);
  }

  function renderPlanPreview(root, plan, stepBack) {
    root.classList.remove('study-app-root--study-ctx');
    root.classList.add('study-app-root--plan-step');
    var total = plan.passages.length;
    var daysList = plan.passages
      .map(function (p, i) {
        return (
          '<p class="study-app-note body-font">' +
          esc('Day ' + (i + 1) + ': ' + String(p.line || '').trim()) +
          '</p>'
        );
      })
      .join('');
    root.innerHTML =
      '<div class="study-plan-step">' +
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'plan-preview-back', stepBack) +
      '</div>' +
      '<header class="study-plan-step-head">' +
      '<h1 class="study-plan-step-plan display-font">' +
      esc(plan.title) +
      '</h1>' +
      '<p class="study-app-note">' +
      esc(planDescriptionShort(plan)) +
      '</p>' +
      '<p class="study-plan-step-kicker body-font">' +
      esc(String(total) + ' days total') +
      '</p>' +
      '</header>' +
      daysList +
      '<div class="study-plan-step-actions">' +
      btnPrimary('Start Day 1 →', 'plan-preview-start', plan.id, 'data-plan-step-back="' + esc(stepBack) + '"') +
      '</div></div>';
  }

  function openPlanStep(root, planId, dayIx, planStepBack, opts) {
    opts = opts || {};
    var fromPreview = !!opts.fromPreview;
    var preserveFlowStep = !!opts.preserveFlowStep;
    var plan = findPlanById(planId);
    if (!plan || !plan.passages[dayIx]) return;
    setActivePlanId(planId);
    var back = planStepBack === 'plans-all' ? 'plans-all' : 'home';
    var psg = plan.passages[dayIx];
    var vn = planPassageVerse(psg);
    var prevFlow = 1;
    var prevFromPreview = false;
    if (
      (preserveFlowStep || (state.view === 'plan-step' && state.planId === planId && state.planStepDay === dayIx)) &&
      state.view === 'plan-step' &&
      state.planId === planId &&
      state.planStepDay === dayIx
    ) {
      var pf = state.planFlowStep | 0;
      if (pf >= 1 && pf <= 5) prevFlow = pf;
      prevFromPreview = !!state.planFromPreview;
    }
    try {
      sessionStorage.setItem(
        'grounded_plan_step_ctx',
        JSON.stringify({ planId: planId, dayIx: dayIx, back: back })
      );
    } catch (eCtx) {}
    var keepList = state.list;
    state = {
      view: 'plan-step',
      planId: planId,
      planStepDay: dayIx,
      planStepBack: back,
      planFlowStep: prevFlow,
      planFromPreview: fromPreview || prevFromPreview,
      book: psg.book,
      chapter: psg.chapter,
      verse: vn,
      verseText: null,
      verseRef: null,
      list: keepList,
      fromScripture: false
    };
    renderPlanStepLoading(root, plan, dayIx, back, psg);
    wire(root);
    var b = bridge();
    if (typeof b.loadChapterVerses !== 'function') {
      var ne = root.querySelector('.study-plan-step-error');
      if (ne) ne.textContent = 'Reader unavailable.';
      return;
    }
    b.loadChapterVerses(psg.book, psg.chapter)
      .then(function (pack) {
        var verses = pack && pack.verses ? pack.verses : [];
        var text = verses[vn - 1] != null ? String(verses[vn - 1]) : '';
        var ref = psg.book + ' ' + psg.chapter + ':' + vn;
        state.verseText = text;
        state.verseRef = ref;
        renderPlanDayFlow(root, plan, dayIx, back, psg, text, ref);
        wire(root);
      })
      .catch(function () {
        root.innerHTML =
          '<div class="study-app-toolbar">' +
          btnGhost('← Back', 'plan-step-back', back) +
          '</div><p class="study-app-note study-plan-step-error">Could not load this passage. Try again.</p>';
        wire(root);
      });
  }

  function renderPlanStepLoading(root, plan, dayIx, back, psg) {
    root.classList.remove('study-app-root--study-ctx');
    root.classList.add('study-app-root--plan-step');
    root.innerHTML =
      '<div class="study-plan-step">' +
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'plan-step-back', back) +
      '</div>' +
      '<p class="study-app-note study-plan-step-loading-note">Opening today’s step…</p>' +
      '</div>';
  }

  function renderPlanDayFlow(root, plan, dayIx, back, psg, verseText, ref) {
    root.classList.remove('study-app-root--study-ctx');
    root.classList.add('study-app-root--plan-step');
    var total = plan.passages.length;
    var lastIx = total - 1;
    var flowStep = state.planFlowStep | 0;
    if (flowStep < 1 || flowStep > 5) flowStep = 1;
    state.planFlowStep = flowStep;
    var kicker = planKickerLine(plan.id, dayIx, total);
    var reflectArg = psg.book + '|' + String(psg.chapter);
    var prayArg = reflectArg;
    var themeLine = String(psg.line || '').trim();
    var arriveOnly = planPassageArriveLine(plan, psg, dayIx);
    var prayerTxt = planPassagePrayerText(plan, psg, dayIx);
    var closeEnc = planPassageCloseEncouragement(plan, psg, dayIx);
    var head =
      '<header class="study-plan-step-head">' +
      '<p class="study-plan-step-kicker body-font">' +
      esc(kicker) +
      '</p>' +
      '<h1 class="study-plan-step-plan display-font">' +
      esc(plan.title) +
      '</h1>' +
      '<p class="study-plan-step-theme body-font">' +
      esc(themeLine) +
      '</p>' +
      '</header>';
    var body = '';
    var actions = '';
    if (flowStep === 1) {
      body =
        '<p class="study-plan-step-support body-font">' +
        esc(arriveOnly) +
        '</p>' +
        '<p class="study-plan-step-support body-font">Let\u2019s take a moment to slow down.</p>';
      actions =
        '<div class="study-plan-step-actions">' + btnPrimary('Continue \u2192', 'plan-flow-next', '') + '</div>';
    } else if (flowStep === 2) {
      body =
        '<p class="study-app-note body-font">Read this slowly.</p>' +
        '<p class="study-verse-quote study-plan-step-verse display-font"><em>' +
        esc(verseText) +
        '</em></p>' +
        '<p class="study-key-ref study-plan-step-ref">' +
        esc(ref) +
        '</p>';
      actions =
        '<div class="study-plan-step-actions">' + btnPrimary('Continue \u2192', 'plan-flow-next', '') + '</div>';
    } else if (flowStep === 3) {
      body = planReflectBodyHtml(plan, psg, dayIx);
      actions =
        '<div class="study-plan-step-actions">' +
        btnPrimary('Continue \u2192', 'plan-flow-next', '') +
        '<div class="study-plan-step-secondary">' +
        '<button type="button" class="study-plan-step-secondary-btn body-font" data-act="reflect-ch" data-arg="' +
        esc(reflectArg) +
        '">Reflect on this</button>' +
        '<button type="button" class="study-plan-step-secondary-btn body-font" data-act="pray-ch" data-arg="' +
        esc(prayArg) +
        '">Pray with this</button>' +
        '</div></div>';
    } else if (flowStep === 4) {
      body = prayerTxt ? '<p class="study-plan-step-prayer body-font">' + esc(prayerTxt) + '</p>' : '';
      actions =
        '<div class="study-plan-step-actions">' + btnPrimary('Continue \u2192', 'plan-flow-next', '') + '</div>';
    } else {
      body = '<p class="study-plan-step-support body-font">' + esc(closeEnc) + '</p>';
      var paceHint =
        dayIx < lastIx ? '<p class="study-plan-step-pace-hint body-font">Come back tomorrow</p>' : '';
      var primaryNext =
        dayIx < lastIx
          ? btnPrimary('Continue to Day ' + (dayIx + 2) + ' \u2192', 'plan-step-next', '')
          : btnPrimary('Return to today \u2192', 'plan-close-home', '');
      var returnLink =
        dayIx < lastIx
          ? '<button type="button" class="study-plan-step-deeper word-continue-link study-app-link" data-act="plan-close-home">Return to today \u2192</button>'
          : '';
      actions =
        '<div class="study-plan-step-actions">' +
        primaryNext +
        paceHint +
        returnLink +
        '<button type="button" class="study-plan-step-deeper word-continue-link study-app-link" data-act="plan-step-deeper">Study this deeper \u2192</button>' +
        '</div>';
    }
    root.innerHTML =
      '<div class="study-plan-step">' +
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', 'plan-step-back', back) +
      '</div>' +
      head +
      body +
      actions +
      '</div>';
  }

  function renderChapterLoading(root, book, chapter, chBack) {
    root.classList.remove('study-app-root--study-ctx', 'study-app-root--plan-step');
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
    root.classList.remove('study-app-root--study-ctx', 'study-app-root--plan-step');
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
    var nb = state.verseNavBack;
    var backAct = nb && nb.act ? nb.act : 'back-verse';
    var backArg = nb && nb.act ? (nb.arg != null ? String(nb.arg) : '') : book + '|' + chapter;
    root.innerHTML =
      '<div class="study-app-toolbar">' +
      btnGhost('← Back', backAct, backArg) +
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
    root.classList.remove('study-app-root--study-ctx', 'study-app-root--plan-step');
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
          } else if (state.chapterBack === 'plans-all') {
            state = {
              view: 'plans-all',
              book: '',
              chapter: 1,
              verse: null,
              planId: null,
              list: null,
              fromScripture: false
            };
            renderPlansAll(root);
            wire(root);
          } else if (state.chapterBack === 'plan-step') {
            var rawCtx = null;
            try {
              rawCtx = sessionStorage.getItem('grounded_plan_step_ctx');
            } catch (eCx) {}
            var cctx = null;
            try {
              cctx = rawCtx ? JSON.parse(rawCtx) : null;
            } catch (eCx2) {}
            if (cctx && cctx.planId != null && cctx.dayIx != null) {
              openPlanStep(root, String(cctx.planId), parseInt(cctx.dayIx, 10) || 0, cctx.back === 'plans-all' ? 'plans-all' : 'home');
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
        if (root.getAttribute('data-grounded-overview-mode') === 'scriptureplus-bible') {
          try {
            root.removeAttribute('data-grounded-overview-mode');
          } catch (eRm) {}
          var bList = bridge();
          if (bList && typeof bList.closeScripturePlusBookOverviewToBrowse === 'function') {
            bList.closeScripturePlusBookOverviewToBrowse();
            return;
          }
        }
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
        var chBook = parts[0];
        var chNum = parseInt(parts[1], 10) || 1;
        if (root.getAttribute('data-grounded-overview-mode') === 'scriptureplus-bible') {
          var bCh = bridge();
          if (bCh && typeof bCh.openScripturePlusReaderFromBookOverview === 'function') {
            bCh.openScripturePlusReaderFromBookOverview(chBook, chNum);
            return;
          }
        }
        openChapter(root, chBook, chNum);
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
          pbtn.textContent = expanded ? 'Focus on today' : 'View full journey →';
        }
      } else if (act === 'plan-day') {
        var pd = arg.split('|');
        var pid = pd[0];
        var dayIx = parseInt(pd[1], 10) || 0;
        var stepBack = pd[2] === 'plans-all' ? 'plans-all' : 'home';
        var pl = findPlanById(pid);
        if (pl && pl.passages[dayIx]) {
          setActivePlanId(pid);
          openPlanStep(root, pid, dayIx, stepBack);
        }
      } else if (act === 'plan-continue') {
        var planC = findPlanById(arg);
        if (!planC) return;
        setActivePlanId(planC.id);
        var stepBackC = t.getAttribute('data-plan-step-back') || 'home';
        var dayC = getPlanDay(planC.id);
        openPlanStep(root, planC.id, dayC, stepBackC);
      } else if (act === 'plan-start') {
        var pls = findPlanById(arg);
        if (!pls || !pls.passages[0]) return;
        setActivePlanId(pls.id);
        var stepBackS = t.getAttribute('data-plan-step-back') || 'home';
        openPlanPreview(root, pls.id, stepBackS);
      } else if (act === 'plan-preview-back') {
        var destPb = arg === 'plans-all' ? 'plans-all' : 'home';
        state = {
          view: destPb === 'plans-all' ? 'plans-all' : 'home',
          book: '',
          chapter: 1,
          verse: null,
          planId: null,
          list: null,
          fromScripture: false
        };
        if (destPb === 'plans-all') renderPlansAll(root);
        else renderLanding(root);
        wire(root);
      } else if (act === 'plan-preview-start') {
        var plz = findPlanById(arg);
        if (!plz || !plz.passages[0]) return;
        setActivePlanId(plz.id);
        setPlanDay(plz.id, 0);
        var stepBackZ = t.getAttribute('data-plan-step-back') || 'home';
        openPlanStep(root, plz.id, 0, stepBackZ, { fromPreview: true });
      } else if (act === 'plan-flow-next') {
        if (state.view !== 'plan-step' || !state.planId) return;
        var plF = findPlanById(state.planId);
        if (!plF || !plF.passages[state.planStepDay]) return;
        var st = state.planFlowStep | 0;
        if (st < 5) {
          state.planFlowStep = st + 1;
          var psgF = plF.passages[state.planStepDay];
          renderPlanDayFlow(
            root,
            plF,
            state.planStepDay,
            state.planStepBack || 'home',
            psgF,
            state.verseText || '',
            state.verseRef || ''
          );
          wire(root);
        }
      } else if (act === 'plan-close-home') {
        var pbH = state.planStepBack === 'plans-all' ? 'plans-all' : 'home';
        state = {
          view: pbH === 'plans-all' ? 'plans-all' : 'home',
          book: '',
          chapter: 1,
          verse: null,
          planId: null,
          list: null,
          fromScripture: false
        };
        if (pbH === 'plans-all') renderPlansAll(root);
        else renderLanding(root);
        wire(root);
      } else if (act === 'plan-step-back') {
        var pb = arg === 'plans-all' ? 'plans-all' : 'home';
        if (
          state.view === 'plan-step' &&
          (state.planFlowStep | 0) > 1 &&
          state.planId &&
          findPlanById(state.planId)
        ) {
          state.planFlowStep = (state.planFlowStep | 0) - 1;
          var plB = findPlanById(state.planId);
          var psgB = plB && plB.passages[state.planStepDay];
          if (plB && psgB) {
            renderPlanDayFlow(
              root,
              plB,
              state.planStepDay,
              state.planStepBack || 'home',
              psgB,
              state.verseText || '',
              state.verseRef || ''
            );
            wire(root);
            return;
          }
        }
        if (state.view === 'plan-step' && (state.planFlowStep | 0) <= 1 && state.planFromPreview && state.planId) {
          openPlanPreview(root, state.planId, state.planStepBack || 'home');
          return;
        }
        if (pb === 'plans-all') {
          state = {
            view: 'plans-all',
            book: '',
            chapter: 1,
            verse: null,
            planId: null,
            list: null,
            fromScripture: false
          };
          renderPlansAll(root);
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
        }
        wire(root);
      } else if (act === 'plan-step-next') {
        var planN = findPlanById(state.planId);
        if (!planN) return;
        var ix = state.planStepDay;
        var lastIx = planN.passages.length - 1;
        markPlanDayCompleted(state.planId, ix);
        if (ix < lastIx) {
          var nextIx = ix + 1;
          var curStored = getPlanDay(state.planId);
          if (ix >= curStored) {
            setPlanDay(state.planId, nextIx);
          }
          openPlanStep(root, state.planId, nextIx, state.planStepBack || 'home');
        } else {
          var pb2 = state.planStepBack === 'plans-all' ? 'plans-all' : 'home';
          state = {
            view: pb2 === 'plans-all' ? 'plans-all' : 'home',
            book: '',
            chapter: 1,
            verse: null,
            planId: null,
            list: null,
            fromScripture: false
          };
          if (pb2 === 'plans-all') renderPlansAll(root);
          else renderLanding(root);
          wire(root);
        }
      } else if (act === 'plan-step-deeper') {
        if (!state.verseText || !state.verseRef || state.view !== 'plan-step') return;
        openVerse(root, state.book, state.chapter, state.verse, state.verseRef, state.verseText, {
          navBack: { act: 'plan-step-exit-study', arg: '' }
        });
      } else if (act === 'plan-step-exit-study') {
        var rawPs = null;
        try {
          rawPs = sessionStorage.getItem('grounded_plan_step_ctx');
        } catch (ePs) {}
        var c = null;
        try {
          c = rawPs ? JSON.parse(rawPs) : null;
        } catch (eJson) {}
        if (c && c.planId != null && c.dayIx != null) {
          openPlanStep(root, String(c.planId), parseInt(c.dayIx, 10) || 0, c.back === 'plans-all' ? 'plans-all' : 'home');
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
      } else if (act === 'plans-all') {
        state = {
          view: 'plans-all',
          book: '',
          chapter: 1,
          verse: null,
          planId: null,
          list: null,
          fromScripture: false
        };
        renderPlansAll(root);
        wire(root);
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
        } else if (arg === 'plans-all') {
          state = {
            view: 'plans-all',
            book: '',
            chapter: 1,
            verse: null,
            planId: null,
            list: null,
            fromScripture: false
          };
          renderPlansAll(root);
          wire(root);
        } else if (arg === 'plan-step') {
          var rawCh = null;
          try {
            rawCh = sessionStorage.getItem('grounded_plan_step_ctx');
          } catch (eCh) {}
          var cch = null;
          try {
            cch = rawCh ? JSON.parse(rawCh) : null;
          } catch (eCh2) {}
          if (cch && cch.planId != null && cch.dayIx != null) {
            openPlanStep(root, String(cch.planId), parseInt(cch.dayIx, 10) || 0, cch.back === 'plans-all' ? 'plans-all' : 'home');
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
        if (
          state.view === 'plan-step' &&
          bridge().openReflectWithVerse &&
          state.verse != null &&
          state.verseText
        ) {
          bridge().openReflectWithVerse(rc[0], parseInt(rc[1], 10) || 1, state.verse, state.verseText);
        } else if (bridge().openReflectWithPassage) {
          bridge().openReflectWithPassage(rc[0], parseInt(rc[1], 10) || 1);
        }
      } else if (act === 'pray-ch') {
        var pc = arg.split('|');
        if (
          state.view === 'plan-step' &&
          bridge().openPrayerWithVerse &&
          state.verse != null &&
          state.verseText
        ) {
          bridge().openPrayerWithVerse(pc[0], parseInt(pc[1], 10) || 1, state.verse, state.verseText);
        } else if (bridge().openPrayerWithPassage) {
          bridge().openPrayerWithPassage(pc[0], parseInt(pc[1], 10) || 1);
        }
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
      } else if (act === 'vbb-toggle') {
        var vbb = t.closest('.g-vbb');
        if (!vbb) return;
        var open = !vbb.classList.contains('g-vbb--open');
        vbb.classList.toggle('g-vbb--open', open);
        var tbtn = vbb.querySelector('.g-vbb-toggle');
        var lab = vbb.querySelector('.g-vbb-toggle-label');
        var pan = vbb.querySelector('.g-vbb-panel');
        if (tbtn) tbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (lab) lab.textContent = open ? 'Hide verses' : 'Show verses';
        if (pan) pan.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
    };
    root.onkeydown = function (ev) {
      if (state.view !== 'home' && state.view !== 'plans-all') return;
      if (ev.key !== 'Enter') return;
      var tg = ev.target;
      if (tg && tg.id === 'studyLandingSearchInput') {
        ev.preventDefault();
        submitStudyLandingSearch(root);
      }
    };
    syncStudyScreenChrome();
    if (state.view === 'home' || state.view === 'plans-all') {
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
    } else if (state.view === 'plans-all') {
      renderPlansAll(root);
      wire(root);
    } else if (state.view === 'plan-step' && state.planId != null && state.planStepDay != null) {
      openPlanStep(root, state.planId, state.planStepDay, state.planStepBack || 'home', { preserveFlowStep: true });
    } else if (state.view === 'plan-preview' && state.planPreviewId) {
      var prPl = findPlanById(state.planPreviewId);
      if (prPl) {
        renderPlanPreview(root, prPl, state.planPreviewStepBack || 'home');
        wire(root);
      }
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

  function openBookOverview(root, book, opts) {
    opts = opts || {};
    var listForState = opts.list != null ? opts.list : state.list;
    state = {
      view: 'book',
      book: book,
      chapter: 1,
      verse: null,
      planId: null,
      list: listForState,
      fromScripture: false
    };
    if (opts.handoffMode) {
      try {
        root.setAttribute('data-grounded-overview-mode', String(opts.handoffMode));
      } catch (eHm) {}
    } else {
      try {
        root.removeAttribute('data-grounded-overview-mode');
      } catch (eH0) {}
    }
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
    if (root && root.classList) root.classList.remove('study-app-root--plan-step');
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
    else if (prevView === 'plans-all') chBack = 'plans-all';
    else if (prevView === 'plan-step') chBack = 'plan-step';
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
    root.classList.remove('study-app-root--study-ctx', 'study-app-root--plan-step');
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
      '<div class="study-app-section study-app-section--vbb">' + studyVerseByVerseCollapsibleHtml(verseListInner) + '</div>';

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
    if (root && root.classList) root.classList.remove('study-app-root--plan-step');
    var fromScripture = !!opts.fromScripture;
    var keepList = state.list;
    var navBack = opts.navBack || null;
    var loadBackAct = navBack && navBack.act ? navBack.act : 'back-verse';
    var loadBackArg = navBack && navBack.act ? (navBack.arg != null ? String(navBack.arg) : '') : book + '|' + chapter;
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
      fromScripture: fromScripture,
      verseNavBack: navBack
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
        btnGhost('← Back', loadBackAct, loadBackArg) +
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
    try {
      var rawL = sessionStorage.getItem('grounded_study_landing_query');
      if (rawL != null) {
        var lq = String(rawL || '').trim();
        try {
          sessionStorage.removeItem('grounded_study_landing_query');
        } catch (eRm) {}
        if (lq) {
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
          showStudySearchPanel(root);
          var sip = root.querySelector('#studyLandingSearchInput');
          if (sip) sip.value = lq;
          var bridL = bridge();
          var resL =
            typeof bridL.resolveStudyLandingQuery === 'function'
              ? bridL.resolveStudyLandingQuery(lq)
              : null;
          if (resL && resL.kind !== 'keyword') {
            submitStudyLandingSearch(root);
          } else {
            var kn = root.querySelector('#studyLandingSearchKeywordNote');
            if (kn) kn.hidden = false;
          }
          return;
        }
      }
    } catch (eL) {}
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
          fromScripture: !!state.fromScripture,
          navBack: state.verseNavBack || undefined
        });
      }
      return;
    }
    if (state.view === 'journal-all') {
      renderJournalAll(root);
      wire(root);
      return;
    }
    if (state.view === 'plans-all') {
      renderPlansAll(root);
      wire(root);
      return;
    }
    if (state.view === 'plan-preview' && state.planPreviewId) {
      var prOn = findPlanById(state.planPreviewId);
      if (prOn) {
        renderPlanPreview(root, prOn, state.planPreviewStepBack || 'home');
        wire(root);
      }
      return;
    }
    if (state.view === 'plan-step' && state.planId != null && state.planStepDay != null) {
      openPlanStep(root, state.planId, state.planStepDay, state.planStepBack || 'home');
      return;
    }
    renderLanding(root);
    wire(root);
  }

  function openPlansAllView() {
    var root = document.getElementById('studyAppRoot');
    if (!root) return;
    state = {
      view: 'plans-all',
      book: '',
      chapter: 1,
      verse: null,
      planId: null,
      list: null,
      fromScripture: false
    };
    renderPlansAll(root);
    wire(root);
  }

  function startPlanFromExternal(planId) {
    var root = document.getElementById('studyAppRoot');
    if (!root) return;
    var pls = findPlanById(String(planId));
    if (!pls || !pls.passages[0]) return;
    setActivePlanId(pls.id);
    setPlanDay(pls.id, 0);
    openPlanStep(root, pls.id, 0, 'home');
    wire(root);
  }

  function getGuidedPlansForPicker() {
    var active = findLandingActivePlan();
    return READING_PLANS.filter(function (p) {
      return !active || p.id !== active.id;
    });
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

  global.GROUNDED_READING_PLANS = READING_PLANS;
  global.GroundedStudyApp = {
    onTabShown: onTabShown,
    openChapter: openChapterExternal,
    openVerse: openVerseExternal,
    openPlansAllView: openPlansAllView,
    startPlan: startPlanFromExternal,
    getGuidedPlansForPicker: getGuidedPlansForPicker,
    /** Render Study book overview into an arbitrary root (e.g. Bible nav) for Scripture+ Open Bible handoff. */
    openBookOverviewInRoot: function (root, book, options) {
      options = options || {};
      openBookOverview(root, book, {
        list: options.list,
        handoffMode: options.scripturePlusBible ? 'scriptureplus-bible' : null
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
