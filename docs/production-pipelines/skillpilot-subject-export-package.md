# SkillPilot Subject Export Package

This pipeline builds a reproducible release ZIP artifact for one SkillPilot subject landscape.

Supported `DE/Gymnasium` presets currently cover the M5-or-better subjects: `Biologie`, `Chemie`, `Deutsch`, `Geschichte`, `Informatik`, `Latein`, `Mathematik`, `Physik`, `Politik und Wirtschaft`, and `Wirtschaftswissenschaften`.

The artifact is intended as the first handoff format for later MEM/FWU roundtrip experiments:

```text
SkillPilot data package -> ontology/RDF transformation -> reconstructed SkillPilot package
```

## Build

From the repository root:

```bash
cd app
npm run export:subject-package -- --subject Mathematik --version 0.1.0
```

The ZIP is written to `tmp/exports/` with the school-context prefix, for example `skillpilot-de-gymnasium-mathematik-v0.1.0.zip`. The builder also writes a sibling `*-release-report.md` with the ZIP checksum, coverage counts, and export-time validation checks. `tmp/` is intentionally not committed; both files are build artifacts.

To rebuild every subject that is currently rated `M5` or `M6` in `docs/qa-ci/status/curriculum-quality-status.json`, use the batch command:

```bash
cd app
npm run export:m5-subject-packages -- --version 0.1.0
```

The batch command delegates each package to `export:subject-package`, verifies every ZIP with `unzip -tq`, recalculates each ZIP checksum, checks the sibling release-report verdict, and writes:

- `tmp/exports/m5-subject-export-summary.json`
- `tmp/exports/m5-subject-export-summary.md`

To validate finished ZIP artifacts independently from the builder, run:

```bash
cd app
npm run export:subject-packages:validate -- --dir tmp/exports
```

The validator treats the ZIPs as external handoff artifacts. It verifies archive integrity, package checksums, manifest file records, required layout, embedded export checks, canonical graph references, composition-view references, packaged card references, memory-card review audit references where configured, state-mapping lanes, source-index HTTP(S) links, source-goal reference resolution for review mappings, Windows-safe paths, and the absence of repository-local paths. It writes:

- `tmp/exports/validation/subject-export-package-validation-report.json`
- `tmp/exports/validation/subject-export-package-validation-report.md`

Before publication, run the live source-link audit against the finished ZIPs:

```bash
cd app
npm run export:subject-packages:audit-links -- --dir tmp/exports
```

This extracts `data/sources/source-index.json` and `data/sources/source-goal-references.json` from each package and performs live `HEAD`/fallback-`GET` reachability checks for the official source URLs. The audit uses browser-like request headers to reduce false negatives from public-sector bot protection, but it is intentionally not a hard CI gate by default because external ministry and publisher servers can still temporarily block automated requests or change behaviour without a package change. For a strict pre-release check, add `--fail-on-broken`. The command writes:

- `tmp/exports/link-audit/subject-export-source-link-audit.json`
- `tmp/exports/link-audit/subject-export-source-link-audit.md`

## Source References

The release package carries the evidence bridge needed to resolve mapping source IDs:

```text
data/mappings/*.review.json legacyGoalId/reviewDecisionId
  -> data/sources/source-goal-references.json sourceGoalId
  -> sourceText/sourceSpan/sourceRef/sourcePage/sourceDocumentUrl
```

`data/sources/source-index.json` lists the official source documents and URLs. `data/sources/source-goal-references.json` resolves each review mapping source ID to the corresponding source-goal text anchor, source locator, source text hash, and official document URL. The validator fails when a review mapping source ID cannot be resolved through this reference index.

Official curriculum documents are referenced by URL. Repository-local source paths and learner state are outside the release artifact.

Each ZIP also contains `metadata/provenance-report.md`. This is the reviewer-facing summary of the same source-trace contract: review mapping IDs resolve through `data/sources/source-goal-references.json`, and the report records the package-local counts for source-goal references, review mapping source references, unresolved references, URL issues, text issues, and memory-card review audits.

## Memory-Card Review Audit

For subjects with a configured memory-card review, the ZIP carries the package-local audit bundle under `metadata/quality/memory-card-review/`:

- `*.md`: readable report for reviewer handoff.
- `*.config.json`: package-local pointers to the canonical landscape, report, and ledgers.
- `*.review.jsonl`: semantic decision ledger for ordinary atomic goals.
- `*.cards.review.jsonl`: semantic decision ledger for active and removed primary cards.

The package copy uses only archive-local paths such as `data/canonical/...` and `metadata/quality/...`; repository-local paths are excluded. For Mathematik, Physik, and Chemie this audit is the `CQR-302` evidence chain behind the dashboard status: every ordinary atomic goal is classified as `no_memory_needed`, `memory_required`, or `needs_developer_review`, and every primary card is classified as `kept`, `remove`, or `needs_developer_review`.

For reviewer handoff, use the trace helper on any finished ZIP:

```bash
cd app
npm run export:subject-package:trace-source -- \
  --zip ../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip \
  --source-goal-id he-math-sekii-e-1-b01-a01-376ffbbc
```

The command prints the mapping file, canonical target, source text, source span, source locator, official document title, official URL, and source text hash. It can also run from a canonical goal:

```bash
cd app
npm run export:subject-package:trace-source -- \
  --zip ../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip \
  --canonical-goal-id 502ecaa7-cca6-5c51-a1cc-da09a7b2382c
```

## CI Release Gate

The GitHub Actions workflow `.github/workflows/subject_export_release_gate.yml` runs the publication gate for export-relevant changes and can also be started manually. It performs the same handoff checks as the local release pipeline:

```bash
cd app
npm run export:subject-release-gate -- --version 0.1.0
```

In CI the same command is run with `--enforce-committed-quality-status --enforce-clean-source-tree`. That makes the gate fail if the regenerated curriculum quality status or configured memory-card review reports differ from the committed files, if a configured memory-card review ledger fails `quality:memory-card-review:check`, or if the release package would be built from a dirty source tree.

For a publication candidate, include the live source-link audit in the release gate:

```bash
cd app
npm run export:subject-release-gate -- \
  --version 0.1.0 \
  --strict-source-links
```

`--strict-source-links` implies `--audit-source-links` and fails the gate if an official source URL in the exported `data/sources/source-index.json` records is not reachable. Use `--audit-source-links` without `--strict-source-links` when the audit should be recorded but external server failures should not block the build. The GitHub workflow exposes the same checks as manual `workflow_dispatch` inputs; push and pull-request runs keep the live link audit disabled by default.

The local command writes:

- `tmp/exports/release-gate/subject-export-release-gate-report.json`
- `tmp/exports/release-gate/subject-export-release-gate-report.md`
- `tmp/exports/publication/subject-export-publication-index.json`
- `tmp/exports/publication/subject-export-publication-index.md`

The publication index is the compact handoff inventory for a release candidate. It lists every subject ZIP, release report, validation report, reproducibility report, optional source-link audit report, byte size, SHA-256 checksum, and pass/fail check that should be reviewed before publishing.

The workflow uploads only reports and release notes as artifacts, not the generated ZIP files. The ZIPs remain reproducible build outputs under `tmp/exports/`.

For an explicit reproducibility proof, run two fixed-timestamp batch builds and compare the resulting ZIP checksums:

```bash
cd app
npm run export:m5-subject-packages:check-reproducible -- --version 0.1.0
```

This writes:

- `tmp/exports/reproducibility/m5-export-reproducibility-report.json`
- `tmp/exports/reproducibility/m5-export-reproducibility-report.md`

For byte-stable rebuilds across machines, pin the timestamp:

```bash
cd app
SOURCE_DATE_EPOCH=1767225600 npm run export:subject-package -- --subject Mathematik --version 0.1.0
```

Without `SOURCE_DATE_EPOCH`, the ZIP entry timestamp is derived from the current Git commit date. The script writes ZIP entries in sorted order, uses fixed file mode `0644`, and stores files without compression to keep output deterministic.

## Package Contents

Each package extracts into a single root directory such as:

```text
skillpilot-de-gymnasium-mathematik-v0.1.0/
```

Important paths:

- `README.md`: package-level overview and reproduction command.
- `LEGAL.md`: publication and provenance notes.
- `data/canonical/`: canonical landscape JSON.
- `data/views/`: learner-facing composition views.
- `data/mappings/`: state-to-canonical mapping and review files.
- `data/cards/`: card decks referenced by SRS/memorization goals, plus `card-index.json`.
- `data/dependencies/external-goal-references.json`: declared cross-subject goal references outside this subject package.
- `data/sources/source-index.json`: index for referenced official sources, including official HTTP(S) source URLs.
- `data/sources/source-goal-references.json`: source-goal reference index for review mapping IDs, source text anchors, source locators, source text hashes, and official document URLs.
- `licenses/APACHE-2.0.txt`: SkillPilot repository license text.
- `schemas/`: JSON schemas for the exported structures.
- `metadata/quality/memory-card-review/`: package-local memory-card review reports and JSONL decision ledgers where configured.
- `metadata/manifest.json`: package metadata, source commit, coverage, checksums, file categories, and license categories.
- `metadata/validation-report.json`: export-time checks and counts.
- `metadata/provenance-report.md`: readable source-trace contract and package-local provenance counts for reviewers.
- `metadata/SHA256SUMS`: SHA-256 checksums for integrity checks.

The archive uses short package paths so that Windows Explorer can extract it without hitting the legacy `MAX_PATH` limit. Repository-local paths are not written into the package.

The sibling release report is not part of the ZIP. It is the publication-facing handoff note for the exact artifact in `tmp/exports/`, so it can be attached next to the ZIP without changing the ZIP checksum.

## License Handling

Handling stays file-based and automatic:

- `LICENSE.md` explains the package-level license split.
- `NOTICE.md` gives attribution and source-provenance context.
- `metadata/manifest.json` includes one `licenseCategory` per file.

Current categories:

- `skillpilot-software-apache-2.0`: SkillPilot software/tooling or software-facing schemas.
- `skillpilot-data-cc-by-4.0`: SkillPilot-authored curriculum graph, views, mappings, dependency declarations, cards, and memory-card review decisions.
- `official-source-provenance-only`: source references, source index records, and source-goal reference material attributable to the original official publishers.
- `generated-package-metadata`: generated manifest, checksums, package README, license, notice, and legal notes.

There is only one release package. It writes official source document references to `data/sources/source-index.json` and mapping-level source-goal references to `data/sources/source-goal-references.json`. Review mappings and canonical data keep mapping decisions and graph structure; repository-local paths and generated rationales are excluded from the package copy.

The export build fails if a referenced source extraction cannot provide structured original-source metadata with an official HTTP(S) `url`. The package may include source landing pages as additional metadata, but the `url` field is the mandatory reproducibility anchor.

For each preset the selected data includes:

- the canonical Gymnasium subject landscape,
- all subject composition views,
- subject state-to-canonical mapping and review files for the 16 German states,
- the card decks referenced by memorization/SRS goals,
- memory-card review audit data where configured,
- source index records and source-goal references for review mapping IDs,
- explicit cross-subject dependency declarations when a subject graph references goals outside the package.

Official curriculum documents are referenced by URL. Learner state is outside the subject release package.

## Reuse for Other Subjects

The script is subject-oriented rather than hard-coded to a single file. Mapping files are selected primarily by matching their `targetLandscapeId` to the selected canonical landscape, with filename tokens retained as fallback. A new subject export needs:

- one canonical landscape under `curricula/DE/Gymnasium/canonical/`,
- subject composition views under `curricula/DE/Gymnasium/composition-views/<subject-dir>/`,
- mapping files under `curricula/DE/Gymnasium/mapping/<DE-state>/...`,
- stable filename tokens via repeated `--mapping-token` arguments if the default slug is not enough.

For supported presets, the subject name is enough:

```bash
cd app
npm run export:subject-package -- --subject Physik --version 0.1.0
```

For a new subject without a preset, pass the missing selectors explicitly:

```bash
cd app
npm run export:subject-package -- \
  --subject Physik \
  --subject-slug physik \
  --composition-dir physik \
  --mapping-token physics \
  --mapping-token physik \
  --version 0.1.0
```

If a subject intentionally does not yet cover all 16 state mapping lanes, pass `--allow-missing-states`. Publication packages should normally omit that flag.
