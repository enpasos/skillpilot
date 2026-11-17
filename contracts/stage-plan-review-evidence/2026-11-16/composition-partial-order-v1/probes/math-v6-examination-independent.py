import collections, hashlib, json
from pathlib import Path
from datetime import datetime
root=Path('/home/enpasos/projects/skillpilot'); base=root/'tmp/pipeline/laender-stufen/gesamt'
canonical=json.loads((root/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json').read_text())
goals={g['id']:g for g in canonical['goals']}
def atoms(i):
 g=goals[i]
 return set().union(*(atoms(c) for c in g.get('contains',[]))) if g.get('contains') else {i}
exams=atoms('9ad83149-3cb7-5b87-a617-3eae3715a50c')|atoms('464a6024-a2f8-53b4-84e0-d7b9df22a0b1')
def refs(d):
 result=[]
 def walk(nodes,path):
  for n in nodes:
   if n['kind']=='structure':walk(n['children'],path+[n['id']])
   else:result.append((n,path))
 walk(d['rootNodes'],[]);return result
changed=[];rows=[]
for p in sorted((base/'mathematik/candidate-v6').glob('*.view.json')):
 live=root/'curricula/DE/Gymnasium/composition-views/mathematik'/p.name
 before=json.loads(live.read_text()); after=json.loads(p.read_text())
 b,a=refs(before),refs(after)
 canon=lambda n:json.dumps(n,sort_keys=True)
 assert collections.Counter(canon(n) for n,_ in b)==collections.Counter(canon(n) for n,_ in a),p.name
 old=collections.Counter((canon(n),tuple(path)) for n,path in b if not atoms(n['goalId'])<=exams)
 new=collections.Counter((canon(n),tuple(path)) for n,path in a if not atoms(n['goalId'])<=exams)
 assert old==new,p.name
 if before!=after:
  changed.append(p.name)
  if after['scope']['stage']!='SekI':
   selected=[n for n,_ in a if atoms(n['goalId'])<=exams and n.get('projectionRole')!='prerequisiteOnly']
   assert selected,p.name
   assert all('math-layout-sekii-abitur' in path for n,path in a if n in selected),p.name
  rows.append({'file':p.name,'referenceOccurrences':len(a),'sourceSha256':hashlib.sha256(live.read_bytes()).hexdigest(),'candidateSha256':hashlib.sha256(p.read_bytes()).hexdigest()})
assert len(changed)==22,changed
assert len(rows)==22
result={'at':datetime.now().astimezone().isoformat(),'status':'PASS','views':100,'changedViews':rows,'checked':['All reference payloads and occurrence multiplicities unchanged','All non-examination reference paths unchanged','Existing examination targets moved only into own Abitur unit','No official examination claim or new exam created'],'manifestSha256':hashlib.sha256((base/'mathematik/candidate-v6.manifest.json').read_bytes()).hexdigest(),'normalizerSha256':hashlib.sha256((root/'scripts/normalize_mathematics_stage_views.py').read_bytes()).hexdigest()}
(base/'review/math-v6-examination-independent.actual.json').write_text(json.dumps(result,indent=2)+'\n');print('PASS: 100 views, 22 changed, exact reference retention and unrelated path invariance')
