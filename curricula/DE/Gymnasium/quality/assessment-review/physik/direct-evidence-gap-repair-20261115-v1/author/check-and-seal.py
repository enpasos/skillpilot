import datetime
from fractions import Fraction as F
import hashlib
import json
import math
from pathlib import Path

root=Path(__file__).resolve().parent
candidate=json.loads((root/'candidate.json').read_text())
inputs=json.loads((root/'exact-inputs.json').read_text())
now=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
checks=[]
def exact(name,actual,expected):
    assert actual==expected,(name,actual,expected)
    checks.append({'name':name,'actual':str(actual),'expected':str(expected),'pass':True})
k=F(9*10**9)
q1=F(4,10**9); q2=-F(3,10**9); r=F(1,5)
force=k*abs(q1*q2)/r**2
exact('A original force magnitude N',force,F(27,10**7))
exact('A changed force magnitude N',k*abs(q1*(-q2))/(2*r)**2,F(675,10**9))
exact('A inverse-square ratio',(k*abs(q1*q2)/(2*r)**2)/force,F(1,4))
exact('A source field N/C',(-force)/q2,F(900))
exact('A fresh positive test force N',F(900)*F(1,10**9),F(9,10**7))
exact('B first field N/C',-F(6,10**6)/F(2,10**9),F(-3000))
exact('B second field N/C',F(9,10**6)/-F(3,10**9),F(-3000))
exact('B negative test force N',-F(5,10**9)*F(-3000),F(15,10**6))
exact('B inconsistent field N/C',F(3,10**6)/F(1,10**9),F(3000))
exact('B consistent corrected force N',F(1,10**9)*F(-3000),-F(3,10**6))
rayleigh=[]
for d in [F(25,10000),F(3,1000),F(35,10000)]:
    theta=F(122,100)*F(550,10**9)/d
    rayleigh.append({'referenceDMetres':str(d),'thetaRadiansExact':str(theta),'thetaRadians':float(theta),'thetaArcminutes':float(theta)*180/math.pi*60})
assert math.isclose(rayleigh[1]['thetaRadians'],2.2366666666666668e-4)
assert rayleigh[2]['thetaRadians']<rayleigh[1]['thetaRadians']<rayleigh[0]['thetaRadians']
checks.append({'name':'Rayleigh references independently computed from formula','values':rayleigh,'pass':True,'notPersonalMeasurements':True})
matrices=[]
for item,goal in zip(inputs['items'],candidate['newAssessments']):
    p=item['goal']; e=goal['examData']; s=e['scoring']; expected=p['id']
    assert goal['requires']==[expected] and e['coveredGoalIds']==[expected]
    assert goal['applicability']==p['applicability']
    assert all(e[key].strip() for key in ['taskContent','taskContentEn','solutionContent','solutionContentEn'])
    assert s['passingPoints']==s['maxPoints']==sum(x['points'] for x in s['steps'])
    rows=[]
    for step in s['steps']:
        assert ' / EN: ' in step['description']
        # This is an explicit author desk-grading counterexample, not a real learner submission.
        # The independent reviewer must decide whether content really forces the missing performance.
        rows.append({'omittedRequiredPerformance':step['id'],
          'answerSketch':'All other performances are correct; the full performance named in this criterion is missing.',
          'criterionTextReadInFull':step['description'],
          'awardedPoints':{x['id']:(0 if x['id']==step['id'] else x['points']) for x in s['steps']},
          'sum':s['maxPoints']-step['points'],'threshold':s['passingPoints'],
          'authorExpectedDisposition':'FAIL_MISSING_REQUIRED_PERFORMANCE',
          'notIndependentOrLearnerEvidence':True})
    matrices.append({'assessmentId':goal['id'],'fullPrimaryPRead':True,
        'requiredPExpectationIds':item['positiveEvidence']['profile']['coverageExpectations']['requiredExpectationIds'],
        'minimumIndependentDemonstrations':2,'authorCounterexamples':rows})
numeric={'status':'AUTHOR_NUMERIC_AND_STRUCTURE_CHECK_PASS','executedAt':now(),'checks':checks,
         'boundary':'Exact authored numeric references and structural assertions only; no independent content review, own experiment, native curriculum validation or learner outcome.'}
(root/'numeric-and-structure.actual.json').write_text(json.dumps(numeric,ensure_ascii=False,indent=2)+'\n')
(root/'author-required-performance-matrix.json').write_text(json.dumps(matrices,ensure_ascii=False,indent=2)+'\n')
manifest={'status':'SEALED_AUTHOR_INPUT_PENDING_INDEPENDENT_REVIEW','sealedAt':now(),'pins':[]}
for f in sorted(root.iterdir()):
    if f.is_file() and f.name!='sealed-input-manifest.json':
        manifest['pins'].append({'path':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size})
(root/'sealed-input-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checks':len(checks),'rubricCounterexamples':sum(len(x['authorCounterexamples']) for x in matrices),'sealedFiles':len(manifest['pins']),
                 'manifestSha256':hashlib.sha256((root/'sealed-input-manifest.json').read_bytes()).hexdigest(),'time':now()},indent=2))
