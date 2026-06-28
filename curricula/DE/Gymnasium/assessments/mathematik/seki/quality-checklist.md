# Quality Checklist - Sek-I Mathematics Exam Tasks

Use this checklist before any Sek-I mathematics exam draft is promoted into canonical `examData`.

Target package:

- Year level:
- Draft file:
- Solution file:
- Blueprint file:
- Reviewer:
- Review date:
- Status: `draft`, `needs_revision`, `release_candidate`, `released`

Status values per item:

- `[ ]` open
- `[x]` pass
- `[!]` fail / finding required
- `[-]` not applicable, with reason

---

## 0. Pedagogical Design Pattern Gate

This section checks whether the task design is pedagogically strong before formal graph or scoring details are reviewed.

### 0.1 Low Floor / High Ceiling

- [ ] Every larger task has an accessible start that can be attempted by most students without guessing the intended trick.
- [ ] The same task develops toward mathematical depth: pattern recognition, explanation, generalization, comparison, proof idea, model decision, or model critique.
- [ ] Differentiation is built into the task itself, not only into optional bonus work.
- [ ] The high-ceiling part remains connected to the same mathematical idea as the low-floor entry.

Release blocker if failed: the task has only routine entry and no meaningful mathematical extension.

### 0.2 AfB Cascade

- [ ] The task set contains explicit AfB I, AfB II, and AfB III elements where appropriate for the year level.
- [ ] AfB I parts ask for direct use of known facts, data, procedures, or representations.
- [ ] AfB II parts require connections, translation between context and mathematics, strategy choice, or comparison of approaches.
- [ ] AfB III parts require justification, reflection, generalization, model critique, or evaluation of assumptions.
- [ ] The three demand levels build logically on each other but are distinguishable in the task wording and scoring.

Release blocker if failed: the package never goes beyond reproduction or labels routine calculation as AfB III.

### 0.3 Required Representation Change

- [ ] At least one task requires a meaningful switch between representations, for example context/table/diagram/graph/formula/verbal explanation.
- [ ] The representation change is mathematically necessary, not cosmetic.
- [ ] Students must interpret at least one result back in the original context or in words.
- [ ] Diagrams, tables, graphs, or formulas are readable and year-appropriate.

Release blocker if failed: the complete package stays in one representation mode without interpretation.

### 0.4 Misconception Design

- [ ] At least one task or subtask makes a typical misconception visible, for example through a false claim, an erroneous student solution, a tempting distractor, or a boundary case.
- [ ] Students are asked to diagnose, correct, or explain the misconception, not merely compute the right answer.
- [ ] The misconception is plausible for the year level and tied to a real learning obstacle.
- [ ] The solution notes what the misconception reveals and how correct reasoning addresses it.

Release blocker if failed: no diagnostic opportunity exists in the package.

### 0.5 Authenticity Before Artificial Smoothness

- [ ] Contexts are plausible enough that the data and constraints could reasonably occur in the described situation.
- [ ] Data is not made artificially smooth if that would make the real-world situation absurd.
- [ ] If simplified data is used, the simplification is didactically justified and not misleading.
- [ ] The context creates a real mathematical need: students must select, transform, compare, estimate, validate, or decide.

Release blocker if failed: the context is decorative, implausible, or engineered only to produce a neat calculation.

### 0.6 Model Critique Loop

- [ ] Every substantial modelling task asks students to validate, check, interpret, or limit the model at an age-appropriate level.
- [ ] The task identifies or invites relevant assumptions, such as linearity, rounding, constant rates, equal spacing, measurement accuracy, or missing factors.
- [ ] The expected solution distinguishes the mathematical model from the real situation.
- [ ] The critique is assessable with clear criteria and not an open-ended opinion prompt.

Release blocker if failed: a substantial model is used but never interpreted or checked.

### 0.7 Dominant Task Verbs

- [ ] Across the package, the dominant verbs include `begründe`, `erkläre`, `interpretiere`, `vergleiche`, `prüfe`, or `beurteile`, not only `berechne`.
- [ ] Whenever `berechne` appears, the result is used for a subsequent interpretation, check, comparison, or decision.
- [ ] The solution and scoring reward reasoning quality, not only final numeric answers.

Release blocker if failed: the package is essentially a calculation worksheet.

---

## 1. Source Hygiene and Originality

- [ ] Reference examples are stored only under `tmp/seki-math-exam-reference-pool/` and are not committed.
- [ ] The source manifest lists URL, provider, retrieval date, and intended calibration use for every reference.
- [ ] No task text, number set, diagram, story setup, solution path, or distinctive subtask sequence is copied from a reference source.
- [ ] The draft was written from the SkillPilot goals and blueprint, not by paraphrasing an external task.
- [ ] Any similarity concern has been reviewed and either resolved or documented as an accepted risk.
- [ ] Sources with unclear provenance are not used as primary quality references.

Release blocker if failed: any item in this section.

---

## 2. Curriculum and Graph Fit

- [ ] The exam package belongs to exactly one intended year level or explicitly documented year band.
- [ ] Every task has narrow `coveredGoalIds` matching the goals actually assessed.
- [ ] Every task has `requires` aligned with the assessed prerequisite goals; no whole-year bulk coverage is copied onto each task.
- [ ] The full package gives reasonable coverage of the selected year goals without pretending to cover omitted goals.
- [ ] Leitideen and process competencies are balanced for the year level.
- [ ] The task set supports the learner-facing route endpoint under `Prüfungen Jahrgangsstufe <n>`.
- [ ] No separate `Sek-I-Abschlussaufgaben Mathematik` capstone is introduced or required.

Release blocker if failed: any item concerning `coveredGoalIds`, `requires`, or route endpoint.

---

## 3. Year-Level Appropriateness

- [ ] Content, notation, language, and expected strategies fit the target year.
- [ ] Numbers and calculations are plausible for the year without artificial complexity.
- [ ] The task does not rely on concepts that are introduced only in later years.
- [ ] Context knowledge is common enough or fully supplied in the task.
- [ ] Reading load is appropriate and does not hide the mathematics.
- [ ] Diagrams, tables, and units match what students at this year can reasonably interpret.

Release blocker if failed: later-year content or hidden prerequisite knowledge.

---

## 4. Task Set Composition

- [ ] The package contains a mix of short diagnostic parts and richer connected parts.
- [ ] The package includes accessible entry points for weaker students.
- [ ] The package includes at least one higher-ceiling reasoning, checking, explaining, or model-limit component.
- [ ] The package assesses more than isolated calculation routines.
- [ ] No single artificial umbrella scenario is copied across unrelated tasks.
- [ ] Task dependencies are limited: failure in one task should not make the remaining tasks unsolvable.
- [ ] Total points and subtask points are plausible for the intended assessment length.

Release blocker if failed: purely procedural task set or one incoherent mega-context.

---

## 5. Context Quality

- [ ] Each context is coherent, age-appropriate, and mathematically necessary.
- [ ] The context is not decorative; students must use the given situation or data.
- [ ] Real-world assumptions are stated when needed.
- [ ] Data values are realistic enough for the context.
- [ ] The context does not introduce distracting details that are irrelevant to the mathematical decision.
- [ ] If a model is used, the task asks students to interpret or check its limits at an age-appropriate level.

Release blocker if failed: context is misleading, implausible, or mathematically irrelevant.

---

## 6. Low-Floor / High-Ceiling Structure

- [ ] Each task starts with an accessible action such as reading data, calculating a simple value, completing a representation, or identifying a pattern.
- [ ] Each task develops toward a meaningful mathematical decision, explanation, comparison, or check.
- [ ] At least one subtask asks for reasoning in words, not only a numeric result.
- [ ] Higher-demand parts remain solvable from the provided data.
- [ ] The task rewards valid alternative strategies where appropriate.

Release blocker if failed: no reasoning/explanation component in the package.

---

## 7. Mathematical Correctness

- [ ] All numbers, units, coordinates, diagrams, tables, and statements are internally consistent.
- [ ] Every problem has at least one correct solution.
- [ ] Edge cases are handled, for example rounding, integer decisions, or points outside a field.
- [ ] There are no ambiguous instructions that lead to incompatible answers.
- [ ] Mathematical terminology is correct and year-appropriate.

Release blocker if failed: any mathematical error.

---

## 8. Solution and Scoring

- [ ] The solution gives complete reasoning, not only final answers.
- [ ] The BE distribution matches observable student actions.
- [ ] Partial-credit logic is clear enough for a teacher or reviewer.
- [ ] Alternative correct approaches are noted where likely.
- [ ] Common misconceptions or likely errors are noted when useful for feedback.
- [ ] The solution matches the exact final version of the task sheet.

Release blocker if failed: scoring cannot be applied consistently.

---

## 9. Language, Accessibility, and Formatting

- [ ] Task wording is precise, direct, and learner-facing.
- [ ] Subtasks use consistent labels and operators.
- [ ] Tables and diagrams have enough labels and units.
- [ ] No avoidable cultural, regional, or socioeconomic assumption is required.
- [ ] Markdown renders cleanly and can be exported for review.
- [ ] Mathematical notation is consistent with existing SkillPilot exam artifacts.

Release blocker if failed: ambiguity prevents fair assessment.

---

## 10. External Review

- [ ] Checklist, task draft, and solution were sent to external review.
- [ ] Reviewer feedback is stored as a separate Markdown artifact.
- [ ] Every blocking finding has an explicit resolution.
- [ ] Non-blocking findings are either resolved or documented as accepted risks.
- [ ] Re-QA after findings confirms that changes did not create new problems.

Release blocker if failed: unresolved blocking external finding.

---

## 11. Promotion into `examData`

- [ ] `examData.taskContent` matches the released learner-facing Markdown.
- [ ] `examData.solutionContent` matches the released solution.
- [ ] `examData.scoring` matches the released BE scheme.
- [ ] `examData.reviewStatus` is set to `released` only after checklist and review gates pass.
- [ ] `sourceArtifactPath` points to the released local Markdown artifact, not to external material.
- [ ] Graph validation passes.
- [ ] Composition-view validation passes.
- [ ] Curriculum-quality status and source/rationale reports are regenerated if affected.
- [ ] Backend tests covering learner scope/options still pass.

Release blocker if failed: any mismatch between released Markdown and graph data.

---

## Final Decision

- [ ] Release approved.
- [ ] Release blocked.
- [ ] Needs another draft iteration.

Decision notes:

```text

```
