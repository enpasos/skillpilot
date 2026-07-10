# Curriculum Release Model Conformance

DPK-004a compiles the real German Gymnasium Mathematik authoring state into a strict, unpacked runtime release model. This is the executable bridge between repository-specific sources and the later `full-standalone-v1` JSON ZIP.

Current result: `passed`. The real profile, fixture and safety gates, independent validation, byte-identical double build, and the complete repository `./run_ci.sh` all pass. Overall DPK-004 remains `in_progress`: DPK-004b still has to classify mapping, source, and quality-evidence fields before packaging begins.

## At a Glance

| Question | DPK-004a answer |
| --- | --- |
| Is real curriculum data compiled? | Yes: 1 Mathematik landscape, 1,079 goals, 88 views, 12 decks, 128 cards, and 825 resource links. |
| Are runtime payloads strict? | Yes: every compiled runtime role has a closed Draft 2020-12 schema; unknown fields fail. |
| Is dependency closure explicit? | Yes: typed definitions and schema-registered hard references are closed to a fixed point; the real model has no unresolved hard reference or external runtime dependency. |
| Are images part of semantic identity? | Yes: all 756 active images, totaling 1,695,291,325 bytes, contribute byte length and SHA-256 records to the shared `contentDigest`. |
| Are image files copied into this output? | No. DPK-004a reads and hashes them; DPK-005 materializes them in the ZIP. |
| Is this output a standalone package? | No. It deliberately reports `conformance-model-only-not-a-package`. Manifest, schema catalog, licenses, complete inventory, checksums, archive safety, and the hermetic consumer gate follow later. |

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

The field registry contains 324 explicit entries: 323 across the nine DPK-004a runtime roles plus the pre-existing generated quality-evidence entry. The independent validator walks every reachable field in the closed payload schemas in both directions: every schema field needs one effective registry mapping, and dead runtime registry paths are rejected. The generated `field-coverage.json` separately reports which entries occurred in this concrete model; schema-only entries remain visible instead of being presented as instance-covered.

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
  runtime/catalog.json
  runtime/dependency-closure.json
  runtime/migration-aliases.json
  assessment-sources/...
metadata/
  semantic-content-index.json
  field-coverage.json
  build-inputs.json
  release-model-conformance.json
```

The compiler performs only declared relocations. In particular, deck references below `/data/` become `data/cards/...`, and Mathematik assessment-source references become `data/assessment-sources/...`. It preserves the relative source path instead of collapsing files to basenames.

The caller-selected output path is handled lexically and must be a strict descendant of repository `tmp/`. Existing symlink components are rejected. Compilation happens in a fresh private sibling staging directory, followed by rename-based promotion; recursive deletion is limited to private staging or backup paths created by that process. The conformance wrapper attacks both a symlink target and a symlink parent and proves that unrelated sentinel directories survive.

Before compiling payloads, the compiler proves that `tmp/lehrplan-ontologie` is the declared Git worktree, has exactly the bound `origin` and `HEAD`, and contains an unchanged regular `src/ontology/components/lehrplan-core.owl` whose committed and working-tree bytes match the profile hash and ontology IRI. Every compact Core term used by the mapping profile must expand through the pinned namespace map and occur in that OWL module. `metadata/build-inputs.json` records the complete profile, namespace, term-set, repository, commit, source-file, byte-count, and SHA-256 binding. The independent validator repeats these checks without importing compiler code.

`dependency-closure.json` inventories typed definitions and every schema-classified reference. Identical definitions can be deduplicated by canonical definition digest; the same stable identity with a different definition is a hard conflict. The initial Mathematik release has no predecessor, so `migration-aliases.json` uses an explicit `initial` baseline and an empty rule set. Later releases must compare against a pinned stable baseline and use the registered migration relation and mastery/history policy for every identity change.

`semantic-content-index.json` is package-path-neutral. It binds normalized logical records and the image binary records into one deterministic `contentDigest`; generated digest fields are excluded through the versioned normalization contract to avoid self-reference.

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

The validator is implementation-independent from the compiler. Its normal invocation also runs 25 named self-test cases for strict fields and order, ontology-profile and namespace pins, the recorded FWU Core binding, legacy `kompetenzen` hard references, program-unit parent cycles, rejection of non-regular filesystem nodes, semantic-kind fingerprints, definitions and closure, migration policy, resource and record hashes, and reproducibility-sensitive bindings.

Five small release-model contract fixtures are validated separately against the closed local schemas and current registry/definition-profile trust bindings. Their cross-document ownership and embedded hard-reference fixed point—including an exact `goal.kompetenzen` edge to a scoped competency definition—are exercised by eight semantic mutations with all remote schema retrieval disabled. A lightweight compiler probe invokes the same dependency emitter used by the real build and checks that compatibility edge byte-for-byte before the large model is compiled:

```bash
python3 -B scripts/validate_curriculum_release_model_fixtures.py
python3 -B scripts/compile_curriculum_release_model.py \
  --self-test-dependency-emission
```

The focused gate combines those fixtures, the two output-symlink attacks, the pinned Core checkout, the real-model validator, and a byte-identical second build:

```bash
bash scripts/run_curriculum_release_model_conformance.sh
```

For a step-complete checkpoint, targeted conformance checks are followed by the full repository gate:

```bash
./run_ci.sh
```

DPK-004a is considered complete only when the real profile, adversarial cases, a second deterministic build, and the full CI all pass. Generated models and raw logs remain under `tmp/` and are not committed.

## What Remains

| Step | Remaining outcome |
| --- | --- |
| DPK-004b | Classify and model mapping, official-source, source-goal-reference, provenance, and quality-evidence fields as Runtime, publication evidence, or authoring-only data. |
| DPK-005 | Materialize the completed model and all required binary assets as a safe, fully inventoried `full-standalone-v1` JSON ZIP with package-local schemas and licenses. |
| DPK-006–007 | Load only from the package and prove SkillPilot operation without the curriculum source tree or `app/public` fallback. |
| DPK-008–009 | Produce the Core-first FWU-OWL variant, reconstruct the JSON model in isolation, and issue the real dual-release equivalence proof. |

Until those gates pass, the existing Subject Export ZIP remains `not-ready-legacy`, and the DPK-004a directory must not be published or installed as a standalone curriculum package.
