from pathlib import Path
import datetime
import hashlib
import json

base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
own = base / 'chemie-b008-current-nineteen-native-v2-independent-a-v1'
native = base / 'chemie-b008-current-twenty-six-native-preparation-author-v1/nineteen-operative-native-preparation-v2/native-nineteen'

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write_new(path, value):
    with path.open('x', encoding='utf-8') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')

campaign = json.loads((native / 'round-b/description-review-campaign.json').read_text())
bundle = json.loads((native / 'round-b/review-bundle-manifest.json').read_text())
first = json.loads((own / 'native-nineteen-description.first.independent-A.actual-round-B.verdict.json').read_text())
input_first = json.loads((own / 'input/native-nineteen-current-input.first.freeze.json').read_text())
records_bytes = (own / 'native-nineteen-description.first.independent-A.actual-round-B.records.jsonl').read_bytes()
assert digest(records_bytes) == first['firstRecords']['sha256']
records = [json.loads(line) for line in records_bytes.splitlines()]
assert len(records) == 19 and len(campaign['batches']) == 1
batch = campaign['batches'][0]
assert [row['goalId'] for row in records] == batch['goalIds']
assert len({row['runId'] for row in records}) == 1
batch_bytes = (native / 'round-b/batches' / (batch['batchId'] + '.input.jsonl')).read_bytes()
assert digest(batch_bytes) == batch['batchInputFingerprint']

results = own / 'results'
results.mkdir(exist_ok=False)
record_path = results / (batch['batchId'] + '.records.jsonl')
with record_path.open('xb') as out:
    out.write(records_bytes)

parameters_path = own / 'native-nineteen-description.actual-generation-parameters.json'
write_new(parameters_path, {
    'schemaVersion': 1,
    'role': 'Honest metadata for the actual independent D-only semantic run',
    'actualToolModel': None,
    'declaredModelUnexposed': True,
    'provider': 'OpenAI',
    'temperature': None,
    'seed': None,
    'modelVersion': None,
    'notes': 'The API task exposes no concrete model variant or generation settings. Null values record unavailable metadata; they do not represent chosen settings. Nineteen independent semantic first judgments preceded this ordinary run materialization.',
    'humanApproval': False,
    'humanTrial': False,
})

artifact_roles = ['book_pdf', 'book_html', 'review_prompt', 'review_criteria', 'run_manifest_schema']
by_role = {row['role']: row for row in bundle['artifacts']}
artifacts = [{'role': role, 'digest': by_role[role]['digest']} for role in artifact_roles]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': digest(batch_bytes)})
completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': records[0]['runId'],
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI',
    'model': 'unexposed-by-current-tool',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(parameters_path.read_bytes()),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': artifacts,
    'startedAt': input_first['startedAt'],
    'completedAt': completed,
    'status': 'completed',
    'outputDigest': digest(records_bytes),
    'toolchainVersion': 'independent-A-native19-D-v1',
}
run_path = results / (batch['batchId'] + '.run.json')
write_new(run_path, run)

def bind(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': digest(data), 'bytes': len(data)}

write_new(own / 'native-nineteen-description.ordinary-run-materialization.notes.json', {
    'schemaVersion': 1,
    'role': 'Document the actual first D19 run in the ordinary Campaign-B contract; no new semantic review claimed by copying JSONL',
    'materializedAt': completed,
    'firstVerdict': bind(own / 'native-nineteen-description.first.independent-A.actual-round-B.verdict.json'),
    'firstFreeze': bind(own / 'native-nineteen-description.first.independent-A.actual-round-B.freeze.json'),
    'originalFirstRecords': bind(own / 'native-nineteen-description.first.independent-A.actual-round-B.records.jsonl'),
    'normalBatchRecords': bind(record_path),
    'recordBytesExactFirstToNormal': record_path.read_bytes() == records_bytes,
    'normalRun': bind(run_path),
    'generationParameters': bind(parameters_path),
    'batchInput': bind(native / 'round-b/batches' / (batch['batchId'] + '.input.jsonl')),
    'campaign': bind(native / 'round-b/description-review-campaign.json'),
    'bundle': bind(native / 'round-b/review-bundle-manifest.json'),
    'fullDReviewInput': bind(native / 'round-b/description-review-input.json'),
    'scope': {
        'independentNativeDOnlyGoals': 19,
        'actualPDFPhysicalPagesInspected': list(range(3,22)),
        'wholeHTMLTextRead': True,
        'wholeBilingualGoalContextsRead': True,
        'ownOtherP7MaterialsReadForDReview': False,
        'peerNativeD7OutputsReadBeforeFirstSeal': False,
        'descriptionAuthorIsThisReviewer': False,
        'reviewContextEvidenceProfiles': 'null in supplied D input; create recommendations do not approve separately reviewed actual P19 profiles',
        'ownOtherP7ApprovalByThisReviewer': False,
        'visualApprovalRepeated': False,
        'sourceCourseAtlasProtectedContextsApproval': False,
        'e5aUnspecifiedCourseResolved': False,
        'humanApproval': False,
        'humanTrial': False,
        'strictGain': 0,
        'activeWrites': [],
    },
})
print(json.dumps({'resultsDirectory': str(results), 'records': 19, 'recordDigest': digest(records_bytes), 'run': bind(run_path)}, indent=2))
