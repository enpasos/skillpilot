# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import os,json,hashlib,shutil
R=Path.cwd();C=(R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule').resolve();O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');created=[]
def fill(src,dst,regular=False):
 if src.is_symlink() and not regular:
  if not dst.exists() and not dst.is_symlink():
   dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(src.resolve(),target_is_directory=src.is_dir());created.append({"path":str(dst.relative_to(C)),"sourcePath":str(src.relative_to(R)),"mechanism":"read-only-original-symlink"})
  return
 if src.is_dir():
  if dst.is_symlink():
   if not regular:return
   dst.unlink()
  dst.mkdir(parents=True,exist_ok=True);assert dst.resolve().is_relative_to(C),dst
  for p in src.iterdir():fill(p,dst/p.name,regular)
 elif src.is_file():
  if dst.exists() and not (regular and dst.is_symlink()):return
  if dst.is_symlink():dst.unlink()
  dst.parent.mkdir(parents=True,exist_ok=True);assert dst.parent.resolve().is_relative_to(C),dst
  if regular:os.link(src.resolve(),dst)
  else:dst.symlink_to(src.resolve())
  created.append({'path':str(dst.relative_to(C)),'sourcePath':str(src.relative_to(R)),'mechanism':'regular-hardlink-readonly-check'if regular else 'read-only-missing-dependency-symlink'})
# Fill missing dependency artifacts for unchanged subjects and historical evidence only.
for p in ['curricula','contracts','docs','scripts','app/src','app/scripts','backend/src/main/resources/static/assets/goal-visualizations','backend/src/main/resources/static/audio','app/public/audio','app/public/whitepaper','app/public/assets/goal-visualizations']:
 fill(R/p,C/p,regular=('/goal-visualizations'in p or '/audio'in p or '/whitepaper'in p))
# Asset checker requires every canonical image/prompt to resolve inside its canonical root.
fill(R/'curricula/DE/Gymnasium/visualizations',C/'curricula/DE/Gymnasium/visualizations',regular=True)
# Stage the 38 selected original resource bytes into every candidate runtime/canonical root without touching repository roots.
a=json.loads((O/'checks/current38-resource-aliases.exact.json').read_text());rows=[]
for r in a['resourceAliases']:
 s=R/r['portableExistingExactResource']['path'];rel=r['logicalPublicURL'].removeprefix('/assets/goal-visualizations/');assert hashlib.sha256(s.read_bytes()).hexdigest()==r['portableExistingExactResource']['sha256'].removeprefix('sha256:')
 for root in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']:
  d=C/root/rel
  for ancestor in list(d.parents):
   if ancestor==C:break
   if ancestor.is_symlink():ancestor.unlink();ancestor.mkdir();break
  d.parent.mkdir(parents=True,exist_ok=True);assert d.parent.resolve().is_relative_to(C)
  if d.exists() and d.read_bytes()==s.read_bytes() and not d.is_symlink():continue
  if d.exists()or d.is_symlink():d.unlink()
  shutil.copyfile(s,d);rows.append({'goalId':r['goalId'],'path':str(d.relative_to(C)),'sha256':r['portableExistingExactResource']['sha256']})
  # Preserve the existing exact neutral provider prompt for newly staged canonical image.
  prompt=d.parent/'prompt.de.md'
  if root.startswith('curricula') and not prompt.exists():
   sourcePrompt=s.parent/'prompt.de.md'
   if not sourcePrompt.exists():sourcePrompt=R/'curricula/DE/Gymnasium/visualizations'/rel;sourcePrompt=sourcePrompt.parent/'prompt.de.md'
   assert sourcePrompt.exists(),sourcePrompt;shutil.copyfile(sourcePrompt,prompt)
(O/'checks/capsule-missing-dependency-and-resource-exact-staging.actual.json').write_text(json.dumps({'schemaVersion':1,'purpose':'Complete existing own Chem isolated capsule for unchanged normal checks; no operative writes','createdDependencyCount':len(created),'createdDependencies':created,'actualNewResourceCopies':rows,'hardlinkedAssetsUsedOnlyByReadOnlyChecks':True,'activeWrites':[]},indent=2)+'\n');print('Completed exact read-only dependencies',len(created),'candidate media copies',len(rows))
