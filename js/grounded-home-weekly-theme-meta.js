/**
 * Merges summary, intro, anchorVerse, closingPrayer, themeCompleteLine, and hook into
 * GROUNDED_HOME_WEEKLY_THEMES_52 before weekly-themes.js builds WEEKLY_THEMES.
 */
(function (g) {
  'use strict';
  var arr = g.GROUNDED_HOME_WEEKLY_THEMES_52;
  if (!arr || !arr.length) return;

  var META = [
    {
      summary:
        "You're not starting from zero—God is still writing. Each dawn is an open door; you don't have to prove yesterday first.",
      intro:
        'This week invites you to trust that God is still writing your story. You can release the pressure to have everything figured out and lean into mercy that meets you in small, honest beginnings. Inner work here is less about fixing and more about letting yourself be re-formed.',
      anchorVerse: { text: 'See, I am doing a new thing! Now it springs up; do you not perceive it?', reference: 'Isaiah 43:19' },
      closingPrayer:
        'God of new mornings, thank you for the ways you met me in this week of beginning again. Hold what stirred in me; carry it gently into what comes next. Amen.',
      themeCompleteLine: 'Every small yes to starting again was sacred ground.',
      hook: 'This week is about beginning again without pretending you have it all figured out.'
    },
    {
      summary:
        "Rest isn't something you earn. It's something God offers you right now.",
      intro:
        'This week is about learning God’s pace in a hurried world. Rest is not laziness; it is a way of trusting that you are held. You will practice stillness, release, and receiving — the inner work of letting your soul catch up with your body.',
      anchorVerse: { text: 'Be still, and know that I am God.', reference: 'Psalm 46:10' },
      closingPrayer:
        'Lord, thank you for teaching me rest this week. Quiet what remains restless in me, and help me carry your gentleness forward. Amen.',
      themeCompleteLine: 'The rest you reached for this week still counts.',
      hook: 'This week is about receiving God’s pace when the world keeps speeding up.'
    },
    {
      summary:
        'You were named beloved before you performed a single line. Let what is true about you speak kinder than the voice that grades you.',
      intro:
        'This week returns you to who you are in God — beloved, made, known, enough. Inner work here names the noise that tells you otherwise and lets truth speak more kindly than your fear. You are invited to live from identity, not performance.',
      anchorVerse: { text: 'See what great love the Father has lavished on us, that we should be called children of God.', reference: '1 John 3:1' },
      closingPrayer:
        'Father, thank you for reminding me who I am in you. Root me deeper in your love as I step into a new week. Amen.',
      themeCompleteLine: 'You were never an afterthought to God’s love.',
      hook: 'This week is about coming home to who you are with God—not who you perform to be.'
    },
    {
      summary:
        "God isn't fragile with your truth. Bring the messy sentence—you don't have to polish it before you pray it.",
      intro:
        'This week makes room for honesty before God — lament, doubt, confession, and openness. Inner work here is not polishing your faith but bringing your whole self into the light where healing begins. God is near to truth, not only to tidy answers.',
      anchorVerse: { text: 'The Lord is near to all who call on him, to all who call on him in truth.', reference: 'Psalm 145:18' },
      closingPrayer:
        'God, thank you for receiving my honest heart this week. Keep me brave enough to stay true with you. Amen.',
      themeCompleteLine: 'Truth told in love is a kind of homecoming.',
      hook: 'This week is about telling God the truth—mess and all—and staying close.'
    },
    {
      summary:
        "Love isn't only a feeling you wait for. It's a choice you practice where nobody is keeping score.",
      intro:
        'This week treats love as a practice — something chosen in ordinary moments, not only felt in peaks. You will explore receiving, giving, patience, and depth. Inner work here softens the edges that make love conditional and opens your hands again.',
      anchorVerse: { text: 'We love because he first loved us.', reference: '1 John 4:19' },
      closingPrayer:
        'Jesus, thank you for loving me first. Shape my loves this week into something truer and freer. Amen.',
      themeCompleteLine: 'Love practiced in small ways still changes the room.',
      hook: 'This week is about choosing love in ordinary moments—not only when it comes easily.'
    },
    {
      summary:
        "You don't need the full map to move. Faith is one honest step while the fog is still there.",
      intro:
        'This week walks with you through uncertainty — waiting, anchoring, surrendering outcomes you cannot see. Inner work here builds faith that feels like steadiness rather than denial. God asks for trust one breath at a time, not perfect clarity.',
      anchorVerse: { text: 'Now faith is confidence in what we hope for and assurance about what we do not see.', reference: 'Hebrews 11:1' },
      closingPrayer:
        'Lord, you see what I cannot. Thank you for meeting me in the unknown; hold me as I release what is not mine to control. Amen.',
      themeCompleteLine: 'Faith in the unseen is still a light in the room.',
      hook: 'This week is about staying steady when you cannot see around the bend.'
    },
    {
      summary:
        "God isn't allergic to your tender places. Naming the hurt is how light gets a door in.",
      intro:
        'This week lets God into tender places — grief, forgiveness, healing, restoration. Inner work here refuses to rush past pain and refuses to stay stuck in it. You are invited to name what hurts and let compassion touch it gently.',
      anchorVerse: { text: 'He heals the brokenhearted and binds up their wounds.', reference: 'Psalm 147:3' },
      closingPrayer:
        'God of healing, thank you for sitting with me in what hurt this week. Continue the work you began in my heart. Amen.',
      themeCompleteLine: 'What you let God see, he can tend with care.',
      hook: 'This week is about letting God into the tender places—gently, honestly.'
    },
    {
      summary:
        'What you rehearse in private becomes what you reach for in public. The quiet is not neutral—it is forming you.',
      intro:
        'This week tends the inner life — attention, renewal, fruit, roots, quiet. Inner work here guards what grows beneath the surface because everything else flows from it. You will practice noticing what your heart is feeding on and choosing what gives life.',
      anchorVerse: { text: 'Above all else, guard your heart, for everything you do flows from it.', reference: 'Proverbs 4:23' },
      closingPrayer:
        'Spirit, thank you for shaping my inner world this week. Keep my heart soft toward you and honest with myself. Amen.',
      themeCompleteLine: 'Quiet tending of the heart is never wasted.',
      hook: 'This week is about noticing what is growing beneath the surface of your days.'
    },
    {
      summary:
        "Fear doesn't get the last vote unless you feed it silence. Say it once out loud—you already moved.",
      intro:
        'This week names fear without letting it name you. Courage, presence, and small steps forward matter more than bravado. Inner work here is learning that perfect love casts fear — not all at once, but in faithful, gentle increments.',
      anchorVerse: { text: 'When I am afraid, I put my trust in you.', reference: 'Psalm 56:3' },
      closingPrayer:
        'God, thank you for being with me in fear this week. Strengthen what felt weak and remind me I do not walk alone. Amen.',
      themeCompleteLine: 'Courage often looked like staying present.',
      hook: 'This week is about naming fear and taking the next small step anyway.'
    },
    {
      summary:
        "You don't need a perfect week to name what's true. One honest good rebuilds your eyes faster than denial.",
      intro:
        'This week trains gratitude as a way of seeing — noticing, remembering, shifting toward what is true and good. Inner work here is not toxic positivity; it is choosing light without lying about the dark. Small thanks become a wider lens.',
      anchorVerse: { text: 'Give thanks in all circumstances; for this is God’s will for you in Christ Jesus.', reference: '1 Thessalonians 5:18' },
      closingPrayer:
        'Lord, thank you for the gifts I almost missed this week. Open my eyes to keep seeing with gratitude. Amen.',
      themeCompleteLine: 'Gratitude practiced in hard weeks is especially brave.',
      hook: 'This week is about training your eyes to notice what is already good.'
    },
    {
      summary:
        "Open hands aren't careless. They're honest about what was never yours to guarantee alone.",
      intro:
        'This week practices open hands — releasing control, timelines, and outcomes you were never meant to carry alone. Inner work here is trust in motion: naming attachments and choosing surrender without shame. God meets a loosened grip with steadiness.',
      anchorVerse: { text: 'Cast all your anxiety on him because he cares for you.', reference: '1 Peter 5:7' },
      closingPrayer:
        'God, thank you for catching what I released this week. Keep teaching me the freedom of open hands. Amen.',
      themeCompleteLine: 'Letting go with God is not losing — it is being held.',
      hook: 'This week is about releasing what you cannot control—and trusting you are held.'
    },
    {
      summary:
        "You can't pour from a voice that trashes you all day. Receive gentleness first—then it has somewhere to come from.",
      intro:
        'This week begins compassion at home in your own soul. You cannot pour from an empty cup; grace received becomes grace extended. Inner work here names shame, limits, and the need to receive kindness before you force yourself to give it.',
      anchorVerse: { text: 'Therefore, there is now no condemnation for those who are in Christ Jesus.', reference: 'Romans 8:1' },
      closingPrayer:
        'Jesus, thank you for compassion that reached me first. Help me live from that same gentleness toward myself and others. Amen.',
      themeCompleteLine: 'The compassion you needed this week was holy work.',
      hook: 'This week is about receiving kindness for yourself so it can reach others too.'
    },
    {
      summary:
        "Dead ends aren't always conclusions. God keeps writing—even when the page feels blank.",
      intro:
        'This week walks resurrection themes — death to old ways, new creation, hope that does not pretend pain is small. Inner work here believes God specializes in what felt finished. You are invited to notice where life is quietly returning.',
      anchorVerse: { text: 'I am the resurrection and the life. The one who believes in me will live, even though they die.', reference: 'John 11:25' },
      closingPrayer:
        'Lord of life, thank you for every sign of renewal this week. Raise in me what you desire to live. Amen.',
      themeCompleteLine: 'Hope that rises slowly is still resurrection work.',
      hook: 'This week is about hope for what felt finished—and life quietly returning.'
    },
    {
      summary:
        'You only get this hour for real. Come back to now—this is where God actually meets you.',
      intro:
        'This week grounds you in the present — here, breath, enough for today. Inner work here resists living only in memory or anxiety about tomorrow. God meets you in this day; sacredness hides in plain sight when you arrive.',
      anchorVerse: { text: 'This is the day the Lord has made; we will rejoice and be glad in it.', reference: 'Psalm 118:24' },
      closingPrayer:
        'God, thank you for the gift of now. Help me stay present with you as this week closes and another begins. Amen.',
      themeCompleteLine: 'Showing up for today was its own kind of faith.',
      hook: 'This week is about landing in today instead of living only in yesterday or tomorrow.'
    },
    {
      summary:
        "Abundance isn't a balance—it's a posture. Open hands show what you actually trust.",
      intro:
        'This week opens generosity of spirit — time, words, presence, and self-forgetful love. Inner work here examines scarcity stories and practices abundance rooted in God’s character. Giving becomes joy when it flows from received grace.',
      anchorVerse: { text: 'Whoever is kind to the poor lends to the Lord, and he will reward them for what they have done.', reference: 'Proverbs 19:17' },
      closingPrayer:
        'Father, thank you for enlarging my heart this week. Keep my hands open and my motives pure. Amen.',
      themeCompleteLine: 'Generosity practiced in secret still pleases God.',
      hook: 'This week is about open hands—with time, words, and attention.'
    },
    {
      summary:
        "Faithfulness rarely goes viral. It's the quiet repeat—and God doesn't rush the work he's doing in you.",
      intro:
        'This week honors slow growth — process, seasons, perseverance. Inner work here releases the shame of not being “there yet” and celebrates faithfulness in small things. God finishes what he starts; your part is staying connected.',
      anchorVerse: { text: 'Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.', reference: 'Philippians 1:6' },
      closingPrayer:
        'Lord, thank you for patience with my pace this week. Keep me faithful in the next small step. Amen.',
      themeCompleteLine: 'Growth you cannot yet see is still underway.',
      hook: 'This week is about faithfulness in slow, small steps—not instant arrival.'
    },
    {
      summary:
        "Withdrawal with Jesus isn't escape — it's return to what is real.",
      intro:
        'This week values silence and solitude as soul-shaping gifts. Inner work here turns down the volume of performance and listens for God’s voice. Withdrawal with Jesus is not escape; it is return to what is real.',
      anchorVerse: { text: 'But Jesus often withdrew to lonely places and prayed.', reference: 'Luke 5:16' },
      closingPrayer:
        'God, thank you for quiet spaces with you this week. Speak in the silence I make room for. Amen.',
      themeCompleteLine: 'Silence offered to God is a holy conversation.',
      hook: 'This week is about making space to hear God beyond the noise.'
    },
    {
      summary:
        "You weren't built to lug everything solo. One honest connection shrinks shame faster than scrolling.",
      intro:
        'This week remembers we are made for connection — repair, vulnerability, presence. Inner work here resists isolation as default and asks who God might be placing in your path. Healing often travels through relationship.',
      anchorVerse: { text: 'And let us consider how we may spur one another on toward love and good deeds.', reference: 'Hebrews 10:24' },
      closingPrayer:
        'Lord, thank you for people who reflect your care this week. Make me a safe presence for others too. Amen.',
      themeCompleteLine: 'Love that showed up in community still matters.',
      hook: 'This week is about connection—repair, honesty, and simply showing up.'
    },
    {
      summary:
        "What you do isn't proof you're worthy. Ordinary work offered honestly still counts as sacred.",
      intro:
        'This week integrates faith and work — purpose, limits, fruit that comes from remaining in the vine. Inner work here refuses to split sacred and secular and asks what faithfulness looks like in your actual tasks.',
      anchorVerse: { text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.', reference: 'Colossians 3:23' },
      closingPrayer:
        'God, thank you for meeting me in my work this week. Let what I do be offered to you with integrity. Amen.',
      themeCompleteLine: 'Ordinary work offered to God is never small worship.',
      hook: 'This week is about what you do flowing from who you are with God.'
    },
    {
      summary:
        "You don't have to be calm to be held. God meets you in the middle of it.",
      intro:
        'This week holds anxiety and peace together honestly — naming worry, inviting God’s peace that guards heart and mind. Inner work here is not pretending calm but practicing presence with what is true. You are held while you feel.',
      anchorVerse: { text: 'Cast all your anxiety on him because he cares for you.', reference: '1 Peter 5:7' },
      closingPrayer:
        'Jesus, thank you for carrying what anxious thoughts I gave you this week. Keep my heart steadied in your care. Amen.',
      themeCompleteLine: 'Peace can be a quiet rhythm, not a performance.',
      hook: 'This week is about being held even when you are not calm.'
    },
    {
      summary:
        "Invisible is a feeling—not a fact. You're seen before you perform.",
      intro:
        'This week rests in the God who sees — your hidden labor, your unseen grief, your ordinary days. Inner work here believes attention from heaven changes how you walk on earth. You are named, known, and not alone.',
      anchorVerse: { text: "She gave this name to the Lord who spoke to her: 'You are the God who sees me.'", reference: 'Genesis 16:13' },
      closingPrayer:
        'God who sees me, thank you for every moment I felt noticed by you this week. Let that truth go with me. Amen.',
      themeCompleteLine: 'Being seen by God is enough to light the path.',
      hook: 'This week is about remembering you are not invisible to the one who made you.'
    },
    {
      summary:
        'What gets cut back still hurts—and still makes room. God trims so fruit can breathe.',
      intro:
        'This week welcomes pruning as love — less of what drains, more fruit that lasts. Inner work here trusts discomfort that produces depth and stays connected to the vine when branches feel bare.',
      anchorVerse: { text: 'He cuts off every branch in me that bears no fruit, while every branch that does bear fruit he prunes so that it will be even more fruitful.', reference: 'John 15:2' },
      closingPrayer:
        'Good gardener, thank you for tending me this week. Prune what needs to go and grow what bears life. Amen.',
      themeCompleteLine: 'What felt like loss may have been room for fruit.',
      hook: 'This week is about trusting what is being trimmed to make room for what lasts.'
    },
    {
      summary:
        "Forgiveness isn't pretending it didn't hurt. It's refusing to let their choice keep drafting your inner script.",
      intro:
        'This week walks forgiveness as freedom — receiving God’s mercy, extending it, forgiving yourself. Inner work here names what keeps you bound and chooses release without pretending harm was small. Freedom is for the brave.',
      anchorVerse: { text: 'It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery.', reference: 'Galatians 5:1' },
      closingPrayer:
        'Lord, thank you for freedom begun in me this week. Deepen forgiveness where it is still hard. Amen.',
      themeCompleteLine: 'Forgiveness walked slowly is still a path toward light.',
      hook: 'This week is about loosening what has kept you stuck—starting with mercy for you.'
    },
    {
      summary:
        "Rest isn't a prize for finishing. It's written into your body—receive it like oxygen.",
      intro:
        'This week practices Sabbath and delight — stopping, receiving rest as gift, remembering you are not a machine. Inner work here resists guilt for needing pause and learns holy rhythms that honor your humanity.',
      anchorVerse: { text: 'By the seventh day God had finished the work he had been doing; so on the seventh day he rested from all his work.', reference: 'Genesis 2:2' },
      closingPrayer:
        'God, thank you for rest that was not earned but given this week. Teach me to receive without shame. Amen.',
      themeCompleteLine: 'Rest that honored your limits was faithful, not lazy.',
      hook: 'This week is about rest and delight as gifts—not prizes you have to earn.'
    },
    {
      summary:
        "Integrity isn't a spotlight moment. It's the quiet match between private you and public you.",
      intro:
        'This week chooses integrity and light — alignment between private and public self. Inner work here invites honesty before God and courage to live without double lives. Light is kinder than hiding.',
      anchorVerse: { text: 'You are the light of the world. A town built on a hill cannot be hidden.', reference: 'Matthew 5:14' },
      closingPrayer:
        'Lord, thank you for truth that frees this week. Keep me walking in light with you. Amen.',
      themeCompleteLine: 'Integrity grown in quiet is strength that lasts.',
      hook: 'This week is about alignment—who you are in private and who you are in public.'
    },
    {
      summary:
        "You don't have to be first to be real. Lowering your guard isn't erasure—it's room for love.",
      intro:
        'This week explores humility as strength — serving, listening, becoming teachable. Inner work here lowers defenses that protect image and raises hands that receive help. Jesus shows the way down is the way up.',
      anchorVerse: { text: 'Humble yourselves before the Lord, and he will lift you up.', reference: 'James 4:10' },
      closingPrayer:
        'Jesus, thank you for humility that heals this week. Lift others through the low places I walk with you. Amen.',
      themeCompleteLine: 'Humility practiced in secret still changes the heart.',
      hook: 'This week is about strength that does not need to be first or loudest.'
    },
    {
      summary:
        "Enough isn't a spreadsheet line—it's a posture. Practice it before fear talks you out of it.",
      intro:
        'This week lives generously from abundance in God — open hands, cheerful giving, attention to hidden needs. Inner work here loosens scarcity’s grip and practices joy in blessing without needing credit.',
      anchorVerse: { text: 'Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap.', reference: 'Luke 6:38' },
      closingPrayer:
        'Father, thank you for trust enough to give this week. Keep my heart open and my motives clean. Amen.',
      themeCompleteLine: 'Generosity flows best from received grace.',
      hook: 'This week is about abundance as a posture—not a number in your account.'
    },
    {
      summary:
        "'Not yet' isn't never. His pace holds mercy you can't read from this angle.",
      intro:
        'This week trusts God’s timing over your own — waiting, mystery, faithfulness in delay. Inner work here releases the story you demanded and receives the one God is writing. His pace is love, not neglect.',
      anchorVerse: { text: 'He has made everything beautiful in its time.', reference: 'Ecclesiastes 3:11' },
      closingPrayer:
        'Lord, thank you for patience with my impatience this week. Align my heart with your timing. Amen.',
      themeCompleteLine: 'Waiting with God is still a kind of obedience.',
      hook: 'This week is about releasing your timeline when God’s feels slower than yours.'
    },
    {
      summary:
        "Prayer isn't performance poetry. It's one honest sentence into ears that don't tire.",
      intro:
        'This week deepens prayer as honest conversation — asking, listening, persisting. Inner work here treats God as present and kind, not distant and demanding perfection before you speak.',
      anchorVerse: { text: 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.', reference: 'Matthew 7:7' },
      closingPrayer:
        'God, thank you for hearing me this week. Keep my prayer life honest, hopeful, and close. Amen.',
      themeCompleteLine: 'Every honest prayer was heard before you stood up.',
      hook: 'This week is about honest conversation with God—no performance needed.'
    },
    {
      summary:
        "What you have can count before you chase what's missing. Contentment is trained—not stumbled into.",
      intro:
        'This week names “enough” — contentment, comparison quieted, daily bread trusted. Inner work here receives what is here without pretending longing is wrong, while anchoring identity outside achievement.',
      anchorVerse: { text: 'I have learned, in whatever state I am, to be content.', reference: 'Philippians 4:11' },
      closingPrayer:
        'Lord, thank you for teaching me enough this week. Free me from endless striving. Amen.',
      themeCompleteLine: 'Enough is a gift you can practice receiving.',
      hook: 'This week is about enoughness in a world that keeps moving the line.'
    },
    {
      summary:
        'Small repeats change more than big intentions. Practice is how freedom lands in your body.',
      intro:
        'This week builds spiritual disciplines — scripture, fasting, worship, community, practice. Inner work here treats small habits as sacred training, not legalism. God meets consistency with transformation.',
      anchorVerse: { text: 'Your word is a lamp for my feet, a light on my path.', reference: 'Psalm 119:105' },
      closingPrayer:
        'Spirit, thank you for rhythms that formed me this week. Keep me rooted in what feeds my soul. Amen.',
      themeCompleteLine: 'Small practices offered faithfully still shape a life.',
      hook: 'This week is about small rhythms that slowly reshape your days.'
    },
    {
      summary:
        "Pain doesn't have to be meaningless to hurt. God stays in the room while meaning arrives slowly.",
      intro:
        'This week holds suffering and meaning together — lament, presence of God, hope that does not rush past pain. Inner work here refuses cheap answers and stays with Jesus in the valley.',
      anchorVerse: { text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me.', reference: 'Psalm 23:4' },
      closingPrayer:
        'God, thank you for not leaving me alone in what hurt this week. Hold my pain and my hope together. Amen.',
      themeCompleteLine: 'Pain held honestly before God is never wasted.',
      hook: 'This week is about holding pain honestly while you watch for light.'
    },
    {
      summary:
        "Change can be grief and invitation at once. Name what you're leaving so your hands can open for next.",
      intro:
        'This week honors new seasons — grief for what ends, courage for what begins. Inner work here lets change be both loss and invitation, trusting God goes with you across the threshold.',
      anchorVerse: { text: 'See, I am doing a new thing! Now it springs up; do you not perceive it?', reference: 'Isaiah 43:19' },
      closingPrayer:
        'Lord, thank you for walking with me through change this week. Give courage for the next step. Amen.',
      themeCompleteLine: 'Transitions held with God become holy ground.',
      hook: 'This week is about change as both grief and invitation.'
    },
    {
      summary:
        "Worship isn't only a song list. It's your Tuesday with God attached—ordinary minutes included.",
      intro:
        'This week sees all of life as worship — ordinary moments offered, bodies as living sacrifice, awe returned. Inner work here widens worship beyond a song to a posture toward God in everything you touch.',
      anchorVerse: { text: 'So whether you eat or drink or whatever you do, do it all for the glory of God.', reference: '1 Corinthians 10:31' },
      closingPrayer:
        'Father, thank you for worship that spilled into my ordinary days this week. Receive all of me. Amen.',
      themeCompleteLine: 'Worship lived quietly still rises as praise.',
      hook: 'This week is about ordinary life offered back to God.'
    },
    {
      summary:
        "Saying no to some things is saying yes to what lasts. Limits aren't failure—they're how love stays honest.",
      intro:
        'This week practices boundaries for wholeness — limits that protect peace, honesty about capacity. Inner work here names guilt that isn’t from God and chooses clarity that loves both you and others well.',
      anchorVerse: { text: 'In repentance and rest is your salvation, in quietness and trust is your strength.', reference: 'Isaiah 30:15' },
      closingPrayer:
        'God, thank you for boundaries that freed me this week. Teach me to rest without apology. Amen.',
      themeCompleteLine: 'Saying no to some things was saying yes to peace.',
      hook: 'This week is about limits that protect what matters most.'
    },
    {
      summary:
        "You don't owe anyone a brave face for your loss. Tears are proof you're human—and God stays.",
      intro:
        'This week makes room for grief and grace — permission to mourn, tears honored, comfort received. Inner work here refuses to rush healing and lets God sit with you in the weight without fixing on demand.',
      anchorVerse: { text: 'Blessed are those who mourn, for they will be comforted.', reference: 'Matthew 5:4' },
      closingPrayer:
        'God of all comfort, thank you for sitting with my grief this week. Hold what still aches. Amen.',
      themeCompleteLine: 'Grief held in God’s presence is already a kind of healing.',
      hook: 'This week is about letting loss be real—and not walking it alone.'
    },
    {
      summary:
        "Night faith is still faith. Morning doesn't always keep your schedule—light still inches in.",
      intro:
        'This week walks from darkness toward dawn — honest nights, small lights, mercy new each morning. Inner work here does not shame you for shadows but promises God sees in the dark.',
      anchorVerse: { text: 'Weeping may stay for the night, but rejoicing comes in the morning.', reference: 'Psalm 30:5' },
      closingPrayer:
        'Lord, thank you for being light in my dark this week. Lead me toward morning. Amen.',
      themeCompleteLine: 'Dawn comes slowly — and still it comes.',
      hook: 'This week is about remembering night does not last forever.'
    },
    {
      summary:
        'Sacred hides in plain sight. Look again, slower—the holy might be wearing something mundane.',
      intro:
        'This week finds the sacred in ordinary — paying attention, faithful small things, God with us in the mundane. Inner work here trains eyes to see burning bushes in dishes, traffic, and text threads.',
      anchorVerse: { text: 'The Lord was in this place, and I was not aware of it.', reference: 'Genesis 28:16' },
      closingPrayer:
        'God, thank you for showing up in ordinary moments this week. Open my eyes again and again. Amen.',
      themeCompleteLine: 'Ordinary days can still be thick with presence.',
      hook: 'This week is about noticing God in plain, everyday places.'
    },
    {
      summary:
        'Half presence exhausts you twice. You do not need a perfect life—just a fully honest one.',
      intro:
        'This week invites wholehearted living — all of you offered, risk taken, freedom chosen. Inner work here names where you hold back and asks what love looks like if you stopped protecting image.',
      anchorVerse: { text: 'Love the Lord your God with all your heart and with all your soul and with all your mind and with all your strength.', reference: 'Mark 12:30' },
      closingPrayer:
        'Jesus, thank you for calling me to whole love this week. Keep drawing me out of half-measures. Amen.',
      themeCompleteLine: 'Wholehearted steps count, even when they feel small.',
      hook: 'This week is about showing up with your whole self—not perfect, present.'
    },
    {
      summary:
        "Broken isn't the final word—it's the honest starting line where God likes to show up.",
      intro:
        'This week trusts redemption — broken places met, years restored, testimony born from pain. Inner work here believes God specializes in stories that looked finished until grace rewrote the ending.',
      anchorVerse: { text: 'I will repay you for the years the locusts have eaten.', reference: 'Joel 2:25' },
      closingPrayer:
        'Redeeming God, thank you for hope that outlasts loss this week. Keep writing my story with mercy. Amen.',
      themeCompleteLine: 'What God redeems, he never wastes.',
      hook: 'This week is about the chapters that felt over until grace showed up.'
    },
    {
      summary:
        "Gratitude in a hard week isn't denial. It's refusing to let darkness be the only narrator.",
      intro:
        'This week practices thankfulness as resistance — gratitude that does not deny hardship but refuses despair the last word. Inner work here names one true good even when the list feels short.',
      anchorVerse: { text: 'Praise the Lord, my soul, and forget not all his benefits.', reference: 'Psalm 103:2' },
      closingPrayer:
        'Lord, thank you for benefits I remembered this week. Keep my heart grateful and honest. Amen.',
      themeCompleteLine: 'Thanks spoken in hard weeks is a quiet rebellion against despair.',
      hook: 'This week is about gratitude that does not pretend hard things are not real.'
    },
    {
      summary:
        "Peace isn't the same as control. It's steadiness while the waves keep arguing.",
      intro:
        'This week anchors peace in the storm — breath, hope as anchor, stillness with God. Inner work here does not demand calm circumstances but practices receiving peace that guards heart and mind.',
      anchorVerse: { text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives.', reference: 'John 14:27' },
      closingPrayer:
        'Jesus, thank you for peace that held me this week when waves rose. Stay near in every storm. Amen.',
      themeCompleteLine: 'Peace received in chaos is still a miracle.',
      hook: 'This week is about steadiness when life is loud around you.'
    },
    {
      summary:
        "Your limits aren't a moral failure. They're where grace stops being a slogan and becomes cover.",
      intro:
        'This week honors weakness as the place grace meets power. Inner work here stops pretending self-sufficiency and lets God’s strength rest on what you cannot fix alone.',
      anchorVerse: { text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.'", reference: '2 Corinthians 12:9' },
      closingPrayer:
        'Lord, thank you for meeting me in weakness this week. Let your strength keep showing up there. Amen.',
      themeCompleteLine: 'Weakness offered to God becomes room for grace.',
      hook: 'This week is about limits as a place you meet God—not a verdict on you.'
    },
    {
      summary:
        'Hope is what you practice while you wait—not pretending you are not hungry.',
      intro:
        'This week enters Advent longing — waiting with hope, preparing the heart, light in darkness. Inner work here names desire without shame and practices “come, Lord Jesus” as honest prayer.',
      anchorVerse: { text: 'The people walking in darkness have seen a great light; on those living in the land of deep darkness a light has dawned.', reference: 'Isaiah 9:2' },
      closingPrayer:
        'God of hope, thank you for longing that drew me to you this week. Come, Lord Jesus. Amen.',
      themeCompleteLine: 'Longing voiced in prayer is already a kind of hope.',
      hook: 'This week is about waiting, longing, and hope before the full picture arrives.'
    },
    {
      summary:
        'God came close—closer than tidy theology. Your ordinary kitchen counts as holy ground.',
      intro:
        'This week marvels at incarnation — God with us, ordinary places made holy, surprise in small things. Inner work here receives nearness: Jesus in flesh, God in the mess, love that moved into the neighborhood.',
      anchorVerse: { text: "The virgin will conceive and give birth to a son, and they will call him Immanuel (which means 'God with us').", reference: 'Matthew 1:23' },
      closingPrayer:
        'Immanuel, thank you for coming close this week. Stay with me in every ordinary place. Amen.',
      themeCompleteLine: 'God-with-us changes how you walk through the day.',
      hook: 'This week is about God coming close—closer than distance or a tidy idea.'
    },
    {
      summary:
        "The year thins out—look back without being ruled by it. What you name can finally move.",
      intro:
        'This week reflects and renews — looking back with honesty, grieving, giving thanks, releasing, stepping forward. Inner work here honors a year’s weight without getting stuck and asks what you carry with blessing into what’s next.',
      anchorVerse: { text: 'See, I am doing a new thing! Now it springs up; do you not perceive it?', reference: 'Isaiah 43:19' },
      closingPrayer:
        'Lord, thank you for walking through this year with me. Bless what I carry forward; free what I release. Amen.',
      themeCompleteLine: 'Reflection held with God becomes gentle clarity.',
      hook: 'This week is about honoring the year and choosing what you carry forward.'
    },
    {
      summary:
        'Shalom is bigger than calm feelings. It starts where truth and mercy can both live.',
      intro:
        'This week seeks shalom — peace that reconciles, inner quiet, peacemaking courage. Inner work here names conflict without despair and asks how your life can make room for God’s peace to spread.',
      anchorVerse: { text: 'For he himself is our peace.', reference: 'Ephesians 2:14' },
      closingPrayer:
        'Prince of peace, thank you for stilling storms inside me this week. Use me for peace where I am sent. Amen.',
      themeCompleteLine: 'Peace pursued in truth is a gift to your own soul.',
      hook: 'This week is about inner quiet that can ripple outward into your relationships.'
    },
    {
      summary:
        "You don't need a montage to begin again. One honest next step is how humans actually change.",
      intro:
        'This week steps into a new year with hope — one intention, fresh mercy, God with you. Inner work here refuses cynicism about beginnings and asks what faithful next step looks like in your real life.',
      anchorVerse: { text: 'Because of the Lord’s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.', reference: 'Lamentations 3:22–23' },
      closingPrayer:
        'Faithful God, thank you for new mercy this week. Lead me into the year with courage and trust. Amen.',
      themeCompleteLine: 'New mornings are still held by an old faithfulness.',
      hook: 'This week is about stepping in with fresh mercy—not a fresh pile of pressure.'
    }
  ];

  for (var i = 0; i < arr.length && i < META.length; i++) {
    Object.assign(arr[i], META[i]);
  }
})(typeof window !== 'undefined' ? window : this);
