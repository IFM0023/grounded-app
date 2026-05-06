import { readRequestJson } from './read-request-json.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
        model: 'claude-sonnet-4-5',
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
