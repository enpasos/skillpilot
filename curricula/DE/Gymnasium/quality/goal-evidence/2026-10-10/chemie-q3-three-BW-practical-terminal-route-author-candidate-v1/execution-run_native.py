from pathlib import Path
import shutil,subprocess,json,datetime,hashlib
R=Path('/home/enpasos/projects/skillpilot');P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-practical-terminal-route-author-candidate-v1');D=R/P
C=Path((R/'tmp/m7-resumption-20261010/chemistry-three-practical-terminal-author/capsule.actual.path.txt').read_text().strip());tsx=str(R/'app/node_modules/.bin/tsx')
shutil.copytree(D,C/P,dirs_exist_ok=True)
def ref(p):
 b=(R/p).read_bytes();return{'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def run(label,args):
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();pr=subprocess.run(args,cwd=C,text=True,capture_output=True)
 out=P/'terminal'/f'{label}.stdout.actual.txt';err=P/'terminal'/f'{label}.stderr.actual.txt';(R/out).write_text(pr.stdout);(R/err).write_text(pr.stderr)
 proof={'schemaVersion':1,'label':label,'argv':args,'executionCwdDiagnosticOnly':str(C),'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':pr.returncode,'stdout':ref(out),'stderr':ref(err)}
 (D/'terminal'/f'{label}.terminal.actual.json').write_text(json.dumps(proof,indent=2)+'\n')
 print(json.dumps({'label':label,'actualExitCode':pr.returncode,'stdoutTail':pr.stdout[-1000:],'stderrTail':pr.stderr[-1200:]},ensure_ascii=False),flush=True)
 assert pr.returncode==0,label
run('normal-current-P3-literal-reuse-check',[tsx,'app/scripts/positiveGoalEvidenceReview.ts',f'--config={P}/positive/current-three-exact-reuse.config.json','--mode=check'])
run('normal-current-route-Native3-prepare',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(P/'native/three-current-route-context.batch.config.json')])
run('normal-current-route-Native3-check',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(P/'native/three-current-route-context.batch.config.json')])
shutil.copytree(C/P/'native/three-current-route-context',D/'native/three-current-route-context')
print('Actual current route Native3 and two ordinary campaigns ready; no independent review or task release claimed.',flush=True)
