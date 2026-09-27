// Views: overzicht, stappenplan, planning, rechten, profiel, documenten, instellingen.
import { h, icon, badge, fit, fmtDate, todayIso, addDays, daysUntil, uid, md, copyText, download, toast } from './ui.js';
import { all, get, upsert, remove, ref, exportJson, importJson, resetLocal, localSize } from './store.js';
import { openPeek, closePeek, go } from './app.js';

const SPOORKLEUR = { erfgoed: 'orange', cultuur: 'violet', onderwijs: 'green', overheid: 'grey', sociaal: 'red', ecologisch: 'green', geschiedenis: 'orange', reserve: 'grey' };
export const spoorBadge = (s) => badge(s || 'algemeen', SPOORKLEUR[s] || 'grey');
const card = (...c) => h('section', { class: 'card card--pad stack-sm' }, ...c);
const titled = (title, ...c) => h('section', { class: 'card card--pad stack-sm' }, h('p', { class: 'eyebrow' }, title), ...c);
const link = (href, label) => h('a', { href, target: '_blank', rel: 'noopener' }, label || href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), icon('external', 12));

function huidigeFase() {
  const fasen = ref.programma.fasen; const t = todayIso();
  const grenzen = ['2026-10-31', '2026-12-31', '2027-02-28', '2027-06-30', '2099-12-31'];
  const i = grenzen.findIndex(g => t <= g); return fasen[Math.max(0, i)];
}

// ---------- Overzicht ----------
export function overzicht() {
  const t = todayIso();
  const stappen = all('stappenplan').filter(s => s.status !== 'klaar');
  const dezeWeek = stappen.filter(s => s.deadline && daysUntil(s.deadline) <= 14).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const soll = all('sollicitaties');
  const opTeVolgen = soll.filter(s => ['verstuurd', 'opgevolgd'].includes(s.status) && s.opvolgdatum && daysUntil(s.opvolgdatum) <= 3).sort((a, b) => a.opvolgdatum.localeCompare(b.opvolgdatum));
  const gesprekken = soll.filter(s => s.status === 'gesprek' && s.gesprekDatum && daysUntil(s.gesprekDatum) >= 0);
  const telling = (st) => soll.filter(s => s.status === st).length;
  const fase = huidigeFase();
  const body = h('div', { class: 'stack' },
    h('div', null, h('h1', { class: 'page-title' }, 'Overzicht'), h('p', { class: 'muted' }, `Vandaag ${fmtDate(t)}. ${daysUntil(ref.programma.einddatum_contract)} dagen tot 31 december 2026.`)),
    h('div', { class: 'callout callout--red' }, h('p', { class: 'row-title' }, 'Eerst dit'), h('p', null, ref.rechten.kern[0]), h('p', { class: 'small', style: 'margin-top:6px' }, h('a', { href: '#/rechten' }, 'Alle rechten en scenario\'s'))),
    h('div', { class: 'grid-cards' },
      h('div', { class: 'card kpi accent-green' }, h('p', { class: 'eyebrow' }, 'Open stappen'), h('p', { class: 'kpi__num' }, String(stappen.length)), h('a', { href: '#/stappenplan', class: 'small' }, 'Naar het stappenplan')),
      h('div', { class: 'card kpi accent-orange' }, h('p', { class: 'eyebrow' }, 'Sollicitaties actief'), h('p', { class: 'kpi__num' }, String(soll.filter(s => !['afgewezen', 'gearchiveerd'].includes(s.status)).length)), h('p', { class: 'small muted' }, `${telling('verstuurd') + telling('opgevolgd')} verstuurd, ${telling('gesprek')} gesprek, ${telling('aanbod')} aanbod`)),
      h('div', { class: 'card kpi accent-violet' }, h('p', { class: 'eyebrow' }, 'Huidige fase'), h('p', { class: 'row-title' }, fase.naam), h('p', { class: 'small muted' }, fase.periode), h('a', { href: '#/planning', class: 'small' }, 'Planning')),
    ),
    h('div', { class: 'two-col' },
      titled('Deze twee weken', dezeWeek.length ? h('ul', { class: 'list list--tight' }, dezeWeek.slice(0, 8).map(s => h('li', null,
        h('input', { type: 'checkbox', class: 'check', onChange: () => upsert('stappenplan', { id: s.id, status: 'klaar' }) }),
        h('div', null, h('p', { class: 'row-title' }, s.titel), h('p', { class: 'meta' }, h('span', { class: daysUntil(s.deadline) < 0 ? 'overdue' : '' }, fmtDate(s.deadline)), s.wie))))) : h('p', { class: 'muted' }, 'Niets met een deadline binnen twee weken.')),
      titled('Op te volgen', opTeVolgen.length || gesprekken.length ? h('ul', { class: 'list list--tight' },
        gesprekken.map(s => h('li', null, icon('calendar', 14), h('div', null, h('p', { class: 'row-title' }, `Gesprek: ${s.organisatie}`), h('p', { class: 'meta' }, fmtDate(s.gesprekDatum), s.functie)))),
        opTeVolgen.map(s => h('li', null, icon('mail', 14), h('div', null, h('a', { href: '#/sollicitaties', class: 'row-title' }, s.organisatie), h('p', { class: 'meta' }, h('span', { class: daysUntil(s.opvolgdatum) < 0 ? 'overdue' : '' }, `opvolgen ${fmtDate(s.opvolgdatum)}`), s.functie))))) : h('p', { class: 'muted' }, 'Geen sollicitaties die nu opvolging vragen.')),
    ),
    titled('Sporen', h('div', { class: 'grid-cards' }, ref.programma.sporen.map(sp => h('div', { class: `card card--pad accent-${sp.kleur}` }, h('p', { class: 'row-title' }, sp.naam), h('p', { class: 'small muted' }, sp.status), h('p', { class: 'small', style: 'margin-top:6px' }, sp.toelichting))))),
    titled('Ritme', h('p', null, ref.programma.ritme)),
  );
  return { chrome: { where: 'Wat nu telt', accent: 'violet' }, body };
}

// ---------- Stappenplan ----------
export function stappenplan(r) {
  const filter = r.tab || 'open';
  const items = all('stappenplan').filter(s => filter === 'alles' || (filter === 'open' ? s.status !== 'klaar' : s.status === 'klaar'));
  const groepen = [...new Set(all('stappenplan').map(s => s.groep))];
  const body = h('div', { class: 'stack' },
    h('div', null, h('h1', { class: 'page-title' }, 'Stappenplan'), h('p', { class: 'muted' }, 'Alles wat te doen is, van de dokter en ACV tot VDAB, cv en hotlist. Vink af wat klaar is; voeg eigen stappen toe.')),
    groepen.map(g => { const list = items.filter(s => s.groep === g); if (!list.length) return null; return titled(g, h('ul', { class: 'list' }, list.map(s => h('li', null,
      h('input', { type: 'checkbox', class: 'check', checked: s.status === 'klaar', onChange: (e) => upsert('stappenplan', { id: s.id, status: e.target.checked ? 'klaar' : 'open' }) }),
      h('div', { style: 'flex:1;min-width:0' },
        h('p', { class: 'row-title' + (s.status === 'klaar' ? ' done' : '') }, s.titel),
        h('p', { class: 'small', style: 'margin-top:2px' }, s.wat),
        h('p', { class: 'meta', style: 'margin-top:4px' }, s.wie && h('span', null, s.wie), s.deadline && h('span', { class: s.status !== 'klaar' && daysUntil(s.deadline) < 0 ? 'overdue' : '' }, `deadline ${fmtDate(s.deadline)}`), s.bron && badge(s.bron, 'grey'), h('button', { class: 'btn btn--quiet btn--sm', onClick: () => stapForm(s) }, 'Bewerken'))))))); }),
  );
  const tabs = [['open', 'Open'], ['klaar', 'Klaar'], ['alles', 'Alles']].map(([k, l]) => ({ label: l, href: `#/stappenplan?tab=${k}`, active: filter === k }));
  const tool = [h('span', { class: 'chrome__view' }, `${items.length} stappen`), h('div', { class: 'chrome__spacer' }), h('button', { class: 'btn btn--primary', onClick: () => stapForm() }, icon('plus', 14), 'Stap toevoegen')];
  return { chrome: { where: 'Te doen', tabs, tool }, body };
}
function stapForm(s = {}) {
  openPeek(s.id ? 'Stap bewerken' : 'Nieuwe stap', () => {
    const f = { titel: s.titel || '', wat: s.wat || '', wie: s.wie || 'Remi', deadline: s.deadline || '', groep: s.groep || 'Eigen stappen' };
    const inp = (k, type = 'text') => h('input', { class: 'field', type, value: f[k], onInput: e => f[k] = e.target.value });
    return h('form', { class: 'form', onSubmit: e => { e.preventDefault(); if (!f.titel) return; upsert('stappenplan', { id: s.id || 's-' + uid(), status: s.status || 'open', ...f }); closePeek(); toast('Bewaard'); } },
      h('label', null, 'Titel', inp('titel')), h('label', null, 'Wat precies', h('textarea', { class: 'field', value: f.wat, onInput: e => f.wat = e.target.value })),
      h('div', { class: 'form__row' }, h('label', null, 'Wie', inp('wie')), h('label', null, 'Deadline', inp('deadline', 'date'))),
      h('label', null, 'Groep', inp('groep')),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit' }, 'Bewaren'), s.id && h('button', { class: 'btn btn--danger', type: 'button', onClick: () => { remove('stappenplan', s.id); closePeek(); } }, 'Verwijderen')));
  });
}

// ---------- Planning ----------
const EVENEMENTEN = [
  { datum: '2026-10-04', naam: 'Voka Open Bedrijvendag' }, { datum: '2026-11-15', naam: 'Dag van de Ambachten (20ste editie)' }, { datum: '2026-11-15', naam: 'Kunstendag voor Kinderen' },
  { datum: '2027-04-18', naam: 'Erfgoeddag 2027, thema Passie' }, { datum: '2027-05-06', naam: 'Antwerp Art Weekend (6 tot 9 mei)' }, { datum: '2027-08-07', naam: 'Museumnacht Antwerpen (datum te bevestigen)' }, { datum: '2027-09-12', naam: 'Open Monumentendag 2027' },
];
export function planning() {
  const t = todayIso(); const fase = huidigeFase();
  const agenda = [
    ...all('stappenplan').filter(s => s.deadline && s.status !== 'klaar').map(s => ({ datum: s.deadline, naam: s.titel, soort: 'stap', href: '#/stappenplan' })),
    ...all('sollicitaties').filter(s => s.opvolgdatum && ['verstuurd', 'opgevolgd'].includes(s.status)).map(s => ({ datum: s.opvolgdatum, naam: `Opvolgen: ${s.organisatie}`, soort: 'sollicitatie', href: '#/sollicitaties' })),
    ...all('sollicitaties').filter(s => s.gesprekDatum).map(s => ({ datum: s.gesprekDatum, naam: `Gesprek: ${s.organisatie}`, soort: 'gesprek', href: '#/sollicitaties' })),
    ...all('vacatures').filter(v => v.deadline && v.status !== 'niet').map(v => ({ datum: v.deadline, naam: `Deadline vacature: ${v.titel}`, soort: 'vacature', href: '#/vacatures' })),
    ...EVENEMENTEN.map(e => ({ ...e, soort: 'evenement' })),
  ].filter(x => x.datum >= addDays(t, -7)).sort((a, b) => a.datum.localeCompare(b.datum));
  const kleur = { stap: 'green', sollicitatie: 'orange', gesprek: 'violet', vacature: 'orange', evenement: 'grey' };
  const body = h('div', { class: 'stack' },
    h('div', null, h('h1', { class: 'page-title' }, 'Planning'), h('p', { class: 'muted' }, `Vijf fasen van hier tot september 2027. Nu: ${fase.naam}.`)),
    h('div', { class: 'two-col' },
      h('div', { class: 'timeline' }, ref.programma.fasen.map(f => h('div', { class: 'timeline__item' + (f.id === fase.id ? ' timeline__item--now' : '') },
        h('p', { class: 'eyebrow' }, f.periode), h('p', { class: 'row-title' }, f.naam), h('p', { class: 'small', style: 'margin:4px 0' }, f.doel), h('ul', { class: 'bullets small' }, f.acties.map(a => h('li', null, a)))))),
      h('div', { class: 'stack' },
        titled('Agenda', agenda.length ? h('ul', { class: 'list list--tight' }, agenda.slice(0, 30).map(a => h('li', null,
          h('span', { class: 'small muted', style: 'width:78px;flex:0 0 auto' }, fmtDate(a.datum)), h('div', null, a.href ? h('a', { href: a.href }, a.naam) : a.naam, ' ', badge(a.soort, kleur[a.soort]))))) : h('p', { class: 'muted' }, 'Nog niets ingepland.')),
        titled('Ritme', h('p', null, ref.programma.ritme)),
      ),
    ),
  );
  return { chrome: { where: 'Fasen en agenda' }, body };
}

// ---------- Rechten ----------
export function rechten(r) {
  const R = ref.rechten; const tab = r.tab || 'kern';
  const tabs = [['kern', 'Kern'], ['scenarios', 'Scenario\'s'], ['opzeg', 'Opzegtermijn'], ['werkloosheid', 'Werkloosheid 2026'], ['steun', 'ACV en VDAB'], ['check', 'Te verifiëren']].map(([k, l]) => ({ label: l, href: `#/rechten?tab=${k}`, active: tab === k }));
  let content;
  if (tab === 'kern') content = h('div', { class: 'stack' }, h('div', { class: 'callout callout--red' }, h('p', { class: 'row-title' }, 'Wat je meteen moet weten'), h('ul', { class: 'bullets' }, R.kern.map(k => h('li', null, k)))), h('p', { class: 'small muted' }, R.disclaimer));
  else if (tab === 'scenarios') content = h('div', { class: 'grid-cards grid-cards--wide' }, R.scenarios.map(s => h('div', { class: `card card--pad accent-${s.kleur}` }, h('p', { class: 'eyebrow' }, `Scenario ${s.id}`), h('p', { class: 'section-title' }, s.naam), badge(s.oordeel, s.kleur), h('ul', { class: 'bullets small', style: 'margin-top:8px' }, s.punten.map(p => h('li', null, p))))));
  else if (tab === 'opzeg') content = h('div', { class: 'stack' },
    titled('Opzegtermijnen in weken', h('p', { class: 'small muted' }, R.opzegtabel.toelichting), h('table', { class: 'table' }, h('thead', null, h('tr', null, h('th', null, 'Anciënniteit'), h('th', null, 'Werkgever zegt op'), h('th', null, 'Werknemer zegt op'))), h('tbody', null, R.opzegtabel.rijen.map(x => h('tr', null, h('td', null, x.ancienniteit), h('td', null, `${x.werkgever} weken`), h('td', null, `${x.werknemer} weken`)))))),
    opzegCalculator(R.opzegtabel.rijen));
  else if (tab === 'werkloosheid') content = h('div', { class: 'stack' }, titled('Regels sinds 1 maart 2026', h('ul', { class: 'bullets' }, R.werkloosheid2026.map(k => h('li', null, k)))), titled('Vakantiegeld en eindejaarspremie', h('p', null, R.vakantiegeld)));
  else if (tab === 'steun') content = h('div', { class: 'two-col' }, titled('Wat ACV-CSC METEA doet', h('ul', { class: 'bullets' }, R.acv.map(k => h('li', null, k)))), titled('Wat VDAB biedt', h('ul', { class: 'bullets' }, R.vdabsteun.map(k => h('li', null, k)))));
  else content = titled('Nog te bevestigen bij ACV, VDAB of de bron', h('ul', { class: 'bullets' }, R.teverifieren.map(k => h('li', null, k))), h('p', { class: 'small muted' }, `Peildatum ${fmtDate(R.peildatum)}. Bronnen in research/01-arbeidsrecht-uitstap.md.`));
  const body = h('div', { class: 'stack' }, h('div', null, h('h1', { class: 'page-title' }, 'Rechten'), h('p', { class: 'muted' }, 'Belgisch arbeidsrecht toegepast op de uitstap van Remi. Informatie, geen juridisch advies.')), content);
  return { chrome: { where: 'Uitstap, uitkering, herstel', tabs, accent: 'red' }, body };
}
function opzegCalculator(rijen) {
  const st = { rij: 2, wie: 'werkgever', datum: todayIso(), aangetekend: true };
  const out = h('div', { class: 'callout' });
  const bereken = () => {
    let kennis = new Date(st.datum + 'T00:00:00');
    if (st.aangetekend) { let n = 0; while (n < 3) { kennis.setDate(kennis.getDate() + 1); if (kennis.getDay() !== 0) n++; } }
    const start = new Date(kennis); start.setDate(start.getDate() + ((8 - start.getDay()) % 7 || 7));
    const weken = rijen[st.rij][st.wie];
    const einde = new Date(start); einde.setDate(einde.getDate() + weken * 7 - 1);
    const iso = d => d.toISOString().slice(0, 10);
    out.replaceChildren(h('p', { class: 'row-title' }, `${weken} weken opzeg`), h('p', null, `Kennisgeving geldt op ${fmtDate(iso(kennis))}${st.aangetekend ? ' (derde werkdag na verzending)' : ''}. De termijn start maandag ${fmtDate(iso(start))} en eindigt zondag ${fmtDate(iso(einde))}.`), h('p', { class: 'small muted' }, 'Eigen berekening volgens de wettelijke regels; feestdagen niet meegeteld. Laat ACV de exacte datum bevestigen.'));
  };
  const sel = (opts, key, conv = x => x) => h('select', { class: 'field', onChange: e => { st[key] = conv(e.target.value); bereken(); } }, opts.map(([v, l]) => h('option', { value: v, selected: String(st[key]) === String(v) }, l)));
  bereken();
  return titled('Rekenhulp opzegtermijn', h('div', { class: 'form' },
    h('div', { class: 'form__row' }, h('label', null, 'Anciënniteit', sel(rijen.map((x, i) => [i, x.ancienniteit]), 'rij', Number)), h('label', null, 'Wie zegt op', sel([['werkgever', 'Werkgever'], ['werknemer', 'Remi zelf']], 'wie'))),
    h('div', { class: 'form__row' }, h('label', null, 'Datum verzending brief', h('input', { class: 'field', type: 'date', value: st.datum, onChange: e => { st.datum = e.target.value; bereken(); } })), h('label', null, 'Vorm', sel([['1', 'Aangetekende brief'], ['0', 'Afgegeven met ontvangstbewijs']], 'aangetekend', v => v === '1'))),
  ), out);
}

// ---------- Profiel ----------
export function profiel(r) {
  const P = ref.profiel; const tab = r.tab || 'samenvatting';
  const tabs = [['samenvatting', 'Samenvatting'], ['tests', 'Testresultaten'], ['herzieningen', 'Herzieningen']].map(([k, l]) => ({ label: l, href: `#/profiel?tab=${k}`, active: tab === k }));
  const bar = (naam, val, max, primair) => h('div', { class: 'score' }, h('span', null, naam), h('span', { class: 'progress' }, h('span', { style: `width:${Math.round(val / max * 100)}%;${primair ? '' : 'opacity:.45'}` })), h('span', { class: 'score__val' }, String(val)));
  let content;
  if (tab === 'samenvatting') content = h('div', { class: 'stack' },
    h('blockquote', { class: 'quote' }, P.synthese),
    h('div', { class: 'two-col' },
      titled('Wie', h('p', null, `${P.naam}, ${P.leeftijd}, ${P.woonplaats}.`), h('p', null, P.beroep), h('p', null, P.studies), h('p', { class: 'small muted' }, P.situatie), h('p', { class: 'small muted' }, P.vakbond)),
      titled('Kan', h('ul', { class: 'bullets' }, P.vaardigheden.map(v => h('li', null, v)))),
    ),
    titled('Randvoorwaarden', h('ul', { class: 'bullets' }, P.randvoorwaarden.map(v => h('li', null, v)))),
    h('div', { class: 'callout callout--orange' }, h('p', { class: 'row-title' }, 'Te bevestigen'), h('p', null, 'Welke opleiding volgt Remi precies: een hogeschoolbachelor, een opleiding aan de stedelijke academie (deeltijds kunstonderwijs) of iets anders? Dat bepaalt studiepunten, vrijstellingen en opleidingsverlof. Zie stap "Studie bevestigen" in het stappenplan.')));
  else if (tab === 'tests') content = h('div', { class: 'stack' },
    titled('Loopbaanankers (Schein)', P.tests.loopbaanankers.map(a => bar(a.anker, a.score, 100, a.rol === 'dominant')), h('p', { class: 'small muted' }, 'Zuivere uitdaging en dienstbaarheid vormen het dominante paar: werk moet echt moeilijk zijn en er echt toe doen.')),
    h('div', { class: 'two-col' },
      titled('Holland-code: ' + P.tests.holland.code, P.tests.holland.scores.map((s, i) => bar(s.type, s.score, P.tests.holland.max, i < 3))),
      titled('Big Five', h('ul', { class: 'list list--tight' }, P.tests.bigfive.map(b => h('li', null, h('div', null, h('p', { class: 'row-title' }, `${b.domein}: ${b.niveau}`), h('p', { class: 'small muted' }, b.toelichting)))))),
    ),
    titled('MBTI: ' + P.tests.mbti.type, h('p', null, P.tests.mbti.toelichting)));
  else content = h('div', { class: 'grid-cards grid-cards--wide' }, P.herzieningen.map(x => h('div', { class: 'card card--pad' }, h('p', { class: 'row-title' }, x.onderwerp), badge(x.status, x.status.includes('niet') ? 'red' : x.status.includes('hoofd') ? 'orange' : 'grey'), h('p', { class: 'small', style: 'margin-top:8px' }, x.toelichting))));
  const body = h('div', { class: 'stack' }, h('div', null, h('h1', { class: 'page-title' }, 'Profiel'), h('p', { class: 'muted' }, 'Wie Remi is volgens vier tests en de gesprekken tot nu toe.')), content);
  return { chrome: { where: 'Wie Remi is', tabs, accent: 'grey' }, body };
}

// ---------- Documenten ----------
export function documenten(r) {
  const tab = r.tab || 'cv';
  const tabs = [['cv', 'Cv'], ['sjablonen', 'Sjablonen'], ['vdab', 'VDAB-profiel'], ['gegenereerd', 'Per sollicitatie']].map(([k, l]) => ({ label: l, href: `#/documenten?tab=${k}`, active: tab === k }));
  const S = ref.sjablonen; let content;
  if (tab === 'cv') { const cv = ref.cvMaster; content = h('div', { class: 'stack' },
    h('div', { class: 'toolbar' }, h('a', { class: 'btn btn--primary', href: 'cv.html', target: '_blank' }, icon('print', 14), 'Afdrukversie openen (pdf)'), h('button', { class: 'btn btn--ghost', onClick: () => copyText(JSON.stringify(cv, null, 2)) }, icon('copy', 14), 'Kopieer cv-gegevens')),
    h('div', { class: 'callout' }, h('p', null, 'Het master-cv staat in data/cv-master.json. Tekst tussen vierkante haken moet nog ingevuld worden. Per sollicitatie maakt Claude een aangepaste versie in documents/generated.')),
    titled('Profiel', h('p', null, cv.profiel)),
    titled('Werkervaring', cv.werkervaring.map(w => h('div', { style: 'margin-bottom:10px' }, h('p', { class: 'row-title' }, `${w.functie}, ${w.werkgever}`), h('p', { class: 'small muted' }, w.periode), h('ul', { class: 'bullets small' }, w.taken.map(t => h('li', null, t)))))),
    h('div', { class: 'two-col' }, titled('Opleiding', h('ul', { class: 'list list--tight' }, cv.opleiding.map(o => h('li', null, h('div', null, h('p', { class: 'row-title' }, o.titel), h('p', { class: 'small muted' }, `${o.instelling}, ${o.periode}`)))))), titled('Certificaten en vaardigheden', h('ul', { class: 'bullets small' }, [...cv.certificaten, ...cv.vaardigheden].map(c => h('li', null, c))))));
  } else if (tab === 'sjablonen') content = h('div', { class: 'stack' }, ['motivatiebrief-basis.md', 'mails.md'].filter(k => S[k]).map(k => titled(k.replace('.md', '').replace(/-/g, ' '), h('div', { class: 'toolbar' }, h('button', { class: 'btn btn--ghost btn--sm', onClick: () => copyText(S[k]) }, icon('copy', 12), 'Kopieer tekst')), md(S[k]))));
  else if (tab === 'vdab') content = h('div', { class: 'stack' }, h('div', { class: 'toolbar' }, h('button', { class: 'btn btn--primary', onClick: () => copyText(S['vdab-profiel.md'] || '') }, icon('copy', 14), 'Kopieer volledige tekst'), h('a', { class: 'btn btn--ghost', href: 'https://www.vdab.be/mijnloopbaan', target: '_blank' }, icon('external', 14), 'Mijn Loopbaan openen')), card(md(S['vdab-profiel.md'] || 'Nog niet beschikbaar.')));
  else content = ref.gegenereerd.length ? h('div', { class: 'stack' }, ref.gegenereerd.map(g => titled(g.slug, g.meta && h('p', { class: 'small muted' }, `${g.meta.organisatie || ''} ${g.meta.functie ? ', ' + g.meta.functie : ''} ${g.meta.datum ? ', ' + fmtDate(g.meta.datum) : ''}`), h('div', { class: 'toolbar' }, g.cv && h('a', { class: 'btn btn--ghost btn--sm', href: `cv.html?variant=${encodeURIComponent(g.slug)}`, target: '_blank' }, icon('print', 12), 'Cv-variant'), g.brief && h('button', { class: 'btn btn--ghost btn--sm', onClick: () => copyText(g.brief) }, icon('copy', 12), 'Kopieer brief'), g.mail && h('button', { class: 'btn btn--ghost btn--sm', onClick: () => copyText(g.mail) }, icon('copy', 12), 'Kopieer mail')), g.brief && md(g.brief), g.mail && md(g.mail)))) : h('div', { class: 'empty' }, 'Nog geen aangepaste documenten. Geef een vacature aan Claude met de werkwijze in .claude/skills/sollicitatie en de map documents/generated vult zich.');
  const body = h('div', { class: 'stack' }, h('div', null, h('h1', { class: 'page-title' }, 'Documenten'), h('p', { class: 'muted' }, 'Master-cv, brieven, mails en de tekst voor het VDAB-profiel. Alles in het Nederlands, met "u" tegenover werkgevers.')), content);
  return { chrome: { where: 'Cv, brieven, mails', tabs, accent: 'grey' }, body };
}

// ---------- Instellingen (peek) ----------
export function instellingenPeek() {
  openPeek('Instellingen en synchronisatie', () => h('div', { class: 'stack' },
    h('p', { class: 'small' }, `Alles wat je invult staat in deze browser (${Math.round(localSize() / 1024)} kB). Om te delen tussen Giulia en Remi: exporteer hier en importeer op het andere toestel, of geef het bestand aan Claude om in data/ vast te leggen.`),
    h('div', { class: 'form__actions' },
      h('button', { class: 'btn btn--primary', onClick: () => download(`remi-app-${todayIso()}.json`, exportJson()) }, icon('download', 14), 'Exporteer gegevens'),
      h('label', { class: 'btn btn--ghost' }, icon('upload', 14), 'Importeer bestand', h('input', { type: 'file', accept: 'application/json', style: 'display:none', onChange: async e => { const f = e.target.files[0]; if (!f) return; try { importJson(await f.text()); toast('Geïmporteerd'); } catch { toast('Bestand niet herkend'); } } })),
      h('button', { class: 'btn btn--ghost', onClick: () => copyText(exportJson()) }, icon('copy', 14), 'Kopieer als JSON')),
    h('hr', { style: 'border:0;border-top:1px solid var(--line)' }),
    h('p', { class: 'small muted' }, 'Wis alle lokale wijzigingen en val terug op de seed uit de repository.'),
    h('button', { class: 'btn btn--danger', onClick: () => { if (confirm('Alle lokale wijzigingen wissen?')) { resetLocal(); closePeek(); } } }, 'Lokale gegevens wissen'),
  ));
}
