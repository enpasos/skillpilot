# SPDX-License-Identifier: Apache-2.0
"""Serialize this reviewer's completed, goal-specific inspections; no active writes."""
import datetime
import hashlib
import json
from pathlib import Path

OWN = Path(__file__).parent
AUTHOR = OWN.parent / 'biologie-human20-current391-author-v1'
IMAGE = Path('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-human20-image-author-continuation-root-20261007-v2')
ROUND = AUTHOR / 'native-raster-candidate/twenty/round-b'
def read(path):
    return json.loads(Path(path).read_text())
def rows(path):
    return [json.loads(line) for line in Path(path).read_text().splitlines() if line]
def sha(path):
    return 'sha256:' + hashlib.sha256(Path(path).read_bytes()).hexdigest()
def write(name, value):
    with (OWN / name).open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def write_rows(name, value):
    with (OWN / name).open('x') as stream:
        stream.write(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in value))

completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
entry = read(IMAGE / 'neutral-final-human20-raster-native-review.entry.json')
images = read(IMAGE / 'selected-twenty-author-images.exact.json')['images']
image_by = {item['goalId']: item for item in images}
campaign = read(ROUND / 'description-review-campaign.json')
batch = campaign['batches'][0]
bundle = read(ROUND / 'review-bundle-manifest.json')
dinput = read(ROUND / 'description-review-input.json')
p_source = AUTHOR / 'native-raster-candidate/P20.actual-raster-author.review.jsonl'
ps = rows(p_source)
p_by = {item['goalId']: item for item in ps}
notes = read(OWN / 'actual-visual-inspection.notes.independent-b.json')
page_by = {item['goalId']: item for item in entry['physicalGoalPages']}
native_by = {item['goalId']: item for item in dinput['goals']}
run_id = 'biologie-human20-final-raster-native-independent-b-20261007-v1-run'

parameters = {
    'schemaVersion': 1,
    'artifactKind': 'actual-independent-b-final-human20-review-parameters',
    'provider': 'OpenAI Codex',
    'model': 'GPT-6 family; exact serving revision not exposed',
    'samplingParameters': 'Not exposed by this agent runtime; no temperature/seed claimed.',
    'role': 'Independent reviewer B; actual raster/native-page sight and current D/P/V/context/source bindings.',
    'priorOwnWholeScience': 'Valid own complete DE/EN descriptions, forty whole task/answer/rubric pairs and bounded original curriculum science reviews retained; only changed raster/native-page bindings reviewed now.',
    'peerCurrentAOutputRead': False,
    'rootAuthorCountercheck': 'After the first own sealed carbonyl hold, root pointed to original pixel double lines. Own unmodified pixel crops confirm it was a false positive. The initial hold is retained and the separate resolution is disclosed.',
    'reviewRecommendation': 'All twenty current descriptions KEEP, all twenty images machine PASS after the separately resolved false positive; no human acceptance.',
    'currentSuppliedP': str(p_source),
    'currentPRecommendation': 'none: supplied separately bound complete V2 profiles retain valid reviewed scientific contracts and pass actual current raster binding checks.',
    'independenceBoundary': 'No raw current peer A records or verdicts read before this completed own seal; earlier own scientific reviews and source locators intentionally preserved as required by the authorized targeted workflow.',
    'noHumanApproval': True,
    'noHumanTrial': True,
    'activeWrites': 0,
}
write('native-d20.generation-parameters.actual.json', parameters)

drecords = []
for row in dinput['goals']:
    image = image_by[row['goalId']]
    ordinal = image['ordinal']
    profile = p_by[row['goalId']]['profile']
    core, transfer = profile['expectations']
    axis = profile['variationAxes'][0]
    understanding = {
        'essentialUnderstandingDe': core['essentialUnderstandingDe'] + ' ' + transfer['essentialUnderstandingDe'],
        'essentialUnderstandingEn': core['essentialUnderstandingEn'] + ' ' + transfer['essentialUnderstandingEn'],
        'observablePerformanceDe': core['observablePerformanceDe'],
        'observablePerformanceEn': core['observablePerformanceEn'],
        'transferExpectationDe': 'In einem unabhängig neu vorgelegten veränderten Fall: ' + transfer['observablePerformanceDe'] + ' Fachlich veränderte Kontexte: ' + axis['textDe'],
        'transferExpectationEn': 'In a separately presented fresh changed case: ' + transfer['observablePerformanceEn'] + ' Meaningfully changed contexts: ' + axis['textEn'],
    }
    rationale = (
        'Gezieltes unabhängiges KEEP der unveränderten ganzen DE/EN-Zieltexte nach validem eigenem ganzen Quellen-/P-Science-Review und aufgelösten v2-Befunden. '
        'Die gebundene Quellgrenze ' + row['canonicalContext']['sourceRef'] + ' und Zielidentität werden erhalten. '
        'Neue tatsächliche Raster-/Kontext-/Seitenbindung geprüft: Original-PNG, beide echten Chromium-360/680-Ansichten und vollständige native PDF-Seite ' + str(page_by[row['goalId']]['physicalPage']) + '. '
        + notes['notesByOriginalAuthorOrdinal'][str(ordinal)] + ' '
        'Hauptmotiv/entscheidende Beziehungen auf dem Handy erkennbar, am PC lesbar; passende abstrakte Comicdarstellung, keine Perspektivverwechslung oder Buchseitenüberlappung. '
        'Das separat neutral gebundene aktuelle P20-V2-Profil besitzt zwei vollständige bilinguale Fälle mit echter fachlicher Variation, Rubriken und wahrheitsgemäßem ai_candidate/needs_human_review; Profilinhalt gegenüber gültigem eigenem Science-v2 unverändert. '
        'Tatsächliche native Neuberechnung bestätigt genaue Ziel-, Seiten-, Quellen-/Sicht- und Rasterbindungen; raw applicability wird nicht als vollständiger Quellnachweis für alle Länder ausgegeben. '
        'Die Visualisierung unterstützt Lernen; sie belegt keine reale Lernendenleistung oder menschliche Freigabe.'
    )
    drecords.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': 'human20-final-b-' + row['goalId'],
        'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        **{key: row[key] for key in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': understanding,
        'rationale': rationale, 'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
assert len(drecords) == 20 and [row['goalId'] for row in drecords] == batch['goalIds']
write_rows('native-d20.description-records.jsonl', drecords)
roles = {'book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria'}
input_artifacts = [{'role': item['role'], 'digest': item['digest']} for item in bundle['artifacts'] if item['role'] in roles]
input_artifacts.append({'role': 'description_review_batch_input_jsonl','digest': batch['batchInputFingerprint']})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI Codex', 'model': parameters['model'], 'role': 'sequencing_representation_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': sha(OWN / 'native-d20.generation-parameters.actual.json'),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': batch['goalIds'], 'inputArtifacts': input_artifacts,
    'startedAt': '2026-10-07T21:11:42.299762+00:00', 'completedAt': completed,
    'status': 'completed', 'outputDigest': sha(OWN / 'native-d20.description-records.jsonl'),
    'toolchainVersion': 'codex-independent-current-raster-native-review-v1',
}
write('native-d20.review-run.actual.json', run)

current_ps = []
for source in ps:
    record = dict(source)
    record.update({
        'reviewId': 'biologie-human20-final-raster-native-independent-b-20261007-v1',
        'reviewedAt': completed,
        'reviewer': 'Independent Codex reviewer B; preserved valid own whole scientific review and actual current raster/page/context/P binding recheck',
        'reason': 'Eigenes vollständiges P-Science-v2 gültig erhalten. Alle neuen Raster-/Seiten-/Kontext-/Quellenbindungen tatsächlich nativ geprüft; Originale, 360/680-Captures und komplette native Seiten unabhängig gesichtet. Profilkörper unverändert. E1/G1 bleibt ai_candidate/needs_human_review, keine reale Lernendenleistung, menschliche Freigabe oder Erprobung.',
        'reviewRunIds': [run_id],
        'dissent': source['dissent'] + ['Der finale B-Raster-/Seitenrecheck ist abgeschlossen; historische Autoren-Stand-Aussagen bleiben oben unverändert als Historie. A wird vor eigenem Erstseal nicht gelesen. Human Approval/Trial bleiben getrennt ausstehend.'],
    })
    assert record['profile'] == source['profile']
    current_ps.append(record)
write_rows('P20.current-raster-independent-b.review.jsonl', current_ps)

verdicts = []
for image in images:
    goal_id = image['goalId']
    row = native_by[goal_id]
    capture_path = entry['actualImageWidthCaptures'][goal_id]
    capture = read(capture_path)
    verdicts.append({
        'goalId': goal_id, 'originalAuthorOrdinal': image['ordinal'],
        'currentGoalFingerprint': row['goalFingerprint'], 'currentNativePageFingerprint': row['pageFingerprint'],
        'bookDigest': campaign['bookDigest'],
        'selectedOriginalPNG': {key: image[key] for key in ['path','sha256','provider','version','promptPath','toolProvenancePath','altDe']},
        'decision': 'KEEP', 'machineVisualizationDecision': 'PASS', 'reviewAuthority': 'ai_candidate',
        'substantiveScientificObservation': notes['notesByOriginalAuthorOrdinal'][str(image['ordinal'])],
        'actualSourceRasterViewed': True,
        'actualWidthCaptureManifest': {'path': capture_path, 'sha256': sha(capture_path)[7:]},
        'actualWidthCaptures': capture['captures'],
        'mobile360': 'PASS: principal motif and essential relations visible without mandatory paragraph-sized text; contain, no cropping.',
        'desktop680': 'PASS: labels and important relationships legible; contain, no crop or distortion.',
        'styleAndFormat': 'Friendly clear abstract comic illustration, landscape PNG; native approximately 16:9, coherent with existing assets.',
        'actionPerspective': 'PASS: no mandatory handwriting/measurement text incorrectly facing an external viewer; actual person/tablet/laptop scenes assessed.',
        'actualNativePDFGoalPage': page_by[goal_id],
        'actualWholePageViewed': True,
        'nativePageObservation': 'Exact goal ID/title/description/image and context inspected on complete actual native page; no clipping, overlap or hidden essential detail; external prerequisites visibly distinguished.',
        'currentPBinding': {key: p_by[goal_id][key] for key in ['goalFingerprint','reviewInputFingerprint','profileFingerprint','status','reviewAuthority']},
        'openFindings': [],
        'falsePositiveResolution': 'pixel-followup-ordinal06/original-carbonyl-double-bond-resolution.independent-b.actual.json' if image['ordinal'] == 6 else None,
        'humanApproval': False, 'humanTrial': False,
    })
write('V20.actual-image-width-native-page.independent-b.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-b-actual-original-raster-width-captures-native-whole-page-verdicts',
    'reviewedAt': completed, 'role': 'independent_reviewer_b', 'independenceGroupId': campaign['independenceGroupId'],
    'peerCurrentAOutputsReadBeforeSeal': False, 'verdicts': verdicts,
    'all20Passed': True, 'unresolvedFindings': 0, 'immutableInitialFalsePositiveRetained': True,
    'firstFalsePositiveResolvedWithoutPixelChange': True, 'activeWrites': 0, 'strictClosuresClaimed': 0,
    'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'D20': len(drecords), 'P20': len(current_ps), 'V20': len(verdicts), 'activeWrites': 0, 'humanApproval': False}))
