## Graph-, Anwendbarkeits- und Kompositionsansichts-Validierung {#sec:qa-graph-validation}

:::note{title="Autoritative CI-Quelle und Validierungsgrenzen vom November 2026"}
Maßgebliche Spezifikation für die algorithmische Graph- und Ansichten-Validierung in `.github/workflows/ci.yml` (`graph-validation` & `backend-ci`). Transitive Minimalität ([Graph-Definition §3.1](repo:docs/concept/skill-graph/graph-definition.md)) sowie vollständige lokale Prüfungsrouten, geschützte explizite Klausur-/Kartenziele und versionierte Lerneinheitsverträge (Gültigkeitsregeln R1–R5 vom 11. November 2026; [Assessment-Gated Completion](repo:docs/concept/skill-graph/assessment-gated-completion.md)) sind verbindliche Zielanforderungen für den Validatorausbau. Atomare Normalform und transitive Minimalität (`G17`) werden nicht durch `validate:graph` geprüft; seit dem 11. November 2026 prüft `CQR-001` sie für den kanonischen Gymnasialkatalog (@ref{sec:qa-maturity-scopes-cqr}). Bestehende CI-Regeln ersetzen kein inhaltliches Aufgaben-/Rubrikreview auf selbständige Kompetenzanwendung.
:::

### CI-Einstiegspunkte, Profile und Basis-DAG-Prüfungen {#sec:qa-gvr-entrypoints}

- **Rohgraph-Validator:** `app/scripts/validateGraph.ts` (`npm run validate:graph`) — Profile: `default` (Struktur- und `GVR-*`-Regeln hart `error`) vs. temporärer Migrationsmodus `VALIDATE_GRAPH_STRICT_RULES=0` (`legacy-warn`, wobei **`GVR-012`, `GVR-014`, `GVR-015` und `GVR-016` bedingungslos `error`** bleiben).
- **Filter-Projektions-Validator:** `app/scripts/validateViewFilters.ts` (`npm run validate:view-filters`) für die 17 reviewten kanonischen Gymnasial-Landschaften (`Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Wirtschaft`, `Overview`).
- **Dauermodell- & View-Validatoren:** `app/scripts/reportHeMathDurationProjection.ts --check` (`npm run check:he-math-duration-projection` für Hessen Mathematik Sek-I `G8`/`G9`) und `app/scripts/validateCompositionViews.ts` (`npm run validate:composition-views` für alle `.view.json` unter `curricula/DE/Gymnasium/composition-views/`).
- **Archiv- & Legacy-Handoff-Gates:** `scripts/validate_hessen_upper_secondary_{archive_paths,legacy_refs}.py`, `scripts/validate_hessen_lower_secondary_{archive_paths,legacy_refs}.py` und `scripts/validate_bavaria_gymnasium_{archive_paths,legacy_refs}.py` gegen die expliziten `*-retirement-registry.json`-Allowlists unter `curricula/DE/Gymnasium/provenance/` und `retained-asset-registry.json`.

**Immer aktive Kernprüfungen (`error`):** JSON-Parsing, Ziel-ID- und logische `shortKey`-Eindeutigkeit, Referenzintegrität und Selbstreferenzschutz für `requires`/`contains`, erlaubte `phase`-/Leitideen-/Kompetenz-Domänen, Zyklenfreiheit von direktem `requires`, `contains` und effektivem `requires`, `curricula/curriculum_manifest.json`-Konsistenz sowie projektspezifische Guards (u. a. Physik-Mathematik-Querverweisprüfung).

### Stabile Graph-Validierungsregeln (`GVR-001` bis `GVR-016`) {#sec:qa-gvr-catalog}

:::table{cols="2.2cm,2.8cm,X" longtable=true}
| Regel | Standard / Scope | Geprüfte strukturelle Bedingung |
| --- | --- | --- |
| **`GVR-001`** | `error` · lokal | Ein Ziel darf keinen seiner `contains`-Vorfahren direkt in `requires` referenzieren. |
| **`GVR-002`** | `error` · lokal | Phasen-Kompatibilitätslint: Effektive Voraussetzungen zeigen nicht auf spätere Phasen (`E`, `Q1..Q4`, `Abitur`, `S*`, `J*`). |
| **`GVR-003`** | `error` · lokal | Ein Ziel darf nicht direkt seinen unmittelbaren `contains`-Elternknoten voraussetzen (Deadlock-Schutz). |
| **`GVR-004`** | `error` · `DE_HES_S_GYM_2_*` | Erster atomarer Knoten ist ein Motivationsanker (`Warum`/`Why`; ohne `OVERVIEW`). |
| **`GVR-005`** | `error` · `DE_HES_S_GYM_2_*` | Jedes Atom erreicht den Motivationsanker transitiv über effektives `requires` ($R_{\mathrm{effective}}^+$). |
| **`GVR-006`** | `error` · `DE_HES_S_GYM_2_*` | Ein Ziel darf keines seiner direkten `contains`-Kinder direkt in `requires` voraussetzen (inkl. `OVERVIEW`). |
| **`GVR-007`** | `error` · `mit-ocw-*` | MIT-OCW-Modulatome (`module:*`) tragen in `resourceLinks` jeweils `concept` + `practice` + `assessment` auf `https://ocw.mit.edu/courses/...`. |
| **`GVR-008`** | `error` · lokal | Ausschließlich kanonisches Top-Level-Feld `resourceLinks` für zielbezogene Hilfslinks zulässig. |
| **`GVR-009`** | `error` · lokal | Optionales `type`-Feld stimmt mit struktureller Blatt/Nicht-Blatt-Klassifikation überein (`atomic` gdw. `contains` leer). |
| **`GVR-010`** | `error` · `landscapeId` | `shortKey` ist innerhalb der logischen `landscapeId` eindeutig (Sprachdatei-Paare nur bei identischer Ziel-UUID). |
| **`GVR-011`** | `error` · Profil-Scopes | Konfigurierte `curricularAtomic`-Ziele erreichen stufengetrennt ihren Motivationsanker über $R_{\mathrm{effective}}^+$. |
| **`GVR-012`** | **unconditional `error`** · Mathe DE Sek I & II | **Harte Vollrouten-Invariante:** Jedes `curricularAtomic`-Ziel liegt stufenlokal auf einer direkten atomaren `requires`-Route vom `orientation`-Anker zu einem atomaren `practiceAssessment`-Endpunkt (Sek I: Einzelaufgaben unter `Prüfungen Jahrgangsstufe 5..10`; Sek II: atomare Aufgaben unter `Übungen E-Phase`, `Q1..Q4`, `Prozesskompetenzen`; exakte `semanticKind`-Klassifikation aller Knoten, keine Cluster-/Struktur-Abkürzungen). |
| **`GVR-013`** | `error` · Mathe DE | Kein ausgewähltes Nicht-Memory-Atom verweist mit direktem lokalem `requires` auf einen Clusterknoten. |
| **`GVR-014`** | **unconditional `error`** · alle | Motivations-/Orientierungsknoten sind reine, voraussetzungsfreie atomare Einstiegsanker ohne `examData`, `examples`, Memory-/SRS- oder Assessment-Tags. |
| **`GVR-015`** | **unconditional `error`** · Mathe DE Sek I & II | Geprüfte zweisprachige Orientierungs-Outlooks (2–4 Pfade mit `curricularArea`-Wurzeln sowie atomaren `curricularAtomic`-`entryGoalIds` und `milestoneGoalIds`, direkte atomare Rückbindung zum Anker, keine internen Begriffe wie `Source-Extraction`; fail-closed Schnitt mit `targetGoalIds` zur Laufzeit). |
| **`GVR-016`** | **unconditional `error`** · `examData` | GFM-Tabellenintegrität in `taskContent*` und `solutionContent*` (gültige Trennzeile und konsistente Spaltenzahl ab zwei aufeinanderfolgenden Pipe-Zeilen). |
:::

### Filter-Projektion (`APV-*`), Pflichtlernbasis und Assessment-Anwendbarkeit {#sec:qa-apv-catalog}

:::table{cols="2.2cm,2.2cm,X"}
| Regel | Standard | Bedeutung in `validate:view-filters` & `backend-ci` |
| --- | --- | --- |
| **`APV-102`** | `error` | Ein notwendiges kanonisches Atom fehlt in den persönlichen Erwerbszielen, ausgelieferten Definitionen oder Abschluss-Inputs (erzwungen durch den nativen Backend-Pflichttest). |
| **`APV-103`** | `error` | Ein sichtbares Ziel ist von der projizierten Wurzel aus nicht erreichbar (ausgeklammerte Altcluster tragen `extendedData.applicabilityProjection = "excluded"`). |
| **`APV-201`** | `warning` | Expliziter Applicability-Override aktiv (akzeptierte Fälle mit Begründung in `docs/qa-ci/applicability-accepted-warnings.json`). |
| **`APV-202`** | `diagnostic` | Sichtbarkeit beruht nur auf `partial`-Mappings (`1:n`-Formdiagnose, keine aktive Warnschuld). |
| **`APV-203`** | `warning` | Kompilierte Anwendbarkeit weicht von committeten Metadaten ab. |
:::

- **Vertrag der geschlossenen persönlichen Lernbasis (Product Owner, 10. November 2026):** Gemäß [View Projection & Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md) muss jedes effektiv notwendige Atom tatsächliches Erwerbsziel im gesamten Persönlichen Curriculum sein — unabhängig von seiner Quell-Jurisdiktion (ohne dass daraus Quellabdeckung für `CQR-003` entsteht). Durchgesetzt wird `APV-102` in `.github/workflows/ci.yml` (`backend-ci` -> `./gradlew check`) über `FirstMathPrerequisiteReductionTest.currentCatalogLearningScopesRetainEveryCanonicalAcquisitionTarget` über alle 20 Fächer und 17 Jurisdiktionswahlen (inkl. Biologie-Regressionsschutz bei entferntem Pflichtziel).
- **Explizite Assessment-Anwendbarkeitsbasis:** Für atomare Prüfungs-/Übungsziele mit `applicabilityFromRequires: true` wertet `extendedData.assessmentApplicabilityBasis = { kind: "allOfGoalApplicability", goalRefs: [...] }` ausschließlich die Seed-Eignung aus (weist Zyklen, Duplikate, Fremd- und Memory-Abhängigkeiten ab); die Pflichtlernmenge folgt weiterhin kanonischem `requires`. Biologie und Wirtschaft verwenden das Feld bereits. Ihre historischen Reviewvergleiche bleiben über V8-Nachweise gebunden. Gewöhnliche aktuelle Beschreibungsreview-Kontexte lehnen das Feld weiterhin ohne qualifizierten Vergleich ab; die Zielzustandsentscheidung vom 12. November 2026 erweitert dieses Reviewschema nicht. Aktuelle `APV`-Zielprüfungen und native Prüfungen bleiben erforderlich, ein zusätzlicher historischer Erhaltungsnachweis ist keine allgemeine G17-Abnahmebedingung.

### Kompositionsansichts-Validierung (`CPV-000` bis `CPV-216`) {#sec:qa-cpv-catalog}

`validate:composition-views` prüft alle `.view.json`-Dateien unter `curricula/DE/Gymnasium/composition-views/` deterministisch gegen ihren kanonischen Graphen:

:::table{cols="2.2cm,2.0cm,X" longtable=true}
| Regel | Stufe | Geprüfte Kompositionsbedingung |
| --- | --- | --- |
| **`CPV-000`** | `error` | `.view.json`-Datei konnte nicht geladen oder geparst werden. |
| **`CPV-001`** | `error` | Pflichtmetadaten der View oder eines Strukturknotens fehlen/sind ungültig. |
| **`CPV-002`** | `error` | Referenzierte kanonische Teilbaumwurzel existiert nicht im kanonischen Graphen. |
| **`CPV-004`** | `error` | Zwei referenzierte kanonische Teilbäume überlappen sich oder dieselbe Wurzel wird mehrfach referenziert. |
| **`CPV-005`** | `error` | Der kompilierte Standardbaum enthält dasselbe kanonische Ziel mehrfach. |
| **`CPV-006`** | `error` | Ein kanonisches Ziel erhält im kompilierten Baum mehr als einen sichtbaren Elternknoten. |
| **`CPV-007`** | `error` | Ein leerer Strukturknoten bleibt im sichtbaren View-Baum stehen. |
| **`CPV-008`** | `error` | Unbekannte `projectionRole` in einer Kompositionsreferenz. |
| **`CPV-009`** | `error` | Ein `goalEntry` legt einen `curricularArea`-Cluster opak offen statt ihn über `canonicalSubtree` oder explizite Atome zu entfalten. |
| **`CPV-101`** | `warning` | Zu generisches Strukturknoten-Label. |
| **`CPV-102`** | `warning` | Kanonische Teilbaumwurzel trägt noch phasen- oder länderspezifischen Titel. |
| **`CPV-210`** | `error` | Kanonische Mathe-Sek-I-View zeigt den geprüften Motivationsanker nicht. |
| **`CPV-211`** | `error` | Kanonische Mathe-Sek-I-View zeigt nicht alle Jahrgangs-Prüfungsordner samt Einzelaufgaben. |
| **`CPV-212`** | `error` | Fehlerhafte Mathe-Sek-I-Prüfungsordnerstruktur (fehlender Jahrgang, nicht-atomare Aufgabe, fehlende `examData`, Cluster-`requires`, Duplikat oder veralteter Sammelendpunkt). |
| **`CPV-213`** | `error` | Mathe-Sek-I-View exponiert noch den veralteten Sammelzweig `Übungen Sekundarstufe I`. |
| **`CPV-214`** | `error` | Mathe-Sek-II-/CrossStage-View zeigt den geprüften Sek-II-Motivationsanker nicht. |
| **`CPV-215`** | `error` | Mathe-Sek-II-/CrossStage-View exponiert keinen atomaren terminalen Prüfungs-/Autonomieendpunkt. |
| **`CPV-216`** | `error` | Learner-facing View-Label enthält interne Autorenbegriffe wie `Source-Extraction`. |
:::
