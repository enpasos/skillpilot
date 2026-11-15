"""Own reviewer calculations; reads only the explicitly authorized content pack."""
import json, hashlib
from fractions import Fraction as Q
from pathlib import Path

root = Path('/home/enpasos/projects/skillpilot')
pack = root / 'tmp/math-v7-final-current2-activation-20261115/current-content-only.json'
assert hashlib.sha256(pack.read_bytes()).hexdigest() == 'b49dbdd220fde1618ec31888d8ee0bd799e90cadaa3c9265e158c8c023de7913'
j = json.loads(pack.read_text())
ps = {p['id']: p for p in j['prerequisiteGoalContent']}

def closure(starts):
    seen, active = set(), set()
    def visit(i):
        assert i in ps, ('unresolved', i)
        assert i not in active, ('cycle', i)
        if i in seen:
            return
        active.add(i)
        for r in ps[i].get('requires', []):
            visit(r)
        active.remove(i)
        seen.add(i)
    for i in starts:
        visit(i)
    return seen

preparation = []
for g in j['goals']:
    c = closure(g['canonicalContext']['requires'])
    preparation.append({'goalId':g['goalId'], 'distinctPrerequisiteCount':len(c),
                        'missingReferences':[], 'cycles':[]})
assert set.union(*(closure(g['canonicalContext']['requires']) for g in j['goals'])) == set(ps)

exp = []
for name, a, b in [('f',Q(2),Q(3)),('g',Q(1,2),Q(-2)),
                   ('positive-decay',Q(1,3),Q(3)),('negative-growth-base',Q(2),Q(-3)),
                   ('negative-decay-base',Q(1,3),Q(-3)),
                   ('fresh-negative-decay',Q(4,9),Q(-7,2)),
                   ('fresh-negative-growth-base',Q(3,2),Q(-5,3))]:
    vals = {str(x):str(b*a**x) for x in [-2,-1,0,1,2]}
    increasing = (b>0 and a>1) or (b<0 and a<1)
    exp.append({'case':name,'a':str(a),'b':str(b),'exactValues':vals,
                'monotonicity':'strictly increasing' if increasing else 'strictly decreasing',
                'reason':'For h>0, sign(F(x+h)-F(x))=sign(b)*sign(a^h-1), since a^x>0.'})
assert Q(-2)*Q(1,2)**(-1) == -4
assert Q(-2)*Q(1,2) == -1
assert Q(-4)*Q(3)**(-2) == Q(-4,9)

omissions = []
for a in j['assessmentContent']:
    score = a['examData']['scoring']
    assert score['maxPoints'] == sum(s['points'] for s in score['steps']) == 20
    assert score['passingPoints'] == 19
    for s in score['steps']:
        omissions.append({'assessmentId':a['id'],'blockId':s['id'],
                          'counterfactual':'one expressly required core missing or mathematically wrong; all other blocks perfect',
                          'maximumTotalUnderWrittenRubric':20-s['points']+2,
                          'passes':20-s['points']+2>=score['passingPoints']})
    assert all(not x['passes'] for x in omissions if x['assessmentId']==a['id'])

results = {
    'inputSHA256':hashlib.sha256(pack.read_bytes()).hexdigest(),
    'prerequisites':preparation,
    'allSuppliedPrerequisitesInUnion':len(ps),
    'exponentialExactCalculations':exp,
    'exponentialCasesByReasoning':[
        'For a>0,a!=1,b!=0, a^x>0 and f(0)=b. Hence the range is positive or negative according to b, with no zero.',
        'For a>1, a^x tends to 0 as x tends to minus infinity; for 0<a<1, it tends to 0 as x tends to plus infinity. Multiplication by negative b changes the side of approach, not that x-direction.',
        'The four monotonicity regimes require both a and b. For example -3*(1/3)^0=-3 and -3*(1/3)^1=-1, and the arbitrary-h sign proof establishes increase everywhere.',
        '5*1^x=5 and 0*2^x=0 are constant. 2*(-3)^x is not real at x=1/2, so it does not define a real function on all R.',
        'Changing only -2 to +2 reflects g across the x-axis; the new values at x=-1,0,1 are 4,2,1. It is positive and strictly decreasing.'
    ],
    'monotonicityOwnProofs':[
        'Write x=y+h with h>0. Then x^3-y^3=h*(3*(y+h/2)^2+h^2/4)>0, because the h^2/4 summand is strictly positive. This proves strict increase without using a false derivative converse.',
        'For k=-x^3 the same difference is strictly negative. f_prime(0)=k_prime(0)=0, so both proposed strict converses fail.',
        'For every epsilon>0, f(-epsilon)=-epsilon^3<0=f(0)<epsilon^3=f(epsilon). Such points exist in every neighbourhood: no local maximum or minimum at 0. A single fixed distant sample pair would not by itself prove this.',
        'On [1,3], x^2 and -x^2 are continuous and differentiable inside; 2x>0 and -2x<0 on (1,3). The strict conclusions hold on the closed interval.',
        'Why interval is essential: on D=(-2,-1) union (1,2), set H(x)=x on the left component and H(x)=x-10 on the right. H_prime=1 on D, but H(-3/2)=-3/2>H(3/2)=-17/2; hence H is not increasing on all D.',
        'Why endpoint continuity matters for a closed-interval version: set J(1)=100 and J(x)=x for 1<x<=3. The interior derivative is 1 but J is not increasing on [1,3]. The authored u,v check explicitly includes continuity.'
    ],
    'singleCoreOmissionBounds':omissions,
    'digitalOmissionBounds':{
        'noDigitalDisplayMaximum':16,
        'missingOneEssentialDigitalComponentMaximum':18,
        'passingPoints':19,
        'enforcementScope':'These bounds follow the written content rubric; no runtime or server enforcement was inspected.'
    }
}
Path(__file__).with_name('independent-calculations.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'prerequisites':preparation,'union':len(ps),'omissionCounterfactuals':len(omissions),'allOmissionsFail':all(not x['passes'] for x in omissions)},ensure_ascii=False))
