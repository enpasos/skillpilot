from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,os
O=Path(__file__).resolve().parent;C=O/'capsule';G=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule');F=Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule')
R=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-requires-only-native20-preparation-technical-c-v1');L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def verify(x):
 a=pin(Path(x['path']));assert a['sha256']==x['sha256'].removeprefix('sha256:') and a['bytes']==x['bytes'];return a
def write(n,x):
 p=O/n;assert not p.exists();t=json.dumps(x,ensure_ascii=False,indent=2)+'\n';json.loads(t);p.write_text(t)
s=read(O/'SELECTION.requires-only20-of25-current-root18-196.json');h=read(O/'HANDOFF.private-requires20-and-guarded-root18-CAS.json');check=read(O/'CHECK.actual-stock-native20-and-current-source-integrity.json');execution=read(O/'EXECUTION.single-stock-native20-prepare.completed.json');checked=read(O/'EXECUTION.stock-native20-prepared-check.completed.json');clean=read(O/'SELECTOR.clean-current-native20-reviewer-inputs.sealed.json')
assert execution['exitCode']==checked['exitCode']==check['exitCode']==0 and execution['stockPrepareInvocation']==1
assert pin(G/L)['sha256']=='1269d3db20df75623ea8f73f34f5822bb1d81e0250f2893cd1e069ef1b1bc675';verify(s['root18ReceiptPin']);verify(h['beforeLedgerPin']);verify(h['afterLedgerPin'])
for x in h['immutableSourcePins']:verify(x)
for x in h['source18OriginalConfigs']:
 verify(x['originalPin']);a=verify(x['archivedPin']);assert a['sha256']==x['originalPin']['sha256'] and a['bytes']==x['originalPin']['bytes']
for x in clean['commonInputPins']+clean['bundleArtifactPins']+clean['cleanSupplementPins']:verify(x)
for r in clean['rounds']:
 for x in r['inputPins']:verify(x)
frozen=[]
for x in h['frozen40ConfigAndManifestPins']:
 verify(x['configPin']);verify(x['manifestPin']);assert (C/x['configRef']).read_bytes()==(G/x['configRef']).read_bytes();p=Path(x['manifestPin']['path']);assert (C/p.relative_to(G)).read_bytes()==p.read_bytes();frozen.append(x)
assert len(frozen)==3 and len({g for x in frozen for g in x['goalIds']})==40
centralReceipt=read(G.parent/'RECEIPT.current439-actual-A1-V1-integrated-original-D-preserved.json');centralRel=centralReceipt['centralConfigRelativePath'];subject=read(G/centralRel)['subjects'][0];assert (C/centralRel).read_bytes()==(G/centralRel).read_bytes()
original=read(F/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-all-seven-current439-native-central-preparation-technical-a-v1/central.current439.all-seven-HB7f.prepared.private.config.json')['subjects'][0]
for field in ['resolutionWithdrawals','resolutionSupersessions','resolutionSemanticRetirements']:assert subject[field]==original[field]
assert [len(subject[k]) for k in ['resolutionIndexPaths','resolutionSupersessions','resolutionWithdrawals','resolutionSemanticRetirements']]==[105,214,7,3]
before=h['beforeLedgerWholeObject'];after=h['afterLedgerWholeObject'];assert len(before['activeBatchConfigPaths'])==len(after['activeBatchConfigPaths'])==18
objects=[]
for x in h['changedOldClaimScopes']:
 ref=x['successorActiveReference'];obj=read(C/ref) if ref else None
 old=next(p['originalWholeObject'] for p in h['source18OriginalConfigs'] if p['originalPath']==x['oldActiveReference'])
 assert x['remainingGoalIdsExactOriginalOrder']==[g for g in old['goalIds'] if g not in s['selectedGoalIds']]
 if obj:
  restored=json.loads(json.dumps(obj));restored['goalIds']=old['goalIds'];assert restored==old
 objects.append({'beforeActiveReference':x['oldActiveReference'],'beforePin':x['oldOriginalPin'],'beforeWholeConfigObject':old,'afterActiveReference':ref,'afterWholeConfigObject':obj,'removedRequires20GoalIds':x['removedGoalIds'],'remainingGoalIdsExactOriginalOrder':x['remainingGoalIdsExactOriginalOrder'],'allOtherFieldsExact':True,'emptyRestReferenceRetired':x['emptyRestActiveReferenceRetired']})
assert len(objects)==5 and sum(len(x['removedRequires20GoalIds']) for x in objects)==5 and sum(x['emptyRestReferenceRetired'] for x in objects)==1
cas={'schemaVersion':1,'role':'Exact Requires20 administrative CAS inputs against Root18/196; UNAPPLIED TO ROOT','compareBeforeRoot':str(G),'compareBeforeLedgerPin':pin(G/L),'compareBeforeReceiptPin':s['root18ReceiptPin'],'beforeWholeLedgerObject':before,'afterRequires20OnlyWholeLedgerObject':after,'remainderWholeObjects':objects,'new20ConfigRelativePath':h['newBatchConfigPath'],'new20ConfigPin':pin(C/h['newBatchConfigPath']),'new20WholeConfigObject':read(C/h['newBatchConfigPath']),'requires20ReadOnlyAliasSource':clean['nativeRoot'],'requires20AliasTargetRelative':str(R/'native20'),'selected20GoalIds':s['selectedGoalIds'],'beforeRefsClaims':[18,196],'afterRequires20OnlyRefsClaims':[18,211],'original18ConfigPins':[x['originalPin'] for x in h['source18OriginalConfigs']],'frozen6And20And14ConfigsClaimsAndManifestInputsUnchanged':True,'frozen40Guards':frozen,'allSevenWithdrawals':subject['resolutionWithdrawals'],'parallelP13UnionRequired':True,'unionHandgrip':['Compare the exact original Root18/196 ledger1269d3... and all affected original config pins.','Compute the disjoint Requires20+P13 union from the original18 scopes: remove the union of handed-off IDs once from each original ordered goalIds array, preserving every other field. Shared old scopes require one combined remainder object.','Preserve original18 configs/ledger and all scientific history. The empty original batch-011 single-goal scope is retired only as an administrative active reference; its historical findings are not waived.','Register both new current packages and preserve the frozen6+20+14 configs/claims/inputs. The supplied after-ledger18/211 is a Requires20-only illustration and must not replace a ledger containing parallel P13.','Install explicit frozen readonly aliases or exact artifact copies, CAS the combined whole ledger, then run the stock loader and a stronger global goalId duplicate guard.','Preserve all7 withdrawals,105 D indices,214 supersessions,3 semantic retirements, current A/V and canonical/P/SEM/QA/assets. D registration and review synthesis remain separate root actions.'],'futureRootStockLoaderNotRun':True,'appliedToOwnPrivateCapsule':True,'appliedToRootMainOrF':False,'newScienceVotes':0}
write('UNAPPLIED.root18-196-to-requires20-18-211.exact-whole-CAS-inputs.json',cas)
guard={'schemaVersion':1,'role':'Final bounded Requires20 source, native-input and claim guards','atUTC':datetime.now(timezone.utc).isoformat(),'root18ReceiptPin':s['root18ReceiptPin'],'currentRootLedgerPin':pin(G/L),'ownPrivateLedgerPin':pin(C/L),'source18ConfigsAndLedgerArchivedExactlyAndUnchanged':True,'frozen40ConfigClaimsAndManifestInputsUnchanged':True,'currentCanonicalPSEMCachedModelBaseQAAndSelected40AssetFilesUnchanged':True,'sealedCleanNative20InputsUnchanged':True,'allSevenWithdrawalsExactOriginal':True,'originalDescriptionControlCounts':[105,214,7,3],'centralConfigPin':pin(G/centralRel),'stockPrepareInvocations':1,'stockPreparedCheckCalls':1,'fullCentralOrStandalone439CompilerPDFRun':False,'historicalRoundValidatorsExecuted':0,'newScienceVotes':0,'rootMainFOrOtherCapsulesWritten':False}
write('GUARD.final-requires20-bounded-current-inputs-and-frozen40.json',guard)
summary={'schemaVersion':1,'status':'TECHNICAL_REQUIRES20_PREPARED_FOR_BLIND_REVIEW_NOT_REVIEWED','sourceBasisRoot':str(G),'sourceLedgerBeforePin':pin(G/L),'inventorySelectorPin':s['sourceInventorySelector'],'selected20GoalIds':s['selectedGoalIds'],'remainingRequiresOnlyFive':s['remainingRequiresOnlyFive'],'actualFull439TopologicalOrderPreserved':True,'canonicalContextChangedFieldsOnly':['requires'],'DEENWholeExistingPAndSelectedAssetBytesUnchanged':True,'previouslyEmbeddedWholePUnchangedCount':11,'historicalPNullFirstEmbeddingCount':9,'historicalPNullGoalIds':s['oldPNullGoalIds'],'currentPRecordsProfilesAndLevelsUnchanged':True,'newPReviewCount':0,'prepareActualExit':0,'prepareActualWallSeconds':execution['elapsedSeconds'],'prepareInvocations':1,'stockPreparedCheckExit':0,'stockPreparedCheckWallSeconds':checked['elapsedSeconds'],'cleanReviewerSelectorPin':pin(O/'SELECTOR.clean-current-native20-reviewer-inputs.sealed.json'),'nativeModelDigest':clean['bookDigest'],'baseBookDigest':clean['baseBookDigest'],'cleanSupplementPins':clean['cleanSupplementPins'],'privateLedgerBeforeRefsClaims':[18,196],'privateLedgerAfterRefsClaims':[18,211],'oldClaimIDsHandedOff':5,'previouslyUnclaimedSelectedCount':15,'nonemptyRemainderCounts':[len(x['remainingGoalIdsExactOriginalOrder']) for x in objects if x['afterActiveReference']],'emptyOldAdministrativeReferenceRetiredCount':1,'globalDuplicateClaims':0,'original18ConfigsAndLedgerArchivedExactly':True,'rootCASPin':pin(O/'UNAPPLIED.root18-196-to-requires20-18-211.exact-whole-CAS-inputs.json'),'parallelP13RequiresExplicitUnion':True,'all7WithdrawalsUnchanged':True,'DRegistrationPerformed':False,'reviewResultsCreated':False,'newScienceVotes':0,'humanApprovalClaim':False,'M7Claim':False,'rootMainFOrOtherCapsulesWritten':False}
write('SUMMARY.requires20-technical-preparation-and-root-CAS.json',summary)
(O/'README.requires20-technical-preparation-and-root-CAS.md').write_text('''# Current439 Requires20 technical preparation

Exactly the first20 of25 requires-only goals from the sealed remaining51 inventory are prepared in actual full439 book order. Their concrete canonical-context change is requires. Current DE/EN, all existing P records/profiles/levels and selected image bytes remain exact. Nine historical D inputs had no embedded P; this embeds unchanged existing current profiles, with no new P assessment.

The source is Root18/196, ledger1269d3db20df75623ea8f73f34f5822bb1d81e0250f2893cd1e069ef1b1bc675. One actual stock prepare and one actual stock prepared validator passed. The exact timings, commands and raw output are preserved. Stock prepare's required in-memory base load gives base digest4b97c2a295643d56546e38c394caa60f622eeeb0c2ea997dace1e6da12808a54. No central or standalone full439 compiler/model/PDF command was run.

The clean frozen selector includes the20 current subset pages/images/HTML/PDF, identical exact round inputs for two distinct independent campaigns, current whole C/P rows, teacher prerequisite/parent/navigation context, and matching existing original source partners. No peer verdict or expected scientific result is included.

Only this private capsule received administrative handoff. Exact original18 configs and ledger are archived. Five old IDs move into the new20 scope. Four nonempty restscopes keep11/16/15/15 IDs in their original order, with every other config field exact. The old batch-011 single8ceb reference becomes empty and is retired only as an administrative active reference; all historical findings and bytes remain preserved. All40 frozen6+20+14 claims/configs/inputs remain exact. Own18/211 passes actual stock ledger loading and global goalId uniqueness.

The unapplied root CAS provides complete original/Requires20-only ledger objects, whole remainder objects and exact source pins. Parallel P13 preparation uses the same18/196 basis. Root must construct one disjoint combined claim union from the original18 scopes, including combined remainders for shared old scopes, rather than sequentially applying either single-package after-ledger. Current D registration and scientific synthesis remain separate.

All7 withdrawals and original105/214/7/3 D controls remain exact. No main/F/root/other capsule writes, review result, new science vote, human approval or M7 claim occurred.
''')
files=[]
for root,dirs,names in os.walk(O,followlinks=False):
 for name in names:
  p=Path(root)/name
  if p.is_symlink():continue
  if p.suffix=='.json':json.loads(p.read_text())
  if p.suffix=='.jsonl':
   for line in p.read_text().splitlines():
    if line.strip():json.loads(line)
  files.append(p)
write('SEAL.requires20-technical-complete.sha256.json',{'schemaVersion':1,'role':'Complete bounded Requires20 technical preparation and unapplied root-CAS package','atUTC':datetime.now(timezone.utc).isoformat(),'files':[pin(p) for p in sorted(files)],'newScienceVotes':0,'appliedToRootMainOrF':False})
selector={'schemaVersion':1,'role':'Requires20 technical preparation final selector; clean reviewer inputs frozen separately','summary':summary,'seal':pin(O/'SEAL.requires20-technical-complete.sha256.json'),'cleanReviewerInputs':pin(O/'SELECTOR.clean-current-native20-reviewer-inputs.sealed.json'),'rootCAS':pin(O/'UNAPPLIED.root18-196-to-requires20-18-211.exact-whole-CAS-inputs.json'),'nativeRoot':clean['nativeRoot'],'appliedToRootMainOrF':False}
write('SELECTOR.requires20-technical-complete.sealed.json',selector)
for x in read(O/'SEAL.requires20-technical-complete.sha256.json')['files']:verify(x)
print(json.dumps({'selector':pin(O/'SELECTOR.requires20-technical-complete.sealed.json'),'seal':selector['seal'],'cleanReviewerInputs':selector['cleanReviewerInputs'],'rootCAS':selector['rootCAS'],'filesSealed':len(files)},indent=2))
