// View: communicatie. Alle e-mails in één tabel; een mail openen toont ze op een eigen pagina met
// adressen, tekst, bijlagen en versturen via Gmail. Bij Instellingen: de afzender (Gmail) en de handtekening.
import { h, icon, badge, fmtDate, todayIso, uid, copyText, toast } from './ui.js';
import { all, get, upsert, remove } from './store.js';
import { openPeek, closePeek, peekActief, vernieuw, go } from './app.js';
import { content, intro, callout } from './views-core.js';
import { grid } from './views-werk.js';
import { bewaarBijlage, leesBijlage, wisBijlage } from './bijlagen.js';
import * as mail from './mail.js';

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

// Handtekening: per toestel bewaard (Remi en Giulia hebben elk hun eigen toestel).
const HT = 'remi-mail-handtekening';
export function handtekening() { try { return localStorage.getItem(HT) || ''; } catch { return ''; } }
function zetHandtekening(v) { try { localStorage.setItem(HT, v); } catch { /* privévenster: niet bewaard */ } }

export function communicatie(r) {
  bewaarAlles();
  const lijst = mails();
  const gearchiveerd = archief();
  const open = [...lijst, ...gearchiveerd].find(b => b.id === r.params?.[0]);
  const tab = open ? 'mails' : r.tab === 'instellingen' ? 'instellingen' : 'mails';
  const tabs = [['mails', 'E-mails'], ['instellingen', 'Instellingen']].map(([k, l]) => ({ label: l, href: `#/communicatie?tab=${k}`, active: tab === k }));
  if (mail.geldigeClientId(mail.clientId())) mail.laadGoogle().catch(() => {});
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
    h('section', { class: 'card card--pad' }, h('p', { class: 'eyebrow' }, 'Afzender (Gmail)'), gmailBlok()),
    h('section', { class: 'card card--pad' }, h('p', { class: 'eyebrow' }, 'Handtekening'),
      h('p', { class: 'small muted' }, 'Komt automatisch onder elke nieuwe e-mail. In een bestaande mail zet je ze erbij met Handtekening invoegen. Ze wordt bewaard op dit toestel.'),
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
    if (!blob) throw new Error(`De bijlage ${x.naam} staat niet op dit toestel. Voeg ze opnieuw toe.`);
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
  if (!mail.geldigeClientId(mail.clientId())) { gmailInstellen(); return; }
  let sessie;
  try { sessie = await mail.aanmelden(); } catch (e) { foutPaneel('Aanmelden lukte niet', e.message); return; }
  let bijlagen;
  try { bijlagen = await laadBijlagen(c); } catch (e) { foutPaneel('Bijlagen', e.message); return; }
  bevestigVersturen(c, naar, cc, bijlagen, sessie);
}

function bevestigVersturen(c, naar, cc, bijlagen, sessie, eerdereMelding = '') {
  const messageId = mail.nieuwMessageId(); // dezelfde id bij elke poging vanuit dit paneel
  let melding = eerdereMelding, onzeker = false, mijnPeek = 0;
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
      bezigMet.add(c.id); melding = ''; vernieuw();
      // Dan de aanmelding nakijken (binnen de klik, zodat een aanmeldvenster niet geblokkeerd wordt).
      let s;
      try { s = await mail.aanmelden({ hint: sessie.email }); } catch (e) { bezigMet.delete(c.id); melding = e.message; vernieuw(); return; }
      if (sessie.email && s.email !== sessie.email) { bezigMet.delete(c.id); bevestigVersturen(c, naar, cc, bijlagen, s, 'Je bent aangemeld met een ander account. Kijk de afzender na voor je verstuurt.'); return; }
      sessie = s;
      try {
        const mime = await mail.bouwMail({ naar: naar.tekst, cc: cc.tekst, onderwerp: c.onderwerp, tekst: c.tekst, bijlagen: bijlagen.lijst, messageId });
        const res = await mail.verstuur(mime, s);
        const nogOpen = peekActief(mijnPeek);
        upsert('communicatie', { id: 'com-' + uid(), datum: todayIso(), met: naar.tekst, kanaal: 'mail', richting: 'uit', onderwerp: c.onderwerp, samenvatting: `${c.titel}. Verstuurd met Gmail vanaf ${res.van || 'het Gmail-account'}${cc.lijst.length ? `, in kopie ${cc.tekst}` : ''}.${bijlagen.lijst.length ? ` Bijlagen: ${bijlagen.lijst.map(x => x.naam).join(', ')}.` : ''}` }, { silent: true });
        bezigMet.delete(c.id);
        upsert('berichten', { id: c.id, tekst: c.tekst, status: 'verstuurd', verstuurdOp: todayIso(), verstuurdVan: res.van || '', gmailId: res.id, twijfelOp: '' });
        if (nogOpen) closePeek();
        toast(`Verstuurd vanaf ${res.van || 'Gmail'}`);
      } catch (e) {
        bezigMet.delete(c.id);
        if (e.onzeker) { onzeker = true; upsert('berichten', { id: c.id, twijfelOp: todayIso() }, { silent: true }); }
        melding = e.onzeker ? `${e.message} Kijk eerst in Gmail bij Verzonden voor je opnieuw verstuurt.` : e.message;
        vernieuw();
        if (!peekActief(mijnPeek)) toast(melding);
      }
    } }, bezig ? 'Bezig met versturen…' : onzeker ? 'Toch opnieuw versturen' : (al.gmailId || al.status === 'verstuurd') ? 'Toch opnieuw versturen' : 'Verstuur nu');
    return h('div', { class: 'stack' },
      (al.gmailId || al.status === 'verstuurd') && h('p', { class: 'small mail-let' }, `Deze mail werd al verstuurd op ${fmtDate(al.verstuurdOp)}${al.verstuurdVan ? ` vanaf ${al.verstuurdVan}` : ''}. Wil je ze echt nog eens versturen?`),
      al.twijfelOp && !onzeker && h('p', { class: 'small mail-let' }, `Bij een poging op ${fmtDate(al.twijfelOp)} is het niet zeker of de mail vertrok. Kijk eerst in Gmail bij Verzonden.`),
      h('table', { class: 'mail-overzicht' }, h('tbody', null,
        rij('Van', h('span', null, h('strong', null, sessie.email || 'onbekend'), ' ', h('button', { class: 'btn btn--quiet btn--sm', disabled: bezig, onClick: async () => { if (bezigMet.has(c.id)) return; try { const s = await mail.aanmelden({ ander: true }); bevestigVersturen(c, naar, cc, bijlagen, s); } catch (e) { melding = e.message; herteken(); } } }, 'Ander account'))),
        rij('Aan', naar.tekst),
        cc.lijst.length ? rij('Cc', cc.tekst) : null,
        rij('Onderwerp', c.onderwerp || '(geen onderwerp)'),
        rij('Bijlagen', bijlagen.lijst.length ? `${bijlagen.lijst.map(x => x.naam).join(', ')} (${grootte(bijlagen.totaal)})` : 'geen'))),
      zonderAfzender && h('p', { class: 'small mail-let' }, 'Het afzenderadres kon niet opgehaald worden. Kies Ander account of probeer later opnieuw.'),
      geenGmail && h('p', { class: 'small muted' }, 'Heeft dit account geen Gmail, dan lukt versturen niet. Gebruik dan Delen met een app of Open in mailprogramma.'),
      open > 0 && h('p', { class: 'small mail-let' }, `Er staan nog ${open} ${open === 1 ? 'veld' : 'velden'} tussen vierkante haken. Vul ze eerst in.`),
      h('pre', { class: 'mail-voorbeeld' }, c.tekst),
      melding && h('p', { class: 'small mail-let', role: 'alert' }, melding),
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
  'Kopieer de client-ID (eindigt op .apps.googleusercontent.com) en plak hem hieronder. Klik op Bewaren.',
  'Klik op Verbinding testen en meld aan met het Gmail-account van Remi. Google waarschuwt dat de app niet geverifieerd is: kies Geavanceerd en dan Doorgaan. Dat is normaal voor een privé-app in testmodus. Vink de toestemming om e-mail te versturen aan.',
];
export function gmailInstellen() {
  if (mail.geldigeClientId(mail.clientId())) mail.laadGoogle().catch(() => {});
  openPeek('E-mail versturen via Gmail', () => gmailBlok());
}

function gmailBlok() {
  let waarde = mail.clientId();
  const nu = mail.aangemeldAls();
  const ingesteld = mail.geldigeClientId(mail.clientId());
  const status = h('p', { class: 'small', role: 'status', 'data-gmail-status': '' }, nu ? `Aangemeld als ${nu}. Mails vertrekken vanaf dit adres.` : (ingesteld ? 'Gmail is ingesteld. Nog niet aangemeld in deze pagina: dat gebeurt bij het eerste versturen, of nu met Aanmelden.' : 'Nog niet ingesteld. Volg eenmalig de stappen hieronder.'));
  const aanmelden = async () => {
    if (!mail.geldigeClientId(waarde)) { status.textContent = 'Vul eerst een geldige client-ID in.'; return; }
    if (mail.clientId() !== waarde.trim()) mail.zetClientId(waarde);
    try {
      const s = await mail.aanmelden({ ander: true });
      status.textContent = `Aangemeld als ${s.email || 'je Google-account'}. Mails vertrekken vanaf dit adres.${s.email && !/@(gmail|googlemail)\.com$/i.test(s.email) ? ' Heeft dit account geen Gmail, dan lukt versturen niet.' : ''}`;
    } catch (e) { status.textContent = e.message; }
  };
  return h('div', { class: 'stack' },
    h('p', { class: 'mail-afzender' }, h('span', { class: 'small muted' }, 'Mails vertrekken vanaf'), h('strong', null, nu || 'nog niet aangemeld')),
    status,
    ingesteld && h('div', { class: 'form__actions' },
      h('button', { class: 'btn btn--primary', onClick: aanmelden }, nu ? 'Ander account kiezen' : 'Aanmelden met Gmail'),
      h('button', { class: 'btn btn--quiet', onClick: () => {
        status.textContent = mail.afmelden()
          ? 'Afgemeld en toestemming ingetrokken.'
          : 'Er was geen actieve aanmelding in deze pagina. De toestemming zelf blijft bij Google tot je ze intrekt via myaccount.google.com/connections. Op een gedeeld toestel: meld je ook af bij Google.';
      } }, 'Afmelden')),
    h('p', { class: 'small muted' }, 'De app vraagt alleen toestemming om mail te versturen en het adres te tonen, niet om mail te lezen. Het toegangstoken blijft alleen in deze pagina en verdwijnt bij herladen. De toestemming zelf blijft bij Google tot je ze intrekt via myaccount.google.com/connections. Werkt alleen met een Google-account dat Gmail gebruikt, meestal een adres op @gmail.com.'),
    h('details', { open: !ingesteld }, h('summary', { class: 'small' }, ingesteld ? 'Instellen of client-ID wijzigen' : 'Eenmalig instellen (ongeveer tien minuten)'),
      h('ol', { class: 'bullets small' }, STAPPEN(location.origin).map(x => h('li', null, x))),
      h('label', null, 'Google client-ID', h('input', { class: 'field', value: waarde, placeholder: '123456789-abc.apps.googleusercontent.com', 'data-gmail-cid': '', onInput: e => { waarde = e.target.value; } })),
      h('div', { class: 'form__actions' },
        h('button', { class: 'btn btn--primary', onClick: () => {
          if (!mail.geldigeClientId(waarde)) { status.textContent = 'Dit lijkt geen geldige client-ID. Ze eindigt op .apps.googleusercontent.com.'; return; }
          mail.zetClientId(waarde); mail.laadGoogle().catch(() => {}); status.textContent = 'Bewaard. Klik nu op Verbinding testen.';
        } }, 'Bewaren'),
        h('button', { class: 'btn btn--ghost', onClick: aanmelden }, 'Verbinding testen'))));
}
