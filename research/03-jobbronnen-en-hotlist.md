# Onderzoek 3: Jobbronnen en hotlist (Vlaanderen en Antwerpen, september 2026)

Language note: English working document. The structured, Dutch version lives in data/jobbronnen.json and data/hotlist.json, which the app renders. Verification legend: [IDX] the URL appeared verbatim in a search index this session (page exists, not fetched); [PATTERN] constructed from an indexed pattern; [UNVERIFIED] background knowledge; [NOT FOUND] searched, nothing surfaced. No page could be fetched from this environment, so every URL must be re-checked with a live fetch before it is trusted.

## 1. Job sites

| Site | URL | Search pattern | Feed or API | Scraping | Relevance |
|---|---|---|---|---|---|
| VDAB | https://www.vdab.be/vindeenjob [IDX] | SEO pages `/vindeenjob/jobs/<term>-<place>` e.g. `/jobs/lasser-antwerpen-provincie` (532 jobs), `/jobs/restauratie` (423), `/jobs/erfgoed`, `/jobs/cultuur`, `/jobs/jobs-culturele-sector`, `/jobs/onderwijs`; filter `?f=provincie:antwerpen-provincie` [IDX] | Open Services API: https://developer.vdab.be/openservices/ product 756 "Vacatures" v3.2.2, GET search with filters, POST bulk by id, 2.000 calls per minute, free tier [IDX]. Email alerts after login. | Server-rendered SEO pages; API is the correct route | Primary source, also carries onderwijs, overheid and museum jobs |
| Cultuurjobs.be | https://www.cultuurjobs.be/ [IDX]; per organisation `/organisatie/<slug>/` (m-hka, mas, momu, fomu, middelheimmuseum, toneelhuis, opera-ballet-vlaanderen, koninklijke-academie-voor-schone-kunsten-antwerpen, herita-vzw); per place `/plaats/antwerpen/`; category `/categorie/productie/` | WordPress, `/feed/` likely [UNVERIFIED] | Probably none | Best single culture board |
| FARO (erfgoed) | https://faro.be/vacatures [IDX] | | | | Key for heritage |
| Herita | https://www.herita.be/nl/vacatures [IDX] | | | | Heritage, Open Monumentendag |
| publiq vacaturebank | https://www.publiq.be/nl/vacaturebank [IDX] | | | | Culture and leisure |
| Sociare | https://www.sociare.be/nl/vacatures [IDX] (also points to socius.be, 11.be, jeugdwerkjobs.be) | | | | Socio-cultural, youth work |
| Werken voor Vlaanderen | https://www.werkenvoorvlaanderen.be [IDX]; VDAB mirror `/vindeenjob/jobs/werken-voor-vlaanderen-vacatures` (601) | | | | Onroerend Erfgoed, Het Facilitair Bedrijf, Vlaamse instellingen |
| werkenvoor.be (federaal) | https://werkenvoor.be/nl/jobs [IDX] | | | | KIK-IRPA, FOD Justitie, Rijksarchief |
| Stad Antwerpen | https://job.antwerpen.be/ [IDX]; all vacancies `/go/Alle-vacatures/4474301/` | | | | MAS, Plantin-Moretus, Rubenshuis, Red Star Line, Letterenhuis, Middelheim, stadsgebouwen, Kunstenlab |
| Provincie Antwerpen | https://jobs.provincieantwerpen.be/ [IDX] (CVWarehouse, alert sign-up) | | | | Monumentenwacht Antwerpen, CVO Vitant, provincial domains |
| Stedelijk Onderwijs Antwerpen | https://jobs.stedelijkonderwijs.be/ [IDX]; job alert https://stedelijkonderwijs.career.emply.com/job-alert | Emply alert | | | CVO Encora, secondary schools |
| Onderwijs boards | https://www.onderwijsvacatures.be/ [IDX]; https://onderwijswerkt.be/vacatures [IDX]; GO! https://g-o.be/jobs/ [IDX]; how-to https://www.klasse.be/3963/hoe-solliciteer-ik-in-het-onderwijs/ | | | | Teaching track |
| SYNTRA | https://jobs.syntra-ab.be/ [IDX]; https://www.syntra-ab.be/vacatures-bij-syntra-ab; spontane docent sollicitatie via CVWarehouse [IDX] | | | | Teaching track |
| Flanders DC | https://www.flandersdc.be/nl/vacatures/overzicht [IDX] | | | | Design |
| StepStone | https://www.stepstone.be/vacatures/lasser [IDX]; `/vacatures/in-antwerpen` | none | bot protection likely | Secondary |
| Indeed | https://be.indeed.com/q-lasser-l-antwerpen-vacatures.html [IDX]; https://be.indeed.com/Restauratie-jobs | none | Heavy (Cloudflare, CAPTCHA) | Deep links only |
| LinkedIn | https://be.linkedin.com/jobs/lasser-jobs [IDX] | none | Heavy, ToS forbids scraping | Networking only |
| Vacature.com | `/nl-be/jobs/zoeken/<term>+<place>/1` [PATTERN] | | | | Secondary |
| Jobat | site exists; reached via aggregators (Jobted) | | | | Secondary |
| Interim | Randstad `/werknemers/jobs/s-metaal/s2-lassers/r-lasser/re-antwerpen/ci-antwerpen/` [IDX]; Adecco `/nl-be/vacatures/jobs-voor-lassers/`; Accent `/nl/vacatures/antwerpen/techniek-productie/lasser` (39) | | server-rendered | Safety net |
| Aggregators | Jooble https://be.jooble.org/vacatures-lasser/Antwerpen (365); Jobted | | | | Coverage |
| Technical | technicus.be, techniekerjobs.be, techniekjobs.be, bouwjobs.be, architectenjobs.be [IDX] | | | | Safety net |

Conclusion for the app: build the search layer on (1) the VDAB Open Services API, (2) server-rendered pages of cultuurjobs.be, faro.be, job.antwerpen.be, jobs.provincieantwerpen.be, jobs.stedelijkonderwijs.be, Randstad, Accent, Adecco, (3) deep links for Indeed and LinkedIn. Because this environment cannot reach any of these hosts, the first version of the app ships curated deep links and a paste-to-import flow; the fetcher is documented for a machine with network access.

## 2. Hotlist (full structured version in data/hotlist.json)

Heritage and restoration: Monumentenwacht Vlaanderen (vzw, ~60 staff, monumentenwachters inspect buildings, rope-access trained; https://www.monumentenwacht.be/vacatures), Monumentenwacht Antwerpen (Prov, Ruggeveldlaan 99 Deurne, monumentenwacht@provincieantwerpen.be, 03 203 67 80), Agentschap Onroerend Erfgoed (VO, spontaneous CV welcome at vacatures@onroerenderfgoed.be, vacancies via werkenvoorvlaanderen.be), KIK-IRPA (federal, Brussel, hr@kikirpa.be, ateliers glas, keramiek, hout, steen, textiel, schilderijen; metal atelier [UNVERIFIED]), Verstraete & Vanhecke (NV, Wilrijk, https://v-v.be/vacatures/), Artes Group (Gent, Antwerp sites, https://artesgroup.be/vacatures), Monument Group (Ingelmunster, spontaneous applications invited, https://jobs.monument.be), Renotec (Geel, jobs@renotec.be, own steenkapperij and glas-in-lood), Altritempi (Leest, [UNVERIFIED]), Denys (Wondelgem), Smego Metaalwerken (Arendonk, metal restoration, https://smego.be/contact), Art Design & Craft (kunstsmid.net, Brecht), Lapis Arte (conservatie-restauratie steen, metaal, muurschilderkunst), AltNova (smeedwerk en gietijzer), Van Impe Constructies (restauratie smeedwerk), Smederij De Bruyn (Erembodegem). Training pointer: Academie Anderlecht, kunstambacht restauratie smeedwerk (evening).

Teaching: SYNTRA AB (no teaching degree required; screening, selectiegesprek, proefles; subsidised courses give an employee contract, non-subsidised need a zelfstandige in bijberoep; indicative €35 to €55 per hour), CVO Encora (Stedelijk Onderwijs), CVO Vitant (Provinciaal Onderwijs), GO! CVO Antwerpen, AP Hogeschool / KASKA (job alert https://www.ap-arts.be/news/job-alert), stedelijke academies (DKO) [UNVERIFIED].

Cultural institutions: KMSKA (VO, own restauratieatelier since 1999, tentoonstellingsproductie team; sollicitaties@kmska.be; Open restauratieatelier every two months), M HKA (VO, spontaneous applications and job alerts via https://muhka.careersite.be/nl; HR katrien.geets@muhka.be), MoMu, FOMU, Middelheimmuseum (Stad, outdoor metal sculpture maintenance, middelheimmuseum@antwerpen.be), MAS (Stad, recent Projectmedewerker maritiem erfgoed), Museum Plantin-Moretus, Rubenshuis, Red Star Line, Letterenhuis (all Stad, pooled collectiebeheer and technical services), DIVA (vzw), Toneelhuis (vzw, technical team and decoratelier, internships each season, personeelszaken@toneelhuis.be with CV, motivation and a concrete proposal), deSingel (vzw), Opera Ballet Vlaanderen (vzw, 400+ staff, decoratelier in Zele, Set Design Studio), Zuiderpershuis (venue, not a workshop employer), Laika (Borgerhout), Decoratelier Jozef Wouters (Molenbeek), exhibition builders Meyvaert (Gent, museum vitrines), Potteau Labo (Kortrijk), Bruns (NL), Wondering (Gent), Twin Design, Total Concept (Ranst, wood, metal and foam decors), Atento Atelier, atelier 20+03. Stad Antwerpen technical roles (Kunstenlab OLT/Arenberg technisch coördinator, stadsgebouwen). Het Facilitair Bedrijf (VO). Bovenbouw Architectuur and Studio Farris (Antwerp architecture, metal-heavy detailing).

Reserve: VITO (Mol), KU Leuven Bouwmaterialen, Thomas More, KdG, UAntwerpen ATP, UGent ATP, Orteam (orthopaedics, Waasmunster), V!GO, Ottobock, Achielle, Jaegher, O DDur, Felix Cycles.

## 3. Teaching entry

SYNTRA AB docent: CV screening, selectiegesprek, proefles; spontaneous applications always accepted. CVO and secondary praktijkvakken: bekwaamheidsbewijs = basisdiploma plus optional pedagogical certificate (BPB) plus nuttige ervaring; services outside education as employee or self-employed count; with a secondary diploma at least 3 years of recognised nuttige ervaring; applies to leraar SO praktijkvakken, leraar SVWO (CVO), technisch adviseur; from 1 September 2025 private-sector teaching also counts; "Educatief graduaat in het secundair onderwijs lassen-constructie" is a listed qualification. Educatief graduaat (AP, KdG): admission with 5 years of experience, or 3 years plus a relevant studiebewijs or VDAB beroepscertificaat; LIO track exists. To verify: how years before age 18 or during leertijd count.

## 4. Knelpuntberoepen 2026

Official list https://www.vdab.be/sites/default/files/media/files/Knelpuntberoepen2026.pdf (227 professions). Lasser: not confirmed this session (PDF not fetchable), on the list in earlier years; pijpfitter confirmed. Leerkracht secundair onderwijs: labelled knelpuntberoep on VDAB's beroepenfiche. The knelpuntpremie ended 31 October 2024. A VDAB beroepscertificaat in lassen would shorten the educatief-graduaat admission from 5 to 3 years.

## 5. Networking moments

- Voka Open Bedrijvendag: Sunday 4 October 2026 (visit metal and restoration firms).
- Dag van de Ambachten: Sunday 15 November 2026 (20th edition, registration closes 6 November).
- Open Ateliers Antwerpen 2026: overview show at Zuiderpershuis, vernissage 25 September 2026.
- KMSKA Open restauratieatelier: every two months.
- Erfgoeddag 2027: Sunday 18 April 2027, theme "Passie" (makers, ambacht).
- Antwerp Art Weekend 2027: 6 to 9 May 2027.
- Museumnacht Antwerpen 2027: not yet published, pattern first Saturday of August.
- Open Monumentendag 2027: Sunday 12 September 2027, theme "Verborgen erfgoed".
- deSingel season 2026-2027 runs through 2027.

## Sources
See the URLs listed inline; all [IDX] unless marked. Key: https://developer.vdab.be/openservices/product/756 ; https://www.cultuurjobs.be/ ; https://faro.be/vacatures ; https://www.herita.be/nl/vacatures ; https://www.publiq.be/nl/vacaturebank ; https://www.sociare.be/nl/vacatures ; https://job.antwerpen.be/ ; https://jobs.provincieantwerpen.be/ ; https://jobs.stedelijkonderwijs.be/ ; https://jobs.syntra-ab.be/ ; https://www.syntra-ab.be/docenten ; https://www.monumentenwacht.be/vacatures ; https://www.onroerenderfgoed.be/vacatures ; https://www.kikirpa.be/en/vacancies ; https://v-v.be/vacatures/ ; https://jobs.renotec.be/nl/alle-jobs/ ; https://jobs.monument.be/en/jobs/renovation-restoration-laborer ; https://smego.be/producten/restauratie ; https://kmska.be/nl/jobs ; https://muhka.careersite.be/nl ; https://toneelhuis.be/nl/over-toneelhuis/vacatures-stages/ ; https://www.operaballet.be/en/werken-bij-opera-ballet-vlaanderen/careers ; https://www.meyvaert.com/nl/careers/vacatures ; https://www.ap-arts.be/news/job-alert ; https://www.agodi.be/job-in-het-onderwijs-bekwaamheid-nuttige-ervaring ; https://www.ap.be/graduaat/secundair-onderwijs ; https://www.vdab.be/trends-en-cijfers/knelpuntberoepenlijst ; https://www.openmonumentendag.be/ ; https://erfgoeddag.be/blog/erfgoeddag-2027-passie ; https://antwerpartweekend.be/ ; https://www.voka.be/open-bedrijvendag ; https://dagvandeambachten.be/nl/de-dag
