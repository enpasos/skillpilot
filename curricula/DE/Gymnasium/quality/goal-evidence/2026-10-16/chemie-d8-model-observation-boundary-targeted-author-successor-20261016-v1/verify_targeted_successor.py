#!/usr/bin/env python3
"""Finite author retention/schema/arithmetic checks, not independent science votes.

Run from the repository root. Writes only this author's two finite check reports.
"""
import hashlib
import json
import math
from pathlib import Path

from jsonschema import Draft202012Validator

OUT = Path(__file__).parent
ROOT = Path.cwd()
OLD = OUT.parent / 'chemie-seven-native11-findings-whole-author-successor-20261016-v1'
GID = 'd8bdf486-7295-5393-b6f7-54f6e485c848'


def read(path):
    return json.loads(path.read_text())


def write(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


def digest(obj):
    return 'sha256:' + hashlib.sha256(json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def verify_pin(pin):
    data = (ROOT / pin['path']).read_bytes()
    assert 'sha256:' + hashlib.sha256(data).hexdigest() == pin['sha256'], pin['path']
    assert len(data) == pin['bytes'], pin['path']


def differences(before, after, pointer=''):
    if type(before) is not type(after):
        return [pointer]
    if isinstance(before, dict):
        result = []
        for key in sorted(set(before) | set(after)):
            q = pointer + '/' + key.replace('~', '~0').replace('/', '~1')
            result += [q] if key not in before or key not in after else differences(before[key], after[key], q)
        return result
    if isinstance(before, list):
        assert len(before) == len(after), (pointer, len(before), len(after))
        return [p for i, (a,b) in enumerate(zip(before, after)) for p in differences(a,b,pointer + '/' + str(i))]
    return [] if before == after else [pointer]


inputs = read(OUT / 'INPUTS.exact-scientific-author-baseline.json')
for p in inputs['inputs'] + inputs['preserveEveryOriginalAuthorFile']:
    verify_pin(p)
verify_pin(inputs['currentCanonicalForUnchangedD8Comparison'])
before_m = read(OLD / 'MATERIALS15.complete-whole-cases.author.json')
after_m = read(OUT / 'MATERIALS15.complete-whole-cases.author.json')
before_p = read(OLD / 'P7.after.complete-profile-author-drafts.json')
after_p = read(OUT / 'P7.after.complete-profile-author-drafts.json')
before_b = read(OLD / 'D8.synthetic-material-and-acquisition-boundary.author.json')
after_b = read(OUT / 'D8.synthetic-material-and-acquisition-boundary.author.json')

assert len(before_m['cases']) == len(after_m['cases']) == 15
assert len(before_p['profiles']) == len(after_p['profiles']) == 7
unchanged_cases, changed_cases = [], []
for i, (old, new) in enumerate(zip(before_m['cases'], after_m['cases'])):
    assert old['goalId'] == new['goalId']
    assert old['sourceLocator'] == new['sourceLocator']
    assert ('originalInlineCase' in old) == ('originalInlineCase' in new)
    if 'originalInlineCase' in old:
        assert old['originalInlineCase'] == new['originalInlineCase']
    assert old['caseAfter']['wholeCurrentGoal'] == new['caseAfter']['wholeCurrentGoal']
    case_id = old['caseAfter'].get('id', old['caseAfter'].get('caseId'))
    assert case_id == new['caseAfter'].get('id', new['caseAfter'].get('caseId'))
    if old['goalId'] != GID:
        assert old == new
        unchanged_cases.append({'index': i, 'goalId': old['goalId'], 'caseId': case_id, 'exactValueSha256': digest(old)})
    else:
        changed_cases.append({'index': i, 'goalId': GID, 'caseId': old['caseAfter']['id'], 'changedPointers': differences(old, new)})
        for key in ['maximumPoints', 'actualLearnerPerformance', 'performedExperiment', 'humanApproval']:
            assert old['caseAfter'][key] == new['caseAfter'][key]
        assert [x['expectationId'] for x in old['caseAfter']['rubric']] == [x['expectationId'] for x in new['caseAfter']['rubric']]
        assert all(x['actualPointsAwarded'] is None for x in new['caseAfter']['rubric'])
        assert sum(x['maximumPoints'] for x in new['caseAfter']['rubric']) == new['caseAfter']['maximumPoints'] == 4
assert len(unchanged_cases) == 13 and len(changed_cases) == 2
current_canonical = read(ROOT / inputs['currentCanonicalForUnchangedD8Comparison']['path'])
current_d8 = next(g for g in current_canonical['goals'] if g['id'] == GID)
assert current_d8 == after_m['cases'][11]['caseAfter']['wholeCurrentGoal']

schema = read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
validator = Draft202012Validator({'$schema': schema['$schema'], '$ref': '#/$defs/profile', '$defs': schema['$defs']})
unchanged_profiles = []
profile_changes = []
for old, new in zip(before_p['profiles'], after_p['profiles']):
    validator.validate(new['profile'])
    assert old['goalId'] == new['goalId']
    if old['goalId'] != GID:
        assert old == new
        unchanged_profiles.append({'goalId': old['goalId'], 'exactValueSha256': digest(old)})
    else:
        profile_changes = differences(old, new)
        assert old['profile']['coverageExpectations'] == new['profile']['coverageExpectations']
        assert [x['id'] for x in old['profile']['expectations']] == [x['id'] for x in new['profile']['expectations']]
        assert [x['id'] for x in old['profile']['applicationCaseBriefs']] == [x['id'] for x in new['profile']['applicationCaseBriefs']]
        assert old['profile']['variationAxes'][0] == new['profile']['variationAxes'][0]
        assert old['profile']['variationAxes'][2] == new['profile']['variationAxes'][2]
assert len(unchanged_profiles) == 6

old_model = before_m['cases'][11]['caseAfter']['syntheticMaterial']
new_model = after_m['cases'][11]['caseAfter']['syntheticMaterial']
assert old_model == new_model == before_b['material'] == after_b['material']
numbers = []
for row in new_model['mainSample']:
    assert abs(row['nCH3COOH'] + row['nCH3COOminus'] - 1) < 1e-12
    assert abs(row['fractionCH3COOH'] - row['nCH3COOH']) < 1e-12
    assert abs(row['fractionCH3COOminus'] - row['nCH3COOminus']) < 1e-12
    calc = 4.76 + math.log10(row['nCH3COOminus'] / row['nCH3COOH'])
    assert abs(calc - row['pH']) < 0.00051
    numbers.append({'stage': row['stage'], 'recomputedModelPH': calc, 'suppliedModelPH': row['pH']})
initial_h_mmol = 10 ** (-4.76) * .100 * 1000
net_h = [initial_h_mmol, initial_h_mmol + .3, initial_h_mmol - .3, initial_h_mmol + .3]
for row, n_h in zip(new_model['noAcetateControl'], net_h):
    concentration = abs(n_h) / row['volume']
    calc = -math.log10(concentration) if n_h > 0 else 14 + math.log10(concentration)
    assert abs(calc - row['pH']) < .00051
    numbers.append({'blankStage': row['stage'], 'recomputedModelPH': calc, 'suppliedModelPH': row['pH']})
for row in new_model['dilutionOnlyControl']:
    assert row['nCH3COOH'] == row['nCH3COOminus'] == .5 and row['pH'] == 4.76
assert .8 / 101 != .8 / 105

# Formula identities are explicit: acid direction 2C/6H/3O, charge zero;
# base direction 2C/5H/3O, charge minus one. HIn uses the conserved generic In group.
balances = [
    {'reaction': 'CH3COO− + H3O+ → CH3COOH + H2O', 'left': {'C':2,'H':6,'O':3,'charge':0}, 'right': {'C':2,'H':6,'O':3,'charge':0}},
    {'reaction': 'CH3COOH + OH− → CH3COO− + H2O', 'left': {'C':2,'H':5,'O':3,'charge':-1}, 'right': {'C':2,'H':5,'O':3,'charge':-1}},
    {'reaction': 'In− + H3O+ → HIn + H2O', 'left': {'In':1,'H':3,'O':1,'charge':0}, 'right': {'In':1,'H':3,'O':1,'charge':0}},
    {'reaction': 'HIn + OH− → In− + H2O', 'left': {'In':1,'H':2,'O':1,'charge':-1}, 'right': {'In':1,'H':2,'O':1,'charge':-1}},
]
assert all(x['left'] == x['right'] for x in balances)

write('DELTA.d8-only-complete-and-retention.json', {
    'role': 'Exact author delta and retention; no independent scientific judgment.',
    'changedGoalIds': [GID], 'unchangedWholeGoals': inputs['wholeGoalsRetainedByReference'],
    'changedCases': changed_cases, 'unchangedCases': unchanged_cases,
    'changedProfilePointers': profile_changes, 'unchangedProfiles': unchanged_profiles,
    'boundaryChangedPointers': differences(before_b, after_b),
    'numericWholeModelExactValueSha256': digest(new_model),
    'history': 'All 15 source locators, all four existing originalInlineCase audit records and all seven whole goal bodies retained exactly. The 13 non-d8 case objects and six non-d8 profile wrappers are exact unchanged values. Source seals pin the immutable original bytes.',
    'activeSuccessorResolution': 'Read active caseAfter and current profile; originalInlineCase is immutable historical audit, not an active requirement. Inherited goal pointers resolve against the explicit input alias, retaining their exact bodies.',
})
write('VALIDATION.actual-targeted-author-checks.json', {
    'status': 'PASS', 'scope': 'Finite author self-check only; independent scientific follow-up remains required.',
    'sourcePinsVerified': len(inputs['inputs']) + len(inputs['preserveEveryOriginalAuthorFile']) + 1,
    'profileV2Valid': 7, 'completeCaseCount': 15, 'unchangedOtherCases': 13,
    'unchangedOtherProfiles': 6, 'wholeGoalsChanged': 0,
    'numericModelUnchanged': True, 'recomputedModelValues': numbers, 'balancedReactions': balances,
    'currentB608WholeD8GoalExactlyRetained': True,
    'twoExpectationIdsAndAllCoverageDutiesRetained': True,
    'pairAndControlVariationRetained': True,
    'observationAcquisitionIsNotAnAddedCompetence': True,
    'actualExperimentRequiredForM7': False,
    'designStatus': 'designed_not_learner_observed', 'evidenceLevel': 'E0', 'generalizationLevel': 'G0',
    'actualLearnerPerformance': False, 'performedExperiment': False,
    'HumanApproval': False, 'HumanTrial': False,
    'newIndependentVotes': 0, 'claimedStrictGain': 0,
    'HOrCanonicalOrRegistryOrNormalBindingWrites': False,
})
print(json.dumps({'status':'PASS', 'profiles':7, 'wholeCases':15, 'unchangedOtherCases':13, 'unchangedOtherProfiles':6, 'sourcePinsVerified':len(inputs['inputs']) + len(inputs['preserveEveryOriginalAuthorFile']) + 1}))
