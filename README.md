# Remi, nieuwe start

Privé-app voor Remi en Giulia om de overstap van het huidige laswerk naar een nieuwe richting te organiseren: rechten bij de uitstap, stappenplan, planning, vacatures zoeken, hotlist van organisaties, sollicitaties opvolgen, verkenning van werkvelden, opleidingsroutes, profiel en documenten (cv, brieven, mails, VDAB-profieltekst). De app is in het Nederlands; alles wat naar werkgevers gaat gebruikt "u".

## Snel starten
```
npm start
```
Bouwt `app/js/seed.js` uit `data/*.json` en `documents/` en serveert de app op http://localhost:4173. Zonder server werkt de app ook: open `app/index.html` na `npm run build:data` (de cv-varianten en sjablonen zitten dan al in de seed).

Andere opdrachten: `npm run build:data` (seed bijwerken na wijzigingen in data of documents), `npm run pdf [slug]` (cv naar pdf met Chromium), `npm run screenshots` (visuele controle, vereist het pakket playwright).

## Online zetten (Vercel of een andere statische host)
De app staat in de map `app/`. De root bevat een `index.html` die doorstuurt naar `app/index.html`, en `vercel.json` doet hetzelfde met een redirect, dus een Vercel-project op deze repository werkt zonder extra instellingen. Het adres van de app is dan `https://<project>.vercel.app/app/index.html`. Andere statische hosts: publiceer de map `app/`. Na elke wijziging in `data/` of `documents/` eerst `npm run build:data` draaien en `app/js/seed.js` mee committen, want de online versie leest alleen die seed.

## Hoe het samenwerkt
- `data/*.json` is de bron van waarheid voor profiel, rechten, programma, stappenplan, hotlist, jobbronnen, verkenning, opleidingen en het master-cv. Claude Code onderhoudt deze bestanden op vraag.
- De app bewaart wijzigingen (statussen, notities, sollicitaties, vacatures) in de browser (localStorage). Via het tandwiel rechtsboven exporteer of importeer je een JSON-bestand om te delen tussen Giulia en Remi, of geef je het aan Claude om in `data/` vast te leggen.
- `documents/generated/<slug>/` bevat per sollicitatie het aangepaste cv (`cv.json`), de brief (`brief.md`) en de mail (`mail.md`). De werkwijze staat in `.claude/skills/sollicitatie/SKILL.md`: geef Claude een vacature en de map vult zich.
- `app/cv.html` rendert het cv in de documentidentiteit van de eerdere pdf's (Caladea, Poppins, koper) en drukt af naar A4; `?variant=<slug>` toont een aangepaste versie.
- `research/` bevat de negen onderzoeksdocumenten van 27 september 2026 met bronnen en verificatiestatus.

## Stijl
De app gebruikt de klassennamen van Giulia's Studiolo-thema (`.shell`, `.sidebar`, `.chrome`, `.tabs`, `.grid2`, `.peek`, `.card`, `.badge`, `.btn`, `accent-*`). Het meegeleverde `app/css/studiolo-theme.css` is een voorlopige implementatie: vervang het door het echte `studiolo-theme.css` en de app neemt de echte stijl over. `app/css/app.css` bevat alleen aanvullingen.

## Vacatures automatisch ophalen (later)
Vanuit de browser kunnen jobsites niet gelezen worden. Een kleine server met netwerktoegang kan dat wel: VDAB heeft een gratis Open Services API (developer.vdab.be, product Vacatures), en cultuurjobs.be, faro.be, job.antwerpen.be, jobs.provincieantwerpen.be, Randstad en Accent zijn serverzijde leesbaar. Indeed en LinkedIn alleen als doorkliklinks. Zie `research/03-jobbronnen-en-hotlist.md`.

## Conventies
Geen emoji, geen uitroeptekens, warme neutrale toon, Vlaamse woordenschat, bedragen als €2.500. De naam is Remi.
