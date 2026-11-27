# Source mapping review, version 2

A review records how a subject addresses each official requirement in a registered edition. The effective key combines the canonical subject landscape, registered source, edition and stable source row ID. The loader produces one decision per row of each edition selected for conversion. The four reporting states are subject carrier, cross-cutting carrier, reviewed deviation and open. Decisions for an edition may come from several files. [Review schema](review.schema.json) · [Edition inventory schema](edition.schema.json)

## Selection and source binding

An edition inventory identifies the current extraction by repository path and SHA-256. It enumerates its complete atomic row set, using the same child-list rule as the current source inventory. A bounded source component can supply additional evidence. The complete inventory comes from the authoritative extraction. The loader verifies the extracted wording, raw row digest, and context inherited from the extraction, ancestor goals and source passages. The verified parent metadata is part of the row digest. It tests carrier contributions against the regular targets supplied independently for each course or module. A review binds the raw row, wording, context, scope and source identity through `sourceRowSha256`. File hashes cover the original bytes, including line endings. For structured hashes, serialize compact JSON as UTF-8. Sort each object's keys lexicographically by UTF-16 code units, preserve array order and string contents, and use ECMAScript `JSON.stringify` string escaping and finite binary64 number formatting. For example, both `1.0` and `1` encode as `1`, and negative zero encodes as `0`. Verifying the extraction does not establish whether a source text is a verbatim quotation from the official publication.

With one candidate for a row, the loader selects it directly. With several candidates, `selectedReviews` must contain one entry pairing the row ID with the intended review path. Repeated row IDs are rejected even if the paths agree. Every row needs an explicit decision, including unfinished work. A stale binding fails validation. A subsequent change to a different row requires the refreshed extraction file hash and preserves the decision digest of an unaffected row. [Shared loader](../../../app/scripts/sourceMappingReview.ts)

The edition explicitly lists the V1 files it supersedes. A historical extraction of that same edition can be bound by path and hash. A pathless V1 mapping with unrelated row IDs remains available. Every overlapping V1 file needs a verifiable edition assignment, including a component or a file without its own extraction path. Retaining it under another edition requires evidence identifying a different original. When a retired row has disappeared from the current extraction, an explicit successor must identify and bind the corresponding current row. The loader refuses a retirement that would erase unrelated rows. This covers both the Schleswig-Holstein successor extractions and the Bavarian case of a bounded component sharing its landscape with a larger historical mapping. [Predecessor selection](../../../app/scripts/sourceMappingPredecessors.ts)

## Recording a decision

| Decision | Evidence |
| --- | --- |
| Carried by a subject goal | Name the performance covered together and each goal's contribution. Each contribution must identify a regular target in its declared scopes. Together they must cover every applicable scope. |
| Carried by a cross-cutting goal | State the assessed performance for this row. Mixed contributions name their main kind, giving the row one reporting state. |
| Declined | Supply the individual reason, category evidence, author and an affirmative independent review bound to the edition and decision. Identical normalized reasons across rows fail. A duplicate or same-edition replacement must resolve to a carried row. |
| Open | Record the outstanding work. The row produces no positive edge. |

Version 1 of the deviation categories distinguishes an obligation of the school or teacher, a duplicate, a replacement within the edition, an impracticable assessment and a deliberate didactic deviation. The last two require the separately bound standing decision and the retained and dropped performances. A human reviewer judges whether the named goals jointly cover the requirement and whether a deviation is justified. The validator checks the recorded decision, identities, bindings, scopes and references. Each row declares its applicable scope IDs. The independently supplied regular-target sets must have exactly these keys. A replacement must cover the original scopes unless a separately evidenced official change of scope is recorded. Authors and reviewers are identified by canonical UUIDs. Normalize reasons using NFKC, Unicode 17.0.0 default full case folding, and NFC, then trim and collapse whitespace. The same person uses the same actor ID across decisions. [Deviation and approval schema](deviation.schema.json)

## Running the export

From the repository root, export the currently available V1 documents and any explicitly configured V2 edges with the following commands.

```sh
npm --prefix app run test:source-mapping-review
npm --silent --prefix app run export:source-mapping-edges > mappings.json
npm --silent --prefix app run export:source-mapping-edges -- --v2-input path/to/manifest.json > mappings-v2.json
```

A conversion manifest has `version: 1` and the arrays `editions` and `reviews`, each containing repository-relative `path` and raw `sha256` references. The CLI verifies the referenced files and rejects an unregistered V2 file in the mapping tree. Its two output arrays are `legacyMappings`, the historical per-file documents with their ordering and metadata, and `positiveEdges`, one edge per contribution of a carried V2 row. The edge identifies the source edition, review, row digest, endpoint, course scopes and contribution. Reviewed deviations and open rows remain accessible in the loader's effective decisions.

The initial parity measurement on `e2df0b5b4c` covered all 21 canonical Gymnasium landscapes. All 497 legacy files matched the existing reader and their parsed repository contents, including 378 review files, 119 direct mappings, 60,655 decision records and 256,806 mapping entries. Zero active editions use V2 in this delivery. For the Gymnasium inventory digest, sort repository-relative paths by UTF-16 code units and hash the concatenation of each UTF-8 path, a zero byte, the 32 raw SHA-256 bytes of the file, and another zero byte. The resulting digest was `5d0e5f531f1c3699ef89287590a826e6ab7cad57164419f4d414fed7543edd08`. The export and parity comparison also include legacy files for other target landscapes when present. The per-subject counts cover the Gymnasium catalog. [Executable parity comparison](../../../app/scripts/testSourceMappingParity.ts)
