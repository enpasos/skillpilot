import datetime
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file() and (p / 'app').is_dir() and (p / 'curricula').is_dir())
OUT = Path(__file__).resolve().parent
TECH = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-split-four-reviewed-integration-preparation-technical-20261008-v1'
PLAN = TECH / 'ready-root-reviewed-guarded-integration-plan.portable-v3.technical.json'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def read(p):
    return json.loads(p.read_text())

def binding(b):
    p = ROOT / b['path']
    assert p.is_file(), ('missing binding', b['path'])
    assert sha(p) == b['sha256'].removeprefix('sha256:'), ('changed binding', b['path'])
    if 'bytes' in b:
        assert p.stat().st_size == b['bytes'], ('changed bytes', b['path'])
    return p

def receipt(name, data):
    p = OUT / name
    assert not p.exists(), ('immutable existing receipt', name)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def rows(p):
    return [json.loads(line) for line in p.read_text().splitlines() if line.strip()]

def keyed(rs):
    return {r['goalId']: r for r in rs}

assert ROOT.name == 'skillpilot' and (ROOT / 'AGENTS.md').is_file(), ROOT
sealpath = TECH / 'technical-reviewed-current202-split-four.final.freeze.json'
assert sha(sealpath) == 'ab946c02a6ce6c24d407fc3e3c3449811427337e0984627d283dd8e240517f71'
seal = read(sealpath)
for b in seal['ownFiles'] + seal['authorizedInactiveAtlasFiles']:
    binding(b)
portable = read(binding(seal['requiredPortableInputGuard']))
assert portable['ignoredRequiredFiles'] == [] and portable['brokenRequiredSymlinks'] == 0
for b in portable['requiredFiles']:
    binding(b)
plan = read(PLAN)
for b in plan['beforeBindings'].values():
    binding(b)
for b in plan['protectedOtherFiles'] + plan['mappingAndExtractionGuards']:
    binding(b)
for v in plan['actualAandBSeals'].values():
    s = read(binding(v['seal']))
    for b in s.get('frozenFiles', s.get('ownFiles', [])):
        binding(b)
for b in plan['actualAandBFirstSeals'].values():
    s = read(binding(b))
    for f in s.get('frozenFiles', s.get('ownFiles', [])):
        binding(f)
rootview = read(OUT / 'root-actual-standard-derived-four-page-technical-binding-adoption.actual.json')
assert rootview['decision'] == 'ACCEPT_TECHNICAL_CHAPTER_ANCHOR_ADOPTION'
assert rootview['actualObservedPages'] == [4, 5] and rootview['actualLocalFragmentsChecked'] == 23
for b in rootview['bindings']:
    binding(b)
replacements = plan['reviewedActiveReplacementFiles']
assert len(replacements) == 28 and len(plan['assetOperations']) == 10
for op in replacements:
    binding(op['source'])
    binding(op['expectedBefore'])
for op in plan['assetOperations']:
    assert op['action'] == 'copy_exact' and op['expectedBefore'] == 'missing'
    assert not (ROOT / op['target']).exists(), ('existing new target', op['target'])
    binding({'path': op['source'], 'sha256': op['sourceSha256']})
old = read(ROOT / replacements[0]['target'])
new = read(ROOT / replacements[0]['source']['path'])
og, ng = ({g['id']: g for g in x['goals']} for x in [old, new])
parent = plan['oldStableParentId']
children = set(plan['newChildGoalIds'])
selected = set(plan['selectedGoalIds'])
assert len(og) == 474 and len(ng) == 476 and set(ng) - set(og) == children
assert len([g for g in og if g != parent and og[g] == ng[g]]) == 473
beforeparent, afterparent = dict(og[parent]), dict(ng[parent])
for k in ['weight', 'contains', 'type']:
    beforeparent.pop(k)
    afterparent.pop(k)
assert beforeparent == afterparent and ng[parent]['type'] == 'cluster'
assert set(ng[parent]['contains']) == children and ng[parent]['weight'] == 2
for g in children:
    assert ng[g]['type'] == 'atomic' and ng[g]['weight'] == 1 and ng[g]['contains'] == []
    assert 'splitFromCanonicalGoalId' not in json.dumps(ng[g])
    assert ng[g]['extendedData']['provenance']['canonicalSplitOriginGoalId'] == parent
    assert ng[g]['requires'] == og[parent]['requires']
oldkind = keyed(read(ROOT / replacements[1]['target'])['decisions'])
newkind = keyed(read(ROOT / replacements[1]['source']['path'])['decisions'])
assert set(newkind) - set(oldkind) == children
assert all(newkind[g] == r for g, r in oldkind.items() if g != parent)
oldqa = keyed(read(ROOT / replacements[2]['target'])['records'])
newqa = keyed(read(ROOT / replacements[2]['source']['path'])['records'])
assert len(oldqa) == 391 and len(newqa) == 392
assert set(newqa) - set(oldqa) == children and set(oldqa) - set(newqa) == {parent}
assert all(newqa[g] == r for g, r in oldqa.items() if g not in selected and g != parent)
assert sum(g not in selected and g != parent for g in oldqa) == 388
for g, r in oldqa.items():
    if g == parent:
        continue
    assert {k: v for k, v in r.items() if k.startswith('human')} == {k: v for k, v in newqa[g].items() if k.startswith('human')}
for g in selected:
    assert newqa[g]['aiApproved'] == 'yes'
    assert newqa[g]['aiReviewedAt'] == plan['pairedV4UsesOrdinaryAiNormalizerAndActualFinalDate']
    assert newqa[g]['aiApprovedAssetSha256'] == newqa[g]['assetSha256']
    assert newqa[g]['humanApproved'] == 'no'
for category in ['atomicityConfig', 'memoryConfig']:
    a = plan['immutableAM392Versions'][category]
    prior, after = keyed(rows(binding(a['actualCurrentReview']))), keyed(rows(binding(a['futureImmutableLedger'])))
    assert len(prior) == 391 and len(after) == 392
    assert set(after) - set(prior) == children and set(prior) - set(after) == {parent}
    assert all(after[g] == r for g, r in prior.items() if g != parent)
p2 = rows(binding(plan['genuineP2Records']))
assert {r['goalId'] for r in p2} == children
assert all(r['status'] == 'needs_human_review' and r['schemaVersion'] == 2 and r['evidenceLevel'] == 'E1' for r in p2)
registrypath = binding(plan['registryBefore'])
registry = read(registrypath)
entry = next(x for x in registry['subjects'] if x['subject'] == 'biologie')
patched = json.loads(json.dumps(entry))
patched['resolutionIndexPaths'].append(plan['appendResolutionIndexPath'])
patched['positiveEvidenceConfigPaths'].append(plan['appendPositiveEvidenceConfigPath'])
patched.setdefault('resolutionSupersessions', []).extend(plan['appendResolutionSupersessions'])
assert patched == read(ROOT / plan['mergeOnlyBiologyRegistryEntryFrom'])
assert len(plan['appendResolutionSupersessions']) == 2 and {r['goalId'] for r in plan['appendResolutionSupersessions']} == set(plan['contextCompanionGoalIds'])
baseline = read(binding(plan['baselineCentralReport']))
assert [(x['subject'], x['strictComplete'], x['denominator']) for x in baseline['subjects']] == [('mathematik', 807, 807), ('physik', 478, 478), ('chemie', 173, 378), ('biologie', 202, 391)]
for subject in baseline['subjects']:
    assert set(subject['strictCompleteGoalIds']) == set(plan['protectedStrictGoalIds'][subject['subject']])
    assert set(subject['currentGoalIds']) == set(plan['protectedCurrentGoalIds'][subject['subject']])
before = OUT / 'before'
for op in replacements:
    target = ROOT / op['target']
    snapshot = before / op['target']
    snapshot.parent.mkdir(parents=True, exist_ok=True)
    assert not snapshot.exists()
    shutil.copyfile(target, snapshot)
snapshot = before / plan['registryBefore']['path']
snapshot.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(registrypath, snapshot)
receipt('reviewed-two-child-split.pre-apply-guard.actual.json', {'role': 'Root complete pre-apply exact binding and semantic delta guard, independent reviews retained', 'actualAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'technicalSealSha256': sha(sealpath), 'portableInputCount': len(portable['requiredFiles']), 'protectedOtherFileCount': len(plan['protectedOtherFiles']), 'unchangedMappingExtractionCount': len(plan['mappingAndExtractionGuards']), 'protectedStrictCounts': {s['subject']: s['strictComplete'] for s in baseline['subjects']}, 'replacementCount': 28, 'newCopyCount': 10, 'other473WholeBodiesExact': True, 'other390AMRowsExact': True, 'other388QARowsAnd390HumanRowsExact': True, 'rootActuallyViewedRealFinalPages': True, 'legacyParentMasteryDoesNotAutoMasterNewChildren': True, 'newScientificClosuresClaimedBeforeCentral': 0, 'humanApproval': False})
for op in replacements:
    target = ROOT / op['target']
    shutil.copyfile(ROOT / op['source']['path'], target)
    assert sha(target) == op['source']['sha256'].removeprefix('sha256:')
for op in plan['assetOperations']:
    target = ROOT / op['target']
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / op['source'], target)
    assert sha(target) == op['sourceSha256'].removeprefix('sha256:')
entry.clear()
entry.update(patched)
registrypath.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n')
for b in plan['protectedOtherFiles'] + plan['mappingAndExtractionGuards']:
    binding(b)
receipt('guarded-two-child-split-adoption.actual.json', {'role': 'Applied only genuinely reviewed two-child split with targeted companion context bindings', 'actualAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'replacedFiles': [x['target'] for x in replacements], 'newCopiedFiles': [x['target'] for x in plan['assetOperations']], 'registryOnlyBiologyD4P2AndTwoCompanionSupersessions': True, 'newChildIds': sorted(children), 'denominatorDelta': 1, 'actualCentralPending': True, 'historicalArtifactsChanged': False, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'guardedApply': 'PASS', 'replacedFiles': 28, 'newExactCopies': 10, 'ordinaryGeneratorsAndCurrentCentralPending': True}))
