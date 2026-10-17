import datetime,hashlib,json,pathlib,sys
J=pathlib.Path(__file__).resolve().parent
K=J/'capsule'
E=J.parent
R=E/'current439-remediation14-author-assembly-technical-v1'
F=R/'capsule'
cleanpath=R/'SELECTOR.clean-remediation14-reviewer-inputs.sealed.json'
clean=json.loads(cleanpath.read_text())
rootrel=pathlib.Path(clean['nativeRoot']).relative_to(F)
configrel=pathlib.Path(clean['configPin']['path']).relative_to(F)
Q=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1')
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def own(p):
 assert p==K or K in p.parents
 if p==K:return
 own(p.parent)
 if p.is_symlink():
  src=p.resolve(strict=True);p.unlink();p.mkdir()
  for child in src.iterdir():(p/child.name).symlink_to(child,target_is_directory=child.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def put(p,b):
 own(p.parent)
 if p.exists():assert p.read_bytes()==b,p
 else:
  if p.is_symlink():p.unlink()
  with p.open('xb') as f:f.write(b)
 return pin(p)
guards={}
def collect(v):
 if isinstance(v,dict):
  if 'path' in v and 'sha256' in v:
   p=pathlib.Path(v['path'])
   if p.is_file():
    actual=pin(p);assert actual['sha256']==v['sha256'].removeprefix('sha256:'),p
    if 'bytes' in v:assert actual['bytes']==v['bytes'],p
    guards[str(p)]=actual
  for z in v.values():collect(z)
 elif isinstance(v,list):
  for z in v:collect(z)
assert len(sys.argv)==3,'Usage: stage_actual_native14_root_owned.py A_SELECTOR A_SHA256'
specs=[('round-a',pathlib.Path(sys.argv[1]),sys.argv[2]),('round-b',E/'chemie-current439-remediation14-fresh-independent-b-v1/SELECTOR.remediation14-fresh-independent-b.sealed.json','548b8d09da854717254e0e0115246ccb24e1c1fbc02c8adde055597e382e74ed')]
collect(clean);guards[str(cleanpath)]=pin(cleanpath)
manifest=json.loads((F/rootrel/'batch-manifest.json').read_text());assert (K/rootrel/'batch-manifest.json').read_bytes()==(F/rootrel/'batch-manifest.json').read_bytes()
rounds=[];copies=[]
for directory,selector,expected in specs:
 assert pin(selector)['sha256']==expected
 data=json.loads(selector.read_text());guards[str(selector)]=pin(selector);collect(data)
 binding=manifest['artifacts']['rounds']['first' if directory=='round-a' else 'second'];batch=binding['batchId']
 candidates=[]
 def paths(v):
  if isinstance(v,dict):
   if 'path'in v and 'sha256'in v:candidates.append(v)
   for y in v.values():paths(y)
  elif isinstance(v,list):
   for y in v:paths(y)
 paths(data)
 records=next(v for v in candidates if pathlib.Path(v['path']).name==batch+'.records.jsonl')
 run=next(v for v in candidates if pathlib.Path(v['path']).name==batch+'.run.json')
 rr=[json.loads(l) for l in pathlib.Path(records['path']).read_text().splitlines() if l];assert len(rr)==14 and len({r['goalId'] for r in rr})==14 and {r['goalId'] for r in rr}==set(clean['goalIds'])
 assert all(r['decision']=='keep' and r['recordStatus']=='candidate' and r['reviewAuthority']=='ai_candidate' for r in rr)
 rm=json.loads(pathlib.Path(run['path']).read_text());assert rm['blindToOtherRuns'] is True
 for v in [records,run]:
  copies.append({'source':v,'destination':put(K/rootrel/directory/'results'/pathlib.Path(v['path']).name,pathlib.Path(v['path']).read_bytes())})
 for v in [pin(selector)]+[v for v in candidates if pathlib.Path(v['path']).name.startswith(('FIRST','CHECK.','PROVENANCE','generation','execution','P.group'))]:
  p=pathlib.Path(v['path']);dest=K/Q/'independent-review-original-bytes/native14'/directory/p.name
  copies.append({'source':v,'destination':put(dest,p.read_bytes())})
 rounds.append({'directory':directory,'selector':pin(selector),'records':records,'run':run,'nativeRecordCount':14,'Dkeep':14,'PRevisionGoalIds':[r['goalId'] for r in rr if r.get('evidenceProfileRecommendation')=='revise'],'runIdentity':{k:rm.get(k) for k in ['runId','provider','model','startedAt','completedAt','blindToOtherRuns']}})
own(K/rootrel/'resolutions');assert not list((K/rootrel/'resolutions').iterdir())
for p,v in guards.items():assert pin(p)==v,p
result={'role':'Root-owned exact staging of two actual fresh independent native14 outputs; science untouched; not synthesized','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'capsule':str(K),'configRelativePath':str(configrel),'nativeRootRelativePath':str(rootrel),'goalIds':clean['goalIds'],'goalCount':14,'rounds':rounds,'byteExactCopies':copies,'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'separateRealPFindingsRemainOpen':True,'scienceVotesGeneratedByStager':0,'humanApproval':False,'centralRegistered':False}
p=J/'RECEIPT.root-staged-actual-paired-native14-not-yet-synthesized.json';assert not p.exists();p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'receipt':pin(p),'copied':len(copies),'guards':len(guards),'Dkeep':14,'PFindingsOpen':True}))
