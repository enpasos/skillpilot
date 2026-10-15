from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,os,shutil,importlib.util,contextlib
O=Path(__file__).resolve().parent;M=Path('/home/enpasos/projects/skillpilot');R=O/'isolated-root';B=R/'curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/fresh-four-existing-math-portable-v1';E=B/'author-and-native-evidence'
def now():return datetime.now(timezone.utc).isoformat()
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(M)),'bytes':p.stat().st_size,'sha256':sha(p)}
def put(p,j):
    assert not p.exists(),p
    p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
for name in ['native-four-exact-current-inventory-and-requires-check-attempt001.execution.actual.json','native-four-exact-current-inventory-and-requires-check-attempt001.stdout.raw.txt','native-four-exact-current-inventory-and-requires-check-attempt001.stderr.raw.txt','native-four-inventory-interrupted-parent-guard.actual.json']:
    assert not (E/name).exists();shutil.copyfile(O/name,E/name)
assert not (E/Path(__file__).name).exists();shutil.copyfile(Path(__file__),E/Path(__file__).name)
required=['native-four-global5-M7-final-attempt002','native-four-global-graph-final-attempt001','native-four-composition-final-attempt002','native-four-D-finalize-attempt001','native-four-all10floors-final-attempt002','native-four-exact-current-inventory-and-requires-check-attempt001','native-four-P-after-independent-Kind-attempt005']
for name in required:assert json.loads((O/f'{name}.execution.actual.json').read_text())['exitCode']==0,name
reg='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';phys='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json';math='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';inv='curricula/quality/cross-subject-requires/math-physics.inventory.json'
expected={reg:'c0dd4e1a34a95d44855f08848b0f6836c2d04b34729724f84a930ac5d1eef94d',phys:'d889453c21f9cb4bae2ee81ce6c4cbaf8a8f7c122718028987fb2441ae957312',math:'61742f50b76efbb63e5fee4212b1d1b0452bb23cff4bcf8c2ce7268038828ec4',inv:'49716d75a2c6f72df5fbf1869110802e1361476c4aaac3146234dd08c0120354'}
for rel,hash in expected.items():assert sha(M/rel)=='sha256:'+hash,rel
rows=[]
for dp,dn,fn in os.walk(R/'curricula',followlinks=False):
    dn[:]=[x for x in dn if not (Path(dp)/x).is_symlink()]
    for name in fn:
        p=Path(dp)/name
        if p.is_symlink():continue
        rel=p.relative_to(R);baseline=M/rel
        if baseline.exists() and p.read_bytes()==baseline.read_bytes():continue
        assert p.resolve().is_relative_to(R)
        rows.append({'path':str(rel),'operation':'change' if baseline.exists() else 'add','candidate':bind(p),'MainBaseline':bind(baseline) if baseline.exists() else {'path':str(rel),'state':'absent'}})
rows.sort(key=lambda x:x['path']);assert sum(x['operation']=='change' for x in rows)==69
assert all(x['path'] not in [math,inv] for x in rows)
assert all('/input/' not in x['path'] and '/mapping/' not in x['path'] for x in rows)
# Native changed-document schema validation. WholeMain Git/symlink discovery
# is intentionally left to the real Main gate; no private Git fixture is made.
spec=importlib.util.spec_from_file_location('native_R4_schema',R/'scripts/validate_schemas.py');native=importlib.util.module_from_spec(spec);spec.loader.exec_module(native);schema=json.loads((R/'docs/landscape-runtime.schema.json').read_text())
jsoncount=jsonlcount=jsonlrecords=0;started=now()
with (O/'native-four-final-transport-schema.stdout.raw.txt').open('x') as out,(O/'native-four-final-transport-schema.stderr.raw.txt').open('x') as err,contextlib.redirect_stdout(out),contextlib.redirect_stderr(err):
    for row in rows:
        p=M/row['candidate']['path']
        if p.suffix=='.json':assert native.validate_file(str(p),schema),p;jsoncount+=1
        elif p.suffix=='.jsonl':
            for line in p.read_text().splitlines():json.loads(line);jsonlrecords+=1
            jsonlcount+=1
    print(f'Native validate_file on actual complete proposed transport: {jsoncount} JSON, {jsonlcount} JSONL, {jsonlrecords} JSONL records; all pass. All files detached physical. WholeMain Git/symlink CLI remains actual adoption gate.')
put(O/'native-four-final-transport-schema.execution.actual.json',{'startedAtUTC':started,'completedAtUTC':now(),'exitCode':0,'nativeModule':bind(R/'scripts/validate_schemas.py'),'runtimeSchema':bind(R/'docs/landscape-runtime.schema.json'),'actualProposedFiles':len(rows),'actualJSONFiles':jsoncount,'JSONLFilesParsed':jsonlcount,'JSONLRecordsParsed':jsonlrecords,'nativeFunction':'validate_file','wholeMainCLIClaimed':False,'MainGitIndexWrites':False})
manifest={'schemaVersion':1,'status':'sealed_private_four_existing_Math_adds_candidate_ready_for_Root_exact_integration_review','sealedAtUTC':now(),'candidateRoot':str(R.relative_to(M)),'fileCount':len(rows),'bytes':sum(x['candidate']['bytes'] for x in rows),'operations':{op:sum(x['operation']==op for x in rows) for op in ['change','add']},'proposedFiles':rows,'sourceBaselineCompleteOrExplicitlyAbsent':True,'actualP20MainAnchorBindings':[bind(M/x) for x in [math,phys,reg,inv]],'scope':'Gymnasium Math↔Physics SekI/II only; four existing Physics goals, seven existing Math adds','changes':{'PhysicsRequiresOnlyGoals':4,'addedDirectMathEdges':7,'changedPhysicsViews':66,'addedMinimalAtomicPrerequisiteOnlyReferences':257,'KindRowsWithGenuineFreshReview':4,'genuineCurrentPAuthorRecords':4,'genuineFreshDRounds':2,'newDResolutions':4,'MathCanonicalChanges':0,'newMathGoals':0,'canonicalGoalOrPBodyOrImageChanges':0,'humanApprovals':0},'fiveSubjectsPreserved':True,'fourNonPhysicsEntriesLexicallyByteExact':True,'all474OtherActivePRecordLinesByteExact':True,'P20Current20OwnerAndRecordsRetained':True,'derivedDashboardStatusAndInventoryExcluded':True,'unchanged814SourceMappingReadSnapshotsExcluded':True,'governmentFulltextCachesIncluded':False,'MainGitIndexCommitPushDeployWritten':False}
mpath=O/'four-reviewable-file-manifest.actual.json';put(mpath,manifest)
packet={'sealedAtUTC':now(),'status':'complete_private_R4_exact_author_integration_candidate_no_adoption','physicalRoot':str(R.relative_to(M)),'manifest':bind(mpath),'candidateInventory':bind(R/'native-output/four-current-candidate.inventory.json'),'nativeCurrentGraphProjectionAndPKindProof':bind(O/'final-four-current-native-graph-projection-quality-binding.actual.json'),'actualP20RegistryPreservation':bind(B/'final-exact-active-P-and-five-subject-registry-preservation.actual.json'),'D4BIndependentHandoff':bind(B/'independent-D-round-B/HANDOFF.actual.json'),'nativeChecks':{n:bind(O/f'{n}.execution.actual.json') for n in required},'boundedActualTransportSchema':bind(O/'native-four-final-transport-schema.execution.actual.json'),'counts':{'files':len(rows),'change':69,'add':len(rows)-69,'stableMathPhysicsIds':2016,'ordinaryMathPhysics':1285,'directForeignEdges':43,'dependentPhysicsGoals':34,'distinctMathPrerequisites':30,'authoredMathSupportIn69PhysicsViews':1864,'minimalAtomicSupportAdded':257,'changedPhysicsViews':66,'all157TargetSetsCompiledForestsAndFrontendTreesUnchanged':True,'all5M7BlockingIssues':0,'MathStrict':807,'PhysicsStrict':478,'all10PrivateFloorsPass':True,'DStrictCurrent':4,'partialOriginal15RequiresApproved':14,'globalRequiresOpen':1271},'actualRequiresOriginalBindings':{'authorSha256':'sha256:0f9a4d8ef046292dff441b6ca99ca5023901d5217dfae48fa221d90a49b10f23','independentSha256':'sha256:42a11fb1530c6012cd2f6269ea14d1c5951bb0870dcf75894de3c3ea75088296','originalAuthorInventoryHash':'sha256:34b41bcc849d4f55b381a61c201fb50b38f44b8fe62e83376af4767a930fa7db','candidateCurrentNativeCheckExit':0},'scientificAndSourceLimits':'Four unchanged whole P bodies independently keep; Kind4 curricularAtomic; new informed D4A/B keep4. Same configured OpenAI/gpt-6.1-sol/serving-build-unobserved report_only, no human or model-diversity claim. Source/placement/HE and all prior limits unchanged; no new nationwide source-law, learner consent or host approval. LC broad cluster/37f debt and68c90Requires remain open. No new Math, broad5a/P72/ideal-gas proposal.','nativeDiscoveryHistory':'Initial composition66/1canonical and M7 other-subject discovery failures, first dashboardM0/floors failure preserved. Exact physical unchanged Main snapshot leaves repair discovery. The interrupted inventory attempt wrote no file; Maininventory49716 unchanged. Private final M7/full348views/593nativegraph/157projections/currentPKind andall10floors pass.','RootActualAdoptionRequiredChecks':['Verify every current Main baseline/absence and every candidate SHA in exact manifest','Adopt only explicit manifest files; do not copy scaffold/source caches or native-output inventory','Regenerate actual Main inventory from actual new43refs','Run actualMain global validateGraph.ts and validateCompositionViews.ts','Run actualMain validate_schemas.py including native committable symlink discovery','Regenerate actualMain quality status, run --check and all10protectedfloors'],'futureRebaseInputs':[bind(M/x) for x in [math,phys,reg,inv]],'noMainGitIndexGitHubLearnerProductionWrites':True,'adoptedFilesByThisAuthor':0,'reviewRoleProvenance':'Root authored the four Requires/P records; this agent previously independently reviewed Requires15/P4/Kind4 and now owns actual fresh D4A plus integration. Separate /root/eight_scope_guard_successor_independent_peer owns genuine current D4B. No new independent transport verdict is claimed by this author.'}
put(O/'HANDOFF.R4.actual.json',packet)
own=[]
for p in sorted(O.iterdir()):
    if p.is_file() and p.name!='SEAL.R4.actual.json':own.append(bind(p))
put(O/'SEAL.R4.actual.json',{'sealedAtUTC':now(),'ownedImmediateArtifacts':own,'count':len(own),'candidateCompleteFileManifest':bind(mpath),'noCandidateSourceByteDriftAtSeal':all(sha(M/x['candidate']['path'])==x['candidate']['sha256'] for x in rows),'allMainBaselineBytesOrAbsenceStillExact':all((sha(M/x['path'])==x['MainBaseline']['sha256']) if x['operation']=='change' else not (M/x['path']).exists() for x in rows),'candidateScopeOnlyNotAdoption':True})
print(json.dumps({'handoff':bind(O/'HANDOFF.R4.actual.json'),'seal':bind(O/'SEAL.R4.actual.json'),'manifest':bind(mpath),'files':len(rows),'changes':69,'adds':len(rows)-69},indent=2))
