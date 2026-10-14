# Apache-2.0. Exact Decimal + independent integer-grid author checks.
import hashlib, json
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP, ROUND_FLOOR, ROUND_CEILING
BASE=Path('tmp/cross-subject-requires/decimal-rounding-v4-20261013')
facts=json.loads((BASE/'learner-facts.author-candidate.json').read_text())
teacher=json.loads((BASE/'teacher-grading.author-candidate.json').read_text())
places={'hundredths':2,'thousandths':3,'ten_thousandths':4}
rows=[]; rejected={k:[] for k in ['always_up','always_down','truncate','double_round_one_finer','wrong_place_one_coarser']}
for fact in facts['cases']:
    key=next(c for c in teacher['cases'] if c['id']==fact['id'])
    p=places[fact['place']]; x=Decimal(fact['number']); q=Decimal(1).scaleb(-p)
    decimal=x.quantize(q,rounding=ROUND_HALF_UP)
    # Independently compute nearest/ties-up with integer quotient/remainder.
    whole,fraction=fact['number'].split('.'); digits=len(fraction)
    numerator=int(whole+fraction); divisor=10**(digits-p)
    lower_ticks,remainder=divmod(numerator,divisor)
    chosen_ticks=lower_ticks+(2*remainder>=divisor)
    integer_grid=Decimal(chosen_ticks).scaleb(-p)
    assert decimal==integer_grid==Decimal(key['expectedRoundedValue'])
    assert key['decimalPlaces']==p
    lower=x.quantize(q,rounding=ROUND_FLOOR); upper=x.quantize(q,rounding=ROUND_CEILING)
    assert Decimal(key['lowerNeighbor'])==lower and Decimal(key['upperNeighbor'])==upper
    assert Decimal(key['tailInTargetSteps'])==(x-lower)/q
    assert key['exactTie']==(2*remainder==divisor)
    strategies={'always_up':upper,'always_down':lower,'truncate':lower,
        'double_round_one_finer':x.quantize(q/10,rounding=ROUND_HALF_UP).quantize(q,rounding=ROUND_HALF_UP),
        'wrong_place_one_coarser':x.quantize(q.scaleb(1),rounding=ROUND_HALF_UP)}
    for name,value in strategies.items():
        assert Decimal(key['wrongStrategyOutputs'][name])==value
        if value!=decimal: rejected[name].append(fact['id'])
    rows.append({'id':fact['id'],'input':fact['number'],'decimalPlaces':p,'nearestTiesUp':format(decimal,f'.{p}f'),
        'independentIntegerGrid':format(integer_grid,f'.{p}f'),'lowerNeighbor':str(lower),'upperNeighbor':str(upper),
        'exactTailNumerator':remainder,'exactTailDenominator':divisor,'teacherSolutionMatches':True,
        'strategyOutputs':{k:str(v) for k,v in strategies.items()}})
assert all(rejected.values())
assert 'decimal-case-004' in rejected['always_up']
assert 'decimal-case-005' in rejected['always_up']
assert Decimal(next(r for r in rows if r['id']=='decimal-case-005')['nearestTiesUp'])==0
assert 'decimal-case-006' in rejected['double_round_one_finer']
assert 'decimal-case-001' in rejected['always_down'] and 'decimal-case-001' in rejected['truncate']
assert 'decimal-case-002' in rejected['wrong_place_one_coarser']
print(json.dumps({'schemaVersion':4,'status':'PASS exact author arithmetic and explicit counterstrategy checks; no independent scientific or learner approval',
    'cases':rows,'rejectedStrategiesByCase':rejected,'freshLowerAndZeroUnpromptedDesigns':['decimal-case-004','decimal-case-005'],
    'methods':['Python Decimal ROUND_HALF_UP','independent integer-grid nearest/ties-up quotient/remainder'],
    'bindings':{n:'sha256:'+hashlib.sha256((BASE/n).read_bytes()).hexdigest() for n in ['learner-facts.author-candidate.json','teacher-grading.author-candidate.json']},
    'limit':'Rejects deliberately instantiated numerical strategies on this example bank; actual learner explanations and exposure remain to be judged, and six examples are not a required task count.'},ensure_ascii=False,indent=2))
