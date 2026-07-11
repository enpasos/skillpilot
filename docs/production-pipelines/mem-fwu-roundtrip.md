# MEM/FWU Core Roundtrip Pipeline

This pipeline proves that a SkillPilot subject publication package can be transformed into a core-first RDF/OWL bundle based on the FWU Lehrplan-Ontologie and reconstructed semantically without reading the original package as an input source.

The target release architecture that turns this reference pipeline into paired JSON-runtime and FWU-ontology curriculum releases is described in [Dual Curriculum Package Releases](../concept/curriculum-graph/dual-curriculum-package-releases.md).

The current implementation checkpoint and remaining roadmap are tracked in [Dual Curriculum Package Implementation Status](../dev/dual-curriculum-package-implementation-status.md).

The current reference scope is:

`tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip`

This reference ZIP belongs to the explicitly marked legacy subject-export lane. A successful semantic roundtrip proves equivalence for the covered content and image sidecars; it does not prove `full-standalone-v1` runtime readiness, so this specific artifact remains `not-ready-legacy`.

DPK-003 provides the normative [dual-release contract gate](../qa-ci/dual-curriculum-release-contracts.md). It intentionally exposes two differences from this legacy pilot: the existing comparator drops `null` properties during its local normalization and compares several goal arrays as sorted sets, while the release contract keeps missing/null/default distinct and preserves runtime-observable list order. Therefore the current `semantic-reconstruction-report.json`, technical `roundtrip-report.json`, and OWL report remain hashable input evidence only; none of them may be relabelled as the public equivalence verdict. DPK-004 compiles and independently validates the complete, unpacked Mathematik release normal form: Runtime closure, all active image-byte bindings, and the four digest-relevant but non-Runtime publication artifacts for mappings, sources, SourceGoals, and quality. It is documented in [Curriculum Release Model Conformance](../qa-ci/curriculum-release-model-conformance.md). DPK-005a closed package-level semantic identity, the complete offline schema trust set, deterministic ZIP32 safety, and the explicit [human review gates](../qa-ci/curriculum-package-human-review-gates.md).

DPK-005b materializes that model as a real `full-standalone-v1` staging ZIP with 913 entries, 911 manifest-inventoried files, all 756 image resources and the unchanged semantic digest. A Builder-independent [finished-package validator](../../scripts/validate_full_standalone_curriculum_package.py) checks its physical ZIP and package-local contracts. DPK-006a loads the exact package content read-only from a content-addressed store; validator report v2 binds ZIP, manifest, closure and definition index before all manifest files are rehashed by the Java consumer. DPK-006b now provisions that store through deterministic quarantine, a second exact streaming extraction/tree check and immutable evidence, then activates it by CAS with rollback history. DPK-006c-a/b/c bind the complete artifact inventory, landscapes, mappings, path-free runtime catalog and all 88 composition-view offerings to the same immutable package generation; package mode no longer invents scope fallbacks or synthetic merges. DPK-006c-d adds the same-generation resource resolver: public catalog hrefs identify exact package/version/deck/locale or resource IDs, all six German/English deck pairs and 756 JPEG/PNG sidecars are read through the hash-verifying artifact facade, and 69 external tools remain metadata-only. DPK-006c-e makes that catalog authoritative in the browser as well: package roots, explicit/default/exact offerings, both deck locales, embedded goal images and external tools use catalog identities and public hrefs; only a catalog `404` enters repository compatibility, while invalid or unavailable catalogs fail closed without `/match`, `/data` or raw-asset fallback. The real conformance wrapper therefore proves Build → Validator → Provisioner → Store → Java Domain/View/Resource Resolver, and executable frontend contracts prove the public hand-off. The result remains honestly `not-ready-incomplete`: package-bound source display and the hermetic SkillPilot smoke in DPK-006c-f/007 are still open, as are the human publication gates. DPK-008 later migrates the ontology exporter/importer from this legacy subject ZIP to the positioned RDF representation and isolated reverse-compiler contract.

Accordingly, two lanes coexist temporarily:

- the commands below continue to exercise the already working legacy semantic OWL pilot;
- `scripts/run_curriculum_release_model_conformance.sh` builds and validates the new JSON staging ZIP under `tmp/curriculum-release-model/full-standalone-package/`.

They must not be presented as the final dual-release roundtrip until DPK-008/009 connect the new JSON package to the Core-first ontology package and compare the isolated reverse compilation.

## Roundtrip Contract

```text
SkillPilot subject ZIP, including goal-visualization images
  -> FWU-core-first semantic bundle: RDF/OWL + hashed binary sidecars
  -> reconstructed SkillPilot semantic content + materialized image sidecars
  -> comparison with the original ZIP as validation oracle
```

The original ZIP is used only after reconstruction to compare semantic fields and image bytes. The reverse transformation reads `bundle.nt` and the sidecars next to it; it does not read JSON or image content from the original ZIP to reconstruct the result.

The roundtrip is semantic, not layout- or byte-identical for every generated metadata file. A separate technical carrier lane remains available for a byte-oriented package check.

## Bound FWU Core Version

The local FWU checkout defaults to:

`tmp/lehrplan-ontologie`

The exporter requires and records:

- Git commit of the checkout;
- `src/ontology/components/lehrplan-core.owl`;
- ontology IRI `https://w3id.org/lehrplan/ontology/lp/components/lehrplan-core.owl` as the identity recorded in RDF;
- the exact ontology IRI, all declarations used by the exporter, and selected structural sentinel axioms for prerequisites, references, subject-specific competencies, process-competency areas, grades, school stages, requirement levels, titles, and reference positions;
- a copy and SHA-256 digest of the bound core module in the slim bundle.

The manifest must contain a non-empty Git commit hash and canonical repository-relative Core source path; the RDF binding must repeat both values exactly. Missing values cannot pass by comparing two absent fields.

The profile always imports the canonical W3ID ontology IRI. The OASIS XML catalog `catalog-v001.xml` resolves that IRI to `ontology/lehrplan-core.owl`, so ontology tooling uses the pinned local copy without changing the ontology's identity. The manifest records the canonical import, catalog, bound commit, and core checksum.

`declarations.nt` declares the classes and property kinds used by the data in the same RDF graph as `bundle.nt`. This matters for RDF-to-OWL parsers: a later OWL merge cannot retroactively reinterpret unknown predicates that were initially parsed as annotation properties. The richer domains, ranges, subclass axioms, and equivalences still come from the application profile and imported FWU core.

This binding is currently necessary because [FWU-DE/lehrplan-ontologie#9](https://github.com/FWU-DE/lehrplan-ontologie/pull/9) added `LP_0000554` to the merged source module while the generated `lp*.ttl/owl` release artifacts in the same upstream checkout have not yet been regenerated with that term. The pipeline fails early if the expected core contract is unavailable instead of silently falling back to an older ontology release.

## Core-First Mapping

| SkillPilot meaning | Primary representation | Application fallback or extension |
| --- | --- | --- |
| Atomic curricular goal with a named curricular area parent | `LP_0000336` Fachbezogene Kompetenzspezifikation | `sp:LearningGoal` + `sp:AtomicGoal` preserve the runtime graph-node distinction |
| Otherwise curricular but currently unscoped atomic goal | not forced into `LP_0000336`, whose Core restriction requires a `LP_0000349` area | `sp:UnscopedCurricularGoal`; this is an explicit migration queue, not an anonymous Core-area assertion |
| Curricular cluster | `LP_0000349` CE-Bereich | `sp:LearningGoal` + `sp:ClusterGoal` |
| K1–K6 catalog entry | `LP_0030265` Prozessbezogener Kompetenzbereich (Bistas), core title/number, and mathematics subject | `sp:CompetencyCatalogEntry` preserves the catalog role |
| Authored goal-to-K1–K6 link | reified `LP_0030065` CE-Verweis via `LP_0030071` / `LP_0030072` for curricular goals | direct `sp:competencyRef` is the runtime/unscoped export fallback and remains a legacy importer fallback |
| `dimensionTags.processCompetencies` | 27 `LP_0030265` resources for K1–K6 and Kx.y; Kx.y is a BFO part of Kx | exact structured JSON remains authoritative for reconstruction |
| `dimensionTags.guidingIdeas` | five `LP_0000268` Leitidee-(Bista) resources for L1–L5 | exact structured JSON remains authoritative for reconstruction |
| Program year/stage | `LP_0000026` with `LP_2000005`–`LP_2000010`; `LP_0000047` with Sek I/Sek II individuals | `sp:ProgramUnit` and placement metadata preserve the application program model |
| Strict curricular `contains` | `BFO_0000051` (`hat Teil`) | `sp:containsGoal` additionally preserves the authored direct edge |
| Non-curricular or mixed runtime `contains` | not forced into BFO parthood | `sp:containsGoal` |
| Curricular-to-curricular `requires` | reified `LP_0000554` Didaktische Voraussetzung | none |
| Runtime `requires` involving practice, assessment, memory, orientation, or runtime-only clusters | not asserted as a curricular prerequisite | direct `sp:didacticRequires` |
| Curricular title | `LP_0030056` -> `LP_0000346` -> `LP_0000344` | readable `rdfs:label` remains in parallel |
| Curricular description | `LP_0030051` -> `LP_0030003` -> `LP_0000344` | readable `dcterms:description` remains in parallel |
| Curricular short number | `LP_0030057` -> `LP_0000347` -> `LP_0000344` | `sp:shortKey` preserves the exact runtime field |
| Visualization of a curricular goal | generic `LP_0030065` CE-Verweis to `schema:ImageObject`, ordered with `LP_0000460` | role and package path/hash/length remain SkillPilot packaging metadata |
| Visualization of a runtime-only or unscoped goal | not forced into a curricular CE reference | `sp:GoalVisualizationReference` via `sp:hasGoalVisualization` / `sp:referencesAsset` |
| Official curriculum document (`semanticType: curriculum`) | `LP_0000438` Lehrplan with Core title and canonical URI | stable source identity, collection grouping, role, and optional landing URL remain publication evidence |
| Official supplemental source (`semanticType: supplemental-source`) | no false Core-`Lehrplan` claim | `sp:OfficialSourceDocument` with `rdfs:label`; role and semantic type are preserved exactly |
| Reviewed SourceGoal evidence | conservative `LP_0000261` Curriculares Element with Core title and description | reviewed source-aligned authored wording/hash, document join, locator, classification, and split lineage remain publication evidence; no verbatim-PDF claim is inferred |
| Authoritative source-to-canonical mapping | `LP_0030065` CE-Verweis via `LP_0030071` / `LP_0030072` | only `exact` versus `partial` needs a small `sp` predicate |
| Quality evidence | no Core assertion | semantic-atomicity, memory-card, and visualization decisions remain `sp` evidence and never enter Runtime closure |

### Didactic prerequisites

Every prerequisite whose source and target are curricular goals is represented as a first-class reference resource:

```turtle
<goal/current> lp:LP_0030071 <goal/current/didactic-prerequisite/prior> .

<goal/current/didactic-prerequisite/prior>
  a lp:LP_0000554 ;
  lp:LP_0030072 <goal/prior> .
```

`LP_0030071` is `hat Verweis`; `LP_0030072` is `verweist auf`. `LP_0000554` is already a subclass of `LP_0030065`, so the redundant generic type and reference-function assertions are omitted. A generic `CE-Verweis` is not interpreted as a prerequisite. Runtime-only edges use `sp:didacticRequires` and cannot accidentally acquire curricular semantics.

### Competency-axis projection

Structured mathematics axes are projected to the FWU Core only for goals already classified as curricular. Runtime and unscoped goals keep the same data solely in `sp:dimensionTagsJson` and are not turned into curricular elements by an axis link.

Every projected axis link uses the generic Core reference pattern. `sp:referenceRole` is the one application-level reconstruction hint and distinguishes:

- authored `competencyRefs`;
- derived `dimensionTags.processCompetencies`;
- derived `dimensionTags.guidingIdeas`.

One source/target reference may have more than one role. The importer reconstructs authored `competencyRefs` only from that exact role, so a derived K1/K1.x projection cannot silently become authored source data. Bundles predating roles retain the former type-based importer fallback.

The shared L1–L5 resources deliberately use stage-neutral labels (`Leitidee L1` … `Leitidee L5`): Sek-I and Sek-II source frameworks use different wording for the same canonical dimension codes. Likewise, Kx.y resources are code-level process subareas, not invented `LP_0030266` standards; their exact code-level source values remain lossless in `dimensionTagsJson`.

### Goal containment

The exporter classifies graph nodes before writing containment:

- every authored direct edge uses `sp:containsGoal` as the lossless roundtrip anchor;
- a curricular cluster containing a curricular cluster or atomic curricular goal additionally uses `BFO_0000051`;
- practice, assessment, memory, orientation, program, runtime-only support folders, and other mixed graph edges are not asserted as BFO parthood;
- the old redundant `sp:hasCurricularPart` term is not written;
- the importer reconstructs current bundles from direct `sp:containsGoal` assertions and reads BFO-only assertions only as a legacy fallback.

The direct application assertion is necessary even for strict curricular edges: `BFO_0000051` is transitive in the FWU core. A reasoner may therefore materialize indirect descendants. Those inferred triples are valid BFO semantics but must not become direct SkillPilot children during reconstruction.

Only top-level curricular elements are attached to the landscape as BFO parts. The exporter does not flatten every curricular descendant into a direct landscape child.

### OWL-safe literals and source quarantine

Compact JSON metadata is serialized as `xsd:string`. A private `sp:json` datatype is deliberately not used because arbitrary custom datatypes made the otherwise valid graph fail the OWL 2 DL profile.

Before an ordinary RDF literal is written, the exporter rejects XML/RDF-unsafe control characters, U+FFFE/U+FFFF, and unpaired UTF-16 surrogates. Official source evidence is not silently cleaned. If a complete source-goal record contains such OCR/PDF extraction artifacts:

- its safe fields remain ordinary queryable RDF literals;
- the exact record is additionally stored as escaped `xsd:string` JSON in `sp:quarantinedRecordJson`;
- unsafe direct literals are omitted;
- the semantic importer restores the exact original record from the quarantined JSON and overlays any safe first-class fields.

This is a narrow application fallback for malformed source evidence, not a replacement for normal core text entities.

That quarantine remains only a backward-compatible reader/writer lane for legacy roundtrip bundles. The DPK-004 release compiler has a stricter contract: it rejects C0 controls, U+FFFE/U+FFFF, and unpaired UTF-16 surrogates in every input scalar before projection or hashing and never substitutes a sanitized surrogate value. This gate found real PDF/OCR residue in the Mathematik source extractions; the affected authored source was corrected. Future recurrence blocks the release instead of being hidden in a quarantine carrier.

Structured application metadata stays structured across the roundtrip. Every present `dimensionTags` value, including ordered and empty arrays, is preserved as canonical JSON in `sp:dimensionTagsJson`; repeated `sp:dimensionTag` literals remain only as a query/legacy projection for array-valued data. Core axis triples are an additional semantic projection, never the lossless source of truth.

## Goal-Visualization Package Contract

The subject-package builder selects images exclusively from active canonical links with:

```json
{
  "type": "goal-visualization",
  "resourceType": "image"
}
```

It does not scan the asset directory indiscriminately. Replaced or orphaned files are therefore excluded.

For a canonical URL such as:

```text
/assets/goal-visualizations/mathematik/<goalId>/<goalId>.jpg
```

the ZIP contains the same path below its archive root. The file can consequently be resolved by removing the leading slash from the canonical URL.

`data/resources/goal-visualizations.json` records, per active link:

- goal ID and link order;
- package path and public URL;
- MIME type, byte length, and SHA-256;
- `skillpilotId`, role, title, provider, description, alt text, language, license note, and review status.

The independent subject-package validator checks:

- unique ZIP entry names, checksum paths, and manifest paths;
- a metadata preflight before decompression: regular-file modes, central-directory sizes, per-entry/total limits, and unambiguous entry metadata;
- an exact manifest file set: every ZIP file except `manifest.json` and `SHA256SUMS` appears exactly once;
- rejection of absolute/drive-rooted paths, backslashes, Windows-reserved names or characters, empty, `.` or `..` path segments, case-folded/Unicode-normalized collisions, and file/child prefix conflicts;
- rejection of symlinks, directories, and other special ZIP entries: publication ZIPs contain regular-file entries only;
- safe root-relative paths and matching goal/file IDs;
- JPEG/PNG extension, MIME type, and magic bytes;
- exact agreement between canonical link, resource index, ZIP entry, and package manifest;
- byte length and SHA-256;
- a 64 MiB limit per visualization and 8 GiB for the complete visualization lane, enforced consistently by builder, validator, and roundtrip;
- before any per-entry decompression, both roundtrip importers additionally reject archives with an entry above 512 MiB or more than 16 GiB total declared uncompressed data;
- absence of missing and orphaned image entries;
- explicit image-license category and preserved per-link license note.

Its JSON and Markdown reports record the SHA-256 of the outer ZIP container. The validator hashes that ZIP before and after all `zipinfo`/`unzip` checks and fails if the bytes change during validation.

The category `goal-visualization-ai-generated-curated` records provenance and curation status. It is deliberately not treated as an SPDX identifier or an automatic CC BY grant.

## Image Representation in RDF

Images on curricular goals reuse the core `CE-Verweis` pattern:

```turtle
<goal/G> lp:LP_0030071 <goal/G/goal-visualization/0> .

<goal/G/goal-visualization/0>
  a lp:LP_0030065 ;
  lp:LP_0030072 <package/asset/...> ;
  lp:LP_0000460 0 ;
  sp:role "primary" .

<package/asset/...>
  a schema:ImageObject ;
  schema:contentUrl "/assets/goal-visualizations/..." ;
  schema:encodingFormat "image/jpeg" ;
  schema:accessibilitySummary "..."@de ;
  sp:zipPath "<archive-root>/assets/goal-visualizations/..." ;
  sp:sha256 "..." ;
  sp:byteLength 12345 .
```

Runtime-only and currently unscoped goals use the application lane instead, because a memory, assessment, orientation, or unscoped runtime node must not become a curricular competency merely because it has an image:

```turtle
<goal/runtime> sp:hasGoalVisualization <goal/runtime/goal-visualization/0> .

<goal/runtime/goal-visualization/0>
  a sp:GoalVisualizationReference ;
  sp:referencesAsset <package/asset/...> ;
  sp:order 0 .
```

The SkillPilot profile declares `schema:ImageObject rdfs:subClassOf IAO_0000030`, so the duplicate per-image IAO type assertion is unnecessary. The importer supports both lanes but, for current self-contained bundles, also proves that every reference uses the lane dictated by the canonical goal classification.

For goals with images, `sp:resourceLinksJson` retains null placeholders at the original array positions instead of duplicating all image metadata. The importer fills those positions from the explicit references. Older bundles containing complete JSON links remain readable without producing duplicates.

`assets.nt` contains these references and media metadata. The corresponding image files live under `slim/assets/goal-visualizations/...`.

Binary image data is never Base64-encoded into `bundle.nt`. The slim manifest records every sidecar path, size, and SHA-256.

Selected image entries are extracted in argument-size-bounded batches (one batch for the current package), then individually checked for regular-file type, byte length, and SHA-256. Reconstructed asset trees receive independent copies whose destination bytes are hashed again, so later mutation of an input sidecar cannot change an already validated reconstruction.

## Commands

Run commands from `app/`.

### 1. Build the current subject package

```bash
npm run export:subject-package -- --subject Mathematik --version 0.1.0
```

### 2. Validate the package independently

```bash
npm run export:subject-packages:validate -- \
  --zip ../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
```

### 3. Run the preferred semantic roundtrip

```bash
npm run roundtrip:mem-fwu:semantic
```

This is equivalent to the two explicit stages:

```bash
npm run roundtrip:mem-fwu:slim -- \
  --zip ../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip \
  --ontology-dir ../tmp/lehrplan-ontologie

npm run roundtrip:mem-fwu:semantic-reconstruct -- \
  --rdf ../tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/slim/bundle.nt \
  --zip ../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
```

### 4. Validate the OWL profile and import closure

Set `ROBOT_JAR` to a current [ROBOT](http://robot.obolibrary.org/) release. From `app/`, the manifest-binding gate can run OWL 2 DL and HermiT together:

```bash
ROBOT_JAR=/absolute/path/to/robot.jar npm run roundtrip:mem-fwu:owl:reason
```

It writes `owl-validation-report.{json,md}` with the SHA-256 of ROBOT, manifest, bundle, profile, catalog, bound Core, DL report, and reasoned output. It also fails if any input changes while ROBOT is running.

The underlying profile-only ROBOT invocation, shown from the repository root, is:

```bash
java -Xmx3g -jar "$ROBOT_JAR" merge \
  --catalog tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/slim/catalog-v001.xml \
  --input tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/slim/skillpilot-mem-fwu-profile.ttl \
  --input tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/slim/bundle.nt \
  --collapse-import-closure true \
  validate-profile --profile DL \
  --output tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/slim/robot-dl-report.txt
```

Keeping `merge` and `validate-profile` in one ROBOT invocation avoids a large RDF/XML intermediate file and Java XML entity-size limits for long evidence literals. The npm reasoning gate runs the corresponding HermiT invocation separately so both results are explicit.

Before that independent ontology gate, the semantic report verifies and records the hashes of every RDF segment, `bundle.nt`, profile, catalog, bound Core, manifest, and input ZIP, including Core IRI, commit, and source path. It also proves that these inputs remain unchanged during semantic validation. `owl-validation-report.json` independently records the same OWL inputs and the ROBOT binary around the ROBOT/HermiT run.

### 5. Optional technical carrier roundtrip

```bash
npm run roundtrip:mem-fwu
```

The technical lane stores UTF-8 package files as RDF line carriers. Binary images remain hashed sidecars next to the RDF and are materialized back during reconstruction; they are not coerced through UTF-8 text. Until a generic binary-sidecar vocabulary is added, any other binary package entry fails explicitly instead of being dropped.

The final package-file comparison reads the original package's exact `SHA256SUMS` once and hashes the reconstructed files in bounded argument batches. It no longer launches two `unzip` processes for every file; the independently rerun package validator still checks the hashes against the reconstructed ZIP itself.

## Output

Default base directory:

`tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/`

Important paths:

- `slim/declarations.nt`: self-contained OWL class/property declarations for RDF graph parsers;
- `slim/landscape.nt`: goals, Core process/guiding axes, core-first `contains`, reified prerequisites, program units, placements, and external dependencies;
- `slim/assets.nt`: goal-visualization references and media metadata;
- `slim/assets/goal-visualizations/`: binary image sidecars;
- `slim/sources.nt`: official source documents and reviewed source locators;
- `slim/mappings.nt`: canonical mappings and reviewed decisions;
- `slim/views.nt`: learner-facing composition views;
- `slim/cards.nt`: memorization decks and cards;
- `slim/bundle.nt`: RDF-only concatenation of the semantic `.nt` segments;
- `slim/ontology/lehrplan-core.owl`: bound upstream core module;
- `slim/catalog-v001.xml`: canonical Core-IRI to pinned local file mapping;
- `slim/skillpilot-mem-fwu-profile.ttl`: remaining application vocabulary;
- `slim/manifest.json`: ontology binding, SHA-256 for every RDF segment/bundle plus profile, catalog and Core, sidecars, and semantic counts;
- `slim/robot-dl-report.txt`: ROBOT OWL 2 DL result;
- `slim/robot-hermit-reasoned.owl`: HermiT output when the reasoning gate is requested;
- `slim/owl-validation-report.*`: manifest-bound OWL/ROBOT inputs and hashed DL/reasoning outputs;
- `slim/semantic-reconstructed/goal-visualizations.semantic.json`: reconstructed schema-compatible resource index;
- `slim/semantic-reconstructed/goal-visualizations.diagnostic.json`: RDF reference resources and structural diagnostics;
- `slim/semantic-reconstructed/package-assets/`: independently materialized and destination-verified image sidecars;
- `slim/semantic-reconstructed/semantic-reconstruction-report.*`: semantic and byte-integrity verdict.

## Validation Gates

The semantic reconstruction must pass all existing landscape, mapping, source, view, and card comparisons plus these core/media checks:

- every core prerequisite reference has exactly one incoming `LP_0030071` edge and one outgoing `LP_0030072` edge, known goal endpoints, no self-loop, and no duplicate source/target pair;
- every runtime prerequisite is a direct goal-to-goal `sp:didacticRequires` edge, and the union reconstructs the exact authored `requires` set;
- generic competency and curricular-visualization references have exactly one source and one correctly typed target, without duplicate source/target pairs;
- K1–K6/Kx.y process axes and L1–L5 guiding ideas have the exact expected Core types, resources, BFO hierarchy, curricular source scope, and reconstruction roles;
- current bundles use Core reference resources only for curricular goals and the application visualization lane only for runtime/unscoped goals;
- every canonical goal has exactly its expected Core area, Core atomic, or application/unscoped type; every Core atomic goal has a named `LP_0000349` parent rather than relying on an anonymous OWL filler;
- every goal has exactly one expected `sp:AtomicGoal` or `sp:ClusterGoal` base type;
- direct containment reconstructs the original `contains` sets without duplicates, while additional or inferred BFO parthood cannot introduce false direct children;
- every visualization link has exactly one routed reference, one image target, one position/order, and one indexed sidecar;
- RDF metadata equals the canonical resource link and package resource index;
- `slim/manifest.json` contains exactly the same visualization sidecar records as RDF, including package/ZIP/sidecar paths, size, MIME type, and SHA-256, without duplicate IDs or paths;
- sidecar byte length and SHA-256 equal the RDF and original ZIP values;
- all verified sidecars are materialized into the reconstructed package-assets tree;
- missing, malformed, unsafe, duplicate, or orphaned resources fail the run.

The independent ontology gate merges `skillpilot-mem-fwu-profile.ttl`, `bundle.nt`, and the catalog-resolved core import, then requires the complete import closure to satisfy OWL 2 DL. HermiT consistency reasoning is an additional release gate.

The semantic, technical, package-validation, ROBOT-DL, and optional HermiT outputs jointly form the evidence. Semantic and OWL reports are bound to `slim/manifest.json`; technical and package-validation reports record and stability-check their input/output hashes directly. Those recorded hashes must agree for the artifacts they share. Do not infer validity from timestamps or copy old counts into this document after source changes.

## Remaining SkillPilot Profile

The profile is intentionally limited to concepts not supplied by the FWU core:

- technical package identity and deterministic reconstruction metadata;
- runtime graph-node distinctions and the direct-containment roundtrip anchor;
- one `sp:referenceRole` hint that prevents derived Core-axis projections from becoming authored SkillPilot references;
- program units and goal placements;
- scoped composition views;
- auditable mapping and review records;
- losslessly reconstructed authored source locators and fingerprints;
- memory-card decks and cards;
- practice, assessment, memory, and orientation nodes;
- explicit unscoped-curricular migration nodes where the FWU atomic competency restriction cannot yet be satisfied by a named area;
- runtime-only prerequisite edges where the FWU curricular prerequisite semantics do not fit;
- runtime/unscoped visualization references where the curricular CE-reference semantics do not fit;
- package path, hash, byte length, role, and review status for binary visualizations;
- a quarantined JSON record only when source text cannot be represented safely as an ordinary RDF/OWL literal.

These are not all candidates for the FWU core. Composition views, learning runtime nodes, memorization cards, and binary package mechanics are application concerns. The dedicated prerequisite class and strict curricular parthood now use upstream terms directly.

## Operational Notes

- The mathematics visualization payload is currently much larger than the RDF metadata. Allow several GiB of free disk space for the source ZIP, slim sidecars, reconstructed copies, and transient bulk extraction.
- JPEG and PNG files are stored without recompression in the reproducible subject ZIP.
- RDF segment writers use bounded synchronous buffers and file statistics instead of ignoring stream backpressure or reading finished files back into memory.
- The semantic importer builds one reverse IRI index. Structural checks therefore resolve incoming reference edges in constant time instead of repeatedly scanning the complete graph.
- Image sidecars are batch-extracted per phase instead of spawning one `unzip` process per image; every extracted file is still verified independently before use.
- Generated path lists use code-unit ordering rather than locale-dependent collation.
- The deterministic ZIP writer streams uncompressed entries to disk and hashes the finished file without buffering the full archive. It uses ZIP32 and fails before writing if entry count, file size, offsets, or total archive size exceed supported limits.
- Keep `tmp/` for generated packages and reports; do not commit roundtrip artifacts.

## Upstream Follow-up

When FWU regenerates its release artifacts and shapes with `LP_0000554`, the local binding can move from the source core module to the corresponding released artifact. Until then, the manifest makes the exact source commit and core-module checksum independently reviewable.

The integration stance remains collaborative: SkillPilot uses the FWU core where its semantics fit, retains application vocabulary only for genuine runtime/package concerns, and turns reproducible roundtrip evidence into focused upstream feedback.
