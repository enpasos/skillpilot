## Curriculum Quality: Reifegrade, QA-Scopes und CQR-Regeln {#sec:qa-maturity-scopes-cqr}

:::note{title="Workbench-Lesart und Konzeptkorrektur vom 4. November 2026"}
Fachliche Spezifikation der Anzeige unter `/quality-dashboard` und der generierten Snapshots in `docs/qa-ci/status/curriculum-quality-status.json` (Generator: `cd app && npm run quality:curriculum-status` via `app/scripts/generateCurriculumQualityStatus.ts`; Kurzüberblick: [Dashboard Status Layer](repo:docs/qa-ci/curriculum-quality-dashboard.md)). **Konzeptkorrektur vom 4. November 2026:** Bisherige `M7`-Freigaben oder bestandene Routenprüfungen belegen nicht automatisch, dass Prüfungsaufgaben die selbständige Anwendung sämtlicher implizit anerkannten Kompetenzen gemäß [Assessment-Gated Completion](repo:docs/concept/skill-graph/assessment-gated-completion.md) absichern; diese Autorenpflicht erfordert ein separates Aufgaben-/Rubrikreview.
:::

### Grundbegriffe, Bundesland-Abdeckung und Routenmodell {#sec:qa-cqr-foundations}

Ein **Curriculum** im Dashboard ist eine kanonische `SkillLandscape`-Datei unter `curricula/DE/Gymnasium/canonical/`. Für die **bidirektionale Bundesland-Abdeckung** trennt das Dashboard strikt drei Atomzahlen (`contains` leer, inklusive atomarer Übungs-, Memory- und Assessment-Knoten):

1. **`Roh-Atomar`:** alle atomaren Leaf-Knoten der kanonischen JSON-Datei (Diagnosewert, nicht der Bundesland-Nenner).
2. **`DE-Sicht atomar`:** Vereinigung aller atomaren Knoten aus den nationalen `de-de-*`-Kompositionsansichten.
3. **`Bundesland-Sicht atomar`:** Vereinigung aller atomaren Knoten aus den `de-<land>-*`-Kompositionsansichten eines Bundeslands.

Für jedes deklarierte Bundesland prüft `CQR-003` **beide Richtungen** gegen die im Repository erfassten Source-Snapshots (Vollständigkeit der PDF-Extraktion selbst sichert der Snapshot-/Extract-Ledger):

- **Sicht -> Quelle:** Jedes sichtbare Atom besitzt einen direkten (`provenance`, reviewtes `mapping`) oder explizit reviewten indirekten `requires-closure`-Ersatzbeleg für genau dieses Land (`override`, `child-union` und unreviewte `requires-closure` zählen nicht).
- **Quelle -> Sicht:** Jedes registrierte Originalziel des Bundeslands mappt über seine atomare Source-Closure vollständig auf sichtbare kanonische Atome, und alle aus vorhandenen Source-Snapshots gelesenen Atome sind im Membership-/Closure-Ledger registriert.

Ein **QA-Scope** prüft einen expliziten learner-facing Teilbereich (nicht die Zahl didaktischer Einzelpfade; fehlende QA-Scopes begrenzen den Aggregator auf maximal `M2`):

:::table{cols="3.6cm,2.5cm,1.5cm,X"}
| Scope-ID | Stufe | Atome | Motivationsanker & terminale Autonomie |
| --- | --- | --- | --- |
| `canonical-math-sek1` | Sek I | 247 | `Warum Mathematik? - Entdecken, Muster & Alltag` -> 38 Aufgaben unter `Prüfungen Jahrgangsstufe 5..10` |
| `canonical-math-sek2` | Sek II | 397 | `Warum Mathematik? - Denken, Muster & Zukunft` -> atomare Aufgaben unter `Übungen E-Phase`, `Q1..Q4` & `Prozesskompetenzen` |
| `canonical-physics-sek1` | Sek I | 44 | `Warum Physik?` -> atomare Aufgaben unter `Übungen Sekundarstufe I Physik` |
| `canonical-physics-sek2` | Sek II | 278 | `Warum Physik?` -> atomare Aufgaben unter `Übungen E-Phase` und `Übungen Q1..Q4` |
:::

**Routenrichtung und aktuelle PO-Zielnorm:** Gespeicherte Kanten `A.requires = [B]` zeigen vom späteren Ziel zur Voraussetzung (`Motivation <- Voraussetzungen <- atomare Lernziele <- terminale Übung / Klausur`). Während die Übergangsprüfung $R_{\mathrm{effective}}$ geerbte Cluster-`requires` einbezieht, prüft die kanonische Route ausschließlich direkte atomare Kanten $R \cap (A \times A)$. Die atomare Normalform $R \subseteq A \times A$ vom 8. November 2026 bleibt verbindlich. Nach der Ownerentscheidung vom **12. November 2026** ist vor jedem Fach- und Scope-Meilensteinpass die vollständige deterministische Prüfung des aktuellen Zielzustands erforderlich; eine bestimmte Migrationsreihenfolge oder Gleichheit mit einer historischen Voraussetzungshülle ist keine Abnahmebedingung mehr (siehe [Graph-Definition §3.1](repo:docs/concept/skill-graph/graph-definition.md)). Seit dem **11. November 2026** prüft `CQR-001` atomare Normalform und transitive Minimalität für jede Wurzel des kanonischen Gymnasialkatalogs. `CQR-102` und `GVR-012` verlangen zusätzlich direkt atomare Routen.

Der Meilensteinproducer ermittelt das [aktuelle Kataloginventar](repo:app/scripts/currentCurriculumCatalog.ts) aus Curriculum-Manifest, Fachdeklarationen der kanonischen Übersicht und vollständigem kanonischem Verzeichnis. Historische Reduktionsnachweise verwendet er nur für davon abhängige Reviewbindungen. Fehlt ein gültiger Nachweis, bleiben die strikten Prüfungen gegen aktuelle Revieweingaben maßgeblich; alte Evidenz erhält dadurch keine Freigabe. Eigenständige strikte Nachweiswerkzeuge und native historische Regressionstests bleiben erhalten. Wurzeln außerhalb des kanonischen Gymnasialkatalogs sind damit nicht als vollständig geprüft ausgewiesen.

### Scope-Reife (`M0`–`M4`) und Curriculum-Reife (`M0`–`M7`) {#sec:qa-cqr-ladders}

Jede `CQR-*`-Regel liefert `pass`, `warn`, `fail` oder `not_configured`. Seit dem 11. November 2026 setzt die Aufstiegskette die globale atomare Normalform und `G17`-Minimalität über `CQR-001` für jede Wurzel des kanonischen Gymnasialkatalogs durch (ein Verstoß setzt das Curriculum und alle seine Scopes auf `M0`; hart scheitert die CI über die geschützten Floors, Wurzeln außerhalb des kanonischen Gymnasialkatalogs prüft `CQR-001` nicht). Die [Regel-Meilenstein-Matrix](repo:docs/qa-ci/graph-definition-rule-milestone-matrix.md) dokumentiert zusätzlich den Unterschied zwischen Katalogziel und heutiger Aggregatorschwelle (z. B. `CQR-104` ab Curriculum-`M4`, `CQR-203` ab Curriculum-`M5`).

:::table{cols="2.0cm,X"}
| Scope-Stufe | Exakte Bedingung je einzelnem QA-Scope (Skala `M0`–`M4`) |
| --- | --- |
| **`M0`** | `CQR-101` nicht `pass` (effektive Route von Motivation zu terminaler Autonomie noch offen). |
| **`M1`** | `CQR-101` `pass`, aber `CQR-102` oder `CQR-103` offen (direkte atomare Route oder Cluster-`requires` offen). |
| **`M2`** | `CQR-101..103` `pass`, aber `CQR-104` oder `CQR-201`/`CQR-202` offen (Sichtbarkeit / terminale `examData`). |
| **`M3`** | Routen- und Basis-Assessment-Regeln `pass`, aber `CQR-203` noch offen. |
| **`M4`** | Sämtliche Routen- und Assessment-Regeln einschließlich `CQR-203` stehen auf `pass`. |
:::

:::table{cols="2.0cm,X"}
| Curriculum | Kumulative Bedingung auf Fachebene (Skala `M0`–`M7`) |
| --- | --- |
| **`M0`** | `CQR-001` oder `CQR-002` verletzt oder Source-Ingestion inkl. amtlicher HTTP(S)-Links (`CQR-000`) unsauber. |
| **`M1`** | `CQR-000..002` sauber, aber Bundesland-View-Abdeckung (`CQR-003`) oder `GK`/`LK`-Konsistenz (`CQR-004`) offen. |
| **`M2`** | `CQR-000..004` sauber; QA-Scopes fehlen noch oder mindestens ein Scope verfehlt `CQR-101`. |
| **`M3`** | Alle QA-Scopes bestehen `CQR-101`, `CQR-102` und `CQR-103`, sind aber noch nicht durchgängig exam-mode-fähig. |
| **`M4`** | Alle QA-Scopes >= Scope-`M3`, aber noch nicht alle Scope-`M4` oder `CQR-301`/`401`/`501` offen. |
| **`M5`** | **Schulgeeigneter Kern-QS-Stand:** alle QA-Scopes auf Scope-`M4` plus `CQR-301`, `CQR-401` und `CQR-501` `pass`. |
| **`M6`** | `M5` erreicht plus `CQR-302` `pass` (geprüfte Memory-Entscheidungen, Karten-Ledger und View-Sichtbarkeit). |
| **`M7`** | `M6` erreicht plus `CQR-303` `pass` (strenger 5-Gate-Abschluss `D/P/A/M/V` aller aktuellen `curricularAtomic`-Ziele). |
:::

### Katalog der `CQR-*`-Regeln und aktive `CQR-302`-Fachbilanzen {#sec:qa-cqr-catalog}

:::table{cols="2.3cm,2.1cm,X" longtable=true}
| Regel | Zielstufe | Geprüfte Invariante und Statuslogik |
| --- | --- | --- |
| **`CQR-000`** | `M1` | **Source Snapshot Ingestion:** Lesbare Snapshots in `source-landscape-registry.json`, strukturierte amtliche HTTP(S)-`url` in `sourceDocument(s)` (lokale PDFs sind unversionierter Arbeitscache; `G8`/`G9` über Views/Provenance statt Zielduplikaten) und vollständige Registrierung in `source-goal-membership-registry.json` & `source-goal-closure-registry.json`. |
| **`CQR-001`** | `M0` | **Current Graph Integrity & Atomic Prerequisite Normal Form (`G17`):** Prüft seit 11.11.2026 (`curriculum-quality-v5` über [curriculumGraphIntegrity.ts](repo:app/scripts/curriculumGraphIntegrity.ts) und [auditTransitiveMinimality.ts](repo:app/scripts/auditTransitiveMinimality.ts)) je kanonischer Wurzel samt benötigter fachfremder Ziele und vererbender Vorfahren: eindeutig auflösbare Ziel-IDs, Zyklenfreiheit von `contains` und effektivem `requires`, atomare Normalform jeder verfassten `requires`-Kante, transitive Minimalität (`minimalityFindings = 0`), explizite `type`-Konsistenz. Der vollständige aktuelle Katalog wird unabhängig von historischen Reduktionsnachweisen ermittelt; ein unvollständiger Katalog bricht den Lauf ab, ein `fail` setzt Curriculum und Scopes auf `M0`. |
| **`CQR-002`** | `M0` | **Explicit Type Consistency:** Optionales `type: "atomic"` verlangt leeres `contains`, `type: "cluster"` nicht-leeres `contains` (`mismatches = 0`). |
| **`CQR-003`** | `M2` | **Bundesland Source-Backed View Coverage:** Beidseitige Vollabdeckung zwischen `de-<land>-*`-Sicht und registrierten Lehrplanatomen ohne Projektionswarnungen/Applicability-Fehler (`APV-201`-Overlays ersetzen keinen Lehrplanbeleg; detaillierter Audit-Snapshot für Mathematik & Physik unter `docs/qa-ci/status/curriculum-source-coverage-audit.{json,md}`). |
| **`CQR-004`** | `M2` | **Course-Level Mapping Consistency:** Source-Ziele mit `LK` mappen auf `LK`, `GK_LK` auf `GK`+`LK`, `unspecified` konservativ auf `GK`+`LK` (reine `LK`-Zuordnung nur mit begründeter `courseLevelDecision`; partielle Kanten zählen nicht als erledigt). |
| **`CQR-101`** | `M3` | **Effective Full Route Coverage:** Jedes Scope-Atom erreicht in $R_{\mathrm{effective}}$ rückwärts einen Motivationsanker und in $R_{\mathrm{effective}}^{-1}$ vorwärts mindestens ein terminales Autonomieziel. |
| **`CQR-102`** | `M3` | **Atomic Direct Route Coverage:** Dieselbe Vorwärts-/Rückwärts-Erreichbarkeit ausschließlich über direkte atomare Kanten $R \cap (A \times A)$ ohne Cluster-Brücken. |
| **`CQR-103`** | `M3` | **No Scoped Cluster `requires`:** Kein durch den `clusterSelector` erfasster Cluster trägt eigene `requires`-Einträge (`scopedClusterRequires = 0`). |
| **`CQR-201`** | Scope-`M3` | **Terminal Autonomy `examData`:** Jedes atomare Kind der konfigurierten terminalen Autonomie-Cluster besitzt vollständige `examData`. |
| **`CQR-301`** | `M5` | **Semantic Atomicity Review Freshness:** Alle relevanten Content-Leaves besitzen aktuelle, fingerprint-gültige `atomic`-Entscheidungen ohne `missing`, `stale`, `obsolete`, `needs_developer_review` oder `non_atomic` (@ref{sec:qa-semantic-atomicity}). |
| **`CQR-302`** | `M6` | **Memory-Card Decision Trace:** Semantischer Default `no_memory_needed`; `memory_required` verweist auf existierende, in `visibilityScopes` sichtbare Memory-Knoten und kanonische Decks unter `curricula/DE/Gymnasium/memory-decks/` (neutrale `de_gymnasium_*`-IDs ohne Bundeslandpräfix), während jede behaltene Primärkarte in `*.cards.review.jsonl` über `originGoalId` auf ein `memory_required`-Ziel zurückführt (`remove`-Karten sind aus aktiven Decks entfernt). |
| **`CQR-303`** | `M7` | **Deep Curriculum QA Completion:** Projiziert ohne Zweitrechnung `app/scripts/reportDeepUnderstandingRollout.ts`: strikte Schnittmenge der 5 Gates `D/P/A/M/V` über alle aktuellen `curricularAtomic`-Ziele plus 6 bestandene Fach-Validierungschecks (`deferred_provider_limitation` und `deferred_quality_review` bleiben offen; `humanTrialBlockingFindings` wird separat ausgewiesen). |
| **`CQR-401`** | `M5` | **Composition View Availability:** Mindestens eine `.view.json` unter `curricula/DE/Gymnasium/composition-views/` für die `landscapeId`. |
| **`CQR-501`** | `M5` | **Applicability Warning Debt:** `activeWarnings + obsoleteAcceptedWarnings = 0` gegenüber `docs/qa-ci/applicability-accepted-warnings.json` (`APV-202` zählt als Diagnose, nicht als Warnschuld). |
:::

**Aktuell fachlich entschiedene `CQR-302`-Bilanzen (Gymnasium DE):** Mathematik (750 Ziele: 713 `no_memory_needed` / 37 `memory_required`, 64 Karten, 6 Knoten), Physik (425: 298 / 127, 148 Karten, 5 Knoten), Chemie (376: 322 / 54, 55 Karten, 6 Knoten), Biologie (355: 348 / 7, 17 Karten, 1 Knoten), Informatik (207: 198 / 9, 28 Karten, 5 Knoten, 18 Views), Latein (115: 82 / 33, 34 Karten, 5 Knoten), Deutsch (268: 194 / 74, 48 Karten, 5 Knoten), Geschichte (156: 100 / 56, 57 Karten, 5 Knoten), Politik und Wirtschaft (413: 306 / 107, 62 Karten, 5 Knoten, 14 Views) sowie Wirtschaftswissenschaften (303: 250 / 53, 51 Karten, 5 Knoten).
