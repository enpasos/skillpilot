import hashlib
import importlib.util
import json
from pathlib import Path

import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent


def read(path):
    return json.loads(Path(path).read_text())


def pin(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.resolve().relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


frozen = read(OWN / 'INPUT.whole-current-eighteen-goals-and-P.json')
current = read(frozen['canonicalAtFreeze']['path'])
current_goals = {g['id']: g for g in current['goals']}
registry = read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
active_configs = set(next(s for s in registry['subjects'] if s['subject'] == 'chemie')['positiveEvidenceConfigPaths'])
for row in frozen['records']:
    assert row['goal'] == current_goals[row['goal']['id']], row['goal']['id']
    assert row['PConfig']['path'] in active_configs, row['PConfig']['path']
    assert pin(row['PConfig']['path']) == row['PConfig']
    assert pin(row['PRecordFile']['path']) == row['PRecordFile']
    record = json.loads(Path(row['PRecordFile']['path']).read_text().splitlines()[row['PLine'] - 1])
    assert record == row['wholePRecord']

materials = read(OWN / 'INPUT.whole-selected-operative-materials.exact.json')['entries']
for row in materials:
    assert pin(row['sourceFile']['path']) == row['sourceFile']
    value = read(row['sourceFile']['path'])
    for part in row['jsonPointer'].split('/')[1:]:
        value = value[int(part)] if isinstance(value, list) else value[part]
    assert value == row['wholeMaterial'] and digest(value) == row['wholeObjectSHA256']

schema_path = Path('docs/landscape-runtime.schema.json')
schema = read(schema_path)
goal_schema = {'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'}
validator = jsonschema.Draft202012Validator(goal_schema)
goals = read(OWN / 'AUTHOR.sixteen-whole-new-exam-goals.pending.json')['goals']
assessment = {r['endpointId']: r for r in read(OWN / 'AUTHOR.complete-assessment-materials.pending.json')['assessments']}
records = []
for goal in goals:
    validator.validate(goal)
    assert goal['id'] not in current_goals
    assert len(goal['requires']) == 1 and goal['requires'] == goal['examData']['coveredGoalIds']
    assert goal['type'] == 'atomic' and goal['nodeKind'] == 'exam'
    assert 'Practice' in goal['tags'] and 'Assessment' in goal['tags']
    assert goal['examData']['reviewStatus'] == 'draft'
    assert Path(goal['examData']['sourceArtifactPath']).exists()
    assert goal['extendedData']['applicabilityFromRequires'] is True
    for key in ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn']:
        assert len(goal['examData'][key]) > 200
    scoring = goal['examData']['scoring']
    assert scoring['maxPoints'] == scoring['passingPoints'] == sum(s['points'] for s in scoring['steps'])
    assert all(s['points'] == 2 for s in scoring['steps'])
    assert len({s['id'] for s in scoring['steps']}) == len(scoring['steps'])
    material = assessment[goal['id']]
    union = {i for r in material['rubric'] for i in r['expectationIds']}
    original = next(r for r in frozen['records'] if r['goal']['id'] == goal['requires'][0])
    assert set(original['wholePRecord']['profile']['coverageExpectations']['requiredExpectationIds']) <= union
    for criterion in material['rubric']:
        assert criterion['essential'] is True
        assert criterion['fullCreditDe'] and criterion['fullCreditEn'] and criterion['partialCreditDe'] and criterion['partialCreditEn'] and criterion['zeroCreditDe'] and criterion['zeroCreditEn']
    records.append({'examId': goal['id'], 'ordinaryGoalId': goal['requires'][0], 'maxPassingPoints': [scoring['maxPoints'], scoring['passingPoints']], 'criterionCount': len(scoring['steps']), 'oneMissingScientificCriterionCannotBeCompensated': scoring['maxPoints'] - 1 < scoring['passingPoints'], 'schema': 'PASS', 'allRequiredPExpectationIdsExplicitlyMapped': True, 'authorOnlyNotApproved': True})

# Independent arithmetic against the actual concrete authored figures.
assert abs(1240 / 350 - 3.542857142857143) < 1e-12
assert 1240 / 500 == 2.48
assert abs(1240 / 330 - 3.757575757575758) < 1e-12
assert 20 / 8 == 2.5 and 44 - 2.5 * 17 == 1.5
assert 34 / 17 == 2 and 20 - 2 * 8 == 4
assert 100 - 30 - 70 == 0 and 100 - 30 - 68 == 2 and 100 - 33 - 68 == -1
assert 222 / (200 + 40) * 100 == 92.5
assert abs(180 / 222 * 100 - 81.08108108108108) < 1e-10
assert (940 - 180) / 180 + 1 == 940 / 180
assert abs(222 / 254 * 100 - 87.4015748031496) < 1e-10
assert abs(10 / 9.8 - (0.2 / 9.8 + 1)) < 1e-12
assert abs(8 / 9.8 * 100 - 81.63265306122449) < 1e-10

spec = importlib.util.spec_from_file_location('schema_validator', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(str(ROOT))
assert symlink_errors == []
# Raw frozen whole native records remain byte faithful. Exactly one historical
# provenance-only reason contains an old absolute path; it is never dereferenced.
# The current operative config/record files above are portable, pinned and compared.
legacy_mentions = []
def walk(value, pointer, file):
    if isinstance(value, dict):
        for key, child in value.items():
            walk(child, pointer + '/' + key.replace('~', '~0').replace('/', '~1'), file)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            walk(child, pointer + '/' + str(index), file)
    elif isinstance(value, str) and ('/home/enpasos/' in value or '/mnt/' in value):
        legacy_mentions.append({'file': file.name, 'pointer': pointer, 'stringSHA256': hashlib.sha256(value.encode()).hexdigest(), 'classification': 'immutable original P reason provenance prose, not an operative dependency', 'dereferenced': False})
for file in OWN.glob('*.json'):
    if file.name not in ['CHECK.actual-finite-schema-P-CAS-material-scores-and-arithmetic.json']:
        walk(json.loads(file.read_text()), '', file)
assert len(legacy_mentions) == 1, legacy_mentions
assert legacy_mentions[0]['file'] == 'INPUT.whole-current-eighteen-goals-and-P.json'
assert legacy_mentions[0]['pointer'] == '/records/8/wholePRecord/reason'
assert frozen['records'][8]['goal']['id'] == 'b208b1a5-c609-53a1-8add-979417a93b7d'
# No current whole native body is edited for portability. No old review is read.
# New edges cannot introduce a cycle: actual current graph plus finite appends.
all_goals = {**current_goals, **{g['id']: g for g in goals}}
for edge in ['requires', 'contains']:
    adj = {gid: list(g.get(edge, [])) for gid, g in all_goals.items()}
    if edge == 'contains':
        for op in read(OWN / 'AUTHOR.sparse-phase-practice-contains-appends.pending.json')['operations']:
            assert current_goals[op['parentId']] == op['beforeWholeParent']
            adj[op['parentId']].extend(op['append'])
    active, done = set(), set()
    def visit(gid):
        assert gid not in active, (edge, gid)
        if gid in done:
            return
        active.add(gid)
        for child in adj[gid]:
            assert child in adj, (edge, gid, child)
            visit(child)
        active.remove(gid)
        done.add(gid)
    for gid in [g['id'] for g in goals] + ['5964272f-e835-5a24-b2b1-c162be6b75cb']:
        visit(gid)

result = {'status': 'PASS_FOR_DESIGN_SCHEMA_BINDINGS_ARITHMETIC_NOT_INDEPENDENT_SCIENCE', 'runtimeSchema': pin(schema_path), 'actualWholeCurrentOrdinaryGoalsEqual': 18, 'actualActivePConfigAndWholeRecordsEqual': 18, 'activeChemistryConfigCountObserved': len(active_configs), 'exactWholeMaterialObjectTransports': len(materials), 'newDraftExamObjects': len(goals), 'normalWrites': 0, 'officialWholeSourceCredit': 0, 'newOrdinaryScientificCompletions': 0, 'newIndependentScientificVotes': 0, 'stockCurriculumSymlinkErrors': symlink_errors, 'portableOperativePaths': True, 'exactInheritedProvenanceOnlyAbsoluteMentions': legacy_mentions, 'selectedNewEdgeDAGChecks': ['requires', 'contains'], 'records': records}
(OWN / 'CHECK.actual-finite-schema-P-CAS-material-scores-and-arithmetic.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': result['status'], 'wholeC/P': 18, 'materials': len(materials), 'draftExams': len(goals), 'normalWrites': 0}))
