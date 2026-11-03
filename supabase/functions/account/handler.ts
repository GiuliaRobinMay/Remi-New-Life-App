// Serverfunctie "account": een account maken (of een nieuw wachtwoord kiezen) met een toegangscode.
// Zo hoeft niemand iets in te stellen in Supabase en komen er geen aanmeldmails aan te pas:
//   POST {actie:'maak', email, wachtwoord, code}  -> account met dit wachtwoord, toegang als 'remi' of 'giulia'
//   POST {actie:'code', wie}  (aangemeld, met toegang) -> { code, verloopt } om door te geven
// De codes staan alleen als hash in de database (tabel account_code, niet leesbaar voor de app).

export type Admin = {
  from(t: string): any;
  auth: {
    getUser(jwt: string): Promise<{ data: { user: { email?: string } | null }; error: unknown }>;
    admin: {
      listUsers(o: { page: number; perPage: number }): Promise<{ data: { users: { id: string; email?: string }[] }; error: unknown }>;
      createUser(o: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }>;
      updateUserById(id: string, o: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }>;
    };
  };
};
type Omgeving = { nu?: () => number; random?: () => string };

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

export async function sha256(t: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
}
export const schoneCode = (c: string) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export function maakHandler(admin: Admin, env: Omgeving = {}) {
  const nu = env.nu || (() => Date.now());
  const random = env.random || (() => { const b = new Uint8Array(10); crypto.getRandomValues(b); return Array.from(b, x => TEKENS[x % TEKENS.length]).join(''); });

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

  async function maak(body: Record<string, unknown>) {
    const email = String(body.email || '').trim().toLowerCase();
    const wachtwoord = String(body.wachtwoord || '');
    const code = schoneCode(String(body.code || ''));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Fout(400, 'Vul een geldig e-mailadres in.');
    if (wachtwoord.length < 8) throw new Fout(400, 'Kies een wachtwoord van minstens 8 tekens.');
    if (code.length < 8) throw new Fout(400, 'Vul de toegangscode in.');
    const hash = await sha256(code);
    const { data: c } = await admin.from('account_code').select('code_hash, wie, verloopt, gebruikt_op').eq('code_hash', hash).maybeSingle();
    if (!c || c.gebruikt_op || Date.parse(c.verloopt) < nu()) throw new Fout(400, 'Deze code klopt niet, is al gebruikt of is verlopen. Vraag een nieuwe code.');
    // Bestaat het account al, dan krijgt het het nieuwe wachtwoord (wachtwoord vergeten).
    let bestaand: { id: string } | undefined;
    for (let page = 1; page < 20 && !bestaand; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Fout(500, 'Accounts konden niet gelezen worden.');
      bestaand = data.users.find(u => (u.email || '').toLowerCase() === email);
      if (data.users.length < 200) break;
    }
    const r = bestaand
      ? await admin.auth.admin.updateUserById(bestaand.id, { password: wachtwoord, email_confirm: true })
      : await admin.auth.admin.createUser({ email, password: wachtwoord, email_confirm: true });
    if (r.error) throw new Fout(400, /password/i.test(r.error.message) ? 'Dit wachtwoord wordt niet aanvaard. Kies een langer of minder voor de hand liggend wachtwoord.' : `Het account kon niet gemaakt worden (${r.error.message}).`);
    const { error: e1 } = await admin.from('toegang').upsert({ email, wie: c.wie });
    if (e1) throw new Fout(500, 'De toegang kon niet bewaard worden.');
    await admin.from('account_code').update({ gebruikt_op: new Date(nu()).toISOString() }).eq('code_hash', hash);
    return json(200, { ok: true, wie: c.wie, nieuw: !bestaand });
  }

  async function code(req: Request, body: Record<string, unknown>) {
    const door = await lid(req);
    const wie = String(body.wie || '');
    if (!['remi', 'giulia'].includes(wie)) throw new Fout(400, 'Voor wie is de code?');
    const c = random();
    const verloopt = new Date(nu() + 7 * 864e5).toISOString();
    const { error } = await admin.from('account_code').insert({ code_hash: await sha256(schoneCode(c)), wie, verloopt, aangemaakt_door: door });
    if (error) throw new Fout(500, 'De code kon niet gemaakt worden.');
    return json(200, { code: `${c.slice(0, 5)}-${c.slice(5)}`, verloopt });
  }

  return async function handler(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return json(405, { message: 'Niet toegestaan.' });
    try {
      const body = (await req.json().catch(() => null)) || {}; // ook als de body de json-waarde null is
      if (body.actie === 'maak') return await maak(body);
      if (body.actie === 'code') return await code(req, body);
      throw new Fout(400, 'Onbekende actie.');
    } catch (e) {
      if (e instanceof Fout) return json(e.status, { message: e.message });
      console.error(e);
      return json(500, { message: 'Er ging iets mis op de server.' });
    }
  };
}
