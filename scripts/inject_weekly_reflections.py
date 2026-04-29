# -*- coding: utf-8 -*-
"""Inject reflection: '...' into each day in grounded-home-weekly-themes-data.js"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / "js" / "grounded-home-weekly-themes-data.js"
lines = JS.read_text(encoding="utf-8").splitlines(keepends=True)

REFLECTIONS = [
    [
        "Starting fresh is not pretending the past did not happen. It is choosing not to let yesterday write all of today's lines.",
        "Intention is quieter than hustle. It is one honest next step instead of a whole life overhaul before you move.",
        "Trust is not a feeling you manufacture. It is a direction you practice when your hands still want to control the wheel.",
        "Surrender sounds dramatic until you notice how tired your grip is. Loosening is not quitting—it is refusing to be owned by what you cannot hold anyway.",
        "Hope does not need a five-year plan to be real. It can be a small willingness that tomorrow might hold something gentle.",
    ],
    [
        "Stillness is not a reward you earn after you deserve it. It is a door God leaves open while the world keeps shouting deadlines.",
        "Rest is not something you earn at the end of a productive day. It is something God offers you right now, before you have finished anything.",
        "Your body already knows what pace is sustainable. The question is whether you will listen before it has to shout.",
        "Some worries keep circling because you keep feeding them alone. Naming them out loud—to God or a safe person—often shrinks their volume.",
        "Receiving care can feel risky if you are used to earning everything. Let today be an experiment in letting goodness land without a performance review.",
    ],
    [
        "Beloved is not a sticker for perfect people. It is what is true before you argue yourself out of it.",
        "You were not assembled by accident. Remembering that does not inflate you—it softens the part of you that keeps auditioning for worth.",
        "Being known can feel exposing until you realize hiding is exhausting too. God already sees what you are protecting—without using it against you.",
        "Chosen is not a trophy word. It is permission to stop hustling for a seat you already have.",
        "Enough is not the absence of desire. It is the quiet relief of not having to prove you belong in order to breathe.",
    ],
    [
        "Honesty with God is not shock value. It is finally saying the thing you have been smoothing over so you do not have to carry it alone.",
        "Lament is not faithlessness. It is refusing to call pain something prettier than it is so comfort can actually find you.",
        "Doubt is not the opposite of faith. It is often the doorway where faith stops performing and starts becoming real.",
        "Confession is not groveling. It is the relief of not being the only one holding the secret.",
        "Openness is not oversharing. It is one truthful sentence where you used to only manage the narrative.",
    ],
    [
        "Receiving love can be harder than giving it—especially if you learned love had strings. Let yourself be loved first, without earning the next step.",
        "Love as a practice is not mood. It is a choice you repeat in small rooms where nobody is clapping.",
        "The way you talk to yourself becomes the background music for everything else. Change the track—not with hype, with truth that sounds like kindness.",
        "Patience is not pretending you are fine. It is staying gentle while reality moves slower than your fear wants it to.",
        "Depth grows where you stop measuring love like a transaction. Belonging is not something you prove into existence.",
    ],
    [
        "Waiting is not wasted time unless you decide it is. It can be the place where your soul learns steadiness without a guarantee taped to the fridge.",
        "Faith is not certainty dressed up in religious language. It is movement when you still cannot see the whole map.",
        "When everything feels shaky, you will grab for something. Name what you are grabbing—and ask if it can actually hold your weight.",
        "The valley is not proof you took a wrong turn. It is often where presence becomes undeniable because answers are thin.",
        "Surrender is not giving up on desire. It is admitting you were never meant to be the general manager of outcomes.",
    ],
    [
        "Acknowledging pain is not indulgence. It is the first step out of the exhausting performance of being fine.",
        "Grief does not follow a tidy schedule. Giving it language is how you stop it from leaking into everything sideways.",
        "Forgiveness is not pretending harm was okay. It is refusing to let their choice keep writing your inner script.",
        "Grace is not a lecture you endure. It is the part of God that moves toward you when you are embarrassed to be seen.",
        "Restoration is rarely a spotlight moment. Notice the small softening—it counts.",
    ],
    [
        "What you rehearse in private becomes what you reach for in public. Attention is not neutral—it is training.",
        "Renewal is not a vibe. It is slowly loosening a story about yourself that stopped fitting years ago.",
        "You are allowed to be complicated. Fruit grows in seasons; one quiet patch does not define the whole tree.",
        "Roots are boring until the storm hits. What you practice in quiet is what you have when life gets loud.",
        "Quiet is not avoidance. It is making space for something truer than the noise that keeps calling itself urgent.",
    ],
    [
        "You cannot walk through what you will not name. The first act of courage is simply admitting what you are actually afraid of.",
        "Courage is not the absence of fear. It is one small move you make while your knees still remember they can shake.",
        "Fear shrinks in honest love—not perfect love, honest love. Gentleness is not weakness; it is a safer kind of strength.",
        "Isolation makes fear louder. Let today be about remembering you were never meant to carry the whole weight alone.",
        "A tiny step still counts. God meets real capacity, not the version of you that pretends you are not tired.",
    ],
    [
        "Noticing is a discipline, not a mood. What you pay attention to slowly becomes what you believe about your life.",
        "Memory is not nostalgia only. It can be evidence that goodness showed up when you could not feel it at the time.",
        "Your mind has a default channel. Redirecting it is not toxic positivity—it is choosing what gets to grow in the soil.",
        "Your body carries you through ordinary days. Honoring that is a quiet kind of worship.",
        "Enough is not a number. It is noticing what is already here before you rush past it toward the next thing.",
    ],
    [
        "Control promises safety and delivers exhaustion. Open hands are not careless—they are honest about what was never yours to guarantee.",
        "Attachment is not love. Sometimes what you are clinging to is the illusion that you can secure your future by gripping harder.",
        "Controlling the outcome is exhausting because it was never yours to control. Today is about practicing the relief of putting it down.",
        "Timelines are tempting because they pretend uncertainty can be tamed. Seasons ask for a different kind of courage—patience without panic.",
        "Trust is not a vibe. It is the daily practice of doing the next right thing without demanding the whole script upfront.",
    ],
    [
        "The voice you use on yourself becomes the ceiling for how gentle you can be with anyone else. Start where the words are harshest.",
        "Shame loves secrecy. Naming it kindly—without defending it—often drains some of its power on contact.",
        "Limits are not failure. They are the shape of a human life that God already expected to need sleep and mercy.",
        "Receiving kindness is harder when you believe you have to earn oxygen. Let one gift land today without negotiating it away.",
        "You do not have to be full to be generous. Small overflow is still real overflow.",
    ],
    [
        "Some endings are not conclusions. They are doors that only look like walls until you stop bracing long enough to notice the draft of new air.",
        "A new story does not erase the old one. It offers you a name you can grow into without performing your way into it.",
        "Surprise is not always loud. Sometimes resurrection looks like one honest breath you did not think you could take.",
        "Transformation is often slow enough to ignore. Track one small shift before you call the season a waste.",
        "Full life is not constant fireworks. Sometimes it is permission to want what is good without apologizing for wanting.",
    ],
    [
        "Presence is not a personality trait. It is a practice of returning—again and again—to the only hour you actually have.",
        "Tomorrow will borrow whatever you give it. Today still has room for one grounded choice.",
        "Breath is the simplest proof you are here. Let that be enough for sixty seconds before you pick the worry back up.",
        "Small is not insignificant. It is how most real lives are built—one unnoticed faithful piece at a time.",
        "Attention is a limited resource. Spending it honestly is how love stops becoming a concept and becomes a life.",
    ],
    [
        "Giving is not a performance of having it all together. It is admitting you have enough to share because you are human, not infinite.",
        "Time is the clearest love language most people understand. Ten minutes of real presence is not small—it is rare.",
        "Scarcity is a story. Abundance is often noticing what is already in the room before you count what is missing.",
        "Words can build or bruise. One true sentence can change the temperature of a whole day.",
        "Humility is not erasing yourself. It is refusing to make everyone else a supporting character in your anxiety.",
    ],
    [
        "Process is not punishment. It is God refusing to finish you like a rushed project.",
        "Weariness is information, not indictment. Sometimes the faithful thing is rest, not another push.",
        "Seasons change without asking your permission. Naming yours honestly is how you stop fighting the wrong battle.",
        "Slow brightening still counts as light. Track evidence instead of demanding a fireworks receipt.",
        "Faithfulness rarely looks cinematic. It looks like showing up again when nobody is keeping score.",
    ],
    [
        "Withdrawal is not escape if it returns you to yourself. Jesus slipped away because noise can drown out what is true.",
        "Most of us are so practiced at speaking that we have forgotten how to receive. Today is about making room for what God might want to say.",
        "Wilderness sounds harsh until you remember what grows there. Dry ground is sometimes where tenderness finally gets heard.",
        "Simplicity is not aesthetic. It is removing what you added to feel safe—and discovering you still are.",
        "Being is not laziness. It is the quiet courage of letting your worth exist before you produce another thing.",
    ],
    [
        "Community is not a crowd. It is one or two people who make it safer to tell the truth.",
        "Vulnerability is not dumping. It is choosing one layer deeper where secrecy has been costing you sleep.",
        "Peace is not always possible with everyone. Sometimes it is the relief of doing your part without owning their response.",
        "Letting someone help is not weakness. It is admitting you are human in a world that pretends independence is a virtue.",
        "Presence without fixing is a rare gift. Offer it the way you wish someone would offer it to you.",
    ],
    [
        "Purpose is not a spotlight. It is the quiet alignment between what you do and who you are becoming.",
        "Faithfulness in ordinary work is not small to God. He sees what no performance review ever could.",
        "Burnout is not a badge. It is your life asking for limits before your body enforces them for you.",
        "Hustle often tries to prove you matter. Enough is the braver story: you already do, before the output arrives.",
        "Fruit grows from connection, not frenzy. Staying attached is the part you cannot skip.",
    ],
    [
        "Naming fear does not summon it. It usually shrinks it—because shame loses oxygen when you stop narrating alone.",
        "Your body keeps score even when your mind negotiates. Listening is not weakness; it is wisdom.",
        "Peace is not the absence of problems. It is a guardrail around your mind when problems refuse to leave on schedule.",
        "Today is allowed to be small and still sacred. One true good is enough to anchor you.",
        "Casting is not magic—it is handing the weight to hands that do not tire the way yours do.",
    ],
    [
        "Invisible is a feeling, not a fact. Being seen starts with telling the truth about where you feel overlooked.",
        "Known is intimate—and intimacy can feel risky. God's knowing is not surveillance; it is companionship without a mask.",
        "Care is not measured only by outcomes. Sometimes it looks like ordinary provision you almost called coincidence.",
        "Named is personal. Let it land as protection, not possession—someone is keeping watch on your story.",
        "Presence is not always a feeling. Sometimes it is the decision to stay in the room with your life when you want to flee.",
    ],
    [
        "Letting go of what does not belong is not loss only. It is space—real space—for something healthier to grow.",
        "Discomfort is not always punishment. Sometimes it is growth refusing to wear a disguise anymore.",
        "Less ego does not mean less you. It means more room for love to move without getting snagged on your image.",
        "Refining fire is not a metaphor for cruelty. It is heat applied with intent—so you do not stay stuck in what shrinks you.",
        "Fruit is proof of connection, not hustle. Stay close; the branch does not force the vine.",
    ],
    [
        "Receiving forgiveness is harder when you still enjoy punishing yourself. Mercy starts as permission, not a feeling.",
        "Forgiving someone else is not pretending it did not hurt. It is refusing to let their choice keep writing your inner script.",
        "Shame loves the word always. Grace interrupts with one true sentence you can build from.",
        "Forgiveness is a road, not a door you sprint through once. Walk it honestly—stumbling still counts as walking.",
        "Freedom is what happens when you stop volunteering for a prison you already have the key to leave.",
    ],
    [
        "Stopping is not laziness if it returns you to God. Rest is resistance to the lie that you are only what you produce.",
        "Delight is not irresponsible joy. It is remembering your heart was made for more than maintenance mode.",
        "Play is not childish. It is how humans remember they are alive without earning the moment.",
        "Sleep is not a treat you earn. It is a kindness your body requires—and God already counted on it.",
        "Holy is not sterile. It is set apart—meaning your rest can be sacred without being perfect.",
    ],
    [
        "Integrity is expensive in the short term and peaceful in the long term. Choose the quiet alignment.",
        "Truth in love is not bluntness. It is clarity without using someone else's dignity as collateral.",
        "Hidden things grow in the dark. Light is not shame—it is air for what needs to heal.",
        "Light is not performance. It is one concrete choice that matches what you say you believe.",
        "A clear conscience is not perfection. It is the absence of the one thing you keep postponing that you already know is right.",
    ],
    [
        "Lowering your guard is not self-erasure. It is refusing to spend your whole life defending a version of you that is exhausted.",
        "Service is not a personality contest. It is love with shoes on—small, repeatable, real.",
        "Listening is a form of respect you can practice even when you disagree. It changes the air in the room.",
        "Teachable is not naive. It is courage to keep growing when ego wants to freeze you as the smartest person present.",
        "Meekness is strength with a gentle grip. It is power that does not need to dominate to feel real.",
    ],
    [
        "Open hands reveal what you actually trust. Tight fists are usually fear wearing a responsible costume.",
        "Enough is not a number on a spreadsheet. It is a posture—and postures can be practiced before the bank account agrees.",
        "Invisible kindness still counts. Some of the best work you will ever do has no audience.",
        "Attention is generosity too. Who gets yours by default—and who needs it on purpose?",
        "Cheerful giving is not forced positivity. It is freedom from the panic that says you cannot afford to be kind.",
    ],
    [
        "Waiting exposes what you trust. Soft waiting is not passive—it is refusing to panic your way into control.",
        "Not yet is not never. It is time doing work you cannot see from this angle.",
        "God's ways being higher is not a brush-off. It is an invitation to stop demanding the map and still stay in the car.",
        "Patience is not God being slow. Sometimes it is mercy wearing a clock.",
        "The wait can shape you while you wait. That is not cruel—it is deeply human, and God is not afraid of it.",
    ],
    [
        "Asking is not weakness. It is admitting you are not the ceiling of what can help you.",
        "Honest prayer is not polished prayer. God is not grading your grammar—he is listening for truth.",
        "Intercession is love with direction. Naming someone else breaks the spell that you are the center of every storm.",
        "Listening after you speak is not wasted silence. It is where prayer stops being a monologue.",
        "Persistence is not nagging God. It is refusing to call hope naive just because the answer is slow.",
    ],
    [
        "Contentment is trained, not stumbled into. It grows where gratitude gets practiced without waiting for ideal conditions.",
        "Comparison is a thief that steals today to pay for a fantasy ranking. Name what you actually want underneath it.",
        "Simplicity is not poverty cosplay. It is choosing enough on purpose so your life has margin for what matters.",
        "Daily bread is today-sized on purpose. Let that shrink the panic without shrinking your faith.",
        "Naming three true goods is not denial. It is giving your nervous system something real to stand on.",
    ],
    [
        "Scripture is not magic ink. It is a steady voice when your inner noise gets loud.",
        "Fasting from noise can be as holy as fasting from food. What you subtract often reveals what you were using as anesthesia.",
        "Worship is not only music. It is truth spoken back to God with your whole self—not only the pretty parts.",
        "Community is a discipline because isolation is easy. Show up again; depth is rarely accidental.",
        "Practice sounds boring until you realize it is how freedom stops being a slogan and becomes a body habit.",
    ],
    [
        "Lament is holy speech. God is not allergic to pain—he entered it.",
        "The valley is not proof God left. It is often where language for comfort finally matches reality.",
        "Meaning does not erase pain. It refuses to call pain meaningless without your consent.",
        "Character is not a trophy. It is what remains when comfort is removed and you still choose integrity.",
        "Hope for later does not shame today's ache. Hold both without forcing them to compete.",
    ],
    [
        "Transitions are grief and invitation in the same envelope. Name what you are leaving so you can receive what is next.",
        "Some doors only close so your hands can open for what needs holding now.",
        "New does not mean erased. It means you are allowed to grow a story that includes both regret and courage.",
        "Courage in a new season is often quiet. It looks like showing up without a script.",
        "What stays true when a lot shifts is not small. Anchor there before you demand fresh fireworks.",
    ],
    [
        "Ordinary moments are not beneath God. They are where incarnation keeps proving true.",
        "A living sacrifice is awake, not erased. Worship includes your limits—not in spite of them.",
        "Awe is not constant goosebumps. It is noticing—really noticing—what is already holy in plain sight.",
        "Praise on a hard day is not denial. It is choosing one true thing about God louder than the fear loop.",
        "Spirit and truth is honesty over polish. Bring what you have, not what you wish you had.",
    ],
    [
        "A guarded mouth is not coldness. It is protection for a heart that has been running without brakes.",
        "No is not cruelty when it protects a yes that matters. Limits are how love stays sustainable.",
        "People-pleasing is expensive. It borrows from your sleep and returns anxiety as change.",
        "Wholeness includes your body's signals. Ignoring them is not spirituality—it is neglect wearing a halo.",
        "Rest guarded by a boundary is still rest. Say the sentence you keep postponing.",
    ],
    [
        "Permission to mourn is not wallowing. It is refusing to call your pain immature for existing.",
        "Tears are not evidence God left. They are evidence you are human—and God is not afraid of human.",
        "Grief has its own pace. Rushing looks strong; honoring looks like healing that lasts.",
        "Comfort is not a lecture. It is presence that does not demand you tidy the story first.",
        "Hope for no more tears can sit beside today's tears. Both can be true without racing each other.",
    ],
    [
        "Dark night faith is still faith. It is choosing to stay in the room when the feelings are not cooperating.",
        "Morning does not always arrive on your schedule. It still arrives—sometimes as one inch of light you almost miss.",
        "You only need light for the next step. Demand the whole map and you will freeze; take the step and the path widens.",
        "Hidden is not the same as absent. Some presences are real before they feel clear.",
        "Mercy this morning is not earned. Receive it like oxygen—simple, necessary, not a prize.",
    ],
    [
        "Sacred hides in plain sight because God is not allergic to normal days. Look again—slower this time.",
        "Curiosity is a spiritual practice. Wonder is not childish; it is humility with eyes open.",
        "Small faithfulness is not a consolation prize. It is how most good lives are built—quietly, repeatedly.",
        "Incarnation means God is not only interested in mountaintops. Your kitchen counts.",
        "Naming one concrete gift is not sentimental. It is training your attention to tell the truth.",
    ],
    [
        "Half presence is exhausting because you are paying twice—once for the moment, once for the mask.",
        "Alive is not loud. It is honest energy that matches your real capacity without apology.",
        "Risk is not recklessness. It is refusing to let fear be the only voice with a vote.",
        "Passion without gentleness burns people. Channel it toward what you can sustain without disappearing.",
        "Freedom is not doing whatever you want. It is not being owned by what you thought you needed to be.",
    ],
    [
        "Broken is not the final word. It is the honest starting place where God likes to show up.",
        "Restored does not mean erased. It means the story keeps going—and going can be mercy.",
        "Hard chapters can change shape. Notice where the narrative loosened without demanding a trophy.",
        "Testimony is not performance. It is one true sentence that might light a match in someone else's dark room.",
        "New includes you—not a fantasy version, you. Hand him the part you are tired of performing.",
    ],
    [
        "Thanks in hard circumstances is not denial. It is refusing to let darkness be the only narrator.",
        "Memory can be medicine when it is honest. Name a goodness you almost forgot—you are allowed to keep it.",
        "Enough is not pretending you have everything. It is noticing what is present before you chase what is missing.",
        "Praise as trust sounds quieter than panic. It is still a decision—and decisions stack.",
        "Joy deeper than mood is not fake happiness. It is a stubborn refusal to call your whole life a mistake.",
    ],
    [
        "Storms are not proof you failed. They are weather—and weather is allowed to be loud.",
        "An anchor is only useful when the boat is moving. Hold anyway; slipping does not mean you are not held.",
        "Peace is not the same as control. It is a different kind of steadiness when the waves keep arguing.",
        "A steadied mind is not a blank mind. It is one true sentence returned to again and again.",
        "Stillness is not doing nothing forever. It is sixty seconds of refusing to outrun your own soul.",
    ],
    [
        "Weakness is not the opposite of strength. It is the place where strength stops being a performance.",
        "Independence can be armor. Dependency on God is not weakness—it is reality with better support.",
        "Boasting in weakness is not self-hatred. It is refusing to let shame be the only story about your limits.",
        "Dust is not an insult. It is honesty—and honesty is where gentleness finally fits.",
        "Enough for this hour is not a small promise. It is the size most humans actually live in.",
    ],
    [
        "Longing is not ingratitude. It is hunger—and hunger means you are alive enough to want.",
        "Prepare the way is mostly clearing clutter. Make space, not a press release.",
        "Hope is not certainty. It is showing up again while the answer is still quiet.",
        "Come is a prayer, not a demand for a timetable. Say it plain.",
        "Light can be small and still true. Notice the inch before you dismiss it.",
    ],
    [
        "With us is not a slogan. It is God choosing proximity over distance—your ordinary included.",
        "A manger is not romantic only. It is God refusing to wait for a stage before showing up.",
        "Surprise is often small. Watch the corners you wrote off as too insignificant for holy.",
        "Receiving is harder when you are used to earning belonging. Let it be a gift anyway.",
        "Joy can be quiet. It still counts when it arrives as relief instead of fireworks.",
    ],
    [
        "Looking back is not nostalgia only. It is how you notice patterns without being ruled by them.",
        "Grief for a year is not weakness. It is love with nowhere to go yet—name it kindly.",
        "Gratitude does not erase hard. It refuses to let hard be the only true thing you remember.",
        "Release is not forgetting. It is deciding you will not keep paying interest on what is already over.",
        "Forward can be one honest word. Let it be small enough to carry.",
    ],
    [
        "Shalom is bigger than calm feelings. It is wholeness—and wholeness includes truth, not only quiet.",
        "Peace with people is sometimes one humble step. You cannot control the echo; you can control your tone.",
        "Inner peace is not a mood ring. It is a guardrail you return to when the world spikes the volume.",
        "Peacemaking costs something. It is still cheaper than long war in your own chest.",
        "Return is a verb. Your soul can come back to rest without having every answer first.",
    ],
    [
        "New is not a demand to reinvent overnight. It is permission to take the next step without the old script.",
        "One thing forward is not small. It is how humans actually change—without a montage.",
        "Morning mercy is not earned by a perfect December. It meets you because it is morning.",
        "With you is not a metaphor for loneliness only. It is company for the unknown days ahead.",
        "Your race is not their highlight reel. Faithfulness looks ordinary until you stop comparing.",
    ],
]

assert len(REFLECTIONS) == 48
for i, rows in enumerate(REFLECTIONS):
    assert len(rows) == 5, (i, len(rows))


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def inject_prompt_line(line: str, reflection: str) -> str:
    marker = "}, prompt: '"
    idx = line.rfind(marker)
    if idx == -1:
        raise ValueError("no prompt marker: " + line[:120])
    j = idx + len(marker)
    # find closing quote of prompt (unescaped)
    k = j
    while k < len(line):
        if line[k] == "\\":
            k += 2
            continue
        if line[k] == "'":
            # end of prompt string
            return line[: k + 1] + ", reflection: '" + js_escape(reflection) + "'" + line[k + 1 :]
        k += 1
    raise ValueError("unclosed prompt: " + line[:200])


out = []
theme_idx = -1
day_idx = 0
for line in lines:
    if "GROUNDED_HOME" not in line and (
        line.startswith("      title: '") or line.startswith('      title: "')
    ):
        theme_idx += 1
        day_idx = 0
    if line.startswith("        { focus:") and "prompt:" in line and "reflection:" not in line:
        if theme_idx < 0 or theme_idx >= 48:
            raise SystemExit("theme idx out of range: " + str(theme_idx) + " line: " + line[:80])
        refl = REFLECTIONS[theme_idx][day_idx]
        line = inject_prompt_line(line, refl)
        day_idx += 1
    out.append(line)

text = "".join(out)
n = text.count("reflection:")
if n != 240:
    raise SystemExit("expected 240 reflections, got " + str(n))
JS.write_text(text, encoding="utf-8")
print("OK", JS, "reflection fields:", n)
