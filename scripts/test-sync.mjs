// Test van de centrale database met toestellen van Giulia en Remi en een nagebootste database.
// De nagebootste database volgt supabase/schema.sql (toegang, samenvoegen per veld met stempels zoals de trigger
// records_stempel, grafsteentjes) en de serverfunctie account (toegangscodes per e-mailadres, koppelen).
// Alleen verzonnen adressen en wachtwoorden.
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
const codes = new Map(); // code zonder streepje -> { wie, email, gebruikt, verloopt }
const TEKENS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const schoneCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const rijen = new Map(); const bestanden = new Map();
const PAKKET = 2; // klein, zodat ophalen in meerdere pakketten gebeurt, zoals backend.js met 1000
let klok = Date.parse('2026-10-11T10:00:00Z');
// Tijden zoals Postgres ze teruggeeft: zonder overbodige nullen, met +00:00.
const pg = ms => new Date(ms).toISOString().replace(/\.?0+Z$/, '').replace(/Z$/, '') + '+00:00';
const tijd = () => pg(++klok);
const netUit = new Set();      // toestellen zonder verbinding
const storing = new Set();     // toestellen waarvoor het tweede ophaalpakket wegvalt
let pauze = null;              // { label, open, los }: het ophalen van dit toestel wacht
const pauzeer = label => { let los; const open = new Promise(r => { los = r; }); pauze = { label, open, los }; };
const stuurFout = new Map();   // label -> { status, message, code, keer }: versturen faalt zo
const haalFout = new Map();    // label -> status: ophalen faalt zo
const netUitNa = new Map();    // label -> aantal: na zoveel verzoeken om te versturen valt de verbinding weg
const bestandStoring = new Set(); // bijlagen waarvan het opladen telkens wegvalt
const bestandPauze = new Map();   // bijlage -> belofte: het opladen wacht tot ze vervuld is (een trage upload)
const tel = {};                // label -> { stuur, haal, bestand }: aantal verzoeken
const inVlucht = {};           // label -> { nu, max }: gelijktijdige verzoeken om op te halen
const toestellen = [];
const isObject = d => !!d && typeof d === 'object' && !Array.isArray(d);

// jsonb::text: sleutels korter eerst en dan bytegewijs, ', ' en ': ' als scheiding.
function jsonb(v) {
  if (Array.isArray(v)) return '[' + v.map(jsonb).join(', ') + ']';
  if (isObject(v)) {
    const ks = Object.keys(v).sort((a, b) => (Buffer.byteLength(a) - Buffer.byteLength(b)) || Buffer.compare(Buffer.from(a), Buffer.from(b)));
    return '{' + ks.map(k => JSON.stringify(k) + ': ' + jsonb(v[k])).join(', ') + '}';
  }
  return JSON.stringify(v ?? null);
}
const vast = jsonb; // jsonb vergelijkt zonder op de volgorde van de sleutels te letten
// Zoals de trigger public.records_stempel (afspraak A): een grafsteentje wint of verliest volledig op bijgewerkt
// (gelijk: het grafsteentje wint); anders per veld de hoogste stempel, bij gelijke stempel de grootste jsonb-tekst
// (collate "C"); _t het maximum per veld, bijgewerkt het maximum. Niets veranderd: geen update (null).
function voegSamen(o, n) {
  const bo = o.bijgewerkt || '', bn = n.bijgewerkt || '';
  if (o.verwijderd || n.verwijderd) {
    if (bo !== bn) return bo > bn ? o : n;
    return o.verwijderd ? o : n;
  }
  const to = isObject(o._t) ? o._t : {}, tn = isObject(n._t) ? n._t : {};
  const uit = { id: n.id ?? o.id };
  for (const k of new Set([...Object.keys(o), ...Object.keys(n)])) {
    if (['id', 'bijgewerkt', '_t', 'verwijderd'].includes(k)) continue;
    if (!(k in n)) { uit[k] = o[k]; continue; }
    if (!(k in o)) { uit[k] = n[k]; continue; }
    const so = to[k] || '', sn = tn[k] || '';
    if (so !== sn) uit[k] = so > sn ? o[k] : n[k];
    else uit[k] = Buffer.compare(Buffer.from(jsonb(o[k])), Buffer.from(jsonb(n[k]))) >= 0 ? o[k] : n[k];
  }
  const t = { ...to };
  for (const [k, s] of Object.entries(tn)) if ((s || '') > (t[k] || '')) t[k] = s;
  uit.bijgewerkt = bo > bn ? bo : bn;
  uit._t = t;
  return uit;
}
function stempel(oud, r, email) {
  let data = r.data;
  if (oud) {
    data = voegSamen(oud.data, r.data);
    if (vast(data) === vast(oud.data)) return null;
  }
  return { collectie: r.collectie, id: r.id, data, bijgewerkt: pg(Date.parse(data.bijgewerkt)), verwijderd: !!data.verwijderd, gewijzigd_door: email, server_tijd: tijd() };
}
const volgorde = (a, b) => Date.parse(a.server_tijd) - Date.parse(b.server_tijd) || a.collectie.localeCompare(b.collectie) || a.id.localeCompare(b.id);
// Live verbinding: elke echte wijziging gaat naar elk tabblad met verbinding (ook naar de afzender, zoals realtime).
function duw(veranderd) {
  for (const t of toestellen) {
    if (netUit.has(t.label)) continue;
    t.page.evaluate(r => globalThis.__fakeLuister?.(r), veranderd).catch(() => {});
  }
}
const telOp = (label, wat) => { tel[label] = tel[label] || { stuur: 0, haal: 0, bestand: 0 }; tel[label][wat]++; };

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
  if (pad === 'account') return accountFunctie(body, json);
  if (pad === 'wie') return json(200, { wie: toegang[email] || null });
  if (pad === 'haal') {
    telOp(label, 'haal');
    if (!toegang[email]) return json(403, { message: 'permission denied' });
    const iv = inVlucht[label] = inVlucht[label] || { nu: 0, max: 0 };
    iv.nu++; iv.max = Math.max(iv.max, iv.nu);
    try {
      if (pauze && pauze.label === label) await pauze.open;
      if (haalFout.has(label)) return json(haalFout.get(label), { message: 'Service Unavailable' });
      const op = u.searchParams.get('op');
      if (op === 'gte' && storing.has(label)) return route.abort('internetdisconnected');
      const vanaf = Date.parse(u.searchParams.get('vanaf')), van = Number(u.searchParams.get('van')) || 0, aantal = Number(u.searchParams.get('aantal')) || 1000;
      const lijst = [...rijen.values()].filter(r => (op === 'gte' ? Date.parse(r.server_tijd) >= vanaf : Date.parse(r.server_tijd) > vanaf)).sort(volgorde);
      return json(200, lijst.slice(van, van + aantal));
    } finally { iv.nu--; }
  }
  if (pad === 'stuur') {
    telOp(label, 'stuur');
    if (netUitNa.has(label)) {
      const n = netUitNa.get(label) - 1;
      if (n < 0) { netUit.add(label); netUitNa.delete(label); return route.abort('internetdisconnected'); }
      netUitNa.set(label, n);
    }
    const f = stuurFout.get(label);
    if (f) { if (--f.keer <= 0) stuurFout.delete(label); return json(f.status, { message: f.message, code: f.code }); }
    if (!toegang[body.email]) return json(403, { message: 'new row violates row-level security policy', code: '42501' });
    // Zoals jsonb: een record met een \u0000 wordt geweigerd, en dan het hele verzoek.
    if ((body.rijen || []).some(r => r.data?.slecht === true)) return json(400, { message: 'unsupported Unicode escape sequence', code: '22P05' });
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
    if (req.method() === 'POST') { telOp(label, 'bestand'); if (bestandStoring.has(id)) return route.abort('timedout'); if (bestandPauze.has(id)) await bestandPauze.get(id); bestanden.set(id, body); return json(200, {}); }
    if (req.method() === 'DELETE') { bestanden.delete(id); return json(200, {}); }
    return bestanden.has(id) ? json(200, bestanden.get(id)) : json(404, { message: 'Object not found' });
  }
  return json(404, {});
}
// Zoals de serverfunctie account (afspraak D).
function accountFunctie(body, json) {
  const nu = Date.now();
  const sessie = String(body.door || '');
  const geldigeCode = (c, adres) => {
    const x = codes.get(schoneCode(c));
    if (!x || x.gebruikt || x.verloopt < nu || x.email !== adres) return null;
    return x;
  };
  if (body.actie === 'code') {
    if (!toegang[sessie]) return json(403, { message: 'Dit adres heeft geen toegang.' });
    if (!['remi', 'giulia'].includes(body.wie)) return json(400, { message: 'Voor wie is de code?' });
    const adres = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adres)) return json(400, { message: 'Vul het e-mailadres in van wie de code krijgt.' });
    for (const x of codes.values()) if (x.email === adres && !x.gebruikt) x.verloopt = nu - 1; // oudere codes vervallen
    const c = Array.from({ length: 10 }, () => TEKENS[randomInt(TEKENS.length)]).join('');
    codes.set(c, { wie: body.wie, email: adres, gebruikt: false, verloopt: nu + 864e5 });
    return json(200, { code: `${c.slice(0, 5)}-${c.slice(5)}`, verloopt: new Date(nu + 864e5).toISOString() });
  }
  if (body.actie === 'maak' || body.actie === 'koppel') {
    const adres = body.actie === 'koppel' ? sessie : String(body.email || '').trim().toLowerCase();
    if (body.actie === 'koppel' && !adres) return json(401, { message: 'Niet aangemeld.' });
    if (body.actie === 'maak' && String(body.wachtwoord || '').length < 8) return json(400, { message: 'Kies een wachtwoord van minstens 8 tekens.' });
    const c = geldigeCode(body.code, adres);
    if (!c) return json(400, { message: 'Deze code klopt niet, hoort niet bij dit e-mailadres, is al gebruikt of is verlopen. Vraag een nieuwe code.' });
    if (toegang[adres] && toegang[adres] !== c.wie) return json(400, { message: 'Dit adres heeft al toegang voor iemand anders.' });
    c.gebruikt = true;
    const nieuw = !accounts.has(adres);
    if (body.actie === 'maak') accounts.set(adres, body.wachtwoord);
    toegang[adres] = c.wie;
    return json(200, { ok: true, wie: c.wie, nieuw });
  }
  return json(400, { message: 'Onbekende actie.' });
}

// De nagebootste backend in de browser: dezelfde functies als backend.js, via de routes /__fake/*.
// Fouten krijgen een soort zoals in backend.js (met dezelfde functie soortFout).
function nagebootsteBackend(PAKKET) {
  const sessie = () => localStorage.getItem('fake-sessie') || '';
  const authLuisteraars = new Set();
  const authGewijzigd = () => { for (const cb of authLuisteraars) setTimeout(cb, 0); };
  async function vraag(pad, { body, methode } = {}) {
    let r;
    try { r = await fetch('/__fake/' + pad, body === undefined ? { method: methode || 'GET' } : { method: methode || 'POST', body: JSON.stringify(body) }); }
    catch { throw Object.assign(new Error('Failed to fetch'), { offline: true, soort: 'tijdelijk', status: 0 }); }
    const antw = await r.json().catch(() => ({}));
    if (!r.ok) {
      const { soortFout } = await import('/js/backend.js');
      const e = Object.assign(new Error(antw.message || 'fake ' + r.status), antw, { status: r.status });
      e.soort = soortFout(e, r.status);
      e.offline = e.soort === 'tijdelijk';
      throw e;
    }
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
    koppel: code => vraag('account', { body: { actie: 'koppel', code, door: sessie() } }),
    codeMaken: (wie, email) => vraag('account', { body: { actie: 'code', wie, email, door: sessie() } }),
    async afmelden() { localStorage.removeItem('fake-sessie'); authGewijzigd(); return true; },
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
// Een klok die per toestel kan voor- of achterlopen (globalThis.__klokVerschil in ms).
function verschuifbareKlok() {
  const Echt = Date;
  const v = () => Number(globalThis.__klokVerschil || 0);
  function D(...a) { if (!new.target) return new Echt(Echt.now() + v()).toString(); return a.length ? new Echt(...a) : new Echt(Echt.now() + v()); }
  D.prototype = Echt.prototype; D.now = () => Echt.now() + v(); D.parse = Echt.parse; D.UTC = Echt.UTC;
  globalThis.Date = D;
}
// Gegevens die al op een toestel stonden voor er een database was (zoals na de import).
const BESTAAND = JSON.stringify({ berichten: [{ id: 'msg-bestaand-test', soort: 'mail', titel: 'Bestaande test', onderwerp: 'Vraag om bijstand', naar: 'instantie@voorbeeld.be', tekst: 'Beste,\n\nTest.\n\nRemi', status: 'concept', bijgewerkt: '2026-10-11T09:00:00.000Z' }] });
const BESTAAND2 = JSON.stringify({ notities: [{ id: 'not-tweede-toestel', titel: 'Alleen op het tweede toestel', tekst: 'Nog nooit in de database', bijgewerkt: '2026-10-12T09:00:00.000Z' }] });
const PDF = Buffer.from('%PDF-1.4 volmacht test');

let browser;
try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ executablePath: chromiumPath() });
  const toestel = async (label, { bestaand = '' } = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, timezoneId: 'Europe/Brussels' });
    await ctx.route(url => !url.href.startsWith(base), r => r.abort());
    await ctx.route('**/__fake/**', r => nepDatabase(r, label));
    await ctx.addInitScript(verschuifbareKlok);
    await ctx.addInitScript(nagebootsteBackend, PAKKET);
    if (bestaand) await ctx.addInitScript(d => { if (!localStorage.getItem('test-bestaand')) { localStorage.setItem('test-bestaand', '1'); localStorage.setItem('remi-nieuwe-start-v1', d); } }, bestaand);
    const t = { ctx, label, fout: [] };
    t.page = await tabblad(t);
    return t;
  };
  // Een (extra) tabblad in dezelfde browser van een toestel: dezelfde opslag.
  const tabblad = async t => {
    const page = await t.ctx.newPage();
    page.on('pageerror', e => t.fout.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) t.fout.push(m.text()); });
    toestellen.push({ label: t.label, page });
    return page;
  };
  const tekst = (page, sel) => page.textContent(sel, { timeout: 1000 }).catch(() => '');
  const aantal = (page, sel) => page.locator(sel).count();
  const aanmelden = async (page, email, wachtwoord) => {
    await page.fill('[data-fk="aanmeld-mail"]', email);
    await page.fill('[data-fk="aanmeld-ww"]', wachtwoord);
    await page.click('.aanmelden button[type=submit]');
  };
  // Account maken met een toegangscode op het codeformulier.
  const accountMaken = async (page, email, code, wachtwoord) => {
    if (email) await page.fill('[data-fk="code-mail"]', email);
    await page.fill('[data-fk="code-code"]', code);
    await page.fill('[data-fk="code-ww"]', wachtwoord);
    await page.fill('[data-fk="code-ww2"]', wachtwoord);
    await page.click('.aanmelden button[type=submit]');
  };
  const status = page => page.evaluate(async () => (await import('./js/sync.js')).syncStatus());
  // Twee keer: loopt er al een ronde, dan haalt de tweede ook op wat daarna nog bijkwam. Daarna wachten op de
  // bijlagen, die in hun eigen lus lopen.
  const syncNu = page => page.evaluate(async () => { const s = await import('./js/sync.js'); await s.syncNu(); await s.syncNu(); await s.bijlagenKlaar(); return s.syncStatus(); });
  const lokaal = (page, c, id) => page.evaluate(async ([c, id]) => (await import('./js/store.js')).lokaalRecord(c, id), [c, id]);
  const record = (page, c, id) => page.evaluate(async ([c, id]) => (await import('./js/store.js')).get(c, id) || null, [c, id]);
  const zetRecord = (page, c, rec, opties) => page.evaluate(async ([c, rec, opties]) => (await import('./js/store.js')).upsert(c, rec, opties), [c, rec, opties || {}]);
  const opslag = page => page.evaluate(() => ({ ...localStorage }));
  const syncToestand = page => page.evaluate(() => JSON.parse(localStorage.getItem('remi-sync-v2') || '{}'));
  const klokVerschil = (page, ms) => page.evaluate(ms => { globalThis.__klokVerschil = ms; }, ms);
  const instellingen = async page => { await page.click('.chrome__iconbtn[aria-label="Instellingen"]'); await page.waitForSelector('[data-sync-status]', { timeout: 3000 }).catch(() => {}); };
  const codeVoor = (page, wie, email) => page.evaluate(async ([wie, email]) => { try { return await (await import('./js/sync.js')).codeMaken(wie, email); } catch (e) { return { fout: e.message }; } }, [wie, email]);

  // ---- Giulia: had al gegevens op haar toestel ----
  const A = await toestel('giulia', { bestaand: BESTAAND });
  await A.page.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' });
  await A.page.waitForSelector('[data-fk="aanmeld-ww"]', { timeout: 5000 }).catch(() => {});
  check('zonder aanmelding: aanmeldscherm met e-mail en wachtwoord, geen gegevens',
    await aantal(A.page, '.aanmelden') === 1 && (await A.page.getAttribute('[data-fk="aanmeld-ww"]', 'type').catch(() => '')) === 'password'
    && await aantal(A.page, '[data-fk="aanmeld-mail"]') === 1 && /Gebruik een toegangscode/.test(await tekst(A.page, '.aanmelden'))
    && await aantal(A.page, '.grid2__table') === 0 && !(await tekst(A.page, 'body')).includes('Bestaande test'));
  await aanmelden(A.page, 'giulia@test.be', 'verkeerd-wachtwoord');
  await A.page.waitForSelector('.aanmelden [role=alert]', { timeout: 3000 }).catch(() => {});
  check('verkeerd wachtwoord: melding, geen gegevens', /passen niet bij elkaar/.test(await tekst(A.page, '.aanmelden [role=alert]'))
    && await aantal(A.page, '.grid2__table') === 0 && (await status(A.page)).modus === 'afgemeld' && !(await tekst(A.page, 'body')).includes('Bestaande test'));
  await aanmelden(A.page, 'giulia@test.be', WW.giulia);
  await A.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  check('na aanmelden: de app met de eigen gegevens', await aantal(A.page, '.aanmelden') === 0 && /Bestaande test/.test(await tekst(A.page, '.grid2__table')));
  check('weet wie aangemeld is', /Aangemeld als Giulia/.test(await tekst(A.page, '#brandWho')));
  await syncNu(A.page);
  const bestaandRij = rijen.get('berichten|msg-bestaand-test');
  check('bestaande gegevens gaan naar de database, met een stempel per veld', bestaandRij?.gewijzigd_door === 'giulia@test.be'
    && bestaandRij.data._t?.onderwerp === '2026-10-11T09:00:00.000Z' && bestaandRij.data.bijgewerkt === '2026-10-11T09:00:00.000Z', JSON.stringify(bestaandRij?.data));
  // Seed-records: één keer volledig naar de database, zonder stempels.
  const seedInfo = await A.page.evaluate(async () => { const { seed } = await import('./js/seed.js'); return { hot: seed.hotlist[0], sol: seed.sollicitaties[0] }; });
  const hotRij = rijen.get(`hotlist|${seedInfo.hot.id}`);
  check('seed-records staan volledig in de database (zonder stempels)', hotRij?.data?.naam === seedInfo.hot.naam && vast(hotRij.data._t) === '{}' && hotRij.data.bijgewerkt === '2000-01-01T00:00:00.000Z', JSON.stringify(hotRij?.data)?.slice(0, 200));
  const nieuweSolStatus = seedInfo.sol.status === 'gesprek' ? 'verstuurd' : 'gesprek';
  await zetRecord(A.page, 'sollicitaties', { id: seedInfo.sol.id, status: nieuweSolStatus });
  const solLokaal = await lokaal(A.page, 'sollicitaties', seedInfo.sol.id);
  await syncNu(A.page);
  const solRij = rijen.get(`sollicitaties|${seedInfo.sol.id}`);
  check('seed-record bewerkt: volledig record lokaal en in de database, stempel alleen voor de patch',
    solLokaal?.organisatie === seedInfo.sol.organisatie && solLokaal?.functie === seedInfo.sol.functie && Object.keys(solLokaal?._t || {}).join() === 'status'
    && solRij?.data?.status === nieuweSolStatus && solRij.data.organisatie === seedInfo.sol.organisatie && solRij.data.functie === seedInfo.sol.functie
    && Object.keys(solRij.data._t || {}).join() === 'status', JSON.stringify({ lok: solLokaal?._t, db: solRij?.data?._t }));
  // Bijlage toevoegen op Giulia's toestel
  await A.page.goto(`${base}#/communicatie/msg-bestaand-test`, { waitUntil: 'networkidle' });
  await A.page.setInputFiles('input[data-bijlage="msg-bestaand-test"]', { name: 'Volmacht.pdf', mimeType: 'application/pdf', buffer: PDF });
  await A.page.waitForSelector('.mail-bijlagen li', { timeout: 3000 }).catch(() => {});
  await syncNu(A.page);
  const bijlageId = [...bestanden.keys()][0] || '';
  check('bijlage staat in de database-opslag', bestanden.size === 1 && bijlageId.startsWith('mail-msg-bestaand-test/'), [...bestanden.keys()].join(','));
  // Handtekening is gedeeld
  await A.page.goto(`${base}#/communicatie?tab=instellingen`, { waitUntil: 'networkidle' });
  await A.page.fill('[data-fk="mail-handtekening"]', 'Met vriendelijke groeten\n\nRemi');
  await wacht(600);
  await syncNu(A.page);
  // Een toegangscode maken voor Remi, gebonden aan zijn adres (in Instellingen, of anders rechtstreeks).
  let codeRemiAntw = null;
  await instellingen(A.page);
  await A.page.click('[data-actie="code-remi"]').catch(() => {});
  if (await A.page.waitForSelector('[data-fk="code-adres"]', { timeout: 2000 }).then(() => true).catch(() => false)) {
    await A.page.fill('[data-fk="code-adres"]', ' Remi@Test.be ');
    await A.page.click('[data-actie="code-maken"]');
    const code = await A.page.waitForSelector('[data-nieuwe-code]', { timeout: 3000 }).then(el => el.getAttribute('data-nieuwe-code')).catch(() => '');
    const c = codes.get(schoneCode(code));
    codeRemiAntw = { code, verloopt: c ? new Date(c.verloopt).toISOString() : '' };
    check('Instellingen: code voor Remi met zijn e-mailadres', !!code && /remi@test\.be/.test(await tekst(A.page, '[data-nieuwe-code]')), code);
  } else codeRemiAntw = await codeVoor(A.page, 'remi', ' Remi@Test.be ');
  await A.page.click('#peekClose').catch(() => {});
  const codeRemi = codeRemiAntw?.code || '';
  check('code voor Remi: gebonden aan zijn (genormaliseerd) adres, 24 uur geldig', /^[A-Z2-9]{5}-[A-Z2-9]{5}$/.test(codeRemi)
    && codes.get(schoneCode(codeRemi))?.wie === 'remi' && codes.get(schoneCode(codeRemi))?.email === 'remi@test.be'
    && Math.abs(Date.parse(codeRemiAntw.verloopt) - Date.now() - 864e5) < 60_000, JSON.stringify(codeRemiAntw));
  check('code zonder geldig adres wordt geweigerd', !!(await codeVoor(A.page, 'remi', 'geen-adres'))?.fout);

  // ---- Remi: nieuw toestel, niets lokaal, nog geen account ----
  const B = await toestel('remi');
  await B.page.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' });
  await B.page.waitForSelector('.aanmelden', { timeout: 5000 }).catch(() => {});
  await B.page.click('text=Gebruik een toegangscode');
  await B.page.waitForSelector('[data-fk="code-code"]', { timeout: 3000 }).catch(() => {});
  await accountMaken(B.page, 'remi@test.be', 'ZZZZZ-ZZZZZ', WW.remi);
  await B.page.waitForSelector('.aanmelden [role=alert]', { timeout: 3000 }).catch(() => {});
  check('account maken met een verkeerde code: melding, geen account', /klopt niet/.test(await tekst(B.page, '.aanmelden [role=alert]')) && !accounts.has('remi@test.be'));
  await B.page.fill('[data-fk="code-mail"]', '');
  await accountMaken(B.page, 'andere@test.be', codeRemi, WW.remi);
  await wachtTot(async () => /hoort niet bij/.test(await tekst(B.page, '.aanmelden [role=alert]')), 3000);
  check('de code van Remi werkt niet voor een ander adres', /hoort niet bij/.test(await tekst(B.page, '.aanmelden [role=alert]')) && !accounts.has('andere@test.be') && !codes.get(schoneCode(codeRemi)).gebruikt);
  await B.page.fill('[data-fk="code-mail"]', '');
  // De eerste ophaalbeurt wacht even, en daarna valt het tweede pakket weg.
  pauzeer('remi'); storing.add('remi');
  await accountMaken(B.page, 'remi@test.be', codeRemi, WW.remi);
  const ophalen = await wachtTot(async () => /Alles ophalen/.test(await tekst(B.page, '.aanmelden')));
  const s1 = await status(B.page);
  check('account maken met de code op het code-formulier', accounts.get('remi@test.be') === WW.remi && toegang['remi@test.be'] === 'remi' && codes.get(schoneCode(codeRemi))?.gebruikt === true);
  check('nieuw toestel: de poort blijft dicht tot alles opgehaald is (ophalen)', ophalen && s1.modus === 'ophalen' && !s1.open
    && await aantal(B.page, '.grid2__table') === 0 && (await B.page.innerHTML('#nav')).trim() === '' && !(await tekst(B.page, 'body')).includes('Bestaande test'), JSON.stringify(s1));
  pauze.los(); pauze = null;
  const half = await wachtTot(async () => /Nog geen gegevens op dit toestel/.test(await tekst(B.page, '.aanmelden')));
  const s2 = await status(B.page);
  check('half opgehaald telt niet: poort blijft dicht, niets toegepast', half && !s2.open && s2.modus === 'offline'
    && (await lokaal(B.page, 'berichten', 'msg-bestaand-test')) === null && !(await tekst(B.page, 'body')).includes('Bestaande test'), JSON.stringify(s2));
  storing.delete('remi');
  await B.page.click('.aanmelden button:has-text("Opnieuw proberen")').catch(() => {});
  await B.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  check('Remi ziet de mail van Giulia na de volledige ophaalbeurt', /Bestaande test/.test(await tekst(B.page, '.grid2__table')) && (await status(B.page)).open);
  check('Remi is aangemeld als Remi', /Aangemeld als Remi/.test(await tekst(B.page, '#brandWho')));
  check('Remi ziet het bewerkte seed-record van Giulia', (await record(B.page, 'sollicitaties', seedInfo.sol.id))?.status === nieuweSolStatus);
  await B.page.goto(`${base}#/communicatie/msg-bestaand-test`, { waitUntil: 'networkidle' });
  check('Remi ziet de bijlage in de lijst', /Volmacht\.pdf/.test(await tekst(B.page, '.mail-bijlagen')));
  const grootte = await B.page.evaluate(async id => { const b = await import('./js/bijlagen.js'); const blob = await b.leesBijlage(id); return blob ? blob.size : -1; }, bijlageId);
  check('Remi kan de bijlage openen (opgehaald uit de opslag)', grootte === PDF.length, String(grootte));
  check('handtekening gedeeld', (await B.page.evaluate(async () => (await import('./js/views-comm.js')).handtekening())) === 'Met vriendelijke groeten\n\nRemi');
  // Remi past het onderwerp aan; Giulia ziet het
  await B.page.fill('[data-fk="msg-msg-bestaand-test-onderwerp"]', 'Vraag om bijstand (aangepast door Remi)');
  await B.page.click('text=← Alle e-mails');
  await wacht(300);
  await syncNu(B.page);
  check('wijziging van Remi in de database', rijen.get('berichten|msg-bestaand-test')?.data?.onderwerp === 'Vraag om bijstand (aangepast door Remi)' && rijen.get('berichten|msg-bestaand-test').gewijzigd_door === 'remi@test.be');
  await A.page.goto(`${base}#/communicatie/msg-bestaand-test`, { waitUntil: 'networkidle' });
  await syncNu(A.page);
  await A.page.waitForTimeout(200);
  check('Giulia ziet de wijziging van Remi', (await A.page.inputValue('[data-fk="msg-msg-bestaand-test-onderwerp"]')) === 'Vraag om bijstand (aangepast door Remi)');

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
  check('verwijderen: een leeg grafsteentje in de database', graf?.verwijderd === true && vast(Object.keys(graf.data).sort()) === '["_t", "bijgewerkt", "id", "verwijderd"]' && vast(graf.data._t) === '{}', JSON.stringify(graf?.data));
  // Giulia werkt zelf niet bij: de live verbinding brengt het verwijderen binnen.
  const live = await wachtTot(async () => !/Mail van Remi/.test(await tekst(A.page, '.grid2__table')), 3000);
  check('live verbinding: verwijderen verdwijnt bij Giulia zonder bij te werken', live);
  await syncNu(A.page); await A.page.waitForTimeout(200);
  const grafA = await lokaal(A.page, 'berichten', nieuwId);
  check('verwijderen gaat door naar Giulia (ook bij haar een leeg grafsteentje)', !/Mail van Remi/.test(await tekst(A.page, '.grid2__table'))
    && grafA?.verwijderd === true && !('onderwerp' in grafA) && (await record(A.page, 'berichten', nieuwId)) === null, JSON.stringify(grafA));
  // Een bewerking op een record dat elders verwijderd werd, laat het niet stil herleven.
  const herleef = await A.page.evaluate(async id => {
    const s = await import('./js/store.js');
    let fout = null;
    try { s.upsert('berichten', { id, onderwerp: 'Toch nog getypt' }, { silent: true }); } catch (e) { fout = e; }
    const naFout = s.lokaalRecord('berichten', id);
    const hersteld = s.upsert('berichten', { id, soort: 'mail', onderwerp: 'Bewust hersteld' }, { herstel: true, silent: true });
    return { fout: fout && fout.verwijderd === true, nogGraf: naFout?.verwijderd === true && !('onderwerp' in naFout), hersteld: hersteld?.onderwerp, bw: s.lokaalRecord('berichten', id).bijgewerkt > naFout.bijgewerkt };
  }, nieuwId);
  check('patch op een grafsteentje geeft een fout, herstel alleen bewust', herleef.fout && herleef.nogGraf && herleef.hersteld === 'Bewust hersteld' && herleef.bw, JSON.stringify(herleef));
  await syncNu(A.page);
  check('bewust hersteld record gaat naar de database', rijen.get(`berichten|${nieuwId}`)?.verwijderd === false && rijen.get(`berichten|${nieuwId}`).data.onderwerp === 'Bewust hersteld');

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

  // Twee toestellen wijzigen tegelijk verschillende velden van hetzelfde (volledige) record: beide blijven.
  await zetRecord(A.page, 'sollicitaties', { id: 'sol-samen', organisatie: 'Testmuseum', functie: 'Atelier', status: 'te doen', notities: 'Eerste versie' });
  await syncNu(A.page); await syncNu(B.page);
  netUit.add('giulia'); netUit.add('remi');
  await zetRecord(A.page, 'sollicitaties', { ...(await record(A.page, 'sollicitaties', 'sol-samen')), status: 'verstuurd' }); // een volledig formulier
  await wacht(20);
  await zetRecord(B.page, 'sollicitaties', { ...(await record(B.page, 'sollicitaties', 'sol-samen')), notities: 'Notitie van Remi' });
  netUit.delete('giulia'); netUit.delete('remi');
  await syncNu(B.page); await syncNu(A.page); await syncNu(B.page);
  const samen = rijen.get('sollicitaties|sol-samen')?.data, samenA = await record(A.page, 'sollicitaties', 'sol-samen'), samenB = await record(B.page, 'sollicitaties', 'sol-samen');
  check('tegelijk andere velden van hetzelfde record: beide blijven (database en beide toestellen)', samen?.status === 'verstuurd' && samen?.notities === 'Notitie van Remi'
    && samenA?.status === 'verstuurd' && samenA?.notities === 'Notitie van Remi' && samenB?.status === 'verstuurd' && samenB?.notities === 'Notitie van Remi'
    && samen.organisatie === 'Testmuseum', JSON.stringify({ samen, samenA, samenB }));

  // Klokverschil van 10 minuten: Giulia's toestel loopt voor. Een latere bewerking van Remi gaat niet verloren.
  await klokVerschil(A.page, 10 * 60_000);
  await zetRecord(A.page, 'sollicitaties', { id: 'sol-klok', organisatie: 'Klokmuseum', status: 'te doen' });
  await syncNu(A.page); await syncNu(B.page);
  const stempelA = (await lokaal(A.page, 'sollicitaties', 'sol-klok'))?._t?.status || '';
  await zetRecord(B.page, 'sollicitaties', { id: 'sol-klok', status: 'verstuurd' });
  const stempelB = (await lokaal(B.page, 'sollicitaties', 'sol-klok'))?._t?.status || '';
  await syncNu(B.page); await syncNu(A.page);
  const klokRij = rijen.get('sollicitaties|sol-klok')?.data;
  check('klokverschil van 10 minuten: de latere bewerking wint overal', stempelB > stempelA && Date.parse(stempelA) - Date.now() > 9 * 60_000
    && klokRij?.status === 'verstuurd' && (await record(A.page, 'sollicitaties', 'sol-klok'))?.status === 'verstuurd' && (await record(B.page, 'sollicitaties', 'sol-klok'))?.status === 'verstuurd'
    && (await status(B.page)).wachtend === 0, JSON.stringify({ stempelA, stempelB, klokRij }));
  // Het andere toestel kent nu een stempel in de toekomst; een nieuwe bewerking daar komt er toch na.
  await zetRecord(B.page, 'sollicitaties', { id: 'sol-klok', notities: 'Na de toekomst' });
  await zetRecord(B.page, 'notities', { id: 'not-klok', tekst: 'Nieuw record op het toestel met de juiste klok' });
  const nieuwB = await lokaal(B.page, 'notities', 'not-klok');
  check('de klok volgt de hoogste stempel van de server (+1 ms)', nieuwB?.bijgewerkt > stempelA, `${nieuwB?.bijgewerkt} ${stempelA}`);
  await klokVerschil(A.page, 0);
  await zetRecord(A.page, 'sollicitaties', { id: 'sol-klok', status: 'gesprek' });
  await syncNu(A.page); await syncNu(B.page);
  check('klok weer juist: een nieuwe bewerking wint nog altijd van de stempel in de toekomst', rijen.get('sollicitaties|sol-klok')?.data?.status === 'gesprek'
    && rijen.get('sollicitaties|sol-klok')?.data?.notities === 'Na de toekomst' && (await record(B.page, 'sollicitaties', 'sol-klok'))?.status === 'gesprek', JSON.stringify(rijen.get('sollicitaties|sol-klok')?.data));

  // Zonder verbinding: de wijziging wacht, ook over herladen heen, en gaat later door
  await A.page.goto(`${base}#/communicatie/msg-bestaand-test`, { waitUntil: 'networkidle' });
  netUit.add('giulia');
  await A.page.fill('[data-fk="msg-msg-bestaand-test-onderwerp"]', 'Offline aangepast');
  await A.page.click('text=← Alle e-mails');
  await wacht(300);
  const st1 = await syncNu(A.page);
  check('offline: wijziging wacht, app blijft werken', st1.modus === 'offline' && st1.wachtend === 1 && (await record(A.page, 'berichten', 'msg-bestaand-test'))?.onderwerp === 'Offline aangepast' && /Geen verbinding/.test(await tekst(A.page, '#navFoot')), JSON.stringify(st1));
  await A.page.reload({ waitUntil: 'networkidle' });
  await A.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  const st1b = await status(A.page);
  check('offline herladen: de kopie op dit toestel blijft bruikbaar', st1b.open && st1b.modus === 'offline' && st1b.wachtend === 1 && /Bestaande test/.test(await tekst(A.page, '.grid2__table')) && /Geen verbinding/.test(await tekst(A.page, '#navFoot')), JSON.stringify(st1b));
  netUit.delete('giulia');
  await A.page.evaluate(() => dispatchEvent(new Event('online')));
  const doorgestuurd = await wachtTot(async () => { const s = await status(A.page); return s.modus === 'actief' && s.wachtend === 0; });
  check('weer online: wijziging doorgestuurd', doorgestuurd && rijen.get('berichten|msg-bestaand-test').data.onderwerp === 'Offline aangepast', JSON.stringify(await status(A.page)));

  // Een oudere versie overschrijft nooit een nieuwere; ze vult alleen ontbrekende velden aan
  const nieuwer = rijen.get('berichten|msg-bestaand-test');
  await syncNu(B.page);
  await B.page.evaluate(async () => { const s = await import('./js/store.js'); s.pasToe([{ collectie: 'berichten', id: 'msg-bestaand-test', data: { id: 'msg-bestaand-test', soort: 'mail', titel: 'Bestaande test', onderwerp: 'OUD', alleenOud: 'ja', bijgewerkt: '2026-10-01T00:00:00.000Z', _t: { onderwerp: '2026-10-01T00:00:00.000Z', alleenOud: '2026-10-01T00:00:00.000Z' } }, bijgewerkt: '2026-10-01T00:00:00+00:00', verwijderd: false }]); });
  await syncNu(B.page);
  const naOud = await record(B.page, 'berichten', 'msg-bestaand-test');
  check('oudere versie wint niet', naOud?.onderwerp === nieuwer.data.onderwerp, naOud?.onderwerp);
  check('oudere versie vult alleen ontbrekende velden aan (ook in de database)', naOud?.alleenOud === 'ja' && rijen.get('berichten|msg-bestaand-test').data.alleenOud === 'ja');

  // Netwerkfout midden in een pakket: niets gaat verloren uit de wachtrij.
  await syncNu(B.page);
  const NOTS = ['not-p1', 'not-p2', 'not-slecht', 'not-p4', 'not-p5', 'not-p6'];
  tel.remi = { stuur: 0, haal: 0, bestand: 0 };
  netUitNa.set('remi', 4); // het pakket (geweigerd), dan één voor één: p1, p2, slecht (geweigerd), en bij p4 valt de verbinding weg
  const sPakket = await B.page.evaluate(async ids => {
    const st = await import('./js/store.js'), s = await import('./js/sync.js');
    for (const id of ids) st.upsert('notities', { id, titel: id, ...(id === 'not-slecht' ? { slecht: true } : {}) }, { silent: true });
    await s.syncNu();
    return s.syncStatus();
  }, NOTS);
  const inDb = NOTS.filter(id => rijen.has(`notities|${id}`));
  check('netwerkfout midden in een pakket: alleen echt verstuurde records uit de wachtrij', inDb.join() === 'not-p1,not-p2' && sPakket.modus === 'offline'
    && sPakket.wachtend === 3 && sPakket.mislukt === 1 && tel.remi.stuur === 5, JSON.stringify({ inDb, sPakket, tel: tel.remi }));
  await B.page.reload({ waitUntil: 'networkidle' });
  await wachtTot(async () => (await status(B.page)).modus === 'offline', 3000);
  const sHerladen = await status(B.page);
  const naHerladen = await B.page.evaluate(async () => { const s = await import('./js/sync.js'); return s.mislukteLijst(); });
  check('ook na herladen: de rest wacht nog, het geweigerde record staat bij mislukt met de reden', sHerladen.wachtend === 3 && sHerladen.mislukt === 1 && sHerladen.open
    && naHerladen.length === 1 && /not-slecht/.test(naHerladen[0].wat) && /Unicode/.test(naHerladen[0].reden), JSON.stringify({ sHerladen, naHerladen }));
  netUit.delete('remi');
  await B.page.evaluate(() => dispatchEvent(new Event('online')));
  await wachtTot(async () => { const s = await status(B.page); return s.modus === 'actief' && s.wachtend === 0; }, 8000);
  const naHerstel = await status(B.page);
  check('weer verbinding: de rest komt alsnog aan, het geweigerde record blijft apart', NOTS.filter(id => rijen.has(`notities|${id}`)).join() === 'not-p1,not-p2,not-p4,not-p5,not-p6'
    && naHerstel.wachtend === 0 && naHerstel.mislukt === 1 && naHerstel.modus === 'actief', JSON.stringify(naHerstel));
  // Een tijdelijke serverfout (503) op een pakket: niet één voor één proberen, niets naar mislukt.
  await syncNu(B.page);
  tel.remi = { stuur: 0, haal: 0, bestand: 0 };
  stuurFout.set('remi', { status: 503, message: 'Service Unavailable', keer: 1 });
  const s503 = await B.page.evaluate(async () => {
    const st = await import('./js/store.js'), s = await import('./js/sync.js');
    st.upsert('notities', { id: 'not-503a', titel: 'a' }, { silent: true }); st.upsert('notities', { id: 'not-503b', titel: 'b' }, { silent: true });
    await s.syncNu();
    return s.syncStatus();
  });
  check('503 op een pakket is tijdelijk: één verzoek, alles wacht, niets mislukt erbij', tel.remi.stuur === 1 && s503.modus === 'offline' && s503.wachtend === 2 && s503.mislukt === 1
    && !rijen.has('notities|not-503a'), JSON.stringify({ s503, tel: tel.remi }));
  await syncNu(B.page);
  check('na de storing gaan ze alsnog door', rijen.has('notities|not-503a') && rijen.has('notities|not-503b') && (await status(B.page)).wachtend === 0);

  // Afmelden met een mislukt item: eerst bevestigen; zonder akkoord blijft alles, en ook met akkoord wist niets.
  await instellingen(B.page);
  let vraagMislukt = '';
  const opDialoog = d => { vraagMislukt = d.message(); d.dismiss(); };
  B.page.once('dialog', opDialoog);
  await B.page.click('[data-actie="afmelden"]');
  // Een bevestiging: een dialoog, of een vraag in het paneel (met eerst een reservekopie).
  await wachtTot(async () => vraagMislukt !== '' || await aantal(B.page, '[data-afmeld-vraag]') > 0, 3000);
  if (!vraagMislukt && await aantal(B.page, '[data-afmeld-vraag]')) {
    vraagMislukt = await tekst(B.page, '[data-afmeld-vraag]');
    await B.page.click('[data-afmeld-vraag] button:has-text("Annuleren")');
  }
  B.page.off('dialog', opDialoog);
  await wacht(200);
  const sMislukt = await status(B.page);
  check('afmelden met mislukte items vraagt bevestiging; zonder akkoord blijft alles', vraagMislukt !== '' && sMislukt.open && sMislukt.modus !== 'afgemeld' && sMislukt.mislukt === 1
    && !!(await lokaal(B.page, 'notities', 'not-slecht')) && !!(await opslag(B.page))['fake-sessie'], vraagMislukt);
  await B.page.click('#peekClose').catch(() => {});
  const afB = await B.page.evaluate(async () => (await import('./js/sync.js')).afmelden({ wissen: true }));
  const naAfB = await opslag(B.page);
  check('afmelden met wissen terwijl iets mislukt is: sessie dicht, maar niets gewist', afB.gewist === false && afB.mislukt === 1 && (await status(B.page)).modus === 'afgemeld'
    && !('fake-sessie' in naAfB) && /not-slecht/.test(naAfB['remi-nieuwe-start-v1'] || '') && !!(await lokaal(B.page, 'notities', 'not-slecht')), JSON.stringify(afB));
  await B.page.waitForSelector('.aanmelden', { timeout: 3000 }).catch(() => {});
  check('na afmelden zonder wissen: aanmeldscherm, geen gegevens zichtbaar', await aantal(B.page, '.aanmelden') === 1 && !(await tekst(B.page, 'body')).includes('Bestaande test'));
  await aanmelden(B.page, 'remi@test.be', WW.remi);
  await B.page.waitForSelector('.grid2__table, .chrome__name', { timeout: 5000 }).catch(() => {});
  await wachtTot(async () => (await status(B.page)).modus === 'actief', 5000);
  // Het geweigerde record verbeteren: het gaat alsnog door en is niet meer mislukt.
  await zetRecord(B.page, 'notities', { id: 'not-slecht', slecht: false });
  await syncNu(B.page);
  const sVerbeterd = await status(B.page);
  check('opnieuw aanmelden: alles nog op het toestel; een verbeterd record gaat alsnog door', sVerbeterd.open && sVerbeterd.mislukt === 0 && sVerbeterd.wachtend === 0
    && rijen.get('notities|not-slecht')?.data?.slecht === false, JSON.stringify(sVerbeterd));

  // Bewaren op het toestel lukt niet (opslag vol): het tijdstip van ophalen schuift niet op, de status meldt het.
  await syncNu(B.page);
  const laatstVoor = (await syncToestand(B.page)).laatst;
  await B.page.evaluate(() => {
    const echt = Storage.prototype.setItem;
    globalThis.__echtSetItem = echt;
    Storage.prototype.setItem = function (k, v) { if (k === 'remi-nieuwe-start-v1') throw new DOMException('Vol', 'QuotaExceededError'); return echt.call(this, k, v); };
  });
  await zetRecord(A.page, 'notities', { id: 'not-vol', titel: 'Komt binnen terwijl de opslag vol is' });
  await syncNu(A.page);
  await wachtTot(async () => !!(await lokaal(B.page, 'notities', 'not-vol')), 3000); // via de live verbinding
  const sVol = await syncNu(B.page);
  const laatstVol = (await syncToestand(B.page)).laatst;
  check('opslag vol: het tijdstip schuift niet op en de status meldt het', laatstVol === laatstVoor && sVol.opslagVol === true && sVol.modus === 'fout' && /opslag/.test(sVol.fout)
    && !!(await lokaal(B.page, 'notities', 'not-vol')) && !/not-vol/.test((await opslag(B.page))['remi-nieuwe-start-v1'] || ''), JSON.stringify({ laatstVoor, laatstVol, sVol }));
  await B.page.evaluate(() => { Storage.prototype.setItem = globalThis.__echtSetItem; });
  await syncNu(B.page);
  const sNaVol = await status(B.page);
  check('opslag weer vrij: alles wordt bewaard en het tijdstip schuift op', sNaVol.opslagVol === false && sNaVol.modus === 'actief' && /not-vol/.test((await opslag(B.page))['remi-nieuwe-start-v1'] || '')
    && (await syncToestand(B.page)).laatst !== laatstVoor, JSON.stringify(sNaVol));

  // Een bijlage die blijft falen, houdt de records niet tegen en schuift achteraan.
  bestandStoring.add('test-traag');
  await zetRecord(A.page, 'notities', { id: 'not-tijdens-bijlage', titel: 'Van Giulia terwijl een bijlage faalt' });
  netUit.add('remi'); // Giulia's wijziging komt niet live binnen bij Remi, alleen via het ophalen
  await A.page.evaluate(async () => { await (await import('./js/sync.js')).syncNu(); });
  await wacht(100);
  netUit.delete('remi');
  tel.remi = { stuur: 0, haal: 0, bestand: 0 };
  const sBijlage = await B.page.evaluate(async () => {
    const s = await import('./js/sync.js'), b = await import('./js/bijlagen.js'), store = await import('./js/store.js');
    await s.syncNu(); // wat nog liep, eerst afwerken
    for (const id of ['test-traag', 'test-snel-1', 'test-snel-2']) await b.bewaarBijlage(id, new Blob([id], { type: 'text/plain' }));
    store.upsert('notities', { id: 'not-van-remi-bijlage', titel: 'Van Remi terwijl een bijlage faalt' }, { silent: true });
    await s.syncNu(); await s.bijlagenKlaar();
    return { s: s.syncStatus(), rij: Object.keys(JSON.parse(localStorage.getItem('remi-sync-v2')).bestanden), giulia: !!store.get('notities', 'not-tijdens-bijlage') };
  });
  check('een falende bijlage houdt records niet tegen (versturen en ophalen gebeuren eerst)', rijen.has('notities|not-van-remi-bijlage') && sBijlage.giulia && tel.remi.haal > 0
    && sBijlage.s.open && sBijlage.s.modus === 'actief' && sBijlage.s.wachtend === 3, JSON.stringify(sBijlage));
  check('de falende bijlage schuift achteraan', sBijlage.rij.join() === 'test-snel-1,test-snel-2,test-traag', sBijlage.rij.join());
  await B.page.evaluate(async () => { const s = await import('./js/sync.js'); await s.syncNu(); await s.bijlagenKlaar(); });
  check('de volgende ronde begint met de andere bijlagen', bestanden.has('test-snel-1') && bestanden.has('test-snel-2') && !bestanden.has('test-traag') && (await status(B.page)).wachtend === 1);
  bestandStoring.delete('test-traag');
  await syncNu(B.page);
  check('de trage bijlage gaat door zodra het lukt', bestanden.has('test-traag') && (await status(B.page)).wachtend === 0);

  // Een trage upload (niet falend) houdt de records niet tegen: de bijlagen lopen in een eigen lus. Een volgende
  // ronde verstuurt en haalt meteen op, en nogNietVerstuurd wacht niet op de upload (die telt wel mee als 'wacht').
  await syncNu(B.page);
  let losUpload = () => {};
  bestandPauze.set('test-groot', new Promise(r => { losUpload = r; }));
  const uploadsVoor = tel.remi?.bestand || 0;
  await B.page.evaluate(async () => { const b = await import('./js/bijlagen.js'), s = await import('./js/sync.js'); await b.bewaarBijlage('test-groot', new Blob(['een groot bestand'], { type: 'application/pdf' })); await s.syncNu(); });
  const uploadLoopt = await wachtTot(() => (tel.remi?.bestand || 0) > uploadsVoor, 5000);
  await zetRecord(A.page, 'notities', { id: 'not-giulia-tijdens-upload', titel: 'Van Giulia tijdens de upload van Remi' });
  await A.page.evaluate(async () => { await (await import('./js/sync.js')).syncNu(); });
  const traag = await B.page.evaluate(async () => {
    const st = await import('./js/store.js'), s = await import('./js/sync.js');
    st.upsert('notities', { id: 'not-tijdens-upload', titel: 'Van Remi tijdens een trage upload' }, { silent: true });
    // Met een grens: zou de ronde op de upload wachten, dan blijft ze hangen (tot de upload klaar is).
    const binnen = (p, ms) => Promise.race([p.then(x => ({ x })), new Promise(r => setTimeout(() => r(null), ms))]);
    const t0 = performance.now(); const r1 = await binnen(s.syncNu(), 4000); const tSync = r1 ? performance.now() - t0 : Infinity;
    const t1 = performance.now(); const r2 = await binnen(s.nogNietVerstuurd(), 4000); const tOpen = r2 ? performance.now() - t1 : Infinity;
    return { tSync, tOpen, open: r2?.x || {}, giulia: !!st.get('notities', 'not-giulia-tijdens-upload'), status: s.syncStatus() };
  });
  check('een trage upload houdt de volgende ronde niet tegen: records vertrekken en komen binnen', uploadLoopt && rijen.has('notities|not-tijdens-upload') && traag.giulia
    && !bestanden.has('test-groot') && traag.tSync < 3000 && traag.status.modus === 'actief', JSON.stringify(traag));
  check('nogNietVerstuurd wacht niet op een lopende upload (die telt als wacht)', traag.tOpen < 3000 && traag.open.wacht === 1 && traag.open.mislukt === 0, JSON.stringify(traag.open));
  losUpload(); bestandPauze.delete('test-groot');
  await syncNu(B.page);
  check('de trage upload komt daarna gewoon aan', bestanden.has('test-groot') && (await status(B.page)).wachtend === 0, JSON.stringify(await status(B.page)));

  // ---- Herreview: formulieren met een oude kopie en logboeken van twee toestellen ----
  const sollRij = (page, org) => page.locator('tr', { hasText: org });
  const toastTekst = page => page.textContent('#toast').catch(() => '');
  await zetRecord(A.page, 'sollicitaties', { id: 'sol-form', organisatie: 'Formuliermuseum', functie: 'Atelier', status: 'te doen' });
  await syncNu(A.page); await syncNu(B.page);
  // Giulia opent Bewerken; intussen zet Remi de status op verstuurd (met een logboekregel).
  await A.page.goto(`${base}#/sollicitaties`, { waitUntil: 'networkidle' });
  await sollRij(A.page, 'Formuliermuseum').locator('.grid2__open').click();
  await A.page.click('[data-actie="sollicitatie-bewerken"]');
  await A.page.waitForSelector('.peek form.form textarea', { timeout: 3000 }).catch(() => {});
  await B.page.goto(`${base}#/sollicitaties`, { waitUntil: 'networkidle' });
  await sollRij(B.page, 'Formuliermuseum').locator('select.status--select').selectOption('verstuurd');
  await syncNu(B.page); await syncNu(A.page);
  const ontvangen = await record(A.page, 'sollicitaties', 'sol-form');
  // Giulia past in het (oude) formulier alleen de notities aan en bewaart.
  await A.page.fill('.peek form.form textarea', 'Notitie van Giulia');
  await A.page.click('.peek form.form button[type=submit]');
  await syncNu(A.page); await syncNu(B.page);
  const logVan = (page, id) => page.evaluate(async id => { const st = await import('./js/store.js'); return st.items(st.get('sollicitaties', id), 'logboek').map(l => l.tekst); }, id);
  const formDb = rijen.get('sollicitaties|sol-form')?.data, formA = await record(A.page, 'sollicitaties', 'sol-form'), formB = await record(B.page, 'sollicitaties', 'sol-form');
  const logA = await logVan(A.page, 'sol-form'), logB = await logVan(B.page, 'sol-form');
  check('formulier met een oude kopie: de status en de logboekregel van het andere toestel blijven', ontvangen?.status === 'verstuurd'
    && formDb?.status === 'verstuurd' && formDb.notities === 'Notitie van Giulia' && formA?.status === 'verstuurd' && formB?.status === 'verstuurd' && formB?.notities === 'Notitie van Giulia'
    && logA.includes('Status naar verstuurd') && logB.includes('Status naar verstuurd'), JSON.stringify({ formDb, logA, logB }));
  check('formulier met een oude kopie: alleen de gewijzigde velden kregen een nieuwe stempel', formDb?._t?.notities > formDb?._t?.status && formDb?._t?.organisatie < formDb?._t?.status, JSON.stringify(formDb?._t));
  // Op één toestel: notities typen in het paneel (stil bewaard) en meteen Bewerken; de status wijzigen en bewaren.
  await A.page.click('#peekClose').catch(() => {});
  await A.page.goto(`${base}#/sollicitaties`, { waitUntil: 'networkidle' });
  await sollRij(A.page, 'Formuliermuseum').locator('.grid2__open').click();
  await A.page.fill('[data-fk="sn-sol-form"]', 'Net getypt in het paneel');
  await A.page.click('[data-actie="sollicitatie-bewerken"]');
  await A.page.selectOption('.peek form.form label:has-text("Status") select', 'gesprek');
  await A.page.click('.peek form.form button[type=submit]');
  const eenToestel = await record(A.page, 'sollicitaties', 'sol-form');
  check('één toestel: getypte notities blijven na Bewerken en een andere status', eenToestel?.status === 'gesprek' && eenToestel?.notities === 'Net getypt in het paneel', JSON.stringify(eenToestel));
  // Logboekregels tegelijk op twee toestellen (zonder verbinding): ze blijven allebei.
  await syncNu(A.page); await syncNu(B.page);
  await A.page.click('#peekClose').catch(() => {});
  await A.page.goto(`${base}#/sollicitaties`, { waitUntil: 'networkidle' });
  await B.page.goto(`${base}#/sollicitaties`, { waitUntil: 'networkidle' });
  await sollRij(A.page, 'Formuliermuseum').locator('.grid2__open').click();
  await sollRij(B.page, 'Formuliermuseum').locator('.grid2__open').click();
  netUit.add('giulia'); netUit.add('remi');
  for (const [page, regel] of [[A.page, 'Gebeld door Giulia'], [B.page, 'Mail van Remi beantwoord']]) {
    await page.fill('[data-logboek="sol-form"] input', regel);
    await page.click('[data-logboek="sol-form"] button[type=submit]');
    await page.evaluate(() => document.activeElement?.blur()); // niet meer aan het typen: wat binnenkomt, wordt meteen getoond
  }
  netUit.delete('giulia'); netUit.delete('remi');
  await syncNu(A.page); await syncNu(B.page); await syncNu(A.page);
  await wacht(400);
  const dbLog = (() => { const d = rijen.get('sollicitaties|sol-form')?.data || {}; return Object.entries(d).filter(([k, v]) => k.startsWith('logboek_') && v).map(([, v]) => v.tekst); })();
  const tegelijkA = await logVan(A.page, 'sol-form'), tegelijkB = await logVan(B.page, 'sol-form');
  const zichtbaarA = await tekst(A.page, '.peek .log'), zichtbaarB = await tekst(B.page, '.peek .log');
  check('logboekregels van twee toestellen tegelijk: allebei bewaard (database en beide toestellen)', ['Gebeld door Giulia', 'Mail van Remi beantwoord', 'Status naar verstuurd'].every(t => dbLog.includes(t) && tegelijkA.includes(t) && tegelijkB.includes(t))
    && /Gebeld door Giulia/.test(zichtbaarA) && /Mail van Remi beantwoord/.test(zichtbaarA) && /Gebeld door Giulia/.test(zichtbaarB) && /Mail van Remi beantwoord/.test(zichtbaarB), JSON.stringify({ dbLog, tegelijkA, tegelijkB }));
  // Een bestaand logboek (één veld, uit de seed) blijft getoond; een nieuwe regel komt erachter.
  const seedLog = seedInfo.sol.logboek || [];
  await A.page.click('#peekClose').catch(() => {});
  await zetRecord(A.page, 'sollicitaties', { id: seedInfo.sol.id, ...(await A.page.evaluate(async () => (await import('./js/store.js')).itemErbij('logboek', { datum: '2026-11-16', tekst: 'Nieuwe regel bij een oud logboek' }))) });
  const metOud = await logVan(A.page, seedInfo.sol.id);
  check('een bestaand logboek blijft zichtbaar, nieuwe regels komen erachter', seedLog.length > 0 && seedLog.every((l, i) => metOud[i] === l.tekst) && metOud.at(-1) === 'Nieuwe regel bij een oud logboek', JSON.stringify({ seedLog, metOud }));
  // Bijlagen van twee toestellen tegelijk aan dezelfde mail: allebei bewaard.
  await zetRecord(A.page, 'berichten', { id: 'msg-twee-bijlagen', soort: 'mail', titel: 'Twee bijlagen', onderwerp: 'Twee bijlagen', status: 'concept', eigen: true });
  await syncNu(A.page); await syncNu(B.page);
  netUit.add('giulia'); netUit.add('remi');
  for (const [page, naam] of [[A.page, 'Van Giulia.pdf'], [B.page, 'Van Remi.pdf']]) {
    await page.goto(`${base}#/communicatie/msg-twee-bijlagen`, { waitUntil: 'networkidle' });
    await page.setInputFiles('input[data-bijlage="msg-twee-bijlagen"]', { name: naam, mimeType: 'application/pdf', buffer: PDF });
    await page.waitForFunction(n => document.querySelector('.mail-bijlagen')?.textContent.includes(n), naam, { timeout: 3000 }).catch(() => {});
  }
  netUit.delete('giulia'); netUit.delete('remi');
  await syncNu(A.page); await syncNu(B.page); await syncNu(A.page);
  const bijlA = await A.page.evaluate(async () => { const st = await import('./js/store.js'); return st.items(st.get('berichten', 'msg-twee-bijlagen'), 'bijlagen').map(x => x.naam); });
  const bijlB = await B.page.evaluate(async () => { const st = await import('./js/store.js'); return st.items(st.get('berichten', 'msg-twee-bijlagen'), 'bijlagen').map(x => x.naam); });
  check('bijlagen van twee toestellen tegelijk aan dezelfde mail: allebei bewaard', ['Van Giulia.pdf', 'Van Remi.pdf'].every(n => bijlA.includes(n) && bijlB.includes(n)), JSON.stringify({ bijlA, bijlB }));
  await B.page.goto(`${base}#/communicatie/msg-twee-bijlagen`, { waitUntil: 'networkidle' });
  await B.page.click('.mail-bijlagen button[aria-label="Van Giulia.pdf verwijderen"]');
  await syncNu(B.page); await syncNu(A.page);
  const naWeg = await A.page.evaluate(async () => { const st = await import('./js/store.js'); return st.items(st.get('berichten', 'msg-twee-bijlagen'), 'bijlagen').map(x => x.naam); });
  check('een bijlage verwijderen haalt alleen die ene weg (ook op het andere toestel)', naWeg.join() === 'Van Remi.pdf', naWeg.join());

  // ---- Herreview: 'Terug naar master-cv' mag het cv niet blokkeren ----
  const cvLokaal = page => page.evaluate(async () => { const st = await import('./js/store.js'), cv = await import('./js/cvdata.js'); return { rec: st.lokaalRecord('cvdoc', 'remi'), profiel: cv.getCv().profiel, master: st.ref.cvMaster.profiel }; });
  await A.page.goto(`${base}#/cv?tab=profiel`, { waitUntil: 'networkidle' });
  await A.page.fill('[data-fk="cv-profiel"]', 'Profiel van Remi in de test');
  await wacht(500);
  await A.page.goto(`${base}#/cv?tab=afdrukken`, { waitUntil: 'networkidle' });
  A.page.once('dialog', d => d.accept());
  await A.page.click('button:has-text("Terug naar master-cv")');
  const naReset = await cvLokaal(A.page);
  check('terug naar master-cv: geen grafsteentje, de velden zijn gewist en het master-cv geldt', naReset.rec && !naReset.rec.verwijderd && naReset.rec.profiel === null && naReset.profiel === naReset.master, JSON.stringify({ rec: naReset.rec && { verwijderd: naReset.rec.verwijderd, profiel: naReset.rec.profiel } }));
  await A.page.goto(`${base}#/cv?tab=profiel`, { waitUntil: 'networkidle' });
  await A.page.fill('[data-fk="cv-profiel"]', 'Na de reset opnieuw getypt');
  await wacht(500);
  await syncNu(A.page);
  check('na terug naar master-cv kan het cv gewoon verder bewaard worden (ook in de database)', (await cvLokaal(A.page)).profiel === 'Na de reset opnieuw getypt' && rijen.get('cvdoc|remi')?.verwijderd === false
    && rijen.get('cvdoc|remi')?.data?.profiel === 'Na de reset opnieuw getypt' && !/verwijderd/.test(await toastTekst(A.page)), JSON.stringify(rijen.get('cvdoc|remi')?.data?.profiel));
  // Een grafsteentje van vroeger (een oudere versie van de app): een bewerking laat het cv bewust herleven.
  await A.page.goto(`${base}#/`, { waitUntil: 'networkidle' }); // eerst weg uit het cv (een open veld bewaart bij het verlaten)
  await A.page.evaluate(async () => (await import('./js/store.js')).remove('cvdoc', 'remi'));
  await syncNu(A.page); await syncNu(B.page);
  const grafCv = rijen.get('cvdoc|remi')?.verwijderd === true && (await lokaal(B.page, 'cvdoc', 'remi'))?.verwijderd === true;
  await B.page.goto(`${base}#/cv?tab=profiel`, { waitUntil: 'networkidle' });
  await B.page.fill('[data-fk="cv-profiel"]', 'Herleefd op het toestel van Remi');
  await wacht(500);
  await syncNu(B.page); await syncNu(A.page);
  check('een oud grafsteentje op het cv herleeft bij de volgende bewerking (overal)', grafCv && rijen.get('cvdoc|remi')?.verwijderd === false && (await cvLokaal(A.page)).profiel === 'Herleefd op het toestel van Remi'
    && !/verwijderd/.test(await toastTekst(B.page)), JSON.stringify({ grafCv, db: rijen.get('cvdoc|remi')?.data, toast: await toastTekst(B.page) }));

  // ---- Herreview: 'Opnieuw ophalen uit de database' met wat nog niet in de database staat ----
  await zetRecord(B.page, 'notities', { id: 'not-reset-slecht', titel: 'Geweigerd voor de reset', slecht: true });
  await syncNu(B.page);
  netUit.add('remi');
  await zetRecord(B.page, 'notities', { id: 'not-reset-wacht', titel: 'Wacht nog bij de reset' });
  await instellingen(B.page);
  await B.page.click('[data-actie="opnieuw-ophalen"]');
  const vraagOphalen = await wachtTot(async () => await aantal(B.page, '[data-ophaal-vraag]') > 0, 5000);
  const vraagTekst = await tekst(B.page, '[data-ophaal-vraag]');
  check('opnieuw ophalen met wachtende en geweigerde wijzigingen: eerst een vraag met exporteren', vraagOphalen && /1 wijziging kon niet/.test(vraagTekst) && /1 wijziging wacht/.test(vraagTekst)
    && await aantal(B.page, '[data-actie="ophalen-exporteer"]') === 1, vraagTekst);
  await B.page.click('[data-actie="ophalen-bewaren"]');
  await wacht(200);
  const naOphalen = await B.page.evaluate(async () => { const st = await import('./js/store.js'), s = await import('./js/sync.js'); return { wacht: !!st.lokaalRecord('notities', 'not-reset-wacht'), slecht: !!st.lokaalRecord('notities', 'not-reset-slecht'), andere: !!st.lokaalRecord('notities', 'not-p1'), mislukt: s.mislukteLijst().map(m => m.wat), status: s.syncStatus() }; });
  check('opnieuw ophalen houdt wat nog wacht en wat geweigerd werd (ook de melding)', naOphalen.wacht && naOphalen.slecht && !naOphalen.andere && naOphalen.status.mislukt === 1
    && naOphalen.mislukt.some(w => /Geweigerd voor de reset/.test(w)), JSON.stringify(naOphalen));
  netUit.delete('remi');
  await syncNu(B.page);
  check('daarna: de wachtende wijziging gaat alsnog naar de database en de rest komt terug', rijen.get('notities|not-reset-wacht')?.data?.titel === 'Wacht nog bij de reset'
    && !!(await lokaal(B.page, 'notities', 'not-p1')) && (await status(B.page)).mislukt === 1, JSON.stringify(await status(B.page)));
  // Uitdrukkelijk ook wissen: alleen na een tweede bevestiging.
  netUit.add('remi');
  await zetRecord(B.page, 'notities', { id: 'not-reset-weg', titel: 'Bewust gewist' });
  await B.page.click('#peekClose').catch(() => {});
  await instellingen(B.page);
  await B.page.click('[data-actie="opnieuw-ophalen"]');
  await wachtTot(async () => await aantal(B.page, '[data-ophaal-vraag]') > 0, 5000);
  let tweedeVraag = '';
  B.page.once('dialog', d => { tweedeVraag = d.message(); d.accept(); });
  await B.page.click('[data-actie="ophalen-alles-wissen"]');
  await wacht(200);
  netUit.delete('remi');
  await syncNu(B.page);
  check('alles wissen na een tweede bevestiging: ook wat niet verstuurd was, is weg', /niet ongedaan/.test(tweedeVraag) && !(await lokaal(B.page, 'notities', 'not-reset-weg')) && !rijen.has('notities|not-reset-weg')
    && !(await lokaal(B.page, 'notities', 'not-reset-slecht')) && (await status(B.page)).mislukt === 0, tweedeVraag);
  await B.page.click('#peekClose').catch(() => {});

  // ---- Herreview: versturen via de server (Gmail nagebootst in de pagina) ----
  await A.page.evaluate(() => {
    const B = globalThis.__nieuweStartBackend;
    globalThis.__gmail = { verzonden: new Map(), sleutels: [], modus: 'normaal' };
    B.mailKlaarzetten = async () => 'uitgaand/test.eml';
    const oud = B.gmail;
    B.gmail = async (actie, extra = {}) => {
      if (actie === 'status') return { ingesteld: true, gekoppeld: true, email: 'remi.test@gmail.com' };
      if (actie !== 'verstuur') return oud(actie, extra);
      const g = globalThis.__gmail, k = extra.sleutel;
      g.sleutels.push(k);
      const al = g.verzonden.get(k);
      if (al) throw Object.assign(new Error('Deze mail is al verstuurd of wordt nu verstuurd.'), { status: 409, dubbel: true, gmailId: al.id, verzendStatus: al.status });
      if (g.modus === 'onzeker') { g.verzonden.set(k, { status: 'bezig', id: null }); throw Object.assign(new Error('Gmail antwoordde niet.'), { status: 502, onzeker: true }); }
      g.verzonden.set(k, { status: 'verstuurd', id: 'g-' + k });
      return { id: 'g-' + k, threadId: 't', van: 'remi.test@gmail.com' };
    };
  });
  const gmail = () => A.page.evaluate(() => ({ sleutels: globalThis.__gmail.sleutels.slice(), verzonden: Object.fromEntries(globalThis.__gmail.verzonden) }));
  const zetGmail = (k, v) => A.page.evaluate(([k, v]) => { if (k === 'modus') globalThis.__gmail.modus = v; else globalThis.__gmail.verzonden.set(k, v); }, [k, v]);
  const nieuweTestMail = id => zetRecord(A.page, 'berichten', { id, soort: 'mail', titel: id, onderwerp: 'Test ' + id, naar: 'werkgever@voorbeeld.be', tekst: 'Beste,\n\nTest.\n\nRemi', status: 'concept', eigen: true });
  // Op Verstuur nu klikken en wachten tot de (nagebootste) server het verzoek kreeg en de app het antwoord verwerkte.
  const klikVerstuur = async () => {
    const n = (await gmail()).sleutels.length;
    await A.page.click('[data-actie="verstuur-nu"]');
    await wachtTot(async () => (await gmail()).sleutels.length > n, 3000);
    await wacht(250);
  };
  const versturen = async id => {
    await A.page.goto(`${base}#/communicatie/${id}`, { waitUntil: 'networkidle' });
    await A.page.click('[data-actie="gmail"]');
    await A.page.waitForSelector('[data-actie="verstuur-nu"]', { timeout: 3000 }).catch(() => {});
    await klikVerstuur();
  };
  const dialogen = [];
  const opDialoogGmail = d => { dialogen.push(d.message()); d.accept(); };
  A.page.on('dialog', opDialoogGmail);
  // Terug naar concept, verbeteren en opnieuw versturen: een nieuwe poging, de verbeterde mail vertrekt echt.
  await nieuweTestMail('mail-gmail-a');
  await versturen('mail-gmail-a');
  const eerste = await record(A.page, 'berichten', 'mail-gmail-a');
  await A.page.goto(`${base}#/communicatie/mail-gmail-a`, { waitUntil: 'networkidle' });
  await A.page.click('[data-actie="terug-naar-concept"]');
  const concept = await record(A.page, 'berichten', 'mail-gmail-a');
  await versturen('mail-gmail-a');
  const tweede = await record(A.page, 'berichten', 'mail-gmail-a');
  check('Terug naar concept verhoogt de poging; de verbeterde mail vertrekt met een nieuwe sleutel', eerste?.status === 'verstuurd' && eerste.gmailId === 'g-mail-gmail-a:1'
    && concept?.status === 'concept' && concept.verzendPoging === 2 && tweede?.status === 'verstuurd' && tweede.gmailId === 'g-mail-gmail-a:2'
    && (await gmail()).sleutels.join() === 'mail-gmail-a:1,mail-gmail-a:2', JSON.stringify({ eerste, concept, tweede, g: await gmail() }));
  await A.page.click('#peekClose').catch(() => {});
  // Een concept met een gmailId (van vroeger): versturen vraagt bevestiging en gebruikt een nieuwe poging.
  await zetRecord(A.page, 'berichten', { id: 'mail-gmail-a', status: 'concept', gmailId: 'g-oud' });
  dialogen.length = 0;
  await versturen('mail-gmail-a');
  check('een concept met een gmailId van vroeger: bevestigen en een nieuwe poging', dialogen.some(t => /al verstuurd/.test(t)) && (await gmail()).sleutels.at(-1) === 'mail-gmail-a:3'
    && (await record(A.page, 'berichten', 'mail-gmail-a'))?.gmailId === 'g-mail-gmail-a:3', JSON.stringify({ dialogen, g: (await gmail()).sleutels }));
  await A.page.click('#peekClose').catch(() => {});
  // Onzeker, dan opnieuw proberen: de server zegt 'bezig' (niet bevestigd). Geen 'verstuurd', de twijfel blijft,
  // en geen bevestiging in het contactlog.
  const contactVoor = (await A.page.evaluate(async () => (await import('./js/store.js')).all('communicatie').length));
  await nieuweTestMail('mail-gmail-b');
  await zetGmail('modus', 'onzeker');
  await versturen('mail-gmail-b');
  const naOnzeker = await record(A.page, 'berichten', 'mail-gmail-b');
  await zetGmail('modus', 'normaal');
  await klikVerstuur();
  const naBezig = await record(A.page, 'berichten', 'mail-gmail-b');
  const meldingBezig = await tekst(A.page, '.peek [role=alert]');
  const contactNaBezig = await A.page.evaluate(async () => (await import('./js/store.js')).all('communicatie').filter(c => /bevestigde/.test(c.samenvatting || '')).length);
  check('dubbel met status bezig: niet op verstuurd, de twijfel blijft, geen bevestiging in het contactlog', !!naOnzeker?.twijfelOp && naBezig?.status !== 'verstuurd' && !!naBezig?.twijfelOp
    && contactNaBezig === 0 && /bevestigde niet/.test(meldingBezig) && /Toch opnieuw versturen/.test(await tekst(A.page, '[data-actie="verstuur-nu"]')), JSON.stringify({ naBezig, meldingBezig }));
  // De server bevestigt later dat dezelfde sleutel vertrok: opnieuw proberen zet de mail op verstuurd, met de bevestiging.
  await zetGmail('mail-gmail-b:1', { status: 'verstuurd', id: 'g-later-bevestigd' });
  await A.page.click('#peekClose').catch(() => {});
  await versturen('mail-gmail-b');
  const naBevestigd = await record(A.page, 'berichten', 'mail-gmail-b');
  const contactNa = await A.page.evaluate(async () => (await import('./js/store.js')).all('communicatie').filter(c => /bevestigde/.test(c.samenvatting || '')).length);
  check('dubbel met status verstuurd na twijfel: verstuurd, met bevestiging in het contactlog', naBevestigd?.status === 'verstuurd' && naBevestigd.gmailId === 'g-later-bevestigd' && !naBevestigd.twijfelOp
    && contactNa === 1 && (await gmail()).sleutels.filter(k => k.startsWith('mail-gmail-b')).every(k => k === 'mail-gmail-b:1'), JSON.stringify({ naBevestigd, contactVoor, contactNa }));
  await A.page.click('#peekClose').catch(() => {});
  // Een concept waarvan de sleutel al gekend is (bijvoorbeeld een oude 'Terug naar concept'): het concept blijft een
  // concept; alleen een bewuste nieuwe verzending (nieuwe sleutel) verstuurt het.
  await nieuweTestMail('mail-gmail-c');
  await zetGmail('mail-gmail-c:1', { status: 'verstuurd', id: 'g-eerdere-versie' });
  await versturen('mail-gmail-c');
  const naDubbelConcept = await record(A.page, 'berichten', 'mail-gmail-c');
  dialogen.length = 0;
  await klikVerstuur();
  const naNieuw = await record(A.page, 'berichten', 'mail-gmail-c');
  check('dubbel op een concept: het blijft een concept, daarna bewust een nieuwe poging', naDubbelConcept?.status === 'concept' && !naDubbelConcept.gmailId
    && dialogen.some(t => /kent deze verzending al/.test(t)) && naNieuw?.status === 'verstuurd' && naNieuw.gmailId === 'g-mail-gmail-c:2', JSON.stringify({ naDubbelConcept, naNieuw, dialogen }));
  A.page.off('dialog', opDialoogGmail);
  await A.page.click('#peekClose').catch(() => {});
  await syncNu(A.page); await syncNu(B.page);

  // Twee tabbladen op hetzelfde toestel: ze volgen elkaar, en maar één synchroniseert tegelijk.
  const B2 = await tabblad(B);
  await B2.goto(`${base}#/communicatie`, { waitUntil: 'networkidle' });
  await B2.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  await zetRecord(B2, 'notities', { id: 'not-tab2', titel: 'Uit het tweede tabblad' });
  const tab1Ziet = await wachtTot(async () => (await record(B.page, 'notities', 'not-tab2'))?.titel === 'Uit het tweede tabblad', 3000);
  check('tabblad 1 ziet een wijziging uit tabblad 2 meteen (zonder database)', tab1Ziet);
  await zetRecord(B.page, 'notities', { id: 'not-tabs', titel: 'Begin', a: '', b: '' });
  await wachtTot(async () => !!(await lokaal(B2, 'notities', 'not-tabs')), 3000);
  // Tegelijk in beide tabbladen een ander veld: niets gaat verloren.
  await Promise.all([zetRecord(B.page, 'notities', { id: 'not-tabs', a: 'uit tabblad 1' }), zetRecord(B2, 'notities', { id: 'not-tabs', b: 'uit tabblad 2' })]);
  await wachtTot(async () => { const x = await lokaal(B.page, 'notities', 'not-tabs'), y = await lokaal(B2, 'notities', 'not-tabs'); return x?.a && x?.b && y?.a && y?.b; }, 3000);
  const opgeslagen = JSON.parse((await opslag(B.page))['remi-nieuwe-start-v1']).notities.find(x => x.id === 'not-tabs');
  check('tegelijk in twee tabbladen: beide velden bewaard', opgeslagen?.a === 'uit tabblad 1' && opgeslagen?.b === 'uit tabblad 2', JSON.stringify(opgeslagen));
  // Slot: terwijl tabblad 1 ophaalt, wacht tabblad 2.
  await wacht(1500);
  inVlucht.remi = { nu: 0, max: 0 };
  pauzeer('remi');
  const ronde1 = B.page.evaluate(async () => (await import('./js/sync.js')).syncNu());
  await wachtTot(() => inVlucht.remi.nu === 1, 3000);
  const ronde2 = B2.evaluate(async () => (await import('./js/sync.js')).syncNu());
  await wacht(500);
  const gelijktijdig = inVlucht.remi.max;
  pauze.los(); pauze = null;
  await Promise.all([ronde1, ronde2]);
  check('met twee tabbladen synchroniseert er maar één tegelijk', gelijktijdig === 1 && inVlucht.remi.max === 1, JSON.stringify(inVlucht.remi));
  await syncNu(B2);
  check('wijzigingen uit beide tabbladen in de database', rijen.get('notities|not-tabs')?.data?.a === 'uit tabblad 1' && rijen.get('notities|not-tabs')?.data?.b === 'uit tabblad 2' && rijen.has('notities|not-tab2'));
  await B2.close();
  toestellen.splice(toestellen.findIndex(t => t.page === B2), 1);

  // Iemand met een account maar zonder toegang: een code inwisselen zonder wachtwoord (koppelen).
  const C = await toestel('vreemde');
  await C.page.goto(base, { waitUntil: 'networkidle' });
  await aanmelden(C.page, 'iemand@test.be', WW.iemand);
  await wachtTot(async () => /Nog geen toegang/.test(await tekst(C.page, '.aanmelden')), 3000);
  check('adres zonder toegang ziet niets', /geen toegang/.test(await tekst(C.page, '.aanmelden')) && (await status(C.page)).modus === 'geen-toegang' && !(await tekst(C.page, 'body')).includes('Bestaande test'));
  const koppel = code => C.page.evaluate(async code => { try { await (await import('./js/sync.js')).koppelCode(code); return { ok: true }; } catch (e) { return { fout: e.message }; } }, code);
  const k1 = await koppel(codeRemi);
  check('een gebruikte code werkt geen tweede keer (koppelen)', /al gebruikt/.test(k1.fout || '') && !toegang['iemand@test.be'] && accounts.get('iemand@test.be') === WW.iemand, JSON.stringify(k1));
  const codeAnder = (await codeVoor(A.page, 'giulia', 'ander@test.be'))?.code;
  const k2 = await koppel(codeAnder);
  check('een code voor een ander adres werkt niet (koppelen)', /hoort niet bij/.test(k2.fout || '') && !toegang['iemand@test.be'] && codes.get(schoneCode(codeAnder))?.gebruikt === false, JSON.stringify(k2));
  const codeOud = (await codeVoor(A.page, 'giulia', 'iemand@test.be'))?.code;
  const codeIemand = (await codeVoor(A.page, 'giulia', 'iemand@test.be'))?.code;
  const k3 = await koppel(codeOud);
  check('een nieuwe code voor hetzelfde adres maakt de oudere ongeldig', /verlopen/.test(k3.fout || '') && !toegang['iemand@test.be'], JSON.stringify(k3));
  // Het juiste: via het koppelformulier op het scherm 'Nog geen toegang' (zonder wachtwoord).
  let k4;
  if (await aantal(C.page, '[data-fk="koppel-code"]')) {
    check('het scherm Nog geen toegang vraagt alleen de code, geen wachtwoord', await aantal(C.page, '.aanmelden input[type=password]') === 0);
    await C.page.fill('[data-fk="koppel-code"]', codeIemand);
    await C.page.click('[data-koppel] button[type=submit]');
    k4 = { ok: await wachtTot(() => toegang['iemand@test.be'] === 'giulia', 5000) };
  } else k4 = await koppel(codeIemand);
  await C.page.waitForSelector('.grid2__table, .chrome__name', { timeout: 5000 }).catch(() => {});
  const okC = await wachtTot(async () => { const s = await status(C.page); return s.open && s.modus === 'actief'; }, 5000);
  check('koppelen met de juiste code: toegang zonder nieuw wachtwoord, daarna de app', k4.ok && toegang['iemand@test.be'] === 'giulia' && accounts.get('iemand@test.be') === WW.iemand && okC, JSON.stringify({ k4, s: await status(C.page) }));

  // Afmelden op een tussenscherm (nog nooit volledig gesynchroniseerd) laat de gegevens op het toestel staan.
  const E = await toestel('giulia-tweede', { bestaand: BESTAAND2 });
  await E.page.goto(base, { waitUntil: 'networkidle' });
  await E.page.waitForSelector('[data-fk="aanmeld-ww"]', { timeout: 5000 }).catch(() => {});
  await E.page.evaluate(async () => { const b = await import('./js/bijlagen.js'); await b.bewaarBijlage('foto-tweede-toestel', new Blob(['foto'], { type: 'image/jpeg' })); });
  stuurFout.set('giulia-tweede', { status: 503, message: 'Service Unavailable', keer: 1000 });
  haalFout.set('giulia-tweede', 503);
  await aanmelden(E.page, 'giulia@test.be', WW.giulia);
  const tussen = await wachtTot(async () => /Nog geen gegevens op dit toestel|Nog niet alles in de database/.test(await tekst(E.page, '.aanmelden')), 5000);
  E.page.on('dialog', d => d.accept());
  const knopTussen = await aantal(E.page, '[data-actie="afmelden-zonder-wissen"]') ? '[data-actie="afmelden-zonder-wissen"]' : '.aanmelden button:has-text("Afmelden")';
  await E.page.click(knopTussen).catch(() => {});
  await wachtTot(async () => (await status(E.page)).modus === 'afgemeld', 3000);
  const naTussen = await E.page.evaluate(async () => { const b = await import('./js/bijlagen.js'); const f = await b.leesBijlage('foto-tweede-toestel'); return { ls: { ...localStorage }, foto: f ? f.size : -1 }; });
  check('afmelden op een tussenscherm laat de lokale gegevens en bijlagen staan', tussen && (await status(E.page)).modus === 'afgemeld' && !('fake-sessie' in naTussen.ls)
    && /Alleen op het tweede toestel/.test(naTussen.ls['remi-nieuwe-start-v1'] || '') && naTussen.foto === 4 && !rijen.has('notities|not-tweede-toestel'), JSON.stringify({ tussen, foto: naTussen.foto, sleutels: Object.keys(naTussen.ls) }));
  stuurFout.delete('giulia-tweede'); haalFout.delete('giulia-tweede');
  await aanmelden(E.page, 'giulia@test.be', WW.giulia);
  await wachtTot(async () => (await status(E.page)).modus === 'actief', 8000);
  await syncNu(E.page);
  check('opnieuw aanmelden: de gegevens van dat toestel komen alsnog in de database', rijen.get('notities|not-tweede-toestel')?.data?.titel === 'Alleen op het tweede toestel' && bestanden.has('foto-tweede-toestel'));

  // Afmelden in Instellingen met een wijziging die nog niet verstuurd is: eerst bevestigen; ook met akkoord blijft
  // de wijziging op het toestel en gaat ze na een nieuwe aanmelding alsnog door.
  await A.page.goto(`${base}#/communicatie/msg-bestaand-test`, { waitUntil: 'networkidle' });
  await syncNu(A.page);
  netUit.add('giulia');
  await A.page.fill('[data-fk="msg-msg-bestaand-test-onderwerp"]', 'Niet verstuurd voor afmelden');
  await A.page.click('text=← Alle e-mails');
  await wacht(300);
  await instellingen(A.page);
  let vraag1 = '';
  A.page.once('dialog', d => { vraag1 = d.message(); d.dismiss(); });
  await A.page.click('[data-actie="afmelden"]');
  await wachtTot(() => vraag1 !== '', 3000);
  await wacht(200);
  const sA = await status(A.page);
  check('afmelden met niet verstuurde wijzigingen vraagt eerst bevestiging', vraag1 !== '' && sA.open && sA.wachtend >= 1
    && (await record(A.page, 'berichten', 'msg-bestaand-test'))?.onderwerp === 'Niet verstuurd voor afmelden', vraag1);
  A.page.once('dialog', d => d.accept());
  await A.page.click('[data-actie="afmelden"]');
  await A.page.waitForSelector('.aanmelden', { timeout: 5000 }).catch(() => {});
  await wacht(300);
  const na = await A.page.evaluate(async () => ({ dbs: (await indexedDB.databases()).map(d => d.name), ls: { ...localStorage } }));
  check('ook met akkoord wist afmelden niets wat nog niet in de database staat', na.dbs.includes('remi-bijlagen') && /Niet verstuurd voor afmelden/.test(na.ls['remi-nieuwe-start-v1'] || '')
    && !('fake-sessie' in na.ls) && await aantal(A.page, '.aanmelden') === 1 && !(await tekst(A.page, 'body')).includes('Bestaande test'), JSON.stringify({ dbs: na.dbs, sleutels: Object.keys(na.ls) }));
  check('de niet verstuurde wijziging is (nog) niet in de database', rijen.get('berichten|msg-bestaand-test').data.onderwerp === 'Offline aangepast');
  netUit.delete('giulia');
  await aanmelden(A.page, 'giulia@test.be', WW.giulia);
  await A.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  await syncNu(A.page);
  check('opnieuw aanmelden: de wijziging gaat alsnog naar de database', rijen.get('berichten|msg-bestaand-test').data.onderwerp === 'Niet verstuurd voor afmelden' && (await status(A.page)).wachtend === 0);

  // Afmelden met wissen als alles in de database staat: de gegevens en bijlagen gaan van het toestel.
  const voorWis = await A.page.evaluate(async () => (await indexedDB.databases()).map(d => d.name));
  const afA = await A.page.evaluate(async () => { const s = await import('./js/sync.js'); const open = await s.nogNietVerstuurd(); const r = await s.afmelden({ wissen: true }); return { open, r }; });
  await wacht(300);
  const naWis = await A.page.evaluate(async () => ({ dbs: (await indexedDB.databases()).map(d => d.name), ls: { ...localStorage }, sync: JSON.parse(localStorage.getItem('remi-sync-v2') || '{}') }));
  check('nogNietVerstuurd geeft wacht, mislukt en totaal', afA.open.wacht === 0 && afA.open.mislukt === 0 && afA.open.totaal === 0, JSON.stringify(afA.open));
  check('afmelden met wissen als alles veilig is: gegevens en bijlagen van het toestel weg', afA.r.gewist === true && voorWis.includes('remi-bijlagen') && !naWis.dbs.includes('remi-bijlagen')
    && !/Bestaande test|Volmacht|Niet verstuurd|vriendelijke groeten|msg-bestaand-test/.test(JSON.stringify(naWis.ls)) && !('fake-sessie' in naWis.ls)
    && naWis.sync.email === '' && Object.keys(naWis.sync.gestuurd || {}).length === 0, JSON.stringify({ dbs: naWis.dbs, sleutels: Object.keys(naWis.ls) }));
  await A.page.waitForSelector('.aanmelden', { timeout: 3000 }).catch(() => {});
  check('na afmelden: aanmeldscherm, geen gegevens meer in de app', await aantal(A.page, '.aanmelden') === 1 && (await status(A.page)).modus === 'afgemeld'
    && !(await tekst(A.page, 'body')).includes('Bestaande test') && (await record(A.page, 'berichten', 'msg-bestaand-test')) === null);
  // Opnieuw aanmelden: alles komt terug uit de database, ook de bijlage.
  await aanmelden(A.page, 'giulia@test.be', WW.giulia);
  await A.page.waitForSelector('.grid2__table', { timeout: 5000 }).catch(() => {});
  const terug = await record(A.page, 'berichten', 'msg-bestaand-test');
  const grootteA = await A.page.evaluate(async id => { const b = await import('./js/bijlagen.js'); const blob = await b.leesBijlage(id); return blob ? blob.size : -1; }, bijlageId);
  check('opnieuw aanmelden: de gegevens en de bijlage komen terug uit de database', /Bestaande test/.test(await tekst(A.page, '.grid2__table')) && terug?.onderwerp === 'Niet verstuurd voor afmelden' && grootteA === PDF.length, `${terug?.onderwerp} ${grootteA}`);

  // Afmelden zonder wachtende wijzigingen via Instellingen
  await instellingen(B.page);
  let vraagB = '';
  B.page.once('dialog', d => { vraagB = d.message(); d.accept(); });
  await B.page.click('[data-actie="afmelden"]');
  await B.page.waitForSelector('.aanmelden', { timeout: 5000 }).catch(() => {});
  check('afmelden zonder wachtende wijzigingen: een vraag, dan het aanmeldscherm', vraagB !== '' && await aantal(B.page, '.aanmelden') === 1 && !(await tekst(B.page, 'body')).includes('Bestaande test'), vraagB);

  // backend.js zelf, met een nagebootste Supabase-client: soorten fouten, koppelen, codes en afmelden zonder verbinding.
  const be = await A.page.evaluate(async () => {
    const { maakBackend, soortFout } = await import('./js/backend.js');
    const verzoeken = [];
    let stuurAntw = { error: null, status: 201 }, signOut = { error: null }, invoke = { data: { ok: true }, error: null };
    const sb = {
      from: () => ({ upsert: async () => stuurAntw }),
      auth: { signOut: async () => signOut },
      functions: { invoke: async (naam, { body }) => { verzoeken.push({ naam, body }); return invoke; } },
    };
    const b = maakBackend(sb);
    const soortVan = async antw => { stuurAntw = antw; try { await b.stuur([{ id: 'x' }]); return 'ok'; } catch (e) { return `${e.soort}/${e.offline}`; } };
    const uit = {
      s503: await soortVan({ error: { message: 'Service Unavailable' }, status: 503 }),
      s0: await soortVan({ error: { message: 'TypeError: Failed to fetch', code: '' }, status: 0 }),
      s429: await soortVan({ error: { message: 'Too many' }, status: 429 }),
      pgrst: await soortVan({ error: { message: 'Could not connect', code: 'PGRST001' }, status: 503 }),
      s400: await soortVan({ error: { message: 'unsupported Unicode escape sequence', code: '22P05' }, status: 400 }),
      s403: await soortVan({ error: { message: 'new row violates row-level security policy', code: '42501' }, status: 403 }),
      s404: await soortVan({ error: { message: 'relation does not exist', code: '42P01' }, status: 404 }),
      opslag: soortFout({ message: 'Payload too large', statusCode: '413', status: 413 }),
    };
    await b.koppel('ABCDE-FGH23');
    await b.codeMaken('remi', 'remi@test.be');
    uit.verzoeken = verzoeken;
    invoke = { data: null, error: { name: 'FunctionsHttpError', message: 'Edge Function returned a non-2xx status code', context: { status: 409, json: async () => ({ message: 'Deze mail is al verstuurd of wordt nu verstuurd.', dubbel: true, gmailId: 'g1' }) } } };
    try { await b.gmail('verstuur', { pad: 'uitgaand/x.eml', sleutel: 'mail-1:1' }); } catch (e) { uit.dubbel = { status: e.status, dubbel: e.dubbel, gmailId: e.gmailId, message: e.message }; }
    uit.gmailBody = verzoeken.at(-1)?.body;
    localStorage.setItem('remi-aanmelding', '{"test":1}');
    signOut = { error: { message: 'Failed to fetch' } };
    uit.afmeldenZonderNet = { gelukt: await b.afmelden(), sessieWeg: localStorage.getItem('remi-aanmelding') === null };
    localStorage.setItem('remi-aanmelding', '{"test":1}');
    signOut = { error: null };
    uit.afmeldenMetNet = { gelukt: await b.afmelden(), sessieBlijft: localStorage.getItem('remi-aanmelding') !== null };
    localStorage.removeItem('remi-aanmelding');
    return uit;
  });
  check('backend: 5xx, 0, 429 en PGRST00x zijn tijdelijk', be.s503 === 'tijdelijk/true' && be.s0 === 'tijdelijk/true' && be.s429 === 'tijdelijk/true' && be.pgrst === 'tijdelijk/true', JSON.stringify(be));
  check('backend: 400 is ongeldig, 403 toegang, 404 een andere fout', be.s400 === 'ongeldig/false' && be.s403 === 'toegang/false' && be.s404 === 'fout/false' && be.opslag === 'ongeldig', JSON.stringify(be));
  check('backend: koppel en code sturen de juiste actie', vast(be.verzoeken[0]) === vast({ naam: 'account', body: { actie: 'koppel', code: 'ABCDE-FGH23' } })
    && vast(be.verzoeken[1]) === vast({ naam: 'account', body: { actie: 'code', wie: 'remi', email: 'remi@test.be' } }), JSON.stringify(be.verzoeken));
  check('backend: een dubbele verzending geeft status 409 en de velden van het antwoord', be.dubbel?.status === 409 && be.dubbel?.dubbel === true && be.dubbel?.gmailId === 'g1' && /al verstuurd/.test(be.dubbel?.message)
    && vast(be.gmailBody) === vast({ actie: 'verstuur', pad: 'uitgaand/x.eml', sleutel: 'mail-1:1' }), JSON.stringify(be.dubbel));
  check('backend: afmelden zonder verbinding haalt de sessie toch van het toestel', be.afmeldenZonderNet.gelukt === false && be.afmeldenZonderNet.sessieWeg && be.afmeldenMetNet.gelukt === true && be.afmeldenMetNet.sessieBlijft, JSON.stringify([be.afmeldenZonderNet, be.afmeldenMetNet]));

  for (const t of [A, B, C, E]) check(`${t.label}: geen consolefouten`, t.fout.length === 0, t.fout.slice(0, 3).join(' | '));
} catch (e) {
  fouten.push('script: ' + (e.stack || e.message));
} finally {
  if (browser) await browser.close();
  server.kill();
}
console.log(`Geslaagd: ${geslaagd.length}`);
if (fouten.length) { console.log(`Mislukt: ${fouten.length}`); fouten.forEach(f => console.log(' - ' + f)); process.exitCode = 1; } else console.log('Alles in orde.');
