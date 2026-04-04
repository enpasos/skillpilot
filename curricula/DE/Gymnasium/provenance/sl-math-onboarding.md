# SL Math Onboarding Note

Status: P0 (`mapping_scaffolded`)

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `9250478f-ebb4-438d-b6d9-738e1a6d574a`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Gymnasiale Oberstufe`):
  - `sourceLandscapeId`: `7d66c285-38b4-4031-9836-2bba5de68e24`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_math_upper_secondary_to_canonical_math.json`

Source situation on `2026-04-04`:

- official Saarland mathematics source anchors and direct download targets are identified
- the first automated archive attempt was invalid: the fetched files were `bunny-shield` HTML challenge pages, not PDF binaries
- those invalid placeholder files were removed again from `curricula/DE/Gymnasium/input/SL/`
- shared provenance registries are intentionally still inactive for both lanes
- no archived Saarland source-json snapshot is active yet

Known official source anchors:

- gymnasiale Oberstufe landing page:
  - `https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node`
- direct official lower-/upper-secondary document targets are documented in:
  - `curricula/DE/Gymnasium/input/SL/README.md`

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the Saarland source lane is still blocked at archival stage
- do not promote `DE-SL` back to `P1` until valid PDF binaries are archived locally
- prefer a manual browser download or a browser-capable fetch step that can complete the `bunny-shield` challenge before deriving the first snapshots
