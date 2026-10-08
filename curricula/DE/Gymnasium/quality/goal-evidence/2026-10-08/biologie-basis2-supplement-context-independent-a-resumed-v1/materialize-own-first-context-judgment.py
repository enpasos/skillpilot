# SPDX-License-Identifier: Apache-2.0
"""Record this agent's actual targeted context judgments, without peer outputs."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-source-supplement-technical-author-resumed-v1'
ROUND = AUTHOR / 'native-two-context/round-a'
RESULTS = OWN / 'round-a/results'
RESULTS.mkdir(parents=True, exist_ok=True)

def read(path): return json.loads(Path(path).read_text())
def digest(path): return 'sha256:' + hashlib.sha256(Path(path).read_bytes()).hexdigest()
def bind(path):
    path = Path(path)
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(path), 'bytes': path.stat().st_size}
def write(path, value):
    with Path(path).open('x') as stream:
        stream.write((value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n'))

campaign = read(ROUND / 'description-review-campaign.json')
inputs = read(ROUND / 'description-review-input.json')
bundle = read(ROUND / 'review-bundle-manifest.json')
batch = campaign['batches'][0]
run_id = batch['batchId'] + '.context-first-run'
now = datetime.now(timezone.utc).isoformat()
started = datetime.fromtimestamp((OWN / 'actual-reading/native-1.png').stat().st_mtime, timezone.utc).isoformat()

expectations = [
    {
        'essentialUnderstandingDe': 'Bei aerober Zellatmung wird Glucose mit Sauerstoff zu Kohlenstoffdioxid und Wasser umgesetzt. Chemische Energie wird für Lebensprozesse nutzbar und teilweise als Wärme abgegeben; Sauerstoff erschafft keine Energie.',
        'essentialUnderstandingEn': 'During aerobic cell respiration, glucose and oxygen are converted into carbon dioxide and water. Chemical energy becomes usable for life processes and is partly released as heat; oxygen does not create energy.',
        'observablePerformanceDe': 'Die lernende Person formuliert die Glucose-Wortgleichung und erklärt am gegebenen Muskel- oder Samenmodell Stoffumsatz und Energieumwandlung kausal. Sie unterscheidet diesen Zellprozess von Lungenventilation.',
        'observablePerformanceEn': 'The learner writes the glucose word equation and causally explains material conversion and energy conversion in the supplied muscle or seed model. They distinguish this cellular process from lung ventilation.',
        'transferExpectationDe': 'Die lernende Person beurteilt einen frischen Blattfall mit Nettoaufnahme von Kohlenstoffdioxid im Licht und erklärt, warum gleichzeitig Zellatmung stattfinden kann, statt aus dem Nettofluss eine fehlende Zellatmung abzuleiten.',
        'transferExpectationEn': 'The learner evaluates a fresh leaf case showing net carbon-dioxide uptake in light and explains why cell respiration may occur simultaneously, rather than inferring absent respiration from the net flux.',
    },
    {
        'essentialUnderstandingDe': 'Lichtabhängige Reaktionen überführen Lichtenergie in chemische Mittel für den Stoffaufbau. Lichtunabhängige Reaktionen benötigen diese Mittel und Kohlenstoffdioxid; keine direkte Lichtaufnahme bedeutet weder ausschließlich nachts noch unbegrenzte Unabhängigkeit vom lichtabhängigen Teil.',
        'essentialUnderstandingEn': 'Light-dependent reactions convert light energy into chemical resources for synthesis. Light-independent reactions need those resources and carbon dioxide; not directly absorbing light means neither exclusively nocturnal activity nor unlimited independence from the light-dependent component.',
        'observablePerformanceDe': 'Die lernende Person erklärt beide Funktionen am vereinfachten Chloroplastenmodell und begründet die kurze Nachwirkung eines vorgegebenen Vorrats nach Abdunkeln. Sie widerlegt die Deutung, lichtunabhängig bedeute ausschließlich nachts.',
        'observablePerformanceEn': 'The learner explains both functions using the simplified chloroplast model and accounts for the brief effect of a supplied reserve after darkening. They refute the interpretation that light-independent means exclusively nocturnal.',
        'transferExpectationDe': 'Die lernende Person begründet in einem frischen Modellfall mit wieder vorhandenem Kohlenstoffdioxid, aber dauerhaft ausgeschalteter Lichtreaktion und aufgebrauchtem Vorrat, warum der Stoffaufbau nicht unbegrenzt weiterlaufen kann.',
        'transferExpectationEn': 'In a fresh model case with restored carbon dioxide but permanently disabled light-dependent reactions and a depleted reserve, the learner explains why synthesis cannot continue indefinitely.',
    },
]
rationales = [
    'Eigene tatsächliche Sichtprüfung der nativen physischen Seite 3 und des vollständigen Ziel-/P-/Vierfallkontexts: Der neue Pfad „Ergänzende Grundlagen der Stoff- und Energieumwandlung (Sek I)“ bezeichnet passend die begrenzte Wortgleichungs- und Energiekompetenz. Der unveränderte geerbte Grundlagenanker ist sachlich passend. Acht aktuelle Regionen sind durch tatsächliche direkte Teilquellen und 23 Ansichten belegt. BB/BE phys30, MV phys21, NW phys30, SH phys27, SN phys38, ST phys34–35 und TH phys23/26–27 tragen den Zellatmungsgrundsatz, nicht jeweils die gesamte zusammengesetzte Quellpflicht. Die unveränderten Muskel-/Samenfälle bleiben unter dem neuen Kapitel passende Modelle. Wortgleichung ersetzt weder Brutto-/Summengleichung noch Atmungsversuche; vier Operator-HOLDs bleiben offen. Dies ist eigenständige neue Kontextprüfung bei bereits fachlich geprüften unveränderten P-Bodies, keine historische blinde Ganz-P-Prüfung.',
    'Eigene tatsächliche Sichtprüfung der nativen physischen Seite 4 und des vollständigen Ziel-/P-/Vierfallkontexts: Das Ergänzungskapitel umfasst passend die vereinfachte funktionale Kopplung als Sek-I-Kompetenz. SN Klasse9 nennt auf der tatsächlich gelesenen physischen Primärseite38 die Wechselwirkung lichtabhängiger und lichtunabhängiger Reaktion ausdrücklich. Die aktuelle Teilzuordnung und Seite behaupten nur SN G8 SekI; daraus folgt keine nationale Ausschließlichkeit dieses Stoffes. Die Wortgleichung576 bleibt eine echte direkte Voraussetzung außerhalb der Zweier-Kapitelsicht und innerhalb des Vollmodells. Vorrats- und Kohlenstofffälle passen unverändert zum neuen Kontext, ohne Calvin-Zyklus-, Redoxdetail- oder Versuchsfreigabe. Neue Kapitelbindung ist eigenständig geprüft; vorhandene P2-Bodies bleiben E1/G1 ai_candidate/needs_human_review.',
]
records = []
for index, goal in enumerate(inputs['goals']):
    record = {
        'recordId': f'bio-basis2-supplement-context-independent-a-{index+1:02}',
        'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        **{k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': expectations[index], 'rationale': rationales[index],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'none',
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    }
    records.append(record)
record_path = RESULTS / (batch['batchId'] + '.records.jsonl')
write(record_path, ''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
parameters = {
    'role': 'Independent targeted new native source-supplement context A followup',
    'agent': '/root/biology_basis2_supplement_context_independent_a',
    'exactBackendModelIdExposed': False,
    'newContextOtherReviewerVerdictReadBeforeFirstDecision': False,
    'historicalUnchangedP2HeaderExposure': 'The exact P2 file header included the original old A rationale and reviewer metadata; the agent saw it while extracting the full unchanged bodies. No B result or scientific judgment on the new supplement context was read. This is not a blind historical whole-P review.',
    'actualPrivateLearnerDataUsed': False,
}
write(OWN / 'actual-review-execution-parameters.json', parameters)
artifact_roles = {'book_model', 'book_pdf', 'book_html', 'review_prompt', 'review_criteria'}
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'], 'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI / Codex', 'model': 'Codex current-session model; exact backend model identifier is not exposed',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(OWN / 'actual-review-execution-parameters.json'),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in artifact_roles] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': started, 'completedAt': now, 'status': 'completed',
    'outputDigest': digest(record_path), 'toolchainVersion': 'skillpilot-existing-description-review-campaign-v2',
}
run_path = RESULTS / (batch['batchId'] + '.run.json')
write(run_path, run)
first = {
    'schemaVersion': 1, 'reviewId': 'biologie-basis2-supplement-context-independent-a-resumed-v1',
    'reviewScope': 'Two unchanged already scientifically reviewed goals: new native chapter, source scope and page/P-context compatibility; existing576 changed relation/pagination verification',
    'firstIndependentDecisionAtUtc': now,
    'exposure': parameters,
    'newContextPeerOrAuthorScientificJudgmentRead': False,
    'descriptionContextDecisions': [{'goalId': r['goalId'], 'decision': 'KEEP', 'reasonDe': r['rationale']} for r in records],
    'positiveEvidenceContextDecisions': [{'goalId': r['goalId'], 'decision': 'KEEP_EXISTING_BODY_IN_NEW_CONTEXT', 'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'wholeProfilesAndCasesChanged': False} for r in records],
    'existing576Decision': {
        'decision': 'ACCEPT_CONTROLLED_CURRENT_STRUCTURAL_BINDING',
        'reasonDe': 'Im neuen 394-Vollmodell sind alle drei Rückverweisidentitäten, Titel und Anker erhalten. Die Seitenzahlen sind tatsächlich 54,204,394 und stimmen mit den aktuell benannten Zielseiten überein; 206→204 und56→394 sind echte Navigationskorrekturen. In der tatsächlich früher geprüften Einseiten-Kapitelsicht bleiben die drei externen URL-Relationen als vollständige Objekte erhalten und nur umgeordnet; alle anderen Seitenfelder außer dem daraus abgeleiteten Seitenfingerprint bleiben exakt. Die zugrunde liegende Wortgleichung, Geltung, direkte Voraussetzung und Bildbytes sind unverändert. Der Nachweis ergänzt kontrolliert die genuine frühere 576-Kontext-Supersession; er ersetzt sie nicht durch angebliche exakte Gleichheit zur 392-Baseline.',
        'full394ReverseObjectsNotMerelyPermuted': True,
        'requiresNewWholeWordScientificReview': False,
        'mustRetainPriorGenuineWordContextSupersession': True,
        'additionalCurrentNative576CampaignRequiredForScientificContext': False,
    },
    'sourceBoundedPartialRowsAccepted': 10,
    'all20WholeDutiesRetainedAsWholeReadingInputs': True,
    '268HistoricalPartnerRowsRetainedAsHistoricalReadingInputs': True,
    '248HistoricalPartnerRowsCurrentlyPresentInAtlasInputs': True,
    '20HistoricalPartnerRowsEarlierScopeRefinedAndNotAddedOrRemovedByThisSupplement': True,
    'wholeOriginalSourceCoverageApproved': False,
    'fourPriorOperatorHoldsRemainOpen': True,
    'integrationReportingCorrectionRequired': {
        'findingId': 'A-current-partner-assertion-overstates-historical-268',
        'affectedArtifact': 'checks/source-whole-duty-and-mapping-preservation.actual.json',
        'claim': 'all268OriginalPartnerWholeRowsRetainedInOrdinaryMappingInputs=true',
        'actual': '248 of those historical rows are current in the atlas; 20 were earlier scope-refined. All268 survive as whole historical duties/reading inputs, and the current mapping files retain exact task-input bytes.',
        'resolution': 'Preserve the historical artifact; append a precise current correction receipt before reporting integration. No old rejected source roles are restored as valid and no new whole-source clearance is claimed.',
        'scientificTwoGoalContextBlockingFinding': False,
    },
    'descriptionRecords': bind(record_path), 'descriptionRun': bind(run_path),
    'ownActualTechnicalComparison': bind(OWN / 'independent-actual-input-and-model-comparison.json'),
    'humanApproval': False, 'humanTrial': False, 'actualLearnerPerformance': False,
    'activeWrites': 0, 'activeStrictGain': 0,
}
write(OWN / 'two-new-context-and-existing576.independent-a.first-verdict.json', first)
payloads = [p for p in sorted(OWN.rglob('*')) if p.is_file()]
write(OWN / 'independent-a.first-verdict.freeze.json', {
    'schemaVersion': 1, 'createdAtUtc': now,
    'firstScientificJudgmentFrozenBeforeAnyNewContextPeerOrAuthorScientificResultRead': True,
    'historicalP2HeaderExposureTruthfullyDeclared': True,
    'payloadFiles': [bind(p) for p in payloads], 'activeWrites': 0, 'humanApproval': False,
})
print('First independent targeted context verdict frozen:', digest(OWN / 'two-new-context-and-existing576.independent-a.first-verdict.json'))
print('First freeze:', digest(OWN / 'independent-a.first-verdict.freeze.json'))
