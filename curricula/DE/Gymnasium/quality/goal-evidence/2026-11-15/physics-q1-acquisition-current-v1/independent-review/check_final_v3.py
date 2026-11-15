"""Independent exact successor audit and integer-score counterexample proof."""
import json,hashlib,itertools,datetime
from pathlib import Path
O=Path(__file__).parent
V=[Path('tmp/physics-q1-current-acquisition-20261115-v'+str(i)) for i in (1,2,3)]
def read(p):return json.loads(p.read_text())
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def diff(a,b,path=''):
 if type(a)!=type(b):return [(path,a,b)]
 if isinstance(a,dict):
  assert a.keys()==b.keys(),('changed keys',path)
  return [q for k in a for q in diff(a[k],b[k],path+'.'+k)]
 if isinstance(a,list):
  assert len(a)==len(b),('changed list length',path)
  return [q for i,(x,y) in enumerate(zip(a,b)) for q in diff(x,y,path+'['+str(i)+']')]
 return [] if a==b else [(path,a,b)]
pinResults=[]
for folder in V:
 manifest=read(folder/'candidate-artifact-pins.json')
 for row in manifest['pins']:
  p=Path(row['path']);assert digest(p)==row['sha256'];assert p.stat().st_size==row.get('bytes',p.stat().st_size)
 pinResults.append({'manifest':str(folder/'candidate-artifact-pins.json'),'sha256':digest(folder/'candidate-artifact-pins.json'),'verifiedFilePins':len(manifest['pins'])})
t1,t2,t3=[read(p/'content-candidate.json')['tasks'] for p in V]
assert len(t1)==len(t2)==len(t3)==27
v12=[]
headerEnd='Die ausgewiesenen Punkte bleiben innerhalb der einzelnen Schritte; die Gesamtgrenze ist anschließend anzuwenden.\n'
for i,(a,b) in enumerate(zip(t1,t2)):
 for p,x,y in diff(a,b):
  if p in ('.examData.taskContent','.examData.taskContentEn'):
   assert i in (1,5)
  elif p in ('.examData.solutionContent','.examData.solutionContentEn'):
   assert x.split('\n\nBewertung:')[0].split('\n\nScoring:')[0]==y.split('\n\nDE-Schrittregel:')[0].split('\n\nEN step rule:')[0],(i,p)
  else:
   assert p.startswith('.examData.scoring.steps[') and p.endswith('].description'),(i,p)
   old=x.split(headerEnd)[-1] if headerEnd in x else x
   new=y.split('\nDE-Schrittregel:')[0]
   assert old==new,(i,p,'actual criterion changed')
  v12.append({'taskIndex':i,'field':p})
# Recompute every field delta without trusting the author's allow-list.
v23=[]
allowed={7:{'.examData.solutionContent','.examData.solutionContentEn'},13:{'.examData.taskContent','.examData.taskContentEn'},14:{'.examData.taskContent','.examData.taskContentEn'},16:{'.examData.taskContent','.examData.taskContentEn'},18:{'.examData.taskContent','.examData.taskContentEn'},21:{'.examData.taskContent','.examData.taskContentEn','.examData.solutionContent','.examData.solutionContentEn','.examData.scoring.steps[2].description'}}
for i,(a,b) in enumerate(zip(t2,t3)):
 for p,x,y in diff(a,b):
  assert p in allowed.get(i,set()),(i,p)
  v23.append({'taskIndex':i,'taskId':b['id'],'field':p,'before':x,'after':y})
declared=read(V[2]/'exact-v2-to-v3-delta.json')['fieldDeltas']
assert v23==declared and len(v23)==15
omission=[];vectors=0
for i,t in enumerate(t3):
 s=t['examData']['scoring'];steps=s['steps'];n=len(steps);m=sum(x['points'] for x in steps);p=s['passingPoints']
 assert m==s['maxPoints'] and p==m-2
 for step in steps:
  text=step['description'];assert step['points']==4
  assert 'höchstens 1 von 4 Punkten' in text and 'IN DIESEM SCHRITT' in text
  assert 'AT MOST 1 of 4 points in THIS STEP' in text
  assert 'no separate total cap' in text and 'Es gibt keine gesonderte Gesamtkappung' in text
  assert '3 bei einem isolierten kleinen' in text and '3 for one isolated minor' in text
 for j,step in enumerate(steps):
  scores=[sum(v)+c for c in (0,1) for v in itertools.product(range(5),repeat=n-1)]
  assert max(scores)==m-3<p;vectors+=len(scores)
  omission.append({'taskIndex':i,'step':step['id'],'integerVectors':len(scores),'maxWithEssentialOmission':max(scores),'passingPoints':p,'minorErrorTotal':m-1,'minorErrorPasses':m-1>=p})
 assert m-1>=p
assert len(omission)==84
r={'status':'independent-actual-exact-delta-and-score-check-pass-not-runtime-grader-acceptance','executedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputPins':pinResults,'finalContentSha256':digest(V[2]/'content-candidate.json'),'v1v2ChangedFields':v12,'v2v3ExactDeltas':v23,'allOtherTaskValuesIdentical':True,'omissionCases':omission,'totalLocalStepCases':len(omission),'enumeratedIntegerScoreVectors':vectors,'boundaryMeaning':'Given correct application of each explicit rubric cap, ordinary native step summation cannot pass an essential omission; this does not prove an AI grader will always recognize semantic omissions.','authorCheckerExecutedOrImported':False}
(O/'v3-delta-and-omission-checks.actual.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'verifiedManifests':len(pinResults),'v1v2ChangedFields':len(v12),'v2v3ChangedFields':len(v23),'localOmissionCases':len(omission),'integerVectors':vectors,'contentSha256':r['finalContentSha256']}))
