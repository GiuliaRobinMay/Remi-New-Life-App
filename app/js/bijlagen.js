// Bijlagen (foto's en pdf's). Op dit toestel in IndexedDB, zodat ze ook zonder verbinding openen.
// Met een centrale database (sync.js) gaat elke bijlage ook naar de afgeschermde opslag, en haalt een ander
// toestel ze daar op zodra iemand ze opent. Ze komen nooit in de repository.
const DB = 'remi-bijlagen', STORE = 'bestanden';
let dbBelofte = null;
let extern = null;
// sync.js meldt zich hier aan: { gewijzigd(id, 'op'|'weg'), haal(id) -> Blob|null }
export function zetExtern(adapter) { extern = adapter; }

function db() {
  if (!dbBelofte) dbBelofte = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => { dbBelofte = null; rej(r.error); };
  });
  return dbBelofte;
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    let t;
    // Een verbroken verbinding (bijvoorbeeld op iPhone na de achtergrond): de volgende keer opnieuw openen.
    try { t = d.transaction(STORE, mode); } catch (e) { dbBelofte = null; rej(e); return; }
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => res(req?.result);
    t.onerror = () => { dbBelofte = null; rej(t.error); };
    t.onabort = () => { dbBelofte = null; rej(t.error); };
  });
}
// Alles van dit toestel wissen (bij afmelden).
export function wisAlleBijlagen() {
  return new Promise(res => {
    const sluit = dbBelofte ? dbBelofte.then(d => d.close()).catch(() => {}) : Promise.resolve();
    dbBelofte = null;
    sluit.then(() => { const r = indexedDB.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => res(); });
  });
}
export const leesLokaal = id => tx('readonly', s => s.get(id));
export const lokaleSleutels = () => tx('readonly', s => s.getAllKeys());

export async function bewaarBijlage(id, blob) {
  await tx('readwrite', s => s.put(blob, id));
  extern?.gewijzigd(id, 'op');
}
export async function leesBijlage(id) {
  const lokaal = await leesLokaal(id).catch(() => undefined);
  if (lokaal || !extern) return lokaal;
  const ver = await extern.haal(id).catch(() => null);
  if (ver) await tx('readwrite', s => s.put(ver, id)).catch(() => {});
  return ver || undefined;
}
export async function wisBijlage(id) {
  await tx('readwrite', s => s.delete(id));
  extern?.gewijzigd(id, 'weg');
}
