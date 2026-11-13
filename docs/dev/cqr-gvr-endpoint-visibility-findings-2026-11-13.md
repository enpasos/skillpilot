# CQR-104: current endpoint visibility findings

Candidate evidence for the F5 work in
[the hard-gate plan](cqr-gvr-hard-gate-plan-2026-11-12.md), based on main
`4aace519463880860c4c634eee2e801a48098df9`. This is not main or production
acceptance. The existing eight required visibility scopes remain required;
the four upper-secondary gaps are not promoted by this report.

## Reproduce the measurement

```bash
npm --prefix app run report:route-endpoint-visibility -- \
  --output ../docs/qa-ci/status/route-endpoint-visibility-audit.json
```

The command exits **1** while any measured obligation fails. It invokes the
actual CQR-104 evaluator, first with the missing `SekII` configuration and
then with the existing compiled-jurisdiction mode. It does not change the
registered profiles, pins, applicability, assessment contracts or reviews.
The [JSON report](../qa-ci/status/route-endpoint-visibility-audit.json) contains
every finding and raw hashes of the measured canonical documents, relevant
views and evaluator files. Its applicability-report hash binds derived
compiler output, not new source evidence or a complete provenance receipt.

## Implemented corrections

The evaluator now uses each authored view's course and duration filters for
both the actual projection and the independently expected endpoints, in every
subject. Previously this was complete only for Economics. For example, an
LK-only ENG/ECG assessment cannot be required in the national Biology GK view.
Country applicability alone does not establish course or duration applicability.

The national Biology view already referenced eight assessment collections,
but used shallow `goalEntry` nodes. Those references displayed the folders
without their tasks. They now use `canonicalSubtree`, retaining the same
identities, labels, roles and canonical contents. Of their 26 existing
assessments, 21 belong in the GK projection; five LK-only tasks remain filtered
out. No task, prerequisite, source claim, assessment coverage or review was
authored by this projection correction.

`testBiologyAssessmentProjection.ts`, invoked by `test:graph-gate-contracts`,
reproduces the old shallow-folder failure, checks the exact restored GK task
set independently from the view, retains all previous canonical atomic
targets, and checks the LK exclusion. It also runs the actual evaluator over
all eight pinned scopes and verifies that the remaining Biology gaps still
fail. This is a partial repair, not twelve-scope acceptance.

## Remaining findings after the correction

Counts below are **view/jurisdiction projections**, not additional QA scopes.
Each subject is still one unpinned upper-secondary QA scope.

| Scope | Relevant views | Compiled projections | Projections missing expected endpoints | Other findings |
| --- | ---: | ---: | ---: | --- |
| Mathematics Sek II | 80 | 140 | 140 | State/course/stage placement and assessment obligations need reconciliation. |
| Physics Sek II | 68 | 128 | 64 | 60 projections also expose unexpected terminals under this prospective configuration. |
| Chemistry Sek II | 41 | 101 | 101 | Two configured terminals have no compiled jurisdiction applicability. |
| Biology Sek II | 3 | 18 | 2 | Five national-view jurisdictions have no applicable configured terminal. |

The simpler, non-jurisdiction-expanded configuration still fails in 80/80
Mathematics, 64/68 Physics, 41/41 Chemistry and 2/3 Biology views. It is not
a substitute for the scoped applicability check.

### Biology

The two Sachsen-Anhalt Sek-II views still omit the independently applicable
Insulin/Plasmid assessment (`1d0c84df-8040-5cab-8a7c-359366937e44`) and
colour-vision assessment (`7c7f147c-2b64-5b0c-90c1-ea9a9bf4b03a`). Their
current narrow authored target sets do not themselves establish that adding
the complete assessment demand is an appropriate placement correction.
Reconcile the reviewed stage targets and the actual assessment requirements
before changing those views.

In the national GK view, BW, NI, HB, HH and SL still have no applicable
configured terminal. Exposing another folder cannot create the missing
applicability/assessment evidence. Review existing suitable assessments and
their actual coverage first; if none applies, author and independently review
an appropriate assessment. Do not broaden an applicability override just to
remove these findings.

### Chemistry

The two endpoints without compiled applicability are
`eed5eda3-2daf-5d48-b935-23dadd622d9b` (chemical knowledge development, with
course assignment explicitly unresolved) and
`d7abdeb3-5b69-5744-b7fd-8149fd92b0d5` (Grignard alcohol synthesis). Source,
course and assessment evidence must settle these cases before pinning the
whole scope. The report separately lists missing placements in all 101
compiled projections; hiding these two endpoints would not resolve them.

### Physics and Mathematics

The report names every missing/unexpected endpoint by view, jurisdiction and
goal ID. Physics already has deliberate stage-specific and prerequisite-only
assessment placements. These cannot be converted wholesale into target
endpoints. Mathematics likewise needs its state/course-specific assessment
collections checked against authoritative target scope and actual tasks.
Restoring Biology's already authored national collections does not authorize
adding every canonical examination to every state view.

## Decision after the Biology package

Matching course/duration filters is a shared evaluator correction. The remaining
curriculum gaps have different causes and do **not** support one bulk repair
across all four subjects. Keep `compositionVisibilityRequired` unchanged until
a complete subject scope passes with independent applicability and assessment
evidence. `CQR-104` therefore remains `PARTIAL` at eight of twelve scopes.
Even twelve passing scopes would not by itself prove the additional semantic
route obligation of `GD-C22` or the broader assessment/runtime obligations of
`GD-A18`.
