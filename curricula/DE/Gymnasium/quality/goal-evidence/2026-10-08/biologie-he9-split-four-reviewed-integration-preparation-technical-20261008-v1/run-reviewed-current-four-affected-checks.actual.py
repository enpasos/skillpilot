# SPDX-License-Identifier: Apache-2.0
"""Independent affected engineering checks; no active writes or full builds."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json,subprocess
R=Path.cwd();D=Path(__file__).resolve().parent;P=str(D.relative_to(R))
checks=[
('D4-native-current',['node','app/node_modules/tsx/dist/cli.mjs',P+'/check-current-reviewed-D4.technical.mts']),
('P2-V4-native-schema',['node','app/node_modules/tsx/dist/cli.mjs',P+'/prepare-paired-V4-P2.technical.mts']),
('A392-native',['npm','--prefix','app','run','quality:semantic-atomicity:check','--','--config='+P+'/candidate/A.current392-reviewed.inactive.config.json']),
('M392-native',['npm','--prefix','app','run','quality:memory-card-review:check','--','--config='+P+'/candidate/M.current392-reviewed.inactive.config.json']),
('SourceAtlas392-native-check',['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/inactive/biologie-he9-split-four-reviewed-20261008-v1/atlas.inputs.json','--check']),
('Derived392-scopes-and-chapter-bindings',['node','app/node_modules/tsx/dist/cli.mjs',P+'/check-real-derived-atlas392-model.v2.technical.mts'])]
def run(spec):
 name,args=spec;start=datetime.now(timezone.utc).isoformat();p=subprocess.run(args,cwd=R,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 log=D/'checks'/(name+'.stdout.actual.log');terminal=D/'checks'/(name+'.exit.actual.json')
 with log.open('x')as f:f.write(p.stdout)
 t={'command':args,'startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':p.returncode,'stdoutPath':str(log.relative_to(R)),'activeWrites':0,'newScienceReview':False,'humanApproval':False}
 with terminal.open('x')as f:f.write(json.dumps(t,ensure_ascii=False,indent=2)+'\n')
 print(name,p.returncode,flush=True);return t
with ThreadPoolExecutor(max_workers=4)as ex:results=list(ex.map(run,checks))
with (D/'checks/affected-engineering-terminals.actual.json').open('x')as f:f.write(json.dumps({'terminals':results,'allActualExit0':all(r['exitCode']==0 for r in results),'activeWrites':0,'strictGainClaimed':0},ensure_ascii=False,indent=2)+'\n')
assert all(r['exitCode']==0 for r in results)
