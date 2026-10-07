#!/usr/bin/env python3
"""Targeted author consistency checks; not independent scientific approval."""
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'AGENTS.md').is_file())
BASE = HERE.parent / 'chemie-b008-twenty-six-positive-materials-author-v8'
old = json.loads((BASE / 'fifty-two-cases.de-en.author-candidate.json').read_text())
new = json.loads((HERE / 'fifty-two-cases.de-en.author-candidate.json').read_text())
delta = json.loads((HERE / 'literal-field-delta-and-finding-response.author.json').read_text())
routing = json.loads((HERE / 'actual-profile-to-v9-material-review-routing.json').read_text())
profiles = json.loads((BASE / 'twenty-six-positive-profiles.de-en.author-candidate.json').read_text())['profiles']
checks = []

def check(name, ok, evidence):
    checks.append({'name': name, 'passed': bool(ok), 'evidence': evidence})

def verify(b):
    data = (ROOT / b['path']).read_bytes()
    return len(data) == b['bytes'] and hashlib.sha256(data).hexdigest() == b['sha256']

check('exact_old_and_new_case_and_profile_bindings',
      all(verify(b) for b in [delta['sourceFile'], delta['correctedFile'], routing['unchangedV8ProfilesFile'], routing['assessmentMaterialOverrideForThisReviewOnly']]),
      'Case/profile/routing inputs resolve to actual exact bytes.')
historic = []
for directory, name in [
        ('chemie-b008-twenty-six-positive-materials-author-v8', 'author-materials-v8.final.freeze.json'),
        ('chemie-b008-fifty-two-materials-v8-independent-a-v1', 'independent-a.v8-materials.complete.final.freeze.json'),
        ('chemie-b008-fifty-two-materials-v8-independent-b-v1', 'independent-b-v8-materials.final.freeze.json')]:
    freeze = json.loads((HERE.parent / directory / name).read_text())
    # Historical review freezes have different container field names; only exact listed byte records count.
    def records(value):
        if isinstance(value, dict):
            if all(k in value for k in ['path', 'sha256', 'bytes']):
                yield value
            else:
                for item in value.values():
                    yield from records(item)
        elif isinstance(value, list):
            for item in value:
                yield from records(item)
    found = list(records(freeze))
    outcomes = [{'path': b['path'], 'exact': verify(b)} for b in found]
    historic.append({'freeze': str((HERE.parent / directory / name).relative_to(ROOT)), 'bindingCount': len(found), 'allExact': all(x['exact'] for x in outcomes)})
check('v8_author_and_both_independent_freezes_preserved', all(h['bindingCount'] and h['allExact'] for h in historic), historic)

def leaves(a, b, path=''):
    if isinstance(a, dict) and isinstance(b, dict) and a.keys() == b.keys():
        for k in a:
            yield from leaves(a[k], b[k], path + '/' + k)
    elif isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        for i, (av, bv) in enumerate(zip(a, b)):
            yield from leaves(av, bv, path + '/' + str(i))
    elif a != b:
        yield {'JSONPointer': path, 'before': a, 'after': b}

diff = list(leaves(old, new))
material_diff = [x for x in diff if x['JSONPointer'].startswith('/cases/')]
declared = [{k: c[k] for k in ['JSONPointer', 'before', 'after']} for c in delta['corrections']]
check('no_undeclared_material_changes', sorted(material_diff, key=lambda x: x['JSONPointer']) == sorted(declared, key=lambda x: x['JSONPointer']), len(material_diff))
check('only_two_root_metadata_changes', sorted(x['JSONPointer'] for x in diff if not x['JSONPointer'].startswith('/cases/')) == ['/artifactKind', '/authoredAtUTC'], 'All other root fields preserved.')
affected = [i for i, (a, b) in enumerate(zip(old['cases'], new['cases'])) if a != b]
check('twelve_targeted_cases_forty_preserved', affected == [4, 6, 7, 8, 9, 10, 13, 16, 17, 43, 44, 45], affected)
check('52_cases_26_profiles_173_criteria_14_protocols', len(new['cases']) == 52 and len(profiles) == 26 and sum(len(c['requiredAssessmentCriteria']) for c in new['cases']) == 173 and sum('moderatorProtocol' in c for c in new['cases']) == 14, 'Counts retain the v8 universe.')
check('all_case_and_criterion_identifiers_retained',
      all(a['caseKey'] == b['caseKey'] and a['candidateKey'] == b['candidateKey'] and [c['criterionKey'] for c in a['requiredAssessmentCriteria']] == [c['criterionKey'] for c in b['requiredAssessmentCriteria']] for a, b in zip(old['cases'], new['cases'])), 'No replacement/deletion/invented goal IDs.')
check('candidate_and_execution_status_truthful',
      all(c['candidateGoalId'] is None and c['status'] == 'ai_candidate' and c['reviewStatus'] == 'needs_human_review' and c['evidenceLevel'] == 'E1' and c['generationLevel'] == 'G1' and not c['learnerPerformanceRecorded'] and not c['nativeEvidenceApproved'] and not c['humanApproval'] and not c['humanTrial'] for c in new['cases']) and all(not c.get('moderatorProtocol', {}).get('performedNow', False) for c in new['cases']), 'No author correction is asserted to be actual execution, native approval or human acceptance.')
check('descriptions_essential_contexts_and_profiles_not_rewritten', len(routing['profiles']) == 26 and all(r['candidateKey'] == p['candidateKey'] and r['goalId'] is None and r['caseKeys'] == p['caseKeys'] and r['literalDescriptionBindingSha256'] == hashlib.sha256(json.dumps(p['descriptionBindingCandidate'], ensure_ascii=False, sort_keys=True).encode()).hexdigest() for r, p in zip(routing['profiles'], profiles)), 'Unchanged exact v8 profiles are external inputs; only this review material routing is new.')
findings = sorted({f for c in delta['corrections'] for f in c['findingIds']})
check('all_A_B_finding_groups_addressed_pending_followups', findings == ['A-V8-01', 'A-V8-02', 'A-V8-03', 'A-V8-04', 'A-V8-05', 'B-v8-01', 'B-v8-02', 'B-v8-03'] and all(c['independentResolutionStatus'] == 'pending_targeted_followups' for c in delta['corrections']), findings)
check('all_six_physical_cases_have_parity_of_material_and_protocol_setup', all(new['cases'][i]['suppliedMaterial'] == new['cases'][i]['moderatorProtocol']['setupAndModeratorPreparation'] for i in [4, 5, 6, 7, 8, 9]), 'Supplied actual future setup equals its preparation text in DE/EN.')

numbers = {'seriesConcentration_g_L': [0, 0.5, 1, 1.5], 'seriesConductivity_uS_cm': [3, 1020, 1990, 2950],
           'blankUnchanged_uS_cm': 3, 'sucroseUnchanged_uS_cm': 4,
           'A20_uS_cm': 1800, 'B35_uS_cm': 2300, 'A35_uS_cm': 2298,
           'unmatchedDifference_uS_cm': 2300-1800, 'matchedDifference_uS_cm': 2300-2298,
           'roughRepeatScatterUnchanged_uS_cm': 3,
           'A20to35EffectiveRelativePerDegree': (2298/1800-1)/15,
           'NaClStandardSolutionEnthalpy_kJ_mol': 1.566 * 8.314462618 * 298.15 / 1000,
           'nominalDilutionFactor': 20/10,
           'worstCaseVolumeRatioLow': (20-0.02)/(10+0.02),
           'worstCaseVolumeRatioHigh': (20+0.02)/(10-0.02),
           'modelDilutedConcentration_mg_L': 5,
           'modelDilutedAbsorbance': 0.010 + 0.080*5,
           'referenceTitrationConcentrations_mol_L': [0.0100*8/10, 0.0100*16/10]}
check('corrected_conductivity_model_consistent', all('1800/2300' in new['cases'][43]['suppliedMaterial'][lang] and '2298' in new['cases'][17]['suppliedMaterial'][lang] and '2298' in new['cases'][43]['suppliedMaterial'][lang] and '±3' in new['cases'][17]['suppliedMaterial'][lang] for lang in ['de', 'en']) and numbers['matchedDifference_uS_cm'] <= numbers['roughRepeatScatterUnchanged_uS_cm'], numbers)
check('corrected_500_difference_recomputed_in_both_answers', '500-µS/cm-Differenz' in new['cases'][17]['expectedAnswer']['de'] and '500-µS/cm difference' in new['cases'][17]['expectedAnswer']['en'], 500)
check('bounded_NaCl_heat_uptake_positive_primary_anchor', numbers['NaClStandardSolutionEnthalpy_kJ_mol'] > 0 and 'Wärmeaufnahme' in new['cases'][44]['transfer']['de'] and 'heat uptake' in new['cases'][44]['transfer']['en'], numbers['NaClStandardSolutionEnthalpy_kJ_mol'])
check('twofold_volume_ratio_and_in_range_transfer', math.isclose(numbers['modelDilutedAbsorbance'], .410) and numbers['worstCaseVolumeRatioLow'] < 2 < numbers['worstCaseVolumeRatioHigh'] and '20,00' in new['cases'][9]['suppliedMaterial']['de'] and '20.00' in new['cases'][9]['suppliedMaterial']['en'], 'Labels/tolerances are error limits, not statistical uncertainties; synthetic A.410 is not an actual reading.')
check('R2_is_new_fictional_documentation_not_retrospective_or_own_measurement', 'fiktiv' in new['cases'][10]['transfer']['de'] and 'neuer unabhängiger Ansatz W3' in new['cases'][10]['transfer']['de'] and 'fictional' in new['cases'][10]['transfer']['en'] and new['cases'][10]['suppliedMaterial'] == old['cases'][10]['suppliedMaterial'] and new['cases'][10]['expectedAnswer'] == old['cases'][10]['expectedAnswer'], 'R1 and its four rows/date gap remain intact; no impossible actual measurement of old fictional samples.')
active_manifest = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
active = json.loads(active_manifest.read_text())['currentInputs']
active_bindings = list(active.values()) if isinstance(active, dict) else active
check('19_actual_current_active_bindings_unchanged', len(active_bindings) == 19 and all(verify(b) for b in active_bindings), {'bindingCount': len(active_bindings), 'scope': 'central registry, ledger, canons, floors and exact integration inputs; no new full build or central rerun claimed'})
result = {'schemaVersion': 1, 'role': 'targeted author consistency/calculation verification',
          'actualRunAtUTC': datetime.now(timezone.utc).isoformat(), 'independentApproval': False,
          'passed': all(c['passed'] for c in checks), 'checkCount': len(checks),
          'checks': checks, 'calculations': numbers, 'historicalFreezes': historic,
          'strictCompletionsAdded': 0, 'restoredActiveBindings': 0, 'activeWrites': 0,
          'humanApproval': False, 'humanTrial': False}
(HERE / 'actual-targeted-author-checks-and-calculations.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'passed': result['passed'], 'checkCount': len(checks), 'failedChecks': [c['name'] for c in checks if not c['passed']]}))
raise SystemExit(0 if result['passed'] else 1)
