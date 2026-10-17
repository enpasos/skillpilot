from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,os
O=Path(__file__).resolve().parent;C=O/'capsule';F=Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule')
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def write(n,x):
 p=O/n;assert not p.exists();text=json.dumps(x,ensure_ascii=False,indent=2)+'\n';json.loads(text);p.write_text(text)
s=read(O/'SELECTION.actual-open-pure-jurisdiction-first20-and-ownership-plan.json');h=read(O/'HANDOFF.private-administrative-ledger-20-and-future-union.json');check=read(O/'CHECK.actual-stock-native20-and-current-source-integrity.json');execution=read(O/'EXECUTION.single-stock-native20-prepare.completed.json');clean=read(O/'SELECTOR.clean-current-native20-reviewer-inputs.sealed.json')
assert execution['exitCode']==0 and execution['stockPrepareInvocation']==1 and check['exitCode']==0
for x in h['immutableSourcePins']+s['observedOriginalSourcePins']:
 a=pin(Path(x['path']));assert a['sha256']==x['sha256'].removeprefix('sha256:') and a['bytes']==x['bytes']
for x in h['source15OriginalConfigs']:assert pin(Path(x['originalPin']['path']))==x['originalPin']
assert pin(Path(h['beforeLedgerPin']['path']))==h['beforeLedgerPin']
for r in clean['rounds']:
 for x in r['inputPins']:assert pin(Path(x['path']))==x
for x in clean['commonInputPins']+clean['bundleArtifactPins']:assert pin(Path(x['path']))==x
peerC=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-native6-actual-context-remediation-preparation-technical-a-v1/capsule');peerRel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-native6-actual-context-remediation-technical-v1/native6.stock.config.json';peer=read(peerC/peerRel)
assert pin(peerC/peerRel)['sha256']=='a99fc0d91999df7679f7c069e165ddcca185b2394e8edc7a169b2b37987c1daa'
assert peer['goalIds']==s['excludedNative6'];assert not set(peer['goalIds'])&set(s['selectedGoalIds'])
R=Path(h['reviewRoot']);allIds=set(s['selectedGoalIds']+peer['goalIds']);union=json.loads(json.dumps(h['beforeLedgerWholeObject']));union['activeBatchConfigPaths']=[];restObjects=[];claims={}
for i,x in enumerate(h['source15OriginalConfigs'],1):
 before=x['originalWholeObject'];removed=[g for g in before['goalIds'] if g in allIds];remaining=[g for g in before['goalIds'] if g not in allIds]
 if not removed:
  reference=x['originalPath'];obj=before
 else:
  reference=str(R/'future-union-rests'/f'old-{i:02d}.original-fields-minus-disjoint-native26.config.json') if remaining else None
  obj=json.loads(json.dumps(before));obj['goalIds']=remaining
  restored=json.loads(json.dumps(obj));restored['goalIds']=before['goalIds'];assert restored==before
  restObjects.append({'oldOriginalPath':x['originalPath'],'compareBeforePin':x['originalPin'],'removedGoalIdsInOriginalOrder':removed,'remainingGoalIdsExactOriginalOrder':remaining,'plannedReference':reference,'afterWholeConfigObject':obj,'allOtherFieldsExact':True,'emptyRestReferenceRetired':not remaining})
 if reference:
  union['activeBatchConfigPaths'].append(reference)
  for gid in obj['goalIds']:assert gid not in claims;claims[gid]=reference
for ref,obj in [(h['newBatchConfigPath'],read(C/h['newBatchConfigPath'])),(peerRel,peer)]:
 union['activeBatchConfigPaths'].append(ref)
 for gid in obj['goalIds']:assert gid not in claims;claims[gid]=ref
assert len(union['activeBatchConfigPaths'])==17 and len(claims)==185 and len(restObjects)==4
centralRel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-all-seven-current439-native-central-preparation-technical-a-v1/central.current439.all-seven-HB7f.prepared.private.config.json';central=read(F/centralRel);withdrawals=central['subjects'][0]['resolutionWithdrawals'];assert len(withdrawals)==7;assert (C/centralRel).read_bytes()==(F/centralRel).read_bytes()
future={'schemaVersion':1,'role':'Exact future disjoint20+6 ledger union CAS inputs only; NOT APPLIED','beforeLedgerPin':h['beforeLedgerPin'],'beforeWholeLedgerObject':h['beforeLedgerWholeObject'],'afterWholeLedgerObject':union,'plannedRestConfigWholeObjects':restObjects,'new20Config':{'relativePath':h['newBatchConfigPath'],'sourcePin':pin(C/h['newBatchConfigPath'])},'new6Config':{'relativePath':peerRel,'sourcePin':pin(peerC/peerRel)},'expectedActiveRefs':17,'expectedClaims':185,'globalDuplicatesUnderPlannedWholeObjects':0,'sharedAromaticsRestCount':13,'inputSetsDisjoint':True,'handgrip':['Compare original shared15/171 ledger and the four original config hashes.','Import both exact native packages/configs into the future private root, retaining original15-config/ledger history.','Write only the four supplied same-body-minus26 rest objects at their planned paths; retain untouched active refs.','CAS the supplied whole after-ledger17refs/185claims, then run stock loadGoalDescriptionRolloutInFlightLedger and the stronger global duplicate check.','Do not sequentially overwrite either private rest/ledger; leave all seven withdrawals exact for separate root review after genuine new reviews.'],'unchanged7Withdrawals':withdrawals,'futureStockLoaderNotYetRun':True,'applied':False,'newScienceVotes':0}
write('UNAPPLIED.future26-ledger-union.exact-whole-CAS-inputs.json',future)
guard={'schemaVersion':1,'role':'Final narrow byte guards; no new preparation or broad validation','atUTC':datetime.now(timezone.utc).isoformat(),'selectionAndSourceInputsUnchanged':True,'original15ConfigsAndLedgerUnchanged':True,'sealedCleanReviewerInputsUnchanged':True,'canonicalPSEMModelBaseAndSelected40AssetFilesUnchanged':True,'allSevenWithdrawalsUnchanged':True,'centralConfigPin':pin(F/centralRel),'privateLedgerPin':pin(C/'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'),'QAByteExactPin':pin(C/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'),'stockPrepareExecutions':1,'newScienceVotes':0,'futureUnionCASOnly':True,'appliedToMainOrF':False}
write('GUARD.final-exact-selected-sources-native-inputs-and-withdrawals.json',guard)
summary={'schemaVersion':1,'status':'TECHNICAL_NATIVE20_PREPARED_FOR_BLIND_REVIEW_NOT_REVIEWED','poolActualOpenUniquePureJurisdiction':34,'selectedCount':20,'remainingPool':14,'poolHistoricalPNullAnnotatedNotSubstantiveChange':2,'selectedHistoricalPNull':0,'selectedGoalIds':s['selectedGoalIds'],'canonicalContextChangedFieldsOnly':['applicability.jurisdiction'],'DEENRequiresWholeExistingPAndAssetBytesUnchanged':True,'sourceSelectorPin':s['sourceSelector'],'sourceModelPin':s['currentModel'],'all36NewerOwnersExcluded':True,'native6Excluded':True,'topologicalOrderViolations':0,'prepareActualExit':0,'prepareActualWallSeconds':execution['elapsedSeconds'],'prepareInvocations':1,'stockPreparedCheckExit':0,'cleanReviewerSelectorPin':pin(O/'SELECTOR.clean-current-native20-reviewer-inputs.sealed.json'),'actualNativeModelDigest':clean['bookDigest'],'actualBaseBookDigest':clean['baseBookDigest'],'baseSourceDifferenceFields':check['baseSourceDifferenceFields'],'QAByteExactSha256':guard['QAByteExactPin']['sha256'],'privateLedgerBefore':{'refs':15,'claims':171},'privateLedgerAfter':{'refs':16,'claims':182},'oldUnmaterializedClaimIDsHandedOff':9,'restScopeCounts':[17,14],'currentGlobalDuplicateClaims':0,'original15ConfigsAndLedgerHistoryExact':True,'future26Union':{'refs':17,'claims':185,'sharedAromaticsRest':13,'CASArtifactPin':pin(O/'UNAPPLIED.future26-ledger-union.exact-whole-CAS-inputs.json'),'unapplied':True},'all7WithdrawalsExact':True,'newScienceVotes':0,'reviewResultsCreated':False,'humanApprovalClaim':False,'M7Claim':False,'fullCentralCompilerPDF439Run':False,'mainFAndOtherCapsulesWritten':False}
write('SUMMARY.native20-selection-preparation-and-private-ledger-handoff.json',summary)
(O/'README.native20-technical-preparation-and-future-ledger-union.md').write_text('''# Current439 jurisdiction-only native20 preparation

Twenty goals selected from 34 actually open, structurally unique D owners by exact current central-context issues, in the existing full439 topological order. The only raw canonical-context change is `applicability.jurisdiction`; DE/EN, requires, the complete previously embedded P profile, and public/canonical image bytes match. Two historical P=null cases in the remaining pool are explicitly annotated and are not treated as substantive profile changes. The native6 scope and all36 newer owners are excluded.

One unchanged stock prepare succeeded (23.024s); the stock prepared-batch validator also succeeded. Two separate blind campaigns bind identical exact current20 inputs. The clean input selector was sealed before any reviewer result and remains unchanged. No outcome is proposed. No new science vote, review result, D/M7 completion, human approval or activation is asserted.

Only this new private capsule received administrative ledger changes. All15 old configs and the old ledger are archived byte-exact. Nine old unmaterialized claims were removed: polymers20 ->17 and aromatics20 ->14. All other config fields and remaining ID order are exact. A new20 config was added:16 active refs/182 globally unique claims. Stock loader and stronger global ownership checks pass. Fresh roster observations found no matching old writer; observations do not constitute a lock.

The exact QA file is bc2e35e0db01b675e1e1ab13f29e1819f40a715a17a5a96763dffd5848fb780f. The original a04d cached439 model is unchanged. Stock prepare performs its required in-memory loading of the same439 base; only the source QA digest changes, yielding base digest4b97c2a295643d56546e38c394caa60f622eeeb0c2ea997dace1e6da12808a54. No separate full439 compiler/model/PDF or central command ran.

The unapplied future26 CAS includes the complete original ledger, complete future17-ref ledger, and four exact rest config objects. Import both native packages/configs into the future private root, compare the supplied old pins, materialize the four rests and CAS the whole ledger; then use the stock loader plus global duplicate validation. Expected union:17 refs/185 claims; the shared aromatics remainder is13. No sequential overwrite of independent ledgers/rests is safe.

All seven active withdrawals remain exact. In particular the selected54bc/87d8/64b0 withdrawals are not retired by preparation; root retains their separate legitimate historical-chain/current-review decision. Source science and archived history remain untouched. A pre-prepare guard-wrapper syntax error was corrected before any stock function ran, and its raw script/error note is retained. The single stock prepare was not repeated.
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
seal={'schemaVersion':1,'role':'Final exact technical native20 preparation, private ownership handoff, and clean inputs; no review verdicts','atUTC':datetime.now(timezone.utc).isoformat(),'files':[pin(p) for p in sorted(files)],'newScienceVotes':0,'appliedToMainOrF':False}
write('SEAL.native20-technical-complete.sha256.json',seal)
selector={'schemaVersion':1,'role':'Native20 technical preparation final selector; clean reviewer inputs remain separately frozen','summary':summary,'seal':pin(O/'SEAL.native20-technical-complete.sha256.json'),'cleanReviewerInputs':pin(O/'SELECTOR.clean-current-native20-reviewer-inputs.sealed.json'),'futureUnionCAS':pin(O/'UNAPPLIED.future26-ledger-union.exact-whole-CAS-inputs.json'),'nativeRoot':clean['nativeRoot'],'mainFAndOtherCapsulesWritten':False}
write('SELECTOR.native20-technical-complete.sealed.json',selector)
for x in seal['files']:assert pin(Path(x['path']))==x
print(json.dumps({'selector':pin(O/'SELECTOR.native20-technical-complete.sealed.json'),'seal':selector['seal'],'cleanReviewerInputs':selector['cleanReviewerInputs'],'futureUnionCAS':selector['futureUnionCAS'],'filesSealed':len(files)},indent=2))
