# J5 Re-QA v3

Status: completed

Date: 2026-06-30

Target: `draft_v3.md`, `solution_v3.md`, `blueprint.md`, promoted canonical Task 1 node

---

## Checks

- [x] Task 1 no longer uses inventory numbers.
- [x] Teilaufgabe 3 no longer implies that a real material stock is unlimited.
- [x] The intended natural-number reasoning remains assessable at Jahrgangsstufe 5 level.
- [x] The expected result still matches the task numbers: $4 \cdot 125 + 6 \cdot 48 + 75 = 863$.
- [x] Rounding and ordering still match the solution: $863 ≈ 900$ and $750 < 863 < 900$.
- [x] Total score remains 6 BE for Task 1 and 30 BE for the full exam.
- [x] Covered goal IDs and `requires` remain unchanged because the assessed mathematical goals are unchanged.

Decision: Task 1 remains release-candidate-ready after the context correction.

---

## Checkpoint maintenance re-QA

Date: 2026-08-26

Reason: Task 4 was aligned with the canonical atomic split between linear
coordinate objects and circles from center and radius.

- [x] `draft_v3.md` and `solution_v3.md` use the same circle-line subtask and
      the same midpoint, radius, and equal-distance condition.
- [x] `blueprint.md` lists the compass and the new circle goal
      `1dd0266c-41b4-5481-b64b-7b718cfe799b`.
- [x] The promoted Task 4 node uses the same four narrow `requires` and
      `examData.coveredGoalIds` as the blueprint.
- [x] Rectangle-versus-square reasoning remains assessed in subtask 3.
- [x] Task 4 remains worth 6 BE and the full exam remains worth 30 BE.

Decision: Task 4 remains release-candidate-ready after the atomic-split
alignment.
