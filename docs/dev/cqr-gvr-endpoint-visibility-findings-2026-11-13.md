# CQR-104: current endpoint visibility findings

Candidate evidence for the F5 work in
[the hard-gate plan](cqr-gvr-hard-gate-plan-2026-11-12.md), based on main
`2ad03c810c896d0bab96cd69d1cd96f45973d8e2`. This is not main or production
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
every finding and 381 raw input hashes: the measured canonical documents,
all view files read to determine membership, and the shared selector/evaluator
inputs. Its applicability-report hash binds derived
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

The current evaluator expects the Insulin/Plasmid assessment
(`1d0c84df-8040-5cab-8a7c-359366937e44`) and colour-vision assessment
(`7c7f147c-2b64-5b0c-90c1-ea9a9bf4b03a`) in both Sachsen-Anhalt Sek-II views
from their existing applicability metadata. Both views omit them. A separate
author analysis and independent task-contract review on 13 November examined
the actual tasks, solutions, rubrics, atomic goal descriptions and official
curriculum. They found a concrete **ST eAN/LK subject basis**, together with
contract gaps that prevent accepting an unchanged placement repair.

The official [Sachsen-Anhalt Biology curriculum, 1 August 2022](https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung_2022/FLP_Biologie_Gym_01082022_swd.pdf)
explicitly includes photoreceptors and colour/contrast perception at eAN
(printed/PDF pp. 57–59), and genetically modified organisms, restriction
enzymes, vectors and gel electrophoresis at eAN (pp. 60–61). The gAN pages
46–49 support broader perception, protein-biosynthesis and material-based
genetic-test work. They do not establish the same specific prior knowledge
for both unchanged tasks. A sufficiently supported transfer task could suit
gAN, but that requires its own task/material and course decision. Global
GK/LK tags inherited from Hessen do not decide ST applicability and must not
be narrowed globally merely to repair ST.

| Existing assessment | Actual task and rubric | Contract mismatch |
| --- | --- | --- |
| Insulin | Explain cDNA suitability for a bacterial host; match supplied fragment lengths to samples; explain DNA → mRNA → protein; distinguish DNA presence from functional expression. | 22 direct prerequisites include drift, Hardy–Weinberg, SNP analysis, epigenetics and other unneeded contracts. The two `coveredGoalIds` clusters expand to 36 ordinary atoms, far beyond the four assessed tasks. |
| Colour vision | Use a supplied cone model to interpret a possible effect of M-cone dysfunction and explain redundant signal design using contrast, position and other information. | 16 direct prerequisites include hearing, pain, Hebbian learning, ENG/ECG and other unneeded contracts. The two coverage clusters expand to 28 ordinary atoms; organ anatomy, complete visual pathways and detailed neural transduction are not tested. |

For Insulin, the existing atom
`374e6de5-0747-57cb-99e3-e50ccb371124` (compatible conditions for recombinant
protein expression) is a close contract candidate, with protein biosynthesis
already among its transitive prerequisites. The cDNA/intron knowledge required
by task 1 is not supplied in the material; the existing alternative-splicing
goal also demands protein diversity and evolutionary interpretation and is
too broad a substitute. Restriction and gel goals are possible preparation
candidates, **not automatically assessed coverage**: expected fragment lengths
are supplied, with no independent recognition-sequence or size-marker task.
Their complete atomic promises therefore cannot be copied into the coverage
list. The expression atom's current raw applicability is only `DE-HE`, with
an explicit mapping-inheritance boundary; an ST mapping needs its own evidence.

For colour vision, `9499943f-89b7-54e3-9fe2-e90404beaa4a` (structure and function
of selected sense organs) is a possible preparation candidate, but its full
promise is not tested. No exact existing atom for the narrow qualitative
cone/contrast performance was established. The listed sensitivity maxima do
not determine response curves or unique responses to the two wavelengths.
The present task supports a qualitative possible loss of information, not a
quantitative discrimination claim. A revised task must state the intended
inference and provide the necessary model/data; extra prerequisite edges
cannot supply missing task evidence.

Both tasks use a total of 30 points and a passing threshold of 18. Insulin
can pass with tasks 1–3 scoring 22 points and task 4 scoring zero; colour
vision can pass with tasks 1, 3 and 4 scoring 22 and the dysfunction analysis
in task 2 scoring zero. Thus passing alone does not demonstrate every claimed
atomic competence. Preparation, assessed coverage and globally recognized
mastery remain separate; neither `requires` nor visible placement writes
mastery. These counterexamples do not claim that existing learners have
already received an incorrect result.

The next subject-authoring step is a reviewed narrow Insulin eAN contract
that closes the cDNA preparation/material gap, followed by a precise colour-
vision target and matching task/rubric. The review must bind actual atomic
coverage, course-specific applicability, necessary preparation and the meaning
of a passing result. Both released identities also carry a separate
`assessmentApplicabilityBasis` referencing the old clusters; changing only
`coveredGoalIds` would leave that basis untouched. Before changing an existing
identity, check result/history and selection semantics explicitly and decide
whether a reviewed correction/migration or a distinct successor identity is
needed. No effect on existing learner records is asserted without that check.
Do not rewrite the frozen V9 evidence or silently reuse it for a changed goal.

Consequently this is F5's documented evidence-gap outcome, not an approved
replacement prerequisite list, new review pass or permission to place both
tasks in both ST courses. New assessment, coverage, applicability and result
contracts remain subject-authoring follow-up work. The availability of the
official PDF proves a source basis, not a finished atomic task contract.

The inspected inputs are reproducible without the exploratory drafts:

- [Canonical Biology](https://github.com/enpasos/skillpilot/blob/4d41e12a6c87671562422c7c5db39bfaaa1e77b2/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json),
  the two goal IDs above, including `examData`, `requires`,
  `assessmentApplicabilityBasis` and the referenced ordinary goals.
  Raw SHA-256: `0de1cfc92fd15d6633575f6f1da9aa78027feec4383e45f50ca738744977fe5e`.
- Retained official PDF at
  `curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf`,
  pp. 46–49 and 57–61, with official provenance recorded in the
  [source registry](https://github.com/enpasos/skillpilot/blob/4d41e12a6c87671562422c7c5db39bfaaa1e77b2/curricula/DE/Gymnasium/provenance/source-landscape-registry.json).
  Raw SHA-256: `58b106c65a71478a096f31cf8e9743a238a59aec085414ac472ee0ab5da10c38`.
- The preparation/coverage distinction and released-assessment identity
  boundary in [AGENTS.md](https://github.com/enpasos/skillpilot/blob/4d41e12a6c87671562422c7c5db39bfaaa1e77b2/AGENTS.md), sections 2 and 6.3. This audit
  changes none of those contracts or any curriculum/view bytes.

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
