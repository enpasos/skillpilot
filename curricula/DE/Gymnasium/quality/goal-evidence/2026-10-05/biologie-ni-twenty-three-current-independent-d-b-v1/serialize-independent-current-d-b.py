# SPDX-License-Identifier: Apache-2.0
"""Serialize explicitly recorded science, without generating review decisions."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.with_name('biologie-ni-ten-current-native-author-candidate-v2')
manual = json.loads((OWN / 'manual-current-scientific-decisions.input.json').read_text())
assert manual['authorRole'] is False
assert manual['otherReviewerScientificDescriptionJudgementsConsulted'] is False
FIELDS = ['essentialUnderstandingDe', 'essentialUnderstandingEn',
          'observablePerformanceDe', 'observablePerformanceEn',
          'transferExpectationDe', 'transferExpectationEn']


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


preparation = json.loads((OWN / 'actual-independent-view-preparation.receipt.json').read_text())
html = json.loads((OWN / 'actual-independent-current-html.receipt.json').read_text())
assert len(preparation['pages']) == 42
for page in preparation['pages']:
    assert sha((ROOT / page['actualPNG']).read_bytes()) == page['pngSHA256']
    assert sha((ROOT / page['source']).read_bytes()) == page['sourceSHA256']
for book in html['books']:
    assert not book['failures']
    assert sha(Path(book['actualHTML']).read_bytes()) == book['htmlSHA256']
    for screen in book['screenshots']:
        assert sha(Path(screen['path']).read_bytes()) == screen['sha256']
    for artifact in book['requests']:
        assert sha(Path(artifact['actualFile']).read_bytes()) == artifact['sha256']

completed = datetime.now(timezone.utc).isoformat()
parameters = {
    'workflow': 'Manual independent current D-B23 from actual 42 PDF views, 23 loaded whole HTML pages and exact current bilingual/source/context inputs; 18 bounded NI descriptions plus five targeted existing bindings.',
    'temperature': 'not exposed', 'sampling': 'not exposed',
    'authorRole': False, 'otherReviewerScientificDescriptionJudgementsConsulted': False,
    'technicalOtherReviewerCompletionCountsReceived': True,
    'technicalCountsUsedForScientificVerdict': False,
    'briefPositiveReviewStatusReceived': True,
    'positiveProfilesReadByThisDescriptionReviewer': False,
    'positiveReviewBriefUsedForDescriptionVerdict': False,
    'authorBeforeAfterSourcePageReceiptsInspected': True,
    'historicalScientificJudgementsRestarted': False,
    'allExistingSourceContextConvertedToFullNormativeProof': False,
    'original360680IndependentVisualizationApproval': False,
    'humanApproval': False, 'actualLearnerPerformanceObserved': False,
}
write(OWN / 'generation-parameters.actual.json', parameters)
seen_ids = []
summary = []
for label, book_name in [
    ('d18', 'native-eighteen-current49-all-images-finalbook'),
    ('d5', 'native-existing-five-current49-bindings-finalbook'),
]:
    round_dir = AUTHOR / book_name / 'round-b'
    campaign = json.loads((round_dir / 'description-review-campaign.json').read_text())
    bundle = json.loads((round_dir / 'review-bundle-manifest.json').read_text())
    batch = campaign['batches'][0]
    batch_bytes = (round_dir / 'batches' / (batch['batchId'] + '.input.jsonl')).read_bytes()
    inputs = [json.loads(line)['goal'] for line in batch_bytes.splitlines()]
    ids = [g['goalId'] for g in inputs]
    actual_html_book = next(b for b in html['books'] if b['label'] == label)
    assert [s['goalId'] for s in actual_html_book['actualGoalSections']] == ids
    assert all(len(s['images']) == 1 and s['images'][0]['complete']
               for s in actual_html_book['actualGoalSections'])
    assert all(g['reviewContext']['evidenceProfile'] is None for g in inputs)
    seen_ids.extend(ids)
    run_id = 'biologie-ni-' + label + '-root-independent-d-b-20261005-v1'
    records = []
    for goal in inputs:
        judgement = manual['science'][goal['goalId']]
        assert judgement['decision'] in ['keep', 'revise', 'split_review', 'block']
        record = {k: goal[k] for k in [
            'goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe',
            'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']}
        record.update({
            '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
            'schemaVersion': 1, 'recordId': 'bio-ni-root-b-v1-' + goal['goalId'],
            'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
            'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
            'decision': judgement['decision'],
            'understandingEvidence': {f: judgement[f] for f in FIELDS},
            'rationale': judgement['rationale'],
            'evidenceProfileContract': 'positive-understanding-evidence-v2',
            'evidenceProfileRecommendation': 'create',
            'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
        })
        if judgement['decision'] == 'revise':
            record.update({f: judgement[f] for f in ['proposedDescriptionDe', 'proposedDescriptionEn']})
        records.append(record)
    result_dir = OWN / (label + '-results')
    result_dir.mkdir()
    records_path = result_dir / (batch['batchId'] + '.records.jsonl')
    records_path.write_text('\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'))
                                      for r in records) + '\n')
    consumed_roles = ['book_pdf', 'book_html', 'review_prompt', 'review_criteria']
    artifacts = [{'role': a['role'], 'digest': a['digest']}
                 for a in bundle['artifacts'] if a['role'] in consumed_roles]
    artifacts.append({'role': 'description_review_batch_input_jsonl',
                      'digest': 'sha256:' + sha(batch_bytes)})
    run = {
        '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
        'schemaVersion': 1, 'runId': run_id,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        'provider': 'OpenAI Codex',
        'model': 'Inherited Codex session; exact runtime model identifier not exposed',
        'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
        'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
        'generationParametersFingerprint': 'sha256:' + sha((OWN / 'generation-parameters.actual.json').read_bytes()),
        'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
        'goalIds': ids, 'inputArtifacts': artifacts,
        'startedAt': preparation['preparedUTC'], 'completedAt': completed, 'status': 'completed',
        'outputDigest': 'sha256:' + sha(records_path.read_bytes()),
        'toolchainVersion': 'goal-description-review-v2',
    }
    write(result_dir / (batch['batchId'] + '.run.json'), run)
    summary.append({'label': label, 'bookDigest': campaign['bookDigest'],
                    'bundleFingerprint': campaign['bundleFingerprint'],
                    'rows': [{'goalId': r['goalId'], 'decision': r['decision'],
                              'rationale': r['rationale']} for r in records]})
assert len(seen_ids) == 23 and set(seen_ids) == set(manual['science'])
write(OWN / 'actual-input-reading.completed.receipt.json', {
    'completedUTC': completed, 'reviewer': '/root independent current D-B',
    'authorRole': False, 'otherReviewerScientificDescriptionJudgementsConsulted': False,
    'actualPDFViewsSeen': [{**p, 'seenByReviewer': True} for p in preparation['pages']],
    'actualLoadedHTMLGoalPagesSeen': seen_ids,
    'all23WholeLoadedDOMTextsRead': True, 'all23ActualLoadedScreenshotsSeen': True,
    'actualHTMLSHA256': {b['label']: b['htmlSHA256'] for b in html['books']},
    'allCurrentDEENDescriptionsAndCanonicalContextsRead': True,
    'sourceWholePagesActuallyRead': ['NI75', 'NI76', 'NI77', 'NI81', 'NI84', 'NI87',
                                    'NI88', 'NI89', 'NI90', 'NI91', 'NI103', 'NI104',
                                    'HE35', 'HE36', 'HE39'],
    'exact16ChangedSourceClausesAndTheirPartialMappingsRead': True,
    'exactFiveChangedExistingNISourceBindingsRead': True,
    'wholeNIProteinFourLevelsNormativeApproval': False,
    'wholeHerbariumPracticalCompetenceClosedByIdentificationAid': False,
    'wholeNIPedigreeClauseClosedByRemovingRecombination': False,
    'unchangedHistoricalScientificReviewsRestarted': False,
    'allPositiveProfilesAndCasesReviewedByThisReviewer': False,
    'original360680IndependentVisualizationApprovalByThisReviewer': False,
    'humanApproval': False, 'humanTrial': False, 'learnerPerformanceObserved': False,
    'activeWrites': 0, 'newStrictClosuresBeforeIntegration': 0,
})
write(OWN / 'independent-current-scientific-description-decisions.actual.json', {
    'completedUTC': completed, 'reviewer': '/root independent current D-B',
    'books': summary, 'openDescriptionFindings': [],
    'continuedSourceBoundaries': [
        'NI84 enzyme context does not establish a normative requirement for all four protein structural levels; HE36 establishes the unchanged whole goal.',
        'The old retained NI76 herbarium context is not a practical herbarium completion.',
        'NI87 diploidy and recombination pedigree clause remains whole and partial; the simple family-indication atom does not replace it.',
        'Raw GK/LK tags do not convert these NI-only SekI G9 projections to SekII.',
    ],
    'positiveProfileGateApprovedByThisDescriptionReview': False,
    'otherReviewerScientificDescriptionJudgementsConsulted': False,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': 0,
    'newStrictClosuresBeforeIntegration': 0, 'nativeValidationPendingAtSerialization': True,
})
print('Serialized 23 explicit independent current D-B decisions; no active integration or closure.')
