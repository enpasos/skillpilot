## Atomic Review Process {#sec:qal-atomic-review}

This chapter documents the repeatable manual authoring and QA workflow for verifying whether existing leaf goals (`contains: []`) of a skill landscape represent genuinely atomic didactic steps and splitting bundled goals cleanly (complementing the ledger-enforced `CQR-301` gate in [Semantic Atomicity Review](repo:docs/qa-ci/semantic-atomicity-review.md)).

### Scope and Working Definition {#sec:qal-atomic-definition}

Reviews inspect one landscape JSON file per pass across goals with `contains: []`. Goal kinds governed by dedicated QA lanes are intentionally **excluded**:

- memorization goals tagged `memorization` or `srs-deck:*`,
- exam or task-bundle goals carrying `examData`,
- motivation or orientation goals (`Motivation`, `Orientation`).

A domain goal counts as **atomic** when all four criteria hold:

1. It states **one** primary competence action.
2. It is realistically assessable in **1–3 tasks**.
3. It represents **one small didactic step** relative to its prerequisites.
4. It hides no independent sub-skills inside one umbrella sentence (warning signs: multiple verbs at distinct cognitive levels, multiple content subdomains, or separate proof obligations).

### Seven-Step Review Workflow and Decision File {#sec:qal-atomic-workflow}

`app/scripts/generateAtomicReport.ts` (`npm run report:atomic`) prepares the decisions scaffold and findings report (`../tmp/atomic_findings_<curriculum>.md` containing summary counts, `not_ok` findings, and a full appendix):

```bash
cd app
npm run report:atomic -- \
  --input ../curricula/<...>/json/<file>.json \
  --decisions ../tmp/atomic_decisions_<name>.json \
  --init-decisions
```

1. Initialize or update the decisions scaffold.
2. Decompose each leaf goal semantically (action verbs, content objects, expected competence proof).
3. Judge whether splitting into 2–4 goals materially improves clarity and assessment (mark `not_ok` only for genuine didactic precision gains, never for wording aesthetics alone).
4. Record `ok`, `not_ok`, or `pending` in the JSON decisions file:

```json
{
  "goals": {
    "<goalId-a>": { "status": "ok" },
    "<goalId-b>": {
      "status": "not_ok",
      "problem": "why the goal is bundled",
      "proposal": "how to split it into 2-4 goals"
    },
    "<goalId-c>": { "status": "pending" }
  }
}
```

5. For `not_ok` goals, specify 2–4 replacement goals with updated `title`, `description`, `requires`, and parent `contains`.
6. After applying accepted splits, check acyclicity, reference integrity, and weights (atomic goals normally retain `weight = 1`; cluster weights reflect unique atomic descendant counts).
7. Run `cd app && npm run validate:graph`.
