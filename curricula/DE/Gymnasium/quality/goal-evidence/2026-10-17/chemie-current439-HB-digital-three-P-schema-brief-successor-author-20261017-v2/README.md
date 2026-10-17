# Digital3 v2 — nine case-brief summary fields only

Technical AUTHOR successor, pending **two targeted follow-up reviews**.
All three whole profiles remain E1/G1, `needs_human_review`, `ai_candidate`.
No native fingerprint binding or approval is created.

Only nine previously overlong scalar fields change. Each entire original
pre-digital case text is preserved as an **exact prefix**; only the subsequently
appended new summary is replaced. The full new required expectations,
coverage, tasks not listed below, variations, whole operative cases, materials,
rubrics and blank performance fields remain exact.

| Goal | Case / field | Before | After |
|---|---|---:|---:|
| e81a4aed | 0 / taskDemandDe | 2092 | 1602 |
| e81a4aed | 0 / expectedPerformanceDe | 2186 | 1664 |
| e81a4aed | 1 / expectedPerformanceDe | 2061 | 1557 |
| 31781d00 | 0 / expectedPerformanceDe | 2383 | 1759 |
| 31781d00 | 0 / expectedPerformanceEn | 2146 | 1588 |
| 38e30bb9 | 0 / expectedPerformanceDe | 2189 | 1862 |
| 38e30bb9 | 0 / expectedPerformanceEn | 2016 | 1743 |
| 38e30bb9 | 1 / expectedPerformanceDe | 2223 | 1896 |
| 38e30bb9 | 1 / expectedPerformanceEn | 2044 | 1771 |

The maximum changed field is 1896 characters. The maximum across **all** case
brief scalars is 1927; every field is below the unchanged 2000-character limit.

## Complete bindings and checks

- `AUTHOR.three-whole-profiles.schema-brief-v2.pending.json`: all three full
  candidate profiles and unchanged whole goals.
- `DELTA.exact-nine-fields.before-after-charcounts.json`: full before/after
  text, exact retained original prefix and character counts for every edit.
- `BINDING.unchanged-whole-operative-materials.json`: M0 = all six full v1
  cases; M1 = electronic experimental recording; M2 = three-level digital
  representation; M3 = joint digital documentation/presentation. Exact paths,
  hashes and byte sizes retain the complete scientifically reviewed materials.
- `INPUT.clean-three-whole-profiles-and-nine-deltas.science.json`: whole old,
  original-author and v2 profile context plus all unchanged material bindings.
- `CHECKS.actual-Ajv2020-inner-profile-preflight.json`: **3/3 PASS**, using the
  installed application Ajv2020 against the existing contract's
  `properties.profile` fragment and unchanged `$defs`.

M0–M3 are explicit bindings, not missing material files or replacements for
the full requirements. The shortened summaries explicitly retain the named
complete required expectation and whole material as binding. No arbitrary
truncation, changed schema, relaxed length limit or new scientific task is used.

Original v1 author material and review files are unchanged. Root's failed
write receipt/candidate has been archived under
`chemie-current439-HB-five-paired-P-integration-20261017-v1/failed-casebrief-length-attempt/`;
the v2 input pins refer to those exact snapshots.

This package invokes no native writer, active file update, Git command,
whole-HB remapping, new source extraction, full build or science expansion.
The targeted follow-up reviews determine retention of meaning; a successful
schema preflight is not scientific or human acceptance.
