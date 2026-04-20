# HB Physics Onboarding Note

Status: `P3` (`anchors_mapped`)

This note records the first Bremen Physics source-landscape identifiers for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `6cf49ad5-537a-45ee-848c-b114fd3c57df`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/HB/lower-secondary/source-json/DE_BRE_S_GYM_1_PHYSIK.de.json.snapshot`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `10228ad5-6cc9-4e93-8436-c47f8b0b488a`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/HB/upper-secondary/source-json/DE_BRE_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the archived Bremen Physics source bundle under `curricula/DE/Gymnasium/input/HB/` is now converted into active retained source lanes
- both Bremen Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Bremen Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Bremen Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained `J7/8` anchor for `Schall und Laerm`, `Sehen, Licht und Farben`, `Kraefte und Bewegung`, and `Elektrostatik`
  - one retained `J9` anchor for `Der elektrische Stromkreis als System`, `Elektromagnetismus`, and `Radioaktivitaet und Kernenergie`
  - the former `Energie` and `Mechanik` row from the old 10er-Abschnitt stays intentionally outside this Sek-I-Physiklane because the 2022 restriction shifts that debt into the upper-secondary curriculum
- the upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one Einfuehrungsphase anchor with `Mechanik` and `Energie`
  - one retained qualification anchor `Elektrische und magnetische Felder`
  - one retained qualification anchor `Mechanische und elektromagnetische Schwingungen und Wellen`
  - one retained qualification anchor `Quantenphysik und Materie`
  - one explicit LK-only structural leaf `Struktur der Materie`
- the first Bremen Physics mapping lanes now live at
  - `curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_physics_lower_secondary_to_canonical_physics.json`
  - `curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_physics_upper_secondary_to_canonical_physics.json`
- the first Bremen `P3` cut stays intentionally structural:
  - lower-secondary root plus orientation and the first thematic retained subanchors across `J7/8` and `J9` onto the shared Sek-I spine
  - upper-secondary root plus orientation, the broad retained anchors `E`, `Q1`, and `Q2`, and one explicit `Q4` side anchor from the LK leaf `Struktur der Materie`
- there is still no reviewed Bremen Physics corridor
- there is still no Bremen-specific canonical Physics atom
- there is still no committed Bremen applicability cut

Operational rule from here:

- keep both Bremen Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Bremen source basis
- keep the first Bremen lower-secondary and upper-secondary structural-anchor files stable while the remaining newly archived states move from `P2` to `P3`
- do not widen Bremen into a reviewed corridor before the active nationwide structural-anchor tranche has advanced beyond this first narrow anchor cut
