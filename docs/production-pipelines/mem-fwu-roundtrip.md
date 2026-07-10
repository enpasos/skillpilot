# MEM/FWU Core Roundtrip Pipeline

This pipeline proves that a SkillPilot subject publication package can be transformed into a core-first RDF/OWL bundle based on the FWU Lehrplan-Ontologie and reconstructed semantically without reading the original package as an input source.

The current reference scope is:

`tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip`

## Roundtrip Contract

```text
SkillPilot subject ZIP, including goal-visualization images
  -> FWU-core-first semantic bundle: RDF/OWL + hashed binary sidecars
  -> reconstructed SkillPilot semantic content + copied image sidecars
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
- the presence of `LP_0000554`, `LP_0030071`, and `LP_0030072` in that exact core module;
- a copy and SHA-256 digest of the bound core module in the slim bundle.

The slim profile imports `ontology/lehrplan-core.owl` by a relative IRI, so loading the profile from the bundle directory resolves to the pinned local copy. The manifest records both the canonical ontology IRI and this profile import. The monolithic technical profile keeps the canonical W3ID import because its RDF directory does not carry the slim ontology tree.

This binding is currently necessary because [FWU-DE/lehrplan-ontologie#9](https://github.com/FWU-DE/lehrplan-ontologie/pull/9) added `LP_0000554` to the merged source module while the generated `lp*.ttl/owl` release artifacts in the same upstream checkout have not yet been regenerated with that term. The pipeline fails early if the expected core contract is unavailable instead of silently falling back to an older ontology release.

## Core-First Mapping

| SkillPilot meaning | Primary representation | Application fallback or extension |
| --- | --- | --- |
| Atomic curricular goal | `LP_0000263` CE-Kompetenzspezifikation | `sp:LearningGoal` + `sp:AtomicGoal` preserve the runtime graph-node distinction |
| Curricular cluster | `LP_0000349` CE-Bereich | `sp:LearningGoal` + `sp:ClusterGoal` |
| Strict curricular `contains` | `BFO_0000051` (`hat Teil`) | `sp:containsGoal` additionally preserves the authored direct edge |
| Non-curricular or mixed runtime `contains` | not forced into BFO parthood | `sp:containsGoal` |
| `requires` | reified `LP_0000554` Didaktische Voraussetzung | legacy `sp:didacticRequires` is read only for old bundles |
| Curricular title | `LP_0030056` -> `LP_0000346` -> `LP_0000344` | readable `rdfs:label` remains in parallel |
| Curricular description | `LP_0030051` -> `LP_0030003` -> `LP_0000344` | readable `dcterms:description` remains in parallel |
| Curricular short number | `LP_0030057` -> `LP_0000347` -> `LP_0000344` | `sp:shortKey` preserves the exact runtime field |
| Goal visualization | core `CE-Verweis` pattern to a `schema:ImageObject` / `IAO_0000030` sidecar | reference role/order and package path/hash/length remain explicit SkillPilot packaging metadata |

### Didactic prerequisites

Every SkillPilot prerequisite edge is represented as a first-class reference resource:

```turtle
<goal/current> lp:LP_0030071 <goal/current/didactic-prerequisite/prior> .

<goal/current/didactic-prerequisite/prior>
  a lp:LP_0000554, lp:LP_0030065 ;
  lp:LP_0030072 <goal/prior> .
```

`LP_0030071` is `hat Verweis`; `LP_0030072` is `verweist auf`. A generic `CE-Verweis` is not interpreted as a prerequisite. Only the specialized `LP_0000554` reference carries `requires` semantics.

### Goal containment

The exporter classifies graph nodes before writing containment:

- every authored direct edge uses `sp:containsGoal` as the lossless roundtrip anchor;
- a curricular cluster containing a curricular cluster or atomic curricular goal additionally uses `BFO_0000051`;
- practice, assessment, memory, orientation, program, and other mixed graph edges are not asserted as BFO parthood;
- the old redundant `sp:hasCurricularPart` term is not written;
- the importer reconstructs current bundles from direct `sp:containsGoal` assertions and reads BFO-only assertions only as a legacy fallback.

The direct application assertion is necessary even for strict curricular edges: `BFO_0000051` is transitive in the FWU core. A reasoner may therefore materialize indirect descendants. Those inferred triples are valid BFO semantics but must not become direct SkillPilot children during reconstruction.

Only top-level curricular elements are attached to the landscape as BFO parts. The exporter does not flatten every curricular descendant into a direct landscape child.

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

- safe root-relative paths and matching goal/file IDs;
- JPEG/PNG extension, MIME type, and magic bytes;
- exact agreement between canonical link, resource index, ZIP entry, and package manifest;
- byte length and SHA-256;
- absence of missing and orphaned image entries;
- explicit image-license category and preserved per-link license note.

The category `goal-visualization-ai-generated-curated` records provenance and curation status. It is deliberately not treated as an SPDX identifier or an automatic CC BY grant.

## Image Representation in RDF

Images reuse the core `CE-Verweis` pattern rather than adding a direct goal-to-image property:

```turtle
<goal/G> lp:LP_0030071 <goal/G/goal-visualization/0> .

<goal/G/goal-visualization/0>
  a sp:GoalVisualizationReference, lp:LP_0030065 ;
  lp:LP_0030072 <package/asset/...> ;
  sp:order 0 ;
  sp:role "primary" .

<package/asset/...>
  a <http://purl.obolibrary.org/obo/IAO_0000030>, schema:ImageObject ;
  schema:contentUrl "/assets/goal-visualizations/..." ;
  schema:encodingFormat "image/jpeg" ;
  schema:accessibilitySummary "..."@de ;
  sp:zipPath "<archive-root>/assets/goal-visualizations/..." ;
  sp:sha256 "..." ;
  sp:byteLength 12345 .
```

`assets.nt` contains these references and media metadata. The corresponding image files live under `slim/assets/goal-visualizations/...`.

Binary image data is never Base64-encoded into `bundle.nt`. The slim manifest records every sidecar path, size, and SHA-256.

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

### 4. Optional technical carrier roundtrip

```bash
npm run roundtrip:mem-fwu
```

The technical lane stores UTF-8 package files as RDF line carriers. Binary images remain hashed sidecars next to the RDF and are copied back during reconstruction; they are not coerced through UTF-8 text. Until a generic binary-sidecar vocabulary is added, any other binary package entry fails explicitly instead of being dropped.

## Output

Default base directory:

`tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0/`

Important paths:

- `slim/landscape.nt`: goals, core-first `contains`, reified prerequisites, program units, placements, and external dependencies;
- `slim/assets.nt`: goal-visualization references and media metadata;
- `slim/assets/goal-visualizations/`: binary image sidecars;
- `slim/sources.nt`: official source documents and exact source spans;
- `slim/mappings.nt`: canonical mappings and reviewed decisions;
- `slim/views.nt`: learner-facing composition views;
- `slim/cards.nt`: memorization decks and cards;
- `slim/bundle.nt`: RDF-only concatenation of the semantic `.nt` segments;
- `slim/ontology/lehrplan-core.owl`: bound upstream core module;
- `slim/skillpilot-mem-fwu-profile.ttl`: remaining application vocabulary;
- `slim/manifest.json`: ontology binding, RDF files, sidecars, hashes, and semantic counts;
- `slim/semantic-reconstructed/goal-visualizations.semantic.json`: reconstructed schema-compatible resource index;
- `slim/semantic-reconstructed/goal-visualizations.diagnostic.json`: RDF reference resources and structural diagnostics;
- `slim/semantic-reconstructed/package-assets/`: verified copied image sidecars;
- `slim/semantic-reconstructed/semantic-reconstruction-report.*`: semantic and byte-integrity verdict.

## Validation Gates

The semantic reconstruction must pass all existing landscape, mapping, source, view, and card comparisons plus these core/media checks:

- every `requires` edge is reconstructed from exactly the intended specialized prerequisite reference;
- direct containment reconstructs the original `contains` sets without duplicates, while additional or inferred BFO parthood cannot introduce false direct children;
- every visualization link has one `sp:GoalVisualizationReference`, one image target, and one indexed sidecar;
- RDF metadata equals the canonical resource link and package resource index;
- sidecar byte length and SHA-256 equal the RDF and original ZIP values;
- all verified sidecars are copied into the reconstructed package-assets tree;
- missing, malformed, unsafe, duplicate, or orphaned resources fail the run.

The generated reports are the authoritative result. Do not copy old counts into this document after the source package changes.

## Remaining SkillPilot Profile

The profile is intentionally limited to concepts not supplied by the FWU core:

- technical package identity and deterministic reconstruction metadata;
- runtime graph-node distinctions and the direct-containment roundtrip anchor;
- program units and goal placements;
- scoped composition views;
- auditable mapping and review records;
- exact source spans and fingerprints;
- memory-card decks and cards;
- practice, assessment, memory, and orientation nodes;
- visualization-reference specialization plus package path, hash, byte length, role, order, and review status.

These are not all candidates for the FWU core. Composition views, learning runtime nodes, memorization cards, and binary package mechanics are application concerns. The dedicated prerequisite class and strict curricular parthood now use upstream terms directly.

## Operational Notes

- The mathematics visualization payload is currently much larger than the RDF metadata. Allow several GiB of free disk space for the source ZIP, slim sidecars, and reconstructed copies.
- JPEG and PNG files are stored without recompression in the reproducible subject ZIP.
- The deterministic ZIP writer streams uncompressed entries to disk and hashes the finished file without buffering the full archive. It uses ZIP32 and fails before writing if entry count, file size, offsets, or total archive size exceed supported limits.
- Keep `tmp/` for generated packages and reports; do not commit roundtrip artifacts.

## Upstream Follow-up

When FWU regenerates its release artifacts and shapes with `LP_0000554`, the local binding can move from the source core module to the corresponding released artifact. Until then, the manifest makes the exact source commit and core-module checksum independently reviewable.

The integration stance remains collaborative: SkillPilot uses the FWU core where its semantics fit, retains application vocabulary only for genuine runtime/package concerns, and turns reproducible roundtrip evidence into focused upstream feedback.
