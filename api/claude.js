import { readRequestJson } from './read-request-json.js';

const ALLOWED_ORIGINS = new Set([
  'https://www.getgroundedapp.com',
  'http://localhost:5500',
  'http://localhost:3000',
]);

function setCors(res, origin) {
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Grounded-Token');
}

function isAuthorized(req) {
  const expected = process.env.GROUNDED_MARKETING_TOKEN;
  if (!expected) return false;
  const supplied = req.headers['x-grounded-token'] || '';
  return supplied === expected;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ALLOWED_ORIGINS.has(origin) || !isAuthorized(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const body = await readRequestJson(req);
    const system = body.system;
    const prompt = body.prompt;
    if (typeof system !== 'string' || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Request body must include string fields system and prompt' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    let data;
    try {
      data = await upstream.json();
    } catch {
      return res.status(500).json({ error: 'Invalid response from Anthropic' });
    }

    if (!upstream.ok) {
      const msg =
        (data && data.error && (data.error.message || data.error)) ||
        `Anthropic request failed (${upstream.status})`;
      return res.status(500).json({ error: String(msg) });
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e && e.message ? String(e.message) : 'Unknown error' });
  }
}
