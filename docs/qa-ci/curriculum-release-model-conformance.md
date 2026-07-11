# Curriculum Release Model Conformance

DPK-004 compiles the real German Gymnasium Mathematik authoring state into a strict, unpacked release model. DPK-004a established the Runtime portion; DPK-004b adds authoritative publication evidence. Together they are the executable bridge between repository-specific sources and the later `full-standalone-v1` JSON ZIP.

Current result: DPK-004 through DPK-006b are `passed`: the real profile, fixtures, independent validation, 47 production/adversarial cases, byte-identical model and ZIP builds, finished-package gates, secure content-addressed provisioning/CAS activation and the real Java Store-/Snapshot-Consumer pass. Runtime-Service cutover and the hermetic whole-application smoke remain DPK-006c/007.

## At a Glance

| Question | DPK-004 answer |
| --- | --- |
| Is real curriculum data compiled? | Yes: 1 Mathematik landscape, 1,079 goals, 88 views, 12 decks, 128 cards, and 825 resource links. |
| Are runtime payloads strict? | Yes: every compiled runtime role has a closed Draft 2020-12 schema; unknown fields fail. |
| Is dependency closure explicit? | Yes: typed definitions and schema-registered hard references are closed to a fixed point; the real model has no unresolved hard reference or external runtime dependency. |
| Are images part of semantic identity? | Yes: all 756 active images, totaling 1,695,291,325 bytes, contribute byte length and SHA-256 records to the shared `contentDigest`. |
| Is publication evidence part of semantic identity? | Yes: mappings, official sources, source-goal references, and quality evidence are four normalized logical artifacts in the same `contentDigest`. |
| Is publication evidence in the Runtime closure? | No: all four package roles declare `runtimeRequired: false`; the closure contains 2,402 Runtime definitions and 18,815 references, with zero publication roles. |
| Is publication quality honestly releasable? | No: 136 active goal visualizations are human-approved, 620 active reviews remain open, and one atomic goal has no active visualization, so the evidence artifact reports `publicationStatus: not-ready`. |
| Are image files copied into this output? | Not into the DPK-004 model directory. The DPK-005b companion ZIP materializes all 756 byte-bound images. |
| Is this output a standalone package? | The DPK-004 directory deliberately remains `conformance-model-only-not-a-package`. DPK-005b derives a structurally valid `full-standalone-v1` ZIP from it; DPK-006a/006b safely provision, activate and load it, while DPK-006c/007 still need to prove hermetic whole-application consumption. |

The short implementation workboard and remaining sequence are maintained in [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md). The target architecture is [Dual Curriculum Package Releases](../concept/curriculum-graph/dual-curriculum-package-releases.md).

## Trusted Inputs

The compiler does not discover release semantics from filenames or goal titles. Its trusted authored inputs are explicit:

- the [Mathematik release-model build profile](../../contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json), which pins source and output paths, package identity, views, decks, resource policy, path relocations, contracts, and exact counts;
- the [Mathematik ontology profile](../../contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json), whose own SHA-256 and canonical namespace-map SHA-256 are pinned by the build profile and which binds the Core-first mapping to the exact FWU repository, checkout path, commit, source path, ontology IRI, and file digest;
- the [Mathematik semantic-kind ledger](../../curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json), which carries a current source fingerprint for every goal and forbids title-, ID-, or path-based kind inference;
- the [field-semantics registry](../../contracts/curriculum-package/v1/profiles/skillpilot-fwu-field-semantics-v1.registry.json), normalization profile, strict payload schemas, and canonical definition-digest profile under `contracts/curriculum-package/v1/`.

The semantic-kind ledger covers all 1,079 goals:

| Semantic kind | Count |
| --- | ---: |
| `curricularAtomic` | 754 |
| `curricularArea` | 192 |
| `practiceAssessment` | 113 |
| `programStructure` | 7 |
| `memory` | 6 |
| `runtimeSupport` | 5 |
| `orientation` | 2 |

The field registry contains 454 explicit entries: 323 across the DPK-004 Runtime roles, 130 across the four publication normalization roles, and one pre-existing generic legacy entry. The independent validator walks every reachable field in the closed payload schemas in both directions: every schema field needs one effective registry mapping, and dead registry paths are rejected. The generated `field-coverage.json` separately reports which entries occurred in this concrete model; schema-only entries remain visible instead of being presented as instance-covered.

## Generated Model

The output is a disposable directory below repository `tmp/`:

```text
data/
  canonical/mathematik.landscape.json
  views/index.json
  views/*.json
  cards/card-index.json
  cards/*.json
  resources/resource-index.json
  mappings/source-to-canonical.json
  sources/source-index.json
  sources/source-goal-references.json
  runtime/catalog.json
  runtime/dependency-closure.json
  runtime/migration-aliases.json
  assessment-sources/...
metadata/
  quality/release-quality-evidence.json
  semantic-content-index.json
  field-coverage.json
  build-inputs.json
  release-model-conformance.json
```

The compiler performs only declared relocations. In particular, deck references below `/data/` become `data/cards/...`, and Mathematik assessment-source references become `data/assessment-sources/...`. It preserves the relative source path instead of collapsing files to basenames.

DPK-005b turns this directory into a disposable finished archive under `tmp/curriculum-release-model/full-standalone-package/`. The [full-package Builder](../../app/scripts/buildFullStandaloneCurriculumPackage.ts) expects 913 ZIP entries, 911 manifest-inventoried files, 756 binary assets and the same semantic digest. Manifest and `SHA256SUMS` are the only profile-declared self-referential files outside the manifest inventory. Package-local schemas and semantic contracts, license evidence, source-/redistribution-review evidence and every image byte are copied into the archive.

The [implementation-independent finished-ZIP validator](../../scripts/validate_full_standalone_curriculum_package.py) checks the physical archive, inventory and actual payloads without importing Builder code. The v1 trust profile exposes its JSON resource limits directly: 64 MiB per JSON entry, maximum nesting depth 128 and at most 5,000,000 parsed nodes. Thus a package cannot pass the Builder but encounter an undocumented stricter JSON limit only in this validator.

The caller-selected output path is handled lexically and must be a strict descendant of repository `tmp/`. Existing symlink components are rejected. Compilation happens in a fresh private sibling staging directory, followed by rename-based promotion; recursive deletion is limited to private staging or backup paths created by that process. The conformance wrapper attacks both a symlink target and a symlink parent and proves that unrelated sentinel directories survive.

Before compiling payloads, the compiler proves that `tmp/lehrplan-ontologie` is the declared Git worktree, has exactly the bound `origin` and `HEAD`, and contains an unchanged regular `src/ontology/components/lehrplan-core.owl` whose committed and working-tree bytes match the profile hash and ontology IRI. Every compact Core term used by the mapping profile must expand through the pinned namespace map and occur in that OWL module. `metadata/build-inputs.json` records the complete profile, namespace, term-set, repository, commit, source-file, byte-count, and SHA-256 binding. The independent validator repeats these checks without importing compiler code.

`dependency-closure.json` inventories typed Runtime definitions and every schema-classified Runtime reference. Identical definitions can be deduplicated by canonical definition digest; the same stable identity with a different definition is a hard conflict. Publication evidence is deliberately not seeded or traversed: evidence about a goal must roundtrip and affect the content digest, but it must not become a navigation dependency. The initial Mathematik release has no predecessor, so `migration-aliases.json` uses an explicit `initial` baseline and an empty rule set. Later releases must compare against a pinned stable baseline and use the registered migration relation and mastery/history policy for every identity change.

`semantic-content-index.json` is package-path-neutral. It binds 111 normalized logical records—including all four publication artifacts—and 756 image binary records into one deterministic `contentDigest`; generated digest fields are excluded through the versioned normalization contract to avoid self-reference. For `0.1.0-conformance.2` the result is `sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60`.

## Publication Evidence

Generic package roles remain stable for manifest inventory and consumers, while the profile binds each one to a specific `normalizationRole` for schema validation, field-registry lookup, and canonical hashing:

| Package role | Normalization role | Runtime required |
| --- | --- | --- |
| `mapping` | `source-to-canonical-mappings` | no |
| `source-index` | `official-source-index` | no |
| `source-goal-reference-index` | `source-goal-reference-index` | no |
| `quality-evidence` | `release-quality-evidence` | no |

The mapping artifact is compiled from authoritative review decisions, not from the older legacy carrier. Its 10,021 decisions yield 33,382 exact/partial edges. Match type is fail-closed: an explicit decision value wins; otherwise the edge-specific reviewed mapping row supplies it. This resolves 2,599 edges without an unsafe `missing => exact` assumption and leaves zero unresolved types. The edge rows contain 33,334 edges: 48 decision edges are absent there, and 23 explicit decision-versus-row conflicts are resolved by the decision truth. Legacy files remain an authoring/audit compatibility lane only; their 2,539 rows include 695 source IDs outside historical membership and eight dangling targets and cannot override the decisions.

Source evidence covers 31 collections, 55 official documents, 9,977 reviewed source-aligned goal records, and 16 jurisdictions. A hash-bound role table classifies 52 actual curriculum documents as Core `Lehrplan` and three official implementation/restriction/profile documents as application-level `OfficialSourceDocument`; unknown, unused, or mismatched roles fail closed. Source goals conservatively use the generic Core `Curriculares Element`, while source-to-canonical edges use Core `CE-Verweis`. Exact/partial match type is the narrow mapping extension. Quality evidence is application-only and publishes 754 semantic-atomicity decisions, 754 memory-goal decisions, 64 active-card decisions, and 756 active visualization decisions—2,328 decisions in total—plus one explicit missing-visualization scope record.

`sourceText` is the reviewed authored wording carried by the extraction/review lane, not a claim that every value is a verbatim PDF quotation. The release compiler preserves and hashes that wording exactly after the declared boundary-whitespace projection. The DPK-005a source-verification lane now proves 9,493 contiguous authored-carrier matches and five additional, replayable PDF-projection matches. The remaining 479 fingerprint-bound records require human classification. No machine match is a human or legal approval; DPK-004 proves lossless package projection, not independent quotation certification.

Strict scalar validation also exposed real PDF/OCR residue in source extraction: C0 controls and unpaired UTF-16 surrogates were corrected at the authoring source. The compiler rejects such unsafe values fail-closed; it does not sanitize them into a different release meaning.

## Commands

Compile and independently validate the real model from the repository root:

```bash
python3 -B scripts/compile_curriculum_release_model.py \
  --profile contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json \
  --output tmp/curriculum-release-model/mathematik-a

python3 -B scripts/validate_curriculum_release_model.py \
  --profile contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json \
  --release-root tmp/curriculum-release-model/mathematik-a
```

The validator is implementation-independent from the compiler. Its normal invocation runs 47 named production/adversarial cases spanning strict fields and order, ontology/profile and Registry-Core pins, publication-role separation, source-role/semantic-type overclaims, fail-closed Mapping-Truth reconciliation, source joins and lineage, package-internal scope bindings, independently derived quality status, stable-key uniqueness, quality fingerprints and assets, the recorded FWU Core binding, legacy `kompetenzen` hard references, program-unit parent cycles, rejection of non-regular filesystem nodes, semantic-kind fingerprints, definitions and closure, migration policy, resource and record hashes, and reproducibility-sensitive bindings.

Nine valid release-model fixture documents are validated separately against the closed local schemas and current registry/definition-profile trust bindings; 22 targeted negative cases cover both Runtime fixed-point semantics and the four publication payloads. Their cross-document ownership and embedded hard-reference fixed point—including an exact `goal.kompetenzen` edge to a scoped competency definition—run with all remote schema retrieval disabled. A lightweight compiler probe invokes the same dependency emitter used by the real build and checks that compatibility edge byte-for-byte before the large model is compiled:

```bash
python3 -B scripts/validate_curriculum_release_model_fixtures.py
python3 -B scripts/compile_curriculum_release_model.py \
  --self-test-dependency-emission
```

The focused gate combines those fixtures, the two output-symlink attacks, the pinned Core checkout, the real-model validator, a byte-identical second model build, exactly one real Builder invocation whose ZIP materialization internally builds twice, the independent finished-ZIP report, and an exact `not-ready-incomplete` Readiness assertion:

```bash
bash scripts/run_curriculum_release_model_conformance.sh
```

For a step-complete checkpoint, targeted conformance checks are followed by the full repository gate:

```bash
./run_ci.sh
```

The complete gate is green through DPK-006a: the real `0.1.0-conformance.2` model under publication profile `1.1.0`, all fixtures and adversarial cases, deterministic model and ZIP builds, Finished-ZIP validation, read-only Store-/Snapshot-Consumer tests, and repository-wide `./run_ci.sh` pass. Generated models, ZIPs, stores and reports remain under `tmp/` and are not committed.

## What Remains

| Step | Remaining outcome |
| --- | --- |
| DPK-005a | Completed: semantic file bindings, 22-schema offline trust, deterministic ZIP32 primitive, redistribution ledger, and source-verification queue. |
| DPK-005b | Technical implementation complete; finish the full repository CI gate and commit the safe, reproducible, independently validated JSON-package step. |
| DPK-006a | Bind validator-v2 evidence to ZIP, manifest, closure and definition index; rehash the complete manifest inventory and publish one immutable Runtime snapshot. |
| DPK-006c–007 | Route all fachliche Runtime services through the safely provisioned package and prove SkillPilot operation without the curriculum source tree or `app/public` fallback. |
| DPK-008–009 | Produce the Core-first FWU-OWL variant, reconstruct the JSON model in isolation, and issue the real dual-release equivalence proof. |

Until those gates pass, the existing Subject Export ZIP remains `not-ready-legacy`; the new DPK-005b ZIP is a `not-ready-incomplete` staging candidate, not a public release; and the DPK-004 directory itself remains a non-installable conformance model.
