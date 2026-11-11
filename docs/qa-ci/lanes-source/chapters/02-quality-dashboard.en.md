## Curriculum Quality Dashboard {#sec:qal-quality-dashboard}

This chapter specifies the persisted quality-status layer backing the read-only local Workbench view at `/quality-dashboard` (for detailed maturity and `CQR-*` semantics, see [Quality Handbook Volume IV](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)).

### Generators, Artifacts, and Local Commands {#sec:qal-dashboard-files}

Rather than reimplementing validation logic in React, the dashboard reads generated status snapshots through `/__quality-dashboard/status` and `/__quality-dashboard/file?path=docs/qa-ci/status/<file>.md`:

- **Primary status:** `app/scripts/generateCurriculumQualityStatus.ts` writes [curriculum-quality-status.json](repo:docs/qa-ci/status/curriculum-quality-status.json) and [curriculum-quality-status.md](repo:docs/qa-ci/status/curriculum-quality-status.md).
- **Memory-card review (`CQR-302`):** `app/scripts/memoryCardReview.ts`, `runMemoryCardReviewConfigs.ts`, and `reportMemoryCardReviewRollout.ts` validate `curricula/DE/Gymnasium/quality/memory-card-review/*.review.jsonl` plus `*.cards.review.jsonl` and emit `docs/qa-ci/status/memory-card-review-*.md` (currently completed and enforced in CI for Mathematics, Physics, Chemistry, Biology, German, History, Informatics, Latin, Politics and Economics, and Economics).
- **Remediation, source-coverage, and MEM reports:** `reportM0RemediationPlan.ts` (`m0-remediation-plan.md`), `reportEnglishRemediationPilot.ts` (`english-remediation-pilot.md`), `generateCurriculumSourceCoverageAudit.ts` (`curriculum-source-coverage-audit.{json,md}`), and the deliberately non-blocking `generateMemSparqlConsistencyAudit.ts` (`mem-sparql-consistency-audit.{json,md}`).

Regenerating local snapshots and bootstrapping a visible open memory-card queue (`needs_developer_review` records without semantic approval; `pilot-dossier` prepares non-enforced subject triage):

```bash
cd app
npm run quality:curriculum-status
npm run quality:memory-card-review:report:all
npm run quality:memory-card-review:check:all
npm run quality:memory-card-review:rollout
npm run quality:memory-card-review:pilot-dossier
npm run quality:m0-remediation
npm run quality:english-remediation-pilot
npm run quality:source-coverage-audit
npm run quality:mem-sparql-consistency
npm run quality:memory-card-review -- --mode=bootstrap \
  --config=curricula/DE/Gymnasium/quality/memory-card-review/<id>.config.json
```

### Maturity Levels `M0`–`M7`, Source Evidence, and `curriculum-quality-v5` Rules {#sec:qal-dashboard-rules}

The dashboard assigns one conservative maturity level `M0`–`M7` per curriculum alongside the `M5–M7 review gates` strip (`CQR-301`, `CQR-401`, `CQR-501` for core `M5`, `CQR-302` for `M6`, and `CQR-303` for `M7`). Human Champion trials remain an orthogonal statement ([Quality & Human Trials](repo:docs/concept/curriculum-quality-and-human-trial.md)). Official sources are tracked in two layers: committed Git metadata stores structured `sourceDocument`/`sourceDocuments` references with official HTTP(S) URLs and readable extracted inventories, whereas local PDFs (`curricula/**/*.pdf`) are gitignored working copies, so a green source badge remains valid with `0/n` local PDFs whenever all `n/n` official URLs and inventories are present.

:::table{cols="2.2cm,1.3cm,X",longtable=true}
| Rule | Target | Meaning in `curriculum-quality-v5` |
| --- | --- | --- |
| `CQR-000` | `M1` | Source inventories readable, linked to official HTTP(S) URLs, and extracted goals registered in the membership/closure ledger. |
| `CQR-001` | `M0` | Basic graph integrity: IDs, local/global references, self-reference guards, and direct DAG check. |
| `CQR-002` | `M0` | Explicit `type` metadata matches structural atomic/cluster classification. |
| `CQR-003` | `M2` | Bundesland coverage: full source backing for source-relevant view atoms, zero unsupported assignments, zero missing registered source goals. |
| `CQR-004` | `M2` | Course-level consistency: source goals (`GK_LK`, `LK`, `unspecified` defaulting to `GK_LK`) map only to compatible `GK`/`LK` goals. |
| `CQR-101` | `M3` | Effective route coverage via $R_{\mathrm{effective}}$ from motivation anchor through atomic goals to terminal autonomy. |
| `CQR-102` | `M3` | Direct atomic route coverage via authored atomic `requires` edges. |
| `CQR-103` | `M3` | Zero remaining route-scope cluster-level `requires` for ordinary sequencing. |
| `CQR-201` | `M4` | Terminal autonomy goals carry `examData` (or an explicitly reviewed exception convention). |
| `CQR-301` | `M5` | Semantic-atomicity review ledgers for content leaf goals are complete, current, and resolved. |
| `CQR-302` | `M6` | Memory-card ledgers explicitly decide memorization need, trace every kept primary card, and ensure visibility in learner views. |
| `CQR-303` | `M7` | Central report from `reportDeepUnderstandingRollout.ts` proves the exact D/P/A/M/V gate intersection across all current `curricularAtomic` goals (technical image deferrals never count; `humanApproved`/`humanIssueIdentified` neither satisfy nor veto Gate V/`M7`). |
| `CQR-401` | `M5` | At least one learner-facing composition view exists. |
| `CQR-501` | `M5` | Applicability warnings are cleanly split into active, accepted-current, and obsolete-accepted counts (`active = 0`). |
:::

### Mapping Pipeline, Bundesland Evidence, and Route Profiles {#sec:qal-dashboard-coverage}

Separately from `M0`–`M7`, the dashboard surfaces per-source `source-extraction` pipeline progress (`complete`, `incomplete`, `blocked`; missing extractions render as `0/3` with `MAPPING-1` open):

1. **`MAPPING-1`:** Official syllabus passages completely extracted.
2. **`MAPPING-2`:** Source goals created from those passages.
3. **`MAPPING-3`:** Source goals mapped to canonical SkillPilot goals (completed for Hessen Mathematics Sek II across `E.1`–`E.7`, `Q1.1`–`Q1.5`, `Q2.1`–`Q2.5`, `Q3.1`–`Q3.5`, `Q4.1`–`Q4.3` with `316/316` source goals, and for Hessen Mathematics Sek I across all `426/426` KC 7.3, KC 7.1/7.2/6, and G9 topic-line source goals).

For **`CQR-003` (Bundesland coverage)**, only source-coverage-relevant atomic goals rendered by learner-facing composition views count (excluding memory/SRS, practice, assessment, motivation, orientation, and `examData` nodes). Direct syllabus coverage accepts **only** `provenance`, reviewed `mapping` edges (including `partial`, which stay visible as precision warnings), and explicitly accepted surrogate entries for genuine prerequisite gaps — **never** manual `override` overlays, `child-union`, or automatic `requires-closure`.

Currently required route profiles and local verification sequence (e.g., advancing Mathematics Sek I from `M3` toward `M4`):

- **`canonical-math-sek1` / `canonical-math-sek2`:** `Mathematik (Gymnasium, DE)`, motivation anchors `Warum Mathematik? – Entdecken, Muster & Alltag` and `Warum Mathematik? – Denken, Muster & Zukunft`, terminal exam tasks under `Prüfungen Jahrgangsstufe 5`–`10` and `Übungen E-Phase`, `Q1`–`Q4`, plus `Übungen Prozesskompetenzen`.
- **`canonical-physics-sek1` / `canonical-physics-sek2`:** `Physik (Gymnasium, DE)`, motivation anchor `Warum Physik?`, terminal tasks under `Übungen Sekundarstufe I Physik` and `Übungen E-Phase` plus `Q1`–`Q4`.

```bash
cd app
npm run quality:curriculum-status
npm run validate:graph
npm run validate:view-filters
npm run validate:composition-views
npm run quality:semantic-atomicity:check -- \
  --config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.config.json
```
