# Curriculum Quality Dashboard

This document defines the persisted quality-status layer used by the local Workbench dashboard at `/quality-dashboard`.

The dashboard is intentionally read-only. It reads generated status snapshots from `docs/qa-ci/status/` and does not reimplement validator logic in React.

Detailed semantics for maturity levels, QA scopes, route coverage, and every `CQR-*` rule are documented in:

- `docs/qa-ci/curriculum-quality-maturity-and-routes.md`

## Files

- Generator: `app/scripts/generateCurriculumQualityStatus.ts`
- JSON snapshot: `docs/qa-ci/status/curriculum-quality-status.json`
- Markdown snapshot: `docs/qa-ci/status/curriculum-quality-status.md`
- Memory-card review checker: `app/scripts/memoryCardReview.ts`
- Memory-card review config runner: `app/scripts/runMemoryCardReviewConfigs.ts`
- Memory-card rollout triage: `app/scripts/reportMemoryCardReviewRollout.ts`
- Memory-card review ledgers: `curricula/DE/Gymnasium/quality/memory-card-review/*.review.jsonl` and `*.cards.review.jsonl`
- Memory-card review audit reports: `docs/qa-ci/status/memory-card-review-canonical-math-full.md`, `docs/qa-ci/status/memory-card-review-canonical-physics-full.md`, `docs/qa-ci/status/memory-card-review-canonical-chemistry-full.md`, `docs/qa-ci/status/memory-card-review-canonical-biology-full.md`, `docs/qa-ci/status/memory-card-review-canonical-german-full.md`, `docs/qa-ci/status/memory-card-review-canonical-history-full.md`, `docs/qa-ci/status/memory-card-review-canonical-informatics-full.md`, `docs/qa-ci/status/memory-card-review-canonical-latin-full.md`, `docs/qa-ci/status/memory-card-review-canonical-politics-economics-full.md`, `docs/qa-ci/status/memory-card-review-canonical-economics-full.md`
- Memory-card rollout report: `docs/qa-ci/status/memory-card-review-rollout.md`
- M0 remediation report generator: `app/scripts/reportM0RemediationPlan.ts`
- M0 remediation report: `docs/qa-ci/status/m0-remediation-plan.md`
- Englisch M0 remediation pilot generator: `app/scripts/reportEnglishRemediationPilot.ts`
- Englisch M0 remediation pilot report: `docs/qa-ci/status/english-remediation-pilot.md`
- Source-coverage audit generator: `app/scripts/generateCurriculumSourceCoverageAudit.ts`
- Source-coverage audit JSON: `docs/qa-ci/status/curriculum-source-coverage-audit.json`
- Source-coverage audit Markdown: `docs/qa-ci/status/curriculum-source-coverage-audit.md`
- MEM SPARQL consistency audit generator: `app/scripts/generateMemSparqlConsistencyAudit.ts`
- MEM SPARQL consistency audit config: `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json`
- MEM SPARQL consistency audit JSON: `docs/qa-ci/status/mem-sparql-consistency-audit.json`
- MEM SPARQL consistency audit Markdown: `docs/qa-ci/status/mem-sparql-consistency-audit.md`
- Workbench route: `/quality-dashboard`
- Local dev endpoint: `/__quality-dashboard/status`
- Local status-file endpoint: `/__quality-dashboard/file?path=docs/qa-ci/status/<file>.md`

Regenerate the snapshots with:

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
```

`quality:memory-card-review:*:all` discovers all `*.config.json` files in `curricula/DE/Gymnasium/quality/memory-card-review/`. Add a config only when the CQR-302 ledger is meant to be enforced; Mathematik, Physik, Chemie, Biologie, Deutsch, Geschichte, Informatik, Latein, Politik und Wirtschaft, and Wirtschaftswissenschaften are currently completed and enforced in CI.

`quality:mem-sparql-consistency` is deliberately non-blocking. It probes the live MEM/FWU SPARQL endpoint, writes a Mathematik/Gymnasium review report, and keeps endpoint gaps or source-text discrepancies as triage issues instead of CI failures.

`quality:memory-card-review:pilot-dossier` is a non-enforced preparation step for subject-level pilots. It writes a semantic triage dossier without creating or changing the enforced `CQR-302` config or ledger.

To initialize a new visible-but-open queue for a curriculum, create the config file first and then run:

```bash
cd app
npm run quality:memory-card-review -- --mode=bootstrap --config=curricula/DE/Gymnasium/quality/memory-card-review/<review-id>.config.json
```

The bootstrap mode writes only `needs_developer_review` records for missing ordinary atomic goals. It is a visibility step, not a semantic pass decision.

## Maturity Levels

The dashboard reports one conservative maturity level per curriculum and, where available, per configured route scope.
The top-level M0-M6 cards are aggregate maturity counts. They change only when at least one curriculum changes maturity.
To make that explicit, the dashboard also shows an `M5/M6 review gates` strip for `CQR-301`, `CQR-401`, `CQR-501`, and `CQR-302`; these gate cards show how many rule instances pass and how many are still open. The first three rules carry the core `M5` level. `CQR-302` is the additional `M6` memory layer, so missing memory-card configuration blocks `M6`, not `M5`.

| Level | Meaning |
| --- | --- |
| `M0` | Basic graph quality is visible, but source-ingestion is not yet complete or original source URLs are missing. |
| `M1` | Original source inventories are readable, linked to official HTTP(S) source URLs, and their extracted goals are registered in the source membership/closure ledger. |
| `M2` | Bundesland composition-view atoms are fully source-backed, and registered source original goals are fully covered by the Bundesland view. |
| `M3` | Every configured learner-facing QA scope has a clean route from motivation through atomic learning goals to terminal autonomy. |
| `M4` | Terminal autonomy goals in every configured QA scope are exam-mode-capable via `examData` or an explicit reviewed exception convention. |
| `M5` | Core review/readiness layer is clean: semantic atomicity is current, composition views exist, and no active or obsolete applicability warning debt remains. |
| `M6` | `M5` plus reviewed memory-card layer: memory-card decision tracing is current or explicitly reviewed, every kept primary card is traced, and configured learner-facing views expose required memory nodes. |

`M5` is intentionally strict for the core curriculum layer. `M6` is stricter again and is reserved for curricula whose optional memory-card layer has also been semantically reviewed.

## Source References And Local Working Copies

The dashboard treats original curriculum sources in two separate layers:

- The committed, durable layer is the structured source reference in Git: `sourceDocument`/`sourceDocuments` with official HTTP(S) URLs, titles, roles, and optional local path hints.
- Local PDFs or HTML files are working copies for extraction, page checks, and local review. They are normally ignored by Git through `curricula/**/*.pdf` and similar rules.

This distinction is intentional. A green source badge means the official source reference is documented for the currently declared source scope and the extracted or retained source inventory is readable and registered. It does **not** mean that the original PDF is committed to Git.

Local source-file availability remains useful diagnostic information:

- If a generator must re-run PDF extraction, the local file must exist or be downloaded from the documented official URL first.
- If the persisted extraction is already present, the dashboard can still be green with `0/n` local working copies, as long as `n/n` official URLs are documented and the extracted inventory is readable.
- The UI therefore labels this as source links, not as bundled source files.

For German Gymnasium quality work, "source scope is green" means the source situation is explicitly decided for every relevant cell that the curriculum claims to cover: Bundesland, subject, Sekundarstufe I/II, and G8/G9 or other duration models where applicable. A cell can be green either through its own retained source inventory or through an explicit reviewed decision that no separate source/duration split is required.

## Rule Families

The current rule catalog is versioned as `curriculum-quality-v3`.

| Rule | Target | Meaning |
| --- | --- | --- |
| `CQR-000` | `M1` | Source inventory ingestion: original source inventories are readable, linked to official HTTP(S) source URLs, and their extracted goals are registered. |
| `CQR-001` | `M0` | Basic graph integrity: IDs, local/global references, self-reference guards, and direct DAG checks. |
| `CQR-002` | `M0` | Explicit `type` metadata matches structural atomic/cluster classification. |
| `CQR-003` | `M2` | Bundesland atomic coverage: every declared jurisdiction view has full source-backed coverage for its source-coverage atoms, no unsupported assigned source-coverage atom, and no registered source original goal missing from the view mapping. |
| `CQR-004` | `M2` | Course-level mapping consistency: source goals marked `GK_LK`, `LK`, or `unspecified` map only to canonical SkillPilot goals with compatible `GK`/`LK` tags; `unspecified` defaults to `GK_LK` unless an LK-only decision is explicitly reviewed. |
| `CQR-101` | `M3` | Effective full route coverage through `R_eff`: motivation anchor -> selected atomic goals -> terminal autonomy. |
| `CQR-102` | `M3` | Direct atomic route coverage through authored atomic `requires`. |
| `CQR-103` | `M3` | No route-scope cluster-level `requires` remain for ordinary sequencing. |
| `CQR-201` | `M4` | Terminal autonomy goals have `examData`. |
| `CQR-301` | `M5` | Semantic atomicity review ledgers for content leaf goals are complete, current, and resolved. |
| `CQR-302` | `M6` | Memory-card review ledgers explicitly decide whether ordinary atomic goals justify memorization support; every kept primary card must trace to such a goal-level decision, every memory deck must remain traceable, and configured learner-facing views must expose the referenced memory nodes. Missing review configuration blocks `M6`, but not `M5`. |
| `CQR-401` | `M5` | At least one learner-facing composition view exists for the curriculum. |
| `CQR-501` | `M5` | Applicability warnings are split into active, accepted-current, and obsolete-accepted counts. |

`CQR-*` rules are dashboard/readiness rules. They complement `GVR-*`, `APV-*`, and `CPV-*` validators documented in `docs/qa-ci/graph-validation-rules.md`; they do not replace those validator families.

## Mapping Pipeline Visibility

The dashboard also renders the curriculum-mapping processing pipeline when persisted `source-extraction` artifacts provide `pipelineStatus`.
This is separate from the M0-M6 rule calculation: it shows how far the source-to-SkillPilot implementation has progressed without pretending that a later step is complete.

The pipeline is reported per canonical curriculum and per source landscape:

- `MAPPING-1`: official original Lehrplan passages extracted.
- `MAPPING-2`: source goals created from those passages.
- `MAPPING-3`: source goals mapped to canonical SkillPilot goals.

Each step is `complete`, `incomplete`, or `blocked`.
The dashboard table shows completed source pipelines over all expected source pipelines, for example `1/31`.
This is intentionally source-based: one completed Sek-II extraction must not make a combined Sek-I/Sek-II curriculum look complete.
If a mapping source has no persisted `source-extraction` artifact yet, the dashboard creates an explicit `0/3` placeholder with `MAPPING-1` open and dependent steps blocked.
The detail panel shows the current open step, the source landscape, jurisdiction, number of passages, number of source goals, and each step badge.

For Hessen Mathematik Sek II the current expected state is:

- `MAPPING-1 = complete`
- `MAPPING-2 = complete`
- `MAPPING-3 = complete`, with the complete slices `E.1` to `E.7`, `Q1.1` to `Q1.5`, `Q2.1` to `Q2.5`, `Q3.1` to `Q3.5`, and `Q4.1` to `Q4.3`: 316/316 source goals reviewed, 316 mapped, 0 canonical-goal gaps, and 0 placement/view questions. The source-goal denominator is now 316 because two former Q3.2 entries were corrected as Normalverteilung formula extraction artifacts and one Q4.2 entry was corrected as a domain-heading artifact (`Analytische Geometrie:`), not an official learning goal.

That means the official text extraction and source-goal creation are currently considered completed by the persisted checks, while canonical SkillPilot mapping remains explicitly open and quantifies the remaining work.

For Hessen Mathematik Sek I the current expected state is intentionally different:

- `MAPPING-1 = complete`: the primary Kerncurriculum, the G9 Lehrplan passages, and the implementation Leitfaden are visible as official/source-supporting passages.
- `MAPPING-2 = complete`: the persisted extraction now contains 99 KC 7.3 content-field source goals, 86 KC 7.1/7.2/6 competency-expectation source goals, and 241 granular G9 topic-line source goals.
- `MAPPING-3 = complete`: the review lane now maps all 426/426 reviewed source goals to canonical SkillPilot goals, covering all KC 7.3 content-field source goals (`Zahlen`, `Operationen`, `Ebene Figuren`, `Körper`, `Beziehungen geometrischer Objekte`, `Umgang mit Größen`, `Messvorgänge`, `Zuordnungen`, `Funktionen und Gleichungen`, `statistische Erhebungen`, `Umgang mit dem Zufall`), all KC 7.1/7.2/6 competency expectations, and all granular G9 Jahrgänge 5-10 topic-line source goals; no source-goal mapping gaps remain in this lane.

## Bundesland Coverage

The dashboard persists and renders Bundesland coverage for learner-facing composition views, not for every raw node in the JSON file.

For each canonical curriculum and each declared jurisdiction, the snapshot stores:

- raw atomic goals: all leaf nodes in the canonical JSON file,
- DE source-view atoms: the union of source-coverage-relevant atomic nodes rendered by the Germany-wide `de-de-*` composition views,
- Bundesland source-view atoms: the union of source-coverage-relevant atomic nodes rendered by the matching Bundesland composition views,
- source-backed Bundesland view atoms,
- Bundesland view atoms without sufficient Lehrplan evidence,
- registered source Lehrplan atoms,
- source Lehrplan atoms that map into the Bundesland view,
- source Lehrplan atoms not mapped into the Bundesland view,
- extracted source atoms from registered source inventories,
- extracted source atoms missing from the source membership/closure ledger,
- registered source original goals,
- registered source original goals fully covered by Bundesland view atoms,
- projection errors and warnings.

Atomic nodes count for `CQR-003` only when they are relevant for curriculum source coverage. Memory/SRS, practice, assessment, motivation, orientation, and `examData` goals are excluded from this numerator and denominator; they are checked by their own QA lanes. Cluster nodes do not count for the `CQR-003` numerator or denominator.

`DE source-view atoms` is the national reference maximum for the current canonical view set after this source-coverage filter. For example, mathematics currently has more raw atomic leaves in the JSON than DE source-view atoms because not every raw leaf is part of source-coverage QA or the learner-facing national view.

The table value `Bundeslaender` is `cleanJurisdictions / totalJurisdictions`. A jurisdiction is complete only when all checks are clean:

- every Bundesland source-view atom is backed by accepted Lehrplan evidence,
- no Bundesland source-view atom is assigned without such evidence,
- every registered source original goal is fully covered by canonical atoms rendered in that Bundesland view,
- every extracted source atom from available source inventories is registered in the source membership/closure ledger.

The extraction check has one hard boundary: it can only verify source inventories that exist in the repository and can be parsed. If the official Lehrplan has not yet been turned into a complete source extraction or retained source snapshot, the dashboard cannot infer the missing official goals automatically; that remains explicit source-ingestion work.

Only these evidence kinds count directly for `CQR-003` content coverage:

- `provenance`: direct canonical-goal provenance from a registered source curriculum.
- `mapping`: reviewed mapping from a source curriculum goal to the canonical goal, including reviewed `partial` mappings when the source goal is still content-covered.
- reviewed surrogate evidence: an explicitly accepted requires-closure surrogate entry for a real logical prerequisite gap.

These evidence kinds do **not** count as Lehrplan coverage for `CQR-003`:

- `override`: manual visibility/applicability overlay.
- `child-union`: cluster inference from visible children.
- automatic `requires-closure`: prerequisite visibility inference without an explicit surrogate review.

Reviewed `partial` mappings still remain visible as passgenauigkeit warnings. They are content coverage, but not a passgenaue one-to-one source/canonical relation. An accepted `APV-201` override warning may keep a projection operationally visible, but it does not satisfy Bundesland coverage. Lower values such as `28/77 belegt` remain visible in the detail panel as partial evidence. Values such as `419 nicht belegt` are explicitly treated as unsupported assignments, not as coverage.

## Current Route Profiles

The currently required route profiles are:

- `canonical-math-sek1`
- landscape: `Mathematik (Gymnasium, DE)`
- scope: `Sekundarstufe I`
- motivation anchor: `Warum Mathematik? – Entdecken, Muster & Alltag`
- terminal autonomy target: `Sek-I-Abschlussaufgaben Mathematik`
- terminal autonomy cluster: `Übungen Sekundarstufe I`

- `canonical-math-sek2`
- landscape: `Mathematik (Gymnasium, DE)`
- scope: `Sekundarstufe II`
- motivation anchor: `Warum Mathematik? – Denken, Muster & Zukunft`
- terminal autonomy targets: the atomic exam-mode goals under `Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, `Übungen Q3`, `Übungen Q4`, and `Übungen Prozesskompetenzen`

- `canonical-physics-sek1`
- landscape: `Physik (Gymnasium, DE)`
- scope: `Sekundarstufe I`
- motivation anchor: `Warum Physik?`
- terminal autonomy target: atomic exam-mode goals under `Übungen Sekundarstufe I Physik`

- `canonical-physics-sek2`
- landscape: `Physik (Gymnasium, DE)`
- scope: `Sekundarstufe II`
- motivation anchor: `Warum Physik?`
- terminal autonomy targets: atomic exam-mode goals under `Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, `Übungen Q3`, and `Übungen Q4`

The Sek I scope mirrors the existing `GVR-011` / `GVR-012` rollout profile. The Sek II scope carries the same dashboard contract for the upper-secondary part of the shared canonical mathematics curriculum.

- `CQR-101` should remain green.
- `CQR-102` is the migration target from effective route coverage to direct atomic route coverage.
- `CQR-103` tracks remaining scoped cluster-level `requires`.
- `CQR-201` tracks which year-level practice nodes still lack concrete `examData`.

## Mathe Sek I Perfection Path

To bring canonical mathematics Sek I from `M3` toward `M4` after source ingestion and Bundesland coverage are clean:

1. Keep `GVR-012` / `CQR-101` green while editing.
2. Move broad Sek-I cluster-level `requires` down into precise atomic prerequisites.
3. Ensure each selected atomic goal has a direct atomic path back to the motivation anchor.
4. Preserve the existing direct terminal path into the Sek-I capstone.
5. Add concrete `examData` to the J5-J10 terminal autonomy goals or document a machine-readable exception convention.
6. Regenerate `curriculum-quality-status.json` and rerun graph validation.

Commands:

```bash
cd app
npm run quality:curriculum-status
npm run validate:graph
```

For a full release-quality pass, also run the relevant view and review validators:

```bash
cd app
npm run validate:view-filters
npm run validate:composition-views
npm run quality:semantic-atomicity:check -- --config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.config.json
```
