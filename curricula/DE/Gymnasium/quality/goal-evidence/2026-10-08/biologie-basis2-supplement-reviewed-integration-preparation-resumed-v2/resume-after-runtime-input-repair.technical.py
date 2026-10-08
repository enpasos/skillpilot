# SPDX-License-Identifier: Apache-2.0
"""Affected ordinary checks; outputs are inside the independent TMP capsule."""
import hashlib,json,shutil,subprocess,time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
CAP=ROOT/'tmp/biologie-basis2-supplement-reviewed394-regular-resumed-v2-capsule';CLI=['node','app/node_modules/tsx/dist/cli.mjs']
def data(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,v):
 p=Path(p);assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return bind(p)
guard=data(OWN/'reviewed-supplement-adoption.candidate.guard.json')
def run(label,argv):
 out=OWN/'checks'/f'{label}.stdout.actual.txt';err=OWN/'checks'/f'{label}.stderr.actual.txt';assert not out.exists() and not err.exists()
 start=time.monotonic()
 with out.open('w') as stdout,err.open('w') as stderr:r=subprocess.run(argv,cwd=CAP,stdout=stdout,stderr=stderr)
 record={'schemaVersion':1,'argv':argv,'ordinaryCapsuleRoot':str(CAP.relative_to(ROOT)),'actualExitCode':r.returncode,'elapsedSeconds':time.monotonic()-start,'finishedAtUtc':datetime.now(timezone.utc).isoformat(),'stdout':bind(out),'stderr':bind(err),'activeWrites':0,'checkIsNewScientificReview':False}
 put(OWN/'checks'/f'{label}.terminal.actual.json',record)
 print(json.dumps({'check':label,'actualExitCode':r.returncode}),flush=True)
 assert r.returncode==0,(label,err.read_text()[-4500:],out.read_text()[-4500:]);return out

for label in ['ordinary-source-atlas394-refresh','ordinary-source-atlas394-freshness','ordinary-P2-genuine-unchanged-science','ordinary-A394-current-full','ordinary-V394-current-freshness']:
 record=data(OWN/'checks'/f'{label}.terminal.actual.json');assert record['actualExitCode']==0
 for k in ['stdout','stderr']:assert bind(ROOT/record[k]['path'])==record[k]
run('ordinary-M394-eight-scopes-normal-runtime-input-repaired',CLI+['app/scripts/memoryCardReview.ts','--mode=check','--config='+guard['before']['memoryConfig']['active']['path']])
run('ordinary-whole394-genuine-native-context-frame',CLI+[REL+'/verify-whole394-actual-loader-and-context.technical.mts'])
for name in ['capsule-whole394.actual-normal-loader-model.json','capsule-whole394-genuine-reviewed-frame.actual.json']:
 p=OWN/'checks'/name;assert not p.exists();shutil.copyfile(CAP/REL/'checks'/name,p)
reg=data(CAP/guard['before']['registry']['active']['path']);reg['subjects']=[s for s in reg['subjects'] if s['subject']=='biologie'];put(CAP/'tmp/bio-only-affected-current394.config.json',reg)
out=run('ordinary-central-bio246-of394',CLI+['app/scripts/reportDeepUnderstandingRollout.ts','--mode=check','--format=json','--config=tmp/bio-only-affected-current394.config.json'])
report=data(out);assert report['blockingIssueCount']==0;bio=report['subjects'][0];assert (bio['strictComplete'],bio['denominator'])==(246,394)
oldReport=data(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-first-three-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt');old=next(s for s in oldReport['subjects'] if s['subject']=='biologie')
previous=set(old['strictCompleteGoalIds']);now=set(bio['strictCompleteGoalIds']);assert len(previous)==244 and previous<=now
assert now-previous==set(guard['newGoalIds'])
put(OWN/'checks/strict-bio246-of394-new2-old244-exact.actual.json',{'schemaVersion':1,'actualCentralExitCode':0,'actualBlockingIssues':0,'strictComplete':246,'denominator':394,'netStrictGain':2,'newScientificClosures':sorted(now-previous),'all244PreviousStrictIdsRetained':True,'restoredExistingContextBindingGoalIds':[guard['contextSupersessionGoalId']],'restoredBindingNetStrictGain':0,'activeBiologyRemains':'244/392','activeWrites':0,'humanApproval':False})
# The ordinary status generator necessarily derives shared Layer-A status; do not
# run another complete four-subject central report or any frontend/backend build.
run('ordinary-dependent-status-source-CQR003-refresh',CLI+['app/scripts/generateCurriculumQualityStatus.ts'])
run('ordinary-all-nine-protected-maturity-floors',CLI+['app/scripts/checkCurriculumMaturityFloors.ts'])
for name in ['curriculum-quality-status.json','curriculum-quality-status.md']:
 p=OWN/'checks'/('capsule.'+name);assert not p.exists();shutil.copyfile(CAP/'docs/qa-ci/status'/name,p)
for v in guard['before'].values():assert bind(ROOT/v['active']['path'])==v['active']
for i in guard['mappingInstalls']+guard['imageInstalls']:assert not (ROOT/i['destination']).exists(),i['destination']
put(OWN/'checks/final-seven-active-inputs-and-eighteen-new-destinations.unchanged.actual.json',{'schemaVersion':1,'allSevenActiveHashAndByteBindingsExact':True,'allEightNewMappingDestinationsStillAbsent':True,'allTenImageDestinationsStillAbsent':True,'schemaOrGateOrDiscoveryRulesChanged':False,'fullFourSubjectCentralReportNotRepeated':True,'frontendBackendBuildNotRun':True,'activeWrites':0})
print('PASS: actual isolated Bio246/394, all244retained; dependent source/floors terminal PASS; active244/392 unchanged',flush=True)
