import json,datetime,hashlib
from pathlib import Path
from collections import Counter,defaultdict
root=Path('/home/enpasos/projects/skillpilot');out=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-inquiry-targeted-continuation-candidate-v1'
ids=[g['goalId'] for g in json.loads((out/'D-findings.frozen.json').read_text())['goals']]
configpath=root/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json';cfg=json.loads(configpath.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
bindings=[];files=[];missing=[]
for path in cfg['mappingPaths']:
 p=root/path;j=json.loads(p.read_text());rows=[m for m in j.get('mappings',[]) if m.get('canonicalGoalId') in ids]
 if not rows:continue
 ep=j.get('sourceExtractionPath');ex=json.loads((root/ep).read_text())if ep and (root/ep).is_file()else None
 sg={g['id']:g for g in ex.get('sourceGoals',[])}if ex else {}
 f={'path':path,'byteDigest':sha(p),'sourceLandscapeId':j.get('sourceLandscapeId'),'targetLandscapeId':j.get('targetLandscapeId'),'sourceExtractionPath':ep,'sourceExtractionByteDigest':sha(root/ep)if ep and(root/ep).is_file()else None,'selectedDirectMappingCount':len(rows)};files.append(f)
 for r in rows:
  g=sg.get(r.get('legacyGoalId'))
  if ex and not g:missing.append({'mappingPath':path,'sourceGoalId':r.get('legacyGoalId')})
  bindings.append({'mappingPath':path,'mapping':r,'source':{k:g.get(k)for k in ['id','passageId','topicCode','title','sourceSpan','sourceRef','courseLevel']}if g else None})
sums=[]
for id in ids:
 rows=[b for b in bindings if b['mapping']['canonicalGoalId']==id]
 c=Counter(Path(b['mappingPath']).parts[4]for b in rows)
 sums.append({'goalId':id,'directMappingCount':len(rows),'mappingFileCount':len(set(b['mappingPath']for b in rows)),'jurisdictionCounts':dict(c),'preservationStatus':'open_per_source_clause_after_any_semantic_or_stage_split; no mappings changed'})
obj={'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'configuredAtlasInputPath':str(configpath.relative_to(root)),'configuredAtlasInputByteDigest':sha(configpath),'scope':'All direct selected-goal mappings in the actual current national chemistry atlas mappingPaths, supplementary to the focused live BY primary-source examination frozen earlier. This inventory is no fresh subject-matter or source approval.','noNewDFindingsOrClosure':True,'activeMappingInputsInspected':len(cfg['mappingPaths']),'selectedMappingFiles':files,'selectedGoalSummary':sums,'sourceGoalLookupFailures':missing,'directBindings':bindings,'limitations':['The frozen D reasoning checks the actual BY clauses in depth. Other current national mappings are preserved here as exact source-bound coverage obligations, not claimed independently fachlich verified.','A partial mapping is not evidence that one smaller candidate covers the entire original source clause.','Before any root integration, review affected source clauses across all listed jurisdictions and align source applicability/stage with the chosen competencies.']}
(out/'national-current-source-binding-inventory.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print('Configured mapping inputs',len(cfg['mappingPaths']),'selected files',len(files),'direct selected bindings',len(bindings),'lookup failures',len(missing))
for s in sums:print(s['goalId'][:8],s['directMappingCount'],s['jurisdictionCounts'])
