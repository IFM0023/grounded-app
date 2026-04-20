// Vercel serverless function — generates a short Christian prayer via OpenAI.
// Requires the OPENAI_API_KEY env var to be set in the Vercel project.
// If unset or upstream fails, the client falls back to its structured generator.

const SYSTEM_PROMPT = `You write short, heartfelt Christian prayers.
Rules:
- Natural, warm, conversational tone
- Do NOT quote or repeat the user's input
- Avoid robotic phrasing
- Structure:
  Opening (e.g., 'Heavenly Father,')
  3–4 lines
  Closing ('Amen.')
- If a subject is provided, refer to them naturally (use correct pronouns)
- Keep it concise and calming`;

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
    const text = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();
    if (!text) {
      return res.status(502).json({ error: 'Empty response' });
    }
    return res.status(200).json({ text });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
