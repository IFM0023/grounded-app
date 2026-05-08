/**
 * Structured verse explanation for Study tab + verse modal (Go Deeper).
 * POST JSON: { reference, verse, book?, chapter?, verseNumber?, stream?: boolean }
 * Returns: { anchor, meaning, reflection } (+ optional originalWords[])
 */
import { readRequestJson } from './read-request-json.js';
import {
  drainOpenAiSseToText,
  openAiChatCompletionStartStream,
  readOpenAiChatCompletionNonStream
} from './openai-stream-shared.js';

/** ~96 words (was ~124): one JSON object, verse-grounded. */
const SYSTEM_PROMPT = `You are a careful Bible companion for Grounded users. Given one verse reference and its full text, output one JSON object only (no markdown).

String keys: anchor — 2–4 sentences (scene, tone, audience); meaning — 2–5 sentences (what it communicates, honest, not preachy); reflection — 2–4 sentences (gentle application, no guilt).

Optional originalWords: array (0–3) of { "english", "original", "literal" } for noteworthy Hebrew/Greek only when confident; else [].

Stay on this verse; Protestant-friendly; honor the text; avoid clichés and hype. Each string under ~900 characters.`;

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

function normalizeOut(o) {
  if (!o || typeof o !== 'object') return null;
  const str = (k, max) => {
    const v = o[k];
    return v != null && typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max || 900) : '';
  };
  let words = [];
  if (Array.isArray(o.originalWords)) {
    words = o.originalWords
      .filter((w) => w && typeof w === 'object')
      .map((w) => ({
        english: String(w.english || '').trim().slice(0, 80),
        original: String(w.original || '').trim().slice(0, 80),
        literal: String(w.literal || '').trim().slice(0, 400)
      }))
      .filter((w) => w.english || w.original || w.literal)
      .slice(0, 3);
  }
  return {
    anchor: str('anchor', 900),
    meaning: str('meaning', 900),
    reflection: str('reflection', 900),
    originalWords: words
  };
}

function buildVersePayload(reference, verse, book, chapter, verseNumber) {
  let loc = '';
  if (book) loc += `Book: ${book}\n`;
  if (chapter) loc += `Chapter: ${chapter}\n`;
  if (verseNumber) loc += `Verse number: ${verseNumber}\n`;

  const userMessage = `${loc}Reference: ${reference}\n\nVerse text:\n${verse}\n\nReturn the JSON object with anchor, meaning, reflection, and originalWords (array, may be empty).`;

  return {
    model: 'gpt-4o-mini',
    temperature: 0.4,
    max_tokens: 1400,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ]
  };
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

  const reference = String(body.reference || '').trim().slice(0, 120);
  const verse = String(body.verse || '').trim().slice(0, 4000);
  if (!reference || !verse) {
    return res.status(400).json({ error: 'Missing reference or verse' });
  }

  const book = body.book != null ? String(body.book).trim().slice(0, 48) : '';
  const chapter = body.chapter != null ? String(body.chapter).trim().slice(0, 8) : '';
  const verseNumber = body.verseNumber != null ? String(body.verseNumber).trim().slice(0, 8) : '';

  const openAiBody = buildVersePayload(reference, verse, book, chapter, verseNumber);

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
      if (!out || (!out.anchor && !out.meaning && !out.reflection)) {
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
    if (!out || (!out.anchor && !out.meaning && !out.reflection)) {
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
