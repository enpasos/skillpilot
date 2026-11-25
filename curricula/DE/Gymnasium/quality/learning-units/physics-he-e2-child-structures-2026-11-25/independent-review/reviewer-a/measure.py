import sys, json, subprocess, hashlib
from pathlib import Path
ROOT=Path('/home/enpasos/projects/skillpilot')
sys.path.insert(0,str(ROOT/'scripts'))
import generate_hessen_physics_stage_views as g
B='948f2a419d'; H='a88f17523b'; D='curricula/DE/Gymnasium/composition-views/physik/'
def raw(c,p): return subprocess.check_output(['git','show',f'{c}:{p}'],cwd=ROOT)
def doc(c,p): return json.loads(raw(c,p))
def closure(ids):
    result=set(ids); q=list(ids)
    while q:
        for r in g.GOALS[q.pop()].get('requires',[]):
            if r not in result: result.add(r); q.append(r)
    return result
def find(v,id): return next(n for n in g.walk(v['rootNodes']) if n.get('id')==id)
def paths(v):
    result={}
    selected=g.role_atoms(v)['target']
    def visit(n,path):
        path=path+[n.get('id',n.get('goalId'))]
        if n.get('goalId') and n.get('projectionRole','target')=='target':
            def expand(id,path):
                if id in selected and not g.GOALS[id].get('contains'): result[id]=path
                if n['kind']=='canonicalSubtree':
                    for c in g.GOALS[id].get('contains',[]): expand(c,path+[c])
            expand(n['goalId'],path)
        for c in n.get('children',[]): visit(c,path)
    for n in v['rootNodes']: visit(n,[])
    return result
files=subprocess.check_output(['git','ls-tree','-r','--name-only',H,D],cwd=ROOT,text=True).splitlines()
out={'base':B,'head':H,'totalViews':len(files),'views':[]}
for p in files:
    if raw(B,p)==raw(H,p): continue
    old,new=doc(B,p),doc(H,p); a,b=g.role_atoms(old),g.role_atoms(new)
    L0,L1=closure(a['target']|a['prerequisiteOnly']),closure(b['target']|b['prerequisiteOnly'])
    e2=find(new,g.E2_TOPIC); e5=find(new,g.E5_TOPIC)
    groups=[n for n in e2['children'] if n['kind']=='structure']
    owner={x:n['id'] for n in groups for x in g.role_atoms({'rootNodes':[n]})['target']}
    demands={}; reverse=[]
    for x,u in owner.items():
        for r in g.GOALS[x].get('requires',[]):
            if r in owner and owner[r]!=u: demands.setdefault((u,owner[r]),[]).append([x,r])
        for r in closure({x})-{x}:
            if r in owner and owner[r]!=u and [n['id'] for n in groups].index(u)<[n['id'] for n in groups].index(owner[r]): reverse.append([x,r])
    direct={u:set(v for a,v in demands if a==u) for u in set(owner.values())}
    def ancestors(u,edges):
        seen=set();q=list(edges[u])
        while q:
            v=q.pop()
            if v not in seen: seen.add(v);q.extend(edges[v])
        return seen
    reduced=sorted([u,v] for u in direct for v in direct[u] if not any(v in ancestors(w,direct) for w in direct[u]-{v}))
    declared=sorted([x['unit'],x['after']] for x in e2['childOrder']['after'])
    e2ids=g.role_atoms({'rootNodes':[e2]})['target']; e5ids=g.role_atoms({'rootNodes':[e5]})['target']
    e2to5=[[x,r] for x in e2ids for r in closure({x})-{x} if r in e5ids]
    p0,p1=paths(old),paths(new)
    changes={id:{'old':p0.get(id),'new':p1.get(id)} for id in p0.keys()|p1.keys() if p0.get(id)!=p1.get(id)}
    out['views'].append({'file':p,'viewId':new['viewId'],'sha256':hashlib.sha256(raw(H,p)).hexdigest(),
       'roles':{k:{'before':len(a[k]),'after':len(b[k]),'removed':sorted(a[k]-b[k]),'added':sorted(b[k]-a[k])} for k in a},
       'learningSet':{'before':len(L0),'after':len(L1),'removed':sorted(L0-L1),'added':sorted(L1-L0)},
       'children':{u:len([x for x in owner if owner[x]==u]) for u in direct},'declared':declared,'reducedDirectDemand':reduced,
       'directDemandWitnesses':[{ 'unit':u,'after':v,'witnesses':w} for (u,v),w in sorted(demands.items())],
       'reverseTransitiveWitnesses':reverse,'e2ToE5TransitiveWitnesses':e2to5,
       'targetPathChanges':changes,'e5ExamClosures':{id:{'count':len(closure({id})),'sameCatalog':True} for id in e5ids if g.GOALS[id].get('examData')}})
out['changed']=len(out['views']);out['byteIdentical']=len(files)-len(out['views'])
config='app/scripts/config/math-foreign-acquisition-demand.json'
c0,c1=doc(B,config),doc(H,config)
pins0=c0.pop('currentPhysicsSourcePins');pins1=c1.pop('currentPhysicsSourcePins')
out['math']={'remainingObjectEqual':c0==c1,'demandRows':sum(len(v) for v in c1['views'].values()),
  'changedPins':[p for p in pins1 if pins0.get(p)!=pins1[p]],
  'currentPinsMatch':all(hashlib.sha256(raw(H,p)).hexdigest()==h for p,h in pins1.items())}
out['recordBaseCurriculaTreeEqual']=subprocess.check_output(['git','rev-parse','ae04d42ef9:curricula'],cwd=ROOT)==subprocess.check_output(['git','rev-parse',B+':curricula'],cwd=ROOT)
out['canonicalCatalogUnchanged']=not subprocess.check_output(['git','diff','--name-only',B,H,'--','curricula/DE/Gymnasium/canonical'],cwd=ROOT)
output=Path(__file__).with_name('measurement.actual.json');output.write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k!='views'},indent=2))
for v in out['views']: print(v['file'].split('/')[-1], {k:x['after'] for k,x in v['roles'].items()},v['learningSet']['after'],v['children'],'rolesEqual',all(not x['removed'] and not x['added'] for x in v['roles'].values()),'demandEqual',v['declared']==v['reducedDirectDemand'],'reverse',len(v['reverseTransitiveWitnesses']),'E2toE5',len(v['e2ToE5TransitiveWitnesses']),'pathChanges',len(v['targetPathChanges']))
