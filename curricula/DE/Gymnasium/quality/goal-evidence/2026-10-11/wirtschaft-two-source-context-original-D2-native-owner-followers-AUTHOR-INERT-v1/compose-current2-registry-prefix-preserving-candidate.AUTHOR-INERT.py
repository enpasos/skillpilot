from pathlib import Path
import copy, datetime, hashlib, json

R=Path.cwd(); O=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text())
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
def write(p,v):
    with p.open('x') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
plan=load(O/'actual-current2-native-groups-and-qualified-source-context-plan.INERT.json')
regpath=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
raw=regpath.read_bytes(); before=json.loads(raw); after=copy.deepcopy(before)
b=next(s for s in before['subjects'] if s['subject']=='wirtschaftswissenschaften')
a=next(s for s in after['subjects'] if s['subject']=='wirtschaftswissenschaften')
claims={i:[] for i in plan['requestedGoalIds']}
for ip in b['resolutionIndexPaths']:
    for e in load(R/ip)['resolutions']:
        if e['goalId'] in claims:claims[e['goalId']].append(ip)
newindices=[]; newedges=[]; details=[]
for g in plan['groups']:
    new=g['outputDirectory']+'/resolution-index.json'
    actual=load(R/new)
    assert actual['batchGoalIds']==g['goalIds']
    assert {e['goalId'] for e in actual['resolutions']}==set(g['goalIds'])
    assert new not in a['resolutionIndexPaths']
    newindices.append(new)
    for i in g['goalIds']:
        es=[e for e in b['resolutionSupersessions'] if e['goalId']==i]
        oldnodes={e[k] for e in es for k in ['supersededIndexPath','replacementIndexPath']}
        assert oldnodes<=set(claims[i])
        outgoing={e['supersededIndexPath'] for e in es}
        terminals=set(claims[i])-outgoing
        assert len(terminals)==1,(i,terminals)
        terminal=next(iter(terminals))
        edge={'goalId':i,'supersededIndexPath':terminal,'replacementIndexPath':new}
        newedges.append(edge)
        details.append({'goalId':i,'allHistoricalRegisteredClaims':claims[i],
                        'oldTerminalOwner':terminal,'newTerminalOwner':new,
                        'preservedScientificPairIndex':g['originalPairs'][i]['index'],
                        'existingSupersessionEdgesExact':es,
                        'newScienceReview':False})
a['resolutionIndexPaths']+=newindices; a['resolutionSupersessions']+=newedges
assert len(newindices)==2 and len(newedges)==2
assert a['resolutionIndexPaths'][:len(b['resolutionIndexPaths'])]==b['resolutionIndexPaths']
assert a['resolutionSupersessions'][:len(b['resolutionSupersessions'])]==b['resolutionSupersessions']
assert {k:v for k,v in a.items() if k not in ['resolutionIndexPaths','resolutionSupersessions']}=={k:v for k,v in b.items() if k not in ['resolutionIndexPaths','resolutionSupersessions']}
assert [s for s in before['subjects'] if s['subject']!='wirtschaftswissenschaften']==[s for s in after['subjects'] if s['subject']!='wirtschaftswissenschaften']
beforepath=O/'actual-whole-current-registry-before2.EXACT.json'; beforepath.write_bytes(raw)
afterpath=O/'candidate-current2-only-owner-registry.INERT.config.json'; write(afterpath,after)
write(O/'actual2-current-registry-prefix-and-per-goal-terminal-owner-candidate.INERT.json',{
    'status':'AUTHOR-INERT-independent-qualification-pending','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'activeRegistryBinding':{'path':str(regpath.relative_to(R)),'sha256':sha(raw),'bytes':len(raw)},
    'baselineIndexCount':len(b['resolutionIndexPaths']),'candidateIndexCount':len(a['resolutionIndexPaths']),
    'baselineSupersessionCount':len(b['resolutionSupersessions']),'candidateSupersessionCount':len(a['resolutionSupersessions']),
    'addedIndexPaths':newindices,'addedSupersessions':newedges,'whole2PerGoalOwnerRoutes':details,
    'foreignSubjectsWholeExact':True,'oldEconomicsIndexAndSupersessionPrefixesWholeExact':True,
    'allOtherEconomicsFieldsWholeExact':True,'authorTarget2Ids':plan['requestedGoalIds'],
    'threeRoot2OwnersReusedNotDuplicated':plan['Root2Current3ReusedIDs'],
    'original6deScopeOpenPreserved':plan['explicitOpen6de'],'newScientificReview':0,'activeWrites':0,'strictClosures':0,
    'candidateRegistryPath':str(afterpath.relative_to(R))})
assert regpath.read_bytes()==raw
print(json.dumps({'indices':len(b['resolutionIndexPaths']),'candidateIndices':len(a['resolutionIndexPaths']),'supersessions':len(b['resolutionSupersessions']),'candidateSupersessions':len(a['resolutionSupersessions']),'newGoalOwners':len(details),'activeWrites':0}))
