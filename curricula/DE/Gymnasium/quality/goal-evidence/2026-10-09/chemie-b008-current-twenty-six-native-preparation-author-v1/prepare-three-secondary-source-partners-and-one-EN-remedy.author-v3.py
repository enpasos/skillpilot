# SPDX-License-Identifier: Apache-2.0
"""Three explicit partial secondary roles and one faithful EN correction, inactive."""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'source-view-remediation-author-v3'
PREV = OWN / 'source-view-remediation-author-v2'

def read(p): return json.loads(p.read_text())
def bind(p):
    assert not p.is_symlink(), p
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

assert not OUT.exists()
raw_path = OWN / 'source-view-author/original35-opaque-entries-whole-source-operator-partner-v2-normal-facets.neutral-input.json'
raw = read(raw_path)
before_canon_path = PREV / 'canonical504-two-precise-existing-target-source-jurisdictions.author-candidate.json'
before_canon = read(before_canon_path)
canon = deepcopy(before_canon)
by_id = {g['id']: g for g in canon['goals']}
redox_id = '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'
before_redox = deepcopy(by_id[redox_id])
by_id[redox_id]['descriptionEn'] = 'The learner can properly carry out and evaluate redox titrations, determine concentrations of electron acceptors or electron donors in aqueous solutions, and justify the procedure using redox equations, for example in manganometry.'
assert by_id[redox_id]['description'] == before_redox['description']
assert [key for key in set(before_redox) | set(by_id[redox_id]) if before_redox.get(key) != by_id[redox_id].get(key)] == ['descriptionEn']
assert all(g == before for g, before in zip(canon['goals'], before_canon['goals']) if g['id'] != redox_id)
canon_binding = write('canonical504-one-faithful-redox-EN-existing-fields-kept.author-candidate.json', canon)
secondary_id = '16b24dc5-0e48-5e3b-8307-01289db8d1a9'
secondary = by_id[secondary_id]
fix_specs = [
 {'entryIndices': [19], 'sourceGoalId': 'rp-chem-sekii-rp-ch-sekii-2022-baustein-4-4-001-8f4c195f',
  'jurisdiction': 'DE-RP', 'primaryPhysicalPage': 42,
  'roleDe': 'Nur der sekundäre elektrochemische Strom-/Spannungsquellentyp an einem konkreten Beispiel: Aufbau, elektrochemische Funktion beim Entladen und Möglichkeit der Wiederaufladung erläutern. Primärelement und Brennstoffzelle bleiben je ein eigenes Pflichtbeispiel mit sämtlichen alten Partnern; zusätzliche Beispiele aus Additum sind keine universelle Pflicht.'},
 {'entryIndices': [26], 'sourceGoalId': 'sn-chem-sekii-sn-ch-jahrgangsstufe-12-leistungskurs-lb1-071-02-e24d7241',
  'jurisdiction': 'DE-SN', 'primaryPhysicalPage': 57,
  'roleDe': 'Nur der konkret benannte Sekundärelement-Beitrag der ausgewählten Spannungsquellen in Jahrgang12 LK: Anwendung elektrochemischer Zusammenhänge auf ein wiederaufladbares Element mit Aufbau und Funktionsweise. Nachhaltigkeit/E-Mobilität und digitale Dokumentation/Projektarbeit behalten ihren tatsächlichen Kommentar-/Beispielstatus aus beiden originalen Spalten; keine universelle digitale Pflicht erfinden. Primär- und Brennstoffzellenpartner bleiben ganz erhalten.'},
 {'entryIndices': [31, 34], 'sourceGoalId': 'th-chem-sekii-th-ch-sekii-4-1-5-elektrochemische-spannungsquellen-111-01-8894e9ac',
  'jurisdiction': 'DE-TH', 'primaryPhysicalPage': 53,
  'roleDe': 'Nur Zuordnung einer elektrochemischen Spannungsquelle zu Sekundärelementen sowie Aufbau und Wirkungsweise an einem konkreten Beispiel. Die gemeinsamen GK/LK-Pflichten verlangen zusätzlich Primär- und Tertiärelement/Brennstoffzelle mit je einem Beispiel; diese ganzen Inhalte/Partner werden nicht durch Sekundärzellen-Quellenkritik ersetzt.'}]
proofs, corrections, mappings = [], [], []
for fix in fix_specs:
    entry = raw['entries'][fix['entryIndices'][0]]
    duty = next(d for d in entry['wholeOriginalSourceDutiesAndPartnerContexts'] if d['wholeSourceGoal']['id'] == fix['sourceGoalId'])
    original_mapping_path = ROOT / duty['mappingBinding']['path']
    original_extraction_path = ROOT / duty['extractionBinding']['path']
    document = duty['wholeSourceDocuments'][0]
    pdf = ROOT / document['path']
    pages = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], check=True, capture_output=True, text=True).stdout.split('\f')
    page_text = pages[fix['primaryPhysicalPage'] - 1]
    assert 'Sekund' in page_text, fix
    proofs.append({'jurisdiction': fix['jurisdiction'], 'actualOriginalPDF': bind(pdf),
                   'wholeOriginalSourceDocument': document, 'actualPDFPhysicalPage1Based': fix['primaryPhysicalPage'],
                   'wholeActualOriginalPageText': page_text,
                   'wholeActualOriginalPageTextSHA256': hashlib.sha256(page_text.encode()).hexdigest(),
                   'notAnIndependentReview': True})
    # Continue the separately authored source/course successors; never restore their old defects.
    if fix['jurisdiction'] == 'DE-SN':
        prior_map_path = next(p for p in (PREV / 'partner-mappings').glob('*.json') if read(p)['sourceLandscapeId'] == read(original_mapping_path)['sourceLandscapeId'])
    elif fix['jurisdiction'] == 'DE-TH':
        prior_map_path = PREV / 'TH-upper-unchanged-all-decisions-new-source-course-pointer.mapping.author-candidate.json'
    else: prior_map_path = original_mapping_path
    mapping = deepcopy(read(prior_map_path))
    decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == fix['sourceGoalId'])
    prior_decision = deepcopy(decision)
    assert secondary_id not in decision['canonicalGoalIds']
    decision['canonicalGoalIds'].append(secondary_id)
    decision['rationale'] = 'Gezielter operativer Teilrollenkandidat: ' + fix['roleDe'] + ' Das ganze bestehende Ziel16b verlangt darüber hinaus Recherche, Energetik, Einsatzbewertung, Vertrauenswürdigkeits-/Urheberschaftsprüfung und Zitate; diese zusätzliche Zielkompetenz wird durch die Inhaltsklausel nicht wörtlich als Source-Soll ausgegeben.'
    decision['reviewer'], decision['reviewedAt'] = None, None
    decision['operativeReviewStatus'] = 'pending_two_current_source_scope_partner_and_native_context_reviews'
    decision['historicalWholeDecisionBeforeNewSecondaryPartialRole'] = prior_decision
    decision['actualPrimaryPhysicalPageWitness'] = {'originalPDF': bind(pdf), 'physicalPage': fix['primaryPhysicalPage']}
    mapping['mappings'].append({'legacyGoalId': fix['sourceGoalId'], 'canonicalGoalId': secondary_id,
                                'matchType': 'partial', 'reviewDecisionId': fix['sourceGoalId']})
    if fix['jurisdiction'] == 'DE-SN':
        source = deepcopy(read(original_extraction_path))
        selected_source = next(g for g in source['sourceGoals'] if g['id'] == fix['sourceGoalId'])
        before_locator = deepcopy(selected_source)
        selected_source['sourceSpan'] = selected_source['sourceSpan'].replace('PDF-S. 56', 'PDF-S. 57 (gedruckte S.45)')
        selected_source['sourceRef'] = selected_source['sourceRef'].replace('PDF-S. 56', 'PDF-S. 57 (gedruckte S.45)')
        assert selected_source['sourceText'] == before_locator['sourceText']
        selected_source['extendedData'] = {**selected_source.get('extendedData', {}),
            'currentPrimaryLocatorCorrection': {'historicalSourceSpan': before_locator['sourceSpan'],
                'historicalSourceRef': before_locator['sourceRef'], 'actualPhysicalPage': 57, 'actualPrintedPage': 45,
                'actualOriginalPDF': bind(pdf), 'sourceTextAndAllSourceOperatorsUnchanged': True,
                'independentCurrentSourceLocatorReview': 'PENDING'}}
        source_binding = write('SN-upper-one-actual-secondary-source-physical57-locator.source-extraction.author-candidate.json', source)
        mapping['sourceExtractionPath'] = source_binding['path']
        decision['sourceSpan'] = selected_source['sourceSpan']
    mapping_binding = write('mapping/' + fix['jurisdiction'] + '-existing-partners-plus-one-secondary.partial-author-candidate.json', mapping)
    mappings.append({'jurisdiction': fix['jurisdiction'], 'originalMapping': bind(original_mapping_path),
                     'priorAuthorMappingBeforeTargetedSecondary': bind(prior_map_path), 'candidateMapping': mapping_binding})
    assert [g for g in decision['canonicalGoalIds'] if g != secondary_id] == prior_decision['canonicalGoalIds']
    assert [e for e in mapping['mappings'] if not (e['legacyGoalId'] == fix['sourceGoalId'] and e['canonicalGoalId'] == secondary_id)] == read(prior_map_path)['mappings']
    original_decisions = {d['sourceGoalId']: d for d in read(prior_map_path)['decisions']}
    assert all(d == original_decisions[d['sourceGoalId']] for d in mapping['decisions'] if d['sourceGoalId'] != fix['sourceGoalId'])
    corrections.append({'newPartialRole': fix, 'wholeOriginalSourceDutyAndAllPartners': duty,
                        'newPartnerWholeGoalUnchanged': secondary, 'newPartnerWasAlreadyTargetInAllFourViews': True,
                        'allOriginalDecisionsOtherThanOneExact': True, 'allOriginalPartnerIdsAndEdgesPreserved': True,
                        'wholeSourceGoalAndWholeCourseApproval': False, 'independentTargetedReviewStatus': 'PENDING'})
write('whole-original-primary-source-pages-and-secondary-partner.author-reading.input.json', {'schemaVersion': 1,
    'actualWholeOriginalPrimaryPages': proofs, 'authorInterpretationsAreNotIndependentReviews': True,
    'SNActualPrinted45Physical57ExplicitlySupersedesOnlyWrongLocator': True,
    'wholeSecondaryTarget': secondary, 'activeWrites': []})
write('three-secondary-partial-source-companions-four-view-occurrences.author-candidates.json', {
    'schemaVersion': 1, 'wholeOriginal35EntryInput': bind(raw_path), 'corrections': corrections,
    'newMappings': mappings, 'exactFourOccurrenceIndices': [19, 26, 31, 34], 'wholeExistingSecondaryGoal': secondary,
    'newCanonicalAtoms': 0, 'sourceApproval': False, 'nativeApproval': False, 'humanApproval': False, 'activeWrites': [], 'strictGain': 0})
redox_duty = next(d for d in raw['entries'][24]['wholeOriginalSourceDutiesAndPartnerContexts'] if d['wholeSourceGoal']['id'] == 'sn-chem-sekii-sn-ch-jahrgangsstufe-11-leistungskurs-lb2-042-04-4c300699')
write('one-redox-whole-DEEN-fidelity-correction-and-actual-operator.author-candidate.json', {
    'schemaVersion': 1, 'goalId': redox_id, 'beforeWholeGoal': before_redox, 'afterWholeGoal': by_id[redox_id],
    'exactOnlyGoalFieldDelta': 'descriptionEn', 'all503OtherGoalObjectsExactAgainstPriorAuthorCanonical': True,
    'wholeDEAndAllGoalRequiresImagesUnchanged': True, 'wholeSourceDutyAndAllPartners': redox_duty,
    'mandatoryPerformanceDe': ['Tatsächlich fachgerecht Redoxtitration durchführen', 'Quantitativ auswerten und Konzentration des Donors oder Akzeptors bestimmen', 'Stöchiometrie/Vorgehen mit Redoxgleichungen begründen'],
    'ENIndependentFidelityAndCurrentD_P_A_M_VSourceContextReviews': 'PENDING',
    'modelCasesDoNotAttestRealPracticalPerformance': True, 'activeWrites': [], 'sourceApproval': False, 'netStrictGain': 0})
print(json.dumps({'canonical': canon_binding, 'newSourceEdges': 3, 'viewOccurrences': 4, 'ENFieldChanges': 1,
                   'actualPrimaryPages': len(proofs), 'oldPartnersAllPreserved': True, 'newAtoms': 0, 'gain': 0}))
