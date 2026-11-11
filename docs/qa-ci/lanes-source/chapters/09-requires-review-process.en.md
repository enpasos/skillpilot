## Requires Review Process {#sec:qal-requires-review}

This chapter documents the repeatable manual authoring and QA workflow for reviewing prerequisite quality on atomic learning goals (`contains: []`): verifying that the didactic jump from prerequisites to target is teachably small and replacing coarse or misleading edges with clean atomic routes.

### Transition Semantics vs. Canonical Target State {#sec:qal-requires-semantics}

`app/scripts/generateRequiresReport.ts` (`npm run report:requires`) exposes both layers of the current compatibility model together with their origin:

- **`direct requires`:** Prerequisites authored directly on the atomic goal itself.
- **`effective requires`:** Direct prerequisites plus prerequisites inherited from ancestor clusters via `contains`.

While inspecting inherited origins is essential during migration, the binding target state remains a purely atomic prerequisite relation $R \subseteq A \times A$ ([Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)).

### Six-Step Review and Repair Workflow {#sec:qal-requires-workflow}

```bash
cd app
npm run report:requires -- \
  --input ../curricula/<...>/json/<file>.json \
  --decisions ../tmp/requires_decisions_<name>.json \
  --init-decisions
```

1. Initialize or update the decisions scaffold (default output: `../tmp/requires_findings_<curriculum>.md` containing summary counts, `not_ok` findings, and a full appendix listing `direct requires`, `effective requires`, and source clusters/goals).
2. Inspect direct and effective prerequisites plus inheritance origins for each atomic goal.
3. Formulate the **didactic delta**: what can the learner already do after the prerequisites, what is genuinely new in the target goal, and is that delta a single teachable step?
4. Record `ok`, `not_ok`, or `pending` in the JSON decisions file (mark `not_ok` only for real didactic defects — oversized jump, unrelated blocking prerequisites, or cluster edges hiding atomic dependencies — rather than graph neatness alone):

```json
{
  "goals": {
    "<goalId-a>": { "status": "ok" },
    "<goalId-b>": {
      "status": "not_ok",
      "problem": "what is didactically wrong",
      "proposal": "how to repair the requires structure"
    },
    "<goalId-c>": { "status": "pending" }
  }
}
```

5. For `not_ok` goals, apply one of four standard repairs: (a) add a bridge goal, (b) split the target goal (@ref{sec:qal-atomic-review}), (c) replace cluster-level `requires` with specific atomic prerequisites, or (d) remove redundant or over-blocking edges.
6. Re-run `cd app && npm run validate:graph` after accepted edits.
