# SPDX-License-Identifier: Apache-2.0
"""Five precise source/view remedies; all other genuine source holds remain."""
from pathlib import Path
from copy import deepcopy
import hashlib
import json
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'source-view-remediation-author-v2'
assert not (OUT / 'five-bounded-source-view-remediation.first.freeze.json').exists()

def read(path): return json.loads(path.read_text())
def bind(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(path, value):
    assert path.is_relative_to(OUT)
    raw = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists(): assert path.read_bytes() == raw, path
    else: path.write_bytes(raw)
    return bind(path)

bdir = OWN.parent / 'chemie-b008-partner-preserving-views-independent-b-v1'
b_entry_path = bdir / 'completed-twenty-eight-partner-preserving-source-view-independent-b.neutral-integration-entry.json'
b_entry = read(b_entry_path)
assert bind(b_entry_path)['sha256'] == 'bbf70f8cba56bcba399f39bd0d0015de2d55ae8d1e26e6fa899d7e8fc4a4260a'
for field in ['firstImmutableVerdict', 'firstImmutableFreeze']:
    declaration = b_entry[field]
    actual = bind(ROOT / declaration['path'])
    assert actual['sha256'] == declaration['sha256'].removeprefix('sha256:')
    assert actual['bytes'] == declaration['bytes']
b = read(ROOT / b_entry['firstImmutableVerdict']['path'])
original_input_path = OWN / 'source-view-author/original35-opaque-entries-whole-source-operator-partner-v2-normal-facets.neutral-input.json'
original = read(original_input_path)
canon_path = OWN / 'candidate/canonical504-current26-resource-links.inactive.json'
canon = read(canon_path)
goals = {g['id']: g for g in canon['goals']}
source_fixes = [
    {'entryIndex': 6, 'sourceGoalId': 'de-hh-chemie-sekii-bildungsplan-2022-1-3-029-72f4f1e9',
     'newPartnerGoalId': 'f4d5a02d-711b-5a6b-a41d-971359c1f64d', 'jurisdiction': 'DE-HH',
     'boundedRoleDe': 'Das allgemeine Prinzip der Polarimetrie und optische Aktivität erklären; molekulare Polarität bleibt separat und ist kein Ersatz.',
     'primaryPath': 'curricula/DE/Gymnasium/input/HH/chemie-gyo-2022-data.pdf', 'physicalPage': 26,
     'fullRoleLimitDe': 'Quelle verlangt allgemeines Polarimetrieprinzip, keine tatsächliche Polarimeterbedienung und keine komplette neue analytische Methodengruppe.'},
    {'entryIndex': 10, 'sourceGoalId': 'mv-chem-seki-mv-ch-seki-2021-j8-kabel-005-57941cc6',
     'newPartnerGoalId': 'fcaf8c9b-bd81-552e-9d91-43649895471e', 'jurisdiction': 'DE-MV',
     'boundedRoleDe': 'Metallmodell anhand elektrischer Leitfähigkeit mit äußeren Spannungsquelle, beweglichen Elektronen und schwingenden Gitterionen verwenden; Ionenleitung in Lösungen bleibt separat.',
     'primaryPath': 'curricula/DE/Gymnasium/input/MV/Chemie_Sekundarstufe_I_2021.pdf', 'physicalPage': 20,
     'fullRoleLimitDe': 'Dies ist eine source-specific Operationalisierung des bestehenden Metallmodellziels. Aktuelle P-Modellfälle müssen diese vollständige Stromrolle gezielt belegen; bloße Aufnahme der ID ist keine Freigabe.'},
    {'entryIndex': 24, 'sourceGoalId': 'sn-chem-sekii-sn-ch-jahrgangsstufe-11-leistungskurs-lb2-042-04-4c300699',
     'newPartnerGoalId': '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9', 'jurisdiction': 'DE-SN',
     'boundedRoleDe': 'Redoxtitration tatsächlich fachgerecht durchführen und quantitativ auswerten; die Quelle behält ausgewählte Alltag-/Technik-/Analytikkontexte, Manganometrie und Wasseruntersuchung als Quellbeispiele.',
     'primaryPath': 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf', 'physicalPage': 49,
     'fullRoleLimitDe': 'Säure-Base-Titration und Redoxgleichung allein schließen den realen Redoxtitrationsoperator nicht. Ein schriftliches Autorenbeispiel attestiert keine Laborleistung; das ursprüngliche EN-Ziel darf seine reale Durchführungs-/Konzentrationskompetenz nicht verkürzen.'},
]
th_course_ids = ['th-chem-sekii-th-ch-sekii-4-1-7-proteine-157-03-5adba6a9',
                 'th-chem-sekii-th-ch-sekii-4-1-8-recycling-173-01-6f6ecf13']
whole_primary = []
for path, physical_pages in [
        ('curricula/DE/Gymnasium/input/HH/chemie-gyo-2022-data.pdf', [26]),
        ('curricula/DE/Gymnasium/input/MV/Chemie_Sekundarstufe_I_2021.pdf', [19, 20]),
        ('curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf', [49]),
        ('curricula/DE/Gymnasium/input/TH/LP_GY_Chemie_2024.pdf', [52, 56, 57, 58])]:
    whole = subprocess.run(['pdftotext', '-layout', path, '-'], check=True, capture_output=True, text=True).stdout.split('\f')
    whole_primary.append({'actualOriginalPDF': bind(ROOT / path),
                          'actualWholePages': [{'physicalPage1Based': page, 'wholePageText': whole[page - 1],
                                                'wholePageTextSha256': hashlib.sha256(whole[page - 1].encode()).hexdigest()} for page in physical_pages]})
write(OUT / 'actual-eight-whole-primary-pages-and-two-column-author-reading.input.json', {
    'schemaVersion': 1, 'wholePrimaryInputs': whole_primary,
    'actualTHColumnRasterAuthorViews': [bind(ROOT / ('tmp/chemie-b008-view-hold-remediation-primary-20261009-v1/TH-physical%03d.png' % page)) for page in [52, 57, 58]],
    'THActualAuthorObservation': {'headersPhysical52and58': 'Left: grundlegendes und erhöhtes Anforderungsniveau; right: zusätzlich für das erhöhte Anforderungsniveau',
                                'physical57': 'Amino-acid chromatography description and Rf interpretation are left/shared. Pupil amino-acid TLC/ninhydrin is right/elevated-only.',
                                'physical58': 'PET material-cycle depiction is right/elevated-only; generic recycling differentiation/evaluation is left/shared.'},
    'HHActualAuthorObservation': 'Physical26 explicitly labels proteins and polarimetry as only elevated level.',
    'MVActualAuthorObservation': 'Printed16 is physical20, not physical16; whole cable context explicitly uses mobile electrons, voltage source and vibrating metallic ions.',
    'SNActualAuthorObservation': 'Physical49 explicitly requires experimental performance and quantitative evaluation of redox titration; metallurgy and household examples remain retained.',
    'independentCurrentRemediationApproval': False, 'humanApproval': False})

mapping_candidates = {}
original_mapping_bindings = {}
patched_rows = []
for fix in source_fixes:
    whole_entry = original['entries'][fix['entryIndex']]
    duty = next(d for d in whole_entry['wholeOriginalSourceDutiesAndPartnerContexts'] if d['wholeSourceGoal']['id'] == fix['sourceGoalId'])
    path = ROOT / duty['mappingBinding']['path']
    if str(path) not in mapping_candidates:
        mapping_candidates[str(path)] = deepcopy(read(path))
        original_mapping_bindings[str(path)] = bind(path)
    candidate = mapping_candidates[str(path)]
    decision = next(d for d in candidate['decisions'] if d['sourceGoalId'] == fix['sourceGoalId'])
    before = deepcopy(decision)
    new_id = fix['newPartnerGoalId']
    if new_id not in decision['canonicalGoalIds']: decision['canonicalGoalIds'].append(new_id)
    decision['historicalReviewedDecisionBeforeOperativeCandidate'] = before
    decision['rationale'] = 'Operativer Quellen-/Partnerkorrekturkandidat: ' + fix['boundedRoleDe'] + ' ' + fix['fullRoleLimitDe']
    decision['reviewer'], decision['reviewedAt'] = None, None
    decision['operativeReviewStatus'] = 'pending_independent_current_source_operator_course_and_P_context_review'
    candidate['mappings'].append({'legacyGoalId': fix['sourceGoalId'], 'canonicalGoalId': new_id,
                                  'matchType': 'partial', 'reviewDecisionId': fix['sourceGoalId']})
    candidate['status'] = 'operative_source_partner_author_candidate'
    patched_rows.append({'wholeCurrentOriginalDutyAndAllPartners': duty,
                         'newBoundedSourceRole': fix, 'wholeNewPartnerGoalUnchanged': goals[new_id],
                         'wholeBeforeDecision': before, 'wholeAfterDecisionCandidate': decision,
                         'originalAllPartnersRetained': True, 'wholeTargetSourceOrPApproval': False})

th_duty = next(d for r in original['entries'] for d in r['wholeOriginalSourceDutiesAndPartnerContexts'] if d['wholeSourceGoal']['id'] == th_course_ids[0])
th_extraction_path = ROOT / th_duty['extractionBinding']['path']
th_original = read(th_extraction_path)
th_successor = deepcopy(th_original)
th_deltas = []
for goal in th_successor['sourceGoals']:
    if goal['id'] not in th_course_ids: continue
    before = deepcopy(goal)
    assert goal['courseLevel'] == 'GK_LK' and 'course:GK_LK' in goal['tags']
    goal['courseLevel'] = 'LK'
    goal['tags'] = ['course:LK' if t == 'course:GK_LK' else t for t in goal['tags']]
    changed_fields = [key for key in set(before) | set(goal) if before.get(key) != goal.get(key)]
    assert sorted(changed_fields) == ['courseLevel', 'tags']
    th_deltas.append({'goalId': goal['id'], 'changedFields': changed_fields, 'wholeBeforeSourceGoal': before,
                      'wholeCurrentPrimaryColumnFaithfulSourceGoalCandidate': deepcopy(goal),
                      'allTextOperatorAndPartnerFieldsExactlyPreserved': True})
assert len(th_deltas) == 2
assert th_successor['passages'] == th_original['passages']
assert all(a == z for a, z in zip(th_original['sourceGoals'], th_successor['sourceGoals']) if a['id'] not in th_course_ids)
th_target = OUT / 'TH-upper-primary-column-faithful-two-course-roles.source-extraction.author-candidate.json'
write(th_target, th_successor)
th_mapping_path = ROOT / th_duty['mappingBinding']['path']
th_mapping = deepcopy(read(th_mapping_path))
th_mapping['sourceExtractionPath'] = str(th_target.relative_to(ROOT))
assert th_mapping['decisions'] == read(th_mapping_path)['decisions']
assert th_mapping['mappings'] == read(th_mapping_path)['mappings']
th_map_target = OUT / 'TH-upper-unchanged-all-decisions-new-source-course-pointer.mapping.author-candidate.json'
write(th_map_target, th_mapping)
write(OUT / 'two-TH-course-deltas-all-texts-rows-and-partners-preserved.actual-author-guard.json', {
    'schemaVersion': 1, 'originalSourceExtraction': bind(th_extraction_path), 'newSourceExtractionCandidate': bind(th_target),
    'originalWholeMapping': bind(th_mapping_path), 'newMappingSourcePointerCandidate': bind(th_map_target),
    'originalSourceGoalCount': len(th_original['sourceGoals']), 'sameSourceGoalCount': len(th_successor['sourceGoals']),
    'intentionalCourseDeltas': th_deltas, 'allOtherWholeSourceGoalsExact': True,
    'allWholePassagesExact': True, 'allMappingDecisionsAndRelationsExact': True,
    'sourceRowsDropped': 0, 'newScientificApprovals': [], 'nativeReviewPending': True, 'humanApproval': False})
mapping_bindings = []
for path, candidate in mapping_candidates.items():
    target = OUT / 'partner-mappings' / Path(path).name
    write(target, candidate)
    old = read(Path(path))
    selected_ids = {f['sourceGoalId'] for f in source_fixes if f['sourceGoalId'] in {r['sourceGoalId'] for r in candidate['decisions']}}
    assert [r for r in old['decisions'] if r['sourceGoalId'] not in selected_ids] == [r for r in candidate['decisions'] if r['sourceGoalId'] not in selected_ids]
    assert all(e in candidate['mappings'] for e in old['mappings'])
    mapping_bindings.append({'original': original_mapping_bindings[path], 'operativeCandidate': bind(target),
                             'originalAllDecisionsExceptSpecifiedRowsExact': True, 'allOriginalMappingEdgesRetained': True})

candidate_canon = deepcopy(canon)
field_deltas = []
for goal in candidate_canon['goals']:
    relevant = [fix for fix in source_fixes if fix['newPartnerGoalId'] == goal['id']]
    if not relevant: continue
    before = deepcopy(goal)
    for fix in relevant:
        if fix['jurisdiction'] not in goal['applicability']['jurisdiction']: goal['applicability']['jurisdiction'].append(fix['jurisdiction'])
    if goal != before:
        assert all(goal.get(k) == before.get(k) for k in set(goal) | set(before) if k != 'applicability')
        field_deltas.append({'goalId': goal['id'], 'field': 'applicability.jurisdiction', 'before': before['applicability']['jurisdiction'],
                             'after': goal['applicability']['jurisdiction'], 'wholeGoalDEENRequiresContainsImagesUnchanged': True})
assert len(field_deltas) == 2
canon_target = OUT / 'canonical504-two-precise-existing-target-source-jurisdictions.author-candidate.json'
write(canon_target, candidate_canon)
write(OUT / 'five-current-original-source-role-corrections-and-partners.author-candidate.json', {
    'schemaVersion': 1, 'partnerCorrections': patched_rows, 'THCourseDeltas': th_deltas,
    'mappingCandidateBindings': mapping_bindings, 'originalCanonical': bind(canon_path), 'candidateCanonical': bind(canon_target),
    'onlyTwoCanonicalFieldDeltas': field_deltas, 'oldGoalObjectsValueExactOutsideTwoApplicabilityFields': True,
    'allExistingGoalDEENScienceRequiresContainsAndImageBytesExact': True,
    'freshReviewGoalIds': [f['newPartnerGoalId'] for f in source_fixes],
    'currentNativeScopePageSourceAndPartnerContextReviewsPending': True,
    'sourceMetadataReviewedAliasesInvented': False, 'strictGain': 0, 'activeWrites': [], 'humanApproval': False})

plan = []
for r in b_entry['actual15SourceOperatorScopeHolds']:
    original_entry = original['entries'][r['entryIndex']]
    plan.append({'viewId': r['viewId'], 'familyGoalId': r['familyGoalId'], 'entryIndex': r['entryIndex'],
                 'genuineOriginalHeldDutyInputs': original_entry['wholeOriginalSourceDutiesAndPartnerContexts'],
                 'ownCandidatePhase': 'bounded_operative_source_view_candidate_under_current_review' if r['entryIndex'] in [6, 10, 24, 29, 30] else 'HOLD_not_yet_authored',
                 'exactRequiredWork': r['exactRemedy'], 'allOriginalDutiesAndPartnersRetained': True,
                 'scientificApproval': False})
for r in b_entry['retained7ExistingHolds']:
    original_entry = next(e for e in original['entries'] if e['viewId'] == r['viewId'] and e['wholeCanonicalFamily']['id'] == r['familyGoalId'])
    plan.append({'viewId': r['viewId'], 'familyGoalId': r['familyGoalId'],
                 'genuineOriginalHeldDutyInputs': original_entry['wholeOriginalSourceDutiesAndPartnerContexts'],
                 'ownCandidatePhase': 'HOLD_source_specific_companion_or_whole_operator_route_required',
                 'exactRequiredWork': 'Retain whole source/operator/course role and every partner. BY evaluation and HH own-research need precise routine source roles; MV precipitation applications, RP water analysis and TH experiment epistemic role have no established complete atomic content partner. TH practical device/burner work needs actual lab/safety child routes, not a generic descriptor exchange.',
                 'allOriginalDutiesAndPartnersRetained': True, 'scientificApproval': False})
assert len(plan) == 22
write(OUT / 'all-twenty-two-current-held-view-node-whole-source-and-operator-remediation-plan.json', {
    'schemaVersion': 1, 'genuineBFirstSealReferencedAfterItsActualSeal': bind(b_entry_path),
    'originalNeutralWhole35Inputs': bind(original_input_path), 'heldNodes': plan, 'actualHeldNodeCount': 22,
    'newBoundedCandidateNodes': 5, 'remainingAuthoredWorkHoldNodes': 17,
    'original13BoundedBReferenceRemovalResultsReusedUnchangedNotNewWholeApproval': b_entry['actual13BoundedSupportedRemovals'],
    'peerAOriginalReviewStillIndependent': True, 'sourceWholeApproval': False, 'newScientificClosures': 0,
    'restoredBindings': 0, 'strictGain': 0, 'activeWrites': [], 'humanApproval': False})
print(json.dumps({'newCandidatePartnerRows': 3, 'newTHColumnScopeCorrections': 2, 'oldSourceRowsDropped': 0,
                  'canonicalTextChanges': 0, 'twoSourceJurisdictionFieldCandidates': field_deltas,
                  'wholeHeldNodesPlanned': 22, 'actualBoundedCandidateNodes': 5,
                  'remainingHeldNodes': 17, 'independentRemediationReview': 'pending', 'strictGain': 0, 'activeWrites': 0}))
