// Takes desktop and phone screenshots of every view for a visual check. Output: screenshots/
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { chromiumPath } from './chromium.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = 4198;
const server = spawn(process.execPath, [join(root, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const views = ['overzicht', 'stappenplan', 'sollicitaties', 'vacatures', 'hotlist', 'verkenning', 'opleidingen', 'planning', 'rechten', 'profiel', 'documenten'];
  mkdirSync(join(root, 'screenshots'), { recursive: true });
  const errors = [];
  for (const [label, viewport] of [['desktop', { width: 1366, height: 860 }], ['phone', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', e => errors.push(`${label}: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`${label} console: ${m.text()}`); });
    for (const v of views) {
      await page.goto(`http://localhost:${port}/#/${v}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);
      await page.screenshot({ path: join(root, 'screenshots', `${label}-${v}.png`), fullPage: false });
    }
    await page.goto(`http://localhost:${port}/cv.html`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(root, 'screenshots', `${label}-cv.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
  if (errors.length) { console.error('Fouten:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('Screenshots klaar zonder fouten.');
} finally {
  server.kill();
}
