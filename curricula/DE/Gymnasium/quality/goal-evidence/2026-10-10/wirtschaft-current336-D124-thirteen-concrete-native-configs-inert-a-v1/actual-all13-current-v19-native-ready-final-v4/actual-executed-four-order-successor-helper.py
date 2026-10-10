from pathlib import Path
import json,hashlib,copy
from jsonschema import Draft202012Validator
R=Path('/home/enpasos/projects/skillpilot')
O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current336-D124-thirteen-concrete-native-configs-inert-a-v1')
V=O/'one-real-native-prerequisite-order-only-author-successor-v2'
def j(p):return json.loads((R/p).read_text())
def bind(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def w(p,obj):
 q=R/p;assert q.resolve().is_relative_to((R/V).resolve()) and not q.exists();q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return bind(p)
old=j(O/'actual-thirteen-concrete-current-ID-config-index.INERT.json');index=copy.deepcopy(old)
audit=j(V/'actual-pure-native-all13-order.stdout.json')
cv=Draft202012Validator(j(Path('contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json')))
changed=[]
for row,proof in zip(index['configurations'],audit['rows']):
 if not proof['orderChangeRequired']:continue
 i=row['packageNumber'];assert proof['exactSameIDSet'] and not proof['beforeNative']['pass'] and proof['afterNativePass']
 before=row['config'];cfg=j(Path(before['path']));after=copy.deepcopy(cfg)
 after['goalIds']=proof['afterGoalIds'];after['outputDirectory']=str(V/f'native/current336-D124-batch-{i:02d}')
 assert not (R/cfg['outputDirectory']).exists() and not (R/after['outputDirectory']).exists()
 assert {k:v for k,v in cfg.items() if k not in ['goalIds','outputDirectory']}=={k:v for k,v in after.items() if k not in ['goalIds','outputDirectory']}
 cv.validate(after)
 p=V/f'configs/current336-D124-batch-{i:02d}.order-only-v2.config.json';after_b=w(p,after)
 row['goalIds']=after['goalIds'];row['config']=after_b;row['outputDirectory']=after['outputDirectory'];row['futureResolutionIndexPath']=after['outputDirectory']+'/resolution-index.json'
 row['orderOnlySuccessor']={'originalConcreteConfig':before,'actualNativeError':proof['beforeNative']['error'],'onlyChangedConfigFields':['goalIds','outputDirectory'],'sameExactIDSet':True,'nativePureSubsetAcceptedNewOrder':True,'oldFailedOrNotYetPreparedOutputsRemainAbsent':True}
 changed.append({'packageNumber':i,'beforeConfig':before,'afterConfig':after_b,'beforeGoalIds':cfg['goalIds'],'afterGoalIds':after['goalIds'],'sameExactIDSet':True,'oldOutputDirectory':cfg['outputDirectory'],'newOutputDirectory':after['outputDirectory'],'newFutureResolutionIndexPath':row['futureResolutionIndexPath']})
assert [x['packageNumber'] for x in changed]==[6,7,10,11]
ledgerp=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json');ledger=j(ledgerp);assert len(ledger['activeBatchConfigPaths'])==20
ledger_before=bind(ledgerp);nextledger=copy.deepcopy(ledger)
for c in changed:
 oldpath=c['beforeConfig']['path'];newpath=c['afterConfig']['path'];assert nextledger['activeBatchConfigPaths'].count(oldpath)==1
 nextledger['activeBatchConfigPaths']=[newpath if p==oldpath else p for p in nextledger['activeBatchConfigPaths']]
assert {k:v for k,v in nextledger.items() if k!='activeBatchConfigPaths'}=={k:v for k,v in ledger.items() if k!='activeBatchConfigPaths'}
assert sum(a!=b for a,b in zip(ledger['activeBatchConfigPaths'],nextledger['activeBatchConfigPaths']))==4
nl=w(V/'whole-active20-four-order-only-config-followers.INERT-ledger-candidate.json',nextledger)
index['status']='INERT_CONCRETE_FOUR_NATIVE_ORDER_SUCCESSORS_ONLY';index['originalWholeConcreteIndex']=bind(O/'actual-thirteen-concrete-current-ID-config-index.INERT.json');index['futureConditionalLedger']=nl
index['nativePrepareAllowedNow']=True;index['rootTargetedGreenNoticeStillRequired']=False;index['nativePreparationAuthorization']=bind(O/'actual-native-preparation-authorized-v19/actual-Root-v19-seven-green-targeted-checks-and-native-prepare-authorization.receipt.json')
ix=w(V/'actual-thirteen-concrete-current-ID-config-index.four-order-successors.INERT.json',index)
ids=[goal for row in index['configurations'] for goal in row['goalIds']];assert len(ids)==len(set(ids))==124 and set(ids)==set([g for row in old['configurations'] for g in row['goalIds']])
# Everything formerly prepared stays byte-bound and is never regenerated.
preserved=[]
for i in [1,2,3,4,5,13]:
 row=old['configurations'][i-1];p=Path(row['outputDirectory'])/'batch-manifest.json';m=j(p);assert m['goalIds']==row['goalIds'] and m['curriculumAtomicDenominatorAtPreparation']==336
 preserved.append({'packageNumber':i,'batchManifest':bind(p),'wholeOutputFileBindings':[bind(f.relative_to(R)) for f in sorted((R/row['outputDirectory']).rglob('*')) if f.is_file()]})
proof=w(V/'actual-four-config-orders-same124-IDs-and-six-prepared-packets-whole-preservation.json',{'fourChangedConfigs':changed,'counts':[x['count'] for x in index['configurations']],'current124IDSetWholeExact':True,'unchangedWholePreparedPackets':preserved,'nativePureOrderCheck':bind(V/'actual-pure-native-all13-order.stdout.json'),'actualNativePrepareErrorPreserved':bind(O/'actual-native-preparation-authorized-v19/batch-06-prepare.stderr.txt'),'actualNativeFailedCommand':bind(O/'actual-native-preparation-authorized-v19/batch-06-prepare.actual-command-exit.json'),'old20LedgerBefore':ledger_before,'new20Ledger':nl,'activeLedgerChangedByAuthor':False,'allOtherConfigFieldsExact':True,'onlyNecessaryFourGoalOrderAndFreshOutputChanges':True,'newScientificReviews':0,'humanClaims':0})
assert bind(ledgerp)==ledger_before
manifest=w(V/'actual-four-native-order-successors.whole-file-manifest.json',{'artifacts':[bind(p.relative_to(R)) for p in sorted((R/V).rglob('*')) if p.is_file()]})
h=w(V/'actual-final-four-necessary-native-order-configs-sameD124-and-ledger.INERT-author-handoff-v2.json',{'status':'INERT_NATIVE_ORDER_ONLY_SUCCESSORS','originalConcreteConfigHandoff':bind(O/'actual-final-thirteen-concrete-D124-configs-and-inert-ledger.AUTHOR-handoff.json'),'fourOnlyChangedPackageNumbers':[6,7,10,11],'exactFourLedgerPathFollowers':changed,'allThirteenCurrentConfigs':ix,'inertLedgerCandidate':nl,'currentActiveLedgerBefore':ledger_before,'actualNativePureCheckExitCode':0,'actualSchemaPass':4,'sameIDSetCount124':True,'sameRegular122AndSpecial2Assignment':True,'sixExistingPreparedOutputsWholeExact':proof,'manifest':manifest,'noActiveAuthorWrites':True,'noScienceApproval':True,'freshFourOutputDirectoriesNotPreparedYet':True})
print(json.dumps({'handoff':h,'index':ix,'ledger':nl,'changed':[{'i':x['packageNumber'],'newConfigPath':x['afterConfig']['path'],'newResolutionIndex':x['newFutureResolutionIndexPath']} for x in changed]},ensure_ascii=False))
