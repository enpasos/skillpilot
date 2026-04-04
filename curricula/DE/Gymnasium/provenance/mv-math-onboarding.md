# MV Math Onboarding Note

Status: P5 (`broad_state_coverage`)

This note records the first Mecklenburg-Vorpommern source-landscape identifiers for the mathematics-first DE expansion track and their first-corridor-reviewed state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 7-10`):
  - `sourceLandscapeId`: `71c43461-d20e-4267-bd18-ad9ba66f0c5b`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`classes 11-12`):
  - `sourceLandscapeId`: `9d420a46-b007-44ce-a4b4-453ef4e38523`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_math_upper_secondary_to_canonical_math.json`

Archived input state on `2026-04-04`:

- `curricula/DE/Gymnasium/input/MV/Mathematik_Orientierungsstufe_5_6_2020.pdf`
- `curricula/DE/Gymnasium/input/MV/Mathematik_Gymnasium_7_10_2019.pdf`
- `curricula/DE/Gymnasium/input/MV/Mathematik_Gymnasium_11_12_2019.pdf`

Current activation state:

- the first Mecklenburg-Vorpommern source-json snapshots are active in shared provenance
- the lower-secondary and upper-secondary pilot snapshots are now fully mapped on source-goal level
- the lower-secondary mapping lane now carries first reviewed Orientierungsstufe `Klassen 5/6` arithmetic, geometry, and data/chance corridors plus first reviewed lower-secondary corridors in `Klasse 7`, `Klasse 8`, `Klasse 9`, and `Klasse 10`: `Klassen 5/6` now cover `Natuerliche Zahlen, Teilbarkeit, Brueche und Dezimalbrueche`, early plane geometry and cuboid/cube work, plus early statistical surveys and single-stage random experiments, `Klasse 7` covers functions, algebra, and geometry, `Klasse 8` contributes both a reviewed middle-stage linear-functions corridor plus a reviewed geometry corridor, `Klasse 9` contributes both a reviewed statistics corridor plus an explicit quadratics corridor, and `Klasse 10` carries both a reviewed later-probability corridor plus a reviewed late function corridor with `Exponential-/Logarithmusfunktionen` and `Sinusfunktionen`
- the upper-secondary mapping lane now also carries first reviewed analysis, stochastics, analytic-geometry / vectors, and linear-algebra / matrices corridors:
  - `Analysis`
  - `Grenzwerte und Stetigkeit`
  - `Ableitungen`
  - `Untersuchungen von Funktionen und ihrer Graphen`
  - `Anwendungen der Differentialrechnung`
  - `Stammfunktionen`
  - `Anwendungen der Integralrechnung`
  - `Stochastik`
  - `Wahrscheinlichkeitsrechnung und Statistik`
  - `Analytische Geometrie / Vektoren`
  - `Vektoren und Matrizen`
  - `Geraden und Ebenen`
  - `Lineare Algebra / Matrizen`
  - `Vektoren und Matrizen`
- current mapping counts:
  - lower-secondary: `44` mappings
  - upper-secondary: `15` mappings
  - total: `59` mappings
- the shared provenance registries now carry:
  - lower-secondary memberships and closures for `44` goals
  - upper-secondary memberships and closures for `15` goals

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable
- keep the reviewed MV analysis, AGV, and LM corridors broad until the source exposes narrower didactic residues cleanly
- the next operational step is no longer another MV pilot corridor but the next open Bundesland/input lane, most cleanly `TH`
