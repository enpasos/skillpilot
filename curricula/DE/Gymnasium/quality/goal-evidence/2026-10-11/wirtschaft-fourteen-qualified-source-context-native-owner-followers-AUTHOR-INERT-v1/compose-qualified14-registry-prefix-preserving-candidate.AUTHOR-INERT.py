from pathlib import Path
import copy, datetime, hashlib, json

R=Path.cwd();O=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text())
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
def write(p,v):
    with p.open('x')as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
plan=load(O/'actual-current-qualified14-native-groups-and-C-source-context-plan.INERT.json')
regpath=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';raw=regpath.read_bytes()
assert sha(raw)==plan['rootRegistryEpoch']['sha256'],'Active prefix advanced; requires an explicitly stamped additive successor, not silent rebase'
before=json.loads(raw);after=copy.deepcopy(before);bs=next(x for x in before['subjects']if x['subject']=='wirtschaftswissenschaften');a=next(x for x in after['subjects']if x['subject']=='wirtschaftswissenschaften')
claims={i:[]for i in plan['requestedGoalIds']}
for ip in bs['resolutionIndexPaths']:
    for e in load(R/ip)['resolutions']:
        if e['goalId']in claims:claims[e['goalId']].append(ip)
newindices=[];newedges=[];routes=[]
for g in plan['groups']:
    ip=g['outputDirectory']+'/resolution-index.json';idx=load(R/ip);assert set(idx['batchGoalIds'])==set(g['goalIds'])and set(x['goalId']for x in idx['resolutions'])==set(g['goalIds']);assert ip not in a['resolutionIndexPaths'];newindices.append(ip)
    for gid in g['goalIds']:
        es=[e for e in bs['resolutionSupersessions']if e['goalId']==gid];term=set(claims[gid])-{e['supersededIndexPath']for e in es}
        if term:
            assert len(term)==1
            old=next(iter(term));newedges.append({'goalId':gid,'supersededIndexPath':old,'replacementIndexPath':ip})
        else:
            assert gid=='fab48742-756b-564d-87ef-cd6f3c75f348'and not claims[gid]and not es;old=None
        routes.append({'goalId':gid,'allHistoricalRegisteredClaims':claims[gid],'oldTerminalOwner':old,'newTerminalOwner':ip,'existingSupersessionEdgesExact':es,'noInventedOldClaimOrSupersession':old is None,'preservedScientificPairIndex':g['originalPairs'][gid]['index'],'CQualifiedCurrentContext':g['contextQualification'],'newScientificReview':False})
a['resolutionIndexPaths']+=newindices;a['resolutionSupersessions']+=newedges
assert len(routes)==len(plan['requestedGoalIds'])and len(newindices)==len(plan['groups'])
assert a['resolutionIndexPaths'][:len(bs['resolutionIndexPaths'])]==bs['resolutionIndexPaths']and a['resolutionSupersessions'][:len(bs['resolutionSupersessions'])]==bs['resolutionSupersessions']
assert {k:v for k,v in a.items()if k not in ['resolutionIndexPaths','resolutionSupersessions']}=={k:v for k,v in bs.items()if k not in ['resolutionIndexPaths','resolutionSupersessions']}
assert [s for s in before['subjects']if s['subject']!='wirtschaftswissenschaften']==[s for s in after['subjects']if s['subject']!='wirtschaftswissenschaften']
beforepath=O/'actual-whole-current-registry-before14.EXACT.json'
with beforepath.open('xb')as f:f.write(raw)
candidatepath=O/'candidate-current14-only-owner-registry.INERT.config.json';write(candidatepath,after)
write(O/'actual14-current-registry-prefix-and-per-goal-terminal-owner-candidate.INERT.json',{'status':'AUTHOR-INERT-native-bindings-independently-qualified-context-integration-pending','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'activeRegistryBinding':plan['rootRegistryEpoch'],'baselineIndexCount':len(bs['resolutionIndexPaths']),'candidateIndexCount':len(a['resolutionIndexPaths']),'baselineSupersessionCount':len(bs['resolutionSupersessions']),'candidateSupersessionCount':len(a['resolutionSupersessions']),'addedIndexPaths':newindices,'addedSupersessions':newedges,'wholePerGoalOwnerRoutes':routes,'CQualifiedGoalIds':plan['requestedGoalIds'],'COpenGoalIdsExcluded':plan['COpenGoalIdsExcluded'],'foreignSubjectsWholeExact':True,'oldEconomicsPrefixesWholeExact':True,'allOtherEconomicsFieldsWholeExact':True,'candidateRegistryPath':str(candidatepath.relative_to(R)),'newScientificReviews':0,'activeWrites':0,'strictClosures':0})
assert regpath.read_bytes()==raw
print(json.dumps({'baseIndices':len(bs['resolutionIndexPaths']),'candidateIndices':len(a['resolutionIndexPaths']),'baseSupersessions':len(bs['resolutionSupersessions']),'candidateSupersessions':len(a['resolutionSupersessions']),'goals':len(routes),'newClaimsWithoutInventedSupersession':[r['goalId']for r in routes if r['oldTerminalOwner']is None],'activeWrites':0}))
