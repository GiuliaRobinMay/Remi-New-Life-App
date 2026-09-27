// Bundles data/*.json into app/js/seed.js so the app runs as static files without a server fetch.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
const seed = {};
for (const f of files) {
  const key = f.replace(/\.json$/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  seed[key] = JSON.parse(readFileSync(join(dataDir, f), 'utf8'));
}
// Generated documents per application: documents/generated/<slug>/{cv.json,brief.md,mail.md}
const genDir = join(root, 'documents', 'generated');
seed.gegenereerd = [];
if (existsSync(genDir)) {
  for (const slug of readdirSync(genDir)) {
    const dir = join(genDir, slug);
    if (!statSync(dir).isDirectory()) continue;
    const entry = { slug };
    for (const [name, key] of [['cv.json', 'cv'], ['brief.md', 'brief'], ['mail.md', 'mail'], ['meta.json', 'meta']]) {
      const p = join(dir, name);
      if (existsSync(p)) entry[key] = name.endsWith('.json') ? JSON.parse(readFileSync(p, 'utf8')) : readFileSync(p, 'utf8');
    }
    seed.gegenereerd.push(entry);
  }
}
// Templates as text
const tplDir = join(root, 'documents', 'templates');
seed.sjablonen = {};
if (existsSync(tplDir)) {
  for (const f of readdirSync(tplDir)) seed.sjablonen[f] = readFileSync(join(tplDir, f), 'utf8');
}
seed.gebouwdOp = new Date().toISOString();
const out = `// Gegenereerd door scripts/build-data.mjs op ${seed.gebouwdOp}. Niet met de hand bewerken: pas data/*.json aan en draai npm run build:data.\nexport const seed = ${JSON.stringify(seed, null, 1)};\n`;
writeFileSync(join(root, 'app', 'js', 'seed.js'), out);
console.log(`seed.js geschreven: ${Object.keys(seed).join(', ')}`);
