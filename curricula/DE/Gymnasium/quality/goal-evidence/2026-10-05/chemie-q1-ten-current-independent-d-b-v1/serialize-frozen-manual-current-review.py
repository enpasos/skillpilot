# SPDX-License-Identifier: Apache-2.0
"""Serialize previously frozen manual science; do not infer scientific verdicts."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.with_name('chemie-q1-quantitative-atomic-split-current-author-candidate-v1')
ROUND = AUTHOR / 'native-finalbook/round-b'
RUN = 'chemie-q1-ten-root-independent-d-b-20261006-v1'
FIELDS = ['essentialUnderstandingDe', 'essentialUnderstandingEn',
          'observablePerformanceDe', 'observablePerformanceEn',
          'transferExpectationDe', 'transferExpectationEn']


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


frozen = json.loads((OWN / 'independent-description-science.before-native.final.freeze.json').read_text())
for item in frozen['files']:
    data = (ROOT / item['path']).read_bytes()
    assert len(data) == item['bytes'] and digest(data) == item['sha256'], item['path']
manual = json.loads((OWN / 'manual-current-independent-science-and-retained-six.input.json').read_text())
assert manual['authorRole'] is False and manual['otherReviewerScientificJudgementsConsulted'] is False
assert manual['reviewAuthority'] == 'ai_candidate'
campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
bundle = json.loads((ROUND / 'review-bundle-manifest.json').read_text())
assert campaign['batchSize'] == 20 and campaign['goalCount'] == 10 and len(campaign['batches']) == 1
batch = campaign['batches'][0]
batch_bytes = (ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')).read_bytes()
goals = [json.loads(line)['goal'] for line in batch_bytes.splitlines()]
ids = [goal['goalId'] for goal in goals]
assert ids == batch['goalIds'] and set(ids) == set(manual['science'])
records = []
for goal in goals:
    decision = manual['science'][goal['goalId']]
    assert decision['decision'] == 'keep'
    record = {key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint',
                                       'currentTitleDe', 'currentTitleEn',
                                       'currentDescriptionDe', 'currentDescriptionEn']}
    record.update({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': 'chem-q1-ten-root-b-v1-' + goal['goalId'],
        'runId': RUN, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        'decision': decision['decision'], 'rationale': decision['rationale'],
        'understandingEvidence': {key: decision[key] for key in FIELDS},
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create', 'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    })
    records.append(record)
results = OWN / 'results'
results.mkdir(exist_ok=True)
records_path = results / (batch['batchId'] + '.records.jsonl')
assert not records_path.exists(), records_path
records_path.write_text('\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'))
                                   for r in records) + '\n')
parameters = {
    'workflow': 'Serialize frozen independent manual current D-B10; two new description reviews, two targeted reverse-context reviews, six original scientific verdicts retained verbatim after actual complete-context/page comparison.',
    'temperature': 'not exposed', 'sampling': 'not exposed', 'authorRole': False,
    'otherReviewerScientificJudgementsConsulted': False,
    'scientificReceipt': str((OWN / 'manual-current-independent-science-and-retained-six.input.json').relative_to(ROOT)),
    'scientificReceiptSHA256': digest((OWN / 'manual-current-independent-science-and-retained-six.input.json').read_bytes()),
    'scientificFreezeSHA256': digest((OWN / 'independent-description-science.before-native.final.freeze.json').read_bytes()),
    'newScientificDescriptionReviews': 2, 'targetedExistingReverseContextReviews': 2,
    'retainedOriginalRootScientificDecisions': 6, 'humanApproval': False, 'humanTrial': False,
}
write(OWN / 'generation-parameters.actual.json', parameters)
artifacts = [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']
             if a['role'] in ['book_pdf', 'book_html', 'review_prompt', 'review_criteria']]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': 'sha256:' + digest(batch_bytes)})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': RUN, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI Codex', 'model': 'Inherited Codex session; exact runtime model identifier not exposed',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + digest((OWN / 'generation-parameters.actual.json').read_bytes()),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': ids, 'inputArtifacts': artifacts, 'startedAt': manual['reviewedAtUTC'],
    'completedAt': datetime.now(timezone.utc).isoformat(), 'status': 'completed',
    'outputDigest': 'sha256:' + digest(records_path.read_bytes()), 'toolchainVersion': 'goal-description-review-v2',
}
write(results / (batch['batchId'] + '.run.json'), run)
write(OWN / 'actual-frozen-science-serialization.receipt.json', {
    'completedAtUTC': run['completedAt'], 'recordCount': len(records), 'decisions': ['keep'] * len(records),
    'allTenRationalesAndSixUnderstandingFieldsExactToPreviouslyFrozenManualScience': True,
    'twoNewDescriptionReviews': True, 'twoExistingContextReviewsOnly': True,
    'sixOriginalIndependentScientificDecisionsRetained': True,
    'noNewScientificVerdictsGeneratedBySerialization': True,
    'bookEvidenceProfileRecommendationIsNotPositiveProfileApproval': True,
    'activeWrites': 0, 'operativeStrictNetIncrease': 0, 'humanApproval': False, 'humanTrial': False,
})
print('Serialized frozen D-B10: two new, two targeted contexts, six retained original science; no integration.')
