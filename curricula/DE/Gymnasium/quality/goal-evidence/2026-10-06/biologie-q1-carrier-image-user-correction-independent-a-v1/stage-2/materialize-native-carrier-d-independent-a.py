"""Record the actually inspected one-page D-A continuation in the native contract."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

root = Path(__file__).resolve().parents[8]
own = Path(__file__).resolve().parent
packet = own.parent
author = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-projection-and-image-targeted-author-v2'
prior = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-d-independent-a-v1'
goal_id = 'ac9e824f-003c-50ac-8751-2b8456004c63'
assert not (own / 'independent-carrier-native-d-a.stage-2.freeze.json').exists(), 'Frozen independent result'
inputs = {}

def read_bytes(path):
    raw = path.read_bytes()
    inputs[str(path.relative_to(root))] = {'path': str(path.relative_to(root)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
    return raw

def read(path):
    return json.loads(read_bytes(path))

def write(name, payload):
    path = own / name
    path.parent.mkdir(exist_ok=True, parents=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')

campaign = read(author / 'round-a/description-review-campaign.json')
input_data = read(author / 'round-a/description-review-input.json')
bundle = read(author / 'bundle/manifest.json')
round_bundle = read(author / 'round-a/review-bundle-manifest.json')
assert round_bundle == bundle
assert input_data['goalCount'] == campaign['goalCount'] == 1
g = input_data['goals'][0]
assert g['goalId'] == goal_id
page = g['reviewContext']['page']
assert page['pageNumber'] == 1
assert [row['jurisdiction'] for row in page['applicability']] == ['DE-BB', 'DE-BE']
for row in page['applicability']:
    assert row['scopes'] == [{'stage': 'SekI', 'durationModel': 'G8', 'courseProfile': None}, {'stage': 'SekI', 'durationModel': 'G9', 'courseProfile': None}]
assert len(page['externalReverseRequires']) == 6 and not page['requires']
actual_assets = []
for path in [root / 'app/public' / page['visualization']['url'].lstrip('/'), root / 'backend/src/main/resources/static' / page['visualization']['url'].lstrip('/'), root / 'curricula/DE/Gymnasium/visualizations/biologie' / goal_id / (goal_id + '.png')]:
    raw = read_bytes(path)
    assert 'sha256:' + hashlib.sha256(raw).hexdigest() == page['visualization']['originalDigest']
    actual_assets.append(inputs[str(path.relative_to(root))])
for artifact in bundle['artifacts']:
    path = author / 'bundle' / artifact['path']
    raw = read_bytes(path)
    assert 'sha256:' + hashlib.sha256(raw).hexdigest() == artifact['digest'] and len(raw) == artifact['bytes']
batch = campaign['batches'][0]
batch_path = author / 'round-a/batches' / (batch['batchId'] + '.input.jsonl')
assert 'sha256:' + hashlib.sha256(read_bytes(batch_path)).hexdigest() == batch['batchInputFingerprint']
read_bytes(author / 'round-a/prompt.md'); read_bytes(author / 'round-a/criteria.md'); read_bytes(author / 'round-a/contracts/goal-description-review-record.schema.json')
browser = read(own / 'actual-final-carrier-html-browser-check.json')
assert browser['titleDescriptionAltAndCurrentPNGExact']
stage1 = read(packet / 'carrier-goal-profile-materials-and-current-resource-payload.actual.json')
stage1_freeze = read(packet / 'independent-carrier-image-a.v-p-stage-1.freeze.json')
for frozen in stage1_freeze['ownFiles']:
    assert 'sha256:' + hashlib.sha256(read_bytes(root / frozen['path'])).hexdigest() == frozen['sha256']
canonical_path = root / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canonical = read(canonical_path)
current_goal = next(goal for goal in canonical['goals'] if goal['id'] == goal_id)
assert current_goal == stage1['currentWholeGoal'], 'A current canonical goal field changed'
old_model = read(author / 'before.full-390.book-model.json')
current_model = read(author / 'current.full-390.book-model.json')
assert len(old_model['pages']) == len(current_model['pages']) == 390
old_pages = {row['goalId']: row for row in old_model['pages']}
changed_ids = [row['goalId'] for row in current_model['pages'] if row != old_pages[row['goalId']]]
assert changed_ids == [goal_id]
current_page = next(row for row in current_model['pages'] if row['goalId'] == goal_id)
old_page = old_pages[goal_id]
delta_fields = [key for key in current_page if current_page[key] != old_page[key]]
assert sorted(delta_fields) == ['pageFingerprint', 'visualization']
assert {k:v for k,v in current_page['visualization'].items() if k != 'originalDigest'} == {k:v for k,v in old_page['visualization'].items() if k != 'originalDigest'}

# Unchanged primary source goals and passages are reused from the valid own A
# review, with exact current file reads; no restart of the original PDF review.
atlas_path = root / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
atlas = read(atlas_path)
direct_sources = []
other_regions_with_direct_mapping = []
for relative in atlas['mappingPaths']:
    mapping_path = root / relative
    mapping = read(mapping_path)
    selected = [row for row in mapping.get('mappings', []) if row.get('canonicalGoalId') == goal_id]
    if not selected:
        continue
    region = mapping['jurisdiction']
    if region not in ['DE-BE', 'DE-BB']:
        other_regions_with_direct_mapping.append(region)
    extraction_path = root / mapping['sourceExtractionPath']
    extraction = read(extraction_path)
    old_extraction = read(root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1/inputs/source-components' / (region[3:] + '.source-extraction.candidate.json'))
    assert extraction['sourceGoals'] == old_extraction['sourceGoals'] and extraction['passages'] == old_extraction['passages']
    actual_source_goal = next(row for row in extraction['sourceGoals'] if row['id'] == selected[0]['legacyGoalId'])
    assert selected[0]['matchType'] == 'partial' and not actual_source_goal['wholeOriginalBulletCoverage']
    direct_sources.append({'region': region, 'mappingPath': relative, 'sourceExtractionPath': mapping['sourceExtractionPath'], 'mapping': selected[0], 'sourceGoal': actual_source_goal, 'sourceGoalsAndPassagesExactPriorOwnA': True, 'wholeOriginalBulletCoverage': False, 'originalPDFReviewReusedUnchanged': True})
assert sorted(row['region'] for row in direct_sources) == ['DE-BB', 'DE-BE'] and not other_regions_with_direct_mapping

view_rows = []
for view_path in sorted((author / 'views').glob('*.view.json')):
    view = read(view_path)
    matches = []
    def find(value, pointer=''):
        if isinstance(value, dict):
            if value.get('goalId') == goal_id: matches.append({'JSONPointer': pointer, 'entry': value})
            for key, child in value.items(): find(child, pointer + '/' + key)
        elif isinstance(value, list):
            for idx, child in enumerate(value): find(child, pointer + '/' + str(idx))
    find(view)
    if view['scope']['jurisdiction'] == 'DE-ST' and view['scope']['stage'] == 'SekI':
        assert matches == [], 'ST SekI must retain its original target scope without this carrier'
    else:
        assert len(matches) == 1 and matches[0]['entry']['kind'] == 'goalEntry' and matches[0]['entry']['projectionRole'] == 'prerequisiteOnly'
    view_rows.append({'path': str(view_path.relative_to(root)), 'scope': view['scope'], 'actualCarrierEntries': matches, 'declaredRoleCheck': 'PASS', 'fullNativeGUICompilationByThisDReviewer': False})
assert len(view_rows) == 6

prior_records = [json.loads(line) for line in read_bytes(prior / 'results/independent-a.batch-001.records.jsonl').decode().splitlines()]
old_record = next(row for row in prior_records if row['goalId'] == goal_id)
for field in ['currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn', 'goalFingerprint']:
    assert old_record[field] == g[field]
record = {key:value for key,value in old_record.items()}
run_id = 'biologie-q1-carrier-image-user-correction-independent-a-v1-native-d-stage-2-run-001'
record.update({
    'recordId': 'bio-carrier-image-targeted-d-a-stage-2-' + goal_id,
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'bundleFingerprint': input_data['bundleFingerprint'], 'bookDigest': input_data['bookDigest'],
    'pageFingerprint': g['pageFingerprint'],
    'rationale': 'KEEP, gezielte Fortsetzung: Die gültige eigenständige frühere A-Prüfung des unveränderten bilingualen Fachtextes, der Atomarität und der beiden vollständigen Materialkarten wird exakt weiterverwendet. Tatsächliche finale HTML-Seite und PDF-Seite3 wurden unabhängig gelesen: derselbe Zieltext, die korrigierten PNG-Bytes, der fortlaufende Doppelhelixabschnitt unter Gen-Klammer und Halo, korrekter Alttext, SekI-Geltung ausschließlich BE/BB und sechs getrennte externe Nachfolgeverweise sind richtig gebunden. Die historische goldene Rückgrat-Abflachung ist behoben. Aktive Frontend-/Backend-/Curriculum-PNGs sind exakt die tatsächlich geprüften Bytes. Direktes BE/BB-Quellenmapping bleibt partial; originale Quelle3.7/Seite36 und Terminologie sowie frühere Quellenbelege sind unverändert, ganze Zellteilungs-/Chemie-/Karyogrammpflichten werden nicht freigegeben. MV/SN/TH-SekI und ST-SekII-GK/LK deklarieren denselben Carrier in den sechs separat gebundenen Kandidatenansichten nur als prerequisiteOnly; ST-SekI enthält ihn nicht. Raw applicability mit sechs Ländern ist keine zusätzliche Quellenfreigabe. Vollständige GUI-Kompilation/Integration dieser Ansichten ist ein separates Gate. Die neue Seiten-/Bundlebindung wurde tatsächlich geprüft und ersetzt keinen unveränderten Befund durch bloßen Hashwechsel. Die einseitige native Eingabe enthält evidenceProfile=null; create bezieht sich ausschließlich darauf, nicht auf eine fehlende außerhalb dieses D-Bundles vorhandene P-Prüfung. Nur maschineller Kandidat; keine menschliche Freigabe oder Lernendenleistung.'
})
assert record['decision'] == 'keep' and record['evidenceProfileRecommendation'] == 'create'
results = packet / 'results'
results.mkdir(exist_ok=True)
record_path = results / (batch['batchId'] + '.records.jsonl')
raw_records = (json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
record_path.write_bytes(raw_records)
old_run = read(prior / 'results/independent-a.batch-001.run.json')
run = {key:value for key,value in old_run.items()}
run.update({
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': input_data['bundleFingerprint'], 'bookDigest': input_data['bookDigest'],
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'independenceGroupId': campaign['independenceGroupId'], 'goalIds': [goal_id],
    'inputArtifacts': [{'role': item['role'], 'digest': item['digest']} for item in bundle['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': (own / 'native-run-started-at.utc.txt').read_text().strip(),
    'completedAt': datetime.now(timezone.utc).isoformat(),
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(json.dumps({'scope':'one-current-final-carrier-page-targeted-continuation','priorUnchangedScience':'exact-valid-own-A-reuse','newPeerResultsRead':False,'currentHTMLAndPDFActuallyInspected':True}, sort_keys=True).encode()).hexdigest(),
    'outputDigest': 'sha256:' + hashlib.sha256(raw_records).hexdigest(),
})
(results / (batch['batchId'] + '.run.json')).write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
write('actual-native-one-page-and-source-context-independent-a.json', {
    'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'goalId': goal_id,
    'decision': 'KEEP', 'actualHTMLAndPhysicalPDFPage3Read': True, 'actualNativeInputOnePageFingerprint': g['pageFingerprint'], 'full390CarrierPageFingerprint': current_page['pageFingerprint'], 'standaloneSubsetExternalSuccessorsExplainDifferentPageFingerprint': True,
    'newNativeBundleFingerprint': input_data['bundleFingerprint'], 'newNativeReviewInputFingerprint': input_data['reviewInputFingerprint'],
    'oldFullCarrierPageFingerprint': old_page['pageFingerprint'], 'changedFullPageFields': delta_fields, 'actualOther389FullPagesByteEquivalentJSON': True, 'actualCurrentWholeGoalExactlyEqualsOwnStage1Goal': True,
    'actualThreeImportedPNGs': actual_assets, 'validStage1ReviewUnchanged': True, 'unmodifiedScienceAndCompleteTwoCaseBodiesReused': stage1['fullSourceCases'],
    'directSources': direct_sources, 'otherJurisdictionsWithDirectCarrierMapping': other_regions_with_direct_mapping,
    'sixFreshCandidateViewRoleInputs': view_rows, 'candidateRolesAreNotYetClaimedAsActiveGUIIntegration': True,
    'otherSixGoalsOrHistoricalReviewsRestarted': False, 'peerCurrentDOrVResultsRead': False,
    'fullOriginalSourceCoverage': False, 'humanApproval': False, 'humanTrial': False, 'learnerEvidence': False,
    'activeWrites': False, 'strictNetGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindingsByThisReviewer': 0,
})
for helper in ['app/scripts/validateGoalDescriptionReviewCampaign.ts', 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts', 'app/scripts/validateGoalDescriptionDualRoundResolution.ts', 'app/scripts/goalBookModel.ts', 'app/scripts/positiveGoalEvidenceReview.ts', 'AGENTS.md']:
    read_bytes(root / helper)
write('exact-native-d-a-stage-2-input-bindings.json', {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'inputs': list(inputs.values()), 'globalHistoricalInputEqualityClaimed': False})
print(json.dumps({'decision': 'KEEP_ONE_CURRENT_FINAL_PAGE', 'goalId':goal_id, 'recordPath':str(record_path.relative_to(root)), 'pageFingerprint':g['pageFingerprint'], 'other389PagesExact':True, 'DAllOriginalSourcesClearance':False, 'strictNetGain':0}))
