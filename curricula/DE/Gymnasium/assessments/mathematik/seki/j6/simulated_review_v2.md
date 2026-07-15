# Focused Didactic Review - J6 Mathematics Exam v2

Reviewer: Codex focused didactic QA

Review date: 2026-07-15

Decision: approved for promotion of Task 6 v2

Scope:

- `draft_v2.md`, Task 6.2
- `solution_v2.md`, Task 6.2 and the Task 6 scoring focus
- `blueprint.md`, Task 6 coverage
- preservation of `draft_v1.md` and `solution_v1.md`

---

## Finding and Resolution

The v1 prompt named an incorrect percentage and mentioned a chart with a truncated axis, but it did not show the chart or specify clearly which quantities it compared. The diagram critique was therefore under-specified and could be answered generically without interpreting a concrete representation.

Task 6.2 in v2 resolves this issue by:

1. requiring the learner to calculate the overall proportion from the given table and round it to a whole percent;
2. showing a concrete column chart for the totals `60` and `50` with an axis starting at `40`;
3. asking for the specific false impression caused by that truncation.

No other task content is revised. The v1 artifacts remain immutable.

---

## Verification

### Mathematical correctness

- Registered children: `20 + 25 + 15 = 60`.
- Attending children: `18 + 20 + 12 = 50`.
- Overall proportion: `50/60 = 5/6 \approx 0.8333`, hence `83 %` when rounded to a whole percent.
- With the visible baseline at `40`, the displayed column heights are `20` and `10`. The drawing can therefore make `60` appear twice as large as `50`, although `50` is five sixths of `60` and differs by only `10`.

### Didactic fit

- Low floor: totals and percentage can be computed directly from the table.
- Higher ceiling: the learner must connect the axis choice to the distorted visible ratio instead of merely stating that truncated axes are problematic.
- Representation change: table values are related to a percentage and then to a chart.
- Year-level fit: the arithmetic and the diagram critique remain suitable for Jahrgangsstufe 6.
- Scoring fit: 1 BE is available for the correctly rounded percentage and 1 BE for a mathematically sound explanation of the misleading impression.

### Curriculum alignment

The revised prompt directly assesses:

- `71d43fcc-d787-4874-ae4a-2336364e9c0a` - Grundaufgaben der Prozentrechnung lösen;
- `72b6bfa5-8e34-4029-8f85-0277207c485e` - Prozentangaben in Texten deuten und prüfen;
- `0c2ddfcd-1399-41ad-aaed-4f061812602a` - Diagramme deuten;
- `acbb7e26-f85f-405b-a3e5-affa6add6711` - Diagramme kritisch interpretieren.

The remaining Task 6 goals and the total of 6 BE are unchanged.

---

## Promotion Conditions

- Canonical Tasks 1-5 continue to reference `draft_v1.md`.
- Canonical Task 6 references `draft_v2.md` and embeds the matching v2 task and solution text.
- Canonical Task 6 includes the directly assessed percentage-calculation goal in both `requires` and `examData.coveredGoalIds`.
- The canonical description and scoring wording use the v2 focus.

With these conditions satisfied, Task 6 v2 is didactically consistent and ready for promotion.
