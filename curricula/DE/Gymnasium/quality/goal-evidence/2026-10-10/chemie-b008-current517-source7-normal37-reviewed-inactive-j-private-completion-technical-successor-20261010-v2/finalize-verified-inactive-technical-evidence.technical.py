from pathlib import Path
import hashlib,json,datetime
ROOT=Path('/home/enpasos/projects/skillpilot')
S=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-reviewed-inactive-j-private-completion-technical-successor-20261010-v2')
I=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1')
J=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-D27-P2-reviewed-inactive-integration-j-technical-20261010-v1')
A=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1')
def read(rel):return json.loads((ROOT/rel).read_text())
def bind(rel):
 p=ROOT/rel;raw=p.read_bytes();return {'path':str(rel),'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def write(rel,value):(ROOT/rel).write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
terminal=read(S/'checks/candidate-current398-central.attempt5.terminal.actual.json');assert terminal['actualExitCode']==0
r=read(S/'checks/candidate-current398-central.attempt5.actual.report.json');assert r['blockingIssueCount']==0
c={x['subject']:x for x in r['subjects']};assert all(all(x['status']=='pass' for x in y['requiredChecks']) for y in c.values())
assert [(c[k]['strictComplete'],c[k]['denominator']) for k in ['mathematik','physik','chemie','biologie','wirtschaftswissenschaften']]==[(807,807),(478,478),(206,398),(353,394),(261,311)]
latestBio353Path=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-ten-reviewed-active-adoption-technical-root-v1/checks/central.stdout.actual.txt');latest=read(latestBio353Path);latestBySubject={x['subject']:x for x in latest['subjects']};assert set(latestBySubject['biologie']['strictCompleteGoalIds'])==set(c['biologie']['strictCompleteGoalIds']);assert latest['blockingIssueCount']==0;assert all(set(latestBySubject[k]['strictCompleteGoalIds'])==set(c[k]['strictCompleteGoalIds']) for k in ['mathematik','physik','biologie','wirtschaftswissenschaften'])
base=read(I/'baseline/central.actual.report.json');b={x['subject']:x for x in base['subjects']};old=set(b['chemie']['strictCompleteGoalIds']);assert old==set(latestBySubject['chemie']['strictCompleteGoalIds']);new=set(c['chemie']['strictCompleteGoalIds']);assert len(old)==180 and old<=new
ib=read(I/'baseline/current-active-root-bindings.actual.json')['files'];oldChemBindings=[x for x in ib if 'CHEMIE' in x['path'] or '/chemie.' in x['path']];assert len(oldChemBindings)==3;assert all(bind(x['path'])==x for x in oldChemBindings)
p180=read(A/'checks/protected180-annotation-deltas-zero-and-inherited-five-route-bindings.actual.json');assert set(p180['protectedActiveStrictIDs'])==old
before={x['id']:x for x in read(b['chemie']['landscapePath'])['goals']};after={x['id']:x for x in read(A/'candidate/whole517.normal32-materialized.author-candidate.json')['goals']};oldDeltas=[]
for gid in sorted(old):
 fields=[k for k in set(before[gid])|set(after[gid]) if before[gid].get(k)!=after[gid].get(k)]
 if fields:
  assert fields==['requires'];oldDeltas.append({'goalId':gid,'changedFields':fields,'beforeRequires':before[gid]['requires'],'afterRequires':after[gid]['requires'],'alreadyPairedByGenuinePreviousProtected12Reviews':True,'currentlyNormalStrictComplete':gid in new})
assert len(oldDeltas)==5;assert not set(before)-set(after)
newids=sorted(new-old);assert len(newids)==26
q={'schemaVersion':1,'status':'TECHNICALLY_VERIFIED_REVIEWED_INACTIVE__ROOT_ADOPTION_PENDING','normalCentral':bind(S/'checks/candidate-current398-central.attempt5.actual.report.json'),'normalTerminal':bind(S/'checks/candidate-current398-central.attempt5.terminal.actual.json'),'oldChem180ActualReport':bind(I/'baseline/central.actual.report.json'),'oldChem180ActualTerminal':bind(I/'checks/baseline-central.terminal.actual.json'),'oldChem3ActiveInputsStillByteExact':oldChemBindings,'oldChem180ExactIDs':sorted(old),'candidateStrict206ExactIDs':sorted(new),'oldChem180RetainedCount':len(old&new),'lostOldStrictIDs':sorted(old-new),'netNewStrictCompleteIDs':newids,'netNewStrictCompleteCount':26,'alreadyStrictBeforeCurrentContextBindingsRestoredCount':5,'alreadyStrictBeforeCurrentContextBindingsRestored':oldDeltas,'bindingRestorationsNotCountedAsNetNewScientificCompletions':True,'newScientificReviewsByTechnicalAgent':0,'noOldCanonicalGoalIDsLost':True,'Math807ExactIDsRetained':set(b['mathematik']['strictCompleteGoalIds'])==set(c['mathematik']['strictCompleteGoalIds']),'Physics478ExactIDsRetained':set(b['physik']['strictCompleteGoalIds'])==set(c['physik']['strictCompleteGoalIds']),'Bio353LatestBasisCurrent':353,'Bio353ExactLatestStrictIDsRetained':True,'Bio353ActualLatestStrictIDReport':bind(latestBio353Path),'AllOtherFourSubjectsExactLatestStrictIDArraysRetained':True,'BioHistorical343ExactIDsRetained':set(b['biologie']['strictCompleteGoalIds'])<=set(c['biologie']['strictCompleteGoalIds']),'activeWrites':[],'humanApproval':False,'newScienceCandidateAuthorReviewsRemainTheirOriginalIndependentActors':True}
write(S/'checks/strict-old180-no-loss-new26-and-protected-subjects.actual.json',q)
originalJ=read(S/'checks/original-J-file-bindings.before-resume.actual.json')['files'];assert all(bind(x['path'])==x for x in originalJ)
protected=read(J/'checks/declared-protected-inputs.before.actual.json');assert all(bind(x['path'])==x for x in protected['files'])
additionalBindings=[]
for k,v in protected.items():
 if isinstance(v,dict) and 'path' in v and 'sha256' in v:
  actual=bind(v['path']);assert actual['sha256']==v['sha256'];additionalBindings.append(actual)
write(S/'checks/original-J-all352-files-and-declared-protected-active-review-inputs-remain-exact.actual.json',{'schemaVersion':1,'originalJAll352FilesByteExact':len(originalJ)==352,'originalJInputs':originalJ,'declaredActiveInputs':protected['files'],'genuineA_BAndPreviousHistorySeals':additionalBindings,'currentActiveRootWrites':[],'originalHistoricalWrites':[],'genuineReviewIndependenceClaimedByTechnicalAgent':False})
plan=read(S/'ROOT-ONLY.complete-adoption-copy-list-and-before-after-bindings.inactive.json')
for operation in plan['copyOperations']:
 src=operation['source'];actual=bind(src['path']);assert actual['sha256']==src['sha256'] and actual['bytes']==src['bytes'];beforeBinding=operation['before'];p=ROOT/operation['target'];assert p.is_file()==beforeBinding['exists']
 if p.is_file():assert bind(operation['target'])['sha256']==beforeBinding['sha256']
 assert operation['verifiedAfterSha256']==actual['sha256'] and operation['verifiedAfterBytes']==actual['bytes']
plan['status']='NORMAL_CENTRAL_VERIFIED_206_OF_CURRENT398__INACTIVE__ROOT_ADOPTION_AND_NORMAL_FINAL_STATUS_FLOORS_REQUIRED';plan['normalCentralTerminalPass']=bind(S/'checks/candidate-current398-central.attempt5.terminal.actual.json');plan['normalCentralReport']=bind(S/'checks/candidate-current398-central.attempt5.actual.report.json');plan['old180StrictIntersectionAndNet26Proof']=bind(S/'checks/strict-old180-no-loss-new26-and-protected-subjects.actual.json');plan['originalHistoricalAndActiveBytePreservationProof']=bind(S/'checks/original-J-all352-files-and-declared-protected-active-review-inputs-remain-exact.actual.json');plan['currentActiveAll9FloorsTerminalPass']=bind(S/'checks/current-active-all9-protected-floors.confirmed.terminal.actual.json');plan['candidateAffectedChemistryNormalLayerAM6Evidence']=bind(A/'checks/full-current-LayerA-Chemistry.actual.json');plan['currentActiveFloorsPassIsNotCandidateStatusRegeneration']=True;plan['candidateAll9FloorsAfterNormalStatusGenerationIsStillRootGate']=True;plan['candidateAll5RequiredChecksPass']=True;plan['expectedStrictCompleteNotYetCounted']=206;plan['activeChemStrictCountUnchanged180']=True
write(S/'ROOT-ONLY.complete-adoption-copy-list-and-before-after-bindings.inactive.json',plan)
print(json.dumps({'normalCheck':terminal['actualExitCode'],'blockingIssues':r['blockingIssueCount'],'candidateChem206':206,'retainedOld180':180,'newStrictIDs':newids,'restoredProtectedContextBindings':5,'copyOperations':len(plan['copyOperations']),'activeWrites':[]},ensure_ascii=False))
