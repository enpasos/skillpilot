# Mathematik: Arbeitsstand der Lerneinheiten-Umsetzung

Stand: 5. November 2026. Dieser Nachweis ergänzt den
[Umsetzungsplan](learning-units-implementation-plan.md); er ersetzt dessen
Abnahmen nicht. Aktiver Auftrag ist **S2 bis einschließlich S4**, also die
vollständige Mathematik-Umsetzung. Ein erster Vertrag ist ein Zwischenergebnis.

## Gesicherte Grundlage

- Basis: `main` nach Merge von [PR #81](https://github.com/enpasos/skillpilot/pull/81),
  Commit `0ce5a8d791eeb9783a919195fd8590bfb79f3595`.
- Neuer Arbeitsbranch: `feat/mathematics-learning-units`.
- Neuer Draft-PR: [#82](https://github.com/enpasos/skillpilot/pull/82).
  Erster gesicherter Plancheckpoint: `f7842358a486a8d19cd3dd6fdd85f8243d0e6767`.
- S1 ergänzt die Lernkarte im vollständigen Cockpit. Die erforderliche CI des
  Kandidaten bestand; der Owner meldet den laufenden Rollout. Dessen Smoke-Test
  und eine echte Coach-Hostabnahme sind damit noch nicht nachgewiesen.
- Grundlegende Analyse und unabhängige Reviews: Astra Ultra. Technische
  Umsetzung, Inventarisierung und Tests: 6.1 Sol Ultra. Detailentscheidungen
  erfolgen innerhalb des bestätigten Konzepts selbständig.

## Lieferstücke und offene Abnahmen

| Stufe | Aktuelle Arbeit | Noch kein Erfolgsnachweis für |
| --- | --- | --- |
| S2 | Gebundener Skalarprodukt-/Projektionsvertrag mit zwei eigenen Zielen, unabhängiger KI-Inhaltsprüfung und unverändertem Prüfungsanspruch; native Prüfung aller 182 Angebote ohne Target-/Q-/K-/Supportdelta, Einheit in genau 42 passenden Angeboten. Daten und Quellen in `8481434d48` gesichert. | Eine erste Einheit ist kein vollständiger Mathematikabschluss. |
| S3 | Gemeinsame Runtime-, Cockpit-, Coach-, Frontier- und Planintegration in `f5a61af0dd` gesichert und gepusht. 257 lokale Backendtests in 18 Suiten bestanden. Der tatsächliche äußere Datenbanksnapshot für WebGUI und Provider wurde in `1509ba001e` ergänzt und mit HTTP-/JDBC-Prüfungen belegt. | Exakte terminale Kandidaten-CI und abschließendes Integrationsreview. Deployment und echte Hostabnahme sind gesonderte Nachweise. |
| S4 | [Angebotsinventar](learning-units-mathematics-offering-inventory.md): 182 Konfigurationen und 807 ursprüngliche Fachkompetenzen. 21 unabhängig inhaltlich geprüfte Einheiten mit 27 dieser Kompetenzen bestehen den [tatsächlichen nativen Angebotsabgleich](learning-units-mathematics-batch-b-native-proof.json). Der [installierte Paketnachweis](learning-units-mathematics-installed-offer-parity.json) betrifft weiterhin den vorherigen Neun-Einheiten-Datenstand. | Die übrigen 780 Kompetenzen und die verbliebenen Scopevarianten fachlich binden; zwölf bestehende Hierarchiefälle korrigieren; vollständige Karten-/Sprach-/Angebotsbindung und aktuelle QA-/M7-/Releaseabnahme nachweisen. |

Der fixierte Angebotsnenner umfasst die Vereinigungsmenge aus 140 nativen
Planner-Konfigurationen und 154 GUI-Konfigurationen mit 112 gemeinsamen
Einträgen. Alle 182 Projektionen und Voraussetzungskompilationen liefen
erfolgreich. Das ist eine Bestandsaufnahme, keine Einheits- oder Fachabnahme.
Die eigenständigen Hochschul-/BOS-Angebote sind ausdrücklich außerhalb dieser
Gymnasium-Korrektur erfasst. Alte Zahlen und Dateizahlen aus PR #79 sind keine
aktuellen Abnahmeergebnisse.

Die [aktuelle native S2-Nachprüfung](learning-units-mathematics-after-s2-native-proof.json)
vergleicht den geänderten Quellstand mit dem fixierten Ausgangsinventar. Die
drei Minimalitätskorrekturen erhalten die vollständige transitive Relation;
die beiden bestehenden Kompetenz-/Prüfungsobjekte bleiben unverändert.
Der neue Vertrag erkennt nach dem Prüfungspass genau seine eigene Kompetenz
an. Im anderen persönlichen Lehrplan bleibt die Anerkennung gültig, auch wenn
die Einheit dort nicht angezeigt wird.

Die [endliche Autorierungsqueue](learning-units-mathematics-authoring-queue.md)
hält alle 807 ursprünglichen Fachkompetenzen fest. 211 fachliche Autorenpakete,
74 mehrfache kanonische Elternzuordnungen und sechs Kartendecks mit 64 Karten
werden einzeln aufgelöst. 282 Kompetenzen ohne ausdrückliches Coverage-Feld
sind Prüflücken, keine pauschale Forderung nach 282 neuen Prüfungen.
Die Queue umfasst 210 bestehende Themenpakete und ein ausdrücklich ergänztes
Restpaket. Zuvor hatten 17 Kompetenzen noch keine Paketroute; alle 807 besitzen
jetzt eine solche Route. Diese Zuordnung ersetzt weder ihre Erwerbsheimat noch
die unabhängige Inhaltsfreigabe.

Die zweite unabhängig geprüfte Einheit betrifft Volumen und Oberfläche gerader
Prismen. Ihre neue Prüfung wird exakt in 27 Angeboten sichtbar; die übrigen
155 Angebote bleiben unverändert. Der [native Nachweis](learning-units-mathematics-prism-native-proof.json)
erhält sämtliche ursprünglichen 978 atomaren Zielidentitäten und ihre
vollständigen Voraussetzungspfade. Ein Prüfungspass erkennt genau die beiden
eigenen Prismenziele an: drei erreichte Einheitsziele aus einem expliziten
Ergebnis und zwei Anerkennungen. Andere Geometrieziele erhalten dadurch keinen
Abschluss.

Sieben weitere geprüfte Einheiten behandeln Monotonie/Extrema, räumliche
Koordinatenbeschreibung, orthogonale Projektion als lineare Abbildung,
Pyramidenvolumen, Abstände paralleler Geraden/Ebenen sowie Kugeloberfläche und
Kugelvolumen. Zusammen mit den ersten beiden Einheiten sind zehn der 807
ursprünglichen Fachkompetenzen gebunden. Ein bestandener eigener Prüfungssatz
erkennt jeweils genau die eigenen Fachziele an; bei leerem M entsteht keine
Anerkennung, und explizite Fachziele allein bestehen keine offene Prüfung.

Der folgende Block ergänzt zwölf fachlich freigegebene Verträge für 17 weitere
Fachkompetenzen, unter anderem zu Pythagorasbeweisen, räumlichen Spiegelungen,
affinen Fixelementen, Volumenvergleichen und Lagebeziehungen. Die vollständigen
Review-Eingaben stimmen mit dem unabhängigen Astra-Review überein. Die 38
entfernten redundanten Voraussetzungskanten erhalten nach Mengenvergleich die
gesamte transitive Relation aller 980 aktuellen atomaren Ziele. Die tatsächliche
Laufzeit wählt die ausdrücklich gebundenen Verträge in allen 182 Konfigurationen
korrekt aus; alle 21 Verträge sind aufgenommen, keiner ist quarantiniert.
Der [aktuelle V6-Nachweis](learning-units-mathematics-current-offers-v6-native-proof.json)
bestätigt erneut alle 182 Angebote. Er ergänzt die quellengebundenen
Pythagoras-Ziele in BB und SL ohne Zielverlust; im SL-Sek-I-Angebot sind dadurch
auch die beiden bestehenden Beweiseinheiten verfügbar. Alle ursprünglichen
Zielbedeutungen und vollständigen transitiven Voraussetzungen bleiben erhalten.
Die getrennten [Mutationstests](learning-units-mathematics-stable-offer-mutation-proof.json)
belegen die Unabhängigkeit von Laufzeitdiagnostik und aktuellem Katalogzeiger,
während Inhalts-, Ownership- und Scopeänderungen weiterhin erkannt werden.

Drei geprüfte Kandidaten bleiben zurückgestellt: Bei einer Ableitungsaufgabe
müssen die wesentlichen Diagrammdateien vollständig an Aufgabe und Auslieferung
gebunden werden. Bei Mittelpunkt und Rechtwinkligkeit konnte die bisherige
normale Bestehensregel eine wesentliche Teilkompetenz auslassen; zum Mittelpunkt
ist außerdem die eigene Abrufpflicht korrekt aufzuteilen. Ein solches Ergebnis
wird weder durch einen aktualisierten Hash noch durch pauschal 100 Prozent
Bestehensanforderung repariert.

Die nächste Gruppe mit zehn Einheiten und 52 weiteren Fachkompetenzen hat nach
drei Aufgabenreparaturen ein neues unabhängiges Astra-Inhaltsreview bestanden.
Ihre tatsächliche Angebots-, Placement- und Laufzeitprüfung ist noch offen;
sie zählt deshalb noch nicht zu den 27 eingebundenen Kompetenzen.

Die neue Monotonieprüfung wird in 118 Angeboten als Ziel und in elf weiteren
als Unterstützung eingeordnet. Für ihr bereits vorhandenes Ableitungsziel
wurde anhand der Quellen in genau elf Sek-I-Konfigurationen die bisherige
Zielrolle zu Unterstützung korrigiert. Baden-Württembergs ausdrücklich belegte
Sek-I-Zuordnung bleibt erhalten. Alle 1.253 vorherigen Zielbedeutungen und ihre
979 vollständigen atomaren Voraussetzungshüllen bleiben unverändert. Der neue
Prüfungsknoten erhöht den aktuellen atomaren Zielumfang auf 980; die 807
ursprünglichen Fachkompetenzen bleiben der feste fachliche Nenner.

Aktuelle Angebote werden über eine eigene genaue Bindung aus Einstieg,
Bundesland, Stufe, Dauer und Kursprofil ausgewählt. Diese Bindung enthält alle
182 Konfigurationen zunächst ausdrücklich als **teilweise** umgebaut. Sie
erzeugt keine Anerkennung und entzieht keine gültige historische Anerkennung.
Ein neuer eigenständiger Mathematik-Paketeinstieg erhält eine eigene Identität;
der bisherige Gymnasialeinstieg mit allen Fächern wird dafür nicht verkürzt.
Für den eingefrorenen Neun-Einheiten-Stand ist die tatsächliche Gleichheit aller
182 Projektionen des installierten Pakets inzwischen nachgewiesen. Verglichen
wurden Ziele, Unterstützung, Mathematiksichten, Vertragsauswahl und volle atomare
Voraussetzungen. Eine aktuelle Angebotsbindung darf gültige historische
Anerkennung nicht entziehen. Operative native Mappings und kompilierte
Publikations-/Quellenbelege behalten dabei ihre verschiedenen Bedeutungen.

## Verbindliche technische Grenzen

Eigene Ziele werden aus autoritativen Program-/Placementdaten gebunden; weder
Baumansicht noch Fokus oder besuchter Lehrplan erzeugen Erwerbsrechte.
Nur das vorhandene binäre explizite M wird gespeichert. Abgeleitete Anerkennung
aus gültigen unveränderlichen Verträgen gilt global; Prüfungen und Karten
bleiben explizit. Die vollständige transitive Nachfrage passiert auch bereits
gemeisterte Zwischenziele und externe Unterstützung. I fließt nicht erneut in
die lokale Ableitung ein.

Gesamtfortschritt berücksichtigt gültiges I; Periodenkontingente und ihre
Historie zählen nur datierte explizite Abschlüsse. Neue Einheiten führen keine
zusätzlichen technischen Zugangssperren ein. Jede Lieferstufe muss unabhängig
mit der bisherigen Produktionskonfiguration nutzbar bleiben.

## Selektive Nachnutzung von PR #79

Quelle ist Remotehead `802f333f80c58d3409ab5d9fb3e9913fecafbf54` von
[PR #79](https://github.com/enpasos/skillpilot/pull/79). Der zusätzliche lokale
Testcheckpoint `4f1241b634c7e399c7651b90425b556acd4610f6` ist separat zu benennen,
wenn daraus Tests übernommen werden.

| Baustein | Entscheidung und erneute Prüfung |
| --- | --- |
| Native Angebotsauflösung aus dem früheren Integritätstest | Discovery-/Projektionsharness nachnutzen; heutige Backend-/Plannerauflösung und IDs erneut ermitteln. |
| Aufgaben, Rubriken und Quellen | Paketweise übernehmen, soweit Kompetenzanspruch und historische Identität passen; neue Eigentums-/Anwendungsprüfung erforderlich. |
| Graph- und Cachebausteine | Bestehende main-Basis zuerst prüfen; volle transitive Nachfrage und unveränderliche Verträge ergänzen. |
| Mastery-Stopp und frühere scoped Waiver | Keine Übernahme dieser abgelösten Semantik. |
| Umtypisierung alter Verständnisziele zu Prüfungen | Keine pauschale Übernahme; historische Verständnisbedeutung bewahren. |
| Alte QA-/M7-/CI-Ergebnisse | Nur Historie; am neuen Kandidaten neu prüfen. |

Commits und CI werden am jeweiligen Kandidaten dokumentiert. Lokale Tests,
terminale GitHub-CI, Deployment und beobachtete Hostabläufe bleiben getrennte
Nachweise. Ein Merge, Produktionsrollout oder eine Pluginveröffentlichung ist
durch diesen Arbeitsauftrag nicht zusätzlich autorisiert.

## Kandidaten und Betrieb

Die ersten gespeicherten technischen Checkpoints sind `7e046a8584`
(Angebotsinventar), `3bbf1dc556` (isolierter Anerkennungskern) und `d4e3416a50`
(begrenzter Checkout des OAuth-Sicherheitsjobs). Dessen vorheriger Runner
scheiterte beim vollständigen Checkout mit ENOSPC; Sicherheits- und
Releaseprüfungen wurden dadurch nicht reduziert.

Der aktuelle Paketpfad 1.2 kompiliert den echten Mathematikbestand einschließlich
gebundener Einheitsartefakte. Modellkompilierung, unabhängige Modellvalidierung,
fertige ZIP-/Runtimeprüfung und rechtlich/qualitativ freigegebene Weitergabe
sind verschiedene Nachweise. Vorhandene offene Publikationsentscheidungen
werden nicht als neue Freigaben übernommen.

Der Zwischenstand `f5a61af0dd` umfasst die gemeinsame Laufzeit und ihre
Regressionen, noch nicht den vollständigen Fachumbau. Insbesondere zählen
Gesamtfortschritt und Periodenkontingent nun getrennt: gültige Anerkennung
erhöht den Gesamtstand; Tages-/Wochenanzeigen verwenden ausschließlich datierte
explizite Ergebnisse. Ein freiwillig wiederholtes anerkanntes Ziel bleibt
angerechnet und wird dadurch nicht als explizit gemeistert gespeichert.

Der echte lokale S2-Paketnachweis verwendet 1.252 Ziele, 15 Program Units und
305 Placements. Das fertige ZIP wurde unabhängig validiert und mit dem
unveränderten, gepinnten isolierten Verbraucher geprüft: 15 Pflichtprüfungen
bestanden. Diese eingefrorene Evidenz beschreibt den S2-Datenstand; spätere
Inhaltserweiterungen brauchen neue Paketnachweise. Die offene Freigabe zur
Weiterveröffentlichung wird dadurch nicht ersetzt. Paketformat 1.2 ist ein
neuer unveröffentlichter Kandidat; veröffentlichte ältere Formate bleiben erhalten.

Ein zweiter, gesonderter Paketnachweis umfasst den Neun-Einheiten-Stand mit dem
eigenen Mathematikeinstieg: 1.255 Ziele in zwei Landschaften, 23 Program Units,
322 Placements und 98 Sichten. Das fertige ZIP bestand seine sechs Prüfungen
einschließlich Assetbytes und wurde in einem neuen privaten Store installiert.
Der echte installierte Backendpfad reproduziert alle 182 nativen Projektionen.
Die Prüfung mit dem gemeinsam versionierten isolierten Verbraucher **1.1.0**
bestand alle [15 Pflichtprüfungen](learning-units-mathematics-nine-unit-consumer-smoke-report.json),
einschließlich tatsächlicher Lehrplanauswahl über veröffentlichte Optionen,
Kartenübung und gesperrter Repository-Fallbacks. Das unveränderte Neun-Einheiten-ZIP
hat SHA256 `167ac363fb4b4dd34ca3dcdcb17d9c55deae7ce9b3c9477244532b8198a6e3a8`.
Der Nachweis bindet die tatsächlich geprüfte Anwendungsassembly
`5564c7d8c17e65aebe7c2335e0a90da882ea8d6d87778bf327d21ec0eaa1bd4f`;
spätere Softwareänderungen benötigen neue Kandidatenprüfungen. Der äußere
Readiness-Aufruf wurde nach dem erfolgreichen Verbraucher beendet und erzeugte
keinen abschließenden Readiness-Bericht. Das ZIP ist nicht als veröffentlicht
freigegeben. Die zwölf danach autorierten Verträge gehören nicht zu diesem
eingefrorenen Paketnachweis. Die unveränderten 1.0.0-Verbraucherquellen und
damaligen Nachweise bleiben gesondert archiviert.

Der reale Paketablauf deckte außerdem einen Fehler im noch unkonfigurierten
Einstieg auf: Seine Navigationssicht wurde als voller Mathematikzielumfang
ausgewertet. Die Korrektur in `57b8fa3765` trennt beide Bedeutungen. Ohne
vollständige Auswahl bleiben Ziele, Frontier und Coach-Zielzähler leer; der
Start bleibt gesperrt. Globale explizite Ergebnisse und gültige Anerkennungen
bleiben lesbar. 69 Regressionstests und der tatsächliche Paketvergleich aller
182 konfigurierten Scopes einschließlich dreier unaufgelöster Einstiegsfälle
bestanden; Astra bestätigte die enge Korrektur. Der bisherige direkte
Mathematik-Default und die reine Einstiegsnavigation bleiben erhalten.

Claude **1.1.13 ist bereits veröffentlicht**. Die neue Coachsemantik wird für
einen lokalen Nachfolgekandidaten **1.1.14** vorbereitet; veröffentlichte Bytes
und deren Evidenz bleiben erhalten. Eine echte neue Veröffentlichung oder
Hostabnahme ist damit nicht erfolgt. Für Gemini bleibt 0.1.0 erhalten, eine
getrennte neue Kandidatenquelle enthält die überarbeiteten gemeinsamen Regeln.
