# Canonical Gymnasium Mathematics Bundeslaender Status

Snapshot: `2026-03-27`

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
| `DE-NW` Nordrhein-Westfalen | `P5` Broad state coverage | `85%` | `yes` | `42` | `snapshots_active` | `active` |
| `DE-BW` Baden-Wuerttemberg | `P4` First corridor reviewed | `65%` | `yes` | `139` | `snapshots_active` | `active` |
| `DE-NI` Niedersachsen | `P4` First corridor reviewed | `65%` | `yes` | `149` | `snapshots_active` | `active` |
| `DE-BB` Brandenburg | `P4` First corridor reviewed | `65%` | `no` | `83` | `snapshots_active` | `next_wave` |
| `DE-BE` Berlin | `P4` First corridor reviewed | `65%` | `no` | `76` | `snapshots_active` | `next_wave` |
| `DE-SH` Schleswig-Holstein | `P4` First corridor reviewed | `65%` | `no` | `121` | `snapshots_active` | `next_wave` |
| `DE-HB` Bremen | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-HH` Hamburg | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-SL` Saarland | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-SN` Sachsen | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-TH` Thueringen | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |

## Immediate queue

- `DE-BY` (`P5`, `active`): Use Bavaria as the second broad comparison lane and keep gap-closing work corridor-specific.
- `DE-HE` (`P5`, `active`): Keep Hessen as the stable reference baseline while other states broaden.
- `DE-NW` (`P5`, `active`): Broaden from corridor coverage toward broad state coverage.
- `DE-BW` (`P4`, `active`): Close the remaining BW lower-secondary fine-grained residue outside the now active power, geometry, vector, differential-technique, and stochastics strips, especially the still-open algebra/equation rows in 3.2.1 / 3.3.1, then disposition the still-open non-core source sections while the Kursstufe pilot snapshot remains fully reviewed.
- `DE-NI` (`P4`, `active`): Move the Niedersachsen widening to the next Sek-I geometry / algebra corridor unless a separate Berufliches-Gymnasium lane is opened intentionally, because the first shared general-Gymnasium upper-secondary pilot surface is now exhausted.
- `DE-BB` (`P4`, `next_wave`): Keep widening the shared Brandenburg/Berlin lower-secondary lane beyond the now active functions and algebra/equation corridors, then choose whether the next reviewed move stays on that shared Sek-I spine or returns to another active upper-secondary follow-on lane.
- `DE-BE` (`P4`, `next_wave`): Keep widening the shared Brandenburg/Berlin lower-secondary lane beyond the now active functions and algebra/equation corridors, then choose whether the next reviewed move stays on that shared Sek-I spine or returns to another active upper-secondary follow-on lane.
- `DE-SH` (`P4`, `next_wave`): Use the now fully refined SH Sek-I lane to keep widening reviewed canonical coverage beyond the current corridor-level bridges, next likely by revisiting remaining broad atom bridges such as `Funktionen`.

## Next steps

- `DE-BY`: Use Bavaria as the second broad comparison lane and keep gap-closing work corridor-specific.
- `DE-HE`: Keep Hessen as the stable reference baseline while other states broaden.
- `DE-NW`: Broaden from corridor coverage toward broad state coverage.
- `DE-BW`: Close the remaining BW lower-secondary fine-grained residue outside the now active power, geometry, vector, differential-technique, and stochastics strips, especially the still-open algebra/equation rows in 3.2.1 / 3.3.1, then disposition the still-open non-core source sections while the Kursstufe pilot snapshot remains fully reviewed.
- `DE-NI`: Move the Niedersachsen widening to the next Sek-I geometry / algebra corridor unless a separate Berufliches-Gymnasium lane is opened intentionally, because the first shared general-Gymnasium upper-secondary pilot surface is now exhausted.
- `DE-BB`: Keep widening the shared Brandenburg/Berlin lower-secondary lane beyond the now active functions and algebra/equation corridors, then choose whether the next reviewed move stays on that shared Sek-I spine or returns to another active upper-secondary follow-on lane.
- `DE-BE`: Keep widening the shared Brandenburg/Berlin lower-secondary lane beyond the now active functions and algebra/equation corridors, then choose whether the next reviewed move stays on that shared Sek-I spine or returns to another active upper-secondary follow-on lane.
- `DE-SH`: Use the now fully refined SH Sek-I lane to keep widening reviewed canonical coverage beyond the current corridor-level bridges, next likely by revisiting remaining broad atom bridges such as `Funktionen`.
- `DE-HB`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-HH`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-MV`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-RP`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-SL`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-SN`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-ST`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-TH`: Archive the official math source bundle and create the first state mapping lane scaffold.

## Regeneration

```bash
python3 scripts/render_canonical_math_bundesland_status.py
```
