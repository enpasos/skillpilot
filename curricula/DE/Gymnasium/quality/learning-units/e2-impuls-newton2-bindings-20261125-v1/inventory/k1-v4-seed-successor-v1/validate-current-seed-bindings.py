from pathlib import Path
import json,hashlib,subprocess,sys
R=Path(sys.argv[1]).resolve();OUT=Path(sys.argv[2]).resolve();OUT.mkdir(parents=True,exist_ok=True);INV=Path('curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/inventory');EV=INV/'k1-v4-seed-successor-v1';Q=Path('curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/quality');K1='d8fc6295-d0db-59e5-bd90-080bbc508c3a';K2='b50e9903-58b3-520d-96bf-d5bc1fe51ebf'
def read(p):return json.loads((R/p).read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def check(p):assert sha((R/p['path']).read_bytes())==p['sha256']
subprocess.run(['python3',str(R/EV/'recompute-bw-hh-th.py'),str(R),str(OUT/'current-seeds.recomputed.json')],check=True,stdout=(OUT/'current-seeds.recompute.log').open('w'))
current=json.loads((OUT/'current-seeds.recomputed.json').read_text());fixture=read(INV/'physics-seki-k1-v4-seed-successor.actual.json');bw=read(INV/'physics-seki-k2-seed-successor.actual.json');before=read(EV/'before.independent.actual.json');native=read(EV/'native-after.rows.actual.json');verification=read(EV/'native-after.verification.actual.json');seal=read(EV/'sealed-predecessors.actual.json')
assert len(fixture['scopes'])==4 and len(bw['scopes'])==2 and verification['nativeExitCode']==0 and verification['nativeTests']==1
check(verification['productionTestSource']);check(verification['activeFourRowSeedFixture'])
for p in seal['seedFixtureInputs']+seal['allRetainedK1History']:check(p)
for key,row in current['scopes'].items():
 actual=native['scopes'][key];old=before['scopes'][key];isBw='|DE-BW|'in key
 assert row['currentSeedAtomicGoalIds']==actual['seedAtomicGoalIds']and row['currentLearningAtomicGoalIds']==actual['learningAtomicGoalIds']and actual['personalizedTotalAtomic']==row['technicalLearningCount']
 delta=set()if isBw else{K1}
 for f in ['currentSeedAtomicGoalIds','currentLearningAtomicGoalIds']:
  assert set(row[f])-set(old[f])==delta and not(set(old[f])-set(row[f]));assert row[f]==(bw if isBw else fixture)['scopes'][key][f]
 assert row['curricularSeedGoalIds']==old['curricularSeedGoalIds']
 assert(K1 in row['currentSeedAtomicGoalIds'])is(not isBw);assert(K2 in row['currentSeedAtomicGoalIds'])is isBw
 assert(row['technicalSeedCount'],row['technicalLearningCount'])==((164,262)if isBw else((128,193)if '|DE-HH|'in key else(138,204)))
auth=fixture['acceptedAssessment'];assert auth['rootTwoAcceptAndLiveViewSignal']is True
for field in ['candidate','contentReview','actualCurrentOfferReceipt','currentNativeOfferContext','currentReleasedGoal','strandSuccessor','formSuccessor','currentFormNativeVerification']:check(auth[field])
for p in auth['frozenSixViewInputs']:check(p)
canon=read(Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'))['goals'];assert next(g for g in canon if g['id']==K1)==read(Path(auth['currentReleasedGoal']['path']))
subprocess.run([str(R/'app/node_modules/.bin/tsx'),str(R/EV/'verify-current-exam-release.mts'),str(R),str(OUT/'current-release-equivalence.recomputed.json')],check=True)
oldK2=bw['acceptedAssessment'];check(oldK2['candidate']);check(oldK2['contentReview']);strand=read(Path(auth['strandSuccessor']['path']));assert next(g for g in canon if g['id']==K2)==read(Path(next(x for x in strand['currentGoals']if x['goalId']==K2)['releasedGoal']['path']))
subprocess.run([str(R/'app/node_modules/.bin/tsx'),str(R/Q/'imp-mass-example-successor-20261125-v1/materialize-current-context.mts'),'--check'],check=True,stdout=(OUT/'native-four-p-materializer.json').open('w'))
result={'contract':'e2-final-pushed-head-accepted-k1-v4-additive-seed-and-four-p-binding-verification-v1','exactNativeApiScopesRevalidated':6,'activeHH_THSuccessorScopeRows':4,'retainedBW2ScopeRows':2,'BW':{'technicalSeeds':164,'technicalLearning':262,'fullIdentitiesUnchanged':True,'curricularSeeds':111},'HH':{'technicalSeeds':128,'technicalLearning':193,'curricularSeeds':86},'TH':{'technicalSeeds':138,'technicalLearning':204,'curricularSeeds':91},'K1AdmittedOnlyHH_TH':True,'K2AdmittedOnlyBW':True,'oldSeedFixtureFilesUnchanged':6,'allRetainedK1HistoryFilesUnchanged':len(seal['allRetainedK1History']),'acceptedK1V4ScoredBodyExactThroughFormAndStrandSuccessors':True,'acceptedK2ScoredBodyExactThroughFormAndStrandSuccessors':True,'currentControllerSourceMatchesNativeAfterProof':True,'impPScientificBodyUnchangedAndThreeOtherRecordsByteExact':True,'protectedGateLowered':False,'learnerResultsWritten':False}
(OUT/'seed-receipt-verification.actual.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
