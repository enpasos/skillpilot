from pathlib import Path
import json,copy,sys
R=Path('/home/enpasos/projects/skillpilot');C=Path(Path('/tmp/economics-independent633-root-cap-path.txt').read_text().strip());O=Path(Path('/tmp/economics-independent633-root-out-path.txt').read_text().strip());Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
h=json.loads((Q/'wirtschaft-current633-company-finance-consumer36-current597-fieldwise-status-nav-scope-author-a-v1/actual-final-current633-company-finance-consumer36-sixNav338-foreign-whole-science-bound.author-handoff.json').read_text());mode=sys.argv[1]
for r in h['all35WholeBeforeAfterViewRows']:(C/r['activePath']).write_bytes((R/r['candidate']['path']).read_bytes())
if mode=='restore':print('restored exact633 candidate35 views');sys.exit()
if mode=='reference':path='curricula/DE/Gymnasium/composition-views/wirtschaft/de-bb-gym-economics-gk.view.json';id='beeba149-789d-55ff-a295-e02c68629998'
elif mode=='support':path='curricula/DE/Gymnasium/composition-views/wirtschaft/de-bb-gym-economics-gk.view.json';id='f90e4741-368b-5524-8053-417d06197c80'
elif mode=='illegal':path='curricula/DE/Gymnasium/composition-views/wirtschaft/de-he-gym-economics-gk.view.json';id='622b3b81-e7b8-5d02-801f-e30b764f2054'
else:raise ValueError(mode)
p=C/path;v=json.loads(p.read_text());count=[0]
def remove(x):
 if isinstance(x,dict):
  for k,a in list(x.items()):x[k]=remove(a)
 elif isinstance(x,list):
  y=[]
  for z in x:
   if isinstance(z,dict) and z.get('goalId')==id:count[0]+=1
   else:y.append(remove(z))
  return y
 return x
if mode=='illegal':
 v['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':id,'displayLabel':'Deliberate private negative: full journal prerequisites absent','projectionRole':'target'});count[0]=1
else:v=remove(v);assert count[0]==1,count
p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');e=O/('actual-private-'+mode+'-negative-setup.root.json');assert not e.exists();e.write_text(json.dumps({'privateMutationOnly':True,'mode':mode,'viewPath':path,'goalId':id,'actualReferenceChangeCount':count[0],'activeWrites':0},indent=2)+'\n');print(mode,count[0])
