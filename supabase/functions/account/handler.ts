// Serverfunctie "account": toegang tot de app geven met een eenmalige toegangscode die bij één e-mailadres hoort.
// Zo hoeft niemand iets in te stellen in Supabase en komen er geen aanmeldmails aan te pas:
//   POST {actie:'code', wie, email}  (aangemeld, met toegang) -> { code, verloopt, email }: 24 uur geldig, alleen
//        voor dat adres; oudere ongebruikte codes voor hetzelfde adres vervallen meteen
//   POST {actie:'maak', email, wachtwoord, code}  -> een nieuw account met dit wachtwoord, en toegang als 'remi' of
//        'giulia'. Heeft het account met dit adres al toegang (wachtwoord vergeten), dan krijgt het een nieuw wachtwoord
//        en vervallen al zijn aanmeldingen. Een account met dit adres zonder toegang wordt nooit overgenomen: het wordt
//        verwijderd en vervangen door een nieuw account (nieuw id, dus elk oud toegangstoken is waardeloos)
//   POST {actie:'koppel', code}  (aangemeld, nog zonder toegang) -> toegang voor dit account, zonder wachtwoord
// Toegang hangt aan het account (toegang.user_id), niet aan het e-mailadres. Een bestaande toegang krijgt nooit een
// andere 'wie'. De codes staan alleen als hash in de database (tabel account_code, niet leesbaar voor de app).

type DbFout = { message: string; code?: string } | null;
type Gebruiker = { id: string; email?: string };
export type Admin = {
  from(t: string): any;
  rpc(f: string, args: Record<string, unknown>): PromiseLike<{ data?: unknown; error: DbFout }>;
  auth: {
    getUser(jwt: string): Promise<{ data: { user: Gebruiker | null }; error: unknown }>;
    admin: {
      listUsers(o: { page: number; perPage: number }): Promise<{ data: { users: Gebruiker[] }; error: unknown }>;
      createUser(o: Record<string, unknown>): Promise<{ data: { user: Gebruiker | null } | null; error: DbFout }>;
      updateUserById(id: string, o: Record<string, unknown>): Promise<{ data: unknown; error: DbFout }>;
      deleteUser(id: string): Promise<{ data: unknown; error: DbFout }>;
    };
  };
};
type Omgeving = { nu?: () => number; random?: () => string };
type Toegang = { email: string; wie: string; user_id?: string | null };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
class Fout extends Error {
  status: number;
  constructor(status: number, msg: string) { super(msg); this.status = status; }
}
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } });
const TEKENS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // zonder 0/O en 1/I
export const GELDIG = 24 * 36e5; // een code is 24 uur geldig
const ADRES = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAAM: Record<string, string> = { remi: 'Remi', giulia: 'Giulia' };
const ONGELDIG = 'Deze code klopt niet, is al gebruikt of is verlopen. Vraag een nieuwe code.';

export async function sha256(t: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
}
export const schoneCode = (c: string) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const schoonAdres = (e: unknown) => String(e || '').trim().toLowerCase();

export function maakHandler(admin: Admin, env: Omgeving = {}) {
  const nu = env.nu || (() => Date.now());
  const random = env.random || (() => { const b = new Uint8Array(10); crypto.getRandomValues(b); return Array.from(b, x => TEKENS[x % TEKENS.length]).join(''); });

  async function leesToegang(kolom: 'email' | 'user_id', waarde: string): Promise<Toegang | null> {
    const { data, error } = await admin.from('toegang').select('email, wie, user_id').eq(kolom, waarde).maybeSingle();
    if (error) throw new Error(`toegang lezen: ${error.message}`);
    return data || null;
  }

  // Wie aangemeld is (met de sessie uit de app): het account en, als die er is, zijn rij in toegang.
  async function aangemeld(req: Request) {
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!jwt) throw new Fout(401, 'Niet aangemeld.');
    const { data } = await admin.auth.getUser(jwt);
    const u = data?.user;
    if (!u?.id) throw new Fout(401, 'Niet aangemeld.');
    return { id: u.id, email: schoonAdres(u.email), toegang: await leesToegang('user_id', u.id) };
  }
  async function lid(req: Request) {
    const a = await aangemeld(req);
    if (!a.toegang) throw new Fout(403, 'Dit account heeft geen toegang.');
    return a;
  }

  // Een code nakijken voor dit adres, zonder iets te wijzigen.
  async function nakijkenCode(code: string, email: string) {
    const hash = await sha256(code);
    const { data: c, error } = await admin.from('account_code').select('code_hash, wie, email, verloopt, gebruikt_op').eq('code_hash', hash).maybeSingle();
    if (error) throw new Error(`account_code lezen: ${error.message}`);
    if (!c || c.gebruikt_op || !c.email || !(Date.parse(c.verloopt) > nu())) throw new Fout(400, ONGELDIG);
    if (c.email !== email) throw new Fout(400, 'Deze code hoort bij een ander e-mailadres. Gebruik het adres waarvoor de code gemaakt werd, of vraag een nieuwe code.');
    return { hash, wie: String(c.wie) };
  }

  // Een bestaande toegang krijgt nooit een andere 'wie', en een account hoort bij één adres in toegang.
  // Geeft de rij in toegang van dit account terug (altijd met dit adres), of null als het account nog geen toegang heeft.
  async function nakijkenToegang(email: string, wie: string, userId?: string) {
    const perAdres = await leesToegang('email', email);
    if (perAdres && perAdres.wie !== wie) {
      throw new Fout(409, `Dit e-mailadres heeft al toegang als ${NAAM[perAdres.wie] || perAdres.wie}. Deze code is voor ${NAAM[wie] || wie}: vraag een nieuwe code voor de juiste persoon.`);
    }
    if (!userId) return null;
    const perAccount = await leesToegang('user_id', userId);
    if (perAccount && perAccount.email !== email) throw new Fout(409, 'Dit account heeft al toegang met een ander e-mailadres.');
    return perAccount;
  }

  // De code atomair inwisselen: dit lukt maar één keer, ook bij twee verzoeken tegelijk (update ... where gebruikt_op
  // is null and verloopt > nu returning). Geeft de stempel terug om de code vrij te geven als er daarna iets mislukt.
  async function inwisselen(hash: string, email: string) {
    const stempel = new Date(nu()).toISOString();
    const { data, error } = await admin.from('account_code').update({ gebruikt_op: stempel })
      .eq('code_hash', hash).eq('email', email).is('gebruikt_op', null).gt('verloopt', stempel)
      .select('wie').maybeSingle();
    if (error) throw new Error(`account_code inwisselen: ${error.message}`);
    if (!data) throw new Fout(400, ONGELDIG);
    return { stempel, wie: String(data.wie) };
  }
  async function vrijgeven(hash: string, stempel: string) {
    try {
      const { error } = await admin.from('account_code').update({ gebruikt_op: null }).eq('code_hash', hash).eq('gebruikt_op', stempel);
      if (error) console.error('account_code vrijgeven:', error.message);
    } catch (e) { console.error('account_code vrijgeven:', e); }
  }

  async function geefToegang(email: string, wie: string, userId: string) {
    const { error } = await admin.from('toegang').upsert({ email, wie, user_id: userId });
    if (error) throw new Fout(500, 'De toegang kon niet bewaard worden.');
  }

  async function zoekAccount(email: string) {
    for (let page = 1; page < 20; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Fout(500, 'Accounts konden niet gelezen worden.');
      const u = data.users.find(x => schoonAdres(x.email) === email);
      if (u) return u;
      if (data.users.length < 200) break;
    }
    return undefined;
  }

  const wachtwoordFout = (e: { message: string }, wat: string) => new Fout(400, /password/i.test(e.message)
    ? 'Dit wachtwoord wordt niet aanvaard. Kies een langer of minder voor de hand liggend wachtwoord.'
    : `${wat} (${e.message}).`);

  async function maak(body: Record<string, unknown>) {
    const email = schoonAdres(body.email);
    const wachtwoord = String(body.wachtwoord || '');
    const code = schoneCode(String(body.code || ''));
    if (!ADRES.test(email)) throw new Fout(400, 'Vul een geldig e-mailadres in.');
    if (wachtwoord.length < 8) throw new Fout(400, 'Kies een wachtwoord van minstens 8 tekens.');
    if (code.length < 8) throw new Fout(400, 'Vul de toegangscode in.');
    const { hash, wie: codeWie } = await nakijkenCode(code, email);
    const bestaand = await zoekAccount(email);
    // Alleen een account dat al toegang heeft met dit adres, krijgt een nieuw wachtwoord (wachtwoord vergeten).
    const metToegang = await nakijkenToegang(email, codeWie, bestaand?.id);
    const vergeten = bestaand && metToegang ? bestaand : null;
    const { stempel, wie } = await inwisselen(hash, email);
    try {
      let id: string;
      if (vergeten) {
        // Wachtwoord vergeten: het account heeft al toegang met dit adres. Het krijgt het nieuwe wachtwoord, en elke
        // bestaande aanmelding vervalt (ook die van wie het oude wachtwoord kende).
        const r = await admin.auth.admin.updateUserById(vergeten.id, { password: wachtwoord, email_confirm: true });
        if (r.error) throw wachtwoordFout(r.error, 'Het nieuwe wachtwoord kon niet ingesteld worden');
        id = vergeten.id;
        const { error } = await admin.rpc('trek_sessies_in', { uid: id });
        if (error) throw new Fout(500, 'De andere aanmeldingen van dit account konden niet afgemeld worden. Probeer opnieuw met dezelfde code.');
      } else {
        if (bestaand) {
          // Een account met dit adres zonder toegang (bijvoorbeeld gemaakt via een open aanmelding, door wie dan ook):
          // niet overnemen, want een toegangstoken dat de maker al had, zou dan meteen toegang geven. Eerst verwijderen,
          // dan een nieuw account maken: de toegang hangt aan het nieuwe id, dus elk oud token is waardeloos.
          const { error } = await admin.auth.admin.deleteUser(bestaand.id);
          if (error && !/user.?not.?found/i.test(`${error.code || ''} ${error.message}`)) {
            throw new Fout(500, 'Er bestond al een account met dit e-mailadres, zonder toegang, en dat kon niet vervangen worden. Probeer opnieuw met dezelfde code.');
          }
        }
        const r = await admin.auth.admin.createUser({ email, password: wachtwoord, email_confirm: true });
        if (r.error) throw wachtwoordFout(r.error, 'Het account kon niet gemaakt worden');
        const nieuwId = r.data?.user?.id;
        if (!nieuwId) throw new Fout(500, 'Het account kon niet gemaakt worden.');
        id = nieuwId;
      }
      await geefToegang(email, wie, id);
      return json(200, { ok: true, wie, nieuw: !vergeten });
    } catch (e) {
      await vrijgeven(hash, stempel); // de code blijft bruikbaar om het opnieuw te proberen
      throw e;
    }
  }

  async function koppel(req: Request, body: Record<string, unknown>) {
    const a = await aangemeld(req);
    const code = schoneCode(String(body.code || ''));
    if (code.length < 8) throw new Fout(400, 'Vul de toegangscode in.');
    if (!ADRES.test(a.email)) throw new Fout(400, 'Dit account heeft geen e-mailadres.');
    const { hash, wie: codeWie } = await nakijkenCode(code, a.email);
    await nakijkenToegang(a.email, codeWie, a.id);
    const { stempel, wie } = await inwisselen(hash, a.email);
    try {
      await geefToegang(a.email, wie, a.id);
    } catch (e) {
      await vrijgeven(hash, stempel);
      throw e;
    }
    return json(200, { ok: true, wie });
  }

  async function code(req: Request, body: Record<string, unknown>) {
    const door = await lid(req);
    const wie = String(body.wie || '');
    if (!['remi', 'giulia'].includes(wie)) throw new Fout(400, 'Voor wie is de code?');
    const email = schoonAdres(body.email);
    if (!ADRES.test(email)) throw new Fout(400, 'Vul het e-mailadres in waarmee de code gebruikt zal worden.');
    await nakijkenToegang(email, wie);
    const nuIso = new Date(nu()).toISOString();
    // Oudere ongebruikte codes voor hetzelfde adres vervallen meteen: er is per adres hoogstens één geldige code.
    const { error: e1 } = await admin.from('account_code').update({ verloopt: nuIso }).eq('email', email).is('gebruikt_op', null).gt('verloopt', nuIso);
    if (e1) throw new Fout(500, 'De code kon niet gemaakt worden.');
    const c = random();
    const verloopt = new Date(nu() + GELDIG).toISOString();
    const { error } = await admin.from('account_code').insert({ code_hash: await sha256(schoneCode(c)), wie, email, verloopt, aangemaakt_door: door.email });
    if (error) throw new Fout(500, 'De code kon niet gemaakt worden.');
    return json(200, { code: `${c.slice(0, 5)}-${c.slice(5)}`, verloopt, email });
  }

  return async function handler(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return json(405, { message: 'Niet toegestaan.' });
    try {
      const body = (await req.json().catch(() => null)) || {}; // ook als de body de json-waarde null is
      if (body.actie === 'maak') return await maak(body);
      if (body.actie === 'koppel') return await koppel(req, body);
      if (body.actie === 'code') return await code(req, body);
      throw new Fout(400, 'Onbekende actie.');
    } catch (e) {
      if (e instanceof Fout) return json(e.status, { message: e.message });
      console.error(e);
      return json(500, { message: 'Er ging iets mis op de server.' });
    }
  };
}
