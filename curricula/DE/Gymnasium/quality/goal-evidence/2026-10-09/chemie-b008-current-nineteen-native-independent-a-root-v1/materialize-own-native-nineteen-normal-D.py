# SPDX-License-Identifier: Apache-2.0
"""Materialize the already sealed scientific FIRST in the normal D contract."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import jsonschema

OWN = Path(__file__).resolve().parent
ROOT = next(p for p in OWN.parents if (p / '.git').exists() and (p / 'AGENTS.md').is_file())
ROUND = OWN.parent / 'chemie-b008-current-twenty-six-native-preparation-author-v1/nineteen-operative-native-preparation-v2/native-nineteen/round-a'


def load(p):
    return json.loads(p.read_text())


def digest(raw):
    return 'sha256:' + hashlib.sha256(raw).hexdigest()


def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': digest(raw), 'bytes': len(raw)}


def put(p, value):
    with p.open('x') as out:
        out.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


campaign = load(ROUND / 'description-review-campaign.json')
bundle = load(ROUND / 'review-bundle-manifest.json')
first = load(OWN / 'native-nineteen-description.independent-A-root.first.verdict.json')
input_first = load(OWN / 'native-nineteen-current-input.independent-A-root.first.freeze.json')
records_path = ROOT / first['records']['path']
records_bytes = records_path.read_bytes()
assert digest(records_bytes) == first['records']['sha256']
records = [json.loads(line) for line in records_bytes.splitlines()]
batch = campaign['batches'][0]
assert len(records) == 19 and len(campaign['batches']) == 1
assert [row['goalId'] for row in records] == batch['goalIds']
assert len({row['runId'] for row in records}) == 1
batch_path = ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')
batch_bytes = batch_path.read_bytes()
assert digest(batch_bytes) == batch['batchInputFingerprint']
assert first['currentNativePeerOutcomeReadBeforeFirst'] is False

results = OWN / 'normal-D19-results'
results.mkdir(exist_ok=False)
normal_records_path = results / (batch['batchId'] + '.records.jsonl')
with normal_records_path.open('xb') as out:
    out.write(records_bytes)
parameters_path = OWN / 'native-nineteen.actual-run-generation-parameters.json'
put(parameters_path, {'schemaVersion': 1, 'provider': 'OpenAI', 'actualToolModel': None,
                     'modelVariantUnexposed': True, 'temperature': None, 'seed': None,
                     'modelVersion': None,
                     'notes': 'Actual own independent scientific FIRST preceded peer Native19 D outcomes. Concrete model variant/settings are not exposed by this tool; null is unavailable metadata, not a chosen setting.',
                     'humanApproval': False})
artifacts = {row['role']: row for row in bundle['artifacts']}
roles = ['book_pdf', 'book_html', 'review_prompt', 'review_criteria', 'run_manifest_schema']
inputs = [{'role': role, 'digest': artifacts[role]['digest']} for role in roles]
inputs.append({'role': 'description_review_batch_input_jsonl', 'digest': digest(batch_bytes)})
completed = datetime.now(timezone.utc).isoformat()
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
       'schemaVersion': 1, 'runId': records[0]['runId'], 'campaignId': campaign['campaignId'],
       'roundId': campaign['roundId'], 'batchId': batch['batchId'],
       'batchInputFingerprint': batch['batchInputFingerprint'],
       'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
       'provider': 'OpenAI', 'model': 'unexposed-by-current-tool', 'role': 'subject_reviewer',
       'promptFamilyId': 'goal-description-understanding-evidence-v2',
       'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
       'generationParametersFingerprint': digest(parameters_path.read_bytes()),
       'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
       'goalIds': batch['goalIds'], 'inputArtifacts': inputs,
       'startedAt': input_first['createdAt'], 'completedAt': completed, 'status': 'completed',
       'outputDigest': digest(records_bytes), 'toolchainVersion': 'root-actual-native19-D-FIRST-v1'}
run_path = results / (batch['batchId'] + '.run.json')
put(run_path, run)
d_validator = jsonschema.Draft202012Validator(load(ROOT / 'contracts/goal-description-review/v1/goal-description-review-record.schema.json'))
r_validator = jsonschema.Draft202012Validator(load(ROOT / 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'))
for row in records:
    d_validator.validate(row)
r_validator.validate(run)
command = [str(ROOT / 'app/node_modules/.bin/tsx'), 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',
           '--bundle', str(ROUND / 'review-bundle-manifest.json'),
           '--input', str(ROUND / 'description-review-input.json'),
           '--campaign', str(ROUND / 'description-review-campaign.json'),
           '--batches-dir', str(ROUND / 'batches'), '--results-dir', str(results)]
started = datetime.now(timezone.utc).isoformat()
result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
receipt_path = OWN / 'D19-root.normal-actual-validation.receipt.json'
put(receipt_path, {'schemaVersion': 1, 'command': command, 'startedAt': started,
                   'completedAt': datetime.now(timezone.utc).isoformat(), 'exitCode': result.returncode,
                   'stdout': result.stdout, 'stderr': result.stderr,
                   'sameNormalValidatorWithoutSuppression': True, 'humanApproval': False})
assert result.returncode == 0, result.stdout + result.stderr
entry_path = OWN / 'completed-current-nineteen-native-description-root-A.normal-entry.json'
put(entry_path, {'schemaVersion': 1, 'role': 'Genuine first science and ordinary Root round-A D19 records',
                 'scientificFirst': bind(OWN / 'native-nineteen-description.independent-A-root.first.verdict.json'),
                 'firstFreeze': bind(OWN / 'native-nineteen-description.independent-A-root.first.freeze.json'),
                 'normalDRecords': bind(normal_records_path), 'normalDRun': bind(run_path),
                 'actualBilingualContextInput': bind(ROUND / 'description-review-input.json'),
                 'campaign': bind(ROUND / 'description-review-campaign.json'),
                 'bundle': bind(ROUND / 'review-bundle-manifest.json'),
                 'ordinaryValidation': bind(receipt_path), 'generationParameters': bind(parameters_path),
                 'all19RecordBytesExactAgainstOwnFirst': records_bytes == normal_records_path.read_bytes(),
                 'blindToCurrentNativeD19PeerRuns': True,
                 'existingSeparateP19EvidenceNotApprovedByNullProfileRecommendation': True,
                 'sourceCourseAtlasAndProtected8Approval': False,
                 'freshVisualApproval': False, 'humanApproval': False, 'humanTrial': False,
                 'newM7Closures': 0, 'restoredM7Bindings': 0, 'netStrictGain': 0, 'activeWrites': []})
put(OWN / 'completed-current-nineteen-native-description-root-A.normal-first.freeze.json',
    {'schemaVersion': 1, 'entry': bind(entry_path), 'normalDRecords': bind(normal_records_path), 'run': bind(run_path)})
print(json.dumps({'normalD19': len(records), 'ordinaryValidationExitCode': result.returncode,
                  'entry': bind(entry_path), 'strictGain': 0}, indent=2))
