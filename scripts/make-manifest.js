// node scripts/make-manifest.js  (run automatically by the GitHub Action)
// Lists app files for precaching. Translation editions (except en) are left out
// on purpose: users download them from the in-app Offline panel.
const fs = require('fs'), path = require('path');
const SKIP_TOP = new Set(['.git', '.github', 'node_modules', 'scripts', 'sw.js', 'precache-manifest.json', 'README.md', 'LICENSE']);
const files = [];
(function walk(dir) {
  for (const n of fs.readdirSync(dir)) {
    if (dir === '.' && SKIP_TOP.has(n)) continue;
    const p = path.posix.join(dir === '.' ? '' : dir.split(path.sep).join('/'), n);
    fs.statSync(p).isDirectory() ? walk(p) : files.push(p);
  }
})('.');
const core = files.filter(f => !f.startsWith('assets/data/editions/') || f.endsWith('/en.json')).sort();
fs.writeFileSync('precache-manifest.json', JSON.stringify({ generated: new Date().toISOString(), files: core }, null, 1));
const mb = core.reduce((a, f) => a + fs.statSync(f).size, 0) / 1048576;
console.log(`${core.length} files, ${mb.toFixed(1)} MB precached`);
