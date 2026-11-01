# Curriculum levels with completion gates

A learner finishes a unit such as Kinematics, demonstrates independent performance on its assessment tasks and recalls its required cards. Completing the unit can open Dynamics. Several units can open at once, and a later unit can bring two branches back together.

This is an **optional design profile** for a [curriculum level](curriculum-levels.md). It specifies what a course would have to declare and validate before it could offer that progression. The current planning profile in [Graph Definition §12](graph-definition.md#12-optional-curriculum-level-assignments) permits learners to work across stage boundaries. Whole-level access gates would require an explicit course mode and backend support.

## Give a cluster a role in one plan

Declare the level role on a **cluster placement in a resolved, versioned course plan**. Reuse the existing `contains` structure. For example, a Physics course can designate the Kinematics placement as one level. Another course can choose two of its subclusters as separate levels. Both plans use the same canonical learning goals.

| Plan information | Meaning |
| --- | --- |
| Level placement | Identifies the cluster or structural section in the authoritative composition view. |
| Acquisition targets $T_L$ | Collect the unique, applicable atomic targets below that placement, including its assessment and memorization goals. Resolve choices, direct entries and projection roles using the existing view rules. |
| Final assessments $Q_L$ | Identify the authoritative final-assessment targets in the unit. At least one is required. Their tasks must examine the independent performance claimed for this unit. Several task variants of one assessment remain one goal. |
| Required cards $C_L$ | Resolve the cards for the level's memorization goals from the authoritative deck and selection for each goal. Identify evidence by the existing memory goal and card identity. Record the reviewed card scope for this revision. |
| Predecessor levels $P_L$ | Name the placements whose completion is required to enter this level. The proposed plan relation is called `requiresLevel` below. |

Each acquisition target has exactly one home level in a complete decomposition of the selected course. A shared prerequisite keeps its original identity and home when later units use it. Multiple `contains` parents, nested clusters or overlapping views must resolve to unambiguous acquisition ownership. If two selected placements claim the same target, refine the placements or resolve the scope before accepting the plan. A larger stage may still aggregate several playable levels for reporting.

Keep membership in the [authoritative view](view-projection-and-goal-placement.md). A card belongs with the level that teaches the knowledge it tests. Compare the union of the home card sets against the full required card inventory of the resolved course. Report omissions and duplicate acquisition assignments. Distinct memorization goals may select disjoint cards from a shared deck. If one existing goal owns cards that two levels would need for first acquisition, keep it in one unit or revise the goal and its card bindings before accepting the split. Moving a card across goal identities requires an explicit evidence-migration decision. Later review can reuse the original binding. An unresolved deck or missing card fails validation. A unit with no material requiring memorization may declare a reviewed empty card set.

## Test whether the cluster can serve as a level

1. **Walk every local route in learning direction.** Form the level's finite directed graph of subject-learning routes. Use the applicable [atomic route contract](graph-definition.md#85-didactic-route-coverage-motivation-to-autonomy), follow `requires` in reverse and retain edges with both endpoints in the level. Include every ordinary subject target, including isolated ones, and its final assessments. Retain orientation and memorization nodes where they participate in those routes. Separately reviewed card-only support is covered by the card obligation. Every maximal path must end at a local final assessment. Equivalently, every sink of this acyclic route graph belongs to $Q_L$. The designated endpoints must be terminal within the level. Later reuse outside the level is allowed.
2. **Check what the assessments actually test.** A reviewer maps each claimed performance to a task or grading criterion and checks that the required cards cover the facts assigned to the unit. A path proves reachability. A task that asks only for a definition cannot substantiate a claim that learners can interpret an unfamiliar motion diagram.
3. **Exhibit a teachable order.** Resolve the full effective prerequisites, including inherited, cluster, hidden and cross-subject requirements. Outside preparation must come from the explicit entry basis or be acquired earlier. Check that a reference learner can traverse each level in turn using the §12 frontier witness, without relying on exam shortcuts or assumed waivers. The witness order must respect every declared level gate. An unmet or unassigned prerequisite is reported even when it is invisible in the level's display.
4. **Check the budget.** Estimate acquisition, practice, card work and assessment under the stated entry and teaching conditions. Work plus reserve must fit the available time, including binding subject budgets. Goal count and goal weight cannot supply that estimate. A candidate can pass the structural checks while its time feasibility remains open.

## Separate evidence, completion and entry

Let $H_L$ be the authoritative completion context for the level, including its applicable supporting obligations. Reuse [assessment-gated completion](assessment-gated-completion.md) to calculate $Complete(H_L)$ from existing goal results. Its assessment set can include supporting assessments outside $T_L$. Identify those obligations and their accessible source in the plan. Entry assumptions supply no learner evidence for them. A supporting assessment whose proof is missing must remain visible and attainable. Its fixed-point rule can waive ordinary preparation, including a memorization learning step. A waived step supplies no evidence that a learner recalled a card. Add the existing hard-recall evidence explicitly to the level decision:

$$
Evidence(L) = Complete(H_L) \;\land\;
              \bigwedge_{c\in C_L} VerifiedRecall(c).
$$

Each final assessment in $Q_L$ needs an explicit pass. Each required card needs a passing hard recall outcome from its own [memorization workflow](node-types.md#memorize). The Cockpit and coach must surface any outstanding card and its hard-recall workflow even after the fixed point marks its memory goal implicitly complete. If ordinary prerequisites remain, show a traversable preparation route. Self-rated practice and an empty spaced-repetition queue cannot provide that proof. A card becoming due for ordinary review does not erase its hard recall result. Recalculate after a failed hard retest, a corrected assessment or a curriculum revision. This profile computes eligibility from the applicable evidence and introduces no separately stored badge or mastery of a cluster.

Define `requiresLevel(B, A)` to mean that **A must be complete before B can be entered**. This is an explicitly authored relation among level placements in this course. A subject prerequisite between two atomic goals can suggest a boundary for review. It does not by itself justify making the whole earlier unit compulsory. Using ordinary `requires` on the cluster would also transmit that requirement to its descendants under the graph's inheritance rules.

For an acyclic level graph, evaluate in predecessor order:

$$
Open(L) = \bigwedge_{A\in P_L} Cleared(A),\qquad
Cleared(L) = Open(L) \land Evidence(L).
$$

A root level is open. With multiple predecessors all must be cleared. Prior valid evidence counts as soon as the level is open. It cannot bypass an unfinished predecessor to open a third level. Clearing a level satisfies one entry requirement of each successor. Its goals and any prerequisites whose work was waived keep their own mastery results.

Within an open level, ordinary goals keep their applicable frontier rules. A learner may attempt a final assessment directly even with unfinished preparation. In the proposed gated course, a locked level is visible with its missing predecessors, and starting any of its activities, including a direct exam attempt, waits for entry. This would deliberately narrow the current direct-assessment offer **in this course mode only**. The Cockpit, coach, direct links and resume paths would need the same authoritative gate. A temporary display filter cannot turn this policy on. Re-evaluate a new start against the same course revision and evidence snapshot used for entry.

## Worked example in upper-secondary Physics

The existing German Physics landscape already contains a useful candidate. The free-fall investigation goal requires the goals for uniformly accelerated motion and for investigating motion with diagrams. In the shared E-phase mechanics deck, cards `physics_e_cov_007`, `physics_e_cov_009` and `physics_e_cov_010` point to those three goals through alignment tags. These tags can seed a card review. They establish neither prerequisites nor a complete Kinematics card inventory. See the [canonical Physics graph](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json) and the [E-phase mechanics deck](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json).

The proposed unit boundary, example task and entry gate below illustrate the design. Workload and assessment coverage would still need review for the selected course.

| Unit | Work and evidence | Progression |
| --- | --- | --- |
| Kinematics | Local routes through uniform and accelerated motion converge on a final assessment. Given an unfamiliar velocity–time graph, interpret the motion, derive acceleration from its slope and displacement from its signed area. Required cards check definitions and units for velocity and acceleration. | Entry level under the stated starting assumptions. |
| Dynamics | Use forces to explain changes of motion. A goal that actually needs acceleration retains that atomic prerequisite. | The author chooses Kinematics as a required predecessor. |

Passing the graph-interpretation task while one unit card is unverified leaves Dynamics locked. Passing the outstanding hard recall opens Dynamics if all other obligations are satisfied. The learner may already know how to work with forces. That evidence remains available. Conversely, passing Kinematics via the direct exam route never awards mastery of every preparation goal. An individually required acceleration goal can still need work under the applicable Dynamics frontier.

## Find the smallest defensible levels in an existing landscape

Fix the course scope, entry basis, existing assessments, card assignments, allowable placements, budget assumptions and intended progression before comparing decompositions.

1. Start with existing subclusters and trace backwards from each final assessment to identify candidate preparation. Where two exams need the same foundation, assign first acquisition once and retain both dependencies.
2. Run the local terminal, task-coverage, card and budget checks. Inspect each ordinary dead end and each external prerequisite. Enlarge the candidate, move a boundary or report a missing assessment according to the evidence.
3. Try a finer partition. Each new unit needs its own defensible assessment, card scope and time budget. Validate the full course after the split, including a common order for the gates and actual prerequisites. Acyclic atomic routes can still become cyclic when grouped.
4. Call a partition **irreducible under the stated constraints** only if no admissible proper refinement passes. Record the refinements reviewed and any limits of the search. Multiple incomparable partitions may work. Creating new exam tasks or changing budgets changes the design question.

For example, splitting Kinematics into uniform and accelerated motion is defensible if each part has its own worthwhile tested outcome. If the only existing assessment asks learners to distinguish both regimes, the unsplit cluster is the candidate supported by those assessments.

## Acceptance cases for a pilot

| Case | Expected result |
| --- | --- |
| A local branch reaches its only exam across the proposed boundary. | Reject the cut. The last ordinary goal in the local branch is a sink, even if the global route is sound. |
| Two units claim the same acquisition target or cannot resolve the required cards in a shared deck. | Report the conflicting placement or unresolved card selection before enabling the gates. |
| The atomic learning order is $a \to b \to c$. One level owns $a,c$ and another owns $b$. | No whole-level traversal order exists. Move a boundary or retain one unit. |
| A final exam is passed, but a required card has only self-rated practice. | Keep the successor locked and offer the missing hard recall even when its memory goal is implicit. |
| A previously passed card is due again, then fails an explicit retest. | Due status alone leaves the successor open. The failed retest closes the gate for new starts until the card passes again. Keep recorded subject results. |
| One of two predecessors is unfinished. The learner already passed the successor's exam elsewhere. | Keep the successor locked. Reuse the valid result once both predecessors are cleared. |
| A goal in an open level still needs an unmastered atomic prerequisite. | Show the missing preparation under the applicable frontier. Opening the level does not establish that competency. |

A first pilot can apply these cases to a single reviewed course view and publish its proposed cuts, unresolved card assignments and missing effort estimates. That gives subject reviewers a concrete partition to accept or revise before a learner-facing gate is introduced.
