from pathlib import Path
import json,subprocess,hashlib,shutil,time
R=Path('/home/enpasos/projects/skillpilot');C=Path(Path('/tmp/economics-independent678-root-cap-path.txt').read_text().strip());O=Path(Path('/tmp/economics-independent678-root-out-path.txt').read_text().strip())
I=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1/actual-fieldwise678-foreign33-fiveNav359-references-author-index.json';i=json.loads(I.read_text());node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def restore():
 for v in i['viewRows']:shutil.copyfile(R/v['candidate']['path'],C/v['activePath'])
def remove(x,gid,count):
 if isinstance(x,dict):
  for k,a in list(x.items()):x[k]=remove(a,gid,count)
 elif isinstance(x,list):
  y=[]
  for z in x:
   if isinstance(z,dict) and z.get('goalId')==gid:count[0]+=1
   else:y.append(remove(z,gid,count))
  return y
 return x
records=[]
try:
 for mode,name,gid in [('reference','de-bb-gym-economics-gk.view.json','a626fb8c-5eda-55b6-8b21-b757fec3cf80'),('support','de-be-gym-economics-gk.view.json','604cde3e-4095-50c3-b712-e6bd7cea4717'),('illegal-whole-closure','de-by-gym-economics-gk.view.json','5fe920e6-f974-5274-a987-48a28ff3a720')]:
  restore();rel='curricula/DE/Gymnasium/composition-views/wirtschaft/'+name;p=C/rel;v=json.loads(p.read_text());count=[0]
  if mode=='illegal-whole-closure':
   v['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':gid,'projectionRole':'target','displayLabel':'Private deliberately invalid whole digital-services access'});count[0]=1
  else:v=remove(v,gid,count);assert count[0]==1,(mode,count)
  p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');label='actual-negative-'+mode+'678-independent-root';assert not (O/(label+'.stdout.txt')).exists();start=time.monotonic()
  with (O/(label+'.stdout.txt')).open('w') as out,(O/(label+'.stderr.txt')).open('w') as err:
   r=subprocess.run([node,'app/node_modules/tsx/dist/cli.mjs','native-root678.mts',str(C),str(O),str(R),label],cwd=C,stdout=out,stderr=err)
  assert r.returncode==0,(mode,(O/(label+'.stderr.txt')).read_text())
  summary=json.loads((O/(label+'.summary.json')).read_text());m=summary['routeMetrics']
  if mode=='reference':assert m['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute']>0 and m['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute']>0
  else:assert m['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']>0 and m['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']>0
  records.append({'label':label,'actualExit':r.returncode,'seconds':time.monotonic()-start,'privateViewPath':rel,'actuallyChangedGoalId':gid,'actualChangeCount':count[0],'actualFailClosedMetrics':m,'raw':bind(O/(label+'.raw.json.gz')),'summary':bind(O/(label+'.summary.json')),'stdout':bind(O/(label+'.stdout.txt')),'stderr':bind(O/(label+'.stderr.txt'))})
  print(json.dumps({'label':label,'actualExit':r.returncode,'missing':m['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute'],'unique':m['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute'],'missingClosure':m['wholeMaterialPrerequisiteOccurrencesMissingFromProjection'],'missingCoverage':m['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath'],'unexpected':m['projectionScopesWithUnexpectedTerminalAutonomyGoals'],'expected':m['projectionScopesWithoutExpectedTerminalAutonomyGoals']}),flush=True)
finally:restore()
shutil.copyfile(__file__,O/'actual-own-three-native678-negative-helper.py');p=O/'actual-three-independent678-native-negative-commands.root.json';assert not p.exists();p.write_text(json.dumps({'actualExecutedNegatives':records,'actualWhole678PrivateCandidate35ViewsRestored':True,'activeWrites':0},ensure_ascii=False,indent=2)+'\n')
