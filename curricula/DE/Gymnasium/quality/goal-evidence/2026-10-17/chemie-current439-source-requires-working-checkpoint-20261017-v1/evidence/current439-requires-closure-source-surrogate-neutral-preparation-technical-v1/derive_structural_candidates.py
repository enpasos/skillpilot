from pathlib import Path
import json,collections,hashlib,datetime
B=Path('/mnt/e/skillpilot-chemie-L7-20261017');K=B/'current439-remediation14-guarded-root-integration-technical-v1/capsule';O=B/'current439-requires-closure-source-surrogate-neutral-preparation-technical-v1';D=B/'current439-main-portable-integration-plan-technical-v1/lower-layer-diagnosis-readonly-v1';CID='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
def load(p):return json.loads(Path(p).read_text())
def eligible(g):
 t=g.get('tags',[])
 return not g.get('contains') and g.get('nodeKind')!='memory' and 'memorization'not in t and not any(x.startswith('srs-deck:')for x in t)and not any(x in t for x in ['Practice','Assessment','Motivation','Orientation'])and not g.get('examData')
C=load(K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');gs={g['id']:g for g in C['goals']};raw=load(D/'RAW.actual-current-Chemistry-applicability-and-39-rendered-views.json');rby={r['goalId']:r for r in raw['report']['goals']};diag=load(D/'DIAGNOSIS.actual-427-unsupported-82-source-gaps-148-warnings.exact-IDs.json');national=set().union(*[set(v['goalIds'])for v in raw['perView']if Path(v['path']).name.startswith('de-de')]);scope={id for id in national if eligible(gs[id])}
def direct(id,j):return [e for e in rby[id]['evidence']if e.get('dimension')=='jurisdiction'and e.get('value')==j and e['kind']in ['mapping','provenance']]
bybad=[(r['goalId'],r['jurisdiction'])for r in diag['unsupportedOccurrences']if r['jurisdiction']!='DE-BY'];byfull={id for id in scope if 'DE-BY'in rby[id]['compiledApplicability'].get('jurisdiction',[])and rby[id]['goalType']=='atomic'};bybad +=[(id,'DE-BY')for id in sorted(byfull)if not direct(id,'DE-BY')];assert len(bybad)==437
pairs=[]
for id,j in bybad:
 q=collections.deque([(id,[id])]);seen={id};term={};adj={};badrefs=[]
 while q:
  node,path=q.popleft();es=[e for e in rby[node]['evidence']if e.get('dimension')=='jurisdiction'and e.get('value')==j and e['kind']=='requires-closure'];adj[node]=[]
  for e in es:
   dep=e['source'].removeprefix('required by ')
   if dep not in gs or rby[dep]['goalType']!='atomic' or not eligible(gs[dep]):badrefs.append({'node':node,'dependent':dep,'reason':'not-current-eligible-atomic-dependent'});continue
   if node not in [s.split(':')[-1]for s in gs[dep].get('requires',[])]:badrefs.append({'node':node,'dependent':dep,'reason':'compiler-witness-is-not-literal-direct-requires-edge'});continue
   adj[node].append(dep)
   if dep in path:continue
   if direct(dep,j):
    term.setdefault(dep,path+[dep]);continue
   if dep not in seen:seen.add(dep);q.append((dep,path+[dep]))
 pair={'goalId':id,'jurisdiction':j,'activeClosureEvidence':[e for e in rby[id]['evidence']if e.get('dimension')=='jurisdiction'and e.get('value')==j and e['kind']=='requires-closure'],'activeEligibleDirectDependents':adj.get(id,[]),'reachableSourceBackedAtomicEndpoints':term,'activeAdjacency':adj,'rejectedWitnesses':badrefs,'structuralClassification':'source-backed-atomic-dependent-path'if term else 'active-closure-without-eligible-source-backed-endpoint'if any(e['kind']=='requires-closure'for e in rby[id]['evidence']if e.get('dimension')=='jurisdiction'and e.get('value')==j)else 'no-active-requires-closure-witness'}
 pairs.append(pair)
p=O/'TECHNICAL.actual437-pairs-active-literal-requires-chains.no-acceptance.json';p.write_text(json.dumps({'role':'Structural possibilities only; DAG necessity and source scope require independent scientific review','pairs':pairs},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'total':len(pairs),'unique':len({x['goalId']for x in pairs}),'classes':dict(collections.Counter(x['structuralClassification']for x in pairs)),'endpointPaths':sum(len(x['reachableSourceBackedAtomicEndpoints'])for x in pairs),'allNodes':len({n for p in pairs for path in p['reachableSourceBackedAtomicEndpoints'].values()for n in path}),'hasActiveClosure':sum(bool(x['activeClosureEvidence'])for x in pairs),'rejectedKinds':dict(collections.Counter(z['reason']for x in pairs for z in x['rejectedWitnesses']))}))
