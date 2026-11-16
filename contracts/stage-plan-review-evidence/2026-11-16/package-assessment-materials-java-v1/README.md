# Java delivery of required assessment materials

Local implementation and regression evidence for the unpublished common package
contract 1.3. This does not activate a real state plan, publish a package or
establish complete remote CI acceptance.

The loader binds the exact 1.3 manifest profile, catalog and resource-index
versions and the `learningUnitsV1` / `assessmentMaterialsV1` capabilities.
Existing 1.0–1.2 routes remain separate. Required assessment materials retain
their original `/assets/assessment-materials/` URLs and exact package-bound
bytes, owner, media type, artifact path and digest. One public asset can be used
by several tasks without duplicating or rewriting its image.

PNG files must have the PNG signature. SVG validation permits static drawing
elements and inert RDF/DC/CC metadata, rejects active content, escaped
attribute values and external references, and never resolves an XML entity or
DTD. Matplotlib's fixed SVG declaration is removed only from the in-memory
parsing copy. Delivered bytes remain unchanged. Responses include a restrictive
content policy and `nosniff`; the controller is enabled only in package mode.

The original `receipt.actual.json` preserves the first 54-case run. Independent
review subsequently identified escaped presentation-attribute and foreign
namespace gaps; that earlier run is not the final security result.
`hardened-receipt.actual.json` binds the corrected source and the final local
60-case run, with zero failures or skipped cases. It includes the actual
unchanged repository SVG, PNG delivery, disguised content, external references,
metadata/namespace and capability/version negatives, exact-byte delivery and
hash-drift rejection. Compressed JUnit XML and console logs are lossless.

`focused-tests.init.gradle` selects the same five relevant test classes before
Gradle starts workers. An isolated build reuses existing resources by symlink
and excludes resource copying; it does not alter the full CI suite or claim a
fresh complete backend build. Whole-package schema, compiler, independent
validator, browser and provenance checks belong to the separate 1.3 evidence.

The independent review accepted the hardened Java consumer. Its six native
policy cases, broader positive sample of 19 distinct existing SVG files, source
pins and exact review limits are retained under `independent-review/`. That
sample is not the package's SVG inventory. Earlier accepting class bytes and
logs remain separate from the corrected rejection evidence. Class files are
stored losslessly as gzip; `retention.actual.json` binds original and stored
bytes and confirms restoration.
