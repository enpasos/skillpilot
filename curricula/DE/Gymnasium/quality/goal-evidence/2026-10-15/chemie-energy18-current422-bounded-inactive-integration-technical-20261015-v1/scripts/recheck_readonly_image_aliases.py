# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,datetime,concurrent.futures
repo=Path('/home/enpasos/projects/skillpilot');R=Path(__file__).resolve().parents[1];host=repo/'tmp/chemie-m7-resumed-20261015/energy18-current422-inactive-integration-host-v1';rel=lambda p:str(p.relative_to(repo));now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def run(name,args):
 start=now();p=subprocess.run(args,cwd=host,text=True,capture_output=True);end=now();out=R/'checks'/f'READONLY.{name}.stdout.actual.txt';err=R/'checks'/f'READONLY.{name}.stderr.actual.txt';out.write_text(p.stdout);err.write_text(p.stderr);result={'name':name,'argv':args,'cwd':rel(host),'startedAtUTC':start,'completedAtUTC':end,'exitCode':p.returncode,'stdoutPath':rel(out),'stderrPath':rel(err)};print(name,p.returncode,p.stdout[:450],flush=True);return result
cmds=[(label,['./app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+rel(R/'config'/f'{label}.P.science-exact.normal-address.config.json'),'--mode=check']) for label in ['P11','P4','P3']]
cmds.append(('QA438',['./app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--check','--subject=chemie']))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(lambda a:run(*a),cmds))
(R/'checks/READONLY.normal-image-alias-consumers.actual.json').write_text(json.dumps({'schemaVersion':1,'role':'Actual scoped stock image-reading checks after releasing only own duplicate cache; no renderer/fullbuild/central','results':results,'allExactReadonlyImageAliasesAllowedForTheseConsumers':all(r['exitCode']==0 for r in results),'centralExecuted':False},indent=2)+'\n')
if any(r['exitCode'] for r in results):raise SystemExit(1)
