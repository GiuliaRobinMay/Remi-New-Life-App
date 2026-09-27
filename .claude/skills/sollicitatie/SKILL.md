---
name: sollicitatie
description: Zet een vacature of een organisatie om in een aangepast Nederlands cv, een motivatiebrief en een sollicitatiemail voor Remi, en registreer de sollicitatie in de app. Gebruik dit wanneer Giulia of Remi een vacaturetekst, een link of de naam van een organisatie geeft en vraagt om te solliciteren, een spontane sollicitatie voor te bereiden, op te volgen of te reageren op een antwoord.
---

# Sollicitatie voorbereiden voor Remi

Alles wat naar buiten gaat is in het Nederlands (Vlaams), met "u" tegenover de werkgever, zonder uitroeptekens, zonder emoji, zonder motiverende taal. Eén A4 per brief. De naam is Remi met een i.

## Bronnen die je eerst leest
- `data/profiel.json` en `data/cv-master.json` (feiten over Remi; vierkante haken zijn nog in te vullen door Giulia of Remi, laat ze staan of vraag ernaar)
- `research/02-solliciteren-in-vlaanderen.md` (conventies, aanhef, opvolging, overheid, loon)
- `documents/templates/motivatiebrief-basis.md` en `documents/templates/mails.md`
- `data/hotlist.json` als de organisatie erin staat (contact, instap, rollen)

## Stappen
1. Lees de vacature of de organisatie. Noteer: organisatie, functietitel, referentie, contactpersoon, e-mail of formulier, deadline, drie kernvereisten, toon van de tekst (formeel of "je"), of het een overheid is (dan geldt het online formulier en de niveaus C en D).
2. Kies de slug: `<organisatie>-<functie>` in kleine letters zonder accenten, bijvoorbeeld `kmska-technisch-medewerker`. Maak `documents/generated/<slug>/`.
3. Schrijf `cv.json`: alleen de velden die afwijken van het master-cv. Meestal: `titel` (ondertitel onder de naam), `profiel` (vijf zinnen, gericht op deze organisatie), eventueel de volgorde en formulering van `taken` en `vaardigheden` zodat de drie kernvereisten bovenaan staan. Verzin geen ervaring, certificaten of data. Wat niet vaststaat blijft tussen vierkante haken.
4. Schrijf `brief.md`: de motivatiebrief op basis van het sjabloon, één A4, met een concrete haak (iets wat de organisatie echt doet), waarom deze organisatie, twee of drie troeven met een voorbeeld, een concreet voorstel (gesprek, werkbezoek, proefdag, stage of IBO-start in januari of februari 2027), en de juiste aanhef. Vermeld nooit vakbond, gezondheid of burn-out. De vertrekreden, als die ter sprake komt, is "toe aan een nieuwe uitdaging waarin ik mijn vakmanschap kan inzetten voor erfgoed en ontwerp".
5. Schrijf `mail.md`: onderwerp en korte mailtekst (sollicitatiemail of spontane sollicitatie), met vermelding van de bijlagen.
6. Schrijf `meta.json`: `{"organisatie":"...","functie":"...","datum":"JJJJ-MM-DD","type":"vacature|spontaan|stage","bron":"url","contact":"naam","email":"..."}`.
7. Draai `npm run build:data` zodat de app de documenten toont. Voor een pdf: `npm run pdf <slug>` (of open `app/cv.html?variant=<slug>` en druk af).
8. Registreer de sollicitatie: zeg Giulia of Remi om in de app onder Sollicitaties een record te maken met dezelfde slug in het veld "Map in documents/generated", of voeg het record toe in `data/sollicitaties.json` als zij dat vragen. Status "in voorbereiding" tot het verstuurd is.
9. Geef in het gesprek een korte samenvatting: wat er geschreven is, wat nog ingevuld moet worden, en de voorgestelde opvolgdatum (verzenddatum plus 10 tot 14 dagen).

## Versturen en opvolgen
- Versturen doen Giulia of Remi zelf vanuit Remi's mailadres, of via de Gmail-koppeling van Giulia als zij dat vraagt (dan een concept aanmaken, niet meteen verzenden).
- Opvolgen: één opvolgmail 10 tot 14 dagen na verzending (sjabloon in `mails.md`). Na een gesprek: bedankmail binnen 48 uur. Na een afwijzing: vraag om feedback en om de werfreserve.
- Overheid (Vlaamse overheid, Stad Antwerpen, federaal): solliciteren via het online formulier, in het Nederlands, met de standaardcompetenties (verantwoordelijkheid nemen, samenwerken, zorgvuldigheid, klantgerichtheid, plannen en organiseren, flexibiliteit); bereid een STARR-voorbeeld per competentie voor.

## Wat je nooit doet
- Emoji, uitroeptekens, Nederlands-Nederlandse woorden (baan, salaris, mbo, uitzendbureau): gebruik job, loon, secundair onderwijs, interimkantoor.
- Verzonnen feiten over Remi. Geen "Remy".
- Het lasvak fysiek zwaar noemen in een brief; zeg wat hij wil, niet wat hij ontvlucht.
- TIG-lassen of aluminium als vaststaand noemen zolang vraag p09 van de vragenlijst dat niet bevestigt. Zeker zijn: technisch tekenaar en verantwoordelijke atelier (maatwerk plaatmateriaal, sinds 2021), plooien, halfautomaat- en elektrodelassen.
- Een leeftijd noemen; die is nog niet bevestigd.
