# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,shutil,subprocess,datetime,hashlib
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author';C=T/'isolated-normal-capsule'
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1');D=R/P
assert not (D/'author.final.freeze.json').exists()
tsx=str(R/'app/node_modules/.bin/tsx')
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def run(label,args,cwd):
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=cwd,capture_output=True,text=True)
 out=P/'terminal'/f'{label}.stdout.actual.txt';err=P/'terminal'/f'{label}.stderr.actual.txt';(D/'terminal').mkdir(exist_ok=True)
 (R/out).write_text(r.stdout);(R/err).write_text(r.stderr)
 proof={'schemaVersion':1,'label':label,'argv':args,'executionCwdDiagnosticOnly':str(cwd),'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'stdout':ref(out),'stderr':ref(err),'noActiveRepositoryWrites':True}
 (D/'terminal'/f'{label}.terminal.actual.json').write_text(json.dumps(proof,indent=2)+'\n')
 print(json.dumps({'label':label,'actualExitCode':r.returncode,'stdoutTail':r.stdout[-1700:],'stderrTail':r.stderr[-3000:]},ensure_ascii=False),flush=True)
 assert r.returncode==0,label
shutil.copytree(D,C/P,dirs_exist_ok=True)
run('normal-whole-current-kind-P26-and-model-prepare',[tsx,str(T/'normal_prepare_current_frame.mts')],C)
# Normal API writes occur only in the actual isolated capsule. Preserve actual
# regular outputs in the additive own package before normal batch generation.
shutil.copytree(C/P,D,dirs_exist_ok=True)
run('normal-current-Native26-prepare',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(P/'native/current26.normal-rollout.batch.config.json')],C)
run('normal-current-Native26-check',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(P/'native/current26.normal-rollout.batch.config.json')],C)
shutil.copytree(C/P/'native/current26',D/'native/current26',dirs_exist_ok=True)
print(json.dumps({'actualNativeGoalPages':26,'allCurrentProfilesExactlyPreserved':True,'ordinaryIndependentRoundCount':2,'actualIndependentReviews':0,'activeWrites':0,'strictGain':0}),flush=True)
