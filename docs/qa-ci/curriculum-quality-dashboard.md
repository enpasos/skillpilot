# Curriculum Quality Dashboard

This document defines the persisted quality-status layer used by the local Workbench dashboard at `/quality-dashboard`.

The dashboard is intentionally read-only. It reads generated status snapshots from `docs/qa-ci/status/` and does not reimplement validator logic in React.

Detailed semantics for maturity levels, QA scopes, route coverage, and every `CQR-*` rule are documented in:

- `docs/qa-ci/curriculum-quality-maturity-and-routes.md`

## Files

- Generator: `app/scripts/generateCurriculumQualityStatus.ts`
- JSON snapshot: `docs/qa-ci/status/curriculum-quality-status.json`
- Markdown snapshot: `docs/qa-ci/status/curriculum-quality-status.md`
- Source-coverage audit generator: `app/scripts/generateCurriculumSourceCoverageAudit.ts`
- Source-coverage audit JSON: `docs/qa-ci/status/curriculum-source-coverage-audit.json`
- Source-coverage audit Markdown: `docs/qa-ci/status/curriculum-source-coverage-audit.md`
- Workbench route: `/quality-dashboard`
- Local dev endpoint: `/__quality-dashboard/status`

Regenerate the snapshots with:

```bash
cd app
npm run quality:curriculum-status
npm run quality:source-coverage-audit
```

## Maturity Levels

The dashboard reports one conservative maturity level per curriculum and, where available, per configured route scope.

| Level | Meaning |
| --- | --- |
| `M0` | Basic graph quality is visible, but source-ingestion is not yet complete. |
| `M1` | Original source inventories are readable and their extracted goals are registered in the source membership/closure ledger. |
| `M2` | Bundesland composition-view atoms are fully source-backed, and registered source original goals are fully covered by the Bundesland view. |
| `M3` | Every configured learner-facing QA scope has a clean route from motivation through atomic learning goals to terminal autonomy. |
| `M4` | Terminal autonomy goals in every configured QA scope are exam-mode-capable via `examData` or an explicit reviewed exception convention. |
| `M5` | Review/readiness layer is clean: semantic atomicity is current, composition views exist, and no active or obsolete applicability warning debt remains. |

`M5` is intentionally strict. Most curricula will remain below it until source ingestion, route profiles, assessment data, and review ledgers exist.

## Rule Families

The first rule catalog is versioned as `curriculum-quality-v1`.

| Rule | Target | Meaning |
| --- | --- | --- |
| `CQR-000` | `M1` | Source inventory ingestion: original source inventories are readable and their extracted goals are registered. |
| `CQR-001` | `M0` | Basic graph integrity: IDs, local/global references, self-reference guards, and direct DAG checks. |
| `CQR-002` | `M0` | Explicit `type` metadata matches structural atomic/cluster classification. |
| `CQR-003` | `M2` | Bundesland atomic coverage: every declared jurisdiction view has full source-backed atomic coverage, no unsupported assigned atom, and no registered source original goal missing from the view mapping. |
| `CQR-004` | `M2` | Course-level mapping consistency: source goals marked `GK_LK`, `LK`, or `unspecified` map only to canonical SkillPilot goals with compatible `GK`/`LK` tags; `unspecified` defaults to `GK_LK` unless an LK-only decision is explicitly reviewed. |
| `CQR-101` | `M3` | Effective full route coverage through `R_eff`: motivation anchor -> selected atomic goals -> terminal autonomy. |
| `CQR-102` | `M3` | Direct atomic route coverage through authored atomic `requires`. |
| `CQR-103` | `M3` | No route-scope cluster-level `requires` remain for ordinary sequencing. |
| `CQR-201` | `M4` | Terminal autonomy goals have `examData`. |
| `CQR-301` | `M5` | Semantic atomicity review ledgers for content leaf goals are complete, current, and resolved. |
| `CQR-401` | `M5` | At least one learner-facing composition view exists for the curriculum. |
| `CQR-501` | `M5` | Applicability warnings are split into active, accepted-current, and obsolete-accepted counts. |

`CQR-*` rules are dashboard/readiness rules. They complement `GVR-*`, `APV-*`, and `CPV-*` validators documented in `docs/qa-ci/graph-validation-rules.md`; they do not replace those validator families.

## Mapping Pipeline Visibility

The dashboard also renders the curriculum-mapping processing pipeline when persisted `source-extraction` artifacts provide `pipelineStatus`.
This is separate from the M0-M5 rule calculation: it shows how far the source-to-SkillPilot implementation has progressed without pretending that a later step is complete.

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
- DE view atoms: the union of atomic nodes rendered by the Germany-wide `de-de-*` composition views,
- Bundesland view atoms: the union of atomic nodes rendered by the matching Bundesland composition views,
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

Atomic nodes include ordinary content goals and explicitly also practice, memory, and assessment nodes when those nodes are atomic and rendered in the relevant composition view. Cluster nodes do not count for the `CQR-003` numerator or denominator.

`DE view atoms` is the national reference maximum for the current canonical view set. For example, mathematics currently has more raw atomic leaves in the JSON than DE view atoms because not every raw leaf is part of the learner-facing national view.

The table value `Bundeslaender` is `cleanJurisdictions / totalJurisdictions`. A jurisdiction is complete only when all checks are clean:

- every Bundesland view atom is backed by accepted Lehrplan evidence,
- no Bundesland view atom is assigned without such evidence,
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
