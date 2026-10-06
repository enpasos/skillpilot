# SPDX-License-Identifier: Apache-2.0
"""Serialize this root review's explicitly read decisions, not automated science."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
OWN = Path(__file__).resolve().parent
BASE = OWN.with_name('biologie-q1-bacterial-structure-fission-native-candidate-v1')
ROUND = BASE / 'native-finalbook/round-b'
campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
manifest = json.loads((ROUND / 'review-bundle-manifest.json').read_text())
batch = campaign['batches'][0]
inputs = [json.loads(line)['goal'] for line in (ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')).read_text().splitlines()]
RUN = 'biologie-bacterial-structure-fission-root-independent-b-20261005-v1'

SCIENCE = {
    '7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f': {
        'essentialUnderstandingDe': 'Unterschiedliche Zelltypen lassen sich anhand von Lichtmikroskopbefunden und ausdrücklich ergänzenden Modellen vergleichen; ein nicht lichtmikroskopisch auflösbares Detail ist kein direkt beobachteter Befund.',
        'essentialUnderstandingEn': 'Different cell types can be compared using light-microscope observations and explicitly supplementary models; a detail beyond light-microscope resolution is not a directly observed result.',
        'observablePerformanceDe': 'Die lernende Person trennt im gegebenen Vergleich beobachtbare Befunde von Modellinformationen und begründet die Einordnung prokaryotischer, eukaryotischer sowie pflanzlicher und tierischer Zellen.',
        'observablePerformanceEn': 'The learner distinguishes observable results from model information in a supplied comparison and justifies classification of prokaryotic, eukaryotic, plant and animal cells.',
        'transferExpectationDe': 'Bei anders angeordneten neuen Zellbildern verwendet sie dieselben begründeten Kriterien und erklärt, welche Zusatzinformation ein Modell gegenüber dem Lichtmikroskopbefund liefert.',
        'transferExpectationEn': 'With rearranged fresh cell images, the learner applies the same justified criteria and explains what additional information a model supplies beyond the light-microscope observation.',
        'rationale': 'KEEP der aktuellen Kontextbindung: Der DE/EN-Zieltext, die bereits gültige fachliche Kompetenz, GFP und Bildbytes bleiben unverändert. Tatsächlich betrachtete vollständige PDF-Seite 3 und geladener HTML-Zielabschnitt zeigen nun den Bakterienbau als nachfolgendes Ziel auf Seite 2; vorhandene weitere Nachfolger und die zwei sachlich passenden Vorbedingungen bleiben erkennbar. Die Modell-/Mikroskop-Trennung wird durch das vorhandene Bild nicht aufgehoben. Die 21 vorhandenen direkten Quellenbindungen werden nicht neu fachlich freigegeben. Diese Prüfung betrifft den tatsächlich neuen reverseRequires-Kontext und seine Seiten-/Bildbindungen; sie zählt keinen neuen wissenschaftlichen Abschluss und ersetzt das bestehende externe P-Profil nicht.',
        'recommendation': 'none',
    },
    '5b2571d9-f079-52b2-b21b-8f389c7409f4': {
        'essentialUnderstandingDe': 'Der prokaryotische Grundbauplan trennt Membran, Zellplasma, Ribosomen und genetisches Material. Das Chromosom liegt ohne membranumhüllten Zellkern im Zellraum; Plasmide sind gegebenenfalls zusätzliche DNA, kein universelles Bakterienmerkmal.',
        'essentialUnderstandingEn': 'The prokaryotic plan distinguishes membrane, cytoplasm, ribosomes and genetic material. The chromosome is in the cell interior without a membrane-bound nucleus; plasmids are optional additional DNA, not universal bacterial features.',
        'observablePerformanceDe': 'Die lernende Person stellt anhand eines gegebenen Schemas den bakteriellen Grundbauplan dar, erläutert die Lage des Chromosoms und grenzt optionales Plasmidmaterial vom Zellkern und anderen Strukturen ab.',
        'observablePerformanceEn': 'The learner represents the bacterial plan from a supplied diagram, explains chromosome location and distinguishes optional plasmid material from a nucleus and other structures.',
        'transferExpectationDe': 'An einer frischen plasmidfreien und einer plasmidhaltigen Darstellung begründet sie jeweils den prokaryotischen Bau, ohne eine gezeichnete DNA-Struktur als Nachweis erfolgreicher Genexpression auszugeben.',
        'transferExpectationEn': 'Using fresh plasmid-free and plasmid-bearing representations, the learner justifies the prokaryotic structure without treating drawn DNA as evidence of successful gene expression.',
        'rationale': 'KEEP: Die knappen DE/EN-Texte begrenzen das Atom auf einen gegebenen Grundbauplan und die darin verortete Erbinformation. Strukturzuordnung und DNA-Lage bilden eine zusammenhängende Modellkompetenz; Vermehrung wird im eigenständigen Nachfolger erhalten. Tatsächlich betrachtete vollständige PDF-Seite 4 und geladener HTML-Zielabschnitt passen zu Titel, Text, Orientierung/Zelltypen-Vorbedingungen und Zweiteilungsnachfolger. Keine molekulare Proteinbiosynthese oder Mitose wird vorausgesetzt. Das tatsächlich im Original und bei 360/680 Pixeln betrachtete PNG zeigt Membran/Zellwand getrennt, Ribosomen, DNA ohne Kern und ausdrücklich optionale Plasmide. Amtliche HE-PDF physische/gedruckte S.39, Stand 01.08.2025, ordnet Bau und Vermehrung dem LK zu; beide Komponenten bleiben als partielle aktuelle Ziele erhalten. Tatsächlich gelesene BY9-Originalseite und MV/NW/SH/SN/ST-PDF-Stellen tragen lokale Teilkomponenten, nicht ganze Mikrobiologie-, Viren-, Stoffwechsel- oder Populationsleistungen. TH-PDF physisch21/gedruckt15 trägt die Bauabgrenzung, keine neue Reproduktionsbindung. Native Seiten-Geltung HE nur LK und lokale Sek-I-Sichten passt. Keine tatsächliche Lernendenleistung oder menschliche Freigabe.',
        'recommendation': 'create',
    },
    '49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd': {
        'essentialUnderstandingDe': 'Bei modellhafter bakterieller Zweiteilung ermöglichen chromosomale DNA-Kopie, Verteilung und Zelltrennung zwei Zellen mit Erbinformation. Ein Größenanstieg einer Zelle allein zeigt keine Zweiteilung; das vereinfachte Modell stellt keine Kernmitose dar.',
        'essentialUnderstandingEn': 'In modelled bacterial binary fission, chromosomal DNA copying, partitioning and separation allow two cells to receive genetic information. Enlargement of one cell alone does not show binary fission; the simplified model depicts no nuclear mitosis.',
        'observablePerformanceDe': 'Die lernende Person erklärt an bereitgestellten frischen Stadien die Folge aus DNA-Kopie, Verteilung und Trennung und begründet, wie jede entstehende Zelle chromosomales Material erhält.',
        'observablePerformanceEn': 'The learner explains the sequence of DNA copying, partitioning and separation using fresh supplied stages and justifies how each developing cell receives chromosomal material.',
        'transferExpectationDe': 'Bei einem materialgestützt unterbrochenen Kopiervorgang und seiner Wiederaufnahme unterscheidet sie Zellwachstum von erfolgreicher Zweiteilung und begründet die gezeigte Prozessänderung.',
        'transferExpectationEn': 'For a material-supported copying interruption and its reversal, the learner distinguishes growth from successful binary fission and justifies the depicted process change.',
        'rationale': 'KEEP: DE/EN fordern dieselbe kohärente Erklärung eines gegebenen Zweiteilungsmodells einschließlich Verteilung der kopierten chromosomalen DNA. Das ist atomar und keine ungekürzte zusätzliche molekulare Replikations-, Mitose- oder quantitative Populationskompetenz. Tatsächlich betrachtete vollständige PDF-Seite 5 und geladener HTML-Zielabschnitt sind vollständig und zeigen Bakterienbau plus Orientierung als passende Vorbedingungen. Das tatsächlich im Original und bei 360/680 Pixeln betrachtete PNG zeigt eine Chromosomdarstellung, kopierte/verteilte zwei Darstellungen in der eingeschnürten Zelle und zwei getrennte Zellen mit je einer, ausdrücklich als vereinfachtes Modell. Amtliche HE-PDF S.39 trägt die LK-Komponente Bau und Vermehrung; BY9 verlangt zusätzlich Populationswachstum und Überdauerungsstadien, die hier nicht geschlossen werden. MV/NW/SH/SN/ST-Originalstellen tragen bakterielle Reproduktion als partielle Komponente, weitere verlangte Viren-/Eukaryoten-/Kulturkurven-/Stoffwechselleistungen bleiben getrennt. TH bietet an der geprüften Stelle keinen Vermehrungsoperator und erscheint daher nicht in der neuen Zielgeltung. Optionales 1→2→4 ist kein erforderlicher Populationsnachweis. Kein tatsächliches Versuchsergebnis, keine menschliche Prüfung oder Release-Freigabe.',
        'recommendation': 'create',
    },
}


def digest_bytes(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def write_json(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


results = OWN / 'results'
results.mkdir(exist_ok=True)
records = []
for goal in inputs:
    science = SCIENCE[goal['goalId']]
    record = {key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']}
    record.update({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': 'bio-bacterial-root-b-v1-' + goal['goalId'],
        'runId': RUN, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        'decision': 'keep',
        'understandingEvidence': {key: science[key] for key in ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']},
        'rationale': science['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': science['recommendation'],
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
    records.append(record)
path = results / (batch['batchId'] + '.records.jsonl')
assert not path.exists()
path.write_text('\n'.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) for row in records) + '\n')
parameters = {'workflow': 'manual independent root scientific reading of current full pages, actual primary sources and actual pixels', 'temperature': 'not exposed', 'sampling': 'not exposed', 'otherReviewArtifactsConsultedBeforeOwnVerdict': False, 'authorRole': False, 'humanApproval': False}
write_json(OWN / 'actual-review-parameters.json', parameters)
parameters_digest = digest_bytes((OWN / 'actual-review-parameters.json').read_bytes())
roles = ['book_model', 'book_pdf', 'book_pdf_render_manifest', 'book_html', 'book_html_render_manifest', 'review_input_json', 'review_input_jsonl', 'review_prompt', 'review_criteria']
artifact_inputs = [{'role': item['role'], 'digest': item['digest']} for item in manifest['artifacts'] if item['role'] in roles]
artifact_inputs.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
started = datetime.datetime.fromtimestamp((OWN / 'candidate-freeze-and-pdf-preparation.actual.json').stat().st_mtime, datetime.timezone.utc).isoformat()
completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
write_json(results / (batch['batchId'] + '.run.json'), {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': RUN, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI Codex', 'model': 'Inherited Codex session; exact runtime model identifier not exposed',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': parameters_digest, 'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True, 'goalIds': [goal['goalId'] for goal in inputs], 'inputArtifacts': artifact_inputs,
    'startedAt': started, 'completedAt': completed, 'status': 'completed',
    'outputDigest': digest_bytes(path.read_bytes()), 'toolchainVersion': 'goal-description-review-v2',
})
write_json(OWN / 'independent-scientific-decisions.json', {
    'status': 'own_current_scientific_read_complete_native_validation_pending',
    'reviewer': '/root', 'authorOfCurrentTextOrInnerP': False,
    'otherDReviewArtifactsReadBeforeFreeze': False,
    'summaryNotificationFromOtherReviewerUsedForJudgment': False,
    'actualPDFPagesRead': [1, 2, 3, 4, 5], 'actualLoadedHTMLGoalIdsRead': [goal['goalId'] for goal in inputs],
    'actualFullPrimaryPDFPagesRead': json.loads((OWN / 'independent-original-source-rendering.actual.json').read_text())['rows'],
    'BYOriginalSourceReadViaWeb': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/biologie',
    'BYContentBoundaries': 'Bacterial cell plan and fission are partial components; exponential population growth, survival stages and biotechnology use remain separate.',
    'THReproductionSourceClaimed': False, 'wholeUmbrellaSourceCompetencesClosed': False,
    'rows': [{'goalId': goal['goalId'], 'decision': 'KEEP', 'rationale': SCIENCE[goal['goalId']]['rationale'], 'newScientificReview': goal['goalId'] != inputs[0]['goalId']} for goal in inputs],
    'openFindings': [], 'humanApproval': False, 'activeWrites': 0, 'newStrictClosures': 0,
})
print('Serialized 3 manually read current independent D-B candidate decisions; validation pending.')
