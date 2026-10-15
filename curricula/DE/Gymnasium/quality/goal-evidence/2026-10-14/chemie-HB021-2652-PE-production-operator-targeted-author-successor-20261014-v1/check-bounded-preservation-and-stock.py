"""Apache-2.0: bounded preservation checks, stock validation and actual receipts."""
import hashlib
import importlib.util
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.dont_write_bytecode = True
REPO = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).resolve().parent
E = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence'
TARGET = '2652caef-b557-58b9-9b28-70db62625ce5'

def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

bound = read(OWN / 'INPUTS.exact-full-case-source-current-profile-and-author-basis-bindings.json')
for row in bound['bindings']:
    assert sha(REPO / row['path']) == row['sha256'], row['path']
source = REPO / bound['bindings'][0]['path']
assert sha(source) == '0f4a2a01684ab687859d3b3e3558528fa9765a62472efdcf767b0dc9013be93c'
bseal = E / '2026-10-14/chemie-HB19-neighbor021-original-operator-source-cell-independent-b-20261014-v1/SEAL.finite-HB021-independent-b-source-review.actual.json'
assert sha(bseal) == '3fbcdafc1424534ca1385a9f16115bfe4f06ed3459b89a0709c7c302a55acce6'
whole_before = read(source)
whole_after = read(OWN / 'candidate/whole74.exact-bilingual-cases.PE-production-addition.author-only.json')
before = read(OWN / 'inputs/2652.two-full-cases.before.exact.json')
after = read(OWN / 'candidate/2652.two-full-cases.PE-production-addition.author-only.json')
old_record = json.loads((OWN / 'inputs/2652.previous-whole-positive-record.byte-exact.jsonl').read_text())
new_record = json.loads((OWN / 'positive/2652.PE-production-addition.E0-G0.ai-candidate.needs-human-review.jsonl').read_text())
spec = read(OWN / 'positive/2652.PE-production-addition.author-candidate-spec.json')
assert new_record['profile'] == spec['goals'][0]['profile']
assert after[1] == before[1]
assert whole_after['cases'] == [after[0] if c['caseId'] == after[0]['caseId'] else c for c in whole_before['cases']]
assert {k:v for k,v in whole_after.items() if k != 'cases'} == {k:v for k,v in whole_before.items() if k != 'cases'}
allowed = {'taskDe', 'taskEn', 'modelAnswerDe', 'modelAnswerEn', 'rubric', 'maximumPoints', 'gradingBoundary'}
assert set(before[0]) == set(after[0])
assert {k:v for k,v in after[0].items() if k not in allowed} == {k:v for k,v in before[0].items() if k not in allowed}
assert after[0]['rubric'][:3] == before[0]['rubric']
assert len(after[0]['rubric']) == 4
assert sum(r['maximumPoints'] for r in after[0]['rubric']) == after[0]['maximumPoints'] == 8
for field in ['taskDe','taskEn','modelAnswerDe','modelAnswerEn']:
    assert after[0][field].startswith(before[0][field] + ' ')
assert old_record['profile']['expectations'][1:] == new_record['profile']['expectations'][1:]
for field in ['archetype','coverageExpectations','variationAxes']:
    assert old_record['profile'][field] == new_record['profile'][field]
assert old_record['profile']['applicationCaseBriefs'][1] == new_record['profile']['applicationCaseBriefs'][1]
for k in ['essentialUnderstandingDe','essentialUnderstandingEn','id']:
    assert old_record['profile']['expectations'][0][k] == new_record['profile']['expectations'][0][k]
brief = new_record['profile']['applicationCaseBriefs'][0]
for left,right in [('taskDemandDe','taskDe'),('taskDemandEn','taskEn'),('expectedPerformanceDe','modelAnswerDe'),('expectedPerformanceEn','modelAnswerEn')]:
    assert brief[left] == after[0][right]
assert new_record['evidenceLevel'] == 'E0' and new_record['maximumClaimScope'] == 'G0'
assert new_record['status'] == 'needs_human_review' and new_record['reviewAuthority'] == 'ai_candidate'
assert new_record['reviewRunIds'] == []
assert new_record['goalFingerprint'] == old_record['goalFingerprint']
assert new_record['reviewInputFingerprint'] == old_record['reviewInputFingerprint']
assert new_record['profileFingerprint'] != old_record['profileFingerprint']

goal = read(OWN / 'inputs/2652.whole-current-goal.exact.json')
asset = REPO / 'app/public' / goal['resourceLinks'][0]['url'].lstrip('/')
host_asset = REPO / 'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host' / asset.relative_to(REPO)
assert asset.read_bytes() == host_asset.read_bytes()
config = str((OWN / 'configs/2652.targeted-PE-production.E0-G0.inactive.config.json').relative_to(REPO))
command = ['./app/node_modules/.bin/tsx', 'app/scripts/positiveGoalEvidenceReview.ts', '--config=' + config, '--mode=check']
started = now()
run = subprocess.run(command, cwd=REPO, text=True, capture_output=True)
completed = now()
assert run.returncode == 0, run.stderr + run.stdout
write('CHECK.actual-bounded-stock-P-CLI-and-materialization.json', {
    'schemaVersion': 1, 'startedAt': started, 'completedAt': completed,
    'stockCli': {'command': command, 'cwd': str(REPO), 'returnCode': run.returncode, 'stdout': run.stdout, 'stderr': run.stderr},
    'materializerHistory': [
        {'location': 'existing physical T407 host', 'actualObservedReturnCode': 1, 'finding': 'Initial author reviewId used upper-case HB/PE; original config schema requires lowercase slug. Corrected only the new author reviewId; no stock patch or scientific change.'},
        {'location': 'existing physical T407 host', 'actualObservedReturnCode': 0, 'mode': '--write', 'stdout': 'Wrote ' + str((OWN / 'positive/2652.PE-production-addition.E0-G0.ai-candidate.needs-human-review.jsonl').relative_to(REPO)) + ': 1 current AI candidate profile(s).\n'},
        {'location': 'main repository', 'actualObservedReturnCode': 0, 'mode': 'verify existing owned record, no --write', 'stdout': 'Verified ' + str((OWN / 'positive/2652.PE-production-addition.E0-G0.ai-candidate.needs-human-review.jsonl').relative_to(REPO)) + ': 1 current AI candidate profile(s).\n'}
    ],
    'actualUnchangedResource': {'path': str(asset.relative_to(REPO)), 'sha256': sha(asset), 'hostBytesEqual': True},
    'bindings': {k: new_record[k] for k in ['goalFingerprint','reviewInputFingerprint','profileFingerprint','evidenceLevel','maximumClaimScope','reviewAuthority','status']},
    'stockValidityClaim': 'Structure, current resource/goal/profile fingerprints and original schema semantics only. E0/G0 is not scientific acceptance or executed positive evidence.',
    'globalCheckRun': False, 'activeMaterialOrRegistryWritten': False
})
guard_spec = importlib.util.spec_from_file_location('skillpilot_stock_schema_guard', REPO / 'scripts/validate_schemas.py')
guard = importlib.util.module_from_spec(guard_spec)
guard_spec.loader.exec_module(guard)
guard_errors = guard.curriculum_symlink_errors(str(REPO))
assert guard_errors == []
parsed = []
for p in sorted(OWN.rglob('*')):
    if p.is_file() and p.suffix in ['.json','.jsonl']:
        text = p.read_text()
        if p.suffix == '.json': json.loads(text)
        else:
            assert text.endswith('\n')
            for line in text.splitlines(): json.loads(line)
        parsed.append(str(p.relative_to(OWN)))
write('CHECK.exact-whole-preservation-current-bindings-schema-and-stock-guard.actual.json', {
    'schemaVersion': 1, 'checkedAt': now(), 'allOwnJsonAndJsonlParsed': parsed,
    'allOriginalInputHashesHeld': True, 'exactSourceCarrierSha256': sha(source), 'ownPriorSourceBFiniteSealSha256': sha(bseal),
    'wholeCaseCarrierCountBefore': len(whole_before['cases']), 'wholeCaseCarrierCountAfter': len(whole_after['cases']),
    'unchangedOtherWholeCases': 73, 'fullCase2Equal': True, 'originalCase1ThreeRubricsEqual': True,
    'originalCase1DataAndOtherWholeFieldsEqual': True, 'originalTaskAndModelPrefixesEqual': True,
    'originalProfileE2E3VariationCoverageTransferRulesAndCase2Equal': True,
    'newCase1MaximumPoints': 8, 'newExplicitProductionRubricMaximumPoints': 2,
    'newProfileFingerprint': new_record['profileFingerprint'],
    'unchangedGoalFingerprint': new_record['goalFingerprint'], 'unchangedInputFingerprint': new_record['reviewInputFingerprint'],
    'newCandidateOnly': True, 'existing402T407EvidenceNotSuperseded': True,
    'stockPConfigAndRecordSchemaAndCurrentBindingsPass': True,
    'stockCurriculumSymlinkErrors': guard_errors,
    'source021WholeDuty': 'HOLD for two independent targeted scientific checks and regular integration',
    'newIndependentVotes': 0, 'newExecutions': 0,
    'noD_AM_V_HumanReleaseClosure': True
})
print(json.dumps({'stockCliExit': run.returncode, 'stockCliOutput': run.stdout, 'guardErrors': guard_errors, 'ownParsedCount': len(parsed), 'newProfileFingerprint': new_record['profileFingerprint'], 'unchangedOtherCases':73}))
