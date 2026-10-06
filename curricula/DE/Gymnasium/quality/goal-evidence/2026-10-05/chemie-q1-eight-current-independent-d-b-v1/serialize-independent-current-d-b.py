# SPDX-License-Identifier: Apache-2.0
"""Serialize explicit manual judgements; never generate scientific verdicts."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.with_name('chemie-q1-six-source-operator-remediation-current-candidate-v1')
ROUND = AUTHOR / 'native-finalbook-v2/round-b'
RUN = 'chemie-q1-eight-root-independent-d-b-20261005-v1'
campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
bundle = json.loads((ROUND / 'review-bundle-manifest.json').read_text())
manual = json.loads((OWN / 'manual-current-scientific-decisions.input.json').read_text())
batch = campaign['batches'][0]
batch_bytes = (ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')).read_bytes()
inputs = [json.loads(line)['goal'] for line in batch_bytes.splitlines()]
ids = [g['goalId'] for g in inputs]
assert set(ids) == set(manual['science'])
assert manual['authorRole'] is False
assert manual['otherReviewerScientificJudgementsConsulted'] is False
assert manual['reviewAuthority'] == 'ai_candidate'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write(path, data):
    assert not path.exists(), path
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


fields = ['essentialUnderstandingDe', 'essentialUnderstandingEn',
          'observablePerformanceDe', 'observablePerformanceEn',
          'transferExpectationDe', 'transferExpectationEn']
records = []
for goal in inputs:
    judgement = manual['science'][goal['goalId']]
    assert judgement['decision'] in ['keep', 'split_review', 'revise', 'block']
    record = {k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint',
                                   'currentTitleDe', 'currentTitleEn',
                                   'currentDescriptionDe', 'currentDescriptionEn']}
    record.update({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': 'chem-q1-eight-root-b-v1-' + goal['goalId'],
        'runId': RUN, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        'decision': judgement['decision'],
        'understandingEvidence': {k: judgement[k] for k in fields},
        'rationale': judgement['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
    if judgement['decision'] == 'revise':
        record.update({k: judgement[k] for k in ['proposedDescriptionDe', 'proposedDescriptionEn']})
    records.append(record)

results = OWN / 'results'
results.mkdir(exist_ok=True)
records_file = results / (batch['batchId'] + '.records.jsonl')
assert not records_file.exists()
records_file.write_text('\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'))
                                  for r in records) + '\n')
parameters = {
    'workflow': 'Manual blind independent current D-B8; actual full 10-page current PDF, eight loaded whole HTML pages, actual whole HE39/40 BB24 RP39/40 and 17 dated EU source pages; explicit one open semantic split finding.',
    'temperature': 'not exposed', 'sampling': 'not exposed',
    'authorRole': False, 'otherReviewerScientificJudgementsConsulted': False,
    'technicalStatusNotificationsReceived': True,
    'technicalStatusNotificationsUsedForScientificVerdict': False,
    'currentAlreadyReviewedEsterGoalScope': 'affected new reverseRequires/page/context only; valid old scientific judgements retained',
}
write(OWN / 'generation-parameters.actual.json', parameters)
completed = datetime.now(timezone.utc).isoformat()
render = json.loads((OWN / 'actual-independent-page-rendering.receipt.json').read_text())
html = json.loads((OWN / 'actual-current-loaded-html.receipt.json').read_text())
assert render['actualPageCount'] == 32
assert [s['goalId'] for s in html['actualGoalSections']] == ids
for page in render['pages']:
    assert sha((ROOT / page['actualRenderedPNG']).read_bytes()) == page['pngSHA256']
    assert sha((ROOT / page['sourcePDF']).read_bytes()) == page['sourcePDFSHA256']
for screen in html['screenshots']:
    assert sha(Path(screen['path']).read_bytes()) == screen['sha256']
write(OWN / 'actual-input-reading.completed.receipt.json', {
    'completedUtc': completed, 'reviewer': '/root independent D-B',
    'authorRole': False, 'otherReviewerScientificJudgementsConsulted': False,
    'actualPDFViews': [{**p, 'seenByReviewer': True} for p in render['pages']],
    'actualHTMLGoalPagesSeen': ids, 'allEightWholeLoadedDOMTextsRead': True,
    'allEightActualLoadedHTMLScreenshotsSeen': True,
    'actualHTMLSHA256': html['htmlSHA256'],
    'actualSourceWholePageTextsRead': ['HE-current', 'BB-current', 'RP-current',
                                       'EU-dated-20251104', 'EU-amendment-2025-2060'],
    'allCurrentDEENDescriptionsAndContextsRead': True,
    'sourceScopeClaimsRestrictedToSuppliedBoundMappings': True,
    'threeMissingDirectAtlasRowsConvertedIntoNormativeProof': False,
    'P7InnerProfilesAndAllCasesReviewedByThisReviewer': False,
    'original360680ImageVApprovalByThisReviewer': False,
    'humanApproval': False, 'learnerPerformanceObserved': False,
    'activeWrites': 0, 'newStrictClosuresBeforeIntegration': 0,
})
consumed_roles = ['book_pdf', 'book_html', 'review_prompt', 'review_criteria']
artifacts = [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']
             if a['role'] in consumed_roles]
artifacts.append({'role': 'description_review_batch_input_jsonl',
                  'digest': 'sha256:' + sha(batch_bytes)})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': RUN,
    'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI Codex', 'model': 'Inherited Codex session; exact runtime model identifier not exposed',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + sha((OWN / 'generation-parameters.actual.json').read_bytes()),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': ids, 'inputArtifacts': artifacts,
    'startedAt': render['atUTC'], 'completedAt': completed, 'status': 'completed',
    'outputDigest': 'sha256:' + sha(records_file.read_bytes()),
    'toolchainVersion': 'goal-description-review-v2',
}
write(results / (batch['batchId'] + '.run.json'), run)
write(OWN / 'independent-current-scientific-decisions.actual.json', {
    'completedUtc': completed, 'reviewer': '/root independent D-B',
    'bookDigest': campaign['bookDigest'], 'bundleFingerprint': campaign['bundleFingerprint'],
    'rows': [{'goalId': r['goalId'], 'decision': r['decision'],
              'rationale': r['rationale']} for r in records],
    'openFindings': [{'goalId': 'd3cd250f-5221-589d-aa1c-44a4692d1acb',
                      'kind': 'semantic-atomicity', 'decision': 'split_review',
                      'resolved': False}],
    'otherReviewerScientificJudgementsConsulted': False,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': 0,
    'newStrictClosuresBeforeIntegration': 0, 'nativeDValidationPending': True,
})
print('Serialized exactly eight manual independent D-B decisions: seven keep, one unresolved split_review; no active integration.')
