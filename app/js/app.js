// Router, navigation, chrome and peek panel. Views live in views-*.js.
import { h, icon, toast } from './ui.js';
import { subscribe, all, ref } from './store.js';
import * as core from './views-core.js';
import * as werk from './views-werk.js';

const views = { ...core, ...werk };
const NAV = [
  { group: null, items: [{ id: 'overzicht', label: 'Overzicht', icon: 'home', accent: 'violet' }] },
  { group: 'Traject', items: [
    { id: 'stappenplan', label: 'Stappenplan', icon: 'check', accent: 'green', count: () => all('stappenplan').filter(s => s.status !== 'klaar').length },
    { id: 'planning', label: 'Planning', icon: 'calendar', accent: 'green' },
    { id: 'rechten', label: 'Rechten', icon: 'shield', accent: 'red' },
  ] },
  { group: 'Werk', items: [
    { id: 'sollicitaties', label: 'Sollicitaties', icon: 'mail', accent: 'orange', count: () => all('sollicitaties').filter(s => !['afgewezen', 'gearchiveerd'].includes(s.status)).length },
    { id: 'vacatures', label: 'Vacatures', icon: 'search', accent: 'orange', count: () => all('vacatures').filter(v => v.status !== 'niet').length },
    { id: 'hotlist', label: 'Hotlist', icon: 'star', accent: 'orange', count: () => all('hotlist').length },
    { id: 'verkenning', label: 'Verkenning', icon: 'compass', accent: 'violet' },
    { id: 'opleidingen', label: 'Opleidingen', icon: 'book', accent: 'violet' },
  ] },
  { group: 'Remi', items: [
    { id: 'profiel', label: 'Profiel', icon: 'user', accent: 'grey' },
    { id: 'documenten', label: 'Documenten', icon: 'doc', accent: 'grey' },
  ] },
];
const flat = NAV.flatMap(g => g.items);
const shell = document.getElementById('shell');
const portal = document.getElementById('portal');
const chrome = document.getElementById('chrome');
const navEl = document.getElementById('nav');

function route() {
  const hash = location.hash.replace(/^#\/?/, '') || 'overzicht';
  const [id, ...rest] = hash.split('/');
  return { id: views[id] ? id : 'overzicht', params: rest, tab: new URLSearchParams(location.hash.split('?')[1] || '').get('tab') };
}
export function go(path) { location.hash = '#/' + path; }

function renderNav(active) {
  navEl.replaceChildren(...NAV.map(g => h('div', { class: 'sidebar__group' },
    g.group && h('p', { class: 'eyebrow' }, g.group),
    g.items.map(it => h('a', { class: 'sidebar__item' + (it.id === active ? ' sidebar__item--active' : ''), href: '#/' + it.id, onClick: () => shell.classList.remove('shell--nav-open') },
      h('span', { class: `icon-chip icon-chip--sm accent-${['violet','red','green','orange'][flat.indexOf(it) % 4]}` }, icon(it.icon, 14)),
      h('span', { class: 'sidebar__label' }, it.label),
      it.count ? h('span', { class: 'sidebar__count' }, String(it.count())) : null,
    )),
  )));
  document.getElementById('navFoot').textContent = `Gegevens lokaal in deze browser. Seed van ${ref.gebouwdOp ? ref.gebouwdOp.slice(0, 10) : ''}.`;
}

function renderChrome(cfg, active) {
  const nav = flat.find(x => x.id === active);
  chrome.className = `chrome accent-${cfg.accent || nav.accent}`;
  const tabDefs = cfg.tabs && cfg.tabs.length ? cfg.tabs : [{ label: cfg.tabLabel || 'Alles', href: '#/' + active, active: true }];
  const tabs = tabDefs.map(t => h('span', { class: 'tabs__slot' },
    t.divider ? h('span', { class: 'tabs__divider' }) : null,
    h('a', { class: 'tabs__item' + (t.active ? ' tabs__item--active' : ''), href: t.href }, t.label)));
  chrome.replaceChildren(
    h('div', { class: 'chrome__top' },
      h('div', { class: 'chrome__id' }, h('span', { class: 'chrome__mark' }, icon(nav.icon, 22)), h('span', { class: 'chrome__name' }, cfg.title || nav.label)),
      h('div', { class: 'chrome__where' }, cfg.where || ''),
      h('div', { class: 'chrome__actions' }, h('button', { class: 'chrome__iconbtn', 'aria-label': 'Instellingen', title: 'Instellingen en synchronisatie', onClick: () => views.instellingenPeek() }, icon('gear'))),
    ),
    h('div', { class: 'chrome__tabs' }, h('nav', { class: 'tabs' }, tabs)),
    h('div', { class: 'chrome__tool' },
      h('button', { class: 'chrome__burger', 'aria-label': 'Menu', onClick: () => shell.classList.toggle('shell--nav-open') }, icon('burger')),
      h('span', { class: 'chrome__viewicon' }, icon(cfg.viewIcon || 'list', 16)),
      h('span', { class: 'chrome__view' }, cfg.view || (tabDefs.find(t => t.active) || tabDefs[0]).label),
      h('div', { class: 'chrome__spacer' }),
      ...(cfg.tool || []),
    ),
  );
}

let current = null;
function render() {
  const r = route();
  current = r;
  renderNav(r.id);
  const out = views[r.id](r);
  renderChrome(out.chrome || {}, r.id);
  portal.replaceChildren(out.body);
  if (r.id !== (render.last || {}).id) portal.scrollTop = 0;
  render.last = r;
}
window.addEventListener('hashchange', render);
subscribe(() => { render(); if (peekRerender) peekRerender(); });
document.getElementById('navBackdrop').addEventListener('click', () => shell.classList.remove('shell--nav-open'));
document.getElementById('navClose').addEventListener('click', () => shell.classList.remove('shell--nav-open'));

// Peek panel
const peek = document.getElementById('peek'), peekBody = document.getElementById('peekBody'), peekTitle = document.getElementById('peekTitle'), peekBackdrop = document.getElementById('peekBackdrop');
let peekRerender = null;
export function openPeek(title, build) {
  peekRerender = () => { peekTitle.textContent = typeof title === 'function' ? title() : title; peekBody.replaceChildren(build()); };
  peekRerender();
  peek.classList.add('peek--open'); peekBackdrop.classList.add('peek__backdrop--open');
}
export function closePeek() { peek.classList.remove('peek--open'); peekBackdrop.classList.remove('peek__backdrop--open'); peekRerender = null; }
document.getElementById('peekClose').addEventListener('click', closePeek);
peekBackdrop.addEventListener('click', closePeek);
window.addEventListener('keydown', e => { if (e.key === 'Escape') closePeek(); });

render();
if (!localStorage.getItem('remi-welkom')) { localStorage.setItem('remi-welkom', '1'); setTimeout(() => toast('Welkom. Alles wat je hier invult blijft in deze browser.'), 400); }
