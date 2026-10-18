import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent


def read(p):
    return json.loads(Path(p).read_text())


def pin(p):
    p = Path(p)
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT) if p.is_absolute() else p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


current = {g['id']: g for g in read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals']}
frozen = read(OWN / 'INPUT.whole-current-fourteen-end-and-four-support-goals-and-P.json')
registry = read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
active = set(next(s for s in registry['subjects'] if s['subject'] == 'chemie')['positiveEvidenceConfigPaths'])
for r in frozen['records']:
    assert r['goal'] == current[r['goal']['id']]
    assert r['PConfig']['path'] in active
    assert pin(r['PConfig']['path']) == r['PConfig']
    assert pin(r['PRecordFile']['path']) == r['PRecordFile']
    assert json.loads(Path(r['PRecordFile']['path']).read_text().splitlines()[r['PLine'] - 1]) == r['wholePRecord']
materials = read(OWN / 'INPUT.whole-selected-operative-materials.exact.json')['entries']
for r in materials:
    assert pin(r['sourceFile']['path']) == r['sourceFile']
    value = read(r['sourceFile']['path'])
    for segment in r['jsonPointer'].split('/')[1:]:
        value = value[int(segment)] if isinstance(value, list) else value[segment]
    assert value == r['wholeMaterial']
assert len(frozen['records']) == 18 and len(materials) == 32
original = read(OWN / 'INPUT.P373-original-generic-two-material-cases.exact.json')
assert pin(original['sourceFile']['path']) == original['sourceFile']
assert read(original['sourceFile']['path']) == original['wholeOriginalCases']
absolute = []


def walk(value, pointer, name):
    if isinstance(value, dict):
        for k, v in value.items():
            walk(v, pointer + '/' + k, name)
    elif isinstance(value, list):
        for i, v in enumerate(value):
            walk(v, pointer + '/' + str(i), name)
    elif isinstance(value, str) and ('/home/enpasos/' in value or '/mnt/' in value):
        absolute.append({'file': name, 'pointer': pointer, 'stringSHA256': hashlib.sha256(value.encode()).hexdigest()})


for p in OWN.glob('*.json'):
    walk(read(p), '', p.name)
assert absolute == [], absolute
spec = importlib.util.spec_from_file_location('stock_schema_validator', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
errors = module.curriculum_symlink_errors(str(ROOT))
assert errors == []
result = {'artifactRole': 'FROZEN_INPUT_INTEGRITY_ONLY_NOT_SCIENTIFIC_COMPLETENESS', 'status': 'PASS', 'wholeCurrentSelectedCAndPExact': 18, 'wholeMaterialCasesExact': 32, 'originalGenericP373CasesExact': 2, 'operativeLocatorsPortable': True, 'absolutePathMentions': absolute, 'stockCurriculumSymlinkErrors': errors, 'newExamObjects': 0, 'newScienceVotes': 0, 'normalWrites': 0, 'compilerAPBuildRuns': 0}
(OWN / 'CHECK.frozen-input-integrity.actual.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result))
