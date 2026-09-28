# Sechs aktuelle bayerische Quellen- und Kursgeltungen

Status: vorbereiteter aktueller D-Review; keine D-Freigabe, keine menschliche
Freigabe und keine zentrale M7-Fertigmeldung. Die beiden unabhängigen Runden
müssen die tatsächlich gebundenen Texte und Bilder noch prüfen.

Die aktuelle Ist-Prüfung ersetzt die überholten Kursgeltungsannahmen der
27.-September-Memos. AGENTS.md setzt BY-GK auf das vollständige Pflichtfach
Mathematik auf erhöhtem Anforderungsniveau; BY-LK enthält zusätzlich alle fünf
Module des Vertiefungskurses. Der aktuelle Backend- und Atlas-Code verwendet
für Bayern bereits die expliziten Composition-Views. Es war kein weiterer
kanonischer Text-, View- oder Runtime-Eingriff in diesem Teilauftrag nötig.

Die sechs Ziele sind `dc12f281`, `0b162cb0`, `71fe4a39`, `49f9059a`,
`b431148b` und `9b339361`. Die ersten fünf gehören in Bayern zu GK und LK,
das Mandelbrot-Ziel nur zum technischen LK. Der reproduzierbare Audit prüft
diese aktuellen Projektionen und für die BY-spezifischen Ziele zusätzlich die
auf Bayern beschränkte Geltung. Er bindet aktuelle Seiten, Quellen, Bilder und
lokale Quelldateien. Andere Bundesländer behalten ihre eigenen Kursregeln.

Ein echter verbleibender Quellenfehler wurde repariert: Die direkte
`partial`-Kante des Validierungsziels `71fe4a39` zeigte nach der Aufteilung des
M13.4-Quellbullets noch auf den ersten, nur die Anwendung beschreibenden Aspekt.
Sie zeigt jetzt auf `by-math-m13-4-9371884f-s02-bf45d4d2b4`, den tatsächlichen
Interpretations-/Validierungsaspekt. `partial` bleibt unverändert. Der genaue
Vorher-/Nachher-Beleg steht in der benachbarten `.source-change.json`.

Die offiziellen LehrplanPlus-Seiten wurden am 28. September 2026 tatsächlich
geöffnet. URLs, Quellenabgrenzungen und die im historischen Plaintext fehlenden
Bildformeln von M12.1.2 stehen in `.criteria.md`. Diese Kriterien werden mit
identischem Hash in beide blinden Review-Runden eingebunden. Sie enthalten
Eingangsevidenz, keine vorgegebene Review-Entscheidung. Alle sechs aktuellen
Rasterbilder wurden bei der Ist-Prüfung geöffnet; es wurde kein neuer echter
Bildfehler gefunden. Das ersetzt nicht die unabhängigen D-Reviews.

Artefakte:

- `.config.json`: exakte sechs IDs und verbindliche Review-Eingaben.
- `.audit.mts`: reproduzierbarer Ist-Abgleich; vom Repository-Root mit
  `app/node_modules/.bin/tsx <audit-path>` ausführen.
- `.source-scope.json`: Audit-Ergebnis mit Datei- und Seitenbindungen.
- `.source-change.json`: enger Quellenmapping-Eingriff und Validierungen.
- Verzeichnis gleichen Namens: frisches Bundle mit zwei unbefüllten Runden;
  Vorbereitung und Vertrag über `quality:goal-description-rollout-batch`
  mit dieser Config prüfen.

Validierungen dieses Teilauftrags:

- Bestehender Backend-Test
  `LearnerPlanningScopeServiceTest.mathematicsPlanningScopeRespectsHessenAndBavariaAdvancedCourseGoals`
  erfolgreich.
- Vollständiger `GoalMappingRepositoryFixtureTest`: 87 Tests, keine Fehler,
  einschließlich der aktuellen BW/BY-Kugel-Split-Assertions des anderen Agents.
- `python scripts/validate_schemas.py`: 21284 geprüfte Dateien, erfolgreich
  zum Zeitpunkt des Quellenmapping-Eingriffs.
- Auf die eigenen Änderungen begrenztes `git diff --check`: erfolgreich.

Die parallele zentrale `test:goal-book-model`-Prüfung wurde während laufender
Kugel- und Kreisänderungen zunächst von deren Zwischenzuständen blockiert;
eine spätere vollständige Wiederholung und die abschließende CI liegen bei
Root. Kein Zwischenstand wird hier als grüner Gesamtcheck behauptet.

Finaler Vorbereitungscheck: `prepare` und `check` erfolgreich für sechs Ziele.
Aktueller Atlas-Nenner bei Vorbereitung: 800 nach dem separaten Kugel-Split.
Der Audit und die Batch-Vorbereitung binden denselben Basis-BookDigest
`sha256:189b921f0cbd8e4684e34937668585955881eefb0ed863c6cc3b7a4dc8fa3588`.
Subset-Digest:
`sha256:d8f39abb13bcd277a41518e5789fff1cafc5c8441c4e97b2930435dacb12c39f`.
Bundle-Fingerprint:
`sha256:ded10d646af326cc375a4ba53303d225940a417df313a7003178dfaf29110104`.
Die Verzeichnisse `round-a/results` und `round-b/results` sind bewusst noch
unbefüllt; die unabhängigen Prüfungen folgen nach dieser Vorbereitung.
