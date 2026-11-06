# Learning-Unit Progression and Access Policy

[Learning units](learning-units.md) form recursive learning promises. A course
may deliberately declare that one **whole unit** is a prerequisite of another.

**Decision boundary, 6 November 2026.** Recursive completion and qualified
global passed-Q recognition are accepted target rules, with runtime migration
pending. This work retains direct assessment attempts and introduces no new lock.
The didactic purpose clarified on **6 November 2026** is also binding: the
planned transition to learning that relies on a unit's application promise
requires a dependable assessment of that promise first. Whether authored
whole-unit prerequisites additionally impose technical access locks remains
**undecided**, including their interaction with deliberate direct assessment
access. The gated profile below is a conditional example, not an activated rule.

The [design criteria and examples](learning-unit-design-and-examples.md)
describe the learning boundary. This purpose does not turn every atomic
`requires` edge into a whole-unit requirement. Independent branches can continue;
an ordinary goal's explicit mastery does not itself pass a separately required
unit assessment. Existing valid global mastery and recognition remain intact.

## 1. A deliberately stronger prerequisite

A whole-unit prerequisite concerns its complete promise, required children
and own obligations. Author it in a resolved, versioned course composition.
Do not infer it from an atomic `requires` edge, a year label or a shared parent.
An acceleration activity may need a velocity competence without needing every
exam, card and topic in a broad Mechanics module first.

This composition policy sits outside the base graph's `contains` and `requires`
relations. No new implemented field or schema is introduced here. A unit
dependency summary is not permission to add whole-unit requirements or locks.

## 2. Evidence is independent of entry

For directly assigned Own(U) and resolved required Children(U),

$$
Complete(U)\iff Own(U)\subseteq M_{\mathrm{eff}}
\ \land\ \bigwedge_{V\in Children(U)}Complete(V).
$$

Every own Q/K remains explicitly passed or recalled. A pure aggregate may
have no own exam. An integrative parent may require synthesis of already
acquired child competencies without adding a new ordinary goal. That pass
neither completes an unfinished child nor replaces its recall. A child pass
does not pass synthesis.

Recognition comes from any explicit passed Q whose immutable qualified C(q)
fully proves an ordinary goal, including a parent or foreign Q. Unique
acquisition ownership is separate. Every permitted required-own-Q alternative
must prove the unit's complete own ordinary promise; required Q/K are not
replaced by foreign proof. Another open Q or card cannot withhold valid global
recognition. Entry policy cannot erase it or enlarge an old exam's meaning.

## 3. Feasible projected block order

Resolve atomic, inherited, cluster-expanded, hidden and cross-subject demands
first. Keep atomic DAG validity and transitive minimality independently of
grouping. For indivisible course blocks, project prerequisite demands between
acquisition owners and include authored whole-unit dependencies. Required
children precede parent completion; the parent does not duplicate acquisition.

The projected course must admit an acyclic block order and internal atomic
traversal. An atomic DAG can become cyclic when grouped. Report interleaving
requirements, change boundaries or explicitly permit interleaving; do not
silently drop inconvenient edges, add universal gates or duplicate acquisition.

## 4. Conditional gated-course example

**If an explicit gated access mode is later chosen**, predecessor units Pred(U)
could define, in dependency order,

$$
Open(U)=\bigwedge_{V\in Pred(U)}Cleared(V),\qquad
Cleared(U)=Open(U)\land Complete(U).
$$

Complete is evidence; Cleared is the conditional course-policy result. Neither
is another stored mastery outcome. Existing valid results remain valid while
a course waits for entry. Opening a unit awards no competence. Unresolved
predecessors must not be treated as an empty satisfied requirement.

Blocking direct assessment attempts in a locked unit would deliberately narrow
existing access. It requires an explicit decision and a coherent backend policy
for Cockpit, coach, links, resume and starts. Preserving direct attempts would
instead require a precise statement of which activities unit prerequisites
constrain. **Neither option is selected here.** Focus and display filters cannot
make that policy decision.

## 5. Present boundaries and future acceptance

This conceptual design introduces no new universal lock. Existing authentication,
learner revision, task availability, session ownership and normal grading remain
required. Deliberate assessment access is an attempt, not a pass.

Ordinary prerequisites use effective mastery and full transitive reach before
the existing focus restriction. Normal mode ignores a wholly outside-focus
valid prerequisite; strict mode checks globally. Invalid authored Level-2
references remain configuration errors. Grouping bypasses none of these rules.

Review actual authored choices, ownership, card inventory, application contracts
and block order. A shared broad deck needs defensible ownership or a reviewed
split; do not shorten recall merely to close a small demonstration unit.
Moving the broad memory goal to a parent does not remove the children's actual
required cards. Keep a fitting larger boundary or review a meaning-preserving
goal/card split and its evidence migration before claiming child completion.
Calendar/time budgets are optional separate profiles under
[Graph Definition §12](graph-definition.md#12-learning-units-and-optional-planning-profiles).

Acceptance distinguishes an open child, an unpassed own synthesis assessment,
an unrelated open card and already recognized competence. Any later access-mode
acceptance must additionally test its chosen direct-exam policy consistently
through actual host paths. Local models/browser tests establish neither host
acceptance nor learning effectiveness.
