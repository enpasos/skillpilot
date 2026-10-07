"""AUTHOR: create a temporary sparse root only AFTER seven final reviewed inputs.

No active image/CAN/QA/kind paths are written. Production TS files are copied
byte-identically so their real root detection uses this temporary root. Symlinks
are relative, read-only inputs and are never committed into the dossier.
"""
from pathlib import Path
import json,hashlib,os,shutil,tempfile
root=Path.cwd().resolve()
own=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v2')
read=lambda p:json.loads((root/p).read_text())
def bind(p):
 b=(root/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
final=read(own/'final-seven-reviewed-png-input-routing.author.json')
assert final['finalSevenPNGInputsReady'] is True
assert len(final['rows'])==7
assert len({r['goalId'] for r in final['rows']})==7
for r in final['rows']:
 assert bind(Path(r['selectedPNG']['path']))==r['selectedPNG']
 assert r['independentAKeep'] and r['independentBKeep']
 for f in r['actualIndependentDecisionRecordBindings']:assert bind(Path(f['path']))==f
iso=Path(tempfile.mkdtemp(prefix='skillpilot-chemie-next25-native-v2-'))
(iso/'app/scripts').mkdir(parents=True)
links=[]
for rel in ['curricula','contracts','docs','app/src','app/node_modules','app/scripts/config']:
 p=iso/rel;p.parent.mkdir(parents=True,exist_ok=True);target=os.path.relpath(root/rel,p.parent);p.symlink_to(target,target_is_directory=True);links.append({'isolatedRelativePath':rel,'relativeReadOnlyTarget':target})
shutil.copyfile(root/'app/package.json',iso/'app/package.json')
helpers=[]
for p in sorted((root/'app/scripts').glob('*.ts')):
 dst=iso/'app/scripts'/p.name;shutil.copyfile(p,dst);assert dst.read_bytes()==p.read_bytes();helpers.append(bind(p.relative_to(root)))
public=iso/'app/public';public.mkdir(parents=True)
for p in (root/'app/public').iterdir():
 if p.name=='assets':continue
 dst=public/p.name;dst.symlink_to(os.path.relpath(p,dst.parent),target_is_directory=p.is_dir())
asset=public/'assets';asset.mkdir()
for p in (root/'app/public/assets').iterdir():
 if p.name=='goal-visualizations':continue
 dst=asset/p.name;dst.symlink_to(os.path.relpath(p,dst.parent),target_is_directory=p.is_dir())
gv=asset/'goal-visualizations';gv.mkdir()
for p in (root/'app/public/assets/goal-visualizations').iterdir():
 if p.name=='chemie':continue
 dst=gv/p.name;dst.symlink_to(os.path.relpath(p,dst.parent),target_is_directory=p.is_dir())
chem=gv/'chemie';chem.mkdir();selected={r['goalId'] for r in final['rows']}
for p in (root/'app/public/assets/goal-visualizations/chemie').iterdir():
 if p.name in selected:continue
 dst=chem/p.name;dst.symlink_to(os.path.relpath(p,dst.parent),target_is_directory=p.is_dir())
physical=[]
for r in final['rows']:
 dst=chem/r['goalId']/(r['goalId']+'.png');dst.parent.mkdir();shutil.copyfile(root/r['selectedPNG']['path'],dst)
 assert 'sha256:'+hashlib.sha256(dst.read_bytes()).hexdigest()==r['selectedPNG']['sha256']
 for p in (root/'app/public/assets/goal-visualizations/chemie'/r['goalId']).iterdir():
  olddst=dst.parent/p.name
  if not olddst.exists():olddst.symlink_to(os.path.relpath(p,olddst.parent),target_is_directory=p.is_dir())
 physical.append({'goalId':r['goalId'],'source':r['selectedPNG'],'isolatedRelativePath':str(dst.relative_to(iso)),'sha256':r['selectedPNG']['sha256']})
# The native renderer rejects realpaths outside publicRoot. Reproduce exactly the
# remaining eighteen selected current JPEGs as physical temporary copies.
scope=read(own.parent/'chemie-next-coherent-current-gap-native-author-v1/current25-provisional-scope-and-valid-existing-bindings.author.json')
for gid in scope['selected25GoalIds']:
 if gid in selected:continue
 folder=chem/gid
 if folder.is_symlink():folder.unlink()
 folder.mkdir(exist_ok=True)
 for p in (root/'app/public/assets/goal-visualizations/chemie'/gid).iterdir():
  assert p.is_file();shutil.copyfile(p,folder/p.name);assert (folder/p.name).read_bytes()==p.read_bytes()
receipt={'role':'AUTHOR exact temporary sparse native root; not active integration or new science review','isolatedRootUsed':str(iso),'relativeReadOnlyLinks':links,'byteIdenticalCopiedProductionHelpers':helpers,'finalSevenPNGInputsReady':True,'finalSevenPNGInputs':physical,'currentActiveCanonical':bind(Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')),'realRootOwnedOutputs':str(own),'temporaryPhysicalRasterCopies':7,'temporaryPhysicalFinal25RasterCopies':25,'additionalPhysicalUnchanged18RasterCopies':18,'unaffectedAssetsReadOnlyLinks':True,'noActivePNGCanonicalRegistryKindQADeckWrites':True,'activeWrites':False,'committedAbsoluteSymlinks':False,'newScienceAcceptance':False}
(root/own/'actual-final-input-native-isolation.author-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'isolatedRoot':str(iso),'actualHelperCopies':len(helpers),'actualRasterCopies':7,'activeWrites':False}))
