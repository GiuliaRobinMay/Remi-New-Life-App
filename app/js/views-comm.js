// View: communicatie. Mails en brieven klaar om te kopiëren, en een logboek van elk contact.
import { h, icon, badge, fmtDate, todayIso, uid, copyText, toast } from './ui.js';
import { all, get, upsert, remove } from './store.js';
import { openPeek, closePeek } from './app.js';
import { content, intro, callout } from './views-core.js';
import { bewaarBijlage, leesBijlage, wisBijlage } from './bijlagen.js';
import * as mail from './mail.js';

const KANALEN = [['mail', 'Mail'], ['brief', 'Brief'], ['telefoon', 'Telefoon'], ['gesprek', 'Gesprek'], ['bericht', 'Sms of chat']];
const RICHTING = [['uit', 'Remi aan de ander'], ['in', 'De ander aan Remi']];
const KANAALKLEUR = { mail: 'violet', brief: 'orange', telefoon: 'green', gesprek: 'green', bericht: 'grey' };
const haken = t => (String(t || '').match(/\[[^\]]+\]/g) || []).length;
const grootte = n => (n >= 1048576 ? `${(n / 1048576).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(n / 1024))} kB`);
const sel = (opts, value, onChange) => h('select', { class: 'field', onChange: e => onChange(e.target.value) }, opts.map(([v, l]) => h('option', { value: v, selected: value === v }, l)));

export function communicatie(r) {
  const tab = ['mails', 'brieven', 'sms', 'logboek'].includes(r.tab) ? r.tab : 'mails';
  const berichten = all('berichten');
  const log = all('communicatie').sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
  const tabs = [['mails', 'Mails'], ['brieven', 'Brieven'], ['sms', 'Sms'], ['logboek', `Logboek ${log.length}`]].map(([k, l]) => ({ label: l, href: `#/communicatie?tab=${k}`, active: tab === k }));
  let inhoud;
  if (tab === 'logboek') {
    inhoud = h('div', { class: 'stack' },
      callout('violet', 'list', 'Waarom een logboek', h('p', null, 'Noteer elk contact met je werkgever, ACV, VDAB of de dokter: wanneer, met wie en wat er gezegd of afgesproken werd. Vooral bij gesprekken over het einde van je contract helpt een kort verslag op dezelfde dag. Dit logboek blijft in deze browser en komt niet in de repository.')),
      log.length ? h('section', { class: 'card card--pad' }, h('ul', { class: 'list' }, log.map(l => h('li', null,
        h('span', { class: 'small muted', style: 'width:78px;flex:0 0 auto' }, fmtDate(l.datum)),
        h('div', { style: 'min-width:0' },
          h('a', { href: '#', onClick: e => { e.preventDefault(); logForm(l); } }, l.onderwerp || '(zonder onderwerp)'), ' ',
          badge(KANALEN.find(k => k[0] === l.kanaal)?.[1] || l.kanaal, KANAALKLEUR[l.kanaal] || 'grey'),
          h('p', { class: 'small muted' }, [l.met, l.richting === 'in' ? 'aan Remi' : 'van Remi'].filter(Boolean).join(', ')),
          l.samenvatting && h('p', { class: 'small' }, l.samenvatting)))))) : h('div', { class: 'card empty' }, 'Nog niets genoteerd. Gebruik de knop in de werkbalk, of markeer een mail of brief als verstuurd.'));
  } else {
    const soort = { mails: 'mail', brieven: 'brief', sms: 'bericht' }[tab];
    if (soort === 'mail' && mail.geldigeClientId(mail.clientId())) mail.laadGoogle().catch(() => {});
    const lijst = berichten.filter(b => b.soort === soort);
    inhoud = h('div', { class: 'stack' },
      lijst.length ? lijst.map(berichtKaart) : h('div', { class: 'card empty' }, 'Nog geen berichten.'),
      h('p', { class: 'small muted' }, 'Mails en brieven voor sollicitaties staan bij ', h('a', { href: '#/documenten?tab=sjablonen' }, 'Documenten'), ' en per organisatie bij ', h('a', { href: '#/sollicitaties' }, 'Sollicitaties'), '.'));
  }
  const body = content(intro('Communicatie', 'Mails en brieven naar je werkgever en instanties, klaar om te kopiëren, en een logboek van elk contact. Alles wat vertrekt is in het Nederlands, met "u".'), inhoud);
  const tool = [h('button', { class: 'btn btn--primary', onClick: () => logForm() }, icon('plus', 14), 'Contact noteren')];
  const open = berichten.filter(b => b.soort !== 'bericht' && b.status !== 'verstuurd').length;
  return { chrome: { where: 'Mails, brieven, logboek', tabs, tool, view: `${open} klaar te maken`, viewIcon: 'edit' }, body };
}

function berichtKaart(b) {
  const teller = h('span', { class: 'small muted' });
  const telBij = t => { const n = haken(t); teller.textContent = n ? `Nog ${n} ${n === 1 ? 'veld' : 'velden'} tussen haken in te vullen.` : 'Alle velden ingevuld.'; };
  telBij(b.tekst);
  const veld = h('textarea', { class: 'field', rows: b.soort === 'bericht' ? 4 : 14, 'data-fk': `msg-${b.id}`, value: b.tekst || '', onInput: e => { const t = e.target.value; b.tekst = t; telBij(t); bewaarStil(b.id, { tekst: t }); } });
  const tekst = () => veld.value;
  const verstuurd = b.status === 'verstuurd';
  return h('section', { class: 'card card--pad' },
    h('div', { class: 'meta' }, b.soort !== 'bericht' && badge(verstuurd ? `verstuurd ${fmtDate(b.verstuurdOp)}${b.verstuurdVan ? ` vanaf ${b.verstuurdVan}` : ''}` : 'concept', verstuurd ? 'green' : 'grey'), h('span', null, `Aan: ${b.aan}`)),
    h('p', { class: 'row-title' }, b.titel),
    b.wanneer && h('p', { class: 'small muted' }, b.wanneer),
    b.soort === 'mail' && mailVelden(b),
    h('label', { style: 'display:flex;flex-direction:column;gap:6px;margin-top:8px' }, h('span', { class: 'small muted' }, 'Tekst (wat je hier aanpast, blijft bewaard)'), veld),
    teller,
    b.soort === 'mail' && bijlagenBlok(b),
    h('div', { class: 'form__actions' },
      b.soort === 'mail' && h('button', { class: 'btn btn--primary btn--sm', 'data-actie': 'gmail', onClick: () => versturenMetGmail(b, tekst()) }, icon('mail', 12), h('span', { class: 'btn__label' }, verstuurd ? 'Opnieuw versturen met Gmail' : 'Versturen met Gmail')),
      b.soort === 'mail' && typeof navigator.share === 'function' && h('button', { class: 'btn btn--ghost btn--sm', onClick: () => delen(b, tekst()) }, icon('external', 12), h('span', { class: 'btn__label' }, 'Delen met een app')),
      b.soort === 'mail' && h('button', { class: 'btn btn--ghost btn--sm', onClick: () => copyText(b.onderwerp) }, icon('copy', 12), h('span', { class: 'btn__label' }, 'Kopieer onderwerp')),
      h('button', { class: `btn ${b.soort === 'mail' ? 'btn--ghost' : 'btn--primary'} btn--sm`, onClick: () => copyText(tekst()) }, icon('copy', 12), h('span', { class: 'btn__label' }, { mail: 'Kopieer mail', brief: 'Kopieer brief', bericht: 'Kopieer bericht' }[b.soort])),
      b.soort === 'mail' && h('a', { class: 'btn btn--ghost btn--sm', href: '#', onClick: e => { const c = { ...(get('berichten', b.id) || {}), ...b }; e.currentTarget.href = `mailto:${encodeURIComponent(mail.adressen(c.naar).tekst)}?subject=${encodeURIComponent(c.onderwerp || '')}${c.cc ? `&cc=${encodeURIComponent(mail.adressen(c.cc).tekst)}` : ''}&body=${encodeURIComponent(tekst())}`; } }, icon('mail', 12), h('span', { class: 'btn__label' }, 'Open in mailprogramma')),
      b.soort === 'bericht'
        ? h('button', { class: 'btn btn--ghost btn--sm', onClick: () => { upsert('communicatie', { id: 'com-' + uid(), datum: todayIso(), met: b.aan, kanaal: 'bericht', richting: 'uit', onderwerp: b.titel, samenvatting: tekst() }); toast('Genoteerd in het logboek'); } }, icon('check', 12), h('span', { class: 'btn__label' }, 'Verstuurd, noteer in logboek'))
        : verstuurd
        ? h('button', { class: 'btn btn--quiet btn--sm', onClick: () => upsert('berichten', { id: b.id, status: 'concept', verstuurdOp: '' }) }, 'Terug naar concept')
        : h('button', { class: 'btn btn--ghost btn--sm', onClick: () => {
          if (haken(tekst()) && !confirm('Er staan nog velden tussen haken. Toch als verstuurd markeren?')) return;
          upsert('communicatie', { id: 'com-' + uid(), datum: todayIso(), met: b.aan, kanaal: b.soort, richting: 'uit', onderwerp: b.onderwerp.replace(/^Betreft:\s*/, ''), samenvatting: `${b.titel}. Verstuurd vanuit de app.` }, { silent: true });
          upsert('berichten', { id: b.id, status: 'verstuurd', verstuurdOp: todayIso() });
          toast('Gemarkeerd als verstuurd en genoteerd in het logboek');
        } }, icon('check', 12), h('span', { class: 'btn__label' }, 'Markeer als verstuurd'))),
    b.tips?.length > 0 && h('details', { style: 'margin-top:8px' }, h('summary', { class: 'small' }, 'Tips'), h('ul', { class: 'bullets small' }, b.tips.map(t => h('li', null, t)))));
}

function logForm(init = {}) {
  const l = { id: init.id, datum: init.datum || todayIso(), met: init.met || '', kanaal: init.kanaal || 'gesprek', richting: init.richting || 'uit', onderwerp: init.onderwerp || '', samenvatting: init.samenvatting || '' };
  openPeek(l.id ? 'Contact bewerken' : 'Contact noteren', () => {
    const inp = (k, type = 'text') => h('input', { class: 'field', type, value: l[k], onInput: e => l[k] = e.target.value });
    return h('form', { class: 'form', onSubmit: e => { e.preventDefault(); if (!l.datum || !(l.onderwerp || l.samenvatting)) return; upsert('communicatie', { ...l, id: l.id || 'com-' + uid() }); closePeek(); toast('Genoteerd'); } },
      h('div', { class: 'form__row' }, h('label', null, 'Datum', inp('datum', 'date')), h('label', null, 'Met wie', inp('met'))),
      h('div', { class: 'form__row' }, h('label', null, 'Hoe', sel(KANALEN, l.kanaal, x => l.kanaal = x)), h('label', null, 'Richting', sel(RICHTING, l.richting, x => l.richting = x))),
      h('label', null, 'Onderwerp', inp('onderwerp')),
      h('label', null, 'Wat werd er gezegd of afgesproken', h('textarea', { class: 'field', style: 'min-height:160px', value: l.samenvatting, onInput: e => l.samenvatting = e.target.value })),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit' }, 'Bewaren'), l.id && h('button', { class: 'btn btn--danger', type: 'button', onClick: () => { remove('communicatie', l.id); closePeek(); } }, 'Verwijderen')));
  });
}

// ---------- Mail: velden, bijlagen, versturen ----------
// Typen wordt kort uitgesteld bewaard. Voor elke actie die de kaart opnieuw tekent (bijlage, versturen)
// bewaren we eerst wat nog wacht, anders zou de kaart oude waarden tonen.
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
function mailVelden(b) {
  // De velden schrijven ook rechtstreeks in b, zodat de knoppen de laatste waarde gebruiken, ook voor het bewaren.
  const veld = (k, label, ph, type = 'text') => h('label', { class: 'mail-veld' }, h('span', { class: 'small muted' }, label),
    h('input', { class: 'field', type, value: b[k] || '', placeholder: ph, 'data-fk': `msg-${b.id}-${k}`, onInput: e => { b[k] = e.target.value; bewaarStil(b.id, { naar: b.naar || '', cc: b.cc || '', onderwerp: b.onderwerp || '' }); } }));
  return h('div', { class: 'mail-velden' },
    veld('naar', 'Aan (e-mailadres)', 'naam@voorbeeld.be', 'email'),
    veld('cc', 'Cc (optioneel)', 'naam@voorbeeld.be', 'email'),
    veld('onderwerp', 'Onderwerp', ''));
}

function bijlagenBlok(b) {
  const lijst = b.bijlagen || [];
  const kies = h('input', { type: 'file', multiple: true, style: 'display:none', 'data-bijlage': b.id, onChange: async e => {
    const nieuw = [];
    for (const f of e.target.files) {
      const id = `mail-${b.id}/${uid()}`;
      try { await bewaarBijlage(id, f); nieuw.push({ id, naam: f.name, type: f.type, grootte: f.size }); } catch { toast(`${f.name} kon niet bewaard worden`); }
    }
    bewaarNu(b.id);
    if (nieuw.length) upsert('berichten', { id: b.id, bijlagen: [...(get('berichten', b.id)?.bijlagen || []), ...nieuw] });
  } });
  return h('div', { class: 'mail-bijlagen' },
    h('p', { class: 'small muted' }, 'Bijlagen'),
    lijst.length ? h('ul', { class: 'list list--tight' }, lijst.map(x => h('li', null, icon('doc', 14),
      h('span', { style: 'flex:1;min-width:0;overflow-wrap:anywhere' }, x.naam, x.grootte ? ` (${grootte(x.grootte)})` : '', x.bron === 'dossier' ? ' uit het dossier' : ''),
      h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: async () => {
        if (x.bron !== 'dossier') await wisBijlage(x.id).catch(() => {});
        bewaarNu(b.id);
        upsert('berichten', { id: b.id, bijlagen: (get('berichten', b.id)?.bijlagen || []).filter(y => y.id !== x.id) });
      } }, 'Verwijderen')))) : h('p', { class: 'small muted' }, 'Nog geen bijlagen. Voeg bijvoorbeeld de ondertekende volmacht of een foto van een brief toe.'),
    h('div', { class: 'form__actions' },
      h('label', { class: 'btn btn--ghost btn--sm' }, icon('upload', 12), 'Bestand toevoegen', kies),
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
        al.has(x.id) ? badge('toegevoegd', 'green') : h('button', { class: 'btn btn--ghost btn--sm', onClick: () => {
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

async function versturenMetGmail(b, tekst) {
  bewaarNu(b.id);
  const c = { ...(get('berichten', b.id) || {}), ...b, tekst };
  const naar = mail.adressen(c.naar), cc = mail.adressen(c.cc);
  if (!naar.lijst.length) { toast('Vul het e-mailadres van de ontvanger in.'); return; }
  const fout = [...naar.fout, ...cc.fout];
  if (fout.length) { toast(`Dit e-mailadres klopt niet: ${fout[0]}`); return; }
  if (!mail.geldigeClientId(mail.clientId())) { gmailInstellen(); return; }
  let sessie;
  try { sessie = await mail.aanmelden(); } catch (e) { toast(e.message); return; }
  let bijlagen;
  try { bijlagen = await laadBijlagen(c); } catch (e) { toast(e.message); return; }
  bevestigVersturen(c, naar, cc, bijlagen, sessie);
}

function bevestigVersturen(c, naar, cc, bijlagen, sessie) {
  let bezig = false;
  openPeek('Mail versturen', () => {
    const open = haken(c.tekst) + haken(c.onderwerp);
    const rij = (k, v) => h('tr', null, h('td', { class: 'small muted', style: 'width:96px;vertical-align:top;padding:3px 8px 3px 0' }, k), h('td', { style: 'padding:3px 0;overflow-wrap:anywhere' }, v));
    const knop = h('button', { class: 'btn btn--primary', 'data-actie': 'verstuur-nu', disabled: open > 0, onClick: async () => {
      if (bezig) return; bezig = true; knop.disabled = true; knop.textContent = 'Bezig met versturen…';
      try {
        const mime = await mail.bouwMail({ naar: naar.tekst, cc: cc.tekst, onderwerp: c.onderwerp, tekst: c.tekst, bijlagen: bijlagen.lijst });
        const res = await mail.verstuur(mime);
        upsert('communicatie', { id: 'com-' + uid(), datum: todayIso(), met: naar.tekst, kanaal: 'mail', richting: 'uit', onderwerp: c.onderwerp, samenvatting: `${c.titel}. Verstuurd met Gmail vanaf ${res.van || 'het Gmail-account'}${cc.lijst.length ? `, in kopie ${cc.tekst}` : ''}.${bijlagen.lijst.length ? ` Bijlagen: ${bijlagen.lijst.map(x => x.naam).join(', ')}.` : ''}` }, { silent: true });
        upsert('berichten', { id: c.id, tekst: c.tekst, status: 'verstuurd', verstuurdOp: todayIso(), verstuurdVan: res.van || '', gmailId: res.id });
        closePeek();
        toast(`Verstuurd vanaf ${res.van || 'Gmail'}`);
      } catch (e) {
        bezig = false; knop.disabled = false; knop.textContent = 'Verstuur nu';
        toast(e.message);
      }
    } }, 'Verstuur nu');
    return h('div', { class: 'stack' },
      h('table', { class: 'mail-overzicht' }, h('tbody', null,
        rij('Van', h('span', null, h('strong', null, sessie.email || 'je Gmail-account'), ' ', h('button', { class: 'btn btn--quiet btn--sm', onClick: async () => { try { sessie = await mail.aanmelden({ ander: true }); bevestigVersturen(c, naar, cc, bijlagen, sessie); } catch (e) { toast(e.message); } } }, 'Ander account'))),
        rij('Aan', naar.tekst),
        cc.lijst.length ? rij('Cc', cc.tekst) : null,
        rij('Onderwerp', c.onderwerp || '(geen onderwerp)'),
        rij('Bijlagen', bijlagen.lijst.length ? `${bijlagen.lijst.map(x => x.naam).join(', ')} (${grootte(bijlagen.totaal)})` : 'geen'))),
      open > 0 && h('p', { class: 'small mail-let' }, `Er staan nog ${open} ${open === 1 ? 'veld' : 'velden'} tussen vierkante haken. Vul ze eerst in.`),
      h('pre', { class: 'mail-voorbeeld' }, c.tekst),
      h('div', { class: 'form__actions' }, knop, h('button', { class: 'btn btn--ghost', onClick: closePeek }, 'Annuleren')));
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
  openPeek('E-mail versturen via Gmail', () => {
    let waarde = mail.clientId();
    const status = h('p', { class: 'small', 'data-gmail-status': '' }, mail.aangemeldAls() ? `Aangemeld als ${mail.aangemeldAls()}. Mails vertrekken vanaf dit adres.` : (mail.clientId() ? 'Client-ID ingesteld. Nog niet aangemeld.' : 'Nog niet ingesteld.'));
    return h('div', { class: 'stack' },
      h('p', null, 'Hiermee verstuurt de app mails rechtstreeks vanaf het Gmail-adres van Remi, met bijlagen. De app krijgt alleen toestemming om mail te versturen en het adres te tonen, niet om mail te lezen. De toestemming blijft in deze pagina en verdwijnt bij herladen. Intrekken kan altijd via myaccount.google.com, Beveiliging, Apps van derden.'),
      h('p', { class: 'small muted' }, 'Eenmalig instellen, ongeveer tien minuten. Werkt alleen met een Gmail- of Google-account. Heeft Remi een ander mailadres, gebruik dan Delen met een app of Open in mailprogramma.'),
      h('ol', { class: 'bullets small' }, STAPPEN(location.origin).map(x => h('li', null, x))),
      h('label', null, 'Google client-ID', h('input', { class: 'field', value: waarde, placeholder: '123456789-abc.apps.googleusercontent.com', 'data-gmail-cid': '', onInput: e => { waarde = e.target.value; } })),
      h('div', { class: 'form__actions' },
        h('button', { class: 'btn btn--primary', onClick: () => {
          if (!mail.geldigeClientId(waarde)) { toast('Dit lijkt geen geldige client-ID. Ze eindigt op .apps.googleusercontent.com.'); return; }
          mail.zetClientId(waarde); mail.laadGoogle().catch(() => {}); status.textContent = 'Bewaard. Klik nu op Verbinding testen.';
        } }, 'Bewaren'),
        h('button', { class: 'btn btn--ghost', onClick: async () => {
          if (!mail.geldigeClientId(waarde)) { toast('Vul eerst een geldige client-ID in.'); return; }
          if (mail.clientId() !== waarde.trim()) mail.zetClientId(waarde);
          try { const s = await mail.aanmelden({ ander: true }); status.textContent = `Aangemeld als ${s.email || 'je Google-account'}. Mails vertrekken vanaf dit adres.`; } catch (e) { status.textContent = e.message; }
        } }, 'Verbinding testen'),
        mail.clientId() && h('button', { class: 'btn btn--quiet', onClick: () => { mail.afmelden(); status.textContent = 'Afgemeld. Aanmelden kan opnieuw bij het volgende versturen.'; } }, 'Afmelden')),
      status);
  });
}

