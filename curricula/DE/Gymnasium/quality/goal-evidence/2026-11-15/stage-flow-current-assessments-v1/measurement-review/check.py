import hashlib, itertools, json, math, pathlib
from datetime import datetime, timezone
import numpy as np

base=pathlib.Path(__file__).parent
candidate=pathlib.Path('tmp/physics-measurement-acquisition-repair-20261115-v1/new-assessments.json')
tasks=json.loads(candidate.read_text())
checks=[]
def check(name, actual, expected, atol=1e-7):
    assert np.allclose(actual,expected,atol=atol,rtol=0), (name,actual,expected)
    checks.append({'case':name,'actual':np.asarray(actual).tolist(),'expected':expected,'passed':True})

length=np.array([100.21,100.24,100.23,100.25,100.20])
L=length.mean()-.2
u=(length.max()-length.min())/2+.03
check('digital-length-mean-correction-uncertainty',[length.mean(),L,u],[100.226,100.026,.055])
check('unrounded-divided-length',[L/7,u/7],[14.2894285714286,.00785714285714])
temp=np.array([19.8,19.9,19.8,20.,19.9])
check('digital-temperature-correction-and-derived-uncertainty',[temp.mean(),temp.mean()+.3,(temp.max()-temp.min())/2+.1],[19.88,20.18,.2])
check('temperature-difference',[temp.mean()+.3-10,.2+.05],[10.18,.25])
check('analog-series-mean-half-range', [np.mean([100,100.5,100,99.5,100]),(100.5-99.5)/2,np.mean([20,20.5,20,19.5,20]),(20.5-19.5)/2], [100,.5,20,.5])

linear=[]
for name,x,y in [('cart',np.array([0,.5,1,1.5,2])**2,np.array([.05,.24,.86,1.84,3.26])),
                 ('spring',np.array([.05,.1,.15,.2,.25]),np.array([.53,.68,.79,.89,.98])**2)]:
    slope,intercept=np.polyfit(x,y,1)
    residual=y-(intercept+slope*x)
    linear.append({'case':name,'slope':slope,'intercept':intercept,'residuals':residual.tolist()})
    check(name+'-least-squares-normal-equations',[residual.sum(),(residual*x).sum()],[0,0])
check('cart-parameters',[linear[0]['intercept'],2*linear[0]['slope']],[.0465517241379,1.6045977011494])
check('spring-parameters',[39.4784/linear[1]['slope'],linear[1]['intercept']/linear[1]['slope']],[11.6889915319477,.0347515840587435])
check('spring-residuals-not-strictly-alternating',linear[1]['residuals'],[-.00534,.00729,.00012,-.00075,-.00132])

def euler(h,s,v,param,kind):
    trace=[[0,s,v]]
    for i in range(round(2/h)):
        a=param if kind=='constant' else -param*v
        s,v=s+h*v,v+h*a
        trace.append([(i+1)*h,s,v])
    return trace
models=[]
for case,h,s,v,param,kind,expected in [
    ('A',.5,1,.5,2,'constant',[5,4.5]),('A-finer',.25,1,.5,2,'constant',[5.5,4.5]),
    ('A-parameter',.25,1,.5,1,'constant',[3.75,2.5]),
    ('B',.5,0,4,1,'drag',[3.75,.25]),('B-finer',.25,0,4,1,'drag',[3.59954833984375,.40045166015625]),
    ('B-coarse',2,0,4,1,'drag',[8,-4]),('B-parameter',.25,0,4,.5,'drag',[5.251128673553467,1.3744356632232666])]:
    trace=euler(h,s,v,param,kind);check(case+'-endpoint',trace[-1][1:],expected)
    models.append({'case':case,'timeStep':h,'parameter':param,'trace':trace})
assert models[5]['trace'][-1][-1]<0 and 4*math.exp(-2)>0
check('continuous-reference',[4*math.exp(-2),4*(1-math.exp(-2))],[.5413411329464508,3.458658867053549])

rubric=[]
for t in tasks:
    score=t['examData']['scoring'];n=len(score['steps'])
    assert sum(s['points'] for s in score['steps'])==score['maxPoints']
    vectors=list(itertools.product(range(3),repeat=n))
    passing=[v for v in vectors if sum(v)>=score['passingPoints']]
    assert all(min(v)>=1 for v in passing)
    assert all(score['maxPoints']-s['points']<score['passingPoints'] for s in score['steps'])
    assert all('0 sobald eine wesentliche' in s['description'] and '0 when an essential' in s['description'] for s in score['steps'])
    rubric.append({'id':t['id'],'vectorsChecked':len(vectors),'passingPatterns':len(passing),
                   'missingEssentialMaximum':score['maxPoints']-2,'threshold':score['passingPoints'],
                   'minorErrorWithAllCoresIntactPasses':score['maxPoints']-1>=score['passingPoints']})
result={'at':datetime.now(timezone.utc).isoformat(),'reviewer':'root',
        'input':{'path':str(candidate),'sha256':hashlib.sha256(candidate.read_bytes()).hexdigest()},
        'numericChecks':checks,'independentLinearFits':linear,'explicitEulerTraces':models,'rubricCounterexamples':rubric,
        'limits':['Content/rubric mathematical review only; no learner results or effectiveness claim.',
                  'Python independently verifies Euler arithmetic; no actual spreadsheet program execution or recalculation acceptance is claimed.',
                  'Essential rubric conditions are written assessor instructions, not server-enforced per-part minima.']}
(base/'numeric-and-omission-checks.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'numericChecks':len(checks),'rubricScoreVectors':sum(r['vectorsChecked'] for r in rubric),'inputSha':result['input']['sha256']}))
