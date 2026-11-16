import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from jsonschema import Draft202012Validator

base = Path('tmp/physics-release809-20261115/three-native-d/round-a')
bundle = Path('tmp/physics-release809-20261115/three-review-bundle')
out = Path('tmp/physics-current3-blind-a-20261115')
seal_path = Path('tmp/physics-release809-20261115/three-D-input-seal.actual.json')

def digest(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

campaign = json.loads((base/'description-review-campaign.json').read_text())
manifest = json.loads((base/'review-bundle-manifest.json').read_text())
model = json.loads((bundle/'book-model.json').read_text())
rows = [json.loads(line) for line in (base/'batches/independent-a.batch-001.input.jsonl').read_text().splitlines()]
records = [json.loads(line) for line in (out/'review.jsonl').read_text().splitlines()]
schema = json.loads((base/'contracts/goal-description-review-record.schema.json').read_text())
Draft202012Validator.check_schema(schema)
validator = Draft202012Validator(schema)
assert len(records) == len(rows) == campaign['goalCount'] == 3
assert [r['goalId'] for r in records] == campaign['batches'][0]['goalIds']
assert len({r['recordId'] for r in records}) == 3
checks=[]
for row, record in zip(rows, records):
    validator.validate(record)
    for key in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
        assert record[key] == row['goal'][key], key
    for key in ['bookDigest','bundleFingerprint']:
        assert record[key] == row[key] == campaign[key], key
    for key in ['campaignId','roundId']:
        assert record[key] == campaign[key], key
    assert record['recordStatus'] == 'candidate'
    assert record['reviewAuthority'] == 'ai_candidate'
    checks.append({'goalId':record['goalId'], 'schemaValid':True, 'exactInputBindings':True, 'decision':record['decision'], 'evidenceProfileRecommendation':record['evidenceProfileRecommendation']})
assert model['digest'] == campaign['bookDigest'] == manifest['bookModelDigest']
assert manifest['bundleFingerprint'] == campaign['bundleFingerprint']
assert digest(base/'batches/independent-a.batch-001.input.jsonl')['sha256'] == campaign['batches'][0]['batchInputFingerprint']
for relative, key in [('prompt.md','promptFingerprint'), ('criteria.md','criteriaFingerprint'), ('contracts/goal-description-review-record.schema.json','recordSchemaDigest')]:
    assert digest(base/relative)['sha256'] == campaign[key], key

input_paths = [base/'prompt.md',base/'criteria.md',base/'contracts/goal-description-review-record.schema.json',base/'description-review-campaign.json',base/'batches/independent-a.batch-001.input.jsonl',base/'review-bundle-manifest.json',seal_path,bundle/'book-model.json',bundle/'book.pdf']
expected_pins = {p['path']:p for p in json.loads(seal_path.read_text())['pins']}
for path in input_paths:
    if path != seal_path:
        actual = digest(path)
        expected = expected_pins[str(path)]
        assert actual['sha256'] == expected['sha256'] and actual['bytes'] == expected['bytes'], str(path)
for artifact in manifest['artifacts']:
    if artifact['role'] in ['book_model','book_pdf']:
        actual=digest(bundle/artifact['path'])
        assert actual['sha256'] == artifact['digest'] and actual['bytes'] == artifact['bytes']

validation = {'validatedAt':datetime.now(timezone.utc).isoformat(),'validator':'Python jsonschema Draft202012Validator; standalone validator in this new review directory','schemaPath':str(base/'contracts/goal-description-review-record.schema.json'),'schemaDigest':digest(base/'contracts/goal-description-review-record.schema.json')['sha256'],'recordCount':len(records),'recordChecks':checks,'exactBatchOrder':True,'campaignBindingsMatch':True,'nativeBookDigestMatch':True,'suppliedInputHashSealMatches':True,'otherReviewPipelineInvoked':False}
(out/'validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n')
seal = {'sealedAt':datetime.now(timezone.utc).isoformat(),'reviewerIdentity':'Codex independent agent /root/physics_three_d_blind_a','runId':records[0]['runId'],'reviewPass':'first_pass','campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'blindToOtherReviews':True,'inputs':list(map(digest,input_paths)),'outputs':list(map(digest,[out/'review.jsonl',out/'review-explanation.md',out/'author_review.py',out/'validate_review.py',out/'validation.json'])),'visualInspectionRenders':[digest(p) for p in sorted(out.glob('book-page-*.png'))],'limits':['Only supplied batch and bound current native bundle inspected; current V2 profiles were context, not authority.','Supplied profile metadata contains retrospective rationale; no separate prior review output, earlier review round, adjudication, QA diagnosis, canonical diff or round-b file was opened.','Only selected and directly related navigation entries of the book model were inspected; no broad repository history.','No official source text or compiled jurisdiction-duration projection matrix was supplied or independently validated.','No learner assessment was administered and no human approval is claimed.']}
(out/'input-output-seal.json').write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(validation,ensure_ascii=False,indent=2))
