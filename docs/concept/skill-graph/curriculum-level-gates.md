# Curriculum levels with completion gates

A learner finishes a unit such as Kinematics, demonstrates independent performance on its assessment tasks and recalls its required cards. Completing the unit can open Dynamics. Several units can open at once, and a later unit can bring two branches back together.

This is an **optional design profile** for a [curriculum level](curriculum-levels.md). It specifies what a course would have to declare and validate before it could offer that progression. The current planning profile in [Graph Definition §12](graph-definition.md#12-optional-curriculum-level-assignments) permits learners to work across stage boundaries. Whole-level access gates would require an explicit course mode and backend support.

**Product decision, 1 November 2026:** an entry gate uses the existing complete level result. Passing the level's local assessments and card goals does not supply a separate entry qualification while some of its targets remain needed in the full Personal Curriculum. The profile does not introduce another stored goal outcome.

## Give a cluster a role in one plan

Declare the level role on a **cluster placement in a resolved, versioned course plan**. Reuse the existing `contains` structure. For example, a Physics course can designate the Kinematics placement as one level. Another course can choose two of its subclusters as separate levels. Both plans use the same canonical learning goals.

| Plan information | Meaning |
| --- | --- |
| Level placement | Identifies the cluster or structural section in the authoritative composition view. |
| Acquisition targets $T_L$ | Collect the unique, applicable atomic targets below that placement, including its assessment and memorization goals. Resolve choices, direct entries and projection roles using the existing view rules. |
| Final assessments $Q_L$ | Identify the authoritative final-assessment targets in the unit. At least one is required. Their tasks must examine the independent performance claimed for this unit. Several task variants of one assessment remain one goal. |
| Required cards $C_L$ | Resolve the cards of the level's selected memorization targets from the authoritative deck and selection for each goal. These bindings explain those goals' existing mastery contract; they do not create an additional course-specific pass. Record the reviewed card scope for this revision. |
| Predecessor levels $P_L$ | Name the placements whose completion is required to enter this level. The proposed plan relation is called `requiresLevel` below. |

Each acquisition target has exactly one home level in a complete decomposition of the selected course. A shared prerequisite keeps its original identity and home when later units use it. Multiple `contains` parents, nested clusters or overlapping views must resolve to unambiguous acquisition ownership. If two selected placements claim the same target, refine the placements or resolve the scope before accepting the plan. A larger stage may still aggregate several playable levels for reporting.

Keep membership in the [authoritative view](view-projection-and-goal-placement.md). A card belongs with the level that teaches the knowledge it tests. Compare the union of the home card sets against the full required card inventory of the resolved course. Report omissions and duplicate acquisition assignments. Distinct memorization goals may select disjoint cards from a shared deck. If one existing goal owns cards that two levels would need for first acquisition, keep it in one unit or revise the goal and its card bindings before accepting the split. Moving a card across goal identities requires an explicit evidence-migration decision. Later review can reuse the original binding. An unresolved deck or missing card fails validation. A unit with no material requiring memorization may declare a reviewed empty card set.

## Test whether the cluster can serve as a level

1. **Walk every local route in learning direction.** Form the level's finite directed graph of subject-learning routes. Use the applicable [atomic route contract](graph-definition.md#85-didactic-route-coverage-motivation-to-autonomy), follow its direct atomic `requires` edges in reverse and retain edges with both endpoints in the level. Include every ordinary subject target, including isolated ones, and its final assessments. Retain orientation and memorization nodes where they participate in those routes; separately selected card-only branches retain their own memory-goal obligations. Every maximal path must end at a local final assessment. Equivalently, every sink of this acyclic route graph belongs to $Q_L$. Each designated endpoint must be a local sink reached from at least one ordinary subject target in the same unit. An isolated exam or a deck alone cannot constitute a playable unit. Later reuse outside the level is allowed. This local route graph is an authoring check, never a separate runtime completion context.
2. **Check what the assessments actually test.** A reviewer maps each claimed performance to a task or grading criterion and checks that the required cards cover the facts assigned to the unit. A path proves reachability. A task that asks only for a definition cannot substantiate a claim that learners can interpret an unfamiliar motion diagram.
3. **Exhibit a teachable order.** Resolve the full effective prerequisites, including inherited, cluster, hidden and cross-subject requirements. Outside preparation must come from the explicit entry basis or be acquired earlier. Check that a reference learner can traverse each level in turn using the §12 frontier witness, without relying on exam shortcuts or assumed waivers. The witness order must respect every declared level gate. An unmet or unassigned prerequisite is reported even when it is invisible in the level's display.
4. **Check the budget.** Estimate acquisition, practice, card work and assessment under the stated entry and teaching conditions. Work plus reserve must fit the available time, including binding subject budgets. Goal count and goal weight cannot supply that estimate. A candidate can pass the structural checks while its time feasibility remains open.

## Separate evidence, completion and entry

Let $H$ be the authoritative completion context of the **complete committed Personal Curriculum**, with targets $T$, existing mastered goals $E$ and derived implicit set $I_H$. Compute that set once under [assessment-gated completion](assessment-gated-completion.md), including inherited, cluster, hidden and cross-subject requirements. A level supplies a target mask $T_L\subseteq T$ over this same result:

$$
Completed(L) \iff T_L\subseteq E\cup I_H.
$$

Every selected assessment and memorization target remains required until its ordinary authoritative mastery is present. Neither kind is ever implicitly completed. In particular, $Q_L\subseteq T_L\cap E$ is necessary. Selected assessments outside $Q_L$ also retain their normal obligations; naming local final assessments cannot remove another selected goal. Cards in $C_L$ belong to selected memory targets. Their existing [memorization resolver](node-types.md#memorize) supplies the one binary goal result. The Cockpit and coach explain an open memory goal by its outstanding cards and offer its normal hard-recall workflow. Self-rated practice or an empty SRS queue does not substitute for verified recall. The gate adds no card-specific qualification to valid goal mastery.

Protected support must be distinguished from selected obligations. With protected goals $P_H$ and complete targets $T$, only $P_H\cap T$ seeds independent demand. A hidden supporting assessment or memory goal is never implicitly completed, but it stops carrying demand when no unfinished selected obligation needs it. Its missing mastery does not then become an additional level gate. If a course actually requires that goal independently, its target role must be declared in the authoritative scope. Neither prerequisite reachability nor card alignment tags make that selection.

The [memory contract's documented due/mastery discrepancy](node-types.md#due-and-mastery-semantics) needs separate reconciliation. The current resolver uses verified recall, and renewed SRS due status alone does not remove its mastery. This gate profile follows the authoritative goal result and does not evaluate the due queue again. A failed hard retest can change the result through the normal memory workflow; a gate cannot invent a second due-dependent mastery rule.

Define `requiresLevel(B, A)` to mean that **A must be complete before B can be entered**. This is an explicitly authored relation among level placements in this course. A subject prerequisite between two atomic goals can suggest a boundary for review. It does not by itself justify making the whole earlier unit compulsory. Using ordinary `requires` on the cluster would also transmit that requirement to its descendants under the graph's inheritance rules.

For an acyclic level graph, evaluate in predecessor order:

$$
Open(L) = \bigwedge_{A\in P_L} Cleared(A),\qquad
Cleared(L) = Open(L) \land Completed(L).
$$

A root level is open. With multiple predecessors all must be cleared. Prior valid mastery counts immediately for `Completed(L)`, even while the level is locked; `Cleared(L)` additionally requires `Open(L)`. It cannot bypass an unfinished predecessor to open a third level. Clearing a level satisfies one entry requirement of each successor. Its goals and any prerequisites whose work was waived keep their own mastery results.

Within an open level, ordinary goals keep their applicable frontier rules. A learner may attempt a final assessment directly even with unfinished preparation. In the proposed gated course, a locked level is visible with its missing predecessors, and starting any of its activities, including a direct exam attempt, waits for entry. This would deliberately narrow the current direct-assessment offer **in this course mode only**. The Cockpit, coach, direct links and resume paths would need the same authoritative entry and continuation policy described below. A temporary display filter cannot turn this policy on. Re-evaluate a new start against the same course revision and evidence snapshot used for entry.

Bind a gate evaluation to the course/view and curriculum revisions, complete Personal Curriculum, and authoritative learner-state snapshot. Changes to those inputs recalculate dependent gates in predecessor order; `Completed`, `Open` and `Cleared` are derived values, not stored results. Existing valid mastery counts immediately. A revised task does not demand a fresh course-specific pass, and a failed ordinary exam attempt does not by itself erase earlier mastery. Only the normal authoritative goal workflow may correct its result.

Closing a predecessor blocks **new** starts in its successors. A valid already active goal may finish, including a resumed attempt still bound to that same goal and contract; the gate must not silently discard the attempt or redirect the learner. A new attempt or goal selection uses the current gate snapshot. If the goal, contract or session binding no longer resolves, explain the changed context and require an explicit new selection. A plan revision must not silently widen scope or migrate goal/card evidence. All supported clients must apply the same distinction between continuing a bound attempt and starting another.

## Worked example in upper-secondary Physics

The existing German Physics landscape already contains a useful candidate. The free-fall investigation goal requires the goals for uniformly accelerated motion and for investigating motion with diagrams. In the shared E-phase mechanics deck, cards `physics_e_cov_007`, `physics_e_cov_009` and `physics_e_cov_010` point to those three goals through alignment tags. These tags can seed a card review. They establish neither prerequisites nor a complete Kinematics card inventory. See the [canonical Physics graph](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json) and the [E-phase mechanics deck](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json).

The proposed unit boundary, example task and entry gate below illustrate the design. Workload and assessment coverage would still need review for the selected course.

| Unit | Work and evidence | Progression |
| --- | --- | --- |
| Kinematics | Local routes through uniform and accelerated motion converge on a final assessment. Given an unfamiliar velocity–time graph, interpret the motion, derive acceleration from its slope and displacement from its signed area. Required cards check definitions and units for velocity and acceleration. | Entry level under the stated starting assumptions. |
| Dynamics | Use forces to explain changes of motion. A goal that actually needs acceleration retains that atomic prerequisite. | The author chooses Kinematics as a required predecessor. |

Passing the graph-interpretation task while a selected memory goal still lacks required hard recall leaves Dynamics locked. Passing that recall opens Dynamics only if all other Kinematics targets are explicitly or implicitly complete in the **full** Personal Curriculum. The learner may already know how to work with forces; that evidence remains available.

Suppose the Kinematics assessment and an unfinished Dynamics assessment both directly require an acceleration goal. Passing only the Kinematics assessment leaves acceleration needed by Dynamics. If acceleration is still unmastered, Kinematics is not yet fully complete and Dynamics stays locked. The learner can finish that preparation in the open Kinematics level. A local calculation that ignored the later Dynamics consumer would incorrectly open the gate. Direct exam success never writes mastery to preparation goals or overrides this shared demand.

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
| A cluster contains only an assessment or only cards. | Reject it as a playable level. A unit needs a local subject route and an assessment of its outcome. |
| A local branch reaches its only exam across the proposed boundary. | Reject the cut. The last ordinary goal in the local branch is a sink, even if the global route is sound. |
| Two units claim the same acquisition target or cannot resolve the required cards in a shared deck. | Report the conflicting placement or unresolved card selection before enabling the gates. |
| The atomic learning order is $a \to b \to c$. One level owns $a,c$ and another owns $b$. | No whole-level traversal order exists. Move a boundary or retain one unit. |
| A final exam is passed, but a selected memory goal has a required card with only self-rated practice. | The memory goal remains open; it is never implicit. Keep the successor locked and offer its normal hard recall. |
| A selected assessment is mastered while its hidden protected support remains unmastered and has no other unfinished consumer. | Do not invent another gate obligation. The support remains unmastered and never implicit; selected target completion can still hold. |
| An unfinished selected later assessment directly needs an unmastered preparation target from the earlier level, whose local exam is already passed. | Keep that preparation target and the earlier level incomplete. Do not run a local completion fixed point without the later consumer. |
| A previously passed card is due again, then fails an explicit retest. | Follow the normal memory resolver. Mere due status does not currently reopen mastery; an authoritative loss of mastery closes gates for new starts. Preserve other valid goal results. |
| One of two predecessors is unfinished. The learner already passed the successor's exam elsewhere. | Keep the successor locked. Reuse the valid result once both predecessors are cleared. |
| A goal in an open level still needs an unmastered atomic prerequisite. | Show the missing preparation under the applicable frontier. Opening the level does not establish that competency. |
| A predecessor reopens while a successor attempt is already active. | Block new successor starts; allow the still-valid bound attempt to finish or resume under the same contract. Do not silently change the active goal. |
| A changed full Personal Curriculum adds a consumer of earlier preparation. | Recalculate implicit completion and all affected gates from the new full context; retain mastery and explain any newly needed work. |

A first pilot can apply these cases to a single reviewed course view and publish its proposed cuts, unresolved card assignments and missing effort estimates. That gives subject reviewers a concrete partition to accept or revise before a learner-facing gate is introduced.
