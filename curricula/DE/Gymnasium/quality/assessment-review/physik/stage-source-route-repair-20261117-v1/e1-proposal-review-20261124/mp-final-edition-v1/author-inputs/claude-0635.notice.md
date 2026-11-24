## 24 Nov 2026, 06:35 CET

**Released for review: the developed edition of the multiphase exam `2b9e565f`.** Author:
a Claude Opus agent; it has not reviewed its own work.
- `proposals/exam-mp-model-check-edition.goal.json`, SHA-256 `2f8fb6bacb78981267337e03a9d947cdc8144f51633c7f90f9eab2a419ea423d`
- `proposals/exam-mp-model-check-edition.README.md`, SHA-256 `6a4c37e00aba6dfabd0bf918f3c3787782d746368f8dbfd1b2d6364246b24923` (changes part by
  part, each clause of MOD mapped to a rubric item, scoring arithmetic, worked solution,
  answers to your two rounds' objections, integration notes, the author's doubts)

What it is: parts 1 to 4, their solutions and rubric rows are byte-identical to your
`mp-current/approved-current.goal.json`. New are Material 4 (three test jumps with
measured ranges near 3.0 m against the predicted [3.70; 4.39] m, car length and
wheelbase, a bound on the effect of air resistance) and part 5 as a model check that is
meant to evidence the whole of MOD. Requires WW and MOD, covers MOD only. 36 BE, pass at
28; the row for part 5 gives 7 BE only for all five core points, so the author's
arithmetic says a pass without the full MOD core is impossible.

Please have your reviewers look first at:
1. whether the physics of the intended answer holds and is gradable at E.1 level (the
   point-mass idealisation fails at the edge because the car is as long as the range and
   tips; air resistance and input uncertainty cannot explain the gap);
2. the scoring: the jump from 1 to 7 BE in the last row and the pass mark rising from
   60 to 78 percent. The README contains a lighter alternative; if both rounds prefer
   it, say so and the author will build it;
3. whether part 5 really evidences every clause of the current MOD description.

For integration, after an accepting review only:
- **Same id or new id.** The recognition claim changes (the three old claims are
  withdrawn, MOD is new). `AGENTS.md` section 4 asks for a new assessment id or an
  explicitly reviewed migration in that case. Choose what section 4 and your versioning
  of material revisions require and record it; stored results of the old edition stay
  untouched and must not count for MOD.
- **Do not integrate it unreleased.** The exam is in the voluntary Leistungskurs list of
  E.1; with status `needs_review` the backend would turn the voluntary exams into
  required ones (see `draftSupplementaryAssessmentCannotExemptASectionOrDisappearFromItsPlan`).
  Until the review accepts it, the present released edition stays in place.
- One editorial point the author left alone to keep your text byte-identical: the German
  solution of part 4 uses decimal commas while the rest of the task uses decimal points.

