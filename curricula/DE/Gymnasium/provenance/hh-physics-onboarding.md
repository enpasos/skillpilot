# HH Physics Onboarding Note

Status: `P3` (`anchors_mapped`)

This note records the first Hamburg Physics source-landscape identifiers for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `cc3245a5-2980-4019-aa51-84904e073195`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/HH/lower-secondary/source-json/DE_HAM_S_GYM_1_PHYSIK.de.json.snapshot`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `b400d5b6-7b13-4a64-881d-7416dcf01785`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/HH/upper-secondary/source-json/DE_HAM_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the archived Hamburg Physics source bundle under `curricula/DE/Gymnasium/input/HH/` is now converted into active retained source lanes
- both Hamburg Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Hamburg Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Hamburg Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained `J8` checkpoint on `Elektrizitaet`, `Bewegung und Kraft`, and `Licht und Schall`
  - one retained checkpoint for the transition into upper secondary on `Elektrizitaet und Magnetismus`, `Bewegung und Kraft`, `Energie`, and `Licht und Materie`
- the upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one broad retained theme anchor `Elektrische und magnetische Felder`
  - one broad retained theme anchor `Mechanische und elektromagnetische Schwingungen und Wellen`
  - one broad retained theme anchor `Quantenphysik und Materie`
  - one broad retained elective anchor `Gravitation und Astrophysik`
- the first Hamburg Physics mapping lanes now live at
  - `curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_physics_lower_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_physics_upper_secondary_to_canonical_physics.json`
- the first Hamburg `P3` cut stays intentionally structural:
  - lower-secondary root plus orientation and the first thematic retained subanchors across `J8` and the transition strip onto the shared Sek-I spine
  - upper-secondary root plus orientation, the broad retained anchors `Q1`, `Q2`, and `Q3`, and one explicit late-side anchor on `Astrophysik`
- there is still no Hamburg-specific canonical Physics atom
- there is still no committed Hamburg applicability cut

Operational rule from here:

- keep both Hamburg Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Hamburg source basis
- keep the first Hamburg lower-secondary and upper-secondary structural-anchor files stable while the remaining newly archived states move from `P2` to `P3`
- do not widen Hamburg into a reviewed corridor before the active nationwide structural-anchor tranche has advanced beyond this first narrow anchor cut
