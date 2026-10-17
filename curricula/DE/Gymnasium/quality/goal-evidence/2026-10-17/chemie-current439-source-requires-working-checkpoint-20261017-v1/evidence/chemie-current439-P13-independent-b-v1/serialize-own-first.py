"""Technical stock serialization of the already sealed P13 ROUND-B judgments.

This script makes no scientific judgment and changes no sealed source file.
All output stays alongside this script, outside the repository.
"""
import datetime
import hashlib
import json
import pathlib


OUT = pathlib.Path(__file__).resolve().parent
SELECTOR = pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-P13-native-preparation-technical-root-v1/SELECTOR.clean-current-native13-reviewer-inputs.sealed.json')
FIRST = OUT / 'FIRST.independent13.actual-decisions.sealed.json'
EXPECTED_SELECTOR = '45ac7189db1533bbda09ca83b03f007a78269903a57db3e80b51cd4e855be3c7'
EXPECTED_FIRST = '7a3a47dfd7812c48afc87203400f57530347994b865c874b4b75fb22f7eccbcc'
RUN_ID = 'chemie-current439-P13-independent-b-20261017-v1-run'
EVIDENCE_FIELDS = (
    'essentialUnderstandingDe', 'essentialUnderstandingEn',
    'observablePerformanceDe', 'observablePerformanceEn',
    'transferExpectationDe', 'transferExpectationEn',
)
CURRENT_FIELDS = (
    'goalId', 'goalFingerprint', 'pageFingerprint',
    'currentTitleDe', 'currentTitleEn',
    'currentDescriptionDe', 'currentDescriptionEn',
)


def sha_bytes(value):
    return 'sha256:' + hashlib.sha256(value).hexdigest()


def load_json(path):
    return json.loads(path.read_bytes())


def stable_digest(value):
    return sha_bytes(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def write_json(name, value):
    path = OUT / name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return path


assert sha_bytes(SELECTOR.read_bytes()) == 'sha256:' + EXPECTED_SELECTOR
assert sha_bytes(FIRST.read_bytes()) == 'sha256:' + EXPECTED_FIRST
selector = load_json(SELECTOR)
first = load_json(FIRST)
native = pathlib.Path(selector['nativeRoot'])
capsule = pathlib.Path(selector['capsule'])
round_selector = next(item for item in selector['rounds'] if item['round'] == 'round-b')

# Only ROUND-B campaign/input data are opened. Other selector entries are metadata.
verified_pins = []
for pin in selector['commonInputPins'] + selector['bundleArtifactPins'] + round_selector['inputPins'] + selector['cleanSupplementPins']:
    path = pathlib.Path(pin['path'])
    raw = path.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == pin['sha256'], str(path)
    assert len(raw) == pin['bytes'], str(path)
    verified_pins.append({'path': str(path), 'sha256': pin['sha256'], 'bytes': len(raw)})

campaign = load_json(native / 'round-b/description-review-campaign.json')
review_input = load_json(native / 'round-b/description-review-input.json')
bundle = load_json(native / 'bundle/manifest.json')
assert campaign['campaignId'] == round_selector['campaignId']
assert campaign['roundId'] == round_selector['roundId']
assert campaign['independenceGroupId'] == round_selector['independenceGroupId']
assert campaign['bundleFingerprint'] == bundle['bundleFingerprint'] == selector['bundleFingerprint']
assert campaign['bookDigest'] == bundle['bookModelDigest'] == selector['bookDigest']
assert review_input['reviewInputFingerprint'] == selector['reviewInputFingerprint']
assert len(campaign['batches']) == 1
assert len(review_input['goals']) == len(first['decisions']) == 13
assert [goal['goalId'] for goal in review_input['goals']] == selector['goalIds']
assert [decision['goalId'] for decision in first['decisions']] == selector['goalIds']

records = []
for index, (goal, decision) in enumerate(zip(review_input['goals'], first['decisions']), 1):
    assert goal['goalId'] == decision['goalId']
    for key in ('currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn'):
        assert goal[key] == decision[key], (goal['goalId'], key)
    assert decision['decision'] == 'keep'
    assert decision['evidenceProfileRecommendation'] == 'none'
    understanding = {key: decision[key] for key in EVIDENCE_FIELDS}
    assert all(isinstance(value, str) and value.strip() == value and value for value in understanding.values())
    records.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': RUN_ID + f'.record-{index:03d}',
        'runId': RUN_ID,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{key: goal[key] for key in CURRENT_FIELDS},
        'decision': decision['decision'],
        'understandingEvidence': understanding,
        'rationale': decision['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': decision['evidenceProfileRecommendation'],
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    })

record_path = OUT / 'description-records.jsonl'
record_path.write_text(''.join(json.dumps(record, ensure_ascii=False) + '\n' for record in records))
round_trip = [json.loads(line) for line in record_path.read_text().splitlines()]
assert round_trip == records
for original, record in zip(first['decisions'], round_trip):
    assert record['decision'] == original['decision']
    assert record['rationale'] == original['rationale']
    assert record['evidenceProfileRecommendation'] == original['evidenceProfileRecommendation']
    assert record['understandingEvidence'] == {key: original[key] for key in EVIDENCE_FIELDS}

declaration = {
    'reviewerTask': '/root/chemie_current439_jurisdiction20_native_independent_b_20261017',
    'reviewerExecutionInterface': 'Codex collaboration subagent',
    'model': 'Codex GPT-6 family; exact executing model identifier unavailable',
    'provider': 'OpenAI',
    'modelIdentityEvidence': 'System identifies Codex based on GPT-6; the exact executing backend identifier, version and sampling parameters are unavailable.',
    'noModelOverrideRequested': True,
    'samplingParameters': 'not exposed',
    'scientificDecisionsSource': FIRST.name,
    'scientificDecisionsSha256': 'sha256:' + EXPECTED_FIRST,
    'selectorSource': str(SELECTOR),
    'selectorSha256': 'sha256:' + EXPECTED_SELECTOR,
    'reviewScope': 'P13 ROUND-B only',
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'independenceAttestation': 'The P13 reviewer completed and sealed its own FIRST without other P13 run exposure. Its earlier disjoint Requires20 work was a nonblind diagnostic and provided no P13 review exposure.',
    'peerResultAccessBeforeFirst': False,
    'technicalSerializerTask': '/root/chemie_current439_jurisdiction20_native_independent_b_20261017/p13_native_serialization_only',
    'technicalSerializationOnly': True,
    'technicalSerializerMakesScientificJudgments': False,
    'sealedFirstPrecedesStockSerialization': FIRST.stat().st_mtime < record_path.stat().st_mtime,
    'scientificDecisionValuesPreservedExactly': True,
    'currentBilingualTextsPreservedExactly': True,
    'recordStatus': 'candidate',
    'reviewAuthority': 'ai_candidate',
    'humanApprovalClaim': False,
}
declaration_path = write_json('execution-declaration.json', declaration)
started = datetime.datetime.fromtimestamp((OUT / 'input-pin-verification.json').stat().st_mtime, datetime.timezone.utc).isoformat()
completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': RUN_ID,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': campaign['batches'][0]['batchId'],
    'batchInputFingerprint': campaign['batches'][0]['batchInputFingerprint'],
    'bundleFingerprint': bundle['bundleFingerprint'],
    'bookDigest': bundle['bookModelDigest'],
    'provider': 'OpenAI',
    'model': declaration['model'],
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': bundle['promptFingerprint'],
    'criteriaFingerprint': bundle['criteriaFingerprint'],
    'generationParametersFingerprint': sha_bytes(declaration_path.read_bytes()),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': [record['goalId'] for record in records],
    'inputArtifacts': [{'role': artifact['role'], 'digest': artifact['digest']} for artifact in bundle['artifacts']] + [
        {'role': 'description_review_batch_input_jsonl', 'digest': campaign['batches'][0]['batchInputFingerprint']}
    ],
    'startedAt': started,
    'completedAt': completed,
    'status': 'completed',
    'outputDigest': sha_bytes(record_path.read_bytes()),
    'toolchainVersion': 'skillpilot-goal-description-review-v2',
}
write_json('run-manifest.json', run)

# Whole-source wrappers are parsed only for exact stable digests and profile bindings.
# No reason/reviewer/status/history values are printed, interpreted or copied.
book_model = load_json(native / 'bundle/book-model.json')
source = book_model['source']
whole_pins = []
for path_key, digest_key in (
    ('landscapePath', 'landscapeDigest'),
    ('semanticKindLedgerPath', 'semanticKindLedgerDigest'),
    ('compositionViewPath', 'compositionViewDigest'),
    ('goalVisualizationQaPath', 'goalVisualizationQaDigest'),
):
    path = capsule / source[path_key]
    data = load_json(path)
    digest = stable_digest(data)
    assert digest == source[digest_key], path_key
    whole_pins.append({'role': path_key, 'path': str(path), 'stableModelDigest': digest, 'byteSha256': sha_bytes(path.read_bytes())})
profile_path = capsule / source['evidenceReviewSources'][0]['path']
profile_records = [json.loads(line) for line in profile_path.read_text().splitlines() if line.strip()]
assert stable_digest(profile_records) == source['evidenceReviewSources'][0]['digest']
whole_pins.append({'role': 'wholeP439', 'path': str(profile_path), 'stableModelDigest': stable_digest(profile_records), 'byteSha256': sha_bytes(profile_path.read_bytes())})
canonical_by_id = {goal['id']: goal for goal in load_json(capsule / source['landscapePath'])['goals']}
profile_by_id = {record['goalId']: record['profile'] for record in profile_records}
semantic_by_id = {record['goalId']: record['semanticKind'] for record in load_json(capsule / source['semanticKindLedgerPath'])['decisions']}
assert len(canonical_by_id) == 650
assert len(profile_by_id) == 439
for goal in review_input['goals']:
    canonical = canonical_by_id[goal['goalId']]
    for canonical_key, input_key in (
        ('title', 'currentTitleDe'), ('titleEn', 'currentTitleEn'),
        ('description', 'currentDescriptionDe'), ('descriptionEn', 'currentDescriptionEn'),
    ):
        assert canonical[canonical_key] == goal[input_key], (goal['goalId'], input_key)
    assert profile_by_id[goal['goalId']] == goal['reviewContext']['evidenceProfile']['profile']
    assert semantic_by_id[goal['goalId']] == 'curricularAtomic'

write_json('whole-current-inputs-and-own-round-check.json', {
    'selectorSha256': 'sha256:' + EXPECTED_SELECTOR,
    'sealedFirstSha256': 'sha256:' + EXPECTED_FIRST,
    'verifiedFrozenInputPins': verified_pins,
    'wholeCurrentSourcePins': whole_pins,
    'currentCanonicalGoalCount': len(canonical_by_id),
    'currentPCount': len(profile_by_id),
    'reviewedExactMatches': 13,
    'bilingualCurrentTextsExact': True,
    'allSixUnderstandingEvidenceFieldsExact': True,
    'rationalesAndDecisionsExact': True,
    'profileBodiesExact': True,
    'semanticKindsExact': '13 curricularAtomic',
    'recordOrderExact': True,
    'candidateOnly': True,
    'round': 'round-b',
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'independenceGroupId': campaign['independenceGroupId'],
    'sealedFirstPrecedesStockSerialization': declaration['sealedFirstPrecedesStockSerialization'],
    'technicalSerializationOnly': True,
    'peerResultsReadByTechnicalSerializer': False,
    'humanApprovalClaim': False,
})
assert sha_bytes(FIRST.read_bytes()) == 'sha256:' + EXPECTED_FIRST
assert sha_bytes(SELECTOR.read_bytes()) == 'sha256:' + EXPECTED_SELECTOR
print('Serialized exactly 13 sealed P13 ROUND-B decisions; exact current C650/P439/SEM650 bindings verified.')
