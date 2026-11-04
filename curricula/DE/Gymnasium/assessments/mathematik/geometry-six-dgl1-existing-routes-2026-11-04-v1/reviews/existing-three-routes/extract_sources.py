from pathlib import Path
import json
F=Path(__file__).resolve().parent;R=F.parents[2]
ids={'fa0b6b69-ce54-4711-90e6-26f27249cd71','58fda9b4-4336-5594-99ce-722c4a453372','27b63e2e-6a34-483e-8e5a-fe0f49670d1d','671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6','28cdee95-3c8e-5760-a68a-405b7f9c6cbf','42e19186-6769-41ac-a7bf-ab39bdb50661','959cc50b-6c81-4fa1-800f-4804a707b1ee','3010d965-b9b9-4dc5-9d04-d706725e9a30','3c1d6ce7-099e-4267-9ff2-3d1526209a89'};out=[]
for p in sorted((R/'curricula/DE/Gymnasium/mapping').rglob('*math*review.json')):
 d=json.loads(p.read_text());expath=d.get('sourceExtractionPath');source=json.loads((R/expath).read_text()) if expath and (R/expath).exists() else {};ss={g.get('id'):g for g in source.get('sourceGoals',source.get('goals',[]))}
 for row in d.get('decisions',[]):
  matched=ids&set(row.get('canonicalGoalIds',[]))
  if not matched:continue
  sid=row.get('sourceGoalId');item={'reviewPath':str(p.relative_to(R)),'sourceExtractionPath':expath,'canonicalGoalIds':sorted(matched),'decision':row,'sourceGoal':ss.get(sid),'sourcePassage':next((v for v in source.get('passages',[]) if v.get('id')==(ss.get(sid) or {}).get('passageId')),None),'sourceDocumentMetadata':{k:v for k,v in source.items() if k in ['schemaVersion','extractionId','jurisdiction','subject','stage','sourceDocument','sourceDocuments','method']}}
  out.append(item)
(F/'source-decisions-and-whole-extractions.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
for x in out:
 jurisdiction=x['reviewPath'].split('/')[4];row=x['decision'];text=row.get('sourceSpan') or (x['sourceGoal'] or {}).get('description') or row.get('rationale');print(jurisdiction,','.join(i[:8] for i in x['canonicalGoalIds']),row.get('matchType'),text)
