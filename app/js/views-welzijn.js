// View: welzijn. Scorehulp voor gevalideerde vragenlijsten (de vragen zelf staan op de officiële formulieren),
// een kort dagboek en voorbereiding voor de huisarts. Antwoorden blijven in deze browser.
import { h, icon, badge, fmtDate, todayIso, uid, copyText, toast } from './ui.js';
import { all, get, upsert, remove, ref } from './store.js';
import { openPeek, closePeek } from './app.js';
import { content, intro, callout } from './views-core.js';

const titled = (title, ...c) => h('section', { class: 'card card--pad' }, h('p', { class: 'eyebrow' }, title), ...c);
const ext = (href, label) => h('a', { href, target: '_blank', rel: 'noopener' }, label, ' ', icon('external', 12));
const W = () => ref.welzijn || { tests: [], dokter: {}, hulp: [], veiligheid: { lijnen: [] } };

// Score van een ingevulde test: null zolang niet alle vragen beantwoord zijn.
export function testScore(t, antwoorden = []) {
  const a = antwoorden.slice(0, t.aantal);
  const ingevuld = a.filter(x => x !== null && x !== undefined && x !== '').length;
  if (ingevuld < t.aantal) return { ingevuld, klaar: false };
  const som = a.reduce((n, x) => n + Number(x), 0);
  const waarde = t.score === 'gemiddelde' ? som / t.aantal : som;
  const band = t.banden.find(b => waarde <= b.tot) || t.banden[t.banden.length - 1];
  return { ingevuld, klaar: true, som, waarde, band };
}
const toonWaarde = (t, s) => t.score === 'gemiddelde' ? s.waarde.toFixed(2).replace('.', ',') : String(s.waarde);
const alarm = (t, rec) => t.alarmVraag && Number((rec?.antwoorden || [])[t.alarmVraag - 1]) > 0;

function veiligheidKaart(dringend = false) {
  const V = W().veiligheid;
  return h('section', { class: 'card card--pad callout' + (dringend ? ' welzijn-alarm' : '') },
    h('div', { class: 'callout__head' }, h('span', { class: 'icon-chip icon-chip--sm accent-red' }, icon('shield', 14)), h('p', { class: 'row-title' }, dringend ? 'Neem vandaag nog contact op' : V.titel)),
    dringend ? h('p', null, 'Je gaf aan dat je de voorbije twee weken dacht dat je beter dood zou zijn of jezelf iets zou aandoen. Wacht niet tot de afspraak: bel vandaag je huisarts, of de Zelfmoordlijn op 1813. Je hoeft het niet alleen te dragen.') : h('p', null, V.tekst),
    h('ul', { class: 'list list--tight' }, V.lijnen.map(l => h('li', null, h('a', { class: 'welzijn-nummer', href: `tel:${l.nummer}` }, l.nummer), h('div', null, h('p', { class: 'row-title' }, l.naam), h('p', { class: 'small muted' }, l.wat))))));
}

function testKaart(t) {
  const rec = get('welzijn', `test-${t.id}`) || { id: `test-${t.id}`, antwoorden: [] };
  const antw = Array.from({ length: t.aantal }, (_, i) => rec.antwoorden?.[i] ?? null);
  const s = testScore(t, antw);
  const zet = (i, v) => { const n = antw.slice(); n[i] = n[i] === v ? null : v; upsert('welzijn', { id: rec.id, antwoorden: n, datum: todayIso() }); };
  return h('section', { class: 'card card--pad welzijn-test', id: `test-${t.id}` },
    h('div', { class: 'meta' }, h('span', { class: 'eyebrow', style: 'margin:0' }, t.kort), badge(`${t.aantal} vragen, ${t.minuten} min`, 'grey'),
      s.klaar ? badge(`${toonWaarde(t, s)}: ${s.band.label}`, s.band.kleur) : badge(`${s.ingevuld} van ${t.aantal} ingevuld`, 'grey'),
      rec.datum && h('span', null, `ingevuld ${fmtDate(rec.datum)}`)),
    h('p', { class: 'row-title' }, t.naam),
    h('p', { class: 'small' }, t.meet),
    h('p', { class: 'small muted' }, t.waarom),
    h('p', { class: 'small' }, ext(t.formulier, t.formulierLabel), t.handleiding ? [' · ', ext(t.handleiding, 'Handleiding')] : null),
    h('p', { class: 'small welzijn-hint' }, t.hint),
    alarm(t, rec) && veiligheidKaart(true),
    h('div', { class: 'welzijn-grid' }, antw.map((v, i) => h('div', { class: 'welzijn-vraag' + (t.alarmVraag === i + 1 ? ' welzijn-vraag--alarm' : '') },
      h('span', { class: 'welzijn-nr', title: t.alarmVraag === i + 1 ? t.alarmLabel : '' }, `${i + 1}`),
      h('div', { class: 'welzijn-keuze', role: 'group', 'aria-label': `${t.kort}, vraag ${i + 1}` }, t.waarden.map((w, k) => h('button', { type: 'button', class: 'welzijn-optie' + (v === w ? ' is-gekozen' : ''), title: t.labels[k], 'aria-pressed': v === w ? 'true' : 'false', 'data-test': t.id, 'data-vraag': i + 1, 'data-waarde': w, onClick: () => zet(i, w) }, t.score === 'gemiddelde' ? t.labels[k] : String(w))))))),
    t.alarmVraag && h('p', { class: 'small muted' }, `${t.alarmLabel} Elk antwoord boven 0 toont meteen waar je hulp vindt.`),
    t.extraVraag && h('label', { class: 'small', style: 'display:block;margin-top:8px' }, t.extraVraag.label, ' ',
      h('select', { class: 'field', style: 'max-width:280px', onChange: e => upsert('welzijn', { id: rec.id, extra: e.target.value }) }, [h('option', { value: '' }, 'Kies'), ...t.extraVraag.opties.map(o => h('option', { value: o, selected: rec.extra === o }, o))])),
    h('details', { style: 'margin-top:8px' }, h('summary', { class: 'small' }, 'Hoe lees je de score'), h('p', { class: 'small' }, t.bandenTekst), t.opgelet && h('p', { class: 'small muted' }, t.opgelet), h('p', { class: 'small muted' }, t.bron)),
    h('div', { class: 'form__actions' }, (s.ingevuld > 0) && h('button', { class: 'btn btn--quiet btn--sm', onClick: () => { if (confirm(`Alle antwoorden van de ${t.naam} wissen?`)) upsert('welzijn', { id: rec.id, antwoorden: [], datum: '', extra: '' }); } }, 'Opnieuw beginnen')));
}

// Tekst om mee te nemen naar de huisarts.
function samenvatting() {
  const regels = ['Zelftests voor de huisarts', `Opgemaakt op ${fmtDate(todayIso())}`, ''];
  for (const t of W().tests) {
    const rec = get('welzijn', `test-${t.id}`); const s = testScore(t, rec?.antwoorden || []);
    if (!rec || !s.ingevuld) continue;
    regels.push(s.klaar ? `${t.naam}: ${toonWaarde(t, s)} (${s.band.label}), ingevuld op ${fmtDate(rec.datum)}` : `${t.naam}: onvolledig (${s.ingevuld} van ${t.aantal} vragen)`);
    if (s.klaar) regels.push(`  Antwoorden: ${rec.antwoorden.slice(0, t.aantal).join(', ')}`);
    if (rec.extra) regels.push(`  ${t.extraVraag.label.replace(/^Vraag 10: /, 'Vraag 10, ')} ${rec.extra}`);
  }
  const dagen = all('dagboek').sort((a, b) => a.datum.localeCompare(b.datum));
  if (dagen.length) {
    regels.push('', 'Dagboek');
    for (const d of dagen) regels.push(`${fmtDate(d.datum)}: bed ${d.bed || '?'}, op ${d.op || '?'}, energie middag ${d.energieMiddag ?? '?'}/10, avond ${d.energieAvond ?? '?'}/10, stemming ${d.stemming ?? '?'}/10${d.teLaat ? ', te laat' : ''}${d.hoofdpijn ? ', hoofdpijn of duizelig' : ''}${d.notitie ? '. ' + d.notitie : ''}`);
  }
  regels.push('', 'Dit zijn zelftests, geen diagnose.');
  return regels.join('\n');
}

const DAGVELDEN = [['bed', 'Naar bed', 'time'], ['op', 'Opgestaan', 'time'], ['energieMiddag', 'Energie middag (0-10)', 'number'], ['energieAvond', 'Energie avond (0-10)', 'number'], ['stemming', 'Stemming (0-10)', 'number'], ['werkuren', 'Werkuren', 'number']];
function dagForm(init = {}) {
  const d = { id: init.id, datum: init.datum || todayIso(), bed: init.bed || '', op: init.op || '', energieMiddag: init.energieMiddag ?? '', energieAvond: init.energieAvond ?? '', stemming: init.stemming ?? '', werkuren: init.werkuren ?? '', cafeine: init.cafeine || '', laswerk: init.laswerk || '', hoofdpijn: !!init.hoofdpijn, teLaat: !!init.teLaat, notitie: init.notitie || '' };
  openPeek(d.id ? 'Dag bewerken' : 'Dag toevoegen', () => {
    const inp = (k, type = 'text', extra = {}) => h('input', { class: 'field', type, value: d[k], onInput: e => d[k] = e.target.value, ...extra });
    const vink = (k, l) => h('label', { class: 'inline-check' }, h('input', { type: 'checkbox', checked: d[k], onChange: e => d[k] = e.target.checked }), l);
    return h('form', { class: 'form', onSubmit: e => { e.preventDefault(); if (!d.datum) return; upsert('dagboek', { ...d, id: d.id || 'dag-' + uid() }); closePeek(); toast('Bewaard'); } },
      h('label', null, 'Datum', inp('datum', 'date')),
      h('div', { class: 'form__row' }, ...DAGVELDEN.slice(0, 2).map(([k, l, t]) => h('label', null, l, inp(k, t)))),
      h('div', { class: 'form__row' }, ...DAGVELDEN.slice(2, 4).map(([k, l, t]) => h('label', null, l, inp(k, t, { min: 0, max: 10 })))),
      h('div', { class: 'form__row' }, h('label', null, 'Stemming (0-10)', inp('stemming', 'number', { min: 0, max: 10 })), h('label', null, 'Werkuren', inp('werkuren', 'number', { min: 0, max: 16, step: 0.5 }))),
      h('label', null, 'Koffie, energiedrank, alcohol', inp('cafeine')),
      h('label', null, 'Laswerk vandaag (hoelang, afzuiging, masker)', inp('laswerk')),
      vink('hoofdpijn', 'Hoofdpijn of duizelig tijdens of na het werk'),
      vink('teLaat', 'Te laat op het werk'),
      h('label', null, 'Notitie', h('textarea', { class: 'field', value: d.notitie, onInput: e => d.notitie = e.target.value })),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit' }, 'Bewaren'), d.id && h('button', { class: 'btn btn--danger', type: 'button', onClick: () => { remove('dagboek', d.id); closePeek(); } }, 'Verwijderen')));
  });
}

export function welzijn(r) {
  const tab = ['zelftests', 'dagboek', 'dokter', 'hulp'].includes(r.tab) ? r.tab : 'zelftests';
  const tests = W().tests;
  const ingevuld = tests.filter(t => testScore(t, get('welzijn', `test-${t.id}`)?.antwoorden || []).klaar).length;
  const tabs = [['zelftests', `Zelftests ${ingevuld}/${tests.length}`], ['dagboek', 'Dagboek'], ['dokter', 'Voor de dokter'], ['hulp', 'Hulp']].map(([k, l]) => ({ label: l, href: `#/welzijn?tab=${k}`, active: tab === k }));
  const dringend = tests.some(t => alarm(t, get('welzijn', `test-${t.id}`)));
  let inhoud;
  if (tab === 'zelftests') inhoud = h('div', { class: 'stack' },
    dringend && veiligheidKaart(true),
    callout('green', 'leaf', 'Zo werkt het', h('p', null, W().intro), h('p', { class: 'small muted' }, 'Volgorde: eerst de BAT, dan de PHQ-9 en de GAD-7 na elkaar, en eventueel de Epworth. Samen ongeveer een kwartier. Neem de ingevulde formulieren en de samenvatting mee naar de huisarts.')),
    ...tests.map(testKaart),
    h('p', { class: 'small muted' }, W().bronnen));
  else if (tab === 'dagboek') {
    const dagen = all('dagboek').sort((a, b) => b.datum.localeCompare(a.datum));
    inhoud = h('div', { class: 'stack' },
      callout('green', 'calendar', 'Elke dag twee minuten', h('p', null, 'Noteer tot de afspraak elke avond kort hoe je sliep, hoeveel energie je had en hoe je je voelde. Dat helpt de huisarts meer dan een herinnering achteraf. Kijk ook of het weekend anders aanvoelt.')),
      dagen.length ? h('section', { class: 'card card--pad' }, h('ul', { class: 'list' }, dagen.map(d => h('li', null,
        h('span', { class: 'small muted', style: 'width:78px;flex:0 0 auto' }, fmtDate(d.datum)),
        h('div', { style: 'min-width:0' }, h('a', { href: '#', onClick: e => { e.preventDefault(); dagForm(d); } }, `Energie ${d.energieMiddag ?? '?'} en ${d.energieAvond ?? '?'}, stemming ${d.stemming ?? '?'}`), ' ', d.teLaat && badge('te laat', 'orange'), ' ', d.hoofdpijn && badge('hoofdpijn of duizelig', 'red'),
          h('p', { class: 'small muted' }, [d.bed && `bed ${d.bed}`, d.op && `op ${d.op}`, d.werkuren && `${d.werkuren} u gewerkt`, d.cafeine, d.laswerk].filter(Boolean).join(', ')), d.notitie && h('p', { class: 'small' }, d.notitie)))))) : h('div', { class: 'card empty' }, 'Nog geen dagen. Gebruik de knop in de werkbalk.'));
  } else if (tab === 'dokter') {
    const D = W().dokter;
    inhoud = h('div', { class: 'stack' },
      titled('Samenvatting om mee te nemen', h('p', { class: 'small muted' }, 'De scores en het dagboek in één tekst. Kopieer en print, of toon ze op je telefoon.'), h('pre', { class: 'welzijn-samenvatting' }, samenvatting()), h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary btn--sm', onClick: () => copyText(samenvatting()) }, icon('copy', 12), 'Kopieer samenvatting'), h('button', { class: 'btn btn--ghost btn--sm', onClick: () => window.print() }, icon('print', 12), 'Afdrukken'))),
      h('div', { class: 'two-col' },
        titled('Voorbereiden', h('ul', { class: 'bullets small' }, D.voorbereiding.map(x => h('li', null, x)))),
        titled('Vragen voor de huisarts', h('ul', { class: 'bullets small' }, D.vragen.map(x => h('li', null, x))))),
      h('div', { class: 'two-col' },
        titled('Lichamelijke oorzaken uitsluiten', h('ul', { class: 'bullets small' }, D.lichamelijk.map(x => h('li', null, x)))),
        titled('Als de dokter je ziek schrijft', h('ul', { class: 'bullets small' }, D.ziekteverlof.map(x => h('li', null, x))))));
  } else inhoud = h('div', { class: 'stack' },
    veiligheidKaart(false),
    h('div', { class: 'grid-cards' }, W().hulp.map(x => h('section', { class: 'card card--pad' }, h('p', { class: 'row-title' }, x.naam), h('p', { class: 'small' }, x.wat), h('p', { class: 'small muted' }, x.contact), h('p', { class: 'small' }, h('strong', null, 'Kost: '), x.kost)))));
  const body = content(intro('Welzijn', 'Een eerste beeld van burn-out, depressie, angst en slaap, en alles om mee te nemen naar de huisarts.'), inhoud);
  const tool = tab === 'dagboek' ? [h('button', { class: 'btn btn--primary', onClick: () => dagForm() }, icon('plus', 14), h('span', { class: 'btn__label' }, 'Dag toevoegen'))] : null;
  return { chrome: { where: 'Zelftests en huisarts', tabs, tool, viewIcon: 'leaf' }, body };
}
