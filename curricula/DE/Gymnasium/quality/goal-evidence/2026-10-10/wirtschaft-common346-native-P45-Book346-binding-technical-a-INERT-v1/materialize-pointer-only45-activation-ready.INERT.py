import argparse,datetime,hashlib,json,pathlib

own=pathlib.Path(__file__).resolve().parent
root=own.parents[6]
live_core='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
live_sem='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-common346-qualified-M6-integration-preparation-root-v1/semantic.current346.live-canonical-pointer.activation-ready.json'
def read(p):return json.loads((root/p).read_text())
def artifact(p):
 b=(root/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,obj):
 p=own/'activation-ready'/name;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
 return str(p.relative_to(root))

receipt_path=str((own/'actual-P45-new3-native-Book346-old343-full-parity.READONLY.receipt.json').relative_to(root))
r=read(receipt_path);sem=read(r['semanticPath']);live=read(live_sem)
expected={**sem,'sourceLandscapePath':live_core}
assert live==expected,'Whole SEM must differ solely by actual canonical source pointer'
assert len(r['configPaths'])==45 and r['ordinary']==346 and r['allExact']
input_paths=[receipt_path,r['corePath'],r['semanticPath'],live_sem]
mapping=[]
for i,p in enumerate(r['configPaths'],1):
 before=read(p);candidate={**before,'landscapePath':live_core,'semanticKindLedgerPath':live_sem}
 assert {k for k in set(before)|set(candidate)if before.get(k)!=candidate.get(k)}<= {'landscapePath','semanticKindLedgerPath'}
 ready=write('configs/'+pathlib.Path(p).name.replace('.INERT.config.json','.activation-ready.INERT.config.json'),candidate)
 mapping.append({'index':i,'qualifiedCandidateConfigPath':p,'activationReadyConfigPath':ready,'scopeWholeExact':True,'reviewPathWholeExact':True,'reviewBodyArtifact':artifact(before['reviewPath']),'onlyPointerFieldsChanged':True})
 input_paths.extend([p,before['reviewPath'],before['reviewCriteriaPath']])
book_path=r['wholeBook']['configPath'];before=read(book_path)
old_ready=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-common343-native-P44-Book343-binding-technical-a-INERT-v1/activation-ready/whole-book.live689-sem689-P343.activation-ready.INERT.config.json'
old_book=json.loads(old_ready.read_text())
book={**before,'landscapePath':live_core,'semanticKindLedgerPath':live_sem,'outputPath':old_book['outputPath']}
assert {k for k in set(before)|set(book)if before.get(k)!=book.get(k)}<= {'landscapePath','semanticKindLedgerPath','outputPath'}
ready_book=write('whole-book.current346.live-pointer.activation-ready.INERT.config.json',book)
input_paths.extend([book_path,str(old_ready.relative_to(root)),r['combinedReviewPath']])
input_artifacts=[artifact(p)for p in sorted(set(input_paths))]
outputs=[artifact(m['activationReadyConfigPath'])for m in mapping]+[artifact(ready_book)]
manifest={'role':'POINTER_ONLY_45P_AND_WHOLE_BOOK346_ACTIVATION_PREPARATION_NO_ACTIVE_WRITES','completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'qualifiedTechnicalReceiptPath':receipt_path,'liveCanonicalPath':live_core,'liveSemanticPointerPath':live_sem,'wholeSemanticSourcePointerOnlyExact':True,'Pconfigs':mapping,'configPaths':[m['activationReadyConfigPath']for m in mapping],'old44ScopesAndReviewPathsExact':True,'newConfig45WholeThreeGoalEnvelopeExact':True,'whole343ProfileBytePrefixRetained':True,'combinedReviewPath':r['combinedReviewPath'],'wholeBook':{'qualifiedCandidateConfigPath':book_path,'activationReadyConfigPath':ready_book,'regularBookOutputPath':book['outputPath'],'pages':346,'reviewOnlyHistoricalQAUnchanged':True},'inputArtifacts':input_artifacts,'outputArtifacts':outputs,'nativePassAgainstUnactivatedLiveCoreClaimed':False,'E1G1aiCandidateNeedsHumanReview':True,'humanApproval':False,'newDOrVReview':False,'M7OrPublicationClaim':False,'activeWrites':0}
manifest_path=write('45-P-configs-and-whole-Book-pointer.activation-ready.manifest.json',manifest)
print(json.dumps({'manifestPath':manifest_path,'configs':45,'bookConfigPath':ready_book,'activeWrites':0}))
