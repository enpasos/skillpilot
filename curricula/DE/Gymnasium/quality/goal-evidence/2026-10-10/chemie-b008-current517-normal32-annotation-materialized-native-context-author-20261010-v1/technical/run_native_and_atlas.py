# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,datetime,time,shutil
R=Path.cwd();N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1');C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';tsx=str(R/'app/node_modules/.bin/tsx')
def run(name,args):
 start=time.monotonic();p=subprocess.run([tsx,*args],cwd=C,capture_output=True,text=True);out=N/'checks'/f'{name}.stdout.log';out.write_text(p.stdout);(N/'checks'/f'{name}.terminal.actual.json').write_text(json.dumps({'argv':[tsx,*args],'capsuleRoot':str(C),'actualExitCode':p.returncode,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.monotonic()-start,'stdoutPath':str(out),'stderr':p.stderr,'normalToolsUnchanged':True,'role':'AUTHOR machine preparation only; no current independent review','activeWrites':[]},indent=2)+'\n');print(name,'EXIT',p.returncode,p.stdout[-1500:],p.stderr[-2500:],flush=True);assert p.returncode==0
run('source-atlas-build',['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',str(N/'source-atlas/current517-bounded378.author.inputs.json')])
run('source-atlas-check',['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',str(N/'source-atlas/current517-bounded378.author.inputs.json'),'--check'])
run('two-P-author-schema-semantics',['app/scripts/positiveGoalEvidenceReview.ts','--config='+str(N/'positive/two-current-context.author-candidate.config.json'),'--mode=check'])
for g in json.loads((N/'native/affected-groups.author.json').read_text())['groups']:
 if not (N/'native'/g['name']).exists():run('native-'+g['name']+'-prepare',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',g['configPath']])
 run('native-'+g['name']+'-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',g['configPath']])
