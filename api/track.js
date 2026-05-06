/**
 * Analytics ingest — Vercel serverless.
 * Shares storage with ./events.js via globalThis (warm invocations).
 */
import { getPostHogClient } from './posthog.js';

const STORE_KEY = '__groundedAnalyticsEvents';

function cors(res, req) {
  const origin = req.headers && req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

async function readJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      const raw = req.body.toString('utf8');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  if (typeof req.body === 'string') {
    try {
      const t = req.body.trim();
      return t ? JSON.parse(req.body) : {};
    } catch {
      return {};
    }
  }
  if (typeof req.json === 'function') {
    try {
      return await req.json();
    } catch {
      /* fall through */
    }
  }
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on('data', function (c) {
      chunks.push(c);
    });
    req.on('end', function () {
      try {
        var raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  cors(res, req);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = await readJsonBody(req);
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    if (event.event == null || event.event === '') {
      return res.status(400).json({ error: 'Missing event' });
    }

    const g = globalThis;
    if (!g[STORE_KEY]) g[STORE_KEY] = [];
    g[STORE_KEY].push({
      ...event,
      receivedAt: Date.now(),
      tsIso: new Date().toISOString()
    });

    const posthog = getPostHogClient();
    const distinctId = event.distinctId || event.userId || event.anonymous_id || 'anonymous';
    const { event: eventName, distinctId: _d, userId: _u, anonymous_id: _a, ...properties } = event;
    posthog.capture({ distinctId, event: eventName, properties });
    await posthog.flushAsync();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Track error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
