// Data layer: seed (from data/*.json via build-data) plus a localStorage overlay. Export and import as JSON.
// Met een centrale database (sync.js) is de overlay een kopie op dit toestel: elke wijziging gaat via de haak
// naar de database, en wat het andere toestel wijzigt komt binnen via pasToe().
import { seed } from './seed.js';
const KEY = 'remi-nieuwe-start-v1';
const MERGED = ['sollicitaties', 'vacatures', 'hotlist', 'stappenplan', 'verkenning', 'opleidingen', 'notities', 'agenda', 'antwoorden', 'cvdoc', 'competentiescores', 'zelftests', 'berichten', 'communicatie', 'dossier', 'welzijn', 'dagboek', 'instellingen'];
let local = load();
const listeners = new Set();

function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(local)); } catch (e) { console.warn('Opslaan lukte niet', e); } }
function emit() { for (const fn of listeners) fn(); }
export const melden = emit;
// Haken voor de synchronisatie: wat lokaal verandert, en wanneer de lokale kopie gewist wordt.
let wijzigingHaak = null, wisHaak = null;
export function zetHaken({ wijziging, wis }) { wijzigingHaak = wijziging || null; wisHaak = wis || null; }
const meldWijziging = (name, rec) => { try { wijzigingHaak?.(name, rec); } catch (e) { console.warn(e); } };
export const collecties = () => MERGED.slice();
// Een datum in de toekomst (bijvoorbeeld uit een import) terugzetten naar nu, zodat ze latere bewerkingen niet blokkeert.
export function zetStempel(name, id, stempel) { const r = lokaalRecord(name, id); if (r) { r.bijgewerkt = stempel; persist(); } }
export function lokaalRecord(name, id) { return (Array.isArray(local[name]) ? local[name] : []).find(x => x.id === id) || null; }
export function lokaleRecords() { const out = []; for (const k of MERGED) for (const r of (Array.isArray(local[k]) ? local[k] : [])) if (r && r.id) out.push([k, r]); return out; }
// Records van het andere toestel toepassen, veld per veld: de recentste versie wint per veld, ontbrekende
// velden komen erbij. Een grafsteentje (verwijderd) vervangt alles.
const zelfdeVelden = (a, b) => { const x = Object.keys(a).sort(), y = Object.keys(b).sort(); return x.length === y.length && x.every((k, i) => k === y[i]); };
export function pasToe(rijen, { stil = false } = {}) {
  let veranderd = false;
  for (const r of rijen || []) {
    if (!r || !MERGED.includes(r.collectie) || !r.id || !r.data || typeof r.data !== 'object') continue;
    const stempel = r.data.bijgewerkt || r.bijgewerkt || '';
    const rec = r.verwijderd ? { id: r.id, verwijderd: true, bijgewerkt: stempel } : { ...r.data, id: r.id, bijgewerkt: stempel };
    if (!r.verwijderd) delete rec.verwijderd;
    const arr = Array.isArray(local[r.collectie]) ? local[r.collectie] : (local[r.collectie] = []);
    const i = arr.findIndex(x => x.id === r.id);
    if (i < 0) { arr.push(rec); veranderd = true; continue; }
    const lok = arr[i], lt = lok.bijgewerkt || '';
    let nieuw;
    if (stempel > lt) nieuw = rec.verwijderd || lok.verwijderd ? rec : { ...lok, ...rec };
    else if (stempel === lt) { if (rec.verwijderd || lok.verwijderd) continue; nieuw = { ...rec, ...lok }; }
    else { // ouder dan wat hier staat: alleen ontbrekende velden aanvullen
      if (rec.verwijderd || lok.verwijderd) continue;
      nieuw = { ...rec, ...lok };
    }
    if (zelfdeVelden(nieuw, lok) && Object.keys(nieuw).every(k => JSON.stringify(nieuw[k]) === JSON.stringify(lok[k]))) continue;
    arr[i] = nieuw; veranderd = true;
  }
  if (veranderd) { persist(); if (!stil) emit(); }
  return veranderd;
}
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function all(name) {
  const base = Array.isArray(seed[name]) ? seed[name] : [];
  const over = Array.isArray(local[name]) ? local[name] : [];
  const byId = new Map(base.map(x => [x.id, { ...x }]));
  for (const o of over) byId.set(o.id, { ...(byId.get(o.id) || {}), ...o });
  return [...byId.values()].filter(x => !x.verwijderd);
}
export function get(name, id) { return all(name).find(x => x.id === id); }
export function upsert(name, item, { silent = false } = {}) {
  if (!MERGED.includes(name)) throw new Error('Onbekende collectie ' + name);
  const arr = Array.isArray(local[name]) ? local[name] : [];
  const i = arr.findIndex(x => x.id === item.id);
  // Elke bewerking is nieuwer dan de versie die dit toestel kent, ook als de klok van dit toestel achterloopt.
  const vorige = i >= 0 ? Date.parse(arr[i].bijgewerkt || '') : NaN;
  const stempel = new Date(Math.max(Date.now(), Number.isFinite(vorige) ? vorige + 1 : 0)).toISOString();
  const stamped = { ...item, bijgewerkt: stempel };
  // Een verwijderd record dat opnieuw bewerkt wordt, begint opnieuw (zonder oude inhoud of verwijderd-vlag).
  if (i >= 0 && arr[i].verwijderd && !item.verwijderd) arr[i] = { id: item.id, ...stamped };
  else if (i >= 0) arr[i] = { ...arr[i], ...stamped }; else arr.push(stamped);
  local[name] = arr; persist();
  meldWijziging(name, i >= 0 ? arr[i] : stamped);
  if (!silent) emit();
  return get(name, item.id);
}
// Verwijderen: het record wordt een leeg grafsteentje (alleen id, datum en de vlag), zodat de inhoud
// ook uit de database en van het andere toestel verdwijnt.
export function remove(name, id) {
  if (!MERGED.includes(name)) throw new Error('Onbekende collectie ' + name);
  const arr = Array.isArray(local[name]) ? local[name] : (local[name] = []);
  const i = arr.findIndex(x => x.id === id);
  const vorige = i >= 0 ? Date.parse(arr[i].bijgewerkt || '') : NaN;
  const stempel = new Date(Math.max(Date.now(), Number.isFinite(vorige) ? vorige + 1 : 0)).toISOString();
  const graf = { id, verwijderd: true, bijgewerkt: stempel };
  if (i >= 0) arr[i] = graf; else arr.push(graf);
  persist();
  meldWijziging(name, graf);
  emit();
}
// Bij afmelden: de kopie op dit toestel wissen. De database blijft onaangeroerd.
export function wisAlles() { local = {}; try { localStorage.removeItem(KEY); } catch { /* geen opslag */ } emit(); }
export const ref = {
  profiel: seed.profiel, rechten: seed.rechten, programma: seed.programma, jobbronnen: seed.jobbronnen,
  cvMaster: seed.cvMaster, maandplan: seed.maandplan || [], welzijn: seed.welzijn || null, sjablonen: seed.sjablonen || {}, gegenereerd: seed.gegenereerd || [], gebouwdOp: seed.gebouwdOp, vragenlijst: seed.vragenlijst,
  competenties: seed.competenties || null, zelftests: seed.zelftests || null, cvGids: seed.cvGids || null, voorbeelden: seed.voorbeelden || null,
};
export function exportJson() { return JSON.stringify({ versie: 1, geexporteerd: new Date().toISOString(), data: local }, null, 2); }
export function importJson(text, { vervang = false } = {}) {
  const parsed = JSON.parse(text);
  const data = parsed && typeof parsed === 'object' ? (parsed.data || parsed) : null;
  const geldig = data && typeof data === 'object' && Object.entries(data).some(([k, v]) => MERGED.includes(k) && Array.isArray(v));
  if (!geldig) throw new Error('Geen exportbestand van deze app');
  if (vervang) { local = {}; }
  const gewijzigd = [];
  for (const [k, v] of Object.entries(data)) {
    if (!MERGED.includes(k) || !Array.isArray(v)) continue;
    const arr = Array.isArray(local[k]) ? local[k] : [];
    for (const item of v) {
      if (!item || !item.id) continue;
      const i = arr.findIndex(x => x.id === item.id);
      // Geïmporteerde records krijgen een datum als ze er geen hebben, zodat de database ze kan vergelijken.
      const metDatum = item.bijgewerkt ? item : { ...item, bijgewerkt: new Date().toISOString() };
      if (i < 0) { arr.push(metDatum); gewijzigd.push([k, metDatum]); continue; }
      // Het recentst bewerkte record wint; zonder datum wint de import.
      const oud = arr[i].bijgewerkt || '', nieuw = item.bijgewerkt || '';
      if (!oud || !nieuw || nieuw >= oud) { arr[i] = { ...arr[i], ...metDatum }; gewijzigd.push([k, arr[i]]); }
    }
    local[k] = arr;
  }
  persist();
  for (const [k, r] of gewijzigd) meldWijziging(k, r);
  emit();
}
export function resetLocal() { local = {}; persist(); try { wisHaak?.(); } catch (e) { console.warn(e); } emit(); }
export function localSize() { return JSON.stringify(local).length; }
