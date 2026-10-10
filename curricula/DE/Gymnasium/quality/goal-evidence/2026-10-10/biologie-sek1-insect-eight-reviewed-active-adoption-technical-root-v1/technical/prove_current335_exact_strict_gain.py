"""Compare completed normal central reports; this is technical evidence only."""
import datetime
import hashlib
import json
from pathlib import Path

root = Path('/home/enpasos/projects/skillpilot')
base = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
own = base / 'biologie-sek1-insect-eight-reviewed-active-adoption-technical-root-v1'
previous = base / 'biologie-q1-four-reviewed-active-adoption-technical-root-v1/current327-exact-strict-ID-gain-and-protected-subjects.actual.json'
current = own / 'checks/central-current394-eight-check.stdout.actual.txt'
terminal = own / 'checks/central-current394-eight-check.terminal.actual.json'
output = own / 'current335-exact-strict-ID-gain-and-protected-subjects.actual.json'
assert not output.exists()

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(root)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

before = json.loads(previous.read_text())
after = json.loads(current.read_text())
adoption = json.loads((own / 'actual-reviewed-eight-active-adoption.receipt.json').read_text())
assert json.loads(terminal.read_text())['exitCode'] == 0
assert after['blockingIssueCount'] == 0
old = {s['subject']: s for s in before['subjects']}
new = {s['subject']: s for s in after['subjects']}
assert old.keys() == new.keys()
all_checks = ['semantic-kind-scope', 'description-review-validation', 'positive-evidence-validation', 'semantic-atomicity-check', 'memory-card-check', 'visualization-freshness-and-approval-check']
for name, subject in new.items():
    assert sorted(subject['currentGoalIds']) == sorted(old[name]['currentGoalIds'])
    assert sorted(check['id'] for check in subject['requiredChecks']) == sorted(all_checks)
    assert all(check['status'] == 'pass' for check in subject['requiredChecks'])
    assert not subject['issues']
    if name != 'biologie':
        assert sorted(subject['strictCompleteGoalIds']) == sorted(old[name]['strictCompleteGoalIds'])
        assert subject['gates'] == old[name]['gates']

bio_old = set(old['biologie']['strictCompleteGoalIds'])
bio_new = set(new['biologie']['strictCompleteGoalIds'])
assert len(bio_old) == 327 and len(bio_new) == 335
assert not bio_old - bio_new
assert bio_new - bio_old == set(adoption['goalIds'])
assert new['biologie']['denominator'] == 394
assert new['biologie']['gates'] == {'currentDescriptionResolutions': 335, 'currentPositiveEvidenceProfiles': 335, 'currentSemanticAtomicityDecisions': 394, 'currentMemoryReviewDecisions': 394, 'currentVisualizationQaRecords': 335}
assert new['mathematik']['denominator'] == new['mathematik']['strictComplete'] == 807
assert new['physik']['denominator'] == new['physik']['strictComplete'] == 478
assert new['chemie']['denominator'] == 381 and new['chemie']['strictComplete'] == 180

result = {
    'schemaVersion': 1,
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Exact comparison of actual completed normal central reports, not an additional scientific review',
    'currentCentralReport': bind(current),
    'currentCentralTerminal': bind(terminal),
    'previousExactStrictIDs': bind(previous),
    'actualReviewedAdoption': bind(own / 'actual-reviewed-eight-active-adoption.receipt.json'),
    'subjects': after['subjects'],
    'newScientificClosureGoalIds': sorted(bio_new - bio_old),
    'newScientificClosures': 8,
    'restoredPriorStrictBindings': 0,
    'strictNetGain': 8,
    'lostPriorStrictIDs': 0,
    'blockingIssueCount': 0,
    'otherSubjectCurrentAndStrictIDSetsExact': True,
    'fullStableNormalChecksPending': True,
    'humanApproval': False,
    'humanTrial': False,
    'actualLearnerEvidence': False,
}
output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'output': bind(output), 'strictBio': 335, 'denominator': 394, 'newScientificClosures': 8, 'restoredPriorStrictBindings': 0, 'lostPriorStrictIDs': 0, 'blockingIssueCount': 0}))
