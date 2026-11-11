## SkillPilot Subject Export Package {#sec:pp-subject-export}

This pipeline builds a reproducible legacy subject-export ZIP (`legacy-subject-export`, target status `not-ready-legacy`, `standaloneProfileReady: false` under [Curriculum Package Readiness](repo:docs/qa-ci/curriculum-package-readiness.md)) for one subject landscape as a validated publication and roundtrip carrier (@ref{sec:pp-mem-fwu-roundtrip}), without claiming standalone `full-standalone-v1` runtime operation ([Release Model Conformance](repo:docs/qa-ci/curriculum-release-model-conformance.md)). Supported `DE/Gymnasium` presets currently cover all `M5`+ subjects: `Biologie`, `Chemie`, `Deutsch`, `Geschichte`, `Informatik`, `Latein`, `Mathematik`, `Physik`, `Politik und Wirtschaft`, and `Wirtschaftswissenschaften`.

### Build, Independent Validation, Link Audit, and CI Release Gate {#sec:pp-export-commands}

Single-subject export, batch export of all `M5`/`M6` subjects (`tmp/exports/m5-subject-export-summary.{json,md}`), independent ZIP validation (`tmp/exports/validation/` + `tmp/exports/readiness/`), live source-URL reachability audit (`--fail-on-broken` for strict pre-release checks), and reproducibility proof (`SOURCE_DATE_EPOCH`, uncompressed sorted entries with mode `0644`):

```bash
cd app
npm run export:subject-package -- --subject Mathematik --version 0.1.0
npm run export:m5-subject-packages -- --version 0.1.0
npm run export:subject-packages:validate -- --dir tmp/exports
npm run export:subject-packages:audit-links -- --dir tmp/exports
npm run export:subject-release-gate -- --version 0.1.0 --strict-source-links
npm run export:subject-release-gate:ci
npm run export:m5-subject-packages:check-reproducible -- --version 0.1.0
SOURCE_DATE_EPOCH=1767225600 npm run export:subject-package -- \
  --subject Mathematik --version 0.1.0
```

`export:subject-release-gate:ci` runs weekly/manually in `.github/workflows/owl-ci.yml` passing `--enforce-committed-quality-status --enforce-clean-source-tree` and emits release-gate and publication indexes under `tmp/exports/{release-gate,publication}/`. For reviewer handoff, `export:subject-package:trace-source` resolves source or canonical goal IDs directly from any finished ZIP:

```bash
cd app
ZIP=../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
npm run export:subject-package:trace-source -- \
  --zip "$ZIP" --source-goal-id he-math-sekii-e-1-b01-a01-376ffbbc
npm run export:subject-package:trace-source -- \
  --zip "$ZIP" --canonical-goal-id 502ecaa7-cca6-5c51-a1cc-da09a7b2382c
```

### Package Layout, Source/Memory Evidence, License Categories, and New Subjects {#sec:pp-export-contents}

Every archive extracts within Windows `MAX_PATH` limits under `skillpilot-de-gymnasium-<subject>-v<version>/` free of repository-local paths or learner state (the sibling `*-release-report.md` stays outside the ZIP):

- **Domain & source payloads:** `data/canonical/`, `data/views/`, `data/mappings/` (all 16 German states; partial state coverage requires explicit `--allow-missing-states`), `data/cards/` + `card-index.json`, `data/resources/goal-visualizations.json` + strictly link-selected images under `assets/goal-visualizations/`, `data/dependencies/external-goal-references.json`, and the mandatory HTTP(S) provenance bridge `data/sources/source-index.json` $\leftarrow$ `data/sources/source-goal-references.json` (`metadata/provenance-report.md`).
- **Quality, schemas & checksums:** `metadata/quality/memory-card-review/` (`*.md`, `*.config.json`, `*.review.jsonl`, `*.cards.review.jsonl` backing `CQR-302`), `schemas/`, `metadata/manifest.json`, `metadata/validation-report.json`, `metadata/SHA256SUMS`.
- **File-level license categories (`LICENSE.md`, `NOTICE.md`, `licenses/`):** Following `LICENSING.md`, every file in `manifest.json` carries a `licenseCategory`: `skillpilot-software-apache-2.0`, `skillpilot-data-cc-by-4.0`, `official-source-provenance-only`, `generated-package-metadata`, or `goal-visualization-ai-generated-curated` (provenance label, neither an SPDX identifier nor third-party rights clearance).
- **Reusing for new subjects without a preset:** Pass explicit `--subject`, `--subject-slug`, `--composition-dir`, and repeated `--mapping-token` arguments.
