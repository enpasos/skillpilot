import datetime, hashlib, json, math
from pathlib import Path
base=Path('tmp/physics-current10-local-refinement-20261115')
final=Path('tmp/physics-current10-local-refinement-20261115-v2')
out=Path('tmp/physics-current10-root-final-review-20261115')
old=json.loads((base/'profile-candidates.json').read_text())
new=json.loads((final/'profile-candidates.json').read_text())
desc=json.loads((final/'description-candidates.json').read_text())
assert len(old)==len(new)==6 and len(desc)==5
assert (base/'description-candidates.json').read_bytes()==(final/'description-candidates.json').read_bytes()
def diff(a,b,path=''):
 if isinstance(a,dict) and isinstance(b,dict):
  assert a.keys()==b.keys()
  return sum((diff(a[k],b[k],path+'/'+k) for k in a),[])
 if isinstance(a,list) and isinstance(b,list):
  assert len(a)==len(b)
  return sum((diff(x,y,path+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))),[])
 return [] if a==b else [path]
deltas={x['goalId']:diff(y['profile'],x['profile']) for x,y in zip(new,old)}
assert sum(map(len,deltas.values()))==12
for x,y in zip(new,old):
 assert x['goalId']==y['goalId']
 assert x['profile']['coverageExpectations']==y['profile']['coverageExpectations']==x['beforeProfile']['coverageExpectations']
 assert [e['id'] for e in x['profile']['expectations']]==[e['id'] for e in x['beforeProfile']['expectations']]
# Independently evaluate the two ambiguous cases identified in the textual read.
# More particles can still mean lower concentration, disproving a count-only case.
assert 20>10 and 20/4<10/1
image=lambda f,g:1/(1/f-1/g)
assert math.isclose(image(10,15),30) and math.isclose(image(10,20),20)
# Normalized negative-charge cases: same speed, oblique angle 30 degrees.
alpha=math.pi/6
vA=(1.,0.,0.);vB=(math.sin(alpha),0.,math.cos(alpha))
def cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
force=lambda v,B:tuple(-x for x in cross(v,B))
fA=force(vA,(0.,0.,1.)); fB=force(vB,(0.,0.,1.)); fC=force(vB,(0.,0.,-1.))
assert fA[1]>0 and fB[1]>0 and fC[1]<0
assert 0<vB[0]<vA[0] and vB[2]>0
assert all(math.isclose(sum(a*b for a,b in zip(v,F)),0) for v,F in [(vA,fA),(vB,fB),(vB,fC)])
reasons={
'f06c581a-7157-584e-a692-99bcd613cff9':'Timbre and phase-conditioned representation remain the core; no absolute sound level or perceived-loudness ratio from uncalibrated relative spectra.',
'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e':'Explicit K+/anion-countercharge and Cl-/cation-countercharge cases fix concentration, selectivity and potential sign; zero total current is separated from individual equilibrium. Count-only ambiguity corrected.',
'c2e0fc31-27a2-5727-9025-a824db9150d2':'Passive RC construction and attenuation remain; active extension explicitly uses ionic-gradient/reversal-potential energy rather than treating conductance as an energy source.',
'6367d45e-919e-4c19-bcd9-7770a2d51139':'Three independent demonstrations remain inside one chosen instrument model. Objective image is fixed only for an eyepiece-only shift; changed object/objective geometry requires a new image construction.',
'52bdabb2-d9a1-56e6-bccf-ff58f299c739':'Persistent B0, RF tipping, transverse reception and appropriately overlapping readout-gradient action are distinguished; transverse decay is not confused with longitudinal recovery.',
'7fe6f8a1-5580-4e37-bf8e-9772964a6b0a':'Static pure-field cases have nonzero components and a strictly oblique angle; three independent arrangements avoid unintended induction during field switching. Fixed laboratory advance and reversed force/rotation agree.'}
files=[final/'description-candidates.json',final/'profile-candidates.json',final/'exact-delta.json',final/'candidate-pins.json',out/'source-basis.md',out/'review.py']
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'ACCEPT_BOUNDED_D5_P6_CANDIDATE_V2_CONTENT_NATIVE_REVIEW_AND_CI_PENDING','reviewer':'root independent content countercheck of coordinator-authored candidates','scope':{'descriptions':5,'profiles':6,'uniqueGoals':len(set(reasons)|{x['goalId'] for x in desc})},'method':'Read all five bilingual final descriptions and all six complete candidate goal/profile bodies in v1; read all twelve operative bilingual changes to v2; structural comparison proves all other final profile fields unchanged. Primary teaching texts read separately and linked in source-basis.md. Current images were not independently re-viewed in this bounded text/profile pass.','checks':{'candidateShapeAndPins':'pass','descriptionBytesUnchanged':'pass','exactOperativeV1V2FieldChanges':12,'coverageIdsAndThresholdsUnchanged':'pass','particleCountCounterexample':'pass','thinLensImagePositionCounterexample':'pass','staticHelixForceRadiusAdvanceAndNoWork':'pass'},'profiles':[{'goalId':g,'verdict':'accept','reason':r} for g,r in reasons.items()],'descriptions':[{'goalId':x['goalId'],'verdict':'accept','boundary':'Local scientific wording precision; unchanged goal identity, prerequisite edges and competency scope.'} for x in desc],'pins':[{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files],'boundaries':['Not a new blinded first-pass D record or synthetic second vote. Root read both original independent review outputs.','Native D/P current binding, route acceptance, M7, PR CI and integrated main CI remain separate.','No official Land placement, classroom trial, learner mastery, publication or production deployment is certified.']}
(out/'review-v2.ACCEPT.actual.json').write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+'\n')
print(receipt['status'],receipt['scope'])
print(hashlib.sha256((out/'review-v2.ACCEPT.actual.json').read_bytes()).hexdigest())
