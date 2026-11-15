# Graph Definition: documentation review, 15 November 2026

This is a review of the existing documentation changes and the architecture
critique supplied by the Product Owner while implementation continues. It is
not a replacement specification or a new runtime acceptance report.

The binding target model remains authoritative even where implementation is
incomplete. Normative consistency, current implementation, and verified delivery
are separate review questions. Missing implementation must be repaired; it does
not justify weakening the specification to describe existing behavior.

## Inspected state

The mainline reference was `64793bdc2270ce67feced439ae20ef03a59e2abe`, verified
against the remote branch. The ongoing delivery is
[draft PR #159](https://github.com/enpasos/skillpilot/pull/159), with published
head `34ee40b4b350e3786daf5c91c9d208a6967ec972` at this inspection and additional
local curriculum and documentation work. Its successful draft CI has six
passing and eight skipped jobs. Full PR CI, integration, and fresh main CI
remain separate requirements.

## Reconciliation of the critique

| Finding | Review result and action |
| --- | --- |
| Traversal stops at a mastered intermediate goal | Outdated. Commit `dbef64ed0810be092669becdeab9e07ab35477e1`, dated 7 November, is already in main. The current automatic evaluator traverses prerequisites regardless of intermediate mastery. The formerly open statement in the implementation appendix is corrected explicitly. |
| Global revision-bound effective mastery is implemented | No such acceptance exists. The target remains binding; the existing contextual discharge algorithm is not the global recognition contract. A change in derived discharge must not be described as deletion of stored explicit learner results. |
| Cluster references are always preserved | Still not true across all compatibility paths. The resolver's strict canonical-seed path rejects clusters with `TARGET_NOT_ATOMIC`; legacy paths retain opaque cluster behavior. Both facts are now distinguished. |
| `isCoreForPrereqs` matches full atomic cluster satisfaction | It does not. The tag-based selection remains visible in current code. The normative all-atom condition is preserved, and the implementation gap stays open. |
| Only 12 of 145 groups are hard | The current registry does contain 12 HARD, 50 PARTIAL, 57 OPEN and 26 OPT/DOC groups. These are enforcement grades for compound obligations, not implementation percentages, individual test counts, or measured failure rates. No grade is upgraded by this documentation review. |
| The route and endpoint finding counts describe the current repair | The quoted counts belong to dated diagnostic snapshots. Current policy still distinguishes four required semantic-route scopes and eight general endpoint-visibility scopes, but the old individual finding counts have not been remeasured for the ongoing successor package. They are labelled historical rather than copied as new results. |
| No activated Land plan means there are no official Land sources | The implication is false. Retained official sources and reviewed mappings exist independently of an activated shared stage plan. Zero activated real plans remains an accurate delivery boundary at this checkpoint. The v1.3 foundation has executable schema, compiler and validation code; this does not make it a published complete package or an accepted real plan. |
| M7 establishes educational effectiveness | It does not. Machine QA includes bound content-review evidence, not just graph syntax. It still does not establish human trials, classroom effectiveness or complete runtime conformity. Agent content reviews under the current delegation are not relabelled human reviews. |
| R2 and R5 are already fully enforced | They are not. Structural unit checks and hash-bound coverage evidence do not establish universal noncompensability of every essential skill or historical-result version safety. These remain explicit implementation obligations. |
| A fixed twelve-month sequence follows from the findings | No engineering estimate supports those dates. The existing delivery order is driven by concrete dependencies, necessary curriculum repairs and verified integration. This review introduces no new calendar commitment. |

The ordinary-goal acquisition contract also does **not** require a static
`examData` task for every goal. Complete independent understanding evidence may
be obtained through the coach workflow. This does not make prerequisites into
assessment coverage, deliver QA profiles automatically to the coach, or waive
the specific terminal-route and valid-unit R2 obligations.

## Normative corrections

The parallel bilingual source review inspected 43 incoming authored sources
(21 chapter pairs and the symbol glossary) and refined 29 of them. It checks the
new unit hierarchy, declaration and coverage semantics, ordering, and the
proposed unit-by-unit recommendation mode. The implementation appendix and
register introduction are reconciled separately. Corrections are made in
authored sources and then regenerated; generated Web pages are not independently
edited. The target model is retained.

In particular, a nonempty `coverageReviews` field alone cannot establish a valid
recognition contract, and a missing review cannot silently turn an intended
assessment-bearing unit into a unit exempt from its obligations. Likewise,
completion of all atoms cannot be inferred when an owned assessment remains
unpassed. Recommendation order remains distinct from access restrictions.

Path-convexity alone is also insufficient for a coherent block order: two
path-convex units can each need a different atom from the other unit while the
atomic graph remains acyclic. E2 therefore checks the whole child-block graph
at every level. Assessment endpoints are described in learning direction;
the reverse `requires` direction does not make an assessment a prerequisite.
Only atoms carry mastery, and unit declarations refer to canonical clusters
through the placement layer. Applicable year ranges remain specific to the
Land and duration model.

## Evidence and limits

The traversal inspection uses
[CompletionEvaluator](https://github.com/enpasos/skillpilot/blob/64793bdc2270ce67feced439ae20ef03a59e2abe/backend/src/main/java/com/skillpilot/backend/completion/CompletionEvaluator.java),
[AutomaticCompletionTest](https://github.com/enpasos/skillpilot/blob/64793bdc2270ce67feced439ae20ef03a59e2abe/backend/src/test/java/com/skillpilot/backend/completion/AutomaticCompletionTest.java)
and
[AutomaticLearningPlanCompletionProjectionTest](https://github.com/enpasos/skillpilot/blob/64793bdc2270ce67feced439ae20ef03a59e2abe/backend/src/test/java/com/skillpilot/backend/completion/AutomaticLearningPlanCompletionProjectionTest.java).
The named counterexample is `Q requires B`, `B requires A`, with only `B`
mastered: `A` remains demanded by open `Q`.

A fresh local run passed all **62 tests** in the four completion and learning-plan
projection classes, with zero failures, errors or skipped tests. The initial
Gradle attempts failed before test execution because of unavailable local cache
paths; they are retained separately from the successful retry with an isolated
project cache. No code fix or production rollout is claimed by this documentation
task. All five compendia have now been regenerated: **80 Web outputs and ten
DE/EN PDFs**. Source parity, committed-output consistency, generated notices,
terminology, links, indexes and MkDocs strict checks pass. The initial
architecture build failed on an undefined notation macro; the two source
occurrences were corrected with standard mathematical notation and the affected
builds passed. This formatting correction is recorded separately from the
original content-review delta. Existing tolerated PDF package warnings are not
misreported as warning-free output.

The [retained review evidence](https://github.com/enpasos/skillpilot/tree/fix/stage-plan-next-delivery-20261115/contracts/stage-plan-review-evidence/2026-11-15/documentation-critique-review-v1)
contains the incoming source patch, the independent bilingual review delta,
21 matching DE/EN structure checks, three bounded model counterexamples, and
the actual local test results. The original critique is not republished.

See the [continuous management record](stage-plan-management-summary.md) for
the integrated delivery status and the distinct open K/F work.
