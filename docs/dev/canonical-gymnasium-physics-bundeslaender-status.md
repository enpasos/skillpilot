# Canonical Gymnasium Physics Bundeslaender Status

Snapshot: `2026-04-11T00:00:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- `scripts/render_canonical_physics_bundesland_status.py`

## Headline

- Tracked states: `4`
- Canonical source coverage present: `4/4`
- States with active snapshots (`P2+`): `4/4`
- States with structural anchors mapped (`P3+`): `4/4`
- States with reviewed corridor (`P4+`): `4/4`
- States with broad coverage (`P5+`): `2/4`
- States operationally cutover-ready (`P6`): `2/4`
- Active canonical corridors: `2/3`
- Priority `active`: `1`

## Steering model

- Primary work unit: `narrow_reviewed_corridor`
- Canonical view rule: Treat the canonical DE Physics landscape as a curated pedagogical source of truth, not as the raw union of all state-specific package structures.
- State view rule: Treat Bundesland views as projections that stay as close as possible to the canonical Physics tree while omitting or deferring atoms that would overclaim the local curriculum.
- Execution sequence:
  - Archive or refresh the retained state source lane first, then narrow the affected delta to mappings, provenance, applicability, and only the learner-facing views that really change.
  - Prefer reviewed source splits and conservative partial bridges over premature canonical atom growth when the current shared Physics surface is still semantically narrower or broader than the source wording.
  - Re-run the standard Physics mapping, applicability, and runtime fences before merging the rollout delta.
- Canonical atom admission:
  - Add a canonical Physics atom only if it improves the pedagogical completeness of the shared DE graph.
  - Do not add canonical atoms only to mirror one state's package wording or to avoid a temporary source-led residual.
  - Prefer canonical subtree quality over short-term mapping convenience.

## Canonical corridor register

| Corridor | Status | Focus states | Next step |
| --- | --- | --- | --- |
| `M1.HE_BY_HARDENED_BASE` Hessen and Bayern hardened base | `completed` | `DE-HE`, `DE-BY` | Treat the Hessen/Bayern base as maintenance-only: refresh retained source snapshots, mappings, provenance, applicability, and state-scoped composition views together whenever a curriculum revision changes visible Physics scope. |
| `SEK2.NW.UPPER_SECONDARY` Nordrhein-Westfalen upper-secondary narrow corridor lane | `active` | `DE-NW` | Keep the NRW upper-secondary Physics lane narrow and reviewed: prefer another clean source-led corridor or a genuinely missing canonical micro-surface over inventing NRW-specific composition views or overclaiming the remaining matter residue. |
| `SEK2.BW.UPPER_SECONDARY_ENTRY` Baden-Wuerttemberg upper-secondary first entry lane | `active` | `DE-BW` | Keep the BW upper-secondary Physics lane narrow and reviewed: prefer the adjacent Leistungsfach-`Wellenoptik`-Interferenzstreifen before inventing BW-specific Physics composition views or a broader applicability sweep. |

## Program phases

| Program phase | Status |
| --- | --- |
| `F0` Tracking scaffold | `completed` |
| `F1` Hessen and Bayern hardened base | `completed` |
| `F2` Third-state activation | `completed` |
| `F3` Repeatable multi-state rollout | `active` |

## State phase scale

| Phase | Score | Meaning |
| --- | ---: | --- |
| `P0` Placeholder | `0%` | README/source links only, no active Physics rollout lane. |
| `P1` Source archived | `15%` | Physics source material is archived in the DE-level input lane. |
| `P2` Snapshots active | `30%` | Physics source snapshots and provenance are active. |
| `P3` Anchors mapped | `50%` | Canonical structural anchors are mapped on the shared Physics spine. |
| `P4` First corridor reviewed | `65%` | At least one didactically closed reviewed Physics corridor is mapped. |
| `P5` Broad state coverage | `85%` | The state has broad reviewed coverage across the active Physics spine. |
| `P6` State cutover ready | `100%` | The state is operationally ready on the canonical Physics landscape. |

## State view

| State | Operational phase | Score | Applicability | Mappings | Source stage | Priority |
| --- | --- | ---: | --- | ---: | --- | --- |
| `DE-HE` Hessen | `P6` State cutover ready | `100%` | `yes` | `429` | `cutover_ready` | `backlog` |
| `DE-BY` Bayern | `P6` State cutover ready | `100%` | `yes` | `26` | `cutover_ready` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P4` First corridor reviewed | `65%` | `yes` | `20` | `subtree_adopted` | `next_wave` |
| `DE-BW` Baden-Wuerttemberg | `P4` First corridor reviewed | `65%` | `yes` | `36` | `subtree_adopted` | `active` |

## Immediate queue

- `DE-BW` Baden-Wuerttemberg: Baden-Wuerttemberg now has an active upper-secondary Physics source snapshot, provenance-backed membership and closure, a first reviewed narrow field corridor across the shared orientation anchor plus Basisfach/Leistungsfach `Elektromagnetische Felder`, one adjacent BF electrodynamics induction strip, two exact BF electrodynamics follow-ons on new narrow canonical applications and Maxwell-overview atoms, one adjacent BF `Schwingungen` follow-on on the shared canonical Q2 surface plus four conservative partial bridges on existing oscillation atoms, one adjacent BF `Wellen` follow-on on the canonical `Mechanische Wellen` cluster plus six conservative partial bridges on existing wave and spectrum atoms, one adjacent LF electrodynamics follow-on, one first adjacent LF `Schwingungen` follow-on with three exact leaf bridges across mechanical DGL solving, LC-DGL solving, and independent-oscillation superposition, one first adjacent LF `Wellen` follow-on with two exact leaf bridges across progressive plane transverse-wave modeling and the Hertz-dipole transfer from oscillating circuit to radiation, and one first adjacent LF `Wellenoptik` follow-on with two exact leaf bridges across coherent light as electromagnetic wave and the comparison of ray and wave model of light. The lane currently carries 36 reviewed mappings, widens the earlier small committed BW applicability cut from the field/induction closure onto the shared Q2 oscillation strip and adjacent wave strip, and intentionally still stops before the quantitative Interferenz-/Fernfeld-follow-on of `3.6.5` or BW-specific Physics composition views.
- `DE-NW` Nordrhein-Westfalen: Nordrhein-Westfalen now has an active upper-secondary Physics source snapshot, provenance-backed membership and closure, and a reviewed narrow mapping lane across E-phase, GK quantum/wave-field, and LK matter/radiation/judgement corridors. The lane currently carries 20 reviewed mappings, a first committed NRW applicability cut on seven shared canonical targets, a committed matter-structure follow-on on one new narrow canonical atom plus its parent cluster, a committed GK field follow-on on two new narrow canonical Q1 atoms plus their parent clusters, and a committed GK quantum-object follow-on on two new narrow canonical Q4 atoms plus the shared `Quantenobjekte` cluster, but no NRW-specific Physics composition views and no lower-secondary Physics source snapshot yet.

## Next steps

- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and the DE-HE Physics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-BY`: Keep Bayern on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and the DE-BY Physics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-NW`: Either keep widening the NRW upper-secondary lane through another still-missing reviewed corridor outside the current pilot subset, or stop local widening and move to the next state lane; do not invent NRW-specific Physics composition views before broader reviewed evidence actually requires them.
- `DE-BW`: Either widen the BW upper-secondary lane on the adjacent Leistungsfach-`Wellenoptik`-Interferenzstreifen, or stop local widening and move to the next state lane; do not introduce BW-specific Physics composition views before wider reviewed evidence requires them.

## Regeneration

```bash
python3 scripts/render_canonical_physics_bundesland_status.py
```
