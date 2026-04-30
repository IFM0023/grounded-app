import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

const SYSTEM_PROMPT = `You are a careful Bible companion helping someone understand a whole biblical book.

Respond with ONE JSON object only (no markdown, no code fences).

Keys (all strings except themes; themes is array of 4-6 short single-word or two-word strings):
- "author": who wrote it (traditional attribution is fine) + rough date range, one short phrase
- "audience": who it was written for, one phrase
- "period": historical setting, one phrase
- "purpose": why it was written, ONE sentence
- "whyReadIt": personal relevance for a modern reader, ONE sentence
- "fitsInStory": how it connects to the larger biblical narrative, ONE sentence
- "themes": array of 4-6 short theme labels (e.g. "Covenant", "Faith")
- "pointsToJesus": for Old Testament books only: 1-2 sentences on how the book points forward to Christ. For New Testament gospels/epistles use empty string "".

Tone: warm, honest, non-technical. No preaching at the reader.`;

function stripFences(s) {
  return String(s || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function parseJson(raw) {
  const s = stripFences(String(raw).trim());
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a === -1 || b <= a) return null;
  try {
    return JSON.parse(s.slice(a, b + 1));
  } catch {
    return null;
  }
}

function normalize(o, testament) {
  if (!o || typeof o !== 'object') return null;
  const str = (k, max) => {
    const v = o[k];
    return v != null && typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max || 900) : '';
  };
  const themes = Array.isArray(o.themes)
    ? o.themes.map((t) => String(t || '').trim()).filter(Boolean).slice(0, 8)
    : [];
  const isOt = testament === 'ot';
  let ptj = str('pointsToJesus', 700);
  if (!isOt) ptj = '';
  return {
    author: str('author', 220),
    audience: str('audience', 220),
    period: str('period', 220),
    purpose: str('purpose', 320),
    whyReadIt: str('whyReadIt', 320),
    fitsInStory: str('fitsInStory', 320),
    themes,
    pointsToJesus: ptj
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
  const book = String(body.book || '').trim().slice(0, 48);
  const testament = body.testament === 'nt' ? 'nt' : 'ot';
  if (!book) {
    return res.status(400).json({ error: 'Missing book' });
  }

  const userMessage = `Book: ${book}\nTestament: ${testament}\n\nReturn the JSON object with all keys described in your instructions.`;

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
        temperature: 0.45,
        max_tokens: 900,
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
    const parsed = parseJson(raw);
    const out = normalize(parsed, testament);
    if (!out || (!out.author && !out.purpose)) {
      return res.status(502).json({ error: 'Invalid AI response' });
    }
    return res.status(200).json(out);
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
