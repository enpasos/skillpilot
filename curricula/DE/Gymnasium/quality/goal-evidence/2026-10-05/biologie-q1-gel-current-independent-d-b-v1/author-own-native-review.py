from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
PREPARED = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-gel-prospective-book-current-v1'
ROUND = PREPARED / 'native-finalbook/round-b'
BUNDLE = PREPARED / 'native-finalbook/bundle'

def load(path):
    return json.loads(path.read_text())

def digest_bytes(value):
    return 'sha256:' + hashlib.sha256(value).hexdigest()

def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

campaign = load(ROUND / 'description-review-campaign.json')
input_value = load(ROUND / 'description-review-input.json')
bundle = load(BUNDLE / 'manifest.json')
goal = input_value['goals'][0]
batch = campaign['batches'][0]
assert input_value['goalCount'] == campaign['goalCount'] == 1
assert goal['goalId'] == '8eb86a82-122d-5cae-8f80-bb2850b29c2f'
assert load(HERE / 'prepared-input-hash-verification.before.json')['status'] == 'PASS'

started = datetime.now(timezone.utc).isoformat()
run_id = 'biologie-q1-gel-current-independent-d-b-20261005-v1'
generation = {
    'contract': 'independent-native-description-review-authoring-v1',
    'provider': 'OpenAI',
    'modelFamily': 'GPT-6',
    'modelVersion': None,
    'modelVersionDisclosure': 'The session identifies Codex based on GPT-6. An exact deployment model or version is not exposed and is not claimed.',
    'reviewerRole': 'subject_reviewer',
    'samplingParameters': 'not exposed',
    'manualAIAuthoring': True,
    'otherDescriptionReviewResultsRead': False,
    'sourceMappingProposalsReadAsCandidateInputs': True,
    'sourceMappingProposalRationalesDisplayed': True,
    'sourceMappingProposalRationalesUsedAsAuthority': False,
    'scientificReadmeVerdictsRead': False,
    'generationTimestampsCover': 'authoring of the independently concluded native result after input and primary-source inspection',
}
write_json(HERE / 'generation-parameters.json', generation)
record = {
    '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    'schemaVersion': 1,
    'recordId': run_id + '-record-001',
    'runId': run_id,
    **{key: campaign[key] for key in ['campaignId', 'roundId', 'bundleFingerprint', 'bookDigest']},
    **{key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
    'decision': 'keep',
    'understandingEvidence': {
        'essentialUnderstandingDe': 'DNA-Fragmente tragen durch ihr Phosphatrückgrat negative Ladungen und wandern im elektrischen Feld zum Pluspol. Die Gelmatrix behindert größere lineare Fragmente stärker, sodass kleinere bei denselben Laufbedingungen weiter wandern. Ein Größenmarker liefert die Vergleichsgrundlage für Fragmentlängen; eine Bande zeigt gemeinsam wandernde Fragmente, während gleiche Bandenhöhe allein keine gleiche Basensequenz belegt.',
        'essentialUnderstandingEn': 'DNA fragments carry negative charges through their phosphate backbone and migrate toward the positive electrode in an electric field. The gel matrix impedes larger linear fragments more strongly, so smaller fragments travel farther under the same running conditions. A size marker provides the comparison basis for fragment lengths; a band represents fragments migrating together, while matching band positions alone do not establish identical base sequences.',
        'observablePerformanceDe': 'Die lernende Person erklärt aus Ladung und Gelwirkung die Wanderungsrichtung und Größenreihenfolge linearer DNA-Fragmente. Sie liest ein unabhängig vorgegebenes Gel mit Größenmarker aus, ordnet Probenbanden begründet den Markergrößen beziehungsweise Größenintervallen zu und trennt beobachtete Bandenlagen von den dadurch gestützten Längenaussagen. Bei nur qualitativem Marker bleibt ihre Auswertung qualitativ.',
        'observablePerformanceEn': 'The learner explains the migration direction and size order of linear DNA fragments from charge and the effect of the gel. They interpret an independently supplied gel with a size marker, justify assignments of sample bands to marker sizes or size intervals, and distinguish observed band positions from the resulting supported length statements. With a purely qualitative marker, their interpretation remains qualitative.',
        'transferExpectationDe': 'In einem neuen Gel mit anderer Laufstrecke und verändertem Markermuster deutet die lernende Person erneut Probenbanden relativ zum jeweils mitgelaufenen Marker. Sie begründet bei einer Bande zwischen Markerbanden ein Größenintervall und erklärt, weshalb die absolute Wanderungsstrecke aus dem ersten Gel nicht ohne erneute Markerreferenz übertragen werden darf. Die Auswertung bleibt bei vorgegebenen Bandenmustern linearer DNA und fordert keine PCR oder eigene Versuchsdurchführung.',
        'transferExpectationEn': 'In a fresh gel with a different migration distance and a changed marker pattern, the learner again interprets sample bands relative to the marker run in that gel. For a band between marker bands, they justify a size interval and explain why the absolute migration distance from the first gel cannot be transferred without a new marker reference. Interpretation remains limited to supplied band patterns of linear DNA and requires neither PCR nor conducting an experiment.',
    },
    'rationale': 'Die kurze deutsche Beschreibung benennt das Trennprinzip und eine begründete Auswertung gegebener Banden mit Größenmarker; die englische Beschreibung enthält dieselbe Kompetenz und dieselben Hilfen. Dies operationalisiert den Gelanteil des amtlichen HE-Punkts Q1.2, gedruckte S. 39, und den expliziten Gelinhalt von BY B12 2.6 in GA und EA. Die gebundenen Pair-Mappings behandeln Gel jeweils als Teilkompetenz; PCR und die medizinische, gesellschaftliche und ethische DNA-Analytik sind als eigene Komponenten vorhanden. Für gelieferte Fragmente ist PCR kein universell notwendiges Vorwissen. DNA-Aufbau und Orientierung passen zu den gebundenen Vorbedingungen. Das tatsächliche PDF/HTML und die visuell geprüfte PDF-Lernzielseite zeigen Minuspol und Taschen oben, Pluspol unten, eine Wanderung nach unten und den korrekten Hinweis auf kleinere lineare Fragmente. Der unbezifferte Marker unterstützt qualitative Größenvergleiche, ohne exakte Längen vorzutäuschen. Erklärung und Anwendung desselben Trennmodells bilden hier eine zusammenhängende Methodenkompetenz; Durchführung, Sequenzbestimmung, individuelle Identitätsfeststellung und ethische Bewertung werden nicht eingeführt. Ein separater V2-Verständnisnachweis fehlt und soll erstellt werden. Das Bild ist Lehrunterstützung und kein Leistungsbeleg.',
    'evidenceProfileContract': 'positive-understanding-evidence-v2',
    'evidenceProfileRecommendation': 'create',
    'recordStatus': 'candidate',
    'reviewAuthority': 'ai_candidate',
}
results = ROUND / 'results'
results.mkdir(exist_ok=True)
records_path = results / (batch['batchId'] + '.records.jsonl')
run_path = results / (batch['batchId'] + '.run.json')
assert not records_path.exists() and not run_path.exists(), 'Own run must not overwrite an existing result'
records_bytes = (json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
records_path.write_bytes(records_bytes)
roles = {'book_model', 'book_pdf', 'book_pdf_render_manifest', 'book_html', 'book_html_render_manifest', 'review_prompt', 'review_criteria', 'run_manifest_schema'}
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    **{key: campaign[key] for key in ['campaignId', 'roundId', 'bundleFingerprint', 'bookDigest', 'promptFingerprint', 'criteriaFingerprint', 'independenceGroupId']},
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'provider': 'OpenAI',
    'model': 'GPT-6 family (Codex; exact model version not exposed)',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-review-v2',
    'generationParametersFingerprint': digest_bytes((HERE / 'generation-parameters.json').read_bytes()),
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in roles] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': started,
    'completedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'completed',
    'outputDigest': digest_bytes(records_bytes),
    'toolchainVersion': 'native-d-b-review-authoring-v1',
}
write_json(run_path, run)
write_json(HERE / 'authored-results.receipt.json', {
    'status': 'AI_CANDIDATE_KEEP_PENDING_NATIVE_VALIDATION',
    'recordPath': str(records_path.relative_to(ROOT)),
    'recordSha256': digest_bytes(records_bytes),
    'runPath': str(run_path.relative_to(ROOT)),
    'runSha256': digest_bytes(run_path.read_bytes()),
    'preparedFreezeManifestSha256': digest_bytes((PREPARED / 'prepared.freeze.manifest.json').read_bytes()),
    'bookDigest': campaign['bookDigest'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'goalFingerprint': goal['goalFingerprint'],
    'pageFingerprint': goal['pageFingerprint'],
    'strictNetGain': 0,
    'activeWrites': 0,
    'humanApproval': False,
})
print(json.dumps({'decision': record['decision'], 'records': str(records_path.relative_to(ROOT)), 'run': str(run_path.relative_to(ROOT)), 'strictNetGain': 0}, indent=2))
