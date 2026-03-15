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
6. `python scripts/validate_hessen_upper_secondary_archive_paths.py`
7. `python scripts/validate_hessen_upper_secondary_legacy_refs.py`
8. `python scripts/validate_hessen_lower_secondary_archive_paths.py`
9. `python scripts/validate_hessen_lower_secondary_legacy_refs.py`

The graph rule catalog is documented in:

- `docs/qa-ci/graph-validation-rules.md`

`validate:graph` supports two enforcement profiles:

- default: `GVR-*` rules are strict (failing)
- legacy-warn mode: `VALIDATE_GRAPH_STRICT_RULES=0 npm run validate:graph`

Current scope note:

- this job validates the full authored landscapes as committed
- it additionally validates projected filtered learner graphs via `validate:view-filters`
- it additionally enforces the Hessen Oberstufe retained-asset boundary: under `curricula/DE/Gymnasium/input/DE-HE/abi`, legacy `Gymnasiale_Oberstufe` path strings may only remain inside allowlisted raw archival provenance files from `curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json`
- it also enforces the Hessen Oberstufe repo-handoff boundary: the retired legacy tree must stay absent from the active repo, and active tooling/runtime/test surfaces may mention it only from the explicit allowlist in `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json`
- it now also enforces the Hessen Sek-I retained-asset boundary: under `curricula/DE/Gymnasium/input/DE-HE/lower-secondary`, legacy `Gymnasium_9_Mittelstufe` path strings are forbidden in retained operational archive content
- it also enforces the Hessen Sek-I repo-handoff boundary: active tooling/runtime/test surfaces may mention the lower-secondary legacy tree only from the explicit allowlist in `curricula/DE/Gymnasium/provenance/hessen-lower-secondary-retirement-registry.json`
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
2. repo-level data checks (`validate_schemas.py`, `validate_goal_ids_uuid.py`, `validate_hessen_upper_secondary_archive_paths.py`, `validate_hessen_upper_secondary_legacy_refs.py`, `validate_hessen_lower_secondary_archive_paths.py`, `validate_hessen_lower_secondary_legacy_refs.py`)
3. backend checks (`./gradlew clean check --no-daemon`)
