# Assessment-gated Completion: technischer Pilot

Stand: 31. Oktober 2026. Dieses Dokument beschreibt den implementierten lokalen
Pilot und seine Prüfpfade. Der verbindliche Entwurf bleibt der
[Umsetzungsplan](assessment-gated-completion-implementation-plan.md), die
fachliche Semantik das [Konzept](../concept/skill-graph/assessment-gated-completion.md).
Produktive Aktivierung, Veröffentlichung und beobachtete Coach-Host-Abnahme
sind eigenständige Schritte.

## Umfang und Ergebnisprinzip

Das Profil `math-dot-product-projection` umfasst genau zwei kanonische Ziele:

| Rolle | Ziel-ID |
| --- | --- |
| Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen | `3016ec37-1c2e-47db-83f5-e767923bc97e` |
| Skalarprodukt über eine orthogonale Projektion erklären: erforderliche Prüfung | `e98672c6-871a-5d0b-889c-5afc51040f0d` |

Die [statische Prüfung der Aufgaben und Rubrik](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-completion/math-dot-product-projection-2026-10-31.md)
begründet ausschließlich den Erlass des ersten Ziels in diesem Abschnitt,
wenn die Prüfung gemeistert ist. Sie ist eine Maschinenprüfung. Das Profil
behauptet keinen Abschluss von Q2, eines Schuljahrs oder des Fachs Mathematik.

Pro atomarem Lernziel bleibt nur `mastery ∈ {0,1}` gespeichert. Neue allgemeine
Mastery-Writes akzeptieren nur diese Werte; historische Werte ab `0.9` bleiben
beim Lesen kompatibel. Prüfungen verwenden denselben Mastery-Zustand.
Vorhandene Prüfungsmastery zählt unmittelbar. Weder ein Fehlversuchsstatus
noch ein Erlass- oder Anerkennungsregister wird angelegt. Der Erlass verändert
keine Einzelmastery, Globalstatistik oder Lernplanpunkte.

**Die ausführliche Prüfungsbewertung durch die KI bleibt erhalten.** Nach der
vollständigen Abgabe gibt der Coach bei bestandenen und nicht bestandenen
Prüfungen die erreichten und maximalen Punkte, die Bestehensentscheidung und
eine nachvollziehbare Rückmeldung je Bewertungskriterium. Dazu gehören richtig
gelöste Anteile, begründete Punktabzüge, konkrete Verbesserungen und die
Besprechung der freigegebenen Lösung. Die binäre Mastery betrifft das
gespeicherte Zielergebnis; die differenzierte Bewertung bleibt im Gespräch.
Maßgeblich ist der [bestehende Prüfungsablauf](../concept/skill-graph/node-types.md#scoring-and-mastery).

## Laufzeit und Navigation

`CompletionProfileCompiler` validiert den vollständigen kanonischen Basisgraphen
und kompiliert den atomaren Voraussetzungskontext. `CompletionEvaluator`
berechnet daraus und aus dem aktuellen gemeinsamen Mastery-Snapshot rein
funktional den Abschluss. Versteckte, geerbte und fachübergreifende
Voraussetzungen bleiben im Kontext; nur die ausdrücklich referenzierten
Level-2-Ziele bestimmen den Zielnenner.

Die gemeinsame Zustandsantwort enthält `levelCompletion`; Cockpit und
Lerncoach erhalten dieselbe Fachberechnung. Bereits das Profilangebot nennt seinen
statischen Zielumfang, die Zahl erforderlicher Prüfungen sowie deren genaue Titel
und aktuelle Startverfügbarkeit, bevor es aktiviert wird. Die Vorschau verwendet
den gemeinsamen Mastery-Snapshot; sie führt keinen Evaluatorlauf je angebotenem
Profil aus. Aufgaben, Lösungen und Bewertungsregeln gehören nicht in diese
Vorschau. Automatische Empfehlungen bleiben
auf offene Abschnittsziele beschränkt. Unterstützung und freiwillige
Vertiefung sind bewusste Entscheidungen. Eine ausdrücklich angenommene
Fokusergänzung bewahrt alle unabhängigen bisherigen Fokuswurzeln und ändert
den Abschlussumfang nicht. Generische Zielwahl kann die aktive Profilroute
nicht umgehen: Sie übernimmt nur das bereits ausdrücklich gewählte Ziel im
Voraussetzungskontext. Außerhalb liegende alte Aktivziele werden beim Lesen
verborgen und beim schreibenden Zustandsabruf kontrolliert bereinigt.
Eine nachträglich durch Prüfungsmastery entbehrliche laufende Arbeit bleibt
erhalten; ihre ausdrücklich gewählte freiwillige Fortsetzung übersteht Reloads,
ohne dadurch eine neue Hilfskette zu eröffnen. „Für heute beenden“ pausiert eine
gültige Profilroute vor oder nach Abschluss, solange keine Direktprüfung läuft.
Die Aktion leert nur die aktive Arbeit, bewahrt Profilwahl, Fokus und Mastery
und lässt keine automatische Empfehlung oder Wiederaufnahme starten. Erst eine
frische ausdrücklich angenommene Arbeitswahl setzt die Route fort. Die reguläre
Lernplanung pausiert abgeleitet aus der Profilnavigation; ihre gespeicherte Präferenz wird nicht
überschrieben. Beim Verlassen gilt auch eine zwischenzeitlich geänderte Präferenz.

Erlassbegründungen stammen aus derselben aktuellen Auswertung wie die Zählung.
Die Standardantwort enthält höchstens drei konkrete Zielbegründungen mit jeweils
höchstens drei zugehörigen gemeisterten Prüfungen sowie deren Gesamtzahl.
Cockpit und Coach erklären den Geltungsbereich; eine veraltete oder nicht
verfügbare Berechnung übernimmt keine frühere Begründung.

Im Lernzielbaum erscheint an den ausdrücklich entfallenden, noch nicht
gemeisterten Vorbereitungszielen ein **blaues Schild mit Häkchen** anstelle
des roten Ziel-Icons. Der Tooltip **„Für diesen Abschnitt durch Prüfung
abgedeckt“** zeigt bei Mausberührung, Tastaturfokus oder Antippen den Abschnitt
und, soweit die begrenzte Serverantwort sie enthält, die zugehörigen bestandenen
Prüfungen. Die Zeile bleibt einzeilig; der Hinweis
verändert weder Einzelmastery noch Fortschrittsbalken oder Zähler. Bei
ungültigem oder veraltetem Zustand und beim Verlassen des Profils verschwindet
er. Aus der Abschlusskarte führt **„Im Lernzielbaum anzeigen“** zum jeweiligen
Ziel, öffnet seinen Pfad und verschiebt die Baumansicht dorthin, ohne Lernfokus,
Mastery oder Prüfungsnavigation zu speichern. Automatisch geöffnete Baumknoten
lassen sich anschließend manuell schließen und bleiben bei unveränderten
Zustandsaktualisierungen geschlossen.

Der Direktstart führt aus dem Cockpit zunächst in die bestehende Anbieterwahl.
Erst der tatsächliche Lernstart wählt gegebenenfalls das Profil und bindet die
gewählte Prüfung atomar an eine frische Claude-Sitzung. Im unterstützten
Claude-Coach kann dieselbe bewusste Prüfungswahl unmittelbar in der bestehenden
Sitzung erfolgen. Die Ausnahme gilt nur für diese Prüfung, einschließlich im
Striktmodus. Andere Sitzungen erhalten keine Aufgaben- oder
Bewertungsberechtigung aus dieser Bindung. Eine noch gültige Bindung bleibt
bei einem Cockpit-Refresh erhalten. Bei Ablauf oder ungültig gewordener
Generations-/Profil-/Scope-Bindung zeigt ein reiner Read keine laufende Prüfung;
der schreibende Cockpitabruf pausiert und bereinigt sie einmalig. Der verifizierte
Besitzer kann neutral beenden, ohne eine neue fachliche Prüfungsfreigabe zu
benötigen. Fremde Sitzungen bleiben gesperrt. Veraltete Aktionen ergeben einen
erklärten Konflikt; Inhalts- und Profilupdates werden von einer Änderung des
Persönlichen Lehrplans unterschieden.

Nach einer Rückmeldung ohne erfolgreichen Mastery-Write kann die lernende
Person ausdrücklich Unterstützung, einen neuen Versuch oder Pause wählen.
Diese neutralen Navigationen übertragen keinen Fehlstatus, Score oder Chattext.
Ein neuer Versuch macht alte Bewertungs-Capabilities durch den Revisionswechsel
ungültig. Ein bestätigter Erfolg beendet die Direktbindung im selben Write.
Der vorhandene genaue Schreib-Replay bleibt beim Coordinator.

Die private `completion_workflow`-Spalte enthält ausschließlich Navigation und
Sitzungsbindung. Sie fehlt in gewöhnlicher Entitätsserialisierung und signiertem
Export. Ein erfolgreicher Import entfernt sie vor der Fokusrevalidierung;
fehlgeschlagene Importvalidierung verändert den Ablauf nicht.

Öffentlicher Lernkarten-Sync verwendet eine serverseitige Compare-and-set-
Revision. Er kann keine bestandenen `verifiedRecall`-Daten erzeugen oder
überschreiben. Neue signierte Exporte enthalten die nötigen Kartenstände;
nicht sicher wiederherstellbare alte Kartenarchive werden vor Änderungen
abgewiesen. Technisch unlesbare Pflichtdaten ergeben `unavailable`.

SRS-Snapshots, normale Mastery-Overlays, Frontier-Verfügbarkeit und Kartenzählung
verwenden denselben aufruflokalen Batchresolver. Er liest die benötigten
Zustandszeilen gebündelt in `IN`-Blöcken von höchstens 500 IDs und liest identische
Deckressourcen innerhalb des Aufrufs nur einmal. Ein echter H2-SQL-Zähltest
belegt pro geprüftem Resolver-/Overlaypfad für ein und 40 SRS-Ziele jeweils eine
Zustandsabfrage; ohne SRS-Ziele entfallen Zustandsabfrage und Deckzugriff. Es gibt keinen personenbezogenen
Cache über Requests hinweg.

Fehlende, unlesbare oder leere Decks, fehlende Vorder-/Rückseiten und beschädigte
bestehende Kartenstände sind technische Fehler. Für den betroffenen
Abschluss-Snapshot ergeben sie `unavailable`, keinen erfundenen Fehlversuch
und keinen Abschluss. Das tolerante normale Overlay bewahrt bei einem solchen
Ziel die vorhandene Mastery; Fokus und gespeicherte Ergebnisse bleiben erhalten.
Ein gültiges Deck ohne bisherigen Kartenstand ergibt dagegen regulär nicht
gemeistert. Diese Unterscheidungen sind durch echte Integrationsfälle geprüft.

## Aktivierung und Betrieb

Die Funktion ist standardmäßig verfügbar. Es müssen keine Completion-Variablen
zum Einschalten gesetzt werden. Die geprüften Profile werden geladen; passende
aktuelle Lehrplanbasen werden im Repository- und Paketmodus automatisch ermittelt.
Lehrpläne ohne solche Regeln bieten keine Abkürzung an. Das aktuelle fachlich
freigegebene Angebot bleibt **Skalarprodukt und orthogonale Projektion**; die
Standardeinstellung erzeugt keine zusätzlichen Abdeckungsbehauptungen.

Im Cockpit unter **Konfiguration → Lerneinstellungen** ist
**„Abkürzungen durch bestandene Prüfungen nutzen“** standardmäßig ausgewählt.
Die Einstellung gilt pro SkillPilot-ID und wird mit den anderen Einstellungen
gespeichert. Erst das Speichern wirkt auf Cockpit und Lerncoach. Die Auswahl
eines Lernabschnitts bleibt eine bewusste Lernentscheidung, keine technische
Freischaltung.

Abschalten beendet die gewählte Abschlussroute und einen gegebenenfalls laufenden
Prüfungsdirektstart. Der Hinweis neben der Einstellung erklärt diese Wirkung.
Bereits gespeicherte Mastery, reguläre aktive Lernziele, Lernfokus und persönliche
Planpräferenz bleiben erhalten; normale Prüfungen mit erfüllten Voraussetzungen
bleiben nutzbar. Wiedereinschalten bietet aktuelle Abschnitte erneut an und stellt
keine alte Prüfungssitzung wieder her. `useAssessmentShortcuts` ist eine
Lernpräferenz, kein zusätzlicher Ergebniszustand eines Lernziels. Bestehende IDs
und ältere Sicherungen erhalten den Standardwert `true`; ein gespeichertes
`false` bleibt beim Export und Import erhalten.

Für den Betrieb bleiben optionale Einschränkungen erhalten:

- `SKILLPILOT_COMPLETION_ENABLED=false` schaltet die Funktion serverweit ab.
- `SKILLPILOT_COMPLETION_ENABLED_PROFILE_IDS` beschränkt bei einer nichtleeren
  Liste das Angebot auf diese geprüften Profile. Leer bedeutet alle geprüften
  Profile innerhalb der unten beschriebenen Kapazitätsgrenzen.
- `SKILLPILOT_COMPLETION_WARMUP_CURRICULUM_IDS` beschränkt bei einer nichtleeren
  Liste die vorzubereitenden Basen. Leer verwendet die automatische Ermittlung.
  Bestehende explizite Werte bleiben wirksam; sie sind keine Voraussetzung mehr.

Die statischen Kontexte werden vor Readiness vorkompiliert, außerhalb einer
Lernendentransaktion. Ein fehlerhafter oder nicht im Cache haltbarer konfigurierter
Kontext verhindert einen scheinbar betriebsbereiten Pilotstart. Danach wird die
verifizierte Menge aus Basis-/Profilpaaren unveränderlich versiegelt. Eine
unbekannte Basis, eine nicht vorbereitete Paarung oder ein später fehlender
vorbereiteter Cacheeintrag wird vor Loader beziehungsweise Compiler abgewiesen;
ein Lernendenrequest kann dadurch keine kalte Kompilierung unter seiner Sperre
auslösen. Die persönlichen Level-2-Zielmengen bleiben variabel.
Cache-Schlüssel binden Generation, Profil-/Scope-Revision, kanonische Basis
und Auflösungssemantik. Die aktuelle Laufzeitkapazität erlaubt ausdrücklich
höchstens ein freigegebenes Profil und eine erforderliche Prüfung je
kompiliertem Profil. Die standardmäßige Verfügbarkeit ändert diese Grenze nicht.
Eine Überschreitung bricht vor Readiness mit Diagnose ab, statt Listen still
abzuschneiden. Compiler und portabler Datenvertrag behalten ihre allgemeinere
Semantik. Eine spätere Mehrprofil- oder Großprüfungsfreigabe braucht begrenztes
Nachladen und eine neue Prüfung der Projektionsbudgets.
Die aktuelle persönliche Level-2-Anwendbarkeit wird
auch bei einem Cachetreffer geprüft. Die unterstützten Anwendbarkeitsdimensionen
sind `schoolForm`, `jurisdiction`, `stage`, `courseProfile` und `durationModel`.
Nicht aufgelöste Angaben werden nicht als Zustimmung interpretiert; unbekannte
Dimensionen aktivieren kein Profil.

Repository-Landschaften, Mappings, Decks, Profile und Reviewbindungen bleiben
pro Prozess auf eine Generation gepinnt. Eine unerwartete Dateiänderung setzt
die Profilroute auf `unavailable`, bevor unabhängiges Nachladen alte und neue
Inputs mischt. Ein neuer Stand wird durch einen kontrollierten Prozessneustart
aktiviert. Im Paketmodus stammen die Completion-Dokumente ausschließlich aus
dem verifizierten Runtime-Snapshot.

Der optionale Paketvertrag liegt unter `contracts/curriculum-package/v1.1/`.
Er erweitert Discovery und Capability ausdrücklich. Alte V1-Artefakte und
Vertrauensprofile bleiben erhalten. Ein normaler Provisioner verwendet für
solche Kandidaten ausdrücklich `--contracts-dir contracts/curriculum-package/v1.1`.
Für das reine Mathematik-Paket ist die Warmup-Basis
`68a8ac50-f5f5-4e24-8aa9-5e408ca01ced`; sie ersetzt dort den Repository-Root.
Eine lokale Installation in einen privaten Teststore ist keine
Produktionsaktivierung oder Veröffentlichungsfreigabe.

Es gibt derzeit genau ein fachlich statisch geprüftes Pilotprofil. Nach seinem
Abschluss wird kein nächster Lernabschnitt erfunden oder automatisch begonnen.
Ein weiterer Abschnitt setzt ein eigenes geprüftes, anwendbares Profil und eine
bewusste Auswahl voraus; die normale Lernansicht bleibt ausdrücklich erreichbar.

Der Pilot unterstützt den neuen Ablauf zunächst über den bedingt angebotenen
Claude-Toolvertrag. Dessen technische Quittung bindet den SHA-256-Fingerprint
der tatsächlich registrierten Instructions und Tooldefinitionen gemeinsam mit
der unveränderlichen Curriculumgeneration an die konkrete Sitzung. Eine frische
Sitzung beginnt mit einer serverseitigen `pending`-Bindung. Nur eine gültige,
zweck-, sitzungs- und zeitgebundene Capability kann sie idempotent bestätigen;
NULL, alte Versionsmarkierungen und fremde Fingerprints oder Generationen
werden nicht automatisch aufgewertet. Die Quittung ändert nur Sessionmetadaten,
keine Lernendenrevision, Zielwahl oder Mastery.

Ein aktiver Profilweg pausiert bis zur Bestätigung auch Aufgaben, Bewertung und
Bildausgabe; der Guard greift vor einem gespeicherten Schreib-Replay. Ohne aktives
Profil bleibt normales Lernen möglich. Ein optionales technisches Angebot im
normalen Kontext erlaubt die Bestätigung und anschließend die erste bewusste
Abschnittswahl direkt im Coach. Dieser technische Austausch braucht keine
zusätzliche Bestätigung durch die lernende Person. Alte oder inkompatible
Sitzungen können den aktiven Profilweg nicht ungefiltert fortsetzen und benötigen
einen frischen unterstützten Start. ChatGPT und Gemini sind für diese Funktion
vorerst zurückgestellt. Ihre spätere Umsetzung soll denselben vollständigen
Ablauf wie Claude innerhalb der jeweiligen Sitzung unterstützen; ein
Cockpit-Link als Ersatz für den direkten Prüfungsstart ist nicht vorgesehen.

Diese Quittung belegt eine technische Sitzungskommunikation, **nicht**, dass ein
Host oder Modell die Instructions vollständig gelesen oder befolgt hat. Echte
Host-Abnahme bleibt separat. Veröffentlichte Providerpakete wurden nicht
überschrieben; weitere Anbieter benötigen Adapter- und Hostprüfung.

Die Micrometer-Metriken `skillpilot.completion.compile`, `.evaluate`,
`.cache.requests`, `.cache.evictions`, `.cache.contexts`, `.cache.nodes`,
`.cache.edges`, `.scope.status` und `.revision.conflicts` erfassen Berechnungen,
Cachebetrieb, Scopezustände und konkret abgewiesene Completion-Revisionskonflikte.
Labels stammen aus festen Mengen; Lernenden-, Profil- und Sitzungskennungen
werden nicht als Labels verwendet. Die Timer für Compiler und Evaluator
enthalten keine HTTP-/Datenbanklatenz. Statuszähler zählen Projektionen, keine
eindeutigen Personen oder fachlichen Lernerfolge. Der Konfliktzähler verwendet
nur die festen Quellen `ui` und `coach`; fehlende Eingaben oder andere
HTTP-409-Ursachen werden nicht als Revisionskonflikt gezählt.

## Reproduzierbare Prüfung

```sh
npm --prefix app run check:assessment-completion-profiles
npm --prefix app run test:assessment-completion-profiles
npm --prefix app run test:level-completion
npm --prefix app run test:level-completion-browser
```

Im Backend wird das im Repository festgelegte JDK verwendet. Der PostgreSQL-
Test benötigt eine eigene Testdatenbank `skillpilot_completion_test` auf
Loopback. Er legt ein zufälliges Schema an, führt die echten Liquibase-
Migrationen aus und entfernt anschließend nur sein eigenes Schema:

```sh
cd backend
SKILLPILOT_TEST_POSTGRES_URL=jdbc:postgresql://127.0.0.1:5432/skillpilot_completion_test \
SKILLPILOT_TEST_POSTGRES_USER=completion_test \
SKILLPILOT_TEST_POSTGRES_PASSWORD=completion-test-only \
./gradlew test --tests '*AssessmentCompletionPostgresIntegrationTest'

SKILLPILOT_COMPLETION_BENCHMARK=true \
./gradlew test --tests '*CompletionPerformanceTest'
```

Der eigene [CI-Workflow](https://github.com/enpasos/skillpilot/blob/main/.github/workflows/assessment-completion.yml)
führt Authoring, gemeinsame Fixtures, UI-/Browser-, Backend-, Karten- und
PostgreSQL-Prüfungen aus und kontrolliert ausdrücklich, dass Pflichtfälle
tatsächlich ausgeführt wurden. Der Benchmark ist als zusätzliche Messung
aufrufbar; schwankende Shared-Runner-Zeiten werden nicht als harte
Millisekunden-Assertions benutzt.

Die [lokale Kernmessung vom 30. Oktober 2026](../qa-ci/status/assessment-completion-performance-2026-10-30.json)
enthält 13 deterministische Graphformen unter Corretto 25.0.2 auf einem
Xeon E-2286M mit 16 logischen CPUs in WSL2. Beim Datensatz mit genau 10.000
atomaren Zielen und 100.000 expandierten Kanten betrug die warme p95-Auswertung
2,085 ms ohne Mastery beziehungsweise 1,813 ms mit gemeisterter Prüfung;
die erste Kompilierung dieses Datensatzes im bereits laufenden JVM-Prozess
dauerte 209,990 ms. Acht gleichzeitige erste Zugriffe verwendeten dieselbe
kompilierte Instanz. Der Bericht nennt Aufwärm-/Messzahlen, Speicherwerte und
Grenzen: Er ist keine HTTP-/Datenbank-, Produktiv- oder Host-Latenzmessung und
keine Zusage für andere Hardware oder Curriculumdaten.

Die lokale [Paket- und Startup-Probe](../qa-ci/status/assessment-completion-package-loader-2026-10-30.json)
belegt den regulären Install-/CAS-Pfad eines echten Mathematik-Pakets
`0.1.0-completion.2` mit 1.252 Zielen und 836 Bildern. Sein JSON-ZIP hat SHA-256
`fe52bf0608117e08779e47391c0d32521bf97749b944dd3b70c129207257d839`.
Der echte Dateisystem-Loader, Completion-Katalog, Compiler und Evaluator wurden
gegen diesen privaten Teststore geprüft: Bestehende Prüfungsmastery genügt für
den abgeleiteten Abschluss, ohne das Mastery-Set zu verändern. Bildbytes werden
nicht zusätzlich als Payload im Runtime-Snapshot behalten. Die einzelne Probe
lief mit maximal 384 MiB Heap; etwa 24,8 MB waren nach GC belegt. Das ist keine
allgemeine Speicher- oder HTTP-Latenzzusage.

Dieselbe Nachweisdatei enthält einen echten Repository-Kaltstart einschließlich
Katalogpinning und beider vorbereiteter Basen: 6.524 Ziele im Root, 1.252 Ziele
in Mathematik, jeweils zehn Ziele im kompilierten Prüfungskontext. Der Warmup
benötigte in dieser einzelnen lokalen Messung 767 ms, der gesamte Start
15,5 Sekunden. Anschließend wurde eine unbekannte Basis vor dem Loader
abgewiesen. Der zusätzliche HTTP-/Datenbankaufwand wird durch eigene
Integrationsmessungen beurteilt, nicht aus diesen Kernwerten abgeleitet.

Die ausgeführten lokalen Backendpfade umfassen den echten MCP-Handler mit
Erstwahl-Quittung, Direktstart, erfolgloser Bewertung ohne Mastery-Write,
bewusstem Retry, abgewiesener alter Capability, erfolgreichem Write und genauem
Replay. Weitere Integrationsfälle prüfen parallele Mastery, Ownerwechsel und
Recovery, Prüfungsangebote außerhalb des Fokus, Prüfungsziele ohne direkte
`requires`, freiwillige Weiterarbeit nach Reload sowie aktuelle Planpräferenzen.
Die echte PostgreSQL-Prüfung verwendet die produktiven Liquibase-Migrationen.
Ein lokaler grüner Testlauf ist keine Behauptung über einen noch nicht
abgeschlossenen oder nicht gestarteten entfernten CI-Lauf.

Der [abschließende lokale Integrationsbeleg](../qa-ci/status/assessment-completion-integration-2026-10-30.json)
hält **697 Backendtests in 47 Suiten ohne Fehler oder Skips** und zwölf erfolgreiche
Frontend-Prüfschritte einschließlich TypeScript, ESLint und Produktionsbuild fest.
Der neue CI-Pflichtsatz ist vollständig enthalten. Der Bericht bindet die geänderten
Implementierungsdateien an einen SHA-256-Wert. Er dokumentiert den damaligen
lokalen Messsnapshot vor dem Implementierungscommit; sein historisches
`uncommitted`-Feld beschreibt diesen Erfassungszeitpunkt, nicht den aktuellen
Git-Status. Ein späterer Commit oder Push ersetzt keinen tatsächlich terminalen
Remote-CI-Nachweis.

Die echten Browserfälle prüfen mobile Darstellung, Tastatur, einen parallelen
HTTP-409, Anbieterwahl und Sitzungserzeugung, Reload, langsame und abgebrochene
HTTP-Anfragen, einen bestätigten MCP-Mastery-Write, die zugängliche Abschlussmeldung,
die zugehörige Erlassbegründung und die Profilpause nach Reload. Der echte
Zwei-Instanzen-Test startet getrennte Spring-Anwendungen gegen dasselbe isolierte
PostgreSQL-Schema: Alte Quittungen, Aktionen, Bewertungen und Schreib-Replays
werden nach dem Generationswechsel abgewiesen; bereits gespeicherte Mastery
zählt in der neuen Generation sofort weiter. Das ist keine Host- oder menschliche
Screenreader-Abnahme.

Im dokumentierten HTTP-Lauf betrug p95 ohne Profil 210,156 ms und mit Profil
218,078 ms; die beobachtete Differenz beträgt 7,922 ms. Die zusätzliche
Completion-Projektion hatte 1.957 Bytes gegenüber dem Startbudget von 8 KiB.
Ein einzelner Profilabruf benötigte allerdings 1.992,713 ms. Alle Rohsamples und
Maxima bleiben erhalten: Diese Messung im breiten lokalen Testprozess ist weder
ein kausaler Overheadnachweis noch eine Zusage zur Produktivlatenz. Das
8-KiB-Budget wird außerdem vor der Profilwahl sowie im offenen, laufenden,
abgeschlossenen und pausierten Pilotzustand geprüft.

## Paketnachweis und externe Freigaben

Der [vollständige lokale Paketnachweis](../qa-ci/status/assessment-completion-fwu-roundtrip-2026-10-30.json)
bindet das endgültige `.2`-Paket an seine tatsächlichen Receipts. Die normative
FWU-Prüfung hat alle 18 Gates bestanden; HermiT bestätigt Konsistenz und null
unerfüllbare Klassen. Zwei frische, hermetisch isolierte Rückbuilds ohne Zugriff
auf Original-JSON, Authoring-Checkout, Vorwärtsexporter oder Netzwerk erzeugen
bytegleiche JSON-ZIPs und Manifeste. Beide unabhängigen JSON-Gesamtvalidierungen
bestehen jeweils alle sechs Gates einschließlich Reviewbindung und Contentdigest;
auch der separate externe Receiptvalidator ist erfolgreich beendet.

Alle 114 logischen Artefakte und 836 Bilder bleiben erhalten. Die gemeinsame
semantische Contentidentität stimmt über JSON, FWU und beide Rückexporte überein.
Nur drei ausdrücklich generierte Build-/Validierungsmetadaten entfallen beim
Rückexport. Lizenz-, Herkunfts- und Weitergabebindungen aller gemeinsamen
Dateieinträge sowie beide Lizenztexte bleiben erhalten. Das Paket bleibt ein
lokaler DRAFT-Kandidat; die dokumentierten offenen Quellen- und
Weitergabeprüfungen werden durch den technischen Roundtrip nicht freigegeben.

Die Browser-, Neustart- und Datenbankprüfungen sind im oben verlinkten
Integrationsbeleg abgeschlossen. Der Paketnachweis beruht auf seinen eigenen,
oben verlinkten Receipts.

Beobachtete Claude-Host-Abnahme, der moderierte Verständlichkeitstest und eine
spätere fokussierte ChatGPT-Abnahme bleiben vor produktiver Ausweitung eigene
Freigaben. Maschinenprüfungen werden nicht als menschliche Erprobung oder
Wirksamkeitsnachweis bezeichnet.


## Manuell testen: lokale Umgebung und tatsächlicher Claude-Host

Für einen reproduzierbaren Ersttest eine **neue SkillPilot-ID** verwenden, nicht
das eigene bestehende Lernprofil zurücksetzen. Für Erfolgs- und
Misserfolgsverlauf am besten zwei neue IDs anlegen. Bei einem vorhandenen Profil
zählt bereits gespeicherte Prüfungsmastery sofort; die Prüfung wird dann nicht
noch einmal verlangt.

### Lokalen Repository-Pilot starten

Voraussetzungen: Corretto **25.0.2.10.1** (Java 25.0.2), Node **20.20.2** gemäß
`.java-version`, `.corretto-version` und `.nvmrc`, installierte npm-Abhängigkeiten
und eine eigene PostgreSQL-Entwicklungsdatenbank. Die Befehle werden aus dem
Repository ausgeführt. Keine produktive Datenbank verwenden.

Optional eine frische lokale Datenbank mit Docker starten; dieses Terminal
bleibt geöffnet. Ein vorhandenes Entwicklungs-PostgreSQL kann stattdessen über
dieselben `POSTGRES_*`-Variablen angebunden werden:

```sh
docker run --rm --name skillpilot-completion-pg \
  -e POSTGRES_DB=skillpilot_completion_dev \
  -e POSTGRES_USER=skillpilot \
  -e POSTGRES_PASSWORD=skillpilot-local-only \
  -p 127.0.0.1:55432:5432 postgres:18
```

Backend in einem zweiten Terminal starten. `JAVA_HOME` muss auf die genannte
Corretto-Installation zeigen; in der geprüften Arbeitsumgebung liegt sie unter
`/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1`:

```sh
export JAVA_HOME=/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1
export PATH="$JAVA_HOME/bin:$PATH"
java -version
export POSTGRES_HOST=127.0.0.1 POSTGRES_PORT=55432
export POSTGRES_DB=skillpilot_completion_dev POSTGRES_USER=skillpilot
export POSTGRES_PASSWORD=skillpilot-local-only
export GITHUB_CLIENT_ID=local-unused GITHUB_CLIENT_SECRET=local-unused
export SKILLPILOT_CLAUDE_ENABLED=false
export SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED=true
export SKILLPILOT_CLAUDE_CONNECTOR_V1_SIGNING_SECRET="$(openssl rand -hex 32)"
export SKILLPILOT_CLAUDE_CONNECTOR_V1_CAPABILITY_SECRET="$(openssl rand -hex 32)"
cd backend
./gradlew bootRun
```

Die zwei erzeugten Secrets gelten nur für diesen lokalen Entwicklungsstart;
ein neuer Start mit anderen Schlüsseln benötigt neue Testsitzungen. Die alte
Claude-Beta-Lane bleibt ausgeschaltet, während der V1-Connector aktiviert wird.
GitHub-Anmeldung wird für diesen lokalen Lernprofiltest nicht verwendet.
Liquibase richtet die leere Entwicklungsdatenbank beim Start ein. Erst nach
abgeschlossenem Warmup und erfolgreichem `http://localhost:8080/api/health`
fortfahren.

Frontend in einem dritten Terminal aus dem Repository starten:

```sh
npm ci --prefix app
VITE_API_BASE=http://localhost:8080 npm --prefix app run dev -- --host 127.0.0.1 --port 5173
```

`http://localhost:5173` öffnen. Diese lokale Umgebung erlaubt Cockpit,
Profilwahl und die lokale Claude-Sitzungserzeugung. **Ein geöffneter Claude-Tab
ist noch kein erfolgreicher Hosttest:** Ein entferntes Claude kann diesen
Loopback-Backend nicht erreichen, und die unveränderten öffentlichen
Connectoradressen zeigen nicht auf die lokale Instanz. Lokale Startschlüssel
nicht in eine Verbindung zum produktiven Backend übernehmen. Für den echten
Hostversuch weiter unten eine gesondert bereitgestellte, für Claude erreichbare
Testinstanz mit passender OAuth-/Pluginverbindung benutzen; hierfür keine
Sicherheitsprüfung oder öffentliche Origin-Pins auf HTTP-Loopback umbiegen.

### Neues Lernprofil und sichtbaren Umfang einrichten

1. Auf der Startseite **„Lernen starten“ / „Jetzt starten“** wählen und
   **„Neue SkillPilot-ID erstellen“** verwenden. Die ID für diesen Test aufheben.
2. Unter **„Curriculum wählen“** das Curriculum **„Gymnasium (DE)“** wählen,
   nicht eine eingefrorene Kompatibilitätsansicht.
3. **„Persönliches Curriculum festlegen“** vollständig durchlaufen:
   **„Hessen“**, bei **„G8 oder G9?“** **„G9“**, bei
   **„Welche Lernstufen möchtest du abdecken?“**
   **„Sekundarstufe I und II“**, als Fach **„Mathematik“** und als Kursprofil
   **„Grund- und Leistungskurs“** wählen. Das entspricht dem geprüften
   `CrossStage`-/`GK+LK`-Testumfang; andere Fächer werden für diesen Versuch
   nicht benötigt. Mehrfachauswahlen mit **„Diese Auswahl abschließen“**
   abschließen, bis **„Dein persönlicher Lehrplan ist eingerichtet.“** erscheint.
   Die angebotene Reihenfolge folgt dem Curriculum; keine Phase Q2 als
   zusätzliche dauerhafte Scopeauswahl erfinden.
4. **„Cockpit öffnen“**. Unter **„Lehrplan anpassen“** / **„Lerneinstellungen“**
   für den ersten Versuch **„Autopilot aktivieren“**, **„Nach Plan lernen“** und
   **„Strict Mode aktivieren“** ausschalten. Mit **„Fertig“** schließen.
   Der Direktstart funktioniert später auch im Strict Mode; normale Unterstützung
   kann dort allerdings globale Voraussetzungen benötigen.
5. Im Lernzielbaum das Ziel **„Definition des Skalarprodukts mithilfe
   orthogonaler Projektionen veranschaulichen“** öffnen. Als genaue
   Navigationshilfe funktioniert bei bereits geladenem Lernprofil auch
   `http://localhost:5173/learner/3016ec37-1c2e-47db-83f5-e767923bc97e?l=a0e13c56-c25f-4742-9272-3a1a603ee52e`.
   Das Öffnen setzt noch keine Mastery. Über den runden Fokusknopf neben dem
   Ziel mit Tooltip **„Als Lernfokus setzen“** dieses Ziel fokussieren. Der Knopf
   trägt danach **„Aktueller Lernfokus“**. Auf einer neuen ID sind keine
   unabhängigen alten Fokuswurzeln zu entfernen.

Die aufklappbare Auswahl **„Prüfungsabkürzungen“** zeigt bereits vor der
Profilwahl den Abschnitt, **„2 Lernziele, davon 1 erforderliche Prüfung.“**
und das konkrete Prüfungsziel. Das Aufklappen verändert weder aktives Ziel,
Fokus, Profilwahl noch Mastery. **„Prüfung direkt versuchen“** führt ohne
vorherige Profilwahl in die Anbieterwahl. Am entsprechenden Prüfungslernziel
im Baum ist derselbe Einstieg erreichbar; dafür werden keine weiteren
Baumzeilen oder Erlassbehauptungen erzeugt.

Wer stattdessen den Abschnitt regulär bearbeiten möchte, wählt den
Knopf **„Abschnitt als Lernweg wählen“** unter
**„Skalarprodukt und orthogonale Projektion“**.
Erwartung bei der neuen ID: **0 von 2 Lernzielen geschafft**, **0 von 1
Prüfungen geschafft**, kein Erlass, Abschnitt noch offen. Die technische ID des
Profils lautet `math-dot-product-projection`; sie muss nicht eingegeben werden.
Fehlt die Karte, zuerst die gespeicherte Cockpit-Einstellung für Abkürzungen,
abgeschlossene Personalisierung und die beiden sichtbaren Ziel-IDs prüfen.
Anschließend gegebenenfalls explizite serverweite Abschaltungen oder
Einschränkungen prüfen, statt Mastery zu verändern.

### Direktstart, Erfolg und Misserfolg

Auf der Karte **„Prüfung direkt versuchen“** wählen. In der Anbieterwahl bleibt
für diesen Ablauf **Claude**; die Auswahl allein startet noch keine Prüfung.
**„Schritt 2: Mit Claude starten“** erstellt die neue gebundene Sitzung und
öffnet die Startnachricht. Erst diese tatsächliche Startaktion bindet das
Prüfungsziel. Im Cockpit erscheint **„Eine Prüfung läuft in deinem Lerncoach.“**;
der bisherige Fokus bleibt erhalten. Reload erhält eine gültige laufende
Sitzung. Ein echter Hostversuch setzt die unten genannte erreichbare
Testinstanz voraus.

**Die Qualität der KI-Rückmeldung in beiden Verläufen prüfen:** Nach der
vollständigen Abgabe müssen Gesamtpunkte mit Maximalpunktzahl,
Bestehensentscheidung und Punkte samt Begründung je Bewertungskriterium
nachvollziehbar sein. Der Coach erklärt richtige Lösungsanteile und etwaige
Fehler, bespricht die freigegebene Lösung und gibt bei Bedarf konkrete
Verbesserungshinweise. Er bietet Rückfragen an und wartet vor einer neuen
Aufgabe oder einem anderen Lernziel auf die Entscheidung der lernenden Person.
Eine bloße Meldung „geschafft/nicht geschafft“ oder „Abschnitt abgeschlossen“
genügt nicht. Während der noch laufenden Bearbeitung bleiben Lösungen und
bewertende Hilfen gemäß dem normalen Prüfungsablauf zurückgehalten.

Für den erfolgreichen Versuch die Prüfungsaufgabe regulär bearbeiten. Das
Pilotziel verlangt gemäß seiner bestehenden Rubrik **10 von 10 Punkten**;
der Coach muss den normalen bestätigten Mastery-Write verwenden. Keine
Lösungen oder Erfolgswerte für einen vermeintlich echten Hosttest vorgeben.
Nach bestätigter Speicherung und Cockpit-Reload gilt exakt:

| Anzeige / Ergebnis | Erwartung |
| --- | --- |
| Abschnitt | „Lernabschnitt abgeschlossen.“ |
| Mastery über die zwei Ziele | **1 von 2 Lernzielen geschafft** |
| Pflichtprüfung | **1 von 1 geschafft** |
| Vorbereitung | **Für 1 Lernziel entfällt die Vorbereitung für diesen Abschnitt** |
| Einzelziele | Prüfung gemeistert; Vorbereitungsziel weiterhin nicht gemeistert |
| Vorbereitungsziel im Baum | Blaues Schild mit Häkchen; Tooltip mit Abschnitt und bestandener Prüfung |

Über **„Warum entfällt diese Vorbereitung?“** muss die zugehörige gemeisterte
Prüfung sichtbar werden. Es darf weder **2 von 2** noch ein neuer Mastery-Haken
am Vorbereitungsziel entstehen. Der Nenner bleibt gleich; am Vorbereitungsziel
wird auch global keine Mastery erzeugt. Nur die Prüfung wechselt wie beabsichtigt
von nicht gemeistert zu gemeistert. Es werden nach Abschluss keine neuen
Unterstützungsschritte als Pflicht empfohlen. **„Für heute beenden“** pausiert mit erhaltener Profilwahl;
nach Reload bleibt der Abschluss sichtbar und kein anderes Ziel startet.
**„Zur normalen Lernansicht“** verlässt die Profilsteuerung bewusst.

Über **„Im Lernzielbaum anzeigen“** das Vorbereitungsziel aufrufen, sein
Icon fokussieren oder antippen und die zugehörige Prüfung im Tooltip prüfen.
Escape oder Antippen außerhalb schließt den Tooltip; die Zeilenhöhe bleibt gleich.
Bei langen Begründungen kann am fokussierten Icon mit Pfeil- und Bildtasten
gescrollt werden. Den übergeordneten
Baumzweig schließen: Er muss geschlossen bleiben, bis eine neue Navigation
oder ein ausdrückliches Anzeigen des Ziels ihn wieder öffnet. Nach Verlassen
des Abschlussprofils darf der abschnittsbezogene Hinweis nicht weiter erscheinen.

Die Einstellung zusätzlich prüfen:

1. **Konfiguration → Lerneinstellungen** öffnen und **„Abkürzungen durch
   bestandene Prüfungen nutzen“** abwählen. Vor dem Speichern oder nach Abbrechen
   bleibt der aktuelle Ablauf unverändert.
2. Speichern: Abschlusskarte und blaue Abschnittssymbole verschwinden. Die
   bestandene Prüfung und alle Mastery-Zähler bleiben erhalten. Nach Reload
   bleibt die Einstellung ausgeschaltet; normale Lernziele und regulär
   zugängliche Prüfungen bleiben nutzbar.
3. Wieder einschalten und speichern: Der Abschnitt wird erneut angeboten,
   aber keine Prüfung automatisch gestartet. Nach bewusster Abschnittsauswahl
   wird die vorhandene Mastery wieder für den Abschluss ausgewertet.
4. Bei einer zweiten Test-ID während eines Direktversuchs abschalten: Der
   Dialog weist auf das Beenden hin. Nach Speichern darf eine alte Coach-Aktion
   diesen Versuch nicht mehr bewerten oder fortsetzen. Bereits vor dem
   Abschalten gespeicherte Ergebnisse bleiben erhalten. Für den folgenden
   Nichtbestehenslauf wieder einschalten und den Abschnitt erneut auswählen.

Den nicht erfolgreichen Verlauf mit der zweiten frischen ID durchführen. Eine
nicht ausreichende Bearbeitung darf keinen Mastery-Write und keinen zusätzlichen
Fehlversuchsstatus erzeugen: weiterhin **0 von 2**, **0 von 1**, kein Erlass.
Im Coach eine tatsächlich angebotene **Unterstützung**, **„Prüfung erneut
versuchen“** oder **„Prüfung beenden und pausieren“** bewusst wählen. Konkrete
Unterstützungstitel hängen von den aktuellen Voraussetzungen ab; keine
nicht angebotene Zielwahl erzwingen. Im Cockpit fragt ein Wechsel aus einer
laufenden Prüfung ausdrücklich nach; **„Prüfung beenden und wechseln“**
bestätigt ihn, **„Prüfung fortsetzen“** verwirft ihn. Ein Retry benötigt die
frische Startaktion und macht alte Bewertungs-Capabilities ungültig. Dies wird
zusätzlich durch die echten MCP-Regressionstests geprüft, ohne dass Testende
Capabilities aus Chats kopieren müssen. Ohne laufende Direktbindung pausiert
**„Für heute beenden“** auch einen noch offenen Abschnitt.

### Prüfungsabkürzungen aus dem Coach ansteuern

Die ausdrücklichen Coach-Anweisungen dafür stehen im veröffentlichten
Paket **Claude 1.1.13** im
[SkillPilot Marketplace](https://github.com/enpasos/skillpilot-claude-marketplace).
Nach Aktualisierung des Claude-Pakets in einem frischen Chat testen. Ein
Backend-Deployment aktualisiert die bereits installierten Skills nicht.
Die früher veröffentlichten oder importierten Archive bleiben unverändert;
lokale Paketprüfungen belegen noch keine erfolgreiche Host-Abnahme.

Eine neue Claude-Sitzung mit regulärem Lernweg beginnen und zum Beispiel fragen:
**„Welche Prüfungen kann ich direkt versuchen, um Vorbereitung abzukürzen?“**
Der Coach nennt ausschließlich aktuell angebotene Prüfungen und den jeweiligen
Abschnitt. Er zeigt dabei weder Aufgaben noch Lösungen. Im Pilot ist dies
**„Skalarprodukt über eine orthogonale Projektion erklären“**.

Diese konkrete Prüfung ausdrücklich wählen. Der Coach nutzt die exakt
veröffentlichte Auswahl; das Backend wählt Profil und Prüfung gemeinsam und
bindet sie an dieselbe Sitzung. Es gibt keine zusätzliche Frage nach einer
technischen Profil-ID und keine zweite Zustimmung zur bereits eindeutigen
Prüfungswahl. Ein bloßer Informationswunsch startet nichts. Die technische
Vertragsquittung benötigt ebenfalls keine menschliche Bestätigung.

ChatGPT und Gemini erhalten in diesem Schritt weder neue Shortcut-Anweisungen
noch eine besondere Link-Übergabe. Ihre spätere Integration übernimmt dieselben
Auswahl-, Start-, Bewertungs- und Abschlussregeln mit anbietergetrennter Sitzung.
Ein erfolgreicher Claude-Test ersetzt ihre jeweils eigene Adapter- und
Host-Abnahme nicht.

Zusätzlich prüfen: Abkürzungen abschalten, Prüfung bereits bestehen lassen,
den Persönlichen Lehrplan ändern oder einen alten Link erneut öffnen. Es darf
keine nicht mehr angebotene Prüfung gestartet und keine gewöhnliche Zielwahl
als Prüfungsabkürzung ausgegeben werden. Ein laufender oder abgeschlossener
normaler Lernschritt wird nicht ungefragt durch ein Prüfungsmenü ersetzt.

### Reload, alte Ansicht und vorhandene Mastery prüfen

Zwei Cockpit-Tabs derselben Test-ID öffnen. In B eine bewusste Änderung
vornehmen, etwa **„Für heute beenden“**, und in A eine zuvor angebotene Aktion
versuchen. Ein noch alter Request muss **HTTP 409** liefern, ohne Fokus oder
Mastery zu verändern; die Oberfläche meldet **„Deine Auswahl konnte nicht
bestätigt werden. Lade den aktuellen Stand und wähle erneut.“** und lädt neu.
Wurde A bereits automatisch aktualisiert, ist eine neue gültige Aktion ohne
409 korrekt. Für einen deterministischen Konflikttest in den Browser-DevTools
unter Network einen eigenen POST auf
`/api/ui/learners/<Test-ID>/level-completion/actions` erfassen, nach einer
weiteren Änderung in B exakt dessen altes `expectedRevision` per
**„Copy as fetch“** erneut senden. Nur das eigene Wegwerfprofil verwenden;
Startschlüssel und IDs nicht als öffentliche Testbelege kopieren.

Die erfolgreich getestete ID anschließend erneut öffnen, die Profilroute
verlassen und dasselbe Profil wieder wählen. Der Abschluss muss sofort aus der
bereits vorhandenen Prüfungsmastery berechnet werden. Es darf keine zweite
Prüfung, technische Quittung über einen Lernerfolg oder Anerkennungsentscheidung
verlangt werden. Eine neue Coach-Verbindung darf lediglich die beschriebene
technische Sitzungsquittung benötigen.

### Lokale Technikprüfung und echter Hostversuch getrennt protokollieren

Für die reproduzierbare technische Prüfung ohne externen Claude-Host zunächst
Chromium für den Repository-Browsertest installieren und anschließend die echten
lokalen Handler-/HTTP-Prüfungen starten:

```sh
(cd app && npx playwright install chromium)
cd backend
SKILLPILOT_COMPLETION_BACKEND_BROWSER=true ./gradlew test --rerun-tasks \
  --tests '*AssessmentCompletionBackendBrowserIntegrationTest' \
  --tests '*ClaudeV1CompletionRouteIntegrationTest' \
  --tests '*ClaudeV1CompletionContractReceiptIntegrationTest'
```

`--rerun-tasks` ist hier bewusst angegeben: Die opt-in Umgebungsvariable allein
ist kein Gradle-Input und darf keinen alten Skip als neuen Testlauf erscheinen
lassen. Diese Tests verwenden eigene synthetische Lernende und Testdatenbanken; sie
prüfen echte Backend-/MCP-Writes, aber keine Ausführung in Claude. Für einen
**echten Hostversuch** den gleichen GUI-Ablauf auf einer separat freigegebenen
HTTPS-Testinstanz mit passender installierter Claude-Verbindung und aktiviertem
Pilotprofil durchführen. Neue Claude-Unterhaltung verwenden, Startnachricht
senden, tatsächliche Toolaufrufe, Erfolgsspeicherung und Cockpit-Reload prüfen.
Datum, getesteten Commit/Build, Anbieter, Text/Voice, sichtbare Aktionen und
bestätigte Speicherergebnisse getrennt notieren; keine Tokens oder Chatinhalte
in öffentliche Nachweise übernehmen. Lokales Grün, technischer Receipt und
geöffneter Claude-Tab ersetzen diese Beobachtung nicht.
