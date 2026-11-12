# Learning-unit catalog contract (draft v1)

**Status: draft.** No runtime consumes this contract yet. It moves out of
`contracts/drafts/` when implicit recognition is implemented in the backend;
until then the format may still change.

A learning-unit catalog states which atomic goals of one canonical subject
landscape each learning unit owns directly and which child units it requires.
It is static curriculum authoring. It never stores a learner's mastery, a
passed attempt, a waiver or a unit completion. The concept is defined in the
Graph Definition, §11 (learning units) and §13 (implicit mastery and the unit
validity rules R1–R5).

## Files

- `catalog.schema.json`: the closed JSON schema of a catalog.
- `fixtures/cases.json`: synthetic conformance cases for the validator. None of
  them represents a reviewed production unit.

Authored catalogs live in `curricula/DE/Gymnasium/learning-units/`, one file per
canonical landscape.

## What a catalog contains

| Field | Meaning |
| --- | --- |
| `landscapeId` | The canonical landscape whose atomic goals the units own. One catalog per landscape. |
| `completeness` | `partial`: goals without an owning unit are reported. `complete`: every atomic goal of the landscape must have exactly one owning unit. |
| `units[].promise` | What learners can do independently afterwards and why it matters, in German and English. |
| `units[].ownGoalIds` | Stable canonical IDs of the directly owned atomic goals: ordinary, orientation, assessment and memory goals. Empty for a pure aggregate. |
| `units[].childUnitIds` | Required child units of the same catalog. |
| `units[].coverageReviews` | Reviewed evidence for rule R2, per own assessment and goal, bound to the reviewed task, solution and rubric. |

A catalog copies no goal data. Goal kinds, prerequisites and the coverage claim
of an assessment (`examData.coveredGoalIds`) are read from the canonical
landscape. The schema has no field for whole-unit prerequisites, access locks
or lists of waived goals; those are not part of the unit definition.

## What the validator enforces

`npm --prefix app run validate:learning-units` checks every authored catalog
against the canonical graph and fails on any finding:

| Code | Rule |
| --- | --- |
| `LU-R1` | R1: every own ordinary goal lies on a prerequisite path from an own assessment of the unit. A path that starts only at an own memory goal does not count. |
| `LU-R3` | R3: every `coveredGoalIds` entry of an own assessment is an atomic goal that the assessment requires directly or transitively. |
| `LU-R4-MULTIPLE` | R4: no goal is owned by two units. |
| `LU-R4-UNOWNED` | R4: in a `complete` catalog every atomic goal of the landscape has an owner. |
| `LU-R2-EVIDENCE` | A claimed coverage review is unfounded or stale (see below). |
| `LU-REF`, `LU-ATOMIC`, `LU-KIND` | An own goal is an atomic goal of the catalog landscape with exactly one goal kind. |
| `LU-EMPTY-SCOPE` | The total scope of a unit, its own goals plus those of its required children, is not empty. |
| `LU-CHILD`, `LU-HIERARCHY` | Child references resolve within the catalog and the unit hierarchy is acyclic. |
| `LU-GRAPH` | Every reference on the prerequisite paths from the own goals resolves, and no own goal requires itself transitively. Acyclicity of the whole graph remains the job of `validate:graph`. |
| `LU-CATALOG`, `LU-UNIT-ID` | Catalog and unit identities are unique; a landscape has one catalog. |

Prerequisite paths use the normative relation of the Graph Definition:
requirements are inherited along `contains`, expanded to atomic goals and then
closed transitively. Paths may leave the unit's own goals and the subject.

With `--offered <inventory>` the validator additionally checks R1 inside every
offered curriculum (`LU-R1-OFFERED`): wherever the offered view itself targets
an own ordinary goal, an own assessment that requires it must be learnable
there, that is, lie in the learning scope of that curriculum. A goal that is in
scope only because the prerequisite closure added it is acquired as a single
competence and demands no assessment of its unit. The inventory comes from
`app/scripts/reportMathPhysicsNativeInventory.ts`, which asks the backend
projection for the view targets and the closed learning scope of every offered
configuration. `npm --prefix app run validate:learning-units:offered` produces
the inventory and runs this check. It needs a backend build and is not part of
required CI.

## Reviewed coverage (R2)

A unit is structurally valid without `coverageReviews`. The validator reports
which own ordinary goals still lack reviewed coverage; implicit recognition is
only sound for a unit where none is missing.

Each review entry names one own assessment, the own ordinary goals whose
independent application its tasks and normal grading were reviewed to test, and
the review record. A reviewed goal must be required by that assessment and
listed in its `coveredGoalIds`. `taskRevision` and `rubricRevision` use the
binding of `contracts/assessment-completion/v1`: `sha256:` over UTF-8 JSON with
recursively sorted object keys, unchanged array order and compact separators,

- `taskRevision`: `{taskContent, solutionContent}` of the assessment's `examData`,
- `rubricRevision`: its `scoring` object.

When the task, solution or rubric changes, the entry is stale and the validator
fails until the coverage is reviewed again. Review-bound content uses integer
numbers only, so that the TypeScript and backend hashes agree.

## Not covered by this contract

Rule R5, that a later re-cut of units or later edges never grants additional
recognition to existing results, is a runtime contract and is not implemented.
Whether a unit boundary is didactically sound is a review question that no
validator answers.
