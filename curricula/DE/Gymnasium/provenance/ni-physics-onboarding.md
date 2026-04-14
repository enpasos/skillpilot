# Niedersachsen Physics Onboarding Note

Status: `P4` (`reviewed_corridors_opened`)

This note records the first Niedersachsen Physics source-landscape identifier for the DE-level canonical Physics rollout.

Activated on `2026-04-13`:

- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `730a6dbb-7ddb-486b-8ac8-dd9e58e3d113`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/NI/upper-secondary/source-json/DE_NDS_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the Niedersachsen upper-secondary Physics lane is now active in `source-landscape-registry.json`
- the first Niedersachsen upper-secondary Physics snapshot now contributes real `goalIds` to `source-goal-membership-registry.json`
- the same snapshot now contributes atomic closures to `source-goal-closure-registry.json`
- the repository-backed Niedersachsen Physics mapping file now carries `9` reviewed upper-secondary mappings across the current narrow reviewed corridor
- the first committed Niedersachsen upper-secondary Physics applicability cut is now active on the shared canonical motivation anchor and on the reviewed E-phase dynamics strip:
  - `Freier Fall experimentell untersuchen`
  - `Gleichmäßig beschleunigte Bewegung und Beschleunigung`
  - `Waagerechter Wurf analysieren`
  - `Die drei Newtonschen Axiome benennen und erklären`
  - `Newtons 1. Axiom (Trägheitsprinzip)`
  - `Newtons 2. Axiom (Grundgleichung der Mechanik)`
  - `Newtons 3. Axiom (Wechselwirkungsprinzip)`
  - `Kreisbewegungen und Zentripetalkraft`
  - `Bahn- und Winkelgeschwindigkeit`
  - `Kreisbewegung mit Zentripetalkraft anwenden`
- the first source snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one Einfuehrungsphasen-Korridor `Dynamik`
  - six imported leaf goals on freier Fall, waagerechter Wurf, Grundgleichung der Mechanik, Newtonsche Axiome, gleichfoermige Kreisbewegung, and Zentripetalkraft
- the reviewed Niedersachsen Physics corridor stays intentionally conservative:
  - exact bridge on the shared motivation anchor
  - partial bridge on the Niedersachsen E-phase `Dynamik` cluster toward the shared canonical E-phase mechanics surface
  - partial bridges from the imported dynamics leaves onto the existing shared canonical free-fall, horizontal-throw, Newton, and circle-motion targets
  - no Niedersachsen-specific Physics composition views are introduced in this first step
  - no new canonical Physics atoms are introduced just for Niedersachsen wording

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while broadening the Niedersachsen Physics source snapshot
- keep the Niedersachsen Physics lane narrow and reviewed; the next clean widening should either close the remaining energy/experiment strip inside `Dynamik` or move to the first equally explicit qualification-phase anchor such as `Elektrizitaet` or `Schwingungen und Wellen`
