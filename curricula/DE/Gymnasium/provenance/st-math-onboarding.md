# ST Math Onboarding Note

Status: P4 (`first_corridor_reviewed`)

Reserved source landscapes on `2026-03-28`:
- lower-secondary Gymnasium mathematics:
  - `sourceLandscapeId`: `251bcdfc-19eb-4543-8ff7-5fb9fef6b667`
  - snapshot key: `DE_SAN_S_GYM_1_MATHEMATIK`
- upper-secondary Gymnasium mathematics:
  - `sourceLandscapeId`: `000359cf-2dfb-4216-bc71-743f76917a35`
  - snapshot key: `DE_SAN_S_GYM_2_MATHEMATIK`

Archived official source inputs:
- `curricula/DE/Gymnasium/input/ST/Mathematik_FLP_Gym_01_07_2019.pdf`
- `curricula/DE/Gymnasium/input/ST/GSB_Gymnasium_010822_swd.pdf`

Current source snapshot files:
- `curricula/DE/Gymnasium/input/ST/lower-secondary/source-json/DE_SAN_S_GYM_1_MATHEMATIK.de.json.snapshot`
- `curricula/DE/Gymnasium/input/ST/upper-secondary/source-json/DE_SAN_S_GYM_2_MATHEMATIK.de.json.snapshot`

Current mapping files:
- `curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_math_lower_secondary_to_canonical_math.json`
- `curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_math_upper_secondary_to_canonical_math.json`

Phase notes:
- `P1`: archived the official Sachsen-Anhalt mathematics source PDFs.
- `P2`: derived the first lower-secondary and upper-secondary source snapshots with stable source goal IDs.
- `P3`: activated both Sachsen-Anhalt source landscapes in shared provenance registries and mapped the first structural anchors onto the shared canonical math spine.
- `P4`: opened the first reviewed Sek-II corridors on the Sachsen-Anhalt upper-secondary lane through explicit `GA/EA` analysis, stochastics, and analytic-geometry splits, the first reviewed lower-secondary foundations corridor on `JG 5/6`, and the first reviewed lower-secondary functions corridor on the `JG 5/6` correspondence / proportionality strip plus first reviewed lower-secondary data and geometry corridors on the `JG 5/6` data-display / measures-of-data and geometry-basics / area-volume strips.

Current anchor inventory:
- lower-secondary: `41` staged goals / `41` closures
- upper-secondary: `31` staged goals / `31` closures
- shared provenance is now active for both `DE_SAN` source landscapes
- lower-secondary: `5` structural spine mappings (`root`, `5/6`, `7/8`, `9`, `10`)
- upper-secondary: `27` mappings (`root`, structural `Analysis` / `AGV` / `Stochastik` anchors, plus the first reviewed `GA/EA` analysis, stochastics, and analytic-geometry corridors)
- lower-secondary: `17` mappings (`root`, year-band anchors, plus the first reviewed `JG 5/6` foundations corridor on the early algebra spine, the first reviewed `JG 5/6` functions corridor on the early function / proportionality surface, the first reviewed `JG 5/6` data corridor on the existing descriptive-statistics surface, and the first reviewed `JG 5/6` geometry corridor on the early geometry / space surface)`

Next suggested step:
- open the next reviewed Sachsen-Anhalt lower-secondary geometry corridor, most cleanly on the `JG 5/6` angle, triangle, and quadrilateral strips
