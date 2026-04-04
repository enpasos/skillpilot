# RP Math Onboarding Note

Status: P4 (`first_corridor_reviewed`)

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `810f8134-b4be-4f16-9b14-e50228b30bdd`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Mainzer Studienstufe`):
  - `sourceLandscapeId`: `2095b9f8-9d79-40bb-9601-3133ebb6f355`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_math_upper_secondary_to_canonical_math.json`

Archived official source inputs on `2026-04-03`:

- `curricula/DE/Gymnasium/input/RP/Mathematik_Sekundarstufe_I.pdf`
- `curricula/DE/Gymnasium/input/RP/Mathematik_Sekundarstufe_I_Anregungen_5_6.pdf`
- `curricula/DE/Gymnasium/input/RP/Mathematik_Sekundarstufe_I_Anregungen_7_8.pdf`
- `curricula/DE/Gymnasium/input/RP/Mathematik_Sekundarstufe_I_Anregungen_9_10.pdf`
- `curricula/DE/Gymnasium/input/RP/Mathematik_Sekundarstufe_II_MSS.pdf`

Current activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures still exist with the reserved source-landscape IDs above
- the first public Rheinland-Pfalz mathematics PDF bundle is now archived locally under `curricula/DE/Gymnasium/input/RP/`
- the first Rheinland-Pfalz source-json snapshots are now staged at
  - `curricula/DE/Gymnasium/input/RP/lower-secondary/source-json/DE_RLP_S_GYM_1_MATHEMATIK.de.json.snapshot`
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_MATHEMATIK.de.json.snapshot`
- shared provenance registries are now active for both RP lanes
- first structural anchor mappings are now in place for both RP lanes
- the first reviewed lower-secondary function and algebra corridors are now open in classes 7 and 8, the first reviewed lower-secondary data/chance corridor is now open in classes 9 and 10, and the first reviewed lower-secondary geometry corridor is now open in classes 9 and 10
- active snapshot scope:
  - lower-secondary: `30` goals / `30` closures / `30` mappings
  - upper-secondary: `35` goals / `35` closures / `35` mappings

Operational rule from here:

- keep the reserved `sourceLandscapeId` values stable while refining or activating the shared RP lower-secondary and upper-secondary source snapshots
- the reviewed RP upper-secondary analysis, stochastics, and combined geometry / linear algebra corridors are now open on top of the active anchor pass
- the next operational step is the next reviewed RP lower-secondary strip beyond the first geometry pass
