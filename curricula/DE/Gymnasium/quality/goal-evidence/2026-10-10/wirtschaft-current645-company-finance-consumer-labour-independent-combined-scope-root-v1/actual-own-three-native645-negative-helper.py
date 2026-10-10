from pathlib import Path
import json,subprocess,hashlib,copy,shutil,time
R=Path('/home/enpasos/projects/skillpilot');C=Path(Path('/tmp/economics-independent645-root-cap-path.txt').read_text().strip());O=Path(Path('/tmp/economics-independent645-root-out-path.txt').read_text().strip());Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';h=json.loads((Q/'wirtschaft-current645-company-finance-consumer-labour48-current597-fieldwise-status-nav-scope-author-a-v1/actual-final-current645-company-finance-consumer-labour48-sixNav506-foreign-whole-science-bound.author-handoff.json').read_text());N='/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node'
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def restore():
 for r in h['all35WholeBeforeAfterViewRows']:(C/r['activePath']).write_bytes((R/r['candidate']['path']).read_bytes())
def remove(x,id,count):
 if isinstance(x,dict):
  for k,a in list(x.items()):x[k]=remove(a,id,count)
 elif isinstance(x,list):
  y=[]
  for z in x:
   if isinstance(z,dict) and z.get('goalId')==id:count[0]+=1
   else:y.append(remove(z,id,count))
  return y
 return x
records=[]
try:
 for mode,path,id in [('reference','de-bb-gym-economics-gk.view.json','8fad20ba-922e-5b55-ba73-4bdf98e724fd'),('support','de-by-gym-economics-gk.view.json','e20f9304-5048-5e52-89ce-b80e978d1097'),('illegal','de-hh-gym-economics-gk.view.json','a9476232-29c2-5268-943f-48d022bd961a')]:
  restore();rel='curricula/DE/Gymnasium/composition-views/wirtschaft/'+path;p=C/rel;v=json.loads(p.read_text());count=[0]
  if mode=='illegal':v['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':id,'projectionRole':'target','displayLabel':'Deliberate private invalid insurance whole access'});count[0]=1
  else:v=remove(v,id,count);assert count[0]==1
  p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');label='actual-negative-'+mode+'645-independent-root';assert not (O/(label+'.stdout.txt')).exists();start=time.monotonic()
  with (O/(label+'.stdout.txt')).open('w') as out,(O/(label+'.stderr.txt')).open('w') as err:r=subprocess.run([N,'app/node_modules/tsx/dist/cli.mjs','native-root645.mts',str(C),str(O),str(R),label],cwd=C,stdout=out,stderr=err)
  assert r.returncode==0,(O/(label+'.stderr.txt')).read_text();records.append({'label':label,'actualExit':r.returncode,'seconds':time.monotonic()-start,'privateViewPath':rel,'deliberatelyChangedGoalId':id,'changeCount':count[0],'raw':bind(O/(label+'.raw.json.gz')),'summary':bind(O/(label+'.summary.json')),'stdout':bind(O/(label+'.stdout.txt')),'stderr':bind(O/(label+'.stderr.txt'))});print(label,'actualExit',r.returncode,flush=True)
finally:restore()
shutil.copyfile(__file__,O/'actual-own-three-native645-negative-helper.py');p=O/'actual-three-independent645-native-negative-commands.root.json';assert not p.exists();p.write_text(json.dumps({'actualThreeExecutedNegativeFrames':records,'actualWhole645PrivateCandidate35ViewsRestored':True,'activeWrites':0},ensure_ascii=False,indent=2)+'\n')
