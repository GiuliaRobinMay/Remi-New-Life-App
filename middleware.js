// Vercel Routing Middleware: elke aanvraag (pagina's én gegevensbestanden) vraagt eerst een wachtwoord.
// Het wachtwoord staat niet in de code maar in de Vercel-instelling APP_WACHTWOORD
// (Project, Settings, Environment Variables). Zonder die instelling is de site open: de server bevat dan
// alleen wat ook in de repository staat, en persoonlijke gegevens blijven altijd in de browser.
export const config = { matcher: '/:path*' };

const REALM = 'Basic realm="Nieuwe start", charset="UTF-8"';

function gelijk(a, b) {
  // Vergelijking in constante tijd, zodat de lengte van de overeenkomst niets verraadt.
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let verschil = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) verschil |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return verschil === 0;
}

function wachtwoordUit(header) {
  if (!header || !header.startsWith('Basic ')) return null;
  try {
    const tekst = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6)), c => c.charCodeAt(0)));
    const i = tekst.indexOf(':');
    return i < 0 ? null : tekst.slice(i + 1);
  } catch { return null; }
}

export default function middleware(request) {
  const wachtwoord = process.env.APP_WACHTWOORD;
  if (!wachtwoord) return new Response(null, { headers: { 'x-middleware-next': '1' } });
  const gegeven = wachtwoordUit(request.headers.get('authorization'));
  if (gegeven !== null && gelijk(gegeven, wachtwoord)) {
    // Doorgaan naar het gevraagde bestand (zelfde signaal als next() uit @vercel/functions).
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }
  return new Response('Wachtwoord nodig.', { status: 401, headers: { 'www-authenticate': REALM, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
}
