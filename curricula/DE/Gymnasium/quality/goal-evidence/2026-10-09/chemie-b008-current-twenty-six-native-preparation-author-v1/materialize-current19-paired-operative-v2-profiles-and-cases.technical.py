# SPDX-License-Identifier: Apache-2.0
"""Real ordinary nineteen-profile/four-case successors; no current approvals."""
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'nineteen-operative-native-preparation-v2'
CAP = ROOT / 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule'
DAY = OWN.parent
def read(p): return json.loads(p.read_text())
def bind(p):
    assert not p.is_symlink(), p
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def verify(b):
    actual = bind(ROOT / b['path'])
    assert actual['sha256'] == 'sha256:' + b['sha256'].removeprefix('sha256:'), b['path']
    if 'bytes' in b: assert actual['bytes'] == b['bytes'], b['path']
    return actual
def bindings(v):
    if isinstance(v, dict):
        if isinstance(v.get('path'), str) and isinstance(v.get('sha256'), str): yield v
        for x in v.values(): yield from bindings(x)
    elif isinstance(v, list):
        for x in v: yield from bindings(x)
def write(p, v):
    assert p.is_relative_to(OUT) and not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(v if isinstance(v, bytes) else (json.dumps(v, ensure_ascii=False, indent=2) + '\n').encode())
    return bind(p)
def cap_copy(p):
    dest = CAP / p.relative_to(ROOT)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists(): assert dest.read_bytes() == p.read_bytes(), p
    else: shutil.copyfile(p, dest)
def pointer(v, ptr):
    for token in ptr.strip('/').split('/'):
        token = token.replace('~1', '/').replace('~0', '~')
        v = v[int(token)] if isinstance(v, list) else v[token]
    return v
def digest(v): return 'sha256:' + hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

assert not OUT.exists()
pair_path = DAY / 'chemie-b008-current-nineteen-targeted-material-pairing-root-v2/nineteen-whole-materials.targeted-three-independent-pair.actual.json'
assert bind(pair_path)['sha256'] == 'sha256:9caf0743523effdb09f77a326e34a94a95d783cda4f61063928b5f4084ae47fa'
pair = read(pair_path)
assert pair['boundedMaterialAccepted'] == 19 and pair['unchangedCandidatesReused'] == 16 and pair['freshCandidatesAccepted'] == 3
for b in bindings(pair): verify(b)
author_path = DAY / 'chemie-b008-current-nineteen-whole-positive-author-v1/remediation-v2/neutral-targeted-three-whole-positive-material-remediation-v2.author.entry.json'
assert bind(author_path)['sha256'] == 'sha256:711655f51c8e078b6bf1cf334ce01766e596bd60d50f12c68cc11e67c4aed097'
author = read(author_path)
for b in bindings(author): verify(b)
spec_path = ROOT / author['finalNormal19CandidateSet']['path']
specs = read(spec_path)
assert len(specs['goals']) == 19
ids = [g['goalId'] for g in specs['goals']]
assert len(set(ids)) == 19 and 'a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1' in ids
old_intake_path = OWN / 'positive/neutral-current19-profile-and-worked-case-author-bindings.entry.json'
old_intake = read(old_intake_path)
old_material_path = ROOT / old_intake['wholeCasesAndWorkedTransfersPath']
old_material = read(old_material_path)
old_by = {g['goalId']: g for g in old_material['entries']}
assert set(old_by) == set(ids)
old_spec_path = ROOT / old_intake['originalB19CandidateSet']['path']
old_specs = {g['goalId']: g for g in read(old_spec_path)['goals']}
changed_profiles = sorted(g['goalId'] for g in specs['goals'] if g['profile'] != old_specs[g['goalId']]['profile'])
assert changed_profiles == sorted(author['changedGoalIds']) and len(changed_profiles) == 3
successor_path = ROOT / author['operativeFourWholeCaseSuccessors']['path']
successors = {r['caseKey']: r for r in read(successor_path)['entries']}
assert len(successors) == 4
material_index_path = ROOT / author['operativeMaterialIndex']['path']
material_index = read(material_index_path)
assert len(material_index['files']) == 11
for b in material_index['files']:
    verify(b); cap_copy(ROOT / b['path'])
assembled, case_deltas = [], []
for spec in specs['goals']:
    gid = spec['goalId']; original = old_by[gid]
    supplements = {s['caseKey']: s for s in original['authoredWholeCaseAndWorkedTransferSupplements']}
    cases = []
    for old_case in original['originalWholeBilingualCases']:
        case_key = old_case['caseKey']; supplemental = supplements[case_key]
        archive = supplemental['wholeOriginalCase']; verify(archive['input'])
        assert pointer(read(ROOT / archive['input']['path']), archive['jsonPointer']) == old_case
        assert digest(old_case) == 'sha256:' + archive['valueSha256'].removeprefix('sha256:')
        operative = deepcopy(old_case)
        worked = deepcopy(supplemental['authoredWorkedFreshTransferResponse'])
        changed = []
        fresh_successor = None
        if case_key in successors:
            successor = successors[case_key]
            assert successor['goalId'] == gid and successor['originalWholeCaseArchiveUnchanged']
            old_pointer = successor['wholeOriginalCaseBinding']; verify(old_pointer['file'])
            assert pointer(read(ROOT / old_pointer['file']['path']), old_pointer['jsonPointer']) == old_case
            for key, value in successor['replacementFields'].items(): operative[key] = deepcopy(value)
            assert operative == successor['operativeWholeCase'], 'Apply whole operative successor in actual fields'
            changed = sorted(k for k in set(old_case) | set(operative) if old_case.get(k) != operative.get(k))
            assert set(changed) == set(successor['replacementFields'])
            if successor['newWorkedSupplement'] is not None: worked = deepcopy(successor['newWorkedSupplement'])
            fresh_successor = deepcopy(successor['newFreshWorkedTransferSupplement'])
            case_deltas.append({'goalId': gid, 'caseKey': case_key, 'actualChangedOrdinaryFields': changed,
                                'operativeSuccessor': {'file': bind(successor_path), 'jsonPointer': '/entries/' + str(list(successors).index(case_key))},
                                'allOtherWholeCaseFieldsExact': True})
        cases.append({'caseKey': case_key, 'wholeOperativeCase': operative,
                      'authoredWorkedTaskAndTransferResponse': worked,
                      'freshTransferResponseSuccessor': fresh_successor,
                      'originalWholeCaseArchivePointer': archive,
                      'originalWholeWorkedTransferSupplement': supplemental,
                      'actualChangedOrdinaryFields': changed,
                      'noActualLearnerResearchExperimentOrPhysicalConstructionClaim': True})
    assembled.append({'goalId': gid, 'wholeOriginalGoalBeforeResources': original['wholeOriginalGoalBeforeResources'],
                      'wholeOriginalRawProfile': original['wholeOriginalRawProfile'],
                      'wholePairedNormalV2Profile': deepcopy(spec['profile']), 'wholeOperativeCases': cases,
                      'historicalWholeTwoCasesAndOriginalWorkedSupplementsPreserved': True})
assert len(case_deltas) == 4
whole_material_path = OUT / 'current-nineteen-thirty-eight-operative-cases-and-whole-profiles.neutral-input.json'
write(whole_material_path, {'schemaVersion': 1, 'entries': assembled,
    'exactChangedWholeProfileGoalIds': changed_profiles, 'exactFourOrdinaryCaseDeltas': case_deltas,
    'original38WholeCasesAnd38WorkedTransfersRetained': bind(old_material_path),
    'unchanged34OperativeWholeCases': True, 'whole16ProfileBodiesValueExact': True,
    'actualElevenFiniteMaterials': bind(material_index_path),
    'ordinarySourceCourseAtlasAndCurrentNativeApproval': False, 'activeWrites': [], 'netStrictGain': 0, 'humanApproval': False})
current_set = deepcopy(specs)
current_set['reviewId'] = 'chemie-b008-current-nineteen-operative-v2-native-author-20261009-v1'
current_set['reviewedAt'] = datetime.now(timezone.utc).isoformat()
current_set['reviewer'] = 'Codex technical assembly of genuine whole19 paired material components; current source/native approval pending'
for spec in current_set['goals']:
    spec['reason'] += ' Current exact raster binding is technical assembly only; source/course/Atlas and current native D/P remain separate HOLDs.'
    spec['dissent'] = list(spec.get('dissent', [])) + ['Ordinary wholeSource395/course/target contexts are not approved by bounded material acceptance.']
set_path = OUT / 'P19.actual-operative-v2.normal-author-candidate-set.json'; write(set_path, current_set)
config = read(ROOT / old_intake['actualCurrentP19ConfigPath'])
config['reviewId'] = current_set['reviewId']; config['scope']['goalIds'] = ids
config['scope']['label'] = 'Whole19 paired materials, actual 4 case successors and unchanged rasters; current source/native approval pending'
record_path = OUT / 'P19.actual-current-raster.ordinary-author-candidate.review.jsonl'
config['reviewPath'] = str(record_path.relative_to(ROOT))
config_path = OUT / 'P19.actual-current-raster.ordinary-author-candidate.config.json'; write(config_path, config)
for path in [set_path, config_path, ROOT / config['landscapePath'], ROOT / config['semanticKindLedgerPath'], ROOT / config['reviewCriteriaPath']]: cap_copy(path)
command = [str(ROOT / 'app/node_modules/.bin/tsx'), 'scripts/materializePositiveGoalEvidenceCandidates.ts',
           '--config', str(config_path.relative_to(ROOT)), '--candidates', str(set_path.relative_to(ROOT)), '--write']
result = subprocess.run(command, cwd=CAP / 'app', capture_output=True, text=True, timeout=60)
log_path = OUT / 'ordinary-current-nineteen-P-materializer.actual.stdout.txt'; write(log_path, (result.stdout + result.stderr).encode())
terminal_path = OUT / 'ordinary-current-nineteen-P-materializer.actual-terminal.json'
write(terminal_path, {'schemaVersion': 1, 'argv': command, 'cwd': str((CAP / 'app').relative_to(ROOT)),
    'actualExitCode': result.returncode, 'normalOutput': bind(log_path), 'currentScientificApproval': False,
    'activeWrites': [], 'netStrictGain': 0})
assert result.returncode == 0, result.stdout + result.stderr
write(record_path, (CAP / record_path.relative_to(ROOT)).read_bytes())
records = [json.loads(line) for line in record_path.read_text().splitlines() if line]
assert len(records) == 19 and [r['goalId'] for r in records] == ids
for spec, record in zip(current_set['goals'], records):
    assert record['profile'] == spec['profile']
    assert record['reviewAuthority'] == 'ai_candidate' and record['status'] == 'needs_human_review'
    assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1' and record['reviewRunIds'] == []
entry_path = OUT / 'neutral-current-nineteen-operative-material-profile-native-intake.entry.json'
write(entry_path, {'schemaVersion': 1, 'role': 'Neutral actual operative whole19/four-case technical native intake, no current scientific or source approval',
    'goalIds': ids, 'wholeProfileCount': 19, 'wholeOperativeCaseCount': 38,
    'wholeOperativeCasesAndProfileBodies': bind(whole_material_path), 'actualElevenFiniteMaterials': bind(material_index_path),
    'genuineWholeMaterialPair': bind(pair_path), 'actualFinalAuthorEntry': bind(author_path),
    'originalCurrent19AuthorIntake': bind(old_intake_path), 'originalWhole38CaseAndWorkedArchive': bind(old_material_path),
    'currentNormalCandidateSet': bind(set_path), 'currentNormalPConfig': bind(config_path), 'currentNormalPRecords': bind(record_path),
    'normalMaterializerTerminal': bind(terminal_path), 'exactThreeProfileSuccessors': changed_profiles,
    'actualFourOrdinaryCaseFieldReplacements': case_deltas, 'unchanged16ProfileBodiesAnd34WholeCasesExact': True,
    'sourceCourseViewAtlasStillSeparateHOLD': True, 'currentNativeReviews': 'PENDING',
    'noActualLearnerResearchExperimentDigitalFileOrPhysicalModelCertified': True,
    'activeWrites': [], 'netStrictGain': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'entry': bind(entry_path), 'normalProfiles': 19, 'wholeOperativeCases': 38,
                  'changedProfiles': 3, 'changedCaseBodies': 4, 'normalMaterializer': 'PASS', 'netStrictGain': 0}))
