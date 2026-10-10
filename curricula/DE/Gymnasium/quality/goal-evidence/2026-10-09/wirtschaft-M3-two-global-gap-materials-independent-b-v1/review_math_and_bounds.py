"""Independent, bounded machine-QS arithmetic and immutable input guards.

Semantic grading is the reviewer's documented reading, not an automated
learner grader. All submissions below are synthetic reviewer counterwork.
This script changes no active curriculum, policy, source or view.
"""
import hashlib
import json
from decimal import Decimal as D
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'AGENTS.md').exists())
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-two-actual-global-gaps-trade-agreements-and-money-creation-author-v1'
V2 = BASE / 'two-real-essential-performance-scoring-author-successor-v2'
ACTIVE = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'


def bound(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def write(name, value):
    path = HERE / name
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise RuntimeError('Immutable independent output already exists: ' + name)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def read(path):
    return json.loads(path.read_text())


def field_diffs(before, after, pointer=''):
    if type(before) != type(after):
        return [pointer]
    if isinstance(before, dict):
        result = []
        for key in sorted(before.keys() | after.keys()):
            result.extend(field_diffs(before.get(key), after.get(key), pointer + '/' + key))
        return result
    if isinstance(before, list):
        if len(before) != len(after):
            return [pointer]
        result = []
        for i, (a, b) in enumerate(zip(before, after)):
            result.extend(field_diffs(a, b, pointer + '/' + str(i)))
        return result
    return [] if before == after else [pointer]


v1_path = BASE / 'whole-two-real-global-gap-materials.DRAFT-bilingual-author-candidates.json'
v2_path = V2 / 'whole-two-real-global-gap-materials.DRAFT-only-essential-performance-scoring-successor-v2.json'
contexts_path = BASE / 'whole-four-current-contracts-and-eight-valid-P-cases.exact-intake.json'
baseline_path = BASE / 'whole-current494-before-two-genuine-materials.exact.json'
candidate_path = V2 / 'whole-CAN496.only-two-essential-performance-scoring-followers.inert.json'
nav_path = BASE / 'whole-pure-navigation-before-and-two-access-child-successor.json'
originals = [v1_path, v2_path, contexts_path, nav_path]
inputs = []
for path in originals:
    destination = HERE / 'inputs' / path.name
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        raise RuntimeError('Immutable input copy exists')
    destination.write_bytes(path.read_bytes())
    inputs.append({'original': bound(path), 'exactLocalCopy': bound(destination), 'wholeBytesEqual': path.read_bytes() == destination.read_bytes()})

v1, v2 = read(v1_path), read(v2_path)
contexts, baseline, candidate, active = read(contexts_path), read(baseline_path), read(candidate_path), read(ACTIVE)
actual_diffs = field_diffs(v1, v2)
expected_diffs = ['/0/examData/taskContent', '/0/examData/taskContentEn', '/1/examData/taskContent', '/1/examData/taskContentEn']
assert actual_diffs == expected_diffs
old_by_id = {g['id']: g for g in baseline['goals']}
new_by_id = {g['id']: g for g in candidate['goals']}
active_by_id = {g['id']: g for g in active['goals']}
new_ids = sorted(set(new_by_id) - set(old_by_id))
assert new_ids == sorted(g['id'] for g in v2)
assert set(old_by_id) <= set(new_by_id)
nav_id = '5317d078-413b-58bb-9262-d57387d51655'
changed_existing = {goal_id: field_diffs(g, new_by_id[goal_id]) for goal_id, g in old_by_id.items() if g != new_by_id[goal_id]}
assert changed_existing == {nav_id: ['/contains', '/description', '/descriptionEn']}
assert new_by_id[nav_id]['contains'] == old_by_id[nav_id]['contains'] + [g['id'] for g in v2]
assert old_by_id[nav_id]['requires'] == new_by_id[nav_id]['requires'] == []
assert old_by_id[nav_id]['extendedData'] == new_by_id[nav_id]['extendedData']
assert all(new_by_id[g['id']] == g for g in v2)
old_materials = [g for g in baseline['goals'] if 'examData' in g]
assert len(old_materials) == 97
assert all(g == new_by_id[g['id']] for g in old_materials)
assert len(baseline['goals']) == 494 and len(candidate['goals']) == 496
assert all(g == active_by_id[g['id']] for g in contexts['wholeGoals'])
for material in v2:
    assert material['examData']['reviewStatus'] == 'draft'
    assert material['requires'] == material['examData']['coveredGoalIds']
    assert len(material['requires']) == 1
    assert material['contains'] == []
    assert material['extendedData']['applicabilityFromRequires'] is True
    assert material['examData']['scoring']['maxPoints'] == 24
    assert material['examData']['scoring']['passingPoints'] == 15
    assert sum(s['points'] for s in material['examData']['scoring']['steps']) == 24

# Real DAG check on the entire inert candidate, including the retained old graph.
def assert_dag(field):
    visiting, done = set(), set()
    def visit(goal_id):
        if goal_id in visiting:
            raise AssertionError(field + ' cycle at ' + goal_id)
        if goal_id in done:
            return
        assert goal_id in new_by_id, 'Unresolved reference in bounded candidate: ' + goal_id
        visiting.add(goal_id)
        for related in new_by_id[goal_id].get(field, []):
            visit(related)
        visiting.remove(goal_id)
        done.add(goal_id)
    for goal_id in new_by_id:
        visit(goal_id)
    return len(done)

guards = {
    'reviewer': '/root/economics_m2_views_independent_b',
    'role': 'independent bounded material science, not author or whole-course approval',
    'inputCopies': inputs,
    'wholePredecessor': bound(baseline_path),
    'wholeCandidate': bound(candidate_path),
    'actuallyReadActiveCanonical': bound(ACTIVE),
    'currentWholeFourContextGoalsEqualActive': True,
    'fourActualTaskInstructionDeltasOnly': actual_diffs,
    'newIds': new_ids,
    'existingGoalFieldChanges': changed_existing,
    'existingWholeGoalsUnchanged': len(old_by_id) - len(changed_existing),
    'existingWholeMaterialsUnchanged': len(old_materials),
    'ordinaryGoalContentOrTargetChangesAuthoredHere': 0,
    'descriptionDeltaInterpretation': 'The existing pure-navigation list is updated from fourteen to sixteen and names the actual two new children in DE/EN; it asserts no new competency. This is explicitly not a contains-only diff.',
    'draftBothPreserved': True,
    'requiresDagNodes': assert_dag('requires'),
    'containsDagNodes': assert_dag('contains'),
    'sourceCoverageOrCountryCourseApproval': False,
    'humanApproval': False,
    'activeMutation': False,
}
write('actual-independent-whole-input-four-field-navigation-material-and-DAG-guards.json', guards)

# Calculate from the supplied economic assumptions, independently of the
# author's numeric receipts or expected-response prose.
checks = []
def check(name, actual, expected, meaning):
    actual, expected = D(str(actual)), D(str(expected))
    assert actual == expected, (name, actual, expected)
    checks.append({'id': name, 'actual': str(actual), 'expected': str(expected), 'interpretation': meaning})

small_n, large_n = D(20), D(200)
base_price, tariff, fixed = D(100), D(10), D(40)
small_old = small_n * (base_price + tariff)
small_new = small_n * base_price + fixed
large_old = large_n * (base_price + tariff)
large_new = large_n * base_price + fixed
check('CETA-small-initial', small_old, 2200, 'Same quantity; stipulated initial tariff.')
check('CETA-small-final', small_new, 2040, 'Fixed documentation added once, not per unit.')
check('CETA-small-saving', small_old-small_new, 160, 'Importer gross saving before sharing, not whole-economy welfare.')
check('CETA-small-unit', small_new/small_n, 102, 'Average landed cost.')
check('CETA-large-initial', large_old, 22000, 'Same original 200 units.')
check('CETA-large-final', large_new, 20040, 'Identical one-off documentation cost.')
check('CETA-large-saving', large_old-large_new, 1960, 'Own gross saving.')
check('CETA-large-unit', large_new/large_n, '100.2', 'Scale only spreads fixed documentation; no productivity claim.')
check('CETA-small-doc-unit', fixed/small_n, 2, 'Compliance relative burden.')
check('CETA-large-doc-unit', fixed/large_n, '0.2', 'Compliance relative burden.')
passed_saving = (small_old-small_new)/2
check('CETA-buyers-total', passed_saving, 80, 'Stipulated half pass-through, not observed price evidence.')
check('CETA-buyer-unit-discount', passed_saving/small_n, 4, 'Per-unit buyer share.')
check('CETA-buyer-final-price', base_price+tariff-passed_saving/small_n, 106, 'Conditional final buyer price.')
check('CETA-importer-retained', small_old-small_new-passed_saving, 80, 'Other changes expressly excluded.')
check('CETA-competitor-unit-revenue', D(105)-D(110), -5, 'Fixed quantity and costs, no inferred employment decline.')
n, japan, outsider, old_duty = D(10), D(90), D(82), D(10)
before_japan, before_outsider = n*(japan+old_duty), n*(outsider+old_duty)
after_japan, after_outsider = n*japan+D(4), before_outsider
check('EPA-Japan-initial', before_japan, 1000, 'Stipulated prices, not actual tariff line.')
check('EPA-outsider-initial', before_outsider, 920, 'Initially cheaper admissible supply.')
check('EPA-Japan-final', after_japan, 904, 'Documentation four for the shipment.')
check('EPA-outsider-final', after_outsider, 920, 'No preference for the outsider in this model.')
assert before_outsider < before_japan and after_japan < after_outsider
check('EPA-buyer-saving', before_outsider-after_japan, 16, 'Buyer benefit distinct from resource efficiency.')
check('EPA-real-production-before', n*outsider, 820, 'Offer explicitly equated to real production cost.')
check('EPA-real-production-after', n*japan, 900, 'Partner resource cost, not customs payment.')
check('EPA-real-production-change', n*(japan-outsider), 80, 'Model diversion to a more costly producer.')
check('EPA-tariff-revenue-change', D(0)-n*old_duty, -100, 'Government transfer disappears; not a resource saving.')
check('EPA-B2-Japan', n*japan+D(40), 940, 'Higher compliance cost makes preference unused.')
assert after_outsider < n*japan+D(40)

def bank(r, l, dep, equity):
    assert D(r)+D(l) == D(dep)+D(equity)
    return {'reserves': r, 'loans': l, 'deposits': dep, 'equity': equity, 'total': r+l}

a0, b0 = bank(250,150,330,70), bank(180,220,360,40)
loan, payment = 120,75
a1 = bank(a0['reserves'],a0['loans']+loan,a0['deposits']+loan,a0['equity'])
a2 = bank(a1['reserves']-payment,a1['loans'],a1['deposits']-payment,a1['equity'])
b2 = bank(b0['reserves']+payment,b0['loans'],b0['deposits']+payment,b0['equity'])
for name, actual, expected in [
    ('A-created-loans',a1['loans'],270),('A-created-deposits',a1['deposits'],450),('A-created-total',a1['total'],520),
    ('A-paid-reserves',a2['reserves'],175),('A-paid-deposits',a2['deposits'],375),('A-paid-total',a2['total'],445),
    ('B-paid-reserves',b2['reserves'],255),('B-paid-deposits',b2['deposits'],435),('B-paid-total',b2['total'],475),
    ('K-after-payment',loan-payment,45),('seller-after-payment',payment,75),
    ('system-deposits-before',a0['deposits']+b0['deposits'],690),('system-deposits-after',a2['deposits']+b2['deposits'],810),
    ('system-loans-before',a0['loans']+b0['loans'],370),('system-loans-after',a2['loans']+b2['loans'],490),
    ('system-reserves-before',a0['reserves']+b0['reserves'],430),('system-reserves-after',a2['reserves']+b2['reserves'],430),
    ('K-net-wealth-after-loan',loan-loan,0),('K-net-wealth-after-purchase',(loan-payment)+payment-loan,0),
]: check(name,actual,expected,'Matched balance entries or separate system/customer stocks; no reserve/deposit double count.')
c0 = bank(90,210,240,60)
repay, transfer = 30,20
c1 = bank(c0['reserves'],c0['loans']-repay,c0['deposits']-repay,c0['equity'])
c_internal = bank(c1['reserves'],c1['loans'],c1['deposits'],c1['equity'])
c_external = bank(c1['reserves']-transfer,c1['loans'],c1['deposits']-transfer,c1['equity'])
for name,actual,expected in [
    ('C-repaid-loans',c1['loans'],180),('C-repaid-deposits',c1['deposits'],210),('C-repaid-total',c1['total'],270),
    ('D-repaid-loan',80-repay,50),('D-repaid-deposit',80-repay,50),('D-after-transfer',80-repay-transfer,30),
    ('recipient-after-transfer',transfer,20),('C-internal-total',c_internal['total'],270),
    ('C-external-reserves',c_external['reserves'],70),('C-external-deposits',c_external['deposits'],190),
    ('C-external-total',c_external['total'],250),('E-reserve-change',transfer,20),('E-deposit-change',transfer,20),
    ('C-E-deposit-net-change',-repay-transfer+transfer,-30),('C-E-reserve-net-change',-transfer+transfer,0),
]: check(name,actual,expected,'Principal repayment contracts paired claims/liabilities; payment redistributes deposits/reserves.')
write('actual-independent-Decimal-model-calculations-and-whole-balance-results.json',{
    'method': 'Own Decimal arithmetic from given dossier inputs; independent of author numeric receipts.',
    'allPassed': True,
    'count': len(checks),
    'checks': checks,
    'computedWholeBankBalances': {'Ainitial':a0,'Binitial':b0,'AafterLoan':a1,'AafterPayment':a2,'BafterPayment':b2,'Cinitial':c0,'CafterRepayment':c1,'CafterInternalPayment':c_internal,'CafterExternalPayment':c_external},
    'scope': 'Fictional economic model calculations; no actual tariff-line advice, measured treaty effects or real-world bank solvency claim.',
})
print(json.dumps({'actualFieldDeltas':actual_diffs,'oldMaterialBodiesExact':len(old_materials),'allCurrentFourContextGoalsExact':True,'numericChecks':len(checks),'allPassed':True},ensure_ascii=False))
