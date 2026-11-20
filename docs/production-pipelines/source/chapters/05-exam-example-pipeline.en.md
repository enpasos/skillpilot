## Exam Example Production Pipeline {#sec:pp-exam-example}

This chapter defines the general, repeatable blueprint for authoring quality-assured draft exam packages from official exam specifications before promoting stabilized packages into the skill graph as `examData` (@ref{sec:pp-skill-graph}).

### Directory Layout and Blueprint Schema {#sec:pp-exam-layout}

Subject-level control files reside under `curricula/<...>/abi/<Subject>/` (`exam-example-authoring-guide.md`, `input/references.md`, `*_exam_blueprint*.json`), with one subfolder per example package such as `Klausurbeispiel2026_1/`:

```text
curricula/<...>/abi/<Subject>/Klausurbeispiel2026_1/
  checkliste.md
  <Subject>_<Region>_<Year>_Klausurbeispiel_<n>.md
  <Subject>_<Region>_<Year>_Klausurbeispiel_<n>_Musterloesung.md
  Schritt5_Abschluss_QS.md
  findings.md
  Schritt7_Finding_Bearbeitung.md
  Schritt8_ReQS.md
```

Temporary similarity or originality reports stay strictly under `tmp/`. The planning blueprint fixes coverage, selection modes, and complementarity to prior examples upfront:

```json
{
  "examSpecId": "subject-region-year-example",
  "locale": "de-DE",
  "subject": "Physik",
  "frameworkRefs": ["Official exam hint", "Curriculum"],
  "selectionModes": {},
  "contentFocus": {},
  "proposalMatrix": [],
  "globalCoverageChecks": []
}
```

### Ten-Step Workflow (Step 0 through Step 9) {#sec:pp-exam-steps}

1. **Step 0 (Register sources):** Record decrees, curriculum standards, style corpora, and prior SkillPilot examples in `input/references.md`, cleanly separating binding regulations from style references.
2. **Step 1 (Create QA checklist):** Phrase verifiable checks covering metadata, selection rules, topic coverage, cognitive level, originality, permitted aids, and task/solution/scoring consistency (`checkliste.md`).
3. **Step 2 (Create blueprint):** Plan `GK`/`LK` course variants, task-part rules, proposal matrix, and explicit complementarity/originality relative to earlier examples.
4. **Step 3 (Draft exam tasks):** Write independent, non-copied tasks with realistic contexts, clean operator wording, consistent units/data, and strictly learner-facing text.
5. **Step 4 (Draft solution & scoring):** Provide complete per-subtask derivations, transparent `BE` point mapping, explanatory steps, valid alternative approaches, and explicit rounding/tolerance rules. Where recognition of an individual goal is claimed, check whether its essential performance is necessary to pass or can be fully compensated by other points.
6. **Step 5 (Run final QA):** Record item-by-item checklist verdicts, residual risks, and release status (`draft-ready`, `release candidate`) in `Schritt5_Abschluss_QS.md`.
7. **Step 6 (Capture findings):** Turn review feedback into structured `findings.md` items (ID, source, description, priority, affected files, acceptance criterion, status).
8. **Step 7 (Process findings):** Log addressed findings, exact edits, rationale, originality/similarity checks, and any follow-up risk in `Schritt7_Finding_Bearbeitung.md`.
9. **Step 8 (Re-QA after findings):** Document finding-by-finding status deltas (`behoben`, `teilweise behoben`, `offen`), affected checklist categories, and updated release status in `Schritt8_ReQS.md`.
10. **Step 9 (Integrate into skill graph):** Only after stabilization, promote exam nodes with `examData.taskContent`, `examData.solutionContent`, and `examData.scoring` into the landscape JSON ([Node Types](repo:docs/concept/skill-graph/node-types.md)). Keep necessary preparation in `requires` separate from reviewed coverage claims in `examData.coveredGoalIds`; a graph path does not establish task coverage. Subject-specific `exam-example-authoring-guide.md` files instantiate this workflow with concrete sources, paths, and current step without duplicating the general pipeline.

### Existing Learning-Unit Assessment Production Lane {#sec:pp-unit-assessments}

[applyLearningUnitAssessments.mjs](repo:app/scripts/applyLearningUnitAssessments.mjs) binds selected Mathematics and Physics tasks to their Markdown source sections, task/solution and rubric revisions, and independent coverage-review references. It generates or checks canonical assessment nodes, `programUnits`, own `goalPlacements`, and affected semantic-ledger fingerprints. Existing reviewed tasks can be referenced through their exact revisions; a second divergent task copy is no substitute.

Try the rubric for each authored multi-part assessment on two submissions. One demonstrates the core competence with a minor slip. The other lacks a core capability the assessment claims to cover. Record the partial scores and the pass mark for both submissions in the review. The first submission must reach the pass mark. The second must fall below it. If either result differs, revise the task, rubric or coverage claim.

```bash
# Read-only check that the catalog agrees with the assessment sources.
npm --prefix app run check:learning-unit-assessments
# After a deliberate source/review change: update the projection, then check.
cd app
node --import tsx scripts/applyLearningUnitAssessments.mjs --write
npm run check:learning-unit-assessments
npm run validate:learning-units
```

Technical synchronization is neither a new independent content review, grading of learner submissions, nor a learner trial. The existing Physics unit `physics-constant-acceleration` binds two assessments; coverage is the union of their individually reviewed contributions. Packages transport these units from contract 1.2; required byte-exact assessment stimuli and explicit partial ordering belong to the 1.3 candidate. Missing tasks or coverage reviews require repair, without using prerequisite paths as assessment evidence.

Declared learning units additionally retain their existing [contract conditions R1–R5](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-why-graph-not-enough). Independent review binds the task, solution, rubric, and claimed coverage to the reviewed version. A later expansion grants no additional recognition to earlier results. The [unit proposal of 19 November](repo:docs/concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md) is not yet a new approval rule. Formal CI, content review, independent grading of submissions, and learner trials provide separate evidence.
