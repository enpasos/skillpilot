from pathlib import Path
import json,copy,os,subprocess,hashlib,shutil
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1';CAP=Path('/tmp/economics-combined678-current645-author-a-path.txt').read_text().strip();CAP=Path(CAP);NODE='/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def guard(p):assert p.resolve().is_relative_to(CAP.resolve()) and not p.is_symlink() and not os.path.samefile(p,R/p.relative_to(CAP))
def remove(n,gid,role=None):
 count=0
 if 'children' in n:
  kept=[]
  for c in n['children']:
   if c.get('kind')=='goalEntry' and c.get('goalId')==gid and (role is None or c.get('projectionRole')==role):count+=1
   else:count+=remove(c,gid,role);kept.append(c)
  n['children']=kept
 return count
jobs=[('own-negative-RP-LK-policy-principles-needed-material-refdrop-author-A','de-rp-gym-economics-lk.view.json','DROP','73e787d7-15a8-583e-a731-a2db290a77e6'),('own-negative-HE-GK-digital-hidden-whole-closure-access-injection-author-A','de-he-gym-economics-gk.view.json','INJECT','5fe920e6-f974-5274-a987-48a28ff3a720'),('own-negative-BY-GK-tariff-existing942-support-drop-author-A','de-by-gym-economics-gk.view.json','DROP_PONLY','94264f00-d0b2-564c-8338-747228390c20')]
results=[]
for label,name,kind,gid in jobs:
 p=CAP/'curricula/DE/Gymnasium/composition-views/wirtschaft'/name;guard(p);original=p.read_bytes();n=json.loads(original)
 if kind=='INJECT':n['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':gid,'projectionRole':'target','displayLabel':'Fachlich unzulässiger Prüfzugang als echte Negativprobe'}) ;removed=0
 else:
  removed=sum(remove(root,gid,'prerequisiteOnly' if kind=='DROP_PONLY' else None) for root in n['rootNodes']);assert removed==1,(kind,removed)
 candidate=json.dumps(n,ensure_ascii=False,indent=2)+'\n';inputb=save(label+'.whole-view.actual-INERT-negative.json',n)
 cmd=[NODE,'--import','./node_modules/tsx/dist/loader.mjs','scripts/internationalOperationsPolicy33Current645Combined678ScopeAuthorA.mts',str(CAP),str(O),str(R),label]
 try:
  guard(p);p.write_text(candidate);run=subprocess.run(cmd,cwd=CAP/'app',capture_output=True,text=True);assert run.returncode==0,(label,run.stderr)
  (O/(label+'.stdout.txt')).write_text(run.stdout);(O/(label+'.stderr.txt')).write_text(run.stderr)
  summary=read(O/(label+'.actual-native-summary.json'));results.append({'label':label,'command':cmd,'actualCwd':str(CAP/'app'),'actualExitCode':run.returncode,'kind':kind,'actualRemovedRefs':removed,'actualNegativeInput':inputb,'actualObservedSummary':summary})
  print(json.dumps({'label':label,'actualNativeExit':run.returncode,'missing':summary['missing'],'unique':summary['unique'],'expected':summary['expected'],'closure':summary['closure'],'coverage':summary['coverage']}),flush=True)
 finally:guard(p);p.write_bytes(original);assert p.read_bytes()==original
save('actual-three-executed-genuine-combined678-scope-negative-command-and-restoration-records.AUTHOR.json',{'role':'OWN_AUTHOR_REAL_NEGATIVES_NOT_FOREIGN_KEEP','actualThreeRuns':results,'actualPositive678WholeCANAnd35ViewsRestoredExact':True,'activeWrites':0})
shutil.copyfile('/tmp/economics-combined678-three-real-negatives-author-a.py',O/'actual-executed-three-real-combined678-scope-negatives.author.py')
