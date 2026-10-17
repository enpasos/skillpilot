from pathlib import Path
import hashlib,json,shutil
B=Path('/mnt/e/skillpilot-chemie-L7-20261017');O=B/'current650-twenty-foundations-targeted-P-SEM-bindings-technical-b-v1';C=O/'capsule';mp=C/'candidate-inputs/TWENTY-SUCCESSOR.inputs.json';m=json.load(open(mp));r18=B/'paired-eighteen-foundations-and-c95-actual-whole650-assembly-root-v1/RECEIPT.actual-paired-eighteen-foundation-placements.json';assert hashlib.sha256(r18.read_bytes()).hexdigest()=='c6d8dee73e383d591a3311043f7f55c7b3c27f9ad2d1b70f2192692a1c430960';r20=B/'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/RECEIPT.actual-paired-two-BW-teachers-and-coordinate-priors.json';extra={'rootReceipt18':{'path':str(r18),'sha256':'c6d8dee73e383d591a3311043f7f55c7b3c27f9ad2d1b70f2192692a1c430960'}}
for n,p in [('18',r18),('20',r20)]:
 r=json.load(open(p))
 for key in ['independentASeal','independentBSeal']:extra[n+key]=r[key]
for k,v in extra.items():
 src=Path(v['path']);s=hashlib.sha256(src.read_bytes()).hexdigest();assert s==v['sha256'].removeprefix('sha256:');d=C/'candidate-inputs/twenty-targeted-successor'/k/src.name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,d);m['inputs'][k]={'path':str(src),'physicalPath':str(src.resolve()),'sha256':s,'bytes':src.stat().st_size,'copyRelative':str(d.relative_to(C)),'copySHA256':s}
mp.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');print('Exact root18 receipt and four independent seals archived; 363 paired-context successor remains pending.')
