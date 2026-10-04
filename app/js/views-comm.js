// View: communicatie. Mails en brieven klaar om te kopiëren, en een logboek van elk contact.
import { h, icon, badge, fmtDate, todayIso, uid, copyText, toast } from './ui.js';
import { all, upsert, remove } from './store.js';
import { openPeek, closePeek } from './app.js';
import { content, intro, callout } from './views-core.js';

const KANALEN = [['mail', 'Mail'], ['brief', 'Brief'], ['telefoon', 'Telefoon'], ['gesprek', 'Gesprek'], ['bericht', 'Sms of chat']];
const RICHTING = [['uit', 'Remi aan de ander'], ['in', 'De ander aan Remi']];
const KANAALKLEUR = { mail: 'violet', brief: 'orange', telefoon: 'green', gesprek: 'green', bericht: 'grey' };
const haken = t => (String(t || '').match(/\[[^\]]+\]/g) || []).length;
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
  let wacht;
  const veld = h('textarea', { class: 'field', rows: b.soort === 'bericht' ? 4 : 14, 'data-fk': `msg-${b.id}`, value: b.tekst || '', onInput: e => { const t = e.target.value; telBij(t); clearTimeout(wacht); wacht = setTimeout(() => upsert('berichten', { id: b.id, tekst: t }, { silent: true }), 400); } });
  const tekst = () => veld.value;
  const verstuurd = b.status === 'verstuurd';
  return h('section', { class: 'card card--pad' },
    h('div', { class: 'meta' }, b.soort !== 'bericht' && badge(verstuurd ? `verstuurd ${fmtDate(b.verstuurdOp)}` : 'concept', verstuurd ? 'green' : 'grey'), h('span', null, `Aan: ${b.aan}`)),
    h('p', { class: 'row-title' }, b.titel),
    b.wanneer && h('p', { class: 'small muted' }, b.wanneer),
    b.soort === 'mail' && h('p', { class: 'small' }, h('strong', null, 'Onderwerp: '), b.onderwerp),
    h('label', { class: 'stack', style: 'gap:6px;margin-top:8px' }, h('span', { class: 'small muted' }, 'Tekst (wat je hier aanpast, blijft bewaard)'), veld),
    teller,
    h('div', { class: 'form__actions' },
      b.soort === 'mail' && h('button', { class: 'btn btn--ghost btn--sm', onClick: () => copyText(b.onderwerp) }, icon('copy', 12), h('span', { class: 'btn__label' }, 'Kopieer onderwerp')),
      h('button', { class: 'btn btn--primary btn--sm', onClick: () => copyText(tekst()) }, icon('copy', 12), h('span', { class: 'btn__label' }, { mail: 'Kopieer mail', brief: 'Kopieer brief', bericht: 'Kopieer bericht' }[b.soort])),
      b.soort === 'mail' && h('a', { class: 'btn btn--ghost btn--sm', href: `mailto:?subject=${encodeURIComponent(b.onderwerp)}&body=${encodeURIComponent(tekst())}`, onClick: e => { e.currentTarget.href = `mailto:?subject=${encodeURIComponent(b.onderwerp)}&body=${encodeURIComponent(tekst())}`; } }, icon('mail', 12), h('span', { class: 'btn__label' }, 'Open in mailprogramma')),
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
