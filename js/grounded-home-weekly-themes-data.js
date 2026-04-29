/**
 * Canonical 48 weekly themes (12 months × 4) for Today tab + moment-flow context.
 * `weekly-themes.js` pads this list to 52 entries so week-of-year 1–52 always maps to a theme.
 */
(function (g) {
  'use strict';

  g.GROUNDED_HOME_WEEKLY_THEMES_52 = [
    // ── JANUARY ──
    {
      title: 'Beginning Again',
      subtitle: 'Every morning is an invitation to start fresh',
      days: [
        { focus: 'Openness', verse: { text: 'See, I am doing a new thing! Now it springs up; do you not perceive it?', reference: 'Isaiah 43:19' }, prompt: 'What is one thing you could set down as this week begins—not forever, just for now?', reflection: 'Starting fresh is not pretending the past did not happen. It is choosing not to let yesterday write all of today\'s lines.' },
        { focus: 'Intention', verse: { text: 'Commit to the Lord whatever you do, and he will establish your plans.', reference: 'Proverbs 16:3' }, prompt: 'Where could you hold your plans a little more loosely today?', reflection: 'Intention is quieter than hustle. It is one honest next step instead of a whole life overhaul before you move.' },
        { focus: 'Trust', verse: { text: 'Trust in the Lord with all your heart and lean not on your own understanding.', reference: 'Proverbs 3:5' }, prompt: 'Where is it hardest for you to trust God with how things turn out?', reflection: 'Trust is not a feeling you manufacture. It is a direction you practice when your hands still want to control the wheel.' },
        { focus: 'Surrender', verse: { text: "Many are the plans in a person's heart, but it is the Lord's purpose that prevails.", reference: 'Proverbs 19:21' }, prompt: 'What are you gripping so tightly that your hands are tired? What might it look like to offer it back?', reflection: 'Surrender sounds dramatic until you notice how tired your grip is. Loosening is not quitting—it is refusing to be owned by what you cannot hold anyway.' },
        { focus: 'Hope', verse: { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: 'Jeremiah 29:11' }, prompt: 'What is one gentle hope you can rest in today—without needing the whole picture?', reflection: 'Hope does not need a five-year plan to be real. It can be a small willingness that tomorrow might hold something gentle.' }
      ]
    },
    {
      title: 'Finding Rest',
      subtitle: "Learning to receive God's pace in a hurried world",
      days: [
        { focus: 'Stillness', verse: { text: 'Be still, and know that I am God.', reference: 'Psalm 46:10' }, prompt: 'Notice your body for a moment. Where do you feel hurry—and what would one minute of stillness change?', reflection: 'Stillness is not a reward you earn after you deserve it. It is a door God leaves open while the world keeps shouting deadlines.' },
        { focus: 'Sabbath', verse: { text: 'Come to me, all you who are weary and burdened, and I will give you rest.', reference: 'Matthew 11:28' }, prompt: 'What is one burden you have not really let yourself put down? What would permission to rest sound like?', reflection: 'Rest is not something you earn at the end of a productive day. It is something God offers you right now, before you have finished anything.' },
        { focus: 'Pace', verse: { text: 'He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.', reference: 'Psalm 23:2–3' }, prompt: 'Where is life asking you to slow—and what scares you about answering?', reflection: 'Your body already knows what pace is sustainable. The question is whether you will listen before it has to shout.' },
        { focus: 'Release', verse: { text: 'Cast your cares on the Lord and he will sustain you.', reference: 'Psalm 55:22' }, prompt: 'What worry keeps looping? Name it simply, without fixing it yet.', reflection: 'Some worries keep circling because you keep feeding them alone. Naming them out loud—to God or a safe person—often shrinks their volume.' },
        { focus: 'Receive', verse: { text: 'The Lord gives strength to his people; the Lord blesses his people with peace.', reference: 'Psalm 29:11' }, prompt: 'You do not have to earn rest. What would it feel like to receive care—from God or from someone safe?', reflection: 'Receiving care can feel risky if you are used to earning everything. Let today be an experiment in letting goodness land without a performance review.' }
      ]
    },
    {
      title: 'Knowing Who You Are',
      subtitle: 'Returning to your true identity in God',
      days: [
        { focus: 'Beloved', verse: { text: 'See what great love the Father has lavished on us, that we should be called children of God.', reference: '1 John 3:1' }, prompt: 'When you hear “beloved,” what is the first thing that argues back?', reflection: 'Beloved is not a sticker for perfect people. It is what is true before you argue yourself out of it.' },
        { focus: 'Made', verse: { text: "For we are God's handiwork, created in Christ Jesus to do good works.", reference: 'Ephesians 2:10' }, prompt: 'You were not an afterthought. What becomes gentler when you remember that?', reflection: 'You were not assembled by accident. Remembering that does not inflate you—it softens the part of you that keeps auditioning for worth.' },
        { focus: 'Known', verse: { text: 'You have searched me, Lord, and you know me.', reference: 'Psalm 139:1' }, prompt: 'What part of you do you hide—and what would it cost to let God see it?', reflection: 'Being known can feel exposing until you realize hiding is exhausting too. God already sees what you are protecting—without using it against you.' },
        { focus: 'Chosen', verse: { text: 'But you are a chosen people, a royal priesthood, a holy nation, God\'s special possession.', reference: '1 Peter 2:9' }, prompt: 'If “chosen” were true today, not theory, what would feel different by tonight?', reflection: 'Chosen is not a trophy word. It is permission to stop hustling for a seat you already have.' },
        { focus: 'Enough', verse: { text: 'The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you.', reference: 'Zephaniah 3:17' }, prompt: 'You do not have to prove your worth to breathe. What is one kind sentence you could say to yourself right now?', reflection: 'Enough is not the absence of desire. It is the quiet relief of not having to prove you belong in order to breathe.' }
      ]
    },
    {
      title: 'The Courage to Be Honest',
      subtitle: 'Bringing your whole self before God',
      days: [
        { focus: 'Honesty', verse: { text: 'The Lord is near to all who call on him, to all who call on him in truth.', reference: 'Psalm 145:18' }, prompt: 'What have you been smoothing over when you talk to God?', reflection: 'Honesty with God is not shock value. It is finally saying the thing you have been smoothing over so you do not have to carry it alone.' },
        { focus: 'Lament', verse: { text: 'How long, Lord? Will you forget me forever? How long will you hide your face from me?', reference: 'Psalm 13:1' }, prompt: 'Is there a loss you have rushed past? Name it in one sentence, as kindly as you can.', reflection: 'Lament is not faithlessness. It is refusing to call pain something prettier than it is so comfort can actually find you.' },
        { focus: 'Doubt', verse: { text: "Immediately the boy's father exclaimed, 'I do believe; help me overcome my unbelief!'", reference: 'Mark 9:24' }, prompt: 'What doubt feels too risky to say out loud? Try saying it to God in plain words.', reflection: 'Doubt is not the opposite of faith. It is often the doorway where faith stops performing and starts becoming real.' },
        { focus: 'Confession', verse: { text: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.', reference: '1 John 1:9' }, prompt: 'What are you carrying that wants to be named—not to shame you, but to lighten the load?', reflection: 'Confession is not groveling. It is the relief of not being the only one holding the secret.' },
        { focus: 'Openness', verse: { text: 'Search me, God, and know my heart; test me and know my anxious thoughts.', reference: 'Psalm 139:23' }, prompt: 'You do not have to manage God’s opinion of you. What is one true thing you could bring into the open today?', reflection: 'Openness is not oversharing. It is one truthful sentence where you used to only manage the narrative.' }
      ]
    },

    // ── FEBRUARY ──
    {
      title: 'Love as a Practice',
      subtitle: 'Moving from feeling to daily choosing',
      days: [
        { focus: 'Receive', verse: { text: 'We love because he first loved us.', reference: '1 John 4:19' }, prompt: 'How easy is it for you to receive love—from God or from people who care?', reflection: 'Receiving love can be harder than giving it—especially if you learned love had strings. Let yourself be loved first, without earning the next step.' },
        { focus: 'Give', verse: { text: 'A new command I give you: love one another. As I have loved you, so you must love one another.', reference: 'John 13:34' }, prompt: 'Who is hardest to love right now? No fixing—just notice what that stirs in you.', reflection: 'Love as a practice is not mood. It is a choice you repeat in small rooms where nobody is clapping.' },
        { focus: 'Self', verse: { text: 'Love your neighbor as yourself.', reference: 'Mark 12:31' }, prompt: 'Would you speak to a friend the way you have spoken to yourself lately?', reflection: 'The way you talk to yourself becomes the background music for everything else. Change the track—not with hype, with truth that sounds like kindness.' },
        { focus: 'Patience', verse: { text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.', reference: '1 Corinthians 13:4' }, prompt: 'Where do you need patience—with someone else, or with your own pace?', reflection: 'Patience is not pretending you are fine. It is staying gentle while reality moves slower than your fear wants it to.' },
        { focus: 'Depth', verse: { text: 'And I pray that you, being rooted and established in love, may have power to grasp how wide and long and high and deep is the love of Christ.', reference: 'Ephesians 3:17–18' }, prompt: 'Love is not something you have to earn before you belong. What shifts when you let that land?', reflection: 'Depth grows where you stop measuring love like a transaction. Belonging is not something you prove into existence.' }
      ]
    },
    {
      title: 'Sitting with Uncertainty',
      subtitle: 'Finding faith in what cannot yet be seen',
      days: [
        { focus: 'Wait', verse: { text: 'Wait for the Lord; be strong and take heart and wait for the Lord.', reference: 'Psalm 27:14' }, prompt: 'What are you waiting on—and where do you feel it in your body today?', reflection: 'Waiting is not wasted time unless you decide it is. It can be the place where your soul learns steadiness without a guarantee taped to the fridge.' },
        { focus: 'Faith', verse: { text: 'Now faith is confidence in what we hope for and assurance about what we do not see.', reference: 'Hebrews 11:1' }, prompt: 'What would one step of trust look like if you did not need all the answers first?', reflection: 'Faith is not certainty dressed up in religious language. It is movement when you still cannot see the whole map.' },
        { focus: 'Anchor', verse: { text: 'We have this hope as an anchor for the soul, firm and secure.', reference: 'Hebrews 6:19' }, prompt: 'When things feel shaky, what do you grab for first? Is it helping—or tiring you?', reflection: 'When everything feels shaky, you will grab for something. Name what you are grabbing—and ask if it can actually hold your weight.' },
        { focus: 'Presence', verse: { text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me.', reference: 'Psalm 23:4' }, prompt: 'In the middle of not-knowing, what would it change to remember you are not alone there?', reflection: 'The valley is not proof you took a wrong turn. It is often where presence becomes undeniable because answers are thin.' },
        { focus: 'Surrender', verse: { text: 'And we know that in all things God works for the good of those who love him.', reference: 'Romans 8:28' }, prompt: 'What is one thing you could hand over today—not perfectly, just honestly?', reflection: 'Surrender is not giving up on desire. It is admitting you were never meant to be the general manager of outcomes.' }
      ]
    },
    {
      title: 'Healing What Hurts',
      subtitle: 'Letting God into the tender places',
      days: [
        { focus: 'Acknowledge', verse: { text: 'He heals the brokenhearted and binds up their wounds.', reference: 'Psalm 147:3' }, prompt: 'What hurt have you been rushing past that still asks for your attention?', reflection: 'Acknowledging pain is not indulgence. It is the first step out of the exhausting performance of being fine.' },
        { focus: 'Grieve', verse: { text: 'Blessed are those who mourn, for they will be comforted.', reference: 'Matthew 5:4' }, prompt: 'Is there a loss—big or small—you have not really let yourself feel?', reflection: 'Grief does not follow a tidy schedule. Giving it language is how you stop it from leaking into everything sideways.' },
        { focus: 'Forgive', verse: { text: 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.', reference: 'Colossians 3:13' }, prompt: 'Unforgiveness is heavy. What is it costing you to keep carrying it?', reflection: 'Forgiveness is not pretending harm was okay. It is refusing to let their choice keep writing your inner script.' },
        { focus: 'Receive', verse: { text: 'He was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him.', reference: 'Isaiah 53:5' }, prompt: 'What would it look like to receive grace for yourself—not as a lecture, as a gift?', reflection: 'Grace is not a lecture you endure. It is the part of God that moves toward you when you are embarrassed to be seen.' },
        { focus: 'Restore', verse: { text: 'And the God of all grace, who called you to his eternal glory in Christ, after you have suffered a little while, will himself restore you and make you strong, firm and steadfast.', reference: '1 Peter 5:10' }, prompt: 'Where do you notice something softening or healing—even a little?', reflection: 'Restoration is rarely a spotlight moment. Notice the small softening—it counts.' }
      ]
    },
    {
      title: 'The Inner Life',
      subtitle: 'Tending to what grows in the quiet',
      days: [
        { focus: 'Attention', verse: { text: 'Above all else, guard your heart, for everything you do flows from it.', reference: 'Proverbs 4:23' }, prompt: 'What has been living rent-free in your inner world—worry, hope, grief, longing?', reflection: 'What you rehearse in private becomes what you reach for in public. Attention is not neutral—it is training.' },
        { focus: 'Renewal', verse: { text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.', reference: 'Romans 12:2' }, prompt: 'What story about yourself are you ready to loosen your grip on?', reflection: 'Renewal is not a vibe. It is slowly loosening a story about yourself that stopped fitting years ago.' },
        { focus: 'Fruit', verse: { text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.', reference: 'Galatians 5:22–23' }, prompt: 'Which fruit of the Spirit feels closest today? Which feels far—and with zero judgment?', reflection: 'You are allowed to be complicated. Fruit grows in seasons; one quiet patch does not define the whole tree.' },
        { focus: 'Roots', verse: { text: 'So then, just as you received Christ Jesus as Lord, continue to live your lives in him, rooted and built up in him.', reference: 'Colossians 2:6–7' }, prompt: 'What actually helps you stay rooted lately—and what quietly pulls you off-center?', reflection: 'Roots are boring until the storm hits. What you practice in quiet is what you have when life gets loud.' },
        { focus: 'Quiet', verse: { text: 'In quietness and trust is your strength.', reference: 'Isaiah 30:15' }, prompt: 'You do not need more noise to be serious about faith. What would five minutes of quiet make room for?', reflection: 'Quiet is not avoidance. It is making space for something truer than the noise that keeps calling itself urgent.' }
      ]
    },

    // ── MARCH ──
    {
      title: 'Facing Fear',
      subtitle: "Walking forward when you don't feel ready",
      days: [
        { focus: 'Name It', verse: { text: 'When I am afraid, I put my trust in you.', reference: 'Psalm 56:3' }, prompt: 'What fear keeps visiting—and what happens if you name it out loud to God in plain words?', reflection: 'You cannot walk through what you will not name. The first act of courage is simply admitting what you are actually afraid of.' },
        { focus: 'Courage', verse: { text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', reference: 'Joshua 1:9' }, prompt: 'What is one small move you keep postponing because it feels risky?', reflection: 'Courage is not the absence of fear. It is one small move you make while your knees still remember they can shake.' },
        { focus: 'Perfect Love', verse: { text: 'There is no fear in love. But perfect love drives out fear.', reference: '1 John 4:18' }, prompt: 'Where does fear tighten its grip? What would gentleness say there—not pressure, gentleness?', reflection: 'Fear shrinks in honest love—not perfect love, honest love. Gentleness is not weakness; it is a safer kind of strength.' },
        { focus: 'Not Alone', verse: { text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.', reference: 'Isaiah 41:10' }, prompt: 'What would feel different if you were sure you did not have to carry this alone?', reflection: 'Isolation makes fear louder. Let today be about remembering you were never meant to carry the whole weight alone.' },
        { focus: 'Step', verse: { text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.', reference: '2 Timothy 1:7' }, prompt: 'Courage can be tiny. What is one step you could take today that matches your real capacity?', reflection: 'A tiny step still counts. God meets real capacity, not the version of you that pretends you are not tired.' }
      ]
    },
    {
      title: 'Gratitude as a Way of Seeing',
      subtitle: 'Training your eyes to find what is already good',
      days: [
        { focus: 'Notice', verse: { text: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.', reference: '1 Thessalonians 5:18' }, prompt: 'What is one small thing from today or yesterday you almost missed—and can thank God for?', reflection: 'Noticing is a discipline, not a mood. What you pay attention to slowly becomes what you believe about your life.' },
        { focus: 'Remember', verse: { text: 'Praise the Lord, my soul, and forget not all his benefits.', reference: 'Psalm 103:2' }, prompt: 'Look back one year. Where do you see goodness you did not credit at the time?', reflection: 'Memory is not nostalgia only. It can be evidence that goodness showed up when you could not feel it at the time.' },
        { focus: 'Shift', verse: { text: 'Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure — think about such things.', reference: 'Philippians 4:8' }, prompt: 'Where does your mind drift by default? What is one true, good thing you could turn it toward?', reflection: 'Your mind has a default channel. Redirecting it is not toxic positivity—it is choosing what gets to grow in the soil.' },
        { focus: 'Body', verse: { text: 'I praise you because I am fearfully and wonderfully made.', reference: 'Psalm 139:14' }, prompt: 'Name one thing about your body or your day you are honestly glad for.', reflection: 'Your body carries you through ordinary days. Honoring that is a quiet kind of worship.' },
        { focus: 'Enough', verse: { text: 'The Lord is my shepherd, I lack nothing.', reference: 'Psalm 23:1' }, prompt: 'Where is “not enough” loudest? What is already here that you could let count?', reflection: 'Enough is not a number. It is noticing what is already here before you rush past it toward the next thing.' }
      ]
    },
    {
      title: 'Letting Go',
      subtitle: 'The practice of open hands',
      days: [
        { focus: 'Control', verse: { text: 'Cast all your anxiety on him because he cares for you.', reference: '1 Peter 5:7' }, prompt: 'What are you white-knuckling right now—a person, an outcome, a version of your life?', reflection: 'Control promises safety and delivers exhaustion. Open hands are not careless—they are honest about what was never yours to guarantee.' },
        { focus: 'Attachment', verse: { text: 'Do not store up for yourselves treasures on earth… but store up for yourselves treasures in heaven.', reference: 'Matthew 6:19–20' }, prompt: 'What would feel devastating to lose? What does that tell you about what you are leaning on?', reflection: 'Attachment is not love. Sometimes what you are clinging to is the illusion that you can secure your future by gripping harder.' },
        { focus: 'Outcome', verse: { text: 'In their hearts humans plan their course, but the Lord establishes their steps.', reference: 'Proverbs 16:9' }, prompt: 'Where are you stuck on one outcome? What would it feel like to hold it more loosely?', reflection: 'Controlling the outcome is exhausting because it was never yours to control. Today is about practicing the relief of putting it down.' },
        { focus: 'Timeline', verse: { text: 'There is a time for everything, and a season for every activity under the heavens.', reference: 'Ecclesiastes 3:1' }, prompt: 'What are you trying to rush that might need a slower season?', reflection: 'Timelines are tempting because they pretend uncertainty can be tamed. Seasons ask for a different kind of courage—patience without panic.' },
        { focus: 'Trust', verse: { text: 'Commit your way to the Lord; trust in him and he will do this.', reference: 'Psalm 37:5' }, prompt: 'Surrender is not giving up on caring. What would trust look like in your real life today?', reflection: 'Trust is not a vibe. It is the daily practice of doing the next right thing without demanding the whole script upfront.' }
      ]
    },
    {
      title: 'Compassion Begins Within',
      subtitle: 'You cannot give what you have not received',
      days: [
        { focus: 'Gentleness', verse: { text: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.', reference: 'Ephesians 4:32' }, prompt: 'Would you treat a friend the way you have treated yourself this week?', reflection: 'The voice you use on yourself becomes the ceiling for how gentle you can be with anyone else. Start where the words are harshest.' },
        { focus: 'Shame', verse: { text: 'Therefore, there is now no condemnation for those who are in Christ Jesus.', reference: 'Romans 8:1' }, prompt: 'What is the harshest sentence you repeat about yourself? What would be truer—and kinder?', reflection: 'Shame loves secrecy. Naming it kindly—without defending it—often drains some of its power on contact.' },
        { focus: 'Limits', verse: { text: 'He knows how we are formed, he remembers that we are dust.', reference: 'Psalm 103:14' }, prompt: 'Where have you called exhaustion “faithfulness”? What would compassion change?', reflection: 'Limits are not failure. They are the shape of a human life that God already expected to need sleep and mercy.' },
        { focus: 'Receive', verse: { text: 'The Lord is gracious and compassionate, slow to anger and rich in love.', reference: 'Psalm 145:8' }, prompt: 'How hard is it for you to receive kindness—from God, from others, from yourself?', reflection: 'Receiving kindness is harder when you believe you have to earn oxygen. Let one gift land today without negotiating it away.' },
        { focus: 'Overflow', verse: { text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope.', reference: 'Romans 15:13' }, prompt: 'You do not have to be full to be generous. What is one small way love could move through you today?', reflection: 'You do not have to be full to be generous. Small overflow is still real overflow.' }
      ]
    },

    // ── APRIL ──
    {
      title: 'Resurrection and Renewal',
      subtitle: 'Nothing that matters to God stays buried',
      days: [
        { focus: 'Death to Life', verse: { text: 'I am the resurrection and the life. The one who believes in me will live, even though they die.', reference: 'John 11:25' }, prompt: 'What feels finished—a hope, a part of you—and are you willing to admit you would love for it to live again?', reflection: 'Some endings are not conclusions. They are doors that only look like walls until you stop bracing long enough to notice the draft of new air.' },
        { focus: 'New Creation', verse: { text: 'Therefore, if anyone is in Christ, the new creation has come: the old has gone, the new is here!', reference: '2 Corinthians 5:17' }, prompt: 'What old story about yourself are you tired of carrying?', reflection: 'A new story does not erase the old one. It offers you a name you can grow into without performing your way into it.' },
        { focus: 'Stone Rolled', verse: { text: 'He is not here; he has risen, just as he said.', reference: 'Matthew 28:6' }, prompt: 'What have you been waiting to shift? What if something already moved—and you have not noticed yet?', reflection: 'Surprise is not always loud. Sometimes resurrection looks like one honest breath you did not think you could take.' },
        { focus: 'Transformation', verse: { text: "And we all, who with unveiled faces contemplate the Lord's glory, are being transformed into his image with ever-increasing glory.", reference: '2 Corinthians 3:18' }, prompt: 'Where do you see slow, quiet change—even if no one else would call it dramatic?', reflection: 'Transformation is often slow enough to ignore. Track one small shift before you call the season a waste.' },
        { focus: 'Life', verse: { text: 'The thief comes only to steal and kill and destroy; I have come that they may have life, and have it to the full.', reference: 'John 10:10' }, prompt: '“Full” does not have to mean loud. What would feel like enough life for you this season?', reflection: 'Full life is not constant fireworks. Sometimes it is permission to want what is good without apologizing for wanting.' }
      ]
    },
    {
      title: 'The Gift of the Present',
      subtitle: 'This moment is where God meets you',
      days: [
        { focus: 'Here', verse: { text: 'This is the day the Lord has made; we will rejoice and be glad in it.', reference: 'Psalm 118:24' }, prompt: 'Where is your mind—past, future, or here? What would help you land in this hour?', reflection: 'Presence is not a personality trait. It is a practice of returning—again and again—to the only hour you actually have.' },
        { focus: 'Enough', verse: { text: 'Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.', reference: 'Matthew 6:34' }, prompt: 'What “tomorrow” is borrowing today’s peace?', reflection: 'Tomorrow will borrow whatever you give it. Today still has room for one grounded choice.' },
        { focus: 'Breath', verse: { text: 'The Spirit of God has made me; the breath of the Almighty gives me life.', reference: 'Job 33:4' }, prompt: 'One slow breath: you are here. What does that simple fact stir in you?', reflection: 'Breath is the simplest proof you are here. Let that be enough for sixty seconds before you pick the worry back up.' },
        { focus: 'Small', verse: { text: 'Do not despise these small beginnings, for the Lord rejoices to see the work begin.', reference: 'Zechariah 4:10' }, prompt: 'What small moment today could you treat as sacred—not special, just noticed?', reflection: 'Small is not insignificant. It is how most real lives are built—one unnoticed faithful piece at a time.' },
        { focus: 'Attention', verse: { text: 'Be very careful, then, how you live — not as unwise but as wise, making the most of every opportunity.', reference: 'Ephesians 5:15–16' }, prompt: 'What one relationship or task deserves a little more of your full attention this week?', reflection: 'Attention is a limited resource. Spending it honestly is how love stops becoming a concept and becomes a life.' }
      ]
    },
    {
      title: 'Generosity of Spirit',
      subtitle: 'Living with open hands and an open heart',
      days: [
        { focus: 'Give', verse: { text: 'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.', reference: '2 Corinthians 9:7' }, prompt: 'Where does giving feel easy—and where does your hand tighten? No judgment, just notice.', reflection: 'Giving is not a performance of having it all together. It is admitting you have enough to share because you are human, not infinite.' },
        { focus: 'Time', verse: { text: 'Whoever is kind to the poor lends to the Lord, and he will reward them for what they have done.', reference: 'Proverbs 19:17' }, prompt: 'Who might need ten minutes of your real presence this week?', reflection: 'Time is the clearest love language most people understand. Ten minutes of real presence is not small—it is rare.' },
        { focus: 'Abundance', verse: { text: 'Now he who supplies seed to the sower and bread for food will also supply and increase your store of seed and will enlarge the harvest of your righteousness.', reference: '2 Corinthians 9:10' }, prompt: 'Do you move through the day more like there is enough—or always like there is not?', reflection: 'Scarcity is a story. Abundance is often noticing what is already in the room before you count what is missing.' },
        { focus: 'Words', verse: { text: 'Do not let any unwholesome talk come out of your mouths, but only what is helpful for building others up.', reference: 'Ephesians 4:29' }, prompt: 'What is one true, kind sentence you could offer someone you have been quiet around?', reflection: 'Words can build or bruise. One true sentence can change the temperature of a whole day.' },
        { focus: 'Self', verse: { text: 'Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves.', reference: 'Philippians 2:3' }, prompt: 'Where could you share credit, help, or space without keeping score?', reflection: 'Humility is not erasing yourself. It is refusing to make everyone else a supporting character in your anxiety.' }
      ]
    },
    {
      title: 'The Long Road of Growth',
      subtitle: 'Faithfulness is measured in years, not moments',
      days: [
        { focus: 'Process', verse: { text: 'Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.', reference: 'Philippians 1:6' }, prompt: 'Where are you impatient with your own pace? What if growth is allowed to be quiet?', reflection: 'Process is not punishment. It is God refusing to finish you like a rushed project.' },
        { focus: 'Persevere', verse: { text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.', reference: 'Galatians 6:9' }, prompt: 'What feels tiring to keep doing—and is it still yours to keep doing?', reflection: 'Weariness is information, not indictment. Sometimes the faithful thing is rest, not another push.' },
        { focus: 'Seasons', verse: { text: 'As long as the earth endures, seedtime and harvest, cold and heat, summer and winter, day and night will never cease.', reference: 'Genesis 8:22' }, prompt: 'What season are you in—and what does this season realistically ask of you?', reflection: 'Seasons change without asking your permission. Naming yours honestly is how you stop fighting the wrong battle.' },
        { focus: 'Slow', verse: { text: 'The path of the righteous is like the morning sun, shining ever brighter till the full light of day.', reference: 'Proverbs 4:18' }, prompt: 'Name one thing that is different than it was a year ago, even if it is small.', reflection: 'Slow brightening still counts as light. Track evidence instead of demanding a fireworks receipt.' },
        { focus: 'Faithful', verse: { text: "His master replied, 'Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things.'", reference: 'Matthew 25:23' }, prompt: 'What small, unglamorous faithfulness is yours this week—maybe only God will notice?', reflection: 'Faithfulness rarely looks cinematic. It looks like showing up again when nobody is keeping score.' }
      ]
    },

    // ── MAY ──
    {
      title: 'Silence and Solitude',
      subtitle: 'The disciplines that reshape the soul',
      days: [
        { focus: 'Withdraw', verse: { text: 'But Jesus often withdrew to lonely places and prayed.', reference: 'Luke 5:16' }, prompt: 'When were you last alone with quiet—really? What usually fills that gap?', reflection: 'Withdrawal is not escape if it returns you to yourself. Jesus slipped away because noise can drown out what is true.' },
        { focus: 'Listen', verse: { text: 'Speak, Lord, for your servant is listening.', reference: '1 Samuel 3:9' }, prompt: 'What gets louder than God’s voice in your average day?', reflection: 'Most of us are so practiced at speaking that we have forgotten how to receive. Today is about making room for what God might want to say.' },
        { focus: 'Desert', verse: { text: 'Therefore I am now going to allure her; I will lead her into the wilderness and speak tenderly to her.', reference: 'Hosea 2:14' }, prompt: 'Has a dry season ever turned out to be where you heard God clearest? What stayed with you?', reflection: 'Wilderness sounds harsh until you remember what grows there. Dry ground is sometimes where tenderness finally gets heard.' },
        { focus: 'Simplify', verse: { text: 'Better one handful with tranquility than two handfuls with toil and chasing after the wind.', reference: 'Ecclesiastes 4:6' }, prompt: 'What could you subtract this week—not to be impressive, just to breathe?', reflection: 'Simplicity is not aesthetic. It is removing what you added to feel safe—and discovering you still are.' },
        { focus: 'Be', verse: { text: 'My soul finds rest in God alone; my salvation comes from him.', reference: 'Psalm 62:1' }, prompt: 'You do not have to produce your way into worth. What would ten minutes of simply being with God look like?', reflection: 'Being is not laziness. It is the quiet courage of letting your worth exist before you produce another thing.' }
      ]
    },
    {
      title: 'Relationships That Heal',
      subtitle: 'We are made for connection, not isolation',
      days: [
        { focus: 'Community', verse: { text: 'And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together.', reference: 'Hebrews 10:24–25' }, prompt: 'Who nudges you toward love lately—and who are you nudging back?', reflection: 'Community is not a crowd. It is one or two people who make it safer to tell the truth.' },
        { focus: 'Vulnerability', verse: { text: 'Therefore confess your sins to each other and pray for each other so that you may be healed.', reference: 'James 5:16' }, prompt: 'Is there one person it might help to tell the truth to—not everything, just the next honest layer?', reflection: 'Vulnerability is not dumping. It is choosing one layer deeper where secrecy has been costing you sleep.' },
        { focus: 'Repair', verse: { text: 'If it is possible, as far as it depends on you, live at peace with everyone.', reference: 'Romans 12:18' }, prompt: 'What relationship is frayed—and what is one low-risk step toward peace on your side?', reflection: 'Peace is not always possible with everyone. Sometimes it is the relief of doing your part without owning their response.' },
        { focus: 'Receive', verse: { text: 'Two are better than one, because they have a good return for their labor: if either of them falls down, one can help the other up.', reference: 'Ecclesiastes 4:9–10' }, prompt: 'How easy is it for you to let someone help when you stumble?', reflection: 'Letting someone help is not weakness. It is admitting you are human in a world that pretends independence is a virtue.' },
        { focus: 'Presence', verse: { text: 'A friend loves at all times, and a brother is born for a time of adversity.', reference: 'Proverbs 17:17' }, prompt: 'Who might need you to show up without fixing anything—just with them?', reflection: 'Presence without fixing is a rare gift. Offer it the way you wish someone would offer it to you.' }
      ]
    },
    {
      title: 'Work and Calling',
      subtitle: 'What you do flows from who you are',
      days: [
        { focus: 'Purpose', verse: { text: 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.', reference: 'Ephesians 2:10' }, prompt: 'What kind of work or care makes you feel most like yourself with God?', reflection: 'Purpose is not a spotlight. It is the quiet alignment between what you do and who you are becoming.' },
        { focus: 'Faithfulness', verse: { text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.', reference: 'Colossians 3:23' }, prompt: 'What would change if today’s tasks were a quiet offering—not a performance review?', reflection: 'Faithfulness in ordinary work is not small to God. He sees what no performance review ever could.' },
        { focus: 'Burnout', verse: { text: 'Come to me, all you who are weary and burdened, and I will give you rest.', reference: 'Matthew 11:28' }, prompt: 'Are you running near empty? What would rest first look like—not escape, rest?', reflection: 'Burnout is not a badge. It is your life asking for limits before your body enforces them for you.' },
        { focus: 'Enough', verse: { text: 'Better one handful with tranquility than two handfuls with toil and chasing after the wind.', reference: 'Ecclesiastes 4:6' }, prompt: 'Where is hustle doing the job of proving you matter? What would “enough” look like on paper?', reflection: 'Hustle often tries to prove you matter. Enough is the braver story: you already do, before the output arrives.' },
        { focus: 'Fruit', verse: { text: 'I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.', reference: 'John 15:5' }, prompt: 'Does your output flow from staying connected—or from white-knuckling?', reflection: 'Fruit grows from connection, not frenzy. Staying attached is the part you cannot skip.' }
      ]
    },
    {
      title: 'Anxiety and Peace',
      subtitle: "You don't have to be calm to be held",
      days: [
        { focus: 'Name', verse: { text: 'When anxiety was great within me, your consolation brought me joy.', reference: 'Psalm 94:19' }, prompt: 'Under the spinning thoughts, what is the fear in one plain sentence?', reflection: 'Naming fear does not summon it. It usually shrinks it—because shame loses oxygen when you stop narrating alone.' },
        { focus: 'Body', verse: { text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.', reference: 'Philippians 4:6' }, prompt: 'Where do you hold anxiety in your body—and what helps: breath, stretch, sleep, telling someone?', reflection: 'Your body keeps score even when your mind negotiates. Listening is not weakness; it is wisdom.' },
        { focus: 'Peace', verse: { text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.', reference: 'Philippians 4:7' }, prompt: 'Remember a time peace showed up when it “should not have.” What was true then?', reflection: 'Peace is not the absence of problems. It is a guardrail around your mind when problems refuse to leave on schedule.' },
        { focus: 'Today', verse: { text: 'Therefore do not worry about tomorrow, for tomorrow will worry about itself.', reference: 'Matthew 6:34' }, prompt: 'What is one true, small good about right now you could name out loud?', reflection: 'Today is allowed to be small and still sacred. One true good is enough to anchor you.' },
        { focus: 'Cast', verse: { text: 'Cast all your anxiety on him because he cares for you.', reference: '1 Peter 5:7' }, prompt: 'Pick one worry. Say it to God in a sentence. You do not have to fix it in the same breath.', reflection: 'Casting is not magic—it is handing the weight to hands that do not tire the way yours do.' }
      ]
    },

    // ── JUNE ──
    {
      title: 'The God Who Sees',
      subtitle: 'You are not invisible to the one who made you',
      days: [
        { focus: 'Seen', verse: { text: "She gave this name to the Lord who spoke to her: 'You are the God who sees me.'", reference: 'Genesis 16:13' }, prompt: 'Where do you feel most overlooked—and what would it change to remember you are seen?', reflection: 'Invisible is a feeling, not a fact. Being seen starts with telling the truth about where you feel overlooked.' },
        { focus: 'Known', verse: { text: 'Lord, you have examined me and you know me. You know when I sit and when I rise; you perceive my thoughts from afar.', reference: 'Psalm 139:1–2' }, prompt: 'God knows your thoughts without you editing them. Does that feel safe—or scary today?', reflection: 'Known is intimate—and intimacy can feel risky. God\'s knowing is not surveillance; it is companionship without a mask.' },
        { focus: 'Cared For', verse: { text: 'Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?', reference: 'Matthew 6:26' }, prompt: 'Do you believe God pays attention to the small stuff of your life? What makes that hard?', reflection: 'Care is not measured only by outcomes. Sometimes it looks like ordinary provision you almost called coincidence.' },
        { focus: 'Named', verse: { text: 'Fear not, for I have redeemed you; I have summoned you by name; you are mine.', reference: 'Isaiah 43:1' }, prompt: 'What would shift if you heard “mine” over your name—not possessive, protective?', reflection: 'Named is personal. Let it land as protection, not possession—someone is keeping watch on your story.' },
        { focus: 'Present', verse: { text: 'Where can I go from your Spirit? Where can I flee from your presence?', reference: 'Psalm 139:7' }, prompt: 'Where do you feel most alone? Try picturing God sitting there with you—no speech required.', reflection: 'Presence is not always a feeling. Sometimes it is the decision to stay in the room with your life when you want to flee.' }
      ]
    },
    {
      title: 'Pruning and Growth',
      subtitle: 'What gets cut away makes room for what matters',
      days: [
        { focus: 'Release', verse: { text: 'He cuts off every branch in me that bears no fruit, while every branch that does bear fruit he prunes so that it will be even more fruitful.', reference: 'John 15:2' }, prompt: 'What feels like it is being trimmed right now—and can you imagine room for something healthier?', reflection: 'Letting go of what does not belong is not loss only. It is space—real space—for something healthier to grow.' },
        { focus: 'Discomfort', verse: { text: 'No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace.', reference: 'Hebrews 12:11' }, prompt: 'Where is discomfort asking for honesty—not heroics, honesty?', reflection: 'Discomfort is not always punishment. Sometimes it is growth refusing to wear a disguise anymore.' },
        { focus: 'Less', verse: { text: 'He must become greater; I must become less.', reference: 'John 3:30' }, prompt: 'What needs to get smaller so love can get bigger—image, hurry, a habit?', reflection: 'Less ego does not mean less you. It means more room for love to move without getting snagged on your image.' },
        { focus: 'Refine', verse: { text: 'See, I have refined you, though not as silver; I have tested you in the furnace of affliction.', reference: 'Isaiah 48:10' }, prompt: 'What did a hard season show you about what you actually want to become?', reflection: 'Refining fire is not a metaphor for cruelty. It is heat applied with intent—so you do not stay stuck in what shrinks you.' },
        { focus: 'Fruitful', verse: { text: 'Remain in me, as I also remain in you. No branch can bear fruit by itself; it must remain in the vine.', reference: 'John 15:4' }, prompt: 'What helps you stay connected to God this month—in plain, practical terms?', reflection: 'Fruit is proof of connection, not hustle. Stay close; the branch does not force the vine.' }
      ]
    },
    {
      title: 'Forgiveness as Freedom',
      subtitle: 'The person you free most is yourself',
      days: [
        { focus: 'Receive', verse: { text: 'As far as the east is from the west, so far has he removed our transgressions from us.', reference: 'Psalm 103:12' }, prompt: 'Is there something you still punish yourself for that God has already forgiven?', reflection: 'Receiving forgiveness is harder when you still enjoy punishing yourself. Mercy starts as permission, not a feeling.' },
        { focus: 'Extend', verse: { text: 'For if you forgive other people when they sin against you, your heavenly Father will also forgive you.', reference: 'Matthew 6:14' }, prompt: 'Who is hardest to forgive—and what is staying bitter costing your body and sleep?', reflection: 'Forgiving someone else is not pretending it did not hurt. It is refusing to let their choice keep writing your inner script.' },
        { focus: 'Self', verse: { text: 'There is now no condemnation for those who are in Christ Jesus.', reference: 'Romans 8:1' }, prompt: 'What do you still replay with shame? Say it once to God without defending yourself.', reflection: 'Shame loves the word always. Grace interrupts with one true sentence you can build from.' },
        { focus: 'Process', verse: { text: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.', reference: 'Ephesians 4:32' }, prompt: 'Forgiveness is usually a road, not a door you walk through once. Where are you on it?', reflection: 'Forgiveness is a road, not a door you sprint through once. Walk it honestly—stumbling still counts as walking.' },
        { focus: 'Freedom', verse: { text: 'It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery.', reference: 'Galatians 5:1' }, prompt: 'What would feel lighter by Friday if you stopped carrying one old grudge—or one old verdict on yourself?', reflection: 'Freedom is what happens when you stop volunteering for a prison you already have the key to leave.' }
      ]
    },
    {
      title: 'Sabbath and Delight',
      subtitle: 'Rest is not earned — it is given',
      days: [
        { focus: 'Stop', verse: { text: 'By the seventh day God had finished the work he had been doing; so on the seventh day he rested from all his work.', reference: 'Genesis 2:2' }, prompt: 'When did you last stop—not to reload for more work, just to stop?', reflection: 'Stopping is not laziness if it returns you to God. Rest is resistance to the lie that you are only what you produce.' },
        { focus: 'Delight', verse: { text: 'Take delight in the Lord, and he will give you the desires of your heart.', reference: 'Psalm 37:4' }, prompt: 'What actually delights you with no productivity attached? When did you last touch it?', reflection: 'Delight is not irresponsible joy. It is remembering your heart was made for more than maintenance mode.' },
        { focus: 'Play', verse: { text: 'A cheerful heart is good medicine, but a crushed spirit dries up the bones.', reference: 'Proverbs 17:22' }, prompt: 'What does play look like for you now—and could you schedule a small slice?', reflection: 'Play is not childish. It is how humans remember they are alive without earning the moment.' },
        { focus: 'Receive', verse: { text: 'In vain you rise early and stay up late, toiling for food to eat — for he grants sleep to those he loves.', reference: 'Psalm 127:2' }, prompt: 'Do you treat rest like something you earn? What if it were a gift you could receive?', reflection: 'Sleep is not a treat you earn. It is a kindness your body requires—and God already counted on it.' },
        { focus: 'Holy', verse: { text: 'Remember the Sabbath day by keeping it holy.', reference: 'Exodus 20:8' }, prompt: 'What would a real day of rest look like for you—and what would you need to say no to?', reflection: 'Holy is not sterile. It is set apart—meaning your rest can be sacred without being perfect.' }
      ]
    },

    // ── JULY ──
    {
      title: 'Walking in the Light',
      subtitle: 'Integrity is who you are when no one is watching',
      days: [
        { focus: 'Integrity', verse: { text: 'Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out.', reference: 'Proverbs 10:9' }, prompt: 'Where is there a split between public you and private you—and what would one step toward alignment look like?', reflection: 'Integrity is expensive in the short term and peaceful in the long term. Choose the quiet alignment.' },
        { focus: 'Honesty', verse: { text: 'Instead, speaking the truth in love, we will grow to become in every respect the mature body of him who is the head, that is, Christ.', reference: 'Ephesians 4:15' }, prompt: 'Where are you smoothing the truth—with yourself, God, or someone specific?', reflection: 'Truth in love is not bluntness. It is clarity without using someone else\'s dignity as collateral.' },
        { focus: 'Hidden', verse: { text: "Nothing in all creation is hidden from God's sight. Everything is uncovered and laid bare before the eyes of him to whom we must give account.", reference: 'Hebrews 4:13' }, prompt: 'What are you spending energy to hide that might be easier in the light?', reflection: 'Hidden things grow in the dark. Light is not shame—it is air for what needs to heal.' },
        { focus: 'Light', verse: { text: 'You are the light of the world. A town built on a hill cannot be hidden.', reference: 'Matthew 5:14' }, prompt: 'What would “light” look like in your actual Tuesday—in one concrete behavior?', reflection: 'Light is not performance. It is one concrete choice that matches what you say you believe.' },
        { focus: 'Conscience', verse: { text: 'So I strive always to keep my conscience clear before God and man.', reference: 'Acts 24:16' }, prompt: 'Is anything nagging at you that wants a simple next step—not a whole life overhaul?', reflection: 'A clear conscience is not perfection. It is the absence of the one thing you keep postponing that you already know is right.' }
      ]
    },
    {
      title: 'Humility as Strength',
      subtitle: 'The quiet power of not needing to be first',
      days: [
        { focus: 'Lower', verse: { text: 'Humble yourselves before the Lord, and he will lift you up.', reference: 'James 4:10' }, prompt: 'Where does protecting your image cost you closeness or growth?', reflection: 'Lowering your guard is not self-erasure. It is refusing to spend your whole life defending a version of you that is exhausted.' },
        { focus: 'Serve', verse: { text: 'For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.', reference: 'Mark 10:45' }, prompt: 'When did you last help someone with no chance of credit?', reflection: 'Service is not a personality contest. It is love with shoes on—small, repeatable, real.' },
        { focus: 'Listen', verse: { text: 'Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves.', reference: 'Philippians 2:3' }, prompt: 'In your last hard conversation, did you listen to understand—or wait to reply?', reflection: 'Listening is a form of respect you can practice even when you disagree. It changes the air in the room.' },
        { focus: 'Teachable', verse: { text: 'Let the wise listen and add to their learning, and let the discerning get guidance.', reference: 'Proverbs 1:5' }, prompt: 'Where have you gone stiff toward feedback? What would softness look like?', reflection: 'Teachable is not naive. It is courage to keep growing when ego wants to freeze you as the smartest person present.' },
        { focus: 'Meek', verse: { text: 'Blessed are the meek, for they will inherit the earth.', reference: 'Matthew 5:5' }, prompt: 'Meekness is strength with a gentle grip. Where could you use more of that this week?', reflection: 'Meekness is strength with a gentle grip. It is power that does not need to dominate to feel real.' }
      ]
    },
    {
      title: 'Living Generously',
      subtitle: 'Abundance is a posture, not an amount',
      days: [
        { focus: 'Open Hands', verse: { text: 'Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap.', reference: 'Luke 6:38' }, prompt: 'Where are your hands tightest—time, money, energy, affection?', reflection: 'Open hands reveal what you actually trust. Tight fists are usually fear wearing a responsible costume.' },
        { focus: 'Enough', verse: { text: 'And God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work.', reference: '2 Corinthians 9:8' }, prompt: 'Do you give from “there is enough” or “there is never enough”—and where did that story start?', reflection: 'Enough is not a number on a spreadsheet. It is a posture—and postures can be practiced before the bank account agrees.' },
        { focus: 'Invisible', verse: { text: 'But when you give to the needy, do not let your left hand know what your right hand is doing.', reference: 'Matthew 6:3' }, prompt: 'What is one kind thing you could do this week that stays between you and God?', reflection: 'Invisible kindness still counts. Some of the best work you will ever do has no audience.' },
        { focus: 'Attention', verse: { text: 'Do not neglect to do good and to share what you have, for such sacrifices are pleasing to God.', reference: 'Hebrews 13:16' }, prompt: 'Whose need have you noticed and quietly walked past?', reflection: 'Attention is generosity too. Who gets yours by default—and who needs it on purpose?' },
        { focus: 'Cheerful', verse: { text: 'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.', reference: '2 Corinthians 9:7' }, prompt: 'Obligation or joy—which feels closer when you give right now?', reflection: 'Cheerful giving is not forced positivity. It is freedom from the panic that says you cannot afford to be kind.' }
      ]
    },
    {
      title: "Trusting God's Timing",
      subtitle: 'His delays are not his denials',
      days: [
        { focus: 'Wait', verse: { text: 'I wait for the Lord, my whole being waits, and in his word I put my hope.', reference: 'Psalm 130:5' }, prompt: 'What are you waiting on—and are you waiting with softness or with clenched jaw?', reflection: 'Waiting exposes what you trust. Soft waiting is not passive—it is refusing to panic your way into control.' },
        { focus: 'Not Yet', verse: { text: 'He has made everything beautiful in its time.', reference: 'Ecclesiastes 3:11' }, prompt: 'What is clearly “not yet”—and what might that be teaching you about pace?', reflection: 'Not yet is not never. It is time doing work you cannot see from this angle.' },
        { focus: 'His Ways', verse: { text: "For my thoughts are not your thoughts, neither are your ways my ways, declares the Lord.", reference: 'Isaiah 55:8' }, prompt: 'Where is God’s path confusing you? Can you stay in the room with not knowing?', reflection: 'God\'s ways being higher is not a brush-off. It is an invitation to stop demanding the map and still stay in the car.' },
        { focus: 'Faithful', verse: { text: 'The Lord is not slow in keeping his promise, as some understand slowness. Instead he is patient with you.', reference: '2 Peter 3:9' }, prompt: 'Remember one way God showed up before. How does that memory speak to today?', reflection: 'Patience is not God being slow. Sometimes it is mercy wearing a clock.' },
        { focus: 'Now', verse: { text: 'But do not forget this one thing, dear friends: with the Lord a day is like a thousand years, and a thousand years are like a day.', reference: '2 Peter 3:8' }, prompt: 'What if the wait is doing something in you—not only withholding something from you?', reflection: 'The wait can shape you while you wait. That is not cruel—it is deeply human, and God is not afraid of it.' }
      ]
    },

    // ── AUGUST ──
    {
      title: 'The Power of Prayer',
      subtitle: 'Conversation with a God who actually listens',
      days: [
        { focus: 'Ask', verse: { text: 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.', reference: 'Matthew 7:7' }, prompt: 'What have you stopped asking God—because you felt hopeless or “not allowed”?', reflection: 'Asking is not weakness. It is admitting you are not the ceiling of what can help you.' },
        { focus: 'Honest', verse: { text: 'The Lord is near to all who call on him, to all who call on him in truth.', reference: 'Psalm 145:18' }, prompt: 'In prayer, do you say what you feel—or what sounds acceptable?', reflection: 'Honest prayer is not polished prayer. God is not grading your grammar—he is listening for truth.' },
        { focus: 'Intercede', verse: { text: 'I urge, then, first of all, that petitions, prayers, intercession and thanksgiving be made for all people.', reference: '1 Timothy 2:1' }, prompt: 'Who could use your prayers this week—even someone it is hard to pray for?', reflection: 'Intercession is love with direction. Naming someone else breaks the spell that you are the center of every storm.' },
        { focus: 'Listen', verse: { text: 'In the morning, Lord, you hear my voice; in the morning I lay my requests before you and wait expectantly.', reference: 'Psalm 5:3' }, prompt: 'Is prayer mostly talking? What would thirty seconds of quiet after you speak feel like?', reflection: 'Listening after you speak is not wasted silence. It is where prayer stops being a monologue.' },
        { focus: 'Persist', verse: { text: 'Then Jesus told his disciples a parable to show them that they should always pray and not give up.', reference: 'Luke 18:1' }, prompt: 'What request did you shelve? What if you brought it back once—without demanding an instant answer?', reflection: 'Persistence is not nagging God. It is refusing to call hope naive just because the answer is slow.' }
      ]
    },
    {
      title: 'Enough',
      subtitle: 'What you have is more than you think',
      days: [
        { focus: 'Contentment', verse: { text: 'I have learned, in whatever state I am, to be content.', reference: 'Philippians 4:11' }, prompt: 'Contentment is practiced. What is teaching you that practice right now?', reflection: 'Contentment is trained, not stumbled into. It grows where gratitude gets practiced without waiting for ideal conditions.' },
        { focus: 'Comparison', verse: { text: 'We do not dare to classify or compare ourselves with some who commend themselves. When they measure themselves by themselves and compare themselves with themselves, they are not wise.', reference: '2 Corinthians 10:12' }, prompt: 'Who do you measure yourself against—and what are you really hungry for underneath?', reflection: 'Comparison is a thief that steals today to pay for a fantasy ranking. Name what you actually want underneath it.' },
        { focus: 'Simplicity', verse: { text: 'But godliness with contentment is great gain. For we brought nothing into the world, and we can take nothing out of it.', reference: '1 Timothy 6:6–7' }, prompt: 'What could you need a little less of—and what would that open up?', reflection: 'Simplicity is not poverty cosplay. It is choosing enough on purpose so your life has margin for what matters.' },
        { focus: 'Manna', verse: { text: 'Give us today our daily bread.', reference: 'Matthew 6:11' }, prompt: 'Can you ask for today’s bread without rehearsing next week’s worry?', reflection: 'Daily bread is today-sized on purpose. Let that shrink the panic without shrinking your faith.' },
        { focus: 'Gratitude', verse: { text: 'The Lord is my shepherd, I lack nothing.', reference: 'Psalm 23:1' }, prompt: 'Right now, what do you already have—three things, even tiny ones?', reflection: 'Naming three true goods is not denial. It is giving your nervous system something real to stand on.' }
      ]
    },
    {
      title: 'Spiritual Disciplines',
      subtitle: 'The small practices that slowly change everything',
      days: [
        { focus: 'Scripture', verse: { text: 'Your word is a lamp for my feet, a light on my path.', reference: 'Psalm 119:105' }, prompt: 'How is Scripture actually shaping your choices this week—or how is it not showing up?', reflection: 'Scripture is not magic ink. It is a steady voice when your inner noise gets loud.' },
        { focus: 'Fasting', verse: { text: 'But when you fast, put oil on your head and wash your face, so that it will not be obvious to others that you are fasting.', reference: 'Matthew 6:17–18' }, prompt: 'What could you step back from for a short window—noise, scrolling, hurry—to make a little room?', reflection: 'Fasting from noise can be as holy as fasting from food. What you subtract often reveals what you were using as anesthesia.' },
        { focus: 'Worship', verse: { text: 'Worship the Lord with gladness; come before him with joyful songs.', reference: 'Psalm 100:2' }, prompt: 'Where does worship happen for you outside of a song list?', reflection: 'Worship is not only music. It is truth spoken back to God with your whole self—not only the pretty parts.' },
        { focus: 'Community', verse: { text: 'They devoted themselves to the apostles\' teaching and to fellowship, to the breaking of bread and to prayer.', reference: 'Acts 2:42' }, prompt: 'Who is walking faith with you in a way that feels honest—not perfect, honest?', reflection: 'Community is a discipline because isolation is easy. Show up again; depth is rarely accidental.' },
        { focus: 'Practice', verse: { text: 'Train yourself to be godly. For physical training is of some value, but godliness has value for all things.', reference: '1 Timothy 4:7–8' }, prompt: 'What habit has helped you most—and what are you quietly nudged to return to?', reflection: 'Practice sounds boring until you realize it is how freedom stops being a slogan and becomes a body habit.' }
      ]
    },
    {
      title: 'Suffering and Meaning',
      subtitle: 'Pain is not wasted in the hands of God',
      days: [
        { focus: 'Lament', verse: { text: 'My God, my God, why have you forsaken me? Why are you so far from saving me, so far from my cries of anguish?', reference: 'Psalm 22:1' }, prompt: 'What hurt still needs air—you have been carrying it quietly?', reflection: 'Lament is holy speech. God is not allergic to pain—he entered it.' },
        { focus: 'Not Alone', verse: { text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me.', reference: 'Psalm 23:4' }, prompt: 'In a dark stretch, have you ever sensed you were not alone? What was that like?', reflection: 'The valley is not proof God left. It is often where language for comfort finally matches reality.' },
        { focus: 'Meaning', verse: { text: 'And we know that in all things God works for the good of those who love him.', reference: 'Romans 8:28' }, prompt: 'Is there an old pain where you can see—even a little—something good that grew?', reflection: 'Meaning does not erase pain. It refuses to call pain meaningless without your consent.' },
        { focus: 'Character', verse: { text: 'We also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope.', reference: 'Romans 5:3–4' }, prompt: 'What did a hard season grow in you that ease probably would not have?', reflection: 'Character is not a trophy. It is what remains when comfort is removed and you still choose integrity.' },
        { focus: 'Hope', verse: { text: 'I consider that our present sufferings are not worth comparing with the glory that will be revealed in us.', reference: 'Romans 8:18' }, prompt: 'Does “later glory” help today’s pain—or feel far away? Either answer is allowed.', reflection: 'Hope for later does not shame today\'s ache. Hold both without forcing them to compete.' }
      ]
    },

    // ── SEPTEMBER ──
    {
      title: 'New Seasons',
      subtitle: 'Change is an invitation, not only a loss',
      days: [
        { focus: 'Transition', verse: { text: 'There is a time for everything, and a season for every activity under the heavens.', reference: 'Ecclesiastes 3:1' }, prompt: 'What are you leaving—and what are you walking toward?', reflection: 'Transitions are grief and invitation in the same envelope. Name what you are leaving so you can receive what is next.' },
        { focus: 'Grief', verse: { text: 'Those who sow with tears will reap with songs of joy.', reference: 'Psalm 126:5' }, prompt: 'What needs a goodbye before you can say hello to what is next?', reflection: 'Some doors only close so your hands can open for what needs holding now.' },
        { focus: 'New', verse: { text: 'Forget the former things; do not dwell on the past. See, I am doing a new thing!', reference: 'Isaiah 43:18–19' }, prompt: 'Where are you clinging to the old script because the new one feels risky?', reflection: 'New does not mean erased. It means you are allowed to grow a story that includes both regret and courage.' },
        { focus: 'Courage', verse: { text: 'Be strong and courageous. Do not be afraid or terrified, for the Lord your God goes with you.', reference: 'Deuteronomy 31:6' }, prompt: 'What does the next season ask of you that feels a size too big?', reflection: 'Courage in a new season is often quiet. It looks like showing up without a script.' },
        { focus: 'Trust', verse: { text: 'And surely I am with you always, to the very end of the age.', reference: 'Matthew 28:20' }, prompt: 'What stays true when a lot around you does not? Let one anchor be enough for today.', reflection: 'What stays true when a lot shifts is not small. Anchor there before you demand fresh fireworks.' }
      ]
    },
    {
      title: 'The Heart of Worship',
      subtitle: 'Life is worship — every ordinary moment',
      days: [
        { focus: 'Everything', verse: { text: 'So whether you eat or drink or whatever you do, do it all for the glory of God.', reference: '1 Corinthians 10:31' }, prompt: 'What everyday thing today could you do with God—not performance, presence?', reflection: 'Ordinary moments are not beneath God. They are where incarnation keeps proving true.' },
        { focus: 'Surrender', verse: { text: 'Therefore, I urge you, brothers and sisters, in view of God\'s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God — this is your true and proper worship.', reference: 'Romans 12:1' }, prompt: 'A living sacrifice is awake, not erased. Where does offering yourself feel costly right now?', reflection: 'A living sacrifice is awake, not erased. Worship includes your limits—not in spite of them.' },
        { focus: 'Awe', verse: { text: 'The heavens declare the glory of God; the skies proclaim the work of his hands.', reference: 'Psalm 19:1' }, prompt: 'When did awe last stop you mid-step—sky, music, kindness, a kid’s laugh?', reflection: 'Awe is not constant goosebumps. It is noticing—really noticing—what is already holy in plain sight.' },
        { focus: 'Sacrifice', verse: { text: 'Through Jesus, therefore, let us continually offer to God a sacrifice of praise — the fruit of lips that openly profess his name.', reference: 'Hebrews 13:15' }, prompt: 'When praise does not match your mood, can you still say one true thing about God?', reflection: 'Praise on a hard day is not denial. It is choosing one true thing about God louder than the fear loop.' },
        { focus: 'Present', verse: { text: 'God is spirit, and his worshipers must worship in the Spirit and in truth.', reference: 'John 4:24' }, prompt: 'Spirit and truth means honest, not polished. What would honest worship sound like from you today?', reflection: 'Spirit and truth is honesty over polish. Bring what you have, not what you wish you had.' }
      ]
    },
    {
      title: 'Boundaries and Wholeness',
      subtitle: 'Saying no to some things is saying yes to what matters',
      days: [
        { focus: 'Limits', verse: { text: 'He who guards his mouth and his tongue keeps himself from calamity.', reference: 'Proverbs 21:23' }, prompt: 'Where do you need a clearer edge—time, words, energy, access to you?', reflection: 'A guarded mouth is not coldness. It is protection for a heart that has been running without brakes.' },
        { focus: 'No', verse: { text: "All you need to say is simply 'Yes' or 'No'; anything beyond this comes from the evil one.", reference: 'Matthew 5:37' }, prompt: 'What yes is draining you that a kind no could protect?', reflection: 'No is not cruelty when it protects a yes that matters. Limits are how love stays sustainable.' },
        { focus: 'Guilt', verse: { text: 'Am I now trying to win the approval of human beings, or of God? Or am I trying to please people? If I were still trying to please people, I would not be a servant of Christ.', reference: 'Galatians 1:10' }, prompt: 'Where are you choosing to keep peace with everyone except yourself?', reflection: 'People-pleasing is expensive. It borrows from your sleep and returns anxiety as change.' },
        { focus: 'Wholeness', verse: { text: 'May God himself, the God of peace, sanctify you through and through. May your whole spirit, soul and body be kept blameless.', reference: '1 Thessalonians 5:23' }, prompt: 'What does “whole” feel like in your body today—and what is one fragment you could name without fixing it?', reflection: 'Wholeness includes your body\'s signals. Ignoring them is not spirituality—it is neglect wearing a halo.' },
        { focus: 'Rest', verse: { text: 'In repentance and rest is your salvation, in quietness and trust is your strength.', reference: 'Isaiah 30:15' }, prompt: 'What boundary would guard sleep or quiet—and what stops you from setting it?', reflection: 'Rest guarded by a boundary is still rest. Say the sentence you keep postponing.' }
      ]
    },
    {
      title: 'Grief and Grace',
      subtitle: 'You are allowed to feel the weight of loss',
      days: [
        { focus: 'Permission', verse: { text: 'Blessed are those who mourn, for they will be comforted.', reference: 'Matthew 5:4' }, prompt: 'Have you let yourself grieve the losses—even the ones other people might call small?', reflection: 'Permission to mourn is not wallowing. It is refusing to call your pain immature for existing.' },
        { focus: 'Tears', verse: { text: 'Jesus wept.', reference: 'John 11:35' }, prompt: 'Jesus cried in public. What does it change to know God is not allergic to sorrow?', reflection: 'Tears are not evidence God left. They are evidence you are human—and God is not afraid of human.' },
        { focus: 'Time', verse: { text: 'There is a time to weep and a time to laugh, a time to mourn and a time to dance.', reference: 'Ecclesiastes 3:4' }, prompt: 'Are you rushing grief—or stuck in it? Neither needs a lecture, just honesty.', reflection: 'Grief has its own pace. Rushing looks strong; honoring looks like healing that lasts.' },
        { focus: 'Comforter', verse: { text: 'Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles.', reference: '2 Corinthians 1:3–4' }, prompt: 'What would receiving comfort look like—not muscling through, receiving?', reflection: 'Comfort is not a lecture. It is presence that does not demand you tidy the story first.' },
        { focus: 'Hope', verse: { text: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.', reference: 'Revelation 21:4' }, prompt: 'Does a future “no more tears” comfort you today, feel far away, or both?', reflection: 'Hope for no more tears can sit beside today\'s tears. Both can be true without racing each other.' }
      ]
    },

    // ── OCTOBER ──
    {
      title: 'Darkness and Dawn',
      subtitle: 'The night does not last forever',
      days: [
        { focus: 'Dark Night', verse: { text: 'Even the darkness will not be dark to you; the night will shine like the day, for darkness is as light to you.', reference: 'Psalm 139:12' }, prompt: 'If you are in a dim season spiritually, what has been one rope you held anyway?', reflection: 'Dark night faith is still faith. It is choosing to stay in the room when the feelings are not cooperating.' },
        { focus: 'Morning', verse: { text: 'His anger lasts only a moment, but his favor lasts a lifetime; weeping may stay for the night, but rejoicing comes in the morning.', reference: 'Psalm 30:5' }, prompt: 'Where are you waiting for morning—a shift, a breath of relief?', reflection: 'Morning does not always arrive on your schedule. It still arrives—sometimes as one inch of light you almost miss.' },
        { focus: 'Candle', verse: { text: 'Your word is a lamp for my feet, a light on my path.', reference: 'Psalm 119:105' }, prompt: 'You only need light for the next step. What is that step today?', reflection: 'You only need light for the next step. Demand the whole map and you will freeze; take the step and the path widens.' },
        { focus: 'Presence', verse: { text: "If I say, 'Surely the darkness will hide me and the light become night around me,' even the darkness will not be dark to you.", reference: 'Psalm 139:11–12' }, prompt: 'Where does God feel hidden? What if presence can be real before it feels clear?', reflection: 'Hidden is not the same as absent. Some presences are real before they feel clear.' },
        { focus: 'Dawn', verse: { text: "The Lord's lovingkindnesses never cease, for his compassions never fail. They are new every morning; great is your faithfulness.", reference: 'Lamentations 3:22–23' }, prompt: 'Mercy this morning is not something you earned. What would it feel like to receive that?', reflection: 'Mercy this morning is not earned. Receive it like oxygen—simple, necessary, not a prize.' }
      ]
    },
    {
      title: 'Faith in the Ordinary',
      subtitle: 'The sacred hides in plain sight',
      days: [
        { focus: 'Ordinary', verse: { text: 'The Lord was in this place, and I was not aware of it.', reference: 'Genesis 28:16' }, prompt: 'Where might God be hiding in plain sight in your normal Tuesday stuff?', reflection: 'Sacred hides in plain sight because God is not allergic to normal days. Look again—slower this time.' },
        { focus: 'Burning Bush', verse: { text: "So Moses thought, 'I will go over and see this strange sight — why the bush does not burn up.'", reference: 'Exodus 3:3' }, prompt: 'What everyday detail might deserve a second look—not dramatic, just curious?', reflection: 'Curiosity is a spiritual practice. Wonder is not childish; it is humility with eyes open.' },
        { focus: 'Faithful Small', verse: { text: 'Whoever can be trusted with very little can also be trusted with much.', reference: 'Luke 16:10' }, prompt: 'What small repeat task is actually care in disguise?', reflection: 'Small faithfulness is not a consolation prize. It is how most good lives are built—quietly, repeatedly.' },
        { focus: 'Incarnation', verse: { text: 'The Word became flesh and made his dwelling among us.', reference: 'John 1:14' }, prompt: 'God showed up in a body, in a neighborhood. What does that say about your ordinary places?', reflection: 'Incarnation means God is not only interested in mountaintops. Your kitchen counts.' },
        { focus: 'Now', verse: { text: 'This is the day the Lord has made; we will rejoice and be glad in it.', reference: 'Psalm 118:24' }, prompt: 'Name one concrete gift about today—not sentimental, specific.', reflection: 'Naming one concrete gift is not sentimental. It is training your attention to tell the truth.' }
      ]
    },
    {
      title: 'Wholehearted Living',
      subtitle: 'Not a perfect life — a fully alive one',
      days: [
        { focus: 'Whole', verse: { text: 'Love the Lord your God with all your heart and with all your soul and with all your mind and with all your strength.', reference: 'Mark 12:30' }, prompt: 'Where are you half present—going through motions, holding back?', reflection: 'Half presence is exhausting because you are paying twice—once for the moment, once for the mask.' },
        { focus: 'Alive', verse: { text: 'I have come that they may have life, and have it to the full.', reference: 'John 10:10' }, prompt: 'When do you feel most awake—and when was the last time?', reflection: 'Alive is not loud. It is honest energy that matches your real capacity without apology.' },
        { focus: 'Risk', verse: { text: 'For whoever wants to save their life will lose it, but whoever loses their life for me will find it.', reference: 'Matthew 16:25' }, prompt: 'If fear of looking foolish stepped aside for an hour, what would you try?', reflection: 'Risk is not recklessness. It is refusing to let fear be the only voice with a vote.' },
        { focus: 'Passion', verse: { text: 'Whatever your hand finds to do, do it with all your might.', reference: 'Ecclesiastes 9:10' }, prompt: 'What gets your full energy right now—and what deserves a little more of you?', reflection: 'Passion without gentleness burns people. Channel it toward what you can sustain without disappearing.' },
        { focus: 'Freedom', verse: { text: 'It is for freedom that Christ has set us free.', reference: 'Galatians 5:1' }, prompt: 'Where do you feel most free—and where does tightness come from, God or fear?', reflection: 'Freedom is not doing whatever you want. It is not being owned by what you thought you needed to be.' }
      ]
    },
    {
      title: 'Redemption Stories',
      subtitle: 'God specializes in the unredeemable',
      days: [
        { focus: 'Broken', verse: { text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.', reference: 'Psalm 34:18' }, prompt: 'Where are you cracked open right now—and can you let God be close there?', reflection: 'Broken is not the final word. It is the honest starting place where God likes to show up.' },
        { focus: 'Restored', verse: { text: 'I will repay you for the years the locusts have eaten.', reference: 'Joel 2:25' }, prompt: 'What lost years still ache—and can you hold hope without rushing a timeline?', reflection: 'Restored does not mean erased. It means the story keeps going—and going can be mercy.' },
        { focus: 'Redeemed', verse: { text: 'And we know that in all things God works for the good of those who love him.', reference: 'Romans 8:28' }, prompt: 'Is there a hard chapter that has already started to change shape? What do you notice?', reflection: 'Hard chapters can change shape. Notice where the narrative loosened without demanding a trophy.' },
        { focus: 'Testimony', verse: { text: 'They triumphed over him by the blood of the Lamb and by the word of their testimony.', reference: 'Revelation 12:11' }, prompt: 'What part of your story might encourage one person if you told it simply?', reflection: 'Testimony is not performance. It is one true sentence that might light a match in someone else\'s dark room.' },
        { focus: 'New', verse: { text: "He who was seated on the throne said, 'I am making everything new!'", reference: 'Revelation 21:5' }, prompt: 'If God is making things new—including you—what is one area you would hand him first?', reflection: 'New includes you—not a fantasy version, you. Hand him the part you are tired of performing.' }
      ]
    },

    // ── NOVEMBER ──
    {
      title: 'Thankfulness as Resistance',
      subtitle: 'Gratitude refuses to let darkness have the last word',
      days: [
        { focus: 'Resistance', verse: { text: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.', reference: '1 Thessalonians 5:18' }, prompt: 'What makes thanks feel impossible right now—and is there still one small true thing you can name?', reflection: 'Thanks in hard circumstances is not denial. It is refusing to let darkness be the only narrator.' },
        { focus: 'Remember', verse: { text: 'Praise the Lord, my soul, and forget not all his benefits.', reference: 'Psalm 103:2' }, prompt: 'Looking back a year, where do you see goodness you missed while it was happening?', reflection: 'Memory can be medicine when it is honest. Name a goodness you almost forgot—you are allowed to keep it.' },
        { focus: 'Enough', verse: { text: 'I am not saying this because I am in need, for I have learned to be content whatever the circumstances.', reference: 'Philippians 4:11' }, prompt: 'Where do you already have enough—even if it does not match the picture in your head?', reflection: 'Enough is not pretending you have everything. It is noticing what is present before you chase what is missing.' },
        { focus: 'Praise', verse: { text: 'I will extol the Lord at all times; his praise will always be on my lips.', reference: 'Psalm 34:1' }, prompt: 'What would praise sound like today as trust—not as mood?', reflection: 'Praise as trust sounds quieter than panic. It is still a decision—and decisions stack.' },
        { focus: 'Joy', verse: { text: 'Rejoice in the Lord always. I will say it again: Rejoice!', reference: 'Philippians 4:4' }, prompt: 'Joy is deeper than a good mood. Where does joy still find you when life is heavy?', reflection: 'Joy deeper than mood is not fake happiness. It is a stubborn refusal to call your whole life a mistake.' }
      ]
    },
    {
      title: 'Peace in the Storm',
      subtitle: "Calm is possible even when everything isn't",
      days: [
        { focus: 'Storm', verse: { text: "He got up, rebuked the wind and said to the waves, 'Quiet! Be still!' Then the wind died down and it was completely calm.", reference: 'Mark 4:39' }, prompt: 'What storm is loudest—inside you, between people, or in circumstances?', reflection: 'Storms are not proof you failed. They are weather—and weather is allowed to be loud.' },
        { focus: 'Anchor', verse: { text: 'We have this hope as an anchor for the soul, firm and secure.', reference: 'Hebrews 6:19' }, prompt: 'What do you reach for when waves rise—and is it holding?', reflection: 'An anchor is only useful when the boat is moving. Hold anyway; slipping does not mean you are not held.' },
        { focus: 'Breathe', verse: { text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.', reference: 'John 14:27' }, prompt: 'Jesus’s peace is not the same as “everything fixed.” What would receiving that look like today?', reflection: 'Peace is not the same as control. It is a different kind of steadiness when the waves keep arguing.' },
        { focus: 'Trust', verse: { text: 'You will keep in perfect peace those whose minds are steadfast, because they trust in you.', reference: 'Isaiah 26:3' }, prompt: 'Where is your mind racing—and what is one true sentence you could return to?', reflection: 'A steadied mind is not a blank mind. It is one true sentence returned to again and again.' },
        { focus: 'Still', verse: { text: 'Be still, and know that I am God.', reference: 'Psalm 46:10' }, prompt: 'Could you be still for one minute—not to fix, just to be with God?', reflection: 'Stillness is not doing nothing forever. It is sixty seconds of refusing to outrun your own soul.' }
      ]
    },
    {
      title: 'The Gift of Weakness',
      subtitle: 'Your limits are not your enemies',
      days: [
        { focus: 'Weakness', verse: { text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.'", reference: '2 Corinthians 12:9' }, prompt: 'What limit embarrasses you—and what if God met you right there?', reflection: 'Weakness is not the opposite of strength. It is the place where strength stops being a performance.' },
        { focus: 'Depend', verse: { text: 'I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.', reference: 'John 15:5' }, prompt: 'Where does “I’ve got this” quietly cut you off from help—from God or people?', reflection: 'Independence can be armor. Dependency on God is not weakness—it is reality with better support.' },
        { focus: 'Boast', verse: { text: 'Therefore I will boast all the more gladly about my weaknesses, so that Christ\'s power may rest on me.', reference: '2 Corinthians 12:9' }, prompt: 'What if one weakness you hide became a place people saw grace—not perfection?', reflection: 'Boasting in weakness is not self-hatred. It is refusing to let shame be the only story about your limits.' },
        { focus: 'Human', verse: { text: 'He knows how we are formed, he remembers that we are dust.', reference: 'Psalm 103:14' }, prompt: 'God remembers you are dust. Are you asking yourself to be steel?', reflection: 'Dust is not an insult. It is honesty—and honesty is where gentleness finally fits.' },
        { focus: 'Enough', verse: { text: 'My grace is sufficient for you.', reference: '2 Corinthians 12:9' }, prompt: '“Sufficient” means enough for today. Can you let that be true for this hour?', reflection: 'Enough for this hour is not a small promise. It is the size most humans actually live in.' }
      ]
    },
    {
      title: 'Advent: Waiting and Longing',
      subtitle: 'Hope is what we do while we wait',
      days: [
        { focus: 'Longing', verse: { text: 'My soul yearns, even faints, for the courts of the Lord; my heart and my flesh cry out for the living God.', reference: 'Psalm 84:2' }, prompt: 'What do you want most right now—and have you said it plainly to God?', reflection: 'Longing is not ingratitude. It is hunger—and hunger means you are alive enough to want.' },
        { focus: 'Prepare', verse: { text: 'Prepare the way for the Lord, make straight paths for him.', reference: 'Matthew 3:3' }, prompt: 'What clutter in your heart might need a clear path—not perfection, space?', reflection: 'Prepare the way is mostly clearing clutter. Make space, not a press release.' },
        { focus: 'Hope', verse: { text: 'May the God of hope fill you with all joy and peace as you trust in him.', reference: 'Romans 15:13' }, prompt: 'Where has hope slipped—and what is one way you could pick it up gently?', reflection: 'Hope is not certainty. It is showing up again while the answer is still quiet.' },
        { focus: 'Come', verse: { text: 'Come, Lord Jesus.', reference: 'Revelation 22:20' }, prompt: 'What would “come, Lord Jesus” mean for you this week—not slogan, prayer?', reflection: 'Come is a prayer, not a demand for a timetable. Say it plain.' },
        { focus: 'Light', verse: { text: 'The people walking in darkness have seen a great light; on those living in the land of deep darkness a light has dawned.', reference: 'Isaiah 9:2' }, prompt: 'Where would a little more light help most today?', reflection: 'Light can be small and still true. Notice the inch before you dismiss it.' }
      ]
    },

    // ── DECEMBER ──
    {
      title: 'The Incarnation',
      subtitle: 'God came close — closer than you think',
      days: [
        { focus: 'With Us', verse: { text: "The virgin will conceive and give birth to a son, and they will call him Immanuel (which means 'God with us').", reference: 'Matthew 1:23' }, prompt: 'What does “with us” mean for you this week—in your kitchen, your worry, your commute?', reflection: 'With us is not a slogan. It is God choosing proximity over distance—your ordinary included.' },
        { focus: 'Ordinary', verse: { text: 'And she gave birth to her firstborn, a son. She wrapped him in cloths and placed him in a manger, because there was no guest room available for them.', reference: 'Luke 2:7' }, prompt: 'God showed up in a crowded, plain night. Where might he be showing up in your unglamorous places?', reflection: 'A manger is not romantic only. It is God refusing to wait for a stage before showing up.' },
        { focus: 'Surprise', verse: { text: 'But you, Bethlehem Ephrathah, though you are small among the clans of Judah, out of you will come for me one who will be ruler over Israel.', reference: 'Micah 5:2' }, prompt: 'What small corner of your life might God be quietly working in—easy to overlook?', reflection: 'Surprise is often small. Watch the corners you wrote off as too insignificant for holy.' },
        { focus: 'Receive', verse: { text: 'Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.', reference: 'John 1:12' }, prompt: 'How open are you to receiving—not only agreeing about—Jesus? What would you need to let in?', reflection: 'Receiving is harder when you are used to earning belonging. Let it be a gift anyway.' },
        { focus: 'Joy', verse: { text: "But the angel said to them, 'Do not be afraid. I bring you good news that will cause great joy for all the people.'", reference: 'Luke 2:10' }, prompt: 'Does faith feel joyful for you lately—or heavy? No right answer, just true.', reflection: 'Joy can be quiet. It still counts when it arrives as relief instead of fireworks.' }
      ]
    },
    {
      title: 'Reflection and Renewal',
      subtitle: 'The year is ending — what will you carry forward?',
      days: [
        { focus: 'Look Back', verse: { text: 'I remember the days of long ago; I meditate on all your works and consider what your hands have done.', reference: 'Psalm 143:5' }, prompt: 'As the year thins out, where do you see God’s fingerprints most clearly on your story?', reflection: 'Looking back is not nostalgia only. It is how you notice patterns without being ruled by them.' },
        { focus: 'Grieve', verse: { text: 'There is a time to weep and a time to laugh, a time to mourn and a time to dance.', reference: 'Ecclesiastes 3:4' }, prompt: 'What loss from this year still deserves a name—not a fix, a name?', reflection: 'Grief for a year is not weakness. It is love with nowhere to go yet—name it kindly.' },
        { focus: 'Gratitude', verse: { text: 'Give thanks to the Lord, for he is good; his love endures forever.', reference: 'Psalm 107:1' }, prompt: 'What are you thankful for from this year—even if it came through something hard?', reflection: 'Gratitude does not erase hard. It refuses to let hard be the only true thing you remember.' },
        { focus: 'Release', verse: { text: 'Forget the former things; do not dwell on the past.', reference: 'Isaiah 43:18' }, prompt: 'What do you need to set down—a regret, a grudge, an old expectation?', reflection: 'Release is not forgetting. It is deciding you will not keep paying interest on what is already over.' },
        { focus: 'Forward', verse: { text: 'See, I am doing a new thing! Now it springs up; do you not perceive it?', reference: 'Isaiah 43:19' }, prompt: 'One word or intention for what is next—what feels honest, not impressive?', reflection: 'Forward can be one honest word. Let it be small enough to carry.' }
      ]
    },
    {
      title: 'Peace on Earth',
      subtitle: 'The shalom we long for begins inside us',
      days: [
        { focus: 'Shalom', verse: { text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives.', reference: 'John 14:27' }, prompt: 'World peace often means “no tension.” Jesus’s peace can exist in the middle of it. Which are you chasing?', reflection: 'Shalom is bigger than calm feelings. It is wholeness—and wholeness includes truth, not only quiet.' },
        { focus: 'Reconcile', verse: { text: 'For he himself is our peace, who has made the two groups one and has destroyed the barrier, the dividing wall of hostility.', reference: 'Ephesians 2:14' }, prompt: 'What relationship is frayed—and what is one low-risk step toward peace?', reflection: 'Peace with people is sometimes one humble step. You cannot control the echo; you can control your tone.' },
        { focus: 'Inner', verse: { text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.', reference: 'Philippians 4:7' }, prompt: 'Inner peace is not zero problems. What would a settled soul feel like for you today?', reflection: 'Inner peace is not a mood ring. It is a guardrail you return to when the world spikes the volume.' },
        { focus: 'Peacemaker', verse: { text: 'Blessed are the peacemakers, for they will be called children of God.', reference: 'Matthew 5:9' }, prompt: 'Where could you bring calm without pretending—home, work, a group chat?', reflection: 'Peacemaking costs something. It is still cheaper than long war in your own chest.' },
        { focus: 'Rest', verse: { text: 'Return to your rest, my soul, for the Lord has been good to you.', reference: 'Psalm 116:7' }, prompt: 'Can you bring your soul back to rest for a moment—what would help it land?', reflection: 'Return is a verb. Your soul can come back to rest without having every answer first.' }
      ]
    },
    {
      title: 'Into the New Year',
      subtitle: 'Another beginning — another chance to begin again',
      days: [
        { focus: 'New', verse: { text: 'See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.', reference: 'Isaiah 43:19' }, prompt: 'What new thing feels like it might be stirring—not hype, a nudge?', reflection: 'New is not a demand to reinvent overnight. It is permission to take the next step without the old script.' },
        { focus: 'One Thing', verse: { text: 'But one thing I do: forgetting what is behind and straining toward what is ahead.', reference: 'Philippians 3:13' }, prompt: 'If you picked one intention for the year—spirit, relationships, health of soul—what would it be?', reflection: 'One thing forward is not small. It is how humans actually change—without a montage.' },
        { focus: 'Faithful', verse: { text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.", reference: 'Lamentations 3:22–23' }, prompt: 'Mercy is new in the morning. What mercy do you want to meet you in January?', reflection: 'Morning mercy is not earned by a perfect December. It meets you because it is morning.' },
        { focus: 'Together', verse: { text: 'And surely I am with you always, to the very end of the age.', reference: 'Matthew 28:20' }, prompt: 'You do not walk into unknown days alone. What does “with you” change about tomorrow?', reflection: 'With you is not a metaphor for loneliness only. It is company for the unknown days ahead.' },
        { focus: 'Begin', verse: { text: 'Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us.', reference: 'Hebrews 12:1' }, prompt: 'What would running your race well look like—not someone else’s highlight reel, yours?', reflection: 'Your race is not their highlight reel. Faithfulness looks ordinary until you stop comparing.' }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : this);
