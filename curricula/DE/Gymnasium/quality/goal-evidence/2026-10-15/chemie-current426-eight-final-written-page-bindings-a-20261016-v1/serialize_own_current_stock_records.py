"""Serialize only reviewer A's sealed own amendment against the supplied current round A."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = next(p for p in ROOT.parents if (p / 'AGENTS.md').is_file())
SCIENCE = ROOT / 'FOLLOWUP.actual-final-written-eight-page-bindings.before-stock.json'


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def ref(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': digest(path), 'bytes': path.stat().st_size}


def write_new(path, value):
    with path.open('x') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')


assert digest(SCIENCE) == 'sha256:2ddcfb579bf8662609f1e6613c21f53d12a6b02e1b48a6e6c80d22090442ff45'
science = json.loads(SCIENCE.read_text())
selector_ref = science['finalNeutralSelector']
assert digest(REPO / selector_ref['path']) == selector_ref['sha256']
selector = json.loads((REPO / selector_ref['path']).read_text())
for key in ['roundAInput', 'roundACampaign', 'actualBundleManifest']:
    assert digest(REPO / selector[key]['path']) == selector[key]['sha256']
input_data = json.loads((REPO / selector['roundAInput']['path']).read_text())
campaign = json.loads((REPO / selector['roundACampaign']['path']).read_text())
bundle_path = REPO / selector['actualBundleManifest']['path']
bundle = json.loads(bundle_path.read_text())
assert len(campaign['batches']) == 1
batch = campaign['batches'][0]
batch_path = REPO / selector['roundACampaign']['path']
batch_path = batch_path.parent / 'batches' / (batch['batchId'] + '.input.jsonl')
assert digest(batch_path) == batch['batchInputFingerprint']
own_by_id = {r['goalId']: r for r in science['rows']}
assert batch['goalIds'] == [r['goalId'] for r in science['rows']]
assert input_data['bookDigest'] == campaign['bookDigest'] == bundle['bookModelDigest']
run_id = 'chemie-current426-final-written-native8-own-informed-a-20261016-v1'
fields = ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']
records = []
for goal in input_data['goals']:
    own = own_by_id[goal['goalId']]
    assert own['decision'] == 'keep' and own['evidenceProfileRecommendation'] == 'none'
    for field in fields:
        assert goal[field] == own[field], (goal['goalId'], field)
    records.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': run_id + ':' + goal['goalId'], 'runId': run_id,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        **{field: goal[field] for field in fields},
        'decision': own['decision'], 'understandingEvidence': own['understandingEvidence'],
        'rationale': 'Eigene informierte Fortsetzung meiner unverändert erhaltenen Erstprüfung; alle acht tatsächlich geschriebenen Endseiten gesichtet, meine zwei Rohprofil-Fortschreibungen am geschriebenen Endstand exakt geprüft; neunzehn ganze Fälle/Rubriken waren selbst gelesen und sind unverändert gebunden. ' + own['rationaleDe'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': own['evidenceProfileRecommendation'],
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
results = ROOT / 'results'
results.mkdir(exist_ok=False)
records_path = results / (batch['batchId'] + '.records.jsonl')
with records_path.open('x') as out:
    for record in records:
        out.write(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n')
assert len([json.loads(line) for line in records_path.read_text().splitlines()]) == 8
parameters = {
    'provider': 'OpenAI', 'model': 'Codex agent; exact provider model identifier not exposed',
    'modelVersionExposed': False, 'samplingParametersExposed': False,
    'reviewerRole': 'subject_reviewer',
    'actualReviewMode': 'informed continuation of own preserved first judgments and own sealed finite profile amendments',
    'blindToOtherRunsMeaning': 'No independent reviewer or peer run was read. Own original FIRST and own later amendments are explicitly known and preserved; this is not a newly blind first review.',
    'stockCampaignLabel': campaign['reviewPass'],
    'stockCampaignLabelBoundary': 'Supplied prepared campaign identifiers and label are copied exactly; actual informed continuity is recorded in the sealed science and each rationale.',
    'runIdentityBoundary': 'The runId is a locally assigned artifact identity for this actual agent work and serialization, not a claimed provider request ID.',
    'timeBoundary': 'startedAt is the timestamp of the sealed own final page amendment; completedAt is actual local serialization completion. No hidden provider timing or laboratory run is asserted.',
    'scientificAmendment': ref(SCIENCE),
}
parameters_path = ROOT / 'generation-parameters.actual-exposure.json'
write_new(parameters_path, parameters)
artifacts = {a['role']: a for a in bundle['artifacts']}
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': parameters['provider'], 'model': parameters['model'], 'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(parameters_path),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': role, 'digest': artifacts[role]['digest']} for role in ['book_pdf', 'book_html', 'book_model', 'review_input_json', 'review_prompt', 'review_criteria']]
        + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': science['recordedAt'], 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'completed', 'outputDigest': digest(records_path), 'toolchainVersion': 'goal-description-review-v1',
}
run_path = results / (batch['batchId'] + '.run.json')
write_new(run_path, run)
config_path = ROOT / 'run-config.actual-local-serialization.json'
write_new(config_path, {
    'format': 'own actual local description serialization config v1', 'runId': run_id,
    'actualMode': parameters['actualReviewMode'], 'science': ref(SCIENCE), 'selector': selector_ref,
    'bundle': selector['actualBundleManifest'], 'input': selector['roundAInput'],
    'campaign': selector['roundACampaign'], 'batchInput': ref(batch_path),
    'existingNativeBaseConfig': selector['actualBaseBookConfig'],
    'existingNativePrepareConfig': selector['actualNativeConfig'],
    'parameters': ref(parameters_path), 'records': ref(records_path), 'run': ref(run_path),
    'newRenderingOrPreparePerformed': False, 'normalAuthority': 'ai_candidate', 'status': 'needs_human_review',
})
receipt = {'science': ref(SCIENCE), 'records': ref(records_path), 'run': ref(run_path),
           'runConfig': ref(config_path), 'parameters': ref(parameters_path), 'recordCount': len(records),
           'decisionCounts': {'keep': 8}, 'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate',
           'HumanApproval': False, 'HumanTrial': False, 'canonicalRegistryRuntimeGitCentralMutation': False}
write_new(ROOT / 'SERIALIZATION.actual-receipt.json', receipt)
print(json.dumps(receipt, ensure_ascii=False, indent=2))
