// Aanmelden bij de centrale database met e-mailadres en wachtwoord. De eerste keer (of bij een vergeten
// wachtwoord) maak je je account met een eenmalige toegangscode, die Giulia of Remi in Instellingen aanmaakt.
// Een code hoort bij één e-mailadres en is 24 uur geldig. Wie al aangemeld is maar nog geen toegang heeft,
// vult alleen de code in (zonder wachtwoord). Alleen wie zo toegang heeft, ziet de gegevens.
// Afmelden op de tussenschermen sluit alleen de sessie: wat op dit toestel staat, blijft staan.
import { h } from './ui.js';
import { syncStatus, aanmelden, accountMaken, koppelCode, afmelden, probeerOpnieuw } from './sync.js';

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
const geldigeCode = c => String(c || '').replace(/[^A-Za-z0-9]/g, '').length >= 8;
function onthoud(email) { try { localStorage.setItem(MK, email); } catch { /* geen opslag */ } }
const geenVerbinding = 'Geen verbinding. Kijk of dit toestel internet heeft en probeer opnieuw.';
const blijftStaan = 'Afmelden wist niets: wat op dit toestel staat, blijft hier bewaard en gaat mee naar de database zodra je aanmeldt met een adres dat toegang heeft.';

// Afmelden op een tussenscherm: alleen de sessie sluiten, nooit de gegevens of bijlagen van dit toestel wissen.
async function afmeldenZonderWissen() {
  if (st.bezig) return;
  zet({ bezig: true, melding: '' });
  try {
    await afmelden({ wissen: false });
    zet({ bezig: false, stap: 'aanmelden', code: '', wachtwoord: '', herhaal: '', fout: false,
      melding: 'Afgemeld. De gegevens op dit toestel blijven staan; er is niets gewist.' });
  } catch (err) {
    zet({ bezig: false, fout: true, melding: `Afmelden lukte niet. ${err?.message || ''}`.trim() });
  }
}

export function aanmeldScherm(opnieuw) {
  herteken = opnieuw;
  const s = syncStatus();
  const afmeldKnop = tekst => h('button', { class: 'btn btn--quiet btn--sm', type: 'button', 'data-actie': 'afmelden-zonder-wissen', disabled: st.bezig, onClick: afmeldenZonderWissen }, tekst);
  const melding = st.melding && h('p', { class: 'small' + (st.fout ? ' mail-let' : ''), role: st.fout ? 'alert' : 'status' }, st.melding);
  if (s.modus === 'laden') return kaart('Even geduld', h('p', { class: 'muted' }, 'De app maakt verbinding met de database…'));
  if (s.modus === 'controle') {
    return kaart('Toegang nakijken',
      h('p', null, 'De app kijkt na of ', h('strong', null, s.email || 'dit adres'), ' toegang heeft. Dat lukt nu niet.'),
      s.fout && h('p', { class: 'small muted' }, s.fout),
      h('p', { class: 'small muted' }, 'Ze probeert het vanzelf opnieuw. Is er geen internet op dit toestel? Zet het aan en probeer opnieuw.'),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'button', onClick: () => probeerOpnieuw() }, 'Opnieuw proberen'), afmeldKnop('Afmelden')),
      melding,
      h('p', { class: 'small muted' }, blijftStaan));
  }
  if (s.modus === 'ophalen') {
    return kaart('Alles ophalen',
      h('p', null, 'Eerste keer op dit toestel: de app haalt alle gegevens op uit de database. Dat duurt even.'),
      h('p', { class: 'small muted' }, 'Je ziet de app zodra alles binnen is.'));
  }
  if (s.modus === 'offline' || s.modus === 'fout') {
    // Alleen hier als dit toestel nog nooit alles opgehaald heeft. Wat hier al staat, wacht op de database.
    const open = (s.wachtend || 0) + (s.mislukt || 0);
    return kaart(open ? 'Nog niet alles in de database' : 'Nog geen gegevens op dit toestel',
      h('p', null, s.modus === 'offline' ? 'Er is geen verbinding met de database.' : 'Ophalen uit de database lukte niet.'),
      s.fout && h('p', { class: 'small muted' }, s.fout),
      open > 0 && h('p', { class: 'small', 'data-wacht-op-database': String(open) },
        open === 1 ? 'Op dit toestel staat 1 wijziging die nog naar de database moet. Ze blijft hier bewaard tot het lukt.'
          : `Op dit toestel staan ${open} wijzigingen die nog naar de database moeten. Ze blijven hier bewaard tot het lukt.`),
      h('p', { class: 'small muted' }, 'De app probeert het vanzelf opnieuw.'),
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'button', onClick: () => probeerOpnieuw() }, 'Opnieuw proberen'), afmeldKnop('Afmelden')),
      melding,
      h('p', { class: 'small muted' }, blijftStaan));
  }
  if (s.modus === 'geen-toegang') {
    return kaart('Nog geen toegang',
      h('p', null, 'Je bent aangemeld als ', h('strong', null, s.email), ', maar dit adres heeft nog geen toegang tot de gegevens.'),
      h('p', { class: 'small muted' }, 'Kreeg je een toegangscode voor dit adres? Vul ze hieronder in; je wachtwoord blijft hetzelfde. Kreeg je toegang met een ander adres? Meld dan af en meld aan met dat adres.'),
      koppelFormulier(), melding,
      h('div', { class: 'form__actions' }, afmeldKnop('Afmelden en een ander adres gebruiken')),
      h('p', { class: 'small muted' }, blijftStaan));
  }
  if (st.stap === 'code') {
    return kaart('Account maken',
      h('p', null, 'Vul het e-mailadres in waarvoor je de toegangscode kreeg, de code zelf, en kies een wachtwoord. Heb je al een account en ben je je wachtwoord vergeten? Dan kies je hier een nieuw wachtwoord; op je andere toestellen meld je daarna opnieuw aan.'),
      h('p', { class: 'small muted' }, 'Een toegangscode werkt één keer, alleen voor het e-mailadres waarvoor ze gemaakt werd, en is 24 uur geldig.'),
      codeFormulier(), melding,
      h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--quiet btn--sm', type: 'button', onClick: () => zet({ stap: 'aanmelden', melding: '', fout: false }) }, 'Terug naar aanmelden')));
  }
  const versturen = async e => {
    e?.preventDefault();
    if (st.bezig) return;
    const email = st.email.trim().toLowerCase();
    if (!geldigAdres(email)) { zet({ melding: 'Vul een geldig e-mailadres in.', fout: true }); return; }
    if (!st.wachtwoord) { zet({ melding: 'Vul je wachtwoord in.', fout: true }); return; }
    onthoud(email);
    zet({ email, bezig: true, melding: '' });
    try { await aanmelden(email, st.wachtwoord); zet({ bezig: false, wachtwoord: '', melding: '' }); }
    catch (err) {
      zet({ bezig: false, fout: true, melding: err.verkeerd ? 'Dit e-mailadres en wachtwoord passen niet bij elkaar. Wachtwoord vergeten? Gebruik een toegangscode.'
        : err.offline ? geenVerbinding : `Aanmelden lukte niet. ${err.message}` });
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
      h('button', { class: 'linkknop', type: 'button', onClick: () => zet({ stap: 'code', melding: '', fout: false, wachtwoord: '' }) }, 'Gebruik een toegangscode')),
    h('p', { class: 'small muted' }, 'Alleen Giulia en Remi hebben toegang tot de gegevens.'));
}

const codeVeld = fk => h('label', null, 'Toegangscode', h('input', { class: 'field aanmeld-code', autocomplete: 'one-time-code', autocapitalize: 'characters', spellcheck: 'false', maxlength: 14, value: st.code, 'data-fk': fk, placeholder: 'ABCDE-FGH23', onInput: e => { st.code = e.target.value; } }));

// Aangemeld, maar nog geen toegang: alleen de code inwisselen. De aanmelding bewijst al wie het is, dus geen wachtwoord.
function koppelFormulier() {
  const versturen = async e => {
    e?.preventDefault();
    if (st.bezig) return;
    if (!geldigeCode(st.code)) { zet({ melding: 'Vul de toegangscode in, bijvoorbeeld ABCDE-FGH23.', fout: true }); return; }
    zet({ bezig: true, melding: '' });
    try {
      await koppelCode(st.code.trim());
      zet({ bezig: false, code: '', melding: '', fout: false });
    } catch (err) {
      zet({ bezig: false, fout: true, melding: err.offline ? geenVerbinding : (err.message || 'De code kon niet gebruikt worden.') });
    }
  };
  return h('form', { class: 'form', onSubmit: versturen, 'data-koppel': '' },
    codeVeld('koppel-code'),
    h('div', { class: 'form__actions' }, h('button', { class: 'btn btn--primary', type: 'submit', disabled: st.bezig }, st.bezig ? 'Even geduld…' : 'Code gebruiken')));
}

// Account maken of een nieuw wachtwoord kiezen met een toegangscode (niet aangemeld).
function codeFormulier() {
  const versturen = async e => {
    e?.preventDefault();
    if (st.bezig) return;
    const email = st.email.trim().toLowerCase();
    if (!geldigAdres(email)) { zet({ melding: 'Vul een geldig e-mailadres in.', fout: true }); return; }
    if (!geldigeCode(st.code)) { zet({ melding: 'Vul de toegangscode in, bijvoorbeeld ABCDE-FGH23.', fout: true }); return; }
    if (st.wachtwoord.length < 8) { zet({ melding: 'Kies een wachtwoord van minstens 8 tekens.', fout: true }); return; }
    if (st.wachtwoord !== st.herhaal) { zet({ melding: 'De twee wachtwoorden zijn niet gelijk.', fout: true }); return; }
    onthoud(email);
    zet({ email, bezig: true, melding: '' });
    try {
      await accountMaken(email, st.wachtwoord, st.code.trim());
      zet({ bezig: false, stap: 'aanmelden', code: '', wachtwoord: '', herhaal: '', melding: '', fout: false });
    } catch (err) {
      zet({ bezig: false, fout: true, melding: err.offline ? geenVerbinding : err.message });
    }
  };
  return h('form', { class: 'form', onSubmit: versturen },
    h('label', null, 'E-mailadres', h('input', { class: 'field', type: 'email', name: 'email', autocomplete: 'username', value: st.email, 'data-fk': 'code-mail', placeholder: 'naam@voorbeeld.be', onInput: e => { st.email = e.target.value; } })),
    codeVeld('code-code'),
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
