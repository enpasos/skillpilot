# Focused Rendering Review - J7 Mathematics Exam v2

Reviewer: Codex focused technical and didactic QA

Review date: 2026-07-22

Decision: approved for promotion of Task 4 v2

Scope:

- `draft_v2.md`, Task 4
- `solution_v2.md`, Task 4
- `blueprint.md`, Task 4 version and design notes
- preservation of all previously promoted v1 source artifacts

---

## Finding and Resolution

Task 4 in v1 wrote the amount as `$1.80 EUR$`. Inside mathematical markup, KaTeX interprets the three letters in `EUR` as italic mathematical variables and does not insert the spacing expected between an amount and its currency. This produced the visibly malformed `1.80EUR` presentation in the learner-facing cockpit.

Task 4 v2 uses the established mathematical typesetting convention `$1{,}80\,\mathrm{EUR}$`:

- `{,}` renders the German decimal comma without mathematical punctuation spacing;
- `\,` inserts a small space between amount and currency;
- `\mathrm{EUR}` renders the currency code upright instead of as variables.

The same convention is applied to all currency amounts in the matching Task 4 solution. No wording, mathematical requirement, point value, prerequisite or covered goal changes.

---

## Verification

### Rendering correctness

- The task amount renders as `1,80 EUR` with an upright currency code and visible separation.
- The solution consistently renders `1,80 EUR`, `81 EUR` and `0 EUR` in the same form.
- The formula remains mathematically unchanged: `K(n) = 1,80n`.

### Didactic and scoring stability

- The task continues to assess proportional functions, the rule of three and the function concept.
- All four subtasks and their point allocations remain unchanged.
- The expected result for 45 cards remains 81 EUR.
- The total remains 7 BE and the passing threshold remains 4 BE.

---

## Promotion Conditions

- Canonical Tasks 1-3 and 5-7 continue to reference `draft_v1.md`.
- Canonical Task 4 references `draft_v2.md` and embeds the matching v2 task and solution text.
- Canonical Task 4 retains the same `requires`, `coveredGoalIds`, demand levels, total points and passing threshold.
- The package README and blueprint identify v2 as the promoted source for Task 4.

With these conditions satisfied, Task 4 v2 is ready for promotion.
