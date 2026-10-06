# SPDX-License-Identifier: Apache-2.0
"""Serialize manually read independent D/P decisions with exact current inputs."""
import datetime
import hashlib
import json
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
BASE = OWN.with_name('biologie-ephase-seven-current365-native-candidate-v2')
AUTHOR = OWN.with_name('biologie-ephase-seven-current-native-candidate-v1')
ROUND = BASE / 'native-finalbook/round-b'
campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
manifest = json.loads((ROUND / 'review-bundle-manifest.json').read_text())
batch = campaign['batches'][0]
inputs = [json.loads(line)['goal'] for line in
          (ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')).read_text().splitlines()]
manual_d = json.loads((OWN / 'manual-independent-scientific-decisions.input.json').read_text())
manual_p = json.loads((OWN / 'manual-independent-positive-decisions.input.json').read_text())
assert not manual_d['authorRole'] and not manual_d['otherReviewerFullArtifactsConsulted']
ids = [goal['goalId'] for goal in inputs]
assert set(ids) == set(manual_d['science']) == set(manual_p['science'])
profile_path = AUTHOR / 'positive-evidence.candidates.json'
assert hashlib.sha256(profile_path.read_bytes()).hexdigest() == manual_p['profileAuthorFileSHA256']
profiles = json.loads(profile_path.read_text())
assert set(ids) == {row['goalId'] for row in profiles['goals']}
RUN = 'biologie-ephase-seven-root-independent-b-current365-20261005-v1'


def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def write_json(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


results = OWN / 'results'
results.mkdir(exist_ok=True)
records = []
fields = ['essentialUnderstandingDe', 'essentialUnderstandingEn',
          'observablePerformanceDe', 'observablePerformanceEn',
          'transferExpectationDe', 'transferExpectationEn']
for goal in inputs:
    science = manual_d['science'][goal['goalId']]
    record = {key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint',
                                        'currentTitleDe', 'currentTitleEn',
                                        'currentDescriptionDe', 'currentDescriptionEn']}
    record.update({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': 'bio-ephase-seven-root-b-current365-v1-' + goal['goalId'],
        'runId': RUN, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        'decision': 'keep', 'understandingEvidence': {key: science[key] for key in fields},
        'rationale': science['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
    records.append(record)
records_path = results / (batch['batchId'] + '.records.jsonl')
assert not records_path.exists()
records_path.write_text('\n'.join(json.dumps(row, ensure_ascii=False, separators=(',', ':'))
                                   for row in records) + '\n')
parameters = {
    'workflow': 'Manual independent current seven-goal scientific reading across retained primary sources, complete nine-page PDF and seven actually loaded HTML sections; targeted current365 outer-binding verification.',
    'temperature': 'not exposed', 'sampling': 'not exposed',
    'otherReviewerFullArtifactsConsulted': False,
    'briefOtherReviewerStatusNotificationReceived': True,
    'briefNotificationUsedForScientificVerdict': False,
    'authorOfCurrentTextOrInnerP': False, 'humanApproval': False,
}
write_json(OWN / 'actual-review-parameters.json', parameters)
roles = ['book_model', 'book_pdf', 'book_pdf_render_manifest', 'book_html',
         'book_html_render_manifest', 'review_input_json', 'review_input_jsonl',
         'review_prompt', 'review_criteria']
artifacts = [{'role': row['role'], 'digest': row['digest']} for row in manifest['artifacts']
             if row['role'] in roles]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
started = datetime.datetime.fromtimestamp(
    (OWN / 'independent-primary-source-preparation.actual.json').stat().st_mtime,
    datetime.timezone.utc).isoformat()
completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
write_json(results / (batch['batchId'] + '.run.json'), {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': RUN, 'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI Codex', 'model': 'Inherited Codex session; exact runtime model identifier not exposed',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest((OWN / 'actual-review-parameters.json').read_bytes()),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': ids, 'inputArtifacts': artifacts, 'startedAt': started,
    'completedAt': completed, 'status': 'completed',
    'outputDigest': digest(records_path.read_bytes()), 'toolchainVersion': 'goal-description-review-v2',
})
own_p = {
    'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
    'reviewId': 'biologie-ephase-seven-root-independent-p-current365-20261005-v1',
    'reviewedAt': completed, 'reviewer': 'Codex root independent current scientific P reviewer, not profile author',
    'goals': [],
}
p_rows = []
by_id = {goal['goalId']: goal for goal in inputs}
for source in profiles['goals']:
    gid = source['goalId']
    assert manual_p['science'][gid]['decision'] == 'PASS'
    profile = source['profile']
    own_p['goals'].append({
        'goalId': gid, 'reason': manual_p['science'][gid]['reason'],
        'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'dissent': [], 'profile': profile,
    })
    p_rows.append({
        'goalId': gid, 'currentGoalFingerprint': by_id[gid]['goalFingerprint'],
        'currentPageFingerprint': by_id[gid]['pageFingerprint'],
        'decision': 'PASS', 'reason': manual_p['science'][gid]['reason'],
        'foreignAuthorInnerProfileUnchanged': True,
        'foreignAuthorInnerProfileSHA256': digest(json.dumps(profile, ensure_ascii=False,
            sort_keys=True, separators=(',', ':')).encode()),
        'innerProfileDigestAlgorithm': 'UTF8 JSON sorted keys, compact separators, ensure_ascii=False; equality witness, not native digest replacement',
        'authority': 'ai_candidate', 'humanReviewStatus': 'needs_human_review',
        'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
        'archetype': profile['archetype'],
        'actuallyReadDEENExpectationsAndAllCases': True,
        'caseBriefCount': len(profile['applicationCaseBriefs']),
        'learnerPerformanceObserved': False, 'humanApproval': False,
        'nativeFinalPValidationStillRequired': True,
    })
write_json(OWN / 'positive-evidence.independently-reviewed.candidates.json', own_p)
write_json(OWN / 'independent-positive-scientific-decisions.json', {
    'atUTC': completed, 'rows': p_rows, 'openFindings': [],
    'authorOfCurrentTextOrInnerP': False, 'humanApproval': False,
    'newStrictClosuresBeforeIntegration': 0, 'nativeFinalMaterializationRequired': True,
})
write_json(OWN / 'independent-scientific-decisions.json', {
    'atUTC': completed, 'status': 'own independent scientific D/P reading complete; native D validation pending',
    'reviewer': '/root', 'authorOfCurrentTextOrInnerP': False,
    'otherDReviewFullArtifactsReadBeforeOwnFreeze': False,
    'briefStatusNotificationReceived': True, 'briefNotificationUsedForScientificVerdict': False,
    'actualOriginalCompletePDFPagesRead': list(range(1, 10)),
    'actualLoadedHTMLGoalIdsRead': ids, 'actualCurrentCoverAndFullPage3Viewed': True,
    'actualRetainedFullPrimaryPDFPagesRead': json.loads(
        (OWN / 'independent-primary-source-preparation.actual.json').read_text())['sourcePageViewsActuallyRendered'],
    'wholeCurrent365DInputAndPagePayloadComparisonPerformed': True,
    'currentSevenSemanticPayloadsChanged': False,
    'IUBMBPrimaryKineticsRead': 'https://iubmb.qmul.ac.uk/kinetics/ek4t6.html#p6',
    'primarySourceReadingDecisionComplete': True,
    'existingCurrentAAndMAndVRetained': True,
    'RGTMemoryRequiredRetained': True, 'wholeUmbrellaSourceCompetencesClosed': False,
    'rows': [{'goalId': goal['goalId'], 'decision': 'KEEP',
              'rationale': manual_d['science'][goal['goalId']]['rationale']} for goal in inputs],
    'openFindings': [], 'learnerPerformanceObserved': False,
    'humanApproval': False, 'activeWrites': 0, 'newStrictClosuresBeforeIntegration': 0,
})
print('Serialized seven manually read independent D-B and seven independently reviewed unchanged inner P profiles; native final gates remain required.')
