## Graph, Applicability, and Composition-View Validation Rules {#sec:qa-graph-validation}

:::note{title="Authoritative CI source and November 2026 validation boundaries"}
Single source of truth for algorithmic graph and view validation in `.github/workflows/ci.yml` (`graph-validation` & `backend-ci`). Transitive minimality ([Graph Definition §3.1](repo:docs/concept/skill-graph/graph-definition.md)) together with complete local assessment routes, protected explicit exam/card targets, and versioned learning-unit contracts (unit validity rules R1–R5 of 11 November 2026; [Assessment-Gated Completion](repo:docs/concept/skill-graph/assessment-gated-completion.md)) are binding target requirements for forthcoming validator adaptations. Atomic normal form and transitive minimality (`G17`) have a direct CI gate, `npm run check:transitive-minimality`, across all 21 canonical Gymnasium catalog roots. It checks the current graph, including necessary foreign prerequisites and inheriting ancestors, without historical closure-preservation evidence. `CQR-001` independently applies this current-state contract before any M1–M7 pass (@ref{sec:qa-maturity-scopes-cqr}). Existing CI passes never substitute for content/rubric review verifying independent application of recognized competences.
:::

### CI Entrypoints, Enforcement Profiles, and Core DAG Checks {#sec:qa-gvr-entrypoints}

- **Raw graph validator:** `app/scripts/validateGraph.ts` (`npm run validate:graph`) — all structural and active `GVR-*` violations fail with `error`; there is no warning-mode environment override.
- **Pinned maturity obligations:** `npm run check:curriculum-maturity-floors` checks subject and scope obligations directly against `--base-ref` (PR base SHA, push-before SHA, local `origin/main`), independently of status-file staleness. It and `check:transitive-minimality` run in the complete `graph-validation` job and local curriculum suite.
- **Filter-projection validator:** `app/scripts/validateViewFilters.ts` (`npm run validate:view-filters`) covering the 21 declared canonical Gymnasium landscapes (`Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Italienisch`, `Russisch`, `Polnisch`, `Tschechisch`, `Wirtschaft`, `Overview`).
- **Duration-model & composition-view validators:** `app/scripts/reportHeMathDurationProjection.ts --check` (`npm run check:he-math-duration-projection` for Hesse Mathematics Sek-I `G8`/`G9`) and `app/scripts/validateCompositionViews.ts` (`npm run validate:composition-views` across all `.view.json` files under `curricula/DE/Gymnasium/composition-views/`).
- **Archive & legacy-handoff gates:** `scripts/validate_hessen_upper_secondary_{archive_paths,legacy_refs}.py`, `scripts/validate_hessen_lower_secondary_{archive_paths,legacy_refs}.py`, and `scripts/validate_bavaria_gymnasium_{archive_paths,legacy_refs}.py` enforcing the explicit `*-retirement-registry.json` allowlists under `curricula/DE/Gymnasium/provenance/` and `retained-asset-registry.json`.

**Always-active core checks (`error`):** JSON parsing, goal-ID and logical `shortKey` uniqueness, referential integrity and self-reference guards on `requires`/`contains`, allowed `phase`/Leitideen/competency tag domains, acyclicity of direct `requires`, `contains`, and effective `requires`, `curricula/curriculum_manifest.json` sync, and project invariants (such as cross-subject Physics-to-Mathematics resolution).

The validator also enforces the shared `CQR-102` direct atomic route obligation across every declared route profile. This reachability check does not claim the stronger semantic guarantees of `GVR-012` (currently three of twelve scopes).

### Emitted Graph Validation Rules (`GVR-001` through `GVR-016`) {#sec:qa-gvr-catalog}

The retired identifiers `GVR-004`, `GVR-005`, `GVR-006`, and `GVR-013` remain reserved for historical evidence; the validator no longer emits them. Current profile-based orientation rules remain active. General atomic endpoint validity is checked by the complete-catalog G17 gate.

:::table{cols="2.2cm,2.8cm,X" longtable=true}
| Rule | Default / Scope | Verified structural invariant |
| --- | --- | --- |
| **`GVR-001`** | `error` · local | A goal must not directly require any of its `contains` ancestors. |
| **`GVR-002`** | `error` · local | Phase compatibility lint: effective prerequisites do not point to later phases (`E`, `Q1..Q4`, `Abitur`, `S*`, `J*`). |
| **`GVR-003`** | `error` · local | A goal must not directly require its immediate `contains` parent (primary deadlock guard). |
| **`GVR-007`** | `error` · `mit-ocw-*` | MIT OCW module atoms (`module:*`) include `concept` + `practice` + `assessment` links in `resourceLinks` targeting `https://ocw.mit.edu/courses/...`. |
| **`GVR-008`** | `error` · local | Canonical top-level `resourceLinks` is the sole permitted goal-level helper-link field. |
| **`GVR-009`** | `error` · local | Optional `type` metadata matches structural leaf/non-leaf classification (`atomic` iff `contains` is empty). |
| **`GVR-010`** | `error` · `landscapeId` | `shortKey` is unique within the logical `landscapeId` (locale file pairs allowed only on identical goal UUIDs). |
| **`GVR-011`** | `error` · profile scopes | Selected `curricularAtomic` goals reach their stage-specific motivation anchor via $R_{\mathrm{effective}}^+$. |
| **`GVR-012`** | **unconditional `error`** · Mathematics lower/upper secondary, Biology upper secondary | **Hard semantic full route:** Every selected `curricularAtomic` goal lies on a direct atomic route between `orientation` and `practiceAssessment`; complete current classifications, admissible intermediate goals, side prerequisites, and memory ordering are checked. Three of twelve scopes are required. The [shared inventory](repo:app/scripts/lib/semanticRouteInventory.ts) and [route audit](repo:app/scripts/auditSemanticLearningRoutes.ts) account for three additional scopes with route findings and six without complete ledgers; no cluster/structure shortcuts. |
| **`GVR-014`** | **unconditional `error`** · all | Motivation/orientation nodes are pure, prerequisite-free atomic entry anchors with zero `examData`, `examples`, memory/SRS, or assessment tags. |
| **`GVR-015`** | **unconditional `error`** · Math DE Sek I & II | Reviewed bilingual orientation outlooks (2–4 paths with `curricularArea` roots plus atomic `curricularAtomic` `entryGoalIds` and `milestoneGoalIds`, direct atomic link to the anchor, zero internal authoring terms like `Source-Extraction`, and fail-closed runtime intersection with `targetGoalIds`). |
| **`GVR-016`** | **unconditional `error`** · `examData` | GFM table integrity across `taskContent*` and `solutionContent*` (valid delimiter row and uniform column count on consecutive pipe rows). |
:::

### Filter Projection (`APV-*`), Required-Learning Contract, and Assessment Applicability {#sec:qa-apv-catalog}

:::table{cols="2.2cm,2.2cm,X"}
| Rule | Default | Meaning in `validate:view-filters` & `backend-ci` |
| --- | --- | --- |
| **`APV-102`** | `error` | A necessary canonical atom is missing from personal acquisition targets, emitted definitions, or completion inputs (enforced by the native backend gate). |
| **`APV-103`** | `error` | A visible goal is unreachable from the projected root (retired compatibility clusters must set `extendedData.applicabilityProjection = "excluded"`). |
| **`APV-201`** | `warning` | Explicit applicability override path used (accepted cases recorded with rationale in `docs/qa-ci/applicability-accepted-warnings.json`). |
| **`APV-202`** | `diagnostic` | Visibility backed solely by `partial` mappings (`1:n` mapping-shape diagnostic, not warning debt). |
| **`APV-203`** | `warning` | Compiled applicability diverges from committed applicability metadata. |
:::

- **Required-learning contract (Product Owner, 10 November 2026):** Under the closed personal learning basis ([View Projection & Goal Placement](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)), every effective necessary atom must be an actual acquisition target in the full Personal Curriculum regardless of its source jurisdiction (without granting `CQR-003` source coverage). `APV-102` is enforced in `.github/workflows/ci.yml` (`backend-ci` -> `./gradlew check`) by `CanonicalRequiredLearningGateTest.currentCatalogLearningScopesRetainEveryCanonicalAcquisitionTarget` across all 20 subjects and 17 jurisdiction choices (including the Biology regression rejecting removed required targets).
- **Explicit assessment applicability basis:** For atomic practice/assessment endpoints with `applicabilityFromRequires: true`, optional `extendedData.assessmentApplicabilityBasis = { kind: "allOfGoalApplicability", goalRefs: [...] }` supplies seed-eligibility evidence only (rejecting cycles, duplicates, foreign, and memory dependencies), while required learning still follows canonical `requires`. Biology and Economics already use this field. Since the proof freeze of 12 November 2026, the V9 registry records per goal the value their reviews saw where it differs from the frozen goal. Ordinary current description-review contexts still reject the field without a qualified comparison; the target-state decision of 12 November 2026 does not extend that review schema. Current emitted-target `APV` checks and native checks remain required; an additional historical preservation proof is not a general G17 acceptance condition.

### Composition-View Validator (`CPV-000` through `CPV-216`) {#sec:qa-cpv-catalog}

`validate:composition-views` compiles every `.view.json` under `curricula/DE/Gymnasium/composition-views/` deterministically against its canonical graph:

:::table{cols="2.2cm,2.0cm,X" longtable=true}
| Rule | Level | Verified composition-view invariant |
| --- | --- | --- |
| **`CPV-000`** | `error` | Composition-view JSON file could not be loaded or parsed. |
| **`CPV-001`** | `error` | Required view or structure-node metadata is missing or invalid. |
| **`CPV-002`** | `error` | Referenced canonical subtree root does not exist in the canonical graph. |
| **`CPV-004`** | `error` | Two referenced canonical subtree roots overlap or the same root is referenced multiple times. |
| **`CPV-005`** | `error` | Compiled default tree contains the same canonical goal more than once. |
| **`CPV-006`** | `error` | Compiled default tree assigns more than one visible parent to a canonical goal. |
| **`CPV-007`** | `error` | An empty structure node remains visible in the compiled view tree. |
| **`CPV-008`** | `error` | Unknown `projectionRole` used on a composition reference. |
| **`CPV-009`** | `error` | Direct `goalEntry` exposes a `curricularArea` cluster opaquely instead of expanding via `canonicalSubtree` or explicit atoms. |
| **`CPV-101`** | `warning` | Structure-node label is too generic to be review-safe. |
| **`CPV-102`** | `warning` | Referenced canonical subtree root still carries a phase- or state-specific title. |
| **`CPV-210`** | `error` | Canonical Mathematics Sek-I view omits the reviewed motivation anchor. |
| **`CPV-211`** | `error` | Canonical Mathematics Sek-I view omits required year exam folders or individual task nodes. |
| **`CPV-212`** | `error` | Malformed Mathematics Sek-I exam folder structure (missing year folder, non-atomic task, missing `examData`, cluster prerequisite, duplicate, or stale aggregate endpoint). |
| **`CPV-213`** | `error` | Mathematics Sek-I view still exposes the legacy `Übungen Sekundarstufe I` aggregate branch. |
| **`CPV-214`** | `error` | Mathematics Sek-II or cross-stage view omits the reviewed Sek-II motivation anchor. |
| **`CPV-215`** | `error` | Mathematics Sek-II or cross-stage view exposes zero atomic terminal assessment endpoints. |
| **`CPV-216`** | `error` | Learner-facing composition label exposes internal authoring terms such as `Source-Extraction`. |
:::
