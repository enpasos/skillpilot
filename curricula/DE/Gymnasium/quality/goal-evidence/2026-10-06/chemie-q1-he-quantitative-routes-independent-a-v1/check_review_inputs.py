# SPDX-License-Identifier: Apache-2.0
"""Independent A's bounded checks. Writes only this review dossier."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
EXPECTED_AUTHOR_FREEZE = 'e8e42b9cd2e0cdeb088b9c9037a520d98eaf18f6f18256259594491c5364a076'

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def stable_sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def check_freeze(path):
    data = read(path)
    rows = []
    for row in data['files']:
        target = ROOT / row.get('snapshotPath', row['path'])
        actual = sha(target)
        assert actual == row['sha256'], str(target)
        assert target.stat().st_size == row['bytes'], str(target)
        rows.append({'path': str(target.relative_to(ROOT)), 'sha256': actual, 'bytes': target.stat().st_size})
    return {'freezePath': str(path.relative_to(ROOT)), 'freezeSHA256': sha(path), 'verifiedFileCount': len(rows), 'rows': rows}

assert sha(AUTHOR / 'author-candidate.final.freeze.json') == EXPECTED_AUTHOR_FREEZE
author_integrity = check_freeze(AUTHOR / 'author-candidate.final.freeze.json')
historical_integrity = check_freeze(OLD / 'reviewed-integration.final.freeze.json')
assert historical_integrity['verifiedFileCount'] == 407
baseline_integrity = check_freeze(AUTHOR / 'current-376-inputs.freeze.json')
old = read(OLD / 'prospective-input-tree' / CANON)
new = read(AUTHOR / 'proposed-active-tree' / CANON)
live = read(AUTHOR / 'current-376-inputs' / CANON)
old_by = {g['id']: g for g in old['goals']}
new_by = {g['id']: g for g in new['goals']}
live_by = {g['id']: g for g in live['goals']}
assert len(old_by) == 477 and len(new_by) == 479
changed = [k for k in old_by if old_by[k] != new_by[k]]
added = sorted(set(new_by) - set(old_by))
assert len(changed) == 8 and len(added) == 2
bindings = read(AUTHOR / '34-current-strict-d-binding-inputs.author-frozen.json')
for gid in bindings['currentStrictGoalIds']:
    assert new_by[gid] == live_by[gid], gid

def leaves(gid, goals):
    children = goals[gid].get('contains', [])
    if not children:
        return {gid}
    return set().union(*(leaves(child, goals) for child in children))

he_only = {'3d6699ae-ebbd-5a55-8798-b809a9d74f0a', '18819a59-2442-530f-a7c3-26755398ec66'}
cluster = 'a0893975-1677-5dae-bbfb-675789be4f17'
q1_leaves = leaves(cluster, old_by)
assert len(q1_leaves) == 67
practice_ids = ['00139854-e5a7-5c12-ab50-2268c80bf776', 'c91350bc-7d2e-523c-bd50-0324bccfcf98', 'bf6c39f0-1e44-53b2-8ff6-025f2e36e125']
route_rows = []
for gid in practice_ids:
    before = old_by[gid]
    after = new_by[gid]
    expanded_before = set().union(*(leaves(ref, old_by) for ref in before['requires']))
    expanded_after = set().union(*(leaves(ref, new_by) for ref in after['requires']))
    assert expanded_before - expanded_after == he_only, gid
    assert expanded_after - expanded_before == set(), gid
    assert expanded_after == q1_leaves - he_only
    changed_fields = [k for k in before if before.get(k) != after.get(k)]
    assert sorted(changed_fields) == ['examData', 'requires']
    exam_before = dict(before['examData'])
    exam_after = dict(after['examData'])
    assert set(exam_before['coveredGoalIds']) - set(exam_after['coveredGoalIds']) == {cluster}
    assert set(exam_after['coveredGoalIds']) - set(exam_before['coveredGoalIds']) == set()
    del exam_before['coveredGoalIds'], exam_after['coveredGoalIds']
    assert exam_before == exam_after
    route_rows.append({'goalId': gid, 'beforeExpandedAtomicPrerequisites': sorted(expanded_before), 'afterExpandedAtomicPrerequisites': sorted(expanded_after), 'removedExactlyTwoHEQuantitativeChildren': True, 'otherTaskSolutionScoringReviewStatusExact': True})

capstone = '14577339-9e0c-5b44-8e47-91e1a4947367'
assert set(old_by[capstone]['requires']) - set(new_by[capstone]['requires']) == he_only
assert set(new_by[capstone]['requires']) - set(old_by[capstone]['requires']) == set()
assert set(old_by[capstone]['examData']['coveredGoalIds']) - set(new_by[capstone]['examData']['coveredGoalIds']) == {'d3cd250f-5221-589d-aa1c-44a4692d1acb'}
for field in ('requires', 'contains'):
    visiting, done, stack = set(), set(), []
    def walk(gid):
        assert gid not in visiting, (field, stack, gid)
        if gid in done:
            return
        visiting.add(gid)
        stack.append(gid)
        for dest in new_by[gid].get(field, []):
            assert dest in new_by, (gid, field, dest)
            walk(dest)
        stack.pop()
        visiting.remove(gid)
        done.add(gid)
    for gid in new_by:
        walk(gid)

strict_rows = []
for row in bindings['perGoalLiveReviewedAndRoutePageInputs']:
    gid = row['goalId']
    before = row['beforeReviewed378Page']
    after = row['afterRoute378Page']
    fields = [k for k in before if before[k] != after[k]]
    assert sorted(fields) == ['externalReverseRequires', 'pageFingerprint'], gid
    assert stable_sha(before) == row['beforeReviewed378WholePageSHA256'], gid
    assert stable_sha(after) == row['afterRoute378WholePageSHA256'], gid
    old_refs = {r['goalId']: r for r in before['externalReverseRequires']}
    new_refs = {r['goalId']: r for r in after['externalReverseRequires']}
    expected_added = set(new_refs) - set(old_refs)
    expected_removed = set(old_refs) - set(new_refs)
    assert not expected_removed, gid
    assert expected_added <= set(practice_ids), gid
    assert expected_added, gid
    for dest in expected_added:
        assert gid not in old_by[dest]['requires']
        assert gid in leaves(cluster, old_by)
        assert gid in new_by[dest]['requires']
        assert new_refs[dest]['title'] == new_by[dest]['title']
        assert new_refs[dest]['canonicalUrl'].endswith('#goal-' + dest)
    strict_rows.append({'goalId': gid, 'title': row['currentTitleDe'], 'addedDependentIds': sorted(expected_added), 'removedDependentIds': [], 'beforePageSHA256': row['beforeReviewed378WholePageSHA256'], 'afterPageSHA256': row['afterRoute378WholePageSHA256'], 'actualChangedFields': fields, 'historicallyExpandedPrerequisiteOfEveryNewDependent': True})
assert len(strict_rows) == 34

freeze_inputs = [
    AUTHOR / 'author-candidate.final.freeze.json',
    AUTHOR / '34-current-strict-d-binding-inputs.author-frozen.json',
    AUTHOR / 'paraben-terminal.goal-template.candidate.json',
    AUTHOR / 'quantitative-two-terminal.goal-template.candidate.json',
    AUTHOR / 'native-safe-route-source-patch.author-candidate.json',
    AUTHOR / 'native-pages-d-p-source-route-footprint.actual.json',
    AUTHOR / 'native-he-only-compiled-scope.actual.json',
    AUTHOR / 'native-scope-inputs.actual.json',
    AUTHOR / 'proposed-active-tree' / CANON,
    OLD / 'reviewed-integration.final.freeze.json',
    OLD / 'prospective-input-tree' / CANON,
    ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-by-two-current-source-applicability-floor-analysis-v1/by-original-operator-boundaries.actual.json',
    ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-by-two-current-source-applicability-floor-analysis-v1/two-he-source-rows.current-unchanged.actual.json',
]
write('review-inputs.actual.freeze.json', {'schemaVersion': 1, 'reviewer': 'independent-a', 'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'authorFreezeSHA256': EXPECTED_AUTHOR_FREEZE, 'inputs': [{'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size} for p in freeze_inputs], 'authorFileIntegrity': author_integrity, 'historical407FileIntegrity': historical_integrity, 'baselineSnapshotIntegrity': baseline_integrity, 'existingScienceReuseOnly': True, 'historicalReviewsNotRestarted': True, 'independentBConclusionsRead': False, 'activeWrites': False, 'humanApproval': False})
write('independent-bounded-checks.actual.json', {'schemaVersion': 1, 'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'status': 'PASS independent exactness, two directed DAGs, expanded prerequisite preservation and all34 actual backlink deltas', 'candidateCanonicalSHA256': sha(AUTHOR / 'proposed-active-tree' / CANON), 'existingChangedGoalIds': sorted(changed), 'newPracticeAssessmentIds': added, 'other469WholeGoalsExact': True, 'strict104WholeGoalsExact': True, 'routeRows': route_rows, 'strict34Rows': strict_rows, 'prior19SplitPaginationRowsNotNewlyReviewed': bindings['live376ToReviewed378PriorDeltaRows'], 'newScientificCompletions': 0, 'restoredNativeDBindings': 0, 'fullCQRExecuted': False, 'floorCertificationIssued': False, 'activeWrites': False, 'humanApproval': False, 'humanTrial': False})
print('PASS independent A: author35/historical407/baseline11 exact; 8 changed +2 assessment nodes; 469 old and104 strict exact; three67-to65 expansions exclude only2 HE children; both DAGs valid; all34 actual backlinks independently checked.')
