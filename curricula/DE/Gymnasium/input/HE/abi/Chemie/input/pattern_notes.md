# Chemistry ABI Input Patterns

These notes abstract recurring patterns from official chemistry example pools and the Hessen 2026 focus specification.
They are intended for authoring guidance, not for text reuse.

## Core design patterns

- Material-bound chemistry tasks:
  strong tasks start from data, reaction schemes, structural formulas, experimental setups, process diagrams, or sustainability comparison tables.

- Multi-step operator progression:
  a common sequence is `describe / identify -> explain using chemistry concepts -> calculate -> evaluate or decide`.

- Context-rich chemistry:
  good tasks embed chemistry in medicine, cosmetics, energy systems, environmental protection, food chemistry, or materials science.

- Evidence over recall:
  provided data must matter. Learners should not be able to solve the task by textbook recall alone.

- Model plus limitation:
  chemistry tasks often require using a model such as equilibrium, intermolecular forces, polymerization, or energy conversion and then judging its practical limits.

## Useful material types for new SkillPilot tasks

- tables with temperatures, pH values, yields, or equilibrium concentrations
- structural formulas and reaction schemes
- process diagrams for technical plants or product cycles
- short experiment descriptions with observations
- sustainability matrices comparing options

## Topic clusters repeatedly represented in source pools

- acid-base chemistry and indicators
- organic functional groups and structure-property relations
- polymer chemistry and materials evaluation
- chemical equilibrium and catalysis
- energy conversion and sustainable chemistry

## Authoring guardrails

- Do not reuse original storylines too closely.
- Do not copy third-party task wording, task numbers, or given data tables.
- Rebuild new tasks with different contexts, different numerical values, and newly written operator sequences.
- Preserve ABI-like qualities:
  - clear operator profile
  - relevant material basis
  - at least one calculation or quantitative interpretation where appropriate
  - at least one evaluative step in context

## Recommended derivation workflow

1. Choose one source for calibration only.
2. Extract its pattern on the level of:
   - material type
   - operator progression
   - chemistry concepts used
   - reasoning depth
3. Discard the original wording and data framing.
4. Rebuild a new curriculum-aligned task around a different but comparable context.
5. Check that the new task is not a paraphrase of the source.
