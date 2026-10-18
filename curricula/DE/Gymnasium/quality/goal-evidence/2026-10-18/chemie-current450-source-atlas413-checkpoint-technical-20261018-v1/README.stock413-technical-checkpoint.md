# Chemistry source atlas: measured 413-goal checkpoint

Technical result: **413/450 published source-atlas atoms**, 37 omitted, 48 source views. Exactly three existing goal IDs enter the atlas union; none is removed. All **496 whole source-HOLD objects remain exact**. The omitted rows are unchanged except removal of those three newly witnessed IDs: 31 `no-reviewed-mapped-source-witness`, 6 `unresolved-source-scope`.

## Four existing reviewed witnesses

| Goal | Exact source scope | Primary scope checked |
| --- | --- | --- |
| `4a7dee38` pharmaceutical quality control | RP SekII GK and LK | Physical/printed p38, optional W5h unit2.3, common Grund-/Leistungsfach quality-control component |
| `f4f7f028` film fixing | SN SekII GK only | Physical p41 / printed p29, J11 GK optional Wahlbereich1; explaining silver-bromide dissolution through complexation, adjacent experiment separate |
| `0559cec7` reaction-condition comparison | TH SekII LK only | Physical p58 / printed p53, additional elevated right column; neighbouring structure and practical duties separate |

The current source-goal objects, operative mapping edges/decisions and preserved source/course integration reviews were actually read. The three current local primary PDF pages were read with `pdftotext -layout`; existing raster/source reviews remain separate prior evidence. Exact source IDs, extraction/mapping paths, object hashes and review pins are in `READ.actual-four-primary-source-scope-witnesses-and-existing-reviews.json`. No new source decision or whole-source approval is created. Optional units remain optional; actual learner choice is not asserted.

## Authored and generated changes

Only these two authored files changed:

- `app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json`: expected count 410 → 413.
- `app/scripts/testGoalBookSourceAtlasInputs.ts`: exact 413/37/31 omission expectations plus the separate four-witness regression and course/optional guards. The prior ten-goal matrix is byte unchanged and retains all 47 actual witness rows.

The unchanged scoped stock generator wrote its 51 standard Chemistry output paths. Exactly seven output files changed bytes: RP GK/LK, SN GK and TH LK source views, `source-projection.receipt.json`, `de-gym-chemistry-national-atlas.sources.json`, and `navigation/de-gym-chemistry-national-atlas.view.json`. Full normal paths and before/after pins are in `RESULT.actual413-four-witnesses-and-unchanged-source-contract.json`.

All 113 bound source/canonical/SEM/registry/review inputs remained exact. The existing root-frozen 41 normal learner views and whole P450 aggregate were separately confirmed exact. No canonical, P, D, registry, source-decision, floor or runtime change was made.

## Actual gates

1. Scoped original `buildGoalBookSourceAtlasInputs.ts --config …chemistry…inputs.json`: **PASS**, exit0, 1.817s.
2. The same original scoped CLI with `--check`: **PASS**, exit0, 1.830s.
3. Actual exported `testGoalBookSourceAtlasInputs()`: **PASS**, exit0, 5.241s, including source/PDF/HTML/boundary fixtures and mandatory-input offline Git-tracked closure. Root explicitly staged the two already integrated RP/TH extracts; the 125-path Chemistry mandatory closure then had no missing tracked input.

Original stdout/stderr and terminal objects are preserved. The initial temporary diagnostic served as a locator for the three expected additions; every witness was checked against normal source inputs, existing reviews and the actual regenerated receipt. Access to temporary diagnostics is not required for this evidence.

This is a commit-ready technical intermediate state. It does not close the 496 HOLDs, grant source credit to own transfers, create new scientific/native/human approval or assert M7 completion. Technical scripts/manifests follow Apache-2.0; existing content and source rights remain unchanged.
