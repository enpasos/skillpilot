# CI-Vertragsaudit: Übergabe vom 6. November 2026

## Auftrag und Trennung

Der Product Owner will **vor der Fortsetzung der Lerneinheitenarbeit** alle
verbindlichen deterministischen Skill-Graph-Regeln gegen ihre tatsächliche
Durchsetzung in CI prüfen und die notwendigen deterministischen Gates herstellen.
Das Einheiten-Goal ist ausdrücklich pausiert. Seine Agenten wurden angehalten;
die derzeitigen Auditagenten bearbeiten ausschließlich diesen CI-Auftrag.
Es findet keine weitere fachliche Einheitenzerlegung statt.

Der neue Branch `feat/skill-graph-ci-contracts` setzt frisch auf `origin/main`
auf. Die beim Einfrieren erneut abgerufene Basis ist
`0ce5a8d791eeb9783a919195fd8590bfb79f3595`. Der Einheitenstand bleibt auf
`docs/learning-units-restart-20261106` in
[Draft-PR #83](https://github.com/enpasos/skillpilot/pull/83) erhalten.
Sein eingefrorener Commit ist
[`52619b960e7b261e1cc18d070063c8e7aca74e21`](https://github.com/enpasos/skillpilot/commit/52619b960e7b261e1cc18d070063c8e7aca74e21),
zusätzlich unverändert gesichert auf
`archive/learning-units-s0-before-ci-audit-20261106`.
Die [Sicherung mit Reviewnotizen](../archive/learning-units/2026-11-06-s0-freeze/README.md)
erklärt deren Umfang und Grenzen. Der getrennte
[Draft-PR #84](https://github.com/enpasos/skillpilot/pull/84) ist angelegt.

**Zwei Vertragsstände unterscheiden:** Der neue CI-Branch hat die Normtexte
von main. Die vorbereitete Anerkennungsänderung des Einheitenbranchs vom
6. November ist zusätzliches Zielmaterial, keine bereits auf main umgesetzte
Funktion. Der Audit muss beide Stände ausdrücklich kennzeichnen. Die neue
Prüfungsanerkennung, Einheitenruntime oder ein ganzer Einheitenkatalog werden
nicht als Nebenwirkung einer Testkorrektur implementiert.

## Verwendbare Ergebnisse

- **Fortsetzung am 6. November:** Der [feste Regelkorpus](../qa-ci/skill-graph-ci-rule-corpus-2026-11-06.md)
  enthält 518 unabhängige Regeln mit festem Quellenregister und getrennten
  Main-/PR-83-Verträgen; die [JSON-Fassung](../qa-ci/skill-graph-ci-rule-corpus-2026-11-06.json)
  enthält die Quellrevisionen und Hashes. Alle IDs sind genau einmal der
  [statischen Matrix](../qa-ci/skill-graph-ci-static-matrix-2026-11-06.md)
  (261), der [Laufzeitmatrix](../qa-ci/skill-graph-ci-runtime-matrix-2026-11-06.md)
  (243) oder der [Content-/Bildmatrix](../qa-ci/skill-graph-ci-content-presentation-matrix-2026-11-06.md)
  (14) zugeordnet. Diese Vollständigkeit betrifft den deklarierten Quellenkorpus
  und seine Zuordnung, nicht bestandene Regeln oder vollständige CI-Durchsetzung.
- [Auditentwurf](../qa-ci/skill-graph-deterministic-ci-audit-2026-11-06.md):
  45 statische Beleggruppen und 41 Laufzeitprädikate mit Code-/Test-/Workflow-
  Ankern. Historischer Ausgangsentwurf; der feste Korpus und seine drei Matrizen
  enthalten den anschließenden Gesamt-Abgleich und weiterhin offene Lücken.
- [Minimalitätsaudit](learning-units-inventory/2026-11-06/transitive-minimality.md):
  echter Bestand mit **923 Mathematik- und 396 Physikbefunden**, Zeugenpfaden,
  Kantenentfernung und erneut aufgelöster Vererbung. `--check` scheitert korrekt.
- [Natives Inventar](learning-units-inventory/2026-11-06/README.md):
  266 Einzel-Fach-Konfigurationen, 190 exakte Mitgliedschaftsklassen und
  18 Deckreferenzen anhand des vorhandenen Backends. Die bestehende
  Ziel-/Voraussetzungsauflösung wird wiederverwendet, keine zweite Scopeengine.
- [Gesicherte Astra-/Sol-Notizen](../archive/learning-units/2026-11-06-s0-freeze/review-notes.zip):
  unterbrochener Zensus mit 147 Regeln und technische Detailbelege.

Die sechs ursprünglichen Dateien unter `app/scripts/` sind Inventar-/Auditwerkzeuge:
`auditTransitiveMinimality.ts`, `testTransitiveMinimality.ts`,
`reportMathPhysicsNativeInventory.ts`, `testMathPhysicsNativeInventory.ts`,
`MathPhysicsNativeProjectionInventory.java`, `mathPhysicsNativeInventory.init.gradle`.
Inzwischen ist zusätzlich der strikte Graphprüfer direkt an CQR-001 und die
Meilensteinberechnung angeschlossen. Der bestehende CI-Aufruf
`quality:curriculum-status:check` prüft Bericht und geschützte Fachuntergrenzen;
`test:deep-understanding-rollout` führt auch die neuen Struktur-Gegenfälle aus.

## Zusätzlicher verbindlicher Reparaturauftrag vom 6. November

Der Product Owner verlangt die Wiederherstellung der früheren Meilensteine:

| Fach | Verbindliches Ziel |
| --- | --- |
| Biologie, Chemie, Mathematik, Physik, Wirtschaftswissenschaften | M7 |
| Deutsch, Geschichte, Informatik, Latein, Politik und Wirtschaft | M6 |

**Harte deterministische Prüfungen gehören dafür in die Meilensteinberechnung
selbst.** Ein separater Bericht oder ein isolierter Algorithmustest reicht
nicht. Regelverletzungen müssen den Meilenstein verhindern und durch die
geschützten Untergrenzen als CI-Fehler wirken. Die Wiederherstellung erfolgt
durch echte Fehlerbehebung, ohne schwächere Prüfer, abgesenkte Untergrenzen,
Warnungsabstufung oder akzeptierte Fehlerbaselines. Die bestehende Policy
enthält genau diese zehn Untergrenzen und keine aktiven Ausnahmen.

## Tatsächlicher Reparaturstand

Der neue Prüfer verlangt für CQR-001 vollständig bestandene Ergebnisse für
G01a/G01b (UUID und kanonische Identität), G02 (positive endliche Gewichte),
G05 (eindeutige Referenzen), G06/G07/G15/G42 (vier DAG-Prüfungen) sowie
G16/G17 (lokale und transitive Minimalität). Fehlende, blockierte, doppelte
oder falsch abgegrenzte Prüfberichte begründen keinen Meilenstein.

Die lokale Integrationsprüfung führt inzwischen 14 tatsächlich fehlerhafte Graphen
durch die gesamte Kette bis zur M6-/M7-Floor-Verletzung. Zusätzlich werden
35 unvollständige bzw. unzutreffende Berichte zurückgewiesen. Der echte
Bestandsbericht wurde neu erzeugt; sein frischer Check bestätigt zunächst
die Aktualität des ersten strikten Berichts und scheiterte danach an neun
unverändert geschützten Floors. Nach der unten belegten Geschichte-Korrektur
ist die erneute Gesamterzeugung bestanden. Weitere unten belegte Reparaturen
führen im aktuellen Gesamtbericht vom `2026-11-06T18:45:31.502Z` zu drei
bestandenen M6-Fächern; sieben Fachuntergrenzen bleiben rot.

| Fach | Ziel | Neuer abgeleiteter Stand | CQR-001-Befunde |
| --- | --- | --- | ---: |
| Biologie | M7 | M0 | 375 |
| Chemie | M7 | M0 | 354 |
| Mathematik | M7 | M0 | 919 |
| Physik | M7 | M0 | 626 |
| Wirtschaftswissenschaften | M7 | M0 | 104 |
| Deutsch | M6 | M6 | 0 |
| Geschichte | M6 | M6 | 0 |
| Informatik | M6 | M0 | 47 |
| Latein | M6 | M6 | 0 |
| Politik und Wirtschaft | M6 | M0 | 603 |

Diese Zahlen bezeichnen den neuen vollständigen kanonischen Prüfumfang
einschließlich erforderlicher fremder Vorfahren und Abhängigkeiten.
Der erste Reparaturschritt beseitigte 19 Nullgewichte. Sein exakter Felddiff
verändert weder IDs, Texte, Atomgewichte noch Kanten; alle 19 G02-Defekte sind
im frischen Bericht beseitigt. Danach folgten die unten beschriebenen
Geschichte- und Deutsch-Reparaturen. Die in der Tabelle verbleibenden
Befunde sind echte Fehler und keine akzeptierte Baseline.

**Nachfolgender Geschichte-Zwischenstand:** Commit `00b441ed4c` entfernt
13 konkret geprüfte direkte Voraussetzungen aus sieben Assessmentzielen,
die unverändert über ihre Vorfahren geerbt werden. Die
[Anwendungsquittung](ci-graph-repairs/history-inherited-duplicate-repair-2026-11-06.json)
belegt nach jedem Entzug identische globale effektive und atomare Adjazenz.
Der echte Strukturprüfer besteht danach für Geschichte alle zehn Checks
mit null Befunden. Die anschließend tatsächlich neu erzeugte CQR-Gesamtableitung
bestätigt M6; der eigenständige Floorprüfer beanstandet Geschichte nicht mehr.
Der exakte Befehlslauf `quality:curriculum-status` endete mit Exit 0.

**Nachfolgende Deutsch-Reparatur:** Die unabhängigen Einzelprüfungen und der
Root-Zweitblick führten zu 68 konkret geschützten fachlichen Korrekturen.
Ihre beabsichtigten Änderungen betreffen exakt die einzeln benannten 84
Goal- und 99 atomaren Nachfragemengen; die Gesamtaufgabe behält ihre volle
Vorbereitung. Danach wurden 41 gesondert geprüfte Direktkanten der
Gesamtaufgabe entfernt. Nach jedem dieser Entzüge bleiben die vollständigen
globalen Goal- und Atom-Closures exakt gleich. Insgesamt ändern sich nur
`requires`-Arrays von 69 Goals. IDs, Texte, `contains`, Karten, Aufgaben,
Bewertung, Zielmitgliedschaft und bestehende Reviewbytes bleiben erhalten.
Der echte Strukturprüfer bestätigt danach für Deutsch zehn bestandene Checks
und null Befunde. Die tatsächliche CQR-Gesamterzeugung vom
`2026-11-06T11:05:14.975Z` ergibt zunächst M4: CQR-501 meldet 21 Unterschiede
zwischen berechneter und gespeicherter Applicability. Zusätzlich braucht
ein vorhandener HE-Sek-I-Kommunikationsbaustein seine explizite Supportrolle
in den beiden HE-Sek-II-Sichten. Die
[Anwendungsquittung](ci-graph-repairs/german-semantic-and-minimality-repair-2026-11-06.json)
und der [lesende globale Replay](ci-graph-repairs/verify_german_semantic_repair.py)
binden Quelle, Zweitreviews, exakte Deltas und alle 41 überlebenden Zeugen.

Die anschließende [Scope-Integration](ci-graph-repairs/german-applicability-support-review-2026-11-06.md)
ist ebenfalls konkret angewandt: genau 21 einzeln begründete Metadatenderivate
und zwei authored `prerequisiteOnly`-Einträge. Root hat mit denselben
Produktionsfunktionen alle 27 exakten Zielmengen erneut unverändert bestätigt;
beide HE-Sichten behalten 175 Targets und ihren sichtbaren Baum, erhalten
aber je eine explizite Supportkompetenz. Der Applicability-Compiler meldet
danach null Fehler und null APV-203-Drift. Der vollständige Composition-CLI
prüft 352 Views mit null Fehlern und 2358 ausgewiesenen Warnungen.
Die anschließende echte CQR-Gesamterzeugung vom `2026-11-06T11:36:07.203Z`
bestätigt Deutsch wieder als M6; alle CQR-001/301/302/401/501-Prüfungen
bestehen. Geschichte und Latein bleiben M6; die sieben übrigen geschützten
Fächer bleiben wegen ihrer tatsächlichen offenen Befunde auf M0. Keine
Ausnahme oder Warnungsfreigabe wurde hinzugefügt. Die [Anwendungsquittung](ci-graph-repairs/german-applicability-support-application-2026-11-06.json)
und der [lesende Produktionsreplay](ci-graph-repairs/verify_german_scope_integration.ts)
binden diesen eigenen Schritt.

**Anschließende Informatik-Normalisierung:** 22 geerbte und zehn unabhängig
geprüfte transitive Duplikate wurden aus neun Assessment-Arrays entfernt.
Ein elfter G17-Vorschlag bleibt nach dem unabhängigen DFS-/BFS-Hold erhalten.
Nach jedem der 32 Entzüge bleiben die vollständigen globalen Goal-, atomaren
und rein atomaren Autorenrouten gleich. Der tatsächliche Produktionschecker
meldet danach null G16 und 62 G17; die übrigen acht Checks bestehen. Der
lesende Replay vergleicht die angewandte Quelle zusätzlich mit dem vollständig
rekonstruierten Kandidaten. Die vollständige Compositionprüfung besteht für
352 Views mit null Fehlern und 2358 ausgewiesenen Warnungen. Die echte
CQR-Gesamterzeugung vom `2026-11-06T13:18:14.655Z` bestätigt weiterhin drei
M6-Fächer; Informatik bleibt wegen seiner 62 offenen Befunde M0. Die
[Anwendungsquittung](ci-graph-repairs/informatics-normalization-application-2026-11-06.json)
bindet diese Ergebnisse. Aufgaben, historische Praxisquittungen und Mastery
wurden dadurch nicht umgeschrieben oder neu freigegeben.

**Aktueller Grundlagen-Folgeschritt:** Sechs unabhängig geprüfte gewöhnliche
Informatik-Voraussetzungsarrays und sieben Deutsch-Felder sind inzwischen
angewandt. Zwei Deutsch-Phasenverstöße entfallen durch vorhandene fachliche
E-Grundlagen; die Gesamtaufgabe behält ihren bisherigen Vorbereitungsumfang.
Ein vollständiger Replay über alle 21 Kataloge bestätigt exakt die 23
einzeln geprüften Goal-/Atomic-Nachfrageänderungen und keine fremden Folgen.
Der allgemeine Graphvalidator besteht für 593 Landschaften, die vollständige
Compositionprüfung für 352 Views/21 Kataloge mit null Fehlern und 2358 Warnungen.
Der echte CQR-Bericht vom `2026-11-06T14:51:11.291Z` bestätigt weiterhin Deutsch,
Geschichte und Latein als M6 sowie Informatik als M0 mit 62 G17-Befunden.
Die [Anwendung mit Replay](ci-graph-repairs/informatics-german-foundation-application-2026-11-06.md)
bindet diese eigenen Ergebnisse. Sieben geschützte Fachfloors bleiben rot.

**Angewandter Informatik-39er-Nachfolger:** Die unabhängig geprüften 39
Voraussetzungsarrays und 166 abgeleiteten Jurisdiction-Felder sind inzwischen
angewandt, Quelle `5921c402…` → `93a653b1…`. Die Angebotskorrektur ist ausdrücklich
entschieden: keine erfundenen Quellenmappings oder pauschalen Overrides; keine
gewöhnlichen Targetverluste und kein verkleinerter kanonischer Nenner. 28 von
35 tatsächlichen Scopes ändern sich, HE/BY/nationale Kontexte bleiben gleich.
Die native Nachprüfung bestätigt alle 19 Views, 35 Scopes, 414 A/M- und 28
Kartenrecords. Der Root-Replay bestätigt sämtliche globalen 142/154
Nachfragedeltas über 21 Quellen. General593 und Composition352 bestehen mit
null Fehlern; die 2358 Compositionwarnungen bleiben ausgewiesen. Der echte
vollständige CQR-Bericht vom `2026-11-06T17:08:02.394Z` bestätigt Informatik
mit 59 G17-Befunden weiterhin als M0; Deutsch, Geschichte und Latein bleiben M6.
Der Floorcheck scheitert weiterhin an genau sieben Fachuntergrenzen.
Die [Anwendung samt Nachweisen](ci-graph-repairs/informatics-whole-exam-foundation-application-2026-11-06.md)
trennt dies von den offenen gewöhnlichen Holds, sechs generischen Prüfungen
und dem unangewandten Q4-Entwurf.

Ein zusätzlicher echter G01b-Gegenfall zeigte, dass verschiedene Hex-Schreibweisen
desselben UUID-Werts bislang als getrennte Strings durchgingen. Die neue
wertbezogene Kollisionsprüfung verwirft solche Doppelidentitäten innerhalb und
zwischen kanonischen Landschaften. Einzelne Großschreibungen bleiben zulässig;
keine ID wird dabei umgeschrieben. Der zunächst rote Test und die gesamte
14-Graphen-/35-Berichte-Integration bestehen nach der Korrektur. Die neue
PoWi-Generatorprobe prüft die vorhandenen fünf Deckeinträge und echte
Fehl-/Mehrdeutigkeitsfälle ebenfalls über den bestehenden C611-Aufruf.

Vor Kantenkorrekturen wird die bestehende Main-Laufzeitauflösung korrigiert:
Ein gemeisterter oder außerhalb liegender Zwischenknoten darf einen weiterhin
benötigten transitiven Pfad nicht abschneiden. Drei echte Gegenbeispiele
scheiterten am Altcode und bestehen mit der begrenzten Korrektur. Die
[Umsetzungsabgrenzung und Verbraucherprüfung](ci-contract-runtime-transitivity-proposal-2026-11-06.md)
halten diese Reparatur von neuer Anerkennungs-/Einheitenruntime getrennt.
Der begrenzte gemeinsame Backendlauf führte 181 Tests aus: 180 bestanden;
ein Kontextstart wurde durch eine parallel vorgenommene Curriculumänderung
korrekt zurückgewiesen. Genau dieser Test bestand anschließend bei stabilem
Datenstand. Damit besitzt jeder ausgewählte Test einen erfolgreichen Lauf,
jedoch wird kein einziger durchgehend grüner Gesamtlauf behauptet. Gepinntes
JDK 25.0.2+10, vorhandene Offline-Abhängigkeiten und vorhandene Ressourcen
wurden verwendet; ein frischer vollständiger Ressourcen-/Remote-CI-Lauf bleibt
gesondert erforderlich. Der Backendumfang ist danach eingefroren.

Der auf main gespeicherte CQR-Bericht trug die früheren M6-/M7-Werte ohne
den neuen vollständigen Graphvertrag. Der aktuelle Branchbericht ist dagegen
tatsächlich mit der strikten CQR-001-Prüfung erzeugt und enthält den oben
ausgewiesenen Zwischenstand. Der historische Abgleich des bisherigen
Prüferprofils und die anschließende Integration der vollständigen
Strukturprüfungen bleiben getrennt belegt. Notwendige Identitätsmigrationen
werden vor Datenkorrekturen präzise inventarisiert. Keine automatische
fachliche Kantenkorrektur und keine Einheitenzerlegung sind dadurch erlaubt.

## Verbindlicher Wiederherstellungsplan nach Astra-Prüfung

Der Auftrag ist seit der Fortsetzung am 6. November die tatsächliche
Wiederherstellung der zehn oben genannten Fachstände unter wirksamen harten
Prüfungen. Das bestehende CI-Goal wird fortgeführt. Die folgende Reihenfolge
ist die fachliche Arbeitsgrundlage; weder ein gespeicherter Altbericht noch
eine vollständige Regelmatrix erfüllt den Reparaturauftrag.

1. **Den fehlerhaften Graphen vor der Reifeableitung zurückweisen.**
   `CQR-001` erhält das Ergebnis der strikten Strukturprüfung, bevor
   `deriveCurriculumMaturity` den Stand bestimmt. Bereits ein fehlgeschlagener
   Grundcheck verhindert `graphReady` und ergibt M0. Die unveränderten zehn
   Fach-Untergrenzen müssen anschließend den CI-Lauf scheitern lassen.
   Die Integration wird mit tatsächlich fehlerhaften Graphdaten durch die
   gesamte Kette geprüft: Graphbefund → CQR-001 fail → M0 → Floor-Verletzung.
   Ein Test mit lediglich vorgefertigtem `status: fail` beweist diese Kette nicht.
2. **Das konkrete Eingabeuniversum vollständig auflösen.**
   Der erste Meilenstein-Rollout verwendet alle 21 aktiven kanonischen
   Gymnasium-Landschaften als gemeinsamen Identitätskatalog. Der Befund pro
   Curriculum umfasst seine vollständigen Goals, ausgehende transitive
   `contains`-/`requires`-Abhängigkeiten und alle `contains`-Vorfahren, die
   Voraussetzungen vererben. Nur zur Vererbung importierte Vorfahren ziehen
   keine sachfremden Geschwister hinein. Explizit qualifizierte Referenzen
   müssen genau auflösbar sein; fehlende oder mehrdeutige Ziele sind Fehler.
   Fokus, Applicability, Sichtbarkeit oder vorhandene Mastery reduzieren diese
   Grundprüfung nicht. Die gesonderten Konflikte des erweiterten
   593-Datei-Importbestands bleiben sichtbar; sie werden nicht durch diesen
   bewusst bezeichneten kanonischen Rollout scheinbar gelöst.
3. **Die mathematischen Pflichten getrennt prüfen.**
   Direkte `contains` und `requires`, geerbtes `R_effective` sowie atomar
   normalisierte Nachfrage müssen jeweils die zugehörigen Zyklusbedingungen
   erfüllen. Lokale Minimalität prüft doppelte direkte/geerbte Anforderungen.
   Transitive Minimalität nach Graph Definition §7.3 entfernt dagegen eine
   verfasste Ursprungskante, berechnet deren Vererbung vollständig neu und
   prüft die alternative Erreichbarkeit auf **Goal-Knoten**. Der vorhandene
   S0-Kern verwendet diese richtige Relation. Atomexpansion gehört zur
   separaten G42-Zyklusprüfung und ersetzt niemals G17. Negativfälle müssen
   fremde Vorfahren, versteckte und fachübergreifende Pfade sowie den erst
   nach Clusterexpansion sichtbaren Atomzyklus enthalten.
4. **Die 19 Nullgewichte gezielt korrigieren.**
   Im kanonischen Wiederherstellungsumfang sind alle 19 betroffenen Goals
   Cluster: je eine Kartensammlung in Wirtschaft und Politik/Wirtschaft sowie
   17 bayerische Politik/Wirtschaft-Cluster. Für genau diese Cluster gilt als
   geprüfte Reparaturkonvention die Summe der bestehenden positiven Gewichte
   ihrer **eindeutigen atomaren `contains`-Nachfahren**. Geteilte Nachfahren
   zählen einmal. Beide Kartensammlungen erhalten 5; die 17 thematischen bzw.
   Jahrgangscluster erhalten in ihrer vorhandenen Reihenfolge
   `46, 8, 10, 10, 7, 11, 49, 12, 13, 13, 6, 5, 39, 17, 4, 6, 12`.
   Alle Werte wurden unabhängig nachgerechnet. Kein Atomgewicht, keine ID
   und keine Kante ändert sich dabei. Der genaue Feld-Diff und G02 werden
   geprüft; anschließend wird tatsächlich geprüft, welche gebundene
   Reviewevidenz dadurch ihre Aktualität verliert.
5. **Die 164 Identitätsdefekte als bedeutungserhaltende Migration beheben.**
   Mathematik enthält eine alte Cluster-ID mit elf statt zwölf Zeichen in
   der letzten UUID-Gruppe. Politik/Wirtschaft enthält 151 IDs mit
   `8-4-5-4-12`-Gruppen und sechs symbolische Memory-IDs; Wirtschaft enthält
   sechs symbolische Memory-IDs. Diese Fälle verlangen eine überprüfbare
   eineindeutige Alt→Neu-Zuordnung, kollisionsfreie deterministische UUIDs und
   unveränderte Zielbedeutungen. Die alte Integrationsbezeichnung bleibt über
   die Zuordnung und bei geeigneten Symbolnamen über `shortKey` nachvollziehbar.
   Kein einzelnes Hexzeichen wird ohne Beleg als vermeintliche ursprüngliche
   Identität geraten. Aktive Referenzen werden vollständig und konsistent
   migriert; historische Archive und veröffentlichte Nachweise bleiben intakt.
6. **Lernzustand und Reviewevidenz vor einem ID-Wechsel absichern.**
   Die vorhandene `exact`-GoalMapping-Projektion überträgt Masterywerte und
   Zeitstempel, beweist aber allein keine vollständige Identitätsmigration.
   Kartenstatus liegt zusätzlich unter einem Goal-Schlüssel in
   `LearnerClientState`; die zehn betroffenen Memory-Goals müssen ihre
   bestehenden Karten-IDs, Verifikationen, Übungsplanung und gespeicherten
   Ergebnisse erhalten. Ebenso werden aktives Ziel, Fokus, persönliche
   Plan-IDs, Abschlussereignisse und portable Alt-Exporte gegen die Zuordnung
   geprüft. Die Migration muss idempotent sein, alte und neue Einträge
   deterministisch zusammenführen und darf weder neue Abschlüsse noch neue
   Abschlusszeitpunkte erfinden. Konfligierende vorhandene Zustände sind
   ausdrücklich zu behandeln. Tests verwenden alte persistierte Daten und
   prüfen Laden, Fortschritt, Fortsetzung, Kartenverifikation sowie erneuten
   Import nach der Migration.
   `goalReviewFingerprint` enthält die Goal-ID; daher wird historische
   Evidenz nicht durch bloßes Umbenennen oder Austauschen ihrer Hashes passend
   gemacht. Eine überprüfbare Migrationskette muss zeigen, dass Bedeutung,
   Aufgaben, Rubriken, Karten und Assets unverändert sind. Tatsächlich
   geänderte Inhalte erhalten die dafür erforderlichen neuen Reviews.
7. **Minimalitätsbefunde fachlich auflösen.**
   Der neue harte Prüfer liefert die tatsächlich betroffenen Ursprungskanten,
   alternative Zeugenpfade und geerbte Herkunft je Curriculum. Die bisherigen
   923 Mathematik- und 396 Physikbefunde sind ein früherer Teilbestand, keine
   Vollzählung des neuen 21-Landschaften-Gates. Jede Reparatur erhält eine
   fachliche Begründung für die beabsichtigte direkte Voraussetzung und wird
   anschließend gegen vollständige Routen, Orientierung, Prüfungsendpunkte,
   Quelle und Sicht geprüft. Eine pauschale transitive Reduktion oder
   automatisches Löschen didaktischer Kanten bleibt ausgeschlossen. Eine
   tatsächlich widersprechende zusätzliche Direktkantenpflicht wird mit
   konkretem Gegenbeispiel aufgelöst und nicht durch Wahl einer bequemeren
   Relation verdeckt. Es findet keine Lerneinheitenzerlegung statt.
8. **Die alten Fachstände aus frischen gültigen Nachweisen wieder ableiten.**
   Nach den Inhaltskorrekturen werden Quell-/Mappingbindung, Applicability,
   Composition, Routen, semantische Atomizität, Memoryentscheidungen und die
   benötigten D/P/A/M/V-Nachweise auf dem exakten neuen Stand geprüft.
   Regeneration darf Ergebnisse aktualisieren, aber keine fehlenden Reviews
   erfinden. Erst der frische CQR-Stand mit bestandenem harten Graphvertrag,
   unveränderten Floors und erforderlicher aktueller Evidenz begründet die
   wiederhergestellten M6-/M7-Werte. Lokale Ergebnisse und der terminale
   Remote-CI-Lauf für den gesicherten PR-Commit werden getrennt berichtet.

Die [konkrete Implementierungsplanung für ID-Kontinuität und vollständige
Voraussetzungenauflösung](canonical-id-repair-and-transitive-frontier-plan-2026-11-06.md)
benennt die vorhandenen Speicher-/Import-/Reviewpfade, den engen
Bijektionsbeweis und die nötigen Negativfälle. Sie ist die Grundlage für
diese beiden Reparaturschritte; sie behauptet keine bereits fertige Migration.

Die globale Anerkennung vom 4. November bleibt eine bereits geltende
Main-Pflicht; die zusätzlichen eingefrorenen PR83-Coverage-Regeln bleiben
getrennt. Diese Meilensteinreparatur implementiert weder neue
Einheitenruntime noch neue Prüfungs- oder Zugangspolitik. Die geklärte
Cardgoal-Semantik bleibt erhalten: bestandene Karten werden nicht erneut
geprüft; Fälligkeit entzieht keine Verifikation oder Mastery.

## Bereits belegte Lücken und Grenzen

1. Transitive Minimalität ist konzeptionell Pflicht und nun Teil des harten
   CQR-001-Gates. Die tatsächlichen Curriculumfehler sind weiterhin offen;
   die Fachuntergrenzen scheitern deshalb zu Recht. Kleine Formalbeispiele
   ersetzen diese Bestandsvalidierung nicht.
2. Der ursprüngliche UUID-CLI übersah kanonische Dateien. Die
   [reparierte native Bestandsprüfung](ci-graph-repairs/goal-uuid-cli-repair-2026-11-06.json)
   prüft inzwischen alle Runtime-Landschaften außerhalb `quality`: 593 Dateien,
   56171 Goals, weiterhin 164 ungültige IDs und 327 ungültige Referenzendpunkte
   als 491 harte Fehler. 15 echte CLI-Fixtures und zehn Workflowkontrollen
   bestehen; leere Gesamtprüfungen, JSON-/Typfehler und UUID-Randwhitespace
   gehen nicht als Pass durch. Keine Datenmigration wurde damit vorgenommen.
   Der [allgemeine Graphvalidator](ci-graph-repairs/general-graph-reference-cli-repair-2026-11-06.json)
   erzwingt inzwischen ebenfalls eindeutige Fremdverweise: lokaler Owner zuerst,
   qualifizierter Owner exakt, sonst genau ein logischer Fremdowner. 23 echte
   CLI-Kontrollen und elf Workflowtests bestehen. Zyklen bleiben dort
   landschaftslokal; die separaten strengen CQR-Checks besitzen ihren eigenen
   vollständigen Scope. Bestehende Topologiekonflikte zwischen Sprachdateien
   werden durch diesen reinen Identitätsindex nicht als konsistent freigegeben.
3. Ein Test kann aktiv die alte Semantik absichern. Die vorbereitete neue
   globale Anerkennung und vollständige transitive Fokusauswertung sind
   dadurch nicht bereits nachgewiesen.
4. Der Product Owner hat den Kartenzielvertrag am **6. November 2026**
   klargestellt: Die Karten gehören zum Lernziel und werden mit Wiederholungen
   gelernt; die bestandene Abschlussprüfung liefert dessen Masterednachweis.
   Kartenfälligkeit öffnet ein abgeschlossenes Ziel nicht erneut und entzieht
   keine Mastery. Die alten Aussagen über eine zusätzliche Fälligkeitsbedingung
   und einen Widerruf durch erneute Prüfung waren veraltete Dokumentation.
   Bereits bestandene Karten sind im aktuellen Prüfablauf ausgeschlossen.
   Maßgeblich ist [der korrigierte Zieltypvertrag](../concept/skill-graph/node-types.md#due-and-mastery-semantics).
   Die eingefrorenen Reviewnotizen enthalten noch die alte Darstellung und
   dürfen sie nicht wieder als offene Produktentscheidung einführen.
5. CQR-Bericht, harte Einzelprüfungen, geschützte Reifegrad-Untergrenzen und
   optionale Paket-/OWL-Workflows sind verschiedene Durchsetzungsstärken.
   Grüne CI oder M7 belegen nur den tatsächlich implementierten Prüfvertrag.

## Gesicherter CI- und Identitätszwischenstand

Der zusätzliche tatsächliche Assessment-Lauf `42233674881` für Kopf
`e8f97c2b7a93578beef77be729f166f6fd47e206` und Merge
`39a9fc5d8ea869d8ffea0e4931244e2895d3b383` ist ebenfalls bestanden: 347 Tests
in 37 XML-Suiten, null Fehler oder Skips. Das echte Artefakt ist heruntergeladen
und gegen seinen SHA-256 geprüft; die erweiterte Fixturequittung bindet alle
Suiten. Der OpenAI-Apps-Job des zugehörigen Hauptlaufs `42233675012` besteht
nach der begrenzten Submission-Neuerzeugung ebenfalls.

Die fünf verbliebenen Backend-Testfehler des älteren Hauptlaufs sind inzwischen
ausschließlich in drei Testklassen korrigiert. Offene transitive Vorbereitung,
korrekte Owner und bekannte Supportziele bleiben verbindlich; ein Quotenfall
lässt ein weiteres lernbares Ziel ausdrücklich offen. Alle 231 Tests dieser
Klassen bestehen mit normaler Ressourcenverarbeitung und gepinntem JDK ohne
Fehler oder Skips. Der [unabhängige Gegenblick](ci-graph-repairs/main-transitivity-fixture-independent-review-2026-11-06.json)
prüft Diff, echte Definitionen und XMLs. Dies ist ein lokaler Nachweis; der
folgende gepushte Stand benötigt frische vollständige Remote-CI.

Die frische Remote-Assessment-CI für PR-Kopf `be07d93e9357a8405a892b354c1eefaa3442568e`
führte 347 Tests aus; zwei Testaufbauten bedienten noch ausschließlich den
alten Resolver-Aufruf. Die konkrete [Fixture-Reparatur](ci-graph-repairs/assessment-ci-fixture-repair-2026-11-06.json)
erhält alle Produktionsguards und prüft den vollständigen Level-2-Leseumfang
sowie Readonly-Grenzen. Die beiden Methoden und danach die gesamte 55er-Klasse
bestehen lokal mit gepinntem JDK/Offline-Ressourcen. Der anschließende frische
Assessment-Lauf `42219374462` für Kopf `42e62121a991e29c108b85a1ffa81f50ff1a5e63`
und tatsächlichen Merge `7ac65594d00b47ba8e58d1b5e47e57a1207aaf85`
ist vollständig bestanden: 347 Tests in 37 XML-Suiten, null Fehler/Fehlschläge/
Skips, einschließlich aller 55 Tests der betroffenen Klasse. Das tatsächliche
Remote-Artefakt ist heruntergeladen und gegen seinen SHA-256 geprüft. Der
Haupt-CI-Lauf und spätere Datenstände benötigen weiterhin eigene Ergebnisse.

Der anschließende Hauptlauf `42219374143` auf demselben Kopf ist inzwischen
abgeschlossen. Frontend, Buchbau, Action-, Claude- und Public-Edge-Jobs
bestehen. Drei Jobs scheitern: Curriculum an genau zwei Deutsch-GVR-002-
Phasenverstößen (Geschlechterrollen Q1 → Rollenbilder Q2 und mediale
Aufarbeitung Q3 → Filmsprache Q4), Backend mit fünf fehlgeschlagenen Tests
bei 2729 ausgeführten Tests und 19 Skips sowie OpenAI Apps an
der veralteten Submission-Ableitung des unveröffentlichten Entwurfs.
Die fünf Backendfälle enthalten Erwartungen an den alten Mastery-Cut oder
ungültige Referenz-Fixtures; die Reparatur bewahrt die neuen vollständigen
Voraussetzungs- und Ownerguards und benötigt eigene lokale/Remote-Ergebnisse.
Die beiden Phasenverstöße werden fachlich geprüft. Die vier Submission-
Ableitungen sind lokal mit dem vorhandenen Producer aktualisiert;
`check`, Paketbau und tatsächlicher
ZIP-Audit bestehen, `readyForSubmission` bleibt falsch. Das ist keine
Portalveröffentlichung und noch kein frischer grüner Remote-Gesamtlauf.

Der ebenfalls abgeschlossene Hauptlauf `42205723343` meldete drei weitere
fehlgeschlagene Jobs: Der interne unveröffentlichte OpenAI-Entwurf war nach
der begrenzten Instruktionskorrektur veraltet; zwei Jobs prüfen dieselben
gebundenen Entwurfsquellen. Der dritte meldete den durch die neuen echten
Meilensteine veralteten G8/G9-Statusbericht. Beide Ableitungen sind mit ihren
bestehenden Produzenten aktualisiert. `openai_plugin_release.mjs prepare`
und `verify` sowie alle 24 Submissiontests bestehen lokal. Die 15 vorab
gebundenen veröffentlichten/historischen/retained Dateien bleiben bytegleich.
Der G8/G9-Bericht und sein eigener Aktualitätscheck bestehen für die drei
aktuell abgeleiteten M6-Fächer; die sieben übrigen Fachfloors bleiben Fehler.

Für die spätere 164-ID-Korrektur liegen gesonderte unveröffentlichte
Bijektionswerkzeuge und ein unverdrahteter Backendkern vor. Eine unabhängig
verifizierte Quellhülle A auf `80d70f08e0ce31cbdc214e62b5d3e0e80cd850db`
belegt 164 UUID-v5-Zuordnungen, 593 Katalogdateien und 14926 exakte
Feldprojektionen. Ihre einzige Fähigkeit ist isolierte Kandidaten-QA; sie
behauptet weder QA-Gültigkeit noch Speicherung, Runtimeintegration oder
Aktivierung. Die historische 212-Hülle bleibt mit echten Readinessblockern
gesperrt. Die separate operative Hülle B, Repository-/Paketadapter,
Zustandskontinuität und echte neue QA-Outputs sind noch herzustellen.
Kein Aliasbestand wird durch Statusflag, Hashnachführen oder Repo-Fallback
in einem Paketbackend als aktiviert ausgegeben.

Der [unabhängige Zweitblick](ci-graph-repairs/canonical-identity-proof-independent-review-2026-11-06.md)
fand vier konkrete Fehler im zunächst unverdrahteten Java-A-Kern. Alle vier
sind inzwischen mit echten roten Regressionen und anschließend 23 grünen
Tests behoben; der Reviewer reproduzierte die 23 Tests zusätzlich separat.
Dieser begrenzte Quellprojektionskern ist weiterhin keine Runtimeintegration.

Die anschließende [reine Zustandsprojektion](ci-graph-repairs/canonical-identity-state-projection-independent-review-2026-11-06.md)
besitzt 15 eigene Tests zusätzlich zu den 23 A-Kontrollen; beide Klassen
wurden unabhängig frisch kompiliert und ausgeführt. B bleibt geschlossen.
Vier konkrete Gegenbeispiele zeigen weiterhin nötige Integrationsarbeit für
unbekannte alte Zeilen und tatsächlich gespeicherte qualifizierte bzw.
anders geschriebene UUID-Keys. Der Helfer darf deshalb nicht einfach vor
bestehende Reads/Upserts geschaltet werden. Reale Zustands-/Browser-/Paket-
Abnahme und aktuelle QA-Ausgaben bleiben eigenständige Pflichten.

Der spätere [Owner-Gegenblick](ci-graph-repairs/canonical-identity-owner-namespace-independent-review-2026-11-06.md)
weist die frühere Annahme gleichwertiger Owner-Großschreibungen zurück:
`landscapeId` ist ein exakter Namensraum; ausschließlich Goal-UUID-Werte
werden wertbezogen verglichen. Drei Stellen im weiterhin unverdrahteten
Identitäts-/Statekern sind entsprechend korrigiert. Sechs echte rote Fälle
belegen fremde Goal-/Reviewzugriffe und fälschlich vereinigte oder kollidierende
PortablePlans. Danach bestehen 43 JUnit-Tests, einschließlich aller bisherigen
23 A- und 15 Statekontrollen. Der
[unabhängige erneute Lauf](ci-graph-repairs/canonical-identity-owner-namespace-repair-independent-review-2026-11-06.md)
reproduziert 43/43 ohne Skips oder Abbrüche. A-Vertrag, Proofbytes und Kernel
bleiben unverändert; B und die tatsächliche State-/Repositoryintegration
bleiben geschlossen. Die aktuelle Quellmigration ist dadurch nicht umgesetzt.

## Fortsetzung: Kartenregressionen, Scopeprüfung und frische CI

Die beiden neuen öffentlichen Karten-Servicefälle sind lokal mit normaler
Ressourcenverarbeitung ausgeführt: 21 Tests, keine Fehler oder Skips. Ein
tatsächlich bestandener Kartenabschluss bleibt nach Überschreiten gespeicherter
Wiederholungsdaten gemeistert; bereits verifizierte Karten werden weder neu
angeboten noch über Einzel- oder Batchaufrufe erneut geprüft. Der
[unabhängige Gegenblick](ci-graph-repairs/srs-completion-retention-independent-review-2026-11-06.md)
bindet die echten XML-Ergebnisse. Die Assessment-CI verlangt jetzt neun statt
sieben Fälle dieser Klasse. Dieser neue Commit benötigt seinen eigenen
Remote-Lauf; die frühere grüne Assessment-CI ist dafür kein Nachweis.

Der reparierte HE-Q2.4/Q2.5-Scope-Test besteht für 88 Views mit 110 tatsächlichen
Negativkontrollen. Historische Clusterumbauten, aktuelle Ersatzkompetenzen und
regionale Supportrollen sind einzeln geprüft; die kanonische Mathematikquelle
ist unverändert. Der
[Review](ci-graph-repairs/he-gk-q24-q25-scope-independent-review-2026-11-06.md)
erläutert die Grenzen dieser Zielersetzungen. Der zuvor nicht verdrahtete Test
wird zusätzlich als harter Curriculum-Schritt vor der bestehenden
Q2-M7-Projektionsprüfung ausgeführt.

Der getrennte [Source-A-Metadatenbeleg](ci-graph-repairs/source-identity-qa-metadata-bridge-review-2026-11-06.json)
beruht auf einem neuen tatsächlich abgeschlossenen isolierten Lauf. Er bindet
die unveränderten Originalprüfer an den Git-Stand `80d70f08e0…`, sämtliche
fünf ursprünglichen Deep-QA-Ergebnisse sowie den Composer-Lauf über den
reinen ID-Kandidaten: 352 Views, null Fehler und 2358 ausgewiesene Warnungen.
53 lokale Belegdateien und alle neun Codefassungen sind bytegeprüft. Die
Fähigkeit liefert ausschließlich die zwei bisherigen Semantic-Kind-Ledger
unter übersetzten IDs; sie erteilt keine aktuelle QA- oder M7-Freigabe und
aktiviert keine Migration. Kurze Boundary- und echte schreibgeschützte
Vorbereitungstests werden ohne erlaubte Skips in Curriculum-CI verdrahtet.
Die vollständige isolierte Mehrgigabyte-Prüfung wird dadurch nicht bei jedem
PR automatisch wiederholt. Der A80-Kandidat ist vor der späteren Migration
auf die dann aktuellen fachlichen Quellen neu aufzusetzen.

Am gepushten Kopf `e8ad0caf5e8ad39a7cde8a787da88b91ddb48cf1` besteht der
Backendjob `128001774652` des Hauptlaufs `42245440726` tatsächlich; ebenso
Frontend, Buchbau, Action, Claude, OpenAI Apps und Public Edge. Der
Curriculumjob `128001774609` besteht inzwischen Graph, Wording und die
Duration-Readiness-Prüfungen, scheitert danach am veralteten generierten
G8/G9-Angebotsbestand (`check:gymnasium-duration-offerings`). Nachfolgende
Schritte sind übersprungen, keine bestandenen Gates. Assessment `42245440619`,
Docs `42245440547`, OAuth `42245440572` und Gemini `42245440845` melden Erfolg;
für den neuen Assessment-Lauf ist hier keine erneut ausgezählte XML-Quittung
behauptet. Der Hauptlauf besitzt noch keinen erfolgreichen Gesamtabschluss.

Die veraltete G8/G9-Angebotsdatei ist anschließend mit dem unveränderten
Producer regeneriert. Beide Maps enthalten genau die drei aktuellen M6-Owner
mit identischen Einträgen; ausschließlich die sieben M0-Owner entfallen.
Der tatsächliche Consumer-Test erwartete zuvor Mathematik-/Biologieangebote
unabhängig vom CQR-Stand. Er prüft jetzt echte Deutsch-/Latein-Positivfälle,
alle 18 tatsächlichen kanonischen M0-Einträge und die statusabhängige Rückkehr
von Mathematik/Biologie nach gültiger Wiederherstellung. Paketfixture und
sämtliche vorhandenen Mathematikprojektionen bleiben erhalten. Der
[Abschlussbeleg](ci-graph-repairs/gymnasium-duration-offerings-consumer-review-2026-11-06.json)
bindet den frischen CQR vom `2026-11-06T17:08:02.394Z`, den grün ausgeführten
Consumer, einen tatsächlichen roten Altdatei-Gegenfall und den bestandenen
Angebots-Aktualitätscheck. Floors, Policy und Views sind unverändert.
Die frische Remote-Abnahme dieses Folgeschritts bleibt gesondert erforderlich.

Der Informatik-39er-Satz ist inzwischen mit geprüften Angebotsfolgen angewandt;
die obige Anwendung und die frische CQR-Erzeugung benennen den Stand. Der
[Einzelreview der weiteren 59 Minimalitätswege](ci-graph-repairs/informatics-remaining-minimality-review-2026-11-06.md)
unterscheidet 32 später einzeln nachzuweisende Normalisierungen und 27 echte
fachliche Holds. Kein Zeugenpfad berechtigt zum pauschalen Löschen einer Kante.

## Aktuelle Fortsetzung: angewandte Reparaturen und getrennte Kandidaten

Der [vollständige aktuelle Gesamtnachlauf](ci-graph-repairs/informatics-bounded26-current-cqr-2026-11-06.json)
vom `2026-11-06T18:45:31.502Z` enthält die tatsächlich angewandte kleine
[Math-Memory-Reparatur](ci-graph-repairs/math-memory-prerequisites-application-2026-11-06.md)
und die fünf Sprachoperationen sowie die 26 Informatikkorrekturen.
Deutsch, Geschichte und Latein erreichen M6;
die sieben übrigen geschützten Floors bleiben rot. Mathematik hat jetzt
919 CQR-001-Befunde, davon 917 G17; Informatik hat 47. CQR-101/102 bestehen
dort. Die vollständige
21er-Tabelle und die tatsächlichen Nachlaufbefehle stehen im Gesamtbeleg.
Der [vorherige Gesamtnachlauf](ci-graph-repairs/post-memory-orientation-current-cqr-2026-11-06.md)
von 18:13 UTC und die datierten Einzelbelege bleiben historische Zwischenstände.
Der kleine Math-Memory-Satz ist bereits angewandt; ältere umfangreichere
Arithmetik-/Folgenhypothesen sind damit weder angewandt noch neu qualifiziert.

Die [Sprach-Anwendungsquittung](ci-graph-repairs/global-orientation-cycles-application-2026-11-06.md)
rekonstruiert exakt fünf geschützte Arrays in drei aktiven Dateien.
Ein zusätzlicher direkter Produktionsprüfer bestätigt G15 und G42 für alle
21 aktuellen Landschaften mit jeweils null Befunden. Drei falsche
Orientierungs-Selbstanforderungen entfallen; zwei explizite französische
Einstiege erhalten den vorhandenen atomaren Orientierungsbedarf.
Es wurden keine weitere Quelle, QA-Freigabe oder Länderentscheidung geändert.

Der [engere Informatik-Kandidat](ci-graph-repairs/informatics-bounded26-overview-2026-11-06.md)
ist nach [abschließendem unabhängigen Review](ci-graph-repairs/informatics-bounded26-independent-review-2026-11-06.md)
[tatsächlich angewandt](ci-graph-repairs/informatics-bounded26-prerequisites-application-2026-11-06.md):
24 gewöhnliche Fachkorrekturen, ein getrenntes
Turing-Folgeziel und der konkret geprüfte Dokumentations-Motivationseinstieg.
Cache und ISA bleiben mit drei breiten Abiturverträgen verpflichtender
Folgeblock. Im aktuellen Gesamtnachlauf bestehen die echten Routeprüfungen, aber 47 G17
bleiben offen. Alle 24 tatsächlichen `examData`-Payloads bleiben unverändert;
der vorhandene CQR-202-Routenscope erfasst nur 14 davon und lehnt sechs ab.
Sein Ergebnis qualifiziert die zehn zusätzlichen Abitur-`examData` nicht.
Eine M6-/M7-Wiederherstellung ist dadurch nicht belegt.

Der Product Owner präzisiert den Pflichtumfang anschließend: amtlich belegte
Ziele **oder Ziele, die eine Lücke schließen**. Die
[Entscheidungsnotiz](ci-graph-repairs/curriculum-required-goal-scope-decision-2026-11-06.md)
hält die tatsächliche Antwort und Ergänzung fest. Der
[aktuelle fachliche Gegenblick](ci-graph-repairs/informatics-875-official-or-gap-followup-2026-11-06.md)
findet für die Hierarchie-/Parallelitätsvertiefung bei `875cb53c…` weder eine
amtliche Pflicht noch eine tatsächlich erforderliche Lücke: Alle sieben
atomaren Verbraucher sind die bekannte 41er-Prüfung und sechs Datenbankprüfungen.
Die realen Materialien benötigen diese Vertiefung nicht. Die vollständige
Scope-/Prüfungskorrektur unter Erhalt der bisherigen Identitäten und Nachweise
ist getrennt vorzubereiten. Eine bloße Entfernung aus Prüfauswahlen wäre kein
sauberer Abschluss.

Der [terminale Remote-Beleg für 5cb](ci-graph-repairs/remote-main-5cb-terminal-2026-11-06.json)
weist fünf bestandene und drei fehlgeschlagene Jobs im Hauptlauf
`42259521320` aus. Backend hat bei 2754 Tests und 19 Skips genau einen Fehler:
die Niedersachsen-/Informatik-Projektionsfixture erwartet 22 statt der
tatsächlich gelieferten 21 Ziele. Frontend scheitert an der Fächerauswahl in
`TestTrainerGymnasiumScopeUi.ts`: Die synthetische Math-/Physikclosure erwartet
Angebote, obwohl die echte generierte Repositorymap diese aktuell wegen M0
korrekt ausschließt. Die Reparatur isoliert die positive Package-Catalog-Fixture
und prüft das echte Repositoryangebot separat. Curriculum scheitert an den sieben
bekannten harten Floors, nicht an Reportfrische. Dieser ältere Remote-Lauf
enthält die späteren Math-, CQR-202- und Sprachkorrekturen noch nicht.
Produktfilter, Scope- und Datenschutzverträge bleiben bei der Reparatur
verbindlich; Erwartungen werden nicht ohne native Mengennachweise abgesenkt.

Der [Reparaturindex](ci-graph-repairs/README.md) trennt aktuelle Anwendungen,
unapplied Kandidaten, historische Reviews und tatsächliche Remote-Ergebnisse.
Der 518-Regelkorpus und seine Matrizen bleiben unverändert.

## Nächste Schritte im neuen Chat

1. Main-Basis und Arbeitsstatus verifizieren. Gesicherte Dateien lesen und ein
   bestehendes CI-Goal fortführen; das Einheiten-Goal bleibt pausiert.
2. Den abgeschlossenen 518-Regelkorpus und seine getrennten CI-Matrizen als
   festen Nenner verwenden; die 29 Alt-IDs sind Aliase und keine weiteren Regeln.
   Astra Ultra prüft die fachliche Reparatur, Sol 6.1 Ultra setzt sie um.
3. Die sieben noch fehlenden Fachstände mit den konkreten Einzelbefunden
   reparieren und nach jedem abgegrenzten Schritt frisch prüfen. Math-Memory
   und Arithmetik sind getrennt vorbereitete Pakete; sechs aktuelle
   Klassifikationsbindungen sowie zwei tatsächliche D-/P-Kontexte würden
   dabei veralten und benötigen echte Neuqualifikation. Keine vorhandenen
   Reviews bloß mit neuen Hashes versehen. Die [Bindungsanalyse](ci-graph-repairs/math-pilot-qa-binding-impact-2026-11-06.json)
   und die [Buchfolgenanalyse](ci-graph-repairs/math-pilot-book-impact-2026-11-06.json)
   sind ausdrücklich hypothetische Folgenprüfungen, keine aktuelle QA-Freigabe.
   Der [vollständige globale Replay](ci-graph-repairs/math-pilot-global-integration-review-2026-11-06.md)
   weist zusätzlich 142 geänderte Goal- und 136 atomare Nachfragemengen in
   Physik aus. Deren tatsächliche Vorbereitungsbedarfe sind vor Anwendung
   getrennt fachlich zu prüfen; die lokale 428er-Prüfung deckt sie nicht ab.
   Nicht geprüft ist kein erfülltes Kriterium.
4. Normkonflikte und nicht deterministisch entscheidbare Inhaltsurteile
   gesondert ausweisen. Maschinen können aktuelle Reviewbelege prüfen, nicht
   fachliche Richtigkeit oder reale Lernwirksamkeit beweisen.
5. Kleine getrennte Reparaturen mit echten Negativfällen liefern. Regeln aus
   main und zusätzliche Einheiten-Sollregeln nicht unbemerkt vermischen.
   Kein verdecktes Warnungs-/Baseline-Pass und keine automatischen fachlichen
   Kantenkorrekturen. Vor Befundkorrekturen den Geltungsbereich präzise festlegen.
6. PR-Stand früh sichern, CI bis passed begleiten. Lokale Prüfung, tatsächlicher
   Remote-Lauf, Betreiber-Deployment und Hostabnahme einzeln benennen.
   Erst nach Abschluss des eigenständigen CI-Themas das Einheiten-Goal fortsetzen.

## Starttext für den neuen Chat

> Wir arbeiten am eigenständigen CI-Vertragsaudit. Lies zuerst
> `docs/dev/ci-contract-audit-handoff-2026-11-06.md` und prüfe Branch/Main-Basis.
> Das Lerneinheiten-Goal und PR #83 sind eingefroren. Führe das bestehende Goal für
> den vollständigen Audit, die harte CI-Durchsetzung und die tatsächliche
> Wiederherstellung der zehn geschützten Fachmeilensteine fort. Nutze Astra Ultra für grundlegende
> Analysen und Sol 6.1 Ultra für das Doing. Nutze den festen
> 518-Regelkorpus und die CI-Matrizen, führe die begründeten Reparaturen aus und sichere
> den Fortschritt im neuen PR. Vermische die Regeln von main nicht mit der
> noch ungemergten Anerkennungsänderung aus dem eingefrorenen Einheitenstand.
> Keine weitere Einheitenzerlegung oder Produktionsänderung.
