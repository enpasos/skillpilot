# SPDX-License-Identifier: Apache-2.0
"""Create only a fresh ignored sparse host; never modifies any earlier host or input."""
import hashlib,json,shutil,sys
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1]
assert not (OWN/'FILES.finite-native-preparation.seal.json').exists(),'Never write a sealed packet'
DATA=json.loads((OWN/(sys.argv[1] if len(sys.argv)>1 else 'checks/REBUILD.native13.physical-exact-map.json')).read_text())
HOST=REPO/DATA['executionHost'];assert HOST.is_relative_to(REPO/'tmp') and not HOST.exists()
def verified(row):
 p=REPO/row['path'];b=p.read_bytes();assert len(b)==row['bytes'] and 'sha256:'+hashlib.sha256(b).hexdigest()==row['sha256'],p;return p
for r in DATA['aliases']:verified(r['physicalRepositorySource'])
for r in DATA['selectedCurrentAssetRows']:verified(r['physicalRepositorySource'])
for r in DATA['stockPhysicalModules']:verified(r)
HOST.mkdir(parents=True)
# Immutable repository inputs may be read through aliases. No public/backend tree copies.
for p in REPO.iterdir():
 if p.name not in ('app','tmp','.git'):(HOST/p.name).symlink_to(p,target_is_directory=p.is_dir())
(HOST/'app').mkdir()
for p in (REPO/'app').iterdir():
 if p.name not in ('scripts','public'):(HOST/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
(HOST/'app/scripts').mkdir();(HOST/'app/public').mkdir()
def branch(p):
 if p.is_symlink():
  children=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def install(source,relative,physical):
 target=HOST/relative;parent=HOST
 for part in target.relative_to(HOST).parts[:-1]:parent/=part;branch(parent)
 if target.is_file() or target.is_symlink():target.unlink()
 else:assert not target.exists()
 if physical:shutil.copy2(source,target)
 else:target.symlink_to(source)
for r in DATA['stockPhysicalModules']:install(verified(r),r['path'],True)
for r in DATA['aliases']:install(verified(r['physicalRepositorySource']),r['normalHostAlias'],True)
for r in DATA['selectedCurrentAssetRows']:
 p=verified(r['physicalRepositorySource']);install(p,r['normalCanonicalDestination'],False)
 install(p,r['normalPublicDestination'],r['publicMustBePhysicalWithinHostPublicRoot'])
# Explicitly reproduce exact315 historical discovery input, not current-main discovery.
legacy=verified(DATA['legacyQaDispositionDiscoveryInput']);disposition=json.loads(legacy.read_text())
assert disposition['selectedChemistryLegacyMarkdownCount']==0 and disposition['rows']==[]
review=HOST/'curricula/DE/Gymnasium/quality/goal-visualization-review';parent=HOST
for part in review.relative_to(HOST).parts[:-1]:parent/=part;branch(parent)
assert review.is_symlink();review.unlink();review.mkdir()
receipt={'host':DATA['executionHost'],'normalPhysicalAliases':len(DATA['aliases']),'selectedImages':len(DATA['selectedCurrentAssetRows']),
 'physicalPublicImages':sum(r['publicMustBePhysicalWithinHostPublicRoot'] for r in DATA['selectedCurrentAssetRows']),
 'stockPhysicalModules':len(DATA['stockPhysicalModules']),'publicDirectoryIsPrivate':not (HOST/'app/public').is_symlink(),
 'legacyDispositionSource':DATA['legacyQaDispositionDiscoveryInput'],'privateSelectedLegacyMarkdownCount':0,
 'actualMainHistoryRetained':True,'fullTreeCopies':0,'earlierHostWrites':0,'activeWrites':0,'checksRun':False}
(OWN/DATA.get('buildReceiptPath','checks/REBUILD.actual-new-host.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
