# Curriculum Quality, Validation, and Champion Handbook — Single-Source Authoring

This directory is the canonical bilingual source (`de` + `en`) for **Compendium Volume IV: Curriculum Quality, Validation, and Champion Handbook** (`docs/qa-ci/skillpilot-curriculum-quality-handbook.{de,en}.pdf`) and its 12 generated Web Markdown pages:

1. `01-quality-and-human-trial.{de,en}.md` — QA Maturity Levels (`M0`–`M7`) and Human Trial (`docs/concept/curriculum-quality-and-human-trial.{md,en.md}`)
2. `02-maturity-scopes-cqr.{de,en}.md` — Curriculum Quality: Maturity, QA Scopes, and `CQR-*` Rules (`docs/qa-ci/curriculum-quality-maturity-and-routes.{md,en.md}`)
3. `03-graph-validation-rules.{de,en}.md` — Algorithmic Graph, Applicability, and Composition-View Validation (`docs/qa-ci/graph-validation-rules.{md,de.md}`)
4. `04-semantic-atomicity-review.{de,en}.md` — Semantic Atomicity Review (`docs/qa-ci/semantic-atomicity-review.{md,de.md}`)
5. `05-champion-guide.{de,en}.md` — Curriculum Champion Guide (`docs/qa-ci/champion-guide.{md,de.md}`)
6. `06-four-level-champion-model.{de,en}.md` — Four-Level Champion QA Model (`docs/qa-ci/four-level-champion-model.{md,de.md}`)

## Regenerating Outputs

```bash
python3 scripts/build_compendia.py --compendium qa-ci --web-and-tex
python3 scripts/build_compendia.py --compendium qa-ci --pdfs
```

Edit only files inside `docs/qa-ci/source/`; never hand-edit the generated Web Markdown pages.
