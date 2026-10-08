# SPDX-License-Identifier: Apache-2.0
"""Integrate the five technically reviewed ordinary authored view references."""
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
INPUT = OWN.parent / 'biologie-basis2-reviewed-backend-projection-checkpoint-root-v1'
guard_path = INPUT / 'five-authored-view-candidates.before-after.guard.json'
proof_path = INPUT / 'actual-normal-loader-before-after-96-scopes.proof.json'
receipt = OWN / 'five-reviewed-authored-views-applied.actual.json'
assert not receipt.exists()


def binding(path):
    return {'path': str(path.relative_to(ROOT)),
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'bytes': path.stat().st_size}


guard = json.loads(guard_path.read_text())
proof = json.loads(proof_path.read_text())
rows = proof['sourceCompilerRuntimeProjectionRows']
assert len(rows) == 96
resp = '0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38'
coupling = '32483d30-2162-50a5-a6cc-05b7f2467ab1'
resp_states = {'DE-BB', 'DE-BE', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST', 'DE-TH'}
for row in rows:
    before, after = set(row['beforeAtomicGoalIds']), set(row['afterAtomicGoalIds'])
    assert len(before) == row['beforeAtomicCount']
    assert len(after) == row['afterAtomicCount'] == len(row['afterAtomicGoalIds'])
    assert before <= after
    if row['stage'] == 'SekI':
        expected = ({resp} if row['jurisdiction'] in resp_states else set())
        expected |= ({coupling} if row['jurisdiction'] == 'DE-SN' else set())
        assert after - before == expected
    else:
        assert before == after

assert len(guard['operations']) == 5
for row in guard['operations']:
    target = ROOT / row['destination']
    candidate = ROOT / row['candidate']['path']
    before = ROOT / row['before']['path']
    assert binding(candidate) == row['candidate']
    assert binding(before) == row['before']
    assert binding(target)['sha256'] == row['beforeActiveSha256'] == binding(before)['sha256']
    assert row['onlyAddedOrdinaryReferences']

applied = []
for row in guard['operations']:
    target = ROOT / row['destination']
    target.write_bytes((ROOT / row['candidate']['path']).read_bytes())
    assert binding(target)['sha256'] == row['candidate']['sha256']
    applied.append(binding(target))

receipt.write_text(json.dumps({'schemaVersion': 1, 'inputGuard': binding(guard_path),
    'actualNormalBackendLoaderProof': binding(proof_path), 'operations': applied,
    'actualProjectionRowsVerified': 96, 'previousTargetsRetained': True,
    'sekIIUnchanged': True, 'newSekIScopes': {'respiration': sorted(resp_states), 'coupling': ['DE-SN']},
    'ordinaryAuthoredCurriculumViewDataOnly': True, 'runtimeCompilerChanges': False,
    'scientificReviewClaim': False, 'humanApprovalClaim': False}, indent=2) + '\n')
print(json.dumps({'actualViewWrites': len(applied), 'verifiedNormalBackendLoaderRows': len(rows)}))
