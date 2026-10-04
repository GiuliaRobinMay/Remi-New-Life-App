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
const VIEWS = { overzicht: [], stappenplan: ['open', 'klaar', 'alles'], planning: ['kalender', 'fasen'], rechten: ['kern', 'verwittiging', 'scenarios', 'opzeg', 'werkloosheid', 'steun', 'check'], communicatie: ['mails', 'brieven', 'sms', 'logboek'], sollicitaties: [], vacatures: ['bewaard', 'zoeken', 'bronnen'], hotlist: [], verkenning: ['alles', 'erfgoed', 'sociaal'], opleidingen: ['alles', 'erfgoed'], cv: ['start', 'gegevens', 'profiel', 'ervaring', 'opleiding', 'vaardigheden', 'competenties', 'portfolio', 'extra', 'zelftests', 'voorbeelden', 'gids', 'afdrukken'], vragenlijst: ['praktisch', 'werk'], profiel: ['samenvatting', 'tests', 'herzieningen'], documenten: ['cv', 'sjablonen', 'vdab', 'gegenereerd'] };
let browser;
try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ executablePath: chromiumPath() });
  for (const [label, viewport] of [['desktop', { width: 1366, height: 860 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, timezoneId: 'Europe/Brussels', locale: 'nl-BE' });
    // Externe verzoeken (Google Fonts) blokkeren: offline hangen ze tot een time-out en vertragen networkidle.
    await ctx.route(url => !url.href.startsWith(base), r => r.abort());
    const page = await ctx.newPage();
    const consoleErr = [];
    page.on('pageerror', e => consoleErr.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|ERR_FAILED|fonts\.g/.test(m.text())) consoleErr.push(m.text()); });
    for (const [v, tabs] of Object.entries(VIEWS)) {
      for (const t of tabs.length ? tabs : [null]) {
        await page.goto(`${base}#/${v}${t ? '?tab=' + t : ''}`, { waitUntil: 'networkidle' });
        const naam = await page.textContent('.chrome__name');
        const actief = await page.$eval('.sidebar__item--active .sidebar__label', e => e.textContent).catch(() => '');
        const verwacht = { overzicht: 'Overzicht', stappenplan: 'Stappenplan', planning: 'Planning', rechten: 'Rechten', communicatie: 'Communicatie', sollicitaties: 'Sollicitaties', vacatures: 'Vacatures', hotlist: 'Hotlist', verkenning: 'Verkenning', opleidingen: 'Opleidingen', cv: 'Cv-atelier', vragenlijst: 'Vragenlijst', profiel: 'Profiel', documenten: 'Documenten' }[v];
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
      // Concepten van spontane sollicitaties: zichtbaar en gekoppeld aan documenten
      await page.goto(`${base}#/sollicitaties`, { waitUntil: 'networkidle' });
      const voorbereid = await page.locator('.grid2__table tbody tr:not(.grid2__fold)').count();
      check('concepten staan in sollicitaties', voorbereid >= 12, String(voorbereid));
      await page.fill('.zonesearch input', 'KMSKA');
      await page.click('.grid2__open >> nth=0');
      const docs = await page.textContent('.peek__body');
      check('concept KMSKA heeft cv-versie, brief en mail', /Cv-variant/.test(docs) && /Brief kopi/.test(docs) && /Mail kopi/.test(docs), docs.slice(0, 120));
      await page.goto(`${base}cv.html?variant=kmska-spontaan`, { waitUntil: 'networkidle' });
      check('cv-versie KMSKA laadt', /versie kmska-spontaan/.test(await page.textContent('#barTitle')));
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
      // Kalender: maand oktober 2026 met de doktersafspraak op vrijdag 16
      await page.goto(`${base}#/planning?tab=kalender&m=2026-10`, { waitUntil: 'networkidle' });
      const kal = await page.evaluate(() => ({ titel: document.querySelector('.cal__titel').textContent, cellen: document.querySelectorAll('.cal__day').length, eerste: document.querySelector('.cal__day .cal__num').textContent }));
      check('kalender oktober 2026 start op maandag 28 september', kal.titel === 'oktober 2026' && kal.cellen === 35 && kal.eerste === '28', JSON.stringify(kal));
      await page.click('.cal__day[aria-label^="16 okt"]');
      check('dag openen toont de doktersafspraak', /Doktersafspraak/.test(await page.textContent('.peek__body')));
      await page.click('#peekClose');
      await page.click('a[aria-label="Volgende maand"]');
      await page.waitForFunction(() => document.querySelector('.cal__titel')?.textContent !== 'oktober 2026', null, { timeout: 3000 }).catch(() => {});
      check('volgende maand', (await page.textContent('.cal__titel')) === 'november 2026');
      // Communicatie: contractmail bewerken, bewaren en als verstuurd in het logboek zetten
      await page.goto(`${base}#/communicatie?tab=mails`, { waitUntil: 'networkidle' });
      const mail = page.locator('[data-fk="msg-msg-contract-mail"]');
      check('contractmail staat klaar', /arbeidsovereenkomst/.test(await mail.inputValue()) && /arbeidsreglement/.test(await mail.inputValue()));
      await mail.fill((await mail.inputValue()).replace('[naam]', 'Jan'));
      await page.waitForTimeout(600);
      await page.goto(`${base}#/communicatie?tab=brieven`, { waitUntil: 'networkidle' });
      await page.goto(`${base}#/communicatie?tab=mails`, { waitUntil: 'networkidle' });
      check('aangepaste mail blijft bewaard', /Beste Jan,/.test(await mail.inputValue()));
      page.once('dialog', d => d.accept());
      await page.click('text=Markeer als verstuurd');
      await page.waitForTimeout(200);
      await page.goto(`${base}#/communicatie?tab=logboek`, { waitUntil: 'networkidle' });
      check('verstuurde mail staat in het logboek', /Vraag om een kopie van mijn arbeidsovereenkomst/.test(await page.textContent('.content')));
      await page.click('text=Contact noteren');
      await page.fill('.peek input[type=text] >> nth=1', 'Telefoon met ACV');
      await page.click('.peek button[type=submit]');
      await page.waitForTimeout(200);
      check('contact noteren', /Telefoon met ACV/.test(await page.textContent('.content')));
      // Import weigert een vreemd bestand
      const imp = await page.evaluate(async () => { const s = await import('./js/store.js'); try { s.importJson('{"foo":1}'); return 'aanvaard'; } catch { return 'geweigerd'; } });
      check('import weigert vreemd bestand', imp === 'geweigerd', imp);
    }
    await ctx.close();
  }
  await browser.close();
} catch (e) { fouten.push('script: ' + e.message); }
finally { await browser?.close().catch(() => {}); server.kill(); }
console.log(`Geslaagd: ${geslaagd.length}`);
if (fouten.length) { console.log(`Mislukt: ${fouten.length}`); fouten.forEach(f => console.log(' - ' + f)); process.exitCode = 1; } else console.log('Alles in orde.');
