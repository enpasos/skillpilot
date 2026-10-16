# SPDX-License-Identifier: Apache-2.0
"""Remove only this new unsealed capsule's generated redundant files; keep all sources."""
import hashlib,json,shutil
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1]
plan=json.loads((OWN/'checks/INPUTS.no-render-stock-context.plan.technical.json').read_text());host=REPO/plan['host']
assert host==REPO/'tmp/chemie-m7-resumed-20261015/source4-no-render-stock-context-capsule-v1'
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
regular=[p for p in host.rglob('*') if p.is_file() and not p.is_symlink()]
assert {p.relative_to(host).as_posix() for p in regular}=={r['path'] for r in plan['stockPhysicalModules']}
for r in plan['stockPhysicalModules']:assert ref(host/r['path'])['sha256']==r['sha256']
removed=[]
for name in ['base367-selected-P-records.original-whole-lines.exact.jsonl','prospective-wording.selected-records.raw-technical.jsonl','prospective-raw-D4.selected-records.raw-technical.jsonl']:
 p=OWN/'profiles'/name
 if p.exists():
  rows=[json.loads(l) for l in p.read_text().splitlines() if l.strip()];assert len(rows)==392
  removed.append(ref(p));p.unlink()
# No raster/PDF has ever been copied into this private capsule; all remaining data entries are links.
shutil.rmtree(host);host.mkdir()
for p in REPO.iterdir():
 if p.name not in ['app','tmp','.git']:(host/p.name).symlink_to(p,target_is_directory=p.is_dir())
(host/'app').mkdir()
for p in (REPO/'app').iterdir():
 if p.name not in ['scripts','public']:(host/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
(host/'app/scripts').mkdir();(host/'app/public').mkdir()
def branch(p):
 if p.is_symlink():
  children=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
def install(src,relative,physical=False):
 p=host/relative;parent=host
 for s in p.relative_to(host).parts[:-1]:parent/=s;branch(parent)
 if p.is_symlink() or p.is_file():p.unlink()
 if physical:shutil.copyfile(src,p)
 else:p.symlink_to(src)
for r in plan['stockPhysicalModules']:install(REPO/r['path'],r['path'],True)
aliases=[]
for r in plan['normalReadOnlyAliases']:
 if r['normalHostAlias'] not in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']:continue
 install(REPO/r['physicalRepositorySource']['path'],r['normalHostAlias']);aliases.append(r)
assets=[]
for r in plan['assets']:
 if r['goalId'] not in plan['targetGoalIds']:continue
 for k in ['normalCanonicalDestination','normalPublicDestination']:install(REPO/r['physicalRepositorySource']['path'],r[k])
 assets.append(r)
review=host/'curricula/DE/Gymnasium/quality/goal-visualization-review';assert review.is_symlink();review.unlink();review.mkdir()
receipt={'role':'Bounded own unsealed redundant diagnostic-cache minimization only; no source/old host deletion','removedOwnGeneratedAll392Files':removed,'allOriginal392SourceLedgersPreserved':True,'originalFirstFailure':'Stock goalBookModel rejected unneeded record309 2a8a13b8-f96a-5ff1-92fa-fe6c19973a0e as stale reviewInputFingerprint; its legitimate original P resource scope differs from goalBookModel QA-resource assumptions. No negative science inference.','initialDiagnosticExitCode':1,'fix':'Load only the four relevant exact P records into the goalBookModel; audit all392 unchanged original P bindings separately under their own resource scopes.','physicalStockModules':31,'normalAliasRefs':len(aliases),'targetAssetReferenceRows':len(assets),'rasterCopies':0,'prepareRuns':0,'nativeRendererRuns':0}
(OWN/'checks/FIX.actual-minimal-capsule-and-finite-profile-scope.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'ownUnsealedGeneratedBytesFreed':sum(r['bytes'] for r in removed),'aliasRefs':len(aliases),'targetRasterRefs':len(assets),'imageCopies':0}))
