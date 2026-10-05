// Gegenereerd door scripts/build-data.mjs op 2026-10-05T17:23:25.028Z. Niet met de hand bewerken: pas data/*.json aan en draai npm run build:data.
export const seed = {
 "berichten": [
  {
   "id": "msg-contract-mail",
   "soort": "mail",
   "titel": "Kopie van het arbeidscontract vragen",
   "aan": "Werkgever (zaakvoerder of personeelsdienst)",
   "wanneer": "Nu, zodat je de kopie hebt voor de ACV-afspraak van vrijdag 16 oktober.",
   "onderwerp": "Vraag om een kopie van mijn arbeidsovereenkomst",
   "tekst": "Beste [naam],\n\nIk vind mijn exemplaar van mijn arbeidsovereenkomst niet meer terug. Mag ik u vragen mij een kopie te bezorgen, samen met de bijlagen en eventuele wijzigingen sinds mijn indiensttreding? Graag ontvang ik ook een kopie van het arbeidsreglement.\n\nEen kopie per mail is voor mij prima. Zou dat lukken tegen woensdag 14 oktober?\n\nAlvast bedankt.\n\nMet vriendelijke groeten\n\nRemi [achternaam]",
   "tips": [
    "Stuur dit per mail, niet mondeling: zo heb je een spoor van je vraag. Bewaar de verzonden mail.",
    "Geef geen reden op. Een uitleg is niet nodig en zegt niets over je plannen.",
    "Zeg je 'je' tegen je baas, pas de mail dan gerust aan. De vraag zelf blijft dezelfde.",
    "Een voltijds contract van onbepaalde duur moet niet altijd op papier staan. Is er geen geschreven contract, dan tonen je loonfiches (datum van indiensttreding, statuut, paritair comité) de belangrijkste gegevens. Neem ze mee naar ACV.",
    "Komt er na een week geen antwoord, gebruik dan de brief bij Brieven en bespreek het eerst met ACV."
   ],
   "status": "concept"
  },
  {
   "id": "msg-contract-brief",
   "soort": "brief",
   "titel": "Herinnering: kopie van het arbeidscontract",
   "aan": "Werkgever (zaakvoerder of personeelsdienst)",
   "wanneer": "Pas als de mail na een week geen antwoord kreeg, en na overleg met ACV.",
   "onderwerp": "Betreft: kopie van mijn arbeidsovereenkomst",
   "tekst": "Remi [achternaam]\n[straat en nummer]\n[postcode en gemeente]\n\n[naam van het bedrijf]\nt.a.v. [naam zaakvoerder of personeelsdienst]\n[straat en nummer]\n[postcode en gemeente]\n\nAntwerpen, [datum]\n\nBetreft: kopie van mijn arbeidsovereenkomst\n\nGeachte [heer of mevrouw] [naam],\n\nOp [datum van de mail] vroeg ik per mail een kopie van mijn arbeidsovereenkomst en van het arbeidsreglement. Omdat ik die nog niet ontving, herhaal ik mijn vraag met deze brief.\n\nIk vraag u mij een kopie te bezorgen van:\n- mijn arbeidsovereenkomst, met de bijlagen en eventuele wijzigingen sinds mijn indiensttreding;\n- het arbeidsreglement.\n\nU mag de documenten mailen naar [e-mailadres] of mij een papieren kopie geven.\n\nMet vriendelijke groeten\n\nRemi [achternaam]",
   "tips": [
    "Maak twee exemplaren. Geef er een af en laat het tweede dateren en tekenen voor ontvangst, of stuur de brief aangetekend.",
    "Bespreek de brief eerst met ACV. Zij kunnen de vraag ook zelf aan de werkgever richten."
   ],
   "status": "concept"
  },
  {
   "id": "msg-verwittiging-brief",
   "soort": "brief",
   "titel": "Reactie op de verwittiging",
   "aan": "Werkgever (wie de verwittiging ondertekende)",
   "wanneer": "Alleen na overleg met ACV. Bel ACV deze week.",
   "onderwerp": "Betreft: uw verwittiging van [datum van de brief]",
   "tekst": "Remi [achternaam]\n[straat en nummer]\n[postcode en gemeente]\n\n[naam van het bedrijf]\nt.a.v. [naam en functie van wie de brief ondertekende]\n[straat en nummer]\n[postcode en gemeente]\n\nAntwerpen, [datum]\n\nBetreft: uw aangetekende brief van [datum van de brief]\n\nGeachte [heer of mevrouw] [naam],\n\nIk heb uw aangetekende brief van [datum van de brief] goed ontvangen en neem kennis van de inhoud.\n\nIk begrijp dat mijn late aankomst de planning en mijn collega's belast. Vanaf nu begin ik elke dag op het afgesproken uur. Als ik toch verhinderd ben, verwittig ik u vooraf.\n\n[Enkel als ACV het aanraadt: De voorbije weken had ik gezondheidsklachten waarvoor ik onder medische opvolging sta. Dat maakte het begin van de dag zwaar. Ik schrijf dit niet om het goed te praten, maar zodat u de context kent.]\n\n[Enkel als een datum niet klopt: Volgens mijn eigen gegevens klopt (datum) niet, omdat (feitelijke uitleg).]\n\n[Enkel als ACV het aanraadt: Deze brief doet geen afbreuk aan mijn rechten, ook niet wat de geldigheid van de verwittiging betreft.]\n\nIk vraag u deze brief bij mijn personeelsdossier te voegen.\n\nMet vriendelijke groeten\n\nRemi [achternaam]",
   "tips": [
    "Stuur niets voor ACV de brief gezien heeft. Soms is zwijgen beter, soms is een antwoord nodig om je kant in het dossier te krijgen.",
    "'Ik neem kennis van de inhoud' bevestigt dat je de brief kreeg, zonder elke datum toe te geven.",
    "Kort en feitelijk: geen excuses voor dingen die niet kloppen, geen emotie, geen verwijten.",
    "Over je gezondheid geef je geen details. Een zin over medische opvolging volstaat, en alleen als ACV het aanraadt.",
    "Twee exemplaren: een afgeven en het tweede laten tekenen voor ontvangst, of aangetekend versturen."
   ],
   "status": "concept"
  },
  {
   "id": "msg-later-sms",
   "soort": "bericht",
   "titel": "Verwittigen dat je later bent",
   "aan": "Werkgever of je rechtstreekse chef",
   "wanneer": "Vóór het beginuur, telkens als je weet dat je later zult zijn.",
   "onderwerp": "Later vandaag",
   "tekst": "Goedemorgen [naam], ik ben vandaag later. Ik verwacht om [uur] te beginnen. Mijn excuses. Remi",
   "tips": [
    "Stuur het vóór het beginuur, niet erna.",
    "Per sms of mail, niet alleen telefonisch: zo is er een spoor. Bel je, stuur dan ook kort een bericht.",
    "Noteer het daarna in het logboek."
   ],
   "status": "concept"
  },
  {
   "id": "msg-ziek-sms",
   "soort": "bericht",
   "titel": "Ziekmelding",
   "aan": "Werkgever of je rechtstreekse chef",
   "wanneer": "Vóór het beginuur, op de eerste dag dat je niet kan werken.",
   "onderwerp": "Ziek vandaag",
   "tekst": "Goedemorgen [naam], ik ben ziek en kan vandaag niet komen werken. Ik ga naar de dokter en bezorg u het attest. Remi",
   "tips": [
    "Ga dezelfde dag naar de dokter of de huisartsenwachtpost en vraag een attest.",
    "Bezorg het attest binnen de termijn van het arbeidsreglement, vaak 2 werkdagen. Hou een kopie of foto bij.",
    "Je hoeft je werkgever niet te zeggen wat je hebt."
   ],
   "status": "concept"
  }
 ],
 "competenties": {
  "inleiding": "Deze scan is voor jou, niet voor een werkgever: hij helpt je zien waar je sterk staat en voor welke competenties je al een goed voorbeeld hebt. Lees per competentie de vier gedragsindicatoren en geef jezelf een score van 1 tot 5, eerlijk en zonder je met anderen te vergelijken. Schrijf daarna één concreet voorbeeld volgens STARR: situatie, taak, actie, resultaat en reflectie. Het voorbeeld dat klaarstaat is een mogelijke situatie uit je loopbaan, geen verslag van wat echt gebeurde: gebruik het alleen als het zo gebeurd is, vul alles tussen vierkante haakjes in of schrijf een eigen voorbeeld, en lees de voorgestelde cv-zin na voordat je hem op je cv zet.",
  "bron": "Gebaseerd op algemene competentiekaders die in Vlaanderen gebruikt worden, zoals het competentiewoordenboek van de Vlaamse overheid en de beroepsprofielen van VDAB, waarop ook de beroepskwalificaties steunen, sterk vereenvoudigd. Dit is geen officiële test en levert geen attest op.",
  "schaal": [
   {
    "waarde": 1,
    "label": "Nog niet",
    "uitleg": "Je herkent dit gedrag nauwelijks bij jezelf en vindt er geen voorbeeld van."
   },
   {
    "waarde": 2,
    "label": "Soms",
    "uitleg": "Je toont dit gedrag af en toe, vooral wanneer iemand het vraagt of voordoet."
   },
   {
    "waarde": 3,
    "label": "Meestal",
    "uitleg": "Je toont dit gedrag in de meeste situaties en kunt er een voorbeeld van geven."
   },
   {
    "waarde": 4,
    "label": "Sterk",
    "uitleg": "Je toont dit gedrag ook in moeilijke situaties en anderen rekenen erop."
   },
   {
    "waarde": 5,
    "label": "Uitgesproken sterkte",
    "uitleg": "Collega's komen hiervoor naar jou en je hebt er meerdere sterke voorbeelden van."
   }
  ],
  "groepen": [
   {
    "id": "vakmanschap-en-techniek",
    "titel": "Vakmanschap en techniek",
    "uitleg": "Het vakmanschap dat je in het atelier, in de lasopleiding en aan de academie hebt opgebouwd en dat je naar elk spoor meeneemt.",
    "competenties": [
     {
      "id": "technisch-inzicht",
      "naam": "Technisch inzicht",
      "definitie": "Begrijpen hoe materialen, machines en constructies werken en die kennis gebruiken om een werkstuk juist te maken of een probleem te verklaren.",
      "indicatoren": [
       "Leest technische tekeningen en schetsen vlot en juist.",
       "Kiest materiaal, dikte en bewerking die passen bij de functie van een werkstuk.",
       "Legt uit waarom een constructie werkt of waarom ze faalt.",
       "Stelt een machine in op basis van het materiaal en het gewenste resultaat."
      ],
      "niveaus": {
       "basis": "Voert een bewerking correct uit volgens een tekening of instructie.",
       "gevorderd": "Kiest zelf de juiste aanpak en bewerkingsvolgorde voor een nieuw werkstuk.",
       "expert": "Doorziet complexe of onbekende constructies en adviseert anderen over materiaal en techniek."
      },
      "vraag": "Denk aan een werkstuk waarbij je eerst moest begrijpen hoe iets technisch in elkaar zat voor je kon beginnen. Wat was de situatie, wat moest jij doen, hoe pakte je het aan, wat was het resultaat en wat neem je eruit mee?",
      "voorbeeld": {
       "situatie": "Een klant bracht een [kapotte console of beugel] binnen die al [aantal] keer op dezelfde plaats was gescheurd en vroeg om een identiek nieuw stuk.",
       "taak": "Ik moest een vervangstuk tekenen en maken, maar wilde eerst begrijpen waarom het origineel faalde.",
       "actie": "Ik bekeek de breuk, zag dat de scheur begon aan een lasnaad vlak bij een scherpe plooi en ging na welke belasting het stuk moest dragen. Ik stelde voor om [de plaatdikte te verhogen, de plooistraal te vergroten of de las te verplaatsen] en tekende het stuk opnieuw uit.",
       "resultaat": "De klant ging akkoord en het nieuwe stuk is sinds [periode] in gebruik zonder nieuwe breuk.",
       "reflectie": "Een stuk identiek namaken is soms de verkeerde opdracht. Ik vraag nu eerst waarom iets vervangen moet worden."
      },
      "cvZin": "Uittekenen en maakbaar maken van maatwerk in plaatmateriaal: keuze van plaatdikte, plooivolgorde en lasnaden[, bijvoorbeeld herontwerp van een vervangstuk dat telkens brak: enkel vermelden als dit zo gebeurde].",
      "gesprekVraag": "Hoe kiest u materiaal, plaatdikte en bewerking voor een werkstuk dat u nog niet eerder hebt gemaakt? Kunt u een voorbeeld geven?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "reserve"
      ]
     },
     {
      "id": "ruimtelijk-inzicht",
      "naam": "Ruimtelijk inzicht",
      "definitie": "Een object of ruimte in drie dimensies voor je zien, op basis van een tekening, een schets of een bestaand stuk.",
      "indicatoren": [
       "Zet een tekening in twee dimensies om in een beeld van het afgewerkte object.",
       "Maakt aanzichten, doorsneden en uitslagen van een driedimensionale vorm.",
       "Ziet vooraf waar onderdelen elkaar raken of in de weg zitten.",
       "Schat maten en verhoudingen in een ruimte goed in."
      ],
      "niveaus": {
       "basis": "Leest aanzichten en doorsneden van eenvoudige objecten correct.",
       "gevorderd": "Tekent zelf samengestelde objecten uit in aanzichten, doorsneden en uitslagen.",
       "expert": "Ontwerpt complexe objecten of interieurs en voorziet transport, montage en gebruik in de ruimte."
      },
      "vraag": "Beschrijf een moment waarop je een object of ruimte in je hoofd moest opbouwen voor het bestond, bijvoorbeeld een meubel, een plaatwerkstuk of een ontwerp aan de academie. Wat deed je en hoe liep het af?",
      "voorbeeld": {
       "situatie": "Mijn broer en ik maakten een [meubel, bijvoorbeeld een kast] voor een [smalle of schuine] ruimte [bij wie: familie, vrienden, bij ons thuis of bij een klant].",
       "taak": "Ik moest een ontwerp maken dat in de ruimte paste en dat in delen door de deur en langs de trap naar binnen kon.",
       "actie": "Ik mat de ruimte op, tekende het meubel in aanzichten en doorsnede en verdeelde het in modules die ter plaatse samengezet konden worden. De verbindingen tekende ik op ware grootte uit.",
       "resultaat": "Het meubel ging in [aantal] delen naar binnen en paste bij de eerste montage, met een speling van [aantal] mm.",
       "reflectie": "Ik denk nu van bij de eerste schets na over transport en montage, niet alleen over de vorm."
      },
      "cvZin": "Ontwerp en bouw van [aantal] meubels op maat [in metaal en hout, materiaal bevestigen], van opmeting en werktekening tot montage ter plaatse.",
      "gesprekVraag": "Hoe gaat u te werk wanneer u een ontwerp op papier moet omzetten naar een object dat in een bestaande ruimte moet passen?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "reserve"
      ]
     },
     {
      "id": "nauwkeurigheid",
      "naam": "Nauwkeurigheid",
      "definitie": "Werk precies en foutloos uitvoeren, ook bij kleine details en herhaalde handelingen; in selecties van de overheid heet dit zorgvuldigheid.",
      "indicatoren": [
       "Controleert maten en gegevens voor, tijdens en na een bewerking.",
       "Merkt kleine afwijkingen op en meldt of corrigeert ze meteen.",
       "Werkt volgens de afgesproken toleranties en procedures.",
       "Blijft even precies bij routinewerk als bij nieuw werk."
      ],
      "niveaus": {
       "basis": "Werkt volgens instructie en controleert het eigen werk op het einde.",
       "gevorderd": "Bouwt controles in het werkproces in en haalt fouten eruit voor ze verder gaan.",
       "expert": "Ontwerpt werkwijzen en controlemomenten die ook anderen helpen foutloos te werken."
      },
      "vraag": "Geef een voorbeeld van een keer dat een kleine fout of afwijking grote gevolgen kon hebben. Hoe merkte je ze op, wat deed je en wat was het resultaat?",
      "voorbeeld": {
       "situatie": "Een klant bezorgde maten voor [soort maatwerk, bijvoorbeeld een reeks bekledingspanelen] die in een bestaande constructie moesten passen.",
       "taak": "Als tekenaar moest ik de productietekeningen maken, zodat de stukken zonder aanpassing geplaatst konden worden.",
       "actie": "Ik vergeleek de opgegeven maten met de plannen, vond een verschil van [aantal] mm bij [onderdeel] en vroeg de klant om een controle ter plaatse voor we in productie gingen. Daarna controleerde ik van elke reeks het eerste stuk op maat.",
       "resultaat": "De [aantal] stukken pasten bij de plaatsing zonder herwerk.",
       "reflectie": "Ik vertrouw maten pas wanneer ze op twee manieren kloppen. Dat vraagt soms een extra vraag aan de klant, maar het voorkomt een volledige reeks afkeur."
      },
      "cvZin": "Opmaak van productietekeningen voor [aantal] maatwerkprojecten per jaar, met maatcontrole vooraf en controle van het eerste stuk in het atelier.",
      "gesprekVraag": "Kunt u een situatie beschrijven waarin uw nauwkeurigheid een fout heeft voorkomen?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "geschiedenis",
       "reserve"
      ]
     },
     {
      "id": "kwaliteitsgericht-werken",
      "naam": "Kwaliteitsgericht werken",
      "definitie": "Een resultaat nastreven dat aan de afgesproken norm voldoet en het werk verbeteren waar dat kan.",
      "indicatoren": [
       "Kent de kwaliteitseisen van een werkstuk en houdt eraan vast.",
       "Houdt eigen of andermans werk tegen wanneer het niet voldoet.",
       "Zoekt de oorzaak van een terugkerende fout in plaats van enkel het gevolg te herstellen.",
       "Stelt verbeteringen voor aan werkwijze, gereedschap of materiaal."
      ],
      "niveaus": {
       "basis": "Levert werk af dat aan de gevraagde norm voldoet.",
       "gevorderd": "Bewaakt de kwaliteit van het werk van een team en stuurt bij waar nodig.",
       "expert": "Zet kwaliteitsafspraken en controles op die de hele werking verbeteren."
      },
      "vraag": "Denk aan een moment waarop je werk hebt tegengehouden of opnieuw gedaan omdat het niet goed genoeg was. Wat gebeurde er, wat deed je en wat leverde het op?",
      "voorbeeld": {
       "situatie": "In het atelier moesten bij [soort werkstuk] regelmatig lasnaden bijgewerkt worden voor de stukken naar de klant konden.",
       "taak": "Als verantwoordelijke atelier moest ik ervoor zorgen dat de stukken in één keer goed het atelier verlieten.",
       "actie": "Ik bekeek met de collega's waar het misliep, zag dat de voorbereiding van de naden per persoon verschilde en legde een vaste werkwijze en een controlemoment voor het lassen vast.",
       "resultaat": "Het aantal stukken dat bijgewerkt moest worden daalde van [aantal] naar [aantal] per [week of maand].",
       "reflectie": "De oorzaak lag niet bij één persoon maar bij een onduidelijke afspraak. Ik kijk nu eerst naar het proces voor ik naar mensen kijk."
      },
      "cvZin": "Kwaliteitscontrole van plooi- en laswerk voor levering[, met een verbetering in de werkwijze, bijvoorbeeld een vaste naadvoorbereiding, en het effect op het herwerk in percentage: enkel vermelden als dit zo gebeurde].",
      "gesprekVraag": "Kunt u een voorbeeld geven van een kwaliteitsprobleem dat telkens terugkwam? Hoe hebt u de oorzaak aangepakt?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "reserve"
      ]
     },
     {
      "id": "veiligheidsbewust-werken",
      "naam": "Veiligheidsbewust werken",
      "definitie": "Werken met oog voor de eigen veiligheid, die van collega's en die van het object en de omgeving.",
      "indicatoren": [
       "Draagt de juiste beschermingsmiddelen en controleert gereedschap voor gebruik.",
       "Houdt de werkplek opgeruimd en veilig voor anderen.",
       "Spreekt collega's rustig aan op onveilig gedrag.",
       "Meldt gevaarlijke situaties en stelt een oplossing voor."
      ],
      "niveaus": {
       "basis": "Volgt de veiligheidsregels van de werkplek.",
       "gevorderd": "Ziet risico's vooraf en past de werkwijze aan voor het werk begint.",
       "expert": "Zet veiligheidsafspraken op en zorgt dat een team ze ook echt toepast."
      },
      "vraag": "Beschrijf een situatie waarin je een risico zag voor jezelf, een collega of een werkstuk. Wat deed je en wat veranderde er daarna?",
      "voorbeeld": {
       "situatie": "Bij het plooien van lange platen op de kantbank stonden collega's soms binnen het bereik van de plaat wanneer die omhoog kwam.",
       "taak": "Als verantwoordelijke atelier moest ik ervoor zorgen dat iedereen veilig kon werken zonder dat het werk stil kwam te liggen.",
       "actie": "Ik besprak de situatie met de ploeg, markeerde een vrije zone rond de machine en sprak af dat lange stukken altijd met twee geplooid worden, met één persoon die de beweging aangeeft.",
       "resultaat": "De afspraak staat nu in de werkinstructie en [resultaat, bijvoorbeeld geen bijna-ongevallen meer aan de kantbank sinds datum].",
       "reflectie": "Ik zeg zulke dingen nu meteen, ook als het werk even moet stoppen. Een korte onderbreking weegt niet op tegen een ongeval."
      },
      "cvZin": "Veilig werken aan de kantbank en in de laszone als verantwoordelijke atelier voor een ploeg van [aantal] collega's[, met een veiligheidsafspraak die je invoerde, bijvoorbeeld een vrije zone rond de kantbank: enkel vermelden als dit zo gebeurde][; VCA-basis, geldig tot datum: enkel vermelden als je het attest hebt].",
      "gesprekVraag": "Vertel eens over een keer dat u een collega moest aanspreken op onveilig werken. Hoe hebt u dat aangepakt?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "reserve"
      ]
     },
     {
      "id": "creativiteit-en-vormgeving",
      "naam": "Creativiteit en vormgeving",
      "definitie": "Eigen ideeën ontwikkelen en ze vertalen naar een vorm die mooi, bruikbaar en maakbaar is.",
      "indicatoren": [
       "Maakt meerdere schetsen of varianten voor er een keuze valt.",
       "Combineert materialen en technieken op een nieuwe manier.",
       "Houdt tegelijk rekening met gebruik, maakbaarheid en uitstraling.",
       "Licht ontwerpkeuzes toe met argumenten."
      ],
      "niveaus": {
       "basis": "Werkt een ontwerp van iemand anders zorgvuldig uit en stelt kleine verbeteringen voor.",
       "gevorderd": "Ontwerpt zelf objecten of interieurs vanuit een vraag en werkt ze uit tot ze maakbaar zijn.",
       "expert": "Ontwikkelt een herkenbare ontwerptaal en begeleidt anderen in het ontwerpproces."
      },
      "vraag": "Kies een ontwerp waar je trots op bent, van de academie, met je broer of in het atelier. Wat was de vraag, welke keuzes maakte je, wat was het resultaat en wat zou je nu anders doen?",
      "voorbeeld": {
       "situatie": "In de opleiding meubel en interieur aan de academie kregen we de opdracht om [een zitmeubel, een kast of een ander object] te ontwerpen rond [thema van de opdracht].",
       "taak": "Ik wilde een ontwerp maken dat mijn ervaring met plaatmateriaal combineerde met hout en dat ik ook zelf kon bouwen.",
       "actie": "Ik maakte [aantal] schetsen en maquettes, koos voor een frame in geplooid staal met een [houten] zitting of blad en tekende de verbindingen zo dat het meubel demonteerbaar bleef.",
       "resultaat": "Het meubel werd gebouwd en [beoordeling of plaats waar het getoond werd]. [Het staat in mijn portfolio: alleen laten staan als dat zo is.]",
       "reflectie": "Mijn technische achtergrond maakt me vrij in het ontwerpen: ik weet wat maakbaar is en durf daardoor verder te gaan in de vorm."
      },
      "cvZin": "Ontwerp van [object] in [materialen, bijvoorbeeld geplooid staal en hout] in de opleiding meubel en interieur aan de Academie, van schets en maquette tot uitvoering (portfolio: [link]).",
      "gesprekVraag": "Kunt u een ontwerp toelichten dat u zelf hebt bedacht en gerealiseerd? Welke keuzes hebt u gemaakt en waarom?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs"
      ]
     }
    ]
   },
   {
    "id": "erfgoed-en-informatie",
    "titel": "Omgaan met erfgoed en informatie",
    "uitleg": "De houding die erfgoedinstellingen, archieven en collecties vragen: zorg voor het object, alles vastleggen en eerst onderzoeken.",
    "competenties": [
     {
      "id": "respect-voor-het-object",
      "naam": "Respect voor het object",
      "definitie": "Een object, gebouw of document met zorg benaderen, met aandacht voor wat het is, wat het betekent en wat niet verloren mag gaan.",
      "indicatoren": [
       "Bekijkt en beschrijft de toestand van een object voor er iets aan gebeurt.",
       "Kiest de kleinste ingreep die het doel bereikt.",
       "Hanteert en verplaatst objecten met de juiste bescherming.",
       "Vraagt raad wanneer een ingreep onomkeerbaar kan zijn."
      ],
      "niveaus": {
       "basis": "Volgt de hanteerregels en vraagt toestemming voor elke ingreep.",
       "gevorderd": "Beoordeelt zelf de toestand van een object en stelt een passende, beperkte behandeling voor.",
       "expert": "Weegt behoud, gebruik en betekenis tegen elkaar af en onderbouwt een behandelvoorstel volgens de principes van conservering en restauratie."
      },
      "vraag": "Denk aan een moment waarop je iets moest herstellen of behandelen dat oud, fragiel of waardevol was voor iemand. Hoe benaderde je het, wat deed je wel en niet, en waarom?",
      "voorbeeld": {
       "situatie": "In het creatieve fietsatelier bracht een klant [een oude fiets of een oud frame] binnen om te laten herstellen met zoveel mogelijk originele onderdelen.",
       "taak": "Ik moest de fiets opnieuw bruikbaar maken zonder het karakter en de originele onderdelen te verliezen.",
       "actie": "Ik [fotografeerde de fiets voor ik iets demonteerde: enkel als dit zo gebeurde], bekeek per onderdeel of reinigen en herstellen volstond, en verving alleen wat niet meer veilig was. De vervangen onderdelen gaf ik mee aan de eigenaar.",
       "resultaat": "De fiets reed opnieuw met [aantal of deel] van de originele onderdelen, en de eigenaar [reactie of vervolg].",
       "reflectie": "Herstellen betekent ook bewust kiezen wat ik niet doe. Dat principe wil ik verder uitdiepen in erfgoed en restauratie."
      },
      "cvZin": "Herstel van [soort fietsen of frames] in een creatief fietsatelier (2019)[, met behoud van originele onderdelen en foto's voor en na de ingreep: enkel vermelden als dit zo gebeurde].",
      "gesprekVraag": "Hoe gaat u te werk wanneer u aan een object moet werken dat niet vervangen kan worden?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "geschiedenis"
      ]
     },
     {
      "id": "documenteren-en-registreren",
      "naam": "Documenteren en registreren",
      "definitie": "Gegevens over objecten, werkzaamheden of beslissingen volledig, eenduidig en terugvindbaar vastleggen.",
      "indicatoren": [
       "Legt vast wat er gebeurt terwijl het gebeurt, niet achteraf uit het geheugen.",
       "Gebruikt een vaste structuur voor namen, nummers en beschrijvingen.",
       "Maakt foto's en notities die ook voor anderen bruikbaar zijn.",
       "Houdt een registratie actueel en verbetert fouten zodra ze opduiken."
      ],
      "niveaus": {
       "basis": "Vult bestaande registratieformulieren en systemen correct in.",
       "gevorderd": "Zet zelf een registratiesysteem op voor een collectie of een reeks werkzaamheden.",
       "expert": "Ontwikkelt registratieafspraken voor een organisatie en werkt met erkende standaarden voor collectieregistratie."
      },
      "vraag": "Beschrijf hoe je ooit informatie, beelden of werkzaamheden hebt vastgelegd zodat iemand anders ermee verder kon. Hoe pakte je het aan en wat was het resultaat?",
      "voorbeeld": {
       "situatie": "Voor Willy Van de Perre bouwde ik tussen 2017 en 2018 een fotoarchief op met [aantal] beelden die verspreid lagen over [dozen, mappen of dragers].",
       "taak": "Het archief moest geordend, gedigitaliseerd en beschreven worden, zodat beelden later snel terug te vinden waren.",
       "actie": "Ik legde een nummering en een vaste bestandsnaam vast, digitaliseerde de beelden in reeksen en beschreef ze met [datum, plaats, onderwerp] in [software of rekenblad]. Na elke reeks controleerde ik steekproefsgewijs of beeld, nummer en beschrijving overeenkwamen.",
       "resultaat": "Het archief telde [aantal] beschreven beelden, en een gezocht beeld was binnen [tijd] terug te vinden.",
       "reflectie": "Een vaste structuur vanaf de eerste dag bespaart later veel zoekwerk. Vandaag zou ik ook een erkende beschrijvingsstandaard gebruiken."
      },
      "cvZin": "Ordening, digitalisering en beschrijving van een fotoarchief van [aantal] beelden voor Willy Van de Perre (2017 tot 2018).",
      "gesprekVraag": "Hoe zorgt u ervoor dat de informatie die u vastlegt ook voor collega's bruikbaar en terugvindbaar is?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "geschiedenis",
       "reserve"
      ]
     },
     {
      "id": "onderzoekend-werken",
      "naam": "Onderzoekend werken",
      "definitie": "Vragen stellen, bronnen en materialen onderzoeken en pas handelen wanneer je begrijpt hoe iets in elkaar zit.",
      "indicatoren": [
       "Zoekt informatie op in documentatie, archief, vakliteratuur of bij specialisten.",
       "Vergelijkt verschillende verklaringen voor een probleem of vraag.",
       "Test een veronderstelling op kleine schaal voor er een beslissing valt.",
       "Legt vast wat er onderzocht is en wat de conclusie was."
      ],
      "niveaus": {
       "basis": "Zoekt gericht informatie op wanneer een taak dat vraagt.",
       "gevorderd": "Zet zelf een klein onderzoek op met bronnen, proeven en een onderbouwde conclusie.",
       "expert": "Leidt onderzoek naar materialen, technieken of de geschiedenis van een object en deelt de resultaten met vakgenoten."
      },
      "vraag": "Denk aan een vraag of probleem waar je dieper in dook dan nodig was, omdat je het echt wilde begrijpen. Hoe ging je te werk en wat vond je?",
      "voorbeeld": {
       "situatie": "Bij het lassen van [dunne plaat in materiaal] trokken de stukken krom, waardoor ze nadien gericht moesten worden.",
       "taak": "Ik wilde de oorzaak begrijpen en een werkwijze vinden die de vervorming beperkte.",
       "actie": "Ik zocht in [vakliteratuur, documentatie van de leverancier of bij een ervaren lasser] naar oorzaken, testte op restmateriaal verschillende lasvolgordes en hechtpunten en noteerde per proef de vervorming.",
       "resultaat": "Met [een aangepaste lasvolgorde en klemming] daalde het richtwerk van [tijd] naar [tijd] per stuk.",
       "reflectie": "Ik werk graag zo: eerst begrijpen, dan proberen, dan vastleggen. Die houding wil ik meenemen naar onderzoek naar historische materialen en technieken."
      },
      "cvZin": "Proeven op restmateriaal om [een technisch probleem, bijvoorbeeld lasvervorming bij dunne plaat] te begrijpen en op te lossen, met [resultaat].",
      "gesprekVraag": "Kunt u een voorbeeld geven van een situatie waarin u eerst grondig onderzoek deed voor u een beslissing nam?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "geschiedenis",
       "reserve"
      ]
     }
    ]
   },
   {
    "id": "samenwerken-en-overdragen",
    "titel": "Samenwerken en overdragen",
    "uitleg": "Hoe je omgaat met collega's, klanten, bezoekers en leerlingen, en hoe je je vak doorgeeft.",
    "competenties": [
     {
      "id": "samenwerken",
      "naam": "Samenwerken",
      "definitie": "Met anderen aan een gezamenlijk resultaat werken, afspraken nakomen en elkaars sterktes benutten.",
      "indicatoren": [
       "Deelt informatie die collega's nodig hebben, ook zonder dat ze erom vragen.",
       "Springt bij wanneer een collega vastloopt.",
       "Houdt rekening met de werkwijze en het tempo van anderen.",
       "Bespreekt meningsverschillen rustig en zoekt een oplossing die voor iedereen werkt."
      ],
      "niveaus": {
       "basis": "Voert het eigen deel van een gezamenlijke taak correct en tijdig uit.",
       "gevorderd": "Stemt actief af met collega's en andere afdelingen zodat het geheel vlot loopt.",
       "expert": "Brengt mensen met verschillende achtergronden samen en maakt van een groep een team."
      },
      "vraag": "Vertel over een project waarin je samen met iemand iets maakte, bijvoorbeeld met je broer of met collega's in het atelier. Hoe verdeelden jullie het werk, wat liep goed, wat liep moeilijk en wat leerde je?",
      "voorbeeld": {
       "situatie": "Met mijn broer bouw ik meubels op maat. Voor [klant of project] moesten we [meubel] maken binnen [termijn], naast ons gewone werk.",
       "taak": "Ik wilde het werk zo verdelen dat ieder deed waar hij het sterkst in is, zonder dat we elkaar in de weg liepen.",
       "actie": "Ik nam [mijn deel, bijvoorbeeld het ontwerp, de werktekeningen en het metaalwerk] op mij, mijn broer [zijn deel, bijvoorbeeld het houtwerk en de afwerking]. We spraken vaste momenten af om de stand van zaken te bekijken en beslisten samen over wijzigingen. Toen we het oneens waren over [een ontwerpkeuze of de planning], [hoe jullie dat bespraken en wie uiteindelijk besliste].",
       "resultaat": "Het meubel werd op tijd geleverd en [reactie van de klant of vervolgopdracht].",
       "reflectie": "Duidelijke afspraken over wie wat beslist leveren meer op dan veel overleg. Dat pas ik nu ook toe in het atelier."
      },
      "cvZin": "[Aantal] meubelprojecten samen met mijn broer, met een vaste taakverdeling: [mijn deel] tegenover [zijn deel].",
      "gesprekVraag": "Kunt u een situatie beschrijven waarin de samenwerking met een collega moeizaam verliep? Wat hebt u toen gedaan?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "geschiedenis",
       "reserve"
      ]
     },
     {
      "id": "communiceren",
      "naam": "Communiceren",
      "definitie": "Informatie helder en afgestemd op de ander overbrengen, mondeling en schriftelijk, en goed luisteren.",
      "indicatoren": [
       "Luistert tot de ander uitgesproken is en vat samen wat er gezegd is.",
       "Stemt woordkeuze en detail af op de persoon, van collega tot klant.",
       "Gebruikt schetsen, tekeningen of voorbeelden om iets duidelijk te maken.",
       "Bevestigt belangrijke afspraken schriftelijk."
      ],
      "niveaus": {
       "basis": "Geeft informatie correct door en vraagt na wanneer iets onduidelijk is.",
       "gevorderd": "Legt technische zaken begrijpelijk uit aan mensen zonder vakkennis.",
       "expert": "Brengt een boodschap over aan groepen of in moeilijke gesprekken en stemt ze af op elk publiek."
      },
      "vraag": "Denk aan een keer dat je iets technisch moest uitleggen aan iemand zonder vakkennis, zoals een klant. Hoe deed je dat en hoe wist je dat het begrepen was?",
      "voorbeeld": {
       "situatie": "Een klant wilde [een maatwerkstuk, bijvoorbeeld een trapleuning of een behuizing] maar had enkel een ruwe schets en geen technische kennis.",
       "taak": "Ik moest samen met de klant achterhalen wat hij precies nodig had en dat vertalen naar een tekening die hij kon goedkeuren.",
       "actie": "Ik stelde vragen over het gebruik, maakte een eenvoudige schets met de belangrijkste maten en overliep die met hem. Wat we afspraken, bevestigde ik per mail met de tekening in bijlage.",
       "resultaat": "De klant keurde de tekening goed na [aantal] versies en het stuk werd zonder wijzigingen geplaatst.",
       "reflectie": "Een tekening zegt een klant vaak meer dan een uitleg. Ik vraag nu op het einde altijd dat de klant zelf herhaalt wat er gemaakt wordt."
      },
      "cvZin": "Vertaling van [aantal] klantvragen per jaar naar goedgekeurde werktekeningen, met schriftelijke bevestiging van maten en afwerking.",
      "gesprekVraag": "Hoe legt u een technisch onderwerp uit aan iemand die er niets van kent? Kunt u een voorbeeld geven?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "geschiedenis"
      ]
     },
     {
      "id": "kennis-overdragen",
      "naam": "Kennis overdragen",
      "definitie": "Vakkennis en vaardigheden zo doorgeven dat een ander ze zelf kan toepassen.",
      "indicatoren": [
       "Deelt een taak op in stappen die een beginner kan volgen.",
       "Doet voor, laat nadoen en geeft gerichte feedback.",
       "Past tempo en uitleg aan aan wie leert.",
       "Controleert of iemand het zelfstandig kan en laat pas dan los."
      ],
      "niveaus": {
       "basis": "Legt een collega een taak uit wanneer die erom vraagt.",
       "gevorderd": "Begeleidt nieuwe collega's of leerlingen gestructureerd tot ze zelfstandig werken.",
       "expert": "Ontwerpt lessen, instructies of opleidingstrajecten en evalueert wat er geleerd is."
      },
      "vraag": "Beschrijf een keer dat je iemand iets aanleerde, in het atelier of daarbuiten. Hoe pakte je het aan, hoe ver stond die persoon op het einde en wat zou je anders doen?",
      "voorbeeld": {
       "situatie": "In het atelier begon [een nieuwe collega of jobstudent] zonder ervaring op de kantbank.",
       "taak": "Als verantwoordelijke atelier moest ik ervoor zorgen dat die persoon binnen [aantal] weken zelfstandig en veilig eenvoudige stukken kon plooien.",
       "actie": "Ik deelde het werk op in stappen: tekening lezen, gereedschap kiezen, machine instellen, proefplooi, meten. Ik deed elke stap eerst voor, liet ze daarna zelf uitvoeren en gaf na elke reeks korte feedback. De stappen zette ik op een fiche bij de machine.",
       "resultaat": "Na [aantal] weken plooide mijn collega eenvoudige reeksen zelfstandig, en [wat er met de uitleg of de fiche gebeurde].",
       "reflectie": "Ik doe dit graag en geduld is hier een sterkte van mij. Ik wil het verder ontwikkelen, bijvoorbeeld in het onderwijs."
      },
      "cvZin": "Inwerken van [aantal] nieuwe collega's [of jobstudenten] aan de kantbank en in de laszone[, met een stappenfiche bij de machine: enkel vermelden als die bestaat].",
      "gesprekVraag": "Hoe zou u een leerling of een nieuwe collega een vaardigheid aanleren die u zelf al jaren beheerst?",
      "relevantVoor": [
       "onderwijs",
       "erfgoed",
       "cultuur",
       "sociaal"
      ]
     },
     {
      "id": "dienstverlening",
      "naam": "Dienstverlening",
      "definitie": "Werken vanuit de vraag en de behoefte van klanten, bezoekers of gebruikers en hen goed verder helpen; bij de overheid heet dit klantgerichtheid.",
      "indicatoren": [
       "Vraagt door tot de echte behoefte duidelijk is.",
       "Komt beloftes na of meldt tijdig wanneer dat niet lukt.",
       "Blijft vriendelijk en rustig, ook bij een ontevreden klant.",
       "Stelt een betere oplossing voor wanneer de gevraagde niet de beste is."
      ],
      "niveaus": {
       "basis": "Helpt klanten of bezoekers vriendelijk en correct volgens de afspraken.",
       "gevorderd": "Denkt mee met de klant en stelt oplossingen voor die beter aansluiten bij de behoefte.",
       "expert": "Verbetert de dienstverlening van de organisatie op basis van signalen van klanten of bezoekers."
      },
      "vraag": "Denk aan een klant, bezoeker of iemand die je hielp en die niet tevreden was of iets anders nodig had dan gevraagd. Wat deed je en hoe liep het af?",
      "voorbeeld": {
       "situatie": "In het creatieve fietsatelier kwam een klant met de vraag om [een onderdeel] te vervangen, maar het eigenlijke probleem zat bij [ander onderdeel of de afstelling].",
       "taak": "Ik moest de klant helpen met wat hij echt nodig had, zonder hem iets op te dringen.",
       "actie": "Ik liet het probleem zien, legde de twee mogelijkheden en hun kostprijs uit en liet de klant kiezen. Na de herstelling liet ik hem de fiets meteen testen.",
       "resultaat": "De klant koos voor [oplossing] en [kwam later terug of stuurde anderen door].",
       "reflectie": "Goede dienstverlening is voor mij eerlijk uitleggen wat er aan de hand is. Dat wil ik ook doen voor bezoekers en gebruikers van een culturele organisatie."
      },
      "cvZin": "[Klantcontact: wat je precies deed, bevestigen] in een creatief fietsatelier (2019), met duidelijke uitleg van de mogelijke herstellingen.",
      "gesprekVraag": "Kunt u een situatie beschrijven waarin u een klant of bezoeker verder hielp dan strikt gevraagd was?",
      "relevantVoor": [
       "cultuur",
       "sociaal",
       "erfgoed",
       "onderwijs"
      ]
     }
    ]
   },
   {
    "id": "organiseren",
    "titel": "Organiseren",
    "uitleg": "Hoe je werk voorbereidt, problemen oplost, resultaten haalt en een klein team aanstuurt.",
    "competenties": [
     {
      "id": "plannen-en-organiseren",
      "naam": "Plannen en organiseren",
      "definitie": "Werk, mensen en middelen zo inplannen dat doelen op tijd en efficiënt gehaald worden.",
      "indicatoren": [
       "Zet taken in een logische volgorde en schat de benodigde tijd in.",
       "Stemt de planning af op beschikbare mensen, machines en materiaal.",
       "Houdt de planning bij en past ze aan wanneer er iets verandert.",
       "Bereidt werk voor zodat anderen vlot kunnen starten."
      ],
      "niveaus": {
       "basis": "Plant het eigen werk en houdt de afgesproken termijnen aan.",
       "gevorderd": "Plant het werk van een team of atelier en stuurt bij wanneer er iets wijzigt.",
       "expert": "Plant meerdere projecten tegelijk en bewaakt capaciteit en prioriteiten over een langere periode."
      },
      "vraag": "Beschrijf een drukke periode waarin je meerdere opdrachten of taken tegelijk moest plannen, bijvoorbeeld werk en academie. Hoe maakte je keuzes, wat was het resultaat en wat zou je anders doen?",
      "voorbeeld": {
       "situatie": "In het atelier liepen [aantal] opdrachten tegelijk, met verschillende leverdata en beperkte tijd op de kantbank en aan de lastafels.",
       "taak": "Als verantwoordelijke atelier moest ik een weekplanning maken die alle leverdata haalde zonder dat collega's op materiaal of tekeningen moesten wachten.",
       "actie": "Ik zette de opdrachten op een planbord per machine en per dag, zorgde dat tekeningen en materiaal klaarlagen voor de start en overliep de planning elke ochtend kort met de ploeg.",
       "resultaat": "In die periode werden [aantal] van de [aantal] opdrachten op tijd geleverd en daalde de wachttijd aan de machines.",
       "reflectie": "Een zichtbare planning helpt de ploeg meer dan een planning in mijn hoofd. Op dezelfde manier combineer ik mijn werk met de lessen aan de academie."
      },
      "cvZin": "Werkvoorbereiding en weekplanning van het atelier voor [aantal] collega's en [aantal] machines, met [percentage] van de opdrachten op tijd geleverd.",
      "gesprekVraag": "Hoe organiseert u uw werk wanneer meerdere opdrachten tegelijk dringend zijn?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "reserve"
      ]
     },
     {
      "id": "probleemoplossend-denken",
      "naam": "Probleemoplossend denken",
      "definitie": "Een probleem analyseren, de oorzaak vinden en een werkbare oplossing uitvoeren.",
      "indicatoren": [
       "Verzamelt eerst feiten en kiest pas dan een oplossing.",
       "Deelt een groot probleem op in deelproblemen die afzonderlijk aan te pakken zijn.",
       "Bedenkt meer dan één oplossing en weegt ze tegen elkaar af.",
       "Controleert achteraf of de oplossing werkt."
      ],
      "niveaus": {
       "basis": "Lost eenvoudige, gekende problemen op volgens de gewone werkwijze.",
       "gevorderd": "Lost nieuwe problemen zelfstandig op door ze te analyseren en oplossingen te testen.",
       "expert": "Lost complexe problemen op die meerdere mensen of afdelingen raken en voorkomt dat ze terugkomen."
      },
      "vraag": "Denk aan een probleem in het atelier, bij een meubel of aan de academie waarvoor geen standaardoplossing bestond. Hoe ging je te werk, welke oplossing koos je en waarom?",
      "voorbeeld": {
       "situatie": "Een klant vroeg een [werkstuk] waarvan het ontwerp niet in één stuk te plooien was, omdat [de laatste plooi tegen de machine zou botsen].",
       "taak": "Ik moest een oplossing vinden die het uitzicht en de sterkte behield en toch maakbaar was in ons atelier.",
       "actie": "Ik tekende drie varianten uit: het stuk in twee delen maken en lassen, de plooivolgorde omkeren met ander gereedschap, of de vorm licht aanpassen. Ik besprak de voor- en nadelen met [collega of klant] en we kozen voor [gekozen variant].",
       "resultaat": "Het stuk werd gemaakt binnen [termijn] en [vervolg, bijvoorbeeld een nieuwe reeks of hergebruik van de oplossing].",
       "reflectie": "Ik werk nu altijd minstens twee oplossingen uit voor ik een voorstel doe. Het eerste idee is zelden het beste."
      },
      "cvZin": "Uitwerking van maakbare alternatieven voor [aantal] ontwerpen die in hun oorspronkelijke vorm niet te produceren waren.",
      "gesprekVraag": "Kunt u een probleem beschrijven waarvoor u geen kant-en-klare oplossing had? Hoe bent u tot een oplossing gekomen?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "reserve"
      ]
     },
     {
      "id": "resultaatgericht-werken",
      "naam": "Resultaatgericht werken",
      "definitie": "Gericht naar een duidelijk doel werken en volhouden tot het resultaat er is, binnen de afgesproken tijd en middelen.",
      "indicatoren": [
       "Maakt vooraf duidelijk wat het resultaat moet zijn.",
       "Volgt de voortgang op en grijpt in wanneer het doel in gevaar komt.",
       "Werkt taken volledig af, ook de laatste details.",
       "Weegt tijd, kost en kwaliteit tegen elkaar af."
      ],
      "niveaus": {
       "basis": "Werkt het eigen werk af binnen de afgesproken termijn.",
       "gevorderd": "Stuurt het eigen werk en dat van anderen bij om een gezamenlijk doel te halen.",
       "expert": "Stelt haalbare doelen voor een team of project en bewaakt ze tot het einde."
      },
      "vraag": "Vertel over een opdracht met een vaste einddatum of een duidelijk doel, in het atelier of aan de academie. Wat deed je om het te halen en wat was het resultaat?",
      "voorbeeld": {
       "situatie": "In het jaar grafiek aan de academie moest ik een reeks van [aantal] [prenten] afwerken voor [de beoordeling of een tentoonstelling]. De lessen waren 's avonds, dus de tijd om eraan te werken was beperkt.",
       "taak": "Ik moest de reeks op tijd en op het gevraagde niveau klaar hebben.",
       "actie": "Ik legde vast wat per week af moest zijn, maakte eerst proefdrukken om technische problemen vroeg te zien en schrapte [een onderdeel] toen bleek dat de kwaliteit anders zou lijden.",
       "resultaat": "De reeks was op tijd klaar en [beoordeling of plaats waar ze getoond werd].",
       "reflectie": "Vroeg testen en bewust schrappen hielpen me meer dan harder werken op het einde. Zo combineer ik nu ook werk en opleiding."
      },
      "cvZin": "Reeks van [aantal] [prenten] in [techniek] afgewerkt voor [beoordeling of tentoonstelling] in het jaar grafiek van de avondopleiding aan de Academie.",
      "gesprekVraag": "Kunt u een voorbeeld geven van een doel dat u hebt gehaald ondanks tegenslag of weinig tijd?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "reserve"
      ]
     },
     {
      "id": "leidinggeven-aan-een-klein-team",
      "naam": "Leidinggeven aan een klein team",
      "definitie": "Een kleine groep collega's richting geven, het werk verdelen en mensen ondersteunen zodat het team goed functioneert.",
      "indicatoren": [
       "Verdeelt taken volgens ieders kunnen en de planning.",
       "Geeft duidelijke instructies en gaat na of ze begrepen zijn.",
       "Geeft collega's erkenning en opbouwende feedback.",
       "Neemt een beslissing wanneer het team vastzit en legt ze uit."
      ],
      "niveaus": {
       "basis": "Coördineert een taak met enkele collega's en houdt het overzicht.",
       "gevorderd": "Stuurt een klein team dagelijks aan, verdeelt het werk en volgt collega's op.",
       "expert": "Ontwikkelt een team op langere termijn, coacht mensen en bouwt een goede werksfeer uit."
      },
      "vraag": "Denk aan een moment waarop je als verantwoordelijke atelier een beslissing moest nemen of een collega moest bijsturen. Hoe pakte je het aan, hoe reageerde het team en wat leerde je over je eigen stijl?",
      "voorbeeld": {
       "situatie": "Sinds [jaar] ben ik verantwoordelijke van het atelier, met [aantal] collega's met wie ik daarvoor als gelijke samenwerkte.",
       "taak": "Ik moest het werk verdelen en opvolgen, en tegelijk de goede verhouding met mijn collega's bewaren.",
       "actie": "Ik voerde een kort overleg in bij de start van de dag, verdeelde het werk op basis van ervaring en voorkeur en sprak collega's individueel aan wanneer iets niet volgens afspraak liep, rustig en met een concreet voorbeeld. Ik bleef zelf meewerken, zodat ik zag wat er leefde.",
       "resultaat": "[Resultaat, bijvoorbeeld minder fouten, een vlottere doorstroming of een collega die doorgroeide naar een nieuwe taak.]",
       "reflectie": "Ik stuur vooral aan door voorbereiding, voorbeeld en rust. Ik leer nog om moeilijke punten sneller op tafel te leggen."
      },
      "cvZin": "Dagelijkse aansturing van een atelier met [aantal] collega's: werkverdeling en opvolging van afspraken[, met een korte opstart bij het begin van de dag: enkel vermelden als dit zo gebeurt].",
      "gesprekVraag": "Hoe zou uw team uw manier van leidinggeven omschrijven? Kunt u een voorbeeld geven van een moeilijk moment?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "reserve"
      ]
     }
    ]
   },
   {
    "id": "jezelf",
    "titel": "Jezelf",
    "uitleg": "Hoe je omgaat met verantwoordelijkheid, zelfstandigheid, leren, druk en verandering.",
    "competenties": [
     {
      "id": "verantwoordelijkheid-nemen",
      "naam": "Verantwoordelijkheid nemen",
      "definitie": "Instaan voor je eigen werk en beslissingen, fouten toegeven en ze helpen oplossen.",
      "indicatoren": [
       "Komt afspraken na, ook wanneer niemand controleert.",
       "Meldt een eigen fout meteen en stelt een oplossing voor.",
       "Neemt taken op die blijven liggen.",
       "Denkt na over de gevolgen van het eigen werk voor anderen."
      ],
      "niveaus": {
       "basis": "Staat in voor de eigen taken en voert ze betrouwbaar uit.",
       "gevorderd": "Neemt verantwoordelijkheid voor het resultaat van een groep of een proces.",
       "expert": "Draagt eindverantwoordelijkheid voor belangrijke beslissingen en hun gevolgen."
      },
      "vraag": "Beschrijf een fout die je zelf maakte en die gevolgen had voor anderen. Wat deed je toen, wat was het resultaat en wat doe je sindsdien anders?",
      "voorbeeld": {
       "situatie": "Bij een reeks [werkstukken] merkte ik na de productie dat er een maatfout in mijn tekening stond, waardoor [aantal] stukken niet pasten.",
       "taak": "Als tekenaar lag de fout bij mij. Ik moest ze melden en de gevolgen voor de klant en het atelier zo klein mogelijk houden.",
       "actie": "Ik meldde het meteen aan [leidinggevende], zocht uit welke stukken nog te redden waren, paste de tekening aan en plande de nieuwe stukken zo in dat de levering zo weinig mogelijk vertraging kreeg.",
       "resultaat": "De klant kreeg de volledige reeks [aantal] dagen later dan gepland, met een eerlijke uitleg, en [reactie van de klant].",
       "reflectie": "Sindsdien laat ik de tekeningen voor een nieuwe reeks door een tweede persoon nakijken, of controleer ik ze zelf de volgende dag opnieuw."
      },
      "cvZin": "Verantwoordelijkheid voor de werkvoorbereiding van het atelier sinds [jaar][, met een afspraak die fouten voorkomt, bijvoorbeeld een tweede controle van elke nieuwe tekening: enkel vermelden als dit zo gebeurde].",
      "gesprekVraag": "Vertel eens over een fout die u zelf gemaakt hebt. Hoe bent u daarmee omgegaan?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "geschiedenis",
       "reserve"
      ]
     },
     {
      "id": "zelfstandig-werken",
      "naam": "Zelfstandig werken",
      "definitie": "Een taak zonder voortdurende begeleiding voorbereiden, uitvoeren en afwerken, en weten wanneer je hulp vraagt.",
      "indicatoren": [
       "Begint aan een taak zonder op extra instructies te wachten wanneer het doel duidelijk is.",
       "Zoekt eerst zelf informatie op en stelt dan gerichte vragen.",
       "Neemt beslissingen binnen de eigen bevoegdheid.",
       "Houdt de verantwoordelijke op de hoogte van de voortgang."
      ],
      "niveaus": {
       "basis": "Voert gekende taken zelfstandig uit.",
       "gevorderd": "Werkt nieuwe opdrachten zelfstandig uit, van voorbereiding tot afwerking.",
       "expert": "Werkt zelfstandig aan complexe projecten en bepaalt zelf aanpak, planning en prioriteiten."
      },
      "vraag": "Denk aan een opdracht die je grotendeels alleen uitvoerde, zoals het fotoarchief, een eigen meubel of een ontwerp aan de academie. Hoe organiseerde je jezelf, wanneer vroeg je hulp en wat was het resultaat?",
      "voorbeeld": {
       "situatie": "In de opleiding interieurvormgeving kreeg ik een individuele opdracht om [een interieur voor een bestaande ruimte] te ontwerpen, met [aantal] begeleidingsmomenten.",
       "taak": "Ik moest de opmeting, het vooronderzoek, het ontwerp en de presentatie zelf plannen en uitvoeren.",
       "actie": "Ik maakte een planning tot aan de presentatie, deed de opmeting en het vooronderzoek zelf en bracht naar elk begeleidingsmoment concrete vragen en varianten mee in plaats van op richting te wachten.",
       "resultaat": "Het ontwerp was op tijd klaar en [beoordeling of feedback van de docent].",
       "reflectie": "Ik werk graag zelfstandig zolang het doel duidelijk is. Ik leerde de begeleidingsmomenten beter te benutten door er voorbereid naartoe te gaan."
      },
      "cvZin": "Zelfstandige uitwerking van [aantal] interieurontwerpen in de avondopleiding, van opmeting en vooronderzoek tot presentatie.",
      "gesprekVraag": "Kunt u een voorbeeld geven van een opdracht die u volledig zelfstandig hebt uitgevoerd? Wanneer vroeg u hulp?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "geschiedenis",
       "reserve"
      ]
     },
     {
      "id": "leervermogen",
      "naam": "Leervermogen",
      "definitie": "Nieuwe kennis en vaardigheden snel opnemen en toepassen, en leren uit ervaring en feedback.",
      "indicatoren": [
       "Zoekt actief nieuwe kennis en opleidingen op.",
       "Past nieuwe kennis snel toe in het eigen werk.",
       "Vraagt feedback en doet er iets mee.",
       "Kijkt terug op het eigen werk om te zien wat beter kan."
      ],
      "niveaus": {
       "basis": "Leert nieuwe taken aan wanneer ze uitgelegd worden.",
       "gevorderd": "Leert zelfstandig nieuwe technieken en vakgebieden aan en past ze toe.",
       "expert": "Bouwt kennis op in meerdere vakgebieden en verbindt ze tot nieuwe inzichten voor anderen."
      },
      "vraag": "Beschrijf iets wat je in korte tijd moest leren, bijvoorbeeld lassen, plooien of een tekenprogramma. Hoe leerde je het, hoe lang duurde het en hoe gebruik je het vandaag?",
      "voorbeeld": {
       "situatie": "Rond 2020 volgde ik een lasopleiding halfautomaat (MIG/MAG) en elektrode. In 2021 begon ik als technisch tekenaar en plooi- en lasoperator bij een bedrijf in maatwerk in plaatmateriaal.",
       "taak": "Ik moest in korte tijd plooien op de kantbank en tekenen in [CAD-programma] onder de knie krijgen en mijn laswerk op het niveau brengen dat het atelier vraagt.",
       "actie": "Ik oefende op restmateriaal, vroeg ervaren collega's om mijn lassen te beoordelen, leerde het tekenprogramma via [cursus, handleiding of zelfstudie] en hield bij wat ik fout deed en waarom.",
       "resultaat": "Na [aantal] maanden werkte ik zelfstandig, en sinds [jaar] ben ik verantwoordelijke van het atelier.",
       "reflectie": "Ik leer het best door te doen en te begrijpen waarom iets werkt. Daarom combineer ik werk altijd met een opleiding, nu interieurvormgeving aan de academie."
      },
      "cvZin": "Doorgroei van technisch tekenaar en plooi- en lasoperator naar verantwoordelijke atelier in [aantal] jaar, naast een avondopleiding aan de academie.",
      "gesprekVraag": "Kunt u een voorbeeld geven van iets wat u in korte tijd onder de knie moest krijgen? Hoe hebt u dat aangepakt?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "geschiedenis",
       "reserve"
      ]
     },
     {
      "id": "stressbestendigheid",
      "naam": "Stressbestendigheid",
      "definitie": "Rustig en doeltreffend blijven werken bij tijdsdruk, tegenslag of onverwachte situaties.",
      "indicatoren": [
       "Blijft rustig en vriendelijk wanneer het druk wordt.",
       "Stelt prioriteiten wanneer alles tegelijk moet.",
       "Laat de kwaliteit niet zakken onder tijdsdruk.",
       "Zegt tijdig wanneer iets niet haalbaar is."
      ],
      "niveaus": {
       "basis": "Blijft correct werken bij een gewone piek in het werk.",
       "gevorderd": "Behoudt overzicht en kwaliteit bij langdurige drukte of onverwachte problemen.",
       "expert": "Brengt rust en structuur in een team wanneer alles tegelijk misloopt."
      },
      "vraag": "Denk aan een moment waarop veel tegelijk misliep of dringend werd. Wat deed je eerst, hoe hield je het overzicht en hoe liep het af?",
      "voorbeeld": {
       "situatie": "Op een dag dat een dringende levering voor [klant] klaar moest zijn, viel [de kantbank of een andere machine] in panne.",
       "taak": "Als verantwoordelijke atelier moest ik ervoor zorgen dat zoveel mogelijk van de levering doorging en dat de ploeg niet stilstond.",
       "actie": "Ik belde de technieker, bekeek welke stukken al klaar waren en welke op een andere machine of later konden, zette de ploeg op het lassen en afwerken van wat wel kon en belde de klant met een eerlijke inschatting.",
       "resultaat": "[Het grootste deel] van de levering vertrok op tijd, de rest volgde [termijn] later in overleg met de klant.",
       "reflectie": "Onder druk word ik stiller en werk ik stap voor stap. Ik let er nu op dat ik de ploeg en de klant sneller informeer, zodat niemand hoeft te raden."
      },
      "cvZin": "Aanspreekpunt voor ploeg en klant bij machinestoringen en spoedleveringen: prioriteiten bepalen, werk herverdelen en de klant tijdig informeren.",
      "gesprekVraag": "Vertel over een moment waarop er vlak voor een deadline onverwacht iets misliep. Wat deed u eerst?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "reserve"
      ]
     },
     {
      "id": "flexibiliteit",
      "naam": "Flexibiliteit",
      "definitie": "Je aanpak aanpassen aan veranderende omstandigheden, taken of mensen, zonder het doel uit het oog te verliezen.",
      "indicatoren": [
       "Past planning of werkwijze aan wanneer de situatie verandert.",
       "Neemt andere taken op wanneer dat nodig is.",
       "Staat open voor andere werkwijzen en ideeën.",
       "Werkt vlot met verschillende materialen, mensen en omgevingen."
      ],
      "niveaus": {
       "basis": "Aanvaardt wijzigingen en past zich aan wanneer dat gevraagd wordt.",
       "gevorderd": "Ziet veranderingen aankomen en past de eigen aanpak op tijd aan.",
       "expert": "Helpt anderen zich aan te passen en maakt van een verandering een verbetering."
      },
      "vraag": "Beschrijf een situatie waarin een opdracht, een plan of je rol plots veranderde, bijvoorbeeld van operator naar verantwoordelijke, of een klant die halverwege iets anders wilde. Hoe pakte je dat aan?",
      "voorbeeld": {
       "situatie": "In het atelier wijzigde een klant halverwege de productie van [werkstuk] [de afmetingen of het materiaal], terwijl [een deel] al geplooid en gelast was.",
       "taak": "Ik moest de wijziging mogelijk maken zonder helemaal opnieuw te beginnen en zonder de afgesproken termijn ver te overschrijden.",
       "actie": "Ik bekeek wat van het bestaande werk bruikbaar bleef, tekende een aangepaste versie waarin [wat al klaar was] hergebruikt kon worden en besprak de gevolgen voor tijd en kost met de klant voor we verder werkten.",
       "resultaat": "De klant koos voor [de aangepaste versie], en het stuk werd geleverd met [aantal] dagen vertraging, met hergebruik van [wat al klaar was].",
       "reflectie": "Ik spreek nu vooraf af tot welk moment een klant nog kan wijzigen. Dat maakt flexibel zijn makkelijker voor beide kanten."
      },
      "cvZin": "Aanpassing van [aantal] lopende maatwerkprojecten aan gewijzigde klantvragen, met hergebruik van bestaand werk en duidelijke afspraken over termijn en kost.",
      "gesprekVraag": "Kunt u een situatie beschrijven waarin u uw aanpak plots moest veranderen? Hoe reageerde u?",
      "relevantVoor": [
       "erfgoed",
       "cultuur",
       "onderwijs",
       "sociaal",
       "reserve"
      ]
     }
    ]
   }
  ]
 },
 "cvGids": {
  "inleiding": "Hier staat bij elke rubriek van je cv wat erin hoort, wat werkt en wat je beter weglaat, telkens met een voorbeeld op basis van je eigen loopbaan. De regels volgen wat VDAB en Vlaamse werkgevers verwachten, met extra aandacht voor je overstap van de metaalsector naar erfgoed, cultuur of onderwijs. Alles tussen vierkante haken is nog niet bekend; dat vul je aan met je antwoorden uit de vragenlijst.",
  "principes": [
   {
    "titel": "Eén tot twee pagina's",
    "uitleg": "Houd je cv op één tot twee A4-pagina's, zoals VDAB aanraadt, met korte, eenvoudige zinnen. Vermijd jargon en onverklaarde afkortingen, zeker als je solliciteert buiten de metaalsector."
   },
   {
    "titel": "Meest recent eerst",
    "uitleg": "Werkervaring en opleiding staan in omgekeerd chronologische volgorde: je huidige job bovenaan, je diploma secundair onderwijs onderaan."
   },
   {
    "titel": "Een profiel van hoogstens vijf zinnen",
    "uitleg": "Onder je contactgegevens staat een korte voorstelling van maximaal vijf zinnen: wie je bent als vakman, wat je meebrengt en naar welk werk je toe wil. Dat blok legt meteen uit waarom iemand uit de plaatbewerking solliciteert bij een museum of een restauratieatelier."
   },
   {
    "titel": "Vaardigheden boven werkervaring",
    "uitleg": "Bij een carrièreswitch zet je vaardigheden en competenties boven werkervaring en opleiding, zoals VDAB aanraadt. Zo ziet de lezer eerst wat je meebrengt voor de nieuwe job en pas daarna waar je het geleerd hebt."
   },
   {
    "titel": "Realisaties met een cijfer",
    "uitleg": "Een taak zegt wat je moest doen, een realisatie zegt wat je bereikt hebt. Geef waar het kan een cijfer: aantal collega's, werkstukken per maand, beelden in een archief of jaren ervaring."
   },
   {
    "titel": "Op maat van elke vacature",
    "uitleg": "Je houdt één volledig basis-cv bij en maakt per vacature een aangepaste versie. Neem de woorden uit de vacature over waar ze kloppen en zet bovenaan wat voor die werkgever het zwaarst weegt."
   },
   {
    "titel": "Altijd als PDF, met een duidelijke naam",
    "uitleg": "Verstuur je cv als PDF, zodat de opmaak bij elke lezer gelijk blijft. Noem het bestand Voornaam_Achternaam_CV.pdf, niet cv-definitief-2.pdf."
   },
   {
    "titel": "Geboortedatum wel, foto optioneel",
    "uitleg": "Geboortedatum en -plaats horen in Vlaanderen gewoon bij de persoonlijke gegevens. Een foto is optioneel: voeg er een toe als de werkgever erom vraagt of voor een jobbeurs, met een neutrale achtergrond, en laat hem weg in online overheidsformulieren."
   },
   {
    "titel": "Een link naar je portfolio",
    "uitleg": "Voor ateliers, musea en restauratie is je werk het sterkste bewijs. Zet een werkende link naar een portfolio-PDF of -pagina bij je contactgegevens en onder een eigen rubriek."
   },
   {
    "titel": "Geen gezondheid, vakbond of reden van vertrek",
    "uitleg": "Gezondheid, ziekteverlof en vakbondslidmaatschap horen niet op een cv, en een werkgever mag er ook niet naar vragen. De reden waarom je vertrekt laat je ook weg, maar in het gesprek wordt er wel naar gevraagd, dus werk in de vragenlijst een antwoord van twee zinnen uit dat over je nieuwe richting gaat."
   }
  ],
  "secties": [
   {
    "id": "persoonlijk",
    "titel": "Persoonlijke gegevens",
    "doel": "Zorgen dat een werkgever je binnen tien seconden kan bereiken en weet waar je woont.",
    "inhoud": [
     "Voornaam en achternaam, groot bovenaan, zonder het woord cv en zonder labels zoals Naam:",
     "Adres (straat, nummer, postcode, gemeente), gsm-nummer en e-mailadres, bij elkaar in één blok",
     "Geboortedatum en -plaats en nationaliteit, zoals in Vlaanderen gebruikelijk",
     "Rijbewijs, als het voor de job relevant is",
     "Link naar je portfolio"
    ],
    "doen": [
     "Gebruik een zakelijk e-mailadres met je voornaam en achternaam.",
     "Controleer je gsm-nummer en e-mailadres teken per teken; één fout en niemand kan je bereiken.",
     "Schrijf je gsm-nummer in groepjes, zodat het makkelijk over te nemen is: +32 4xx xx xx xx.",
     "Zet de portfoliolink voluit en test of ze opent zonder in te loggen, ook op een gsm."
    ],
    "vermijden": [
     "Een e-mailadres met een bijnaam of een grap erin",
     "Labels zoals Naam:, Adres: en Tel.: voor elk gegeven",
     "Rijksregisternummer, burgerlijke staat, gezondheid of vakbond"
    ],
    "voorbeeldGoed": "Remi [Achternaam]\n[Straat nummer], [postcode] Antwerpen\n[gsm-nummer] | [voornaam.achternaam@provider.be]\n°[dag maand jaar], [geboorteplaats] | [nationaliteit] | [Rijbewijs B, alleen vermelden als je het hebt]\nPortfolio: [link naar portfolio-PDF of pagina]",
    "voorbeeldZwak": "CURRICULUM VITAE\nNaam: Remi\nAdres: Antwerpen\nTel.: [gsm-nummer]\nE-mail: [bijnaam]@hotmail.com",
    "vragenlijstIds": [
     "p01",
     "p02",
     "p03"
    ]
   },
   {
    "id": "profiel",
    "titel": "Profiel",
    "doel": "In hoogstens vijf zinnen tonen wie je bent als vakman, wat je meebrengt en naar welk werk je toe wil.",
    "inhoud": [
     "Wie je bent: je vak en sinds wanneer je het uitoefent",
     "Twee of drie sterktes die voor deze vacature tellen, met een kort bewijs",
     "Wat je naast je werk leert of studeert",
     "Naar welk werk je toe wil, afgestemd op de organisatie of de sector"
    ],
    "doen": [
     "Schrijf in de ik-vorm of neutraal, nooit over jezelf in de derde persoon.",
     "Pas de laatste zin aan per vacature: een museumatelier, een restauratieatelier of een school vraagt telkens iets anders.",
     "Stel de overstap voor als een logische volgende stap vanuit je vakmanschap.",
     "Gebruik woorden uit de vacature waar ze echt op jou van toepassing zijn."
    ],
    "vermijden": [
     "Holle eigenschappen zonder bewijs, zoals gemotiveerd, flexibel, teamplayer of stressbestendig",
     "Een tekst die net zo goed op het cv van iemand anders zou kunnen staan",
     "Uitleg over waarom je je huidige job verlaat",
     "Testresultaten zoals je MBTI-type of Holland-code; die helpen jou kiezen, maar zeggen een werkgever weinig"
    ],
    "voorbeeldGoed": "Sinds 2021 werk ik in een bedrijf voor maatwerk in plaatmateriaal, eerst als technisch tekenaar en plooi- en lasoperator, nu als tekenaar en verantwoordelijke atelier. Ik teken werkstukken uit, plan het werk voor [aantal] collega's en controleer de maatvoering en de afwerking voordat een stuk het atelier verlaat. Daarnaast volg ik interieurvormgeving in het avondonderwijs aan de Academie in Antwerpen, na drie jaar meubel en interieur en een jaar grafiek. Samen met mijn broer ontwerp en bouw ik meubels, en eerder bouwde ik een fotoarchief op voor Willy Van de Perre. Die nauwkeurigheid en mijn ervaring met [materiaal of techniek uit de vacature] wil ik inzetten voor [werk dat blijft, bijvoorbeeld de restauratie van erfgoed of het atelier van uw museum].",
    "voorbeeldZwak": "Gemotiveerde en flexibele teamplayer met een passie voor techniek en design. Ik ben stressbestendig, leergierig en heb oog voor detail. Op zoek naar een nieuwe uitdaging in een dynamische omgeving.",
    "vragenlijstIds": [
     "p07",
     "w03",
     "w09",
     "s01",
     "i04",
     "o01",
     "g01"
    ]
   },
   {
    "id": "werkervaring",
    "titel": "Werkervaring",
    "doel": "Per job tonen wat je gedaan en bereikt hebt, met de meest recente job eerst.",
    "inhoud": [
     "Periode, functie, werkgever en gemeente",
     "Een halve regel over het bedrijf als de naam niets zegt, bijvoorbeeld maatwerk in plaatmateriaal",
     "Drie tot vijf regels per job: taken, en vooral realisaties",
     "Doorgroei binnen hetzelfde bedrijf, zoals van operator naar verantwoordelijke atelier",
     "Oudere en kortere ervaring in één of twee regels: Katoen Natie (2017 tot 2018, [functie]), het fotoarchief, het fietsatelier en je meubelwerk"
    ],
    "doen": [
     "Begin elke regel met een actiewerkwoord: in de tegenwoordige tijd voor je huidige job (plan, teken uit), in de verleden tijd voor vroegere jobs (bouwde, ordende).",
     "Geef waar het kan een cijfer, in minstens drie regels: collega's, werkstukken, beelden of jaren; noteer alleen cijfers die je kunt staven.",
     "Noem technieken, materialen en programma's bij naam; werkgevers zoeken daarop.",
     "Zet per vacature de regels die het meest tellen bovenaan.",
     "Neem het fotoarchief en het meubelwerk ernstig: voor erfgoed en musea zijn dat sterke bewijzen."
    ],
    "vermijden": [
     "Regels die beginnen met verantwoordelijk voor en alleen taken opsommen",
     "Ervaring die je in een gesprek niet kunt toelichten of tonen",
     "De reden waarom je bij een werkgever vertrok",
     "Onverklaarde gaten in de tijdlijn; een opleiding of eigen project mag een periode vullen"
    ],
    "voorbeeldGoed": "2021 tot heden\nTekenaar en verantwoordelijke atelier, [Naam bedrijf], [gemeente]\nMetaalbewerking, maatwerk in plaatmateriaal\n- Groeide in [jaar] door van technisch tekenaar en plooi- en lasoperator naar verantwoordelijke atelier\n- Teken maatwerk uit in [CAD-programma] en maak het productieklaar: [aantal] werkstukken per [week of maand]\n- Plan en verdeel het werk voor [aantal] collega's en controleer de kwaliteit vóór levering\n- Plooi op de kantbank en las halfautomaat (MIG/MAG) en elektrode\n- [Realisatie met een cijfer, bijvoorbeeld een aanpassing in de werkvoorbereiding en hoeveel herwerk of tijd die bespaarde]",
    "voorbeeldZwak": "2021 - nu\nFirma [Naam]\nLasser\n- Verantwoordelijk voor lassen, plooien en tekenen\n- Verantwoordelijk voor het atelier\n- Andere taken",
    "vragenlijstIds": [
     "p05",
     "p07",
     "p08",
     "p12",
     "p13",
     "p14",
     "w01",
     "w03",
     "w04"
    ]
   },
   {
    "id": "opleiding",
    "titel": "Opleiding",
    "doel": "Tonen welke diploma's en opleidingen je hebt en dat je al jaren blijft leren naast je werk.",
    "inhoud": [
     "Periode, naam van de opleiding, instelling en gemeente",
     "Studierichting in het secundair onderwijs en het jaar van je diploma",
     "Avondonderwijs aan de Academie, per richting, met getuigschrift of diploma als je dat behaald hebt",
     "Lasopleiding: waar, wanneer en welke processen",
     "De opleiding die je nu volgt, met het verwachte einde"
    ],
    "doen": [
     "Zet de opleiding die je nu volgt bovenaan, met tot heden of het verwachte einde.",
     "Noem avondonderwijs ook zo; het toont dat je werk en studie al jaren combineert.",
     "Gebruik de officiële naam van de opleiding en de instelling, zoals op je getuigschrift.",
     "Voor overheidsjobs: kijk welk niveau je diploma geeft; een diploma secundair onderwijs geeft toegang tot niveau C.",
     "Zet de regels pas definitief in volgorde als de jaren van de academie en de lasopleiding bevestigd zijn; de volgorde in het voorbeeld is voorlopig."
    ],
    "vermijden": [
     "Termen uit Nederland, zoals middelbare school, mbo of havo",
     "Een getuigschrift of diploma dat je niet behaald hebt of niet kunt voorleggen",
     "Punten, graden of vakkenlijsten, tenzij de vacature erom vraagt"
    ],
    "voorbeeldGoed": "[jaar] tot heden | Interieurvormgeving, avondonderwijs | [Academie, volledige naam], Antwerpen\n[jaar] | Grafiek, een jaar avondonderwijs | [Academie, volledige naam], Antwerpen\n[jaar] tot [jaar] | Meubel en interieur, drie jaar avondonderwijs, [getuigschrift ja of nee] | [Academie, volledige naam], Antwerpen\n[jaar, rond 2020] | Lasopleiding halfautomaat (MIG/MAG) en elektrode | [VDAB, SYNTRA of school], [gemeente]\n2017 | Diploma secundair onderwijs, ASO Wetenschappen-Wiskunde | Sint-Lutgardis, [Merksem of Antwerpen]",
    "voorbeeldZwak": "Middelbare school: Sint-Lutgardis\nAcademie: meubels, grafiek, interieur\nLassen (cursus)",
    "vragenlijstIds": [
     "p11",
     "p16"
    ]
   },
   {
    "id": "certificaten",
    "titel": "Certificaten en attesten",
    "doel": "Aantonen welke erkende bekwaamheden je hebt, met norm en geldigheid, zodat een werkgever ze kan nagaan.",
    "inhoud": [
     "Lascertificaten met norm, procesnummer en geldigheid, bijvoorbeeld EN ISO 9606-1 met proces 135 (MAG) of 111 (elektrode)",
     "Veiligheidsattesten zoals VCA-basis, met jaar en geldigheid",
     "Andere attesten, zoals heftruck, hoogtewerker of EHBO",
     "Korte cursussen die bij de vacature passen, met instelling en jaar"
    ],
    "doen": [
     "Vermeld alleen certificaten die je kunt voorleggen, en noteer tot wanneer ze geldig zijn.",
     "Schrijf de norm en het procesnummer voluit; technische werkgevers zoeken daarop.",
     "Houd van elk certificaat een scan klaar voor het geval een werkgever erom vraagt.",
     "Voor een job in erfgoed of een museum volstaat een korte regel; voor een technische job geef je alle details."
    ],
    "vermijden": [
     "Een lasproces vermelden dat je niet beheerst of waarvoor je geen certificaat hebt, zoals TIG zolang dat niet bevestigd is",
     "Vage regels zoals lasdiploma of veiligheidscursus, zonder naam, norm of jaar",
     "Verlopen attesten zonder te vermelden dat ze verlopen zijn"
    ],
    "voorbeeldGoed": "[Alleen als je het kunt voorleggen: Lascertificaat EN ISO 9606-1, proces 131 (MIG), 135 (MAG) of 111 (elektrode), materiaal en positie, geldig tot datum]\n[Alleen als je het hebt: VCA-basis (Basisveiligheid), jaar, geldig tot datum]\n[Ander attest, bijvoorbeeld EHBO of heftruck], [instelling], [jaar]",
    "voorbeeldZwak": "Lasdiploma\nVeiligheidscursus\nAlle lasprocessen",
    "vragenlijstIds": [
     "p09",
     "p10"
    ]
   },
   {
    "id": "vaardigheden",
    "titel": "Vaardigheden",
    "doel": "In één oogopslag tonen wat je technisch kunt, gegroepeerd en met de namen van technieken, materialen en programma's.",
    "inhoud": [
     "Tekenen en ontwerpen: je CAD-programma, technisch tekenen, meubelontwerp, grafiek",
     "Maken: plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk, meubelbouw",
     "Organiseren: werkvoorbereiding, planning, kwaliteitscontrole, een atelier aansturen",
     "Documenteren: beeldmateriaal ordenen, digitaliseren en beschrijven",
     "Computerprogramma's die je echt gebruikt, met je niveau"
    ],
    "doen": [
     "Groepeer je vaardigheden in drie of vier blokken in plaats van één lange lijst.",
     "Zet bij een carrièreswitch deze rubriek boven je werkervaring.",
     "Kies per vacature de vijf tot acht vaardigheden die het meest tellen en zet die eerst.",
     "Zorg dat elke vaardigheid terugkomt in je werkervaring of je portfolio, zodat ze bewezen is."
    ],
    "vermijden": [
     "Vaardigheden die iedereen heeft, zoals Word of internet, tenzij de vacature erom vraagt",
     "Balkjes, sterren of percentages voor je niveau; ze zeggen weinig en online systemen lezen ze slecht",
     "Een programma of techniek noemen die je niet kunt tonen"
    ],
    "voorbeeldGoed": "Tekenen en ontwerpen: technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma], [niveau]), meubelontwerp, grafiek\nMaken: plooien op de kantbank, halfautomaatlassen (MIG/MAG) en elektrodelassen, plaatwerk, meubelbouw\nOrganiseren: werkvoorbereiding, planning en kwaliteitscontrole in een atelier met [aantal] collega's\nDocumenteren: een fotoarchief ordenen en digitaliseren ([software of methode])",
    "voorbeeldZwak": "Lassen (4/5)\nTekenen (3/5)\nComputer: 80 %\nHandig\nMicrosoft Word",
    "vragenlijstIds": [
     "p07",
     "p08",
     "p09",
     "w05",
     "s01",
     "s03"
    ]
   },
   {
    "id": "competenties",
    "titel": "Competenties",
    "doel": "Je persoonlijke sterktes benoemen met een kort bewijs, in de woorden die werkgevers en de overheid zelf gebruiken.",
    "inhoud": [
     "Drie tot vijf competenties die in de vacature staan",
     "Per competentie een bewijs van één regel: een situatie en wat je deed",
     "Bij de overheid: de standaardcompetenties zorgvuldigheid, samenwerken, plannen en organiseren, verantwoordelijkheid nemen, flexibiliteit en klantgerichtheid",
     "Een verwijzing naar een project in je werkervaring of portfolio waar de competentie zichtbaar is"
    ],
    "doen": [
     "Kies competenties die door je werk gestaafd worden en die bij je testresultaten passen: zorgvuldigheid, betrouwbaarheid, samenwerken en kennis doorgeven sluiten aan bij je hoge scores op plichtsbesef en behoedzaamheid en bij de S (Sociaal) in je Holland-code.",
     "Geef bij elke competentie een bewijs uit je werk, je opleiding of je meubelwerk.",
     "Werk voor elke competentie op je cv een STARR-voorbeeld uit dat je in het gesprek kunt vertellen: Situatie, Taak, Actie, Resultaat, Reflectie.",
     "Neem de woorden van de vacature over; een selectiecommissie scoort letterlijk op die competenties."
    ],
    "vermijden": [
     "Een rij eigenschappen zonder bewijs, zoals communicatief, flexibel of stressbestendig",
     "Competenties die goed klinken maar die je in een gesprek niet met een voorbeeld kunt staven",
     "Testresultaten als bewijs; een test is geen competentie"
    ],
    "voorbeeldGoed": "Zorgvuldigheid: controleer als verantwoordelijke atelier de maatvoering en de afwerking voordat een werkstuk het atelier verlaat [hoe, bijvoorbeeld met welke meetmiddelen of controlelijst]\nPlannen en organiseren: plan het werk van [aantal] collega's per [dag of week] en zorg voor de werkvoorbereiding\nKennis doorgeven: leerde [wie, bijvoorbeeld een nieuwe collega] [wat, bijvoorbeeld plooien op de kantbank] aan in [aantal weken of maanden]\nVerantwoordelijkheid nemen: groeide in [jaar] door van technisch tekenaar en plooi- en lasoperator naar verantwoordelijke atelier en sta sindsdien in voor het atelier en [aantal] collega's",
    "voorbeeldZwak": "Communicatief, flexibel, stressbestendig, leergierig, teamplayer, oog voor detail",
    "vragenlijstIds": [
     "w01",
     "w09",
     "s01",
     "s03",
     "s05",
     "i06"
    ]
   },
   {
    "id": "talen",
    "titel": "Talen",
    "doel": "Eerlijk tonen welke talen je spreekt en schrijft, op een niveau dat een werkgever kan inschatten.",
    "inhoud": [
     "Elke taal met een niveau: moedertaal, zeer goed, goed of basis",
     "Waar nodig apart voor spreken, lezen en schrijven",
     "Het ERK-niveau (A1 tot C2) als je dat kent of er een attest van hebt"
    ],
    "doen": [
     "Wees eerlijk; een gesprek kan zomaar in het Frans of het Engels overgaan.",
     "Gebruik voor alle talen dezelfde schaal.",
     "Vermeld Frans ook als je niveau basis is; bij federale instellingen zoals het KIK-IRPA en in Brussel telt het mee."
    ],
    "vermijden": [
     "Een niveau dat je in een gesprek niet waarmaakt",
     "Vage woorden zoals een beetje of schoolfrans, zonder niveau"
    ],
    "voorbeeldGoed": "Nederlands: moedertaal\nEngels: [basis, goed of zeer goed] in spreken en lezen, [niveau] in schrijven\nFrans: [basis, goed of zeer goed]",
    "voorbeeldZwak": "Talen: Nederlands, Engels, een beetje Frans",
    "vragenlijstIds": [
     "p04"
    ]
   },
   {
    "id": "portfolio",
    "titel": "Portfolio",
    "doel": "Een atelier, museum of restauratiebedrijf je werk laten zien, want dat bewijst meer dan elke zin op je cv.",
    "inhoud": [
     "Een werkende link naar een portfolio-PDF of een eenvoudige webpagina",
     "Zes tot tien werkstukken: meubels, plaatwerk, technische tekeningen, grafiek en eventueel het fotoarchief",
     "Per stuk: titel, jaar, materiaal, techniek, je eigen rol, één sterke foto en één detail",
     "Een korte voorstelling en een contactpagina"
    ],
    "doen": [
     "Houd de PDF op 8 tot 15 pagina's en onder 10 MB.",
     "Kies per vacature de volgorde: voor restauratie eerst precisiewerk en afwerking, voor tentoonstellingsbouw eerst constructies, voor lesgeven eerst tekeningen en werkvoorbereiding.",
     "Noem in je motivatiebrief één of twee stukken bij naam.",
     "Neem een geprinte versie mee naar het gesprek.",
     "Vraag toestemming aan je werkgever, een klant of Willy Van de Perre voordat je foto's van hun werk of beelden uit het archief toont."
    ],
    "vermijden": [
     "Een link die vraagt om in te loggen, of een map losse foto's zonder uitleg",
     "Werk tonen zonder te zeggen wat jouw rol was, zeker bij stukken die je met je broer of met collega's maakte",
     "Wazige of donkere foto's; liever minder stukken met goede beelden"
    ],
    "voorbeeldGoed": "Portfolio: [link naar portfolio-PDF of pagina]\n[aantal] werkstukken van [jaar] tot [jaar]: [meubels], [maatwerk in plaatmateriaal], [technische tekeningen], [grafiek]\nPer stuk: materiaal, techniek en mijn rol",
    "voorbeeldZwak": "Foto's van mijn werk: zie mijn Instagram",
    "vragenlijstIds": [
     "p13",
     "p14",
     "p15",
     "w03",
     "w04"
    ]
   },
   {
    "id": "interesses",
    "titel": "Interesses",
    "doel": "Met een paar concrete interesses tonen wie je bent en waarom je bij deze organisatie past.",
    "inhoud": [
     "Twee tot vier interesses, zo concreet mogelijk",
     "Interesses die aansluiten bij de sector: erfgoed, architectuur, musea, ambacht",
     "Vrijwilligerswerk of iets wat je anderen hebt aangeleerd",
     "Eigen projecten, als ze niet al onder werkervaring staan"
    ],
    "doen": [
     "Maak het concreet: welke gebouwen, musea, technieken of makers.",
     "Kies interesses waar je in een gesprek graag twee minuten over vertelt.",
     "Leg per vacature andere accenten: voor een museum andere dan voor een school."
    ],
    "vermijden": [
     "Algemene woorden zoals lezen, reizen, sport of vrienden",
     "Politieke, religieuze of syndicale engagementen",
     "Interesses die je niet kunt toelichten als iemand ernaar vraagt"
    ],
    "voorbeeldGoed": "Erfgoed en ambacht: [een gebouw, museum of atelier dat je raakte, en waarom]\nArchitectuur en interieur: [een concreet voorbeeld]\n[Een derde interesse, zo concreet mogelijk]",
    "voorbeeldZwak": "Lezen, reizen, muziek, sport, vrienden",
    "vragenlijstIds": [
     "i01",
     "i02",
     "i03",
     "i06",
     "i07"
    ]
   },
   {
    "id": "referenties",
    "titel": "Referenties",
    "doel": "Een werkgever de kans geven om bij iemand na te gaan hoe je werkt, zonder dat je die persoon overvalt.",
    "inhoud": [
     "Eén of twee mensen die je werk kennen: een collega, een klant, een docent van de Academie of de opdrachtgever van het fotoarchief",
     "Per persoon: naam, functie, organisatie, hoe die je kent en een gsm-nummer of e-mailadres",
     "Of de korte zin Referenties op aanvraag, als je de namen nog niet wil geven"
    ],
    "doen": [
     "Vraag altijd eerst toestemming en vertel voor welke job je solliciteert.",
     "Kies iemand die concreet over je werk kan vertellen, niet alleen over je karakter.",
     "Vermeld je huidige werkgever pas als die weet dat je solliciteert.",
     "Geef je referenties een seintje wanneer een werkgever kan bellen."
    ],
    "vermijden": [
     "Familie of vrienden als referentie",
     "Namen zonder toestemming, of iemand die je werk niet goed kent"
    ],
    "voorbeeldGoed": "[Voornaam Achternaam], [functie], [organisatie]\nKent mij via [de lessen meubel en interieur aan de Academie, of de opbouw van het fotoarchief], [jaar] tot [jaar]\n[gsm-nummer] of [e-mailadres]",
    "voorbeeldZwak": "Referenties: mijn baas, [gsm-nummer]",
    "vragenlijstIds": [
     "g03"
    ]
   }
  ],
  "actiewerkwoorden": [
   {
    "groep": "Maken en bouwen",
    "woorden": [
     "bouwde",
     "maakte",
     "vervaardigde",
     "laste",
     "plooide",
     "monteerde",
     "herstelde",
     "werkte af",
     "paste aan",
     "realiseerde"
    ]
   },
   {
    "groep": "Tekenen en ontwerpen",
    "woorden": [
     "tekende uit",
     "ontwierp",
     "ontwikkelde",
     "schetste",
     "modelleerde",
     "detailleerde",
     "berekende",
     "werkte uit",
     "vertaalde",
     "maakte productieklaar"
    ]
   },
   {
    "groep": "Organiseren en leiden",
    "woorden": [
     "plande",
     "organiseerde",
     "coördineerde",
     "stuurde aan",
     "verdeelde",
     "bereidde voor",
     "leidde",
     "bewaakte",
     "stemde af",
     "volgde op"
    ]
   },
   {
    "groep": "Verbeteren",
    "woorden": [
     "verbeterde",
     "vereenvoudigde",
     "verkortte",
     "verminderde",
     "optimaliseerde",
     "loste op",
     "standaardiseerde",
     "voerde in",
     "herzag",
     "versnelde"
    ]
   },
   {
    "groep": "Documenteren en onderzoeken",
    "woorden": [
     "documenteerde",
     "ordende",
     "archiveerde",
     "digitaliseerde",
     "beschreef",
     "inventariseerde",
     "catalogiseerde",
     "onderzocht",
     "analyseerde",
     "controleerde",
     "mat op"
    ]
   },
   {
    "groep": "Overdragen en helpen",
    "woorden": [
     "leerde aan",
     "legde uit",
     "leidde op",
     "begeleidde",
     "instrueerde",
     "deed voor",
     "ondersteunde",
     "adviseerde",
     "hielp",
     "gaf door"
    ]
   }
  ],
  "vlaamsNederlands": [
   {
    "gebruik": "job",
    "niet": "baan"
   },
   {
    "gebruik": "loon",
    "niet": "salaris"
   },
   {
    "gebruik": "brutoloon",
    "niet": "brutosalaris"
   },
   {
    "gebruik": "gsm, gsm-nummer",
    "niet": "mobiel, 06-nummer"
   },
   {
    "gebruik": "secundair onderwijs",
    "niet": "middelbare school, voortgezet onderwijs"
   },
   {
    "gebruik": "ASO, TSO, BSO, KSO",
    "niet": "vmbo, havo, vwo, mbo"
   },
   {
    "gebruik": "interimkantoor",
    "niet": "uitzendbureau"
   },
   {
    "gebruik": "solliciteren voor een functie",
    "niet": "solliciteren naar een functie"
   },
   {
    "gebruik": "loonfiche, loonbrief",
    "niet": "loonstrookje"
   },
   {
    "gebruik": "eindejaarspremie",
    "niet": "dertiende maand"
   },
   {
    "gebruik": "voltijds, deeltijds",
    "niet": "fulltime, parttime"
   },
   {
    "gebruik": "zelfstandige",
    "niet": "zzp'er"
   },
   {
    "gebruik": "hogeschool, graduaat, professionele bachelor",
    "niet": "hbo"
   }
  ],
  "checklist": [
   {
    "id": "contact",
    "regel": "Naam, gsm-nummer, e-mailadres en woonplaats staan bovenaan en zijn gecontroleerd.",
    "waarom": "Een werkgever die je niet in één keer kan bereiken, belt de volgende kandidaat."
   },
   {
    "id": "profiel-lengte",
    "regel": "Het profiel telt hoogstens vijf zinnen.",
    "waarom": "VDAB raadt bij een carrièreswitch een korte voorstelling van hoogstens vijf zinnen aan, zodat de lezer meteen ziet waarom je deze overstap maakt."
   },
   {
    "id": "placeholders",
    "regel": "Er staan geen vierkante haken meer in de tekst, zoals [aantal] of [Naam bedrijf].",
    "waarom": "Een vergeten invulveld verraadt een sjabloon en kost meteen geloofwaardigheid."
   },
   {
    "id": "chronologie",
    "regel": "Werkervaring en opleiding staan in omgekeerd chronologische volgorde, meest recent eerst.",
    "waarom": "Een werkgever wil eerst zien wat je nu doet en kunt."
   },
   {
    "id": "realisaties",
    "regel": "Elke job heeft minstens één realisatie, niet alleen taken.",
    "waarom": "Taken zeggen wat je moest doen, realisaties tonen wat je voor een werkgever waard bent."
   },
   {
    "id": "cijfers",
    "regel": "Minstens drie regels bevatten een concreet cijfer, zoals collega's, werkstukken, beelden of jaren.",
    "waarom": "Een cijfer maakt een bewering controleerbaar en blijft hangen."
   },
   {
    "id": "actiewerkwoorden",
    "regel": "Regels onder werkervaring beginnen zoveel mogelijk met een actiewerkwoord, en geen enkele met verantwoordelijk voor.",
    "waarom": "Een werkwoord zegt wat je zelf deed en leest sneller."
   },
   {
    "id": "lengte",
    "regel": "Het cv past op één of twee A4-pagina's.",
    "waarom": "Langere cv's worden in Vlaanderen zelden helemaal gelezen."
   },
   {
    "id": "talen-niveau",
    "regel": "Elke taal heeft een niveau, voor alle talen op dezelfde schaal.",
    "waarom": "Zonder niveau kan een werkgever niet inschatten of je Frans of Engels volstaat voor de job."
   },
   {
    "id": "portfolio",
    "regel": "De portfoliolink staat op het cv, opent zonder inloggen en werkt ook op een gsm.",
    "waarom": "Voor ateliers, musea en restauratie is je werk het sterkste bewijs, en een kapotte link kost die kans."
   },
   {
    "id": "verboden-woorden",
    "regel": "Het cv bevat niets over gezondheid, vermoeidheid, burn-out, ziekteverlof of vakbond (ook niet ACV), geen uitroeptekens of emoji, en geen woorden uit Nederland zoals baan, salaris of middelbare school.",
    "waarom": "Een werkgever mag niet naar gezondheid of vakbond vragen, dus het hoort niet op je cv; woorden uit Nederland klinken vreemd voor een Vlaamse lezer, en uitroeptekens en emoji passen niet in een zakelijk document."
   },
   {
    "id": "spelling-naam",
    "regel": "Je naam is overal Remi met een i, en je achternaam is overal op dezelfde manier gespeld.",
    "waarom": "Een tikfout in je eigen naam valt als eerste op, ook in je e-mailadres en de bestandsnaam."
   },
   {
    "id": "bestandsnaam",
    "regel": "Het bestand is een PDF met de naam Remi_[Achternaam]_CV.pdf.",
    "waarom": "Een recruiter bewaart tientallen bestanden en moet het jouwe meteen terugvinden."
   },
   {
    "id": "op-maat",
    "regel": "Het profiel, de volgorde van de vaardigheden en de eerste regels onder werkervaring zijn aangepast aan deze vacature.",
    "waarom": "Een cv op maat toont dat je de vacature echt gelezen hebt en geeft de lezer meteen wat hij zoekt."
   }
  ],
  "bestandsnaam": "Bewaar en verstuur je cv als PDF met de naam Voornaam_Achternaam_CV.pdf, voor jou dus Remi_[Achternaam]_CV.pdf, en je motivatiebrief op dezelfde manier als Remi_[Achternaam]_Motivatiebrief.pdf.",
  "formulieren": [
   "Vlaamse overheid (werkenvoorvlaanderen.be): je solliciteert alleen via het online formulier en in het Nederlands; houd je cv-tekst, je motivatie en per standaardcompetentie een kort STARR-voorbeeld klaar om in te vullen.",
   "Stad Antwerpen (job.antwerpen.be): de cv-screening kijkt naar je cv en je motivatie samen, en daarna volgt altijd een competentiegericht gesprek, vaak met een praktische proef; schrijf de motivatie dus per vacature opnieuw.",
   "Online sollicitatiesystemen (ATS) lezen je cv automatisch: gebruik een eenvoudige opmaak zonder tabellen, tekstvakken of tekst in afbeeldingen, en standaardkoppen zoals Werkervaring en Opleiding.",
   "Federale instellingen zoals het KIK-IRPA werven via werkenvoor.be: je maakt daar een online cv aan, en de selectie bestaat meestal uit een algemene test (abstract redeneren, situaties beoordelen), een functiegerichte screening en een gesprek; wie slaagt, komt vaak in een reserve.",
   "Controleer na het plakken alles in het formulier: opsommingstekens, datums en speciale tekens verspringen vaak; bewaar daarna een kopie of schermafbeelding van wat je indiende en noteer de sollicitatie in de app."
  ]
 },
 "cvMaster": {
  "persoonlijk": {
   "naam": "Remi [Achternaam]",
   "adres": "[Straat nummer], [postcode] Antwerpen",
   "gsm": "[gsm-nummer]",
   "email": "[e-mailadres]",
   "geboortedatum": "[dag maand jaar], Antwerpen",
   "nationaliteit": "Belg",
   "rijbewijs": "[Rijbewijs B, ja of nee]",
   "portfolio": "[link naar portfolio-pdf of pagina]"
  },
  "profiel": "Ik ben technisch tekenaar en verantwoordelijke van het atelier bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal, sinds 2021. Ik teken werkstukken uit, bereid het werk voor, plooi en las zelf en stuur het atelier aan. Daarvoor bouwde ik een fotoarchief op en werkte ik in een creatief fietsatelier. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen en bouw ik meubels. Ik zoek werk waarin vakmanschap, nauwkeurigheid en betekenis samenkomen: erfgoed en restauratie, museum- en theaterateliers, archief en collectie, of het doorgeven van het vak.",
  "werkervaring": [
   {
    "periode": "2021 tot heden",
    "functie": "Technisch tekenaar en verantwoordelijke atelier",
    "werkgever": "[Naam bedrijf], metaalbewerking en maatwerk in plaatmateriaal, [gemeente]",
    "taken": [
     "Gestart als technisch tekenaar en plooi- en lasoperator; sinds [jaar] verantwoordelijke voor het atelier",
     "Maatwerk in plaatmateriaal uittekenen in [CAD-programma] en klaarmaken voor productie",
     "Werkvoorbereiding en planning van het atelier, aansturen van [aantal] collega's",
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, afwerking en kwaliteitscontrole",
     "[Concreet project 1: wat, voor wie, welke moeilijkheid opgelost]",
     "[Concreet project 2]"
    ]
   },
   {
    "periode": "2019",
    "functie": "Medewerker creatief fietsatelier",
    "werkgever": "[Naam atelier], Antwerpen",
    "taken": [
     "Bouw, herstel en maatwerk van fietsen",
     "[Een voorbeeld: wat maakte of herstelde hij, welke techniek]"
    ]
   },
   {
    "periode": "2017 tot 2018",
    "functie": "Opbouw van een fotoarchief",
    "werkgever": "Willy Van de Perre, [fotograaf of kunstenaar, plaats]",
    "taken": [
     "Ordenen, digitaliseren en beschrijven van een fotoarchief",
     "[Omvang: aantal beelden, gebruikte methode of software]"
    ]
   },
   {
    "periode": "2017 tot 2018",
    "functie": "[Functie]",
    "werkgever": "Katoen Natie, Antwerpen (ongeveer een jaar)",
    "taken": [
     "[Taken en afdeling]"
    ]
   },
   {
    "periode": "[jaar] tot heden",
    "functie": "Meubelmaker (eigen werk)",
    "werkgever": "Eigen werk, samen met mijn broer, Antwerpen",
    "taken": [
     "Ontwerp en bouw van meubels op maat [in metaal en hout, materiaal bevestigen]",
     "[Twee of drie voorbeelden met materiaal en techniek]"
    ]
   }
  ],
  "opleiding": [
   {
    "periode": "[jaren] tot heden",
    "titel": "Interieurvormgeving",
    "instelling": "Koninklijke Academie voor Schone Kunsten Antwerpen, avondonderwijs [precieze opleiding en instelling bevestigen]"
   },
   {
    "periode": "[jaren], drie jaar",
    "titel": "Meubel en interieur",
    "instelling": "[Academie, avondonderwijs; getuigschrift ja of nee]"
   },
   {
    "periode": "[jaar], een jaar",
    "titel": "Grafiek",
    "instelling": "Academie, avondonderwijs [naam bevestigen]"
   },
   {
    "periode": "[jaar, rond 2020]",
    "titel": "Lasopleiding: halfautomaat (MIG/MAG) en elektrodelassen",
    "instelling": "[VDAB, SYNTRA of school]"
   },
   {
    "periode": "tot 2017",
    "titel": "Diploma secundair onderwijs, Wetenschappen-Wiskunde",
    "instelling": "Sint-Lutgardis, [Merksem of Antwerpen, naam bevestigen]"
   }
  ],
  "certificaten": [
   "Lascertificaten [MIG/MAG 135 en elektrode 111 bevestigen; TIG 141 ja of nee; norm EN ISO 9606-1; geldigheid]",
   "VCA-basis [ja of nee, geldig tot]",
   "[Andere attesten: heftruck, hoogtewerker, EHBO]"
  ],
  "vaardigheden": [
   "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
   "Werkvoorbereiding en aansturing van een atelier",
   "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
   "Meubelontwerp en -bouw [in metaal en hout, materiaal bevestigen]",
   "Fietstechniek: bouw en herstel",
   "Archiveren en digitaliseren van beeldmateriaal",
   "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar"
  ],
  "talen": [
   {
    "taal": "Nederlands",
    "niveau": "moedertaal"
   },
   {
    "taal": "Engels",
    "niveau": "goed"
   },
   {
    "taal": "Frans",
    "niveau": "[basis of beter]"
   }
  ],
  "interesses": "Erfgoed en ambacht, architectuur en interieur, muziek, [aanvullen]",
  "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, lasser, meubelmaker"
 },
 "hotlist": [
  {
   "id": "monumentenwacht-vlaanderen",
   "naam": "Monumentenwacht Vlaanderen",
   "spoor": "erfgoed",
   "type": "vzw, Vlaams gesubsidieerd",
   "plaats": "Antwerpen",
   "website": "https://www.monumentenwacht.be/",
   "vacatures": "https://www.monumentenwacht.be/vacatures",
   "contact": "https://www.monumentenwacht.be/contact",
   "rollen": "Monumentenwachters inspecteren historische gebouwen en adviseren eigenaars. Werken op hoogte, touwtechnieken, drones. Koepel van vijf provinciale diensten, ongeveer 60 medewerkers.",
   "instap": "Monumentenwachter vraagt meestal een bachelor of master in bouw, architectuur of conservatie. Een technische instap via een aannemer is realistischer als eerste stap.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "monumentenwacht-antwerpen",
   "naam": "Monumentenwacht Antwerpen",
   "spoor": "erfgoed",
   "type": "Provincie Antwerpen",
   "plaats": "Ruggeveldlaan 99, 2100 Deurne",
   "website": "https://www.provincieantwerpen.be/nl/monumentenwacht-antwerpen",
   "vacatures": "https://jobs.provincieantwerpen.be/",
   "contact": "monumentenwacht@provincieantwerpen.be, 03 203 67 80",
   "rollen": "Dienst Erfgoed van de provincie. Recente vacature monumentenwachter duurzaamheid met praktijkproef ter plaatse.",
   "instap": "Vacatures via het provinciale jobportaal. Vraag een infogesprek over de instapmogelijkheden voor iemand met metaalachtergrond.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "onroerend-erfgoed",
   "naam": "Agentschap Onroerend Erfgoed",
   "spoor": "erfgoed",
   "type": "Vlaamse overheid",
   "plaats": "Brussel, Leuven, Gent en regionale kantoren",
   "website": "https://www.onroerenderfgoed.be/",
   "vacatures": "https://www.onroerenderfgoed.be/vacatures",
   "contact": "vacatures@onroerenderfgoed.be (spontaan cv welkom)",
   "rollen": "Erfgoedconsulenten, onderzoekers, depotmedewerkers (niveau C121 vroeg alleen een diploma hoger secundair).",
   "instap": "Selecties via werkenvoorvlaanderen.be. Niveau C is haalbaar met diploma secundair. Spontaan cv sturen is expliciet welkom.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "kik-irpa",
   "naam": "KIK-IRPA, Koninklijk Instituut voor het Kunstpatrimonium",
   "spoor": "erfgoed",
   "type": "Federale wetenschappelijke instelling",
   "plaats": "Brussel",
   "website": "https://www.kikirpa.be/nl",
   "vacatures": "https://www.kikirpa.be/nl/vacatures",
   "contact": "hr@kikirpa.be",
   "rollen": "Ateliers glas en keramiek, polychrome houtsculptuur, steensculptuur, textiel, schilderijen. Metaalatelier te verifiëren. Organiseert de workshop Erfgoedberoepen.",
   "instap": "Niet-wetenschappelijk contractueel personeel via werkenvoor.be. Workshop Erfgoedberoepen is een goed eerste contact.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "verstraete-vanhecke",
   "naam": "Verstraete & Vanhecke",
   "spoor": "erfgoed",
   "type": "NV, restauratieaannemer",
   "plaats": "Wilrijk (Antwerpen)",
   "website": "https://v-v.be/",
   "vacatures": "https://v-v.be/vacatures/",
   "contact": "via website",
   "rollen": "Restauratie van monumenten, meer dan 200 jaar actief. Openstaande rollen in calculatie, steenkapperij, magazijn.",
   "instap": "Spontane sollicitatie met IBO-voorstel voor metaalwerk in restauratieprojecten. Antwerpse vestiging.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "renotec",
   "naam": "Renotec",
   "spoor": "erfgoed",
   "type": "NV, restauratieaannemer",
   "plaats": "Winkelomseheide 229, 2440 Geel",
   "website": "https://renotec.be/",
   "vacatures": "https://jobs.renotec.be/nl/alle-jobs/",
   "contact": "jobs@renotec.be, 014 86 60 21",
   "rollen": "Eigen steenkapperij en glas-in-loodploeg, 17 open jobs (september 2026).",
   "instap": "Vakmensen en techniekers via jobs.renotec.be. Metaalwerk voor monumenten navragen.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "monument-group",
   "naam": "Monument Group (Monument Vandekerckhove)",
   "spoor": "erfgoed",
   "type": "NV groep, restauratieaannemer",
   "plaats": "Ingelmunster, werven in heel Vlaanderen",
   "website": "https://www.monument.be/",
   "vacatures": "https://jobs.monument.be/",
   "contact": "spontane sollicitaties uitdrukkelijk welkom",
   "rollen": "Restauratie, natuursteen, glas-in-lood, dak- en zinkwerk, archeologie.",
   "instap": "Spontane sollicitatie. Vraag naar metaal- en smeedwerk binnen de groep.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "artes-group",
   "naam": "Artes Group (Artes Woudenberg)",
   "spoor": "erfgoed",
   "type": "NV groep",
   "plaats": "Gent, werven regio Antwerpen en Brussel",
   "website": "https://artesgroup.be/",
   "vacatures": "https://artesgroup.be/vacatures",
   "contact": "via website",
   "rollen": "Restauratiedivisie, recent meestergast restauratie regio Antwerpen.",
   "instap": "Vacatures volgen, spontaan aanschrijven voor metaalwerk in restauratie.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "smego",
   "naam": "Smego Metaalwerken",
   "spoor": "erfgoed",
   "type": "BV, metaalrestauratie",
   "plaats": "Hoge Mauw 500, 2370 Arendonk",
   "website": "https://smego.be/",
   "vacatures": "https://smego.be/contact",
   "contact": "contactpagina",
   "rollen": "Restauratie van historisch metaalwerk, onder meer de poortrestauratie Falconplein Antwerpen.",
   "instap": "Klein bedrijf: persoonlijk contact met portfolio, proefdag voorstellen.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "lapis-arte",
   "naam": "Lapis Arte",
   "spoor": "erfgoed",
   "type": "conservatie-restauratie",
   "plaats": "te verifiëren",
   "website": "https://www.lapisarte.be/",
   "vacatures": "",
   "contact": "via website",
   "rollen": "Conservatie-restauratie van steen, metaal en muurschilderkunst, interdisciplinair team.",
   "instap": "Spontane sollicitatie of stagevraag rond metaal.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "altnova",
   "naam": "AltNova",
   "spoor": "erfgoed",
   "type": "restauratie",
   "plaats": "te verifiëren",
   "website": "https://altnova.be/",
   "vacatures": "",
   "contact": "via website",
   "rollen": "Smeedwerk, gietijzer en natuursteenrestauratie.",
   "instap": "Spontane sollicitatie met portfolio.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "art-design-craft",
   "naam": "Art Design & Craft (kunstsmid.net)",
   "spoor": "erfgoed",
   "type": "BV, kunstsmederij",
   "plaats": "Brecht",
   "website": "https://shop.kunstsmid.net/",
   "vacatures": "",
   "contact": "via website",
   "rollen": "Ambachtelijk smeedwerk, waterjet maatwerk, restauratie van metaalwerk.",
   "instap": "Persoonlijk contact, portfolio.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "smederij-de-bruyn",
   "naam": "Smederij De Bruyn",
   "spoor": "erfgoed",
   "type": "kunstsmederij",
   "plaats": "Erembodegem (Aalst)",
   "website": "https://smederijdebruyn.be/",
   "vacatures": "https://smederijdebruyn.be/contact/",
   "contact": "contactpagina",
   "rollen": "Kunstsmid, restauratie van smeedijzer.",
   "instap": "Verder van Antwerpen; interessant voor een stage of leertraject.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "kmska",
   "naam": "KMSKA, Koninklijk Museum voor Schone Kunsten Antwerpen",
   "spoor": "cultuur",
   "type": "Vlaamse instelling",
   "plaats": "Leopold de Waelplaats, 2000 Antwerpen",
   "website": "https://kmska.be/",
   "vacatures": "https://kmska.be/nl/jobs",
   "contact": "sollicitaties@kmska.be (spontaan cv en motivatiebrief)",
   "rollen": "Eigen restauratieatelier sinds 1999, team tentoonstellingsproductie en museumtechnieken, controlekamer.",
   "instap": "Spontane sollicitatie naar sollicitaties@kmska.be. Ga naar het Open restauratieatelier (om de twee maanden).",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "mhka",
   "naam": "M HKA, Museum van Hedendaagse Kunst Antwerpen",
   "spoor": "cultuur",
   "type": "Vlaamse instelling",
   "plaats": "Leuvenstraat 32, 2000 Antwerpen",
   "website": "https://www.muhka.be/",
   "vacatures": "https://muhka.careersite.be/nl",
   "contact": "katrien.geets@muhka.be (HR); spontane sollicitatie en jobalert via careersite",
   "rollen": "Productie- en AV-techniekers, opbouw van tentoonstellingen, erfgoedbewaker.",
   "instap": "Jobalert instellen, spontane sollicitatie als technisch medewerker productie.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "momu",
   "naam": "MoMu, Modemuseum Antwerpen",
   "spoor": "cultuur",
   "type": "vzw, Vlaams gefinancierd",
   "plaats": "Nationalestraat 28, 2000 Antwerpen",
   "website": "https://www.momu.be/",
   "vacatures": "https://www.cultuurjobs.be/organisatie/momu/",
   "contact": "via website",
   "rollen": "Tentoonstellingsopbouw grotendeels met externe partners.",
   "instap": "Vacatures volgen via cultuurjobs.be.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "fomu",
   "naam": "FOMU, Fotomuseum Antwerpen",
   "spoor": "cultuur",
   "type": "vzw, Vlaams gefinancierd",
   "plaats": "Waalsekaai 47, 2000 Antwerpen",
   "website": "https://fomu.be/",
   "vacatures": "https://www.cultuurjobs.be/organisatie/fomu/",
   "contact": "via website",
   "rollen": "Tentoonstellingsproductie.",
   "instap": "Vacatures volgen.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "middelheim",
   "naam": "Middelheimmuseum",
   "spoor": "cultuur",
   "type": "Stad Antwerpen",
   "plaats": "Middelheimlaan 61, 2020 Antwerpen",
   "website": "https://middelheimmuseum.be/",
   "vacatures": "https://job.antwerpen.be/",
   "contact": "middelheimmuseum@antwerpen.be, 03 288 33 60",
   "rollen": "Openluchtmuseum voor beeldhouwkunst: onderhoud en conservatie van metalen sculpturen in de buitenlucht is rechtstreeks relevant.",
   "instap": "Vraag een gesprek met de collectie- of technische ploeg over sculptuuronderhoud. Vacatures via job.antwerpen.be.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "mas",
   "naam": "MAS, Museum aan de Stroom",
   "spoor": "cultuur",
   "type": "Stad Antwerpen",
   "plaats": "Hanzestedenplaats 1, 2000 Antwerpen",
   "website": "https://mas.be/",
   "vacatures": "https://job.antwerpen.be/",
   "contact": "via job.antwerpen.be",
   "rollen": "Recent projectmedewerker maritiem erfgoed. Collectiebeheer en technische diensten zijn stedelijk gepoold.",
   "instap": "Vacatures van de stad volgen (Musea en Erfgoed).",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "stad-antwerpen-musea",
   "naam": "Stad Antwerpen, Musea en Erfgoed (Plantin-Moretus, Rubenshuis, Red Star Line, Letterenhuis, FelixArchief)",
   "spoor": "cultuur",
   "type": "Stad Antwerpen",
   "plaats": "Antwerpen",
   "website": "https://www.antwerpen.be/",
   "vacatures": "https://job.antwerpen.be/go/Alle-vacatures/4474301/",
   "contact": "via job.antwerpen.be",
   "rollen": "Technisch assistent C1, collectiezorg, depot, tentoonstellingsbouw, technische dienst stadsgebouwen, Kunstenlab (OLT en Arenberg). Loon C1 vanaf €2.460, met 5 jaar ervaring €2.769 bruto.",
   "instap": "Werfreserve: eens geslaagd blijf je een jaar in aanmerking voor gelijkaardige jobs. Selectie met cv-screening, competentiegesprek en praktische proef.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "toneelhuis",
   "naam": "Toneelhuis",
   "spoor": "cultuur",
   "type": "vzw",
   "plaats": "Bourla, Komedieplaats, 2000 Antwerpen",
   "website": "https://toneelhuis.be/",
   "vacatures": "https://toneelhuis.be/nl/over-toneelhuis/vacatures-stages/",
   "contact": "personeelszaken@toneelhuis.be (cv, motivatie en concreet voorstel)",
   "rollen": "Technische ploeg en decoratelier. Elk seizoen stages.",
   "instap": "Spontane mail met concreet voorstel (stage of proefperiode in het decoratelier).",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "desingel",
   "naam": "deSingel",
   "spoor": "cultuur",
   "type": "vzw, Vlaamse instelling",
   "plaats": "Desguinlei 25, 2018 Antwerpen",
   "website": "https://desingel.be/",
   "vacatures": "https://desingel.be/nl/blog",
   "contact": "via website",
   "rollen": "Technische dienst van de internationale kunstcampus.",
   "instap": "Vacatures verschijnen op de blog en op publiq.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "opera-ballet-vlaanderen",
   "naam": "Opera Ballet Vlaanderen",
   "spoor": "cultuur",
   "type": "vzw, grootste culturele werkgever in Vlaanderen",
   "plaats": "Antwerpen en Gent; decoratelier in Zele",
   "website": "https://www.operaballet.be/",
   "vacatures": "https://www.operaballet.be/nl/werken-bij-opera-ballet-vlaanderen",
   "contact": "https://www.operaballet.be/nl/contact",
   "rollen": "Decoratelier (Baaikensstraat 2C, 9240 Zele, 2.837 m2), Set Design Studio, meer dan 400 vaste medewerkers. Decorbouw in metaal is een directe match.",
   "instap": "Vacatures decoratelier volgen; spontane sollicitatie als decorbouwer metaal.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "laika",
   "naam": "Laika",
   "spoor": "cultuur",
   "type": "vzw",
   "plaats": "Albrecht Rodenbachstraat 21, 2140 Borgerhout",
   "website": "https://www.laika.be/",
   "vacatures": "",
   "contact": "03 230 81 91",
   "rollen": "Theatergezelschap met eigen bouw van decors.",
   "instap": "Telefonisch contact, stagevraag.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "meyvaert",
   "naam": "Meyvaert Museum",
   "spoor": "cultuur",
   "type": "NV, museumvitrines",
   "plaats": "Gent",
   "website": "https://www.meyvaert.com/",
   "vacatures": "https://www.meyvaert.com/nl/careers/vacatures",
   "contact": "via website",
   "rollen": "Vitrines voor het Louvre, het British Museum en het Rijksmuseum. Fijn plaat- en laswerk op museumkwaliteit, samen met tekenwerk: dicht bij wat Remi nu doet.",
   "instap": "Profiel past goed (tekenen plus plaatwerk); pendel naar Gent.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "total-concept",
   "naam": "Total Concept",
   "spoor": "cultuur",
   "type": "BV, decorbouw",
   "plaats": "Ranst (Antwerpen)",
   "website": "https://totalconcept.be/",
   "vacatures": "https://totalconcept.be/nl/decorbouwer-in/belgie/",
   "contact": "via website",
   "rollen": "Decors in hout, metaal en schuim voor tentoonstellingen en events.",
   "instap": "Spontane sollicitatie als decorbouwer metaal.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "syntra-ab",
   "naam": "SYNTRA AB",
   "spoor": "onderwijs",
   "type": "vzw",
   "plaats": "Campussen Antwerpen en Vlaams-Brabant",
   "website": "https://www.syntra-ab.be/",
   "vacatures": "https://jobs.syntra-ab.be/",
   "contact": "Spontane sollicitatie docenten via https://www.syntra-ab.be/docenten",
   "rollen": "Meer dan 1.000 docenten, geen lerarendiploma vereist. Selectie: cv, gesprek, proefles. Gesubsidieerde cursussen: werknemerscontract; andere: freelance.",
   "instap": "Spontaan solliciteren als docent lassen of metaal voor avondcursussen (werknemerscontract).",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": ""
  },
  {
   "id": "cvo-encora",
   "naam": "CVO Encora (Stedelijk Onderwijs Antwerpen)",
   "spoor": "onderwijs",
   "type": "Stad Antwerpen (AG Stedelijk Onderwijs)",
   "plaats": "Antwerpen",
   "website": "https://cvoencora.stedelijkonderwijs.be/",
   "vacatures": "https://jobs.stedelijkonderwijs.be/",
   "contact": "jobalert via https://stedelijkonderwijs.career.emply.com/job-alert",
   "rollen": "Grootste CVO van de stad, technische opleidingen.",
   "instap": "Jobalert instellen. Nuttige ervaring laten erkennen (3 jaar volstaat voor praktijkvakken).",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "cvo-vitant",
   "naam": "CVO Vitant (Provinciaal Onderwijs Antwerpen)",
   "spoor": "onderwijs",
   "type": "Provincie Antwerpen",
   "plaats": "Antwerpen, Berchem, Hoboken, Kapellen",
   "website": "https://www.cvovitant.be/",
   "vacatures": "https://jobpage.cvwarehouse.com/?companyGuid=29d5dabf-79af-4731-941e-91cb971e6435&lang=nl-BE",
   "contact": "via jobpagina",
   "rollen": "Ongeveer 5.500 cursisten, technische richtingen.",
   "instap": "Vacatures volgen, spontaan aanschrijven voor praktijkvakken metaal.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "ap-kaska",
   "naam": "AP Hogeschool, Koninklijke Academie voor Schone Kunsten Antwerpen",
   "spoor": "onderwijs",
   "type": "Hogeschool",
   "plaats": "Mutsaardstraat, 2000 Antwerpen",
   "website": "https://www.ap-arts.be/",
   "vacatures": "https://www.ap-arts.be/news/job-alert",
   "contact": "via vacature",
   "rollen": "Praktijklector vraagt minstens een bachelor. Atelierassistent of studentenjob in de werkplaatsen is een realistische eerste stap.",
   "instap": "Jobalert instellen. Docenten aanspreken over assistentie in de metaalwerkplaats.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "vdab-instructeur",
   "naam": "VDAB competentiecentra (instructeur lassen)",
   "spoor": "onderwijs",
   "type": "Vlaamse overheid",
   "plaats": "Antwerpen, Mechelen, Turnhout",
   "website": "https://www.vdab.be/",
   "vacatures": "https://www.vdab.be/vindeenjob/jobs/vdab-instructeur",
   "contact": "via vacature",
   "rollen": "Instructeur lassen en metaal; geen pedagogisch diploma vereist, interne opleiding. Kleine groepen volwassenen, loon schaal C, 35 verlofdagen.",
   "instap": "Vacatures instructeur volgen. Ervaring met plooien, halfautomaat- en elektrodelassen en atelierleiding is een sterke basis.",
   "prioriteit": 1,
   "status": "in voorbereiding",
   "notities": "Te verifiëren: actuele vacatures."
  },
  {
   "id": "het-facilitair-bedrijf",
   "naam": "Het Facilitair Bedrijf (Vlaamse overheid)",
   "spoor": "overheid",
   "type": "Vlaamse overheid",
   "plaats": "Brussel en regionaal",
   "website": "https://overheid.vlaanderen.be/facilitairbedrijf",
   "vacatures": "https://www.werkenvoorvlaanderen.be/",
   "contact": "via werkenvoorvlaanderen.be",
   "rollen": "Technisch gebouwbeheer, onderhoud, elektromechanica.",
   "instap": "Selecties via werkenvoorvlaanderen.be.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "fod-justitie",
   "naam": "FOD Justitie, gevangeniswerkhuizen (Cellmade)",
   "spoor": "overheid",
   "type": "Federale overheid",
   "plaats": "Antwerpen, Beveren, Merksplas, Hoogstraten, Wortel, Turnhout, Mechelen",
   "website": "https://www.cellmade.be/",
   "vacatures": "https://werkenvoor.be/nl/jobs",
   "contact": "via werkenvoor.be",
   "rollen": "Penitentiair technisch assistent (niveau C): metaalwerk aanleren en organiseren met gedetineerden, plannen lezen, kwaliteitscontrole. Statutair, weekdagen.",
   "instap": "Selecties via werkenvoor.be volgen. Te verifiëren.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": "Uit de horizonverkenning; niet geverifieerd."
  },
  {
   "id": "kmda",
   "naam": "KMDA (ZOO Antwerpen, Planckendael)",
   "spoor": "overheid",
   "type": "vzw",
   "plaats": "Antwerpen, Mechelen",
   "website": "https://www.kmda.org/",
   "vacatures": "https://www.kmda.org/nl/jobs",
   "contact": "via website",
   "rollen": "Technische dienst met eigen ateliers voor verblijven, hekwerk en historische gebouwen.",
   "instap": "Vacatures volgen; spontane sollicitatie technische dienst.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": "Uit de horizonverkenning; niet geverifieerd."
  },
  {
   "id": "kiwa-vincotte",
   "naam": "Kiwa Vinçotte (lasinspectie, NDT)",
   "spoor": "reserve",
   "type": "NV",
   "plaats": "Vilvoorde, teams in de Antwerpse haven",
   "website": "https://www.kiwa.com/be/",
   "vacatures": "https://www.kiwa.com/be/nl/over-kiwa/jobs/",
   "contact": "via website",
   "rollen": "Lasinspecteur, NDT-technicus. Opleiding IWS via het Belgisch Instituut voor Lastechniek (6 tot 12 maanden deeltijds).",
   "instap": "Eerst IWS of NDT niveau 1 behalen; VDAB of sectorfonds mtech+ kan meefinancieren.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": "Uit de horizonverkenning; niet geverifieerd."
  },
  {
   "id": "uantwerpen-atp",
   "naam": "Universiteit Antwerpen (technische diensten en werkplaatsen)",
   "spoor": "reserve",
   "type": "Universiteit",
   "plaats": "Antwerpen",
   "website": "https://www.uantwerpen.be/",
   "vacatures": "https://www.uantwerpen.be/nl/jobs/vacatures/atp/",
   "contact": "vacatures@uantwerpen.be",
   "rollen": "Instrumentenmaker, technicus werkplaats; zeer studievriendelijke werkgever.",
   "instap": "Jobalert ATP instellen.",
   "prioriteit": 2,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "vito",
   "naam": "VITO",
   "spoor": "reserve",
   "type": "Onderzoeksinstelling",
   "plaats": "Mol",
   "website": "https://vito.be/",
   "vacatures": "https://jobs.vito.be/",
   "contact": "via website",
   "rollen": "Materiaalonderzoek, labtechnici (Built Environment).",
   "instap": "Vacatures volgen.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  },
  {
   "id": "orteam",
   "naam": "Orteam (orthopedie)",
   "spoor": "reserve",
   "type": "BV",
   "plaats": "Waasmunster, werking Antwerpen",
   "website": "https://www.orteam.be/",
   "vacatures": "https://www.orteam.be/vacatures/",
   "contact": "imke.vanpraet@orteam.be",
   "rollen": "Orthopedisch technoloog, eigen atelier.",
   "instap": "Vacatures volgen; opleiding orthopedische technologie navragen.",
   "prioriteit": 3,
   "status": "nog niet benaderd",
   "notities": ""
  }
 ],
 "jobbronnen": {
  "zoektermen": [
   "technisch tekenaar",
   "werkvoorbereider metaal",
   "plaatbewerker",
   "lasser",
   "decorbouwer",
   "podiumtechnicus",
   "technisch medewerker museum",
   "tentoonstellingsbouw",
   "art handler",
   "depotmedewerker",
   "archiefmedewerker",
   "restauratie",
   "erfgoed",
   "monumentenwacht",
   "instructeur lassen",
   "praktijkleraar metaal",
   "meubelmaker"
  ],
  "bronnen": [
   {
    "id": "vdab",
    "naam": "VDAB, Vind een job",
    "type": "primair",
    "url": "https://www.vdab.be/vindeenjob",
    "zoeklinks": [
     {
      "label": "Lasser, provincie Antwerpen",
      "url": "https://www.vdab.be/vindeenjob/jobs/lasser-antwerpen-provincie"
     },
     {
      "label": "Aluminium lasser, provincie Antwerpen",
      "url": "https://www.vdab.be/vindeenjob/jobs/aluminium-lasser?f=provincie:antwerpen-provincie"
     },
     {
      "label": "Restauratie",
      "url": "https://www.vdab.be/vindeenjob/jobs/restauratie"
     },
     {
      "label": "Erfgoed",
      "url": "https://www.vdab.be/vindeenjob/jobs/erfgoed"
     },
     {
      "label": "Culturele sector",
      "url": "https://www.vdab.be/vindeenjob/jobs/jobs-culturele-sector"
     },
     {
      "label": "Cultuur",
      "url": "https://www.vdab.be/vindeenjob/jobs/cultuur"
     },
     {
      "label": "Museum",
      "url": "https://www.vdab.be/vindeenjob/jobs/museum-antwerpen-provincie"
     },
     {
      "label": "Decorbouwer",
      "url": "https://www.vdab.be/vindeenjob/jobs/decorbouwer"
     },
     {
      "label": "Podiumtechnicus",
      "url": "https://www.vdab.be/vindeenjob/jobs/podiumtechnicus"
     },
     {
      "label": "Onderwijs",
      "url": "https://www.vdab.be/vindeenjob/jobs/onderwijs"
     },
     {
      "label": "Werken voor Vlaanderen (spiegel)",
      "url": "https://www.vdab.be/vindeenjob/jobs/werken-voor-vlaanderen-vacatures"
     },
     {
      "label": "Stad Antwerpen (spiegel)",
      "url": "https://www.vdab.be/vindeenjob/jobs/stad-antwerpen-medewerker"
     }
    ],
    "api": "Open Services API, product Vacatures v3.2.2 (developer.vdab.be/openservices/product/756): gratis basisniveau, zoeken met filters, tot 2.000 oproepen per minuut.",
    "opmerking": "Ook Mijn Loopbaan-profiel en jobs op maat per mail na inloggen. Serverzijde ophaalbaar."
   },
   {
    "id": "cultuurjobs",
    "naam": "Cultuurjobs.be",
    "type": "cultuur",
    "url": "https://www.cultuurjobs.be/",
    "zoeklinks": [
     {
      "label": "Antwerpen",
      "url": "https://www.cultuurjobs.be/plaats/antwerpen/"
     },
     {
      "label": "Productie",
      "url": "https://www.cultuurjobs.be/categorie/productie/"
     },
     {
      "label": "M HKA",
      "url": "https://www.cultuurjobs.be/organisatie/m-hka/"
     },
     {
      "label": "MAS",
      "url": "https://www.cultuurjobs.be/organisatie/mas/"
     },
     {
      "label": "Toneelhuis",
      "url": "https://www.cultuurjobs.be/organisatie/toneelhuis/"
     },
     {
      "label": "Opera Ballet Vlaanderen",
      "url": "https://www.cultuurjobs.be/organisatie/opera-ballet-vlaanderen/"
     }
    ],
    "api": "WordPress; /feed/ vermoedelijk beschikbaar (te verifiëren).",
    "opmerking": "Beste enkele cultuurbron."
   },
   {
    "id": "faro",
    "naam": "FARO, vacatures cultureel erfgoed",
    "type": "erfgoed",
    "url": "https://faro.be/vacatures",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Hoofdbron voor het erfgoedspoor."
   },
   {
    "id": "herita",
    "naam": "Herita",
    "type": "erfgoed",
    "url": "https://www.herita.be/nl/vacatures",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Personeel en vrijwilligers; Open Monumentendag."
   },
   {
    "id": "publiq",
    "naam": "publiq vacaturebank",
    "type": "cultuur",
    "url": "https://www.publiq.be/nl/vacaturebank",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Cultuur en vrije tijd; deSingel en KASK plaatsen hier."
   },
   {
    "id": "sociare",
    "naam": "Sociare vacatures",
    "type": "sociaal",
    "url": "https://www.sociare.be/nl/vacatures",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Socioculturele sector; verwijst ook naar socius.be, 11.be, jeugdwerkjobs.be."
   },
   {
    "id": "stepp",
    "naam": "STEPP (podiumtechniek)",
    "type": "cultuur",
    "url": "https://www.stepp.be/",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Netwerk en vacatures voor podiumtechnici. Te verifiëren."
   },
   {
    "id": "werkenvoorvlaanderen",
    "naam": "Werken voor Vlaanderen",
    "type": "overheid",
    "url": "https://www.werkenvoorvlaanderen.be/",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Onroerend Erfgoed, Het Facilitair Bedrijf, KMSKA, M HKA. Alleen via online formulier in het Nederlands."
   },
   {
    "id": "werkenvoor",
    "naam": "werkenvoor.be (federaal)",
    "type": "overheid",
    "url": "https://werkenvoor.be/nl/jobs",
    "zoeklinks": [],
    "api": "",
    "opmerking": "KIK-IRPA, FOD Justitie (penitentiair technisch assistent), Rijksarchief, Bozar."
   },
   {
    "id": "stad-antwerpen",
    "naam": "Jobs bij Stad Antwerpen",
    "type": "overheid",
    "url": "https://job.antwerpen.be/",
    "zoeklinks": [
     {
      "label": "Alle vacatures",
      "url": "https://job.antwerpen.be/go/Alle-vacatures/4474301/"
     }
    ],
    "api": "",
    "opmerking": "Musea en Erfgoed, technische diensten, Kunstenlab. Werfreserve blijft een jaar geldig."
   },
   {
    "id": "provincie-antwerpen",
    "naam": "Jobs bij Provincie Antwerpen",
    "type": "overheid",
    "url": "https://jobs.provincieantwerpen.be/",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Monumentenwacht Antwerpen, CVO Vitant, provinciale domeinen. Jobalert mogelijk."
   },
   {
    "id": "stedelijk-onderwijs",
    "naam": "Jobs Stedelijk Onderwijs Antwerpen",
    "type": "onderwijs",
    "url": "https://jobs.stedelijkonderwijs.be/",
    "zoeklinks": [
     {
      "label": "Jobalert",
      "url": "https://stedelijkonderwijs.career.emply.com/job-alert"
     }
    ],
    "api": "",
    "opmerking": "CVO Encora en secundaire scholen van de stad."
   },
   {
    "id": "onderwijsvacatures",
    "naam": "Onderwijsvacatures.be",
    "type": "onderwijs",
    "url": "https://www.onderwijsvacatures.be/",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Ook onderwijswerkt.be en g-o.be/jobs."
   },
   {
    "id": "syntra-ab",
    "naam": "SYNTRA AB jobs",
    "type": "onderwijs",
    "url": "https://jobs.syntra-ab.be/",
    "zoeklinks": [
     {
      "label": "Docent worden",
      "url": "https://www.syntra-ab.be/docenten"
     }
    ],
    "api": "",
    "opmerking": "Spontane sollicitatie als docent altijd mogelijk."
   },
   {
    "id": "flandersdc",
    "naam": "Flanders DC vacatures",
    "type": "design",
    "url": "https://www.flandersdc.be/nl/vacatures/overzicht",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Design en mode."
   },
   {
    "id": "stepstone",
    "naam": "StepStone",
    "type": "algemeen",
    "url": "https://www.stepstone.be/vacatures/lasser",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Secundair. Botbescherming waarschijnlijk."
   },
   {
    "id": "indeed",
    "naam": "Indeed",
    "type": "algemeen",
    "url": "https://be.indeed.com/q-lasser-l-antwerpen-vacatures.html",
    "zoeklinks": [
     {
      "label": "Restauratie",
      "url": "https://be.indeed.com/Restauratie-jobs"
     }
    ],
    "api": "",
    "opmerking": "Alleen als doorkliklink; niet automatisch ophalen."
   },
   {
    "id": "linkedin",
    "naam": "LinkedIn Jobs",
    "type": "algemeen",
    "url": "https://be.linkedin.com/jobs/lasser-jobs",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Netwerken; niet automatisch ophalen."
   },
   {
    "id": "randstad",
    "naam": "Randstad (interim, vangnet)",
    "type": "interim",
    "url": "https://www.randstad.be/werknemers/jobs/s-metaal/s2-lassers/r-lasser/re-antwerpen/ci-antwerpen/",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Vangnet voor inkomen; serverzijde ophaalbaar."
   },
   {
    "id": "accent",
    "naam": "Accent Jobs (interim, vangnet)",
    "type": "interim",
    "url": "https://accentjobs.be/nl/vacatures/antwerpen/techniek-productie/lasser",
    "zoeklinks": [],
    "api": "",
    "opmerking": "Vangnet."
   },
   {
    "id": "jooble",
    "naam": "Jooble (aggregator)",
    "type": "algemeen",
    "url": "https://be.jooble.org/vacatures-lasser/Antwerpen",
    "zoeklinks": [
     {
      "label": "Kunst en cultuur Antwerpen",
      "url": "https://be.jooble.org/vacatures-kunst-cultuur/Antwerpen"
     }
    ],
    "api": "",
    "opmerking": "Dekking."
   }
  ]
 },
 "maandplan": [
  {
   "maand": "2026-10",
   "thema": "Administratie, strategie en cv",
   "focus": [
    "Rechten veiligstellen: ACV (verwittiging, contract), dokter op 16 oktober, niets tekenen",
    "Papieren op orde: kopie van het contract en het arbeidsreglement, startdatum en statuut, loonfiches",
    "Strategie kiezen: uitstapscenario A, B of C met ACV, en de sporen waarop je solliciteert",
    "Cv-atelier afwerken: master-cv, portfolio, VDAB-profiel",
    "De twaalf concept-sollicitaties nalezen en aanvullen, nog niets versturen"
   ],
   "klaar": "Dossier op orde, een gekozen scenario, een cv en portfolio die klaar zijn om te versturen.",
   "sollicitaties": "Nog geen, alleen voorbereiden",
   "uren": [
    3,
    5
   ]
  },
  {
   "maand": "2026-11",
   "thema": "Sollicitaties versturen",
   "focus": [
    "Twee tot drie spontane sollicitaties per week, prioriteit 1 eerst (erfgoed, musea, decorateliers)",
    "Opvolgen twaalf dagen na het versturen, alles bijhouden in Sollicitaties",
    "Na twee weken kijken hoeveel tijd één sollicitatie echt vraagt, en het tempo daarop afstemmen",
    "Dag van de Ambachten op 15 november",
    "Loopbaancheque aanvragen vóór 30 november, VDAB-loopbaangesprek aanvragen"
   ],
   "klaar": "Zes tot tien sollicitaties verstuurd en zicht op hoeveel werk één sollicitatie vraagt.",
   "sollicitaties": "6 tot 10",
   "uren": [
    4,
    6
   ]
  },
  {
   "maand": "2026-12",
   "thema": "Opvolgen en het contract afronden",
   "focus": [
    "Opvolgen, gesprekken plannen en voorbereiden",
    "Einde contract correct: C4, vakantiegeld, eindejaarspremie, alleen tekenen voor ontvangst",
    "VDAB-inschrijving en uitkeringsdossier bij ACV voorbereiden",
    "Rust inbouwen rond de feestdagen"
   ],
   "klaar": "Alle papieren van het einde van het contract binnen, inschrijving klaar om in te dienen.",
   "sollicitaties": "2 tot 4, en opvolging",
   "uren": [
    3,
    5
   ]
  },
  {
   "maand": "2027-01",
   "thema": "Herstellen en inschrijven",
   "focus": [
    "Inschrijven bij VDAB binnen 8 dagen, uitkeringsdossier via ACV",
    "Rust staat centraal: één trajectdag per week",
    "Op de trajectdag: sollicitaties opvolgen en antwoorden noteren"
   ],
   "klaar": "Ingeschreven, inkomen geregeld, een vast ritme van één trajectdag per week.",
   "sollicitaties": "Alleen opvolging",
   "uren": [
    2,
    4
   ]
  },
  {
   "maand": "2027-02",
   "thema": "Rust en oriëntatie",
   "focus": [
    "Infomomenten van opleidingen bezoeken en noteren",
    "Een VDAB-beroepsopleiding van minstens 3 maanden voltijds bekijken (verlengt de uitkering)",
    "Eventueel korte certificaten zoals VCA of IPAF"
   ],
   "klaar": "Een korte lijst van opleidingen en stages die je wil proberen.",
   "sollicitaties": "1 tot 3 gerichte",
   "uren": [
    3,
    5
   ]
  },
  {
   "maand": "2027-03",
   "thema": "Proeven: stage en vrijwilligerswerk",
   "focus": [
    "Beroepsverkennende stage of IBO bij een museumatelier, decoratelier of restauratiebedrijf",
    "Gerichte sollicitaties op vacatures",
    "FARO basiscursus"
   ],
   "klaar": "Een eerste stage of vrijwilligersplek loopt.",
   "sollicitaties": "2 tot 4 gerichte",
   "uren": [
    6,
    10
   ]
  },
  {
   "maand": "2027-04",
   "thema": "Proeven en netwerken",
   "focus": [
    "Stage of vrijwilligerswerk verderzetten",
    "Erfgoeddag op 18 april",
    "Opleidingen vergelijken op inhoud, duur en inkomen"
   ],
   "klaar": "Weten welk werk je echt ligt.",
   "sollicitaties": "2 tot 4 gerichte",
   "uren": [
    6,
    10
   ]
  },
  {
   "maand": "2027-05",
   "thema": "Kiezen",
   "focus": [
    "Antwerp Art Weekend van 6 tot 9 mei",
    "Inschrijvingen en toelatingsvoorwaarden van de gekozen opleiding nakijken",
    "Gesprekken bij VDAB en ACV over het behoud van inkomen tijdens de opleiding"
   ],
   "klaar": "Een voorkeur voor job of opleiding, met een plan voor het inkomen.",
   "sollicitaties": "2 tot 4 gerichte",
   "uren": [
    5,
    8
   ]
  },
  {
   "maand": "2027-06",
   "thema": "Beslissen",
   "focus": [
    "Beslissing over de opleiding uiterlijk 30 juni",
    "Inschrijven of het contract voorbereiden"
   ],
   "klaar": "De keuze is gemaakt en ingediend.",
   "sollicitaties": "Volgens de keuze",
   "uren": [
    4,
    6
   ]
  },
  {
   "maand": "2027-07",
   "thema": "Zomer: rust en praktische zaken",
   "focus": [
    "Praktische voorbereiding van de start",
    "Rust"
   ],
   "klaar": "Alles klaar voor september.",
   "sollicitaties": "Geen of weinig",
   "uren": [
    1,
    3
   ]
  },
  {
   "maand": "2027-08",
   "thema": "Voorbereiden op de start",
   "focus": [
    "Materiaal, uurrooster en verplaatsingen regelen",
    "Museumnacht Antwerpen (datum te bevestigen)"
   ],
   "klaar": "Klaar om te beginnen.",
   "sollicitaties": "Geen of weinig",
   "uren": [
    2,
    4
   ]
  },
  {
   "maand": "2027-09",
   "thema": "Starten",
   "focus": [
    "Eerste contract in de nieuwe richting, of start van de opleiding met behoud van inkomen",
    "Avondstudie verder",
    "Open Monumentendag op 12 september"
   ],
   "klaar": "Een nieuwe start.",
   "sollicitaties": "Volgens de situatie",
   "uren": null
  }
 ],
 "opleidingen": [
  {
   "id": "certificaten",
   "naam": "Korte veiligheids- en riggingcertificaten",
   "instelling": "VCA (besacc-vca.be), IPAF, STEPP, ETTE",
   "duur": "Dagen tot weken",
   "formaat": "Kort, overdag",
   "kost": "€100 tot €600 per certificaat; gratis via VDAB voor werkzoekenden",
   "financiering": "VDAB; Sociaal Fonds Podiumkunsten voor werkgevers",
   "knelpunt": "",
   "okot": false,
   "spoor": "cultuur",
   "fit": 5,
   "toelichting": "Maakt van een lasser binnen enkele maanden een inzetbare podium- of depottechnicus. Eerst doen.",
   "url": "https://www.stepp.be/",
   "status": "aanbevolen"
  },
  {
   "id": "faro",
   "naam": "FARO basiscursus behoud en beheer",
   "instelling": "FARO, Brussel",
   "duur": "Enkele dagen gespreid over weken",
   "formaat": "Overdag",
   "kost": "Ongeveer €100 tot €300",
   "financiering": "Eigen middelen of VDAB",
   "knelpunt": "",
   "okot": false,
   "spoor": "erfgoed",
   "fit": 5,
   "toelichting": "Standaard instapticket voor collectiezorg in musea en depots. Voorjaar 2027.",
   "url": "https://faro.be/vorming",
   "status": "aanbevolen"
  },
  {
   "id": "educatief-graduaat",
   "naam": "Educatief graduaat secundair onderwijs (praktijkvakken metaal)",
   "instelling": "AP Hogeschool, Karel de Grote Hogeschool, Thomas More",
   "duur": "90 studiepunten, 1,5 jaar voltijds of 2 tot 3 jaar avond en werkplekleren",
   "formaat": "Avond, gecombineerd",
   "kost": "Ongeveer €1.240 per 60 studiepunten (te verifiëren)",
   "financiering": "Aangeboden als OKOT (onder meer Erasmushogeschool Brussel); voor AP en KdG navragen bij VDAB. LIO-baan: betaald deeltijds lesgeven tijdens de opleiding. Verlengt de 24 maanden niet.",
   "knelpunt": "Leraar secundair onderwijs is knelpunt",
   "okot": true,
   "spoor": "onderwijs",
   "fit": 5,
   "toelichting": "Toelating met diploma secundair plus 3 jaar relevante ervaring (of 5 jaar zonder attest). Opent praktijkleraar lassen-constructie in TSO, BSO, BuSO en instructeursrollen in jongerenprojecten.",
   "url": "https://www.ap.be/graduaat/secundair-onderwijs",
   "status": "kandidaat"
  },
  {
   "id": "bouwkundig-tekenen",
   "naam": "Graduaat Bouwkundig tekenen",
   "instelling": "AP Hogeschool (Spoor Noord), Thomas More (Mechelen)",
   "duur": "120 studiepunten, 2 jaar",
   "formaat": "Dag, met avond- of werktraject (te verifiëren)",
   "kost": "Ongeveer €1.240 per jaar",
   "financiering": "OKOT bevestigd (VDAB-opleiding O-AMI-134150): inschrijvingsgeld betaald, uitkering behouden; valt wel onder de beperking van 24 maanden.",
   "knelpunt": "Bouwkundig tekenaar is knelpunt",
   "okot": true,
   "spoor": "reserve",
   "fit": 4,
   "toelichting": "Past bij plannen lezen en structureel denken; deelt vakken met interieurvormgeving. Minder fysiek werk.",
   "url": "https://www.ap.be/",
   "status": "kandidaat"
  },
  {
   "id": "conservatie-restauratie",
   "naam": "Bachelor en master Conservatie-Restauratie, specialisatie metaal",
   "instelling": "Universiteit Antwerpen, Campus Mutsaard",
   "duur": "3 jaar bachelor plus 1 tot 2 jaar master",
   "formaat": "Voltijds overdag; werkstudent moeilijk in atelieropleiding",
   "kost": "Ongeveer €1.240 per jaar",
   "financiering": "Niet OKOT. Vrijstelling voor voltijdse studies mogelijk als VDAB oordeelt dat ze in je traject passen, maar studies verlengen de uitkering niet. Realistisch via deeltijds werk, het medische spoor of eerst een jaar werken.",
   "knelpunt": "Niet",
   "okot": false,
   "spoor": "erfgoed",
   "fit": 5,
   "toelichting": "De echte restauratorroute; specialisaties glas, keramiek, hout, metaal, steen, textiel, papier. Toelating bevestigd: iedereen met een diploma secundair kan inschrijven, geen toelatingsproef vermeld. Zelfde campus als de Academie; studiepunten van de academie mogelijk als vrijstelling. Past niet volledig binnen 24 maanden uitkering.",
   "url": "https://www.uantwerpen.be/nl/studeren/aanbod/alle-opleidingen/conservatie-restauratie/bachelor/",
   "status": "langere termijn"
  },
  {
   "id": "podiumtechnieken-sense",
   "naam": "Se-n-Se Podiumtechnieken (7de jaar TSO)",
   "instelling": "Enkele Vlaamse scholen (lijst op onderwijskiezer.be)",
   "duur": "Eén schooljaar met lange stages",
   "formaat": "Dag",
   "kost": "Gratis",
   "financiering": "Secundair onderwijs",
   "knelpunt": "Podiumtechnicus vermoedelijk knelpunt",
   "okot": false,
   "spoor": "cultuur",
   "fit": 3,
   "toelichting": "Snelste formele podiumkwalificatie; alleen als een schoolritme haalbaar is.",
   "url": "https://www.onderwijskiezer.be/",
   "status": "kandidaat"
  },
  {
   "id": "ritcs",
   "naam": "Professionele bachelor Podiumtechnieken",
   "instelling": "RITCS, Erasmushogeschool Brussel",
   "duur": "3 jaar, 180 studiepunten",
   "formaat": "Dag, veel stages",
   "kost": "Ongeveer €1.180 per jaar",
   "financiering": "OKOT als podiumtechnicus dat jaar knelpunt is (te verifiëren)",
   "knelpunt": "Te verifiëren",
   "okot": false,
   "spoor": "cultuur",
   "fit": 3,
   "toelichting": "Enige podiumtechniekopleiding in het hoger onderwijs in Vlaanderen; geen artistieke toelatingsproef (te bevestigen).",
   "url": "https://www.ritcs.be/",
   "status": "kandidaat"
  },
  {
   "id": "iws",
   "naam": "International Welding Specialist (IWS) en NDT niveau 1 en 2",
   "instelling": "Belgisch Instituut voor Lastechniek (Zwijnaarde, Brussel), Kiwa Vinçotte Academy",
   "duur": "IWS 6 tot 12 maanden deeltijds; NDT 1 tot 2 weken per methode",
   "formaat": "Deeltijds",
   "kost": "Te verifiëren; sectorfonds mtech+ of VDAB kan meefinancieren",
   "financiering": "VDAB, mtech+",
   "knelpunt": "Lasser ja",
   "okot": false,
   "spoor": "reserve",
   "fit": 5,
   "toelichting": "Instapniveau voor een lasser met technisch secundair. Opent lasinspectie en kwaliteitscontrole: veel minder fysiek, goed betaald.",
   "url": "https://www.bil-ibs.be/",
   "status": "kandidaat"
  },
  {
   "id": "orthopedagogie",
   "naam": "Graduaat Orthopedagogische begeleiding",
   "instelling": "AP Hogeschool, Karel de Grote Hogeschool, Thomas More",
   "duur": "120 studiepunten, 2 jaar voltijds of 3 jaar werk- en avondtraject",
   "formaat": "Avond of werktraject, een derde werkplekleren",
   "kost": "Ongeveer €1.240 per jaar",
   "financiering": "OKOT vermoedelijk (opvoeder-begeleider is knelpunt)",
   "knelpunt": "Opvoeder-begeleider is knelpunt",
   "okot": true,
   "spoor": "sociaal",
   "fit": 4,
   "toelichting": "Van klasse 2 naar klasse 1 in de zorg- en jeugdsector; opent atelierbegeleider en NAFT-begeleider.",
   "url": "https://www.ap.be/",
   "status": "kandidaat"
  },
  {
   "id": "informatiebeheer",
   "naam": "Graduaat Informatiebeheer: bibliotheek en archief",
   "instelling": "Arteveldehogeschool Gent (minstens 2 jaar, ook eenjarige versie) en Erasmushogeschool Brussel (les dinsdag tot donderdag, namiddag en avond). Niet in Antwerpen.",
   "duur": "120 studiepunten, 2 jaar",
   "formaat": "Namiddag en avond (EhB) of dag (Artevelde); avondlessen tellen niet voor de vrijstelling",
   "kost": "Ongeveer €1.240 per jaar",
   "financiering": "Vermoedelijk niet OKOT",
   "knelpunt": "Niet",
   "okot": false,
   "spoor": "geschiedenis",
   "fit": 3,
   "toelichting": "Opent archief- en depotwerk op niveau B (FelixArchief, ADVN, Letterenhuis, Rijksarchief). Combineerbaar met werk dankzij de namiddag- en avondlessen.",
   "url": "https://www.arteveldehogeschool.be/nl/opleidingen/graduaat/informatiebeheer-bibliotheek-en-archief",
   "status": "verkennen"
  },
  {
   "id": "archeologie-bachelor",
   "naam": "Bachelor Archeologie",
   "instelling": "UGent, KU Leuven, VUB",
   "duur": "3 jaar",
   "formaat": "Dag",
   "kost": "Ongeveer €1.240 per jaar",
   "financiering": "VDAB-vrijstelling voor voltijdse studies (wachttijd te bevestigen)",
   "knelpunt": "Niet",
   "okot": false,
   "spoor": "geschiedenis",
   "fit": 3,
   "toelichting": "Open met diploma secundair. Veldtechnicus kan ook zonder diploma. Onderzoek 9 loopt.",
   "url": "https://www.onderwijskiezer.be/",
   "status": "verkennen"
  },
  {
   "id": "syntra-erfgoed",
   "naam": "SYNTRA avondopleidingen: meubelrestaurateur, siersmid en kunstsmid, decorbouwer",
   "instelling": "SYNTRA AB en andere campussen (aanbod te verifiëren)",
   "duur": "1 tot 2 jaar, 1 tot 2 avonden per week",
   "formaat": "Avond",
   "kost": "€500 tot €3.500 per jaar",
   "financiering": "Opleidingscheques als werknemer; VDAB-opleidingscontract als werkzoekende",
   "knelpunt": "",
   "okot": false,
   "spoor": "erfgoed",
   "fit": 3,
   "toelichting": "Nuttige aanvulling, zwak als enige kwalificatie.",
   "url": "https://www.syntra-ab.be/",
   "status": "verkennen"
  },
  {
   "id": "vdab-cad",
   "naam": "VDAB-opleidingen: Tekenaar CAD/BIM, SolidWorks, Tekla, CNC, fietshersteller",
   "instelling": "VDAB competentiecentra Antwerpen",
   "duur": "3 tot 12 maanden",
   "formaat": "Dag, gratis",
   "kost": "Gratis met behoud van uitkering",
   "financiering": "VDAB, gratis. Bevestigd: een voltijdse VDAB-beroepsopleiding van minstens 3 maanden verlengt het uitkeringsrecht met maximaal 12 maanden (tot uiterlijk 30 juni 2030).",
   "knelpunt": "Ja",
   "okot": false,
   "spoor": "reserve",
   "fit": 5,
   "toelichting": "Snelle, gefinancierde route naar minder fysiek werk, en de enige soort opleiding die de uitkering verlengt. Vereist inschrijving als werkzoekende.",
   "url": "https://www.vdab.be/vindeenopleiding",
   "status": "kandidaat"
  }
 ],
 "profiel": {
  "naam": "Remi",
  "leeftijd": null,
  "woonplaats": "Antwerpen",
  "situatie": "Woont alleen in Antwerpen. Heeft een inkomen nodig.",
  "beroep": "Technisch tekenaar en verantwoordelijke atelier bij een metaalbewerkingsbedrijf (maatwerk in plaatmateriaal), sinds 2021; gestart als tekenaar en plooi- en lasoperator",
  "vaardigheden": [
   "Technisch tekenen van maatwerk in plaatmateriaal en werkvoorbereiding",
   "Atelier aansturen: planning, kwaliteit, collega's",
   "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
   "Meubels ontwerpen en bouwen samen met zijn broer",
   "Fietsen bouwen en herstellen (creatief fietsatelier, 2019)",
   "Een fotoarchief opbouwen en digitaliseren (2017 tot 2018)",
   "Ruimtelijk en structureel denken, sterk in wiskunde"
  ],
  "studies": "Avondonderwijs aan de Academie in Antwerpen: drie jaar meubel en interieur, een jaar grafiek, nu interieurvormgeving (precieze opleiding en instelling te bevestigen)",
  "talen": [
   {
    "taal": "Nederlands",
    "niveau": "moedertaal"
   },
   {
    "taal": "Engels",
    "niveau": "functioneel"
   }
  ],
  "vakbond": "ACV (Algemeen Christelijk Vakverbond), sector metaal: ACV-CSC METEA",
  "randvoorwaarden": [
   "Wil kunnen blijven studeren naast het werk",
   "Zoekt werk dat tegelijk moeilijk is en er echt toe doet",
   "Werkt het best in kleine, vertrouwde teams binnen een stabiele organisatie",
   "Het huidige werk is fysiek te zwaar om op lange termijn vol te houden",
   "Heeft na 31 december 2026 een of twee maanden herstel nodig voor een goede start"
  ],
  "tests": {
   "mbti": {
    "type": "INFJ",
    "toelichting": "Ziet patronen en richting voordat anderen ze zien (Ni), leest de emotionele temperatuur van een groep (Fe), zoekt logische samenhang (Ti), waardeert materiaal en ambacht (Se)."
   },
   "loopbaanankers": [
    {
     "anker": "Zuivere uitdaging",
     "score": 83,
     "niveau": "zeer hoog",
     "rol": "dominant"
    },
    {
     "anker": "Dienstbaarheid en toewijding aan een zaak",
     "score": 80,
     "niveau": "zeer hoog",
     "rol": "dominant"
    },
    {
     "anker": "Levensstijl",
     "score": 70,
     "niveau": "hoog",
     "rol": "ondersteunend"
    },
    {
     "anker": "Technische en functionele competentie",
     "score": 66,
     "niveau": "hoog",
     "rol": "ondersteunend"
    },
    {
     "anker": "Zekerheid en stabiliteit",
     "score": 63,
     "niveau": "hoog",
     "rol": "ondersteunend"
    },
    {
     "anker": "Ondernemende creativiteit",
     "score": 60,
     "niveau": "hoog",
     "rol": "ondersteunend"
    },
    {
     "anker": "Algemeen management",
     "score": 43,
     "niveau": "gemiddeld",
     "rol": "geen trekkracht"
    },
    {
     "anker": "Autonomie en onafhankelijkheid",
     "score": 40,
     "niveau": "gemiddeld",
     "rol": "geen trekkracht"
    }
   ],
   "bigfive": [
    {
     "domein": "Neuroticisme",
     "niveau": "laag",
     "toelichting": "Uitzonderlijk kalm en onverstoorbaar. Enige nuance: Onmatigheid 14 (hoog)."
    },
    {
     "domein": "Extraversie",
     "niveau": "laag",
     "toelichting": "Gereserveerd en rustig. Assertiviteit 7 en Spanningsbehoefte 7 zijn zeer laag."
    },
    {
     "domein": "Openheid",
     "niveau": "hoog",
     "toelichting": "Verbeelding 16, Artistieke interesse 19, Intellect 18."
    },
    {
     "domein": "Vriendelijkheid",
     "niveau": "hoog",
     "toelichting": "Vertrouwen 18, Moraliteit 18, Samenwerking 17, Altruïsme 16."
    },
    {
     "domein": "Zorgvuldigheid",
     "niveau": "hoog",
     "toelichting": "Plichtsbesef 20 en Behoedzaamheid 20 zijn maximaal. Ordelijkheid 9 is laag."
    }
   ],
   "holland": {
    "code": "ISA",
    "scores": [
     {
      "type": "Onderzoekend (Investigative)",
      "score": 23
     },
     {
      "type": "Sociaal (Social)",
      "score": 19
     },
     {
      "type": "Artistiek (Artistic)",
      "score": 17
     },
     {
      "type": "Realistisch (Realistic)",
      "score": 13
     },
     {
      "type": "Conventioneel (Conventional)",
      "score": 10
     },
     {
      "type": "Ondernemend (Enterprising)",
      "score": 7
     }
    ],
    "max": 32
   }
  },
  "synthese": "Remi bloeit op bij echt moeilijke problemen die ondubbelzinnig van belang zijn voor echte mensen, aangepakt via diep vakmanschap, vanuit een stabiele en gestructureerde omgeving die ruimte laat voor een volwaardig persoonlijk leven, met op lange termijn de mogelijkheid om iets eigen en zinvol op te bouwen. Hij werkt het best in kleine vertrouwde teams, met betekenis als kompas en intuïtie als motor.",
  "herzieningen": [
   {
    "onderwerp": "Brandweer",
    "status": "definitief niet",
    "toelichting": "Op basis van de loopbaanankers leek brandweer een sterke match. De Big Five (zeer lage assertiviteit en spanningsbehoefte, maximale behoedzaamheid) en de Holland-code (onderzoekend, niet situationeel) wijzen ervan weg. Beslissing september 2026: deze piste is gesloten."
   },
   {
    "onderwerp": "Zelfstandig ontwerper-maker",
    "status": "geparkeerd, tien tot vijftien jaar",
    "toelichting": "Vijf onafhankelijke signalen wijzen weg van het solo-ondernemerschap als volgende stap: Ondernemend 7, Assertiviteit 7, Autonomie 40 procent, Zekerheid 63 procent en de INFJ-afkeer van zelfpromotie."
   },
   {
    "onderwerp": "Onderwijs",
    "status": "nu al, deeltijds",
    "toelichting": "Sociaal 19, Altruïsme 16, Plichtsbesef 20 en het dienstbaarheidsanker van 80 procent maken lesgeven een piste om nu al deeltijds te testen, niet pas op 35 of 40."
   },
   {
    "onderwerp": "Erfgoed en restauratie",
    "status": "hoofdspoor",
    "toelichting": "Past op alle vier de lenzen: onderzoekend, dienstbaar aan cultureel erfgoed, esthetisch, behoedzaam en plichtsbewust, en institutioneel stabiel. Sinds september 2026 het eerste spoor."
   },
   {
    "onderwerp": "Culturele instellingen",
    "status": "hoofdspoor",
    "toelichting": "Museumateliers, theaterwerkplaatsen en tentoonstellingsbouw combineren onderzoekend, artistiek, sociaal en realistisch werk met betekenis en stabiliteit."
   }
  ],
  "loopbaan": [
   {
    "periode": "tot 2017",
    "wat": "Secundair onderwijs Wetenschappen-Wiskunde, Sint-Lutgardis (Merksem of Antwerpen, te bevestigen)"
   },
   {
    "periode": "2017 tot 2018",
    "wat": "Katoen Natie, Antwerpen, ongeveer een jaar (functie te bevestigen)"
   },
   {
    "periode": "2017 tot 2018",
    "wat": "Fotoarchief opgebouwd voor Willy Van de Perre"
   },
   {
    "periode": "2019",
    "wat": "Creatief fietsatelier"
   },
   {
    "periode": "[jaren]",
    "wat": "Academie, avondonderwijs: drie jaar meubel en interieur, een jaar grafiek"
   },
   {
    "periode": "rond 2020",
    "wat": "Lasopleiding halfautomaat en elektroden"
   },
   {
    "periode": "2021 tot heden",
    "wat": "Technisch tekenaar en plooi- en lasoperator, nu verantwoordelijke atelier, bij een bedrijf in maatwerk plaatmateriaal"
   }
  ],
  "tebevestigen": [
   "Leeftijd: de eerdere notities zeggen 20, maar een diploma secundair in 2017 wijst op ongeveer 27. Geboortejaar nodig.",
   "Statuut op de loonfiche: arbeider of bediende. Een tekenaar en atelierverantwoordelijke is vaak bediende (PC 200 of 209); dan gelden andere regels voor gewaarborgd loon, vakantiegeld en eindejaarspremie dan de arbeidersregels op de pagina Rechten.",
   "Lasprocessen: halfautomaat (MIG/MAG) en elektrode zijn zeker; TIG te bevestigen.",
   "Naam van het huidige bedrijf, startdatum van het contract en het CAD-programma.",
   "Welke opleiding interieurvormgeving precies (hogeschool of academie, deeltijds kunstonderwijs)."
  ]
 },
 "programma": {
  "einddatum_contract": "2026-12-31",
  "fasen": [
   {
    "id": "f1",
    "naam": "Fase 1: Beschermen en beslissen",
    "periode": "28 september tot 31 oktober 2026",
    "doel": "Rechten veiligstellen, gezondheid documenteren, uitstapscenario kiezen.",
    "acties": [
     "ACV-afspraak en huisarts",
     "Startdatum en opzegtermijn vaststellen",
     "Gesprek met de werkgever met ACV",
     "Beslissing scenario A, B of C",
     "Master-cv, portfolio en VDAB-profiel klaar",
     "Hotlist prioriteren, jobalerts instellen"
    ]
   },
   {
    "id": "f2",
    "naam": "Fase 2: Zaaien",
    "periode": "1 november tot 31 december 2026",
    "doel": "Spontane sollicitaties en contacten leggen terwijl er nog loon is, zonder te forceren.",
    "acties": [
     "Zes tot tien spontane sollicitaties naar prioriteit 1 (erfgoed, musea, decorateliers)",
     "Twee netwerkmomenten (Dag van de Ambachten, Open restauratieatelier)",
     "VDAB-loopbaangesprek en schriftelijke antwoorden over vrijstelling en OKOT",
     "Sollicitatieverlof gebruiken voor bezoeken",
     "C4 en einde contract correct afhandelen"
    ]
   },
   {
    "id": "f3",
    "naam": "Fase 3: Herstellen",
    "periode": "1 januari tot 28 februari 2027",
    "doel": "Rust met inkomen (opzegvergoeding, uitkering of ziekte-uitkering). Eén trajectdag per week.",
    "acties": [
     "Inschrijving VDAB binnen 8 dagen",
     "Uitkeringsdossier via ACV",
     "Opvolging van verstuurde sollicitaties op de trajectdag",
     "Eventueel korte certificaten (VCA, IPAF)",
     "Infomomenten opleidingen noteren"
    ]
   },
   {
    "id": "f4",
    "naam": "Fase 4: Proeven",
    "periode": "1 maart tot 30 juni 2027",
    "doel": "Van binnen kijken via beroepsverkennende stage, IBO of vrijwilligerswerk, en het opleidingstraject kiezen.",
    "acties": [
     "Beroepsverkennende stage bij een museumatelier, decoratelier of restauratiebedrijf",
     "Gerichte sollicitaties op vacatures",
     "Erfgoeddag 18 april en Antwerp Art Weekend 6 tot 9 mei",
     "FARO basiscursus",
     "Beslissing opleiding uiterlijk 30 juni"
    ]
   },
   {
    "id": "f5",
    "naam": "Fase 5: Starten",
    "periode": "vanaf september 2027",
    "doel": "Eerste contract in de nieuwe richting, of start van de opleiding met behoud van inkomen.",
    "acties": [
     "Contract als technisch medewerker, decorbouwer of restauratiemedewerker, of OKOT-opleiding",
     "Avondstudie verder",
     "Conservatie-Restauratie opnieuw bekijken zodra de inkomensbasis er is"
    ]
   }
  ],
  "ritme": "Eén trajectdag per week. Per spoor één actie per drie tot vier weken. Nooit meer dan twee sollicitaties tegelijk in voorbereiding.",
  "sporen": [
   {
    "id": "erfgoed",
    "naam": "Erfgoed en restauratie",
    "kleur": "orange",
    "status": "hoofdspoor",
    "toelichting": "Metaalrestauratie, monumentenzorg, restauratieaannemers, depotwerk. Past op alle vier de lenzen."
   },
   {
    "id": "cultuur",
    "naam": "Culturele instellingen",
    "kleur": "violet",
    "status": "hoofdspoor",
    "toelichting": "Museumateliers, decorateliers, tentoonstellingsbouw, podiumtechniek, collectiezorg."
   },
   {
    "id": "onderwijs",
    "naam": "Deeltijds lesgeven",
    "kleur": "green",
    "status": "nu al testen",
    "toelichting": "SYNTRA, CVO, VDAB-instructeur. Twee avonden per week naast een dagjob."
   },
   {
    "id": "sociaal",
    "naam": "Sociaal en ecologisch",
    "kleur": "red",
    "status": "verkennen",
    "toelichting": "Jongerenwerk met ateliers, sociale economie, circulaire en ecologische organisaties, archieven en archeologie."
   },
   {
    "id": "reserve",
    "naam": "Reserve",
    "kleur": "grey",
    "status": "reserve",
    "toelichting": "Lasinspectie, universiteitswerkplaatsen, tekenwerk, orthopedie, fietsbouw. Vangnet met inkomen en minder fysieke belasting."
   }
  ]
 },
 "rechten": {
  "peildatum": "2026-09-27",
  "disclaimer": "Dit is informatie, geen juridisch advies. De bronpagina's konden in deze omgeving niet volledig geladen worden; alles komt uit zoekresultaten van RVA, FOD Werkgelegenheid, VDAB, ACV en sociale secretariaten, gekruist waar mogelijk. Wat als 'te verifiëren' staat, laat je ACV-CSC METEA bevestigen voor je erop handelt.",
  "kern": [
   "Teken niets. Een beëindiging in onderling akkoord is voor de RVA hetzelfde als zelf opzeggen: 4 tot 52 weken geen uitkering, en je geeft ook de opzegvergoeding op die de werkgever anders verschuldigd is.",
   "Als de werkgever wil dat je vertrekt, moet de werkgever opzeggen (18 weken bij 5 jaar anciënniteit) of het equivalent betalen. Dat is hun kost, niet de jouwe.",
   "Het beste scenario voor herstel met inkomen: ontslag door de werkgever met opzegtermijn en vrijstelling van prestaties. Loon tot het einde, daarna volledige uitkering.",
   "Het nieuwe vangnet van 1 maart 2026 (zes maanden uitkering na eigen ontslag) vraagt 3.120 arbeidsdagen, ongeveer tien jaar. Met vijf jaar kom je er niet voor in aanmerking.",
   "Zelf opzeggen zonder sanctie kan alleen als er meteen een nieuwe job van minstens 13 weken volgt en je voor de tussenperiode geen uitkering vraagt.",
   "Medisch gedocumenteerde ongeschiktheid voor het beroep is de enige 'wettige reden' die de RVA aanvaardt. Moe zijn is dat niet. Daarom de huisarts."
  ],
  "scenarios": [
   {
    "id": "A",
    "naam": "Ontslag door de werkgever",
    "kleur": "green",
    "oordeel": "Beste scenario",
    "punten": [
     "Opzegtermijn 18 weken (5 tot 6 jaar anciënniteit) of 15 weken (4 tot 5 jaar), of verbrekingsvergoeding voor het niet-gepresteerde deel.",
     "Vraag schriftelijk vrijstelling van prestaties: je komt niet meer werken en behoudt je loon. Schrijf je dan binnen een maand in bij VDAB.",
     "Sollicitatieverlof: een volledige dag per week, betaald.",
     "Geen RVA-sanctie. Uitkering 65 procent van het begrensde loon de eerste drie maanden, 60 procent tot maand 6, daarna degressief, maximaal 24 maanden.",
     "Ziekte tijdens deze opzeg schorst de opzegtermijn.",
     "Je mag binnen twee maanden na het einde de ontslagredenen opvragen (cao 109)."
    ]
   },
   {
    "id": "B",
    "naam": "Ziekteverlof en medisch spoor",
    "kleur": "violet",
    "oordeel": "Goed voor herstel, opent herscholing",
    "punten": [
     "Gewaarborgd loon door de werkgever: dag 1 tot 7: 100 procent; dag 8 tot 14: 85,88 procent; dag 15 tot 30: gedeeltelijk; daarna 60 procent van het begrensde loon via het ziekenfonds.",
     "De werkgever mag tijdens ziekte ontslaan met opzeg of vergoeding, maar niet omwille van de ziekte. De ziekte-uitkering loopt door na het einde van het contract.",
     "De eerste zes maanden wordt de ongeschiktheid beoordeeld tegenover je eigen job (lasser), daarna tegenover de hele arbeidsmarkt. Daarom moet het dossier de fysieke belasting van het laswerk documenteren, niet alleen vermoeidheid.",
     "Herscholing via het ziekenfonds (socioprofessionele re-integratie): opleiding betaald, premie per lesuur, uitkering behouden tijdens de opleiding en zes maanden erna. Aanvragen via de adviserend arts en de Terug Naar Werk-coördinator.",
     "Re-integratietraject bij de arbeidsarts kan je zelf aanvragen. Beslissing B (definitief ongeschikt voor het huidige werk) is het sterkste document.",
     "Medische overmacht kan pas na zes maanden onafgebroken ziekte en beëindigt het contract zonder vergoeding; alleen zinvol als je dat zelf wil."
    ]
   },
   {
    "id": "C",
    "naam": "Zelf opzeggen",
    "kleur": "red",
    "oordeel": "Alleen met nieuwe job klaar",
    "punten": [
     "Opzegtermijn 9 weken (5 tot 6 jaar) of 7 weken (4 tot 5 jaar). Aangetekende brief geldt op de derde werkdag; de termijn start de maandag erna.",
     "Zonder nieuwe job: RVA-uitsluiting van 4 tot 52 weken. Onvoorspelbaar.",
     "Met nieuwe job van minstens 13 weken: geen sanctie, als je in de tussentijd geen uitkering vraagt.",
     "Eindejaarspremie PC 111 kan wegvallen bij ontslagname (provinciale cao Antwerpen, te verifiëren bij ACV).",
     "Geen IBO mogelijk na zelf opzeggen.",
     "Ziekte tijdens je eigen opzeg schorst de termijn niet.",
     "Wie zonder opzeg wegblijft, betaalt zelf een verbrekingsvergoeding aan de werkgever."
    ]
   },
   {
    "id": "D",
    "naam": "Beëindiging in onderling akkoord",
    "kleur": "red",
    "oordeel": "Niet doen zonder vergoeding en RVA-garantie",
    "punten": [
     "Voor de RVA gelijk aan zelf opzeggen: 4 tot 52 weken uitsluiting.",
     "Je geeft de opzegvergoeding op, tenzij het document een vergoeding toekent.",
     "Achteraf bijna niet te herroepen (dwang, bedrog of dwaling bewijzen).",
     "Nooit ter plaatse tekenen. Kopie mee. ACV laten lezen. Alleen 'voor ontvangst', nooit 'voor akkoord'."
    ]
   }
  ],
  "opzegtabel": {
   "toelichting": "Eenheidsstatuut, contract gestart tussen 1 januari 2014 en 1 juni 2026. Rijen uit de wet; laat ACV de exacte anciënniteit bevestigen. Boven 8 jaar komt er bij opzeg door de werkgever telkens 3 weken per jaar bij; bij opzeg door de werknemer blijft het maximum 13 weken.",
   "rijen": [
    {
     "ancienniteit": "3 tot minder dan 4 jaar",
     "werkgever": 13,
     "werknemer": 6
    },
    {
     "ancienniteit": "4 tot minder dan 5 jaar",
     "werkgever": 15,
     "werknemer": 7
    },
    {
     "ancienniteit": "5 tot minder dan 6 jaar",
     "werkgever": 18,
     "werknemer": 9
    },
    {
     "ancienniteit": "6 tot minder dan 7 jaar",
     "werkgever": 21,
     "werknemer": 10
    },
    {
     "ancienniteit": "7 tot minder dan 8 jaar",
     "werkgever": 24,
     "werknemer": 12
    },
    {
     "ancienniteit": "8 tot minder dan 9 jaar",
     "werkgever": 27,
     "werknemer": 13
    }
   ]
  },
  "werkloosheid2026": [
   "Toelaatbaarheid: 312 arbeidsdagen in de laatste 36 maanden, ongeacht leeftijd. Remi voldoet ruim.",
   "Duur: 12 maanden plus 1 maand per 4 extra maanden loopbaan, maximum 24 maanden. Met vijf jaar werk zit je aan het maximum.",
   "Bedrag: 65 procent van het begrensde brutoloon in maand 1 tot 3, 60 procent in maand 4 tot 6, daarna degressief. Het hoogste loonplafond is €4.182 bruto per maand, dus maximaal ongeveer €2.718 bruto per maand in de eerste drie maanden (bron: vakblad, RVA-bedrag nakijken).",
   "Verlenging (bevestigd, RVA): voor een opleiding gestart na 1 januari 2026 verlengt alleen een voltijdse beroepsopleiding van minstens 3 maanden onder overeenkomst met VDAB het recht, met maximaal 12 maanden en niet later dan 30 juni 2030. Gewone studies (graduaat, bachelor) verlengen de duur niet.",
   "Gevolg: een studie van twee of drie jaar moet binnen de 24 maanden passen of gecombineerd worden met werk. Start een lange opleiding dus vroeg, of kies eerst een VDAB-beroepsopleiding die het recht verlengt.",
   "Inschrijven bij VDAB binnen 8 dagen na het einde van de opzegtermijn. Uitbetalingsinstelling: ACV.",
   "Vrijstelling voor studies: minstens 20 uur per week overdag, minstens 27 nieuwe studiepunten, passend in je traject naar werk. Een avondopleiding geeft geen vrijstelling maar mag wel, met melding aan VDAB."
  ],
  "acv": [
   "ACV-CSC METEA is de centrale voor metaal en metaalbouw.",
   "Gratis juridische bijstand tot en met de arbeidsrechtbank na zes maanden aaneengesloten lidmaatschap op het moment van de feiten.",
   "ACV is uitbetalingsinstelling: doet het volledige werkloosheidsdossier, controleert de C4, staat bij op een RVA-verhoor.",
   "Syndicale premie tot ongeveer €145 per jaar. Dienstencentra in Antwerpen, afspraak via hetacv.be."
  ],
  "vdabsteun": [
   "Beroepsverkennende stage: maximaal 30 dagen bij een werkgever met behoud van uitkering. Ideaal om een museumatelier of restauratiebedrijf van binnen te zien.",
   "IBO: 4 tot 26 weken opleiding op de werkvloer met aanwervingsengagement. Niet mogelijk na zelf opzeggen.",
   "Werkervaringsstage: tot 6 maanden met een premie van €200 per maand plus vervoer.",
   "OKOT: graduaat of bachelor voor een knelpuntberoep met behoud van uitkering en betaald inschrijvingsgeld. Bevestigd voor het graduaat bouwkundig tekenen; het educatief graduaat secundair onderwijs wordt als OKOT aangeboden (onder meer Erasmushogeschool). Wie na 2025 start, valt wel onder de beperking van 24 maanden.",
   "Knelpuntopleidingen zijn gratis met terugbetaling van vervoer.",
   "Loopbaancheque: sinds 1 oktober 2025 (tijdelijke regeling tot eind 2026) één cheque van vier uur voor €90, alleen als je er nog nooit een gebruikte en met minstens zeven jaar werkervaring. Bij jou is dat nipt; VDAB toont het bij de aanvraag, die je doet zolang je nog werkt. Lukt het niet, dan krijg je als werkzoekende gratis loopbaanoriëntatie bij VDAB."
  ],
  "vakantiegeld": "Vakantiegeld van arbeiders wordt door de vakantiekas betaald tussen 2 mei en 30 juni 2027, wie ook het contract beëindigt: 15,38 procent van 108 procent van het brutoloon van 2026. Eindejaarspremie PC 111: pro rata, regels per provincie, mogelijk niet bij ontslagname; te verifiëren bij ACV METEA.",
  "teverifieren": [
   "Statuut: arbeider of bediende (zie loonfiche). De pagina gaat uit van arbeider (PC 111). Als bediende: gewaarborgd loon een volledige maand aan 100 procent, vakantiegeld en vertrekvakantiegeld door de werkgever, eindejaarspremie volgens PC 200 of 209. De opzegtermijnen zijn dezelfde.",
   "Exacte anciënniteit en dus de rij in de opzegtabel (startdatum, leerovereenkomst).",
   "Eindejaarspremie PC 111 provincie Antwerpen bij ontslagname versus ontslag.",
   "OKOT: of het educatief graduaat ook in Antwerpen (AP, KdG) als OKOT loopt, en of een OKOT meetelt als beroepsopleiding voor de verlenging met 12 maanden.",
   "Premies herscholing via het ziekenfonds in 2026.",
   "Of sollicitatieverlof ook geldt bij opzeg door de werknemer.",
   "Verwittiging: werd ze tijdig meegedeeld (reeks of afzonderlijke feiten) en staat de sanctie in het arbeidsreglement? Is een schriftelijk antwoord nu aangewezen? Welk statuut en paritair comité geldt (eindejaarspremie bij ontslag om dringende reden)?"
  ],
  "verwittiging": {
   "wat": "Een verwittiging is een tuchtsanctie: de werkgever legt schriftelijk vast dat je te laat kwam en vraagt dat het niet meer gebeurt. Het is nog geen ontslag. Als de brief een ontslag om dringende reden vermeldt, betekent dat: bij herhaling overweegt de werkgever je te ontslaan zonder opzegtermijn.",
   "risico": [
    "Ontslag om dringende reden betekent: geen opzegtermijn en geen opzegvergoeding. De werkgever moet het ontslag geven binnen 3 werkdagen nadat hij de feiten voldoende kent, en de reden binnen 3 werkdagen daarna aangetekend meedelen.",
    "Herhaald te laat komen na een schriftelijke verwittiging wordt door rechtbanken soms aanvaard als dringende reden. Een eerste verwittiging is een stap in een dossier: de volgende keer telt zwaarder.",
    "Na zo'n ontslag kan de RVA oordelen dat je werkloos bent door eigen schuld. Gevolg: een verwittiging, of 4 tot 26 weken geen uitkering, eventueel (deels) met uitstel. De RVA beslist zelf, los van wat de werkgever op de C4 zet, en hoort je altijd eerst. ACV kan je bijstaan en je kan de beslissing aanvechten bij de arbeidsrechtbank.",
    "Ook een gewoon ontslag met opzegtermijn kan bij de RVA tot een sanctie leiden als de werkgever op de C4 'herhaald te laat komen' als reden zet. De reden op de C4 wordt dus belangrijk: bespreek met ACV hoe je dat voorkomt.",
    "Een dossier rond te laat komen kan ook gebruikt worden om druk te zetten om toch een onderling akkoord te tekenen. Teken niets zonder ACV."
   ],
   "regels": [
    "Een tuchtsanctie zoals een verwittiging moet in het arbeidsreglement staan en op straffe van nietigheid ten laatste de eerste werkdag na de vaststelling van de tekortkoming meegedeeld worden. De dag van de vaststelling is niet altijd de dag van de feiten, maar bij te laat komen ziet de werkgever het meestal meteen. Laat ACV de tijdigheid beoordelen.",
    "Het arbeidsreglement moet een beroepsmogelijkheid tegen sancties voorzien, en de werkgever moet elke sanctie in een register van sancties inschrijven.",
    "Een verwittiging die ook een ingebrekestelling is, legt vast dat je gewaarschuwd bent. Ze bewijst niet dat elke datum klopt: vergelijk de data met je eigen gegevens.",
    "Een sanctie die niet geldig is, verdwijnt niet uit het dossier: de brief blijft bewijzen dat je op de hoogte was. Bij een later ontslag om dringende reden mag de werkgever oudere feiten alleen gebruiken om een nieuw feit te verduidelijken; het nieuwe feit moet op zich ernstig zijn en binnen 3 werkdagen gevolgd worden door het ontslag.",
    "Je mag een sanctie betwisten, intern of voor de arbeidsrechtbank. Een kort, feitelijk schriftelijk antwoord zorgt dat jouw kant ook in het dossier zit.",
    "Ziekte is geen fout. Ben je arbeidsongeschikt en heb je een attest van de dokter, dan ben je gewettigd afwezig. Meld het meteen en bezorg het attest binnen de termijn van het arbeidsreglement (vaak 2 werkdagen).",
    "Er bestaat geen wettelijke regel van drie verwittigingen voor een ontslag. Een gewoon ontslag met opzeg kan zonder enige verwittiging, en voor een dringende reden kan één ernstig feit volstaan. Alleen als het arbeidsreglement of een cao zelf stappen voorschrijft, moet de werkgever die volgen: kijk dat na in het arbeidsreglement."
   ],
   "doen": [
    "Teken de brief hoogstens 'voor ontvangst' met de datum, nooit 'akkoord'.",
    "Maak een foto of scan van de brief en bewaar het origineel met de envelop.",
    "Bewaar de envelop, het ontvangstbewijs en het zendingsnummer van een aangetekende brief. De poststempel en de track and trace van bpost tonen wanneer de brief echt vertrok; dat kan verschillen van de datum op de brief. Schrijf ook op wanneer je te laat kwam en wanneer en hoe je ingelicht werd. Kwam de verwittiging later dan de eerste werkdag na de laatste keer, dan kan ze nietig zijn. Laat ACV dat beoordelen.",
    "Ga na welke afspraken er waren over de werkuren, bijvoorbeeld na een verlofperiode. Schrijf op wat werd afgesproken, wanneer en met wie.",
    "Kijk op de loonfiches na of de gemiste uren werden ingehouden. Niet gewerkte uren mogen ingehouden worden; een boete moet in het arbeidsreglement staan.",
    "Bel ACV deze week. Wacht hiervoor niet tot de afspraak van 16 oktober.",
    "Vraag een spontane raadpleging bij de arbeidsarts van de externe preventiedienst als je denkt dat de vermoeidheid met het werk te maken heeft. Dat is je recht; de werkgever kan het niet weigeren.",
    "Antwoord pas schriftelijk na overleg met ACV. Er staat een ontwerp klaar bij Communicatie, Brieven.",
    "Kom vanaf nu op tijd. Lukt het niet, verwittig dan vóór het beginuur per sms of mail, zodat er een spoor is (ontwerp bij Communicatie, Sms).",
    "Lukt werken niet meer door de vermoeidheid, ga dan vroeger naar de dokter dan 16 oktober. Met een attest ben je gewettigd afwezig.",
    "Noteer elk te laat komen en elk gesprek erover in het logboek bij Communicatie: datum, hoeveel minuten, reden, met wie."
   ],
   "bronnen": "Wet van 3 juli 1978, art. 35 (dringende reden); wet van 8 april 1965 op de arbeidsreglementen (sancties, boete hoogstens een vijfde van het dagloon); KB 25 november 1991, art. 51 en volgende (werkloos door eigen schuld); sectorale cao's eindejaarspremie PC 111. RVA, Securex Lex4You, Tilleman Van Hoogenbemt, GD&A Advocaten en Arbeidsrechtjournaal, geraadpleegd op 4 oktober 2026.",
   "ergste": [
    {
     "wat": "Nieuwe tuchtsanctie",
     "gevolg": "Alleen wat in het arbeidsreglement staat, bijvoorbeeld een boete van hoogstens een vijfde van het dagloon of een korte schorsing zonder loon. Telkens ten laatste de eerste werkdag na de vaststelling meegedeeld."
    },
    {
     "wat": "Ontslag met opzegtermijn",
     "gevolg": "De opzegtermijn of opzegvergoeding blijft verschuldigd. Zet de werkgever 'herhaald te laat komen' op de C4, dan kan de RVA toch een sanctie geven (zie onder)."
    },
    {
     "wat": "Ontslag om dringende reden, het ergste geval",
     "gevolg": "Geen opzegtermijn en geen opzegvergoeding. In PC 111 (arbeiders) ook geen eindejaarspremie. Het vakantiegeld blijft. Met ACV kan je het ontslag aanvechten bij de arbeidsrechtbank; is de dringende reden niet bewezen, dan volgt alsnog een opzegvergoeding."
    },
    {
     "wat": "RVA: werkloos door eigen schuld",
     "gevolg": "Een verwittiging, of 4 tot 26 weken geen uitkering. De RVA kan de sanctie geheel of gedeeltelijk met uitstel geven en houdt rekening met de omstandigheden. Je wordt altijd eerst gehoord. Na de sanctie start de uitkering gewoon."
    },
    {
     "wat": "RVA bij herhaling",
     "gevolg": "Binnen het jaar opnieuw: 8 tot 52 weken. Een tweede herhaling binnen twee jaar: definitieve uitsluiting. Ter vergelijking: zelf ontslag nemen zonder geldige reden kost 4 tot 52 weken."
    },
    {
     "wat": "Ziek tijdens een sanctie",
     "gevolg": "De sanctie wordt geschorst en verlengd met de ziekteperiode. Het ziekenfonds betaalt een ziekte-uitkering als je in orde bent met de ziekteverzekering."
    },
    {
     "wat": "Zonder inkomen",
     "gevolg": "Tijdens een sanctie kan je bij het OCMW een leefloon aanvragen. Het OCMW kijkt naar je middelen en die van wie bij je woont."
    }
   ]
  },
  "gezondheid": {
   "intro": "Wat er kan als het werk te zwaar wordt voor je gezondheid. Algemene regels, stand 2026; laat ACV ze toepassen op jouw situatie.",
   "punten": [
    {
     "titel": "Spontane raadpleging bij de arbeidsarts",
     "tekst": "Elke werknemer kan zelf een raadpleging vragen bij de arbeidsarts van de externe preventiedienst als hij gezondheidsklachten heeft die met het werk te maken kunnen hebben. Het bezoek volgt binnen 10 werkdagen. Het kan vertrouwelijk, zonder dat de werkgever het weet. Zo staan de klachten en het verband met het werk op papier."
    },
    {
     "titel": "Evaluatie van je werkpost (nieuw sinds 2026)",
     "tekst": "Wie een risico loopt om arbeidsongeschikt te worden, kan de werkgever vragen om de werkpost te laten evalueren, met het oog op aanpassingen of ander werk. Dat verloopt via de werkgever en de arbeidsarts en is dus niet vertrouwelijk. Bespreek eerst met ACV of dit in jouw situatie helpt."
    },
    {
     "titel": "Ziekteverlof",
     "tekst": "Stelt de dokter vast dat je arbeidsongeschikt bent, dan ben je gewettigd afwezig. Eerst betaalt de werkgever gewaarborgd loon, daarna het ziekenfonds. Na acht weken moet de werkgever je arbeidspotentieel laten inschatten door de arbeidsarts."
    },
    {
     "titel": "Medische overmacht",
     "tekst": "Na minstens zes maanden ononderbroken arbeidsongeschiktheid (sinds 2026, voordien negen) kan de werkgever of de werknemer de procedure medische overmacht starten. Stelt de arbeidsarts vast dat je definitief ongeschikt bent voor je job en is er geen aangepast werk, dan eindigt het contract zonder opzeg en zonder opzegvergoeding. De werkgever stort dan 1.800 euro aan het Terug Naar Werk-fonds. Het is geen 'eigen schuld' voor de RVA. Het is wel een trage weg."
    },
    {
     "titel": "Zelf vertrekken om medische redenen",
     "tekst": "Zelf ontslag nemen leidt normaal tot een RVA-sanctie. Er is geen sanctie als je een wettige reden had, zoals een ernstige medische reden die de arts van de RVA erkent, of werk dat niet meer passend is voor je gezondheid. De RVA laat je dan onderzoeken. Dit is onzeker: doe het nooit zonder ACV."
    },
    {
     "titel": "Opleiding tijdens ziekte",
     "tekst": "Ben je arbeidsongeschikt, dan kan je met toestemming van de adviserend arts van het ziekenfonds een opleiding volgen. Vraag het minstens een werkdag voor de start aan. Het ziekenfonds heeft een Terug Naar Werk-coördinator die je daarbij helpt."
    },
    {
     "titel": "Bescherming tegen discriminatie",
     "tekst": "Ontslag wegens je huidige, vroegere of toekomstige gezondheidstoestand is verboden discriminatie. De werkgever riskeert dan een forfaitaire vergoeding van zes maanden loon. Is je gezondheidsprobleem een handicap in de zin van de wet, dan moet de werkgever redelijke aanpassingen overwegen. Dit is een beschermingsmiddel, geen reden om een conflict te zoeken."
    }
   ],
   "bronnen": "Codex welzijn op het werk en KB re-integratie (wijzigingen vanaf 1 januari 2026); art. 34 Arbeidsovereenkomstenwet (medische overmacht); antidiscriminatiewet van 10 mei 2007; RVA. Geraadpleegd via Liantis, Securex, SD Worx, Cesi, Beswic, Attentia, Jubel en werk.belgie.be op 5 oktober 2026."
  }
 },
 "sollicitaties": [
  {
   "id": "sol-kmska",
   "organisatie": "KMSKA, Koninklijk Museum voor Schone Kunsten Antwerpen",
   "functie": "Technisch medewerker tentoonstellingsproductie en museumtechnieken",
   "spoor": "cultuur",
   "type": "spontaan",
   "bronUrl": "https://kmska.be/nl/jobs",
   "contactpersoon": "",
   "contactEmail": "sollicitaties@kmska.be",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "kmska",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "kmska-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-mhka",
   "organisatie": "M HKA, Museum van Hedendaagse Kunst Antwerpen",
   "functie": "Technisch medewerker productie",
   "spoor": "cultuur",
   "type": "spontaan",
   "bronUrl": "https://muhka.careersite.be/nl",
   "contactpersoon": "Katrien Geets (HR)",
   "contactEmail": "katrien.geets@muhka.be",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "mhka",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "mhka-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-middelheim",
   "organisatie": "Middelheimmuseum",
   "functie": "Technisch assistent (niveau C), onderhoud van de sculpturen",
   "spoor": "cultuur",
   "type": "spontaan",
   "bronUrl": "https://job.antwerpen.be/",
   "contactpersoon": "",
   "contactEmail": "middelheimmuseum@antwerpen.be",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "middelheim",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "middelheim-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-monumentenwacht-antwerpen",
   "organisatie": "Monumentenwacht Antwerpen",
   "functie": "Monumentenwachter",
   "spoor": "erfgoed",
   "type": "spontaan",
   "bronUrl": "https://jobs.provincieantwerpen.be/",
   "contactpersoon": "",
   "contactEmail": "monumentenwacht@provincieantwerpen.be",
   "notities": "Eerst nakijken op jobs.provincieantwerpen.be of de vacature monumentenwachter duurzaamheid nog open staat; zo ja, via het portaal solliciteren in plaats van spontaan. In te vullen: hoe Remi Monumentenwacht leerde kennen, ervaring met werken op hoogte.",
   "hotlistId": "monumentenwacht-antwerpen",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "monumentenwacht-antwerpen-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-onroerend-erfgoed",
   "organisatie": "Agentschap Onroerend Erfgoed",
   "functie": "Depotmedewerker (niveau C)",
   "spoor": "erfgoed",
   "type": "spontaan",
   "bronUrl": "https://www.onroerenderfgoed.be/vacatures",
   "contactpersoon": "",
   "contactEmail": "vacatures@onroerenderfgoed.be",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "onroerend-erfgoed",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "onroerend-erfgoed-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-opera-ballet-vlaanderen",
   "organisatie": "Opera Ballet Vlaanderen",
   "functie": "Decorbouwer metaal (decoratelier Zele)",
   "spoor": "cultuur",
   "type": "spontaan",
   "bronUrl": "https://www.operaballet.be/nl/werken-bij-opera-ballet-vlaanderen",
   "contactpersoon": "",
   "contactEmail": "",
   "notities": "In te vullen: contactpersoon, hoe Remi de Opera leerde kennen, een concreet project, een zin over de verplaatsing naar Zele (rijbewijs B).",
   "hotlistId": "opera-ballet-vlaanderen",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "opera-ballet-vlaanderen-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-smego",
   "organisatie": "Smego Metaalwerken",
   "functie": "Restauratiemedewerker metaal",
   "spoor": "erfgoed",
   "type": "spontaan",
   "bronUrl": "https://smego.be/contact",
   "contactpersoon": "",
   "contactEmail": "",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "smego",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "smego-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-stad-antwerpen-musea",
   "organisatie": "Stad Antwerpen, Musea en Erfgoed",
   "functie": "Technisch assistent C1, musea en erfgoed (tentoonstellingsbouw, depot en collectiezorg)",
   "spoor": "cultuur",
   "type": "spontaan",
   "bronUrl": "https://job.antwerpen.be/go/Alle-vacatures/4474301/",
   "contactpersoon": "",
   "contactEmail": "",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "stad-antwerpen-musea",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "stad-antwerpen-musea-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-syntra-ab",
   "organisatie": "SYNTRA AB",
   "functie": "Docent lassen en metaalbewerking (avondopleidingen)",
   "spoor": "onderwijs",
   "type": "spontaan",
   "bronUrl": "https://www.syntra-ab.be/docenten",
   "contactpersoon": "",
   "contactEmail": "",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "syntra-ab",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "syntra-ab-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-toneelhuis",
   "organisatie": "Toneelhuis",
   "functie": "Ateliermedewerker decoratelier (decorbouw, metaal en constructie)",
   "spoor": "cultuur",
   "type": "spontaan",
   "bronUrl": "https://toneelhuis.be/nl/over-toneelhuis/vacatures-stages/",
   "contactpersoon": "",
   "contactEmail": "personeelszaken@toneelhuis.be",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "toneelhuis",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "toneelhuis-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-vdab-instructeur",
   "organisatie": "VDAB competentiecentra",
   "functie": "Instructeur lassen en metaal (niveau C)",
   "spoor": "onderwijs",
   "type": "spontaan",
   "bronUrl": "https://www.vdab.be/vindeenjob/jobs/vdab-instructeur",
   "contactpersoon": "",
   "contactEmail": "",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "vdab-instructeur",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "vdab-instructeur-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  },
  {
   "id": "sol-verstraete-vanhecke",
   "organisatie": "Verstraete & Vanhecke",
   "functie": "Restauratiemedewerker metaalwerk",
   "spoor": "erfgoed",
   "type": "spontaan",
   "bronUrl": "https://v-v.be/vacatures/",
   "contactpersoon": "",
   "contactEmail": "",
   "notities": "Vierkante haken invullen voor verzending: naam, adres, contactpersoon, concreet project of haak.",
   "hotlistId": "verstraete-vanhecke",
   "status": "in voorbereiding",
   "datumVerstuurd": "",
   "opvolgdatum": "",
   "gesprekDatum": "",
   "documentSlug": "verstraete-vanhecke-spontaan",
   "aangemaakt": "2026-09-27",
   "logboek": [
    {
     "datum": "2026-09-27",
     "tekst": "Concept van brief, mail en cv-versie klaar in documents/generated"
    }
   ]
  }
 ],
 "stappenplan": [
  {
   "id": "s01",
   "groep": "Eerst, deze week",
   "titel": "Niets tekenen bij de werkgever",
   "wat": "Geen document over beëindiging in onderling akkoord of ontslagname tekenen. Vraag een kopie mee naar huis. Zeg rustig: ik laat dit nakijken door mijn vakbond.",
   "wie": "Remi",
   "deadline": "2026-10-02",
   "status": "open",
   "bron": "rechten",
   "voor": "remi"
  },
  {
   "id": "s34",
   "groep": "Eerst, deze week",
   "titel": "ACV-afspraak boeken voor vrijdag 16 oktober",
   "wat": "ACV laat maar een week op voorhand boeken. Boek op zondag 11 oktober via hetacv.be een afspraak op vrijdag 16 oktober, na de doktersafspraak van 08:30 in Deurne (bijvoorbeeld vanaf 10:00). Misschien regelt het telefoongesprek met ACV van maandag 5 oktober dit al.",
   "wie": "Giulia",
   "deadline": "2026-10-11",
   "status": "open",
   "bron": "rechten",
   "voor": "giulia"
  },
  {
   "id": "s02",
   "groep": "Eerst, deze week",
   "titel": "Afspraak bij ACV-CSC METEA, vrijdag 16 oktober",
   "wat": "Neem ook de verwittiging mee. Op dezelfde dag als de doktersafspraak, liefst vanaf 10:00 zodat er tijd is na de dokter. Wat de dokter vaststelt, kan je meteen met ACV bespreken. Neem mee: het document van de werkgever, het arbeidscontract, de laatste loonfiches, de startdatum. Vragen: exacte anciënniteit en opzegtermijn, eindejaarspremie PC 111 Antwerpen bij ontslagname versus ontslag, hoe reageren op druk, wat de C4 moet vermelden, hoe ACV de uitkering regelt.",
   "wie": "Remi (Giulia mee als hij dat wil)",
   "deadline": "2026-10-16",
   "status": "open",
   "bron": "rechten",
   "voor": "remi"
  },
  {
   "id": "s35",
   "groep": "Eerst, deze week",
   "titel": "Telefoon met ACV voorbereiden (maandag 5 oktober)",
   "wat": "ACV belt maandag 5 oktober tussen 15:00 en 16:00; de details staan in de agenda. Zorg dat Remi erbij is, want ACV bespreekt zijn dossier normaal alleen met hemzelf of met zijn toestemming. Leg klaar: de verwittiging met envelop en ontvangstbewijs, de lijst met data, de loonfiches en de startdatum. Vragen: is de verwittiging tijdig en geldig, moet Remi antwoorden, hoe vraagt hij het contract en het arbeidsreglement op, welk statuut en welke opzegtermijn gelden, hoe bekomt hij een ontslag door de werkgever zonder 'fout' op de C4, wat bij druk om te tekenen, is zijn lidmaatschap in orde voor juridische bijstand, en kan er een afspraak ter plaatse volgen (bijvoorbeeld 16 oktober na de dokter). Teken niets behalve 'voor ontvangst'. Uitleg bij Rechten, Verwittiging.",
   "wie": "Giulia en Remi (ACV belt naar Giulia)",
   "deadline": "2026-10-05",
   "status": "open",
   "bron": "rechten",
   "voor": "samen"
  },
  {
   "id": "s36",
   "groep": "Eerst, deze week",
   "titel": "Reactie op de verwittiging, na overleg met ACV",
   "wat": "Als ACV het aanraadt: stuur het ontwerp bij Communicatie, Brieven. Kort en feitelijk, geen emotie, niets ontkennen wat klopt. Vraag een ontvangstbewijs of stuur aangetekend.",
   "wie": "Remi met ACV",
   "deadline": "2026-10-16",
   "status": "open",
   "bron": "rechten",
   "voor": "remi"
  },
  {
   "id": "s37",
   "groep": "Eerst, deze week",
   "titel": "Op tijd, of vooraf verwittigen",
   "wat": "Elke dag op tijd beginnen. Lukt het niet, verwittig dan vóór het beginuur per sms of mail (ontwerp bij Communicatie, Sms) en noteer het in het logboek. Bij ziekte: dokter en attest, meteen melden.",
   "wie": "Remi",
   "deadline": "2026-10-05",
   "status": "open",
   "bron": "rechten",
   "voor": "remi"
  },
  {
   "id": "s03",
   "groep": "Eerst, deze week",
   "titel": "Doktersafspraak, vrijdag 16 oktober om 08:30",
   "wat": "Afspraak in Deurne om 08:30; naam en adres staan in je agenda. Bespreek vermoeidheid, burn-outklachten en de fysieke belasting van het laswerk. Vraag om de klachten te documenteren in het dossier. Bespreek of ziekteverlof nu aangewezen is en wat een verwijzing naar een psycholoog kan betekenen. Vraag naar de mogelijkheid van een re-integratietraject via de arbeidsarts.",
   "wie": "Remi",
   "deadline": "2026-10-16",
   "status": "open",
   "bron": "herstel",
   "voor": "remi"
  },
  {
   "id": "s04",
   "groep": "Eerst, deze week",
   "titel": "Startdatum en statuut controleren",
   "wat": "Zoek de exacte startdatum van het contract op (contract, eerste loonfiche, mijnloopbaan). De startdatum bepaalt de opzegtermijn: 15 of 18 weken bij opzeg door de werkgever, 7 of 9 weken bij opzeg door de werknemer. Controleer ook op de loonfiche het statuut (arbeider of bediende) en het paritair comité (111, 200 of 209): dat bepaalt het gewaarborgd loon bij ziekte, het vakantiegeld en de eindejaarspremie.",
   "wie": "Remi en Giulia",
   "deadline": "2026-10-04",
   "status": "open",
   "bron": "rechten",
   "voor": "samen"
  },
  {
   "id": "s05",
   "groep": "Uitstap regelen",
   "titel": "Gesprek met de werkgever voorbereiden",
   "wat": "Doel: een ontslag door de werkgever met opzegtermijn, liefst met vrijstelling van prestaties, of met een verbrekingsvergoeding. Argument voor de werkgever: dat kost hen niet meer dan wat de wet toch voorziet, en het vermijdt een conflict. ACV kan het gesprek voorbereiden of erbij zijn. Niets mondeling toezeggen.",
   "wie": "Remi met ACV",
   "deadline": "2026-10-23",
   "status": "open",
   "bron": "rechten",
   "voor": "remi"
  },
  {
   "id": "s06",
   "groep": "Uitstap regelen",
   "titel": "Beslissing over het uitstapscenario",
   "wat": "Kies met ACV tussen: A ontslag door de werkgever (beste), B ziekteverlof met herstel en mogelijk herscholing via het ziekenfonds, C zelf opzeggen alleen als er een nieuwe job van minstens 13 weken klaarstaat. Onderling akkoord is geen optie zonder vergoeding en RVA-garantie.",
   "wie": "Remi, Giulia, ACV",
   "deadline": "2026-10-31",
   "status": "open",
   "bron": "rechten",
   "voor": "samen"
  },
  {
   "id": "s07",
   "groep": "Uitstap regelen",
   "titel": "Sollicitatieverlof opnemen tijdens de opzeg",
   "wat": "Tijdens een opzegtermijn van 26 weken of minder heb je recht op een volledige dag (of twee halve) betaald sollicitatieverlof per week. Plan die dagen voor gesprekken, atelierbezoeken en administratie.",
   "wie": "Remi",
   "deadline": "",
   "status": "open",
   "bron": "rechten",
   "voor": "remi"
  },
  {
   "id": "s08",
   "groep": "Uitstap regelen",
   "titel": "C4 controleren bij vertrek",
   "wat": "De C4 moet de juiste reden vermelden (ontslag door de werkgever). Alleen tekenen voor ontvangst. Bij twijfel protest noteren en naar ACV.",
   "wie": "Remi",
   "deadline": "2026-12-31",
   "status": "open",
   "bron": "rechten",
   "voor": "remi"
  },
  {
   "id": "s09",
   "groep": "VDAB",
   "titel": "Inschrijven bij VDAB als werkzoekende",
   "wat": "Binnen 8 dagen na het einde van de opzegtermijn, of binnen een maand na de start van een vrijstelling van prestaties. Kies bij de inschrijving: ik ben werkloos en vraag een uitkering. Uitbetalingsinstelling: ACV.",
   "wie": "Remi",
   "deadline": "2027-01-08",
   "status": "open",
   "bron": "vdab",
   "voor": "remi"
  },
  {
   "id": "s10",
   "groep": "VDAB",
   "titel": "Loopbaangesprek met een VDAB-bemiddelaar aanvragen",
   "wat": "Al in het najaar, zodra het ontslag vaststaat. Vraag schriftelijk: (1) welke voltijdse VDAB-beroepsopleidingen van minstens 3 maanden passen (tekenaar CAD/BIM, podiumtechniek, lasinspectie), want alleen die verlengen de uitkering, met maximaal 12 maanden; (2) of het educatief graduaat secundair onderwijs in Antwerpen als OKOT loopt; (3) of een vrijstelling voor Conservatie-Restauratie kan; (4) beroepsverkennende stage en IBO. Onthoud: gewone studies verlengen de 24 maanden niet meer.",
   "wie": "Remi (Giulia bereidt de vragen voor)",
   "deadline": "2026-11-15",
   "status": "open",
   "bron": "vdab",
   "voor": "samen"
  },
  {
   "id": "s11",
   "groep": "VDAB",
   "titel": "VDAB-profiel Mijn Loopbaan invullen",
   "wat": "Profieltekst uit Documenten gebruiken. Gewenste functies: technisch medewerker museum, decorbouwer, restauratiemedewerker metaal, instructeur lassen. Zichtbaar voor werkgevers zetten. Jobs op maat instellen.",
   "wie": "Remi",
   "deadline": "2026-10-31",
   "status": "open",
   "bron": "vdab",
   "voor": "remi"
  },
  {
   "id": "s33",
   "groep": "VDAB",
   "titel": "Loopbaancheque aanvragen zolang je nog werkt",
   "wat": "Tijdelijke regeling tot eind 2026: één cheque van vier uur loopbaanbegeleiding voor €90, als je er nog nooit een gebruikte en minstens zeven jaar werkervaring hebt. VDAB toont bij de aanvraag of je in aanmerking komt. Aanvragen kan alleen zolang je nog in dienst bent, dus voor 31 december 2026. Zie Cv-atelier, Zelftests, Tests elders.",
   "wie": "Remi",
   "deadline": "2026-11-30",
   "status": "open",
   "bron": "vdab",
   "voor": "remi"
  },
  {
   "id": "s12",
   "groep": "VDAB",
   "titel": "Knelpuntberoepenlijst 2026 nakijken",
   "wat": "Nagekeken op 27 september 2026: lasser staat op de lijst (VDAB-fiche Manueel lasser: knelpuntberoep); het graduaat bouwkundig tekenen is erkend als OKOT. Zie research/10.",
   "wie": "Giulia",
   "deadline": "2026-10-11",
   "status": "klaar",
   "bron": "vdab",
   "voor": "giulia"
  },
  {
   "id": "s13",
   "groep": "Herstel en gezondheid",
   "titel": "Re-integratietraject bij de arbeidsarts overwegen",
   "wat": "Elke werknemer kan zelf een re-integratietraject aanvragen bij de arbeidsarts van de externe dienst van de werkgever. Een beslissing B (definitief ongeschikt voor het huidige werk, ander werk mogelijk) is het sterkste document voor herscholing via het ziekenfonds. Bespreek dit eerst met de huisarts en ACV.",
   "wie": "Remi",
   "deadline": "2026-11-30",
   "status": "open",
   "bron": "herstel",
   "voor": "remi"
  },
  {
   "id": "s14",
   "groep": "Herstel en gezondheid",
   "titel": "Ziekenfonds: Terug Naar Werk-coördinator en herscholing",
   "wat": "Als het medische spoor gekozen wordt: contact met de Terug Naar Werk-coördinator van het ziekenfonds over een programma van socioprofessionele re-integratie (opleiding betaald, premie per lesuur, uitkering behouden).",
   "wie": "Remi",
   "deadline": "",
   "status": "open",
   "bron": "herstel",
   "voor": "remi"
  },
  {
   "id": "s15",
   "groep": "Herstel en gezondheid",
   "titel": "Herstelperiode inplannen",
   "wat": "Januari en februari 2027 zijn voor herstel: slaap, beweging, weinig verplichtingen. Eén vaste dag per week voor het traject (sollicitaties, stages, administratie). De rest is rust.",
   "wie": "Remi",
   "deadline": "2027-01-05",
   "status": "open",
   "bron": "herstel",
   "voor": "remi"
  },
  {
   "id": "s16",
   "groep": "Documenten",
   "titel": "Master-cv in het Nederlands afwerken",
   "wat": "Persoonlijke gegevens, lascertificaten (EN ISO 9606), VCA, projecten met concrete voorbeelden, opleiding, talen, rijbewijs aanvullen in het cv-bestand. Eén tot twee pagina's.",
   "wie": "Remi en Giulia",
   "deadline": "2026-10-11",
   "status": "open",
   "bron": "documenten",
   "voor": "samen"
  },
  {
   "id": "s17",
   "groep": "Documenten",
   "titel": "Portfolio samenstellen",
   "wat": "8 tot 15 pagina's, minder dan 10 MB, 6 tot 10 werkstukken met titel, jaar, materiaal, techniek, rol, één sterke foto en één detail. Ook meubels en tekeningen. Link in het cv.",
   "wie": "Remi",
   "deadline": "2026-10-25",
   "status": "open",
   "bron": "documenten",
   "voor": "remi"
  },
  {
   "id": "s18",
   "groep": "Documenten",
   "titel": "Motivatiebrief-basis en mailsjablonen klaarzetten",
   "wat": "Basisbrief per spoor (erfgoed, cultuur, onderwijs) in Documenten. Per organisatie wordt de brief aangepast met de sollicitatie-werkwijze.",
   "wie": "Giulia met Claude",
   "deadline": "2026-10-11",
   "status": "open",
   "bron": "documenten",
   "voor": "giulia"
  },
  {
   "id": "s19",
   "groep": "Documenten",
   "titel": "Certificaten verzamelen",
   "wat": "Diploma secundair, lascertificaten, VCA-attest, eventuele attesten van de werkgever. Scan alles als pdf en bewaar in de map documenten.",
   "wie": "Remi",
   "deadline": "2026-10-18",
   "status": "open",
   "bron": "documenten",
   "voor": "remi"
  },
  {
   "id": "s20",
   "groep": "Zoeken en netwerken",
   "titel": "Hotlist prioriteren",
   "wat": "Kies met Remi de 10 organisaties met prioriteit 1 en bepaal per organisatie: vacature volgen, spontaan solliciteren, bezoek of stage vragen.",
   "wie": "Remi en Giulia",
   "deadline": "2026-10-11",
   "status": "open",
   "bron": "hotlist",
   "voor": "samen"
  },
  {
   "id": "s21",
   "groep": "Zoeken en netwerken",
   "titel": "Jobalerts instellen",
   "wat": "VDAB jobs op maat, Stedelijk Onderwijs Emply-alert, Provincie Antwerpen alert, M HKA careersite alert, AP School of Arts job alert, cultuurjobs.be volgen.",
   "wie": "Remi",
   "deadline": "2026-10-11",
   "status": "open",
   "bron": "vacatures",
   "voor": "remi"
  },
  {
   "id": "s22",
   "groep": "Zoeken en netwerken",
   "titel": "Open Bedrijvendag 4 oktober 2026",
   "wat": "Bezoek een restauratie- of metaalbedrijf in de regio. Kort gesprek, vraag naar spontane sollicitaties.",
   "wie": "Remi",
   "deadline": "2026-10-04",
   "status": "open",
   "bron": "netwerk",
   "voor": "remi"
  },
  {
   "id": "s23",
   "groep": "Zoeken en netwerken",
   "titel": "KMSKA Open restauratieatelier bezoeken",
   "wat": "Om de twee maanden. Kennismaken met de restauratoren en vragen naar stagemogelijkheden.",
   "wie": "Remi",
   "deadline": "2026-11-30",
   "status": "open",
   "bron": "netwerk",
   "voor": "remi"
  },
  {
   "id": "s24",
   "groep": "Zoeken en netwerken",
   "titel": "Dag van de Ambachten 15 november 2026",
   "wat": "Bezoek smederijen en restauratieateliers die meedoen. Portfolio op de gsm.",
   "wie": "Remi",
   "deadline": "2026-11-15",
   "status": "open",
   "bron": "netwerk",
   "voor": "remi"
  },
  {
   "id": "s25",
   "groep": "Zoeken en netwerken",
   "titel": "Eerste spontane sollicitaties versturen",
   "wat": "Oktober en november zijn het beste moment: erfgoedorganisaties leggen dan budgetten vast voor het volgende jaar. Voorstel: start in januari of februari 2027, eventueel als IBO of beroepsverkennende stage.",
   "wie": "Remi met Giulia",
   "deadline": "2026-11-15",
   "status": "open",
   "bron": "sollicitaties",
   "voor": "samen"
  },
  {
   "id": "s26",
   "groep": "Zoeken en netwerken",
   "titel": "Vrijwilligerswerk als deuropener",
   "wat": "Erfgoeddag 18 april 2027, Museumnacht, Middelheim installatiedagen, Open Monumentendag 12 september 2027. Rustige taken achter de schermen passen beter dan publieksrollen.",
   "wie": "Remi",
   "deadline": "",
   "status": "open",
   "bron": "netwerk",
   "voor": "remi"
  },
  {
   "id": "s27",
   "groep": "Opleiding",
   "titel": "Studie bevestigen en studiepunten opvragen",
   "wat": "Welke opleiding volgt Remi precies (hogeschoolbachelor, DKO-academie, ander)? Vraag een attest van inschrijving en behaalde studiepunten. Dit bepaalt vrijstellingen (EVK) en of Vlaams opleidingsverlof kan.",
   "wie": "Remi",
   "deadline": "2026-10-11",
   "status": "open",
   "bron": "opleiding",
   "voor": "remi"
  },
  {
   "id": "s28",
   "groep": "Opleiding",
   "titel": "Korte certificaten plannen",
   "wat": "VCA-basis (als nog niet geldig), IPAF hoogtewerker, heftruck. Maken van een lasser een inzetbare podium- of depottechnicus. VDAB betaalt voor werkzoekenden.",
   "wie": "Remi",
   "deadline": "2027-03-31",
   "status": "open",
   "bron": "opleiding",
   "voor": "remi"
  },
  {
   "id": "s29",
   "groep": "Opleiding",
   "titel": "Infomomenten opleidingen bezoeken",
   "wat": "UAntwerpen Conservatie-Restauratie (metaal), AP educatief graduaat secundair onderwijs, AP graduaat Bouwkundig tekenen, RITCS Podiumtechnieken. Infodagen vallen meestal in februari, maart en juni.",
   "wie": "Remi",
   "deadline": "2027-03-31",
   "status": "open",
   "bron": "opleiding",
   "voor": "remi"
  },
  {
   "id": "s30",
   "groep": "Opleiding",
   "titel": "FARO basiscursus behoud en beheer",
   "wat": "Inschrijven voor de voorjaarseditie 2027. Standaard instapticket voor collectiezorg in musea.",
   "wie": "Remi",
   "deadline": "2027-02-28",
   "status": "open",
   "bron": "opleiding",
   "voor": "remi"
  },
  {
   "id": "s31",
   "groep": "Opleiding",
   "titel": "Beslissing over het opleidingstraject",
   "wat": "Kies uiterlijk in juni 2027. Let op de 24 maanden: een VDAB-beroepsopleiding van minstens 3 maanden verlengt ze, een graduaat of bachelor niet. Opties: VDAB-opleiding (tekenaar, podiumtechniek), educatief graduaat (lesgeven, OKOT), graduaat bouwkundig tekenen (OKOT), Conservatie-Restauratie (langer; via deeltijds werk of het medische spoor).",
   "wie": "Remi en Giulia",
   "deadline": "2027-06-30",
   "status": "open",
   "bron": "opleiding",
   "voor": "samen"
  },
  {
   "id": "s32",
   "groep": "Opleiding",
   "titel": "Erkenning metaaldetectorist aanvragen (optioneel)",
   "wat": "Gratis, via het e-loket van Onroerend Erfgoed met je eID en een uittreksel uit het strafregister. Binnen 90 dagen krijg je een legitimatiebewijs. Een kleine plus voor werk in archeologie en vondstverwerking.",
   "wie": "Remi",
   "deadline": "",
   "status": "open",
   "bron": "opleiding",
   "voor": "remi"
  }
 ],
 "vacatures": [],
 "verkenning": [
  {
   "id": "decorbouwer",
   "domein": "cultuur",
   "naam": "Decorbouwer metaal (theater, opera)",
   "rollen": [
    "decorbouwer",
    "constructeur decor",
    "ateliermedewerker metaal",
    "smid decoratelier"
   ],
   "werkgevers": [
    "Opera Ballet Vlaanderen (decoratelier Zele)",
    "Toneelhuis",
    "De Munt (Brussel)",
    "Total Concept (Ranst)",
    "Deusjevoo (Zoersel)"
   ],
   "vereisten": "Geen diploma; lassen, plannen lezen, veiligheid. Precies zijn profiel.",
   "knelpunt": "Valt onder lasser",
   "loon": "PC 304 ongeveer €2.450 tot €2.750",
   "fit": 5,
   "waarom": "Directe overdracht van zijn vak naar een zinvolle, artistieke context met vaste ateliers.",
   "status": "hoofdspoor"
  },
  {
   "id": "museumtechnicus",
   "domein": "cultuur",
   "naam": "Technisch medewerker museum, tentoonstellingsopbouw",
   "rollen": [
    "museumtechnicus",
    "medewerker tentoonstellingsopbouw",
    "technisch assistent C1"
   ],
   "werkgevers": [
    "Stad Antwerpen Musea en Erfgoed",
    "KMSKA",
    "M HKA",
    "Bozar",
    "Technopolis"
   ],
   "vereisten": "Diploma secundair (niveau C) of geen (D). Hout, metaal, tekeningen.",
   "knelpunt": "Niet als zodanig",
   "loon": "Stad C1 vanaf €2.460; met 5 jaar ervaring €2.769",
   "fit": 5,
   "waarom": "Rustig, zorgvuldig, institutioneel. Werfreserve van de stad blijft een jaar geldig.",
   "status": "hoofdspoor"
  },
  {
   "id": "mountmaker",
   "domein": "cultuur",
   "naam": "Mount maker en vitrinebouwer",
   "rollen": [
    "mount maker",
    "vitrinebouwer",
    "medewerker museale inrichting"
   ],
   "werkgevers": [
    "Meyvaert Museum (Gent)",
    "Potteau Labo (Kortrijk)",
    "grote musea in-house"
   ],
   "vereisten": "Geen diploma; fijn metaalwerk, plooien, solderen en lassen op zichtwerk (TIG op inox en messing is een pluspunt).",
   "knelpunt": "Niet als zodanig",
   "loon": "Privé ongeveer €2.600 tot €3.200",
   "fit": 5,
   "waarom": "Een echte niche voor een tekenaar en plaatbewerker met ontwerpgevoel; museumkwaliteit.",
   "status": "hoofdspoor"
  },
  {
   "id": "restauratiemedewerker",
   "domein": "erfgoed",
   "naam": "Restauratiemedewerker metaal en monumenten",
   "rollen": [
    "restauratiemedewerker metaal",
    "smeedwerkrestauratie",
    "vakman restauratie"
   ],
   "werkgevers": [
    "Verstraete & Vanhecke",
    "Renotec",
    "Monument Group",
    "Smego",
    "Lapis Arte",
    "AltNova"
   ],
   "vereisten": "Vakmanschap; restaurateurs hebben de UAntwerpen-opleiding, aannemers nemen vakmensen aan.",
   "knelpunt": "Via onderliggend vak (lasser, smid)",
   "loon": "Ongeveer €2.500 tot €3.000",
   "fit": 5,
   "waarom": "De brug van lassen naar erfgoed; onderzoekend en zorgvuldig werk.",
   "status": "hoofdspoor"
  },
  {
   "id": "monumentenwachter",
   "domein": "erfgoed",
   "naam": "Monumentenwachter",
   "rollen": [
    "monumentenwachter"
   ],
   "werkgevers": [
    "Monumentenwacht Antwerpen (provincie)"
   ],
   "vereisten": "Technisch secundair of bachelor bouw; klimconditie; rijbewijs B.",
   "knelpunt": "Niet",
   "loon": "Provinciale schaal C/B ongeveer €2.500 tot €3.000",
   "fit": 5,
   "waarom": "Inspecteren, rapporteren, adviseren: onderzoekend, behoedzaam en dienstbaar. Kleine ploeg.",
   "status": "hoofdspoor"
  },
  {
   "id": "depot",
   "domein": "erfgoed",
   "naam": "Depotmedewerker, art handler, collectiezorg",
   "rollen": [
    "depotmedewerker",
    "art handler",
    "collectiemedewerker behoud en beheer",
    "registrator (later)"
   ],
   "werkgevers": [
    "Stad Antwerpen collectiedepot",
    "KMSKA depot",
    "Onroerend Erfgoed depot",
    "Mobull (Brussel)"
   ],
   "vereisten": "Geen diploma of secundair; heftruck, VCA, rijbewijs helpen. FARO basiscursus als instapticket.",
   "knelpunt": "Niet",
   "loon": "PC 329.01 ongeveer €2.300 tot €2.900",
   "fit": 4,
   "waarom": "Deuropener naar musea en collecties; kalm en precies.",
   "status": "hoofdspoor"
  },
  {
   "id": "podiumtechnicus",
   "domein": "cultuur",
   "naam": "Podiumtechnicus (toneel, rigging)",
   "rollen": [
    "podiumtechnicus",
    "toneeltechnicus",
    "rigger"
   ],
   "werkgevers": [
    "deSingel",
    "Toneelhuis",
    "hetpaleis",
    "Opera Ballet Vlaanderen"
   ],
   "vereisten": "Se-n-Se, RITCS of on-the-job; hoogte- en riggingcertificaten. Avond- en weekendwerk.",
   "knelpunt": "Vermoedelijk op de lijst (te verifiëren)",
   "loon": "PC 304 ongeveer €2.650 tot €2.900",
   "fit": 4,
   "waarom": "Lasten en constructies begrijpen is een voordeel; nadeel: onregelmatige uren naast de studie.",
   "status": "verkennen"
  },
  {
   "id": "instructeur-jeugd",
   "domein": "sociaal",
   "naam": "Instructeur metaal in jongerenopleiding",
   "rollen": [
    "instructeur lassen",
    "werkvloerbegeleider",
    "NAFT-begeleider",
    "atelierbegeleider"
   ],
   "werkgevers": [
    "Groep INTRO",
    "Profo vzw (Antwerpen)",
    "Arktos",
    "JES Werkt"
   ],
   "vereisten": "Vakkennis plus pedagogische houding; diploma secundair volstaat meestal voor instructeur. Overdag.",
   "knelpunt": "Niet als zodanig",
   "loon": "PC 329.01 ongeveer €2.500 tot €2.900",
   "fit": 5,
   "waarom": "Dienstbaarheid en sociaal profiel, kleine groepen, structuur; zijn lasvak is zeldzaam in deze sector.",
   "status": "verkennen"
  },
  {
   "id": "sociale-economie",
   "domein": "sociaal",
   "naam": "Werkvloerbegeleider in de sociale economie",
   "rollen": [
    "werkvloerbegeleider",
    "monitor",
    "werkbegeleider atelier"
   ],
   "werkgevers": [
    "Levanto (Bouw en Renovatie, Fietspunt)",
    "De Kringwinkel Antwerpen (meubelatelier)",
    "Manus",
    "Aralea",
    "Mariasteen (Gits, metaal)"
   ],
   "vereisten": "Geen diploma; technische beheersing en coachende houding.",
   "knelpunt": "Niet",
   "loon": "PC 327.01 ongeveer €2.600 tot €3.000",
   "fit": 4,
   "waarom": "Zinvol en stabiel, overdag; vraagt wel dagelijks een groep leiden.",
   "status": "verkennen"
  },
  {
   "id": "zorgatelier",
   "domein": "sociaal",
   "naam": "Atelierbegeleider in zorg en psychiatrie",
   "rollen": [
    "begeleider dagbesteding",
    "atelierbegeleider hout en metaal",
    "begeleider arbeidszorg"
   ],
   "werkgevers": [
    "Ritmica (Hove)",
    "Monnikenheide-Spectrum (Zoersel)",
    "OLO-Rotonde",
    "Multiversum",
    "PZ Bethanië"
   ],
   "vereisten": "Bachelor of A2 met relevante ervaring (PC 319.01 klasse 2). Vakkennis is zeldzaam en gewild.",
   "knelpunt": "Opvoeder-begeleider is knelpunt",
   "loon": "B2b ongeveer €2.600 tot €2.750; B1c na graduaat €2.950 tot €3.100",
   "fit": 4,
   "waarom": "Ambacht in dienst van mensen; graduaat orthopedagogische begeleiding in avondtraject maakt klasse 1 mogelijk.",
   "status": "verkennen"
  },
  {
   "id": "circulair",
   "domein": "ecologisch",
   "naam": "Circulair bouwen en hergebruik",
   "rollen": [
    "ateliermedewerker hergebruikmaterialen",
    "ontmantelaar",
    "productiemedewerker leembouw",
    "energiesnoeier"
   ],
   "werkgevers": [
    "Rotor DC (Brussel)",
    "BC materials (Brussel)",
    "Opalis-handelaars",
    "Energiesnoeiers (Herwin)",
    "Ecoso (Mechelen)"
   ],
   "vereisten": "Geen diploma; handvaardigheid, rijbewijs B, veiligheid.",
   "knelpunt": "Bouwberoepen zijn knelpunt",
   "loon": "Ongeveer €2.400 tot €2.900",
   "fit": 4,
   "waarom": "Ontwerp plus handwerk plus ecologische betekenis; ontmanteling is zwaar, atelierkant lichter.",
   "status": "verkennen"
  },
  {
   "id": "natuur",
   "domein": "ecologisch",
   "naam": "Natuur- en groenbeheer met techniek",
   "rollen": [
    "technisch medewerker",
    "ploegbaas natuurbeheer",
    "monitor groen"
   ],
   "werkgevers": [
    "Natuurpunt",
    "Aralea",
    "Natuurwerk",
    "KMDA technische dienst",
    "Stad Antwerpen Stadsbeheer"
   ],
   "vereisten": "Groenkennis, kettingzaagattest (Inverde), rijbewijs B.",
   "knelpunt": "Onderhoudstechnicus is knelpunt",
   "loon": "Ongeveer €2.500 tot €3.100",
   "fit": 3,
   "waarom": "Buiten, zinvol, kleine ploegen; minder ambacht.",
   "status": "verkennen"
  },
  {
   "id": "archeologie",
   "domein": "geschiedenis",
   "naam": "Archeologie en vondstverwerking",
   "rollen": [
    "veldtechnicus archeologie",
    "vondstverwerker",
    "depotmedewerker archeologie",
    "conservator archeologisch metaal (na opleiding)"
   ],
   "werkgevers": [
    "Commerciële archeologiebedrijven (BAAC, Ruben Willaert, All-Archeo, Monument Vandekerckhove archeologie)",
    "Stad Antwerpen dienst Archeologie",
    "Onroerend Erfgoed depot",
    "Intergemeentelijke erfgoeddiensten"
   ],
   "vereisten": "Veldtechnicus meestal zonder master; bachelor Archeologie (UGent, KU Leuven, VUB) staat open met diploma secundair. Erkenning metaaldetectorist (bevestigd): 18 jaar, geen erfgoedveroordeling in 5 jaar, aanvraag via het e-loket met eID en uittreksel strafregister, legitimatiebewijs binnen 90 dagen.",
   "knelpunt": "Niet",
   "loon": "Te verifiëren",
   "fit": 4,
   "waarom": "Onderzoekend, geduldig, zinvol; metaalvondsten conserveren is een directe brug vanuit het lasvak. Onderzoek 9 loopt.",
   "status": "verkennen"
  },
  {
   "id": "archief",
   "domein": "geschiedenis",
   "naam": "Archief en collectieregistratie",
   "rollen": [
    "archiefmedewerker",
    "depotbeheerder",
    "digitaliseringsmedewerker",
    "collectieregistrator"
   ],
   "werkgevers": [
    "FelixArchief",
    "Letterenhuis",
    "Erfgoedbibliotheek Hendrik Conscience",
    "ADVN (Antwerpen)",
    "Rijksarchief",
    "meemoo"
   ],
   "vereisten": "Graduaat Informatiebeheer: bibliotheek en archief (2 jaar) of ervaring; FARO-cursussen.",
   "knelpunt": "Niet",
   "loon": "Te verifiëren",
   "fit": 4,
   "waarom": "Stil, ordelijk en historisch. Remi bouwde in 2017 en 2018 zelf een fotoarchief op, een concreet bewijs voor sollicitaties. Onderzoek 9 loopt.",
   "status": "verkennen"
  },
  {
   "id": "lasinspecteur",
   "domein": "reserve",
   "naam": "Lasinspecteur, NDT-technicus",
   "rollen": [
    "lasinspecteur",
    "lascoördinator",
    "NDT-technicus"
   ],
   "werkgevers": [
    "Kiwa Vinçotte",
    "SGS Belgium",
    "Bureau Veritas",
    "in-house bij scheepswerven en chemie"
   ],
   "vereisten": "IWS via het Belgisch Instituut voor Lastechniek (6 tot 12 maanden deeltijds); NDT niveau 1 en 2 per methode.",
   "knelpunt": "Lasser ja; inspecteur vermoedelijk",
   "loon": "€2.800 tot €4.200",
   "fit": 5,
   "waarom": "Andermans precisie controleren: onderzoekend, behoedzaam, uitdagend, veel minder fysiek. Blijft in zijn vakwereld.",
   "status": "reserve"
  },
  {
   "id": "vdab-instructeur",
   "domein": "onderwijs",
   "naam": "Instructeur lassen bij VDAB",
   "rollen": [
    "instructeur lassen",
    "instructeur metaal"
   ],
   "werkgevers": [
    "VDAB competentiecentra Antwerpen, Mechelen, Turnhout",
    "Talentenfabriek Antwerpen"
   ],
   "vereisten": "Geen pedagogisch diploma; interne opleiding. Kleine groepen van 8 tot 12 volwassenen.",
   "knelpunt": "Niet als zodanig; VDAB werft doorlopend",
   "loon": "Schaal C ongeveer €2.600 tot €3.300, 35 verlofdagen",
   "fit": 5,
   "waarom": "Dienstbaarheid en stabiliteit bij een publieke werkgever, studievriendelijke uren; atelierleiding en lasvakkennis zijn schaars bij instructeurs.",
   "status": "hoofdspoor"
  },
  {
   "id": "justitie",
   "domein": "overheid",
   "naam": "Penitentiair technisch assistent (gevangeniswerkhuizen)",
   "rollen": [
    "penitentiair technisch assistent niveau C"
   ],
   "werkgevers": [
    "FOD Justitie, Cellmade: Antwerpen, Beveren, Merksplas, Hoogstraten, Mechelen"
   ],
   "vereisten": "Diploma hoger secundair plus vakkennis; selectie via werkenvoor.be; statutair.",
   "knelpunt": "Niet",
   "loon": "Federaal C ongeveer €2.600 tot €2.900 plus premies",
   "fit": 4,
   "waarom": "Metaalwerk aanleren aan gedetineerden: diep zinvol, weekdagen, statuut. Vraagteken: gezag met lage assertiviteit.",
   "status": "verkennen"
  },
  {
   "id": "werkplaats-onderzoek",
   "domein": "reserve",
   "naam": "Werkplaats van universiteit of onderzoeksinstelling",
   "rollen": [
    "instrumentenmaker",
    "technicus mechanische werkplaats"
   ],
   "werkgevers": [
    "UAntwerpen",
    "KU Leuven instrumentenmakerij",
    "SCK CEN (Mol)",
    "VITO"
   ],
   "vereisten": "Technisch secundair of graduaat; interne opleiding.",
   "knelpunt": "Technicus ja",
   "loon": "Universiteit C ongeveer €2.500 tot €3.100; SCK €3.000 tot €3.800",
   "fit": 4,
   "waarom": "Wetenschappelijke cultuur beloont exactheid; universiteiten zijn de meest studievriendelijke werkgevers.",
   "status": "reserve"
  },
  {
   "id": "tekenwerk",
   "domein": "reserve",
   "naam": "Tekenaar, werkvoorbereider, CNC en lasrobot",
   "rollen": [
    "bouwkundig tekenaar",
    "BIM-modelleur",
    "tekenaar-werkvoorbereider metaalconstructie",
    "lasrobotprogrammeur"
   ],
   "werkgevers": [
    "metaalbouwbedrijven",
    "architecten- en ingenieursbureaus",
    "lasersnijbedrijven"
   ],
   "vereisten": "Graduaat Bouwkundig tekenen (2 jaar, OKOT vermoedelijk) of VDAB-cursus Tekla, SolidWorks, CNC (3 tot 6 maanden).",
   "knelpunt": "Ja, allemaal",
   "loon": "€2.600 tot €3.800",
   "fit": 5,
   "waarom": "Remi is al technisch tekenaar en werkvoorbereider: dit is zijn huidige vak zonder de fysieke last. Zittend, precies, stapelbaar met de studie; zwakker op dienstbaarheid tenzij bij een overheid of erfgoedbureau.",
   "status": "reserve"
  },
  {
   "id": "prototype",
   "domein": "reserve",
   "naam": "Prototypebouwer designmeubelen, maquettebouw",
   "rollen": [
    "prototypebouwer",
    "modelmaker",
    "maquettebouwer"
   ],
   "werkgevers": [
    "Tribu (Bilzen)",
    "Extremis",
    "Bulo (Mechelen)",
    "maquettebouwstudio's"
   ],
   "vereisten": "On-the-job; de ontwerpstudie is het verschil.",
   "knelpunt": "Niet",
   "loon": "€2.500 tot €3.200",
   "fit": 4,
   "waarom": "Versmelt metaalbewerking en tekenwerk met meubelontwerp; zwakker op stabiliteit en afstand.",
   "status": "reserve"
  },
  {
   "id": "kmda",
   "domein": "overheid",
   "naam": "Technische dienst ZOO Antwerpen en Planckendael (KMDA)",
   "rollen": [
    "technieker metaal",
    "onderhoudstechnieker atelier"
   ],
   "werkgevers": [
    "KMDA",
    "Plantentuin Meise"
   ],
   "vereisten": "Technisch secundair plus ervaring.",
   "knelpunt": "Onderhoudstechnicus ja",
   "loon": "Ongeveer €2.500 tot €3.100 (te verifiëren)",
   "fit": 4,
   "waarom": "Erfgoedinstelling in het centrum, kleine ploeg, tastbare betekenis; vacatures zeldzaam.",
   "status": "verkennen"
  },
  {
   "id": "kunstgieterij",
   "domein": "reserve",
   "naam": "Kunstgieterij en kunstenaarsateliers",
   "rollen": [
    "TIG-lasser brons",
    "ciseleur",
    "kunstenaarsassistent"
   ],
   "werkgevers": [
    "Art Casting (Oudenaarde)",
    "Studio Arne Quinze",
    "Studio Wim Delvoye"
   ],
   "vereisten": "On-the-job; brons TIG-lassen leer je in de gieterij.",
   "knelpunt": "Niet",
   "loon": "€2.400 tot €3.100, vaak projectmatig",
   "fit": 3,
   "waarom": "Artistiek en uitdagend, maar kleine privéstudio's botsen met de nood aan zekerheid. Gieterijen zijn stabieler.",
   "status": "reserve"
  },
  {
   "id": "tandtechnicus",
   "domein": "reserve",
   "naam": "Tandtechnicus",
   "rollen": [
    "tandtechnicus",
    "CAD/CAM-tandtechnicus"
   ],
   "werkgevers": [
    "tandtechnische labo's in de provincie"
   ],
   "vereisten": "Se-n-Se of SYNTRA (2 tot 3 jaar avond).",
   "knelpunt": "Vermoedelijk",
   "loon": "€2.300 tot €3.000",
   "fit": 4,
   "waarom": "Kleine stille labo's, precisie, indirecte dienstbaarheid; lager loon en langere omscholing.",
   "status": "reserve"
  },
  {
   "id": "erfgoedtransport",
   "domein": "geschiedenis",
   "naam": "Historische voertuigen, schepen, uurwerken, orgels",
   "rollen": [
    "restaurateur torenuurwerken",
    "scheepshersteller erfgoed",
    "orgelbouwer"
   ],
   "werkgevers": [
    "Michiels Torenuurwerken (Mechelen)",
    "Clock-o-Matic",
    "Orgelbouw Schumacher",
    "Watererfgoed Vlaanderen",
    "Stampe en Vertongen Museum (Deurne)",
    "Stoomtrein Dendermonde-Puurs"
   ],
   "vereisten": "Leren in het bedrijf; erfgoedverenigingen zijn bijna volledig vrijwillig.",
   "knelpunt": "Niet",
   "loon": "€2.300 tot €3.000 in kleine bedrijven; anders vrijwillig",
   "fit": 3,
   "waarom": "Diepe betekenis en precisie, maar betaalde plaatsen zijn zeldzaam. Uitstekend als vrijwilligerswerk naast een vaste job.",
   "status": "vrijwillig"
  },
  {
   "id": "event",
   "domein": "reserve",
   "naam": "Film, festival en pretpark",
   "rollen": [
    "decorbouwer film",
    "onderhoudstechnieker attracties"
   ],
   "werkgevers": [
    "Lites (Vilvoorde)",
    "Tomorrowland productie",
    "Bobbejaanland",
    "Plopsa"
   ],
   "vereisten": "Vakkennis; freelance-cultuur.",
   "knelpunt": "Niet",
   "loon": "Wisselend",
   "fit": 2,
   "waarom": "Onregelmatige uren en prikkelcultuur botsen met het profiel. Attractieonderhoud bij Bobbejaanland is de stabiele uitzondering.",
   "status": "laag"
  }
 ],
 "voorbeelden": {
  "inleiding": "Hier vind je voorbeelden van hoe mensen zichzelf beschrijven op een cv, op LinkedIn en in een gesprek. Het zijn voorbeelden om van te leren, geen teksten om over te nemen: de sterkste versie gebruikt je eigen woorden en je eigen feiten. Vervang alles tussen vierkante haakjes door wat echt gebeurde, en schrap wat niet klopt.",
  "profielen": [
   {
    "id": "restauratie",
    "doel": "Restauratie en monumentenzorg",
    "stijl": "ik-vorm",
    "tekst": "Sinds 2021 teken en maak ik maatwerk in plaatmateriaal, eerst als technisch tekenaar en plooi- en lasoperator, nu als verantwoordelijke atelier. Ik ben opgeleid in halfautomaat- en elektrodelassen en volg avondonderwijs aan de Academie in Antwerpen: na meubel en interieur en grafiek nu interieurvormgeving. Voor Willy Van de Perre bouwde ik een fotoarchief op, waarbij ik leerde ordenen en beschrijven. In restauratie wil ik die combinatie inzetten: begrijpen hoe iets gemaakt is, het nauwkeurig documenteren en pas dan ingrijpen, met respect voor [type erfgoed, bijvoorbeeld historisch metaalwerk of interieurerfgoed].",
    "waarom": "Het verbindt je drie sporen, metaal, Academie en archief, met wat restauratie vraagt: eerst begrijpen en documenteren, dan pas handelen."
   },
   {
    "id": "museumtechniek",
    "doel": "Museumtechniek en tentoonstellingsbouw",
    "stijl": "zonder onderwerp",
    "tekst": "Technisch tekenaar en verantwoordelijke atelier in de metaalbewerking, sinds 2021 actief in maatwerk in plaatmateriaal. Tekent werkstukken uit in [CAD-programma], plooit op de kantbank, last halfautomaat en elektrode en stuurt [aantal] collega's aan. Ontwerpt en bouwt daarnaast meubels [in metaal en hout, materiaal bevestigen], samen met zijn broer, en volgt avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Brengt technische precisie en gevoel voor ruimte en vorm samen, net wat sokkels, vitrines en tentoonstellingsopbouw vragen.",
    "waarom": "Het noemt de concrete technieken die een museumatelier zoekt en koppelt ze aan de objecten die daar gemaakt worden, zoals sokkels en vitrines."
   },
   {
    "id": "decoratelier",
    "doel": "Decoratelier theater of opera",
    "stijl": "ik-vorm",
    "tekst": "Ik teken, plooi en las maatwerk in plaatmateriaal en stuur sinds [jaar] het atelier aan waar ik in 2021 begon. Ik zet een ontwerp om in een tekening, een plooivolgorde en een stuk dat past. Naast mijn werk bouw ik meubels in [materiaal] en volg ik avondonderwijs interieurvormgeving aan de Academie in Antwerpen, na meubel en interieur en grafiek. In een decoratelier wil ik die combinatie van techniek en vormgeving inzetten, in een ploeg die samen naar een première toewerkt.",
    "waarom": "Het laat zien dat je van ontwerp naar afgewerkt stuk kunt gaan en dat je naast plaatwerk ook meubelbouw en vormgeving meebrengt, wat een decoratelier nodig heeft."
   },
   {
    "id": "archief",
    "doel": "Archief en collectiezorg",
    "stijl": "ik-vorm",
    "tekst": "In 2017 en 2018 bouwde ik een fotoarchief op voor [fotograaf of kunstenaar] Willy Van de Perre: [aantal] beelden ordenen, digitaliseren en beschrijven zodat ze terug te vinden zijn. Sinds 2021 werk ik in maatwerk in plaatmateriaal, eerst als technisch tekenaar, nu als verantwoordelijke atelier: ik controleer de stukken op maat en afwerking voor ze vertrekken. Aan de Academie in Antwerpen volg ik avondonderwijs, na onder meer een jaar grafiek. In archief- of collectiezorg wil ik die zorg voor ordening en detail inzetten voor stukken die bewaard moeten blijven.",
    "waarom": "Het opent met je meest relevante ervaring voor dit werkveld, ook al is die niet de recentste, en toont met één concreet detail hoe zorgvuldig je werkt."
   },
   {
    "id": "instructeur",
    "doel": "Instructeur of praktijkleraar",
    "stijl": "zonder onderwerp",
    "tekst": "Technisch tekenaar en verantwoordelijke atelier met ervaring in plooien op de kantbank, halfautomaat- en elektrodelassen en werkvoorbereiding, sinds 2021 in maatwerk in plaatmateriaal. Stuurt [aantal] collega's aan en [werkt nieuwe collega's in op de kantbank en aan de lastafel]. Kan uitleggen waarom een bewerking in een bepaalde volgorde gebeurt. Volgt zelf avondonderwijs aan de Academie in Antwerpen en weet hoe het is om na het werk te leren. Wil het vak doorgeven aan [cursisten, leerlingen in duaal leren of werkzoekenden] [en overweegt het educatief graduaat secundair onderwijs].",
    "waarom": "Het koppelt je vakkennis aan het overdragen ervan en gebruikt je eigen ervaring als avondstudent als troef om cursisten te begrijpen."
   },
   {
    "id": "tekenaar-erfgoed",
    "doel": "Technisch tekenaar in een erfgoed- of architectenbureau",
    "stijl": "ik-vorm",
    "tekst": "Ik ben technisch tekenaar in de plaatbewerking: sinds 2021 teken ik maatwerk uit in [CAD-programma] en maak ik het klaar voor productie. Als verantwoordelijke atelier zie ik elke dag hoe een tekening in de werkplaats wordt uitgevoerd, en daarom teken ik wat maakbaar is. In avondonderwijs aan de Academie in Antwerpen volg ik interieurvormgeving, na drie jaar meubel en interieur[, en ik werk ook in AutoCAD, Revit of ArchiCAD]. In een erfgoed- of architectenbureau wil ik [opmetingen, detailtekeningen of uitvoeringstekeningen] maken met oog voor het bestaande gebouw.",
    "waarom": "Het maakt van je ervaring in de werkplaats een troef voor tekenwerk: een tekenaar die de uitvoering kent, maakt minder fouten op papier."
   }
  ],
  "anderen": [
   {
    "wie": "Fictief voorbeeld: een lasser uit de staalbouw die na tien jaar decorbouwer werd in een theaterwerkplaats.",
    "tekst": "Tien jaar lang laste ik stalen constructies voor loodsen en bruggen, waar alles op de millimeter moest kloppen. In de decorwerkplaats bouw ik nu frames voor decors die elke avond opgebouwd en afgebroken worden, en die dus sterk en licht tegelijk moeten zijn. Ik vertaal de schetsen van de decorontwerper naar iets wat veilig op een scène staat. Uit de staalbouw bracht ik het lezen van werktekeningen en maatvast laswerk mee; hier leerde ik snel schakelen als een ontwerp de dag voor de première nog verandert.",
    "watWerkt": "Hij noemt wat hij meebracht en wat hij bijleerde, zodat de overstap logisch klinkt in plaats van toevallig."
   },
   {
    "wie": "Fictief voorbeeld: een technisch tekenaar uit een studiebureau die restauratiemedewerker werd in een atelier voor historisch schrijnwerk.",
    "tekst": "Acht jaar tekende ik technische installaties voor kantoorgebouwen in AutoCAD. Via een avondopleiding leerde ik oude houten ramen en deuren herstellen, en sinds twee jaar werk ik in een restauratieatelier voor historisch schrijnwerk. Ik meet elk raam op, teken de profielen en de schade uit en stel een behandelvoorstel op voor er iets vervangen wordt. Omdat tekenen mijn eerste vak was, maak ik in het atelier de opmetingen en de documentatie waarmee de architect en de erfgoedconsulent verder kunnen.",
    "watWerkt": "Ze laat zien hoe een oude vaardigheid, tekenen, in het nieuwe werk een eigen en herkenbare plaats krijgt."
   },
   {
    "wie": "Fictief voorbeeld: een schrijnwerker uit de interieurbouw die museumtechnicus werd.",
    "tekst": "Ik was twaalf jaar schrijnwerker in de interieurbouw, van keukens tot winkelinrichting. Nu bouw ik als museumtechnicus sokkels, vitrines en wanden voor tijdelijke tentoonstellingen, en help ik kunstwerken installeren onder begeleiding van de collectieregistrator. Ik ben gewend om met plannen te werken en op tijd op te leveren, en ik heb geleerd dat in een museum het object altijd voorgaat op het tempo. Wat ik bijleerde: klimaat, lichtsterkte en welke materialen niet in een vitrine mogen.",
    "watWerkt": "Hij toont dat hij de regels van het nieuwe werkveld kent, zoals klimaat en veilige materialen, en niet alleen zijn oude vak meebrengt."
   },
   {
    "wie": "Fictief voorbeeld: een onderhoudsmonteur uit de haven die instructeur werd in een opleidingscentrum voor technische beroepen.",
    "tekst": "Vijftien jaar onderhield ik pompen en kleppen in de haven, meestal in ploegen van drie of vier. Ik merkte dat ik graag nieuwe collega's inwerkte, en de ploegbaas vroeg mij daar steeds vaker voor. Nu geef ik les aan werkzoekenden die monteur willen worden, met korte uitleg en veel oefenen aan echte installaties. Ik weet uit ervaring waar beginners vastlopen, en daar stem ik mijn lessen op af.",
    "watWerkt": "Hij bewijst zijn talent voor lesgeven met een gewoonte uit zijn vorige job, in plaats van te zeggen dat hij graag met mensen werkt."
   },
   {
    "wie": "Fictief voorbeeld: een archiefmedewerker in een stadsarchief die vroeger boekbinder was.",
    "tekst": "Ik ben opgeleid als boekbinder en werkte zes jaar in een binderij voor bibliotheken. Sinds vier jaar werk ik in een stadsarchief, waar ik registers en kaarten inventariseer, verpak en klaarmaak voor digitalisering. Omdat ik weet hoe een boek gemaakt is, zie ik snel welke band nog een scan verdraagt en welke eerst naar de restaurator moet. Ik werk graag lang aan één reeks, en elke week stem ik af met de collega's van de leeszaal zodat bezoekers weten wat beschikbaar is.",
    "watWerkt": "Ze maakt duidelijk wat haar ambacht toevoegt aan het archief, met één precies voorbeeld dat een collega zonder die achtergrond niet zou zien."
   }
  ],
  "zinnen": [
   {
    "thema": "Nauwkeurigheid",
    "sterk": [
     "Ik controleer elk plooistuk op maat en haaksheid voor het naar de lastafel gaat.",
     "Bij het uittekenen in [CAD-programma] reken ik de uitslag en de plooivolgorde na voor er iets gesneden wordt.",
     "In het fotoarchief voor Willy Van de Perre beschreef ik elk beeld volgens [een vast systeem, bijvoorbeeld jaar, plaats en onderwerp], zodat [aantal] foto's terug te vinden zijn."
    ],
    "cliche": [
     "Ik ben zeer nauwkeurig en heb oog voor detail.",
     "Ik ben een perfectionist."
    ]
   },
   {
    "thema": "Samenwerken",
    "sterk": [
     "Met mijn broer ontwerp en bouw ik meubels: [hij neemt ... voor zijn rekening, ik ...], en over het ontwerp beslissen we samen.",
     "Wanneer een stuk in het atelier niet past zoals getekend, zoek ik met de collega aan de machine naar de oorzaak voor we iets aanpassen.",
     "Voor [project] stemde ik af met [de zaakvoerder, de klant of een collega] over [wat], zodat [resultaat]."
    ],
    "cliche": [
     "Ik ben een echte teamplayer.",
     "Ik kan met iedereen overweg."
    ]
   },
   {
    "thema": "Leren",
    "sterk": [
     "Naast mijn job volg ik sinds [jaar] avondonderwijs aan de Academie in Antwerpen: drie jaar meubel en interieur, een jaar grafiek en nu interieurvormgeving.",
     "Ik begon in 2021 als tekenaar en plooi- en lasoperator en groeide door tot verantwoordelijke van het atelier.",
     "In [jaar, rond 2020] volgde ik een lasopleiding halfautomaat en elektrode bij [VDAB, SYNTRA of school], en die technieken gebruik ik sindsdien in mijn job."
    ],
    "cliche": [
     "Ik ben leergierig.",
     "Ik sta open voor nieuwe uitdagingen."
    ]
   },
   {
    "thema": "Een ploeg aansturen",
    "sterk": [
     "Als verantwoordelijke atelier maak ik de planning voor [aantal] collega's en verdeel ik het werk [volgens wat ieder het best kan].",
     "Bij een nieuw of moeilijk stuk [overloop ik de tekening eerst met de collega die het zal maken].",
     "Sinds ik het atelier aanstuur, [concrete verandering, bijvoorbeeld: is er minder herwerk, of houden we elke ochtend een korte bespreking]."
    ],
    "cliche": [
     "Ik ben een geboren leider.",
     "Ik kan mensen goed motiveren."
    ]
   },
   {
    "thema": "Creativiteit",
    "sterk": [
     "Voor [meubelstuk] ontwierp ik [een onderstel of verbinding] in plaatstaal die [wat het oplost, bijvoorbeeld het meubel demonteerbaar maakt].",
     "In het fietsatelier maakte ik [voorbeeld van een fiets of onderdeel op maat] toen er geen standaardoplossing bestond.",
     "Voor [opdracht aan de Academie] werkte ik [idee] uit tot [schets, maquette of technische tekening]."
    ],
    "cliche": [
     "Ik ben heel creatief en denk out of the box.",
     "Ik zit vol ideeën."
    ]
   },
   {
    "thema": "Betrouwbaarheid",
    "sterk": [
     "Ik werk sinds 2021 bij dezelfde werkgever en kreeg er in [jaar] de verantwoordelijkheid voor het atelier.",
     "Als een leverdatum in gevaar komt, laat ik dat weten zodra ik het zie, niet op de dag zelf.",
     "Afspraken met klanten of collega's zet ik meteen [in de planning], zodat niets afhangt van mijn geheugen."
    ],
    "cliche": [
     "Ik ben honderd procent betrouwbaar.",
     "U kunt altijd op mij rekenen."
    ]
   },
   {
    "thema": "Rust onder druk",
    "sterk": [
     "Wanneer een dringende bestelling de planning omgooit, herschik ik eerst het werk in het atelier en overleg ik daarna met [de zaakvoerder] wat kan schuiven.",
     "Bij een fout in een reeks stop ik eerst en zoek ik de oorzaak, in plaats van sneller verder te werken.",
     "Als er veel tegelijk gebeurt, blijf ik kalm, en collega's komen dan vaak bij mij met [welke vragen]."
    ],
    "cliche": [
     "Ik ben stressbestendig.",
     "Ik werk het best onder druk."
    ]
   },
   {
    "thema": "Motivatie voor erfgoed",
    "sterk": [
     "Wat mij aantrekt in erfgoed, is dat ik eerst moet begrijpen hoe iets gemaakt is voor ik eraan mag werken.",
     "Door het fotoarchief voor Willy Van de Perre zag ik wat het betekent om iets zorgvuldig te bewaren en te beschrijven voor wie na mij komt.",
     "[Gebouw, object of museum] raakte mij omdat [reden], en aan dat soort werk wil ik bijdragen."
    ],
    "cliche": [
     "Ik heb altijd al een passie gehad voor geschiedenis.",
     "Werken in erfgoed is mijn droom."
    ]
   },
   {
    "thema": "Uitleggen aan anderen",
    "sterk": [
     "Wanneer een nieuwe collega [op de kantbank] begint, [doe ik een stuk voor en laat ik de collega het daarna zelf maken terwijl ik meekijk].",
     "Ik leg een tekening het liefst uit [met het stuk zelf erbij, niet alleen op het scherm].",
     "Omdat ik zelf avondonderwijs volg, weet ik hoe het is om na een werkdag iets nieuws te leren, en daar houd ik rekening mee."
    ],
    "cliche": [
     "Ik ben een geboren leraar.",
     "Ik werk graag met mensen."
    ]
   }
  ],
  "pitch": [
   {
    "duur": "30 seconden",
    "context": "Op een opendeurdag, een jobbeurs of wanneer je spontaan binnenloopt in een atelier en iemand vraagt wie je bent.",
    "tekst": "Ik ben Remi [Achternaam]. Sinds 2021 werk ik in een bedrijf voor maatwerk in plaatmateriaal, eerst als tekenaar en plooi- en lasoperator, nu als verantwoordelijke van het atelier. 's Avonds volg ik interieurvormgeving aan de Academie in Antwerpen, en met mijn broer bouw ik meubels [in metaal en hout, materiaal bevestigen]. Ik zoek werk waarin ik dat vakmanschap kan inzetten voor erfgoed of een museumatelier, en ik ben benieuwd hoe uw atelier werkt."
   },
   {
    "duur": "60 seconden",
    "context": "Bij de openingsvraag van een sollicitatiegesprek voor restauratie, een museumatelier of een decoratelier.",
    "tekst": "Ik ben technisch tekenaar en verantwoordelijke atelier bij een bedrijf in maatwerk in plaatmateriaal. Ik begon daar in 2021 als tekenaar en plooi- en lasoperator, dus ik ken het werk van tekening tot afgewerkt stuk. Sinds [jaar] stuur ik het atelier aan: ik maak de planning, verdeel het werk over [aantal] collega's en controleer de kwaliteit. Daarvoor bouwde ik een fotoarchief op voor Willy Van de Perre. Naast mijn werk volg ik [op welke avonden] interieurvormgeving aan de Academie in Antwerpen, en met mijn broer ontwerp en bouw ik meubels. Wat al die dingen verbindt, is dat ik graag begrijp hoe iets gemaakt is en het dan zorgvuldig maak of bewaar. Daarom solliciteer ik bij [organisatie]: hier kan ik dat vakmanschap inzetten voor [de collectie, de gebouwen of de decors]."
   },
   {
    "duur": "60 seconden",
    "context": "In een gesprek voor een job als instructeur, praktijkleraar of begeleider in een opleidingscentrum.",
    "tekst": "Sinds 2021 werk ik in de plaatbewerking, eerst als technisch tekenaar en plooi- en lasoperator, nu als verantwoordelijke van het atelier met [aantal] collega's. Ik volgde zelf een lasopleiding halfautomaat en elektrode, dus ik weet hoe het is om het vak van bij het begin te leren. In het atelier haal ik de meeste voldoening uit de momenten waarop ik [een nieuwe collega iets aanleer of een moeilijk stuk uitleg]. Daarnaast volg ik al enkele jaren avondonderwijs aan de Academie in Antwerpen, dus ik ken ook de kant van de cursist die na een werkdag nog iets nieuws leert. Die twee wil ik graag samenbrengen: het vak doorgeven, met geduld en met oog voor waar iemand vastloopt. [Mijn jaren in het atelier tellen mee als nuttige ervaring voor praktijkvakken, en ik overweeg het educatief graduaat secundair onderwijs.] Bij [organisatie] spreekt mij vooral [doelgroep of werking] aan."
   }
  ],
  "sterkteZwakte": [
   {
    "vraag": "Wat is uw grootste sterkte?",
    "antwoord": "Mijn grootste sterkte is zorgvuldigheid. Als tekenaar en verantwoordelijke atelier ken ik een werkstuk van de tekening tot de afwerking, en ik controleer [de stukken] voor ze vertrekken. Een voorbeeld is [maatwerkstuk], waarbij [wat er moeilijk was] en waarvoor ik [wat ik deed]. Het stuk werd [resultaat, bijvoorbeeld in één keer goedgekeurd door de klant].",
    "waarom": "Je noemt één sterkte, koppelt die aan je echte functie en bewijst ze met een voorbeeld in plaats van met extra bijvoeglijke naamwoorden."
   },
   {
    "vraag": "Wat is een werkpunt voor u?",
    "antwoord": "Ik ben van nature bescheiden en neem in een groep niet snel als eerste het woord. Vroeger betekende dat soms dat ik een goed idee of een bedenking voor mij hield. Nu [wat je er concreet aan doet, bijvoorbeeld: voor een overleg noteer ik de twee of drie punten die ik zeker wil aankaarten, en als iets mij dwarszit, spreek ik de persoon nadien apart aan]. Als verantwoordelijke atelier heb ik ook geleerd om duidelijk te zeggen wat er moet gebeuren, bijvoorbeeld [bij de planning of bij een kwaliteitsprobleem].",
    "waarom": "Het is een eerlijk werkpunt dat bij je testresultaten past (lage assertiviteit), en je eindigt bij wat je eraan doet in plaats van bij het probleem."
   },
   {
    "vraag": "Hoe zouden uw collega's u omschrijven?",
    "antwoord": "Ik denk dat ze zouden zeggen dat ik rustig blijf en dat ze met een vraag over een tekening of een moeilijk stuk bij mij terechtkunnen. [Een collega zei eens: ...] Ze weten ook dat wat ik afspreek, gebeurt. Misschien zouden ze erbij zeggen dat ik niet de luidste ben in de refter.",
    "waarom": "Je laat anderen spreken, verwijst naar een echte uitspraak als je die hebt, en eindigt met een lichte, eerlijke noot die past bij wie je bent."
   },
   {
    "vraag": "U hebt nog geen ervaring in [erfgoed, een museum of een theater]. Waarom zouden wij u kiezen?",
    "antwoord": "Het klopt dat ik nog niet in [sector] gewerkt heb. Wat ik wel meebreng, is ervaring sinds 2021 met tekenen, plooien en lassen van maatwerk, en de gewoonte om een stuk eerst te begrijpen voor ik eraan begin. Het fotoarchief voor Willy Van de Perre leerde mij zorgvuldig ordenen en beschrijven, en aan de Academie werk ik al jaren met ontwerp en materiaal. Wat ik nog moet leren over [bijvoorbeeld conservatienormen of het werken met collectiestukken], leer ik graag van ervaren collega's, en ik ben gewend om naast mijn werk te studeren.",
    "waarom": "Je erkent het gat zonder je te verontschuldigen, zet er drie concrete troeven tegenover en toont dat je weet wat je nog moet leren."
   }
  ],
  "starr": [
   {
    "titel": "Het atelier aansturen",
    "situatie": "In [jaar] werd ik verantwoordelijke van het atelier bij [naam bedrijf], een bedrijf in maatwerk in plaatmateriaal. Tot dan was ik zelf tekenaar en plooi- en lasoperator, naast de collega's die ik voortaan zou aansturen.",
    "taak": "Ik moest de planning en de werkverdeling voor [aantal] collega's op mij nemen en ervoor zorgen dat het werk op tijd en in orde vertrok, zonder dat de sfeer in de ploeg eronder leed.",
    "actie": "Ik [voerde een vaste werkwijze in, bijvoorbeeld een planningsbord of een korte ochtendbespreking]. Ik verdeelde het werk [hoe, bijvoorbeeld volgens wat ieder het best kan] en [wat ik deed bij moeilijke stukken, bijvoorbeeld de tekening vooraf overlopen met de collega die het zou maken]. Wanneer iets misliep, [hoe ik dat aanpakte]. [Wanneer er een nieuwe collega bijkwam: hoe ik die inwerkte, bijvoorbeeld een stuk voordoen en daarna laten meedraaien terwijl ik meekeek.]",
    "resultaat": "[Meetbaar resultaat, bijvoorbeeld minder herwerk, leveringen op tijd of een nieuwe collega die sneller zelfstandig werkte.]",
    "reflectie": "Ik leerde dat ik geen luide leidinggevende hoef te zijn om een ploeg goed te laten draaien: duidelijke afspraken en rust werken voor mij beter. Wat ik nog verder wil oefenen, is [een collega sneller aanspreken wanneer zijn werk niet goed is].",
    "competenties": [
     "leidinggeven-aan-een-klein-team",
     "plannen-en-organiseren",
     "communiceren",
     "verantwoordelijkheid-nemen",
     "kennis-overdragen"
    ]
   },
   {
    "titel": "Een moeilijk maatwerkstuk in plaat",
    "situatie": "[Klant of type opdracht] vroeg [welk stuk, bijvoorbeeld een behuizing of een trap in plaatstaal] met [wat het moeilijk maakte, bijvoorbeeld krappe maattoleranties, een ongewone plooivolgorde of dun materiaal dat vervormt bij het lassen].",
    "taak": "Ik moest het stuk uittekenen, de productie voorbereiden en het [zelf of met een collega] maken, zodat het in één keer zou passen bij [de klant of de montage].",
    "actie": "Ik tekende het stuk uit in [CAD-programma] en rekende de uitslag en de plooivolgorde na voor ik iets liet snijden. Ik maakte eerst [een proefstuk of één deel] om de plooien te controleren en paste de tekening aan waar nodig. Bij het lassen werkte ik [in korte stukken of met hechtpunten] om vervorming te beperken en controleerde ik de maten na elke stap.",
    "resultaat": "[Resultaat, bijvoorbeeld: het stuk paste bij de eerste montage, de klant bestelde opnieuw, of de werkwijze werd de standaard voor gelijkaardige stukken.]",
    "reflectie": "Een stuk vooraf goed doordenken spaart meer tijd dan het achteraf rechtzetten. Die gewoonte om eerst te begrijpen en pas dan te maken, neem ik mee naar [restauratie, een museumatelier of een decoratelier].",
    "competenties": [
     "technisch-inzicht",
     "ruimtelijk-inzicht",
     "nauwkeurigheid",
     "probleemoplossend-denken",
     "kwaliteitsgericht-werken"
    ]
   },
   {
    "titel": "Het fotoarchief voor Willy Van de Perre",
    "situatie": "In 2017 en 2018 bouwde ik een fotoarchief op voor Willy Van de Perre, [wie hij is, bijvoorbeeld fotograaf of kunstenaar]. Er waren [aantal] beelden, [in welke vorm, bijvoorbeeld negatieven, afdrukken of digitale bestanden], en [hoe ze bij de start bewaard werden].",
    "taak": "Ik moest de beelden ordenen, digitaliseren en beschrijven, zodat ze terug te vinden en bruikbaar zouden zijn [voor wie of waarvoor].",
    "actie": "Ik bedacht [een ordening, bijvoorbeeld per jaar en onderwerp] en hield die consequent aan. Ik [scande of fotografeerde] de beelden met [toestel of software] en gaf elk beeld een beschrijving met [welke gegevens, bijvoorbeeld datum, plaats en onderwerp]. Kwetsbare stukken behandelde ik [hoe, bijvoorbeeld met handschoenen of in aangepaste hoezen].",
    "resultaat": "[Resultaat, bijvoorbeeld een doorzoekbaar archief van zoveel beelden, gebruikt voor een publicatie, een tentoonstelling of verder beheer.]",
    "reflectie": "Ik ontdekte dat ik rustig en lang aan één systeem kan werken als ik weet waarvoor het dient. Dat is de houding die archief- en collectiewerk vraagt.",
    "competenties": [
     "documenteren-en-registreren",
     "nauwkeurigheid",
     "respect-voor-het-object",
     "zelfstandig-werken"
    ]
   },
   {
    "titel": "Het creatief fietsatelier",
    "situatie": "In 2019 werkte ik in [naam atelier], een creatief fietsatelier in [gemeente]. [Een klant of het atelier] vroeg [welke opdracht, bijvoorbeeld een fiets op maat of een herstelling waarvoor geen standaardonderdeel bestond].",
    "taak": "Ik moest [wat precies jouw opdracht was, bijvoorbeeld een oplossing vinden die veilig en betaalbaar was].",
    "actie": "Ik zocht uit [hoe het probleem in elkaar zat] en maakte [welke oplossing, bijvoorbeeld een aangepast onderdeel, een ombouw of een frame]. Ik overlegde met [de klant of de collega's] over [wat], en testte het resultaat voor de fiets terugging.",
    "resultaat": "[Resultaat: wat de klant ermee kon, of wat het atelier eraan had.]",
    "reflectie": "In het fietsatelier leerde ik oplossingen zoeken wanneer er geen standaardantwoord bestaat [en een klant uitleggen wat mogelijk is]. Dat komt terug in maatwerk en in restauratie.",
    "competenties": [
     "probleemoplossend-denken",
     "creativiteit-en-vormgeving",
     "dienstverlening",
     "flexibiliteit"
    ]
   },
   {
    "titel": "Een meubel met mijn broer",
    "situatie": "Samen met mijn broer ontwerp en bouw ik meubels [in metaal en hout, materiaal bevestigen]. Voor [voor wie, bijvoorbeeld onszelf, een familielid of een klant] maakten we [welk meubel].",
    "taak": "We moesten een ontwerp maken dat [functie en eisen, bijvoorbeeld stevig, demonteerbaar of binnen een bepaalde maat] was, en het met onze eigen middelen bouwen.",
    "actie": "Ik [maakte de technische tekening of deed het metaalwerk], mijn broer [deed ...]. We bespraken het ontwerp stap voor stap en [pasten het aan toen bleek dat ...]. Ik gebruikte wat ik aan de Academie leerde over [proportie, materiaal of afwerking].",
    "resultaat": "[Resultaat: het meubel, waar het nu staat, wat anderen ervan vonden, een foto voor het portfolio.]",
    "reflectie": "Samenwerken met iemand die ik goed ken, leerde mij dat een verschil van mening over een ontwerp meestal een beter stuk oplevert, als we het uitpraten. Dit meubel is ook een van de stukken voor mijn portfolio.",
    "competenties": [
     "creativiteit-en-vormgeving",
     "samenwerken",
     "ruimtelijk-inzicht",
     "resultaatgericht-werken"
    ]
   }
  ],
  "vertrekreden": [
   {
    "tekst": "Sinds 2021 werk ik in maatwerk in plaatmateriaal en ken ik het vak van tekening tot afgewerkt stuk. Ik wil die ervaring nu inzetten voor werk dat blijft, zoals erfgoed, collecties of een museumatelier. Mijn opleiding interieurvormgeving aan de Academie sluit daar ook beter bij aan.",
    "wanneer": "Als je solliciteert in erfgoed, restauratie of een museum en de vraag komt waarom je van job verandert."
   },
   {
    "tekst": "Als verantwoordelijke atelier merk ik dat [een nieuwe collega iets aanleren] mij de meeste voldoening geeft. Dat wil ik nu een grotere plaats geven in mijn job, als [instructeur of praktijkleraar].",
    "wanneer": "Bij een sollicitatie voor lesgeven, instructie of begeleiding in een opleidingscentrum of een school."
   },
   {
    "tekst": "Sinds mijn vertrek in [maand jaar] heb ik bewust de tijd genomen om mijn richting te bepalen. Ik weet nu dat ik mijn ervaring in tekenen, plooien en lassen wil inzetten voor [erfgoed, een museumatelier of het doorgeven van het vak], en ik ben volledig klaar om te starten.",
    "wanneer": "Als je solliciteert nadat je vertrokken bent en iemand vraagt wat je sinds [maand] gedaan hebt. Houd het bij deze twee zinnen: je hoeft geen reden te geven, en je spreekt nooit negatief over je vorige werkgever."
   }
  ],
  "linkedin": {
   "headlines": [
    "Technisch tekenaar en verantwoordelijke atelier | maatwerk in plaatmateriaal | student interieurvormgeving | Antwerpen",
    "Tekenen, plooien en lassen van maatwerk | meubelontwerp | interieurvormgeving aan de Academie in Antwerpen",
    "Van tekening tot afgewerkt stuk | plaatbewerking, meubelontwerp en archief | interesse in restauratie en collectiezorg"
   ],
   "info": "Ik wil begrijpen hoe iets gemaakt is voor ik eraan werk, of het nu een plooistuk, een meubel of een fotoarchief is. Sinds 2021 werk ik bij een bedrijf in maatwerk in plaatmateriaal, waar ik begon als technisch tekenaar en plooi- en lasoperator en nu verantwoordelijke atelier ben. Daarvoor bouwde ik een fotoarchief op voor [fotograaf of kunstenaar] Willy Van de Perre [naam alleen gebruiken als hij akkoord is] en werkte ik in een creatief fietsatelier. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen, nu interieurvormgeving na meubel en interieur en grafiek, en ontwerp en bouw ik meubels met mijn broer. Wat mij het meest boeit, is hoe vakmanschap en zorgvuldigheid bijdragen aan wat blijft: in restauratie en erfgoed, in museum- en theaterateliers, in archief en collecties, en in het doorgeven van het vak. Een selectie van mijn werk staat op [link naar portfolio]."
  }
 },
 "vragenlijst": {
  "inleiding": "Deze vragen zijn voor jou, Remi. Niets hoeft in één keer. Korte antwoorden zijn goed; een voorbeeld is beter dan een omschrijving. Alles wat je invult blijft op dit toestel tot je het exporteert of kopieert voor Giulia. Uit je antwoorden komen het cv, de brieven, de tekst voor VDAB en de keuzes voor de volgende stap.",
  "secties": [
   {
    "id": "praktisch",
    "titel": "Praktisch, voor het cv",
    "intro": "Feiten die op een cv of in een dossier moeten kloppen.",
    "vragen": [
     {
      "id": "p01",
      "vraag": "Volledige naam, geboortedatum en geboorteplaats",
      "type": "kort"
     },
     {
      "id": "p02",
      "vraag": "Adres, gsm-nummer en e-mailadres dat je voor sollicitaties wil gebruiken",
      "type": "kort"
     },
     {
      "id": "p03",
      "vraag": "Rijbewijs (B, ja of nee) en hoe je je verplaatst: fiets, openbaar vervoer, auto. Tot hoeveel minuten pendelen is haalbaar?",
      "type": "kort"
     },
     {
      "id": "p04",
      "vraag": "Talen en niveau: Nederlands, Frans, Engels, andere",
      "type": "kort"
     },
     {
      "id": "p05",
      "vraag": "Naam van je huidige werkgever, gemeente, en de startdatum van je contract (staat op het contract of de eerste loonfiche)",
      "type": "kort"
     },
     {
      "id": "p06",
      "vraag": "Wat staat er op je loonfiche: arbeider of bediende, en welk paritair comité (bijvoorbeeld 111, 200, 209)?",
      "hint": "Dit bepaalt gewaarborgd loon, vakantiegeld en eindejaarspremie.",
      "type": "kort"
     },
     {
      "id": "p07",
      "vraag": "Je functietitel volgens het contract, en wat je vandaag echt doet (tekenen, plooien, lassen, atelier aansturen, hoeveel collega's)",
      "type": "lang"
     },
     {
      "id": "p08",
      "vraag": "Welk tekenprogramma gebruik je (bijvoorbeeld SolidWorks, AutoCAD, Inventor, Tekla) en hoe goed?",
      "type": "kort"
     },
     {
      "id": "p09",
      "vraag": "Welke lasprocessen beheers je: halfautomaat (MIG/MAG), elektrode, TIG? Welke certificaten heb je, met norm en geldigheid?",
      "type": "lang"
     },
     {
      "id": "p10",
      "vraag": "Andere attesten: VCA, heftruck, hoogtewerker, EHBO, kantbank, andere",
      "type": "kort"
     },
     {
      "id": "p11",
      "vraag": "Je opleidingen precies: secundair (richting, school, jaar), lasopleiding (waar, wanneer), academie (welke richtingen, welke jaren, getuigschrift of diploma)",
      "type": "lang"
     },
     {
      "id": "p12",
      "vraag": "Katoen Natie: welke functie, welke afdeling, hoelang?",
      "type": "kort"
     },
     {
      "id": "p13",
      "vraag": "Het creatief fietsatelier: naam, wat je daar maakte of herstelde, een voorbeeld",
      "type": "kort"
     },
     {
      "id": "p14",
      "vraag": "Het fotoarchief voor Willy Van de Perre: wie is hij, hoeveel beelden, hoe heb je het aangepakt (ordenen, scannen, beschrijven, software)?",
      "type": "lang"
     },
     {
      "id": "p15",
      "vraag": "Welke werkstukken bestaan er in foto's: meubels, constructies, fietsen, tekeningen? Waar staan die foto's?",
      "hint": "Voor het portfolio: 6 tot 10 stukken met titel, jaar, materiaal, techniek.",
      "type": "lang"
     },
     {
      "id": "p16",
      "vraag": "Vanaf wanneer ben je beschikbaar, voltijds of deeltijds, en welke dagen of avonden zijn bezet door de academie?",
      "type": "kort"
     },
     {
      "id": "p17",
      "vraag": "Wat is je huidige brutoloon per maand, en wat heb je netto minimaal nodig om rond te komen?",
      "hint": "Dit is voor de keuze tussen uitkering, opleiding en werk, niet voor een cv.",
      "type": "kort"
     }
    ]
   },
   {
    "id": "werk",
    "titel": "Werk dat bij je past",
    "intro": "Concrete momenten zeggen meer dan eigenschappen.",
    "vragen": [
     {
      "id": "w01",
      "vraag": "Drie momenten op het werk waarop je dacht: dit is goed. Wat deed je precies?",
      "type": "lang"
     },
     {
      "id": "w02",
      "vraag": "Drie momenten waarop het echt niet ging. Wat gebeurde er?",
      "type": "lang"
     },
     {
      "id": "w03",
      "vraag": "Een project waar je trots op bent: wat, voor wie, wat was moeilijk, hoe heb je het opgelost?",
      "hint": "Dit wordt een regel op het cv en een voorbeeld in het gesprek.",
      "type": "lang"
     },
     {
      "id": "w04",
      "vraag": "Nog een project, liefst iets helemaal anders",
      "type": "lang"
     },
     {
      "id": "w05",
      "vraag": "Wat doe je het liefst in het atelier: tekenen, plooien, lassen, organiseren, uitleggen aan anderen? Zet ze in volgorde.",
      "type": "kort"
     },
     {
      "id": "w06",
      "vraag": "Wat is fysiek het zwaarst, en waar voel je dat (rug, schouders, handen, ogen, ademhaling)?",
      "hint": "Ook voor de huisarts.",
      "type": "kort"
     },
     {
      "id": "w07",
      "vraag": "Werk je liever alleen, met twee of drie, of in een grotere ploeg? Waarom?",
      "type": "kort"
     },
     {
      "id": "w08",
      "vraag": "Liever een klein bedrijf, een grote organisatie, een overheid, een vzw? Wat trekt je aan en wat schrikt af?",
      "type": "kort"
     },
     {
      "id": "w09",
      "vraag": "Wat zouden je collega's zeggen als iemand vraagt hoe het is om met jou te werken?",
      "type": "kort"
     },
     {
      "id": "w10",
      "vraag": "Wat heb je nodig van een baas of ploegbaas om goed te werken? En wat verdraag je niet?",
      "type": "kort"
     }
    ]
   },
   {
    "id": "sterktes",
    "titel": "Sterktes en werkpunten",
    "intro": "Eerlijk en met een voorbeeld; dit is geen sollicitatiegesprek.",
    "vragen": [
     {
      "id": "s01",
      "vraag": "Drie dingen waar je goed in bent, telkens met een voorbeeld",
      "type": "lang"
     },
     {
      "id": "s02",
      "vraag": "Drie dingen die je wil verbeteren of die je moeilijk vindt",
      "type": "lang"
     },
     {
      "id": "s03",
      "vraag": "Waarvoor komen mensen bij jou om hulp?",
      "type": "kort"
     },
     {
      "id": "s04",
      "vraag": "Hoe leer je het liefst: door te doen, te kijken, te lezen, uitleg te krijgen?",
      "type": "kort"
     },
     {
      "id": "s05",
      "vraag": "Hoe reageer je als er druk of stress is? Wat helpt dan?",
      "type": "kort"
     },
     {
      "id": "s06",
      "vraag": "Wanneer zeg je te weinig, en wanneer had je liever iets gezegd?",
      "hint": "De tests zeggen dat je niet snel op de voorgrond treedt; dit is om te weten waar dat je iets kost.",
      "type": "kort"
     },
     {
      "id": "s07",
      "vraag": "Wat weet je over jezelf dat niet in een test staat?",
      "type": "lang"
     }
    ]
   },
   {
    "id": "passies",
    "titel": "Passies en interesses",
    "intro": "Wat je doet als niemand het vraagt.",
    "vragen": [
     {
      "id": "i01",
      "vraag": "Waar gaat je aandacht naartoe buiten het werk: maken, lezen, kijken, sporten, mensen, plekken?",
      "type": "lang"
     },
     {
      "id": "i02",
      "vraag": "Welke gebouwen, objecten, musea of ateliers hebben je ooit geraakt, en waarom?",
      "type": "lang"
     },
     {
      "id": "i03",
      "vraag": "Als geld geen rol speelde: wat zou je een jaar lang maken of leren?",
      "type": "lang"
     },
     {
      "id": "i04",
      "vraag": "Van de sporen in de app (erfgoed en restauratie, culturele instellingen, lesgeven, sociaal en ecologisch, archief en archeologie): welke trekt het meest, welke het minst, en waarom?",
      "type": "lang"
     },
     {
      "id": "i05",
      "vraag": "Welk werkveld in de Verkenning verraste je positief, en welk zou je meteen schrappen?",
      "type": "kort"
     },
     {
      "id": "i06",
      "vraag": "Heb je ooit vrijwilligerswerk gedaan of iemand iets aangeleerd? Hoe was dat?",
      "type": "kort"
     },
     {
      "id": "i07",
      "vraag": "Wat zou je op de academie het liefst verder doen: meubel, interieur, grafiek, iets anders?",
      "type": "kort"
     }
    ]
   },
   {
    "id": "overstap",
    "titel": "De overstap",
    "intro": "Hier gaat het om keuzes voor de komende maanden.",
    "vragen": [
     {
      "id": "o01",
      "vraag": "Drie dingen die de volgende job zeker moet hebben",
      "type": "kort"
     },
     {
      "id": "o02",
      "vraag": "Drie dingen die je in de volgende job wil vermijden",
      "type": "kort"
     },
     {
      "id": "o03",
      "vraag": "Wil je opnieuw studeren? Zo ja: hoelang zou je dat volhouden (een jaar, twee, drie), overdag of in de avond, en wat trekt je: restauratie, tekenen, lesgeven, archief, iets anders?",
      "type": "lang"
     },
     {
      "id": "o04",
      "vraag": "Hoe voel je je nu: energie van 1 tot 10, slaap, zin om dingen te doen? Wat helpt je herstellen?",
      "type": "kort"
     },
     {
      "id": "o05",
      "vraag": "Hoeveel weken rust denk je nodig te hebben voor je ergens nieuw kunt beginnen?",
      "type": "kort"
     },
     {
      "id": "o06",
      "vraag": "Wat wil je dat Giulia doet in dit traject, en wat wil je liever zelf doen?",
      "type": "kort"
     },
     {
      "id": "o07",
      "vraag": "Wat houdt je tegen om iets te tekenen bij je werkgever, en wat zou je willen dat er in de plaats gebeurt?",
      "type": "lang"
     }
    ]
   },
   {
    "id": "gesprek",
    "titel": "Voor het gesprek",
    "intro": "Twee zinnen die je paraat wil hebben.",
    "vragen": [
     {
      "id": "g01",
      "vraag": "Hoe zeg je in twee zinnen waarom je weggaat, zonder het over vermoeidheid of je werkgever te hebben?",
      "hint": "Bijvoorbeeld: na vijf jaar plaatbewerking wil ik mijn vakmanschap inzetten voor werk dat blijft, zoals erfgoed of museumateliers.",
      "type": "lang"
     },
     {
      "id": "g02",
      "vraag": "Welke vraag zou jij aan een werkgever stellen om te weten of je er past?",
      "type": "kort"
     },
     {
      "id": "g03",
      "vraag": "Wie kan als referentie dienen (een collega, een klant, een docent) en mag je die naam gebruiken?",
      "type": "kort"
     }
    ]
   }
  ]
 },
 "zelftests": {
  "werkwaarden": {
   "inleiding": "Werkwaarden zijn de dingen die werk voor jou de moeite waard maken, los van de functietitel. Als je weet wat voor jou zwaar weegt, kun je vacatures sneller schiften en in een gesprek beter uitleggen waarom een job bij je past. Er zijn geen goede of foute antwoorden.",
   "instructie": "Kies eerst de vijf waarden die voor jou het zwaarst wegen en daarna de drie die je het minst belangrijk vindt; de rest laat je open.",
   "kies": {
    "top": 5,
    "minst": 3
   },
   "waarden": [
    {
     "id": "zekerheid",
     "naam": "Zekerheid",
     "uitleg": "Een vast contract bij een stabiele werkgever en weten waar je over een jaar staat."
    },
    {
     "id": "betekenis",
     "naam": "Betekenis",
     "uitleg": "Werk dat ertoe doet voor mensen of voor iets dat groter is dan het bedrijf."
    },
    {
     "id": "vakmanschap",
     "naam": "Vakmanschap",
     "uitleg": "Een vak tot in de details beheersen en werk afleveren dat technisch klopt en lang meegaat."
    },
    {
     "id": "creativiteit",
     "naam": "Creativiteit",
     "uitleg": "Zelf oplossingen, vormen of ontwerpen bedenken in plaats van alleen uit te voeren."
    },
    {
     "id": "rust",
     "naam": "Rust",
     "uitleg": "Een kalme werkplek zonder constante drukte, lawaai of haast."
    },
    {
     "id": "afwisseling",
     "naam": "Afwisseling",
     "uitleg": "Verschillende taken en projecten, zodat de ene week niet op de andere lijkt."
    },
    {
     "id": "leren",
     "naam": "Leren",
     "uitleg": "Blijven bijleren op het werk, via collega's, opleidingen of nieuwe opdrachten."
    },
    {
     "id": "autonomie",
     "naam": "Autonomie",
     "uitleg": "Zelf bepalen hoe je je werk aanpakt en in welke volgorde."
    },
    {
     "id": "teamgevoel",
     "naam": "Teamgevoel",
     "uitleg": "Een kleine ploeg die elkaar kent, vertrouwt en helpt."
    },
    {
     "id": "erkenning",
     "naam": "Erkenning",
     "uitleg": "Merken dat anderen zien en waarderen wat je doet."
    },
    {
     "id": "loon",
     "naam": "Loon",
     "uitleg": "Een goed loon en extralegale voordelen, zoals maaltijdcheques en een hospitalisatieverzekering, waarmee je netto comfortabel rondkomt."
    },
    {
     "id": "fysiek-licht",
     "naam": "Fysiek licht werk",
     "uitleg": "Werk dat je lichaam niet elke dag zwaar belast."
    },
    {
     "id": "tastbaar",
     "naam": "Iets tastbaars maken",
     "uitleg": "Aan het eind van de dag iets zien of vastnemen dat er 's morgens nog niet was."
    },
    {
     "id": "helpen",
     "naam": "Anderen helpen",
     "uitleg": "Mensen vooruithelpen, hun iets aanleren of een probleem voor hen oplossen."
    },
    {
     "id": "orde",
     "naam": "Orde en structuur",
     "uitleg": "Duidelijke afspraken, een vaste planning en weten wat er van je verwacht wordt."
    },
    {
     "id": "schoonheid",
     "naam": "Schoonheid",
     "uitleg": "Werken met of aan dingen die mooi zijn en waarbij vorm ertoe doet."
    },
    {
     "id": "uitdaging",
     "naam": "Uitdaging",
     "uitleg": "Moeilijke problemen die je echt moet uitpluizen voor je ze kunt oplossen."
    },
    {
     "id": "vrije-tijd",
     "naam": "Vrije tijd",
     "uitleg": "Genoeg tijd en energie naast het werk voor de academie, eigen projecten en de mensen rond je."
    },
    {
     "id": "nabijheid",
     "naam": "Nabijheid",
     "uitleg": "Een werkplek dicht bij huis, zodat je weinig tijd verliest aan pendelen."
    },
    {
     "id": "erfgoed",
     "naam": "Erfgoed bewaren",
     "uitleg": "Meehelpen om objecten, gebouwen of verhalen uit het verleden te bewaren voor later."
    }
   ]
  },
  "kernkwadranten": {
   "inleiding": "Het kernkwadrant is een model van de Nederlandse organisatieadviseur Daniel Ofman. Het vertrekt van een kernkwaliteit: iets wat zo vanzelf bij je hoort dat je het zelf nauwelijks opmerkt, maar dat anderen wel in je zien. Elke kwaliteit heeft een keerzijde als je ze overdrijft, en de vier hoeken samen tonen waar je sterk bent, waarin je doorslaat, waarin je kunt groeien en wat je bij anderen stoort. De drie voorbeelden hieronder zijn vermoedens op basis van je tests; jij beslist of ze kloppen, en je past ze aan of vervangt ze door je eigen kwadranten.",
   "uitleg": {
    "kwaliteit": "Een eigenschap die typisch voor jou is en die anderen in je waarderen, bijvoorbeeld zorgvuldigheid.",
    "valkuil": "Wat er gebeurt als je die kwaliteit overdrijft, te veel van het goede, bijvoorbeeld perfectionisme.",
    "uitdaging": "Het positieve tegenovergestelde van je valkuil, iets wat je kunt bijleren zonder je kwaliteit te verliezen, bijvoorbeeld flexibiliteit.",
    "allergie": "Het teveel van je uitdaging en tegelijk het omgekeerde van je kwaliteit, wat je bij anderen snel stoort, bijvoorbeeld slordigheid."
   },
   "voorbeelden": [
    {
     "kwaliteit": "Zorgvuldigheid",
     "valkuil": "Perfectionisme, blijven nakijken en lang twijfelen voor je iets vrijgeeft",
     "uitdaging": "Flexibiliteit: op tijd beslissen met wat je weet en aanvaarden dat goed genoeg soms volstaat",
     "allergie": "Slordigheid en afgeraffeld werk",
     "toelichting": "Hypothese, na te gaan door jou: in je Big Five staan plichtsbesef en behoedzaamheid op het maximum (20). Je ordelijkheid is laag (9), dus je zorgvuldigheid zit waarschijnlijk in het werkstuk zelf en niet in een opgeruimde werkbank. Herken je dat je een stuk liever nog eens nakijkt dan dat je het te vroeg doorgeeft, en dat werk dat half af is je stoort?"
    },
    {
     "kwaliteit": "Bescheidenheid",
     "valkuil": "Te weinig zeggen, je eigen werk en je mening wegcijferen",
     "uitdaging": "Zelfbewustheid: rustig en duidelijk zeggen wat je kunt, wat je denkt en wat je nodig hebt",
     "allergie": "Opschepperij en haantjesgedrag",
     "toelichting": "Hypothese, na te gaan door jou: je assertiviteit is zeer laag (7) en je scoort hoog op samenwerking, vertrouwen en altruïsme. Herken je dat je zwijgt in een overleg terwijl je het antwoord weet, en dat luide of opschepperige collega's je irriteren? De uitdaging is niet luider worden, maar je punt één keer helder maken."
    },
    {
     "kwaliteit": "Verbeeldingskracht",
     "valkuil": "Zweverigheid: in je hoofd al verder zijn dan anderen kunnen volgen, zodat een idee vaag blijft voor wie mee moet werken",
     "uitdaging": "Realiteitszin: een idee vroeg concreet maken in een schets, tekening of maquette, zodat anderen kunnen meedenken",
     "allergie": "Bekrompenheid, 'dat hebben we altijd zo gedaan'",
     "toelichting": "Hypothese, na te gaan door jou: je openheid is hoog (artistieke interesse 19, intellect 18, verbeelding 16) en je INFJ-uitslag wijst op iemand die mogelijkheden en patronen ziet. Herken je dat je een idee al helemaal ziet voordat je het met iemand deelt, en dat vastgeroeste gewoontes je storen?"
    }
   ],
   "aantalInvullen": 3,
   "gesprekTip": "Op de vraag naar een werkpunt noem je een echte valkuil met een concreet voorbeeld en wat je eraan doet, bijvoorbeeld uit je kwadrant over bescheidenheid: 'Ik neem in een overleg niet snel als eerste het woord. Daarom noteer ik vooraf de twee of drie punten die ik zeker wil aankaarten.' Kies een valkuil die geen kernvereiste van de functie raakt, en vermijd perfectionisme als werkpunt: veel werkgevers horen daarin een verkapte sterkte."
  },
  "energie": {
   "inleiding": "Niet alles wat je goed kunt, geeft je ook energie. Geef bij elke activiteit aan wat ze met je doet: kost ze energie of krijg je er net energie van? Denk aan echte werkdagen en avonden, niet aan hoe het zou moeten zijn. Het resultaat helpt je kiezen welke taken in je volgende job de hoofdmoot mogen zijn en welke hooguit een klein deel.",
   "schaal": [
    {
     "waarde": -2,
     "label": "Kost veel energie"
    },
    {
     "waarde": -1,
     "label": "Kost wat energie"
    },
    {
     "waarde": 0,
     "label": "Neutraal"
    },
    {
     "waarde": 1,
     "label": "Geeft wat energie"
    },
    {
     "waarde": 2,
     "label": "Geeft veel energie"
    }
   ],
   "activiteiten": [
    {
     "id": "cad-tekenen",
     "naam": "Technisch tekenen op de computer"
    },
    {
     "id": "schetsen",
     "naam": "Met de hand schetsen of tekenen"
    },
    {
     "id": "plooien",
     "naam": "Plooien aan de kantbank"
    },
    {
     "id": "lassen",
     "naam": "Lassen"
    },
    {
     "id": "atelier-plannen",
     "naam": "Het atelier plannen"
    },
    {
     "id": "aansturen",
     "naam": "Collega's aansturen"
    },
    {
     "id": "klant",
     "naam": "Een klant te woord staan"
    },
    {
     "id": "kwaliteit",
     "naam": "Werkstukken nakijken en de kwaliteit controleren"
    },
    {
     "id": "meubels-ontwerpen",
     "naam": "Meubels ontwerpen"
    },
    {
     "id": "meubels-bouwen",
     "naam": "Meubels bouwen met je broer"
    },
    {
     "id": "herstellen",
     "naam": "Iets herstellen dat kapot of versleten is"
    },
    {
     "id": "fietsen",
     "naam": "Fietsen bouwen of herstellen"
    },
    {
     "id": "fotos",
     "naam": "Foto's ordenen en beschrijven"
    },
    {
     "id": "aanleren",
     "naam": "Iemand iets aanleren"
    },
    {
     "id": "stilte",
     "naam": "In stilte alleen werken"
    },
    {
     "id": "uitpluizen",
     "naam": "Een probleem uitpluizen"
    },
    {
     "id": "inlezen",
     "naam": "Je inlezen in een techniek, een materiaal of een stuk geschiedenis"
    },
    {
     "id": "overleg",
     "naam": "Overleggen in een groep of vergadering"
    },
    {
     "id": "voorstellen",
     "naam": "Je eigen werk voorstellen aan anderen"
    },
    {
     "id": "academie",
     "naam": "Lessen volgen aan de academie"
    }
   ]
  },
  "feedback": {
   "inleiding": "Anderen zien vaak sterktes die je zelf vanzelfsprekend vindt. Vraag drie tot vijf mensen die je in verschillende situaties kennen om feedback, bijvoorbeeld een oud-collega of een collega die je vertrouwt, een vriend, je broer en een docent van de academie. Wat meerdere mensen los van elkaar zeggen, kun je naast je eigen beeld en je tests leggen en gebruiken voor je cv en je gesprekken.",
   "bericht": "Hoi [naam], ik ben bezig met de volgende stap in mijn loopbaan en werk aan een nieuw cv. Daarvoor vraag ik aan een paar mensen die me goed kennen hoe zij mij zien. Zou je kort en eerlijk willen antwoorden op de vijf vragen hieronder? Een paar zinnen per vraag is genoeg, en een concreet voorbeeld helpt het meest. Wat minder goed gaat mag je ook zeggen, daar heb ik het meeste aan. Als het lukt graag tegen [datum]. Alvast bedankt, Remi",
   "vragen": [
    "Waarin ben ik volgens jou echt goed? Geef als het kan een moment waarop je dat zag.",
    "Waarvoor zou je mij om hulp vragen, en waarvoor niet?",
    "Welk soort werk of welke werkplek zie je mij over een paar jaar doen, en waarom?",
    "Wat zou ik beter kunnen doen of meer mogen durven?",
    "Welke drie woorden passen volgens jou het best bij mij?"
   ],
   "tip": "Stuur het bericht apart naar elke persoon en niet in een groep, zodat niemand de antwoorden van een ander leest. Aan een collega van je huidige werk stuur je het pas als je vertrek bekend is, of je kiest een oud-collega of iemand die je volledig vertrouwt; wat bij meerdere mensen terugkomt, zijn de sterktes die je met een gerust hart op je cv zet."
  },
  "talen": {
   "inleiding": "Het Europees Referentiekader (ERK) is de Europese standaard om taalniveaus te beschrijven, van A1 voor een beginner tot C2 voor iemand die een taal volledig beheerst. Werkgevers, VDAB en Europass gebruiken dezelfde codes, dus een niveau als B1 of B2 zegt meer dan 'goed' of 'basis'. Schat voor elke taal de vijf vaardigheden apart in: vaak lees je een taal beter dan je ze spreekt, en op je cv mag je dat verschil tonen.",
   "niveaus": [
    {
     "code": "A1",
     "label": "Basisgebruiker, beginner",
     "kort": "Je begrijpt en gebruikt vertrouwde woorden en heel eenvoudige zinnen."
    },
    {
     "code": "A2",
     "label": "Basisgebruiker, elementair",
     "kort": "Je redt je in eenvoudige, dagelijkse situaties met korte zinnen."
    },
    {
     "code": "B1",
     "label": "Onafhankelijke gebruiker, drempel",
     "kort": "Je begrijpt en bespreekt vertrouwde onderwerpen uit werk, school en vrije tijd."
    },
    {
     "code": "B2",
     "label": "Onafhankelijke gebruiker, gevorderd",
     "kort": "Je praat vlot met moedertaalsprekers en volgt ook complexere teksten over je vak."
    },
    {
     "code": "C1",
     "label": "Vaardige gebruiker, zeer goed",
     "kort": "Je gebruikt de taal soepel en precies, ook op het werk en in een opleiding."
    },
    {
     "code": "C2",
     "label": "Vaardige gebruiker, beheersing",
     "kort": "Je begrijpt vrijwel alles moeiteloos en drukt je heel nauwkeurig uit."
    }
   ],
   "vaardigheden": [
    {
     "id": "luisteren",
     "naam": "Luisteren",
     "beschrijvingen": {
      "A1": "Je herkent vertrouwde woorden en zinnen als men traag en duidelijk spreekt.",
      "A2": "Je begrijpt korte, duidelijke berichten over dagelijkse zaken.",
      "B1": "Je begrijpt de hoofdpunten van duidelijke taal over werk, school en vrije tijd.",
      "B2": "Je volgt langere uiteenzettingen en de meeste films en tv-programma's.",
      "C1": "Je volgt lange gesprekken, ook als de structuur niet duidelijk is.",
      "C2": "Je begrijpt alle gesproken taal, ook in een hoog tempo."
     }
    },
    {
     "id": "lezen",
     "naam": "Lezen",
     "beschrijvingen": {
      "A1": "Je begrijpt bekende namen, woorden en heel eenvoudige zinnen, zoals op borden en affiches.",
      "A2": "Je vindt informatie in eenvoudige teksten zoals advertenties, menu's en dienstregelingen.",
      "B1": "Je begrijpt teksten in alledaagse taal of over je werk, en persoonlijke brieven.",
      "B2": "Je leest artikels en verslagen waarin de schrijver een standpunt inneemt.",
      "C1": "Je begrijpt lange, complexe teksten en technische handleidingen, ook buiten je vakgebied.",
      "C2": "Je leest moeiteloos alle soorten teksten, ook abstracte teksten en vaktaal."
     }
    },
    {
     "id": "gesprekken",
     "naam": "Gesprekken voeren",
     "beschrijvingen": {
      "A1": "Je voert een eenvoudig gesprek als de ander traag praat en je helpt.",
      "A2": "Je redt je in korte gesprekken over vertrouwde onderwerpen en dagelijkse taken.",
      "B1": "Je praat zonder voorbereiding mee over vertrouwde onderwerpen zoals werk en hobby's.",
      "B2": "Je praat vlot en spontaan met moedertaalsprekers en verdedigt je standpunt.",
      "C1": "Je drukt je vlot uit op het werk en in sociale situaties, zonder zichtbaar naar woorden te zoeken.",
      "C2": "Je neemt moeiteloos deel aan elk gesprek en brengt fijne betekenisverschillen over."
     }
    },
    {
     "id": "spreken",
     "naam": "Spreken",
     "beschrijvingen": {
      "A1": "Je beschrijft met eenvoudige zinnen waar je woont en wie je kent.",
      "A2": "Je vertelt in een reeks korte zinnen over je familie, je opleiding en je werk.",
      "B1": "Je vertelt een verhaal of de inhoud van een film en licht kort je mening toe.",
      "B2": "Je geeft een duidelijke, gedetailleerde uitleg over onderwerpen uit je vakgebied.",
      "C1": "Je stelt complexe onderwerpen helder voor en rondt je uitleg goed af.",
      "C2": "Je geeft een vloeiende, goed opgebouwde uiteenzetting die bij elk publiek past."
     }
    },
    {
     "id": "schrijven",
     "naam": "Schrijven",
     "beschrijvingen": {
      "A1": "Je vult een formulier in met je naam, adres en nationaliteit.",
      "A2": "Je schrijft korte berichten en een heel eenvoudige persoonlijke brief.",
      "B1": "Je schrijft een eenvoudige, samenhangende tekst over vertrouwde onderwerpen.",
      "B2": "Je schrijft een duidelijk verslag of een brief waarin je een standpunt onderbouwt.",
      "C1": "Je schrijft heldere, goed opgebouwde teksten over complexe onderwerpen.",
      "C2": "Je schrijft vlot complexe brieven, verslagen of artikels in een passende stijl."
     }
    }
   ]
  },
  "externeTests": [
   {
    "id": "16personalities",
    "naam": "16Personalities",
    "wat": "Een persoonlijkheidstest die je indeelt in een van zestien types, losjes gebaseerd op het model van Myers-Briggs.",
    "duur": "ongeveer 10 tot 12 minuten",
    "kost": "gratis",
    "url": "https://www.16personalities.com/",
    "status": "gedaan",
    "verificatie": "bevestigd",
    "waarom": "Je uitslag INFJ geeft woorden voor hoe je patronen ziet en aanvoelt wat een groep nodig heeft; gebruik die uitslag als taal voor jezelf, niet als argument op een cv."
   },
   {
    "id": "schein",
    "naam": "Loopbaanankers van Schein",
    "wat": "Een vragenlijst over acht drijfveren in je loopbaan, zoals uitdaging, dienstbaarheid, levensstijl en zekerheid.",
    "duur": "[afhankelijk van de versie]",
    "kost": "[afhankelijk van de site of begeleider waar je de test deed]",
    "url": "",
    "status": "gedaan",
    "verificatie": "te verifiëren",
    "waarom": "Je dominante ankers, zuivere uitdaging (83) en dienstbaarheid (80), zijn het kompas om vacatures te schiften: moeilijk werk dat er echt toe doet."
   },
   {
    "id": "bigfive",
    "naam": "Big Five (IPIP-NEO-120)",
    "wat": "Een wetenschappelijk onderbouwde persoonlijkheidstest die vijf domeinen en dertig facetten meet, met een score van 4 tot 20 per facet.",
    "duur": "ongeveer 15 minuten, 120 vragen",
    "kost": "gratis, open source, ook in het Nederlands",
    "url": "https://bigfive-test.com/",
    "status": "gedaan",
    "verificatie": "bevestigd",
    "waarom": "Dit is de best onderbouwde van je tests; plichtsbesef en behoedzaamheid (20) en assertiviteit (7) verklaren waarom brandweer afviel en erfgoedwerk goed past."
   },
   {
    "id": "holland",
    "naam": "Holland-code (RIASEC)",
    "wat": "Een interessetest die zes interessegebieden meet, Realistisch, Onderzoekend, Artistiek, Sociaal, Ondernemend en Conventioneel, met een score van 0 tot 32 per gebied.",
    "duur": "ongeveer 10 minuten, 48 vragen",
    "kost": "gratis, in het Engels",
    "url": "https://openpsychometrics.org/tests/RIASEC/",
    "status": "gedaan",
    "verificatie": "bevestigd",
    "waarom": "Je code ISA wijst naar onderzoekend werk met een sociale en artistieke kant, en Ondernemend 7 verklaart waarom verkoop en zelfstandig ondernemen nu niet trekken."
   },
   {
    "id": "via",
    "naam": "VIA-karaktersterktes (VIA Character Strengths)",
    "wat": "Een vragenlijst die 24 karaktersterktes voor jou rangschikt, zoals eerlijkheid, voorzichtigheid, liefde voor leren en oog voor schoonheid.",
    "duur": "10 tot 15 minuten",
    "kost": "gratis rangschikking; uitgebreide rapporten zijn betalend",
    "url": "https://www.viacharacter.org/",
    "status": "aanbevolen",
    "verificatie": "bevestigd",
    "waarom": "Je ziet of voorzichtigheid, liefde voor leren en oog voor schoonheid bovenaan staan, zoals je Big Five doet vermoeden, en die woorden kun je gebruiken voor je kernkwadranten en je profieltekst."
   },
   {
    "id": "vdab-interessetest",
    "naam": "VDAB-interessetest (Oriënt)",
    "wat": "Een test van VDAB die je vragen en beroepen voorlegt en op basis van je antwoorden passende beroepen voorstelt.",
    "duur": "ongeveer 10 minuten",
    "kost": "gratis",
    "url": "https://orientatie.vdab.be/",
    "status": "aanbevolen",
    "verificatie": "bevestigd",
    "waarom": "De test vertaalt je interesses naar beroepsnamen zoals VDAB ze gebruikt, en dat zijn precies de zoektermen voor vacatures en opleidingen in Vlaanderen."
   },
   {
    "id": "vdab-jobbereik",
    "naam": "VDAB Jobbereik",
    "wat": "Een hulpmiddel van VDAB dat je vaardigheden inventariseert en toont welke beroepen je nu al kunt doen of met wat bijscholing.",
    "duur": "ongeveer 20 minuten (schatting)",
    "kost": "gratis",
    "url": "https://jobbereik.vdab.be/",
    "status": "aanbevolen",
    "verificatie": "bevestigd",
    "waarom": "Je vaardigheden als tekenaar, lasser en atelierverantwoordelijke worden er vertaald naar andere beroepen, wat helpt om je cv in de taal van een nieuwe sector te schrijven."
   },
   {
    "id": "vdab-taaltest",
    "naam": "VDAB-taaltest (Frans, Engels en andere talen)",
    "wat": "Een online test van VDAB die zich aan je antwoorden aanpast en je lees-, luister- en schrijfvaardigheid in een vreemde taal meet.",
    "duur": "gemiddeld 35 minuten",
    "kost": "gratis; je vraagt de test aan met je rijksregisternummer",
    "url": "https://www.vdab.be/opleidingen/test-je-vaardigheden/taaltesten",
    "status": "aanbevolen",
    "verificatie": "bevestigd",
    "waarom": "Op je cv staat Frans nog als [basis of beter]; met deze test ken je je echte niveau, handig voor jobs in Brussel of bij het KIK-IRPA, al werkt de federale overheid voor een officieel taalattest met haar eigen taaltests via werkenvoor.be."
   },
   {
    "id": "europass-erk",
    "naam": "Europass-zelfbeoordelingsrooster (ERK)",
    "wat": "Het officiële rooster van het Europees Referentiekader waarmee je per vaardigheid zelf je taalniveau van A1 tot C2 bepaalt.",
    "duur": "ongeveer 15 minuten per taal",
    "kost": "gratis",
    "url": "https://europass.europa.eu/system/files/2020-05/CEFR%20self-assessment%20grid%20NL.pdf",
    "status": "optioneel",
    "verificatie": "bevestigd",
    "waarom": "Het is dezelfde schaal als de taaloefening in deze app, zodat je talen op je cv staan in codes die elke werkgever kent."
   },
   {
    "id": "werkenvoor-demo",
    "naam": "Demotests van werkenvoor.be (federale overheid)",
    "wat": "Oefenversies van de computertests die de federale overheid bij selecties gebruikt, zoals abstract redeneren en situationeel beoordelen.",
    "duur": "10 tot 20 minuten per demo (schatting)",
    "kost": "gratis",
    "url": "https://werkenvoor.be/nl/solliciteren/selectietesten/testinhoud",
    "status": "optioneel",
    "verificatie": "bevestigd",
    "waarom": "Solliciteer je bij het KIK-IRPA of een andere federale instelling, dan krijg je zulke tests meestal in de eerste ronde, en met je diploma secundair oefen je best de demo's voor niveau C."
   },
   {
    "id": "onderwijskiezer-iprefer",
    "naam": "Onderwijskiezer I-Prefer",
    "wat": "Een belangstellingstest met 140 activiteiten die je interesses koppelt aan richtingen in het hoger onderwijs.",
    "duur": "ongeveer een half uur, in één keer in te vullen",
    "kost": "gratis",
    "url": "https://www.onderwijskiezer.be/iprefer/",
    "status": "optioneel",
    "verificatie": "bevestigd",
    "waarom": "De test is gemaakt voor laatstejaars secundair, maar helpt als je een graduaat of bachelor overweegt, bijvoorbeeld de bachelor conservatie-restauratie, het graduaat bouwkundig tekenen of het educatief graduaat secundair onderwijs om les te geven."
   },
   {
    "id": "loopbaancheque",
    "naam": "Loopbaanbegeleiding met een VDAB-loopbaancheque",
    "wat": "Vier uur begeleiding door een erkende loopbaanbegeleider, die tests met je afneemt of je bestaande uitslagen samen met jou duidt.",
    "duur": "vier uur, één cheque; volledig op te nemen binnen zes maanden na toekenning",
    "kost": "€90, eenmalig; alleen als je nog nooit een loopbaancheque gebruikte",
    "url": "https://www.vdab.be/orienteren/loopbaanbegeleiding/alles-over-je-loopbaancheque",
    "status": "optioneel",
    "verificatie": "bevestigd",
    "waarom": "Een erkende begeleider kan al je uitslagen samenleggen tot één richting, maar je moet de cheque aanvragen zolang je nog werkt, en VDAB toont bij de aanvraag of je de zeven jaar werkervaring haalt, wat bij jou nipt is; lukt dat niet, dan krijg je als werkzoekende gratis loopbaanoriëntatie bij VDAB."
   }
  ]
 },
 "gegenereerd": [
  {
   "slug": "kmska-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, meubelmaker, student interieurvormgeving",
    "profiel": "Ik ben sinds 2021 technisch tekenaar bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal; ik begon als tekenaar en plooi- en lasoperator en ben nu verantwoordelijke van het atelier. Ik teken werkstukken uit, bereid het werk voor, plooi en las (halfautomaat en elektrode) en sta in voor afwerking en kwaliteitscontrole. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen: eerst drie jaar meubel en interieur en een jaar grafiek, nu interieurvormgeving; met mijn broer bouw ik meubels. Voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat geduld en een vaste methode vraagt. In het team tentoonstellingsproductie en museumtechnieken van het KMSKA wil ik die combinatie van tekenen, maken en zorgvuldig werken inzetten voor de collectie en de tentoonstellingen van het museum.",
    "vaardigheden": [
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Meubelontwerp en -bouw [materialen bevestigen: metaal en hout]",
     "Werkvoorbereiding en aansturing van een atelier",
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Archiveren en digitaliseren van beeldmateriaal",
     "Fietstechniek: bouw en herstel"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nKMSKA, Koninklijk Museum voor Schone Kunsten Antwerpen\nT.a.v. [naam contactpersoon], [functie]\nLeopold De Waelplaats [huisnummer]\n2000 Antwerpen\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als technisch medewerker tentoonstellingsproductie en museumtechnieken\n\nGeachte mevrouw, geachte heer,\n\n[Eén zin over hoe Remi het KMSKA leerde kennen, bijvoorbeeld een bezoek aan het Open restauratieatelier of aan de tentoonstelling of het project dat hij zag, en welk detail hem aansprak.] Het KMSKA heeft sinds 1999 een eigen restauratieatelier en een eigen team voor tentoonstellingsproductie en museumtechnieken. In zo'n huis komen vakmanschap en zorg voor de collectie samen. Daarom schrijf ik u spontaan aan.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaat- en elektrodelassen, en stuur nu het atelier aan. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen: eerst drie jaar meubel en interieur en een jaar grafiek, nu interieurvormgeving. Met mijn broer bouw ik meubels.\n\nIk wil mijn vakmanschap inzetten voor erfgoed en ontwerp. In uw team voor tentoonstellingsproductie en museumtechnieken komt mijn achtergrond het best van pas: wat in een museumzaal komt te staan, moet precies uitgetekend, degelijk gemaakt en met zorg rond de kunstwerken geplaatst worden.\n\nIk breng drie dingen mee. Als tekenaar zet ik elke dag een vraag om in een werktekening waarmee het atelier verder kan, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Als verantwoordelijke van het atelier plan ik het werk en volg ik het op met mijn collega's, zodat een opdracht klaar is zoals afgesproken. En voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat geduld en een vaste methode vraagt.\n\nIk kom graag kennismaken tijdens een kort werkbezoek aan uw team en toon daarbij mijn werkstukken. Vanaf januari 2027 is ook een beroepsverkennende stage van enkele dagen via VDAB mogelijk. Mag ik u vragen mij op de hoogte te houden van toekomstige selecties voor een technische functie op niveau C in dat team?\n\nIk licht mijn kandidatuur graag toe in een gesprek. In bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: sollicitaties@kmska.be\n\nOnderwerp: Spontane sollicitatie - technisch medewerker tentoonstellingsproductie en museumtechnieken - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met een opleiding in halfautomaat- en elektrodelassen, en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Ik wil mijn vakmanschap inzetten voor erfgoed en ontwerp, en schrijf u daarom spontaan aan voor een functie als technisch medewerker in uw team tentoonstellingsproductie en museumtechnieken.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar]. Ik kom graag kennismaken tijdens een kort werkbezoek aan uw team. Vanaf januari 2027 is ook een beroepsverkennende stage van enkele dagen via VDAB mogelijk.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "KMSKA, Koninklijk Museum voor Schone Kunsten Antwerpen",
    "functie": "Technisch medewerker tentoonstellingsproductie en museumtechnieken",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://kmska.be/nl/jobs",
    "contact": "[naam contactpersoon]",
    "email": "sollicitaties@kmska.be"
   }
  },
  {
   "slug": "mhka-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, maker, student interieurvormgeving",
    "profiel": "Sinds 2021 werk ik bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal, eerst als technisch tekenaar en plooi- en lasoperator, nu als technisch tekenaar en verantwoordelijke van het atelier. Ik teken werkstukken uit, bereid het werk voor, plooi en las (halfautomaat en elektrode) en sta in voor afwerking en kwaliteitscontrole, zodat ik een stuk ken van tekening tot afwerking. Naast mijn werk volg ik interieurvormgeving in het avondonderwijs aan de Academie in Antwerpen, na drie jaar meubel en interieur en een jaar grafiek; met mijn broer bouw ik meubels. Voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat geduld, een vaste methode en zorg voor beeld vraagt. In het productieteam van het M HKA wil ik die combinatie van tekenen, maken en zorgvuldigheid inzetten voor de opbouw van tentoonstellingen.",
    "vaardigheden": [
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Meubelontwerp en -bouw in metaal en hout",
     "Werkvoorbereiding en aansturing van een atelier",
     "Archiveren en digitaliseren van beeldmateriaal",
     "Fietstechniek: bouw en herstel",
     "Ruimtelijk en structureel denken, sterk in wiskunde"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nM HKA, Museum van Hedendaagse Kunst Antwerpen\nT.a.v. mevrouw Katrien Geets, HR\nLeuvenstraat 32\n2000 Antwerpen\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als technisch medewerker productie\n\nGeachte mevrouw Geets,\n\n[Alleen als Remi het echt zag: In het M HKA zag ik [tentoonstelling of project dat Remi zag]; daarbij viel mij op [hoe een werk getoond, opgehangen of opgebouwd was]. Anders: In het M HKA werken productie- en AV-techniekers aan de opbouw van tentoonstellingen.] Als maker kijk ik in een museum ook naar wat de bezoeker niet ziet: de sokkels, de wanden en de constructies die een werk laten staan zoals de kunstenaar het bedoelt. Aan dat werk wil ik meebouwen. Daarom stel ik mij spontaan kandidaat als technisch medewerker productie.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaat- en elektrodelassen, en stuur nu het atelier aan. Naast mijn werk volg ik interieurvormgeving in het avondonderwijs aan de Academie in Antwerpen, na drie jaar meubel en interieur en een jaar grafiek. Met mijn broer bouw ik meubels.\n\nVoor uw productieteam breng ik drie dingen mee. Ik zet een vraag om in een werktekening en een planning waarmee een atelier verder kan, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Ik maak zelf: ik plooi, las en werk af, en ik weet uit het atelier hoe plaatmateriaal zich gedraagt als een stuk stevig en strak afgewerkt moet zijn. En ik ga zorgvuldig om met beeld: voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat geduld en een vaste methode vraagt.\n\nIk stel voor om kort kennis te maken tijdens een werkbezoek, of om enkele dagen mee te helpen bij de opbouw van een tentoonstelling via een beroepsverkennende stage van VDAB. Een start in januari of februari 2027 is voor mij mogelijk. Mag ik u ook vragen mij op de hoogte te houden van selecties voor technische functies op niveau C in productie of tentoonstellingsopbouw?\n\nIk licht mijn kandidatuur graag toe in een gesprek. In bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: katrien.geets@muhka.be (of via de spontane sollicitatie op https://muhka.careersite.be/nl)\n\nOnderwerp: Spontane sollicitatie - technisch medewerker productie - Remi [Achternaam]\n\nGeachte mevrouw Geets,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met een opleiding in halfautomaat- en elektrodelassen, en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. De opbouw van tentoonstellingen in het M HKA sluit aan bij wat ik wil doen: tekenen, maken en zorgvuldig werken in dienst van de kunst. Daarom stel ik mij spontaan kandidaat als technisch medewerker productie.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar]. Graag kom ik kennismaken tijdens een kort werkbezoek, of help ik enkele dagen mee bij de opbouw van een tentoonstelling via een beroepsverkennende stage van VDAB. Een start in januari of februari 2027 is voor mij mogelijk.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "M HKA, Museum van Hedendaagse Kunst Antwerpen",
    "functie": "Technisch medewerker productie",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://muhka.careersite.be/nl",
    "contact": "Katrien Geets (HR)",
    "email": "katrien.geets@muhka.be"
   }
  },
  {
   "slug": "middelheim-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, maker in metaal, student interieurvormgeving",
    "profiel": "Ik ben sinds 2021 technisch tekenaar bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal; ik begon als tekenaar en plooi- en lasoperator en ben nu verantwoordelijke van het atelier. Ik teken werkstukken uit, bereid het werk voor, plooi en las (halfautomaat en elektrode) en sta in voor afwerking en kwaliteitscontrole. Naast mijn werk studeer ik in het avondonderwijs aan de Academie in Antwerpen: na drie jaar meubel en interieur en een jaar grafiek volg ik nu interieurvormgeving; met mijn broer bouw ik meubels. Eerder ordende en digitaliseerde ik een fotoarchief voor Willy Van de Perre. Bij het Middelheimmuseum wil ik mijn kennis van metaal en mijn zorgvuldigheid inzetten voor het technische onderhoud van de sculpturen in de buitenlucht.",
    "vaardigheden": [
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Werkvoorbereiding en aansturing van een atelier",
     "Archiveren en digitaliseren van beeldmateriaal",
     "Meubelontwerp en -bouw in metaal en hout",
     "Fietstechniek: bouw en herstel"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nMiddelheimmuseum\nT.a.v. [naam contactpersoon], [collectie- of technische dienst]\nMiddelheimlaan 61\n2020 Antwerpen\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als technisch assistent (niveau C) voor het onderhoud van de sculpturen\n\nGeachte mevrouw, geachte heer,\n\nHet Middelheimmuseum toont beeldhouwkunst in de open lucht. [Concreet beeld of tentoonstelling in het park dat Remi zag, en wat hem daarin aansprak.] Metalen sculpturen die buiten staan, vragen voortdurend onderhoud en conservatie. Aan dat technische onderhoud wil ik mijn vakmanschap bijdragen, en daarom schrijf ik u spontaan aan.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik metaal van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaat- en elektrodelassen [TIG bevestigen]; nu stuur ik het atelier aan. Naast mijn werk studeer ik in het avondonderwijs aan de Academie in Antwerpen: na drie jaar meubel en interieur en een jaar grafiek volg ik nu interieurvormgeving. Met mijn broer bouw ik meubels.\n\nVoor uw collectie- of technische ploeg breng ik drie troeven mee. Materiaalkennis: ik weet hoe metaal zich gedraagt bij plooien en lassen en welke afwerking het vraagt, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Zorgvuldigheid: ik sta in voor afwerking en kwaliteitscontrole en werk graag aan stukken die lang moeten meegaan. Ordening: voor Willy Van de Perre bouwde ik een fotoarchief op, en als tekenaar werk ik dagelijks met precieze tekeningen en maten.\n\nIk heb een diploma secundair onderwijs Wetenschappen-Wiskunde (Sint-Lutgardis, 2017). Ik weet dat de vacatures van de stad via job.antwerpen.be verlopen. Ik zou het op prijs stellen als u mijn kandidatuur bijhoudt en mij op de hoogte brengt van toekomstige selecties voor een technische functie op niveau C in het Middelheimmuseum of een ander stedelijk museum. Graag kom ik ook kennismaken in een kort gesprek met de collectie- of technische ploeg over het onderhoud van de sculpturen, of tijdens een werkbezoek.\n\nIn bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: middelheimmuseum@antwerpen.be\n\nOnderwerp: Spontane sollicitatie - technisch assistent (niveau C), onderhoud van de sculpturen - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nMetalen sculpturen in de buitenlucht vragen voortdurend onderhoud en conservatie, en aan dat technische onderhoud wil ik mijn vakmanschap bijdragen. Als technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met ervaring in plooien en lassen (halfautomaat en elektrode), en als student interieurvormgeving aan de Academie in Antwerpen, stel ik mij kandidaat voor een technische functie in het Middelheimmuseum.\n\nIk heb een diploma secundair onderwijs en weet dat de vacatures van de stad via job.antwerpen.be verlopen. Ik zou het op prijs stellen als u mijn kandidatuur aan de collectie- of technische ploeg bezorgt en mij op de hoogte brengt van toekomstige selecties op niveau C. Graag kom ik ook kennismaken in een kort gesprek of tijdens een werkbezoek.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "Middelheimmuseum",
    "functie": "Technisch assistent (niveau C), onderhoud van de sculpturen",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://job.antwerpen.be/",
    "contact": "[naam contactpersoon]",
    "email": "middelheimmuseum@antwerpen.be"
   }
  },
  {
   "slug": "monumentenwacht-antwerpen-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, student interieurvormgeving",
    "profiel": "Ik ben sinds 2021 technisch tekenaar bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal. Ik begon als tekenaar en plooi- en lasoperator en ben nu verantwoordelijke van het atelier. Ik teken werkstukken uit, plooi en las (halfautomaat en elektrode) en weet daardoor hoe metalen onderdelen gemaakt en verbonden worden. Voor Willy Van de Perre bouwde ik een fotoarchief op, en naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen: drie jaar meubel en interieur, een jaar grafiek en nu interieurvormgeving. Die combinatie van nauwkeurig tekenen, materiaalkennis en systematisch vastleggen wil ik inzetten als monumentenwachter: historische gebouwen inspecteren, hun toestand helder beschrijven en eigenaars goed adviseren.",
    "vaardigheden": [
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Archiveren en digitaliseren van beeldmateriaal",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Werkvoorbereiding en aansturing van een atelier",
     "Meubelontwerp en -bouw in metaal en hout",
     "Fietstechniek: bouw en herstel"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nMonumentenwacht Antwerpen\nProvincie Antwerpen, Dienst Erfgoed\nT.a.v. [naam contactpersoon], [functie]\nRuggeveldlaan 99\n2100 Deurne\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als monumentenwachter\n\nGeachte mevrouw, geachte heer,\n\n[Eén zin over hoe Remi Monumentenwacht Antwerpen leerde kennen: een gebouw, een inspectie die hij zag of een gesprek.] Uw monumentenwachters inspecteren historische gebouwen, leggen hun toestand vast in verslagen met tekeningen en adviseren de eigenaars. Uw vacature voor een monumentenwachter duurzaamheid, met een praktijkproef ter plaatse, toonde mij bovendien dat u het vak in de praktijk toetst, en dat spreekt mij aan. Daarom schrijf ik u spontaan aan.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik teken uit, plooi en las (halfautomaat en elektrode) en stuur het atelier aan. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen: drie jaar meubel en interieur, een jaar grafiek en nu interieurvormgeving. Samen met mijn broer bouw ik meubels.\n\nHet werk van een monumentenwachter vraagt wat mij het meest aanspreekt: nauwkeurig kijken, begrijpen hoe iets gebouwd is en dat helder vastleggen, zodat een eigenaar weet wat er moet gebeuren. Ik wil mijn vakmanschap inzetten voor erfgoed, en bij uw dienst gebeurt dat heel direct: op en in de gebouwen zelf.\n\nIk breng drie dingen mee. Als tekenaar zet ik elke dag een vraag om in een tekening waarmee anderen kunnen werken; dat is ook de kern van een goed verslag. Doordat ik zelf plooi en las, weet ik hoe metalen onderdelen gemaakt en verbonden worden. En voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat geduld en een vaste methode vraagt.\n\n[Eén zin over werken op hoogte en op ladders: ervaring of bereidheid tot opleiding bevestigen.] Ik zou graag in een kort infogesprek of tijdens een werkbezoek horen welke instapmogelijkheden er zijn voor iemand met een achtergrond in metaal en tekenen. Met mijn diploma secundair onderwijs Wetenschappen-Wiskunde kom ik in aanmerking voor functies op niveau C. Mag ik u ook vragen mij op de hoogte te houden van toekomstige selecties op niveau C bij Monumentenwacht Antwerpen?\n\nIn bijlage vindt u mijn cv en een beknopt portfolio.\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv, portfolio\n",
   "mail": "Aan: monumentenwacht@provincieantwerpen.be\n\nOnderwerp: Spontane sollicitatie - monumentenwachter - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Ik wil mijn vakmanschap inzetten voor erfgoed en schrijf u daarom spontaan aan voor een functie als monumentenwachter bij Monumentenwacht Antwerpen.\n\nIn bijlage vindt u mijn motivatiebrief, mijn cv en een beknopt portfolio. Ik zou graag in een kort infogesprek of tijdens een werkbezoek horen welke instapmogelijkheden er zijn voor iemand met een achtergrond in metaal en tekenen. Mag ik u ook vragen mij op de hoogte te houden van toekomstige selecties op niveau C?\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\n\nBijlagen: motivatiebrief (pdf), cv (pdf), portfolio (pdf)\n",
   "meta": {
    "organisatie": "Monumentenwacht Antwerpen",
    "functie": "Monumentenwachter",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://jobs.provincieantwerpen.be/",
    "contact": "[naam contactpersoon] (algemeen nummer 03 203 67 80)",
    "email": "monumentenwacht@provincieantwerpen.be"
   }
  },
  {
   "slug": "onroerend-erfgoed-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke, met ervaring in archivering en maatwerk",
    "profiel": "Ik ben technisch tekenaar en verantwoordelijke van het atelier bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal, sinds 2021; ik begon er als tekenaar en plooi- en lasoperator. Ik teken werkstukken uit, bereid het werk voor en sta in voor afwerking en kwaliteitscontrole. Eerder bouwde ik een fotoarchief op voor Willy Van de Perre, waarvoor ik beelden ordende en digitaliseerde. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen (drie jaar meubel en interieur, een jaar grafiek, nu interieurvormgeving) en bouw ik meubels met mijn broer. Als depotmedewerker bij het Agentschap Onroerend Erfgoed wil ik die zorgvuldigheid, materiaalkennis en zin voor ordening inzetten voor het bewaren van erfgoed.",
    "vaardigheden": [
     "Archiveren en digitaliseren van beeldmateriaal",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Werkvoorbereiding en aansturing van een atelier",
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Meubelontwerp en -bouw, samen met mijn broer ([materialen bevestigen])",
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Fietstechniek: bouw en herstel"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nAgentschap Onroerend Erfgoed\nT.a.v. [naam contactpersoon], [dienst of functie]\n[Adres]\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als depotmedewerker (niveau C)\n\nGeachte mevrouw, geachte heer,\n\nIk las dat het Agentschap Onroerend Erfgoed spontane kandidaturen verwelkomt. [Concrete haak: een monument, project of publicatie van het agentschap dat Remi kent of bezocht, en wat hem daarin aansprak.] Ik zoek werk waarin vakmanschap, nauwkeurigheid en betekenis samenkomen. In de zorg voor erfgoed vind ik die drie terug. Daarom stel ik mij kandidaat als depotmedewerker.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaat- en elektrodelassen, en stuur nu het atelier aan. Eerder bouwde ik een fotoarchief op voor Willy Van de Perre. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen: drie jaar meubel en interieur, een jaar grafiek en nu interieurvormgeving. Met mijn broer bouw ik meubels.\n\nIn een depot telt wat ook in mijn atelier telt: nauwkeurig werken, alles terugvindbaar houden en zorgvuldig omgaan met materiaal. Ik noem drie troeven. Zorgvuldigheid: in het atelier sta ik in voor afwerking en kwaliteitscontrole, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Plannen en organiseren: ik bereid het werk voor en verdeel het over [aantal] collega's. Ordening: voor het fotoarchief ordende en digitaliseerde ik [omvang: aantal beelden en werkwijze].\n\nMet mijn diploma secundair onderwijs Wetenschappen-Wiskunde (Sint-Lutgardis, 2017) kom ik in aanmerking voor functies op niveau C. Ik begrijp dat uw selecties via werkenvoorvlaanderen.be verlopen. Ik zou het op prijs stellen als u mijn cv bijhoudt en mij op de hoogte brengt van toekomstige selecties voor depotmedewerker of een gelijkaardige functie op dat niveau. Ik kom ook graag kennismaken in een kort gesprek of tijdens een werkbezoek.\n\nIn bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: vacatures@onroerenderfgoed.be\n\nOnderwerp: Spontane sollicitatie - depotmedewerker (niveau C) - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk las dat het Agentschap Onroerend Erfgoed spontane kandidaturen verwelkomt. Als technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met ervaring in het opbouwen van een fotoarchief en als student interieurvormgeving aan de Academie in Antwerpen, stel ik mij kandidaat als depotmedewerker.\n\nMet mijn diploma secundair onderwijs kom ik in aanmerking voor functies op niveau C. Ik begrijp dat uw selecties via werkenvoorvlaanderen.be verlopen. Ik zou het op prijs stellen als u mijn cv bijhoudt en mij op de hoogte brengt van toekomstige selecties voor depotmedewerker of een gelijkaardige functie op dat niveau.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar]. Ik licht mijn kandidatuur graag toe in een kort gesprek.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "Agentschap Onroerend Erfgoed",
    "functie": "Depotmedewerker (niveau C)",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://www.onroerenderfgoed.be/vacatures",
    "contact": "[naam contactpersoon]",
    "email": "vacatures@onroerenderfgoed.be"
   }
  },
  {
   "slug": "opera-ballet-vlaanderen-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, lasser, maker in metaal en hout, student interieurvormgeving",
    "profiel": "Sinds 2021 werk ik bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal: ik begon als tekenaar en plooi- en lasoperator en ben nu technisch tekenaar en verantwoordelijke van het atelier. Ik teken werkstukken uit, bereid het werk voor, plooi en las (halfautomaat en elektrode) en sta in voor afwerking en kwaliteitscontrole. Als verantwoordelijke van het atelier plan ik het werk en volg ik het op met mijn collega's. Aan de Academie in Antwerpen volgde ik in avondonderwijs drie jaar meubel en interieur en een jaar grafiek, en nu volg ik er interieurvormgeving; met mijn broer bouw ik meubels in metaal en hout. In het decoratelier van Opera Ballet Vlaanderen wil ik als decorbouwer metaal die combinatie van tekenen, maken en ontwerp inzetten voor de decors van opera en ballet.",
    "vaardigheden": [
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Werkvoorbereiding en aansturing van een atelier",
     "Meubelontwerp en -bouw in metaal en hout",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Fietstechniek: bouw en herstel",
     "Archiveren en digitaliseren van beeldmateriaal"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nOpera Ballet Vlaanderen\nT.a.v. [naam contactpersoon], [functie, bijvoorbeeld hoofd decoratelier]\nDecoratelier, Baaikensstraat 2C\n9240 Zele\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als decorbouwer metaal\n\nGeachte mevrouw, geachte heer,\n\n[Eén zin over hoe Remi Opera Ballet Vlaanderen leerde kennen, bijvoorbeeld een voorstelling of een decor dat hij zag, en welk detail hem aansprak.] Opera Ballet Vlaanderen bouwt zijn decors in een eigen decoratelier in Zele en heeft een eigen Set Design Studio. Daar komen ontwerp, tekenen en metaalbewerking samen, en dat is het werk dat ik zoek. Daarom schrijf ik u spontaan aan.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaat- en elektrodelassen [TIG bevestigen], en stuur nu het atelier aan. Naast mijn werk volgde ik in avondonderwijs aan de Academie in Antwerpen drie jaar meubel en interieur en een jaar grafiek; nu volg ik er interieurvormgeving. Met mijn broer bouw ik meubels.\n\nIk breng drie dingen mee. Een decor vertrekt van een ontwerp, en als tekenaar zet ik een vraag om in een werktekening waarmee het atelier verder kan, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Doordat ik zelf plooi en las, weet ik hoe een metalen constructie gemaakt en verbonden wordt. En als verantwoordelijke van het atelier plan ik het werk en volg ik het op met mijn collega's, zodat een opdracht klaar is op de afgesproken dag. [Eén zin over de verplaatsing naar Zele: rijbewijs B en vervoer bevestigen.]\n\nIk kom graag kennismaken tijdens een kort werkbezoek aan uw decoratelier, of vanaf januari 2027 tijdens een beroepsverkennende stage van enkele dagen via VDAB, en toon daarbij mijn werkstukken. Een start in januari of februari 2027 is voor mij mogelijk, eventueel via een individuele beroepsopleiding (IBO) van VDAB. Mag ik u ook vragen mij op de hoogte te houden van vacatures in het decoratelier?\n\nIk licht mijn kandidatuur graag toe in een gesprek. In bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: [e-mailadres personeelsdienst of decoratelier, op te vragen via https://www.operaballet.be/nl/contact]\n\nOnderwerp: Spontane sollicitatie - decorbouwer metaal - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met een opleiding in halfautomaat- en elektrodelassen, en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Omdat Opera Ballet Vlaanderen zijn decors in een eigen decoratelier in Zele bouwt, schrijf ik u spontaan aan voor een functie als decorbouwer metaal.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar]. Ik kom graag kennismaken tijdens een kort werkbezoek aan het decoratelier, of vanaf januari 2027 tijdens een beroepsverkennende stage van enkele dagen via VDAB.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "Opera Ballet Vlaanderen",
    "functie": "Decorbouwer metaal (decoratelier Zele)",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://www.operaballet.be/nl/werken-bij-opera-ballet-vlaanderen",
    "contact": "[naam contactpersoon] (via https://www.operaballet.be/nl/contact)",
    "email": "[e-mailadres personeelsdienst of decoratelier, op te vragen via https://www.operaballet.be/nl/contact]"
   }
  },
  {
   "slug": "smego-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, lasser en meubelmaker",
    "profiel": "Ik ben sinds 2021 technisch tekenaar bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal; ik begon als tekenaar en plooi- en lasoperator en ben nu verantwoordelijke van het atelier. Ik teken werkstukken uit, bereid het werk voor, plooi en las (halfautomaat en elektrode) en sta in voor afwerking en kwaliteitscontrole. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen, nu interieurvormgeving, na drie jaar meubel en interieur en een jaar grafiek; met mijn broer bouw ik meubels. Voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat geduld en een vaste methode vraagt. Bij Smego Metaalwerken wil ik die kennis van metaal, tekening en afwerking inzetten voor de restauratie van historisch metaalwerk en het restauratievak in de praktijk leren.",
    "vaardigheden": [
     "Plooien op de kantbank, halfautomaat- en elektrodelassen [TIG bevestigen], plaatwerk",
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Meubelontwerp en -bouw in metaal en hout",
     "Werkvoorbereiding en aansturing van een atelier",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Archiveren en digitaliseren van beeldmateriaal",
     "Fietstechniek: bouw en herstel"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nSmego Metaalwerken\nT.a.v. [naam contactpersoon], [functie]\nHoge Mauw 500\n2370 Arendonk\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als restauratiemedewerker metaal\n\nGeachte mevrouw, geachte heer,\n\nSmego Metaalwerken restaureert historisch metaalwerk; tot uw projecten behoort de restauratie van de poort aan het Falconplein in Antwerpen. [Concrete haak: wat Remi van die restauratie of van een ander project op smego.be zag, en welk detail hem aansprak.] Ik wil mijn vakmanschap in metaal inzetten voor erfgoed, en in uw atelier komen die twee samen. Daarom schrijf ik u spontaan aan.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaat- en elektrodelassen [TIG bevestigen], en stuur nu het atelier aan. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen, nu interieurvormgeving, na drie jaar meubel en interieur en een jaar grafiek. Met mijn broer bouw ik meubels.\n\nIk breng drie dingen mee. Als tekenaar zet ik de vraag van een klant om in een werktekening waarmee het atelier verder kan, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Doordat ik zelf plooi en las, weet ik hoe metalen onderdelen gemaakt en verbonden worden, en dat helpt om te begrijpen hoe een bestaand stuk in elkaar zit. En voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat geduld en een vaste methode vraagt.\n\nRestauratie is een vak apart. Ik wil het in de praktijk leren, in een klein team waar zorgvuldigheid telt. [Eén zin over de verplaatsing naar Arendonk: rijbewijs B en vervoer bevestigen.]\n\nIk stel voor om een proefdag in uw atelier mee te draaien[ en daarbij een beknopt portfolio van mijn werkstukken mee te brengen]. Een start in januari of februari 2027 is mogelijk, eventueel via een individuele beroepsopleiding (IBO) van VDAB.\n\nIk licht mijn kandidatuur graag toe in een gesprek. In bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: [e-mailadres of contactformulier via https://smego.be/contact]\n\nOnderwerp: Spontane sollicitatie - restauratiemedewerker metaal - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met een opleiding in halfautomaat- en elektrodelassen, en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Het restauratiewerk van Smego Metaalwerken, waaronder de poort aan het Falconplein in Antwerpen, sluit aan bij wat ik wil doen: mijn vakmanschap in metaal inzetten voor erfgoed. Daarom schrijf ik u spontaan aan voor een functie als restauratiemedewerker metaal.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar]. Ik stel voor om een proefdag in uw atelier mee te draaien. Een start in januari of februari 2027 is mogelijk, eventueel via een individuele beroepsopleiding (IBO) van VDAB.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "Smego Metaalwerken",
    "functie": "Restauratiemedewerker metaal",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://smego.be/contact",
    "contact": "[naam contactpersoon] (via contactpagina)",
    "email": ""
   }
  },
  {
   "slug": "stad-antwerpen-musea-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke, met ervaring in maatwerk, meubelbouw en archivering",
    "profiel": "Sinds 2021 werk ik bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal: ik begon er als tekenaar en plooi- en lasoperator en ben nu technisch tekenaar en verantwoordelijke van het atelier. Ik teken werkstukken uit, bereid het werk voor, plooi en las (halfautomaat en elektrode) en sta in voor afwerking en kwaliteitscontrole. Eerder bouwde ik een fotoarchief op voor Willy Van de Perre, waarvoor ik beelden ordende en digitaliseerde. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen (na meubel en interieur en grafiek nu interieurvormgeving) en bouw ik met mijn broer meubels. Als technisch assistent bij Musea en Erfgoed van Stad Antwerpen wil ik mijn nauwkeurigheid en materiaalkennis inzetten voor tentoonstellingsbouw, depot en collectiezorg.",
    "vaardigheden": [
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Meubelontwerp en -bouw, samen met mijn broer [in metaal en hout bevestigen]",
     "Werkvoorbereiding en aansturing van een atelier",
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Archiveren en digitaliseren van beeldmateriaal",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Fietstechniek: bouw en herstel"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nStad Antwerpen, Musea en Erfgoed\nT.a.v. [naam contactpersoon], [dienst of functie]\n[Adres]\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als technisch assistent (niveau C1) voor tentoonstellingsbouw, depot of collectiezorg\n\nGeachte mevrouw, geachte heer,\n\n[Concrete haak, hoogstens 25 woorden: een tentoonstelling of project in een van de stadsmusea dat Remi zag, en wat hem daarin aansprak.] Met Musea en Erfgoed zorgt Stad Antwerpen onder meer voor het Museum Plantin-Moretus, het Rubenshuis, het Red Star Line Museum, het Letterenhuis en het FelixArchief. Ik wil mijn vakmanschap inzetten voor erfgoed en ontwerp, en daarom stel ik mij kandidaat als technisch assistent voor tentoonstellingsbouw, depot of collectiezorg.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaat- en elektrodelassen. Eerder bouwde ik een fotoarchief op voor Willy Van de Perre. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen: na drie jaar meubel en interieur en een jaar grafiek nu interieurvormgeving. Met mijn broer bouw ik meubels.\n\nEen sokkel, een vitrine of een opstelling in een museumzaal moet precies uitgetekend, degelijk gemaakt en met zorg geplaatst worden. Dat vraagt dezelfde precisie als het maatwerk dat ik nu uitteken en maak. Zorgvuldigheid: in het atelier sta ik in voor afwerking en kwaliteitscontrole, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Plannen en organiseren: ik bereid het werk voor en verdeel het over [aantal] collega's, zodat een opdracht klaar is zoals afgesproken. Ordening: voor het fotoarchief ordende en digitaliseerde ik [omvang: aantal beelden en werkwijze].\n\nIk heb een diploma secundair onderwijs Wetenschappen-Wiskunde (Sint-Lutgardis, 2017). Ik weet dat de stad selecteert via job.antwerpen.be, met een competentiegesprek en vaak een praktische proef. Ik zou het op prijs stellen als u mijn cv bijhoudt en mij op de hoogte brengt van toekomstige selecties voor technisch assistent of een gelijkaardige functie op niveau C. Ik kom ook graag kennismaken tijdens een kort werkbezoek, waarbij ik mijn werkstukken kan tonen.\n\nIk licht mijn kandidatuur graag toe in een gesprek. In bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: [e-mailadres of formulier via job.antwerpen.be]\n\nOnderwerp: Spontane sollicitatie - technisch assistent (niveau C1) Musea en Erfgoed - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met een opleiding in halfautomaat- en elektrodelassen, en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Eerder bouwde ik een fotoarchief op voor Willy Van de Perre. Ik wil mijn vakmanschap inzetten voor erfgoed en ontwerp, en stel mij daarom spontaan kandidaat als technisch assistent voor tentoonstellingsbouw, depot of collectiezorg bij Musea en Erfgoed van Stad Antwerpen.\n\nIk heb een diploma secundair onderwijs. Ik zou het op prijs stellen als u mijn cv bijhoudt en mij op de hoogte brengt van toekomstige selecties voor technisch assistent of een gelijkaardige functie op niveau C.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar]. Ik licht mijn kandidatuur graag toe in een kort gesprek.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "Stad Antwerpen, Musea en Erfgoed",
    "functie": "Technisch assistent C1, musea en erfgoed (tentoonstellingsbouw, depot en collectiezorg)",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://job.antwerpen.be/go/Alle-vacatures/4474301/",
    "contact": "[naam contactpersoon] (via job.antwerpen.be)",
    "email": "[e-mailadres Musea en Erfgoed of HR Stad Antwerpen, na te vragen via job.antwerpen.be]"
   }
  },
  {
   "slug": "syntra-ab-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, plooier en lasser (halfautomaat en elektrode)",
    "profiel": "Ik ben sinds 2021 actief bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal; ik begon er als technisch tekenaar en plooi- en lasoperator en ben nu verantwoordelijke van het atelier. Ik teken werkstukken uit, plooi en las zelf (halfautomaat en elektrode) en sta in voor de planning en de kwaliteitscontrole, zodat ik het vak ken van tekening tot afgewerkt stuk. Ik volgde zelf een lasopleiding en volg al jaren avondonderwijs aan de Academie in Antwerpen: drie jaar meubel en interieur, een jaar grafiek en nu interieurvormgeving. Samen met mijn broer ontwerp en bouw ik meubels in metaal en hout. Bij SYNTRA AB wil ik die praktijkervaring doorgeven als docent in de avondopleidingen lassen en metaal, aan cursisten die net als ik naast hun werk een vak leren.",
    "vaardigheden": [
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma]) en tekeninglezen",
     "Werkvoorbereiding, planning en kwaliteitscontrole; aansturing van een atelier",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Meubelontwerp en -bouw in metaal en hout",
     "Fietstechniek: bouw en herstel",
     "Archiveren en digitaliseren van beeldmateriaal"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nSYNTRA AB\nT.a.v. [naam contactpersoon], [functie]\n[Adres campus Antwerpen]\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als docent lassen en metaalbewerking in de avondopleidingen\n\nGeachte mevrouw, geachte heer,\n\n[Eén zin over hoe Remi SYNTRA AB kent: zijn eigen lasopleiding, als hij die bij SYNTRA volgde, of een opleiding lassen of metaal op de campus Antwerpen die hij op uw website zag.] SYNTRA AB selecteert docenten met een gesprek en een proefles en vraagt daarvoor geen lerarendiploma. Dat past bij wat ik wil: het vak doorgeven zoals ik het zelf in het atelier uitoefen. Daarom schrijf ik u spontaan aan voor een opdracht als docent lassen of metaalbewerking in uw avondopleidingen.\n\nSinds 2021 werk ik bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal. Ik begon er als technisch tekenaar en plooi- en lasoperator en ben nu verantwoordelijke van het atelier. Ik teken werkstukken uit, plooi en las (halfautomaat en elektrode [TIG bevestigen]) en sta in voor de planning en de kwaliteitscontrole. Mijn lasopleiding volgde ik [bij VDAB, SYNTRA of een school; bevestigen].\n\nIk breng drie dingen mee. Ik ken het werk van tekening tot afgewerkt stuk en weet dus welke informatie een lasser uit een tekening moet halen. Als verantwoordelijke van het atelier stuur ik collega's aan; [concreet voorbeeld: een collega die Remi inwerkte aan de kantbank of het lasstation]. En ik ken avondonderwijs van de kant van de cursist: ik volg al jaren avondles aan de Academie in Antwerpen, drie jaar meubel en interieur, een jaar grafiek en nu interieurvormgeving. Ik weet hoe het is om na een werkdag nog geconcentreerd te leren, en dat een goede demonstratie dan meer zegt dan een lange uitleg.\n\nIk stel voor om na een kennismakingsgesprek een proefles te geven, bijvoorbeeld over [onderwerp, zoals halfautomaatlassen van plaatwerk of tekeninglezen]. Als dat past, kom ik vooraf graag een avondles bijwonen. Ik kan starten vanaf januari of februari 2027, op [aantal] avonden per week, naast mijn eigen lessen aan de Academie op [dagen].\n\nIn bijlage vindt u mijn cv en een beknopt portfolio van mijn werkstukken.\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv, portfolio\n",
   "mail": "Aan: [online formulier voor spontane sollicitaties als docent via https://www.syntra-ab.be/docenten; na te gaan of er ook een e-mailadres is]\n\nOnderwerp: Spontane sollicitatie - docent lassen en metaalbewerking (avondopleidingen) - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met ervaring in plooien en lassen (halfautomaat en elektrode [TIG bevestigen]), en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Ik wil mijn vakmanschap doorgeven en schrijf u daarom spontaan aan voor een opdracht als docent lassen of metaalbewerking in de avondopleidingen van SYNTRA AB.\n\nIn bijlage vindt u mijn motivatiebrief, mijn cv en een beknopt portfolio. Graag maak ik kennis in een gesprek en geef ik daarna een proefles. Ik kan starten vanaf januari of februari 2027.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\n\nBijlagen: motivatiebrief (pdf), cv (pdf), portfolio (pdf)\n",
   "meta": {
    "organisatie": "SYNTRA AB",
    "functie": "Docent lassen en metaalbewerking (avondopleidingen)",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://www.syntra-ab.be/docenten",
    "contact": "[naam contactpersoon]",
    "email": "[e-mailadres na te gaan; spontane sollicitatie docenten via het online formulier op https://www.syntra-ab.be/docenten]"
   }
  },
  {
   "slug": "toneelhuis-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, maker in metaal, student interieurvormgeving",
    "profiel": "Sinds 2021 werk ik bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal: ik begon als tekenaar en plooi- en lasoperator en ben nu technisch tekenaar en verantwoordelijke van het atelier. Ik teken werkstukken uit, bereid het werk voor, plooi en las (halfautomaat en elektrode) en plan het werk in het atelier zodat een opdracht op tijd klaar is. In 2019 werkte ik in een creatief fietsatelier. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen, nu interieurvormgeving, en bouw ik meubels met mijn broer. In het decoratelier van Toneelhuis wil ik tekenen, maken en ontwerp samenbrengen in decors die op de scène precies passen en stevig zijn.",
    "vaardigheden": [
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Meubelontwerp en -bouw in metaal en hout",
     "Werkvoorbereiding en aansturing van een atelier",
     "Fietstechniek: bouw en herstel",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Archiveren en digitaliseren van beeldmateriaal"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nToneelhuis\nT.a.v. [naam contactpersoon], personeelszaken\nBourla, Komedieplaats [nummer]\n2000 Antwerpen\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als ateliermedewerker in uw decoratelier (decorbouw, metaal en constructie)\n\nGeachte mevrouw, geachte heer,\n\n[Eén zin over hoe Remi Toneelhuis leerde kennen, bijvoorbeeld een voorstelling in de Bourla die hij zelf zag, en welk detail van het decor hem aansprak. Alleen invullen als dat echt zo is; anders: hoe hij het werk van Toneelhuis leerde kennen.] Toneelhuis heeft een eigen technische ploeg en een eigen decoratelier. Een decor moet op de scène precies kloppen en tegelijk stevig genoeg zijn om telkens opnieuw opgebouwd, bespeeld en afgebroken te worden. Dat is werk waarin ik mijn vakmanschap wil inzetten, en daarom schrijf ik u spontaan aan.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaat- en elektrodelassen, en stuur nu het atelier aan. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen: na drie jaar meubel en interieur en een jaar grafiek, nu interieurvormgeving. Met mijn broer bouw ik meubels.\n\nVoor uw decoratelier breng ik drie dingen mee. Ik zet een ontwerp om in een werktekening waarmee het atelier verder kan, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Ik plooi en las zelf en weet wat een constructie nodig heeft om stevig en goed afgewerkt te zijn. En als verantwoordelijke van het atelier plan ik het werk en volg ik het op met mijn collega's, zodat een opdracht klaar is op de afgesproken datum. In een theater, waar de première vastligt, telt dat evenzeer.\n\nIk stel voor om kennis te maken tijdens een proefdag in uw decoratelier, waarbij ik ook mijn werkstukken toon. Daarna kan ik instappen via een individuele beroepsopleiding (IBO) van VDAB, met een start in januari of februari 2027.\n\nIk licht mijn kandidatuur graag toe in een gesprek. In bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: personeelszaken@toneelhuis.be\n\nOnderwerp: Spontane sollicitatie - ateliermedewerker decoratelier (decorbouw, metaal en constructie) - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met een opleiding in halfautomaat- en elektrodelassen, en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Ik schrijf u spontaan aan voor een functie als ateliermedewerker in het decoratelier van Toneelhuis, waar ik wil meebouwen aan decors en mijn ervaring in metaal en constructie wil inzetten.\n\nConcreet stel ik een proefdag in uw decoratelier voor, waarbij ik ook mijn werkstukken toon. Daarna kan ik instappen via een individuele beroepsopleiding (IBO) van VDAB, met een start in januari of februari 2027.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "Toneelhuis",
    "functie": "Ateliermedewerker decoratelier (decorbouw, metaal en constructie)",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://toneelhuis.be/nl/over-toneelhuis/vacatures-stages/",
    "contact": "Personeelszaken, [naam contactpersoon]",
    "email": "personeelszaken@toneelhuis.be"
   }
  },
  {
   "slug": "vdab-instructeur-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, lasser halfautomaat en elektrode",
    "profiel": "Ik ben technisch tekenaar en verantwoordelijke van het atelier bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal, sinds 2021; ik begon er als tekenaar en plooi- en lasoperator. Ik ken het werk van tekening tot afwerking: ik teken werkstukken uit, plooi op de kantbank, las halfautomaat (MIG/MAG) en elektrode en sta in voor afwerking en kwaliteitscontrole. Als verantwoordelijke bereid ik het werk voor en verdeel ik het over mijn collega's, zodat ieder stuk gemaakt wordt zoals het getekend is. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen, na meubel en interieur en grafiek nu interieurvormgeving, en bouw ik meubels met mijn broer. Als instructeur lassen en metaal bij VDAB wil ik die vakkennis doorgeven aan volwassenen die het vak willen leren.",
    "vaardigheden": [
     "Plooien op de kantbank, halfautomaatlassen (MIG/MAG) en elektrodelassen [TIG bevestigen], plaatwerk",
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Werkvoorbereiding en aansturing van een atelier",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Meubelontwerp en -bouw in metaal en hout",
     "Fietstechniek: bouw en herstel",
     "Archiveren en digitaliseren van beeldmateriaal"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nVDAB, competentiecentrum [Antwerpen, Mechelen of Turnhout]\nT.a.v. [naam contactpersoon], [dienst of functie]\n[Adres]\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als instructeur lassen en metaal (niveau C)\n\nGeachte mevrouw, geachte heer,\n\n[Concrete haak: hoe Remi de competentiecentra leerde kennen, bijvoorbeeld een infosessie of een gesprek met een instructeur.] In uw competentiecentra leren volwassenen in kleine groepen het vak van lasser en metaalbewerker. Ik las dat u nieuwe instructeurs intern opleidt. Ik wil mijn vakmanschap inzetten om het vak door te geven, en daarom stel ik mij kandidaat als instructeur lassen en metaal.\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik begon er in 2021 als tekenaar en plooi- en lasoperator, met een opleiding in halfautomaatlassen (MIG/MAG) en elektrodelassen [TIG bevestigen], en stuur nu het atelier aan. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen: na drie jaar meubel en interieur en een jaar grafiek nu interieurvormgeving. Met mijn broer bouw ik meubels.\n\nEen instructeur moet het vak kennen en het kunnen uitleggen. Vakkennis over het hele traject: ik teken uit, plooi, las en controleer de afwerking, bijvoorbeeld bij [concreet project en wat daar precies moest kloppen]. Begeleiden: als verantwoordelijke bereid ik het werk voor en verdeel ik het over [aantal] collega's, zodat iedereen weet wat er moet gebeuren, zoals bij [voorbeeld: een collega inwerken aan de kantbank of het lastoestel]. Zelf leren als volwassene: ik volg al jaren avondonderwijs naast mijn job en weet hoe het is om na een werkdag iets nieuws onder de knie te krijgen.\n\nIk heb een diploma secundair onderwijs Wetenschappen-Wiskunde (Sint-Lutgardis, 2017). Ik zou het op prijs stellen als u mijn cv bijhoudt en mij op de hoogte brengt van toekomstige selecties voor instructeur lassen en metaal of een gelijkaardige functie op niveau C, in een van uw competentiecentra in de provincie Antwerpen. Ik kom ook graag kennismaken tijdens een kort werkbezoek aan een competentiecentrum.\n\nIk licht mijn kandidatuur graag toe in een gesprek. In bijlage vindt u mijn cv [en een beknopt portfolio, indien klaar].\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv[, portfolio]\n",
   "mail": "Aan: [e-mailadres van het competentiecentrum of van de dienst werving van VDAB; bij een openstaande vacature solliciteert Remi via het online sollicitatieformulier bij de vacature (vdab.be of werkenvoorvlaanderen.be) en niet met deze mail]\n\nOnderwerp: Spontane sollicitatie - instructeur lassen en metaal (niveau C) - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met een opleiding in halfautomaat- en elektrodelassen, en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Ik wil mijn vakmanschap inzetten om het vak door te geven, en stel mij daarom spontaan kandidaat als instructeur lassen en metaal in een van uw competentiecentra.\n\nIk heb een diploma secundair onderwijs. Ik zou het op prijs stellen als u mijn cv bijhoudt en mij op de hoogte brengt van toekomstige selecties voor instructeur lassen en metaal of een gelijkaardige functie op niveau C.\n\nIn bijlage vindt u mijn motivatiebrief en mijn cv [en een beknopt portfolio, indien klaar]. Ik licht mijn kandidatuur graag toe in een kort gesprek of tijdens een werkbezoek.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail]\n\nBijlagen: Remi_[Achternaam]_Motivatiebrief.pdf, Remi_[Achternaam]_CV.pdf[, portfolio (pdf)]\n",
   "meta": {
    "organisatie": "VDAB competentiecentra",
    "functie": "Instructeur lassen en metaal (niveau C)",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://www.vdab.be/vindeenjob/jobs/vdab-instructeur",
    "contact": "[naam contactpersoon] (via vacature)",
    "email": "[e-mailadres van het competentiecentrum of van de dienst werving van VDAB, na te gaan via vdab.be]"
   }
  },
  {
   "slug": "verstraete-vanhecke-spontaan",
   "cv": {
    "titel": "Technisch tekenaar en atelierverantwoordelijke in de plaatbewerking, plooier en lasser (halfautomaat en elektrode)",
    "profiel": "Ik ben sinds 2021 technisch tekenaar bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal; ik begon er als tekenaar en plooi- en lasoperator en ben nu verantwoordelijke van het atelier. Ik teken werkstukken uit, plooi en las zelf (halfautomaat en elektrode) en stuur het atelier aan, zodat ik het werk ken van tekening tot afwerking. Voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat geduld en een vaste methode vraagt, en samen met mijn broer bouw ik meubels. Naast mijn werk volg ik avondonderwijs interieurvormgeving aan de Academie in Antwerpen, na drie jaar meubel en interieur en een jaar grafiek. Bij Verstraete & Vanhecke wil ik die combinatie van tekenen, metaalbewerking en zorg voor materiaal inzetten voor het metaalwerk in de restauratie van monumenten.",
    "vaardigheden": [
     "Plooien op de kantbank, halfautomaat- en elektrodelassen, plaatwerk",
     "Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])",
     "Werkvoorbereiding en aansturing van een atelier",
     "Sterk in wiskunde en structureel denken; nauwkeurig, geduldig en betrouwbaar",
     "Meubelontwerp en -bouw (eigen werk, samen met mijn broer)",
     "Archiveren en digitaliseren van beeldmateriaal",
     "Fietstechniek: bouw en herstel"
    ]
   },
   "brief": "Remi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\nVerstraete & Vanhecke NV\nT.a.v. [naam contactpersoon], [functie]\n[Straat nummer]\n[postcode] Wilrijk\n\nAntwerpen, [dag maand jaar]\n\nBetreft: spontane sollicitatie als restauratiemedewerker metaalwerk\n\nGeachte mevrouw, geachte heer,\n\n[Eén zin over hoe Remi Verstraete & Vanhecke leerde kennen: een monument in restauratie of een werf die hij zag.] Uw bedrijf is al meer dan tweehonderd jaar actief en restaureert monumenten. Bij zo'n restauratie komt ook metaalwerk kijken, zoals [concreet voorbeeld van metaalwerk in een project van Verstraete & Vanhecke, na te gaan op v-v.be; niets gevonden: schrap dit zinsdeel]. Daar wil ik bijdragen; daarom schrijf ik u spontaan aan.\n\nSinds 2021 werk ik bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal. Ik begon er als technisch tekenaar en plooi- en lasoperator en ben nu verantwoordelijke van het atelier. Ik teken uit, plooi en las (halfautomaat en elektrode) en stuur het atelier aan. Naast mijn werk volg ik avondonderwijs interieurvormgeving aan de Academie in Antwerpen, na drie jaar meubel en interieur en een jaar grafiek.\n\nIk wil mijn vakmanschap inzetten voor erfgoed. Wat mij in restauratie aanspreekt, is dat het vertrekt van wat er al is: een hersteld of nieuw stuk moet passen bij het gebouw en opnieuw lang meegaan. Dat vraagt geduld en nauwkeurigheid, en daar ligt mijn sterkte.\n\nIk breng drie dingen mee. Als tekenaar zet ik een maat of een vraag om in een tekening waarmee het atelier kan werken, zoals bij [concreet project: wat, welk materiaal, welke moeilijkheid]; bij restauratie komt daar het opmeten van bestaand werk bij, en dat wil ik grondig leren. Doordat ik zelf plooi en las en een atelier aanstuur, weet ik hoe metalen onderdelen gemaakt en verbonden worden. En voor Willy Van de Perre bouwde ik een fotoarchief op, werk dat een vaste methode vraagt.\n\nIk stel voor om kennis te maken tijdens een kort werkbezoek of een proefdag in uw Antwerpse vestiging. Een start via een individuele beroepsopleiding (IBO) met VDAB in januari of februari 2027 is voor mij mogelijk. Zo leer ik het vak onder begeleiding van uw mensen en kunt u mijn werk in de praktijk beoordelen. Ik licht mijn kandidatuur graag toe in een gesprek.\n\nIn bijlage vindt u mijn cv en een beknopt portfolio.\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv, portfolio\n",
   "mail": "Aan: [e-mailadres of contactformulier, na te gaan via https://v-v.be/vacatures/]\n\nOnderwerp: Spontane sollicitatie - restauratiemedewerker metaalwerk - Remi [Achternaam]\n\nGeachte mevrouw, geachte heer,\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met ervaring in plooien en lassen (halfautomaat en elektrode), en ik volg avondonderwijs interieurvormgeving aan de Academie in Antwerpen. Ik wil mijn vakmanschap inzetten voor erfgoed en schrijf u daarom spontaan aan voor een functie als restauratiemedewerker metaalwerk bij Verstraete & Vanhecke.\n\nIn bijlage vindt u mijn motivatiebrief, mijn cv en een beknopt portfolio. Graag maak ik kennis tijdens een kort werkbezoek of een proefdag. Een start via een individuele beroepsopleiding (IBO) met VDAB in januari of februari 2027 is voor mij mogelijk.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\n\nBijlagen: motivatiebrief (pdf), cv (pdf), portfolio (pdf)\n",
   "meta": {
    "organisatie": "Verstraete & Vanhecke",
    "functie": "Restauratiemedewerker metaalwerk",
    "datum": "2026-10-15",
    "type": "spontaan",
    "bron": "https://v-v.be/vacatures/",
    "contact": "[naam contactpersoon] (via website)",
    "email": "[e-mailadres, na te gaan via https://v-v.be/vacatures/]"
   }
  }
 ],
 "sjablonen": {
  "mails.md": "# Mailsjablonen (Nederlands, \"u\" tegenover de werkgever)\n\n## Sollicitatiemail\nOnderwerp: Sollicitatie [functietitel] - Remi [Achternaam] (ref. [nummer])\n\nGeachte mevrouw [Naam], / Geachte heer [Naam], (onbekend: Geachte mevrouw, geachte heer,)\n\nMet veel interesse las ik uw vacature voor [functietitel] op [vdab.be / cultuurjobs.be / uw website]. Als technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, met ervaring in plooien en lassen (halfautomaat en elektrode [TIG bevestigen]), en als student interieurvormgeving aan de Academie in Antwerpen, herken ik mij sterk in het profiel dat u zoekt.\n\nIn bijlage vindt u mijn cv, mijn motivatiebrief en een beknopt portfolio van mijn werkstukken. Ik licht mijn kandidatuur graag toe in een persoonlijk gesprek.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail] | [portfolio-link]\nBijlagen: cv, motivatiebrief, portfolio (pdf)\n\n## Spontane sollicitatie\nOnderwerp: Spontane sollicitatie - technisch tekenaar en maker in metaal - Remi [Achternaam]\n\nGeachte mevrouw [Naam], / Geachte heer [Naam],\n\nTijdens [een bezoek aan uw atelier / de tentoonstelling ... / mijn opleiding aan de Academie] leerde ik het werk van [organisatie] kennen. De zorg waarmee u [historisch metaalwerk restaureert / decors bouwt / collectiestukken bewaart] sluit nauw aan bij wat ik zelf doe: maatwerk in metaal uittekenen, plooien en lassen, en dat combineren met ontwerp en meubelbouw. Daarom schrijf ik u spontaan aan. Ik zou graag als [technisch medewerker / ateliermedewerker metaal / restauratiemedewerker] bijdragen aan uw projecten en stel voor om mijn werkstukken tijdens een kort werkbezoek of een proefdag te tonen. [Optioneel: Een start via een individuele beroepsopleiding (IBO) met VDAB in januari of februari 2027 is voor mij mogelijk.]\n\nIn bijlage vindt u mijn cv en portfolio.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n[gsm] | [e-mail]\n\n## Opvolgmail (10 tot 14 dagen na verzending)\nOnderwerp: Opvolging sollicitatie [functietitel] - Remi [Achternaam]\n\nGeachte mevrouw [Naam], / Geachte heer [Naam],\n\nOp [datum] solliciteerde ik voor de functie van [functietitel]. Omdat ik nog geen nieuws ontving, wil ik graag nagaan of u mijn kandidatuur goed hebt ontvangen en of u al een zicht hebt op het verdere verloop van de procedure. Mijn interesse in de functie en in [organisatie] is onverminderd groot. Mocht u aanvullende informatie of referenties wensen, dan bezorg ik u die graag.\n\nMet vriendelijke groeten\nRemi [Achternaam], [gsm]\n\n## Bedankmail (binnen 24 tot 48 uur na het gesprek)\nOnderwerp: Bedankt voor het gesprek - [functietitel] - Remi [Achternaam]\n\nGeachte mevrouw [Naam], / Geachte heer [Naam],\n\nHartelijk dank voor het aangename gesprek van [dag]. Uw toelichting over [concreet project of werking van het atelier] heeft mijn interesse in de functie alleen maar versterkt. Vooral [de combinatie van restauratie en eigen ontwerp / het werken in een klein team] spreekt mij aan. Ik ben ervan overtuigd dat ik met mijn ervaring in tekenen, plooien en lassen van maatwerk en mijn ontwerpachtergrond een concrete bijdrage kan leveren. Ik kijk uit naar uw antwoord en blijf beschikbaar voor bijkomende vragen.\n\nMet vriendelijke groeten\nRemi [Achternaam]\n\n## Reactie op een afwijzing met vraag om feedback\nOnderwerp: Sollicitatie [functietitel] - vraag om feedback\n\nGeachte mevrouw [Naam], / Geachte heer [Naam],\n\nBedankt voor uw bericht en voor de tijd die u in mijn kandidatuur hebt geïnvesteerd. Het spijt me dat ik niet de weerhouden kandidaat ben, maar ik respecteer uw beslissing. Om mij verder te ontwikkelen zou ik het erg waarderen als u mij kort kunt meegeven welke punten de doorslag hebben gegeven en waar u mijn sterktes zag. Mag ik u ook vragen mijn kandidatuur in gedachten te houden voor gelijkaardige vacatures of een toekomstige werfreserve? Ik wens u en uw team veel succes met de nieuwe collega.\n\nMet vriendelijke groeten\nRemi [Achternaam], [gsm]\n\n## Vraag om een werkbezoek of beroepsverkennende stage\nOnderwerp: Vraag om een kort werkbezoek - Remi [Achternaam], technisch tekenaar en maker in metaal\n\nGeachte mevrouw [Naam], / Geachte heer [Naam],\n\nIk ben technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal, en student interieurvormgeving, en ik oriënteer mij naar werk in [erfgoed en restauratie / museum- en theaterateliers]. Het werk van [organisatie] volg ik met veel interesse. Mag ik u vragen of een kort werkbezoek aan [het atelier / het depot] mogelijk is, of een beroepsverkennende stage van enkele dagen via VDAB? Ik kom graag kijken, luisteren en meehelpen waar dat kan.\n\nMet vriendelijke groeten\nRemi [Achternaam], [gsm]\n",
  "motivatiebrief-basis.md": "# Motivatiebrief, basisversie (aan te passen per organisatie)\n\nGebruik \"u\" tegenover de werkgever. Eén A4. Ik-vorm, korte zinnen. Geen uitroeptekens. De tekst tussen vierkante haken wordt per sollicitatie ingevuld met de werkwijze in .claude/skills/sollicitatie.\n\n---\n\nRemi [Achternaam]\n[Straat nummer]\n[postcode] Antwerpen\n[gsm] · [e-mail]\n\n[Organisatie]\nT.a.v. [mevrouw/heer Voornaam Achternaam], [functie]\n[Adres]\n\nAntwerpen, [dag maand jaar]\n\nBetreft: sollicitatie [functietitel] [(ref. nummer)] / spontane sollicitatie als [functie]\n\nGeachte mevrouw [Naam], / Geachte heer [Naam], / Geachte mevrouw, geachte heer,\n\n[Inleiding met haak: hoe ik de vacature of organisatie ken, één concreet detail over hun werk dat mij aanspreekt.]\n\nAls technisch tekenaar en verantwoordelijke van een atelier voor maatwerk in plaatmateriaal ken ik het werk van tekening tot afwerking. Ik teken uit, plooi en las (halfautomaat en elektrode [TIG bevestigen]), stuur het atelier aan en werk graag aan stukken die precies moeten zijn en lang moeten meegaan. Daarvoor bouwde ik een fotoarchief op en werkte ik in een creatief fietsatelier. Naast mijn werk volg ik avondonderwijs aan de Academie in Antwerpen, eerst meubel en interieur, nu interieurvormgeving, en bouw ik meubels. Die combinatie van ambacht en ontwerp wil ik inzetten voor [erfgoed en restauratie / de ateliers van uw huis / het doorgeven van het vak].\n\n[Waarom deze organisatie: twee of drie zinnen die tonen dat ik weet wat zij doen en waarom dat bij mij past.]\n\n[Waarom ik: twee of drie troeven met een concreet voorbeeld. Bijvoorbeeld: een project waar zorgvuldigheid het verschil maakte; iets over samenwerken in een klein team; iets over materiaalkennis.]\n\n[Concreet voorstel: een gesprek, een werkbezoek, een proefdag, een stage of een IBO-start in januari of februari 2027.]\n\nIk licht mijn kandidatuur graag toe in een gesprek. In bijlage vindt u mijn cv en een beknopt portfolio.\n\nMet vriendelijke groeten\n\nRemi [Achternaam]\n\nBijlagen: cv, portfolio\n",
  "vdab-profiel.md": "# VDAB-profiel (Mijn Loopbaan): tekst voor Remi\n\nDoel: gevonden worden door werkgevers en bemiddelaars die zoeken op erfgoed, restauratie, museum, decor, atelier, instructeur en lassen. VDAB-profielen zijn kort en zakelijk. Zet het profiel op zichtbaar voor werkgevers en vul de rubrieken hieronder letterlijk over.\n\n## Titel (functietitel bovenaan)\nTechnisch tekenaar en atelierverantwoordelijke plaatbewerking, lasser en meubelmaker, op zoek naar werk in erfgoed, restauratie, archief en cultuurateliers\n\n## Korte voorstelling (maximaal 5 zinnen)\nTechnisch tekenaar en verantwoordelijke atelier bij een metaalbewerkingsbedrijf voor maatwerk in plaatmateriaal, sinds 2021. Ik teken werkstukken uit, bereid het werk voor, plooi en las zelf (halfautomaat en elektrode) en stuur het atelier aan. Daarvoor werkte ik in een creatief fietsatelier en bouwde ik een fotoarchief op; daarnaast volg ik interieurvormgeving aan de Academie in Antwerpen en bouw ik meubels. Ik zoek werk waarin vakmanschap en zorgvuldigheid ergens toe dienen: restauratie van historisch metaalwerk, museum- of theaterateliers, archief en collectiezorg, tentoonstellingsbouw, of het doorgeven van het vak. Ik werk het best in een klein team en ben beschikbaar vanaf [datum].\n\n## Gewenste functies (kies er tot vijf in de VDAB-lijst)\n- Technisch tekenaar of werkvoorbereider metaal en plaatbewerking\n- Decorbouwer, ateliermedewerker metaal of vitrinebouwer\n- Technisch medewerker museum, depot of tentoonstellingsbouw\n- Restauratiemedewerker metaal (monumentenzorg)\n- Instructeur of praktijkbegeleider lassen en metaal\n\n## Gewenste sectoren\nCultuur en erfgoed; bouw en restauratie; metaal; onderwijs en opleiding; sociale economie\n\n## Competenties (vinkjes en vrije tekst)\n- Technisch tekenen van maatwerk in plaatmateriaal ([CAD-programma])\n- Werkvoorbereiding, planning en aansturing van een atelier\n- Plooien op de kantbank, MIG/MAG-lassen (135) en elektrodelassen (111) [TIG bevestigen]\n- Plaatwerk: snijden, plooien, afwerken, kwaliteitscontrole\n- Opmeten en uittekenen op maat, montage\n- Meubelontwerp en -bouw [in metaal en hout, materiaal bevestigen]\n- Fietsbouw en -herstel\n- Archiveren en digitaliseren van beeldmateriaal\n- Veiligheid: VCA-basis [geldig tot]\n- Rijbewijs B [indien van toepassing]\n\n## Talen\nNederlands moedertaal; Engels goed; Frans [niveau]\n\n## Opleiding\n- Interieurvormgeving, avondonderwijs aan de Academie in Antwerpen, lopend [precieze opleiding bevestigen]\n- Meubel en interieur (drie jaar) en grafiek (een jaar), avondonderwijs aan de Academie in Antwerpen\n- Lasopleiding halfautomaat en elektrodelassen, [instelling], [jaar]\n- Diploma secundair onderwijs Wetenschappen-Wiskunde, Sint-Lutgardis, 2017\n\n## Werkervaring\n2021 tot heden: technisch tekenaar en verantwoordelijke atelier, [bedrijf], [gemeente]. Gestart als tekenaar en plooi- en lasoperator. Maatwerk in plaatmateriaal van tekening tot afwerking.\n2019: medewerker creatief fietsatelier, Antwerpen.\n2017 tot 2018: opbouw van een fotoarchief voor Willy Van de Perre.\n2017 tot 2018: [functie], Katoen Natie, Antwerpen.\n[jaar] tot heden: meubelmaker in eigen beheer, samen met mijn broer, Antwerpen.\n\n## Mobiliteit en beschikbaarheid\nAntwerpen en omgeving, bereikbaar met openbaar vervoer [en fiets/wagen]. Voltijds of deeltijds. Beschikbaar vanaf [datum]. Open voor een individuele beroepsopleiding (IBO) of een beroepsverkennende stage.\n\n## Trefwoorden om zeker in de vrije tekst te zetten\nerfgoed, restauratie, monumentenzorg, museum, depot, archief, decoratelier, decorbouw, tentoonstellingsbouw, atelier, technisch tekenaar, werkvoorbereider, plaatbewerking, plooien, kantbank, MIG/MAG, elektrodelassen, plannen lezen, meubelmaker, interieurvormgeving, instructeur lassen\n",
  "vragenlijst-remi.md": "# Vragenlijst voor Remi\n\nDeze vragen zijn voor jou, Remi. Niets hoeft in één keer. Korte antwoorden zijn goed; een voorbeeld is beter dan een omschrijving. Alles wat je invult blijft op dit toestel tot je het exporteert of kopieert voor Giulia. Uit je antwoorden komen het cv, de brieven, de tekst voor VDAB en de keuzes voor de volgende stap.\n\n## Praktisch, voor het cv\n\nFeiten die op een cv of in een dossier moeten kloppen.\n\n- Volledige naam, geboortedatum en geboorteplaats\n  \n\n- Adres, gsm-nummer en e-mailadres dat je voor sollicitaties wil gebruiken\n  \n\n- Rijbewijs (B, ja of nee) en hoe je je verplaatst: fiets, openbaar vervoer, auto. Tot hoeveel minuten pendelen is haalbaar?\n  \n\n- Talen en niveau: Nederlands, Frans, Engels, andere\n  \n\n- Naam van je huidige werkgever, gemeente, en de startdatum van je contract (staat op het contract of de eerste loonfiche)\n  \n\n- Wat staat er op je loonfiche: arbeider of bediende, en welk paritair comité (bijvoorbeeld 111, 200, 209)?  \n  (Dit bepaalt gewaarborgd loon, vakantiegeld en eindejaarspremie.)\n  \n\n- Je functietitel volgens het contract, en wat je vandaag echt doet (tekenen, plooien, lassen, atelier aansturen, hoeveel collega's)\n  \n\n- Welk tekenprogramma gebruik je (bijvoorbeeld SolidWorks, AutoCAD, Inventor, Tekla) en hoe goed?\n  \n\n- Welke lasprocessen beheers je: halfautomaat (MIG/MAG), elektrode, TIG? Welke certificaten heb je, met norm en geldigheid?\n  \n\n- Andere attesten: VCA, heftruck, hoogtewerker, EHBO, kantbank, andere\n  \n\n- Je opleidingen precies: secundair (richting, school, jaar), lasopleiding (waar, wanneer), academie (welke richtingen, welke jaren, getuigschrift of diploma)\n  \n\n- Katoen Natie: welke functie, welke afdeling, hoelang?\n  \n\n- Het creatief fietsatelier: naam, wat je daar maakte of herstelde, een voorbeeld\n  \n\n- Het fotoarchief voor Willy Van de Perre: wie is hij, hoeveel beelden, hoe heb je het aangepakt (ordenen, scannen, beschrijven, software)?\n  \n\n- Welke werkstukken bestaan er in foto's: meubels, constructies, fietsen, tekeningen? Waar staan die foto's?  \n  (Voor het portfolio: 6 tot 10 stukken met titel, jaar, materiaal, techniek.)\n  \n\n- Vanaf wanneer ben je beschikbaar, voltijds of deeltijds, en welke dagen of avonden zijn bezet door de academie?\n  \n\n- Wat is je huidige brutoloon per maand, en wat heb je netto minimaal nodig om rond te komen?  \n  (Dit is voor de keuze tussen uitkering, opleiding en werk, niet voor een cv.)\n  \n\n## Werk dat bij je past\n\nConcrete momenten zeggen meer dan eigenschappen.\n\n- Drie momenten op het werk waarop je dacht: dit is goed. Wat deed je precies?\n  \n\n- Drie momenten waarop het echt niet ging. Wat gebeurde er?\n  \n\n- Een project waar je trots op bent: wat, voor wie, wat was moeilijk, hoe heb je het opgelost?  \n  (Dit wordt een regel op het cv en een voorbeeld in het gesprek.)\n  \n\n- Nog een project, liefst iets helemaal anders\n  \n\n- Wat doe je het liefst in het atelier: tekenen, plooien, lassen, organiseren, uitleggen aan anderen? Zet ze in volgorde.\n  \n\n- Wat is fysiek het zwaarst, en waar voel je dat (rug, schouders, handen, ogen, ademhaling)?  \n  (Ook voor de huisarts.)\n  \n\n- Werk je liever alleen, met twee of drie, of in een grotere ploeg? Waarom?\n  \n\n- Liever een klein bedrijf, een grote organisatie, een overheid, een vzw? Wat trekt je aan en wat schrikt af?\n  \n\n- Wat zouden je collega's zeggen als iemand vraagt hoe het is om met jou te werken?\n  \n\n- Wat heb je nodig van een baas of ploegbaas om goed te werken? En wat verdraag je niet?\n  \n\n## Sterktes en werkpunten\n\nEerlijk en met een voorbeeld; dit is geen sollicitatiegesprek.\n\n- Drie dingen waar je goed in bent, telkens met een voorbeeld\n  \n\n- Drie dingen die je wil verbeteren of die je moeilijk vindt\n  \n\n- Waarvoor komen mensen bij jou om hulp?\n  \n\n- Hoe leer je het liefst: door te doen, te kijken, te lezen, uitleg te krijgen?\n  \n\n- Hoe reageer je als er druk of stress is? Wat helpt dan?\n  \n\n- Wanneer zeg je te weinig, en wanneer had je liever iets gezegd?  \n  (De tests zeggen dat je niet snel op de voorgrond treedt; dit is om te weten waar dat je iets kost.)\n  \n\n- Wat weet je over jezelf dat niet in een test staat?\n  \n\n## Passies en interesses\n\nWat je doet als niemand het vraagt.\n\n- Waar gaat je aandacht naartoe buiten het werk: maken, lezen, kijken, sporten, mensen, plekken?\n  \n\n- Welke gebouwen, objecten, musea of ateliers hebben je ooit geraakt, en waarom?\n  \n\n- Als geld geen rol speelde: wat zou je een jaar lang maken of leren?\n  \n\n- Van de sporen in de app (erfgoed en restauratie, culturele instellingen, lesgeven, sociaal en ecologisch, archief en archeologie): welke trekt het meest, welke het minst, en waarom?\n  \n\n- Welk werkveld in de Verkenning verraste je positief, en welk zou je meteen schrappen?\n  \n\n- Heb je ooit vrijwilligerswerk gedaan of iemand iets aangeleerd? Hoe was dat?\n  \n\n- Wat zou je op de academie het liefst verder doen: meubel, interieur, grafiek, iets anders?\n  \n\n## De overstap\n\nHier gaat het om keuzes voor de komende maanden.\n\n- Drie dingen die de volgende job zeker moet hebben\n  \n\n- Drie dingen die je in de volgende job wil vermijden\n  \n\n- Wil je opnieuw studeren? Zo ja: hoelang zou je dat volhouden (een jaar, twee, drie), overdag of in de avond, en wat trekt je: restauratie, tekenen, lesgeven, archief, iets anders?\n  \n\n- Hoe voel je je nu: energie van 1 tot 10, slaap, zin om dingen te doen? Wat helpt je herstellen?\n  \n\n- Hoeveel weken rust denk je nodig te hebben voor je ergens nieuw kunt beginnen?\n  \n\n- Wat wil je dat Giulia doet in dit traject, en wat wil je liever zelf doen?\n  \n\n- Wat houdt je tegen om iets te tekenen bij je werkgever, en wat zou je willen dat er in de plaats gebeurt?\n  \n\n## Voor het gesprek\n\nTwee zinnen die je paraat wil hebben.\n\n- Hoe zeg je in twee zinnen waarom je weggaat, zonder het over vermoeidheid of je werkgever te hebben?  \n  (Bijvoorbeeld: na vijf jaar plaatbewerking wil ik mijn vakmanschap inzetten voor werk dat blijft, zoals erfgoed of museumateliers.)\n  \n\n- Welke vraag zou jij aan een werkgever stellen om te weten of je er past?\n  \n\n- Wie kan als referentie dienen (een collega, een klant, een docent) en mag je die naam gebruiken?\n  \n"
 },
 "gebouwdOp": "2026-10-05T17:23:25.028Z"
};
