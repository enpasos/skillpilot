# Learning-unit package extension (runtime contract 1.2)

This directory defines the `learningUnitsV1` capability. A learning-unit
package uses runtime contract `1.2`, release profile
`full-standalone-learning-units-v1` and, for the ontology variant, FWU profile
`fwu-owl-learning-units-v1`. Packages without this capability keep runtime
`1.0` / `full-standalone-v1`. The published V1 and V1.1 schema, profile,
registry and ontology files remain byte-identical; this version is added beside
them, exactly as 1.1 was added beside 1.0.

## Relation to 1.0 and 1.1

Runtime 1.2 is runtime 1.0 plus learning units. It is **not** a superset of
runtime 1.1: a 1.2 package carries no `assessmentCompletionV1` artifacts
(completion profiles, scopes, waiver rules or their reviews), and the 1.2
release profile has no completion roles. The reasons:

- The runtime selects exactly one contract per package. The manifest names one
  `releaseProfile`; the catalog's `runtimeContractVersion` fixes the catalog
  schema and the exact capability set, and the Java loader rejects a
  completion capability outside runtime 1.1 and a learning-unit capability
  outside runtime 1.2. There is no negotiation of optional capabilities, so a
  1.2 that contained 1.1 would force every learning-unit package to carry the
  superseded completion artifacts (the 1.1 profile requires at least one of
  each role).
- The 1.1 waiver semantics were superseded by the concept revision of
  4 November 2026; learning units are their successor. Carrying both in one
  contract would extend the life of the superseded semantics.
- The 1.1 pilot keeps working: the backend runs it in repository mode (the
  default `skillpilot.curriculum.source=repository`) from
  `curricula/DE/Gymnasium/completion-profiles/`, and a package-mode consumer of
  the pilot keeps using a 1.1 package. Switching the runtime is a later change.

The version numbers order the contracts in time. 1.1 and 1.2 are siblings
derived from 1.0.

## Landscape format

A learning unit lives in the existing placement layer of a canonical landscape:

- `programUnits[]` with `kind: "learningUnit"` carries exactly `id` (lowercase
  slug), `kind`, `label`, `labelEn`, `promise`, `promiseEn`, `revision`
  (`YYYY-MM-DD-vN`) and optionally `parentUnitId` (another learning unit of the
  same landscape), `order` and `coverageReviews`. `shortLabel` is not used;
  learning-unit fields on another kind are rejected.
- `goalPlacements[]` with `relation: "own"` assigns one atomic goal of the same
  landscape to one learning unit. `own` is only valid towards a learning unit,
  a learning unit takes no other relation, and an `own` placement carries
  exactly `goalId`, `unitId` and `relation` (no `context`, no other field).
- `coverageReviews[]` on the learning unit holds the reviewed coverage of its
  own assessments (rule R2), at most one entry per assessment, each with exactly
  `assessmentGoalId`, `goalIds`, `reference` (repository-relative review
  record), `taskRevision` and `rubricRevision`. The revisions use the binding
  convention of `contracts/assessment-completion/v1`: the canonical hash of
  `{taskContent, solutionContent}` and of `scoring`. Goal objects carry no
  learning-unit field, so they stay byte-identical when a review is added or
  refreshed; semantic-kind fingerprints and the 1.1 pilot's review bindings,
  which hash goal objects, are unaffected.
- `learningUnitCoverage` (`partial` or `complete`) is optional; absent means no
  claim. `complete` asserts that every atomic goal of the landscape is owned.

Three points an author must know:

- **`revision` names one state of the unit's contract.** A change of the unit's
  own goals, its parent, its promise or its coverage reviews is a new revision.
  No validator enforces this yet; it becomes a hard rule together with the
  runtime binding of results to a contract revision (rule R5).
- **`reference` is a repository path in a source landscape and a package path
  in a package.** The build rewrites it to the shipped review record (see "1.2
  builds"); nothing else in the review changes.
- **`coverageReviews` is an ordered list like `goalPlacements`.** In the FWU
  carrier a review record is identified by its position in the list, so keep
  the order stable; append new reviews at the end.

Calendar-style units (`program`, `stage`, `year`, `phase`, `semester`,
`module`, `track`, `exam`) and relations (`primary`, `secondary`, `assessed`)
keep their meaning.

## Files

Reused unchanged from 1.0: the manifest schema, the 22 normative schemas and
the five semantic contracts except the field registry, the shapes, the Core
catalog and all fixtures. Every 1.2 file that repeats a published contract is
generated from the byte-identical published file plus an explicit list of
additions by `scripts/generate_curriculum_package_learning_unit_contracts.py`;
`--check` proves the committed files equal that derivation.

| File | Content |
| --- | --- |
| `compiled-landscape.schema.json` | The 1.0 landscape schema plus exactly the additions above, closed. Kind- and relation-specific rules are `if`/`then`/`else` branches, so a learning unit without promise or revision, an `own` placement with `context`, or a learning-unit field on another kind fails. |
| `runtime-catalog.schema.json` | Catalog 1.2: references the unchanged 1.0 catalog properties, requires `learningUnitsV1`, and adds `learningUnitReviews` (exact discovery of every coverage-review artifact; may be empty). |
| `learning-unit-coverage-review.schema.json` | Closed wrapper of one package-local review record: unchanged text plus its SHA-256. |
| `release-model-build-profile.schema.json` | The 1.0 build profile plus the required `learningUnits` section. `expectedCounts.programUnits`/`goalPlacements` keep counting the 1.0 placement layer; `learningUnits.expectedCounts` counts units, own placements and coverage reviews. |
| `package-redistribution-review.schema.json` | The 1.0 ledger schema with the 1.2 profile identities. |
| `profiles/full-standalone-learning-units-v1.profile.json` | JSON release profile: the 22 V1 schemas plus the three 1.2 schemas (25), catalog and landscape roles bound to the 1.2 schemas, and the optional, runtime-required role `learning-unit-coverage-review`. |
| `profiles/skillpilot-fwu-field-semantics-learning-units-v1.registry.json` | The 456 unchanged V1 entries plus 19 entries (475). Each coverage review is a positioned record of its unit with registered fields, like `goalPlacements`. |
| `profiles/de-gymnasium-mathematik-learning-units-release-model-v1.profile.json` | Mathematics build profile for runtime 1.2. Its unit counts are derived from the canonical file (currently the pilot unit with two own placements and one coverage review). |
| `profiles/fwu-owl-learning-units-v1.profile.json`, `fwu-owl-package-*.schema.json`, `ontology/skillpilot-fwu-profile-learning-units-1.2.0.ttl` | FWU-OWL carrier, derived from the 1.0 carrier as 1.1 did. |
| `fixtures/learning-units/cases.json` | Shared conformance cases (owned by the learning-unit validator; not generated). |

## Builds of earlier contracts

A build with a 1.0 or 1.1 profile of a landscape that contains learning units
succeeds and projects the learning-unit layer out completely before any other
processing: no `learningUnit` program unit (and with it no
coverage review), no `own` placement, no `learningUnitCoverage`, and no list
that existed only for learning units. Goal objects are never touched. An older consumer therefore never sees half a contract; the
1.0/1.1 output is byte-identical to the build of the same landscape without its
learning units. A calendar unit below a learning unit cannot be projected and
fails the build. The 1.1 completion review is checked against that projection.

Two more consumers use the same projection (TypeScript mirror:
`app/scripts/learningUnitLayerProjection.ts`, held equal to the Python
projection by shared reference fingerprints):

- The legacy subject export (`export:subject-package`) and its MEM/FWU
  roundtrip predate learning units and ship the landscape without the layer.
- Evidence about goals, edges and assessments, such as the
  prerequisite-reduction proofs and the input pin of the Mathematics duration
  layout, fingerprints the landscape without the layer. Adding or changing a
  unit never stales it; any other change still does.

## 1.2 builds

The release compiler and the independent release-model validator validate
every learning unit before anything is written; any finding fails the build.
Each coverage-review binding is verified against the exported task, solution
and rubric. The repository review record (Markdown or JSON below
`curricula/`) is shipped unchanged as
`data/learning-units/reviews/<sha256(reference)[0:16]>.json` with its SHA-256,
the reference is rewritten to that package path, and
`metadata/build-inputs.json` records source path and source SHA-256. Review
artifacts are not part of the dependency closure, like the 1.1 completion
artifacts.

A 1.2 ZIP needs its own redistribution ledger. A redistribution review has to
see everything that ships, including unit texts and review records, so it
binds the digest of the compiled 1.2 model and cannot share the 1.0 ledger.

The committed, CI-checked ledger is always the one of the contract under which
packages are released (Product Owner decision of 12 November 2026). Today that
is 1.0: `scripts/run_curriculum_release_model_conformance.sh` checks
`de-gymnasium-mathematik-v1.review.json` against the freshly compiled model.
The 1.2 ledger is committed, and takes over that check, when the runtime
switches to contract 1.2. Until then a 1.2 build generates it for its compiled
model:

```bash
python3 -B scripts/generate_curriculum_package_redistribution_review.py --generate --learning-unit-candidate
```

A committed copy that no CI step checks would go stale with the next change
to canonical Mathematics, and checking two ledgers would double that upkeep
for a package nobody consumes yet. Until the switch, remote CI does not
compile a real 1.2 model; `scripts/test_learning_unit_release_model.py` covers
it locally in `./run_ci.sh package`.

## Validity rules

`scripts/curriculum_learning_units.py` implements the rules once for the
compiler, the release-model validator and the finished-package validator. The
package validator reports them in its `hardReferenceClosure` gate as
`LEARNING_UNIT_<rule>` and fails closed:

- declaration closed (`UNIT`), unique program-unit IDs (`UNIT_ID`), ownership
  only towards learning units, with exactly `goalId`, `unitId` and `relation`
  and declared once (`PLACEMENT`);
- parents are learning units of the same landscape (`CHILD`), the hierarchy is
  acyclic (`HIERARCHY`), the total scope is non-empty (`EMPTY_SCOPE`);
- own goals are atomic goals of the landscape (`REF`, `ATOMIC`) with one goal
  kind (`KIND`), at most one owner per goal (`R4_MULTIPLE`), and every atomic
  goal is owned when `learningUnitCoverage` is `complete` (`R4_UNOWNED`);
- every own ordinary goal lies on a prerequisite path from an own assessment;
  a path that reaches it only from an own memory goal does not count (`R1`);
- every `coveredGoalIds` entry of an own assessment is an atomic goal that the
  assessment requires (`R3`);
- every coverage review is well formed, names an own assessment of its unit
  (once per unit), names own ordinary goals of that unit that the assessment
  requires and lists in `coveredGoalIds`, has current task and rubric
  bindings, and resolves to a package review record; no review record is
  unreferenced (`R2_EVIDENCE`).

Prerequisite paths use the normative relation (requirements inherited along
`contains`, expanded to atoms, closed transitively); they may leave the unit
and the landscape. Goal kinds follow `CompletionProfileCompiler.isAssessment`,
`isMemory` and `isOrientation`. A package of runtime 1.0 or 1.1 that carries
any learning-unit field or review record is rejected.

## FWU-OWL carrier

The registry registers every new field: the unit fields and the coverage claim
as typed literals, and each coverage review as a positioned record of its unit
(`<unit>/coverage-review/<index>`) with typed fields and a positioned goal list.
In addition, the forward compiler asserts real relationships: `sp:LearningUnit`
membership, `sp:hasParentLearningUnit` (and the existing Core `lp:hasUnit`
hierarchy), `sp:ownsGoal` from unit to goal, `sp:hasCoverageReview` from unit to
its `sp:LearningUnitCoverageReview` records with `sp:coverageReviewedAssessment`,
`sp:coverageReviewedGoal` and `sp:hasCoverageReviewRecord`, and
`sp:LearningUnitCoverageReviewRecord` with its content hash. The reverse
compiler requires the asserted graph to equal the graph implied by the
reconstructed JSON (nothing missing, nothing additional); the literal alone
cannot satisfy these checks.

## Runtime

The Java loader accepts a 1.2 package, requires the capability exactly for
runtime 1.2, verifies every review record and its discovery, and retains the
verified record bytes. The landscape model round-trips every learning-unit
field. No recognition or completion is derived from learning units yet.

## Validation

```bash
python3 -B scripts/generate_curriculum_package_learning_unit_contracts.py --check
python3 -B scripts/validate_curriculum_package_contracts.py --contracts-dir contracts/curriculum-package/v1.2
python3 -B scripts/test_learning_unit_package.py
python3 -B scripts/validate_full_standalone_curriculum_package.py --self-test --contracts-dir contracts/curriculum-package/v1.2
npm --prefix app run test:fwu-owl-package-builder
python3 -B scripts/test_learning_unit_release_model.py   # real Mathematics model; about 20 minutes
```

Install a validated 1.2 ZIP into a private test store by selecting this
software-pinned contract version explicitly:

```bash
python3 scripts/provision_curriculum_package.py install --store tmp/learning-unit-package-store --zip path/to/package.json.zip --contracts-dir contracts/curriculum-package/v1.2
```

A successful build or round trip proves technical package consistency. It does
not publish a package, approve redistribution, review a learning unit or
establish human acceptance.
