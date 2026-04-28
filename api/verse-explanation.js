import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

// Vercel serverless function — explains a Bible verse in 1–2 warm sentences.
// The verse itself is selected on the client from a local library.
// The AI never generates Scripture, only a short, personal explanation.
// Requires OPENAI_API_KEY (or OPEN_AI_KEY / OPENAI_KEY) to be set.

const SYSTEM_PROMPT = `You explain Bible verses in a warm, personal, encouraging way.

Rules:
- Write ONLY 1 to 2 short sentences. Never more.
- Simple, relatable language. No theological jargon or church-speak.
- Speak directly to the reader with gentleness ("you", "your"). No "we"/"us".
- Do NOT quote or restate the verse verbatim.
- Do NOT say "this verse means" or any meta-commentary.
- Do NOT add a greeting, heading, or sign-off.
- Plain text only. No markdown, no bullets, no numbering, no quotes.
- End with a period. Keep it under 280 characters.`;

function buildUserMessage({ reference, verse, theme }) {
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 500);
  const ref = clean(reference) || 'Scripture';
  const text = clean(verse);
  const t = clean(theme) || 'general';
  return `Verse reference: ${ref}\nVerse text: "${text}"\nTheme: ${t}\n\nWrite your 1–2 sentence warm, personal explanation now.`;
}

// Strips quotes / markdown / excess whitespace and clamps length.
function sanitizeExplanation(raw) {
  if (!raw) return '';
  let s = String(raw).replace(/\r\n?/g, '\n').trim();
  // Remove surrounding quotes if the whole string is wrapped.
  s = s.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim();
  // Collapse multi-line output into one soft paragraph (we want 1-2 sentences).
  s = s.replace(/\s*\n+\s*/g, ' ');
  // Strip markdown leaders.
  s = s.replace(/^([*\-•>]|\d+[.)])\s+/, '');
  s = s.replace(/\s+/g, ' ').trim();
  // Hard cap length; cut at last sentence boundary if possible.
  if (s.length > 320) {
    const slice = s.slice(0, 320);
    const lastDot = Math.max(slice.lastIndexOf('.'), slice.lastIndexOf('!'), slice.lastIndexOf('?'));
    s = lastDot > 120 ? slice.slice(0, lastDot + 1) : slice.trim() + '.';
  }
  return s;
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
  const verseText = String(body.verse || '').trim();
  if (!verseText) {
    return res.status(400).json({ error: 'Missing verse text' });
  }

  const userMessage = buildUserMessage(body);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 140,
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
    const explanation = sanitizeExplanation(raw);
    if (!explanation) {
      return res.status(502).json({ error: 'Empty response' });
    }
    return res.status(200).json({ explanation });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
