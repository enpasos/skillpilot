from pathlib import Path
import datetime,hashlib,json,os,shutil
O=Path(__file__).parent;E=O.parent;K=O/'capsule'
F=E/'current439-b008-terminal12-native-preparation-technical-c-v1/capsule'
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-b008-terminal12-native-preparation-technical-c-v1')
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-native12-paired-synthesis-technical-v1')
guards={};copies=[]
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def own(p):
 assert p==K or K in p.parents
 if p==K:return
 own(p.parent)
 if p.is_symlink():
  src=p.resolve(strict=True);p.unlink();p.mkdir()
  for c in src.iterdir():(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def put(p,b):
 own(p.parent)
 if p.is_symlink():p.unlink()
 if p.exists():
  assert p.read_bytes()==b,str(p)
  return pin(p)
 p.write_bytes(b);return pin(p)
def cp(src,dst):
 g=pin(src);guards[str(src)]=g;d=put(dst,src.read_bytes());assert d['sha256']==g['sha256'];copies.append({'source':g,'copy':d});return d
def tree(src,dst):
 for p in sorted(src.rglob('*')):
  if p.is_file():cp(p,dst/p.relative_to(src))
def collect(v):
 if isinstance(v,dict):
  if 'path' in v and 'sha256' in v:
   p=Path(v['path']);g=pin(p);assert g['sha256']==v['sha256'].removeprefix('sha256:'),str(p)
   if 'bytes'in v:assert g['bytes']==v['bytes'],str(p)
   guards[str(p)]=g
  for x in v.values():collect(x)
 elif isinstance(v,list):
  for x in v:collect(x)
if not K.exists():
 K.mkdir()
 for c in F.iterdir():(K/c.name).symlink_to(c,target_is_directory=c.is_dir())
own(K/REL.parent)
if (K/REL).is_symlink():(K/REL).unlink()
tree(F/REL,K/REL)
specs=[('round-a',E/'chemie-current439-twelve-fresh-independent-a-v1/SELECTOR.independent-a-native-D12.sealed.json','92264ec638b3fdda97cfa7e660db47ed88599fe368a94074433b7f1349d63bf1'),('round-b',E/'chemie-current439-twelve-fresh-independent-b-v1/SELECTOR.current12-independent-native-b.sealed.json','0572fbfcc3ce5b4f3f982ada21e81ff16fb62dc19afbfac3a5de5eede9d6192f')]
manifest=json.loads((K/REL/'native12/batch-manifest.json').read_text());ids=manifest['goalIds'];assert len(ids)==12
rounds=[]
for name,sp,sha in specs:
 assert pin(sp)['sha256']==sha
 d=json.loads(sp.read_text());collect(d);guards[str(sp)]=pin(sp)
 rec=d.get('descriptionRecords',d.get('records'));run=d['runManifest']
 rr=[json.loads(l) for l in Path(rec['path']).read_text().splitlines() if l.strip()]
 assert len(rr)==12 and {r['goalId'] for r in rr}==set(ids)
 assert all(r['decision']=='keep' and r['reviewAuthority']=='ai_candidate' and r['recordStatus']=='candidate' for r in rr)
 assert json.loads(Path(run['path']).read_text())['blindToOtherRuns'] is True
 tree(sp.parent,K/Q/'independent-original-bytes'/name)
 for r in [rec,run]:cp(Path(r['path']),K/REL/'native12'/name/'results'/Path(r['path']).name)
 rounds.append({'round':name,'selector':pin(sp),'records':rec,'run':run,'keep':12})
materials=E/'current439-twelve-whole-case-materials-clean-root-v1';tree(materials,K/Q/'whole-case-material-partners-original-bytes')
# Freeze the exact canonical, SEM, assets and all authored views used by the prepared package.
clean=json.loads((F/REL/'SELECTOR.clean-current12-with-context39-reviewer-inputs.sealed.json').read_text());collect(clean)
for key in ['currentCanonicalPin','currentSEM650PinForTechnicalSerializationOnly','sourceFullViewPin']:
 if key in clean:
  p=Path(clean[key]['path']);rel=p.relative_to(F)
  cp(p,K/rel)
for key in ['actualCurrentAssetPins','viewPins']:
 for v in clean.get(key,[]):
  v=v.get('pin',v);p=Path(v['path']);rel=p.relative_to(F)
  cp(p,K/rel)
for p in (K/REL).rglob('*'):
 if p.is_file():p.chmod(0o644)
own(K/REL/'native12/resolutions')
assert not list((K/REL/'native12/resolutions').iterdir())
for p,g in guards.items():assert pin(p)==g,p
out={'role':'Exact native A/B staging; technical synthesis only; no new scientific review','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'capsule':str(K),'configRelativePath':str(REL/'current12.batch.config.json'),'nativeRootRelativePath':str(REL/'native12'),'committableTechnicalRoot':str(Q),'goalIds':ids,'goalCount':12,'rounds':rounds,'byteExactCopies':copies,'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'B-P-01':'OPEN; ratio-direction P recommendation preserved; not resolved by D keep','scienceVotesGenerated':0,'humanApproval':False,'centralActivated':False}
(O/'STAGE.actual-native12-original-byte-copies.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'staged':12,'copies':len(copies),'guards':len(guards),'capsule':str(K)}))
