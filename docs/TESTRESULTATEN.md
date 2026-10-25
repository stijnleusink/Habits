# Testresultaten bij oplevering

Datum: 25 oktober 2026. Alleen hieronder genoemde uitgevoerde controles zijn als geslaagd aangemerkt.

## Uitgevoerd en geslaagd

- **48 unit- en database-integratietests**, verdeeld over 3 testbestanden, met Vitest 3.2.7 en fake-indexeddb.
- Testcommando: `TZ=Europe/Amsterdam npm test`. De suite heeft geen overgeslagen of falende testgevallen in deze run. Nederlandse overgangsdagen zijn ook op hun werkelijke 23-/25-uursduur gecontroleerd.
- **TypeScript-controle** via `tsc -b` tijdens de productiebuild en afzonderlijk `npm run typecheck`.
- **Productiebuild** met Vite 7.3.7 en PWA/Workbox-precache. HTML, JavaScript, CSS en iconen zijn lokaal beschikbaar in `dist`.
- De productie-afhankelijkheden zijn gecontroleerd met `npm audit --omit=dev`: in de uitgevoerde audit werden 0 kwetsbaarheden gerapporteerd. Dit is een momentopname, geen garantie voor toekomstige adviezen.

De ruwe Vitest-resultaten staan in `docs/test-evidence/unit-results.json`.

## Uitgevoerde browsercontroles

De gebouwde productie-app is via de beschikbare Chrome-browser bediend. Dit waren gescripte interacties via de browserbesturing, niet een run van de volledige Playwright-runner.

- Testmodus geopend: voorbeelddata zichtbaar, echte database apart.
- Water van 1,75 naar 2,00 verhoogd via plusknop en daarna handmatig naar 3,00 opgeslagen.
- Interne veilige back-uptest uitgevoerd: export → lege tijdelijke database → import → exacte vergelijking; echte database ongewijzigd.
- Werkelijk JSON-bestand gedownload.
- Extra testgewoonte aangemaakt (4 gewoontes), bestand geselecteerd, importoverzicht gecontroleerd en herstel expliciet bevestigd (3 gewoontes).
- Opnieuw geëxporteerd. Beide JSON-payloads zijn buiten de browser exact vergeleken: **gelijk**, inclusief 3 gewoontes, 42 dagregistraties, 1 doel en 1 reflectiedag. Exporttijd en checksum behoren bij elk afzonderlijk exportbestand en worden daarom buiten de payloadvergelijking gehouden.
- Alle vijf hoofdtabbladen geopend en hun verwachte schermkop gecontroleerd.
- Lichte modus gekozen en de werkelijke `data-theme="light"` bevestigd.
- Alle vijf tabs zijn op 390 en 320 pixels via een tijdelijke iframe-testpagina op horizontale overflow gecontroleerd: 10 controles geslaagd. De testpagina hoort niet bij het opgeleverde product.

## Automatische scenario's voor betrouwbaarheid

De suite dekt onder andere: 75%-dagscore, onvoltooide 2/3-hoeveelheid, zondagplanning, historische doelversies, vier geplande zondagen als streak, pauze, historische correcties, geen dubbele XP, uitsluiten van toekomstige dagen, lege dagen, doelbeloningen, inwisselsaldo, jaarwisseling en schrikkeldag.

Back-upcontroles omvatten: volledige roundtrip in een andere database, lege payload, foutieve JSON, gewijzigde checksum, onbekende versie/formaat, bestandsgrootte, negatieve waarden, nuldoel, onmogelijke afvinkdoelen, dubbele ID's/entries, verweesde verwijzingen, ongeldige datums, extra velden, live/test-verwisseling, stale bevestiging, gelijktijdige schrijfacties uit één of twee verbindingen, tien herstelpunten, en rollback bij een gesimuleerde QuotaExceededError.

Er zijn ook tests voor een volledige reset, reset met verouderde bevestiging, SHA-256-fallback versus Web Crypto en cryptografische UUID-fallback.

## Meegeleverd maar niet als uitgevoerd geclaimd

`e2e/app.spec.ts` bevat zeven Playwright-scenario's voor Chromium en WebKit/iPhone-weergave. De volledige Playwright-runner is in deze omgeving niet gestart. De scenarios omvatten navigatie/persistentie, de complete UI-roundtrip, import annuleren/foutbestand, testisolatie, modusbeveiliging, offline heropenen en numerieke invoer/dagboek/thema.

Lokaal uitvoeren:

```sh
npm ci
npx playwright install chromium webkit
npm run test:e2e
```

## Nog op echte hardware controleren

- Fysieke iPhone, Safari-installatie en de iOS-deelfunctie/Bestanden.
- Werkelijk offline heropenen na serviceworker-installatie. De ontwikkelpreview is gewone HTTP; die kan geen volledige HTTPS-PWA-offlinetest aantonen. De production-build en precache zijn wel gecontroleerd; claim dus geen geslaagde fysieke offlinetest.
- iOS-opslagverwijdering, echte volle apparaatschijf en plotseling afsluiten van het proces.
- Volledige VoiceOver-audit en toetsenbord/safe-area-gedrag op verschillende iPhones.
- Updatecyclus tussen twee opeenvolgende gepubliceerde PWA-versies.

De uitgebreide stappen staan in `ACCEPTATIECHECKLIST.md`.
