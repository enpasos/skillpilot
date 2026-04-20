# SL Physics Onboarding Note

Status: `P3` (`anchors_mapped`)

This note records the first Saarland Physics source-landscape identifiers and the first conservative structural-anchor cut for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `e5f66ad7-8f49-41f5-b8b2-52ab9a0ebcac`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SL/lower-secondary/source-json/DE_SAR_S_GYM_1_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_to_canonical_physics.json`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `36092b29-547c-4018-8f47-97f04d786ba1`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SL/upper-secondary/source-json/DE_SAR_S_GYM_2_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_physics_upper_secondary_to_canonical_physics.json`

Activation result:

- the archived Saarland Physics source family under `curricula/DE/Gymnasium/input/SL/` is now converted into active retained source lanes
- both Saarland Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Saarland Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Saarland Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics lane now maps the retained root plus orientation and the first broad thematic subanchors that already have stable canonical Sek-I counterparts:
  - `Klassenstufen 5/6` Naturwissenschaften-Feeder auf der Bewegungs-/Energiespur
  - `Klassenstufe 7` auf Elektrizitaet, Lichtausbreitung/Reflexion und Mechanik
  - `Klassenstufe 8` auf Mechanik/Thermik sowie optische Abbildungen
  - `Klassenstufe 9` auf Stromkreisgesetze und optische Folgeflaechen
  - `Klassenstufe 10` auf Radioaktivitaet / ionisierende Strahlung
- the upper-secondary Physics lane now maps the retained root plus orientation and the first broad course-sensitive thematic anchors:
  - `Einfuehrungsphase: Kraft und Bewegung`
  - `Hauptphase G-Kurs: Felder`, `Elektromagnetische Induktion`, `Schwingungen und Wellen`, `Quanten und Atome`
  - `Hauptphase Leistungskurs: Felder`, `Elektromagnetische Induktion`, `Schwingungen und Wellen`, `Quanten und Atome`
- the retained upper-secondary strips `Einfuehrungsphase: Kernenergie und Radioaktivitaet` and the broad corridor containers themselves still remain intentionally source-led at this `P3` cut
- there is still no Saarland-specific canonical Physics atom
- there is still no committed Saarland applicability cut

Operational rule from here:

- keep both Saarland Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Saarland source basis
- keep the new `P3` cut explicitly structural and do not widen Saarland into a reviewed topic corridor before more of the newly activated states also carry their first structural anchors
- if a later horizontal Physics pass reaches the same subject strip across all newly activated states, widen the Saarland lane from these anchor files instead of inventing a Saarland-only canonical atom
