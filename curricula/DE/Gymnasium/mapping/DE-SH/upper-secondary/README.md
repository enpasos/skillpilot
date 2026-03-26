# DE-SH Upper-Secondary Mapping Lane

This lane now carries the first Schleswig-Holstein upper-secondary source snapshot into the shared DE-level canonical mathematics landscape.

Current status on `2026-03-26`:

- repository-backed mapping fixture now exists:
  `sh_math_upper_secondary_to_canonical_math.json`
- active `sourceLandscapeId`:
  `01ffba7d-7588-4221-bd2b-1a692839809a`
- current mapping count: `13`
- the first Schleswig-Holstein mathematics source PDF is now archived locally:
  `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf`
- the 2024 Allgemeiner Teil is now archived locally:
  `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Allgemeiner_Teil_2024_barrierearm.pdf`
- the first Schleswig-Holstein upper-secondary source snapshot is now active:
  `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_MATHEMATIK.de.json.snapshot`

Current use:

- canonical Gymnasium `Mathematik`
- upper-secondary source snapshot preserves the official SH phase table `Einfuehrungsjahr`, `1. Jahr der Qualifikationsphase`, and `2. Jahr der Qualifikationsphase`
- the source root now bridges exactly to the shared canonical math root
- upper-secondary entry anchors are now mapped as a structural bridge:
  `E -> E`, `1. Jahr -> Q1`, `2. Jahr -> Q3`
- the lane now carries a coarse reviewed upper-secondary analysis strip on the SH `Analysis` phase cells:
  `E -> Einfuehrung in den Ableitungsbegriff`, `Q1 -> Anwendungen des Ableitungsbegriffs`, `Q2 -> Integralrechnung und Differenzialgleichungen (Sek II)`
- the lane now also carries coarse reviewed broad geometry and stochastics surface mappings on all remaining official area cells:
  `Geometrie -> Raum, Matrizen und lineare Modelle (Sek II)`
  `Stochastik -> Stochastik, Tests und Statistik (Sek II)`
- this reviewed pass is intentionally coarse because the current SH source snapshot keeps one retained source goal per official phase-and-area cell
- all official upper-secondary source cells now have at least one structural or coarse reviewed canonical bridge
- next step: decide whether to refine the SH upper-secondary source lane before making narrower derivative-, geometry-, or stochastics-level reviewed claims
