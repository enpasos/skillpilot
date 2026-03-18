# Biology ABI Input Patterns

These notes abstract recurring patterns from the tracked external example pools.
They are intended for task construction, not for text reuse.

## Core design patterns

- Material-bound framing:
  most strong biology exam tasks start from material such as diagrams, data tables, microscopy results, phylogenetic trees, experiment descriptions, or field observations.

- Multi-step operator progression:
  a typical sequence is `describe/analyze -> explain using biology concepts -> evaluate or discuss consequences`.

- Contextualized biology:
  tasks are stronger when the biology is embedded in authentic contexts such as conservation, medicine, agriculture, neuroactive substances, or evolutionary field studies.

- Evidence-based reasoning:
  the task should force the learner to use the provided material as evidence, not only recall textbook knowledge.

- Comparison and transfer:
  many good tasks compare systems, species, environments, or physiological strategies and then ask for transfer to a nearby case.

## Useful material types for new SkillPilot tasks

- measured data tables with one or two hidden trends
- diagrams of physiological or ecological processes
- experiment summaries with controls, variables, and outcomes
- phylogenetic or pedigree material
- short scientific-context texts that require filtering relevant information

## Topic clusters repeatedly represented in source pools

- ecology and conservation conflicts
- evolution, phylogeny, and adaptation
- genetics and human disease
- plant physiology and environmental adaptation
- neurobiology and signaling
- metabolism and regulation

## Authoring guardrails

- Do not reuse original storylines too closely.
- Do not copy original figures, tables, or wording into SkillPilot tasks.
- Build new contexts, new data framing, and new question order.
- Keep the ABI-like qualities:
  - authentic materials
  - explicit operators
  - evidence-based explanation
  - at least one evaluative or reflective step where appropriate

## Recommended derivation workflow

1. Select one source only for calibration.
2. Extract its pattern at the level of:
   - material type
   - operator progression
   - reasoning demand
3. Discard the original context wording.
4. Rebuild a new task around a different but curriculum-aligned context.
5. Check that the new task cannot be mistaken for a paraphrase of the source.
