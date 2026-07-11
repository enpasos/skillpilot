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
python3 -B scripts/validate_full_standalone_curriculum_package.py --self-test
python3 -B scripts/generate_curriculum_package_redistribution_review.py --check
python3 -B scripts/generate_curriculum_source_verification_review.py --check
```

Build and independently validate the real staging candidate from an already compiled release model:

```bash
npm --prefix app run export:full-standalone-package -- \
  --release-root tmp/curriculum-release-model/mathematik-a \
  --output-dir tmp/curriculum-release-model/full-standalone-package \
  --zip \
  --expect-entry-count 913 \
  --expect-manifest-file-count 911 \
  --expect-binary-asset-count 756 \
  --expect-content-digest sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60

python3 -B scripts/validate_full_standalone_curriculum_package.py \
  --zip tmp/curriculum-release-model/full-standalone-package/skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.2-json.zip \
  --report tmp/curriculum-release-model/full-standalone-package/full-package-validation-report.json

python3 -B scripts/evaluate_curriculum_package_readiness.py \
  --zip tmp/curriculum-release-model/full-standalone-package/skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.2-json.zip \
  --report tmp/curriculum-release-model/full-standalone-package/readiness-report.json \
  --expect-status not-ready-incomplete
```

The Builder CLI is implemented in [buildFullStandaloneCurriculumPackage.ts](../../app/scripts/buildFullStandaloneCurriculumPackage.ts); finished archives are checked by the implementation-independent [full package validator](../../scripts/validate_full_standalone_curriculum_package.py). The evaluator invokes that validator independently again and accepts its v2 report only when validator identity, archive hash and byte length, manifest hash, package identity, closure and definition-index digests, complete gate set, evidence and process exit agree. Evaluator `1.2.0` derives those bindings independently from the evaluated ZIP; a report cannot substitute a different extracted manifest while replaying evidence for an older archive.

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

The same v1 profile explicitly caps every JSON entry at 64 MiB, nesting at 128 levels, and the parsed JSON tree at 5,000,000 nodes. Builder, contract checks and the finished-ZIP validator bind those values to the profile; they are not hidden implementation-only validator limits.

The runtime catalog likewise uses explicit roots, offered scopes, and view resolution. A consumer must not infer a default view from filenames, directory layout, repository registries, or hard-coded curriculum IDs.

## Review Gates

`full-standalone-v1` deliberately separates structural validity from permission to publish. A file with `redistributionStatus: review-required` must use `licenseExpression: null`; it can be represented in a staging candidate, but `publication.redistribution-cleared` fails and the decision remains `not-ready-incomplete`. `allowed` requires a real license expression resolved to an inventoried license document. Provider or provenance labels never grant redistribution rights.

The Mathematik redistribution ledger currently binds all 756 embedded images and all non-binary artifact classes. Only the exact root-`LICENSE`-bound software-contract class is automatically Apache-2.0; 756 images and three other classes remain human review items. The independent source-verification lane proves 9,493 contiguous authored-carrier matches and five additional hash-bound PDF-projection matches without treating either as human approval. Its remaining 479 records are a separate human queue. No complete extracted official-PDF text is committed by that lane.

## Current Implementation Boundary

DPK-004a now proves the strict Runtime portion against the real Mathematik authoring state before packaging: the unpacked conformance model contains closed landscape, view, card, resource, runtime-catalog, dependency-closure, and migration payloads; every hard reference resolves; and 756 image records contribute their real byte lengths and hashes to a deterministic semantic `contentDigest`. The independent validator and reproducibility gate are documented in [Curriculum Release Model Conformance](curriculum-release-model-conformance.md).

DPK-004b has since added mapping, source, and quality publication evidence. DPK-005a requires semantic identity on every manifest record, pins all 22 normative payload schemas, binds five package-local semantic contracts, enforces role-specific schema IDs, and evaluates redistribution independently from structural validity. The reusable ZIP32 writer is deterministic, streaming, path-safe, limit-bound, and rejects symlink/non-regular sources.

DPK-005b now wraps that model as a real ZIP with 913 entries, including 911 manifest-inventoried files and all 756 image assets. The Builder performs a byte-identical internal double build; the independent validator verifies the finished archive rather than trusting the plan. The conformance wrapper persists its build summary, full-package validation report and readiness report under `tmp/curriculum-release-model/full-standalone-package/`.

DPK-006a consumes an already provisioned, content-addressed store through an exact multi-package lock. Java accepts only validator-v2 evidence, rebinds lock, install record, report, manifest, closure and definition index, and rehashes every manifest-inventoried file before atomically publishing an immutable runtime snapshot. Package-mode startup fails when the lock is absent or invalid; these components do not scan, install, select `latest`, or fall back to repository, classpath or network data. Secure ZIP extraction, exact object-tree identity and lock activation/rollback remain the separate DPK-006b boundary.

This is a technically valid staging package, not a publication approval. Its open redistribution records deliberately produce `not-ready-incomplete`. DPK-006b/006c/007 must still prove safe provisioning and that the complete SkillPilot application uses no curriculum source tree or `app/public` fallback; the explicit [human publication gates](curriculum-package-human-review-gates.md) remain open. Existing Subject Export ZIPs remain `not-ready-legacy`. The current program checkpoint and remaining sequence are maintained in [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md).

The legacy subject-package validator executes this evaluator for every finished ZIP and stores the canonical, ZIP-hash-bound reports under `tmp/exports/readiness/`. Validation reports, publication indexes, and the final legacy release-gate report derive their target status from those files instead of inserting a constant status.
