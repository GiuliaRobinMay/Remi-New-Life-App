// End-to-end controle van de app met Playwright en de lokale Chromium. Gebruik: node scripts/test-app.mjs
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromiumPath } from './chromium.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = 4197;
const server = spawn(process.execPath, [join(root, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const base = `http://localhost:${port}/`;
const fouten = []; const geslaagd = [];
const check = (naam, ok, detail = '') => (ok ? geslaagd : fouten).push(`${naam}${detail ? ': ' + detail : ''}`);
const VIEWS = { overzicht: [], stappenplan: ['open', 'klaar', 'alles'], planning: [], rechten: ['kern', 'scenarios', 'opzeg', 'werkloosheid', 'steun', 'check'], sollicitaties: [], vacatures: ['bewaard', 'zoeken', 'bronnen'], hotlist: [], verkenning: ['alles', 'erfgoed', 'sociaal'], opleidingen: ['alles', 'erfgoed'], cv: ['start', 'gegevens', 'profiel', 'ervaring', 'opleiding', 'vaardigheden', 'competenties', 'portfolio', 'extra', 'zelftests', 'voorbeelden', 'gids', 'afdrukken'], vragenlijst: ['praktisch', 'werk'], profiel: ['samenvatting', 'tests', 'herzieningen'], documenten: ['cv', 'sjablonen', 'vdab', 'gegenereerd'] };
try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  for (const [label, viewport] of [['desktop', { width: 1366, height: 860 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, timezoneId: 'Europe/Brussels', locale: 'nl-BE' });
    const page = await ctx.newPage();
    const consoleErr = [];
    page.on('pageerror', e => consoleErr.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) consoleErr.push(m.text()); });
    for (const [v, tabs] of Object.entries(VIEWS)) {
      for (const t of tabs.length ? tabs : [null]) {
        await page.goto(`${base}#/${v}${t ? '?tab=' + t : ''}`, { waitUntil: 'networkidle' });
        const naam = await page.textContent('.chrome__name');
        const actief = await page.$eval('.sidebar__item--active .sidebar__label', e => e.textContent).catch(() => '');
        const verwacht = { overzicht: 'Overzicht', stappenplan: 'Stappenplan', planning: 'Planning', rechten: 'Rechten', sollicitaties: 'Sollicitaties', vacatures: 'Vacatures', hotlist: 'Hotlist', verkenning: 'Verkenning', opleidingen: 'Opleidingen', cv: 'Cv-atelier', vragenlijst: 'Vragenlijst', profiel: 'Profiel', documenten: 'Documenten' }[v];
        check(`${label} route ${v}${t ? '?tab=' + t : ''}`, naam === verwacht && actief === verwacht, `chrome=${naam} nav=${actief}`);
        if (t) { const at = await page.$eval('.tabs__item--active', e => e.getAttribute('href')).catch(() => ''); check(`${label} actieve tab ${v}/${t}`, at.endsWith(`tab=${t}`), at); }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        check(`${label} geen horizontale overloop ${v}${t ? '/' + t : ''}`, overflow <= 1, `${overflow}px`);
      }
    }
    check(`${label} geen consolefouten`, consoleErr.length === 0, consoleErr.slice(0, 5).join(' | '));

    if (label === 'desktop') {
      // Datums in Belgische tijd
      const d = await page.evaluate(async () => { const m = await import('./js/ui.js'); return [m.addDays('2026-10-01', 12), m.daysUntil(m.addDays(m.todayIso(), 5)), m.isoLocal(new Date(2026, 9, 26))]; });
      check('addDays in lokale tijd', d[0] === '2026-10-13', d[0]); check('daysUntil', d[1] === 5, String(d[1])); check('isoLocal', d[2] === '2026-10-26', d[2]);
      // Opzegrekenhulp: maandag na de week van kennisgeving
      await page.goto(`${base}#/rechten?tab=opzeg`, { waitUntil: 'networkidle' });
      await page.fill('input[type=date]', '2026-10-20');
      await page.dispatchEvent('input[type=date]', 'change');
      const opz = await page.textContent('.cv-frame, .content');
      check('opzeg: brief 20 okt, kennis 23 okt, start maandag 26 okt', /23 okt 2026/.test(opz) && /maandag 26 okt 2026/.test(opz), (opz.match(/Kennisgeving[^.]*\.[^.]*\./) || [''])[0]);
      await page.fill('input[type=date]', ''); await page.dispatchEvent('input[type=date]', 'change');
      // Zoeken houdt de focus
      await page.goto(`${base}#/hotlist`, { waitUntil: 'networkidle' });
      await page.click('.zonesearch input'); await page.keyboard.type('kms', { delay: 60 });
      const zoek = await page.evaluate(() => ({ v: document.querySelector('.zonesearch input').value, f: document.activeElement === document.querySelector('.zonesearch input'), rows: document.querySelectorAll('.grid2__table tbody tr:not(.grid2__fold)').length }));
      check('zoeken houdt focus en filtert', zoek.v === 'kms' && zoek.f && zoek.rows === 1, JSON.stringify(zoek));
      // Spontane sollicitatie uit de hotlist
      await page.goto(`${base}#/hotlist`, { waitUntil: 'networkidle' });
      await page.click('.grid2__open >> nth=0');
      await page.click('text=Spontane sollicitatie starten');
      await page.fill('.peek input.field >> nth=1', 'Technisch medewerker atelier');
      await page.click('.peek button[type=submit]');
      await page.waitForTimeout(200);
      await page.click('.peek .chip:has-text("Verstuurd")');
      await page.waitForTimeout(200);
      const peekTekst = await page.textContent('.peek__body');
      check('status verstuurd zet opvolgdatum', /Opvolgen op/.test(peekTekst), (peekTekst.match(/Opvolgen op[^.]*/) || [''])[0]);
      await page.goto(`${base}#/sollicitaties`, { waitUntil: 'networkidle' });
      const kls = await page.$eval('.grid2__table select.status', e => e.className).catch(() => 'geen');
      check('statuskleur verstuurd is oranje', /status--orange/.test(kls), kls);
      // Cv-atelier: gegevens bewaren en tonen
      await page.goto(`${base}#/cv?tab=gegevens`, { waitUntil: 'networkidle' });
      const naamVeld = page.locator('[data-fk="cv-naam"]');
      await naamVeld.fill('Remi Testnaam'); await naamVeld.press('Tab');
      await page.locator('[data-fk="cv-email"]').fill('remi@voorbeeld.be'); await page.keyboard.press('Tab');
      const focusNaTab = await page.evaluate(() => document.activeElement?.dataset?.fk || document.activeElement?.tagName);
      check('tab naar volgend veld behoudt focus', focusNaTab === 'cv-geb', focusNaTab);
      await page.goto(`${base}#/cv?tab=profiel`, { waitUntil: 'networkidle' });
      await page.goto(`${base}#/cv?tab=gegevens`, { waitUntil: 'networkidle' });
      check('cv-naam blijft bewaard', (await naamVeld.inputValue()) === 'Remi Testnaam');
      await page.goto(`${base}cv.html`, { waitUntil: 'networkidle' });
      check('afdrukversie toont lokale naam', /Remi Testnaam/.test(await page.textContent('h1')));
      // Competentiescan
      await page.goto(`${base}#/cv?tab=competenties`, { waitUntil: 'networkidle' });
      const heeftComp = await page.$('details.comp');
      if (heeftComp) {
        await page.click('details.comp >> nth=0 >> summary');
        await page.click('details.comp >> nth=0 >> .chips .chip >> nth=3');
        const st = await page.evaluate(() => ({ open: document.querySelector('details.comp').open, lab: document.querySelector('details.comp .comp__score').textContent }));
        check('score klikken houdt blok open en toont score', st.open && /^4 van 5/.test(st.lab), JSON.stringify(st));
        await page.click('details.comp >> nth=0 >> text=Op mijn cv zetten');
        const opCv = await page.evaluate(async () => { const s = await import('./js/store.js'); const d = s.get('cvdoc', 'remi'); return (d?.competenties || []).length; });
        check('competentie op cv komt in cv-document', opCv === 1, String(opCv));
      } else check('competentiescan geladen', false, 'geen competenties');
      // Werkwaarden
      await page.goto(`${base}#/cv?tab=zelftests`, { waitUntil: 'networkidle' });
      const ww = page.locator('.chips >> nth=0 >> .chip');
      if (await ww.count()) { await ww.nth(0).click(); await ww.nth(1).click(); const n = await page.locator('.chips >> nth=0 >> .chip--active').count(); check('werkwaarden kiezen', n === 2, String(n)); }
      // Vragenlijst: antwoord en tab behouden focus
      await page.goto(`${base}#/vragenlijst`, { waitUntil: 'networkidle' });
      await page.locator('[data-fk="vl-p01"]').fill('Test'); await page.keyboard.press('Tab');
      const vf = await page.evaluate(() => document.activeElement?.dataset?.fk);
      check('vragenlijst: tab naar volgende vraag', vf === 'vl-p02', vf);
      // Import weigert een vreemd bestand
      const imp = await page.evaluate(async () => { const s = await import('./js/store.js'); try { s.importJson('{"foo":1}'); return 'aanvaard'; } catch { return 'geweigerd'; } });
      check('import weigert vreemd bestand', imp === 'geweigerd', imp);
    }
    await ctx.close();
  }
  await browser.close();
} catch (e) { fouten.push('script: ' + e.message); }
finally { server.kill(); }
console.log(`Geslaagd: ${geslaagd.length}`);
if (fouten.length) { console.log(`Mislukt: ${fouten.length}`); fouten.forEach(f => console.log(' - ' + f)); process.exitCode = 1; } else console.log('Alles in orde.');
