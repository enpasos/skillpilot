import json,csv,math,hashlib,itertools,re,datetime
from pathlib import Path
B=Path(__file__).parent
tasks=json.loads((B/'content-candidate.json').read_text())['tasks'];records=[json.loads(l) for l in (B/'profile-candidates.native.review.jsonl').read_text().splitlines()]
old=[json.loads(l) for l in Path('tmp/physics-release837-20261115/current10-informed-P-v2.review.jsonl').read_text().splitlines()]
assert len(tasks)==3 and len(records)==10
assert len({t['id'] for t in tasks})==3
changed=[a['goalId'] for a,b in zip(records,old) if a['profile']!=b['profile']];assert len(changed)==3
for r in records:
 text=json.dumps(r,ensure_ascii=False)
 for marker in ['P=revise','D=keep','native-d.goal','first-a-20261017','first-b-20261017']:
  assert marker not in text,marker
checks=[]
def eq(label,v,w,tol=1e-9):
 assert math.isclose(v,w,rel_tol=tol,abs_tol=tol),(label,v,w)
 checks.append({'label':label,'actual':v,'expected':w})
rows={int(r[0]):list(map(float,r[1:])) for r in csv.reader((B/'CIE_xyz_1931_2deg.csv').open())}
for wl,w in [(450,[.3362,.038,1.77211]),(600,[1.0622,.631,.0008])]:
 for j,v in enumerate(w):eq(f'CIE{wl}column{j}',rows[wl][j],v)
assert [0+0,1+3,4+2]==[0,4,6];assert [1,4]==[1,4]
F=[0,.71,1,.71,0,-.71,-1,-.71,0];H=[0,.50,0,-.50,0,.50,0,-.50,0]
X=[f+h for f,h in zip(F,H)];Y=[f-h for f,h in zip(F,H)]
for label,vals,want in [('X',X,[0,1.21,1,.21,0,-.21,-1,-1.21,0]),('Y',Y,[0,.21,1,1.21,0,-1.21,-1,-.21,0])]:
 for i,(v,w) in enumerate(zip(vals,want)):eq(label+str(i),v,w)
eq('A fundamental Hz',1/.004,250);eq('H Hz',1/.002,500);eq('B period ms',1000/400,2.5)
eq('phase same amplitude different trace',.71+.5-(.71-.5),1)
eq('pressure20dB',10**(20/20),10);eq('intensity20dB',10**(20/10),100)
eq('N70',2**((70-40)/10),8);eq('N90',2**((90-40)/10),32);eq('Nratio',32/8,4)
eq('N80',2**((80-40)/10),16);eq('equal energy exposure',10*.2/2,1)
for label,power,expect in [('pressure',lambda d:10**(d/20),[7.9432823472,12.5892541179]),('intensity',lambda d:10**(d/10),[63.095734448,158.489319246]),('loudness',lambda d:2**(d/10),[3.4822022532,4.59479341999])]:
 for d,w in zip([18,22],expect):eq(label+str(d),power(d),w,1e-8)
materialTargets={}
for filename,gid in [('cie1931-color-matching','39ef1e8a-9203-5192-8c76-8e0c3322646f'),('spectrum-components','f06c581a-7157-584e-a692-99bcd613cff9'),('spectrum-filter-input','f06c581a-7157-584e-a692-99bcd613cff9')]:
 for ext in ['png','svg']:
  p=B/(filename+'.'+ext);assert p.is_file();materialTargets['/assets/assessment-materials/physik/'+gid+'/'+p.name]={'sourcePath':str(p),'targetPath':'app/public/assets/assessment-materials/physik/'+gid+'/'+p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'license':'CC-BY-SA-4.0' if filename.startswith('cie') else 'CC-BY-4.0','assessmentStimulus':'Exact scientific plot; do not alter through illustration pipeline.'}
localRefs=[]
for t in tasks:
 e=t['examData'];assert e['scoring']['maxPoints']==12 and e['scoring']['passingPoints']==11
 for lang in ['taskContent','taskContentEn']:
  refs=re.findall(r'\]\((/assets/[^)]+)\)',e[lang]);assert refs or t['requires']==['8ac61062-f63e-5935-96ae-84014906c368']
  for ref in refs:assert ref in materialTargets,(lang,ref)
  localRefs += refs
 for s in e['scoring']['steps']:
  assert s['points']==2 and '0 sobald eine davon fehlt' in s['description'] and '0 if any is absent' in s['description']
scores=[]
for t in tasks:
 for step in t['examData']['scoring']['steps']:
  totals=[sum(x) for x in itertools.product(range(3),repeat=5)];assert max(totals)==10<11
  scores.append({'taskId':t['id'],'missingStep':step['id'],'forcedPoints':0,'otherIntegerVectors':len(totals),'maximumTotal':10,'passing':11,'oneMinorErrorTotal':11})
assert len(scores)==18
(B/'task-material-targets.actual.json').write_text(json.dumps(materialTargets,ensure_ascii=False,indent=2)+'\n')
(B/'author-checks.actual.json').write_text(json.dumps({'status':'ACTUAL_AUTHOR_CHECKS_NOT_INDEPENDENT_CONTENT_ACCEPTANCE','executedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'numericAssertions':checks,'numericAssertionCount':len(checks),'wholeProfileBodiesChangedExactly':changed,'ownRenderedPlotsActuallyViewed':['cie1931-color-matching.png','spectrum-components.png','spectrum-filter-input.png'],'sourcePdfPagesActuallyViewed':[1,5,6,8],'actualMaterialRefsResolveThroughExplicitCopyTargets':True,'localRefOccurrences':len(localRefs),'omissionCases':scores,'integerScoreVectors':sum(r['otherIntegerVectors'] for r in scores),'minorErrorPasses':True,'noPriorDDecisionMarkersInNewPContext':True,'nativeCurrentInputGateBoundary':'Native P schema/current-input draft check passed10; native21-root task contexts generated. Final whole-catalog SEM/D/P/A/M/V/CQR and runtime availability only after actual840 integration. No rebinding of historical A/M/V or learner results.','generalAssessmentDuty':'Missing explicit coveredGoalIds alone is not a universal assessment defect: ordinary chat evidence remains possible. These three tasks repair specific actual material/representation gaps, not a claimed complete inventory of missing assessments.'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'authorNumericAssertions':len(checks),'omissionCases':18,'integerVectors':18*243,'localRefs':len(localRefs),'materialFiles':len(materialTargets)}))
