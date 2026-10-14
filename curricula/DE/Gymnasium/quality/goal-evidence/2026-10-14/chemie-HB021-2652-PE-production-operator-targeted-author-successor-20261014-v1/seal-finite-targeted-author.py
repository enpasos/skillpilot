"""Apache-2.0: verify finite author artifacts and seal their actual bytes."""
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
SEAL_NAME = 'SEAL.finite-2652-PE-production-operator-author-only.actual.json'
assert not (OWN / SEAL_NAME).exists(), 'Do not modify an already sealed author packet'

def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text())

def write(name,value):
    (OWN/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

neutral = read(OWN / 'NEUTRAL.exact-2652-PE-production-operator-author-inputs.json')
for row in neutral['wholeOriginalInputs'] + neutral['exactWholeReviewableOutputs']:
    path = REPO / row['path']
    assert path.stat().st_size == row['bytes']
    assert sha(path) == row['sha256'], row['path']
old = json.loads((OWN/'inputs/2652.previous-whole-positive-record.byte-exact.jsonl').read_text())
candidate = json.loads((OWN/'positive/2652.PE-production-addition.E0-G0.ai-candidate.needs-human-review.jsonl').read_text())
assert candidate['profile'] == read(OWN/'positive/2652.PE-production-addition.author-candidate-spec.json')['goals'][0]['profile']
assert candidate['goalFingerprint'] == old['goalFingerprint']
assert candidate['reviewInputFingerprint'] == old['reviewInputFingerprint']
assert candidate['profileFingerprint'] != old['profileFingerprint']
assert (candidate['evidenceLevel'],candidate['maximumClaimScope'],candidate['reviewAuthority'],candidate['status']) == ('E0','G0','ai_candidate','needs_human_review')
assert read(OWN/'CHECK.actual-bounded-stock-P-CLI-and-materialization.json')['stockCli']['returnCode'] == 0
assert read(OWN/'CHECK.exact-whole-preservation-current-bindings-schema-and-stock-guard.actual.json')['stockCurriculumSymlinkErrors'] == []
guard_spec = importlib.util.spec_from_file_location('stock_schema_guard',REPO/'scripts/validate_schemas.py')
guard = importlib.util.module_from_spec(guard_spec)
guard_spec.loader.exec_module(guard)
guard_errors = guard.curriculum_symlink_errors(str(REPO))
assert guard_errors == []
start = read(OWN/'STARTED.actual.json')
completed = now()
write('PROVENANCE.actual-targeted-author-and-unexecuted-P-candidate.json', {
    'schemaVersion':1, 'startedAt':start.get('startedAt'), 'completedAt':completed,
    'agentId':'/root/chemie_native8_fresh_independent_b','role':'targeted scientific author successor based on same-agent sealed HB021 Source-B finding',
    'provider':'OpenAI','model':'GPT-6 (Codex agent; exact serving snapshot not exposed)',
    'modelVersion':None,'samplingControls':'not exposed; no values claimed',
    'independence':'No new independent vote. Prior same-agent Source-B finding is author basis, not an approval oracle for the changed case.',
    'candidateRecord':str((OWN/'positive/2652.PE-production-addition.E0-G0.ai-candidate.needs-human-review.jsonl').relative_to(REPO)),
    'recordSchema':candidate['$schema'],'candidateBindings':neutral['candidateBindings'],
    'priorFullPositiveEvidencePreserved':True,'newIndependentVotes':0,'newLearnerOrLaboratoryExecutions':0,
    'operativeActivation':False,'source021WholeDuty':'HOLD until two independent targeted checks and regular integration',
    'D_AM_V_HumanReleaseClosure':False
})
paths = sorted(p for p in OWN.rglob('*') if p.is_file())
assert all(not p.is_symlink() for p in OWN.rglob('*'))
assert not any(p.suffix in ['.pyc'] or '__pycache__' in p.parts for p in paths)
relative_paths = '\n'.join(str(p.relative_to(REPO)) for p in paths)+'\n'
ignore = subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=REPO,input=relative_paths,text=True,capture_output=True)
assert ignore.returncode == 1 and not ignore.stdout and not ignore.stderr
parsed = []
for p in paths:
    if p.suffix == '.json': read(p);parsed.append(str(p.relative_to(OWN)))
    elif p.suffix == '.jsonl':
        assert p.read_bytes().endswith(b'\n')
        for line in p.read_text().splitlines():json.loads(line)
        parsed.append(str(p.relative_to(OWN)))
write('CHECK.final-finite-parse-hashes-stock-guard-and-committability.actual.json', {
    'schemaVersion':1,'checkedAt':now(),'allOwnJsonAndJsonlParsed':parsed,
    'exactOriginalInputBindingsHeld':len(neutral['wholeOriginalInputs']),
    'exactWholeOutputBindingsHeld':len(neutral['exactWholeReviewableOutputs']),
    'actualStockCurriculumSymlinkErrors':guard_errors,
    'allOwnFilesNonSymlinkAndCommittable':True,'gitCheckIgnoreReturnCode':ignore.returncode,
    'stockBoundedPCheckReturnCode':0,'ownCandidateOnlyE0G0':True,
    'existing402T407FullPositiveEvidenceUnchanged':True,'source021WholeDuty':'HOLD',
    'noActiveRegistryEngineGitHumanWrites':True
})
paths = sorted(p for p in OWN.rglob('*') if p.is_file() and p.name != SEAL_NAME)
for p in paths:
    if p.suffix == '.json':read(p)
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():json.loads(line)
files = [{'path':str(p.relative_to(REPO)),'sha256':sha(p),'bytes':p.stat().st_size} for p in paths]
write(SEAL_NAME, {
    'schemaVersion':1,'sealKind':'finite inactive targeted author packet; not scientific approval',
    'startedAt':start.get('startedAt'),'completedAt':completed,'sealedAt':now(),
    'selfExcluded':True,'ownedRoot':str(OWN.relative_to(REPO)),
    'neutralPath':str((OWN/'NEUTRAL.exact-2652-PE-production-operator-author-inputs.json').relative_to(REPO)),
    'neutralSha256':sha(OWN/'NEUTRAL.exact-2652-PE-production-operator-author-inputs.json'),
    'files':files,'fileCount':len(files),'totalBytes':sum(f['bytes'] for f in files),
    'stockBoundedPCheck':'PASS structure/schema/current fingerprints; unexecuted E0/G0 candidate',
    'actualStockCurriculumSymlinkErrors':guard_errors,'source021WholeDuty':'HOLD',
    'newIndependentVotes':0,'newExecutions':0,'operativeActivation':False,
    'D_AM_V_HumanReleaseClosure':False
})
seal = read(OWN/SEAL_NAME)
for row in seal['files']:assert sha(REPO/row['path']) == row['sha256']
print(json.dumps({'sealPath':str((OWN/SEAL_NAME).relative_to(REPO)),'sealSha256':sha(OWN/SEAL_NAME),'neutralSha256':seal['neutralSha256'],'files':seal['fileCount'],'bytes':seal['totalBytes'],'startedAt':seal['startedAt'],'completedAt':seal['completedAt'],'sealedAt':seal['sealedAt'],'profileFingerprint':candidate['profileFingerprint'],'stockGuardErrors':guard_errors}))
