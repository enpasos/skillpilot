# SPDX-License-Identifier: Apache-2.0
"""Whole422 stock model reads all asset digests; all bodies remain original references."""
import hashlib,json
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];p=OWN/'checks/INPUTS.no-render-stock-context.plan.technical.json';plan=json.loads(p.read_text());host=REPO/plan['host']
def branch(p):
 if p.is_symlink():
  children=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
for row in plan['assets']:
 source=REPO/row['physicalRepositorySource']['path'];b=source.read_bytes();assert 'sha256:'+hashlib.sha256(b).hexdigest()==row['physicalRepositorySource']['sha256']
 dest=host/row['normalPublicDestination'];parent=host
 for s in dest.relative_to(host).parts[:-1]:parent/=s;branch(parent)
 if dest.exists():assert dest.is_symlink() and dest.resolve()==source.resolve()
 else:dest.symlink_to(source)
(OWN/'checks/FIX.whole422-stock-requires435-public-asset-references.json').write_text(json.dumps({'role':'Actual required stock loader read scope, no renderer/image copies','cause':'loadGoalBookBuildInputs invokes loadGoalVisualizationAssetDigests over all422 current pages, even when only4 evidence profiles are supplied. Four-only public asset references caused preserved ENOENT diagnostic failure.','unmodifiedStockLocation':'app/scripts/goalBookModel.ts loadGoalVisualizationAssetDigests around2567','current435PublicAssetsReferenced':len(plan['assets']),'physicalRasterCopies':0,'canonicalTargetRasterReferences':4,'prepareRuns':0,'rendererRuns':0},indent=2)+'\n')
print(json.dumps({'publicRasterReferences':len(plan['assets']),'imageCopies':0,'nativePrepareRuns':0}))
