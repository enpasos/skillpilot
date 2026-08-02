# Curriculum Package Readiness

This gate answers a narrower and stronger question than the existing subject-export validation: can an artifact honestly claim the target runtime profile `full-standalone-v1`?

The current subject ZIPs remain useful, reproducible handoff and roundtrip artifacts. Their successful legacy export checks do not prove that SkillPilot can run from the ZIP alone. They therefore carry the explicit target result `not-ready-legacy` and `standaloneProfileReady: false`.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| `ready` | Every blocking check in the versioned policy passed. Evaluator `1.3.0` implements the complete check set; open publication/Human-Gates still prevent this status for the current Mathematik candidate. |
| `not-ready-incomplete` | The artifact consistently declares the target contract, but one or more completeness, publication, or consumer checks are not implemented or have not passed. Open redistribution review belongs here and is not disguised as a malformed manifest. |
| `not-ready-legacy` | The artifact does not claim the target contract and belongs to the legacy subject-export lane. A green legacy validation does not change this status. |
| `unsupported` | The artifact makes a complete, internally recognizable target claim for a contract or compatibility version this evaluator does not support. It is never treated as legacy. |
| `invalid` | Input safety, target identity, or a contract binding failed. A partial target claim is invalid and is never downgraded to legacy. |

The readiness policy is [full-standalone-v1.readiness-policy.json](https://github.com/enpasos/skillpilot/blob/main/contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json). Reports conform to [package-readiness-report.schema.json](https://github.com/enpasos/skillpilot/blob/main/contracts/curriculum-package/v1/package-readiness-report.schema.json). The evaluator validates its own output against that trusted report schema and requires the exact policy check set.

## Commands

Run the conformance suites from the repository root:

```bash
python3 -B scripts/validate_curriculum_package_contracts.py
python3 -B scripts/validate_curriculum_runtime_catalog_contract.py
python3 -B scripts/validate_curriculum_schema_catalog_contract.py
python3 -B scripts/evaluate_curriculum_package_readiness.py --self-test
python3 -B scripts/validate_full_standalone_curriculum_package.py --self-test
python3 -B scripts/run_package_consumer_smoke.py --self-test
python3 -B scripts/validate_fwu_owl_curriculum_package.py --self-test
python3 -B scripts/reconstruct_json_curriculum_package_from_fwu_owl.py --self-test
python3 -B scripts/run_fwu_owl_reverse_compiler_hermetic.py --self-test
python3 -B scripts/validate_curriculum_fwu_owl_reverse_compilation_contract.py --self-test
python3 -B scripts/generate_curriculum_package_redistribution_review.py --check
python3 -B scripts/generate_curriculum_source_verification_review.py --check
```

Build and independently validate the real staging candidate from an already compiled release model:

```bash
npm --prefix app run export:full-standalone-package -- \
  --release-root tmp/curriculum-release-model/mathematik-a \
  --output-dir tmp/curriculum-release-model/full-standalone-package \
  --zip \
  --expect-entry-count 893 \
  --expect-manifest-file-count 891 \
  --expect-binary-asset-count 734 \
  --expect-content-digest sha256:830b0e3b98b5ade7a4efc412fd39feb378e98302367fe57fa6c49e23e50a28c4

python3 -B scripts/validate_full_standalone_curriculum_package.py \
  --zip tmp/curriculum-release-model/full-standalone-package/skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.json.zip \
  --report tmp/curriculum-release-model/full-standalone-package/full-package-validation-report.json

python3 -B scripts/evaluate_curriculum_package_readiness.py \
  --zip tmp/curriculum-release-model/full-standalone-package/skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.json.zip \
  --consumer-smoke-store tmp/curriculum-release-model/provisioned-store \
  --consumer-smoke-work-dir tmp/curriculum-release-model/package-consumer-smoke \
  --consumer-smoke-report tmp/curriculum-release-model/full-standalone-package/package-consumer-smoke-report.json \
  --report tmp/curriculum-release-model/full-standalone-package/readiness-report.json \
  --expect-status not-ready-incomplete
```

This example assumes that the exact ZIP has already been securely provisioned and activated in the named store. `scripts/run_curriculum_full_package_conformance.sh` performs the complete build, validation, provisioning, activation, consumer, and readiness sequence; the ordinary release-model wrapper intentionally stops before materializing the 1.7-GB package.

The Builder CLI is implemented in [buildFullStandaloneCurriculumPackage.ts](https://github.com/enpasos/skillpilot/blob/main/app/scripts/buildFullStandaloneCurriculumPackage.ts); finished archives are checked by the implementation-independent [full package validator](https://github.com/enpasos/skillpilot/blob/main/scripts/validate_full_standalone_curriculum_package.py). The evaluator invokes that validator independently again and accepts its v2 report only when validator identity, archive hash and byte length, manifest hash, package identity, closure and definition-index digests, complete gate set, evidence and process exit agree. Evaluator `1.3.0` derives those bindings independently from the evaluated ZIP; a report cannot substitute a different extracted manifest while replaying evidence for an older archive.

The operational [package-consumer smoke report schema](https://github.com/enpasos/skillpilot/blob/main/contracts/curriculum-package/v1/package-consumer-smoke-report.schema.json) is external to the curriculum ZIP and therefore does not change its semantic digest or package-local schema inventory. The runner assembles a same-origin, runtime-catalog-only frontend with `publicDir: false` and a slim backend. Build gates reject embedded curriculum UUIDs, repository-owned offering policy, authoring/QA chunks, and static fachliche payloads. The finished assembly runs with `bubblewrap --clearenv`, a fixed environment allowlist, hidden checkout, loopback-only networking, and a read-only provisioned store. The exact `.java-version`/`.corretto-version` JDK home and launcher are opened through `O_NOFOLLOW` descriptors and rebound inside the sandbox after the checkout and repository `tmp/` have been hidden; neither `/usr/bin/java` nor another host Java can become a fallback. The running Python base prefix plus launcher, the Node launcher, and `strace` are likewise rebound from read-only descriptors to stable sandbox paths, so CI toolcache locations remain usable after `/opt` is hidden. A fixed `LD_LIBRARY_PATH` points only at the rebound Python `lib/` directory, allowing dynamically linked setup-python launchers to resolve `libpython` without exposing the hidden host toolcache. `strace -f -yy` records the complete Python, Java, HTTP-probe, Node, and Chromium process tree. A real Playwright 1.59.1/Chromium path renders package-derived goal text through catalog, closure, and composition view; a separate Catalog-404 path must render the stable fail-closed UI marker without any landscape/view fallback request.

The canonical consumer report binds the exact ZIP and package identity, manifest/content/closure/definition digests, complete one-package lock and generation, policy-pinned runner and six helpers, frontend/backend/configuration hashes, complete assembly and evidence trees, trace hash, five ordered poison sentinels, and 15 ordered functional checks. The readiness evaluator executes the exact pinned runner itself, requires a fresh private report and successful process outcome, and independently re-digests the retained assembly and evidence trees before atomically persisting output. Report and work targets reject `..`, symlink parents or destinations, hardlink aliases and overlap with ZIP, store, each other, or the protected ontology checkout before any mutation. The evaluator rejects stale, replayed, reordered, noncanonical, partially passing, externally supplied, or otherwise forged evidence.

Classify a finished legacy subject ZIP without treating the expected non-ready result as a command failure:

```bash
python3 -B scripts/evaluate_curriculum_package_readiness.py \
  --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip \
  --expect-status not-ready-legacy
```

Use `--report <path>` to persist the JSON report. `--consumer-smoke-store` enables evaluator-managed execution; `--consumer-smoke-report` then names the atomic persistence target for the fresh report. Without a store, a pre-existing consumer report is only `external-unattested` metadata and cannot satisfy the gate. `--consumer-smoke-work-dir` optionally retains the independently verified assembly and evidence trees below repository `tmp/`; without it they remain private and ephemeral. `--expect-status` returns zero only for that exact status; a mismatch has its own exit code. This lets the current release gate assert `not-ready-legacy` without turning a non-ready result into a standalone release approval.

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

The Mathematik redistribution ledger currently binds all 734 embedded images and all non-binary artifact classes. Only the exact root-`LICENSE`-bound software-contract class is automatically Apache-2.0; 734 images and three other classes remain human review items. Six image records carry a user-provided generation claim, which remains provenance rather than a redistribution grant. The independent source-verification lane proves 9,493 contiguous authored-carrier matches and five additional hash-bound PDF-projection matches without treating either as human approval. Its remaining 479 records are a separate human queue. No complete extracted official-PDF text is committed by that lane.

## Current Implementation Boundary

DPK-004a established the strict Runtime portion against the real Mathematik authoring state before packaging. DPK-007a now freezes its complete successor: the unpacked conformance model contains closed landscape, view, card, resource, runtime-catalog, dependency-closure, and migration payloads; every hard reference resolves; and 757 image records totaling 1,696,390,279 bytes contribute their real byte lengths and hashes to the deterministic semantic `contentDigest` `sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101`. The independent validator and reproducibility gate are documented in [Curriculum Release Model Conformance](curriculum-release-model-conformance.md).

DPK-004b has since added mapping, source, and quality publication evidence. DPK-005a requires semantic identity on every manifest record, pins all 22 normative payload schemas, binds five package-local semantic contracts, enforces role-specific schema IDs, and evaluates redistribution independently from structural validity. The reusable ZIP32 writer is deterministic, streaming, path-safe, limit-bound, and rejects symlink/non-regular sources.

The current DPK-007a freeze wraps that model as `skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.json.zip` with 914 entries, including 912 manifest-inventoried files and all 757 image assets. The archive is 1,738,161,217 bytes with SHA-256 `403cc0bc6004da549c8b9ed9fafad222fe0ddda1107806fe087cfa871a6dbcf9`; its manifest SHA-256 is `32f732fc553fd39a462280eba7b2fa94367af34b3882ec6115a94948da4b1ebe`. The Builder performs a byte-identical internal double build; the independent validator verifies the finished archive rather than trusting the plan. The conformance wrapper persists its build summary, full-package validation report and readiness report under `tmp/curriculum-release-model/full-standalone-package/`.

DPK-006a consumes a content-addressed store through an exact multi-package lock. Java accepts only validator-v2 evidence, rebinds lock, install record, report, manifest, closure and definition index, and rehashes every manifest-inventoried file before atomically publishing an immutable runtime snapshot. DPK-006b creates that store through deterministic quarantine, safe streaming extraction, exact file/directory-tree verification, immutable promotion and explicit CAS activation/rollback. Package-mode startup fails when the lock is absent or invalid; these components do not scan, select `latest`, or fall back to repository, classpath or network data. DPK-006c routes landscapes, mappings, views, offerings, decks, images and source evidence exclusively through that generation.

DPK-007 proves the complete package-only path against the real 1.7-GB Mathematik package: all 15 functional checks pass, a dynamically selected curriculum yields 213 package-closure frontier goals, and no checkout, static data poison lane, or external network access is observed. DPK-007a adds the last image, advances the ontology/publication profiles to `1.1.1`, and adds the executable Core/registry lane-alignment gate without changing the 454-entry registry (SHA-256 `2e536c3f8d63e2acf45690375ace69ec0c6a6e92787bc8a16957b80120c4ca48`). All 754 atomic visualization-scope goals now have images, but only 136 of 757 image decisions are human-approved; 621 fachliche visual reviews, 760 redistribution items, and 479 source-text reviews remain open.

DPK-008c proves the finished FWU-OWL carrier independently of its TypeScript exporter. The first DPK-008d reconstruction exposed a Placement identity collision, now fixed as `goalId@unitId@index`; the corrected carrier was rebuilt and revalidated through all 18 gates. Its byte-identical primary and peer archives are each 2,362,455,128 bytes with SHA-256 `abab1d8aac3e9394af26c614bbf231954ba45ab11f725dd0f93f088820dc3f94`, 819 ZIP entries, 817 manifest-inventoried files, manifest SHA-256 `29f308424d1aeba9095f0e800253acadcdfaca0562dfa1fc37741c77c76023b3`, and 824,452 triples in eight ordered RDF segments. The finished-package validator fixes 40 fail-closed guarantees in its self-test.

DPK-008d now proves the isolated return path as well. The reverse compiler has no access to original JSON, authoring checkout or forward exporter and distinguishes registry-typed decimals, explicit `null`, missing values and strings. External resources remain pathless; embedded resources alone require sidecars. Closed singleton roles recover standardized package paths outside ordinary dependency-closure definitions and reject conflicting redundant bindings. Two networkless runs in a host-root-free minimal namespace generate the same 1,737,571,471-byte JSON ZIP with SHA-256 `7dcd233dd495900f6d6bd971ff6e86bdcdcfe5701f3522ed480be8336de23195` and manifest SHA-256 `8d7970435431ff78743d0bf413a54bbebee009bbaafe35f1283ebcb89b4f2ff0`. Python runs isolated without site initialization; narrow root-owned Python/native-library roots are mounted read-only, and the Rawtrace audit derives and rehashes the exact Runtime files actually opened plus the ELF loader closure. A host-side tracer remains invisible to sandbox `/proc`. Each archive has 911 entries, 909 manifest records, 910 checksum rows, 111 logical artifacts, and 757 binary resources totaling 1,696,390,279 bytes; all 111 normalized hash oracles and every binary-byte check pass, followed by the independent full-package validator v2. The external validator parses nested receipts and probes, rederives the Entry/Core trace from host Rawtrace bytes, verifies Python/tracer ELF dependencies, reopens ZIP/manifest/checksums/semantic index and binds the exact 20-file evidence inventory. Bounded QA covers 31 reverse-compiler guarantees, 21 hermetic-runner guarantees, 53 report-contract mutations, 6 raw-JSON cases and 10 consistently rehashed evidence attacks.

These technical ontology and reconstruction results do not alter a single public human gate: the readiness report remains `not-ready-incomplete`, existing Subject Export ZIPs remain `not-ready-legacy`, and the 621 fachliche visual reviews, 760 redistribution items, and 479 source-text reviews remain open. DPK-009 next turns the original and reconstructed packages into the normative dual-release equivalence verdict. The current program checkpoint and remaining sequence are maintained in [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md).

The legacy subject-package validator executes this evaluator for every finished ZIP and stores the canonical, ZIP-hash-bound reports under `tmp/exports/readiness/`. Validation reports, publication indexes, and the final legacy release-gate report derive their target status from those files instead of inserting a constant status.
