import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

// Verse tap — short AI reflection (not quoting the verse verbatim).
// POST { reference, verse }
// Returns { breakdown: string }

const SYSTEM_PROMPT = `You offer a brief, warm reflection on a Bible verse for someone reading quietly.

Rules:
- Write 2 to 4 short sentences total.
- Plain, gentle language. No jargon.
- Speak to the reader ("you"). No "we".
- Do NOT quote or repeat the verse text verbatim.
- No greeting, no heading, no "this verse means".
- Plain text only. No markdown, bullets, or numbering.`;

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
  if (!verse) {
    return res.status(400).json({ error: 'Missing verse' });
  }

  const userMessage =
    `Reference: ${reference || 'Scripture'}\n` +
    `Verse (for context only — do not quote it): ${verse.slice(0, 600)}\n\n` +
    `Write your reflection now.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.65,
        max_tokens: 220,
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
    if (!raw) {
      return res.status(502).json({ error: 'Empty response' });
    }
    const breakdown = raw.replace(/\s+/g, ' ').trim().slice(0, 900);
    return res.status(200).json({ breakdown });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
