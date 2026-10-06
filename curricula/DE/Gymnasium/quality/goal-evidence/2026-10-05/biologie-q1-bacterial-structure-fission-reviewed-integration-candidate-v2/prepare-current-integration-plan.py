#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare explicit Bacteria changes from verified current author/review inputs."""
from pathlib import Path
from datetime import datetime,timezone
import copy,hashlib,json,shutil
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
PREP=OWN.parent/'biologie-q1-bacterial-structure-fission-native-candidate-v1';ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(name,v):(OWN/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def spans(t):
 p=t.index('[',t.index('"subjects"'))+1;d=json.JSONDecoder();out={}
 while True:
  while t[p].isspace() or t[p]==',':p+=1
  if t[p]==']':return out
  v,n=d.raw_decode(t[p:]);out[v['subject']]=(p,p+n,v,t[p:p+n]);p+=n
assert not (OWN/'integration-plan.json').exists()
current=(ROOT/REG).read_text();parts=spans(current);bio=copy.deepcopy(parts['biologie'][2]);(OWN/'central-registry.before.snapshot.json').write_text(current)
bio['semanticAtomicityConfigPath']=str(REL/'full-atomicity.config.json');bio['memoryReviewConfigPath']=str(REL/'full-memory.config.json');bio['positiveEvidenceConfigPaths'].append(str(REL/'positive-evidence.config.json'))
seven='7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f';newids=read(OWN/'positive-evidence.config.json')['scope']['goalIds'];newindex=str(REL/'native-finalbook/resolution-index.json')
owners=[p for p in bio['resolutionIndexPaths'] if any(r['goalId']==seven for r in read(ROOT/p)['resolutions'])];assert len(owners)==1 and not any(r['goalId']==seven for r in bio['resolutionSupersessions'])
assert not set(newids)&{r['goalId'] for p in bio['resolutionIndexPaths'] for r in read(ROOT/p)['resolutions']}
sup={'goalId':seven,'supersededIndexPath':owners[0],'replacementIndexPath':newindex};bio['resolutionSupersessions'].append(sup);bio['resolutionIndexPaths'].append(newindex)
replacement=json.dumps(bio,ensure_ascii=False,indent=2).replace('\n','\n    ');a,b=parts['biologie'][:2];proposed=current[:a]+replacement+current[b:];(OWN/'central-registry.proposed.json').write_text(proposed);assert all(parts[s][3]==spans(proposed)[s][3] for s in parts if s!='biologie')
write('central-biologie-future.config.json',{**read(ROOT/REG),'subjects':[bio]})
prepared=read(PREP/'prepared-inputs.freeze.json')['files'];assert len(prepared)==43;delta=[];unchanged=[]
for row in prepared:
 expected=row['sha256'].removeprefix('sha256:');assert sha(ROOT/row['preparedPath'])==expected
 before=row['currentActiveSHA256'];before=before.removeprefix('sha256:') if before else None
 actual=sha(ROOT/row['path']) if (ROOT/row['path']).is_file() else None;assert actual==before,row['path']
 if not row['activeChangeRequired']:assert sha(ISO/row['path'])==expected;unchanged.append({'path':row['path'],'sha256':expected});continue
 source=OWN/'prospective-input-tree'/row['path'] if row['path']==QA else ROOT/row['preparedPath']
 futurehash=sha(source);assert sha(ISO/row['path'])==futurehash
 delta.append({'futureActivePath':row['path'],'prospectiveCopyPath':str(source.relative_to(ROOT)),'sha256':futurehash,'activeSHA256Before':before,'bytes':source.stat().st_size})
assert len(delta)==30 and len(unchanged)==13
old=read(ROOT/CAN);assert sha(ROOT/CAN)==sha(PREP/'current-canonical.before.snapshot.json');future=read(ISO/CAN);a={g['id']:g for g in old['goals']};b={g['id']:g for g in future['goals']};newgoal=list(b.keys()-a.keys());assert newgoal==['49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd']
changes=[]
for gid in a:
 fields=[k for k in a[gid].keys()|b[gid].keys() if a[gid].get(k)!=b[gid].get(k)]
 if fields:changes.append({'goalId':gid,'fields':[{'field':k,'beforeExists':k in a[gid],'before':a[gid].get(k),'afterExists':k in b[gid],'after':b[gid].get(k)} for k in sorted(fields)]})
assert {x['goalId'] for x in changes}=={'96bdf495-2801-57e4-a0da-ce3bf91e402c','5b2571d9-f079-52b2-b21b-8f389c7409f4','1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a'}
added={'afterGoalId':'5b2571d9-f079-52b2-b21b-8f389c7409f4','goal':b[newgoal[0]]}
baseline=read(PREP/'baseline-active-biology.report.json')['subjects'][0];assert baseline['subject']=='biologie' and baseline['strictComplete']==40 and baseline['denominator']==364
for gid in baseline['strictCompleteGoalIds']:assert a[gid]==b[gid]
write('integration-plan.json',{'schemaVersion':1,'status':'inactive_reviewed_candidate_waiting_actual_native_future42','preparedAtUTC':datetime.now(timezone.utc).isoformat(),'centralRegistryPath':REG,'currentBiologieRawEntrySHA256':hashlib.sha256(parts['biologie'][3].encode()).hexdigest(),'proposedBiologie':bio,'protectedMathPhysRawEntries':{s:hashlib.sha256(parts[s][3].encode()).hexdigest() for s in ['mathematik','physik']},'unrelatedChemieRegistryPreservedAtApplication':True,'canonicalPath':CAN,'explicitCanonicalFieldDeltas':changes,'newAtomicGoal':added,'explicitFutureDeltaFiles':delta,'unchangedPlannedInputs':unchanged,'plannedAuthorInputs':43,'explicitChangedAuthorInputs':30,'unchangedAuthorInputs':13,'currentDescriptionIndexPath':newindex,'currentDescriptionIndexSHA256':sha(OWN/'native-finalbook/resolution-index.json'),'oneExistingBindingSupersession':sup,'currentA365ConfigPath':str(REL/'full-atomicity.config.json'),'currentM365ConfigPath':str(REL/'full-memory.config.json'),'currentP2ConfigPath':str(REL/'positive-evidence.config.json'),'baselineCentralReportPath':str((PREP/'baseline-active-biology.report.json').relative_to(ROOT)),'baselineCentralReportSHA256':sha(PREP/'baseline-active-biology.report.json'),'protectedCurrentStrict40GoalIds':baseline['strictCompleteGoalIds'],'expectedTwoNewScientificGoalIds':newids,'bindingRestorationGoalIds':[seven],'expectedFutureStrict':42,'expectedDenominator':365,'other439WholeExistingGoalsPreserved':True,'sourceUmbrellaAndOtherScientificHoldsRetained':True,'forceCountOrStatus':False,'wholeSnapshotResetPermitted':False,'newIndependentScienceReviews':0,'humanApproval':False,'humanTrial':False,'activeWrites':0})
write('exact-current-scoped-rebase-and-ownership.actual.json',{'allCurrent40WholeGoalObjectsExact':True,'plannedAuthorInputs':43,'newActiveDeltaFiles':30,'exactUnchangedInputFiles':13,'existingChangedCanonicalGoalIds':[c['goalId'] for c in changes],'singleNewAtomicGoalId':newgoal[0],'denominatorChanges364To365DuePreservedReproductionCompanion':True,'soleExistingDSupersession':sup,'otherHistoricalIndicesPreserved':True,'allNonBiologieRawRegistryEntriesExact':True,'newIndependentScienceReviews':0,'activeWrites':0})
shutil.copytree(OWN,ISO/REL,dirs_exist_ok=True)
print(json.dumps({'plan':str(REL/'integration-plan.json'),'deltaFiles':30,'unchangedFiles':13,'expectedFutureStrict':42,'expectedDenominator':365,'newScienceReviewClaims':0,'activeWrites':0}))
