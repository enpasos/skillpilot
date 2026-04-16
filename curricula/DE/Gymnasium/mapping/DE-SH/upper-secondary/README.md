# DE-SH Upper-Secondary Mapping Lane

This lane now carries the first Schleswig-Holstein upper-secondary source snapshot into the shared DE-level canonical mathematics landscape.

Current status on `2026-03-30`:

- repository-backed mapping fixture now exists:
  `sh_math_upper_secondary_to_canonical_math.json`
- active `sourceLandscapeId`:
  `01ffba7d-7588-4221-bd2b-1a692839809a`
- current mapping count: `39`
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
- the lane now carries an exact-resolved explicit upper-secondary E-analysis strip on the SH `Analysis` phase cells:
  `Ableitungen elementarer Funktionen -> Grundlegende Ableitungsregeln auf elementare Funktionsterme anwenden`
  `Extrempunkte mit Ableitungen untersuchen -> Monotonie und Extremstellen mit der ersten Ableitung untersuchen`
  `Wendepunkte und Kruemmung untersuchen -> Kruemmung und Wendestellen mit der zweiten Ableitung untersuchen`
- the adjacent SH Q1 leaf `e-Funktion und natuerliche Exponentialfunktion` now exact-resolves on:
  `Eigenschaften der natuerlichen Exponentialfunktion nutzen`
- the formerly broad SH Q1 `Integralrechnung` cell is now source-split into two exact-resolved leaves:
  `Bestimmtes Integral und Hauptsatz nutzen -> Hauptsatz der Differential- und Integralrechnung nutzen`
  `Einfache Integrale mit elementaren Regeln berechnen -> Einfache Integrale berechnen`
- the lane now also carries coarse reviewed broad geometry and stochastics surface mappings on all remaining official area cells:
  `Geometrie -> Raum, Matrizen und lineare Modelle (Sek II)`
  `Stochastik -> Stochastik, Tests und Statistik (Sek II)`
- this reviewed pass is intentionally coarse because the current SH source snapshot still keeps most retained source goals at one official phase-and-area cell, with only the now-tightened Q1 integral cell split further where the shared canonical corridor already warranted it
- all official upper-secondary source cells now have at least one structural or coarse reviewed canonical bridge
- next step: treat the opened SH upper-secondary analysis strip as exact-resolved at explicit source-residue level and do not reopen broader SH Q1/Q2 analysis parents unless a genuinely narrower source split appears

## Physics

Current status on `2026-04-16`:

- repository-backed mapping fixture now exists:
  `sh_physics_upper_secondary_to_canonical_physics.json`
- reserved `sourceLandscapeId`:
  `f1a2c733-b994-4db3-9dd6-54ffe544002b`
- current mapping count: `10`
- the first Schleswig-Holstein upper-secondary physics source snapshot is now active:
  `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_PHYSIK.de.json.snapshot`

Current use:

- canonical Gymnasium `Physik`
- one shared orientation anchor is mapped
- one structural Sek-II field anchor `Elektrische und magnetische Felder` is mapped
- one first reviewed SH field-concept corridor `Das Feldkonzept zur Beschreibung von Wechselwirkungen` is mapped
- the current SH physics cut stays intentionally conservative:
  - partial bridge from the SH source root onto the canonical physics root
  - exact bridge on the shared motivation/orientation anchor
  - partial bridge from the structural SH field anchor onto the shared canonical `Q1 Elektrisches und magnetisches Feld`
  - partial bridge from the retained SH field-concept parent onto the shared canonical cluster `Elektrisches Feld`
  - partial bridges from the retained SH leaves onto existing shared field-concept atoms for charge phenomena, Coulomb interaction, field-line sketches, and superposition
- no Schleswig-Holstein-specific canonical physics atom is introduced in this step
- no committed Schleswig-Holstein applicability cut is introduced in this step
- next step: continue the same SH source family on `Koerper in statischen Feldern` before considering a switch to another physics topic row
