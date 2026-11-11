## Sek-I Mathematics Exam Production Pipeline {#sec:pp-seki-math-exam}

This chapter specifies the reviewed production workflow for canonical German Gymnasium Mathematics exams in Sekundarstufe I (grades 5 through 10). Each visible year scope exposes a dedicated `Prüfungen Jahrgangsstufe <n>` folder containing atomic exam-task nodes; neither a standalone `Sek-I-Abschlussaufgaben Mathematik` capstone nor a single aggregate `Übungen Sekundarstufe I` branch may serve as the learner-facing route endpoint.

### Source Hygiene and Work-Package Layout {#sec:pp-seki-hygiene}

External reference tasks may be used solely for style, quality, and difficulty calibration — never copied, translated, closely paraphrased, or structurally cloned:

- Downloaded reference material stays strictly under `tmp/seki-math-exam-reference-pool/` (with a local `sources.json` or `README.md` recording URL, provider, retrieval date, year relevance, and intended use) and is **never** committed to Git.
- Preferred calibration pools: IQB Sek I / VERA-8, Landesbildungsserver / ZSL / Lehrerfortbildungsserver, institutionally curated task databases such as SMART, and official syllabus pages (avoid private worksheets with unclear rights, answer-key scrapers, or uncurated AI task lists).
- Whenever an external item inspires a task idea, record only the abstract design principle — never wording, numbers, story, diagram, or solution path.

Shared release checklist: `curricula/DE/Gymnasium/assessments/mathematik/seki/quality-checklist.md`; per-year work package layout (flat legacy files such as `j5_terminal_autonomy_v1.md` are superseded once a reviewed package is promoted):

```text
curricula/DE/Gymnasium/assessments/mathematik/seki/j5/
  blueprint.md & draft_v1.md & solution_v1.md
  internal_qa_v1.md & external_review.md
  findings.md & finding_resolution.md
  re_qa.md & release_candidate.md
```

### Ten-Step Gated Workflow and Release Rule {#sec:pp-seki-workflow}

:::table{cols="3.4cm,X",longtable=true}
| Step | Required artifact & gate criterion |
| --- | --- |
| **0. Reference pool** | At least two independent high-quality source families checked under `tmp/seki-math-exam-reference-pool/`; zero external task text committed. |
| **1. Checklist** | `quality-checklist.md` confirmed by the Product Owner or an external reviewer before drafting begins. |
| **2. Blueprint** | Year level, timing, covered canonical goal IDs, guiding ideas/process competencies, point/demand matrix, explicit non-coverage notes, and permitted aids recorded. |
| **3. Raw draft** | Age-appropriate context, accessible entry plus reasoning/checking/model-limit prompt per task, independent tasks free of hidden assumptions (`draft_v1.md`). |
| **4. Solution & BE** | Complete derivation, transparent `BE` points tied to observable student work, accepted alternative paths, and common-error notes (`solution_v1.md`). |
| **5. Internal QA** | `internal_qa_v1.md` grading every item `pass`, `fail`, `blocked`, or `not_applicable`; zero `fail`/`blocked` in release-critical sections. |
| **6. External review** | `external_review.md` with positive sign-off or concrete remediation work for every blocking finding. |
| **7. Iterate findings** | `findings.md` & `finding_resolution.md`; every finding marked `resolved`, `accepted_risk`, or `out_of_scope` with rationale. |
| **8. Re-QA & candidate** | `re_qa.md` & `release_candidate.md`: checklist complete, external blockers resolved, originality and source hygiene verified. |
| **9. Graph promotion** | Update canonical exam nodes (`examData.reviewStatus = "released"`, narrow `examData.coveredGoalIds`, actually assessed `requires`), refresh source/rationale reports, and pass full CI with tasks visible under `Prüfungen Jahrgangsstufe <n>`. |
:::
