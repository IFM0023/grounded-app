import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

function buildUserPrompt(verse, reflection) {
  return `
You are writing a short, calm reflection for a faith-based app.

INPUT:
Verse: ${verse}
Reflection: ${reflection}

TASK:
Write 2–3 sentences explaining what this means in a real, personal way.

RULES:
- Keep it simple and human
- No preaching or sounding like a sermon
- No complex theology
- Focus on emotional clarity and real life
- Should feel like guidance, not instruction
- Max 3 sentences

EXAMPLE STYLE:
"You don't have to carry everything on your own. This moment is a reminder that peace comes when you release control and trust that you are being guided."

OUTPUT:
Return ONLY the reflection text.
`.trim();
}

function normalizeMeaningText(raw) {
  let t = String(raw || '')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > 900) t = t.slice(0, 897).trim() + '\u2026';
  return t;
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
  const verse = String(body.verse || '').trim().slice(0, 1400);
  const reflection = String(body.reflection || '').trim().slice(0, 1400);

  if (!verse && !reflection) {
    return res.status(400).json({ error: 'Missing verse and reflection' });
  }

  const userPrompt = buildUserPrompt(verse, reflection);

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
        max_tokens: 280,
        messages: [
          {
            role: 'system',
            content:
              'You follow the user template exactly. Reply with plain prose only: no markdown, no title, no bullet list, no quotation marks wrapping the whole reply.'
          },
          { role: 'user', content: userPrompt }
        ]
      }),
      signal: controller.signal
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return res.status(502).json({ error: 'Upstream error', status: upstream.status, detail: detail.slice(0, 200) });
    }

    const data = await upstream.json();
    const raw =
      (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    const meaning = normalizeMeaningText(raw);
    if (!meaning) {
      return res.status(502).json({ error: 'Empty response' });
    }
    return res.status(200).json({ meaning });
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(String(e)));
    return res.status(aborted ? 504 : 500).json({ error: aborted ? 'Timeout' : 'Generation failed' });
  } finally {
    clearTimeout(timeout);
  }
}
