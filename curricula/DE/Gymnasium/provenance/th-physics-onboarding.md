# TH Physics Onboarding Note

Status: `P2` (`snapshots_active`)

This note records the first Thueringen Physics source-landscape identifiers for the DE-level canonical Physics rollout.

Activated on `2026-04-20`:

- lower-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `2b1b8596-f8c5-44ba-9dec-4cccb834769a`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/TH/lower-secondary/source-json/DE_THU_S_GYM_1_PHYSIK.de.json.snapshot`
- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `8b6387d0-7fc8-40e4-89ca-e5049b5bc42f`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/TH/upper-secondary/source-json/DE_THU_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the archived Thueringen Physics source family under `curricula/DE/Gymnasium/input/TH/` is now converted into active retained source lanes
- both Thueringen Physics source-landscape IDs are now active in `source-landscape-registry.json`
- both Thueringen Physics snapshots now contribute source goal memberships to `source-goal-membership-registry.json`
- both Thueringen Physics snapshots now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained `Klassenstufen 7/8` strip on `Kraft, Druck und mechanische Energie`, `Geladene Koerper, Stromkreise, elektrische Groessen und elektrische Leitungsvorgaenge`, `Temperatur, Waerme und Zustandsaenderungen`, and `Lichtausbreitung und Bildentstehung`
  - one retained `Klassenstufen 9/10` strip on `Elektromagnetische Wechselwirkungen`, `Bewegungen, Kraefte und Erhaltungssaetze`, and `Radioaktivitaet`
- the upper-secondary Physics snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one retained `Klassenstufe 11` strip on `Kraefte und Bewegungen`, `Elektrische Groessen und elektrische Leitungsvorgaenge`, `Temperatur, Waerme und Zustandsaenderungen`, `Lichtausbreitung und Bildentstehung`, `Erhaltungssaetze`, and `Radioaktivitaet`
  - one retained `Qualifikationsphase` strip on `Elektrische und magnetische Felder`, `Mechanische und elektromagnetische Schwingungen und Wellen`, `Spezielle Relativitaetstheorie`, and `Quantenphysik und Materie`
- there is still no Thueringen Physics mapping lane
- there is still no Thueringen-specific canonical Physics atom
- there is still no committed Thueringen applicability cut

Operational rule from here:

- keep both Thueringen Physics `sourceLandscapeId` values stable while the new retained source snapshots remain the authoritative Thueringen source basis
- do not open a reviewed Thueringen topic mapping before the current nationwide Physics `P2` snapshot/provenance tranche is complete for the other newly archived states
- once that tranche is complete, use the Thueringen source-backed lower-secondary and upper-secondary lanes as one candidate input for the later `P3` structural-anchor pass
