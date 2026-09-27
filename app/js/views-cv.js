// Cv-atelier: het cv sectie per sectie opbouwen, met gids, voorbeelden, competentiescan en zelftests.
// Opslag: collectie 'cvdoc' (een document 'remi' dat per sectie het master-cv uit data/cv-master.json overschrijft),
// 'competentiescores' (per competentie) en 'zelftests' (werkwaarden, kernkwadranten, energie, feedback, extern).
// Tekstvelden bewaren stil (zonder herteken), zodat de focus en de open uitklapblokken blijven staan.
import { h, icon, badge, copyText, download, toast, todayIso, md } from './ui.js';
import { all, get, upsert, remove, ref } from './store.js';
import { getCv, CVID } from './cvdata.js';
export { getCv };
import { content, intro, callout } from './views-core.js';

const TABS = [['start', 'Start'], ['gegevens', 'Gegevens'], ['profiel', 'Profiel'], ['ervaring', 'Ervaring'], ['opleiding', 'Opleiding'], ['vaardigheden', 'Vaardigheden'], ['competenties', 'Competenties'], ['portfolio', 'Portfolio'], ['extra', 'Extra'], ['zelftests', 'Zelftests'], ['voorbeelden', 'Voorbeelden'], ['gids', 'Gids'], ['afdrukken', 'Afdrukken']];
const NIVEAUS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
// Vragen uit de vragenlijst per sectie, als de gids ze niet zelf aanlevert.
const VRAGEN = { persoonlijk: ['p01', 'p02', 'p03', 'p16'], profiel: ['w05', 's01', 'i04', 'o01', 'g01'], werkervaring: ['p05', 'p07', 'p12', 'p13', 'p14', 'w03', 'w04'], opleiding: ['p11'], certificaten: ['p09', 'p10'], vaardigheden: ['p08', 'p09', 'p10'], talen: ['p04'], portfolio: ['p15'], interesses: ['i01', 'i02', 'i06'], referenties: ['g03'], competenties: ['s01', 's02', 's03', 'w09'] };
const WERKWOORDEN = ['tekende', 'ontwierp', 'bouwde', 'maakte', 'plooide', 'laste', 'herstelde', 'restaureerde', 'plande', 'organiseerde', 'stuurde', 'coördineerde', 'begeleidde', 'leerde', 'verbeterde', 'verkortte', 'documenteerde', 'digitaliseerde', 'ordende', 'beschreef', 'onderzocht', 'controleerde', 'bereidde', 'realiseerde', 'installeerde', 'monteerde', 'teken', 'ontwerp', 'bouw', 'maak', 'plooi', 'las', 'herstel', 'plan', 'organiseer', 'stuur', 'begeleid', 'verbeter', 'documenteer', 'digitaliseer', 'orden', 'controleer', 'bereid', 'uittekenen', 'tekenen', 'ontwerpen', 'bouwen', 'maken', 'plooien', 'lassen', 'herstellen', 'plannen', 'organiseren', 'aansturen', 'begeleiden', 'verbeteren', 'documenteren', 'digitaliseren', 'ordenen', 'controleren', 'werkvoorbereiding', 'opbouw', 'ontwerp', 'bouw', 'herstel', 'aansturing', 'planning'];

// ---------- Gegevens ----------
const lines = v => Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean) : String(v || '').split('\n').map(x => x.trim()).filter(Boolean);
const save = (patch, silent = true) => upsert('cvdoc', { id: CVID, ...patch }, { silent });
const timers = {};
const later = (key, fn, ms = 350) => { clearTimeout(timers[key]); timers[key] = setTimeout(fn, ms); };
const antwoorden = () => Object.fromEntries(all('antwoorden').map(a => [a.id, a.tekst || '']));
const score = id => get('competentiescores', id) || { id };
const test = id => get('zelftests', id) || { id };
const saveTest = (id, patch, silent = true) => upsert('zelftests', { id, ...(get('zelftests', id) || {}), ...patch }, { silent });

// ---------- Bouwstenen ----------
function veld(label, value, onSave, o = {}) {
  const el = h(o.lang ? 'textarea' : 'input', { class: 'field', type: o.lang ? null : (o.type || 'text'), rows: o.rows || null, placeholder: o.ph || '', dataset: o.fk ? { fk: o.fk } : null });
  el.value = value ?? '';
  const key = o.fk || Math.random().toString(36);
  const commit = () => onSave(el.value);
  el.addEventListener('input', () => { later(key, commit); if (o.live) o.live(el.value); });
  el.addEventListener('change', () => { clearTimeout(timers[key]); commit(); });
  return h('label', null, label, o.hint && h('span', { class: 'hint' }, o.hint), el, o.na);
}
const rij = (...c) => h('div', { class: 'form__row' }, ...c);
const kaart = (titel, ...c) => h('section', { class: 'card card--pad' }, titel && h('p', { class: 'eyebrow' }, titel), ...c);
const lijst = (items) => items && items.length ? h('ul', { class: 'bullets small' }, items.map(x => h('li', null, x))) : null;
const iconbtn = (name, label, onClick) => h('button', { class: 'iconbtn', type: 'button', title: label, 'aria-label': label, onClick }, icon(name, 14));
const kopieerKnop = (tekst, label = 'Kopieer') => h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: () => copyText(tekst) }, icon('copy', 12), label);
const woorden = t => (String(t || '').match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || []).length;
const zinnen = t => (String(t || '').match(/[^.?]+[.?]/g) || []).filter(z => z.trim().length > 2).length || (String(t || '').trim() ? 1 : 0);
const placeholders = t => (String(t || '').match(/\[[^\]]*\]/g) || []);
const verplaats = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return arr; const c = arr.slice(); [c[i], c[j]] = [c[j], c[i]]; return c; };

function gidsSectie(id) {
  const g = ref.cvGids; const s = g?.secties?.find(x => x.id === id);
  if (!s) return null;
  return kaart('Zo pak je het aan', h('p', { class: 'small' }, s.doel),
    s.inhoud?.length && h('details', null, h('summary', null, 'Wat erin hoort'), lijst(s.inhoud)),
    s.doen?.length && h('details', { open: true }, h('summary', null, 'Doen'), lijst(s.doen)),
    s.vermijden?.length && h('details', null, h('summary', null, 'Vermijden'), lijst(s.vermijden)),
    (s.voorbeeldGoed || s.voorbeeldZwak) && h('details', null, h('summary', null, 'Voorbeeld: sterk en zwak'),
      s.voorbeeldGoed && h('p', { class: 'example' }, h('strong', null, 'Sterk. '), s.voorbeeldGoed),
      s.voorbeeldZwak && h('p', { class: 'example example--zwak', style: 'margin-top:8px' }, h('strong', null, 'Zwak. '), s.voorbeeldZwak)));
}
function vragenPaneel(id) {
  const V = ref.vragenlijst; if (!V) return null;
  const ids = ref.cvGids?.secties?.find(x => x.id === id)?.vragenlijstIds?.length ? ref.cvGids.secties.find(x => x.id === id).vragenlijstIds : (VRAGEN[id] || []);
  const qs = V.secties.flatMap(s => s.vragen).filter(q => ids.includes(q.id));
  if (!qs.length) return null;
  const a = antwoorden();
  return kaart('Uit je vragenlijst', h('ul', { class: 'list list--tight' }, qs.map(q => h('li', null, h('div', null,
    h('p', { class: 'pill-q' }, q.vraag),
    a[q.id] ? h('p', { class: 'small', style: 'white-space:pre-wrap' }, a[q.id]) : h('p', { class: 'small muted' }, 'Nog niet beantwoord. ', h('a', { href: '#/vragenlijst' }, 'Naar de vragenlijst')))))));
}
const zij = (...c) => h('aside', { class: 'cv-side' }, ...c.filter(Boolean));
const layout = (main, side) => h('div', { class: 'cv-layout' }, h('div', { class: 'cv-main' }, ...[].concat(main).filter(Boolean)), side);

// ---------- Controle ----------
function cvTekst(cv) {
  const p = cv.persoonlijk; const out = [];
  out.push(p.naam, cv.titel, [p.adres, p.gsm, p.email].filter(Boolean).join(' | '));
  if (cv.profiel) out.push('', 'PROFIEL', cv.profiel);
  if (cv.werkervaring.length) { out.push('', 'WERKERVARING'); cv.werkervaring.forEach(w => { out.push(`${w.periode}  ${w.functie}, ${w.werkgever}${w.plaats ? ', ' + w.plaats : ''}`); [...w.realisaties, ...w.taken].forEach(t => out.push('- ' + t)); if (w.tools) out.push('  ' + w.tools); }); }
  if (cv.opleiding.length) { out.push('', 'OPLEIDING'); cv.opleiding.forEach(o => out.push(`${o.periode}  ${o.titel}, ${o.instelling}${o.toelichting ? '. ' + o.toelichting : ''}`)); }
  if (cv.certificaten.length) { out.push('', 'CERTIFICATEN'); cv.certificaten.forEach(c => out.push('- ' + c)); }
  if (cv.vaardigheden.length) { out.push('', 'VAARDIGHEDEN'); cv.vaardigheden.forEach(c => out.push('- ' + c)); }
  if (cv.instellingen.competenties && cv.competenties.length) { out.push('', 'COMPETENTIES'); cv.competenties.forEach(c => out.push('- ' + c.tekst)); }
  if (cv.talen.length) { out.push('', 'TALEN'); cv.talen.forEach(t => out.push(`- ${t.taal}: ${t.niveau}`)); }
  if (cv.instellingen.portfolio && (p.portfolio || cv.portfolio.length)) { out.push('', 'PORTFOLIO'); if (p.portfolio) out.push(p.portfolio); cv.portfolio.forEach(x => out.push(`- ${x.titel} (${[x.jaar, x.materiaal, x.techniek].filter(Boolean).join(', ')})${x.link ? ' ' + x.link : ''}`)); }
  if (cv.extra.length) { out.push('', 'EXTRA'); cv.extra.forEach(c => out.push('- ' + c)); }
  if (cv.interesses) out.push('', 'INTERESSES', cv.interesses);
  out.push('', 'REFERENTIES', cv.instellingen.referenties && cv.referenties.length ? cv.referenties.map(r => `${r.naam}, ${r.relatie}, ${r.contact}`).join('\n') : 'Op aanvraag');
  return out.filter(x => x !== undefined && x !== null).join('\n');
}
const REGELS = {
  'contact': 'Naam, adres, gsm en e-mail staan er volledig en juist.',
  'profiel-lengte': 'Het profiel telt drie tot vijf zinnen.',
  'placeholders': 'Er staan geen stukken tussen vierkante haken meer.',
  'chronologie': 'Werkervaring staat van recent naar oud.',
  'realisaties': 'Elke job heeft minstens een realisatie, niet alleen taken.',
  'cijfers': 'Minstens twee regels bevatten een getal (aantal, tijd, afmeting).',
  'actiewerkwoorden': 'De meeste regels beginnen met een werkwoord of een concrete handeling.',
  'lengte': 'Het cv past op één tot twee pagina’s.',
  'talen-niveau': 'Elke taal heeft een niveau.',
  'portfolio': 'Er is een link naar een portfolio of er staan minstens drie projecten in.',
  'verboden-woorden': 'Niets over gezondheid, vakbond of vermoeidheid, en geen uitroeptekens.',
  'spelling-naam': 'De naam is overal Remi.',
  'bestandsnaam': 'De pdf heet Voornaam_Achternaam_CV.pdf.',
  'op-maat': 'Per sollicitatie bestaat een aangepaste versie.',
};
export function controle(cv = getCv()) {
  const g = Object.fromEntries((ref.cvGids?.checklist || []).map(c => [c.id, c]));
  const p = cv.persoonlijk; const tekst = cvTekst(cv); const res = [];
  const zet = (id, status, detail) => res.push({ id, regel: g[id]?.regel || REGELS[id], waarom: g[id]?.waarom || '', status, detail });
  const ok = v => v && !placeholders(v).length;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '');
  zet('contact', ok(p.naam) && ok(p.adres) && ok(p.gsm) && email ? 'ok' : 'let', ok(p.naam) && email ? '' : 'Vul naam, adres, gsm en een geldig e-mailadres in bij Gegevens.');
  const zn = zinnen(cv.profiel);
  zet('profiel-lengte', zn >= 3 && zn <= 5 ? 'ok' : 'let', `${zn} zinnen, ${woorden(cv.profiel)} woorden.`);
  const ph = placeholders(tekst);
  zet('placeholders', ph.length ? 'let' : 'ok', ph.length ? `${ph.length} open plekken, bijvoorbeeld ${ph.slice(0, 3).join(', ')}` : '');
  const jaren = cv.werkervaring.map(w => { const m = String(w.periode).match(/(19|20)\d{2}/g); return m ? Math.max(...m.map(Number)) + (/heden/i.test(w.periode) ? 1 : 0) : null; }).filter(x => x !== null);
  zet('chronologie', jaren.every((y, i) => i === 0 || y <= jaren[i - 1]) ? 'ok' : 'let', jaren.length ? '' : 'Geen jaartallen gevonden.');
  const zonder = cv.werkervaring.filter(w => !w.realisaties.length).map(w => w.functie || 'een job');
  zet('realisaties', zonder.length ? 'let' : 'ok', zonder.length ? `Nog zonder realisatie: ${zonder.join(', ')}.` : '');
  const regels = cv.werkervaring.flatMap(w => [...w.realisaties, ...w.taken]).filter(t => !placeholders(t).length);
  const metGetal = regels.filter(t => /\d/.test(t)).length;
  zet('cijfers', metGetal >= 2 ? 'ok' : 'let', `${metGetal} regels met een getal.`);
  const lijstWw = new Set([...(ref.cvGids?.actiewerkwoorden || []).flatMap(g => g.woorden.map(w => w.toLowerCase())), ...WERKWOORDEN]);
  const startMetWw = regels.filter(t => lijstWw.has(t.split(/[\s,:]/)[0].toLowerCase())).length;
  zet('actiewerkwoorden', regels.length && startMetWw / regels.length >= 0.4 ? 'ok' : 'let', regels.length ? `${startMetWw} van ${regels.length} regels.` : 'Nog geen regels.');
  const w = woorden(tekst);
  zet('lengte', w <= 700 ? 'ok' : 'let', `Ongeveer ${w} woorden (richtwaarde tot 700 voor twee pagina's).`);
  const zonderNiveau = cv.talen.filter(t => !ok(t.niveau) || !ok(t.taal));
  zet('talen-niveau', cv.talen.length && !zonderNiveau.length ? 'ok' : 'let', zonderNiveau.length ? `Nog te vullen: ${zonderNiveau.map(t => t.taal || 'taal').join(', ')}.` : '');
  const metLink = cv.portfolio.filter(x => ok(x.titel)).length;
  zet('portfolio', ok(p.portfolio) || metLink >= 3 ? 'ok' : 'let', `${metLink} projecten${ok(p.portfolio) ? ', portfoliolink aanwezig' : ', nog geen portfoliolink'}.`);
  const verboden = tekst.match(/burn-?out|\bziek|gezondheid|vakbond|\bACV\b|uitgeput|oververmoeid|!|\p{Extended_Pictographic}/giu) || [];
  zet('verboden-woorden', verboden.length ? 'let' : 'ok', verboden.length ? `Gevonden: ${[...new Set(verboden)].join(', ')}.` : '');
  zet('spelling-naam', /R[ée]my|Rémi/i.test(tekst) ? 'let' : 'ok', '');
  const naam = String(p.naam || '').trim().split(/\s+/);
  zet('bestandsnaam', ok(p.naam) && naam.length > 1 ? 'ok' : 'info', ok(p.naam) && naam.length > 1 ? `${naam[0]}_${naam.slice(1).join('')}_CV.pdf` : 'Vul eerst de volledige naam in.');
  zet('op-maat', ref.gegenereerd.length ? 'ok' : 'info', `${ref.gegenereerd.length} aangepaste versies in documents/generated.`);
  return res;
}
export function cvScore() { try { const c = controle(); return `${c.filter(x => x.status === 'ok').length}/${c.length}`; } catch { return ''; } }
function markering(status) {
  const m = { ok: ['check', 'ok'], let: ['clock', 'let'], info: ['circle', 'info'] }[status] || ['circle', 'info'];
  return h('span', { class: `chk__mark chk__mark--${m[1]}` }, icon(m[0], 13));
}
function voortgang(cv) {
  const a = antwoorden(); const cs = all('competentiescores');
  const ok = v => v && !placeholders(v).length;
  const staat = (klaar, bezig) => klaar ? 'klaar' : bezig ? 'bezig' : 'leeg';
  const p = cv.persoonlijk;
  return [
    ['gegevens', 'Gegevens', staat(ok(p.naam) && ok(p.gsm) && ok(p.email) && ok(p.adres), p.naam || p.email)],
    ['profiel', 'Profiel', staat(ok(cv.profiel) && zinnen(cv.profiel) <= 5 && woorden(cv.profiel) >= 30, cv.profiel)],
    ['ervaring', 'Ervaring', staat(cv.werkervaring.length >= 2 && cv.werkervaring.every(w => ok(w.functie) && ok(w.werkgever) && w.realisaties.length && !w.realisaties.some(r => placeholders(r).length)), cv.werkervaring.length)],
    ['opleiding', 'Opleiding', staat(cv.opleiding.length && cv.opleiding.every(o => ok(o.titel) && ok(o.instelling) && ok(o.periode)), cv.opleiding.length)],
    ['vaardigheden', 'Vaardigheden en talen', staat(cv.vaardigheden.length >= 5 && !cv.vaardigheden.some(v => placeholders(v).length) && cv.talen.every(t => ok(t.niveau)), cv.vaardigheden.length)],
    ['competenties', 'Competenties', staat(cs.filter(c => c.score).length >= 10 && cv.competenties.length >= 3, cs.some(c => c.score))],
    ['portfolio', 'Portfolio', staat(cv.portfolio.length >= 3 || ok(p.portfolio), cv.portfolio.length || p.portfolio)],
    ['extra', 'Extra en referenties', staat(ok(cv.interesses) && (cv.referenties.some(r => r.toestemming) || !cv.instellingen.referenties), cv.interesses || cv.referenties.length)],
    ['zelftests', 'Zelftests', staat((test('werkwaarden').top || []).length >= 5 && (test('kernkwadranten').rijen || []).some(r => r && r.kwaliteit) && Object.keys(test('energie').scores || {}).length >= 10, (test('werkwaarden').top || []).length || Object.keys(test('energie').scores || {}).length)],
    ['vragenlijst', 'Vragenlijst', staat(Object.values(a).filter(v => v.trim()).length >= 40, Object.values(a).some(v => v.trim()))],
  ];
}

// ---------- Tabbladen ----------
function tabStart(cv) {
  const c = controle(cv); const v = voortgang(cv);
  const open = c.filter(x => x.status === 'let');
  return [
    intro('Cv-atelier', 'Hier bouw je je cv, sectie per sectie. Naast elk onderdeel staat hoe je het aanpakt, een sterk en een zwak voorbeeld, en wat je al antwoordde in de vragenlijst. Alles bewaart vanzelf op dit toestel.'),
    h('div', { class: 'two-col' },
      kaart('Waar je staat', h('ul', { class: 'list list--tight' }, v.map(([id, label, st]) => h('li', null, h('span', { class: `state state--${st}` }), h('div', { style: 'flex:1' }, h('a', { href: id === 'vragenlijst' ? '#/vragenlijst' : `#/cv?tab=${id}` }, label)), h('span', { class: 'small muted' }, { klaar: 'klaar', bezig: 'bezig', leeg: 'nog niet begonnen' }[st]))))),
      kaart(`Controle: ${c.filter(x => x.status === 'ok').length} van ${c.length} in orde`, h('ul', { class: 'list list--tight' }, c.map(x => h('li', { class: 'chk' }, markering(x.status), h('div', null, h('p', { class: 'small', style: 'font-weight:500' }, x.regel), x.detail && h('p', { class: 'small muted' }, x.detail)))))),
    ),
    open.length ? callout('orange', 'clock', 'Volgende stappen', h('ol', { class: 'bullets small' }, open.slice(0, 4).map(x => h('li', null, x.regel, x.detail ? ` ${x.detail}` : '')))) : callout('green', 'check', 'Klaar om te versturen', h('p', { class: 'small' }, 'Alle controles zijn in orde. Maak per vacature een aangepaste versie.')),
    kaart('Werkwijze', h('ol', { class: 'bullets small' },
      h('li', null, 'Beantwoord eerst de vragenlijst. Die antwoorden verschijnen naast de juiste sectie.'),
      h('li', null, 'Doe de competentiescan en de zelftests. Ze leveren de voorbeelden voor je cv en je gesprekken.'),
      h('li', null, 'Vul de secties in. Gebruik de voorbeelden als vertrekpunt, niet als tekst om over te nemen.'),
      h('li', null, 'Kijk bij Afdrukken hoe het eruitziet en bewaar als pdf.'),
      h('li', null, 'Stuur je gegevens met "Kopieer voor Claude" naar Giulia of Claude; zo wordt het master-cv bijgewerkt en per vacature aangepast.'))),
  ];
}

function tabGegevens(cv) {
  const p = cv.persoonlijk; const zetP = (k) => v => { p[k] = v; save({ persoonlijk: p }); };
  const inst = cv.instellingen;
  const toggle = (k, label) => h('label', { class: 'inline-check' }, h('input', { type: 'checkbox', checked: !!inst[k], onChange: e => { inst[k] = e.target.checked; save({ instellingen: inst }); } }), label);
  return layout([
    intro('Gegevens', 'Wat een werkgever nodig heeft om je te bereiken. Kort en juist.'),
    kaart('Persoonlijke gegevens', h('div', { class: 'form' },
      veld('Volledige naam', p.naam, zetP('naam'), { fk: 'cv-naam' }),
      veld('Titel onder je naam', cv.titel, v => save({ titel: v }), { fk: 'cv-titel', hint: 'Eén regel die zegt wie je bent en waar je naartoe wil.' }),
      veld('Adres', p.adres, zetP('adres'), { fk: 'cv-adres' }),
      rij(veld('Gsm', p.gsm, zetP('gsm'), { fk: 'cv-gsm', type: 'tel' }), veld('E-mail', p.email, zetP('email'), { fk: 'cv-email', type: 'email' })),
      rij(veld('Geboortedatum en -plaats', p.geboortedatum, zetP('geboortedatum'), { fk: 'cv-geb', hint: 'In Vlaanderen gebruikelijk, niet verplicht.' }), veld('Nationaliteit', p.nationaliteit, zetP('nationaliteit'), { fk: 'cv-nat' })),
      rij(veld('Rijbewijs', p.rijbewijs, zetP('rijbewijs'), { fk: 'cv-rij', ph: 'Rijbewijs B' }), veld('LinkedIn (optioneel)', p.linkedin, zetP('linkedin'), { fk: 'cv-li', type: 'url' })),
    )),
    kaart('Wat er op het cv komt', h('div', { class: 'form' },
      toggle('geboortedatum', 'Geboortedatum tonen'), toggle('competenties', 'Competenties tonen (uit de scan)'), toggle('portfolio', 'Portfolio tonen'), toggle('referenties', 'Referenties met naam tonen (anders: op aanvraag)'))),
  ], zij(gidsSectie('persoonlijk'), vragenPaneel('persoonlijk')));
}

function tabProfiel(cv) {
  const teller = h('p', { class: 'counter' });
  const tel = v => { const z = zinnen(v), w = woorden(v); teller.textContent = `${z} zinnen, ${w} woorden. Richtwaarde: 3 tot 5 zinnen, 40 tot 90 woorden.`; teller.className = 'counter' + (z > 5 || w > 90 || z < 3 ? ' counter--let' : ''); };
  tel(cv.profiel);
  const V = ref.voorbeelden;
  return layout([
    intro('Profiel', 'Drie tot vijf zinnen bovenaan je cv: wie je bent, wat je kan, wat je zoekt. Het eerste wat een werkgever leest.'),
    kaart('Je profiel', h('div', { class: 'form' },
      veld('Profieltekst', cv.profiel, v => save({ profiel: v }), { lang: true, rows: 7, fk: 'cv-profiel', live: tel, na: teller }),
      h('p', { class: 'small muted' }, 'Tip: schrijf één versie per richting (erfgoed, museumatelier, lesgeven). Het master-profiel is de algemene versie; per vacature past Claude het aan.'))),
    V?.profielen?.length && kaart('Voorbeelden om van te vertrekken', h('ul', { class: 'list' }, V.profielen.map(x => h('li', null, h('div', { style: 'flex:1' },
      h('p', { class: 'row-title' }, x.doel), h('p', { class: 'small muted' }, x.stijl), h('p', { class: 'example', style: 'margin-top:6px' }, x.tekst), x.waarom && h('p', { class: 'small muted', style: 'margin-top:6px' }, x.waarom),
      h('div', { class: 'toolbar', style: 'margin-top:8px' }, kopieerKnop(x.tekst), h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: () => { if (!cv.profiel || confirm('Je huidige profieltekst vervangen door dit voorbeeld?')) save({ profiel: x.tekst }, false); } }, 'Gebruik als start'))))))),
  ], zij(gidsSectie('profiel'), vragenPaneel('profiel'), V?.zinnen?.length && kaart('Sterke zinnen en clichés', ...V.zinnen.slice(0, 4).map(z => h('details', null, h('summary', null, z.thema), lijst(z.sterk), h('p', { class: 'small muted', style: 'margin-top:6px' }, 'Liever niet: ', z.cliche.join('; ')))), h('p', { class: 'small' }, h('a', { href: '#/cv?tab=voorbeelden' }, 'Alle voorbeelden')))));
}

function tabErvaring(cv) {
  const L = cv.werkervaring;
  const bewaar = (silent = true) => save({ werkervaring: L }, silent);
  const nieuw = () => { L.unshift({ id: 'w' + Date.now().toString(36), periode: '', functie: '', werkgever: '', plaats: '', taken: [], realisaties: [], tools: '' }); bewaar(false); };
  const V = ref.voorbeelden;
  return layout([
    intro('Werkervaring', 'Van recent naar oud. Per job eerst wat je bereikte, dan wat je deed. Eén regel per punt, liefst met een getal.'),
    h('div', { class: 'toolbar' }, h('button', { class: 'btn btn--primary', type: 'button', onClick: nieuw }, icon('plus', 14), 'Job toevoegen')),
    ...L.map((w, i) => kaart(null,
      h('div', { class: 'item-head' }, h('p', { class: 'row-title' }, [w.functie, w.werkgever].filter(Boolean).join(', ') || 'Nieuwe job'),
        iconbtn('up', 'Omhoog', () => { save({ werkervaring: verplaats(L, i, -1) }, false); }), iconbtn('down', 'Omlaag', () => { save({ werkervaring: verplaats(L, i, 1) }, false); }),
        iconbtn('close', 'Verwijderen', () => { if (confirm('Deze job verwijderen?')) { L.splice(i, 1); bewaar(false); } })),
      h('div', { class: 'form' },
        rij(veld('Periode', w.periode, v => { w.periode = v; bewaar(); }, { fk: `w-${w.id}-per`, ph: '2021 tot heden' }), veld('Functie', w.functie, v => { w.functie = v; bewaar(); }, { fk: `w-${w.id}-fun` })),
        rij(veld('Werkgever', w.werkgever, v => { w.werkgever = v; bewaar(); }, { fk: `w-${w.id}-wg` }), veld('Plaats', w.plaats, v => { w.plaats = v; bewaar(); }, { fk: `w-${w.id}-pl` })),
        veld('Realisaties, één per regel', w.realisaties.join('\n'), v => { w.realisaties = lines(v); bewaar(); }, { lang: true, rows: 4, fk: `w-${w.id}-real`, hint: 'Wat is er dankzij jou beter, sneller, mooier of veiliger geworden? Bijvoorbeeld: Tekende [aantal] maatwerkstukken per week uit voor productie.' }),
        veld('Taken, één per regel', w.taken.join('\n'), v => { w.taken = lines(v); bewaar(); }, { lang: true, rows: 5, fk: `w-${w.id}-tak` }),
        veld('Materialen, machines en software', w.tools, v => { w.tools = v; bewaar(); }, { fk: `w-${w.id}-tools`, ph: 'Bijvoorbeeld: kantbank, halfautomaat, [CAD-programma], staal, aluminium' })))),
  ], zij(gidsSectie('werkervaring'),
    ref.cvGids?.actiewerkwoorden?.length && kaart('Actiewerkwoorden', h('p', { class: 'small muted' }, 'Tik om te kopiëren.'), ...ref.cvGids.actiewerkwoorden.map(g => h('details', null, h('summary', null, g.groep), h('div', { class: 'chips' }, g.woorden.map(wd => h('button', { class: 'chip', type: 'button', onClick: () => copyText(wd) }, wd)))))),
    V?.starr?.length && kaart('STARR-verhalen als bron', h('p', { class: 'small muted' }, 'Een goed verhaal levert een realisatie voor je cv en een antwoord voor het gesprek.'), ...V.starr.map(s => h('details', null, h('summary', null, s.titel), h('p', { class: 'small' }, h('strong', null, 'Situatie. '), s.situatie), h('p', { class: 'small' }, h('strong', null, 'Taak. '), s.taak), h('p', { class: 'small' }, h('strong', null, 'Actie. '), s.actie), h('p', { class: 'small' }, h('strong', null, 'Resultaat. '), s.resultaat), h('p', { class: 'small' }, h('strong', null, 'Reflectie. '), s.reflectie)))),
    vragenPaneel('werkervaring')));
}

function tabOpleiding(cv) {
  const L = cv.opleiding; const bewaar = (silent = true) => save({ opleiding: L }, silent);
  return layout([
    intro('Opleiding en certificaten', 'Van recent naar oud. Avondonderwijs en korte opleidingen tellen mee: ze tonen dat je blijft leren.'),
    h('div', { class: 'toolbar' }, h('button', { class: 'btn btn--primary', type: 'button', onClick: () => { L.unshift({ id: 'o' + Date.now().toString(36), periode: '', titel: '', instelling: '', toelichting: '' }); bewaar(false); } }, icon('plus', 14), 'Opleiding toevoegen')),
    ...L.map((o, i) => kaart(null,
      h('div', { class: 'item-head' }, h('p', { class: 'row-title' }, o.titel || 'Nieuwe opleiding'), iconbtn('up', 'Omhoog', () => save({ opleiding: verplaats(L, i, -1) }, false)), iconbtn('down', 'Omlaag', () => save({ opleiding: verplaats(L, i, 1) }, false)), iconbtn('close', 'Verwijderen', () => { if (confirm('Deze opleiding verwijderen?')) { L.splice(i, 1); bewaar(false); } })),
      h('div', { class: 'form' },
        rij(veld('Periode', o.periode, v => { o.periode = v; bewaar(); }, { fk: `o-${o.id}-per` }), veld('Opleiding', o.titel, v => { o.titel = v; bewaar(); }, { fk: `o-${o.id}-tit` })),
        veld('School of instelling', o.instelling, v => { o.instelling = v; bewaar(); }, { fk: `o-${o.id}-ins` }),
        veld('Toelichting (optioneel)', o.toelichting, v => { o.toelichting = v; bewaar(); }, { fk: `o-${o.id}-toe`, ph: 'Bijvoorbeeld: getuigschrift behaald, eindwerk over ...' })))),
    kaart('Certificaten en attesten', h('div', { class: 'form' }, veld('Eén per regel, met norm en geldigheid', cv.certificaten.join('\n'), v => save({ certificaten: lines(v) }), { lang: true, rows: 5, fk: 'cv-cert', hint: 'Bijvoorbeeld: Lascertificaat EN ISO 9606-1, proces 135, geldig tot [datum]. VCA-basis, geldig tot [datum].' }))),
  ], zij(gidsSectie('opleiding'), gidsSectie('certificaten'), vragenPaneel('opleiding')));
}

function tabVaardigheden(cv) {
  const T = cv.talen; const bewaarT = (silent = true) => save({ talen: T }, silent);
  const Z = ref.zelftests?.talen;
  const niveauSel = (t) => h('select', { class: 'field', onChange: e => { t.niveau = e.target.value; bewaarT(); } }, ['', 'moedertaal', ...NIVEAUS.map(n => n)].map(n => h('option', { value: n, selected: t.niveau === n }, n ? (Z?.niveaus?.find(x => x.code === n) ? `${n}, ${Z.niveaus.find(x => x.code === n).label}` : n) : 'Kies een niveau')));
  return layout([
    intro('Vaardigheden en talen', 'Technische vaardigheden die er voor de job toe doen, de belangrijkste eerst. Talen met een niveau volgens het Europees Referentiekader.'),
    kaart('Technische vaardigheden', h('div', { class: 'form' }, veld('Eén per regel, zes tot tien', cv.vaardigheden.join('\n'), v => save({ vaardigheden: lines(v) }), { lang: true, rows: 8, fk: 'cv-vaard', hint: 'Concreet: programma, machine, materiaal, techniek. Karaktereigenschappen horen bij Competenties.' }))),
    kaart('Talen',
      h('div', { class: 'toolbar' }, h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: () => { T.push({ id: 't' + Date.now().toString(36), taal: '', niveau: '' }); bewaarT(false); } }, icon('plus', 12), 'Taal toevoegen')),
      ...T.map((t, i) => h('div', { class: 'form__row', style: 'align-items:end' }, veld('Taal', t.taal, v => { t.taal = v; bewaarT(); }, { fk: `t-${t.id}` }), h('div', { class: 'toolbar', style: 'flex-wrap:nowrap' }, h('label', { style: 'flex:1' }, 'Niveau', niveauSel(t)), iconbtn('close', 'Verwijderen', () => { T.splice(i, 1); bewaarT(false); }))))),
    Z && kaart('Welk niveau heb je?', h('p', { class: 'small' }, Z.inleiding), ...Z.vaardigheden.map(v => h('details', null, h('summary', null, v.naam), h('table', { class: 'table' }, h('tbody', null, NIVEAUS.map(n => h('tr', null, h('th', null, n), h('td', null, v.beschrijvingen[n])))))))),
  ], zij(gidsSectie('vaardigheden'), gidsSectie('talen'), vragenPaneel('vaardigheden')));
}

function tabCompetenties(cv) {
  const C = ref.competenties;
  if (!C) return [intro('Competenties', 'De competentiescan wordt nog aangevuld. Kom straks terug.')];
  const alle = C.groepen.flatMap(g => g.competenties);
  const samenvatting = h('div');
  const vatSamen = () => {
    const sc = alle.map(c => ({ c, s: score(c.id) })).filter(x => x.s.score);
    const top = sc.filter(x => x.s.score >= 4).sort((a, b) => b.s.score - a.s.score).slice(0, 6);
    const opCv = getCv().competenties;
    samenvatting.replaceChildren(h('p', { class: 'small' }, `${sc.length} van ${alle.length} gescoord. ${opCv.length} op je cv.`),
      top.length ? h('div', { class: 'chips', style: 'margin-top:8px' }, top.map(x => h('span', { class: 'badge badge--green' }, `${x.c.naam} ${x.s.score}`))) : h('p', { class: 'small muted' }, 'Nog geen competentie met score 4 of 5.'));
  };
  vatSamen();
  const syncCv = () => { const lijstOpCv = alle.filter(c => score(c.id).opCv).map(c => ({ id: c.id, tekst: score(c.id).cvZin || c.cvZin })); save({ competenties: lijstOpCv }); vatSamen(); };
  const bewaarScore = (id, patch) => { upsert('competentiescores', { ...score(id), id, ...patch }, { silent: true }); };
  const schaal = C.schaal || [1, 2, 3, 4, 5].map(w => ({ waarde: w, label: String(w) }));
  const blok = (c) => {
    const s = score(c.id);
    const scoreLabel = h('span', { class: 'comp__score' }, s.score ? `${s.score} van 5${s.opCv ? ', op cv' : ''}` : 'nog niet gescoord');
    const chips = h('div', { class: 'chips' });
    const tekenChips = () => chips.replaceChildren(...schaal.map(x => h('button', { class: 'chip' + (score(c.id).score === x.waarde ? ' chip--active' : ''), type: 'button', title: x.uitleg || '', onClick: () => { bewaarScore(c.id, { score: x.waarde }); tekenChips(); const n = score(c.id); scoreLabel.textContent = `${n.score} van 5${n.opCv ? ', op cv' : ''}`; vatSamen(); } }, `${x.waarde} ${x.label}`)));
    tekenChips();
    const herken = new Set(s.herken || []);
    const starr = { situatie: '', taak: '', actie: '', resultaat: '', reflectie: '', ...(s.starr || {}) };
    return h('details', { class: 'comp' },
      h('summary', null, c.naam, scoreLabel),
      h('div', { class: 'comp__body' },
        h('p', { class: 'small' }, c.definitie),
        h('div', null, h('p', { class: 'eyebrow' }, 'Herken je dit gedrag bij jezelf'), ...c.indicatoren.map((ind, i) => h('label', { class: 'inline-check small', style: 'margin-top:6px' }, h('input', { type: 'checkbox', checked: herken.has(i), onChange: e => { e.target.checked ? herken.add(i) : herken.delete(i); bewaarScore(c.id, { herken: [...herken] }); } }), ind))),
        h('div', null, h('p', { class: 'eyebrow' }, 'Jouw score'), chips),
        c.niveaus && h('details', null, h('summary', null, 'Wat de niveaus betekenen'), h('p', { class: 'small' }, h('strong', null, 'Basis. '), c.niveaus.basis), h('p', { class: 'small' }, h('strong', null, 'Gevorderd. '), c.niveaus.gevorderd), h('p', { class: 'small' }, h('strong', null, 'Expert. '), c.niveaus.expert)),
        h('div', { class: 'form' }, h('p', { class: 'small', style: 'font-weight:500' }, c.vraag),
          ...['situatie', 'taak', 'actie', 'resultaat', 'reflectie'].map(k => veld(k[0].toUpperCase() + k.slice(1), starr[k], v => { starr[k] = v; bewaarScore(c.id, { starr }); }, { lang: true, rows: 2, fk: `c-${c.id}-${k}` }))),
        c.voorbeeld && h('details', null, h('summary', null, 'Voorbeeld van een STARR-verhaal'), ...['situatie', 'taak', 'actie', 'resultaat', 'reflectie'].map(k => h('p', { class: 'small' }, h('strong', null, k[0].toUpperCase() + k.slice(1) + '. '), c.voorbeeld[k]))),
        h('div', { class: 'form' },
          veld('Zin voor je cv', s.cvZin || c.cvZin, v => { bewaarScore(c.id, { cvZin: v }); if (score(c.id).opCv) syncCv(); }, { fk: `c-${c.id}-zin` }),
          h('label', { class: 'inline-check' }, h('input', { type: 'checkbox', checked: !!s.opCv, onChange: e => { bewaarScore(c.id, { opCv: e.target.checked }); const n = score(c.id); scoreLabel.textContent = n.score ? `${n.score} van 5${n.opCv ? ', op cv' : ''}` : (n.opCv ? 'op cv' : 'nog niet gescoord'); syncCv(); } }), 'Op mijn cv zetten')),
        c.gesprekVraag && h('p', { class: 'small muted' }, 'In een gesprek kan je dit horen: ', h('em', null, c.gesprekVraag))));
  };
  return layout([
    intro('Competentiescan', C.inleiding),
    kaart('Samenvatting', samenvatting),
    ...C.groepen.map(g => kaart(g.titel, h('p', { class: 'small muted' }, g.uitleg), ...g.competenties.map(blok))),
    h('p', { class: 'small muted' }, C.bron),
  ], zij(kaart('Schaal', h('ul', { class: 'list list--tight' }, schaal.map(x => h('li', null, h('span', { class: 'badge' }, String(x.waarde)), h('div', null, h('p', { class: 'small', style: 'font-weight:500' }, x.label), x.uitleg && h('p', { class: 'small muted' }, x.uitleg)))))), gidsSectie('competenties'), vragenPaneel('competenties')));
}

function tabPortfolio(cv) {
  const L = cv.portfolio; const bewaar = (silent = true) => save({ portfolio: L }, silent);
  const p = cv.persoonlijk;
  return layout([
    intro('Portfolio en links', 'Zes tot tien werkstukken: meubels, maatwerk in metaal, tekeningen, het fotoarchief. Een beeld zegt meer dan een regel op je cv.'),
    kaart('Links', h('div', { class: 'form' }, veld('Link naar je portfolio (pdf of pagina)', p.portfolio, v => { p.portfolio = v; save({ persoonlijk: p }); }, { fk: 'cv-portfolio', type: 'url', hint: 'Een gedeelde map of een pdf van 8 tot 15 pagina’s, kleiner dan 10 MB.' }))),
    h('div', { class: 'toolbar' }, h('button', { class: 'btn btn--primary', type: 'button', onClick: () => { L.push({ id: 'p' + Date.now().toString(36), titel: '', jaar: '', materiaal: '', techniek: '', rol: '', link: '' }); bewaar(false); } }, icon('plus', 14), 'Werkstuk toevoegen')),
    ...L.map((x, i) => kaart(null,
      h('div', { class: 'item-head' }, h('p', { class: 'row-title' }, x.titel || 'Nieuw werkstuk'), iconbtn('up', 'Omhoog', () => save({ portfolio: verplaats(L, i, -1) }, false)), iconbtn('close', 'Verwijderen', () => { if (confirm('Dit werkstuk verwijderen?')) { L.splice(i, 1); bewaar(false); } })),
      h('div', { class: 'form' },
        rij(veld('Titel', x.titel, v => { x.titel = v; bewaar(); }, { fk: `p-${x.id}-t` }), veld('Jaar', x.jaar, v => { x.jaar = v; bewaar(); }, { fk: `p-${x.id}-j` })),
        rij(veld('Materiaal', x.materiaal, v => { x.materiaal = v; bewaar(); }, { fk: `p-${x.id}-m` }), veld('Techniek', x.techniek, v => { x.techniek = v; bewaar(); }, { fk: `p-${x.id}-te` })),
        veld('Jouw rol en wat moeilijk was', x.rol, v => { x.rol = v; bewaar(); }, { lang: true, rows: 2, fk: `p-${x.id}-r` }),
        veld('Link naar foto of pagina', x.link, v => { x.link = v; bewaar(); }, { fk: `p-${x.id}-l`, type: 'url' })))),
  ], zij(gidsSectie('portfolio'), vragenPaneel('portfolio')));
}

function tabExtra(cv) {
  const R = cv.referenties; const bewaarR = (silent = true) => save({ referenties: R }, silent);
  return layout([
    intro('Extra, interesses en referenties', 'Wat je naast je werk doet, zegt veel over hoe je werkt. Referenties vraag je altijd eerst.'),
    kaart('Interesses', h('div', { class: 'form' }, veld('Kort en concreet', cv.interesses, v => save({ interesses: v }), { lang: true, rows: 3, fk: 'cv-int', hint: 'Niet "lezen en muziek", wel "restauratie van oude fietsen, architectuur van de jaren 30".' }))),
    kaart('Extra', h('div', { class: 'form' }, veld('Vrijwilligerswerk, projecten, lidmaatschappen, één per regel', cv.extra.join('\n'), v => save({ extra: lines(v) }), { lang: true, rows: 4, fk: 'cv-extra' }))),
    kaart('Referenties',
      h('div', { class: 'toolbar' }, h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: () => { R.push({ id: 'r' + Date.now().toString(36), naam: '', relatie: '', contact: '', toestemming: false }); bewaarR(false); } }, icon('plus', 12), 'Referentie toevoegen')),
      ...R.map((r, i) => h('div', { class: 'form', style: 'border-top:1px solid var(--hairline);padding-top:12px' },
        rij(veld('Naam', r.naam, v => { r.naam = v; bewaarR(); }, { fk: `r-${r.id}-n` }), veld('Relatie', r.relatie, v => { r.relatie = v; bewaarR(); }, { fk: `r-${r.id}-r`, ph: 'Bijvoorbeeld: ploegbaas, docent, klant' })),
        veld('Contact (gsm of e-mail)', r.contact, v => { r.contact = v; bewaarR(); }, { fk: `r-${r.id}-c` }),
        h('div', { class: 'toolbar' }, h('label', { class: 'inline-check' }, h('input', { type: 'checkbox', checked: !!r.toestemming, onChange: e => { r.toestemming = e.target.checked; bewaarR(); } }), 'Toestemming gevraagd en gekregen'), iconbtn('close', 'Verwijderen', () => { R.splice(i, 1); bewaarR(false); })))),
      h('p', { class: 'small muted' }, 'Standaard staat op je cv: "Referenties op aanvraag". Zet bij Gegevens "Referenties met naam tonen" aan als je ze wil vermelden.')),
  ], zij(gidsSectie('interesses'), gidsSectie('referenties'), vragenPaneel('interesses')));
}

function tabZelftests() {
  const Z = ref.zelftests;
  if (!Z) return [intro('Zelftests', 'De zelftests worden nog aangevuld.')];
  // Werkwaarden
  const ww = test('werkwaarden'); let top = ww.top || [], minst = ww.minst || [];
  const wwTeller = h('p', { class: 'small muted' });
  const telWw = () => { wwTeller.textContent = `Top ${top.length} van ${Z.werkwaarden.kies.top}, minst belangrijk ${minst.length} van ${Z.werkwaarden.kies.minst}.`; };
  telWw();
  const wwChips = h('div', { class: 'chips' });
  const tekenWw = () => wwChips.replaceChildren(...Z.werkwaarden.waarden.map(w => h('button', { class: 'chip' + (top.includes(w.id) ? ' chip--active' : minst.includes(w.id) ? ' chip--minst' : ''), type: 'button', title: w.uitleg, onClick: () => {
    if (top.includes(w.id)) { top = top.filter(x => x !== w.id); if (minst.length < Z.werkwaarden.kies.minst) minst = [...minst, w.id]; }
    else if (minst.includes(w.id)) { minst = minst.filter(x => x !== w.id); }
    else if (top.length < Z.werkwaarden.kies.top) top = [...top, w.id];
    else if (minst.length < Z.werkwaarden.kies.minst) minst = [...minst, w.id];
    else { toast('Je top en je minst belangrijke zijn vol. Tik een gekozen waarde om ze te wisselen.'); return; }
    saveTest('werkwaarden', { top, minst }); tekenWw(); telWw();
  } }, w.naam)));
  tekenWw();
  // Kernkwadranten
  const kk = test('kernkwadranten'); const rijen = Array.from({ length: Z.kernkwadranten.aantalInvullen || 3 }, (_, i) => ({ kwaliteit: '', valkuil: '', uitdaging: '', allergie: '', ...((kk.rijen || [])[i] || {}) }));
  const kkVeld = (i, k) => veld(k[0].toUpperCase() + k.slice(1), rijen[i][k], v => { rijen[i][k] = v; saveTest('kernkwadranten', { rijen }); }, { fk: `kk-${i}-${k}`, hint: Z.kernkwadranten.uitleg?.[k] });
  // Energie
  const en = test('energie'); const scores = { ...(en.scores || {}) };
  const energieRij = a => h('div', { class: 'form__row', style: 'align-items:center' }, h('p', { class: 'small' }, a.naam), h('select', { class: 'field', onChange: e => { if (e.target.value === '') delete scores[a.id]; else scores[a.id] = Number(e.target.value); saveTest('energie', { scores }); } }, h('option', { value: '' }, 'Kies'), ...Z.energie.schaal.map(s => h('option', { value: s.waarde, selected: scores[a.id] === s.waarde }, `${s.waarde > 0 ? '+' : ''}${s.waarde} ${s.label}`))));
  const gevers = Z.energie.activiteiten.filter(a => scores[a.id] >= 1).map(a => a.naam), vreters = Z.energie.activiteiten.filter(a => scores[a.id] <= -1).map(a => a.naam);
  // Feedback
  const fb = test('feedback'); const fbAntw = Array.from({ length: 5 }, (_, i) => ({ naam: '', tekst: '', ...((fb.antwoorden || [])[i] || {}) }));
  // Extern
  const ex = test('extern'); const exRes = { ...(ex.resultaten || {}) };
  return [
    intro('Zelftests', 'Korte oefeningen om te zien wat je drijft, wat je energie geeft en hoe anderen je zien. De uitkomsten helpen bij je profiel, je keuzes en je gesprekken.'),
    kaart('Werkwaarden', h('p', { class: 'small' }, Z.werkwaarden.inleiding), h('p', { class: 'small muted' }, Z.werkwaarden.instructie, ' Eerste tik: top. Tik opnieuw: minst belangrijk. Derde tik: weg.'), wwChips, wwTeller),
    kaart('Kernkwadranten', h('p', { class: 'small' }, Z.kernkwadranten.inleiding),
      h('details', null, h('summary', null, 'Voorbeelden om te toetsen'), ...Z.kernkwadranten.voorbeelden.map(v => h('div', { class: 'card card--pad', style: 'margin-top:8px' }, h('p', { class: 'small' }, h('strong', null, 'Kwaliteit: '), v.kwaliteit, '. ', h('strong', null, 'Valkuil: '), v.valkuil, '. ', h('strong', null, 'Uitdaging: '), v.uitdaging, '. ', h('strong', null, 'Allergie: '), v.allergie, '.'), h('p', { class: 'small muted' }, v.toelichting)))),
      ...rijen.map((_, i) => h('div', { class: 'form', style: 'border-top:1px solid var(--hairline);padding-top:12px' }, h('p', { class: 'eyebrow' }, `Kwadrant ${i + 1}`), rij(kkVeld(i, 'kwaliteit'), kkVeld(i, 'valkuil')), rij(kkVeld(i, 'uitdaging'), kkVeld(i, 'allergie')))),
      h('p', { class: 'small muted' }, Z.kernkwadranten.gesprekTip)),
    kaart('Energiemeter', h('p', { class: 'small' }, Z.energie.inleiding), h('div', { class: 'form' }, ...Z.energie.activiteiten.map(energieRij)),
      (gevers.length || vreters.length) && h('div', null, gevers.length && h('p', { class: 'small' }, h('strong', null, 'Geeft energie: '), gevers.join(', ')), vreters.length && h('p', { class: 'small' }, h('strong', null, 'Kost energie: '), vreters.join(', ')))),
    kaart('Feedback van anderen', h('p', { class: 'small' }, Z.feedback.inleiding),
      h('p', { class: 'example card card--pad' }, Z.feedback.bericht), h('div', { class: 'toolbar' }, kopieerKnop(Z.feedback.bericht + '\n\n' + Z.feedback.vragen.map((q, i) => `${i + 1}. ${q}`).join('\n'), 'Kopieer bericht met vragen')),
      h('ol', { class: 'bullets small' }, Z.feedback.vragen.map(q => h('li', null, q))),
      ...fbAntw.map((a, i) => h('div', { class: 'form', style: 'border-top:1px solid var(--hairline);padding-top:12px' }, veld(`Persoon ${i + 1}`, a.naam, v => { fbAntw[i].naam = v; saveTest('feedback', { antwoorden: fbAntw }); }, { fk: `fb-${i}-n`, ph: 'Naam en relatie' }), veld('Antwoorden', a.tekst, v => { fbAntw[i].tekst = v; saveTest('feedback', { antwoorden: fbAntw }); }, { lang: true, rows: 3, fk: `fb-${i}-t` }))),
      h('p', { class: 'small muted' }, Z.feedback.tip)),
    kaart('Tests elders', h('p', { class: 'small muted' }, 'Tests die je al deed en tests die nog iets kunnen toevoegen. Noteer je uitslag in het vak eronder.'),
      h('ul', { class: 'list' }, Z.externeTests.map(t => h('li', null, h('div', { style: 'flex:1' },
        h('div', { class: 'meta' }, badge(t.status, t.status === 'gedaan' ? 'green' : t.status === 'aanbevolen' ? 'orange' : 'grey'), t.verificatie === 'te verifiëren' && badge('link te verifiëren', 'grey'), h('span', null, [t.duur, t.kost].filter(Boolean).join(', '))),
        h('p', { class: 'row-title', style: 'margin-top:4px' }, t.url ? h('a', { href: t.url, target: '_blank', rel: 'noopener' }, t.naam) : t.naam),
        h('p', { class: 'small' }, t.wat), h('p', { class: 'small muted' }, t.waarom),
        h('div', { class: 'form', style: 'margin-top:8px' }, veld('Jouw uitslag', exRes[t.id], v => { exRes[t.id] = v; saveTest('extern', { resultaten: exRes }); }, { fk: `ex-${t.id}` }))))))),
  ];
}

function tabVoorbeelden() {
  const V = ref.voorbeelden;
  if (!V) return [intro('Voorbeelden', 'De voorbeelden worden nog aangevuld.')];
  const blokTekst = (titel, tekst, extra) => h('div', { class: 'card card--pad' }, titel && h('p', { class: 'row-title' }, titel), h('p', { class: 'example' }, tekst), extra, h('div', { class: 'toolbar' }, kopieerKnop(tekst)));
  return [
    intro('Voorbeelden', V.inleiding),
    kaart('Profielteksten voor jou', h('div', { class: 'grid-cards grid-cards--wide' }, V.profielen.map(x => blokTekst(x.doel, x.tekst, h('p', { class: 'small muted' }, x.waarom))))),
    kaart('Hoe anderen zichzelf beschrijven', h('p', { class: 'small muted' }, 'Fictieve voorbeelden van mensen met een gelijkaardige overstap. Let op wat werkt, niet op de woorden.'), h('div', { class: 'grid-cards grid-cards--wide' }, V.anderen.map(x => blokTekst(x.wie, x.tekst, h('p', { class: 'small muted' }, x.watWerkt))))),
    kaart('Sterke zinnen en clichés', h('div', { class: 'grid-cards' }, V.zinnen.map(z => h('div', { class: 'card card--pad' }, h('p', { class: 'row-title' }, z.thema), lijst(z.sterk), h('p', { class: 'small muted' }, 'Liever niet: ', z.cliche.join('; ')))))),
    kaart('Vertel eens iets over uzelf', h('div', { class: 'grid-cards grid-cards--wide' }, V.pitch.map(x => blokTekst(`${x.duur}, ${x.context}`, x.tekst)))),
    kaart('Sterktes en werkpunten in een gesprek', h('ul', { class: 'list' }, V.sterkteZwakte.map(x => h('li', null, h('div', null, h('p', { class: 'pill-q' }, x.vraag), h('p', { class: 'example' }, x.antwoord), h('p', { class: 'small muted' }, x.waarom), kopieerKnop(x.antwoord)))))),
    kaart('STARR-verhalen', h('div', { class: 'grid-cards grid-cards--wide' }, V.starr.map(s => h('div', { class: 'card card--pad' }, h('p', { class: 'row-title' }, s.titel), ...['situatie', 'taak', 'actie', 'resultaat', 'reflectie'].map(k => h('p', { class: 'small' }, h('strong', null, k[0].toUpperCase() + k.slice(1) + '. '), s[k])))))),
    kaart('Waarom je vertrekt', h('ul', { class: 'list' }, V.vertrekreden.map(x => h('li', null, h('div', null, h('p', { class: 'example' }, x.tekst), h('p', { class: 'small muted' }, x.wanneer), kopieerKnop(x.tekst)))))),
    V.linkedin && kaart('LinkedIn', h('p', { class: 'eyebrow' }, 'Kopregels'), lijst(V.linkedin.headlines), h('p', { class: 'eyebrow', style: 'margin-top:12px' }, 'Info'), h('p', { class: 'example' }, V.linkedin.info), kopieerKnop(V.linkedin.info)),
  ];
}

function tabGids() {
  const G = ref.cvGids;
  if (!G) return [intro('Gids', 'De gids wordt nog aangevuld.')];
  return [
    intro('Gids voor een sterk cv', G.inleiding),
    kaart('Principes', h('ul', { class: 'list' }, G.principes.map(p => h('li', null, h('div', null, h('p', { class: 'row-title' }, p.titel), h('p', { class: 'small' }, p.uitleg)))))),
    kaart('Per sectie', ...G.secties.map(s => h('details', { class: 'comp' }, h('summary', null, s.titel), h('div', { class: 'comp__body' }, h('p', { class: 'small' }, s.doel), h('p', { class: 'eyebrow' }, 'Doen'), lijst(s.doen), h('p', { class: 'eyebrow' }, 'Vermijden'), lijst(s.vermijden), s.voorbeeldGoed && h('p', { class: 'example' }, h('strong', null, 'Sterk. '), s.voorbeeldGoed), s.voorbeeldZwak && h('p', { class: 'example example--zwak' }, h('strong', null, 'Zwak. '), s.voorbeeldZwak))))),
    kaart('Actiewerkwoorden', ...G.actiewerkwoorden.map(g => h('div', { style: 'margin-top:10px' }, h('p', { class: 'small', style: 'font-weight:500' }, g.groep), h('div', { class: 'chips', style: 'margin-top:6px' }, g.woorden.map(w => h('button', { class: 'chip', type: 'button', onClick: () => copyText(w) }, w)))))),
    kaart('Vlaams, niet Nederlands', h('table', { class: 'table' }, h('thead', null, h('tr', null, h('th', null, 'Gebruik'), h('th', null, 'Niet'))), h('tbody', null, G.vlaamsNederlands.map(x => h('tr', null, h('td', null, x.gebruik), h('td', null, x.niet)))))),
    kaart('Online formulieren', lijst(G.formulieren), h('p', { class: 'small muted' }, G.bestandsnaam)),
  ];
}

function tabAfdrukken(cv) {
  const naam = String(cv.persoonlijk.naam || '').trim().split(/\s+/);
  const bestand = naam.length > 1 && !placeholders(cv.persoonlijk.naam).length ? `${naam[0]}_${naam.slice(1).join('')}_CV.pdf` : 'Remi_Achternaam_CV.pdf';
  const voorClaude = () => JSON.stringify({ uitgevoerd: todayIso(), cv, competenties: all('competentiescores'), zelftests: all('zelftests'), antwoorden: all('antwoorden') }, null, 2);
  return [
    intro('Afdrukken en delen', `Zo ziet je cv eruit. Bewaar het als pdf met de naam ${bestand}.`),
    h('div', { class: 'toolbar' },
      h('a', { class: 'btn btn--primary', href: 'cv.html', target: '_blank', rel: 'noopener' }, icon('print', 14), 'Afdrukversie openen'),
      h('button', { class: 'btn btn--ghost', type: 'button', onClick: () => copyText(cvTekst(cv)) }, icon('copy', 14), 'Kopieer als platte tekst'),
      h('button', { class: 'btn btn--ghost', type: 'button', onClick: () => copyText(voorClaude()) }, icon('copy', 14), 'Kopieer voor Claude'),
      h('button', { class: 'btn btn--ghost', type: 'button', onClick: () => download(`cv-gegevens-remi-${todayIso()}.json`, voorClaude()) }, icon('download', 14), 'Download gegevens'),
      h('button', { class: 'btn btn--danger', type: 'button', onClick: () => { if (confirm('Al je lokale wijzigingen aan het cv wissen en terugvallen op het master-cv?')) remove('cvdoc', CVID); } }, 'Terug naar master-cv')),
    h('p', { class: 'small muted' }, 'Platte tekst is handig voor online formulieren die geen pdf lezen. "Kopieer voor Claude" neemt je cv, competentiescan, zelftests en vragenlijst mee, zodat het master-cv en de versies per vacature bijgewerkt kunnen worden.'),
    h('iframe', { class: 'cv-frame', src: 'cv.html?embed=1', title: 'Voorbeeld van het cv' }),
  ];
}

// ---------- View ----------
export function cv(r) {
  const tab = TABS.some(([k]) => k === r.tab) ? r.tab : 'start';
  const doc = getCv();
  const bouw = { start: tabStart, gegevens: tabGegevens, profiel: tabProfiel, ervaring: tabErvaring, opleiding: tabOpleiding, vaardigheden: tabVaardigheden, competenties: tabCompetenties, portfolio: tabPortfolio, extra: tabExtra, zelftests: tabZelftests, voorbeelden: tabVoorbeelden, gids: tabGids, afdrukken: tabAfdrukken }[tab];
  const inhoud = bouw(doc);
  const tabs = TABS.map(([k, l]) => ({ label: l, href: `#/cv?tab=${k}`, active: k === tab }));
  const c = controle(doc);
  const tool = [h('a', { class: 'btn btn--ghost', href: 'cv.html', target: '_blank', rel: 'noopener' }, icon('print', 14), 'Afdrukversie'), h('a', { class: 'btn btn--primary', href: '#/cv?tab=start' }, icon('check', 14), `Controle ${c.filter(x => x.status === 'ok').length}/${c.length}`)];
  return { chrome: { where: 'Je cv, stap voor stap', tabs, tool, view: TABS.find(([k]) => k === tab)[1], viewIcon: 'doc' }, body: content(...[].concat(inhoud)) };
}
