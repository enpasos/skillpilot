# Independent retirement review A — final-head supplement

**Reviewer model: gpt-6.1-sol. Reviewed head: `048683d361d2b559240a279d86a3a5562402899e`. Base: `3e6af47aec2f7f3046c316e8d4981858b943c4a6`. Date: 25 November 2026.**

This is my original independent update after reading the author's 02:40 and 02:45 handovers and inspecting the correction commits. I did not read another reviewer's answer or delegate. My first answer, `/tmp/retirement-A-20261125.md`, remains unchanged (SHA-256 `23b6d68650890d528785881251a584861ec5af99042f6256d18121b7984573e6`). This supplement updates its verdict for the final head; it does not rewrite what I originally said.

The final evidence bindings are:

| File | SHA-256 |
|---|---|
| `curricula/DE/Gymnasium/quality/assessment-review/physik/e1-mixed-exam-retirement-20261125-v1/retirement.actual.json` | `d6581ded47b48a278cc78dd397bab1b582f692e0136b49d03a825f975b651ef4` |
| `curricula/DE/Gymnasium/quality/assessment-review/physik/e1-mixed-exam-retirement-20261125-v1/follow-up-checks.actual.json` | `824638dec80ad33000171fe22c8f68d5d7e625857a58efce24c728b0d6794f36` |

**Final content/code verdict: APPROVE. Required implementation/documentation corrections remaining: none.** The requested central test runs remain a separate prerequisite for acceptance/integration; I do not claim those runs as my own. One nonblocking test-coverage recommendation remains: exercise this retired-active-goal case through the public coach tool with the pilot explicitly off, as well as the committed service-level pilot-off and public-tool pilot-on tests.

I correct one overbroad statement in my first answer: the old read path did omit `focusedUnitContext` when a stored active goal was invisible. My earlier unqualified Q5 “no functional defect” conclusion did not catch that guard. The final head fixes the fault, and I have now inspected that exact path and its regressions.

For compact citations, `evidence/` below means `curricula/DE/Gymnasium/quality/assessment-review/physik/e1-mixed-exam-retirement-20261125-v1/`; `catalog` means `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`. Line numbers refer to the final reviewed head.

## Findings and resolved corrections

- **Resolved: stored-plan guarantee.** `evidence/README.md:61`–64 and `retirement.actual.json:953` now correctly distinguish a plan with remaining valid work from a plan containing only the retired exam. The latter remains unchanged in storage and stale. This agrees with `LearnerLearningPlanService.java:2753`–2786, the integration assertions for the empty remainder, and the standing decision in `AGENTS.md:698`–709. My required correction R1 is closed.
- **Resolved: pilot qualification.** `evidence/README.md:41`–46 now states that there is no single parent closing exam, A–D form the assignment only in the six contract views when the pilot is enabled, and they remain ordinary child-unit exams otherwise. `AGENTS.md:739` and `CLAUDE.md:84` carry the same distinction. The pilot defaults off; the material covers eight views, of which six have this contract. No universal assignment availability is claimed.
- **Resolved: stale current route report.** The refreshed `docs/qa-ci/status/route-endpoint-visibility-audit.json` no longer contains the retired UUID. Its header explicitly identifies a diagnostic, not an acceptance gate. Its non-Physics diagnostics must still be reported honestly; this review does not turn its reported exit 1 into a pass. The Biology/Chemistry catalog/view inputs and evaluator source are unchanged by this package, so those diagnostic findings are not caused by the retirement.
- **Resolved: read-only regression assertions.** The public tool test now asserts that both the persisted active ID and state version survive the read (`ClaudeV1CompletionRouteIntegrationTest.java:289`–300). The production guard uses the visible resolved active goal (`LearnerService.java:9387`–9395).
- **Nonblocking evidence limit:** that public-tool case still runs in a class with `unit-assessment-pilot-enabled=true` (`ClaudeV1CompletionRouteIntegrationTest.java:50`–54). The service regression runs under the default pilot-off configuration. Do not describe the new public-tool regression itself as a pilot-off test. The shared production guard has no pilot conditional, and I found no remaining code defect in the off path; an explicit public-tool off variant would protect the complete observed path against future regressions.

## 1. **Claims.** For each of the four `coveredGoalIds`: does the released task test the goal as its description states? My findings are in `reason.claims`. Is there a performance the exam really checks that no other active exam checks in some Land?

**Verdict: PASS on retirement.** The task, solution, rubric, prerequisites and four coverage claims are unchanged from the initially reviewed commit. My content conclusions therefore stand:

- `09029573`: no experiment, graphical free-fall evaluation, own determination of g or law with evidenced initial conditions; given h and g followed by a fall-time/speed calculation does not test the stated experimental competence (`catalog:8705`; `evidence/goal.after.json:51`).
- `4a2bf015`: one legitimate stopping-distance calculation/comparison, but a partial, skippable performance rather than proof of the full goal (`catalog:8167`; snapshot scoring at 53–76).
- `ac25ffe3`: no implemented spreadsheet, finite-step recurrence, parameter variation or step-size interpretation (`catalog:11658`).
- `230345f3`: no complete cluster evidence. The cluster contains both the motion-law goal and experimental free-fall goal; calculations touch fragments of the former and do not establish the latter (`catalog:6030`–6033).

Every 6/7/6/6-point step can be omitted while still reaching 15/25. The snapshot's task/solution and scoring, rather than its coverage array, establish that fact. No unique real component performance lost was identified: other active tasks retain the motion-data/acceleration calculations, constant-g arrival/impact calculations and stopping-distance calculations in the affected views. My original answer names the relevant tasks and their content; all those task bytes and offers are unchanged.

The corrected road-traffic count is **12 with the record's denominator, 13 with a different denominator**. My independent role expansion found:

- the ordinary road-traffic goal is a target in **70** views;
- dedicated exam `dfd2628f` is a target in **13** views in total;
- it is present in **12 of those 70 goal-target views**;
- the thirteenth exam target is **`de-rp-gym-seki-physics`**, where the ordinary goal is not itself a target;
- mixed exam `7c0b94b9` is a target in **64 of the 70**; the union of the dedicated and mixed offers covers all **70** (the sets overlap).

Thus `reason.need` and README “in 12 of them” are correct. The flat `activeExamsAfterTheRetirement[].views: 12` should be interpreted within `viewsWhereTheGoalIsATarget: 70`, not as a global inventory count (`retirement.actual.json:41`–64). This denominator distinction is not an assessment gap introduced by retirement. The remaining mixed exam's whole-goal coverage still needs its own E.2 review; requiring a goal and containing a partial task is not proof of full-goal mastery.

## 2. **Need and fit.** Is retiring right, compared with keeping it as a cross-topic exam or moving it into a unit? The free-fall experiment goal `09029573` has a dedicated exam in Hesse and Saxony only; I state that the retirement changes nothing for the other Länder. Check that.

**Verdict: PASS.** Moving the task unchanged would preserve unsupported coverage claims and compensation across wholly missing domains. There is no established need for another optional cross-topic assessment with this unchanged contract. Retaining the task historically while withdrawing its current offer is appropriate.

My independent count confirms that the free-fall goal is a target in **68** views, and `f41e4e30` is a target in **13** of them: eight Hessian, three Saxon and two national cross-stage views. Its task, own-experiment requirement and HE/SN jurisdiction restriction are unchanged (`catalog:64966`–65022). Spreadsheet goal and dedicated exam occur together in all **68** goal-target views; neither is a target in Baden-Württemberg's relevant views.

The **52** figure is also reproducible: in **52 authored view placements**, the retired exam was the only target-role exam with a direct `requires` edge to `09029573`. This is not “52 previously visible experimental examinations.” It includes **26 GK placements and 26 LK placements**, while the retired exam has the tag GK only. The record separately establishes 64 old target-role placements but only **32 learner-visible GK offers**. Of those, **26 visible offers** were the sole direct-requires offer. None asked for an experiment, so no real experimental proof is lost by withdrawing them. There are **55** of the 68 goal-target views with no remaining direct-requires exam; the difference from 52 reflects cases that already lacked the retired offer. The broad `dd99528a.coveredGoalIds` claim is not a substitute for actual experimental performance.

The record's statement that the other Länder have the same genuine experimental-check gap before and after is sound. It does not claim that this retirement repairs the gap. The follow-up review must decide which routes need a dedicated check.

## 3. **Data delta, by your own script, not by my record.** Catalog: exactly three goals differ, the exam only in `applicability` and `extendedData`. Views: 64 changed, in each only the exam leaves the atomic targets (two emptied structures and the generator follow-ups in the two national Sek II views are named in the record); 26 byte-identical. Material: only `/unit/assessmentGoalId` removed. Semantic kinds: three fingerprints. Generator inputs: four membership lists and the Hessian placement table.

**Verdict: PASS.** I reran my own Git-object comparison at the final head against the base. The catalog, all 90 Physics views, material and semantic-kind ledger still have exactly the previously established delta: three catalog goals; 64 changed/26 byte-identical views; only this exam removed from atomic targets; every other target and prerequisite-only role unchanged; one material field removed; exactly three semantic fingerprints; four national membership removals and one Hessian placement removal. There is no additional curriculum data change in the two later correction commits. No canonical goal requires the retired exam.

I additionally computed the full atomic learning closure across every canonical subject independently. For each of the 64 changed views I started from atomic targets and atomic prerequisite-only support, followed canonical `requires` across subjects, compared exact sets, and checked the before/after cardinalities in `follow-up-checks.actual.json`. **All 64 matched; every set loses exactly the exam and nothing else.** No Mathematics goal leaves or enters a set. This validates the actual learning-set effect beyond the display-node delta.

The 32 old learner-visible offers are precisely the GK half of the 64 authored target placements. The projection floor now subtracts the named **30 original plus 2 additional Hessian duration pairs** (`app/scripts/testPhysicsAssessmentProjection.ts:538`–540, 788–795), alongside the earlier multiphase retirement. The remaining practice obligations remain pinned. Subtracting all 64 from a learner-visible-pair floor would have been wrong; the final implementation uses the correct 32.

## 4. **Bindings.** Does any test, check, generated report, document or runtime path still depend on the exam being active, or on the old bytes of `he-e1-motion-practice.json`? On #193 a review record outside the evidence family bound the old bytes and only CI found it. Hash-bound records that a CI test compares with current bytes matter most. I routed one such binding through the record (`successor.hessianMaterial` in `testPhysicsGoalBookInputs.ts`); judge whether that is sound.

**Verdict: PASS on the final source/evidence state; complete central suite results remain separate.**

The material bridge remains sound: exact historical predecessor bytes are preserved and hash-bound; the before snapshot equals those bytes; the allowed delta removes exactly the parent closing-exam field; the current file equals the after snapshot; required parts and planning fingerprint stay unchanged (`testPhysicsGoalBookInputs.ts:1736`–1745, 1834–1858; `testHessePhysicsGuidedEntryMaterials.ts:45`–64). It has not been replaced by an unconstrained hash exception.

The later trimming of assertions is appropriate. `testPhysicsGoalBookInputs.ts:1876`–1889 now checks lasting retirement invariants without freezing all later view/catalog/ledger bytes to 25 November. It still checks exclusion, unique historical owner, no current view reference, exact retained exam content/fingerprint, and the material chain. Independent current semantic-kind validation remains responsible for future catalog/ledger consistency. This permits later E.2 work without reclassifying historical evidence as a permanent source freeze.

The **compact Mathematics witness record is sufficient**. My own checks establish:

- only **48 of 63** current Physics-source pin values change;
- every one of the 63 final pins matches the exact final Git bytes;
- all **1,036 demand rows**, their **69 Mathematics view keys**, and their **47 Mathematics goal identities** are unchanged from the base;
- every row's consumer survives at its recorded authored structure path, and every edge of every recorded `requiresPath` is still a real canonical edge;
- none of those row consumers is the retired exam.

The existing live test additionally derives each row's earliest consumer, its location and every edge from current inputs (`scripts/test_mathematics_stage_views.py:383`–408). With unchanged canonical prerequisites, unchanged rows, current pins, preserved recorded consumer paths and this deterministic checker, duplicating tens of thousands of lines of witness lists would add no new assurance. The compact record's exact policy hash and the separately recorded test run are the useful evidence. Its `testOutputSha256` alone is not my claim to have executed that test.

`testHessePhysicsMemoryUi.ts:17`–25 correctly asserts that the shipped parent has no closing exam, then supplies `5773ccbe` only as a fixture binding to retain the test of cross-board assessment navigation. It does not pretend that the shipped E.1 material still names an exam.

The refreshed diagnostic route audit no longer depends on this exam being active. The managed authoritative projection still fails closed rather than falling back to every canonical goal when a view cannot resolve (`LearnerService.java:12899`–12913, 12934–12937). Retained historical source assignments and old material hashes remain history; they do not re-offer the exam.

## 5. **Stored data and coach.** Passes, plans, active goal and focus that name the exam. The E.1 parent now offers no closing exam in the coach context (only unit card practice; the child unit "Freier Fall schwerer Kugeln" still offers its own exam). Is anything lost for a learner, with the unit-assignment pilot off?

**Verdict: PASS on implementation, including the common pilot-off service path; public-tool off coverage is qualified below.**

The new guard is the right repair. `getCoachActiveGoalContext` already resolves the stored active ID against current visible goals. Its no-active-goal branch now uses **`activeId == null`**, rather than testing whether the stored string is blank (`LearnerService.java:9387`–9395). An invisible retired ID therefore cannot suppress the focused unit's introduction and activities. Explicit requests for that retired goal still return no context. Valid active goals are still checked against current targets; the fix does not authorize a stale assessment or alter learner data.

The service regression checks this for G8 and G9, compares the resulting introduction and activities with ordinary no-active-goal context, and rejects explicit retired-goal context (`LearnerPlanningScopeServiceTest.java:471`–480). The class uses default application configuration, which leaves the unit-assignment pilot off. The public tool regression checks no active goal, present focused-unit context, no retired ID/title in the response, and unchanged stored ID/state version (`ClaudeV1CompletionRouteIntegrationTest.java:289`–300). **That public-tool class enables the pilot**, so this is service-off plus public-tool-on coverage, not a committed public-tool-off regression. The same unconditional service guard is used through `CoachToolFacade.java:183`–187 and `ClaudeV1CoachContextProjector.java:286`–293. I found no remaining pilot-off logic fault, but recommend a public-tool off variant or a separately recorded public-tool off probe before describing that exact end-to-end case as tested.

The standing guarantees remain intact: passes stay with their original identity; no ordinary mastery is written or transferred; stored plan blocks remain unchanged; only the effective current plan omits retired entries; a retired-only plan stays stale; new plans reject the exam; invalid focus IDs do not become executable targets and valid current focus/default selection remains available. Parent unit activities contain card practice, and the child still has its own current exam.

With the pilot off, A–D remain ordinary child-unit examinations; the special assignment/planning-credit route is not available merely because the material contains a contract. The final documentation now says exactly that. The removal of this unsound parent mixed exam does not remove those tasks or a genuine unique proof. No forced Cockpit handoff or replacement mastery is introduced by the retirement or the read repair.

## 6. **Runs in your own clean checkout of `a6117075c1`:** the complete job "Application frontend CI" in workflow order, `test:physics-assessment-projection`, `test:physics-goal-book-inputs`, `check:learning-unit-assessments`, and the backend classes `ClaudeV1CompletionRouteIntegrationTest`, `ExamLearningScopeIntegrationTest`, `LearnerPlanningScopeServiceTest`, `LearnerServiceTest`, `UnitLearningMaterialServiceTest`, `CompositionViewServiceTest`. I ran the adapted tests and the generator checks; a chain of 19 curriculum checks with regenerated status files is still running here, so the status files under `docs/qa-ci/status/` are not yet in the commit.

**Verdict: NOT RUN BY REVIEWER A; central execution evidence pending/separate.** I was explicitly assigned source/data review while the parent runs the requested suites. I have not duplicated or claimed the frontend job, npm checks, Python test suite or backend classes. The author-reported runs are also not my own.

My independent Git-object data comparisons, exact current source-pin and unchanged witness-row/edge/path checks, all 64 learning-set comparisons, record binding checks and code inspection are the basis for this approval. Scratch aids are `/tmp/retirement-A-final-head-checks.py` and `/tmp/retirement-A-final-head-delta.py`, with corresponding `.out` files. They read the final pinned commit; they do not modify the repository.

**Required corrections: none. Remaining limits:** requested central runs must be recorded on the final head; any expected diagnostic exit must remain explicit; a public-tool pilot-off variant is recommended but is not a remaining production-code defect identified by this review. Merge and fresh successful main CI remain required before marking the delivery complete.
