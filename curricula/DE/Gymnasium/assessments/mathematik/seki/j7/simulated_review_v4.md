# Focused GFM Table-Rendering Review - J7 Mathematics Exam v4

Reviewer: Codex focused technical and didactic QA

Review date: 2026-08-07

Decision: approved for promotion of Task 7 v4

Scope:

- `draft_v4.md`, Task 7
- `solution_v4.md`, Task 7
- `blueprint.md`, source version and design notes
- preservation of all previously promoted v1, v2 and v3 source artifacts

## Finding and Resolution

Task 7 encoded the two groups as consecutive pipe rows without a header and a GFM delimiter row. GFM therefore treated the intended table as ordinary paragraph text, so both the cockpit and the coaching chat displayed literal pipe characters.

The v4 source gives the data an explicit `Gruppe` header, seven labelled time columns and the required delimiter row. Nord and Süd remain data rows. All 14 values, wording, mathematical requirements, point values, prerequisites and covered goals are unchanged.

## Verification and Promotion

- `remark-gfm` parses the Task 7 block as a table rather than as a paragraph.
- The header, delimiter and both data rows have the same eight-column shape.
- The canonical runtime task references `draft_v4.md` and retains the stable goal ID, graph links, demand levels and scoring.
- Canonical Tasks 1-3 continue to reference `draft_v1.md`; Task 4 continues to reference `draft_v2.md`; Tasks 5 and 6 continue to reference `draft_v3.md`.
- All previously promoted source versions remain byte-unchanged.

With these conditions satisfied, Task 7 v4 is ready for promotion.
