import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

const SYSTEM_PROMPT = `You help someone understand a Bible chapter they are reading quietly.

You MUST respond with a single JSON object only (no markdown, no code fences, no text before or after).

Required keys (all values are strings except as noted):
- "anchor": 1–2 short sentences tied to THIS chapter (setting, action, claim).
- "reflection": 1–2 short sentences of calm personal application (may use "you").
- "writtenBy": author + approximate date, one short phrase.
- "setting": historical/geographical context, 1–2 sentences.
- "theme": 4–8 words summarizing the chapter's main theme (comma-separated or short phrase).
- "purpose": one sentence — why this chapter matters in the book.
- "message": 1–2 sentences — takeaway for the reader.
- "keyVerse": object with "text" and "reference" for one representative verse (short quote OK).
- "then": exactly 2 sentences — what this meant to the original audience. Label is not inside the string.
- "now": exactly 2 sentences — relevance today.
- "people": array of 0–5 objects, each { "name", "who", "why" } — key figures only; use [] if none.
- "difficultPassage": string with 2–3 honest sentences if the chapter has harsh/judgment/violence/confusing theology that might trouble a new reader; otherwise null (JSON null).
- "whereFits": one line placing the chapter in biblical timeline (e.g. "Written during the Babylonian exile, approximately 600 BC").
- "crossReferences": array of 3–5 objects { "reference", "preview" } — related verses; preview is first line or paraphrase.
- "honestQuestion": object { "question", "answer" } — one honest question a new believer might have about this passage, and a 2-sentence warm answer welcoming doubt.

Rules:
- Do NOT quote long strings of verse text verbatim for the whole chapter.
- Calm, simple, grounded tone.
- JSON only. Use null for difficultPassage if not needed.

Output example shape (illustrative):
{ "anchor":"…","reflection":"…","writtenBy":"…","setting":"…","theme":"…","purpose":"…","message":"…","keyVerse":{"text":"…","reference":"…"},"then":"…","now":"…","people":[],"difficultPassage":null,"whereFits":"…","crossReferences":[],"honestQuestion":{"question":"…","answer":"…"}}`;

function stripMarkdownFences(s) {
  return String(s || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function parseJsonLoose(raw) {
  if (!raw) return null;
  const s = stripMarkdownFences(String(raw).trim());
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeChapterKey(k) {
  return String(k)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function str(v, max) {
  if (v == null) return '';
  const t = String(v).replace(/\s+/g, ' ').trim();
  return t.slice(0, max || 2000);
}

function coerceChapterExtended(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const acc = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (v == null) continue;
    const nk = normalizeChapterKey(k);
    if (!nk) continue;
    if (typeof v === 'string') acc[nk] = v.replace(/\s+/g, ' ').trim();
    else if (typeof v === 'object') acc[nk] = v;
  }

  let anchor = str(acc.anchor, 1200);
  let reflection = str(acc.reflection, 1200);
  const writtenBy = str(acc.writtenby || acc.writtenBy, 400);
  const date = str(acc.date, 120);
  const setting = str(acc.setting, 900);
  const theme = str(acc.theme, 200);
  const purpose = str(acc.purpose, 500);
  const message = str(acc.message, 900);
  const then = str(acc.then, 900);
  const now = str(acc.now, 900);
  const whereFits = str(acc.wherefits || acc.whereFits, 400);
  let difficultPassage = acc.difficultpassage != null ? acc.difficultpassage : acc.difficultPassage;
  if (difficultPassage === null || difficultPassage === undefined) difficultPassage = null;
  else difficultPassage = str(difficultPassage, 900) || null;

  let keyVerse = acc.keyverse || acc.keyVerse;
  if (!keyVerse || typeof keyVerse !== 'object') keyVerse = { text: '', reference: '' };
  else {
    keyVerse = {
      text: str(keyVerse.text, 400),
      reference: str(keyVerse.reference, 80)
    };
  }

  let people = acc.people;
  if (!Array.isArray(people)) people = [];
  people = people
    .slice(0, 6)
    .map((p) => {
      if (!p || typeof p !== 'object') return null;
      return {
        name: str(p.name, 80),
        who: str(p.who, 200),
        why: str(p.why, 280)
      };
    })
    .filter((p) => p && p.name);

  let crossReferences = acc.crossreferences || acc.crossReferences;
  if (!Array.isArray(crossReferences)) crossReferences = [];
  crossReferences = crossReferences
    .slice(0, 6)
    .map((c) => {
      if (!c || typeof c !== 'object') return null;
      return { reference: str(c.reference, 80), preview: str(c.preview, 220) };
    })
    .filter((c) => c && c.reference);

  let honestQuestion = acc.honestquestion || acc.honestQuestion;
  if (!honestQuestion || typeof honestQuestion !== 'object') {
    honestQuestion = { question: '', answer: '' };
  } else {
    honestQuestion = {
      question: str(honestQuestion.question, 280),
      answer: str(honestQuestion.answer, 900)
    };
  }

  if (!anchor || !reflection) {
    const overview = str(acc.overview, 600);
    const whatsHappening = str(acc.whatshappening || acc.whatsHappening, 600);
    const keyMessage = str(acc.keymessage || acc.keyMessage, 600);
    const forYou = str(acc.foryou || acc.forYou, 600);
    if (overview || whatsHappening) anchor = [overview, whatsHappening].filter(Boolean).join(' ').slice(0, 1200);
    if (keyMessage || forYou) reflection = [keyMessage, forYou].filter(Boolean).join(' ').slice(0, 1200);
    if (setting && !anchor) anchor = setting.slice(0, 400);
    if (message && !reflection) reflection = message.slice(0, 500);
  }

  if (!anchor && !reflection) return null;

  return {
    anchor: anchor.trim(),
    reflection: reflection.trim(),
    writtenBy: writtenBy,
    date: date,
    setting,
    theme,
    purpose,
    message,
    keyVerse,
    then,
    now,
    people,
    difficultPassage,
    whereFits,
    crossReferences,
    honestQuestion
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY || process.env.OPENAI_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI not configured' });
  }

  const body = await readRequestJson(req);
  const book = String(body.book || '').trim().slice(0, 40);
  const chapter = parseInt(body.chapter, 10);
  let versesText = String(body.versesText || '').replace(/\s+/g, ' ').trim();
  if (!book || !chapter || isNaN(chapter)) {
    return res.status(400).json({ error: 'Missing book or chapter' });
  }
  if (versesText.length > 12000) {
    versesText = versesText.slice(0, 12000) + '…';
  }
  if (!versesText) {
    versesText = `(No full chapter text was sent. Summarize ${book} chapter ${chapter} faithfully. Return all JSON keys.)`;
  }

  const userMessage =
    `Explain this Bible chapter in a calm, simple, and grounded tone.\n\n` +
    `Book: ${book}\nChapter: ${chapter}\n\n` +
    `Context:\n${versesText}\n\n` +
    `Return the JSON object described in your instructions.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.48,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ]
      }),
      signal: controller.signal
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return res.status(502).json({ error: 'Upstream error', status: upstream.status, detail: detail.slice(0, 200) });
    }

    const data = await upstream.json();
    const raw = (
      data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
        ? data.choices[0].message.content
        : ''
    ).trim();
    const parsed = parseJsonLoose(raw);
    const coerced = coerceChapterExtended(parsed);
    if (!coerced) {
      return res.status(502).json({ error: 'Invalid AI response' });
    }
    return res.status(200).json(coerced);
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
