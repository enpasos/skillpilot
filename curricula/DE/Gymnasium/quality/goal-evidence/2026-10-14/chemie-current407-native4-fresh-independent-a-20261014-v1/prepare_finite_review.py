#!/usr/bin/env python3
"""Write this reviewer's finite, non-authoritative native D result only."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

REPO = Path('/home/enpasos/projects/skillpilot')
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
OWN = Path(__file__).parent
ROUND = AUTHOR / 'native-four/round-a'
SUPPLEMENT = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-poly18-aro19-final-case-profile-binding-author-20261013-v1/positive/whole74.exact-bilingual-cases.author.json'
STARTED = '2026-10-13T23:04:12Z'
RUN = 'chemie-current407-native4-independent-a-20261014-v1-run'

def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path': str(p.relative_to(REPO)), 'bytes': p.stat().st_size, 'sha256': digest(p)}

def read(p):
    return json.loads(p.read_text())

def write(name, value):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    return p

selector_path = AUTHOR / 'NEUTRAL.current407-corrected-P8-targeted-native4.exact-input-selector.json'
seal_path = AUTHOR / 'SEAL.finite-current407-corrected-P8-targeted-native4-technical.actual.json'
assert digest(selector_path) == 'sha256:3cf690e737ee91ec6c3362920c31cd546f2360b21bf7a06cc81fba8b52f9fc3a'
assert digest(seal_path) == 'sha256:fa86763c98a10f57322be8cce63042018231f74e3a332414919afe7311829407'
assert digest(SUPPLEMENT) == 'sha256:0f4a2a01684ab687859d3b3e3558528fa9765a62472efdcf767b0dc9013be93c'
selector = read(selector_path)
selected_bindings = []

def inspect_bindings(value):
    if isinstance(value, dict):
        if all(k in value for k in ['path', 'bytes', 'sha256']):
            p = REPO / value['path']
            assert binding(p) == {k: value[k] for k in ['path', 'bytes', 'sha256']}, value['path']
            selected_bindings.append(binding(p))
        for v in value.values():
            inspect_bindings(v)
    elif isinstance(value, list):
        for v in value:
            inspect_bindings(v)

inspect_bindings(selector)
campaign = read(ROUND / 'description-review-campaign.json')
bundle = read(ROUND / 'review-bundle-manifest.json')
input_path = ROUND / 'description-review-input.json'
input_data = read(input_path)
batch = campaign['batches'][0]
batch_path = ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')
batch_rows = [json.loads(line) for line in batch_path.read_text().splitlines()]
assert digest(batch_path) == batch['batchInputFingerprint']
assert [r['goal']['goalId'] for r in batch_rows] == selector['nativeGoalIds'] == batch['goalIds']
assert [r['goal'] for r in batch_rows] == input_data['goals']

positive_bindings = []
for p in sorted((AUTHOR / 'positive').glob('*.jsonl')):
    positive_bindings.append(binding(p))
    for line in p.read_text().splitlines():
        json.loads(line)

case_sources = [AUTHOR / 'positive/two-child-cases.exact-science.json', AUTHOR / 'positive/eight-synthesis-case-carrier.exact-science.json', SUPPLEMENT]
cases = [c for p in case_sources for c in read(p)['cases'] if c['goalId'] in batch['goalIds']]
assert len(cases) == 8
profiles = {g['goalId']: g['reviewContext']['evidenceProfile']['profile'] for g in input_data['goals']}
for g in input_data['goals']:
    briefs = g['reviewContext']['evidenceProfile']['profile']['applicationCaseBriefs']
    for brief in briefs:
        case = next(c for c in cases if c['caseId'] == brief['id'])
        for language in ['De', 'En']:
            assert brief['taskDemand' + language] in [case['task' + language], case['data' + language] + '\n' + case['task' + language]]
            assert brief['expectedPerformance' + language] == case['modelAnswer' + language]

write('INPUTS.eight-selected-whole-DEEN-cases.actual.json', {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'goalIds': batch['goalIds'], 'sourceBindings': [binding(p) for p in case_sources], 'cases': cases, 'reviewerExtractionOnly': True, 'executionOrMasteryClaim': False})
write('INPUTS.four-selected-full-P-profile-data.actual.json', {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'source': binding(input_path), 'profiles': profiles, 'authorWrapperOpinionsExcluded': True})

texts = [
    [
        'Monomerfunktionalität und Verknüpfungen bestimmen Kettenmotive und mögliche Netzpunkte. Packung, Amid-Wasserstoffbrücken und Vernetzung wirken unter gegebenen Feuchte- und Temperaturbedingungen auf verschiedene Eigenschaften; sie begründen keine allgemeine Rangfolge aller Polymere.',
        'Monomer functionality and linkages determine repeat motifs and possible network points. Packing, amide hydrogen bonds and crosslinks affect different properties under stated humidity and temperature conditions; they establish no universal ranking of polymers.',
        'Leitet PE- und PA-6,6-Motive aus den vollständigen Monomeren und eine mögliche Divinylbenzolbrücke aus beiden Vinylgruppen ab; erklärt 60%/900 MPa gegenüber 35%/250 MPa sowie 3% gegenüber 30% Restdehnung und begründet begrenzte Folien-, Faser- und Hüllenwahlen. Bifunktionalität, H-Brücken und Kristallite werden von kovalenten Netzpunkten unterschieden.',
        'Derives PE and PA-6,6 motifs from complete monomers and a possible divinylbenzene bridge using both vinyl groups; explains 60%/900 MPa versus 35%/250 MPa and 3% versus 30% residual strain, and justifies bounded film, fibre and sheath choices. Distinguishes bifunctionality, hydrogen bonds and crystallites from covalent network points.',
        'Überträgt die trockene PA-Faserwahl auf Wasseraufnahme mit 70→45 MPa und das Netzmodell auf eine Prüftemperatur unter Tg; benennt noch fehlende Einsatzdaten. Die beiden Änderungen verlangen eine neue begründete, bedingungsgebundene Entscheidung.',
        'Transfers the dry PA fibre choice to water absorption with 70→45 MPa and the network model to testing below Tg; identifies missing service data. Both changes require a newly justified condition-bound decision.',
        'KEEP nach Volltext-/Kontext-/Bild- und vollständiger Zweifallprüfung. Das native Bild zeigt Packung, N–H···O=C-Brücken und ein schematisches kovalentes Netz; keine Struktur- oder Valenzverwechslung festgestellt. Vollfälle 2652caef-case-1/2 mit e1–e3-Rubriken entsprechen den aktuellen Profilbriefs. Der Originalselector nennt keinen passenden 2652-Vollcase-Carrier: ergänzend wurde der exakt gebundene whole74-Authorcarrier gelesen. Seine sechs anderen/weiteren Ziele wurden nicht fachlich erneut beurteilt. Native Voraussetzung 3e9 ist extern ausdrücklich sichtbar; die Quelle und staatliche Aktivierung werden damit nicht freigegeben.'
    ],
    [
        'Silanolgruppen können unter Wasserabgabe Si–O–Si-Verknüpfungen bilden; endliche lineare Oligomere behalten OH-Endgruppen. PDMS besitzt ein Si–O-Rückgrat mit Methylgruppen, PE ein C–C-Rückgrat; Kettenlänge und kovalente Vernetzung sind verschiedene Strukturmerkmale.',
        'Silanol groups can form Si–O–Si linkages with water loss; finite linear oligomers retain OH end groups. PDMS has a Si–O backbone with methyl groups and PE a C–C backbone; chain length and covalent crosslinking are distinct structural features.',
        'Bilanziert lineares Trimer mit zwei und Tetramer mit drei H₂O bei zwei OH-Endgruppen, vierbindigem Si und zweibindigem O. Vergleicht beide Rückgrate und die tatsächlich angegebenen Eigenschaften: vernetztes PDMS stellt unter gleichen Prüfbedingungen zurück, die PE-Probe verformt sich bleibend. Erklärt das Netzmodell, ohne die Beobachtung aus C–C-Bindungen allein oder für alle PE-Produkte abzuleiten.',
        'Balances a linear trimer with two and tetramer with three H₂O while retaining two OH ends, tetravalent Si and divalent O. Compares the backbones and supplied observations: networked PDMS recovers under matched conditions while the PE specimen deforms permanently. Explains the network model without inferring the observation from C–C bonds alone or generalising to all PE products.',
        'Beurteilt eine geänderte Netzstruktur gegenüber bloß verlängerten freien Ketten für ein rückstellfähiges Bauteil; nutzt den direkt geforderten PDMS–PE-Befund und nennt Grenzen hinsichtlich Stoffzustand, Temperatur und Langzeitverhalten. Der relevante Transfer ist die Struktur-/Einsatzänderung, nicht nur Trimer→Tetramer.',
        'Assesses changed network structure versus merely longer free chains for a recovering component; uses the explicitly demanded PDMS–PE observation and identifies limits from material state, temperature and long-term behaviour. Meaningful transfer lies in changed structure and service conditions, not simply trimer→tetramer.',
        'KEEP der ganzen aktuellen DE/EN-Kompetenz und des vollständigen Profils. Das native Bild zeigt die korrekt bilanzierte Dimethylsilandiol→Disiloxan-Kondensation, OH-Enden und getrennte schematische Öl-/Netzmodelle. Fall 2 fragt PDMS-Rückstellung versus bleibende PE-Verformung ausdrücklich ab; seine e2-Rubrik verweigert volle Punkte bei fehlendem Eigenschaftsvergleich. Fall 1 prüft die Strukturvergleiche, aber keine beobachteten PDMS–PE-Eigenschaften: er ist SUPPORTING_PARTIAL und allein nicht hinreichend für das neue ganze e2. Seine pauschale wholeGoalCoverageDesignClaim wird ausdrücklich zurückgewiesen. Die Zweifall-/Gesamtprofildemands bleiben ausreichend. Die Nano-Kompetenz liegt beim eigenen Kind und wird hier nicht wieder hineingemischt.'
    ],
    [
        'Eine nanoskalige Siloxanschicht kann eine funktionale Oberfläche bilden. Schichtdicke und Partikeldurchmesser bezeichnen verschiedene Dimensionen. Benetzung und Tropfenbeweglichkeit hängen im Materialmodell von Chemie und Struktur ab; hoher Kontaktwinkel beweist weder leichtes Abrollen noch dauerhafte Selbstreinigung.',
        'A nanoscale siloxane film can provide a functional surface. Film thickness and particle diameter are different dimensions. Wetting and droplet mobility depend on chemistry and structure in the supplied model; a high contact angle establishes neither easy rolling nor permanent self-cleaning.',
        'Vergleicht bei gleicher Chemie glatt/nanostrukturiert 105°/35° und 155°/5°, trennt 40-nm-Schicht von fehlender Partikelmessung und nutzt die hydrophile Gleichdickenkontrolle nur gegen eine Dicken-Alleinerklärung. Begründet beweglichere Tropfen über den kleineren Abrollwinkel und fordert Schmutz-/Abriebnachweise für stärkere Funktionsbehauptungen.',
        'Compares smooth/structured surfaces at constant chemistry using 105°/35° and 155°/5°, separates a 40-nm film from absent particle measurement and uses the hydrophilic equal-thickness control only to refute a thickness-only explanation. Infers more mobile drops from lower roll-off angle and requests dirt/abrasion evidence for stronger functional claims.',
        'Interpretiert nach Strukturänderung bei gleicher Chemie 155°/5° gegenüber 150°/40°: trotz hohen Kontaktwinkels ist B weniger leicht abrollend. Trennt die 80-nm-Schicht von unabhängig angegebenen 45-nm-Partikeln nur in C und begrenzt das geänderte Anwendungsurteil.',
        'Interprets a structure change at constant chemistry from 155°/5° to 150°/40°: despite high contact angle, B rolls less easily. Separates the 80-nm film from independently supplied 45-nm particles in specimen C only, and bounds the changed application conclusion.',
        'KEEP nach beiden vollständigen DE/EN-Fällen mit allen e1–e3-Rubriken und nativer Bildsicht. Die Grafik kennzeichnet 40 nm vertikal als Schichtdicke und ausdrücklich keine Partikelgröße; gleicher Silikonchemie stehen getrennte glatte/strukturierte Modelle gegenüber. Sie verspricht keinen tatsächlichen Schmutzabtrag. Die hydrophile Kontrolle isoliert ohne gleichgehaltene Struktur keinen alleinigen Chemieeffekt; Modellantwort und Rubrik werden hier nur in ihrer ausdrücklich begrenzten Dicken-/Strukturlesart akzeptiert. Der A/B-Fall prüft eine neue datenabhängige Inferenz. Quelle/kosmetischer Restauftrag bleiben separat offen.'
    ],
    [
        'Die vollständige Route benötigt Carbonylaktivierung, zwei elektrophile Ringangriffe mit Rearomatisierung und Wasserabgabe zur neutralen dreiarylsubstituierten Leukoverbindung. Erst deren Zwei-Elektronen-Oxidation liefert das dreibindige donorstabilisierte Farbstoffkation; Kondensation und Redoxstufe leisten unterschiedliche Bindungs-/Ladungsänderungen.',
        'The complete route requires carbonyl activation, two electrophilic arene attacks with rearomatisation and water loss to the neutral three-aryl leuco compound. Only its two-electron oxidation yields the three-bond donor-stabilised dye cation; condensation and redox steps perform different bond and charge changes.',
        'Zeigt O-Protonierung, Ring-π→Carbonyl-C/C=O-π→O, erste Rearomatisierung, OH-Protonierung/Wasserverlust, zweiten Ringangriff und Rearomatisierung. Bilanziert RCHO+2ArH→RCH(Ar)₂+H₂O und RCH(Ar)₂→[RC(Ar)₂]⁺+H⁺+2e⁻ mit 0=+1+1−2. Unterscheidet vierbindiges neutrales Leuko-C mit H von dreibindigem C⁺.',
        'Shows O protonation, ring pi→carbonyl C/C=O pi→O, first rearomatisation, OH protonation/water loss, second arene attack and rearomatisation. Balances RCHO+2ArH→RCH(Ar)₂+H₂O and RCH(Ar)₂→[RC(Ar)₂]⁺+H⁺+2e⁻ with 0=+1+1−2. Distinguishes neutral tetravalent leuco C bearing H from three-bond C⁺.',
        'Diagnostiziert den unterbrochenen Routenentwurf X=RCH(OH)Ar anhand zweier statt dreier Arylreste und der verbleibenden OH-Gruppe. Begründet, warum die angegebene Leuko-Oxidation keine fehlende Aryl-C–C-Bindung bildet, und ordnet Wasserabgabe sowie zweiten Ringangriff vor der Oxidation ein. Das ist unabhängig von bloßem Restnamenwechsel separat mit r2 bewertet.',
        'Diagnoses the stopped route draft X=RCH(OH)Ar using two instead of three aryl residues and the retained OH group. Explains why the specified leuco oxidation cannot form the missing aryl C–C bond and orders water loss and the second arene attack before oxidation. This separately graded r2 inference goes beyond simply changing a residue name.',
        'KEEP nach ganzen DE/EN-Routenfällen einschließlich Fall-2-r1/r2 und nativer Bildsicht. Die Grafik bewahrt die drei Arylreste, zeigt vier Leuko-C-Bindungen und nach Oxidation drei C⁺-Bindungen; sie nennt ihre Route ausdrücklich vereinfacht. Die vollständigen Elementarschritte, H₂O-Bilanz und Ladungs-/Elektronenbilanz werden in beiden Vollfällen tatsächlich gefordert und bewertet. Fall 2 verlangt keine unbekannte alternative Oxidation von X; sein struktur- und bindungsbezogener Stoppdiagnose-Transfer ist eine echte zusätzliche Inferenz. Die externen Voraussetzungen 17ab/EAS, Brønsted und Redox sind im nativen Kontext einzeln vorhanden; Azo ist im Nachbarkind und wird nicht zum eigenen zusätzlichen Teilauftrag.'
    ],
]
keys = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
records = []
for g, t in zip(input_data['goals'], texts, strict=True):
    record = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1, 'recordId': RUN + '.' + g['goalId'][:8], 'runId': RUN, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest']}
    for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
        record[k] = g[k]
    record.update({'decision': 'keep', 'understandingEvidence': dict(zip(keys, t[:6], strict=True)), 'rationale': t[6], 'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
    records.append(record)

output_path = OWN / 'results' / (batch['batchId'] + '.records.jsonl')
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n' for r in records))
parameters_path = write('RUN.actual-known-and-unexposed-generation-parameters.json', {'provider': 'OpenAI', 'knownModelFamily': 'GPT-6', 'exactRuntimeModelIdentifier': None, 'modelRevision': None, 'temperature': None, 'topP': None, 'seed': None, 'samplingParametersExposed': False, 'reasoningEffortExposed': False, 'toolchainVersionInterpretation': 'codex-native-d-review-v1 is a declared local workflow identifier; it does not assert an upstream tool release or hidden model configuration.'})
completed = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1, 'runId': RUN, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], 'provider': 'OpenAI', 'model': 'GPT-6 family; exact runtime model revision not exposed', 'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-native-first-pass-v1', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'], 'generationParametersFingerprint': digest(parameters_path), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'], 'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}], 'startedAt': STARTED, 'completedAt': completed, 'status': 'completed', 'outputDigest': digest(output_path), 'toolchainVersion': 'codex-native-d-review-v1'}
write('results/' + batch['batchId'] + '.run.json', run)

write('SCIENTIFIC.four-current407-native-whole-goal-and-P-review.independent-a.actual.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'reviewKind': 'bounded genuine native D whole-goal review', 'runId': RUN, 'startedAt': STARTED, 'completedAt': completed, 'orderedGoalIds': batch['goalIds'], 'nativeDDecisions': ['keep'] * 4,
    'actualInspection': {'nativePDFPhysicalPages': [1, 2, 3, 4, 5, 6], 'nativeGoalPhysicalPages': [3, 4, 5, 6], 'method': 'PyMuPDF raster renders viewed with view_image at native page layout; all four goal images and typed/spatial diagrams examined; full PDF text and current goal/context/relationship/profile tuples read.', 'wholeSelectedDEENCasesRead': [c['caseId'] for c in cases], 'rubricCoverage': 'Every selected whole case data, task, model answer and complete rubric read; no learner execution claimed.', 'wholeCurrent407ContextModel': binding(REPO / selector['fullCurrent407Model']['path']), 'directPrerequisiteBodiesRead': ['3e9eb5d0-3407-5a1e-9492-ad87f98d303d', '2652caef-b557-58b9-9b28-70db62625ce5', 'a96e9b3d-a02d-54f8-a3d3-318e0ea5180c', '17ab1148-7383-5cab-8b91-73aff795f1e4', 'a9c22adc-b543-5b0c-a2d8-3189facdff08', '1c1420c2-a8e2-520f-8015-6df637a973bd', '4961130b-1ee8-58f2-a319-dff0a864db6a'], 'selectedGoalParentsRead': ['afad3a68-c643-5c49-8583-e5d8b1d8b56c', 'e56040b5-1da8-5080-b358-086d04922339', 'e5941581-0aba-5354-b4b9-d0249d4538a8'], 'unaffectedOtherSixNewScientificReview': False},
    'independence': {'independenceGroupId': campaign['independenceGroupId'], 'newPeerNativeDReviewsReadBeforeSeal': False, 'newPeerCorrectionReviewsReadBeforeSeal': False, 'priorOwnWorkingHistoryExists': True, 'contextNaiveReviewerClaim': False, 'historicalPeerVerdictsReadInThisRun': False, 'historicalNativeDRecordsUsedAsVerdictOracle': False, 'incidentalAuthorMetadataExposure': 'A batch-row inspection printed the 2652 author wrapper reason (additive bilingual successor awaiting independent review), reviewer label and status. Canonical parent/child provenance also includes author HOLD labels. These are disclosed metadata exposures, not scientific approval or an oracle; all scientific conclusions were derived from whole goal, native images and complete cases. Strict blindness to all author fitness prose is not claimed.', 'blindToOtherCurrentRuns': True},
    'findings': [
        {'id': 'D4-A-CHILD1-CASE1-SUPPORTING-PARTIAL', 'goalId': batch['goalIds'][1], 'severity': 'bounded carrier coverage overstatement; not a native whole-goal blocker', 'caseId': 'e560-formation-case-1', 'claimRejected': 'All three child expectations are elicited in this one multi-step case.', 'actualDemand': 'Case1 e2 asks backbone/side-group comparison but supplies no directly assessed PDMS versus PE property observation. It cannot alone fulfil current whole e2.', 'acceptedBasis': 'Current case2 explicitly asks matched-condition PDMS recovery versus permanent PE deformation and separately grades the property comparison; finite formation, balance and structure remain assessed. Whole profile retains all demands.', 'nextAction': 'Retain SUPPORTING_PARTIAL classification for case1 whenever case-level sufficiency is consumed; correct its generic wholeGoalCoverageDesignClaim in a future bounded carrier successor without weakening whole e2.'},
        {'id': 'D4-A-2652-MISSING-DIRECT-CARRIER-IN-SELECTOR', 'goalId': batch['goalIds'][0], 'severity': 'input routing limitation resolved by exact supplemental existing source', 'originalSelectorThirdCarrier': selector['completeCaseCarriers'][2], 'actualCarrierContent': 'Only f9e6d689, f54b2c33, b7ae47da six recycling cases; no 2652 case.', 'supplementalCarrier': binding(SUPPLEMENT), 'actualSelectedCaseIds': ['2652caef-case-1', '2652caef-case-2'], 'taskAndModelAnswerDEENJoinToCurrentProfile': True, 'originalSelectorAndBatchModified': False},
        {'id': 'D4-A-NANO-CONTROL-INTERPRETATION-BOUNDARY', 'goalId': batch['goalIds'][2], 'severity': 'explicit interpretation limit', 'limit': 'Equal-thickness hydrophilic control refutes thickness-only wetting explanations. Unless surface structure is also controlled, it alone does not isolate a chemistry-only causal effect. Matched-chemistry A/B supports a structure effect; roll-off is distinct from contact angle; dirt transport, abrasion durability and universal safety are unproved.'}
    ],
    'fullProfileCoverageConclusion': 'All four current profiles have adequate complete written/data-based whole-goal demands and meaningful condition/route transfer; no profile content revision required for these native D decisions. Case1 partial sufficiency is explicitly preserved, and case/profile labels do not prove learner mastery.',
    'scopeBoundaries': {'sourceWholeDutyOrJurisdictionGateClosed': False, 'cosmeticsSourceDebtClosed': False, 'newAtomicityOrMemoryDecision': False, 'independentVApprovalClaim': False, 'PAuthorityOrPracticalExecutionClaim': False, 'humanApproval': False, 'activeCurriculumWrites': False, 'engineRegistryGitWrites': False, 'strictPlusCompletions': 0, 'activeAtomicDenominatorChanged': False, 'sourceHOLDUsedAsNativeDOracle': False},
    'recordOutput': binding(output_path), 'schemaNativeRunManifest': binding(OWN / 'results' / (batch['batchId'] + '.run.json'))
})

write('INPUTS.exact-bound-original-round-a-and-supplement.actual.json', {'schemaVersion': 1, 'startedAt': STARTED, 'neutralSelector': binding(selector_path), 'technicalAuthorSeal': binding(seal_path), 'selectorFileBindingsAllVerified': selected_bindings, 'originalRoundA': [binding(p) for p in [ROUND / 'review-bundle-manifest.json', input_path, ROUND / 'description-review-campaign.json', batch_path, ROUND / 'prompt.md', ROUND / 'criteria.md', ROUND / 'contracts/goal-description-review-record.schema.json']], 'runManifestSchema': binding(REPO / 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'), 'supplemental2652WholeCaseCarrier': binding(SUPPLEMENT), 'currentP8RawFiles': positive_bindings, 'readOrVerifyOnlyHistoricalReviewSeals': 'No historical peer verdict/seal contents were read; standalone bindings list contains their paths only.', 'publicTemporaryArtifactLinks': False})
print(json.dumps({'records': 4, 'selectedWholeCases': len(cases), 'completedAt': completed, 'recordsDigest': digest(output_path)}, ensure_ascii=False))
