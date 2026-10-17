from pathlib import Path
import datetime,hashlib,json
O=Path(__file__).resolve().parent;B=O.parent;F=B/'current439-remediation14-author-assembly-technical-v1/capsule';K=O/'capsule'
def pin(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def own(p):
 assert p==K or K in p.parents
 if p==K:return
 own(p.parent)
 if p.is_symlink():
  old=p.resolve(strict=True);p.unlink();p.mkdir()
  for child in old.iterdir():(p/child.name).symlink_to(child,target_is_directory=child.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
assert not K.exists() and not K.is_symlink()
source=B/'current439-remediation14-author-assembly-technical-v1/SELECTOR.clean-remediation14-reviewer-inputs.sealed.json';assert pin(source)['sha256']=='0ee1e9432d7e2e82435a9e83ce9a19e6acf1da35d98f00e4ac54403c9d43e38b'
s=json.loads(source.read_text());guards=[pin(source),s['currentCanonicalPin'],s['currentP439PinForTechnicalSerializationOnly'],s['currentSEM650PinForTechnicalSerializationOnly']]
r=Path(s['nativeRoot']).parent;guards.append(pin(r/'QA.four-unapproved-image-author-bindings.draft.json'));guards.append(pin(F/'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'))
for p in guards:assert pin(p['path'])==p
K.mkdir()
for child in F.iterdir():(K/child.name).symlink_to(child,target_is_directory=child.is_dir())
for rel in ['curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17','curricula/DE/Gymnasium/quality/memory-card-review','curricula/DE/Gymnasium/quality/goal-visualization-qa']:
 own(K/rel)
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1');own(K/Q)
for p in guards:assert pin(p['path'])==p
x={'role':'Private K bootstrapped from frozen R14; shared ancestors localized before parent native14 staging', 'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'capsule':str(K),'source':str(F),'privateIntegrationRootRelativePath':str(Q),'sourceGuards':guards,'rootNative14SubtreeUnmodified':True,'scienceMutations':False,'foreignWrites':False}
p=O/'BOOTSTRAP.guarded-K-ready.json';assert not p.exists();p.write_text(json.dumps(x,indent=2)+'\n');print(json.dumps({'capsule':str(K),'receipt':pin(p),'privateIntegrationRootRelativePath':str(Q)}))
