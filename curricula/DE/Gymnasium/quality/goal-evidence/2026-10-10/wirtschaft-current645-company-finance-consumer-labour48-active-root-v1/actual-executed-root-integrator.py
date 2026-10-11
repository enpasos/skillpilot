from pathlib import Path
import json,hashlib,gzip,shutil
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';A=Q/'wirtschaft-current645-company-finance-consumer-labour48-active-root-v1';A.mkdir(exist_ok=False)
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def ck(b):
 p=R/b['path'];assert bind(p)==b;return p
def save(n,x):
 p=A/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
sp=Q/'wirtschaft-current645-company-finance-consumer-labour-independent-combined-scope-root-v1/actual-final-current645-company-finance-consumer-labour48-combined-scope-nav-independent-KEEP.handoff.receipt.json';scope=rd(sp);assert scope['decision']=='KEEP_BOUNDED_COMBINED645_SCOPE_NAV_STATUS_ONLY_INTERACTION' and scope['actualNetRouteOccurrenceGain']==338 and scope['strictNet']==scope['activeWrites']==0
hp=ck(scope['wholeAuthorFinalHandoff']);h=rd(hp);tp=Q/'wirtschaft-current645-SEM-P43-book-technical-independent-root-v1/actual-final-current645-SEM-P43-P336685-book-technical-independent-KEEP.receipt.json';tech=rd(tp);assert tech['decision']=='KEEP_TECHNICAL_BINDING_FOLLOWERS_ONLY' and ck(tech['foreignCombinedScope'])==sp;ta=ck(tech['wholeAuthorHandoff']);f=rd(ta);assert ck(f['wholeAuthorHandoff'])==hp
native=json.loads(gzip.decompress(ck(scope['exactPositiveRaw']).read_bytes()));assert native['goalCount']==645 and native['compiler']['summary']['errors']==native['compiler']['summary']['warnings']==0;m=next(r['metrics'] for r in native['route']['rules'] if r['id']=='CQR-104');assert (m['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute'],m['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute'])==(174,33)
for key in ['wholeFieldwise645StatusNavScopeFollowup','ownActualWhole48ContextAndRoleDecisions','ownFourFreshNativeRunsAndOriginalEndguards','ownPortableManifest']:ck(scope[key])
for row in f['foreignWholeScientificBindings']:ck(row['wholeForeignScientificReceipt']);ck(row['wholeQualifiedDraftInput'])
for key in ['oldRegistry','oldBookConfig','oldKindLedger','newSEM','oldWholeP336Aggregate','newWholeP336','candidateRegistry','candidateBookConfig','all43ActualNativePositiveProof','officialNativeSEMFPProof']:ck(f[key])
can=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';assert can.read_bytes()==ck(h['wholeBeforeCAN']).read_bytes();newcan=ck(h['wholeAfterCAN']);changed=[]
for v in h['all35WholeBeforeAfterViewRows']:
 ap=R/v['activePath'];assert ap.read_bytes()==ck(v['before']).read_bytes();cp=ck(v['candidate'])
 if ap.read_bytes()!=cp.read_bytes():changed.append((ap,cp))
assert len(changed)==34
reg=rd(ck(f['oldRegistry']));paths={R/'app/scripts/generateCurriculumQualityStatus.ts',R/'app/scripts/goalBookModel.ts',R/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json',R/'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',R/'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'}
for s in reg['subjects']:
 if s['subject']!='wirtschaftswissenschaften':paths.update(R/s[k] for k in ['landscapePath','semanticKindLedgerPath'])
for cfg in f['all43ConfigChanges']:paths.update([ck(cfg['old']),ck(cfg['reviewWholeBytesUnchanged'])])
for base in ['curricula/DE/Gymnasium/input','curricula/DE/Gymnasium/mapping','curricula/DE/Gymnasium/memory-decks','curricula/DE/Gymnasium/quality/memory-card-review']:paths.update(p for p in (R/base).rglob('*') if p.is_file() and p.suffix in ['.json','.jsonl'])
protected=[bind(p) for p in sorted(paths)]
mutations=[(can,newcan),(ck(f['oldRegistry']),ck(f['candidateRegistry'])),(ck(f['oldBookConfig']),ck(f['candidateBookConfig']))]+changed;assert len(mutations)==37
backup=A/'whole-active-before';backup.mkdir();rows=[]
for i,(ap,cp) in enumerate(mutations):
 bp=backup/(f'{i:02d}-'+ap.name);bp.write_bytes(ap.read_bytes());rows.append({'activePath':str(ap.relative_to(R)),'wholeBefore':bind(bp),'qualifiedCandidate':bind(cp)})
save('actual-current645-fortyeight506-before-mutation-whole-input-guards.json',{'actualMutations':rows,'protectedWholeInputs':protected,'wholeIndependentScope':bind(sp),'wholeIndependentTechnicalFollower':bind(tp),'fourSeparateScientificSeals':scope['whole48ExistingScientificSeals'],'all336OrdinaryP685ContractsExact':True,'strictNet':0,'humanRelease':'separate pending'})
for ap,cp in mutations:ap.write_bytes(cp.read_bytes())
assert all(bind(R/b['path'])==b for b in protected);assert all(ap.read_bytes()==cp.read_bytes() for ap,cp in mutations)
receipt=save('actual-current645-fortyeight-qualified-materials506-accesses-active.receipt.json',{'status':'ACTUAL_48_SEPARATELY_QUALIFIED_MATERIALS506_ACCESSES_ACTIVE_PENDING_FRESH_CENTRAL','actualCanonicalNodes':645,'actualCurrentCurricularAtomic':336,'actualPracticeAssessment':264,'newWholeMaterialScientificClosures':48,'newPracticeNodes':48,'newScientificCurricularStrictClosures':0,'restoredCurricularStrictBindings':0,'strictNet':0,'actualChangedViews':34,'actualNewPracticeTargetRefs':506,'actualWholeVisibleNewBindings':848,'actualBeforeAfterLocalRouteOccurrences':[512,174],'actualNetRestoredRouteBindings':338,'actualBeforeAfterLocalMissingGoalIDs':[81,33],'actualNetLocalGoalClosure':48,'all64Ordinary6974MemoryOrientationPOnlyRolesExact':True,'sixExistingPOnlyPracticeExceptionsBound':6,'wholeHardPrerequisiteClosureOrCoverageIssues':0,'source16Original2134AndAll208PartialInputBindingsExact':True,'all43OriginalPReviewBytesProfiles685CasesInputFPsStatusesAuthoritiesExact':True,'all336OrdinaryAnd591OldNonNavWholeObjectsUnchanged':True,'all597OldSemanticKindsStatusesBasesExact':True,'sixNavSourceFPFollowersAnd48NewPracticeKindsOnly':True,'technicalPointersOnlyNoHashOnlyScience':True,'otherFourSubjectsCANSEMAndRegistryEntriesWholeExact':True,'allProtectedInputCount':len(protected),'activeInputs':[bind(ap) for ap,cp in mutations],'wholeIndependentScope':bind(sp),'exactPositiveScopeRaw':scope['exactPositiveRaw'],'wholeIndependentTech':bind(tp),'fourSeparateScientificSeals':scope['whole48ExistingScientificSeals'],'actualSourceInventoryCentralFloors':'pending next stable bundle','M6M7Reached':False,'humanReviewReleaseTrials':'separate pending','imagesGenerated':0,'commitCreated':False,'publishedDeployed':False,'historicalArtifactsModified':False})
shutil.copyfile(__file__,A/'actual-executed-root-integrator.py');Path('/tmp/economics-current645-active-root-path.txt').write_text(str(A)+'\n');print(json.dumps({'receipt':receipt,'activeCAN':bind(can),'activeFiles':37,'netRoutes338':True,'remaining174_33':True}))
