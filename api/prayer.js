import { loadLocalEnv } from './load-local-env.js';
import { readRequestJson } from './read-request-json.js';
loadLocalEnv();

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

function clean(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

/** When the app sends a weekly theme, extend the system prompt so prayers feel connected to that arc. */
function buildSystemPromptForBody(body) {
  const wt = clean(body && body.weeklyTheme).slice(0, 160);
  const wts = clean(body && body.weeklyThemeSub).slice(0, 280);
  if (!wt) return SYSTEM_PROMPT;
  return (
    SYSTEM_PROMPT +
    '\n\nWeekly devotional context (shape warmth and imagery to fit this spiritual season; do not read aloud ' +
    'the theme as a title, label, or worksheet heading, and do not quote these strings verbatim):\n' +
    `Theme: ${wt}\n` +
    (wts ? `Angle: ${wts}\n` : '') +
    'Let the prayer feel honest and adjacent to what they are sitting with this week — natural, not forced.'
  );
}

function buildUserMessage({ type, subject, input, emotion, fromVerse, verseRef, verseText, intent, tone }) {
  const t = clean(type).slice(0, 80) || 'general';
  const s = clean(subject).slice(0, 200) || 'none';
  const e = clean(emotion).slice(0, 40) || 'neutral';
  const i = clean(input).slice(0, 400) || 'none';
  if (String(t).toLowerCase() === 'open') {
    const intentStr = clean(intent).slice(0, 400) || 'user unsure what to pray';
    const toneStr = clean(tone).slice(0, 120) || 'calm, simple, grounded';
    return (
      'The user asked for help finding words to pray. They are not sure what to say right now.\n' +
      `Situation: ${intentStr}\n` +
      `Voice: ${toneStr}\n\n` +
      'Write one short prayer they could honestly say out loud. Use the same structural format as always ' +
      '(one opening line, then body lines each on their own line, then Amen.). ' +
      'Body: 3–5 short sentences total across those lines — simple everyday words, warm and real, not preachy or formal. ' +
      'No filler, no repeating the same idea twice.'
    );
  }
  if (fromVerse && verseText && verseRef) {
    const vt = clean(verseText).slice(0, 700);
    const vr = clean(verseRef).slice(0, 80);
    return (
      `Write a prayer inspired by this verse: "${vt}" (${vr}).\n` +
      `Theme focus: ${t}\nEmotion: ${e}\n` +
      `Do not quote the verse verbatim; let its meaning shape the prayer.\n` +
      (i !== 'none' ? `Additional intent: ${i}` : '')
    );
  }
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

  const body = await readRequestJson(req);
  const userMessage = buildUserMessage(body);
  const systemPrompt = buildSystemPromptForBody(body);

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
          { role: 'system', content: systemPrompt },
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
