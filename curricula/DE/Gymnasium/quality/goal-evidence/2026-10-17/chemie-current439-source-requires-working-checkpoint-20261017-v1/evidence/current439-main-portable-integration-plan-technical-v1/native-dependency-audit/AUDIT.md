# Chemistry current439 dependency audit

Read-only technical inventory of the supplied prospective root. No validator, full build, scientific review, source rewrite, or historical reseal was run. Writes are confined to this audit directory.

The supplied prospective config has SHA256 `ab71b7955ddfedca35dba08afcb9b3e6f05e911d8a8d33904d158b94adb9bf6c`. Main HEAD and `refs/heads/main` were `d486510229aa923e9a4de86eb95551de887e4ba0`; comparisons use actual Main worktree bytes as well. Root-owned subsequent physical COW regularization does not invalidate logical byte/size guards. Resolved physical symlink paths in the early inventory are observations, not identity constraints.

## Required native description chain

`native-operational-files.json` inventories 2,496 exact files / 73,864,626 bytes, including all 113 indexes, 804 resolution records, 113 dual summaries, 226 complete rounds and 86 synthesis manifests actually loaded for current or semantically retired entries. Every round has its bundle manifest, input, campaign, batch input, run manifest and records. The two directories per round are guarded by exact filename listings: 452 listings, zero unexpected entries.

Actual Main worktree comparison: 2,185 byte-exact files, 310 absent files, one changed canonical file. All 1,345 checked raw-byte index/resolution/manifest bindings match. All input and Main comparison guards remained unchanged. No source read errors occurred. This byte inventory does not replace the separately running stock central validation.

The inspected rules are recorded in `native-reference-edges.json`:

- `reportDeepUnderstandingRollout.ts:432` resolves configured paths from repoRoot; `:441` resolves index artifacts from the index parent, confined to the repository.
- `:454` resolves a synthesis manifest from `dirname(dirname(resolutionPath))`, confined to that resolution batch root.
- `:1171` loads fixed `round-a` and `round-b` bundle/input/campaign filenames. `validateGoalDescriptionReviewCampaignResults.ts:160` derives exact batch/result filenames from `campaign.batches[*].batchId` and checks complete directory listings.
- `reportDeepUnderstandingRollout.ts:1307` loads every historical group's rounds. `:1354` reads and binds each historical resolution's bytes before `:1396` skips superseded entries. Therefore replacing a current owner does not remove the historical round dependency.
- Bundle artifact path/digest entries, run inputArtifacts, and inline book/material contexts are validated in memory; they do not trigger recursive material file reads in these description validators.

The capsule invocation depends on the Root-provided inherited `NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main'`. A portable regular-file checkout naturally retains the intended logical root. `portable-operational-materialization-map.json` identifies the exact logical destinations and source bytes; `required-new-or-different-main-worktree-files.json` contains the 311 additions/changes against actual Main.

## Whole historical materials and provenance

`pointer-backed-whole-bundle-material-provenance.json` follows actual fixed native `batch-manifest.json` files, their explicit `artifacts.bundleManifestPath`, then the exact artifact array. It inventories 1,641 files / 275,465,954 bytes. All exist, every raw artifact byte digest matches, and all K/Main guards remained unchanged. No directories were copied.

Four historical groups have no sibling batch manifest or bundle. `historical-two-exact-native-copy-origin-bundle-materials.json` resolves two through their preparation sources' exact original-native copy selectors: the original manifest fingerprints equal the copied round manifests and all artifact byte pins match (32 files). The two old b008 `affected20-1` and `affected7-2` groups retain an explicit unresolved original-material location limit. Their operational native chain is complete; no original PDF/image was synthesized or substituted.

Round-local `book-model.json` candidates in the raw provenance scan are not missing required files when an actual batch manifest binds the sibling `bundle/book-model.json`. The pointer-backed whole-bundle maps are authoritative for those material locations.

The corrected absolute-path scan finds 152 provenance occurrences in 13 distinct string values. `external-provenance-path-substrings-and-sidecar-map.json` extracts 184 exact path occurrences into 15 existing original source files, guards their bytes, and proposes content-addressed sidecar destinations. Preserve the original strings and bytes; use a sidecar mapping rather than rewriting or resealing historical files. The broad one-hop candidate scans are evidence indexes, not additional recursive runtime dependencies.

## Current core

`core-inventory.json` combines 1,589 exact current core files / 1,902,851,676 bytes with normalized `logicalPath`, K-logical `absolutePath`, `sha256`, `sizeBytes`, `roles`, actual `mainWorktreeComparison`, source guards and exact reference edges. Actual Main comparison: 1,005 byte-exact, 498 absent and 86 different. There are no conflicting observations and all source/Main hash guards remained unchanged.

It includes C650, SEM650, A76, P123, M439, 80 card review records, 39 visibility scopes, current QA, 463 canonical local image URL references and source image counterparts, 68 authored vocabulary references and applicable source/public deck counterparts. It also includes ordinary Chemistry atlas JSON/inputs/sources, navigation, 48 source views, source-projection receipt, 32 selected mapping paths/extractions, official source documents and bounded retained registry inputs. It excludes the Root-owned final global default-registry guard.

Two concrete technical points remain visible in the core inventory:

1. The actual selected BY extraction document `/sourceDocuments/1/path` is absent from K but present in Main with SHA256 `10cbe247c5cb05ed5a11db607b6ebe0a77f6e242692372443e15e5945a94397a` and 124,345 bytes. Its normalized record supplies the existing Main file as `sourceAbsolutePathForMaterialization`. Retain those exact bytes.
2. Static inspection of `goalBookSourceAtlasInputs.ts:88`–`:95` finds an ambiguous document selector for the 332 selected BY mapping decisions `/decisions/0` through `/decisions/331`: their source goal/passage has no document key/tag while the extraction has two source documents. This is a code/data preflight finding, not a new gate execution or a scientific judgment. It is separate from the already observed central D/P/A/M/V outcome.

`three-memory-public-source-structural-differences.json` records actual JSON differences, without scientific values or normalization: basics `chem_basics_006` front; bonding `chem_bond_004` and `chem_bond_008` backs; organic `chem_org_q1_007` back plus public-only `chem_polymer_chain_conformation`. Preserve both authored source/public versions as independently pinned. All actual vocabulary files exist; the two Arrhenius candidate deck values are direct repository paths and do not imply invented memory-deck mirrors.

The isolated 413 legacy-mapping report is bounded routing evidence. The parent's subsequent existing authoring-ID successor/history addendum owns the identity handling; this audit does not invent or approve a migration.

`artifact-pins.json` pins all final audit artifacts. The parent owns payload selection, source-history retention, any guarded integration and the final stock checks.
