## SkillPilot Quality Assurance: The Four-Level Champion Model {#sec:qa-four-level-model}

:::note{title="Forward-looking expansion roadmap"}
Target architecture for scaling curriculum QA across algorithmic CI, AI agents, and human practice reviews. Currently shipped public maturity and trial badges are governed strictly by @ref{sec:qa-quality-human-trial} (`Level 1a` and `Level 2` are active anchors today, whereas `Level 1b` and `Level 1c` represent planned expansion stages).
:::

### Positioning and the Four QA Levels {#sec:qa-four-levels}

To scale from AI-derived raw graphs to classroom-ready skill landscapes without burdening domain educators with JSON schemas or DAG invariants, this roadmap unfolds the former `Level 1` into three automated/agentic stages (`1a`, `1b`, `1c`) ahead of the human practice certificate (`Level 2`):

:::table{cols="3.8cm,2.8cm,X"}
| Level | Current status | Inspection focus and representative checks |
| --- | --- | --- |
| **`Level 1a`: CI pipeline** | **Active today** | Content-agnostic algorithmic integrity: acyclicity of `contains`/`requires`, schema and ID checks, valid projected learner views (@ref{sec:qa-graph-validation}). |
| **`Level 1b`: Static AI agent** | Forward-looking | Static didactic and formal guardrails without runtime simulation: route coverage from motivation to autonomy, clean separation of `sourceRef` and didactic assets, formal completeness of exam and rubric schemas. |
| **`Level 1c`: Dynamic AI agent** | Forward-looking | Simulated learner walkthroughs under live runtime rules: frontier and filter behavior, dead ends or hidden blockers, exam simulations with incomplete/wrong answers, and SRS `Memorize` mechanics. |
| **`Level 2`: Human Champion** | **Active today** | Authentic pedagogical evaluation in the WebGUI or AI coach: tone, age fit, motivation, subject alignment, and UX — filing issues/PRs toward **Human-tested** (@ref{sec:qa-champion-guide}). |
:::

### Human-Agent Workflow and Governance {#sec:qa-four-levels-governance}

The cascade operates as structured human-agent teamwork:

1. `Level 1a` blocks mathematically or structurally broken graphs automatically in CI.
2. `Level 1b` and `Level 1c` are designed to pre-triage static and simulated findings at scale.
3. `Level 2` evaluates real pedagogical quality in authentic learning contexts.
4. Findings are tracked and resolved transparently via GitHub issues and pull requests.
5. Human maintainers arbitrate edge cases and safeguard pedagogical intent.
