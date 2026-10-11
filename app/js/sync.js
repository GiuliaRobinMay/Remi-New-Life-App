// Synchronisatie met de centrale database. Remi en Giulia zien zo dezelfde gegevens op elk toestel.
// Werkwijze:
// - Elke lokale wijziging komt in een wachtrij en gaat (na een korte pauze) naar de database.
// - Wat het andere toestel wijzigt, komt binnen via een live verbinding en bij elke synchronisatie.
// - Per record wint de recentst bewerkte versie, zowel hier (store.pasToe) als in de database (trigger).
// - Bijlagen gaan naar de afgeschermde opslag; een ander toestel haalt ze op zodra iemand ze opent.
// - Zonder verbinding werkt de app verder met de kopie op dit toestel; de wachtrij gaat later door.
import * as store from './store.js';
import { backend, ingesteld } from './backend.js';
import { zetExtern, leesLokaal, lokaleSleutels } from './bijlagen.js';

const SK = 'remi-sync-v1';
const BEGIN = '1970-01-01T00:00:00.000Z';
const OVERLAP = 60_000; // opnieuw ophalen wat net voor de vorige keer binnenkwam: dubbel toepassen kan geen kwaad
const sleutel = (c, id) => `${c}\u0001${id}`;
const uitSleutel = k => k.split('\u0001');

let B = null;
let st = lees();
let status = { modus: ingesteld() ? 'laden' : 'lokaal', email: '', wie: '', laatste: st.laatsteSync || '', fout: '', wachtend: 0 };
const luisteraars = new Set();
let bezig = null, opnieuw = false, timer = null, stopLuister = null, gestart = false, foutTeller = 0;

function lees() {
  try { const s = JSON.parse(localStorage.getItem(SK) || '{}'); return { email: '', laatst: BEGIN, wacht: {}, bestanden: {}, eersteKlaar: '', laatsteSync: '', ...s }; } catch { return { email: '', laatst: BEGIN, wacht: {}, bestanden: {}, eersteKlaar: '', laatsteSync: '' }; }
}
function bewaar() { try { localStorage.setItem(SK, JSON.stringify(st)); } catch { /* geen opslag */ } }
function zet(patch) {
  status = { ...status, ...patch, wachtend: Object.keys(st.wacht).length + Object.keys(st.bestanden).length };
  for (const fn of luisteraars) { try { fn(status); } catch (e) { console.warn(e); } }
}
export const syncStatus = () => status;
export function opStatus(fn) { luisteraars.add(fn); return () => luisteraars.delete(fn); }
export const actief = () => status.modus === 'actief' || status.modus === 'offline' || status.modus === 'bezig';

// Lokale wijzigingen in de wachtrij zetten. Dat gebeurt ook vóór de aanmelding: ze gaan mee bij de eerste synchronisatie.
function markeer(c, rec) {
  if (!rec || !rec.id) return;
  st.wacht[sleutel(c, rec.id)] = rec.bijgewerkt || new Date().toISOString();
  bewaar(); zet({});
  plan(1200);
}
function markeerBestand(id, op) { st.bestanden[id] = op; bewaar(); zet({}); plan(800); }

export function plan(ms = 0) {
  if (!B || !['actief', 'offline', 'fout', 'bezig'].includes(status.modus)) return;
  clearTimeout(timer);
  timer = setTimeout(() => { syncNu().catch(() => {}); }, ms);
}

// Een wijziging van het andere toestel pas tonen als niemand aan het typen is, anders verspringt het veld.
let uitgesteld = false;
function toon() {
  const el = document.activeElement;
  const typt = el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !['button', 'checkbox', 'radio', 'file'].includes(el.type);
  if (!typt) { store.melden(); return; }
  if (uitgesteld) return;
  uitgesteld = true;
  el.addEventListener('blur', () => { uitgesteld = false; setTimeout(() => store.melden(), 50); }, { once: true });
}
function ontvang(rijen) {
  // Wat hier nog in de wachtrij staat en nieuwer is, wint (pasToe vergelijkt de datum).
  if (store.pasToe(rijen, { stil: true })) toon();
}

export async function syncNu() {
  if (!B) return;
  if (bezig) { opnieuw = true; return bezig; }
  bezig = (async () => {
    const vorige = status.modus;
    if (vorige !== 'fout') zet({ modus: 'bezig' });
    try {
      // 1. Versturen wat hier gewijzigd werd.
      const keys = Object.keys(st.wacht);
      for (let i = 0; i < keys.length; i += 200) {
        const deel = keys.slice(i, i + 200);
        const rijen = [], stempels = {};
        for (const k of deel) {
          const [c, id] = uitSleutel(k);
          const rec = store.lokaalRecord(c, id);
          if (!rec) { delete st.wacht[k]; continue; }
          let bijgewerkt = rec.bijgewerkt || st.wacht[k];
          // Een datum in de toekomst zou in de database elke latere bewerking blokkeren: terug naar nu.
          const nu = new Date().toISOString();
          if (bijgewerkt > nu) { bijgewerkt = nu; store.zetStempel(c, id, nu); st.wacht[k] = nu; }
          stempels[k] = st.wacht[k];
          rijen.push({ collectie: c, id, data: { ...rec, bijgewerkt }, bijgewerkt, verwijderd: !!rec.verwijderd });
        }
        await B.stuur(rijen);
        // Alleen uit de wachtrij halen wat intussen niet opnieuw gewijzigd werd.
        for (const k of Object.keys(stempels)) if (st.wacht[k] === stempels[k]) delete st.wacht[k];
        bewaar();
      }
      // 2. Bijlagen opladen of verwijderen.
      for (const [id, op] of Object.entries(st.bestanden)) {
        if (op === 'op') {
          const blob = await leesLokaal(id).catch(() => null);
          if (blob) await B.bestandOp(id, blob);
        } else await B.bestandWeg(id);
        if (st.bestanden[id] === op) delete st.bestanden[id];
        bewaar();
      }
      // 3. Ophalen wat elders gewijzigd werd.
      const sinds = st.laatst === BEGIN ? BEGIN : new Date(Date.parse(st.laatst) - OVERLAP).toISOString();
      const rijen = await B.haal(sinds);
      if (rijen.length) {
        ontvang(rijen);
        const max = rijen.reduce((m, r) => (r.server_tijd > m ? r.server_tijd : m), st.laatst);
        st.laatst = max;
      }
      if (!st.eersteKlaar) st.eersteKlaar = st.email;
      st.laatsteSync = new Date().toISOString();
      bewaar();
      foutTeller = 0;
      zet({ modus: 'actief', laatste: st.laatsteSync, fout: '' });
    } catch (e) {
      foutTeller++;
      zet({ modus: e.offline ? 'offline' : 'fout', fout: e.message || String(e) });
      // Later opnieuw proberen, steeds wat minder vaak (tot vijf minuten).
      clearTimeout(timer);
      timer = setTimeout(() => { syncNu().catch(() => {}); }, Math.min(300_000, 5000 * 2 ** Math.min(foutTeller, 6)));
    } finally {
      bezig = null;
      if (opnieuw) { opnieuw = false; plan(300); }
    }
  })();
  return bezig;
}

// Na aanmelden of bij het openen: wie is aangemeld, en heeft dat adres toegang?
async function herstart() {
  let s;
  try { s = await B.sessie(); } catch (e) { zet({ modus: e.offline ? 'offline' : 'fout', fout: e.message }); return; }
  if (!s) { stopLuister?.(); stopLuister = null; zet({ modus: 'afgemeld', email: '', wie: '' }); return; }
  if (st.email && st.email !== s.email) {
    // Een ander account op dit toestel: alles opnieuw ophalen en de lokale wijzigingen opnieuw aanbieden.
    st.laatst = BEGIN; st.eersteKlaar = '';
  }
  st.email = s.email; bewaar();
  let wie;
  try { wie = await B.wie(); } catch (e) {
    // Zonder verbinding: verder met de kopie op dit toestel als dit adres hier al eerder werkte.
    if (e.offline && st.eersteKlaar === s.email) { zet({ modus: 'offline', email: s.email, fout: e.message }); return; }
    zet({ modus: e.offline ? 'offline' : 'fout', email: s.email, fout: e.message }); return;
  }
  if (!wie) { zet({ modus: 'geen-toegang', email: s.email, wie: '' }); return; }
  if (st.eersteKlaar !== s.email) {
    // Eerste keer op dit toestel: alles wat hier al stond, gaat mee naar de database (nieuwste versie wint).
    for (const [c, r] of store.lokaleRecords()) st.wacht[sleutel(c, r.id)] = r.bijgewerkt || new Date().toISOString();
    for (const id of await lokaleSleutels().catch(() => [])) if (!st.bestanden[id]) st.bestanden[id] = 'op';
    bewaar();
  }
  zet({ modus: 'actief', email: s.email, wie, fout: '' });
  if (!stopLuister && B.luister) stopLuister = B.luister(rijen => ontvang(rijen));
  await syncNu();
}

export async function start() {
  if (gestart) return; gestart = true;
  store.zetHaken({
    wijziging: markeer,
    wis: () => { st = { ...lees(), laatst: BEGIN, wacht: {}, eersteKlaar: '' }; bewaar(); plan(0); },
  });
  zetExtern({
    gewijzigd: (id, op) => markeerBestand(id, op),
    haal: async id => (B && actief() ? B.bestandAf(id) : null),
  });
  try { B = await backend(); } catch (e) { zet({ modus: 'fout', fout: e.message }); return; }
  if (!B) { zet({ modus: 'lokaal' }); return; }
  B.opAuth?.(() => { herstart().catch(() => {}); });
  addEventListener('online', () => plan(0));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) plan(0); });
  setInterval(() => plan(0), 60_000);
  await herstart();
}

// Aanmelden met een code per mail (of de link in dezelfde mail).
export async function stuurCode(email) { if (!B) throw new Error('Geen database ingesteld.'); await B.stuurCode(email.trim().toLowerCase()); }
export async function bevestigCode(email, code) { if (!B) throw new Error('Geen database ingesteld.'); await B.bevestigCode(email.trim().toLowerCase(), code.trim()); await herstart(); }
export async function afmelden() {
  if (!B) return;
  stopLuister?.(); stopLuister = null;
  await B.afmelden().catch(() => {});
  zet({ modus: 'afgemeld', email: '', wie: '' });
}
