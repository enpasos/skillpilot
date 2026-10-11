import argparse,datetime,hashlib,json,pathlib

p=argparse.ArgumentParser();p.add_argument('--author-seal',required=True);a=p.parse_args()
own=pathlib.Path(__file__).resolve().parent;root=own.parents[6]
author=own.parent/'wirtschaft-BB-selected-personal-three-real-atoms-six-cases-local-practice-AUTHOR-INERT-v1'
inputs={}
def read(path):
 path=pathlib.Path(path);b=path.read_bytes();rel=str(path.relative_to(root));inputs[rel]={'path':rel,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 return json.loads(b)
core=read(author/'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');sem=read(author/'semantic693.candidate-bound.INERT.json');goals=read(author/'three-whole-ordinary-personal-goals.AUTHOR-INERT.json')['goals']
positive=read(author/'positive-v2-three-goal-six-whole-cases.AUTHOR-INERT.json');read(author/'six-whole-DEEN-casebriefs-and-model-answers.AUTHOR-INERT.json')
practice=read(author/'whole-local-BB-LK-five-contract-practice-learner-wording-successor.AUTHOR-INERT.json');read(author/'whole-local-BB-LK-five-contract-practice-DEEN-material-answer-rubric.AUTHOR-INERT.json')
read(author/'actual-whole-existing776-fab-912-81d-and4e-material-inputs.EXACT.json')
read(root/a.author_seal)
content=read(own/'actual-independent-A3-M3-six-case-own-answers.CONTENT-REVIEW-awaiting-practice-and-author-seal.json');whole=read(own/'actual-independent-whole-five-contract-80BE-practice-and-learner-wording-KEEP.CONTENT.json')
wording=read(own/'actual-own-four-phrase-and-only-whitespace-practice-successor-proof.READONLY.json');native=read(own/'actual-own-native-effective-prerequisites-BB-two-role-compilers-final-stable.READONLY.json')
read(own/'actual-read-start-and-two-stable-whole-input-hashes.READONLY.json');read(own/'actual-explicit-unsealed-author-followup-read-start-and-two-current-whole-hashes.READONLY.json')
by={g['id']:g for g in core['goals']};kinds={d['goalId']:d['semanticKind']for d in sem['decisions']if d['decisionStatus']=='authoritative'}
assert len(core['goals'])==693 and sum(k=='curricularAtomic'for k in kinds.values())==346
assert len(goals)==3 and len(positive['goals'])==3
assert all(g==by[g['id']]and kinds[g['id']]=='curricularAtomic'for g in goals)
assert all(r['atomicity']=='KEEP'and r['memoryDecision']=='KEEP_NO_REQUIRED_MEMORY'for r in content['atomicityAndMemoryDecisions'])
assert whole['decision']=='KEEP'and wording['logicalPlainLanguageReplacements']==4
actual=by[practice['id']]
# Machine release status changes no authored educational material.
supplied=json.loads(json.dumps(practice));current=json.loads(json.dumps(actual))
supplied['examData'].pop('reviewStatus',None);current['examData'].pop('reviewStatus',None)
supplied['examData'].pop('reviewNote',None);current['examData'].pop('reviewNote',None)
assert supplied==current,'Final practice differs beyond mechanical machine status/provenance note'
assert 'actual-independent-whole-five-contract-80BE-practice-and-learner-wording-KEEP.CONTENT.json' in actual['examData']['reviewNote'] and 'Human approval remains false' in actual['examData']['reviewNote']
assert actual['examData']['reviewStatus']=='released'and kinds[actual['id']]=='practiceAssessment'
assert len(native['wholeMaterialAtomicPrerequisiteClosure'])==7 and not native['unresolvedReferences']
for g in native['endguards']:
 path=root/g['before']['path'];assert 'sha256:'+hashlib.sha256(path.read_bytes()).hexdigest()==g['before']['sha256'],'Final native proof input changed'
metadata={'provider':'OpenAI','model':'GPT-6','runtime':'Codex','exactModelRevision':'not_exposed','samplingParameters':'not_exposed'}
metadata_path=own/'actual-own-generation-metadata.bytes.json'
with metadata_path.open('x')as f:json.dump(metadata,f,ensure_ascii=False,indent=2);f.write('\n')
read(metadata_path)
endguards=[{'before':v,'afterSHA256':'sha256:'+hashlib.sha256((root/k).read_bytes()).hexdigest(),'exact':'sha256:'+hashlib.sha256((root/k).read_bytes()).hexdigest()==v['sha256']}for k,v in inputs.items()]
assert all(g['exact']for g in endguards)
receipt={'role':'SEALED_INDEPENDENT_BOUNDED_WHOLE_BB_A3_M3_P6_LOCAL_FIVE_CONTRACT_PRACTICE_SCIENCE','reviewer':'/root/economics_final56_current_round_a','completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'decision':'KEEP','wholeThreeCurrentDeEnContractsActuallyRead':True,'wholeSixDeEnCasesModelAnswersActuallyRead':True,'wholeFiveContractPracticeDeEnMaterialSolutionsTenRubricsActuallyRead':True,'atomicityRecords':content['atomicityAndMemoryDecisions'],'ownSixCaseAnswersPath':str((own/'actual-independent-A3-M3-six-case-own-answers.CONTENT-REVIEW-awaiting-practice-and-author-seal.json').relative_to(root)),'wholePracticeOwnAnswersAndFreshNegativeCasesPath':str((own/'actual-independent-whole-five-contract-80BE-practice-and-learner-wording-KEEP.CONTENT.json').relative_to(root)),'finalPracticeGoalId':practice['id'],'finalPracticeBodySHA256':wording['successorSHA256'],'actualEffectiveAndWholeMaterialPrerequisiteRolesPath':str((own/'actual-own-native-effective-prerequisites-BB-two-role-compilers-final-stable.READONLY.json').relative_to(root)),'threeNewGoalsAllBBLKTargetAbsentBBGK':True,'wholeFiveGoalsCoveredAndRequired':True,'sevenPrerequisitesResolveAndVisibleLK':True,'no912OrUnsupportedOld81dTarget':True,'learnerWordingFourPhrasesAndAllOtherChangesWhitespaceOnly':True,'historicalPendingFileNameBoundaryClosedByThisReceipt':True,'explicitPresealFollowupsRead':{'suppliedFictionalAppraisalEvidence':True,'actualSchemaAllowedModelingArchetypes':True,'new3Official2022SourcePointerOnly':True,'learnerImplementationReferenceRemoval':True,'noUndisclosedContentUpdate':True},'authorFinalSealPath':a.author_seal,'sourceCountryRoles':'Selected BB LK Personal alternative. Source/Course qualification belongs to its separate current proof; this does not claim a fresh whole100 source review. Montan comparison remains owned didactic extension, labour-director assessment excluded.','disclosedPriorAuthorship':content['disclosedPriorAuthorship'],'generationMetadata':metadata,'generationParametersFingerprint':inputs[str(metadata_path.relative_to(root))]['sha256'],'inputArtifacts':list(inputs.values()),'endguards':endguards,'allExact':True,'AIcandidateEvidenceLevel':'E1','AIcandidateMaximumClaimScope':'G1','humanApproval':False,'observedLearnerEvidence':False,'newBlindDOrVReview':False,'nativeM6M7OrCIWholePassClaim':False,'activeWrites':0}
target=own/'actual-whole-three-goals-A3-M3-six-P-cases-and-five-contract-local-practice-independent-KEEP.SEALED.receipt.json'
with target.open('x')as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'receiptPath':str(target.relative_to(root)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'decision':'KEEP','A':3,'M':3,'cases':6,'wholePracticeBE':80,'guards':len(endguards),'activeWrites':0}))
