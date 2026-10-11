from pathlib import Path
import datetime, hashlib, json, re, subprocess

R=Path.cwd();O=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text())
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
def bind(p):
    b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':sha(b),'bytes':len(b)}
def write(p,v):
    with p.open('x') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
plan=load(O/'actual-current45-native-groups-and-exact-original-science-plan.INERT.json')
before=load(O/'inputs-before-current45-native-preparation.READONLY.json')
native=load(O/'actual-original-native-D-only-current45-candidate-ID-set-measurement.READONLY.json')
registry=load(O/'candidate-current45-only-owner-registry.INERT.config.json')
econ=next(s for s in registry['subjects'] if s['subject']=='wirtschaftswissenschaften')
own=load(O/'actual45-current-registry-prefix-and-per-goal-terminal-owner-candidate.INERT.json')
parity=load(O/'actual45-whole-two-round-science-and-current-contract-profile-parity.AUTHOR-INERT.json')
individual=[row for g in parity['groups'] for row in g['actualScientificParity']]
assert len(individual)==90 and {x['goalId'] for x in individual}==set(plan['requestedGoalIds'])
for row in individual:
    for k in ['originalRecordScienceFieldsWholeExact','originalCanonicalContextWholeExact','originalGoalFingerprintWholeExact','wholeDEENTextExact','wholePPayloadExact','wholeExistingVisualizationMetadataExact']:
        assert row[k],(row['goalId'],k)
    assert not row['newModelInferenceCallPerformed']
guards=[]
regpath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
for b in before['bindings']:
    end=bind(R/b['path']);exact=b==end
    allowed=False
    if not exact and b['path']==regpath:
        now=load(R/regpath);old=before['registryBefore']
        assert [s for s in old['subjects'] if s['subject']!='wirtschaftswissenschaften']==[s for s in now['subjects'] if s['subject']!='wirtschaftswissenschaften']
        a=next(s for s in old['subjects'] if s['subject']=='wirtschaftswissenschaften');z=next(s for s in now['subjects'] if s['subject']=='wirtschaftswissenschaften')
        assert {k:v for k,v in a.items() if k not in ['resolutionIndexPaths','resolutionSupersessions']}=={k:v for k,v in z.items() if k not in ['resolutionIndexPaths','resolutionSupersessions']}
        assert z['resolutionIndexPaths'][:len(a['resolutionIndexPaths'])]==a['resolutionIndexPaths']
        assert z['resolutionSupersessions'][:len(a['resolutionSupersessions'])]==a['resolutionSupersessions']
        allowed=True
    assert exact or allowed,(b,end)
    guards.append({'path':b['path'],'before':b,'after':end,'exact':exact,'allowedParentQualifiedRegistryPrefixAdvanceOnly':allowed})
indexissues={}
for p in econ['resolutionIndexPaths']:
    index=load(R/p);prefix='wirtschaftswissenschaften:'+index['artifactSetId']+':'
    found=[issue for issue in native['candidate']['descriptionIssues'] if issue.startswith(prefix)]
    if found:indexissues[p]=found
barriers=[];ready=set(native['selected45ReadyGoalIds'])
for row in own['whole45PerGoalOwnerRoutes']:
    paths=set(row['allHistoricalRegisteredClaims'])
    found=[{'historicalIndexPath':p,'actualOriginalNativeIssues':indexissues[p]} for p in sorted(paths) if p in indexissues]
    barriers.append({'goalId':row['goalId'],'nativeOwnStandaloneResolved':True,'nativeCurrentRegistryReady':row['goalId'] in ready,'allHistoricalClaims':row['allHistoricalRegisteredClaims'],'nativeHistoricalSharedIndexBlockers':found,
                     'nativeIntactChainRequiresEachHistoricalIndexIssueFree':True,'noCheckerWaiverOrBlindWithdrawals':True})
assert len(barriers)==45 and len(ready)==1 and not native['lostDescriptionReadyGoalIds']
historicaltimes=[{'groupNumber':g['groupNumber'],'goalId':x['goalId'],'round':x['round'],'originalRunId':x['originalActualReviewRunId'],'originalProvider':x['originalActualProvider'],'originalModel':x['originalActualModel'],'originalStartedAt':x['originalScientificStartedAt'],'originalCompletedAt':x['originalScientificCompletedAt']} for g in parity['groups'] for x in g['actualScientificParity']]
write(O/'actual45-historical-science-native-owner-and-shared-index-boundaries.AUTHOR-INERT.receipt.json',{
    'status':'AUTHOR-INERT-standalone45-native-pass-current-registry-chain-blocks-disclosed-independent-qualification-pending',
    'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEAD':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
    'sourceIndependentScopeSeal':plan['sourceC49Seal'],'changedThreeNeighborQualificationSeal':plan['A3ChangedNeighborQualifiedSeal'],
    'ownWholeOriginalScienceParity90':individual,'originalScientificRunTimesAndIdentities90Preserved':historicaltimes,
    'wholeOriginalSourceAtomsParentsEdgesAndDecisions43Exact':plan['sourceParity'],
    'nativeStandaloneReadyCount':45,'nativePreparedGroups':15,
    'originalNativeDescriptionOnlyBaseline':native['before']['descriptionReadyCount'],
    'originalNativeDescriptionOnlyCandidate':native['candidate']['descriptionReadyCount'],
    'actualDescriptionGains':native['gainedDescriptionReadyGoalIds'],'actualDescriptionLosses':native['lostDescriptionReadyGoalIds'],
    'ownSelectedCurrentRegistryReady':native['selected45ReadyGoalIds'],'indirectGainsNotAutomaticallyQualified':native['indirectGainedGoalIds'],
    'historicalMultiGoalIndexBlockers45':barriers,'allWholeForeignSubjectsExact':True,
    'original6deScopeOpenUnchangedInThis45Package':plan['explicitOpen6de'],
    'separate6deIndependentContextClarificationNotConsumedAsOwnerOrNewD2Review':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-6de-historical-null-P-current-two-case-context-independent-required-gate-READONLY-v1/SEALED-independent-6de-old-null-P-current-whole-two-case-context-KEEP.READONLY.json',
    'threeRoot2CurrentOwnersReusedNotDuplicated':plan['Root2Current3ReusedIDs'],
    'qualificationRequired':'Independent current-container/history parity qualification and qualified closure of shared historical index blockers before any active registry changes; a parent D12 prefix needs an additive registry successor, never overwrite the historical49/105 snapshot.',
    'originalHumanApprovalStatusUnchanged':True,'newScientificReviews':0,'newModelCalls':0,'activeWrites':0,'integratedDescriptionClosures':0,'strictClosures':0,'humanApproval':False})
write(O/'actual1457-input-before-after-and-allowed-registry-prefix-endguards.READONLY.json',{
    'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'beforeObservation':before['observedAtUtc'],'guards':guards,
    'guardCount':len(guards),'exactCount':sum(g['exact'] for g in guards),'parentQualifiedRegistryPrefixAdvanceCount':sum(g['allowedParentQualifiedRegistryPrefixAdvanceOnly'] for g in guards),
    'activeWrites':0,'newScientificReviews':0})
artifacts=[bind(p) for p in sorted(O.rglob('*')) if p.is_file()]
write(O/'SEALED-forty-five-whole-historical-science-current-native-owner-followers-and-open-chain-boundaries.AUTHOR-INERT.json',{
    'status':'SEALED-AUTHOR-INERT-independent-qualification-pending-current-registry-chain-blocks-open',
    'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'artifacts':artifacts,'artifactCount':len(artifacts),
    'nativeStandaloneReady45':45,'exactOriginalScienceRecords90':90,'guardCount':len(guards),'actualHistoricalRegistryBaselineD':246,'actualHistoricalRegistryCandidateD':256,
    'claimed45IntegratedOrStrictClosures':0,'newScientificReview':0,'newModelCalls':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'sealedArtifacts':len(artifacts),'wholeScienceRecords':90,'guards':len(guards),'beforeD':246,'candidateD':256,'selected45Ready':1,'lost':0,'activeWrites':0}))
