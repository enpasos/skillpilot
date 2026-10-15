# SPDX-License-Identifier: Apache-2.0
"""Finite additive technical accounting after the single actual stock central run."""
import json,hashlib,datetime,os
from pathlib import Path
REPO=Path.cwd();E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15');R=E/'chemie-energy18-current422-bounded-inactive-integration-technical-20261015-v1'
B=E/'chemie-memory560-current422-paired13-and-six-card-inactive-integration-technical-root-20261015-v1'
M6=E/'chemie-energy-six-current422-memory-targeted-informed-root-20261015-v1';M3=E/'chemie-energy-three-final-wording-memory-targeted-informed-root-20261015-v1';D4=E/'chemie-energy-four-final-contexts-paired-native-technical-20261015-v1'
sealpath=R/'FILES.finite-integration.seal.json';assert not sealpath.exists()
def j(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def check(row):
 a=bind(row['path']);assert a['sha256']==row['sha256'],row['path']
 if 'bytes'in row:assert a['bytes']==row['bytes'],row['path']
 return a
def write(p,x):
 p=Path(p);assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def rows(p):return [json.loads(l) for l in Path(p).read_text().splitlines() if l.strip()]
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
prep=j(R/'INPUTS.prepared-inactive-energy18.readonly-v2.selector.json');inputs=prep['inputs'].copy()
inputs.update({
 'preparedCheckpointSeal':bind(R/'FILES.finite-preparation-readonly-v2.seal.json'),
 'finalD4Neutral':bind(D4/'NEUTRAL.finite-four-contexts-paired-native-technical.json'),
 'finalD4Seal':bind(D4/'FILES.finite-four-contexts-paired-native-technical.seal.json'),
 'finalD4Index':bind(D4/'native-four/resolution-index.json'),
 'genuineM6Neutral':bind(M6/'NEUTRAL.six-current-M-whole422-pass.json'),
 'genuineM6FirstScienceSeal':bind(M6/'FILES.FIRST-six-memory-science.seal.json'),
 'genuineM6FiniteSeal':bind(M6/'FILES.finite-targeted-M6.seal.json'),
 'genuineM3FirstScienceSeal':bind(M3/'FILES.FIRST-three-final-wording-M-science.seal.json'),
 'originalOwnD20Seal':bind(E/'chemie-energy20-final-current422-native-fresh-independent-c-20261015-v1/FILES.finite-independent-c-D20.seal.json')
})
verifiedseals=[]
for name,row in inputs.items():
 check(row)
 if 'Seal'in name:
  s=j(row['path']);fs=s.get('files',[])
  assert isinstance(fs,list),(name,type(fs))
  for f in fs:check(f)
  verifiedseals.append({'name':name,'seal':row,'boundFilesChecked':len(fs)})
assert j(inputs['preparedCheckpointSeal']['path'])['fileCount']==57
before=j(R/'checks/PROTECTED697.actual-before.json');assert len(before['files'])==697
for row in before['files']:check(row)
protected={'schemaVersion':1,'checkedAtUTC':now,'role':'Exact post-central preservation; no new whole-subject review','before':bind(R/'checks/PROTECTED697.actual-before.json'),'protectedFileCount':697,'exact':True,'changedPaths':[],'unrelatedMachineBaselinesPreservedByExactInputs':{'Mathematik':807,'Physik':478,'Biologie':397},'activeWrites':0,'registryOrLedgerWrites':0}
write(R/'checks/PROTECTED697.actual-after-and-baselines.json',protected)
reportpath=R/'checks/CENTRAL.current422.energy18.stock-report.actual.json';oldreportpath=B/'checks/CENTRAL.current422.memory560-native13-six-cards.v2.stock-report.actual.json'
a=j(oldreportpath)['subjects'][0];z=j(reportpath)['subjects'][0];receipt=j(R/'checks/CENTRAL.exactly-one-final.command.actual.json')
assert receipt['exitCode']==0 and receipt['actualFullCentralRunCountThisPacket']==1
assert bind(reportpath)['sha256']==receipt['stdoutSha256'] and bind(R/'checks/CENTRAL.current422.energy18.stderr.actual.txt')['bytes']==0
assert len(z['requiredChecks'])==6 and all(x['status']=='pass' for x in z['requiredChecks']) and z['issues']==[]
old=set(a['strictCompleteGoalIds']);new=set(z['strictCompleteGoalIds']);scope=set(prep['scope18GoalIds']);added=sorted(new-old);lost=sorted(old-new)
assert len(old)==321 and len(new)==338 and len(added)==17 and not lost and set(added)<=scope and len(scope)==18
assert scope-new=={'0773a104-aaeb-5e96-a615-2a2bec3eb096'}
canonical=j(inputs['currentWholeCanonical']['path']);goals={g['id']:g for g in canonical['goals']}
oldconfig=j(inputs['baselineConfig']['path'])['subjects'][0];newconfig=j(R/'config/central.current422.energy18.inactive.final.config.json')['subjects'][0]
for key in ['semanticAtomicityConfigPaths','positiveEvidenceConfigPaths','resolutionIndexPaths','resolutionSupersessions']:
 assert newconfig[key][:len(oldconfig[key])]==oldconfig[key]
assert newconfig['resolutionWithdrawals']==oldconfig['resolutionWithdrawals']
assert len(newconfig['resolutionSupersessions'])==len(oldconfig['resolutionSupersessions'])+1
oldmconfig=j(oldconfig['memoryReviewConfigPath']);newmconfig=j(newconfig['memoryReviewConfigPath']);oldm={x['goalId']:x for x in rows(oldmconfig['reviewPath'])};newm={x['goalId']:x for x in rows(newmconfig['reviewPath'])};m6={x['goalId']:x for x in rows(M6/'records/M422.original416-plus-six-current.review.jsonl')}
assert len(oldm)==len(newm)==422
mdelta=[i for i in sorted(oldm) if oldm[i]!=newm[i]];assert len(mdelta)==8
mprovenance=[]
for i in mdelta:
 row=newm[i];s=row['firstScienceSeal'];check(s)
 stage='M3 final wording' if str(M3) in s['path'] else 'M6 retained current-context science'
 if stage.startswith('M6'):assert row==m6[i]
 mprovenance.append({'goalId':i,'title':goals[i]['title'],'stage':stage,'firstScienceSeal':s,'beforeWholeRow':oldm[i],'currentWholeRow':row,'bodyAndScienceChanged':True})
assert sum(x['stage'].startswith('M3') for x in mprovenance)==3
assert oldmconfig['cardReviewPath']==newmconfig['cardReviewPath'];assert len(rows(newmconfig['cardReviewPath']))==75
inputs['actualM422Ledger']=bind(newmconfig['reviewPath']);inputs['originalM422BaselineLedger']=bind(oldmconfig['reviewPath']);inputs['unchanged75CardLedger']=bind(newmconfig['cardReviewPath'])
pa={};pacounts={}
for n in ['P11','P4','P3']:
 pconfig=j(R/f'config/{n}.P.science-exact.normal-address.config.json');aconfig=j(R/f'config/{n}.A.science-exact.normal-address.config.json')
 ids=pconfig['scope']['goalIds'];pacounts[n]=len(ids)
 for i in ids:pa[i]={'scientificPackage':n,'positiveProfileLedger':bind(pconfig['reviewPath']),'atomicityLedger':bind(aconfig['reviewPath']),'reviewedResourceTypes':pconfig['reviewedResourceTypes'],'positiveStatus':'ai_candidate / needs_human_review','coverage':'E1/G1 design criteria, not observed learner trials'}
assert set(pa)==scope
freshD4={'16b24dc5-0e48-5e3b-8307-01289db8d1a9','7a5a8e37-7078-5974-a4d8-edf7d4cbbfc3','551d81a7-2308-540f-8323-df35c6871d62','ebfa2c18-0599-5282-bf7a-80c14d86331e'}
net={'schemaVersion':1,'recordedAtUTC':now,'role':'Actual machine strict-set comparison and provenance accounting; zero new scientific votes by technical integrator','baselineReport':bind(oldreportpath),'actualReport':bind(reportpath),'baselineStrictCount':321,'currentStrictCount':338,'denominator':422,'old321RetainedGoalIds':sorted(old),'lostGoalIds':lost,'newStrictGoalIds':added,'outsideAssigned18AddedGoalIds':sorted(set(added)-scope),'assigned18StillNotStrictGoalIds':sorted(scope-new),'netStrictIncrease':17,'newStrictGoals':[{'goalId':i,'title':goals[i]['title'],'DSelection':'fresh final D4' if i in freshD4 else 'D15 informed paired selection; original dissent preserved',**pa[i]} for i in added],'actualGatesBefore':a['gates'],'actualGatesAfter':z['gates'],'actualSixRequiredChecks':z['requiredChecks'],'actualIssues':z['issues'],'strictCompletionReady':z['strictCompletionReady'],'scientificVsContextAccounting':{'newTechnicalScientificVotes':0,'genuineInformedPositiveJudgmentsSelected':18,'genuineAtomicityJudgmentsSelected':18,'positiveProfileBodiesRetainedExact':10,'wholePositiveProfileScientificSuccessors':8,'D18CurrentUnique':'14 retained D15 after only ebfa supersession plus 4 fresh final D4','originalOwnDissentUnchangedGoalPrefixes':['ecce0306','a3386a86','3ec31fe1','e20d205f'],'actualMemoryWholeRowsDifferentFrom321Baseline':8,'memoryOldWholeRowsExactFrom321Baseline':414,'M6ScienceRowsStillCurrent':5,'latestM3ScienceRows':3,'M3Other419ExactReference':'Relative to its M6 predecessor, not the earlier 321 baseline','unchangedUniqueCardRows':75,'genuineCurrentVRowsSelected':6,'VGateIncreaseFromNewAvailability':1,'newlyAvailableApprovedImageGoalId':'0cf2ffe1-a988-5ffb-ab37-0ac7d58b23dd','otherFiveVRows':'Genuine current context reviews, not five further gate additions','a76AndE64ExistingV':'English-only scope clarification; unchanged DE/ALT/pixels and exact asset/DE-bound V rows preserved; no fabricated context fingerprint or new V vote','sourceFingerprintTransport':'Current560 semantic ledger source bindings are technical context bindings, not additional scientific judgments'},'actualM8Provenance':mprovenance,'unchanged75CardLedger':inputs['unchanged75CardLedger'],'holds':{'0773':'Source and missing-image hold remains; target18 non-strict','e64AndC21':'D/atomicity/course split holds remain; no selected old A clearance','sourceCourse':'Existing 4+9 source/course holds remain; no source or whole-course approval','Human':'No human approval or completed learner/lab trial is inferred','overallM7':'Not granted; actual strictCompletionReady false'},'activeIntegration':False,'M7Grant':False}
write(R/'checks/ACTUAL.strict338-vs321.net17-and-science-context.json',net)
# Add a replay helper which reads the frozen final map and writes only a fresh tmp host.
src=(R/'scripts/rebuild_prepared_sparse_host.readonly-v2.py').read_text()
src=src.replace("assert not (OWN/'FILES.finite-integration.seal.json').exists(),'Never write a sealed packet'\n",'')
src=src.replace("'checks/REBUILD.energy18-prepared.physical-exact-map.v2.json'","'checks/REBUILD.energy18-final.physical-exact-map.v3.json'")
src=src.replace("HOST=REPO/DATA['executionHost'];assert HOST.is_relative_to(REPO/'tmp') and not HOST.exists()", "HOST=REPO/(sys.argv[2] if len(sys.argv)>2 else DATA['executionHost']);assert HOST.is_relative_to(REPO/'tmp') and not HOST.exists()")
src=src.replace("(OWN/DATA.get('buildReceiptPath','checks/REBUILD.actual-new-host.json')).write_text(json.dumps(receipt,indent=2)+'\\n');print(json.dumps(receipt))", "receipt['actualFreshHost']=str(HOST.relative_to(REPO));print(json.dumps(receipt,indent=2))")
assert 'write_text' not in src
(R/'scripts/rebuild_final_sparse_host.readonly-v3.py').write_text(src)
mp=j(R/'checks/REBUILD.energy18-final.physical-exact-map.v3.json');host=Path(mp['executionHost'])
for row in mp['stockPhysicalModules']:
 check(row);assert bind(host/row['path'])['sha256']==row['sha256']
for row in mp['aliases']:
 check(row['physicalRepositorySource']);p=host/row['normalHostAlias'];assert not p.is_symlink();assert bind(p)['sha256']==row['physicalRepositorySource']['sha256']
# Assets were already fully verified before the actual stock central; no new visual vote.
regular=[]
for base,dirs,files in os.walk(host,followlinks=False):
 dirs[:]=[d for d in dirs if not (Path(base)/d).is_symlink()]
 regular.extend(Path(base)/f for f in files if not (Path(base)/f).is_symlink())
cachebytes=sum(p.stat().st_size for p in regular);assert cachebytes<mp['maxCacheBytes']
closure={'schemaVersion':1,'checkedAtUTC':now,'pass':True,'role':'Finite actual post-central accounting, no additional QA run','actualFullCentralRuns':1,'fullCentralExitCode':0,'sixRequiredChecksPass':True,'old321Retained':True,'strictLost':0,'newStrictIds':17,'outsideAssigned18':0,'denominator':422,'gatesThresholdsAndStockModulesUnmodified':True,'baselineConfigArraysRetainedExactPrefix':True,'onlyAddedDSupersession':'ebfa D15 -> final D4','protected697ExactAfterCentral':True,'prepared57FrozenFilesExact':True,'sourceSealsVerified':verifiedseals,'hostStockPhysicalModules':31,'hostPhysicalDataAliases':51,'hostRegularFiles':len(regular),'hostRegularBytes':cachebytes,'hostPhysicalImageCopies':0,'rendererOrFullBuild':False,'newScientificVotes':0,'activeWrites':0,'M7Grant':False}
write(R/'checks/FINAL.actual-one-central-preservation-closure.json',closure)
readme='''# Energy18 inactive integration — actual finite result\n\nOne authorized, unmodified stock central run completed with exit 0: **338/422**, all six required checks pass, no issues. The 321 previous strict IDs are all retained. Exactly 17 assigned IDs are added; 0773 remains open for source/missing-image evidence.\n\n`checks/ACTUAL.strict338-vs321.net17-and-science-context.json` lists the exact IDs, whole Memory deltas, and science versus context bindings. The eight changed M rows comprise five retained genuine M6 judgments and three final M3 judgments; 414 baseline rows and all 75 card rows are exact. Genuine P18/A18 and D/V artifacts are selected without new scientific votes by this integrator. Original description dissent is preserved.\n\n`config/central.current422.energy18.inactive.final.config.json` and `checks/REBUILD.energy18-final.physical-exact-map.v3.json` select the actual report inputs. `scripts/rebuild_final_sparse_host.readonly-v3.py` can recreate a **fresh** ignored host with physical JSON aliases and exact read-only image sources; its optional second argument selects a new tmp host. It prints its receipt and does not change this packet. Do not repeat the single central run in this assignment.\n\nAll 697 protected active input files and the earlier 57-file preparation seal remain exact. No active integration, registry/ledger write, source/course clearance, completed learner/lab trial, Human Approval or whole-course M7 grant is claimed. e64/c21 and existing source/course holds remain. Parent inspection precedes any later action. This finite task stops at selector/seal.\n'''
(R/'README.actual-inactive-integration.md').write_text(readme)
selector={'schemaVersion':1,'createdAtUTC':now,'role':'Final inactive Energy18 integration; actual report and finite provenance, no new scientific decisions','inputs':inputs,'actualCentralReport':bind(reportpath),'actualCentralCommand':bind(R/'checks/CENTRAL.exactly-one-final.command.actual.json'),'finalConfig':bind(R/'config/central.current422.energy18.inactive.final.config.json'),'physicalRebuildMap':bind(R/'checks/REBUILD.energy18-final.physical-exact-map.v3.json'),'readonlyRebuildScript':bind(R/'scripts/rebuild_final_sparse_host.readonly-v3.py'),'actualNetIdsAndScienceContext':bind(R/'checks/ACTUAL.strict338-vs321.net17-and-science-context.json'),'postCentralProtected697':bind(R/'checks/PROTECTED697.actual-after-and-baselines.json'),'actualFiniteClosure':bind(R/'checks/FINAL.actual-one-central-preservation-closure.json'),'preparedCheckpointSelector':bind(R/'INPUTS.prepared-inactive-energy18.readonly-v2.selector.json'),'originalPreparationSeal':inputs['preparedCheckpointSeal'],'assigned18GoalIds':sorted(scope),'actualStrictCount':338,'actualNetNewIds':17,'old321Retained':True,'fullCentralRuns':1,'requiredChecksPass':6,'issues':[],'newScientificVotes':0,'activeIntegration':False,'HumanApproval':False,'humanOrLabTrials':False,'sourceCourseApproval':False,'M7Grant':False,'strictCompletionReady':False,'missingRequiredInputs':[],'finite':'STOP; parent inspection required'}
selectorpath=R/'INPUTS.final-energy18-inactive-integration.physical-selector.json';write(selectorpath,selector)
fs=[bind(p) for p in sorted(R.rglob('*')) if p.is_file() and not p.is_symlink() and p!=sealpath]
seal={'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Finite inactive Energy18 technical integration; one actual central, zero new scientific votes','root':str(R),'fileCount':len(fs),'totalBytes':sum(f['bytes'] for f in fs),'files':fs,'finalSelector':bind(selectorpath),'actualStrict':338,'old321Retained':True,'netNewIds':17,'actualFullCentralRuns':1,'newScientificVotes':0,'activeIntegration':False,'HumanApproval':False,'M7Grant':False,'finite':'STOP; parent must inspect before any integration'}
write(sealpath,seal)
for f in j(sealpath)['files']:check(f)
for f in j(selectorpath)['inputs'].values():check(f)
print(json.dumps({'selector':bind(selectorpath),'seal':bind(sealpath),'actualReport':bind(reportpath),'netComparison':bind(R/'checks/ACTUAL.strict338-vs321.net17-and-science-context.json'),'fileCount':len(fs),'totalBytes':sum(f['bytes'] for f in fs),'hostRegularBytes':cachebytes,'actualStrict':338,'net17':True,'old321Retained':True,'STOP':True},indent=2))
