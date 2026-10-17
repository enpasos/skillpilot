from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,os
O=Path(__file__).resolve().parent;C=O/'capsule';G=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule');F=Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule')
R=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remaining-mixed18-preparation-technical-c-v1');L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def verify(x):
 a=pin(Path(x['path']));assert a['sha256']==x['sha256'].removeprefix('sha256:') and a['bytes']==x['bytes'];return a
def write(n,x):
 p=O/n;assert not p.exists();t=json.dumps(x,ensure_ascii=False,indent=2)+'\n';json.loads(t);p.write_text(t)
s=read(O/'SELECTION.remaining-mixed18-current-root18-196.json');h=read(O/'HANDOFF.private-mixed18-and-guarded-root18-CAS.json');check=read(O/'CHECK.actual-stock-native18-and-current-source-integrity.json');execution=read(O/'EXECUTION.single-stock-native18-prepare.completed.json');checked=read(O/'EXECUTION.stock-native18-prepared-check.completed.json');clean=read(O/'SELECTOR.clean-current-native18-reviewer-inputs.sealed.json')
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
before=h['beforeLedgerWholeObject'];after=h['afterLedgerWholeObject'];assert len(before['activeBatchConfigPaths'])==18 and len(after['activeBatchConfigPaths'])==19
objects=[]
for x in h['changedOldClaimScopes']:
 ref=x['successorActiveReference'];obj=read(C/ref) if ref else None
 old=next(p['originalWholeObject'] for p in h['source18OriginalConfigs'] if p['originalPath']==x['oldActiveReference'])
 assert x['remainingGoalIdsExactOriginalOrder']==[g for g in old['goalIds'] if g not in s['selectedGoalIds']]
 if obj:
  restored=json.loads(json.dumps(obj));restored['goalIds']=old['goalIds'];assert restored==old
 objects.append({'beforeActiveReference':x['oldActiveReference'],'beforePin':x['oldOriginalPin'],'beforeWholeConfigObject':old,'afterActiveReference':ref,'afterWholeConfigObject':obj,'removedMixed18GoalIds':x['removedGoalIds'],'remainingGoalIdsExactOriginalOrder':x['remainingGoalIdsExactOriginalOrder'],'allOtherFieldsExact':True,'emptyRestReferenceRetired':x['emptyRestActiveReferenceRetired']})
assert len(objects)==6 and sum(len(x['removedMixed18GoalIds']) for x in objects)==11 and sum(x['emptyRestReferenceRetired'] for x in objects)==0
cas={'schemaVersion':1,'combined51UnionPlanPin':pin(O/'PLAN.future-disjoint51-administrative-union-from-original18-scopes.json'),'role':'Exact Mixed18 administrative CAS inputs against Root18/196; UNAPPLIED TO ROOT','compareBeforeRoot':str(G),'compareBeforeLedgerPin':pin(G/L),'compareBeforeReceiptPin':s['root18ReceiptPin'],'beforeWholeLedgerObject':before,'afterMixed18OnlyWholeLedgerObject':after,'remainderWholeObjects':objects,'new18ConfigRelativePath':h['newBatchConfigPath'],'new18ConfigPin':pin(C/h['newBatchConfigPath']),'new18WholeConfigObject':read(C/h['newBatchConfigPath']),'mixed18ReadOnlyAliasSource':clean['nativeRoot'],'mixed18AliasTargetRelative':str(R/'native18'),'selected18GoalIds':s['selectedGoalIds'],'beforeRefsClaims':[18,196],'afterMixed18OnlyRefsClaims':[19,203],'original18ConfigPins':[x['originalPin'] for x in h['source18OriginalConfigs']],'frozen6And20And14ConfigsClaimsAndManifestInputsUnchanged':True,'frozen40Guards':frozen,'allSevenWithdrawals':subject['resolutionWithdrawals'],'parallelRequires20AndP13UnionRequired':True,'parallelRequires20GoalIds':s['parallelRequires20GoalIds'],'parallelPOnly13GoalIds':s['parallelPOnly13GoalIds'],'concreteDeltaSelectionPin':pin(O/'SELECTION.remaining-mixed18-current-root18-196.json'),'unionHandgrip':['Compare exact original Root18/196 ledger1269d3... and affected original config pins.','Form one disjoint Requires20+P13+Mixed18 union of all51 IDs from original18 scopes. Remove the combined handed-off IDs once from each original ordered goalIds array, preserving every other field. Shared old scopes require one combined remainder object.','Preserve original18 configs/ledger and scientific history. The empty batch-011 reference from Requires20 is only an administrative retirement; no historical negative finding is waived.','Register all three new packages, preserving frozen6+20+14 configs/claims/inputs. Single-package after-ledgers must not overwrite either parallel package.','Install explicit frozen readonly aliases or exact artifact copies, CAS the combined whole ledger, then run stock loader and a stronger global goalId duplicate guard.','Preserve all7 withdrawals,105 D indices,214 supersessions,3 semantic retirements, current A/V and canonical/P/SEM/QA/assets. Scientific review synthesis and D registration remain separate root actions.'],'futureRootStockLoaderNotRun':True,'appliedToOwnPrivateCapsule':True,'appliedToRootMainOrF':False,'newScienceVotes':0}
write('UNAPPLIED.root18-196-to-mixed18-19-203.exact-whole-CAS-inputs.json',cas)
guard={'schemaVersion':1,'role':'Final bounded Mixed18 source, native-input and claim guards','atUTC':datetime.now(timezone.utc).isoformat(),'root18ReceiptPin':s['root18ReceiptPin'],'currentRootLedgerPin':pin(G/L),'ownPrivateLedgerPin':pin(C/L),'source18ConfigsAndLedgerArchivedExactlyAndUnchanged':True,'frozen40ConfigClaimsAndManifestInputsUnchanged':True,'currentCanonicalPSEMCachedModelBaseQAAndSelected36AssetFilesUnchanged':True,'sealedCleanNative18InputsUnchanged':True,'allSevenWithdrawalsExactOriginal':True,'originalDescriptionControlCounts':[105,214,7,3],'centralConfigPin':pin(G/centralRel),'narrowWriterObservationPin':pin(O/'GUARD.roster-at-prepare-start.json'),'stockPrepareInvocations':1,'stockPreparedCheckCalls':1,'fullCentralOrStandalone439CompilerPDFRun':False,'historicalRoundValidatorsExecuted':0,'newScienceVotes':0,'rootMainFOrOtherCapsulesWritten':False}
write('GUARD.final-mixed18-bounded-current-inputs-and-frozen40.json',guard)
summary={'schemaVersion':1,'combined51UnionPlanPin':pin(O/'PLAN.future-disjoint51-administrative-union-from-original18-scopes.json'),'status':'TECHNICAL_MIXED18_PREPARED_FOR_BLIND_REVIEW_NOT_REVIEWED','sourceBasisRoot':str(G),'sourceLedgerBeforePin':pin(G/L),'inventorySelectorPin':s['sourceInventorySelector'],'selected18GoalIds':s['selectedGoalIds'],'requiresOnlyFive':s['requiresOnlyFive'],'mixedSpecificFieldsThirteen':s['mixedSpecificFieldsThirteen'],'actualFull439TopologicalOrderPreserved':True,'concreteDeltaFlagsOverlap':s['currentDeltaFlagsOverlap'],'canonicalContextChangedFieldsOnly':['requires','applicability.jurisdiction'],'DEENFinalTextsUnchangedAgainstSelectedD':True,'currentNCanonicalPSEMAndAssetsNotModified':True,'historicalEmbeddedWholePDeltaCount':7,'historicalPNullFirstEmbeddingCount':1,'historicalPNullGoalIds':s['oldPNullGoalIds'],'historicalToCurrentAssetBindingDeltaCount':4,'currentPRecordsProfilesAndLevelsNotEdited':True,'newPOrImageReviewCount':0,'prepareActualExit':0,'prepareActualWallSeconds':execution['elapsedSeconds'],'prepareInvocations':1,'stockPreparedCheckExit':0,'stockPreparedCheckWallSeconds':checked['elapsedSeconds'],'cleanReviewerSelectorPin':pin(O/'SELECTOR.clean-current-native18-reviewer-inputs.sealed.json'),'nativeModelDigest':clean['bookDigest'],'baseBookDigest':clean['baseBookDigest'],'cleanSupplementPins':clean['cleanSupplementPins'],'privateLedgerBeforeRefsClaims':[18,196],'privateLedgerAfterRefsClaims':[19,203],'oldClaimIDsHandedOff':11,'previouslyUnclaimedSelectedCount':7,'nonemptyRemainderCounts':[len(x['remainingGoalIdsExactOriginalOrder']) for x in objects],'emptyOldAdministrativeReferenceRetiredCount':0,'globalDuplicateClaims':0,'original18ConfigsAndLedgerArchivedExactly':True,'rootCASPin':pin(O/'UNAPPLIED.root18-196-to-mixed18-19-203.exact-whole-CAS-inputs.json'),'parallelRequires20AndP13RequireExplicitUnion':True,'all7WithdrawalsUnchanged':True,'DRegistrationPerformed':False,'reviewResultsCreated':False,'newScienceVotes':0,'humanApprovalClaim':False,'M7Claim':False,'rootMainFOrOtherCapsulesWritten':False}
write('SUMMARY.mixed18-technical-preparation-and-root-CAS.json',summary)
(O/'README.mixed18-technical-preparation-and-root-CAS.md').write_text('''# Current439 remaining Mixed18 technical preparation

The remaining18 of the sealed concrete51 inventory are prepared in actual full439 book order: five requires-only plus13 with mixed specific changes. The overlapping concrete flags are requires13, raw jurisdiction9, existing whole P7 and current asset binding4; no final DE/EN text differs. The exact historical-to-current fields remain explicit in the selection. Current canonical/P/SEM/QA/assets are copied by readonly reference without editing or new scientific judgement. For9decc36b-a69a-5599-a9f0-fcebdf0203d8 the historical D input had no embedded P; the current existing profile is embedded for the first time. This is separate from the seven actual embedded-profile changes.

The source is Root18/196, ledger1269d3db20df75623ea8f73f34f5822bb1d81e0250f2893cd1e069ef1b1bc675. One actual stock prepare and one actual stock prepared validator passed. Commands, timing and raw outputs are preserved. The required stock in-memory base load yields base digest4b97c2a295643d56546e38c394caa60f622eeeb0c2ea997dace1e6da12808a54. No central or standalone full439 compiler/model/PDF command ran.

The frozen clean selector contains current18 subset HTML/PDF/images, exact identical formal inputs for two distinct blind campaigns, current whole C/P records, teacher prerequisites/parents/navigation context, and245 matching current direct source partners from20 mappingfiles/17 existing original source references. It contains no peer verdict or expected review outcome. Preparation gives no new P/image/source review, evidence level, science vote or approval.

Only this private capsule receives an administrative handoff. Original18 configs and ledger are archived byte-exact. Eleven old claims move into the new18; six remainder scopes keep11/10/14/9/15/16 goals in their exact original order and retain every other field. All40 frozen6+20+14 claims/configs/inputs remain exact. Own19/203 passes the actual stock loader and stronger global goalId uniqueness.

The guarded unapplied root CAS provides whole before/after ledger and remainder objects. Parallel Requires20 and P13 packages share the original18/196 basis. Root must combine all51 disjoint new IDs into one administrative union, including combined remainders for shared old scopes. Each individual after-ledger illustrates its own package only. Root will register actual scientific results and D evidence separately.

All7 withdrawals and original105/214/7/3 D controls remain exact. No main/F/root/other capsule write, review result, new science vote, human approval or M7 claim occurred.
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
write('SEAL.mixed18-technical-complete.sha256.json',{'schemaVersion':1,'role':'Complete bounded Mixed18 technical preparation and unapplied root-CAS package','atUTC':datetime.now(timezone.utc).isoformat(),'files':[pin(p) for p in sorted(files)],'newScienceVotes':0,'appliedToRootMainOrF':False})
selector={'schemaVersion':1,'role':'Mixed18 technical preparation final selector; clean reviewer inputs frozen separately','summary':summary,'seal':pin(O/'SEAL.mixed18-technical-complete.sha256.json'),'cleanReviewerInputs':pin(O/'SELECTOR.clean-current-native18-reviewer-inputs.sealed.json'),'rootCAS':pin(O/'UNAPPLIED.root18-196-to-mixed18-19-203.exact-whole-CAS-inputs.json'),'nativeRoot':clean['nativeRoot'],'appliedToRootMainOrF':False}
write('SELECTOR.mixed18-technical-complete.sealed.json',selector)
for x in read(O/'SEAL.mixed18-technical-complete.sha256.json')['files']:verify(x)
print(json.dumps({'selector':pin(O/'SELECTOR.mixed18-technical-complete.sealed.json'),'seal':selector['seal'],'cleanReviewerInputs':selector['cleanReviewerInputs'],'rootCAS':selector['rootCAS'],'filesSealed':len(files)},indent=2))
