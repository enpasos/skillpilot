# SPDX-License-Identifier: Apache-2.0
"""Install the genuine reviewed Chemistry6/8 frame after exact whole-input guards."""
import copy, hashlib, json, shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
TECH = OWN.parent / 'chemie-q3-two-source-roles-reviewed-integration-preparation-technical-20261008-v1'
def read(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):
    p = Path(p)
    return dict(path=str(p.relative_to(ROOT)), sha256=sha(p), bytes=p.stat().st_size)
def verify(b):
    p = ROOT / b['path']
    assert p.is_file() and sha(p) == b['sha256'].removeprefix('sha256:') and p.stat().st_size == b['bytes'], p
    return p
def put(p, v):
    p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists(), p
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')

seal_path = TECH / 'two-genuine-reviewed-root-integration-ready.technical.freeze.json'
seal = read(seal_path)
for b in seal['ownFiles']: verify(b)
for side in seal['actualOriginalSealedPair'].values():
    verify(side['seal'])
    for b in side['verifiedOriginalFiles']: verify(b)
plan = read(verify(seal['concretePlan']))
ids = plan['actualTwoGoalIds']
assert ids == ['d9cce642-4f89-57f8-832a-abeb62586195', '3eada74b-25b8-55dc-811a-acb473196f53']
for b in plan['beforeActiveBindings'].values(): verify(b)
for b in plan['currentSourceFileGuards']: verify(b)
for b in plan['goodGoal8JPEGByteExactKEEP']: verify(b)
for op in plan['reviewedPNGCopyOperations']:
    verify(op['source']); verify(op['retainExistingJPEGExactly'])
    assert op['expectedAbsent'] and not (ROOT / op['targetPath']).exists()
for op in plan['sourcePromptProvenanceOperations']:
    verify(op['source'])
    if op['expectedBefore']: verify(op['expectedBefore'])
    else: assert op['expectedAbsent'] and not (ROOT / op['targetPath']).exists()
    if op['history']: verify(op['history'])
for k in ['all378WholePageObjectsExactToActualA_BNativeInput', 'candidateD2NativeCampaignDualSynthesisResolutionAndOrdinaryCLIPASS', 'candidateA2OrdinaryCLI0', 'candidateM378Cards7ScopesExactCurrentReuse', 'candidateP2ExactARowsClosedNativeSchemaAndSemantics0', 'candidateV2GenuineIndependentExactAssetApprovals', 'all49WholeDuties259WholePartnerRowsExact', 'all16SourceUnionHoldsStillOpen']:
    assert plan[k] is True, k
canon_path = ROOT / plan['canonicalMutation']['activePath']
qa_path = ROOT / plan['qaMutations']['activePath']
registry_path = ROOT / plan['registryAppendOnly']['activeRegistryPath']
before_canon, before_qa, before_registry = map(read, [canon_path, qa_path, registry_path])
candidate_canon = verify(plan['canonicalMutation']['fullCandidate'])
candidate_qa = verify(plan['qaMutations']['fullCandidate'])
after_canon, after_qa = map(read, [candidate_canon, candidate_qa])
old_goals = {g['id']: g for g in before_canon['goals']}
new_goals = {g['id']: g for g in after_canon['goals']}
assert len(old_goals) == len(new_goals) == 480 and set(old_goals) == set(new_goals)
assert {i for i in old_goals if old_goals[i] != new_goals[i]} == set(ids)
for i in ids:
    assert {k:v for k,v in old_goals[i].items() if k != 'resourceLinks'} == {k:v for k,v in new_goals[i].items() if k != 'resourceLinks'}
old_rows = {r['goalId']: r for r in before_qa['records']}
new_rows = {r['goalId']: r for r in after_qa['records']}
assert len(old_rows) == len(new_rows) == 379 and set(old_rows) == set(new_rows)
for i in old_rows:
    if i not in ids: assert old_rows[i] == new_rows[i]
    assert {k:v for k,v in old_rows[i].items() if k.startswith('human')} == {k:v for k,v in new_rows[i].items() if k.startswith('human')}
registry = copy.deepcopy(before_registry)
subject = next(s for s in registry['subjects'] if s['subject'] == 'chemie')
for k in ['resolutionIndexPaths', 'positiveEvidenceConfigPaths', 'semanticAtomicityConfigPaths']:
    for value in plan['registryAppendOnly'][k]:
        assert value not in subject[k] and (ROOT / value).is_file()
        subject[k].append(value)
for old, new in zip(before_registry['subjects'], registry['subjects']):
    if old['subject'] != 'chemie': assert old == new
hist_path = ROOT / 'scripts/config/historical-goal-visualization-assets.json'
hist = read(hist_path)
old_rel = f'chemie/{ids[0]}/{ids[0]}.jpg'
assert not any(row['path'] == old_rel for row in hist['assets'])
hist['assets'].append(dict(path=old_rel, sha256=plan['original6JPEGAndPromptHistory']['jpeg']['sha256'], supersededBy=f'chemie/{ids[0]}/{ids[0]}.png', reason='Exact former JPEG retained after actual false activation-energy reference arrows and malformed German axis labels; genuine independent current PNG reviews separately bound.', reviewEvidencePath=str((OWN / 'goal6.existing-JPEG-actual-defects.before-apply.json').relative_to(ROOT))))
protected = [ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json']
for subject_name in ['BIOLOGIE', 'MATHEMATIK', 'PHYSIK']:
    protected.append(ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject_name}.de.json')
for subject_name in ['biologie', 'mathematik', 'physik']:
    protected.append(ROOT / f'curricula/DE/Gymnasium/quality/goal-visualization-qa/{subject_name}.qa.json')
protected += [ROOT / plan['beforeActiveBindings'][k]['path'] for k in ['kinds', 'floors', 'atlasInputs', 'bookConfig']]
protected_bindings = [bind(p) for p in protected]
for name, b in plan['beforeActiveBindings'].items():
    dest = OWN / 'before' / f'{name}.exact.json'
    dest.parent.mkdir(exist_ok=True)
    assert not dest.exists()
    shutil.copyfile(verify(b), dest)
shutil.copyfile(hist_path, OWN / 'before/historical-assets.exact.json')
put(OWN / 'reviewed-two-pre-apply-guard.actual.json', dict(technicalSeal=bind(seal_path), concretePlan=bind(TECH / 'concrete-reviewed-two-guarded-root-integration.plan.json'), protectedFiles=protected_bindings, goalIds=ids, allOther478Canonical376Pages377QARowsExact=True, humanFieldsExact=True, sourceHoldsRetained=16, noNewScientificReviewByIntegrator=True, activeWritesBeforeGuard=0, humanApproval=False))

# Dependent mutations follow complete guards; original evidence and old images stay exact.
for op in plan['reviewedPNGCopyOperations']:
    target = ROOT / op['targetPath']; target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(verify(op['source']), target)
for op in plan['sourcePromptProvenanceOperations']: shutil.copyfile(verify(op['source']), ROOT / op['targetPath'])
shutil.copyfile(candidate_canon, canon_path)
shutil.copyfile(candidate_qa, qa_path)
hist_path.write_text(json.dumps(hist, ensure_ascii=False, indent=2) + '\n')
registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n')
for b in protected_bindings: verify(b)
for b in plan['currentSourceFileGuards'] + plan['goodGoal8JPEGByteExactKEEP']: verify(b)
for op in plan['reviewedPNGCopyOperations']:
    verify(op['retainExistingJPEGExactly'])
    assert sha(ROOT / op['targetPath']) == op['source']['sha256']
put(OWN / 'genuine-two-applied-central-pending.actual.json', dict(appliedAt=datetime.now(timezone.utc).isoformat(), goalIds=ids, canonical=bind(canon_path), registry=bind(registry_path), qa=bind(qa_path), affectedChecks='pending', actualCentral='pending', strictGainClaimed=0, original6JPEGExactAllThreeRoots=True, good8JPEGExactAllThreeRoots=True, sourceHoldsRetained=16, humanApproval=False, humanTrial=False))
print(json.dumps(dict(guardedApply='PASS', newPNG6Copies=3, originalJPEG8='KEEP', strictGain=0, central='pending')))
