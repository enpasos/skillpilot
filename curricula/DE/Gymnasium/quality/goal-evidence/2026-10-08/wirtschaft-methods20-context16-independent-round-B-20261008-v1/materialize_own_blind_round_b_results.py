import pathlib, json, hashlib, datetime

b = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-methods-twenty-current311-resumed-native-preparation-20261008-v1')
o = pathlib.Path(__file__).parent
iso = pathlib.Path('/tmp/skillpilot-wirtschaft-methods20-current311-resumed-q7lajzo9')
h = lambda data: 'sha256:' + hashlib.sha256(data).hexdigest()
started = json.loads((o/'actual-before-56-root-isolate-whole-frozen-byte-guard.json').read_text())['at']
completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
parameters = {
    'schemaVersion': 1,
    'reviewerIdentity': '/root/economics_visual_source_continuation',
    'provider': 'OpenAI',
    'interface': 'Codex',
    'exactModelIdentifier': 'not disclosed',
    'modelParameters': 'not disclosed by the session',
    'independentBlindFirstPass': True,
    'currentMethodsRoundAJudgmentsRead': False,
    'methods20Author': False,
    'context16ContentAuthor': False,
    'disclosedOtherAuthorRole': 'Bounded Final19 English/taxonomy and 94-prerequisite candidate successor, separate from these 36 IDs.',
    'freezeSha256': 'sha256:19ec02ba923e8621fbf8f5a28ab8c12c1b7bb2c31feac820e1b8ccf83badb539',
    'humanApproval': False
}
parameter_bytes = (json.dumps(parameters, ensure_ascii=False, indent=2)+'\n').encode()
(o/'actual-review-parameters-disclosure.json').write_bytes(parameter_bytes)
results = []
for key, data_file in [('native-d-methods20-ordered-final', 'independent-methods20-six-fields.json'),
                       ('native-d-context16-ordered-final', 'independent-context16-six-fields.json')]:
    native = b/key
    campaign = json.loads((native/'round-b/description-review-campaign.json').read_text())
    batch = campaign['batches'][0]
    rows = [json.loads(line) for line in (native/'round-b/batches'/(batch['batchId']+'.input.jsonl')).read_text().splitlines()]
    authored = {r['goalId']: r for r in json.loads((o/data_file).read_text())}
    assert list(authored) == batch['goalIds']
    run_id = ('wirtschaft-methods20' if len(rows) == 20 else 'wirtschaft-context16')+'-current311-independent-B-20261008-v1'
    records = []
    for row in rows:
        goal = row['goal']
        own = authored[goal['goalId']]
        assert goal['reviewContext']['evidenceProfile'] is None
        assert goal['reviewContext']['page']['evidenceReview'] is None
        evidence = {k: own[k] for k in ['essentialUnderstandingDe', 'essentialUnderstandingEn',
                                      'observablePerformanceDe', 'observablePerformanceEn',
                                      'transferExpectationDe', 'transferExpectationEn']}
        rationale = own['rationale']
        if len(rows) == 20:
            rationale += ' Der eingefrorene D-Input enthält kein eingebettetes P-Profil; create bezeichnet nur diese native Eingangsentscheidung. Das separat aktuelle P20 wurde vollständig gelesen und eigenständig im Isolat mit dem nativen Validator geprüft; aus create wird weder ein fehlendes aktuelles P noch eine erforderliche Doppelanlage behauptet.'
        else:
            rationale += ' Der eingefrorene D-Input enthält kein eingebettetes P-Profil; create ist ausschließlich diese Eingangsentscheidung. Vorhandene gültige fachliche P-Nachweise werden erhalten; diese gezielte Seitenprüfung behauptet keine neue P-Erstellung oder Vollreview.'
        record = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
                  'schemaVersion': 1, 'recordId': run_id+':'+goal['goalId'], 'runId': run_id,
                  'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
                  'bundleFingerprint': row['bundleFingerprint'], 'bookDigest': row['bookDigest'],
                  'goalId': goal['goalId'], 'goalFingerprint': goal['goalFingerprint'],
                  'pageFingerprint': goal['pageFingerprint'],
                  'currentTitleDe': goal['currentTitleDe'], 'currentTitleEn': goal['currentTitleEn'],
                  'currentDescriptionDe': goal['currentDescriptionDe'], 'currentDescriptionEn': goal['currentDescriptionEn'],
                  'decision': 'keep', 'understandingEvidence': evidence, 'rationale': rationale,
                  'evidenceProfileContract': 'positive-understanding-evidence-v2',
                  'evidenceProfileRecommendation': 'create', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'}
        records.append(record)
    records_bytes = ''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'))+'\n' for r in records).encode()
    manifest = json.loads((native/'bundle/manifest.json').read_text())
    artifacts = [{'role': a['role'], 'digest': a['digest']} for a in manifest['artifacts']
                 if a['role'] in ['book_pdf', 'book_pdf_render_manifest', 'book_model', 'review_input_jsonl', 'review_prompt', 'review_criteria', 'run_manifest_schema']]
    artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
    run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
           'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
           'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
           'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
           'provider': 'OpenAI', 'model': 'Codex agent; exact model identifier not disclosed',
           'role': 'didactic_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
           'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
           'generationParametersFingerprint': h(parameter_bytes), 'independenceGroupId': campaign['independenceGroupId'],
           'blindToOtherRuns': True, 'goalIds': batch['goalIds'], 'inputArtifacts': artifacts,
           'startedAt': started, 'completedAt': completed, 'status': 'completed', 'outputDigest': h(records_bytes),
           'toolchainVersion': 'goal-description-review-v1'}
    run_bytes = (json.dumps(run, ensure_ascii=False, indent=2)+'\n').encode()
    record_path = native/'round-b/results'/(batch['batchId']+'.records.jsonl')
    run_path = native/'round-b/results'/(batch['batchId']+'.run.json')
    for root in [pathlib.Path('.'), iso]:
        for relative, content in [(record_path, records_bytes), (run_path, run_bytes)]:
            target = root/relative
            target.parent.mkdir(parents=True, exist_ok=True)
            assert not target.exists(), str(target)+' already exists; do not overwrite historical reviews'
            target.write_bytes(content)
    result = {'package': key, 'count': len(records), 'runId': run_id, 'recordsPath': str(record_path),
              'recordsSha256': h(records_bytes), 'runPath': str(run_path), 'runSha256': h(run_bytes),
              'allKeep': True, 'allCandidate': True, 'rootIsolateWholeOutputsExact': True}
    results.append(result)
(o/'actual-native-round-b-output-manifest.json').write_text(json.dumps(results, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(results, ensure_ascii=False, indent=2))
