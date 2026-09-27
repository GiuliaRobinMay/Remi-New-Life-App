// Finds a Chromium binary for Playwright: the pre-installed one under /opt/pw-browsers, or CHROMIUM_PATH.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
export function chromiumPath() {
  if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  for (const d of readdirSync(base).filter(d => d.startsWith('chromium')).sort().reverse()) {
    for (const rel of ['chrome-linux/chrome', 'chrome-linux/headless_shell', 'chrome']) { const p = join(base, d, rel); if (existsSync(p)) return p; }
  }
  return undefined;
}
