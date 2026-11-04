# Curriculum levels with completion gates

A learner finishes a unit such as Kinematics, demonstrates independent performance on its assessment tasks and recalls its required cards. Completing the unit can open Dynamics. Several units can open at once, and a later unit can bring two branches back together.

This is an **optional design profile** for a [curriculum level](curriculum-levels.md). It specifies what a course would have to declare and validate before it could offer that progression. The current planning profile in [Graph Definition §12](graph-definition.md#12-optional-curriculum-level-assignments) permits learners to work across stage boundaries. Whole-level access gates would require an explicit course mode and backend support. The binding completion decision of 4 November 2026 revises local recognition as described below; current `main` still implements the earlier completion interpretation.

## Give a cluster a role in one plan

Declare the level role on a **cluster placement in a resolved, versioned course plan**. Reuse the existing `contains` structure. For example, a Physics course can designate the Kinematics placement as one level. Another course can choose two of its subclusters as separate levels. Both plans use the same canonical learning goals.

| Plan information | Meaning |
| --- | --- |
| Level placement | Identifies the cluster or structural section in the authoritative composition view. |
| Acquisition targets $T_L$ | Collect the unique, applicable atomic targets below that placement, including its assessment and memorization goals. Resolve choices, direct entries and projection roles using the existing view rules. |
| Final assessments $Q_L$ | Identify the authoritative final-assessment targets in the unit. At least one is required. Their actual tasks and ordinary rubric must require independent application of every ordinary competence recognized by this unit. A fully missing essential competence cannot be compensated by unrelated points while still being recognized. Several task variants of one assessment remain one goal. |
| Required cards $C_L$ | Resolve the cards for the level's memorization goals from the authoritative deck and selection for each goal. Identify evidence by the existing memory goal and card identity. Record the reviewed card scope for this revision. |
| Predecessor levels $Pred_L$ | Name the placements whose completion is required to enter this level. The proposed plan relation is called `requiresLevel` below. |

Each acquisition target has exactly one home level in a complete decomposition of the selected course. A shared prerequisite keeps its original identity and home when later units use it. Multiple `contains` parents, nested clusters or overlapping views must resolve to unambiguous acquisition ownership. If two selected placements claim the same target, refine the placements or resolve the scope before accepting the plan. A larger stage may still aggregate several playable levels for reporting.

Keep membership in the [authoritative view](view-projection-and-goal-placement.md). A card belongs with the level that teaches the knowledge it tests. Compare the union of the home card sets against the full required card inventory of the resolved course. Report omissions and duplicate acquisition assignments. Distinct memorization goals may select disjoint cards from a shared deck. If one existing goal owns cards that two levels would need for first acquisition, keep it in one unit or revise the goal and its card bindings before accepting the split. Moving a card across goal identities requires an explicit evidence-migration decision. Later review can reuse the original binding. An unresolved deck or missing card fails validation. A unit with no material requiring memorization may declare a reviewed empty card set.

## Test whether the cluster can serve as a level

1. **Walk every local route in learning direction.** Form the level's finite directed graph of subject-learning routes. Use the applicable [atomic route contract](graph-definition.md#85-didactic-route-coverage-motivation-to-autonomy), follow `requires` in reverse and retain edges with both endpoints in the level. Include every ordinary subject target, including isolated ones, and its final assessments. Retain orientation and memorization nodes where they participate in those routes. Separately reviewed card-only support is covered by the card obligation. Every maximal path must end at a local final assessment. Equivalently, every sink of this acyclic route graph belongs to $Q_L$. Each designated endpoint must be a local sink reached from at least one ordinary subject target in the same unit. An isolated exam or a deck alone cannot constitute a playable unit. Later reuse outside the level is allowed.
2. **Check what the assessments actually test.** Independent review maps every recognized competence to actual tasks and the ordinary pass rubric, including each passing combination that can release that competence. Ask whether a learner can pass without possessing a claimed competence; such a counterexample rejects the recognition contract. Points elsewhere cannot compensate for a fully missing essential competence while still granting it. A path proves reachability, not content coverage. A task asking only for a definition cannot substantiate unfamiliar-diagram interpretation. Review required card coverage separately. These are static authoring checks, not extra runtime evidence or per-part second passes; current legacy exams are not thereby declared verified.
3. **Exhibit a teachable order.** Resolve the full effective prerequisites, including inherited, cluster, hidden and cross-subject requirements. Outside preparation must come from the explicit entry basis or be acquired earlier. Check that a reference learner can traverse each level in turn using the §12 frontier witness, without relying on an exam shortcut or assuming recognition in the hypothetical entry state. The witness order must respect every declared level gate. An unmet or unassigned prerequisite is reported even when it is invisible in the level's display.
4. **Check the budget.** Estimate acquisition, practice, card work and assessment under the stated entry and teaching conditions. Work plus reserve must fit the available time, including binding subject budgets. Goal count and goal weight cannot supply that estimate. A candidate can pass the structural checks while its time feasibility remains open.

## Separate evidence, completion and entry

Reuse the authoritative level targets $T_L$ and
[assessment-gated completion](assessment-gated-completion.md). With Q denoting
assessment goals and K memory goals, all local protected targets are
$P_L=T_L\cap(Q\cup K)$. Full prerequisite reachability from $P_L\setminus M$
continues through mastered intermediates. Only ordinary local targets outside
that demand can enter $I_L$, and only under the reviewed assessment contract.
For $Q\to B\to A$, mastery of B alone leaves A open while Q is open.

$$
Evidence(L)\iff T_L\subseteq M_{\mathrm{eff}}.
$$

Every local assessment needs its normal explicit pass, and every local memory
goal its existing M1 verified recall for all required cards. Exams and memory
goals never become implicit. Self-rating and an empty SRS queue are insufficient;
a card merely becoming due does not erase a valid recall result. Surface every
outstanding protected obligation and its existing workflow. An unrelated open
card keeps the level incomplete, while retaining ordinary preparation only
where it has a real transitive dependency.

The effective set includes valid recognition from durably applicable versioned
contracts, even after Personal-Curriculum or focus changes. It is not recomputed
solely from the currently displayed course. Direct understanding and implicit
independent application have equivalent future prerequisite and total-progress
credit. Stable assessment identities retain stable recognition meaning; a later
contract cannot turn an old pass into evidence of newly added competencies.
Retain original attribution and immutable contract meaning. This introduces
no stored badge, second pass state or mastery of a cluster. Migration details
remain deferred to implementation planning.

Define `requiresLevel(B, A)` to mean that **A must be complete before B can be entered**. This is an explicitly authored relation among level placements in this course. A subject prerequisite between two atomic goals can suggest a boundary for review. It does not by itself justify making the whole earlier unit compulsory. Using ordinary `requires` on the cluster would also transmit that requirement to its descendants under the graph's inheritance rules.

For an acyclic level graph, evaluate in predecessor order:

$$
Open(L) = \bigwedge_{A\in Pred_L} Cleared(A),\qquad
Cleared(L) = Open(L) \land Evidence(L).
$$

A root level is open. With multiple predecessors all must be cleared. Prior valid evidence counts as soon as the level is open. It cannot bypass an unfinished predecessor to open a third level. Clearing a level satisfies one entry requirement of each successor. Its direct and valid implicit mastery remains globally effective. Opening a level alone awards no competence.

Within an open level, ordinary goals keep their applicable frontier rules. A learner may attempt a final assessment directly even with unfinished preparation. In the proposed gated course, a locked level is visible with its missing predecessors, and starting any of its activities, including a direct exam attempt, waits for entry. This would deliberately narrow the current direct-assessment offer **in this course mode only**. The Cockpit, coach, direct links and resume paths would need the same authoritative gate. A temporary display filter cannot turn this policy on. Re-evaluate a new start against the same course revision and evidence snapshot used for entry.

## Worked example in upper-secondary Physics

The existing German Physics landscape already contains a useful candidate. The free-fall investigation goal requires the goals for uniformly accelerated motion and for investigating motion with diagrams. In the shared E-phase mechanics deck, cards `physics_e_cov_007`, `physics_e_cov_009` and `physics_e_cov_010` point to those three goals through alignment tags. These tags can seed a card review. They establish neither prerequisites nor a complete Kinematics card inventory. See the [canonical Physics graph](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json) and the [E-phase mechanics deck](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json).

The proposed unit boundary, example task and entry gate below illustrate the design. Workload and assessment coverage would still need review for the selected course.

| Unit | Work and evidence | Progression |
| --- | --- | --- |
| Kinematics | Local routes through uniform and accelerated motion converge on a final assessment. Given an unfamiliar velocity–time graph, interpret the motion, derive acceleration from its slope and displacement from its signed area. Required cards check definitions and units for velocity and acceleration. | Entry level under the stated starting assumptions. |
| Dynamics | Use forces to explain changes of motion. A goal that actually needs acceleration retains that atomic prerequisite. | The author chooses Kinematics as a required predecessor. |

Passing the graph-interpretation task while one unit card is unverified leaves Dynamics locked. Passing the outstanding hard recall opens Dynamics if all other obligations are satisfied. The learner may already know how to work with forces. That evidence remains available. Passing the reviewed Kinematics assessment can recognize the ordinary local competencies that its contract genuinely tests through independent application. Those achievements remain globally valid in Dynamics, even if its later exam is open. The pass never fabricates card recall or mastery of competencies outside the valid recognition contract.

## Find the smallest defensible levels in an existing landscape

Fix the course scope, entry basis, existing assessments, card assignments, allowable authoritative program/placement/composition boundaries, budget assumptions and intended progression before comparing decompositions. The graph alone does not uniquely determine a partition, and manually curated waiver lists are not a replacement.

1. Start with existing subclusters and trace backwards from each final assessment to identify candidate preparation. Where two exams need the same foundation, assign first acquisition once and retain both dependencies.
2. Run the local terminal, task-coverage, card and budget checks. Inspect each ordinary dead end and each external prerequisite. Enlarge the candidate, move a boundary or report a missing assessment according to the evidence.
3. Try a finer partition. Each new unit needs its own defensible assessment, card scope and time budget. Validate the full course after the split, including a common order for the gates and actual prerequisites. Acyclic atomic routes can still become cyclic when grouped.
4. Call a partition **irreducible under the stated constraints** only if no admissible proper refinement passes. Record the refinements reviewed and any limits of the search. Multiple incomparable partitions may work. Creating new exam tasks or changing budgets changes the design question.

For example, splitting Kinematics into uniform and accelerated motion is defensible if each part has its own worthwhile tested outcome. If the only existing assessment asks learners to distinguish both regimes, the unsplit cluster is the candidate supported by those assessments.

## Acceptance cases for a pilot

| Case | Expected result |
| --- | --- |
| A cluster contains only an assessment or only cards. | Reject it as a playable level. A unit needs a local subject route and an assessment of its outcome. |
| A local branch reaches its only exam across the proposed boundary. | Reject the cut. The last ordinary goal in the local branch is a sink, even if the global route is sound. |
| Two units claim the same acquisition target or cannot resolve the required cards in a shared deck. | Report the conflicting placement or unresolved card selection before enabling the gates. |
| The atomic learning order is $a \to b \to c$. One level owns $a,c$ and another owns $b$. | No whole-level traversal order exists. Move a boundary or retain one unit. |
| A final exam is passed, but a required card has only self-rated practice. | Keep the successor locked and offer the missing hard recall; the memory goal can never be implicitly mastered. |
| A previously passed card is due again, then fails an explicit retest. | Due status alone leaves the successor open. The failed retest closes the gate for new starts until the card passes again. Keep recorded subject results. |
| One of two predecessors is unfinished. The learner already passed the successor's exam elsewhere. | Keep the successor locked. Reuse the valid result once both predecessors are cleared. |
| A goal in an open level still needs an atomic prerequisite absent from effective mastery. | Show missing transitive preparation under the applicable focus policy. Opening the level alone establishes no competency. |

A first pilot can apply these cases to a single reviewed course view and publish its proposed cuts, unresolved card assignments and missing effort estimates. That gives subject reviewers a concrete partition to accept or revise before a learner-facing gate is introduced.
