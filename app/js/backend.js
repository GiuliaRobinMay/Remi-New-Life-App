// Verbinding met de centrale database. sync.js praat alleen met deze kleine laag, zodat de rest van de app
// niets van Supabase hoeft te weten (en de tests een nagebootste database kunnen gebruiken).
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const SESSIE = 'remi-aanmelding'; // sleutel van de aanmelding in localStorage
let belofte = null;
export const ingesteld = () => !!(globalThis.__nieuweStartBackend || (SUPABASE_URL && SUPABASE_ANON_KEY));

export function backend() {
  if (belofte) return belofte;
  if (globalThis.__nieuweStartBackend) return (belofte = Promise.resolve(globalThis.__nieuweStartBackend));
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return (belofte = Promise.resolve(null));
  belofte = laadScript('vendor/supabase-2.117.2.js').then(() => maakBackend(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: SESSIE },
  })));
  belofte.catch(() => { belofte = null; });
  return belofte;
}

function laadScript(src) {
  return new Promise((res, rej) => {
    if (window.supabase?.createClient) return res();
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => res(); s.onerror = () => rej(new Error('De databasebibliotheek kon niet geladen worden.'));
    document.head.append(s);
  });
}

// Soort fout, zodat sync.js weet wat te doen:
//   'tijdelijk' geen verbinding, of de server is even weg of overbelast (geen antwoord, 408, 425, 429, 5xx,
//               PGRST00x): later opnieuw, er gaat niets verloren.
//   'toegang'   aanmelding verlopen of geen rechten (401, 403): stoppen en de toegang opnieuw nakijken.
//   'ongeldig'  dit ene record of bestand wordt geweigerd (400, 409, 413, 422): apart zetten als mislukt.
//   'fout'      iets anders (bijvoorbeeld 404): stoppen en later opnieuw, niets als mislukt.
const isNetwerk = e => (typeof navigator !== 'undefined' && navigator.onLine === false) || /fetch|network|load failed|timeout|timed out|abort/i.test(String(e?.message || e));
export function soortFout(e, status) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'tijdelijk';
  const code = String(e?.code ?? '');
  if (/^PGRST00\d$/.test(code)) return 'tijdelijk';
  const s = Number(status ?? e?.status ?? e?.statusCode);
  if (!Number.isFinite(s) || s === 0) return 'tijdelijk'; // geen antwoord van de server
  if ([408, 425, 429].includes(s) || s >= 500) return 'tijdelijk';
  if (s === 401 || s === 403) return 'toegang';
  if ([400, 409, 413, 422].includes(s)) return 'ongeldig';
  return isNetwerk(e) ? 'tijdelijk' : 'fout';
}
function fout(e, wat, status) {
  const x = new Error(`${wat}: ${e?.message || e}`);
  x.status = Number(status ?? e?.status) || 0;
  if (e?.code) x.code = e.code;
  x.soort = soortFout(e, status);
  x.offline = x.soort === 'tijdelijk';
  return x;
}

const PAD = id => String(id).replace(/[^A-Za-z0-9/_.-]/g, '_');

// De laag boven op een Supabase-client. Apart te gebruiken met een nagebootste client (tests).
export function maakBackend(sb) {
  // Een serverfunctie aanroepen; de foutmelding en de velden van het antwoord (zoals dubbel, onzeker) doorgeven.
  async function functie(naam, body) {
    const { data, error } = await sb.functions.invoke(naam, { body });
    if (error) {
      let antw = {};
      try { antw = await error.context?.json(); } catch { /* geen json */ }
      const x = new Error(antw?.message || error.message || 'De server antwoordde niet.');
      Object.assign(x, antw || {});
      const status = Number(error.context?.status) || 0;
      if (status) x.status = status;
      if (!error.context || error.name === 'FunctionsFetchError') x.offline = isNetwerk(error) || error.name === 'FunctionsFetchError';
      throw x;
    }
    return data;
  }
  return {
    async sessie() {
      const { data, error } = await sb.auth.getSession();
      if (error) throw fout(error, 'Aanmelding');
      const u = data?.session?.user;
      return u ? { email: (u.email || '').toLowerCase() } : null;
    },
    opAuth(cb) { const { data } = sb.auth.onAuthStateChange(ev => { if (ev !== 'TOKEN_REFRESHED') setTimeout(cb, 0); }); return () => data?.subscription?.unsubscribe(); },
    async aanmelden(email, wachtwoord) {
      const { error } = await sb.auth.signInWithPassword({ email, password: wachtwoord });
      if (error) {
        const x = fout(error, 'Aanmelden');
        if (/invalid login|invalid credentials/i.test(error.message || '')) x.verkeerd = true;
        throw x;
      }
    },
    // Account maken of een nieuw wachtwoord kiezen met een toegangscode die bij dit e-mailadres hoort.
    maakAccount: (email, wachtwoord, code) => functie('account', { actie: 'maak', email, wachtwoord, code }),
    // Al aangemeld maar nog geen toegang: de code inwisselen, zonder wachtwoord (de aanmelding bewijst wie het is).
    koppel: code => functie('account', { actie: 'koppel', code }),
    // Een toegangscode maken voor Remi of Giulia, gebonden aan hun e-mailadres.
    codeMaken: (wie, email) => functie('account', { actie: 'code', wie, email }),
    // Alleen op dit toestel afmelden; de andere toestellen blijven aangemeld. Lukt afmelden bij de server niet
    // (bijvoorbeeld zonder verbinding), dan gaat de aanmelding toch van dit toestel. Geeft terug of de server meedeed.
    async afmelden() {
      let gelukt = false;
      try { const { error } = await sb.auth.signOut({ scope: 'local' }); gelukt = !error; } catch { gelukt = false; }
      if (!gelukt) {
        try { for (const k of [SESSIE, `${SESSIE}-code-verifier`, `${SESSIE}-user`]) localStorage.removeItem(k); } catch { /* geen opslag */ }
      }
      return gelukt;
    },
    async wie() {
      const { data, error, status } = await sb.from('toegang').select('wie').maybeSingle();
      if (error) throw fout(error, 'Toegang', status);
      return data?.wie || null;
    },
    // Ophalen wat sinds een tijdstip veranderde, in pakketten van 1000. Elk volgend pakket begint bij het tijdstip
    // van het laatste record (niet bij een rijnummer), zodat niets overgeslagen wordt als er intussen iets wijzigt.
    async haal(sinds) {
      const rijen = [], gezien = new Set(), VELDEN = 'collectie,id,data,bijgewerkt,verwijderd,server_tijd';
      let vanaf = sinds, eerste = true, overslaan = 0;
      for (let ronde = 0; ronde < 10_000; ronde++) {
        let q = sb.from('records').select(VELDEN);
        q = eerste ? q.gt('server_tijd', vanaf) : q.gte('server_tijd', vanaf);
        q = q.order('server_tijd', { ascending: true }).order('collectie').order('id');
        const { data, error, status } = await (overslaan ? q.range(overslaan, overslaan + 999) : q.limit(1000));
        if (error) throw fout(error, 'Ophalen', status);
        for (const r of data) {
          const k = `${r.collectie}\u0001${r.id}\u0001${r.server_tijd}`;
          if (!gezien.has(k)) { gezien.add(k); rijen.push(r); }
        }
        if (data.length < 1000) return rijen;
        const laatste = data[data.length - 1].server_tijd;
        // Uitzonderlijk: meer dan 1000 records met precies hetzelfde tijdstip. Dan binnen dat tijdstip verder tellen.
        if (!eerste && laatste === vanaf) overslaan += 1000; else overslaan = 0;
        vanaf = laatste; eerste = false;
      }
      return rijen;
    },
    async stuur(rijen) {
      if (!rijen.length) return;
      const { error, status } = await sb.from('records').upsert(rijen, { onConflict: 'collectie,id' });
      if (error) throw fout(error, 'Versturen', status);
    },
    async bestandOp(id, blob) {
      const { error } = await sb.storage.from('bijlagen').upload(PAD(id), blob, { upsert: true, contentType: blob.type || 'application/octet-stream' });
      if (error) throw fout(error, 'Bijlage opladen');
    },
    async bestandAf(id) {
      const { data, error } = await sb.storage.from('bijlagen').download(PAD(id));
      if (error) {
        if (/not found|404/i.test(error.message || '') || String(error.statusCode) === '404' || error.status === 404) return null;
        throw fout(error, 'Bijlage ophalen');
      }
      return data;
    },
    async bestandWeg(id) {
      const { error } = await sb.storage.from('bijlagen').remove([PAD(id)]);
      if (error) throw fout(error, 'Bijlage verwijderen');
    },
    // Mail versturen vanaf het gekoppelde Gmail-adres van Remi, via de serverfunctie 'gmail'
    // (bijvoorbeeld gmail('verstuur', { pad, sleutel })).
    gmail: (actie, extra = {}) => functie('gmail', { actie, ...extra }),
    async mailKlaarzetten(mime) {
      const pad = `uitgaand/${(crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2))}.eml`;
      const { error } = await sb.storage.from('bijlagen').upload(pad, new Blob([mime], { type: 'message/rfc822' }), { contentType: 'message/rfc822', upsert: false });
      if (error) throw fout(error, 'Mail klaarzetten');
      return pad;
    },
    luister(cb) {
      const kanaal = sb.channel('records-wijzigingen')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, p => { if (p?.new && p.new.collectie) cb([p.new]); })
        .subscribe();
      return () => { sb.removeChannel(kanaal); };
    },
  };
}
