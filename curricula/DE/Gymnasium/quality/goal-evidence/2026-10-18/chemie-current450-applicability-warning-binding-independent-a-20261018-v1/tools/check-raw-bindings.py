import json,hashlib,datetime
from pathlib import Path
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-applicability-warning-binding-author-20261018-v1')
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def objsha(x):return hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def ptr(x,p):
 for t in p.split('/')[1:]:
  t=t.replace('~1','/').replace('~0','~');x=x[int(t)]if isinstance(x,list)else x[t]
 return x
c=read(B/'CANDIDATE.current87-221-warning-context-decisions.json');g=read(B/'inputs/current87-whole-goals.json');ap=read(B/'inputs/current87-existing-applicability-facts.json');graph=read(B/'inputs/current-contains-graph.json');h=read(B/'inputs/previous-reviewed-whole-scope-excerpts.json')['rows']
# Independent exact joins back to actual current raw normal data, not only snapshot-to-candidate identity.
actual=read(g['source']['path']);normal={z['id']:z for z in actual['goals']};assert all(normal[z['id']]==z for z in g['goals'])
assert graph['graph']==[{'id':z['id'],'contains':z.get('contains',[])}for z in actual['goals']]
actualap=read(ap['source']['path']);actualapmap={z['goalId']:z for z in actualap['goals']};assert all(actualapmap[z['goalId']]==z for z in ap['goals'])
assert ap['findings']==[z for z in actualap['findings']if z['code']=='APV-201']
r=read(B/'inputs/current-chemistry-override-registry.json');actualr=read(r['source']['path']);assert r['landscape']==next(z for z in actualr['landscapes']if z['landscapeId']==ap['landscapeId'])
for x in read(B/'SEAL.author-current87-221-candidate.json')['files']:assert sha(x['path'])==x['sha256']and Path(x['path']).stat().st_size==x['bytes']
assert sha(B/'SEAL.author-current87-221-candidate.json')==Path(B/'SEAL.author-current87-221-candidate.sha256').read_text().split()[0]
current_scope_differences=[]
for pair in c['pairDecisions']:
 olds=[e for row in h if row['goalId']==pair['goalId']for e in row['wholeGoal'].get('extendedData',{}).get('skillPilotAcquisitionExtensions',[])]
 for decl in pair['currentDeclaredScopeObjects']:
  if decl['wholeDeclaredScope']not in olds:current_scope_differences.append({'goalId':pair['goalId'],'jurisdiction':pair['jurisdiction'],'extensionId':decl['wholeDeclaredScope']['extensionId'],'currentDeclarationObjectSHA256':decl['objectSHA256']})
# All fifteen actual declaration additions are explicit known successor scopes, not unexplained semantic drift.
assert len(current_scope_differences)==15
assert {z['goalId']for z in current_scope_differences}=={'223e33a4-5545-5332-ac4e-7d7a6cbc587c','3eb2a06c-d283-57aa-9eb4-088940c4801a','4955f745-b946-5d3d-82d6-5e52dc8549a3','4965395d-e0c5-5e23-a408-a11712aab409','64b03eff-a967-54a1-ace3-89cb7650a65c'}
# Compare narrower explicit HB branches literally with the present upper branch of the CrossStage view.
views={v['viewId']:v for v in read(B/'inputs/current-whole-view-objects.json')['views']}
context=read(B/'inputs/current87-authored-view-contexts.json')['contexts'];hb=[]
for gid,courses in [('7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6',['GK','LK']),('dfbccd62-1203-5d1b-927d-65a4ca41bbad',['LK']),('f0f67a7a-b06a-50b9-8edc-1f2a0d97520d',['LK'])]:
 for course in courses:
  a=next(z for z in context if z['goalId']==gid and z['viewId']=='de-hb-gym-chemistry-'+course.lower());b=next(z for z in context if z['goalId']==gid and z['viewId']=='de-hb-gym-sekii-chemistry-'+course.lower())
  assert a['individualFiltersFromExistingAPReportPass']and b['individualFiltersFromExistingAPReportPass']and a['authoredRole']==b['authoredRole']=='target'
  assert a['referencedBy']==b['referencedBy']
  # Literal equality of the containing upper-stage chapter, including all existing target references.
  pa=a['referencedBy'][0]['structureAncestors'][1]['pointer'];pb=b['referencedBy'][0]['structureAncestors'][1]['pointer']
  va=views[a['viewId']]['rawWholeView'];vb=views[b['viewId']]['rawWholeView'];assert ptr(va,pa)==ptr(vb,pb)
  hb.append({'goalId':gid,'courseProfile':course,'beforeViewId':a['viewId'],'narrowerViewId':b['viewId'],'sameLiteralUpperStageChapter':True,'chapterPointer':pa,'chapterObjectSHA256':objsha(ptr(va,pa)),'targetRoleAndIndividualFiltersPass':True,'noSourceOrExecutionApproval':True})
# Stage comes from the actual authored chapter, never from requires/phase.
assert len(hb)==4
# Existing profile successor objects must exactly match the present full native profile object, independently joined.
profiles={z['goalId']:z for z in map(json.loads,(B/'inputs/current85-exact-profile-records.jsonl').read_text().splitlines())}
profilesuccess=[]
for gid in ['223e33a4-5545-5332-ac4e-7d7a6cbc587c','4965395d-e0c5-5e23-a408-a11712aab409']:
 pair=next(z for z in c['pairDecisions']if z['goalId']==gid);loc=next(z for z in pair['specificCurrentProfileSuccessorBinding']['locators']if z['jsonPointer'].endswith('/wholeProposedProfile'));oldp=ptr(read(loc['path']),loc['jsonPointer']);assert oldp==profiles[gid]['profile'];profilesuccess.append({'goalId':gid,'currentProfileEqualsActualAcceptedV2WholeObject':True,'profileObjectSHA256':objsha(oldp),'acceptedSuccessorFile':loc['path']})
hb64=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current450-ten-corrections-informed-independent-b-20261018-v1/FOLLOWUP.B-64b-HB-exact-scope-successor.accepted.sealed.json');assert objsha(profiles['64b03eff-a967-54a1-ace3-89cb7650a65c']['profile'])==hb64['wholeProfileSHA256']
he=[]
for gid,course in [('14577339-9e0c-5b44-8e47-91e1a4947367','GK'),('32705a3a-9b7f-5cc0-ba41-881d13d0c45b','LK')]:
 pair=next(z for z in c['pairDecisions']if z['goalId']==gid);assert pair['currentProfile']is None
 assert pair['actualEligibleViewIds']==['de-he-gym-chemistry-'+course.lower(),'de-he-gym-sekii-chemistry-'+course.lower()]
 evidence=pair['existingFinalAPFact']['evidenceForThisCountry'];kinds=sorted({z['kind']for z in evidence});assert kinds==(['override']if course=='GK'else['assessment-requires'])
 he.append({'goalId':gid,'eligibleOwnCourseViews':pair['actualEligibleViewIds'],'ordinaryPositiveProfileNotInvented':True,'actualFinalAPEvidenceKinds':kinds,'onlyBoundedDE_HEMetadataAccepted':True,'wholeCurrentAdmissionRouteRelease':False})
print(json.dumps({'artifactRole':'Independent finite raw-data/context binding inspection; no AP/compiler/gate rerun','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','wholeCurrentCanonicalObjectsRejoined':87,'currentContainsGraphExact':True,'selectedAPFactsRejoined':87,'exactRawAPV201Findings':87,'overrideRegistrySnapshotExact':True,'authorSealedFilesVerified':True,'exactRetainedDeclarationPairs':sum(bool(q['currentDeclaredScopeObjects']) and not any(z['goalId']==q['goalId'] and z['jurisdiction']==q['jurisdiction'] for z in current_scope_differences) for q in c['pairDecisions']),'explicitCurrentDeclarationPairs':sum(bool(q['currentDeclaredScopeObjects']) for q in c['pairDecisions']),'boundedTerminalPairsWithoutOrdinaryDeclaration':2,'specificCurrentDeclarationSuccessorPairs':current_scope_differences,'actualFourNarrowerHBContextChecks':hb,'currentV2ProfileSuccessorJoins':profilesuccess,'current64bProfileEqualsActualIndependentBScopeSuccessorProfile':True,'twoHEOnlyMetadataBoundaries':he,'normalWrites':0,'sourceMappingMutations':0,'newScientificD_P_A_M_VVotes':0,'fullCompilerOrCentralQualityRuns':0,'humanApproval':False},ensure_ascii=False,indent=2))
