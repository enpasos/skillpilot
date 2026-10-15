# SPDX-License-Identifier: Apache-2.0
"""Targeted post-science M3 binding; the other 419 rows and 75 cards stay exact."""
import ast
import datetime
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
REPO = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(REPO).as_posix()
E15 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
PREV = E15 + 'chemie-energy-six-current422-memory-targeted-informed-root-20261015-v1/'
HOST = REPO / 'tmp/chemie-m7-resumed-20261015/energy-three-final-wording-memory-minimal-host-v1'


def read(path):
    return json.loads((REPO / path).read_text())


def bind(path):
    data = (REPO / path).read_bytes()
    return {'path': path, 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, data):
    target = OWN / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


assert not HOST.exists() and not (OWN / 'FILES.finite-final-wording-M3.seal.json').exists()
science = read(REL + '/FIRST.actual-three-final-wording-M-judgments.json')
for row in read(REL + '/FILES.FIRST-three-final-wording-M-science.seal.json')['files']:
    assert bind(row['path']) == row
for row in read(PREV + 'FILES.finite-targeted-M6.seal.json')['files']:
    assert bind(row['path']) == row
mapping = read(PREV + 'checks/REBUILD.memory-six-minimal-host.physical-map.json')
old_host = REPO / mapping['executionHost']
physical_bytes = sum(p.stat().st_size for p in old_host.rglob('*') if p.is_file() and not p.is_symlink())
assert physical_bytes < 20 * 1024 * 1024
shutil.copytree(old_host, HOST, symlinks=True)
config = read(PREV + 'config/whole422-old-nine-plus-whole-BW.current-v3.config.json')
assert bind(science['wholeCanonical']['path']) == science['wholeCanonical']
shutil.copyfile(REPO / science['wholeCanonical']['path'], HOST / config['landscapePath'])
original = (REPO / science['oldM6Source']['path']).read_text().splitlines(keepends=True)
judgments = {row['goalId']: row for row in science['judgments']}
records = []
cas = []
for line in original:
    old = json.loads(line)
    current = judgments.get(old['goalId'])
    if current is None:
        records.append(line)
        continue
    new = {**old, 'fingerprint': 'pending-normal-binding-after-actual-science',
           'reviewedAt': science['completedAtUTC'], 'reviewer': 'Codex root informed targeted final wording Memory science / 20261015',
           'status': current['status'], 'memoryUseful': current['memoryUseful'], 'reason': current['reason'],
           'firstScienceSeal': bind(REL + '/FILES.FIRST-three-final-wording-M-science.seal.json')}
    records.append(json.dumps(new, ensure_ascii=False, separators=(',', ':')) + '\n')
    cas.append({'goalId': old['goalId'], 'wholeBefore': old, 'wholeAfterBeforeFingerprint': new})
assert len(cas) == 3 and len(records) == 422
write('CAS.exact-three-final-wording-M-decisions.json', cas)
record_rel = REL + '/records/M422.original419-plus-three-final-wording.review.jsonl'
(OWN / 'records').mkdir()
(REPO / record_rel).write_text(''.join(records))
(HOST / record_rel).parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(REPO / record_rel, HOST / record_rel)
tree = ast.parse((REPO / (PREV + 'materialize_and_check.py')).read_text())
binder = next(ast.literal_eval(node.value) for node in tree.body if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'js' for t in node.targets))
run = subprocess.run(['node', '--input-type=module', '-', str(HOST / config['landscapePath']), str(HOST / record_rel)], input=binder, capture_output=True, text=True)
assert run.returncode == 0, run.stderr
shutil.copyfile(HOST / record_rel, REPO / record_rel)
config['reviewPath'] = record_rel
config_rel = REL + '/config/M422.whole-ten-scopes.final-wording.config.json'
write('config/M422.whole-ten-scopes.final-wording.config.json', config)
(HOST / config_rel).parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(REPO / config_rel, HOST / config_rel)
command = ['node', str(REPO / 'app/node_modules/tsx/dist/cli.mjs'), 'app/scripts/memoryCardReview.ts', '--config=' + config_rel, '--mode=check']
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
result = subprocess.run(command, cwd=HOST, capture_output=True, text=True)
(OWN / 'checks').mkdir(exist_ok=True)
(OWN / 'checks/M422.actual.stdout.txt').write_text(result.stdout)
(OWN / 'checks/M422.actual.stderr.txt').write_text(result.stderr)
write('checks/M422.actual.command.json', {'startedAtUTC': started, 'command': command, 'cwd': str(HOST.relative_to(REPO)), 'returncode': result.returncode})
assert result.returncode == 0, result.stderr + result.stdout[-5000:]
after = (REPO / record_rel).read_text().splitlines(keepends=True)
assert sum(before == current for before, current in zip(original, after)) == 419
assert bind(config['cardReviewPath'])['sha256'] == 'sha256:96f5d189f15a2bf72d2cb3f3302967b3e5a66ee90ccd70346f9caf4a8ef52ed3'
write('checks/REBUILD.final-M3.minimal-host.json', {'originalMinimalHostMap': bind(PREV + 'checks/REBUILD.memory-six-minimal-host.physical-map.json'), 'oldHostUnchanged': True, 'executionHost': str(HOST.relative_to(REPO)), 'normalCanonicalAlias': config['landscapePath'], 'physicalCurrentCanonical': science['wholeCanonical'], 'newConfig': bind(config_rel), 'newRecords': bind(record_rel), 'stockFingerprintSource': bind(PREV + 'materialize_and_check.py'), 'normalStockChecker': bind('app/scripts/memoryCardReview.ts'), 'physicalBytes': sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink())})
write('NEUTRAL.final-M3-whole422-ten-scopes-pass.json', {'schemaVersion': 1, 'role': 'Actual scientific recheck of three final text changes, not automatic hash refresh', 'canonical': science['wholeCanonical'], 'firstScienceSeal': bind(REL + '/FILES.FIRST-three-final-wording-M-science.seal.json'), 'actualNormalCheck': bind(REL + '/checks/M422.actual.command.json'), 'normalConfig': bind(config_rel), 'wholeMemory': '422/422 current, old nine plus wholeBW visibility scopes', 'newMJudgments': 3, 'other419MRowsExact': True, 'all75CardRowsExact': True, 'newStrict': 0, 'sourceCourseAtomicityOrVApproval': False, 'humanApproval': False, 'humanTrial': False})
for path in OWN.rglob('*'):
    assert not path.is_symlink(), path
    if path.is_file() and path.suffix == '.json': json.loads(path.read_text())
    if path.is_file() and path.suffix == '.jsonl':
        for line in path.read_text().splitlines(): json.loads(line)
    if path.is_file() and path.suffix == '.py': ast.parse(path.read_text())
spec = importlib.util.spec_from_file_location('normal_schema', REPO / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
assert not module.curriculum_symlink_errors(REPO)
files = [bind(p.relative_to(REPO).as_posix()) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('FILES.finite-final-wording-M3.seal.json', {'schemaVersion': 1, 'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'files': files, 'newStrict': 0, 'humanApproval': False})
print(json.dumps({'pass': True, 'M': '422/422;10scopes', 'genuineRechecks': 3, 'otherMRowsExact': 419, 'seal': bind(REL + '/FILES.finite-final-wording-M3.seal.json')}))
