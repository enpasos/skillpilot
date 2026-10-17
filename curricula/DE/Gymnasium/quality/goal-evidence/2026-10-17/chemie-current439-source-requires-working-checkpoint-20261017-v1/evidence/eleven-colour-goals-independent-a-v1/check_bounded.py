import copy, hashlib, json
from pathlib import Path

OUT=Path('/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-independent-a-v1')
SELECTOR=Path('/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-retained-target-scope-author-v1/SELECTOR.clean-content-for-two-other-reviewers.json')
def pin(p):
    p=Path(p)
    return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def digest(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
s=json.loads(SELECTOR.read_text());x=json.loads(Path(s['reviewInput']['path']).read_text())
canonical=json.loads(Path(x['baseCanonical']['path']).read_text()); goals={g['id']:g for g in canonical['goals']}
baseviews={v['viewId']:v for v in json.loads(Path(x['baseWhole39Views']['path']).read_text())}
profiles={r['goalId']:r['profile'] for r in map(json.loads,Path(x['currentWholeProfilesSource']['path']).read_text().splitlines())}
assert len(goals)==650 and len(baseviews)==39 and len(profiles)==439
def walk(nodes,path=()):
    for n in nodes:
        yield n,path
        yield from walk(n.get('children',[]),path+(n.get('id',n.get('goalId',n['kind'])),))
def project(view):
    claims={}
    def descend(gid,role,distance,seen=()):
        assert gid not in seen
        claims.setdefault(gid,[]).append((-distance,role))
        for child in goals[gid].get('contains',[]):descend(child,role,distance+1,seen+(gid,))
    for n,path in walk(view['rootNodes']):
        if n['kind']=='goalEntry':claims.setdefault(n['goalId'],[]).append((1000000,n.get('projectionRole','target')))
        elif n['kind']=='canonicalSubtree':descend(n['goalId'],n.get('projectionRole','target'),0)
        else:assert n['kind']=='structure'
    result={}
    for gid,rs in claims.items():
        highest=max(a for a,b in rs); roles={b for a,b in rs if a==highest}
        result[gid]='target' if 'target' in roles else 'prerequisiteOnly'
    return result

step=x['separate188ScientificWholeGoalChange'];gid188=step['goalId']
assert step['before']==goals[gid188]
assert digest(step['before'])==step['beforeDigest'] and digest(step['after'])==step['afterDigest']
restored=copy.deepcopy(step['after']);restored['requires']=step['before']['requires'];assert restored==step['before']
after_goals=copy.deepcopy(goals);after_goals[gid188]=step['after']
for row in x['wholeElevenBeforeAndAfterGoals']:
    gid=row['goalId']; assert after_goals[gid]==row['before']
    assert digest(row['before'])==row['beforeDigest'] and digest(row['after'])==row['afterDigest']
    restored=copy.deepcopy(row['after'])
    for field in ['skillPilotAcquisitionExtensions','applicabilityOverrides']:
        if field in row['before'].get('extendedData',{}):restored['extendedData'][field]=copy.deepcopy(row['before']['extendedData'][field])
        else:restored['extendedData'].pop(field,None)
    assert restored==row['before'];after_goals[gid]=row['after']
    assert profiles[gid]==next(p['wholeProfile'] for p in x['wholeElevenUnchangedScientificProfiles'] if p['goalId']==gid)

after_views=copy.deepcopy(baseviews)
change=x['wholeBWPost20ViewLabelChange']; vid=change['before']['viewId']
assert baseviews[vid]==change['before'];after_views[vid]=change['after']
before_nodes=list(walk(change['before']['rootNodes']));after_nodes=list(walk(change['after']['rootNodes']))
assert len(before_nodes)==len(after_nodes)
label_changes=[]
for (a,pa),(b,pb) in zip(before_nodes,after_nodes):
    assert pa==pb
    aa={k:v for k,v in a.items() if k not in ['label','children']};bb={k:v for k,v in b.items() if k not in ['label','children']};assert aa==bb
    if a.get('label')!=b.get('label'):label_changes.append({'id':a['id'],'before':a['label'],'after':b['label']})
assert len(label_changes)==2
for entry in x['wholeTenCurrentAffectedViews']:assert baseviews[entry['wholeView']['viewId']]==entry['wholeView']
projections={vid:project(v) for vid,v in baseviews.items()}
for vid,v in after_views.items():assert project(v)==projections[vid]

def closure(gid,goalmap):
    seen=set();stack=[gid]
    while stack:
        k=stack.pop()
        if k in seen:continue
        seen.add(k);stack.extend(goalmap[k].get('requires',[]))
    return sorted(seen)
compiled={r['goalId']:r['compiledApplicability'] for r in x['actualCurrent43RoleAndCompilerContent']['wholeRelevantCompiledRows']}
matrix=[]
for row in x['actualCurrent43RoleAndCompilerContent']['rows']:
    gid=row['goalId'];vid=row['viewId'];v=baseviews[vid];assert row['scope']==v['scope']
    assert projections[vid].get(gid)=='target' and row['currentRawRole']=='target'
    old_closure=closure(gid,goals)
    assert set(old_closure)=={r['goalId'] for r in row['wholeClosureRoles']}
    for r in row['wholeClosureRoles']:
        assert projections[vid].get(r['goalId'],'absent')==r['role']
    after_closure=closure(gid,after_goals)
    gaps=[r for r in after_closure if r!=gid and not after_goals[r].get('contains') and after_goals[r].get('semanticKind')!='orientation' and projections[vid].get(r)!='target']
    assert not gaps,(vid,gid,gaps)
    safety=[{'goalId':r,'role':projections[vid].get(r,'absent')} for r in ['13d4f336-ab16-54a7-9479-c920b458f385','416dfd33-8b43-5c49-903c-9847b95e4208']]
    matrix.append({'goalId':gid,'viewId':vid,'scope':v['scope'],'unchangedAuthoredRole':'target','beforeTeacherClosure':old_closure,'afterConditionalTeacherClosure':after_closure,'separateOrdinaryTeacherRoleGapsAfter188Proposal':gaps,'actualSafetyRoles':safety})
assert len(matrix)==43
before_absent=x['actualCurrent43RoleAndCompilerContent']['uniqueNonTargetPredecessorRolePairs']
for r in before_absent:assert projections[r['viewId']].get(r['goalId'],'absent')==r['role']

exclude={'structure','root','module','lesson','vocabulary','grammar','practice','memorization','A1','A2','B1','B2','C1','C2'}
memory_checks=[]
for r in x['actualCurrent43RoleAndCompilerContent']['all67MemorySelections']:
    g=goals[r['goalId']];tags=g.get('tags',[]);filters=[t for t in tags if t.startswith('select:')]
    if not filters:filters=[t for t in tags if not t.startswith('srs-deck') and t not in exclude]
    assert filters==r['filterTags']
    deck=json.loads(Path(r['deckPin']['path']).read_text())
    cards=[c['id'] for c in deck['cards'] if not filters or set(filters)&set(c.get('tags',[]))]
    assert cards==r['cardIds'];memory_checks.append({'goalId':g['id'],'actualFilterTags':filters,'selectedCardIds':cards,'unchangedWholeGoal':after_goals[g['id']]==g})
assert len(memory_checks)==67
out={'role':'Own bounded CAS/whole-view-role/current-profile and actual-card-selection checks; no new compiler or native review',
 'inputPins':[pin(SELECTOR),pin(s['reviewInput']['path']),pin(x['baseCanonical']['path']),pin(x['baseWhole39Views']['path']),pin(x['currentWholeProfilesSource']['path']),pin(x['separateCleanOldRoleHandoff']['path'])],
 'whole650And39BeforeObjectsExact':True,'elevenWholeCASAndSeparate188CASExact':True,'conditional188OrderRequired':True,
 'all39WholeProjectionRoleMapsUnchanged':True,'onlyTwoBWLabelsChanged':label_changes,'wholeTenViewsMatchCurrentBase':True,
 'actual43ExistingTargetPairsAndTeacherRoles':matrix,'preservedOldSixAbsentOrdinaryAndOneSupportPairs':before_absent,
 'all67ActualMemoryFiltersAndSelections':memory_checks,'allCurrentP9AndElevenProfileBodiesMatchCurrentP439':True,
 'unchangedP439Count':439,'compilerObservedAfterProposal':False,'M7':False,'HumanApproval':False,'nativeOrBuildInvocations':0}
(OUT/'CHECK.own-bounded-whole-CAS-roles-memory.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'targets':len(matrix),'ordinaryRoleGapsAfterConditional188Change':0,'wholeViewRoleMapsUnchanged':39,'memorySelections':67,'labelChanges':label_changes},ensure_ascii=False,indent=2))
