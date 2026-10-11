from pathlib import Path
import collections, datetime, hashlib, json, subprocess

R=Path.cwd();O=Path(__file__).resolve().parent
C=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-fourteen-existing-D-pair-source-course-prerequisite-current-context-independent-c-READONLY-v1'
load=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(n,v):
    with(O/n).open('x')as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
mp=C/'actual14-original-pairs-current-whole-goal-profile-page-source-inputs-and-before-guards.READONLY.json';m=load(mp)
rp=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=load(rp);s=next(x for x in reg['subjects']if x['subject']=='wirtschaftswissenschaften')
bp=R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json';book=load(bp);can=load(R/book['landscapePath']);byid={g['id']:g for g in can['goals']}
pp={json.loads(l)['goalId']:json.loads(l)for p in book['evidenceReviewPaths']for l in(R/p).read_text().splitlines()}
assert b(bp)==m['currentBookConfigBinding']and b(R/book['landscapePath'])==m['currentCANBinding']
groups=collections.defaultdict(list);goals=[];guards={str(mp.relative_to(R)):b(mp),str(rp.relative_to(R)):b(rp),str(bp.relative_to(R)):b(bp)}
claims={i:[]for i in m['goalIds']}
for ip in s['resolutionIndexPaths']:
    index=load(R/ip)
    for entry in index['resolutions']:
        if entry['goalId']in claims:claims[entry['goalId']].append(ip)
for row in m['goals']:
    ip=R/row['wholeInputsBinding']['path'];assert b(ip)==row['wholeInputsBinding'];x=load(ip);gid=x['goalId'];assert byid[gid]==x['wholeActualCurrentGoal']and pp[gid]==x['wholeActualCurrentPositiveRecord']
    pair=x['selectedOriginalSciencePair'];idx=pair['index']['path'];history=(R/idx).parent;oldbatch=load(history/'batch-manifest.json');oldcfgpath=R/oldbatch['configPath'];oldcfg=load(oldcfgpath);bundle=load(history/'round-a/review-bundle-manifest.json')
    prompt=next(z for z in bundle['artifacts']if z['role']=='review_prompt');criteria=next(z for z in bundle['artifacts']if z['role']=='review_criteria');promptpath=history/'bundle'/prompt['path'];criteriapath=history/'bundle'/criteria['path']
    assert sha(promptpath)==prompt['digest']and sha(criteriapath)==criteria['digest']
    for rd in x['wholeOriginalBothRounds']:
        assert not rd['DEENDiff']; assert rd['wholeOriginalNativeGoalInput']['goalFingerprint']==x['wholeActualCurrentNativePage']['goalFingerprint']
    edges=[e for e in s['resolutionSupersessions']if e['goalId']==gid];term=set(claims[gid])-{e['supersededIndexPath']for e in edges}
    assert len(term)==1 or(gid=='fab48742-756b-564d-87ef-cd6f3c75f348'and not term and not claims[gid]and not edges)
    info={'goalId':gid,'title':x['title'],'CWholePendingInput':b(ip),'scientificContextQualification':'PENDING-not-assumed','selectedOriginalPair':pair,'selectedOriginalPairOrigin':x['selectedOriginalPairOrigin'],'currentRegisteredTerminalOwner':next(iter(term))if term else None,'noHistoricalRegisteredClaimMeansNoInventedSupersession':not term,'allCurrentRegisteredClaims':claims[gid],'existingSupersessionEdges':edges,'currentWholeGoalAndPExactToCInput':True,'originalDEENAndGoalFingerprintExact':True,'actualCanonicalDelta':[r['actualCanonicalContextDiff']for r in x['wholeOriginalBothRounds']],'actualPProfilePayloadDelta':[r['actualPProfilePayloadDiff']for r in x['wholeOriginalBothRounds']],'oldPAbsent':[r['oldPWasAbsentAfterActualNestedPageLookup']for r in x['wholeOriginalBothRounds']],'originalProviderAndTimesRetainedNotNewReview':True}
    goals.append(info);groups[idx].append(gid)
    for p in [ip,R/idx,oldcfgpath,promptpath,criteriapath]:guards[str(p.relative_to(R))]=b(p)
    for rd in pair['existingIndependentRounds']:
        for k in ['reviewInput','actualResults','runManifest','campaign']:guards[rd[k]['path']]=b(R/rd[k]['path'])
    for k in ['resolution','dualSummary','synthesisManifest']:guards[pair[k]['path']]=b(R/pair[k]['path'])
prepared=[]
for n,(idx,ids)in enumerate(groups.items(),1):
    old=load(R/idx);ordered=[i for i in old['batchGoalIds']if i in ids];assert set(ordered)==set(ids)
    for round in ['first','second']:
        runs=[next(r for r in next(x for x in goals if x['goalId']==i)['selectedOriginalPair']['existingIndependentRounds']if r['round']==round)['runManifest']['path']for i in ids];assert len(set(runs))==1
    prepared.append({'groupNumber':n,'goalIds':ordered,'selectedOriginalIndex':b(R/idx),'sameActualHistoricalRunPerRound':True,'nativePrepareFinalizeStatus':'NOT_STARTED_PENDING_C_QUALIFICATION'})
write('actual14-original-history-registered-owner-and-native-group-plan-PENDING.READONLY.json',{'status':'AUTHOR-INERT-plan-pending-C-whole-context-qualification-no-science-KEEP-assumed','observedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEAD':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'CInputManifest':b(mp),'actualRegistryPreparationEpoch':b(rp),'actualIndexPrefixCount':len(s['resolutionIndexPaths']),'actualSupersessionPrefixCount':len(s['resolutionSupersessions']),'CManifestEarlierRegistryEpochHistoricalOnly':m['currentRegBinding'],'registryEpochAdvanceExplicit':b(rp)!=m['currentRegBinding'],'wholeBookPAndCANInputEpochExactToC':True,'goals':goals,'groups':prepared,'requestedGoalIds':m['goalIds'],'requestedCount':14,'guardsBefore':list(guards.values()),'newScienceReviews':0,'newInferenceRuns':0,'nativeCandidateFinished':False,'activeWrites':0,'humanApproval':False,'strictClosures':0})
print(json.dumps({'groups':len(prepared),'goals':len(goals),'indexPrefix':len(s['resolutionIndexPaths']),'supersessionPrefix':len(s['resolutionSupersessions']),'sourceQualification':'PENDING','guards':len(guards),'activeWrites':0}))
