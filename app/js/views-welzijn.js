// View: welzijn. Gevalideerde vragenlijsten om in de app in te vullen (of, voor de BAT, met het officiële
// formulier ernaast), een kort dagboek en voorbereiding voor de huisarts. Antwoorden blijven in deze browser.
import { h, icon, badge, fmtDate, todayIso, uid, copyText, toast } from './ui.js';
import { all, get, upsert, remove, ref } from './store.js';
import { openPeek, closePeek } from './app.js';
import { content, intro, callout } from './views-core.js';

const titled = (title, ...c) => h('section', { class: 'card card--pad' }, h('p', { class: 'eyebrow' }, title), ...c);
const ext = (href, label) => h('a', { href, target: '_blank', rel: 'noopener' }, label, ' ', icon('external', 12));
const W = () => ref.welzijn || { tests: [], dokter: {}, hulp: [], veiligheid: { lijnen: [] } };

// Twee soorten tests. Met vragen op het scherm (t.vragen): per vraag wordt de gekozen optie bewaard (keuzes,
// als volgnummer), want soms geven twee opties dezelfde waarde. Zonder vragen (alleen het officiële formulier):
// de waarden zelf (antwoorden).
const opScherm = t => Array.isArray(t.vragen) && t.vragen.length > 0;
// Derde soort: de test wordt elders ingevuld (online of op papier) en hier tik je alleen de scores per schaal in.
const metScores = t => t.invoer === 'scores';
const aantalVan = t => (opScherm(t) ? t.vragen.length : t.aantal);
const geldigeScore = (sch, v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)) && Number(v) >= (sch.min ?? 0) && Number(v) <= sch.max;
const optiesVan = (t, i) => { const o = t.vragen[i].opties || 'standaard'; return Array.isArray(o) ? o : t.optieSets[o]; };

function waarden(t, rec) {
  return Array.from({ length: aantalVan(t) }, (_, i) => {
    if (!opScherm(t)) { const v = rec?.antwoorden?.[i]; return v === null || v === undefined || v === '' ? null : Number(v); }
    const k = rec?.keuzes?.[i]; const o = k === null || k === undefined ? null : optiesVan(t, i)[k];
    return o ? o.waarde : null;
  });
}

// Een schaal telt de waarden van haar vragen op (of neemt het gemiddelde). Een groep zoals [8, 9]
// telt alleen de hoogste van die vragen, zoals de MDI voorschrijft.
function schaalScore(sch, w) {
  const delen = sch.items.map(it => (Array.isArray(it) ? (it.some(i => w[i - 1] === null) ? null : Math.max(...it.map(i => w[i - 1]))) : w[it - 1]));
  if (delen.some(x => x === null)) return null;
  const som = delen.reduce((a, b) => a + b, 0);
  const waarde = (sch.score === 'gemiddelde' ? som / delen.length : som) * (sch.factor || 1);
  const band = sch.banden.find(b => waarde <= b.tot) || sch.banden[sch.banden.length - 1];
  return { ...sch, waarde, band };
}

// Score van een test: klaar zodra alle vragen beantwoord zijn. De eerste schaal is de hoofdscore.
export function testScore(t, rec) {
  if (metScores(t)) {
    const w = t.schalen.map(x => (geldigeScore(x, rec?.scores?.[x.id]) ? Number(rec.scores[x.id]) : null));
    const ingevuld = w.filter(x => x !== null).length;
    const klaar = ingevuld === w.length;
    const schalen = !klaar ? [] : t.schalen.map((x, i) => ({ ...x, waarde: w[i], band: x.banden.find(b => w[i] <= b.tot) || x.banden[x.banden.length - 1] }));
    return { ingevuld, aantal: w.length, klaar, schalen, hoofd: schalen[0] || null, waarden: w };
  }
  const w = waarden(t, rec);
  const ingevuld = w.filter(x => x !== null).length;
  const klaar = ingevuld === w.length;
  const schalen = !klaar ? [] : (t.schalen || [{ naam: t.naam, items: w.map((_, i) => i + 1), score: t.score, banden: t.banden }]).map(x => schaalScore(x, w));
  return { ingevuld, aantal: w.length, klaar, schalen, hoofd: schalen[0] || null, waarden: w };
}
const toon = x => {
  const d = x.decimalen ?? (x.score === 'gemiddelde' ? 2 : 0);
  return `${x.waarde.toFixed(d).replace('.', ',')}${x.eenheid || ''}`;
};
const alarmNrs = t => new Set(opScherm(t) ? (t.alarm || []).map(a => a.vraag) : t.alarmVraag ? [t.alarmVraag] : []);
const alarm = (t, rec) => (metScores(t) ? rec?.veilig === 'ja' : opScherm(t)
  ? (t.alarm || []).some(a => (rec?.keuzes?.[a.vraag - 1] ?? -1) >= a.vanaf)
  : !!t.alarmVraag && Number((rec?.antwoorden || [])[t.alarmVraag - 1]) > 0);

function veiligheidKaart(dringend = false) {
  const V = W().veiligheid;
  return h('section', { class: 'card card--pad callout' + (dringend ? ' welzijn-alarm' : ''), role: dringend ? 'alert' : null },
    h('div', { class: 'callout__head' }, h('span', { class: 'icon-chip icon-chip--sm accent-red' }, icon('shield', 14)), h('p', { class: 'row-title' }, dringend ? 'Neem vandaag nog contact op' : V.titel)),
    dringend ? h('p', null, 'Je gaf aan dat je gedachten had over de dood, dat je beter dood zou zijn, of dat het leven niet de moeite waard is. Wacht niet tot de afspraak: bel vandaag je huisarts, of de Zelfmoordlijn op 1813. Je hoeft het niet alleen te dragen.') : h('p', null, V.tekst),
    h('ul', { class: 'list list--tight' }, V.lijnen.map(l => h('li', null, h('a', { class: 'welzijn-nummer', href: `tel:${l.nummer}` }, l.nummer), h('div', null, h('p', { class: 'row-title' }, l.naam), h('p', { class: 'small muted' }, l.wat))))));
}

// Uitslag per schaal, met de uitleg van die schaal. Bij één schaal alleen de uitleg (de score staat al bovenaan).
const laagSignaal = (t, s) => s.klaar && t.laagItem && s.waarden.some(v => v <= t.laagItem.tot);
function uitslag(t, s) {
  return h('div', { class: 'welzijn-uitslag' },
    s.schalen.map(x => h('div', { class: 'welzijn-schaal' },
      h('div', { class: 'meta' }, h('strong', null, x.naam), badge(`${toon(x)}: ${x.band.label}`, x.band.kleur)),
      (x.band.uitleg || x.uitleg) && h('p', { class: 'small muted' }, x.band.uitleg || x.uitleg))),
    laagSignaal(t, s) && h('p', { class: 'small' }, h('strong', null, 'Let op: '), t.laagItem.tekst));
}

// Scores invullen van een test die elders werd afgenomen, plus de veiligheidsvraag.
function scoresInvoer(t, rec) {
  const zet = (patch) => upsert('welzijn', { id: rec.id, datum: todayIso(), ...patch });
  return h('div', { class: 'stack', style: 'gap:10px;margin-top:10px' },
    h('div', { class: 'welzijn-scores' }, t.schalen.map(x => h('label', { class: 'welzijn-scoreveld' },
      h('span', { class: 'small' }, h('strong', null, x.naam), ` (${x.min ?? 0} tot ${x.max})`),
      h('input', { class: 'field', type: 'number', inputmode: 'numeric', min: x.min ?? 0, max: x.max, step: 1, value: rec.scores?.[x.id] ?? '', 'data-score': `${t.id}-${x.id}`, onInput: e => {
        // Stil bewaren tijdens het typen (zonder de pagina te hertekenen), zodat niets verloren gaat.
        const v = e.target.value.trim();
        if (v !== '' && geldigeScore(x, v)) { rec.scores = { ...(rec.scores || {}), [x.id]: Number(v) }; upsert('welzijn', { id: rec.id, datum: todayIso(), scores: rec.scores }, { silent: true }); }
      }, onChange: e => {
        const v = e.target.value.trim();
        if (v !== '' && !geldigeScore(x, v)) { toast(`${x.naam}: kies een getal van ${x.min ?? 0} tot ${x.max}.`); e.target.value = rec.scores?.[x.id] ?? ''; return; }
        zet({ scores: { ...(rec.scores || {}), [x.id]: v === '' ? '' : Number(v) } });
      } })))),
    t.veiligheidsvraag && h('div', { class: 'welzijn-vraagblok welzijn-vraag--alarm welzijn-veilig' },
      h('p', { class: 'welzijn-vraagtekst', id: `${t.id}-veilig` }, h('span', null, t.veiligheidsvraag)),
      h('div', { class: 'welzijn-keuze', role: 'group', 'aria-labelledby': `${t.id}-veilig` }, [['nee', 'Nee, telkens nee'], ['ja', 'Ja']].map(([v, l]) => h('button', { type: 'button', class: 'welzijn-optie welzijn-optie--tekst' + (rec.veilig === v ? ' is-gekozen' : ''), 'aria-pressed': rec.veilig === v ? 'true' : 'false', 'data-veilig': `${t.id}-${v}`, onClick: () => zet({ veilig: rec.veilig === v ? '' : v }) }, l)))));
}

// Vragen op het scherm, met de antwoordopties voluit.
function vragenLijst(t, rec, s) {
  const nrs = alarmNrs(t);
  const zet = (i, k) => {
    const n = Array.from({ length: t.vragen.length }, (_, j) => rec.keuzes?.[j] ?? null);
    n[i] = n[i] === k ? null : k;
    const wordtKlaar = !s.klaar && n.every(x => x !== null);
    upsert('welzijn', { id: rec.id, keuzes: n, datum: todayIso() });
    if (wordtKlaar) setTimeout(() => document.getElementById(`test-${t.id}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
  };
  return h('ol', { class: 'welzijn-vragen' }, t.vragen.map((q, i) => [
    q.kop && h('li', { class: 'welzijn-kop', 'aria-hidden': 'true' }, q.kop),
    h('li', { class: 'welzijn-vraagblok' + (nrs.has(i + 1) ? ' welzijn-vraag--alarm' : '') },
      h('p', { class: 'welzijn-vraagtekst', id: `${t.id}-v${i + 1}` }, h('span', { class: 'welzijn-nr' }, `${i + 1}`), h('span', null, `${t.voorvoegsel ? t.voorvoegsel + ' ' : ''}${q.tekst}`, q.origineel && h('span', { class: 'welzijn-origineel', lang: 'en' }, q.origineel))),
      h('div', { class: 'welzijn-keuze', role: 'group', 'aria-labelledby': `${t.id}-v${i + 1}` }, optiesVan(t, i).map((o, k) => {
        const gekozen = (rec.keuzes?.[i] ?? null) === k;
        return h('button', { type: 'button', class: 'welzijn-optie welzijn-optie--tekst' + (gekozen ? ' is-gekozen' : ''), 'aria-pressed': gekozen ? 'true' : 'false', 'data-test': t.id, 'data-vraag': i + 1, 'data-keuze': k, onClick: () => zet(i, k) }, o.label);
      })))]));
}

// Oudere werkwijze: het officiële formulier invullen en hier per vraag de waarde aantikken.
function waardenRaster(t, rec) {
  const antw = Array.from({ length: t.aantal }, (_, i) => rec.antwoorden?.[i] ?? null);
  const zet = (i, v) => { const n = antw.slice(); n[i] = n[i] === v ? null : v; upsert('welzijn', { id: rec.id, antwoorden: n, datum: todayIso() }); };
  return h('div', { class: 'welzijn-grid' }, antw.map((v, i) => h('div', { class: 'welzijn-vraag' + (t.alarmVraag === i + 1 ? ' welzijn-vraag--alarm' : '') },
    h('span', { class: 'welzijn-nr', title: t.alarmVraag === i + 1 ? t.alarmLabel : '' }, `${i + 1}`),
    h('div', { class: 'welzijn-keuze', role: 'group', 'aria-label': `${t.kort}, vraag ${i + 1}` }, t.waarden.map((w, k) => h('button', { type: 'button', class: 'welzijn-optie' + (v === w ? ' is-gekozen' : ''), title: t.labels[k], 'aria-pressed': v === w ? 'true' : 'false', 'data-test': t.id, 'data-vraag': i + 1, 'data-waarde': w, onClick: () => zet(i, w) }, t.score === 'gemiddelde' ? t.labels[k] : String(w)))))));
}

function testKaart(t) {
  const rec = get('welzijn', `test-${t.id}`) || { id: `test-${t.id}`, antwoorden: [], keuzes: [] };
  const s = testScore(t, rec);
  const scherm = opScherm(t);
  const vragen = metScores(t) ? scoresInvoer(t, rec) : scherm ? vragenLijst(t, rec, s) : waardenRaster(t, rec);
  return h('section', { class: 'card card--pad welzijn-test', id: `test-${t.id}` },
    h('div', { class: 'meta' }, h('span', { class: 'eyebrow', style: 'margin:0' }, t.kort), badge(`${metScores(t) ? t.aantal : s.aantal} vragen, ${t.minuten} min`, 'grey'),
      s.klaar ? badge(`${s.schalen.length > 1 ? s.hoofd.naam.replace(/ \(.*$/, '') + ' ' : ''}${toon(s.hoofd)}: ${s.hoofd.band.label}`, s.hoofd.band.kleur) : badge(`${s.ingevuld} van ${s.aantal} ${metScores(t) ? 'scores' : ''} ingevuld`.replace('  ', ' '), 'grey'),
      t.herkomst && h('span', null, t.herkomst),
      rec.datum && h('span', null, `ingevuld ${fmtDate(rec.datum)}`)),
    h('p', { class: 'row-title' }, t.naam),
    h('p', { class: 'small' }, t.meet),
    h('p', { class: 'small muted' }, t.waarom),
    t.online && h('div', { class: 'form__actions', style: 'margin-top:6px' }, h('a', { class: 'btn btn--primary btn--sm', href: t.online, target: '_blank', rel: 'noopener' }, t.onlineLabel || 'Online invullen', ' ', icon('external', 12))),
    t.formulier && h('p', { class: 'small' }, ext(t.formulier, t.formulierLabel), t.handleiding ? [' · ', ext(t.handleiding, 'Handleiding')] : null),
    t.hint && h('p', { class: 'small welzijn-hint' }, t.hint),
    alarm(t, rec) && veiligheidKaart(true),
    s.klaar && (s.schalen.length > 1 || s.hoofd.band.uitleg || s.hoofd.uitleg || laagSignaal(t, s)) && uitslag(t, s),
    scherm && t.instructie && !s.klaar && h('p', { class: 'welzijn-instructie' }, t.instructie),
    scherm && s.klaar ? h('details', { class: 'welzijn-antwoorden' }, h('summary', { class: 'small' }, 'Je antwoorden bekijken of aanpassen'), t.instructie && h('p', { class: 'small muted' }, t.instructie), vragen) : vragen,
    t.alarmVraag && !scherm && h('p', { class: 'small muted' }, `${t.alarmLabel} Elk antwoord boven 0 toont meteen waar je hulp vindt.`),
    t.alarmLabel && scherm && h('p', { class: 'small muted' }, t.alarmLabel),
    t.extraVraag && h('label', { class: 'small', style: 'display:block;margin-top:8px' }, t.extraVraag.label, ' ',
      h('select', { class: 'field', style: 'max-width:280px', onChange: e => upsert('welzijn', { id: rec.id, extra: e.target.value }) }, [h('option', { value: '' }, 'Kies'), ...t.extraVraag.opties.map(o => h('option', { value: o, selected: rec.extra === o }, o))])),
    h('details', { style: 'margin-top:8px' }, h('summary', { class: 'small' }, 'Hoe lees je de score'), h('p', { class: 'small' }, t.bandenTekst), t.opgelet && h('p', { class: 'small muted' }, t.opgelet), h('p', { class: 'small muted' }, t.bron)),
    h('div', { class: 'form__actions' }, (s.ingevuld > 0) && h('button', { class: 'btn btn--quiet btn--sm', onClick: () => { if (confirm(`Alle antwoorden van de ${t.naam} wissen?`)) upsert('welzijn', { id: rec.id, antwoorden: [], keuzes: [], scores: {}, veilig: '', datum: '', extra: '' }); } }, 'Opnieuw beginnen')));
}

// Tekst om mee te nemen naar de huisarts.
function samenvatting() {
  const regels = ['Zelftests voor de huisarts', `Opgemaakt op ${fmtDate(todayIso())}`, ''];
  for (const t of W().tests) {
    const rec = get('welzijn', `test-${t.id}`); const s = testScore(t, rec);
    if (!rec || !s.ingevuld) continue;
    if (!s.klaar) regels.push(`${t.naam}: onvolledig (${s.ingevuld} van ${s.aantal} vragen)`);
    else if (s.schalen.length === 1) regels.push(`${t.naam}: ${toon(s.hoofd)} (${s.hoofd.band.label}), ingevuld op ${fmtDate(rec.datum)}`);
    else regels.push(`${t.naam}, ingevuld op ${fmtDate(rec.datum)}:`, ...s.schalen.map(x => `  ${x.naam}: ${toon(x)} (${x.band.label})`));
    if (s.klaar && !metScores(t)) regels.push(`  Antwoorden per vraag: ${s.waarden.join(', ')}`);
    if (metScores(t) && rec.veilig) regels.push(`  ${t.veiligheidsvraag} ${rec.veilig === 'ja' ? 'Ja' : 'Nee'}`);
    if (laagSignaal(t, s)) regels.push(`  ${t.laagItem.tekst}`);
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
  const ingevuld = tests.filter(t => testScore(t, get('welzijn', `test-${t.id}`)).klaar).length;
  const tabs = [['zelftests', `Zelftests ${ingevuld}/${tests.length}`], ['dagboek', 'Dagboek'], ['dokter', 'Voor de dokter'], ['hulp', 'Hulp']].map(([k, l]) => ({ label: l, href: `#/welzijn?tab=${k}`, active: tab === k }));
  const dringend = tests.some(t => alarm(t, get('welzijn', `test-${t.id}`)));
  let inhoud;
  if (tab === 'zelftests') inhoud = h('div', { class: 'stack' },
    dringend && veiligheidKaart(true),
    callout('green', 'leaf', 'Zo werkt het', h('p', null, W().intro), W().volgorde && h('p', { class: 'small muted' }, W().volgorde)),
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
