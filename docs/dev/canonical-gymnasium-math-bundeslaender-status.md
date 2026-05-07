# Canonical Gymnasium Mathematics Bundeslaender Status

Snapshot: `2026-05-07T07:44:05Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- `app/scripts/reportCanonicalMathStateAtomCounts.ts`
- `curricula/DE/Gymnasium/composition-views/mathematik`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `16/16`
- Operational state-weighted rollout score (count-gated): `85.9%`
- States with active snapshots (`P2+`): `16/16`
- States with structural anchors mapped (`P3+`): `16/16`
- States with reviewed corridor (`P4+`): `16/16`
- States with broad coverage (`P5+`): `16/16`
- States operationally cutover-ready (`P6` after count gate): `1/16`
- Active canonical corridors: `0/6`
- Atomic-count reference lane: `DE-HE` Hessen
- Hessen reference counts: `Sek I 105`, `Sek II (GK) 416`, `Sek II (LK) 483`
- Hessen corridor (`+-20%`): `Sek I 84-126`, `Sek II (GK) 333-499`, `Sek II (LK) 387-579`
- Non-reference states within corridor on all three stage counts: `0/15`
- Sek I within corridor: `5/15`
- Sek II (GK) within corridor: `0/15`
- Sek II (LK) within corridor: `0/15`
- Count-gated states blocked from `cutover_ready`: `15`
- Priority `active`: `10`
- Priority `next_wave`: `5`
- Priority `backlog`: `1`

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
| `DE-BW` Baden-Wuerttemberg | `82` | `63` | `73` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-BY` Bayern | `140` | `103` | `115` | `out` | Sek I high, Sek II (GK) low, Sek II (LK) low |
| `DE-HB` Bremen | `38` | `50` | `57` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-HH` Hamburg | `44` | `20` | `23` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-MV` Mecklenburg-Vorpommern | `42` | `1` | `1` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-RP` Rheinland-Pfalz | `35` | `12` | `15` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-SL` Saarland | `35` | `12` | `15` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-SN` Sachsen | `79` | `2` | `2` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-ST` Sachsen-Anhalt | `1` | `1` | `1` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-TH` Thueringen | `1` | `1` | `1` | `out` | Sek I low, Sek II (GK) low, Sek II (LK) low |
| `DE-BB` Brandenburg | `90` | `78` | `78` | `out` | Sek II (GK) low, Sek II (LK) low |
| `DE-BE` Berlin | `85` | `141` | `149` | `out` | Sek II (GK) low, Sek II (LK) low |
| `DE-NI` Niedersachsen | `103` | `91` | `104` | `out` | Sek II (GK) low, Sek II (LK) low |
| `DE-NW` Nordrhein-Westfalen | `97` | `77` | `90` | `out` | Sek II (GK) low, Sek II (LK) low |
| `DE-SH` Schleswig-Holstein | `105` | `55` | `55` | `out` | Sek II (GK) low, Sek II (LK) low |
| `DE-HE` Hessen | `105` | `416` | `483` | `reference` | reference lane `Hessen` |

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
| `DE-BW` Baden-Wuerttemberg | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `209` | `out` | `subtree_adopted` | `active` |
| `DE-BY` Bayern | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `351` | `out` | `subtree_adopted` | `active` |
| `DE-HB` Bremen | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `68` | `out` | `subtree_adopted` | `active` |
| `DE-HH` Hamburg | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `76` | `out` | `subtree_adopted` | `active` |
| `DE-MV` Mecklenburg-Vorpommern | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `59` | `out` | `subtree_adopted` | `active` |
| `DE-RP` Rheinland-Pfalz | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `65` | `out` | `subtree_adopted` | `active` |
| `DE-SL` Saarland | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `95` | `out` | `subtree_adopted` | `active` |
| `DE-SN` Sachsen | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `130` | `out` | `subtree_adopted` | `active` |
| `DE-ST` Sachsen-Anhalt | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `72` | `out` | `subtree_adopted` | `active` |
| `DE-TH` Thueringen | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `48` | `out` | `subtree_adopted` | `active` |
| `DE-BB` Brandenburg | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `159` | `out` | `subtree_adopted` | `next_wave` |
| `DE-BE` Berlin | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `187` | `out` | `subtree_adopted` | `next_wave` |
| `DE-NI` Niedersachsen | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `218` | `out` | `subtree_adopted` | `next_wave` |
| `DE-NW` Nordrhein-Westfalen | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `167` | `out` | `subtree_adopted` | `next_wave` |
| `DE-SH` Schleswig-Holstein | `P5` Broad state coverage | `P6` State cutover ready | `85%` | `yes` | `149` | `out` | `subtree_adopted` | `next_wave` |
| `DE-HE` Hessen | `P6` State cutover ready | `P6` State cutover ready | `100%` | `yes` | `486` | `reference` | `cutover_ready` | `backlog` |

## Immediate queue

- `DE-BW` (`P5`, `active`): Bring Baden-Wuerttemberg into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen. State-specific handling: Resolve the active Baden-Wuerttemberg quality corridor without overmapping: treat the official BP2016 source-extraction as source-internally closed, keep the 33 HE-covered canonical atoms that are not explicit in BW as documented state-view exclusions unless later source evidence contradicts this, route the 78 stage-shifted atoms through Sek-I closure/applicability instead of Kursstufen overmapping, and then reconcile the remaining learner-facing atom-count gap through reviewed applicability and composition-view scope rather than synthetic BW Kursstufe mappings.
- `DE-BY` (`P5`, `active`): Bring Bayern into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-HB` (`P5`, `active`): Bring Bremen into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-HH` (`P5`, `active`): Bring Hamburg into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-MV` (`P5`, `active`): Bring Mecklenburg-Vorpommern into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-RP` (`P5`, `active`): Bring Rheinland-Pfalz into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-SL` (`P5`, `active`): Bring Saarland into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-SN` (`P5`, `active`): Bring Sachsen into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-ST` (`P5`, `active`): Bring Sachsen-Anhalt into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-TH` (`P5`, `active`): Bring Thueringen into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-BB` (`P5`, `next_wave`): Bring Brandenburg into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-BE` (`P5`, `next_wave`): Bring Berlin into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-NI` (`P5`, `next_wave`): Bring Niedersachsen into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-NW` (`P5`, `next_wave`): Bring Nordrhein-Westfalen into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-SH` (`P5`, `next_wave`): Bring Schleswig-Holstein into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.

## Next steps

- `DE-BW`: Bring Baden-Wuerttemberg into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen. State-specific handling: Resolve the active Baden-Wuerttemberg quality corridor without overmapping: treat the official BP2016 source-extraction as source-internally closed, keep the 33 HE-covered canonical atoms that are not explicit in BW as documented state-view exclusions unless later source evidence contradicts this, route the 78 stage-shifted atoms through Sek-I closure/applicability instead of Kursstufen overmapping, and then reconcile the remaining learner-facing atom-count gap through reviewed applicability and composition-view scope rather than synthetic BW Kursstufe mappings.
- `DE-BY`: Bring Bayern into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-HB`: Bring Bremen into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-HH`: Bring Hamburg into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-MV`: Bring Mecklenburg-Vorpommern into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-RP`: Bring Rheinland-Pfalz into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-SL`: Bring Saarland into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-SN`: Bring Sachsen into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-ST`: Bring Sachsen-Anhalt into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-TH`: Bring Thueringen into the Hessen atomic-count corridor on `Sek I`, `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-BB`: Bring Brandenburg into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-BE`: Bring Berlin into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-NI`: Bring Niedersachsen into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-NW`: Bring Nordrhein-Westfalen into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-SH`: Bring Schleswig-Holstein into the Hessen atomic-count corridor on `Sek II (GK)`, `Sek II (LK)`: start with learner-facing mathematics composition views and applicability, then narrow any remaining gap through the smallest mapping/provenance delta that explains the missing visible atoms; do not treat the lane as `cutover_ready` until all stage counts stay within `+-20%` of Hessen.
- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, canonical mappings/provenance, applicability, and the state-scoped mathematics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.

## Regeneration

```bash
python3 scripts/render_canonical_math_bundesland_status.py
```
