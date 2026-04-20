# SN Physics Onboarding Note

Status: `P3` (`anchors_mapped`)

This note records the first Sachsen Physics source-landscape identifiers and the first conservative structural-anchor cut for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `d2e1fbb7-9e42-49a7-a07b-a7973156da12`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SN/lower-secondary/source-json/DE_SAC_S_GYM_1_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_to_canonical_physics.json`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `e1213911-abd2-4a1e-88ca-7a78a58c2189`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SN/upper-secondary/source-json/DE_SAC_S_GYM_2_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_physics_upper_secondary_to_canonical_physics.json`

Activation result:

- the archived Sachsen Physics source family under `curricula/DE/Gymnasium/input/SN/` is now converted into active retained source lanes
- both Sachsen Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Sachsen Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Sachsen Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics lane now maps the retained root plus orientation and the first broad thematic subanchors that already have stable canonical Sek-I counterparts:
  - `Licht und seine Eigenschaften`
  - `Eigenschaften und Bewegungen von Koerpern`
  - `Elektrische Stromkreise`
  - `Kraefte`
  - `Stromstaerke und Spannung in Stromkreisen`
  - `Mechanik der Fluessigkeiten und Gase`
  - `Eigenschaften elektrischer Bauelemente`
  - `Grundlagen der Elektronik`
  - `Bewegungsgesetze`
  - `Licht als Strahl und Welle`
- the lower-secondary residual strips on `Temperatur und Zustand von Koerpern`, `Energiewandler`, `Thermische Energie`, `selbststaendiges Experimentieren`, `Energieversorgung`, `mechanische Schwingungen und Wellen`, `Kosmos, Erde und Mensch`, `Hertz'sche Wellen`, and the practicum leaves remain intentionally source-led at this `P3` cut
- the upper-secondary Physics lane now maps the retained root plus orientation and the first broad thematic anchors that already have stable canonical upper-secondary counterparts:
  - `GK11`: `Erhaltung der Energie`, `Anwendung der Kinetik und Dynamik`, `Geladene Teilchen in elektrischen und magnetischen Feldern`
  - `GK12`: `Welleneigenschaften des Lichts`, `Grundlagen der Quantenphysik`, `Strahlung aus Atomhuelle und Atomkern`
  - `LK11`: `Erhaltungssaetze und ihre Anwendungen`, `Kinematik geradliniger Bewegungen`, `Einblick in die Relativitaetstheorie`, `Elektrisches Feld`, `Magnetisches Feld`, `Geladene Teilchen in Feldern`, `Elektromagnetische Induktion`
  - `LK12`: `Mechanische und elektromagnetische Schwingungen`, `Wellen als vielschichtige Naturerscheinung`, `Grundlagen der Quantenphysik`, `Grundlagen der Atomphysik`, `Eigenschaften der Atomkerne`, `Thermodynamik`
- the upper-secondary residual strips on `Kondensator und Spule - Praktikum`, both optics/practicum leaves, `Modellbildung und Simulation`, `Newton'sche Gesetze`, `krummlinige Bewegungen`, and the remaining practicum leaves remain intentionally source-led at this `P3` cut
- there is still no Sachsen-specific canonical Physics atom
- there is still no committed Sachsen applicability cut

Operational rule from here:

- keep both Sachsen Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Sachsen source basis
- keep the new `P3` cut explicitly structural and do not widen Sachsen into a reviewed topic corridor before more of the newly activated states also carry their first structural anchors
- if a later horizontal Physics pass reaches the same subject strip across all newly activated states, widen the Sachsen lane from these anchor files instead of inventing a Sachsen-only canonical atom
