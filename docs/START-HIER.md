# Habits installeren en veilig gebruiken

## 1. ZIP uitpakken

Download Habits-App.zip. Klik in Windows met de rechtermuisknop op het bestand en kies **Alles uitpakken**. Open de uitgepakte map `Habits-App`. Daar zie je onder meer `package.json`, `src`, `public`, `docs` en `dist`. Upload niet het ZIP-bestand zelf naar een webhost: de bronbestanden moeten eerst uitgepakt zijn.

## 2. GitHub-account en repository

Ga naar https://github.com en maak een gratis persoonlijk account als je dat nog niet hebt. Dit account is alleen voor het beheren van je appcode; je hoeft in Habits niet in te loggen.

Klik rechtsboven op **+ → New repository**. Geef de repository bijvoorbeeld de naam `habits`. Kies **Private** als je de broncode alleen voor jezelf wilt houden. Maak een lege repository; de ZIP bevat al een README. Klik op **Create repository**.

## 3. Bronbestanden uploaden

Kies in je nieuwe repository **uploading an existing file** of **Add file → Upload files**. Sleep de inhoud van de uitgepakte map naar het uploadvak. Zorg dat `package.json` direct op het hoogste niveau staat, dus niet in een tweede map `Habits-App`.

Upload in ieder geval:

- `src`, `public`, `e2e`, `scripts`, `docs`;
- `index.html`, `package.json`, `package-lock.json`;
- `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `vercel.json`;
- `README.md` en `.gitignore` (een puntbestand kan in Windows verborgen zijn).

`dist` is een meegeleverde kant-en-klare build en hoeft niet mee naar GitHub: Vercel bouwt opnieuw. `node_modules`, je persoonlijke JSON-back-ups en privégegevens horen niet in de repository. Klik op **Commit changes**. Bij veel bestanden kun je meerdere uploadbatches doen of GitHub Desktop gebruiken.

## 4. Vercel koppelen en publiceren

Ga naar https://vercel.com en meld je aan met GitHub. Kies voor persoonlijk gebruik een gratis plan voor zover je gebruik binnen de actuele voorwaarden valt; er zijn geen betaalde appdiensten nodig. Controleer altijd de weergegeven planvoorwaarden voordat je akkoord gaat.

Kies **Add New → Project**, importeer je `habits`-repository en geef Vercel toegang tot die repository. Vercel herkent Vite. Controleer:

| Instelling | Waarde |
| --- | --- |
| Framework | Vite |
| Root Directory | De map met `package.json` (meestal de hoofdmap) |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 22.12 of nieuwer |
| Environment Variables | Geen nodig |

Klik op **Deploy**. Na een geslaagde build verschijnt een projectadres op `vercel.app`. Je hebt geen eigen domein nodig. Gebruik vervolgens steeds hetzelfde productieadres. Previewadressen zijn een andere oorsprong en hebben dus een andere lokale database.

Een openbare app-link bevat alleen appcode. Jouw gewoontes worden niet naar Vercel of GitHub verstuurd. Elke bezoeker heeft zijn eigen lokale gegevens. Je mag de broncode privé houden en de statische app zonder aanmelding aanbieden.

## 5. Op je iPhone installeren

1. Open de productie-link in **Safari** op je iPhone.
2. Wacht tot de app geladen is.
3. Tik op **Deel** (of via het paginamenu eerst **Deel**).
4. Kies **Zet op beginscherm**.
5. Schakel **Open als webapp** in als deze optie beschikbaar is.
6. Laat de naam `Habits` staan en tik op **Voeg toe**.
7. Open Habits vanaf het nieuwe icoon en laat hem één keer volledig online laden.

De precieze benaming kan per iOS-versie verschillen. Apple beschrijft dit ook op https://support.apple.com/nl-nl/guide/iphone/iphea86e5236/ios.

Voer je echte gegevens bij voorkeur in de geïnstalleerde app in. Safari en de geïnstalleerde app kunnen per platform/versie afzonderlijke opslag hebben. Gebruik een externe back-up wanneer je gegevens moet overzetten.

## 6. Offline controleren

Maak een onbelangrijke testgewoonte aan en vink die af. Sluit de app. Zet vliegtuigmodus aan en schakel wifi expliciet uit. Open Habits vanaf het beginscherm. Controleer dat je de gewoonte ziet, dat je haar kunt uit- en aanvinken en dat de wijziging na sluiten en heropenen behouden blijft. Schakel daarna je verbinding weer in.

Werkt het offline openen nog niet, open de app opnieuw online en wacht op voltooiing van de installatie. Gebruik HTTPS en controleer dat je niet in privébrowsen zit. Wis niet zomaar de websitegegevens: daarmee kun je je voortgang verliezen.

## 7. Eerst veilig oefenen met back-ups

1. Ga naar **Profiel → Instellingen → Back-up en herstel**.
2. Kies **Testmodus starten**. Je ziet nu een gele testbanner en voorbeeldgegevens.
3. Kies **Maak back-up**. De bestandsnaam bevat `TEST`.
4. Sla het bestand op in **Bestanden** of **iCloud Drive**. Gebruik eventueel **Deel bestand**.
5. Zoek het bestand daadwerkelijk op. Kies pas daarna **Bestand opgeslagen**.
6. Wijzig in de testmodus iets herkenbaars, bijvoorbeeld je waterinname.
7. Kies **Herstel back-up** en selecteer het eerder opgeslagen TEST-bestand.
8. Lees het overzicht en kies **Ja, gegevens vervangen**.
9. Controleer dat je oorspronkelijke testgegevens terug zijn.
10. Kies **Testmodus afsluiten**. Je echte gegevens staan er weer.

Je kunt ook op **Voer veilige back-uptest uit** klikken. Die voert zelfstandig export, vervanging, herstel en een exacte vergelijking uit in een tijdelijke testdatabase. Geen echte gegevens worden vervangen.

Een back-up uit de testmodus wordt in de echte modus geweigerd. Andersom wordt een echte back-up in de testmodus eveneens geweigerd, om verwarring te voorkomen.

## 8. Echte back-up maken

Sluit eerst de testmodus. Kies **Maak back-up** en bewaar het JSON-bestand buiten de app. Controleer of je het bestand kunt vinden en bevestig dan **Bestand opgeslagen**. Je ziet de datum bij “Laatste externe back-up”.

Na meer dan zeven dagen verschijnt bij het openen van Habits een herinnering, tenzij je die hebt uitgezet. Zonder bevestigde back-up wordt ook een herinnering getoond. Een download aanbieden betekent niet dat iOS hem daadwerkelijk in iCloud heeft opgeslagen. De bevestiging is daarom bewust handmatig.

## 9. Herstellen en lokale herstelpunten

Een herstelbestand wordt vóór de bevestigingsvraag gecontroleerd op formaat, versie, controlecode, structuur, waarden, dubbele ID's en ontbrekende verwijzingen. Daarna kies jij expliciet of de huidige gegevens mogen worden vervangen. De app combineert het bewaren van een herstelpunt en de vervanging in één transactie.

Als een andere tab intussen data wijzigt, wordt herstel geweigerd. Selecteer het bestand opnieuw en beoordeel het nieuwe overzicht. Bij een opslagfout blijft de bestaande database staan. Sluit andere tabbladen en maak ruimte op je apparaat voordat je opnieuw probeert.

Onder **Lokale herstelpunten** kun je terug naar een eerdere momentopname. Er worden maximaal tien punten bewaard. Ze staan op hetzelfde apparaat en verdwijnen ook wanneer alle websitegegevens worden gewist. Een externe back-up blijft nodig.

## 10. Later wijzigen met ChatGPT

Geef ChatGPT je actuele broncode-ZIP of repository en bijvoorbeeld deze opdracht:

> Voeg een nieuwe grafiek toe aan Habits. Behoud de database-identiteit en alle bestaande gegevens. Voer de tests uit en voeg zo nodig een geteste migratie toe. Lever een nieuwe ZIP met een overzicht van de wijzigingen.

Maak vóór iedere update een echte externe back-up. Laat de nieuwe code eerst in een aparte testdeploy controleren. Test daar met een kopie van je export. Upload vervolgens de aangepaste code naar dezelfde GitHub-repository. Vercel maakt een nieuwe deployment op hetzelfde productieadres.

De app laat je zelf kiezen wanneer je een nieuwe beschikbare versie opent. Rond invoer eerst af. Verander de IndexedDB-namen of je productieadres niet zonder een bewust migratieplan. Verwijder de geïnstalleerde app niet als routinematige updatestap. Code vervangen is geen back-up van je gebruikersgegevens: die staan op je telefoon, niet in je ZIP of Git-repository.

## Bronnen voor installatie

Geraadpleegd bij oplevering op 25 oktober 2026:

- Apple: https://support.apple.com/nl-nl/guide/iphone/iphea86e5236/ios
- Vercel/Vite: https://vercel.com/docs/frameworks/frontend/vite
- GitHub repository maken: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
