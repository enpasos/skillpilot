from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil, os

ROOT=Path.cwd().resolve()
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1')
OWN=ROOT/REL
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1'
ISO=ROOT/'tmp/chemie-q1-acids-soaps-preservatives-twenty-native-isolated-20261005-v1'
def read(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert not ISO.exists(), 'No overwriting an existing preparation'
ISO.mkdir(parents=True)
code=[]
for rel in ['app/scripts','scripts']:
 shutil.copytree(ROOT/rel,ISO/rel,symlinks=False)
 for p in sorted((ROOT/rel).rglob('*')):
  if p.is_file(): assert sha(p)==sha(ISO/p.relative_to(ROOT));code.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p)})
for rel in ['app/src','app/node_modules','docs','contracts']:
 p=ISO/rel;p.parent.mkdir(parents=True,exist_ok=True);p.symlink_to(ROOT/rel,target_is_directory=True)
for rel in ['curricula','app/public','backend/src/main/resources/static']:
 for directory,_,files in os.walk(ROOT/rel,followlinks=False):
  d=Path(directory);target=ISO/d.relative_to(ROOT);target.mkdir(parents=True,exist_ok=True)
  for name in files:
   dst=target/name
   if not dst.exists() and not dst.is_symlink():dst.symlink_to(d/name)
for rel in ['app/package.json','app/tsconfig.json','app/tsconfig.node.json','package.json','AGENTS.md','LICENSING.md','LICENSE']:
 if (ROOT/rel).exists():
  dst=ISO/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(ROOT/rel)
base=read(BASE/'prepared-prospective-input-tree.receipt.json')
for row in base['files']:
 src=ROOT/row['prospectiveCopyPath'];assert 'sha256:'+sha(src)==row['sha256']
 dst=ISO/row['futureActivePath'];dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.is_symlink():dst.unlink()
 shutil.copy2(src,dst);assert not dst.is_symlink() and sha(dst)==sha(src)
canpath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical=read(ISO/canpath);goals={g['id']:g for g in canonical['goals']}
clusters=['55f35372-d7a3-5299-bf9e-9828d6720366','66fcf3e4-771f-5092-95fb-949087d6d3d5','47a40c98-ab20-5246-85e3-3abe5a9e95ed']
def leaves(i):
 g=goals[i]
 return sum([leaves(c) for c in g.get('contains',[])],[]) if g.get('contains') else [i]
descendants=list(dict.fromkeys(sum([leaves(i) for i in clusters],[])))
reportpath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-gel-current-integration-v1/central-after-gel-current-v.report.json'
report=read(ROOT/reportpath);chem=next(s for s in report['subjects'] if s['subject']=='chemie')
closed=set(chem['strictCompleteGoalIds']);current=set(chem['currentGoalIds']);ids=[i for i in descendants if i not in closed]
ledgerpath='curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'
ledger=read(ROOT/ledgerpath);reserved=set();reservations=[]
for p in ledger['activeBatchConfigPaths']:
 cfg=read(ROOT/p);reserved.update(cfg['goalIds']);reservations.append({'path':p,'sha256':sha(ROOT/p),'goalIds':cfg['goalIds']})
assert len(ids)==20 and all(i in current and i not in reserved for i in ids)
qa=read(ISO/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');q={r['goalId']:r for r in qa['records']}
assets=[];detached=[]
for i in ids:
 g=goals[i];images=[r for r in g.get('resourceLinks',[]) if r.get('type')=='goal-visualization' and r.get('resourceType')=='image']
 for image in images:
  public='app/public'+image['url'] if image['url'].startswith('/assets/') else None
  if not public:continue
  p=ISO/public
  if p.is_symlink():p.unlink();shutil.copy2(ROOT/public,p)
  assert not p.is_symlink()
  assets.append({'goalId':i,'resourceLink':image,'publicPath':public,'sha256':'sha256:'+sha(p),'qaRecord':q.get(i)})
 # Native importer writes these actual names; detach before any future imports.
 source=ISO/'curricula/DE/Gymnasium/visualizations/chemie'/i
 for name in ['prompt.de.md','image-reconstruction-prompt.de.md']:
  p=source/name
  if p.is_symlink():p.unlink();shutil.copy2(ROOT/p.relative_to(ISO),p);detached.append(str(p.relative_to(ISO)))
write(OWN/'selection-and-base.actual.receipt.json',{'status':'PASS_current20_unclosed_unreserved','authority':'informed_author_candidate','reportPath':reportpath,'reportSHA256':sha(ROOT/reportpath),'currentChemistryStrictCount':len(closed),'currentChemistryAtomicCount':len(current),'clusters':clusters,'all21Descendants':descendants,'goalIds':ids,'excludedAlreadyStrictGoalIds':[i for i in descendants if i in closed],'actualReservations':reservations,'reservedIntersection':sorted(set(ids)&reserved),'basePreparedFreezePath':str((BASE/'prepared.freeze.manifest.json').relative_to(ROOT)),'basePreparedFreezeSHA256':sha(BASE/'prepared.freeze.manifest.json'),'baseFutureInputFiles':base['files'],'baseFutureCanonicalSHA256':sha(ISO/canpath),'b014FiveFutureDeltasPreserved':True,'strictNetDelta':0,'activeWrites':0})
write(OWN/'twenty-current-goals.before.snapshot.json',{'authority':'informed_author_input_snapshot','goals':[goals[i] for i in ids]})
write(OWN/'seventeen-assets-and-qa.before.snapshot.json',{'assets':assets,'existingImageCount':len(assets),'missingImageGoalIds':[i for i in ids if i not in {a['goalId'] for a in assets}],'pixelChanges':0,'notNewVisualApproval':True})
write(OWN/'isolation-and-native-code-baseline.receipt.json',{'isolationRoot':str(ISO),'createdAtUTC':datetime.now(timezone.utc).isoformat(),'copiedNativeCodeFiles':code,'overlay69FutureInputFilesDetached':len(base['files']),'actualNativePromptPathsDetached':detached,'selectedKEEPpublicAssetsDetached':assets,'activeWrites':0,'historicalFilesMutated':0,'strictNetDelta':0})
print(json.dumps({'selected':len(ids),'closedExcluded':len(descendants)-len(ids),'unreserved':True,'nativeFiles':len(code),'baseInputs':len(base['files']),'images':len(assets),'missing':[i for i in ids if i not in {a['goalId'] for a in assets}],'isolation':str(ISO)}))
