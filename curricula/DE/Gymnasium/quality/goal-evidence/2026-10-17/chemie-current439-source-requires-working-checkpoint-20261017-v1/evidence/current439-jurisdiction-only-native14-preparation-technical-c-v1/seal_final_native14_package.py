from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,os
O=Path(__file__).resolve().parent;C=O/'capsule';G=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule');rootO=G.parent
R=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-jurisdiction-only-native14-preparation-technical-c-v1')
L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def write(n,x):
 p=O/n;assert not p.exists();text=json.dumps(x,ensure_ascii=False,indent=2)+'\n';json.loads(text);p.write_text(text)
s=read(O/'SELECTION.remaining14-actual-current-root17-185-and-owner-plan.json');h=read(O/'HANDOFF.private-administrative-ledger-14-and-root-CAS.json');check=read(O/'CHECK.actual-stock-native14-and-current-source-integrity.json');execution=read(O/'EXECUTION.single-stock-native14-prepare.completed.json');clean=read(O/'SELECTOR.clean-current-native14-reviewer-inputs.sealed.json')
assert execution['exitCode']==0 and execution['stockPrepareInvocation']==1 and check['exitCode']==0
assert pin(G/L)['sha256']=='0c6cc8f8898056fb39c5e8e1cdceb061fcba5ce97f1f5f5ffbee991e37f1a99e'
for x in h['immutableSourcePins']:
 a=pin(Path(x['path']));assert a['sha256']==x['sha256'].removeprefix('sha256:') and a['bytes']==x['bytes']
for x in h['source17OriginalConfigs']:assert pin(Path(x['originalPin']['path']))==x['originalPin']
for x in clean['commonInputPins']+clean['bundleArtifactPins']+clean['cleanSupplementPins']:assert pin(Path(x['path']))==x
for r in clean['rounds']:
 for x in r['inputPins']:assert pin(Path(x['path']))==x
rootReceiptPath=rootO/'RECEIPT.actual-native26-disjoint-ledger-union.json';assert pin(rootReceiptPath)['sha256']=='1fd9c15881aaa84bb7992b4cbaf3f7e505df135b10ad366f0dc7012a73439698';rootReceipt=read(rootReceiptPath)
frozen=[]
for x in rootReceipt['createdOutputs']:
 if 'readOnlyFrozenNativeAlias' in x:
  p=Path(x['readOnlyFrozenNativeAlias'])/'batch-manifest.json';a=pin(p);assert a['sha256']==x['batchManifest']['sha256'] and a['bytes']==x['batchManifest']['bytes'];assert (C/p.relative_to(G)).read_bytes()==p.read_bytes();frozen.append({'alias':str(C/p.relative_to(G).parent),'batchManifestPin':a,'unchanged':True})
assert len(frozen)==2
centralReceipt=read(rootO/'RECEIPT.current439-actual-A1-V1-integrated-original-D-preserved.json');centralRel=centralReceipt['centralConfigRelativePath'];central=read(G/centralRel);subject=central['subjects'][0];assert len(subject['resolutionWithdrawals'])==7;assert (C/centralRel).read_bytes()==(G/centralRel).read_bytes();assert len(subject['resolutionIndexPaths'])==105 and len(subject['resolutionSupersessions'])==214
before=h['beforeLedgerWholeObject'];after=h['afterLedgerWholeObject'];assert len(before['activeBatchConfigPaths'])==17 and len(after['activeBatchConfigPaths'])==18
objects=[]
for x in h['changedOldClaimScopes']:
 ref=x['successorActiveReference'];obj=read(C/ref) if ref else None
 if obj:
  original=next(p['originalWholeObject'] for p in h['source17OriginalConfigs'] if p['originalPath']==x['oldActiveReference']);restored=json.loads(json.dumps(obj));restored['goalIds']=original['goalIds'];assert restored==original
 objects.append({'beforeActiveReference':x['oldActiveReference'],'beforePin':x['oldOriginalPin'],'afterActiveReference':ref,'afterWholeConfigObject':obj,'removedNative14GoalIds':x['removedNative14GoalIds'],'remainingGoalIdsExactOriginalOrder':x['remainingGoalIdsExactOriginalOrder'],'allOtherFieldsExact':True,'emptyRestReferenceRetired':x['emptyRestActiveReferenceRetired']})
assert len(objects)==2
cas={'schemaVersion':1,'role':'Exact native14 administrative root CAS inputs; NOT APPLIED TO ROOT','compareBeforeRoot':str(G),'compareBeforeLedgerPin':pin(G/L),'beforeWholeLedgerObject':before,'afterWholeLedgerObject':after,'remainderWholeObjects':objects,'new14ConfigRelativePath':h['newBatchConfigPath'],'new14ConfigPin':pin(C/h['newBatchConfigPath']),'new14WholeConfigObject':read(C/h['newBatchConfigPath']),'native14ReadOnlyAliasSource':clean['nativeRoot'],'native14AliasTargetRelative':str(R/'native14'),'beforeRefsClaims':[17,185],'afterRefsClaims':[18,196],'frozen6And20ConfigsClaimsAndInputsUnchanged':True,'frozenAliasGuards':frozen,'allSevenWithdrawals':subject['resolutionWithdrawals'],'rootUnionReceiptPin':pin(rootReceiptPath),'handgrip':['Compare Root ledger0c6cc8... and both affected old config hashes.','Copy the exact new14 package and two supplied whole remainder objects into a new root successor, preserving original17 config/ledger history.','Install native14 as an explicit frozen readonly alias or exact artifact copy; retain native6+20 aliases and claims.','CAS the complete after-ledger18refs/196claims; run stock loader and stronger global duplicate guard.','Preserve all7 withdrawals and original D indices/supersessions. Current D registration/review synthesis remains a separate root step.'],'futureRootStockLoaderNotRun':True,'appliedToOwnPrivateCapsule':True,'appliedToRootMainOrF':False,'newScienceVotes':0}
write('UNAPPLIED.root17-185-to-native14-18-196.exact-whole-CAS-inputs.json',cas)
guard={'schemaVersion':1,'role':'Final bounded technical source/native-input/ownership guards','atUTC':datetime.now(timezone.utc).isoformat(),'rootReceiptPin':pin(rootReceiptPath),'currentRootLedgerPin':pin(G/L),'ownPrivateLedgerPin':pin(C/L),'source17ConfigsAndLedgerUnchanged':True,'frozen6And20ClaimsAndManifestInputsUnchanged':True,'frozenAliasGuards':frozen,'currentCPSemCachedModelBaseAndSelected28AssetFilesUnchanged':True,'sealedCleanNative14InputsUnchanged':True,'sevenWithdrawalsUnchanged':True,'originalDescriptionControlCounts':[105,214,7],'centralConfigPin':pin(G/centralRel),'stockPrepareInvocations':1,'fullCentralOrStandalone439CompilerPDFRun':False,'historicalRoundValidatorsExecuted':0,'newScienceVotes':0,'rootMainFOrOtherCapsulesWritten':False}
write('GUARD.final-native14-bounded-current-inputs-and-frozen26.json',guard)
embedding=read(O/'CLEAN.existing-P-first-embedding-metadata.current14.json')
summary={'schemaVersion':1,'status':'TECHNICAL_NATIVE14_PREPARED_FOR_BLIND_REVIEW_NOT_REVIEWED','sourceBasisRoot':str(G),'sourceLedgerBeforePin':pin(G/L),'selectedRemaining14GoalIds':s['selectedGoalIds'],'actualFull439TopologicalOrderPreserved':True,'excludedFrozen20Native6AndNewer36':True,'rawCanonicalContextChangedFieldsOnly':['applicability.jurisdiction'],'DEENRequiresAndSelectedAssetBytesUnchanged':True,'existingEmbeddedWholePUnchangedCount':12,'historicalPNullNewlyEmbeddedExistingProfileCount':2,'historicalPNullGoalIds':embedding['historicalDInputHadNoEmbeddedP'],'PRecordsProfilesLevelsUnchanged':True,'newPReviewCount':0,'prepareActualExit':0,'prepareActualWallSeconds':execution['elapsedSeconds'],'prepareInvocations':1,'stockPreparedCheckExit':0,'cleanReviewerSelectorPin':pin(O/'SELECTOR.clean-current-native14-reviewer-inputs.sealed.json'),'nativeModelDigest':clean['bookDigest'],'baseBookDigest':clean['baseBookDigest'],'cleanSupplementPins':clean['cleanSupplementPins'],'privateLedgerBeforeRefsClaims':[17,185],'privateLedgerAfterRefsClaims':[18,196],'oldClaimIDsHandedOff':3,'remainderCounts':[11,14],'globalDuplicateClaims':0,'original17ConfigsAndLedgerArchivedExactly':True,'rootCASPin':pin(O/'UNAPPLIED.root17-185-to-native14-18-196.exact-whole-CAS-inputs.json'),'all7WithdrawalsUnchanged':True,'DRegistrationPerformed':False,'reviewResultsCreated':False,'newScienceVotes':0,'humanApprovalClaim':False,'M7Claim':False,'rootMainFOrOtherCapsulesWritten':False}
write('SUMMARY.native14-technical-preparation-and-root-CAS.json',summary)
(O/'README.native14-technical-preparation-and-root-CAS.md').write_text('''# Current439 remaining native14 technical preparation

Prepared exactly the remaining14 of the original34 current open pure-jurisdiction goals, preserving actual full439 topological order and excluding frozen20/native6/all36 newer owners. The raw canonical-context difference is only applicability.jurisdiction; DE/EN, requires, and selected asset bytes remain exact. Twelve previously embedded full P profiles match. For e7c3d20e-c4b3-560b-b8ee-c5abca8cc624 (actual ID in the selector uses e7c3d20e-4b13...) and e5a5dcd8-053c-55fd-b5c7-bba93779da53, historical D inputs had no embedded P; the current existing P439 profiles are now embedded unchanged. This creates no P review, evidence-level change or new science vote.

The source is the actual Root17/185 AV/native26 integrated capsule, ledger0c6cc8f8898056fb39c5e8e1cdceb061fcba5ce97f1f5f5ffbee991e37f1a99e. It already carries A76 and exact QA bc2e. The unchanged stock native14 prepare ran once: exit0,21.977s. StockPreparedCheck also passes, with two distinct blind campaigns over identical exact current14 input. No central or standalone439 compiler/model/PDF command ran. BaseBookDigest remains4b97c2a295643d56546e38c394caa60f622eeeb0c2ea997dace1e6da12808a54.

The frozen clean selector includes native14 HTML/PDF, full formal round/bundle inputs, current whole C/P data, direct prerequisite/parent and full439 teacher navigation context, and existing plain current mapping/source references limited to authored current jurisdictions. Those raw partner references are routing context, not a new source-coverage verdict; no peer findings or expected outcome is included. The two P-first-embedding cases have separate clean metadata.

Only this new private capsule received administrative claim handoff. Original17 configs and ledger are archived byte-exact. Three old claims move: shared aromatics13 ->11 and laboratory15 ->14. All remaining ID order and all other fields are exact. Native6+20 claims/configs/frozen aliases remain intact. Own ledger18/196 passes the stock loader and stronger global duplicate check. A narrow immediate command-process check found no matching affected old writer; this is an observation, not a lock.

The unapplied root CAS contains complete before/after ledger objects and both whole remainder configs, with exact compare-before pins and the new14 package reference. Adopt against Root17/185 only after comparing those pins; retain both frozen packages and all7 withdrawals, then run stock loader plus global duplicate validation. Do not infer current D registration or scientific approval from this technical package.

Root, original F, main and other capsules remain unchanged. No D registration, review result, science vote, M7 or human approval is claimed. Native14 inputs are frozen for later independent reviews; root will integrate actual6+20+14 review evidence together.
'''.replace('e7c3d20e-c4b3-560b-b8ee-c5abca8cc624 (actual ID in the selector uses e7c3d20e-4b13...)','e7c3d20e-4b13-560b-b8ee-c5abca8cc624'))
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
seal={'schemaVersion':1,'role':'Complete native14 technical preparation and bounded root-CAS package; no review verdicts','atUTC':datetime.now(timezone.utc).isoformat(),'files':[pin(p) for p in sorted(files)],'newScienceVotes':0,'appliedToRootMainOrF':False}
write('SEAL.native14-technical-complete.sha256.json',seal)
selector={'schemaVersion':1,'role':'Native14 technical preparation final selector; clean reviewer inputs frozen separately','summary':summary,'seal':pin(O/'SEAL.native14-technical-complete.sha256.json'),'cleanReviewerInputs':pin(O/'SELECTOR.clean-current-native14-reviewer-inputs.sealed.json'),'rootCAS':pin(O/'UNAPPLIED.root17-185-to-native14-18-196.exact-whole-CAS-inputs.json'),'nativeRoot':clean['nativeRoot'],'appliedToRootMainOrF':False}
write('SELECTOR.native14-technical-complete.sealed.json',selector)
for x in seal['files']:assert pin(Path(x['path']))==x
print(json.dumps({'selector':pin(O/'SELECTOR.native14-technical-complete.sealed.json'),'seal':selector['seal'],'cleanReviewerInputs':selector['cleanReviewerInputs'],'rootCAS':selector['rootCAS'],'filesSealed':len(files)},indent=2))
