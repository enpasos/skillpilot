from pathlib import Path
import hashlib,json,subprocess,time
R=Path('/home/enpasos/projects/skillpilot'); O=Path(__file__).resolve().parent
state=json.loads((O/'private-workspace.json').read_text());W=Path(state['workspace'])
tsx=R/'app/node_modules/.bin/tsx'
def run(name,cmd,assets=False,qa=False):
 a=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind',str(W),str(W),'--setenv','TMPDIR',str(W/'tmp'),'--chdir',str(R)]
 if assets:
  for n,p in enumerate(state['assets']):a+=['--ro-bind',str(W/f'asset-dir-{n}'/Path(p).name),str(R/p)]
 if qa:a+=['--ro-bind',state['candidateQa'],str(R/state['qa'])]
 a+=['--',*map(str,cmd)];t=time.time();p=subprocess.run(a,capture_output=True)
 (O/f'{name}.stdout.txt').write_bytes(p.stdout);(O/f'{name}.stderr.txt').write_bytes(p.stderr)
 rec={'case':name,'argv':a,'exitCode':p.returncode,'elapsedSeconds':time.time()-t,'stdoutSha256':hashlib.sha256(p.stdout).hexdigest(),'stderrSha256':hashlib.sha256(p.stderr).hexdigest()};(O/f'{name}.execution.json').write_text(json.dumps(rec,indent=2)+'\n')
 print(json.dumps({k:v for k,v in rec.items() if k!='argv'}),flush=True);return p
checks={}
for name,a,q in [('baseline-native-bindings',False,False),('new-image-old-ledger-native-bindings',True,False),('new-image-independent-V-ledger-native-bindings',True,True)]:
 p=run(name,[tsx,O/'native-probe.ts'],a,q);assert p.returncode==0,p.stderr
 checks[name]=json.loads(p.stdout)
for name,script,args in [
 ('new-image-atomicity-check','semanticAtomicityReview.ts',[f'--config={state["subject"]["semanticAtomicityConfigPath"]}','--mode=check']),
 ('new-image-memory-check','memoryCardReview.ts',[f'--config={state["subject"]["memoryReviewConfigPath"]}','--mode=check']),
 ('new-image-V-ledger-freshness','generateGoalVisualizationQaLedgers.ts',['--check','--subject=mathematik'])]:
 p=run(name,[tsx,R/'app/scripts'/script,*args],True,True);checks[name]={'exitCode':p.returncode,'stdout':p.stdout.decode(),'stderr':p.stderr.decode()}
changed=[]
for p,before in state['protected'].items():
 if hashlib.sha256((R/p).read_bytes()).hexdigest()!=before['sha256']:changed.append(p)
assert not changed,changed
(O/'native-check-summary.json').write_text(json.dumps({'checks':checks,'protectedActiveInputsUnchanged':True,'activeWrites':False,'fullCqrRun':False},ensure_ascii=False,indent=2)+'\n')
