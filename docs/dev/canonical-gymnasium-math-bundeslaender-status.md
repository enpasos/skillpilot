# Canonical Gymnasium Mathematics Bundeslaender Status

Snapshot: `2026-03-28`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `5/16`
- State-weighted rollout score: `36.2%`
- States with active snapshots (`P2+`): `8/16`
- States with structural anchors mapped (`P3+`): `8/16`
- States with reviewed corridor (`P4+`): `8/16`
- States with broad coverage (`P5+`): `3/16`
- Priority `active`: `5`
- Priority `next_wave`: `3`
- Priority `backlog`: `8`

## Program phases

| Program phase | Status |
| --- | --- |
| `F0` Tracking scaffold | `completed` |
| `F1` Active five-state base | `in_progress` |
| `F2` Remaining source onboarding | `in_progress` |
| `F3` Nationwide first-corridor pass | `in_progress` |
| `F4` Lower-secondary breadth | `pending` |
| `F5` Upper-secondary breadth | `pending` |
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
| `DE-BY` Bayern | `P5` Broad state coverage | `85%` | `yes` | `267` | `archived_inputs` | `active` |
| `DE-HE` Hessen | `P5` Broad state coverage | `85%` | `yes` | `484` | `snapshots_active` | `active` |
| `DE-NW` Nordrhein-Westfalen | `P5` Broad state coverage | `85%` | `yes` | `94` | `snapshots_active` | `active` |
| `DE-BW` Baden-Wuerttemberg | `P4` First corridor reviewed | `65%` | `yes` | `165` | `snapshots_active` | `active` |
| `DE-NI` Niedersachsen | `P4` First corridor reviewed | `65%` | `yes` | `158` | `snapshots_active` | `active` |
| `DE-BB` Brandenburg | `P4` First corridor reviewed | `65%` | `no` | `120` | `snapshots_active` | `next_wave` |
| `DE-BE` Berlin | `P4` First corridor reviewed | `65%` | `no` | `148` | `snapshots_active` | `next_wave` |
| `DE-SH` Schleswig-Holstein | `P4` First corridor reviewed | `65%` | `no` | `147` | `snapshots_active` | `next_wave` |
| `DE-HB` Bremen | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-HH` Hamburg | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-SL` Saarland | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-SN` Sachsen | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-TH` Thueringen | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |

## Immediate queue

- `DE-BY` (`P5`, `active`): Use Bavaria as the second broad comparison lane and keep gap-closing work corridor-specific.
- `DE-HE` (`P5`, `active`): Keep Hessen as the stable reference baseline while other states broaden.
- `DE-NW` (`P5`, `active`): Broaden Nordrhein-Westfalen from its now multi-corridor lower-secondary prerequisite/functions and upper-secondary analysis, geometry/linear-algebra, adjacent LK parameter-form and LK-LGS strips, and four explicit stochastic pilot strips by narrowing to the remaining explicit `Parallelogramme und Dreiecke in Parameterform` residue, reflections, or another equally clear imported NRW corridor, rather than reopening parent cleanup inside the current NRW snapshots.
- `DE-BW` (`P4`, `active`): Treat the active BW lower-secondary pilot snapshot as exhausted at explicit source-residue level: there are no unmapped goals left inside the imported Sek-I snapshot, so further widening should happen only by intentionally importing additional retained non-core source sections or another BW source lane, while the reviewed Kursstufe pilot snapshot remains fully stable.
- `DE-NI` (`P4`, `active`): Treat the currently opened Niedersachsen Sek-I right-triangle / similarity and quadratics follow-ons as exhausted at explicit source-residue level; widen Niedersachsen further only if the next lower-secondary source corridor is imported cleanly or a separate Berufliches-Gymnasium lane is opened intentionally.
- `DE-BB` (`P4`, `next_wave`): Treat Brandenburg's current linear-representation/projection side lane as exhausted at the explicitly source-exposed residue level; only widen it further if a clearly exposed matrix / linear-model follow-on appears, otherwise return to Berlin optional-course residue or another Brandenburg strip with equally explicit source-to-canonical alignment.
- `DE-BE` (`P4`, `next_wave`): Treat the Berlin matrix/transition, sequences/series, differential-equations, complex-numbers, logic, and reasoning/proof side lanes as now also parent-anchored on the corresponding shared canonical clusters; widen Berlin further only where the remaining analysis-deepening or numerical-mathematics residues stay equally explicit, otherwise decide whether Brandenburg's new linear-representation/projection side lane should widen next.
- `DE-SH` (`P4`, `next_wave`): Treat the current SH upper-secondary follow-on lane as exhausted at the explicitly source-exposed residue level: after the E-geometry, Q1-geometry, E-analysis, Q1-analysis, the E- and Q1-stochastics splits, the narrowed Q2-stochastics follow-ons, the first explicit Q2-analysis parameter step, the narrow Q1 normal-distribution follow-on, the Q1 vector-product provenance step, and now also the retained Q2-analysis deepening residue being anchored on the shared deepening cluster, broaden SH further only if a genuinely new source-exposed Sek-II cell is split out; otherwise move the next wave to another jurisdiction.

## Next steps

- `DE-BY`: Use Bavaria as the second broad comparison lane and keep gap-closing work corridor-specific.
- `DE-HE`: Keep Hessen as the stable reference baseline while other states broaden.
- `DE-NW`: Broaden Nordrhein-Westfalen from its now multi-corridor lower-secondary prerequisite/functions and upper-secondary analysis, geometry/linear-algebra, adjacent LK parameter-form and LK-LGS strips, and four explicit stochastic pilot strips by narrowing to the remaining explicit `Parallelogramme und Dreiecke in Parameterform` residue, reflections, or another equally clear imported NRW corridor, rather than reopening parent cleanup inside the current NRW snapshots.
- `DE-BW`: Treat the active BW lower-secondary pilot snapshot as exhausted at explicit source-residue level: there are no unmapped goals left inside the imported Sek-I snapshot, so further widening should happen only by intentionally importing additional retained non-core source sections or another BW source lane, while the reviewed Kursstufe pilot snapshot remains fully stable.
- `DE-NI`: Treat the currently opened Niedersachsen Sek-I right-triangle / similarity and quadratics follow-ons as exhausted at explicit source-residue level; widen Niedersachsen further only if the next lower-secondary source corridor is imported cleanly or a separate Berufliches-Gymnasium lane is opened intentionally.
- `DE-BB`: Treat Brandenburg's current linear-representation/projection side lane as exhausted at the explicitly source-exposed residue level; only widen it further if a clearly exposed matrix / linear-model follow-on appears, otherwise return to Berlin optional-course residue or another Brandenburg strip with equally explicit source-to-canonical alignment.
- `DE-BE`: Treat the Berlin matrix/transition, sequences/series, differential-equations, complex-numbers, logic, and reasoning/proof side lanes as now also parent-anchored on the corresponding shared canonical clusters; widen Berlin further only where the remaining analysis-deepening or numerical-mathematics residues stay equally explicit, otherwise decide whether Brandenburg's new linear-representation/projection side lane should widen next.
- `DE-SH`: Treat the current SH upper-secondary follow-on lane as exhausted at the explicitly source-exposed residue level: after the E-geometry, Q1-geometry, E-analysis, Q1-analysis, the E- and Q1-stochastics splits, the narrowed Q2-stochastics follow-ons, the first explicit Q2-analysis parameter step, the narrow Q1 normal-distribution follow-on, the Q1 vector-product provenance step, and now also the retained Q2-analysis deepening residue being anchored on the shared deepening cluster, broaden SH further only if a genuinely new source-exposed Sek-II cell is split out; otherwise move the next wave to another jurisdiction.
- `DE-HB`: Archive the official Bremen mathematics source bundle under `curricula/DE/Gymnasium/input/HB/`, then derive the first lower-secondary and upper-secondary source snapshots before activating shared provenance.
- `DE-HH`: Archive the official Hamburg mathematics source bundle under `curricula/DE/Gymnasium/input/HH/`, then derive the first lower-secondary and upper-secondary source snapshots before activating shared provenance.
- `DE-MV`: Archive the official Mecklenburg-Vorpommern mathematics source bundle under `curricula/DE/Gymnasium/input/MV/`, then derive the first lower-secondary and upper-secondary source snapshots before activating shared provenance.
- `DE-RP`: Archive the official Rheinland-Pfalz mathematics source bundle under `curricula/DE/Gymnasium/input/RP/`, then derive the first lower-secondary and upper-secondary source snapshots before activating shared provenance.
- `DE-SL`: Archive the official Saarland mathematics source bundle under `curricula/DE/Gymnasium/input/SL/`, then derive the first lower-secondary and upper-secondary source snapshots before activating shared provenance.
- `DE-SN`: Archive the official Sachsen mathematics source bundle under `curricula/DE/Gymnasium/input/SN/`, then derive the first lower-secondary and upper-secondary source snapshots before activating shared provenance.
- `DE-ST`: Archive the official Sachsen-Anhalt mathematics source bundle under `curricula/DE/Gymnasium/input/ST/`, then derive the first lower-secondary and upper-secondary source snapshots before activating shared provenance.
- `DE-TH`: Archive the official Thueringen mathematics source bundle under `curricula/DE/Gymnasium/input/TH/`, then derive the first lower-secondary and upper-secondary source snapshots before activating shared provenance.

## Regeneration

```bash
python3 scripts/render_canonical_math_bundesland_status.py
```
