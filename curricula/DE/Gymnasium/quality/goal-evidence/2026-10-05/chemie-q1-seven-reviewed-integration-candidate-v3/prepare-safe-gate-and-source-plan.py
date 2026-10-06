#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare exact reviewed safe deltas; keep the unresolved quantitative goal intact."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,shutil,copy,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);BASE=OWN.parent;AUTH=BASE/'chemie-q1-six-source-operator-remediation-current-candidate-v1';ISO=ROOT/'tmp/chemie-q1-seven-reviewed-integration-candidate-v3-native-root';SOURCEISO=ROOT/'tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';HOLD='d3cd250f-5221-589d-aa1c-44a4692d1acb';NEW='0d59b62e-d3f9-5969-b961-0c5e26316c04';CONTEXT='70b34ae7-4481-590c-9a02-516464750832';DA=BASE/'chemie-q1-seven-source-operator-current-independent-d-a-v1';P=BASE/'chemie-q1-seven-current-independent-p-v1';V=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-seven-source-operator-current-independent-v-qa-20261005-v1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def nativecopy(src,rel):
 dst=ISO/rel;dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.is_symlink():dst.unlink()
 shutil.copy2(src,dst)
def spans(t):
 p=t.index('[',t.index('"subjects"'))+1;d=json.JSONDecoder();out={}
 while True:
  while t[p].isspace() or t[p]==',':p+=1
  if t[p]==']':return out
  v,n=d.raw_decode(t[p:]);out[v['subject']]=(p,p+n,v,t[p:p+n]);p+=n
pre=read(OWN/'exact-input-and-current-scope.preflight.actual.json');safe=pre['safeSixScientificGoalIds'];current=(ROOT/REG).read_text();parts=spans(current);assert sha(ROOT/REG)==pre['currentRegistrySHA256'];chem=copy.deepcopy(parts['chemie'][2]);old=read(ROOT/CAN);before={g['id']:g for g in old['goals']};future=read(AUTH/'prospective-input-tree'/CAN)
# The old unresolved quantitative whole goal is deliberately not imported or reapproved.
for i,g in enumerate(future['goals']):
 if g['id']==HOLD:future['goals'][i]=copy.deepcopy(before[HOLD])
nextgoals={g['id']:g for g in future['goals']};assert nextgoals[HOLD]==before[HOLD]
assert all(before[r['goalId']]==nextgoals[r['goalId']] for r in pre['protectedChemie104WholeObjects'])
write(OWN/'prospective-input-tree'/CAN,future);nativecopy(OWN/'prospective-input-tree'/CAN,CAN)
files=[]
for row in read(AUTH/'final-current104-protection-and-prospective-input-tree.actual.json')['files']:
 rel=row['path']
 if HOLD in rel or rel in {CAN,QA}:continue
 src=ROOT/row['futurePath'];assert sha(src)==row['futureSHA256'];dest=OWN/'prospective-input-tree'/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest);nativecopy(dest,rel)
 files.append({'futureActivePath':rel,'prospectiveCopyPath':str(dest.relative_to(ROOT)),'sha256':sha(dest),'activeSHA256Before':sha(ROOT/rel) if (ROOT/rel).is_file() else None})
files.append({'futureActivePath':CAN,'prospectiveCopyPath':str(REL/'prospective-input-tree'/CAN),'sha256':sha(OWN/'prospective-input-tree'/CAN),'activeSHA256Before':sha(ROOT/CAN)})
# Restore only absent immutable read inputs by links; no output reaches these links.
sourceReceipt=read(AUTH/'current104-physical-author-shadow.actual.receipt.json');linked=[]
for row in sourceReceipt['readOnlyLinks']:
 rel=row['path'];dst=ISO/rel;src=SOURCEISO/rel
 if not dst.exists() and src.exists():dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(src.resolve());linked.append(rel)
# D7 native final tree is exported under the new owner, retaining d3cd deferral.
shutil.copytree(OWN/'native-finalbook',ISO/REL/'native-finalbook',dirs_exist_ok=True)
am=read(DA/'independent-current-a7-m7.scientific-decisions.json');dec={r['goalId']:r for r in am['rows']};aChanges=[];repl={}
for label in ['acids-derivatives','soaps','preservatives']:
 cp=next(p for p in chem['semanticAtomicityConfigPaths'] if p.endswith('/a-'+label+'.config.json'));cfg=read(ROOT/cp);rows=list(map(json.loads,(ROOT/cfg['reviewPath']).read_text().splitlines()));prior=copy.deepcopy(rows);touched=[]
 for r in rows:
  gid=r['goalId']
  if gid not in safe:continue
  d=dec[gid]['semanticAtomicity'];assert d['status']=='atomic' and d['semanticAtomic'] is True
  r.update({'fingerprint':d['currentFingerprint'],'status':d['status'],'semanticAtomic':d['semanticAtomic'],'reviewedAt':am['reviewedAtUTC'],'reviewer':am['authority'],'reason':d['reason']+' Actual independent frozen decision: '+str((DA/'independent-current-a7-m7.scientific-decisions.json').relative_to(ROOT))+'.','suggestedSplit':d['suggestedSplit']});touched.append(gid)
 if label=='preservatives':
  assert NEW not in {r['goalId'] for r in rows};d=dec[NEW]['semanticAtomicity'];rows.append({'schemaVersion':1,'reviewId':cfg['reviewId'],'ruleVersion':cfg['ruleVersion'],'landscapeId':cfg['landscapeId'],'goalId':NEW,'fingerprint':d['currentFingerprint'],'status':'atomic','semanticAtomic':True,'reviewedAt':am['reviewedAtUTC'],'reviewer':am['authority'],'reason':d['reason']+' Actual independent frozen decision; exclusively HE advanced-level use operator.','suggestedSplit':[]});touched.append(NEW)
 assert all(r==next(x for x in rows if x['goalId']==r['goalId']) for r in prior if r['goalId'] not in safe)
 cfg['reviewPath']=str(REL/f'a-{label}.review.jsonl');cfg['reportPath']=str(REL/f'a-{label}.report.md');(OWN/f'a-{label}.review.jsonl').write_text('\n'.join(json.dumps(r,ensure_ascii=False,separators=(',',':')) for r in rows)+'\n');write(OWN/f'a-{label}.config.json',cfg);repl[cp]=str(REL/f'a-{label}.config.json');aChanges.append({'oldConfigPath':cp,'newConfigPath':repl[cp],'changedGoalIds':touched,'exactRetainedWholeRecords':len(prior)-sum(r['goalId'] in safe for r in prior),'heldD3RowUnchanged':all(r==next(x for x in rows if x['goalId']==r['goalId']) for r in prior if r['goalId']==HOLD)})
chem['semanticAtomicityConfigPaths']=[repl.get(p,p) for p in chem['semanticAtomicityConfigPaths']]
mcfg=read(ROOT/chem['memoryReviewConfigPath']);mrows=list(map(json.loads,(ROOT/mcfg['reviewPath']).read_text().splitlines()));mold=copy.deepcopy(mrows)
for gid in safe:
 d=dec[gid]['memory'];r=next((r for r in mrows if r['goalId']==gid),None)
 if r is None:r={'schemaVersion':1,'reviewId':mcfg['reviewId'],'ruleVersion':mcfg['ruleVersion'],'landscapeId':mcfg['landscapeId'],'goalId':gid};mrows.append(r)
 r.update({'fingerprint':d['currentFingerprint'],'status':'no_memory_needed','memoryUseful':False,'memoryGoalIds':[],'deckIds':[],'reviewedAt':am['reviewedAtUTC'],'reviewer':am['authority'],'reason':d['reason']+' Actual independent frozen memory decision: '+str((DA/'independent-current-a7-m7.scientific-decisions.json').relative_to(ROOT))+'.'})
assert len(mold)==376 and len(mrows)==377;assert all(r==next(x for x in mrows if x['goalId']==r['goalId']) for r in mold if r['goalId'] not in safe)
shutil.copy2(ROOT/mcfg['cardReviewPath'],OWN/'m-current-full.cards.review.jsonl');oldCardsSHA=sha(ROOT/mcfg['cardReviewPath']);mcfg.update({'reviewPath':str(REL/'m-current-full.review.jsonl'),'cardReviewPath':str(REL/'m-current-full.cards.review.jsonl'),'reportPath':str(REL/'m-current-full.report.md')});(OWN/'m-current-full.review.jsonl').write_text('\n'.join(json.dumps(r,ensure_ascii=False,separators=(',',':')) for r in mrows)+'\n');write(OWN/'m-current-full.config.json',mcfg);chem['memoryReviewConfigPath']=str(REL/'m-current-full.config.json')
pcfg=read(P/'positive-evidence.config.json');pcfg['scope']['goalIds']=safe;pcfg['scope']['label']='Six independently reviewed safe Chemistry profiles; quantitative aggregate explicitly deferred; E1/G1 needsHuman; payloads exact';pcfg['reviewPath']=str(REL/'positive-evidence.safe-six.review.jsonl');write(OWN/'positive-evidence.config.json',pcfg)
plines=(P/'positive-evidence.independent.review.jsonl').read_text().splitlines();selected=[line for line in plines if json.loads(line)['goalId'] in safe];assert len(selected)==6;(OWN/'positive-evidence.safe-six.review.jsonl').write_text('\n'.join(selected)+'\n');chem['positiveEvidenceConfigPaths'].append(str(REL/'positive-evidence.config.json'))
newindex=str(REL/'native-finalbook/resolution-index.json');oldowners=[p for p in chem['resolutionIndexPaths'] if any(r['goalId']==CONTEXT for r in read(ROOT/p)['resolutions'])];assert len(oldowners)==1
sup={'goalId':CONTEXT,'supersededIndexPath':oldowners[0],'replacementIndexPath':newindex};chem['resolutionSupersessions'].append(sup);chem['resolutionIndexPaths'].append(newindex)
qafuture=read(AUTH/'prospective-input-tree'/QA);qacurrent=read(ROOT/QA);qold={r['goalId']:r for r in qacurrent['records']};qnew={r['goalId']:r for r in qafuture['records']};qnew[HOLD]=copy.deepcopy(qold[HOLD]);qafuture['records']=[qnew[r['goalId']] for r in qafuture['records']]
v=read(V/'independent-seven-current-visual-verdicts.json');vs={r['goalId']:r for r in v['rows']}
for gid in safe:
 r=qnew[gid];d=vs[gid];assert d['decision']=='KEEP' and d['machineContentApproved'] and d['machineUmlautsAndLabelsApproved'];asset='sha256:'+sha(ISO/r['publicAssetPath']);assert asset==r['assetSha256']=='sha256:'+d['original']['sha256'].removeprefix('sha256:');assert all(sha(ISO/Path(c['path']).relative_to(SOURCEISO.relative_to(ROOT)))==asset.removeprefix('sha256:') for c in d['copies'])
 if gid in qold:
  for k in ['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer']:r[k]=copy.deepcopy(qold[gid][k])
 r.update({'umlautsCorrectChatGpt':'yes','contentApprovedChatGpt':'yes','chatGptReviewedAt':v['reviewedAtUTC'],'chatGptReviewer':v['reviewer'],'chatGptNotes':d['scientificDecision']+' '+d['actualPhoneDecision']+' '+d['actualPCDecision'],'aiApproved':'yes','aiApprovedAssetSha256':asset,'aiReviewedAt':v['reviewedAtUTC'],'aiReviewer':v['reviewer'],'aiNotes':'Actual independent original/360/680/current DEEN/PDF/HTML KEEP. '+d['scientificDecision']+' '+json.dumps(d['representationLimits'],ensure_ascii=False)+' Source verdict: '+str((V/'independent-seven-current-visual-verdicts.json').relative_to(ROOT))+'. Generation is not approval; human fields unchanged.'})
assert all(qold[g]==qnew[g] for g in qold if g not in safe)
write(OWN/'prospective-input-tree'/QA,qafuture);nativecopy(OWN/'prospective-input-tree'/QA,QA);files.append({'futureActivePath':QA,'prospectiveCopyPath':str(REL/'prospective-input-tree'/QA),'sha256':sha(OWN/'prospective-input-tree'/QA),'activeSHA256Before':sha(ROOT/QA)})
proposed=current[:parts['chemie'][0]]+json.dumps(chem,ensure_ascii=False,indent=2).replace('\n','\n    ')+current[parts['chemie'][1]:];(OWN/'central-registry.proposed.json').write_text(proposed);assert all(parts[s][3]==spans(proposed)[s][3] for s in parts if s!='chemie');write(OWN/'central-chemie-future.config.json',{**read(ROOT/REG),'subjects':[chem]})
fielddeltas=[]
for gid in before:
 fields=[{'field':k,'beforeExists':k in before[gid],'before':before[gid].get(k),'afterExists':k in nextgoals[gid],'after':nextgoals[gid].get(k)} for k in sorted(before[gid].keys()|nextgoals[gid].keys()) if before[gid].get(k)!=nextgoals[gid].get(k)]
 if fields:fielddeltas.append({'goalId':gid,'fields':fields})
assert HOLD not in {r['goalId'] for r in fielddeltas};assert set(r['goalId'] for r in fielddeltas)==set(safe)-{NEW}|{'47a40c98-ab20-5246-85e3-3abe5a9e95ed'}
write(OWN/'integration-plan.json',{'schemaVersion':1,'status':'inactive_safe_six_plan_waiting_actual_native_checks_and_root_review','atUTC':datetime.now(timezone.utc).isoformat(),'explicitFutureDeltaFiles':files,'explicitCanonicalFieldDeltas':fielddeltas,'explicitNewWholeGoals':[nextgoals[NEW]],'preservedWholeCurrentQuantitativeGoalId':HOLD,'noContradictedAtomicDecisionAdopted':True,'explicitDeferredDescriptionGoalIds':[HOLD],'centralRegistryPath':REG,'canonicalPath':CAN,'proposedChemie':chem,'currentChemieRawEntrySHA256':hashlib.sha256(parts['chemie'][3].encode()).hexdigest(),'protectedOtherRawRegistryEntries':{s:hashlib.sha256(parts[s][3].encode()).hexdigest() for s in parts if s!='chemie'},'expectedSafeNewScientificGoalIds':safe,'restoredContextBindingGoalIds':[CONTEXT],'protectedCurrentStrict104GoalIds':[r['goalId'] for r in pre['protectedChemie104WholeObjects']],'protectedCurrentBiologieStrict49GoalIds':pre['protectedBiologie49GoalIds'],'baselineCentralReportPath':pre['baselineCentralReportPath'],'baselineCentralReportSHA256':pre['baselineCentralReportSHA256'],'safeFutureExpectedStrict':110,'safeFutureExpectedDenominator':377,'expectedCountsDoNotOverrideNativeChecks':True,'wholeSnapshotResetPermitted':False,'explicitHistoricalRemovalPlan':[],'humanApproval':False,'humanTrial':False,'activeWrites':0})
write(OWN/'actual-safe-A-M-P-V-and-ownership.delta.json',{'atUTC':datetime.now(timezone.utc).isoformat(),'actualNewAOwners':aChanges,'fullMemory377Rows':len(mrows),'oldMemory371WholeRowsExact':sum(r['goalId'] not in safe for r in mold),'fullMemoryCardReviewSHA256':oldCardsSHA,'cardReviewExactlyRetained':oldCardsSHA==sha(OWN/'m-current-full.cards.review.jsonl'),'sixPRecordsExactOriginalLinePayloads':True,'sixPProfilesExactInnerPayloads':True,'d3PRowNotAdopted':True,'oldQAUnrelated371WholeRecordsExact':sum(g not in safe for g in qold),'humanQAFieldsExactlyRetained':True,'currentAltTextRetainedNoOptionalRewording':True,'d3CurrentQARowUnchangedAndNewCandidateImageNotImported':True,'actualVSourceManifestPath':str((V/'independent-visual-review.final.freeze.json').relative_to(ROOT)),'onlyOneExistingDOwnerSupersession':sup,'readOnlyOriginalLinksAdded':linked,'existing104WholeGoalObjectsExact':True,'activeWrites':0,'humanApproval':False})
# Copy own writable configs/output paths physically, and exact current dependencies individually.
for src in OWN.rglob('*'):
 if src.is_file():nativecopy(src,src.relative_to(ROOT))
pending=chem['semanticAtomicityConfigPaths']+chem['positiveEvidenceConfigPaths']+[chem['memoryReviewConfigPath']]+chem['resolutionIndexPaths'];seen=set();added=[]
def linkfile(src):
 rel=src.relative_to(ROOT);dest=ISO/rel
 if not dest.exists():dest.parent.mkdir(parents=True,exist_ok=True);dest.symlink_to(src.resolve());added.append(str(rel))
while pending:
 rel=pending.pop()
 if rel in seen:continue
 seen.add(rel);src=ROOT/rel
 if not src.is_file():continue
 linkfile(src)
 if src.suffix not in {'.json','.jsonl'}:continue
 try:data=read(src)
 except ValueError:continue
 def walk(v):
  if isinstance(v,dict):
   for x in v.values():walk(x)
  elif isinstance(v,list):
   for x in v:walk(x)
  elif isinstance(v,str) and v.startswith(('app/','curricula/','contracts/','docs/','backend/')) and Path(v).suffix in {'.json','.jsonl','.md'} and (ROOT/v).is_file():pending.append(v)
 walk(data)
 if src.name=='resolution-index.json':
  for group in data.get('groups',[]):
   if 'artifactDirectory' in group:
    for p in (src.parent/group['artifactDirectory']).rglob('*'):
     if p.is_file() and p.suffix in {'.json','.jsonl','.md','.pdf','.html'}:linkfile(p)
write(OWN/'additional-current-readonly-dependencies.actual.json',{'additionalExactReadOnlyLinks':added,'count':len(added),'noFullRepositoryCopy':True,'activeWrites':0})
print(json.dumps({'preparedSafeScientificGoals':6,'preparedExistingContextBindings':1,'heldOldQuantitativeGoalWholeUnchanged':True,'explicitFutureFiles':len(files),'newWholeGoals':1,'actualChangedExistingGoalObjects':len(fielddeltas),'cardRowsExact':True,'activeWrites':0}))
