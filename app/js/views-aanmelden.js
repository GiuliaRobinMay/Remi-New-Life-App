// Aanmelden bij de centrale database: e-mailadres, dan de code uit de mail (of de link in die mail).
// Alleen de adressen die in de database toegang hebben, zien de gegevens.
import { h } from './ui.js';
import { syncStatus, stuurCode, bevestigCode, afmelden } from './sync.js';

const MK = 'remi-aanmeld-mail';
const st = { email: (() => { try { return localStorage.getItem(MK) || ''; } catch { return ''; } })(), stap: 'mail', bezig: false, melding: '', fout: false };
let herteken = () => {};

function zet(p) { Object.assign(st, p); herteken(); }

export function aanmeldScherm(opnieuw) {
  herteken = opnieuw;
  const s = syncStatus();
  if (s.modus === 'laden') return kaart(h('p', { class: 'muted' }, 'Even geduld, de app maakt verbinding met de database…'));
  if (s.modus === 'geen-toegang') {
    return kaart(
      h('p', null, `Je bent aangemeld als ${s.email}, maar dit adres heeft nog geen toegang tot de gegevens.`),
      h('p', { class: 'small muted' }, 'Alleen de adressen van Giulia en Remi hebben toegang. Gebruik een van die adressen, of vraag om dit adres toe te voegen.'),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', onClick: () => afmelden().then(() => zet({ stap: 'mail', melding: '' })) }, 'Afmelden en een ander adres gebruiken')));
  }
  const melding = st.melding && h('p', { class: 'small' + (st.fout ? ' mail-let' : ''), role: st.fout ? 'alert' : 'status' }, st.melding);
  if (st.stap === 'code') {
    let code = '';
    const versturen = async e => {
      e?.preventDefault();
      const schoon = code.replace(/\D/g, '');
      if (schoon.length < 6) { zet({ melding: 'Vul de code uit de mail in.', fout: true }); return; }
      zet({ bezig: true, melding: '' });
      try { await bevestigCode(st.email, schoon); zet({ bezig: false, stap: 'mail', melding: '' }); }
      catch (err) { zet({ bezig: false, melding: /expired|invalid|ongeldig|token/i.test(err.message) ? 'Die code klopt niet of is verlopen. Vraag een nieuwe code aan.' : `Aanmelden lukte niet. ${err.message}`, fout: true }); }
    };
    return kaart(
      h('p', null, 'We stuurden een mail naar ', h('strong', null, st.email), '.'),
      h('form', { class: 'form', onSubmit: versturen },
        h('label', null, 'Code uit de mail', h('input', { class: 'field aanmeld-code', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: 10, 'data-fk': 'aanmeld-code', placeholder: '123456', onInput: e => { code = e.target.value; } })),
        h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit', disabled: st.bezig }, st.bezig ? 'Even geduld…' : 'Aanmelden'))),
      h('p', { class: 'small muted' }, 'Staat er een link in de mail in plaats van een code? Tik erop op dit toestel; de app opent dan aangemeld.'),
      melding,
      h('div', { class: 'form__actions' },
        h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: () => vraagCode(st.email) }, 'Nieuwe code sturen'),
        h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: () => zet({ stap: 'mail', melding: '' }) }, 'Ander e-mailadres')));
  }
  let email = st.email;
  return kaart(
    h('p', null, 'Meld je aan met je e-mailadres. Je krijgt een mail met een code om in te vullen.'),
    h('form', { class: 'form', onSubmit: e => { e.preventDefault(); vraagCode(email); } },
      h('label', null, 'E-mailadres', h('input', { class: 'field', type: 'email', autocomplete: 'email', value: email, 'data-fk': 'aanmeld-mail', placeholder: 'naam@voorbeeld.be', onInput: e => { email = e.target.value; } })),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit', disabled: st.bezig }, st.bezig ? 'Even geduld…' : 'Stuur mij een code'))),
    melding,
    h('p', { class: 'small muted' }, 'Je blijft daarna aangemeld op dit toestel. Alleen Giulia en Remi hebben toegang tot de gegevens.'));
}

async function vraagCode(email) {
  const schoon = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoon)) { zet({ melding: 'Vul een geldig e-mailadres in.', fout: true }); return; }
  try { localStorage.setItem(MK, schoon); } catch { /* geen opslag */ }
  zet({ email: schoon, bezig: true, melding: '' });
  try { await stuurCode(schoon); zet({ bezig: false, stap: 'code', melding: 'Mail verstuurd. Kijk ook bij ongewenste mail.', fout: false }); }
  catch (err) { zet({ bezig: false, melding: /rate|seconds|too many/i.test(err.message) ? 'Je vroeg net al een code aan. Wacht een minuut en probeer opnieuw.' : `De mail kon niet verstuurd worden. ${err.message}`, fout: true }); }
}

function kaart(...inhoud) {
  return h('div', { class: 'aanmelden' }, h('section', { class: 'card card--pad aanmelden__kaart' },
    h('p', { class: 'eyebrow' }, 'Nieuwe start'),
    h('h1', { class: 'aanmelden__titel' }, 'Aanmelden'),
    ...inhoud));
}
