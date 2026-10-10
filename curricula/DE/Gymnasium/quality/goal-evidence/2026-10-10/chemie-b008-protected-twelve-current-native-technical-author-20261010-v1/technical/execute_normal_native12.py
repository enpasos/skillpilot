# SPDX-License-Identifier: Apache-2.0
"""Run the original normal full models and prepare/check helper inside tmp only."""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess
R=Path('/home/enpasos/projects/skillpilot')
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-technical-author-20261010-v1')
D=R/P;T=R/'tmp/m7-resumption-20261010/chemistry-b008-protected-twelve-native-author';C=T/'isolated-normal-capsule'
assert not (D/'author.final.freeze.json').exists()
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def run(label,args):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=C,capture_output=True,text=True)
 stdout=P/'terminal'/f'{label}.stdout.actual.txt';stderr=P/'terminal'/f'{label}.stderr.actual.txt'
 (R/stdout).write_text(r.stdout);(R/stderr).write_text(r.stderr)
 proof={'schemaVersion':1,'label':label,'argv':args,'executionCwdDiagnosticOnly':str(C),'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'stdout':ref(stdout),'stderr':ref(stderr),'activeWrites':[],'strictGain':0}
 (D/'terminal'/f'{label}.terminal.actual.json').write_text(json.dumps(proof,indent=2)+'\n')
 print(json.dumps({'label':label,'actualExitCode':r.returncode,'stdoutTail':r.stdout[-2000:],'stderrTail':r.stderr[-3500:]},ensure_ascii=False),flush=True)
 assert r.returncode==0,label
tsx=str(R/'app/node_modules/.bin/tsx')
shutil.copy2(D/'technical/normal_protected12_fingerprint_candidates.mts',T/'normal_protected12_fingerprint_candidates.mts')
run('normal-P-A-M-kind-current-input-candidate-fingerprints',[tsx,str(T/'normal_protected12_fingerprint_candidates.mts')])
shutil.copytree(C/P/'positive',D/'positive',dirs_exist_ok=True)
shutil.copy2(D/'technical/normal_full_models_and_binding_proof.mts',T/'normal_full_models_and_binding_proof.mts')
run('normal-full381-to398-with-current-P12',[tsx,str(T/'normal_full_models_and_binding_proof.mts')])
shutil.copytree(C/P/'native',D/'native',dirs_exist_ok=True)
shutil.copytree(C/P/'checks',D/'checks',dirs_exist_ok=True)
config=str(P/'native/current-12.normal-rollout.batch.config.json')
run('normal-current-Native12-prepare',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',config])
run('normal-current-Native12-check',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',config])
shutil.copytree(C/P/'native/current-12',D/'native/current-12')
target=json.loads((D/'inputs/whole-existing-A-M-and-normal-target-bindings.actual.json').read_text())
for i,path in enumerate(target['normalAtomicityConfigPaths'],1):
 run(f'normal-targeted-protected12-atomicity-{i}',[tsx,'app/scripts/semanticAtomicityReview.ts','--config='+path,'--mode=check'])
run('normal-targeted-protected12-memory',[tsx,'app/scripts/memoryCardReview.ts','--config='+target['normalMemoryConfigPath'],'--mode=check'])
shutil.copytree(C/P/'checks',D/'checks',dirs_exist_ok=True)
print(json.dumps({'actualNativeGoalPageCount':12,'ordinaryIndependentCampaignCount':2,'actualIndependentScientificReviews':0,'activeWrites':0,'strictGain':0}))
