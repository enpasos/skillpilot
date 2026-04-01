# Canonical Gymnasium Mathematics Bundeslaender Status

Snapshot: `2026-04-01T00:00:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `6/16`
- State-weighted rollout score: `45.6%`
- States with active snapshots (`P2+`): `10/16`
- States with structural anchors mapped (`P3+`): `10/16`
- States with reviewed corridor (`P4+`): `10/16`
- States with broad coverage (`P5+`): `4/16`
- Active canonical corridors: `5/6`
- Priority `active`: `5`
- Priority `next_wave`: `3`
- Priority `backlog`: `8`

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
| `SEK1.J10.FUNCTION_FAMILIES` Sek I J10 function families | `active` | `DE-BY`, `DE-BW`, `DE-SH`, `DE-NI` | Treat the now-closed BY J10 exponential / trigonometric / polynomial strip as a canonical-quality checkpoint and continue only with equally explicit adjacent atoms instead of reopening broad generic function parents. |
| `SEK1.J10.5D_GEOMETRY` Sek I J10 bodies, volumes, and plausibility | `active` | `DE-BY`, `DE-BW`, `DE-SH` | Treat the inspected Schleswig-Holstein J10 5D bands as intentionally broad in the current snapshot: `Pyramiden und Kegel` and `Kugeln` do not yet expose narrower source atoms than the existing reviewed partial bridges, so further 5D tightening should wait for a cleaner source split instead of inventing new state-local canonical residue. |
| `SEK2.ANALYSIS` Sek II analysis and integral / exponential deepening | `active` | `DE-HE`, `DE-NW`, `DE-SH`, `DE-BW`, `DE-NI` | Treat the currently opened Schleswig-Holstein upper-secondary E-analysis strip, the explicit Baden-Wuerttemberg Euler-number leaf, and the Niedersachsen base-`e`, derivative-use, asymptotic-bounded-growth, context-asymptotics, growth-model-comparison, and exponential-equation leaves as exact-resolved at explicit source-residue level and keep tightening only equally explicit analysis atoms before reopening broad parents: the next clean move should prefer the adjacent Niedersachsen eA differential-equation solution-check atom or a retained split around the broad differential-equation parent instead of broad SH/BW/NI Q1/Q2 analysis parents. |
| `SEK2.GEOMETRY_LINEAR_ALGEBRA` Sek II geometry and linear algebra | `active` | `DE-NW`, `DE-BB`, `DE-BE`, `DE-SH`, `DE-BW` | Keep closing narrow canonical space-geometry atoms where the current NRW/BE/BB/SH/BW strips expose them cleanly; avoid broad umbrella cleanup as the primary steering unit. |
| `SEK2.STOCHASTICS` Sek II stochastics | `active` | `DE-NW`, `DE-BE`, `DE-BB`, `DE-SH`, `DE-NI`, `DE-BW` | Use the reviewed Nordrhein-Westfalen and Berlin/Brandenburg strips to stabilize canonical random-variable, distribution, test, and interval atoms before widening broad residual parents. |
| `SEK1.FOUNDATIONS` Sek I foundations, proportionality, and early algebra | `next_wave` | `DE-BW`, `DE-NW`, `DE-BB`, `DE-BE`, `DE-SH`, `DE-NI` | After the active J10 and Sek-II corridors settle, run a canonical-first coverage pass on the early Sek-I arithmetic / proportionality / algebra spine instead of treating those rows only as state-local cleanup. |

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
| `DE-HE` Hessen | `P5` Broad state coverage | `85%` | `yes` | `487` | `snapshots_active` | `active` |
| `DE-NW` Nordrhein-Westfalen | `P5` Broad state coverage | `85%` | `yes` | `118` | `snapshots_active` | `active` |
| `DE-BW` Baden-Wuerttemberg | `P4` First corridor reviewed | `65%` | `yes` | `165` | `snapshots_active` | `active` |
| `DE-NI` Niedersachsen | `P4` First corridor reviewed | `65%` | `yes` | `158` | `snapshots_active` | `active` |
| `DE-BB` Brandenburg | `P4` First corridor reviewed | `65%` | `yes` | `120` | `snapshots_active` | `next_wave` |
| `DE-BE` Berlin | `P4` First corridor reviewed | `65%` | `no` | `148` | `snapshots_active` | `next_wave` |
| `DE-SH` Schleswig-Holstein | `P4` First corridor reviewed | `65%` | `no` | `149` | `snapshots_active` | `next_wave` |
| `DE-HB` Bremen | `P5` Broad state coverage | `85%` | `no` | `68` | `snapshots_active` | `backlog` |
| `DE-HH` Hamburg | `P4` First corridor reviewed | `65%` | `no` | `64` | `snapshots_active` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-SL` Saarland | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-SN` Sachsen | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |
| `DE-TH` Thueringen | `P0` Placeholder | `0%` | `no` | `0` | `mapping_scaffolded` | `backlog` |

## Immediate queue

- `DE-BY` (`P5`, `active`): Keep Bavaria as the second broad comparison lane, but treat the opened M10 geometry plausibility strip as exhausted at explicit source-residue level and reassess whether the next clean 5D move should be broader state projection work in Baden-Wuerttemberg or Schleswig-Holstein rather than more Bavaria-local cleanup.
- `DE-HE` (`P5`, `active`): Keep Hessen as the precision baseline while broader mixed lanes in other states are being pressure-tested.
- `DE-NW` (`P5`, `active`): Treat the currently opened Nordrhein-Westfalen LK normal-distribution strip as exhausted at explicit source-residue level: the imported leaves for normal-distribution concept, approximation-in-situations, and mu/sigma are now exact-resolved, so further NRW widening should only happen if another equally explicit NRW corridor is imported; otherwise continue with the next active broad comparison lane such as Bayern instead of reopening broader parent cleanup inside the current NRW snapshots.
- `DE-BW` (`P4`, `active`): Treat the active BW lower-secondary pilot snapshot as source-exhausted but note that the tightened J10 5D corridor now also exact-resolves the Kugelformeln leaf; further 5D work should prefer Schleswig-Holstein projection cleanup or intentionally imported retained BW non-core sections instead of generic BW parent cleanup.
- `DE-NI` (`P4`, `active`): Treat the currently opened Niedersachsen Sek-I right-triangle / similarity and quadratics follow-ons as exhausted at explicit source-residue level; widen Niedersachsen further only if the next lower-secondary source corridor is imported cleanly or a separate Berufliches-Gymnasium lane is opened intentionally.
- `DE-BB` (`P4`, `next_wave`): Treat Brandenburg's current linear-representation/projection side lane as exhausted at the explicitly source-exposed residue level; only widen it further if a clearly exposed matrix / linear-model follow-on appears, otherwise return to Berlin optional-course residue or another Brandenburg strip with equally explicit source-to-canonical alignment.
- `DE-BE` (`P4`, `next_wave`): Treat the Berlin matrix/transition, sequences/series, differential-equations, complex-numbers, logic, and reasoning/proof side lanes as now also parent-anchored on the corresponding shared canonical clusters; widen Berlin further only where the remaining analysis-deepening or numerical-mathematics residues stay equally explicit, otherwise decide whether Brandenburg's new linear-representation/projection side lane should widen next.
- `DE-SH` (`P4`, `next_wave`): Treat the inspected SH J10 5D lower-secondary bands `Pyramiden und Kegel` and `Kugeln` as intentionally broad in the current snapshot, but treat the SH upper-secondary E-analysis strip plus the adjacent Q1 `e-Funktion` and source-split `Integralrechnung` leaves as exact-resolved at explicit source-residue level; the next clean SH move should avoid reopening broad Q1/Q2 analysis parents unless a genuinely narrower source split appears.

## Next steps

- `DE-BY`: Keep Bavaria as the second broad comparison lane, but treat the opened M10 geometry plausibility strip as exhausted at explicit source-residue level and reassess whether the next clean 5D move should be broader state projection work in Baden-Wuerttemberg or Schleswig-Holstein rather than more Bavaria-local cleanup.
- `DE-HE`: Keep Hessen as the precision baseline while broader mixed lanes in other states are being pressure-tested.
- `DE-NW`: Treat the currently opened Nordrhein-Westfalen LK normal-distribution strip as exhausted at explicit source-residue level: the imported leaves for normal-distribution concept, approximation-in-situations, and mu/sigma are now exact-resolved, so further NRW widening should only happen if another equally explicit NRW corridor is imported; otherwise continue with the next active broad comparison lane such as Bayern instead of reopening broader parent cleanup inside the current NRW snapshots.
- `DE-BW`: Treat the active BW lower-secondary pilot snapshot as source-exhausted but note that the tightened J10 5D corridor now also exact-resolves the Kugelformeln leaf; further 5D work should prefer Schleswig-Holstein projection cleanup or intentionally imported retained BW non-core sections instead of generic BW parent cleanup.
- `DE-NI`: Treat the currently opened Niedersachsen Sek-I right-triangle / similarity and quadratics follow-ons as exhausted at explicit source-residue level; widen Niedersachsen further only if the next lower-secondary source corridor is imported cleanly or a separate Berufliches-Gymnasium lane is opened intentionally.
- `DE-BB`: Treat Brandenburg's current linear-representation/projection side lane as exhausted at the explicitly source-exposed residue level; only widen it further if a clearly exposed matrix / linear-model follow-on appears, otherwise return to Berlin optional-course residue or another Brandenburg strip with equally explicit source-to-canonical alignment.
- `DE-BE`: Treat the Berlin matrix/transition, sequences/series, differential-equations, complex-numbers, logic, and reasoning/proof side lanes as now also parent-anchored on the corresponding shared canonical clusters; widen Berlin further only where the remaining analysis-deepening or numerical-mathematics residues stay equally explicit, otherwise decide whether Brandenburg's new linear-representation/projection side lane should widen next.
- `DE-SH`: Treat the inspected SH J10 5D lower-secondary bands `Pyramiden und Kegel` and `Kugeln` as intentionally broad in the current snapshot, but treat the SH upper-secondary E-analysis strip plus the adjacent Q1 `e-Funktion` and source-split `Integralrechnung` leaves as exact-resolved at explicit source-residue level; the next clean SH move should avoid reopening broad Q1/Q2 analysis parents unless a genuinely narrower source split appears.
- `DE-HB`: Use Bremen only as pressure test for shared function packaging unless the source lane is later split more finely.
- `DE-HH`: Only split the remaining broad Hamburg J8 mixed function corridor further if the source can separate A3, A4, F3, and F4 more cleanly.
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
