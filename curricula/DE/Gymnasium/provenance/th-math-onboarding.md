# TH Math Onboarding Note

This note records the first Thueringen source-landscape identifiers for the mathematics-first DE expansion track and their current pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `25444927-45d3-486c-8e7f-39853e7de610`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`classes 11-12`):
  - `sourceLandscapeId`: `cced401d-58d5-4832-b010-3b3466d0655b`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_math_upper_secondary_to_canonical_math.json`

Archived input state on `2026-04-03`:

- archived public 2018 Gymnasium mathematics PDF:
  - `curricula/DE/Gymnasium/input/TH/lp_gy_mathematik_10.04.2019_TSP.pdf`
  - official URL: `https://www.schulportal-thueringen.de/tip/resources/medien/19980?dateiname=lp_gy_mathematik_10.04.2019_TSP.pdf`
- archived public detail page for the currently relevant 2025 mathematics curriculum:
  - `curricula/DE/Gymnasium/input/TH/lehrplan-mathematik-gymnasium-2025-detail.html`
  - official detail URL: `https://www.schulportal-thueringen.de/media/detail?tspi=18835`
- current blocker:
  - the 2025 Gymnasium mathematics PDF for classes `5/6` and `11/12` is referenced on the official detail page but the direct file request currently returns an access-restricted HTML response instead of a PDF

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures still exist
- shared provenance registries are still inactive for both lanes
- Thueringen now has a partially archived official mathematics input bundle, but no source-json snapshot is active yet

Operational rule from here:

- keep the reserved `sourceLandscapeId` values stable
- prefer resolving the current 2025 Gymnasium mathematics source access next, because upper-secondary coverage against the canonical `Sek II` corridors should not be based only on the archived 2018 document
- activate shared provenance only after a real source-json snapshot with stable source goal IDs exists
