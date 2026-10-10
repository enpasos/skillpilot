import copy
import hashlib
import json
from pathlib import Path

OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]
BASE = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
PARENT = BASE + 'chemie-q3-three-reviewed-active-integration-technical-v1'
AUTHOR = BASE + 'chemie-q3-three-BW-source-adoption-technical-successor-20261010-v1'
NEW = ['d2d735de-bede-5310-8aeb-8bb7562c7b75', 'a0f6ba09-f072-5887-a797-fa369453c62a', '7b39fa19-fec3-575e-9324-a3226b703358']

def read(path):
    return json.loads((REPO / path).read_text())

def binding(path):
    data = (REPO / path).read_bytes()
    return {'path': path, 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def records(path):
    return [json.loads(x) for x in (REPO / path).read_text().splitlines() if x.strip()]

entry = read(AUTHOR + '/neutral-three-BW-source-adoption.independent-review.entry.json')
current_registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
before = read(PARENT + '/before/registry.exact.json')
current = read(current_registry_path)
assert current == read(PARENT + '/registry.after-reviewed-source.UNAPPLIED.config.json')
old_subjects = {x['subject']: x for x in before['subjects']}
subjects = {x['subject']: x for x in current['subjects']}
for subject in subjects:
    if subject != 'chemie':
        assert subjects[subject] == old_subjects[subject], subject
changed_fields = [k for k in subjects['chemie'] if subjects['chemie'][k] != old_subjects['chemie'][k]]
assert set(changed_fields) == {'semanticAtomicityConfigPaths', 'memoryReviewConfigPath', 'resolutionIndexPaths', 'positiveEvidenceConfigPaths'}
for field in ['semanticAtomicityConfigPaths', 'resolutionIndexPaths', 'positiveEvidenceConfigPaths']:
    assert subjects['chemie'][field][:-1] == old_subjects['chemie'][field]

active_path = subjects['chemie']['landscapePath']
canonical = read(active_path)
future = read(entry['frozenFuture484Canonical']['path'])
expected = copy.deepcopy(future)
removed = []
for goal in expected['goals']:
    if goal['id'] in NEW:
        removed.append({'goalId': goal['id'], 'removedField': 'extendedData.authorCandidateBoundary', 'originalValue': goal['extendedData'].pop('authorCandidateBoundary')})
assert canonical == expected
old = {g['id']: g for g in read(entry['frozenOld480Canonical']['path'])['goals']}
current_goals = {g['id']: g for g in canonical['goals']}
protected = read(PARENT + '/before/chemistry-protected177.goal-bindings.json')['strictCompleteGoalIds']
assert len(protected) == 177
for goal_id in protected:
    assert current_goals[goal_id] == old[goal_id], goal_id

current_ledger = read(subjects['chemie']['semanticKindLedgerPath'])
future_ledger = read(entry['future381SemanticLedger']['path'])
future_decisions = {x['goalId']: x for x in future_ledger['decisions']}
changed_ledger = []
for row in current_ledger['decisions']:
    prior = future_decisions[row['goalId']]
    if row != prior:
        assert row['goalId'] in NEW
        assert {k:v for k,v in row.items() if k != 'sourceFingerprint'} == {k:v for k,v in prior.items() if k != 'sourceFingerprint'}
        changed_ledger.append(row['goalId'])
assert set(changed_ledger) == set(NEW)
assert len(current_ledger['decisions']) == len(future_ledger['decisions']) == 484

mapping_path = 'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'
assert (REPO/mapping_path).read_bytes() == (REPO/AUTHOR/'candidate/BW126-220-existing-independent-source-judgments.technical-successor.review.json').read_bytes()
source_path = 'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_CHEMIE_SEKII_BP2016_V2.source-extraction.json'
source_current = read(source_path)
before_locator_path = PARENT + '/before/active-BW126-extraction-before-two-reviewed-locators.exact.json'
before_locator_source = read(before_locator_path)
locator_deltas = []
expected_locator_source = copy.deepcopy(before_locator_source)
for i in [10,112]:
    original = expected_locator_source['sourceGoals'][i]['sourceRef']
    successor = source_current['sourceGoals'][i]['sourceRef']
    assert original != successor
    expected_locator_source['sourceGoals'][i]['sourceRef'] = successor
    locator_deltas.append({'jsonPointer':f'/sourceGoals/{i}/sourceRef','before':original,'after':successor})
assert expected_locator_source == source_current
expected_source = read(entry['whole126SourceExtraction']['path'])
source_transport = []
for current_passage, expected_passage in zip(source_current['passages'], expected_source['passages']):
    assert current_passage['sourcePath'] == 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf'
    source_transport.append({'sealedPath': expected_passage['sourcePath'], 'operativePath': current_passage['sourcePath']})
    expected_passage['sourcePath'] = current_passage['sourcePath']
activation = read(PARENT + '/source-and-central-activation.actual.json')
operative_snapshot = binding(PARENT + '/before/actual-active-BW126-211-mapping.exact.json')
assert operative_snapshot['sha256'] == 'sha256:9dd0a16becca9326dc3db61f09309d610ff86a5bc400d527c8a7200a4bf1a8cb'
activation_text = json.dumps(activation)
for token in ['211', '208', '217', '220', 'CHEM3-OPERATIVE-A-001', 'operative211-source-review.independent.FIRST.verdict.json']:
    assert token in activation_text, token

memory_config = read(subjects['chemie']['memoryReviewConfigPath'])
old_memory_config = read(old_subjects['chemie']['memoryReviewConfigPath'])
assert memory_config['visibilityScopes'] == old_memory_config['visibilityScopes']
assert memory_config['cardReviewPath'] == old_memory_config['cardReviewPath']
assert memory_config['visibilityScopeCoverageRequired'] is True
assert len(memory_config['visibilityScopes']) == 7
old_memory_bytes = (REPO/old_memory_config['reviewPath']).read_bytes()
new_memory_bytes = (REPO/memory_config['reviewPath']).read_bytes()
assert new_memory_bytes.startswith(old_memory_bytes)
appended = [json.loads(x) for x in new_memory_bytes[len(old_memory_bytes):].decode().splitlines() if x.strip()]
original_memory_path = read(PARENT + '/memory/review-id-adoption.actual.json')['originalReviewPath']
original_memory = {x['goalId']: x for x in records(original_memory_path)}
assert len(appended) == 3 and {x['goalId'] for x in appended} == set(NEW)
for row in appended:
    expected_row = dict(original_memory[row['goalId']], reviewId='canonical-chemistry-full')
    assert row == expected_row
    assert row['status'] == 'no_memory_needed' and row['memoryUseful'] is False

positive_config_path = subjects['chemie']['positiveEvidenceConfigPaths'][-1]
positive_config = read(positive_config_path)
assert positive_config['profileRuleVersion'] == 'positive-understanding-evidence-v2'
assert positive_config['requireApproved'] is False
positive_records = records(positive_config['reviewPath'])
assert len(positive_records) == 3 and {x['goalId'] for x in positive_records} == set(NEW)
for row in positive_records:
    assert row['status'] == 'needs_human_review' and row['reviewAuthority'] == 'ai_candidate'

qa_path = subjects['chemie']['visualizationQaPath']
qa = read(qa_path)
previous_qa_path = AUTHOR + '/inputs/future-381-visual-qa.operative-path.exact.json'
previous_qa = read(previous_qa_path)
old_rows = {x['goalId']:x for x in previous_qa['records']}
assert len(qa['records']) == len(old_rows) == 382
default_fields = {'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','chatGptReviewer':'','humanReviewedAt':None,'humanReviewer':'','chatGptNotes':'','chatGptReviewedAt':None}
for row in qa['records']:
    old_row = old_rows[row['goalId']]
    if row['goalId'] in NEW:
        assert row == dict(old_row, **default_fields)
        assert row['humanApproved'] == 'no' and row['aiApproved'] == 'yes'
    else:
        assert row == old_row, row['goalId']

resolution_index_path = subjects['chemie']['resolutionIndexPaths'][-1]
resolution_index = read(resolution_index_path)
assert set(resolution_index['batchGoalIds']) == set(NEW)
assert len(resolution_index['resolutions']) == 3
for row in resolution_index['resolutions']:
    assert row['strictDescriptionComplete'] is True and row['decision'] == 'keep_current'
    path = str(Path(resolution_index_path).parent / row['resolutionPath'])
    assert binding(path)['sha256'] == row['resolutionDigest']
summary_path = str(Path(resolution_index_path).parent / 'dual-summary.json')
dual = read(summary_path)
assert dual['rounds']['first']['independenceGroupId'] != dual['rounds']['second']['independenceGroupId']
assert dual['automaticAcceptance'] is False

historical_freezes = [
 BASE+'chemie-q3-three-BW-source-adoption-technical-independent-a-20261010-v1/independent-source-adoption.FIRST.final.freeze.json',
 BASE+'chemie-q3-three-BW-operative211-successor-source-independent-a-20261010-v1/operative211-source-review.independent.FIRST.final.freeze.json',
 BASE+'chemie-q3-three-BW-operative211-claim-remediation-independent-a-20261010-v1/claim-remediation.independent.final.freeze.json',
 BASE+'chemie-q3-three-BW-current-native-independent-a-20261010-v1/independent-a.FIRST.final.freeze.json',
 BASE+'chemie-q3-three-BW-current-raster-native-independent-b-20261010-v1/three-current-native.independent-b.final.freeze.json']
history_bindings = []
for path in historical_freezes:
    freeze = read(path)
    arrays = [freeze.get(k,[]) for k in ['artifacts','artifactBindings']]
    checked = 0
    for collection in arrays:
        for item in collection:
            if isinstance(item,dict) and isinstance(item.get('path'),str) and isinstance(item.get('sha256'),str):
                actual = binding(item['path'])
                assert actual['sha256'] == item['sha256'], item['path']
                if 'bytes' in item: assert actual['bytes'] == item['bytes']
                checked += 1
    history_bindings.append(dict(binding(path), exactSealedArtifactBindingsChecked=checked))

assert source_current == expected_source, 'Only the two independently accepted printed locator corrections may remain pending in the actual source extraction'
proof = {'schemaVersion':1,'role':'Independent additive technical integration verification, after separate genuine operative211 source FIRST',
 'actualExitCode':0,'activeSource220BytesExactToSealedSuccessor':True,'activeWhole126SourceBodiesAndCorrectedLocatorsExactToSealedSuccessor':True,
 'thirteenOrdinaryOriginalPdfPathTransports':source_transport,
 'onlyTwoIndependentlyAcceptedOperativePrintedLocatorsAdopted':locator_deltas,
 'whole126RawSourceBodiesAndThirteenOperativePdfPassagePathsUnchanged':True,
 'actualOperative211BeforeSnapshot':operative_snapshot,'activationClaimFinding':'CHEM3-OPERATIVE-A-001 independently resolved; actual211/208+3+6+3 accounting retained',
 'whole177ProtectedGoalBodiesExact':protected,'onlyThreeAuthorCandidateBoundaryFieldsRemoved':removed,
 'otherFourWholeRegistrySubjectsExact':True,'onlyChemistryRegistryChanges':changed_fields,
 'semanticDecisionsOther481Exact':True,'threeMetadataOnlySourceFingerprintChanges':changed_ledger,
 'memory378ExactBytePrefix':binding(old_memory_config['reviewPath']),'onlyThreeMemoryReviewIdNormalizedRecordsAppended':True,
 'sameCardLedgerAndSevenVisibilityScopes':True,'positiveV2CurrentWholeProfileRecords':binding(positive_config['reviewPath']),
 'positiveAuthority':'ai_candidate','positiveStatus':'needs_human_review','positiveHumanApproval':False,
 'existing379QaRecordsExact':True,'onlyThreeNewQaRowsSevenOrdinaryDefaultFieldsAdded':default_fields,
 'existingThreeMachineVisualApprovalsRetained':True,'normalDualResolutionIndex':binding(resolution_index_path),
 'independentCurrentNativeRounds':dual['rounds'],'historicalFreezeBindings':history_bindings,
 'wholeSource002Approval':False,'nationalRoutesApproval':False,'fiveOldAffectedContextApproval':False,
 'humanApproval':False,'humanTrial':False,'newScientificGoalReviewClaim':False,'newVisualReviewClaim':False,'activeWrites':0,
 'currentBindings':[binding(x) for x in [active_path,subjects['chemie']['semanticKindLedgerPath'],mapping_path,source_path,current_registry_path,qa_path,memory_config['reviewPath'],positive_config_path]]}
(OWN/'active-current-bindings.independent.actual.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actualExitCode':0,'wholeProtectedGoals':177,'registrySubjectsUnchanged':4,'memory378BytePrefixExact':True,'currentP3':'needs_human_review/ai_candidate','historicalFreezes':len(history_bindings),'activeWrites':0}))
