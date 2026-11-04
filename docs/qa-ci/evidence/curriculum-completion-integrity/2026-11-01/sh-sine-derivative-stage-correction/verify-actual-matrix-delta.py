import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

root = Path.cwd()
capsule = root / 'docs/qa-ci/evidence/curriculum-completion-integrity/2026-11-01/sh-sine-derivative-stage-correction'
old_path = capsule / 'before/backend/build/reports/curriculum-completion-integrity.json'
new_path = root / 'backend/build/reports/curriculum-completion-integrity.json'
old = json.loads(old_path.read_text())
new = json.loads(new_path.read_text())
before = {(row['subject'], row['scope']): row for row in old['scopes']}
after = {(row['subject'], row['scope']): row for row in new['scopes']}
plan = json.loads((capsule / 'reviewed-candidate/candidate-operations.json').read_text())
expected = {row['scope']: row for row in plan['actualBaselineAndExpectedScopeImpact']}
by_profiles = {'DE-BY/SekII/G9/GK', 'DE-BY/CrossStage/G9/GK'}
tank = 'c849eeab-e88f-5e82-89d9-761a1e17d97b'
if set(before) != set(after) or new['checkedOfferedScopes'] != 584:
    raise RuntimeError('Offered/canonical profile inventory changed unexpectedly')
differences = []
rows = []
changed = []
for key, previous in before.items():
    current = after[key]
    subject, scope = key
    permitted = subject == 'Mathematik' and (scope in expected or scope in by_profiles)
    added = sorted(set(current['targetGoalIds']) - set(previous['targetGoalIds']))
    removed = sorted(set(previous['targetGoalIds']) - set(current['targetGoalIds']))
    expected_added = expected[scope]['addedTargetGoalIds'] if subject == 'Mathematik' and scope in expected else [tank] if subject == 'Mathematik' and scope in by_profiles else []
    expected_removed = expected[scope]['removedTargetGoalIds'] if subject == 'Mathematik' and scope in expected else []
    if added != sorted(expected_added) or removed != sorted(expected_removed):
        differences.append({'subject': subject, 'scope': scope, 'actualAdded': added, 'actualRemoved': removed, 'expectedAdded': expected_added, 'expectedRemoved': expected_removed})
    if not permitted and current != previous:
        differences.append({'subject': subject, 'scope': scope, 'unexpectedFullRowChange': True})
    if current != previous:
        changed.append({'subject': subject, 'scope': scope})
    if subject == 'Mathematik' and scope in expected:
        digest_json = hashlib.sha256(json.dumps(sorted(current['targetGoalIds']), ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        accepted = expected[scope]['expectedAfterTargetGoalIdsSha256']
        if accepted != digest_json:
            differences.append({'scope': scope, 'expectedTargetSetDigestMismatch': True, 'candidateDigest': accepted, 'actualDigest': digest_json})
    if permitted:
        old_uncovered = {x['goalId'] for x in previous['uncovered']}
        new_uncovered = {x['goalId'] for x in current['uncovered']}
        if current['unaddressableProtectedContext']:
            differences.append({'scope': scope, 'hiddenProtectedContext': current['unaddressableProtectedContext']})
        rows.append({'scope': scope, 'actualAddedTargetGoalIds': added, 'actualRemovedTargetGoalIds': removed, 'uncoveredBefore': len(old_uncovered), 'uncoveredAfter': len(new_uncovered), 'removedUncoveredGoalIds': sorted(old_uncovered - new_uncovered), 'newUncoveredGoalIds': sorted(new_uncovered - old_uncovered), 'unaddressableProtectedContext': current['unaddressableProtectedContext'], 'passed': current['passed']})
xml = ET.parse(root / 'backend/build/test-results/test/TEST-com.skillpilot.backend.completion.CurriculumCompletionIntegrityTest.xml').getroot()
result = {'schemaVersion': 1, 'status': 'PASS-exact-reviewed-target-delta' if not differences else 'FAIL', 'beforeBackendReportSha256': hashlib.sha256(old_path.read_bytes()).hexdigest(), 'afterBackendReportSha256': hashlib.sha256(new_path.read_bytes()).hexdigest(), 'checkedOfferedScopes': new['checkedOfferedScopes'], 'checkedMathOfferedProfiles': sum(row.get('authoritative', False) and row['subject'] == 'Mathematik' for row in new['scopes']), 'reviewedSHProfiles': len(expected), 'reviewedBYProfiles': len(by_profiles), 'allOtherScopeRowsUnchanged': not any(x.get('unexpectedFullRowChange') for x in differences), 'changedScopeRows': changed, 'differences': differences, 'failedOfferedScopes': new['failedScopes'], 'fixtureAndMatrixTestCounts': {k: xml.attrib.get(k) for k in ['tests', 'failures', 'errors', 'skipped']}, 'scopes': rows, 'sourceCorrectionDoesNotClaimAssessmentRouteClosure': True, 'm7Acceptance': False}
(capsule / 'actual-backend-matrix-delta.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: v for k, v in result.items() if k not in ['scopes', 'changedScopeRows']}, indent=2))
if differences:
    raise RuntimeError('Unexpected backend scope delta')
