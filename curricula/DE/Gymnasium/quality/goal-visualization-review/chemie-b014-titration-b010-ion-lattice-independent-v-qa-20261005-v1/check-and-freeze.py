import hashlib
import json
import re
import struct
from pathlib import Path


OWN = Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-titration-b010-ion-lattice-independent-v-qa-20261005-v1')
FREEZE_NAME = 'independent-v-qa.freeze.json'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()

for path in OWN.glob('*.json'):
    json.loads(path.read_text())

bindings = json.loads((OWN / 'input-bindings.checked.json').read_text())
for item in bindings['bindings']:
    assert sha(item['path']) == item['sha256'], item['path']
original_path = OWN.parent / 'chemie-b014-two-and-b010-ion-lattice-candidate-20261005-v1' / 'image-candidate.freeze.json'
original = json.loads(original_path.read_text())
assert sha(original_path) == '84db6171b208285b67a4afc00cfe9d6e94c0bad8a040c24849f3c4f8a8316e35'
for item in original['files']:
    assert sha(item['path']) == item['sha256'], item['path']

review = json.loads((OWN / 'independent-two-image-v-qa.receipt.json').read_text())
assert review['scope'] == ['02634fdd-c8ba-591a-b240-77129b1bebb8', '950c73c6-4ed1-488a-9267-1142e95e0055']
assert len(review['records']) == 2
assert {r['goalId'] for r in review['records']} == set(review['scope'])
for record in review['records']:
    assert record['decision'] == 'PASS'
    assert record['blockingImageFindings'] == []
    assert record['scientificImageErrors'] == []
    assert record['nativeOriginalActuallyViewed'] is True
    assert record['independentFresh360And680ActuallyViewed'] is True
    assert record['activeGateVRegistered'] is False
    assert record['humanApproval'] is False
    assert sha(record['assetPath']) == record['assetSha256']
    assert len(record['format']['views']) == 2
    for view in record['format']['views']:
        assert sha(view['path']) == view['sha256']
        b = Path(view['path']).read_bytes()
        w, h = struct.unpack('>II', b[16:24])
        assert w == view['width']
        assert h == (203 if w == 360 else 383)
assert review['excluded'][0]['carryForwardStatus'] == 'HOLD'
assert review['strictNewCompletions'] == review['restoredBindings'] == review['netStrictIncrease'] == 0
for check in json.loads((OWN / 'native-checks.terminal.receipt.json').read_text())['commands']:
    assert check['exitCode'] == 0
for target in re.findall(r'\]\(([^)]+)\)', (OWN / 'README.md').read_text()):
    if not target.startswith(('https:', 'http:')):
        assert (OWN / target).exists() or target == FREEZE_NAME, target

files = [{'path': str(p), 'sha256': sha(p)} for p in sorted(OWN.rglob('*')) if p.is_file() and p.name != FREEZE_NAME]
obj = {
    'status': 'frozen_independent_two_image_machine_candidate_review',
    'authority': 'independent_ai_visual_review',
    'sourceFreezePath': str(original_path), 'sourceFreezeSha256': sha(original_path),
    'sourceFrozenFilesChecked': len(original['files']), 'sourceFrozenFilesUnchanged': True,
    'scope': review['scope'], 'files': files,
    'structuralAndBindingCheckExitCode': 0,
    'machineImageCandidatePassGoalIds': review['scope'],
    'excluded16RemainsHold': True, 'activeGateVRegistered': False,
    'activeWrites': False, 'imageGenerationOrEditing': False,
    'strictNewCompletions': 0, 'restoredBindings': 0, 'netStrictIncrease': 0,
    'humanApproval': False, 'humanTrial': False,
}
path = OWN / FREEZE_NAME
path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
print(f'PASS: two scoped image candidate verdicts, native formats, four viewed-width bindings, terminal checks and local links verified; {len(files)} own artifacts frozen')
print(f'Freeze SHA256: {sha(path)}')
