/**
 * Read JSON POST bodies reliably on Vercel Node runtimes.
 * Prefer platform-parsed req.body, then Node's stream consumer (more reliable
 * than manual chunk listeners with some IncomingMessage implementations).
 */
import { json as jsonFromStream } from 'node:stream/consumers';

export async function readRequestJson(req) {
  if (req == null) return {};

  if (req.body != null) {
    if (Buffer.isBuffer(req.body)) {
      try {
        const raw = req.body.toString('utf8');
        if (!raw) return {};
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    if (typeof req.body === 'string') {
      try {
        const t = req.body.trim();
        if (!t) return {};
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    if (typeof req.body === 'object') return req.body;
  }

  if (typeof req.json === 'function') {
    try {
      return await req.json();
    } catch {
      /* fall through */
    }
  }

  try {
    const parsed = await jsonFromStream(req);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
