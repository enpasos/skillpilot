# SPDX-License-Identifier: Apache-2.0
"""Record actual A inspection and retain unchanged, genuinely reviewed science."""
import copy
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he7-ten-final-raster-native-author-root-20261008-v1'
PRIOR = OWN.parent / 'biologie-he7-foundations-cells-photosynthesis-ten-science-first-independent-a-20261008-v1'
IMAGE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he7-ten-image-author-root-20261008-v1'
NATIVE = AUTHOR / 'native-raster-candidate/ten'

def read(p): return json.loads(p.read_text())
def lines(p): return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream: stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+', '', s)

# Every selected full original, separate360/680 capture, and full native page was
# actually viewed in this review before these first judgments were recorded.
OBS = {
1: 'Ein Kind untersucht eine Blüte mit der Lupe; Pflanze, Schnecke, Fisch und Vogel stehen für Lebewesen und ökologische Umgebung. Das Anschauungsbild schränkt Biologie nicht auf Tiere ein und behauptet keine neu bewiesene Untersuchung. Lupe liegt plausibel zwischen Auge und Blüte. Hauptbeobachtung und Biologie-Label sind bei360/680 klar.',
2: 'V2 zeigt Zellaufbau, Entwicklung vom Keimling, Ernährung der Schnecke, Fortpflanzung über Samen sowie eine zur links stehenden Lichtquelle gerichtete Wachstumsreaktion. Der Keimling krümmt sich zum Licht, nicht von ihm weg. Getrennte Motive sind Beispiele und keine Forderung, jedes Individuum müsse alle Lebenskennzeichen ständig zeigen. Wachstum, Reizantwort und Nachwuchs bleiben auch360 ohne Kleinschrift unterscheidbar.',
3: 'Schulmikroskop mit Beleuchtung unter Präparat, getrennten Objektiven und Abstand zum Objektträger; rechts wird das Deckglas kontrolliert schräg über ein dünnes Häutchen im Tropfen abgesenkt. Zell-Inset ist ein vereinfachtes gefärbtes Anschauungsbild, keine von uns gemachte Mikroskopaufnahme oder automatische Kernbestimmung jeder Rundung. Hauptgerät, Montage und Zellverband sind360/680 klar. Das Bild und Modellprotokoll allein beweisen keine tatsächliche Bedienung.',
4: 'Als Grüne Blattzelle begrenztes räumliches Modell zeigt äußere dicke Wand, getrennte innere Membranbegrenzung, Cytoplasmasaum, große Zentralvakuole, Kern, Chloroplasten mit Stapelmotiv und Mitochondrien. Es behauptet nicht, jede Pflanzenzelle sei grün oder diese Strukturen seien alle im Lichtmikroskop sichtbar. Wand, innere Begrenzung und Organellmotive sind360 unterscheidbar; die Membran bleibt eine schematische Linie, keine aufgelöste Doppelschicht. Keine falschen Zuordnungspfeile oder nötige winzige Labels.',
5: 'Bekannte grüne Blattzelle und exemplarische Tierzelle teilen Kern, Membran, Cytoplasma und Mitochondrien; nur das Blattmodell zeigt Wand, Chloroplasten und große Zentralvakuole. Die Tierzelle besitzt klar einen Rand als Membran, keine fehlende Außenbegrenzung. Die Titel Blattzelle/Tierzelle grenzen den Vergleich ein; Formen sind Anschauung und keine universelle Zellbestimmung. Große Unterschiede und gemeinsame Kerne/Mitochondrien sind360/680 erkennbar.',
6: 'Teilweise lichtdicht rechts abgedecktes Blatt führt im vereinfachten Nachweisbild zu blau-schwarzer linker beleuchteter Hälfte und gelblich ungefärbter rechter abgedunkelter Hälfte. Die Ergebniszuordnung ist korrekt; der breite Pfeil steht für den Ablauf mit Stärketest, nicht natürliche direkte Blattverfärbung durch Sonnenlicht. Anfangs-, transparente Abdeckungs- und Testkontrollen stehen in den ganzen Fällen. Beide Bereiche sind360/680 klar; kein unmittelbarer Bruttoratenbeweis.',
7: 'Zwei gleich beleuchtete, gut gewässerte Pflanzen unter Glocken; nur rechts ist CO2-Absorption durch eine gesonderte Schale symbolisiert. Wasser bleibt beidseits vorhanden und wird nicht gleichzeitig als zweiter veränderter Faktor gezeichnet. Das Bild illustriert den CO2-Teilvergleich, nicht die gesamte zweite Wasserreihe oder unmittelbare chemische Wasserumsetzung. Ganze Profile enthalten beide getrennten Versuche mit Wasserversorgungs-/Spaltöffnungsgrenze. CO2-Symbole, gleiche Wassertropfen und Absorberrelation sind360/680 erkennbar.',
8: 'V2 trennt Iod-Stärkenachweis am entfärbten Blatt von beleuchteter Wasserpflanze mit umgekehrtem Gas-Sammelgefäß und anschließender positiver Glimmspanprobe im separaten Röhrchen. Das wieder entflammte Spanende stellt den positiven Testausgang dar, keine Anleitung, bereits brennenden Span als Glimmspan-Ausgangsprobe zu verwenden. Die Herkunftsbläschen allein werden nicht als Gasidentitätsbeweis ausgegeben; Testbefund ergänzt sie. Stärke und Gasprüfung bleiben360/680 klar. Kein Reinheits-, Glucose- oder Bruttoratenbeweis; betreute echte Durchführung bleibt separat.',
9: 'Große richtig geschriebene Worttafeln ordnen Kohlenstoffdioxid+Wasser den schulisch zusammengefassten Produkten Traubenzucker+Sauerstoff zu; Licht steht gesondert am Reaktionspfeil als Energiebedingung und nicht als zusätzlicher Stoff vor dem Pluszeichen. Die Pflanze verdeutlicht den Kontext. Das ist eine Gesamtwortgleichung, keine Behauptung des ersten isolierten biochemischen Produkts. Alle Wörter sind360/680 lesbar; keine verkehrt ausgerichtete handelnde Schreibperson.',
10: 'Links gehen CO2 und Wasser in die Pflanze, organische Stoffe tragen zu Wachstum und Ernährung bei, Sauerstoff wird abgegeben. Rechts nehmen Pflanze UND Tier organische Stoffe und O2 auf und geben CO2/Wasser ab; Energie ist ein orangefarbenes Symbol, keine Stoffart. Sonne und Mond im Atmungsfeld zeigen Licht und Dunkel, nicht ausschließlich Nachtatmung. Die Gasblasen/Symbole sind Stoffflussikonik und kein atomar ausgezähltes Molekülmodell. Großmotive, Stoffrichtungen und Tages-/Nachtbezug sind360/680 klar.',
}

entry = read(AUTHOR / 'neutral-ten-current-raster-native-independent-review.entry.json')
author_seal = AUTHOR / 'ten-current-raster-native-author-input.first.freeze.json'
assert sha(author_seal) == 'd49f60eaeefc970611d3fb2203fe8f6ac185107f954caaa1fe8a1b33fdcdcfd6'
author_files = read(author_seal)['frozenFiles']
assert len(author_files) == 198
for b in author_files:
    actual = bind(ROOT / b['path'])
    assert all(actual[k] == b[k] for k in ['path', 'sha256', 'bytes'])
prior_seal = PRIOR / 'first-ten-whole-science-source-performance.independent-a.exact.freeze.json'
assert sha(prior_seal) == '813715b4a8e55832a66e77251d38a0fac4b952238d8c69b302ccf043029d6a55'
prior_value = read(prior_seal)
for b in prior_value['ownFiles'] + prior_value['requiredPortableAuthorFiles']:
    actual = bind(ROOT / b['path'])
    assert all(actual[k] == b[k] for k in ['path', 'sha256', 'bytes'])
science_by = {r['goalId']: r for r in read(PRIOR / 'first-ten-whole-science-source-performance.independent-a.verdict.json')['records']}
whole = {g['id']: g for g in read(ROOT / entry['wholeSelectedGoals'])['goals']}
before = {g['id']: g for g in read(AUTHOR / 'candidate/canonical.before-ten-links.exact.json')['goals']}
future = {g['id']: g for g in read(ROOT / entry['wholeFinalLandscape'])['goals']}
profiles = {r['goalId']: r for r in lines(ROOT / entry['closedNativeP10'])}
materials = {r['goalId']: r for r in read(ROOT / entry['twentyCompleteBilingualCases'])['goals']}
images = read(ROOT / entry['fullActualPNGsAndToolProvenance'])['images']
model = read(NATIVE / 'book-model.json')
pages = {p['goalId']: p for p in model['pages']}
physical = {p['goalId']: p['physicalPage'] for p in entry['physicalGoalPages']}
text_pages = (OWN / 'actual-native-ten.whole-text.independent-a.txt').read_text().split('\f')
assert len([p for p in text_pages if p.strip()]) == 12
assert len(whole) == len(profiles) == len(images) == len(physical) == 10
assert sum(len(r['cases']) for r in materials.values()) == 20
records = []
for im in images:
    gid = im['goalId']; ordinal = im['ordinal']; g = whole[gid]; p = pages[gid]; old = science_by[gid]
    assert g == before[gid] == old['wholeGoalBody']
    allowed = copy.deepcopy(g); allowed['resourceLinks'] = future[gid]['resourceLinks']; assert allowed == future[gid]
    assert profiles[gid]['profile'] == old['wholePositiveProfileRecord']['profile']
    assert materials[gid]['cases'] == [r['wholeCase'] for r in old['wholeDEENCases']]
    assert old['blockingScientificFindings'] == []
    assert profiles[gid]['status'] == 'needs_human_review' and profiles[gid]['reviewAuthority'] == 'ai_candidate'
    assert profiles[gid]['evidenceLevel'] == 'E1' and profiles[gid]['maximumClaimScope'] == 'G1'
    assert p['title'] == g['title'] and p['description'] == g['description']
    assert p['visualization']['originalDigest'] == 'sha256:' + im['sha256']
    assert p['visualization']['altText'] == im['altDe']
    assert sha(ROOT / im['path']) == im['sha256']
    assert set(r['goalId'] for r in p['requires'] + p['externalPrerequisites']) == set(g['requires'])
    pt = text_pages[physical[gid]-1]
    assert norm(g['title']) in norm(pt) and norm(g['description']) in norm(pt)
    assert re.search(r'Lernziel-ID\s+' + re.escape(gid), pt)
    assert len(re.findall(r'Lernziel-ID\s+[a-f0-9-]{36}', pt)) == 1
    capture = read(IMAGE / 'inspection-captures' / gid / 'chromium-captures.actual.json')
    assert capture['sourcePath'] == im['path'] and capture['sourceSha256'] == im['sha256']
    assert [r['width'] for r in capture['captures']] == [360,680]
    assert all(r['measured']['renderedWidth'] == r['width'] and r['measured']['objectFit'] == 'contain' for r in capture['captures'])
    records.append({'ordinal': ordinal, 'goalId': gid, 'decision': 'KEEP', 'fachlich': 'PASS', 'visual': 'PASS',
        'actualFullRaster': bind(ROOT / im['path']), 'actualBothWidths': [bind(ROOT / r['path']) for r in capture['captures']],
        'actualNativePage': {'physicalPage': physical[gid], **bind(NATIVE / 'actual-physical-pages' / f'actual-physical-page-{physical[gid]:02d}.png')},
        'substantiveActualObservationsDe': OBS[ordinal], 'actualNativePageObservation': 'Whole native page actually viewed: complete title/description/ID, raster, prerequisites, successors and applicability fit; no overlap, clipping or misassigned image. Original mappings do not newly prove national operator closure.',
        'formatDecision': 'KEEP friendly comic wide1672x941 PNG, actual360/680 large-motif and label readability; no generator-based replacement.',
        'wholeScientificDecision': old['scienceDescriptionAndBilingualVerdict'], 'wholeScientificReasonRetained': old['scienceDescriptionAndBilingualReason'],
        'wholePScienceDecision': old['wholePositiveProfileVerdict'], 'wholePScienceReasonRetained': old['wholePositiveProfileReason'],
        'provenance': {'provider': im['provider'], 'servingModel': im['servingModel'], 'prompt': bind(ROOT / im['promptPath']), 'actualGenerationReceipt': bind(ROOT / im['toolProvenancePath'])},
        'imageAndAltCorrespond': True, 'humanApproval': False, 'realDeviceAcceptance': False})

write(OWN / 'actual-ten-full-PNG-widths-native-pages-V.independent-a.first.verdict.json', {
    'schemaVersion': 1, 'recordedAt': datetime.now(timezone.utc).isoformat(), 'role': 'Actual independent A first final ten-raster/native verdict',
    'records': records, 'VKEEP': 10, 'VHold': 0, 'blockingFindings': [],
    'actualReadCounts': {'fullOriginalPNGs': 10, 'width360': 10, 'width680': 10, 'completeNativePDFPages': 10},
    'widthScope': 'Actual Chromium image element captures; no actual handset or full-app/device acceptance claim.',
    'generationIsNotApproval': True, 'peerFinalBReadBeforeSeal': False, 'humanApproval': False, 'humanTrial': False,
    'activeWrites': 0, 'strictGainClaimed': 0})
source_provenance = read(IMAGE / 'whole-official-source-pages/actual-complete-page-extraction.provenance.json')
for b in source_provenance['files']:
    assert sha(ROOT / b['path']) == b['sha256']
write(OWN / 'actual-whole-ten-science-P-source-context-retention.independent-a.receipt.json', {
    'schemaVersion': 1, 'recordedAt': datetime.now(timezone.utc).isoformat(), 'authorFreeze': bind(author_seal), 'authorFilesVerified': 198,
    'retainedOwnScienceFirstSeal': bind(prior_seal), 'unchangedWholeGoalBodiesExact': 10, 'unchangedWholeProfileBodiesExact': 10, 'unchangedFullDEENCasesExact': 20,
    'scope': 'Existing genuinely reviewed whole HE-linked scientific goals/cases/P retained; actual final PNG, width, page and current bindings independently inspected now. No hash-only substantive review or historical restart.',
    'wholeOriginalPrimaryReread': {'url': source_provenance['sourceUrl'], 'pdfSha256': source_provenance['sourcePdfSha256'], 'physicalPages': [3,6,8,19,20], 'printedPages': [2,5,7,18,19], 'wholePortableExtracts': source_provenance['files']},
    'sourceScope': 'Whole mandatory left-column HE5.1/7.1/7.2 duties distinguished from right-column recommendations, optionalphototaxis/fermentation/additionalcelltypes, and adjacent other targets. Authored source-goal condensations are not verbatim original operators. Unchanged regional partner applicability retained without fresh universal national operator closure.',
    'inferenceBoundaries': ['Water availability dependence is physiological, not direct chemical water-substrate proof from drought or stomatalclosure.', 'Bubble counting does not identify gas; positive controlled splint/oxygen-specific test supports oxygen enrichment or netchange, not pureoxygen/grossrate.', 'Iodine starch test does not identify all sugars/freeglucose; summarywordequation is not all immediatebiochemicalproducts.', 'Plants respire inlightanddark, suppliedequalrates are modelconditions; darkreservegrowth is not darkphotosynthesis.'],
    'practicalPerformanceBoundary': 'Microscope operation, specimen preparation and experiments require genuine appropriate actions and traceable records when asserting practical learner competence. These public E1/G1 models contain no performed experiment or actual learner result.',
    'positiveStatus': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'retainedAMBoundary': bind(AUTHOR / 'retained-ten-AM.actual-boundary.json'),
    'AMState': 'Existing valid actual A/M decisions, shared17cards/eightviews retained; no new historical cardscience claim. Author-native retained checks separate from final D/P/V judgment.',
    'minimumIndependentDemonstrations': 'Independent aspects/transfer, potentially within one genuine task; supplied two public cases are alternatives, not extra-task quota after sufficient evidence.',
    'peerFinalBReadBeforeSeal': False, 'realLearnerEvidence': False, 'actualExperiments': 0, 'humanApproval': False, 'humanTrial': False,
    'activeWrites': 0, 'strictGainClaimed': 0})

campaign = read(NATIVE / 'round-a/description-review-campaign.json')
native_input = read(NATIVE / 'round-a/description-review-input.json')
bundle = read(NATIVE / 'round-a/review-bundle-manifest.json')
assert campaign['goalCount'] == campaign['batchSize'] == 10 and len(campaign['batches']) == 1
batch = campaign['batches'][0]
run_id = OWN.name
results = OWN / 'round-a/results'; results.mkdir(parents=True, exist_ok=True)
review_records = []
by_visual = {r['goalId']: r for r in records}
for g in native_input['goals']:
    gid = g['goalId']; expectations = profiles[gid]['profile']['expectations']; evidence = {}
    for suffix in ['De', 'En']:
        evidence['essentialUnderstanding' + suffix] = ' '.join(r['essentialUnderstanding' + suffix] for r in expectations)
        evidence['observablePerformance' + suffix] = expectations[0]['observablePerformance' + suffix]
        evidence['transferExpectation' + suffix] = expectations[-1]['observablePerformance' + suffix]
    review_records.append({'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1,
        'recordId': run_id + '.' + gid, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': native_input['bundleFingerprint'], 'bookDigest': native_input['bookDigest'],
        **{k:g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': evidence,
        'rationale': 'Eigene zuvor versiegelte ganze HE7-Wissenschaftsprüfung erhalten; alle10 ganzen DE/EN-Ziele,20 vollständigen Fälle und Profile exact unverändert. Ganze OriginalHE5.1/7.1/7.2-Primärstellen erneut in ihrem Pflicht-/Empfehlungs-/Methodenkontext gelesen. Tatsächlicher aktueller Vollraster, beide360/680-Captures und ganze native Seite fachlich und visuell angesehen. ' + by_visual[gid]['substantiveActualObservationsDe'] + ' Öffentliche positive-understanding-evidence-v2-E1/G1-Modelle sind needs_human_review, keine behauptete praktische Lernendenleistung, nationale Operatorfreigabe oder Menschenfreigabe.',
        'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
record_path = results / (batch['batchId'] + '.records.jsonl')
with record_path.open('x') as stream:
    for r in review_records: stream.write(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n')
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1,
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': native_input['bundleFingerprint'], 'bookDigest': native_input['bookDigest'],
    'provider': 'OpenAI', 'model': 'Codex actual independent A; serving revision not exposed', 'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(b'Actual independent A final ten whole raster-page review; previous unchanged whole science retained; sampling unavailable').hexdigest(),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
    'startedAt': read(OWN / 'actual-neutral-whole-input-review-start.independent-a.json')['reviewStartedAt'], 'completedAt': datetime.now(timezone.utc).isoformat(),
    'outputDigest': 'sha256:' + sha(record_path), 'status': 'completed', 'toolchainVersion': 'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
write(results / (batch['batchId'] + '.run.json'), run)
write(OWN / 'first-current-ten-D-P-V.independent-a.exact.freeze.json', {
    'schemaVersion': 1, 'recordedAt': datetime.now(timezone.utc).isoformat(), 'role': 'Genuine independent A first final whole-ten raster/native judgment before peer-final B',
    'authorInput': bind(author_seal), 'ownFiles': [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],
    'D10KEEP': 10, 'P10ScopedSciencePASS': 10, 'V10ActualKEEP': 10, 'blockingFindings': [],
    'peerFinalBReadBeforeSeal': False, 'nativeTechnicalValidation': 'Pending actual separate unchanged native APIs after this first seal.',
    'actualExperiments': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0, 'strictGainClaimed': 0})
print(json.dumps({'firstSeal': bind(OWN / 'first-current-ten-D-P-V.independent-a.exact.freeze.json'), 'DKEEP': 10, 'PScience': 10, 'VKEEP': 10, 'blockingFindings': 0, 'peerFinalBFilesRead': 0}, ensure_ascii=False))
