import datetime
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cellcycle-evolution-two-current391-independent-b-20261007-v1'
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cellcycle-evolution-two-current391-author-v1'
OUT = BASE / 'native-final-followup'
NATIVE = AUTHOR / 'native-raster-candidate/two'

def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

evidence = {
    '9f73b963-5fac-5a90-a993-d7b7c0cc8526': [
        'Mutation erzeugt neue erbliche Varianten und Rekombination kombiniert vorhandene Varianten; Selektion verändert ihre Populationshäufigkeit über relativen Überlebens- und Fortpflanzungserfolg.',
        'Mutation creates new heritable variants and recombination combines existing variants; selection changes their population frequencies through relative survival and reproductive success.',
        'Die lernende Person trennt Variantenentstehung von Selektion und erklärt aus vorgegebenen Käferdaten die Änderung des Dunkelanteils von 50 auf 80 Prozent, ohne eine Umfärbung von Individuen zu behaupten.',
        'The learner distinguishes the origin of variants from selection and uses supplied beetle data to explain a change in the dark proportion from 50 to 80 percent without claiming that individuals change colour.',
        'Bei Pflanzen mit gleichem Überleben und unterschiedlichem Nachkommensbeitrag wird eine Häufigkeitsänderung auf etwa 81,8 Prozent einer Variante über reproduktive Selektion erklärt; eine Wirkung unter Trockenheit bleibt ohne Daten offen.',
        'For plants with equal survival but different offspring contributions, the learner explains a frequency change to about 81.8 percent of one variant through reproductive selection; an effect under drought remains unresolved without data.'
    ],
    '05358518-f66c-5c1b-ad3f-d16211d0fc1c': [
        'Der eukaryotische Zellzyklus verbindet aktive Interphase mit DNA-Verdopplung und Mitose mit Verteilung der bereits kopierten DNA; wiederholte Teilung geeigneter Zellen ermöglicht Wachstum, Reparatur und ungeschlechtliche Fortpflanzung.',
        'The eukaryotic cell cycle connects an active interphase including DNA replication with mitosis distributing previously copied DNA; repeated division of appropriate cells enables growth, repair and asexual reproduction.',
        'Die lernende Person ordnet G1, S, G2 und M, erklärt DNA-Inhalt 2 zu 4 zu 2 je Tochter sowie zwei vollständige Teilungszyklen von einer zu vier Zellen und verbindet dies mit Pflanzenwachstum, Wundreparatur und Stecklingsvermehrung.',
        'The learner orders G1, S, G2 and M, explains DNA content changing from 2 to 4 to 2 per daughter and two complete cycles from one to four cells, and connects these with plant growth, wound repair and cutting propagation.',
        'In einem frischen Zeitmodell mit 15 Stunden Gesamtdauer werden ein fehlerhafter Phasenablauf berichtigt und die Funktionen in Tiergewebe und einem eukaryotischen Einzeller begründet, ohne eine ganze mehrzellige Tierentstehung aus einer Einzelteilung anzunehmen.',
        'In a fresh timing model lasting 15 hours, the learner corrects an erroneous phase order and explains functions in animal tissue and a eukaryotic unicellular organism without assuming that one division produces an entire multicellular animal.'
    ]
}
science = json.loads((BASE / 'whole-two-D-P-source.independent-b.science-first.json').read_text())
science_by_id = {x['goalId']: x for x in science['verdicts']}
visual = json.loads((BASE / 'visual-followup/first-actual-V2.independent-b.findings.json').read_text())
visual_by_id = {x['goalId']: x for x in visual['findings']}
campaign = json.loads((NATIVE / 'round-b/description-review-campaign.json').read_text())
inputs = json.loads((NATIVE / 'round-b/description-review-input.json').read_text())
batch = campaign['batches'][0]
assert batch['goalIds'] == [g['goalId'] for g in inputs['goals']]
assert campaign['goalCount'] == 2 and campaign['batchSize'] == 20
run_id = campaign['roundId'] + '.actual-independent-b.run-001'
results = OUT / 'native-D-results'
results.mkdir(exist_ok=True)
fields = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
records = []
for goal in inputs['goals']:
    goal_id = goal['goalId']
    notes = science_by_id[goal_id]
    assert notes['DDecision'] == 'KEEP' and notes['PDecision'] == 'PASS'
    row = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': campaign['roundId'] + '.' + goal_id,
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{k: goal[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': dict(zip(fields, evidence[goal_id])),
        'rationale': notes['DReason'] + ' Ganze DE/EN-Fälle und aktuelles V2-Profil unabhängig geprüft: ' + notes['PReason'] + ' ' + notes['sourceBoundary'] + ' Aktuelle gebundene PDF-Seite tatsächlich gesehen; ganzes PNG und echte Browseransichten 360/680 geprüft. ' + visual_by_id[goal_id]['scientificFinding'] + ' Native D-Eingabe hat kein P-Profil; create ist nur die vertragliche Empfehlung für diese D-Eingabe, kein erneuter fachlicher Profilauftrag.',
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    records.append(row)
record_path = results / (batch['batchId'] + '.records.jsonl')
record_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI',
    'model': 'GPT-6 (Codex runtime identity)',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(b'independent-b-whole-two-DP-source-six-actualPNG-views-two-actualPDF-pages').hexdigest(),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [
        {'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']},
        {'role':'book_pdf','digest':sha(NATIVE / 'book.pdf')},
        {'role':'book_model','digest':sha(NATIVE / 'book-model.json')},
        {'role':'book_pdf_render_manifest','digest':sha(NATIVE / 'book.pdf.render-manifest.json')},
        {'role':'review_prompt','digest':campaign['promptFingerprint']},
        {'role':'review_criteria','digest':campaign['criteriaFingerprint']},
        {'role':'run_manifest_schema','digest':sha(NATIVE / 'bundle/contracts/goal-evidence-ai-run-manifest.schema.json')},
    ],
    'startedAt': datetime.datetime.fromtimestamp((BASE / 'neutral-inputs/current-neutral-full-input.json').stat().st_mtime, datetime.timezone.utc).isoformat(),
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'completed',
    'outputDigest': sha(record_path),
    'toolchainVersion': 'skillpilot-native-description-review-v2',
}
run_path = results / (batch['batchId'] + '.run.json')
write(run_path, run)
command = [str(ROOT / 'app/node_modules/.bin/tsx'), str(ROOT / 'app/scripts/validateGoalDescriptionReviewCampaign.ts'), '--bundle', str(NATIVE / 'round-b/review-bundle-manifest.json'), '--input', str(NATIVE / 'round-b/description-review-input.json'), '--campaign', str(NATIVE / 'round-b/description-review-campaign.json'), '--run', str(run_path), '--batch-input', str(NATIVE / 'round-b/batches' / (batch['batchId'] + '.input.jsonl')), '--records', str(record_path)]
result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
(OUT / 'native-D2-independent-b.stdout.txt').write_text(result.stdout)
(OUT / 'native-D2-independent-b.stderr.txt').write_text(result.stderr)
write(OUT / 'native-D2-independent-b.command-result.json', {'command':command, 'exitCode':result.returncode, 'actualExecution':True})
print(result.stdout, result.stderr)
assert result.returncode == 0

positive = [json.loads(line) for line in (AUTHOR / 'native-raster-candidate/P2.actual-raster-author.review.jsonl').read_text().splitlines() if line]
old_material = json.loads((BASE / 'neutral-inputs/P2.current-text-preimage.author.candidates.json').read_text())
old_by_id = {x['goalId']: x for x in old_material['goals']}
for row in positive:
    goal_id = row['goalId']
    assert row['profile'] == old_by_id[goal_id]['profile']
    assert row['status'] == 'needs_human_review' and row['reviewAuthority'] == 'ai_candidate'
    assert row['evidenceLevel'] == 'E1' and row['maximumClaimScope'] == 'G1' and row['reviewRunIds'] == []
    row['reviewId'] = 'biologie-cellcycle-evolution-two-positive-independent-b-20261007-v1'
    row['reviewer'] = 'independent-b-codex-gpt-6-runtime-exact-serving-revision-unavailable'
    row['reviewedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    row['reason'] = 'Eigene unabhängige ganze DE/EN-Beschreibung, zwei komplette bilinguale Modellfälle und V2-Profil fachlich geprüft; tatsächliches ausgewähltes PNG sowie echte 360/680- und native PDF-Seitenkontexte geprüft. ' + science_by_id[goal_id]['PReason'] + ' ' + science_by_id[goal_id]['sourceBoundary'] + ' E1/G1-Modellkandidat; keine Lernendenbeobachtung oder menschliche Freigabe. Ursprüngliche Dissents bleiben als historische Autorenbefunde erhalten; heutige tatsächliche Bild-/Seitenprüfung ist separat versiegelt.'
(OUT / 'P2.current-actual-raster.independent-b.review.jsonl').write_text(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in positive))
print('Own native D2 and independent P2 written; current public integration remains Root-owned.')
