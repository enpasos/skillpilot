"""Technical staging draft. Default is read-only; Root may pass --apply-root."""
import argparse, datetime, hashlib, json
from pathlib import Path

O=Path(__file__).resolve().parent; J=O.parent; K=J/'capsule'; E=J.parent
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1')
def pin(p):
 p=Path(p); b=p.read_bytes(); return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def checked(p,h):
 v=pin(p); assert v['sha256']==h.removeprefix('sha256:'),(p,v['sha256']); return v
def read(p): return json.loads(Path(p).read_text())
def encoded(v): return (json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()
def put(p,b):
 # Refuse foreign symlink traversal and every different existing byte sequence.
 p=Path(p); assert p==O or O in p.parents or K in p.parents,p
 boundary=O if p==O or O in p.parents else K
 for a in reversed(p.parent.relative_to(boundary).parents):
  z=boundary/a; assert not z.is_symlink(),z
 assert not p.parent.is_symlink() and not p.is_symlink(),p
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists(): assert p.read_bytes()==b,('Existing different output',p)
 else:
  with p.open('xb') as f:f.write(b)
 return pin(p)
ap=argparse.ArgumentParser();ap.add_argument('--apply-root',action='store_true');args=ap.parse_args()
cleanpath=K/Q/'SELECTOR.clean-current4-v3-reviewer-inputs.sealed.json'
cleanpin=checked(cleanpath,'b24b4075cc12e77c6f4f404d35d5843448a3c83ff3dd6b8ad3b257824ce718b5'); clean=read(cleanpath)
assert Path(clean['capsule'])==K and Path(clean['nativeRoot'])==K/Q/'native4'
manifestpath=Path(clean['nativeRoot'])/'batch-manifest.json'; manifest=read(manifestpath)
guards={str(cleanpath):cleanpin,str(manifestpath):pin(manifestpath)}; copies=[]; rounds=[]
specs=[('round-a',E/'chemie-current439-material4-v3-fresh-independent-a-v1/SELECTOR.independent-current4-v3-native-a.sealed.json','faada5445a5151725c61bd7163001207e8cf725b7775248987a36fa822010964'),('round-b',E/'chemie-current439-material4-v2-fresh-independent-b-v1/SELECTOR.current4-V3-fresh-independent-b.sealed.json','70479aaddafd169fee0928a5a4b80a10a54cd142113524efcbc223c78712f9ae')]
def collect(v,found):
 if isinstance(v,dict):
  if 'path' in v and 'sha256' in v: found.append(v)
  for z in v.values(): collect(z,found)
 elif isinstance(v,list):
  for z in v: collect(z,found)
for directory,selector,expected in specs:
 guards[str(selector)]=checked(selector,expected); data=read(selector); candidates=[]; collect(data,candidates)
 binding=manifest['artifacts']['rounds']['first' if directory=='round-a' else 'second']; batch=binding['batchId']
 def unique(name):
  values={v['path']:v for v in candidates if Path(v['path']).name==name}; assert len(values)==1,(name,list(values)); return next(iter(values.values()))
 records=unique(batch+'.records.jsonl'); run=unique(batch+'.run.json')
 rr=[json.loads(line) for line in Path(records['path']).read_text().splitlines() if line]; rm=read(run['path'])
 assert [r['goalId'] for r in rr]==manifest['goalIds'] and len(rr)==4
 assert all(r['decision']=='keep' and r['evidenceProfileRecommendation']=='none' and r['recordStatus']=='candidate' and r['reviewAuthority']=='ai_candidate' for r in rr)
 assert rm['blindToOtherRuns'] is True and rm['independenceGroupId']==binding['independenceGroupId']
 assert rm['batchInputFingerprint']==binding['batchInputFingerprint'] and rm['outputDigest']=='sha256:'+pin(records['path'])['sha256']
 assert rm['goalIds']==manifest['goalIds']
 for v in [records,run]:
  guards[v['path']]=checked(v['path'],v['sha256']); dest=Path(clean['nativeRoot'])/directory/'results'/Path(v['path']).name
  copies.append({'source':guards[v['path']],'destination':str(dest)})
  if args.apply_root: put(dest,Path(v['path']).read_bytes())
 # Preserve original scientific seals and checks as bytes, without interpreting their rationales.
 for v in candidates:
  p=Path(v['path'])
  if p.name.startswith(('FIRST','CHECK.','PROVENANCE','NATIVE.','OBSERVATION')) and p.is_file():
   guards[str(p)]=checked(p,v['sha256']); dest=K/Q/'independent-review-original-bytes'/directory/p.name
   if args.apply_root: put(dest,p.read_bytes())
 if args.apply_root: put(K/Q/'independent-review-original-bytes'/directory/selector.name,selector.read_bytes())
 rounds.append({'directory':directory,'selector':guards[str(selector)],'records':records,'run':run,'nativeRecordCount':4,'Dkeep':4,'evidenceProfileRecommendationNone':4,'runIdentity':{k:rm[k] for k in ['runId','provider','model','startedAt','completedAt','blindToOtherRuns']}})
for v in clean['rounds'][0]['inputPins']+clean['rounds'][1]['inputPins']+clean['bundleArtifactPins']:
 guards[v['path']]=checked(v['path'],v['sha256'])
resdir=Path(clean['nativeRoot'])/'resolutions'; assert resdir.is_dir() and not resdir.is_symlink() and not list(resdir.iterdir())
assert not (Path(clean['nativeRoot'])/'resolution-index.json').exists()
for p,v in guards.items(): assert pin(p)==v,p
receipt={'role':'Technical exact paired native4 V3 staging; no scientific synthesis, activation or broad gates','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'appliedByRoot':args.apply_root,'capsule':str(K),'configRelativePath':str(Path(clean['configPin']['path']).relative_to(K)),'nativeRootRelativePath':str(Path(clean['nativeRoot']).relative_to(K)),'goalIds':manifest['goalIds'],'goalCount':4,'rounds':rounds,'plannedOrActualCopies':copies,'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'scienceVotesGeneratedByStager':0,'humanApproval':False,'centralRegistered':False}
target=O/('RECEIPT.root-staged-actual-paired-native4-v3.json' if args.apply_root else 'PLAN.root4-staging-preflight.json')
put(target,encoded(receipt)); print(json.dumps({'receipt':pin(target),'applyRoot':args.apply_root,'DkeepPerRound':4,'copies':len(copies),'sourceGuards':len(guards)}))
