# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
import jsonschema

R = Path(__file__).resolve().parents[8]
O = Path(__file__).resolve().parents[1]
T = O.parent / 'chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1'


def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(R)), 'bytes': len(b), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest()}


def write(p, x):
    assert not p.exists()
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')


first = O / 'FIRST-SCIENCE-SEAL.current412-five-whole-native-pages-independent-a.actual.json'
assert bind(first)['sha256'] == 'sha256:30813ea116fb43827e245671631bea9ccc876ccc01098c8d19694f40526f8f09'
first_data = json.loads(first.read_text())
campaign_path = T / 'native-five/round-a/description-review-campaign.json'
campaign = json.loads(campaign_path.read_text())
bundle_path = T / 'native-five/round-a/review-bundle-manifest.json'
bundle = json.loads(bundle_path.read_text())
batch = campaign['batches'][0]
records_path = O / 'results' / (batch['batchId'] + '.records.jsonl')
assert bind(records_path)['sha256'] == first_data['originalFiveScientificRecords']['sha256']
record_rows = [json.loads(x) for x in records_path.read_text().splitlines()]
params = O / 'inputs/ACTUAL.known-provider-model-and-unexposed-generation-settings.json'
write(params, {'schemaVersion': 1, 'provider': 'OpenAI', 'model': 'GPT-6 Codex',
               'exactModelRevision': None, 'samplingParameters': None,
               'statement': 'Known agent model identity only; exact provider revision/temperature/seed/reasoning sampling settings are not exposed. No invented generator or reviewer revision.'})
roles = {'book_model', 'book_pdf', 'book_pdf_render_manifest', 'book_html', 'book_html_render_manifest',
         'review_prompt', 'review_criteria', 'finding_schema', 'run_manifest_schema'}
artifacts = [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in roles]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
run_path = O / 'results' / (batch['batchId'] + '.run.json')
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': record_rows[0]['runId'],
    'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'], 'provider': 'OpenAI', 'model': 'GPT-6 Codex',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': bind(params)['sha256'], 'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True, 'goalIds': batch['goalIds'], 'inputArtifacts': artifacts,
    'startedAt': '2026-10-14T03:23:54.269828+00:00', 'completedAt': first_data['scienceCompletedAtUTC'],
    'status': 'completed', 'outputDigest': bind(records_path)['sha256'],
    'toolchainVersion': 'skillpilot-stock-goal-description-review-v2',
}
write(run_path, run)
record_schema = T / 'native-five/round-a/contracts/goal-description-review-record.schema.json'
run_schema = R / 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'
for row in record_rows:
    jsonschema.validate(row, json.loads(record_schema.read_text()))
jsonschema.validate(run, json.loads(run_schema.read_text()))
write(O / 'checks/ACTUAL.original-native-five-records-and-full-run-closed-schema-validation.json', {
    'schemaVersion': 1, 'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'status': 'PASS',
    'recordCount': len(record_rows), 'recordSchema': bind(record_schema), 'runSchema': bind(run_schema),
    'records': bind(records_path), 'run': bind(run_path), 'firstScienceUnchanged': bind(first),
    'exactRevisionAndSamplingNotFabricated': True,
})
cmd = [
    'app/node_modules/.bin/tsx', 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',
    '--bundle', str(bundle_path.relative_to(R)),
    '--input', str((T / 'native-five/round-a/description-review-input.json').relative_to(R)),
    '--campaign', str(campaign_path.relative_to(R)),
    '--batches-dir', str((T / 'native-five/round-a/batches').relative_to(R)),
    '--results-dir', str((O / 'results').relative_to(R)),
]
started = datetime.now(timezone.utc).isoformat()
p = subprocess.run(cmd, cwd=R, text=True, capture_output=True)
ended = datetime.now(timezone.utc).isoformat()
(O / 'checks/ACTUAL.original-native5-round-a-stock-campaign-results.stdout.txt').write_text(p.stdout)
(O / 'checks/ACTUAL.original-native5-round-a-stock-campaign-results.stderr.txt').write_text(p.stderr)
write(O / 'checks/ACTUAL.original-native5-round-a-stock-campaign-results.receipt.json', {
    'schemaVersion': 1, 'command': cmd, 'startedAtUTC': started, 'endedAtUTC': ended,
    'exitCode': p.returncode, 'status': 'PASS' if p.returncode == 0 else 'FAIL',
    'stockModule': bind(R / 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts'),
    'originalCampaign': bind(campaign_path), 'originalRun': bind(run_path), 'originalRecords': bind(records_path),
    'noOriginalInputOrMetadataChanges': True,
})
print(p.stdout, p.stderr)
assert p.returncode == 0
print(json.dumps({'run': bind(run_path), 'records': bind(records_path)}, indent=2))
