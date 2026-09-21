# Contentanbindung: Physik-Libre-PoC und Migrationsinventar

Stand: 21. September 2026; fachliches Migrationsinventar vom 20. September.
Auftrag: [Issue #50](https://github.com/enpasos/skillpilot/issues/50).
Verbindlich ist der [Architekturrahmen v1.1](../concept/skill-graph/content-integration.md).
Dieses Dokument beschreibt den begrenzten technischen PoC, nicht eine bereits
veröffentlichte Vollintegration, Anbieterkooperation oder menschliche Freigabe.

## 1. Voraussetzungen und Grenzen

Der bestehende [Curriculum-Qualitätsbericht](../qa-ci/status/curriculum-quality-status.md)
weist Physik als M7 aus. Der Contentauftrag ändert weder die Definition dieses
Meilensteins noch Lernzieltexte, Graphbeziehungen, Personalisierungsumfang oder
Mastery. Quellenbelege, eigene Zielbilder und deren QA-Nachweise bleiben bestehen.

Der PoC verwendet eine separate JSON-Contentebene unter `content/`, eine
backendgespeicherte persönliche Paketauswahl und einen gemeinsamen Resolver für
Cockpit und Coach. Die Contentfunktion steht standardmäßig zur Verfügung; die
Paketauswahl bleibt eine freiwillige, normale Cockpit-Einstellung. Der bestehende
Profilzugang über die SkillPilot-ID genügt: Es gibt keinen zusätzlichen
Content-Schlüssel und keine manuelle Freigabe einzelner Profile. SkillPilot
unterscheidet bewusst nicht zwischen der lernenden Person und anderen Personen
mit derselben ID. Aktive-Profile- und Schreibschutzprüfungen bleiben bestehen;
eine Lehrendenverwaltung oder neue Anbieteranmeldung wird nicht eingeführt.
Die Auswahl eines Pakets ist weiterhin von Zugangsrechten beim Anbieter und
erlaubtem Inhaltszugriff durch eine KI zu unterscheiden.

Ein Ergebnis enthält nur öffentliche Materialverweise zum aktiven Lernziel,
keine abgerufenen Inhalte. Die Auswahl wird nicht im kanonischen Goal oder allein
in Claude gespeichert. Provider erhalten weder ID noch Lernverlauf. Fehlendes
Paket, leere Zuordnung, deaktiviertes Material oder eine nicht erreichbare Seite
lassen das gewöhnliche Lernen unverändert verfügbar.

## 2. Ursprünglicher fachlicher Pilot und Erweiterung

Paket: `physik-libre-gymnasium`, ursprüngliche, inzwischen ausgerollte Version `1.0.0`.
Der Katalog verweist jetzt auf den thematisch erweiterten Nachfolger `1.1.0`;
dessen [Abdeckung und Prüfgrenzen](https://github.com/enpasos/skillpilot/blob/main/content/physik-libre/1.1.0/README.md)
sind separat dokumentiert. Die folgenden vier Zuordnungen beschreiben den
historischen Pilotumfang, nicht die heutige Gesamtzahl. Die gespeicherte
Paketauswahl bleibt gültig. Diese lokale Erweiterung ist noch kein Rollout.
Alle vier Materialien sind deutschsprachig. Englische Katalogtexte behaupten
keine englische Materialausgabe. Die Zuordnungen wurden am 20. September 2026
KI-gestützt gegen aktuelle Ziele, live gelesene Abschnitte und vorhandene
HTML-Anker geprüft; keine menschliche oder Anbieterfreigabe wird daraus abgeleitet.

| Lernziel-ID | Ausschnitt | Geprüfter Abschnitt |
| --- | --- | --- |
| `d67502e3-5e0a-595b-a24b-65b1c40de36e` | Videoanalyse: räumliche/zeitliche Kalibrierung | [Bewegungen aufzeichnen, Auswertung](https://physikbuch.schule/motion-capture.html#motion-analysis) |
| `ae67bcf1-f3ee-50d6-9a12-25a159dff659` | Weg-Zeit-Diagramme qualitativ deuten | [Ort-Zeit-Diagramme interpretieren](https://physikbuch.schule/motion-diagrams.html#position-time-graphs-interpretation) |
| `bf8517a9-142b-5789-826a-767f3b277998` | Mittlere/Momentangeschwindigkeit, Sekante/Tangente | [Geschwindigkeit im Ort-Zeit-Diagramm](https://physikbuch.schule/motion-diagrams.html#average-velocity-in-position-time-graphs) |
| `971beafa-6ba5-4c82-ac8b-7ebf66eec3dd` | Gleichförmige Bewegung und Diagramme | [Gleichförmige Bewegung](https://physikbuch.schule/simple-motions.html#uniform-motion) |

Die Auswahl bildet einen kleinen Kinematik-Ausschnitt, keine Vollabdeckung. Für
Videoanalyse deckt der Verweis die Aufnahme/Kalibrierung ab; eigenständige
Modellprüfung und Fehleranalyse bleiben ergänzende Lernarbeit. Bei Diagrammen
sind Ortskoordinate und Weg zu unterscheiden. Die Ortsformel im ausgewählten
Abschnitt zur gleichförmigen Bewegung setzt den Anfangsort null voraus. Der Coach
bleibt für passende Erklärung, Übung und verständnisorientierte Prüfung zuständig.

Ein Bestandsfehler bestätigt die Notwendigkeit gezielter Prüfung: Der bisherige
Video-Link `motion.html#film` trifft auf der heutigen Kapitelaufteilung keinen
entsprechenden HTML-Anker. Die aktuelle Materialzuordnung verwendet daher
`motion-capture.html#motion-analysis`, nicht den alten Link unverändert.

## 3. Bestandsinventar vor der Migration

Gezählter Ausgangsstand im aktuellen kanonischen `DE/Gymnasium`-Verzeichnis,
20. September 2026, vor der Contentauslagerung:

| Klasse | Anzahl | Behandlung |
| --- | ---: | --- |
| Eigene `goal-visualization/image` | 1.606 | Unverändert: Mathematik 742, Physik 511, Chemie 353. |
| Amtliche `curriculum`-Quellenlinks | 33 | Als curriculare Belege erhalten. |
| GeoGebra `tool/graphing-calculator` | 74 | Separater späterer Mathe-Migrationsschritt; kein produktiver zweiter Anbieter im PoC. |
| Physik-Libre-Links | 11 | Aus dem kanonischen Physikdatensatz auslagern; passende neue Zuordnungen gesondert prüfen. |
| Gesamt | 1.724 | 85 externe didaktische Kandidaten, nicht 1.724 austauschbare Lernmaterialien. |

Die Zahlen sind ein datierter Ausgangsstand, keine dauerhaft festgeschriebenen
Curriculum- oder Coverage-Ziele. Der laufende Stand lässt sich mit
`node scripts/validate_content_packages.mjs --inventory` erheben. Der Algorithmus
hilft beim Inventarisieren; die tatsächliche Funktion entscheidet über die
Einordnung als Quelle oder didaktisches Material.

### Alle elf bisherigen Physik-Libre-Bindungen

Dies sind **historische Migrationsreferenzen**, keine aktuelle Linkempfehlung.
Die Basis der alten Pfade ist `https://physikbuch.schule/`.

| Bisheriges Ziel | Bisheriger Pfad | Migrationsentscheidung |
| --- | --- | --- |
| `bf980fff-b62b-4ea4-a20d-31681a7ad785` Physik-Root | `/` | Anbieterübersicht auf Paketebene, keine Zielbindung. |
| `d67502e3-5e0a-595b-a24b-65b1c40de36e` Videoanalyse | `motion.html#film` | Geprüfte neue Zielbindung im Pilot mit korrigiertem Pfad/Anker. |
| `39b2a0c4-eecf-5049-b58f-e790790a3bf2` Scheinkräfte | `rotation.html#rotierende-bezugssysteme` | Zuordnungsarbeit erhalten, außerhalb des aktiven Piloten prüfen. |
| `ac25ffe3-fd42-592d-a937-79cc13460313` Tabellenkalkulation | `simulation.html` | Außerhalb des aktiven Piloten prüfen. |
| `37b33812-d428-5953-852e-57a53a4347fe` Kinetische Gastheorie | `thermodynamics.html#kinetische-gastheorie` | Außerhalb des aktiven Piloten prüfen. |
| `7fe3022f-fad0-5f41-af1c-d55ff214ebc6` Adiabatische Zustandsänderungen | `thermodynamics.html#adiabatische-zustandsanderung-im-p-v-diagramm` | Außerhalb des aktiven Piloten prüfen. |
| `a6e48b88-51ed-5942-bdb8-8d2192652e0d` Ladungsphänomene | `electricity.html#ladung-und-reibungselektrizitaet` | Außerhalb des aktiven Piloten prüfen. |
| `bbee4c52-4e95-5529-990f-706aa99316a3` Stromstärke | `electricity.html#elektrischer-strom` | Außerhalb des aktiven Piloten prüfen. |
| `a522c8c0-f3a4-5568-acae-3010ed9feb87` Bewegungsinduktion | `electromagnetism.html#bewegungsinduzierte-spannung` | Außerhalb des aktiven Piloten prüfen. |
| `9dba2826-b179-59f0-8d91-5916079e5abe` Huygenssches Prinzip | `waves.html#ebene-wellen` | Außerhalb des aktiven Piloten prüfen. |
| `cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7` Potenzialtopf-Cluster | `quantum-mechanics.html#teilchen-in-einem-kasten` | Cluster wurde fachlich gegliedert; heutige atomare Passung neu prüfen. |

Quellsnapshots und alte veröffentlichte Pakete bleiben unveränderte Geschichte.
Die kanonischen Physiklinks dürfen erst zusammen mit der expliziten,
inhaltlich begrenzten Kompatibilitätsmigration entfernt werden: Der bisherige
`ChampionPracticeFingerprint` berücksichtigt Nicht-Curriculum-Ressourcen.
Historische Praxisnachweise dürfen weder wegen einer reinen Auslagerung verloren
gehen noch durch beliebige Hash-Neubindungen fälschlich gültig werden. Der lokale
Migrationsnachweis liegt unter
[`content/migrations/physik-libre-links-2026-09-20.json`](https://github.com/enpasos/skillpilot/blob/main/content/migrations/physik-libre-links-2026-09-20.json):
Er bewahrt die elf ursprünglichen Bindungen vollständig außerhalb des Curriculums.
Die inaktive historische Zuordnungsliste ist kein aktiviertes Lernmaterialpaket.

## 4. Verbraucher und Abnahmekriterien

Vor dem PoC lesen `GoalCard` und `LearnerService.toFrontierGoal` Ressourcen direkt
aus dem kanonischen Ziel. OpenAI projiziert diese als Ressourcen; Claude gibt
in `formatGoal` dagegen keine allgemeinen Materiallinks aus. Im Package-Modus
verlangt `resolveGoalResourceHref` bisher einen Curriculum-Katalogeintrag. Die
separate Contentauflösung muss deshalb ausdrücklich bis in UI und Claude-Kontext
reichen und darf nicht nur neue JSON-Dateien bereitstellen.

Die Abnahme umfasst:

1. Zwei getrennte Lernprofile, gleiches Curriculum: aktivierte Zuordnung nur für
   das Profil mit gespeicherter Auswahl, unabhängig vom KI-Host. Auswählen und
   Speichern funktioniert mit dem normalen Profilzugang ohne Zusatzschlüssel.
2. Aktivieren, Deaktivieren und Paket-/Materialrücknahme verändern weder
   Mastery noch Frontier, Prerequisites oder aktives Lernziel.
3. Fehlende Zuordnung, deaktivierter Dienst und nicht verfügbare externe Seite
   lassen normales Lernen funktionieren. Kein synchroner Websiteabruf im Coach.
4. Fehlende oder nicht aktive Profile, nicht schreibbare Sitzungen, ungültige
   Paketauswahl und veraltete Revision werden weiterhin abgewiesen. Ein
   Profilwechsel vermischt keine Auswahlzustände; keine Freitexte oder privaten
   Daten in Contentpaketen.
5. Claude erhält nur passende öffentliche Links und behauptet keinen gelesenen
   Volltext. Keine neuen Personalisierungstools im Coach.
6. Ein synthetischer zweiter Anbieter und ein anderes Fach bestehen dieselben
   Strukturtests, ohne Sonderlogik oder zweite produktive Anbindung.
7. Quellen, Bilder, Kernsemantik, aktuelle QS-Nachweise und M7 bleiben erhalten.

## 5. Nachweise und offene Schritte

Ausgeführt am 20. September 2026:

- `node --test scripts/validate_content_packages.test.mjs`: neun Tests bestanden.
- `node scripts/validate_content_packages.mjs --check-links`: drei öffentliche
  HTML-Seiten und sämtliche vier verwendeten Anker erreichbar/geprüft.
- Fachliche Prüfung der oben benannten Abschnitte und Zuordnungsgrenzen; kurze
  KI-Prüfbegründungen liegen direkt beim Material. Keine Volltexte kopiert.

Backend-/UI-/Coach-Regressionsnachweise und die konkreten Sicherheits- und
Betriebsschritte stehen getrennt im [PoC-Betriebs- und Abnahmebericht](content-integration-poc.md).
Lokale Tests sind keine Produktionsbereitstellung oder Realhost-Abnahme. Vor
einer bestätigten Realhost-Abnahme ist ein echter Claude-Ablauf mit ausgewählter
und wieder abgewählter Anbindung nachzuweisen. Ein früher ausdrücklich gesetztes
`SKILLPILOT_CONTENT_ENABLED=false` muss bei der Bereitstellung aufgehoben werden,
damit die normale Cockpit-Auswahl verfügbar ist. Die übrigen
Bestandszuordnungen, insbesondere GeoGebra, bleiben eine sichtbare Folgeaufgabe;
der PoC behauptet keine vollständige Bereinigung aller Curricula.
