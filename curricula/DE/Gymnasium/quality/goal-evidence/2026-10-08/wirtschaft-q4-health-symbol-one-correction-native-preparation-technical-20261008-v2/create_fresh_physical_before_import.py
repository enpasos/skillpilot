# Apache-2.0. Fresh physical one-page successor isolate before any import; no changes to historical review environments.
from pathlib import Path
import json,hashlib,datetime,tempfile,shutil
root=Path('/home/enpasos/projects/skillpilot');b=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08');own=b/'wirtschaft-q4-health-symbol-one-correction-native-preparation-technical-20261008-v2';prior=b/'wirtschaft-q4-twenty-seven-native-preparation-technical-20261008-v1';old=Path('/tmp/skillpilot-wirtschaft-q4-twenty-seven-native-1msa7bpb');author=b/'wirtschaft-q4-development-ethics-twenty-seven-bilingual-positive-author-v2'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json';BASE='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1';SEM=BASE+'/wirtschaftswissenschaften.semantic-kinds.json'
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
frozen=[]
for name in['native-d-q4-development-seventeen-final.prepared-freeze.actual.json','native-d-q4-ethics-development-ten-final.prepared-freeze.actual.json']:frozen.extend(read(root/prior/name)['byteExactReturnedNativeFiles'])
assert len(frozen)==56
for f in frozen:assert sha(root/f['path'])==sha(old/f['path'])==f['sha256']
iso=Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-q4-health-symbol-one-native-'));bindings=[]
def copy(p):
 source=old/p;target=iso/p;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target);assert source.read_bytes()==target.read_bytes();bindings.append({'path':str(p),'sha256':sha(source),'bytes':source.stat().st_size})
for folder in['app/scripts','app/src','contracts']:
 shutil.copytree(old/folder,iso/folder)
 for p in(old/folder).rglob('*'):
  if p.is_file():assert sha(p)==sha(iso/p.relative_to(old))
(iso/'app/node_modules').symlink_to(root/'app/node_modules',target_is_directory=True)
for p in['app/package.json','app/tsconfig.json',CAN,QA,SEM,BASE+'/review-book-full.config.json',BASE+'/review-full-canonical.view.json','curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','scripts/import_goal_visualization.mjs','scripts/goal_visualization_common.mjs','scripts/goal_visualization_scope.mjs','LICENSING.md']:copy(p)
for name in['goal-ids.json','whole-goals.original.json','whole-goals.candidate.json','positive.candidates.json','authoring-review.criteria.md']:copy(author/name)
for name in['positive-final-images.candidate.config.json','positive-final-images.records.candidate.jsonl','native-d-q4-development-seventeen.final.batch.config.json','native-d-q4-ethics-development-ten.final.batch.config.json']:copy(prior/name)
for f in frozen:copy(f['path'])
qa=read(old/QA);assets=[]
for r in qa['records']:
 if r['visualizationState']=='available':
  for key in['publicAssetPath','canonicalAssetPath']:
   p=r[key];assert sha(old/p)==r['assetSha256'];copy(p);assets.append({'goalId':r['goalId'],'path':p,'sha256':r['assetSha256']})
assert len(assets)==304,'Original candidate Root125+27 physical dual assets'
# Retain genuinely active current source2 context without claiming it is embedded in the D-v3 page contract.
mp=Path('curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json');sp=Path(read(root/mp)['sourceExtractionPath']);assert 'wirtschaft-q2-bw-two-current-source-location-successors-author-v1' in str(sp)
for p in[mp,sp]:
 target=iso/p;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/p,target);assert target.read_bytes()==(root/p).read_bytes()
for f in frozen:assert sha(root/f['path'])==sha(old/f['path'])==sha(iso/f['path'])==f['sha256']
for p in[CAN,QA,SEM]:assert(old/p).read_bytes()==(iso/p).read_bytes()
write(root/own/'fresh-physical-isolate-before-correction-import.actual.json',{'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'fresh_physical_technical_preparer_before_import','physicalIsolate':str(iso),'historicalPhysicalIsolate':str(old),'sourceRootStrictBaseline':125,'copiedOldFrozenFiles':frozen,'oldFrozen56Unchanged':True,'copiedPhysicalAvailableDualAssets':assets,'copiedOtherInputs':bindings,'oldMutableCanonicalQaKindBytesExactAtClone':True,'source2MappingPath':str(mp),'source2MappingSha256':sha(root/mp),'source2ExtractionPath':str(sp),'source2ExtractionSha256':sha(root/sp),'correctionImported':False,'independentApprovalClaimed':False,'activeWrites':0})
print(iso)
