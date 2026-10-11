// Verbinding met de centrale database. sync.js praat alleen met deze kleine laag, zodat de rest van de app
// niets van Supabase hoeft te weten (en de tests een nagebootste database kunnen gebruiken).
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let belofte = null;
export const ingesteld = () => !!(globalThis.__nieuweStartBackend || (SUPABASE_URL && SUPABASE_ANON_KEY));

export function backend() {
  if (belofte) return belofte;
  if (globalThis.__nieuweStartBackend) return (belofte = Promise.resolve(globalThis.__nieuweStartBackend));
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return (belofte = Promise.resolve(null));
  belofte = laadScript('vendor/supabase-2.117.2.js').then(() => maak(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'remi-aanmelding' },
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

// Netwerkfouten herkennen: dan wachten we en proberen later opnieuw, zonder iets te verliezen.
const isNetwerk = e => !navigator.onLine || /fetch|network|load failed|timeout/i.test(String(e?.message || e));
function fout(e, wat) {
  const x = new Error(`${wat}: ${e?.message || e}`);
  x.offline = isNetwerk(e);
  return x;
}

const PAD = id => String(id).replace(/[^A-Za-z0-9/_.-]/g, '_');

function maak(sb) {
  // Een link uit de aanmeldmail komt terug met ?code=...; na het inwisselen halen we die uit de adresbalk.
  const opruimen = () => {
    const u = new URL(location.href);
    if (u.searchParams.has('code') || u.searchParams.has('error_description')) {
      u.searchParams.delete('code'); u.searchParams.delete('error'); u.searchParams.delete('error_code'); u.searchParams.delete('error_description');
      history.replaceState(null, '', u.pathname + (u.search === '?' ? '' : u.search) + u.hash);
    }
  };
  return {
    async sessie() {
      const { data, error } = await sb.auth.getSession();
      opruimen();
      if (error) throw fout(error, 'Aanmelding');
      const u = data?.session?.user;
      return u ? { email: (u.email || '').toLowerCase() } : null;
    },
    opAuth(cb) { const { data } = sb.auth.onAuthStateChange(ev => { if (ev !== 'TOKEN_REFRESHED') setTimeout(cb, 0); }); return () => data?.subscription?.unsubscribe(); },
    async stuurCode(email) {
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
      if (error) throw fout(error, 'Code versturen');
    },
    async bevestigCode(email, code) {
      const { data, error } = await sb.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw fout(error, 'Code');
      return { email: (data?.user?.email || email).toLowerCase() };
    },
    async afmelden() { await sb.auth.signOut(); },
    async wie() {
      const { data, error } = await sb.from('toegang').select('wie').maybeSingle();
      if (error) throw fout(error, 'Toegang');
      return data?.wie || null;
    },
    async haal(sinds) {
      const rijen = [];
      for (let van = 0; ; van += 1000) {
        const { data, error } = await sb.from('records').select('collectie,id,data,bijgewerkt,verwijderd,server_tijd')
          .gt('server_tijd', sinds).order('server_tijd', { ascending: true }).order('collectie').order('id').range(van, van + 999);
        if (error) throw fout(error, 'Ophalen');
        rijen.push(...data);
        if (data.length < 1000) return rijen;
      }
    },
    async stuur(rijen) {
      if (!rijen.length) return;
      const { error } = await sb.from('records').upsert(rijen, { onConflict: 'collectie,id' });
      if (error) throw fout(error, 'Versturen');
    },
    async bestandOp(id, blob) {
      const { error } = await sb.storage.from('bijlagen').upload(PAD(id), blob, { upsert: true, contentType: blob.type || 'application/octet-stream' });
      if (error) throw fout(error, 'Bijlage opladen');
    },
    async bestandAf(id) {
      const { data, error } = await sb.storage.from('bijlagen').download(PAD(id));
      if (error) { if (/not found|404/i.test(error.message || '')) return null; throw fout(error, 'Bijlage ophalen'); }
      return data;
    },
    async bestandWeg(id) {
      const { error } = await sb.storage.from('bijlagen').remove([PAD(id)]);
      if (error) throw fout(error, 'Bijlage verwijderen');
    },
    luister(cb) {
      const kanaal = sb.channel('records-wijzigingen')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, p => { if (p?.new && p.new.collectie) cb([p.new]); })
        .subscribe();
      return () => { sb.removeChannel(kanaal); };
    },
  };
}
