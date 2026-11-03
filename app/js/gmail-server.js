// Mail versturen vanaf het Gmail-adres van Remi via de server (Supabase-functie 'gmail').
// Remi geeft één keer toestemming met een koppellink; daarna kan Giulia of Remi altijd versturen,
// zonder telkens bij Google aan te melden. Werkt alleen als de centrale database actief is.
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
export async function verstuur(mime) {
  const B = await backend();
  const pad = await B.mailKlaarzetten(mime);
  return B.gmail('verstuur', { pad });
}
