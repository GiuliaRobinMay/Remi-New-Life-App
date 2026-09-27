// Het cv-document: master-cv uit de seed, per sectie overschreven door wat Remi in het Cv-atelier invult (collectie 'cvdoc').
// Los van de views, zodat ook cv.html het kan gebruiken zonder de app te starten.
import { get, ref } from './store.js';

export const CVID = 'remi';
export const lines = v => Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean) : String(v || '').split('\n').map(x => x.trim()).filter(Boolean);
const kopie = x => JSON.parse(JSON.stringify(x ?? null));

export function getCv(base = ref.cvMaster) {
  const cvBase = kopie(base) || {};
  const loc = get('cvdoc', CVID) || {};
  const cv = { ...cvBase };
  for (const [k, v] of Object.entries(loc)) {
    if (['id', 'bijgewerkt', 'verwijderd'].includes(k)) continue;
    cv[k] = (k === 'persoonlijk' || k === 'instellingen') ? { ...(cvBase[k] || {}), ...v } : v;
  }
  return normaliseer(cv);
}
export function normaliseer(cv) {
  cv.persoonlijk = cv.persoonlijk || {};
  cv.titel = cv.titel || ''; cv.profiel = cv.profiel || ''; cv.interesses = cv.interesses || '';
  cv.werkervaring = (cv.werkervaring || []).map((w, i) => ({ periode: '', functie: '', werkgever: '', plaats: '', tools: '', ...w, id: w.id || 'w' + i, taken: lines(w.taken), realisaties: lines(w.realisaties) }));
  cv.opleiding = (cv.opleiding || []).map((o, i) => ({ periode: '', titel: '', instelling: '', toelichting: '', ...o, id: o.id || 'o' + i }));
  cv.certificaten = lines(cv.certificaten); cv.vaardigheden = lines(cv.vaardigheden); cv.extra = lines(cv.extra);
  cv.talen = (cv.talen || []).map((t, i) => ({ taal: '', niveau: '', ...t, id: t.id || 't' + i }));
  cv.portfolio = (cv.portfolio || []).map((p, i) => ({ titel: '', jaar: '', materiaal: '', techniek: '', rol: '', link: '', ...p, id: p.id || 'p' + i }));
  cv.referenties = (cv.referenties || []).map((r, i) => ({ naam: '', relatie: '', contact: '', toestemming: false, ...r, id: r.id || 'r' + i }));
  cv.competenties = Array.isArray(cv.competenties) ? cv.competenties : [];
  cv.instellingen = { geboortedatum: true, competenties: true, portfolio: true, referenties: false, ...(cv.instellingen || {}) };
  return cv;
}
