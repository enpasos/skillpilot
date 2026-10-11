#!/usr/bin/env python3
"""Own current D3 continuation output; no new peer, source, or human approval."""
import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[7]
BASE = pathlib.Path(__file__).resolve().parent
PREFIX = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
SOURCE = PREFIX / 'chemie-q3-potential-interval-transfer-boundary-P3-native-author-successor-20261011-v5'
PRIOR = PREFIX / 'chemie-q3-v5-genuine-independent-visual-page-transfer-a-v1'
ROUND = SOURCE / 'native/current398-native3.complete-review-universe.author-batch/round-a'
EQUILIBRIUM = '81373fb7-2a4a-5b2c-acd0-b4e775acaa65'
VOLTAGE = '8be14f15-2258-58e6-ae4e-38953f5d0570'
BATTERY = 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09'

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def digest(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'bytes': len(b), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest()}

def dicts(x):
    if isinstance(x, dict):
        yield x
        for v in x.values():
            yield from dicts(v)
    elif isinstance(x, list):
        for v in x:
            yield from dicts(v)

def row_mentions(x, ids):
    vals = [v for v in x.values() if isinstance(v, str)]
    vals += [v for a in x.values() if isinstance(a, list) for v in a if isinstance(v, str)]
    return any(v in ids for v in vals)

first = read(BASE / 'FIRST.current-D3-continuation-inputs.actual.json')
campaign = read(ROUND / 'description-review-campaign.json')
input_doc = read(ROUND / 'description-review-input.json')
neutral = read(SOURCE / 'inputs/three-whole-current-goals-and-398-page-contexts.neutral.json')
land = read(SOURCE / 'inputs/current517.canonical-three-PNG.inactive.json')
goal_by_id = {g['id']: g for g in land['goals']}
cases = read(SOURCE / 'cases6.current398.whole-science-current-PNG-context.json')
source_paths = [
    ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_CHEMIE.de.json.snapshot',
    ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024_CURRENT2026.source-extraction.json',
    ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf',
    ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf',
    ROOT / 'curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json',
    ROOT / 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
    ROOT / 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_to_canonical_chemistry.json',
    ROOT / 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    ROOT / 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_to_canonical_chemistry.json',
    ROOT / 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json',
    ROOT / 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json',
]
he_archive = read(source_paths[0])
he = read(source_paths[1])
by_archive = read(source_paths[4])
by = read(source_paths[5])
all_ids = {EQUILIBRIUM, VOLTAGE, BATTERY, 'da327a7e-30e6-4296-88f8-7803d244478f', '68aa5804-2e4c-4730-a29c-d7ff1f106d9b', '2e11d486-d607-5210-bae5-6ec33e409867'}
mapping_rows = [{'source': digest(p), 'wholeRows': [r for r in dicts(read(p)) if row_mentions(r, all_ids)]} for p in source_paths[6:10]]
adjacent_ids = {r['goalId'] for g in neutral['goals'] for key in ['requires', 'reverseRequires', 'externalPrerequisites', 'externalReverseRequires'] for r in g['complete398ReviewUniversePage'][key]}
source_inspection = {
    'role': 'Actual targeted direct source and scope/operator inspection after the continuation FIRST; no source-union acceptance',
    'files': [digest(p) for p in source_paths],
    'heCurrentSourceDocument': he['sourceDocument'],
    'heWholeRelevantPassages': [p for p in he['passages'] if p['topicCode'] in ['Q3.1', 'Q3.3']],
    'heRelevantWholeSourceGoals': [g for g in he['sourceGoals'] if g['id'] in ['he-chem-sekii-q3-1-b01-a01-80aa83cd', 'he-chem-sekii-q3-1-b02-a01-bcd9e31f', 'he-chem-sekii-q3-3-b02-a01-f4d24c56', 'he-chem-sekii-q3-3-b03-a01-27ea846d']],
    'wholeArchivedHeSourceGoals': [g for g in he_archive['goals'] if g['id'] in all_ids],
    'wholeArchivedByBatterySourceGoal': [g for g in by_archive['goals'] if g['id'] in all_ids],
    'byWholeRelevantSourceGoals': [g for g in by['sourceGoals'] if g['id'] in ['6889f4be-3848-531b-a136-28dd6c13bcb3', '976731fd-8e51-5268-8d96-639852b592df', 'e5448ab7-57f5-5533-b570-40dcdc66ae71', '2e11d486-d607-5210-bae5-6ec33e409867']],
    'wholeDirectMappingsAndHistoricalSourceRows': mapping_rows,
    'wholeCurrentThreeContexts': neutral['goals'],
    'wholeActualAdjacentCanonicalGoals': [goal_by_id[gid] for gid in sorted(adjacent_ids)],
    'sourceApproval': False,
    'newBQ3ResultsOpened': False,
}
write(BASE / 'inspection/current-D3-whole-targeted-context-and-source-bindings.actual.json', source_inspection)

# Read the actual current official primary PDF, retain a compact exact textual
# span with the whole two relevant topic sections. The older PDF was compared,
# not substituted for the current 21.04.2026 primary document.
p = subprocess.run(['pdftotext', '-layout', str(source_paths[2]), '-'], text=True, capture_output=True, check=True)
sections = []
for start, end in [('Q3.1   Chemische Gleichgewichte', 'Q3.2'), ('Q3.3   Redoxgleichgewichte', 'Q3.4')]:
    pos = p.stdout.index(start)
    next_pos = p.stdout.find(end, pos + len(start))
    sections.append(p.stdout[pos:next_pos if next_pos >= 0 else pos + 4500].rstrip())
(BASE / 'inspection/current-HE-primary-Q3.1-Q3.3.actual.txt').write_text('\n\n'.join(sections) + '\n')
blocked_goal = next(g for g in neutral['goals'] if g['goalId'] == EQUILIBRIUM)
block_context = {
    'goalId': EQUILIBRIUM,
    'decision': 'block',
    'smallestAffectedWholeContext': blocked_goal,
    'wholeCurrentPositiveEvidenceProfile': next(g for g in input_doc['goals'] if g['goalId'] == EQUILIBRIUM)['reviewContext']['evidenceProfile'],
    'twoWholePreviouslyActuallyReviewedCases': [c for c in cases['cases'] if c['goalId'] == EQUILIBRIUM],
    'actualCurrentProvenance': goal_by_id[EQUILIBRIUM]['extendedData']['provenance'],
    'wholeArchivedHeSourceGoal': next(g for g in he_archive['goals'] if g['id'] == 'da327a7e-30e6-4296-88f8-7803d244478f'),
    'actualExactLegacyMapping': next(r for r in mapping_rows[0]['wholeRows'] if r.get('legacyGoalId') == 'da327a7e-30e6-4296-88f8-7803d244478f'),
    'currentHeOfficialDocument': he['sourceDocument'],
    'currentHePrimaryPrintedPage': 46,
    'actualHeQ3.1B01WholeSourceClause': next(g for g in he['sourceGoals'] if g['id'] == 'he-chem-sekii-q3-1-b01-a01-80aa83cd'),
    'actualExactHeQ3.1B01MappingAndHistoricalDecision': [r for r in mapping_rows[1]['wholeRows'] if r.get('legacyGoalId') == 'he-chem-sekii-q3-1-b01-a01-80aa83cd' or r.get('sourceGoalId') == 'he-chem-sekii-q3-1-b01-a01-80aa83cd'],
    'wholeBwPracticalSuccessorContext': goal_by_id['a0f6ba09-f072-5887-a797-fa369453c62a'],
    'preciseFinding': 'The current short DE/EN competence is model-based and valid for the BY model clause. The unchanged exact HE legacy mapping and provenance still bind an archived goal demanding experimental demonstration of simultaneous reactants and products. Current official HE Q3.1#B01A01 says Nachweis and is mapped exact only to this atom. Neither two paper/model cases nor the DE-BW reversible water-exchange model records the required chemical demonstration or resolves that exact operator binding. Do not weaken experimentell zeigen or mark it covered automatically. This specific operator/scope finding remains BLOCK; no primary-source wording is invented beyond the actual Nachweis clause.',
    'minimalRemediationBoundary': 'Reconcile exactly the 81373 whole competence, its HE legacy/current source contributions, and the actual chemical Nachweis operator with independently reviewed source/goal/page/evidence binding. Preserve the good model component and every old source HOLD. A source-partner/goal arrangement requires an authored successor and genuine current review; this record does not choose or execute that change.',
    'earlierOwnVisualAndPositiveScienceVerdictsUnchanged': True,
    'strictGain': 0,
}
write(BASE / 'inspection/81373-HE-operator-block.smallest-whole-context.actual.json', block_context)

dest = BASE / 'round-a'
dest.mkdir()
for name in ['description-review-campaign.json', 'description-review-input.json', 'review-bundle-manifest.json', 'prompt.md', 'criteria.md']:
    shutil.copyfile(ROUND / name, dest / name)
shutil.copytree(ROUND / 'batches', dest / 'batches')
shutil.copytree(ROUND / 'contracts', dest / 'contracts')
run_id = 'chemie-q3-v5-current-native3-description-a-continuation-run-20261011'
statements = {
    EQUILIBRIUM: {
        'decision': 'block',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Im chemischen Gleichgewicht bleiben makroskopische Größen unter gleichbleibenden Bedingungen konstant, während Hin- und Rückreaktion fortbestehen und gleich schnell verlaufen. Edukte und Produkte liegen gleichzeitig vor; gleiche Reaktionsgeschwindigkeiten bedeuten weder gleiche Stoffmengen noch Reaktionsstillstand.',
            'essentialUnderstandingEn': 'At chemical equilibrium, macroscopic quantities remain constant under unchanged conditions while forward and reverse reactions continue at equal rates. Reactants and products coexist; equal rates imply neither equal amounts nor stopped reactions.',
            'observablePerformanceDe': 'Die lernende Person verbindet die Stoffbeobachtung mit dem Teilchenmodell, begründet den stationären Zustand aus den beiden fortbestehenden Raten und unterscheidet Modellannahmen von einem tatsächlichen chemischen Nachweis. Ein Modellbild oder eine Zuordnung allein belegt keinen selbst ausgeführten experimentellen Nachweis.',
            'observablePerformanceEn': 'The learner connects macroscopic observation with a particle model, explains the stationary state from the two continuing rates, and distinguishes model assumptions from an actual chemical demonstration. A model picture or matching exercise alone does not establish a performed experimental demonstration.',
            'transferExpectationDe': 'Bei veränderten Anfangsverhältnissen oder einer neuen Darstellung prüft die lernende Person, ob beide Reaktionen weiterlaufen und die Stoffmengen stationär sind; sie begründet auch bei ungleichen Mengen die gleichen Raten. Ein experimenteller Nachweis muss gegebenenfalls gesondert an einer passenden Frage, Daten und Beobachtungen sowie einer begründeten Schlussfolgerung gezeigt werden.',
            'transferExpectationEn': 'With changed initial amounts or a new representation, the learner checks whether both reactions continue and quantities are stationary, explaining equal rates even for unequal amounts. Any required experimental demonstration must separately show a suitable question, data and observations, and a justified inference.',
        },
        'rationale': 'BLOCK des aktuellen ganzen D-Scopes, kein Bildfehler: DE/EN-Modelltext ist fachlich schlüssig und passt zu BY C12-GA.7.1 (6889f4be). Der konkrete ungelöste Operator liegt in der unveränderten Provenienz sourceGoalId da327a7e und der HE-Legacy-Zuordnung exact zu 81373: Der vollständige archivierte HE-Source-Goal verlangt ausdrücklich experimentell zeigen. Die aktuelle offizielle HE-Primärstelle KC Stand 21.04.2026, gedruckte S. 46, Q3.1#B01A01 verlangt Nachweis des gleichzeitigen Vorliegens; auch diese Klausel ist exact nur auf 81373 gebunden. Die beiden tatsächlich geprüften Papier-/Modellfälle und der Rückverweis a0f6ba09 (DE-BW, reversibles Wasser-Austauschmodell) dokumentieren keinen chemischen experimentellen Nachweis und lösen diese Bindung nicht. Eine automatische Abschwächung von experimentell zeigen ist unzulässig. Tatsächlicher Vorläufer 70b34ae7 liefert Esterbildungsbeobachtungen; MWG 20f92ba0 und das BW-Modell sind fachlich passende Nachfolger, ohne die offene HE-Pflicht zu ersetzen. Native3 externalPrerequisites/externalReverseRequires und whole398 direkte Bezüge stimmen mit der kanonischen Richtung überein. Orientierung a9c22adc ist ein separater Abschluss-/Motivationskontext. Der kleinste betroffene vollständige Kontext samt beiden Fällen, aktuellem ganzen Goal, nativen Seiten, ursprünglichem HE-Goal und Mapping steht in inspection/81373-HE-operator-block.smallest-whole-context.actual.json. Frühere eigene V/P-Urteile bleiben unverändert; aus ihnen folgt keine D-/Source-Freigabe. Dieser konkrete Scope-/Operatorbefund bleibt offen, unabhängig von breiteren Quellenunion-HOLDs.',
    },
    VOLTAGE: {
        'decision': 'keep',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Standardreduktionspotenziale haben einen gemeinsamen Referenzbezug. Für die gewählte galvanische Richtung ist die Standardzellspannung E°Kathode minus E°Anode; ihr Vorzeichen begründet die thermodynamisch begünstigte Redoxrichtung unter Standardbedingungen. Potenziale werden nicht mit stöchiometrischen Faktoren multipliziert.',
            'essentialUnderstandingEn': 'Standard reduction potentials share a reference. For the chosen galvanic direction, the standard cell voltage is E°cathode minus E°anode; its sign supports the thermodynamically favored redox direction under standard conditions. Potentials are not multiplied by stoichiometric coefficients.',
            'observablePerformanceDe': 'Die lernende Person ordnet Redoxpaare, Oxidation/Reduktion, Elektroden und Polung zu, bestimmt die Elektronenrichtung, berechnet die Potenzialdifferenz mit Einheit und begründet das Vorzeichen. Sie unterscheidet die berechnete Standard-Leerlaufspannung von einer Spannung unter Last und von veränderten Konzentrationsbedingungen.',
            'observablePerformanceEn': 'The learner identifies redox couples, oxidation/reduction, electrodes and polarity, determines electron flow, calculates the potential difference with units, and explains its sign. They distinguish calculated standard open-circuit voltage from voltage under load and from changed concentration conditions.',
            'transferExpectationDe': 'Bei anderen Redoxpaaren, umgekehrter Darstellung oder umgekehrter Reaktionsrichtung leitet die lernende Person dieselben Beziehungen erneut her; eine falsche Vertauschung oder Addition der Potenziale wird fachlich widerlegt. Eine veränderte Standardbedingung wird als Grenze dieser Berechnung benannt.',
            'transferExpectationEn': 'With different couples, a reversed representation or the opposite reaction direction, the learner derives the same relations again and refutes an incorrect exchange or addition of potentials. A change from standard conditions is identified as a limit of this calculation.',
        },
        'rationale': 'KEEP der eigenen kurzen Kompetenz: beide Sprachen enthalten Interpretation, begründete Richtungsprognose und Berechnung unter Standardbedingungen. Die ganze HE-Legacy-Klausel 68aa5804 sowie aktuelle HE Q3.3#B03A01 (gedruckte S. 47) stützen Potenziale/Potenzialdifferenzen unter Standardbedingungen; BY C12-GA.8.3 (976731fd) stützt Redoxprognose und Leerlauf-/Zellspannung mithilfe der Spannungsreihe. Die tatsächliche Voraussetzung 16da6a4d verlangt bereits qualitative Redoxreihen/Donator-Akzeptor-Zuordnung aus galvanischen Zellen, ergänzt um separaten Orientierungskontext a9c22adc. Whole398/native3 Rückbezüge passen zur Richtung: Nernst b7521ac7 behandelt Nichtstandardbedingungen als folgende eigene Kompetenz; Standard-Wasserstoff-Halbzelle b781745a erläutert Aufbau/Referenzfunktion gesondert; 7b39fa19 ist explizite experimentelle hochohmige Messleistung. Eine theoretische Standardspannung behauptet deren praktischen Vollzug nicht. BY C12-EA.8.4 ist eine echte 1:n-Klausel mit Nernst-Partner und bleibt als ganzer LK-Quellanspruch offen. Das bereits vollständig geprüfte Aufgaben-/Material-/Transferpaar verlangt Zuordnung, Vorzeichen-/Polungsbegründung und Widerlegung; allein 1,10 V ausrechnen reicht nicht. Der neue Bilderbefund ist hierfür kein Freigabegrund. Breitere Quellenunion-/SHE-Aufbau-/Kurs- oder experimentelle Source-Pflichten werden nicht geschlossen.',
    },
    BATTERY: {
        'decision': 'keep',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Eine Primärzelle überträgt die räumlich getrennten Oxidations- und Reduktionsprozesse der galvanischen Zelle auf eine technisch verpackte Energiequelle. Geeignete Batterietypen werden anhand des Einsatzes, der chemisch-technischen Eigenschaften, Kosten, Verfügbarkeit und Entsorgungsbedingungen begründet bewertet; Kriteriengewichtung und Unsicherheiten bleiben erkennbar.',
            'essentialUnderstandingEn': 'A primary cell applies the spatially separated oxidation and reduction processes of a galvanic cell to a packaged energy source. Battery types are evaluated for a use case using chemical and technical properties, costs, availability and disposal conditions, with explicit criterion weighting and uncertainties.',
            'observablePerformanceDe': 'Die lernende Person verbindet Zellbauteile, Elektrodenprozesse sowie Elektronen- und Ionentransport mit der Funktion und trifft eine begründete, anwendungsspezifische Batteriewahl. Fachliche Daten werden von gesellschaftlichen Kriterien und Wertungen getrennt; Nennspannung, Kapazität oder Energie allein legen das Urteil nicht fest.',
            'observablePerformanceEn': 'The learner links cell components, electrode processes and electron and ion transport to function and makes a justified battery choice for a specific use. Scientific data are distinguished from social criteria and value judgments; nominal voltage, capacity or energy alone does not determine the decision.',
            'transferExpectationDe': 'Bei geändertem Lagerungs-/Nutzungsverhalten, Luftversorgung, Aktivierungsbedarf oder einer veränderten Energieversorgung bewertet die lernende Person die Eignung neu und begründet, welche Kriterien das Urteil ändern. Eine Zahlenübung zur Kapazität/Energie ergänzt die Arbeit, ersetzt diesen begrifflichen Transfer aber nicht.',
            'transferExpectationEn': 'With changed storage or use, air access, activation needs or power supply, the learner reassesses suitability and explains which criteria change the decision. Numerical capacity or energy practice supplements the work but does not replace this conceptual transfer.',
        },
        'rationale': 'KEEP: DE/EN benennen denselben Transfer vom galvanischen Bau-/Funktionsprinzip auf Primärzellen und die fachliche sowie gesellschaftliche Beurteilung. Die gesamte BY-Primärklausel 2e11d486 C12-GA.8.4 und ihre C12-EA.8.5-Occurrence stützen genau diese eigene Kompetenz. Tatsächliche direkte Voraussetzungen f0939f88 (Galvanische Elemente deuten) und 96fd8608 (Elektrische Arbeit galvanischer Zellen ermitteln) liefern Funktions-/Energiebezug; der sichtbare ganze Scope verlangt keine erfundene schon ausgeführte Zellmessung. Whole398/native3 Rückverweis 16b24dc5 betrifft die spätere eigenständige Recherche/Quellenkritik bei Sekundärzellen; dieser Anspruch wird nicht vorgezogen oder als abgeschlossen behauptet. Die sechs bereits geprüften ganzen Aufgaben/Fälle enthalten für dieses Ziel q3-12-a mit begrifflichem Wechsel von Lagerung/Nutzung, Luftzugang und Aktivierung sowie versorgungsbezogenem Transfer; q3-12-b bleibt separate Zahlenpraxis. Die verbindliche Profilgrenze verhindert Mastery-Schluss nur aus Routinezahlen. Die breite Kompetenz ist ein zusammenhängendes kriteriengeleitetes Einsatzurteil und bleibt kurz; Fallbriefs gehören ins Profil. Gute Grafik, ein einzelner Quotient oder nominelle Spannung begründen keine Freigabe. Nationale Quellen-/Partner-/Scope-HOLDs und Quellenkritik-/Messpflichten außerhalb dieser Klausel bleiben offen.',
    },
}
records = []
for g in input_doc['goals']:
    s = statements[g['goalId']]
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': 'chemie-q3-v5-description-a-current-' + g['goalId'],
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        **s,
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'none',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    assert len(record['rationale']) <= 4000
    records.append(record)
batch = campaign['batches'][0]
results = dest / 'results'
results.mkdir()
record_path = results / (batch['batchId'] + '.records.jsonl')
record_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
parameters = {'execution': 'Codex interactive D3 continuation of own earlier genuine independent Q3 v5 full-page/case/visual inspection', 'knownSamplingParameters': 'not exposed to session', 'newPeerOrBQ3ResultsInspected': False, 'noNewBlindStartClaim': True, 'formalFirstDescriptionRecordsInExistingCurrentCampaign': True, 'sourceUnionClosure': False, 'humanApproval': False}
write(BASE / 'execution-context-and-parameters.actual.json', parameters)
bundle = read(ROUND / 'review-bundle-manifest.json')
roles = ['book_pdf', 'book_html', 'book_model', 'review_input_json', 'review_prompt', 'review_criteria', 'run_manifest_schema']
artifacts = [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in roles]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1,
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], 'provider': 'OpenAI / Codex', 'model': 'GPT-6-based Codex session; exact model build not exposed', 'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(BASE / 'execution-context-and-parameters.actual.json')['sha256'], 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': batch['goalIds'], 'inputArtifacts': artifacts, 'startedAt': first['frozenAtUTC'], 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'status': 'completed', 'outputDigest': digest(record_path)['sha256'], 'toolchainVersion': 'skillpilot-current-description-review-contract-v1',
}
write(results / (batch['batchId'] + '.run.json'), run)
write(BASE / 'VERDICT.current-D3-independent-a.actual.json', {'role': 'Own normal current D3 output from genuine A continuation; no new blind-start assertion', 'runId': run_id, 'campaign': digest(dest / 'description-review-campaign.json'), 'records': digest(record_path), 'decisions': [{'goalId': r['goalId'], 'decision': r['decision'], 'rationale': r['rationale']} for r in records], 'counts': {'keep': 2, 'block': 1, 'revise': 0}, 'earlierOwnVPSeal': digest(PRIOR / 'FINAL.independent-a.package.freeze.json'), 'earlierOwnVPVerdictUnchanged': True, 'specific81373OperatorScopeHoldPreserved': True, 'widerSourceHoldsPreserved': True, 'sourceApproval': False, 'humanApproval': False, 'strictGain': 0, 'activeWrites': False, 'newBQ3ResultsOpened': False})
print('Normal current D3-A records created: keep=2, block=1, candidate=3; previous V/P unchanged.')
