"""Build a sparse ignored host from exact repository CAS. Technical only."""
from pathlib import Path
import json,hashlib,shutil,os
R=Path.cwd().resolve();O=Path(__file__).resolve().parents[1];REL=O.relative_to(R).as_posix();E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
A=E/'chemie-carbonyl-pharmacy15-current422-whole-material-author-20261015-v1';T=E/'chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1'
M=E/'chemie-energy18-current422-bounded-inactive-integration-technical-20261015-v1/checks/REBUILD.energy18-final.physical-exact-map.v3.json'
assert not (O/'FILES.finite-carbonyl15-native-technical.seal.json').exists()
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def art(p):return {'path':p.relative_to(R).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def verified(d):
 p=R/d['path'];assert art(p)=={k:d[k] for k in ['path','sha256','bytes']},p;return p
assert sha(A/'FINAL.carbonyl15-current422-inactive-author.json')=='sha256:c0b6b35e36bcdb0af71c74abdc7c50996f86b54aa9e8393fbf75549f7bd98c5c'
assert sha(A/'FILES.finite-author15.seal.json')=='sha256:78df03bde7ad70e9732e797f5d085f264e30cebd29db95b03ab2aa559931a2cd'
author=json.loads((A/'FINAL.carbonyl15-current422-inactive-author.json').read_text());ids=author['goalIds'];assert len(ids)==15
source=json.loads(M.read_text());old_host=R/'tmp/chemie-m7-resumed-20261015/energy-four-final-contexts-current422-native560-host-v1';new_host=R/'tmp/chemie-m7-resumed-20261015/carbonyl15-current422-native560-host-v1';assert not new_host.exists()
mapping={'schemaVersion':1,'role':'Carbonyl15 prepare/check only; current whole560/semantic560; no new science votes','executionHost':new_host.relative_to(R).as_posix(),'sourceCurrent338PhysicalMap':art(M),'sourceFourNativePreparationTemplate':art(T/'scripts/prepare_sparse_four.py'),'aliases':source['aliases'],'selectedCurrentAssetRows':source['selectedCurrentAssetRows'],'stockPhysicalModules':source['stockPhysicalModules'],'selectedFifteenGoalIds':ids,'sharedReadOnlyPublicRoot':(old_host/'app/public').relative_to(R).as_posix(),'sharedHostRequiredForFreshRebuild':False,'publicFallback':'If the old public root is absent, install current global immutable symlinks from each exact physicalRepositorySource. Only selected15 public images are physical copies.','legacyQaDispositionDiscoveryInput':source['legacyQaDispositionDiscoveryInput'],'normalAliasFilesMustBePhysical':True,'legacyQaDispositionPolicy':'Empty legacy disposition discovery input; no old reviewer judgments imported into neutral scientific inputs','buildReceiptPath':'checks/HOST.actual-sparse-fifteen.json','physicalPublicSelectedCount':15,'physicalPublicSelectedBytes':sum(r['physicalRepositorySource']['bytes'] for r in source['selectedCurrentAssetRows'] if r['goalId'] in ids),'unselectedPublicLeaves':'Exact immutable read-through from old public where matching, otherwise immutable symlinks to current repository CAS','fullTreeCopies':0,'hardlinksCreated':0,'mainOrEarlierHostWrites':0,'physicalHostByteLimit':48*1024*1024,'normalStockCommands':['prepare','check'],'newScientificVotes':0,'centralAllowed':False}
for row in mapping['aliases']:
 if row['normalHostAlias']=='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':assert row['physicalRepositorySource']==author['currentWholeCanonical']
 if row['normalHostAlias']=='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json':assert row['physicalRepositorySource']==author['currentSemanticLedger']
for row in mapping['selectedCurrentAssetRows']:row['publicMustBePhysicalWithinHostPublicRoot']=row['goalId'] in ids
assert len(mapping['stockPhysicalModules'])==31 and len(mapping['selectedCurrentAssetRows'])==434
for row in mapping['stockPhysicalModules']:verified(row)
for row in mapping['aliases']:verified(row['physicalRepositorySource'])
new_host.mkdir(parents=True)
for p in R.iterdir():
 if p.name not in ('app','tmp','.git'):(new_host/p.name).symlink_to(p,target_is_directory=p.is_dir())
(new_host/'app').mkdir()
for p in (R/'app').iterdir():
 if p.name not in ('scripts','public'):(new_host/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
(new_host/'app/scripts').mkdir()
if (old_host/'app/public').is_dir():(new_host/'app/public').symlink_to(old_host/'app/public',target_is_directory=True)
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
shared_selected_before=[];unselected_retargeted=[]
for row in mapping['selectedCurrentAssetRows']:
 source_file=verified(row['physicalRepositorySource']);old_public=old_host/row['normalPublicDestination']
 if row['goalId'] in ids and old_public.is_file():shared_selected_before.append({'normalPublicDestination':row['normalPublicDestination'],'sha256':sha(old_public),'bytes':old_public.stat().st_size})
 install(source_file,row['normalCanonicalDestination'],False)
 if row['goalId'] in ids:install(source_file,row['normalPublicDestination'],True)
 else:
  pub=new_host/row['normalPublicDestination']
  if not pub.is_file() or sha(pub)!=row['physicalRepositorySource']['sha256']:
   install(source_file,row['normalPublicDestination'],False);unselected_retargeted.append(row['goalId'])
legacy=verified(mapping['legacyQaDispositionDiscoveryInput']);assert json.loads(legacy.read_text())['rows']==[]
review=new_host/'curricula/DE/Gymnasium/quality/goal-visualization-review';parent=new_host
for part in review.relative_to(new_host).parts[:-1]:parent/=part;branch(parent)
if review.is_symlink():review.unlink();review.mkdir()
else:assert not review.exists() or list(review.iterdir())==[]
write(O/'checks/REBUILD.carbonyl15-current422.physical-map.json',mapping)
base=json.loads((T/'config/whole422.normal-stock-base.config.json').read_text());base.update({'bookId':'chemie-carbonyl15-contexts-full560-20261015-v1','title':'Chemie – Carbonylreaktionen und Pharmazie','evidenceReviewPaths':[(A/'author/P15.normal-v2.raw-E0G0.author-inputs.jsonl').relative_to(R).as_posix()],'outputPath':REL+'/candidate/full422.in-memory-only.not-materialized.json'})
write(O/'config/whole422.normal-stock-base.config.json',base)
config=json.loads((T/'config/native4.normal-prepare-only.config.json').read_text());config.update({'batchId':'chemie-carbonyl15-current422-native560-20261015-v1','bookId':'chemie-carbonyl15-current422-native560-20261015-v1','title':'Chemie – Carbonylreaktionen und Pharmazie','baseGoalBookConfigPath':REL+'/config/whole422.normal-stock-base.config.json','goalIds':ids,'outputDirectory':REL+'/native15'})
write(O/'config/native15.normal-prepare-only.config.json',config)
physical=[p for p in new_host.rglob('*') if p.is_file() and not p.is_symlink()];size=sum(p.stat().st_size for p in physical);assert size<mapping['physicalHostByteLimit']
write(O/'checks/HOST.actual-sparse-fifteen.json',{'host':mapping['executionHost'],'sharedReadOnlyPublic':mapping['sharedReadOnlyPublicRoot'],'physicalStockModules':31,'normalPhysicalAliases':len(mapping['aliases']),'physicalSelectedImages':15,'globalAssetReferences':len(mapping['selectedCurrentAssetRows']),'physicalFiles':len(physical),'physicalBytes':size,'physicalByteLimit':mapping['physicalHostByteLimit'],'unselectedRetargetedToExactImmutableSource':unselected_retargeted,'sharedSelectedPublicBefore':shared_selected_before,'fullTreeCopies':0,'sharedWrites':0,'newScientificVotes':0})
print(json.dumps({'host':mapping['executionHost'],'physicalBytes':size,'modules':31,'images':15,'sourceGlobalAssets':434,'aliases':len(mapping['aliases'])}))
