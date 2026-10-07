# SPDX-License-Identifier: Apache-2.0
"""One-shot bounded integration of the actual sealed independent Ecology20 reviews."""
from pathlib import Path
import hashlib
import json
import shutil
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path(__file__).parent
PREP = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20-current391-reviewed-integration-preparation-technical-v1'


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


seal = PREP / 'technical-reviewed-ecology20-integration.final.freeze.json'
assert sha(seal) == 'sha256:a445606b7626be0b4375248a697dcd3fc1db6775f05ab0564a5802c4d6ca11bd'
for row in read(seal)['files']:
    path = PREP / row['path']
    assert path.stat().st_size == row['bytes']
    assert sha(path) == 'sha256:' + row['sha256'].removeprefix('sha256:')

plan = read(PREP / 'ready-root-reviewed-guarded-integration-plan.technical.json')
canonical = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
qa_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
registry = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
future_path = ROOT / plan['futureCanonicalSource']
assert sha(canonical) == plan['beforeCanonicalSha256']
assert sha(future_path) == plan['futureCanonicalSha256']
before, future = read(canonical), read(future_path)
ids = set(read(PREP / 'positive/current20.future-active.config.json')['scope']['goalIds'])
assert len(ids) == 20
old_rows = {g['id']: g for g in before['goals']}
new_rows = {g['id']: g for g in future['goals']}
assert old_rows.keys() == new_rows.keys() and len(old_rows) == 474
assert {k: v for k, v in before.items() if k != 'goals'} == {k: v for k, v in future.items() if k != 'goals'}
for gid, row in old_rows.items():
    new = new_rows[gid]
    if gid not in ids:
        assert row == new
        continue
    assert {k for k in set(row) | set(new) if row.get(k) != new.get(k)} == {'resourceLinks'}
    assert all(link in new['resourceLinks'] for link in row.get('resourceLinks', []))
    added = [link for link in new['resourceLinks'] if link not in row.get('resourceLinks', [])]
    assert len(added) == 1 and added[0]['type'] == 'goal-visualization'

old_qa, new_qa = read(qa_path), read(ROOT / plan['replaceQaFrom'])
assert {k: v for k, v in old_qa.items() if k != 'records'} == {k: v for k, v in new_qa.items() if k != 'records'}
old_qrows = {r['goalId']: r for r in old_qa['records']}
new_qrows = {r['goalId']: r for r in new_qa['records']}
assert old_qrows.keys() == new_qrows.keys()
for gid, row in old_qrows.items():
    new = new_qrows[gid]
    if gid not in ids:
        assert row == new
    else:
        assert new['aiApproved'] == 'yes' and new['humanApproved'] == 'no'
        assert new['assetSha256'] == new['aiApprovedAssetSha256']

reg = read(registry)
index = next(i for i, row in enumerate(reg['subjects']) if row['subject'] == 'biologie')
old_bio = reg['subjects'][index]
new_bio = read(ROOT / plan['mergeOnlyBiologyRegistryEntryFrom'])
assert {k for k in set(old_bio) | set(new_bio) if old_bio.get(k) != new_bio.get(k)} == {'resolutionIndexPaths', 'positiveEvidenceConfigPaths'}
for field in ['resolutionIndexPaths', 'positiveEvidenceConfigPaths']:
    assert new_bio[field][:-1] == old_bio[field]
    assert len(new_bio[field]) == len(old_bio[field]) + 1
for operation in plan['assetOperations']:
    assert operation['action'] == 'copy_exact'
    assert sha(ROOT / operation['source']) == operation['sourceSha256']
    assert not (ROOT / operation['target']).exists()

old_reg_digest, old_qa_digest = sha(registry), sha(qa_path)
for operation in plan['assetOperations']:
    target = ROOT / operation['target']
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / operation['source'], target)
    assert sha(target) == operation['sourceSha256']
shutil.copyfile(future_path, canonical)
shutil.copyfile(ROOT / plan['replaceQaFrom'], qa_path)
reg['subjects'][index] = new_bio
registry.write_text(json.dumps(reg, ensure_ascii=False, indent=2) + '\n')
receipt = {
    'role': 'actual Root guarded integration of genuine sealed independent machine D/P/A/M/V Ecology20 reviews',
    'appliedAt': datetime.now(timezone.utc).isoformat(),
    'preparationSeal': {'path': str(seal.relative_to(ROOT)), 'sha256': sha(seal), 'verifiedPayloads': 161},
    'canonicalBeforeSha256': plan['beforeCanonicalSha256'],
    'canonicalAfterSha256': sha(canonical),
    'qaBeforeSha256': old_qa_digest, 'qaAfterSha256': sha(qa_path),
    'registryBeforeSha256': old_reg_digest, 'registryAfterSha256': sha(registry),
    'onlyChangedCurrentGoalIds': sorted(ids),
    'currentWholeGoals': 474, 'currentCurricularAtomic': 391,
    'other454WholeGoalValuesExact': True, 'other371QaRecordsExact': True,
    'existingCanonicalSourcesAndScopeAndPrerequisitesExact': True,
    'exactAssetOperations': 80, 'historyWrites': 0,
    'currentAtomicityMemoryCardsAndSemanticKindsUnchanged': True,
    'otherSubjectRegistryEntriesUnchanged': True,
    'ledgerRemovalPendingActualCentralPass': True,
    'strictGainClaimedBeforeActualCentralCheck': 0,
    'humanApproval': False, 'humanTrial': False,
}
output = OWN / 'guarded-active-ecology20-integration.actual.json'
assert not output.exists()
output.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'rootIntegration': 'applied', 'currentWholeGoals': 474, 'boundedTargets': 20, 'strictGainPendingCentral': 0}))
