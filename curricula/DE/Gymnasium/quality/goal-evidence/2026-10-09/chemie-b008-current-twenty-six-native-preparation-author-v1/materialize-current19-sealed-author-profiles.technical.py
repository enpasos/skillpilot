# SPDX-License-Identifier: Apache-2.0
"""Materialize the sealed nineteen author bodies while the separate seven remain HOLD and run the ordinary P materializer in a thin capsule."""
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
assert len(sys.argv) == 1, 'Usage: python materialize-current19-sealed-author-profiles.technical.py'


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
b_dir = OWN.parent / 'chemie-b008-current-nineteen-whole-positive-author-v1'
b_specs_path = b_dir / 'nineteen.normal-positive-candidate-set.author-candidate.json'
b_cases_path = b_dir / 'thirty-eight-whole-case-worked-transfer.supplement.author-candidate.json'
b_entry_path = b_dir / 'neutral-nineteen-whole-positive.author.entry.json'
b_seal_path = b_dir / 'nineteen-whole-positive-author.first.freeze.json'
b_specs, b_cases_input, b_entry, b_seal = [read(path) for path in [b_specs_path, b_cases_path, b_entry_path, b_seal_path]]
assert bind(b_entry_path)['sha256'] == 'sha256:36bdaff7d6e3b60acd14e9e42613694a663ce0549908f10a2c2ba2735fbadd04'
assert bind(b_seal_path)['sha256'] == 'sha256:759601b5e3be28a9ad0cb117bee1dc6e38bfecc55e705d968eed63c8b57ab30c'
for binding in declared_bindings(b_seal):
    verify(binding)
assert b_specs['schemaVersion'] == 1 and b_specs['authoringContract'] == 'positive-understanding-evidence-candidates-v1'
b_profiles = b_specs['goals']
assert len(b_profiles) == 19
b_ids = {row['goalId'] for row in b_profiles}
a_ids = set(b_entry['excludedA7GoalIds'])
assert len(a_ids) == 7 and a_ids.isdisjoint(b_ids) and a_ids | b_ids == set(ids)
ids = [gid for gid in ids if gid in b_ids]
specs_by = {row['goalId']: row for row in b_profiles}
assert len(specs_by) == 19
for row in b_profiles:
    assert row.get('evidenceLevel', 'E1') == 'E1' and row.get('maximumClaimScope', 'G1') == 'G1'
review_id = 'chemie-b008-current-nineteen-native-author-20261009-v1'
candidate_set = {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
                 'reviewId': review_id, 'reviewedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                 'reviewer': 'Codex technical assembly of whole19 authored profiles; separate7 held; no independent scientific approval',
                 'goals': [copy.deepcopy(specs_by[gid]) for gid in ids]}
for spec in candidate_set['goals']:
    spec['reason'] += ' Exact current selected raster/native binding only; Source19/course/placement/atomicity/memory/current contexts still need independent approval.'
    spec['dissent'] = list(spec.get('dissent', [])) + ['Source19 whole, scoped source decision adoption,35 source-view findings and8 protected current contexts remain held.']
    assert len(spec['profile']['applicationCaseBriefs']) == 2
    assert spec['profile']['coverageExpectations']['minimumIndependentDemonstrations'] >= 2
positive = OWN / 'positive'
set_path = positive / 'P19.sealed-nineteen-only.whole-author-candidate-set.json'
write(set_path, candidate_set)
candidate_path = OWN / 'candidate/canonical504-current26-resource-links.inactive.json'
kinds_path = OWN / 'candidate/semantic-kinds.current504.technical-review-input.json'
criteria_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
record_path = positive / 'P19.current-raster.author-candidate.review.jsonl'
config = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
          'schemaVersion': 2, 'reviewId': review_id, 'goalFingerprintRuleVersion': 'goal-evidence-v1',
          'profileRuleVersion': 'positive-understanding-evidence-v2', 'landscapeId': 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
          'landscapePath': candidate_path.relative_to(ROOT).as_posix(),
          'semanticKindLedgerPath': kinds_path.relative_to(ROOT).as_posix(),
          'reviewCriteriaPath': criteria_path.relative_to(ROOT).as_posix(),
          'reviewPath': record_path.relative_to(ROOT).as_posix(), 'reviewRunManifestPaths': [],
          'reviewedResourceTypes': ['goal-visualization'], 'requireApproved': False,
          'scope': {'label': '19 complete sealed authored profiles with actual rasters; whole source/course/native scientific approvals pending', 'goalIds': ids}}
config_path = positive / 'P19.current-raster.author-candidate.inactive.config.json'
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
log = OWN / 'checks/ordinary-current19-P-materializer.actual.stdout.txt'
write(log, (result.stdout + result.stderr).encode())
write(OWN / 'checks/ordinary-current19-P-materializer.actual-terminal.json', {
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
# Resolve each actual immutable original JSON pointer and verify its independent value digest.
def resolve_json_pointer(value, pointer):
    assert pointer.startswith('/')
    for token in pointer[1:].split('/'):
        token = token.replace('~1', '/').replace('~0', '~')
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value
b_cases = b_cases_input['entries']
assert len(b_cases) == 38
case_by = {row['caseKey']: row for row in b_cases}
assert len(case_by) == 38
materials = []
for gid in ids:
    original = whole[gid]
    supplements = []
    for case in original['wholeTwoCases']:
        supplement = case_by[case['caseKey']]
        assert supplement['goalId'] == gid
        original_pointer = supplement['wholeOriginalCase']
        verify(original_pointer['input'])
        resolved_case = resolve_json_pointer(read(ROOT / original_pointer['input']['path']), original_pointer['jsonPointer'])
        case_digest = hashlib.sha256(json.dumps(resolved_case, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        assert case_digest == original_pointer['valueSha256'].removeprefix('sha256:')
        assert resolved_case == case and supplement['historicalCaseUnchanged'] is True
        assert supplement['authoredWorkedFreshTransferResponse']['de'].strip()
        assert supplement['authoredWorkedFreshTransferResponse']['en'].strip()
        supplements.append(copy.deepcopy(supplement))
    materials.append({'goalId': gid, 'candidateKey': original['candidateKey'], 'wholeOriginalGoalBeforeResources': original['wholeGoal'],
                      'wholeOriginalRawProfile': original['wholeProfile'], 'originalWholeBilingualCases': original['wholeTwoCases'],
                      'authoredWholeCaseAndWorkedTransferSupplements': supplements,
                      'newNormalProfileExactAuthoredBody': specs_by[gid]['profile']})
materials_path = OWN / 'input/current19-whole-original38-and38-worked-transfers.neutral.json'
write(materials_path, {'schemaVersion': 1, 'role': 'Neutral whole exact original19 goals/raw profiles/38 cases plus separately authored38 fresh-transfer answers and19 whole normal P-v2 bodies',
                     'entries': materials, 'authorMaterialCount': 38, 'actualEmpiricalResultsOrLearnerData': False,
                     'nativeSourceCourseApproval': False, 'humanApproval': False, 'activeWrites': [], 'strictGain': 0})
entry = {'schemaVersion': 1, 'role': 'Technical assembly of sealed whole19 author profile/material bodies, actual current26 rasters; no author or peer verdicts',
         'goalIds': ids, 'authorProfileCount': 19, 'source7AuthorGoalIds': sorted(a_ids), 'remaining19AuthorGoalIds': sorted(b_ids),
         'wholeOriginalCaseCount': 38, 'authoredWorkedFreshTransferCount': 38, 'disjoint19Of26ScopeExact': True,
         'whole19AuthoredProfilesValueExact': True, 'whole38OriginalCasesValueExact': True,
         'separateA7NotMaterializedOrApproved': True,
         'originalB19AuthorEntry': bind(b_entry_path), 'originalB19FirstSeal': bind(b_seal_path),
         'originalB19CandidateSet': bind(b_specs_path), 'originalB19CaseSupplements': bind(b_cases_path),
         'wholeCasesAndWorkedTransfersPath': materials_path.relative_to(ROOT).as_posix(),
         'actualCurrentP19CandidateSetPath': set_path.relative_to(ROOT).as_posix(),
         'actualCurrentP19ConfigPath': config_path.relative_to(ROOT).as_posix(),
         'actualCurrentP19RecordPath': record_path.relative_to(ROOT).as_posix(),
         'normalCurrentPTechnicalSchemaCheck': bind(OWN / 'checks/ordinary-current19-P-materializer.actual-terminal.json'),
         'all19Status': 'ai_candidate/needs_human_review/E1/G1; independent current scientific reviews pending',
         'wholeSource19Closure': False, 'nativeDPVClosure': False, 'atomicityAndMemoryReviewStatus': 'PENDING_25_REAL_SCIENTIFIC_DECISIONS_EACH',
         'netStrictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0, 'humanApproval': False,
         'humanTrial': False, 'activeWrites': [], 'authorOrPeerVerdictTextIncluded': False}
write(positive / 'neutral-current19-profile-and-worked-case-author-bindings.entry.json', entry)
print(json.dumps({'actualCurrentP19': True, 'rawOriginalCasesExact38': True, 'newWorkedTransfers38': True,
                  'separate7Held19Only': True, 'normalPCurrentSchemas': 'PASS',
                  'sourceCourseNativeApprovals': False, 'activeWrites': 0, 'strictGain': 0}))
