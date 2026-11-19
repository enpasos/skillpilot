## Node Types {#sec:sga-node-types}

SkillPilot classifies learning goals into four pedagogical goal kinds that are orthogonal to the structural atomic/cluster distinction ([Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)) and to program-unit kinds (@ref{sec:sga-view-projection}).

### Outcome Contract and Compiled Applicability {#sec:sga-nt-summary}

| Node Type | Pedagogical Purpose | Typical Content & Completion Basis |
| --- | --- | --- |
| **Orientation** | Make the purpose of learning clear | At the subject introduction, the learner confirms the end of the conversation. A short unit introduction is proposed for the regular route (17 November). |
| **Understanding** | Conceptual or procedural subject mastery (default) | Assessable `"The learner can ..."` competencies governed by `requires`. |
| **Memorize** | Durable recall of facts, vocabulary, and formulas | SM-2 spaced-repetition practice plus a mandatory coach-led **verified hard recall** check over all required cards. |
| **Exam** | Realistic scored assessment simulation | Verbatim `examData` tasks graded strictly by `scoring.steps` under neutral AI Exam Mode supervision. |
{cols="18%,34%,48%"}

For an atomic goal the [learning workflow](repo:docs/concept/runtime-workflows/learning-workflow.md) records direct success as a binary `1` or `1.0`. An open goal can describe a skill for which individual evidence is still missing. An ordinary cluster view counts its distinct atomic descendants. Declared units follow completion derived from mastery or recognition of their own goals and completion of their children under the applicable recognition contract R1–R5. The proposal of 19 November would additionally show a representative judgement about the unit and its planning effect. Compiled `applicability` and `extendedData.applicabilityOverrides` govern visibility in scope.

### Orientation, Understanding, and Memorize Semantics {#sec:sga-nt-orientation-memorize}

**Orientation (`semanticKind: "orientation"`):** Checked by `GVR-014` ([Graph Validation Rules](repo:docs/qa-ci/graph-validation-rules.md)) to carry zero `requires` and no exam, memory, example, or assessment metadata. Orientation never tests prior knowledge or terminology. In a complete Land plan, orientation goals likewise carry a justified placement inside `SekI` or `SekII` (never floating beside the root stages) and may belong directly to outer units.

At today’s subject introduction the learner confirms in conversation that they wish to continue. The proposal of 17 November adds a short subject-unit opening whose question illustrates the learning promise. Under the proposal of 19 November, a learner choosing direct unit demonstration would see the claim and required parts; passing would create no record of attending a skipped introduction. [Orientation in the Graph Definition](repo:docs/concept/skill-graph/context-and-views.en.md#sec-orientation)

If any orientation goals are open in the selected working scope, ordinary entry offers only those goals while the learner has neither curricular progress nor an active curricular goal there. The learner can also choose an available assessment directly.

**Understanding goals in the local Claude 1.1.14 candidate.** The coach can build on an idea the learner already has. They might invite an example, listen and explain the missing connection. If the concept is entirely new, the coach introduces it. Learners can then explain it in their own words, ask a question or try a suitable task. The conversation informs teaching. An independent explanation or application can contribute evidence under the existing outcome contract. [Example conversation for the local Claude skill (German)](repo:docs/concept/didactic/claude-beta-erklaeren-2026-11-19.de.md)

**Memorize (SM-2 + Verified Recall):** Each card maintains two process-data lanes that determine the single goal outcome:

- **SRS practice lane:** `interval` (days), `repetition`, `ef` (easiness factor, clamped to $\ge 1.3$), and `nextReview` (ms). On review, `quality >= 3` increments `repetition`, sets `interval` to `1`, `6`, or `round(lastInterval * ef)`, updates `ef`, and schedules `now + interval * 24h`; `quality < 3` resets `repetition = 0` and `interval = 1` with unchanged `ef`. Due cards (`nextReview <= now` or unseen) are shuffled per session (up to 20 cards). Interactive MCP practice components translate **known** / **not known yet** into SM-2 updates; flipping cards never writes state, and completing an SRS practice queue **never** proves mastery.
- **Verified recall lane (`verifiedRecall`):** Tracks `status` (`passed` | `failed`), `attempts`, `failures`, `lastTestedAt`, `passedAt`, and `lastFailedAt`. Learners may trigger **Verify** at any time: the coach fetches only the prompt first, waits for an unassisted answer, then fetches the expected answer and records `passed` (updating SRS as a strong retrieval) or `failed` (re-queuing as due). Controlled recall of **all required cards** in a fully resolved, valid deck establishes permanent goal completion; subsequent SRS due dates never withdraw established goal mastery (the 29 October 2026 code inspection of [`LearnerService.java`](repo:backend/src/main/java/com/skillpilot/backend/service/LearnerService.java) `isSrsMasteredByVerifiedRecall` and [`useSrsMastery.ts`](repo:app/src/hooks/useSrsMastery.ts) records current flag derivation without authorizing mastery withdrawal).

### Exam Goals, Unit Qualification and Scoring {#sec:sga-nt-scoring anchors="scoring-and-mastery"}

An `Exam` carries its task, solution and scoring rubric in `examData` (`taskContent`, `solutionContent`, optional English versions and `scoring` with `maxPoints`, `passingPoints` and `steps`). In the target graph an assessment is an endpoint in learning order. Its `requires` describe preparation. Learners can choose a direct attempt. A passed practice task or school-leaving examination initially supports the claim warranted by that task.

**Proposal of 19 November.** A subject unit would specify its final assessments, required child units and other required performances for each version. The same standard would apply to evidence for an ordinary goal it owns, whether demonstrated during an assessment or individually. If the goal calls for taking measurements, analysing supplied data cannot demonstrate that performance on either route. A unit with a narrower learning promise can leave it open. Only a fully passed unit would release its own expressly reviewed content goals for planning. [Discussion paper](repo:docs/concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md)

The proposal of 19 November calls for an equivalent new version for another qualifying attempt after solution disclosure. This additional quality rule has not been adopted; the familiar task remains available for practice. The following rules govern current exam goals.

- **Formulas:** $\text{total} = \min(\sum \text{stepPointsAwarded}, \text{scoring.maxPoints})$ and $\text{passed} = (\text{total} \ge \text{scoring.passingPoints})$ (logic errors yield `0` step points; arithmetic slips allow partial step points).
- **Binary persistence.** On `passed == true`, the backend immediately stores `1.0`. The coach confirms success once the write is acknowledged. On `passed == false`, prior mastery is preserved and neither the failed attempt nor its score is stored. Learners may retry the same task any number of times, including after seeing the solution. [Grading and retakes (§8.4)](repo:docs/concept/skill-graph/context-and-views.en.md#sec-exams)
- **AI Exam Supervisor workflow:** (1) Show a neutral 2–4 line exam header, deliver `examData.taskContent` **verbatim** without chunking or hints, and append one fixed submission line; (2) accept only readability clarifications until a single complete submission or explicit give-up arrives; (3) grade strictly against `scoring.steps`; (4) persist mastery on pass only; (5) report score, pass/fail, and step feedback, reveal `solutionContent`, switch back to learning-coach mode, and wait for an explicit learner choice before starting new content.
