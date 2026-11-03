// Aanmelden bij de centrale database met e-mailadres en wachtwoord. De eerste keer (of bij een vergeten
// wachtwoord) maak je je account met een eenmalige toegangscode, die Giulia of Remi in Instellingen aanmaakt.
// Alleen wie zo een account heeft, ziet de gegevens. Er komen geen aanmeldmails aan te pas.
import { h } from './ui.js';
import { syncStatus, aanmelden, accountMaken, afmelden, probeerOpnieuw } from './sync.js';

const MK = 'remi-aanmeld-mail';
const st = {
  email: (() => { try { return localStorage.getItem(MK) || ''; } catch { return ''; } })(),
  stap: 'aanmelden', // of 'code'
  code: '', wachtwoord: '', herhaal: '',
  bezig: false, melding: '', fout: false,
};
let herteken = () => {};
function zet(p) { Object.assign(st, p); herteken(); }
const geldigAdres = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
function onthoud(email) { try { localStorage.setItem(MK, email); } catch { /* geen opslag */ } }

export function aanmeldScherm(opnieuw) {
  herteken = opnieuw;
  const s = syncStatus();
  const afmeldKnop = tekst => h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: () => afmelden().then(() => zet({ stap: 'aanmelden', melding: '', wachtwoord: '' })) }, tekst);
  if (s.modus === 'laden') return kaart('Even geduld', h('p', { class: 'muted' }, 'De app maakt verbinding met de database…'));
  if (s.modus === 'controle') {
    return kaart('Toegang nakijken',
      h('p', null, 'De app kijkt na of ', h('strong', null, s.email || 'dit adres'), ' toegang heeft. Dat lukt nu niet.'),
      s.fout && h('p', { class: 'small muted' }, s.fout),
      h('p', { class: 'small muted' }, 'Ze probeert het vanzelf opnieuw. Is er geen internet op dit toestel? Zet het aan en probeer opnieuw.'),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'button', onClick: () => probeerOpnieuw() }, 'Opnieuw proberen'), afmeldKnop('Afmelden')));
  }
  if (s.modus === 'ophalen') {
    return kaart('Alles ophalen',
      h('p', null, 'Eerste keer op dit toestel: de app haalt alle gegevens op uit de database. Dat duurt even.'),
      h('p', { class: 'small muted' }, 'Je ziet de app zodra alles binnen is.'));
  }
  if (s.modus === 'offline' || s.modus === 'fout') {
    // Alleen hier als dit toestel nog nooit alles opgehaald heeft: dan is er niets om te tonen.
    return kaart('Nog geen gegevens op dit toestel',
      h('p', null, s.modus === 'offline' ? 'Er is geen verbinding met de database.' : 'Ophalen uit de database lukte niet.'),
      s.fout && h('p', { class: 'small muted' }, s.fout),
      h('p', { class: 'small muted' }, 'De app probeert het vanzelf opnieuw.'),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'button', onClick: () => probeerOpnieuw() }, 'Opnieuw proberen'), afmeldKnop('Afmelden')));
  }
  const melding = st.melding && h('p', { class: 'small' + (st.fout ? ' mail-let' : ''), role: st.fout ? 'alert' : 'status' }, st.melding);
  if (s.modus === 'geen-toegang') {
    return kaart('Nog geen toegang',
      h('p', null, `Je bent aangemeld als ${s.email}, maar dit adres heeft nog geen toegang tot de gegevens.`),
      h('p', { class: 'small muted' }, 'Heb je een toegangscode gekregen? Vul ze hieronder in. Anders: meld af en gebruik het adres waarmee je toegang kreeg.'),
      codeFormulier(s.email), melding,
      h('div', { class: 'form__actions' }, afmeldKnop('Afmelden en een ander adres gebruiken')));
  }
  if (st.stap === 'code') {
    return kaart('Account maken',
      h('p', null, 'Vul je e-mailadres in, de toegangscode die je kreeg, en kies een wachtwoord. Heb je al een account en ben je je wachtwoord vergeten? Dan krijg je zo een nieuw wachtwoord.'),
      codeFormulier(''), melding,
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: () => zet({ stap: 'aanmelden', melding: '' }) }, 'Terug naar aanmelden')));
  }
  const versturen = async e => {
    e?.preventDefault();
    const email = st.email.trim().toLowerCase();
    if (!geldigAdres(email)) { zet({ melding: 'Vul een geldig e-mailadres in.', fout: true }); return; }
    if (!st.wachtwoord) { zet({ melding: 'Vul je wachtwoord in.', fout: true }); return; }
    onthoud(email);
    zet({ email, bezig: true, melding: '' });
    try { await aanmelden(email, st.wachtwoord); zet({ bezig: false, wachtwoord: '', melding: '' }); }
    catch (err) {
      zet({ bezig: false, fout: true, melding: err.verkeerd ? 'Dit e-mailadres en wachtwoord passen niet bij elkaar. Wachtwoord vergeten? Gebruik een toegangscode.'
        : err.offline ? 'Geen verbinding. Kijk of dit toestel internet heeft en probeer opnieuw.' : `Aanmelden lukte niet. ${err.message}` });
    }
  };
  return kaart('Aanmelden',
    h('p', null, 'Meld je aan met je e-mailadres en wachtwoord. Je blijft daarna aangemeld op dit toestel.'),
    h('form', { class: 'form', onSubmit: versturen },
      h('label', null, 'E-mailadres', h('input', { class: 'field', type: 'email', name: 'email', autocomplete: 'username', value: st.email, 'data-fk': 'aanmeld-mail', placeholder: 'naam@voorbeeld.be', onInput: e => { st.email = e.target.value; } })),
      h('label', null, 'Wachtwoord', h('input', { class: 'field', type: 'password', name: 'password', autocomplete: 'current-password', value: st.wachtwoord, 'data-fk': 'aanmeld-ww', onInput: e => { st.wachtwoord = e.target.value; } })),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit', disabled: st.bezig }, st.bezig ? 'Even geduld…' : 'Aanmelden'))),
    melding,
    h('p', { class: 'small muted' }, 'Eerste keer, of wachtwoord vergeten? ',
      h('button', { class: 'linkknop', type: 'button', onClick: () => zet({ stap: 'code', melding: '', wachtwoord: '' }) }, 'Gebruik een toegangscode')),
    h('p', { class: 'small muted' }, 'Alleen Giulia en Remi hebben toegang tot de gegevens.'));
}

// Account maken of een nieuw wachtwoord kiezen met een toegangscode. Bij 'geen toegang' ligt het adres vast.
function codeFormulier(vastAdres) {
  const versturen = async e => {
    e?.preventDefault();
    const email = (vastAdres || st.email).trim().toLowerCase();
    if (!geldigAdres(email)) { zet({ melding: 'Vul een geldig e-mailadres in.', fout: true }); return; }
    if (st.code.replace(/[^A-Za-z0-9]/g, '').length < 8) { zet({ melding: 'Vul de toegangscode in, bijvoorbeeld ABCDE-FGH23.', fout: true }); return; }
    if (st.wachtwoord.length < 8) { zet({ melding: 'Kies een wachtwoord van minstens 8 tekens.', fout: true }); return; }
    if (st.wachtwoord !== st.herhaal) { zet({ melding: 'De twee wachtwoorden zijn niet gelijk.', fout: true }); return; }
    onthoud(email);
    zet({ email, bezig: true, melding: '' });
    try {
      await accountMaken(email, st.wachtwoord, st.code);
      zet({ bezig: false, stap: 'aanmelden', code: '', wachtwoord: '', herhaal: '', melding: '' });
    } catch (err) {
      zet({ bezig: false, fout: true, melding: err.offline ? 'Geen verbinding. Kijk of dit toestel internet heeft en probeer opnieuw.' : err.message });
    }
  };
  return h('form', { class: 'form', onSubmit: versturen },
    !vastAdres && h('label', null, 'E-mailadres', h('input', { class: 'field', type: 'email', name: 'email', autocomplete: 'username', value: st.email, 'data-fk': 'code-mail', placeholder: 'naam@voorbeeld.be', onInput: e => { st.email = e.target.value; } })),
    vastAdres && h('input', { type: 'email', name: 'email', autocomplete: 'username', value: vastAdres, hidden: true, readonly: true }),
    h('label', null, 'Toegangscode', h('input', { class: 'field aanmeld-code', autocomplete: 'one-time-code', autocapitalize: 'characters', spellcheck: 'false', maxlength: 14, value: st.code, 'data-fk': 'code-code', placeholder: 'ABCDE-FGH23', onInput: e => { st.code = e.target.value; } })),
    h('label', null, 'Kies een wachtwoord (minstens 8 tekens)', h('input', { class: 'field', type: 'password', name: 'new-password', autocomplete: 'new-password', minlength: 8, value: st.wachtwoord, 'data-fk': 'code-ww', onInput: e => { st.wachtwoord = e.target.value; } })),
    h('label', null, 'Herhaal het wachtwoord', h('input', { class: 'field', type: 'password', autocomplete: 'new-password', minlength: 8, value: st.herhaal, 'data-fk': 'code-ww2', onInput: e => { st.herhaal = e.target.value; } })),
    h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit', disabled: st.bezig }, st.bezig ? 'Even geduld…' : 'Account maken en aanmelden')));
}

function kaart(titel, ...inhoud) {
  return h('div', { class: 'aanmelden' }, h('section', { class: 'card card--pad aanmelden__kaart' },
    h('p', { class: 'eyebrow' }, 'Nieuwe start'),
    h('h1', { class: 'aanmelden__titel' }, titel),
    ...inhoud));
}
