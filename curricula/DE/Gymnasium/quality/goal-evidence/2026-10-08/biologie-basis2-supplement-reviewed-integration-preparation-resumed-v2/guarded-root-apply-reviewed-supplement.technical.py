# SPDX-License-Identifier: Apache-2.0
"""Concrete guarded Root apply. The default only prints the verified plan."""
import argparse, hashlib, json, os, subprocess, tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent

def read(p):
    return json.loads(Path(p).read_text())

def bind(p):
    p = Path(p)
    raw = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def verify(ref):
    p = ROOT / ref['path']
    assert p.is_file() and not p.is_symlink(), str(p)
    actual = bind(p)
    assert actual['sha256'] == ref['sha256'].removeprefix('sha256:') and actual['bytes'] == ref['bytes'], str(p)
    return p

parser = argparse.ArgumentParser()
parser.add_argument('--apply', action='store_true')
args = parser.parse_args()
guard_path = OWN / 'reviewed-supplement-adoption.final.guard.json'
guard = read(guard_path)
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == guard['expectedHead']
for item in guard['before'].values():
    assert verify(item['active']).read_bytes() == verify(item['snapshot']).read_bytes()
for ref in guard['candidate'].values():
    verify(ref)
for ref in guard['requiredTechnicalProofs'].values():
    verify(ref)
proof = read(verify(guard['requiredTechnicalProofs']['strictProgress']))
assert proof['actualCentralExitCode'] == 0 and proof['actualBlockingIssues'] == 0
assert (proof['strictComplete'], proof['denominator']) == (246, 394)
assert proof['all244PreviousStrictIdsRetained'] and proof['newScientificClosures'] == sorted(guard['newGoalIds'])
frame = read(verify(guard['requiredTechnicalProofs']['wholeCurrentFrame']))
assert frame['wholePageDifferencesToGenuineReviewedFull394'] == []
assert frame['existingWord576WholeContextEqualExceptReviewedRelationPermutation']
assert frame['wholeThreeExternalReverseRelationObjectsExactAfterKeying']
dependent = read(verify(guard['requiredTechnicalProofs']['dependentStatusAndFloors']))
assert dependent['bioCQR003']['status'] == 'pass' and dependent['allNineProtectedFloorsPassed']
assert dependent['bioCQR003']['metrics']['unsupportedAssignedAtomicGoals'] == 0
assert dependent['bioCQR003']['metrics']['unmappedSourceAtomicGoals'] == 0
preserved = read(verify(guard['requiredTechnicalProofs']['currentSourcePreservation']))
assert (preserved['historicalPartnerRowCount'], preserved['historicalPartnerRowsCurrentlyEffective'], preserved['previouslyScopeRefinedHistoricalPartnerRows']) == (268, 248, 20)
assert preserved['wholeCurrent3084MappingRowsExactlyRetained'] and preserved['newBoundedPartialRowCount'] == 10
assert preserved['fourOriginalOperatorHoldsStillOpen'] and not preserved['wholeOriginalSourceCoverageApproved']

before = read(verify(guard['before']['canonical']['active']))
after = read(verify(guard['candidate']['canonical']))
old = {g['id']: g for g in before['goals']}
new = {g['id']: g for g in after['goals']}
assert len(old) == 476 and len(new) == 479
assert set(new) - set(old) == set(guard['newGoalIds'] + [guard['supplementId']])
root_id = 'e8d54127-d42e-51f5-bfa5-51d826069f95'
for gid, goal in old.items():
    expected = json.loads(json.dumps(goal))
    if gid == root_id:
        expected['contains'].append(guard['supplementId'])
    assert new[gid] == expected, gid
    assert new[gid].get('requires', []) == goal.get('requires', []), gid
assert new[root_id]['weight'] == 1
shared_id = '860c80f9-e463-598b-8ef8-79f65c12f235'
assert new[shared_id] == old[shared_id] and new[shared_id]['weight'] == 5 and len(new[shared_id]['contains']) == 5
assert new[guard['supplementId']]['extendedData']['applicabilityMappingInheritance'] == 'boundary'
old_qa = read(verify(guard['before']['qa']['active']))
new_qa = read(verify(guard['candidate']['qa']))
assert len(old_qa['records']) == 392 and len(new_qa['records']) == 394
assert [r for r in new_qa['records'] if r['goalId'] not in guard['newGoalIds']] == old_qa['records']
old_registry = read(verify(guard['before']['registry']['active']))
new_registry = read(verify(guard['candidate']['registry']))
assert [s for s in new_registry['subjects'] if s['subject'] != 'biologie'] == [s for s in old_registry['subjects'] if s['subject'] != 'biologie']
for item in guard['mappingInstalls'] + guard['imageInstalls']:
    verify(item['source'])
    assert item['mustNotExist'] and not (ROOT / item['destination']).exists(), item['destination']

plan = {
    'schemaVersion': 1,
    'role': 'CONCRETE_GUARDED_ROOT_REVIEWED_SUPPLEMENT_INTEGRATION_PLAN',
    'currentStrict': '244/392', 'actualIsolatedCandidateStrict': '246/394',
    'canonicalNodeCount': 479, 'netNewScientificClosures': 2,
    'newScientificClosures': guard['newGoalIds'], 'restoredExistingBindingNetGain': 0,
    'existingWordContextSupersession': guard['contextSupersessionGoalId'],
    'filePlan': [{'destination': guard['before'][key]['active']['path'], 'exactCandidate': ref} for key, ref in guard['candidate'].items()],
    'mappingInstallPlan': guard['mappingInstalls'], 'imageInstallPlan': guard['imageInstalls'],
    'sourceAtlasMappingPaths': '29 complete reviewed extraction mappings; 8 runtime partial components remain separate',
    'sourceRefreshCommand': ['node', 'app/node_modules/tsx/dist/cli.mjs', 'app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', guard['before']['sourceInputs']['active']['path']],
    'requiredRootPostApply': ['ordinary affected P/A/M/V/source and asset checks', 'batched stable current four-subject central report with protected M7 floors', 'dependent curriculum status and all nine protected floors', 'required schema, AI transparency and batched application build'],
    'historicalSourcePartnerCounts': {'original': 268, 'currentlyEffective': 248, 'previouslyScopeRefined': 20},
    'all3084CurrentMappingRowsPreserved': True, 'boundedNewPartialRows': 10,
    'fourOriginalOperatorHoldsRetained': True,
    'old392AllPagesUnchangedClaim': False,
    'newScientificReviewByIntegrator': False, 'humanApproval': False, 'humanTrial': False,
    'applyRequested': args.apply,
}
print(json.dumps(plan, ensure_ascii=False, indent=2))
if not args.apply:
    raise SystemExit(0)

receipt = OWN / 'root-guarded-reviewed-supplement-apply.actual.json'
assert not receipt.exists()

def atomic_exact_install(ref, destination):
    source = verify(ref)
    dest = ROOT / destination
    dest.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=dest.parent, prefix='.reviewed-supplement-', delete=False) as output:
        temporary = Path(output.name)
        output.write(source.read_bytes())
    try:
        os.chmod(temporary, 0o644)
        os.replace(temporary, dest)
    finally:
        temporary.unlink(missing_ok=True)
    actual = bind(dest)
    assert actual['sha256'] == ref['sha256'] and actual['bytes'] == ref['bytes']

# Every active input, candidate, proof and absent installation destination was
# checked before this explicitly selected apply branch writes any active file.
for item in guard['mappingInstalls'] + guard['imageInstalls']:
    atomic_exact_install(item['source'], item['destination'])
for key, ref in guard['candidate'].items():
    atomic_exact_install(ref, guard['before'][key]['active']['path'])
receipt.write_text(json.dumps({
    'schemaVersion': 1, 'appliedAtUtc': datetime.now(timezone.utc).isoformat(),
    'guard': bind(guard_path), 'actualCandidateFileCount': 7,
    'actualNewMappingInstallCount': 8, 'actualImageAndProvenanceInstallCount': 10,
    'activeCentralAndDependentChecks': 'PENDING_ROOT_POST_APPLY',
    'activeStrictGainClaimed': 0, 'newScientificReviewByIntegrator': False,
    'humanApproval': False, 'humanTrial': False,
}, ensure_ascii=False, indent=2) + '\n')
