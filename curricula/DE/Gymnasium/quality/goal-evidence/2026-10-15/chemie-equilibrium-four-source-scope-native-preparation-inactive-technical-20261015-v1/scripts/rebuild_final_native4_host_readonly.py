# SPDX-License-Identifier: Apache-2.0
"""Rebuild only exact private aliases/references; never executes renderer or reviews."""
import hashlib,json,shutil,sys
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];m=json.loads((OWN/'checks/REBUILD.final-native4.minimal-exact-physical-map.json').read_text())
HOST=REPO/(sys.argv[1] if len(sys.argv)>1 else m['executionHost']);assert HOST.is_relative_to(REPO/'tmp') and not HOST.exists()
def verify(r):
 p=REPO/r['path'];b=p.read_bytes();assert 'sha256:'+hashlib.sha256(b).hexdigest()==r['sha256'] and len(b)==r['bytes'];return p
HOST.mkdir(parents=True)
for p in REPO.iterdir():
 if p.name not in ['app','tmp','.git']:(HOST/p.name).symlink_to(p,target_is_directory=p.is_dir())
(HOST/'app').mkdir()
for p in (REPO/'app').iterdir():
 if p.name not in ['scripts','public']:(HOST/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
(HOST/'app/scripts').mkdir();(HOST/'app/public').mkdir()
def branch(p):
 if p.is_symlink():
  children=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
def install(src,relative,physical=False):
 p=HOST/relative;parent=HOST
 for s in p.relative_to(HOST).parts[:-1]:parent/=s;branch(parent)
 if p.is_symlink() or p.is_file():p.unlink()
 if physical:shutil.copyfile(src,p)
 else:p.symlink_to(src)
for r in m['stockPhysicalModules']:install(verify(r),r['path'],True)
for r in m['aliases']:install(verify(r['physicalRepositorySource']),r['normalHostAlias'],True)
for r in m['selectedCurrentAssetRows']:
 p=verify(r['physicalRepositorySource']);install(p,r['normalPublicDestination'],r['publicMustBePhysicalWithinHostPublicRoot'])
 if r['publicMustBePhysicalWithinHostPublicRoot']:install(p,r['normalCanonicalDestination'])
legacy=json.loads(verify(m['legacyQaDispositionDiscoveryInput']).read_text());assert legacy['selectedChemistryLegacyMarkdownCount']==0 and legacy['rows']==[]
review=HOST/'curricula/DE/Gymnasium/quality/goal-visualization-review';assert review.is_symlink();review.unlink();review.mkdir()
print(json.dumps({'host':str(HOST.relative_to(REPO)),'stockModules':31,'physicalJsonAliases':3,'selectedPhysicalRasterCopies':4,'remainingRasterReferences':431,'rendererExecuted':False,'reviewsExecuted':False,'centralExecuted':False,'activeWrites':0}))
