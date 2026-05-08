/**
 * Structured chapter explanation for Study tab + Scripture "Explain chapter".
 * POST JSON: { book, chapter, versesText?, stream?: boolean }
 */
import { readRequestJson } from './read-request-json.js';
import {
  drainOpenAiSseToText,
  openAiChatCompletionStartStream,
  readOpenAiChatCompletionNonStream
} from './openai-stream-shared.js';

/** ~118 words (was ~275): one JSON object matching Study + Explain Chapter UI. */
const SYSTEM_PROMPT = `Warm Bible companion for Grounded. Given book, chapter, and optional numbered verse text (may be partial), output one JSON object only (no markdown).

Strings (use "" if unknown): writtenBy, date, setting, theme, purpose, message, anchor, reflection, then, now, whereFits, difficultPassage.

Objects: keyVerse as { "reference", "text" } or null; honestQuestion as { "question", "answer" } or null.

Arrays: people — up to 5 of { "name", "who", "why" }; crossReferences — up to 4 of { "reference", "preview" }; empty arrays allowed.

Stay tied to supplied text; do not invent verses. Protestant-friendly; avoid clichés. Most strings ≤900 characters; keep theme short. If verse text is missing, infer cautiously from book/chapter only.`;

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

function str(v, max) {
  if (v == null || typeof v !== 'string') return '';
  return v.replace(/\s+/g, ' ').trim().slice(0, max || 900);
}

function normalizePerson(p) {
  if (!p || typeof p !== 'object') return null;
  const name = str(p.name, 80);
  const who = str(p.who, 400);
  const why = str(p.why, 400);
  if (!name && !who && !why) return null;
  return { name, who, why };
}

function normalizeCross(c) {
  if (!c || typeof c !== 'object') return null;
  const reference = str(c.reference, 80);
  const preview = str(c.preview, 400);
  if (!reference && !preview) return null;
  return { reference, preview };
}

function normalizeKeyVerse(kv) {
  if (!kv || typeof kv !== 'object') return null;
  const reference = str(kv.reference, 120);
  const text = str(kv.text, 500);
  if (!reference && !text) return null;
  return { reference, text };
}

function normalizeHonest(h) {
  if (!h || typeof h !== 'object') return null;
  const question = str(h.question, 400);
  const answer = str(h.answer, 900);
  if (!question && !answer) return null;
  return { question, answer };
}

function normalizeOut(o) {
  if (!o || typeof o !== 'object') return null;

  let people = Array.isArray(o.people)
    ? o.people.map(normalizePerson).filter(Boolean).slice(0, 5)
    : [];

  let crossReferences = Array.isArray(o.crossReferences)
    ? o.crossReferences.map(normalizeCross).filter(Boolean).slice(0, 4)
    : [];

  const out = {
    writtenBy: str(o.writtenBy, 200),
    date: str(o.date, 200),
    setting: str(o.setting, 900),
    theme: str(o.theme, 200),
    purpose: str(o.purpose, 900),
    message: str(o.message, 900),
    anchor: str(o.anchor, 900),
    reflection: str(o.reflection, 900),
    keyVerse: normalizeKeyVerse(o.keyVerse),
    people,
    difficultPassage: str(o.difficultPassage, 900),
    crossReferences,
    honestQuestion: normalizeHonest(o.honestQuestion),
    then: str(o.then, 900),
    now: str(o.now, 900),
    whereFits: str(o.whereFits, 900)
  };

  const hasBody =
    out.anchor ||
    out.reflection ||
    out.message ||
    out.theme ||
    out.setting ||
    out.purpose;

  if (!hasBody) return null;

  if (!out.reflection && out.message) {
    out.reflection = out.message.slice(0, 900);
  }
  if (!out.anchor && out.setting) {
    out.anchor = out.setting.slice(0, 900);
  }

  return out;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY || process.env.OPENAI_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI not configured' });
  }

  const body = await readRequestJson(req);
  const wantsStream = body.stream === true || body.stream === 'true';

  const book = String(body.book || '').trim().slice(0, 64);
  const chapter = String(body.chapter != null ? body.chapter : '').trim().slice(0, 8);
  if (!book || !chapter) {
    return res.status(400).json({ error: 'Missing book or chapter' });
  }

  const versesText = String(body.versesText || '').trim().slice(0, 14000);

  const userMessage = `Book: ${book}\nChapter: ${chapter}\n\nChapter verse text (numbered lines; may be incomplete):\n${versesText || '(not provided — infer cautiously from book/chapter only)'}\n\nReturn the JSON object with all keys described in the system message. Use empty strings and empty arrays where appropriate.`;

  const openAiBody = {
    model: 'gpt-4o-mini',
    temperature: 0.35,
    max_tokens: 3800,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ]
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  try {
    if (wantsStream) {
      let raw = '';
      try {
        const upstream = await openAiChatCompletionStartStream({
          apiKey,
          requestBody: openAiBody,
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
          requestBody: openAiBody,
          signal: controller.signal
        });
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
        }
      }

      const parsed = parseJson(raw);
      const out = normalizeOut(parsed);
      if (!out) {
        if (!res.headersSent) {
          return res.status(502).json({ error: 'Invalid AI response' });
        }
        res.write(JSON.stringify({ error: 'Invalid AI response' }) + '\n');
        res.end();
        return;
      }
      res.write(JSON.stringify({ done: true, data: out }) + '\n');
      res.end();
      return;
    }

    const raw = await readOpenAiChatCompletionNonStream({
      apiKey,
      requestBody: openAiBody,
      signal: controller.signal
    });

    const parsed = parseJson(raw);
    const out = normalizeOut(parsed);
    if (!out) {
      return res.status(502).json({ error: 'Invalid AI response' });
    }

    return res.status(200).json(out);
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    if (aborted) {
      return res.status(504).json({ error: 'Timeout' });
    }
    return res.status(500).json({ error: e && e.message ? String(e.message) : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
