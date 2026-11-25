"""Audit from Git objects, using only the role dialect of the unchanged role_atoms function."""
from collections import deque
from functools import cache
from hashlib import sha256
from pathlib import Path
from subprocess import check_output
import os, sys, json

def git(*args):
    return check_output(['git', *args])
root = Path(git('rev-parse','--show-toplevel').decode().strip())
os.chdir(root)
sys.path.insert(0,str(root/'scripts'))
import generate_hessen_physics_stage_views as h
old,new='948f2a419d','a88f17523b'
assert not git('diff', old, new, '--', 'curricula/DE/Gymnasium/canonical')
def obj(rev,p):
    return git('show',f'{rev}:{p}')
def child(node):
    return node.get('children',[])
def locate(v,i):
    return next(n for n in h.walk(v['rootNodes']) if n.get('id')==i)
def roles(node):
    return h.role_atoms({'rootNodes':[node]})
@cache
def closure(i):
    q=deque([k.split(':')[-1] for k in h.GOALS[i].get('requires',[])])
    result=set()
    while q:
        j=q.popleft()
        if j in result:continue
        result.add(j)
        q.extend(k.split(':')[-1] for k in h.GOALS[j].get('requires',[]))
    return result
def reportset(values):
    return {'count':len(values),'sha256':sha256(('\n'.join(sorted(values))+'\n').encode()).hexdigest()}
def finite_set(view):
    r=h.role_atoms(view)
    seeds=r['target']|r['prerequisiteOnly']
    return {**r,'learning':seeds.union(*(closure(g) for g in seeds))}
def graph_closure(pairs):
    result=set(pairs)
    while True:
        before=len(result); result|={(a,d) for a,b in result for c,d in result if b==c}
        if len(result)==before: return result
def slim(pairs):
    return sorted([list(x) for x in pairs])
def local(node,w):
    return roles(node)['target'] & w['target']
def comp(p):
    return p.name if isinstance(p,Path) else p
directory='curricula/DE/Gymnasium/composition-views/physik'
paths=[p for p in git('ls-tree','-r','--name-only',new,directory).decode().splitlines() if p.endswith('.view.json')]
assert paths==[p for p in git('ls-tree','-r','--name-only',old,directory).decode().splitlines() if p.endswith('.view.json')]
record={'base':old,'head':new,'curriculaTree':{r:git('rev-parse',r+':curricula').decode().strip() for r in ['ae04d42ef9',old]},'views':{},'unchangedViews':[]}
g=h.GOALS
for path in paths:
    prior,candidate=obj(old,path),obj(new,path)
    if prior==candidate: record['unchangedViews'].append(Path(path).name);continue
    v,w=json.loads(prior),json.loads(candidate)
    rv,rw=finite_set(v),finite_set(w)
    e2,e5=(locate(w,x) for x in [h.E2_TOPIC,h.E5_TOPIC])
    p2,p5=(locate(v,x) for x in [h.E2_TOPIC,h.E5_TOPIC])
    children=[k for k in child(e2) if k.get('id','').startswith('physics-e2-')]
    units=[k['id'] for k in children]
    inside=[local(k,rw) for k in children]
    unit={i:units.index(k['id'])+1 for k,z in zip(children,inside) for i in z}
    # E3 is also checked on scope-specific explicit earlier acquisition places.
    acquisitionOwners={n["goalId"]:ix for ix,k in enumerate(children,1) for n in h.walk(k["children"]) if n.get("acquisitionPlacement")}
    allOwners=unit|acquisitionOwners
    reqWithAcquisitions={(allOwners[r],u) for a,u in allOwners.items() for r in closure(a) if r in allOwners and allOwners[r]!=u}
    directWithAcquisitions={(allOwners[r],u) for a,u in allOwners.items() for r in g[a].get("requires",[]) if r in allOwners and allOwners[r]!=u}
    declared={(units.index(p['after'])+1,units.index(p['unit'])+1) for p in e2['childOrder']['after']}
    req={(unit[r],u) for a,u in unit.items() for r in closure(a) if r in unit and unit[r]!=u}
    direct={(unit[r],u):[r[:8],a[:8]] for a,u in unit.items() for r in g[a].get('requires',[]) if r in unit and unit[r]!=u}
    minimum={edge for edge in req if edge not in graph_closure(req-{edge})}
    under5=local(e5,rw)-local(p5,rv); left2=local(p2,rv)-local(e2,rw)
    exams={i for i in local(e5,rw)|local(p5,rv) if g[i].get('examData')}
    note={'equalSets':{k:rv[k]==rw[k] for k in rv},'sets':{k:reportset(s) for k,s in rw.items()},'childMembers':[len(x) for x in inside],
        'declaredAfter':slim(declared),'allCrossUnitDirect':slim(direct),'allCrossUnitRequirements':slim(req),
        'allCrossUnitRequirementsIncludingAcquisitions':slim(reqWithAcquisitions),'allDirectIncludingAcquisitions':slim(directWithAcquisitions),'minimalAfter':slim(minimum),'declaredWitnesses':{f'{a}->{b}':direct.get((a,b)) for a,b in sorted(declared)},
        'backwardDepends':slim({(a,b) for a,b in req if a>b}),
        'e2Targets':[len(local(p2,rv)),len(local(e2,rw))], 'e5Targets':[len(local(p5,rv)),len(local(e5,rw))],
        'e2Removed':sorted(x[:8] for x in left2), 'e5Added':sorted(x[:8] for x in under5),'e2DependentsOnRemoved':{x[:8]:sorted(y[:8] for y in closure(x)&under5) for x in local(e2,rw) if closure(x)&under5},
        'examNotes':{x[:8]:{'title':g[x]['title'],'prerequisites':reportset(closure(x)),'containsMoved':sorted(z[:8] for z in (closure(x)&under5)), 'inBaseAndCandidate':x in local(e5,rw) and x in local(p5,rv)} for x in sorted(exams)},
        'e2Exams':{x[:8]:{'title':g[x]['title'],'centerOfMassRequired':any(z.startswith('d30fd37b') for z in closure(x)),'dependsOnGroups':sorted({unit[z] for z in closure(x)&unit.keys()})} for x in local(e2,rw) if g[x].get('examData')},
        'trafficRequiresFriction':any(r.startswith('5fd45dbc') for r in closure(next(x for x in unit if x.startswith('4a2bf015'))))}
    def placements(doc):
        bag={}
        def visit(nodes,place):
            for n in nodes:
                if n["kind"]=="structure":visit(n["children"],place+[n["id"]])
                elif n.get("acquisitionPlacement"):bag.setdefault(n["goalId"],[]).append(place)
        visit(doc["rootNodes"],[])
        return bag
    pa,pb=placements(v),placements(w)
    note["acquisitionChanges"]={k:{"title":g[k]["title"],"from":pa.get(k),"to":pb.get(k)} for k in pa.keys()|pb.keys() if pa.get(k)!=pb.get(k)}
    record['views'][Path(path).name]=note
p='app/scripts/config/math-foreign-acquisition-demand.json'
po,pn=[json.loads(obj(r,p)) for r in (old,new)]
pins='currentPhysicsSourcePins'
changes=sorted([k for k in pn[pins] if po[pins].get(k)!=pn[pins][k]])
record['mathematics']={'identicalExceptPins':{k:v for k,v in po.items() if k!=pins}=={k:v for k,v in pn.items() if k!=pins}, 'demandRows':sum(len(v) for v in pn['views'].values()),'mathViews':len(pn['views']),'witnessGoals':len({e['goalId'] for v in pn['views'].values() for e in v}), 'changedPins':changes,'allOldAndNewPinsMatchGitBytes':all(sha256(obj(rev,k)).hexdigest()==x for rev,pol in ((old,po),(new,pn)) for k,x in pol[pins].items())}
out=Path(__file__).parent/'measure.actual.json'
out.write_text(json.dumps(record,sort_keys=True,indent=2)+'\n')
print('Views', len(record['views']),len(record['unchangedViews']))
for f,note in record['views'].items(): print(f,[(k,s['count']) for k,s in note['sets'].items()],note['e2Targets'],note['e5Targets'],note['declaredAfter'],note['minimalAfter'])
print('First-view details',next(iter(record['views'].values())))
print(record['mathematics'])
