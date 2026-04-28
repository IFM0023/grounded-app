import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

// Structured chapter explanation — JSON: anchor, reflection (chapter-grounded).
// POST { book, chapter } or { book, chapter, versesText } for richer context
// Run locally: npx vercel dev (serves /api/*). Plain static servers do not expose these routes.

const SYSTEM_PROMPT = `You help someone understand a Bible chapter they are reading quietly.

You MUST respond with a single JSON object only (no markdown, no code fences, no text before or after).
Use exactly these keys: "anchor", "reflection".

Fields:
- "anchor": 1–2 short sentences that name something specific about this chapter — its setting, what happens, a repeated image, or a claim in the text. Must feel tied to THIS chapter, not generic encouragement.
- "reflection": 1–2 short sentences of calm, personal application for the reader (you may use "you"). Must follow from what the chapter is actually about.

Rules:
- Do NOT quote long strings of verse text back verbatim.
- Do not give technical or meta advice about servers, apps, or how to run software.
- Calm, simple, grounded tone. No long paragraphs.
- Vary wording so different chapters do not all start the same way.

Output format (strict JSON only):
{ "anchor": "…", "reflection": "…" }`;

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

function coerceChapterFields(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const acc = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (v == null || typeof v !== 'string') continue;
    const nk = normalizeChapterKey(k);
    if (!nk) continue;
    const t = v.replace(/\s+/g, ' ').trim();
    if (t) acc[nk] = t;
  }

  let anchor = String(acc.anchor || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
  let reflection = String(acc.reflection || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);

  if (anchor || reflection) {
    return { anchor, reflection };
  }

  const overview = String(acc.overview || '')
    .replace(/\s+/g, ' ')
    .trim();
  const whatsHappening = String(acc.whatshappening || '')
    .replace(/\s+/g, ' ')
    .trim();
  const keyMessage = String(acc.keymessage || '')
    .replace(/\s+/g, ' ')
    .trim();
  const forYou = String(acc.foryou || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (overview || whatsHappening) {
    anchor = [overview, whatsHappening].filter(Boolean).join(' ').slice(0, 1200);
  }
  if (keyMessage || forYou) {
    reflection = [keyMessage, forYou].filter(Boolean).join(' ').slice(0, 1200);
  }

  if (!anchor && !reflection) return null;
  return { anchor, reflection };
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
    versesText = `(No full chapter text was sent. Give a faithful, concise summary of ${book} chapter ${chapter} as it is commonly understood. Keep "anchor" and "reflection" to 1–2 short sentences each.)`;
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
        temperature: 0.52,
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
    const raw = (
      data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
        ? data.choices[0].message.content
        : ''
    ).trim();
    const parsed = parseJsonLoose(raw);
    const coerced = coerceChapterFields(parsed);
    if (!coerced) {
      return res.status(502).json({ error: 'Invalid AI response' });
    }
    const anchor = coerced.anchor.replace(/\s+/g, ' ').trim();
    const reflection = coerced.reflection.replace(/\s+/g, ' ').trim();
    if (!anchor && !reflection) {
      return res.status(502).json({ error: 'Empty explanation' });
    }
    return res.status(200).json({ anchor, reflection });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
