// Synchronisatie met de centrale database. Remi en Giulia zien zo dezelfde gegevens op elk toestel.
// Werkwijze:
// - Elke lokale wijziging komt in een wachtrij en gaat (na een korte pauze) naar de database.
// - Wat het andere toestel wijzigt, komt binnen via een live verbinding en bij elke synchronisatie.
// - Per record wint de recentst bewerkte versie, veld per veld samengevoegd, zowel hier (store.pasToe)
//   als in de database (trigger). Verwijderen is een leeg grafsteentje dat alles vervangt.
// - Bijlagen gaan naar de afgeschermde opslag; een ander toestel haalt ze op zodra iemand ze opent.
// - Zonder verbinding werkt de app verder met de kopie op dit toestel; de wachtrij gaat later door.
// - De gegevens zijn pas zichtbaar als de toegang nagekeken is (of eerder al nagekeken werd op dit toestel),
//   en op een nieuw toestel pas na de eerste volledige ophaalbeurt.
import * as store from './store.js';
import { backend, ingesteld } from './backend.js';
import { zetExtern, leesLokaal, lokaleSleutels, wisAlleBijlagen } from './bijlagen.js';

const SK = 'remi-sync-v2';
const BEGIN = '1970-01-01T00:00:00.000Z';
const ZONDER_DATUM = '2000-01-01T00:00:00.000Z'; // records zonder datum verliezen van elke echte bewerking
const OVERLAP = 60_000; // opnieuw ophalen wat net voor de vorige keer binnenkwam: dubbel toepassen kan geen kwaad
const sleutel = (c, id) => `${c}\u0001${id}`;
const uitSleutel = k => k.split('\u0001');
const leeg = () => ({ email: '', wie: '', klaar: '', laatst: BEGIN, wacht: {}, bestanden: {}, mislukt: {}, laatsteSync: '' });

let B = null;
let st = lees();
let gen = 0;            // verhoogt bij afmelden en wissen: lopend werk van daarvoor mag niets meer veranderen
let nagekeken = '';     // e-mail waarvoor de toegang in deze sessie bevestigd is
let status = { modus: ingesteld() ? 'laden' : 'lokaal', open: !ingesteld(), email: '', wie: '', laatste: st.laatsteSync || '', fout: '', wachtend: 0, mislukt: 0 };
const luisteraars = new Set();
let bezig = null, opnieuw = false, timer = null, herstartTimer = null, stopLuister = null, gestart = false, foutTeller = 0;

function lees() { try { return { ...leeg(), ...JSON.parse(localStorage.getItem(SK) || '{}') }; } catch { return leeg(); } }
function bewaar() { try { localStorage.setItem(SK, JSON.stringify(st)); } catch { /* geen opslag */ } }
const elders = () => !!st.email && st.klaar === st.email && !!st.wie; // dit adres werkte hier al eerder volledig
function zet(patch) {
  const m = patch.modus || status.modus;
  const open = m === 'lokaal' || m === 'actief' || m === 'bezig' || ((m === 'offline' || m === 'fout') && elders());
  status = { ...status, ...patch, open, wachtend: Object.keys(st.wacht).length + Object.keys(st.bestanden).length, mislukt: Object.keys(st.mislukt).length };
  for (const fn of luisteraars) { try { fn(status); } catch (e) { console.warn(e); } }
}
export const syncStatus = () => status;
export function opStatus(fn) { luisteraars.add(fn); return () => luisteraars.delete(fn); }
export const actief = () => !!B && status.open && status.modus !== 'lokaal';

// Lokale wijzigingen in de wachtrij zetten. Dat gebeurt ook vóór de aanmelding: ze gaan mee bij de eerste synchronisatie.
function markeer(c, rec) {
  if (!rec || !rec.id) return;
  st.wacht[sleutel(c, rec.id)] = rec.bijgewerkt || new Date().toISOString();
  bewaar(); zet({});
  plan(1200);
}
function markeerBestand(id, op) { st.bestanden[id] = op; delete st.mislukt['bestand:' + id]; bewaar(); zet({}); plan(800); }

export function plan(ms = 0) {
  if (!B || !nagekeken) return;
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
  // Na het verlaten van het veld, maar niet midden in een klik: wachten tot de muis of vinger los is.
  el.addEventListener('blur', () => { setTimeout(() => { uitgesteld = false; store.melden(); }, 350); }, { once: true });
}
function ontvang(rijen) {
  if (store.pasToe(rijen, { stil: true })) toon();
}

export async function syncNu() {
  if (!B || !nagekeken) return;
  if (bezig) { opnieuw = true; return bezig; }
  const mijnGen = gen;
  const geldig = () => mijnGen === gen;
  bezig = (async () => {
    if (status.modus === 'actief') zet({ modus: 'bezig' });
    let netwerk = null, andere = null;
    // 1. Bijlagen eerst, zodat het andere toestel ze vindt als de records aankomen.
    for (const [id, op] of Object.entries(st.bestanden)) {
      try {
        if (op === 'op') {
          let blob;
          try { blob = await leesLokaal(id); } catch { continue; } // lezen lukte nu niet: later opnieuw, niet weggooien
          if (blob) {
            if (blob.size > 50 * 1024 * 1024) throw new Error('Het bestand is groter dan 50 MB.');
            await B.bestandOp(id, blob);
          }
        } else await B.bestandWeg(id);
        if (!geldig()) return;
        if (st.bestanden[id] === op) delete st.bestanden[id];
      } catch (e) {
        if (!geldig()) return;
        if (e.offline) { netwerk = e; break; }
        // Blijvende fout voor dit ene bestand: apart zetten, de rest gaat door.
        st.mislukt['bestand:' + id] = e.message; delete st.bestanden[id];
      }
      bewaar();
    }
    // 2. Records versturen.
    if (!netwerk) {
      const keys = Object.keys(st.wacht);
      for (let i = 0; i < keys.length && !netwerk; i += 200) {
        const deel = keys.slice(i, i + 200);
        const rijen = [], stempels = {};
        for (const k of deel) {
          const [c, id] = uitSleutel(k);
          const rec = store.lokaalRecord(c, id);
          if (!rec) { delete st.wacht[k]; continue; }
          let bijgewerkt = rec.bijgewerkt || st.wacht[k] || ZONDER_DATUM;
          // Een datum in de toekomst zou in de database elke latere bewerking blokkeren: terug naar nu.
          const nu = new Date().toISOString();
          if (bijgewerkt > nu) { bijgewerkt = nu; store.zetStempel(c, id, nu); }
          st.wacht[k] = bijgewerkt;
          stempels[k] = bijgewerkt;
          rijen.push({ collectie: c, id, data: { ...rec, bijgewerkt }, bijgewerkt, verwijderd: !!rec.verwijderd });
        }
        try {
          await B.stuur(rijen);
        } catch (e) {
          if (!geldig()) return;
          if (e.offline) { netwerk = e; break; }
          // Eén slecht record mag de rest niet tegenhouden: één voor één proberen.
          for (const r of rijen) {
            try { await B.stuur([r]); } catch (e2) {
              if (e2.offline) { netwerk = e2; break; }
              const k = sleutel(r.collectie, r.id);
              st.mislukt[k] = e2.message; delete stempels[k]; delete st.wacht[k];
            }
          }
        }
        if (!geldig()) return;
        for (const k of Object.keys(stempels)) if (st.wacht[k] === stempels[k]) delete st.wacht[k];
        bewaar();
      }
    }
    // 3. Ophalen wat elders gewijzigd werd: altijd, ook als iets hierboven mislukte.
    let opgehaald = false;
    if (!netwerk) {
      try {
        const sinds = st.laatst === BEGIN ? BEGIN : new Date(Date.parse(st.laatst) - OVERLAP).toISOString();
        const rijen = await B.haal(sinds);
        if (!geldig()) return;
        if (rijen.length) {
          ontvang(rijen);
          st.laatst = rijen.reduce((m, r) => (r.server_tijd > m ? r.server_tijd : m), st.laatst);
        }
        opgehaald = true;
      } catch (e) { if (!geldig()) return; if (e.offline) netwerk = e; else andere = e; }
    }
    if (opgehaald) { st.laatsteSync = new Date().toISOString(); if (st.klaar !== st.email) { st.klaar = st.email; migreerInstellingen(); } }
    bewaar();
    if (netwerk || andere) {
      foutTeller++;
      zet({ modus: netwerk ? 'offline' : 'fout', fout: (netwerk || andere).message });
      clearTimeout(timer);
      timer = setTimeout(() => { syncNu().catch(() => {}); }, Math.min(300_000, 5000 * 2 ** Math.min(foutTeller, 6)));
      return;
    }
    foutTeller = 0;
    zet({ modus: 'actief', laatste: st.laatsteSync, fout: '' });
  })().finally(() => {
    bezig = null;
    if (opnieuw) { opnieuw = false; plan(300); } // plan doet niets meer na afmelden
  });
  return bezig;
}

// Gmail-client-ID en handtekening die alleen op dit toestel stonden, gaan één keer mee naar de gedeelde instellingen.
function migreerInstellingen() {
  try {
    const gedeeld = store.get('instellingen', 'mail') || {};
    const patch = { id: 'mail' };
    const cid = localStorage.getItem('remi-gmail-client-id'), ht = localStorage.getItem('remi-mail-handtekening');
    if (cid && typeof gedeeld.clientId !== 'string') patch.clientId = cid;
    if (ht && typeof gedeeld.handtekening !== 'string') patch.handtekening = ht;
    if (Object.keys(patch).length > 1) store.upsert('instellingen', patch, { silent: true });
  } catch { /* niet erg */ }
}

// Na aanmelden of bij het openen: wie is aangemeld, en heeft dat adres toegang?
async function herstart() {
  clearTimeout(herstartTimer);
  const mijnGen = gen;
  let s;
  try { s = await B.sessie(); } catch (e) {
    if (mijnGen !== gen) return;
    zet({ modus: elders() ? (e.offline ? 'offline' : 'fout') : 'controle', email: st.email, wie: st.wie, fout: e.message });
    herstartLater(); return;
  }
  if (mijnGen !== gen) return;
  if (!s) { nagekeken = ''; stopLuister?.(); stopLuister = null; zet({ modus: 'afgemeld', email: '', wie: '' }); return; }
  if (st.email && st.email !== s.email) { st = { ...leeg(), wacht: st.wacht, bestanden: st.bestanden }; } // ander account: alles opnieuw ophalen
  st.email = s.email; bewaar();
  let wie;
  try { wie = await B.wie(); } catch (e) {
    if (mijnGen !== gen) return;
    // Zonder verbinding: verder met de kopie op dit toestel, alleen als dit adres hier al eerder volledig werkte.
    zet({ modus: elders() ? (e.offline ? 'offline' : 'fout') : 'controle', email: s.email, wie: st.wie, fout: e.message });
    herstartLater();
    return;
  }
  if (mijnGen !== gen) return;
  if (!wie) { nagekeken = ''; zet({ modus: 'geen-toegang', email: s.email, wie: '' }); return; }
  st.wie = wie; nagekeken = s.email; bewaar();
  if (st.klaar !== s.email) {
    // Eerste keer op dit toestel: alles wat hier al stond, gaat mee naar de database (nieuwste versie wint, veld per veld).
    for (const [c, r] of store.lokaleRecords()) if (!st.wacht[sleutel(c, r.id)]) st.wacht[sleutel(c, r.id)] = r.bijgewerkt || ZONDER_DATUM;
    let sleutels = null;
    try { sleutels = await lokaleSleutels(); } catch { sleutels = null; }
    if (sleutels) for (const id of sleutels) if (!st.bestanden[id]) st.bestanden[id] = 'op';
    bewaar();
    zet({ modus: 'ophalen', email: s.email, wie, fout: '' });
  } else zet({ modus: 'actief', email: s.email, wie, fout: '' });
  if (!stopLuister && B.luister) stopLuister = B.luister(rijen => { if (nagekeken) ontvang(rijen); });
  await syncNu();
}
function herstartLater() { clearTimeout(herstartTimer); herstartTimer = setTimeout(() => { herstart().catch(() => {}); }, 15_000); }

export async function start() {
  if (gestart) return; gestart = true;
  store.zetHaken({
    wijziging: markeer,
    wis: () => { gen++; st = { ...st, laatst: BEGIN, wacht: {}, mislukt: {} }; bewaar(); opnieuw = false; plan(0); },
  });
  zetExtern({
    gewijzigd: (id, op) => markeerBestand(id, op),
    haal: async id => (B && nagekeken ? B.bestandAf(id) : null),
  });
  try { B = await backend(); } catch (e) {
    // De bibliotheek kon niet laden: niet openzetten, later opnieuw proberen.
    zet({ modus: elders() ? 'offline' : 'controle', email: st.email, wie: st.wie, fout: e.message });
    gestart = false; setTimeout(() => start().catch(() => {}), 15_000);
    return;
  }
  if (!B) { zet({ modus: 'lokaal' }); return; }
  B.opAuth?.(() => { herstart().catch(() => {}); });
  addEventListener('online', () => (nagekeken ? plan(0) : herstart()));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) (nagekeken ? plan(0) : status.modus !== 'afgemeld' && herstart()); });
  setInterval(() => plan(0), 60_000);
  await herstart();
}

// Wat niet bewaard kon worden (te groot bestand, ongeldig record), om te tonen in Instellingen.
const NAAM = { berichten: 'Mail', communicatie: 'Contact', sollicitaties: 'Sollicitatie', vacatures: 'Vacature', hotlist: 'Hotlist', dossier: 'Document', agenda: 'Planning', stappenplan: 'Stap', welzijn: 'Test', dagboek: 'Dagboek', notities: 'Notitie', instellingen: 'Instelling' };
export function mislukteLijst() {
  return Object.entries(st.mislukt).map(([k, reden]) => {
    if (k.startsWith('bestand:')) return { wat: 'Bijlage', reden };
    const [c, id] = uitSleutel(k);
    const r = store.lokaalRecord(c, id) || {};
    return { wat: `${NAAM[c] || c} "${r.titel || r.onderwerp || r.naam || r.organisatie || id}"`, reden };
  });
}
export function mislukteOpnieuw() {
  const nu = new Date().toISOString();
  for (const k of Object.keys(st.mislukt)) {
    if (k.startsWith('bestand:')) st.bestanden[k.slice(8)] = 'op'; else st.wacht[k] = nu;
  }
  st.mislukt = {}; bewaar(); zet({}); plan(0);
}

// Knop 'Opnieuw proberen' op het aanmeldscherm.
export function probeerOpnieuw() {
  if (!B) { start().catch(() => {}); return; }
  if (nagekeken) plan(0); else herstart().catch(() => {});
}

// Aanmelden met e-mail en wachtwoord; een account maken of een nieuw wachtwoord kiezen met een toegangscode.
export async function aanmelden(email, wachtwoord) { if (!B) throw new Error('Geen database ingesteld.'); await B.aanmelden(email.trim().toLowerCase(), wachtwoord); await herstart(); }
export async function accountMaken(email, wachtwoord, code) { if (!B) throw new Error('Geen database ingesteld.'); await B.maakAccount(email.trim().toLowerCase(), wachtwoord, code); await aanmelden(email, wachtwoord); }
export async function codeMaken(wie) { if (!B) throw new Error('Geen database ingesteld.'); return B.codeMaken(wie); }

// Afmelden: eerst doorsturen wat nog wacht, dan alles van dit toestel wissen (gegevens en bijlagen).
export async function nogNietVerstuurd() { if (nagekeken) await syncNu().catch(() => {}); return Object.keys(st.wacht).length + Object.keys(st.bestanden).length; }
export async function afmelden() {
  gen++; nagekeken = '';
  clearTimeout(timer); clearTimeout(herstartTimer); opnieuw = false;
  stopLuister?.(); stopLuister = null;
  if (B) await B.afmelden().catch(() => {});
  store.wisAlles();
  st = leeg(); bewaar();
  try { localStorage.removeItem('remi-gmail-client-id'); localStorage.removeItem('remi-mail-handtekening'); } catch { /* geen opslag */ }
  await wisAlleBijlagen().catch(() => {});
  zet({ modus: 'afgemeld', email: '', wie: '' });
}
