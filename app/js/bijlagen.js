// Bijlagen (foto's en pdf's) in IndexedDB. Ze blijven op dit toestel en gaan nooit naar de server of de repository.
const DB = 'remi-bijlagen', STORE = 'bestanden';
let dbBelofte = null;

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
    const t = d.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => res(req?.result);
    t.onerror = () => rej(t.error);
  });
}
export const bewaarBijlage = (id, blob) => tx('readwrite', s => s.put(blob, id));
export const leesBijlage = id => tx('readonly', s => s.get(id));
export const wisBijlage = id => tx('readwrite', s => s.delete(id));
