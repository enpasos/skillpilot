## Curriculum Quality: QA Maturity Levels and Human Trials {#sec:qa-quality-human-trial}

:::note{title="Status and companion specifications"}
Binding overall specification for Issue #49. Technical dashboard derivation is specified in @ref{sec:qa-maturity-scopes-cqr} and operational Curriculum Champion workflows in @ref{sec:qa-champion-guide}. Implementation builds directly on existing quality reports, review ledgers, Champion assignments, and completion records without introducing a parallel QA pipeline or general certification engine.
:::

### Objective, Guiding Principles, and QA Maturity Levels `M0`–`M7` {#sec:qa-human-trial-levels}

SkillPilot communicates the quality of a skill landscape through two **orthogonal** dimensions:

1. **QA maturity `M0`–`M7`:** Which mandatory quality gates are completely satisfied for the current content snapshot?
2. **Human trial:** Does an assigned Champion's learning progress show an active trial, has the Champion explicitly confirmed starting a trial, or has one Champion worked through and confirmed the entire advertised scope?

> **Maturity describes the verified inspection stage. Champion status describes practical human trial.** (Example: *Physics · M7 · Human-tested* — never a blanket guarantee of zero defects.)

Maturity levels form a cumulative ladder derived strictly from current central verification evidence (never copied from historical milestones or manual badges); human trials do not create a milestone `M8`:

:::table{cols="1.8cm,X"}
| Level | Domain statement |
| --- | --- |
| **`M0`** | No reliable baseline QA state established yet. |
| **`M1`** | Sources and extracted syllabus goals are ingested and traceable to official URLs. |
| **`M2`** | Source coverage, state/jurisdiction views, and course-level mappings are consistent. |
| **`M3`** | Required learning routes are closed and cleanly modeled at the atomic goal layer. |
| **`M4`** | Required learning routes including their terminal practice/exam endpoints are verified. |
| **`M5`** | School-ready core QA stage: all mandatory core checks pass. |
| **`M6`** | `M5` plus reviewed memory-learning decisions, deck traces, and view visibility. |
| **`M7`** | `M6` plus strictly completed deep curriculum QA across every current `curricularAtomic` goal of the subject. |
:::

### Normative Definition of `M7` and Image Governance {#sec:qa-human-trial-m7}

`M7` requires **every** current `curricularAtomic` goal of the subject to satisfy the **strict intersection of all five gates** simultaneously (never summing or averaging gate counters or accepting rounded percentages; partial progress renders e.g. as *M6 · Deep QA: 472 of 478 learning goals completed*):

:::table{cols="3.8cm,X"}
| Gate | Required evidence |
| --- | --- |
| **D – Descriptions** | Two independent description reviews with resolved synthesis bound to current content and context. |
| **P – Understanding evidence** | Current, fully validated `positive-understanding-evidence-v2` profile with truthful approval status. |
| **A – Atomicity** | Current domain decision confirming semantic atomicity and scope (@ref{sec:qa-semantic-atomicity}). |
| **M – Memory** | Current justified decision on memorization necessity plus card and view-visibility traces. |
| **V – Visualizations** | Current domain AI image inspection bound to the exact active asset hash and content bindings (technical deferrals never count as exceptions). |
:::

```text
M7 achieved =
    M6 still satisfied
    AND current goal denominator uniquely determined and non-empty
    AND every current curricularAtomic goal passes all 5 gates (D/P/A/M/V)
    AND required closeout checks pass
    AND zero open M7-relevant blockers
```

- **Separation from human approvals:** `M7` is a machine closeout gate and never mints human approvals (`needs_human_review` stays untouched; neither `humanApproved` nor `humanIssueIdentified` satisfies or blocks Gate V/M7, while human findings remain separately visible).
- **Image principles & separate release gate:** (1) `KEEP` by default for sound existing visuals regardless of generator/age, (2) domain accuracy over origin, (3) generation is not approval, (4) genuine content inspection rather than mechanical hash refreshes, (5) human findings remain independently effective. Separate CI check `checkGoalVisualizationQaApprovalCoverage.ts` acts as an image release gate (accepting an existing human approval or current AI approval while still blocking open human defect findings even at machine `M7`).

### Practical Human Trials by Curriculum Champions {#sec:qa-human-trial-champions}

Regular school-facing Champion trials require at least core QA stage **`M5`** (and may run in parallel with `M7` work) across three states:

:::table{cols="3.6cm,5.4cm,X"}
| State | Precondition | Visible badge |
| --- | --- | --- |
| **Not started** | Neither in-scope progress by an active Champion nor an explicit trial start | Baseline status from QA maturity |
| **In progress** | Active, unpaused Champion role with in-scope progress or confirmed start | **Human QA in progress** |
| **Completed** | One Champion's full practical run across the advertised scope + final confirmation | **Human-tested** |
:::

- **Start signal (Product Owner decision, 20 September 2026):** Existing learning progress (>= 1 completed goal inside the active Champion role's assigned scope once `>= M5`) automatically counts as **Human QA in progress** — regardless of registration date or when progress occurred. With zero progress, **"Begin trial"** remains available; registration alone, out-of-scope progress, or paused/ended roles never trigger the status. Existing mastery is strictly a start signal, never completion proof (100 % imported or manually set mastery alone never produces "Human-tested").
- **Four conditions for "Human-tested":** (1) one complete pass across the advertised scope by **at least one individual Champion** (partial passes across multiple people are never pooled), (2) genuine content-bound practical completion evidence, (3) zero known unresolved blocking defects (completing a goal does not auto-close a reported bug), and (4) a single explicit final confirmation (*"All goals completed. Complete trial?"*).
- **Scope binding, curriculum edits & pause/resignation:** An explicit trial action binds its scope (e.g., *Physics, Hesse, Upper Secondary* never certifies all states or stages). When curriculum content changes, `M7` reverts to the proven lower milestone if current goals become open, while human trials require re-testing only new or materially changed stations. Paused or unfinished trials drop the active "Human QA in progress" badge; a validly confirmed completion remains preserved even if the Champion later resigns.

### Visual Presentation, Gray-to-Green Scale, Privacy, and Acceptance {#sec:qa-human-trial-ui-acceptance}

Every UI surface consumes the same central derivation, labels, and ordered **gray-to-green scale** from `M0` (neutral light gray) through `M1`–`M4` (progressively stronger gray-green/green) and `M5` (medium green) to `M6` (vivid green) and `M7` (deep saturated green) — always paired accessibly with milestone code and text in both light and dark modes. Beside it, the trial status badge independently shows **Experimental** (`< M5`, muted warning), **Machine QA** (`>= M5` with no active/completed human trial, orange — combinable with a green `M7` badge), **Human QA in progress** (muted green), or **Human-tested** (vivid green with check icon). Collection rows such as *Gymnasium (DE)* never inherit a single subject's top milestone or trial badge, instead summarizing factually (e.g., *Human QA in 2 subjects*). Public QA artifacts exclude all private learner, session, and chat data.

:::table{cols="4.3cm,X"}
| Acceptance area | Normative verification requirement |
| --- | --- |
| **`M7` award & counters** | Granted solely on valid `M6` plus strict 5-gate intersection across all current goals; zero averaging, rounding, or deferred-work exemptions. |
| **Approval authority** | AI records never masquerade as human approvals; explicit human defect findings remain active. |
| **Trial start & closeout** | In-scope progress (date-independent) or explicit start triggers "in progress"; completion requires one full individual pass, zero blockers, and final confirmation. |
| **Scope, UI & collections** | Partial scopes stay bounded, edits invalidate only affected stations, uniform gray-to-green palette everywhere, zero blanket collection promotion. |
:::
