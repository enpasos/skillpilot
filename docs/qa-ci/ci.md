# Continuous Integration (CI)

This document describes the CI workflow defined in `.github/workflows/ci.yml`.

## Triggers

The workflow runs on:

- push to `main`
- pull requests targeting `main`

The workflow ignores documentation-only and temporary changes (`README.md`, `AGENTS.md`, `docs/**`, `sandbox/**`, `tmp/**`).

## Jobs

### 1. `frontend-ci`

Purpose: validate frontend source quality and buildability (`app/`).

Steps:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

### 2. `graph-validation`

Purpose: validate curriculum graph/data integrity and schema constraints.

Steps:

1. `npm ci` (in `app/`)
2. `npm run validate:graph`
3. `npm run validate:view-filters`
4. `python scripts/validate_schemas.py`
5. `python scripts/validate_goal_ids_uuid.py`

The graph rule catalog is documented in:

- `docs/qa-ci/graph-validation-rules.md`

`validate:graph` supports two enforcement profiles:

- default: `GVR-*` rules are strict (failing)
- legacy-warn mode: `VALIDATE_GRAPH_STRICT_RULES=0 npm run validate:graph`

Current scope note:

- this job validates the full authored landscapes as committed
- it additionally validates projected filtered learner graphs via `validate:view-filters`
- the current CI scope for `validate:view-filters` is the reviewed canonical DE Gymnasium set (`Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Wirtschaft`, `Overview`)
- the validator can be widened locally via `APPLICABILITY_VALIDATION_SCOPE=all npm run validate:view-filters`, but CI does not enforce that broader scope yet
- reviewed residual `APV-201` / `APV-202` cases are tracked in `docs/qa-ci/applicability-accepted-warnings.json` and are reported as accepted warnings, not active warnings

### 3. `backend-ci`

Purpose: validate backend (`backend/`) via Gradle checks.

Steps:

1. `./gradlew check`

## Status checks

All CI jobs must pass for a successful workflow run.

## Run CI locally

From repository root:

```bash
bash run_ci.sh
```

This runs:

1. app checks (`validate:graph`, `validate:view-filters`, `lint`, `build`)
2. backend checks (`./gradlew clean check --no-daemon`)
