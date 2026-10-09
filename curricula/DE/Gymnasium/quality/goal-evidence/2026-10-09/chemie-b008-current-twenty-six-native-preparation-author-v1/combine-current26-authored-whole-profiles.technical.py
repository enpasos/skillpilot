# SPDX-License-Identifier: Apache-2.0
"""Combine disjoint sealed author bodies and run the ordinary P materializer in a thin capsule."""
import copy
import datetime
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
CAP = ROOT / 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule'
assert len(sys.argv) == 5, 'Usage: python combine-current26-authored-whole-profiles.technical.py <B19-candidate-set> <B19-case-transfer-supplements> <B19-neutral-entry> <B19-first-seal>'


def read(path):
    return json.loads(path.read_text())


def bind(path):
    assert not path.is_symlink()
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(),
            'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def verify(binding):
    actual = bind(ROOT / binding['path'])
    assert actual['sha256'] == 'sha256:' + binding['sha256'].removeprefix('sha256:'), binding['path']
    if 'bytes' in binding:
        assert actual['bytes'] == binding['bytes'], binding['path']
    return actual


def declared_bindings(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            yield value
        for item in value.values():
            yield from declared_bindings(item)
    elif isinstance(value, list):
        for item in value:
            yield from declared_bindings(item)


def write(path, value):
    assert path.is_relative_to(OWN) and not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(value, bytes):
        path.write_bytes(value)
    else:
        path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def cap_copy(path):
    target = CAP / path.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        assert target.read_bytes() == path.read_bytes(), path
    else:
        shutil.copyfile(path, target)


raw = read(OWN / 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json')
whole = {row['wholeGoal']['id']: row for row in raw['routineBodies']}
ids = [row['wholeGoal']['id'] for row in raw['routineBodies']]
assert len(ids) == len(set(ids)) == 26
a_dir = OWN.parent / 'chemie-b008-source19-remaining-seven-whole-author-v1'
a_entry_path = a_dir / 'neutral-remaining-seven-whole-source-and-P.author.entry.json'
a_seal_path = a_dir / 'remaining-seven-whole-source-and-P-author.first.freeze.json'
a_entry, a_seal = read(a_entry_path), read(a_seal_path)
assert bind(a_entry_path)['sha256'] == 'sha256:560d82aa70ae109789526eac70f44061ef67cc7f767f1d4946c787ede6c9a996'
assert bind(a_seal_path)['sha256'] == 'sha256:5885d5f2e57b39a471f500a379873dfa751c1c0d18ed770082be3d8e34ef8901'
for binding in declared_bindings(a_seal):
    verify(binding)
for binding in read(ROOT / a_entry['firstAuthorInputFreeze']['path'])['inputs']:
    verify(binding)
a_profiles = read(ROOT / a_entry['normalP7AuthorSpecs']['path'])['entries']
a_cases = read(ROOT / a_entry['whole14CasesAndWorkedTransferSupplements']['path'])['cases']
assert len(a_profiles) == 7 and len(a_cases) == 14
b_specs_path, b_cases_path, b_entry_path, b_seal_path = [ROOT / path for path in sys.argv[1:]]
b_specs, b_cases_input, b_entry, b_seal = [read(path) for path in [b_specs_path, b_cases_path, b_entry_path, b_seal_path]]
for binding in declared_bindings(b_seal):
    verify(binding)
assert b_specs['schemaVersion'] == 1 and b_specs['authoringContract'] == 'positive-understanding-evidence-candidates-v1'
b_profiles = b_specs['goals']
assert len(b_profiles) == 19
a_ids = {row['goal']['id'] for row in a_profiles}
b_ids = {row['goalId'] for row in b_profiles}
assert a_ids.isdisjoint(b_ids) and a_ids | b_ids == set(ids)
expected_a7 = {'9fc800d1-92d1-5ef6-81c1-33960ae034dd', '7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6',
               'a8800c36-d13c-5f63-962c-cf18c3795c63', '431a0f03-f28a-5e56-a61f-000336d0b410',
               '6c9adc36-b6d0-57fa-8e02-5e156aebfecc', 'e5a5dcd8-053c-55fd-b5c7-bba93779da53',
               '6c7ce93c-7675-51da-bc0c-7d0257f7ff7d'}
assert a_ids == expected_a7
specs_by = {}
for row in a_profiles:
    assert row['goal'] == whole[row['goal']['id']]['wholeGoal']
    metadata = row['reviewRecordMetadata']
    assert metadata['reviewAuthority'] == 'ai_candidate' and metadata['status'] == 'needs_human_review'
    specs_by[row['goal']['id']] = {'goalId': row['goal']['id'], 'reason': metadata['reason'],
                                 'evidenceLevel': metadata['evidenceLevel'], 'maximumClaimScope': metadata['maximumClaimScope'],
                                 'dissent': metadata['dissent'], 'profile': row['profile']}
for row in b_profiles:
    assert row['goalId'] not in specs_by
    assert row.get('evidenceLevel', 'E1') == 'E1' and row.get('maximumClaimScope', 'G1') == 'G1'
    specs_by[row['goalId']] = row
review_id = 'chemie-b008-current-twenty-six-native-author-20261009-v1'
candidate_set = {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
                 'reviewId': review_id, 'reviewedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                 'reviewer': 'Codex technical assembly of disjoint whole7+whole19 authored profiles; no independent scientific approval',
                 'goals': [copy.deepcopy(specs_by[gid]) for gid in ids]}
for spec in candidate_set['goals']:
    spec['reason'] += ' Exact current selected raster/native binding only; Source19/course/placement/atomicity/memory/current contexts still need independent approval.'
    spec['dissent'] = list(spec.get('dissent', [])) + ['Source19 whole, scoped source decision adoption,35 source-view findings and8 protected current contexts remain held.']
    assert len(spec['profile']['applicationCaseBriefs']) == 2
    assert spec['profile']['coverageExpectations']['minimumIndependentDemonstrations'] >= 2
positive = OWN / 'positive'
set_path = positive / 'P26.disjoint-seven-plus-nineteen.whole-author-candidate-set.json'
write(set_path, candidate_set)
candidate_path = OWN / 'candidate/canonical504-current26-resource-links.inactive.json'
kinds_path = OWN / 'candidate/semantic-kinds.current504.technical-review-input.json'
criteria_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
record_path = positive / 'P26.current-raster.author-candidate.review.jsonl'
config = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
          'schemaVersion': 2, 'reviewId': review_id, 'goalFingerprintRuleVersion': 'goal-evidence-v1',
          'profileRuleVersion': 'positive-understanding-evidence-v2', 'landscapeId': 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
          'landscapePath': candidate_path.relative_to(ROOT).as_posix(),
          'semanticKindLedgerPath': kinds_path.relative_to(ROOT).as_posix(),
          'reviewCriteriaPath': criteria_path.relative_to(ROOT).as_posix(),
          'reviewPath': record_path.relative_to(ROOT).as_posix(), 'reviewRunManifestPaths': [],
          'reviewedResourceTypes': ['goal-visualization'], 'requireApproved': False,
          'scope': {'label': '26 complete disjoint authored profiles with actual rasters; whole source/course/native scientific approvals pending', 'goalIds': ids}}
config_path = positive / 'P26.current-raster.author-candidate.inactive.config.json'
write(config_path, config)
for path in [set_path, config_path, candidate_path, kinds_path, criteria_path]:
    cap_copy(path)
(CAP / record_path.relative_to(ROOT)).parent.mkdir(parents=True, exist_ok=True)
for name in ['materializePositiveGoalEvidenceCandidates.ts', 'positiveGoalEvidenceReview.ts',
             'positiveGoalEvidenceProfileModel.ts', 'goalEvidenceProfileModel.ts']:
    cap_copy(ROOT / 'app/scripts' / name)
for path in ['contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
             'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',
             'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:
    cap_copy(ROOT / path)
for name in ['ajv', 'ajv-formats', 'fast-deep-equal', 'json-schema-traverse', 'fast-uri', 'require-from-string']:
    target = CAP / 'app/node_modules' / name
    if not target.exists():
        shutil.copytree(ROOT / 'app/node_modules' / name, target, symlinks=False)
assert not any(path.is_symlink() for path in CAP.rglob('*'))
command = [str(ROOT / 'app/node_modules/.bin/tsx'), 'scripts/materializePositiveGoalEvidenceCandidates.ts',
           '--config', config_path.relative_to(ROOT).as_posix(), '--candidates', set_path.relative_to(ROOT).as_posix(), '--write']
result = subprocess.run(command, cwd=CAP / 'app', capture_output=True, text=True, timeout=60)
log = OWN / 'checks/ordinary-current26-P-materializer.actual.stdout.txt'
write(log, (result.stdout + result.stderr).encode())
write(OWN / 'checks/ordinary-current26-P-materializer.actual-terminal.json', {
    'schemaVersion': 1, 'argv': command, 'cwd': CAP.relative_to(ROOT).as_posix() + '/app',
    'actualExitCode': result.returncode, 'normalOutput': bind(log), 'activeWrites': [],
    'onlyTechnicalCurrentFingerprintBinding': True, 'newScientificClosures': 0, 'strictGain': 0})
assert result.returncode == 0, result.stdout + result.stderr
write(record_path, (CAP / record_path.relative_to(ROOT)).read_bytes())
records = [json.loads(line) for line in record_path.read_text().splitlines() if line.strip()]
assert [record['goalId'] for record in records] == ids
for record in records:
    assert record['profile'] == specs_by[record['goalId']]['profile']
    assert record['reviewAuthority'] == 'ai_candidate' and record['status'] == 'needs_human_review'
    assert record['reviewRunIds'] == [] and record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
b_cases = b_cases_input['cases']
assert len(b_cases) == 38
case_by = {row['caseKey']: row for row in a_cases + b_cases}
assert len(case_by) == 52
materials = []
for gid in ids:
    original = whole[gid]
    supplements = [case_by[case['caseKey']] for case in original['wholeTwoCases']]
    for case, supplement in zip(original['wholeTwoCases'], supplements):
        assert supplement['originalWholeCase'] == case
        assert supplement['operativeGoalId'] == gid
        assert supplement['authoredWorkedFreshTransferResponse']['de'].strip()
        assert supplement['authoredWorkedFreshTransferResponse']['en'].strip()
    materials.append({'goalId': gid, 'candidateKey': original['candidateKey'], 'wholeOriginalGoalBeforeResources': original['wholeGoal'],
                      'wholeOriginalRawProfile': original['wholeProfile'], 'originalWholeBilingualCases': original['wholeTwoCases'],
                      'authoredWholeCaseAndWorkedTransferSupplements': supplements,
                      'newNormalProfileExactAuthoredBody': specs_by[gid]['profile']})
materials_path = OWN / 'input/current26-whole-original52-and52-worked-transfers.neutral.json'
write(materials_path, {'schemaVersion': 1, 'role': 'Neutral whole exact original26 goals/raw profiles/52 cases plus separately authored52 fresh-transfer answers and26 whole normal P-v2 bodies',
                     'entries': materials, 'authorMaterialCount': 52, 'actualEmpiricalResultsOrLearnerData': False,
                     'nativeSourceCourseApproval': False, 'humanApproval': False, 'activeWrites': [], 'strictGain': 0})
entry = {'schemaVersion': 1, 'role': 'Technical assembly of disjoint sealed whole7+whole19 author profile/material bodies, actual current26 rasters; no author or peer verdicts',
         'goalIds': ids, 'authorProfileCount': 26, 'source7AuthorGoalIds': sorted(a_ids), 'remaining19AuthorGoalIds': sorted(b_ids),
         'wholeOriginalCaseCount': 52, 'authoredWorkedFreshTransferCount': 52, 'disjointAuthorScopesExact': True,
         'whole26AuthoredProfilesValueExact': True, 'whole52OriginalCasesValueExact': True,
         'originalA7AuthorEntry': bind(a_entry_path), 'originalA7FirstSeal': bind(a_seal_path),
         'originalB19AuthorEntry': bind(b_entry_path), 'originalB19FirstSeal': bind(b_seal_path),
         'originalB19CandidateSet': bind(b_specs_path), 'originalB19CaseSupplements': bind(b_cases_path),
         'wholeCasesAndWorkedTransfersPath': materials_path.relative_to(ROOT).as_posix(),
         'actualCurrentP26CandidateSetPath': set_path.relative_to(ROOT).as_posix(),
         'actualCurrentP26ConfigPath': config_path.relative_to(ROOT).as_posix(),
         'actualCurrentP26RecordPath': record_path.relative_to(ROOT).as_posix(),
         'normalCurrentPTechnicalSchemaCheck': bind(OWN / 'checks/ordinary-current26-P-materializer.actual-terminal.json'),
         'all26Status': 'ai_candidate/needs_human_review/E1/G1; independent current scientific reviews pending',
         'wholeSource19Closure': False, 'nativeDPVClosure': False, 'atomicityAndMemoryReviewStatus': 'PENDING_25_REAL_SCIENTIFIC_DECISIONS_EACH',
         'netStrictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0, 'humanApproval': False,
         'humanTrial': False, 'activeWrites': [], 'authorOrPeerVerdictTextIncluded': False}
write(positive / 'neutral-current26-profile-and-worked-case-author-bindings.entry.json', entry)
print(json.dumps({'actualCurrentP26': True, 'rawOriginalCasesExact52': True, 'newWorkedTransfers52': True,
                  'authorScopesDisjoint7Plus19': True, 'normalPCurrentSchemas': 'PASS',
                  'sourceCourseNativeApprovals': False, 'activeWrites': 0, 'strictGain': 0}))
