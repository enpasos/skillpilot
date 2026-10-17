from pathlib import Path
import json, hashlib, datetime
O=Path(__file__).resolve().parent; B=O.parent
def pin(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def read(p):return json.loads(Path(p).read_text())
def put(p,raw):
 assert p.is_relative_to(O) and not p.exists() and not p.is_symlink();p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(raw)
 return pin(p)
guards=read(O/'GUARDS.original-inputs.before.json')['pins']
for expected in guards:assert pin(expected['path'])==expected,expected['path']
refs={
 'P4':(B/'chemie-mixed18-four-targeted-P-gaps-author-successor-v1/SELECTOR.four-targeted-P-author-successors.pending-independent-review.sealed.json','20b489a720be0d9a8ceb7a1d115b7484c39336f4e683d3475266fe62fec8c383'),
 'V4':(B/'chemie-four-image-fresh-independent-v-v1/SELECTOR.four-images.independent-v.sealed.json','d92e7bd1b4bdd53759e696f12599ad2b9df0b550c5bf28290155b2735c034eef')}
copies=[]
for label,(path,expected) in refs.items():
 assert pin(path)['sha256']==expected;guards.append(pin(path));x=read(path)
 items=x['artifacts']
 for item in items:
  assert pin(item['path'])==item,item['path'];guards.append(item)
  source=Path(item['path']);dest=O/'input-copies'/label/source.relative_to(path.parent)
  copies.append({'source':item,'copy':put(dest,source.read_bytes())})
 copies.append({'source':pin(path),'copy':put(O/'input-copies'/label/path.name,path.read_bytes())})
for expected in guards:assert pin(expected['path'])==expected,expected['path']
obj={'role':'Actual sealed author materials and independent V delta copied without changes; no new judgment',
 'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceGuards':guards,'copies':copies,
 'P4ProfileFile':str(O/'input-copies/P4/candidate/P4.complete-author-profile-successors.pending.json'),
 'P4WholeMaterials':str(O/'input-copies/P4/materials/FIVE.whole-bilingual-targeted-cases.author.json'),
 'P4MaterialBindings':str(O/'input-copies/P4/materials/CASE-MATERIAL-BINDINGS.author.json'),
 'V4ActualDelta':str(O/'input-copies/V4/V.review-records.stock-ai-delta.json'),
 'humanApproval':False,'sourceWrites':False}
put(O/'INPUTS.final-actual-P4-V4-material-pins.json',(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode())
print(json.dumps({'sourceGuardCount':len(guards),'copies':len(copies),'manifest':pin(O/'INPUTS.final-actual-P4-V4-material-pins.json')}))
