# SL Physics Onboarding Note

Status: `P2` (`snapshots_active`)

This note records the first Saarland Physics source-landscape identifiers for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `e5f66ad7-8f49-41f5-b8b2-52ab9a0ebcac`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SL/lower-secondary/source-json/DE_SAR_S_GYM_1_PHYSIK.de.json.snapshot`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `36092b29-547c-4018-8f47-97f04d786ba1`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SL/upper-secondary/source-json/DE_SAR_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the archived Saarland Physics source family under `curricula/DE/Gymnasium/input/SL/` is now converted into active retained source lanes
- both Saarland Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Saarland Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Saarland Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained `Klassenstufen 5/6` Naturwissenschaften feeder strip
  - one retained `Klassenstufe 7` strip
  - one branch-sensitive retained `Klassenstufe 8` strip
  - one branch-sensitive retained `Klassenstufe 9` strip
  - one branch-sensitive retained `Klassenstufe 10` strip
- the upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained `Einfuehrungsphase` strip
  - one retained `Hauptphase G-Kurs` strip
  - one retained `Hauptphase Leistungskurs` strip
- there is still no Saarland Physics mapping lane
- there is still no Saarland-specific canonical Physics atom
- there is still no committed Saarland applicability cut

Operational rule from here:

- keep both Saarland Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Saarland source basis
- the newly archived-state Physics `P2` tranche is now effectively complete; the next active move should be the first structural-anchor pass instead of another snapshot-only widening
- use the Saarland source-backed lower-secondary and upper-secondary lanes as one candidate input for the later `P3` structural-anchor pass
