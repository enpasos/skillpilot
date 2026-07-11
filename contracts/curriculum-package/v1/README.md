# Curriculum Package Contract v1

This directory is the trusted repository authority for the SkillPilot curriculum-package v1 contract.

DPK-001 established the manifest/profile kernel; DPK-002 adds package-local discovery, offline schema resolution, and a fail-closed readiness vocabulary. DPK-003 freezes the cross-variant semantic proof contract. DPK-004 completes the strict unpacked Mathematik release model: DPK-004a established Runtime closure, and DPK-004b adds authoritative publication evidence. DPK-005a closes package-level semantic bindings, the complete offline schema trust set, the deterministic ZIP32 primitive, and human-review gates. DPK-005b materializes that model as a reproducible real ZIP and validates the finished carrier independently. DPK-006a adds the read-only consumer for an exactly locked, prevalidated content-addressed store and accepts only validator-v2 evidence bound to ZIP, manifest, closure and definition index. DPK-006b completes the external operational contracts and the quarantined, content-addressed provisioner with immutable evidence, explicit CAS activation, and rollback.

- `package-manifest.schema.json` defines the strict internal manifest shape. Every file is bound either to a normalized logical artifact, to a binary resource identity, or explicitly to generated/non-semantic package material.
- `profiles/full-standalone-v1.profile.json` defines the closed JSON release profile, artifact-role cardinalities, exact role-specific payload schemas, the 22-schema offline trust set, five named semantic contracts, redistribution readiness policy, and package-format limits.
- `runtime-catalog.schema.json` defines explicit roots, offered scopes, view resolution, runtime artifacts, resources, capabilities, and package-local dependency references.
- `schema-catalog.schema.json` defines the offline ID-to-file resolver for hash-bound JSON Schemas.
- `profiles/full-standalone-v1.readiness-policy.json` and `package-readiness-report.schema.json` define the blocking checks and machine-readable decision.
- `full-package-validation-report.schema.json`, `installed-package-record.schema.json`, and `active-package-lock.schema.json` define the external package-store trust chain from the exact six-gate validator-v2 receipt through a content-addressed install record to the strictly package-ID-ordered active lock. These are operational schemas, not package-local payload schemas: they deliberately do not extend the 22-schema `full-standalone-v1` trust set or alter package digests and entry counts.
- `compiled-landscape.schema.json`, `composition-view.schema.json`, `composition-view-index.schema.json`, `card-deck.schema.json`, `card-index.schema.json`, and `resource-index.schema.json` close the runtime payload shapes compiled in DPK-004a.
- `dependency-closure.schema.json`, `embedded-goal-dependency.schema.json`, `definition-digest-profile.schema.json`, and `profiles/canonical-definition-record-v1.profile.json` define typed identity, canonical definition digests, ownership, embedded fragments, fixed-point hard-reference closure, and deterministic conflict handling.
- `migration-aliases.schema.json` defines `renamed`, `replacedBy`, `splitInto`, `mergedInto`, and `removed` relations with explicit, fail-closed mastery and immutable-history policies.
- `field-semantics-registry.schema.json` and `profiles/skillpilot-fwu-field-semantics-v1.registry.json` define closed, reversible JSON-field-to-RDF semantics and dependency behavior. The 454 entries comprise 323 Runtime rules, 130 publication-normal-form rules, and one legacy generic rule.
- `semantic-normalization-profile.schema.json`, `profiles/semantic-normal-form-v1.profile.json`, and `semantic-content-index.schema.json` define canonical JSON, ordered-versus-set behavior, missing/null/default handling, binary-resource records, length framing, and the packaging-neutral `contentDigest` input.
- `curriculum-ontology-profile.schema.json`, `profiles/de-gymnasium-mathematik-v1.profile.json`, and the fingerprinted Mathematik semantic-kind ledger bind Core-first mapping decisions to an exact FWU repository, commit, source file, profile hash, and namespace-map hash without title, ID, or path inference. Compiler and independent validator also prove that every mapped Core term occurs in the pinned OWL bytes.
- `release-model-build-profile.schema.json` and `profiles/de-gymnasium-mathematik-release-model-v1.profile.json` bind the real canonical landscape, 88 views, 12 decks, 825 resource links, path relocations, trusted contracts, and exact conformance counts.
- `publication-evidence-projection.schema.json` and `profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json` classify authored mapping, source, and review inputs and bind four generic package roles to the specific normalization roles `source-to-canonical-mappings`, `official-source-index`, `source-goal-reference-index`, and `release-quality-evidence`.
- `source-to-canonical-mappings.schema.json`, `official-source-index.schema.json`, `source-goal-reference-index.schema.json`, and `release-quality-evidence.schema.json` close those four release-facing payloads. They contribute normalized records to the shared `contentDigest` but declare `runtimeRequired: false` and never enter dependency closure.
- `package-redistribution-review.schema.json` and the Mathematik redistribution ledger bind every embedded image and every non-binary artifact class to provenance and an explicit redistribution decision. Provider labels never become licenses; unresolved decisions use `licenseExpression: null` and block readiness without making the manifest structurally invalid.
- `source-verification-review.schema.json` and the Mathematik source-verification ledger distinguish reproducible machine text matches from human review decisions. No machine match counts as a human approval, and no extracted official-PDF text projection is committed.
- `fixtures/full-standalone-package/` and `scripts/validate_full_standalone_curriculum_package.py` exercise an implementation-independent finished-ZIP validator. It verifies physical archive safety, exact inventory, package-local Runtime/schema catalogs, hard-reference closure, semantic digest, and binary-resource bytes without importing Builder code.
- `fixtures/package-provisioner/` binds one valid report/install/lock byte chain and exercises closed fields, exact protocol and gate sets, hash/release/binding substitution, duplicate and unsorted package selections, duplicate JSON keys, and trailing tokens without weakening the existing manifest fixture suite.
- `equivalence-report.schema.json` and `dual-release-index.schema.json` bind the isolated reverse compilation, field coverage, graph/view/card/asset parity, ontology gates, hermetic consumer tests, reproducibility, final ZIPs, provenance, and release authentication.
- `fixtures/valid/` contains conforming manifest examples.
- `fixtures/` contains positive, mutation-based, raw-JSON, cross-binding, adversarial ZIP, report-forgery, dual-release, and release-model ownership/fixed-point contract cases.

The DPK-004 compiler emits an unpacked conformance model below `tmp/`. Candidate `0.1.0-conformance.2` under publication profile `1.1.0` contains 111 logical and 756 binary content records with digest `sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60`. Its Runtime closure has 2,402 definitions and 18,815 references and contains none of the four publication roles. DPK-005b derives a real `full-standalone-v1` staging ZIP with 913 entries, of which 911 are manifest-inventoried and 756 are binary assets. The Builder's one public ZIP operation performs two differently ordered builds and atomically promotes only byte-identical output.

The publication projection treats the 10,021 reviewed mapping decisions and their 33,382 exact/partial edges as truth. An explicit decision match type wins; otherwise the compiler uses the edge-specific reviewed mapping value, never an implicit `exact` default. This resolves 2,599 edges from reviewed edge rows with zero unresolved types. Those rows contain 33,334 edges, with 48 decision edges absent and 23 explicit decision-versus-row conflicts. Legacy mapping files remain quarantined authoring/audit compatibility data: their 2,539 rows include 695 source IDs outside historical membership and eight dangling targets. Official evidence covers 31 collections, 55 documents, 9,977 source goals, and 16 jurisdictions. Machine source verification proves 9,493 contiguous authored-carrier matches and five additional hash-bound PDF-projection matches; 479 records remain explicit human work. Quality publishes 2,328 current decisions, but only 136 of 756 active visualizations are human-approved; 620 active reviews and one missing atomic-goal visualization keep `publicationStatus` honestly at `not-ready`. Redistribution is independently blocked by 756 image decisions and three non-binary class decisions awaiting human review.

The existing subject exporter still produces the explicitly marked legacy subject-export format. It is not conformant with `full-standalone-v1`; successful legacy export and roundtrip checks remain `not-ready-legacy`. For the new staging ZIP, inventory, Runtime catalog, offline schema catalog, hard-reference closure, content digest and binary bytes are implemented and independently checked. DPK-006a additionally proves exact read-only loading from a prevalidated store. Readiness nevertheless remains `not-ready-incomplete`: DPK-006b/006c/007 have not yet supplied safe provisioning and the hermetic whole-application consumer proof, and open redistribution decisions still block publication. The inner package-manifest and `full-standalone-v1` profile cover only the JSON runtime variant; the external DPK-003 proof contracts cover both variants, while the FWU-OWL inner manifest/profile remains a later contract step.

Run the contract conformance gate from the repository root:

```bash
python3 -B scripts/validate_curriculum_package_contracts.py
python3 -B scripts/validate_curriculum_runtime_catalog_contract.py
python3 -B scripts/validate_curriculum_schema_catalog_contract.py
python3 -B scripts/evaluate_curriculum_package_readiness.py --self-test
python3 -B scripts/validate_full_standalone_curriculum_package.py --self-test
python3 -B scripts/validate_curriculum_dual_release_contracts.py
python3 -B scripts/generate_curriculum_package_redistribution_review.py --check
python3 -B scripts/generate_curriculum_source_verification_review.py --check
```

Compile the real unpacked Mathematik model into a disposable directory:

```bash
python3 -B scripts/compile_curriculum_release_model.py \
  --profile contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json \
  --output tmp/curriculum-release-model/mathematik

python3 -B scripts/validate_curriculum_release_model.py \
  --profile contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json \
  --release-root tmp/curriculum-release-model/mathematik
```

Materialize and validate the real JSON staging package from that model:

```bash
npm --prefix app run export:full-standalone-package -- \
  --release-root tmp/curriculum-release-model/mathematik \
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

The focused gate `bash scripts/run_curriculum_release_model_conformance.sh` validates 9 positive fixture documents and 22 targeted negatives, runs the compiler dependency-emission probe and 47 production/adversarial cases, rejects destructive output-symlink and non-regular-node cases, verifies the pinned FWU Core checkout, performs the independent real-model validation, and produces a second byte-identical model build. It then invokes the real ZIP Builder exactly once—its ZIP operation is internally a double build—writes an independent validator-v2 report, checks its manifest/closure/definition bindings and requires the exact readiness result `not-ready-incomplete`. DPK-006a adds 29 focused Backend-Consumer tests and a real Mathematik-Loaderprobe; its complete repository `./run_ci.sh` is green.

The compiler accepts output directories only below repository `tmp/`. Its output and validation workflow are documented in [Curriculum Release Model Conformance](../../../docs/qa-ci/curriculum-release-model-conformance.md).

Use `--verbose` on the catalog validators to print every fixture result. All validators require the pinned `jsonschema==4.26.0` runtime and fail closed when trusted contracts are inconsistent, a binding is stale, or a valid fixture fails. The manifest/catalog suites assert their exact expected diagnostics; the DPK-003 adversarial matrix requires the named invariant diagnostic even when one mutation necessarily triggers additional dependent failures.

## Trust and inventory rules

The manifest binds the manifest schema, release profile, runtime-catalog schema, and schema-catalog schema by ID, archive-root-relative package path, and SHA-256. The validator requires each bootstrap declaration to match both the trusted file in this directory and exactly one corresponding `files[]` record. The release profile carries the closed trusted-schema registry. A package-local contract copy is therefore useful for offline processing but cannot redefine the trusted contract.

`validationSchemaId` links every normative JSON role to its exact allowed payload schema. The trusted profile pins the complete 22-schema set used by the Runtime and semantic contracts; the offline schema catalog must contain that complete set and bind each entry one-to-one to a manifest record with role `schema`, including path, media type, byte length, and SHA-256. Resolution uses only the in-memory package registry: remote retrieval, ambiguous URI forms, missing references, unknown schema files, and package-controlled replacement of a trusted schema are rejected.

All normal files are inventoried through explicit artifact roles. `metadata/manifest.json` is excluded because a manifest cannot hash itself; `metadata/SHA256SUMS` is generated after the manifest and binds the manifest together with the payload. Paths in `files[]` never contain the archive-root prefix.

Package roles and normalization roles are intentionally distinct. Generic roles such as `mapping`, `source-index`, `source-goal-reference-index`, and `quality-evidence` are the stable manifest/consumer vocabulary. The trusted publication profile binds each generic role one-to-one to its specific `normalizationRole`, closed schema, and field-registry lane. The content index records the generic role, while canonicalization uses the bound normalization role; an unknown, duplicated, or mismatched binding fails closed.

All contract JSON is parsed with duplicate-object-key rejection before schema validation, avoiding parser-dependent interpretations across Python, Java, and TypeScript. The v1 profile explicitly caps every JSON entry at 64 MiB, nesting at 128 levels, and the parsed tree at 5,000,000 nodes; the finished-ZIP validator reads those values from the trusted profile and has no hidden stricter JSON limit. The profile also caps a manifest at 64 MiB, 59,998 inventoried file records, and 1,024 license documents; array limits fail fast before full schema traversal, and path lookups are indexed rather than quadratic.

Every identifier used in a file's SPDX-style `licenseExpression` is resolved through `licenseDocuments` to an inventoried `license` artifact. `NONE`, `NOASSERTION`, malformed expressions, unresolved identifiers, and orphaned license texts fail the public standalone profile. Provenance remains a separate field and never substitutes for a redistribution license. `review-required` and `prohibited` records use `null`, remain structurally representable for staging, and fail the independent `publication.redistribution-cleared` readiness check.

The role table in the profile is authoritative. Runtime catalog, dependency closure, migration aliases, semantic content index, canonical landscape, view index/views, card index, resource index, schema catalog, schema set, five named semantic contracts, release profile, and license are required. Optional roles remain closed and explicitly enumerated; unknown roles fail validation. The runtime catalog must agree exactly with the manifest's runtime-role path sets, even when a set is empty, and every selectable root must resolve through an explicit default offering to an available composition view.

The profile also records the approved manifest/ZIP32 limits, portable full-path cap, and maximum per-entry/overall compression ratios. Manifest-level checks cover declared entry counts and sizes, image-lane limits, and nested-archive prohibition. The real finished-ZIP validator additionally enforces the raw manifest-byte limit before parsing and verifies outer ZIP size, compressed sizes, ratios, local/central header coherence, actual decompressed metadata and payload hashes instead of trusting manifest declarations.

## Cross-variant semantics and proof

The DPK-003 registry rejects unknown fields and separates `ordered-list`, `set`, `scalar`, `map`, `binary-reference`, and generated non-semantic data. Runtime-observable lists such as goals, direct `contains` and `requires` edges, resource links, composition children, cards, and scoring steps retain explicit zero-based RDF positions. A Core projection such as BFO parthood or `LP_0000554` prerequisites is additive and never replaces the positioned authored edge.

Canonical JSON literals are limited to registered owner subtrees with a stated Core gap and byte cap. They cannot carry a whole package or landscape. Known curricular text and prerequisite semantics use the FWU Core; application vocabulary remains limited to actual runtime, reconstruction, ordering, view, card, assessment, and packaging concerns.

The semantic content index contains no variant ZIP paths. It binds each normalized logical artifact's generic package role, stable ID, media type, length, canonical-payload SHA-256 and derived record SHA-256, plus stable binary-resource identity, canonical public reference, MIME type, length, file digest, and independently recomputed record digest. The checked fixture proves that a deterministic length-framed index yields one shared content digest. DPK-004 supplies the real Mathematik compiler and independent validator for Runtime and publication bytes; DPK-005b now turns the completed directory into the independently checked staging package.

The dual-release fixtures are conformance examples, not evidence for a real curriculum release. In particular, their dummy ZIP, Core, tool, and ontology-profile hashes do not make the current legacy subject export ready. A report may claim `passed` only with exact registry coverage, three content-index-bound normal forms, ordered graph/view/card parity, byte-identical assets, package-bound ontology checks, an isolated reverse compiler, independently validated original/reconstructed JSON packages, two hermetic consumer tests, and reproducible JSON and FWU-OWL ZIPs. The release contract defines a non-self-referential signing projection. Until DPK-011 supplies cryptographic signature and provenance verification, this validator rejects every `verified` claim and every `stable` promotion; the positive fixture is explicitly unsigned staging.
