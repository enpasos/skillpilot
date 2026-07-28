# Exam Example

This document is a general, repeatable blueprint for producing a high-quality exam example package from official exam specifications.
It is intended for subject teams that create learner-facing draft exams, review them iteratively, and later integrate them into SkillPilot as `examData`.

---

## Scope

- **Input:** Official exam regulations, curriculum references, style corpora, and optional prior exam examples.
- **Output:** A stable artifact set for one exam example (draft, solution, QA, findings, re-QA) plus optional later landscape integration.
- **Goal:** A traceable workflow that separates content authoring, QA, findings handling, and final graph integration.

---

## Directory layout

Typical structure:

- Subject-level control files under `curricula/<...>/abi/<Subject>/`
- One folder per example package, e.g. `Klausurbeispiel2026_1/`, `Klausurbeispiel2026_2/`

Subject-level files commonly include:

- `exam-example-authoring-guide.md`
- `input/references.md`
- one or more `*_exam_blueprint*.json` files
- subject-specific source extracts or level-control notes

Example-level artifact set commonly includes:

- `checkliste.md`
- `<Subject>_<Region>_<Year>_Klausurbeispiel_<n>.md`
- `<Subject>_<Region>_<Year>_Klausurbeispiel_<n>_Musterloesung.md`
- `Schritt5_Abschluss_QS.md`
- `findings.md`
- `Schritt7_Finding_Bearbeitung.md`
- `Schritt8_ReQS.md`

Optional artifacts:

- similarity or originality reports in `tmp/`
- PDFs or rendered exports for review
- per-example blueprint JSON if each example needs its own planning file

---

## Step 0: Register sources

Goal: make the source basis explicit before any drafting starts.

Recommended inputs:

- official regulation / decree / exam hints
- curriculum framework or standards
- style corpus from prior tasks
- optional prior SkillPilot examples for complementarity planning
- optional subject-specific level-control or didactic notes

Recommended practice:

- keep a central source registry such as `input/references.md`
- keep subject-specific source extracts close to the working prompt
- distinguish clearly between authoritative sources and style references

---

## Step 1: Create the QA checklist

Goal: define what "acceptable" means before writing the exam.

Checklist categories typically include:

- metadata and formal requirements
- exam structure and selection mode
- curriculum/topic coverage
- task quality and level
- originality and source hygiene
- aids/documentation rules
- consistency between task, solution, and scoring
- final release criteria

The checklist should be phrased as verifiable checks, not prose goals.

---

## Step 2: Create the blueprint

Goal: plan coverage, structure, and difficulty before writing full tasks.

The blueprint is the planning artifact that reduces downstream rework.
It should capture at least:

- `examSpecId`, `locale`, `subject`, `frameworkRefs`
- level or course variants (`GK`, `LK`, etc.) where applicable
- selection modes or task-part rules
- curriculum coverage targets
- per-proposal or per-task matrix
- global coverage checks

Recommended minimum blueprint shape:

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

The exact schema may differ by subject. Mathematics and Physics already show that the blueprint must remain extensible.

When multiple examples exist for the same subject/year:

- later blueprints should explicitly document complementarity to earlier examples
- originality against prior examples should be planned, not only checked afterward

---

## Step 3: Draft the exam tasks

Goal: produce the learner-facing task sheet.

Requirements:

- independent, non-copied tasks
- realistic contexts and clean operator wording
- consistent data, units, and notation
- explicit selection rules where the exam format requires them
- learner-facing wording only; no hidden reviewer assumptions

---

## Step 4: Draft the solution and scoring

Goal: produce the reviewer-facing solution package.

Requirements:

- complete solution path per subtask
- transparent scoring / `BE` mapping
- explanation, not only final numeric answers
- explicit rounding/tolerance rules where needed
- consistency with task wording and materials

This is the point where the artifact becomes a candidate for SkillPilot `examData`, but not yet ready for graph integration.

---

## Step 5: Run final QA

Goal: check the draft package against the checklist before it is treated as a stable example.

The final QA file should include:

- date
- exact referenced files
- checklist-by-checklist assessment
- remaining risks or uncertainty notes
- a release status such as "draft-ready", "release candidate", or similar

---

## Step 6: Capture findings

Goal: turn review feedback into a structured backlog instead of ad-hoc edits.

Recommended findings fields:

- ID
- source
- description
- priority
- affected files
- acceptance criterion
- status

If temporary analysis artifacts are generated, keep them in `tmp/`, not in the project root.

---

## Step 7: Process findings

Goal: implement accepted changes without losing auditability.

Recommended content of the processing log:

- which finding was addressed
- what changed
- where it changed
- why the change resolves the finding
- whether any follow-up risk remains

This is also the right place for originality checks, similarity reports, or subject-expert feedback logs.

---

## Step 8: Re-QA after findings

Goal: verify the delta rather than restarting the whole process blindly.

The re-QA should document:

- finding-by-finding status delta (`behoben`, `teilweise behoben`, `offen`)
- affected checklist categories
- remaining blocked items
- updated release status

Only after this step should the content be treated as stable enough for broader reuse.

---

## Step 9: Integrate into the landscape

Goal: convert the stable exam package into SkillPilot graph artifacts.

This step should happen only after content stabilization.
Typical outputs:

- new exam nodes in the landscape JSON
- `examData.taskContent`
- `examData.solutionContent`
- `examData.scoring`
- stable references from the skill graph

See also:

- `../concept/skill-graph/node-types.md`
- `../production-pipelines/skill-graph.md`

Do not mix early content drafting with graph integration unless there is a strong reason.

---

## Prompt design guidance

Subject-specific authoring-guide files such as `exam-example-authoring-guide.md` should mainly define:

- binding sources
- hard subject constraints
- exact artifact paths
- subject-specific additions per step
- the current active step for the next iteration

The subject-specific guide should not be the only place where the workflow lives.
The reusable process belongs in `docs/production-pipelines/`, while `exam-example-authoring-guide.md` should instantiate that process for a concrete subject/year/example package.
