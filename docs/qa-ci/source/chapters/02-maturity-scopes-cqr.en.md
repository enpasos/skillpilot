## Curriculum Quality: Maturity Levels, QA Scopes, and CQR Rules {#sec:qa-maturity-scopes-cqr}

:::note{title="Workbench semantics and 4 November 2026 concept correction"}
Domain specification for `/quality-dashboard` and the generated snapshots under `docs/qa-ci/status/curriculum-quality-status.json` (producer: `cd app && npm run quality:curriculum-status` via `app/scripts/generateCurriculumQualityStatus.ts`; overview: [Dashboard Status Layer](repo:docs/qa-ci/curriculum-quality-dashboard.md)). **Concept correction, 4 November 2026:** Existing `M7` closeouts or passing route checks do not automatically prove that exam tasks verify independent application of every implicitly recognized competence under [Assessment-Gated Completion](repo:docs/concept/skill-graph/assessment-gated-completion.md); that authoring obligation requires a dedicated task/rubric review.
:::

**Delivered hardening, 13 November 2026:** Direct enforcement reached `main` in [PR #131](https://github.com/enpasos/skillpilot/pull/131). Following subsequent changes to historical review evidence and the Mathematics assessment, `main` at `2129b207f4` passed all 14 jobs of [CI #2315](https://github.com/enpasos/skillpilot/actions/runs/43398052180). The [delivery record](repo:docs/dev/cqr-gvr-hard-gate-plan-2026-11-12.md) distinguishes this later integration state from the original PR run and the cancelled CI run of its merge commit. The CQR/GVR register therefore records 22 codes enforced hard within their named domains; `CQR-104` and `GVR-012` remain `PARTIAL` because of the coverage gaps below. This is automated QA, not evidence of human trials or complete implementation of every skill-graph rule.

`check:transitive-minimality` checks all 21 canonical roots directly. `check:curriculum-maturity-floors` enforces the complete catalog, twelve declared scope identities, exact pinned maturities, and required individual rule passes. Even the eleven M0 roots must each pass `CQR-001`, `CQR-002`, and `CQR-501`. The checker compares against `--base-ref` (PR base SHA, push-before SHA, or local `origin/main`) and fails on missing, duplicate, non-passing, or deconfigured required obligations and removed or lowered pins. A maturity gain requires raising its pin in the same change. Neither numeric maturity nor a regenerated status file alone can satisfy these obligations. The shared `CQR-102` evaluator covers all twelve profiles; the stronger semantic `GVR-012` remains limited to the two Mathematics scopes.

The direct `CQR-104` visibility obligation remains limited to its eight configured scopes out of twelve route profiles. Attempts to add the four stage profiles produced 80 Mathematics, 68 Physics, 41 Chemistry, and 3 Biology findings; compiled-jurisdiction filtering did not resolve them. Their expansion is deferred without reducing existing maturity floors. The pinned checker preserves the eight-scope configuration against silent removal.

### Core Concepts, State Coverage, and Route Model {#sec:qa-cqr-foundations}

A **curriculum** in the dashboard is a canonical `SkillLandscape` file under `curricula/DE/Gymnasium/canonical/`. To evaluate **bidirectional state (Bundesland) coverage**, the dashboard separates three distinct atomic counts (empty `contains`, including atomic practice, memory, and assessment nodes):

1. **`Raw atomic` (`Roh-Atomar`):** all atomic leaf nodes in the canonical JSON file (diagnostic metric, not the state denominator).
2. **`DE-view atomic` (`DE-Sicht atomar`):** union of atomic nodes rendered across national `de-de-*` composition views.
3. **`State-view atomic` (`Bundesland-Sicht atomar`):** union of atomic nodes rendered across a state's `de-<state>-*` composition views.

For each declared state, `CQR-003` checks **both directions** against repository source snapshots (completeness of raw PDF extraction itself is guarded via snapshot/extract ledgers):

- **View -> Source:** Every visible state-view atom carries direct (`provenance`, reviewed `mapping`) or explicitly reviewed `requires-closure` surrogate evidence for that exact state (`override`, `child-union`, and unreviewed `requires-closure` never count as syllabus proof).
- **Source -> View:** Every registered original state goal maps across its full atomic source closure onto visible canonical atoms, and every atom extracted from readable source snapshots is registered in the membership/closure ledgers.

A **QA scope** audits an explicit learner-facing slice (counting registered QA profiles rather than individual graph paths; absent QA scopes cap the aggregator at `M2`):

:::table{cols="3.6cm,2.5cm,1.5cm,X"}
| Scope ID | Stage | Atoms | Motivation anchor & terminal autonomy |
| --- | --- | --- | --- |
| `canonical-math-sek1` | Sek I | 247 | `Warum Mathematik? - Entdecken, Muster & Alltag` -> 38 tasks under `Prüfungen Jahrgangsstufe 5..10` |
| `canonical-math-sek2` | Sek II | 397 | `Warum Mathematik? - Denken, Muster & Zukunft` -> atomic tasks under `Übungen E-Phase`, `Q1..Q4` & `Prozesskompetenzen` |
| `canonical-physics-sek1` | Sek I | 44 | `Warum Physik?` -> atomic tasks under `Übungen Sekundarstufe I Physik` |
| `canonical-physics-sek2` | Sek II | 278 | `Warum Physik?` -> atomic tasks under `Übungen E-Phase` and `Übungen Q1..Q4` |
:::

**Route direction and current Product Owner target norm:** Stored edges `A.requires = [B]` point from the later goal to its prerequisite (`Motivation <- Prerequisites <- Atomic goals <- Terminal practice / exam`). While transition check $R_{\mathrm{effective}}$ includes inherited cluster `requires`, canonical route verification uses strictly direct atomic edges $R \cap (A \times A)$. Atomic normal form $R \subseteq A \times A$, established on 8 November 2026, remains binding. Under the Product Owner decision of **12 November 2026**, every subject and scope milestone pass requires complete deterministic validation of the current target state; a prescribed migration order or equality with a historical prerequisite closure is no longer an acceptance condition (see [Graph Definition §3.1](repo:docs/concept/skill-graph/graph-definition.md)). Since **11 November 2026**, `CQR-001` validates atomic normal form and transitive minimality for every root of the canonical Gymnasium catalog. `CQR-102` and `GVR-012` additionally require direct atomic routes.

The milestone producer derives the [current catalog inventory](repo:app/scripts/currentCurriculumCatalog.ts) from the curriculum manifest, the canonical overview's subject declarations, and the complete canonical directory. It uses the reduction proof only for dependent review bindings. Since 12 November 2026 that proof is frozen: the registry of [contract V9](repo:app/scripts/prerequisiteReductionProof.ts) records, for each goal whose reviews saw another value, the reviewed value and the digest of the goal at the freeze. Reuse is decided per goal: an unchanged goal is compared with its reviewed value, while a changed goal faces the strict checks against current review inputs, and old evidence receives no approval from that fallback. Other catalog changes do not affect the reuse. The history itself is no longer replayed; the verifier of the complete proof remains as a tool with its fixture regressions. This does not establish complete validation of roots outside the canonical Gymnasium catalog.

### Scope Maturity (`M0`–`M4`) vs. Curriculum Maturity (`M0`–`M7`) {#sec:qa-cqr-ladders}

Each `CQR-*` rule evaluates to `pass`, `warn`, `fail`, or `not_configured`. Since 11 November 2026, the promotion chain enforces global atomic normal form and `G17` transitive minimality through `CQR-001` across the canonical Gymnasium catalog (any violation resets the curriculum and all its scopes to `M0`; the direct complete-catalog G17 CI gate fails independently of protected floors, while roots outside the canonical Gymnasium catalog are not checked by `CQR-001`). The [Rule-to-Milestone Matrix](repo:docs/qa-ci/graph-definition-rule-milestone-matrix.md) documents the aligned catalog and promotion targets: `CQR-104` at M4 within its eight pinned visibility scopes, and `CQR-203` at M5.

:::table{cols="2.0cm,X"}
| Scope level | Exact condition per individual QA scope (`M0`–`M4` scale) |
| --- | --- |
| **`M0`** | `CQR-101` is not `pass` (effective route from motivation to terminal autonomy remains open). |
| **`M1`** | `CQR-101` is `pass`, while `CQR-102` or `CQR-103` remains open (atomic routing or cluster `requires`). |
| **`M2`** | `CQR-101..103` are `pass`, while a required visibility check `CQR-104` or `CQR-201`/`CQR-202` is not `pass`. |
| **`M3`** | Route and baseline assessment rules are `pass`, while `CQR-203` remains open. |
| **`M4`** | All required route and assessment rules including `CQR-203` are `pass`. |
:::

Visibility checking is required in eight scopes. It remains absent in the other four, so their scope M4 does not establish endpoint visibility. Any present `CQR-104` rule must always be `pass`. In addition, a non-passing `CQR-001` or `CQR-002` caps every scope of that subject at M0.

:::table{cols="2.0cm,X"}
| Curriculum | Cumulative subject-level condition (`M0`–`M7` scale) |
| --- | --- |
| **`M0`** | At least one of `CQR-000..002` is not `pass` (source inventory, graph integrity, or type consistency). |
| **`M1`** | `CQR-000..002` are `pass`, but at least one of `CQR-003..005` is not `pass` (state-view coverage, `GK`/`LK` consistency, or source-count plausibility). |
| **`M2`** | `CQR-000..005` are `pass`; QA scopes are missing or at least one scope does not reach scope `M2`. |
| **`M3`** | All QA scopes pass `CQR-101`, `CQR-102`, and `CQR-103`, while exam-mode readiness remains incomplete. |
| **`M4`** | All QA scopes reach >= Scope `M3`, while at least one misses Scope `M4` or `CQR-301`/`401`/`501` is open. |
| **`M5`** | **School-ready core QA stage:** all QA scopes at Scope `M4` plus `CQR-301`, `CQR-401`, and `CQR-501` `pass`. |
| **`M6`** | `M5` achieved plus `CQR-302` `pass` (reviewed memory-card decisions, card ledgers, and view visibility). |
| **`M7`** | `M6` achieved plus `CQR-303` `pass` (strict 5-gate `D/P/A/M/V` completion across all current `curricularAtomic` goals). |
:::

### Catalog of `CQR-*` Rules and Active `CQR-302` Subject Balances {#sec:qa-cqr-catalog}

:::table{cols="2.3cm,2.1cm,X" longtable=true}
| Rule | Target | Verified invariant and status logic |
| --- | --- | --- |
| **`CQR-000`** | `M1` | **Source Snapshot Ingestion:** Readable snapshots in `source-landscape-registry.json`, structured official HTTP(S) `url` in `sourceDocument(s)` (local PDFs remain gitignored working caches; `G8`/`G9` uses views/provenance rather than duplicate goal sets), and complete registration in `source-goal-membership-registry.json` & `source-goal-closure-registry.json`. |
| **`CQR-001`** | `M0` | **Current Graph Integrity & Atomic Prerequisite Normal Form (`G17`):** Since 11 Nov 2026 (`curriculum-quality-v6` via [curriculumGraphIntegrity.ts](repo:app/scripts/curriculumGraphIntegrity.ts) and [auditTransitiveMinimality.ts](repo:app/scripts/auditTransitiveMinimality.ts)), verifies per canonical root including required foreign goals and inheriting ancestors: resolvable unique goal IDs, acyclic `contains` and effective `requires`, atomic normal form on every authored `requires` edge, transitive minimality (`minimalityFindings = 0`), explicit `type` consistency. The complete current catalog is derived independently of historical reduction proofs; an incomplete catalog aborts the run, while a failure caps the curriculum and its scopes at `M0`. |
| **`CQR-002`** | `M0` | **Explicit Type Consistency:** Optional `type: "atomic"` requires empty `contains`; `type: "cluster"` requires non-empty `contains` (`mismatches = 0`). |
| **`CQR-003`** | `M2` | **Bundesland Source-Backed View Coverage:** Bidirectional full coverage between `de-<state>-*` views and registered syllabus atoms with zero projection warnings/applicability errors (`APV-201` overlays never count as syllabus proof; detailed audit snapshots for Math & Physics live at `docs/qa-ci/status/curriculum-source-coverage-audit.{json,md}`). |
| **`CQR-004`** | `M2` | **Course-Level Mapping Consistency:** Source goals marked `LK` map to `LK`, `GK_LK` to `GK`+`LK`, and `unspecified` conservatively to `GK`+`LK` (allowing `LK`-only only via justified `courseLevelDecision`; partial edges do not count as resolved). |
| **`CQR-005`** | `M2` | **Source Count Plausibility:** Registered source counts match the reviewed comparison basis or carry a reviewed deviation; required pinned checks must pass. |
| **`CQR-101`** | `M3` | **Effective Full Route Coverage:** Every scoped atom reaches a motivation anchor backward in $R_{\mathrm{effective}}$ and at least one terminal autonomy goal forward in $R_{\mathrm{effective}}^{-1}$. |
| **`CQR-102`** | `M3` | **Atomic Direct Route Coverage:** Identical backward/forward connectivity strictly along direct atomic edges $R \cap (A \times A)$ with zero cluster bridges. |
| **`CQR-103`** | `M3` | **No Scoped Cluster `requires`:** Zero clusters matched by `clusterSelector` carry authored `requires` (`scopedClusterRequires = 0`). |
| **`CQR-104`** | `M4` | **Endpoint Visibility:** Motivation and terminal endpoints remain visible in the eight explicitly pinned visibility scopes; four further stage profiles remain a documented gap. |
| **`CQR-201`** | `M4` | **Terminal Autonomy `examData`:** Every atomic child of configured terminal autonomy clusters carries complete `examData`. |
| **`CQR-202`** | `M4` | **Task Readiness:** Terminal assessment tasks are concrete and usable rather than placeholders. |
| **`CQR-203`** | `M5` | **Assessment Metadata:** Terminal assessments specify release status, covered goals, content areas, and demand level. |
| **`CQR-301`** | `M5` | **Semantic Atomicity Review Freshness:** All in-scope content leaves hold fresh fingerprint-matched `atomic` records with zero `missing`, `stale`, `obsolete`, `needs_developer_review`, or `non_atomic` items (@ref{sec:qa-semantic-atomicity}). |
| **`CQR-302`** | `M6` | **Memory-Card Decision Trace:** Default decision `no_memory_needed`; `memory_required` links existing memory nodes visible in `visibilityScopes` and canonical decks under `curricula/DE/Gymnasium/memory-decks/` (neutral `de_gymnasium_*` IDs without state prefixes), while every kept primary card in `*.cards.review.jsonl` traces via `originGoalId` to a `memory_required` goal (`remove` cards are absent from active decks). |
| **`CQR-303`** | `M7` | **Deep Curriculum QA Completion:** Directly projects `app/scripts/reportDeepUnderstandingRollout.ts`: strict 5-gate `D/P/A/M/V` intersection across all current `curricularAtomic` goals plus 6 passing subject closeout checks (`deferred_provider_limitation` and `deferred_quality_review` remain open; `humanTrialBlockingFindings` is projected separately). |
| **`CQR-401`** | `M5` | **Composition View Availability:** At least one `.view.json` exists under `curricula/DE/Gymnasium/composition-views/` for the `landscapeId`. |
| **`CQR-501`** | `M5` | **Applicability Warning Debt:** `activeWarnings + obsoleteAcceptedWarnings = 0` against `docs/qa-ci/applicability-accepted-warnings.json` (`APV-202` counts as diagnostic rather than warning debt). |
:::

**Current reviewed `CQR-302` subject balances (Gymnasium DE):** Mathematics (750 goals: 713 `no_memory_needed` / 37 `memory_required`, 64 cards, 6 nodes), Physics (425: 298 / 127, 148 cards, 5 nodes), Chemistry (376: 322 / 54, 55 cards, 6 nodes), Biology (355: 348 / 7, 17 cards, 1 node), Informatics (207: 198 / 9, 28 cards, 5 nodes, 18 views), Latin (115: 82 / 33, 34 cards, 5 nodes), German (268: 194 / 74, 48 cards, 5 nodes), History (156: 100 / 56, 57 cards, 5 nodes), Politics & Economics (413: 306 / 107, 62 cards, 5 nodes, 14 views), and Economics (303: 250 / 53, 51 cards, 5 nodes).
