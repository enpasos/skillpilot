"""Seal this finished targeted native D-A continuation without rewriting stage one."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

root = Path(__file__).resolve().parents[8]
own = Path(__file__).resolve().parent
packet = own.parent
freeze = own / 'independent-carrier-native-d-a.stage-2.freeze.json'
assert not freeze.exists(), 'Historical freeze must remain immutable'

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(root)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

old_freeze_path = packet / 'independent-carrier-image-a.v-p-stage-1.freeze.json'
old_freeze = json.loads(old_freeze_path.read_text())
for bound in old_freeze['ownFiles']:
    assert bind(root / bound['path']) == bound, 'Prior own frozen file changed'
input_rows = json.loads((own / 'exact-native-d-a-stage-2-input-bindings.json').read_text())['inputs']
at_seal = []
for bound in input_rows:
    actual = bind(root / bound['path'])
    assert actual == bound, 'An actual targeted input changed before seal: ' + bound['path']
    at_seal.append(actual)
validation = json.loads((own / 'native-current-d-a-and-imported-one-p-bindings.validation.actual.json').read_text())
assert validation['nativeCampaignResults'] == 'PASS1' and validation['nativeOnePFullCheckerAfterActualPNGImport'] == 'PASS'
files = [bind(p) for p in sorted(own.rglob('*')) if p.is_file() and p != freeze]
files += [bind(packet / 'results/independent-a.batch-001.records.jsonl'), bind(packet / 'results/independent-a.batch-001.run.json')]
report = {
    'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'artifactSetId': 'biologie-q1-carrier-image-user-correction-independent-a-v1-native-d-stage-2',
    'role': 'Independent actual final one-page native D review A with native one-P check after root imported the already reviewed image',
    'goalIds': ['ac9e824f-003c-50ac-8751-2b8456004c63'],
    'ownFiles': files, 'actualCurrentTargetedInputs': at_seal,
    'priorStageOneFreezeUnchanged': bind(old_freeze_path),
    'decision': 'KEEP', 'nativeDValidator': 'PASS1', 'nativeImportedOnePChecker': 'PASS',
    'goalFingerprint': validation['goalFingerprint'], 'pageFingerprint': validation['pageFingerprint'],
    'goalReviewContextFingerprint': validation['goalReviewContextFingerprint'],
    'bundleFingerprint': validation['bundleFingerprint'], 'bookDigest': validation['bookDigest'],
    'actualHTMLAndPhysicalPDFGoalPageRead': True, 'actualOther389PagesWholeJSONExact': True,
    'separateSixCandidateViewsReadForCarrierRoleOnly': True, 'fullNativeGUISupersetGateClaimed': False,
    'wholeOriginalSourceCoverage': False, 'peerCurrentResultsRead': False,
    'activeWrites': False, 'globalHistoricalInputEqualityClaimed': False,
    'strictNetGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindingsByThisReviewer': 0,
    'humanApproval': False, 'humanTrial': False, 'learnerEvidence': False,
}
freeze.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(bind(freeze)))
