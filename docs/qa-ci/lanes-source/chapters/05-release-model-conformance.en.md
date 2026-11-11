## Curriculum Release Model Conformance {#sec:qal-release-model}

`DPK-004` compiles the real German Gymnasium Mathematics authoring state into a strict, unpacked release model (`DPK-004a` for runtime payloads, `DPK-004b` for authoritative publication evidence) as the executable bridge to the `full-standalone-v1` JSON ZIP (@ref{sec:qal-package-readiness}). `DPK-004` through `DPK-007a` are technically `passed`.

### Overview and Trusted Inputs {#sec:qal-release-inputs}

Never inferring release semantics from filenames or goal titles, the compiler binds four explicit trusted inputs:

1. **Release-model build profile** (`contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json`): Pins source/output paths, package identity, views, decks, resource policy, path relocations, contracts, and exact counts (`1` landscape, `1,147` goals, `88` views, `12` decks, `128` cards, `784` resource links, `715` active images totaling `1,549,052,741` bytes).
2. **Ontology profile** (`contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json`, version `1.1.1`): SHA-256-pinned; binds the Core-first mapping to repository, checkout path (`tmp/lehrplan-ontologie`), commit, `src/ontology/components/lehrplan-core.owl`, ontology IRI, and file digest.
3. **Semantic-kind ledger** (`curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json`): Current source fingerprint for every one of the `1,147` goals without title/ID heuristics.
4. **Field-semantics registry** (`contracts/curriculum-package/v1/profiles/skillpilot-fwu-field-semantics-v1.registry.json`): `456` explicit entries (`325` runtime, `130` publication, `1` generic legacy entry; SHA-256 `d19497f0b18b0c7733dcaf6f5dc63590352814c2d764c858b333751b5af25e9d`), normalization profile, and closed Draft 2020-12 schemas (validated bidirectionally with zero dead registry paths; `field-coverage.json` separates observed instance coverage from schema-only entries).

:::table{cols="5.2cm,2.2cm,X"}
| Semantic kind (`semanticKind`) | Count | Role in the Mathematics release model |
| --- | ---: | --- |
| `curricularAtomic` | `780` | Atomic domain competencies (`711` with active image, `69` provider-deferred, `152` human-approved) |
| `curricularArea` | `218` | Curricular topic and area clusters |
| `practiceAssessment` | `129` | Practice, exam, and Abitur task nodes |
| `programStructure` | `7` | Program-structure containers |
| `memory` | `6` | SRS / memorization goals |
| `runtimeSupport` | `5` | Technical runtime support nodes |
| `orientation` | `2` | Orientation and motivation anchors |
:::

### Generated Model Layout, Digests, and Publication Evidence {#sec:qal-release-structure}

Output is promoted atomically via a private staging directory strictly beneath `tmp/` (`conformance-model-only-not-a-package`, rejecting symlinks; binary image bytes materialize only in the companion ZIP):

```text
data/
  canonical/mathematik.landscape.json
  views/index.json & views/*.json
  cards/card-index.json & cards/*.json
  resources/resource-index.json
  mappings/source-to-canonical.json
  sources/source-index.json & sources/source-goal-references.json
  runtime/{catalog,dependency-closure,migration-aliases}.json
  assessment-sources/...
metadata/
  quality/release-quality-evidence.json
  {semantic-content-index,field-coverage,build-inputs,release-model-conformance}.json
```

- **Dependency closure and digests:** `dependency-closure.json` captures `2,429` runtime definitions and `20,523` hard references with zero external dependencies (`sha256:5d542bfb46658aca0f570fa21d4771008d3238ab4aa87e5a551d55ed9efc3bc6`; definition index `sha256:1af9cf9fecdcdfec27372c1fc57a700634efb998755070ffd84dff0d1cff0680`). `migration-aliases.json` uses an explicit `initial` baseline for the first release. `semantic-content-index.json` binds `111` normalized logical records and `715` image records path-neutrally into `contentDigest` `sha256:9d3c0e03f95c06161abd0944335807704ffef1fcf20433f52d83167015637c64` (preserving the historical `.3` `DPK-007a`/`008` freeze untouched). When a prerequisite-reduction registry is declared, both compiler and validator independently run the Node proof verifier (`.nvmrc`) before comparing fingerprints.
- **Four publication roles (`runtimeRequired: false`):** `mapping` (`source-to-canonical-mappings`: `10,021` decisions $\to$ `33,234` exact/partial edges without unsafe `missing => exact` fallbacks), `source-index` (`official-source-index`: `31` collections, `55` documents — `52` Core `Lehrplan` + `3` `OfficialSourceDocument` — across `16` jurisdictions), `source-goal-reference-index` (`9,977` reviewed source goals typed as Core `Curriculares Element` with `CE-Verweis`; C0 controls and unpaired UTF-16 surrogates fail closed), and `quality-evidence` (`release-quality-evidence`: `2,335` decisions spanning `780` atomicity, `780` memory-goal, `64` active-card, and `711` active-image records; `publicationStatus: not-ready`).

### Verification Commands and Hosted PDF Mode {#sec:qal-release-commands}

Compiling, running the independent 49-case validator, checking fixtures (9 positive, 22 negative, remote schema retrieval disabled), and running the required JSON conformance wrapper (stopping before the 1.7-GB ZIP):

```bash
PROFILE=contracts/curriculum-package/v1/profiles
PROFILE="$PROFILE/de-gymnasium-mathematik-release-model-v1.profile.json"
python3 -B scripts/compile_curriculum_release_model.py \
  --profile "$PROFILE" \
  --output tmp/curriculum-release-model/mathematik-a
python3 -B scripts/validate_curriculum_release_model.py \
  --profile "$PROFILE" \
  --release-root tmp/curriculum-release-model/mathematik-a
python3 -B scripts/validate_curriculum_release_model_fixtures.py
python3 -B scripts/compile_curriculum_release_model.py \
  --self-test-dependency-emission
bash scripts/run_curriculum_release_model_conformance.sh
```

By default, referenced local source PDFs must be regular non-symlink files hashed byte-for-byte. Because hosted GitHub checkouts omit gitignored official PDFs, CI workflows explicitly set `SKILLPILOT_SOURCE_PDF_MODE=committed-bindings`: only genuinely absent PDFs may fall back to the byte count and SHA-256 already recorded in the committed source-verification ledger, while present, modified, or symlinked files still fail closed.
