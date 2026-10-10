# SPDX-License-Identifier: Apache-2.0
"""Selective plain mutable copies for normal isolated author preparation."""
from pathlib import Path
import shutil,json
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author';C=T/'isolated-normal-capsule'
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
assert not (R/P/'author.final.freeze.json').exists()
assert not C.exists(),'Fresh own capsule required'
C.mkdir(parents=True)
def cp(p):
 src=R/p;dst=C/p
 if not src.exists() or src.is_symlink():return
 if src.is_file():dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
 else:shutil.copytree(src,dst,dirs_exist_ok=True,ignore=shutil.ignore_patterns('node_modules','dist','.git','*.pdf','*.png','*.zip','*.html','*.webp','*.jpeg','*.jpg'))
for p in ['app/scripts','app/src','contracts','curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/input','curricula/DE/Gymnasium/mapping','curricula/DE/Gymnasium/provenance','curricula/DE/Gymnasium/composition-views','curricula/DE/Gymnasium/quality/memory-card-review','curricula/DE/Gymnasium/quality/deep-understanding-rollout','curricula/DE/Gymnasium/quality/goal-book-publication','curricula/DE/Gymnasium/quality/goal-visualization-qa','curricula/DE/Gymnasium/quality/goal-evidence/prompts','AGENTS.md']:cp(Path(p))
# Actual ordinary configuration dependencies only: not frozen history inventories.
seen=set();queue=list((C/'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'))+[C/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']
def ss(x):
 if isinstance(x,str):yield x
 elif isinstance(x,list):
  for v in x:yield from ss(v)
 elif isinstance(x,dict):
  for v in x.values():yield from ss(v)
while queue:
 p=queue.pop()
 if p in seen:continue
 seen.add(p)
 try:d=json.loads(p.read_text())
 except Exception:continue
 for s in ss(d):
  s=s.split('#',1)[0]
  if s.startswith(('curricula/','docs/','app/scripts/')) and len(s)<512 and '\n' not in s and (R/s).is_file() and not (C/s).exists():
   cp(Path(s))
   if s.endswith('.config.json'):queue.append(C/s)
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
(C/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
pub=C/'app/public/assets/goal-visualizations/chemie';pub.mkdir(parents=True,exist_ok=True)
selected=json.loads((R/P/'assets/whole26-exact-current-raster-origin-and-binding-map.json').read_text())['rows'];ids={r['goalId'] for r in selected}
for d in (R/'app/public/assets/goal-visualizations/chemie').iterdir():
 if d.is_dir() and d.name not in ids:(pub/d.name).symlink_to(d,target_is_directory=True)
for r in selected:
 u=r['selectedResourceLink']['url'];src=R/r['wholeExactSelectedRaster']['ownExactCopy']['path'];dst=C/'app/public'/u.lstrip('/');dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
# Unrendered existing assets are read-only leaf-directory references under tmp;
# all26 rendered rasters are genuine regular local files within publicRoot.
(T/'capsule.actual.path.txt').write_text(str(C)+'\n')
print(json.dumps({'capsule':str(C),'renderedRasterRegularFiles':len(selected),'selectedOwnPackage':str(P),'activeWrites':0}))
