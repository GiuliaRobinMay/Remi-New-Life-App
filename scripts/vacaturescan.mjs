// Dagelijkse vacaturescan: opent elke bron uit data/vacaturebronnen.json en haalt er kandidaat-vacatures uit
// (titel, absolute link en de tekst eromheen), met per bron een overzicht van wat lukte.
//
// Gebruik: node scripts/vacaturescan.mjs <uitvoerbestand.json> [--bronnen pad.json] [--alleen id,id] [--parallel 4] [--bijwerken]
// --bijwerken: met --alleen alleen die bronnen opnieuw scannen en hun resultaat in een bestaand uitvoerbestand vervangen.
//
// Werkwijze per pagina: eerst een gewone fetch. Met Playwright (Chromium, via HTTPS_PROXY als die gezet is) wanneer
// de bron js=true heeft, de fetch mislukt, de pagina weinig tekst heeft of er geen kandidaten uit kwamen.
// Beleefd: hoogstens één verzoek tegelijk per site, met een pauze van een paar seconden ertussen, en een beperkt
// aantal bronnen tegelijk. Per pagina hoogstens 40 kandidaten (bij VDAB dus 40 per zoekterm).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Node's fetch volgt HTTPS_PROXY alleen met NODE_USE_ENV_PROXY=1; die moet bij het opstarten gezet zijn.
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxy && process.env.NODE_USE_ENV_PROXY !== '1') {
  const kind = spawn(process.execPath, [...process.execArgv, fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => kind.kill(sig));
  const code = await new Promise(r => kind.on('exit', (c, sig) => r(c ?? (sig ? 1 : 0))));
  process.exit(code);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const optie = naam => { const i = args.indexOf(naam); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const bronbestand = resolve(optie('--bronnen') || join(root, 'data', 'vacaturebronnen.json'));
const alleen = (optie('--alleen') || '').split(',').map(s => s.trim()).filter(Boolean);
const bijwerken = args.includes('--bijwerken') && !!args.splice(args.indexOf('--bijwerken'), 1);
const PARALLEL = Number(optie('--parallel')) || 4;
const uitvoer = args[0];
if (!uitvoer) {
  console.error('Gebruik: node scripts/vacaturescan.mjs <uitvoerbestand.json> [--bronnen pad] [--alleen id,id] [--parallel 4] [--bijwerken]');
  process.exit(1);
}

const MAX_KANDIDATEN = 40;          // per pagina (per zoekterm bij bronnen met zoekparameters)
const PAUZE_PER_SITE_MS = 3000;     // tussen twee verzoeken naar dezelfde host
const FETCH_TIMEOUT_MS = 25000;
const PAGINA_TIMEOUT_MS = 45000;    // laden met Playwright
const WACHT_MS = 15000;             // wachten op een selector of tekst na het laden
const MIN_TEKST = 1500;             // minder zichtbare tekst dan dit: opnieuw met Playwright
const bronTimeout = paginas => 90000 + paginas * 30000;
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// Heuristiek. JOB: woorden die op een functie wijzen. NAV: linkteksten die navigatie zijn, geen vacature.
// DETAIL_STERK/DETAIL_ZWAK: links die naar een vacaturepagina lijken te gaan. HINT: tekst rond een vacature.
const JOB = /vacature|vacancy|(?<![\w-])jobs?\b|\bzoekt\b|medewerk|technie?k|technic|technisch|instructeur|docent|leerkracht|leraar|lesgever|lector|lasser|lassen|metaal|atelier|werkplaats|decor|depot|museum|begeleid|onderhoud|coach|werkleider|ploegleider|stielman|vakspecialist|vakman|monteur|mecanicien|mechanica|smid|schrijnwerk|restaura|conserva|collectie|archie?f|tentoonstel|podium|productie|assistent|polyvalent|all-?round|fablab|makerspace|magazijn|logistie?k|gebouw|conci[eë]rge|klus|elektric|bankwerk|plaat|constructie|carross|operator|arbeider|hersteller|fiets|tekenaar|projectleider|verantwoordelijke|beheerder|co[oö]rdinator|stagiair|handler|installateur|schilder|hovenier|chauffeur|praktijk|werfreserve|wachter|\b[mvx]\s?\/\s?[mvx]\b|\d{2,3}\s?%/i;
const NAV = /^(home|start|menu|zoek(en)?|search|contact|nieuws|blog|agenda|over ons|over [\w ]{1,20}|privacy.*|cookie.*|disclaimer|toegankelijkheid.*|log ?in|aanmelden|inloggen|registreer.*|mijn .*|(vacatures?|jobs?)( (&|en|and) [\w ]{1,30})?|jobsite|vacaturebank|(alle|interne|externe|openstaande|actuele|huidige|onze|andere) (vacatures|jobs)|(post|plaats) (een |je |uw )?vacature.*|vacature (posten|plaatsen|indienen).*|stages?|vrijwilligers?(werk)?|solliciteren|ontvang .*|inschrijving .*|schrijf je in.*|abonneer.*|.* in je mailbox|vacatures( [\w()!.-]+){1,3}|[\w!.-]+ vacatures|.*vacaturebank|(vacatures?|jobs?) (in|bij|van|voor|op|per|in de) .*|vacature (publiceren|toevoegen).*|(plaats|voeg) (nu |jouw |je |uw )?(een )?vacature.*|maak een (job ?alert|profiel).*|bekijk al onze .*|.*in de kijker|blijf op de hoogte.*|naar de jobsite|(zoek|vind) hier .*|volg deze link.*|dit formulier|op de website .*|bezoek ons.*|selectieprocedures?|online solliciteren.*|het sollicitatieproces|sollicitatieprocedure|bedrijfscultuur|getuigenissen|info sollicitatieproces|ontdek de jobs.*|solliciteren bij .*|vacaturenieuwsbrief.*|nieuwe vacatures online|faq|veelgestelde vragen|onze voordelen|wie zijn we\??|jouw loopbaan|onze waarden|(https?:\/\/|www\.)\S+|intranet|hier|klik hier|deze link|hou me op de hoogte|solliciteer (als|bij|hier|via) .*|lees meer over .*|vind je niet wat je zoekt\??|niet gevonden wat je zocht\??|(bekijk|toon|ontdek|naar|zie|lees) .*(vacatures|jobs)( \(.*\))?|.*\d+ resultaten?|(bekijk|toon|ontdek|naar|zie) (alle |onze |de )?(vacatures|jobs|openstaande vacatures)|onze vacatures|openstaande vacatures|werken (bij|voor|in) .*|jobalert.*|job ?alert.*|spontaan.*|spontane sollicitatie.*|open sollicitatie.*|solliciteer( nu)?|nieuwsbrief.*|volg ons.*|deel.*|share.*|facebook|linkedin|instagram|twitter|youtube|tiktok|x|vorige|volgende|terug.*|meer|lees meer|meer info|\d+|[«»‹›<>→←.]+|ga naar de inhoud|naar de inhoud|skip.*|sluit(en)?|accepteer.*|weiger.*)$/i;
// DETAIL_* worden getest op pad en query van de link, niet op de host (onderwijsvacatures.be is geen vacaturelink).
const DETAIL_STERK = /vacature|vacancy|vacancies|\/o\/[\w-]{4,}|\/jobs?\/[^/?#]|\/job-|career|carriere|\/positions?\/|requisition|opportunit|[?&](job|jobid|vacancy|vacancyid|vacatureid|vac_id)=/i;
const DETAIL_ZWAK = /\/\d{3,}(\/|$|-)|[?&](id|jobid|vacatureid|vacancyid)=\w+|werken-?bij\/./i;
const NIEUWS = /\/(nieuws|news|blog|blikvanger|agenda|events?|evenementen|pers)\b|(nieuws|news|blog|blikvanger|agenda)\.(asp|php|html?)/i;
// Links die zeker geen vacature zijn: formulieren, aanmelden, jobalerts, loonschalen, voorwaarden.
const FORMULIER = /applicationform|appform|\/apply\b|sollicitatieformulier|\/login|\/register|\/inloggen|mailto:|job-?alert|\/solliciteer|spontane?-sollicit|loonschaal|barema|privacy|cookie|voorwaarden|reglement/i;
const FILTERLINK = /[?&](categor\w*|filter\w*|sector|regio|provincie|page|pagina|sort\w*|tag|type|f|location|locatie|plaats|q|s|search|zoek\w*)=|[?&]f(%5b|\[)\d*(%5d|\])=/i;
const HINT = /deadline|uiterste|\(tot \d|sollicit|reageren (tot|voor)|kandidaat stellen|contract|voltijds|deeltijds|onbepaalde|bepaalde duur|vervanging|online sinds|niveau [a-e]\d?|\b[a-e][1-5](-[a-e]?[1-5])?\b|loonschaal|weddeschaal|uur ?\/ ?week|\d{1,3}\s?%|vast(e)? (job|contract|benoeming)|werfreserve|selectie|functie|vacature|startdatum|tewerkstelling|standplaats|\b[mvx]\s?\/\s?[mvx]\b/i;
// Botbescherming (captcha, Cloudflare-challenge): niet omzeilen, wel als fout melden.
const BOT = /just a moment|checking (if the site connection is secure|your browser)|verify(ing)? you are (a )?human|testing whether you are a human|are you a robot|captcha|attention required|access denied|request unsuccessful|incapsula|your support id is|cf-chl|ddos protection/i;
// Tekst waarmee een pagina zelf zegt dat er nu geen vacatures zijn.
const GEEN = /(er zijn|momenteel|op dit moment|voorlopig|currently)[^.!]{0,40}geen[^.!]{0,25}(vacatures?|jobs?|openstaande)|geen (openstaande )?(vacatures?|jobs?|resultaten?) (gevonden|beschikbaar|boven water)|geen vacactures|no (current )?(vacancies|openings|jobs)|0 jobs gevonden|er kwam geen resultaat/i;
const GENERIEK = /^(view job|view vacancy|see job|job details|apply( now)?|more info(rmation)?|weergeven|vacature bekijken|bekijken|bekijk deze vacature|meer over deze vacature|(ontdek|bekijk|lees) hier .*|lees meer|lees verder|verder lezen|meer details|meer info|meer lezen|meer weten|naar vacature|bekijk vacature|bekijk( de)? (vacature|job|functie|details?)|bekijk|ontdek( meer)?|read more|details?|solliciteer( nu)?|naar de vacature|meer|info|→|>|›)$/i;

const config = JSON.parse(readFileSync(bronbestand, 'utf8'));
const uitsluitenRe = config.uitsluiten?.length ? new RegExp(`\\b(${config.uitsluiten.join('|')})\\b`, 'i') : /(?!)/;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.error(...a);

// ---------- beleefdheid: één verzoek tegelijk per host, met pauze ----------
// Na een HTTP 429 (te veel verzoeken) wacht de scan voortaan langer bij die site.
const hostKetting = new Map(), extraPauze = new Map();
const hostVan = url => new URL(url).hostname.replace(/^www\./, '');
function perHost(url, fn) {
  const host = hostVan(url);
  const vorige = hostKetting.get(host) || Promise.resolve();
  const run = vorige.then(fn);
  hostKetting.set(host, run.catch(() => {}).then(() => sleep(PAUZE_PER_SITE_MS + (extraPauze.get(host) || 0))));
  return run;
}
const remMet429 = url => extraPauze.set(hostVan(url), 30000);

// ---------- gewone fetch ----------
function decodeer(buf, contentType) {
  const uitHeader = /charset=([\w-]+)/i.exec(contentType || '')?.[1];
  const kop = Buffer.from(buf.slice(0, 4096)).toString('latin1');
  const uitMeta = /<meta[^>]+charset=["']?([\w-]+)/i.exec(kop)?.[1];
  let cs = (uitHeader || uitMeta || 'utf-8').toLowerCase();
  if (cs === 'iso-8859-1' || cs === 'latin1') cs = 'windows-1252';
  try { return new TextDecoder(cs).decode(buf); } catch { return new TextDecoder('utf-8').decode(buf); }
}
async function haal(url) {
  const r = await fetch(url, {
    redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'accept-language': 'nl-BE,nl;q=0.9,en;q=0.5' },
  });
  const buf = new Uint8Array(await r.arrayBuffer());
  return { status: r.status, eindUrl: r.url || url, html: decodeer(buf, r.headers.get('content-type')), type: r.headers.get('content-type') || '', botHeader: !!r.headers.get('cf-mitigated') };
}

// ---------- Playwright ----------
let pw = null, pwFout = null, browser = null, statischeContext = null;
async function laadPlaywright() {
  if (pw || pwFout) return pw;
  for (const spec of ['playwright', '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    try { pw = await import(spec); break; } catch (e) { pwFout = e; }
  }
  if (pw) pwFout = null;
  return pw;
}
async function geefBrowser() {
  if (browser) return browser;
  if (!(await laadPlaywright())) throw new Error(`Playwright niet beschikbaar: ${pwFout?.message}`);
  const { chromiumPath } = await import('./chromium.mjs');
  const chromium = pw.chromium || pw.default?.chromium;
  const opties = { executablePath: chromiumPath() };
  if (proxy) opties.proxy = { server: proxy, bypass: process.env.NO_PROXY || process.env.no_proxy || undefined };
  browser = await chromium.launch(opties);
  return browser;
}

// Draait in de pagina: verzamelt ruwe kandidaten (links en kopjes) met de tekst van hun kaartje eromheen.
function verzamelInPagina(cfg) {
  const DETAIL = new RegExp(cfg.detail, 'i');
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const norm = u => { try { const x = new URL(u, document.baseURI); x.hash = ''; return x.href; } catch { return ''; } };
  const pad = h => { try { const x = new URL(h); return x.pathname + x.search; } catch { return h; } };
  const tekst = el => clean(el.innerText !== undefined && el.innerText !== '' ? el.innerText : el.textContent);
  // Navigatie, kop- en voettekst, cookiebanners. Een groot omhullend element (bv. <body class="cookies-not-set">) telt niet.
  const NAVSEL = 'nav, header, footer, [role=navigation], [role=banner], [role=contentinfo], .menu, .navigation, .navbar, .breadcrumb, .breadcrumbs, [class*=cookie], [id*=cookie], [class*=consent], [id*=consent]';
  const inNav = el => {
    for (let e = el; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      if (e.matches(NAVSEL)) return (e.textContent || '').length < 6000;
    }
    return false;
  };
  // Het 'kaartje' van een kandidaat: het grootste omhullende element zonder een andere vacaturelink of zusterlink.
  const kaart = (el, eigen) => {
    const a = el.tagName === 'A' ? el : el.querySelector('a[href]');
    const zusSig = x => x.className + '|' + (x.parentElement ? x.parentElement.tagName + '.' + x.parentElement.className : '');
    const eigenSig = a ? zusSig(a) : null;
    let k = el;
    for (let i = 0; i < 12 && k.parentElement && k.parentElement !== document.body; i++) {
      const p = k.parentElement;
      if (tekst(p).length > 700) break;
      const zus = [...p.querySelectorAll('a[href]')].some(x => { const h = norm(x.href); return h && h !== eigen && !/^javascript:/i.test(h) && (DETAIL.test(pad(h)) || (eigenSig !== null && zusSig(x) === eigenSig)); });
      if (zus) break;
      if (!a && [...p.querySelectorAll(el.tagName)].some(x => x !== el)) break;
      k = p;
    }
    return k;
  };
  const sig = el => { const d = []; for (let e = el, i = 0; e && i < 3; e = e.parentElement, i++) d.push(e.tagName + '.' + [...e.classList].slice(0, 3).join('.')); return d.join('<'); };
  const uit = [];
  const elementen = cfg.selector ? [...document.querySelectorAll(cfg.selector)] : [...document.querySelectorAll('a[href], h1, h2, h3, h4, h5')];
  for (const el of elementen.slice(0, 1500)) {
    const isLink = el.tagName === 'A';
    const a = isLink ? el : el.closest('a[href]') || el.querySelector('a[href]');
    if (!isLink && a && !cfg.selector) continue; // kopje met link: de link telt al mee
    const href = a ? norm(a.href) : '';
    let titel = '';
    const kop = isLink ? el.querySelector('h1,h2,h3,h4,h5,h6,[class*=title],[class*=titel]') : null;
    titel = kop ? tekst(kop) : tekst(el);
    const attr = clean(el.getAttribute('title') || el.getAttribute('aria-label') || '');
    const GEN = new RegExp(cfg.generiek, 'i');
    if (!titel) titel = attr || clean((isLink && el.querySelector('img[alt]')?.getAttribute('alt')) || '');
    else if (attr.length >= 8 && !GEN.test(attr) && titel.length > attr.length + 15 && !kop) titel = attr;
    const k = (cfg.kaartSelector && el.closest(cfg.kaartSelector)) || kaart(el, href);
    // Inline lijst ("X zoekt Y (tot ...) <a>Lees meer</a><br>"): de tekst vóór de link hoort erbij.
    let voor = '';
    if (k === el && isLink) {
      const delen = [];
      for (let n = el.previousSibling; n && delen.join(' ').length < 300; n = n.previousSibling) {
        if (n.nodeType === 1 && (/^(BR|HR|A)$/.test(n.tagName) || n.querySelector('a[href]'))) break;
        delen.unshift(n.textContent || '');
      }
      voor = clean(delen.join(' '));
    }
    if (!titel || GEN.test(titel)) {
      const NAVRE = new RegExp(cfg.nav, 'i');
      let h = [...k.querySelectorAll('h1,h2,h3,h4,h5,h6,strong,b')].find(x => !GEN.test(tekst(x)) && !NAVRE.test(tekst(x)));
      for (let sib = k.previousElementSibling, i = 0; !h && sib && i < 4; sib = sib.previousElementSibling, i++) {
        if (sib.querySelector('a[href]')) break;
        h = /^H[1-6]$/.test(sib.tagName) ? sib : sib.querySelector('h1,h2,h3,h4,h5,h6');
        if (h && NAVRE.test(tekst(h))) h = null;
      }
      let rest = clean(titel ? tekst(k).replace(titel, ' ') : tekst(k));
      // Link midden in een zin ("... zoekt twee onderzoekers. <a>Ontdek hier de vacature</a>"): neem de alinea.
      if (!h && !voor && rest.replace(/[^\p{L}]/gu, '').length < 10) {
        const blok = el.closest('li, p, td, dd');
        if (blok) { voor = clean(titel ? tekst(blok).replace(titel, ' ') : tekst(blok)); rest = voor; }
      }
      titel = h ? tekst(h) : voor.slice(0, 160) || rest.slice(0, 160) || titel;
    }
    if (titel.length > 180) titel = titel.split(/(?<=[.!?])\s|\n/)[0].slice(0, 180);
    let werkgever = '';
    if (cfg.werkgeverSelector) { const w = k.querySelector(cfg.werkgeverSelector); if (w) werkgever = tekst(w); }
    const context = voor && voor.length > tekst(k).length ? voor : clean(`${voor} ${tekst(k)}`);
    uit.push({ titel, href, context: context.slice(0, 600), nav: inNav(el), kop: !isLink, werkgever, sig: sig(el) });
  }
  const bodyTekst = tekst(document.body);
  const geen = bodyTekst.match(new RegExp(`(${cfg.geen})[^.!]{0,80}`, 'i'));
  return { items: uit, tekstLengte: bodyTekst.length, titel: document.title, bot: bodyTekst.length < 2500 && new RegExp(cfg.bot, 'i').test(bodyTekst + ' ' + document.title), geenVacatures: geen ? geen[0].trim() : null };
}

const cfgVoor = bron => ({ detail: DETAIL_STERK.source, nav: NAV.source, bot: BOT.source, geen: GEEN.source, generiek: GENERIEK.source, selector: bron.selector || null, kaartSelector: bron.kaartSelector || null, werkgeverSelector: bron.werkgeverSelector || null });

async function verzamelStatisch(html, basisUrl, bron) {
  const b = await geefBrowser();
  if (!statischeContext) {
    statischeContext = await b.newContext({ javaScriptEnabled: false, userAgent: UA });
    await statischeContext.route('**/*', r => r.abort());
  }
  const page = await statischeContext.newPage();
  try {
    const metBase = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => `${m}<base href="${basisUrl.replace(/"/g, '%22')}">`) : `<base href="${basisUrl.replace(/"/g, '%22')}">${html}`;
    await page.setContent(metBase, { waitUntil: 'domcontentloaded', timeout: 20000 });
    return await page.evaluate(verzamelInPagina, cfgVoor(bron));
  } finally { await page.close().catch(() => {}); }
}

async function laadMetBrowser(url, bron) {
  const b = await geefBrowser();
  const ctx = await b.newContext({ userAgent: UA, locale: 'nl-BE', viewport: { width: 1280, height: 1600 } });
  await ctx.route('**/*', r => ['image', 'media', 'font'].includes(r.request().resourceType()) ? r.abort() : r.continue());
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGINA_TIMEOUT_MS });
    if (bron.wachtOp) await page.waitForSelector(bron.wachtOp, { timeout: WACHT_MS }).catch(() => {});
    else if (bron.wachtOpTekst) await page.waitForFunction(re => new RegExp(re, 'i').test(document.body?.innerText || ''), bron.wachtOpTekst, { timeout: WACHT_MS, polling: 500 }).catch(() => {});
    else await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const r = await page.evaluate(verzamelInPagina, cfgVoor(bron));
    // Lijsten in een iframe (bv. een ingebed jobportaal) ook meenemen.
    for (const f of page.frames()) {
      if (f === page.mainFrame() || !/^https?:/.test(f.url())) continue;
      try { const fr = await f.evaluate(verzamelInPagina, cfgVoor(bron)); r.items.push(...fr.items); r.tekstLengte += fr.tekstLengte; } catch {}
    }
    return { ...r, http: resp?.status() ?? null, eindUrl: page.url() };
  } finally { await ctx.close().catch(() => {}); }
}

// Reserve zonder browser: links en kopjes met reguliere expressies, context = tekst rond de link.
function verzamelRegex(html, basisUrl) {
  const strip = s => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();
  const items = [];
  const re = /<a\b[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>|<h[1-5][^>]*>([\s\S]*?)<\/h[1-5]>/gi;
  let m;
  while ((m = re.exec(html)) && items.length < 1500) {
    const voor = html.slice(Math.max(0, m.index - 400), m.index), na = html.slice(m.index, m.index + 900);
    let href = '';
    if (m[1]) { try { href = new URL(m[1].replace(/&amp;/g, '&'), basisUrl).href.replace(/#.*$/, ''); } catch {} }
    items.push({ titel: strip(m[2] ?? m[3] ?? ''), href, context: strip(voor + na).slice(0, 600), nav: false, kop: !m[1], werkgever: '', sig: '' });
  }
  return { items, tekstLengte: strip(html).length, titel: strip(/<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '') };
}

// ---------- beoordelen ----------
const padVan = u => { try { const x = new URL(u); return x.pathname + x.search; } catch { return u; } };
function normUrl(u) {
  try {
    const x = new URL(u); x.hash = '';
    if (/(^|\.)vdab\.be$/.test(x.hostname) && /\/vacatures\/\d+/.test(x.pathname)) x.search = '';
    for (const [k, v] of [...x.searchParams]) if (/^(utm_\w+|source|medium|fbclid|gclid|ref)$/i.test(k) || /[{}]/.test(v)) x.searchParams.delete(k);
    return x.href;
  } catch { return u; }
}
// Twee links hebben dezelfde vorm als ze in dezelfde map staan en hun laatste stuk gelijk begint
// (bv. /nl/kmska-zkt-...), of als ze dezelfde queryparameters hebben (bv. ?lang=..&job=..).
function zelfdeVorm(a, b) {
  try {
    const x = new URL(a), y = new URL(b);
    if (x.host !== y.host) return false;
    const dx = x.pathname.replace(/[^/]*\/?$/, ''), dy = y.pathname.replace(/[^/]*\/?$/, '');
    if (dx !== dy) return false;
    const lx = x.pathname.slice(dx.length), ly = y.pathname.slice(dy.length);
    let n = 0; while (n < lx.length && lx[n] === ly[n]) n++;
    const kx = [...x.searchParams.keys()].sort().join('&'), ky = [...y.searchParams.keys()].sort().join('&');
    return n >= 4 || (kx !== '' && kx === ky && lx === ly);
  } catch { return false; }
}

function beoordeel(items, lijstUrl, bron) {
  const lijst = normUrl(lijstUrl).replace(/\/$/, '');
  // Links onder het pad van de lijst (bv. /jobs/<titel>) zijn vacatures; niet bij een lijst op de hoofdpagina van een site.
  const lijstPad = (() => { try { const u = new URL(lijst); return u.pathname.length > 1 ? u.origin + u.pathname.replace(/\/$/, '') + '/' : null; } catch { return null; } })();
  const gezien = new Map();
  let uitgefilterd = 0;
  const gescoord = [];
  for (const it of items) {
    const href = it.href && /^https?:/i.test(it.href) ? normUrl(it.href) : '';
    if (it.href && !href) continue; // mailto:, tel:, javascript:
    const titel = it.titel.replace(/\s+/g, ' ').trim().replace(/^(lees meer over|meer over|bekijk|ontdek)( de| deze)? vacature:?\s+/i, '');
    const eigenPagina = !href || href.replace(/\/$/, '') === lijst;
    const kind = !eigenPagina && lijstPad && href.startsWith(lijstPad) && href.length > lijstPad.length + 3;
    let s = 0;
    if (bron.selector) s = 4;
    if (JOB.test(titel)) s += 3;
    const detailSterk = !eigenPagina && (DETAIL_STERK.test(padVan(href)) || kind);
    if (detailSterk) s += 3; else if (!eigenPagina && DETAIL_ZWAK.test(padVan(href))) s += 1;
    if (!eigenPagina && FILTERLINK.test(href)) s -= 2;
    if (HINT.test(it.context)) s += 1;
    if (NAV.test(titel)) s -= 6;
    if (it.nav) s -= 3;
    if (titel.length < 4 || titel.length > 180) s -= 3;
    if (titel.split(' ').length < 2 && !detailSterk) s -= 2;
    if (it.kop && eigenPagina && !HINT.test(it.context)) s -= 2;
    if (it.href && eigenPagina) s -= 3; // link naar de lijst zelf
    if (href && FORMULIER.test(href)) s -= 4;
    if (href && NIEUWS.test(padVan(href)) && !JOB.test(titel)) s -= 2;
    gescoord.push({ it, href, titel, eigenPagina, s });
  }
  // Tweede ronde: links met dezelfde opbouw als een duidelijke vacature (zelfde lijst) tellen ook mee.
  // Bij een lijst van minstens drie gelijke kaartjes met vacatures volstaat dezelfde map.
  const goed = gescoord.filter(g => g.s >= 4 && g.it.sig && g.href);
  const perSig = new Map(); for (const g of goed) perSig.set(g.it.sig, (perSig.get(g.it.sig) || 0) + 1);
  const map = u => { try { const x = new URL(u); return x.host + x.pathname.replace(/[^/]*\/?$/, ''); } catch { return u; } };
  for (const g of gescoord) {
    if (g.s < 1 || g.s >= 4 || !g.it.sig || g.eigenPagina || NAV.test(g.titel)) continue;
    if (goed.some(x => x.it.sig === g.it.sig && (zelfdeVorm(x.href, g.href) || (perSig.get(g.it.sig) >= 3 && map(x.href) === map(g.href))))) g.s = 4;
  }
  for (const { it, href, titel, eigenPagina, s } of gescoord) {
    if (s < 4) continue;
    if (bron.filterInterim && (uitsluitenRe.test(it.werkgever) || /\binterim\b/i.test(it.context))) { uitgefilterd++; continue; }
    const sleutel = eigenPagina ? `${lijst}|${titel.toLowerCase()}` : href;
    const oud = gezien.get(sleutel);
    if (!oud || s > oud.score) gezien.set(sleutel, { titel, url: href || lijstUrl, context: it.context, werkgever: it.werkgever || undefined, score: s });
  }
  // Een kopje zonder link dat ook als link voorkomt, is dezelfde vacature.
  const metLink = [...gezien.values()].filter(c => c.url !== lijstUrl).map(c => c.titel.toLowerCase());
  for (const [k, c] of gezien) if (k.startsWith(`${lijst}|`) && metLink.some(t => t.includes(c.titel.toLowerCase()) || c.titel.toLowerCase().includes(t))) gezien.delete(k);
  if (process.env.VACATURESCAN_DEBUG) for (const g of gescoord) if (g.s >= 0 || g.it.titel) log(`  [${g.s}] ${g.titel.slice(0, 70)} | ${g.href.slice(0, 90)} | ${g.it.sig || ''}`);
  const lijstKandidaten = [...gezien.values()].sort((a, b) => b.score - a.score).slice(0, MAX_KANDIDATEN);
  return { kandidaten: lijstKandidaten, uitgefilterd };
}

// ---------- één pagina ----------
async function scanPagina(bronAlgemeen, pag, gestart = () => {}) {
  const bron = { ...bronAlgemeen };
  for (const k of ['js', 'geenBrowser', 'selector', 'kaartSelector', 'werkgeverSelector', 'wachtOp', 'wachtOpTekst', 'filterInterim']) if (pag[k] !== undefined) bron[k] = pag[k];
  const res = { label: pag.zoekterm || pag.label || 'lijst', url: pag.url, status: 'fout', methode: null, http: null, fout: null, tekstLengte: 0, aantal: 0, uitgefilterd: 0 };
  let beste = null, bot = false;
  if (!bron.js) {
    try {
      let f = await perHost(pag.url, () => { gestart(); return haal(pag.url); });
      if (f.status === 429) { remMet429(pag.url); f = await perHost(pag.url, () => haal(pag.url)); } // één keer opnieuw, na de langere pauze
      res.methode = 'fetch'; res.http = f.status;
      if (f.status >= 200 && f.status < 300) {
        let r;
        try { r = await verzamelStatisch(f.html, f.eindUrl, bron); } catch { r = verzamelRegex(f.html, f.eindUrl); res.methode = 'fetch+regex'; }
        beste = { ...r, eindUrl: f.eindUrl, ...beoordeel(r.items, f.eindUrl, bron) };
        res.tekstLengte = r.tekstLengte;
        if (r.bot) bot = true;
      } else {
        if (f.botHeader || BOT.test(f.html.slice(0, 20000))) bot = true;
        res.fout = `HTTP ${f.status}`;
      }
    } catch (e) { res.fout = `fetch: ${e.cause?.code || e.cause?.message || e.message}`; }
  }
  const nogMetBrowser = bron.js || !beste || beste.tekstLengte < MIN_TEKST || beste.kandidaten.length === 0;
  if (nogMetBrowser && !bron.geenBrowser) {
    try {
      const r = await perHost(pag.url, () => { gestart(); return laadMetBrowser(pag.url, bron); });
      const b = { ...r, ...beoordeel(r.items, r.eindUrl || pag.url, bron) };
      res.methode = res.methode ? `${res.methode}+playwright` : 'playwright';
      if (r.http === 429) remMet429(pag.url);
      if (r.bot) bot = true;
      if (r.http && (r.http < 200 || r.http >= 400) && b.kandidaten.length === 0) {
        res.http = r.http; res.fout = `HTTP ${r.http} (ook met browser)`;
      } else if (!(r.bot && b.kandidaten.length === 0) && (!beste || b.kandidaten.length >= beste.kandidaten.length)) {
        beste = b; res.http = r.http ?? res.http; res.tekstLengte = r.tekstLengte; res.fout = null;
      }
    } catch (e) { res.fout = [res.fout, `browser: ${e.message.split('\n')[0]}`].filter(Boolean).join('; '); }
  }
  if (beste?.kandidaten.length) {
    res.status = 'ok'; res.fout = null;
  } else if (bot) {
    res.status = 'fout'; beste = null;
    res.fout = `geblokkeerd door botbescherming (captcha of challenge${res.http ? `, HTTP ${res.http}` : ''})`;
  } else if (beste) res.status = 'leeg';
  if (beste) {
    res.aantal = beste.kandidaten.length; res.uitgefilterd = beste.uitgefilterd; res.paginatitel = beste.titel;
    if (!beste.kandidaten.length && beste.geenVacatures) res.melding = `pagina meldt: ${beste.geenVacatures}`;
    if (beste.eindUrl && normUrl(beste.eindUrl) !== normUrl(pag.url)) res.eindUrl = beste.eindUrl;
  }
  return { res, kandidaten: beste?.kandidaten || [] };
}

// ---------- één bron ----------
// Zoekt op een pagina de eerste link die op het patroon past (bv. de nieuwste post met een vacaturelijst).
async function volgLink(url, patroon) {
  const f = await perHost(url, () => haal(url));
  if (f.status < 200 || f.status >= 300) throw new Error(`HTTP ${f.status} bij het zoeken van de link`);
  const re = new RegExp(patroon, 'i');
  for (const m of f.html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)) {
    let h; try { h = new URL(m[1].replace(/&amp;/g, '&'), f.eindUrl).href; } catch { continue; }
    if (re.test(h)) return h;
  }
  throw new Error(`geen link gevonden die past op ${patroon}`);
}

async function scanBron(bron) {
  const start = Date.now();
  const paginas = [];
  if (bron.volgLink && !bron.hoofdpaginaOverslaan) {
    try { paginas.push({ label: 'lijst', url: await volgLink(bron.url, bron.volgLink) }); }
    catch (e) { return { resultaat: { id: bron.id, naam: bron.naam, url: bron.url, soort: bron.soort, status: 'fout', aantal: 0, fout: e.message, duurSec: Math.round((Date.now() - start) / 1000) }, kandidaten: [] }; }
  } else if (!bron.hoofdpaginaOverslaan) paginas.push({ label: 'lijst', url: bron.url });
  for (const z of bron.zoekparameters || []) paginas.push(z);
  const resultaat = { id: bron.id, naam: bron.naam, url: bron.url, soort: bron.soort, status: 'fout', aantal: 0, uitgefilterd: 0, fout: null, paginas: [] };
  const kandidaten = new Map();
  // De tijdslimiet loopt pas vanaf het eerste echte verzoek: wachten op een andere bron van dezelfde site telt niet mee.
  let afgebroken = false, timer = null, opTijd;
  const limiet = bronTimeout(paginas.length);
  const tijdOp = new Promise(r => { opTijd = r; });
  const gestart = () => { if (!timer) timer = setTimeout(() => { afgebroken = true; opTijd(); }, limiet); };
  const werk = (async () => {
    for (const pag of paginas) {
      if (afgebroken) break;
      const { res, kandidaten: k } = await scanPagina(bron, pag, gestart);
      resultaat.paginas.push(res);
      for (const c of k) {
        const oud = kandidaten.get(c.url);
        if (oud) { if (pag.zoekterm && !oud.zoektermen.includes(pag.zoekterm)) oud.zoektermen.push(pag.zoekterm); continue; }
        kandidaten.set(c.url, { ...c, zoektermen: pag.zoekterm ? [pag.zoekterm] : [] });
      }
    }
  })();
  await Promise.race([werk, tijdOp]);
  clearTimeout(timer);
  if (afgebroken) resultaat.fout = `timeout na ${Math.round(limiet / 1000)} s (${resultaat.paginas.length}/${paginas.length} pagina's)`;
  const p = resultaat.paginas;
  resultaat.aantal = kandidaten.size;
  resultaat.uitgefilterd = p.reduce((s, x) => s + x.uitgefilterd, 0);
  resultaat.methode = [...new Set(p.map(x => x.methode).filter(Boolean))].join(', ') || null;
  resultaat.http = p.length === 1 ? p[0].http : undefined;
  if (kandidaten.size) resultaat.status = 'ok';
  else if (p.some(x => x.status === 'leeg')) resultaat.status = 'leeg';
  const fouten = p.filter(x => x.status === 'fout').map(x => (paginas.length > 1 ? `${x.label}: ` : '') + x.fout);
  if (fouten.length) resultaat.fout = [resultaat.fout, ...fouten.slice(0, 5), fouten.length > 5 ? `(+${fouten.length - 5} meer)` : ''].filter(Boolean).join('; ');
  if (p.length === 1) { resultaat.paginatitel = p[0].paginatitel; resultaat.tekstLengte = p[0].tekstLengte; if (p[0].melding) resultaat.melding = p[0].melding; const eind = p[0].eindUrl || (p[0].url !== bron.url ? p[0].url : null); if (eind) resultaat.eindUrl = eind; }
  if (p.length <= 1) delete resultaat.paginas;
  resultaat.duurSec = Math.round((Date.now() - start) / 1000);
  return { resultaat, kandidaten: [...kandidaten.values()] };
}

// ---------- hoofdprogramma ----------
const sleutelVan = b => [b.hoofdpaginaOverslaan ? '' : normUrl(b.url), ...(b.zoekparameters || []).map(z => normUrl(z.url))].join(' ');
let bronnen = config.bronnen;
if (alleen.length) bronnen = bronnen.filter(b => alleen.includes(b.id));
const groepen = new Map(); // dezelfde lijst-URL maar één keer openen
for (const b of bronnen) { const k = sleutelVan(b); if (!groepen.has(k)) groepen.set(k, []); groepen.get(k).push(b); }
const taken = [...groepen.values()];
log(`${bronnen.length} bronnen, ${taken.length} unieke lijsten, ${PARALLEL} tegelijk`);

const overzicht = new Map(), alleKandidaten = [];
let klaar = 0;
const aantalTaken = taken.length;
const bezig = new Map(); // host -> aantal werkers
const hostVanTaak = g => { const b = g[0]; try { return hostVan(b.hoofdpaginaOverslaan && b.zoekparameters?.length ? b.zoekparameters[0].url : b.url); } catch { return ''; } };
async function werker() {
  while (taken.length) {
    // Nooit twee bronnen van dezelfde site tegelijk: wacht tot er een bron van een vrije site is.
    const i = taken.findIndex(g => !bezig.get(hostVanTaak(g)));
    if (i < 0) { await sleep(500); continue; }
    const groep = taken.splice(i, 1)[0];
    const h = hostVanTaak(groep);
    bezig.set(h, (bezig.get(h) || 0) + 1);
    const [hoofd, ...rest] = groep;
    let r;
    try { r = await scanBron(hoofd); } catch (e) { r = { resultaat: { id: hoofd.id, naam: hoofd.naam, url: hoofd.url, soort: hoofd.soort, status: 'fout', aantal: 0, fout: e.message }, kandidaten: [] }; }
    overzicht.set(hoofd.id, r.resultaat);
    for (const b of rest) overzicht.set(b.id, { id: b.id, naam: b.naam, url: b.url, soort: b.soort, status: 'gedeeld', zieBron: hoofd.id, aantal: r.resultaat.aantal });
    const ookVoor = rest.map(b => b.naam);
    for (const c of r.kandidaten) {
      const k = { bron: hoofd.naam, bronId: hoofd.id, titel: c.titel, url: c.url, context: c.context };
      if (c.werkgever) k.werkgever = c.werkgever;
      if (c.zoektermen.length) k.zoektermen = c.zoektermen;
      if (ookVoor.length) k.ookVoor = ookVoor;
      alleKandidaten.push(k);
    }
    bezig.set(h, bezig.get(h) - 1);
    klaar++;
    log(`[${klaar}/${aantalTaken}] ${hoofd.id}: ${r.resultaat.status}, ${r.resultaat.aantal} kandidaten${r.resultaat.fout ? ` (${r.resultaat.fout.slice(0, 120)})` : ''} [${r.resultaat.methode || '-'}, ${r.resultaat.duurSec ?? '?'} s]`);
  }
}
const t0 = Date.now();
try { await Promise.all(Array.from({ length: Math.min(PARALLEL, aantalTaken) }, werker)); }
finally { if (browser) await browser.close().catch(() => {}); }

let lijst = bronnen.map(b => overzicht.get(b.id)).filter(Boolean);
let kandidatenUit = alleKandidaten;
if (bijwerken && existsSync(uitvoer)) {
  const oud = JSON.parse(readFileSync(uitvoer, 'utf8'));
  const nieuw = new Map(lijst.map(x => [x.id, x]));
  const oudPerId = new Map((oud.overzicht || []).map(x => [x.id, x]));
  lijst = config.bronnen.map(b => nieuw.get(b.id) || oudPerId.get(b.id)).filter(Boolean);
  kandidatenUit = (oud.kandidaten || []).filter(k => !nieuw.has(k.bronId)).concat(alleKandidaten);
}
const tel = s => lijst.filter(x => x.status === s).length;
const out = {
  gemaakt: new Date().toISOString(),
  bronbestand: bronbestand.startsWith(root) ? bronbestand.slice(root.length + 1) : bronbestand,
  duurSec: Math.round((Date.now() - t0) / 1000),
  instellingen: { maxKandidatenPerPagina: MAX_KANDIDATEN, parallel: PARALLEL, pauzePerSiteMs: PAUZE_PER_SITE_MS, playwright: !!pw },
  totaal: {
    bronnen: lijst.length, ok: tel('ok'), leeg: tel('leeg'), fout: tel('fout'), gedeeld: tel('gedeeld'),
    kandidaten: kandidatenUit.length, uniekeUrls: new Set(kandidatenUit.map(k => k.url)).size,
  },
  ...(bijwerken ? { bijgewerkt: bronnen.map(b => b.id) } : {}),
  overzicht: lijst,
  kandidaten: kandidatenUit,
};
mkdirSync(dirname(resolve(uitvoer)), { recursive: true });
writeFileSync(uitvoer, JSON.stringify(out, null, 2) + '\n');
log(`Klaar in ${out.duurSec} s: ${out.totaal.ok} ok, ${out.totaal.leeg} leeg, ${out.totaal.fout} fout, ${out.totaal.gedeeld} gedeeld; ${out.totaal.kandidaten} kandidaten -> ${uitvoer}`);
process.exit(0);
