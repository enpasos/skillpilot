# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,datetime,time,shutil
R=Path.cwd();N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-seven-BY-source-two-direct-routes-author-20261010-v1');C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';tsx=str(R/'app/node_modules/.bin/tsx')
def run(name,args):
 start=time.monotonic();p=subprocess.run([tsx,*args],cwd=C,capture_output=True,text=True);out=N/'checks'/f'{name}.stdout.log';out.write_text(p.stdout);(N/'checks'/f'{name}.terminal.actual.json').write_text(json.dumps({'argv':[tsx,*args],'capsuleRoot':str(C),'actualExitCode':p.returncode,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.monotonic()-start,'stdoutPath':str(out),'stderr':p.stderr,'normalToolsUnchanged':True,'role':'SOURCE/route AUTHOR machine checks; current independent review pending','activeWrites':[]},indent=2)+'\n');print(name,'EXIT',p.returncode,p.stdout[-1800:],p.stderr[-2400:],flush=True);return p.returncode
run('source-atlas-build',['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',str(N/'source-atlas/current517-bounded378.author.inputs.json')])
run('source-atlas-check',['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',str(N/'source-atlas/current517-bounded378.author.inputs.json'),'--check'])
run('two-P-author-schema-semantics',['app/scripts/positiveGoalEvidenceReview.ts','--config='+str(N/'positive/two-current-context.author-candidate.config.json'),'--mode=check'])
if not (N/'native/two-routes').exists():run('native-two-routes-prepare',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(N/'native/two-routes.normal-rollout.batch.config.json')])
run('native-two-routes-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(N/'native/two-routes.normal-rollout.batch.config.json')])
import sys
if '--targeted-retry' in sys.argv: sys.exit(0)
for rel in ['docs/qa-ci/status/curriculum-quality-status.json','docs/qa-ci/status/curriculum-quality-status.md']:
 p=C/rel;assert p.parent.resolve().is_relative_to(C.resolve())
 if p.exists()or p.is_symlink():p.unlink()
run('full-current-LayerA-generate',['app/scripts/generateCurriculumQualityStatus.ts'])
status=C/'docs/qa-ci/status/curriculum-quality-status.json'
if status.exists():
 x=json.loads(status.read_text());chem=next(s for s in x['curricula']if s['subject']=='Chemie');(N/'checks/full-current-LayerA-Chemistry.actual.json').write_text(json.dumps({'schemaVersion':1,'normalRulesVersion':x['rulesVersion'],'chemistry':chem,'otherSubjectMaturities':[{k:s.get(k)for k in ['subject','landscapeId','maturity','goals','atomicGoals']}for s in x['curricula']if s['subject']!='Chemie'],'activeWrites':[]},ensure_ascii=False,indent=2)+'\n');print('Actual full normal LayerA Chem',chem['maturity'],[(r['id'],r['status'])for r in chem['rules']],flush=True)
