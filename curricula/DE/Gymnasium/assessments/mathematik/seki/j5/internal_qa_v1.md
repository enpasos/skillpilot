# J5 Internal QA v1

Status: internal draft QA

Reviewed files:

- `blueprint.md`
- `draft_v1.md`
- `solution_v1.md`
- `reference-scan.md`
- `../quality-checklist.md`

Date: 2026-06-26

Decision: `needs_external_review`

---

## Summary

The draft package is ready for external didactic review, but not ready for release.

Release blockers still open:

- external review has not happened
- no re-QA after external findings exists
- no promotion into `examData` should happen before findings are resolved

---

## Checklist Assessment

### 0. Pedagogical Design Pattern Gate

Status: preliminary pass, external review required.

- Low floor / high ceiling: pass. Each task starts with direct data work and develops toward explanation, misconception diagnosis, model limit, or practical decision.
- AfB cascade: pass. The package contains reproduction, connection/modelling, and reflection components.
- Representation change: pass. The package uses tables, coordinates, scale, equations, and verbal interpretation.
- Misconception design: pass. Task 2 uses a plausible integer-distance misconception.
- Authenticity: pass with minor review risk. Contexts are plausible school contexts; reviewer should check whether tasks 3 and 4 overlap too much in measurement.
- Model critique loop: pass. Tasks 3, 4, and 5 ask for interpretation, limits, or practical consequences.
- Dominant verbs: pass. The package uses `berechne`, but also `erkläre`, `widerlege`, `entscheide`, `begründe`, and `prüfe`.

### 1. Source Hygiene and Originality

Status: pass for internal QA.

- Reference files are local-only under `tmp/seki-math-exam-reference-pool/`.
- The committed reference scan contains only abstract observations, not task content.
- Draft v1 was written independently from the blueprint.

### 2. Curriculum and Graph Fit

Status: pass for blueprint, not yet promoted.

- Target is clearly J5.
- Blueprint lists intended canonical goal IDs.
- Promotion into graph data is explicitly blocked until release.

Review note:

- If released, existing J5 exam nodes should be replaced or expanded deliberately; do not import the draft by bulk-copying all target IDs to every node.

### 3. Year-Level Appropriateness

Status: preliminary pass.

- No fractions, formal functions, roots, trigonometry, or later algebraic transformations are used.
- Integer work is limited to ordering and distance on a number line.
- Equation work is limited to inverse operations and practical interpretation.

### 4. Task Set Composition

Status: pass with review risk.

- The package mixes arithmetic, integers, coordinates, area/perimeter, scale, and equations.
- Potential issue: tasks 3 and 4 both use measurement/rectangles; external review should decide whether this is acceptable or whether one should be replaced by a figure/angle/classification task.

### 5. Context Quality

Status: preliminary pass.

- Contexts are school-realistic and compact.
- Contexts are not one copied umbrella scenario.
- The data is intentionally simple but not absurd.

### 6. Low-Floor / High-Ceiling Structure

Status: pass.

- Low-floor entries: read table, order temperatures, find side lengths, complete scale table, solve direct equations.
- Higher-ceiling prompts: no largest natural number, misconception diagnosis, model limit, scale decision, remainder interpretation.

### 7. Mathematical Correctness

Status: pass.

- Arithmetic and units checked.
- Edge cases checked: integer distance, area vs. perimeter, scale conversion, insufficient band length, remainder grouping.

### 8. Solution and Scoring

Status: preliminary pass.

- Every task has a solution and BE mapping.
- Partial-credit notes are present.

Review note:

- A reviewer should check whether 36 BE is too much for 45 minutes and whether the BE split should be compressed to 30 BE.

### 9. Language, Accessibility, and Formatting

Status: pass.

- Markdown renders as plain text and tables.
- Wording is direct and learner-facing.

### 10. External Review

Status: blocked.

- External review has not yet happened.
- Findings file does not yet exist.
- Re-QA does not yet exist.

### 11. Promotion into `examData`

Status: blocked.

- No graph or `examData` changes should be made from this package yet.

---

## Internal Findings

| ID | Priority | Finding | Proposed handling |
| --- | --- | --- | --- |
| J5-QA-001 | medium | Tasks 3 and 4 both emphasize measurement and rectangular situations. | External reviewer should decide whether to keep this as intentional reinforcement or replace one task with a geometry/figure task. |
| J5-QA-002 | low | The package has 36 BE; current released J5 artifact has 30 BE. | Decide target duration before promotion. |
| J5-QA-003 | low | Angle work is listed in J5 goals but not central in this package. | Accept as non-coverage or revise blueprint if a broader year exam is desired. |
