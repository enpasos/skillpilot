## The Foundation: Reviewed Learning Goals and Suitable Materials {#sec:foundation}

Protected data and traceable progress are one side of trust. Equally important is the quality of the goals on which the learning path is built. This section describes the review status achieved, the role of human trials, and the planned addition of further materials.

### Current Focus: Gymnasium in Germany {#sec:gymnasium-focus}

SkillPilot’s current development and content focus is **Gymnasium, Germany’s academic secondary school track, across all 16 federal states**. The shared “Gymnasium (DE)” entry provides access to subject-level skill graphs through state-specific mappings and views. Shared competencies are grouped by subject, while differences between state curricula, school stages, and course profiles remain represented. Shared learning goals are therefore maintained once rather than separately for every federal state; subject-specific improvements can benefit all state views built on those goals.

**Mathematics, Physics, Chemistry, Biology, and Economics have reached M7**, the highest machine-assessed maturity level. Machine quality assurance is complete for each subject’s current set of content goals. All five are maintained as shared subject curricula with state-specific mappings. Other Gymnasium subjects are at varying stages of development and are being expanded gradually.

Coverage and quality are reported by subject, year group, and federal state. The current subject coverage and quality evidence for the specific area selected are reported in the [Curriculum Directory](https://skillpilot.com/curricula) and the generated quality status.

The machine-readable maturity levels **M0 to M7** assess, among other things, graph integrity, federal-state coverage, route coverage, assessment-ready tasks, and memory-card traceability. A maturity level always applies only to the precisely named scope and content version. Equal maturity levels can therefore coexist with different breadths of subject development.

**M7 means fully completed machine quality assurance, not human approval.** In addition to continuing to meet M6, every current individual content goal (`curricularAtomic`) must satisfy all five gates:

- **D — Descriptions:** Two independent reviews with resolved decisions.
- **P — Understanding profiles:** Reviewed requirements for what demonstrates understanding of a goal. This is curriculum QA, not a retrospective review of individual chat answers.
- **A — Atomicity:** A subject-specific justification for treating the competence as a single learning goal.
- **M — Memory:** A justified decision on whether any content needs to be memorized and, if so, which content.
- **V — Visualizations:** A subject-specific AI image review of the current image with valid content bindings, or an explicitly permitted subject-specific exception.

What counts is the **intersection of all five gates across the current goal set**, together with passed final validation checks and no open M7 blockers. Evidence is bound to the reviewed content and context; changes may require targeted re-review. The M7 status of the five subjects remains verifiable in the [quality report](https://enpasos.github.io/skillpilot/qa-ci/status/curriculum-quality-status/).

100% means complete coverage by this QA process, not guaranteed freedom from errors or demonstrated classroom effectiveness. The [quality and human-trial concept](https://enpasos.github.io/skillpilot/concept/curriculum-quality-and-human-trial/) explains the binding rules.

**How the reviewed goals work in actual learning is tested separately.** **Curriculum Champions** contribute their subject expertise to this process:

- Champions take responsibility for a curriculum or a **clearly scoped topic area**.
- They **work through learning goals themselves** and report errors or unclear content directly on the relevant goal wherever a feedback entry is available.
- Larger, cross-cutting or technical topics, and feedback on other curricula, are collected on GitHub.
- The Champion role is voluntary. Public goal feedback does not require Champion registration or a GitHub account.
- Champion profiles show learning progress and available quality status, not rankings by feedback volume or Issues/PRs.

**Human trials are a separate attribute, not M8.** They can start at the core QA level M5 and do not have to wait for M7. Existing learning progress by an active Champion in the assigned scope, or an explicitly confirmed start, counts as “Human QA in progress,” provided the trial is not paused; the registration date is irrelevant. “Human-tested,” by contrast, requires evidence of a complete run-through, no open blocking findings, and explicit confirmation of completion. M7 alone does not meet these conditions.

The QA process covers more than curricula: the SkillPilot AI learning coach is continuously evaluated and improved in ongoing use to keep learning reliable and educationally meaningful across real curricula.

> A clearer learning route can begin with your feedback. Choose a manageable topic area, work through the goals yourself, and report where questions remain. **[Become a Curriculum Champion](https://skillpilot.com/curricula)** and contribute your subject expertise to our shared development work.

### One Goal, Different Approaches: Finding Suitable Materials {#sec:learning-materials}

A clearly described learning goal leaves room for the explanation or exercise that helps each person most. This is where the planned integration of additional materials comes in.

**One learning goal. Different ways to understand.**

*Vision · in development*

::figure{#fig:learning-materials}

**External learning materials are connected to the curriculum, not built into it.** A separate mapping layer connects explanations, tasks, books, videos, and interactive resources to suitable learning goals and, through them, to learning plans. Materials can remain where they are already published. The shared competence structure remains independent of individual providers and resources.

**Teachers and learners should be able to select, combine, and switch suitable materials.** Teachers can contribute their subject expertise and pedagogical experience by selecting resources that fit their lessons and the needs of their learning group. At the same time, learners retain room for their own approaches and material choices. Teachers’ pedagogical design and learners’ independence complement each other.

Selecting materials or switching providers changes neither curricular learning goals nor progress already recorded. The integration is optional; opening a resource is not evidence of competence. Free and paid resources use the same architectural framework. Selecting a resource grants neither additional usage rights nor automatic access to its contents by the AI.

**SkillPilot aims to support the purposeful use of existing educational resources, not take them over.** OER initiatives, publishers, educational portals, and other contributors with relevant expertise should be able to map their materials to suitable learning goals without providing a complete progress-management system themselves. Making open educational resources accessible and helping people actually build skills belong together.

The architectural framework is defined. The details of mappings and exchange formats are being explored with real resources and are intended to be developed together with the people who create and use those materials. We are starting with [**Physik Libre**](https://physikbuch.schule/). This starting point requires neither complete resource coverage nor an agreed partnership with the provider.

*Further reading: [Content integration architecture](https://github.com/enpasos/skillpilot/blob/main/docs/concept/skill-graph/content-integration.md).*

### Outlook: Applying the Approach to Higher Education {#sec:higher-education}

The repository also contains content for other school types, higher education, and CEFR-based language learning. These illustrate how the approach transfers to other settings, but they are not the current development focus.

Bologna/EHEA sets the framework for **outcomes, transparency, recognition, and quality** in higher education. SkillPilot can support these goals, but it does not replace institutional decisions.

- **Learning outcomes / competencies:** Contribution: Make outcomes navigable as a skill graph and progress visible. Limits/prerequisites: Sound modeling, source references, and versioning.
- **Credits/workload (ECTS logic):** Contribution: Support paths, prerequisites, and workload transparency. Limits/prerequisites: **No credit awarding**; rules remain institutional.
- **Recognition/mobility:** Integrity-protected exports support the transfer of documented learning progress. They are not publicly verifiable achievement certificates; recognition remains an institutional process with its own evidence requirements (section 4.2).
- **Quality assurance:** Contribution: Signals about obstacles and paths to inform teaching development. Limits/prerequisites: QA processes and transparent AI rules are required.
