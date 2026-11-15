"""Seal one coherent v3 after the independent0-26 content pass closed its findings."""
from pathlib import Path
import json,hashlib,math,copy,datetime
P=Path(__file__).parent;V1=Path('tmp/physics-q1-current-acquisition-20261115-v1');V2=Path('tmp/physics-q1-current-acquisition-20261115-v2')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
for parent in [V1,V2]:
 for pin in json.loads((parent/'candidate-artifact-pins.json').read_text())['pins']:
  assert sha(pin['path'])==pin['sha256'],pin
D=json.loads((P/'content-candidate.json').read_text());old=json.loads((V2/'content-candidate.json').read_text())
R=json.loads((V2/'review-pack.json').read_text());R['status']='draft-author-candidate-v3-final-pending-independent-delta-recheck'
D['status']=R['status']
allowed={7:{'solutionContent','solutionContentEn'},13:{'taskContent','taskContentEn'},14:{'taskContent','taskContentEn'},16:{'taskContent','taskContentEn'},18:{'taskContent','taskContentEn'},21:{'taskContent','taskContentEn','solutionContent','solutionContentEn','scoring'}}
differences=[];integer=[]
def leaves(a,b,path=''):
 if isinstance(a,dict) and isinstance(b,dict):
  assert set(a)==set(b),(path,set(a)^set(b))
  return sum((leaves(a[k],b[k],path+'.'+k) for k in a),[])
 if isinstance(a,list) and isinstance(b,list):
  assert len(a)==len(b),path
  return sum((leaves(x,y,path+f'[{i}]') for i,(x,y) in enumerate(zip(a,b))),[])
 return [] if a==b else [{'field':path,'before':a,'after':b}]
for index,(a,b,r) in enumerate(zip(old['tasks'],D['tasks'],R['reviews'])):
 for k in a:
  if k!='examData':assert a[k]==b[k],(index,k)
 for k in a['examData']:
  if k not in allowed.get(index,set()):assert a['examData'][k]==b['examData'][k],(index,k)
 if index==21:
  for j,(sa,sb) in enumerate(zip(a['examData']['scoring']['steps'],b['examData']['scoring']['steps'])):
   assert sa['id']==sb['id'] and sa['points']==sb['points']==4
   if j!=2:assert sa==sb
  c=r['essentialClaims'][2]
  c['criterionDe']='Unabhängigen magnetischen Vergleich mithilfe der gegebenen qualitativen Richtungsregel, des Ladungsvorzeichens und des Geschwindigkeits-/Arbeitsunterschieds begründen; ein formales Kreuzprodukt wird nicht verlangt.'
  c['criterionEn']='Justify the independent magnetic comparison using the supplied qualitative direction rule, charge sign and speed/work distinction; a formal cross product is not required.'
 for item in leaves(a,b):differences.append({'taskIndex':index,'taskId':a['id'],**item})
 sc=b['examData']['scoring'];maximum=sc['maxPoints'];passing=sc['passingPoints'];assert maximum==4*len(sc['steps']) and passing==maximum-2
 assert a['examData']['scoring']['maxPoints']==maximum and a['examData']['scoring']['passingPoints']==passing
 for s in sc['steps']:
  assert s['points']==4 and 'höchstens 1 von 4' in s['description'] and 'AT MOST 1 of 4' in s['description']
  possible=[local+other for local in [0,1] for other in range(maximum-4+1)]
  assert max(possible)==maximum-3<passing and all(total<passing for total in possible)
  integer.append({'taskId':b['id'],'stepId':s['id'],'localMissingEssentialAllowed':[0,1],'otherStepSumRange':[0,maximum-4],'enumeratedCombinations':len(possible),'maxSum':max(possible),'pass':passing,'omissionCannotPass':True,'minorErrorAllCoresSum':maximum-1,'minorErrorPasses':maximum-1>=passing})
 for k in ['solutionContent','solutionContentEn']:
  assert 'GESAMTPUNKTZAHL' not in b['examData'][k] and 'cap the TOTAL' not in b['examData'][k]
assert len(differences)==15,len(differences)
assert len(integer)==84
assert {x['taskIndex'] for x in differences}=={7,13,14,16,18,21}
numeric=[{'label':'Fadenstrahlrohr B full value','actual':900/(.001**2*.0715**2),'unit':'C/kg'},
 {'label':'Fadenstrahlrohr B four significant figures','actual':format(900/(.001**2*.0715**2),'.3e'),'expected':'1.760e+11'},
 {'label':'RC charge initial','actual':(12-0)/200e3,'expected':60e-6,'unit':'A'},
 {'label':'RC discharge positive initial','actual':-12/200e3,'expected':-60e-6,'unit':'A'},
 {'label':'RC discharge negative initial doubleR','actual':-(-12)/400e3,'expected':30e-6,'unit':'A'},
 {'label':'RC positive charging sensor mean','actual':4e-6/.1,'expected':40e-6,'unit':'A'},
 {'label':'RC own-current possible finite charge window start','actual':-2*math.log((40e-6*.1)/(60e-6*2*(1-math.exp(-.1/2)))),'unit':'s','note':'A nonnegative start exists; physical consistency check, not a claimed measured time.'}]
for n in numeric:
 if 'expected' in n:assert n['actual']==n['expected'] or isinstance(n['actual'],float) and math.isclose(n['actual'],n['expected'],rel_tol=1e-12)
numeric[-1]['passed']=numeric[-1]['actual']>=0
assert numeric[-1]['passed']
for name,value in [
 ('content-candidate.json',D),('review-pack.json',R),
 ('exact-v2-to-v3-delta.json',{'status':'author-successor-pending-independent-exact-delta-review','baseCandidate':{'path':str(V2/'content-candidate.json'),'sha256':sha(V2/'content-candidate.json')},'changedTaskIndices':[7,13,14,16,18,21],'fieldDeltas':differences,'allOtherTaskValuesIdentical':True}),
 ('final-author-checks.json',{'status':'author-checks-not-independent-content-acceptance','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'v1AndV2SealsUnchanged':True,'taskCount':27,'wholeGoalCount':35,'all84OmissionIntegerChecks':integer,'newNumericalChecks':numeric,'previous63NumericalChecksReference':{'path':str(V1/'author-checks.json'),'sha256':sha(V1/'author-checks.json')},'noNewOrdinaryGoals':True,'noActiveWrites':True})]:
 (P/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
print('PASS: exact15-field v2→v3 delta across6 tasks; all84 direct-score omission checks;7 numeric/current-context checks; v1/v2 unchanged.')
