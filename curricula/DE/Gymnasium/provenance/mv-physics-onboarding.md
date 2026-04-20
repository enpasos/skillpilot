# MV Physics Onboarding Note

Status: `P3` (`anchors_mapped`)

This note records the first Mecklenburg-Vorpommern Physics source-landscape identifiers and the first conservative structural-anchor cut for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `27da5587-bef3-49ad-9fec-3907253b85bd`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/MV/lower-secondary/source-json/DE_MVP_S_GYM_1_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_to_canonical_physics.json`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `f66821d1-64a5-428d-a826-36990b6f1e0f`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/MV/upper-secondary/source-json/DE_MVP_S_GYM_2_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_physics_upper_secondary_to_canonical_physics.json`

Activation result:

- the archived Mecklenburg-Vorpommern Physics source bundle under `curricula/DE/Gymnasium/input/MV/` is now converted into active retained source lanes
- both Mecklenburg-Vorpommern Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Mecklenburg-Vorpommern Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Mecklenburg-Vorpommern Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics lane now maps the retained root plus orientation and the first broad thematic subanchors that already have stable canonical Sek-I counterparts:
  - `Dichte`
  - `Kraefte`
  - `Licht`
  - `elektrische Ladung`
  - `Stromkreise`
  - `Magnetismus`
  - `Gleichstrommotor und Induktion`
  - `geradlinige Bewegung`
  - `gleichmaessig beschleunigte Bewegung`
  - `Dynamik`
  - `Kernphysik`
- the upper-secondary Physics lane now maps the retained root plus orientation and only the first three broad thematic anchors:
  - `Elektrische und magnetische Felder`
  - `Schwingungen und Wellen`
  - `Quantenphysik und Materie`
- the integrative upper-secondary band still remains intentionally source-led at this `P3` cut
- there is still no Mecklenburg-Vorpommern-specific canonical Physics atom
- there is still no committed Mecklenburg-Vorpommern applicability cut

Operational rule from here:

- keep both Mecklenburg-Vorpommern Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Mecklenburg-Vorpommern source basis
- keep the new `P3` cut explicitly structural and do not widen Mecklenburg-Vorpommern into a reviewed topic corridor before more of the newly activated states also carry their first structural anchors
- if a later horizontal Physics pass reaches the same subject strip across all newly activated states, widen the Mecklenburg-Vorpommern lane from these anchor files instead of inventing a Mecklenburg-Vorpommern-only canonical atom
