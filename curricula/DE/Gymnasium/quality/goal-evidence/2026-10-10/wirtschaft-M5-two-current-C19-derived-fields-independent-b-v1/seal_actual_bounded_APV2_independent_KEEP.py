#!/usr/bin/env python3
"""Seal completed actual native checks and the precise two-field independent verdict."""
import gzip,hashlib,json,shutil,subprocess
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path(__file__).resolve().parent
def bind(p):
 p=Path(p);p=p if p.is_absolute() else ROOT/p;b=p.read_bytes()
 try:label=str(p.relative_to(ROOT))
 except ValueError:label=str(p)
 return {'path':label,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'symlink':p.is_symlink()}
def save(n,o):
 p=OUT/n;assert not p.exists();p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return bind(p)
def load(n):return json.loads((OUT/n).read_text())
capsule=Path(load('actual-own-private-capsule.command-exit.json')['capsule'])
frame=load('actual-private-capsule-current-code-and-complete-physical-input-bindings.json')
summary=load('actual-two-field-native-positive-negative-and64-scope-invariance.summary.json')
assert summary['compilerBefore']=={'goals':496,'errors':0,'warnings':2,'diagnostics':1457}
assert summary['compilerPositive']=={'goals':496,'errors':0,'warnings':0,'diagnostics':1457}
assert summary['compilerNegative']=={'goals':496,'errors':0,'warnings':1,'diagnostics':1457}
raws=[]
private_raw=capsule.parent/'actual-bound-whole-native-raw-outputs';private_raw.mkdir(exist_ok=False)
for label in ['before-same-whole-qualified-composition-only-APV2-old-declared-fields','after-two-current-derived-fields-positive','genuine-C19-unqualified-BE-declared-country-negative']:
 p=OUT/(label+'.actual-native.json');rawbind=bind(p);compressed=OUT/(p.name+'.gz')
 assert not compressed.exists()
 with p.open('rb') as src,compressed.open('wb') as target,gzip.GzipFile(filename='',mode='wb',fileobj=target,mtime=0,compresslevel=6) as z:
  shutil.copyfileobj(src,z)
 with gzip.open(compressed,'rb') as decoded:
  assert hashlib.sha256(decoded.read()).hexdigest()==rawbind['sha256']
 shutil.move(str(p),str(private_raw/p.name))
 raws.append({'nativeRunLabel':label,'committableWholeLosslessNativeResult':bind(compressed),'uncompressedWholePayloadSHA256':rawbind['sha256'],'uncompressedWholePayloadBytes':rawbind['bytes'],'wholeRawUnchangedRetainedPrivately':bind(private_raw/p.name),'wholeForeignReportsIncluded':20,'losslessDecodeVerified':True})
positive=json.loads(gzip.decompress((OUT/'after-two-current-derived-fields-positive.actual-native.json.gz').read_bytes()))
two=positive['wholeTwoCompilerRows'];assert {e['kind'] for e in two[0]['evidence']}=={'assessment-requires'};assert {e['kind'] for e in two[1]['evidence']}=={'child-union'}
whole_two=save('actual-two-native-derived-rows-four-full-prerequisite-rows-and-four-child-rows.json',{'twoWholeNativeRows':two,'fourWholeNativeRequiresRows':positive['wholeFourDirectRequiresRows'],'fourWholeNativeChildRows':positive['wholeFourChildRows'],'actualFullMaterialClosure':positive['actualWholeC19PrerequisiteClosure'],'claimBoundary':'Assessment-requires and child-union are applicability evidence, not curricular Source coverage or whole-child task approval.'})
node=Path('/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node')
nodebind=bind(node);assert nodebind['sha256']=='6295488653f0d93b0a157841746fef7e72cc4328cfb60c4bbe0ca2668a836ffd'
after_path=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current496-whole-qualified-M3-M5-large-integration-candidate-root-v2/whole496-current-qualified-science-and-bounded-bindings-only.INERT.json')
assert (capsule/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json').read_bytes()==(ROOT/after_path).read_bytes()
command=save('actual-native-three-frame-command-exit-and-pinned-node.receipt.json',{
 'argv':[str(node),str(capsule/'app/node_modules/tsx/dist/cli.mjs'),str(capsule/'app/scripts/actual_independent_C19_APV2_native_runner.mts'),str(capsule),str(OUT),str(ROOT/after_path)],
 'workingDirectory':str(ROOT),'exitCode':0,'actualProcessSessionId':28945,'rawStdout':bind(OUT/'actual-native-command.stdout.log'),'pinnedNode':nodebind,
 'wholeCurrentProductionCheckerSHA256':frame['wholeCheckerProductionSHA256'],'wholeCompilerSHA256':'50f4a09007cece8119c53f665b6442e028e4ffb3910fda7b377e60f8cb6c81dd',
 'nativeFrames':raws,'positiveCapsuleRestoredWholeExact':True,'committableHelper':bind(OUT/'actual_independent_C19_APV2_native_runner.mts'),
 'wholeRawPreservation':'Three unsealed95MB outputs were losslessly compressed for repository evidence; identical raw bytes remain in the private native capsule. Historical artifacts were not modified.',
 'activeWrites':0,'additionalNativeRunsAfterPass':0})
intake=load('actual-two-whole-field-candidates-four-ordinary-contracts-and-four-child-objects.intake.json')
decisions=[]
for row in intake['wholeCandidates']:
 stem=row['goalId'][:8]
 decisions.append({'goalId':row['goalId'],'field':'applicability.jurisdiction','decision':'KEEP bounded exact derived metadata follower',
  'before':row['wholeBeforeGoal']['applicability'],'candidate':row['wholeCandidateGoal']['applicability'],
  'nativeWholeRow':next(g for g in two if g['goalId']==row['goalId']),
  'scientificMeaning':('The four real full prerequisites all apply in BB/BW/BY/HE. In particular the actual full budget goal753 is LK-only and restricts the intersection. C19 retains exactly these four direct requires/covered contracts, LK-only, the foreign qualified whole dossier/tasks/solutions/rubric and status-only machine release. Only its declared country list follows actual assessment-requires.' if stem=='c19ee0d7' else 'The actual Q2 parent retains its four children58cc/c7f/C19/b851 and no universal cluster gate. The child applicability union is BB/BW/BY/HE after the real C19 replacement; the former BY/HE child-union metadata belonged to the pre-C19 composition.'),
  'sourceCoverageApproval':False,'newWholeScienceApproval':False,'allNonApplicabilityFieldsWholeExact':True})
science=save('actual-two-current-C19-and-Q2-parent-derived-field-followers-scientific-KEEP.independent-b.json',{
 'reviewer':'/root/economics_m2_views_independent_b','reviewedAt':datetime.now(timezone.utc).isoformat(),'status':'KEEP bounded two fields only',
 'individualDecisions':decisions,'wholeIntake':bind(OUT/'actual-two-whole-field-candidates-four-ordinary-contracts-and-four-child-objects.intake.json'),'nativeCommand':command,'wholeNativeRows':whole_two,'nativeActualSummary':summary,
 'scopeMeaning':{'compiledCountrySet':['DE-BB','DE-BW','DE-BY','DE-HE'],'actuallyReachedC19TargetScopes':summary['actualVisibleC19Scopes'],'onlyTwoActuallyReachedScopesAreHELKAndNationalHELK':True,'GKSupportOrTargetC19Occurrences':0,'compiledApplicabilityCreatesNewViewReferences':False,'currentOrdinaryGoals':336,'actual34Views64ResolvedCountryCourseSetsWholeExact':True},
 'scienceReuse':{'C19ForeignWholeScience':intake['actualForeignScienceReuse'],'wholeQualifiedDossierAndBothLanguagesAndRubricReusedExactly':True,'newWholeDossierReviewClaimed':False,'Q2FourChildrenAllScientificallyQualifiedClaimed':False,'threeHistoricalBodiesREVISEPreserved':True},
 'sourceBoundary':{'wholeSourceReportBeforeAfterExact':True,'conditionalMoneyMappingUsedEqually':frame['conditionalMoneySourceMapping'],'moneySourceTupleIndependentlyApprovedByThisReviewer':False,'assessmentRequiresIsApplicabilityOnly':True,'fullCourseSourceApproval':False,'privatePhysicalSourceAvailabilityIsGitIndexApproval':False},
 'nonEconomicsGuard':{'all20OtherWholeCompilerReportsExact':True,'foreignProfileOrThresholdChange':False,'fullProtectedCentralM7FloorCheckPerformedByThisReview':False},
 'truthfulNativeStatus':{'isolatedBeforeTwoWarnings':2,'isolatedPositiveWarnings':0,'genuineInvalidBEFieldWarnings':1,'activeCentralStatusChangedByThisReviewer':False,'wholeRouteResultUnchangedAndCQR104StillHasDebt':True},
 'newFieldsOnly':True,'nativeWholeSemOrPBindingApproval':False,'activeWrites':0,'strictGain':0,'newFachClosures':0,'restoredActiveBindings':0,'M4Claim':False,'M5WholeClaim':False,'M6Claim':False,'M7Claim':False,'humanApproval':False,
 'next':'Parent may guarded integrate only these two declared lists as part of the separately qualified whole batch. Source1/SEM/P/affected descriptions and actual central/floor/Memory checks remain parent/A responsibilities.'})
guards=[]
for before in frame['actualBoundRepositoryInputs']:
 after=bind(before['path']);guards.append({'before':before,'after':after,'wholeExact':before==after})
assert all(g['wholeExact'] for g in guards)
checker=(ROOT/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes();assert (capsule/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes()==checker+frame['privateReadonlyExportSuffix'].encode()
assert (capsule/'app/scripts/applicabilityCompiler.ts').read_bytes()==(ROOT/'app/scripts/applicabilityCompiler.ts').read_bytes()
symlinkerrors=[str(p) for p in OUT.rglob('*') if p.is_symlink()];assert not symlinkerrors
required=[str(p.relative_to(ROOT)) for p in sorted(OUT.iterdir()) if p.is_file()]
ignored=subprocess.run(['git','check-ignore','--',*required],cwd=ROOT,text=True,capture_output=True);assert ignored.returncode==1 and not ignored.stdout
guard=save('actual-completed-independent-code-and-input-endguards.json',{'allBoundRepositoryInputsWholeExact':True,'wholeInputEndBindings':guards,'wholeProductionCodeExactExceptNamedReadonlyExports':True,'wholeCompilerCodeExact':True,'positiveCapsuleWholeRestored':True,'requiredIgnoredPaths':[],'symlinkErrors':0,'ignoreCommand':{'argv':['git','check-ignore','--',*required],'exitCode':ignored.returncode,'stdout':ignored.stdout,'stderr':ignored.stderr},'activeWrites':0})
manifest=save('actual-two-current-derived-fields-independent-b.manifest.json',{'reviewer':'/root/economics_m2_views_independent_b','sealedAt':datetime.now(timezone.utc).isoformat(),'outputs':[bind(p) for p in sorted(OUT.iterdir()) if p.is_file()],'status':'KEEP bounded two fields only','historyPreserved':True})
receipt=save('actual-final-two-current-C19-and-Q2-parent-fields-independent-b-KEEP.handoff.receipt.json',{'reviewer':'/root/economics_m2_views_independent_b','status':'KEEP bounded two fields only','science':science,'manifest':manifest,'inputGuards':guard,'actualNativeCommand':command,'exactWholeCandidateSHA256':'a56fb8a41a0efb7fb4cb9bdd100fbb4ae5ebc3fa33c1930ba4ba6d087421a310','nativeCompilerPositive':summary['compilerPositive'],'actualCompilerNegativeWarnings':1,'all64OrdinarySupportMemoryOrientationAllAtomicScopeSetsExact':True,'wholeSourceRouteAndAll20ForeignReportsExact':True,'sourceTupleWholeScienceOrNewC19ViewAccessClaimed':False,'activeWrites':0,'strictGain':0,'newFachClosures':0,'restoredActiveBindings':0,'humanReleaseM6M7Claimed':False})
print(json.dumps({'receipt':receipt,'science':science,'manifest':manifest,'positive':summary['compilerPositive'],'negativeWarnings':1,'committableWholeNativeGzipBytes':sum(r['committableWholeLosslessNativeResult']['bytes'] for r in raws)}))
