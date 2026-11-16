// Serverfunctie "gmail": mail versturen vanaf het Gmail-adres van Remi, zonder telkens bij Google aan te melden.
// Remi geeft één keer toestemming met een koppellink; de server bewaart die blijvende toestemming (refresh token)
// en verstuurt ermee, voor Giulia en voor Remi. Acties uit de app (aangemeld, met toegang):
//   POST {actie:'status'}                            -> { ingesteld, gekoppeld, email, gekoppeldOp, redirectUri, clientId }
//   POST {actie:'instellen', clientId, clientSecret} -> { ok }  (client-ID en clientgeheim uit Google Cloud)
//   POST {actie:'link', email}                       -> { link, verloopt, email }  koppellink voor Remi, 48 uur geldig
//        en alleen voor dit Gmail-adres: kiest wie de link opent een ander Google-account, dan wordt niets gekoppeld
//   POST {actie:'verstuur', pad, sleutel}            -> { id, threadId, van }  pad = uitgaand/<id>.eml in de opslag;
//        sleutel = '<mail-id>:<poging>'. Dezelfde sleutel vertrekt nooit twee keer: een tweede verzoek krijgt
//        409 { dubbel: true, gmailId, verzendStatus } (tabel gmail_verzonden, rij 'bezig' vóór het versturen).
//        verzendStatus 'verstuurd': Gmail bevestigde de verzending. 'bezig': niet bevestigd (de verzending loopt nog,
//        of een vorige poging liep onzeker af); dan is niet zeker dat de mail vertrok. Het veld heet niet 'status',
//        omdat de app (backend.js) daar de HTTP-status in zet.
//   POST {actie:'ontkoppel'}                         -> { ok }
// Pagina's voor de browser van Remi (zonder aanmelding, beveiligd met de state uit de koppellink):
//   GET ?actie=start&state=...  -> door naar Google
//   GET ?code=...&state=...     -> terug van Google: de toestemming bewaren (alleen voor het verwachte adres)
// Het clientgeheim en de toestemming komen nooit terug naar de app (tabellen zonder RLS-regels, alleen service role).

type DbFout = { message: string; code?: string } | null;
export type Admin = {
  from(t: string): any;
  auth: { getUser(jwt: string): Promise<{ data: { user: { id: string; email?: string } | null }; error: unknown }> };
  storage: {
    from(bucket: string): {
      download(pad: string): Promise<{ data: Blob | null; error: unknown }>;
      remove(paden: string[]): Promise<{ data?: unknown; error: unknown }>;
    };
  };
};
export type Omgeving = { SUPABASE_URL: string; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; nu?: () => number };
type Haal = (url: string, init?: RequestInit) => Promise<Response>;
type App = { clientId: string; clientSecret: string };
type Koppeling = { email: string; refresh_token: string; gekoppeld_op: string };
type Lid = { id: string; email: string };
type Uitnodiging = { state: string; aangemaakt_door: string; aangemaakt_door_id: string; verwacht_email: string; verloopt: string };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';
const GMAIL_SEND = 'https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media';
const SCOPE_SEND = 'https://www.googleapis.com/auth/gmail.send';
const MAX_MAIL = 35 * 1024 * 1024; // Gmail aanvaardt tot 35 MB per mail
export const GELDIG = 48 * 36e5; // een koppellink is 48 uur geldig
export const GELDIG_PAD = /^uitgaand\/[A-Za-z0-9-]+\.eml$/;
// '<mail-id>:<poging>': het id van de mail (zonder spaties of stuurtekens) en het nummer van de bewuste poging.
export const GELDIGE_SLEUTEL = /^[^\s\u0000-\u001f\u007f]{1,200}:[0-9]{1,9}$/;
const ADRES = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERLOPEN = 'Deze link is verlopen of al gebruikt. Vraag een nieuwe link.';
const HERKOPPELEN = 'De toestemming van Remi is ingetrokken of verlopen. Remi moet de koppellink opnieuw openen.';
const DUBBEL = 'Deze mail is al verstuurd of wordt nu verstuurd.';

class Fout extends Error {
  status: number;
  extra: Record<string, unknown>;
  constructor(status: number, msg: string, extra: Record<string, unknown> = {}) { super(msg); this.status = status; this.extra = extra; }
}
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } });
// Pagina's voor de browser zijn platte tekst: Supabase toont HTML uit een functie niet als pagina.
const PAGINA = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' };
const tekst = (status: number, t: string) => new Response(t, { status, headers: { ...PAGINA, 'Content-Type': 'text/plain; charset=utf-8' } });
const formulier = (velden: Record<string, string>) => ({ method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(velden).toString() });
const dbFout = (e: unknown) => (e as { message?: string })?.message || String(e);
// Een adres half verbergen op een pagina die iedereen met de link ziet: re…@voorbeeld.be
export const verberg = (e: string) => { const [naam, domein] = String(e).split('@'); return `${naam.slice(0, 2)}…@${domein || ''}`; };

export async function sha256(t: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
}
const base64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// De inhoud van het id_token van Google. De handtekening nakijken is niet nodig: het komt rechtstreeks van Google (TLS).
export function leesIdToken(t: string): Record<string, unknown> {
  try {
    const d = String(t).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(d + '='.repeat((4 - d.length % 4) % 4)), c => c.charCodeAt(0));
    const p = JSON.parse(new TextDecoder().decode(bytes));
    return p && typeof p === 'object' ? p : {};
  } catch { return {}; }
}

export function maakHandler(admin: Admin, env: Omgeving, fetchFn: Haal) {
  const nu = env.nu || (() => Date.now());
  const redirectUri = `${String(env.SUPABASE_URL || '').replace(/\/+$/, '')}/functions/v1/gmail`;

  // Toegang hangt aan het account (toegang.user_id), niet aan het e-mailadres.
  async function heeftToegang(userId: string) {
    const { data, error } = await admin.from('toegang').select('wie').eq('user_id', userId).maybeSingle();
    if (error) throw new Error(`toegang lezen: ${dbFout(error)}`);
    return !!data;
  }
  async function lid(req: Request): Promise<Lid> {
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!jwt) throw new Fout(401, 'Niet aangemeld.');
    const { data } = await admin.auth.getUser(jwt);
    const u = data?.user;
    if (!u?.id) throw new Fout(401, 'Niet aangemeld.');
    if (!(await heeftToegang(u.id))) throw new Fout(403, 'Dit account heeft geen toegang.');
    return { id: u.id, email: (u.email || '').toLowerCase() };
  }

  async function rij(tabel: string, velden: string) {
    const { data, error } = await admin.from(tabel).select(velden).eq('id', 1).maybeSingle();
    if (error) throw new Error(`${tabel} lezen: ${dbFout(error)}`);
    return data;
  }
  // Client-ID en geheim: de serverinstellingen (env) gaan voor op wat in de app ingesteld werd.
  async function app(): Promise<App | null> {
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) return { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
    const r = await rij('gmail_app', 'client_id, client_secret');
    return r?.client_id && r?.client_secret ? { clientId: r.client_id, clientSecret: r.client_secret } : null;
  }
  const koppeling = async (): Promise<Koppeling | null> => (await rij('gmail_koppeling', 'email, refresh_token, gekoppeld_op')) || null;
  const nodigApp = async () => {
    const a = await app();
    if (!a) throw new Fout(412, 'Stel eerst de Google client-ID en het clientgeheim in.', { instellen: true });
    return a;
  };
  // Een toestemming intrekken bij Google; lukt dat niet, dan is dat niet erg.
  async function intrekken(token: string) {
    try { await fetchFn(GOOGLE_REVOKE, formulier({ token })); } catch { /* niet erg */ }
  }

  // ---------- Acties uit de app ----------
  async function status() {
    const [a, k] = await Promise.all([app(), koppeling()]);
    return json(200, { ingesteld: !!a, gekoppeld: !!k, email: k?.email || null, gekoppeldOp: k?.gekoppeld_op || null, redirectUri, clientId: a?.clientId || null });
  }

  async function instellen(door: Lid, body: Record<string, unknown>) {
    const clientId = String(body.clientId || '').trim();
    const clientSecret = String(body.clientSecret || '').trim();
    if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) throw new Fout(400, 'Vul een geldige client-ID in (die eindigt op .apps.googleusercontent.com).');
    if (!clientSecret || /\s/.test(clientSecret) || clientSecret.length > 500) throw new Fout(400, 'Vul het clientgeheim in.');
    // Een toestemming die bij een vorige client-ID hoort, valt bij het volgende versturen vanzelf weg (herkoppelen).
    const { error } = await admin.from('gmail_app').upsert({ id: 1, client_id: clientId, client_secret: clientSecret, ingesteld_door: door.email, ingesteld_op: new Date(nu()).toISOString() });
    if (error) throw new Fout(500, 'De instellingen konden niet bewaard worden.');
    return json(200, { ok: true });
  }

  async function link(door: Lid, body: Record<string, unknown>) {
    const verwacht = String(body.email || '').trim().toLowerCase();
    if (!ADRES.test(verwacht)) throw new Fout(400, 'Vul het Gmail-adres van Remi in: alleen dat adres kan met de koppellink gekoppeld worden.');
    await nodigApp();
    const b = new Uint8Array(32);
    crypto.getRandomValues(b);
    const state = base64url(b); // 43 tekens; in de database staat alleen de hash
    const verloopt = new Date(nu() + GELDIG).toISOString();
    await admin.from('gmail_uitnodiging').delete().lt('verloopt', new Date(nu()).toISOString()); // verlopen links opruimen
    const { error } = await admin.from('gmail_uitnodiging').insert({ state: await sha256(state), aangemaakt_door: door.email, aangemaakt_door_id: door.id, verwacht_email: verwacht, verloopt });
    if (error) throw new Fout(500, 'De koppellink kon niet gemaakt worden.');
    return json(200, { link: `${redirectUri}?actie=start&state=${encodeURIComponent(state)}`, verloopt, email: verwacht });
  }

  // Een kortlopend toegangstoken met de blijvende toestemming van Remi.
  async function toegangstoken(a: App, k: Koppeling) {
    let r: Response;
    try {
      r = await fetchFn(GOOGLE_TOKEN, formulier({ grant_type: 'refresh_token', refresh_token: k.refresh_token, client_id: a.clientId, client_secret: a.clientSecret }));
    } catch {
      throw new Fout(502, 'Google is niet bereikbaar. Er is niets verstuurd; probeer straks opnieuw.', { onzeker: false });
    }
    const t = await r.json().catch(() => ({}));
    if (r.ok && t.access_token) return String(t.access_token);
    if (t.error === 'invalid_grant' || t.error === 'unauthorized_client') {
      // Deze toestemming werkt niet meer; alleen weghalen als intussen niet opnieuw gekoppeld werd.
      await admin.from('gmail_koppeling').delete().eq('id', 1).eq('refresh_token', k.refresh_token);
      throw new Fout(409, HERKOPPELEN, { herkoppelen: true });
    }
    if (t.error === 'invalid_client') throw new Fout(412, 'Google aanvaardt de client-ID of het clientgeheim niet. Stel ze opnieuw in. Er is niets verstuurd.', { instellen: true });
    throw new Fout(502, `Google gaf geen toegang om te versturen (code ${r.status}${t.error ? `, ${t.error}` : ''}). Er is niets verstuurd.`, { onzeker: false });
  }

  // ---------- Elke verzending één keer (gmail_verzonden) ----------
  async function verzonden(sleutel: string): Promise<{ status: string; gmail_id: string | null } | null> {
    const { data, error } = await admin.from('gmail_verzonden').select('status, gmail_id').eq('sleutel', sleutel).maybeSingle();
    if (error) throw new Error(`gmail_verzonden lezen: ${dbFout(error)}`);
    return data || null;
  }
  // Zonder rij (net vrijgegeven na een geweigerde poging) of met een rij 'bezig' is niets bevestigd: 'bezig'.
  const dubbel = (v: { status?: string; gmail_id?: string | null } | null) => new Fout(409, DUBBEL, {
    dubbel: true, gmailId: v?.gmail_id || null, verzendStatus: v?.status === 'verstuurd' ? 'verstuurd' : 'bezig',
  });
  // Zeker niet verstuurd: de rij weg, zodat dezelfde sleutel opnieuw mag. Lukt dat niet, dan blijft de sleutel geblokkeerd
  // (veilig: de app verhoogt de poging pas bij een bewuste nieuwe verzending).
  async function vrijgeven(sleutel: string) {
    try {
      const { error } = await admin.from('gmail_verzonden').delete().eq('sleutel', sleutel).eq('status', 'bezig');
      if (error) console.error('gmail_verzonden vrijgeven:', dbFout(error));
    } catch (e) { console.error('gmail_verzonden vrijgeven:', e); }
  }

  async function verstuur(door: Lid, body: Record<string, unknown>) {
    const pad = typeof body.pad === 'string' ? body.pad : '';
    if (!GELDIG_PAD.test(pad)) throw new Fout(400, 'Ongeldig pad voor de mail.');
    const opslag = admin.storage.from('bijlagen');
    try {
      const sleutel = typeof body.sleutel === 'string' ? body.sleutel : '';
      if (!GELDIGE_SLEUTEL.test(sleutel)) throw new Fout(400, 'De mail heeft geen geldige sleutel. Er is niets verstuurd.', { onzeker: false });
      // Al verstuurd of nu bezig (een ander toestel, een dubbele klik): meteen stoppen, zonder Google.
      const al = await verzonden(sleutel);
      if (al) throw dubbel(al);
      const a = await nodigApp();
      const k = await koppeling();
      if (!k) throw new Fout(409, 'Er is nog geen Gmail-adres gekoppeld. Remi moet eerst de koppellink openen.', { herkoppelen: true });
      const { data, error } = await opslag.download(pad);
      if (error || !data) throw new Fout(404, 'De klaargezette mail werd niet gevonden. Probeer opnieuw; er is niets verstuurd.');
      if (data.size > MAX_MAIL) throw new Fout(413, 'De mail is groter dan 35 MB. Maak de bijlagen kleiner; er is niets verstuurd.');
      const mime = new Uint8Array(await data.arrayBuffer());
      const token = await toegangstoken(a, k);
      // Vlak voor het versturen vastleggen dat deze verzending bezig is; bestaat de sleutel al, dan was iemand ons voor.
      const { error: eb } = await admin.from('gmail_verzonden').insert({ sleutel, status: 'bezig', door: door.email, aangemaakt_op: new Date(nu()).toISOString() });
      if (eb) {
        if ((eb as DbFout)?.code === '23505' || /duplicate/i.test(dbFout(eb))) throw dubbel(await verzonden(sleutel));
        throw new Fout(500, 'De verzending kon niet vastgelegd worden. Er is niets verstuurd; probeer opnieuw.', { onzeker: false });
      }
      let r: Response;
      try {
        r = await fetchFn(GMAIL_SEND, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'message/rfc822' }, body: mime });
      } catch {
        // Onzeker: de rij blijft 'bezig', dus dezelfde sleutel vertrekt niet nog eens.
        throw new Fout(502, 'De verbinding met Gmail viel weg tijdens het versturen. Het is niet zeker of de mail vertrokken is. Kijk in Gmail bij Verzonden voor je opnieuw verstuurt.', { onzeker: true });
      }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const google = String(j?.error?.message || '').slice(0, 300);
        const code = `code ${r.status}${google ? `: ${google}` : ''}`;
        // Een storing bij Gmail zelf: misschien is de mail toch vertrokken. De rij blijft 'bezig'.
        if (r.status >= 500) throw new Fout(502, `Gmail gaf een storing (${code}). Het is niet zeker of de mail vertrokken is. Kijk in Gmail bij Verzonden voor je opnieuw verstuurt.`, { onzeker: true });
        // Gmail weigerde de mail: zeker niet verstuurd, dus dezelfde sleutel mag opnieuw.
        await vrijgeven(sleutel);
        const reden = `${j?.error?.status || ''} ${google} ${(j?.error?.errors || []).map((e: { reason?: string }) => e?.reason || '').join(' ')}`;
        const uitleg = /failedPrecondition|mail service not enabled/i.test(reden) ? 'Dit Google-account heeft geen Gmail. '
          : r.status === 403 ? 'De toestemming om te versturen ontbreekt, of de Gmail API staat niet aan in het Google Cloud-project. '
          : r.status === 413 ? 'De mail is te groot voor Gmail; maak de bijlagen kleiner. '
          : r.status === 429 ? 'Even te veel verzoeken bij Gmail; probeer over een minuut opnieuw. ' : '';
        throw new Fout(502, `Gmail weigerde de mail (${code}). ${uitleg}Er is niets verstuurd.`, { onzeker: false });
      }
      const id = String(j?.id || '');
      const { error: ev } = await admin.from('gmail_verzonden').update({ status: 'verstuurd', gmail_id: id || null }).eq('sleutel', sleutel);
      // De mail is vertrokken; lukt het bijwerken niet, dan blijft de rij 'bezig' en houdt ze een tweede verzending tegen.
      if (ev) console.error('gmail_verzonden bijwerken:', dbFout(ev));
      return json(200, { id, threadId: String(j?.threadId || ''), van: k.email });
    } finally {
      // De klaargezette mail wordt nooit opnieuw gebruikt (elke poging zet een nieuwe klaar): altijd opruimen.
      try { await opslag.remove([pad]); } catch { /* niet erg */ }
    }
  }

  async function ontkoppel() {
    const k = await koppeling();
    if (k?.refresh_token) await intrekken(k.refresh_token);
    const { error } = await admin.from('gmail_koppeling').delete().eq('id', 1);
    if (error) throw new Fout(500, 'De koppeling kon niet verwijderd worden.');
    return json(200, { ok: true });
  }

  // ---------- Pagina's voor de browser van Remi ----------
  async function uitnodiging(state: string): Promise<Uitnodiging | null> {
    if (state.length < 32 || state.length > 200) return null;
    const hash = await sha256(state);
    const { data, error } = await admin.from('gmail_uitnodiging').select('state, aangemaakt_door, aangemaakt_door_id, verwacht_email, verloopt').eq('state', hash).maybeSingle();
    if (error) throw new Error(`gmail_uitnodiging lezen: ${dbFout(error)}`);
    if (!data) return null;
    const weg = async () => { await admin.from('gmail_uitnodiging').delete().eq('state', hash); };
    if (!(Date.parse(data.verloopt) > nu()) || !data.verwacht_email || !data.aangemaakt_door_id) { await weg(); return null; }
    // Wie de link maakte, moet nog toegang hebben.
    if (!(await heeftToegang(data.aangemaakt_door_id))) {
      await weg();
      throw new Fout(400, 'Deze link is niet meer geldig: wie hem maakte, heeft geen toegang meer tot de app. Vraag een nieuwe link.');
    }
    return data as Uitnodiging;
  }
  const nietIngesteld = () => new Fout(400, 'Gmail is nog niet ingesteld in de app: de Google client-ID ontbreekt. Vraag een nieuwe link als dat in orde is.');

  async function start(state: string) {
    if (!(await uitnodiging(state))) throw new Fout(400, VERLOPEN);
    const a = await app();
    if (!a) throw nietIngesteld();
    const q = new URLSearchParams({
      client_id: a.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: `${SCOPE_SEND} openid email`,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'false',
      state,
    });
    return new Response(null, { status: 302, headers: { ...PAGINA, Location: `${GOOGLE_AUTH}?${q}` } });
  }

  async function terug(code: string, state: string) {
    const u = await uitnodiging(state);
    if (!u) throw new Fout(400, VERLOPEN);
    const a = await app();
    if (!a) throw nietIngesteld();
    let r: Response;
    try {
      r = await fetchFn(GOOGLE_TOKEN, formulier({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: a.clientId, client_secret: a.clientSecret }));
    } catch {
      throw new Fout(502, 'Google is niet bereikbaar. Open de link straks opnieuw.');
    }
    const t = await r.json().catch(() => ({}));
    if (!r.ok || !t.access_token) throw new Fout(400, `Google aanvaardde de toestemming niet${t.error ? ` (${t.error})` : ''}. Open de link opnieuw.`);
    if (!t.refresh_token) throw new Fout(400, 'Google gaf geen blijvende toestemming. Open de link opnieuw.');
    // Zonder toestemming om te versturen heeft de koppeling geen zin: meteen weer intrekken.
    if (!String(t.scope || '').split(/\s+/).includes(SCOPE_SEND)) {
      await intrekken(String(t.refresh_token));
      throw new Fout(400, 'De toestemming om e-mail te versturen werd niet aangevinkt. Open de link opnieuw en vink ze aan.');
    }
    let email = String(leesIdToken(String(t.id_token || '')).email || '');
    if (!email) {
      try {
        const i = await fetchFn(GOOGLE_USERINFO, { headers: { Authorization: `Bearer ${t.access_token}` } });
        if (i.ok) email = String((await i.json()).email || '');
      } catch { /* hieronder gemeld */ }
    }
    email = email.trim().toLowerCase();
    if (!email) {
      await intrekken(String(t.refresh_token));
      throw new Fout(400, 'Het e-mailadres van het Google-account kon niet gelezen worden. Open de link opnieuw.');
    }
    const oud = await koppeling();
    if (email !== u.verwacht_email) {
      // Een ander Google-account dan gevraagd: niets koppelen en deze toestemming meteen intrekken. Behalve als het het
      // al gekoppelde account is: dan zou Google ook die toestemming intrekken, en die blijft ongemoeid.
      const ingetrokken = email !== oud?.email;
      if (ingetrokken) await intrekken(String(t.refresh_token));
      throw new Fout(403, `Dit is niet het verwachte Gmail-adres. Je koos ${email}, maar deze link is alleen voor ${verberg(u.verwacht_email)}. `
        + `Er is niets gewijzigd: een bestaande koppeling blijft zoals ze was${ingetrokken ? ', en de toestemming van ' + email + ' is meteen weer ingetrokken' : ''}. `
        + 'Open de link opnieuw en kies het juiste Gmail-account.');
    }
    const { error } = await admin.from('gmail_koppeling').upsert({ id: 1, email, refresh_token: String(t.refresh_token), gekoppeld_op: new Date(nu()).toISOString(), gekoppeld_door: u.aangemaakt_door });
    if (error) throw new Error(`gmail_koppeling bewaren: ${dbFout(error)}`);
    // Een ander Google-account dan voorheen: de oude toestemming intrekken (bij hetzelfde account niet,
    // want dan trekt Google ook de nieuwe in).
    if (oud?.refresh_token && oud.email !== email) await intrekken(oud.refresh_token);
    await admin.from('gmail_uitnodiging').delete().eq('state', u.state);
    return tekst(200, `Gelukt. Mails uit de app vertrekken nu vanaf ${email}. Je mag dit venster sluiten.`);
  }

  async function pagina(p: URLSearchParams) {
    if (p.get('actie') === 'start') return await start(p.get('state') || '');
    const fout = p.get('error');
    if (fout === 'access_denied') throw new Fout(400, 'Er werd geen toestemming gegeven, dus de app kan nog geen mail versturen vanaf dit Gmail-adres. Wil je toch koppelen? Open de link opnieuw, kies je Gmail-account en vink de toestemming aan om e-mail te versturen.');
    if (fout) throw new Fout(400, `Google meldde een fout (${fout.slice(0, 100)}). Open de link opnieuw.`);
    if (p.get('code')) return await terug(p.get('code') || '', p.get('state') || '');
    throw new Fout(400, 'Deze pagina hoort bij de Gmail-koppeling van de app. Open de koppellink die je kreeg.');
  }

  return async function handler(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method === 'GET') {
      try {
        return await pagina(new URL(req.url).searchParams);
      } catch (e) {
        if (e instanceof Fout) return tekst(e.status, e.message);
        console.error(e);
        return tekst(500, 'Er ging iets mis op de server.');
      }
    }
    if (req.method !== 'POST') return json(405, { message: 'Niet toegestaan.' });
    let versturen = false;
    try {
      const body = (await req.json().catch(() => null)) || {};
      versturen = body.actie === 'verstuur';
      const door = await lid(req);
      if (body.actie === 'status') return await status();
      if (body.actie === 'instellen') return await instellen(door, body);
      if (body.actie === 'link') return await link(door, body);
      if (body.actie === 'verstuur') return await verstuur(door, body);
      if (body.actie === 'ontkoppel') return await ontkoppel();
      throw new Fout(400, 'Onbekende actie.');
    } catch (e) {
      if (e instanceof Fout) {
        // Bij versturen zegt elk antwoord of de mail misschien vertrok. Een fout zonder onzeker (niet aangemeld, geen
        // toegang, toestemming of instellingen ontbreken, mail niet gevonden of te groot) valt altijd vóór de rij in
        // gmail_verzonden en vóór Gmail: zeker niets verstuurd.
        const zeker = versturen && e.extra.onzeker === undefined && !e.extra.dubbel ? { onzeker: false } : {};
        return json(e.status, { message: e.message, ...zeker, ...e.extra });
      }
      console.error(e);
      return json(500, { message: 'Er ging iets mis op de server.' });
    }
  };
}
