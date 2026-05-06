/**
 * Analytics list for /admin — same global store as ./track.js
 */
const STORE_KEY = '__groundedAnalyticsEvents';

function cors(res, req) {
  const origin = req.headers && req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default function handler(req, res) {
  cors(res, req);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const g = globalThis;
  const rows = Array.isArray(g[STORE_KEY]) ? g[STORE_KEY] : [];
  return res.status(200).json(rows);
}
