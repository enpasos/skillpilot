# Requires Review Process

This page documents the repeatable manual QA workflow for reviewing prerequisite quality on atomic goals.
It is an authoring and review process, not a CI rule set.

## Purpose

- Inspect the actual prerequisite set of each atomic goal.
- Judge whether the didactic jump from prerequisites to target goal is small enough.
- Replace coarse or misleading prerequisite edges with cleaner atomic routes where needed.

## Current semantics

The current review works on the compatibility model used by runtime and validator:

- `direct requires`: prerequisites declared on the goal itself
- `effective requires`: direct prerequisites plus inherited prerequisites from ancestor clusters

This is useful during migration. The long-term modeling target is still a canonical atomic prerequisite layer.

## Scope

- Review one landscape JSON per pass.
- Review only goals with `contains: []`.
- Use report tooling to expose direct and effective prerequisites with origin.

## Review workflow

1. Generate or update the decisions scaffold.

```bash
cd app
npm run report:requires -- \
  --input ../curricula/<...>/json/<file>.json \
  --decisions ../tmp/requires_decisions_<name>.json \
  --init-decisions
```

2. For each atomic goal, inspect:

- direct prerequisites
- effective prerequisites
- origin of inherited prerequisites

3. Write a short didactic delta statement:

- What can the learner already do after the prerequisites?
- What is new in the target goal?
- Is that new part one small step or several bundled steps?

4. Record a decision in the decisions file:

- `ok`
- `not_ok`
- `pending`

5. If the goal is `not_ok`, choose one of the standard repairs:

- add a bridge goal
- split the target goal
- replace cluster-level prerequisites with specific atomic prerequisites
- remove redundant or over-blocking prerequisites

6. Re-run graph validation after accepted changes:

```bash
cd app
npm run validate:graph
```

## Decision file

The review tool uses a manually maintained JSON file:

```json
{
  "goals": {
    "<goalId>": { "status": "ok" },
    "<goalId>": {
      "status": "not_ok",
      "problem": "what is didactically wrong",
      "proposal": "how to repair the requires structure"
    },
    "<goalId>": { "status": "pending" }
  }
}
```

## Report output

The generated report contains:

- summary counts
- a findings section with only `not_ok` goals
- an appendix for all atomic goals
- per-goal columns for:
  - `direct requires`
  - `effective requires`
  - source cluster or source goal origins

Default command output:

- decisions file: manually chosen via `--decisions`
- report file: `../tmp/requires_findings_<curriculum>.md`

## Implementation notes

- Script: `app/scripts/generateRequiresReport.ts`
- NPM command: `npm run report:requires`
- The report includes inherited prerequisite origins, which is important when reviewing cluster-level compatibility edges.

## Recommended decision standard

Mark a goal as `not_ok` only if the current prerequisite set creates a real didactic problem:

- the learner jump is too large
- the goal is blocked by unrelated prerequisites
- a cluster edge hides the actual atomic dependency structure

Do not optimize for graph neatness alone. Optimize for teachable step size.
