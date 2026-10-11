// Mail versturen via Gmail, rechtstreeks vanuit de browser (Google Identity Services en de Gmail API).
// Geen server: het toegangstoken blijft in het geheugen van deze pagina en verdwijnt bij herladen.
// De app vraagt alleen toestemming om mail te versturen (gmail.send) en het e-mailadres te tonen, niet om mail te lezen.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email'];
const CID_KEY = 'remi-gmail-client-id';
export const MAX_BIJLAGEN = 24 * 1024 * 1024; // Gmail aanvaardt tot 25 MB aan bijlagen per mail.
const CRLF = '\r\n';

let gisBelofte = null;
let sessie = null; // { token, verloopt, email }

export function clientId() { try { return localStorage.getItem(CID_KEY) || ''; } catch { return ''; } }
export function zetClientId(v) {
  const schoon = String(v || '').trim();
  try { if (schoon) localStorage.setItem(CID_KEY, schoon); else localStorage.removeItem(CID_KEY); } catch { /* geen opslag */ }
  sessie = null;
}
export const geldigeClientId = v => /^[\w-]+\.apps\.googleusercontent\.com$/.test(String(v || '').trim());
export const aangemeldAls = () => (sessie && sessie.verloopt > Date.now() ? sessie.email : '');

// Het Google-script laden we pas als het nodig is, en vooraf zodra er een client-ID is,
// zodat het aanmeldvenster meteen bij de klik kan openen (anders blokkeert de browser de pop-up).
export function laadGoogle() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisBelofte) gisBelofte = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = () => (window.google?.accounts?.oauth2 ? res() : rej(new Error('Google-aanmelding is niet beschikbaar.')));
    s.onerror = () => { gisBelofte = null; rej(new Error('Google-aanmelding kon niet laden. Kijk de internetverbinding na.')); };
    document.head.append(s);
  });
  return gisBelofte;
}

export async function aanmelden({ ander = false } = {}) {
  const cid = clientId();
  if (!geldigeClientId(cid)) throw new Error('Stel eerst de Google client-ID in bij Instellingen, E-mail via Gmail.');
  if (!ander && sessie && sessie.verloopt > Date.now() + 60_000) return sessie;
  await laadGoogle();
  const oauth = window.google.accounts.oauth2;
  const antwoord = await new Promise((res, rej) => {
    const client = oauth.initTokenClient({
      client_id: cid,
      scope: SCOPES.join(' '),
      callback: r => (r && r.access_token ? res(r) : rej(new Error(r?.error_description || r?.error || 'Aanmelden mislukt.'))),
      error_callback: e => rej(new Error(e?.type === 'popup_closed' ? 'Het aanmeldvenster werd gesloten.' : e?.type === 'popup_failed_to_open' ? 'De browser blokkeerde het aanmeldvenster. Sta pop-ups toe voor deze site.' : (e?.message || 'Aanmelden afgebroken.'))),
    });
    client.requestAccessToken({ prompt: ander || !sessie ? 'select_account' : '' });
  });
  if (!oauth.hasGrantedAllScopes(antwoord, ...SCOPES)) throw new Error('Zonder toestemming om e-mail te versturen kan de app niet versturen. Probeer opnieuw en vink de toestemming aan.');
  const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${antwoord.access_token}` } }).then(r => (r.ok ? r.json() : {})).catch(() => ({}));
  sessie = { token: antwoord.access_token, verloopt: Date.now() + (Number(antwoord.expires_in) || 3600) * 1000, email: info.email || '' };
  return sessie;
}

export function afmelden() {
  if (sessie && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(sessie.token, () => {});
  sessie = null;
}

// Adressen: één of meer, gescheiden door komma of puntkomma.
export function adressen(v) {
  const lijst = String(v || '').split(/[,;]/).map(x => x.trim()).filter(Boolean);
  const fout = lijst.filter(a => !/^[^\s@<>(),;:"\\[\]]+@[^\s@<>(),;:"\\[\]]+\.[A-Za-z]{2,}$/.test(a));
  return { lijst, fout, tekst: lijst.join(', ') };
}

const utf8 = t => new TextEncoder().encode(t);
function b64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const inRegels = s => s.replace(/.{1,76}/g, m => m + CRLF);
const zonderRegeleinde = t => String(t || '').replace(/[\r\n]+/g, ' ').trim();

// Koptekst met niet-ASCII-tekens als RFC 2047 encoded words van hoogstens 45 bytes, zonder tekens te splitsen.
export function kop(t) {
  const tekst = zonderRegeleinde(t);
  if (/^[\x20-\x7e]*$/.test(tekst)) return tekst;
  const delen = []; let huidig = '';
  for (const ch of tekst) {
    if (huidig && utf8(huidig + ch).length > 45) { delen.push(huidig); huidig = ch; } else huidig += ch;
  }
  if (huidig) delen.push(huidig);
  return delen.map(d => `=?UTF-8?B?${b64(utf8(d))}?=`).join(CRLF + ' ');
}

const veiligType = t => (/^[\w.+-]+\/[\w.+-]+$/.test(t || '') ? t : 'application/octet-stream');

// Een volledige mail (MIME) met tekst en bijlagen. Alles is ASCII, zodat Gmail ze ongewijzigd verstuurt.
export async function bouwMail({ naar, cc, onderwerp, tekst, bijlagen = [] }) {
  const grens = `remi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const koppen = [
    `To: ${adressen(naar).tekst}`,
    adressen(cc).lijst.length ? `Cc: ${adressen(cc).tekst}` : null,
    `Subject: ${kop(onderwerp)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed;${CRLF} boundary="${grens}"`,
  ].filter(Boolean);
  const delen = [[`--${grens}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', inRegels(b64(utf8(String(tekst || '').replace(/\r?\n/g, CRLF))))].join(CRLF)];
  for (const b of bijlagen) {
    const data = new Uint8Array(await b.blob.arrayBuffer());
    // Bestandsnaam zoals Gmail die zelf meestuurt: gewone ASCII, of een RFC 2047 encoded word voor accenten.
    const naam = String(b.naam || 'bijlage').replace(/[\r\n"\\]/g, '_');
    const param = /^[\x20-\x7e]*$/.test(naam) ? naam : `=?UTF-8?B?${b64(utf8(naam))}?=`;
    delen.push([
      `--${grens}`,
      `Content-Type: ${veiligType(b.type || b.blob.type)};${CRLF} name="${param}"`,
      `Content-Disposition: attachment;${CRLF} filename="${param}"`,
      'Content-Transfer-Encoding: base64',
      '',
      inRegels(b64(data)),
    ].join(CRLF));
  }
  return koppen.join(CRLF) + CRLF + CRLF + delen.join(CRLF) + `--${grens}--` + CRLF;
}

export async function verstuur(mime) {
  const s = await aanmelden();
  const r = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media', {
    method: 'POST',
    headers: { Authorization: `Bearer ${s.token}`, 'Content-Type': 'message/rfc822' },
    body: mime,
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) sessie = null;
    throw new Error(j?.error?.message ? `Gmail: ${j.error.message}` : `Gmail weigerde de mail (code ${r.status}).`);
  }
  const j = await r.json().catch(() => ({}));
  return { id: j.id || '', van: s.email };
}

// Delen via de telefoon (Web Share) als Gmail niet ingesteld is: de mail-app kiest dan de afzender.
export function kanDelenMetBestanden(bestanden) {
  try { return !!navigator.canShare && navigator.canShare({ files: bestanden }); } catch { return false; }
}
