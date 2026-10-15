# SPDX-License-Identifier: Apache-2.0
"""Retain the actual first failure and add two direct historical deck inputs."""
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
HOST = REPO / 'tmp/chemie-m7-resumed-20261015/energy-six-memory-minimal-host-v1'
E15 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
OLD = E15 + 'chemie-bw-lk-six-card-corrections-targeted-independent-20261015-v1/'


def read(path):
    return json.loads((REPO / path).read_text())


def bind(path):
    data = (REPO / path).read_bytes()
    return {'path': path, 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, data):
    target = OWN / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


assert not (OWN / 'FILES.finite-targeted-M6.seal.json').exists()
first = read(REL + '/checks/whole422.normal-memory.command.actual.json')
assert first['returncode'] == 1
science = read(REL + '/FIRST.actual-six-current-memory-judgments.json')
config_rel = REL + '/config/whole422-old-nine-plus-whole-BW.current-v3.config.json'
config = read(config_rel)
canonical = read(science['wholeCanonicalPath'])
dependencies = []
for goal in canonical['goals']:
    ext = goal.get('extendedData', {})
    for key in ('vocabularySource', 'vocabularySourceEn'):
        source = ext.get(key)
        if not isinstance(source, str):
            continue
        alias = 'app/public' + source if source.startswith('/data/') else source.lstrip('/')
        if (HOST / alias).is_file():
            continue
        physical = REPO / alias
        assert physical.is_file() and not physical.is_symlink()
        (HOST / alias).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(physical, HOST / alias)
        dependencies.append({'normalHostAlias': alias, 'physicalRepositorySource': bind(alias)})
assert len(dependencies) == 2
write('checks/TECHNICAL.first-host-two-missing-direct-historical-deck-inputs.json', {
    'firstActualFailureRetained': bind(REL + '/checks/whole422.normal-memory.command.actual.json'),
    'firstStdout': bind(REL + '/checks/whole422.normal-memory.stdout.txt'),
    'firstStderr': bind(REL + '/checks/whole422.normal-memory.stderr.txt'),
    'reason': 'The narrow alias map did not enumerate two unchanged direct vocabularySource/En paths. They are actual historical repository files, now exact copies in the private host only.',
    'addedInputs': dependencies, 'reviewRecordOrDeckContentChanges': 0, 'validatorChanges': 0})

start = datetime.datetime.now(datetime.timezone.utc).isoformat()
command = first['command']
run = subprocess.run(command, cwd=HOST, capture_output=True, text=True)
(OWN / 'checks/whole422.final.normal-memory.stdout.txt').write_text(run.stdout)
(OWN / 'checks/whole422.final.normal-memory.stderr.txt').write_text(run.stderr)
write('checks/whole422.final.normal-memory.command.actual.json', {'startedAtUTC': start, 'command': command, 'cwd': str(HOST.relative_to(REPO)), 'returncode': run.returncode})
assert run.returncode == 0, run.stderr + run.stdout[-6000:]
record_rel = REL + '/records/M422.original416-plus-six-current.review.jsonl'
old_lines = (REPO / (OLD + 'records/M422.original416-plus-six-new.review.jsonl')).read_text().splitlines(keepends=True)
new_lines = (REPO / record_rel).read_text().splitlines(keepends=True)
ids = {j['goalId'] for j in science['judgments']}
unchanged = [i for i, line in enumerate(old_lines) if json.loads(line)['goalId'] not in ids]
assert len(new_lines) == 422 and len(unchanged) == 416
assert all(old_lines[i] == new_lines[i] for i in unchanged)
cards = OLD + 'records/cards75.original69-plus-six-new.review.jsonl'
assert bind(cards)['sha256'] == 'sha256:96f5d189f15a2bf72d2cb3f3302967b3e5a66ee90ccd70346f9caf4a8ef52ed3'
write('checks/REBUILD.memory-six-minimal-host.physical-map.json', {
    'executionHost': str(HOST.relative_to(REPO)),
    'originalAliasMap': bind(E15 + 'chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1/checks/REBUILD.final-native560-alt-only.physical-map.json'),
    'additionalDirectDeckInputs': dependencies,
    'normalScript': bind('app/scripts/memoryCardReview.ts'), 'newRecords': bind(record_rel),
    'normalConfig': bind(config_rel), 'newHostPackage': {'type': 'module'},
    'copyAllOriginalMapAliasesExceptGoalDescriptionReview': True,
    'alsoCopyConfiguredVisibilityScopePathsAndCardReviewPathExactly': True,
    'privateDependenciesOnly': ['app/node_modules'],
    'physicalBytes': sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink())})
write('NEUTRAL.six-current-M-whole422-pass.json', {
    'schemaVersion': 1, 'role': 'Informed genuine Memory6 only; no new strict count',
    'actualCanonical': bind(science['wholeCanonicalPath']),
    'actualFirst': bind(REL + '/FIRST.actual-six-current-memory-judgments.json'),
    'normalConfig': bind(config_rel), 'actualWhole422NormalCheck': bind(REL + '/checks/whole422.final.normal-memory.command.actual.json'),
    'sixCurrentJudgments': 6, 'original416RowsExact': True, 'original75CardRowsExact': True,
    'originalNinePlusWholeBWVisibilityScopes': 10, 'all422MemoryCurrent': True,
    'actualFirstMissingInputFailurePreserved': True, 'newStrict': 0,
    'sourceCourseAtomicityOrVApproval': False, 'humanApproval': False, 'humanTrial': False})
for path in OWN.rglob('*'):
    assert not path.is_symlink(), path
    if path.is_file() and path.suffix == '.json': json.loads(path.read_text())
    if path.is_file() and path.suffix == '.jsonl':
        for line in path.read_text().splitlines(): json.loads(line)
spec = importlib.util.spec_from_file_location('normal_schema', REPO / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
assert not module.curriculum_symlink_errors(REPO)
files = [bind(p.relative_to(REPO).as_posix()) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('FILES.finite-targeted-M6.seal.json', {
    'schemaVersion': 1, 'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'files': files, 'payloadFileCount': len(files), 'newStrict': 0, 'humanApproval': False})
print(json.dumps({'pass': True, 'wholeMemory': '422/422 old nine plus wholeBW', 'genuineMDecisions': 6,
                  'unalteredMRecords': 416, 'seal': bind(REL + '/FILES.finite-targeted-M6.seal.json')}))
