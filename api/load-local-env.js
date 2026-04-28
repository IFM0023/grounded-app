import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let didLoad = false;

/** When OPENAI_* is missing, read `.env.local` / `.env` from the project root (fixes `vercel dev` not injecting env into some serverless runs). */
export function loadLocalEnv() {
  if (didLoad) return;
  didLoad = true;
  if (process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY || process.env.OPENAI_KEY) return;

  const roots = [process.cwd(), path.join(__dirname, '..')];
  const seen = new Set();
  for (const root of roots) {
    const norm = path.resolve(root);
    if (seen.has(norm)) continue;
    seen.add(norm);
    for (const name of ['.env.local', '.env']) {
      const full = path.join(norm, name);
      if (!fs.existsSync(full)) continue;
      let txt = fs.readFileSync(full, 'utf8');
      if (txt.charCodeAt(0) === 0xfeff) txt = txt.slice(1);
      for (const line of txt.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const eq = t.indexOf('=');
        if (eq < 1) continue;
        const key = t.slice(0, eq).trim();
        let val = t.slice(eq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key && (process.env[key] === undefined || process.env[key] === '')) {
          process.env[key] = val;
        }
      }
    }
  }
}
