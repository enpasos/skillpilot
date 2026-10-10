# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,shutil,hashlib
R=Path.cwd();O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');A=O.parent/'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1';C=(R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule').resolve()
def cp(s,d):
 d.parent.mkdir(parents=True,exist_ok=True);assert d.parent.resolve().is_relative_to(C),d
 if d.is_symlink():d.unlink()
 shutil.copyfile(s,d);assert s.read_bytes()==d.read_bytes()
# Copy only own integration namespace; preserve the original freeze packages.
shutil.copytree(R/O,C/O,dirs_exist_ok=True,symlinks=True,ignore=shutil.ignore_patterns("bundle"))
for s,d in [('candidate/whole517.inactive.machine-content-final-learner-copy-author.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),('candidate/current517-final-learner-copy-semantic-kinds.inactive.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),('candidate/current517-normal-QA.inactive.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')]:cp(R/A/s,C/d)
rows=[]
for r in json.loads((O/'checks/current38-resource-aliases.exact.json').read_text())['resourceAliases']:
 s=R/r['portableExistingExactResource']['path'];d=C/'app/public'/r['logicalPublicURL'].lstrip('/');assert 'sha256:'+hashlib.sha256(s.read_bytes()).hexdigest()==r['portableExistingExactResource']['sha256']
 for p in list(d.parents):
  if p==C:break
  if p.is_symlink() and not p.resolve().is_relative_to(C):
   assert p.parent.resolve().is_relative_to(C),p;p.unlink();p.mkdir();break
 cp(s,d);rows.append({'goalId':r['goalId'],'logicalPublicURL':r['logicalPublicURL'],'portableExactSource':r['portableExistingExactResource'],'capsuleRegularFile':not d.is_symlink(),'insideCapsulePublicRoot':d.resolve().is_relative_to(C/'app/public')})
(O/'checks/current38-regular-capsule-resource-copies.actual.json').write_text(json.dumps({'schemaVersion':1,'rows':rows,'sourceAssetsRewritten':False,'activeWrites':[]},indent=2)+'\n');print('Staged current whole517 exact and 38 unchanged actual resources inside own chemistry capsule')
