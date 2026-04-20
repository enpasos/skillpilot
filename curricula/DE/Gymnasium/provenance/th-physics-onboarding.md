# TH Physics Onboarding Note

Status: `P3` (`anchors_mapped`)

This note records the first Thueringen Physics source-landscape identifiers and the first conservative structural-anchor cut for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `2b1b8596-f8c5-44ba-9dec-4cccb834769a`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/TH/lower-secondary/source-json/DE_THU_S_GYM_1_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_physics_lower_secondary_to_canonical_physics.json`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `8b6387d0-7fc8-40e4-89ca-e5049b5bc42f`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/TH/upper-secondary/source-json/DE_THU_S_GYM_2_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_physics_upper_secondary_to_canonical_physics.json`

Activation result:

- the archived Thueringen Physics source family under `curricula/DE/Gymnasium/input/TH/` is now converted into active retained source lanes
- both Thueringen Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Thueringen Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Thueringen Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics lane now maps the retained root plus orientation and the first broad thematic subanchors that already have stable canonical Sek-I counterparts:
  - `Kraft, Druck und mechanische Energie`
  - `Geladene Koerper, Stromkreise und Leitungsvorgaenge`
  - `Lichtausbreitung und Bildentstehung`
  - `Elektromagnetische Wechselwirkungen`
  - `Bewegungen, Kraefte und Erhaltungssaetze`
  - `Radioaktivitaet`
- the lower-secondary residual strip on `Temperatur, Waerme und Zustandsaenderungen` remains intentionally source-led at this `P3` cut
- the upper-secondary Physics lane now maps the retained root plus orientation and the first broad thematic anchors that already have stable canonical upper-secondary counterparts:
  - `Klassenstufe 11`: `Kraefte und Bewegungen`, `Temperatur, Waerme und Zustandsaenderungen`, `Erhaltungssaetze`
  - `Qualifikationsphase`: `Elektrische und magnetische Felder`, `Mechanische und elektromagnetische Schwingungen und Wellen`, `Spezielle Relativitaetstheorie`, `Quantenphysik und Materie`
- the upper-secondary residual strips on `Elektrische Groessen und Leitungsvorgaenge`, `Lichtausbreitung und Bildentstehung`, and `Radioaktivitaet` in `Klassenstufe 11` remain intentionally source-led at this `P3` cut
- there is still no Thueringen-specific canonical Physics atom
- there is still no committed Thueringen applicability cut

Operational rule from here:

- keep both Thueringen Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Thueringen source basis
- keep the new `P3` cut explicitly structural and do not widen Thueringen into a reviewed topic corridor before the first renewed horizontal all-state Physics topic pass reaches the relevant strip
- if a later horizontal Physics pass reaches the same subject strip across all newly activated states, widen the Thueringen lane from these anchor files instead of inventing a Thueringen-only canonical atom
