# Curriculum Package Contract v1

This directory is the trusted repository authority for the SkillPilot curriculum-package v1 contract.

DPK-001 established the manifest/profile kernel; DPK-002 adds package-local discovery, offline schema resolution, and a fail-closed readiness vocabulary. DPK-003 freezes the cross-variant semantic proof contract. DPK-004a adds the strict unpacked runtime release model and proves it against the real Mathematik authoring state:

- `package-manifest.schema.json` defines the strict internal manifest shape.
- `profiles/full-standalone-v1.profile.json` defines the closed JSON release profile, artifact-role cardinalities, media types, redistribution policy, and package-format limits.
- `runtime-catalog.schema.json` defines explicit roots, offered scopes, view resolution, runtime artifacts, resources, capabilities, and package-local dependency references.
- `schema-catalog.schema.json` defines the offline ID-to-file resolver for hash-bound JSON Schemas.
- `profiles/full-standalone-v1.readiness-policy.json` and `package-readiness-report.schema.json` define the blocking checks and machine-readable decision.
- `compiled-landscape.schema.json`, `composition-view.schema.json`, `composition-view-index.schema.json`, `card-deck.schema.json`, `card-index.schema.json`, and `resource-index.schema.json` close the runtime payload shapes compiled in DPK-004a.
- `dependency-closure.schema.json`, `embedded-goal-dependency.schema.json`, `definition-digest-profile.schema.json`, and `profiles/canonical-definition-record-v1.profile.json` define typed identity, canonical definition digests, ownership, embedded fragments, fixed-point hard-reference closure, and deterministic conflict handling.
- `migration-aliases.schema.json` defines `renamed`, `replacedBy`, `splitInto`, `mergedInto`, and `removed` relations with explicit, fail-closed mastery and immutable-history policies.
- `field-semantics-registry.schema.json` and `profiles/skillpilot-fwu-field-semantics-v1.registry.json` define closed, reversible JSON-field-to-RDF semantics and dependency behavior. DPK-004a extends the DPK-003 baseline to every field in the compiled runtime roles; DPK-004b will classify mapping, source, and quality-evidence publication fields.
- `semantic-normalization-profile.schema.json`, `profiles/semantic-normal-form-v1.profile.json`, and `semantic-content-index.schema.json` define canonical JSON, ordered-versus-set behavior, missing/null/default handling, binary-resource records, length framing, and the packaging-neutral `contentDigest` input.
- `curriculum-ontology-profile.schema.json`, `profiles/de-gymnasium-mathematik-v1.profile.json`, and the fingerprinted Mathematik semantic-kind ledger bind Core-first mapping decisions to an exact FWU repository, commit, source file, profile hash, and namespace-map hash without title, ID, or path inference. Compiler and independent validator also prove that every mapped Core term occurs in the pinned OWL bytes.
- `release-model-build-profile.schema.json` and `profiles/de-gymnasium-mathematik-release-model-v1.profile.json` bind the real canonical landscape, 88 views, 12 decks, 825 resource links, path relocations, trusted contracts, and exact conformance counts.
- `equivalence-report.schema.json` and `dual-release-index.schema.json` bind the isolated reverse compilation, field coverage, graph/view/card/asset parity, ontology gates, hermetic consumer tests, reproducibility, final ZIPs, provenance, and release authentication.
- `fixtures/valid/` contains conforming manifest examples.
- `fixtures/` contains positive, mutation-based, raw-JSON, cross-binding, adversarial ZIP, report-forgery, dual-release, and release-model ownership/fixed-point contract cases.

The DPK-004a compiler emits an unpacked conformance model below `tmp/`, not a release ZIP. It proves strict runtime payloads, complete hard-reference closure, migration shape, binary-image binding, and the semantic digest against the real Mathematik data, but it deliberately reports `conformance-model-only-not-a-package`. It does not yet copy the 756 image sidecars or add a package manifest, offline schema catalog, full file inventory, licenses, checksums, or a hermetic consumer result. DPK-004b still has to classify mapping, source, and quality-evidence publication fields; DPK-005 packages the completed model.

The existing subject exporter therefore still produces the explicitly marked legacy subject-export format. It is not conformant with `full-standalone-v1`; successful legacy export and roundtrip checks remain `not-ready-legacy`. The readiness evaluator cannot emit `ready` until a finished ZIP passes the complete payload, inventory, license, ZIP-safety, and hermetic package-only consumer gates. The inner package-manifest and `full-standalone-v1` profile still cover only the JSON runtime variant; the external DPK-003 proof contracts cover both variants, while the FWU-OWL inner manifest/profile remains a later contract step.

Run the contract conformance gate from the repository root:

```bash
python3 -B scripts/validate_curriculum_package_contracts.py
python3 -B scripts/validate_curriculum_runtime_catalog_contract.py
python3 -B scripts/validate_curriculum_schema_catalog_contract.py
python3 -B scripts/evaluate_curriculum_package_readiness.py --self-test
python3 -B scripts/validate_curriculum_dual_release_contracts.py
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

CI uses `bash scripts/run_curriculum_release_model_conformance.sh` to validate the small release-model fixtures and compiler dependency-emission probe, reject destructive output-symlink and non-regular-node cases, verify the pinned FWU Core checkout, perform the independent real-model validation, and produce a second byte-identical build in one gate.

The compiler accepts output directories only below repository `tmp/`. Its output and validation workflow are documented in [Curriculum Release Model Conformance](../../../docs/qa-ci/curriculum-release-model-conformance.md).

Use `--verbose` on the catalog validators to print every fixture result. All validators require the pinned `jsonschema==4.26.0` runtime and fail closed when trusted contracts are inconsistent, a binding is stale, or a valid fixture fails. The manifest/catalog suites assert their exact expected diagnostics; the DPK-003 adversarial matrix requires the named invariant diagnostic even when one mutation necessarily triggers additional dependent failures.

## Trust and inventory rules

The manifest binds the manifest schema, release profile, runtime-catalog schema, and schema-catalog schema by ID, archive-root-relative package path, and SHA-256. The validator requires each bootstrap declaration to match both the trusted file in this directory and exactly one corresponding `files[]` record. The release profile carries the closed trusted-schema registry. A package-local contract copy is therefore useful for offline processing but cannot redefine the trusted contract.

`validationSchemaId` links normative JSON records to the offline schema catalog. In DPK-002 it is mandatory for the runtime and schema catalogs; complete coverage of all runtime JSON roles is a later readiness gate. The schema catalog must bind one-to-one to manifest records with role `schema`, including path, media type, byte length, and SHA-256. Resolution uses only the in-memory package registry: remote retrieval, ambiguous URI forms, missing references, unknown schema files, and package-controlled replacement of a trusted schema are rejected.

All normal files are inventoried through explicit artifact roles. `metadata/manifest.json` is excluded because a manifest cannot hash itself; `metadata/SHA256SUMS` is generated after the manifest and binds the manifest together with the payload. Paths in `files[]` never contain the archive-root prefix.

All contract JSON is parsed with duplicate-object-key rejection before schema validation, avoiding parser-dependent interpretations across Python, Java, and TypeScript. The profile caps a manifest at 64 MiB, 59,998 inventoried file records, and 1,024 license documents; array limits fail fast before full schema traversal, and path lookups are indexed rather than quadratic.

Every identifier used in a file's SPDX-style `licenseExpression` is resolved through `licenseDocuments` to an inventoried `license` artifact. `NONE`, `NOASSERTION`, malformed expressions, unresolved identifiers, and orphaned license texts fail the public standalone profile. Provenance remains a separate field and never substitutes for a redistribution license.

The role table in the profile is authoritative. Runtime catalog, dependency closure, migration aliases, canonical landscape, view index/views, card index, resource index, schema catalog, schema, release profile, and license are required. Optional roles remain closed and explicitly enumerated; unknown roles fail validation. The runtime catalog must agree exactly with the manifest's runtime-role path sets, even when a set is empty, and every selectable root must resolve through an explicit default offering to an available composition view.

The profile also records the approved manifest/ZIP32 limits, portable full-path cap, and maximum per-entry/overall compression ratios. This manifest-level gate checks declared entry counts and sizes, image-lane limits, and nested-archive prohibition. A later finished-ZIP validator must additionally enforce the raw manifest-byte limit before parsing and verify the outer ZIP size, compressed sizes, ratios, and actual decompressed metadata rather than trusting manifest declarations.

## Cross-variant semantics and proof

The DPK-003 registry rejects unknown fields and separates `ordered-list`, `set`, `scalar`, `map`, `binary-reference`, and generated non-semantic data. Runtime-observable lists such as goals, direct `contains` and `requires` edges, resource links, composition children, cards, and scoring steps retain explicit zero-based RDF positions. A Core projection such as BFO parthood or `LP_0000554` prerequisites is additive and never replaces the positioned authored edge.

Canonical JSON literals are limited to registered owner subtrees with a stated Core gap and byte cap. They cannot carry a whole package or landscape. Known curricular text and prerequisite semantics use the FWU Core; application vocabulary remains limited to actual runtime, reconstruction, ordering, view, card, assessment, and packaging concerns.

The semantic content index contains no variant ZIP paths. It binds each normalized logical artifact's role, stable ID, media type, length, canonical-payload SHA-256 and derived record SHA-256, plus stable binary-resource identity, canonical public reference, MIME type, length, file digest, and independently recomputed record digest. The checked fixture proves that a deterministic length-framed index yields one shared content digest. DPK-004a supplies the real Mathematik compiler and independent validator for those payload bytes; DPK-004b extends the modeled publication evidence before DPK-005 turns the directory into a package.

The dual-release fixtures are conformance examples, not evidence for a real curriculum release. In particular, their dummy ZIP, Core, tool, and ontology-profile hashes do not make the current legacy subject export ready. A report may claim `passed` only with exact registry coverage, three content-index-bound normal forms, ordered graph/view/card parity, byte-identical assets, package-bound ontology checks, an isolated reverse compiler, independently validated original/reconstructed JSON packages, two hermetic consumer tests, and reproducible JSON and FWU-OWL ZIPs. The release contract defines a non-self-referential signing projection. Until DPK-011 supplies cryptographic signature and provenance verification, this validator rejects every `verified` claim and every `stable` promotion; the positive fixture is explicitly unsigned staging.
