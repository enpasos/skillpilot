# Atomic Review Process

This page documents the repeatable manual QA workflow for checking whether existing atomic goals are actually atomic.
It is an authoring and review process, not a CI rule set.

## Purpose

- Verify that each atomic goal represents one didactic step.
- Detect bundled goals that should be split into smaller goals.
- Keep `contains`, `requires`, and weights consistent after a split.

## Scope

- Review one landscape JSON per pass.
- Review only goals with `contains: []`.
- Use tooling to prepare reports, but keep the final decision human and didactic.

## Out of scope

These goal types are intentionally not split by the atomic review:

- Memorization goals tagged with `memorization` or `srs-deck:*`
- Exam or task-bundle goals with `examData`
- Motivation or orientation goals such as tagged `Motivation` or `Orientation`

These areas need their own quality checks instead of atomic splitting.

## Working definition

A goal is considered atomic if all of the following are true:

- It describes one main competence action.
- It is realistically assessable in 1-3 tasks.
- It is one small didactic step relative to its prerequisites.
- It does not hide multiple independent sub-skills behind one sentence.

Typical warning signs for a non-atomic goal:

- Several verbs with different cognitive levels
- Several content objects or subdomains in one statement
- Several independent proof obligations in the expected performance

## Review workflow

1. Generate or update the decisions scaffold.

```bash
cd app
npm run report:atomic -- \
  --input ../curricula/<...>/json/<file>.json \
  --decisions ../tmp/atomic_decisions_<name>.json \
  --init-decisions
```

2. Read one atomic goal at a time and break it down semantically:

- Which action verbs are present?
- Which content objects are acted on?
- What is the expected proof of competence?

3. Apply the manual check:

- Is there exactly one main action?
- Is that action clearly testable?
- Is the didactic step small enough?
- Would a split into 2 or more goals improve clarity and assessment?

4. Record a decision in the decisions file:

- `ok`
- `not_ok`
- `pending`

5. If the goal is `not_ok`, propose a split:

- 2-4 replacement goals
- updated `title` and `description`
- updated `requires`
- updated parent `contains`

6. After implementing the accepted split, verify:

- no `requires` or `contains` cycles
- no orphaned references
- consistent weights

7. Run the validator:

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
      "problem": "why the goal is bundled",
      "proposal": "how to split it"
    },
    "<goalId>": { "status": "pending" }
  }
}
```

## Report output

The generated report contains:

- summary counts
- a findings section with only `not_ok` goals
- an appendix with all reviewed atomic goals

Default command output:

- decisions file: manually chosen via `--decisions`
- report file: `../tmp/atomic_findings_<curriculum>.md`

## Implementation notes

- Script: `app/scripts/generateAtomicReport.ts`
- NPM command: `npm run report:atomic`
- Atomic goals usually keep `weight = 1`.
- Cluster weights should reflect the count of unique atomic descendants after a split.

## Recommended decision standard

Use `not_ok` only if the split improves actual didactic precision, not just wording aesthetics.
If the current goal is still one coherent, testable step, keep it as `ok`.
