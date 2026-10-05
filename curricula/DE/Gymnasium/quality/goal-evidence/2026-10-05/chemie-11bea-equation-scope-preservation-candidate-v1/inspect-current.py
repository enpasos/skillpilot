import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=ROOT/'curricula/DE/Gymnasium'
OUT=Path(__file__).parent
IDS={'11bea4c6-7b8a-47e0-8293-2eb1ce34cf66','22133f29-ef02-4408-8f8d-2bbea3275d91'}
def digest(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def save(name,obj): (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
canonical_path=BASE/'canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical=json.loads(canonical_path.read_text()); goals=canonical['goals']; by={g['id']:g for g in goals}
related=set(IDS)|{'1c1420c2-a8e2-520f-8015-6df637a973bd','018bec90-445f-4a88-b8bc-228f8335dee6','04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162','bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a'}
changed=True
while changed:
 before=set(related)
 for g in goals:
  if g['id'] in related:related.update(g.get('requires',[]))
  if any(i in g.get('contains',[]) for i in related):related.add(g['id'])
 changed=related!=before
for g in goals:
 if any(i in g.get('requires',[]) for i in IDS):related.add(g['id'])
save('current-before-objects.json',{'snapshotAtUtc':datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z'),'canonicalPath':str(canonical_path.relative_to(ROOT)),'canonicalBytesDigest':digest(canonical_path),'landscapeMetadata':{k:v for k,v in canonical.items() if k!='goals'},'goals':[g for g in goals if g['id'] in related]})

source_index={}
source_meta={}
for p in sorted((BASE/'input').rglob('*.source-extraction.json')):
 x=json.loads(p.read_text())
 if x.get('subject')!='Chemie':continue
 sid=x.get('sourceLandscapeId');source_meta[sid]={'path':str(p.relative_to(ROOT)),'digest':digest(p),'sourceDocument':x.get('sourceDocument'),'sourceDocuments':x.get('sourceDocuments'),'jurisdiction':x.get('jurisdiction'),'stage':x.get('stage')}
 for g in x.get('sourceGoals',[]):
  source_index[(sid,g['id'])]={'sourceGoal':g,'resolution':'exact extracted sourceGoalId','sourceExtractionPath':str(p.relative_to(ROOT))}
  for o in g.get('sourceOccurrences',[]):
   source_index[(sid,o['sourceGoalId'])]={'sourceGoal':g,'sourceOccurrence':o,'resolution':'explicit merged sourceOccurrence alias','sourceExtractionPath':str(p.relative_to(ROOT))}
for p in [BASE/'input/HE/lower-secondary/source-json/DE_HES_S_GYM_1_CHEMIE.de.json.snapshot',BASE/'input/BY/gymnasium/Chemie.json']:
 x=json.loads(p.read_text())
 for g in x['goals']:
  key=(x['landscapeId'],g['id'])
  if key in source_index:source_index[key]['legacyGoalObject']=g
  else:source_index[key]={'legacyGoalObject':g,'sourceGoal':None,'resolution':'legacy source-goal object only; extracted source-row crosswalk requires targeted clause check','legacySourcePath':str(p.relative_to(ROOT))}

rows=[]
for p in sorted((BASE/'mapping').rglob('*_to_canonical_chemistry.json')):
 x=json.loads(p.read_text());sid=x['sourceLandscapeId']
 for n,m in enumerate(x.get('mappings',[])):
  if m.get('canonicalGoalId') not in IDS:continue
  row={'mappingPath':str(p.relative_to(ROOT)),'mappingBytesDigest':digest(p),'mappingIndex':n,'sourceLandscapeId':sid,'beforeMapping':m,'sourceMetadata':source_meta.get(sid),'sourceBinding':source_index.get((sid,m['legacyGoalId']))}
  rows.append(row)
save('current-source-bindings.inventory.json',{'rowCount':len(rows),'sourceMappingsRead':'Current operative *_to_canonical_chemistry.json only; no mapping-review judgments read','rows':rows})

bindings=[]
def walk(value,path=[]):
 if isinstance(value,dict):
  for k,v in value.items():yield from walk(v,path+[k])
 elif isinstance(value,list):
  for i,v in enumerate(value):yield from walk(v,path+[i])
 elif value in IDS if isinstance(value,str) else False:
  yield path,value
for g in goals:
 hits=list(walk(g))
 if hits:bindings.append({'goalId':g['id'],'title':g.get('title'),'beforeGoal':g,'references':[{'path':p,'goalId':v} for p,v in hits]})
save('current-canonical-relations-and-exams.inventory.json',{'allCanonicalGoalCount':len(goals),'directAndNestedReferences':bindings,'examNodesScanned':sum(bool(g.get('examData')) for g in goals),'directExamCoverageReferences':[{k:g.get(k) for k in ['id','title','requires','examData']} for g in goals if any(i in json.dumps(g.get('examData',{})) for i in IDS)]})

by_source=sorted({x['sourceLandscapeId'] for x in rows})
print(json.dumps({'mappingRows':len(rows),'mappingFiles':len({x['mappingPath'] for x in rows}),'sourceLandscapes':len(by_source),'unresolvedRowBindings':sum(x['sourceBinding'] is None for x in rows),'currentCanonicalBeforeObjects':len(related),'examNodesScanned':sum(bool(g.get('examData')) for g in goals),'directExamCoverageRefs':sum(any(i in json.dumps(g.get('examData',{})) for i in IDS) for g in goals)},ensure_ascii=False))
for r in rows:
 b=r['sourceBinding'] or {};g=b.get('sourceGoal') or b.get('legacyGoalObject') or {}
 s=g.get('sourceText',g.get('description',''))
 if any(t in s.lower() for t in ['teilgleich','gesamtgleich','ionengleich','reaktionsgleichungen auf','reaktionsgleichung auf','protolyse']):
  print('SPECIFIC',r['mappingPath'].split('/mapping/')[1],r['beforeMapping']['legacyGoalId'],r['beforeMapping']['canonicalGoalId'][:5],s[:750])
