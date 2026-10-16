# SPDX-License-Identifier: Apache-2.0
"""Genau ein neuer privater Folgehost; noch keine Prüfung oder finalen Bindungen."""
from pathlib import Path
import hashlib,json,os,shutil
R=Path.cwd();O=Path(__file__).resolve().parents[1]
H=R/'tmp/chemie-m7-resumed-20261015/current426-five-informed-PA-final8-own-host-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=R/r['path'];assert ref(p)==r,p;return p
def put(p,d):
 assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
p=load(O/'PREPARED.raw-five-PA-two-texts-awaiting-genuine-context-and-final-bindings.json');s=load(verify(p['baseNative8Selector']));m=load(verify(s['exactRebuildRecipe']))
assert not H.exists();H.mkdir(parents=True)
for q in R.iterdir():
 if q.name not in ['app','tmp','.git']:(H/q.name).symlink_to(q,target_is_directory=q.is_dir())
(H/'app').mkdir();(H/'app/scripts').mkdir();(H/'app/public').mkdir()
for q in (R/'app').iterdir():
 if q.name not in ['scripts','public']:(H/'app'/q.name).symlink_to(q,target_is_directory=q.is_dir())
def branch(q):
 if q.is_symlink():
  children=list(q.resolve().iterdir());q.unlink();q.mkdir()
  for c in children:(q/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not q.exists():q.mkdir()
def install(src,rel,physical=False,hardlink=False):
 q=H/rel;par=H
 for part in q.relative_to(H).parts[:-1]:par/=part;branch(par)
 if q.is_symlink() or q.is_file():q.unlink()
 if hardlink:os.link(src.resolve(),q)
 elif physical:shutil.copyfile(src,q)
 else:q.symlink_to(src)
for rel in ['curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/quality/goal-visualization-qa','curricula/DE/Gymnasium/quality/goal-visualization-review']:
 q=H/rel;par=H
 for part in q.relative_to(H).parts[:-1]:par/=part;branch(par)
 if q.is_symlink():q.unlink()
 assert not q.exists();q.mkdir()
for q in m['stockPhysicalModules']:install(verify(q),q['path'],True)
for q in m['aliases']:install(verify(q['physicalRepositorySource']),q['normalHostAlias'])
normal_c='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';normal_s='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';normal_q='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
semantic=O/'candidate/semantic570.current426.two-genuine-text-context-bindings.final.json';qa=O/'qa/QA443.current-two-texts-genuine-V-contexts.final.json'
install(verify(p['canonicalCandidate']),normal_c,True);install(semantic,normal_s);install(qa,normal_q)
selected=set(s['requiredOwnCurrentDPageGoalIds']);assert len(selected)==8
for row in m['selectedCurrentAssetRows']:
 src=verify(row['physicalRepositorySource']);install(src,row['normalCanonicalDestination']);install(src,row['normalPublicDestination'],hardlink=row['goalId'] in selected)
for row in m['selectedReadOnlyPublicImageHardlinks']:
 src=verify(row['originalRepositorySource']);dst=H/row['normalPublicAlias'];assert src.stat().st_ino==dst.stat().st_ino and src.stat().st_dev==dst.stat().st_dev
plan={'schemaVersion':1,'role':'Vorbereiteter neuer privater Host; aktuelle2Text-Kontextwissenschaft wird vor Fingerprints/Checks separat freigegeben',
 'executionHost':H.relative_to(R).as_posix(),'sourceMap':s['exactRebuildRecipe'],'stockPhysicalModules':m['stockPhysicalModules'],'inheritedFinalAliases':m['aliases'],
 'canonical':p['canonicalCandidate'],'normalCanonicalPath':normal_c,'normalSemanticPath':normal_s,'normalQAPath':normal_q,
 'pendingFinalSemanticPath':semantic.relative_to(R).as_posix(),'pendingFinalQAPath':qa.relative_to(R).as_posix(),
 'selectedCurrentAssetRows':m['selectedCurrentAssetRows'],'selectedReadOnlyImageHardlinks':m['selectedReadOnlyPublicImageHardlinks'],
 'oneNewHost':True,'sourceRasterByteCopies':0,'oldHostWrites':0,'activeWrites':0,'stockChecks':0,'nativeRenders':0,'waitingForGenuineTwoTextContext':True}
put(O/'REBUILD.prepared-new-informed-PA-final8-host.awaiting-context.json',plan)
print(json.dumps({'newHosts':1,'sourceRasterByteCopies':0,'selectedReadOnlyHardlinks':8,'checks':0,'renders':0,'awaitingGenuineTwoTextContext':True}),flush=True)
