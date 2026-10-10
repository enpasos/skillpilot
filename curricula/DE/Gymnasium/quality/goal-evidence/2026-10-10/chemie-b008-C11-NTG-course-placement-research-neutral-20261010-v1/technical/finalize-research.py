from pathlib import Path
import datetime
import hashlib
import json
import os
import subprocess
import sys

ROOT = Path.cwd()
OUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-C11-NTG-course-placement-research-neutral-20261010-v1')
sys.path.insert(0, str(ROOT))
from scripts.validate_schemas import validate_file


def bind(path):
    path = Path(path)
    assert not path.is_absolute() and '..' not in path.parts
    data = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def read(path):
    return json.loads(Path(path).read_text())


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists()
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(path)


command = ['app/node_modules/.bin/tsx', str(OUT / 'technical/check-current-source-facets.mts')]
terminal_path = OUT / 'checks/normal-current-C11-source-facets.actual.terminal.json'
if terminal_path.exists():
    previous = read(terminal_path)
    assert previous['command'] == command and previous['exitCode'] == 0
    terminal = bind(terminal_path)
else:
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(command, text=True, capture_output=True)
    assert result.returncode == 0, result.stdout + result.stderr
    actual = json.loads(result.stdout)
    terminal = put('checks/normal-current-C11-source-facets.actual.terminal.json', {
        'schemaVersion': 1, 'command': command, 'startedAt': started,
        'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'exitCode': result.returncode, 'stdoutActual': actual, 'stderrActual': result.stderr,
        'technicalFacetCheckOnlyNotCourseApproval': True,
    })
frame = read(OUT / 'inputs/current-C11-whole-operator-occurrences-and-programme.research-frame.json')
for binding in frame['inputBindings']:
    assert bind(binding['path']) == binding, binding['path']
runtime = read('docs/landscape-runtime.schema.json')
checked = []
for path in sorted(OUT.rglob('*.json')):
    assert validate_file(str(path), runtime), str(path)
    checked.append(str(path))
assert not any(path.is_symlink() for path in OUT.rglob('*'))
git_files = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', str(OUT)], capture_output=True, check=True)
committable = {os.fsdecode(path) for path in git_files.stdout.split(b'\0') if path}
own = [path for path in sorted(OUT.rglob('*')) if path.is_file()]
assert all(str(path) in committable for path in own)
portability = put('checks/normal-targeted-schema-input-binding-and-portability.actual.json', {
    'schemaVersion': 1, 'normalValidateFilePassed': checked,
    'boundCurrentInputsReverified': frame['inputBindings'],
    'ownFilesCommittable': True, 'ownSymlinks': 0, 'normalFacetExitCode': 0,
    'checkerChanges': False, 'schemaExceptions': False,
})
entry = put('research.final.entry.json', {
    'schemaVersion': 1, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Neutral targeted primary-course-placement research; known previous Source24-A, not blind third review or operative author',
    'goalId': 'e5a5dcd8-053c-55fd-b5c7-bba93779da53',
    'actualOfficialLiveObservations': bind(OUT / 'sources/actual-official-live-programme-and-course-observations.json'),
    'actualWholeSourceAndTargetFrame': bind(OUT / 'inputs/current-C11-whole-operator-occurrences-and-programme.research-frame.json'),
    'researchFindings': bind(OUT / 'RESEARCH.current-C11-NTG-course-placement.findings.json'),
    'normalTechnicalTerminal': terminal, 'targetedPortability': portability,
    'confirmedProgramme': 'Regular Bayern NTG year11 course-neutral Einfuehrungsphase',
    'commonUnrestrictedBYGKAndLKPlacementApproved': False,
    'currentHoldPreserved': True, 'sourceUnion378IsNotDenominator398': True,
    'normalBYFallbackExists': False, 'sourceOriginalUnresolved496Retained': True,
    'old19OmissionsRetained': True, 'PRemainsUnselected': True,
    'operativeWrites': False, 'strictNetGain': 0, 'humanApproval': False,
    'separateAuthorCandidateAndGenuineDualCourseReviewRequired': True,
})
freeze = put('research.final.freeze.json', {
    'schemaVersion': 1, 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'entry': entry,
    'ownWholeFiles': [bind(path) for path in sorted(OUT.rglob('*')) if path.is_file()],
    'sourceMetadataAndOriginalBindingsUnchanged': frame['inputBindings'],
    'normalTargetedChecksPassed': True, 'courseHold': True,
    'operativeWrites': False, 'strictNetGain': 0, 'humanApproval': False,
})
assert validate_file(entry['path'], runtime)
assert validate_file(freeze['path'], runtime)
print('PASS targeted C11 primary research and normal facet/schema/portability; no operative write or course promotion')
print('ENTRY', entry)
print('FREEZE', freeze)
