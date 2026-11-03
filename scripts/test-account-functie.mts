// Test van de serverfunctie 'account' (supabase/functions/account/handler.ts) met een nagebootste admin-client.
// Gebruik: node --experimental-strip-types scripts/test-account-functie.mts
// Alleen verzonnen adressen, wachtwoorden en codes; er gaat niets naar de echte database.
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { maakHandler, schoneCode, sha256 } from '../supabase/functions/account/handler.ts';
import type { Admin } from '../supabase/functions/account/handler.ts';

type Rij = Record<string, any>;
type Fout = { message: string } | null;

const fouten: string[] = []; const geslaagd: string[] = [];
const check = (naam: string, ok: unknown, detail: unknown = '') => (ok ? geslaagd : fouten).push(`${naam}${detail ? ': ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
const hash = (t: string) => createHash('sha256').update(t).digest('hex'); // los van de functie berekend
const NU = Date.parse('2026-11-03T10:00:00.000Z');
const DAG = 864e5;
const ALFABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // zonder 0/O en 1/I
const FORMAAT = /^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/;
const WW = 'proefwachtwoord-123';

// ---- Nagebootste admin-client: tabellen toegang en account_code en de accounts, alles in geheugen ----
function nepAdmin() {
  const tabellen: Record<string, Rij[]> = { toegang: [], account_code: [] };
  const SLEUTEL: Record<string, string> = { toegang: 'email', account_code: 'code_hash' };
  const gebruikers: { id: string; email?: string; password?: string }[] = [];
  const sessies = new Map<string, string>(); // jwt -> e-mailadres
  const oproepen = { getUser: [] as string[], listUsers: [] as Rij[], createUser: [] as Rij[], updateUserById: [] as [string, Rij][] };
  const storing: Record<string, Fout> = {}; // nagebootste fouten, bv. storing['toegang.upsert'] of storing.createUser
  let volgnr = 0;

  function from(t: string) {
    const rijen = tabellen[t];
    if (!rijen) throw new Error(`Onbekende tabel ${t}`);
    const filters: [string, unknown][] = [];
    let soort = 'select'; let waarde: Rij = {}; let kolommen = '*';
    const past = (r: Rij) => filters.every(([k, v]) => r[k] === v);
    const kies = (r: Rij) => kolommen === '*' ? { ...r } : Object.fromEntries(kolommen.split(',').map(k => k.trim()).map(k => [k, r[k] ?? null]));
    const geldig = (w: Rij) => !('wie' in w) || ['remi', 'giulia'].includes(w.wie); // check-constraint uit schema.sql
    function voerUit(): { data: Rij[] | null; error: Fout } {
      const s = storing[`${t}.${soort}`];
      if (s) return { data: null, error: s };
      const k = SLEUTEL[t];
      if (soort === 'select') return { data: rijen.filter(past).map(kies), error: null };
      if (!geldig(waarde)) return { data: null, error: { message: 'violates check constraint' } };
      if (soort === 'insert') {
        if (rijen.some(r => r[k] === waarde[k])) return { data: null, error: { message: 'duplicate key value violates unique constraint' } };
        rijen.push({ ...waarde });
      } else if (soort === 'upsert') {
        const r = rijen.find(x => x[k] === waarde[k]);
        if (r) Object.assign(r, waarde); else rijen.push({ ...waarde });
      } else if (soort === 'update') rijen.filter(past).forEach(r => Object.assign(r, waarde));
      return { data: null, error: null };
    }
    // Zoals de query-builder van supabase-js: ketenen, en 'await' voert uit.
    const q = {
      select(k = '*') { kolommen = k; return q; },
      eq(k: string, v: unknown) { filters.push([k, v]); return q; },
      insert(w: Rij) { soort = 'insert'; waarde = w; return q; },
      upsert(w: Rij) { soort = 'upsert'; waarde = w; return q; },
      update(w: Rij) { soort = 'update'; waarde = w; return q; },
      async maybeSingle() {
        const r = voerUit();
        if (r.error || !r.data) return { data: null, error: r.error };
        if (r.data.length > 1) return { data: null, error: { message: 'JSON object requested, multiple rows returned' } };
        return { data: r.data[0] || null, error: null };
      },
      then(ok: (v: unknown) => unknown, nok?: (e: unknown) => unknown) { return Promise.resolve().then(voerUit).then(ok, nok); },
    };
    return q;
  }

  const auth = {
    async getUser(jwt: string) {
      oproepen.getUser.push(jwt);
      if (storing.getUser) throw new Error(storing.getUser.message);
      const email = sessies.get(jwt);
      return email ? { data: { user: { email } }, error: null } : { data: { user: null }, error: { message: 'invalid JWT' } };
    },
    admin: {
      async listUsers(o: { page: number; perPage: number }) {
        oproepen.listUsers.push(o);
        if (storing.listUsers) return { data: { users: [] }, error: storing.listUsers };
        return { data: { users: gebruikers.slice((o.page - 1) * o.perPage, o.page * o.perPage).map(({ id, email }) => ({ id, email })) }, error: null };
      },
      async createUser(o: Rij) {
        oproepen.createUser.push(o);
        if (storing.createUser) return { data: null, error: storing.createUser };
        if (gebruikers.some(u => (u.email || '').toLowerCase() === String(o.email).toLowerCase())) return { data: null, error: { message: 'A user with this email address has already been registered' } };
        const u = { id: `u-${++volgnr}`, email: String(o.email), password: String(o.password) };
        gebruikers.push(u);
        return { data: { user: { id: u.id, email: u.email } }, error: null };
      },
      async updateUserById(id: string, o: Rij) {
        oproepen.updateUserById.push([id, o]);
        if (storing.updateUserById) return { data: null, error: storing.updateUserById };
        const u = gebruikers.find(x => x.id === id);
        if (!u) return { data: null, error: { message: 'User not found' } };
        if (o.password) u.password = String(o.password);
        return { data: { user: { id: u.id, email: u.email } }, error: null };
      },
    },
  };
  // Een bestaand account in Supabase Auth.
  const gebruiker = (email: string, wachtwoord = 'oud-wachtwoord') => { const u = { id: `u-${++volgnr}`, email, password: wachtwoord }; gebruikers.push(u); return u; };
  return { admin: { from, auth } as Admin, tabellen, gebruikers, sessies, oproepen, storing, gebruiker };
}

// Een verse omgeving per test: eigen database, eigen klok.
function opzet(random?: () => string) {
  const db = nepAdmin();
  const klok = { nu: NU };
  const h = maakHandler(db.admin, random ? { nu: () => klok.nu, random } : { nu: () => klok.nu });
  const roep = async (body: unknown, { methode = 'POST', jwt = '', auth = '' } = {}) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (jwt) headers.Authorization = `Bearer ${jwt}`;
    if (auth) headers.Authorization = auth;
    const r = await h(new Request('http://localhost/functions/v1/account', { method: methode, headers, body: methode === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined }));
    const tekst = await r.text();
    let json: Rij | null = null;
    try { json = JSON.parse(tekst); } catch { /* geen json */ }
    return { status: r.status, json, tekst, headers: r.headers };
  };
  // Een code klaarzetten zoals in schema.sql: alleen de hash van de code.
  const legCode = (code: string, wie: string, { verloopt = NU + 7 * DAG, gebruikt_op = null as string | null } = {}) =>
    db.tabellen.account_code.push({ code_hash: hash(schoneCode(code)), wie, verloopt: new Date(verloopt).toISOString(), gebruikt_op, aangemaakt_door: 'giulia@test.be' });
  // Iemand met toegang en een geldige aanmelding (jwt).
  const lid = (email: string, wie: string, jwt: string) => { db.tabellen.toegang.push({ email, wie }); db.sessies.set(jwt, email); };
  const maak = (email: string, code: string, wachtwoord = WW) => roep({ actie: 'maak', email, wachtwoord, code });
  return { ...db, klok, roep, legCode, lid, maak };
}

// console.error tijdelijk opvangen (de functie logt onverwachte fouten).
async function stil<T>(f: () => Promise<T>) {
  const oud = console.error; const log: unknown[][] = [];
  console.error = (...a: unknown[]) => { log.push(a); };
  try { return { r: await f(), log }; } finally { console.error = oud; }
}
const melding = (r: { json: Rij | null }) => String(r.json?.message || '');

try {
  // ---- Algemeen: OPTIONS, 405, onbekende actie ----
  {
    const t = opzet();
    const o = await t.roep(null, { methode: 'OPTIONS' });
    check('OPTIONS: 200 met CORS-headers', o.status === 200 && o.tekst === 'ok' && o.headers.get('Access-Control-Allow-Origin') === '*'
      && /POST/.test(o.headers.get('Access-Control-Allow-Methods') || '') && /authorization/.test(o.headers.get('Access-Control-Allow-Headers') || ''), `${o.status} ${o.tekst}`);
    const g = await t.roep(null, { methode: 'GET' });
    check('GET: 405', g.status === 405 && melding(g) === 'Niet toegestaan.' && g.headers.get('Access-Control-Allow-Origin') === '*', `${g.status} ${g.tekst}`);
    check('antwoord is json', /application\/json/.test(g.headers.get('Content-Type') || ''));
    const gevallen: [string, unknown][] = [['onbekende actie', { actie: 'wis' }], ['geen actie', {}], ['geen json', 'dit is geen json'], ['json null', 'null'], ['json-lijst', '[1,2]']];
    for (const [naam, body] of gevallen) {
      const { r, log } = await stil(() => t.roep(body));
      check(`${naam}: 400 'Onbekende actie.'`, r.status === 400 && melding(r) === 'Onbekende actie.' && !log.length, `${r.status} ${r.tekst}`);
    }
    check('algemeen: niets aangeraakt', !t.oproepen.getUser.length && !t.oproepen.listUsers.length && !t.tabellen.account_code.length);
  }

  // ---- sha256 en schoneCode ----
  check('sha256 geeft de hex-hash', await sha256('ABCDEFGHJK') === hash('ABCDEFGHJK'));
  check('schoneCode: hoofdletters, zonder streepje of spaties', schoneCode('abcde-fghjk') === 'ABCDEFGHJK' && schoneCode(' AbCdE fGhJk ') === 'ABCDEFGHJK' && schoneCode('ABCDE–FGHJK') === 'ABCDEFGHJK');
  check('schoneCode: leeg blijft leeg', schoneCode('') === '' && schoneCode(undefined as unknown as string) === '');

  // ---- maak: invoer nakijken ----
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi');
    for (const email of ['', 'remi', 'remi@test', 'remi @test.be', '@test.be', 'remi@@test.be']) {
      const r = await t.maak(email, 'ABCDE-FGHJK');
      check(`maak: ongeldig adres '${email}' geeft 400`, r.status === 400 && /geldig e-mailadres/.test(melding(r)), `${r.status} ${r.tekst}`);
    }
    const kort = await t.maak('remi@test.be', 'ABCDE-FGHJK', '1234567');
    check('maak: wachtwoord van 7 tekens geeft 400', kort.status === 400 && /minstens 8 tekens/.test(melding(kort)), kort.tekst);
    const geen = await t.roep({ actie: 'maak', email: 'remi@test.be', wachtwoord: WW });
    check('maak: zonder code 400', geen.status === 400 && melding(geen) === 'Vul de toegangscode in.', geen.tekst);
    const halve = await t.maak('remi@test.be', 'ab-cd');
    check('maak: te korte code 400', halve.status === 400 && melding(halve) === 'Vul de toegangscode in.', halve.tekst);
    check('maak: bij ongeldige invoer geen account, geen toegang en de code blijft ongebruikt',
      !t.oproepen.createUser.length && !t.oproepen.updateUserById.length && !t.oproepen.listUsers.length && !t.tabellen.toegang.length && t.tabellen.account_code[0].gebruikt_op === null);
  }

  // ---- maak: codes die niet werken ----
  {
    const t = opzet();
    t.legCode('HJKLM-NPQRS', 'remi', { verloopt: NU - 1 });
    t.legCode('TUVWX-YZ234', 'remi', { gebruikt_op: new Date(NU - DAG).toISOString() });
    const gevallen: [string, string][] = [['onbekende code', 'ZZZZZ-ZZZZZ'], ['verlopen code', 'HJKLM-NPQRS'], ['al gebruikte code', 'TUVWX-YZ234']];
    for (const [naam, code] of gevallen) {
      const r = await t.maak('remi@test.be', code);
      check(`maak: ${naam} geeft 400`, r.status === 400 && /klopt niet, is al gebruikt of is verlopen/.test(melding(r)), `${r.status} ${r.tekst}`);
    }
    check('maak: met een ongeldige code geen account en geen toegang', !t.oproepen.createUser.length && !t.oproepen.updateUserById.length && !t.tabellen.toegang.length);
    t.legCode('56789-ABCDE', 'remi', { verloopt: NU + 1 });
    const net = await t.maak('remi@test.be', '56789-ABCDE');
    check('maak: code die over 1 ms verloopt werkt nog', net.status === 200, net.tekst);
  }

  // ---- maak: geldige code, nieuw account ----
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi');
    t.klok.nu = NU + 3 * DAG;
    const r = await t.maak('  Remi@Test.be ', 'ABCDE-FGHJK');
    check('nieuw account: 200 met wie en nieuw', r.status === 200 && isDeepStrictEqual(r.json, { ok: true, wie: 'remi', nieuw: true }), r.tekst);
    check('nieuw account: createUser één keer met email_confirm true', isDeepStrictEqual(t.oproepen.createUser, [{ email: 'remi@test.be', password: WW, email_confirm: true }]), t.oproepen.createUser);
    check('nieuw account: geen updateUserById', !t.oproepen.updateUserById.length);
    check('nieuw account: toegang als remi', isDeepStrictEqual(t.tabellen.toegang, [{ email: 'remi@test.be', wie: 'remi' }]), t.tabellen.toegang);
    check('nieuw account: code gemarkeerd als gebruikt', t.tabellen.account_code[0].gebruikt_op === new Date(NU + 3 * DAG).toISOString(), t.tabellen.account_code[0]);
    const opnieuw = await t.maak('iemand@test.be', 'ABCDE-FGHJK');
    check('nieuw account: code werkt geen tweede keer', opnieuw.status === 400 && /al gebruikt/.test(melding(opnieuw)) && t.oproepen.createUser.length === 1 && t.tabellen.toegang.length === 1, opnieuw.tekst);
    const zelfde = await t.maak('remi@test.be', 'abcdefghjk');
    check('nieuw account: ook niet voor hetzelfde adres', zelfde.status === 400 && t.oproepen.updateUserById.length === 0, zelfde.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'giulia');
    const r = await t.maak('giulia@test.be', 'ABCDE-FGHJK', '12345678');
    check('nieuw account: wachtwoord van precies 8 tekens mag', r.status === 200 && r.json?.wie === 'giulia' && t.oproepen.createUser[0]?.password === '12345678', r.tekst);
  }

  // ---- maak: geldige code, bestaand account (wachtwoord vergeten) ----
  {
    const t = opzet();
    const u = t.gebruiker('Giulia@Test.be'); // in Auth met hoofdletters
    t.tabellen.toegang.push({ email: 'giulia@test.be', wie: 'giulia' });
    t.legCode('HJKLM-NPQRS', 'giulia');
    const r = await t.maak('giulia@test.be', 'HJKLM-NPQRS', 'nieuw-wachtwoord-9');
    check('bestaand account: 200 met nieuw false', r.status === 200 && isDeepStrictEqual(r.json, { ok: true, wie: 'giulia', nieuw: false }), r.tekst);
    check('bestaand account: updateUserById met het nieuwe wachtwoord', isDeepStrictEqual(t.oproepen.updateUserById, [[u.id, { password: 'nieuw-wachtwoord-9', email_confirm: true }]]) && u.password === 'nieuw-wachtwoord-9', t.oproepen.updateUserById);
    check('bestaand account: geen createUser', !t.oproepen.createUser.length);
    check('bestaand account: één rij in toegang', isDeepStrictEqual(t.tabellen.toegang, [{ email: 'giulia@test.be', wie: 'giulia' }]), t.tabellen.toegang);
    check('bestaand account: code gemarkeerd als gebruikt', t.tabellen.account_code[0].gebruikt_op === new Date(NU).toISOString());
  }
  {
    const t = opzet();
    for (let i = 0; i < 230; i++) t.gebruiker(`ander${i}@test.be`);
    const u = t.gebruiker('remi@test.be');
    t.legCode('KLMNP-QRSTU', 'remi');
    const r = await t.maak('remi@test.be', 'KLMNP-QRSTU');
    check('bestaand account op pagina 2: gevonden', r.status === 200 && r.json?.nieuw === false && t.oproepen.updateUserById[0]?.[0] === u.id && !t.oproepen.createUser.length, r.tekst);
    check('bestaand account op pagina 2: per 200 gelezen', isDeepStrictEqual(t.oproepen.listUsers, [{ page: 1, perPage: 200 }, { page: 2, perPage: 200 }]), t.oproepen.listUsers);
  }

  // ---- maak: hoofdletters en streepje tellen niet ----
  {
    const gevallen: [string, string][] = [['kleine letters met streepje', 'abcde-fghjk'], ['zonder streepje', 'ABCDEFGHJK'], ['met spaties', ' abcde fghjk '], ['gemengd met ander streepje', 'aBcDe–FgHjK']];
    for (const [naam, invoer] of gevallen) {
      const t = opzet();
      t.legCode('ABCDE-FGHJK', 'remi');
      const r = await t.maak('remi@test.be', invoer);
      check(`code ${naam} ('${invoer}') werkt`, r.status === 200 && r.json?.wie === 'remi', `${r.status} ${r.tekst}`);
    }
  }

  // ---- code: aanmelding, toegang en invoer ----
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    t.sessies.set('tok-vreemd', 'vreemde@test.be');
    const zonder = await t.roep({ actie: 'code', wie: 'remi' });
    check('code zonder aanmelding: 401', zonder.status === 401 && melding(zonder) === 'Niet aangemeld.' && !t.oproepen.getUser.length, zonder.tekst);
    const leeg = await t.roep({ actie: 'code', wie: 'remi' }, { auth: 'Bearer ' });
    check('code met lege Authorization: 401', leeg.status === 401, leeg.tekst);
    const onbekend = await t.roep({ actie: 'code', wie: 'remi' }, { jwt: 'tok-onbekend' });
    check('code met ongeldige aanmelding: 401', onbekend.status === 401 && melding(onbekend) === 'Niet aangemeld.', onbekend.tekst);
    const vreemd = await t.roep({ actie: 'code', wie: 'remi' }, { jwt: 'tok-vreemd' });
    check('code door een niet-lid: 403', vreemd.status === 403 && melding(vreemd) === 'Dit adres heeft geen toegang.', vreemd.tekst);
    for (const wie of ['', 'mama', 'REMI', 'remi ', undefined, null]) {
      const r = await t.roep({ actie: 'code', wie }, { jwt: 'tok-giulia' });
      check(`code met ongeldige wie ${JSON.stringify(wie)}: 400`, r.status === 400 && melding(r) === 'Voor wie is de code?', `${r.status} ${r.tekst}`);
    }
    check('code: bij weigering geen code bewaard', !t.tabellen.account_code.length);
    check('code: jwt zonder "Bearer " doorgegeven', t.oproepen.getUser.includes('tok-giulia') && t.oproepen.getUser.includes('tok-vreemd'));
  }

  // ---- code: door een lid, met de echte toevalsgenerator ----
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    const r = await t.roep({ actie: 'code', wie: 'remi' }, { jwt: 'tok-giulia' });
    const code = String(r.json?.code || '');
    check('code door een lid: 200 in formaat XXXXX-XXXXX', r.status === 200 && FORMAAT.test(code), r.tekst);
    check('code door een lid: 7 dagen geldig', r.json?.verloopt === new Date(NU + 7 * DAG).toISOString(), r.json?.verloopt);
    const rij = t.tabellen.account_code[0] || {};
    check('code door een lid: één rij met de sha256-hash', t.tabellen.account_code.length === 1 && rij.code_hash === hash(code.replace('-', '')), rij);
    check('code door een lid: rij met wie, verloopt en aangemaakt_door', isDeepStrictEqual(Object.keys(rij).sort(), ['aangemaakt_door', 'code_hash', 'verloopt', 'wie'])
      && rij.wie === 'remi' && rij.verloopt === r.json?.verloopt && rij.aangemaakt_door === 'giulia@test.be', rij);
    const opgeslagen = JSON.stringify(t.tabellen);
    check('code door een lid: de code zelf staat nergens in de database', !opgeslagen.includes(code) && !opgeslagen.includes(code.replace('-', '')) && !opgeslagen.toLowerCase().includes(code.replace('-', '').toLowerCase()));
    // Remi gebruikt de code, in kleine letters en zonder streepje.
    t.klok.nu = NU + 7 * DAG - 1000;
    const m = await t.maak('remi@test.be', code.replace('-', '').toLowerCase());
    check('code door een lid: werkt voor een nieuw account', m.status === 200 && isDeepStrictEqual(m.json, { ok: true, wie: 'remi', nieuw: true }) && t.tabellen.toegang.some(x => x.email === 'remi@test.be' && x.wie === 'remi'), m.tekst);
    // Een tweede code die na 7 dagen niet meer werkt.
    t.klok.nu = NU;
    const r2 = await t.roep({ actie: 'code', wie: 'giulia' }, { jwt: 'tok-giulia' });
    t.klok.nu = NU + 7 * DAG + 1;
    const m2 = await t.maak('giulia2@test.be', String(r2.json?.code));
    check('code door een lid: na 7 dagen verlopen', r2.status === 200 && m2.status === 400 && /verlopen/.test(melding(m2)), m2.tekst);
  }
  {
    const t = opzet();
    t.lid('remi@test.be', 'remi', 'tok-remi');
    const codes: string[] = [];
    for (let i = 0; i < 300; i++) codes.push(String((await t.roep({ actie: 'code', wie: i % 2 ? 'remi' : 'giulia' }, { jwt: 'tok-remi' })).json?.code));
    check('300 codes: allemaal in formaat XXXXX-XXXXX', codes.every(c => FORMAAT.test(c)), codes.find(c => !FORMAAT.test(c)));
    check('300 codes: nooit 0, O, 1 of I', !codes.some(c => /[0O1I]/.test(c)));
    const tekens = new Set(codes.join('').replace(/-/g, ''));
    check('300 codes: alle 32 tekens van het alfabet komen voor', tekens.size === ALFABET.length && [...tekens].every(x => ALFABET.includes(x)), [...tekens].sort().join(''));
    check('300 codes: allemaal verschillend', new Set(codes).size === 300);
    check('300 codes: alleen hashes bewaard', t.tabellen.account_code.length === 300 && t.tabellen.account_code.every((x, i) => /^[0-9a-f]{64}$/.test(x.code_hash) && x.code_hash === hash(codes[i].replace('-', ''))));
  }
  {
    const t = opzet(() => 'KLMNPQRSTU');
    t.tabellen.toegang.push({ email: 'giulia@test.be', wie: 'giulia' });
    t.sessies.set('tok-g', 'Giulia@Test.BE'); // Auth geeft het adres met hoofdletters
    const r = await t.roep({ actie: 'code', wie: 'giulia' }, { auth: 'bearer tok-g' });
    check('code: vaste toevalswaarde wordt KLMNP-QRSTU', r.status === 200 && r.json?.code === 'KLMNP-QRSTU' && t.tabellen.account_code[0]?.code_hash === hash('KLMNPQRSTU'), r.tekst);
    check('code: adres van de aanmelding in kleine letters', t.tabellen.account_code[0]?.aangemaakt_door === 'giulia@test.be', t.tabellen.account_code[0]);
  }

  // ---- Fouten van Supabase ----
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi');
    t.storing.createUser = { message: 'Password should contain at least one character of each: abc, 123' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('wachtwoord geweigerd door Supabase: 400 met uitleg', r.status === 400 && /wachtwoord wordt niet aanvaard/.test(melding(r)), r.tekst);
    check('wachtwoord geweigerd: code blijft bruikbaar, geen toegang', t.tabellen.account_code[0].gebruikt_op === null && !t.tabellen.toegang.length);
    t.storing.createUser = null;
    const r2 = await t.maak('remi@test.be', 'ABCDE-FGHJK', 'een-beter-wachtwoord');
    check('wachtwoord geweigerd: daarna lukt het met dezelfde code', r2.status === 200 && r2.json?.nieuw === true, r2.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi');
    t.storing.createUser = { message: 'Database error creating new user' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('andere fout bij createUser: 400 met de reden', r.status === 400 && melding(r) === 'Het account kon niet gemaakt worden (Database error creating new user).', r.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi');
    t.storing.listUsers = { message: 'kapot' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('accounts niet leesbaar: 500, geen account', r.status === 500 && melding(r) === 'Accounts konden niet gelezen worden.' && !t.oproepen.createUser.length, r.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi');
    t.storing['toegang.upsert'] = { message: 'kapot' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('toegang niet bewaard: 500 en code blijft bruikbaar', r.status === 500 && melding(r) === 'De toegang kon niet bewaard worden.' && t.tabellen.account_code[0].gebruikt_op === null, r.tekst);
  }
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    t.storing['account_code.insert'] = { message: 'kapot' };
    const r = await t.roep({ actie: 'code', wie: 'remi' }, { jwt: 'tok-giulia' });
    check('code niet bewaard: 500 zonder code', r.status === 500 && melding(r) === 'De code kon niet gemaakt worden.' && !('code' in (r.json || {})), r.tekst);
  }
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    t.storing.getUser = { message: 'netwerk weg' };
    const { r, log } = await stil(() => t.roep({ actie: 'code', wie: 'remi' }, { jwt: 'tok-giulia' }));
    check('onverwachte fout: 500 met algemene melding en een logregel', r.status === 500 && melding(r) === 'Er ging iets mis op de server.' && log.length === 1 && r.headers.get('Access-Control-Allow-Origin') === '*', r.tekst);
  }
} catch (e) {
  fouten.push('script: ' + ((e as Error)?.stack || String(e)));
}
console.log(`Geslaagd: ${geslaagd.length}`);
if (fouten.length) { console.log(`Mislukt: ${fouten.length}`); fouten.forEach(f => console.log(' - ' + f)); process.exitCode = 1; } else console.log('Alles in orde.');
