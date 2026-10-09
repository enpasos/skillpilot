"""Independent finite-data and exact-input checks; no mastery or native review."""
import csv
import hashlib
import json
import math
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
AUTHOR = BASE / 'chemie-b008-current-nineteen-whole-positive-author-v1'
RAW = BASE / 'chemie-b008-current-twenty-six-native-preparation-author-v1/input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json'

def digest(v):
    return hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def resolve(doc, pointer):
    for key in pointer.split('/')[1:]:
        key = key.replace('~1', '/').replace('~0', '~')
        doc = doc[int(key)] if isinstance(doc, list) else doc[key]
    return doc

def write(name, value):
    target = OWN / name
    assert not target.exists(), f'Immutable output already exists: {name}'
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

raw = json.loads(RAW.read_text())
entry = json.loads((AUTHOR / 'neutral-nineteen-whole-positive.author.entry.json').read_text())
receipt = json.loads((AUTHOR / 'nineteen-whole-facet-case-source-context.author-receipt.json').read_text())
supp = json.loads((AUTHOR / 'thirty-eight-whole-case-worked-transfer.supplement.author-candidate.json').read_text())
specs = [json.loads(line) for line in (AUTHOR / 'author-candidates.jsonl').read_text().splitlines()]
candidate_set = json.loads((AUTHOR / 'nineteen.normal-positive-candidate-set.author-candidate.json').read_text())
errors = []
rows = []
assert candidate_set['goals'] == specs
assert [v['goalId'] for v in specs] == entry['goalIds']
assert not set(entry['goalIds']) & set(entry['excludedA7GoalIds'])
by_case = {v['caseKey']: v for v in supp['entries']}
for i, (spec, binding) in enumerate(zip(specs, receipt['entries'])):
    assert spec['goalId'] == binding['goalId']
    checks = []
    for name in ['wholeGoal', 'wholeHistoricalProfile']:
        ptr = binding[name]
        assert digest(resolve(raw, ptr['jsonPointer'])) == ptr['valueSha256']
        checks.append(ptr['jsonPointer'])
    for old_binding, new_brief in zip(binding['wholeHistoricalCases'], spec['profile']['applicationCaseBriefs']):
        ptr = old_binding['wholeOriginalCase']
        old = resolve(raw, ptr['jsonPointer'])
        assert digest(old) == ptr['valueSha256']
        supplement = by_case[old['caseKey']]
        assert supplement['wholeOriginalCase'] == ptr
        assert supplement['wholeOriginalFreshTransferDemand'] == old['transfer']
        assert new_brief['id'] == old['caseKey']
        for language, suffix in [('de', 'De'), ('en', 'En')]:
            assert old['expectedAnswer'][language] in new_brief['expectedPerformance' + suffix]
            assert supplement['authoredWorkedFreshTransferResponse'][language] in new_brief['expectedPerformance' + suffix]
            assert old['learnerTask'][language] in new_brief['taskDemand' + suffix]
            assert old['transfer'][language] in new_brief['taskDemand' + suffix]
        for flag in ['physicalExperimentPerformed', 'actualDialoguePerformed', 'actualPresentationPerformed', 'actualLearnerResearchPerformed', 'actualLearnerDigitalFileCreated']:
            assert supplement[flag] is False
        assert supplement['reviewRecordMetadata']['humanApproval'] is False
        checks.append(ptr['jsonPointer'])
    rows.append({'goalId': spec['goalId'], 'originalPointersChecked': checks, 'profileValueSha256': digest(spec['profile']), 'originalBodiesUnchanged': True, 'bothNewWorkedResponsesActuallyPresentInProfile': True})
write('original-and-new-nineteen-pointer-profile-consistency.actual.json', {'schemaVersion': 1, 'role': 'Exact selected input consistency, not semantic review', 'originalGoalCount': 19, 'originalProfileCount': 19, 'originalWholeCaseCount': 38, 'newProfileCount': 19, 'newWorkedTransferCount': 38, 'disjointFromAuthorA7': True, 'rows': rows, 'errors': errors})

def fit(values):
    t = [0.0, 10.0, 20.0, 30.0]
    y = [math.log(c / values[0]) for c in values]
    tm, ym = sum(t) / 4, sum(y) / 4
    slope = sum((a-tm)*(b-ym) for a,b in zip(t,y))/sum((a-tm)**2 for a in t)
    intercept = ym-slope*tm
    return {'slopePerMinute': slope, 'intercept': intercept, 'logValues': y, 'residuals': [b-(intercept+slope*a) for a,b in zip(t,y)]}

original = fit([.1,.06065,.03679,.02231])
fresh = fit([.1,.06065,.05,.02231])
author = json.loads((AUTHOR / 'actual-finite-author-model-calculations.json').read_text())
numeric_checks = []
def close(label, actual, expected):
    delta = abs(actual-expected)
    assert delta < 1e-10, (label, actual, expected)
    numeric_checks.append({'label': label, 'independentValue': actual, 'authoredValue': expected, 'absoluteDifference': delta})

for label, actual, reference in [('original', original, author['kinetics']['originalFit']), ('fresh', fresh, author['kinetics']['freshFit'])]:
    close(label+'.slope', actual['slopePerMinute'], reference['slopePerMinute'])
    close(label+'.intercept', actual['intercept'], reference['intercept'])
    for i,(a,b) in enumerate(zip(actual['residuals'], reference['residuals'])): close(f'{label}.residual.{i}', a,b)
for row in csv.DictReader((AUTHOR / 'author-reference-kinetics-original-and-fresh.csv').open()):
    f = original if row['version']=='original' else fresh
    time = float(row['time_min'])
    logv = math.log(float(row['model_concentration_mol_per_L'])/.1)
    close('kinetic.csv.log', logv, float(row['ln_c_over_c0']))
    close('kinetic.csv.fit', f['intercept']+f['slopePerMinute']*time, float(row['fitted_ln']))
    close('kinetic.csv.residual', logv-f['intercept']-f['slopePerMinute']*time, float(row['residual']))
for row in csv.DictReader((AUTHOR / 'author-reference-equilibrium-K1-K2.csv').open()):
    x = float(row['extent_x']); concentrations=[2-x,1-x,1+x,1+x]
    for key,a in zip(['A_mol_per_L','B_mol_per_L','C_mol_per_L','D_mol_per_L'],concentrations): close('equilibrium.csv.'+key,a,float(row[key]))
    close('equilibrium.csv.Q',concentrations[2]*concentrations[3]/concentrations[0]/concentrations[1],float(row['Q']))
root=4-math.sqrt(13)
close('K2.positive.admissible.root', root, author['equilibriumK2']['admissibleRoot'])
close('K2.mass.action', (1+root)**2/((2-root)*(1-root)),2)
assert 0<=root<1 and 4+math.sqrt(13)>1
close('calibration.in.range',(.29-.01)/.08,author['calibration']['validDilutedModelConcentration'])
close('calibration.outside.domain.formal.only',(.65-.01)/.08,8)
assert (.65-.01)/.08>6 and author['calibration']['freshReportedConcentration'] is None
close('volume.bound.low',19.98/10.02,author['calibration']['volumeFactorBoundsOnly'][0])
close('volume.bound.high',20.02/9.98,author['calibration']['volumeFactorBoundsOnly'][1])
close('base.shared.bias',.01/.009-1,author['acidStandardIllustration']['relativeHighBias'])
close('base.actual.A',.009*8/10,.0072)
close('base.actual.B',.009*16/10,.0144)
for ligand in [0,2,6]: close('occupancy.'+str(ligand),ligand/(2+ligand),author['occupancyKd2'][str(ligand)])
close('process.fresh.per.accepted.kg',40/20,author['processFreshAccepted20']['freshKgPerKg'])
close('process.energy.per.accepted.kg',63/20,author['processFreshAccepted20']['energyKWhPerKg'])
close('process.energy.increase',(63/20)/(50/20)-1,.26)
close('process.fresh.reduction',1-(40/20)/(100/20),.6)
close('half.life.ideal',math.log(2)/.05,author['kinetics']['halfLifeOriginalIdeal'])
write('independent-finite-calculations.actual.json', {'schemaVersion':1,'role':'Actual independent recomputation of supplied fictional teaching model data, not learner performance','originalFit':original,'freshFit':fresh,'admissibleK2Root':root,'checks':numeric_checks,'errors':[], 'limitations':['Residual magnitude is not a full uncertainty budget or a unique kinetic mechanism.','Volume-factor interval is only the stated volume-bound contribution.','Out-of-calibration absorbances are flagged, never converted into a validated concentration.','Occupancy assumes the supplied simple equilibrium binding rule and free ligand concentration; occupancy is not activation or clinical efficacy.','Process fresh/internal inputs, accepted output and energy have separate denominators and units.'], 'humanApproval':False,'humanTrial':False,'learnerPerformanceRecorded':False,'strictGain':0})
print(json.dumps({'exactProfiles':len(rows),'exactCases':len(by_case),'numericComparisons':len(numeric_checks),'errors':errors}))
