# Gymnasium retained-source boundary (F3)

The [follow-up programme](cqr-gvr-hard-gate-plan-2026-11-12.md#10-follow-up-programme-clean-gymnasium-13-november-2026)
classifies the 45 Bavarian files in `curricula/DE/Gymnasium/input/BY/gymnasium/`
as frozen source material. Their original bytes, IDs, relationships, mappings
and provenance bindings remain intact. Their old root-to-orientation prerequisite
constructs are source history and do not enter the current G17 inventory.

## Measured consumers

The 45 files contain 8,413 goals, between 4 and 893 per file. The source
landscape IDs occur in 47 mapping documents (21 distinct source IDs), four
provenance documents (21 IDs) and four canonical documents (five IDs).
The canonical occurrences are provenance references: no canonical `requires`
or `contains` edge depends on a retained Bavarian goal or landscape ID.

| Consumer | Original behavior | Boundary in this change |
| --- | --- | --- |
| `app/scripts/lib/graphValidationInventory.ts` | Recursively discovered the 45 files as live graphs | Discovers exactly the registered current canonical catalog inside Gymnasium; retained inputs and authoring metadata are excluded. Unexpected live Gymnasium graphs and incomplete/additional canonical inventory fail closed. |
| `app/scripts/validateGraph.ts` | Included source goals in the global validation universe | Keeps sources outside that universe. An explicit source-reference resolver preserves existing references from consumers outside `curricula/DE/Gymnasium/`; canonical consumers cannot use it. |
| Backend `LandscapeService` | Discovered the 45 raw files and also added registered archived/source-extraction landscapes to `getAll`, `getById` and the global goal index | Separates retained source maps from active discovery and lookup. `getRetainedSourceLandscape` reads source evidence explicitly, including a localized source view. Source membership and atomic-closure APIs retain their evidence behavior. |
| Backend legacy closure | Resolved legacy references through the same active/source index | Existing noncanonical roots can traverse explicit retained-source references. Entering any canonical graph disables this fallback, including when the traversal started outside Gymnasium. Active definitions retain precedence when IDs collide. |
| Backend `GoalMappingService`, canonical provenance and applicability | Read mapping files and source/jurisdiction registries independently of runtime landscape discovery | These inputs and APIs remain in use. `CurriculaService` obtains source atomic closure through `resolveSourceAtomicGoalIds`; the source API can derive local atomic descendants from the frozen source when no closure entry exists. |
| `app/scripts/applicabilityCompiler.ts` | Uses the source registry first, with a source-path index as fallback | Continues to read source evidence independently; the live validation inventory is not its source index. |
| Source extraction and authoring tools | Explicitly read frozen Bavarian source JSON | Paths remain unchanged. Consumers include `generateByPhysicsSourceExtraction.ts`, `generateByChemistrySourceExtraction.ts`, `generateByEconomicsSourceExtraction.ts`, the Bavarian Mathematics course-projection audits, Physics adjudication scripts and goal-book source tests. |
| Deck deployment | Canonical deployment uses registered files in `memory-decks/`; legacy deployment uses deck filenames in directories named `json` | Neither deployment enumerates these 45 files as decks or as live graphs. |
| Backend `DeckResourceService` | Indexes deck filename patterns under `json` and `memory-decks` | Does not depend on landscape graph discovery. Its retained deck behavior stays available. |
| Schema checking and repository revision | Validate source JSON syntax and bind repository input bytes | Retained evidence still participates in syntax/provenance integrity and revision binding. This does not make it a live G17 graph. |

The shared source-landscape registry has 302 entries, 298 with an
`archiveSourcePath`; 21 refer to these Bavarian source identities. Some paths
use the historical `DE-BY` spelling, resolved by the existing retained-path
normalization. No registry or frozen proof is rewritten.

## Existing outside references

`curricula/DE/BY/DE_BY_Gymnasium_Overview.json` is outside the current
canonical Gymnasium domain and is not a manifest root. Its 45 `contains`
references point to retained Bavarian subject-root goal IDs. Removing source
lookup without an explicit compatibility route produced exactly 45 missing-ID
errors in `validate:graph`. The source-only resolver preserves those references
without adding the source graphs to validation or the canonical runtime universe.

Twenty-five retained source landscape IDs also occur in other Bavarian school
forms. Separating the source maps preserves the active school-form definition
for ordinary landscape and goal lookup. Explicit source evidence remains
addressable by its source identity. Compatibility traversal likewise keeps the
existing active-owner deduplication; it does not add source-only goals under a
colliding active landscape ID. The other 20 Bavarian source owners have no goal
ID overlap with active definitions. No outside curriculum JSON is changed.

The resulting validator inventory is **548 files: 21 canonical Gymnasium
catalog entries and the same 527 files outside Gymnasium**. The canonical
catalog remains the G17 gate domain. Explicit historical source reads and
noncanonical compatibility closures are separate from that live inventory.

## Regression and verification contract

`testGraphValidationRetirement.ts` checks exact registered-catalog membership,
unchanged discovery behavior for outside input directories, reserved evidence exclusion, rejected extra or
missing canonical files, rejected live Gymnasium graphs outside the catalog,
and source-reference acceptance only outside Gymnasium.

`LandscapeServiceSourceRegistryTest` checks active/source index separation,
source membership and atomic closure, preserved noncanonical closure,
canonical source rejection and active-first collision handling. The backend
directory-scan fixtures retain their existing outside-Gymnasium behavior.
The CLI and CI reject unexpected live graphs in Gymnasium; the backend excludes
those files with a diagnostic while keeping the other graphs and learner reads
available, following the 11 November runtime-readability decision. Repository source-extraction
probes use the explicit retained-source accessor instead of asserting runtime
availability. Existing retired-learner selection, read-only state, projection
and export tests remain required; rewriting source-reader expectations alone
does not establish runtime compatibility.

The reload fingerprint keeps the prior JSON input membership, including retained
inputs, while the loader skips their live parsing. It performs no extra complete
fingerprint scan on reload. At this checkout the fingerprint membership is 8,223
JSON files, including 446 Gymnasium input files. Archived snapshots retain the
existing explicit source-reader behavior.

For a reproducible raw-byte preservation check, sort the 45 graph paths, then
hash each repository-relative UTF-8 path followed by NUL, the raw file bytes,
and NUL with SHA-256. The audit value before and after this change is
`2aa5f3bd5df7608585092294eb0669bc9f818c552b912d3b89f59d7ae6a3ffa5`.
No source graph is normalized and no historical proof is replayed or rebound.

## Local verification

- `npm --prefix app run validate:graph`: 548 landscapes passed.
- `npx tsx --test scripts/testGraphValidationRetirement.ts` in `app/`: 8 tests passed.
- `python3 scripts/validate_bavaria_gymnasium_archive_paths.py`: no violations.
- `python3 scripts/validate_bavaria_gymnasium_legacy_refs.py`: no violations.
- Final focused Gradle verification: **30 tests passed, no failures or skips**:
  16 source/index/closure/reload/readability checks, two directory-scan checks,
  one retained-source localization/release-metadata check and eleven retired
  learner HTTP read/export/selection/session checks. Temporary class and method
  include filters retained the normal JUnit engine, heap and fork settings.

The preceding nine-class backend run completed 356 tests with 355 passes and
one failure in the newly added HTTP assertion: the test read a mastery key
outside its existing response envelope. The assertion was corrected and that
case, including raw learner reads, mastery and signed export for three retired
curriculum identities, passed in the final focused run. The other eight-class
coverage included real mapping/provenance fixtures, canonical landscape
closures, decks, learner services and personalization migration.

Full CI #2342 subsequently exposed six active-frontier assertions that still
used retired Hessen source identities. Their independent reference could also
return an empty set from the same empty live closure. The test now uses a real
isolated live fixture, requires nonempty reference sets and retains complete
frontier comparisons, the 20-goal compaction boundary, transitive demand and
autopilot/read-revision checks. A separate HTTP regression reads the original
historical export fixture without changing its bytes: its 205 mastery values
and personal configuration remain readable, and re-export also retains focus. Live
lookup/closure remain empty and active UI/AI routes remain rejected. These are
test-contract corrections, with no runtime or source-data exception.
The final compiled local regression run passed 92/92 tests with zero failures,
errors or skips: seven frontier invariants, 59 canonical projection cases,
14 automatic-completion cases, two frontier fallback cases and ten historical
or retirement HTTP cases. The original export fixture remains byte-identical.

Backend terminal results are also recorded in the programme progress log together
with integration verification. These local checks do not establish remote CI,
merge or deployment acceptance.
