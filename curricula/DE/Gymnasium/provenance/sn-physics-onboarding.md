# SN Physics Onboarding Note

Status: `P2` (`snapshots_active`)

This note records the first Sachsen Physics source-landscape identifiers for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `d2e1fbb7-9e42-49a7-a07b-a7973156da12`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SN/lower-secondary/source-json/DE_SAC_S_GYM_1_PHYSIK.de.json.snapshot`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `e1213911-abd2-4a1e-88ca-7a78a58c2189`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SN/upper-secondary/source-json/DE_SAC_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the archived Sachsen Physics source family under `curricula/DE/Gymnasium/input/SN/` is now converted into active retained source lanes
- both Sachsen Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Sachsen Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Sachsen Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained class-6 strip on `Licht`, `Eigenschaften und Bewegungen von Koerpern`, `Temperatur und Zustand von Koerpern`, and `Elektrische Stromkreise`
  - one retained class-7 strip on `Kraefte`, `Stromstaerke und Spannung in Stromkreisen`, and `Energiewandler`
  - one retained class-8 strip on `Mechanik der Fluessigkeiten und Gase`, `Thermische Energie`, `Eigenschaften elektrischer Bauelemente`, and `Selbststaendiges Experimentieren`
  - one retained class-9 strip on `Grundlagen der Elektronik`, `Energieversorgung`, `Bewegungsgesetze`, and `Physikalisches Praktikum`
  - one retained class-10 strip on `Mechanische Schwingungen und Wellen`, `Kosmos, Erde und Mensch`, `Licht als Strahl und Welle`, `Hertz'sche Wellen`, and `Physikalisches Praktikum`
- the upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one broad `GK11` strip with four Lernbereichen
  - one broad `GK12` strip with four Lernbereichen
  - one broad `LK11` strip with elf Lernbereichen
  - one broad `LK12` strip with sieben Lernbereichen
- there is still no Sachsen Physics mapping lane
- there is still no Sachsen-specific canonical Physics atom
- there is still no committed Sachsen applicability cut

Operational rule from here:

- keep both Sachsen Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Sachsen source basis
- do not open a reviewed Sachsen topic mapping before the current nationwide Physics `P2` snapshot/provenance tranche is complete for the other newly archived states
- once that tranche is complete, use the Sachsen source-backed lower-secondary and upper-secondary lanes as one candidate input for the later `P3` structural-anchor pass
