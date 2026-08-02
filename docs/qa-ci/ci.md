# Continuous Integration (CI)

This document describes the CI workflow defined in `.github/workflows/ci.yml`.

## Triggers

The workflow runs on:

- push to `main`
- pull requests targeting `main`

The workflow ignores documentation-only and temporary changes (`README.md`, `AGENTS.md`, `docs/**`, `sandbox/**`, `tmp/**`).

## Jobs

### 1. `action-regression-ci`

Purpose: validate the Spring-hosted Custom GPT Action regression control client.

### 2. `frontend-ci` — application logic

Purpose: validate fixture-based frontend application behavior, source quality, and buildability (`app/`) without regenerating curriculum assets.

This includes the package/runtime adapters, learner-goal selection, GPT instruction limits, the deterministic ZIP primitive, ESLint, and `npm run build:application`.

`build:application` deliberately compiles and builds only the application against the committed runtime assets. The normal production command `npm run build` remains integrated and first prepares curriculum runtime assets.

### 3. `graph-validation` — curriculum

Purpose: validate skill graph/data integrity, generated artifacts, package contracts and self-tests, schemas, and deterministic release-model conformance.

The job contains the graph, view, placement, source, review, asset, schema, archive, and legacy-reference gates. It builds the package-only frontend and exercises the package builder, validator, provisioner, Readiness evaluator, and consumer through bounded self-tests, but it does not materialize or consume a real curriculum ZIP. Those production-boundary checks belong exclusively to the optional Package CI.

Pushes and pull requests always run both the application and curriculum jobs. The split is for ownership, diagnosis, and faster local iteration; it is not a path-based permission to skip a suite.

The local and hosted curriculum paths intentionally run the same scope/readiness and goal-source-rationale gates, so a local curriculum result cannot diverge merely because the two checklists differ.

### Optional package, subject-export, and FWU-OWL workflow

`.github/workflows/owl-ci.yml` is the single optional Package CI. It runs weekly and can be started manually; it is not run for every push or pull request. Separate fresh runners cover the real 1.7-GB standalone JSON package and hermetic consumer, all real subject-export packages, and the Core-first FWU-OWL/roundtrip lane. Ordinary per-commit CI materializes no real curriculum package for any subject; it validates code, contracts, models, reviews, schemas, and committed status instead. SkillPilot's production runtime consumes the JSON curriculum package and does not require OWL.

The real 2.36-GB FWU-OWL release-conformance wrappers remain explicit release operations rather than ordinary CI. The optional workflow syntax-checks them but uses bounded contract tests and the focused roundtrip lane.

The required JSON release-model gate still verifies the exact FWU Core commit and file hash recorded as provenance in its build profile. That small checkout/trust check is not an OWL test: it creates no RDF, runs neither ROBOT nor HermiT, and performs no ontology validation or roundtrip.

The graph rule catalog is documented in:

- `docs/qa-ci/graph-validation-rules.md`
- `docs/qa-ci/curriculum-quality-dashboard.md` for the generated Workbench quality-status view
- `docs/qa-ci/curriculum-quality-maturity-and-routes.md` for detailed `M0`-`M4`, QA-scope, route, and `CQR-*` semantics

`validate:graph` supports two enforcement profiles:

- default: `GVR-*` rules are strict (failing)
- legacy-warn mode: `VALIDATE_GRAPH_STRICT_RULES=0 npm run validate:graph`

Current scope note:

- this job validates the full authored landscapes as committed
- it additionally validates projected filtered learner graphs via `validate:view-filters`
- it additionally enforces the Hessen Mathematik Sek-I G8/G9 duration projection via `check:he-math-duration-projection`; the check fails if G8/G9 evidence is missing, no G8/G9 differences are detected, or any canonical-duration-grade evidence link is not represented by authored year structure or duration-specific `goalPlacements`
- it additionally enforces visible curriculum source coverage for the canonical Mathematik/Physik projections via `quality:source-coverage-audit:check`; global missing source-backed goals may remain as non-visible rollout backlog, but visible atomic goals must have direct source/mapping evidence or explicitly accepted surrogate evidence
- it additionally checks registered generated Markdown status artifacts for the standard "do not edit manually" notice via `check:generated-doc-notices`
- it additionally checks that the generated QA status artifact registry is in sync with `app/scripts/generatedMarkdownNoticeRegistry.ts` via `check:generated-status-registry`
- it additionally checks local Markdown links under `docs/` via `check:docs-links`
- it additionally checks coverage for the main documentation indexes via `check:docs-indexes`
- it additionally validates explicit learner-facing composition-view files via `validate:composition-views`
- it additionally enforces all configured memory-card review ledgers via `quality:memory-card-review:check:all`; in the dashboard, missing `CQR-302` review configuration blocks `M6`, while `M5` remains the core curriculum QA level
- it additionally enforces the Hessen Oberstufe retained-asset boundary: under `curricula/DE/Gymnasium/input/HE/abi`, legacy `Gymnasiale_Oberstufe` path strings may only remain inside allowlisted raw archival provenance files from `curricula/DE/Gymnasium/input/HE/retained-asset-registry.json`
- it also enforces the Hessen Oberstufe repo-handoff boundary: the retired legacy tree must stay absent from the active repo, and active tooling/runtime/test surfaces may mention it only from the explicit allowlist in `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json`
- it validates the Hessen 2026 chemistry exam pipeline artifacts (`slot_matrix.json`, `coverage_requirements.json`, `task_bank.json`, and source-landscape release anchors)
- it now also enforces the Hessen Sek-I retained-asset boundary: under `curricula/DE/Gymnasium/input/HE/lower-secondary`, legacy `Gymnasium_9_Mittelstufe` path strings are forbidden in retained operational archive content
- it also enforces the Hessen Sek-I repo-handoff boundary: active tooling/runtime/test surfaces may mention the lower-secondary legacy tree only from the explicit allowlist in `curricula/DE/Gymnasium/provenance/hessen-lower-secondary-retirement-registry.json`
- the current CI scope for `validate:view-filters` is the reviewed canonical DE Gymnasium set (`Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Wirtschaft`, `Overview`)
- the validator can be widened locally via `APPLICABILITY_VALIDATION_SCOPE=all npm run validate:view-filters`, but CI does not enforce that broader scope yet
- reviewed residual `APV-201` warning cases are tracked in `docs/qa-ci/applicability-accepted-warnings.json` and are reported as accepted warnings, not active warnings; `APV-202` is reported as a diagnostic finding, not as warning debt

Optional local status snapshot:

```bash
cd app
npm run quality:curriculum-status
```

This writes `docs/qa-ci/status/curriculum-quality-status.json` and `.md`, which are read by the local Workbench route `/quality-dashboard`.

Optional MEM/FWU endpoint review snapshot:

```bash
cd app
npm run quality:mem-sparql-consistency
```

This writes the MEM audit and review-queue artifacts under `docs/qa-ci/status/`. It is not part of the blocking CI workflow because the MEM endpoint is external and currently exposes concrete curriculum data only for some configured jurisdictions. See `docs/qa-ci/mem-sparql-consistency-runbook.md` for the operational workflow.

### 4. `backend-ci` — application logic

Purpose: validate backend (`backend/`) via Gradle checks.

Steps:

1. `./gradlew check`

## Status checks

All CI jobs must pass for a successful workflow run.

## Run CI locally

From repository root:

```bash
./run_ci.sh
./run_ci.sh all
./run_ci.sh application
./run_ci.sh curriculum
./run_ci.sh package
./run_ci.sh owl
./run_ci.sh full
```

With no argument, `all` remains the default required repository gate. The modes are:

- `application`: Custom GPT Action regression, fixture-based frontend application logic, GPT instruction limits, lint, application-only build, and isolated Gradle backend checks.
- `curriculum`: graph/data/review/asset gates, schemas, and deterministic JSON release-model conformance; it does not materialize the real 1.7-GB ZIP.
- `package`: optional real standalone JSON ZIP, independent package validation, secure provisioning/activation, Readiness evaluation, and the hash-bound hermetic package consumer.
- `owl`: optional FWU-OWL builder/contracts, reverse-compiler tests, semantic MEM/FWU roundtrip, and OWL 2 DL/HermiT validation.
- `all`: every required application and curriculum check exactly once, sharing dependency and tool setup where possible; package materialization and OWL are intentionally excluded.
- `full`: `all` plus the optional real package and OWL checks.

Unknown or multiple suite arguments fail with exit code 2. Do not infer the required suite from changed paths: cross-cutting runtime changes must still finish with `./run_ci.sh` or `./run_ci.sh all`. Use `package` for package/provisioning/consumer changes and `owl` for ontology or roundtrip changes; `full` runs both optional lanes.

The real package, reproducible subject exports, and OWL/roundtrip checks share the optional scheduled/manual GitHub workflow. Bounded builder, validator, provisioner, Readiness, consumer, and generated-status checks remain required per commit, while multi-gigabyte production-boundary exercises are kept out of ordinary commit CI.
