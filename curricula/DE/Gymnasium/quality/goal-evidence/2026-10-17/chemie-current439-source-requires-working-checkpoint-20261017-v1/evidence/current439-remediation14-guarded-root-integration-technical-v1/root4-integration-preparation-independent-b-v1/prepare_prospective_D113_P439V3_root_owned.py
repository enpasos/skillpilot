"""Prepare reviewable drafts locally; --apply-root requires actual synthesized D4."""
import argparse, copy, datetime, hashlib, json
from pathlib import Path
O=Path(__file__).resolve().parent; J=O.parent; K=J/'capsule'; E=J.parent
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/current4-v3-root-successor')
N4=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1')
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p): return json.loads(Path(p).read_text())
def enc(v): return (json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()
def put(p,b):
 p=Path(p); boundary=O if O in p.parents else K
 assert boundary in p.parents,p
 for a in [p.parent,*p.parent.parents]:
  if a==boundary or boundary in a.parents: assert not a.is_symlink(),a
 assert not p.is_symlink(),p
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists(): assert p.read_bytes()==b,('Refusing different existing bytes',p)
 else:
  with p.open('xb') as f:f.write(b)
 return pin(p)
ap=argparse.ArgumentParser();ap.add_argument('--apply-root',action='store_true');args=ap.parse_args()
audit=read(O/'p-config-audit.json'); src=Path(audit['inputPins']['D112ProspectiveCentral']['path']);assert pin(src)==audit['inputPins']['D112ProspectiveCentral'];cfg=read(src);out=copy.deepcopy(cfg);subject=out['subjects'][0]
assert subject['subject']=='chemie' and len(subject['resolutionIndexPaths'])==112 and len(subject['resolutionSupersessions'])==356 and len(subject['positiveEvidenceConfigPaths'])==123
cleanpath=K/N4/'SELECTOR.clean-current4-v3-reviewer-inputs.sealed.json';clean=read(cleanpath);assert pin(cleanpath)==audit['inputPins']['native4CleanSelector'];gids=clean['goalIds'];assert len(gids)==4
indexrel=N4/'native4/resolution-index.json'; indexpath=K/indexrel
guards={str(src):pin(src),str(cleanpath):pin(cleanpath)};newIndex=None
if indexpath.exists():
 newIndex=read(indexpath); assert {r['goalId'] for r in newIndex['resolutions']}==set(gids) and len(newIndex['resolutions'])==4
 guards[str(indexpath)]=pin(indexpath)
if args.apply_root:
 assert newIndex is not None,'Root must stage and synthesize actual D4 first'
 rr=read(O/'RECEIPT.actual-stock-native4-v3-paired-D-synthesis.json');assert rr['indexDigest']=='sha256:'+pin(indexpath)['sha256'];assert rr['resolvedCurrentDescriptions']==4
claims={}
for rel in subject['resolutionIndexPaths']:
 p=K/rel;guards[str(p)]=pin(p)
 for r in read(p)['resolutions']:claims.setdefault(r['goalId'],set()).add(rel)
edges=[]
for gid in gids:
 assert not any(w['goalId']==gid for w in subject['resolutionWithdrawals'])
 oldnodes={x['supersededIndexPath'] for x in subject['resolutionSupersessions'] if x['goalId']==gid};terminal=claims[gid]-oldnodes
 assert len(terminal)==1,(gid,terminal)
 old=terminal.pop();assert old=='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-author-assembly-technical-v1/native14/resolution-index.json'
 edges.append({'goalId':gid,'supersededIndexPath':old,'replacementIndexPath':str(indexrel)})
assert str(indexrel) not in subject['resolutionIndexPaths'];subject['resolutionIndexPaths'].append(str(indexrel));subject['resolutionSupersessions'].extend(edges)
# Preserve frozen GoalBook P identities. Only the actual 28c author line differs.
aggregate=Path(audit['inputPins']['frozenP439V3AuthorAggregate']['path']);assert pin(aggregate)==audit['inputPins']['frozenP439V3AuthorAggregate'];guards[str(aggregate)]=pin(aggregate)
lines=aggregate.read_bytes().splitlines(keepends=True);v3={json.loads(line)['goalId']:line for line in lines if line.strip()};assert len(v3)==439
gid28='28c90c6a-3020-5c51-ac40-d802f3f12d2d';line=v3[gid28];assert hashlib.sha256(line).hexdigest()=='6f518400390d8aa12d25fd3b9fb0a327a9abf6dabc0175fe50880a05bf696e90';record=json.loads(line);assert not record['reviewRunIds']
owner=next(x for x in audit['targetBindingObservations'] if x['goalId']==gid28)['existingOwner'];oldcfg=K/owner['configPath'];old=read(oldcfg);guards[str(oldcfg)]=pin(oldcfg)
recordrel=Q/'records/P4v3.28c.exact-frozen-author-whole-line.jsonl';configrel=Q/'config/P4v3.28c.exact-frozen-author-identity.config.json';pc=copy.deepcopy(old)
pc['reviewId']=record['reviewId'];pc['reviewPath']=str(recordrel);pc['reviewRunManifestPaths']=[];pc['scope']['goalIds']=[gid28];pc['scope']['label']='Exact current V3 28c profile identity; separate actual paired material-review receipts';pc['requireApproved']=False
assert pc['landscapePath']==subject['landscapePath'] and pc['semanticKindLedgerPath']==subject['semanticKindLedgerPath']
assert pc['reviewCriteriaPath']=='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
assert subject['positiveEvidenceConfigPaths'].count(owner['configPath'])==1
subject['positiveEvidenceConfigPaths']=[str(configrel) if x==owner['configPath'] else x for x in subject['positiveEvidenceConfigPaths']]
projected={}
for rel in cfg['subjects'][0]['positiveEvidenceConfigPaths']:
 cc=read(K/rel);p=K/cc['reviewPath'];guards[str(K/rel)]=pin(K/rel);guards[str(p)]=pin(p)
 for raw in p.read_bytes().splitlines(keepends=True):
  if raw.strip():
   gid=json.loads(raw)['goalId'];assert gid not in projected;projected[gid]=raw
assert len(projected)==439
assert all(projected[g]==v3[g] for g in v3 if g!=gid28)
projected[gid28]=line;assert all(projected[g]==v3[g] for g in v3)
other435=b''.join(raw for raw in lines if raw.strip() and json.loads(raw)['goalId'] not in gids)
assert hashlib.sha256(other435).hexdigest()=='a34b0f20f43a450a6b9e0892c6024b568b3fc96ddaa3a15878689a9a7847a63e'
for key,value in cfg['subjects'][0].items():
 if key not in {'resolutionIndexPaths','resolutionSupersessions','positiveEvidenceConfigPaths'}:assert subject[key]==value,key
assert len(subject['resolutionIndexPaths'])==113 and len(subject['resolutionSupersessions'])==360 and len(subject['positiveEvidenceConfigPaths'])==123
out['reportId']=cfg['reportId']+'-actual-native4-v3-D113-P439V3-prospective'
centralrel=Q/'central.current439.D113-P439V3.PROSPECTIVE.config.json'
draft=O/'draft-files';put(draft/'P4v3.28c.exact-frozen-author-whole-line.jsonl',line);put(draft/'P4v3.28c.exact-frozen-author-identity.config.json',enc(pc));put(draft/'central.current439.D113-P439V3.PROSPECTIVE.config.json',enc(out))
if args.apply_root:
 for rel,b in [(recordrel,line),(configrel,enc(pc)),(centralrel,enc(out))]:put(K/rel,b)
for p,v in guards.items():assert pin(p)==v,p
result={'role':'Technical exact D113/P439V3 prospective successor; no activation, broad gates or scientific votes','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootApplied':args.apply_root,'sourceD112':pin(src),'targetRelativePath':str(centralrel),'targetPin':pin(K/centralrel) if args.apply_root else pin(draft/'central.current439.D113-P439V3.PROSPECTIVE.config.json'),'native4IndexExists':newIndex is not None,'native4IndexPin':pin(indexpath) if newIndex else None,'counts':{'indices':113,'supersessionEdges':360,'PconfigPaths':123,'uniquePgoals':439,'other435ByteExact':435,'allOther438WrapperLinesUnchanged':True,'activeWithdrawals':len(subject['resolutionWithdrawals'])},'exactAddedDEdges':edges,'onlyPConfigReplacement':{'old':owner['configPath'],'new':str(configrel)},'frozenP439V3Source':pin(aggregate),'other435RawLineDigest':hashlib.sha256(other435).hexdigest(),'fourFrozenD4PWrapperIdentitiesRetained':True,'B4PRecordsAreSeparateReviewReceiptNotActiveAuthorWrapper':True,'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'mainMutation':False,'centralActivated':False,'fullWholeChainValidationRun':False,'M7Claim':False,'humanApproval':False}
rp=O/('RECEIPT.root-prepared-D113-P439V3-prospective.json' if args.apply_root else 'PLAN.root-D113-P439V3-preflight.json');put(rp,enc(result));print(json.dumps({'plan':pin(rp),'counts':result['counts'],'rootApplied':args.apply_root,'native4IndexExists':newIndex is not None}))
