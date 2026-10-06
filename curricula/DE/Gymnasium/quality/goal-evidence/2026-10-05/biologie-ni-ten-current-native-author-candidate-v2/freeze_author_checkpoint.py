# SPDX-License-Identifier: Apache-2.0
"""Freeze physical author inputs only; never follow source/history aliases."""
from pathlib import Path
from datetime import datetime,timezone
import os,json,hashlib
root=Path.cwd();h=Path(__file__).resolve().parent
manifest=h/'author-checkpoint.freeze.manifest.json';verification=h/'author-checkpoint.freeze-verification.actual.json';assert not manifest.exists()
rows=[];json_count=0;jsonl_count=0
for base,dirs,files in os.walk(h,followlinks=False):
 dirs[:]=[d for d in dirs if not Path(base,d).is_symlink()]
 for n in files:
  p=Path(base,n)
  if p.is_symlink() or p in [manifest,verification]:continue
  b=p.read_bytes()
  if n.endswith('.json'):json.loads(b);json_count+=1
  if n.endswith('.jsonl'):
   for line in b.decode().splitlines():
    if line.strip():json.loads(line)
   jsonl_count+=1
  rows.append({'path':str(p.relative_to(root)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
rows.sort(key=lambda r:r['path']);m={'schemaVersion':1,'kind':'inactive_author_checkpoint','createdAt':datetime.now(timezone.utc).isoformat(),'candidateOnly':True,'operativeAdoption':False,'humanApproval':False,'currentStrictNetIncrease':0,'newScienceClosures':0,'restoredBindingClaims':0,'activeBase':{'curricularAtomic':365,'strictComplete':49,'canonicalSHA256':'45f3d79713ba3c5e0817df9e8da04989aacab3daf65e275838af9f35c91abfba'},'futureAuthorAtoms':383,'independentDReviews':'pending','currentIndependentV13Approvals':'pending','jsonParseCount':json_count,'jsonlParseCount':jsonl_count,'followSymlinks':False,'fileCount':len(rows),'physicalBytes':sum(r['bytes'] for r in rows),'files':rows}
manifest.write_text(json.dumps(m,indent=2)+'\n');sha=hashlib.sha256(manifest.read_bytes()).hexdigest()
for r in rows:
 p=root/r['path'];assert p.stat().st_size==r['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256'],r['path']
verification.write_text(json.dumps({'manifestPath':str(manifest.relative_to(root)),'manifestSHA256':sha,'fileCount':len(rows),'allPhysicalFilesRechecked':True,'validJsonFiles':json_count,'validJsonlFiles':jsonl_count,'noEmptyOrMalformedJson':True,'candidateOnly':True,'humanApproval':False},indent=2)+'\n')
print(json.dumps({'freezeSHA256':sha,'files':len(rows),'bytes':m['physicalBytes'],'validJSON':json_count,'validJSONL':jsonl_count,'allRechecked':True}))
