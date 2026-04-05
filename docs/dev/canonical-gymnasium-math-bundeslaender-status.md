# Canonical Gymnasium Mathematics Bundeslaender Status

Snapshot: `2026-04-05T17:20:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `12/16`
- State-weighted rollout score: `85.0%`
- States with active snapshots (`P2+`): `16/16`
- States with structural anchors mapped (`P3+`): `16/16`
- States with reviewed corridor (`P4+`): `16/16`
- States with broad coverage (`P5+`): `16/16`
- Active canonical corridors: `2/6`
- Priority `active`: `3`
- Priority `backlog`: `13`

## Steering model

- Primary work unit: `canonical_corridor`
- Canonical view rule: Treat the canonical DE mathematics view as a curated pedagogical source of truth, not as the raw union of all state-specific atoms.
- State view rule: Treat Bundesland views as projections that stay as close as possible to the canonical view while omitting atoms that would violate the local curriculum.
- Execution sequence:
  - Refine one canonical corridor until its atomic inventory and internal progression are pedagogically round.
  - Map that corridor against all 16 state curricula and classify each reviewed bridge as exact, partial, not_applicable, or state_local.
  - Only then stabilize state-scoped composition views and learner-facing cluster shapes for the affected scopes.
- Canonical atom admission:
  - Add a canonical atom only if it improves the pedagogical completeness of the shared DE math graph.
  - Do not add canonical atoms only to mirror one state's packaging, table layout, or wording.
  - Prefer canonical subtree quality over short-term mapping convenience.

## Canonical corridor register

| Corridor | Status | Focus states | Next step |
| --- | --- | --- | --- |
| `SEK1.J10.FUNCTION_FAMILIES` Sek I J10 function families | `active` | `DE-BY`, `DE-BW`, `DE-SH`, `DE-NI`, `DE-SN` | Treat the now-closed BY J10 exponential / trigonometric strip and the newly opened Sachsen K10 function strip as canonical-quality checkpoints, and continue only with equally explicit adjacent atoms instead of reopening broad generic function parents. |
| `SEK1.J10.5D_GEOMETRY` Sek I J10 bodies, volumes, and plausibility | `active` | `DE-BY`, `DE-BW`, `DE-SH` | Treat the inspected Schleswig-Holstein J10 5D bands as intentionally broad in the current snapshot: `Pyramiden und Kegel` and `Kugeln` do not yet expose narrower source atoms than the existing reviewed partial bridges, so further 5D tightening should wait for a cleaner source split instead of inventing new state-local canonical residue. |
| `SEK2.ANALYSIS` Sek II analysis and integral / exponential deepening | `completed` | `DE-HE`, `DE-NW`, `DE-SH`, `DE-BW`, `DE-BY`, `DE-NI`, `DE-SN` | Treat the Sek-II analysis full sweep as closed for now: freeze the visible `AN2-AN4` surface, keep residue control quiet, and reopen only if a later reviewed lane or validator finding forces a real shared canonical gap. |
| `SEK2.GEOMETRY_LINEAR_ALGEBRA` Sek II geometry and linear algebra | `completed` | `DE-NW`, `DE-BB`, `DE-BE`, `DE-SH`, `DE-BW`, `DE-BY`, `DE-SN`, `DE-RP` | Treat the Sek-II geometry / linear-algebra full sweep as closed for now: freeze the visible `AGV1-AGV5` and `LM2-LM5` surfaces, accept broad overview lanes as resolved where the source remains corridor-level, and reopen only if a later reviewed lane or validator finding forces a real shared canonical gap. |
| `SEK2.STOCHASTICS` Sek II stochastics | `completed` | `DE-NW`, `DE-BE`, `DE-BB`, `DE-SH`, `DE-NI`, `DE-BW`, `DE-BY`, `DE-SN` | Treat the Sek-II stochastics full sweep as closed for now: freeze the visible `ST2-ST5` surface plus the explicit `ST3` boundary, and reopen only if a later reviewed lane or validator finding forces a real shared canonical gap. |
| `SEK1.FOUNDATIONS` Sek I lower-secondary breadth | `completed` | `DE-BW`, `DE-BY`, `DE-BE`, `DE-BB`, `DE-NI` | Treat the nationwide lower-secondary breadth sweep as closed for now: all top-level Sek-I rows are resolved once, freeze the visible `A1-A4`, `F1-F5`, `G2-G7`, and `D1-D5` surfaces, and shift the active nationwide completion work to applicability, learner-facing scope selection, and `P6/F6` cutover cleanup. |

## Program phases

| Program phase | Status |
| --- | --- |
| `F0` Tracking scaffold | `completed` |
| `F1` Active five-state base | `in_progress` |
| `F2` Remaining source onboarding | `in_progress` |
| `F3` Nationwide first-corridor pass | `in_progress` |
| `F4` Lower-secondary breadth | `completed` |
| `F5` Upper-secondary breadth | `completed` |
| `F6` Cutover and maintenance | `pending` |

## State phase scale

| Phase | Score | Meaning |
| --- | ---: | --- |
| `P0` Placeholder | `0%` | README/source links only, no active math rollout lane. |
| `P1` Source archived | `15%` | Math source material is archived in the DE-level input lane. |
| `P2` Snapshots active | `30%` | Math source snapshots and provenance are active. |
| `P3` Anchors mapped | `50%` | Canonical structural anchors are mapped on the shared spine. |
| `P4` First corridor reviewed | `65%` | At least one didactically closed reviewed corridor is mapped. |
| `P5` Broad state coverage | `85%` | The state has broad reviewed coverage across the main math spine. |
| `P6` State cutover ready | `100%` | The state is operationally ready on the canonical math landscape. |

## State view

| State | Phase | Score | Applicability | Mappings | Source stage | Priority |
| --- | --- | ---: | --- | ---: | --- | --- |
| `DE-BY` Bayern | `P5` Broad state coverage | `85%` | `yes` | `351` | `archived_inputs` | `active` |
| `DE-HE` Hessen | `P5` Broad state coverage | `85%` | `yes` | `487` | `snapshots_active` | `active` |
| `DE-NW` Nordrhein-Westfalen | `P5` Broad state coverage | `85%` | `yes` | `167` | `broad_reviewed_coverage` | `active` |
| `DE-BB` Brandenburg | `P5` Broad state coverage | `85%` | `yes` | `159` | `broad_reviewed_coverage` | `backlog` |
| `DE-BE` Berlin | `P5` Broad state coverage | `85%` | `yes` | `187` | `broad_reviewed_coverage` | `backlog` |
| `DE-BW` Baden-Wuerttemberg | `P5` Broad state coverage | `85%` | `yes` | `190` | `broad_reviewed_coverage` | `backlog` |
| `DE-HB` Bremen | `P5` Broad state coverage | `85%` | `no` | `68` | `snapshots_active` | `backlog` |
| `DE-HH` Hamburg | `P5` Broad state coverage | `85%` | `yes` | `76` | `broad_reviewed_coverage` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P5` Broad state coverage | `85%` | `no` | `59` | `broad_reviewed_coverage` | `backlog` |
| `DE-NI` Niedersachsen | `P5` Broad state coverage | `85%` | `yes` | `218` | `broad_reviewed_coverage` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P5` Broad state coverage | `85%` | `no` | `65` | `broad_reviewed_coverage` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P5` Broad state coverage | `85%` | `yes` | `149` | `broad_reviewed_coverage` | `backlog` |
| `DE-SL` Saarland | `P5` Broad state coverage | `85%` | `yes` | `95` | `broad_reviewed_coverage` | `backlog` |
| `DE-SN` Sachsen | `P5` Broad state coverage | `85%` | `yes` | `130` | `broad_reviewed_coverage` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P5` Broad state coverage | `85%` | `yes` | `72` | `broad_reviewed_coverage` | `backlog` |
| `DE-TH` Thueringen | `P5` Broad state coverage | `85%` | `no` | `48` | `broad_reviewed_coverage` | `backlog` |

## Immediate queue

- `DE-BY` (`P5`, `active`): Keep Bavaria as the second broad comparison lane, but widen BY further only where another equally explicit retained upper-secondary source strip appears instead of reopening broad parent cleanup. The current M12-2, M12-3, M12-4, and M13-2 retained parent lanes are now structurally closed, with the explicit M12-3 error-probability and rejection-region leaves plus the M13-2 discrete-vs-continuous and bell-shaped empirical-normality leaves atomically resolved; the remaining Statistik-module leaves should now only be tightened if a future canonical regression/correlation strip or a non-binomial test strip is introduced.
- `DE-HE` (`P5`, `active`): Keep Hessen as the precision baseline while broader mixed lanes in other states are being pressure-tested.
- `DE-NW` (`P5`, `active`): Keep Nordrhein-Westfalen as a stable broad reviewed comparison lane. Further NRW tightening should now wait for another equally explicit retained corridor instead of renewed cleanup inside the already reviewed lower-secondary prerequisite, functions, data/chance, or geometry slices.

## Next steps

- `DE-BY`: Keep Bavaria as the second broad comparison lane, but widen BY further only where another equally explicit retained upper-secondary source strip appears instead of reopening broad parent cleanup. The current M12-2, M12-3, M12-4, and M13-2 retained parent lanes are now structurally closed, with the explicit M12-3 error-probability and rejection-region leaves plus the M13-2 discrete-vs-continuous and bell-shaped empirical-normality leaves atomically resolved; the remaining Statistik-module leaves should now only be tightened if a future canonical regression/correlation strip or a non-binomial test strip is introduced.
- `DE-HE`: Keep Hessen as the precision baseline while broader mixed lanes in other states are being pressure-tested.
- `DE-NW`: Keep Nordrhein-Westfalen as a stable broad reviewed comparison lane. Further NRW tightening should now wait for another equally explicit retained corridor instead of renewed cleanup inside the already reviewed lower-secondary prerequisite, functions, data/chance, or geometry slices.
- `DE-BB`: Keep Brandenburg stable as a broad reviewed comparison lane; further widening should now wait for another equally explicit retained slice while the nationwide canonical math work shifts from topic-row breadth to applicability and cutover cleanup.
- `DE-BE`: Keep Berlin stable as a broad reviewed comparison lane; further widening should now wait for another equally explicit retained slice while the nationwide canonical math work shifts from topic-row breadth to applicability and cutover cleanup.
- `DE-BW`: Keep Baden-Wuerttemberg stable as a broad reviewed comparison lane. The retained BF/LF plane-form leaves, the BF point-reflection leaf, the BF point-plane-distance leaf, the LF Hesse-normal-form / distance leaf, both BF/LF angle / intersection-angle leaves, and the LF Fehler-1/2-Art leaf are now exact-resolved; the mixed LF reflection leaf now also sits on the dedicated reflection surface instead of a broad modeling surface, the mixed histogram/rejection-region leaf now sits on the broader hypothesis-test surface instead of the too narrow critical-values atom, and the null-hypothesis-only leaf now also sits on that broader hypothesis-test surface instead of the too narrow null-and-alternative atom. Tighten BW further only where another equally explicit upper-secondary geometry or stochastics leaf warrants an atomic pass.
- `DE-HB`: Use Bremen only as pressure test for shared function packaging unless the source lane is later split more finely.
- `DE-HH`: Keep Hamburg stable as a broad reviewed comparison lane and move the next implementation step to the next still-open state lane.
- `DE-MV`: Keep Mecklenburg-Vorpommern stable as a broad reviewed comparison lane and move the next implementation step to deriving the first Thueringen source snapshots from the now archived input bundle.
- `DE-NI`: Keep Niedersachsen stable as a broad reviewed comparison lane while the nationwide canonical math work shifts from topic-row breadth to applicability, learner-facing scope stabilization, and `P6/F6` cutover cleanup.
- `DE-RP`: Keep Rheinland-Pfalz stable as a broad reviewed comparison lane and move the next implementation step to the next still-open state lane.
- `DE-SH`: Keep Schleswig-Holstein stable as a broad reviewed comparison lane and tighten it further only if another equally explicit retained upper-secondary stochastics or geometry leaf warrants an atomic pass.
- `DE-SL`: Keep Saarland stable as a broad reviewed comparison lane and move the next implementation step to the next still-open state lane.
- `DE-SN`: Keep Sachsen stable as a broad reviewed comparison lane and move the next implementation step to the next still-open state lane.
- `DE-ST`: Keep Sachsen-Anhalt stable as a broad reviewed comparison lane and move the next implementation step to the next still-open state lane.
- `DE-TH`: Keep Thueringen stable as a broad reviewed comparison lane and move the next implementation step to the next still-open state lane.

## Regeneration

```bash
python3 scripts/render_canonical_math_bundesland_status.py
```
