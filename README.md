# Habits

**Your progress. Every day.** Persoonlijke, offline bruikbare PWA in het Nederlands. React + TypeScript + Vite + IndexedDB. Geen account, backend, tracking, betaalde API of cloudopslag in de app.

## Begin hier

1. Pak de ZIP volledig uit.
2. Lees **[START-HIER.md](docs/START-HIER.md)** voor installatie op je iPhone via GitHub en Vercel.
3. Open na installatie **Profiel → Instellingen → Back-up en herstel**.
4. Kies **Testmodus starten** om met voorbeelddata te oefenen. Je eigen database blijft apart.

De bijbehorende privéweergave via ChatGPT Sites heeft toegangscontrole van de host. Voor zelfstandig gebruik zonder ChatGPT-aanmelding publiceer je de ZIP via je eigen Vercel-project. De app zelf bevat geen accountfunctie. De broncode en productiebuild zijn overdraagbaar.

## Lokaal starten

Installeer Node.js 22.12 of nieuwer (aanbevolen: actuele LTS).

```sh
npm ci
npm run dev
```

Open het adres dat Vite toont. Gebruik localhost, geen file://. Voor installatie en offline testen:

```sh
npm run build
npm run preview
```

PWA/serviceworker werkt op HTTPS of localhost. Op gewone HTTP is offline installatie niet beschikbaar. Gewoonte-ID's en JSON-controlecodes hebben een cryptografische fallback zodat de gewone app ook in een HTTP-ontwikkelpreview kan worden gecontroleerd.

## Tests

```sh
npm run typecheck
npm test
npm run build
```

Unit- en database-integratietests gebruiken Vitest en fake-indexeddb. Ze testen volledige roundtrips, foutbestanden, ongeldige waarden, dubbele registraties, transactierollback bij opslagfouten, wijzigingen uit twee verbindingen, testisolatie, historie, streaks, XP, doelen, beloningen en lokale datums.

Aanvullende browsertests, inclusief WebKit met iPhone-viewport:

```sh
npx playwright install chromium webkit
npm run test:e2e
```

Op Linux kan `npx playwright install --with-deps chromium webkit` nodig zijn. Gebruik een geïsoleerde testbrowser; de suite maakt eigen browsercontexten. Met `HABITS_TEST_URL` kan een al draaiende testomgeving worden gebruikt. Zet dit uitsluitend op je eigen testdeploy, niet op een gebruikerssessie. De standaardconfiguratie bouwt en start zelf de productiepreview.

**[TESTRESULTATEN.md](docs/TESTRESULTATEN.md)** vermeldt precies wat bij oplevering daadwerkelijk is uitgevoerd en wat nog op een echte iPhone gecontroleerd moet worden. De aanwezigheid van een testbestand is geen bewijs dat die browsertest al is uitgevoerd.

## Inbegrepen

- Vijf tabs: Vandaag, Kalender, Statistieken, Doelen, Profiel.
- Afvinken, aantallen, hoeveelheden en tijd; plus/min en handmatige invoer.
- Dagelijks, geselecteerde weekdagen of specifieke datums; begin/einde, pauzeren en archiveren.
- Historische versies met ingangsdatum; oudere dagen corrigeren.
- Live dagscores, week- en maandgemiddelden, dag/week/maandgrafieken, records en gewoonteanalyses.
- Week-, maand- en langetermijndoelen; handmatige of gekoppelde voortgang.
- Afgeleide XP, oplopende levels, acht badges, drie wekelijkse uitdagingen en eigen beloningen.
- Stemming, energie, dagboek, reflectievragen en notities per gewoonte.
- Donker, licht, automatisch thema en drie accentkleuren.
- Externe JSON-back-ups, importvalidatie, expliciete vervangingsbevestiging, lokale herstelpunten en testmodus.
- PWA-manifest, app-iconen, precache en handmatig geaccepteerde updates.
- Alle bronbestanden, lockfile, tests, productiebuild, Vercel-configuratie en documentatie.

## Projectindeling

```text
src/
  components/       Herbruikbare velden, dialogen, voortgang en kaarten
  features/         Dagoverzicht, gewoontes, kalender, analyse, doelen, profiel, back-ups
  database/         IndexedDB-transacties, metadata en herstelpunten
  lib/              Schema, rekenlogica, acties, datums en back-upformaat
  tests/            Geautomatiseerde unit- en database-integratietests
  App.tsx           Navigatie, PWA-status en herinneringen
  app-context.tsx   Databaseverbinding, opslagmeldingen en synchronisatie tussen tabbladen
  styles.css        Responsive, toegankelijk licht/donker ontwerp
public/icons/       App-iconen en Apple-touch-icon
scripts/            Hulpmiddelen voor packaging en reproduceerbare controle
e2e/                Playwright-browsertests
dist/               Geteste productiebuild; Vercel bouwt deze opnieuw uit de broncode
docs/               Installatie, veiligheid, berekeningen, acceptatie en testrapport
```

## Beperkingen

Geen synchronisatie tussen apparaten, automatische iCloud-write, pushmeldingen of gegarandeerde opslag door iOS. JSON-bestanden zijn leesbaar en niet versleuteld. Een checksum ontdekt wijzigingen/beschadiging maar bewijst niet wie een bestand gemaakt heeft. Testbestanden kunnen uitsluitend in testmodus worden hersteld. Back-ups zijn maximaal 25 MiB; de app ondersteunt maximaal 20.000 gewoontes en 500.000 dagregistraties per bestand om corrupte of buitenmatig grote invoer te begrenzen. Er is geen dagelijkse kunstmatige limiet op het toevoegen van gewoontes in normaal persoonlijk gebruik.

Alle gebruikersgegevens staan in IndexedDB. Alleen actuele brongegevens worden geëxporteerd: gewoontes en versies, dagregistraties, reflecties, doelen, instellingen, beloningen en inwisselingen. Statistieken, badges, uitdagingen en XP worden daaruit opnieuw berekend. Lokale herstelpunten en de apparaatgebonden bevestiging van een externe back-up vallen niet onder het exportpakket; een import pretendeert dus nooit een nieuwe externe back-up te zijn.

Zie [ARCHITECTUUR.md](docs/ARCHITECTUUR.md) en [ACCEPTATIECHECKLIST.md](docs/ACCEPTATIECHECKLIST.md).
