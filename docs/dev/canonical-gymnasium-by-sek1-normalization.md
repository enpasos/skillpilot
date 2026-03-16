# Bavaria Sek I Year-Level Normalization

Snapshot: `2026-03-16`

This note turns the new Sek-I normalization rule into an operational inventory for the Bavaria source snapshot under `curricula/DE/Gymnasium/input/DE-BY/gymnasium/`.

It complements:

- `docs/dev/canonical-gymnasium-by-math-sek1-probe.md`
- `docs/dev/canonical-gymnasium-migration-status.md`

Working rule:

- preserve Bavaria source truth, including any `G8` / `G9` labels, in provenance and archived input
- normalize the first canonical Sek-I migration work onto the shared G9-aligned year grid `5-10`
- avoid separate canonical G8 and G9 branches unless later runtime use cases require them

## Inventory summary

Observed in the current Bavaria source snapshot:

- subject JSON files in archive: `45`
- subjects with any Sek-I year coverage `5-10`: `31`
- subjects with explicit `G8` markers in titles: `2`
  - `Geschichte`
  - `Politik_und_Gesellschaft`
- subjects with explicit `G9` markers in titles: `3`
  - `Geschichte`
  - `Politik_und_Gesellschaft`
  - `Sozialpraktische_Grundbildung`

Grade coverage counts across the `31` Sek-I-capable subjects:

| Canonical year bucket | Subjects with observed source coverage |
| --- | ---: |
| `5` | `16` |
| `6` | `16` |
| `7` | `17` |
| `8` | `25` |
| `9` | `29` |
| `10` | `29` |

Interpretation:

- Bavaria Sek I source coverage becomes much denser from year `8` onward.
- Year `5-7` already have broad coverage in languages, math, arts, religion/ethics, sport, and `Natur_und_Technik_(Gym)`.
- Science-heavy adoption corridors in Bavaria naturally start at `8-10`, which still fits the shared canonical `5-10` grid.

## Migration-status implication

This inventory is now stable enough to guide the next Bavaria breadth increase, but by itself it is still planning evidence rather than delete-handoff proof.

As of `2026-03-16`:

- `31` Bavaria subjects show some Sek-I coverage on the shared `5-10` grid
- `6` Bavaria Gymnasium pilot mapping files are currently adopted in the DE-level mapping lane
- therefore `curricula/DE/BY/Gymnasium` remains `partial` on canonical replacement breadth in the current delete matrix

Practical consequence:

- the next percentage increase should come from adopting at least one additional Bavaria subject corridor from Cohort A or Cohort C beyond the current Math/Physics/Chemistry/Biology/Informatik/Deutsch/Wirtschaft_und_Recht lane
- more inventory detail alone should not raise the reported migration headline beyond the current `96.7%`

## Entry cohorts

The Bavaria Sek-I source snapshot currently falls into four practical entry cohorts.

### Cohort A: starts in canonical year `5`

These subjects already align naturally with a shared `5-10` year grid.

- `Deutsch`
- `Englisch`
- `Ethik`
- `Evangelische_Religionslehre`
- `Französisch`
- `Geographie`
- `Islamischer_Unterricht`
- `Israelitische_Religionslehre`
- `Katholische_Religionslehre`
- `Kunst`
- `Latein`
- `Mathematik`
- `Musik`
- `Natur_und_Technik_(Gym)`
- `Orthodoxe_Religionslehre`
- `Sport`

### Cohort B: starts in canonical year `6`

- `Geschichte`

Note:

- `Geschichte` already contains explicit `G8` and `G9` labels in source titles.
- Canonical migration should still target shared year buckets `6-10`, while preserving those source labels in provenance.

### Cohort C: starts in canonical year `8`

- `Biologie`
- `Chemie`
- `Chinesisch`
- `Griechisch`
- `Italienisch`
- `Physik`
- `Politik_und_Gesellschaft`
- `Russisch`
- `Spanisch`
- `Wirtschaft_und_Recht`

Note:

- This is the strongest practical corridor for Bavaria subject adoption into the shared canonical Sek-I layer.
- `Politik_und_Gesellschaft` contains explicit `G8` and `G9` source labels; canonical authoring should still land on year buckets `8-10`.

### Cohort D: starts in canonical year `9`

- `Berufliche_Orientierung`
- `Informatik`
- `Sozialpraktische_Grundbildung`
- `Wirtschaftsinformatik`

Note:

- These subjects are late-entry Sek-I corridors and should not define the first canonical lower-secondary spine.

## Priority subjects for the first Bavaria Sek-I normalization pass

The first pass should focus on subjects that are both migration-relevant and structurally useful for later cross-state convergence.

| Subject | Observed Sek-I years | Explicit `G8` marker | Explicit `G9` marker | Recommendation |
| --- | --- | --- | --- | --- |
| `Mathematik` | `5, 6, 7, 8, 9, 10` | no | no | best Bavaria lower-secondary spine candidate |
| `Physik` | `8, 9, 10` | no | no | good science corridor on shared year grid |
| `Chemie` | `8, 9, 10` | no | no | good science corridor on shared year grid |
| `Biologie` | `8, 9, 10` | no | no | good science corridor on shared year grid |
| `Deutsch` | `5, 6, 7, 8, 9, 10` | no | no | broad continuous year coverage |
| `Englisch` | `5, 6, 7, 8, 9, 10` | no | no | broad continuous year coverage |
| `Französisch` | `5, 6, 7, 8, 9, 10` | no | no | broad continuous year coverage |
| `Geschichte` | `6, 7, 8, 9, 10` | yes | yes | special handling for mixed source labels |
| `Informatik` | `9, 10` | no | no | late-entry bridge only |
| `Wirtschaft_und_Recht` | `8, 9, 10` | no | no | useful economics-related corridor |
| `Politik_und_Gesellschaft` | `8, 9, 10` | yes | yes | special handling for mixed source labels |

## Recommended next implementation order

1. Use `Mathematik` as the first Bavaria Sek-I normalization probe because it already spans the full shared year grid `5-10`.
   Detailed probe note: `docs/dev/canonical-gymnasium-by-math-sek1-probe.md`
2. Add the science corridor `Physik`, `Chemie`, `Biologie` on the shared `8-10` buckets.
3. Add `Geschichte` and `Politik_und_Gesellschaft` only after the mixed `G8` / `G9` provenance handling is stable in mappings.
4. `Informatik`, `Deutsch`, and `Wirtschaft_und_Recht` have now landed as reviewed Bavaria bridges; keep `Berufliche_Orientierung`, `Sozialpraktische_Grundbildung`, and `Wirtschaftsinformatik` as secondary work rather than part of the canonical lower-secondary spine.

## Practical consequence for mapping work

For Bavaria Sek I, the next concrete mapping task should not ask:

- "Is this G8 or G9 canonical content?"

It should ask:

- "Which canonical year bucket `5`, `6`, `7`, `8`, `9`, `10` does this source goal belong to?"

The original `G8` / `G9` signal remains important, but only as provenance and audit context for the first migration phase.
