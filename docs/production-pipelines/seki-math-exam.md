# Sek-I Mathematics Exam Production Pipeline

This pipeline defines the reviewed production workflow for canonical German Gymnasium mathematics exams in Sekundarstufe I.
It is intentionally separate from direct skill-graph editing: exam drafts are authored, reviewed, and stabilized as Markdown artifacts before they are promoted into `examData`.

---

## Scope

- Subject: Mathematik
- School form: Gymnasium
- Stage: Sekundarstufe I
- Year levels: Jahrgangsstufe 5 through 10
- Target graph structure: one `Prüfungen Jahrgangsstufe <n>` folder per visible year/year-band scope, with individual atomic exam-task nodes below it.

Non-goals:

- Do not create or restore a separate learner-facing `Sek-I-Abschlussaufgaben Mathematik` capstone.
- Do not use a single aggregate `Übungen Sekundarstufe I` branch as the learner-facing route endpoint.
- Do not copy, translate, lightly paraphrase, or structurally clone external tasks.

---

## Source Hygiene

Reference material may be used only for style, quality calibration, coverage comparison, and difficulty calibration.

Rules:

- Downloaded examples and PDFs stay under `tmp/seki-math-exam-reference-pool/`.
- Reference material is not committed to Git.
- The local reference pool should keep a `sources.json` or `README.md` with URL, provider, retrieval date, stage/year relevance, and intended use.
- Committed artifacts may contain source metadata and high-level observations, but not full copied tasks or close paraphrases.
- Every authored task must be independently written from the SkillPilot curriculum goals and reviewed against the quality checklist.
- If an external task creates a strong design idea, record only the abstract design principle, not the task wording, numbers, story, diagram, or solution path.

Preferred reference sources:

- official or institutionally curated task examples, especially IQB Sek I / VERA-8
- Landesbildungsserver / ZSL / Lehrerfortbildungsserver materials
- university or state-institute endorsed task databases such as SMART
- official curriculum pages for year-level and competency calibration

Avoid:

- outdated or uncurated classwork pages
- private worksheets with unclear rights
- answer-key sites and exam-solution scraper pages
- generated task lists without visible didactic provenance

---

## Artifact Layout

Stable shared files:

- `docs/production-pipelines/seki-math-exam.md`
- `curricula/DE/Gymnasium/assessments/mathematik/seki/quality-checklist.md`

Recommended per-year work package:

```text
curricula/DE/Gymnasium/assessments/mathematik/seki/j5/
  blueprint.md
  draft_v1.md
  solution_v1.md
  internal_qa_v1.md
  external_review.md
  findings.md
  finding_resolution.md
  re_qa.md
  release_candidate.md
```

Flat released files such as `j5_terminal_autonomy_v1.md` are compatibility artifacts. Once a reviewed replacement package is promoted, the canonical curriculum JSON must point to the promoted package and no longer to the superseded flat artifact.

---

## Workflow

### Step 0: Build Local Reference Pool

Collect representative examples into `tmp/seki-math-exam-reference-pool/`.

Outputs:

- downloaded reference files under `tmp/`
- local source manifest with URL, provider, retrieval date, and reason for inclusion
- no committed external task content

Gate:

- at least two independent high-quality source families have been checked for the target year or adjacent year band
- no source with unclear provenance is used as a main calibration source

### Step 1: Confirm Quality Checklist

Use `curricula/DE/Gymnasium/assessments/mathematik/seki/quality-checklist.md` as the release gate.

Outputs:

- reviewed checklist version
- explicit reviewer notes if the checklist itself needs changes

Gate:

- checklist is accepted by the project owner or an external reviewer before drafting starts

### Step 2: Draft Blueprint

Plan the exam before writing tasks.

The blueprint must include:

- year level and assumed timing
- covered canonical goal IDs
- targeted Leitideen / process competencies
- task matrix with points, demand level, and intended reasoning component
- explicit non-coverage notes, so omitted year goals are not accidentally implied
- allowed aids and expected representations

Gate:

- every planned task has a clear reason to exist
- no individual task claims the full year coverage unless it actually assesses it

### Step 3: Write Raw Exam Draft

Create the learner-facing Markdown draft.

Requirements:

- each context is coherent and age-appropriate
- the mathematics follows naturally from the context
- every task has an accessible entry and at least one explanation, checking, reasoning, or model-limit prompt
- notation, units, and diagrams are internally consistent

Gate:

- draft can be solved without hidden assumptions
- tasks are independent enough that one misunderstanding does not collapse the entire exam

### Step 4: Write Solution and Scoring

Create a reviewer-facing solution.

Requirements:

- complete solution path
- transparent BE allocation
- accepted alternative solutions where likely
- common error notes where useful
- scoring consistent with the learner-facing text

Gate:

- every awarded point is traceable to observable student work

### Step 5: Internal QA

Apply the checklist before external review.

Outputs:

- `internal_qa_v1.md`
- checklist status for every item: `pass`, `fail`, `blocked`, or `not_applicable`

Gate:

- no `fail` or `blocked` item in release-critical sections

### Step 6: External Review

Send checklist, draft, and solution to a reviewer.

Outputs:

- `external_review.md`
- structured findings

Gate:

- external feedback is positive or all blocking findings have concrete remediation work

### Step 7: Iterate Findings

Process findings as explicit changes.

Outputs:

- `findings.md`
- `finding_resolution.md`
- new draft/solution versions as needed

Gate:

- every finding is `resolved`, `accepted_risk`, or `out_of_scope` with a short reason

### Step 8: Re-QA and Release Candidate

Run checklist again after changes.

Outputs:

- `re_qa.md`
- `release_candidate.md`

Gate:

- checklist complete
- external-review blockers resolved
- originality/source hygiene confirmed

### Step 9: Promote into Skill Graph

Only after release-candidate status:

- update canonical exam nodes
- set `examData.reviewStatus = "released"`
- set narrow `examData.coveredGoalIds`
- set `requires` to the actually assessed prerequisite goals
- update source/rationale reports
- run graph, composition-view, source-coverage, and backend checks

Gate:

- full CI passes
- learner-facing composition views show the tasks under the correct year folder

---

## Release Rule

A Sek-I mathematics exam task is releasable only when all are true:

- it has passed the checklist
- it has a reviewed Markdown draft and solution
- it has positive external review or resolved blocking findings
- it is original and not a copy or close paraphrase of reference material
- its graph metadata is narrow and accurate
- it ends the appropriate year-level route in the learner-facing composition view
