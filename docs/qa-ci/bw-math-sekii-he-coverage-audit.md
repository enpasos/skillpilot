# BW Mathematik Sek II: HE Coverage Audit

Date: 2026-05-07

This note documents the fachliche control audit behind the Baden-Wuerttemberg
upper-secondary mathematics source extraction. It explains why the BW Kursstufe
has fewer extracted source goals than Hessen Sek II without treating every
Hessen-only canonical target as a BW mapping gap.

## Scope

Inputs:

- BW official source extraction:
  `curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_MATHEMATIK_SEKII_BP2016.source-extraction.json`
- BW M3 review file:
  `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_source_extraction_to_canonical_math.review.json`
- canonical mathematics graph:
  `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- local audit generator:
  `tmp/audit-he-bw-sekii-gaps.mjs`

The comparison starts from canonical Sek-II atomics that are covered by Hessen
Sek II and not covered by expanded BW Sek-II mappings.

## Result

| Category | Count | Decision |
| --- | ---: | --- |
| Stage shift to BW Sek I or Kursstufen prerequisite | 78 | Not a BW Kursstufe M3 gap |
| Not explicit in BW BP2016 | 33 | Do not map to BW without additional official evidence |
| Manual remainder | 0 | No unresolved fachliche rest category |

Total Hessen-covered canonical Sek-II atomics not covered by expanded BW
Sek-II mappings: 111.

## Stage-Shift Interpretation

The 78 stage-shift cases are not open BW Kursstufe mappings. They are mostly:

- 48 Hessen E-phase foundations that BW places before the Kursstufe or treats as
  prerequisites
- 26 foundational stochastics goals that BW places in Sek I
- 4 additional Q4-adjacent fundamentals that are not Kursstufe-specific BW gaps

These goals may still be visible through BW Sek-I or prerequisite surfaces, but
they should not be forced into the BW Sek-II source extraction.

## Not-Explicit BW Delta

The 33 accepted curriculum deltas are:

| Group | Count | Decision |
| --- | ---: | --- |
| Differential equations and direction fields | 4 | Not found in BW BP2016 Kursstufe wording |
| Explicit combinatorics specializations | 3 | Not derived from generic probability wording |
| Advanced stochastics, intervals, tests, Poisson, normal approximation | 11 | Not explicit enough in BW BP2016 |
| Function-family specializations | 8 | Not derived from generic function-family wording |
| Advanced test decision from power-function graphs | 1 | Not explicit enough in BW BP2016 |
| Complex numbers and matrices | 6 | Not BW Kursstufe content in BP2016 |

Operational rule: these targets stay canonical where other jurisdictions support
them, but BW Sek II does not receive synthetic M3 coverage for them.

## Pipeline Consequence

For BW Sek II, MAPPING-2 and MAPPING-3 are allowed to complete when every
official BW source goal is extracted, reviewed, and mapped. The HE/BW audit is a
cross-curriculum plausibility check, not a requirement that BW reproduce every
Hessen Sek-II target.

The visible quality metric must therefore distinguish:

- source-internal completeness: all official BW source goals are handled
- cross-state curriculum delta: which canonical Hessen-covered targets are not
  explicitly present in BW

