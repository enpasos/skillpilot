# ST Physics Onboarding Note

Status: `P3` (`anchors_mapped`)

This note records the first Sachsen-Anhalt Physics source-landscape identifiers and the first conservative structural-anchor cut for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `3eedae6b-7e62-4e6e-a96c-78cd6df4c4aa`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/ST/lower-secondary/source-json/DE_SAN_S_GYM_1_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_to_canonical_physics.json`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `85f23183-91d4-4eb0-ad51-aa3a03b240a8`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/ST/upper-secondary/source-json/DE_SAN_S_GYM_2_PHYSIK.de.json.snapshot`
  - first structural-anchor mapping:
    `curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_physics_upper_secondary_to_canonical_physics.json`

Activation result:

- the archived Sachsen-Anhalt Physics source family under `curricula/DE/Gymnasium/input/ST/` is now converted into active retained source lanes
- both Sachsen-Anhalt Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Sachsen-Anhalt Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Sachsen-Anhalt Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics lane now maps the retained root plus orientation and the first broad thematic subanchors that already have stable canonical Sek-I counterparts:
  - `Strahlenoptik`
  - `Eigenschaften und Bewegung von Koerpern und Teilchen`
  - `Magnetismus`
  - `Kraefte und ihre Wirkungen`
  - `Elektrischer Strom und seine Wirkungen`
  - `Druck und Auftrieb`
  - `Stromkreise und Elektromagnetismus`
  - `Elektromagnetische Induktion und Leitungsvorgaenge`
  - `Mechanik der Punktmasse`
- the lower-secondary residual strips on `Die Naturwissenschaft Physik`, `Temperatur und Waerme`, `Waerme und Aggregatzustaende`, and `Verhalten von Gasen und technische Anwendungen` remain intentionally source-led at this `P3` cut
- the upper-secondary Physics lane now maps the retained root plus orientation and the first broad thematic anchors that already have stable canonical upper-secondary counterparts:
  - `Einfuehrungsphase`: `Gravitation`
  - `grundlegendes Anforderungsniveau`: `Grundlagenkurs Mechanik`, `Mechanische Schwingungen und Wellen`, `Welleneigenschaften des Lichtes`, `Elektrisches Feld`, `Magnetisches Feld`, `Elektromagnetische Induktion`, `Eigenschaften von Quantenobjekten`, `Quantenphysikalisches Atommodell`
  - `erhoehtes Anforderungsniveau`: `Mechanische Schwingungen`, `Mechanische Wellen`, `Welleneigenschaften des Lichtes`, `Aufbaukurs Mechanik`, `Elektrisches Feld`, `Magnetisches Feld`, `Elektromagnetische Induktion`, `Wechselstromwiderstaende und elektromagnetische Schwingungen`, `Spezielle Relativitaetstheorie`, `Eigenschaften von Quantenobjekten`, `Quantenphysikalisches Atommodell`
  - `zweistuendiges Wahlpflichtfach`: `Das Feldkonzept zur Beschreibung von Wechselwirkungen`, `Koerper in statischen Feldern`, `Veraenderliche elektromagnetische Felder`, `Schwingungen`, `Wellen`, `Quantenobjekte`, `Atommodelle`
- the upper-secondary residual strips on `Geometrische Optik`, `Radioaktivitaet und Kernenergie`, `Klimaphysik`, the practica, and the remaining task/practicum surfaces remain intentionally source-led at this `P3` cut
- there is still no Sachsen-Anhalt-specific canonical Physics atom
- there is still no committed Sachsen-Anhalt applicability cut

Operational rule from here:

- keep both Sachsen-Anhalt Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Sachsen-Anhalt source basis
- keep the new `P3` cut explicitly structural and do not widen Sachsen-Anhalt into a reviewed topic corridor before more of the newly activated states also carry their first structural anchors
- if a later horizontal Physics pass reaches the same subject strip across all newly activated states, widen the Sachsen-Anhalt lane from these anchor files instead of inventing a Sachsen-Anhalt-only canonical atom
