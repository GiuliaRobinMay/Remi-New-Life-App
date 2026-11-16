// Test van de serverfunctie 'account' (supabase/functions/account/handler.ts) met een nagebootste admin-client.
// Gebruik: node --experimental-strip-types scripts/test-account-functie.mts
// Alleen verzonnen adressen, wachtwoorden en codes; er gaat niets naar de echte database.
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { maakHandler, schoneCode, schoonAdres, sha256 } from '../supabase/functions/account/handler.ts';
import type { Admin } from '../supabase/functions/account/handler.ts';

type Rij = Record<string, any>;
type Fout = { message: string; code?: string } | null;

const fouten: string[] = []; const geslaagd: string[] = [];
const check = (naam: string, ok: unknown, detail: unknown = '') => (ok ? geslaagd : fouten).push(`${naam}${detail ? ': ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`);
const hash = (t: string) => createHash('sha256').update(t).digest('hex'); // los van de functie berekend
const NU = Date.parse('2026-11-03T10:00:00.000Z');
const UUR = 36e5;
const DAG = 24 * UUR;
const ALFABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // zonder 0/O en 1/I
const FORMAAT = /^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/;
const WW = 'proefwachtwoord-123';
const ONGELDIG = /klopt niet, is al gebruikt of is verlopen/;
const ANDER_ADRES = /hoort bij een ander e-mailadres/;

// ---- Nagebootste admin-client: tabellen toegang en account_code, de accounts en hun aanmeldingen, alles in geheugen ----
function nepAdmin() {
  const tabellen: Record<string, Rij[]> = { toegang: [], account_code: [] };
  const SLEUTEL: Record<string, string> = { toegang: 'email', account_code: 'code_hash' };
  const UNIEK: Record<string, string[]> = { toegang: ['email', 'user_id'], account_code: ['code_hash'] }; // zoals schema.sql
  const gebruikers: { id: string; email?: string; password?: string }[] = [];
  const sessies = new Map<string, string>(); // jwt -> id van het account (een aanmelding)
  const oproepen = { getUser: [] as string[], listUsers: [] as Rij[], createUser: [] as Rij[], updateUserById: [] as [string, Rij][], rpc: [] as [string, Rij][], claims: 0 };
  const storing: Record<string, Fout> = {}; // nagebootste fouten, bv. storing['toegang.upsert'] of storing.createUser
  const wacht: Record<string, () => Promise<void>> = {}; // om gelijktijdige verzoeken op een vast punt te laten wachten
  let volgnr = 0;

  const tijd = (v: unknown) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? Date.parse(v) : v);
  function from(t: string) {
    const rijen = tabellen[t];
    if (!rijen) throw new Error(`Onbekende tabel ${t}`);
    const filters: ((r: Rij) => boolean)[] = [];
    let soort = 'select'; let waarde: Rij = {}; let kolommen = '*'; let terug = false;
    const past = (r: Rij) => filters.every(f => f(r));
    const kies = (r: Rij) => kolommen === '*' ? { ...r } : Object.fromEntries(kolommen.split(',').map(k => k.trim()).map(k => [k, r[k] ?? null]));
    const geldig = (w: Rij) => !('wie' in w) || ['remi', 'giulia'].includes(w.wie); // check-constraint uit schema.sql
    const botsing = (w: Rij, behalve?: Rij) => UNIEK[t].some(k => w[k] != null && rijen.some(r => r !== behalve && r[k] === w[k]));
    // Synchroon, dus atomair: precies zoals één SQL-opdracht.
    function voerUit(): { data: Rij[] | null; error: Fout } {
      const s = storing[`${t}.${soort}`];
      if (s) return { data: null, error: s };
      const k = SLEUTEL[t];
      if (soort === 'select') return { data: rijen.filter(past).map(kies), error: null };
      if (!geldig(waarde)) return { data: null, error: { message: 'violates check constraint' } };
      const dubbel = { data: null, error: { message: 'duplicate key value violates unique constraint', code: '23505' } };
      if (soort === 'insert') {
        if (botsing(waarde)) return dubbel;
        rijen.push({ ...waarde });
      } else if (soort === 'upsert') {
        const r = rijen.find(x => x[k] === waarde[k]);
        if (botsing(waarde, r)) return dubbel;
        if (r) Object.assign(r, waarde); else rijen.push({ ...waarde });
      } else if (soort === 'update') {
        const geraakt = rijen.filter(past);
        if (t === 'account_code' && 'gebruikt_op' in waarde && waarde.gebruikt_op) oproepen.claims++;
        geraakt.forEach(r => Object.assign(r, waarde));
        return { data: terug ? geraakt.map(kies) : null, error: null };
      }
      return { data: null, error: null };
    }
    // Zoals de query-builder van supabase-js: ketenen, en 'await' voert uit.
    const q = {
      select(k = '*') { kolommen = k; if (soort !== 'select') terug = true; return q; },
      eq(k: string, v: unknown) { filters.push(r => r[k] === v); return q; },
      is(k: string, v: unknown) { filters.push(r => (r[k] ?? null) === v); return q; },
      gt(k: string, v: unknown) { filters.push(r => r[k] != null && (tijd(r[k]) as number) > (tijd(v) as number)); return q; },
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

  // De functie trek_sessies_in uit schema.sql: alle aanmeldingen van dat account weg.
  async function rpc(f: string, args: Rij) {
    oproepen.rpc.push([f, args]);
    if (storing.rpc) return { data: null, error: storing.rpc };
    if (f !== 'trek_sessies_in') return { data: null, error: { message: `function ${f} does not exist` } };
    for (const [jwt, id] of [...sessies]) if (id === args.uid) sessies.delete(jwt);
    return { data: null, error: null };
  }

  const auth = {
    async getUser(jwt: string) {
      oproepen.getUser.push(jwt);
      if (storing.getUser) throw new Error(storing.getUser.message);
      const u = gebruikers.find(x => x.id === sessies.get(jwt));
      return u ? { data: { user: { id: u.id, email: u.email } }, error: null } : { data: { user: null }, error: { message: 'invalid JWT' } };
    },
    admin: {
      async listUsers(o: { page: number; perPage: number }) {
        oproepen.listUsers.push(o);
        if (wacht.listUsers) await wacht.listUsers();
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
  return { admin: { from, rpc, auth } as unknown as Admin, tabellen, gebruikers, sessies, oproepen, storing, wacht, gebruiker };
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
  // Een code klaarzetten zoals in schema.sql: alleen de hash van de code, voor één adres.
  const legCode = (code: string, wie: string, email: string | null, { verloopt = NU + DAG, gebruikt_op = null as string | null } = {}) => {
    const rij = { code_hash: hash(schoneCode(code)), wie, email, verloopt: new Date(verloopt).toISOString(), gebruikt_op, aangemaakt_door: 'giulia@test.be' };
    db.tabellen.account_code.push(rij);
    return rij;
  };
  // Een account met een aanmelding (jwt), zonder toegang.
  const aanmelding = (email: string, jwt: string) => {
    const u = db.gebruikers.find(x => x.email === email) || db.gebruiker(email);
    db.sessies.set(jwt, u.id);
    return u;
  };
  // Iemand met toegang en een geldige aanmelding (jwt).
  const lid = (email: string, wie: string, jwt: string) => {
    const u = aanmelding(email, jwt);
    db.tabellen.toegang.push({ email: email.toLowerCase(), wie, user_id: u.id });
    return u;
  };
  const maak = (email: string, code: string, wachtwoord = WW) => roep({ actie: 'maak', email, wachtwoord, code });
  const koppel = (code: unknown, jwt: string) => roep({ actie: 'koppel', code }, { jwt });
  const codeVoor = (wie: unknown, email: unknown, jwt: string) => roep({ actie: 'code', wie, email }, { jwt });
  const codeRij = (code: string) => db.tabellen.account_code.find(x => x.code_hash === hash(schoneCode(code)));
  return { ...db, klok, roep, legCode, aanmelding, lid, maak, koppel, codeVoor, codeRij };
}

// console.error tijdelijk opvangen (de functie logt onverwachte fouten).
async function stil<T>(f: () => Promise<T>) {
  const oud = console.error; const log: unknown[][] = [];
  console.error = (...a: unknown[]) => { log.push(a); };
  try { return { r: await f(), log }; } finally { console.error = oud; }
}
const melding = (r: { json: Rij | null }) => String(r.json?.message || '');
const geenWijziging = (t: ReturnType<typeof opzet>) => !t.oproepen.createUser.length && !t.oproepen.updateUserById.length && !t.oproepen.rpc.length;

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

  // ---- sha256, schoneCode en schoonAdres ----
  check('sha256 geeft de hex-hash', await sha256('ABCDEFGHJK') === hash('ABCDEFGHJK'));
  check('schoneCode: hoofdletters, zonder streepje of spaties', schoneCode('abcde-fghjk') === 'ABCDEFGHJK' && schoneCode(' AbCdE fGhJk ') === 'ABCDEFGHJK' && schoneCode('ABCDE–FGHJK') === 'ABCDEFGHJK');
  check('schoneCode: leeg blijft leeg', schoneCode('') === '' && schoneCode(undefined as unknown as string) === '');
  check('schoonAdres: bijgesneden en in kleine letters', schoonAdres('  Remi@Test.BE ') === 'remi@test.be' && schoonAdres(undefined) === '' && schoonAdres(null) === '');

  // ---- maak: invoer nakijken ----
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
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
      geenWijziging(t) && !t.oproepen.listUsers.length && !t.tabellen.toegang.length && t.tabellen.account_code[0].gebruikt_op === null);
  }

  // ---- maak: codes die niet werken ----
  {
    const t = opzet();
    t.legCode('HJKLM-NPQRS', 'remi', 'remi@test.be', { verloopt: NU - 1 });
    t.legCode('TUVWX-YZ234', 'remi', 'remi@test.be', { gebruikt_op: new Date(NU - DAG).toISOString() });
    t.legCode('QRSTU-VWXYZ', 'remi', null); // een code van vroeger, zonder adres
    t.legCode('LMNPQ-RSTUV', 'remi', 'remi@test.be', { verloopt: NU }); // verloopt precies nu
    const gevallen: [string, string][] = [['onbekende code', 'ZZZZZ-ZZZZZ'], ['verlopen code', 'HJKLM-NPQRS'], ['al gebruikte code', 'TUVWX-YZ234'],
      ['code zonder adres (van vroeger)', 'QRSTU-VWXYZ'], ['code die precies nu verloopt', 'LMNPQ-RSTUV']];
    for (const [naam, code] of gevallen) {
      const r = await t.maak('remi@test.be', code);
      check(`maak: ${naam} geeft 400`, r.status === 400 && ONGELDIG.test(melding(r)), `${r.status} ${r.tekst}`);
    }
    check('maak: met een ongeldige code geen account en geen toegang', geenWijziging(t) && !t.tabellen.toegang.length && !t.oproepen.claims);
    t.legCode('56789-ABCDE', 'remi', 'remi@test.be', { verloopt: NU + 1 });
    const net = await t.maak('remi@test.be', '56789-ABCDE');
    check('maak: code die over 1 ms verloopt werkt nog', net.status === 200, net.tekst);
  }

  // ---- maak: de code hoort bij één e-mailadres ----
  {
    const t = opzet();
    const remi = t.lid('remi@test.be', 'remi', 'tok-remi');
    t.legCode('ABCDE-FGHJK', 'giulia', 'giulia@test.be'); // 'Code voor Giulia'
    // Wie de code van Giulia ziet, probeert er het account van Remi mee over te nemen.
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK', 'iets-nieuws-123');
    check('ander adres: 400 met uitleg', r.status === 400 && ANDER_ADRES.test(melding(r)), `${r.status} ${r.tekst}`);
    check('ander adres: wachtwoord van Remi ongewijzigd, aanmelding blijft, toegang ongewijzigd', remi.password === 'oud-wachtwoord' && geenWijziging(t)
      && t.sessies.has('tok-remi') && isDeepStrictEqual(t.tabellen.toegang, [{ email: 'remi@test.be', wie: 'remi', user_id: remi.id }]), t.tabellen.toegang);
    check('ander adres: de code blijft ongebruikt', t.codeRij('ABCDE-FGHJK')?.gebruikt_op === null && !t.oproepen.claims);
    const g = await t.maak('Giulia@Test.be', 'ABCDE-FGHJK');
    check('ander adres: daarna werkt de code wel voor het juiste adres', g.status === 200 && isDeepStrictEqual(g.json, { ok: true, wie: 'giulia', nieuw: true }), g.tekst);
  }

  // ---- maak: geldige code, nieuw account ----
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    t.klok.nu = NU + 3 * UUR;
    const r = await t.maak('  Remi@Test.be ', 'ABCDE-FGHJK');
    check('nieuw account: 200 met wie en nieuw', r.status === 200 && isDeepStrictEqual(r.json, { ok: true, wie: 'remi', nieuw: true }), r.tekst);
    check('nieuw account: createUser één keer met email_confirm true', isDeepStrictEqual(t.oproepen.createUser, [{ email: 'remi@test.be', password: WW, email_confirm: true }]), t.oproepen.createUser);
    check('nieuw account: geen updateUserById en geen sessies in te trekken', !t.oproepen.updateUserById.length && !t.oproepen.rpc.length);
    const id = t.gebruikers[0]?.id;
    check('nieuw account: toegang als remi, met het id van het account', isDeepStrictEqual(t.tabellen.toegang, [{ email: 'remi@test.be', wie: 'remi', user_id: id }]), t.tabellen.toegang);
    check('nieuw account: code gemarkeerd als gebruikt', t.tabellen.account_code[0].gebruikt_op === new Date(NU + 3 * UUR).toISOString(), t.tabellen.account_code[0]);
    const opnieuw = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('nieuw account: code werkt geen tweede keer', opnieuw.status === 400 && ONGELDIG.test(melding(opnieuw)) && t.oproepen.createUser.length === 1 && !t.oproepen.updateUserById.length, opnieuw.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'giulia', 'giulia@test.be');
    const r = await t.maak('giulia@test.be', 'ABCDE-FGHJK', '12345678');
    check('nieuw account: wachtwoord van precies 8 tekens mag', r.status === 200 && r.json?.wie === 'giulia' && t.oproepen.createUser[0]?.password === '12345678', r.tekst);
  }

  // ---- maak: twee verzoeken tegelijk met dezelfde code (dubbele klik of twee toestellen) ----
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    // Beide verzoeken komen pas verder als ze allebei de code al nagekeken hebben (en ze dus nog ongebruikt zagen).
    let aantal = 0; let los = () => {}; const samen = new Promise<void>(r => { los = r; });
    t.wacht.listUsers = async () => { if (++aantal >= 2) los(); await samen; };
    const [a, b] = await Promise.all([t.maak('remi@test.be', 'ABCDE-FGHJK', 'eerste-wachtwoord'), t.maak('remi@test.be', 'ABCDE-FGHJK', 'tweede-wachtwoord')]);
    const statussen = [a.status, b.status].sort().join(',');
    check('tegelijk: beide verzoeken zagen een geldige code', aantal === 2, String(aantal));
    check('tegelijk: één lukt, het andere krijgt 400', statussen === '200,400' && ONGELDIG.test(melding(a.status === 400 ? a : b)), `${a.status} ${a.tekst} | ${b.status} ${b.tekst}`);
    check('tegelijk: maar één account en één rij in toegang', t.oproepen.createUser.length === 1 && t.gebruikers.length === 1 && t.tabellen.toegang.length === 1 && !t.oproepen.updateUserById.length, t.oproepen.createUser);
  }

  // ---- maak: geldige code, bestaand account (wachtwoord vergeten): sessies ingetrokken ----
  {
    const t = opzet();
    const u = t.lid('Giulia@Test.be', 'giulia', 'tok-giulia-gsm'); // in Auth met hoofdletters
    t.sessies.set('tok-giulia-laptop', u.id);
    const remi = t.lid('remi@test.be', 'remi', 'tok-remi');
    t.legCode('HJKLM-NPQRS', 'giulia', 'giulia@test.be');
    const r = await t.maak('giulia@test.be', 'HJKLM-NPQRS', 'nieuw-wachtwoord-9');
    check('bestaand account: 200 met nieuw false', r.status === 200 && isDeepStrictEqual(r.json, { ok: true, wie: 'giulia', nieuw: false }), r.tekst);
    check('bestaand account: updateUserById met het nieuwe wachtwoord', isDeepStrictEqual(t.oproepen.updateUserById, [[u.id, { password: 'nieuw-wachtwoord-9', email_confirm: true }]]) && u.password === 'nieuw-wachtwoord-9', t.oproepen.updateUserById);
    check('bestaand account: geen createUser', !t.oproepen.createUser.length);
    check('bestaand account: sessies ingetrokken met trek_sessies_in(uid)', isDeepStrictEqual(t.oproepen.rpc, [['trek_sessies_in', { uid: u.id }]]), t.oproepen.rpc);
    check('bestaand account: alle aanmeldingen van Giulia weg, die van Remi blijft', !t.sessies.has('tok-giulia-gsm') && !t.sessies.has('tok-giulia-laptop') && t.sessies.get('tok-remi') === remi.id);
    const oud = await t.codeVoor('remi', 'x@test.be', 'tok-giulia-laptop');
    check('bestaand account: een oude aanmelding werkt niet meer', oud.status === 401, oud.tekst);
    check('bestaand account: toegang ongewijzigd', isDeepStrictEqual(t.tabellen.toegang.find(x => x.email === 'giulia@test.be'), { email: 'giulia@test.be', wie: 'giulia', user_id: u.id }), t.tabellen.toegang);
    check('bestaand account: code gemarkeerd als gebruikt', t.codeRij('HJKLM-NPQRS')?.gebruikt_op === new Date(NU).toISOString());
  }
  {
    // Een account dat al bestaat maar nog geen toegang heeft: krijgt die, met zijn id.
    const t = opzet();
    const u = t.aanmelding('remi@test.be', 'tok-remi');
    t.legCode('KLMNP-QRSTU', 'remi', 'remi@test.be');
    const r = await t.maak('remi@test.be', 'KLMNP-QRSTU');
    check('bestaand account zonder toegang: 200 en toegang met user_id', r.status === 200 && r.json?.nieuw === false
      && isDeepStrictEqual(t.tabellen.toegang, [{ email: 'remi@test.be', wie: 'remi', user_id: u.id }]) && !t.sessies.has('tok-remi'), t.tabellen.toegang);
  }
  {
    const t = opzet();
    for (let i = 0; i < 230; i++) t.gebruiker(`ander${i}@test.be`);
    const u = t.gebruiker('remi@test.be');
    t.legCode('KLMNP-QRSTU', 'remi', 'remi@test.be');
    const r = await t.maak('remi@test.be', 'KLMNP-QRSTU');
    check('bestaand account op pagina 2: gevonden', r.status === 200 && r.json?.nieuw === false && t.oproepen.updateUserById[0]?.[0] === u.id && !t.oproepen.createUser.length, r.tekst);
    check('bestaand account op pagina 2: per 200 gelezen', isDeepStrictEqual(t.oproepen.listUsers, [{ page: 1, perPage: 200 }, { page: 2, perPage: 200 }]), t.oproepen.listUsers);
  }

  // ---- maak: een bestaand adres van de andere persoon wordt geweigerd ----
  {
    const t = opzet();
    const remi = t.lid('remi@test.be', 'remi', 'tok-remi');
    // Een code met het adres van Remi maar voor Giulia (zo zou 'code' ze niet maken; rechtstreeks in de tabel).
    t.legCode('ABCDE-FGHJK', 'giulia', 'remi@test.be');
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK', 'iets-nieuws-123');
    check('andere persoon: 409 met uitleg', r.status === 409 && /al toegang als Remi/.test(melding(r)) && /voor Giulia/.test(melding(r)), `${r.status} ${r.tekst}`);
    check('andere persoon: wachtwoord, aanmelding en wie ongewijzigd', remi.password === 'oud-wachtwoord' && t.sessies.has('tok-remi') && geenWijziging(t)
      && isDeepStrictEqual(t.tabellen.toegang, [{ email: 'remi@test.be', wie: 'remi', user_id: remi.id }]));
    check('andere persoon: code niet ingewisseld', t.codeRij('ABCDE-FGHJK')?.gebruikt_op === null && !t.oproepen.claims);
  }
  {
    // Een oude rij in toegang zonder account (user_id leeg) voor de andere persoon: ook geweigerd.
    const t = opzet();
    t.tabellen.toegang.push({ email: 'remi@test.be', wie: 'remi', user_id: null });
    t.legCode('ABCDE-FGHJK', 'giulia', 'remi@test.be');
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('andere persoon zonder account: 409, geen account', r.status === 409 && geenWijziging(t), r.tekst);
  }
  {
    // Zelfde persoon, oude rij zonder user_id: de rij krijgt het nieuwe account.
    const t = opzet();
    t.tabellen.toegang.push({ email: 'remi@test.be', wie: 'remi', user_id: null });
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('oude rij zonder user_id: krijgt het account', r.status === 200 && isDeepStrictEqual(t.tabellen.toegang, [{ email: 'remi@test.be', wie: 'remi', user_id: t.gebruikers[0].id }]), t.tabellen.toegang);
  }

  // ---- maak: hoofdletters en streepje tellen niet ----
  {
    const gevallen: [string, string][] = [['kleine letters met streepje', 'abcde-fghjk'], ['zonder streepje', 'ABCDEFGHJK'], ['met spaties', ' abcde fghjk '], ['gemengd met ander streepje', 'aBcDe–FgHjK']];
    for (const [naam, invoer] of gevallen) {
      const t = opzet();
      t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
      const r = await t.maak('remi@test.be', invoer);
      check(`code ${naam} ('${invoer}') werkt`, r.status === 200 && r.json?.wie === 'remi', `${r.status} ${r.tekst}`);
    }
  }

  // ---- koppel: aangemeld zonder toegang, code inwisselen zonder wachtwoord ----
  {
    const t = opzet();
    const g = t.aanmelding('Giulia@Test.be', 'tok-giulia');
    t.legCode('ABCDE-FGHJK', 'giulia', 'giulia@test.be');
    const zonder = await t.roep({ actie: 'koppel', code: 'ABCDE-FGHJK' });
    check('koppel zonder aanmelding: 401', zonder.status === 401 && melding(zonder) === 'Niet aangemeld.', zonder.tekst);
    const onbekend = await t.koppel('ABCDE-FGHJK', 'tok-onbekend');
    check('koppel met ongeldige aanmelding: 401', onbekend.status === 401, onbekend.tekst);
    const kort = await t.koppel('abc', 'tok-giulia');
    check('koppel met te korte code: 400', kort.status === 400 && melding(kort) === 'Vul de toegangscode in.', kort.tekst);
    const r = await t.koppel('abcde fghjk', 'tok-giulia');
    check('koppel: 200 met wie', r.status === 200 && isDeepStrictEqual(r.json, { ok: true, wie: 'giulia' }), r.tekst);
    check('koppel: toegang met het id van het aangemelde account', isDeepStrictEqual(t.tabellen.toegang, [{ email: 'giulia@test.be', wie: 'giulia', user_id: g.id }]), t.tabellen.toegang);
    check('koppel: geen wachtwoord, geen nieuw account, aanmelding blijft', geenWijziging(t) && !t.oproepen.listUsers.length && g.password === 'oud-wachtwoord' && t.sessies.has('tok-giulia'));
    check('koppel: code gebruikt', t.codeRij('ABCDE-FGHJK')?.gebruikt_op === new Date(NU).toISOString());
    const nogEens = await t.koppel('ABCDE-FGHJK', 'tok-giulia');
    check('koppel: code werkt geen tweede keer', nogEens.status === 400 && ONGELDIG.test(melding(nogEens)), nogEens.tekst);
    const c = await t.codeVoor('remi', 'remi@test.be', 'tok-giulia');
    check('koppel: daarna is Giulia lid en kan ze een code maken', c.status === 200, c.tekst);
  }
  {
    const t = opzet();
    t.aanmelding('vreemde@test.be', 'tok-vreemd');
    t.legCode('ABCDE-FGHJK', 'giulia', 'giulia@test.be');
    const r = await t.koppel('ABCDE-FGHJK', 'tok-vreemd');
    check('koppel met de code van een ander adres: 400, niets gekoppeld', r.status === 400 && ANDER_ADRES.test(melding(r)) && !t.tabellen.toegang.length && t.codeRij('ABCDE-FGHJK')?.gebruikt_op === null, r.tekst);
    t.legCode('HJKLM-NPQRS', 'remi', 'vreemde@test.be', { verloopt: NU - 1 });
    const v = await t.koppel('HJKLM-NPQRS', 'tok-vreemd');
    check('koppel met een verlopen code: 400', v.status === 400 && ONGELDIG.test(melding(v)) && !t.tabellen.toegang.length, v.tekst);
  }
  {
    const t = opzet();
    // Een tweede account met het adres van Remi in toegang, maar voor Giulia bedoeld: geweigerd.
    t.tabellen.toegang.push({ email: 'remi@test.be', wie: 'remi', user_id: 'u-oud' });
    t.aanmelding('remi@test.be', 'tok-remi');
    t.legCode('ABCDE-FGHJK', 'giulia', 'remi@test.be');
    const r = await t.koppel('ABCDE-FGHJK', 'tok-remi');
    check('koppel: adres met toegang als de andere persoon: 409', r.status === 409 && /al toegang als Remi/.test(melding(r)) && t.tabellen.toegang[0].user_id === 'u-oud', r.tekst);
  }
  {
    const t = opzet();
    // Het account heeft al toegang onder een ander adres (adres van het account gewijzigd).
    const u = t.aanmelding('nieuw@test.be', 'tok-g');
    t.tabellen.toegang.push({ email: 'oud@test.be', wie: 'giulia', user_id: u.id });
    t.legCode('ABCDE-FGHJK', 'giulia', 'nieuw@test.be');
    const r = await t.koppel('ABCDE-FGHJK', 'tok-g');
    check('koppel: account met toegang onder een ander adres: 409', r.status === 409 && /ander e-mailadres/.test(melding(r)) && t.tabellen.toegang.length === 1 && t.codeRij('ABCDE-FGHJK')?.gebruikt_op === null, r.tekst);
  }
  {
    const t = opzet();
    t.aanmelding('giulia@test.be', 'tok-giulia');
    t.legCode('ABCDE-FGHJK', 'giulia', 'giulia@test.be');
    t.storing['toegang.upsert'] = { message: 'kapot' };
    const r = await t.koppel('ABCDE-FGHJK', 'tok-giulia');
    check('koppel: toegang niet bewaard: 500 en de code blijft bruikbaar', r.status === 500 && melding(r) === 'De toegang kon niet bewaard worden.' && t.codeRij('ABCDE-FGHJK')?.gebruikt_op === null, r.tekst);
    t.storing['toegang.upsert'] = null;
    const r2 = await t.koppel('ABCDE-FGHJK', 'tok-giulia');
    check('koppel: daarna lukt het met dezelfde code', r2.status === 200, r2.tekst);
  }

  // ---- code: aanmelding, toegang en invoer ----
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    t.aanmelding('vreemde@test.be', 'tok-vreemd');
    const zonder = await t.roep({ actie: 'code', wie: 'remi', email: 'remi@test.be' });
    check('code zonder aanmelding: 401', zonder.status === 401 && melding(zonder) === 'Niet aangemeld.' && !t.oproepen.getUser.length, zonder.tekst);
    const leeg = await t.roep({ actie: 'code', wie: 'remi', email: 'remi@test.be' }, { auth: 'Bearer ' });
    check('code met lege Authorization: 401', leeg.status === 401, leeg.tekst);
    const onbekend = await t.codeVoor('remi', 'remi@test.be', 'tok-onbekend');
    check('code met ongeldige aanmelding: 401', onbekend.status === 401 && melding(onbekend) === 'Niet aangemeld.', onbekend.tekst);
    const vreemd = await t.codeVoor('remi', 'remi@test.be', 'tok-vreemd');
    check('code door een niet-lid: 403', vreemd.status === 403 && melding(vreemd) === 'Dit account heeft geen toegang.', vreemd.tekst);
    for (const wie of ['', 'mama', 'REMI', 'remi ', undefined, null]) {
      const r = await t.codeVoor(wie, 'remi@test.be', 'tok-giulia');
      check(`code met ongeldige wie ${JSON.stringify(wie)}: 400`, r.status === 400 && melding(r) === 'Voor wie is de code?', `${r.status} ${r.tekst}`);
    }
    for (const email of ['', 'remi', 'remi@test', undefined, null, 5]) {
      const r = await t.codeVoor('remi', email, 'tok-giulia');
      check(`code met ongeldig adres ${JSON.stringify(email)}: 400`, r.status === 400 && /e-mailadres/.test(melding(r)), `${r.status} ${r.tekst}`);
    }
    check('code: bij weigering geen code bewaard', !t.tabellen.account_code.length);
    check('code: jwt zonder "Bearer " doorgegeven', t.oproepen.getUser.includes('tok-giulia') && t.oproepen.getUser.includes('tok-vreemd'));
  }
  {
    // Toegang hangt aan het account: een ander account met hetzelfde adres als een lid is geen lid.
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    const kaper = t.gebruiker('giulia@test.be');
    t.sessies.set('tok-kaper', kaper.id);
    const r = await t.codeVoor('giulia', 'kaper@test.be', 'tok-kaper');
    check('code: zelfde adres, ander account: 403', r.status === 403 && melding(r) === 'Dit account heeft geen toegang.' && !t.tabellen.account_code.length, r.tekst);
  }
  {
    // Een code voor het adres van de andere persoon wordt meteen geweigerd.
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    t.lid('remi@test.be', 'remi', 'tok-remi');
    const r = await t.codeVoor('giulia', 'Remi@Test.be', 'tok-giulia');
    check('code voor het adres van de andere persoon: 409, geen code', r.status === 409 && /al toegang als Remi/.test(melding(r)) && !t.tabellen.account_code.length, r.tekst);
    const r2 = await t.codeVoor('remi', 'remi@test.be', 'tok-giulia');
    check('code voor dezelfde persoon (wachtwoord vergeten): mag', r2.status === 200, r2.tekst);
  }

  // ---- code: door een lid, met de echte toevalsgenerator ----
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    const r = await t.codeVoor('remi', ' Remi@Test.be ', 'tok-giulia');
    const code = String(r.json?.code || '');
    check('code door een lid: 200 in formaat XXXXX-XXXXX', r.status === 200 && FORMAAT.test(code), r.tekst);
    check('code door een lid: 24 uur geldig, voor het adres in kleine letters', r.json?.verloopt === new Date(NU + DAG).toISOString() && r.json?.email === 'remi@test.be', r.tekst);
    const rij = t.tabellen.account_code[0] || {};
    check('code door een lid: één rij met de sha256-hash', t.tabellen.account_code.length === 1 && rij.code_hash === hash(code.replace('-', '')), rij);
    check('code door een lid: rij met wie, email, verloopt en aangemaakt_door', isDeepStrictEqual(Object.keys(rij).sort(), ['aangemaakt_door', 'code_hash', 'email', 'verloopt', 'wie'])
      && rij.wie === 'remi' && rij.email === 'remi@test.be' && rij.verloopt === r.json?.verloopt && rij.aangemaakt_door === 'giulia@test.be', rij);
    const opgeslagen = JSON.stringify(t.tabellen);
    check('code door een lid: de code zelf staat nergens in de database', !opgeslagen.includes(code) && !opgeslagen.includes(code.replace('-', '')) && !opgeslagen.toLowerCase().includes(code.replace('-', '').toLowerCase()));
    // Remi gebruikt de code net voor ze verloopt, in kleine letters en zonder streepje.
    t.klok.nu = NU + DAG - 1000;
    const m = await t.maak('remi@test.be', code.replace('-', '').toLowerCase());
    check('code door een lid: werkt voor een nieuw account', m.status === 200 && isDeepStrictEqual(m.json, { ok: true, wie: 'remi', nieuw: true }) && t.tabellen.toegang.some(x => x.email === 'remi@test.be' && x.wie === 'remi' && x.user_id), m.tekst);
  }
  {
    // Na 24 uur verlopen.
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    const r = await t.codeVoor('giulia', 'giulia2@test.be', 'tok-giulia');
    t.klok.nu = NU + DAG;
    const m = await t.maak('giulia2@test.be', String(r.json?.code));
    check('code: na precies 24 uur verlopen', r.status === 200 && m.status === 400 && ONGELDIG.test(melding(m)) && geenWijziging(t), m.tekst);
    t.klok.nu = NU + DAG + 1;
    const k = await t.koppel(String(r.json?.code), 'tok-giulia');
    check('code: ook koppelen lukt dan niet meer', k.status === 400, k.tekst);
  }
  {
    // Een nieuwe code voor hetzelfde adres laat de oudere meteen vervallen; codes voor andere adressen niet.
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    const ander = await t.codeVoor('giulia', 'giulia2@test.be', 'tok-giulia');
    const eerste = await t.codeVoor('remi', 'remi@test.be', 'tok-giulia');
    t.klok.nu = NU + UUR;
    const tweede = await t.codeVoor('remi', 'REMI@test.be', 'tok-giulia');
    const rijEerste = t.codeRij(String(eerste.json?.code));
    check('nieuwe code: de oudere voor hetzelfde adres vervalt meteen', tweede.status === 200 && rijEerste?.verloopt === new Date(NU + UUR).toISOString() && (rijEerste?.gebruikt_op ?? null) === null, rijEerste);
    check('nieuwe code: die voor een ander adres blijft', t.codeRij(String(ander.json?.code))?.verloopt === new Date(NU + DAG).toISOString());
    const m1 = await t.maak('remi@test.be', String(eerste.json?.code));
    check('nieuwe code: de oudere werkt niet meer', m1.status === 400 && ONGELDIG.test(melding(m1)) && geenWijziging(t), m1.tekst);
    const m2 = await t.maak('remi@test.be', String(tweede.json?.code));
    check('nieuwe code: de nieuwe werkt', m2.status === 200 && m2.json?.wie === 'remi', m2.tekst);
    const m3 = await t.maak('giulia2@test.be', String(ander.json?.code));
    check('nieuwe code: die voor het andere adres werkt ook nog', m3.status === 200 && m3.json?.wie === 'giulia', m3.tekst);
    // Een gebruikte code wordt niet meer aangepast door een nieuwe code voor hetzelfde adres.
    t.klok.nu = NU + 2 * UUR;
    await t.codeVoor('remi', 'remi@test.be', 'tok-giulia');
    check('nieuwe code: een al gebruikte code blijft zoals ze was', t.codeRij(String(tweede.json?.code))?.verloopt === new Date(NU + UUR + DAG).toISOString());
  }
  {
    const t = opzet();
    t.lid('remi@test.be', 'remi', 'tok-remi');
    const codes: string[] = [];
    for (let i = 0; i < 300; i++) codes.push(String((await t.codeVoor(i % 2 ? 'remi' : 'giulia', `adres${i}@test.be`, 'tok-remi')).json?.code));
    check('300 codes: allemaal in formaat XXXXX-XXXXX', codes.every(c => FORMAAT.test(c)), codes.find(c => !FORMAAT.test(c)));
    check('300 codes: nooit 0, O, 1 of I', !codes.some(c => /[0O1I]/.test(c)));
    const tekens = new Set(codes.join('').replace(/-/g, ''));
    check('300 codes: alle 32 tekens van het alfabet komen voor', tekens.size === ALFABET.length && [...tekens].every(x => ALFABET.includes(x)), [...tekens].sort().join(''));
    check('300 codes: allemaal verschillend', new Set(codes).size === 300);
    check('300 codes: alleen hashes bewaard', t.tabellen.account_code.length === 300 && t.tabellen.account_code.every((x, i) => /^[0-9a-f]{64}$/.test(x.code_hash) && x.code_hash === hash(codes[i].replace('-', ''))));
  }
  {
    const t = opzet(() => 'KLMNPQRSTU');
    t.lid('Giulia@Test.BE', 'giulia', 'tok-g'); // Auth geeft het adres met hoofdletters
    const r = await t.roep({ actie: 'code', wie: 'giulia', email: 'g2@test.be' }, { auth: 'bearer tok-g' });
    check('code: vaste toevalswaarde wordt KLMNP-QRSTU', r.status === 200 && r.json?.code === 'KLMNP-QRSTU' && t.tabellen.account_code[0]?.code_hash === hash('KLMNPQRSTU'), r.tekst);
    check('code: adres van de aanmelding in kleine letters', t.tabellen.account_code[0]?.aangemaakt_door === 'giulia@test.be', t.tabellen.account_code[0]);
  }

  // ---- Fouten van Supabase ----
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    t.storing.createUser = { message: 'Password should contain at least one character of each: abc, 123' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('wachtwoord geweigerd door Supabase: 400 met uitleg', r.status === 400 && /wachtwoord wordt niet aanvaard/.test(melding(r)), r.tekst);
    check('wachtwoord geweigerd: code weer vrijgegeven, geen toegang', t.tabellen.account_code[0].gebruikt_op === null && t.oproepen.claims === 1 && !t.tabellen.toegang.length);
    t.storing.createUser = null;
    const r2 = await t.maak('remi@test.be', 'ABCDE-FGHJK', 'een-beter-wachtwoord');
    check('wachtwoord geweigerd: daarna lukt het met dezelfde code', r2.status === 200 && r2.json?.nieuw === true, r2.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    t.storing.createUser = { message: 'Database error creating new user' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('andere fout bij createUser: 400 met de reden', r.status === 400 && melding(r) === 'Het account kon niet gemaakt worden (Database error creating new user).' && t.tabellen.account_code[0].gebruikt_op === null, r.tekst);
  }
  {
    const t = opzet();
    const u = t.lid('remi@test.be', 'remi', 'tok-remi');
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    t.storing.updateUserById = { message: 'Password is known to be weak' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('bestaand account, wachtwoord geweigerd: 400, code vrij, sessies blijven', r.status === 400 && /wachtwoord wordt niet aanvaard/.test(melding(r))
      && t.tabellen.account_code[0].gebruikt_op === null && t.sessies.get('tok-remi') === u.id && !t.oproepen.rpc.length, r.tekst);
  }
  {
    const t = opzet();
    const u = t.lid('remi@test.be', 'remi', 'tok-remi');
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    t.storing.rpc = { message: 'permission denied for function trek_sessies_in' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('sessies niet ingetrokken: 500 en de code blijft bruikbaar', r.status === 500 && /andere aanmeldingen/.test(melding(r)) && t.tabellen.account_code[0].gebruikt_op === null, r.tekst);
    t.storing.rpc = null;
    const r2 = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('sessies niet ingetrokken: opnieuw met dezelfde code lukt en trekt ze in', r2.status === 200 && !t.sessies.has('tok-remi') && t.oproepen.rpc.length === 2 && u.password === WW, r2.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    t.storing.listUsers = { message: 'kapot' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('accounts niet leesbaar: 500, geen account, code niet ingewisseld', r.status === 500 && melding(r) === 'Accounts konden niet gelezen worden.' && !t.oproepen.createUser.length && !t.oproepen.claims, r.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    t.storing['toegang.upsert'] = { message: 'kapot' };
    const r = await t.maak('remi@test.be', 'ABCDE-FGHJK');
    check('toegang niet bewaard: 500 en code blijft bruikbaar', r.status === 500 && melding(r) === 'De toegang kon niet bewaard worden.' && t.tabellen.account_code[0].gebruikt_op === null, r.tekst);
  }
  {
    const t = opzet();
    t.legCode('ABCDE-FGHJK', 'remi', 'remi@test.be');
    t.storing['account_code.update'] = { message: 'kapot' };
    const { r, log } = await stil(() => t.maak('remi@test.be', 'ABCDE-FGHJK'));
    check('code niet in te wisselen: 500, geen account', r.status === 500 && melding(r) === 'Er ging iets mis op de server.' && log.length === 1 && !t.oproepen.createUser.length, r.tekst);
  }
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    t.storing['account_code.insert'] = { message: 'kapot' };
    const r = await t.codeVoor('remi', 'remi@test.be', 'tok-giulia');
    check('code niet bewaard: 500 zonder code', r.status === 500 && melding(r) === 'De code kon niet gemaakt worden.' && !('code' in (r.json || {})), r.tekst);
    t.storing['account_code.insert'] = null;
    t.storing['account_code.update'] = { message: 'kapot' };
    const r2 = await t.codeVoor('remi', 'remi@test.be', 'tok-giulia');
    check('oudere codes niet te laten vervallen: 500 zonder nieuwe code', r2.status === 500 && melding(r2) === 'De code kon niet gemaakt worden.' && !t.tabellen.account_code.length, r2.tekst);
  }
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    t.storing.getUser = { message: 'netwerk weg' };
    const { r, log } = await stil(() => t.codeVoor('remi', 'remi@test.be', 'tok-giulia'));
    check('onverwachte fout: 500 met algemene melding en een logregel', r.status === 500 && melding(r) === 'Er ging iets mis op de server.' && log.length === 1 && r.headers.get('Access-Control-Allow-Origin') === '*', r.tekst);
  }
  {
    const t = opzet();
    t.lid('giulia@test.be', 'giulia', 'tok-giulia');
    t.storing['toegang.select'] = { message: 'kapot' };
    const { r, log } = await stil(() => t.codeVoor('remi', 'remi@test.be', 'tok-giulia'));
    check('toegang niet leesbaar: 500, geen code', r.status === 500 && log.length === 1 && !t.tabellen.account_code.length, r.tekst);
  }
} catch (e) {
  fouten.push('script: ' + ((e as Error)?.stack || String(e)));
}
console.log(`Geslaagd: ${geslaagd.length}`);
if (fouten.length) { console.log(`Mislukt: ${fouten.length}`); fouten.forEach(f => console.log(' - ' + f)); process.exitCode = 1; } else console.log('Alles in orde.');
