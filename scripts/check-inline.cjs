const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'index.html');
const s = fs.readFileSync(p, 'utf8');
const needle = '<script src="js/study-app.js"></script>';
const i = s.indexOf(needle);
if (i < 0) throw new Error('study-app script tag not found');
const j = s.indexOf('<script>', i + needle.length);
const k = s.indexOf('<!-- PWA: register', j);
if (j < 0 || k < 0) throw new Error('inline script bounds not found');
const close = s.indexOf('</script>', j + 8);
if (close < 0 || close > k) throw new Error('could not locate closing script before PWA comment');
const js = s.slice(j + '<script>'.length, close);
const r = require('child_process').spawnSync(process.execPath, ['--check', '-'], {
  input: js,
  encoding: 'utf8'
});
process.stdout.write(r.stderr || r.stdout || '');
process.exit(r.status === null ? 1 : r.status);
