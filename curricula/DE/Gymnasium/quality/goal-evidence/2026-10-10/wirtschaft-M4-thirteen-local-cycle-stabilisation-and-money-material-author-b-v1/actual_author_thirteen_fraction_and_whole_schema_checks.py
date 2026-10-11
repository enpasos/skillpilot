from pathlib import Path
from fractions import Fraction as F
import json, hashlib, re, datetime
from jsonschema import Draft202012Validator

O = Path(__file__).parent
ROOT = O.parents[6]
checks = []
def check(label, actual, expected):
    assert actual == expected, (label, actual, expected)
    checks.append({'label': label, 'actualExact': str(actual), 'expectedExact': str(expected), 'pass': True})

check('660 inspections', 3 * 6, 18)
check('660 equal abatement total', 10 + 30 + 60, 100)
check('660 housing excess demand', 120 - 80, 40)
check('d366 emissions base', 100 * 10, 1000)
check('d366 emissions later', 150 * 8, 1200)
check('d366 intensity change', F(8, 10) - 1, F(-1, 5))
check('d366 total change', F(1200, 1000) - 1, F(1, 5))
check('d366 output growth', F(150, 100) - 1, F(1, 2))
check('d366 costA', 40 + 10 * 8, 120)
check('d366 costB', 70 + 10 * 5, 120)
check('d366 social fare cost', 70 + 10 * 6, 130)
check('d366 resource difference', 60 - 45, 15)
check('d366 no-fare access loss', 100 - 80, 20)
check('d366 funded-fare access gain overA', 120 - 100, 20)
check('ECB2024 previous rate', F('3.75') + F('.25'), F(4))
check('ECB2025 previous rate', F('2.00') + F('.25'), F('2.25'))
check('ECB 25bp in percentage points', F(25, 100), F('.25'))
check('bc3 demand initial', F(20 + 20 + 20, 1) / (1 - F('.8')), F(300))
check('bc3 demand after', F(20 + 10 + 20, 1) / (1 - F('.8')), F(250))
check('bc3 output difference', F(250) - 300, F(-50))
check('bc3 multiplier', F(1) / (1 - F('.8')), F(5))
check('bc3 supply loss', 270 - 300, -30)
check('bc3 supply price change', F(108, 100) - 1, F('.08'))
check('bc3 credit investment initial', 40 - 5 * 2, 30)
check('bc3 credit investment later', 40 - 5 * 4, 20)
check('bc3 investment change', 20 - 30, -10)
check('bc3 conditional demand change', -10 * 3, -30)
check('8ebb price growth', F(106, 100) - 1, F('.06'))
check('f70 Hrealchange', F(105, 110) - 1, F(-1, 22))
check('f70 fixed income realchange', F(100, 110) - 1, F(-1, 11))
check('f70 fixed transfer real', F(50) / F('1.1'), F(500, 11))
check('f70 indexed transfer nominal', F(50) * F('1.1'), F(55))
check('f70 indexed transfer real', F(55) / F('1.1'), F(50))
check('f70 fixed household annual cost', F(100) * F('.05'), F(5))
check('f70 variable household annual cost', F(100) * F('.058'), F('5.8'))
check('f70 variable increase', F('5.8') - 5, F('.8'))
check('f70 new firm prior cost', F(200) * F('.05'), F(10))
check('f70 new firm after cost', F(200) * F('.058'), F('11.6'))
check('f70 new firm increase', F('11.6') - 10, F('1.6'))
check('f70 existing sovereign cost', F(1000) * F('.03'), F(30))
check('f70 new deposit prior', F(100) * F('.02'), F(2))
check('f70 new deposit later', F(100) * F('.025'), F('2.5'))
check('f70 lending pass-through', F('5.8') - 5, F('.8'))
check('f70 deposit pass-through', F('2.5') - 2, F('.5'))
check('550 initial consumption', F(10) * F('.8'), F(8))
check('550 initially saved', F(10) - 8, F(2))
check('550 nominal offset', 3 - 3, 0)
check('a773 orders monthly', F(108 - 104, 104), F(1, 26))
check('a773 production monthly', F(97 - 98, 98), F(-1, 98))
check('a773 unemployment pp', F('6.4') - F('6.2'), F('.2'))
check('a773 order index above base', F(108, 100) - 1, F('.08'))
check('a773 real sales', F(108, 112) - 1, F(-1, 28))
check('a773 utilisation pp', 78 - 85, -7)
check('a773 intentions pp', 35 - 50, -15)
check('a773 intentions relative', F(35, 50) - 1, F('-.3'))
check('0e5 errorA pp', F('1.5') - 1, F('.5'))
check('0e5 errorB pp', F(2) - 1, F(1))
check('0e5 within nonprobabilistic range', F('.5') <= F(1) <= F('2.5'), True)
check('252 index1', F('.2') * 150 + F('.8') * 100, F(110))
check('252 index2', F('.2') * F('154.5') + F('.8') * 103, F('113.3'))
check('252 rate1', F(110, 100) - 1, F('.1'))
check('252 rate2', F('113.3') / 110 - 1, F('.03'))
check('252 Hindex1', F('.5') * 150 + F('.5') * 100, F(125))
check('252 Hindex2', F('.5') * F('154.5') + F('.5') * 103, F('128.75'))
check('252 Hrate1', F(125, 100) - 1, F('.25'))
check('252 Hrate2', F('128.75') / 125 - 1, F('.03'))
check('252 deflation1', F(108, 110) - 1, F(-1, 55))
check('252 deflation2', F(106, 108) - 1, F(-1, 54))
check('252 initial realincome', F(100) / F('1.10'), F(1000, 11))
check('252 later realincome', F(100) / F('1.06'), F(5000, 53))
check('252 initial realdebt', F(50) / F('1.10'), F(500, 11))
check('252 later realdebt', F(50) / F('1.06'), F(2500, 53))
check('252 nominal debt-income ratio invariant', F(50, 100), F('.5'))
check('b241 multiplier', F(1) / (1 - F('.75')), F(4))
check('b241 model output', F(10) * 4, F(40))
check('b241 initial import outflow only', F(10) * F('.4'), F(4))
check('b241 full trained capacity', 20 * 10, 200)
check('b241 partial trained capacity', 16 * 10, 160)

materials = json.loads((O / 'whole-thirteen-one-contract-two-distinct-case-materials.DEEN-DRAFT.author-v1.json').read_text())
for m in materials:
    check(m['id'] + ' rubric total', sum(s['points'] for s in m['examData']['scoring']['steps']), 24)
    check(m['id'] + ' threshold', m['examData']['scoring']['passingPoints'], 15)
schema_path = ROOT / 'contracts/curriculum-package/v1/compiled-landscape.schema.json'
schema = json.loads(schema_path.read_text())
goal_schema = {'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'}
validator = Draft202012Validator(goal_schema)
errors = [{'materialId': m['id'], 'path': list(e.path), 'message': e.message} for m in materials for e in validator.iter_errors(m)]
(O / 'actual-unprojected-source13-against-compiled-schema-not-a-schema-PASS.history.json').write_text(json.dumps({'wrongSourceVsCompiledSchemaAssumption': True, 'sourceGoalCount':13, 'actualErrors':errors, 'sourceSchemaUnchanged':True},ensure_ascii=False,indent=2)+'\n')
projections=[]
for m in materials:
    q=json.loads(json.dumps(m));q['semanticKind']='practiceAssessment'
    q['extendedData'].pop('authorCandidateDisposition',None)
    for step in q['examData']['scoring']['steps']:
        step['description'] += '\nEN: ' + step.pop('descriptionEn')
    projections.append(q)
projection_errors=[{'materialId':m['id'],'path':list(e.path),'message':e.message} for m in projections for e in validator.iter_errors(m)]
assert not projection_errors, projection_errors
(O / 'whole-thirteen-conditional-practice-kind-schema-projections.no-kind-release-approval.json').write_text(json.dumps(projections,ensure_ascii=False,indent=2)+'\n')
for m in materials:
    assert all(m['examData'][k].strip() for k in ('taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn'))
    assert m['requires'] == m['examData']['coveredGoalIds']
    assert not m['contains']
    assert m['examData']['reviewStatus'] == 'draft'
result = {'role': 'OWN_AUTHOR_NUMERICAL_AND_CLOSED_GOAL_SCHEMA_CHECKS_NOT_INDEPENDENT_APPROVAL',
          'executedFractionAndTotalChecks': len(checks), 'errors': 0, 'checks': checks,
          'wholeNewMaterialGoalSchemaCount': len(materials), 'unprojectedSourceVsCompiledSchemaErrorsPreserved': len(errors), 'closedConditionalPracticeKindGoalSchemaErrors': projection_errors, 'conditionalProjectionIsNotKindOrWholeReleaseApproval':True,
          'sourceSchemaPath': str(schema_path.relative_to(ROOT)), 'sourceSchemaSHA256': hashlib.sha256(schema_path.read_bytes()).hexdigest(),
          'ordinaryGoalOrOriginalPChanges': 0, 'wholeCourseSourceApplicabilityOrScopeApproved': False,
          'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
(O / 'actual-13-whole-materials-Fraction-numerics-and-closed-goal-schema.author-results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'executedChecks': len(checks), 'schemaGoals': len(materials), 'errors': 0}, indent=2))
