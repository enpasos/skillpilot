"""Create bound placeholder-only native review scaffolds after actual D1 prepare.
These .txt drafts deliberately contain no KEEP/REVISE or completed review.
"""
import hashlib
import json
import os
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
NATIVE = OUT / 'native-d-c441'
GOAL_ID = 'c441d9e8-d9d9-5e55-a189-a37345541321'


def read(path):
    return json.loads(path.read_text())


def publish(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, path)


bundle = read(NATIVE / 'bundle' / 'manifest.json')
model = read(NATIVE / 'bundle' / 'book-model.json')
assert [p['goalId'] for p in model['pages']] == [GOAL_ID]
page = model['pages'][0]
assert page['visualization'] is not None
actual = ROOT / ('app/public' + page['visualization']['url'])
assert 'sha256:' + hashlib.sha256(actual.read_bytes()).hexdigest() == page['visualization']['originalDigest']
for letter in ('a', 'b'):
    round_dir = NATIVE / ('round-' + letter)
    campaign = read(round_dir / 'description-review-campaign.json')
    review_input = read(round_dir / 'description-review-input.json')
    assert campaign['goalCount'] == 1 and campaign['blindToOtherReviews'] is True
    assert [g['goalId'] for g in review_input['goals']] == [GOAL_ID]
    goal = review_input['goals'][0]
    batch = campaign['batches'][0]
    run_id = 'chemie-c441-current-image-targeted-independent-' + letter + '-20261007-v1'
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': run_id + '.' + GOAL_ID,
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        'goalId': GOAL_ID,
        'goalFingerprint': goal['goalFingerprint'],
        'pageFingerprint': goal['pageFingerprint'],
        **{key: goal[key] for key in ('currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn')},
        'decision': '<reviewer determines keep/revise/split after actual page review>',
        'understandingEvidence': {key: '<reviewer independently fills actual current bounded evidence>' for key in ('essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn')},
        'rationale': '<actual independent current page/image/source/context rationale, disclose bounded historical reuse>',
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': '<reviewer determines from existing current profile and actual page context>',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    manifest = {
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
        'model': 'GPT-6/Codex (exact serving variant not exposed)',
        'role': 'subject_reviewer',
        'promptFamilyId': 'goal-description-review-v2-positive-understanding',
        'promptFingerprint': campaign['promptFingerprint'],
        'criteriaFingerprint': campaign['criteriaFingerprint'],
        'generationParametersFingerprint': '<reviewer binds actual disclosed run metadata>',
        'independenceGroupId': campaign['independenceGroupId'],
        'blindToOtherRuns': True,
        'goalIds': [GOAL_ID],
        'inputArtifacts': [{'role': artifact['role'], 'digest': artifact['digest']} for artifact in bundle['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
        'startedAt': '<actual reviewer start time>',
        'completedAt': '<actual reviewer completion time>',
        'status': '<review not yet performed>',
        'outputDigest': '<exact final record JSONL byte SHA256>',
        'toolchainVersion': 'native-existing-validator-targeted-corrected-image-review-v1',
    }
    templates = OUT / 'reviewer-scaffolds' / ('round-' + letter)
    publish(templates / (batch['batchId'] + '.records.placeholder.txt'), record)
    publish(templates / (batch['batchId'] + '.run.placeholder.txt'), manifest)
    publish(templates / 'actual-input-routing.technical.json', {
        'documentType': 'bound neutral technical reviewer routing, no scientific records/results',
        'goalId': GOAL_ID,
        'reviewerAssignments': 'Root A / independent HHA B, actual authors of their own verdicts',
        'bundlePath': str((NATIVE / 'bundle' / 'manifest.json').relative_to(ROOT)),
        'htmlPath': str((NATIVE / 'bundle' / 'book.html').relative_to(ROOT)),
        'pdfPath': str((NATIVE / 'bundle' / 'book.pdf').relative_to(ROOT)),
        'bookModelPath': str((NATIVE / 'bundle' / 'book-model.json').relative_to(ROOT)),
        'originalActualPngPath': str(actual.relative_to(ROOT)),
        'campaignPath': str((round_dir / 'description-review-campaign.json').relative_to(ROOT)),
        'inputPath': str((round_dir / 'description-review-input.json').relative_to(ROOT)),
        'batchesDirectory': str((round_dir / 'batches').relative_to(ROOT)),
        'expectedOutputResultsDirectory': str((round_dir / 'results').relative_to(ROOT)),
        'nativeRecordSchemaPath': 'contracts/goal-description-review/v1/goal-description-review-record.schema.json',
        'nativeRunSchemaPath': 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
        'criteriaPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
        'promptPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
        'placeholderFilesAreNotValidCompletedReviewRecords': True,
        'reviewPolicy': campaign['reviewPolicy'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'reviewInputFingerprint': review_input['reviewInputFingerprint'],
        'goalFingerprint': goal['goalFingerprint'],
        'pageFingerprint': goal['pageFingerprint'],
    })
print(json.dumps({'boundPlaceholderRounds': ['a', 'b'], 'actualGoalId': GOAL_ID, 'scientificDecisionRecordsWritten': 0, 'actualOriginalDigest': page['visualization']['originalDigest']}))
