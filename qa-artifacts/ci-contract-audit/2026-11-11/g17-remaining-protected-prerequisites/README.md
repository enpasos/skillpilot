# Geschichte, Informatik und Politik/Wirtschaft: atomare Voraussetzungen

Stand: 11. November 2026, [Daten-PR #121](https://github.com/enpasos/skillpilot/pull/121),
Branch `fix/g17-remaining-protected-prerequisites-v8-data`, installierter Head
`f5d89e23767c0a59594915ff74a190b98b323362`.
**Die drei Installationen, ihre gezielten Minimalitätsaudits, die beiden
normalen nativen Methoden und der reguläre CQR-/Floor-Lauf einschließlich
öffentlicher V8-Verifikation sind bestanden. Die Standard-G17-Integration aus
PR #119, frische vollständige Remote-CI und Main-Lieferung bleiben offen.**

Die Lieferung folgt auf die getrennte Lateinlieferung und enthält drei Fachcommits:

| Fach | Commit | Geänderte `requires`-Arrays | Geordnete Operationen | Verbleibende Anforderungen |
|---|---|---:|---:|---:|
| Geschichte | `e1c52da61e27` | 19 | 291 | 577 |
| Informatik | `258528174ac1` | 37 | 818 | 654 |
| Politik und Wirtschaft | `f5d89e23767c` | 93 | 554 | 1.142 |

Der tatsächliche [Installationsbeleg](installation.json) enthält die vollständigen
Commit-IDs, bindet die drei Vorbereitungsmanifeste per SHA-256 und bestätigt je
Stufe exakte Vorher-/Nachherbytes, unveränderte übrige Zielfelder und Auditor-Exit 0.
Insgesamt ändern sich 149 Arrays; es entstehen keine neuen Assessmentbasis-Bindungen.

Die unveränderten historischen Vorbereitungsbelege sind
[Geschichte](history-preparation.json), [Informatik](informatics-preparation.json)
und [Politik/Wirtschaft](politics-economics-preparation.json). Ihre damaligen
`NOT_INSTALLED`-/`NOT_ADMITTED`- und Ausführungsflags beschreiben die Vorbereitung;
die spätere Installation steht separat im Installationsbeleg. Sie dokumentieren
frische Operationsguards nach jedem Schnitt, identische fachbezogene atomare
Hüllen mit 597, 15.212 und 3.801 Paaren sowie den erhaltenen vollständigen
Katalogabschluss mit 142.559 Hüllenpaaren und 6.524 identischen kompilierten
Seed-Anwendbarkeitswerten. Der flache bestehende V8-Vertrag, sein fester V7-Parent
und sämtliche vorangehenden Einträge bleiben erhalten. Texte, Aufgaben, Quellen,
Review-Fingerprints, `contains` und Mastery ändern sich nicht.

Die tatsächlich nach jeder Installation ausgeführten Audits für
[Geschichte](history-installed-audit.json), [Informatik](informatics-installed-audit.json)
und [Politik/Wirtschaft](politics-economics-installed-audit.json) melden jeweils
`validation`, `pass` und null Minimalitätsbefunde. Sie verwenden den vollständigen
Referenzkatalog und den jeweiligen expliziten Fachscope einschließlich wirksamer
Fremd- und Vorfahrenreferenzen. Diese Audits und die mechanischen Gleichheitsbelege
ersetzen keine öffentliche Proofaufnahme oder native/CQR-Abnahme. Die späteren
nativen Ergebnisse stehen separat unten; die offenen Ausführungsflags im
unveränderten Installationsbeleg beschreiben dessen damaligen Zeitpunkt. Bereits
vorhandene fremde reflexive Erreichbarkeit bleibt erhalten; eine globale
Azyklizitätszulassung wird nicht behauptet.

Die [gemeinsame native Abnahme](native/receipt.json) besteht am installierten
Datenstand mit **zwei Tests, null Fehlern und null Skips**. Die [frische JUnit-Datei](native/TEST-com.skillpilot.backend.completion.FirstMathPrerequisiteReductionTest.xml)
belegt `currentCatalogLearningScopesRetainEveryCanonicalAcquisitionTarget`
(425,625 Sekunden) und
`rawRegistryFramesRejectMissingOverlaysBadDigestsAndRequiresPresenceChanges`
(142,064 Sekunden); Gradle endet mit Exit 0 nach 638,119 Sekunden.

Die [Scope-Zusammenfassung](native/scope-categories.json) erhält sämtliche
**20 Fachzeilen exakt gegenüber Latein**: 761 geprüfte vollständige
Konfigurationen, 172 nicht angebotene Fälle, 467 unvollständige und zwölf
ungültige Konfigurationen. Die letzten drei Kategorien sind keine bestandenen
Lernkonfigurationen. Insgesamt sind 1.412 Kategorienzeilen aus 21 Katalogen,
20 Fächern und zehn vorhandenen GUI-Fächern erfasst; eine vollständige
Mehrfachfach-Potenzmenge wurde nicht geprüft.

Die [kompakte Eingabekontrolle](native/input-integrity-summary.json) belegt
**9.017 frisch gebundene und unveränderte Eingaben**, dieselben 8.224 Runtime-JSON-
und 781 Java-Dateinamen sowie null Zugänge oder Löschungen. Namensmengen und
string-sortierte Listen sind vor und nach dem Lauf identisch. Die drei
Fachkataloge und der aktive V8-Beleg stimmen mit den nativen Eingabebytes
überein. Die CI-Workflowdatei gehört nicht zu diesen Eingabepins; ein vollständig
erfasster Dateizugriffsraum wird nicht behauptet.

Der [reguläre CQR-Lauf](regular-milestones-receipt.json) einschließlich
öffentlicher V8-Verifikation endet am installierten Head mit Exit 0 nach
1.337,167 Sekunden; die anschließende Prüfung der zehn unveränderten Floors
endet ebenfalls mit Exit 0. Alle 35 benannten Eingaben bleiben unverändert.
Der [Berichtsvergleich](regular-milestones-comparison.json) gegen den zuvor
eingecheckten Statusbericht zeigt dieselben 21 Fachstände: fünf M7, fünf M6
und elf M0, mit unveränderten Regelsummen (235 pass, 18 warn, 4 fail,
65 not_configured). Geschichte, Informatik sowie Politik und Wirtschaft
bleiben M6. Der Statusbericht bindet jetzt den aktuellen Registerstand
`sha256:430d0f97…8ba518` und 1.465 statt 1.316 betroffene Ziele; weitere
Strukturunterschiede außer dem Erzeugungszeitpunkt gibt es nicht. Ein
zusätzlicher Standalone-Public-Loader wurde nicht gestartet.

Die Archivierung enthält kompakte Receipts, Scopeledger und frische XML,
keine Rohlogs oder großen Pinlisten. Dafür wurde kein Test erneut gestartet.

Das harte Standard-G17-Gate aus PR #119 ist in diesem Datenstand noch nicht
aktiviert. Der reguläre Bestandslauf belegt daher die erhaltenen bestehenden
Meilensteine, keine abgeschlossene Standard-G17-Integration. Diese Integration,
frische vollständige Remote-CI und Main-Lieferung bleiben offen.
