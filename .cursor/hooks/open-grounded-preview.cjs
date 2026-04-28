#!/usr/bin/env node
/**
 * After the agent edits grounded-app files, open index.html in the default browser
 * (new tab). Throttled so one burst of edits does not open dozens of tabs.
 * Requires: open this workspace folder (grounded-app) as the Cursor project root
 * so .cursor/hooks.json is picked up.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const THROTTLE_MS = 4000;
const THROTTLE_FILE = path.join(os.tmpdir(), 'grounded-open-preview-hook.txt');

function openInBrowser(filePath) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', filePath], { detached: true, stdio: 'ignore' }).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [filePath], { detached: true, stdio: 'ignore' }).unref();
  } else {
    spawn('xdg-open', [filePath], { detached: true, stdio: 'ignore' }).unref();
  }
}

let stdin = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => {
  stdin += c;
});
process.stdin.on('end', () => {
  try {
    const j = JSON.parse(stdin || '{}');
    const fp = j.file_path || '';
    const norm = fp.replace(/\\/g, '/');
    if (!/grounded-app\//i.test(norm) && !norm.endsWith('grounded-app/index.html')) {
      process.stdout.write('{}');
      return;
    }
    if (!/(index\.html|sw\.js)$/i.test(fp)) {
      process.stdout.write('{}');
      return;
    }
    const dir = path.dirname(fp);
    const htmlPath = path.join(dir, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      process.stdout.write('{}');
      return;
    }
    const now = Date.now();
    try {
      const last = parseInt(fs.readFileSync(THROTTLE_FILE, 'utf8'), 10) || 0;
      if (now - last < THROTTLE_MS) {
        process.stdout.write('{}');
        return;
      }
    } catch (_) {}
    fs.writeFileSync(THROTTLE_FILE, String(now), 'utf8');
    openInBrowser(htmlPath);
  } catch (_) {}
  process.stdout.write('{}');
});
