import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = next(p for p in ROOT.parents if (p / 'AGENTS.md').is_file())
TECH = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-five-genuine-informed-PA-bindings-technical-20261015-v1'
SCIENCE = ROOT / 'FIRST.own-informed-final-eight.scientific-followup.before-stock.json'


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def write_new(path, value):
    with path.open('x') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')
    json.loads(path.read_text())


assert digest(SCIENCE) == 'sha256:80dc4af4afeedac7b358718733c1452de26ec4538bdf1a308a77c5589d23a689'
science = json.loads(SCIENCE.read_text())
selector = json.loads((TECH / 'pages-final-eight/NEUTRAL.final-eight-actual-current-pages-profiles-nineteen-cases.selector.json').read_text())
for key in ['roundAInput', 'roundACampaign', 'actualBundleManifest']:
    ref = selector[key]
    assert digest(REPO / ref['path']) == ref['sha256']
input_data = json.loads((REPO / selector['roundAInput']['path']).read_text())
campaign = json.loads((REPO / selector['roundACampaign']['path']).read_text())
bundle = json.loads((REPO / selector['actualBundleManifest']['path']).read_text())
batch = campaign['batches'][0]
own_by_id = {row['goalId']: row for row in science['rows']}
assert batch['goalIds'] == [row['goalId'] for row in science['rows']]
assert input_data['bookDigest'] == campaign['bookDigest'] == bundle['bookModelDigest']
run_id = 'chemie-current426-final-native8-own-informed-a-20261016-v1'
records = []
binding_fields = ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']
for goal in input_data['goals']:
    own = own_by_id[goal['goalId']]
    for field in binding_fields:
        assert goal[field] == own[field]
    records.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': run_id + ':' + goal['goalId'],
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{field: goal[field] for field in binding_fields},
        'decision': own['decision'],
        'understandingEvidence': own['understandingEvidence'],
        'rationale': 'Eigene informierte Nachsicht meiner unverändert erhaltenen Erstprüfung; alle acht finalen Native-Seiten und neunzehn ganzen Fälle/Rubriken sind geprüft. ' + own['rationaleDe'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': own['evidenceProfileRecommendation'],
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    })
results = ROOT / 'results'
results.mkdir(exist_ok=False)
records_path = results / (batch['batchId'] + '.records.jsonl')
with records_path.open('x') as stream:
    for record in records:
        stream.write(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n')
assert len([json.loads(line) for line in records_path.read_text().splitlines()]) == 8
parameters = {
    'provider': 'OpenAI',
    'model': 'Codex agent; exact provider model identifier not exposed',
    'modelVersionExposed': False,
    'samplingParametersExposed': False,
    'reviewerRole': 'subject_reviewer',
    'actualReviewMode': 'informed follow-up of own preserved first judgments; no peer description records or positive P/A/V judgments read',
    'blindToOtherRunsMeaning': 'No other reviewer or independent run was read. Own original FIRST is explicitly known and preserved; this is not asserted to be a new blind first review.',
    'stockCampaignLabel': campaign['reviewPass'],
    'stockCampaignLabelBoundary': 'The supplied prepared campaign name and label are copied exactly; actual informed continuity is recorded in the sealed science and every rationale.',
}
parameters_path = ROOT / 'generation-parameters.actual-exposure.json'
write_new(parameters_path, parameters)
artifacts = {a['role']: a for a in bundle['artifacts']}
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': parameters['provider'],
    'model': parameters['model'],
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(parameters_path),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [
        {'role': role, 'digest': artifacts[role]['digest']}
        for role in ['book_pdf', 'book_html', 'book_model', 'review_prompt', 'review_criteria']
    ] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': science['recordedAt'],
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'completed',
    'outputDigest': digest(records_path),
    'toolchainVersion': 'goal-description-review-v1',
}
run_path = results / (batch['batchId'] + '.run.json')
write_new(run_path, run)
write_new(ROOT / 'SERIALIZATION.actual-receipt.json', {
    'scientificSource': {'path': str(SCIENCE.relative_to(REPO)), 'sha256': digest(SCIENCE)},
    'records': {'path': str(records_path.relative_to(REPO)), 'sha256': digest(records_path), 'count': len(records)},
    'run': {'path': str(run_path.relative_to(REPO)), 'sha256': digest(run_path)},
    'reviewAuthority': 'ai_candidate',
    'status': 'needs_human_review',
    'HumanApproval': False,
    'HumanTrial': False,
    'canonicalRegistryRuntimeGitCentralMutation': False,
})
print('Serialized own current candidate records:', len(records))
print('Records:', records_path.relative_to(REPO))
print('Records digest:', digest(records_path))
