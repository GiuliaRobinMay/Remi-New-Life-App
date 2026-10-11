// Test van de centrale database met twee toestellen (Giulia en Remi) en een nagebootste database.
// Gebruik: node scripts/test-sync.mjs
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromiumPath } from './chromium.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = 4198;
const server = spawn(process.execPath, [join(root, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const base = `http://localhost:${port}/`;
const fouten = []; const geslaagd = [];
const check = (naam, ok, detail = '') => (ok ? geslaagd : fouten).push(`${naam}${detail ? ': ' + detail : ''}`);
const wacht = ms => new Promise(r => setTimeout(r, ms));

// ---- Nagebootste database (in dit proces, gedeeld door beide toestellen) ----
const TOEGANG = { 'giulia@test.be': 'giulia', 'remi@test.be': 'remi' };
const rijen = new Map(); const bestanden = new Map();
let klok = Date.parse('2026-10-11T10:00:00Z');
const tijd = () => new Date(++klok).toISOString();
let offline = false;
async function fakeRoute(route) {
  if (offline) return route.abort('internetdisconnected');
  const req = route.request(); const u = new URL(req.url());
  const email = u.searchParams.get('email') || (req.postData() && (() => { try { return JSON.parse(req.postData()).email; } catch { return ''; } })()) || '';
  const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  const pad = u.pathname.replace(/^\/__fake\//, '');
  if (pad === 'wie') return json(200, { wie: TOEGANG[email] || null });
  if (pad === 'haal') {
    if (!TOEGANG[email]) return json(403, { message: 'geen toegang' });
    const sinds = u.searchParams.get('sinds');
    return json(200, [...rijen.values()].filter(r => r.server_tijd > sinds).sort((a, b) => a.server_tijd.localeCompare(b.server_tijd)));
  }
  if (pad === 'stuur') {
    const { rijen: nieuw } = JSON.parse(req.postData());
    if (!TOEGANG[email]) return json(403, { message: 'geen toegang' });
    for (const r of nieuw) {
      const k = `${r.collectie}|${r.id}`; const oud = rijen.get(k);
      if (oud && r.bijgewerkt < oud.bijgewerkt) continue; // de laatste bewerking wint, zoals de trigger
      rijen.set(k, { ...r, gewijzigd_door: email, server_tijd: tijd() });
    }
    return json(200, {});
  }
  if (pad === 'bestand') {
    const id = u.searchParams.get('id');
    if (req.method() === 'POST') { bestanden.set(id, JSON.parse(req.postData())); return json(200, {}); }
    if (req.method() === 'DELETE') { bestanden.delete(id); return json(200, {}); }
    return bestanden.has(id) ? json(200, bestanden.get(id)) : json(404, { message: 'not found' });
  }
  return json(404, {});
}
const FAKE_BACKEND = `globalThis.__nieuweStartBackend = (() => {
  const mail = () => localStorage.getItem('fake-sessie') || '';
  const j = async (url, opts) => { let r; try { r = await fetch(url, opts); } catch (e) { throw Object.assign(new Error('Failed to fetch'), { offline: true }); } if (!r.ok) throw new Error('fake ' + r.status); return r.json(); };
  const q = s => encodeURIComponent(s);
  return {
    async sessie() { const e = mail(); return e ? { email: e } : null; },
    opAuth() { return () => {}; },
    async stuurCode(email) { localStorage.setItem('fake-code-voor', email); },
    async bevestigCode(email, code) { if (code !== '123456') throw new Error('Token has expired or is invalid'); localStorage.setItem('fake-sessie', email); return { email }; },
    async afmelden() { localStorage.removeItem('fake-sessie'); },
    async wie() { return (await j('/__fake/wie?email=' + q(mail()))).wie; },
    async haal(sinds) { return j('/__fake/haal?sinds=' + q(sinds) + '&email=' + q(mail())); },
    async stuur(rijen) { await j('/__fake/stuur', { method: 'POST', body: JSON.stringify({ email: mail(), rijen }) }); },
    async bestandOp(id, blob) { const data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); }); await j('/__fake/bestand?id=' + q(id), { method: 'POST', body: JSON.stringify({ data, type: blob.type }) }); },
    async bestandAf(id) { let r; try { r = await fetch('/__fake/bestand?id=' + q(id)); } catch { throw Object.assign(new Error('Failed to fetch'), { offline: true }); } if (r.status === 404) return null; const { data } = await r.json(); return (await fetch(data)).blob(); },
    async bestandWeg(id) { await j('/__fake/bestand?id=' + q(id), { method: 'DELETE' }); },
  };
})();`;
// Gegevens die al op Giulia's toestel stonden voor er een database was (zoals na de import).
const BESTAAND = JSON.stringify({ berichten: [{ id: 'msg-acv-test', soort: 'mail', titel: 'ACV test', onderwerp: 'Vraag om bijstand', naar: 'acv@voorbeeld.be', tekst: 'Beste ACV,\n\nTest.\n\nRemi', status: 'concept', bijgewerkt: '2026-10-11T09:00:00.000Z' }] });

let browser;
try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ executablePath: chromiumPath() });
  const toestel = async (label, { bestaand = false } = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, timezoneId: 'Europe/Brussels' });
    await ctx.route(url => !url.href.startsWith(base), r => r.abort());
    await ctx.route('**/__fake/**', fakeRoute);
    await ctx.addInitScript(FAKE_BACKEND);
    if (bestaand) await ctx.addInitScript(d => { if (!localStorage.getItem('test-bestaand')) { localStorage.setItem('test-bestaand', '1'); localStorage.setItem('remi-nieuwe-start-v1', d); } }, BESTAAND);
    const page = await ctx.newPage();
    const fout = []; page.on('pageerror', e => fout.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) fout.push(m.text()); });
    return { ctx, page, fout, label };
  };
  const aanmelden = async (page, email, code = '123456') => {
    await page.fill('[data-fk="aanmeld-mail"]', email);
    await page.click('.aanmelden button[type=submit]');
    await page.waitForSelector('[data-fk="aanmeld-code"]', { timeout: 3000 });
    await page.fill('[data-fk="aanmeld-code"]', code);
    await page.click('.aanmelden button[type=submit]');
  };
  const syncNu = page => page.evaluate(async () => { const s = await import('./js/sync.js'); await s.syncNu(); return s.syncStatus(); });

  // ---- Giulia: had al gegevens op haar toestel ----
  const A = await toestel('giulia', { bestaand: true });
  await A.page.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' });
  check('zonder aanmelding: aanmeldscherm, geen gegevens', await A.page.locator('.aanmelden').count() === 1 && await A.page.locator('.grid2__table').count() === 0 && !(await A.page.textContent('body')).includes('ACV test'));
  await aanmelden(A.page, 'giulia@test.be', '000000');
  await A.page.waitForSelector('.aanmelden [role=alert]', { timeout: 3000 }).catch(() => {});
  check('verkeerde code geweigerd', /klopt niet of is verlopen/.test(await A.page.textContent('.aanmelden')));
  await A.page.fill('[data-fk="aanmeld-code"]', '123456');
  await A.page.click('.aanmelden button[type=submit]');
  await A.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  check('na aanmelden: de app met de eigen gegevens', await A.page.locator('.aanmelden').count() === 0 && /ACV test/.test(await A.page.textContent('.grid2__table').catch(() => '')));
  check('weet wie aangemeld is', /Aangemeld als Giulia/.test(await A.page.textContent('#brandWho')));
  await syncNu(A.page);
  check('bestaande gegevens gaan naar de database', rijen.has('berichten|msg-acv-test') && rijen.get('berichten|msg-acv-test').gewijzigd_door === 'giulia@test.be');
  // Bijlage toevoegen op Giulia's toestel
  await A.page.goto(`${base}#/communicatie/msg-acv-test`, { waitUntil: 'networkidle' });
  await A.page.setInputFiles('input[data-bijlage="msg-acv-test"]', { name: 'Volmacht.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 volmacht test') });
  await A.page.waitForSelector('.mail-bijlagen li', { timeout: 3000 }).catch(() => {});
  await syncNu(A.page);
  const bijlageId = [...bestanden.keys()][0] || '';
  check('bijlage staat in de database-opslag', bestanden.size === 1 && bijlageId.startsWith('mail-msg-acv-test/'), [...bestanden.keys()].join(','));
  // Handtekening is gedeeld
  await A.page.goto(`${base}#/communicatie?tab=instellingen`, { waitUntil: 'networkidle' });
  await A.page.fill('[data-fk="mail-handtekening"]', 'Met vriendelijke groeten\n\nRemi');
  await wacht(600);
  await syncNu(A.page);

  // ---- Remi: nieuw toestel, niets lokaal ----
  const B = await toestel('remi');
  await B.page.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' });
  await aanmelden(B.page, 'remi@test.be');
  await B.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  check('Remi ziet de mail van Giulia', /ACV test/.test(await B.page.textContent('.grid2__table').catch(() => '')));
  check('Remi is aangemeld als Remi', /Aangemeld als Remi/.test(await B.page.textContent('#brandWho')));
  await B.page.goto(`${base}#/communicatie/msg-acv-test`, { waitUntil: 'networkidle' });
  check('Remi ziet de bijlage in de lijst', /Volmacht\.pdf/.test(await B.page.textContent('.mail-bijlagen').catch(() => '')));
  const grootte = await B.page.evaluate(async id => { const b = await import('./js/bijlagen.js'); const blob = await b.leesBijlage(id); return blob ? blob.size : -1; }, bijlageId);
  check('Remi kan de bijlage openen (opgehaald uit de opslag)', grootte === Buffer.from('%PDF-1.4 volmacht test').length, String(grootte));
  check('handtekening gedeeld', (await B.page.evaluate(async () => (await import('./js/views-comm.js')).handtekening())) === 'Met vriendelijke groeten\n\nRemi');
  // Remi past het onderwerp aan; Giulia ziet het
  await B.page.fill('[data-fk="msg-msg-acv-test-onderwerp"]', 'Vraag om bijstand (aangepast door Remi)');
  await B.page.click('text=← Alle e-mails');
  await wacht(300);
  await syncNu(B.page);
  check('wijziging van Remi in de database', rijen.get('berichten|msg-acv-test')?.data?.onderwerp === 'Vraag om bijstand (aangepast door Remi)' && rijen.get('berichten|msg-acv-test').gewijzigd_door === 'remi@test.be');
  await A.page.goto(`${base}#/communicatie/msg-acv-test`, { waitUntil: 'networkidle' });
  await syncNu(A.page);
  await A.page.waitForTimeout(200);
  check('Giulia ziet de wijziging van Remi', (await A.page.inputValue('[data-fk="msg-msg-acv-test-onderwerp"]')) === 'Vraag om bijstand (aangepast door Remi)');

  // Nieuwe mail en verwijderen gaan ook door
  await B.page.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' });
  await B.page.click('[data-actie="nieuwe-mail"]');
  await B.page.waitForTimeout(300);
  const nieuwId = (B.page.url().match(/#\/communicatie\/(mail-[\w-]+)$/) || [])[1];
  await B.page.fill(`[data-fk="msg-${nieuwId}-onderwerp"]`, 'Mail van Remi');
  await B.page.click('text=← Alle e-mails');
  await wacht(300); await syncNu(B.page);
  await A.page.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' }); await syncNu(A.page); await A.page.waitForTimeout(200);
  check('nieuwe mail van Remi verschijnt bij Giulia', /Mail van Remi/.test(await A.page.textContent('.grid2__table')));
  await B.page.goto(`${base}#/communicatie/${nieuwId}`, { waitUntil: 'networkidle' });
  B.page.once('dialog', d => d.accept());
  await B.page.click('text=Verwijderen');
  await wacht(300); await syncNu(B.page);
  await syncNu(A.page); await A.page.waitForTimeout(200);
  check('verwijderen gaat door naar Giulia', !/Mail van Remi/.test(await A.page.textContent('.grid2__table')));

  // Zonder verbinding: de wijziging wacht en gaat later door
  offline = true;
  await A.page.goto(`${base}#/communicatie/msg-acv-test`, { waitUntil: 'networkidle' });
  await A.page.fill('[data-fk="msg-msg-acv-test-onderwerp"]', 'Offline aangepast');
  await A.page.click('text=← Alle e-mails');
  await wacht(300);
  const st1 = await syncNu(A.page);
  check('offline: wijziging wacht, app blijft werken', st1.modus === 'offline' && st1.wachtend >= 1 && (await A.page.evaluate(async () => (await import('./js/store.js')).get('berichten', 'msg-acv-test').onderwerp)) === 'Offline aangepast' && /Geen verbinding/.test(await A.page.textContent('#navFoot')), JSON.stringify(st1));
  offline = false;
  const st2 = await syncNu(A.page);
  check('weer online: wijziging doorgestuurd', st2.modus === 'actief' && st2.wachtend === 0 && rijen.get('berichten|msg-acv-test').data.onderwerp === 'Offline aangepast', JSON.stringify(st2));

  // Een oudere versie overschrijft nooit een nieuwere
  const nieuwer = rijen.get('berichten|msg-acv-test');
  await B.page.evaluate(async () => { const s = await import('./js/store.js'); s.pasToe([{ collectie: 'berichten', id: 'msg-acv-test', data: { id: 'msg-acv-test', soort: 'mail', titel: 'ACV test', onderwerp: 'OUD', bijgewerkt: '2026-10-01T00:00:00.000Z' }, bijgewerkt: '2026-10-01T00:00:00.000Z', verwijderd: false }]); });
  await syncNu(B.page);
  check('oudere versie wint niet', (await B.page.evaluate(async () => (await import('./js/store.js')).get('berichten', 'msg-acv-test').onderwerp)) === nieuwer.data.onderwerp);

  // Iemand zonder toegang
  const C = await toestel('vreemde');
  await C.page.goto(base, { waitUntil: 'networkidle' });
  await aanmelden(C.page, 'iemand@test.be');
  await C.page.waitForTimeout(500);
  check('adres zonder toegang ziet niets', /geen toegang/.test(await C.page.textContent('.aanmelden')) && !/ACV test/.test(await C.page.textContent('body')));

  // Afmelden
  await B.page.evaluate(async () => (await import('./js/sync.js')).afmelden());
  await B.page.waitForTimeout(300);
  check('afmelden toont het aanmeldscherm', await B.page.locator('.aanmelden').count() === 1);

  for (const t of [A, B, C]) check(`${t.label}: geen consolefouten`, t.fout.length === 0, t.fout.slice(0, 3).join(' | '));
} catch (e) {
  fouten.push('script: ' + (e.stack || e.message));
} finally {
  if (browser) await browser.close();
  server.kill();
}
console.log(`Geslaagd: ${geslaagd.length}`);
if (fouten.length) { console.log(`Mislukt: ${fouten.length}`); fouten.forEach(f => console.log(' - ' + f)); process.exitCode = 1; } else console.log('Alles in orde.');
