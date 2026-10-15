# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,subprocess,datetime,concurrent.futures
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;E=O/'executions';E.mkdir(exist_ok=True)
node=R/'tmp/ci-tools/node-v20.20.2-linux-x64/bin/node';tsx=R/'app/node_modules/tsx/dist/cli.mjs'
def bind(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
def run(test):
 p=R/'app'/test;name=p.stem;args=[str(node),str(tsx),str(p)];start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=R/'app',text=True,capture_output=True);out=E/(name+'.stdout.txt');err=E/(name+'.stderr.txt');out.write_text(r.stdout);err.write_text(r.stderr);return {'test':test,'source':bind(p),'argv':args,'cwd':'app','startedAtUTC':start,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':r.returncode,'stdout':bind(out),'stderr':bind(err),'testSourceEdited':False,'runtimeOrHostAcceptance':False}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(run,['scripts/testGoalVisualizationQaModel.ts','scripts/testGoalVisualizationQaStatus.ts','src/utils/goalBookRuntime.test.ts','scripts/testDeployGoalVisualizations.ts']))
(O/'existing-focused-tests.execution.actual.json').write_text(json.dumps({'actualExecutor':'/root/eight_scope_guard_successor_independent_peer','runs':rows,'MainEdits':False},indent=2)+'\n');print(json.dumps([{'test':r['test'],'exitCode':r['exitCode']} for r in rows]))
for r in rows:
 print(r['test']);print((R/r['stdout']['path']).read_text());print((R/r['stderr']['path']).read_text())
