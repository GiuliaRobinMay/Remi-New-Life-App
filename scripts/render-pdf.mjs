// Renders the CV (and optionally a tailored variant) to PDF with the pre-installed Chromium.
// Usage: node scripts/render-pdf.mjs [variant-slug]   -> documents/generated/<slug>/cv.pdf or documents/generated/cv-master.pdf
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync } from 'node:fs';
import { chromiumPath } from './chromium.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2] || '';
const port = 4199;
const server = spawn(process.execPath, [join(root, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
try {
  const { chromium } = await import('playwright').catch(() => ({ chromium: null }));
  const url = `http://localhost:${port}/cv.html${slug ? `?variant=${encodeURIComponent(slug)}` : ''}`;
  const outDir = slug ? join(root, 'documents', 'generated', slug) : join(root, 'documents', 'generated');
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, slug ? 'cv.pdf' : 'cv-master.pdf');
  if (chromium) {
    const browser = await chromium.launch({ executablePath: chromiumPath() });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
    await browser.close();
  } else {
    // Fallback: headless Chromium binary directly.
    const bin = ['/opt/pw-browsers/chromium/chrome-linux/chrome', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', 'chromium', 'google-chrome'].find(b => b.startsWith('/') ? existsSync(b) : true);
    await new Promise((res, rej) => {
      const p = spawn(bin, ['--headless=new', '--disable-gpu', '--no-sandbox', `--print-to-pdf=${out}`, '--no-pdf-header-footer', url], { stdio: 'inherit' });
      p.on('exit', c => c === 0 ? res() : rej(new Error('chromium exit ' + c)));
    });
  }
  console.log('PDF geschreven:', out);
} finally {
  server.kill();
}
