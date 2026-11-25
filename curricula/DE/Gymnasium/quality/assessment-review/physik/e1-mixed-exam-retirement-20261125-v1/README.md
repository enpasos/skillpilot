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
- **No real check is lost.** Counted over all 90 Physics views: spreadsheet modelling keeps its
  dedicated exam in each of the 68 views where it is a target. Road traffic keeps an exam that
  requires it in each of its 70 views: its dedicated exam in 12 of them and, in 64, the mixed exam
  "Kontextaufgaben zu Sport, Verkehr und Sicherheit lösen", which has the same build and stays
  until the E.2 review. The free-fall experiment has its dedicated exam in 13 of its 68 views
  (Hesse 8, Saxony 3, the national cross-stage views 2). In 52 views the retired exam was the only exam that named the experiment as a
  prerequisite; it asked for no experiment, so those views had no real check of it before and
  have none now. The review of the free-fall routes in the follow-up package decides where a
  dedicated exam is needed.

`retirement.actual.json` lists each claim with the active exams that remain, counted per view.

## What changed

- **Catalog.** The exam moved from "Übungen E-Phase" (`424b07df…`) to the retained mixed
  assessments (`151edbf8…`). Its `applicability` is empty and it carries the marker
  `applicabilityProjection: excluded`. Three goals differ from the base commit: the exam and the
  two containers.
- **Views.** 64 of the 90 Physics views offered the exam as an atomic target. Its node is removed
  from each of them. In every one of the 64 views all other atomic targets and all
  prerequisite-only goals are unchanged; the other 26 views are byte-identical.
- **Unit material.** `he-e1-motion-practice.json` no longer names the exam as closing exam of the
  parent unit (`/unit/assessmentGoalId` removed, nothing else). The parent unit therefore offers
  no single closing exam. Its four parts A to D remain: as the unit assignment in the six contract
  views when the unit-assignment pilot is on, and as ordinary exams on the boards of the child
  units otherwise (the pilot defaults to off, and two of the eight material views have no
  contract).
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
names the exam together with other valid goals stays valid and is read without that entry (Product
Owner decision of 24 November 2026). A plan that names only this exam stays stored unchanged and is
outdated, as before. A new plan cannot select it. A learner whose stored active goal is the exam is
treated as having no active goal: the coach offers the frontier and describes the focused unit with
its activities. Before this change the coach left out the focused unit in that case; the guard in
`LearnerService.getCoachActiveGoalContext` now uses the visible active goal, not the stored id.

## Files

| File | Content |
|---|---|
| `retirement.actual.json` | The record: reason with the four claims, goal and catalog delta, the 64 views with hashes and role counts, generator inputs, semantic kinds, material successor, stored-data rules |
| `goal.before.json`, `goal.after.json` | The exam goal at the base commit and now |
| `material.before.json`, `material.after.json` | The E.1 parent material before and after; the before bytes equal the after bytes of the earlier one-field successor (`zb-successor-voluntary-scope-20261124`) |
| `follow-up-checks.actual.json` | Measured effects beyond the 64 view nodes: the learning set of each changed view, the Mathematics demand policy and the quality status |

## Measured effects

- **Learning sets.** In each of the 64 changed views the learning set (atomic targets and
  prerequisite-only goals plus all their prerequisites in every subject) loses exactly the retired
  exam. No other Physics goal and no Mathematics goal leaves or enters it.
- **Mathematics demand.** The Mathematics views place 1,036 demands of Physics goals. All rows are
  identical to the base commit; only the 48 pinned hashes of changed Physics source views are
  renewed in `app/scripts/config/math-foreign-acquisition-demand.json`.
- **Quality status.** No rule status and no maturity level changed: Physics M7, both stages M4.
  The active terminal exams of the Sek II scope go from 111 to 110.

## Checks that bind this record

The tests assert what must stay true (the exam is excluded, has one owner, appears in no view, keeps
its released content; the material chain; stored plans). The hashes of views, catalog and ledgers
in the two records describe the state of 25 November 2026 and are not compared with later bytes.

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
