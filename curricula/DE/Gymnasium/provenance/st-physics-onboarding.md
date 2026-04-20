# ST Physics Onboarding Note

Status: `P2` (`snapshots_active`)

This note records the first Sachsen-Anhalt Physics source-landscape identifiers for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `3eedae6b-7e62-4e6e-a96c-78cd6df4c4aa`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/ST/lower-secondary/source-json/DE_SAN_S_GYM_1_PHYSIK.de.json.snapshot`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `85f23183-91d4-4eb0-ad51-aa3a03b240a8`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/ST/upper-secondary/source-json/DE_SAN_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the archived Sachsen-Anhalt Physics source family under `curricula/DE/Gymnasium/input/ST/` is now converted into active retained source lanes
- both Sachsen-Anhalt Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Sachsen-Anhalt Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Sachsen-Anhalt Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained `Schuljahrgang 6` strip on `Die Naturwissenschaft Physik`, `Strahlenoptik`, `Eigenschaften und Bewegung von Koerpern und Teilchen`, `Temperatur und Waerme`, and `Magnetismus`
  - one retained `Schuljahrgaenge 7/8` strip on `Kraefte und ihre Wirkungen`, `Elektrischer Strom und seine Wirkungen`, `Waerme und Aggregatzustaende`, `Druck und Auftrieb`, `Verhalten von Gasen und technische Anwendungen`, and `Stromkreise und Elektromagnetismus`
  - one retained `Schuljahrgang 9` strip on `Elektromagnetische Induktion und Leitungsvorgaenge` and `Mechanik der Punktmasse`
- the upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained `Schuljahrgang 10 (Einfuehrungsphase)` strip
  - one retained `grundlegendes Anforderungsniveau` strip
  - one retained `erhoehtes Anforderungsniveau` strip
  - one retained `zweistuendiges Wahlpflichtfach` strip
- there is still no Sachsen-Anhalt Physics mapping lane
- there is still no Sachsen-Anhalt-specific canonical Physics atom
- there is still no committed Sachsen-Anhalt applicability cut

Operational rule from here:

- keep both Sachsen-Anhalt Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Sachsen-Anhalt source basis
- do not open a reviewed Sachsen-Anhalt topic mapping before the current nationwide Physics `P2` snapshot/provenance tranche is complete for the other newly archived states
- once that tranche is complete, use the Sachsen-Anhalt source-backed lower-secondary and upper-secondary lanes as one candidate input for the later `P3` structural-anchor pass
