# Documenten

- `templates/` bevat de Nederlandse basisdocumenten: motivatiebrief, mailsjablonen, VDAB-profieltekst.
- `../data/cv-master.json` is de bron van het master-cv. De afdrukversie staat in `../app/cv.html` (open via de app, Documenten, of via `npm start` en dan http://localhost:4173/cv.html). Bewaren als pdf via de afdrukfunctie van de browser, of met `npm run pdf`.
- `generated/<slug>/` bevat per sollicitatie de aangepaste versie: `cv.json` (overschrijft velden van het master-cv, zoals profiel en volgorde), `brief.md` (motivatiebrief) en `mail.md` (mailtekst). De app toont ze onder Documenten en koppelt ze aan de sollicitatie.

De werkwijze om een vacature om te zetten in een aangepast cv en brief staat in `../.claude/skills/sollicitatie/SKILL.md`.
