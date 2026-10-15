from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib

FINAL = Path(__file__).resolve().parent
ROUND = FINAL / 'assigned-round-b'


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def write_new(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


first_path = FINAL / 'FIRST20.final-v3.independent-b.scientific.json'
assert digest(first_path) == 'sha256:a063cd590f7e3883195ecd194f804c37b9ea8cf0c4b76abcaa04e5bc3377a833'
first = json.loads(first_path.read_text())
campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
bundle = json.loads((ROUND / 'review-bundle-manifest.json').read_text())
inputs = json.loads((ROUND / 'description-review-input.json').read_text())
batch = campaign['batches'][0]
assert len(campaign['batches']) == 1
run_id = 'chemie-energy20-final-v3-genuine-independent-b-20261015-run-001'
params = {
    'provider': 'OpenAI',
    'model': 'GPT-6 (Codex; serving snapshot not exposed)',
    'generationSettings': 'temperature, seed and exact serving snapshot are not exposed in this session; no values inferred',
    'reviewer': '/root/chemie_energy20_successor_native_fresh_independent_b_20261015',
    'mode': 'independent subject reviewer B, actual native whole-book and scientific-context reading followed by manual per-goal reasoning',
    'firstFinalScience': {'path': str(first_path), 'sha256': digest(first_path), 'writtenAt': first['firstWrittenAt']},
    'earlierOwnScienceCheckpoint': first['ownEarlierCheckpoint'],
    'blindToOtherRuns': True,
    'blindingMeaning': 'No other reviewer results or completed review-run content was read. Own earlier v2 scientific checkpoint is disclosed as part of this same continuing review, with no earlier normal records or run manifest. Final metadata was read, not presented as newly first read.',
    'scope': 'assigned native-twenty/round-b only; D descriptions only; no P/A/M/V votes, no strict/M7/human acceptance',
}
params_path = FINAL / 'actual-generation-parameters-and-provenance.json'
write_new(params_path, params)
records = []
for ordinal, (science, goal) in enumerate(zip(first['perGoalScientificFirst'], inputs['goals']), 1):
    assert science['goalId'] == goal['goalId'] == batch['goalIds'][ordinal - 1]
    for field in ['currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
        assert science[field] == goal[field]
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': 'chemie-energy20-final-v3-independent-b-' + str(ordinal).zfill(2),
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{field: goal[field] for field in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        **{field: science[field] for field in ['decision', 'understandingEvidence', 'rationale', 'evidenceProfileRecommendation']},
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    records.append(record)
assert len(records) == 20
results = ROUND / 'results'
assert not list(results.iterdir())
record_path = results / (batch['batchId'] + '.records.jsonl')
record_path.write_text(''.join(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n' for record in records))
completed = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI',
    'model': params['model'],
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-review-positive-understanding-evidence-v2-independent-b',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(params_path),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']] + [
        {'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}
    ],
    'startedAt': first['nativeReviewStartedAt'],
    'completedAt': completed,
    'status': 'completed',
    'outputDigest': digest(record_path),
    'toolchainVersion': 'codex-independent-manual-native-d-review-v1',
}
run_path = results / (batch['batchId'] + '.run.json')
write_new(run_path, run)
print(json.dumps({'records': str(record_path), 'recordsSHA256': digest(record_path), 'run': str(run_path), 'runSHA256': digest(run_path), 'completedAt': completed}, ensure_ascii=False))
