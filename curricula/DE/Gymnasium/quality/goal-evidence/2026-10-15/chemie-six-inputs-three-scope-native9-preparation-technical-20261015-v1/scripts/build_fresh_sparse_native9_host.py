# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,shutil,os
R=Path.cwd();O=Path(__file__).resolve().parents[1];mp=json.loads((O/'checks/REBUILD.native9.PENDING-final-QA.physical-map.json').read_text());H=R/mp['executionHost'];assert not H.exists()
def verified(row):
 p=R/row['path'];b=p.read_bytes();assert len(b)==row['bytes']and'sha256:'+hashlib.sha256(b).hexdigest()==row['sha256'],p;return p
for p in R.iterdir():
 if p.name not in ['app','tmp','.git']:(H/p.name).parent.mkdir(parents=True,exist_ok=True);(H/p.name).symlink_to(p,target_is_directory=p.is_dir())
(H/'app').mkdir();(H/'app/scripts').mkdir();(H/'app/public').mkdir()
for p in (R/'app').iterdir():
 if p.name not in ['scripts','public']:(H/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
def branch(p):
 if p.is_symlink():
  children=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir()and not p.is_symlink()
def install(source,relative,physical):
 dest=H/relative;parent=H
 for part in dest.relative_to(H).parts[:-1]:parent/=part;branch(parent)
 if dest.is_file()or dest.is_symlink():dest.unlink()
 else:assert not dest.exists()
 if physical:shutil.copy2(source,dest)
 else:dest.symlink_to(source)
for row in mp['stockPhysicalModules']:install(verified(row),row['path'],True)
for row in mp['aliases']:
 if row['physicalRepositorySource']is not None:install(verified(row['physicalRepositorySource']),row['normalHostAlias'],True)
for row in mp['selectedCurrentAssetRows']:
 source=verified(row['physicalRepositorySource']);install(source,row['normalCanonicalDestination'],False);install(source,row['normalPublicDestination'],row['publicMustBePhysicalWithinHostPublicRoot'])
# No optional history/discovery operation or central command is invoked.
physical=[]
for base,dirs,files in os.walk(H,followlinks=False):
 dirs[:]=[d for d in dirs if not(Path(base)/d).is_symlink()]
 for name in files:
  p=Path(base)/name
  if not p.is_symlink():physical.append(p)
receipt={'role':'Fresh sparse native9 host before actual final C QA binding; no stock native command run','host':mp['executionHost'],'stockPhysicalModules':len(mp['stockPhysicalModules']),'physicalDataAliasesBeforeQA':sum(r['physicalRepositorySource']is not None for r in mp['aliases']),'physicalPublicImages':9,'physicalPublicImageBytes':mp['physicalPublicSelectedBytes'],'other426RasterBodiesAreReferences':True,'physicalHostFileCount':len(physical),'physicalHostBytes':sum(p.stat().st_size for p in physical),'QAfinal':'PENDING','nativeCommands':0,'imageCopies':9,'wholeTreesCopied':0,'earlierHostWrites':0,'activeWrites':0}
(O/'checks/HOST.fresh-native9-before-QA.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
