# HH Physics Onboarding Note

Status: `P2` (`snapshots_active`)

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
- there is still no Hamburg Physics mapping lane
- there is still no Hamburg-specific canonical Physics atom
- there is still no committed Hamburg applicability cut

Operational rule from here:

- keep both Hamburg Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Hamburg source basis
- do not open a reviewed Hamburg topic mapping before the current nationwide Physics `P2` snapshot/provenance tranche is complete for the other newly archived states
- once that tranche is complete, use the Hamburg source-backed lower-secondary and upper-secondary lanes as one candidate input for the later `P3` structural-anchor pass
