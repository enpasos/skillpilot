# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import shutil,os,json,hashlib
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07';O=Path(__file__).resolve().parent;A=Q/'biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2';I=O/'native-isolated-repository';S=A/'native-isolated-repository'
def clone(src,dst):
 if src.is_symlink():
  dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(os.path.relpath(src.resolve(),dst.parent));return
 if src.is_dir():
  dst.mkdir(parents=True,exist_ok=True)
  for x in src.iterdir():clone(x,dst/x.name)
 else:
  dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
for name in ['app','inputs','curricula','config','contracts']:clone(S/name,I/name)
clone(S/'outputs/prepared-three',I/'outputs/prepared-three');clone(S/'outputs/full-current391.book-model.json',I/'outputs/full-current391.book-model.json')
for d,rnd in [('biologie-three-current-fresh-blind-a-20261007-v2','a'),('biologie-two-current-native-fresh-independent-b-20261007-v1','b')]:
 source=Q/d/f'native-round-{rnd}';target=I/f'outputs/prepared-three/round-{rnd}'
 for f in source.rglob('*'):
  if f.is_file() and not f.is_symlink():
   dst=target/f.relative_to(source)
   if dst.exists():assert dst.read_bytes()==f.read_bytes(),str(f)
   else:clone(f,dst)
# Native isolated scope root must point to the actual reviewed source/provenance overlay.
(O/'isolated-helper-and-reviewer-exact-lineage.json').write_text(json.dumps({'documentType':'Technical isolated native helper and genuine reviewer record lineage','copiedHelpers':[{'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'exactAuthorHelper':True} for p in (I/'app/scripts').glob('*.ts')],'reviewerCampaignsAndRunsCopiedExactly':True,'newScientificJudgments':False,'activeWrites':False},indent=2)+'\n')
print(json.dumps({'isolatedPrepared':str(I.relative_to(R)),'actualAAndBRecordsExact':True}))
