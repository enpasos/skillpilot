from pathlib import Path
import datetime,hashlib,json,subprocess
R=Path.cwd();V=Path(__file__).resolve().parent;O=V.parent
load=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,v):
 with p.open('x')as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
native=load(V/'actual-original-native-D-only-current45-candidate-ID-set-measurement.READONLY.json');plan=load(O/'actual-current45-native-groups-and-exact-original-science-plan.INERT.json')
reg=load(V/'candidate-current45-only-owner-registry.INERT.config.json');before=load(V/'actual-whole-current-registry-before45.EXACT.json')
s=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften');bs=next(s for s in before['subjects'] if s['subject']=='wirtschaftswissenschaften')
assert len(s['resolutionIndexPaths'])==66 and len(s['resolutionSupersessions'])==161
own=set(plan['requestedGoalIds']);currentBefore=set(native['before']['descriptionReadyGoalIds']);currentAfter=set(native['candidate']['descriptionReadyGoalIds']);gained=currentAfter-currentBefore
assert native['before']['descriptionReadyCount']==257 and native['candidate']['descriptionReadyCount']==281 and not native['lostDescriptionReadyGoalIds']
c49=load(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-forty-nine-valid-D2-current-owner-page-scoping-AUTHOR-INERT-c-v1/actual49-whole-original-D2-and-current-contract-P-page-source-parity-and-one6de-OPEN.READONLY.json');c49by={r['goalId']:r for r in c49['current49']}
goals={g['id']:g for g in load(R/s['landscapePath'])['goals']};claims={};indexIssues={};freshIds=set();freshIndices=bs['resolutionIndexPaths'][-2:]
for p in s['resolutionIndexPaths']:
 j=load(R/p)
 if p in freshIndices:freshIds.update(j['batchGoalIds'])
 prefix='wirtschaftswissenschaften:'+j['artifactSetId']+':'
 errs=[x for x in native['candidate']['descriptionIssues'] if x.startswith(prefix)]
 if errs:indexIssues[p]=errs
 for e in j['resolutions']:claims.setdefault(e['goalId'],[]).append({'indexPath':p,'indexBinding':bind(R/p),'entry':e})
rows=[]
for id in sorted(gained):
 relevant=[e for e in s['resolutionSupersessions'] if e['goalId']==id];out={e['supersededIndexPath'] for e in relevant};terminal=[c for c in claims[id] if c['indexPath']not in out];assert len(terminal)==1,(id,terminal)
 t=terminal[0];respath=(R/t['indexPath']).parent/t['entry']['resolutionPath'];res=load(respath)
 rows.append({'goalId':id,'currentTitleDe':goals[id]['title'],'isSelectedOwn45':id in own,
              'current49ManifestMembership':c49by.get(id),'inRoot2ReusedThree':id in plan['Root2Current3ReusedIDs'],
              'inCurrentRootD12ReviewPairBatch12':id in freshIds,
              'nativeCurrentTerminalOwner':t,'nativeResolutionBinding':bind(respath),
              'nativeCurrentGoalAndTwoRoundBindings':{'goal':res['goal'],'rounds':res['rounds'],'synthesisDecisionManifest':res['synthesisDecisionManifest']},
              'supersessionEdgesWhole':relevant,'meaningQualificationNotInferredFromGainOrHash':True})
guards=[]
start=load(O/'inputs-before-current45-native-preparation.READONLY.json')
regpath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
for b in start['bindings']:
 a=bind(R/b['path']); exact=a==b
 if not exact:
  assert b['path']==regpath
  assert (R/regpath).read_bytes()==(V/'actual-whole-current-registry-before45.EXACT.json').read_bytes()
 guards.append({'path':b['path'],'before':b,'after':a,'exact':exact,'qualifiedRootD12PrefixOnly':not exact})
oldseal=O/'SEALED-forty-five-whole-historical-science-current-native-owner-followers-and-open-chain-boundaries.AUTHOR-INERT.json'
for b in load(oldseal)['artifacts']:assert bind(R/b['path'])==b
assert sha(oldseal)=='sha256:9cd9e07ee0de1e3c68196222656309f6ff16ab60bab25b66b4b8d9cfe563c63a'
barriers=[]
for id in plan['requestedGoalIds']:
 paths=[c['indexPath']for c in claims[id]]
 barriers.append({'goalId':id,'nativeStandaloneCurrentOwnResolved':True,'baselineAlreadyReady':id in currentBefore,'candidateReady':id in currentAfter,'newlyReady':id in gained,
                  'historicalSharedIndexBlockers':[{'indexPath':p,'originalNativeIssues':indexIssues[p]}for p in paths if p in indexIssues]})
root=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-third-M7-twelve-current-dual-description-synthesis-root-v1'
proof={'status':'SEALED-CANDIDATE-native-owner-and-ID-measurements-independent-science-qualification-pending',
       'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEAD':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
       'qualifiedRootD12ActivationReceiptBinding':bind(root/'10-actual-twelve-current-dual-pairs-and-eight-contexts-registry-activation.receipt.json'),
       'qualifiedRootD12EightContextReceiptBinding':bind(root/'09-actual-eight-indirect-context-gains-whole-meaning-qualified-before-activation.ROOT.receipt.json'),
       'original45WholeNativeScienceSeal':bind(oldseal),'original45All642ArtifactBytesExact':True,
       'baseRegistry':bind(V/'actual-whole-current-registry-before45.EXACT.json'),'candidateRegistry':bind(V/'candidate-current45-only-owner-registry.INERT.config.json'),
       'beforeIndices':51,'candidateIndices':66,'beforeSupersessions':116,'candidateSupersessions':161,
       'actualBeforeD':257,'actualCandidateD':281,'actualGainedCount':24,'actualLostCount':0,
       'directOwnGainedGoalIds':sorted(gained&own),'indirectGainedGoalIds':sorted(gained-own),
       'ownAlreadyBaselineReadyGoalIds':sorted(currentBefore&own),'selected45CurrentReadyGoalIds':sorted(currentAfter&own),
       'selected45CurrentlyBlockedGoalIds':sorted(own-currentAfter),'currentRootD12ReviewPairIds12':sorted(freshIds),
       'wholeGainMembershipAndNativeCurrentOwnerRows24':rows,'all45OwnSharedHistoricalIndexBlockers':barriers,
       'classificationBoundary':'A gain may be a newly effective current RootD12 scientific decision or a binding restoration. Classify against the actual independent pair and current whole context; neither label is inferred from an ID increase. All14 indirect effects and all45 owner followers still require independent qualification before activation.',
       'inputBeforeAfter':guards,'exactGuardCount':sum(x['exact']for x in guards),'qualifiedParentRegistryAdvanceCount':sum(not x['exact']for x in guards),
       'native45StandalonePrepareCheckSummaryFinalizePreserved':True,'newScientificReviews':0,'newModelCalls':0,'activeWrites':0,'strictClosures':0,'humanApproval':False}
write(V/'actual24-gains45-followers-native-membership-owner-and-qualified51-prefix-endguards.AUTHOR-INERT.receipt.json',proof)
artifacts=[bind(p)for p in sorted(V.rglob('*'))if p.is_file()]
write(V/'SEALED-qualified51-116-prefix-plus-exact45-native-followers-and-measured257-to281.INERT.json',{
 'status':'SEALED-AUTHOR-INERT-independent-qualification-pending-no-active-release','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'artifacts':artifacts,'originalWhole45Seal':bind(oldseal),'portabilityAndFullSerializedFileParseAddendum':bind(O/'actual-original-curriculum-symlink-errors-and-complete-written-json-jsonl-parse.ADDENDUM.READONLY.json'),
 'actualBeforeD':257,'actualCandidateD':281,'directOwnGains':10,'indirectGains':14,'losses':0,'ownAlreadyBaselineReady':6,'ownReady':16,'ownBlocked':29,
 'activeWrites':0,'newScienceReview':0,'newModelCalls':0,'integratedStrictClosures':0,'humanApproval':False})
print(json.dumps({'actualBeforeD':257,'actualCandidateD':281,'direct10':sorted(gained&own),'indirect14':sorted(gained-own),'endGuards':len(guards),'activeWrites':0}))
