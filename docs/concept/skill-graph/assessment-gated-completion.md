# Assessment-Gated Completion and Global Mastery

**Current target contract, 6 November 2026; implementation and migration pending.**
A passed assessment immediately recognizes every ordinary competence proved in
full by its qualified, immutable contract. Another open assessment cannot
withhold that evidence. Acquisition ownership and the place of valid proof
are distinct; [learning units](learning-units.md) retain their own obligations.

This supersedes the local remaining-demand recognition rule of the
[4 November decision](completion-semantics-clarification-2026-11-04.md), retained
as dated history, and the earlier preparation-discharge model. Global credit,
explicit exam/card outcomes and transitive minimality remain required. The
[Mathematics and Physics plan](../../dev/mathematics-physics-learning-units-plan.md)
defines the new work. No runtime migration, reviewed legacy coverage, deployment
or host acceptance is claimed here.

## 1. One stored result, equivalent global credit

Let A be the atomic-goal universe. Ordinary subject goals O, assessments Q and
memorization goals K are pairwise disjoint subsets of A. Orientation markers
are not ordinary subject competencies. The sole persisted result remains binary:

$$
m(a)\in\{0,1\},\qquad M=\{a\mid m(a)=1\}.
$$

For each qualified assessment q, C(q) contains only its fully proved ordinary
competencies. Define

$$
C(q)\subseteq O,\qquad
I(M)=\left(\bigcup_{q\in M\cap Q}C(q)\right)\setminus M,\qquad
M_{\mathrm{eff}}=M\cup I(M).
$$

Only explicit passed Q generate recognition; implicit results never seed
another proof or fixed point. There is no second stored outcome, partial tier,
waiver/profile state, per-part result registry or additional examination pass.

An ordinary direct result demonstrates understanding; implicit mastery
demonstrates independent application. Both satisfy future prerequisites and
count toward total progress wherever the same canonical goal is a target.
A changed Personal Curriculum, wider focus or later open assessment cannot
withdraw valid recognition. Correction of an invalid source result or contract
is a separate explicit integrity process.

Assessment and memorization goals are never implicitly mastered. Exams need
their normal positive outcome; memory goals need M1 verified recall. A due
card is not a failed recall, and self-rated practice is not verified recall.
Orientation retains its motivational-marker meaning. C(q) creates neither an
orientation completion nor an interaction. Existing marker behaviour must be
examined explicitly during migration.

## 2. Authoritative acquisition ownership in recursive units

Resolve a finite, versioned unit U from existing program/placement or reviewed
composition structure. Let $Own(U)$ be its directly assigned actual atomic
targets and $Children(U)$ its required child units after authored choices.
Its recursive target scope is

$$
T(U)=Own(U)\cup\bigcup_{V\in Children(U)}T(V).
$$

Each atom has one direct acquisition home within a resolved learning path.
A parent aggregates child targets without claiming their acquisition again.
Ownership does not restrict where a complete valid assessment proof may arise.
A focus, display filter, dated plan or arbitrary scope visit is not such a
unit or a new contract. Synthetic tree markers are not atomic acquisition goals.
A valid unit has a nonempty resolved T(U); an empty or unresolved structure is
not a completed unit. Pure aggregates contain actual required children.

Own targets include actual subject, orientation, exam and memory atoms.
Hidden prerequisite-only support is validated without becoming an acquisition
owner/target or increasing the denominator. Genuine global proof can count if
it later becomes a target. Resolve applicable choices, direct entries and
projection roles before computing ownership.

For every released acquisition unit and **each resolved permitted assessment
alternative**, the actually required own assessments must prove its complete
ordinary learning promise:

$$
Own(U)\cap O\ \subseteq\ \bigcup_{q\in RequiredOwnQ(U)}C(q).
$$

This is static content quality, not a second learner qualification. Direct
understanding of all ordinary targets does not replace these mandatory own
application assessments. Alternatives retain their real duties without making
every alternative compulsory. An uncovered terminal is a missing contract,
never zero-work mastery. Cards alone do not prove independent application.

Pure aggregates may have no own assessment. An integrative parent may own
a synthesis assessment solely of already acquired child competencies, without
a new ordinary target. Neither case violates the own-target coverage rule.
A parent assessment cannot substitute for child exams/cards. It may recognize
a child's ordinary target only through its own qualified full proof C(q),
never by blanket recognition of the descendant union. The same applies to a
foreign unit or another subject. Acquisition ownership remains unique.

Required recall belongs with its actual first acquisition. Do not place a broad
existing memory goal at the parent merely to declare its children complete
without their required cards. Keep a fitting larger boundary or review a genuine
goal/card-selection split with stable meanings and explicit evidence migration.
A support reference does not satisfy a missing recall obligation.

## 3. Full transitive requirements independent of mastery

Normalize direct/inherited requirements and expand required clusters into atomic
obligations under the authoritative graph/composition contract. R points from
consumer to prerequisite. Missing references, identity conflicts and containment,
requirement or expanded atomic cycles make the calculation unavailable, not
an empty completed unit.

Full transitive reach is independent of M:

$$
Reach_R^*(S)=S\cup\{v\mid\exists u\in S:(u,v)\in R^+\}.
$$

Never stop at a mastered intermediate. Traverse inherited, hidden, cluster and
cross-subject support before the existing focus restriction. A path alone grants
no mastery. Qualified coverage additionally satisfies the directed consistency
condition $C(q)\subseteq Reach_R^+(\{q\})$. A missing path is a finding for
subject review, never an automatically generated edge; a transitive path suffices.
Conversely, not every transitive prerequisite is assessed.

Transitive minimality tests whether an authored requirement remains reachable
after removing that edge and recomputing the effective relation, including
inherited alternatives. A redundant shortcut does not retain a separate
preparation obligation. See [Graph Definition §7.3](graph-definition.md#73-transitive-minimality).

## 4. One qualified, immutable coverage declaration

`examData.coveredGoalIds` is the starting point and, after qualification, the
single maintained coverage list. C(q) is its mathematical interpretation, not
a second editable mapping. Existing declarations and `reviewStatus=released`
alone do not establish this stronger qualification. **Unreviewed or historically
uncertain assessments have C(q) = ∅**; their explicit results remain intact.

Qualification binds the full goal meanings, actual tasks, aids, permitted
variants and normal rubric to a fixed atomic set. Legacy cluster references
must not gain stronger meaning through later `contains` changes. Do not shorten
goals to fit existing tasks. Recognition is not official source-coverage or
applicability evidence.

An assessment ID binds the same secured recognition meaning across its history.
Every historically permitted passing route under it must support C(q).
Meaning-equivalent task variants may retain the ID; stronger or uncertain claims
require a new Q-ID. Old results never pass that new Q. A current rubric hash
cannot reconstruct the historical task behind a binary pass. Retain valid
historical contracts after curriculum/focus changes, without adding per-learner
version qualifications. Scope visits and unit completion generate no proof.

## 5. What the assessments must establish

A requires path proves reachability, not content coverage. Independent review
inspects every qualified Q, its allowed variants and normal pass rubric against
each complete competence in C(q). Several tasks within one Q may jointly prove
the goal; every task need not duplicate the whole claim.

The counterexample is concrete: can a learner pass q while entirely lacking
a complete competence claimed by C(q)? If yes,
the contract fails. Points elsewhere must not compensate for a fully missing
essential competence while still granting it. Also test a realistic passing
case with secure understanding and an incidental arithmetic error. Revise tasks,
weights, normal rubric or claim. If published core criteria beyond the current
total-points rule are needed, change the shared normal grading contract and test
all affected adapters before activating the claim. Coach and backend use one
binary result, with no hidden coach-only minimum or later qualifying pass.
Learners know the expected competencies; solutions and internal rubric details
remain protected until evaluation.

One complete Q is the default proof. Experiment **and** analysis normally form
one suitable multipart Q with a complete submission, normal rubric and one
binary result. Analysing supplied data does not prove a required own experiment.
Two separately passed incomplete Q do not automatically combine into proof of
the full goal. A general proof-combination language is outside the first rollout.

Existing positive exam mastery may count without another pass if its legacy
meaning supports this claim. A previous ordinary understanding result does not
become an application-exam pass through a type conversion. Preserve original
identities/results or introduce the stronger assessment identity. Existing
curricula are not declared reviewed for that claim by this concept.

## 6. Recursive completion and partial achievement

$$
Complete(U)\iff Own(U)\subseteq M_{\mathrm{eff}}
\ \land\ \bigwedge_{V\in Children(U)}Complete(V).
$$

Own Q/K need explicit outcomes and every required child must complete its own
contract. Completion is derived, not a stored unit result or cluster mastery.
A pure aggregate may complete through children alone. A parent with own synthesis
also needs that explicit pass, even if it introduces no ordinary competence.

| Case | Result |
| --- | --- |
| Own $Q\to B\to A$; M empty or only B mastered | Q remains open; B alone does not prove A or hide its transitive demand. |
| Q passed with qualified C(Q) containing A and B | A and B are immediately globally recognized. |
| Q and S both require A; Q fully proves A, S remains open | A stays recognized; S remains open. |
| Q passed with unknown or unqualified coverage | Its explicit result remains; no additional ordinary credit. |
| Parent/foreign Q fully proves A; child Q/K remain open | A is recognized; all required child Q/K remain open. |
| An unrelated required card stays open | Unit completion stays open; independently established recognition remains valid. |
| Child completed; parent synthesis open | Child recognition stays globally valid; parent is incomplete. |
| Parent synthesis passed; child exam/card open | Child and parent remain incomplete; child obligations were not passed. |
| Parent has no own exam and all required children complete | A valid aggregate may complete without inventing another exam. |

Whole-unit completion is not a precondition for every individually valid
recognition. Nor is completion itself a decision about technical entry.
[Learning-Unit Progression](learning-unit-progression.md) keeps regular order,
any proposed access lock and direct assessment policy distinct.

## 7. Assessment access and ordinary continuation

Existing applicable assessments remain deliberately addressable without first
mastering preparation. Authentication, learner revision, session ownership,
task availability and normal grading remain required. Discovery is read-only;
paging must not permanently remove assessments. An attempt is not a pass.

This work introduces no new whole-unit access lock or assessment ban. Direct
attempts remain available. A future gated mode requires a separate explicit
policy; the conditional example does not restrict existing assessment access.

Ordinary prerequisites use $M_{\mathrm{eff}}$ and full reachability before
focus restriction. A mastered or outside-focus intermediate cannot hide an
in-focus requirement. Normal mode ignores a wholly outside-focus valid
prerequisite; strict mode checks globally. Invalid authored Level-2 references
remain configuration errors. Voluntary repetition remains available without
revoking credit or mutating authored requirements.

## 8. Progress, plans and evidence boundaries

For a fixed deduplicated target set G, total achievement and default plan IST use

$$
IST(G)=|G\cap M_{\mathrm{eff}}|.
$$

The existing explicit-only plan-counting preference may use $|G\cap M|$ for
plan IST only; it changes neither global mastery nor prerequisite satisfaction
or general progress. Weighted progress uses the same effective indicators.
Current targets determine the denominator; outside support contributes nothing.
Multiple placements and recursive child scopes count each canonical atom once.

Daily/weekly histories and period quotas use reliably dated explicit outcome
events only. Implicit recognition fabricates no date, threshold event or that
day's performed work. A dated plan or calendar year is not another acquisition
unit. Time-budget claims remain a separate optional planning profile.

The current runtime still contains older remaining-demand/discharge behaviour.
Activation must explicitly assess display changes and other unreviewed subjects,
whose Q conservatively have C(q) = ∅. Preserve explicit data and valid historical
proof; old local displays are not qualified global credit.

Acceptance must cover own/child ownership, every assessment alternative, all Q/K,
full transitivity, qualified/unknown coverage, early recognition despite open Q/K, parent
synthesis/aggregation, stable global credit after scope changes, legacy meaning,
normal/strict boundaries, direct exam access, card ownership, target deduplication
and explicit-only event histories. Independent task/rubric review is separate
from machine tests, real-host acceptance, usability and learning effectiveness.
