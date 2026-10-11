from pathlib import Path
import json, hashlib, datetime, sys
root=Path.cwd();out=Path(sys.argv[1]);cfg=json.loads((out/'twelve-current-deferrals.native-batch.config.json').read_text());ids=set(cfg['goalIds']);book=json.loads(Path(cfg['baseGoalBookConfigPath']).read_text())
regpath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
reg=json.loads(Path(regpath).read_text());econ=next(x for x in reg['subjects'] if x['subject']=='wirtschaftswissenschaften')
scope=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-twelve-historical-D-deferrals-current-contract-author-and-source-scope-READONLY-v1')
paths={regpath,cfg['baseGoalBookConfigPath'],book['landscapePath'],book['compositionViewPath'],book['semanticKindLedgerPath'],book['goalVisualizationQaPath'],*book['evidenceReviewPaths'],cfg['promptPath'],cfg['criteriaPath'],str(out/'twelve-current-deferrals.native-batch.config.json'),str(out/'capture-native-full346-base-selected12-context.AUTHOR-INERT.mts')}
for n in ['SEALED-twelve-historical-D-deferrals-current-contract-P-source-and-authorship.SCOPING.READONLY.json','actual-twelve-original-deferrals-current-whole-contracts-P-and-authorship.READONLY.json','actual-twelve-current-source-edges-atoms-parents-and-partial-boundaries.READONLY.json']:
 paths.add(str(scope/n))
for p in (root/'app/scripts').rglob('*.ts'):
 if p.is_file():paths.add(str(p.relative_to(root)))
for d in ['contracts/goal-description-review','contracts/goal-book','contracts/goal-evidence']:
 for p in (root/d).rglob('*.json'):paths.add(str(p.relative_to(root)))
selectedConfigs=[]
for p in econ['positiveEvidenceConfigPaths']:
 pc=json.loads(Path(p).read_text())
 if not ids.intersection(pc.get('scope',{}).get('goalIds',[])):continue
 selectedConfigs.append(p);paths.add(p)
 for key in ['reviewPath','reviewCriteriaPath','semanticKindLedgerPath','landscapePath']:
  if isinstance(pc.get(key),str):paths.add(pc[key])
can=json.loads(Path(book['landscapePath']).read_text())
for g in can['goals']:
 if g['id'] not in ids:continue
 for r in g.get('resourceLinks',[]):
  u=r.get('url','')
  if u.startswith('/') and not u.startswith('//'):
   p='app/public'+u
   if Path(p).is_file():paths.add(p)
sourceContexts=json.loads((scope/'actual-twelve-current-source-edges-atoms-parents-and-partial-boundaries.READONLY.json').read_text())['goalSourceContexts']
for contexts in sourceContexts.values():
 for row in contexts:paths.update([row['mappingPath'],row['sourceExtractionPath']])
scopeBindings=json.loads((scope/'actual-scoping-input-before-after-bindings.READONLY.json').read_text())['inputBindings']
for b in scopeBindings:
 if b['path'].startswith('curricula/DE/Gymnasium/mapping/') or b['path'].startswith('curricula/DE/Gymnasium/source-extraction/'):
  paths.add(b['path'])
bind=[]
for p in sorted(paths):
 b=Path(p).read_bytes();bind.append({'path':p,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
a={'observedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'bindings':bind,'selectedCurrentPositiveConfigPaths':selectedConfigs,'activeWrites':0,'descriptionVerdicts':0}
(out/'inputs-before-native-preparation.bindings.json').write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'guardPaths':len(bind),'selectedPConfigs':len(selectedConfigs),'goalCount':len(ids)}))
