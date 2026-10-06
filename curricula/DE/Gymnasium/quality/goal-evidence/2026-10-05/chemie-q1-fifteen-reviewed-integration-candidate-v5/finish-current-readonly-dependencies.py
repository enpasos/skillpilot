#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Copy only native current Chemie review dependencies into the existing isolate."""
from pathlib import Path
import hashlib,json,shutil
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);ISO=ROOT/'tmp/chemie-q1-fourteen-current-native-physically-isolated-20261005-v4'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
chem=read(OWN/'integration-plan.json')['proposedChemie']; copied=[]
def cp(rel):
 src=ROOT/rel;dst=ISO/rel
 if dst.exists():return
 assert src.is_file() and not dst.is_symlink();dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);assert sha(src)==sha(dst);copied.append({'path':rel,'bytes':src.stat().st_size,'sha256':sha(src)})
cp('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
for cfgp in chem['semanticAtomicityConfigPaths']+chem['positiveEvidenceConfigPaths']+[chem['memoryReviewConfigPath']]:
 cp(cfgp);cfg=read(ROOT/cfgp)
 for key in ['reviewPath','cardReviewPath','reviewCriteriaPath']:
  if cfg.get(key):cp(cfg[key])
for idx in chem['resolutionIndexPaths']:
 cp(idx);data=read(ROOT/idx)
 for group in data['groups']:
  directory=(ROOT/idx).parent/group['artifactDirectory'];assert directory.is_relative_to(ROOT)
  for path in directory.rglob('*'):
   if path.is_file() and path.suffix in {'.json','.jsonl','.md','.pdf','.html'}:cp(str(path.relative_to(ROOT)))
for p in OWN.rglob('*'):
 if p.is_file():
  dst=ISO/p.relative_to(ROOT);dst.parent.mkdir(parents=True,exist_ok=True)
  if not dst.exists() or sha(dst)!=sha(p):shutil.copy2(p,dst)
(OWN/'minimal-current-readonly-dependency-copy.actual.json').write_text(json.dumps({'copiedAdditionalFiles':copied,'onlyCurrentChemistryNativeReviewGroupsCopied':True,'noFullRepositoryCopy':True,'activeWrites':0},indent=2)+'\n')
print(json.dumps({'additionalFiles':len(copied),'bytes':sum(r['bytes'] for r in copied),'activeWrites':0}))
