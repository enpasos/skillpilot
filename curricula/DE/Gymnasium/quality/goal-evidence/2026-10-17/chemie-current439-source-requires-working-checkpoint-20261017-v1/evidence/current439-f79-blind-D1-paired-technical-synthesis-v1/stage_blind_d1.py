from pathlib import Path
import datetime,hashlib,json,os
O=Path(__file__).parent;E=O.parent;K=O/'capsule'
F=E/'current439-f79-paired-P1-BY-default-memory-root-integration-v1/capsule'
G=E/'current439-f79-explicit-concentration-ratio-author-root-v1/capsule'
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-f79-explicit-concentration-ratio-author-root-v1')
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-f79-blind-D1-paired-technical-synthesis-v1')
guards={};copies=[];gid='f79f15c0-e848-5e17-9eb5-26753d35c93b'
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
 if p.exists():assert p.read_bytes()==b,str(p)
 else:p.write_bytes(b)
 return pin(p)
def cp(src,dst):
 g=pin(src);guards[str(src)]=g;d=put(dst,src.read_bytes());assert d['sha256']==g['sha256'];copies.append({'source':g,'copy':d});return d
def tree(src,dst):
 for p in sorted(src.rglob('*')):
  if p.is_file():cp(p,dst/p.relative_to(src))
def collect(v):
 if isinstance(v,dict):
  expected=v.get('sha256',v.get('expectedSha256'))
  if 'path' in v and expected:
   p=Path(v['path']);g=pin(p);assert g['sha256']==expected.removeprefix('sha256:'),str(p)
   if 'bytes'in v:assert g['bytes']==v['bytes'],str(p)
   guards[str(p)]=g
  for x in v.values():collect(x)
 elif isinstance(v,list):
  for x in v:collect(x)
assert not K.exists();K.mkdir()
for c in F.iterdir():(K/c.name).symlink_to(c,target_is_directory=c.is_dir())
own(K/REL.parent)
if (K/REL).is_symlink():(K/REL).unlink()
assert not (K/REL).exists();tree(G/REL,K/REL)
manifest=json.loads((K/REL/'native1-v2/batch-manifest.json').read_text());assert manifest['goalIds']==[gid]
specs=[('round-a',E/'current439-f79-ratio-fresh-blind-independent-a-v2/RECEIPT.independent-a.final.sealed.json','8efd3ba60807f02df0b8a4814701a38e259c20b61598be44329e6bb6e31a49e1'),('round-b',E/'current439-f79-ratio-fresh-blind-independent-b-v2/SELECTOR.independent-b.result.sealed.json','84577d2543647337701288d2684330ea4f8fa5a29660b6fdf45bfedda2d3f056')]
rounds=[]
for name,sp,sha in specs:
 assert pin(sp)['sha256']==sha;d=json.loads(sp.read_text());collect(d);guards[str(sp)]=pin(sp)
 batch=manifest['artifacts']['rounds']['first' if name=='round-a' else 'second']['batchId']
 if name=='round-a':
  rec=next(x for x in d['artifacts'] if Path(x['path']).name==batch+'.records.jsonl');run=next(x for x in d['artifacts'] if Path(x['path']).name==batch+'.run.json')
  assert d['blindToOtherRuns'] is True and d['otherReviewResultsOpened'] is False
 else:
  rec=d['nativeRecord'];run=d['nativeRun'];receipt=json.loads(Path(d['receipt']['path']).read_text());assert receipt['blindToOtherRuns'] is True;collect(receipt)
 rr=[json.loads(l) for l in Path(rec['path']).read_text().splitlines() if l.strip()]
 assert len(rr)==1 and rr[0]['goalId']==gid and rr[0]['decision']=='keep' and rr[0]['evidenceProfileRecommendation']=='none' and rr[0]['reviewAuthority']=='ai_candidate' and rr[0]['recordStatus']=='candidate'
 rm=json.loads(Path(run['path']).read_text());assert rm['blindToOtherRuns'] is True
 tree(sp.parent,K/Q/'fresh-blind-independent-original-bytes'/name)
 for r in [rec,run]:cp(Path(r['path']),K/REL/'native1-v2'/name/'results'/Path(r['path']).name)
 rounds.append({'round':name,'selector':pin(sp),'records':rec,'run':run,'keep':1,'profileRecommendation':'none','blindToOtherRuns':True})
base=json.loads((G/REL/'base.full439.author-input.config.json').read_text());cfg=json.loads((G/REL/'native1-v2.batch.config.json').read_text())
for key in ['landscapePath','compositionViewPath','semanticKindLedgerPath','goalVisualizationQaPath']:cp(G/base[key],K/base[key])
for key in ['promptPath','criteriaPath']:cp(G/cfg[key],K/cfg[key])
clean=json.loads((G/REL/'SELECTOR.clean-one-corrected-ratio-whole-material-and-current-D1.sealed.json').read_text());collect(clean)
for v in clean.get('actualOriginalVisualization',[]):
 p=Path(v['path']);cp(p,K/p.relative_to(G))
support=Path(clean['originalCurrent39ContextSupport']['path']);cp(support,K/Q/'whole-material-partners-original-bytes'/support.name)
# Preserve the same full finite material partners already available to the original native12 context.
materials=E/'current439-twelve-whole-case-materials-clean-root-v1';tree(materials,K/Q/'whole-material-partners-original-bytes/current12-original-partners')
receiptpath=E/'current439-f79-paired-P1-BY-default-memory-root-integration-v1/RECEIPT.paired-one-P-and-additive-BY-M41-integration.json';root=json.loads(receiptpath.read_text());collect(root);guards[str(receiptpath)]=pin(receiptpath)
checkpath=receiptpath.parent/'CHECK.actual-stock-P1-and-other32.no-full-central.json';check=json.loads(checkpath.read_text());assert check['exitCode']==0;guards[str(checkpath)]=pin(checkpath)
current=F/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-f79-paired-P1-BY-default-memory-root-integration-v1/materials/P1.current-f79.author-candidate.jsonl'
assert (G/REL/'P1.current-f79.author-candidate.jsonl').read_bytes()==current.read_bytes();guards[str(current)]=pin(current)
p1=json.loads(current.read_text());nativeinput=json.loads((K/REL/'native1-v2/round-a/description-review-input.json').read_text())
assert nativeinput==json.loads((K/REL/'native1-v2/round-b/description-review-input.json').read_text())
profile=nativeinput['goals'][0]['reviewContext']['evidenceProfile'];assert profile==p1,('P1 whole native baseline mismatch',profile.keys(),p1.keys())
own(K/REL/'native1-v2/resolutions');assert not list((K/REL/'native1-v2/resolutions').iterdir())
for p,g in guards.items():assert pin(p)==g,p
out={'role':'Exact fresh blind native D1 A/B staging; informed P runs are never selected as D evidence','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'capsule':str(K),'configRelativePath':str(REL/'native1-v2.batch.config.json'),'nativeRootRelativePath':str(REL/'native1-v2'),'committableTechnicalRoot':str(Q),'goalIds':[gid],'goalCount':1,'rounds':rounds,'byteExactCopies':copies,'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'nativeP1WholeRecordExactToCompositeP1':True,'nativeP1ReviewId':p1['reviewId'],'sourceCompositeReceipt':pin(receiptpath),'sourceCompositeStockCheck':pin(checkpath),'sourceCentral':root['prospectiveCentral'],'scienceVotesGenerated':0,'humanApproval':False,'centralActivated':False}
(O/'STAGE.actual-fresh-blind-native-D1-original-byte-copies.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'staged':1,'copies':len(copies),'guards':len(guards),'capsule':str(K)}))
