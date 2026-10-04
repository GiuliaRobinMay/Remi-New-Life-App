// Dossier: ontvangen en verstuurde brieven, attesten en andere documenten, met foto's als bijlage.
// Alles blijft in deze browser: de tekst in de app-gegevens, de bestanden in IndexedDB (bijlagen.js).
import { h, icon, badge, fmtDate, todayIso, uid, md, toast } from './ui.js';
import { all, get, upsert, remove } from './store.js';
import { openPeek, closePeek } from './app.js';
import { bewaarBijlage, leesBijlage, wisBijlage } from './bijlagen.js';

const SOORTEN = [['brief-in', 'Brief ontvangen'], ['brief-uit', 'Brief verstuurd'], ['contract', 'Contract of reglement'], ['loonfiche', 'Loonfiche'], ['attest', 'Attest'], ['ander', 'Ander document']];
const SOORTKLEUR = { 'brief-in': 'red', 'brief-uit': 'violet', contract: 'green', loonfiche: 'green', attest: 'orange', ander: 'grey' };
const soortLabel = s => SOORTEN.find(x => x[0] === s)?.[1] || s;

export function dossierTab() {
  const docs = all('dossier').sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
  return h('div', { class: 'stack' },
    h('section', { class: 'card card--pad callout' },
      h('p', { class: 'row-title' }, 'Alles op één plek'),
      h('p', null, 'Bewaar hier elke brief van en naar de werkgever, attesten, loonfiches en het contract. Voeg een foto toe van elke pagina. Alles blijft op dit toestel; foto\'s zitten niet in de export, dus bewaar ook altijd het origineel.'),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary btn--sm', onClick: () => dossierForm() }, icon('plus', 12), 'Document toevoegen'))),
    docs.length ? h('div', { class: 'grid-cards' }, docs.map(d => h('section', { class: 'card card--pad' },
      h('div', { class: 'meta' }, badge(soortLabel(d.soort), SOORTKLEUR[d.soort] || 'grey'), d.aangetekend && badge('aangetekend', 'orange'), d.datum && h('span', null, fmtDate(d.datum))),
      h('p', { class: 'row-title' }, d.titel),
      d.van && h('p', { class: 'small muted' }, d.van),
      d.samenvatting && h('p', { class: 'small' }, d.samenvatting),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--ghost btn--sm', onClick: () => dossierPeek(d.id) }, 'Openen'), h('span', { class: 'small muted' }, `${(d.bijlagen || []).length} ${(d.bijlagen || []).length === 1 ? 'bijlage' : 'bijlagen'}`)))))
      : h('div', { class: 'card empty' }, 'Nog geen documenten. Voeg er een toe met de knop hierboven, of importeer een bestand via Instellingen.'));
}

function bijlagenBlok(d) {
  const lijst = h('div', { class: 'bijlagen' });
  for (const b of d.bijlagen || []) {
    const vak = h('figure', { class: 'bijlage' }, h('span', { class: 'small muted' }, 'Laden…'));
    lijst.append(vak);
    leesBijlage(b.id).then(blob => {
      if (!blob) { vak.replaceChildren(h('span', { class: 'small muted' }, `${b.naam}: niet op dit toestel`)); return; }
      const url = URL.createObjectURL(blob);
      const beeld = (b.type || blob.type || '').startsWith('image/') ? h('img', { src: url, alt: b.naam }) : h('span', { class: 'bijlage__pdf' }, icon('doc', 20));
      vak.replaceChildren(h('a', { href: url, target: '_blank', rel: 'noopener' }, beeld), h('figcaption', { class: 'small' }, b.naam, ' ',
        h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: async () => { if (!confirm(`${b.naam} verwijderen?`)) return; await wisBijlage(b.id).catch(() => {}); upsert('dossier', { id: d.id, bijlagen: (get('dossier', d.id).bijlagen || []).filter(x => x.id !== b.id) }); } }, 'Verwijderen')));
    }).catch(() => vak.replaceChildren(h('span', { class: 'small muted' }, 'Bijlage kon niet geladen worden.')));
  }
  const kies = h('input', { type: 'file', accept: 'image/*,application/pdf', multiple: true, style: 'display:none', onChange: async e => {
    const nieuw = [];
    for (const f of e.target.files) { const id = `${d.id}/${uid()}`; try { await bewaarBijlage(id, f); nieuw.push({ id, naam: f.name, type: f.type }); } catch { toast(`${f.name} kon niet bewaard worden`); } }
    if (nieuw.length) { upsert('dossier', { id: d.id, bijlagen: [...(get('dossier', d.id).bijlagen || []), ...nieuw] }); toast(nieuw.length === 1 ? 'Foto toegevoegd' : `${nieuw.length} bestanden toegevoegd`); }
  } });
  return h('section', { class: 'stack', style: 'gap:8px' },
    h('p', { class: 'eyebrow' }, 'Foto\'s en bestanden'),
    (d.bijlagen || []).length ? lijst : h('p', { class: 'small muted' }, 'Nog geen foto. Neem een foto van elke pagina.'),
    h('label', { class: 'btn btn--ghost btn--sm', style: 'align-self:flex-start' }, icon('upload', 12), 'Foto of pdf toevoegen', kies));
}

export function dossierPeek(id) {
  openPeek(() => get('dossier', id)?.titel || 'Document', () => {
    const d = get('dossier', id);
    if (!d) return h('p', { class: 'muted' }, 'Dit document bestaat niet meer.');
    return h('div', { class: 'stack' },
      h('div', { class: 'meta' }, badge(soortLabel(d.soort), SOORTKLEUR[d.soort] || 'grey'), d.aangetekend && badge('aangetekend', 'orange'), d.datum && h('span', null, fmtDate(d.datum)), d.ontvangen && h('span', null, `ontvangen ${fmtDate(d.ontvangen)}`)),
      d.van && h('p', null, h('strong', null, 'Van: '), d.van),
      d.aan && h('p', null, h('strong', null, 'Aan: '), d.aan),
      d.samenvatting && h('p', null, d.samenvatting),
      bijlagenBlok(d),
      d.analyse && h('section', { class: 'stack', style: 'gap:6px' }, h('p', { class: 'eyebrow' }, 'Analyse'), md(d.analyse)),
      d.tekst && h('details', null, h('summary', null, 'Volledige tekst'), h('div', { class: 'small', style: 'white-space:pre-wrap;margin-top:8px' }, d.tekst)),
      d.notities && h('section', null, h('p', { class: 'eyebrow' }, 'Notities'), h('p', { style: 'white-space:pre-wrap' }, d.notities)),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--ghost btn--sm', onClick: () => dossierForm(d) }, 'Bewerken'), d.link && h('a', { class: 'btn btn--ghost btn--sm', href: d.link }, d.linkLabel || 'Verder')));
  });
}

function dossierForm(init = {}) {
  const d = { id: init.id, titel: init.titel || '', datum: init.datum || todayIso(), ontvangen: init.ontvangen || '', van: init.van || '', aan: init.aan || '', soort: init.soort || 'brief-in', aangetekend: !!init.aangetekend, samenvatting: init.samenvatting || '', tekst: init.tekst || '', notities: init.notities || '' };
  openPeek(d.id ? 'Document bewerken' : 'Document toevoegen', () => {
    const inp = (k, type = 'text') => h('input', { class: 'field', type, value: d[k], onInput: e => d[k] = e.target.value });
    const area = (k, min = 120) => h('textarea', { class: 'field', style: `min-height:${min}px`, value: d[k], onInput: e => d[k] = e.target.value });
    return h('form', { class: 'form', onSubmit: e => { e.preventDefault(); if (!d.titel) return; const nieuw = !d.id; const saved = upsert('dossier', { ...d, id: d.id || 'dos-' + uid() }); toast('Bewaard'); if (nieuw) dossierPeek(saved.id); else closePeek(); } },
      h('label', null, 'Titel', inp('titel')),
      h('div', { class: 'form__row' }, h('label', null, 'Soort', h('select', { class: 'field', onChange: e => d.soort = e.target.value }, SOORTEN.map(([v, l]) => h('option', { value: v, selected: d.soort === v }, l)))), h('label', { class: 'inline-check' }, h('input', { type: 'checkbox', checked: d.aangetekend, onChange: e => d.aangetekend = e.target.checked }), 'Aangetekend')),
      h('div', { class: 'form__row' }, h('label', null, 'Datum op het document', inp('datum', 'date')), h('label', null, 'Ontvangen of verstuurd op', inp('ontvangen', 'date'))),
      h('div', { class: 'form__row' }, h('label', null, 'Van', inp('van')), h('label', null, 'Aan', inp('aan'))),
      h('label', null, 'Korte samenvatting', area('samenvatting', 80)),
      h('label', null, 'Volledige tekst (overtypen of plakken)', area('tekst', 160)),
      h('label', null, 'Notities', area('notities', 80)),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit' }, 'Bewaren'), d.id && h('button', { class: 'btn btn--danger', type: 'button', onClick: async () => {
        if (!confirm('Dit document en zijn foto\'s verwijderen?')) return;
        for (const b of get('dossier', d.id)?.bijlagen || []) await wisBijlage(b.id).catch(() => {});
        remove('dossier', d.id); closePeek();
      } }, 'Verwijderen')));
  });
}
