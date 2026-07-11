# Curriculum Package Readiness

This gate answers a narrower and stronger question than the existing subject-export validation: can an artifact honestly claim the target runtime profile `full-standalone-v1`?

The current subject ZIPs remain useful, reproducible handoff and roundtrip artifacts. Their successful legacy export checks do not prove that SkillPilot can run from the ZIP alone. They therefore carry the explicit target result `not-ready-legacy` and `standaloneProfileReady: false`.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| `ready` | Every blocking check in the versioned policy passed. This status is unavailable until all package, catalog, closure, digest, and hermetic-consumer checks are implemented. |
| `not-ready-incomplete` | The artifact consistently declares the target contract, but one or more completeness, publication, or consumer checks are not implemented or have not passed. Open redistribution review belongs here and is not disguised as a malformed manifest. |
| `not-ready-legacy` | The artifact does not claim the target contract and belongs to the legacy subject-export lane. A green legacy validation does not change this status. |
| `unsupported` | The artifact makes a complete, internally recognizable target claim for a contract or compatibility version this evaluator does not support. It is never treated as legacy. |
| `invalid` | Input safety, target identity, or a contract binding failed. A partial target claim is invalid and is never downgraded to legacy. |

The readiness policy is [full-standalone-v1.readiness-policy.json](../../contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json). Reports conform to [package-readiness-report.schema.json](../../contracts/curriculum-package/v1/package-readiness-report.schema.json). The evaluator validates its own output against that trusted report schema and requires the exact policy check set.

## Commands

Run the conformance suites from the repository root:

```bash
python3 -B scripts/validate_curriculum_package_contracts.py
python3 -B scripts/validate_curriculum_runtime_catalog_contract.py
python3 -B scripts/validate_curriculum_schema_catalog_contract.py
python3 -B scripts/evaluate_curriculum_package_readiness.py --self-test
python3 -B scripts/generate_curriculum_package_redistribution_review.py --check
python3 -B scripts/generate_curriculum_source_verification_review.py --check
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

## Review Gates

`full-standalone-v1` deliberately separates structural validity from permission to publish. A file with `redistributionStatus: review-required` must use `licenseExpression: null`; it can be represented in a staging candidate, but `publication.redistribution-cleared` fails and the decision remains `not-ready-incomplete`. `allowed` requires a real license expression resolved to an inventoried license document. Provider or provenance labels never grant redistribution rights.

The Mathematik redistribution ledger currently binds all 756 embedded images and all non-binary artifact classes. Only the exact root-`LICENSE`-bound software-contract class is automatically Apache-2.0; 756 images and three other classes remain human review items. The independent source-verification lane proves 9,493 contiguous authored-carrier matches and five additional hash-bound PDF-projection matches without treating either as human approval. Its remaining 479 records are a separate human queue. No complete extracted official-PDF text is committed by that lane.

## Current Implementation Boundary

DPK-004a now proves the strict Runtime portion against the real Mathematik authoring state before packaging: the unpacked conformance model contains closed landscape, view, card, resource, runtime-catalog, dependency-closure, and migration payloads; every hard reference resolves; and 756 image records contribute their real byte lengths and hashes to a deterministic semantic `contentDigest`. The independent validator and reproducibility gate are documented in [Curriculum Release Model Conformance](curriculum-release-model-conformance.md).

DPK-004b has since added mapping, source, and quality publication evidence. DPK-005a now requires semantic identity on every manifest record, pins all 22 normative payload schemas, binds five package-local semantic contracts, enforces role-specific schema IDs, and evaluates redistribution independently from structural validity. The reusable ZIP32 writer is deterministic, streaming, path-safe, limit-bound, and rejects symlink/non-regular sources.

The real artifact still deliberately reports `conformance-model-only-not-a-package` until DPK-005b copies all assets and wraps the model with the manifest, schema catalog, inventory, checksums, and finished-ZIP validation. DPK-006/007 must then prove that SkillPilot uses no curriculum source tree or `app/public` fallback. `ready` also remains unavailable while the explicit human publication gates are open. Existing Subject Export ZIPs remain `not-ready-legacy`. The current program checkpoint and remaining sequence are maintained in [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md).

The legacy subject-package validator executes this evaluator for every finished ZIP and stores the canonical, ZIP-hash-bound reports under `tmp/exports/readiness/`. Validation reports, publication indexes, and the final legacy release-gate report derive their target status from those files instead of inserting a constant status.
