# Retirement of the mixed E.1 exam "Bewegungsanalyse und freier Fall"

Goal `a9562b05-c54d-5635-9244-3f7dd24a8642`, retired for all Länder on 25 November 2026.

## Why

On 24 November 2026 the Product Owner asked why this exam showed as a single exam on the board of
"E.1 Bewegungen und ihre Beschreibung", and whether it was needed, where, and whether it fitted
its context. The answers, read from the catalog:

- **It does not test what it claims.** The exam lists the free-fall experiment, road traffic and
  spreadsheet modelling as covered goals. Its four steps evaluate a given table for a uniformly
  accelerated motion (steps 1 and 2), calculate a free fall from a given height and a given g
  (step 3) and calculate one stopping distance (step 4). No step asks for an experiment, for
  measured data or for a spreadsheet.
- **Any one step can be left out.** The steps count 6, 7, 6 and 6 of 25 points and the pass mark
  is 15.
- **It no longer fits E.1.** Since the E.1 cut of 23 November 2026 road traffic belongs to E.2 and
  spreadsheet modelling to E.4.
- **Nothing is lost.** Road traffic and spreadsheet modelling have dedicated exams in all Länder.
  The free-fall experiment has its dedicated exam in Hesse and Saxony only. In the other Länder it
  had none before and has none now, because this exam never asked for an experiment.

`retirement.actual.json` lists each claim with the other active exams of the claimed goal.

## What changed

- **Catalog.** The exam moved from "Übungen E-Phase" (`424b07df…`) to the retained mixed
  assessments (`151edbf8…`). Its `applicability` is empty and it carries the marker
  `applicabilityProjection: excluded`. Three goals differ from the base commit: the exam and the
  two containers.
- **Views.** 64 of the 90 Physics views offered the exam as an atomic target. Its node is removed
  from each of them. In every one of the 64 views all other atomic targets and all
  prerequisite-only goals are unchanged; the other 26 views are byte-identical.
- **Unit material.** `he-e1-motion-practice.json` no longer names the exam as closing exam of the
  parent unit (`/unit/assessmentGoalId` removed, nothing else). The parent unit is checked by its
  four contract parts A to D.
- **Semantic kinds.** The three changed goals keep the kind `practiceAssessment`; their source
  fingerprints are renewed.

## What did not change

- Task, solution, rubric, pass mark, `requires` and `coveredGoalIds` of the exam: the goal keeps
  its released content as history. The coverage claims are inert, because a retained mixed
  assessment confers no recognition.
- The four contract parts, the planning credit and its fingerprint, the two voluntary exams, the
  introductions, exercises and images of the E.1 material.
- The Hessian source mapping of the legacy goal `835bab73…` onto this exam (source assignment).

## Stored data

A stored pass stays with this goal id; nothing is copied, reset or transferred. A stored plan that
names the exam stays valid and is read without that entry (Product Owner decision of
24 November 2026). A new plan cannot select it. A stored active goal that names the exam does not
block the practice of the focused unit.

## Files

| File | Content |
|---|---|
| `retirement.actual.json` | The record: reason with the four claims, goal and catalog delta, the 64 views with hashes and role counts, generator inputs, semantic kinds, material successor, stored-data rules |
| `goal.before.json`, `goal.after.json` | The exam goal at the base commit and now |
| `material.before.json`, `material.after.json` | The E.1 parent material before and after; the before bytes equal the after bytes of the earlier one-field successor (`zb-successor-voluntary-scope-20261124`) |

## Checks that bind this record

- `app/scripts/testPhysicsGoalBookInputs.ts`: goal, catalog, all 90 views, semantic kinds and the
  material chain against the record.
- `app/scripts/testHessePhysicsGuidedEntryMaterials.ts`: the reviewed introduction through both
  one-field material successors.
- `scripts/test_generate_laender_physics_stage_views.py`: the frozen seed authority of every view
  with the exam restored for comparison; the exam may not return and no other seed may leave with
  it.
- `backend/…/ClaudeV1CompletionRouteIntegrationTest`: a stored plan naming the exam stays valid;
  the coach offers no closing exam for the E.1 parent and the child unit's own exam for
  "Freier Fall schwerer Kugeln".
