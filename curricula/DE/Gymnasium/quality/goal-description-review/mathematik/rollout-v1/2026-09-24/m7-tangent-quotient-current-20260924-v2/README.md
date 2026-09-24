# Tangensquotient: corrected-source current review

The canonical `4cba85d3-2e25-5c4b-9c4c-37e5b201dce7` source reference now
points to printed page 34 of the official 2016 Baden-Württemberg Mathematics
curriculum, where section 3.3.3, competence (7), actually appears (PDF page 36).
The matching BW source-extraction record has the same correction. The prior
one-goal v1 batch remains untouched as diagnostic evidence of the discovered
page-number error; its review results must not be carried forward as current
v2 decisions.

This v2 batch contains the exact PDF and HTML review bytes bound by
`bundle/manifest.json`. Do not re-render these files in place. Two new blind
rounds must review this exact current context. AI records and the eventual
AI synthesis grant no human attestation.

Presentation limitation: the generated GoalBook PDF prints the `$...$` TeX
delimiters and commands in this description literally. This does not alter
the reviewed canonical wording or the current visualization QA, but the PDF
renderer should be addressed separately; this batch does not claim a rendered
mathematical formula in its print derivative.

```bash
npm --prefix app run quality:goal-description-rollout-batch -- check --config curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-24/m7-tangent-quotient-current-20260924-v2.config.json
```
