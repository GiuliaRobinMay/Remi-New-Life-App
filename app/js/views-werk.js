// Views: sollicitaties, vacatures, hotlist, verkenning, opleidingen.
import { h, icon, badge, fit, fmtDate, todayIso, addDays, daysUntil, uid, slugify, copyText, toast } from './ui.js';
import { all, get, upsert, remove, ref } from './store.js';
import { openPeek, closePeek, go } from './app.js';
import { spoorBadge, content, intro } from './views-core.js';

const STATUSSEN = [['te doen', 'Te doen'], ['in voorbereiding', 'In voorbereiding'], ['verstuurd', 'Verstuurd'], ['opgevolgd', 'Opgevolgd'], ['gesprek', 'Gesprek'], ['aanbod', 'Aanbod'], ['afgewezen', 'Afgewezen'], ['gearchiveerd', 'Gearchiveerd']];
const STATUSKLEUR = { 'te doen': 'grey', 'in voorbereiding': 'grey', verstuurd: 'orange', opgevolgd: 'orange', gesprek: 'violet', aanbod: 'green', afgewezen: 'red', gearchiveerd: 'grey' };
const SPOREN = [['erfgoed', 'Erfgoed en restauratie'], ['cultuur', 'Culturele instellingen'], ['onderwijs', 'Onderwijs'], ['overheid', 'Overheid'], ['sociaal', 'Sociaal en ecologisch'], ['geschiedenis', 'Geschiedenis en archief'], ['reserve', 'Reserve']];
const titled = (title, ...c) => h('section', { class: 'card card--pad' }, h('p', { class: 'eyebrow' }, title), ...c);
const ext = (href, label) => href ? h('a', { href, target: '_blank', rel: 'noopener' }, label || href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), ' ', icon('external', 12)) : null;
const sel = (opts, value, onChange, cls = 'field') => h('select', { class: cls, onChange: e => onChange(e.target.value) }, opts.map(([v, l]) => h('option', { value: v, selected: value === v }, l)));

// Grid table with folds
function grid(columns, groups, onOpen) {
  const open = new Set(JSON.parse(sessionStorage.getItem('folds-closed') || '[]'));
  const tbody = h('tbody');
  for (const g of groups) {
    if (!g.rows.length && g.hideEmpty) continue;
    const closed = open.has(g.key);
    const fold = h('tr', { class: 'grid2__fold grid2__fold--' + (g.tone || 'archived') + (closed ? ' grid2__fold--closed' : '') }, h('td', { colspan: columns.length + 1 }, h('button', { class: 'grid2__foldbtn', onClick: () => { closed ? open.delete(g.key) : open.add(g.key); sessionStorage.setItem('folds-closed', JSON.stringify([...open])); tbody.replaceWith(grid(columns, groups, onOpen).querySelector('tbody')); } }, h('span', { class: 'grid2__caret' }, '▾'), h('span', { class: 'grid2__foldname' }, g.label), h('span', { class: 'grid2__count' }, String(g.rows.length)))));
    tbody.append(fold);
    if (closed) continue;
    g.rows.forEach((row, i) => tbody.append(h('tr', null, columns.map((c, ci) => h('td', null, ci === 0 ? h('span', { class: 'cell cell--lead' }, h('span', { class: 'grid2__rownum' }, String(i + 1)), h('a', { class: 'grid2__open', href: '#', title: 'Openen', onClick: e => { e.preventDefault(); onOpen(row); } }, icon('arrow', 12)), h('span', { class: 'cell__text' }, c.render(row))) : c.render(row))), h('td', { class: 'grid2__filler' }))));
  }
  return h('div', { class: 'grid2' }, h('div', { class: 'grid2__scroll' }, h('table', { class: 'grid2__table' }, h('thead', null, h('tr', null, columns.map(c => h('th', { style: c.width ? `width:${c.width}px` : '' }, h('span', { class: 'grid2__field' }, h('span', { class: 'grid2__fieldname' }, c.label)), h('span', { class: 'grid2__grip' }))), h('th', { class: 'grid2__filler' }))), tbody)));
}

// ---------- Sollicitaties ----------
export function sollicitaties(r) {
  const q = (r.tab || '').toLowerCase();
  const items = all('sollicitaties').filter(s => !q || `${s.organisatie} ${s.functie}`.toLowerCase().includes(q)).sort((a, b) => (b.datumVerstuurd || b.aangemaakt || '').localeCompare(a.datumVerstuurd || a.aangemaakt || ''));
  const groups = [
    { key: 'actief', label: 'ACTIEF', tone: 'active', rows: items.filter(s => ['verstuurd', 'opgevolgd', 'gesprek', 'aanbod'].includes(s.status)) },
    { key: 'voorbereiden', label: 'VOORBEREIDEN', tone: 'contact', rows: items.filter(s => ['te doen', 'in voorbereiding'].includes(s.status)) },
    { key: 'afgesloten', label: 'AFGESLOTEN', tone: 'archived', rows: items.filter(s => ['afgewezen', 'gearchiveerd'].includes(s.status)), hideEmpty: true },
  ];
  const cols = [
    { label: 'Organisatie', width: 240, render: s => s.organisatie },
    { label: 'Functie', width: 220, render: s => s.functie || h('span', { class: 'grid2__dash' }, '—') },
    { label: 'Spoor', width: 120, render: s => spoorBadge(s.spoor) },
    { label: 'Verstuurd', width: 110, render: s => s.datumVerstuurd ? fmtDate(s.datumVerstuurd) : h('span', { class: 'grid2__dash' }, '—') },
    { label: 'Opvolgen', width: 120, render: s => s.opvolgdatum && ['verstuurd', 'opgevolgd'].includes(s.status) ? h('span', { class: daysUntil(s.opvolgdatum) <= 0 ? 'overdue' : '' }, fmtDate(s.opvolgdatum)) : h('span', { class: 'grid2__dash' }, '—') },
    { label: 'Status', width: 150, render: s => sel(STATUSSEN, s.status, v => zetStatus(s, v), `status status--${STATUSKLEUR[s.status] === 'green' ? 'active' : STATUSKLEUR[s.status] === 'orange' ? 'contact' : 'archived'} status--select`) },
  ];
  const body = items.length ? grid(cols, groups, s => sollicitatiePeek(s.id)) : content(intro('Sollicitaties', 'Elke sollicitatie met status, opvolgdatum, contact en documenten. Opvolgen gebeurt 10 tot 14 dagen na verzending, één keer.'), h('div', { class: 'card empty' }, 'Nog geen sollicitaties. Start vanuit een vacature, vanuit de hotlist (spontaan) of met de knop in de werkbalk.'));
  const tool = [h('label', { class: 'zonesearch' }, icon('search', 14), h('input', { placeholder: 'Zoek organisatie of functie', value: r.tab || '', onInput: e => { location.hash = `#/sollicitaties?tab=${encodeURIComponent(e.target.value)}`; } })), h('button', { class: 'btn btn--primary', onClick: () => sollicitatieForm() }, icon('plus', 14), 'Nieuwe sollicitatie')];
  return { chrome: { where: 'Alle sollicitaties', tool, tabLabel: 'Alle sollicitaties', view: `${items.length} sollicitaties`, viewIcon: 'mail' }, body };
}
function zetStatus(s, status) {
  const patch = { id: s.id, status };
  if (status === 'verstuurd' && !s.datumVerstuurd) { patch.datumVerstuurd = todayIso(); patch.opvolgdatum = addDays(todayIso(), 12); }
  if (status === 'opgevolgd') { patch.opvolgdatum = addDays(todayIso(), 10); }
  patch.logboek = [...(s.logboek || []), { datum: todayIso(), tekst: `Status naar ${status}` }];
  upsert('sollicitaties', patch);
}
export function sollicitatieForm(init = {}) {
  const s = { id: init.id, organisatie: init.organisatie || '', functie: init.functie || '', spoor: init.spoor || 'erfgoed', type: init.type || 'vacature', bronUrl: init.bronUrl || '', contactpersoon: init.contactpersoon || '', contactEmail: init.contactEmail || '', notities: init.notities || '', hotlistId: init.hotlistId, vacatureId: init.vacatureId, status: init.status || 'te doen', datumVerstuurd: init.datumVerstuurd || '', opvolgdatum: init.opvolgdatum || '', gesprekDatum: init.gesprekDatum || '', documentSlug: init.documentSlug || '' };
  openPeek(s.id ? 'Sollicitatie bewerken' : 'Nieuwe sollicitatie', () => {
    const inp = (k, type = 'text', ph = '') => h('input', { class: 'field', type, value: s[k], placeholder: ph, onInput: e => s[k] = e.target.value });
    return h('form', { class: 'form', onSubmit: e => { e.preventDefault(); if (!s.organisatie) return; if (s.status === 'verstuurd' && s.datumVerstuurd && !s.opvolgdatum) s.opvolgdatum = addDays(s.datumVerstuurd, 12); const saved = upsert('sollicitaties', { ...s, id: s.id || 'sol-' + uid(), aangemaakt: init.aangemaakt || todayIso(), logboek: init.logboek || [{ datum: todayIso(), tekst: 'Aangemaakt' }] }); if (s.vacatureId) upsert('vacatures', { id: s.vacatureId, status: 'omgezet' }); if (s.hotlistId && get('hotlist', s.hotlistId)?.status === 'nog niet benaderd') upsert('hotlist', { id: s.hotlistId, status: 'in voorbereiding' }); closePeek(); toast('Bewaard'); sollicitatiePeek(saved.id); } },
      h('div', { class: 'form__row' }, h('label', null, 'Organisatie', inp('organisatie')), h('label', null, 'Functie', inp('functie', 'text', 'bijvoorbeeld technisch medewerker atelier'))),
      h('div', { class: 'form__row' }, h('label', null, 'Spoor', sel(SPOREN, s.spoor, v => s.spoor = v)), h('label', null, 'Soort', sel([['vacature', 'Vacature'], ['spontaan', 'Spontane sollicitatie'], ['stage', 'Stage of werkbezoek']], s.type, v => s.type = v))),
      h('label', null, 'Link naar vacature of organisatie', inp('bronUrl', 'url', 'https://')),
      h('div', { class: 'form__row' }, h('label', null, 'Contactpersoon', inp('contactpersoon')), h('label', null, 'E-mail', inp('contactEmail', 'email'))),
      h('div', { class: 'form__row' }, h('label', null, 'Status', sel(STATUSSEN, s.status, v => s.status = v)), h('label', null, 'Datum verstuurd', inp('datumVerstuurd', 'date'))),
      h('div', { class: 'form__row' }, h('label', null, 'Opvolgdatum', inp('opvolgdatum', 'date')), h('label', null, 'Gesprek', inp('gesprekDatum', 'datetime-local'))),
      h('label', null, 'Map in documents/generated (slug)', inp('documentSlug', 'text', slugify(s.organisatie) || 'organisatie-functie')),
      h('label', null, 'Notities', h('textarea', { class: 'field', value: s.notities, onInput: e => s.notities = e.target.value })),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit' }, 'Bewaren'), s.id && h('button', { class: 'btn btn--danger', type: 'button', onClick: () => { if (confirm('Verwijderen?')) { remove('sollicitaties', s.id); closePeek(); } } }, 'Verwijderen')));
  });
}
function sollicitatiePeek(id) {
  openPeek(() => get('sollicitaties', id)?.organisatie || 'Sollicitatie', () => {
    const s = get('sollicitaties', id); if (!s) return h('p', null, 'Verwijderd.');
    const doc = ref.gegenereerd.find(g => g.slug === s.documentSlug);
    const hot = s.hotlistId && get('hotlist', s.hotlistId);
    const logInput = h('input', { class: 'field', placeholder: 'Wat gebeurde er (bijvoorbeeld: gebeld, geen antwoord)' });
    const opvolgTekst = (ref.sjablonen['mails.md'] || '').split('## Opvolgmail')[1]?.split('## ')[0] || '';
    return h('div', { class: 'stack stack--tight' },
      h('div', null, h('p', { class: 'muted small' }, `${s.type} · ${fmtDate(s.aangemaakt)}`), h('h1', { class: 'page-title', style: 'font-size:22px' }, s.organisatie), h('p', null, s.functie), h('div', { class: 'meta', style: 'margin-top:6px' }, spoorBadge(s.spoor), badge(s.status, STATUSKLEUR[s.status]))),
      titled('Status', h('div', { class: 'form__actions' }, ...[['verstuurd', 'Verstuurd'], ['opgevolgd', 'Opgevolgd'], ['gesprek', 'Gesprek'], ['aanbod', 'Aanbod'], ['afgewezen', 'Afgewezen']].map(([v, l]) => h('button', { class: 'btn btn--ghost btn--sm' + (s.status === v ? ' chip--active' : ''), onClick: () => zetStatus(s, v) }, l))),
        s.datumVerstuurd && h('p', { class: 'small' }, `Verstuurd ${fmtDate(s.datumVerstuurd)}.`), s.opvolgdatum && ['verstuurd', 'opgevolgd'].includes(s.status) && h('p', { class: 'small ' + (daysUntil(s.opvolgdatum) <= 0 ? 'overdue' : '') }, `Opvolgen op ${fmtDate(s.opvolgdatum)} (${daysUntil(s.opvolgdatum)} dagen).`), s.gesprekDatum && h('p', { class: 'small' }, `Gesprek: ${s.gesprekDatum.replace('T', ' om ')}.`)),
      titled('Contact', s.contactpersoon && h('p', null, s.contactpersoon), s.contactEmail && h('p', null, h('a', { href: `mailto:${s.contactEmail}?subject=${encodeURIComponent((s.status === 'verstuurd' ? 'Opvolging sollicitatie ' : 'Sollicitatie ') + (s.functie || '') + ' - Remi')}` }, s.contactEmail)), s.bronUrl && h('p', null, ext(s.bronUrl)), hot && h('p', { class: 'small' }, 'Hotlist: ', h('a', { href: '#/hotlist', onClick: () => hotlistPeek(hot.id) }, hot.naam)), !s.contactpersoon && !s.contactEmail && !s.bronUrl && h('p', { class: 'muted small' }, 'Nog geen contactgegevens.')),
      titled('Documenten', doc ? h('div', { class: 'link-list' }, doc.cv && h('a', { class: 'btn btn--ghost btn--sm', href: `cv.html?variant=${encodeURIComponent(doc.slug)}`, target: '_blank' }, icon('print', 12), 'Cv-variant'), doc.brief && h('button', { class: 'btn btn--ghost btn--sm', onClick: () => copyText(doc.brief) }, icon('copy', 12), 'Brief kopiëren'), doc.mail && h('button', { class: 'btn btn--ghost btn--sm', onClick: () => copyText(doc.mail) }, icon('copy', 12), 'Mail kopiëren')) : h('p', { class: 'small muted' }, `Geen aangepaste documenten gevonden voor map "${s.documentSlug || slugify(s.organisatie)}". Vraag Claude om ze te maken met de sollicitatie-werkwijze; ze verschijnen na npm run build:data.`),
        opvolgTekst && ['verstuurd'].includes(s.status) && h('button', { class: 'btn btn--quiet btn--sm', onClick: () => copyText(opvolgTekst.trim()) }, icon('copy', 12), 'Kopieer opvolgmail-sjabloon')),
      titled('Notities', h('textarea', { class: 'field', value: s.notities || '', onChange: e => upsert('sollicitaties', { id: s.id, notities: e.target.value }) })),
      titled('Logboek', h('form', { class: 'form__actions', onSubmit: e => { e.preventDefault(); if (!logInput.value) return; upsert('sollicitaties', { id: s.id, logboek: [...(s.logboek || []), { datum: todayIso(), tekst: logInput.value }] }); } }, logInput, h('button', { class: 'btn btn--ghost', type: 'submit' }, 'Noteer')), h('ul', { class: 'log list' }, [...(s.logboek || [])].reverse().map(l => h('li', null, h('time', null, fmtDate(l.datum)), l.tekst)))),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--ghost', onClick: () => sollicitatieForm(s) }, icon('edit', 14), 'Bewerken')),
    );
  });
}

// ---------- Vacatures ----------
export function vacatures(r) {
  const tab = r.tab || 'bewaard'; const J = ref.jobbronnen;
  const tabs = [['bewaard', 'Bewaard'], ['zoeken', 'Zoeken'], ['bronnen', 'Bronnen']].map(([k, l]) => ({ label: l, href: `#/vacatures?tab=${k}`, active: tab === k }));
  let inhoud;
  if (tab === 'bewaard') { const items = all('vacatures').sort((a, b) => (b.toegevoegd || '').localeCompare(a.toegevoegd || ''));
    inhoud = items.length ? h('div', { class: 'grid-cards grid-cards--wide' }, items.map(v => h('div', { class: 'card card--pad' + (v.status === 'niet' ? ' muted' : '') },
      h('div', { class: 'meta' }, badge(v.status, v.status === 'omgezet' ? 'green' : v.status === 'interessant' ? 'orange' : 'grey'), v.bron && h('span', null, v.bron), v.deadline && h('span', { class: daysUntil(v.deadline) < 3 ? 'overdue' : '' }, `deadline ${fmtDate(v.deadline)}`)),
      h('p', { class: 'row-title' }, v.titel), h('p', null, v.organisatie, v.plaats ? `, ${v.plaats}` : ''), v.url && h('p', { class: 'small' }, ext(v.url)), v.tekst && h('p', { class: 'small muted', style: 'max-height:80px;overflow:hidden' }, v.tekst.slice(0, 260) + (v.tekst.length > 260 ? '…' : '')),
      h('div', { class: 'form__actions' }, v.status !== 'omgezet' && h('button', { class: 'btn btn--primary btn--sm', onClick: () => sollicitatieForm({ organisatie: v.organisatie, functie: v.titel, bronUrl: v.url, spoor: v.spoor || 'erfgoed', vacatureId: v.id, notities: v.tekst ? v.tekst.slice(0, 500) : '' }) }, 'Maak sollicitatie'), h('button', { class: 'btn btn--ghost btn--sm', onClick: () => vacatureForm(v) }, 'Bewerken'), v.status !== 'niet' && h('button', { class: 'btn btn--quiet btn--sm', onClick: () => upsert('vacatures', { id: v.id, status: 'niet' }) }, 'Niet interessant'))))) : h('div', { class: 'card empty' }, 'Nog geen bewaarde vacatures. Zoek via het tabblad Zoeken en plak een vacature met de knop in de werkbalk.');
  } else if (tab === 'zoeken') inhoud = h('div', { class: 'stack stack--tight' },
    h('div', { class: 'callout' }, h('p', null, 'De sites zelf kunnen vanuit deze app niet automatisch gelezen worden (dat vraagt een server met netwerktoegang, zie README). Deze knoppen openen de juiste zoekopdracht; wat interessant is, plak je hier terug als vacature.')),
    titled('VDAB, zoekopdrachten', h('div', { class: 'link-list' }, J.zoektermen.map(t => h('a', { class: 'btn btn--ghost btn--sm', href: `https://www.vdab.be/vindeenjob/jobs/${slugify(t)}-antwerpen-provincie`, target: '_blank', rel: 'noopener' }, t, icon('external', 12))))),
    ...J.bronnen.filter(b => b.zoeklinks?.length).map(b => titled(b.naam, h('div', { class: 'link-list' }, b.zoeklinks.map(z => h('a', { class: 'btn btn--ghost btn--sm', href: z.url, target: '_blank', rel: 'noopener' }, z.label, icon('external', 12)))))),
  );
  else inhoud = h('div', { class: 'grid-cards' }, J.bronnen.map(b => h('div', { class: 'card card--pad' }, h('div', { class: 'meta' }, badge(b.type, b.type === 'primair' ? 'green' : b.type === 'cultuur' || b.type === 'erfgoed' ? 'orange' : 'grey')), h('p', { class: 'row-title' }, b.naam), h('p', { class: 'small' }, ext(b.url)), b.opmerking && h('p', { class: 'small muted' }, b.opmerking), b.api && h('p', { class: 'small muted' }, b.api))));
  const body = content(intro('Vacatures', 'Zoeken op de Vlaamse jobsites, bewaren wat past, omzetten naar een sollicitatie.'), inhoud);
  const tool = [h('button', { class: 'btn btn--primary', onClick: () => vacatureForm() }, icon('plus', 14), 'Vacature toevoegen')];
  return { chrome: { where: 'Zoeken en bewaren', tabs, tool, view: `${all('vacatures').filter(v => v.status !== 'niet').length} bewaard`, viewIcon: 'search' }, body };
}
function vacatureForm(init = {}) {
  const v = { id: init.id, titel: init.titel || '', organisatie: init.organisatie || '', plaats: init.plaats || 'Antwerpen', bron: init.bron || 'VDAB', url: init.url || '', deadline: init.deadline || '', spoor: init.spoor || 'erfgoed', tekst: init.tekst || '', status: init.status || 'interessant' };
  openPeek(v.id ? 'Vacature bewerken' : 'Vacature toevoegen', () => {
    const inp = (k, type = 'text') => h('input', { class: 'field', type, value: v[k], onInput: e => v[k] = e.target.value });
    return h('form', { class: 'form', onSubmit: e => { e.preventDefault(); if (!v.titel || !v.organisatie) return; upsert('vacatures', { ...v, id: v.id || 'vac-' + uid(), toegevoegd: init.toegevoegd || todayIso() }); closePeek(); toast('Bewaard'); } },
      h('div', { class: 'form__row' }, h('label', null, 'Functietitel', inp('titel')), h('label', null, 'Organisatie', inp('organisatie'))),
      h('div', { class: 'form__row' }, h('label', null, 'Plaats', inp('plaats')), h('label', null, 'Bron', inp('bron'))),
      h('div', { class: 'form__row' }, h('label', null, 'Link', inp('url', 'url')), h('label', null, 'Deadline', inp('deadline', 'date'))),
      h('label', null, 'Spoor', sel(SPOREN, v.spoor, x => v.spoor = x)),
      h('label', null, 'Vacaturetekst (plakken)', h('textarea', { class: 'field', style: 'min-height:160px', value: v.tekst, onInput: e => v.tekst = e.target.value })),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit' }, 'Bewaren'), v.id && h('button', { class: 'btn btn--danger', type: 'button', onClick: () => { remove('vacatures', v.id); closePeek(); } }, 'Verwijderen')));
  });
}

// ---------- Hotlist ----------
const HOTSTATUS = [['nog niet benaderd', 'Nog niet benaderd'], ['volgen', 'Vacatures volgen'], ['in voorbereiding', 'In voorbereiding'], ['contact', 'Contact gelegd'], ['gesolliciteerd', 'Gesolliciteerd'], ['gesprek', 'Gesprek'], ['geen match', 'Geen match']];
export function hotlist(r) {
  const q = (r.tab || '').toLowerCase();
  const items = all('hotlist').filter(x => !q || `${x.naam} ${x.plaats} ${x.rollen}`.toLowerCase().includes(q)).sort((a, b) => (a.prioriteit || 9) - (b.prioriteit || 9));
  const groups = SPOREN.map(([k, l]) => ({ key: k, label: l.toUpperCase(), tone: k === 'erfgoed' || k === 'cultuur' ? 'active' : k === 'onderwijs' ? 'contact' : 'archived', rows: items.filter(x => x.spoor === k), hideEmpty: true }));
  const cols = [
    { label: 'Organisatie', width: 300, render: x => x.naam },
    { label: 'Plaats', width: 180, render: x => x.plaats },
    { label: 'Type', width: 180, render: x => h('span', { class: 'small muted' }, x.type) },
    { label: 'Prioriteit', width: 90, render: x => badge(String(x.prioriteit), x.prioriteit === 1 ? 'orange' : 'grey') },
    { label: 'Status', width: 170, render: x => sel(HOTSTATUS, x.status, v => upsert('hotlist', { id: x.id, status: v }), `status status--${['gesolliciteerd', 'gesprek'].includes(x.status) ? 'active' : ['contact', 'in voorbereiding', 'volgen'].includes(x.status) ? 'contact' : 'archived'} status--select`) },
  ];
  const body = h('div', null, h('p', { class: 'grid2__note' }, 'Organisaties waar Remi graag zou werken, per spoor, met vacaturepagina, contact en instap. Prioriteit 1 eerst. Klik op de pijl om te openen.'), grid(cols, groups, x => hotlistPeek(x.id)));
  const tool = [h('label', { class: 'zonesearch' }, icon('search', 14), h('input', { placeholder: 'Zoek organisatie', value: r.tab || '', onInput: e => { location.hash = `#/hotlist?tab=${encodeURIComponent(e.target.value)}`; } })), h('button', { class: 'btn btn--primary', onClick: () => hotlistForm() }, icon('plus', 14), 'Organisatie toevoegen')];
  return { chrome: { where: 'Alle organisaties', tool, tabLabel: 'Alle organisaties', view: `${items.length} organisaties`, viewIcon: 'star' }, body };
}
export function hotlistPeek(id) {
  openPeek(() => get('hotlist', id)?.naam || 'Organisatie', () => {
    const x = get('hotlist', id); if (!x) return h('p', null, 'Verwijderd.');
    const sols = all('sollicitaties').filter(s => s.hotlistId === x.id);
    return h('div', { class: 'stack stack--tight' },
      h('div', null, h('div', { class: 'meta' }, spoorBadge(x.spoor), badge(`prioriteit ${x.prioriteit}`, x.prioriteit === 1 ? 'orange' : 'grey'), h('span', null, x.type)), h('h1', { class: 'page-title', style: 'font-size:22px;margin-top:6px' }, x.naam), h('p', { class: 'muted' }, x.plaats)),
      titled('Links', h('div', { class: 'stack-sm' }, x.website && h('p', null, ext(x.website, 'Website')), x.vacatures && h('p', null, ext(x.vacatures, 'Vacaturepagina')), x.contact && h('p', { class: 'small' }, x.contact))),
      titled('Wat ze doen', h('p', null, x.rollen)), titled('Hoe instappen', h('p', null, x.instap)),
      titled('Status', sel(HOTSTATUS, x.status, v => upsert('hotlist', { id: x.id, status: v })), h('textarea', { class: 'field', placeholder: 'Notities (contacten, data, indrukken)', value: x.notities || '', onChange: e => upsert('hotlist', { id: x.id, notities: e.target.value }) })),
      sols.length ? titled('Sollicitaties', h('ul', { class: 'list list--tight' }, sols.map(s => h('li', null, h('a', { href: '#/sollicitaties' }, s.functie || s.type), ' ', badge(s.status, STATUSKLEUR[s.status]))))) : null,
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', onClick: () => sollicitatieForm({ organisatie: x.naam, spoor: x.spoor, type: 'spontaan', bronUrl: x.vacatures || x.website, hotlistId: x.id, contactEmail: (x.contact || '').match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] || '' }) }, icon('mail', 14), 'Spontane sollicitatie starten'), h('button', { class: 'btn btn--ghost', onClick: () => hotlistForm(x) }, icon('edit', 14), 'Bewerken')),
    );
  });
}
function hotlistForm(init = {}) {
  const x = { id: init.id, naam: init.naam || '', spoor: init.spoor || 'erfgoed', type: init.type || '', plaats: init.plaats || '', website: init.website || '', vacatures: init.vacatures || '', contact: init.contact || '', rollen: init.rollen || '', instap: init.instap || '', prioriteit: init.prioriteit || 2, status: init.status || 'nog niet benaderd', notities: init.notities || '' };
  openPeek(x.id ? 'Organisatie bewerken' : 'Organisatie toevoegen', () => {
    const inp = (k, type = 'text') => h('input', { class: 'field', type, value: x[k], onInput: e => x[k] = type === 'number' ? Number(e.target.value) : e.target.value });
    return h('form', { class: 'form', onSubmit: e => { e.preventDefault(); if (!x.naam) return; upsert('hotlist', { ...x, id: x.id || 'hot-' + uid() }); closePeek(); toast('Bewaard'); } },
      h('label', null, 'Naam', inp('naam')), h('div', { class: 'form__row' }, h('label', null, 'Spoor', sel(SPOREN, x.spoor, v => x.spoor = v)), h('label', null, 'Prioriteit (1 hoog, 3 laag)', inp('prioriteit', 'number'))),
      h('div', { class: 'form__row' }, h('label', null, 'Type', inp('type')), h('label', null, 'Plaats', inp('plaats'))),
      h('div', { class: 'form__row' }, h('label', null, 'Website', inp('website', 'url')), h('label', null, 'Vacaturepagina', inp('vacatures', 'url'))),
      h('label', null, 'Contact', inp('contact')), h('label', null, 'Wat ze doen', h('textarea', { class: 'field', value: x.rollen, onInput: e => x.rollen = e.target.value })), h('label', null, 'Hoe instappen', h('textarea', { class: 'field', value: x.instap, onInput: e => x.instap = e.target.value })),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit' }, 'Bewaren'), x.id && h('button', { class: 'btn btn--danger', type: 'button', onClick: () => { if (confirm('Verwijderen van de hotlist?')) { remove('hotlist', x.id); closePeek(); } } }, 'Verwijderen')));
  });
}

// ---------- Verkenning ----------
const DOMEINEN = [['alles', 'Alles'], ['erfgoed', 'Erfgoed'], ['cultuur', 'Cultuur'], ['onderwijs', 'Onderwijs'], ['sociaal', 'Sociaal'], ['ecologisch', 'Ecologisch'], ['geschiedenis', 'Geschiedenis'], ['overheid', 'Overheid'], ['reserve', 'Reserve']];
export function verkenning(r) {
  const tab = r.tab || 'alles';
  const items = all('verkenning').filter(x => tab === 'alles' || x.domein === tab).sort((a, b) => (b.fit || 0) - (a.fit || 0));
  const tabs = DOMEINEN.map(([k, l]) => ({ label: l, href: `#/verkenning?tab=${k}`, active: tab === k }));
  const body = content(
    intro('Verkenning', 'Alle werkvelden die in beeld kwamen, ook de onverwachte, met een inschatting van de fit op vijf. Uit onderzoek 6 tot 9; grotendeels nog te verifiëren.'),
    h('div', { class: 'grid-cards grid-cards--wide' }, items.map(x => h('div', { class: `card card--pad accent-${{ erfgoed: 'orange', cultuur: 'violet', onderwijs: 'green', sociaal: 'red', ecologisch: 'green', geschiedenis: 'orange', overheid: 'grey', reserve: 'grey' }[x.domein] || 'grey'}` },
      h('div', { class: 'meta' }, spoorBadge(x.domein), fit(x.fit), badge(x.status, x.status === 'hoofdspoor' ? 'orange' : x.status === 'verkennen' ? 'violet' : 'grey')),
      h('p', { class: 'row-title' }, x.naam), h('p', { class: 'small' }, x.waarom),
      h('p', { class: 'small' }, h('strong', null, 'Rollen: '), x.rollen.join(', ')), h('p', { class: 'small' }, h('strong', null, 'Werkgevers: '), x.werkgevers.join('; ')),
      h('p', { class: 'small muted' }, `Vereisten: ${x.vereisten}`), h('p', { class: 'small muted' }, `Knelpunt: ${x.knelpunt || 'niet'}. Loon: ${x.loon}.`),
      h('div', { class: 'form__actions' }, sel([['hoofdspoor', 'Hoofdspoor'], ['verkennen', 'Verkennen'], ['reserve', 'Reserve'], ['vrijwillig', 'Vrijwilligerswerk'], ['laag', 'Laag'], ['niet', 'Niet']], x.status, v => upsert('verkenning', { id: x.id, status: v }), 'field'), ),
      h('textarea', { class: 'field', style: 'min-height:48px', placeholder: 'Notities van Remi of Giulia', value: x.notities || '', onChange: e => upsert('verkenning', { id: x.id, notities: e.target.value }) })))),
  );
  return { chrome: { where: 'Werkvelden', tabs, accent: 'violet', view: `${items.length} werkvelden`, viewIcon: 'compass' }, body };
}

// ---------- Opleidingen ----------
export function opleidingen(r) {
  const tab = r.tab || 'alles';
  const items = all('opleidingen').filter(x => tab === 'alles' || x.spoor === tab).sort((a, b) => (b.fit || 0) - (a.fit || 0));
  const tabs = [['alles', 'Alles'], ['erfgoed', 'Erfgoed'], ['cultuur', 'Cultuur'], ['onderwijs', 'Onderwijs'], ['sociaal', 'Sociaal'], ['geschiedenis', 'Geschiedenis'], ['reserve', 'Reserve']].map(([k, l]) => ({ label: l, href: `#/opleidingen?tab=${k}`, active: tab === k }));
  const body = content(
    intro('Opleidingen', 'Routes om te leren met inkomen: korte certificaten, graduaten met OKOT, de restauratorroute, VDAB-opleidingen. Beslissing uiterlijk 30 juni 2027.'),
    h('div', { class: 'callout' }, h('p', null, 'Drie manieren om te studeren met inkomen: (1) uitkering met VDAB-vrijstelling of OKOT, (2) herscholing via het ziekenfonds bij medisch vastgestelde ongeschiktheid voor het lasvak, (3) deeltijds werken met Vlaams opleidingsverlof of tijdskrediet. De voorwaarden staan in Rechten en in research/05.')),
    h('div', { class: 'grid-cards grid-cards--wide' }, items.map(x => h('div', { class: 'card card--pad' },
      h('div', { class: 'meta' }, spoorBadge(x.spoor), fit(x.fit), x.okot && badge('OKOT mogelijk', 'green'), x.knelpunt && badge(x.knelpunt, 'orange'), badge(x.status, 'grey')),
      h('p', { class: 'row-title' }, x.naam), h('p', { class: 'small muted' }, `${x.instelling}. ${x.duur}. ${x.formaat}.`), h('p', { class: 'small' }, x.toelichting),
      h('p', { class: 'small muted' }, `Kost: ${x.kost}. Financiering: ${x.financiering}.`), x.url && h('p', { class: 'small' }, ext(x.url)),
      h('div', { class: 'form__actions' }, sel([['aanbevolen', 'Aanbevolen'], ['kandidaat', 'Kandidaat'], ['verkennen', 'Verkennen'], ['langere termijn', 'Langere termijn'], ['gekozen', 'Gekozen'], ['niet', 'Niet']], x.status, v => upsert('opleidingen', { id: x.id, status: v }), 'field')),
      h('textarea', { class: 'field', style: 'min-height:48px', placeholder: 'Notities', value: x.notities || '', onChange: e => upsert('opleidingen', { id: x.id, notities: e.target.value }) })))),
  );
  return { chrome: { where: 'Leren met inkomen', tabs, accent: 'green', view: `${items.length} routes`, viewIcon: 'book' }, body };
}
