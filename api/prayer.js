// Vercel serverless function — generates a short Christian prayer via OpenAI.
// Requires the OPENAI_API_KEY env var to be set in the Vercel project.
// If unset or upstream fails, the client falls back to its structured generator.

const SYSTEM_PROMPT = `You write short, heartfelt Christian prayers.

Rules:
- Natural, warm, conversational tone
- Do NOT quote or repeat the user's input
- Avoid robotic phrasing and clichés
- Use first-person singular ("I", "me", "my") — not "we" or "us", unless the subject is plural (e.g. "my family")
- If a subject is provided, refer to them naturally with correct pronouns
- Keep it concise and calming

Format (STRICT):
Line 1: Opening — exactly one of: "Heavenly Father," / "Lord," / "Father," / "Dear God,"
Lines 2-4 (or 2-5): Three or four separate body lines, each one short (about 8-18 words). Each body line MUST be on its own line, separated by a real newline. Do NOT combine body lines into one paragraph.
Last line: "Amen."

Total lines: 5 or 6. Plain text only. No markdown, no bullets, no numbering, no quotes.`;

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

function buildUserMessage({ type, subject, input, emotion }) {
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 400);
  const t = clean(type) || 'general';
  const s = clean(subject) || 'none';
  const e = clean(emotion) || 'neutral';
  const i = clean(input) || 'none';
  return `Type: ${t}\nSubject: ${s}\nEmotion: ${e}\nIntent: ${i}`;
}

// Splits a long single-line body into multiple lines on sentence boundaries.
// Ensures proper visual structure even if the model returns a paragraph.
function splitBodySentences(line) {
  const parts = String(line)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z])/);
  return parts.map(p => p.trim()).filter(Boolean);
}

function normalizePrayer(raw) {
  if (!raw) return '';
  // Normalize line endings, collapse triple blanks.
  const lines = String(raw)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(l => l.replace(/\s+$/g, '').trim())
    .filter(Boolean);
  if (lines.length < 2) return String(raw).trim();

  // Strip any accidental markdown bullets / numbering.
  const cleaned = lines.map(l => l.replace(/^([*\-•]|\d+[.)])\s+/, ''));

  // If middle is one long paragraph (i.e. total <= 3 lines), split the middle on sentence ends.
  if (cleaned.length <= 3) {
    const opening = cleaned[0];
    const closingIdx = cleaned.length - 1;
    const closing = /amen\.?/i.test(cleaned[closingIdx]) ? cleaned[closingIdx] : 'Amen.';
    const middleSource = cleaned.slice(1, closingIdx).join(' ');
    const bodyLines = splitBodySentences(middleSource).slice(0, 5);
    return [opening, ...bodyLines, closing].join('\n');
  }
  return cleaned.join('\n');
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

  const body = readJsonBody(req);
  const userMessage = buildUserMessage(body);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.85,
        max_tokens: 240,
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
    const text = normalizePrayer(raw);
    return res.status(200).json({ text });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
