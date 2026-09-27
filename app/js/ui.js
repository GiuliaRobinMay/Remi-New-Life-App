// Small DOM helpers, icons and formatters. No framework.
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked') el.checked = !!v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}
export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
export function svg(path, size = 16, extra = '') {
  const s = document.createElement('span');
  s.innerHTML = `<svg viewBox="0 0 16 16" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${extra}>${path}</svg>`;
  return s.firstElementChild;
}
export const icons = {
  circle: '<circle cx="8" cy="8" r="5.5"/>',
  arrow: '<path d="M3 8h10M9 4l4 4-4 4"/>',
  edit: '<path d="M11.3 2.3a1.6 1.6 0 0 1 2.4 2.4L5.5 12.9 2 13.9l1-3.5z"/><path d="M10 3.6 12.4 6"/>',
  close: '<path d="m4 4 8 8M12 4l-8 8"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  search: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/>',
  burger: '<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>',
  check: '<path d="m3.5 8.5 3 3 6-7"/>',
  calendar: '<rect x="2" y="3" width="12" height="11" rx="1.6"/><path d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4"/>',
  gear: '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M3.6 12.4l1.1-1.1M11.3 4.7l1.1-1.1"/>',
  external: '<path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10M9.5 2H14v4.5M14 2 7.5 8.5"/>',
  home: '<path d="M2.5 7.5 8 3l5.5 4.5V13a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z"/>',
  list: '<path d="M5 4h8M5 8h8M5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01"/>',
  mail: '<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="m2.5 4.5 5.5 4 5.5-4"/>',
  briefcase: '<rect x="2" y="5" width="12" height="8" rx="1.5"/><path d="M6 5V3.5A1 1 0 0 1 7 2.5h2a1 1 0 0 1 1 1V5M2 9h12"/>',
  star: '<path d="m8 2.5 1.7 3.6 3.9.5-2.9 2.7.8 3.9L8 11.3l-3.5 1.9.8-3.9L2.4 6.6l3.9-.5z"/>',
  compass: '<circle cx="8" cy="8" r="5.5"/><path d="m10 6-1.3 3.3L6 10.7l1.3-3.3z"/>',
  book: '<path d="M3 3.5A1.5 1.5 0 0 1 4.5 2H13v11H4.5A1.5 1.5 0 0 0 3 14.5z"/><path d="M3 12.5A1.5 1.5 0 0 1 4.5 11H13"/>',
  shield: '<path d="M8 2 3 4v4c0 3 2.2 5 5 6 2.8-1 5-3 5-6V4z"/>',
  user: '<circle cx="8" cy="5.5" r="2.7"/><path d="M2.8 13.5a5.2 5.2 0 0 1 10.4 0"/>',
  doc: '<path d="M4 2h5.5L13 5.5V14H4z"/><path d="M9.5 2v3.5H13M6 8.5h4M6 11h4"/>',
  copy: '<rect x="5.5" y="5.5" width="8" height="8" rx="1.3"/><path d="M10.5 5.5V3.8A1.3 1.3 0 0 0 9.2 2.5H3.8A1.3 1.3 0 0 0 2.5 3.8v5.4a1.3 1.3 0 0 0 1.3 1.3h1.7"/>',
  download: '<path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10"/>',
  upload: '<path d="M8 10.5v-8M4.5 6 8 2.5 11.5 6M3 13.5h10"/>',
  print: '<path d="M4.5 5.5V2.5h7v3M3 5.5h10a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1.5M3 11.5A1 1 0 0 1 2 10.5v-4a1 1 0 0 1 1-1M4.5 9.5h7v4h-7z"/>',
  clock: '<circle cx="8" cy="8" r="5.5"/><path d="M8 5v3.2l2 1.3"/>',
  leaf: '<path d="M3 13c0-6 4-9 10-10-1 6-4 10-10 10z"/><path d="M3 13c2-3 4-5 7-7"/>',
};
export function icon(name, size = 16) { return svg(icons[name] || icons.circle, size); }
export function badge(text, variant) { return h('span', { class: 'badge' + (variant ? ` badge--${variant}` : '') }, text); }
export function fit(n) { const w = h('span', { class: 'fit', title: `Fit ${n} op 5` }); for (let i = 1; i <= 5; i++) w.append(h('i', { class: i <= n ? 'on' : '' })); return w; }
const maanden = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
export function fmtDate(iso, withYear = true) {
  if (!iso) return '';
  const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
  if (isNaN(d)) return iso;
  return `${d.getDate()} ${maanden[d.getMonth()]}${withYear ? ' ' + d.getFullYear() : ''}`;
}
// Datums altijd in lokale tijd (Belgie); nooit via toISOString, dat is UTC en schuift een dag op.
const pad2 = n => String(n).padStart(2, '0');
export function isoLocal(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
export function parseLocal(iso) { return new Date(String(iso).slice(0, 10) + 'T00:00:00'); }
export function todayIso() { return isoLocal(new Date()); }
export function addDays(iso, n) { const d = parseLocal(iso); d.setDate(d.getDate() + n); return isoLocal(d); }
export function daysUntil(iso) { if (!iso) return NaN; return Math.round((parseLocal(iso) - parseLocal(todayIso())) / 86400000); }
export function uid() { return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }
export function slugify(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function md(text) {
  // Tiny markdown: headings, lists, hr, paragraphs. Enough for the templates.
  const out = h('div', { class: 'md' });
  const lines = String(text || '').split('\n');
  let para = [], list = null;
  const flush = () => { if (para.length) { out.append(h('p', null, para.join('\n'))); para = []; } if (list) { out.append(list); list = null; } };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (/^#{1,3}\s/.test(line)) { flush(); const lvl = line.match(/^#+/)[0].length; out.append(h('h' + lvl, null, line.replace(/^#+\s/, ''))); }
    else if (/^---+$/.test(line)) { flush(); out.append(h('hr')); }
    else if (/^[-*]\s/.test(line)) { if (para.length) { out.append(h('p', null, para.join('\n'))); para = []; } list = list || h('ul'); list.append(h('li', null, line.replace(/^[-*]\s/, ''))); }
    else if (line === '') flush();
    else { if (list) { out.append(list); list = null; } para.push(line); }
  }
  flush();
  return out;
}
export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('toast--show');
  clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove('toast--show'), 1800);
}
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Gekopieerd'); return; } catch { /* valt terug hieronder */ }
  // Terugval voor http-adressen of oudere browsers: tijdelijk tekstvak en execCommand.
  const ta = h('textarea', { style: 'position:fixed;top:-1000px;opacity:0', readonly: true }); ta.value = text; document.body.append(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  if (ok) { toast('Gekopieerd'); return; }
  // Laatste redmiddel: toon de tekst geselecteerd zodat je hem zelf kunt kopiëren.
  const box = h('div', { class: 'copybox' }, h('p', { class: 'small' }, 'Kopiëren lukte niet automatisch. Selecteer de tekst en kopieer hem zelf.'), h('textarea', { class: 'field', readonly: true, rows: 12 }), h('button', { class: 'btn btn--ghost', onClick: () => box.remove() }, 'Sluiten'));
  box.querySelector('textarea').value = text; document.body.append(box); box.querySelector('textarea').select();
}
export function download(filename, text, type = 'application/json') {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: filename });
  document.body.append(a); a.click(); a.remove();
}
