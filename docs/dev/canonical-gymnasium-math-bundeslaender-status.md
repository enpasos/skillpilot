# Canonical Gymnasium Mathematics Bundeslaender Status

Snapshot: `2026-03-25`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `5/16`
- State-weighted rollout score: `30.9%`
- States with active snapshots (`P2+`): `7/16`
- States with structural anchors mapped (`P3+`): `7/16`
- States with reviewed corridor (`P4+`): `7/16`
- States with broad coverage (`P5+`): `2/16`
- Priority `active`: `5`
- Priority `next_wave`: `2`
- Priority `backlog`: `9`

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
| `DE-BW` Baden-Wuerttemberg | `P4` First corridor reviewed | `65%` | `yes` | `77` | `snapshots_active` | `active` |
| `DE-NI` Niedersachsen | `P4` First corridor reviewed | `65%` | `yes` | `149` | `snapshots_active` | `active` |
| `DE-NW` Nordrhein-Westfalen | `P4` First corridor reviewed | `65%` | `yes` | `42` | `snapshots_active` | `active` |
| `DE-BB` Brandenburg | `P4` First corridor reviewed | `65%` | `no` | `76` | `snapshots_active` | `next_wave` |
| `DE-BE` Berlin | `P4` First corridor reviewed | `65%` | `no` | `64` | `snapshots_active` | `next_wave` |
| `DE-HB` Bremen | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-HH` Hamburg | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-SL` Saarland | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-SN` Sachsen | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |
| `DE-TH` Thueringen | `P0` Placeholder | `0%` | `no` | `0` | `placeholder_only` | `backlog` |

## Immediate queue

- `DE-BY` (`P5`, `active`): Use Bavaria as the second broad comparison lane and keep gap-closing work corridor-specific.
- `DE-HE` (`P5`, `active`): Keep Hessen as the stable reference baseline while other states broaden.
- `DE-BW` (`P4`, `active`): Advance the next active Bundesland lane while the Baden-Wuerttemberg Kursstufe pilot snapshot now sits on a fully reviewed retain-split surface.
- `DE-NI` (`P4`, `active`): Move the Niedersachsen widening to the next Sek-I geometry / algebra corridor unless a separate Berufliches-Gymnasium lane is opened intentionally, because the first shared general-Gymnasium upper-secondary pilot surface is now exhausted.
- `DE-NW` (`P4`, `active`): Broaden from corridor coverage toward broad state coverage.
- `DE-BB` (`P4`, `next_wave`): Widen the Brandenburg lower-secondary lane beyond the first functions corridor while the shared BE/BB overlap stays tight.
- `DE-BE` (`P4`, `next_wave`): Widen the Berlin upper-secondary lane from the active Q4 distribution-and-binomial corridor toward the first Q4 inference, tests, and normal-approximation follow-on corridor.

## Next steps

- `DE-BY`: Use Bavaria as the second broad comparison lane and keep gap-closing work corridor-specific.
- `DE-HE`: Keep Hessen as the stable reference baseline while other states broaden.
- `DE-BW`: Advance the next active Bundesland lane while the Baden-Wuerttemberg Kursstufe pilot snapshot now sits on a fully reviewed retain-split surface.
- `DE-NI`: Move the Niedersachsen widening to the next Sek-I geometry / algebra corridor unless a separate Berufliches-Gymnasium lane is opened intentionally, because the first shared general-Gymnasium upper-secondary pilot surface is now exhausted.
- `DE-NW`: Broaden from corridor coverage toward broad state coverage.
- `DE-BB`: Widen the Brandenburg lower-secondary lane beyond the first functions corridor while the shared BE/BB overlap stays tight.
- `DE-BE`: Widen the Berlin upper-secondary lane from the active Q4 distribution-and-binomial corridor toward the first Q4 inference, tests, and normal-approximation follow-on corridor.
- `DE-HB`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-HH`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-MV`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-RP`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-SH`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-SL`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-SN`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-ST`: Archive the official math source bundle and create the first state mapping lane scaffold.
- `DE-TH`: Archive the official math source bundle and create the first state mapping lane scaffold.

## Regeneration

```bash
python3 scripts/render_canonical_math_bundesland_status.py
```
