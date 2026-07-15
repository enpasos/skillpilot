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

Purpose: validate curriculum graph/data integrity, generated artifacts, package builders, hermetic package consumption, schema contracts, and release conformance.

The job contains the graph, view, placement, source, review, asset, package, schema, archive, and legacy-reference gates. It also builds the closed package-only frontend and runs the real package consumer with the repository hidden. This is the suite that prevents curriculum packages from reading repository fallback data.

Pushes and pull requests always run both the application and curriculum jobs. The split is for ownership, diagnosis, and faster local iteration; it is not a path-based permission to skip a suite.

The local and hosted curriculum paths intentionally run the same scope/readiness and goal-source-rationale gates, so a local curriculum result cannot diverge merely because the two checklists differ.

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
- it additionally enforces the Hessen Oberstufe retained-asset boundary: under `curricula/DE/Gymnasium/input/DE-HE/abi`, legacy `Gymnasiale_Oberstufe` path strings may only remain inside allowlisted raw archival provenance files from `curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json`
- it also enforces the Hessen Oberstufe repo-handoff boundary: the retired legacy tree must stay absent from the active repo, and active tooling/runtime/test surfaces may mention it only from the explicit allowlist in `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json`
- it validates the Hessen 2026 chemistry exam pipeline artifacts (`slot_matrix.json`, `coverage_requirements.json`, `task_bank.json`, and source-landscape release anchors)
- it now also enforces the Hessen Sek-I retained-asset boundary: under `curricula/DE/Gymnasium/input/DE-HE/lower-secondary`, legacy `Gymnasium_9_Mittelstufe` path strings are forbidden in retained operational archive content
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
```

With no argument, `all` remains the default and the final repository gate. The separate modes are:

- `application`: Custom GPT Action regression, fixture-based frontend application logic, GPT instruction limits, lint, application-only build, and isolated Gradle backend checks.
- `curriculum`: graph/data/review/asset gates, curriculum package builders, the hash-bound hermetic package consumer, schemas, and release conformance.
- `all`: each check from both suites exactly once, sharing dependency and tool setup where possible.

Unknown or multiple suite arguments fail with exit code 2. Do not infer the suite from changed paths: cross-cutting changes must still finish with `./run_ci.sh` or `./run_ci.sh all`.
