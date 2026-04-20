# MV Physics Onboarding Note

Status: `P2` (`snapshots_active`)

This note records the first Mecklenburg-Vorpommern Physics source-landscape identifiers for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `27da5587-bef3-49ad-9fec-3907253b85bd`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/MV/lower-secondary/source-json/DE_MVP_S_GYM_1_PHYSIK.de.json.snapshot`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `f66821d1-64a5-428d-a826-36990b6f1e0f`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/MV/upper-secondary/source-json/DE_MVP_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the archived Mecklenburg-Vorpommern Physics source bundle under `curricula/DE/Gymnasium/input/MV/` is now converted into active retained source lanes
- both Mecklenburg-Vorpommern Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Mecklenburg-Vorpommern Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Mecklenburg-Vorpommern Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained class-7 strip on `Dichte`, `Kraefte` and `Physik auf der Baustelle`
  - one retained class-8 strip on `Licht`, `elektrische Ladung`, `Stromkreise` and `Temperatur und Waerme`
  - one retained class-9 strip on `Magnetismus`, `Gleichstrommotor und Induktion`, `geradlinige Bewegung` and `Mit dem E-Bike unterwegs`
  - one retained class-10 strip on `gleichmaessig beschleunigte Bewegung`, `Dynamik`, `Gravitationsfeld und Kreisbewegung` and `Kernphysik`
- the upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one integratives Oberstufenband
  - one broad retained theme anchor `Elektrische und magnetische Felder`
  - one broad retained theme anchor `Schwingungen und Wellen`
  - one broad retained theme anchor `Quantenphysik und Materie`
- there is still no Mecklenburg-Vorpommern Physics mapping lane
- there is still no Mecklenburg-Vorpommern-specific canonical Physics atom
- there is still no committed Mecklenburg-Vorpommern applicability cut

Operational rule from here:

- keep both Mecklenburg-Vorpommern Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Mecklenburg-Vorpommern source basis
- do not open a reviewed Mecklenburg-Vorpommern topic mapping before the current nationwide Physics `P2` snapshot/provenance tranche is complete for the other newly archived states
- once that tranche is complete, use the Mecklenburg-Vorpommern source-backed lower-secondary and upper-secondary lanes as one candidate input for the later `P3` structural-anchor pass
