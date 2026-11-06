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

Die lokale Integrationsprüfung führt 13 tatsächlich fehlerhafte Graphen
durch die gesamte Kette bis zur M6-/M7-Floor-Verletzung. Zusätzlich werden
35 unvollständige bzw. unzutreffende Berichte zurückgewiesen. Der echte
Bestandsbericht wurde neu erzeugt; sein frischer Check bestätigt zunächst
die Aktualität des ersten strikten Berichts und scheiterte danach an neun
unverändert geschützten Floors. Nach der unten belegten Geschichte-Korrektur
ist die erneute Gesamterzeugung bestanden; acht Fachuntergrenzen bleiben rot.

| Fach | Ziel | Neuer abgeleiteter Stand | CQR-001-Befunde |
| --- | --- | --- | ---: |
| Biologie | M7 | M0 | 375 |
| Chemie | M7 | M0 | 354 |
| Mathematik | M7 | M0 | 925 |
| Physik | M7 | M0 | 626 |
| Wirtschaftswissenschaften | M7 | M0 | 104 |
| Deutsch | M6 | M0 | 91 |
| Geschichte | M6 | M6 | 0 |
| Informatik | M6 | M0 | 116 |
| Latein | M6 | M6 | 0 |
| Politik und Wirtschaft | M6 | M0 | 603 |

Diese Zahlen bezeichnen den neuen vollständigen kanonischen Prüfumfang
einschließlich erforderlicher fremder Vorfahren und Abhängigkeiten.
Bereits korrigiert sind ausschließlich die 19 unten beschriebenen
Nullgewichte. Ihr exakter Felddiff verändert weder IDs, Texte, Atomgewichte
noch Kanten; alle 19 G02-Defekte sind im frischen Bericht beseitigt. Die
übrigen Befunde bleiben echte Fehler und sind keine akzeptierte Baseline.

**Nachfolgender Geschichte-Zwischenstand:** Commit `00b441ed4c` entfernt
13 konkret geprüfte direkte Voraussetzungen aus sieben Assessmentzielen,
die unverändert über ihre Vorfahren geerbt werden. Die
[Anwendungsquittung](ci-graph-repairs/history-inherited-duplicate-repair-2026-11-06.json)
belegt nach jedem Entzug identische globale effektive und atomare Adjazenz.
Der echte Strukturprüfer besteht danach für Geschichte alle zehn Checks
mit null Befunden. Die anschließend tatsächlich neu erzeugte CQR-Gesamtableitung
bestätigt M6; der eigenständige Floorprüfer beanstandet Geschichte nicht mehr.
Der exakte Befehlslauf `quality:curriculum-status` endete mit Exit 0.

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

Der bisher gespeicherte CQR-Bericht trägt bereits diese alten M6-/M7-Werte;
seine Existenz ist kein Nachweis der neuen harten Prüfungen. Der frische
Abgleich des bisherigen Prüferprofils und die anschließende Integration der
vollständigen Strukturprüfungen sind getrennt zu belegen. Die statische
Reparatur beginnt beim Graphvertrag in CQR-001, einschließlich eindeutigem
Referenzraum, UUID-/Gewichtsdomäne, globalen und atomar normalisierten Zyklen
sowie lokaler und transitiver Minimalität. Tatsächliche Befunde und notwendige
Identitätsmigrationen werden vor Datenkorrekturen präzise inventarisiert.
Keine automatische fachliche Kantenkorrektur und keine Einheitenzerlegung
sind dadurch erlaubt.

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
2. Der UUID-CLI sucht mit einem Pfadglob, der kanonische Dateien nicht erfasst.
   Der allgemeine Graphvalidator prüft Zyklen landschaftslokal und erzwingt im
   unqualifizierten Fremd-ID-Fallback keine Eindeutigkeit. Gegen-Gates wie
   kanonische Eindeutigkeitsprüfung sind getrennt zu berücksichtigen.
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

## Nächste Schritte im neuen Chat

1. Main-Basis und Arbeitsstatus verifizieren. Gesicherte Dateien lesen und ein
   bestehendes CI-Goal fortführen; das Einheiten-Goal bleibt pausiert.
2. Den abgeschlossenen 518-Regelkorpus und seine getrennten CI-Matrizen als
   festen Nenner verwenden; die 29 Alt-IDs sind Aliase und keine weiteren Regeln.
   Astra Ultra prüft die fachliche Reparatur, Sol 6.1 Ultra setzt sie um.
3. Sol 6.1 Ultra ordnet je Regel Implementierung, tatsächlichen Gegenprüfer,
   Workflow/Job/Befehl, Trigger, geprüften Scope und Fehlerwirkung zu.
   „Test vorhanden“ genügt nicht. Nicht geprüft ist kein erfülltes Kriterium.
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
