from pathlib import Path
import json,hashlib,gzip,shutil,sys
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-current678-remaining33-active-root-v1'
S=Q/'wirtschaft-current678-remaining33-independent-combined-scope-root-v1/actual-final-current678-remaining33-combined-scope-nav-status-independent-KEEP.handoff.receipt.json'
T=Q/'wirtschaft-current678-SEM-P43-book-technical-independent-root-v1/actual-final-current678-SEM-P43-P336685-book-technical-independent-KEEP.receipt.json'
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def ck(b):
 p=R/b['path'];assert bind(p)==b,b['path'];return p
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
s=rd(S);t=rd(T);assert s['decision']=='KEEP_BOUNDED_CURRENT678_REMAINING33_WHOLE_SCOPE_NAV_STATUS_INTERACTION' and s['actualNetRouteOccurrenceGain']==174 and s['strictNet']==s['activeWrites']==0
assert t['decision']=='KEEP_TECHNICAL_BINDING_FOLLOWERS_ONLY' and ck(t['foreignCombinedScope'])==S
h=rd(ck(s['wholeAuthorFinalHandoff']));f=rd(ck(t['wholeAuthorHandoff']));assert ck(f['wholeAuthorHandoff'])==ck(s['wholeAuthorFinalHandoff'])
f['all43ActualNativePositiveProof']=f['actualAll43NativeFinal237cProof'];f['officialNativeSEMFPProof']=f['actualAll678OfficialFinal237cFPProof']
native=json.loads(gzip.decompress(ck(s['ownFreshNative678Positive']).read_bytes()));assert native['goalCount']==678 and native['compiler']['summary']['errors']==native['compiler']['summary']['warnings']==0
assert all(r['status']=='pass' for r in native['route']['rules'])
for key in ['foreignIndividualWholeNavStatusPOnlyPurposeReview','ownActualWholeContextAndRoleDecisions','ownActual21AdministrativeNoteFollowup','ownPortableManifest','ownThreeActualNegatives']:ck(s[key])
for key in ['oldRegistry','candidateRegistry','oldBookConfig','candidateBookConfig','oldKindLedger','newSEM','oldWholeP336Aggregate','newWholeP336','all43ActualNativePositiveProof','officialNativeSEMFPProof']:ck(f[key])
can=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';assert can.read_bytes()==ck(h['wholeBeforeCAN']).read_bytes();newcan=ck(h['wholeFinalAfterCAN']);assert bind(newcan)==s['wholeInert678']
changed=[]
for v in h['all35WholeBeforeAfterViewRows']:
 p=R/v['activePath'];assert p.read_bytes()==ck(v['before']).read_bytes();candidate=ck(v['candidate'])
 if p.read_bytes()!=candidate.read_bytes():changed.append((p,candidate))
assert len(changed)==32
oldguards=rd(Q/'wirtschaft-current645-company-finance-consumer-labour48-active-root-v1/actual-current645-fortyeight506-before-mutation-whole-input-guards.json');protected=oldguards['protectedWholeInputs']
protected=protected+[bind(ck(f['oldKindLedger']))]
assert len(protected)==1145 and all(bind(R/b['path'])==b for b in protected)
mutations=[(can,newcan),(ck(f['oldRegistry']),ck(f['candidateRegistry'])),(ck(f['oldBookConfig']),ck(f['candidateBookConfig']))]+changed
assert len(mutations)==35 and len(set(p for p,c in mutations))==35
for ap,cp in mutations:
 if ap==can:continue
 assert ap.read_bytes()!=cp.read_bytes()
O.mkdir(exist_ok=False);backup=O/'whole-active-before';backup.mkdir();rows=[]
for idx,(ap,cp) in enumerate(mutations):
 bp=backup/(f'{idx:02d}-'+ap.name);bp.write_bytes(ap.read_bytes());rows.append({'activePath':str(ap.relative_to(R)),'wholeBefore':bind(bp),'qualifiedCandidate':bind(cp)})
save('actual-current678-thirtythree359-before-mutation-whole-input-guards.json',{'actualMutations':rows,'protectedWholeInputs':protected,'wholeIndependentScope':bind(S),'wholeIndependentTechnicalFollower':bind(T),'threeSeparateWholeScientificSeals':s['qualified33WholeScienceSeals'],'all336OrdinaryP685ContractsExact':True,'strictNet':0,'humanRelease':'separate pending'})
for ap,cp in mutations:ap.write_bytes(cp.read_bytes())
assert all(bind(R/b['path'])==b for b in protected) and all(ap.read_bytes()==cp.read_bytes() for ap,cp in mutations)
receipt=save('actual-current678-thirtythree-qualified-materials359-country-accesses-active.receipt.json',{'status':'ACTUAL_33_SEPARATELY_QUALIFIED_MATERIALS_AND359_COUNTRY_REFERENCES_ACTIVE_PENDING_FRESH_CENTRAL','actualCanonicalNodes':678,'actualCurrentCurricularAtomic':336,'actualPracticeAssessment':297,'newWholeMaterialScientificClosures':33,'newPracticeNodes':33,'newScientificCurricularStrictClosures':0,'restoredCurricularStrictBindings':0,'strictNet':0,'actualChangedViews':32,'actualUnchangedNationalViews':2,'actualNewCountryPracticeTargetRefs':359,'actualNewNationalExplicitRefs':0,'actualWholeVisibleNewBindings':718,'actualBeforeAfterLocalRouteOccurrences':[174,0],'actualNetRestoredRouteBindings':174,'actualBeforeAfterLocalMissingGoalIDs':[33,0],'actualNetLocalGoalClosure':33,'all64Ordinary6974MemoryOrientationPOnlyRolesExact':True,'sixteenExistingPOnlyPracticeExceptionsBound':16,'actual22NewGKCompleteClosureIneligibleContextsRemainInvisible':True,'wholeHardPrerequisiteClosureOrCoverageIssues':0,'source16Original2134AndOrdinaryEvidenceExact':True,'all43OriginalPReviewBytesProfiles685CasesInputFPsStatusesAuthoritiesExact':True,'all336OrdinaryAnd640OldNonNavWholeObjectsUnchanged':True,'all645OldSemanticKindsStatusesBasesExact':True,'fiveNavSourceFPFollowersAnd33NewPracticeKindsOnly':True,'technicalPointersOnlyNoHashOnlyScience':True,'otherFourSubjectsCANSEMAndRegistryEntriesWholeExact':True,'allProtectedInputCount':len(protected),'activeInputs':[bind(ap) for ap,cp in mutations],'wholeIndependentScope':bind(S),'wholeIndependentTech':bind(T),'threeSeparateWholeScientificSeals':s['qualified33WholeScienceSeals'],'actualSourceInventoryCentralFloors':'pending next stable bundle','M6M7Reached':False,'humanReviewReleaseTrials':'separate pending','imagesGenerated':0,'commitCreated':False,'publishedDeployed':False,'historicalArtifactsModified':False})
shutil.copyfile(__file__,O/'actual-executed-root-integrator.py');Path('/tmp/economics-current678-active-root-path.txt').write_text(str(O)+'\n')
print(json.dumps({'receipt':receipt,'activeCAN':bind(can),'activeFiles':35,'netRoutes174':True,'remaining0_0':True}))
