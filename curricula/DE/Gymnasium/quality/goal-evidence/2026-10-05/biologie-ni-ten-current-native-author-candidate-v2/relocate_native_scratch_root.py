# SPDX-License-Identifier: Apache-2.0
"""Move executable code/output scratch intact into ignored tmp; no check exceptions."""
from pathlib import Path
import os,json,hashlib,shutil
root=Path.cwd();h=Path(__file__).resolve().parent;old=h/'native-input-root';new=root/'tmp/biologie-ni-ten-current-native-author-candidate-v2-native-root'
assert old.exists() and not new.exists()
def manifest(folder):
 rows=[]
 for base,dirs,files in os.walk(folder,followlinks=False):
  dirs[:]=[d for d in dirs if not Path(base,d).is_symlink()]
  for n in files:
   p=Path(base,n)
   if not p.is_symlink():rows.append({'path':str(p.relative_to(folder)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 return sorted(rows,key=lambda r:r['path'])
before=manifest(old);oldstr=str(old);newstr=str(new);shutil.move(oldstr,newstr);after=manifest(new);assert before==after
updates=[]
# Only owned preparation scripts/meta reference the physical scratch root. Scientific model/config source paths remain relative.
for base,dirs,files in os.walk(h,followlinks=False):
 dirs[:]=[d for d in dirs if not Path(base,d).is_symlink() and d not in {'visual-import-root'}]
 for n in files:
  p=Path(base,n)
  if p.is_symlink() or p.suffix not in {'.json','.py','.mts','.md'} or p.name in {'native-input-root.readonly-alias-and-code.receipt.json','native-first-pass-tool-output.actual.json'}:continue
  s=p.read_text()
  if oldstr in s:
   # Update the live scratch locator only; preserve historical command/copy proofs as old-path evidence.
   if p.name in {'prospective-paths.json','prepare_inactive.py','bind_kept_predecessor_models.py'}:
    t=s.replace(oldstr,newstr);p.write_text(t);updates.append({'path':str(p.relative_to(root)),'beforeSHA256':hashlib.sha256(s.encode()).hexdigest(),'afterSHA256':hashlib.sha256(t.encode()).hexdigest(),'beforeRoot':oldstr,'afterRoot':newstr})
meta=json.loads((h/'prospective-paths.json').read_text());assert meta['nativeInputRoot']==newstr
(h/'native-scratch-relocation.byte-exact.actual.json').write_text(json.dumps({'candidateOnly':True,'activeCurriculumWrites':0,'reason':'Executable checker/code copies are scratch; place in ignored tmp rather than inside curriculum content scanned by unchanged terminology checker. No checker exception.','oldRoot':oldstr,'newRoot':newstr,'filesBefore':before,'filesAfterIdentical':True,'fileCount':len(before),'physicalBytes':sum(r['bytes'] for r in before),'pathOnlyUpdates':updates,'scientificInputsBooksSourcesUnchanged':True,'historicalOldPathCommandReceiptsPreserved':True},indent=2)+'\n')
print(json.dumps({'newRoot':newstr,'filesExact':len(before),'pathUpdates':len(updates),'physicalBytes':sum(r['bytes'] for r in before)}))
