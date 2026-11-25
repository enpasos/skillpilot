# Independent reviewer A — existing learning plans after regrouping

Reviewed commit: `77e994d22274596fb010ac2abd5ade71abfff8a2`.
Compared with: `b784ed837a`.
Reviewer: Codex, configured model `gpt-6.1-sol`, reasoning effort `ultra` (configuration confirmed by the coordinating agent).
Date: 25 November 2026, Europe/Berlin.

This is my independent source review. I read the Task C instructions and the inspected commit through `git show`, `git diff` and `git grep`. I did not read another review, change tracked source, check out the branch, or run exploits. I did not run backend tests; the coordinating agent is separately running ordinary product checks. References below are file and line numbers at the reviewed commit, not at the shared working-tree head.

**Overall verdict: changes requested.** Retaining captured atoms is the right policy, and the change preserves the important Personal Curriculum and subject boundaries. However, admitting an atom outside a block's current focus invalidates an assumption still used by plan navigation. In addition, the upsert exception applies when a caller authors an entirely different focus, rather than only when the curriculum changed beneath the captured focus. These are plan correctness findings, not a finding that mastery or another subject can be written without authorization.

## Findings, in priority order

### A1 — P2: retained atoms are counted but the ordinary due selector still excludes them

`backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:5093` now permits captured atoms that do not lie below their block focus. But `backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java:2103` still obtains the frontier exclusively for `block.focusGoalIds()`, and `:2144` accepts a scheduled goal only if that frontier contains the goal or an eligible opening for it. Its production frontier supplier is at `:1830`. A goal moved out of E.1 therefore need not enter the candidates, even when it is a reachable, due atom preserved in that E.1 block.

The impact is observable through ordinary plan operations. `firstCandidateAcrossPlans` uses this selector at `:1656`; its broader fallback requires `allowExtra` at `:1661`. `reconcile` calls with `allowExtra=false` at `:1243`, and `automaticResume` also uses that path at `:532`. Consequently a plan can be `stale=false`, have outstanding counted due work, and have no automatic due continuation. Plan details and explicit continuation have a different fallback at `:2007`: they can select an arbitrary eligible goal of the whole personal subject after the captured block yields no candidate. That can bypass the retained atom's original due priority. This fallback is useful for further learning, but does not demonstrate preservation of the captured schedule.

Automatic mastery handoff is different again: `LearnerService.java:10479` builds eligibility from the whole resolved plan scope. `LearningPlanScopeResolver.java:59` includes the retained atoms in that scope, and the handoff can extend a cluster focus at `LearnerService.java:10569`. Thus this review does **not** claim every handoff is blocked. It finds inconsistent eligibility and priority among ordinary resume/status/continuation paths.

Recommendation: derive one effective runtime focus for each captured atom/block, including retained atoms outside the authored section, and use it for both candidate eligibility and the applied transition. An atomic focus is a narrow fallback when the section no longer contains the selected atom. Keep current frontier and unit-opening checks. Add an ordinary regression in which a moved due atom is reachable, current-section work is finished or scheduled later, and an unrelated subject goal is also reachable. Assert the selected goal, focus, today-status capability, reconcile result and explicit continuation, with the pilot on and off. The new test's `nextEligibleGoal != null` assertion at `ClaudeV1CompletionRouteIntegrationTest.java:1802` cannot detect this issue.

### A2 — P2: a newly authored unrelated focus inherits all old atoms' exemption

`LearnerLearningPlanService.java:1451` reads the old blocks, but `:1476` reduces their provenance to a plan-wide set of atom IDs. `LearnerService.java:5094` never asks whether the submitted focus was one of the atom's captured foci. A caller can take an ordinary valid stored plan, change a block's focus to a different valid same-subject atom/section that does not contain its scheduled goals, and save it successfully. Changing block IDs or moving an old atom into a new block does not change that result. This also applies through activation and preview, which share `preparePlan`.

The November decision supports keeping captured work after a curriculum regrouping. It does not require treating a newly authored unrelated focus as a historical regrouping. Such a change can create the execution mismatch in A1 without any curriculum change. It is a narrower integrity issue than growth of the atomic scope: the atom was already authorized, but its newly authored focus-to-atom relationship was not captured before.

Recommendation: on edits, retain an atom outside containment only when it retains a previously captured focus selection. Compare focus identities and atom membership, rather than requiring unchanged block IDs, so harmless renaming/splitting remains possible. A newly selected focus must satisfy current containment; moving the atom into its actual new section still passes normally. If unrestricted re-focusing is intentionally desired, document that separate rule and first make atom-based execution independent of a false section relationship.

## Verdicts on the six questions

### 1. Rule and coverage — PARTIAL; A1/A2 require correction

The policy is correct for unchanged captured selections. Reads go through `LearnerService.java:4583` (retirement filtering), `:4593` (scope normalization), `:4601` (retained focus check), `:4603` (current graph validation), and `:4604` (current prerequisite schedule). Plan details, status, continuation and auto-handoff reuse compatibility, for example `LearnerLearningPlanService.java:1535`, `:1752`, and `LearnerService.java:10413`.

Restoration uses the new overload at `LearnerService.java:14894` and `:14903`. Upsert uses it at `LearnerLearningPlanService.java:1477`. Teacher package activation and preview share this preparation at `:1025` and `:970`, so neither was accidentally left on the strict overload. With no stored plan the retained set is empty (`:1451`), preserving strict new-plan behavior. A genuinely new atom is not exempt (`LearnerService.java:5094`).

Milestone roots still undergo current subject/projection validation (`LearnerService.java:5080`–`:5086`), and do not receive atomic retention. Unit assignments are excluded from `isAtomicLearning` (`backend/src/main/java/com/skillpilot/backend/api/LearnerLearningPlanApi.java:85`); their exact edition/parts validation at `LearnerLearningPlanService.java:1454` is unchanged, and assignment status still matches current options at `:3276`. I found no new weakening of those contracts.

One existing limitation remains outside the new regrouping behavior: directly replaying raw stored blocks containing retired atoms through upsert still reaches `normalizeBlocks` before retirement filtering (`:1469`, `:2220`, `:2287`) and is rejected. Ordinary clients replaying the effective `getPlan` detail receive retirement-filtered blocks (`:1743`) and avoid that case. This is not introduced by this commit; the new import correction does not also change that raw-edit behavior.

### 2. Retained-set boundaries — PARTIAL; atomic scope stays bounded, focus provenance does not

For one upsert, the exemption cannot contain an atom absent from the previous stored plan: it comes solely from `capturedAtomicIds(existingBlocks)` (`LearnerLearningPlanService.java:1476`, `:2702`). A legal added goal becomes captured only after a successful save; removing a goal removes its exemption on the next edit. Block IDs do not confer authority. However, the plan-wide set permits unrelated new block foci and movement between blocks, as A2 describes.

A second subject cannot borrow the exemption: the old plan is looked up by learner and landscape (`:1441`), ordinary atoms must be current subject scope IDs (`:2169`, `:2220`), and the exception independently requires the same landscape (`LearnerService.java:5096`). Changed Personal Curriculum goals outside the target scope fail normalization even if retained.

Imports are signed (`LearnerService.java:14777`), so arbitrary submitted blocks cannot simply self-declare history through this path. The destination's learner curriculum and Personal Curriculum are restored from the signed archive before plan validation (`:14824`–`:14825`); an import into an account currently using another Personal Curriculum therefore validates against the restored configuration, not the old destination configuration. If that restored configuration no longer projects an atom today, ordinary normalization still refuses it.

### 3. Reversed wrong-focus expectation — ACCEPTABLE POLICY TRADEOFF, insufficient as proof of executability

I agree that current stored data cannot distinguish historical regrouping from an originally wrong but resolving focus. Unknown roots, other subjects, removed atoms and graph/order damage still fail. But there is real damage that this can hide: a valid unrelated atomic focus with a different scheduled atom passes compatibility while due selection continues to search the unrelated focus. The reversed test at `backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java:1851` deliberately constructs that category and only checks compatibility.

The correct resolution is not to reinstate historical graph identity. Make captured atoms executable as in A1, and avoid creating new mismatches on edits as in A2. A nonblocking diagnostic for an out-of-section captured atom would also make the retained state inspectable without forcing the learner to repair a valid historical plan. Do not describe the boolean compatibility test alone as proof that navigation works.

### 4. Import, fingerprint, order, revision — PASS WITH AN EXPLICIT METADATA DISTINCTION

Retired ordinary entries are filtered using the same helper as a read (`LearnerService.java:14894`; `LearnerLearningPlanService.java:2762`), while moved nonretired atoms survive. Normalization preserves mastered captured atoms at import (`preserveAllScopeAtoms=true`, `LearnerService.java:14902`), and ordering uses the same current prerequisite scheduler at `:14908`. For the valid regrouping case whose current order already works, the effective blocks and ordering therefore match the direct read. The new retirement import assertions at `ClaudeV1CompletionRouteIntegrationTest.java:1747` check effective and subsequently exported blocks.

The stored metadata is intentionally **not identical** to an untouched old plan: import creates a new record, computes a current fingerprint (`LearnerService.java:14915`), sets revision 1 (`:14920`), and captures the current timestamp (`:14930`). A plain read does not rewrite the old capture fingerprint/revision. This was the preexisting portable contract: `PortablePlan` carries only landscape, label and blocks (`LearnerLearningPlanApi.java:263`). The retained set changes validation, not the fingerprint format; the digest still includes the actual block atoms, roots and ordering (`LearnerService.java:4923`). There is no inconsistency if import is described as restoration/recapture rather than preservation of database revision or historical digest.

I found no other import consumer that requires the old strict ancestry invariant. Signature checking and result restoration precede plan restoration, but the public import is transactional (`LearnerService.java:14771`); a plan rejection still rolls back the whole import. Recommend explicit assertions for revision reset, a recomputed current fingerprint, and no metadata mutation on ordinary read, since the added tests check neither fingerprint nor revision preservation/reset.

### 5. Cockpit and coach behavior — FAIL; A1 is the material gap

Cockpit parsing preserves the server's captured atom list (`app/src/utils/learnerLearningPlanApi.ts:535`), and replaying a server plan copies that list (`app/src/utils/teacherLearningPlanActivation.ts:478`). A local teacher draft is separately rematerialized under the current projection (`:613`), so its comparison can correctly report `projected-goals-changed` (`:433`) despite a still-compatible captured server plan. This is a reconciliation notice, not automatic loss of stored work.

Section assessment policy remains in force: effective reads call it after retirement filtering (`LearnerLearningPlanService.java:2752`), and it removes only assessments that the authored roots make voluntary (`:2801`). The retention change does not turn old ordinary sections into versioned unit assignments. Explicit assignments remain edition-bound and can be unavailable independently of an ordinary retained section (`:3279`).

Today-status balances still count the captured active atom IDs (`:688`), and the resolved ordinary plan scope includes the moved atoms (`LearningPlanScopeResolver.java:59`). Eligibility and resume differ as described in A1. A broader explicit personal-subject fallback can keep learning possible, but may select unrelated work before a retained due goal. Coach instructions consume the published capability and guidance (`backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CoachContextProjector.java:550`, `:618`); they cannot repair this backend inconsistency by interpretation. These conclusions are source traces, not claims of a successful native-host or browser probe.

### 6. Restore results while retaining an unreadable plan as outdated — YES, as a separate bounded change

The present refusal is real: `getPlanningScope`, normalization, focus validation or fingerprinting at `LearnerService.java:14888`–`:14919` can reject before plans are saved, and the enclosing transaction then rejects result restoration too. It is not necessary to loosen result signatures or mastery contracts to address that coupling.

A safe design separates structural archive validation from current executability. Verify signatures, ownership/result contracts, bounded IDs/text/dates/block count and serializability first. Restore independently valid results normally. Keep a syntactically valid but currently unprojectable plan verbatim as historical state, with an explicit quarantined/outdated status and reason that prevents plan selection, obligation credit, assignment activation and auto-handoff until an explicit successful repair. Preserve any existing active plan deliberately rather than silently replacing it with an unusable one; return a clear per-plan import outcome. Never use a dummy fingerprint as the quarantine mechanism: compatibility deliberately does not compare fingerprints. The current entity has no import-quarantine field (`backend/src/main/java/com/skillpilot/backend/domain/LearnerLearningPlan.java:36`–`:55`), so this requires an explicit state/storage contract, not a broad catch-and-continue inside the current active-plan import.

Malformed or oversized blocks should still fail structural validation or be stored only as a bounded separate archival attachment. Server faults must remain failures. This recommendation answers the open product question; it is not an implementation or a claimed acceptance test.
