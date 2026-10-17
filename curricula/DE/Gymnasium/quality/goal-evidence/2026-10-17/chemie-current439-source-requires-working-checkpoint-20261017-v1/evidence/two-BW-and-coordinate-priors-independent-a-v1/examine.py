import copy
import hashlib
import json
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path('/mnt/e/skillpilot-chemie-L7-20261017/two-BW-and-coordinate-priors-independent-a-v1')
BASE=Path('/mnt/e/skillpilot-chemie-L7-20261017/two-BW-data-teachers-and-coordinate-model-priors-author-root-v1')
D=json.loads((BASE/'REVIEW-INPUT.clean-two-BW-data-targets-and-coordinate-prior-replacement.json').read_text())
F=json.loads(Path(D['foreignInput']['path']).read_text())
CAN=json.loads(Path(D['baseCanonical']['path']).read_text())
G={x['id']:x for x in CAN['goals']}
V={x['viewId']:x for x in json.loads(Path(D['baseWhole39Views']['path']).read_text())}
digest=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

for x in F['wholeBeforeAndAfterViews']:
    assert x['before']==V[x['viewId']]
    V[x['viewId']]=x['after']
for x in F['separateWholeBeforeAndAfterGoalScopeAnnotations']:
    assert x['before']==G[x['goalId']]
    G[x['goalId']]=x['after']
for x in D['wholeCurrentGoalsAndTeacherClosure']:
    assert x==G[x['id']]
for x in D['wholeGoalChanges']:
    assert x['before']==G[x['goalId']]
    assert digest(x['before'])==x['beforeDigest'] and digest(x['after'])==x['afterDigest']
for x in D['wholeViewChanges']:
    assert x['before']==V[x['viewId']]
    assert digest(x['before'])==x['beforeDigest'] and digest(x['after'])==x['afterDigest']
assert D['currentRPWholeViewAfterForeignProposal']==V['de-rp-gym-chemistry-lk']

AG=copy.deepcopy(G)
for x in D['wholeGoalChanges']:
    AG[x['goalId']]=x['after']
    c=copy.deepcopy(x['after'])
    if x['goalId'].startswith('363c'):
        c['requires']=x['before']['requires']
        c['extendedData']['skillPilotAcquisitionExtensions'][0]['routeBoundary']=x['before']['extendedData']['skillPilotAcquisitionExtensions'][0]['routeBoundary']
    else:
        c['extendedData'].pop('skillPilotAcquisitionExtensions')
    assert c==x['before']
AV=copy.deepcopy(V)
for x in D['wholeViewChanges']:
    AV[x['viewId']]=x['after']
    b,a=x['before'],copy.deepcopy(x['after'])
    a['rootNodes'][1]['children']=a['rootNodes'][1]['children'][2:]
    assert a==b

def walk(nodes):
    for n in nodes:
        yield n
        yield from walk(n.get('children',[]))

def projection(v,goals):
    claims={}
    def add(gid,role,distance,path=()):
        assert gid not in path
        claims.setdefault(gid,[]).append((-distance,role))
        for q in goals[gid].get('contains',[]):add(q,role,distance+1,path+(gid,))
    for n in walk(v['rootNodes']):
        if n['kind']=='goalEntry':claims.setdefault(n['goalId'],[]).append((1000000,n.get('projectionRole','target')))
        elif n['kind']=='canonicalSubtree':add(n['goalId'],n.get('projectionRole','target'),0)
    out={}
    for gid,rows in claims.items():
        top=max(x[0] for x in rows);rs={r for sp,r in rows if sp==top}
        out[gid]='target' if 'target' in rs else 'prerequisiteOnly'
    return out

COORD='363c5740-8a3c-50b8-8c3a-5548c80c36ea'
REDOX='04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162'
DOC='9fc800d1-92d1-5ef6-81c1-33960ae034dd'
INTERP='7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6'
role_rows=[]
for vid,v in V.items():
    bp,ap=projection(v,G),projection(AV[vid],AG)
    assert all(ap[k]==r for k,r in bp.items())
    additions=sorted(set(ap)-set(bp))
    assert additions==(sorted([DOC,INTERP]) if vid=='de-bw-gym-chemistry-lk' else [])
    if COORD in bp:
        role_rows.append({'viewId':vid,'coordinateRole':bp[COORD],'redoxRoleBefore':bp.get(REDOX,'absent'),
                         'oldPriorRoles':[{ 'goalId':gid,'role':bp.get(gid,'absent')} for gid in G[COORD]['requires']],
                         'newPriorRoles':[{ 'goalId':gid,'role':ap.get(gid,'absent')} for gid in AG[COORD]['requires']],
                         'everyPreviousProjectionRolePreserved':True})

def req_closure(gid,goals):
    out=set();todo=list(goals[gid].get('requires',[]))
    while todo:
        q=todo.pop()
        if q in out:continue
        out.add(q);todo.extend(goals[q].get('requires',[]))
    return out

closures=[]
for vid in ['de-bw-gym-chemistry-lk','de-rp-gym-chemistry-lk']:
    ap=projection(AV[vid],AG)
    for gid in [COORD,DOC,INTERP]:
        if ap.get(gid)=='target':
            closures.append({'viewId':vid,'goalId':gid,'transitiveRequiresWithoutTargetRole':[{'goalId':q,'title':AG[q]['title'],'role':ap.get(q,'absent')} for q in sorted(req_closure(gid,AG)) if ap.get(q)!='target']})

# Compare only scientific profile bodies from originals; do not consume native
# decisions, reasons, reviewers, dissent or run metadata.
profile_sources={}
raw_profile=Path(D['originalProfileBodySourcePins'][0]['path'])
for line in raw_profile.read_text().splitlines():
    if not line.strip():continue
    row=json.loads(line)
    if 'goalId' in row and 'profile' in row:profile_sources.setdefault(row['goalId'],[]).append(row['profile'])
for container in [F,json.loads(Path(D['originalProfileBodySourcePins'][1]['path']).read_text())]:
    def collect(v):
        if isinstance(v,dict):
            if 'goalId' in v and 'wholeProfile' in v:profile_sources.setdefault(v['goalId'],[]).append(v['wholeProfile'])
            for x in v.values():collect(x)
        elif isinstance(v,list):
            for x in v:collect(x)
    collect(container)
profile_checks=[]
for x in D['wholeUnchangedPositiveProfiles']:
    match=any(p==x['wholeProfile'] for p in profile_sources.get(x['goalId'],[]))
    profile_checks.append({'goalId':x['goalId'],'exactScientificBodyFoundInPinnedOriginal':match,'profileBodyDigest':digest(x['wholeProfile'])})
    assert match,x['goalId']

def dicts(v):
    if isinstance(v,dict):
        yield v
        for x in v.values():yield from dicts(x)
    elif isinstance(v,list):
        for x in v:yield from dicts(x)
raw_material=list(dicts(json.loads(Path(D['materialSource']['path']).read_text())))
material_checks=[]
for x in D['wholeExistingDocumentationAndInterpretationDEENMaterials']+D['wholeCurrentDataValidityDEENMaterials']:
    raw=next(y for y in raw_material if y.get('caseKey')==x['caseKey'])
    assert all(raw.get(k)==v for k,v in x.items())
    material_checks.append({'case':x['caseKey'],'everyCleanContentFieldEqualsOriginal':True,'excludedStatusOrMetadataKeysNotConsumed':sorted(set(raw)-set(x))})

own_arithmetic={'D2_slope_L_mg':(.490-.010)/(6-0),'D2_mean_absorbance':(.291+.289)/2,
                'D2_diluted_mg_L':(((.291+.289)/2)-.010)/((.490-.010)/6),
                'D2_original_factor2_mg_L':(((.291+.289)/2)-.010)/((.490-.010)/6)*2,
                'D2_corrected_original_factor4_mg_L':(((.291+.289)/2)-.010)/((.490-.010)/6)*4,
                'temperature_means_seconds':[(90+94)/2,(65+63)/2,(48+50)/2],
                'transfer50_mean_seconds':(80+45)/2,'transfer50_range_seconds':80-45,
                'conductivity_adjacent_increments_microS_cm':[1020-3,1990-1020,2950-1990]}
report={'nature':'bounded independent diagnostic; no native/compiler/M7 approval','conditionalPredecessor18NotActiveState':True,
        'baseGoalCount':len(G),'baseViewCount':len(V),'contextWholeGoalCount':len(D['wholeCurrentGoalsAndTeacherClosure']),
        'unchangedContextProfileCount':len(D['wholeUnchangedPositiveProfiles']), 'newScientificVotesOn32ContextProfiles':False,
        'allPreviousViewProjectionRolesPreserved':True,'newTargetReferences':[DOC,INTERP],'changedViewCount':1,
        'coordinateDirectBefore':G[COORD]['requires'],'coordinateDirectAfter':AG[COORD]['requires'],
        'allViewsWithExistingCoordinateReference':role_rows,'boundedTransitiveRoleChecks':closures,
        'profileBodyOriginalChecks':profile_checks,'originalMaterialCleanFieldChecks':material_checks,'ownSyntheticArithmetic':own_arithmetic}
(OUT/'EXAMINATION.independent-a.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['profileBodyOriginalChecks','originalMaterialCleanFieldChecks','allViewsWithExistingCoordinateReference']},ensure_ascii=False,indent=2))
print('COORD_VIEWS',json.dumps([{ 'viewId':x['viewId'],'coordinateRole':x['coordinateRole'],'newPriorRoles':x['newPriorRoles']} for x in role_rows],ensure_ascii=False))
