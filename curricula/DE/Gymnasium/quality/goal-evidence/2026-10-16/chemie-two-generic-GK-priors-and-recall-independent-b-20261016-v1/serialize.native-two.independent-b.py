# SPDX-License-Identifier: Apache-2.0
import datetime
import hashlib
import json
from pathlib import Path

E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
O = E / 'chemie-two-generic-GK-priors-and-recall-independent-b-20261016-v1'
N = E / 'chemie-combined639-two-gk-priors-native-two-private-l4-technical-20261016-v1/native-two'

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def load(path):
    return json.loads(path.read_text())

science_path = O / 'science.native-two.actual-pages.independent-b.json'
science_seal = load(O / 'science.native-two.actual-pages.independent-b.seal.json')
assert digest(science_path.read_bytes()) == science_seal['sha256']
science = load(science_path)
campaign = load(N / 'round-b/description-review-campaign.json')
inp = load(N / 'round-b/description-review-input.json')
bundle = load(N / 'bundle/manifest.json')
batch = campaign['batches'][0]
source = N / f"round-b/batches/{batch['batchId']}.input.jsonl"
assert digest(source.read_bytes()) == batch['batchInputFingerprint']
assert [g['goalId'] for g in inp['goals']] == [g['goalId'] for g in science['ordinaryJudgments']]
run_id = 'chemie-two-generic-gk-priors-and-recall-native-two-independent-b-20261016-v1'
records = []
for index, (g, s) in enumerate(zip(inp['goals'], science['ordinaryJudgments']), 1):
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'{run_id}.{index:02}',
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': inp['bundleFingerprint'],
        'bookDigest': inp['bookDigest'],
        **{k: g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision': s['decision'],
        'understandingEvidence': {k:s[k] for k in ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']},
        'rationale': s['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'none' if s['P']=='keep_current' else 'revise',
        'recordStatus':'candidate',
        'reviewAuthority':'ai_candidate',
    }
    records.append(record)

results = O / 'native-d-results'
results.mkdir(exist_ok=True)
record_path = results / f"{batch['batchId']}.records.jsonl"
record_path.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
assert [json.loads(l) for l in record_path.read_text().splitlines()] == records
params = {'configuration':'Inherited Codex session configuration','exactDeploymentRevisionExposed':False,'samplingParametersExposed':False,'scientificJudgmentSeal':science_seal['sha256'],'reviewNature':'Actual informed current-context pass; own historical science preserved; blind to other reviewer outputs','serializationDoesNotChangeScientificDecisions':True}
params_path = O/'native-d-generation-parameters.provenance.json'
params_path.write_text(json.dumps(params,ensure_ascii=False,indent=2)+'\n')
roles = {'book_pdf','book_pdf_render_manifest','book_model','review_input_json','review_input_jsonl','review_prompt','review_criteria'}
run = {
    '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion':1,
    'runId':run_id,
    'campaignId':campaign['campaignId'],
    'roundId':campaign['roundId'],
    'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],
    'bundleFingerprint':bundle['bundleFingerprint'],
    'bookDigest':bundle['bookModelDigest'],
    'provider':'OpenAI Codex',
    'model':'GPT-6 Codex; inherited session model, exact deployment revision not exposed',
    'role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2',
    'promptFingerprint':campaign['promptFingerprint'],
    'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':digest(params_path.read_bytes()),
    'independenceGroupId':campaign['independenceGroupId'],
    'blindToOtherRuns':True,
    'goalIds':batch['goalIds'],
    'inputArtifacts':[{k:a[k] for k in ['role','digest']} for a in bundle['artifacts'] if a['role'] in roles] + [{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
    'startedAt':science_seal['createdAt'],
    'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status':'completed',
    'outputDigest':digest(record_path.read_bytes()),
    'toolchainVersion':'goal-description-review-v2',
}
run_path = results / f"{batch['batchId']}.run.json"
run_path.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'records':str(record_path),'recordsSha256':digest(record_path.read_bytes()),'count':len(records),'run':str(run_path),'runSha256':digest(run_path.read_bytes())}))
