# F7: zweisprachiger Normkandidat v2, 15. November 2026

**Status: revidierter Autorenkandidat v2 zur erneuten unabhängigen Konsistenzprüfung.** Das echte unabhängige Review von v1 entschied REVISE; v1 bleibt mit seinen ursprünglichen Dateien und Pins unverändert. Die Korrekturen und Prüfungen stehen in `revision-notes.md`; v2 besitzt noch keine unabhängige Annahme. Keine aktive Repositorydatei wurde durch diese Arbeit verändert. Keine Aktivierung, kein Commit, keine Veröffentlichung, keine fachliche Ziel-/Prüfungsänderung und keine Main-Abnahme. Das Managementprotokoll liegt beim integrierenden Agenten.

Der Kandidat liefert tatsächliche Quelländerungen in 26 Dateien: Graph-Definition DE/EN, Sichten- und Einheitenentwurf im Architekturkompendium, gemeinsames Glossar, Regelregister, Implementierungsabgleich, Manifest und den Spiegel in `AGENTS.md`. `proposed/` enthält die vorgeschlagenen Dateien; `candidate.patch` ist der anwendbare Unified Diff. `baseline/` bewahrt die genau gelesenen Ausgangsbytes für die Reproduktion.

Die Norm unterscheidet ausdrücklich das verbindliche Modell von der umgesetzten Grundlage: gemeinsame Landes-/Dauermodellautorität; zwei Wurzelstufen und II `after` I; abgeleitete Ausschnitte; `after` als Ordnung ohne Bedarf, Mastery oder Frontierwirkung; E1–E4 an den Kindern; R4 als E1; Quellenzuordnung gegenüber Lernplatz; frühester tatsächlicher Vorbereitungsbedarf; kanonischer Standard ohne erfundene Landesquelle. Teilumfang ist kein Vollabschluss. Eine Prüfungslücke braucht geeignete Aufgaben und Rubriken, keinen fiktiven Bedarf oder gelockerten Qualitätsmaßstab.

Das frühere `GD-U14`-Zugangsprofil ist mit datiertem Grund im Zielmodell aufgehoben. Dies behauptet keine Entfernung historischer Codepfade. Die Zeile trägt nun die noch offenen E3/E4-Ordnungsanforderungen. `GD-P05` enthält die verbindliche E2-Pflicht erklärter Planeinheiten. Beide wechseln von `opt` zu `offen`; kein harter Nachweis kommt hinzu. Die Ampel ist daher **12 HART / 50 TEIL / 57 OFFEN / 26 OPT/DOK**, weiterhin 145 Zeilen. Die eine notwendige Compiler-Konstante wird passend geändert. `GD-U13` bleibt hart ausschließlich für die unveränderte atomare 21-Wurzel-G17-Pflicht; E4 wird ihr nicht als schon bewiesen angehängt.

`decision-matrix.md` und `rule-decision-matrix.json` vergleichen jede der **26 Regeln GD-U01–U15 und GD-P01–P11** vollständig alt → neu, mit Status und verbleibendem Implementierungsumfang. Zusätzlich werden GD-X06 und GD-X13 gezielt präzisiert; GD-X30, GD-A15 und GD-D03 verlieren überholte Querverweise auf das offene Zugangsprofil. `source-pins.json` bindet die Ausgangs- und Vorschlagsbytes aller 26 Dateien, `decision-source-pins.json` die gelesenen Beschluss- und Vertragsquellen einschließlich des unveränderten V9-Registers.

**Grenze:** Null echte Landespläne sind aktiviert. `contracts/curriculum-package/v1.3/` ist eine Stufenplan-Grundlage, keine veröffentlichte Paketversion. Die drei alten fachlichen Einheiten bleiben im 1.2-Kompatibilitätsvertrag. F8–F13, produktive Leser, Paketumstellung, fachliche Clusterumzüge, neue Anwendungsanerkennung und die Lernweise sind damit nicht implementiert. Diese Grenze betrifft die künftige Einheiteneinführung und ihre Migration. Notwendige aktuelle Ziel-, Aufgaben-, Rubrik- und Deckungsreparaturen bleiben innerhalb K1–K13 schon jetzt autorisiert und brauchen ihre eigenen aktuellen unabhängigen Nachweise. Bestehende harte Prüfungen, Quellen, Floors, atomare Voraussetzungen, Fokus-, Lernstand- und Anerkennungsverträge werden nicht verändert.

## Reproduktion und Prüfung

Vom Repositoryverzeichnis aus:

```sh
python3 tmp/stage-plan-norm-f7-candidate-20261115-v2/author_candidate.py
python3 tmp/stage-plan-norm-f7-candidate-20261115-v2/check_candidate.py
python3 tmp/stage-plan-norm-f7-candidate-20261115-v2/check_review_fixes.py
```

Der Autorengenerator verwendet die gespeicherte `baseline/`, schreibt nur in diesen TMP-Ordner und erzeugt Vorschläge, Patch, Regelmatrix und Bytepins reproduzierbar. Der Prüfer legt einen isolierten `render-root/` an und verwendet den vorhandenen nativen Kompendiencompiler. Geschriebene Ausgabepfade liegen vollständig im isolierten Root. Die aktiven Quellen werden nicht überschrieben.

**Nachgewiesen:** Native Quellenprüfung einschließlich DE/EN-AST-Parität und Referenzen, Erzeugung von 44 Web-Seiten sowie deutschen/englischen LaTeX-Quellen für Graph-Definition, Architektur und Glossar; danach erfolgreiche Frischeprüfung derselben Web-Ausgaben. Der vollständige terminale Lauf steht in `verification.log` (Exit 0). `check_review_fixes.py` prüft außerdem alle Felder der 26 alten/neuen Matrixzeilen gegen die unveränderten Baselines und tatsächlichen Vorschläge, die sieben Reviewkorrekturen, die konkreten Gegenbeispiele und die bytegleiche Erhaltung von v1. `review-fix-checks.json` und `review-fix-checks.log` enthalten das Ergebnis. Das ist automatisierte Dokumentprüfung durch den Autor, kein unabhängiges Normreview, kein fachliches Aufgabenreview und kein Test mit Lernenden. PDF-Kompilierung, Remote-CI und Integration werden nicht behauptet.

Die erzeugten Dateien stehen zur Ansicht unter `render-root/docs/`; besonders `learning-units.de.md`, `learning-unit-progression.de.md`, `context-and-views.de.md` und ihre englischen Gegenstücke sowie die Regelmatrix unter `render-root/docs/qa-ci/`.

Nach Review und Übernahme sind die nativen Regenerierungen:

```sh
python3 docs/concept/skill-graph/build_spec.py --web-and-tex
python3 scripts/build_compendia.py --compendium skill-graph-architecture --compendium glossary --web-and-tex
```

Die Graph-Definition bleibt nach ihrer bestehenden Trackingregel quellgeführt; Architektur- und Glossarausgaben sind nach ihrer jeweiligen Trackingregel zu behandeln. `AGENTS.md` und andere zwischenzeitlich geänderte Dateien vor Übernahme gegen die Basispins vergleichen und deren konkrete Hunks übernehmen. Der Patch wird nicht automatisch angewandt.

## Unabhängige Prüfstellen

1. Tragen E1–E4 einschließlich eigener Atome, gedachter Wurzel, transitivem Bedarf und getrennter Deklarationsschicht dieselbe Bedeutung wie B7–B10? Sind keine Ganzheitssperren oder neue Bedarfe eingeführt?
2. Bleiben „geführt in“, „steht in“, die Stelle der Voraussetzungshilfe und Standardzuordnung getrennt? Wird ein bereits geführtes spätes Ziel nicht stillschweigend als abgeleitete Vorbereitung verschoben?
3. Bleiben der alte 1.2-Vertrag und alle alten harten Nachweise ehrlich abgegrenzt? Sind B3/B13 erst nach F8 umzusetzen und null echte Landesaktivierungen sowie ausstehende produktive Leser überall eindeutig?
