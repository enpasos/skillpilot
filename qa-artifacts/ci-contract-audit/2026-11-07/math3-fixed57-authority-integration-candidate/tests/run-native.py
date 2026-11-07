from pathlib import Path
import subprocess,shutil,json,os,time,hashlib
r=Path('/home/enpasos/projects/skillpilot');w=Path(__file__).resolve().parent
nov='qa-artifacts/ci-contract-audit/2026-11-07';new='visualization-qualified-context-index-math3-2026-11-07'
def prefix(current=True,authority=True,shallow=False,extra=None,writeQa=False,testScratch=False):
 a=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm','--setenv','TMPDIR',str(w/'scratch'),'--chdir',str(r)]
 # Existing tests author only their own temporary fixture in this private namespace.
 if testScratch:
  old=r/'qa-artifacts/ci-contract-audit/2026-11-06';a+=['--tmpfs',str(old)]
  for child in sorted(old.iterdir()):a+=['--ro-bind',str(child),str(child)]
 # Remount every original child, preserving repository-relative realpaths.
 a+=['--tmpfs',str(r/nov)]
 for p in sorted((r/nov).iterdir()):a+=['--ro-bind',str(p),str(p)]
 a+=['--ro-bind',str(w/'capsule-parent'),str(r/nov/new),'--ro-bind',str(w/'contracts-view'),str(r/'contracts/goal-visualization-context/v1'),'--ro-bind',str(w/'candidate/scripts/visualization_qualified_context_capsule.py'),str(r/'scripts/visualization_qualified_context_capsule.py')]
 if authority:a+=['--ro-bind',str(w/'scripts-view'),str(r/'app/scripts')]
 if current:
  for s,t in json.loads((w/'base-overlays.json').read_bytes()):
   if t!=str(r/'app/scripts'):a+=['--ro-bind',s,t]
  a+=['--bind'if writeQa else'--ro-bind',str(w/'math-qa.json'),str(r/'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'),'--ro-bind',str(w/'kind-ledger.json'),str(r/'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')]
 if shallow:a+=['--ro-bind',str(w/'host-shallow/.git'),str(r/'.git')]
 for s,t in extra or[]:a+=['--ro-bind',str(s),str(t)]
 return a

def run(name,args,current=True,authority=True,shallow=False,extra=None,expect=0,pattern=None,testScratch=False):
 a=prefix(current,authority,shallow,extra,testScratch=testScratch)+['--']+list(map(str,args));start=time.time()
 proc=subprocess.run(a,capture_output=True);(w/f'results/{name}.stdout').write_bytes(proc.stdout);(w/f'results/{name}.stderr').write_bytes(proc.stderr)
 info={'case':name,'argv':a,'exit':proc.returncode,'seconds':time.time()-start,'stdoutSha256':hashlib.sha256(proc.stdout).hexdigest(),'stderrSha256':hashlib.sha256(proc.stderr).hexdigest()}
 (w/f'results/{name}.command.json').write_text(json.dumps(info,indent=2)+'\n');print(json.dumps({k:v for k,v in info.items()if k!='argv'}),flush=True)
 assert proc.returncode==expect,(name,proc.stderr.decode(errors='replace')[:3500],proc.stdout.decode(errors='replace')[:1000])
 if pattern:assert pattern in(proc.stderr+proc.stdout).decode(errors='replace'),name
 return proc
if __name__=='__main__':
 # The host has an unrelated, genuine depth-one history; all originals must come from the capsule.
 origin=w/'host-origin';origin.mkdir();subprocess.run(['git','init','-q',str(origin)],check=True)
 for _ in range(2):subprocess.run(['git','-C',str(origin),'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--quiet','--allow-empty','-m','unrelated shallow host'],check=True)
 subprocess.run(['git','clone','-q','--depth=1',origin.as_uri(),str(w/'host-shallow')],check=True)
 assert subprocess.check_output(['git','-C',str(w/'host-shallow'),'rev-parse','--is-shallow-repository']).strip()==b'true'
 tsx=r/'app/node_modules/.bin/tsx'
 run('current57-genuine-shallow-maturity',[tsx,r/'app/scripts/testVisualizationContextMath3Maturity.ts'],shallow=True)
 run('historical54-genuine-shallow-maturity',[tsx,r/'app/scripts/testVisualizationContextMaturity.ts'],current=False,authority=False,shallow=True)
 run('current-math-qa-native-freshness',[tsx,r/'app/scripts/generateGoalVisualizationQaLedgers.ts','--check','--subject=mathematik'],shallow=True)
