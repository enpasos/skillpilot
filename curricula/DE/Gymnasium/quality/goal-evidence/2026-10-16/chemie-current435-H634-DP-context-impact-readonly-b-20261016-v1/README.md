# Current435: technische D/P-Kontextfolgen von H634

Rein lesende Diagnose. Keine Scienceabstimmung, keine neue FIRST-Datei, keine H/R-Änderung und keine Umbindung bestehender D/P-Nachweise.

## Ergebnis

- 435 ganze Ordinary-Ziele und ihre Goal-Fingerprints sind unverändert.
- **P435 PASS**: Tatsächliche ausgewählte Review-Records, Kriterienhashes und Ressourcenhashes passen vor und nach der Integration exakt.
- Alle 435 historischen D-Seitenfingerprints und GoalReviewContext-Bindungen sind intern gültig; alle zugehörigen Goal-Fingerprints passen zu H634.
- In den 82 tatsächlich ausgewählten D-Gruppen erzeugt H634 **291 geänderte `externalReverseRequires`** und **2 geänderte Orphan-Kapitelpfade/Ordnungen**. Die exakten 293 IDs und Feldwerte stehen in den Delta- und D435-Dateien.
- 142 Ziele haben in diesem festen aktuellen Subsetvergleich keinen zusätzlichen H634-Kontextdelta. Das behauptet keine Bytegleichheit ihrer historischen Reviewseiten mit neu erzeugten Seiten.
- Das vollständige technische Buch hat 302 geänderte und 133 unveränderte Seiten; neun zusätzliche Vollbucheffekte entfallen bei der Subsetnormalisierung.
- Die echten Compilerfunktionen finden alle 82 Chemie-Mappingdateien in H. Die 31 tatsächlichen Lernenden-Views kompilieren ohne Fehler und ändern für die435 Ordinary-Ziele weder Mitgliedschaft noch sichtbare Abstammung.

Die historische D-Basis ist heterogen: 433 ihrer Seiten unterscheiden sich bereits vom zuletzt gepaarten629-Vollbuchkontext. Diese älteren Layout-, P-Anmerkungs- und Kontextdifferenzen sind pro Ziel getrennt aufgeführt. Es gibt keine pauschale Neuetikettierung dieser Seiten. Die gespeicherten aktuellen Subsetseiten sind technische Kontextkandidaten für eine gezielte Prüfung.

## Technischer Whole-View-CAS

Der unveränderte frühere Full435-Bookmodel-Aufruf schlägt auf H634 mit CPV-005/006 fehl. Zwei direkte `goalEntry`-Einträge sind durch die neue kanonische Einordnung redundant:

- `4a7dee38-1056-5e27-acec-e6a12f58109f` – Qualitätskontrolle von Arzneimitteln
- `5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d` – Gaschromatografie

Der eigene Whole-View-Nachfolger entfernt diese Einträge und ihren dadurch leeren gemeinsamen `structure`-Wrapper; ohne die Wrapperentfernung folgt CPV-007. Der Rohfehler und die ganzen Vorher-/Nachher-Views sind gespeichert. Der bestehende historische Viewpfad bleibt unverändert.

**Betroffene technische Konfiguration:**
`curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-five-supported-description-normal-H-and-native5-technical-20261016-v1/base-full435-P5-current-normal-H.stock.config.json`

**Deren technische View:**
`curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-seventeen-pending-description-native-technical-20261016-v1/VIEW.full435-existing-whole-QS-plus-two-explicit-targets.technical.json`

Der eigene Nachfolger `CONFIG.full435-H634-context-diagnostic.no-render-no-write.json` verweist ausschließlich auf die eigene korrigierte technische View. Keine der31 Lernenden-Views ist Ziel dieses CAS.

## Tatsächlich verwendete Funktionen

- `app/scripts/goalBookModel.ts:1802` – vollständige Modellerzeugung; Seitenfelder und Fingerprints ab2030.
- `app/scripts/materializeGoalDescriptionRolloutBatch.ts:365` – tatsächliche Subseterzeugung mit auf beiden Seiten derselben voraussetzungssicheren Reihenfolge.
- `app/scripts/validateGoalDescriptionDualRoundResolution.ts:208` und227 – Original-Kontext- und Seitenfingerprints.
- `app/scripts/positiveGoalEvidenceProfileModel.ts:104` – tatsächliche P-ReviewInput-Fingerprints.
- `app/src/utils/authoring/compositionViewAuthoring.ts:285` – 31 View-Kompilationen; CPV-007 ab379, CPV-005/006 ab609.
- `app/scripts/applicabilityCompiler.ts:246` – tatsächliche H-Mappingdateiermittlung.

Der629-Basisdigest des vorherigen gepaarten Berichts wurde exakt reproduziert. H bleibt auf `d17b3219212d5157a3731cc54b8424cc07816835781984bcbeb3a98f4064268f`, R auf `9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960`. Alle exakten Pins stehen in `RESULT.readonly-current435-DP-context-impact.json` und `SHA256SUMS`.
