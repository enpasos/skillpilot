# Curriculum Levels

A **curriculum level** is an ordered learning stage for a defined educational
context. Its goals must be reachable from the declared entry basis and earlier
levels, allowing a suitable learning order within the level itself. Its estimated
workload plus explicit reserve must fit its available learning budget under
stated learning conditions.

A school year is a familiar cross-subject example. A semester, a course stage,
or a bounded continuing-education period can use the same concept.

> **Concept status.** This page defines the curriculum-level design and its
> quality claims. It does not announce an implemented level schema, validator,
> badge, or 3D interface. The optional formal profile is specified in
> [Graph Definition §12](graph-definition.md#12-optional-curriculum-level-assignments).
> Existing graph validity, projection roles, learner state, and runtime modes
> retain their own contracts.

## Vocabulary and purpose

Use **curriculum level** in English, **curriculares Level** in German, and
`CurriculumLevel` when a technical name is needed. This is distinct from:

- the four [Levels of Personalization](../levels-of-personalization.md), which
  describe how curriculum scope and learner state are resolved;
- goal difficulty metadata such as `level` / Anforderungsbereich;
- curriculum quality maturity levels;
- a learner's individual competence or a general experience-points score.

Curriculum levels connect two responsibilities: prerequisite-consistent
curriculum organisation and realistic workload planning. They also give learners
recognisable milestones between an individual learning goal and a complete
educational programme.

A year label alone establishes neither responsibility. An official year
placement is input to the check; the result may expose a missing preparation,
an ordering conflict, or an unsupported workload estimate. Such a finding must
remain visible rather than being presented as a validated level.

## Contextual stages over stable goals

The level assignment belongs to a resolved educational context, for example a
specified jurisdiction, school form, duration model, subject selection, course
profiles, and curriculum release. A canonical goal keeps the same identity even
when another context assigns its acquisition to a different level.

Use the existing [program and placement layers](general-goal-system-and-migration.md)
and [reviewed composition views](view-projection-and-goal-placement.md). A
curriculum level is a planning contract over those structures, not another kind
of assessable goal. Where a composition view is authoritative, derive the
level's target membership from that view and validate any additional assignment
against it; do not maintain a competing copy of the curriculum structure.

Within one resolved learning path:

- every target has one acquisition level;
- later repetition, application, and assessment may reference the same goal;
- first acquisition is counted once, even when several subjects need it;
- the level's participating subjects and required target scope are explicit.

A Mathematics-and-Physics level must be labelled with that scope. It cannot
claim to cover the whole school year across subjects that were never included.
Alternative pathways must be resolved explicitly; do not validate the workload
of an arbitrarily selected light pathway as if it covered every permitted one.

## Condition 1: prerequisite-consistent and traversable

For every target, all required competencies must belong to the declared entry
basis, an earlier level, or the same level. A required competency assigned to a
later level is an ordering conflict. A required competency with no assignment
and no declared entry assumption is a planning gap.

The check includes direct requirements, inherited requirements, longer
prerequisite chains, the atomic contents of required clusters, and applicable
cross-subject requirements. Resolve these before applying the level's display
filter. An outside prerequisite must not disappear just because it is hidden
from a learner-facing tree or absent from one subject's target list.

The entry basis states what the reference plan assumes at its start. It does
not certify that a particular learner already possesses those competencies.
Declaring entry requirements or simulating a valid learning order never writes
learner mastery.

### Requirements within the same level

Dependencies within a level are allowed. The level must admit an order in which
all its targets can actually be reached from the assumed entry state. The
formal profile uses the existing global frontier to check this; it catches
within-level deadlocks as well as dependencies on later levels.

The following example is illustrative, not a claim about an official syllabus.
Suppose a Physics target in level 7 requires a Mathematics target for rearranging
a simple equation:

| Mathematics acquisition level | Structural result | Remaining planning task |
| --- | --- | --- |
| 6 | Prerequisite available from an earlier level | Diagnose individual gaps when needed. |
| 7 | Permitted if the level has a valid internal learning order | Schedule Mathematics before the dependent Physics target. |
| 8 | Ordering conflict | Review the prerequisite's acquisition placement or the dependent target's stage. |
| No assignment and no entry assumption | Planning gap | Resolve where the necessary preparation belongs. |

The level check establishes coarse ordering. A dated plan must additionally
provide prerequisites before the dependent target's planned use. Two targets
in the same school year can still be ordered incorrectly within that year.

Repairs must preserve the meaning of the competencies and their justified
requirements. Moving a preparation earlier or revising the dependent target's
placement may resolve a conflict. A change to the official-curriculum mapping
must remain traceable to its source and reviewed context.
Where earlier preparation supplies the same canonical competence, its acquisition
must be assigned there in that plan; a later encounter is repetition or application.

### Cross-subject support goals

A Mathematics goal may be a normal target in the Mathematics view and
`prerequisiteOnly` in the Physics view. A combined level resolves both roles
against the same canonical identity. Its acquisition workload is counted once;
additional Physics practice may consume separately planned time.

A required goal outside the combined target set needs an explicit entry
assumption or an authorised provision for learning it. Detecting that need does
not automatically promote a projection role, widen the Personal Curriculum,
or make a hidden goal selectable. The level review reports the gap for the
appropriate curriculum or planning decision.

## Condition 2: workload fits a declared learning budget

Workload feasibility is conditional on the reference learners, their assumed
entry competencies, the learning conditions, and the available time. A calendar
year by itself is not a learning budget.

The [curriculum time-axis contract](../didactic/curriculum-time-axis-and-pacing.md)
owns calendar capacity, plan-local effort units, activity allocation, and
reserves. A curriculum-level assessment uses that contract:

> Estimated learning work plus protected reserve must fit the available
> capacity, using the same documented unit and scope.

The work estimate covers the specified acquisition, practice, repetition,
assessment, and preparation activities. Their time is accounted for once.
First acquisition of a shared goal is not duplicated; genuine additional
activities may have additional effort.

Goal counts and the existing `weight` field do not establish learning time.
Plan-local units from different subjects are not comparable without a common
calibration. Cross-subject budgeting therefore uses a shared time unit,
preferably minutes, and a documented workload model.

For a fixed timetable, check both the overall budget and the binding subject
or resource budgets. Spare capacity in one subject does not automatically
resolve an overloaded subject. Out-of-class work is included only when the
plan explicitly identifies its expected time. A shared activity must not spend
the same minute independently in several subjects.

Reserve is explicit. No universal reserve percentage follows from the level
definition; a zero reserve remains a disclosed planning choice under the
time-axis contract.

### Evidence and uncertainty

Structural feasibility and workload feasibility are separate findings:

| Finding | What it establishes |
| --- | --- |
| Structurally feasible | All level targets can be traversed under the resolved prerequisite semantics and declared entry assumptions. |
| Workload feasible under stated assumptions | A supported estimate, its reserve, and all binding budgets fit under the published reference conditions. |
| Workload not yet assessed | Necessary estimates, calibration, or reference conditions are missing. |

The workload record identifies its method, version, assumptions, uncertainty,
and evidence, such as author estimates, subject-expert review, or relevant
empirical calibration. For an interval estimate, state which bound or decision
rule supports the budget judgement. Arithmetic fit and strength of evidence
remain distinguishable. A structural pass alone must not produce an overall
claim of a validated, manageable level.

A feasible reference budget is not a guarantee for every learner. Already
achieved goals reduce an individual's remaining work. Missing entry competencies
can add preparation and require a revised personal schedule without changing
the reference curriculum's past definition.

## Level completion and individual availability

> **Related proposed profile:** [Assessment-Gated Completion and Prerequisite Discharge](assessment-gated-completion.md) defines non-waivable level-end assessments and a separately derived, context-scoped waiver for learning work. This proposal does not change the currently implemented goal results, level completion, or exam access rules.

A level declares its completion rule over an explicit required target set and
any applicable, resolved selection rules. Completion is derived from the stored
goal results using the appropriate goal-type semantics. A date, time spent, or
number of consumed planning units does not establish completion. An orientation
completion must not be described as evidence of subject-matter competence.

The level's required scope and the complete Personal Curriculum may differ.
Name both scopes. This concept does not introduce a new selection flow or turn
existing `target` goals into optional work. Any optional extension or choice
must already be explicitly represented by the applicable scope contract.

A level-wide completion result is distinct from availability of an individual
goal. Within the authorised learning scope, an available Mathematics goal in
a later level may be pursued while an earlier level still has open targets
in another subject. Do not introduce blanket `requires` edges between level
containers or require all earlier-level targets before every later target.

The runtime's existing focus, normal/strict evaluation, and continuation rules
remain authoritative. A global structural check of the reference plan does not
silently change those runtime settings. Level progress is not a cross-subject
pace score; the [per-subject plan-status contract](../didactic/unified-learning-plan-status.md)
continues to govern pace and plan balances.

## The knowledge-building metaphor

The [Whitepaper's house metaphor](../../whitepaper/whitepaper.en.md) describes
learning as building on foundations. Curriculum levels add larger construction
stages to that picture:

| Concept | Possible representation |
| --- | --- |
| Confirmed subject-matter competence | A completed building block |
| Topic or subject | A room or wing |
| Actual prerequisite | A supporting connection to the required blocks |
| Curriculum level | A construction stage, possibly visualised as a floor |
| Currently available goal | An accessible next building position |

Different wings may grow at different rates. A construction stage can remain
partly open while a supported extension grows elsewhere. A visual floor must
not imply that every block below it is a prerequisite for every block above it.
The larger stage provides a recognisable completion milestone while each
confirmed competence remains a visible contribution.

This is a presentation design, not evidence that a particular visualisation
improves motivation or learning. Any implementation derives its state from
canonical goal results; moving to another view must not erase or award skills.

## Information needed for a reviewable level plan

The conceptual contract needs the following information. These are semantic
requirements, not a new serialised schema or a second source of target placement.

| Information | Purpose |
| --- | --- |
| Plan identity, revision, educational scope, and referenced curriculum/view versions | Identify exactly which claim was assessed. |
| Ordered stages and resolved target-to-stage assignments | Define acquisition stages over stable goal identities. |
| Participating subjects and explicit entry basis | Make the coverage and starting assumptions visible. |
| Resolved prerequisite evidence and structural result | Expose later-level conflicts, gaps, and within-level deadlocks. |
| Reference learner profile, learning conditions, and workload method | Explain the effort estimate and its limits. |
| Available overall and binding sub-budgets, activity allocations, and reserve | Check capacity without double-counting. |
| Completion rule and its required target scope | Derive an interpretable milestone from existing goal results. |
| Workload result and evidence status | Keep unassessed effort distinct from supported feasibility. |

After a relevant change to goals, prerequisites, placements, entry assumptions,
or budgets, re-evaluate the affected level claim against the new revision.
Preserve the former assessment as a claim about its own inputs; do not silently
carry a green result to changed content. A projection change never rewrites
historical learner achievements.

## Related contracts

- [Graph Definition §12](graph-definition.md#12-optional-curriculum-level-assignments):
  optional formal feasibility profile; base graph validity remains separate.
- [General Goal System and Migration](general-goal-system-and-migration.md):
  contextual structure over stable learning goals.
- [View Projection and Goal Placement](view-projection-and-goal-placement.md):
  authoritative membership, composition, and projection roles.
- [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](../didactic/curriculum-time-axis-and-pacing.md):
  time capacity, effort, individual planning, and reserve.
- [Levels of Personalization](../levels-of-personalization.md):
  the separate product-level meaning of Level 1 through Level 4.
