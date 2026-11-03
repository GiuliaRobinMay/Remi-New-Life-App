// View: communicatie. Alle e-mails in één tabel; een mail openen toont ze op een eigen pagina met
// adressen, tekst, bijlagen en versturen via Gmail. Bij Instellingen: de afzender (Gmail) en de handtekening.
// Met de centrale database verstuurt de server (functie 'gmail') vanaf het gekoppelde adres van Remi;
// zonder database meldt de browser zich zelf aan bij Google.
import { h, icon, badge, fmtDate, todayIso, isoLocal, uid, copyText, toast } from './ui.js';
import { all, get, upsert, remove } from './store.js';
import { openPeek, closePeek, peekActief, vernieuw, go } from './app.js';
import { content, intro, callout } from './views-core.js';
import { grid } from './views-werk.js';
import { bewaarBijlage, leesBijlage, wisBijlage } from './bijlagen.js';
import * as mail from './mail.js';
import * as gserver from './gmail-server.js';

const haken = t => (String(t || '').match(/\[[^\]]+\]/g) || []).length;
const grootte = n => (n >= 1048576 ? `${(n / 1048576).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(n / 1024))} kB`);
const titelVan = b => b.titel || b.onderwerp || '(zonder onderwerp)';
const datumVan = b => {
  const d = (b.status === 'verstuurd' ? b.verstuurdOp : '') || b.bijgewerkt || b.aangemaakt || '';
  return d && d.slice(0, 10) > todayIso() ? todayIso() : d; // nooit een datum in de toekomst tonen
};
export const mails = () => all('berichten').filter(b => b.soort === 'mail');
// Gearchiveerde mails blijven bewaard en kunnen terug bij de e-mails gezet worden.
const archief = () => all('berichten').filter(b => b.soort === 'archief');

// Handtekening: in de gedeelde instellingen, zodat ze op elk toestel dezelfde is (oude plek op dit toestel als terugval).
const HT = 'remi-mail-handtekening';
export function handtekening() {
  const gedeeld = get('instellingen', 'mail');
  if (gedeeld && typeof gedeeld.handtekening === 'string') return gedeeld.handtekening;
  try { return localStorage.getItem(HT) || ''; } catch { return ''; }
}
let htTimer = null;
function zetHandtekening(v) {
  try { localStorage.setItem(HT, v); } catch { /* privévenster */ }
  clearTimeout(htTimer);
  htTimer = setTimeout(() => upsert('instellingen', { id: 'mail', handtekening: v }, { silent: true }), 400);
}

export function communicatie(r) {
  bewaarAlles();
  const lijst = mails();
  const gearchiveerd = archief();
  const open = [...lijst, ...gearchiveerd].find(b => b.id === r.params?.[0]);
  const tab = open ? 'mails' : r.tab === 'instellingen' ? 'instellingen' : 'mails';
  const tabs = [['mails', 'E-mails'], ['instellingen', 'Instellingen']].map(([k, l]) => ({ label: l, href: `#/communicatie?tab=${k}`, active: tab === k }));
  if (!gserver.serverModus() && mail.geldigeClientId(mail.clientId())) mail.laadGoogle().catch(() => {});
  const tool = [h('button', { class: 'btn btn--primary', 'data-actie': 'nieuwe-mail', onClick: nieuweMail }, icon('plus', 14), h('span', { class: 'btn__label' }, 'Nieuwe e-mail'))];
  const concepten = lijst.filter(b => b.status !== 'verstuurd').length;
  const chrome = { where: open ? titelVan(open) : tab === 'instellingen' ? 'Instellingen' : 'Alle e-mails', tabs, tool, view: `${concepten} ${concepten === 1 ? 'concept' : 'concepten'}`, viewIcon: 'mail' };

  if (open) {
    const body = content(
      h('p', { class: 'small' }, h('a', { href: '#/communicatie' }, '← Alle e-mails')),
      mailKaart(open));
    return { chrome, body };
  }
  if (tab === 'instellingen') return { chrome, body: content(intro('Instellingen', 'Vanaf welk adres de mails vertrekken, en de handtekening onder nieuwe mails.'), instellingen()) };

  if (!lijst.length && !gearchiveerd.length) return { chrome, body: content(intro('E-mails', 'Alle mails aan de werkgever, ACV en andere instanties.'), h('div', { class: 'card empty' }, 'Nog geen e-mails. Gebruik Nieuwe e-mail in de werkbalk.')) };
  const sorteer = rows => rows.sort((a, b) => datumVan(b).localeCompare(datumVan(a)));
  const groups = [
    { key: 'mail-concept', label: 'CONCEPT', tone: 'violet', rows: sorteer(lijst.filter(b => b.status !== 'verstuurd')) },
    { key: 'mail-verstuurd', label: 'VERSTUURD', tone: 'green', rows: sorteer(lijst.filter(b => b.status === 'verstuurd')), hideEmpty: true },
    { key: 'mail-archief', label: 'ARCHIEF', tone: 'grey', rows: sorteer(gearchiveerd), hideEmpty: true },
  ];
  const leeg = () => h('span', { class: 'grid2__dash' }, '—');
  const cols = [
    { label: 'E-mail', width: 300, render: b => h('a', { href: `#/communicatie/${encodeURIComponent(b.id)}`, 'data-mail': b.id }, titelVan(b)) },
    { label: 'Aan', width: 230, render: b => b.naar || b.aan || leeg() },
    { label: 'Bijlagen', width: 90, render: b => (b.bijlagen || []).length ? h('span', null, icon('doc', 12), ` ${(b.bijlagen || []).length}`) : leeg() },
    { label: 'Status', width: 190, render: b => b.soort === 'archief' ? badge('gearchiveerd', 'grey') : bezigMet.has(b.id) ? badge('bezig met versturen', 'orange') : b.status === 'verstuurd' ? badge(`verstuurd${b.verstuurdVan ? ' met Gmail' : ''}`, 'green') : b.twijfelOp ? badge('misschien verstuurd', 'red') : badge('concept', 'grey') },
    { label: 'Datum', width: 110, render: b => datumVan(b) ? fmtDate(datumVan(b)) : leeg() },
  ];
  return { chrome, body: grid(cols, groups, b => go(`communicatie/${encodeURIComponent(b.id)}`)) };
}

function nieuweMail() {
  const ht = handtekening().trim();
  const id = 'mail-' + uid();
  upsert('berichten', { id, soort: 'mail', titel: '', onderwerp: '', naar: '', cc: '', tekst: ht ? `\n\n${ht}` : '', status: 'concept', aangemaakt: todayIso(), eigen: true }, { silent: true });
  go(`communicatie/${id}`);
}

function instellingen() {
  let ht = handtekening();
  const opgeslagen = h('span', { class: 'small muted', role: 'status' });
  return h('div', { class: 'stack' },
    h('section', { class: 'card card--pad' }, h('p', { class: 'eyebrow' }, 'Afzender (Gmail)'), gserver.serverModus() ? serverGmailBlok() : gmailBlok()),
    h('section', { class: 'card card--pad' }, h('p', { class: 'eyebrow' }, 'Handtekening'),
      h('p', { class: 'small muted' }, 'Komt automatisch onder elke nieuwe e-mail. In een bestaande mail zet je ze erbij met Handtekening invoegen.'),
      h('textarea', { class: 'field', rows: 5, 'data-fk': 'mail-handtekening', value: ht, placeholder: 'Met vriendelijke groeten\n\nRemi\n+32 …', onInput: e => { ht = e.target.value; zetHandtekening(ht); opgeslagen.textContent = 'Bewaard.'; } }),
      opgeslagen));
}

function mailKaart(b) {
  const teller = h('span', { class: 'small muted' });
  const telBij = t => { const n = haken(t); teller.textContent = n ? `Nog ${n} ${n === 1 ? 'veld' : 'velden'} tussen haken in te vullen.` : ''; };
  telBij(b.tekst);
  const veld = h('textarea', { class: 'field', rows: 16, 'data-fk': `msg-${b.id}`, value: b.tekst || '', onInput: e => { const t = e.target.value; b.tekst = t; telBij(t); bewaarStil(b.id, { tekst: t }); } });
  const tekst = () => veld.value;
  const verstuurd = b.status === 'verstuurd';
  const bezig = bezigMet.has(b.id);
  const heeftBijlagen = (b.bijlagen || []).length > 0;
  const ht = handtekening().trim();
  const gearchiveerd = b.soort === 'archief';
  const zetSoort = soort => { bewaarNu(b.id); upsert('berichten', { id: b.id, soort }); toast(soort === 'mail' ? 'Teruggezet bij de e-mails' : 'Gearchiveerd. Je vindt de mail onderaan de lijst bij Archief.'); };
  return h('section', { class: 'card card--pad' },
    gearchiveerd && h('div', { class: 'mail-archief' }, h('p', { class: 'small' }, 'Deze e-mail staat in het archief.'), h('button', { class: 'btn btn--primary btn--sm', 'data-actie': 'terugzetten', onClick: () => zetSoort('mail') }, 'Terugzetten bij de e-mails')),
    h('div', { class: 'meta' }, badge(verstuurd ? `verstuurd ${fmtDate(b.verstuurdOp)}${b.verstuurdVan ? ` vanaf ${b.verstuurdVan}` : ''}` : 'concept', verstuurd ? 'green' : 'grey'), bezig && badge('bezig met versturen', 'orange'), b.twijfelOp && !verstuurd && badge('misschien verstuurd, kijk Gmail na', 'red'), b.aan && h('span', null, `Voor: ${b.aan}`)),
    b.titel && h('p', { class: 'row-title' }, b.titel),
    b.wanneer && h('p', { class: 'small muted' }, b.wanneer),
    mailVelden(b),
    h('label', { style: 'display:flex;flex-direction:column;gap:6px;margin-top:8px' }, h('span', { class: 'small muted' }, 'Tekst (wat je hier aanpast, blijft bewaard)'), veld),
    teller,
    ht && !tekst().includes(ht) && h('div', null, h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: () => { const t = `${tekst().replace(/\s+$/, '')}\n\n${ht}`; veld.value = t; b.tekst = t; telBij(t); bewaarNu(b.id); upsert('berichten', { id: b.id, tekst: t }); } }, 'Handtekening invoegen')),
    bijlagenBlok(b),
    h('div', { class: 'form__actions' },
      h('button', { class: `btn ${verstuurd ? 'btn--ghost' : 'btn--primary'} btn--sm`, 'data-actie': 'gmail', disabled: bezig, onClick: () => versturenMetGmail(b, tekst()) }, icon('mail', 12), h('span', { class: 'btn__label' }, bezig ? 'Bezig met versturen…' : verstuurd ? 'Opnieuw versturen met Gmail' : 'Versturen met Gmail')),
      typeof navigator.share === 'function' && h('button', { class: 'btn btn--ghost btn--sm', onClick: () => delen(b, tekst()) }, icon('external', 12), h('span', { class: 'btn__label' }, 'Delen met een app')),
      h('button', { class: 'btn btn--ghost btn--sm', onClick: () => copyText(tekst()) }, icon('copy', 12), h('span', { class: 'btn__label' }, 'Kopieer tekst')),
      h('a', { class: 'btn btn--ghost btn--sm', href: '#', onClick: e => { const c = { ...(get('berichten', b.id) || {}), ...b }; if ((c.bijlagen || []).length) toast(`Voeg in je mail-app zelf de bijlagen toe: ${c.bijlagen.map(x => x.naam).join(', ')}`); e.currentTarget.href = `mailto:${encodeURIComponent(mail.adressen(c.naar).tekst)}?${new URLSearchParams({ ...(c.cc ? { cc: mail.adressen(c.cc).tekst } : {}), subject: c.onderwerp || '', body: tekst() }).toString().replace(/\+/g, '%20')}`; } }, icon('external', 12), h('span', { class: 'btn__label' }, 'Open in mailprogramma')),
      verstuurd
        ? h('button', { class: 'btn btn--quiet btn--sm', onClick: () => { bewaarNu(b.id); upsert('berichten', { id: b.id, status: 'concept', verstuurdOp: '', verstuurdVan: '', gmailId: '' }); } }, 'Terug naar concept')
        : h('button', { class: 'btn btn--ghost btn--sm', onClick: () => {
          bewaarNu(b.id);
          if (haken(tekst()) && !confirm('Er staan nog velden tussen haken. Toch als verstuurd markeren?')) return;
          const c = get('berichten', b.id) || b;
          upsert('communicatie', { id: 'com-' + uid(), datum: todayIso(), met: c.naar || c.aan || '', kanaal: 'mail', richting: 'uit', onderwerp: String(c.onderwerp || c.titel || '').replace(/^Betreft:\s*/, ''), samenvatting: `${titelVan(c)}. Zelf verstuurd en gemarkeerd in de app.` }, { silent: true });
          upsert('berichten', { id: b.id, status: 'verstuurd', verstuurdOp: todayIso(), verstuurdVan: '', gmailId: '', twijfelOp: '' });
          toast('Gemarkeerd als verstuurd. Het staat nu ook in de Planning.');
        } }, icon('check', 12), h('span', { class: 'btn__label' }, 'Markeer als verstuurd')),
      !gearchiveerd && !bezig && h('button', { class: 'btn btn--quiet btn--sm', 'data-actie': 'archiveren', onClick: () => zetSoort('archief') }, 'Archiveren'),
      b.eigen && h('button', { class: 'btn btn--quiet btn--sm', disabled: bezig, onClick: async () => {
        if (!confirm('Deze e-mail verwijderen?')) return;
        for (const x of get('berichten', b.id)?.bijlagen || []) if (x.bron !== 'dossier') await wisBijlage(x.id).catch(() => {});
        clearTimeout(wachtend[b.id]?.timer); delete wachtend[b.id]; remove('berichten', b.id); go('communicatie');
      } }, 'Verwijderen')),
    heeftBijlagen && h('p', { class: 'small muted' }, 'Alleen Versturen met Gmail neemt de bijlagen zeker mee. Bij Open in mailprogramma, Kopieer tekst en Delen voeg je ze zelf toe in je mail-app.'),
    b.tips?.length > 0 && h('details', { style: 'margin-top:8px' }, h('summary', { class: 'small' }, 'Tips'), h('ul', { class: 'bullets small' }, b.tips.map(t => h('li', null, t)))));
}

// ---------- Mail: velden, bijlagen, versturen ----------
// Typen wordt kort uitgesteld bewaard. Voor elke actie die de kaart opnieuw tekent (bijlage, versturen,
// markeren) en bij elke nieuwe weergave bewaren we eerst wat nog wacht, anders zou de kaart oude waarden tonen.
const wachtend = {};
function bewaarStil(id, velden) {
  const w = wachtend[id] || (wachtend[id] = { velden: {} });
  Object.assign(w.velden, velden);
  clearTimeout(w.timer);
  w.timer = setTimeout(() => bewaarNu(id), 350);
}
function bewaarNu(id) {
  const w = wachtend[id];
  if (!w) return;
  clearTimeout(w.timer); delete wachtend[id];
  upsert('berichten', { id, ...w.velden }, { silent: true });
}
function bewaarAlles() { for (const id of Object.keys(wachtend)) bewaarNu(id); }
addEventListener('pagehide', bewaarAlles);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') bewaarAlles(); });

// Mails die op dit moment vertrekken: zolang een id hierin zit, kan dezelfde mail niet nog eens vertrekken.
const bezigMet = new Set();

function mailVelden(b) {
  // De velden schrijven ook rechtstreeks in b, zodat de knoppen de laatste waarde gebruiken.
  const veld = (k, label, ph, type = 'text') => h('label', { class: 'mail-veld' }, h('span', { class: 'small muted' }, label),
    h('input', { class: 'field', type, value: b[k] || '', placeholder: ph, 'data-fk': `msg-${b.id}-${k}`, onInput: e => { b[k] = e.target.value; bewaarStil(b.id, { [k]: e.target.value }); } }));
  return h('div', { class: 'mail-velden' },
    veld('naar', 'Aan (e-mailadres)', 'naam@voorbeeld.be', 'email'),
    veld('cc', 'Cc (optioneel)', 'naam@voorbeeld.be', 'email'),
    veld('onderwerp', 'Onderwerp', ''));
}

function bijlagenBlok(b) {
  const lijst = b.bijlagen || [];
  const kies = h('input', { type: 'file', multiple: true, class: 'visueel-verborgen', 'data-bijlage': b.id, 'aria-label': 'Bestand toevoegen als bijlage', onChange: async e => {
    const nieuw = [];
    for (const f of e.target.files) {
      const id = `mail-${b.id}/${uid()}`;
      try { await bewaarBijlage(id, f); nieuw.push({ id, naam: f.name, type: f.type, grootte: f.size }); } catch { toast(`${f.name} kon niet bewaard worden`); }
    }
    e.target.value = '';
    bewaarNu(b.id);
    if (nieuw.length) upsert('berichten', { id: b.id, bijlagen: [...(get('berichten', b.id)?.bijlagen || []), ...nieuw] });
  } });
  return h('div', { class: 'mail-bijlagen' },
    h('p', { class: 'small muted' }, 'Bijlagen'),
    lijst.length ? h('ul', { class: 'list list--tight' }, lijst.map(x => h('li', null, icon('doc', 14),
      h('span', { style: 'flex:1;min-width:0;overflow-wrap:anywhere' }, x.naam, x.grootte ? ` (${grootte(x.grootte)})` : '', x.bron === 'dossier' ? ' uit het dossier' : ''),
      h('button', { class: 'btn btn--quiet btn--sm', type: 'button', 'aria-label': `${x.naam} verwijderen`, disabled: bezigMet.has(b.id), onClick: async () => {
        if (x.bron !== 'dossier') await wisBijlage(x.id).catch(() => {});
        bewaarNu(b.id);
        upsert('berichten', { id: b.id, bijlagen: (get('berichten', b.id)?.bijlagen || []).filter(y => y.id !== x.id) });
      } }, 'Verwijderen')))) : h('p', { class: 'small muted' }, 'Nog geen bijlagen. Voeg bijvoorbeeld de ondertekende volmacht of een foto van een brief toe.'),
    h('div', { class: 'form__actions' },
      h('label', { class: 'btn btn--ghost btn--sm bestand-knop' }, icon('upload', 12), 'Bestand toevoegen', kies),
      h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: () => uitDossier(b) }, icon('doc', 12), 'Uit het dossier')));
}

function uitDossier(b) {
  openPeek('Bijlage uit het dossier', () => {
    const al = new Set((get('berichten', b.id)?.bijlagen || []).map(x => x.id));
    const docs = all('dossier').filter(d => (d.bijlagen || []).length);
    if (!docs.length) return h('p', { class: 'muted' }, 'Er staan nog geen foto\'s of pdf\'s in het dossier. Voeg ze toe bij Documenten, Dossier.');
    return h('div', { class: 'stack' }, docs.map(d => h('section', { class: 'card card--pad' },
      h('p', { class: 'row-title' }, d.titel), d.datum && h('p', { class: 'small muted' }, fmtDate(d.datum)),
      h('ul', { class: 'list list--tight' }, d.bijlagen.map(x => h('li', null, h('span', { style: 'flex:1;min-width:0;overflow-wrap:anywhere' }, x.naam),
        al.has(x.id) ? badge('toegevoegd', 'green') : h('button', { class: 'btn btn--ghost btn--sm', 'aria-label': `${x.naam} toevoegen`, onClick: () => {
          bewaarNu(b.id);
          upsert('berichten', { id: b.id, bijlagen: [...(get('berichten', b.id)?.bijlagen || []), { id: x.id, naam: x.naam, type: x.type, bron: 'dossier' }] });
          toast('Bijlage toegevoegd');
        } }, 'Toevoegen')))))));
  });
}

async function laadBijlagen(c) {
  const out = []; let totaal = 0;
  for (const x of c.bijlagen || []) {
    const blob = await leesBijlage(x.id).catch(() => null);
    if (!blob) throw new Error(`De bijlage ${x.naam} kon niet geladen worden. Kijk of er verbinding is, of voeg ze opnieuw toe.`);
    totaal += blob.size; out.push({ ...x, blob });
  }
  if (totaal > mail.MAX_BIJLAGEN) throw new Error(`De bijlagen zijn samen ${grootte(totaal)}. Gmail aanvaardt tot 25 MB.`);
  return { lijst: out, totaal };
}

// Fouten voor het paneel opengaat: in een klein paneel, zodat de melding blijft staan en voorgelezen wordt.
function foutPaneel(titel, tekst) {
  openPeek(titel, () => h('div', { class: 'stack' }, h('p', { class: 'mail-let', role: 'alert' }, tekst), h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--ghost', onClick: closePeek }, 'Sluiten'))));
}

async function versturenMetGmail(b, tekst) {
  if (bezigMet.has(b.id)) { toast('Deze mail wordt nog verstuurd.'); return; }
  bewaarNu(b.id);
  const c = { ...(get('berichten', b.id) || {}), ...b, tekst };
  const naar = mail.adressen(c.naar), cc = mail.adressen(c.cc);
  if (!naar.lijst.length) { toast('Vul het e-mailadres van de ontvanger in.'); return; }
  const fout = [...naar.fout, ...cc.fout];
  if (fout.length) { toast(`Dit e-mailadres klopt niet: ${fout[0]}`); return; }
  if (gserver.serverModus()) { await versturenViaServer(c, naar, cc); return; }
  if (!mail.geldigeClientId(mail.clientId())) { gmailInstellen(); return; }
  let sessie;
  try { sessie = await mail.aanmelden(); } catch (e) { foutPaneel('Aanmelden lukte niet', e.message); return; }
  let bijlagen;
  try { bijlagen = await laadBijlagen(c); } catch (e) { foutPaneel('Bijlagen', e.message); return; }
  bevestigVersturen(c, naar, cc, bijlagen, sessie);
}

// Servermodus: de server verstuurt met de toestemming die Remi één keer gaf. Geen aanmelding bij Google in de browser.
async function versturenViaServer(c, naar, cc) {
  let st;
  try { st = await gserver.status({ vers: true }); } catch (e) { foutPaneel('Gmail', serverFout(e)); return; }
  if (!st?.ingesteld || !st?.gekoppeld || !st?.email) { nietGekoppeld(st); return; }
  let bijlagen;
  try { bijlagen = await laadBijlagen(c); } catch (e) { foutPaneel('Bijlagen', e.message); return; }
  bevestigVersturen(c, naar, cc, bijlagen, { email: st.email, server: true });
}

const naarInstellingen = (cls = 'btn btn--ghost btn--sm') => h('a', { class: cls, href: '#/communicatie?tab=instellingen', 'data-actie': 'naar-gmail-instellingen', onClick: closePeek }, 'Naar Instellingen');
const serverFout = e => (e?.offline ? 'Geen verbinding met de server. Kijk de internetverbinding na en probeer opnieuw.' : (e?.message || 'Er ging iets mis. Probeer opnieuw.'));

function nietGekoppeld(st) {
  const tekst = !st?.ingesteld
    ? 'Versturen met Gmail is nog niet ingesteld. Bij Instellingen vult Giulia eerst één keer de Google-gegevens van de app in (stap 1). Daarna geeft Remi één keer toestemming met een koppellink (stap 2).'
    : 'Remi gaf nog geen toestemming om mails te versturen vanaf zijn Gmail-adres. Maak bij Instellingen een koppellink en stuur die naar Remi (stap 2). Hij hoeft dat maar één keer te doen.';
  openPeek('Gmail is nog niet gekoppeld', () => h('div', { class: 'stack' },
    h('p', { class: 'mail-let', role: 'alert', 'data-gmail-niet-gekoppeld': '' }, tekst),
    h('p', { class: 'small muted' }, 'Er is niets verstuurd. Wil je niet wachten? Gebruik dan Open in mailprogramma of Kopieer tekst.'),
    h('div', { class: 'form__actions' }, naarInstellingen('btn btn--primary'), h('button', { class: 'btn btn--ghost', onClick: closePeek }, 'Sluiten'))));
}

// Servermodus: of een fout betekent dat de mail misschien toch vertrok.
// - de server zegt het zelf (onzeker), of
// - de verbinding viel weg nadat de mail klaarstond (het verzoek kan de server bereikt hebben), of
// - er kwam een fout zonder uitleg van de functie zelf (bijvoorbeeld een time-out onderweg).
const klaarzettenMislukt = e => /^Mail klaarzetten/.test(String(e?.message || ''));
const misschienVerstuurd = e => e?.onzeker === true
  || (!!e?.offline && !klaarzettenMislukt(e))
  || (e?.onzeker === undefined && !e?.herkoppelen && !e?.instellen && !e?.offline && /non-2xx/i.test(String(e?.message || '')));

function bevestigVersturen(c, naar, cc, bijlagen, sessie, eerdereMelding = '') {
  const messageId = mail.nieuwMessageId(); // dezelfde id bij elke poging vanuit dit paneel
  const server = !!sessie.server;
  let melding = eerdereMelding, naarInst = false, onzeker = false, mijnPeek = 0;
  const herteken = () => { if (peekActief(mijnPeek)) vernieuw(); };
  mijnPeek = openPeek('Mail versturen', () => {
    const al = get('berichten', c.id) || {};
    const bezig = bezigMet.has(c.id);
    const open = haken(c.tekst) + haken(c.onderwerp);
    const zonderAfzender = !sessie.email;
    const rij = (k, v) => h('tr', null, h('td', { class: 'small muted', style: 'width:96px;vertical-align:top;padding:3px 8px 3px 0' }, k), h('td', { style: 'padding:3px 0;overflow-wrap:anywhere' }, v));
    const geenGmail = sessie.email && !/@(gmail|googlemail)\.com$/i.test(sessie.email);
    const knop = h('button', { class: 'btn btn--primary', 'data-actie': 'verstuur-nu', disabled: bezig || open > 0 || zonderAfzender, onClick: async () => {
      if (bezigMet.has(c.id)) return;
      if (onzeker && !confirm('Het is niet zeker of de vorige poging vertrokken is. Heb je in Gmail bij Verzonden gekeken en wil je echt opnieuw versturen?')) return;
      if ((al.gmailId || al.status === 'verstuurd') && !onzeker && !confirm('Deze mail werd al verstuurd. Echt nog eens versturen?')) return;
      // Meteen vergrendelen, nog voor er iets gewacht wordt: een dubbele klik verstuurt zo maar één keer.
      bezigMet.add(c.id); melding = ''; naarInst = false; vernieuw();
      // Dan de aanmelding nakijken (binnen de klik, zodat een aanmeldvenster niet geblokkeerd wordt).
      // Via de server is er geen aanmelding bij Google: de server gebruikt de toestemming van Remi.
      let s = sessie;
      if (!server) {
        try { s = await mail.aanmelden({ hint: sessie.email }); } catch (e) { bezigMet.delete(c.id); melding = e.message; vernieuw(); return; }
        if (sessie.email && s.email !== sessie.email) { bezigMet.delete(c.id); bevestigVersturen(c, naar, cc, bijlagen, s, 'Je bent aangemeld met een ander account. Kijk de afzender na voor je verstuurt.'); return; }
        sessie = s;
      }
      try {
        const mime = await mail.bouwMail({ naar: naar.tekst, cc: cc.tekst, onderwerp: c.onderwerp, tekst: c.tekst, bijlagen: bijlagen.lijst, messageId });
        const res = server ? await gserver.verstuur(mime) : await mail.verstuur(mime, s);
        const nogOpen = peekActief(mijnPeek);
        upsert('communicatie', { id: 'com-' + uid(), datum: todayIso(), met: naar.tekst, kanaal: 'mail', richting: 'uit', onderwerp: c.onderwerp, samenvatting: `${c.titel}. Verstuurd met Gmail vanaf ${res.van || 'het Gmail-account'}${cc.lijst.length ? `, in kopie ${cc.tekst}` : ''}.${bijlagen.lijst.length ? ` Bijlagen: ${bijlagen.lijst.map(x => x.naam).join(', ')}.` : ''}` }, { silent: true });
        bezigMet.delete(c.id);
        upsert('berichten', { id: c.id, tekst: c.tekst, status: 'verstuurd', verstuurdOp: todayIso(), verstuurdVan: res.van || '', gmailId: res.id, twijfelOp: '' });
        if (nogOpen) closePeek();
        toast(`Verstuurd vanaf ${res.van || 'Gmail'}`);
      } catch (e) {
        bezigMet.delete(c.id);
        const twijfel = server ? misschienVerstuurd(e) : !!e.onzeker;
        if (twijfel) { onzeker = true; upsert('berichten', { id: c.id, twijfelOp: todayIso() }, { silent: true }); }
        const uitleg = !server ? e.message
          : twijfel && e.offline ? 'De verbinding met de server viel weg tijdens het versturen. Het is niet zeker of de mail vertrokken is.'
          : twijfel && !e.onzeker ? 'De server gaf geen duidelijk antwoord. Het is niet zeker of de mail vertrokken is.'
          : e.herkoppelen ? 'De toestemming van Remi om te versturen is ingetrokken of verlopen, dus er is niets verstuurd. Remi moet de koppellink opnieuw openen: maak er een bij Instellingen, stap 2.'
          : e.instellen ? `${serverFout(e)} Dat kan bij Instellingen, stap 1.`
          : serverFout(e);
        naarInst = server && !twijfel && !!(e.herkoppelen || e.instellen);
        melding = twijfel && !/Verzonden/.test(uitleg) ? `${uitleg} Kijk eerst in Gmail bij Verzonden voor je opnieuw verstuurt.` : uitleg;
        vernieuw();
        if (!peekActief(mijnPeek)) toast(melding);
      }
    } }, bezig ? 'Bezig met versturen…' : onzeker ? 'Toch opnieuw versturen' : (al.gmailId || al.status === 'verstuurd') ? 'Toch opnieuw versturen' : 'Verstuur nu');
    return h('div', { class: 'stack' },
      (al.gmailId || al.status === 'verstuurd') && h('p', { class: 'small mail-let' }, `Deze mail werd al verstuurd op ${fmtDate(al.verstuurdOp)}${al.verstuurdVan ? ` vanaf ${al.verstuurdVan}` : ''}. Wil je ze echt nog eens versturen?`),
      al.twijfelOp && !onzeker && h('p', { class: 'small mail-let' }, `Bij een poging op ${fmtDate(al.twijfelOp)} is het niet zeker of de mail vertrok. Kijk eerst in Gmail bij Verzonden.`),
      server && h('p', { class: 'mail-vanaf', 'data-gmail-vanaf': '' }, 'Vertrekt vanaf ', h('strong', null, sessie.email), '.',
        h('span', { class: 'small muted' }, ' Met de toestemming die Remi gaf; aanmelden bij Google is niet nodig.')),
      h('table', { class: 'mail-overzicht' }, h('tbody', null,
        !server && rij('Van', h('span', null, h('strong', null, sessie.email || 'onbekend'), ' ', h('button', { class: 'btn btn--quiet btn--sm', disabled: bezig, onClick: async () => { if (bezigMet.has(c.id)) return; try { const s = await mail.aanmelden({ ander: true }); bevestigVersturen(c, naar, cc, bijlagen, s); } catch (e) { melding = e.message; herteken(); } } }, 'Ander account'))),
        rij('Aan', naar.tekst),
        cc.lijst.length ? rij('Cc', cc.tekst) : null,
        rij('Onderwerp', c.onderwerp || '(geen onderwerp)'),
        rij('Bijlagen', bijlagen.lijst.length ? `${bijlagen.lijst.map(x => x.naam).join(', ')} (${grootte(bijlagen.totaal)})` : 'geen'))),
      zonderAfzender && h('p', { class: 'small mail-let' }, 'Het afzenderadres kon niet opgehaald worden. Kies Ander account of probeer later opnieuw.'),
      geenGmail && h('p', { class: 'small muted' }, 'Heeft dit account geen Gmail, dan lukt versturen niet. Gebruik dan Delen met een app of Open in mailprogramma.'),
      open > 0 && h('p', { class: 'small mail-let' }, `Er staan nog ${open} ${open === 1 ? 'veld' : 'velden'} tussen vierkante haken. Vul ze eerst in.`),
      h('pre', { class: 'mail-voorbeeld' }, c.tekst),
      melding && h('p', { class: 'small mail-let', role: 'alert' }, melding),
      melding && naarInst && h('p', null, naarInstellingen()),
      h('div', { class: 'form__actions' }, knop, h('button', { class: 'btn btn--ghost', onClick: closePeek }, bezig ? 'Sluiten (versturen gaat door)' : 'Annuleren')));
  });
}

async function delen(b, tekst) {
  bewaarNu(b.id);
  const c = { ...(get('berichten', b.id) || {}), ...b };
  try {
    const { lijst } = await laadBijlagen(c);
    const bestanden = lijst.map(x => new File([x.blob], x.naam, { type: x.type || x.blob.type }));
    const metBestanden = bestanden.length && mail.kanDelenMetBestanden(bestanden);
    await navigator.share({ title: c.onderwerp || c.titel, text: tekst, ...(metBestanden ? { files: bestanden } : {}) });
    const naar = mail.adressen(c.naar), cc = mail.adressen(c.cc);
    if (naar.lijst.length) { copyText(naar.tekst); toast(`Adres gekopieerd. Vul in je mail-app als ontvanger in: ${naar.tekst}${cc.lijst.length ? `, cc ${cc.tekst}` : ''}`); }
    if (bestanden.length && !metBestanden) toast('Deze browser kon de bijlagen niet meegeven. Voeg ze toe in je mail-app.');
  } catch (e) {
    if (e?.name !== 'AbortError') toast(e.message || 'Delen lukte niet.');
  }
}

// ---------- Instellen: e-mail via Gmail ----------
const STAPPEN = origin => [
  'Ga naar console.cloud.google.com en meld je aan met een Google-account, bijvoorbeeld dat van Remi.',
  'Maak een nieuw project, bijvoorbeeld "Nieuwe start".',
  'Ga naar API\'s en services, Bibliotheek. Zoek "Gmail API" en klik op Inschakelen.',
  'Ga naar het OAuth-toestemmingsscherm (Google Auth Platform). Kies Extern, geef de app de naam "Nieuwe start" en vul je e-mailadres in als contact.',
  'Laat de publicatiestatus op Testen staan. Voeg bij Testgebruikers (Doelgroep) het Gmail-adres van Remi toe.',
  `Ga naar Clients (Inloggegevens), maak een OAuth-client-ID van het type Webapplicatie. Voeg bij Geautoriseerde JavaScript-bronnen dit adres toe: ${origin}`,
  'Kopieer de client-ID (eindigt op .apps.googleusercontent.com), plak hem bij stap 1 hierboven en klik op Bewaren.',
  'Klik bij stap 2 op Aanmelden met Gmail en kies het Gmail-account van Remi. Google waarschuwt dat de app niet geverifieerd is: kies Geavanceerd en dan Doorgaan. Dat is normaal voor een privé-app in testmodus. Vink de toestemming om e-mail te versturen aan.',
];
export function gmailInstellen() {
  if (gserver.serverModus()) { go('communicatie?tab=instellingen'); return; }
  if (mail.geldigeClientId(mail.clientId())) mail.laadGoogle().catch(() => {});
  openPeek('E-mail versturen via Gmail', () => gmailBlok());
}

// Melding van de Gmail-instellingen, bewaard over het hertekenen heen.
let gmailMelding = '';
function gmailBlok() {
  let waarde = mail.clientId();
  const nu = mail.aangemeldAls();
  const bewaard = mail.clientId();
  const ingesteld = mail.geldigeClientId(bewaard);
  const melding = h('p', { class: 'small', role: 'status', 'data-gmail-status': '' }, gmailMelding);
  const meld = t => { gmailMelding = t; melding.textContent = t; };
  const aanmelden = async () => {
    if (!mail.geldigeClientId(mail.clientId())) { meld('Bewaar eerst de client-ID (stap 1).'); return; }
    try {
      const s = await mail.aanmelden({ ander: true });
      gmailMelding = `Aangemeld als ${s.email || 'je Google-account'}. Mails vertrekken vanaf dit adres.${s.email && !/@(gmail|googlemail)\.com$/i.test(s.email) ? ' Heeft dit account geen Gmail, dan lukt versturen niet.' : ''}`;
      vernieuw();
    } catch (e) { meld(e.message); }
  };
  return h('div', { class: 'stack' },
    h('p', { class: 'mail-afzender' }, h('span', { class: 'small muted' }, 'Mails vertrekken vanaf'), h('strong', null, nu || 'nog niet aangemeld')),
    // Stap 1: de client-ID, altijd zichtbaar met de bewaarde waarde.
    h('div', { class: 'gmail-stap' },
      h('p', { class: 'gmail-stap__titel' }, h('span', { class: 'gmail-stap__nr' + (ingesteld ? ' is-klaar' : '') }, ingesteld ? '✓' : '1'), 'Google client-ID'),
      h('label', { class: 'small' }, ingesteld ? 'Bewaard. Je hoeft dit maar één keer te doen.' : 'Plak de client-ID uit Google Cloud en klik op Bewaren.',
        h('input', { class: 'field', value: waarde, placeholder: '123456789-abc.apps.googleusercontent.com', 'data-gmail-cid': '', onInput: e => { waarde = e.target.value; } })),
      h('div', { class: 'form__actions' },
        h('button', { class: 'btn ' + (ingesteld ? 'btn--ghost' : 'btn--primary') + ' btn--sm', 'data-actie': 'gmail-bewaren', onClick: () => {
          if (!mail.geldigeClientId(waarde)) { meld('Dit lijkt geen geldige client-ID. Ze eindigt op .apps.googleusercontent.com.'); return; }
          mail.zetClientId(waarde); mail.laadGoogle().catch(() => {});
          gmailMelding = 'Client-ID bewaard. Ga nu verder met stap 2: aanmelden met het Gmail-account van Remi.';
          vernieuw();
        } }, ingesteld ? 'Wijziging bewaren' : 'Bewaren')),
      h('details', { open: !ingesteld }, h('summary', { class: 'small' }, 'Hoe kom ik aan een client-ID? (eenmalig, ongeveer tien minuten)'),
        h('ol', { class: 'bullets small' }, STAPPEN(location.origin).map(x => h('li', null, x))))),
    // Stap 2: aanmelden bij Google. Het toegangstoken blijft alleen in deze pagina.
    h('div', { class: 'gmail-stap' + (ingesteld ? '' : ' is-uit') },
      h('p', { class: 'gmail-stap__titel' }, h('span', { class: 'gmail-stap__nr' + (nu ? ' is-klaar' : '') }, nu ? '✓' : '2'), 'Aanmelden met Gmail'),
      h('p', { class: 'small' }, nu ? `Aangemeld als ${nu}.` : 'Meld je aan met het Gmail-account van Remi en vink de toestemming aan om e-mail te versturen. Na het herladen van de pagina ben je weer afgemeld bij Google; de app vraagt het dan vanzelf opnieuw als je een mail verstuurt.'),
      h('div', { class: 'form__actions' },
        h('button', { class: 'btn btn--primary btn--sm', disabled: !ingesteld, 'data-actie': 'gmail-aanmelden', onClick: aanmelden }, nu ? 'Ander account kiezen' : 'Aanmelden met Gmail'),
        nu && h('button', { class: 'btn btn--quiet btn--sm', onClick: () => {
          gmailMelding = mail.afmelden()
            ? 'Afgemeld en toestemming ingetrokken.'
            : 'Er was geen actieve aanmelding in deze pagina. De toestemming zelf blijft bij Google tot je ze intrekt via myaccount.google.com/connections.';
          vernieuw();
        } }, 'Afmelden'))),
    melding,
    h('p', { class: 'small muted' }, 'De app vraagt alleen toestemming om mail te versturen en het adres te tonen, niet om mail te lezen. De toestemming blijft bij Google tot je ze intrekt via myaccount.google.com/connections. Werkt alleen met een Google-account dat Gmail gebruikt, meestal een adres op @gmail.com.'));
}

// ---------- Servermodus: Gmail koppelen via de server ----------
// Stap 1 (Giulia, eenmalig): de client-ID en het clientgeheim van de app in Google Cloud naar de server.
// Stap 2 (Remi, eenmalig): met een koppellink geeft Remi de server blijvende toestemming om te versturen.
// De toestand komt van de server: één keer opgehaald per bezoek aan de tab, opnieuw na een actie of met
// Opnieuw kijken. Elke andere herteken gebruikt wat al gekend is, zodat het scherm niet eindeloos opnieuw tekent.
const srv = { nodig: true, laden: false, fout: '', vorige: null, melding: '', meldingFout: false, bezig: '', wijzigen: false, cid: '', geheim: '', link: null, handleiding: null };
const opGmailTab = () => {
  const [pad, q] = location.hash.replace(/^#\/?/, '').split('?');
  return pad === 'communicatie' && new URLSearchParams(q || '').get('tab') === 'instellingen';
};
// De tab verlaten: bij het volgende bezoek opnieuw kijken. Een getypt geheim blijft niet in het geheugen.
addEventListener('hashchange', () => {
  if (opGmailTab()) return;
  Object.assign(srv, { nodig: true, vorige: null, fout: '', melding: '', meldingFout: false, wijzigen: false, cid: '', geheim: '' });
});

function laadStatus() {
  if (srv.laden) return;
  srv.laden = true; srv.nodig = false; srv.fout = '';
  gserver.status({ vers: true })
    .then(st => { srv.vorige = st || null; if (!st) srv.fout = 'De server gaf geen antwoord.'; })
    .catch(e => { srv.fout = serverFout(e); })
    .finally(() => { srv.laden = false; if (opGmailTab()) vernieuw(); });
}

// Een actie bij de server; daarna altijd de toestand opnieuw ophalen (de server kan iets anders weten).
async function srvActie(naam, extra, gelukt) {
  if (srv.bezig) return;
  srv.bezig = naam; srv.melding = ''; srv.meldingFout = false; vernieuw();
  try { gelukt(await gserver.actie(naam, extra)); } catch (e) { srv.melding = serverFout(e); srv.meldingFout = true; }
  srv.bezig = ''; srv.nodig = true;
  if (opGmailTab()) vernieuw();
}

const datumVanIso = iso => { const d = new Date(iso || ''); return isNaN(d) ? '' : fmtDate(isoLocal(d)); };
const codeVak = (tekst, actie) => h('span', { class: 'gmail-uri' }, h('code', { class: 'gmail-code' }, tekst),
  h('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'data-actie': actie, onClick: () => copyText(tekst) }, icon('copy', 12), 'Kopieer'));

const SERVER_STAPPEN = uri => [
  'Ga naar console.cloud.google.com en meld je aan met een Google-account, bijvoorbeeld dat van Remi.',
  'Kies bovenaan een project, of maak een nieuw project, bijvoorbeeld "Nieuwe start". Een project dat je vroeger al voor deze app maakte, mag ook.',
  'Ga naar API\'s en services, Bibliotheek. Zoek "Gmail API" en klik op Inschakelen.',
  'Ga naar Google Auth Platform (het OAuth-toestemmingsscherm) en klik op Aan de slag. Geef de app de naam "Nieuwe start" en kies je e-mailadres als ondersteuningsadres. Kies bij Doelgroep het type Extern. Vul bij Contactgegevens opnieuw je e-mailadres in, ga akkoord en klik op Maken.',
  'Ga naar Gegevenstoegang en klik op Bereiken toevoegen of verwijderen. Zoek gmail.send (E-mail verzenden namens jou), vink het aan, klik op Bijwerken en daarna op Opslaan.',
  'Ga naar Doelgroep en klik bij Publicatiestatus op App publiceren, zodat er In productie staat. Doe dat zeker: in de status Testen vervalt de toestemming van Remi na 7 dagen. Google toont Remi dan wel een waarschuwing dat de app niet geverifieerd is. Die mag hij negeren via Geavanceerd en dan Doorgaan.',
  'Ga naar Clients en klik op Client maken. Kies als type Webapplicatie en geef een naam, bijvoorbeeld "Nieuwe start server". Heb je al een client van het type Webapplicatie, dan mag je ook die gebruiken: klik erop om hem te bewerken.',
  ['Klik bij Geautoriseerde omleidings-URI\'s op URI toevoegen en plak exact dit adres:', codeVak(uri || '(nog niet gekend)', 'kopieer-uri'), 'Klik daarna op Maken of Opslaan.'],
  'Google toont nu de client-ID en het clientgeheim. Kopieer ze allebei, plak ze hierboven en klik op Bewaren. Doe het meteen: Google toont het geheim misschien maar één keer. Kwijt? Voeg bij de client dan een nieuw geheim toe.',
];

// Het bericht dat Giulia naar Remi stuurt, met de koppellink erin.
const berichtVoorRemi = (link, tot) => [
  'Dag Remi,',
  '',
  'Wil je één keer toestemming geven, zodat de app mails kan versturen vanaf jouw Gmail-adres? Het duurt maar een minuutje.',
  '',
  `1. Open deze link: ${link}`,
  '2. Meld je aan met je Gmail-account.',
  '3. Google waarschuwt misschien dat de app niet geverifieerd is. Dat is normaal voor onze eigen app. Klik op Geavanceerd en dan op Doorgaan (er staat "onveilig" bij, dat mag je hier negeren).',
  '4. Vink het vakje aan bij "E-mail verzenden namens jou" en klik op Doorgaan.',
  '5. Je ziet daarna "Gelukt". Dan mag je het venster sluiten.',
  '',
  `De link werkt één keer${tot ? `, tot ${tot}` : ''}. De app kan alleen mails versturen, niet je mails lezen.`,
].join('\n');

function koppellinkBlok(l) {
  const tot = datumVanIso(l.verloopt);
  const bericht = berichtVoorRemi(l.link, tot);
  return h('div', { class: 'gmail-link', 'data-gmail-link': '' },
    h('p', { class: 'small' }, h('strong', null, 'Koppellink voor Remi'), tot ? `, geldig tot ${tot}. ` : '. ', 'De link werkt één keer.'),
    h('code', { class: 'gmail-code' }, l.link),
    h('div', { class: 'form__actions' },
      h('button', { class: 'btn btn--primary btn--sm', type: 'button', 'data-actie': 'kopieer-link', onClick: () => copyText(l.link) }, icon('copy', 12), 'Kopieer'),
      typeof navigator.share === 'function' && h('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'data-actie': 'deel-link', onClick: () => navigator.share({ title: 'Gmail koppelen aan de app', text: bericht }).catch(e => { if (e?.name !== 'AbortError') toast('Delen lukte niet. Gebruik Kopieer.'); }) }, icon('external', 12), 'Delen'),
      h('a', { class: 'btn btn--quiet btn--sm', href: l.link, target: '_blank', rel: 'noopener' }, 'Ben jij Remi? Open de link hier')),
    h('p', { class: 'small muted' }, 'Bericht voor Remi met uitleg, om te kopiëren en te versturen (bijvoorbeeld met WhatsApp of sms):'),
    h('textarea', { class: 'field gmail-bericht', readonly: true, rows: 14, value: bericht, 'data-fk': 'gmail-bericht', 'data-gmail-bericht': '' }),
    h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'data-actie': 'kopieer-bericht', onClick: () => copyText(bericht) }, icon('copy', 12), 'Kopieer bericht')));
}

function serverGmailBlok() {
  if (srv.nodig && !srv.laden) laadStatus();
  const st = srv.vorige || (srv.laden ? null : gserver.gekendeStatus());
  const melding = h('p', { class: 'small' + (srv.meldingFout ? ' mail-let' : ''), role: 'status', 'data-gmail-status': '' }, srv.melding);
  const meld = (t, fout = false) => { srv.melding = t; srv.meldingFout = fout; melding.textContent = t; melding.className = 'small' + (fout ? ' mail-let' : ''); };
  const opnieuw = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'data-actie': 'gmail-opnieuw', disabled: srv.laden || !!srv.bezig, onClick: () => { srv.melding = ''; laadStatus(); vernieuw(); } }, srv.laden ? 'Even kijken…' : 'Opnieuw kijken');
  if (!st) {
    return h('div', { class: 'stack', 'data-gmail-server': '' },
      srv.laden ? h('p', { class: 'small muted', role: 'status', 'data-gmail-laden': '' }, 'Even kijken…')
        : [h('p', { class: 'small mail-let', role: 'alert' }, `De Gmail-instellingen konden niet opgehaald worden. ${srv.fout}`), h('div', { class: 'form__actions' }, opnieuw)]);
  }
  const klaar1 = !!st.ingesteld, klaar2 = !!st.gekoppeld;
  // Een koppellink die intussen gebruikt werd (nieuwe koppeling) of verlopen is, tonen we niet meer.
  if (srv.link && ((st.gekoppeldOp || '') !== srv.link.sinds || !(Date.parse(srv.link.verloopt) > Date.now()))) srv.link = null;

  const bewaar = () => {
    const clientId = srv.cid.trim(), clientSecret = srv.geheim.trim();
    if (!mail.geldigeClientId(clientId)) { meld('Dit lijkt geen geldige client-ID. Ze eindigt op .apps.googleusercontent.com.', true); return; }
    if (!clientSecret) { meld('Vul ook het clientgeheim in.', true); return; }
    srvActie('instellen', { clientId, clientSecret }, () => {
      // Meteen tonen wat de server nu weet; het opnieuw ophalen bevestigt het.
      Object.assign(srv, { wijzigen: false, cid: '', geheim: '', handleiding: null, vorige: { ...st, ingesteld: true, clientId } });
      meld('Bewaard. Ga nu verder met stap 2: de toestemming van Remi.');
    });
  };
  const formulier = [
    h('p', { class: 'small' }, 'Plak hier de client-ID en het clientgeheim uit Google Cloud en klik op Bewaren. Hoe je eraan komt, staat hieronder.'),
    h('label', { class: 'small' }, 'Client-ID',
      h('input', { class: 'field', value: srv.cid, placeholder: '123456789-abc.apps.googleusercontent.com', autocomplete: 'off', spellcheck: 'false', 'data-fk': 'gmail-srv-cid', onInput: e => { srv.cid = e.target.value; } })),
    h('label', { class: 'small' }, 'Clientgeheim',
      h('input', { class: 'field', value: srv.geheim, placeholder: 'GOCSPX-…', autocomplete: 'off', spellcheck: 'false', 'data-fk': 'gmail-srv-geheim', onInput: e => { srv.geheim = e.target.value; } })),
    h('p', { class: 'small muted' }, 'Het clientgeheim gaat alleen naar de server. De app toont het daarna nooit meer.'),
    h('div', { class: 'form__actions' },
      h('button', { class: 'btn btn--primary btn--sm', type: 'button', 'data-actie': 'gmail-bewaren', disabled: !!srv.bezig, onClick: bewaar }, srv.bezig === 'instellen' ? 'Bezig met bewaren…' : 'Bewaren'),
      srv.wijzigen && h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: () => { Object.assign(srv, { wijzigen: false, cid: '', geheim: '', melding: '' }); vernieuw(); } }, 'Annuleren')),
  ];
  const stap1 = h('div', { class: 'gmail-stap', 'data-gmail-stap': '1' },
    h('p', { class: 'gmail-stap__titel' }, h('span', { class: 'gmail-stap__nr' + (klaar1 ? ' is-klaar' : '') }, klaar1 ? '✓' : '1'), 'Google-gegevens van de app', h('span', { class: 'gmail-stap__wie' }, 'eenmalig, door Giulia')),
    klaar1 && !srv.wijzigen
      ? [h('p', { class: 'small', 'data-gmail-ingesteld': '' }, 'Ingesteld. ', st.clientId ? ['Client-ID: ', h('code', { class: 'gmail-code' }, st.clientId)] : ''),
        h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'data-actie': 'gmail-wijzigen', disabled: !!srv.bezig, onClick: () => { Object.assign(srv, { wijzigen: true, cid: st.clientId || '', geheim: '', melding: '' }); vernieuw(); } }, 'Wijzigen'))]
      : formulier,
    // Open of dicht volgt de stap (open zolang ze niet klaar is); alleen een eigen keuze wordt onthouden.
    h('details', { class: 'gmail-handleiding', open: srv.handleiding ?? !klaar1, onToggle: e => { srv.handleiding = e.target.open === !klaar1 ? null : e.target.open; } },
      h('summary', { class: 'small' }, 'Hoe kom ik aan de client-ID en het clientgeheim? (eenmalig, ongeveer een kwartier)'),
      h('ol', { class: 'bullets small' }, SERVER_STAPPEN(st.redirectUri).map(x => h('li', null, x)))));

  const maakLink = () => srvActie('link', {}, r => {
    if (!r?.link) throw new Error('De server gaf geen koppellink terug. Probeer opnieuw.');
    srv.link = { link: r.link, verloopt: r.verloopt, sinds: st.gekoppeldOp || '' };
    meld('Koppellink gemaakt. Kopieer of deel hem met Remi.');
  });
  const ontkoppel = () => {
    if (!confirm(`Gmail ontkoppelen? Daarna kan de app geen mails meer versturen vanaf ${st.email} tot Remi opnieuw een koppellink opent.`)) return;
    srvActie('ontkoppel', {}, () => {
      Object.assign(srv, { link: null, vorige: { ...st, gekoppeld: false, email: null, gekoppeldOp: null } });
      meld('Ontkoppeld. De toestemming van Remi is ingetrokken.');
    });
  };
  const sinds = datumVanIso(st.gekoppeldOp);
  const stap2 = h('div', { class: 'gmail-stap' + (klaar1 ? '' : ' is-uit'), 'data-gmail-stap': '2' },
    h('p', { class: 'gmail-stap__titel' }, h('span', { class: 'gmail-stap__nr' + (klaar2 ? ' is-klaar' : '') }, klaar2 ? '✓' : '2'), 'Toestemming van Remi', h('span', { class: 'gmail-stap__wie' }, 'eenmalig, door Remi')),
    h('p', { class: 'small', 'data-gmail-koppeling': '' }, klaar2 ? ['Gekoppeld met ', h('strong', null, st.email), sinds ? ` sinds ${sinds}` : '', '.'] : 'Nog niet gekoppeld.'),
    !klaar1 ? h('p', { class: 'small muted' }, 'Doe eerst stap 1.')
      : !klaar2 ? h('p', { class: 'small' }, 'Maak een koppellink en stuur die naar Remi. Remi opent de link, meldt zich aan met zijn Gmail en geeft toestemming om e-mail te versturen. Daarna kunnen Giulia en Remi altijd versturen vanaf zijn adres, zonder telkens aan te melden. Klik op Opnieuw kijken als Remi klaar is.')
      : h('p', { class: 'small muted' }, 'Mails uit de app vertrekken vanaf dit adres, voor Giulia en voor Remi. Een nieuwe koppellink is alleen nodig als Remi een ander Gmail-adres wil gebruiken of als de toestemming ingetrokken werd.'),
    srv.link && koppellinkBlok(srv.link),
    h('div', { class: 'form__actions' },
      h('button', { class: `btn ${klaar2 ? 'btn--ghost' : 'btn--primary'} btn--sm`, type: 'button', 'data-actie': 'gmail-link', disabled: !klaar1 || !!srv.bezig, onClick: maakLink }, srv.bezig === 'link' ? 'Bezig…' : 'Maak koppellink'),
      opnieuw,
      klaar2 && h('button', { class: 'btn btn--quiet btn--sm', type: 'button', 'data-actie': 'gmail-ontkoppelen', disabled: !!srv.bezig, onClick: ontkoppel }, srv.bezig === 'ontkoppel' ? 'Bezig…' : 'Ontkoppelen')));

  return h('div', { class: 'stack', 'data-gmail-server': '' },
    h('p', { class: 'mail-afzender' }, h('span', { class: 'small muted' }, 'Mails vertrekken vanaf'), h('strong', null, klaar2 ? st.email : 'nog niet gekoppeld'),
      h('span', { class: 'small muted' }, 'De server verstuurt de mails met de toestemming die Remi één keer gaf. Giulia en Remi hoeven daarvoor niet aan te melden bij Google.')),
    srv.fout && h('p', { class: 'small mail-let', role: 'alert' }, `Opnieuw kijken lukte niet. ${srv.fout}`),
    stap1, stap2, melding,
    h('p', { class: 'small muted' }, 'De app vraagt alleen toestemming om mail te versturen, niet om mail te lezen. Remi kan de toestemming altijd intrekken via myaccount.google.com/connections; daarna moet hij opnieuw een koppellink openen.'));
}
