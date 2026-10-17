import copy
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path('/mnt/e/skillpilot-chemie-L7-20261017/eighteen-foundations-independent-a-v1')
INPUT = ROOT / 'tmp/chemie-m7-resumed-20261016/eight-Mol-eight-Memory-and-two-EDTA-foundations-author-v1/REVIEW-INPUT.clean-eighteen-existing-targets-whole-content-and-primary-boundaries.json'
D = json.loads(INPUT.read_text())
C = json.loads(Path(D['baseCanonical']['path']).read_text())
V = json.loads(Path(D['baseWhole39Views']['path']).read_text())
G = {g['id']: g for g in C['goals']}
digest = lambda v: 'sha256:' + hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def walk(nodes, path=()):
    for n in nodes:
        here = path + ((n.get('label') or n.get('displayLabel') or n.get('goalId') or n.get('id')),)
        yield n, here
        yield from walk(n.get('children', []), here)

def projection(view):
    # Diagnostic content projection only. Direct goalEntry dominates inherited
    # canonicalSubtree; a closer subtree dominates a broader subtree.
    claims = {}
    def visit(goal_id, role, specificity, chain=()):
        if goal_id in chain:
            raise ValueError('contains cycle')
        if goal_id not in G:
            raise ValueError('unknown goal ' + goal_id)
        claims.setdefault(goal_id, []).append((specificity, role))
        for child in G[goal_id].get('contains', []):
            visit(child, role, specificity-1, chain+(goal_id,))
    for n, _ in walk(view['rootNodes']):
        if n['kind'] == 'goalEntry':
            claims.setdefault(n['goalId'], []).append((1000000, n.get('projectionRole', 'target')))
        elif n['kind'] == 'canonicalSubtree':
            visit(n['goalId'], n.get('projectionRole', 'target'), 0)
    result = {}
    for gid, rows in claims.items():
        s = max(x[0] for x in rows)
        roles = {r for sp, r in rows if sp == s}
        result[gid] = 'target' if 'target' in roles else 'prerequisiteOnly'
    return result

rows = []
whole_trees = []
for entry in D['wholeBeforeAndAfterViews']:
    before, after = entry['before'], entry['after']
    actual = next(v for v in V if v['viewId'] == entry['viewId'])
    assert before == actual
    assert digest(before) == entry['beforeDigest']
    assert digest(after) == entry['afterDigest']
    # Existing root-level structures must remain exact; appended subtree is
    # examined in full and never substituted for the old complete view.
    assert after['rootNodes'][:len(before['rootNodes'])] == before['rootNodes']
    assert {k:v for k,v in after.items() if k != 'rootNodes'} == {k:v for k,v in before.items() if k != 'rootNodes'}
    assert len(after['rootNodes']) == len(before['rootNodes'])+1
    new = after['rootNodes'][-1]
    refs = [n for n,p in walk([new]) if n['kind'] in ('goalEntry', 'canonicalSubtree')]
    assert all(n['kind']=='goalEntry' and n.get('projectionRole')=='target' for n in refs)
    bp, ap = projection(before), projection(after)
    assert all(ap[k] == v for k,v in bp.items())
    added = sorted(set(ap)-set(bp))
    assert set(added) == set(entry['addedExistingOrdinaryTargetGoalIds']+entry['addedExistingMemoryTargetGoalIds'])
    dependency = '02634fdd-c8ba-591a-b240-77129b1bebb8' if entry['addedExistingMemoryTargetGoalIds'] else 'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f'
    new_ordinary = entry['addedExistingOrdinaryTargetGoalIds'][0]
    missing = [gid for gid in G[new_ordinary].get('requires',[]) if ap.get(gid) != 'target']
    raw_before = [n for n,p in walk(before['rootNodes']) if n['kind'] in ('goalEntry','canonicalSubtree')]
    raw_after = [n for n,p in walk(after['rootNodes']) if n['kind'] in ('goalEntry','canonicalSubtree')]
    rows.append({'viewId':entry['viewId'], 'scope':after['scope'], 'beforeDigest':digest(before), 'afterDigest':digest(after),
                 'allExistingRootNodesExact':True, 'allPriorProjectionRolesPreserved':True, 'oldReferenceCount':len(raw_before),
                 'newReferenceCount':len(raw_after), 'addedTargetIds':added, 'dependentGoalRole':ap.get(dependency),
                 'ordinaryFoundationDirectPrerequisites':[{ 'goalId':x,'title':G[x]['title'],'role':ap.get(x,'absent')} for x in G[new_ordinary].get('requires',[])],
                 'directOrdinaryAcquisitionRolesStillAbsent':missing,
                 'existingMemoryRoles':[{ 'goalId':gid,'title':G[gid]['title'],'role':role } for gid,role in bp.items() if G[gid].get('nodeKind')=='memory' or 'memorization' in G[gid].get('tags',[])],
                 'existingSupportRoleIds':[gid for gid,r in bp.items() if r=='prerequisiteOnly'], 'newRootSubtree':new})
    lines = [entry['viewId']+' '+json.dumps(after['scope'],ensure_ascii=False)]
    for n,path in walk(after['rootNodes']):
        if n['kind']=='structure':
            lines.append('  '*(len(path)-1)+n['label']+' ['+n['id']+']')
        else:
            # Every reference is included, with short display IDs resolved in
            # the complete immutable JSON and full mapping below.
            lines.append('  '*(len(path)-1)+n['kind']+':'+n['goalId'][:8]+':'+n.get('projectionRole','target')+(' label='+n['displayLabel'] if 'displayLabel' in n else ''))
    whole_trees.append('\n'.join(lines))

metadata=[]
for x in D['separateWholeBeforeAndAfterGoalScopeAnnotations']:
    assert x['before']==G[x['goalId']]
    assert digest(x['before'])==x['beforeDigest'] and digest(x['after'])==x['afterDigest']
    altered=copy.deepcopy(x['after']); altered['extendedData'].pop('skillPilotAcquisitionExtensions')
    assert altered==x['before']
    metadata.append({'goalId':x['goalId'],'onlyAddedField':'extendedData.skillPilotAcquisitionExtensions','applicabilityUnchanged':True,'scientificGoalUnchanged':True,'extension':x['after']['extendedData']['skillPilotAcquisitionExtensions']})

deck_pins=[]
for x in D['allSevenExistingDeckPins']:
    p=Path(x['path']);p=p if p.is_absolute() else ROOT/p
    b=p.read_bytes(); assert hashlib.sha256(b).hexdigest()==x['sha256']
    deck_pins.append({'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
selection_rows=[]
for x in D['all67ExistingMemorySelections']:
    p=Path(x['deckPath']); p=p if p.is_absolute() else ROOT/p
    deck=json.loads(p.read_text())
    selected=[c for c in deck['cards'] if set(c.get('tags',[])) & set(x['filterTags'])]
    assert [c['id'] for c in selected]==x['cardIds']
    selection_rows.append({'goalId':x['goalId'],'filterTags':x['filterTags'],'cardIds':x['cardIds'],'actualDeckSelectionMatches':True})

pins=[]
for p in sorted(OUT.glob('*.layout.txt')):
    b=p.read_bytes();pins.append({'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
result={'nature':'bounded diagnostic supporting an independent content review; no compiler/native/M7 approval',
        'baseGoals':len(G),'baseViews':len(V),'rows':rows,'metadata':metadata,'actualDeckPins':deck_pins,
        'all67MemorySelections':selection_rows,'sourceExtractionPins':pins,
        'noNewGoalsOrCards':True,'noPriorRolesRemovedOrChanged':True}
(OUT/'EXAMINATION.independent-a.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(OUT/'WHOLE-TREES.compact-reference-enumeration.txt').write_text('\n\n'.join(whole_trees)+'\n')
(OUT/'GOAL-REFERENCE-DICTIONARY.json').write_text(json.dumps({gid[:8]:{'id':gid,'title':g['title']} for gid,g in G.items()},ensure_ascii=False,indent=2)+'\n')
assert len({gid[:8] for gid in G})==len(G)
print(json.dumps({'baseGoals':len(G),'baseViews':len(V),'views':[{k:v for k,v in x.items() if k not in ('existingMemoryRoles','newRootSubtree','existingSupportRoleIds')} for x in rows], 'all67ActualSelectionsMatch':True},ensure_ascii=False,indent=2))
