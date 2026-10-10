# SPDX-License-Identifier: Apache-2.0
"""Correct only author finding A-01; preserve the sealed predecessor."""
from pathlib import Path
import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
import jsonschema

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[8]
PACKAGE = Path(__file__).resolve().parents[1]
REL = PACKAGE.relative_to(ROOT).as_posix()
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-phase-local-inquiry-model-society-terminal-author-20261010-v1'
REVIEW = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-five-terminal-assessments-independent-a-20261010-v1/FIRST.independent-full-assessment-science-and-route-findings.actual.json'
GOAL_ID = '7bfe515c-e59f-521c-9781-b75e33caf0ec'
BEFORE_SENTENCE = 'Prüfen Sie selbst eine Hypothese über eine Veränderung von Kontakt, Konzentration bzw. Substratangebot mit eigener Modellrechnung oder Simulation.'
AFTER_SENTENCE = 'Prüfen Sie für **beide Fälle A und B jeweils eine eigene Hypothese** über eine Veränderung von Kontakt, Konzentration bzw. Substratangebot mit eigener Modellrechnung oder Simulation.'

def read(p):
    return json.loads(p.read_text())

def bind(p):
    b = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, data):
    p = PACKAGE / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

old_freeze = read(OLD / 'author-successor.final.freeze.json')
for b in old_freeze['files']:
    assert bind(ROOT / b['path']) == b
old_whole = OLD / 'candidate/whole517.inactive.terminal-assessment-author.json'
assert bind(old_whole)['sha256'] == '6568038620a0675425f334a7104d189484ff3e76468720611c9a288d02414485'
original = read(old_whole)
candidate = copy.deepcopy(original)
before = next(g for g in original['goals'] if g['id'] == GOAL_ID)
after = next(g for g in candidate['goals'] if g['id'] == GOAL_ID)
old_task = ROOT / before['examData']['sourceArtifactPath']
source = old_task.read_text()
assert source.split('\n', 1)[1].strip() == before['examData']['taskContent']
assert source.count(BEFORE_SENTENCE) == 1
new_source = source.replace(BEFORE_SENTENCE, AFTER_SENTENCE)
new_task = PACKAGE / 'author/assessments/oberstufe-modellportfolio.task.de.md'
new_task.parent.mkdir(parents=True, exist_ok=True)
new_task.write_text(new_source)
after['examData']['taskContent'] = new_source.split('\n', 1)[1].strip()
after['examData']['sourceArtifactPath'] = new_task.relative_to(ROOT).as_posix()
assert after['examData']['taskContent'] == before['examData']['taskContent'].replace(BEFORE_SENTENCE, AFTER_SENTENCE)

finding = next(f for f in read(REVIEW)['scientificFindings'] if f['findingId'] == 'A-01')
assert finding['goalId'] == GOAL_ID and finding['taskLiteral'] == BEFORE_SENTENCE
assert len(original['goals']) == len(candidate['goals']) == 517
unchanged = []
for old_g, new_g in zip(original['goals'], candidate['goals']):
    assert old_g['id'] == new_g['id']
    if old_g['id'] != GOAL_ID:
        assert old_g == new_g
        unchanged.append(old_g['id'])
assert len(unchanged) == 516
expected = copy.deepcopy(before)
expected['examData']['taskContent'] = after['examData']['taskContent']
expected['examData']['sourceArtifactPath'] = after['examData']['sourceArtifactPath']
assert expected == after
assert before['examData']['solutionContent'] == after['examData']['solutionContent']
assert before['examData']['scoring'] == after['examData']['scoring']
assert after['examData']['reviewStatus'] == 'needs_review'

whole_path = PACKAGE / 'candidate/whole517.inactive.modelportfolio-A01-author-successor.json'
write(whole_path.relative_to(PACKAGE), candidate)
write('author/modelportfolio.whole-before-after-and-exact-diff.json', {
    'schemaVersion': 1, 'role': 'Original AUTHOR targeted correction, not independent approval',
    'findingId': 'A-01', 'findingInput': bind(REVIEW), 'findingLiteral': finding,
    'goalId': GOAL_ID, 'wholeBefore': before, 'wholeAfter': after,
    'changedJsonPointers': ['/examData/taskContent', '/examData/sourceArtifactPath'],
    'exactTaskSentenceBefore': BEFORE_SENTENCE, 'exactTaskSentenceAfter': AFTER_SENTENCE,
    'sourceArtifactPathReason': 'Successor task source must contain the same corrected complete task body; sealed predecessor task remains unchanged.',
    'other516WholeGoalsExact': True, 'goalOrderAndIdsUnchanged': True,
    'allOtherFieldsOfAffectedGoalExact': True, 'solutionAndRubricExact': True,
    'coveredIdsRequiresTagsSourceScopesAndImagesExact': True,
    'authorResponse': 'One hypothesis/model check is explicitly required for each of receptor case A and enzyme case B; no rubric requirement weakened.',
    'independentFindingResolution': 'pending independent verification; no approval claimed',
    'reviewStatus': 'needs_review', 'C11PSelected': False, 'strictGain': 0,
    'currentStrictDenominator': None, 'activeWrites': [],
})
inputs = [
    OLD / 'author-successor.final.entry.json', OLD / 'author-successor.final.freeze.json', old_whole,
    old_task, OLD / 'author/assessments/oberstufe-modellportfolio.solution.de.md',
    REVIEW, ROOT / 'docs/landscape-runtime.schema.json', ROOT / 'scripts/validate_schemas.py',
]
write('inputs/portable-exact-input-bindings.json', {'schemaVersion': 1, 'inputs': [bind(p) for p in inputs], 'wholeBeforeExpectedSha256': '6568038620a0675425f334a7104d189484ff3e76468720611c9a288d02414485', 'old29SealedFilesVerifiedExact': True, 'inputSnapshotsNotDuplicated': True, 'oldSealsWritten': False, 'activeWrites': []})

schema_path = ROOT / 'docs/landscape-runtime.schema.json'
schema = read(schema_path)
jsonschema.Draft202012Validator(schema).validate(candidate)
spec = importlib.util.spec_from_file_location('skillpilot_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
files = sorted(PACKAGE.rglob('*.json'))
assert all(module.validate_file(str(p), schema) for p in files)
for b in read(PACKAGE / 'inputs/portable-exact-input-bindings.json')['inputs']:
    assert bind(ROOT / b['path']) == b
for b in old_freeze['files']:
    assert bind(ROOT / b['path']) == b
assert not any(p.is_symlink() for p in PACKAGE.rglob('*'))
ignored = subprocess.run(['git', 'check-ignore', '--no-index', *[p.relative_to(ROOT).as_posix() for p in PACKAGE.rglob('*') if p.is_file()]], cwd=ROOT, text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout
write('checks/normal-targeted-schema-portability-and-exact-delta.actual.json', {
    'schemaVersion': 1, 'role': 'Normal technical author check, not review/adoption', 'actualExitCode': 0,
    'normalValidateFileJsonCount': len(files), 'runtimeSchema': bind(schema_path), 'runtimeSchemaStatus': 'PASS',
    'wholeAfter': bind(whole_path), 'wholeGoalCount': 517, 'other516WholeGoalsExact': True,
    'changedJsonPointers': ['/examData/taskContent', '/examData/sourceArtifactPath'],
    'taskSourceMatchesWholeCorrectedBody': True, 'allOtherAffectedGoalFieldsExact': True,
    'solutionAndScoringExact': True, 'inputHashBindingsExact': len(inputs), 'old29SealedFilesExact': True,
    'symlinks': 0, 'ignoredPackageFiles': 0, 'reviewStatus': 'needs_review', 'C11HoldExactRetained': True,
    'C11PSelected': False, 'currentStrictDenominator': None, 'strictGain': 0, 'activeWrites': [],
})
print(json.dumps({'wholeAfter': bind(whole_path), 'other516WholeGoalsExact': True, 'changedJsonPointers': ['/examData/taskContent', '/examData/sourceArtifactPath'], 'normalRuntimeSchema': 'PASS', 'portableExactInputs': len(inputs), 'old29SealExact': True, 'solutionAndScoringExact': True, 'strictGain': 0}, ensure_ascii=False))
