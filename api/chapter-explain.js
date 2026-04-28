import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

// Chapter overview — summary, themes, takeaway (JSON).
// POST { book, chapter, versesText }
// Returns { summary, themes: string[], takeaway }

const SYSTEM_PROMPT = `You help someone reflect on a Bible chapter they just read.

Return ONLY valid JSON with this exact shape (no markdown fences):
{"summary":"2-3 sentences overview","themes":["short phrase 1","short phrase 2","short phrase 3"],"takeaway":"one warm sentence for the reader"}

Rules:
- summary: plain language, no verse quotes, 2-3 sentences.
- themes: exactly 3 short phrases (3-6 words each).
- takeaway: one sentence, speaks to "you", gentle and practical.
- No theological jargon. No "this chapter says".`;

function parseJsonLoose(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
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
  if (!versesText) {
    return res.status(400).json({ error: 'Missing chapter text' });
  }
  if (versesText.length > 12000) {
    versesText = versesText.slice(0, 12000) + '…';
  }

  const userMessage =
    `Book: ${book}\nChapter: ${chapter}\n\n` +
    `Chapter text (KJV-style; do not quote long strings back):\n${versesText}\n\n` +
    `Respond with ONLY the JSON object described in your instructions.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.55,
        max_tokens: 500,
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
    if (!parsed || typeof parsed.summary !== 'string') {
      return res.status(502).json({ error: 'Invalid AI response' });
    }
    const themes = Array.isArray(parsed.themes) ? parsed.themes.map(t => String(t).trim()).filter(Boolean).slice(0, 5) : [];
    const takeaway = typeof parsed.takeaway === 'string' ? parsed.takeaway.trim() : '';
    return res.status(200).json({
      summary: parsed.summary.trim(),
      themes: themes.length ? themes : ['Faithfulness', 'God’s presence', 'Quiet trust'],
      takeaway: takeaway || 'Carry one honest sentence with you today.'
    });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
