from pathlib import Path
import datetime
import hashlib
import json

base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
own = base / 'chemie-b008-current-seven-native-description-independent-a-v1'
native_parent = base / 'chemie-b008-current-twenty-six-native-preparation-author-v1/seven-operative-native-preparation-v2'
native = native_parent / 'native-seven'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

def bind(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write_new(path, value):
    with path.open('x', encoding='utf-8') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')

expected_first = {
    'native-seven-description.first.independent-A.verdict.json': '2334c229c4f77843895721481094fd6c4de033620d1b82d53e5ea5178d5be705',
    'native-seven-description.first.independent-A.freeze.json': '7de0fd20f4ac228aa12218281e66a631a7484f055d9c616d9a3f70f3c21a69b4',
    'native-seven-description.first.independent-A.records.jsonl': '55d00c649566ee08c273feedce40bd0bd50ef93cc585e01d5d7fdb840cd9ccad',
    'native-seven-description.first.independent-A.criteria-notes.json': '802cb5d4228f4410ca1b6ccb5097a55add57f145a1c07a6109d70a5506164b0a',
    'native-seven-description.actual-input.first.freeze.json': 'e62c2b43683820c4ceac52ca21d5259a004d20751eb24e038b13c3a5ad91463f',
}
for name, expected in expected_first.items():
    assert bind(own / name)['sha256'] == 'sha256:' + expected, name

campaign = json.loads((native / 'round-a/description-review-campaign.json').read_text())
batch = campaign['batches'][0]
validation_path = own / 'native-seven-description.ordinary-campaign-results.validation.json'
validation = json.loads(validation_path.read_text())
assert validation['errors'] == [] and validation['records'] == 7
records_path = own / 'results' / (batch['batchId'] + '.records.jsonl')
run_path = own / 'results' / (batch['batchId'] + '.run.json')
assert records_path.read_bytes() == (own / 'native-seven-description.first.independent-A.records.jsonl').read_bytes()
records = [json.loads(line) for line in records_path.read_bytes().splitlines()]
assert all(row['decision'] == 'keep' and row['recordStatus'] == 'candidate' and row['reviewAuthority'] == 'ai_candidate' for row in records)

entry_path = own / 'completed-native-seven-description-independent-a.integration-entry.json'
write_new(entry_path, {
    'schemaVersion': 1,
    'role': 'Self-contained independent A blind Native7 description-only campaign completion; ordinary records and run preserve the already sealed first judgments',
    'completedAt': now,
    'reviewer': '/root/bio_science14_independent_a; concrete model variant unexposed',
    'neutralAuthorEntry': bind(native_parent / 'neutral-current-seven-actual-operative-native-independent-review.entry.json'),
    'neutralAuthorEntryBindingOnly': 'The entry bytes are bound for routing; no author P7 materials or peer D7 judgments were read for this D-only review.',
    'exactInputFirstFreeze': bind(own / 'native-seven-description.actual-input.first.freeze.json'),
    'independentFirstVerdict': bind(own / 'native-seven-description.first.independent-A.verdict.json'),
    'independentFirstFreeze': bind(own / 'native-seven-description.first.independent-A.freeze.json'),
    'independentFirstCriteriaNotes': bind(own / 'native-seven-description.first.independent-A.criteria-notes.json'),
    'independentFirstRecords': bind(own / 'native-seven-description.first.independent-A.records.jsonl'),
    'ordinaryD': {
        'campaign': bind(native / 'round-a/description-review-campaign.json'),
        'bundle': bind(native / 'round-a/review-bundle-manifest.json'),
        'fullBilingualContextInput': bind(native / 'round-a/description-review-input.json'),
        'prompt': bind(native / 'round-a/prompt.md'),
        'criteria': bind(native / 'round-a/criteria.md'),
        'recordSchema': bind(native / 'round-a/contracts/goal-description-review-record.schema.json'),
        'batchInput': bind(native / 'round-a/batches' / (batch['batchId'] + '.input.jsonl')),
        'batchesDirectory': str(native / 'round-a/batches'),
        'resultsDirectory': str(own / 'results'),
        'records': bind(records_path),
        'runManifest': bind(run_path),
        'generationParameters': bind(own / 'native-seven-description.actual-generation-parameters.json'),
        'runMaterializationNotes': bind(own / 'native-seven-description.ordinary-run-materialization.notes.json'),
        'actualValidation': bind(validation_path),
        'actualTerminalReceipts': bind(own / 'native-seven-description.validation.actual-terminal-receipts.json'),
        'ordinaryValidatorErrors': validation['errors'],
        'ordinaryValidatorRecordCount': validation['records'],
        'firstToOrdinaryRecordBytesExact': True,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'batchId': batch['batchId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        'promptFingerprint': campaign['promptFingerprint'],
        'criteriaFingerprint': campaign['criteriaFingerprint'],
        'reviewInputFingerprint': campaign['reviewInputFingerprint'],
    },
    'actualNativeArtifacts': {
        'HTML': bind(native / 'bundle/book.html'),
        'PDF': bind(native / 'bundle/book.pdf'),
        'physicalPDFGoalPagesActuallyInspected': [3, 4, 5, 6, 7, 8, 9],
        'wholeHTMLReadableText': bind(own / 'actual-native-seven-full-html-readable-text.txt'),
        'wholePDFReadableText': bind(own / 'actual-native-seven-full-pdf-readable-text.txt'),
        'temporaryPageRenderLocations': bind(own / 'actual-native-seven-pdf-page-working-locations.json'),
    },
    'scopeAndLimits': {
        'goalIds': batch['goalIds'],
        'wholeBilingualGoalsActuallyRead': 7,
        'wholeDReviewContextsActuallyRead': 7,
        'DKeepCandidates': 7,
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
        'needsHumanReview': True,
        'blindToOtherRuns': True,
        'descriptionAuthorIsThisReviewer': False,
        'originalP7MaterialAuthorIsThisReviewer': True,
        'ownP7MaterialBodiesReadForDReview': False,
        'peerNativeD7OutputsReadBeforeFirstSeal': False,
        'P7ApprovalByThisReviewer': False,
        'profileRecommendationCreateMeaning': 'All seven supplied D reviewContext.evidenceProfile values are null. Ordinary create recommendations refer only to that supplied input; they neither create nor approve the reviewer-authored P7 materials.',
        'visualApprovalRepeated': False,
        'wholeSourceCourseFrameApproved': False,
        'e5aUnspecifiedCourseResolved': False,
        'atlas354Versus395HoldClosed': False,
        'protectedEightContextsApproved': False,
        'humanApproval': False,
        'humanTrial': False,
        'realLearnerExecutionClaimed': False,
        'strictGain': 0,
        'activeWrites': [],
    },
})
freeze_path = own / 'native-seven-description.completed.integration.freeze.json'
outputs = sorted(path for path in own.rglob('*') if path.is_file() and path != freeze_path)
write_new(freeze_path, {
    'schemaVersion': 1,
    'role': 'Final independent Native7 D-only ordinary campaign and handoff freeze; original first judgments and input seals unchanged',
    'sealedAt': now,
    'entry': bind(entry_path),
    'outputs': [bind(path) for path in outputs],
    'originalFirstBindingsVerifiedUnchanged': [bind(own / name) for name in expected_first],
    'blindToOtherRuns': True,
    'ordinaryCampaignValidationErrors': [],
    'ordinaryCampaignRecords': 7,
    'humanApproval': False,
    'humanTrial': False,
    'ownP7Approval': False,
    'strictGain': 0,
})
print(json.dumps({'entry': bind(entry_path), 'finalFreeze': bind(freeze_path), 'resultsDirectory': str(own / 'results'), 'validation': bind(validation_path)}, indent=2))
