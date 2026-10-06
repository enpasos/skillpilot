# SPDX-License-Identifier: Apache-2.0
"""Apply the independently reviewed five-file NI adoption with exact byte guards."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
BASE = OWN.parent
CANDIDATE = BASE / 'biologie-ni-current-learner-view-adoption-candidate-v1'
GUARD = BASE / 'biologie-ni-current-learner-view-adoption-independent-guard-v1'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def verify_manifest(path, expected_sha=None):
    if expected_sha:
        assert sha(path.read_bytes()) == expected_sha, str(path)
    manifest = json.loads(path.read_text())
    for entry in manifest['files']:
        file = path.parent / entry['path']
        if not file.exists():
            file = ROOT / entry['path']
        raw = file.read_bytes()
        assert sha(raw) == entry['sha256'], str(file)
        assert len(raw) == entry['bytes'], str(file)
    assert len(manifest['files']) == manifest['fileCount']
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(path.read_bytes()),
            'verifiedFiles': len(manifest['files'])}


verified = [verify_manifest(
    CANDIDATE / 'learner-view-adoption-candidate.final.freeze.json',
    'd62d38a09c65050dcc07ffb493de6d4a2e3c9ea426a9913c5b3655b39b99767c')]
guard_freezes = list(GUARD.glob('*final.freeze.json'))
assert len(guard_freezes) == 1, 'Wait for the completed independent guard freeze.'
verified.append(verify_manifest(guard_freezes[0]))
guard = json.loads((GUARD / 'independent-final-exact-five-destination-adoption.actual.json').read_text())
assert guard['result'] == 'PASS'
plan_path = CANDIDATE / 'guarded-exact-five-destination-adoption-plan.candidate.json'
assert sha(plan_path.read_bytes()) == '9d3eaa2da5694283e47159b1b0e61b0ee28114cc587db0f55d0847ff08fe98c7'
plan = json.loads(plan_path.read_text())
assert len(plan['destinations']) == 5
backup = OWN / 'ni-learner-view-adoption.active-before'
receipt = OWN / 'ni-learner-view-adoption.application.actual.json'
assert not backup.exists() and not receipt.exists()
prepared = []
for row in plan['destinations']:
    dest = ROOT / row['destination']
    source = ROOT / row['afterCandidatePath']
    before, after = dest.read_bytes(), source.read_bytes()
    assert sha(before) == row['beforeSHA256'], str(dest)
    assert sha(after) == row['afterSHA256'], str(source)
    prepared.append((row, dest, before, after))

# Back up all original bytes before the first active write.
for row, dest, before, after in prepared:
    saved = backup / row['destination']
    saved.parent.mkdir(parents=True, exist_ok=True)
    saved.write_bytes(before)
    assert sha(saved.read_bytes()) == row['beforeSHA256']

try:
    for row, dest, before, after in prepared:
        assert sha(dest.read_bytes()) == row['beforeSHA256']
        dest.write_bytes(after)
        assert sha(dest.read_bytes()) == row['afterSHA256']
except Exception:
    for row, dest, before, after in prepared:
        dest.write_bytes(before)
    raise

result = {
    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'result': 'APPLIED exact independently reviewed five-destination adoption',
    'verifiedImmutableManifests': verified,
    'independentGuardPath': str((GUARD / 'independent-final-exact-five-destination-adoption.actual.json').relative_to(ROOT)),
    'guardSHA256': sha((GUARD / 'independent-final-exact-five-destination-adoption.actual.json').read_bytes()),
    'destinations': plan['destinations'],
    'backupRoot': str(backup.relative_to(ROOT)),
    'newScientificClosures': 0,
    'humanApproval': False,
    'humanTrial': False,
    'fullStableChecksAndBackendApiTestRemainSeparate': True,
}
receipt.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'result': result['result'], 'destinations': 5,
                  'newScientificClosures': 0, 'humanApproval': False}))
