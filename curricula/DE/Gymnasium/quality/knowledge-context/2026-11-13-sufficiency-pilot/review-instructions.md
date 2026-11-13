# Review task: do the prerequisites of each goal suffice?

You review learning goals of a German Gymnasium curriculum that is modelled as a skill graph. Work read-only: do not create, change or delete any file in the repository, do not run git commands that change anything, and do not start other agents.

## Background

- A learning goal is one assessable competence with a title and a description ("Die lernende Person kann ...").
- A goal `requires` other goals. The **secured goals** of a goal are all goals it requires directly or transitively. The curriculum guarantees nothing else about a learner who starts the goal.
- **Baseline knowledge** is everyday knowledge and primary-school knowledge (up to grade 4). The catalog starts in grade 5. Whatever a goal of the catalog develops is not baseline knowledge.
- For each goal you get its **knowledge context**, derived mechanically from the graph: what it builds on, what leads on from it, the first goals of its area that are not secured, and the full list of secured goals.

## The question, for every goal of the block

Can a learner who has **exactly the secured goals plus baseline knowledge** learn this goal **as its description states it**?

Judge the description as written. Do not judge whether the goal is well chosen, well worded or well placed in a school year.

Report a finding only where the description cannot be met without the missing competence. A competence that would merely help, enrich examples or is usual in textbooks at that point is not a finding. If you are unsure whether something is needed, say so in the note and lower the confidence instead of dropping or inflating the finding.

There are three kinds of findings:

1. `missing_prerequisite`: the goal needs a competence that an **existing goal of the catalog** develops, and that goal is not secured. Name the existing goal by ID and title. Name the **nearest** goal that provides the competence, once; do not also list what that goal itself requires. If several catalog goals develop the same competence (the catalog models some content more than once for different school years), name the one that fits best and mention the others in the note.
2. `reaches_later`: a part of the description itself belongs to subject matter that the catalog develops only in a goal that requires this goal, or that clearly comes later. Quote the part and name the later goal.
3. `catalog_gap`: the goal needs a competence that is neither baseline knowledge nor developed by any goal of the catalog you can find. Say what you searched for.

A goal without any finding is `sufficient`.

## Material

All paths are absolute. Read them with your file tools; search the large listings with grep instead of reading them whole.

- Contexts of the block (one section per goal, separated by `---`): given in your task message.
- Listing of all ordinary goals of Mathematics, one per line, tab-separated `id`, `title`, `[areas]`, `description`:
  `<scratch>/catalog-mathematik.tsv (one line per ordinary Mathematics goal: id, title, [areas], description)`
- The same for Physics:
  `<scratch>/catalog-physik.tsv (the same for Physics)`
- If you need the knowledge context of another goal, you may run, from `app/`:
  `npx tsx scripts/deriveKnowledgeContext.ts <goalId> --full`
  This only reads. It is optional.

Before you name an existing goal as missing, check in the context of the reviewed goal that it is really not in the secured list. Check every goal ID you report against the listings; do not write an ID from memory.

## What to return

Return one final report and nothing else. It must contain:

1. A JSON array with exactly one object per goal of the block, in the order of the contexts file:

```json
{
  "goalId": "…",
  "title": "…",
  "verdict": "sufficient | not_sufficient",
  "findings": [
    {
      "kind": "missing_prerequisite | reaches_later | catalog_gap",
      "competence": "what is needed, in a few words",
      "evidence": "the words of the description that need it",
      "existingGoalId": "ID from the listings, or null for catalog_gap",
      "existingGoalTitle": "title, or null",
      "confidence": "high | medium | low",
      "note": "optional, short"
    }
  ]
}
```

2. After the array, at most ten lines of plain text: anything about the method or the material that limits your verdicts, and patterns you saw across the block.

Do not summarize the task back, and do not include goals outside the block.
