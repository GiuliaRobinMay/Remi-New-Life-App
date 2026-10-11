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
export function lokaalRecord(name, id) { return (Array.isArray(local[name]) ? local[name] : []).find(x => x.id === id) || null; }
export function lokaleRecords() { const out = []; for (const k of MERGED) for (const r of (Array.isArray(local[k]) ? local[k] : [])) if (r && r.id) out.push([k, r]); return out; }
// Records van het andere toestel toepassen. De recentst bewerkte versie wint; een gelijke versie verandert niets.
export function pasToe(rijen, { stil = false } = {}) {
  let veranderd = false;
  for (const r of rijen || []) {
    if (!r || !MERGED.includes(r.collectie) || !r.id || !r.data || typeof r.data !== 'object') continue;
    const rec = { ...r.data, id: r.id, bijgewerkt: r.data.bijgewerkt || r.bijgewerkt };
    if (r.verwijderd) rec.verwijderd = true;
    const arr = Array.isArray(local[r.collectie]) ? local[r.collectie] : (local[r.collectie] = []);
    const i = arr.findIndex(x => x.id === r.id);
    if (i >= 0) {
      if ((arr[i].bijgewerkt || '') > (rec.bijgewerkt || '')) continue;
      if (JSON.stringify(arr[i]) === JSON.stringify(rec)) continue;
      arr[i] = rec;
    } else arr.push(rec);
    veranderd = true;
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
  const stamped = { ...item, bijgewerkt: new Date().toISOString() };
  if (i >= 0) arr[i] = { ...arr[i], ...stamped }; else arr.push(stamped);
  local[name] = arr; persist();
  meldWijziging(name, i >= 0 ? arr[i] : stamped);
  if (!silent) emit();
  return get(name, item.id);
}
export function remove(name, id) { upsert(name, { id, verwijderd: true }); }
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
