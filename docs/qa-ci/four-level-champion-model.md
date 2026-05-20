# SkillPilot Quality Assurance: The Four-Level Champion Model

**Status:** Forward-looking QA plan for the continued evolution of the champion program.

## Positioning

This model describes a planned four-level QA cascade for SkillPilot curricula. Its purpose is to separate strict formal graph QA, agent-based checks, and human didactic review into clearly distinct stages.

The current positioning is important:

- `Level 1a` is already real in SkillPilot today, mainly through the CI pipeline and the graph/schema validators.
- `Level 2` corresponds to the current human champion perspective as the practical and didactic anchor.
- `Level 1b` and `Level 1c` are still **forward-looking** in this model. They describe planned static and dynamic agent-based QA stages, but they are not yet a fully established standard process.

This model refines the existing curriculum QA stage logic. The former `Level 1` is unfolded into the sublevels `1a`, `1b`, and `1c`: `1a` stands for algorithmic CI QA, `1b` for a forward-looking static AI agent, and `1c` for a forward-looking dynamic AI agent. `Level 2` remains the visible human champion certificate.

## Target picture

SkillPilot translates curricula into machine-readable competence graphs. The transition from an AI-derived raw state to a practically reliable QA stage should become scalable without overloading subject experts with graph details, JSON formalities, or technical validation rules.

For that reason, the QA role is differentiated into four stages:

## The 4 QA levels

### Level 1a: The CI pipeline

This level applies algorithmic and structural rules that can be checked without content interpretation.

- Focus: mathematical and technical integrity of the DAG
- Examples:
  - no cycles in `contains` and `requires`
  - no invalid redundant dependencies
  - valid projected learner views, schema checks, and ID checks

### Level 1b: The static AI agent

This level is **forward-looking**. A static agent should check structural and semantic guard rails that go beyond pure graph mathematics but do not require runtime simulation.

- Focus: statically checkable didactic and formal QA rules
- Examples:
  - didactic route coverage from motivation anchor to terminal autonomy
  - clean separation of `sourceRef` and didactic materials
  - formal completeness of exam nodes, scoring schemes, and machine-readable task fields

### Level 1c: The dynamic AI agent

This level is also **forward-looking**. A dynamic agent should walk through curricula like a simulated learner and test frontier logic, filters, and node types in practical runtime conditions.

- Focus: runtime behavior, dead ends, hidden blockers, learning-coach/exam mechanics
- Examples:
  - simulation of filters and modes
  - exam simulation with intentionally incomplete or incorrect answers
  - simulation of `Memorize` nodes and spaced-repetition behavior

### Level 2: The human champion

This level provides the practical didactic assessment in a real usage context.

- Focus: tone, age appropriateness, motivation, subject fit, and UX
- Task: The champion works through the curriculum in the UI or through the AI learning coach and judges whether it holds up in a real learning context.
- Outcome: Findings are recorded as issues or tickets; once the didactic quality is strong enough, this can lead to the existing visible QA signal for the curriculum.

## Workflow and governance

The target picture is human-agent teamwork:

1. `Level 1a` blocks mathematically or technically broken states early.
2. `Level 1b` and `Level 1c` should, in the future, pre-structure formal and simulated findings automatically.
3. `Level 2` evaluates real didactic practice quality.
4. Findings are worked through via issues and pull requests.
5. Human maintainers decide in cases of conflict and protect the intended didactic direction.

## Conclusion

The four-level champion model is a **forward-looking expansion plan** for SkillPilot QA. Today, the real anchors are especially the algorithmic CI QA (`Level 1a`) and the human champion practice (`Level 2`). The two agent-based intermediate stages (`Level 1b` and `Level 1c`) are deliberately framed as the next expansion steps, not as an already fully established standard process.
