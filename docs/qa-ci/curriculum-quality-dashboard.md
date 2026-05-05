# Curriculum Quality Dashboard

This document defines the persisted quality-status layer used by the local Workbench dashboard at `/quality-dashboard`.

The dashboard is intentionally read-only. It reads generated status snapshots from `docs/qa-ci/status/` and does not reimplement validator logic in React.

Detailed semantics for maturity levels, QA scopes, route coverage, and every `CQR-*` rule are documented in:

- `docs/qa-ci/curriculum-quality-maturity-and-routes.md`

## Files

- Generator: `app/scripts/generateCurriculumQualityStatus.ts`
- JSON snapshot: `docs/qa-ci/status/curriculum-quality-status.json`
- Markdown snapshot: `docs/qa-ci/status/curriculum-quality-status.md`
- Workbench route: `/quality-dashboard`
- Local dev endpoint: `/__quality-dashboard/status`

Regenerate the snapshots with:

```bash
cd app
npm run quality:curriculum-status
```

## Maturity Levels

The dashboard reports one conservative maturity level per curriculum and, where available, per configured route scope.

| Level | Meaning |
| --- | --- |
| `M0` | Basic graph quality is visible: the curriculum loads, core graph checks pass, and type metadata is consistent. |
| `M1` | Bundesland projections have full atom-level coverage for every declared jurisdiction. |
| `M2` | Every configured learner-facing QA scope has a clean route from motivation through atomic learning goals to terminal autonomy. |
| `M3` | Terminal autonomy goals in every configured QA scope are exam-mode-capable via `examData` or an explicit reviewed exception convention. |
| `M4` | Review/readiness layer is clean: semantic atomicity is current, composition views exist, and no active or obsolete applicability warning debt remains. |

`M4` is intentionally strict. Most curricula will remain below it until explicit route profiles and review ledgers exist.

## Rule Families

The first rule catalog is versioned as `curriculum-quality-v1`.

| Rule | Target | Meaning |
| --- | --- | --- |
| `CQR-001` | `M0` | Basic graph integrity: IDs, local/global references, self-reference guards, and direct DAG checks. |
| `CQR-002` | `M0` | Explicit `type` metadata matches structural atomic/cluster classification. |
| `CQR-003` | `M1` | Bundesland atomic coverage: every declared jurisdiction projection exposes the full canonical atomic goal set. |
| `CQR-101` | `M2` | Effective full route coverage through `R_eff`: motivation anchor -> selected atomic goals -> terminal autonomy. |
| `CQR-102` | `M2` | Direct atomic route coverage through authored atomic `requires`. |
| `CQR-103` | `M2` | No route-scope cluster-level `requires` remain for ordinary sequencing. |
| `CQR-201` | `M3` | Terminal autonomy goals have `examData`. |
| `CQR-301` | `M4` | Semantic atomicity review ledgers for content leaf goals are complete, current, and resolved. |
| `CQR-401` | `M4` | At least one learner-facing composition view exists for the curriculum. |
| `CQR-501` | `M4` | Applicability warnings are split into active, accepted-current, and obsolete-accepted counts. |

`CQR-*` rules are dashboard/readiness rules. They complement `GVR-*`, `APV-*`, and `CPV-*` validators documented in `docs/qa-ci/graph-validation-rules.md`; they do not replace those validator families.

## Bundesland Coverage

The dashboard also persists and renders Bundesland coverage derived from the Applicability compiler.

For each canonical curriculum and each declared jurisdiction, the snapshot stores:

- visible goals,
- visible atomic goals,
- visible cluster goals,
- projection errors,
- projection warnings,
- atomic coverage percentage against the full canonical atomic goal count.

The table value `Bundeslaender` is `cleanJurisdictions / totalJurisdictions`, where a jurisdiction is complete only when the full canonical atomic goal set is visible and the projection has no warnings or errors. Lower values such as `1/392 atomare Ziele` remain visible in the detail panel as partial coverage, but they no longer satisfy the M1 milestone.

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

To bring canonical mathematics Sek I from `M1` toward `M3`:

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
