import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).parent
SOURCE = ROOT.parent / 'chemie-carbonyl15-current422-native-preparation-technical-20261015-v1'
ROUND = SOURCE / 'native15/round-b'
first = json.loads((ROOT/'D.FIRST.independent-science.json').read_text())
seal = json.loads((ROOT/'D.FIRST.seal.json').read_text())
def digest(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
assert digest(ROOT/'D.FIRST.independent-science.json') == seal['sha256']
campaign = json.loads((ROUND/'description-review-campaign.json').read_text())
bundle = json.loads((ROUND/'review-bundle-manifest.json').read_text())
inputs = json.loads((ROUND/'description-review-input.json').read_text())
batch_path = next((ROUND/'batches').glob('*.input.jsonl'))
batch = [json.loads(line) for line in batch_path.read_text().splitlines()]
assert [r['goalId'] for r in first['judgments']] == [r['goal']['goalId'] for r in batch]
run_id = 'chemie-carbonyl15-current422-native-fresh-independent-b-20261015-v1'
records = []
for raw, item in zip(first['judgments'], batch):
    goal = item['goal']
    record = {'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
              'schemaVersion':1, 'recordId':f"{run_id}.{raw['ordinal']:02d}", 'runId':run_id,
              'campaignId':campaign['campaignId'], 'roundId':campaign['roundId'],
              'bundleFingerprint':item['bundleFingerprint'], 'bookDigest':item['bookDigest']}
    for key in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
        record[key] = goal[key]
    record.update(decision={'KEEP':'keep','REVISE':'revise','SPLIT':'split_review','DEFER':'block'}[raw['decision']],
                  understandingEvidence=raw['understandingEvidence'],
                  rationale=' '.join(raw[k] for k in ['rationaleDe','aspectCoverageDe','sourceAssessmentDe','taskAssessmentDe','atomicityAssessmentDe']),
                  evidenceProfileContract='positive-understanding-evidence-v2',
                  evidenceProfileRecommendation=raw['evidenceProfileRecommendation'],recordStatus='candidate',reviewAuthority='ai_candidate')
    if raw['decision']=='REVISE':
        record['proposedDescriptionDe']=raw['proposedDescriptionDe']
        record['proposedDescriptionEn']=raw['proposedDescriptionEn']
    assert len(record['rationale']) <= 4000
    records.append(record)
records_path = ROOT/'description-records.jsonl'
records_path.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
parameters={'role':'new independent chemistry reviewer B','generationParameters':'Exact temperature, seed, model build and sampling settings unavailable in inherited Codex session; not fabricated.',
            'firstScienceSeal':seal,'noOtherReviewerOutputsRead':True,'schemaConsultedAfterFIRSTSeal':True}
(ROOT/'generation-parameters.json').write_text(json.dumps(parameters,ensure_ascii=False,indent=2)+'\n')
roles={'book_model','book_pdf','book_html','review_input_json','review_prompt','review_criteria'}
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
     'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
     'batchId':campaign['batches'][0]['batchId'],'batchInputFingerprint':campaign['batches'][0]['batchInputFingerprint'],
     'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],
     'provider':'OpenAI','model':'GPT-6 Codex session; exact deployed model identifier unavailable',
     'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2',
     'promptFingerprint':bundle['promptFingerprint'],'criteriaFingerprint':bundle['criteriaFingerprint'],
     'generationParametersFingerprint':digest(ROOT/'generation-parameters.json'),
     'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,
     'goalIds':[x['goalId'] for x in records],
     'inputArtifacts':[{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts'] if x['role'] in roles]
        +[{'role':'description_review_batch_input_jsonl','digest':digest(batch_path)}],
     'startedAt':first['createdAtUTC'],'completedAt':datetime.now(timezone.utc).isoformat(),
     'status':'completed','outputDigest':digest(records_path),'toolchainVersion':'stock-goal-description-review-v1'}
(ROOT/'description-run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
print('Serialized',len(records),'records from sealed science FIRST; source round unchanged')
