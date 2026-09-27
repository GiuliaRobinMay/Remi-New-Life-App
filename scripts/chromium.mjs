// Zoekt een Chromium voor Playwright: CHROMIUM_PATH, anders de headless shell onder /opt/pw-browsers.
// De volledige Chromium 1194 weigert de oude headless-modus die Playwright 1.47 gebruikt; de headless shell werkt wel.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
export function chromiumPath() {
  if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  const versie = d => parseInt(d.split('-').pop(), 10) || 0;
  const dirs = readdirSync(base);
  const kandidaten = [
    ...dirs.filter(d => /^chromium_headless_shell-\d+$/.test(d)).sort((a, b) => versie(b) - versie(a)),
    ...dirs.filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => versie(b) - versie(a)),
  ];
  for (const d of kandidaten) for (const rel of ['chrome-linux/headless_shell', 'chrome-linux/chrome']) { const p = join(base, d, rel); if (existsSync(p)) return p; }
  return undefined;
}
