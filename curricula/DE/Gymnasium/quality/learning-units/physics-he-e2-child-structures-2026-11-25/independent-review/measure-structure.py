"""From the reviewed checkout: python3 -B /path/to/measure-structure.py > structure.actual.json"""
from functools import cache
import copy
import hashlib
import importlib
import json
from pathlib import Path
import subprocess
import sys

BASE = '948f2a419d18c08c7edd6b5d7f9a5367fe81bcf6'
HEAD = 'a88f17523bbafd63a5b3d98b48cc3c8e8b6ed24d'
VIEWS = 'curricula/DE/Gymnasium/composition-views/physik'
CONFIG = 'app/scripts/config/math-foreign-acquisition-demand.json'
RECORD = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/regrouping.actual.json'
E2 = 'physics-e2-newton-and-conservation'
E5 = 'he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089'
def git(*args):
    return subprocess.check_output(['git', *args])
def as_text(*args):
    return git(*args).decode().strip()
def data(commit, path):
    return json.loads(git('show', f'{commit}:{path}'))
def digest(raw):
    return hashlib.sha256(raw).hexdigest()
def set_hash(values):
    return digest(('\n'.join(sorted(values)) + '\n').encode())
def git_tree(commit, path):
    return as_text('rev-parse', f'{commit}:{path}')
def walk(nodes):
    for node in nodes:
        yield node
        yield from walk(node.get('children', []))
def node(view, node_id):
    return next(n for n in walk(view['rootNodes']) if n.get('id') == node_id)
assert as_text('rev-parse','HEAD') == HEAD and git_tree(BASE,'curricula/DE/Gymnasium/canonical') == git_tree(HEAD,'curricula/DE/Gymnasium/canonical')
sys.path.insert(0,str(Path('scripts').resolve()))
m = importlib.import_module('generate_hessen_physics_stage_views')
goals = m.GOALS
@cache
def requires(goal):
    deps = goals[goal].get('requires',[])
    return frozenset(deps).union(*(requires(d) for d in deps))
def roles(view):
    r = m.role_atoms(view)
    atoms = r['target'] | r['prerequisiteOnly']
    return dict(r, learning=atoms.union(*(requires(g) for g in atoms)))
def local_targets(node, globally):
    return m.role_atoms({'rootNodes':[node]})['target'] & globally
def item(goal):
    return dict(id=goal, title=goals[goal]['title'])
def acquisition(view):
    places = {}
    def visit(nodes, ancestors):
        for n in nodes:
            if n.get('acquisitionPlacement'):
                places.setdefault(n['goalId'],[]).append(ancestors)
            if 'children' in n:
                visit(n['children'],ancestors + [n['id']])
    visit(view['rootNodes'],[])
    return places
def profile(source):
    return dict(count=len(source), sha256=set_hash(source))
def treefiles(commit):
    return {path.split('\t')[1]:path.split()[2] for path in as_text('ls-tree','-r',commit,VIEWS).splitlines()}
trees = [treefiles(c) for c in [BASE,HEAD]]
assert trees[0].keys()==trees[1].keys()
changed = [p for p in trees[0] if trees[0][p] != trees[1][p]]
record = data(HEAD,RECORD)
record_views = {v['file']:v for v in record['views']['files']}
measure = []
texts = {}
for path in changed:
    before, after = [data(c,path) for c in [BASE,HEAD]]
    role_pair = [roles(v) for v in [before,after]]
    global_targets = role_pair[1]['target']
    e2, e5 = node(after,E2),node(after,E5)
    old2,old5 = node(before,E2),node(before,E5)
    local = [local_targets(n,global_targets) for n in [old2,e2,old5,e5]]
    children = [c for c in e2['children'] if c.get('id','').startswith('physics-e2-')]
    ids = [c['id'] for c in children]
    owners = {g:c['id'] for c in children for g in local_targets(c,global_targets)}
    group = {c['id']:sorted(local_targets(c,global_targets)) for c in children}
    direct,cross,backward = {},set(),[]
    for g,owner in owners.items():
        for d in goals[g].get('requires',[]):
            if d in owners and owners[d] != owner:
                direct.setdefault((owner,owners[d]),[]).append([g,d])
        for d in requires(g) & owners.keys():
            earlier=owners[d]
            if earlier==owner:continue
            cross.add((owner,earlier))
            if ids.index(earlier)>ids.index(owner):backward.append([g,d])
    # Demand between aggregates can be composed through different goals of one child.
    closure = set(cross)
    while True:
        more = {(a,d) for a,b in closure for c,d in closure if b==c} - closure
        if not more:break
        closure.update(more)
    reduced = {(a,b) for a,b in closure if not any((a,k) in closure and (k,b) in closure for k in ids)}
    pairs = {(d['unit'],d['after']) for d in e2['childOrder']['after']}
    moved = local[0]-local[1]
    exam_ids = sorted(g for g in local[3] if goals[g].get('examData'))
    named_lk = next(g for g in goals if g.startswith('8a1d4093'))
    if named_lk not in exam_ids:exam_ids.append(named_lk)
    exam_before_after = {}
    for g in exam_ids:
        # The canonical trees are identical, compare scoped reachable IDs separately.
        reachable = set(requires(g)) | {g}
        exam_before_after[g] = {k:{'before':profile(reachable & role_pair[0][k]),'after':profile(reachable & role_pair[1][k])} for k in role_pair[0]}
    acquisitions = [acquisition(v) for v in [before,after]]
    changing_acquisitions = [dict(item(g),subject=m.GOAL_OWNERS[g],before=acquisitions[0].get(g,[]),after=acquisitions[1].get(g,[]))
                             for g in sorted(acquisitions[0].keys() | acquisitions[1].keys())
                             if acquisitions[0].get(g)!=acquisitions[1].get(g)]
    topics = [n for n in node(after,'physics-e-phase')['children'] if n.get('id')]
    for movement in changing_acquisitions:
        movement['demandingTopicsInEPhase'] = {n['id']:hits for n in topics if
            (hits:=sorted(g for g in local_targets(n,global_targets) if movement['id'] in requires(g)))}
    acquired_owners = dict(owners)
    for child in children:
        for n in walk(child['children']):
            if n.get('acquisitionPlacement'):
                acquired_owners[n['goalId']] = child['id']
    full_direct = {(u,acquired_owners[d]) for g,u in acquired_owners.items() for d in goals[g].get('requires',[])
                   if d in acquired_owners and u != acquired_owners[d]}
    full_reach = {(u,acquired_owners[d]) for g,u in acquired_owners.items() for d in requires(g)
                  if d in acquired_owners and u != acquired_owners[d]}
    while True:
        added = {(u,v) for u,w in full_reach for z,v in full_reach if w==z} - full_reach
        if not added:break
        full_reach.update(added)
    full_reduced = {(u,v) for u,v in full_reach if not any((u,w) in full_reach and (w,v) in full_reach for w in ids)}
    full_demand = dict(directPairs=sorted(full_direct),reachability=sorted(full_reach),
                       reduced=sorted(full_reduced),missing=sorted(full_reduced-pairs),redundant=sorted(pairs-full_reduced),
                       backflows=sorted((u,v) for u,v in full_reach if ids.index(u)<=ids.index(v)))
    row = record_views[Path(path).name]
    hashes = [digest(git('show',f'{c}:{path}')) for c in [BASE,HEAD]]
    row_crosscheck = {'beforeSha256':hashes[0], 'afterSha256':hashes[1], 'atomicTargets':len(global_targets),
                      'prerequisiteOnlyGoals':len(role_pair[1]['prerequisiteOnly']), 'learningSet':len(role_pair[1]['learning']),
                      'goalsInChildStructures':len(owners), 'goalsMovedToE5':len(moved)}
    # Replace only the two complete sections; any other placement, order or metadata delta remains detectable.
    otherwise = copy.deepcopy(after)
    for sec in [E2,E5]:
        branch=node(otherwise,sec)
        branch.clear()
        branch.update(node(before,sec))
    recorded_pairs = record['childOrder']['pairs']
    record_witnesses = [p['unit'] + ' | ' + p['after'] for p in recorded_pairs
                        if [p['witness']['dependentGoalId'],p['witness']['requiredGoalId']]
                        not in direct.get((p['unit'],p['after']),[])]
    entry = dict(file=path,includingAcquisitionPlacement=full_demand,acquisitionPlacementMoves=changing_acquisitions,unchangedOutsideE2E5=otherwise==before,recordOrderWitnessMismatches=record_witnesses,kernel=sorted(reduced), roles={k:{'before':profile(role_pair[0][k]),'after':profile(role_pair[1][k]),
                                     'added':sorted(role_pair[1][k]-role_pair[0][k]),'removed':sorted(role_pair[0][k]-role_pair[1][k])} for k in role_pair[0]},
                 childMembers=group, directWitnesses={' | '.join(k):sorted(v) for k,v in sorted(direct.items())},
                 rawDemandPairs=sorted(cross),declaredPairs=sorted(pairs),missing=sorted(reduced-pairs),redundant=sorted(pairs-reduced),
                 reverseChains=backward,movedToE5=sorted(moved),e5DeltaMatches=(local[3]-local[2]==moved),
                 e2DependsOnMoved=sorted((g,d) for g in local[1] for d in requires(g)&moved),
                 e5Exams=exam_before_after,
                 recordMismatches={k:[row.get(k),v] for k,v in row_crosscheck.items() if row.get(k)!=v},
                 trailingE2Exams=[c['goalId'] for c in e2['children'] if c.get('goalId') in local[1] and goals[c['goalId']].get('examData')])
    measure.append(entry)
    for g in owners.keys()|moved|set(exam_ids)|set(entry['trailingE2Exams']):
        texts[g] = dict(item(g), description=goals[g]['description'],requires=[item(d) for d in goals[g].get('requires',[])])
configs = [data(c,CONFIG) for c in [BASE,HEAD]]
pins = [c.pop('currentPhysicsSourcePins') for c in configs]
pin_delta = {p:{'before':pins[0][p],'after':pins[1][p]} for p in pins[0] if pins[0][p]!=pins[1][p]}
output = dict(base=BASE,head=HEAD,recordBase=record['baseCommit'],
              curriculaTrees={c:git_tree(c,'curricula') for c in [record['baseCommit'],BASE]},
              viewCount=len(trees[0]),unchangedViews=len(trees[0])-len(changed), changed=measure,
              catalogTree=git_tree(HEAD,'curricula/DE/Gymnasium/canonical'),
              math=dict(totalPins=len(pins[0]),unchangedRowCount=sum(map(len,configs[1]['views'].values())),
                        changedPins=pin_delta,policyExceptPinsEqual=configs[0]==configs[1],allPinsMatchEachSnapshot=all(
                            digest(git('show',f'{commit}:{p}'))==v for pin,commit in zip(pins,[BASE,HEAD]) for p,v in pin.items())),
              goalTexts=texts)
print(json.dumps(output,ensure_ascii=False,sort_keys=True,indent=2))
