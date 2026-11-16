// Mail versturen vanaf het Gmail-adres van Remi via de server (Supabase-functie 'gmail').
// Remi geeft één keer toestemming met een koppellink (alleen voor zijn Gmail-adres, 48 uur geldig); daarna kan
// Giulia of Remi altijd versturen, zonder telkens bij Google aan te melden. Werkt alleen als de centrale database actief is.
import { backend } from './backend.js';
import { actief } from './sync.js';

export const serverModus = () => actief();
let laatste = null, bezig = null;
export const gekendeStatus = () => laatste;

export async function status({ vers = false } = {}) {
  if (!vers && laatste) return laatste;
  if (bezig) return bezig;
  bezig = (async () => {
    try { const B = await backend(); laatste = await B.gmail('status'); return laatste; }
    finally { bezig = null; }
  })();
  return bezig;
}
export async function actie(naam, extra) { const B = await backend(); const r = await B.gmail(naam, extra); laatste = null; return r; }

// Versturen met een sleutel '<mail-id>:<poging>': de server verstuurt dezelfde sleutel nooit twee keer.
// Geeft { id, threadId, van } terug, of { dubbel: true, id, status } als de server deze sleutel al kent: status
// 'verstuurd' (Gmail bevestigde het) of 'bezig' (niet bevestigd: loopt nog op een ander toestel, of een vorige poging
// liep onzeker af). Een fout vóór de server iets kreeg (de mail klaarzetten), krijgt onzeker: false.
export async function verstuur(mime, sleutel) {
  let B, pad;
  try {
    B = await backend();
    pad = await B.mailKlaarzetten(mime);
  } catch (e) {
    throw Object.assign(e instanceof Error ? e : new Error(String(e?.message || e || 'De mail kon niet klaargezet worden.')), { onzeker: false });
  }
  try { return await B.gmail('verstuur', { pad, sleutel }); }
  catch (e) {
    if (e?.dubbel === true) return { dubbel: true, id: e.gmailId || '', van: '', status: e.verzendStatus === 'verstuurd' ? 'verstuurd' : 'bezig' };
    throw e;
  }
}
