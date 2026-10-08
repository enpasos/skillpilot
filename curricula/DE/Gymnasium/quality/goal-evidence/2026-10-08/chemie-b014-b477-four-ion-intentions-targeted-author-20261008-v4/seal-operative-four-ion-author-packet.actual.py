#!/usr/bin/env python3
"""Create an inactive exact author packet; never apply or approve source roles."""
import hashlib
import json
import pathlib
from datetime import datetime, timezone

OWN = pathlib.Path(__file__).resolve().parent
ROOT = OWN.parents[6]
SEAL = OWN / 'four-ion-intentions-whole-source-author-v4.first.freeze.json'
assert not SEAL.exists(), 'An existing first seal must not be overwritten'

def read(path):
    return json.loads(path.read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def binding(path):
    return {'path': str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
            'sha256': digest(path), 'bytes': path.stat().st_size}

def write(name, data):
    target = OWN / name
    assert not target.exists(), str(target)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return target

inputs = read(OWN / 'operative-three-whole-source-cases-and-retention-check.actual.json')['inputBindings']
for item in inputs:
    assert binding(ROOT / item['path']) == item, item['path']

# The corrected source plan has three new cases and three visible target goals.
# Correct the inherited initial-plan gate wording before the immutable seal.
plan_path = OWN / 'two-source-row-operative-current-scope-union-plan.pending-two-real-reviews.author-v4.json'
plan = read(plan_path)
plan['requiredNextGates'][0] = ('Two genuinely eligible independent targeted A/B reviews of all three new whole DE/EN '
    'cases, actual original26/44–46 source scope and the full four-intention map; this author cannot be an independent '
    'reviewer of these authored cases.')
plan['requiredNextGates'][1] = ('Judge the pending operative1c/fd/a44 source-role union using the retained full water-ion '
    'and chloride witnesses and the three new bromide/carbonate/ammonium cases. d2/413 remain unchanged supplementary '
    'science/prerequisite knowledge and have no invented current BB/BE target/source assignment. Do not reopen valid '
    'accepted old science or present model data as real experiments.')
plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')

# Preserve mutable exact repository inputs for later review without redistributing
# third-party PDFs or creating any new image copies.
snapshot_dir = OWN / 'exact-repository-input-snapshots'
assert not snapshot_dir.exists()
snapshot_dir.mkdir()
snapshots = []
for index, item in enumerate(inputs):
    original = ROOT / item['path']
    if original.is_relative_to(ROOT) and original.suffix.lower() not in {'.pdf', '.png', '.jpg', '.jpeg'}:
        target = snapshot_dir / (f'{index:02d}.' + original.name)
        target.write_bytes(original.read_bytes())
        assert digest(target) == item['sha256']
        snapshots.append({'originalInput': item, 'exactSnapshot': binding(target),
                          'snapshotIsReviewEvidenceNotAnActiveReplacement': True})
snapshot_manifest = write('exact-current-repository-input-snapshots.manifest.json', {
    'role': 'Byte-exact retained repository input snapshots; original source paths and stage remain authoritative',
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'snapshots': snapshots,
    'thirdPartyPdfCopiesAdded': 0, 'imageCopiesAdded': 0,
    'externalMethodPdfBindings': [item for item in inputs if item['path'].startswith('/tmp/')],
    'externalMethodPdfSourceUrls': ['https://edu.rsc.org/download?ac=523338', 'https://edu.rsc.org/download?ac=523339'],
    'beforeAnyRootIntegrationCurrentOriginalBindingsAndAffectedContextsMustBeRebased': True})

operative_names = [
    'three-operative-new-whole-DEEN-ion-source-cases.manifest.author-v4.json',
    'one-new-whole-bromide-DEEN-current-a44-source-case.author-v4.json',
    'two-new-whole-carbonate-ammonium-DEEN-source-cases.author-v4.json',
    'four-original-ion-intentions-operative-current-scope-witness-map.author-v4.json',
    'two-source-row-operative-current-scope-union-plan.pending-two-real-reviews.author-v4.json',
    'whole-current-seven-goal-read-contexts.exact.json',
    'retained-three-current-strict-P-records.exact.json',
    'retained-four-whole-a44-and-580-DEEN-cases.exact.json',
    'two-whole-BBBE-original-source-goals-decisions-and-edges.exact.json',
    'actual-primary-curricular-and-method-source-boundaries.author.json',
    'native-retained-P-three-and-current-four-BBBE-scope-check.actual.json',
    'operative-three-whole-source-cases-and-retention-check.actual.json',
    'native-check.actual.run.json', 'source-case-check.actual.run.json',
    snapshot_manifest.name]
history_names = [
    'four-original-ion-intentions-to-exact-whole-goal-case-witness-map.author-v4.json',
    'two-source-row-operative-union-plan.pending-two-real-reviews.author-v4.json',
    'native-check.initial-five-member-union-scope-HOLD.actual.run.json',
    'native-check.initial-five-member-union-scope-HOLD.actual.stdout.txt',
    'native-check.initial-five-member-union-scope-HOLD.actual.stderr.txt',
    'native-check.initial-diagnostics-shape.actual.run.json',
    'native-check.initial-diagnostics-shape.actual.stdout.txt',
    'native-check.initial-diagnostics-shape.actual.stderr.txt']

readme = OWN / 'AUTHOR-READINESS.md'
assert not readme.exists()
readme.write_text('''# Four-ion source witness author candidate v4

This is an inactive AUTHOR package. All three new complete DE/EN cases, materials,
tasks, model answers and transfers are AI candidates at E1/G1 and need human review.
The author is not eligible as an independent reviewer of these new cases. Two new
eligible independent targeted reviews remain required. No source row, whole goal,
human evidence, actual learner practical performance or M7 gain is approved here.

## Exact bounded source role

The whole original BB/BE pages26,44–46 were read. The original Q3.2 binding
investigation intentions for chloride, bromide, carbonate, hydroxide, oxonium and
ammonium are preserved. E-phase recommendations are not transferred to this Q-stage
row. The two original source IDs, complete source bodies, course/stage fields and
old decisions remain intact. The candidate union changes only the intended partner
IDs for these two source rows to the current target-visible1c/fd/a44 goals. Other
topic duties, organic-family tests, protein/Biuret, O2/H2 and MWG are not introduced
as additional duties by this package.

Chloride uses the two retained complete a44 cases and unchanged current whole P.
Three new bounded complete source cases for bromide, carbonate and ammonium are
hosted under the existing whole a44 goal. The original whole a44,413 and580 P
records and their accepted science are retained unchanged. The 413 organic
substitution context is supplementary methods knowledge. The580 CO2 case does not
uniquely identify carbonate. The9dee protein/ammonium goal has no current BB/BE
applicability and is not claimed as the operative source witness.

The new materials state fictional, supplied, teacher-controlled observations,
explicit positive/negative controls and interference limits. Silver-halide colour
does not imply unrestricted unique identification; acid-generated CO2 does not
distinguish carbonate from hydrogencarbonate; basic gas/blue indicator without
controls does not uniquely identify ammonium. Supplied model data are not an
actual laboratory or learner record. Practical source intentions remain for
future real instruction and cannot be certified by these written cases alone.

The actual RSC [teacher method PDF](https://edu.rsc.org/download?ac=523338) and
[student method PDF](https://edu.rsc.org/download?ac=523339) were downloaded with
HTTP200 and read in full for chemical method support. Their exact external /tmp
paths, bytes and SHA256 values are bound in the neutral entry. They add no German
curricular obligation. No third-party PDF or extracted full text is copied into
this author dossier. The new authored cases are own CC-BY-4.0 content.

## Actual native results and retained failures

Final terminal exits: native retained P3 closed-schema/semantic check, four current
BB/BE GK/LK scope compilers and current contains/requires DAG checks:0. All three
operative union goals are actual target-visible and applicable in all four scopes.
The whole-case/input/equation guard also exited0:42 exact original inputs, three
new complete cases, eight balanced equation models and eight whole BB/BE page reads.
These are technical author checks, not independent scientific reviews.

The first helper invocation exited1 because it misread the diagnostics array.
The next invocation genuinely exited1 because the original five-member source
union included d2/413 that were not current BB-GK targets. Both terminal runs and
the initial plans are retained as superseded history. The correction authors a
specific bromide case under the already visible a44 goal and reduces the operative
union to1c/fd/a44. No native schema, view, applicability rule or CI gate was relaxed.
The final neutral entry points only to the corrected operative plans and cases.

## Preserved baseline and next gates

Current Chemistry canonical SHA256 is
f86209b8f750c0b576b63f34d19fb91458f2a35d6e183a8429a023e1dec53a84.
The parent-supplied completed HE17 central report has actual exit0 and zero blocking
findings: Chem173/378, Bio191/391, Math807/807 and Phys478/478. This author did not
run that global check. The previous six bounded source-role removals, four complete
source cases and independent B first seal7b830bd5b0024d2048728c10c01440c3cffd2d0097a5c171912289b4f6736cb5
are unchanged. B477 semantic compound and whole481 closure remain pending.

After two new independent targeted reviews, any root source-role application must
rebase the current sources, profiles, native source/page/context bindings, scope
consumers, old strict sets and all nine maturity floors. No position-only or
unchanged-context shortcut is authorized. The exact original repository inputs
are separately snapshotted to survive unrelated parallel Biology updates; those
snapshots do not substitute for a current rebase. No canonical, registry, mapping,
view, deck, active review or image was changed by this author package.
''')

entry = write('neutral-four-ion-intentions-whole-source-author-v4.review.entry.json', {
    'artifactKind': 'neutral-four-ion-intentions-whole-source-author-v4-review-entry',
    'authorRole': 'AUTHOR of three new cases; not eligible as independent A/B reviewer of those cases',
    'reviewScope': 'Whole original BB/BE Q3.2 six-ion intent, targeted four-ion witness gap and operative current scope source-role union only',
    'requiredWholePrimaryPages': {'BB': [26, 44, 45, 46], 'BE': [26, 44, 45, 46]},
    'operativeAuthorArtifacts': [binding(OWN / name) for name in operative_names],
    'readiness': binding(readme), 'exactOriginalInputs': inputs,
    'supersededHistoryNotOperativeReviewInput': [binding(OWN / name) for name in history_names],
    'firstFreezePath': str(SEAL.relative_to(ROOT)),
    'retainedAcceptedScienceReviewRestarts': 0, 'newWholeDEENCases': 3,
    'newIndependentReviewsRequired': 2, 'newSourceRoleApprovals': 0,
    'wholeB477SemanticCompoundRemainsOpen': True, 'whole481RemainsOpen': True,
    'retainedCurrentProfilesAiCandidate': True, 'humanReviewStatus': 'needs_human_review',
    'maximumClaimScope': 'G1', 'evidenceLevel': 'E1', 'machineStrictNetGain': 0,
    'activeWrites': 0, 'actualLearnerOrLaboratoryEvidence': False, 'humanApproval': False})

for item in inputs:
    assert binding(ROOT / item['path']) == item, item['path']
outputs = [binding(path) for path in sorted(OWN.rglob('*')) if path.is_file() and path != SEAL]
freeze = write(SEAL.name, {
    'artifactKind': 'four-ion-intentions-whole-source-author-v4-first-freeze',
    'sealedAtUTC': datetime.now(timezone.utc).isoformat(),
    'exactInputs': inputs, 'exactOwnOutputs': outputs,
    'exactInputCount': len(inputs), 'exactOwnOutputCount': len(outputs),
    'semanticAuthorReadScope': 'Whole seven current goals, full retained P/case context, whole original BB/BE26/44–46, whole RSC method PDFs; existing accepted science is retained without new review',
    'candidateSummary': {'wholeNewDEENCases': 3, 'operativeSourceRows': 2,
                         'operativeCurrentVisibleUnion': ['1c1420c2-a8e2-520f-8015-6df637a973bd',
                             'fd309753-4d48-5570-a4ec-09dfeb20ff9c', 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4'],
                         'actualNativeExitCode': 0, 'actualWholeCaseBindingCheckExitCode': 0,
                         'priorNativeRealScopeHoldExitCode': 1, 'newIndependentTargetedReviewsRequired': 2},
    'authorNotEligibleAsIndependentReviewerOfTheseNewCases': True,
    'newWholeGoalApprovals': 0, 'newSourceRoleApprovals': 0, 'strictNetGain': 0,
    'activeWrites': 0, 'humanApproval': False})
for item in read(freeze)['exactInputs'] + read(freeze)['exactOwnOutputs']:
    assert binding(ROOT / item['path']) == item, item['path']
print(json.dumps({'actualTerminalExitCode': 0, 'seal': binding(freeze),
                  'exactInputCount': len(inputs), 'exactOwnOutputCount': len(outputs),
                  'exactRepositoryInputSnapshots': len(snapshots),
                  'newIndependentReviewsRequired': 2, 'activeWrites': 0}))
