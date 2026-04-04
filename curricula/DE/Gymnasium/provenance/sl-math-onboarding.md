# SL Math Onboarding Note

Status: P4 (`first_corridor_reviewed`)

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `9250478f-ebb4-438d-b6d9-738e1a6d574a`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Gymnasiale Oberstufe`):
  - `sourceLandscapeId`: `7d66c285-38b4-4031-9836-2bba5de68e24`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_math_upper_secondary_to_canonical_math.json`

Archived official source inputs on `2026-04-04`:

- `curricula/DE/Gymnasium/input/SL/LP_MA_gym9_5und6_2023.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_MA_gym9_7_2023.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_MA_gym9_8_2024.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_MA_gym9_9_2025.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_MA_gym9_10_2026.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_Ma_EP_GOS_2014.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_Ma_GOS_HP_G-Kurs_2016_Stand_2019.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_Ma_LK_HP_2019.pdf`
- `curricula/DE/Gymnasium/input/SL/Mathe_Handreichung.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_Anpassung_G8_MA_SekII.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_Anpassung_G8_MA_SekII_2025.pdf`
- `curricula/DE/Gymnasium/input/SL/APA_Mathematik_2019.pdf`

Current activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures still exist with the reserved source-landscape IDs above
- the first Saarland lower-secondary and upper-secondary source snapshots are now active in shared provenance
- the archived upper-secondary bundle also includes an explicit transition handout for the MBA -> EP bridge
- shared provenance is now active for both `DE_SAR` source landscapes
- the shared provenance registries now carry:
  - lower-secondary memberships and closures for `53` goals
  - upper-secondary memberships and closures for `39` goals
- first structural anchor mappings are now active for both lanes
- lower-secondary reviewed coverage now includes:
  - a first explicit `Klassenstufe 7` function corridor with `Zuordnungen`, `proportionale Zuordnungen`, and `umgekehrt proportionale Zuordnungen`
  - a first explicit `Klassenstufe 7` algebra corridor with `Rationale Zahlen`, `Terme, Gleichungen und Ungleichungen`, and `Prozentrechnung`
  - a first explicit `Klassenstufe 7` geometry corridor with the broad `Raum und Form` strip on the shared Sek-I geometry surface
  - a first explicit `Klassenstufe 7` data/chance corridor with the broad `Daten und Zufall` strip on the shared Sek-I data/chance surface
  - a first explicit `Klassenstufe 7` measurement corridor with the broad `Größen und Messen` strip on the shared early Sek-I measurement / area / volume surface
  - a first explicit `Klassenstufe 8` algebra corridor with the broad `Zahl und Operation` strip on the shared Sek-I algebra surface
  - a first explicit `Klassenstufe 8` functions corridor with the broad `Strukturen und funktionaler Zusammenhang` strip on the shared Sek-I function-foundations surface
  - a first explicit `Klassenstufe 8` geometry corridor with the broad `Raum und Form` strip on the shared Sek-I geometry surface
  - a first explicit `Klassenstufe 8` data/chance corridor with the broad `Daten und Zufall` strip on the shared Sek-I data/chance surface
  - a first explicit `Klassenstufe 8` measurement corridor with the broad `Größen und Messen` strip on the shared early Sek-I measurement / area / volume surface
  - a first explicit `Klassenstufe 9` algebra corridor with the broad `Zahl und Operation` strip on the shared Sek-I algebra surface
  - a first explicit `Klassenstufe 9` functions corridor with the broad `Strukturen und funktionaler Zusammenhang` strip on the shared broad Sek-I function surface
  - a first explicit `Klassenstufe 9` geometry corridor with the broad `Raum und Form` strip on the shared Sek-I geometry surface
  - a first explicit `Klassenstufe 9` data/chance corridor with the broad `Daten und Zufall` strip on the shared Sek-I data/chance surface
  - a first explicit `Klassenstufe 9` measurement corridor with the broad `Größen und Messen` strip on the shared early Sek-I measurement / area / volume surface
  - a first explicit `Klassenstufe 10` algebra corridor with the broad `Zahl und Operation` strip on the shared Sek-I algebra surface
  - a first explicit `Klassenstufe 10` functions corridor with the broad `Strukturen und funktionaler Zusammenhang` strip on the shared broad Sek-I function-foundations surface
  - a first explicit `Klassenstufe 10` geometry corridor with the broad `Raum und Form` strip on the shared Sek-I geometry surface
  - a first explicit `Klassenstufe 10` data/chance corridor with the broad `Daten und Zufall` strip on the shared Sek-I data/chance surface
  - a first explicit `Klassenstufe 10` measurement corridor with the broad `Groessen und Messen` strip on the shared early Sek-I measurement / area / volume surface
- upper-secondary reviewed coverage now includes:
  - analysis corridor splits across `Einführungsphase`, `Hauptphase G-Kurs`, and `Hauptphase Leistungskurs`
  - stochastics corridor splits across `G-Kurs` and `Leistungskurs`
  - analytic-geometry corridor splits across `G-Kurs` and `Leistungskurs`

Snapshot scope:

- lower-secondary snapshot:
  - broad year anchors `5/6`, `7`, `8`, `9`, `10`
  - broad leitidee anchors per year
- upper-secondary snapshot:
  - broad `Einführungsphase`, `Hauptphase G-Kurs`, `Hauptphase Leistungskurs`
  - reviewed analysis, stochastics, and analytic-geometry corridor splits

Operational rule from here:

- keep the reserved `sourceLandscapeId` values stable
- keep the shared provenance registries aligned with future in-place Saarland source splits
- keep the reviewed Saarland upper-secondary splits stable and continue with equally explicit lower-secondary corridors next, keep the now broadly reviewed Saarland lower-secondary lane stable and switch to the next still-open lane
- use the transition handout only as interpretive support, not as the primary source spine
