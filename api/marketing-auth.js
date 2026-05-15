/**
 * Password gate for /grounded_marketing_center.
 * POST { password } → { token } on success, 401 on failure.
 * Token is then threaded through every /api/claude call as X-Grounded-Token.
 */
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  setCors(res, origin);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const expectedPassword = process.env.MARKETING_PASSWORD;
  const token = process.env.GROUNDED_MARKETING_TOKEN;

  if (!expectedPassword || !token) {
    return res.status(503).json({ error: 'Auth not configured' });
  }

  let body = {};
  try {
    body = await readRequestJson(req);
  } catch {}

  const supplied = String(body.password || '');
  if (!supplied || supplied !== expectedPassword) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  return res.status(200).json({ token });
}
