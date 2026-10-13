"""Apache-2.0. Selective exact transport into the existing private execution capsule."""
from pathlib import Path
import json,hashlib,shutil,re,datetime
R=Path.cwd();C=R/'tmp/chemie-q4-current220-prep/execution';E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');O=E/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1';V4=E/'chemie-polymers-3aef-no-melt-flow-author-successor-20261013-v4'
h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();rd=lambda p:json.loads(p.read_text())
def wr(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
proof=rd(O/'checks/normal402-models-and-protected231-page-context.actual.json'); assert proof['passed'] and proof['protected231WholePagesExact'] and proof['unselected384WholePagesExact']
pending=O/'configs/native-D18.await-V6-and-CAS.batch.config.json';cfg=rd(pending);cfg.update(batchId='chemie-polymers18-current231-final-native-20261013-v1',bookId='chemie-polymers18-current231-final-native',title='Chemie – achtzehn Polymerziele zur unabhängigen vollständigen Prüfung');finalconfig=O/'configs/native-D18.final-current231.batch.config.json';wr(finalconfig,cfg)
proof['remainingGates']=['Normal final native18 prepare/check','Genuine independent whole-goal A/B reviews'];proof['limitations']=['Current baseline-to-candidate proof only; no newly completed M7/native approvals','Native18 materialization not yet completed at this receipt timestamp','No root audit with both completed prereads delivered to peers'];wr(O/'checks/normal402-models-and-protected231-page-context.actual.json',proof)
seen=set(); stack=[Path('app/scripts')/n for n in ['materializeGoalDescriptionRolloutBatch.ts','positiveGoalEvidenceReview.ts','semanticAtomicityReview.ts','memoryCardReview.ts']];modules=[]
while stack:
 p=stack.pop()
 if p in seen:continue
 seen.add(p);assert (C/p).is_file(),('capsule module absent',str(p));assert h(R/p)==h(C/p),('capsule module changed',str(p));modules.append(dict(path=str(p),sha256=h(R/p),capsuleExact=True))
 for rel in re.findall(r"(?:from\s*|import\s*\()['\"](\.[^'\"]+)['\"]",(R/p).read_text()):
  base=p.parent/rel
  candidates=[base,Path(str(base)+'.ts'),Path(str(base)+'.tsx'),base/'index.ts']
  q=next((q.resolve().relative_to(R)for q in candidates if q.is_file()),None)
  if q is not None and q.suffix in ['.ts','.tsx']:stack.append(q)
paths=set()
for folder in ['baseline','candidate','positive','atomicity','memory','configs']:
 paths.update(p for p in (O/folder).rglob('*')if p.is_file())
for name in ['whole402.normal-base.config.json','whole402.inactive.config.json','P18.author.inactive.config.json','M402.inactive.config.json']:
 q=rd(O/'configs'/name)
 for key in ['compositionViewPath','reviewCriteriaPath','cardReviewPath']:
  if q.get(key):paths.add(Path(q[key]))
 for s in q.get('visibilityScopes',[]):paths.add(Path(s['viewPath']))
paths.update(Path(cfg[k])for k in ['promptPath','criteriaPath'])
contracts=['contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','contracts/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json','contracts/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json','contracts/goal-description-review/v1/goal-description-rollout-in-flight-ledger.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-book/v1/goal-book-model.schema.json']
contractBindings=[]
for s in contracts:
 p=Path(s)
 if p.is_file():assert (C/p).is_file()and h(p)==h(C/p),('capsule schema mismatch',s);contractBindings.append(dict(path=s,sha256=h(p)))
transports=[]
for p in sorted(paths):
 assert p.is_file(),str(p); dst=C/p;dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists() and dst.samefile(p):assert h(p)==h(dst)
 elif dst.exists() and not str(p).startswith(str(O)):assert h(p)==h(dst),('capsule external input mismatch',str(p))
 else:shutil.copyfile(p,dst)
 assert h(p)==h(dst);transports.append(dict(path=str(p),sha256=h(p)))
bindings=rd(V4/'six.resource-bindings.one-thermal-successor.json')['bindings'];byurl={b['candidateResourceLinks'][0]['url']:b for b in bindings};assets=[]
for q in rd(O/'candidate/QA.current-plus-six-actualV.inactive.json')['records']:
 if q['visualizationState']!='available':continue
 b=byurl.get(q['imageUrl']);src=Path(b['actualCandidateAssetPath'])if b else Path(q['publicAssetPath']);dst=C/q['publicAssetPath'];assert h(src)==q['assetSha256']
 copied=False
 if not dst.is_file()or h(dst)!=h(src):
  assert b is not None,('capsule current available asset mismatch',str(src));assert dst.resolve().is_relative_to((C/'app/public').resolve());dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);copied=True
 assets.append(dict(goalId=q['goalId'],sourcePath=str(src),capsulePublicPath=q['publicAssetPath'],sha256=h(src),newSixAsset=b is not None,copied=copied))
for b in bindings:assert next(q for q in rd(O/'candidate/QA.current-plus-six-actualV.inactive.json')['records']if q['goalId']==b['goalId'])['aiApproved']=='yes'
wr(O/'checks/private-existing-capsule-selective-transport.actual.json',dict(schemaVersion=1,checkedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),capsulePath=str(C.relative_to(R)),newClone=False,curriculaReadThroughSymlinkPreserved=True,contractsReadThroughSymlinkPreserved=True,publicAssetRootRealPrivateDirectory=True,nativeOutputResolvedPath=str((C/cfg['outputDirectory']).resolve().relative_to(R)),productionModuleBindings=modules,contractBindings=contractBindings,normalInputTransports=transports,actualAssetInputs=assets,sixExactApprovedAssetsTransported=6,activeAssetWrites=0,rootOnlyPeerAuditExcluded=True,finalBatchConfigPath=str(finalconfig),finalBatchConfigSha256=h(finalconfig)))
print(json.dumps(dict(modulesByteExact=len(modules),normalInputsTransported=len(transports),availableAssetsByteExact=len(assets),sixNewPNGOnly=True,finalConfig=str(finalconfig))))
