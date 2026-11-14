# Review task: subject review of candidate prerequisites

You review candidate changes to a German Gymnasium curriculum that is modelled as a skill graph. Work read-only: do not create, change or delete any file in the repository, do not run git commands that change anything, and do not start other agents.

## Background

- A learning goal is one assessable competence with a title and a description ("Die lernende Person kann ...").
- A goal `requires` other goals. The **secured goals** of a goal are all goals it requires directly or transitively. The curriculum guarantees nothing else about a learner who starts the goal.
- **Baseline knowledge** is everyday knowledge and primary-school knowledge (up to grade 4). The catalog starts in grade 5. Whatever a goal of the catalog develops is not baseline knowledge.
- Rule of use: what some goal of the catalog develops may be used in a goal only if that goal is secured.
- A `requires` edge is a pedagogical modelling decision. It must point backwards on a sensible learning path (to an earlier grade or phase, or to an earlier goal of the same area), it must not create a cycle, and the relation must stay transitively minimal. The catalog models some content more than once for different school years (for example grade 9/10 and the introductory phase "E" of upper secondary). In German upper secondary, "E" is the introductory phase, "Q1" to "Q4" the qualification phase; GK is the basic course, LK the advanced course.
- A goal's `applicability.jurisdiction` lists the German states in which the goal is part of the curriculum. A prerequisite is part of the learning scope wherever a goal that requires it is.

A pilot on 13 November 2026 asked two independent reviewers whether the secured goals of each goal suffice to learn it as described. The candidates below are the findings on which both reviewers agreed with high confidence. Your task is to decide what to do about each finding. The pilot findings are input, not a verdict: they may be wrong.

## Questions for a candidate edge

1. **Need.** Does the goal's description, as written, need a competence that the candidate develops? Not "would help" or "is usual in textbooks", but "the description cannot be met without it". Answer `needed`, `partly` or `not_needed`.
2. **Best goal.** Is the candidate the right goal to require? Search the listings for other goals that develop the same competence. If another goal fits better (it is the one a learner on this path has actually done, it comes earlier on the same path, or it is narrower and still sufficient), name it by ID. Check that it is not already secured, and that it does not require the goal (that would be a cycle).
3. **Direction and scope.** Does the edge point backwards on a sensible learning path? Would it bring goals into the learning scope where they do not belong, for example a goal of a later phase into a lower-secondary configuration, or a goal of another subject?
4. **Verdict.** One of `add` (add the candidate edge), `add_other` (add an edge to the goal you name instead), `reject` (the competence is baseline knowledge, not needed, or already provided), or `change_goal` (the edge is the wrong remedy, the goal's description or placement should change instead; say how).

For the forced removals listed at the top of the material: they follow mechanically from transitive minimality and change no secured set. Comment on them only if you see a problem.

## Questions for a goal that reaches into later subject matter

1. **Confirm.** Does the quoted part of the description really belong to subject matter that a later goal develops? Answer `confirmed` or `not_confirmed`.
2. **Remedy.** Which remedy fits best:
   - `narrow_description`: the description should no longer require that part (quote what would go). A changed description needs a new description review and must stay faithful to the official source of the goal.
   - `reorder`: the later goal, or a narrower existing goal, should become a prerequisite. Only possible if it does not require this goal.
   - `split`: the goal mixes two steps that belong to different places on the learning path.
   - `keep`: leave it as it is (explain why the finding does not hold).
3. **Verdict and rationale.**

## Material

All paths are absolute. Read them with your file tools; search the large listings with grep instead of reading them whole.

- The candidates, each with the goal, the candidate prerequisite or later goal, what the pilot reviewers wrote, computed structural facts and the current knowledge context of the goal:
  `<scratch>/candidates.md`
- Listing of all ordinary goals of Mathematics, one per line, tab-separated `id`, `title`, `[areas]`, `description`:
  `<scratch>/catalog-mathematik.tsv`
- The same for Physics:
  `<scratch>/catalog-physik.tsv`
- If you need the knowledge context of another goal, you may run, from `/home/enpasos/projects/skillpilot/app`, with Node 20 on the path (`export PATH=/home/enpasos/projects/skillpilot/tmp/ci-tools/node-v20.20.2-linux-x64/bin:$PATH`):
  `npx tsx scripts/deriveKnowledgeContext.ts <goalId> --full`
  This only reads. It is optional.
- The canonical curriculum files are under `/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/canonical/`. Do not read them whole; they are large. Search them with grep if you need a field of a goal.

Check every goal ID you report against the listings; do not write an ID from memory. If you consult an official source document, cite its path and passage. Do not claim that a source says something you did not read.

## What to return

Return one final report and nothing else. It must contain:

1. A JSON array with exactly one object per candidate, in the order of the material:

```json
{
  "candidate": 1,
  "goalId": "…",
  "type": "edge | reaches_later",
  "need": "needed | partly | not_needed | confirmed | not_confirmed",
  "verdict": "add | add_other | reject | change_goal | narrow_description | reorder | split | keep",
  "otherGoalId": "ID from the listings if the verdict names another goal, else null",
  "otherGoalTitle": "title, or null",
  "confidence": "high | medium | low",
  "rationale": "at most three sentences",
  "concerns": "scope, direction or source concerns, or null"
}
```

2. After the array, at most ten lines of plain text: patterns across the candidates, and anything about the method or the material that limits your verdicts.

Do not summarize the task back.
