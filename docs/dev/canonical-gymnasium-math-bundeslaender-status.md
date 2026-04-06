# Canonical Gymnasium Mathematics Bundeslaender Status

Snapshot: `2026-04-06T15:50:12Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- `app/scripts/reportCanonicalMathStateAtomCounts.ts`
- `curricula/DE/Gymnasium/composition-views/mathematik`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `16/16`
- Operational state-weighted rollout score (count-gated): `100.0%`
- States with active snapshots (`P2+`): `16/16`
- States with structural anchors mapped (`P3+`): `16/16`
- States with reviewed corridor (`P4+`): `16/16`
- States with broad coverage (`P5+`): `16/16`
- States operationally cutover-ready (`P6` after count gate): `16/16`
- Active canonical corridors: `0/6`
- Atomic-count reference lane: `DE-HE` Hessen
- Hessen reference counts: `Sek I 101`, `Sek II (GK) 288`, `Sek II (LK) 339`
- Hessen corridor (`+-20%`): `Sek I 81-121`, `Sek II (GK) 231-345`, `Sek II (LK) 272-406`
- Non-reference states within corridor on all three stage counts: `15/15`
- Sek I within corridor: `15/15`
- Sek II (GK) within corridor: `15/15`
- Sek II (LK) within corridor: `15/15`
- Count-gated states blocked from `cutover_ready`: `0`
- Priority `backlog`: `16`

## Steering model

- Primary work unit: `maintenance_delta`
- Canonical view rule: Treat the canonical DE mathematics view as a curated pedagogical source of truth, not as the raw union of all state-specific atoms.
- State view rule: Treat Bundesland views as projections that stay as close as possible to the canonical view while omitting atoms that would violate the local curriculum.
- Count gate rule: states outside the Hessen `+-20%` stage-count corridor are operationally capped at `P5` / `subtree_adopted` until the corridor passes.
- Execution sequence:
  - Archive or refresh the retained state source lane first, then narrow the affected curriculum delta to mappings, provenance, applicability, and composition scopes.
  - Only touch the reviewed canonical atoms and the smallest state-scoped mathematics composition views whose learner-facing tree shape really changes.
  - Re-run applicability, composition-view validation, canonical math scope coverage, status rendering, and CI before merging the maintenance delta.
- Canonical atom admission:
  - Add a canonical atom only if it improves the pedagogical completeness of the shared DE math graph.
  - Do not add canonical atoms only to mirror one state's packaging, table layout, or wording.
  - Prefer canonical subtree quality over short-term mapping convenience.

## Canonical corridor register

| Corridor | Status | Focus states | Next step |
| --- | --- | --- | --- |
| `SEK1.J10.FUNCTION_FAMILIES` Sek I J10 function families | `completed` | `DE-BY`, `DE-BW`, `DE-SH`, `DE-NI`, `DE-SN` | Treat the Sek-I J10 function-family sweep as closed for now: freeze the visible `F1-F5` surface including the late J10 continuation corridor, accept broad `9/10` or year-10 function lanes as resolved where the source remains mixed, and reopen only if a later reviewed lane or validator finding forces a real shared canonical gap beyond the current function surface. |
| `SEK1.J10.5D_GEOMETRY` Sek I J10 bodies, volumes, and plausibility | `completed` | `DE-BY`, `DE-BW`, `DE-SH` | Treat the Sek-I J10 bodies / volumes / plausibility sweep as closed for now: freeze the visible `G2-G7` surface together with the late J10 body and plausibility corridor, accept broad year-10 body bands as resolved where the source remains coarse, and reopen only if a later reviewed lane or validator finding forces a real shared canonical gap beyond the current geometry surface. |
| `SEK2.ANALYSIS` Sek II analysis and integral / exponential deepening | `completed` | `DE-HE`, `DE-NW`, `DE-SH`, `DE-BW`, `DE-BY`, `DE-NI`, `DE-SN` | Treat the Sek-II analysis full sweep as closed for now: freeze the visible `AN2-AN4` surface, keep residue control quiet, and reopen only if a later reviewed lane or validator finding forces a real shared canonical gap. |
| `SEK2.GEOMETRY_LINEAR_ALGEBRA` Sek II geometry and linear algebra | `completed` | `DE-NW`, `DE-BB`, `DE-BE`, `DE-SH`, `DE-BW`, `DE-BY`, `DE-SN`, `DE-RP` | Treat the Sek-II geometry / linear-algebra full sweep as closed for now: freeze the visible `AGV1-AGV5` and `LM2-LM5` surfaces, accept broad overview lanes as resolved where the source remains corridor-level, and reopen only if a later reviewed lane or validator finding forces a real shared canonical gap. |
| `SEK2.STOCHASTICS` Sek II stochastics | `completed` | `DE-NW`, `DE-BE`, `DE-BB`, `DE-SH`, `DE-NI`, `DE-BW`, `DE-BY`, `DE-SN` | Treat the Sek-II stochastics full sweep as closed for now: freeze the visible `ST2-ST5` surface plus the explicit `ST3` boundary, and reopen only if a later reviewed lane or validator finding forces a real shared canonical gap. |
| `SEK1.FOUNDATIONS` Sek I lower-secondary breadth | `completed` | `DE-BW`, `DE-BY`, `DE-BE`, `DE-BB`, `DE-NI` | Treat the nationwide lower-secondary breadth sweep as closed for now: all top-level Sek-I rows are resolved once, freeze the visible `A1-A4`, `F1-F5`, `G2-G7`, and `D1-D5` surfaces, and shift the active nationwide completion work to applicability, learner-facing scope selection, and `P6/F6` cutover cleanup. |

## Atomic count corridor

Hessen (`DE-HE`) is the reference lane. All other states should stay within `+-20%` of the Hessen stage counts.

Operational gate: out-of-corridor states are capped at `P5` / `subtree_adopted`. Full three-stage failures escalate to `active`, partial failures to `next_wave`.

| State | Sek I | Sek II (GK) | Sek II (LK) | Corridor | Detail |
| --- | ---: | ---: | ---: | --- | --- |
| `DE-BB` Brandenburg | `98` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-BE` Berlin | `94` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-BW` Baden-Wuerttemberg | `82` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-BY` Bayern | `120` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-HB` Bremen | `98` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-HE` Hessen | `101` | `288` | `339` | `reference` | reference lane `Hessen` |
| `DE-HH` Hamburg | `97` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-MV` Mecklenburg-Vorpommern | `83` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-NI` Niedersachsen | `97` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-NW` Nordrhein-Westfalen | `95` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-RP` Rheinland-Pfalz | `82` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-SH` Schleswig-Holstein | `94` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-SL` Saarland | `88` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-SN` Sachsen | `89` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-ST` Sachsen-Anhalt | `90` | `333` | `394` | `ok` | all stage counts within Hessen corridor |
| `DE-TH` Thueringen | `83` | `267` | `315` | `ok` | all stage counts within Hessen corridor |

## Program phases

| Program phase | Status |
| --- | --- |
| `F0` Tracking scaffold | `completed` |
| `F1` Active five-state base | `completed` |
| `F2` Remaining source onboarding | `completed` |
| `F3` Nationwide first-corridor pass | `completed` |
| `F4` Lower-secondary breadth | `completed` |
| `F5` Upper-secondary breadth | `completed` |
| `F6` Cutover and maintenance | `active` |

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

| State | Operational phase | Tracked phase | Score | Applicability | Mappings | Count corridor | Source stage | Priority |
| --- | --- | --- | ---: | --- | ---: | --- | --- | --- |
| `DE-BB` Brandenburg | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `159` | `ok` | `cutover_ready` | `backlog` |
| `DE-BE` Berlin | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `187` | `ok` | `cutover_ready` | `backlog` |
| `DE-BW` Baden-Wuerttemberg | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `190` | `ok` | `cutover_ready` | `backlog` |
| `DE-BY` Bayern | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `351` | `ok` | `cutover_ready` | `backlog` |
| `DE-HB` Bremen | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `68` | `ok` | `cutover_ready` | `backlog` |
| `DE-HE` Hessen | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `488` | `reference` | `cutover_ready` | `backlog` |
| `DE-HH` Hamburg | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `76` | `ok` | `cutover_ready` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `59` | `ok` | `cutover_ready` | `backlog` |
| `DE-NI` Niedersachsen | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `218` | `ok` | `cutover_ready` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `167` | `ok` | `cutover_ready` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `65` | `ok` | `cutover_ready` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `149` | `ok` | `cutover_ready` | `backlog` |
| `DE-SL` Saarland | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `95` | `ok` | `cutover_ready` | `backlog` |
| `DE-SN` Sachsen | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `130` | `ok` | `cutover_ready` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `72` | `ok` | `cutover_ready` | `backlog` |
| `DE-TH` Thueringen | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `48` | `ok` | `cutover_ready` | `backlog` |

## Immediate queue

- none (`F6` complete; maintenance-only deltas remain)

## Next steps

- `DE-BB`: Keep Brandenburg on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-BE`: Keep Berlin on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-BW`: Keep Baden-Wuerttemberg on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-BY`: Keep Bayern on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-HB`: Keep Bremen on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-HH`: Keep Hamburg on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-MV`: Keep Mecklenburg-Vorpommern on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-NI`: Keep Niedersachsen on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-NW`: Keep Nordrhein-Westfalen on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-RP`: Keep Rheinland-Pfalz on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-SH`: Keep Schleswig-Holstein on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-SL`: Keep Saarland on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-SN`: Keep Sachsen on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-ST`: Keep Sachsen-Anhalt on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-TH`: Keep Thueringen stable as a cutover-ready comparison lane; only revisit it when later source imports justify additional Sek-I breadth or when the remaining blocked mapped clusters need explicit follow-on review.

## Regeneration

```bash
python3 scripts/render_canonical_math_bundesland_status.py
```
