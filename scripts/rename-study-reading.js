const fs = require('fs');
const path = require('path');

function applyStudyReadingRenames(s) {

const reps = [
  ['study-app-root--wjv2-complete', 'study-app-root--reading-complete'],
  ['study-app-root--wjv2', 'study-app-root--reading'],
  ['study-wjv2-vmodal-dismiss', 'study-reading-verse-modal-dismiss'],
  ['study-wjv2-vmodal-card', 'study-reading-verse-modal-card'],
  ['study-wjv2-vmodal-inner', 'study-reading-verse-modal-inner'],
  ['study-wjv2-vmodal-ref', 'study-reading-verse-modal-ref'],
  ['study-wjv2-vmodal-verse', 'study-reading-verse-modal-verse'],
  ['study-wjv2-vmodal-loading', 'study-reading-verse-modal-loading'],
  ['study-wjv2-vmodal-load-line--one', 'study-reading-verse-modal-load-line--one'],
  ['study-wjv2-vmodal-load-line--two', 'study-reading-verse-modal-load-line--two'],
  ['study-wjv2-vmodal-load-line', 'study-reading-verse-modal-load-line'],
  ['study-wjv2-vmodal-sections', 'study-reading-verse-modal-sections'],
  ['study-wjv2-vmodal-dual', 'study-reading-verse-modal-dual'],
  ['study-wjv2-vmodal', 'study-reading-verse-modal'],
  ['study-wjv2-vsec--prayer', 'study-reading-vsec--prayer'],
  ['study-wjv2-vsec-lbl', 'study-reading-vsec-lbl'],
  ['study-wjv2-vsec', 'study-reading-vsec'],
  ['study-wjv2-preview', 'study-reading-preview'],
  ['study-wjv2-complete-btn-secondary', 'study-reading-complete-btn-secondary'],
  ['study-wjv2-complete-link', 'study-reading-complete-link'],
  ['study-wjv2-complete-actions', 'study-reading-complete-actions'],
  ['study-wjv2-complete-secondary', 'study-reading-complete-secondary'],
  ['study-wjv2-complete-reflection', 'study-reading-complete-reflection'],
  ['study-wjv2-complete-title', 'study-reading-complete-title'],
  ['study-wjv2-complete-label', 'study-reading-complete-label'],
  ['study-wjv2--complete-layout', 'study-reading--complete-layout'],
  ['study-wjv2-complete', 'study-reading-complete'],
  ['study-wjv2-done-hint', 'study-reading-done-hint'],
  ['study-wjv2-reflect-label', 'study-reading-reflect-label'],
  ['study-wjv2-reflect-q', 'study-reading-reflect-q'],
  ['study-wjv2-reflect', 'study-reading-reflect'],
  ['study-wjv2-scripture-block', 'study-reading-scripture-block'],
  ['study-wjv2-ref-h', 'study-reading-ref-h'],
  ['study-wjv2-verses', 'study-reading-verses'],
  ['study-wjv2-intro', 'study-reading-intro'],
  ['study-wjv2-theme', 'study-reading-theme'],
  ['study-wjv2-kicker', 'study-reading-kicker'],
  ['study-wjv2-lede', 'study-reading-lede'],
  ['study-wjv2-scroll', 'study-reading-scroll'],
  ['study-wjv2-toolbar', 'study-reading-toolbar'],
  ['study-wjv2-footer', 'study-reading-footer'],
  ['study-wjv2-actions', 'study-reading-actions'],
  ['study-wjv2-chip', 'study-reading-chip'],
  ['study-wjv2-verse--focus', 'study-reading-verse--focus'],
  ['study-wjv2-verse-btn', 'study-reading-verse-btn'],
  ['study-wjv2-verse', 'study-reading-verse'],
  ['study-wjv2-sn', 'study-reading-sn'],
  ['study-wjv2-vtxt', 'study-reading-vtxt'],
  ['study-wjv2', 'study-reading'],
];

reps.forEach(([a, b]) => {
  s = s.split(a).join(b);
});

const acts = [
  ['wj-v2-complete-return', 'study-plan-complete-return'],
  ['wj-v2-complete-read-again', 'study-plan-complete-read-again'],
  ['wj-v2-complete-scripture', 'study-plan-complete-scripture'],
  ['wj-v2-verse-open', 'study-plan-verse-open'],
  ['wj-v2-sheet-close', 'study-plan-verse-sheet-close'],
  ['wj-v2-sheet-pray', 'study-plan-verse-sheet-pray'],
  ['wj-v2-sheet-reflect', 'study-plan-verse-sheet-reflect'],
];

acts.forEach(([a, b]) => {
  s = s.split(`data-act="${a}"`).join(`data-act="${b}"`);
  s = s.split(`data-act='${a}'`).join(`data-act='${b}'`);
});

  const extra = [
    ['studyWjv2CompleteIn', 'studyReadingCompleteIn'],
    ['wjv2LoadCrossA', 'studyReadingLoadCrossA'],
    ['wjv2LoadCrossB', 'studyReadingLoadCrossB'],
  ];
  extra.forEach(([a, b]) => {
    s = s.split(a).join(b);
  });
  return s;
}

const targets = [
  path.join(__dirname, '../js/study-app.js'),
  path.join(__dirname, '../index.html'),
];

targets.forEach((p) => {
  let s = fs.readFileSync(p, 'utf8');
  s = applyStudyReadingRenames(s);
  fs.writeFileSync(p, s);
  console.log('Updated', p);
});
