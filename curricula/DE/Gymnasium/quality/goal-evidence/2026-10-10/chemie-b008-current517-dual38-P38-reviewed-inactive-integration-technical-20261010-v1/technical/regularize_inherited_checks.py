# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import os,hashlib,json,time
R=Path.cwd();C=(R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule').resolve();O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');count=0;per={}
for root in ['curricula/DE/Gymnasium/quality','curricula/DE/Gymnasium/memory-decks']:
 for parent,dirs,files in os.walk(C/root,followlinks=False):
  for name in files:
   p=Path(parent)/name
   if not p.is_symlink():continue
   src=p.resolve();
   if not src.is_file():continue
   p.unlink();os.link(src,p);assert not p.is_symlink();count+=1;ext=p.suffix;per[ext]=per.get(ext,0)+1
(O/'checks/inherited-regular-file-check-contract.actual.json').write_text(json.dumps({'schemaVersion':1,'regularizedReadonlyInheritedFiles':count,'extensions':per,'reason':'Unchanged normal campaigns/card-trace contracts require regular artifacts; earlier missing-dependency symlinks are replaced by exact read-only hardlinks. This changes only capsule representation, never old scientific evidence or source files.','activeWrites':[]},indent=2)+'\n');print('Regularized inherited exact files',count)
