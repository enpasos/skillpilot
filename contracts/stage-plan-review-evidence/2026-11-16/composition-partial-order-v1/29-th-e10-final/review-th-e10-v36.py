from pathlib import Path
from collections import deque
import json,hashlib,datetime
ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=ROOT/'tmp/pipeline/laender-stufen/gesamt/review/th-e10-v36';OUT.mkdir(exist_ok=True)
canon=list((ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json'))
goals={g['id']:g for p in canon for g in json.loads(p.read_bytes())['goals']}
files=sorted((ROOT/'curricula/DE/Gymnasium/composition-views/physik').glob('de-th-*.view.json'))
primary=[ROOT/'curricula/DE/Gymnasium/input/TH/LP_GY_Physik_2012.pdf',ROOT/'tmp/pipeline/laender-stufen/gesamt/review/physics-lower-original-sources/th-gymnasiale-oberstufe-1.pdf']
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(primary[0])=='414be5ac7af13a1cfa33f96d9ca3c50f83c1f1cce4abe61b8e62faea1a24ed8d'
assert sha(primary[1])=='217746f21a858daf3f122159535afde8d71b53e8adf04cdf438123983a2be908'
paths=canon+files+primary;before={str(p.relative_to(ROOT)):sha(p)for p in paths}
tide='37013646-f13a-5faf-954c-940f2fd7502f';task='b34f3e03-bbe7-5ede-941c-3f26c9b07bb8'
assert goals[task]['requires']==[tide]and goals[task]['examData']['coveredGoalIds']==[tide]
def witness(start,end):
 queue=deque([[start]]);seen={start}
 while queue:
  path=queue.popleft()
  if path[-1]==end:return path
  for r in goals[path[-1]].get('requires',[]):
   r=r.split(':')[-1]
   if r not in seen:seen.add(r);queue.append(path+[r])
def walk(nodes):
 for node in nodes:
  yield node
  yield from walk(node.get('children',[]))
def expand(g):
 children=goals[g].get('contains',[])
 return {a for c in children for a in expand(c.split(':')[-1])}if children else {g}
rows=[];unexplained=[]
for file in files:
 view=json.loads(file.read_bytes());units=[n for n in walk(view['rootNodes'])if n.get('id')=='physics-th-unit-e10']
 if not units:continue
 assert len(units)==1 and units[0]['label'].startswith('Einführungsphase')
 atoms=[]
 for node in walk(units):
  if node['kind']=='structure':continue
  for atom in sorted(expand(node['goalId'])if node['kind']=='canonicalSubtree'else {node['goalId']}):
   if atom==task:kind='existing-reviewed-assessment';chain=[task,tide]
   else:chain=witness(tide,atom);kind='official-gezeiten-placement'if atom==tide else 'canonical-requires-preparation-only'
   record={'goalId':atom,'title':goals[atom]['title'],'kind':node['kind'],'projectionRole':node.get('projectionRole','target'),
      'acquisitionPlacement':node.get('acquisitionPlacement',False),'classification':kind,'realRequiresPath':chain}
   if chain is None:unexplained.append({'file':str(file.relative_to(ROOT)),**record})
   else:
    for a,b in zip(chain,chain[1:]):assert b in [r.split(':')[-1]for r in goals[a].get('requires',[])]
   atoms.append(record)
 assert tide in {a['goalId']for a in atoms}and task in {a['goalId']for a in atoms}
 rows.append({'file':str(file.relative_to(ROOT)),'viewId':view['viewId'],'scope':view['scope'],'unitId':units[0]['id'],'unitLabel':units[0]['label'],'referenceAtomCount':len(atoms),'atoms':atoms})
assert len(rows)==4 and unexplained==[]
assert sorted(r['referenceAtomCount']for r in rows)==[5,5,47,47]
after={str(p.relative_to(ROOT)):sha(p)for p in paths};assert before==after
result={'status':'PASS','reviewer':'/root/he_ephase_source_review','author':'/root/he_ephase_implementation','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'inputPins':before,'inputDrift':[],'sourceEvidence':[
  {'file':str(primary[0].relative_to(ROOT)),'pdfPages':[21,22],'printedPages':[21,22],'finding':'Section2.2.2 explicitly starts at Klassenstufe10; gravity examples include tides on p22.'},
  {'file':str(primary[1].relative_to(ROOT)),'pdfPages':[6,7],'printedPages':[4,5],'finding':'For the regular Gymnasium, Einführungsphase is grade10; qualification follows in grades11/12.'}],
 'perAtomE10Checks':rows,'unexplained':unexplained,
 'limits':['Only the tide goal receives the cited official placement. Other E10 atoms are canonically required preparation, not new official curriculum claims.',
           'An existing tide assessment is independently identified by exact released requires/coverage. No goal or requires changed in this read-only review.']}
(OUT/'review.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','views':len(rows),'counts':[r['referenceAtomCount']for r in rows],'unexplained':unexplained,'inputDrift':[]},indent=2))
