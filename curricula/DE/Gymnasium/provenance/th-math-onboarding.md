# TH Math Onboarding Note

Status: P5 (`broad_reviewed_coverage`)

This note records the first Thueringen source-landscape identifiers for the mathematics-first DE expansion track and their now-active broad-reviewed-coverage state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `25444927-45d3-486c-8e7f-39853e7de610`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`classes 11-12`):
  - `sourceLandscapeId`: `cced401d-58d5-4832-b010-3b3466d0655b`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_math_upper_secondary_to_canonical_math.json`

Archived input state on `2026-04-04`:

- archived public 2018 Gymnasium mathematics PDF:
  - `curricula/DE/Gymnasium/input/TH/lp_gy_mathematik_10.04.2019_TSP.pdf`
  - official URL: `https://www.schulportal-thueringen.de/tip/resources/medien/19980?dateiname=lp_gy_mathematik_10.04.2019_TSP.pdf`
- archived public 2025 Gymnasium mathematics PDF for classes `5/6` and `11/12`:
  - `curricula/DE/Gymnasium/input/TH/LP_GY_Mathematik_Entwurfsfassung2025.pdf`
  - official URL: `https://www.schulportal-thueringen.de/tip/resources/medien/65648?dateiname=LP_GY_Mathematik_Entwurfsfassung2025.pdf`
- archived public detail page for the currently relevant 2025 mathematics curriculum:
  - `curricula/DE/Gymnasium/input/TH/lehrplan-mathematik-gymnasium-2025-detail.html`
  - official detail URL: `https://www.schulportal-thueringen.de/media/detail?tspi=18835`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures still exist
- Thueringen now has active source-json snapshots:
  - `curricula/DE/Gymnasium/input/TH/lower-secondary/source-json/DE_THU_S_GYM_1_MATHEMATIK.de.json.snapshot`
  - `curricula/DE/Gymnasium/input/TH/upper-secondary/source-json/DE_THU_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the lower-secondary snapshot combines the 2025 `Klassenstufen 5/6` learning areas with broad 2018 bridge anchors for `Klassenstufen 7/8` and `9/10`
- the upper-secondary snapshot combines the 2018 `Klassenstufe 11` bridge with broad `Analysis`, `Analytische Geometrie`, and `Stochastik` anchors for `11/12`
- shared provenance registries are now active for both lanes:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the reviewed exact Thueringen lower-secondary and upper-secondary orientation anchors now also contribute canonical goal provenance in `canonical-goal-provenance-registry.json`
- the first structural anchor mappings are now active:
  - lower-secondary root and orientation are connected
  - the broad lower-secondary `5/6`, `7/8`, and `9/10` source parents stay as structural bridges on the canonical mathematics root because the current Thueringen packaging has no direct combined canonical year-anchor counterpart
  - lower-secondary broad topic strips now sit on the shared Sek-I arithmetic, functions, geometry, measurement, and data/chance surfaces
  - `Klassenstufen 9/10: Funktionen` is deliberately still left out of this first anchor pass because the current broad source strip crosses the visible `F4` / late-`J10` boundary too broadly for a clean one-bridge placement
  - upper-secondary root and orientation are connected
  - `Klassenstufe 11: Funktionen`, `Geometrie`, and `Stochastik` now sit on the broad Sek-II analysis, space/matrix, and stochastics spines
  - `Klassenstufen 11/12: Analysis`, `Analytische Geometrie`, and `Stochastik` now sit on the same broad Sek-II spines
  - `Klassenstufe 11: Arithmetik/Algebra` stays as a broad structural bridge on the canonical mathematics root because there is currently no narrower neutral Sek-II aggregate node for that mixed source strip
- Thueringen now also has the first reviewed upper-secondary analysis corridor:
  - `th-sek2-analysis-corridor`
  - `Analysis`
  - contains:
    - `th-sek2-j11-functions`
    - `th-sek2-j12-analysis`
  - the corridor stays deliberately broad on the shared analysis surface and does not force a visible `AN5`
- Thueringen now also has the first reviewed upper-secondary stochastics corridor:
  - `th-sek2-stochastics-corridor`
  - `Stochastik`
  - contains:
    - `th-sek2-j11-stochastics`
    - `th-sek2-j12-stochastics`
  - `Klassenstufe 11: Stochastik` now sits on the broad `Wahrscheinlichkeiten und Verteilungen` surface, while the broad `11/12` strip stays on the shared `Stochastik, Tests und Statistik` surface
- Thueringen now also has the first reviewed upper-secondary analytic-geometry corridor:
  - `th-sek2-analytic-geometry-corridor`
  - `Analytische Geometrie / Vektoren`
  - contains:
    - `th-sek2-j11-geometry`
    - `th-sek2-j12-analytic-geometry`
  - both source strips stay deliberately broad on the shared space-geometry surface and do not force a sharper `AGV3-AGV5` split
- Thueringen now also has the first reviewed upper-secondary linear-algebra corridor:
  - `th-sek2-linear-algebra-corridor`
  - `Lineare Algebra / Matrizen`
  - contains:
    - `th-sek2-j11-geometry`
    - `th-sek2-j12-analytic-geometry`
  - the current source still has no narrower explicit matrix strip, so this corridor deliberately reuses the same broad Raum-/AGV packaging on the shared space-/matrix surface
- Thueringen now also has the first reviewed lower-secondary algebra corridor:
  - `th-sek1-j5-6-algebra-corridor`
  - `Klassenstufen 5/6: Natuerliche Zahlen und gebrochene Zahlen`
  - contains:
    - `th-sek1-j5-6-natural-numbers`
    - `th-sek1-j5-6-fractions`
  - both source strips stay deliberately on the shared early arithmetic surface and do not force a new early-algebra package
- Thueringen now also has the first reviewed lower-secondary geometry corridor:
  - `th-sek1-j5-6-geometry-corridor`
  - `Klassenstufen 5/6: Figuren, Koerper, Dreiecke und Kreis`
  - contains:
    - `th-sek1-j5-6-shapes-solids`
    - `th-sek1-j5-6-triangles-circle`
  - both source strips stay deliberately on the shared early geometry / space surface and do not force a sharper early split
- Thueringen now also has the first reviewed lower-secondary data/chance corridor:
  - `th-sek1-j5-6-data-chance-corridor`
  - `Klassenstufen 5/6: Daten und Zufall`
  - contains:
    - `th-sek1-j5-6-data-display`
    - `th-sek1-j5-6-statistics-chance`
  - `Daten erfassen und darstellen` stays on the early data surface, while the mixed `statistische Kenngroessen und mit Zufall experimentieren` strip stays deliberately on the broad Sek-I data/chance surface
- Thueringen now also has the first reviewed lower-secondary functions corridor:
  - `th-sek1-j5-6-functions-corridor`
  - `Klassenstufen 5/6: Zuordnungen`
  - contains:
    - `th-sek1-j5-6-mappings`
  - the source stays deliberately on the shared early mappings surface and does not force a broader early function split
- Thueringen now also has the first reviewed broad `Klassenstufen 7/8` algebra corridor:
  - `th-sek1-j7-8-algebra-corridor`
  - `Klassenstufen 7/8: Arithmetik und Algebra`
  - contains:
    - `th-sek1-j7-8-algebra`
  - the source stays deliberately on the shared broad Sek-I algebra surface and does not yet force a sharper reviewed split inside the `7/8` lane
- Thueringen now also has the first reviewed broad `Klassenstufen 7/8` functions corridor:
  - `th-sek1-j7-8-functions-corridor`
  - `Klassenstufen 7/8: Funktionen`
  - contains:
    - `th-sek1-j7-8-functions`
  - the source stays deliberately on the shared broad Sek-I function surface and does not yet force a sharper reviewed split inside the `7/8` lane
- Thueringen now also has the first reviewed broad `Klassenstufen 7/8` geometry corridor:
  - `th-sek1-j7-8-geometry-corridor`
  - `Klassenstufen 7/8: Geometrie`
  - contains:
    - `th-sek1-j7-8-geometry`
  - the source stays deliberately on the shared broad Sek-I geometry surface and does not yet force a sharper reviewed split inside the `7/8` lane
- Thueringen now also has the first reviewed broad `Klassenstufen 7/8` data/chance corridor:
  - `th-sek1-j7-8-data-chance-corridor`
  - `Klassenstufen 7/8: Stochastik`
  - contains:
    - `th-sek1-j7-8-stochastics`
  - the source stays deliberately on the shared broad Sek-I data/chance surface and does not yet force a sharper reviewed split inside the `7/8` lane
- Thueringen now also has the first reviewed broad `Klassenstufen 9/10` algebra corridor:
  - `th-sek1-j9-10-algebra-corridor`
  - `Klassenstufen 9/10: Arithmetik und Algebra`
  - contains:
    - `th-sek1-j9-10-algebra`
  - the source stays deliberately on the shared broad Sek-I algebra surface and does not yet force a sharper reviewed split inside the `9/10` lane
- Thueringen now also has the first reviewed broad `Klassenstufen 9/10` geometry corridor:
  - `th-sek1-j9-10-geometry-corridor`
  - `Klassenstufen 9/10: Geometrie`
  - contains:
    - `th-sek1-j9-10-geometry`
  - the source stays deliberately on the shared broad Sek-I geometry surface and does not yet force a sharper reviewed split inside the `9/10` lane
- Thueringen now also has the first reviewed broad `Klassenstufen 9/10` data/chance corridor:
  - `th-sek1-j9-10-data-chance-corridor`
  - `Klassenstufen 9/10: Stochastik`
  - contains:
    - `th-sek1-j9-10-stochastics`
  - the source stays deliberately on the shared broad Sek-I data/chance surface and does not yet force a sharper reviewed split inside the `9/10` lane
- Thueringen now also has the first reviewed broad `Klassenstufen 9/10` functions corridor:
  - `th-sek1-j9-10-functions-corridor`
  - `Klassenstufen 9/10: Funktionen`
  - contains:
    - `th-sek1-j9-10-functions`
  - the source stays deliberately on the shared broad Sek-I function surface because it crosses the visible `F4` / late-`J10` boundary too broadly for a narrower reviewed split
- current source goal counts:
  - lower-secondary: `33`
  - upper-secondary: `15`
- current active mapping counts:
  - lower-secondary: `33`
  - upper-secondary: `15`

Operational rule from here:

- keep the reserved `sourceLandscapeId` values stable
- keep the current anchor mappings stable as the baseline
- keep Thueringen stable as a source-covered comparison lane; the next Thueringen-specific cleanup step is the shared `P6/F6` learner-facing scope stabilization, not more topic breadth
