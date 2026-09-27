// Data layer: seed (from data/*.json via build-data) plus a localStorage overlay. Export and import as JSON.
import { seed } from './seed.js';
const KEY = 'remi-nieuwe-start-v1';
const MERGED = ['sollicitaties', 'vacatures', 'hotlist', 'stappenplan', 'verkenning', 'opleidingen', 'notities', 'agenda', 'antwoorden', 'cvdoc', 'competentiescores', 'zelftests'];
let local = load();
const listeners = new Set();

function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(local)); } catch (e) { console.warn('Opslaan lukte niet', e); } }
function emit() { for (const fn of listeners) fn(); }
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
  local[name] = arr; persist(); if (!silent) emit();
  return get(name, item.id);
}
export function remove(name, id) { upsert(name, { id, verwijderd: true }); }
export const ref = {
  profiel: seed.profiel, rechten: seed.rechten, programma: seed.programma, jobbronnen: seed.jobbronnen,
  cvMaster: seed.cvMaster, sjablonen: seed.sjablonen || {}, gegenereerd: seed.gegenereerd || [], gebouwdOp: seed.gebouwdOp, vragenlijst: seed.vragenlijst,
  competenties: seed.competenties || null, zelftests: seed.zelftests || null, cvGids: seed.cvGids || null, voorbeelden: seed.voorbeelden || null,
};
export function exportJson() { return JSON.stringify({ versie: 1, geexporteerd: new Date().toISOString(), data: local }, null, 2); }
export function importJson(text, { vervang = false } = {}) {
  const parsed = JSON.parse(text);
  const data = parsed && typeof parsed === 'object' ? (parsed.data || parsed) : null;
  const geldig = data && typeof data === 'object' && Object.entries(data).some(([k, v]) => MERGED.includes(k) && Array.isArray(v));
  if (!geldig) throw new Error('Geen exportbestand van deze app');
  if (vervang) { local = {}; }
  for (const [k, v] of Object.entries(data)) {
    if (!MERGED.includes(k) || !Array.isArray(v)) continue;
    const arr = Array.isArray(local[k]) ? local[k] : [];
    for (const item of v) {
      if (!item || !item.id) continue;
      const i = arr.findIndex(x => x.id === item.id);
      if (i < 0) { arr.push(item); continue; }
      // Het recentst bewerkte record wint; zonder datum wint de import.
      const oud = arr[i].bijgewerkt || '', nieuw = item.bijgewerkt || '';
      if (!oud || !nieuw || nieuw >= oud) arr[i] = { ...arr[i], ...item };
    }
    local[k] = arr;
  }
  persist(); emit();
}
export function resetLocal() { local = {}; persist(); emit(); }
export function localSize() { return JSON.stringify(local).length; }
