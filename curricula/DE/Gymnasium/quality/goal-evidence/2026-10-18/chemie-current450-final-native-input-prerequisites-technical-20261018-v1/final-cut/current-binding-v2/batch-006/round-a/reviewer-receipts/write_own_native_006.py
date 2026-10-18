import collections, datetime, hashlib, json, pathlib, sys
import jsonschema

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write_review(round_path, judgments, started_at, metadata_contact=False):
    p = pathlib.Path(round_path)
    campaign = json.loads((p/'description-review-campaign.json').read_text())
    inp = json.loads((p/'description-review-input.json').read_text())
    batch = campaign['batches'][0]
    batch_file = p/'batches'/(batch['batchId']+'.input.jsonl')
    rows = [json.loads(line) for line in batch_file.read_text().splitlines()]
    assert len(rows) == len(judgments) == campaign['goalCount']
    run_id = campaign['roundId']+'.native-run'
    keys = ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
    schema = json.loads((p/'contracts/goal-description-review-record.schema.json').read_text())
    records = []
    for i,(row,j) in enumerate(zip(rows,judgments)):
        g = row['goal']
        decision, recommendation, rationale, *rest = j
        rec = {'$schema':schema['$id'],'schemaVersion':1,'recordId':run_id+'.goal-'+str(i+1).zfill(3),'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest']}
        for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
            rec[k] = g[k]
        rec.update(decision=decision,understandingEvidence=dict(zip(keys,rest[:6])),rationale=rationale,evidenceProfileContract='positive-understanding-evidence-v2',evidenceProfileRecommendation=recommendation,recordStatus='candidate',reviewAuthority='ai_candidate')
        if decision == 'revise':
            assert len(rest) == 8
            rec['proposedDescriptionDe'],rec['proposedDescriptionEn'] = rest[6:]
        else:
            assert len(rest) == 6
        jsonschema.Draft202012Validator(schema).validate(rec)
        records.append(rec)
    record_bytes = ''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records).encode()
    own = p/'reviewer-receipts'; own.mkdir(exist_ok=True)
    params = {'provider':'OpenAI','modelFamilyExposed':'GPT-6 / Codex','exactServedModelIdExposed':False,'modelVersionExposed':False,'samplingParametersExposed':False,'reviewMode':'native independent Codex collaboration subagent','agentTask':'chemie_final_native_round_a_20261018'}
    param_bytes = (json.dumps(params,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode()
    (own/'generation-parameters.exposed.json').write_bytes(param_bytes)
    completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
    run = {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 / Codex; exact served model ID not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':digest(param_bytes),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']},{'role':'review_input_json','digest':digest((p.parent/'bundle/review-input.json').read_bytes())},{'role':'review_prompt','digest':campaign['promptFingerprint']},{'role':'review_criteria','digest':campaign['criteriaFingerprint']}],'startedAt':started_at,'completedAt':completed,'status':'completed','outputDigest':digest(record_bytes),'toolchainVersion':'codex-native-description-review-20261018-v1'}
    run_schema = json.loads(pathlib.Path('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json').read_text())
    jsonschema.Draft202012Validator(run_schema).validate(run)
    results = p/'results'; results.mkdir(exist_ok=True)
    record_path = results/(batch['batchId']+'.records.jsonl')
    run_path = results/(batch['batchId']+'.run.json')
    assert not record_path.exists() and not run_path.exists(), 'Refuse overwriting a sealed prior result'
    record_path.write_bytes(record_bytes)
    run_path.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
    receipt = {'reviewerTask':'chemie_final_native_round_a_20261018','campaignId':campaign['campaignId'],'batchId':batch['batchId'],'completedAt':completed,'judgmentCount':len(records),'decisions':dict(collections.Counter(r['decision'] for r in records)),'evidenceProfileRecommendations':dict(collections.Counter(r['evidenceProfileRecommendation'] for r in records)),'surfacesRead':['own bundle/review-input.json; all 20 page+profile contexts structurally identical to actually read assigned current goal.reviewContext','current material cases HB073, HB078, energy20-19-a/b, energy20-17-a/b, eqrk16-07-a/b; no author decisions or other cases read','own campaign','own bound bilingual input and assigned JSONL','bound prompt and chemistry criteria','canonicalContext and complete page relation context','current supplied P profile contract; prior metadata is not authority','closed record and run contracts; validator binding code'],'visualImagesInspected':False,'imageDisplayApprovalClaimed':False,'humanApprovalClaimed':False,'effectiveCompositionOrCompleteSourceMappingVerified':False,'peerResultsReadBeforeOwnSeal':False,'earlierDescriptionReviewRecordsOpened':False,'normalDataMutated':False,'currentPMetadataHistoricalReferenceContact':metadata_contact,'metadataContactDetail':'The first complete current input record exposed its current P reason and review IDs, including references to earlier D work. No linked former D record, author decision or peer result was opened or followed. Subsequent displays omitted current P author/verdict metadata while preserving input bytes.' if metadata_contact else 'Current input carries P provenance and legacy references; no prior D or peer review opened or followed. Review uses current profile duties and cases, not prior verdicts.','timestampScope':'Run startedAt records start of native judgment authoring; input reading began earlier and was not separately timestamped.','candidateOnly':True,'files':{str(record_path):digest(record_bytes),str(run_path):digest(run_path.read_bytes()),str(batch_file):digest(batch_file.read_bytes()),str(p/'description-review-input.json'):digest((p/'description-review-input.json').read_bytes())}}
    receipt_path = own/'independent-first-pass.receipt.json'; receipt_path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    seal = {'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'peerResultsReadBeforeSeal':False,'files':{str(x):digest(x.read_bytes()) for x in [record_path,run_path,receipt_path,own/'generation-parameters.exposed.json']}}
    seal_path = own/'independent-first-pass.seal.json'; seal_path.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'receipt':str(receipt_path),'seal':str(seal_path),'sealDigest':digest(seal_path.read_bytes()),'decisions':receipt['decisions'],'count':len(records)},ensure_ascii=False))
