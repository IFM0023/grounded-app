/**
 * OpenAI chat completions: SSE streaming drain + non-stream helper for Study API routes.
 */

export async function drainOpenAiSseToText(body, onDelta) {
  if (!body || typeof body.getReader !== 'function') {
    throw new Error('No response body');
  }
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
        if (typeof delta === 'string' && delta.length) {
          fullContent += delta;
          if (onDelta) onDelta(delta);
        }
      } catch {
        /* skip malformed SSE JSON */
      }
    }
  }

  const tail = buffer.trim();
  if (tail.startsWith('data:')) {
    const data = tail.slice(5).trim();
    if (data && data !== '[DONE]') {
      try {
        const json = JSON.parse(data);
        const delta = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
        if (typeof delta === 'string' && delta.length) {
          fullContent += delta;
          if (onDelta) onDelta(delta);
        }
      } catch {
        /* ignore */
      }
    }
  }

  return fullContent;
}

export async function openAiChatCompletionStartStream({ apiKey, requestBody, signal }) {
  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...requestBody, stream: true }),
    signal
  });
  return upstream;
}

export async function readOpenAiChatCompletionNonStream({ apiKey, requestBody, signal }) {
  const body = { ...requestBody };
  delete body.stream;
  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    const err = new Error('Upstream error');
    err.status = 502;
    err.detail = detail.slice(0, 200);
    throw err;
  }

  const data = await upstream.json();
  const raw =
    data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content != null
      ? String(data.choices[0].message.content).trim()
      : '';
  return raw;
}
