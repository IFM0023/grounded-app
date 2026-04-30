/**
 * Copy Capacitor core + notification plugins into js/ for live-server and www builds.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const jsDir = path.join(root, 'js');
const copies = [
  ['node_modules/@capacitor/core/dist/capacitor.js', 'js/capacitor.js'],
  ['node_modules/@capacitor/local-notifications/dist/plugin.js', 'js/cap-local-notifications.js'],
  ['node_modules/@capacitor/push-notifications/dist/plugin.js', 'js/cap-push-notifications.js']
];

if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });

for (const [relFromRoot, relDest] of copies) {
  const src = path.join(root, relFromRoot);
  const dest = path.join(root, relDest);
  if (!fs.existsSync(src)) {
    console.warn('[copy-capacitor-runtime] skip (missing):', relFromRoot);
    continue;
  }
  fs.copyFileSync(src, dest);
}
