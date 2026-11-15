import json,hashlib
from datetime import datetime,timezone
from pathlib import Path
import jsonschema
base=Path('tmp/physics-release809-20261115/three-native-d/round-b')
bundle=Path('tmp/physics-release809-20261115/three-review-bundle')
out=Path('tmp/physics-current3-blind-b-20261115')
sealpath=Path('tmp/physics-release809-20261115/three-D-input-seal.actual.json')
seal=json.loads(sealpath.read_text())
pins={p['path']:p for p in seal['pins']}
readpaths=[base/'prompt.md',base/'criteria.md',base/'contracts/goal-description-review-record.schema.json',base/'description-review-campaign.json',base/'batches/independent-b.batch-001.input.jsonl',base/'review-bundle-manifest.json',bundle/'book-model.json',bundle/'book.pdf',bundle/'book.pdf.render-manifest.json']
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
for p in readpaths:
 pin=pins[str(p)]
 actual=digest(p)
 assert actual==pin['sha256'],str(p)
 assert p.stat().st_size==pin['bytes'],str(p)
 checks.append({'path':str(p),'sha256':actual,'bytes':p.stat().st_size,'matchesSharedInputSeal':True})
checks.append({'path':str(sealpath),'sha256':digest(sealpath),'bytes':sealpath.stat().st_size,'role':'shared-pin-only-seal'})
campaign=json.loads((base/'description-review-campaign.json').read_text())
manifest=json.loads((base/'review-bundle-manifest.json').read_text())
model=json.loads((bundle/'book-model.json').read_text())
render=json.loads((bundle/'book.pdf.render-manifest.json').read_text())
assert campaign['bundleFingerprint']==manifest['bundleFingerprint']
assert campaign['bookDigest']==manifest['bookModelDigest']==model['digest']==render['modelDigest']
assert campaign['promptFingerprint']==digest(base/'prompt.md')
assert campaign['criteriaFingerprint']==digest(base/'criteria.md')
assert campaign['recordSchemaDigest']==digest(base/'contracts/goal-description-review-record.schema.json')
assert campaign['batches'][0]['batchInputFingerprint']==digest(base/'batches/independent-b.batch-001.input.jsonl')
batch=[json.loads(x) for x in (base/'batches/independent-b.batch-001.input.jsonl').read_text().splitlines()]
lines=(out/'records.jsonl').read_text().splitlines()
assert len(lines)==len(batch)==campaign['goalCount']==3
records=[json.loads(x) for x in lines]
schema=json.loads((base/'contracts/goal-description-review-record.schema.json').read_text())
jsonschema.Draft202012Validator.check_schema(schema)
validator=jsonschema.Draft202012Validator(schema)
goalids=[]
for ordinal,(rec,entry) in enumerate(zip(records,batch),1):
 validator.validate(rec)
 assert entry['ordinal']==ordinal
 assert rec['campaignId']==campaign['campaignId']
 assert rec['roundId']==campaign['roundId']
 assert rec['runId']=='physics-current3-blind-b-20261115-52b38f'
 assert rec['bundleFingerprint']==entry['bundleFingerprint']==campaign['bundleFingerprint']
 assert rec['bookDigest']==entry['bookDigest']==campaign['bookDigest']
 assert rec['recordId']==f"{rec['runId']}.{ordinal:03}"
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
  assert rec[k]==entry['goal'][k],(ordinal,k)
 manifestgoal=manifest['goals'][ordinal-1]
 assert rec['goalId']==manifestgoal['goalId']
 assert rec['goalFingerprint']==manifestgoal['goalFingerprint']
 assert rec['pageFingerprint']==manifestgoal['pageFingerprint']
 assert rec['reviewAuthority']=='ai_candidate' and rec['recordStatus']=='candidate'
 assert rec['decision']=='keep'
 assert 'proposedDescriptionDe' not in rec and 'proposedDescriptionEn' not in rec
 goalids.append(rec['goalId'])
assert goalids==campaign['batches'][0]['goalIds']==batch[0]['batchGoalIds']
assert len({r['recordId'] for r in records})==3
result={'validatedAtUtc':datetime.now(timezone.utc).isoformat(),'schemaValid':True,'recordCount':3,'assignedOrderValid':True,'exactCopiedBindingsValid':True,'rawInputPinChecks':checks,'candidateAuthorityValid':True,'proposedDescriptionFieldsAbsentForKeep':True,'decisions':{r['goalId']:r['decision'] for r in records},'profileRecommendations':{r['goalId']:r['evidenceProfileRecommendation'] for r in records},'errors':[]}
(out/'validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='rawInputPinChecks'},ensure_ascii=False,indent=2))
