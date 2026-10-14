from pathlib import Path
import json,hashlib,shutil,datetime,importlib.util
ROOT=Path('/home/enpasos/projects/skillpilot');OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT)
HOST=ROOT/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie262-current402-closed34-active-adoption-root-20261013-v1/receipts/ACTUAL.full-registry-current402-five-gate-report.json'
def rd(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}
def wr(name,x):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def chem(d):return next(s for s in d['subjects'] if s['subject']=='chemie')
oldReport=OWN/'receipts/ACTUAL.current407-inactive-chemistry-central-stock-report.json';oldMeasure=OWN/'MEASURE.prospective269-current407-plus-seven-and-protected262.actual.json'
history=[bind(oldReport),bind(oldMeasure)];assert chem(rd(oldReport))['strictComplete']==269
source=HOST/REL/'receipts/ACTUAL.current407-inactive-chemistry-central-stock-report.json'
newReport=OWN/'receipts/ACTUAL.current407-inactive-chemistry-central-stock-report.completed270.json'
assert not newReport.exists(),'Never overwrite a completed public measurement receipt'
shutil.copyfile(source,newReport);assert source.read_bytes()==newReport.read_bytes()
stdoutSource=HOST/'current407-central.complete-A1-and-assets.actual.stdout.txt';stderrSource=HOST/'current407-central.complete-A1-and-assets.actual.stderr.txt'
stdout=OWN/'receipts/current407-central.completed270.complete-A1-and-assets.actual.stdout.txt';stderr=OWN/'receipts/current407-central.completed270.complete-A1-and-assets.actual.stderr.txt'
shutil.copyfile(stdoutSource,stdout);shutil.copyfile(stderrSource,stderr)
printed=json.loads(stdout.read_text());full=rd(newReport);c=chem(full);base=chem(rd(BASE));old=chem(rd(oldReport))
assert c['strictComplete']==len(c['strictCompleteGoalIds'])==270 and c['denominator']==407 and c['remaining']==137
assert printed['strictComplete']==270 and printed['denominator']==407 and printed['blockingIssueCount']==0 and not printed['issues']
assert len(c['requiredChecks'])==6 and all(x['status']=='pass' for x in c['requiredChecks']) and full['blockingIssueCount']==0
B=set(base['strictCompleteGoalIds']);P=set(old['strictCompleteGoalIds']);F=set(c['strictCompleteGoalIds']);assert len(B)==262 and B<=F and P<=F
oldScience=rd(oldMeasure)['newScientificallyReviewedClosures'];assert len(oldScience)==len(set(oldScience))==7 and set(oldScience)<=F
restore='b208b1a5-c609-53a1-8add-979417a93b7d';assert F-P=={restore} and F-B==set(oldScience)|{restore} and restore not in B
cas=rd(OWN/'CAS.one-existing-b208-A-record-normal-source-address-selection.actual.json')
before=cas['beforeWholeConfig'];after=cas['afterWholeConfig'];assert [k for k in set(before)|set(after) if before.get(k)!=after.get(k)]==['landscapePath']
originalA1=ROOT/cas['originalFullRecordPath'];records=[json.loads(l) for l in originalA1.read_text().splitlines() if l.strip()];assert len(records)==1 and records[0]['goalId']==restore and records[0]['status']=='atomic' and records[0]['semanticAtomic']
copyA1=OWN/'receipts/b208-A1.existing-science.original-record.byte-exact.jsonl';shutil.copyfile(originalA1,copyA1);assert sha(originalA1)==sha(copyA1)
stockModule=ROOT/'app/scripts/reportDeepUnderstandingRollout.ts';assert sha(stockModule)==sha(HOST/'app/scripts/reportDeepUnderstandingRollout.ts')
receipt={'schemaVersion':1,'role':'observed exact final genuine already-completed Chemistry-only stock run, not a new run','observedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'completedSessionIdReportedByRoot':94197,'completedExitCodeReportedByRoot':0,'exitCodeProvenance':'Parent task explicitly reports final session94197 completed exit0; this helper performs only read-only artifact inspection and byte-exact transport.','stockOrchestrator':bind(OWN/'checks/run-current407-chemistry-central-stock.mts'),'unmodifiedStockModule':bind(stockModule),'stockPhysicalModuleBytesMatchRepository':True,'finalStdout':bind(stdout),'finalStderr':bind(stderr),'finalFullReport':bind(newReport),'printedSummaryMatchesFullReport':True,'allSixChecksPass':True,'blockingIssueCount':0,'strictComplete':270,'denominator':407,'percentage':'66.3%','remaining':137,'stockRunReexecutedByThisHelper':False,'privateHostModifiedByThisHelper':False,'old269History':history,'activeWrites':False,'newScientificVotes':0,'humanApproval':False}
wr('receipts/ACTUAL.completed-session94197-final270-stock-run-and-exact-transport.receipt.json',receipt)
measure={'schemaVersion':1,'measuredAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'Actual completed inactive current407 candidate stock report; active262/402 remains unchanged','strictComplete':270,'denominator':407,'percentage':'66.3%','remaining':137,'fullStockReport':bind(newReport),'completedGenuineRunReceipt':bind(OWN/'receipts/ACTUAL.completed-session94197-final270-stock-run-and-exact-transport.receipt.json'),'all262PreviousStrictIDsPreserved':True,'protected262GoalIds':sorted(B),'lostPreviousStrictGoalIds':sorted(B-F),'newStrictCandidateGoalIdsBeyondActive262':sorted(F-B),'newStrictCandidateIdCount':8,'newScientificallyReviewedClosures':oldScience,'newScientificClosureCount':7,'existingScienceBindingRestoration':{'goalId':restore,'count':1,'presentInOldActive262StrictSet':False,'presentInArchived269StrictSet':False,'presentInCompleted270StrictSet':True,'onlyConfigFieldChanged':'landscapePath','wholeOriginalAtomicityRecord':bind(copyA1),'originalRecordProvenance':bind(originalA1),'newScienceVote':False,'semanticBodyChangedForRestoration':False},'deltaFromArchived269':sorted(F-P),'lossFromArchived269':sorted(P-F),'archived269ReportsUnchanged':history,'alreadyProtectedBindingsRetainedOutsideNewScience':['2652caef-b557-58b9-9b28-70db62625ce5','17ab1148-7383-5cab-8b91-73aff795f1e4'],'allSixUnmodifiedStockCompletionChecksPass':True,'sourceMaturityReMeasuredByThisRun':False,'lastBroadSourceMaturityRecorded':'M1','sourceScopeCQR003_CQR004_and_M6ReleaseHoldsRemain':True,'newNative5FirstPassDoesNotCountYet':True,'activeStrictComplete':262,'activeDenominator':402,'newScientificVotesByThisMeasurement':0,'newHumanApproval':False,'commitReadinessClaim':False,'newGitHubGreenClaim':False,'activeAliasMutation':False,'activeWrites':False}
wr('MEASURE.actual-completed270-current407-seven-science-plus-one-existing-binding-restoration.actual.json',measure)
sourceComparison=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current402-source34-independent-b-postseal-CAS-comparison-20261014-v1/COMPARISON.author-CAS-versus-first-sealed-independent-b.actual.json'
s34=rd(sourceComparison);conflicts=[x for x in s34['tuples'] if x['comparisonDecision']=='NOT_APPROVED_REMOVAL_CONFLICTS_WITH_FIRST_B'];assert len(conflicts)==6
wr('receipts/SOURCE34.exact-existing-postseal-six-removal-disagreements.document-routing-only.json',{'schemaVersion':1,'role':'routing of already sealed Source34 disagreement data; no new scientific judgment','existingSealedComparison':bind(sourceComparison),'scientificComparisonCounts':s34['scientificComparisonCounts'],'sixDisagreementTuples':[{'tuple':x['tuple'],'firstSealedBDecision':x['firstSealedBDecision'],'comparisonDecision':x['comparisonDecision']} for x in conflicts],'newSourceDecision':False,'whole33DeletionCASApproved':False,'remainingGates':s34['remainingGates'],'Native5ScienceRead':False})
nativeRoot=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-Q3-four-plus2652-PE-shared-native5-first-pass-technical-20261014-v1'
selector=nativeRoot/'NEUTRAL.current407-Q3-four-plus2652-PE-shared-native5-FIRST_PASS.exact-input-selector.json';nativeSeal=nativeRoot/'SEAL.finite-current407-Q3-four-plus2652-PE-shared-native5-first-pass-inputs.actual.json'
assert sha(selector)=='sha256:c7c20c81e4862dc8142d9942c4b320ec73e11b9dd082461bf2e7df4c4cf1a786' and sha(nativeSeal)=='sha256:8b97dffa852290d46f9bc5b02e91bbb4afcb9123d2c8613383897dd39e8d4c5e'
doc=ROOT/'docs/qa-ci/chemie262-five-gate-integration-source-holds-2026-10-14.md'
inputs=[bind(BASE),bind(stockModule),bind(originalA1),bind(sourceComparison),bind(selector),bind(nativeSeal),bind(doc)]
# Parse the finite C407 root and explicitly used JSON/JSONL inputs only.
parsed=[]
for p in sorted(OWN.rglob('*')):
 if p.is_file() and p.suffix in ['.json','.jsonl'] and not p.name.startswith('SEAL.'):
  xs=[json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.suffix=='.jsonl' else [rd(p)];parsed.append({'path':p.relative_to(ROOT).as_posix(),'records':len(xs),'sha256':sha(p)})
for x in inputs:
 p=ROOT/x['path']
 if p.suffix=='.json':rd(p)
 elif p.suffix=='.jsonl':
  for l in p.read_text().splitlines():
   if l.strip():json.loads(l)
spec=importlib.util.spec_from_file_location('stock',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);errors=m.curriculum_symlink_errors(str(ROOT));assert not errors,errors
for x in history:assert sha(ROOT/x['path'])==x['sha256'],'269 history changed'
for x in inputs:assert sha(ROOT/x['path'])==x['sha256'],'input changed during seal'
wr('checks/finite-completed270-C407-json-jsonl-input-parse-protected262-history-and-stock-guard.actual.json',{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'allFiniteC407JsonJsonlParsed':True,'parsed':parsed,'allExplicitInputsParsed':True,'all262StrictIDsPreserved':True,'sevenSciencePlusOneExistingBindingRestorationSeparated':True,'historical269RawBytesPreserved':True,'stockGlobalCurriculumSymlinkErrors':errors,'stockGlobalGuardPass':True,'Native5ScienceRead':False,'newBroadRunPerformed':False,'activeAliasMutation':False})
outputs=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and not p.name.startswith('SEAL.')]
assert not any(p.is_symlink() for p in OWN.rglob('*'))
seal={'schemaVersion':1,'role':'finite_completed_genuine_C407_270_stock_report_and_preserved269_history_no_new_science_or_adoption','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputBindings':inputs,'outputBindings':outputs,'fileCount':len(outputs),'totalBytes':sum(x['bytes'] for x in outputs),'completedFinalStockReport':bind(newReport),'completedGenuineRunReceipt':bind(OWN/'receipts/ACTUAL.completed-session94197-final270-stock-run-and-exact-transport.receipt.json'),'currentMeasurement':bind(OWN/'MEASURE.actual-completed270-current407-seven-science-plus-one-existing-binding-restoration.actual.json'),'historical269Bindings':history,'strictCandidateCount':270,'candidateDenominator':407,'activeStrictCount':262,'activeDenominator':402,'all262ProtectedIDsPreserved':True,'newScienceClosures':7,'existingB208BindingRestoration':1,'SourceM1AndM6SourceHoldsRemain':True,'native5InputOnlyNoScienceRead':True,'allFiniteJsonJsonlFullyParsed':True,'stockSymlinkGuardPass':True,'activeAliasMutation':False,'activeWrites':False,'newScientificVotes':0,'humanApproval':False,'commitReadinessClaim':False,'GitHubGreenClaim':False}
wr('SEAL.finite-C407-completed270-and-preserved269-history.actual.json',seal)
rd(OWN/'SEAL.finite-C407-completed270-and-preserved269-history.actual.json')
print(json.dumps({'root':REL.as_posix(),'finalReport':sha(newReport),'measure':sha(OWN/'MEASURE.actual-completed270-current407-seven-science-plus-one-existing-binding-restoration.actual.json'),'seal':sha(OWN/'SEAL.finite-C407-completed270-and-preserved269-history.actual.json'),'strict':270,'denominator':407,'preserved262':True,'newScience':7,'existingBindingRestoration':1,'source34Disagreements':6,'Native5ScienceRead':False}))
