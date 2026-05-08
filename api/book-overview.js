import { readRequestJson } from './read-request-json.js';
import {
  drainOpenAiSseToText,
  openAiChatCompletionStartStream,
  readOpenAiChatCompletionNonStream
} from './openai-stream-shared.js';

/** ~72 words (was ~120): book snapshot JSON + tone. */
const SYSTEM_PROMPT = `You help readers grasp a whole biblical book. Reply with one JSON object only (no markdown).

Fields (strings except themes): author — who wrote it and rough when, short phrase; audience; period — setting in plain words; purpose — one sentence on why it exists; whyReadIt — one sentence, personal relevance today; fitsInStory — one sentence in the wider biblical narrative; themes — array of 4–6 short labels (e.g. "Covenant"); pointsToJesus — for Old Testament only, 1–2 sentences on how it points toward Christ; for New Testament use "".

Tone: warm, plain, non-technical; no preaching.`;

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

function readBookTestament(req, body) {
  if (req.method === 'GET') {
    const q = req.query || {};
    const book = String(q.book || '').trim().slice(0, 48);
    const testament = String(q.testament || '').toLowerCase() === 'nt' ? 'nt' : 'ot';
    return { book, testament };
  }
  const book = String(body.book || '').trim().slice(0, 48);
  const testament = body.testament === 'nt' ? 'nt' : 'ot';
  return { book, testament };
}

function buildOverviewRequest(book, testament) {
  const userMessage = `Book: ${book}\nTestament: ${testament}\n\nReturn the JSON object with all keys described in your instructions.`;
  return {
    model: 'gpt-4o-mini',
    temperature: 0.45,
    max_tokens: 900,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ]
  };
}

async function finalizeOverview(raw, testament) {
  const parsed = parseJson(raw);
  const out = normalize(parsed, testament);
  if (!out || (!out.author && !out.purpose)) {
    const err = new Error('Invalid AI response');
    err.status = 502;
    throw err;
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = {};
  if (req.method === 'POST') {
    body = await readRequestJson(req);
  }

  const { book, testament } = readBookTestament(req, body);
  if (!book) {
    return res.status(400).json({ error: 'Missing book' });
  }

  const q = req.query || {};
  const wantsStream =
    String(q.stream || '') === '1' ||
    String(q.stream || '') === 'true' ||
    body.stream === true ||
    body.stream === 'true';

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY || process.env.OPENAI_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI not configured' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);
  const payload = buildOverviewRequest(book, testament);

  try {
    if (wantsStream) {
      let raw = '';
      try {
        const upstream = await openAiChatCompletionStartStream({
          apiKey,
          requestBody: payload,
          signal: controller.signal
        });
        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => '');
          return res.status(502).json({
            error: 'Upstream error',
            detail: detail.slice(0, 200)
          });
        }
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        raw = await drainOpenAiSseToText(upstream.body, (d) => {
          res.write(JSON.stringify({ d }) + '\n');
        });
      } catch (eStream) {
        raw = await readOpenAiChatCompletionNonStream({
          apiKey,
          requestBody: payload,
          signal: controller.signal
        });
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
        }
      }

      try {
        const overview = await finalizeOverview(raw, testament);
        res.write(JSON.stringify({ done: true, data: { overview } }) + '\n');
        res.end();
      } catch (eFin) {
        if (!res.headersSent) {
          return res.status(502).json({ error: 'Invalid AI response' });
        }
        res.write(JSON.stringify({ error: 'Invalid AI response' }) + '\n');
        res.end();
      }
      return;
    }

    const raw = await readOpenAiChatCompletionNonStream({
      apiKey,
      requestBody: payload,
      signal: controller.signal
    });
    const overview = await finalizeOverview(raw, testament);
    return res.status(200).json({ overview });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    if (aborted) {
      return res.status(504).json({ error: 'Timeout' });
    }
    const status = e && e.status ? e.status : 500;
    if (status === 502 && e.detail) {
      return res.status(502).json({ error: 'Upstream error', detail: e.detail });
    }
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: e && e.message ? String(e.message) : 'Generation failed'
    });
  } finally {
    clearTimeout(timeout);
  }
}
