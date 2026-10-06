#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Run affected current native gates in the small inactive input root."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil,concurrent.futures
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);ISO=ROOT/'tmp/chemie-q1-seven-reviewed-integration-candidate-v3-native-root';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def run(name,args):
 start=datetime.now(timezone.utc).isoformat();p=subprocess.run(['app/node_modules/.bin/tsx',*args],cwd=ISO,capture_output=True);end=datetime.now(timezone.utc).isoformat();out=OWN/(name+'.stdout.txt');err=OWN/(name+'.stderr.txt');out.write_bytes(p.stdout);err.write_bytes(p.stderr);r={'name':name,'command':['app/node_modules/.bin/tsx',*args],'cwd':str(ISO),'startedAtUTC':start,'completedAtUTC':end,'actualExitCode':p.returncode,'stdoutPath':str(out.relative_to(ROOT)),'stdoutSHA256':sha(out),'stderrPath':str(err.relative_to(ROOT)),'stderrSHA256':sha(err),'activeWrites':0};write(OWN/(name+'.actual.receipt.json'),r);print(json.dumps({'name':name,'exitCode':p.returncode,'stdout':p.stdout.decode()[:1800],'stderr':p.stderr.decode()[:2200]}),flush=True);return r
checks=[(f'a-{label}-native-check',['app/scripts/semanticAtomicityReview.ts',f'--config={REL}/a-{label}.config.json','--mode=check']) for label in ['acids-derivatives','soaps','preservatives']]+[('full-memory377-native-check',['app/scripts/memoryCardReview.ts',f'--config={REL}/m-current-full.config.json','--mode=check','--write-report']),('six-P-current-native-check',['app/scripts/positiveGoalEvidenceReview.ts',f'--config={REL}/positive-evidence.config.json','--mode=check'])]
rows=[json.loads((OWN/(n+'.actual.receipt.json')).read_text()) for n,_ in checks if n!='full-memory377-native-check']
rows.append(json.loads((OWN/'full-memory377-native-check.actual.receipt.json').read_text()))
write(OWN/'affected-native-checks.actual.json',{'checks':rows,'allChecksPassed':all(r['actualExitCode']==0 for r in rows),'activeWrites':0,'humanApproval':False,'humanTrial':False});assert all(r['actualExitCode']==0 for r in rows)
qBefore=json.loads((ISO/QA).read_text());native=run('safe-six-native-V-inventory-generate',['app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=chemie']);assert native['actualExitCode']==0
qAfter=json.loads((ISO/QA).read_text());old={r['goalId']:r for r in qBefore['records']};nxt={r['goalId']:r for r in qAfter['records']};assert old==nxt,'Inventory unexpectedly changed whole review rows'
shutil.copy2(ISO/QA,OWN/'prospective-input-tree'/QA);plan=json.loads((OWN/'integration-plan.json').read_text());row=next(r for r in plan['explicitFutureDeltaFiles'] if r['futureActivePath']==QA);row['sha256']=sha(ISO/QA);write(OWN/'integration-plan.json',plan)
for p in [OWN/'integration-plan.json',OWN/'prospective-input-tree'/QA]:dest=ISO/p.relative_to(ROOT);shutil.copy2(p,dest)
r=run('safe-six-native-V-inventory-check',['app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=chemie','--check']);assert r['actualExitCode']==0
mreport=ISO/REL/'m-current-full.report.md'
if mreport.is_file():shutil.copy2(mreport,OWN/'m-current-full.report.md')
write(OWN/'native-V-inventory-exact-record-preservation.actual.json',{'beforeSHA256':sha(OWN/'prospective-input-tree'/QA),'afterSHA256':sha(ISO/QA),'allWholeRowsExact':old==nxt,'recordCount':len(nxt),'onlySerializationOrderingNormalizedByNativeInventory':True,'explicitSafeSixApprovedByFrozenIndependentVisualVerdicts':True,'d3CurrentWholeRecordUnchanged':True,'activeWrites':0,'humanApproval':False})
