/**
 * Static web → www/ for Capacitor (Codemagic / local). Replace with a real bundler if you add one.
 */
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const www = path.join(root, 'www');
const files = [
  'index.html',
  'admin.html',
  'manifest.json',
  'sw.js',
  'widget.html',
  'bibleData.js',
  'icon-192.png',
  'icon-512.png'
];
const dirs = ['assets', 'js', 'css'];

try {
  require(path.join(__dirname, 'copy-capacitor-runtime.cjs'));
} catch (e) {
  console.warn('[build-www] copy-capacitor-runtime failed', e && e.message);
}

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
for (const f of files) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(www, f));
}
for (const d of dirs) {
  const src = path.join(root, d);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(www, d), { recursive: true });
}
