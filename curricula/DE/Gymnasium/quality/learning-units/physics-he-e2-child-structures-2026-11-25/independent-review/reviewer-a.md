# Independent review A — E.2 child structures

Reviewed exactly `948f2a419d..a88f17523bbafd63a5b3d98b48cc3c8e8b6ed24d` for task D, using the seven questions in the handover of 25 November 2026, 09:08 CET. Read-only review; no product edits, commits, full checkout or full frontend run. I did not read another review or coordinate with reviewer B. The author's record was a claim to verify, not measurement evidence.

**Overall verdict: ACCEPT for the bounded grouping step, with the qualifications below. No required correction to this diff found.** This does not certify the deferred goals, independent child assessments, opening goals, teaching material or an E.2 unit contract. A false premise in question 3 and the live-focus consequences in question 5 need to remain explicit in the delivery report.

All repository line references below refer to the reviewed head. Personal measurement sources and results are in `reviewer-a/measure.py`, `reviewer-a/measurement.actual.json`, `reviewer-a/map-probe.mts` and `reviewer-a/map-probe.actual.json` beside this review.

## 1. Roles and learning sets — PASS

My Python script calls the generator's actual `role_atoms(view)` separately on the base and head bytes, then follows `requires` through the complete canonical goal universe, without applicability filtering. The implementation of role priority and atomic expansion is `scripts/generate_hessen_physics_stage_views.py:174`–193. The canonical catalog is byte-identical between the two commits, so the same complete goal universe applies to both inputs.

| View file | Targets before = after | Prerequisite-only before = after | Learning set before = after |
|---|---:|---:|---:|
| de-he-gk.view.json | 591 | 1076 | 1667 |
| de-he-gk-g8.view.json | 591 | 1076 | 1667 |
| de-he-gk-g9.view.json | 591 | 1076 | 1667 |
| de-he-lk.view.json | 614 | 1053 | 1667 |
| de-he-lk-g8.view.json | 614 | 1053 | 1667 |
| de-he-lk-g9.view.json | 614 | 1053 | 1667 |
| de-he-sekii-gk.view.json | 475 | 1097 | 1572 |
| de-he-sekii-lk.view.json | 493 | 1079 | 1572 |

Every set difference is empty, rather than merely having the same cardinality. There are 90 Physics view files in the pinned tree: exactly these eight change, and the other 82 compare equal as raw bytes. This independently confirms `regrouping.actual.json:231`–325 and README lines 31–35. The authoring function moves existing references and fails on unexpected leftover non-exam content (`scripts/generate_hessen_physics_stage_views.py:626`–669); it does not create goals or prerequisites.

## 2. Order among the six structures — PASS

For every changed view I independently built child ownership from atomic targets, enumerated cross-child direct prerequisites, computed their transitive reduction, and searched every complete prerequisite chain for a dependency on a later displayed child. The six declared pairs equal that reduction in all eight views. Each has a direct witness:

| Later child | Earlier child | Direct witness, dependent → prerequisite |
|---|---|---|
| force-mass-acceleration | inertia | a94cfe1c → 31a2ef52 |
| force-and-counterforce | force-mass-acceleration | ad984bb6 → a94cfe1c |
| several-forces | force-mass-acceleration | 5fd45dbc → 5f289cdc |
| energy | force-mass-acceleration | c1c71daa → 5f289cdc |
| momentum | force-and-counterforce | 839ecc8f → a0aaedcb |
| momentum | energy | 0da13365 → 91c49019 |

No declared pair is redundant or missing for this demand. There is no reverse chain. The actual declarations are in `curricula/DE/Gymnasium/composition-views/physik/de-he-gk-g9.view.json:1706`–1732, with the same six pairs in the other seven views. The current map projection has six declared child arrows and no backflow on the E.2 board; its other eight arrows go into the four exams. The own before/after map probe has zero map findings in all eight views.

The phrase “exactly the demand” is correct when understood as the **transitive reduction**, not the complete unreduced list of atomic edges. For example, momentum also directly needs a goal in force-mass-acceleration, whose child-order path is already covered via force-and-counterforce.

Validation distinction: `validate:composition-views` checks the authored child-order structure, endpoint identity, acyclicity and redundancy through `app/src/utils/authoring/compositionViewAuthoring.ts:35`–74 and :446–451. Its success alone is not a proof that all actual demand is covered; the independent enumeration and real map projection provide that part of this answer. The validator run result is recorded under “Checks” below.

## 3. Members and instructional placement — ACCEPT for step 1; false prerequisite premise in question 3

The six membership sets fit the current goal texts. Inertial frames belong with inertia: the goal defines and distinguishes inertial and non-inertial frames and requires the first axiom (`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json:9445`–9459). The two second-axiom goals and two third-axiom goals form coherent pairs (:9259, :9321, :9383, :9556). Energy accounting, including conversion by friction, belongs together: `253a71d2` describes conversion of mechanical into internal energy and requires energy conservation (:9920–9933), rather than a force-coefficient calculation.

Traffic is reasonably grouped with friction as an application context, and the displayed order is friction then traffic (`de-he-gk-g9.view.json:1604`–1618). **However, question 3's statement “traffic requires friction” is false on both pinned commits.** `4a2bf015.requires` names accelerated motion and two Mathematics goals, with neither a direct nor a transitive friction prerequisite (`DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json:8179`–8182). Thus the learner may reach traffic without mastering friction. The changed frontend assertion checks display membership/order only (`app/scripts/testHessePhysicsFlashcardActions.ts:243`–253), and does not prove prerequisite enforcement. I do not request adding an edge in this grouping-only cut: that requires the deferred goal/assessment review to establish whether friction is necessary for the actual required task. No reviewed README or AGENTS paragraph falsely says that this edge exists.

The title of child 4 mentions the inclined plane, but its present two goals do not establish independent force decomposition or force balance on that plane. That is an explicitly documented incompleteness, not newly delivered coverage (README:49–52; `AGENTS.md:796`–799). Likewise the current second axiom still includes momentum and d/dt language (:9259–9273); this cut does not yet implement the narrower formulation promised for step 2.

The two advanced endpoints are genuinely at the end of momentum: `d30fd37b` requires elastic collisions (:10288–10302), while `f524f05c` requires the applied second/third axioms plus integration and vector addition (:10623–10641). Their physical placement is `de-he-lk-g9.view.json:1826`–1833. In GK, `f524f05c` remains an explicit prerequisite-only reference outside the children (`de-he-gk-g9.view.json:1547`–1550). The existing E.5 LK exam requires `f524f05c` (:34484–34501), and two mixed E.2 exams require centre-of-mass collisions (:7280–7297 and :34261–34283). Keeping those endpoints in the Einführungsphase until the stated successor work preserves the existing graph rather than pretending the accepted final cut is complete.

The four mixed exams remain directly after the six children (`de-he-gk-g9.view.json:1688`–1704). Their requirements span the children, so retaining them at parent level is appropriate for this step. None becomes a newly certified closing exam of one child.

## 4. E.5 and existing examinations — PASS

The moved chain is coherent: gravitation law → gravitation potential → potential energy, followed by the advanced energy-conservation derivation which needs that potential and earlier E.2 energy/inertial-system knowledge (`DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json:12036`–12110, :9860–9873, :10551–10572). These are E.5 acquisitions after E.2, without a return demand: I found **zero** E.2-target → E.5-target prerequisite pairs, direct or transitive, in all eight views.

No canonical goal, edge, exam task or rubric changed. The E.5 exam references and all projection-role sets are preserved. Therefore the canonical prerequisite-reachable set and its target/support membership are identical for each existing E.5 exam. My complete closures, including the exam itself, contain 90 goals for `1b432223`, 114 for `7e0308d8`, and 146 for `8a1d4093`, unchanged. The latter still explicitly requires both advanced conservation goals (:34497–34501). Moving their learning places does not change these reachable sets.

## 5. Stored learner data and visible behavior — ACCEPT, with distinct preservation boundaries

The only backend change in this diff is a test. Existing-plan retention remains the already implemented pair rule: a block may keep a still-valid subject atom captured under exactly its old set of section foci (`backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:5082`–5128). The new regression constructs such an old E.2 block, verifies current read and backup restore, completes other work, and checks that a moved goal is offered next (`ClaudeV1CompletionRouteIntegrationTest.java:1969`–2018). It covers GK/LK. It is not itself a new off/on pilot matrix and does not exercise stored active-goal reconciliation; those should not be claimed as coverage of this added test.

My own pinned before/after frontend projection probe shows, across all eight views:

- The E.2 board changes from 30 direct entries in GK / 31 in LK to **10: six child areas plus four exams**. The Cockpit navigation projection has the same six nested structures and four direct exams. Atomic descendants remain reachable through their children. The four relocated goals are reached under E.5.
- The E.2 E-phase flashcard action narrows with the current hierarchy: **24 → 20 cards in GK and 25 → 21 in LK**. The four displaced card IDs are `physics_e_cov_027`, `_049`, `_050`, `_051`. The six children gain their own actions: 4/2/3/2/6/5 cards in GK and 4/2/3/2/6/6 in LK. Child counts may overlap because a card can have multiple understanding goals. No card state or verification result is changed; only context membership changes. This follows the actual action code at `app/src/components/learningUnitMap/unitLearningMaterialActions.ts:57`–98, which includes atomic descendants at every depth and needs no material file.
- The stable E.2 synthetic focus ID remains valid. Its **live** scope is its new descendants, not the captured membership of an old plan. Focus resolution deliberately uses the current composition section (`LearnerService.java:3987`–4058, :4083–4101). Consequently gravitation is no longer offered by an ordinary E.2 focus once the current E.2 work is complete; an old plan can still offer it through its preserved captured atoms and the own-goal focus fallback. These are distinct contracts.
- A stored active moved goal is still a current subject target, but if its stored ordinary focus is E.2 it is now outside that focus. The unified-state builder omits such an active goal from the returned state and its mutating reconciliation can clear the pointer (`LearnerService.java:10119`–10175); explicit focus/personalization revalidation also has an out-of-scope branch (:7456–7485). This is a real consequence of the cut, **not evidence that mastery is lost**. An active moved goal with a matching E.5/own-goal/followed-plan scope does not become invalid merely because its goal ID moved. I audited these branches; I did not independently execute backend lifecycle probes.
- An active ordinary E.2 content goal now gains the child title in its coach unit path, because paths come from current view ancestry (`LearnerService.java:9504`–9510, :9543–9554). With no active goal, E.2 receives no material introduction: the focused-unit enrichment requires a material (:9513–9523), while `curricula/unit-learning-materials.json:3`–6 lists E.1 files only. Card context and card-step facts have a separate hierarchy-based path (:2899–2981), so absence of an introduction does not imply absence of card work.
- Turning the unit pilot on does not invent six declared E.2 learning units, introductions, assignments or child assessment contracts. Those need real material/bindings (`LearnerService.java:781`–800). Ordinary goal paths and hierarchy-based card context remain applicable with the pilot off or on; global E.1 planning credits can still differ by setting. No E.2 contract behavior should be attributed to this diff.

These frontend measurements use the actual shared projection/map/card-action functions and the pinned views, rather than manually counting JSON children. Like the shipped frontend regression, the probe directly applies the authored view; it does not add a particular learner's saved filters or card states. Card counts therefore describe the action's selectable context, not that learner's released or due-card count. These are projection evidence, not screenshots or a browser interaction acceptance. Dynamic backend checks by the main reviewer remain separate evidence.

## 6. Mathematics timing — PASS

I compared parsed config objects from the two commits. After removing only `currentPhysicsSourcePins`, the remaining objects are exactly equal, including **all 1,036 demand rows** and their placement/consumer paths. Exactly six pin values change, at `app/scripts/config/math-foreign-acquisition-demand.json:29`–36: GK/LK G8, GK/LK G9, and SekII GK/LK. All current source pins match the actual pinned head file bytes. The non-duration GK/LK view files are not in this pin inventory, so eight changed Physics files and six changed config pins are consistent.

I independently ran `python3 -B scripts/test_mathematics_stage_views.py`: **33 tests pass**. Thus this cut updates source bindings without changing the Mathematics acquisition schedule.

## 7. Record and rule text — PASS with the scope qualifications above

The record's alternative base is legitimate: `git rev-parse ae04d42ef9:curricula` equals `git rev-parse 948f2a419d:curricula`. It is not an attempt to conceal a different curriculum baseline. Its target/support/learning counts, changed-view inventory, byte hashes and six reduced child-order witnesses agree with my independently computed data (`regrouping.actual.json:4`, :160–229, :231–325).

The README explicitly calls these view structures with no declared learning units/material/assessment contract (:24–25), and lists the missing content and subsequent checks (:42–52). `AGENTS.md:781`–800 agrees and does not claim the deferred final teaching sequence has already been completed. The record does not claim unchanged E.2-only focus/card membership; its unchanged-set assertion is explicitly for the whole view. No task, card, material or mastery storage changed. The small memory-card-review report change is a structural visible-goal count, not a claim of lost atomic targets.

Non-blocking reporting requirements: retain the false friction-prerequisite premise correction from question 3, distinguish reduced order from all direct atomic demand, and describe live focus/card/active-pointer changes separately from preserved old plans. Neither a green validator nor the new two-case backend test should be enlarged into proof of the entire coach lifecycle or the deferred unit contract.

## Checks run independently

- `python3 -B tmp/e1-handover/reviews/e2-child-structures/reviewer-a/measure.py`: complete pinned comparison, passes; detailed JSON retained.
- `app/node_modules/.bin/tsx tmp/e1-handover/reviews/e2-child-structures/reviewer-a/map-probe.mts`: all eight pinned before/after real projection pairs; zero map findings; detailed JSON retained.
- `python3 -B scripts/test_generate_hessen_physics_stage_views.py`: 19 tests pass (12.382 seconds), including the new eight-view assertion.
- `python3 -B scripts/test_mathematics_stage_views.py`: 33 tests pass (17.741 seconds).
- `npm run validate:composition-views` from `app`: **natural exit 0; 0 errors, 2,576 warnings; 387 composition views; 21 canonical landscapes**. The full warning output was tool-truncated; the observed terminal tail is retained under `raw/reviewer-a/composition-terminal.txt`. A planned stop of the duplicate run found that the process had already finished, so no termination occurred.

I did not rerun backend tests or the complete frontend job, and do not present the author's earlier runs as independent evidence.
