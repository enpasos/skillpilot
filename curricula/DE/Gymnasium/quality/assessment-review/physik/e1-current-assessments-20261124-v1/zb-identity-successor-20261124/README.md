# ZB: distinct reviewed assessment identity

The signed successor `bcc56921-7107-5f5f-b721-3d5e0d7e1cd9` is offered in the
same 64 view slots as the prior active edition. The 72-goal preparation is
unchanged. Both actual independent signed reviews accept exactly 35.5/36.
Their inputs, outputs, execution metadata and digests are bound by
`identity-activation.actual.json`; no earlier review is relabelled.

The original UUID `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` retains the complete
production 22/36 exam material under the historical cluster. Only explicit
applicability exclusion metadata is added. Its four DE/EN task and solution
body hashes match the October review. The intervening 36/36 PR edition stays
as a separate immutable snapshot. Historical learner evidence is never an
alias for the new task, its threshold or whole-goal MOD coverage.

Run from the repository root with the repository's Node/tsx toolchain:

```sh
node app/node_modules/tsx/dist/cli.mjs curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/zb-identity-successor-20261124/verify-identity-successor.mts
node app/node_modules/tsx/dist/cli.mjs curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24/zb-successor-voluntary-scope-20261124/verify-scope-successor.mts
```

The first checker replays the actual review pins and current native projections
for all 90 views, requiring 64 unchanged slots and zero visible archived tasks.
The second checks the sole parent-material delta (first voluntary assessment
UUID), the frozen before material and live after material, all four unchanged
mandatory parts, D′ R2 and the existing D→BES planning release. No new planning
credit is granted.

The older D′ planning observation remains pinned to the frozen before material.
Its whole-parent-material observation has an explicit additive successor at
`quality/learning-units/physics-he-e1-planning-release-2026-11-24/zb-successor-voluntary-scope-20261124/`.
Neither the old record nor its original standalone checker is rewritten.

ZB is a standalone voluntary assessment, outside the integer-only own-unit
assessment revision helper. Its genuine 35.5 threshold is preserved; native
Java material hashing and learner-result isolation are verified separately.
The generator execution logs record the real isolated overlay runs; current
read-only checks verify the subsequently copied live output.
