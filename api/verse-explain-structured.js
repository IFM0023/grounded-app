import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

// Go Deeper / verse reflection — JSON: anchor, meaning, reflection (verse-grounded).
// POST { verse, reference, book?, chapter?, verseNumber? }

const SYSTEM_PROMPT = `You help someone reflect on a single Bible verse they are reading. Every word you write must be clearly tied to THIS verse—not generic comfort that could apply anywhere.

You MUST respond with a single JSON object only (no markdown, no code fences, no text before or after).
Use exactly these keys: "anchor", "meaning", "reflection", "originalWords".

Fields:
- "anchor": One sentence. It MUST name or paraphrase something specific from the verse (a word, image, action, or claim in the text). Vague openers like "In life we all face…" or "This verse encourages us to…" without citing what the verse actually says are forbidden.
- "meaning": 1–2 short sentences. Explain what the verse is saying in plain language—who is speaking, what situation or truth is in view, in simple terms. Stay close to the verse; no generic preaching.
- "reflection": 1–2 short sentences. Apply it to the reader's life; you may use "you" or "your" here. It must follow logically from the meaning and anchor, not from generic self-help. Do NOT use stock phrases you could reuse for unrelated verses (e.g. "no matter what you're going through" without tying to the verse).
- "originalWords": array of 0–4 objects for significant theological words in THIS verse only. Each object: { "english": "…", "original": "Hebrew or Greek word", "literal": "short gloss" }. Use [] if none are worth highlighting. Keep "literal" very short (under 60 chars).

Rules:
- Do not invent events or context not implied by the verse or the reference.
- Total output: concise. No long paragraphs. No more than 2 sentences in "meaning" and in "reflection" combined per field.
- Tone: calm, thoughtful, grounded (not hyped, not preachy, not sappy).
- Vary your wording. Avoid repeating the same opening formula across different verses.

Output format (strict JSON only):
{ "anchor": "…", "meaning": "…", "reflection": "…", "originalWords": [] }`;

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

function normalizeVerseKey(k) {
  return String(k)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function coerceVerseFields(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const acc = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (v == null || typeof v !== 'string') continue;
    const nk = normalizeVerseKey(k);
    if (!nk) continue;
    const t = v.replace(/\s+/g, ' ').trim();
    if (t) acc[nk] = t;
  }

  let originalWordsRaw = parsed.originalWords != null ? parsed.originalWords : parsed.originalwords;
  let originalWords = originalWordsRaw;
  if (!Array.isArray(originalWords)) originalWords = [];
  originalWords = originalWords
    .slice(0, 5)
    .map((w) => {
      if (!w || typeof w !== 'object') return null;
      return {
        english: String(w.english || w.en || '').trim().slice(0, 80),
        original: String(w.original || w.lemma || '').trim().slice(0, 80),
        literal: String(w.literal || w.gloss || '').trim().slice(0, 120)
      };
    })
    .filter((w) => w && w.english && w.original);

  let anchor = String(acc.anchor || '').slice(0, 600);
  let meaning = String(acc.meaning || '').slice(0, 1200);
  let reflection = String(acc.reflection || '').slice(0, 800);

  if (anchor || meaning || reflection) {
    return { anchor, meaning, reflection, originalWords };
  }

  // Legacy: single "explanation" key (older system prompt)
  const expl = String(acc.explanation || '').trim();
  if (expl) {
    return {
      anchor: '',
      meaning: expl.slice(0, 1200),
      reflection: '',
      originalWords: originalWords.length ? originalWords : []
    };
  }

  // Legacy: context / meaning / forYou
  return {
    anchor: String(acc.context || '').slice(0, 600),
    meaning: String(acc.meaning || '').slice(0, 1200),
    reflection: String(acc.foryou || '').slice(0, 800),
    originalWords: originalWords.length ? originalWords : []
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
  const verse = String(body.verse || '').trim();
  const reference = String(body.reference || '').trim().slice(0, 120);
  const book = String(body.book || '').trim().slice(0, 48);
  const chapter = body.chapter != null && body.chapter !== '' ? String(body.chapter).trim() : '';
  const verseNumber =
    body.verseNumber != null && body.verseNumber !== '' ? String(body.verseNumber).trim() : '';

  if (!verse) {
    return res.status(400).json({ error: 'Missing verse' });
  }

  const locParts = [];
  if (book) locParts.push('Book: ' + book);
  if (chapter) locParts.push('Chapter: ' + chapter);
  if (verseNumber) locParts.push('Verse number: ' + verseNumber);
  const locBlock = locParts.length ? locParts.join('\n') + '\n' : '';

  const userMessage =
    (reference ? 'Reference: ' + reference + '\n' : '') +
    locBlock +
    'Verse text:\n' +
    verse.slice(0, 800) +
    '\n\nReturn only the JSON object described in your instructions.';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 16000);

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        max_tokens: 720,
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
    const raw = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();
    const parsed = parseJsonLoose(raw);
    const coerced = coerceVerseFields(parsed);
    if (!coerced) {
      return res.status(502).json({ error: 'Invalid AI response' });
    }
    const anchor = coerced.anchor.replace(/\s+/g, ' ').trim();
    const meaning = coerced.meaning.replace(/\s+/g, ' ').trim();
    const reflection = coerced.reflection.replace(/\s+/g, ' ').trim();
    if (!anchor && !meaning && !reflection) {
      return res.status(502).json({ error: 'Empty explanation' });
    }
    const ow = Array.isArray(coerced.originalWords) ? coerced.originalWords : [];
    return res.status(200).json({ anchor, meaning, reflection, originalWords: ow });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
