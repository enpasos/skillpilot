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
3. `python scripts/validate_schemas.py`
4. `python scripts/validate_goal_ids_uuid.py`

The graph rule catalog is documented in:

- `docs/qa-ci/graph-validation-rules.md`

`validate:graph` supports two enforcement profiles:

- default: `GVR-*` rules are strict (failing)
- legacy-warn mode: `VALIDATE_GRAPH_STRICT_RULES=0 npm run validate:graph`

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

1. app checks (`validate:graph`, `lint`, `build`)
2. backend checks (`./gradlew clean check --no-daemon`)
