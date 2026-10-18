# Begrenzte technische Bewertung: Runtime-Mapping-Konflikte

**Ergebnis:** Die vorgeschlagene Trennung ist für den bestehenden Repository-Backendvertrag zulässig: die **52 bestehenden `exact`-Runtime-Einträge unverändert erhalten**, ausschließlich die **61 zusätzlichen konfliktverursachenden `partial`-Runtime-Einträge aus 18 Dateien entfernen**, sämtliche aktuellen Quellenreview-Ledger und ihre Extraktions-/Scopebindungen unverändert erhalten. Keine Umdeutung von `exact` zu `partial`, keine Runtimecodeänderung und keine neue Scienceentscheidung sind dafür erforderlich.

## Tatsächlich geprüft

- Alle 52 Konfliktgruppen haben genau einen `exact`-Eintrag. Dessen Objekt und rohe JSON-Eintragbytes sind mit HEAD identisch.
- Alle 61 zu entfernenden Runtime-Einträge sind gegenüber HEAD neu.
- Für jede der 61 Kanten existiert mindestens ein aktuelles `.review.json` mit derselben vollständigen Mappingzeile, einer passenden `mapped`-Decision einschließlich Ziel-ID und Rationale sowie einer existierenden Source-Extraction mit genau diesem SourceGoal. Die Quellenfelder bleiben im getrennten Ledger erhalten.
- 22 betroffene Quellenreview-Carrier und die verwendeten Extraktionen sind mit kompletten Dateihashes gepinnt. Diese Pins ermöglichen die Nachkontrolle, dass beim CI-Fix keine wissenschaftlichen Beiträge, Grenzen, Rationales oder SourceScopes mitgeändert werden.
- Für 45 Kanten sind zusätzliche direkte, edge-spezifische Accepted-Referenzhashes und Pointer geprüft. Die restlichen Kanten verwenden andere bzw. ganze Decision-/Metadatenformen. Der technische Auftrag bescheinigt ihnen keine neue wissenschaftliche Freigabe; ihre aktuellen vollständigen Reviewcarrier sind für alle 61 Kanten belegt.
- Der strukturelle Trockenlauf entfernt ausschließlich diese gebundenen 61 Runtimezeilen. Danach verbleibt im Gymnasium-Runtimescan keine Gruppe mit `exact` plus einer weiteren unterschiedlichen Kante.

`bound-conflict52.input.json` erfasst Roots Konfliktinventar bytegenau und macht das Paket ohne einen lokalen `tmp/`-Pfad lesbar. `edge-by-edge-pinned-review-carriers.actual.json` bindet jede einzelne Kante an konkrete Ledger-Pointer und Scope-/Dateihashes. `proposal-check.actual.json` enthält die vorgeschlagenen Restmengen und deterministischen Objekt-Digests je Runtime-Datei. Es wurden keine Normaldateien geschrieben und keine Java-Tests oder vollständigen Builds ausgeführt.

## Bestehender Vertrag und Code

| Beleg | Bedeutung für diesen begrenzten Fix |
| --- | --- |
| `backend/.../landscape/GoalMappingService.java:203–212` | Der Repository-Lader lehnt einen Source-Identifier mit `exact` plus einer weiteren unterschiedlichen Runtime-Kante ausdrücklich ab. |
| Dieselbe Datei, `isSourceExtractionReviewFile` und `isGoalMapFile` | Dateien mit `reviewId`, `sourceExtractionPath` oder `decisions` sowie `.review.json`-Dateien gehören ausdrücklich nicht zu diesem Runtime-Mappingcarrier. |
| `backend/.../landscape/GoalMappingServiceTest.java:246`, Test `ignoresSourceExtractionReviewFilesWithOneSourceToManyDecisions` | Bestehender Test dokumentiert die gewollte Trennung von Quellenreview und Runtime-Kompatibilität. Test wurde hier gelesen, nicht erneut ausgeführt. |
| `backend/.../service/LearnerService.java:1981` und `:2015` | Masteryprojektion verarbeitet ausschließlich `exact`. Die vorhandenen Aliasbindungen müssen deshalb erhalten bleiben; neue Teilbeiträge dürfen keine zusätzliche Aliasbedeutung erhalten. |
| `app/scripts/goalBookOriginalSources.ts:145–186` | Quellenatlas/Originalquellen lesen Source-Extraction-Reviewdateien. Die `decisions` besitzen die geprüften Zielkanten; sie werden nicht aus der Runtime-Kompatibilitätsdatei abgeleitet. |
| `app/scripts/generateCurriculumQualityStatus.ts:4506`, `:4687` und `:4770` | Qualitätsprüfung liest Reviewcarrier samt `sourceExtractionPath`; Kursniveaubindungen und partielle Mappingformen bleiben dort prüfbar. |
| `app/scripts/applicabilityCompiler.ts:549`, `:1115` | Der Compiler liest auch Review-Mappingzeilen. Die dort erhaltenen Beiträge werden durch das Entfernen ihrer zusätzlichen Runtime-Kopie nicht aus den Quellenbelegen entfernt. |
| `docs/concept/skill-graph/dual-curriculum-package-releases.md:420` | Mapping-Truth stammt aus autoritativen Reviewentscheidungen; konkurrierende Carrier sollen diese nicht überschreiben. Der dort beschriebene Paketmodus ist ein eigener Vertrag und wird durch diesen Repository-Kompatibilitätsfix nicht verändert. |
| `docs/qa-ci/curriculum-quality-maturity-and-routes.md`, `CQR-003`/`CQR-004` | Fachliche Quellenabdeckung und Kursniveau werden gesondert geprüft. Eine partielle Zuordnungsform wird durch diesen Fix weder zu `exact` noch zur vollständigen Quellenfreigabe. |

## Geltungsgrenzen und erforderliche Nachkontrolle

Die neuen Runtime-Teilrelationen waren wegen des Konflikts kein erfolgreich ladbarer Zustand. Ihre Entfernung stellt den bisherigen eindeutigen Aliaszustand her, während die separaten Quellenbeiträge bestehen bleiben. Runtime-Teilrelationen werden allerdings auch von Legacy-Navigation und State-Fallbacks gelesen (`LearnerService.java:2171`, `:6341`, `:10815`; `LandscapeService.java:390`). Deshalb wird **keine universelle Verhaltensgleichheit sämtlicher Fallbackpfade** behauptet. Bestehende aktuelle kanonische Applicability-/Composition-Semantik darf durch den Fix nicht verändert werden.

Root soll die bereits laufenden betroffenen Backendtests am tatsächlichen installierten Fix wiederholen und die Erhaltung aller gepinnten Quellenreview-Dateibytes sowie aller 52 `exact`-Einträge prüfen. Weitergehende Quellen- oder Legacy-Navigationswünsche würden einen eigenständigen Vertrag erfordern. Dieser Befund beansprucht keine neue Quellen-/Sciencefreigabe, keinen D-Abschluss, keinen WholeSubject-/M7-Abschluss und keine menschliche Freigabe.
