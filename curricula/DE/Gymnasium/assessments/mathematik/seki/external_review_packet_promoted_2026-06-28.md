# External Review Packet - Promoted Sek I Mathematics Exams

Review date target: after 2026-06-28 promotion

Scope:

- Subject: Mathematik
- School form: Gymnasium
- Stage: Sekundarstufe I
- Year levels: Jahrgangsstufen 5-10
- Curriculum file: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- Quality gate: `curricula/DE/Gymnasium/assessments/mathematik/seki/quality-checklist.md`
- Simulated release audit: `curricula/DE/Gymnasium/assessments/mathematik/seki/simulated_release_review_2026-06-28.md`

Review purpose:

Bitte prüfe den tatsächlich promoteten Stand, nicht nur die Markdown-Entwürfe. Die zentralen Fragen sind:

1. Sind die Aufgaben pro Jahrgang fachlich und sprachlich passend?
2. Tragen die Kontexte die Mathematik oder wirken sie künstlich?
3. Sind die Aufgaben kompetenzorientiert genug: erklären, prüfen, begründen, interpretieren, beurteilen?
4. Sind Aufgaben, Lösungen, Bewertungseinheiten und Zeitumfang realistisch?
5. Sind `requires` und `examData.coveredGoalIds` eng genug und fachlich passend?
6. Gibt es mathematische Fehler, unklare Formulierungen oder versteckte spätere Voraussetzungen?
7. Ist die Entfernung des alten Sek-I-Abschluss-Capstones zugunsten der Jahrgangsprüfungen didaktisch und graphlogisch stimmig?

Required review decision:

- [ ] `approved_for_release_candidate`
- [ ] `approved_with_minor_changes`
- [ ] `revision_required`
- [ ] `reject_and_redesign`

Decision rule:

- `approved_for_release_candidate`: keine fachlichen oder didaktischen Pflichtänderungen.
- `approved_with_minor_changes`: nur sprachliche oder kleine Scoring-/Klarheitskorrekturen.
- `revision_required`: mindestens ein Jahrgang oder eine Aufgabe braucht fachliche/didaktische Überarbeitung.
- `reject_and_redesign`: Grundstruktur, Jahrgangspassung oder Kontextansatz ist nicht tragfähig.

---

## Files to Review

| Year | Promoted draft | Solution | Blueprint | Review status |
| --- | --- | --- | --- | --- |
| J5 | `j5/draft_v3.md` | `j5/solution_v3.md` | `j5/blueprint.md` | externally reviewed before promotion |
| J6 | `j6/draft_v1.md` | `j6/solution_v1.md` | `j6/blueprint.md` | simulated internal review |
| J7 | `j7/draft_v1.md` | `j7/solution_v1.md` | `j7/blueprint.md` | simulated internal review |
| J8 | `j8/draft_v1.md` | `j8/solution_v1.md` | `j8/blueprint.md` | simulated internal review |
| J9 | `j9/draft_v1.md` | `j9/solution_v1.md` | `j9/blueprint.md` | simulated internal review |
| J10 | `j10/draft_v1.md` | `j10/solution_v1.md` | `j10/blueprint.md` | simulated internal review |

Legacy note:

The files `j5_terminal_autonomy_v1.md` through `j10_terminal_autonomy_v1.md` are intentionally marked `superseded`. They are audit pointers only and must not be reviewed as the current task source.

---

## Promoted Assessment Overview

| Year | Tasks | Total BE | Promoted source |
| --- | ---: | ---: | --- |
| J5 | 5 | 30 | `j5/draft_v3.md` |
| J6 | 6 | 36 | `j6/draft_v1.md` |
| J7 | 7 | 40 | `j7/draft_v1.md` |
| J8 | 7 | 44 | `j8/draft_v1.md` |
| J9 | 7 | 50 | `j9/draft_v1.md` |
| J10 | 6 | 64 | `j10/draft_v1.md` |

Promotion invariants already checked internally:

- JSON parses successfully.
- Every `requires`, `contains`, and `examData.coveredGoalIds` reference resolves to an existing goal.
- For promoted exam nodes, `requires` equals `examData.coveredGoalIds`.
- Promoted exam nodes no longer point to `j*_terminal_autonomy_v1.md`.
- No `Sek-I-Abschlussaufgaben Mathematik` node remains in the promoted curriculum JSON.

---

## Review Questions by Dimension

### A. Year-Level Fit

For each year:

- Are notation, terminology and reading load appropriate?
- Are the calculations realistic for the intended assessment duration?
- Are any topics too early or too late for the configured Gymnasium Sek I progression?
- Are J9/J10 extension topics still acceptable as terminal Sek-I Gymnasium tasks?

### B. Didactic Quality

For each task set:

- Does each context create a mathematical need?
- Are there decorative contexts that could be removed without changing the mathematics?
- Are practical checks and model limitations age-appropriate?
- Does the package avoid the old artificial mega-scenario pattern?

### C. Competency Orientation

Check whether the package contains:

- low-floor starts,
- meaningful representation changes,
- explanation or justification prompts,
- misconception or checking prompts,
- at least one model critique or limitation where a model is used.

### D. Mathematical Correctness

Check:

- all computations in `solution_v*.md`,
- all units and conversions,
- all percentage/probability interpretations,
- all geometric formulas and diagrams described in text,
- all function and algebra transformations,
- all scoring totals.

### E. Graph and Coverage Fit

Use the blueprints and promoted JSON:

- Does every task's `coveredGoalIds` list match what is actually assessed?
- Are any covered goals missing?
- Are any covered goals overclaimed?
- Are task-level `requires` too broad or too narrow?
- Do the year-level folders act as the correct terminal endpoints?

---

## Required Findings Ledger

Please report findings in this table format.

| ID | Severity | File / task | Finding | Required change |
| --- | --- | --- | --- | --- |
| EXT-001 | blocker / major / minor | e.g. `j8/draft_v1.md`, Task 4 |  |  |

Severity guide:

- `blocker`: mathematical error, severe year-level mismatch, copied/provenance-risk content, broken graph semantics.
- `major`: task needs redesign, unclear solution/scoring, overclaimed coverage, implausible context that harms the assessment.
- `minor`: wording, small scoring adjustment, local clarification, formatting.

For every `major` or `blocker`, please state whether only the Markdown package must change or whether the promoted curriculum JSON must also change.

---

## Preferred Review Output

Please return:

1. Overall decision.
2. Findings ledger.
3. Short year-by-year notes for J5-J10.
4. Specific approval or revision recommendation for the promoted graph structure.
5. Any optional improvement ideas separated clearly from required changes.

Do not rewrite tasks wholesale unless a redesign is required. The most useful feedback is a precise finding with a required change.
