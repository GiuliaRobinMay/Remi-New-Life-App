// Router, navigatie, chrome en peek. De views staan in views-*.js.
import { h, icon, toast } from './ui.js';
import { subscribe, all, ref } from './store.js';
import * as core from './views-core.js';
import * as werk from './views-werk.js';
import * as cvmod from './views-cv.js';
import * as comm from './views-comm.js';

const views = { ...core, ...werk, ...cvmod, ...comm };
// Accentkleuren wisselen zodat buren verschillen (thema: kleur is decoratie). De chrome van elke zone gebruikt dezelfde kleur als het icoon in de zijbalk.
const NAV = [
  { group: null, items: [{ id: 'overzicht', label: 'Overzicht', icon: 'home', accent: 'violet' }] },
  { group: 'Traject', items: [
    { id: 'stappenplan', label: 'Stappenplan', icon: 'check', accent: 'green', count: () => all('stappenplan').filter(s => s.status !== 'klaar').length },
    { id: 'planning', label: 'Planning', icon: 'calendar', accent: 'orange' },
    { id: 'rechten', label: 'Rechten', icon: 'shield', accent: 'red' },
    { id: 'communicatie', label: 'Communicatie', icon: 'edit', accent: 'violet', count: () => all('berichten').filter(b => b.status !== 'verstuurd').length },
  ] },
  { group: 'Werk', items: [
    { id: 'sollicitaties', label: 'Sollicitaties', icon: 'mail', accent: 'violet', count: () => all('sollicitaties').filter(s => !['afgewezen', 'gearchiveerd'].includes(s.status)).length },
    { id: 'vacatures', label: 'Vacatures', icon: 'search', accent: 'green', count: () => all('vacatures').filter(v => v.status !== 'niet').length },
    { id: 'hotlist', label: 'Hotlist', icon: 'star', accent: 'orange', count: () => all('hotlist').length },
    { id: 'verkenning', label: 'Verkenning', icon: 'compass', accent: 'red' },
    { id: 'opleidingen', label: 'Opleidingen', icon: 'book', accent: 'violet' },
  ] },
  { group: 'Remi', items: [
    { id: 'cv', label: 'Cv-atelier', icon: 'doc', accent: 'green', count: () => cvmod.cvScore() },
    { id: 'vragenlijst', label: 'Vragenlijst', icon: 'list', accent: 'orange', count: () => { const v = all('antwoorden').filter(a => a.tekst && a.tekst.trim()).length; const t = (ref.vragenlijst?.secties || []).reduce((n, s) => n + s.vragen.length, 0); return v ? `${v}/${t}` : String(t); } },
    { id: 'profiel', label: 'Profiel', icon: 'user', accent: 'red' },
    { id: 'documenten', label: 'Documenten', icon: 'print', accent: 'violet' },
  ] },
];
const flat = NAV.flatMap(g => g.items);
const KNOWN = new Set(flat.map(x => x.id));
const shell = document.getElementById('shell');
const sidebar = document.getElementById('sidebar');
const portal = document.getElementById('portal');
const chrome = document.getElementById('chrome');
const navEl = document.getElementById('nav');
const mobiel = () => window.matchMedia('(max-width: 900px)').matches;

// Route: #/<view>/<param>?tab=...&q=...  De query wordt eerst afgesplitst.
function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const [id, ...rest] = (path || 'overzicht').split('/');
  const qs = new URLSearchParams(query || '');
  return { id: KNOWN.has(id) ? id : 'overzicht', params: rest, tab: qs.get('tab'), q: qs.get('q') || '', m: qs.get('m') || '' };
}
export function go(path) { location.hash = '#/' + path; }

function renderNav(active) {
  navEl.replaceChildren(...NAV.map(g => h('div', { class: 'sidebar__group' },
    g.group && h('p', { class: 'eyebrow' }, g.group),
    g.items.map(it => h('a', { class: 'sidebar__item' + (it.id === active ? ' sidebar__item--active' : ''), href: '#/' + it.id, title: it.label, onClick: () => setNav(false) },
      h('span', { class: `icon-chip icon-chip--sm accent-${it.accent}` }, icon(it.icon, 14)),
      h('span', { class: 'sidebar__label' }, it.label),
      it.count ? h('span', { class: 'sidebar__count' }, String(it.count())) : null,
    )),
  )));
  document.getElementById('navFoot').textContent = `Gegevens lokaal in deze browser. Seed van ${ref.gebouwdOp ? ref.gebouwdOp.slice(0, 10) : ''}.`;
}

function renderChrome(cfg, active) {
  const nav = flat.find(x => x.id === active);
  chrome.className = `chrome accent-${nav.accent}`;
  const tabDefs = cfg.tabs && cfg.tabs.length ? cfg.tabs : [{ label: cfg.tabLabel || 'Alles', href: '#/' + active, active: true }];
  const tabs = tabDefs.map(t => h('span', { class: 'tabs__slot' },
    t.divider ? h('span', { class: 'tabs__divider' }) : null,
    h('a', { class: 'tabs__item' + (t.active ? ' tabs__item--active' : ''), href: t.href }, t.label)));
  const strip = h('div', { class: 'chrome__tabs' + (tabDefs.length > 6 ? ' chrome__tabs--scroll' : '') }, h('nav', { class: 'tabs' }, tabs));
  chrome.replaceChildren(
    h('div', { class: 'chrome__top' },
      h('div', { class: 'chrome__id' }, h('span', { class: 'chrome__mark' }, icon(nav.icon, 22)), h('span', { class: 'chrome__name' }, cfg.title || nav.label)),
      h('div', { class: 'chrome__where' }, cfg.where || ''),
      h('div', { class: 'chrome__actions' }, h('button', { class: 'chrome__iconbtn', 'aria-label': 'Instellingen', title: 'Instellingen en synchronisatie', onClick: () => views.instellingenPeek() }, icon('gear'))),
    ),
    strip,
    h('div', { class: 'chrome__tool' },
      h('button', { class: 'chrome__burger', 'aria-label': 'Menu', onClick: () => setNav(!shell.classList.contains('shell--nav-open')) }, icon('burger')),
      h('span', { class: 'chrome__viewicon' }, icon(cfg.viewIcon || 'list', 16)),
      h('span', { class: 'chrome__view' }, cfg.view || (tabDefs.find(t => t.active) || tabDefs[0]).label),
      h('div', { class: 'chrome__spacer' }),
      ...(cfg.tool || []),
    ),
  );
  // Knoppen in de werkbalk: tekst in een label dat op een smal scherm wegvalt; het icoon blijft met een aria-label.
  chrome.querySelectorAll('.chrome__tool .btn').forEach(b => {
    const tekst = [...b.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (!tekst || b.querySelector('.btn__label')) return;
    [...b.childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove());
    b.append(h('span', { class: 'btn__label' }, tekst));
    b.setAttribute('aria-label', tekst); b.title = tekst;
  });
  // Te veel tabs voor de breedte: de strook scrolt in plaats van de pagina te verbreden.
  if (strip.scrollWidth > strip.clientWidth + 1) strip.classList.add('chrome__tabs--scroll');
  // Houd de actieve tab zichtbaar in een scrollende tabstrook.
  const act = strip.querySelector('.tabs__item--active');
  if (act && strip.scrollWidth > strip.clientWidth) strip.scrollLeft = Math.max(0, act.offsetLeft - 24);
}

// Focus bewaren over een herteken: velden met data-fk krijgen hun focus en cursor terug.
function captureFocus() {
  const el = document.activeElement;
  if (!el || !el.dataset || !el.dataset.fk) return null;
  return { fk: el.dataset.fk, start: el.selectionStart, end: el.selectionEnd };
}
function restoreFocus(f) {
  if (!f) return;
  const el = document.querySelector(`[data-fk="${CSS.escape(f.fk)}"]`);
  if (!el) return;
  el.focus({ preventScroll: true });
  try { if (f.start != null) el.setSelectionRange(f.start, f.end); } catch { /* niet elk veld kent een selectie */ }
}

function render() {
  const r = route();
  const focus = captureFocus();
  renderNav(r.id);
  const out = views[r.id](r);
  renderChrome(out.chrome || {}, r.id);
  portal.replaceChildren(out.body);
  const last = render.last || {};
  // Naar een andere pagina: een open zijpaneel hoort bij de vorige pagina en gaat dicht.
  if (last.id && r.id !== last.id && peek.classList.contains('peek--open')) closePeek();
  if (r.id !== last.id || r.tab !== last.tab) window.scrollTo(0, 0);
  render.last = r;
  restoreFocus(focus);
}
window.addEventListener('hashchange', render);
subscribe(() => { render(); if (peekRerender) peekRerender(); });

// Zijbalk: op een klein scherm schuift hij in en uit; op een groot scherm klapt hij in tot iconen.
function lock() { document.body.classList.toggle('is-locked', shell.classList.contains('shell--nav-open') || peek.classList.contains('peek--open')); }
function setNav(open) { shell.classList.toggle('shell--nav-open', open); lock(); }
document.getElementById('navBackdrop').addEventListener('click', () => setNav(false));
document.getElementById('navClose').addEventListener('click', () => {
  if (mobiel()) return setNav(false);
  const tight = !sidebar.classList.contains('sidebar--tight');
  sidebar.classList.toggle('sidebar--tight', tight);
  try { localStorage.setItem('remi-sidebar-smal', tight ? '1' : '0'); } catch { /* geen opslag */ }
});
try { if (localStorage.getItem('remi-sidebar-smal') === '1' && !mobiel()) sidebar.classList.add('sidebar--tight'); } catch { /* geen opslag */ }

// Peek
const peek = document.getElementById('peek'), peekBody = document.getElementById('peekBody'), peekTitle = document.getElementById('peekTitle'), peekBackdrop = document.getElementById('peekBackdrop');
let peekRerender = null;
export function openPeek(title, build) {
  peekRerender = () => { const f = captureFocus(); peekTitle.textContent = typeof title === 'function' ? title() : title; peekBody.replaceChildren(build()); restoreFocus(f); };
  peekRerender();
  peek.classList.add('peek--open'); peekBackdrop.classList.add('peek__backdrop--open'); lock();
}
export function closePeek() { peek.classList.remove('peek--open'); peekBackdrop.classList.remove('peek__backdrop--open'); peekRerender = null; lock(); }
document.getElementById('peekClose').addEventListener('click', closePeek);
peekBackdrop.addEventListener('click', closePeek);
window.addEventListener('keydown', e => { if (e.key === 'Escape') { closePeek(); setNav(false); } });

render();
try { if (!localStorage.getItem('remi-welkom')) { localStorage.setItem('remi-welkom', '1'); setTimeout(() => toast('Welkom. Alles wat je hier invult blijft in deze browser.'), 400); } } catch { /* geen opslag */ }
