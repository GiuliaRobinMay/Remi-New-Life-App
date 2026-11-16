// Data layer: seed (from data/*.json via build-data) plus a localStorage overlay. Export and import as JSON.
// Met een centrale database (sync.js) is de overlay een kopie op dit toestel: elke wijziging gaat via de haak
// naar de database, en wat het andere toestel wijzigt komt binnen via pasToe().
//
// Stempels per veld: elk record in de overlay heeft naast bijgewerkt een object _t met per veld de stempel
// (ISO-tekst) van de laatste wijziging van dat veld. Een grafsteentje is { id, verwijderd: true, bijgewerkt, _t: {} }.
// Twee versies samenvoegen gebeurt met samenvoegen(), met exact dezelfde regels als de trigger records_stempel
// in de database (supabase/schema.sql):
// 1. Is een van beide een grafsteentje, dan wint de versie met de hoogste bijgewerkt volledig; bij gelijke
//    bijgewerkt wint het grafsteentje. Een herleefd record (later bewerkt dan het grafsteentje) vervangt het volledig.
// 2. Anders per veld: de waarde met de hoogste stempel wint (zonder stempel = lege tekst = laagst). Bij gelijke
//    stempel wint de waarde met de grootste JSON-tekst (zoals jsonb::text, bytegewijs vergeleken). Velden die maar
//    aan één kant bestaan, blijven. _t wordt het maximum per veld, bijgewerkt het maximum.
import { seed } from './seed.js';
const KEY = 'remi-nieuwe-start-v1';
const MERGED = ['sollicitaties', 'vacatures', 'hotlist', 'stappenplan', 'verkenning', 'opleidingen', 'notities', 'agenda', 'antwoorden', 'cvdoc', 'competentiescores', 'zelftests', 'berichten', 'communicatie', 'dossier', 'welzijn', 'dagboek', 'instellingen'];
export const ZONDER_DATUM = '2000-01-01T00:00:00.000Z'; // records zonder datum verliezen van elke echte bewerking
const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/;
const GEEN_VELD = new Set(['id', 'bijgewerkt', '_t', 'verwijderd']);
const listeners = new Set();

// ---------- JSON-tekst zoals de database ze vergelijkt ----------
// Zoals jsonb::text: sleutels gesorteerd (korter eerst, dan bytegewijs), ', ' en ': ' als scheiding.
const enc = new TextEncoder();
function vergelijkBytes(a, b) {
  const x = enc.encode(a), y = enc.encode(b), n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return x.length - y.length;
}
const ASCII = /^[\x00-\x7f]*$/;
// Voor gewone (ASCII-)sleutels is de volgorde van tekens dezelfde als die van bytes; anders echt in bytes vergelijken.
const sleutelVolgorde = (a, b) => (ASCII.test(a) && ASCII.test(b)
  ? (a.length - b.length) || (a < b ? -1 : a > b ? 1 : 0)
  : (enc.encode(a).length - enc.encode(b).length) || vergelijkBytes(a, b));
export function jsonTekst(v) {
  if (v === undefined || typeof v === 'function') return 'null';
  if (Array.isArray(v)) return '[' + v.map(jsonTekst).join(', ') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).filter(k => v[k] !== undefined && typeof v[k] !== 'function').sort(sleutelVolgorde)
      .map(k => JSON.stringify(k) + ': ' + jsonTekst(v[k])).join(', ') + '}';
  }
  return JSON.stringify(v) ?? 'null';
}
const gelijk = (a, b) => jsonTekst(a) === jsonTekst(b);
// Is een waarde uit een bewerking dezelfde als wat er staat? Een object of lijst die de app rechtstreeks uit de
// opslag kreeg (zelfde verwijzing), kan ter plaatse gewijzigd zijn: die telt altijd als gewijzigd.
function onveranderd(a, b) {
  if (a === b) return a === null || typeof a !== 'object';
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => onveranderd(x ?? null, b[i] ?? null));
  const ka = Object.keys(a).filter(k => a[k] !== undefined), kb = Object.keys(b).filter(k => b[k] !== undefined);
  return ka.length === kb.length && ka.every(k => b[k] !== undefined && onveranderd(a[k], b[k]));
}
const kopie = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
// Een datum als ISO-tekst met milliseconden (zoals toISOString), of '' als ze niet te lezen is.
function iso(x) {
  if (typeof x === 'string' && ISO.test(x)) return x;
  const ms = typeof x === 'number' ? x : Date.parse(x || '');
  if (!Number.isFinite(ms)) return '';
  const t = new Date(ms).toISOString();
  return ISO.test(t) ? t : '';
}

// Twee versies van hetzelfde record samenvoegen (zie de regels bovenaan). Geeft een nieuw object terug.
export function samenvoegen(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  const ba = a.bijgewerkt || '', bb = b.bijgewerkt || '';
  if (a.verwijderd || b.verwijderd) {
    if (ba !== bb) return ba > bb ? a : b;
    return a.verwijderd ? a : b;
  }
  const ta = a._t || {}, tb = b._t || {};
  const uit = { id: a.id ?? b.id };
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (GEEN_VELD.has(k)) continue;
    const va = a[k], vb = b[k];
    if (vb === undefined) { if (va !== undefined) uit[k] = va; continue; }
    if (va === undefined) { uit[k] = vb; continue; }
    const sa = ta[k] || '', sb = tb[k] || '';
    if (sa !== sb) uit[k] = sa > sb ? va : vb;
    else uit[k] = vergelijkBytes(jsonTekst(va), jsonTekst(vb)) >= 0 ? va : vb;
  }
  const t = { ...ta };
  for (const [k, s] of Object.entries(tb)) if ((s || '') > (t[k] || '')) t[k] = s;
  uit.bijgewerkt = ba > bb ? ba : bb;
  uit._t = t;
  return uit;
}

// ---------- Seed ----------
const seedIdx = new Map();
function seedRecord(c, id) {
  let m = seedIdx.get(c);
  if (!m) { m = new Map((Array.isArray(seed[c]) ? seed[c] : []).filter(x => x && x.id).map(x => [x.id, x])); seedIdx.set(c, m); }
  return m.get(id) || null;
}
// Het seed-record als basis om samen te voegen: alle velden, zonder stempels.
function seedBasis(c, id) {
  const s = seedRecord(c, id);
  if (!s) return null;
  const uit = { id };
  for (const [k, v] of Object.entries(s)) if (!GEEN_VELD.has(k)) uit[k] = kopie(v);
  return uit;
}
// Alle seed-records van de gedeelde collecties (sync.js stuurt ze één keer naar de database).
export function seedRecords() { const out = []; for (const c of MERGED) for (const r of (Array.isArray(seed[c]) ? seed[c] : [])) if (r && r.id) out.push([c, r.id]); return out; }

// ---------- De kopie op dit toestel ----------
// Het tijdperk van de kopie verandert bij wissen en opnieuw beginnen. Het loopt op met de tijd, zodat een
// ander tabblad dat nog met een oudere kopie werkt, die niet terug kan schrijven.
const nieuwTijdperk = () => Date.now().toString(36).padStart(9, '0') + Math.random().toString(36).slice(2, 6);
// Een record uit de opslag in orde zetten. Oude records zonder _t krijgen per veld de stempel van het record
// (zonder datum: ZONDER_DATUM), zodat eigen bewerkingen van vroeger winnen van de seed. Een record uit de seed
// wordt volledig bewaard: ontbrekende seed-velden komen erbij, zonder stempel.
function normaliseer(c, r) {
  if (!r || typeof r !== 'object' || r.id === undefined || r.id === null || r.id === '') return null;
  let bw = iso(r.bijgewerkt);
  if (r.verwijderd) return { id: r.id, verwijderd: true, bijgewerkt: bw || ZONDER_DATUM, _t: {} };
  const uit = { ...r };
  delete uit.verwijderd;
  if (!uit._t || typeof uit._t !== 'object' || Array.isArray(uit._t)) {
    bw = bw || ZONDER_DATUM;
    uit._t = {};
    for (const k of Object.keys(uit)) if (!GEEN_VELD.has(k)) uit._t[k] = bw;
  }
  const s = seedRecord(c, r.id);
  if (s) for (const [k, v] of Object.entries(s)) if (!GEEN_VELD.has(k) && uit[k] === undefined) uit[k] = kopie(v);
  uit.bijgewerkt = bw;
  return uit;
}
function opbouw(ruw) {
  const uit = { _meta: { tijdperk: String(ruw?._meta?.tijdperk || ''), klok: iso(ruw?._meta?.klok) } };
  for (const c of MERGED) {
    const lijst = [], pos = new Map();
    for (const r of (Array.isArray(ruw?.[c]) ? ruw[c] : [])) {
      const n = normaliseer(c, r);
      if (!n) continue;
      if (pos.has(n.id)) lijst[pos.get(n.id)] = samenvoegen(lijst[pos.get(n.id)], n);
      else { pos.set(n.id, lijst.length); lijst.push(n); }
    }
    if (lijst.length) uit[c] = lijst;
  }
  return uit;
}
let laatsteTekst = null; // wat dit tabblad het laatst wegschreef of las
function leesOpslag() { try { const t = localStorage.getItem(KEY); laatsteTekst = t; return t ? JSON.parse(t) : null; } catch { return null; } }
let local = opbouw(leesOpslag() || {});
let idx = new Map(); // collectie -> Map(id -> positie)
const lijst = c => (Array.isArray(local[c]) ? local[c] : []);
function index(c) {
  let m = idx.get(c);
  if (!m) { m = new Map(); lijst(c).forEach((r, i) => m.set(r.id, i)); idx.set(c, m); }
  return m;
}
function vind(c, id) { const i = index(c).get(id); return i === undefined ? null : local[c][i]; }
function zetRecord(c, rec) {
  const arr = Array.isArray(local[c]) ? local[c] : (local[c] = []);
  const m = index(c), i = m.get(rec.id);
  if (i === undefined) { m.set(rec.id, arr.length); arr.push(rec); } else arr[i] = rec;
}
function vervangLocal(nieuw) { local = nieuw; idx = new Map(); }

// Bewaren op dit toestel. Geeft terug of het lukte (een volle opslag geeft false).
let opslagGelukt = true;
function persist() {
  let ok = true;
  try { const t = JSON.stringify(local); localStorage.setItem(KEY, t); laatsteTekst = t; } catch (e) { ok = false; console.warn('Opslaan lukte niet', e); }
  if (ok !== opslagGelukt) { opslagGelukt = ok; try { opslagHaak?.(ok); } catch (e) { console.warn(e); } }
  return ok;
}
export const opslagOk = () => opslagGelukt;
// Opnieuw proberen te bewaren na een volle opslag (sync.js doet dit bij elke ronde).
export function bewaarOpnieuw() { return opslagGelukt ? true : persist(); }
function emit() { for (const fn of listeners) fn(); }
export const melden = emit;
// Haken voor de synchronisatie: wat lokaal verandert, wanneer de lokale kopie gewist wordt, of het bewaren lukt,
// en wanneer een ander tabblad iets veranderde.
let wijzigingHaak = null, wisHaak = null, opslagHaak = null, eldersHaak = null;
export function zetHaken({ wijziging, wis, opslag, elders }) { wijzigingHaak = wijziging || null; wisHaak = wis || null; opslagHaak = opslag || null; eldersHaak = elders || null; }
const meldWijziging = (name, rec) => { try { wijzigingHaak?.(name, rec); } catch (e) { console.warn(e); } };
const meldElders = () => { if (eldersHaak) { try { eldersHaak(); } catch (e) { console.warn(e); } } else emit(); };
export const collecties = () => MERGED.slice();
export function lokaalRecord(name, id) { return vind(name, id); }
export function lokaleRecords() { const out = []; for (const k of MERGED) for (const r of lijst(k)) if (r && r.id) out.push([k, r]); return out; }
// Het record zoals het naar de database gaat: de kopie op dit toestel, of anders het seed-record (zonder stempels).
// Niet wijzigen: het is het bewaarde object zelf.
const seedVoorDb = new Map();
export function recordVoorDatabase(name, id) {
  const r = vind(name, id);
  if (r) return r;
  const k = `${name}\u0001${id}`;
  if (!seedVoorDb.has(k)) { const s = seedBasis(name, id); seedVoorDb.set(k, s ? { ...s, bijgewerkt: ZONDER_DATUM, _t: {} } : null); }
  return seedVoorDb.get(k);
}

// ---------- Klok (hybride): nooit lager dan wat dit record of de server al had ----------
function zieStempel(s) {
  const t = iso(s);
  if (t && t > (local._meta.klok || '')) local._meta.klok = t;
}
function nieuweStempel(vorige) {
  const v = Date.parse(vorige || ''), h = Date.parse(local._meta.klok || '');
  const t = iso(Math.max(Date.now(), Number.isFinite(v) ? v + 1 : 0, Number.isFinite(h) ? h + 1 : 0));
  return t || new Date().toISOString();
}

// Records van de database (of het andere toestel) toepassen, samengevoegd volgens de regels bovenaan.
// Geeft { veranderd, bewaard, gelijk } terug: bewaard = de kopie staat veilig in de opslag (false bij een volle
// opslag), gelijk = [collectie, id, bijgewerkt] van records waarvan de database al alles heeft wat hier staat.
export function pasToe(rijen, { stil = false } = {}) {
  let veranderd = false;
  const gelijkAanServer = [];
  for (const r of rijen || []) {
    if (!r || !MERGED.includes(r.collectie) || r.id === undefined || r.id === null || r.id === '' || !r.data || typeof r.data !== 'object') continue;
    const d = r.data;
    const bw = iso(d.bijgewerkt) || iso(r.bijgewerkt) || ZONDER_DATUM;
    let inkomend;
    if (r.verwijderd || d.verwijderd) inkomend = { id: r.id, verwijderd: true, bijgewerkt: bw, _t: {} };
    else {
      inkomend = { ...d, id: r.id, bijgewerkt: bw, _t: d._t && typeof d._t === 'object' && !Array.isArray(d._t) ? { ...d._t } : {} };
      delete inkomend.verwijderd;
    }
    zieStempel(bw);
    for (const s of Object.values(inkomend._t)) zieStempel(s);
    if (r.server_tijd) zieStempel(r.server_tijd);
    const lok = vind(r.collectie, r.id);
    const nieuw = samenvoegen(lok || seedBasis(r.collectie, r.id), inkomend);
    const tekst = jsonTekst(nieuw);
    if (tekst === jsonTekst(inkomend)) gelijkAanServer.push([r.collectie, r.id, nieuw.bijgewerkt]);
    if (lok && tekst === jsonTekst(lok)) continue;
    zetRecord(r.collectie, nieuw);
    veranderd = true;
  }
  const bewaard = veranderd ? persist() : true;
  if (veranderd && !stil) emit();
  return { veranderd, bewaard, gelijk: gelijkAanServer };
}
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function all(name) {
  const base = Array.isArray(seed[name]) ? seed[name] : [];
  const byId = new Map(base.map(x => [x.id, { ...x }]));
  for (const o of lijst(name)) byId.set(o.id, { ...(byId.get(o.id) || {}), ...o });
  const uit = [];
  for (const x of byId.values()) if (!x.verwijderd) { delete x._t; uit.push(x); }
  return uit;
}
export function get(name, id) { return all(name).find(x => x.id === id); }

// Fout bij een bewerking van een record dat intussen verwijderd werd (hier of op een ander toestel).
function verwijderdFout(name, id) {
  return Object.assign(new Error('Dit werd intussen verwijderd, misschien op een ander toestel. De wijziging is niet bewaard.'), { verwijderd: true, collectie: name, id });
}
// Bewaren: alleen de velden in item. Elk veld dat verschilt van wat hier nu staat, krijgt een nieuwe stempel;
// velden met dezelfde waarde houden hun stempel. Let op: een veld met een oude waarde (uit een kopie van vroeger)
// verschilt van wat hier nu staat en overschrijft dus wat intussen veranderde. Formulieren sturen daarom alleen
// de velden die in het formulier gewijzigd zijn (gewijzigdeVelden), en lijsten waar meerdere toestellen aan
// toevoegen, gaan per item (itemErbij). De eerste bewerking van een seed-record bewaart het volledige record
// (seed-velden zonder stempel). Een record dat verwijderd werd, herleeft alleen met { herstel: true }; anders volgt
// een fout. Records met een vaste id (cv, instellingen, antwoorden, testen) bewaren altijd met { herstel: true }.
export function upsert(name, item, { silent = false, herstel = false } = {}) {
  if (!MERGED.includes(name)) throw new Error('Onbekende collectie ' + name);
  if (!item || item.id === undefined || item.id === null || item.id === '') throw new Error('Record zonder id in ' + name);
  const id = item.id;
  const oud = vind(name, id);
  if (oud?.verwijderd && !herstel) throw verwijderdFout(name, id);
  const basis = oud?.verwijderd ? { id } : (oud || seedBasis(name, id));
  const stempel = nieuweStempel(oud?.bijgewerkt);
  const rec = basis ? { ...basis, _t: { ...(basis._t || {}) } } : { id, _t: {} };
  delete rec.verwijderd;
  let gewijzigd = !basis || !!oud?.verwijderd;
  for (const [k, v0] of Object.entries(item)) {
    if (GEEN_VELD.has(k) || typeof v0 === 'function') continue;
    let v = v0;
    if (v === undefined) { if (rec[k] === undefined) continue; v = null; } // een veld wissen: null, zodat het overal gewist wordt
    if (rec[k] !== undefined && onveranderd(rec[k], v)) continue;
    rec[k] = kopie(v);
    rec._t[k] = stempel;
    gewijzigd = true;
  }
  if (gewijzigd) {
    rec.bijgewerkt = stempel;
    zetRecord(name, rec);
    persist();
    meldWijziging(name, rec);
  }
  if (!silent) emit();
  return get(name, id);
}
// Formulieren: alleen de velden van nu die verschillen van het record zoals het was bij het openen (begin). Een
// formulier dat een oude kopie toont, bewaart zo nooit een oude waarde terug over een wijziging die intussen elders
// gebeurde (op een ander toestel, of hier stil, zoals notities die al getypt waren). Leeg ('' , null, false of
// ontbrekend) telt als gelijk: een leeg vak dat niemand aanraakte, wist niets. Een standaardwaarde die het formulier
// invulde voor een ontbrekend veld (bijvoorbeeld een spoor of een datum), wordt wel bewaard, zoals voorheen.
const leeg = v => v === undefined || v === null || v === '' || v === false;
export function gewijzigdeVelden(begin, nu) {
  const uit = {};
  for (const [k, v] of Object.entries(nu || {})) {
    if (typeof v === 'function' || GEEN_VELD.has(k)) continue;
    const was = begin?.[k];
    if (leeg(v) && leeg(was)) continue;
    if (jsonTekst(v ?? null) !== jsonTekst(was ?? null)) uit[k] = v;
  }
  return uit;
}

// ---------- Lijsten waar meerdere toestellen tegelijk aan toevoegen (logboek, bijlagen) ----------
// Samenvoegen gebeurt per veld: een lijst die als één veld bewaard wordt, verliest bij twee toevoegingen tegelijk
// er één. Daarom krijgt elk nieuw item een eigen veld '<lijst>_<item-id>' met een eigen stempel; verwijderen zet
// dat veld op null. Een bestaande lijst (het veld '<lijst>' zelf, van vroeger of uit de seed) blijft gelden: die
// items komen eerst, daarna de items uit eigen velden in de volgorde van toevoegen (veld op, dan id). Dezelfde regels
// staan in de functie lijst_items van de database (supabase/schema.sql), voor de overzichten daar. De volgorde is
// bytegewijs (zoals collate "C"), niet volgens de taal van de browser, zodat elk toestel dezelfde volgorde toont.
const itemVeld = (lijst, id) => `${lijst}_${id}`;
const bytegewijs = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
export function items(rec, lijst) {
  if (!rec) return [];
  const oud = Array.isArray(rec[lijst]) ? rec[lijst].filter(x => x && typeof x === 'object' && !Array.isArray(x)) : [];
  const gezien = new Set(oud.map(x => x.id).filter(x => x !== undefined && x !== null));
  const pre = lijst + '_', nieuw = [];
  for (const [k, v] of Object.entries(rec)) {
    if (!k.startsWith(pre) || !v || typeof v !== 'object' || Array.isArray(v)) continue;
    const id = v.id ?? k.slice(pre.length);
    if (gezien.has(id)) continue;
    gezien.add(id);
    nieuw.push({ ...v, id });
  }
  nieuw.sort((a, b) => bytegewijs(String(a.op || ''), String(b.op || '')) || bytegewijs(String(a.id), String(b.id)));
  return [...oud, ...nieuw];
}
// Het tijdstip van toevoegen: loopt in dit tabblad altijd op, zodat items die samen toegevoegd worden hun volgorde houden.
let laatsteOp = '';
function opNu() {
  let t = new Date().toISOString();
  if (t <= laatsteOp) t = iso(Date.parse(laatsteOp) + 1) || t;
  laatsteOp = t;
  return t;
}
// Patch die items toevoegt (elk krijgt een id als het er nog geen heeft, en het tijdstip van toevoegen).
export function itemErbij(lijst, ...nieuw) {
  const patch = {};
  for (const item of nieuw.flat()) {
    const id = item.id ?? (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
    patch[itemVeld(lijst, id)] = { ...item, id, op: item.op || opNu() };
  }
  return patch;
}
// Patch die een item weghaalt: uit de bestaande lijst, of het eigen veld op null.
export function itemWeg(rec, lijst, id) {
  const patch = {};
  if (Array.isArray(rec?.[lijst]) && rec[lijst].some(x => x?.id === id)) patch[lijst] = rec[lijst].filter(x => x?.id !== id);
  if (rec?.[itemVeld(lijst, id)]) patch[itemVeld(lijst, id)] = null;
  return patch;
}

// Verwijderen: het record wordt een leeg grafsteentje (alleen id, datum en de vlag), zodat de inhoud
// ook uit de database en van het andere toestel verdwijnt. Niet voor een record met een vaste id (zoals het cv):
// dat zet je terug door de velden te wissen met upsert (waarde undefined), anders weigert elke latere bewerking.
export function remove(name, id) {
  if (!MERGED.includes(name)) throw new Error('Onbekende collectie ' + name);
  const oud = vind(name, id);
  if (!oud?.verwijderd) {
    const graf = { id, verwijderd: true, bijgewerkt: nieuweStempel(oud?.bijgewerkt), _t: {} };
    zetRecord(name, graf);
    persist();
    meldWijziging(name, graf);
  }
  emit();
}
// Bij afmelden: de kopie op dit toestel wissen. De database blijft onaangeroerd. Alleen het nieuwe tijdperk
// blijft staan, zodat een ander tabblad de oude kopie niet terugzet.
export function wisAlles() {
  vervangLocal({ _meta: { tijdperk: nieuwTijdperk(), klok: '' } });
  if (!persist()) { try { localStorage.removeItem(KEY); } catch { /* geen opslag */ } }
  emit();
}
export const ref = {
  profiel: seed.profiel, rechten: seed.rechten, programma: seed.programma, jobbronnen: seed.jobbronnen,
  cvMaster: seed.cvMaster, maandplan: seed.maandplan || [], welzijn: seed.welzijn || null, sjablonen: seed.sjablonen || {}, gegenereerd: seed.gegenereerd || [], gebouwdOp: seed.gebouwdOp, vragenlijst: seed.vragenlijst,
  competenties: seed.competenties || null, zelftests: seed.zelftests || null, cvGids: seed.cvGids || null, voorbeelden: seed.voorbeelden || null,
};
export function exportJson() {
  const data = {};
  for (const c of MERGED) if (lijst(c).length) data[c] = lijst(c);
  return JSON.stringify({ versie: 2, geexporteerd: new Date().toISOString(), data }, null, 2);
}
// Een geïmporteerd record in de vorm van de app: een stempel na nu wordt nu (alleen hier), een record zonder
// stempels krijgt per veld de stempel van het record, en zonder datum een nieuwe stempel (dan wint de import).
function uitImport(item, oud, nu) {
  let bw = iso(item.bijgewerkt);
  if (bw && Date.parse(bw) > nu) bw = iso(nu);
  if (item.verwijderd) return { id: item.id, verwijderd: true, bijgewerkt: bw || nieuweStempel(oud?.bijgewerkt), _t: {} };
  const rec = { ...item };
  delete rec.verwijderd;
  const s0 = bw || nieuweStempel(oud?.bijgewerkt);
  const t = {};
  if (item._t && typeof item._t === 'object' && !Array.isArray(item._t)) {
    for (const [k, s] of Object.entries(item._t)) { const x = iso(s); if (x) t[k] = Date.parse(x) > nu ? iso(nu) : x; }
  } else for (const k of Object.keys(rec)) if (!GEEN_VELD.has(k)) t[k] = s0;
  rec._t = t;
  rec.bijgewerkt = Object.values(t).reduce((m, s) => (s > m ? s : m), bw || s0);
  return rec;
}
export function importJson(text, { vervang = false } = {}) {
  const parsed = JSON.parse(text);
  const data = parsed && typeof parsed === 'object' ? (parsed.data || parsed) : null;
  const geldig = data && typeof data === 'object' && Object.entries(data).some(([k, v]) => MERGED.includes(k) && Array.isArray(v));
  if (!geldig) throw new Error('Geen exportbestand van deze app');
  if (vervang) vervangLocal({ _meta: { tijdperk: nieuwTijdperk(), klok: local._meta.klok } });
  const nu = Date.now();
  const gewijzigd = [];
  for (const [k, v] of Object.entries(data)) {
    if (!MERGED.includes(k) || !Array.isArray(v)) continue;
    for (const item of v) {
      if (!item || typeof item !== 'object' || item.id === undefined || item.id === null || item.id === '') continue;
      const oud = vind(k, item.id);
      const nieuw = samenvoegen(oud || seedBasis(k, item.id), uitImport(item, oud, nu));
      if (oud && gelijk(nieuw, oud)) continue;
      zetRecord(k, nieuw);
      gewijzigd.push([k, nieuw]);
    }
  }
  persist();
  for (const [k, r] of gewijzigd) meldWijziging(k, r);
  emit();
}
// Opnieuw beginnen: de kopie op dit toestel wissen (de database blijft wat ze is). Met behoud(collectie, record)
// blijven de records staan waarvoor dat waar is: sync.js houdt zo wat nog niet in de database staat.
export function resetLocal({ behoud = null } = {}) {
  const nieuw = { _meta: { tijdperk: nieuwTijdperk(), klok: local._meta.klok } };
  if (typeof behoud === 'function') {
    for (const c of MERGED) { const l = lijst(c).filter(r => behoud(c, r)); if (l.length) nieuw[c] = l; }
  }
  vervangLocal(nieuw);
  persist();
  try { wisHaak?.(); } catch (e) { console.warn(e); }
  emit();
}
export function localSize() { return JSON.stringify(local).length; }

// ---------- Meerdere tabbladen ----------
// Een ander tabblad schreef de kopie weg: samenvoegen met wat hier in het geheugen staat (er gaat niets verloren),
// en terugschrijven als hier iets stond dat daar nog ontbrak. Werd de kopie daar gewist of vervangen (nieuwer
// tijdperk), dan volgt dit tabblad. Schreef een tabblad met een oudere kopie, dan wint de kopie van hier.
function neemOver(ruw, { vanEvent = false } = {}) {
  if (!ruw) {
    if (!vanEvent) return; // niets in de opslag (bijvoorbeeld een volle opslag): niets doen
    vervangLocal({ _meta: { tijdperk: nieuwTijdperk(), klok: '' } });
    meldElders();
    return;
  }
  const ander = opbouw(ruw);
  const ta = ander._meta.tijdperk || '', tm = local._meta.tijdperk || '';
  if (ta > tm) { vervangLocal(ander); meldElders(); return; }
  if (ta < tm) { persist(); return; }
  let hier = false, daar = false;
  const uit = { _meta: { tijdperk: local._meta.tijdperk, klok: (ander._meta.klok || '') > (local._meta.klok || '') ? ander._meta.klok : local._meta.klok } };
  for (const c of MERGED) {
    const mijn = new Map(lijst(c).map(r => [r.id, r]));
    const rijen = [];
    for (const t of (ander[c] || [])) {
      const m = mijn.get(t.id);
      mijn.delete(t.id);
      if (!m) { rijen.push(t); hier = true; continue; }
      if (JSON.stringify(m) === JSON.stringify(t)) { rijen.push(m); continue; }
      const x = samenvoegen(t, m), tx = jsonTekst(x);
      if (tx !== jsonTekst(m)) hier = true;
      if (tx !== jsonTekst(t)) daar = true;
      rijen.push(x);
    }
    for (const m of mijn.values()) { rijen.push(m); daar = true; }
    if (rijen.length) uit[c] = rijen;
  }
  vervangLocal(uit);
  if (daar) persist();
  if (hier) meldElders();
}
// sync.js roept dit op vóór het synchroniseren, voor het geval een melding van een ander tabblad nog onderweg is.
export function herlaad() {
  let t = null;
  try { t = localStorage.getItem(KEY); } catch { return; }
  if (t === null || t === laatsteTekst) return;
  laatsteTekst = t;
  let ruw = null;
  try { ruw = JSON.parse(t); } catch { return; }
  neemOver(ruw);
}
if (typeof addEventListener === 'function') {
  addEventListener('storage', e => {
    try { if (e.storageArea && e.storageArea !== localStorage) return; } catch { return; }
    if (e.key !== KEY && e.key !== null) return;
    let ruw = null;
    try { ruw = e.key === null ? null : (e.newValue ? JSON.parse(e.newValue) : null); } catch { return; }
    laatsteTekst = e.key === null ? null : e.newValue;
    neemOver(ruw, { vanEvent: true });
  });
}
