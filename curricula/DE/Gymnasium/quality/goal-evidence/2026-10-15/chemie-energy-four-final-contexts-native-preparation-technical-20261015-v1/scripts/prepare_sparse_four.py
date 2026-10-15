from pathlib import Path
import json, hashlib, shutil

R=Path.cwd(); O=Path(__file__).resolve().parents[1]; REL=O.relative_to(R).as_posix()
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
V=E/'chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1'
A=E/'chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1'
assert not (O/'FILES.finite-four-native-technical.seal.json').exists()
def art(p):return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(p,d):
    p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def verified(d):
    p=R/d['path'];assert art(p)==d,p;return p
ids=json.loads((A/'AUTHOR.actual-three-wording-four-alt.json').read_text())['altGoalIds']
mapping=json.loads((V/'checks/REBUILD.final-native560-alt-only.physical-map.json').read_text())
old_host=R/mapping['executionHost'];new_host=R/'tmp/chemie-m7-resumed-20261015/energy-four-final-contexts-current422-native560-host-v1'
assert not new_host.exists()
mapping['sourceV3PhysicalMap']=art(V/'checks/REBUILD.final-native560-alt-only.physical-map.json')
mapping['executionHost']=new_host.relative_to(R).as_posix();mapping['sharedReadOnlyV3Host']=old_host.relative_to(R).as_posix()
mapping['role']='Four selected final contexts only;whole560 semantic560 and422ordinary retained;no scientific votes'
mapping['buildReceiptPath']='checks/HOST.actual-sparse-four.json'
mapping['selectedFourGoalIds']=ids
for row in mapping['aliases']:
    if row['normalHostAlias']=='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':row['physicalRepositorySource']=art(A/'candidate/canonical560.current422.three-wording-four-alt.author.json')
for row in mapping['selectedCurrentAssetRows']:
    row['publicMustBePhysicalWithinHostPublicRoot']=row['goalId'] in ids
mapping['physicalPublicSelectedCount']=4
mapping['physicalPublicSelectedBytes']=sum(r['physicalRepositorySource']['bytes'] for r in mapping['selectedCurrentAssetRows'] if r['goalId'] in ids)
for row in mapping['stockPhysicalModules']:verified(row)
for row in mapping['aliases']:verified(row['physicalRepositorySource'])
new_host.mkdir(parents=True)
for p in R.iterdir():
    if p.name not in ('app','tmp','.git'):(new_host/p.name).symlink_to(p,target_is_directory=p.is_dir())
(new_host/'app').mkdir()
for p in (R/'app').iterdir():
    if p.name not in ('scripts','public'):(new_host/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
(new_host/'app/scripts').mkdir()
if old_host.is_dir():(new_host/'app/public').symlink_to(old_host/'app/public',target_is_directory=True)
else:(new_host/'app/public').mkdir()
def branch(p):
    if p.is_symlink():
        children=list(p.resolve().iterdir());p.unlink();p.mkdir()
        for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
    elif not p.exists():p.mkdir()
    assert p.is_dir() and not p.is_symlink()
def install(source,relative,physical):
    target=new_host/relative;parent=new_host
    for part in target.relative_to(new_host).parts[:-1]:parent/=part;branch(parent)
    if target.is_file() or target.is_symlink():target.unlink()
    else:assert not target.exists(),target
    if physical:shutil.copyfile(source,target)
    else:target.symlink_to(source)
for row in mapping['stockPhysicalModules']:install(verified(row),row['path'],True)
for row in mapping['aliases']:install(verified(row['physicalRepositorySource']),row['normalHostAlias'],True)
for row in mapping['selectedCurrentAssetRows']:
    source=verified(row['physicalRepositorySource'])
    install(source,row['normalCanonicalDestination'],False)
    if row['goalId'] in ids:install(source,row['normalPublicDestination'],True)
    else:
        if not (new_host/row['normalPublicDestination']).is_file():install(source,row['normalPublicDestination'],False)
legacy=verified(mapping['legacyQaDispositionDiscoveryInput']);assert json.loads(legacy.read_text())['rows']==[]
review=new_host/'curricula/DE/Gymnasium/quality/goal-visualization-review';parent=new_host
for part in review.relative_to(new_host).parts[:-1]:parent/=part;branch(parent)
assert review.is_symlink();review.unlink();review.mkdir()
write(O/'checks/REBUILD.four-final-contexts.physical-map.json',mapping)
base=json.loads((V/'config/whole422.normal-stock-base.config.json').read_text())
base.update({'bookId':'chemie-four-final-contexts-full560-20261015-v1','title':'Chemie – vier finale Autorenkontexte','evidenceReviewPaths':[(A/'candidate/twenty-author-E0G0.two-targeted-briefs-four-input-bindings.jsonl').relative_to(R).as_posix()],'outputPath':REL+'/candidate/full422.in-memory-only.not-materialized.json'})
write(O/'config/whole422.normal-stock-base.config.json',base)
config=json.loads((V/'config/native20.normal-prepare-only.config.json').read_text())
config.update({'batchId':'chemie-four-final-contexts-current422-native560-20261015-v1','bookId':'chemie-four-final-contexts-current422-native560-20261015-v1','title':'Chemie – vier finale Autorenkontexte','baseGoalBookConfigPath':REL+'/config/whole422.normal-stock-base.config.json','goalIds':ids,'outputDirectory':REL+'/native-four'})
write(O/'config/native4.normal-prepare-only.config.json',config)
shutil.copyfile(V/'candidate/semantic560.exact-no-change.json',O/'candidate/semantic560.exact-no-change.json') if (O/'candidate').exists() else ((O/'candidate').mkdir(),shutil.copyfile(V/'candidate/semantic560.exact-no-change.json',O/'candidate/semantic560.exact-no-change.json'))
physical=[p for p in new_host.rglob('*') if p.is_file() and not p.is_symlink()]
assert sum(p.stat().st_size for p in physical)<30*1024*1024
write(O/'checks/HOST.actual-sparse-four.json',{'host':mapping['executionHost'],'sharedReadOnlyV3Public':mapping['sharedReadOnlyV3Host'],'physicalStockModules':31,'normalPhysicalAliases':len(mapping['aliases']),'physicalSelectedImages':4,'globalAssetReferences':len(mapping['selectedCurrentAssetRows']),'physicalFiles':len(physical),'physicalBytes':sum(p.stat().st_size for p in physical),'fullTreeCopies':0,'sharedWrites':0,'newScientificVotes':0})
print(json.dumps({'host':mapping['executionHost'],'physicalBytes':sum(p.stat().st_size for p in physical),'modules':31,'images':4,'sourceGlobalAssets':434}))
