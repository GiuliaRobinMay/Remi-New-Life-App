// Test van de serverfunctie 'gmail' met een nagebootste database, opslag en Google.
// Gebruik: node --experimental-strip-types scripts/test-gmail-functie.mts
import { maakHandler, sha256, leesIdToken, verberg } from '../supabase/functions/gmail/handler.ts';

const fouten: string[] = []; const geslaagd: string[] = [];
const check = (naam: string, ok: unknown, detail = '') => (ok ? geslaagd : fouten).push(`${naam}${detail ? ': ' + detail : ''}`);

// Alleen verzonnen gegevens: deze repository is openbaar.
const SB = 'https://voorbeeld.supabase.co';
const FUNCTIE = `${SB}/functions/v1/gmail`;
const CID = '123456-test.apps.googleusercontent.com';
const GEHEIM = 'geheim-test-123';
const AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN = 'https://oauth2.googleapis.com/token';
const REVOKE = 'https://oauth2.googleapis.com/revoke';
const USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';
const SEND = 'https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media';
const SCOPE_SEND = 'https://www.googleapis.com/auth/gmail.send';
const VERLOPEN = 'Deze link is verlopen of al gebruikt. Vraag een nieuwe link.';
const HERKOPPELEN = 'De toestemming van Remi is ingetrokken of verlopen. Remi moet de koppellink opnieuw openen.';
const DUBBEL = 'Deze mail is al verstuurd of wordt nu verstuurd.';
const GEEN_TOEGANG = 'Dit account heeft geen toegang.';
const UUR = 36e5;
let klok = Date.parse('2026-11-03T10:00:00.000Z');

// ---- Nagebootste admin-client (database, aanmelding en opslag) ----
const SLEUTEL: Record<string, string> = { toegang: 'email', gmail_app: 'id', gmail_koppeling: 'id', gmail_uitnodiging: 'state', gmail_verzonden: 'sleutel' };
// Aanmeldingen: jwt -> account. 'jwt-kaper' is een ander account met hetzelfde adres als Giulia.
const GEBRUIKERS: Record<string, { id: string; email: string }> = {
  'jwt-giulia': { id: 'u-giulia', email: 'giulia@test.be' },
  'jwt-remi': { id: 'u-remi', email: 'Remi@Test.be' },
  'jwt-vreemd': { id: 'u-vreemd', email: 'iemand@test.be' },
  'jwt-kaper': { id: 'u-kaper', email: 'giulia@test.be' },
};
function maakAdmin() {
  const db: Record<string, any[]> = {
    toegang: [{ email: 'giulia@test.be', wie: 'giulia', user_id: 'u-giulia' }, { email: 'remi@test.be', wie: 'remi', user_id: 'u-remi' }],
    gmail_app: [], gmail_koppeling: [], gmail_uitnodiging: [], gmail_verzonden: [],
  };
  const opslag = new Map<string, any>();
  const s = { db, opslag, gedownload: [] as string[], verwijderd: [] as string[], gooi: false, kapot: new Set<string>(), storing: {} as Record<string, { message: string; code?: string } | null>, admin: null as any };
  function from(t: string) {
    if (!db[t]) db[t] = [];
    const filters: ((r: any) => boolean)[] = [];
    let soort = 'select'; let waarde: any = {};
    const pas = (r: any) => filters.every(f => f(r));
    const fout = (soort: string) => s.storing[`${t}.${soort}`] || null;
    const q: any = {
      select() { return q; },
      eq(k: string, v: unknown) { filters.push(r => r[k] === v); return q; },
      lt(k: string, v: any) { filters.push(r => r[k] < v); return q; },
      delete() { soort = 'delete'; return q; },
      update(w: any) { soort = 'update'; waarde = w; return q; },
      async maybeSingle() {
        if (s.kapot.has(t)) return { data: null, error: { message: 'database plat' } };
        const rijen = db[t].filter(pas);
        return rijen.length > 1 ? { data: null, error: { message: 'meer dan één rij' } } : { data: rijen[0] ? { ...rijen[0] } : null, error: null };
      },
      async upsert(rij: any) {
        if (fout('upsert')) return { data: null, error: fout('upsert') };
        const k = SLEUTEL[t]; const i = db[t].findIndex(r => r[k] === rij[k]);
        if (i >= 0) db[t][i] = { ...db[t][i], ...rij }; else db[t].push({ ...rij });
        return { data: null, error: null };
      },
      // Synchroon, dus atomair: twee gelijktijdige inserts met dezelfde sleutel geven één duplicate key.
      async insert(rij: any) {
        if (fout('insert')) return { data: null, error: fout('insert') };
        const k = SLEUTEL[t];
        if (db[t].some(r => r[k] === rij[k])) return { data: null, error: { message: 'duplicate key value violates unique constraint', code: '23505' } };
        db[t].push({ ...rij });
        return { data: null, error: null };
      },
      // delete().eq(...) en update(...).eq(...) zonder maybeSingle: pas uitvoeren bij await
      then(ok: any, nok: any) {
        if (fout(soort)) return Promise.resolve({ data: null, error: fout(soort) }).then(ok, nok);
        if (soort === 'delete') db[t] = db[t].filter(r => !pas(r));
        if (soort === 'update') db[t].filter(pas).forEach(r => Object.assign(r, waarde));
        return Promise.resolve({ data: soort === 'select' ? db[t].filter(pas) : null, error: null }).then(ok, nok);
      },
    };
    return q;
  }
  s.admin = {
    from,
    auth: {
      async getUser(jwt: string) {
        if (s.gooi) throw new Error('aanmelddienst plat');
        const u = GEBRUIKERS[jwt];
        return u ? { data: { user: { ...u } }, error: null } : { data: { user: null }, error: { message: 'invalid JWT' } };
      },
    },
    storage: {
      from(bucket: string) {
        if (bucket !== 'bijlagen') throw new Error('verkeerde bucket ' + bucket);
        return {
          async download(pad: string) { s.gedownload.push(pad); const d = opslag.get(pad); return d ? { data: d, error: null } : { data: null, error: { message: 'Object not found' } }; },
          async remove(paden: string[]) { s.verwijderd.push(...paden); for (const p of paden) opslag.delete(p); return { data: [], error: null }; },
        };
      },
    },
  };
  return s;
}

// ---- Nagebootst Google ----
type Oproep = { url: string; init: any; velden: URLSearchParams | null };
let oproepen: Oproep[] = [];
const geen = (naam: string) => () => { throw new Error(`onverwachte oproep naar ${naam}`); };
let google: Record<string, (o: Oproep) => Response | Promise<Response>> = {};
function zetGoogle(g: Record<string, (o: Oproep) => Response | Promise<Response>> = {}) {
  google = { token: geen('token'), revoke: geen('revoke'), userinfo: geen('userinfo'), send: geen('send'), ...g };
  oproepen = [];
}
async function nepFetch(url: string, init: any = {}) {
  const o: Oproep = { url: String(url), init, velden: typeof init.body === 'string' ? new URLSearchParams(init.body) : null };
  oproepen.push(o);
  if (o.url === TOKEN) return google.token(o);
  if (o.url === REVOKE) return google.revoke(o);
  if (o.url === USERINFO) return google.userinfo(o);
  if (o.url.startsWith('https://gmail.googleapis.com/')) return google.send(o);
  throw new Error('onbekende url ' + o.url);
}
const antw = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const naar = (u: string) => oproepen.filter(o => o.url === u || (u === SEND && o.url.startsWith('https://gmail.googleapis.com/')));
const idToken = (p: unknown) => ['eyJhbGciOiJSUzI1NiJ9', Buffer.from(JSON.stringify(p)).toString('base64url'), 'handtekening'].join('.');

// ---- Aanroepen; elk antwoord wordt bijgehouden om te controleren dat er nooit een geheim in staat ----
const alleAntwoorden: string[] = [];
function maak(A: ReturnType<typeof maakAdmin>, env: Record<string, unknown> = {}) {
  const h = maakHandler(A.admin, { SUPABASE_URL: SB, nu: () => klok, ...env } as never, nepFetch as never);
  return async (req: Request) => {
    const r = await h(req);
    alleAntwoorden.push((await r.clone().text()) + ' ' + JSON.stringify([...r.headers]));
    return r;
  };
}
type H = ReturnType<typeof maak>;
const post = (h: H, body: unknown, jwt = 'jwt-giulia') => h(new Request(FUNCTIE, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) }, body: JSON.stringify(body) }));
const get = (h: H, query: string) => h(new Request(`${FUNCTIE}?${query}`));
async function lees(r: Response) { const t = await r.text(); try { return { status: r.status, j: JSON.parse(t), t }; } catch { return { status: r.status, j: {} as any, t }; } }
const isTekst = (r: Response) => r.headers.get('Content-Type') === 'text/plain; charset=utf-8';
const stateUit = (link: string) => new URL(link).searchParams.get('state') || '';
let volgnr = 0;
const nieuweSleutel = () => `mail-test${++volgnr}:1`;

// Een volledige koppeling via de echte weg: link maken voor dit adres en terugkomen van Google met dat account.
async function koppelVia(h: H, email: string, refresh: string) {
  const { j } = await lees(await post(h, { actie: 'link', email }));
  const state = stateUit(j.link);
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.koppel', refresh_token: refresh, scope: `openid ${SCOPE_SEND} email`, id_token: idToken({ email }) }), revoke: () => antw(200, {}) });
  const r = await get(h, `code=${encodeURIComponent('4/koppel')}&state=${state}`);
  return r.status;
}

const origError = console.error;
const consoleFouten: unknown[] = [];
console.error = (...a: unknown[]) => { consoleFouten.push(a); };

try {
  const A = maakAdmin();
  const h = maak(A);
  zetGoogle();

  // ---- CORS en methodes ----
  let r = await h(new Request(FUNCTIE, { method: 'OPTIONS' }));
  check('OPTIONS: 200 met CORS', r.status === 200 && r.headers.get('Access-Control-Allow-Origin') === '*'
    && /authorization/.test(r.headers.get('Access-Control-Allow-Headers') || '') && /POST/.test(r.headers.get('Access-Control-Allow-Methods') || ''));
  for (const m of ['PUT', 'DELETE', 'PATCH']) {
    const x = await lees(await h(new Request(FUNCTIE, { method: m })));
    check(`${m}: 405`, x.status === 405 && x.j.message, x.t);
  }

  // ---- Aanmelding en toegang (toegang hangt aan het account, niet aan het adres) ----
  let x = await lees(await post(h, { actie: 'status' }, ''));
  check('zonder aanmelding: 401', x.status === 401 && x.j.message === 'Niet aangemeld.', x.t);
  x = await lees(await post(h, { actie: 'status' }, 'jwt-onbekend'));
  check('ongeldig token: 401', x.status === 401 && x.j.message === 'Niet aangemeld.', x.t);
  x = await lees(await post(h, { actie: 'verstuur', pad: 'uitgaand/abc.eml', sleutel: 'mail-1:1' }, ''));
  check('verstuur zonder aanmelding: 401, zeker niets verstuurd', x.status === 401 && x.j.onzeker === false, x.t);
  for (const jwt of ['jwt-vreemd', 'jwt-kaper']) {
    for (const actie of ['status', 'instellen', 'link', 'verstuur', 'ontkoppel']) {
      x = await lees(await post(h, { actie, clientId: CID, clientSecret: GEHEIM, email: 'remi@test.be', pad: 'uitgaand/abc.eml', sleutel: 'mail-1:1' }, jwt));
      check(`geen toegang (${jwt}, ${actie}): 403`, x.status === 403 && x.j.message === GEEN_TOEGANG && (actie === 'verstuur' ? x.j.onzeker === false : x.j.onzeker === undefined), x.t);
    }
  }
  check('geen toegang: niets bewaard of opgehaald', !A.db.gmail_app.length && !A.db.gmail_uitnodiging.length && !A.db.gmail_verzonden.length && !A.gedownload.length && !oproepen.length);
  x = await lees(await post(h, { actie: 'iets' }));
  check('onbekende actie: 400', x.status === 400 && x.j.message === 'Onbekende actie.', x.t);
  x = await lees(await h(new Request(FUNCTIE, { method: 'POST', headers: { Authorization: 'Bearer jwt-giulia' }, body: 'geen json' })));
  check('geen json: 400', x.status === 400, x.t);

  // ---- Status zonder instellingen ----
  x = await lees(await post(h, { actie: 'status' }));
  check('status zonder instellingen', x.status === 200 && x.j.ingesteld === false && x.j.gekoppeld === false && x.j.email === null
    && x.j.gekoppeldOp === null && x.j.clientId === null && x.j.redirectUri === FUNCTIE, x.t);
  x = await lees(await post(h, { actie: 'status' }, 'jwt-remi'));
  check('Remi (hoofdletters in adres) is lid', x.status === 200, x.t);
  const hSlash = maak(maakAdmin(), { SUPABASE_URL: SB + '/' });
  x = await lees(await post(hSlash, { actie: 'status' }));
  check('redirectUri zonder dubbele schuine streep', x.j.redirectUri === FUNCTIE, x.j.redirectUri);

  // ---- Link: het Gmail-adres is verplicht ----
  for (const email of [undefined, '', 'remi', 'remi@test', 'a b@test.be', 5]) {
    x = await lees(await post(h, { actie: 'link', email }));
    check(`link zonder geldig adres (${JSON.stringify(email)}): 400`, x.status === 400 && /Gmail-adres/.test(x.j.message), x.t);
  }
  x = await lees(await post(h, { actie: 'link', email: 'remi@test.be' }));
  check('link zonder instellingen: 412 instellen', x.status === 412 && x.j.instellen === true && x.j.message, x.t);
  check('link zonder instellingen of adres: niets bewaard', A.db.gmail_uitnodiging.length === 0);

  // ---- Instellen ----
  for (const cid of ['', 'abc', 'x.apps.googleusercontent.com.voorbeeld.be', 'a b.apps.googleusercontent.com', 'a/b.apps.googleusercontent.com', '.apps.googleusercontent.com']) {
    x = await lees(await post(h, { actie: 'instellen', clientId: cid, clientSecret: GEHEIM }));
    check(`instellen met ongeldige client-ID '${cid}': 400`, x.status === 400 && /client-ID/.test(x.j.message), x.t);
  }
  for (const geheim of ['', '   ', 'met spatie']) {
    x = await lees(await post(h, { actie: 'instellen', clientId: CID, clientSecret: geheim }));
    check(`instellen met ongeldig geheim '${geheim}': 400`, x.status === 400 && /clientgeheim/.test(x.j.message), x.t);
  }
  check('ongeldig instellen bewaart niets', A.db.gmail_app.length === 0);
  x = await lees(await post(h, { actie: 'instellen', clientId: '  ' + CID + ' ', clientSecret: ' ' + GEHEIM + ' ' }));
  check('instellen: ok', x.status === 200 && x.j.ok === true && Object.keys(x.j).length === 1, x.t);
  const appRij = A.db.gmail_app[0];
  check('instellen: bewaard (id 1, bijgesneden, door, op)', A.db.gmail_app.length === 1 && appRij.id === 1 && appRij.client_id === CID && appRij.client_secret === GEHEIM
    && appRij.ingesteld_door === 'giulia@test.be' && appRij.ingesteld_op === new Date(klok).toISOString(), JSON.stringify(appRij));
  x = await lees(await post(h, { actie: 'instellen', clientId: CID, clientSecret: GEHEIM }));
  check('opnieuw instellen: nog altijd één rij', x.status === 200 && A.db.gmail_app.length === 1);

  // ---- Status met instellingen ----
  x = await lees(await post(h, { actie: 'status' }));
  check('status met instellingen', x.status === 200 && x.j.ingesteld === true && x.j.clientId === CID && x.j.gekoppeld === false, x.t);
  check('status: geheim niet in het antwoord', !x.t.includes(GEHEIM) && !('clientSecret' in x.j) && !('client_secret' in x.j), x.t);

  // ---- De serverinstellingen (env) gaan voor ----
  const E = maakAdmin();
  const hEnv = maak(E, { GOOGLE_CLIENT_ID: 'env-789.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET: 'env-geheim-456' });
  x = await lees(await post(hEnv, { actie: 'status' }));
  check('env: ingesteld zonder databaserij', x.j.ingesteld === true && x.j.clientId === 'env-789.apps.googleusercontent.com', x.t);
  E.db.gmail_app.push({ id: 1, client_id: CID, client_secret: GEHEIM });
  x = await lees(await post(hEnv, { actie: 'status' }));
  check('env gaat voor op gmail_app', x.j.clientId === 'env-789.apps.googleusercontent.com' && !x.t.includes('env-geheim-456') && !x.t.includes(GEHEIM), x.t);
  const hHalf = maak(maakAdmin(), { GOOGLE_CLIENT_ID: 'env-789.apps.googleusercontent.com' });
  x = await lees(await post(hHalf, { actie: 'status' }));
  check('env met alleen client-ID (zonder geheim): niet ingesteld', x.j.ingesteld === false, x.t);
  {
    const { j } = await lees(await post(hEnv, { actie: 'link', email: 'remi@test.be' }));
    const st = stateUit(j.link);
    const loc = new URL((await get(hEnv, `actie=start&state=${st}`)).headers.get('Location') || 'x:');
    zetGoogle({ token: () => antw(200, { access_token: 'a', refresh_token: 'r-env', scope: SCOPE_SEND, id_token: idToken({ email: 'remi@test.be' }) }) });
    await get(hEnv, `code=c&state=${st}`);
    check('env: start en terugkomst gebruiken client-ID en geheim uit env', loc.searchParams.get('client_id') === 'env-789.apps.googleusercontent.com'
      && naar(TOKEN)[0]?.velden?.get('client_id') === 'env-789.apps.googleusercontent.com' && naar(TOKEN)[0]?.velden?.get('client_secret') === 'env-geheim-456');
  }

  // ---- Link met instellingen ----
  x = await lees(await post(h, { actie: 'link', email: ' Remi@Test.be ' }));
  const link = new URL(x.j.link || 'x:');
  const state1 = link.searchParams.get('state') || '';
  check('link: juiste adres', x.status === 200 && `${link.origin}${link.pathname}` === FUNCTIE && link.searchParams.get('actie') === 'start', x.t);
  check('link: state minstens 32 tekens, url-veilig', state1.length >= 32 && /^[A-Za-z0-9_-]+$/.test(state1), state1);
  check('link: 48 uur geldig, voor het verwachte adres', x.j.verloopt === new Date(klok + 48 * UUR).toISOString() && x.j.email === 'remi@test.be', x.t);
  const uit1 = A.db.gmail_uitnodiging[0];
  check('link: opgeslagen als hash, met maker, verwacht adres en vervaldag', A.db.gmail_uitnodiging.length === 1 && uit1.state === await sha256(state1) && uit1.state !== state1
    && uit1.aangemaakt_door === 'giulia@test.be' && uit1.aangemaakt_door_id === 'u-giulia' && uit1.verwacht_email === 'remi@test.be' && uit1.verloopt === x.j.verloopt, JSON.stringify(uit1));
  check('link: de state zelf staat niet in de database', !JSON.stringify(A.db).includes(state1));
  x = await lees(await post(h, { actie: 'link', email: 'remi@test.be' }, 'jwt-remi'));
  const state2 = stateUit(x.j.link);
  check('tweede link: andere state, door Remi', state2 !== state1 && A.db.gmail_uitnodiging.length === 2
    && A.db.gmail_uitnodiging[1].aangemaakt_door === 'remi@test.be' && A.db.gmail_uitnodiging[1].aangemaakt_door_id === 'u-remi', JSON.stringify(A.db.gmail_uitnodiging));

  // ---- Start ----
  r = await get(h, `actie=start&state=${state1}`);
  const loc = new URL(r.headers.get('Location') || 'x:');
  const p = loc.searchParams;
  check('start: 302 naar Google', r.status === 302 && `${loc.origin}${loc.pathname}` === AUTH, r.headers.get('Location') || '');
  check('start: juiste parameters', p.get('client_id') === CID && p.get('redirect_uri') === FUNCTIE && p.get('response_type') === 'code'
    && p.get('scope') === `${SCOPE_SEND} openid email` && p.get('access_type') === 'offline' && p.get('prompt') === 'consent'
    && p.get('include_granted_scopes') === 'false' && p.get('state') === state1, loc.search);
  check('start: geen geheim in de doorverwijzing', !(r.headers.get('Location') || '').includes(GEHEIM));
  check('start: state blijft geldig tot de terugkomst', A.db.gmail_uitnodiging.some(u => u.aangemaakt_door === 'giulia@test.be'));
  r = await get(h, `actie=start&state=${'A'.repeat(43)}`);
  check('start met onbekende state: 400 tekst', r.status === 400 && isTekst(r) && (await r.text()) === VERLOPEN);
  r = await get(h, 'actie=start');
  check('start zonder state: 400', r.status === 400 && isTekst(r) && (await r.text()) === VERLOPEN);
  // Verlopen: een link van 48 uur en 1 minuut geleden.
  const oudeKlok = klok;
  klok -= 48 * UUR + 60_000;
  const { j: jOud } = await lees(await post(h, { actie: 'link', email: 'remi@test.be' }));
  klok = oudeKlok;
  const stateOud = stateUit(jOud.link);
  r = await get(h, `actie=start&state=${stateOud}`);
  check('start met een link van meer dan 48 uur: 400 tekst', r.status === 400 && isTekst(r) && (await r.text()) === VERLOPEN);
  check('verlopen state wordt opgeruimd', !A.db.gmail_uitnodiging.map(u => u.state).includes(await sha256(stateOud)) && A.db.gmail_uitnodiging.length === 2, String(A.db.gmail_uitnodiging.length));
  klok += 47 * UUR;
  r = await get(h, `actie=start&state=${state1}`);
  check('start: na 47 uur nog geldig', r.status === 302);
  klok -= 47 * UUR;
  // Een link van iemand die intussen geen toegang meer heeft, werkt niet meer.
  {
    const B = maakAdmin();
    B.db.gmail_app.push({ id: 1, client_id: CID, client_secret: GEHEIM });
    const hB = maak(B);
    const { j } = await lees(await post(hB, { actie: 'link', email: 'remi@test.be' }));
    B.db.toegang = B.db.toegang.filter(t => t.user_id !== 'u-giulia');
    const rB = await get(hB, `actie=start&state=${stateUit(j.link)}`);
    const tB = await rB.text();
    check('link van iemand zonder toegang meer: 400 en opgeruimd', rB.status === 400 && isTekst(rB) && /geen toegang meer/.test(tB) && !B.db.gmail_uitnodiging.length, tB);
  }

  // ---- Terugkomst van Google met het verwachte account ----
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.test', refresh_token: '1//test-refresh', expires_in: 3599, token_type: 'Bearer',
    scope: `openid ${SCOPE_SEND} https://www.googleapis.com/auth/userinfo.email`, id_token: idToken({ email: 'Remi@Test.be', email_verified: true, name: 'Rémi' }) }) });
  r = await get(h, `code=${encodeURIComponent('4/test-code')}&state=${state1}&scope=${encodeURIComponent(SCOPE_SEND)}`);
  let t = await r.text();
  check('terugkomst: 200 tekst', r.status === 200 && isTekst(r), `${r.status} ${r.headers.get('Content-Type')}`);
  check('terugkomst: juiste melding', t === 'Gelukt. Mails uit de app vertrekken nu vanaf remi@test.be. Je mag dit venster sluiten.', t);
  const tk = naar(TOKEN)[0];
  check('terugkomst: code ingewisseld met juiste redirect_uri', naar(TOKEN).length === 1 && tk.init.method === 'POST'
    && /x-www-form-urlencoded/.test(new Headers(tk.init.headers).get('Content-Type') || '')
    && tk.velden?.get('grant_type') === 'authorization_code' && tk.velden?.get('code') === '4/test-code' && tk.velden?.get('redirect_uri') === FUNCTIE
    && tk.velden?.get('client_id') === CID && tk.velden?.get('client_secret') === GEHEIM, tk?.init?.body);
  const kop = A.db.gmail_koppeling[0];
  check('terugkomst: koppeling bewaard', A.db.gmail_koppeling.length === 1 && kop.id === 1 && kop.email === 'remi@test.be' && kop.refresh_token === '1//test-refresh'
    && kop.gekoppeld_door === 'giulia@test.be' && kop.gekoppeld_op === new Date(klok).toISOString(), JSON.stringify(kop));
  check('terugkomst: state verwijderd', !A.db.gmail_uitnodiging.map(u => u.state).includes(await sha256(state1)));
  check('terugkomst: andere link blijft', A.db.gmail_uitnodiging.map(u => u.state).includes(await sha256(state2)));
  check('terugkomst: geen userinfo nodig met id_token', naar(USERINFO).length === 0);
  zetGoogle({ token: () => antw(200, {}) });
  r = await get(h, `code=nog-eens&state=${state1}`);
  check('terugkomst met gebruikte state: 400', r.status === 400 && isTekst(r) && (await r.text()) === VERLOPEN && naar(TOKEN).length === 0);
  r = await get(h, `code=zonder-state`);
  check('terugkomst zonder state: 400', r.status === 400 && (await r.text()) === VERLOPEN && naar(TOKEN).length === 0);

  x = await lees(await post(h, { actie: 'status' }, 'jwt-remi'));
  check('status na koppelen', x.j.gekoppeld === true && x.j.email === 'remi@test.be' && x.j.gekoppeldOp === new Date(klok).toISOString(), x.t);
  check('status: geen toestemming of geheim in het antwoord', !x.t.includes('1//test-refresh') && !x.t.includes(GEHEIM), x.t);

  // ---- Terugkomst met een ander Google-account dan verwacht ----
  x = await lees(await post(h, { actie: 'link', email: 'remi@test.be' }));
  const stateAnder = stateUit(x.j.link);
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.vreemd', refresh_token: '1//vreemd', scope: `openid ${SCOPE_SEND} email`, id_token: idToken({ email: 'Iemand.Anders@test.be' }) }), revoke: () => antw(200, {}) });
  r = await get(h, `code=c-ander&state=${stateAnder}`);
  t = await r.text();
  check('ander account: 403 tekst met uitleg', r.status === 403 && isTekst(r) && /niet het verwachte Gmail-adres/.test(t) && t.includes('iemand.anders@test.be') && /niets gewijzigd/.test(t), t);
  check('ander account: verwacht adres half verborgen', t.includes(verberg('remi@test.be')) && !t.includes('remi@test.be') && verberg('remi@test.be') === 're…@test.be', t);
  check('ander account: die toestemming meteen ingetrokken', naar(REVOKE).length === 1 && naar(REVOKE)[0].velden?.get('token') === '1//vreemd' && /ingetrokken/.test(t), t);
  check('ander account: bestaande koppeling ongemoeid', A.db.gmail_koppeling.length === 1 && A.db.gmail_koppeling[0].email === 'remi@test.be' && A.db.gmail_koppeling[0].refresh_token === '1//test-refresh');
  check('ander account: de link blijft bruikbaar voor het juiste account', A.db.gmail_uitnodiging.map(u => u.state).includes(await sha256(stateAnder)));
  // Daarna kiest Remi wel het juiste account: dat lukt met dezelfde link.
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.juist', refresh_token: '1//juist', scope: `openid ${SCOPE_SEND} email`, id_token: idToken({ email: 'remi@test.be' }) }), revoke: () => antw(200, {}) });
  r = await get(h, `code=c-juist&state=${stateAnder}`);
  check('ander account: daarna het juiste account met dezelfde link', r.status === 200 && A.db.gmail_koppeling[0].refresh_token === '1//juist' && naar(REVOKE).length === 0);
  A.db.gmail_koppeling[0].refresh_token = '1//test-refresh';
  // Een link voor een nieuw adres, maar het gekozen account is het al gekoppelde: niets intrekken (anders valt die koppeling weg).
  x = await lees(await post(h, { actie: 'link', email: 'remi.nieuw@test.be' }));
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.oud', refresh_token: '1//oud-account', scope: `openid ${SCOPE_SEND} email`, id_token: idToken({ email: 'remi@test.be' }) }), revoke: () => antw(200, {}) });
  r = await get(h, `code=c-oud&state=${stateUit(x.j.link)}`);
  t = await r.text();
  check('ander account dat al gekoppeld is: 403, niets ingetrokken, koppeling blijft', r.status === 403 && naar(REVOKE).length === 0 && !/ingetrokken/.test(t)
    && A.db.gmail_koppeling[0].refresh_token === '1//test-refresh', t);

  // Zonder refresh_token
  x = await lees(await post(h, { actie: 'link', email: 'remi@test.be' }));
  const state3 = stateUit(x.j.link);
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.x', scope: SCOPE_SEND, id_token: idToken({ email: 'remi@test.be' }) }) });
  r = await get(h, `code=c3&state=${state3}`);
  check('terugkomst zonder refresh_token: duidelijke fout', r.status === 400 && isTekst(r) && (await r.text()) === 'Google gaf geen blijvende toestemming. Open de link opnieuw.');
  check('zonder refresh_token: koppeling ongewijzigd, link nog bruikbaar', A.db.gmail_koppeling[0].refresh_token === '1//test-refresh'
    && A.db.gmail_uitnodiging.map(u => u.state).includes(await sha256(state3)));

  // Zonder toestemming om te versturen
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.x', refresh_token: '1//zonder-send', scope: 'openid email', id_token: idToken({ email: 'remi@test.be' }) }), revoke: () => antw(200, {}) });
  r = await get(h, `code=c4&state=${state3}`);
  t = await r.text();
  check('terugkomst zonder gmail.send: 400', r.status === 400 && isTekst(r) && /niet aangevinkt/.test(t), t);
  check('zonder gmail.send: toestemming ingetrokken, koppeling ongewijzigd', naar(REVOKE).length === 1 && naar(REVOKE)[0].velden?.get('token') === '1//zonder-send'
    && A.db.gmail_koppeling[0].refresh_token === '1//test-refresh');

  // Google weigert de code (bv. te lang gewacht)
  zetGoogle({ token: () => antw(400, { error: 'invalid_grant', error_description: 'Bad Request' }) });
  r = await get(h, `code=c5&state=${state3}`);
  t = await r.text();
  check('code geweigerd door Google: 400 tekst', r.status === 400 && isTekst(r) && /invalid_grant/.test(t) && /opnieuw/.test(t), t);
  zetGoogle({ token: () => { throw new TypeError('fetch failed'); } });
  r = await get(h, `code=c6&state=${state3}`);
  check('Google onbereikbaar bij terugkomst: 502 tekst', r.status === 502 && isTekst(r));

  // E-mailadres via userinfo (geen id_token), een nieuw verwacht adres: de oude toestemming wordt ingetrokken.
  x = await lees(await post(h, { actie: 'link', email: 'remi.ander@test.be' }));
  zetGoogle({
    token: () => antw(200, { access_token: 'ya29.ander', refresh_token: '1//ander', scope: `${SCOPE_SEND} openid email` }),
    userinfo: () => antw(200, { email: 'Remi.Ander@test.be', email_verified: true }),
    revoke: () => antw(200, {}),
  });
  r = await get(h, `code=c7&state=${stateUit(x.j.link)}`);
  t = await r.text();
  check('e-mailadres via userinfo', r.status === 200 && t.includes('remi.ander@test.be') && new Headers(naar(USERINFO)[0]?.init?.headers).get('Authorization') === 'Bearer ya29.ander', t);
  check('nieuw adres: koppeling vervangen en oude toestemming ingetrokken', A.db.gmail_koppeling.length === 1 && A.db.gmail_koppeling[0].email === 'remi.ander@test.be'
    && A.db.gmail_koppeling[0].refresh_token === '1//ander' && naar(REVOKE).length === 1 && naar(REVOKE)[0].velden?.get('token') === '1//test-refresh');
  // Hetzelfde account opnieuw: niets intrekken (Google zou dan ook de nieuwe toestemming intrekken).
  check('zelfde account opnieuw koppelen', await koppelVia(h, 'remi.ander@test.be', '1//ander-2') === 200 && naar(REVOKE).length === 0
    && A.db.gmail_koppeling[0].refresh_token === '1//ander-2');
  // Geen e-mailadres te vinden
  x = await lees(await post(h, { actie: 'link', email: 'remi.ander@test.be' }));
  zetGoogle({ token: () => antw(200, { access_token: 'a', refresh_token: '1//zonder-adres', scope: SCOPE_SEND }), userinfo: () => antw(401, {}), revoke: () => antw(200, {}) });
  r = await get(h, `code=c8&state=${stateUit(x.j.link)}`);
  check('zonder e-mailadres: 400 en ingetrokken', r.status === 400 && /e-mailadres/.test(await r.text()) && naar(REVOKE)[0]?.velden?.get('token') === '1//zonder-adres'
    && A.db.gmail_koppeling[0].refresh_token === '1//ander-2');

  // Geweigerd bij Google
  zetGoogle();
  r = await get(h, `error=access_denied&state=${state2}`);
  t = await r.text();
  check('access_denied: 400 tekst met uitleg', r.status === 400 && isTekst(r) && /geen toestemming/.test(t) && /link opnieuw/.test(t) && !oproepen.length, t);
  r = await get(h, `error=server_error&state=${state2}`);
  check('andere fout van Google: 400 tekst', r.status === 400 && isTekst(r) && /server_error/.test(await r.text()));
  r = await get(h, '');
  check('pagina zonder parameters: 400 tekst', r.status === 400 && isTekst(r));
  check('pagina\'s: niet bewaren in een cache', r.headers.get('Cache-Control') === 'no-store');

  // id_token met accenten en zonder opvulling
  const pl = leesIdToken(idToken({ email: 'remi@test.be', name: 'Rémi Çé' }));
  check('id_token lezen (UTF-8, base64url)', pl.email === 'remi@test.be' && pl.name === 'Rémi Çé', JSON.stringify(pl));
  check('kapot id_token geeft leeg object', Object.keys(leesIdToken('abc')).length === 0 && Object.keys(leesIdToken('')).length === 0);

  // ---- Verstuur: ongeldige paden en sleutels ----
  zetGoogle();
  const ongeldig = ['', '../geheim.eml', 'uitgaand/../geheim.eml', 'uitgaand/../../etc/passwd', 'uitgaand/..%2Fx.eml', 'andere/abc.eml', 'cv/abc.eml', 'uitgaand/abc.txt',
    'uitgaand/sub/abc.eml', 'uitgaand/abc.eml\n', '/uitgaand/abc.eml', 'uitgaand/.eml', 'uitgaand/a b.eml', 'uitgaand/a_b.eml', 'UITGAAND/abc.eml', 'uitgaand/abc.EML', 'uitgaand/abc.eml.eml/x'];
  for (const pad of ongeldig) {
    x = await lees(await post(h, { actie: 'verstuur', pad, sleutel: 'mail-1:1' }));
    check(`verstuur met ongeldig pad ${JSON.stringify(pad)}: 400`, x.status === 400 && x.j.message, x.t);
  }
  for (const pad of [['uitgaand/abc.eml'], { pad: 'uitgaand/abc.eml' }, 5, null]) {
    x = await lees(await post(h, { actie: 'verstuur', pad, sleutel: 'mail-1:1' }));
    check(`verstuur met pad dat geen tekst is (${JSON.stringify(pad)}): 400`, x.status === 400, x.t);
  }
  check('ongeldige paden: niets opgehaald, verwijderd of verstuurd', !A.gedownload.length && !A.verwijderd.length && !oproepen.length);
  const PAD = 'uitgaand/3f2a9c1e-7b4d-4e2a-9f00-1234567890ab.eml';
  const mime = new Uint8Array([...new TextEncoder().encode('To: iemand@test.be\r\nSubject: =?UTF-8?B?VGVzdA==?=\r\nMIME-Version: 1.0\r\n\r\nBeste, groeten van Rémi\r\n'), 0, 255, 128, 13, 10]);
  for (const sleutel of [undefined, '', 'mail-1', 'mail-1:', ':1', 'mail 1:1', 'mail-1:x', 'mail-1:-1', 'mail-1:1\n', 'x'.repeat(201) + ':1', 5, ['mail-1:1']]) {
    A.opslag.set(PAD, new Blob([mime]));
    x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel }));
    check(`verstuur met ongeldige sleutel ${JSON.stringify(sleutel)?.slice(0, 30)}: 400, niets verstuurd`, x.status === 400 && x.j.onzeker === false && /sleutel/.test(x.j.message) && !A.opslag.has(PAD), x.t);
  }
  check('ongeldige sleutels: niets naar Google, niets vastgelegd', !oproepen.length && !A.db.gmail_verzonden.length);

  // ---- Verstuur: gelukt ----
  const S1 = 'mail-abc123:1';
  A.opslag.set(PAD, new Blob([mime], { type: 'message/rfc822' }));
  let sendRijTijdensVersturen: any = null;
  zetGoogle({
    token: o => (o.velden?.get('grant_type') === 'refresh_token' ? antw(200, { access_token: 'ya29.verstuur', expires_in: 3599, token_type: 'Bearer' }) : antw(400, { error: 'unsupported_grant_type' })),
    send: () => { sendRijTijdensVersturen = { ...A.db.gmail_verzonden.find(v => v.sleutel === S1) }; return antw(200, { id: '18c0test', threadId: '18c0draad', labelIds: ['SENT'] }); },
  });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S1 }, 'jwt-giulia'));
  check('verstuur: gelukt', x.status === 200 && x.j.id === '18c0test' && x.j.threadId === '18c0draad' && x.j.van === 'remi.ander@test.be', x.t);
  const rt = naar(TOKEN)[0];
  check('verstuur: toegangstoken met de blijvende toestemming', naar(TOKEN).length === 1 && rt.velden?.get('grant_type') === 'refresh_token'
    && rt.velden?.get('refresh_token') === '1//ander-2' && rt.velden?.get('client_id') === CID && rt.velden?.get('client_secret') === GEHEIM, rt?.init?.body);
  const sd = naar(SEND)[0];
  const sh = new Headers(sd?.init?.headers);
  check('verstuur: juiste url met uploadType=media', naar(SEND).length === 1 && sd.url === SEND && new URL(sd.url).searchParams.get('uploadType') === 'media', sd?.url);
  check('verstuur: POST, message/rfc822 en Bearer-token', sd.init.method === 'POST' && sh.get('Content-Type') === 'message/rfc822' && sh.get('Authorization') === 'Bearer ya29.verstuur');
  const verstuurd = new Uint8Array(sd.init.body);
  check('verstuur: ruwe MIME-bytes ongewijzigd', verstuurd.length === mime.length && verstuurd.every((b, i) => b === mime[i]), `${verstuurd.length} vs ${mime.length}`);
  check('verstuur: bestand opgehaald en verwijderd', A.gedownload.includes(PAD) && A.verwijderd.includes(PAD) && !A.opslag.has(PAD));
  check('verstuur: volgorde token, dan versturen', oproepen.map(o => (o.url === TOKEN ? 'token' : 'send')).join(',') === 'token,send');
  check('verstuur: vóór het versturen een rij bezig', sendRijTijdensVersturen?.status === 'bezig' && sendRijTijdensVersturen?.door === 'giulia@test.be', JSON.stringify(sendRijTijdensVersturen));
  const v1 = A.db.gmail_verzonden.find(v => v.sleutel === S1);
  check('verstuur: daarna verstuurd met het id van Gmail', A.db.gmail_verzonden.length === 1 && v1?.status === 'verstuurd' && v1?.gmail_id === '18c0test'
    && v1?.door === 'giulia@test.be' && v1?.aangemaakt_op === new Date(klok).toISOString(), JSON.stringify(v1));

  // ---- Verstuur: dezelfde sleutel nog eens (ander toestel, dubbele klik, opnieuw na een time-out) ----
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle();
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S1 }, 'jwt-remi'));
  check('zelfde sleutel: 409 dubbel met het id van Gmail', x.status === 409 && x.j.message === DUBBEL && x.j.dubbel === true && x.j.gmailId === '18c0test' && x.j.onzeker === undefined, x.t);
  check('zelfde sleutel: niets naar Google, bestand opgeruimd, rij ongewijzigd', !oproepen.length && !A.opslag.has(PAD) && A.db.gmail_verzonden.length === 1 && v1?.status === 'verstuurd');
  // Een bewuste nieuwe verzending (poging 2) mag wel.
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }), send: () => antw(200, { id: '18c0twee', threadId: '18c0draad' }) });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: 'mail-abc123:2' }));
  check('nieuwe poging (andere sleutel): verstuurd', x.status === 200 && x.j.id === '18c0twee' && A.db.gmail_verzonden.length === 2, x.t);

  // ---- Verstuur: twee verzoeken tegelijk met dezelfde sleutel ----
  {
    const S = nieuweSleutel();
    A.opslag.set('uitgaand/een.eml', new Blob([mime]));
    A.opslag.set('uitgaand/twee.eml', new Blob([mime]));
    // Beide verzoeken komen pas verder als ze allebei voorbij de eerste controle zijn (en dus nog geen rij zagen).
    let aantal = 0; let los = () => {}; const samen = new Promise<void>(res => { los = res; });
    zetGoogle({ token: async () => { if (++aantal >= 2) los(); await samen; return antw(200, { access_token: 'ya29.z' }); }, send: () => antw(200, { id: '18c0een', threadId: 'd' }) });
    const [a, b] = await Promise.all([post(h, { actie: 'verstuur', pad: 'uitgaand/een.eml', sleutel: S }), post(h, { actie: 'verstuur', pad: 'uitgaand/twee.eml', sleutel: S }, 'jwt-remi')].map(async p => lees(await p)));
    const dub = a.status === 409 ? a : b;
    check('tegelijk: beide voorbij de eerste controle', aantal === 2, String(aantal));
    check('tegelijk: één verstuurd, het andere 409 dubbel', [a.status, b.status].sort().join(',') === '200,409' && dub.j.dubbel === true && dub.j.message === DUBBEL, `${a.t} | ${b.t}`);
    check('tegelijk: maar één keer naar Gmail', naar(SEND).length === 1 && A.db.gmail_verzonden.filter(v => v.sleutel === S).length === 1, String(naar(SEND).length));
    check('tegelijk: beide bestanden opgeruimd', !A.opslag.has('uitgaand/een.eml') && !A.opslag.has('uitgaand/twee.eml'));
  }

  // ---- Verstuur: toestemming ingetrokken (invalid_grant) ----
  let S = nieuweSleutel();
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => antw(400, { error: 'invalid_grant', error_description: 'Token has been expired or revoked.' }) });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('invalid_grant: 409 herkoppelen', x.status === 409 && x.j.herkoppelen === true && x.j.onzeker === false && x.j.message === HERKOPPELEN && !x.j.dubbel, x.t);
  check('invalid_grant: niets verstuurd, koppeling weg, bestand verwijderd, niets vastgelegd', naar(SEND).length === 0 && A.db.gmail_koppeling.length === 0 && !A.opslag.has(PAD)
    && !A.db.gmail_verzonden.some(v => v.sleutel === S));
  x = await lees(await post(h, { actie: 'status' }));
  check('status na invalid_grant: niet gekoppeld', x.j.gekoppeld === false && x.j.ingesteld === true, x.t);
  // Intussen opnieuw gekoppeld: de nieuwe toestemming blijft staan.
  await koppelVia(h, 'remi@test.be', '1//nieuw');
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => { A.db.gmail_koppeling[0].refresh_token = '1//nog-nieuwer'; return antw(400, { error: 'invalid_grant' }); } });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('invalid_grant: een intussen nieuwe koppeling blijft', x.status === 409 && A.db.gmail_koppeling.length === 1 && A.db.gmail_koppeling[0].refresh_token === '1//nog-nieuwer');
  A.db.gmail_koppeling[0].refresh_token = '1//nieuw';

  // ---- Verstuur: verbinding valt weg tijdens het versturen (onzeker) ----
  S = nieuweSleutel();
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }), send: () => { throw new TypeError('connection reset'); } });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('verbinding weg tijdens versturen: 502 onzeker', x.status === 502 && x.j.onzeker === true && /niet zeker/.test(x.j.message), x.t);
  check('verbinding weg: bestand opgeruimd, rij blijft bezig', !A.opslag.has(PAD) && A.db.gmail_verzonden.find(v => v.sleutel === S)?.status === 'bezig');
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle();
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('onzeker, dan dezelfde sleutel: 409 dubbel zonder id, niets naar Google', x.status === 409 && x.j.dubbel === true && x.j.gmailId === null && !oproepen.length, x.t);

  // ---- Verstuur: HTTP-fout van Gmail (zeker niet verstuurd): de rij gaat weg ----
  S = nieuweSleutel();
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }), send: () => antw(400, { error: { code: 400, message: 'Invalid To header', status: 'INVALID_ARGUMENT', errors: [{ reason: 'invalidArgument' }] } }) });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('Gmail-HTTP-fout: 502 niet onzeker, met status en boodschap', x.status === 502 && x.j.onzeker === false && /400/.test(x.j.message) && /Invalid To header/.test(x.j.message), x.t);
  check('Gmail-HTTP-fout: de rij is weg', !A.db.gmail_verzonden.some(v => v.sleutel === S));
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }), send: () => antw(200, { id: '18c0daarna', threadId: 'd' }) });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('Gmail-HTTP-fout: daarna lukt dezelfde sleutel wel', x.status === 200 && x.j.id === '18c0daarna' && A.db.gmail_verzonden.find(v => v.sleutel === S)?.status === 'verstuurd', x.t);
  for (const [naam, status, fout, test] of [
    ['account zonder Gmail', 400, { code: 400, message: 'Mail service not enabled', status: 'FAILED_PRECONDITION', errors: [{ reason: 'failedPrecondition' }] }, /geen Gmail/],
    ['403: uitleg over toestemming of Gmail API', 403, { code: 403, message: 'Gmail API has not been used in project', status: 'PERMISSION_DENIED' }, /Gmail API/],
    ['429: even te veel', 429, { code: 429, message: 'Rate limit' }, /te veel verzoeken/],
  ] as [string, number, unknown, RegExp][]) {
    S = nieuweSleutel();
    A.opslag.set(PAD, new Blob([mime]));
    zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }), send: () => antw(status, { error: fout }) });
    x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
    check(`Gmail ${naam}`, x.status === 502 && x.j.onzeker === false && test.test(x.j.message) && x.j.message.includes(String(status)) && !A.db.gmail_verzonden.some(v => v.sleutel === S), x.t);
  }
  // Lukt het wegdoen van de rij niet, dan blijft de sleutel geblokkeerd (veilig) en komt er een logregel.
  S = nieuweSleutel();
  A.opslag.set(PAD, new Blob([mime]));
  A.storing['gmail_verzonden.delete'] = { message: 'kapot' };
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }), send: () => antw(400, { error: { code: 400, message: 'Invalid To header' } }) });
  let voorLog = consoleFouten.length;
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('rij niet weg te doen: toch 502 niet onzeker, rij blijft, logregel', x.status === 502 && x.j.onzeker === false && A.db.gmail_verzonden.some(v => v.sleutel === S) && consoleFouten.length === voorLog + 1, x.t);
  A.storing['gmail_verzonden.delete'] = null;

  // ---- Verstuur: storing bij Gmail (5xx) is onzeker: de rij blijft ----
  S = nieuweSleutel();
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }), send: () => antw(503, { error: { code: 503, message: 'Backend Error' } }) });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('Gmail-storing (5xx): 502 onzeker, rij blijft bezig', x.status === 502 && x.j.onzeker === true && /503/.test(x.j.message) && A.db.gmail_verzonden.find(v => v.sleutel === S)?.status === 'bezig', x.t);

  // ---- Verstuur: de rij kan niet vastgelegd of bijgewerkt worden ----
  S = nieuweSleutel();
  A.opslag.set(PAD, new Blob([mime]));
  A.storing['gmail_verzonden.insert'] = { message: 'database plat' };
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }) });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('niet vast te leggen: 500, zeker niet verstuurd', x.status === 500 && x.j.onzeker === false && naar(SEND).length === 0 && !A.opslag.has(PAD), x.t);
  A.storing['gmail_verzonden.insert'] = null;
  S = nieuweSleutel();
  A.opslag.set(PAD, new Blob([mime]));
  A.storing['gmail_verzonden.update'] = { message: 'database plat' };
  zetGoogle({ token: () => antw(200, { access_token: 'ya29.y' }), send: () => antw(200, { id: '18c0bijwerken', threadId: 'd' }) });
  voorLog = consoleFouten.length;
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('verstuurd maar rij niet bij te werken: toch 200, rij blijft bezig (houdt een tweede verzending tegen), logregel', x.status === 200 && x.j.id === '18c0bijwerken'
    && A.db.gmail_verzonden.find(v => v.sleutel === S)?.status === 'bezig' && consoleFouten.length === voorLog + 1, x.t);
  A.storing['gmail_verzonden.update'] = null;
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle();
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('daarna dezelfde sleutel: 409 dubbel', x.status === 409 && x.j.dubbel === true && !oproepen.length, x.t);

  // ---- Verstuur: andere fouten (vóór het versturen: niets vastgelegd) ----
  S = nieuweSleutel();
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => { throw new TypeError('fetch failed'); } });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('Google onbereikbaar voor het token: 502, zeker niet verstuurd, niets vastgelegd', x.status === 502 && x.j.onzeker === false && naar(SEND).length === 0 && !A.db.gmail_verzonden.some(v => v.sleutel === S), x.t);
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle({ token: () => antw(401, { error: 'invalid_client', error_description: 'The OAuth client was not found.' }) });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('invalid_client: 412 instellen', x.status === 412 && x.j.instellen === true && x.j.onzeker === false && A.db.gmail_koppeling.length === 1 && !A.db.gmail_verzonden.some(v => v.sleutel === S), x.t);
  zetGoogle();
  x = await lees(await post(h, { actie: 'verstuur', pad: 'uitgaand/bestaat-niet.eml', sleutel: S }));
  check('verstuur: bestand niet gevonden: 404', x.status === 404 && x.j.onzeker === false && !oproepen.length && !A.db.gmail_verzonden.some(v => v.sleutel === S), x.t);
  A.opslag.set(PAD, { size: 35 * 1024 * 1024 + 1, arrayBuffer: async () => { throw new Error('mag niet gelezen worden'); } });
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('verstuur: meer dan 35 MB: 413', x.status === 413 && x.j.onzeker === false && !oproepen.length && !A.opslag.has(PAD), x.t);
  const k = A.db.gmail_koppeling.splice(0);
  A.opslag.set(PAD, new Blob([mime]));
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('verstuur zonder koppeling: 409 herkoppelen', x.status === 409 && x.j.herkoppelen === true && x.j.onzeker === false && !x.j.dubbel && !oproepen.length && !A.opslag.has(PAD), x.t);
  A.db.gmail_koppeling.push(...k);
  const Z = maakAdmin();
  Z.opslag.set(PAD, new Blob([mime]));
  x = await lees(await post(maak(Z), { actie: 'verstuur', pad: PAD, sleutel: S }));
  check('verstuur zonder instellingen: 412 instellen', x.status === 412 && x.j.instellen === true && x.j.onzeker === false && !oproepen.length && !Z.db.gmail_verzonden.length, x.t);

  // ---- Ontkoppelen ----
  zetGoogle({ revoke: () => antw(200, {}) });
  x = await lees(await post(h, { actie: 'ontkoppel' }, 'jwt-remi'));
  check('ontkoppel: ok', x.status === 200 && x.j.ok === true, x.t);
  check('ontkoppel: ingetrokken bij Google en koppeling weg', naar(REVOKE).length === 1 && naar(REVOKE)[0].init.method === 'POST' && naar(REVOKE)[0].velden?.get('token') === '1//nieuw'
    && A.db.gmail_koppeling.length === 0);
  x = await lees(await post(h, { actie: 'status' }));
  check('status na ontkoppelen', x.j.gekoppeld === false && x.j.email === null && x.j.ingesteld === true, x.t);
  await koppelVia(h, 'remi@test.be', '1//weer');
  zetGoogle({ revoke: () => { throw new TypeError('fetch failed'); } });
  x = await lees(await post(h, { actie: 'ontkoppel' }));
  check('ontkoppel: fout bij intrekken wordt genegeerd', x.status === 200 && x.j.ok === true && A.db.gmail_koppeling.length === 0, x.t);
  zetGoogle();
  x = await lees(await post(h, { actie: 'ontkoppel' }));
  check('ontkoppel zonder koppeling: ok, niets ingetrokken', x.status === 200 && x.j.ok === true && !oproepen.length, x.t);

  // ---- Onverwachte fouten ----
  A.gooi = true;
  const voor = consoleFouten.length;
  x = await lees(await post(h, { actie: 'status' }));
  check('onverwachte fout: 500 met algemene melding', x.status === 500 && x.j.message === 'Er ging iets mis op de server.' && consoleFouten.length === voor + 1, x.t);
  A.gooi = false;
  A.kapot.add('gmail_uitnodiging');
  r = await get(h, `actie=start&state=${state2}`);
  check('onverwachte fout op een pagina: 500 tekst', r.status === 500 && isTekst(r) && (await r.text()) === 'Er ging iets mis op de server.' && consoleFouten.length === voor + 2);
  A.kapot.clear();
  A.kapot.add('gmail_app');
  x = await lees(await post(h, { actie: 'status' }));
  check('databasefout bij status: 500', x.status === 500 && x.j.message === 'Er ging iets mis op de server.', x.t);
  A.kapot.clear();
  A.kapot.add('toegang');
  x = await lees(await post(h, { actie: 'status' }));
  check('toegang niet leesbaar: 500', x.status === 500 && x.j.message === 'Er ging iets mis op de server.', x.t);
  A.kapot.clear();
  A.kapot.add('gmail_verzonden');
  A.opslag.set(PAD, new Blob([mime]));
  zetGoogle();
  x = await lees(await post(h, { actie: 'verstuur', pad: PAD, sleutel: nieuweSleutel() }));
  check('gmail_verzonden niet leesbaar: 500, niets naar Google', x.status === 500 && !oproepen.length && !A.opslag.has(PAD), x.t);
  A.kapot.clear();

  // ---- Nooit een geheim of toestemming in een antwoord ----
  const lek = alleAntwoorden.filter(a => a.includes(GEHEIM) || a.includes('env-geheim-456') || /1\/\/[\w-]+/.test(a));
  check(`geen geheim of refresh token in ${alleAntwoorden.length} antwoorden`, lek.length === 0, lek.slice(0, 2).join(' | '));
} catch (e: any) {
  fouten.push('script: ' + (e?.stack || e?.message || e));
} finally {
  console.error = origError;
}

console.log(`Geslaagd: ${geslaagd.length}`);
if (fouten.length) { console.log(`Mislukt: ${fouten.length}`); fouten.forEach(f => console.log(' - ' + f)); process.exitCode = 1; } else console.log('Alles in orde.');
