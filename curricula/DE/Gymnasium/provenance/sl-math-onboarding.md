# SL Math Onboarding Note

Status: P1 (`partial_inputs_archived`)

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
- `curricula/DE/Gymnasium/input/SL/LP_MA_gym9_9_2025.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_Ma_EP_GOS_2014.pdf`
- `curricula/DE/Gymnasium/input/SL/Mathe_EK_GOS_2020.pdf`
- `curricula/DE/Gymnasium/input/SL/LP_Anpassung_G8_Ma_SekII_2023.pdf`
- `curricula/DE/Gymnasium/input/SL/APA_Mathematik_2019.pdf`

Current activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures still exist with the reserved source-landscape IDs above
- the first public Saarland mathematics source bundle is now archived locally under `curricula/DE/Gymnasium/input/SL/`
- shared provenance registries are intentionally still inactive for both lanes
- no archived Saarland source-json snapshot is active yet
- the currently archived lower-secondary bundle is still partial and should be widened before snapshot activation if cleaner `7/8` and `10` curriculum files appear

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Saarland mathematics source bundle is refined under `curricula/DE/Gymnasium/input/SL/`
- derive the first lower-secondary and upper-secondary source snapshots from the archived PDF bundle before activating shared provenance
- prefer lower-secondary snapshot staging first, then the upper-secondary lane
