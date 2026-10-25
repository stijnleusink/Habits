# Opslag, back-ups en berekeningen

## Gegevensmodel en grenzen

`src/lib/schema.ts` is de centrale, strikte Zod-specificatie. AppData bevat schemaVersion, habits met effective-dated versions, entries, reflections, goals, rewards, redemptions en settings. Een entry is uniek per habitId + lokale datum. Reflecties zijn uniek per datum. Een reward kan eenmaal worden ingewisseld. Doelen verwijzen uitsluitend naar bestaande gewoontes. ID's en datums worden gevalideerd. Onbekende velden worden geweigerd.

HabitSchedule is een union van dagelijks, weekdagen (0=zondag) en specifieke datums. Een HabitPause zit in de dagentry (`paused`) of in een effectief gedateerde versie (`status: paused`). GoalProgress is handmatig in het doel of afgeleid uit entries. Challenges en Achievements zijn vaste regels en worden afgeleid. Dat voorkomt dat oude opgeslagen XP-, badge- of scoretotalen naast nieuw berekende waarden gaan bestaan.

## Transacties en herstel

Er zijn twee vaste databases: `habits-live-v1` en `habits-test-v1`. De tijdelijke verificatiedatabase heeft een unieke `habits-check-…` naam en wordt na de test verwijderd. De echte database wordt tijdens die test alleen gelezen om de ongewijzigde inhoud te controleren.

De database heeft drie stores:

- `current`: één record met volledige gevalideerde AppData en oplopende revision;
- `recovery`: maximaal tien herstelpunten;
- `meta`: apparaatgebonden tijdstip van aangeboden en door gebruiker bevestigde externe export.

Iedere mutatie opent een IndexedDB-readwrite-transactie, leest de op dat moment actuele state, kopieert deze, past een synchrone wijziging toe, herberekent doelvoltooiingen, valideert en schrijft weg. Een dagelijkse momentopname wordt vóór de eerste wijziging van de dag bewaard. Ingrijpende bewerkingen en iedere import maken een extra herstelpunt. Punten en nieuwe state committen atomair. Als iets faalt, wordt de hele transactie afgebroken.

De browser serialiseert overlappende readwrite-transacties op dezelfde stores. Daardoor lezen snelle acties of andere tabbladen altijd de meest recente versie, zonder read-modify-write buiten de transactie. BroadcastChannel en focus/visibility-refresh werken de interface bij. De interface meldt opslagfouten en toont pas een nieuwe state na een succesvolle commit.

Imports worden vóór de transactie geparsed, gevalideerd en op checksum gecontroleerd. De gebruiker krijgt het aantal gewoontes, registraties, doelen en reflecties te zien. De bevestiging is gebonden aan de revision van de huidige database. Bij een wijziging sinds het openen van het bevestigingsscherm wordt herstel geweigerd.

De checksum gebruikt SHA-256 over canoniek gesorteerde JSON-sleutels, inclusief format, schemaVersion, appVersion, mode, exportedAt en data. Web Crypto wordt gebruikt indien beschikbaar; de geteste `@noble/hashes`-implementatie is de fallback. De checksum is een integriteitscontrole, geen digitale handtekening en geen versleuteling.

## Wat een back-up bevat

Alle primaire gebruikersgegevens worden geëxporteerd, inclusief historische gewoonteversies, dagnotities, stemming, energie, instellingen, doelen, beloningen en inwisselingen. De export wordt uit een consistente database-read gemaakt; wijzigingen daarna zitten in de volgende export.

Apparaatgebonden herstelpunten en externe-bevestigingsmetadata zijn bewust apart. Een import is geen bewijs dat er nu een nieuwe externe back-up is gemaakt. Daarom vernieuwt import de externe datum niet. Uit een payload kunnen scores, XP, levels, badges en uitdagingen volledig opnieuw worden berekend.

Een bestand moet formaat `habits-backup` en schemaversie 1 hebben. Een onbekende versie wordt afgewezen; er wordt nooit gegokt naar velden of gedeeltelijk geïmporteerd. Maximaal 25 MiB per bestand beschermt tegen buitenmatig grote imports. Gegevens die niet bij de actieve modus passen worden geweigerd.

## Historische instellingen

De geldende versie is de laatste versie met effectiveFrom ≤ dag. De dag moet ook binnen start/einde vallen en bij het schema horen. Nieuwe versies wijzigen eerdere dagen niet. De editor gebruikt standaard vandaag als ingangsdatum. Een wijziging vóór vandaag vraagt extra bevestiging. Archiveren stopt de planning vanaf de ingangsdatum en behoudt eerdere entries en versies.

Definitief verwijderen vraagt bevestiging, maakt een herstelpunt en verwijdert de entries van die gewoonte. Bij gekoppelde doelen wordt verwijderen geblokkeerd: eerst ontkoppelen of archiveren. Historische correcties gaan via dezelfde centrale functies als invoer van vandaag.

## Rekenen

- Dagscore = volledig behaalde / meetellende ingeplande gewoontes × 100.
- Iedere gewoonte weegt even zwaar. Gedeeltelijke voortgang is alleen op de eigen voortgangsbalk zichtbaar.
- Pauzes en niet-geplande dagen worden uit teller én noemer verwijderd. Zonder meetellende gewoontes is de score `null`, geen 100%.
- Gemiddelden zijn het rekenkundig gemiddelde van geldige dagscores. Toekomstige dagen worden niet meegenomen.
- Week loopt maandag–zondag. De huidige week en maand zijn tot en met vandaag; de vorige periodes worden als afgesloten periode vergeleken.
- Algemene streak = opeenvolgende perfecte meetellende dagen. Lege/pauzedagen zijn neutraal. Een onvoltooide lopende dag breekt de streak nog niet.
- Gewoonte-streak = succesvolle opeenvolgende geplande uitvoeringen. Niet-geplande dagen zijn neutraal.
- Getallen worden bij voortgangsmutaties op zes decimalen afgerond om zwevende-kommafouten niet op te stapelen.

## XP, doelen en beloningen

Een voltooide gewoonte geeft 10 XP. Een perfecte dag met minimaal één meetellende gewoonte geeft 20 extra XP. Een behaald week-/maand-/langetermijndoel geeft 50/100/150 XP. XP wordt steeds uit de huidige brongegevens berekend, niet als herhaalde gebeurtenissen opgeteld. Uit- en weer aanvinken kan dus nooit extra XP opleveren.

Level 1 begint bij 0 XP. Voor level L is de drempel `25 × (L−1) × (L+2)`. Dat geeft 0, 100, 250, 450, 700, 1000, … XP. De voortgangsbalk toont het aandeel binnen het huidige level.

Gekoppelde doelen tellen unieke voltooide entries of de som van ingevulde hoeveelheden in hun start/eindperiode. Gepauzeerde en niet-geplande entries tellen niet. Hoeveelheiddoelen tellen alleen registraties waarvan de historische eenheid exact overeenkomt met de doeleenheid. De app telt bijvoorbeeld liters niet op bij milliliters; er is geen impliciete eenhedenconversie. Doelen worden niet stilzwijgend elke week gekopieerd: maak een nieuw week- of maanddoel voor de nieuwe periode. Uitdagingen verversen wel automatisch per week.

Een reward redemption bewaart de kostprijs als snapshot. Besteedbaar saldo = max(0, carrière-XP − alle ingewisselde kosten). Inwisselen verlaagt carrière-XP niet. Als historische correcties de verdiende XP onder het reeds bestede totaal brengen, blijft het saldo nul en wordt het verschil zichtbaar. Nieuwe XP vult dat verschil eerst aan. Reeds ingewisselde beloningen worden niet opnieuw beschikbaar en inwisselen wordt binnen een transactie op beschikbaar saldo en duplicaten gecontroleerd.

Badges worden eveneens herberekend bij historische correcties. Een badge kan daardoor vervallen als de onderliggende prestatie niet meer bestaat. De acht voorwaarden staan in de interface.

## Records

Hoogste dagscore en meeste voltooiingen per dag worden over alle dagen tot en met vandaag berekend. Meeste perfecte dagen in één week is het maximum aantal 100%-dagen in een maandag–zondagblok (ook de huidige week). Hoogste weekgemiddelde en beste kalendermaand nemen uitsluitend afgesloten kalenderperiodes met minimaal één geldige dag. Ranglijsten gebruiken alleen gewoontes met minimaal drie afgesloten geplande dagen.

## Datums, offline en updates

Een lokale datum wordt opgebouwd uit getFullYear/getMonth/getDate, niet door toISOString af te knippen. Datumstappen gebruiken lokale middagen en kalenderbewerkingen, niet herhaald optellen van 24 uur. Op openen, focus, visibilitychange, bij acties en via een korte timer wordt de dag opnieuw bepaald.

De serviceworker precachet de productie-HTML, JavaScript, CSS en iconen. Er zijn geen externe fonts of API-aanroepen nodig voor gebruik. Workbox activeert een update na gebruikersactie, niet midden in invoer. IndexedDB is niet onderdeel van de statische cache en wordt bij een normale code-update niet gewist.

## Migraties en onderhoud

IndexedDB-versie 1 wordt in een upgrade-transactie aangemaakt. Voor een toekomstige versie:

1. Behoud de bestaande databasenamen en stores; verhoog alleen de openDB-versie.
2. Voeg een expliciete, geteste migratiestap toe voor elke eerdere versie.
3. Houd migraties synchroon/IDB-transactiegebonden; geen netwerk of langlopende crypto in de upgrade.
4. Abort bij fouten; nooit databases wissen om een migratiefout te verbergen.
5. Voeg een aparte, expliciete exportmigratie toe als het JSON-schema verandert.
6. Test oude brongegevens, een afgebroken upgrade en een roundtrip vóór publicatie.

Er bestaat geen ongeteste conversie van andere habit-apps of oude, onbekende JSON-formaten. Daarvoor is een afzonderlijke migrator nodig.
