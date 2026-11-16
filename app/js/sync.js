// Synchronisatie met de centrale database. Remi en Giulia zien zo dezelfde gegevens op elk toestel.
// Werkwijze:
// - Wat nog naar de database moet, volgt uit de gegevens zelf: een record wacht zolang de versie hier verschilt van
//   de laatste versie waarvan vaststaat dat de database ze heeft (st.gestuurd bewaart daarvan een vingerafdruk).
//   Zo gaat er niets verloren als een pakket half mislukt, als een ander tabblad iets wegschrijft of als de pagina
//   herlaadt.
// - Elke lokale wijziging gaat (na een korte pauze) naar de database. Wat het andere toestel wijzigt, komt binnen
//   via een live verbinding en bij elke synchronisatie.
// - Samenvoegen gebeurt veld per veld met stempels (store.samenvoegen), hier en in de database (trigger).
// - Volgorde: eerst records versturen, dan ophalen. De bijlagen (die kunnen traag zijn) lopen daarna in een eigen
//   lus met een eigen slot, los van de rondes voor de records: een trage upload houdt nooit een volgende ronde of
//   nogNietVerstuurd() tegen. Een bijlage die blijft falen, schuift achteraan.
// - Een tijdelijke fout (geen verbinding, server even weg) laat alles wachten. Alleen wat de database echt weigert,
//   komt bij 'mislukt'; dat blijft op dit toestel staan tot het opnieuw lukt.
// - Met meerdere tabbladen synchroniseert er maar één tegelijk (navigator.locks), en elk tabblad volgt wat de
//   andere wegschrijven (storage-event).
// - De gegevens zijn pas zichtbaar als de toegang nagekeken is (of eerder al nagekeken werd op dit toestel),
//   en op een nieuw toestel pas na de eerste volledige ophaalbeurt.
// - Afmelden wist de kopie op dit toestel alleen als dat gevraagd wordt én alles veilig in de database staat.
import * as store from './store.js';
import { backend, ingesteld } from './backend.js';
import { zetExtern, leesLokaal, lokaleSleutels, wisAlleBijlagen } from './bijlagen.js';

const SK = 'remi-sync-v2';
const BEGIN = '1970-01-01T00:00:00.000Z';
const ZONDER_DATUM = store.ZONDER_DATUM;
const OVERLAP = 60_000; // opnieuw ophalen wat net voor de vorige keer binnenkwam: dubbel toepassen kan geen kwaad
const PAKKET = 200;
const MAX_BIJLAGE = 50 * 1024 * 1024;
const SLOT = 'remi-nieuwe-start-sync';
const OPSLAG_VOL = 'Bewaren op dit toestel lukt niet: de opslag van de browser is vol. Wat al in de database staat, blijft veilig; maak ruimte of exporteer een reservekopie.';
const sleutel = (c, id) => `${c}\u0001${id}`;
const uitSleutel = k => { const i = k.indexOf('\u0001'); return [k.slice(0, i), k.slice(i + 1)]; };
// Het tijdperk verandert bij afmelden met wissen en bij een ander account; het loopt op met de tijd.
const nieuwTijdperk = () => Date.now().toString(36).padStart(9, '0') + Math.random().toString(36).slice(2, 6);
// gestuurd: sleutel -> vingerafdruk van de versie die de database zeker heeft. bestanden: bijlage -> 'op' of 'weg'.
// bestandenKlaar: recent afgewerkte bijlagen (voor het samenvoegen met andere tabbladen).
// mislukt: sleutel -> { reden, afdruk } (de geweigerde versie), of 'bestand:<id>' -> { reden, op }.
const leeg = (tijdperk = '') => ({ tijdperk, email: '', wie: '', klaar: '', laatst: BEGIN, gestuurd: {}, bestanden: {}, bestandenKlaar: {}, mislukt: {}, misluktTijdperk: '', laatsteSync: '' });

let B = null;
let laatsteTekst = null; // wat dit tabblad het laatst wegschreef of las
let opslagGelukt = true;
let st = lees();
let wacht = {};         // sleutel -> stempel: wat nog naar de database moet (volgt uit de gegevens)
let gen = 0;            // verhoogt bij afmelden en wissen: lopend werk van daarvoor mag niets meer veranderen
let nagekeken = '';     // e-mail waarvoor de toegang in deze sessie bevestigd is
let status = { modus: ingesteld() ? 'laden' : 'lokaal', open: !ingesteld(), email: '', wie: '', laatste: st.laatsteSync || '', fout: '', wachtend: 0, mislukt: 0, opslagVol: false };
const luisteraars = new Set();
let bezig = null, opnieuw = false, timer = null, herstartTimer = null, stopLuister = null, gestart = false, foutTeller = 0, luistertOpslag = false;
let bijlagenBezig = null, bijlagenOpnieuw = false, bijlagenTimer = null, bijlagenFouten = 0; // de eigen lus voor bijlagen

function normaal(ruw) {
  const s = { ...leeg(), ...(ruw && typeof ruw === 'object' ? ruw : {}) };
  for (const k of ['gestuurd', 'bestanden', 'bestandenKlaar', 'mislukt']) if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {};
  // Oud formaat: mislukt bevatte alleen de reden.
  for (const [k, v] of Object.entries(s.mislukt)) if (!v || typeof v !== 'object') s.mislukt[k] = { reden: String(v || '') };
  delete s.wacht; // vroeger een aparte wachtrij; nu volgt die uit de gegevens
  return s;
}
function lees() {
  try { laatsteTekst = localStorage.getItem(SK); return normaal(laatsteTekst ? JSON.parse(laatsteTekst) : null); } catch { return leeg(); }
}
function bewaar() {
  try { const t = JSON.stringify(st); localStorage.setItem(SK, t); laatsteTekst = t; opslagGelukt = true; } catch { opslagGelukt = false; }
  return opslagGelukt;
}
const elders = () => !!st.email && st.klaar === st.email && !!st.wie; // dit adres werkte hier al eerder volledig
// Hoeveel eigen wijzigingen nog wachten. Seed-records die nog nooit naar de database gingen, tellen niet mee:
// die staan ook in de app zelf.
function telWacht() { let n = 0; for (const k of Object.keys(wacht)) { const [c, id] = uitSleutel(k); if (store.lokaalRecord(c, id)) n++; } return n; }
function telOpen() { const w = telWacht() + Object.keys(st.bestanden).length, m = Object.keys(st.mislukt).length; return { wacht: w, mislukt: m, totaal: w + m }; }
function zet(patch) {
  const m = patch.modus || status.modus;
  const open = m === 'lokaal' || m === 'actief' || m === 'bezig' || ((m === 'offline' || m === 'fout') && elders());
  const t = telOpen();
  status = { ...status, ...patch, open, wachtend: t.wacht, mislukt: t.mislukt, opslagVol: !store.opslagOk() || !opslagGelukt };
  for (const fn of luisteraars) { try { fn(status); } catch (e) { console.warn(e); } }
}
export const syncStatus = () => status;
export function opStatus(fn) { luisteraars.add(fn); return () => luisteraars.delete(fn); }
export const actief = () => !!B && status.open && status.modus !== 'lokaal';

// ---------- Wat moet nog naar de database ----------
// Vingerafdruk van een record (inhoud met stempels, zoals jsonb::text), per object onthouden: de store vervangt
// een record bij elke wijziging door een nieuw object.
const afdrukken = new WeakMap();
function afdruk(rec) {
  if (!rec) return '';
  let a = afdrukken.get(rec);
  if (a === undefined) {
    const t = store.jsonTekst(rec);
    let h1 = 0x811c9dc5, h2 = 0x9e3779b9 ^ t.length;
    for (let i = 0; i < t.length; i++) { const c = t.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822519); }
    a = (h1 >>> 0).toString(36) + '.' + (h2 >>> 0).toString(36) + '.' + t.length.toString(36);
    afdrukken.set(rec, a);
  }
  return a;
}
// Moet deze versie nog naar de database? Niet als de database ze al heeft, en niet als juist deze versie geweigerd werd.
function moetMee(k, rec) {
  const a = afdruk(rec);
  const m = st.mislukt[k];
  if (m && m.afdruk === a) return false;
  return st.gestuurd[k] !== a;
}
function herbereken() {
  const w = {};
  for (const [c, r] of store.lokaleRecords()) { const k = sleutel(c, r.id); if (moetMee(k, r)) w[k] = r.bijgewerkt || ZONDER_DATUM; }
  // Seed-records gaan één keer volledig mee, zodat de database alles heeft (ook als de seed later leeg wordt).
  for (const [c, id] of store.seedRecords()) {
    const k = sleutel(c, id);
    if (k in w || store.lokaalRecord(c, id)) continue;
    if (moetMee(k, store.recordVoorDatabase(c, id))) w[k] = ZONDER_DATUM;
  }
  wacht = w;
}
// Een record of bijlage die eerder mislukte maar intussen gewijzigd of toch verstuurd is, is niet meer mislukt.
function ruimMisluktOp(s) {
  for (const [k, v] of Object.entries(s.mislukt)) {
    if (k.startsWith('bestand:')) { const id = k.slice(8); if (s.bestanden[id] || s.bestandenKlaar[id] === (v.op || 'op')) delete s.mislukt[k]; continue; }
    const [c, id] = uitSleutel(k);
    const huidig = afdruk(store.recordVoorDatabase(c, id));
    if (!huidig || v.afdruk !== huidig || s.gestuurd[k] === huidig) delete s.mislukt[k];
  }
}
function snoei() { const ks = Object.keys(st.bestandenKlaar); if (ks.length > 200) for (const k of ks.slice(0, ks.length - 200)) delete st.bestandenKlaar[k]; }
// De database heeft deze versie.
function zetGestuurd(k, a) { if (!a || st.gestuurd[k] === a) return false; st.gestuurd[k] = a; return true; }

// Lokale wijzigingen: ze wachten tot de volgende synchronisatie. Dat gebeurt ook vóór de aanmelding: ze gaan mee
// bij de eerste synchronisatie.
function markeer(c, rec) {
  if (!rec || rec.id === undefined || rec.id === null) return;
  const k = sleutel(c, rec.id);
  if (st.mislukt[k] && st.mislukt[k].afdruk !== afdruk(rec)) { delete st.mislukt[k]; bewaar(); } // gewijzigd: opnieuw proberen
  if (moetMee(k, rec)) wacht[k] = rec.bijgewerkt || ZONDER_DATUM; else delete wacht[k];
  zet({});
  plan(1200);
}
function markeerBestand(id, op) {
  delete st.bestanden[id]; st.bestanden[id] = op;
  delete st.bestandenKlaar[id]; delete st.mislukt['bestand:' + id];
  bewaar(); zet({}); plan(800);
}

export function plan(ms = 0) {
  if (!B || !nagekeken) return;
  clearTimeout(timer);
  timer = setTimeout(() => { syncNu().catch(() => {}); }, ms);
}
function later(ms) { clearTimeout(timer); timer = setTimeout(() => { syncNu().catch(() => {}); }, ms); }

// Een wijziging van het andere toestel pas tonen als niemand aan het typen is, anders verspringt het veld.
let uitgesteld = false;
function toon() {
  const el = typeof document !== 'undefined' ? document.activeElement : null;
  const typt = el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !['button', 'checkbox', 'radio', 'file'].includes(el.type);
  if (!typt) { store.melden(); return; }
  if (uitgesteld) return;
  uitgesteld = true;
  // Na het verlaten van het veld, maar niet midden in een klik: wachten tot de muis of vinger los is.
  el.addEventListener('blur', () => { setTimeout(() => { uitgesteld = false; store.melden(); }, 350); }, { once: true });
}
// Records uit de database toepassen. Wat de database al volledig heeft, hoeft niet meer verstuurd te worden.
function ontvang(rijen) {
  const res = store.pasToe(rijen, { stil: true });
  let nieuw = false;
  for (const [c, id] of res.gelijk) if (zetGestuurd(sleutel(c, id), afdruk(store.lokaalRecord(c, id)))) nieuw = true;
  if (nieuw) { ruimMisluktOp(st); bewaar(); }
  herbereken();
  zet({});
  if (res.veranderd) toon();
  return res;
}

// ---------- Eén synchronisatieronde ----------
// Met meerdere tabbladen: één tegelijk (per slot: records en bijlagen elk apart). Zonder navigator.locks gewoon meteen.
function metSlot(fn, naam = SLOT) {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : null;
  return locks?.request ? locks.request(naam, () => fn()) : fn();
}
export async function syncNu() {
  if (!B || !nagekeken) return;
  if (bezig) { opnieuw = true; return bezig; }
  const mijnGen = gen;
  const geldig = () => mijnGen === gen;
  bezig = metSlot(() => ronde(geldig)).catch(e => { console.warn(e); }).finally(() => {
    bezig = null;
    if (opnieuw) { opnieuw = false; plan(300); } // plan doet niets meer na afmelden
  });
  return bezig;
}
// Het latere van twee tijdstippen van de server (tekst zoals Postgres ze teruggeeft).
function laterTijd(a, b) {
  const x = Date.parse(a || ''), y = Date.parse(b || '');
  if (!Number.isFinite(x)) return b || BEGIN;
  if (!Number.isFinite(y)) return a;
  if (x !== y) return x > y ? a : b;
  return (a || '') > (b || '') ? a : b;
}
async function ronde(geldig) {
  // Wat een ander tabblad net wegschreef (de melding kan nog onderweg zijn).
  store.herlaad();
  herlaadSync();
  if (!geldig() || !nagekeken) return;
  store.bewaarOpnieuw(); // lukte bewaren eerder niet (opslag vol), dan nu opnieuw proberen
  if (status.modus === 'actief') zet({ modus: 'bezig' });
  // 1. Records versturen.
  let stop = await verstuur(geldig);
  if (!geldig()) return;
  // 2. Ophalen wat elders gewijzigd werd.
  let opgehaald = false, opslagProbleem = false;
  if (!stop) {
    try {
      const sinds = st.laatst === BEGIN ? BEGIN : new Date(Date.parse(st.laatst) - OVERLAP).toISOString();
      const rijen = await B.haal(sinds);
      if (!geldig()) return;
      if (rijen.length) {
        const res = ontvang(rijen);
        // Lukte het bewaren op dit toestel niet, dan het tijdstip niet opschuiven: volgende keer opnieuw ophalen.
        if (res.bewaard && store.opslagOk()) st.laatst = rijen.reduce((m, r) => laterTijd(r.server_tijd, m), st.laatst);
        else opslagProbleem = true;
      } else if (!store.opslagOk()) opslagProbleem = true;
      opgehaald = true;
    } catch (e) { if (!geldig()) return; stop = e; }
  }
  if (opgehaald) {
    st.laatsteSync = new Date().toISOString();
    if (st.klaar !== st.email) { st.klaar = st.email; migreerInstellingen(); }
  }
  bewaar();
  // 3. Bijlagen: in hun eigen lus (niet afwachten), zodat een trage upload deze en volgende rondes niet tegenhoudt.
  if (!stop) startBijlagen();
  if (stop) {
    foutTeller++;
    zet({ modus: stop.offline ? 'offline' : 'fout', fout: stop.message || String(stop) });
    if (stop.soort === 'toegang') herstartLater(); // aanmelding verlopen of toegang ingetrokken: opnieuw nakijken
    later(Math.min(300_000, 5000 * 2 ** Math.min(foutTeller, 6)));
    return;
  }
  if (opslagProbleem || !store.opslagOk() || !opslagGelukt) {
    foutTeller++;
    zet({ modus: 'fout', laatste: st.laatsteSync, fout: OPSLAG_VOL });
    later(Math.min(300_000, 5000 * 2 ** Math.min(foutTeller, 6)));
    return;
  }
  foutTeller = 0;
  zet({ modus: 'actief', laatste: st.laatsteSync, fout: '' });
}
function rijVoor(c, rec) {
  const bijgewerkt = rec.bijgewerkt || ZONDER_DATUM;
  const data = rec.verwijderd ? { id: rec.id, verwijderd: true, bijgewerkt, _t: {} } : { ...rec, bijgewerkt, _t: rec._t || {} };
  return { collectie: c, id: rec.id, data, bijgewerkt, verwijderd: !!rec.verwijderd };
}
// Wat de database aanvaardde: die versie staat er. Is het record intussen opnieuw gewijzigd, dan blijft het wachten.
const verstuurdeAfdruk = new WeakMap(); // rij -> vingerafdruk van het record waaruit ze gemaakt werd
function bevestig(rijen) {
  for (const r of rijen) {
    const k = sleutel(r.collectie, r.id);
    zetGestuurd(k, verstuurdeAfdruk.get(r));
    const nu = store.recordVoorDatabase(r.collectie, r.id);
    if (nu && moetMee(k, nu)) wacht[k] = nu.bijgewerkt || ZONDER_DATUM; else delete wacht[k];
  }
  ruimMisluktOp(st);
  bewaar(); zet({});
}
// Records versturen in pakketten. Geeft de fout terug die de ronde stopt (tijdelijk, toegang of iets anders), of null.
async function verstuur(geldig) {
  herbereken();
  const keys = Object.keys(wacht);
  for (let i = 0; i < keys.length; i += PAKKET) {
    const rijen = [];
    for (const k of keys.slice(i, i + PAKKET)) {
      if (!(k in wacht)) continue; // intussen al verstuurd (bijvoorbeeld door een ander tabblad)
      const [c, id] = uitSleutel(k);
      const rec = store.recordVoorDatabase(c, id);
      if (!rec || !moetMee(k, rec)) { delete wacht[k]; continue; }
      const rij = rijVoor(c, rec);
      verstuurdeAfdruk.set(rij, afdruk(rec));
      rijen.push(rij);
    }
    if (!rijen.length) continue;
    try {
      await B.stuur(rijen);
      if (!geldig()) return null;
      bevestig(rijen);
    } catch (e) {
      if (!geldig()) return null;
      // Een tijdelijke fout (of geen toegang): niet één voor één proberen, alles blijft wachten.
      if (e?.soort !== 'ongeldig') return e;
      // De database weigerde het pakket: één voor één, zodat één slecht record de rest niet tegenhoudt.
      for (const r of rijen) {
        try {
          await B.stuur([r]);
          if (!geldig()) return null;
          bevestig([r]);
        } catch (e2) {
          if (!geldig()) return null;
          if (e2?.soort !== 'ongeldig') return e2; // wat nog niet verstuurd is, blijft gewoon wachten
          const k = sleutel(r.collectie, r.id);
          st.mislukt[k] = { reden: e2.message || String(e2), afdruk: verstuurdeAfdruk.get(r) };
          delete wacht[k];
          bewaar(); zet({});
        }
      }
    }
  }
  return null;
}
// ---------- Bijlagen: een eigen lus ----------
// Los van de rondes voor de records, met een eigen slot (één tabblad tegelijk) en een eigen 'bezig'. Een volgende
// ronde verstuurt en haalt dus altijd meteen op, ook terwijl een grote upload loopt; nogNietVerstuurd() wacht er
// niet op (wat nog op te laden is, telt wel mee als 'wacht'). Stopt de lus op een tijdelijke fout, dan probeert ze
// het later opnieuw (steeds wat later), of bij de volgende ronde.
function startBijlagen() {
  if (!B || !nagekeken) return Promise.resolve();
  if (bijlagenBezig) { bijlagenOpnieuw = true; return bijlagenBezig; }
  herlaadSync();
  if (!Object.keys(st.bestanden).length) return Promise.resolve();
  clearTimeout(bijlagenTimer);
  const mijnGen = gen;
  const geldig = () => mijnGen === gen && !!nagekeken;
  bijlagenBezig = Promise.resolve(metSlot(() => (geldig() ? (herlaadSync(), bijlagen(geldig)) : null), SLOT + '-bijlagen'))
    .then(fout => {
      if (!geldig()) return;
      if (!fout) { bijlagenFouten = 0; return; }
      bijlagenFouten++;
      clearTimeout(bijlagenTimer);
      bijlagenTimer = setTimeout(() => { startBijlagen(); }, Math.min(300_000, 5000 * 2 ** Math.min(bijlagenFouten, 6)));
    })
    .catch(e => { console.warn(e); })
    .finally(() => {
      bijlagenBezig = null;
      if (bijlagenOpnieuw) { bijlagenOpnieuw = false; startBijlagen(); } // startBijlagen kijkt zelf of er nog iemand aangemeld is
    });
  return bijlagenBezig;
}
// Wacht tot de lopende bijlagenlus klaar is (voor wie het echt moet weten, zoals de tests). Start er geen nieuwe.
export async function bijlagenKlaar() { while (bijlagenBezig) await bijlagenBezig; }

// Bijlagen opladen of verwijderen. Geeft de fout terug waarop de lus stopte, of null.
async function bijlagen(geldig) {
  const achteraan = (id, op) => { if (st.bestanden[id] === op) { delete st.bestanden[id]; st.bestanden[id] = op; } };
  for (const id of Object.keys(st.bestanden)) {
    const op = st.bestanden[id];
    if (op === undefined) continue;
    try {
      if (op === 'op') {
        let blob;
        try { blob = await leesLokaal(id); } catch { if (!geldig()) return null; achteraan(id, op); continue; } // lezen lukte nu niet: later opnieuw
        if (!geldig()) return null;
        if (blob) {
          if (blob.size > MAX_BIJLAGE) throw Object.assign(new Error('Het bestand is groter dan 50 MB.'), { soort: 'ongeldig' });
          await B.bestandOp(id, blob);
        }
      } else await B.bestandWeg(id);
      if (!geldig()) return null;
      if (st.bestanden[id] === op) { delete st.bestanden[id]; st.bestandenKlaar[id] = op; snoei(); }
      bewaar(); zet({});
    } catch (e) {
      if (!geldig()) return null;
      if (e?.soort === 'ongeldig') {
        // Blijvende fout voor dit ene bestand: apart zetten, de rest gaat door. Het bestand blijft op dit toestel.
        st.mislukt['bestand:' + id] = { reden: e.message || String(e), op };
        if (st.bestanden[id] === op) delete st.bestanden[id];
        bewaar(); zet({});
        continue;
      }
      // Tijdelijke fout: achteraan in de rij, zodat de volgende ronde met een andere bijlage begint.
      achteraan(id, op);
      bewaar(); zet({});
      return e;
    }
  }
  return null;
}

// Gmail-client-ID en handtekening die alleen op dit toestel stonden, gaan één keer mee naar de gedeelde instellingen.
function migreerInstellingen() {
  try {
    const gedeeld = store.get('instellingen', 'mail') || {};
    const patch = { id: 'mail' };
    const cid = localStorage.getItem('remi-gmail-client-id'), ht = localStorage.getItem('remi-mail-handtekening');
    if (cid && typeof gedeeld.clientId !== 'string') patch.clientId = cid;
    if (ht && typeof gedeeld.handtekening !== 'string') patch.handtekening = ht;
    if (Object.keys(patch).length > 1) store.upsert('instellingen', patch, { silent: true, herstel: true });
  } catch { /* niet erg */ }
}

// ---------- Meerdere tabbladen ----------
// Een ander tabblad schreef de toestand weg: samenvoegen. Een nieuwer tijdperk (afmelden met wissen, ander account)
// wint; een ouder tijdperk wordt overschreven met de toestand van hier.
function neemOverSync(ander) {
  const ta = ander.tijdperk || '', tm = st.tijdperk || '';
  if (ta > tm) { gen++; st = ander; herbereken(); zet({}); return; }
  if (ta < tm) { bewaar(); return; }
  const uit = { ...ander };
  uit.laatst = laterTijd(ander.laatst, st.laatst);
  uit.laatsteSync = (ander.laatsteSync || '') > (st.laatsteSync || '') ? ander.laatsteSync : (st.laatsteSync || '');
  uit.email = ander.email || st.email;
  uit.klaar = [ander, st].map(x => (x.email === uit.email ? x.klaar : '')).find(Boolean) || '';
  uit.wie = [ander, st].map(x => (x.email === uit.email ? x.wie : '')).find(Boolean) || '';
  // gestuurd: verschillen de twee, dan telt de versie die hier nu staat; anders opnieuw versturen (kan geen kwaad).
  uit.gestuurd = { ...ander.gestuurd };
  for (const [k, a] of Object.entries(st.gestuurd)) {
    if (!(k in uit.gestuurd)) { uit.gestuurd[k] = a; continue; }
    if (uit.gestuurd[k] === a) continue;
    const [c, id] = uitSleutel(k);
    const huidig = afdruk(store.recordVoorDatabase(c, id));
    if (a === huidig) uit.gestuurd[k] = a; else if (uit.gestuurd[k] !== huidig) delete uit.gestuurd[k];
  }
  uit.bestandenKlaar = { ...ander.bestandenKlaar };
  for (const [id, op] of Object.entries(st.bestandenKlaar)) if (!(id in uit.bestandenKlaar)) uit.bestandenKlaar[id] = op;
  uit.bestanden = {};
  for (const [id, op] of Object.entries(ander.bestanden)) if (st.bestandenKlaar[id] !== op) uit.bestanden[id] = op;
  for (const [id, op] of Object.entries(st.bestanden)) if (!(id in uit.bestanden) && ander.bestandenKlaar[id] !== op) uit.bestanden[id] = op;
  const ma = ander.misluktTijdperk || '', mm = st.misluktTijdperk || '';
  if (ma !== mm) { uit.mislukt = { ...(ma > mm ? ander.mislukt : st.mislukt) }; uit.misluktTijdperk = ma > mm ? ma : mm; }
  else {
    uit.mislukt = { ...ander.mislukt };
    for (const [k, v] of Object.entries(st.mislukt)) if (!uit.mislukt[k]) uit.mislukt[k] = v;
  }
  ruimMisluktOp(uit);
  const veranderd = store.jsonTekst(uit) !== store.jsonTekst(ander);
  st = uit;
  if (veranderd) bewaar();
  herbereken();
  zet({});
}
function herlaadSync() {
  let t = null;
  try { t = localStorage.getItem(SK); } catch { return; }
  if (t === null || t === laatsteTekst) return;
  laatsteTekst = t;
  try { neemOverSync(normaal(JSON.parse(t))); } catch { /* onleesbaar: negeren */ }
}

// ---------- Aanmelden en toegang ----------
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
  if (st.email && st.email !== s.email) {
    // Ander account: alles opnieuw ophalen. Wat hier nog wacht, gaat mee (de database is gedeeld).
    st = { ...leeg(nieuwTijdperk()), gestuurd: st.gestuurd, bestanden: st.bestanden, mislukt: st.mislukt, misluktTijdperk: st.misluktTijdperk };
  }
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
    // Eerste keer op dit toestel: alles wat hier al stond, gaat mee naar de database (samengevoegd per veld).
    let sleutels = null;
    try { sleutels = await lokaleSleutels(); } catch { sleutels = null; }
    if (mijnGen !== gen) return;
    if (sleutels) for (const id of sleutels) if (!st.bestanden[id]) st.bestanden[id] = 'op';
    bewaar(); herbereken();
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
    // De kopie op dit toestel werd gewist (opnieuw ophalen): alles opnieuw ophalen. De database blijft wat ze is.
    // Wat niet bewaard kon worden, blijft gemeld zolang het record nog op dit toestel staat (opnieuwOphalen houdt
    // het); alleen wat echt weg is (uitdrukkelijk bevestigd), verdwijnt uit de lijst. Mislukte bijlagen blijven.
    wis: () => {
      gen++;
      st = { ...st, laatst: BEGIN, mislukt: { ...st.mislukt }, misluktTijdperk: nieuwTijdperk() };
      ruimMisluktOp(st);
      bewaar(); herbereken(); opnieuw = false; zet({}); plan(0);
    },
    opslag: () => zet({}),
    // Een ander tabblad wijzigde gegevens.
    elders: () => { herbereken(); zet({}); toon(); },
  });
  zetExtern({
    gewijzigd: (id, op) => markeerBestand(id, op),
    haal: async id => (B && nagekeken ? B.bestandAf(id) : null),
  });
  if (!luistertOpslag && typeof addEventListener === 'function') {
    luistertOpslag = true;
    addEventListener('storage', e => {
      try { if (e.storageArea && e.storageArea !== localStorage) return; } catch { return; }
      if (e.key !== SK || !e.newValue) return;
      laatsteTekst = e.newValue;
      try { neemOverSync(normaal(JSON.parse(e.newValue))); } catch { /* onleesbaar: negeren */ }
    });
  }
  herbereken(); zet({});
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
  return Object.entries(st.mislukt).map(([k, v]) => {
    if (k.startsWith('bestand:')) return { wat: 'Bijlage', reden: v.reden };
    const [c, id] = uitSleutel(k);
    const r = store.recordVoorDatabase(c, id) || {};
    return { wat: `${NAAM[c] || c} "${r.titel || r.onderwerp || r.naam || r.organisatie || id}"`, reden: v.reden };
  });
}
export function mislukteOpnieuw() {
  for (const [k, v] of Object.entries(st.mislukt)) {
    if (!k.startsWith('bestand:')) continue;
    const id = k.slice(8);
    if (!st.bestanden[id]) st.bestanden[id] = v.op || 'op';
    delete st.bestandenKlaar[id];
  }
  st.mislukt = {}; st.misluktTijdperk = nieuwTijdperk();
  bewaar(); herbereken(); zet({}); plan(0);
}

// Knop 'Opnieuw proberen' op het aanmeldscherm.
export function probeerOpnieuw() {
  if (!B) { start().catch(() => {}); return; }
  if (nagekeken) plan(0); else herstart().catch(() => {});
}

// Aanmelden met e-mail en wachtwoord; een account maken of een nieuw wachtwoord kiezen met een toegangscode.
export async function aanmelden(email, wachtwoord) { if (!B) throw new Error('Geen database ingesteld.'); await B.aanmelden(String(email || '').trim().toLowerCase(), wachtwoord); await herstart(); }
export async function accountMaken(email, wachtwoord, code) { if (!B) throw new Error('Geen database ingesteld.'); await B.maakAccount(String(email || '').trim().toLowerCase(), wachtwoord, code); await aanmelden(email, wachtwoord); }
// Al aangemeld zonder toegang: een toegangscode inwisselen (zonder wachtwoord), daarna de toegang opnieuw nakijken.
export async function koppelCode(code) {
  if (!B) throw new Error('Geen database ingesteld.');
  if (!B.koppel) throw new Error('Deze versie van de database kent koppelen met een code niet.');
  const r = await B.koppel(code);
  await herstart();
  return r;
}
// Een toegangscode voor Remi of Giulia, gebonden aan hun e-mailadres.
export async function codeMaken(wie, email) { if (!B) throw new Error('Geen database ingesteld.'); return B.codeMaken(wie, String(email || '').trim().toLowerCase()); }

// 'Opnieuw ophalen uit de database': de kopie op dit toestel wissen en alles opnieuw ophalen. Records die nog
// wachten of die de database weigerde, blijven staan (en gaan later alsnog mee, of blijven gemeld), tenzij
// ookOnverstuurd uitdrukkelijk gevraagd wordt. Bijlagen op dit toestel blijven altijd staan.
export function opnieuwOphalen({ ookOnverstuurd = false } = {}) {
  store.herlaad(); herlaadSync(); herbereken();
  const houd = new Set([...Object.keys(wacht), ...Object.keys(st.mislukt)]);
  store.resetLocal(ookOnverstuurd ? {} : { behoud: (c, r) => houd.has(sleutel(c, r.id)) });
}

// Hoeveel nog niet in de database staat: { wacht, mislukt, totaal }. Eerst nog proberen door te sturen (alleen de
// records; op lopende uploads van bijlagen wordt niet gewacht, die tellen mee als 'wacht').
export async function nogNietVerstuurd() {
  store.herlaad(); herlaadSync(); // wat een ander tabblad net wegschreef, telt mee
  if (nagekeken) {
    const lopend = !!bezig;
    await syncNu().catch(() => {});
    if (lopend) await syncNu().catch(() => {}); // de lopende ronde zag de laatste wijzigingen misschien nog niet
  }
  return telOpen();
}
// Afmelden op dit toestel. Met { wissen: true } gaan de kopie en de bijlagen van dit toestel weg, maar alleen als
// dit toestel volledig gesynchroniseerd is en er niets wacht of mislukt is. Anders sluit alleen de sessie en blijft
// alles staan; bij de volgende aanmelding gaat het alsnog naar de database. Geeft { gewist, wacht, mislukt, totaal }.
export async function afmelden({ wissen = false } = {}) {
  store.herlaad(); herlaadSync(); herbereken();
  const open = telOpen();
  const wis = wissen === true && !!st.email && st.klaar === st.email && open.totaal === 0;
  gen++; nagekeken = '';
  clearTimeout(timer); clearTimeout(herstartTimer); clearTimeout(bijlagenTimer); opnieuw = false; bijlagenOpnieuw = false;
  stopLuister?.(); stopLuister = null;
  if (B) await Promise.resolve().then(() => B.afmelden()).catch(() => {});
  if (wis) {
    store.wisAlles();
    st = leeg(nieuwTijdperk()); bewaar();
    try { localStorage.removeItem('remi-gmail-client-id'); localStorage.removeItem('remi-mail-handtekening'); } catch { /* geen opslag */ }
    await wisAlleBijlagen().catch(() => {});
    herbereken();
  } else {
    // Alles blijft staan. De toegang moet na een nieuwe aanmelding wel opnieuw nagekeken worden.
    st.wie = ''; bewaar();
  }
  zet({ modus: 'afgemeld', email: '', wie: '', fout: '' });
  return { gewist: wis, ...open };
}
