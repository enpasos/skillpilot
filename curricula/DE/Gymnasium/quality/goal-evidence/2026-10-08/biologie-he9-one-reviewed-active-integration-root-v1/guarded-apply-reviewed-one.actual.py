# SPDX-License-Identifier: Apache-2.0
"""Install one genuinely paired reviewed goal; preserve historical AM ledgers."""
from pathlib import Path
import copy
import hashlib
import json
import shutil

D = Path(__file__).resolve().parent
R = D.parents[6]
T = D.parent / 'biologie-he9-genetic-method19-reviewed-integration-preparation-technical-20261008-v1'
GID = '1b7f08a1-33df-5779-af66-430c91d699b7'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write('\n')

def verify(row):
    p = R / row['path']
    assert sha(p) == row['sha256'].removeprefix('sha256:'), str(p)
    assert p.stat().st_size == row['bytes'], str(p)

seal_path = T / 'technical-preparation.final.freeze.json'
assert sha(seal_path) == '3c5f442ffbe7554b455a1dc7aef3fdf6f88e32213d3748185f28a5f3a3910383'
seal = read(seal_path)
for row in seal['ownFiles']:
    verify(row)
plan = read(T / 'ready-root-reviewed-guarded-integration-plan.technical.json')
for row in [*plan['beforeBindings'].values(), *plan['protectedOtherFiles']]:
    verify(row)
before_can = read(R / plan['beforeBindings']['canonical']['path'])
future_can = read(R / plan['futureCanonicalSource'])
before_by = {g['id']: g for g in before_can['goals']}
future_by = {g['id']: g for g in future_can['goals']}
assert before_by.keys() == future_by.keys() and len(before_by) == 474
assert [gid for gid in before_by if before_by[gid] != future_by[gid]] == [GID]
assert {k for k in before_by[GID].keys() | future_by[GID].keys()
        if before_by[GID].get(k) != future_by[GID].get(k)} == {'titleEn', 'descriptionEn', 'resourceLinks'}
assert future_by[GID]['titleEn'] == 'Basic Concepts of Gene Technology'
assert future_by[GID]['descriptionEn'] == 'The learner can outline basic methods and applications of gene technology.'
old_qa = read(R / plan['beforeBindings']['qa']['path'])
new_qa = read(R / plan['replaceQaFrom'])
old_q = {q['goalId']: q for q in old_qa['records']}
new_q = {q['goalId']: q for q in new_qa['records']}
assert old_q.keys() == new_q.keys()
assert [gid for gid in old_q if old_q[gid] != new_q[gid]] == [GID]
for key in old_q[GID].keys() | new_q[GID].keys():
    if 'human' in key.lower():
        assert old_q[GID].get(key) == new_q[GID].get(key)
old_registry = read(R / plan['registryBefore']['path'])
new_registry = copy.deepcopy(old_registry)
new_bio = read(R / plan['mergeOnlyBiologyRegistryEntryFrom'])
old_bio = next(s for s in old_registry['subjects'] if s['subject'] == 'biologie')
for key, value in old_bio.items():
    if key in ['resolutionIndexPaths', 'positiveEvidenceConfigPaths']:
        assert new_bio[key][:len(value)] == value
        assert len(new_bio[key]) == len(value) + 1
    else:
        assert new_bio[key] == value, key
for i, subject in enumerate(new_registry['subjects']):
    if subject['subject'] == 'biologie':
        new_registry['subjects'][i] = new_bio
for kind in ['semantic-atomicity', 'memory-card-review']:
    row = next(x for x in plan['reviewedActiveReplacementFiles'] if x['target'].endswith(kind + '/canonical-biology-full.review.jsonl'))
    verify(row['source'])
    verify(row['expectedBefore'])
    cfg_path = R / ('curricula/DE/Gymnasium/quality/' + kind + '/canonical-biology-full.config.json')
    cfg = read(cfg_path)
    shutil.copyfile(cfg_path, D / ('before-' + kind + '.current-config.exact.json'))
    cfg['reviewPath'] = row['source']['path']
    write(D / ('future-' + kind + '.current-config.json'), cfg)

for op in plan['assetOperations']:
    src, dst = R / op['source'], R / op['target']
    assert sha(src) == op['sourceSha256'].removeprefix('sha256:')
    assert op['expectedBefore'] == 'missing' and not dst.exists()
for row in plan['reviewedActiveReplacementFiles']:
    verify(row['source'])
    verify(row['expectedBefore'])

# Guard checks precede every authorized active mutation. Old AM review rows stay intact;
# their mutable current config points to the new genuinely reviewed immutable version.
for op in plan['assetOperations']:
    dst = R / op['target']
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(R / op['source'], dst)
for row in plan['reviewedActiveReplacementFiles']:
    if row['target'].endswith('canonical-biology-full.review.jsonl'):
        continue
    shutil.copyfile(R / row['source']['path'], R / row['target'])
for kind in ['semantic-atomicity', 'memory-card-review']:
    shutil.copyfile(D / ('future-' + kind + '.current-config.json'), R / ('curricula/DE/Gymnasium/quality/' + kind + '/canonical-biology-full.config.json'))
(R / plan['registryBefore']['path']).write_text(json.dumps(new_registry, ensure_ascii=False, indent=2) + '\n')
for row in plan['protectedOtherFiles']:
    verify(row)
verify(plan['beforeBindings']['ledger'])
verify(plan['beforeBindings']['floors'])
verify(plan['beforeBindings']['atomicity'])
verify(plan['beforeBindings']['memory'])
assert read(R / plan['beforeBindings']['canonical']['path']) == future_can
assert read(R / plan['beforeBindings']['qa']['path']) == new_qa
for op in plan['assetOperations']:
    assert sha(R / op['target']) == op['sourceSha256'].removeprefix('sha256:')
write(D / 'guarded-active-one-integration.actual.json', {
    'genuineTechnicalSeal': {'path': str(seal_path.relative_to(R)), 'sha256': sha(seal_path)},
    'actualWholeGoalChanges': 1, 'exactOtherWholeGoals': 473, 'copiedAssets': 5,
    'changedTextFields': ['titleEn', 'descriptionEn'], 'newImagesGenerated': 0,
    'historicalFullAMReviewLedgersByteExactPreserved': True,
    'currentAMConfigOnlyPointsToGenuinelyReviewedVersion': True,
    'allOtherRegistrySubjectsUnchanged': True, 'oldDescriptionIndexesAndReviewsUnchanged': True,
    'ledgerAndProtectedFloorsUnchanged': True, 'humanFieldsUnchanged': True,
    'machineStrictBefore': 191, 'actualMachineStrictAfter': 'pending terminal central check',
    'newScienceClosuresClaimedBeforeCheck': 0, 'restoredBindingsClaimedBeforeCheck': 0,
})
print(json.dumps({'actualCopiedAssets': 5, 'wholeGoalsChanged': 1,
                  'historicalAMLedgersPreserved': True, 'centralCheck': 'pending'}))
