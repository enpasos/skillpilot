# Materialized Mathematics assessment collections

Local CI repair for PR #159, 16 November 2026. This is neither remote CI
acceptance nor an activated state plan.

The CPV-211 collection check expected canonical year-9/year-10 folder IDs.
Sixteen deliberately materialized structures in eleven views already exposed
every independently applicable source task. They retain selected source tasks
while excluding tasks whose actual preparation belongs to a later stage.
Their source identity is now explicit in `canonicalSourceGoalId`. Runtime IDs,
labels, child order, task references and canonical goals remain unchanged.

The check accepts exactly one visible, nonempty structure bound to that source
collection and still checks each applicable task. Labels or identifier spelling
are not evidence. Negative tests reject missing declarations, empty containers
and a removed required task. Existing jurisdiction and prerequisite applicability
conditions are unchanged.

`applied.actual.json` binds all before/after view hashes and records the
metadata-only comparison. `diagnosis.actual.json` records the actual compiled
views before the repair. `receipt.actual.json` pins the implementation and local
checks. `full-cpv.log.gz` is the lossless complete validation output: 354 views,
21 canonical roots, zero errors and 2,388 existing warnings. Focused regression
tests, TypeScript, lint and all 18 generated Mathematics views also passed.
The independent review accepted this bounded change and exercised one real
positive plus five additional negative native cases; see
`independent-review.actual.json` and `independent-native-cases.actual.json`.
Its original temporary paths are retained in the receipt; the corresponding
files are preserved here without modifying the review bytes.
