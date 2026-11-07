# Nächste große V-Charge: bestehende Originalreviews gezielt qualifizieren

**Empfehlung: Mathematik58 als eine zusammenhängende nächste Charge mit ergänzendem aktuellem Darstellungsreview vorbereiten.** 24 aktuelle positive Fälle aus `part-1.review.json`, 24 aus `part-2.review.json` und zehn spätere unabhängige Korrektur-KEEPs sind in drei Originalreviewdateien und zwei ausdrücklich gehashten Inputdateien belegt. Alle 58 sind `curricularAtomic`, liegen außerhalb der aktiven 74 und haben passende heutige Zieltexte und Bildbytes. Für alle58 fehlen in diesen Originalen belegte Phone-/Desktop-Inspektionen; diese werden tatsächlich neu ergänzt. Dafür ist keine neue Bilderzeugung nötig. Die vollständigen IDs und Referenzen stehen in `first-batch-math58.json`.

Der aktive Root-CQR vom 7. November 2026, 05:46:48.445Z, und der vorhandene vollständige Deep-Nachweis stimmen überein: **V 74/2483**, davon Mathematik 5 und Wirtschaftswissenschaften 69; D/P/A/M sind in jedem der fünf Fächer vollständig. Der strikte Abschluss bleibt offen. Der aktuelle Reader akzeptiert sechs geschlossene Math-/Econ-Profile und der Authority-Index exakt 74 IDs. Die bestehenden 74 werden hier weder neu geprüft noch als Fortschritt gezählt. Es wurde kein nativer Producer ausgeführt.

## Endliche Matrix

Familien sind hier die unterschiedlichen `family`-Bezeichnungen der bereits erhaltenen Originalketten, keine bereits implementierten Readerprofile. Die Kandidatenzahlen sind disjunkt pro Ziel; einzelne Ziele können mehrere Originalketten besitzen. Der vorhandene Zensus enthält zusätzlich 79 nicht-curricularAtomic-Einträge, die erhalten bleiben, aber in dieser Fortschrittsrechnung nicht mitzählen.

| Fach | CurricularAtomic / bereits V | Originalfamilien im Zensus | Weitere passende Originalkontexte | Davon mit ursprünglichem Akteur und Zeit | Metadatenlücke |
|---|---:|---:|---:|---:|---:|
| Mathematik | 807 / 5 | 32 | 132 | 132 | 0 |
| Physik | 478 / 0 | 4 | 4 | 4 | 0 |
| Chemie | 455 / 0 | 64 | 148 | 140 | 8 |
| Biologie | 397 / 0 | 54 | 355 | 332 | 23 |
| Wirtschaftswissenschaften | 346 / 69 | 30 | 245 | 244 | 1 |
| Gesamt | **2483 / 74** | **184** | **884** | **852** | **32** |

`subject-matrix.json` enthält die vollständigen ID-Listen jeder Spalte und zusätzlich die Ziele ohne geschlossene passende Originalkette. `family-matrix.json` ordnet die IDs ihren konkreten Familien und Originalreviewdateien zu. Die 852 sind **Text-/Bild-/Attributionskandidaten**, noch keine 852 vollständig qualifizierten V-Ziele. Für eine neue native Freigabe fehlen die geprüfte Interpretation des Originalformats, immutable Receipts und deren Aufnahme in einen unabhängig geprüften, endlichen Authority-Nachfolger. Ein aktueller QA-Eintrag mit `aiApproved=yes` ersetzt diese Kette nicht.

Weitere **1525** aktuelle Ziele außerhalb der 74 haben im begrenzten Zensus keine passende geschlossene Originalkette. Sie brauchen entweder einen echten aktuellen Bildreview oder eine konkret nachgewiesene bisher fehlende Originalkette. Für die 32 Metadatenlücken benennt `metadata-gaps.json` jedes Ziel und die konkrete fehlende Angabe: bei Biologie 23 ursprüngliche Akteure; bei Chemie sechs Akteure und zwei Reviewzeiten; bei Wirtschaft eine Reviewzeit. Diese Angaben dürfen nicht aus aktuellen Ledgern oder Git-Zeitstempeln ergänzt werden.

## Warum Mathematik58 zuerst

Die erneute unabhängige Leseprüfung hat für alle 58 die tatsächlich gelieferten Originaltextfelder mit der aktuellen Quelle verglichen, beide aktuellen Bildkopien geprüft (116 Hashes) und 64 referenzierte Gitblobs gelesen und gehasht. Alle 58 ursprünglichen positiven Sichtentscheidungen enthalten Akteur, Zeit und zielbezogene Begründung. Für die zehn `previousGoal`-Snapshots wurde zusätzlich das ursprüngliche `demandLevel` mit heute verglichen. Alle 58 liegen außerhalb `qualified-context-index-economics17-2026-11-07.json`.

- **24 Part1 + 24 Part2:** `math-m7-v-only-current-62-20260920-v1/part-{1,2}.review.json`. Originalreview bindet `inputPath`/`inputSha256`; Inputrecord bindet Ziel-ID, vollständigen DE-Titel/-Text, vorhandenen EN-Beschreibungstext und Assetpfad/-hash. Positive Zeilen haben `inspected=true`, `decision=accept_current_asset`, keine Findings und konkrete Checks. Von 49 damaligen positiven Zeilen passen heute 48. Die nicht passende Zeile bleibt ausgeschlossen; die damaligen 13 Korrekturentscheidungen werden nicht positiv umgedeutet.
- **10 spätere Korrektur-KEEPs:** `math-m7-v-only-corrections-13-20260920-v1/root-independent-ten.receipt.json`. Das echte unabhängige Sichturteil enthält `actualViewed=true`, `accepted_pilot`, Bildhash und den vollständigen damaligen `previousGoal`. Die drei dort ausdrücklich gehaltenen IDs bleiben ausgeschlossen. Die zehn aktuellen Bildbytes entsprechen diesen späteren positiven Originalentscheidungen.

Die drei vollständigen Originalreviewdateien wurden auf konkrete Inspektionsfelder und Darstellungsangaben gelesen. Zahlenfolgen in Hashes und Winkelangaben wie360° sind keine Viewportbelege. Die Grenze lautet:

| Unterfamilie | Passende native Originalurteile | Originale 360-Pixel-Belege | Originale 680-Pixel-Belege | Ursprünglicher Niveaukontext |
|---|---:|---:|---:|---|
| Part1 | 24 | 0 | 0 | Kein `demandLevel` im gehashten Reviewinput |
| Part2 | 24 | 0 | 0 | Kein `demandLevel` im gehashten Reviewinput |
| Korrektur-KEEPs | 10 | 0 | 0 | Alle10 `previousGoal.dimensionTags.demandLevel` heute gleich |

Part1/Part2 enthalten DE-Titel, vollständige DE-Beschreibung und EN-Beschreibung; ein ursprünglicher EN-Titel wird ebenfalls nicht ergänzt. Das ursprüngliche Lesen eines vollständigen curricularen Scope wird für diese48 nicht behauptet. Auch die vorhandenen ganzen Zielobjekte der10 sind keine neue Source-/Scope-/Assessmentfreigabe.

Die gültigen nativen Originalurteile bleiben erhalten. Für die aktuelle vollständige Darstellungsprüfung werden alle58 im heutigen Zielkontext tatsächlich bei360 und680 Pixeln beziehungsweise der tatsächlichen gekappten Kartengröße geprüft: drei unabhängige Pakete20/20/18, insgesamt116 neue Ansichten. Jeder neue Zusatz hält seine tatsächliche Zeit, Revieweridentität, aktuelle Kontextfelder, beide Bildhashes und konkrete Lesbarkeits-/Darstellungsbeobachtungen fest. Für feine fachliche Details kann das unveränderte Original erneut geöffnet werden. Ein Adapter kann diese fehlende Evidenz nicht herstellen. Kein neues Bild wird allein wegen Format oder Provider verlangt.

**Noch zu tun:** die tatsächlichen aktuellen Darstellungsreviews, zwei eng begrenzte Readerzweige für die Originalformen samt ausdrücklich gebundenem neuen Zusatz, gebundene Receipts und eine einmalige Integration der ganzen58. Ein unabhängiger Reviewer prüft die58 Zuordnungen und Originalentscheidungen; ein unabhängiger Code-Review prüft insbesondere vertauschte Ziele, veränderten Inputhash, falsches Bild, negative Originalzeile, fehlende Attribution, Text-/Niveaudrift, fehlende neue Viewportbelege und die erhaltenen74. Der hier ausgeführte direkte Lesevergleich kann als konkreter Vorbeleg wiederverwendet werden; er ersetzt weder den neuen Darstellungsreview noch den Review der implementierten Reader.

Nach erfolgreichem Abschluss sämtlicher Gates wäre **V132/2483** der erwartete neue Stand. Das ist eine Zielgröße, kein erreichtes Ergebnis.

## Konkreter Speicherengpass

Die vorhandenen 74 benötigen bereits **167.619.137 Bytes** an Original-Working-Copies. Die 58 fügen **113.134.176 Bytes** hinzu; die Vereinigung hat mindestens **280.753.313 Bytes** und überschreitet die bestehende 192-MiB-Grenze. Receipts und Index kommen hinzu. Der aktuelle Authority-/Capsule-Vertrag ist ausdrücklich auf 74 festgelegt.

Die nächste endliche132er-Variante deshalb in `/dev/shm` oder auf `/mnt/e` vorbereiten, ihre tatsächlichen vollständigen Working-/Gitobjekt-/Embedded-/Capsule-Größen einschließlich der neuen Darstellungsbelege messen und dafür feste Grenzen mit Budgettests prüfen. Die vorhandene74er-Capsule, deren Grenzen und historische Pins bleiben unverändert. Keine globale Limitaufweitung und keine rootseitige Kopie großer Bildbäume; bei der Analyse waren auf Root etwa112MB, im RAM4GB und auf E170GB frei. Dies ist ein konkreter Größenbefund für die nächste Charge, kein Auftrag zu einer neuen allgemeinen Prüfarchitektur.

## Nächste Chargen danach

1. **Biologie77:** Human20 + Flora19 + NI18 + Ecology20. Alle 77 liegen außerhalb74 und haben passende vorhandene Kontexte mit ursprünglicher Attribution/Zeit. Die Originale enthalten tatsächliche Full-/360-/680- und teilweise native Seiteninspektionen. Vier eng begrenzte Originalformen einschließlich ihrer Eingabe-/Erstsiegel prüfen; Flora enthält ausdrücklich neun fortgeführte ursprüngliche Inspektionen und elf neu betrachtete Bilder. Das darf nicht als 20 frische Bildaufrufe umgeschrieben werden.
2. **Wirtschaft68:** Business/Macro20 + Law18 + Company16 + Q4-Independent14. Alle68 liegen außerhalb74, haben Originalattribution/-zeit und konkrete Original-Native-/360-/680-Belege. Vier tatsächliche Originalformen qualifizieren; die bereits aktiven Q3-/Monetary-Social-Familien bringen keinen erneuten Zuwachs.
3. **Chemie:** 140 Kandidaten aus vielen kleinen Originalformen. Zunächst die zwei B008-Familien mit 14 und10 passenden Fällen sowie Q1-seven und current442-V10 mit jeweils7 bündeln und Überschneidungen/Kindscope prüfen. Eine beliebige neue50er-Gesamtfreigabe wird aus den Familienzahlen nicht abgeleitet. Die acht Metadatenlücken bleiben separat.
4. **Physik:** Nur vier derzeit passende Originalketten. Für einen großen Fortschritt ist ein neuer aktueller Bildreview effizienter als weitere ungezielte historische Suche. Eine erste feste60er-Charge aus einem zusammenhängenden aktuellen Themenbereich wählen, vorhandene Bilder behalten und auf drei unabhängige20er-Arbeitspakete aufteilen. Je Ziel tatsächliches Original, 360-Pixel-Sicht und 680-Pixel-/gegebenenfalls gekappte Kartensicht, aktueller DE-/EN-Kontext und spezifischer Befund; damit etwa180 echte Ansichten für60 Bilder. Nur tatsächliche Fehler lösen spätere Bildkorrekturen aus.

Die Familien-/ID-Listen der ersten drei Folgeschritte liegen bereits in `family-matrix.json`. Der neue Physik60-Review benötigt einen fest eingefrorenen aktuellen Input und eine zum tatsächlich erzeugten Reviewformat passende, streng gebundene Readeranbindung. Der bestehende vollständige `diagram-current-b-v1`-Ablauf ist dafür ein konkretes Vorbild; sein heutiger Math-Ownerpin darf nicht für Physik ausgegeben werden.

## Vorhandene Validatoren und Schreibwege

Für die einmalige Qualifikation einer fertigen Charge sind die vorhandenen Funktionen `createVisualizationContextVerifier` und `createQualifiedVisualizationContextAuthority` maßgeblich. Sie prüfen die echten Originalbytes und aktuelle Bildkopien. Die einschlägigen vorhandenen Prüfaufrufe sind:

```bash
app/node_modules/.bin/tsx app/scripts/testGoalVisualizationReviewedContext.ts
app/node_modules/.bin/tsx app/scripts/testGoalVisualizationContextNamespaces.ts
app/node_modules/.bin/tsx app/scripts/testVisualizationContextMaturity.ts
python3 -B scripts/test_visualization_qualified_context_capsule_limits.py
npm --prefix app run check:goal-visualization-qa
npm --prefix app run check:goal-visualization-qa-coverage-parity
npm --prefix app run quality:deep-understanding-rollout -- --format=json
```

Diese Aufrufe wurden in dieser Leseanalyse nicht ausgeführt. Die ersten beiden benötigen für neue Reader passende endliche neue Fälle; ein historisch grüner Test beweist keinen neuen Zweig. Den gesamten Deep-/CQR-/Floor-Lauf einmal nach dem geschlossenen Batch ausführen, nicht pro Bild. Die bestehenden Gesamtgates bleiben bis zum vollständigen Abschluss erwartbar rot.

Für eine tatsächlich fertig geprüfte, explizit gepinnte Nachfolger-Capsule existiert der Writer `python3 -B scripts/visualization_qualified_context_capsule.py build` mit `--repository-root`, `--accepted-commit`, `--accepted-census-sha256`, `--census-path`, `--output` und den drei festen Bytebudgets. Ein neuer Index muss vorher im festen Transportvertrag unabhängig akzeptiert sein. Der vorhandene `collectVisualizationContextEconomics17Originals.ts` sammelt ausschließlich die bereits akzeptierten74; er ist kein132er-Collector. Für die58 fehlt noch der kleine konkrete Nachfolgercollector, kein allgemeines Discovery-System.

**Für die Originalreview-Qualifikation ist keine neue AI-Ledgerentscheidung nötig:** Die Bildbytes und vorhandenen positiven QA-Zeilen bleiben bestehen. Receipts und die endliche Authority werden ergänzt. Für echte neue Bildreviews existieren die bisherigen expliziten Batch-Applier als Vorbild, etwa `applyCurrentWaveVisualizationAiReview.ts --write`, aber dessen Auswahl, Uhrzeit und Reviewer sind historisch fest codiert und passen nicht zur neuen Charge. Ein generischer aktueller Review-Importer ist hier nicht vorhanden; der neue endliche Applier muss die tatsächlich versiegelten neuen Entscheidungen verwenden und ausschließlich deren benannte AI-Felder schreiben. `quality:goal-visualization-qa` erzeugt/synchronisiert Ledger und erteilt keine fachliche Freigabe. Die Workbench-Route `PUT /__goal-visualization-qa/save` bearbeitet ausschließlich Human-Felder und ist für diese maschinelle Arbeit ungeeignet.

Keine aktiven Daten, QA-Zeilen, Originalreviews oder Git-Zustände wurden verändert. Die vorbestehend modifizierte Zensusdatei `index-five-ledger-original-evidence.py` wurde nicht geändert oder gestaged; ihr gelesener Hash steht in `analysis-receipt.json`. Keine SourceA-Nativeprobe, keine neue Bildgenerierung, keine HumanApproved-Behauptung und kein neuer V-/M7-Pass.
