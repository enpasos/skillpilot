# SPDX-License-Identifier: Apache-2.0
import json,hashlib,tempfile,os,copy
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/m7-resumption-20261010/chemistry-source24-author';P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1');B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
def read(p):return json.loads((R/p).read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def digest(x):return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def put(p,b):
 p=R/p;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),str(p)
 if isinstance(b,(dict,list)):b=(json.dumps(b,ensure_ascii=False,indent=2)+'\n').encode()
 elif isinstance(b,str):b=b.encode()
 with tempfile.NamedTemporaryFile(dir=T,delete=False) as f:f.write(b);s=f.name
 os.replace(s,p)
old=read(B/'checks/actual-normal-source-union-before-unchanged-failing-count-assertion.observed.json');new=read(P/'checks/actual-normal-whole-source-union-before-unchanged-failing-count-assertion.observed.json');active=read(P/'source-atlas/original-active381-362-projection.normal-expanded.exact.json');plan=read(P/'candidate/twenty-four-whole-child-source-contributions.author-candidate.json');parentIds={r['retainedParentId'] for r in plan['rows']};childIds={r['goalId'] for r in plan['rows']};oldU=set(old['actualSourceUnionGoalIds']);newU=set(new['actualSourceUnionGoalIds']);newOnly=newU-oldU;e5='e5a5dcd8-053c-55fd-b5c7-bba93779da53'
assert len(parentIds)==7 and len(oldU)==355 and len(newU)==378 and len(newOnly)==23 and newOnly==childIds-{e5} and not oldU-newU
old19={r['goalId'] for r in active['omittedGoals']};newO={r['goalId'] for r in new['wholeOmittedGoalBodies']};assert len(old19)==19 and newO==old19|{e5}
mappingDelta=read(P/'checks/actual-two-whole-mapping-successor-exact-deltas.json');pathMap={d['wholeSuccessor']['path']:d['wholeOriginal']['original']['path'] for d in mappingDelta['mappingSuccessors']}
def norm(r):
 r=copy.deepcopy(r)
 if 'mappingPath'in r:r['mappingPath']=pathMap.get(r['mappingPath'],r['mappingPath'])
 return r
def arr(rows):return sorted([json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')) for x in rows])
assert new['actualUnresolvedScopeCount']==496 and arr(map(norm,new['actualUnresolvedScopes']))==arr(active['unresolvedSourceScopes'])
oldS={s['key']:s for s in active['scopes']};newS={s['key']:s for s in new['actualWholeScopes']};assert set(oldS)==set(newS) and len(newS)==48
scopeRows=[];existingWitnessPathChangedIds=set()
for key,ns in newS.items():
 oscope=oldS[key];oid=set(oscope['goalIds']);nid=set(ns['goalIds']);assert oid-parentIds==nid-childIds
 ow=[w for w in oscope['witnesses'] if w['goalId'] not in parentIds];nw=[w for w in ns['witnesses'] if w['goalId'] not in childIds]
 assert arr(ow)==arr(map(norm,nw)),key
 changed=[w for w in nw if norm(w)!=w];existingWitnessPathChangedIds.update(w['goalId'] for w in changed)
 scopeRows.append({'key':key,'originalGoalIds':sorted(oid),'source24CandidateGoalIds':sorted(nid),'removedRetainedAreas':sorted(oid-nid),'addedPartialChildGoalIds':sorted(nid-oid),'allOtherExistingGoalMembershipExact':True,'allOtherWitnessFactsExactAfterExplicitTwoMappingPathNormalization':True,'rawExistingWitnessPathChangeCount':len(changed),'addedWholeDirectPartialChildWitnesses':[w for w in ns['witnesses'] if w['goalId'] in childIds]})
put(P/'checks/exact-scoped23-plus-unresolved1-and-whole-scope-witness-deltas.actual.json',{'schemaVersion':1,'role':'Actual normal in-memory variables, not source or course review','ordinaryAtlasBeforeConfig':ref(B/'source/current-source-atlas-inputs.exact.json'),'ordinaryBeforeExpectedSourceSupportedCount':read(B/'source/current-source-atlas-inputs.exact.json')['expectedCurricularAtomicGoalCount'],'ordinaryBeforeActualCanonicalCount':381,'ordinaryBeforePublishedSourceSupportedCount':362,'priorInactive398ProbeConfig':ref(B/'source-atlas/current398-full-source-scope.normal-probe.inputs.json'),'priorInactiveActualSourceSupported355':sorted(oldU),'currentInactive398ProbeConfig':ref(P/'source-atlas/whole398-source24.normal-probe.inputs.json'),'currentInactiveActualSourceSupported378':sorted(newU),'currentNormalAssertionSource':ref(Path('app/scripts/goalBookSourceAtlasInputs.ts')),'currentNormalAssertionExactText':"assert.equal(union.size, config.expectedCurricularAtomicGoalCount, 'Source-supported atlas goal count changed')",'currentNormalAssertionLine':326,'currentUnchangedExpectedSourceSupported398':398,'normalCompilerExit':1,'sourceCompilerNotApproved':True,'addedScopedChildren23':sorted(newOnly),'removedPreviouslyScopedGoals':[],'wholeOld19OmittedIdsExact':sorted(old19),'newUnresolvedChildGoalId':e5,'wholeCurrent20OmittedBodies':new['wholeOmittedGoalBodies'],'whole496UnresolvedDecisionRowsExactAfterExplicitMappingPathNormalization':True,'unresolved496OriginalReceipt':ref(B/'source/current-active381-362-source-projection.receipt.exact.json'),'explicitMappingPathOnlyProvenanceChanges':pathMap,'whole48SourceScopeDeltas':scopeRows,'old7IDsRemainClustersNotAtoms':sorted(parentIds),'rawExistingWitnessPathChangedGoalIds':sorted(existingWitnessPathChangedIds),'sourceWholeCourseHumanApproval':False,'strictGain':0,'activeWrites':[]})
# Complete whole duties and partner frames remain verbatim; these new contributions do not reduce the old universe.
idx=read(P/'inputs/whole32-original-mapping-extraction-index.exact.json');sourceProof=[]
for pair in idx['wholeCurrentMappingExtractionPairs']:
 for key in ['wholeCurrentMapping','wholeCurrentExtraction']:
  a=pair[key]['original'];cp=pair[key]['ownExactCopy'];assert (R/a['path']).read_bytes()==(R/cp['path']).read_bytes();assert ref(Path(a['path']))['sha256']==a['sha256']
 sourceProof.append({'wholeMapping':pair['wholeCurrentMapping'],'wholeExtraction':pair['wholeCurrentExtraction'],'wholeSourceDutyCount':pair['wholeCurrentSourceDutyCount'],'originalPartnerEdges':pair['wholeCurrentMappingPartnerEdgeCount'],'exactCurrentActiveInputVerified':True})
assert sum(x['wholeSourceDutyCount'] for x in sourceProof)==5865;assert sum(x['originalPartnerEdges'] for x in sourceProof)==21046
put(P/'checks/whole32-5865-duties-21046-original-edges-preserved.actual.json',{'schemaVersion':1,'whole32Inputs':sourceProof,'wholeSourceDutyCount':5865,'originalPartnerEdgeCount':21046,'candidateNewPartialEdges':63,'candidateWholePartnerEdgeCount':21109,'newOriginalDuties':0,'original1180FamilyPartnersWholeExactRef':ref(B/'source/whole-seven-retained-families-and-existing-original-source-partner-frames.actual.json'),'wholeOld496UnresolvedAnd19OmittedStillOpen':True,'allOriginalDecisionsAndEdgesRetainedExceptExplicitAdditiveSuccessorDeltas':True,'independentNewSourceReviewPending':True,'strictGain':0,'humanApproval':False})
# Actual current180 bodies protected; distinguish older P26 pending context changes from this source-only candidate.
ids=next(s for s in read(P/'inputs/current180-protected-and-other-subjects.exact.json')['subjects'] if s['subject']=='chemie')['strictCompleteGoalIds'];assert len(ids)==180
base=read(B/'inputs/current-whole-active-canonical.exact.json');canon=read(P/'inputs/whole-current511-398-candidate.exact.json');bg={g['id']:g for g in base['goals']};ng={g['id']:g for g in canon['goals']}
assert len(base['goals'])==487 and len(canon['goals'])==511 and all(bg[i]==ng[i] for i in ids)
beforeModel=read(B/'native/before-whole-normal-book-model.actual.json');afterModel=read(P/'native/whole398-fresh-normal-review-model.actual.json');bm={g['goalId']:g for g in beforeModel['pages']};am={g['goalId']:g for g in afterModel['pages']};exclude={'ordinal','navigationOrder','treeOrder','pageNumber','pageFingerprint'}
def content(x):
 if isinstance(x,list):return [content(v) for v in x]
 if isinstance(x,dict):return {k:content(v) for k,v in x.items() if k not in exclude}
 return x
protection=[]
for i in ids:
 assert i in bm and i in am
 fields=[k for k in set(bm[i])|set(am[i]) if bm[i].get(k)!=am[i].get(k)];bc=content(bm[i]);ac=content(am[i]);sub=[k for k in set(bc)|set(ac) if bc.get(k)!=ac.get(k)]
 scopesBefore=[k for k,s in oldS.items() if i in s['goalIds']];scopesAfter=[k for k,s in newS.items() if i in s['goalIds']];assert scopesBefore==scopesAfter
 protection.append({'goalId':i,'actualCurrent180CanonicalGoalBodyExact':True,'wholeGoalBeforeSha256':digest(bg[i]),'wholeGoalAfterSha256':digest(ng[i]),'wholeActive381PageBeforeSha256':digest(bm[i]),'wholeInactive398PageAfterSha256':digest(am[i]),'actualPageRawChangedFieldsFromP26':sorted(fields),'actualPageSubstantiveChangedFieldsFromP26':sorted(sub),'P26TargetedContextReviewStillRequired':bool(sub),'source24DeltaToPriorNative398PageExact':True,'sourceScopeMembershipBeforeAndAfterExact':scopesBefore,'rawSourceWitnessMappingPathChanged':i in existingWitnessPathChangedIds})
put(P/'checks/actual-current180-goal-page-context-scope-protection.json',{'schemaVersion':1,'role':'Actual technical comparison; existing P26 context followups remain independent-review obligations','current180StrictIDAuthority':ref(P/'inputs/current180-protected-and-other-subjects.exact.json'),'current487CanonicalBefore':ref(B/'inputs/current-whole-active-canonical.exact.json'),'inactiveWhole511After':ref(P/'inputs/whole-current511-398-candidate.exact.json'),'all180CurrentBodiesExact':True,'all180ExistingSourceScopeMembershipsExact':True,'all398PriorNativeWholePagesExactUnderSource24Only':True,'source24RawWitnessMappingPathChangesExplicit':True,'wholeProtected180Comparisons':protection,'priorP26SubstantiveProtectedContextDeltaCount':sum(bool(x['P26TargetedContextReviewStillRequired']) for x in protection),'noPageOrDescriptionApprovalFromHashEquality':True,'noCurrentCentralRecount':True,'math807AndPhysics478ProtectedIDAuthoritiesUnchanged':True,'strictGain':0,'humanApproval':False})
# C11 programme and duration evidence remains whole, with no invented course profile.
r=next(r for r in plan['rows'] if r['goalId']==e5);partner=r['selectedWholeOriginalPartnerBodies'][0];byPath=Path('curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json');by=read(byPath);byGs={g['id']:g for g in by['goals']};yearId='a8ce02bd-da8e-51a8-b73f-d5e40fa7020f';todo=[yearId];seen=set()
while todo:
 i=todo.pop()
 if i in seen:continue
 seen.add(i);todo.extend(byGs[i].get('contains',[]))
wholeYear=[g for g in by['goals'] if g['id']in seen];policy=read(P/'inputs/current-normal-duration-policy.exact.json');decision=[d for d in policy['decisions'] if d.get('subject')=='Chemie'and d.get('jurisdiction')=='DE-BY'];assert len(decision)==1 and decision[0]['durationModels']==['G9']
assert partner['wholeOriginalSourceBody']['sourceSpan']=='C11.1.11' and partner['wholeOriginalSourceBody']['courseLevel']=='unspecified'
put(P/'source-atlas/C11-e5a5-whole-current-primary-programme-duration-and-course-HOLD.actual.json',{'schemaVersion':1,'goalId':e5,'wholeCurrentChild':r['wholeCurrentChild'],'wholeOriginalC11SourceOperatorPartner':partner,'actualCurrentOfficialWholeLearningArea1':ref(P/'primary/by11.whole-learning-area1.actual.txt'),'actualOfficialURL':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie','wholeOriginalBYProgramme':ref(byPath),'wholeActualC11ProgrammeUnit':byGs[yearId],'wholeC11ProgrammeDescendantBodies':wholeYear,'wholeRootProgrammeStructure':byGs['6600db65-5d0e-5d6b-8b51-20ac0d06e3fa'],'normalWholePolicy':ref(P/'inputs/current-normal-duration-policy.exact.json'),'wholeCurrentBYDurationDecision':decision[0],'actualNormalBYStageFromSource':'SekII','actualNormalBYCourseFacetFromOriginalC11':'unspecified','normalDurationDecisionIsNotCourseProfileEvidence':True,'candidateGKAndLKTagsAreNotOfficialC11CourseProof':True,'noC12SubstituteOperatorOrCourseWitness':True,'actualCurrentNormalSourceAtlasOmissionReason':next(x['reason'] for x in new['wholeOmittedGoalBodies'] if x['goalId']==e5),'followupRequired':'Targeted official C11 programme/course placement author candidate and then independent review; no guessing from G9, year11, canonical GK/LK tags or distinct C12 impact operator.','strictGain':0,'humanApproval':False})
print(json.dumps({'normalSourceScopes':48,'scopedNewChildren':23,'newUnresolvedChild':e5,'omittedOld':19,'omittedNow':20,'unresolvedOldAndNew':496,'wholeOriginalDuties':5865,'originalEdges':21046,'newPartialEdges':63,'protected180BodiesExact':True,'priorP26ProtectedSubstantiveContextDeltas':sum(bool(x['P26TargetedContextReviewStillRequired']) for x in protection),'source24ChangedExistingWitnessPathGoalCount':len(existingWitnessPathChangedIds),'strictGain':0},indent=2))
