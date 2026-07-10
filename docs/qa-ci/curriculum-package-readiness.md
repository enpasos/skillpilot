# Curriculum Package Readiness

This gate answers a narrower and stronger question than the existing subject-export validation: can an artifact honestly claim the target runtime profile `full-standalone-v1`?

The current subject ZIPs remain useful, reproducible handoff and roundtrip artifacts. Their successful legacy export checks do not prove that SkillPilot can run from the ZIP alone. They therefore carry the explicit target result `not-ready-legacy` and `standaloneProfileReady: false`.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| `ready` | Every blocking check in the versioned policy passed. This status is unavailable until all package, catalog, closure, digest, and hermetic-consumer checks are implemented. |
| `not-ready-incomplete` | The artifact consistently declares the target contract, but one or more required checks are not implemented or have not passed. |
| `not-ready-legacy` | The artifact does not claim the target contract and belongs to the legacy subject-export lane. A green legacy validation does not change this status. |
| `unsupported` | The artifact makes a complete, internally recognizable target claim for a contract or compatibility version this evaluator does not support. It is never treated as legacy. |
| `invalid` | Input safety, target identity, contract binding, or another evaluated blocking check failed. A partial target claim is invalid and is never downgraded to legacy. |

The readiness policy is [full-standalone-v1.readiness-policy.json](../../contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json). Reports conform to [package-readiness-report.schema.json](../../contracts/curriculum-package/v1/package-readiness-report.schema.json). The evaluator validates its own output against that trusted report schema and requires the exact policy check set.

## Commands

Run the conformance suites from the repository root:

```bash
python3 -B scripts/validate_curriculum_package_contracts.py
python3 -B scripts/validate_curriculum_runtime_catalog_contract.py
python3 -B scripts/validate_curriculum_schema_catalog_contract.py
python3 -B scripts/evaluate_curriculum_package_readiness.py --self-test
```

Classify a finished legacy subject ZIP without treating the expected non-ready result as a command failure:

```bash
python3 -B scripts/evaluate_curriculum_package_readiness.py \
  --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip \
  --expect-status not-ready-legacy
```

Use `--report <path>` to persist the JSON report. `--expect-status` returns zero only for that exact status; a mismatch has its own exit code. This lets the current release gate assert `not-ready-legacy` without turning a non-ready result into a standalone release approval.

Stable evaluator exits:

| Exit | Meaning |
| ---: | --- |
| `0` | `ready`, exact expected status, or successful self-test |
| `2` | CLI usage error |
| `10` | `invalid` |
| `20` | `not-ready-legacy` or `not-ready-incomplete` without a matching expectation |
| `30` | `unsupported` |
| `40` | `--expect-status` mismatch |
| `70` | internal evaluator or trusted-contract failure |

## Trust And Offline Resolution

The package-local schema catalog is a resolver table, not a package-controlled trust root. Validation starts from the repository or consumer's supported contract version, verifies the manifest's contract bindings and file inventory, then resolves only cataloged, hash-bound package schemas. Remote retrieval is forbidden. Duplicate JSON keys, ambiguous IDs or paths, unknown references, stale hashes, unsafe archive paths, excessive resource use, and incomplete catalog coverage fail closed.

The runtime catalog likewise uses explicit roots, offered scopes, and view resolution. A consumer must not infer a default view from filenames, directory layout, repository registries, or hard-coded curriculum IDs.

## Current Implementation Boundary

DPK-002 establishes and tests the catalog and readiness contracts, while deliberately withholding `ready`. Later steps must still provide and verify complete payload schemas, hard-reference closure, the semantic `contentDigest`, a finished-ZIP validator, and a hermetic package-only consumer smoke test. The current program checkpoint and remaining sequence are maintained in [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md).

The legacy subject-package validator executes this evaluator for every finished ZIP and stores the canonical, ZIP-hash-bound reports under `tmp/exports/readiness/`. Validation reports, publication indexes, and the final legacy release-gate report derive their target status from those files instead of inserting a constant status.
