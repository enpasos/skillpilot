# SPDX-License-Identifier: Apache-2.0
"""Exact whole-body retention, normal schemas and portable successor inputs."""
import copy
import datetime
import hashlib
import importlib.util
import json
import os
import pathlib
import subprocess
import sys

sys.dont_write_bytecode = True
root = pathlib.Path.cwd()
own = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-corrosion-three-source-binding-corrections-author-successor-v1'
original_a = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-two-corrosion-whole-source-independent-a-v1'
original_author = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-four-bounded-source-current-author-20261008-v1'

def read(path):
    return json.loads(path.read_bytes())

def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(root)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

spec = importlib.util.spec_from_file_location('existing_validate_schemas', root / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
schema = read(root / 'docs/landscape-runtime.schema.json')
changed_ids = {
    'BW': {'bw-chem-sekii-3-3-5-b07-a01-c82a0fb5', 'bw-chem-sekii-3-4-7-b12-a01-17a99b58'},
    'RP': {'rp-chem-sekii-rp-ch-sekii-2022-baustein-4-5-001-8b5653dd', 'rp-chem-sekii-rp-ch-sekii-2022-baustein-4-5-002-d041abcd', 'rp-chem-sekii-rp-ch-sekii-2022-baustein-4-5-003-416a1404'},
    'TH': {'th-chem-sekii-th-ch-sekii-4-1-5-korrosion-erlautern-118-01-8b539a22'},
}
changed_fields = {'BW': {'sourceRef'}, 'RP': {'courseLevel', 'tags', 'sourceRef'}, 'TH': {'courseLevel', 'tags'}}
total_original_goals = 0
total_original_mapping_rows = 0
for state, ids in changed_ids.items():
    old = read(own / f'baseline/{state}.whole-source-extraction.original.json')
    new = read(own / f'candidate/{state}.whole-source-extraction.candidate.json')
    masked = copy.deepcopy(new)
    assert len(old['sourceGoals']) == len(new['sourceGoals'])
    total_original_goals += len(old['sourceGoals'])
    actual_changed = set()
    for a, b, c in zip(old['sourceGoals'], new['sourceGoals'], masked['sourceGoals']):
        assert a['id'] == b['id'] == c['id']
        if a != b:
            actual_changed.add(a['id'])
            assert {k for k in set(a) | set(b) if a.get(k) != b.get(k)} == changed_fields[state]
            for k in changed_fields[state]:
                c[k] = a[k]
        assert a == c
    assert actual_changed == ids
    if state == 'RP':
        oldpassage = next(p for p in old['passages'] if p['id'] == 'rp-chemistry-sekii:baustein-4-5')
        newpassage = next(p for p in masked['passages'] if p['id'] == oldpassage['id'])
        assert newpassage['page'] == 42 and oldpassage['page'] == 25
        newpassage['page'] = oldpassage['page']
    assert old == masked
    oldmap = read(own / f'baseline/{state}.whole-source-mapping.original.json')
    newmap = read(own / f'candidate/{state}.whole-source-mapping.candidate.json')
    total_original_mapping_rows += len(oldmap['mappings'])
    newmap['sourceExtractionPath'] = oldmap['sourceExtractionPath']
    assert newmap == oldmap

old57 = read(original_a / 'actual-selected57-whole-source-and269-whole-partner-rows.neutral.json')
new57 = read(own / 'candidate/whole57-duty106-edge269-partner-candidate.neutral.json')
assert len(old57) == len(new57) == 57
goal_ids = {'0908b3a2-9937-57de-8bfb-35a6de54aa1f', '94a62b39-d4a2-5882-99d1-6886ead07726'}
assert sum(len(r['wholeCurrentCanonicalPartners']) for r in new57) == 269
assert sum(sum(x['canonicalGoalId'] in goal_ids for x in r['wholeOriginalDuty']['allPartnerRows']) for r in new57) == 106
changed57 = []
for ordinal, (a, b) in enumerate(zip(old57, new57)):
    assert all(a[k] == b[k] for k in a)
    oldg = a['wholeOriginalDuty']['wholeRetainedExtractionGoal']
    if oldg != b['wholeCandidateExtractionGoal']:
        changed57.append(ordinal)
assert changed57 == [4, 5, 22, 23, 56]
current = read(root / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
by_id = {g['id']: g for g in current['goals']}
old38 = read(original_a / 'actual38-whole-current-partner-goals.neutral.json')
assert len(old38) == 38 and all(g == by_id[g['id']] for g in old38)
third = read(own / 'candidate/whole-third-RP-duty-and-three-original-whole-partners.neutral.json')
assert len(third['allOriginalPartnerRows']) == len(third['wholeCurrentCanonicalPartners']) == 3
assert all(g == by_id[g['id']] for g in third['wholeCurrentCanonicalPartners'])
assert (own / 'baseline/current-whole-canonical-480.original.json').read_bytes() == (root / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_bytes()
assert module.validate_file('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', schema)

old_seal = read(original_a / 'COR2-independent-A.final.freeze.json')
for b in old_seal['allOwnPackageFiles']:
    assert binding(root / b['path']) == b
retained_frame = read(original_a / 'actual-input-binding-and-preserved-whole-frame.neutral.json')
for b in retained_frame['retainedFrame'].values():
    assert binding(root / b['path']) == b
frame = read(original_author / 'source/whole929-duties-1602-edges-5459-partners.exact-retained.json')
assert len(frame['sourceGoals']) == 929
assert len(frame['matchedEdgesData']) == 1602
assert sum(len(x['allPartnerRows']) for x in frame['sourceGoals']) == 5459
assert len(read(original_author / 'source/selected106-whole-duty-current528-partner-body-contexts.json')) == 106
assert len(read(original_author / 'source/selected155-original-source-edges.exact-retained.json')) == 155

files = sorted(p for p in own.rglob('*') if p.is_file())
jsons = [p for p in files if p.suffix == '.json']
for path in jsons:
    assert module.validate_file(str(path.relative_to(root)), schema), path
for path in files:
    for ancestor in [path, *path.parents]:
        assert not ancestor.is_symlink()
        if ancestor == root:
            break
paths = [str(path.relative_to(root)) for path in files]
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(paths)+'\n', text=True, capture_output=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
for args in [['git', 'diff', '--check', '--', str(own.relative_to(root))], ['git', 'diff', '--cached', '--check', '--', str(own.relative_to(root))]]:
    actual = subprocess.run(args, text=True, capture_output=True)
    assert actual.returncode == 0, actual.stdout + actual.stderr
for state in ['RP', 'BW']:
    path = own / f'primary/{state}-whole-original-official.actual-original.pdf'
    actual = subprocess.run(['git', 'show', ':'+str(path.relative_to(root))], capture_output=True)
    assert actual.returncode == 0 and actual.stdout == path.read_bytes()

result = {'schemaVersion': 1, 'codeLicense': 'Apache-2.0', 'evidenceLicense': 'CC-BY-4.0',
          'status': 'PASS_exact_source_course_locator_deltas_and_normal_targeted_schema_portability',
          'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'fullOriginalSourceGoalsInThreeCollections': total_original_goals,
          'changedWholeSourceGoalRows': 6, 'otherSourceGoalBodiesExact': total_original_goals - 6,
          'changedSharedRPPageLocator': 1, 'wholeOtherExtractionFieldsMaskedExact': True,
          'originalFullMappingRowsUnchanged': total_original_mapping_rows,
          'allMappingDecisionsAndRowsUnchanged': True, 'onlyMappingSourcePathRedirected': True,
          'whole57OriginalDutyBodiesAnd269OriginalWholePartnerRowsExactRetained': True,
          'changedScopeRowOrdinals': changed57, 'remaining52ScopeGoalBodiesExact': True,
          'all106OriginalEdgesAnd38WholeCurrentGoalBodiesExact': True,
          'wholeThirdRPSourceDutyAndThreeWholeCurrentPartnersRetained': True,
          'wholeCurrentCanonical480ByteExact': True,
          'old929_1602_5459AndFour106_155_528FramesAndASealExact': True,
          'normalExistingValidatorUnmodified': True, 'qualityJSONFilesParsed': len(jsons),
          'indexedWholeTwoOfficialPDFsExact': True, 'noSymlinks': True,
          'allOwnPathsUnignoredOrAlreadyIndexed': True, 'ownDiffAndIndexWhitespacePassed': True,
          'fullRepositorySchemaRunClaim': False, 'activeInputsChanged': False,
          'materialFindings003_004RemainHold': True, 'independentSuccessorReviewPending': True,
          'newD_P_A_M_VApproval': False, 'newStrictClosures': 0, 'restoredBindings': 0,
          'humanApproval': False, 'humanTrial': False}
destination = own / 'normal/exact-whole-preservation-schema-portability.actual-result.json'
text = json.dumps(result, ensure_ascii=False, indent=2)+'\n'
json.loads(text)
temporary = pathlib.Path(str(destination)+'.writing')
temporary.write_text(text, encoding='utf-8')
os.replace(temporary, destination)
print(json.dumps(result, ensure_ascii=False))
