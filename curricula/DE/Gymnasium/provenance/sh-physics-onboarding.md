# SH Physics Onboarding Note

Status: `P4` (`first_reviewed_corridor`)

This note records the first Schleswig-Holstein Physics source-landscape identifier for the DE-level canonical Physics rollout.

Activated on `2026-04-16`:

- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `f1a2c733-b994-4db3-9dd6-54ffe544002b`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_to_canonical_physics.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the official Schleswig-Holstein physics source is now explicitly linked from:
  - `curricula/DE/Gymnasium/input/SH/README.md`
- the Schleswig-Holstein upper-secondary Physics lane is now active in `source-landscape-registry.json`
- the first Schleswig-Holstein upper-secondary Physics snapshot now contributes real `goalIds` to `source-goal-membership-registry.json`
- the same snapshot now contributes atomic closures to `source-goal-closure-registry.json`
- the repository-backed Schleswig-Holstein Physics mapping file now carries `10` reviewed upper-secondary mappings
- the first Schleswig-Holstein upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one structural Sek-II anchor `Elektrische und magnetische Felder`
  - one first reviewed field-concept entry corridor on the official SH subtopic `Das Feldkonzept zur Beschreibung von Wechselwirkungen`
- the reviewed Schleswig-Holstein Physics corridor stays intentionally conservative:
  - partial bridge from the SH source root onto the canonical Physics root
  - exact bridge on the shared motivation/orientation anchor
  - partial bridge from the structural SH field anchor onto the shared canonical `Q1 Elektrisches und magnetisches Feld`
  - partial bridge from the retained SH field-concept parent onto the shared canonical cluster `Elektrisches Feld`
  - partial bridges from the retained SH leaves onto existing shared field-concept atoms for charge phenomena, Coulomb interaction, field-line sketches, and superposition
- no Schleswig-Holstein-specific canonical Physics atom is introduced in this step
- no committed Schleswig-Holstein applicability cut is introduced in this step
- no Schleswig-Holstein-specific Physics composition view is introduced in this step

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while widening the Schleswig-Holstein Physics source snapshot
- treat the retained SH corridor `Das Feldkonzept zur Beschreibung von Wechselwirkungen` as the current first reviewed cut
- continue the same SH source family on `Koerper in statischen Feldern` before switching to another Physics topic row
- do not force a Schleswig-Holstein-specific canonical split or applicability cut before broader reviewed evidence exists
