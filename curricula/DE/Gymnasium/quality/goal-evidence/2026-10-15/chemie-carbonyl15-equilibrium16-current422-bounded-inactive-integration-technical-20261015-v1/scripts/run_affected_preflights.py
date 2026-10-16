# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,datetime,concurrent.futures
repo=Path('/home/enpasos/projects/skillpilot');R=Path(__file__).resolve().parents[1];host=repo/'tmp/chemie-m7-resumed-20261015/carbonyl15-equilibrium16-current422-integration-host-v1';rel=lambda p:str(p.relative_to(repo));now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def run(name,args):
 start=now();p=subprocess.run(args,cwd=host,text=True,capture_output=True);end=now();op=R/'checks'/f'PREFLIGHT.{name}.stdout.actual.txt';ep=R/'checks'/f'PREFLIGHT.{name}.stderr.actual.txt';op.write_text(p.stdout);ep.write_text(p.stderr);r={'name':name,'argv':args,'cwd':rel(host),'startedAtUTC':start,'completedAtUTC':end,'exitCode':p.returncode,'stdoutPath':rel(op),'stderrPath':rel(ep),'centralExecuted':False};print(name,p.returncode,p.stdout[:1100],flush=True);return r
cmds=[]
for label,kind in [('carbonyl15','P'),('carbonyl15','A'),('equilibrium12','P'),('equilibrium16','A')]:
 script='positiveGoalEvidenceReview.ts' if kind=='P' else 'semanticAtomicityReview.ts'
 cmds.append((label+'-'+kind,['./app/node_modules/.bin/tsx','app/scripts/'+script,'--config='+rel(R/'config'/f'{label}.{kind}.science-exact.normal.config.json'),'--mode=check']))
for config in sorted((R/'config').glob('A-old-residual-*.normal.config.json')):
 cmds.append((config.stem,['./app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts','--config='+rel(config),'--mode=check']))
mroot=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-kinetic-mechanism-one-final-wording-memory-informed-root-20261015-v1'
cmds.append(('M422-final138-ten-scopes',['./app/node_modules/.bin/tsx','app/scripts/memoryCardReview.ts','--config='+rel(mroot/'config/M422.whole-ten-scopes.final138-wording.config.json'),'--mode=check']))
cmds.append(('QA438-current138-Pourbaix-original-other436',['./app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--check','--subject=chemie']))
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(lambda a:run(*a),cmds))
(R/'checks/PREFLIGHT.affected-normal-P27-A31-M422-QA438.actual.json').write_text(json.dumps({'schemaVersion':1,'role':'Affected input preflights only, full central expressly not executed','results':results,'fullCentralRunCount':0,'newScientificVotes':0},indent=2)+'\n')
if any(r['exitCode'] for r in results):raise SystemExit(1)
