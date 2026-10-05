from pathlib import Path
import json,shutil,hashlib
ROOT=Path.cwd();REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-q1-acids-soaps-preservatives-twenty-native-isolated-20261005-v1'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
sel=read(OWN/'selection-and-base.actual.receipt.json');qa=read(ISO/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');q={r['goalId']:r for r in qa['records']};goals=read(OWN/'twenty-current-goals.before.snapshot.json')['goals'];assets=[]
for g in goals:
 for image in g.get('resourceLinks',[]):
  if image.get('type')!='goal-visualization' or image.get('resourceType')!='image':continue
  public='app/public'+image['url'];p=ISO/public
  if p.is_symlink():p.unlink();shutil.copy2(ROOT/public,p)
  assert not p.is_symlink()
  row=q[g['id']];copies=[]
  for path in [public,row['canonicalAssetPath'],'backend/src/main/resources/static'+image['url']]:
   candidate=ISO/path;assert sha(candidate)==sha(p);copies.append({'path':path,'sha256':sha(candidate)})
  assets.append({'goalId':g['id'],'resourceLink':image,'publicPath':public,'sha256':sha(p),'qaRecord':row,'copies':copies,'currentTitleDescriptionBindingValid':row['title']==g['title'] and row['description']==g['description'],'currentAIAssetBindingValid':row['aiApproved']=='yes' and row['aiApprovedAssetSha256']==sha(p),'KEEPDecision':'Unchanged pixels and existing approved exact current bindings; no new image review or pixel edit.'})
assert len(assets)==17
out={'assets':assets,'existingImageCount':len(assets),'missingImageGoalIds':[i for i in sel['goalIds'] if i not in {a['goalId'] for a in assets}],'pixelChanges':0,'notNewVisualApproval':True}
(OWN/'seventeen-assets-and-qa.before.snapshot.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
baseline=read(OWN/'isolation-and-native-code-baseline.receipt.json');baseline['selectedKEEPpublicAssetsDetached']=assets;(OWN/'isolation-and-native-code-baseline.receipt.json').write_text(json.dumps(baseline,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'17ActualSelectedKEEPPublicAssetsDetached':True,'allCurrentTextAndAIAssetBindingsValid':all(x['currentTitleDescriptionBindingValid'] and x['currentAIAssetBindingValid'] for x in assets),'missing':out['missingImageGoalIds'],'activeWrites':0}))
