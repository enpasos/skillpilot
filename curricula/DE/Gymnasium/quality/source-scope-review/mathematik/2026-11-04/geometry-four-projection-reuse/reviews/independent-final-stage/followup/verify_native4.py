from pathlib import Path
import json,gzip,hashlib,functools,ast,collections
F=Path(__file__).resolve().parent;H=F.parent.parent;R=H.parents[1];N=H/'geometry-four-projection-reuse-native-20261104-v1';E=H/'geometry-four-source-and-guard-followup-20261104-v1';C=E/'check-host'
read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):return {'path':str(p.relative_to(R)),'sha256':sha(p)}
assert sha(N/'candidate.json.gz')=='2017f30338bdc5efea5124241c937d9cb2b60d4fbded84b35ad83aed6491d4d2';assert sha(N/'candidate-input-hashes.json')=='57a94ebcc308cfc05ce01a0452f91e9cafa6febafcc66c40e028b503cf475cca';assert (N/'input-manifest.json').read_bytes()==(E/'manifest.effective-source-guard-followup.json').read_bytes()
inputs=read(N/'candidate-input-hashes.json');assert len(inputs)==3582
for p,h in inputs.items():assert sha(N/'candidate-data'/p)==h,p
for x in read(E/'manifest.effective-source-guard-followup.json')['files']:assert inputs[x['path']]==x['candidateSha256'],x['path']
classes=read(N/'runtime-class-hashes.json');sources=read(N/'main-source-hashes.json');sampler=read(N/'sampler-class-hashes.json');assert len(classes)==1379 and len(sources)==482
for mapping in [classes,sources]:
 for p,h in mapping.items():assert sha(Path(p))==h,p
for p,h in sampler.items():assert sha(N/'classes'/p)==h,p
for p,h in sources.items():assert sha(R/'backend/src/main/java'/p.split('/backend/src/main/java/')[1])==h,p
execution=read(N/'candidate.execution.json');assert execution['exitCode']==0 and execution['inputsSourcesAndRuntimeClassesUnchanged']
for p,h in execution['ownSourceHashes'].items():assert sha(N/p)==h,p
assert (N/'MatrixFiniteNativeProbe.java').read_bytes()==(H/'statistics-pyramid-existing-route-native-20261104-v1/MatrixFiniteNativeProbe.java').read_bytes()
old=json.load(gzip.open(H/'statistics-pyramid-existing-route-native-20261104-v1/candidate.json.gz','rt'));actual=json.load(gzip.open(N/'candidate.json.gz','rt'));assert actual['actualScopeCount']==161 and actual['actualUnionCount']==46 and actual['masteryScenarioCount']==1
assert actual['measurementRepositoryMutationCount']==actual['measurementEventCount']==0 and actual['inertLearnerUnchanged']
assert actual['separateInventoryMockSetupSaves']==actual['separateInventoryMockSetupEvents']==15
mod=ast.parse((F.parent/'independent_scope.py').read_text());exec(compile(ast.Module(body=[x for x in mod.body if isinstance(x,ast.FunctionDef) and x.name in {'normalizer','closure'}],type_ignores=[]),str(F.parent/'independent_scope.py'),'exec'))
canonical={x['id']:x for x in read(C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')['goals']};direct=normalizer(canonical)
roles={x['scope']:x for x in read(F.parent/'all-view-roles.actual.json')['scopeRows']};before={x['scope']:x for x in old['scopes']};expected={x['scope']:x for x in read(F.parent/'independent-161-scope-and-mastery.actual.json')['rows']};ids={'803d910d-96d1-5118-b9ca-29e93d0da76d','d3c42193-f1b7-5c6d-a991-bf034d99359f','7bb3c312-f714-55e6-a31f-f31605a93760'};dd='dd1954f6-0941-55a9-88d2-e2980ed902fd';o='5748633c-113f-5ea8-9041-24da55919de7';e='e3c70a12-7886-51f7-8bcd-ed54865415d6';ed='ed5d869b-af4e-4b80-b34d-a2338e16ce34';rows=[];counts=collections.Counter();U=set();Ends=set();partial=0
for a in actual['scopes']:
 name=a['scope'];b=before[name];r=expected[name];T=set(b['targetGoalIds'])|({dd} if roles[name]['newAssessmentTarget'] else set());P=set(b['selectedProtectedTargetGoalIds'])|(T&ids)|(T&{dd});Ctx=closure(T,direct);Needed=closure(P,direct);unc=T-Needed;ends=unc-set().union(*(direct(i) for i in Ctx))
 for k,want in [('targetGoalIds',T),('selectedProtectedTargetGoalIds',P),('contextGoalIds',Ctx),('neededContextGoalIdsAtM0',Needed),('uncoveredTargetGoalIds',unc),('uncoveredEndpointGoalIds',ends)]:assert set(a[k])==want,(name,k)
 for k in ['personalCurriculumConfig','compositionViewIds','scopeDecision']:assert a[k]==b[k],(name,k)
 assert set(a['prerequisiteOnlyGoalIds'])==set(b['prerequisiteOnlyGoalIds'])
 for i,rs in a['effectiveDirectPrerequisitesByContextGoalId'].items():assert direct(i)==set(rs),(name,i)
 assert set(a['effectiveDirectPrerequisitesByContextGoalId'])==Ctx
 for k in ['unreadyAssessmentGoalIds','duplicateVisibleGoalPaths','duplicateStructureIds','missingVisibleGoalIds','unexpectedVisibleGoalIds']:assert not a[k],(name,k)
 assert a['authoritative'] is True
 assert set(b['uncoveredTargetGoalIds'])-unc==set(r['closedTargetGaps']);assert set(b['uncoveredEndpointGoalIds'])-ends==set(r['closedEndpointGaps']);assert not(ends-set(b['uncoveredEndpointGoalIds']))
 assert set(b['neededContextGoalIdsAtM0'])<=Needed
 for i in ids|{dd}:
  fact=a['allExistingProtectedEligibility'][i];assert fact['isTarget']==(i in T);assert fact['isSelectedProtectedObligation']==(i in P);assert fact['isContext']==(i in Ctx);assert fact['examReady']
 if e in P:
  M=(P-{e})|{ed};need=closure(P,direct,M);assert len(need)==8 and {e,o}<=need;assert closure(P,direct,M|{o})=={e};assert closure(P,direct,M|{e})==set();partial+=1
 for i in (P-set(b['selectedProtectedTargetGoalIds'])):assert i in closure(P,direct,P-{i}) and not closure(P,direct,P)
 counts.update({'scopes':1,'remainingTargetPairs':len(unc),'remainingEndpointPairs':len(ends),'validScopes':int(a['passed']),'invalidScopes':int(not a['passed']),'verifiedEffectiveDirectEdges':sum(len(rs)for rs in a['effectiveDirectPrerequisitesByContextGoalId'].values())});U.update(unc);Ends.update(ends)
 rows.append({'scope':name,'allFinalT_POnly_Context_DirectR_M0_Needed_U_EndpointsExact':True,'newProtectedPairs':r['newProtectedTargets'],'closedTargetPairs':r['closedTargetGaps'],'closedEndpointPairs':r['closedEndpointGaps'],'visibleHierarchyAndTaskReadinessClean':True})
assert counts['remainingTargetPairs']==2642 and len(U)==251;assert counts['remainingEndpointPairs']==1751 and len(Ends)==160;assert counts['validScopes']==17 and counts['invalidScopes']==144 and partial==132
out={'status':'PASS_INDEPENDENT_ACTUAL_NATIVE4_INPUT_CLASS_SOURCE_AND161_SCOPE_VERIFICATION_NOT_GLOBAL_COMPLETION','native':binding(N/'candidate.json.gz'),'nativeInputs':binding(N/'candidate-input-hashes.json'),'nativeInputManifest':binding(N/'input-manifest.json'),'execution':binding(N/'candidate.execution.json'),'sourceHashes':binding(N/'main-source-hashes.json'),'classHashes':binding(N/'runtime-class-hashes.json'),'inputFilesVerified':3582,'effectiveManifestLeavesVerified':306,'currentRootMainSourcesVerified':482,'actualRuntimeClassesVerified':1379,'runtimeMainBoundary':'Genuinely compiled G3 Main reused because all482 source bytes equal current Root and effective G4. Native4 is a new execution, not a new compilation claim.','nativeMasteryScenarios':1,'nativeScenario':'empty mastery M0','independentFinalGraphPartialMasteryCases':132,'partialMasteryBoundary':'Own mathematical demand reconstruction checked on actual Native4 direct relations; not an additional native runtime or frontier scenario.','noMeasurementWritesOrEvents':True,'separateMockInventorySetupSavesAndEvents':15,'counts':dict(counts),'uniqueUncoveredTargets':len(U),'uniqueUncoveredEndpoints':len(Ends),'rows':rows,'allOtherOriginal161FieldsRelevantToScopeStable':True,'noGlobalM7OrCIOrCompletionAcceptance':True,'stageApproval':False}
(F/'native4-independent.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':out['status'],'counts':out['counts'],'partialCases':partial}))
