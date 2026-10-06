#!/usr/bin/env python3
"""Freeze actual inputs and first-pass outputs without opening A packages."""
import hashlib
import json
import pathlib
from datetime import datetime, timezone

OUT = pathlib.Path(__file__).resolve().parent
REPO = OUT.parents[6]
AUTHOR = OUT.with_name('biologie-q1-seven-component-source-topic-corrections-author-v7')

def read(path):
    return json.loads(pathlib.Path(path).read_text())

def bind(path):
    path = pathlib.Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(REPO)) if path.is_relative_to(REPO) else str(path),
            'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

bindings = read(OUT / 'exact-input-bindings.actual.json')
native = read(OUT / 'native-source390-book383-to390-gui-superset-and-delta.actual.json')
inputs = {}

def add(path, expected=None):
    path = pathlib.Path(path)
    if not path.is_absolute():
        path = REPO / path
    assert 'independent-a' not in str(path), 'A package must not be read'
    b = bind(path)
    if expected:
        assert b['sha256'] == expected.removeprefix('sha256:'), str(path)
    inputs[b['path']] = b

for row in bindings['bindings']:
    add(row['path'], row['sha256'])
add(bindings['authorFreeze']['path'], bindings['authorFreeze']['sha256'])
add(AUTHOR / 'review-request.fresh-independent-b.json')
add(AUTHOR / 'probe-native-source-topic-author-v7.ts')
add(REPO / 'AGENTS.md')
add('/home/enpasos/.codex/attachments/b77af694-ca1d-42ad-a722-1a0b77a18fe8/goal-objective.md')
for row in native['originalInputSymlinks'] + native['nativeCode']:
    add(row['path'], row['sha256'])
for row in native['existingFullGUIViewChecks']:
    add(row['path'], row['sha256'])
for row in read(OUT / 'original-pdf-pages.actual.json')['sources']:
    add(row['officialPDF']['path'], row['officialPDF']['sha256'])
for row in read(OUT / 'factual-premise-primary-inputs.actual.json')['sources']:
    add(row['path'], row['sha256'])
extra = [
 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-native-source-preparation-author-v6/materialize-author-v6.py',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-source-operator-author-remediation-v5/actual-primary-curricular-and-factual-inputs.author.json',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-source-operator-author-remediation-v5/source-operator-contributions.author-matrix.json']
for path in extra:
    add(path)
config = read(REPO / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
add(config['goalVisualizationQaPath'])
for row in read(REPO / config['goalVisualizationQaPath'])['records']:
    if row['visualizationState'] == 'available':
        add(row['publicAssetPath'])
files = []
for path in sorted(OUT.rglob('*')):
    if path.is_file() and not path.is_symlink() and path.name != 'independent-b-v7.first-pass.final.freeze.json':
        b = bind(path)
        b['path'] = str(path.relative_to(OUT))
        files.append(b)
freeze = {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'sealed fresh independent B full v7 first pass with factual KEEP and source REVISE',
    'authorFreezeSHA256': '074398d806ac450ae1964eecdba05198fd370861fbd340064b751db486638cf4',
    'actualInputs': list(inputs.values()), 'ownOutputs': files,
    'inputCount': len(inputs), 'ownRegularOutputCount': len(files),
    'sourceOutcome': {'KEEP': 10, 'REVISE': 3, 'BLOCK': 0}, 'goalOutcome': {'KEEP': 7, 'REVISE': 0, 'BLOCK': 0},
    'finding': 'B-V7-MV-PARENT-HEADING-LOCATION', 'AReviewPackagesRead': False,
    'nativeD_P_A_M_VApproval': False, 'activeWrites': False, 'strictGain': 0,
    'humanApproval': False, 'humanTrial': False, 'publicationOrDeployment': False}
path = OUT / 'independent-b-v7.first-pass.final.freeze.json'
assert not path.exists(), 'Never overwrite sealed first pass'
path.write_text(json.dumps(freeze, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'freeze': bind(path), 'inputs': len(inputs), 'ownOutputs': len(files)}))
