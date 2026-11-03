// Serverfunctie "gmail": mail versturen vanaf het Gmail-adres van Remi, zonder telkens bij Google aan te melden.
// Remi geeft één keer toestemming met een koppellink; de server bewaart die blijvende toestemming (refresh token)
// en verstuurt ermee, voor Giulia en voor Remi. Acties uit de app (aangemeld, met toegang):
//   POST {actie:'status'}                            -> { ingesteld, gekoppeld, email, gekoppeldOp, redirectUri, clientId }
//   POST {actie:'instellen', clientId, clientSecret} -> { ok }  (client-ID en clientgeheim uit Google Cloud)
//   POST {actie:'link'}                              -> { link, verloopt }  koppellink voor Remi, 7 dagen geldig
//   POST {actie:'verstuur', pad}                     -> { id, threadId, van }  pad = uitgaand/<id>.eml in de opslag
//   POST {actie:'ontkoppel'}                         -> { ok }
// Pagina's voor de browser van Remi (zonder aanmelding, beveiligd met de state uit de koppellink):
//   GET ?actie=start&state=...  -> door naar Google
//   GET ?code=...&state=...     -> terug van Google: de toestemming bewaren
// Het clientgeheim en de toestemming komen nooit terug naar de app (tabellen zonder RLS-regels, alleen service role).

export type Admin = {
  from(t: string): any;
  auth: { getUser(jwt: string): Promise<{ data: { user: { email?: string } | null }; error: unknown }> };
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
const GELDIG = 7 * 864e5;
export const GELDIG_PAD = /^uitgaand\/[A-Za-z0-9-]+\.eml$/;
const VERLOPEN = 'Deze link is verlopen of al gebruikt. Vraag een nieuwe link.';
const HERKOPPELEN = 'De toestemming van Remi is ingetrokken of verlopen. Remi moet de koppellink opnieuw openen.';

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

  async function lid(req: Request) {
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!jwt) throw new Fout(401, 'Niet aangemeld.');
    const { data } = await admin.auth.getUser(jwt);
    const email = (data?.user?.email || '').toLowerCase();
    if (!email) throw new Fout(401, 'Niet aangemeld.');
    const { data: t } = await admin.from('toegang').select('wie').eq('email', email).maybeSingle();
    if (!t) throw new Fout(403, 'Dit adres heeft geen toegang.');
    return email;
  }

  async function rij(tabel: string, velden: string) {
    const { data, error } = await admin.from(tabel).select(velden).eq('id', 1).maybeSingle();
    if (error) throw new Error(`${tabel} lezen: ${(error as { message?: string }).message || error}`);
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

  async function instellen(door: string, body: Record<string, unknown>) {
    const clientId = String(body.clientId || '').trim();
    const clientSecret = String(body.clientSecret || '').trim();
    if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) throw new Fout(400, 'Vul een geldige client-ID in (die eindigt op .apps.googleusercontent.com).');
    if (!clientSecret || /\s/.test(clientSecret) || clientSecret.length > 500) throw new Fout(400, 'Vul het clientgeheim in.');
    // Een toestemming die bij een vorige client-ID hoort, valt bij het volgende versturen vanzelf weg (herkoppelen).
    const { error } = await admin.from('gmail_app').upsert({ id: 1, client_id: clientId, client_secret: clientSecret, ingesteld_door: door, ingesteld_op: new Date(nu()).toISOString() });
    if (error) throw new Fout(500, 'De instellingen konden niet bewaard worden.');
    return json(200, { ok: true });
  }

  async function link(door: string) {
    await nodigApp();
    const b = new Uint8Array(32);
    crypto.getRandomValues(b);
    const state = base64url(b); // 43 tekens; in de database staat alleen de hash
    const verloopt = new Date(nu() + GELDIG).toISOString();
    await admin.from('gmail_uitnodiging').delete().lt('verloopt', new Date(nu()).toISOString()); // verlopen links opruimen
    const { error } = await admin.from('gmail_uitnodiging').insert({ state: await sha256(state), aangemaakt_door: door, verloopt });
    if (error) throw new Fout(500, 'De koppellink kon niet gemaakt worden.');
    return json(200, { link: `${redirectUri}?actie=start&state=${encodeURIComponent(state)}`, verloopt });
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

  async function verstuur(body: Record<string, unknown>) {
    const pad = typeof body.pad === 'string' ? body.pad : '';
    if (!GELDIG_PAD.test(pad)) throw new Fout(400, 'Ongeldig pad voor de mail.');
    const opslag = admin.storage.from('bijlagen');
    try {
      const a = await nodigApp();
      const k = await koppeling();
      if (!k) throw new Fout(409, 'Er is nog geen Gmail-adres gekoppeld. Remi moet eerst de koppellink openen.', { herkoppelen: true });
      const { data, error } = await opslag.download(pad);
      if (error || !data) throw new Fout(404, 'De klaargezette mail werd niet gevonden. Probeer opnieuw; er is niets verstuurd.');
      if (data.size > MAX_MAIL) throw new Fout(413, 'De mail is groter dan 35 MB. Maak de bijlagen kleiner; er is niets verstuurd.');
      const mime = new Uint8Array(await data.arrayBuffer());
      const token = await toegangstoken(a, k);
      let r: Response;
      try {
        r = await fetchFn(GMAIL_SEND, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'message/rfc822' }, body: mime });
      } catch {
        throw new Fout(502, 'De verbinding met Gmail viel weg tijdens het versturen. Het is niet zeker of de mail vertrokken is. Kijk in Gmail bij Verzonden voor je opnieuw verstuurt.', { onzeker: true });
      }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const google = String(j?.error?.message || '').slice(0, 300);
        const code = `code ${r.status}${google ? `: ${google}` : ''}`;
        // Een storing bij Gmail zelf: misschien is de mail toch vertrokken.
        if (r.status >= 500) throw new Fout(502, `Gmail gaf een storing (${code}). Het is niet zeker of de mail vertrokken is. Kijk in Gmail bij Verzonden voor je opnieuw verstuurt.`, { onzeker: true });
        const reden = `${j?.error?.status || ''} ${google} ${(j?.error?.errors || []).map((e: { reason?: string }) => e?.reason || '').join(' ')}`;
        const uitleg = /failedPrecondition|mail service not enabled/i.test(reden) ? 'Dit Google-account heeft geen Gmail. '
          : r.status === 403 ? 'De toestemming om te versturen ontbreekt, of de Gmail API staat niet aan in het Google Cloud-project. '
          : r.status === 413 ? 'De mail is te groot voor Gmail; maak de bijlagen kleiner. '
          : r.status === 429 ? 'Even te veel verzoeken bij Gmail; probeer over een minuut opnieuw. ' : '';
        throw new Fout(502, `Gmail weigerde de mail (${code}). ${uitleg}Er is niets verstuurd.`, { onzeker: false });
      }
      return json(200, { id: String(j?.id || ''), threadId: String(j?.threadId || ''), van: k.email });
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
  async function uitnodiging(state: string) {
    if (state.length < 32 || state.length > 200) return null;
    const hash = await sha256(state);
    const { data, error } = await admin.from('gmail_uitnodiging').select('state, aangemaakt_door, verloopt').eq('state', hash).maybeSingle();
    if (error) throw new Error(`gmail_uitnodiging lezen: ${(error as { message?: string }).message || error}`);
    if (!data) return null;
    if (!(Date.parse(data.verloopt) > nu())) { await admin.from('gmail_uitnodiging').delete().eq('state', hash); return null; }
    return data as { state: string; aangemaakt_door: string; verloopt: string };
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
    const { error } = await admin.from('gmail_koppeling').upsert({ id: 1, email, refresh_token: String(t.refresh_token), gekoppeld_op: new Date(nu()).toISOString(), gekoppeld_door: u.aangemaakt_door });
    if (error) throw new Error(`gmail_koppeling bewaren: ${error.message || error}`);
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
    try {
      const door = await lid(req);
      const body = (await req.json().catch(() => null)) || {};
      if (body.actie === 'status') return await status();
      if (body.actie === 'instellen') return await instellen(door, body);
      if (body.actie === 'link') return await link(door);
      if (body.actie === 'verstuur') return await verstuur(body);
      if (body.actie === 'ontkoppel') return await ontkoppel();
      throw new Fout(400, 'Onbekende actie.');
    } catch (e) {
      if (e instanceof Fout) return json(e.status, { message: e.message, ...e.extra });
      console.error(e);
      return json(500, { message: 'Er ging iets mis op de server.' });
    }
  };
}
