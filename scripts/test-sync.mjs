// Test van de centrale database met twee toestellen (Giulia en Remi) en een nagebootste database.
// De nagebootste database volgt supabase/schema.sql (toegang, samenvoegen per veld, grafsteentjes) en de
// serverfunctie account (toegangscodes). Alleen verzonnen adressen en wachtwoorden.
// Gebruik: node scripts/test-sync.mjs (na npm run build:data)
import { spawn } from 'node:child_process';
import { randomInt } from 'node:crypto';
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
// Wachten tot iets klopt (of tot de tijd om is); geeft terug of het lukte.
async function wachtTot(fn, ms = 5000) {
  const eind = Date.now() + ms;
  for (;;) {
    try { if (await fn()) return true; } catch { /* pagina nog niet klaar */ }
    if (Date.now() > eind) return false;
    await wacht(100);
  }
}

// ---- Nagebootste database (in dit proces, gedeeld door alle toestellen) ----
const WW = { giulia: 'test-wachtwoord-giulia', remi: 'test-wachtwoord-remi', iemand: 'test-wachtwoord-iemand' };
const accounts = new Map([['giulia@test.be', WW.giulia], ['iemand@test.be', WW.iemand]]); // iemand: account zonder toegang
const toegang = { 'giulia@test.be': 'giulia' };
const codes = new Map(); // code zonder streepje -> { wie, gebruikt }
let laatsteCode = '';
const TEKENS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const schoneCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const rijen = new Map(); const bestanden = new Map();
const PAKKET = 2; // klein, zodat ophalen in meerdere pakketten gebeurt, zoals backend.js met 1000
let klok = Date.parse('2026-10-11T10:00:00Z');
// Tijden zoals Postgres ze teruggeeft: zonder overbodige nullen, met +00:00.
const pg = ms => new Date(ms).toISOString().replace(/\.?0+Z$/, '').replace(/Z$/, '') + '+00:00';
const tijd = () => pg(++klok);
const netUit = new Set();   // toestellen zonder verbinding
const storing = new Set();  // toestellen waarvoor het tweede ophaalpakket wegvalt
let pauze = null;           // { label, open, los }: het ophalen van dit toestel wacht
const pauzeer = label => { let los; const open = new Promise(r => { los = r; }); pauze = { label, open, los }; };
const toestellen = [];
// jsonb vergelijkt zonder op de volgorde van de sleutels te letten.
const vast = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x));
const isObject = d => !!d && typeof d === 'object' && !Array.isArray(d);

// Zoals de trigger public.records_stempel: nieuwer -> old.data || new.data, ouder -> alleen ontbrekende velden,
// een grafsteentje vervangt alles, niets veranderd -> geen update (null).
function stempel(oud, r, email) {
  let data = r.data, bijgewerkt = r.bijgewerkt, verwijderd = !!r.verwijderd;
  if (oud) {
    const samenvoegen = !verwijderd && !oud.verwijderd && isObject(data) && isObject(oud.data);
    if (Date.parse(bijgewerkt) >= Date.parse(oud.bijgewerkt)) {
      if (samenvoegen) data = { ...oud.data, ...data };
    } else {
      if (!samenvoegen) return null;
      data = { ...data, ...oud.data }; bijgewerkt = oud.bijgewerkt; verwijderd = oud.verwijderd;
    }
    if (vast(data) === vast(oud.data) && Date.parse(bijgewerkt) === Date.parse(oud.bijgewerkt) && verwijderd === oud.verwijderd) return null;
  }
  return { collectie: r.collectie, id: r.id, data, bijgewerkt: pg(Date.parse(bijgewerkt)), verwijderd, gewijzigd_door: email, server_tijd: tijd() };
}
const volgorde = (a, b) => Date.parse(a.server_tijd) - Date.parse(b.server_tijd) || a.collectie.localeCompare(b.collectie) || a.id.localeCompare(b.id);
// Live verbinding: elke echte wijziging gaat naar elk toestel met verbinding (ook naar de afzender, zoals realtime).
function duw(veranderd) {
  for (const t of toestellen) {
    if (netUit.has(t.label)) continue;
    t.page.evaluate(r => globalThis.__fakeLuister?.(r), veranderd).catch(() => {});
  }
}

async function nepDatabase(route, label) {
  if (netUit.has(label)) return route.abort('internetdisconnected');
  const req = route.request(); const u = new URL(req.url());
  const body = (() => { try { return JSON.parse(req.postData() || 'null') || {}; } catch { return {}; } })();
  const json = (status, b) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(b) });
  const pad = u.pathname.replace(/^\/__fake\//, '');
  const email = u.searchParams.get('email') || '';
  if (pad === 'aanmelden') {
    if (!body.wachtwoord || accounts.get(body.email) !== body.wachtwoord) return json(400, { message: 'Invalid login credentials' });
    return json(200, { email: body.email });
  }
  if (pad === 'account') {
    if (body.actie === 'maak') {
      const adres = String(body.email || '').trim().toLowerCase(), c = codes.get(schoneCode(body.code));
      if (String(body.wachtwoord || '').length < 8) return json(400, { message: 'Kies een wachtwoord van minstens 8 tekens.' });
      if (!c || c.gebruikt) return json(400, { message: 'Deze code klopt niet, is al gebruikt of is verlopen. Vraag een nieuwe code.' });
      const nieuw = !accounts.has(adres);
      accounts.set(adres, body.wachtwoord); toegang[adres] = c.wie; c.gebruikt = true;
      return json(200, { ok: true, wie: c.wie, nieuw });
    }
    if (body.actie === 'code') {
      if (!toegang[body.door]) return json(403, { message: 'Dit adres heeft geen toegang.' });
      if (!['remi', 'giulia'].includes(body.wie)) return json(400, { message: 'Voor wie is de code?' });
      const c = Array.from({ length: 10 }, () => TEKENS[randomInt(TEKENS.length)]).join('');
      codes.set(c, { wie: body.wie, gebruikt: false });
      laatsteCode = `${c.slice(0, 5)}-${c.slice(5)}`;
      return json(200, { code: laatsteCode, verloopt: new Date(Date.now() + 7 * 864e5).toISOString() });
    }
    return json(400, { message: 'Onbekende actie.' });
  }
  if (pad === 'wie') return json(200, { wie: toegang[email] || null });
  if (pad === 'haal') {
    if (!toegang[email]) return json(403, { message: 'permission denied' });
    if (pauze && pauze.label === label) await pauze.open;
    const op = u.searchParams.get('op');
    if (op === 'gte' && storing.has(label)) return route.abort('internetdisconnected');
    const vanaf = Date.parse(u.searchParams.get('vanaf')), van = Number(u.searchParams.get('van')) || 0, aantal = Number(u.searchParams.get('aantal')) || 1000;
    const lijst = [...rijen.values()].filter(r => (op === 'gte' ? Date.parse(r.server_tijd) >= vanaf : Date.parse(r.server_tijd) > vanaf)).sort(volgorde);
    return json(200, lijst.slice(van, van + aantal));
  }
  if (pad === 'stuur') {
    if (!toegang[body.email]) return json(403, { message: 'new row violates row-level security policy' });
    const veranderd = [];
    for (const r of body.rijen || []) {
      const k = `${r.collectie}|${r.id}`;
      const nieuw = stempel(rijen.get(k), r, body.email);
      if (nieuw) { rijen.set(k, nieuw); veranderd.push(nieuw); }
    }
    const antwoord = json(201, {});
    if (veranderd.length) setTimeout(() => duw(veranderd), 0);
    return antwoord;
  }
  if (pad === 'bestand') {
    if (!toegang[email]) return json(403, { message: 'permission denied' });
    const id = u.searchParams.get('id');
    if (req.method() === 'POST') { bestanden.set(id, body); return json(200, {}); }
    if (req.method() === 'DELETE') { bestanden.delete(id); return json(200, {}); }
    return bestanden.has(id) ? json(200, bestanden.get(id)) : json(404, { message: 'Object not found' });
  }
  return json(404, {});
}

// De nagebootste backend in de browser: dezelfde functies als backend.js, via de routes /__fake/*.
function nagebootsteBackend(PAKKET) {
  const sessie = () => localStorage.getItem('fake-sessie') || '';
  const authLuisteraars = new Set();
  const authGewijzigd = () => { for (const cb of authLuisteraars) setTimeout(cb, 0); };
  // Netwerkfouten krijgen offline, zoals in backend.js; andere fouten de melding van de server.
  async function vraag(pad, { body, methode } = {}) {
    let r;
    try { r = await fetch('/__fake/' + pad, body === undefined ? { method: methode || 'GET' } : { method: methode || 'POST', body: JSON.stringify(body) }); }
    catch { throw Object.assign(new Error('Failed to fetch'), { offline: true }); }
    const antw = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(antw.message || 'fake ' + r.status), { status: r.status });
    return antw;
  }
  const q = extra => new URLSearchParams({ email: sessie(), ...extra }).toString();
  globalThis.__nieuweStartBackend = {
    async sessie() { const e = sessie(); return e ? { email: e } : null; },
    // Zoals onAuthStateChange: meteen een eerste melding, daarna bij aanmelden en afmelden.
    opAuth(cb) { authLuisteraars.add(cb); setTimeout(cb, 0); return () => authLuisteraars.delete(cb); },
    async aanmelden(email, wachtwoord) {
      try { await vraag('aanmelden', { body: { email, wachtwoord } }); } catch (e) {
        const x = new Error(`Aanmelden: ${e.message}`);
        x.offline = !!e.offline;
        if (/invalid login|invalid credentials/i.test(e.message)) x.verkeerd = true;
        throw x;
      }
      localStorage.setItem('fake-sessie', email); authGewijzigd();
    },
    maakAccount: (email, wachtwoord, code) => vraag('account', { body: { actie: 'maak', email, wachtwoord, code } }),
    codeMaken: wie => vraag('account', { body: { actie: 'code', wie, door: sessie() } }),
    async afmelden() { localStorage.removeItem('fake-sessie'); authGewijzigd(); },
    async wie() { return (await vraag('wie?' + q({}))).wie; },
    // Zoals backend.js: het eerste pakket na 'sinds' (gt), daarna verder vanaf het laatste tijdstip (gte), dubbels eruit.
    async haal(sinds) {
      const rijen = [], gezien = new Set();
      let vanaf = sinds, eerste = true, overslaan = 0;
      for (let ronde = 0; ronde < 1000; ronde++) {
        const data = await vraag('haal?' + q({ op: eerste ? 'gt' : 'gte', vanaf, van: overslaan, aantal: PAKKET }));
        for (const r of data) {
          const k = `${r.collectie}\u0001${r.id}\u0001${r.server_tijd}`;
          if (!gezien.has(k)) { gezien.add(k); rijen.push(r); }
        }
        if (data.length < PAKKET) return rijen;
        const laatste = data[data.length - 1].server_tijd;
        if (!eerste && laatste === vanaf) overslaan += PAKKET; else overslaan = 0;
        vanaf = laatste; eerste = false;
      }
      return rijen;
    },
    async stuur(rijen) { if (rijen.length) await vraag('stuur', { body: { email: sessie(), rijen } }); },
    async bestandOp(id, blob) {
      const data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
      await vraag('bestand?' + q({ id }), { body: { data, type: blob.type } });
    },
    async bestandAf(id) {
      try { const { data } = await vraag('bestand?' + q({ id })); return (await fetch(data)).blob(); }
      catch (e) { if (e.status === 404) return null; throw e; }
    },
    async bestandWeg(id) { await vraag('bestand?' + q({ id }), { methode: 'DELETE' }); },
    async gmail(actie) {
      if (actie === 'status') return { ingesteld: false, gekoppeld: false, redirectUri: location.origin + '/gmail-terug' };
      throw new Error('Gmail is niet nagebootst in deze test.');
    },
    luister(cb) {
      const fn = rijen => { if (sessie()) cb(rijen); };
      globalThis.__fakeLuister = fn;
      return () => { if (globalThis.__fakeLuister === fn) delete globalThis.__fakeLuister; };
    },
  };
}
// Gegevens die al op Giulia's toestel stonden voor er een database was (zoals na de import).
const BESTAAND = JSON.stringify({ berichten: [{ id: 'msg-acv-test', soort: 'mail', titel: 'ACV test', onderwerp: 'Vraag om bijstand', naar: 'acv@voorbeeld.be', tekst: 'Beste ACV,\n\nTest.\n\nRemi', status: 'concept', bijgewerkt: '2026-10-11T09:00:00.000Z' }] });
const PDF = Buffer.from('%PDF-1.4 volmacht test');

let browser;
try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ executablePath: chromiumPath() });
  const toestel = async (label, { bestaand = false } = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, timezoneId: 'Europe/Brussels' });
    await ctx.route(url => !url.href.startsWith(base), r => r.abort());
    await ctx.route('**/__fake/**', r => nepDatabase(r, label));
    await ctx.addInitScript(nagebootsteBackend, PAKKET);
    if (bestaand) await ctx.addInitScript(d => { if (!localStorage.getItem('test-bestaand')) { localStorage.setItem('test-bestaand', '1'); localStorage.setItem('remi-nieuwe-start-v1', d); } }, BESTAAND);
    const page = await ctx.newPage();
    const fout = []; page.on('pageerror', e => fout.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) fout.push(m.text()); });
    const t = { ctx, page, fout, label };
    toestellen.push(t);
    return t;
  };
  const tekst = (page, sel) => page.textContent(sel, { timeout: 1000 }).catch(() => '');
  const aantal = (page, sel) => page.locator(sel).count();
  const aanmelden = async (page, email, wachtwoord) => {
    await page.fill('[data-fk="aanmeld-mail"]', email);
    await page.fill('[data-fk="aanmeld-ww"]', wachtwoord);
    await page.click('.aanmelden button[type=submit]');
  };
  // Account maken met een toegangscode. Zonder email: het adres ligt vast (scherm 'Nog geen toegang').
  const accountMaken = async (page, email, code, wachtwoord) => {
    if (email) await page.fill('[data-fk="code-mail"]', email);
    await page.fill('[data-fk="code-code"]', code);
    await page.fill('[data-fk="code-ww"]', wachtwoord);
    await page.fill('[data-fk="code-ww2"]', wachtwoord);
    await page.click('.aanmelden button[type=submit]');
  };
  const status = page => page.evaluate(async () => (await import('./js/sync.js')).syncStatus());
  // Twee keer: loopt er al een ronde, dan haalt de tweede ook op wat daarna nog bijkwam.
  const syncNu = page => page.evaluate(async () => { const s = await import('./js/sync.js'); await s.syncNu(); await s.syncNu(); return s.syncStatus(); });
  const lokaal = (page, c, id) => page.evaluate(async ([c, id]) => (await import('./js/store.js')).lokaalRecord(c, id), [c, id]);
  const record = (page, c, id) => page.evaluate(async ([c, id]) => (await import('./js/store.js')).get(c, id) || null, [c, id]);
  const instellingen = async page => { await page.click('.chrome__iconbtn[aria-label="Instellingen"]'); await page.waitForSelector('[data-sync-status]', { timeout: 3000 }).catch(() => {}); };

  // ---- Giulia: had al gegevens op haar toestel ----
  const A = await toestel('giulia', { bestaand: true });
  await A.page.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' });
  await A.page.waitForSelector('[data-fk="aanmeld-ww"]', { timeout: 5000 }).catch(() => {});
  check('zonder aanmelding: aanmeldscherm met e-mail en wachtwoord, geen gegevens',
    await aantal(A.page, '.aanmelden') === 1 && (await A.page.getAttribute('[data-fk="aanmeld-ww"]', 'type').catch(() => '')) === 'password'
    && await aantal(A.page, '[data-fk="aanmeld-mail"]') === 1 && /Gebruik een toegangscode/.test(await tekst(A.page, '.aanmelden'))
    && await aantal(A.page, '.grid2__table') === 0 && !(await tekst(A.page, 'body')).includes('ACV test'));
  await aanmelden(A.page, 'giulia@test.be', 'verkeerd-wachtwoord');
  await A.page.waitForSelector('.aanmelden [role=alert]', { timeout: 3000 }).catch(() => {});
  check('verkeerd wachtwoord: melding, geen gegevens', /passen niet bij elkaar/.test(await tekst(A.page, '.aanmelden [role=alert]'))
    && await aantal(A.page, '.grid2__table') === 0 && (await status(A.page)).modus === 'afgemeld' && !(await tekst(A.page, 'body')).includes('ACV test'));
  await aanmelden(A.page, 'giulia@test.be', WW.giulia);
  await A.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  check('na aanmelden: de app met de eigen gegevens', await aantal(A.page, '.aanmelden') === 0 && /ACV test/.test(await tekst(A.page, '.grid2__table')));
  check('weet wie aangemeld is', /Aangemeld als Giulia/.test(await tekst(A.page, '#brandWho')));
  await syncNu(A.page);
  check('bestaande gegevens gaan naar de database', rijen.has('berichten|msg-acv-test') && rijen.get('berichten|msg-acv-test').gewijzigd_door === 'giulia@test.be');
  // Bijlage toevoegen op Giulia's toestel
  await A.page.goto(`${base}#/communicatie/msg-acv-test`, { waitUntil: 'networkidle' });
  await A.page.setInputFiles('input[data-bijlage="msg-acv-test"]', { name: 'Volmacht.pdf', mimeType: 'application/pdf', buffer: PDF });
  await A.page.waitForSelector('.mail-bijlagen li', { timeout: 3000 }).catch(() => {});
  await syncNu(A.page);
  const bijlageId = [...bestanden.keys()][0] || '';
  check('bijlage staat in de database-opslag', bestanden.size === 1 && bijlageId.startsWith('mail-msg-acv-test/'), [...bestanden.keys()].join(','));
  // Handtekening is gedeeld
  await A.page.goto(`${base}#/communicatie?tab=instellingen`, { waitUntil: 'networkidle' });
  await A.page.fill('[data-fk="mail-handtekening"]', 'Met vriendelijke groeten\n\nRemi');
  await wacht(600);
  await syncNu(A.page);
  // Instellingen: een toegangscode maken voor Remi
  await instellingen(A.page);
  const knopRemi = (await tekst(A.page, '[data-actie="code-remi"]')).trim();
  await A.page.click('[data-actie="code-remi"]');
  await A.page.waitForSelector('[data-nieuwe-code]', { timeout: 3000 }).catch(() => {});
  const codeRemi = await A.page.getAttribute('[data-nieuwe-code]', 'data-nieuwe-code').catch(() => '') || '';
  check('Instellingen toont Code voor Remi en de gemaakte code', knopRemi === 'Code voor Remi' && !!codeRemi && codeRemi === laatsteCode
    && /^[A-Z2-9]{5}-[A-Z2-9]{5}$/.test(codeRemi) && /Toegangscode voor Remi/.test(await tekst(A.page, '[data-nieuwe-code]'))
    && (await tekst(A.page, '[data-nieuwe-code] .aanmeld-code')).trim() === codeRemi && codes.get(schoneCode(codeRemi))?.wie === 'remi', `${knopRemi} ${codeRemi}`);
  await A.page.click('#peekClose');

  // ---- Remi: nieuw toestel, niets lokaal, nog geen account ----
  const B = await toestel('remi');
  await B.page.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' });
  await B.page.waitForSelector('.aanmelden', { timeout: 5000 }).catch(() => {});
  await B.page.click('text=Gebruik een toegangscode');
  await B.page.waitForSelector('[data-fk="code-code"]', { timeout: 3000 }).catch(() => {});
  await accountMaken(B.page, 'remi@test.be', 'ZZZZZ-ZZZZZ', WW.remi);
  await B.page.waitForSelector('.aanmelden [role=alert]', { timeout: 3000 }).catch(() => {});
  check('account maken met een verkeerde code: melding, geen account', /klopt niet/.test(await tekst(B.page, '.aanmelden [role=alert]')) && !accounts.has('remi@test.be'));
  // De eerste ophaalbeurt wacht even, en daarna valt het tweede pakket weg.
  pauzeer('remi'); storing.add('remi');
  await accountMaken(B.page, 'remi@test.be', codeRemi, WW.remi);
  const ophalen = await wachtTot(async () => /Alles ophalen/.test(await tekst(B.page, '.aanmelden')));
  const s1 = await status(B.page);
  check('account maken met de code op het code-formulier', accounts.get('remi@test.be') === WW.remi && toegang['remi@test.be'] === 'remi' && codes.get(schoneCode(codeRemi))?.gebruikt === true);
  check('nieuw toestel: de poort blijft dicht tot alles opgehaald is (ophalen)', ophalen && s1.modus === 'ophalen' && !s1.open
    && await aantal(B.page, '.grid2__table') === 0 && (await B.page.innerHTML('#nav')).trim() === '' && !(await tekst(B.page, 'body')).includes('ACV test'), JSON.stringify(s1));
  pauze.los(); pauze = null;
  const half = await wachtTot(async () => /Nog geen gegevens op dit toestel/.test(await tekst(B.page, '.aanmelden')));
  const s2 = await status(B.page);
  check('half opgehaald telt niet: poort blijft dicht, niets toegepast', half && !s2.open && s2.modus === 'offline'
    && (await lokaal(B.page, 'berichten', 'msg-acv-test')) === null && !(await tekst(B.page, 'body')).includes('ACV test'), JSON.stringify(s2));
  storing.delete('remi');
  await B.page.click('.aanmelden button:has-text("Opnieuw proberen")').catch(() => {});
  await B.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  check('Remi ziet de mail van Giulia na de volledige ophaalbeurt', /ACV test/.test(await tekst(B.page, '.grid2__table')) && (await status(B.page)).open);
  check('Remi is aangemeld als Remi', /Aangemeld als Remi/.test(await tekst(B.page, '#brandWho')));
  await B.page.goto(`${base}#/communicatie/msg-acv-test`, { waitUntil: 'networkidle' });
  check('Remi ziet de bijlage in de lijst', /Volmacht\.pdf/.test(await tekst(B.page, '.mail-bijlagen')));
  const grootte = await B.page.evaluate(async id => { const b = await import('./js/bijlagen.js'); const blob = await b.leesBijlage(id); return blob ? blob.size : -1; }, bijlageId);
  check('Remi kan de bijlage openen (opgehaald uit de opslag)', grootte === PDF.length, String(grootte));
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
  check('nieuwe mail van Remi verschijnt bij Giulia', /Mail van Remi/.test(await tekst(A.page, '.grid2__table')));
  await B.page.goto(`${base}#/communicatie/${nieuwId}`, { waitUntil: 'networkidle' });
  B.page.once('dialog', d => d.accept());
  await B.page.click('text=Verwijderen');
  await wacht(300); await syncNu(B.page);
  const graf = rijen.get(`berichten|${nieuwId}`);
  check('verwijderen: een leeg grafsteentje in de database', graf?.verwijderd === true && vast(Object.keys(graf.data).sort()) === '["bijgewerkt","id","verwijderd"]', JSON.stringify(graf?.data));
  // Giulia werkt zelf niet bij: de live verbinding brengt het verwijderen binnen.
  const live = await wachtTot(async () => !/Mail van Remi/.test(await tekst(A.page, '.grid2__table')), 3000);
  check('live verbinding: verwijderen verdwijnt bij Giulia zonder bij te werken', live);
  await syncNu(A.page); await A.page.waitForTimeout(200);
  const grafA = await lokaal(A.page, 'berichten', nieuwId);
  check('verwijderen gaat door naar Giulia (ook bij haar een leeg grafsteentje)', !/Mail van Remi/.test(await tekst(A.page, '.grid2__table'))
    && grafA?.verwijderd === true && !('onderwerp' in grafA) && (await record(A.page, 'berichten', nieuwId)) === null, JSON.stringify(grafA));

  // Tegelijk: Giulia wijzigt de status van een werkveld, Remi schrijft er een notitie bij. Beide blijven.
  const veld = await A.page.evaluate(async () => { const x = (await import('./js/store.js')).all('verkenning')[0]; return { id: x.id, status: x.status }; });
  const nieuweStatus = veld.status === 'vrijwillig' ? 'laag' : 'vrijwillig';
  const NOTITIE = 'Notitie van Remi: open dag in maart';
  const kaart = (page, id) => page.locator('.card').filter({ has: page.locator(`[data-fk="vk-${id}"]`) });
  await A.page.goto(`${base}#/verkenning`, { waitUntil: 'networkidle' });
  await B.page.goto(`${base}#/verkenning`, { waitUntil: 'networkidle' });
  netUit.add('giulia'); netUit.add('remi');
  await kaart(A.page, veld.id).locator('select').selectOption(nieuweStatus);
  await wacht(50);
  await B.page.fill(`[data-fk="vk-${veld.id}"]`, NOTITIE);
  await B.page.evaluate(() => document.activeElement?.blur());
  await wacht(400);
  netUit.delete('giulia'); netUit.delete('remi');
  await syncNu(A.page); await syncNu(B.page); await syncNu(A.page);
  const rij = rijen.get(`verkenning|${veld.id}`);
  const opA = await record(A.page, 'verkenning', veld.id), opB = await record(B.page, 'verkenning', veld.id);
  check('velden van twee toestellen samengevoegd in de database', rij?.data?.status === nieuweStatus && rij?.data?.notities === NOTITIE, JSON.stringify(rij?.data));
  check('velden van twee toestellen samengevoegd op beide toestellen', opA?.status === nieuweStatus && opA?.notities === NOTITIE && opB?.status === nieuweStatus && opB?.notities === NOTITIE, JSON.stringify({ opA, opB }));
  await A.page.goto(`${base}#/verkenning?tab=alles`, { waitUntil: 'networkidle' });
  await B.page.goto(`${base}#/verkenning?tab=alles`, { waitUntil: 'networkidle' });
  check('samengevoegde velden zichtbaar in de app', (await A.page.inputValue(`[data-fk="vk-${veld.id}"]`).catch(() => '')) === NOTITIE
    && (await kaart(B.page, veld.id).locator('select').inputValue().catch(() => '')) === nieuweStatus);

  // Zonder verbinding: de wijziging wacht, ook over herladen heen, en gaat later door
  await A.page.goto(`${base}#/communicatie/msg-acv-test`, { waitUntil: 'networkidle' });
  netUit.add('giulia');
  await A.page.fill('[data-fk="msg-msg-acv-test-onderwerp"]', 'Offline aangepast');
  await A.page.click('text=← Alle e-mails');
  await wacht(300);
  const st1 = await syncNu(A.page);
  check('offline: wijziging wacht, app blijft werken', st1.modus === 'offline' && st1.wachtend >= 1 && (await record(A.page, 'berichten', 'msg-acv-test'))?.onderwerp === 'Offline aangepast' && /Geen verbinding/.test(await tekst(A.page, '#navFoot')), JSON.stringify(st1));
  await A.page.reload({ waitUntil: 'networkidle' });
  await A.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  const st1b = await status(A.page);
  check('offline herladen: de kopie op dit toestel blijft bruikbaar', st1b.open && st1b.modus === 'offline' && st1b.wachtend >= 1 && /ACV test/.test(await tekst(A.page, '.grid2__table')) && /Geen verbinding/.test(await tekst(A.page, '#navFoot')), JSON.stringify(st1b));
  netUit.delete('giulia');
  await A.page.evaluate(() => dispatchEvent(new Event('online')));
  const doorgestuurd = await wachtTot(async () => { const s = await status(A.page); return s.modus === 'actief' && s.wachtend === 0; });
  check('weer online: wijziging doorgestuurd', doorgestuurd && rijen.get('berichten|msg-acv-test').data.onderwerp === 'Offline aangepast', JSON.stringify(await status(A.page)));

  // Een oudere versie overschrijft nooit een nieuwere; ze vult alleen ontbrekende velden aan
  const nieuwer = rijen.get('berichten|msg-acv-test');
  await syncNu(B.page);
  await B.page.evaluate(async () => { const s = await import('./js/store.js'); s.pasToe([{ collectie: 'berichten', id: 'msg-acv-test', data: { id: 'msg-acv-test', soort: 'mail', titel: 'ACV test', onderwerp: 'OUD', alleenOud: 'ja', bijgewerkt: '2026-10-01T00:00:00.000Z' }, bijgewerkt: '2026-10-01T00:00:00+00:00', verwijderd: false }]); });
  await syncNu(B.page);
  const naOud = await record(B.page, 'berichten', 'msg-acv-test');
  check('oudere versie wint niet', naOud?.onderwerp === nieuwer.data.onderwerp, naOud?.onderwerp);
  check('oudere versie vult alleen ontbrekende velden aan', naOud?.alleenOud === 'ja');

  // Iemand met een account maar zonder toegang
  const C = await toestel('vreemde');
  await C.page.goto(base, { waitUntil: 'networkidle' });
  await aanmelden(C.page, 'iemand@test.be', WW.iemand);
  await wachtTot(async () => /Nog geen toegang/.test(await tekst(C.page, '.aanmelden')), 3000);
  check('adres zonder toegang ziet niets', /geen toegang/.test(await tekst(C.page, '.aanmelden')) && (await status(C.page)).modus === 'geen-toegang' && !(await tekst(C.page, 'body')).includes('ACV test'));
  await accountMaken(C.page, '', codeRemi, 'test-wachtwoord-nieuw');
  await C.page.waitForSelector('.aanmelden [role=alert]', { timeout: 3000 }).catch(() => {});
  check('een gebruikte code werkt geen tweede keer', /al gebruikt/.test(await tekst(C.page, '.aanmelden [role=alert]')) && !toegang['iemand@test.be'] && accounts.get('iemand@test.be') === WW.iemand);

  // Afmelden met een wijziging die nog niet verstuurd is: eerst bevestigen, daarna alles van het toestel weg
  await A.page.goto(`${base}#/communicatie/msg-acv-test`, { waitUntil: 'networkidle' });
  netUit.add('giulia');
  await A.page.fill('[data-fk="msg-msg-acv-test-onderwerp"]', 'Niet verstuurd voor afmelden');
  await A.page.click('text=← Alle e-mails');
  await wacht(300);
  const dbsVoor = await A.page.evaluate(async () => (await indexedDB.databases()).map(d => d.name));
  await instellingen(A.page);
  let vraag1 = '';
  A.page.once('dialog', d => { vraag1 = d.message(); d.dismiss(); });
  await A.page.click('[data-actie="afmelden"]');
  await wachtTot(() => vraag1 !== '', 3000);
  await wacht(200);
  const sA = await status(A.page);
  check('afmelden met niet verstuurde wijzigingen vraagt eerst bevestiging', /nog niet naar de database gestuurd/.test(vraag1) && sA.open && sA.wachtend >= 1
    && (await record(A.page, 'berichten', 'msg-acv-test'))?.onderwerp === 'Niet verstuurd voor afmelden', vraag1);
  let vraag2 = '';
  A.page.once('dialog', d => { vraag2 = d.message(); d.accept(); });
  await A.page.click('[data-actie="afmelden"]');
  await A.page.waitForSelector('.aanmelden', { timeout: 5000 }).catch(() => {});
  await wacht(300);
  const na = await A.page.evaluate(async () => ({ dbs: (await indexedDB.databases()).map(d => d.name), ls: { ...localStorage }, sync: JSON.parse(localStorage.getItem('remi-sync-v2') || '{}') }));
  check('afmelden wist de gegevens en bijlagen van het toestel', /nog niet naar de database gestuurd/.test(vraag2) && dbsVoor.includes('remi-bijlagen') && !na.dbs.includes('remi-bijlagen')
    && !('remi-nieuwe-start-v1' in na.ls) && !('fake-sessie' in na.ls) && !('remi-mail-handtekening' in na.ls) && !/ACV test|Volmacht|Niet verstuurd|vriendelijke groeten/.test(JSON.stringify(na.ls))
    && na.sync.email === '' && Object.keys(na.sync.wacht || {}).length === 0, JSON.stringify({ voor: dbsVoor, dbs: na.dbs, sleutels: Object.keys(na.ls) }));
  check('na afmelden: aanmeldscherm, geen gegevens meer in de app', await aantal(A.page, '.aanmelden') === 1 && (await status(A.page)).modus === 'afgemeld'
    && !(await tekst(A.page, 'body')).includes('ACV test') && (await record(A.page, 'berichten', 'msg-acv-test')) === null);
  check('de niet verstuurde wijziging kwam nooit in de database', rijen.get('berichten|msg-acv-test').data.onderwerp === 'Offline aangepast');
  // Opnieuw aanmelden: alles komt terug uit de database, ook de bijlage.
  netUit.delete('giulia');
  await aanmelden(A.page, 'giulia@test.be', WW.giulia);
  await A.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  const terug = await record(A.page, 'berichten', 'msg-acv-test');
  const grootteA = await A.page.evaluate(async id => { const b = await import('./js/bijlagen.js'); const blob = await b.leesBijlage(id); return blob ? blob.size : -1; }, bijlageId);
  check('opnieuw aanmelden: de gegevens en de bijlage komen terug uit de database', /ACV test/.test(await tekst(A.page, '.grid2__table')) && terug?.onderwerp === 'Offline aangepast' && grootteA === PDF.length, `${terug?.onderwerp} ${grootteA}`);

  // Afmelden zonder wachtende wijzigingen
  await instellingen(B.page);
  let vraagB = '';
  B.page.once('dialog', d => { vraagB = d.message(); d.accept(); });
  await B.page.click('[data-actie="afmelden"]');
  await B.page.waitForSelector('.aanmelden', { timeout: 5000 }).catch(() => {});
  check('afmelden zonder wachtende wijzigingen: gewone vraag, dan het aanmeldscherm', /^Afmelden op dit toestel\?/.test(vraagB) && await aantal(B.page, '.aanmelden') === 1 && !(await tekst(B.page, 'body')).includes('ACV test'), vraagB);

  for (const t of [A, B, C]) check(`${t.label}: geen consolefouten`, t.fout.length === 0, t.fout.slice(0, 3).join(' | '));
} catch (e) {
  fouten.push('script: ' + (e.stack || e.message));
} finally {
  if (browser) await browser.close();
  server.kill();
}
console.log(`Geslaagd: ${geslaagd.length}`);
if (fouten.length) { console.log(`Mislukt: ${fouten.length}`); fouten.forEach(f => console.log(' - ' + f)); process.exitCode = 1; } else console.log('Alles in orde.');
