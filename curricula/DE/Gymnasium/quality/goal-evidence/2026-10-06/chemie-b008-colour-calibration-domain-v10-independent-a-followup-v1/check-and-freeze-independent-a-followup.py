#!/usr/bin/env python3
"""Actual narrow literal checks and the separately authored scientific A follow-up."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
BASE = HERE.parent
AUTHOR = BASE / 'chemie-b008-colour-calibration-domain-targeted-author-v10'
PREVIOUS_AUTHOR = BASE / 'chemie-b008-targeted-material-corrections-author-v9'
PREVIOUS_REVIEW = BASE / 'chemie-b008-twelve-material-deltas-v9-independent-a-v1'
AF = AUTHOR / 'author-calibration-domain-v10.final.freeze.json'
RF = PREVIOUS_REVIEW / 'independent-a-v9-material-deltas.final.freeze.json'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def value_hash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def verify(record, base=ROOT):
    data = (base / record['path']).read_bytes()
    return len(data) == record['bytes'] and hashlib.sha256(data).hexdigest() == record['sha256']

def diff(before, after, pointer=''):
    if isinstance(before, dict) and isinstance(after, dict):
        assert before.keys() == after.keys()
        for key in before:
            yield from diff(before[key], after[key], pointer + '/' + key)
    elif isinstance(before, list) and isinstance(after, list):
        assert len(before) == len(after)
        for index, (left, right) in enumerate(zip(before, after)):
            yield from diff(left, right, pointer + '/' + str(index))
    elif before != after:
        yield {'JSONPointer': pointer, 'before': before, 'after': after}

def dump(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert bind(AF)['sha256'] == '4d87c6e7ab2ff360979f2ae410ae970258353b23f1506c69c0554e583e1ac347'
assert bind(RF)['sha256'] == 'eb2a9538b54e9ddb3ac0b4709049322786a603ff6be04e01c7f9b939104cc5a9'
author_freeze = read(AF)
review_freeze = read(RF)
assert all(verify(row, AUTHOR) for row in author_freeze['files'])
assert all(verify(row) for row in author_freeze['actualPriorInputs'])
assert all(verify(row) for row in review_freeze['ownFiles'])
previous_material = PREVIOUS_AUTHOR / 'fifty-two-cases.de-en.author-candidate.json'
current_material = AUTHOR / 'fifty-two-cases.de-en.author-candidate.json'
old, new = read(previous_material), read(current_material)
actual_diffs = list(diff(old, new))
case_diffs = [row for row in actual_diffs if row['JSONPointer'].startswith('/cases/')]
root_diffs = [row for row in actual_diffs if not row['JSONPointer'].startswith('/cases/')]
assert sorted(row['JSONPointer'] for row in case_diffs) == ['/cases/9/transfer/de', '/cases/9/transfer/en']
assert sorted(row['JSONPointer'] for row in root_diffs) == ['/artifactKind', '/author', '/authoredAtUTC']
assert all(old['cases'][index] == new['cases'][index] for index in range(52) if index != 9)
assert all(old['cases'][9][key] == new['cases'][9][key] for key in old['cases'][9] if key != 'transfer')
declared = read(AUTHOR / 'two-transfer-field-deltas.author.json')['literalChangedFields']
assert len(declared) == 2
for row, claim in zip(sorted(case_diffs, key=lambda row: row['JSONPointer']), sorted(declared, key=lambda row: row['field'])):
    assert row['before'] == claim['before'] and row['after'] == claim['after']
de, en = new['cases'][9]['transfer']['de'], new['cases'][9]['transfer']['en']
assert '0,410' not in de and '5,0 mg/L' not in de and '0.410' not in en and '5.0 mg/L' not in en
assert '0,490' in de and '0.490' in en
assert 'garantiert noch keinen' in de and 'does not yet guarantee' in en
assert 'neue tatsächliche In-Bereich-Messung' in de and 'new actual in-range reading' in en
assert 'Gesamtfaktor' in de and 'overall factor' in en
assert 'weder die ursprüngliche Konzentration noch der neue Messwert extrapoliert' in de
assert 'Neither original concentration nor the new reading is extrapolated' in en
assert .010 + .080 * 6 == .49
assert .81 > .49 and 20/10 == 2

prior_review = read(PREVIOUS_REVIEW / 'twelve-changed-cases-and-sixty-fields.independent-a.review.json')
inherited_cases = [row for row in prior_review['caseReviews'] if row['caseIndexZeroBased'] != 9]
inherited_case9_fields = [row for row in prior_review['changedFieldReviews'] if row['caseIndexZeroBased'] == 9 and row['decision'] == 'KEEP']
assert len(inherited_cases) == 11 and all(row['decision'] == 'KEEP' for row in inherited_cases)
assert len(inherited_case9_fields) == 8
v9_hash_reuse = read(PREVIOUS_REVIEW / 'literal-sixty-field-and-forty-case-hash-reuse.actual.json')
assert verify(v9_hash_reuse['unchangedProfileFile']) and verify(v9_hash_reuse['unchangedDescriptionFile'])
assert len(v9_hash_reuse['unchangedFortyCaseReuse']) == 40
active = v9_hash_reuse['activeInputPreservation']['checks']
assert len(active) == 19
active_checks = [{'previousExpected': row['expected'], 'actual': bind(ROOT / row['expected']['path']), 'exactToPrevious': verify(row['expected'])} for row in active]
active_deltas = [row for row in active_checks if not row['exactToPrevious']]
assert {row['previousExpected']['path'] for row in active_deltas} <= {
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
}, ('unexpected additional active input change', active_deltas)
active_exact_count = sum(row['exactToPrevious'] for row in active_checks)

common = {'schemaVersion': 1, 'reviewedAtUTC': datetime.now(timezone.utc).isoformat(),
          'reviewer': '/root/biology_q1_seven_visuals_independent_v',
          'role': 'actual independent machine reviewer A targeted v10 material follow-up',
          'authorOfChemistryV10': False, 'newPeerReviewBodiesRead': False,
          'nativeApproval': False, 'nativePositiveUnderstandingEvidenceV2Approval': False,
          'humanApproval': False, 'humanTrial': False, 'learnerPerformanceRecorded': False,
          'strictCompletionsAdded': 0, 'restoredActiveBindings': 0, 'activeWrites': 0}
reviews = []
for lang, text in [('de', de), ('en', en)]:
    reviews.append({'JSONPointer': '/cases/9/transfer/' + lang, 'language': lang, 'decision': 'KEEP',
                    'actuallyReadText': text, 'fieldValueSha256': value_hash(text),
                    'resolvedFindingId': 'A-V9-01',
                    'actualScientificFinding': 'The calibrated domain ends at concentration 6 mg/L / model absorbance 0.490. The 0.810 stimulus is explicitly excluded from undiluted concentration evaluation. Factor 2 is a trial with no guarantee of range entry; no new absorbance or concentration is predicted. A valid new actual reading and own valid calibration must support cdiluted before nominal factor-2 back-calculation. If the new reading remains outside the valid domain, another known dilution and the cumulative factor are required.',
                    'truthfulStatusFinding': 'Planning is distinguished from execution; authorization, actual volume log and actual readings remain future prerequisites. No fictional learner performance or completed measurement is asserted.',
                    'stillRequiredOutsideThisReview': 'Native real-UUID/page/context/source binding and separate independent review; local experiment authorization, human approval and actual trial remain separate.'})
dump('two-transfer-fields-and-finding-resolution.independent-a.actual.json', {
    **common, 'artifactKind': 'actual-two-field-scientific-followup-review',
    'authorInputFreeze': bind(AF), 'priorOwnReviewFreeze': bind(RF),
    'actualCurrentMaterial': bind(current_material), 'caseKey': new['cases'][9]['caseKey'],
    'candidateGoalId': None, 'actualFieldDecisions': reviews,
    'findingResolution': {'findingId': 'A-V9-01', 'status': 'resolved_for_exact_v10_transfer_de_en', 'decision': 'KEEP', 'newIndependentMaterialFindings': []},
    'twoFieldDecisionCounts': {'KEEP': 2, 'REVISE': 0, 'BLOCK': 0},
    'targetedTwelveCaseAReviewLineage': {'v9UnchangedCaseKEEPReused': 11, 'case9OtherEightChangedFieldKEEPReused': 8, 'case9NewTransferFieldKEEP': 2, 'allTwelveTargetedCaseMaterialDecisionsKEEPUnderExactLineage': True},
    'secondIndependentVerdictNotAsserted': True,
})
dump('actual-two-field-delta-and-inherited-bindings.check.json', {
    **common, 'artifactKind': 'actual-targeted-readonly-two-field-and-preservation-check',
    'checksPassed': True, 'actualChangedCaseLeafPointers': [row['JSONPointer'] for row in case_diffs],
    'actualRootMetadataOnlyPointers': [row['JSONPointer'] for row in root_diffs],
    'unchangedWholeCases': 51, 'changedWholeCases': 1,
    'allOtherChangedCaseFieldsExact': True, 'allV9AuthorInputsExact': True, 'allV9OwnReviewFilesExact': True,
    'inheritedElevenKEEPCaseBindings': [{'caseIndexZeroBased': row['caseIndexZeroBased'], 'caseKey': row['caseKey'], 'caseValueSha256': row['currentCaseValueSha256'], 'actualSameCaseValue': value_hash(new['cases'][row['caseIndexZeroBased']]) == row['currentCaseValueSha256']} for row in inherited_cases],
    'case9OtherEightFieldKEEPBindings': inherited_case9_fields,
    'fortyHistoricalUnchangedCasesTreatment': 'Exact reuse from v9 proof only; no repeated science review.',
    'twentySixProfilesDescriptionsTreatment': 'Exact file hash reuse from v9 proof only; no repeated content/profile review.',
    'unchangedProfileBinding': v9_hash_reuse['unchangedProfileFile'], 'unchangedDescriptionBinding': v9_hash_reuse['unchangedDescriptionFile'],
    'allCandidateGoalIdsRemainNull': all(case['candidateGoalId'] is None for case in new['cases']),
    'allCaseStatusesRemainAiCandidateNeedsHumanReview': all(case['status'] == 'ai_candidate' and case['reviewStatus'] == 'needs_human_review' for case in new['cases']),
    'activeNineteenInputBindingsActualComparison': active_checks,
    'activePriorBindingExactCount': active_exact_count,
    'observedParallelActiveIntegrationDeltas': active_deltas,
    'activeDeltaTreatment': 'Current registry and Biology-canonical changes occurred while the separate root integration continued. They are recorded as current observed bindings; historical v9 evidence is not rewritten. The author v9/v10 Chemistry materials, prior own v9 review files and unchanged profile/description inputs remain exact. This reviewer changed only the new own review package and does not claim all 19 historical active bindings remain current.',
    'ownCalculations': {'upperValidModelAbsorbance': .010 + .080 * 6, 'suppliedModelAbsorbance': .810, 'outsideValidDomain': True, 'nominalTrialDilutionFactor': 20/10, 'newAbsorbancePredicted': False, 'newConcentrationPredicted': False},
    'actualInputBindings': [bind(AF), bind(RF), bind(previous_material), bind(current_material), bind(AUTHOR / 'two-transfer-field-deltas.author.json'), bind(PREVIOUS_REVIEW / 'twelve-changed-cases-and-sixty-fields.independent-a.review.json'), bind(PREVIOUS_REVIEW / 'literal-sixty-field-and-forty-case-hash-reuse.actual.json')],
})
freeze_name = 'independent-a-v10-two-transfer-fields.final.freeze.json'
owned = [bind(path) for path in sorted(HERE.iterdir()) if path.is_file() and path.name != freeze_name]
dump(freeze_name, {**common, 'artifactKind': 'independent-machine-targeted-followup-freeze',
                  'status': 'actual_targeted_two_field_review_complete_KEEP', 'ownFiles': owned,
                  'authorInputFreeze': bind(AF), 'priorOwnReviewFreeze': bind(RF),
                  'reviewedChangedFields': 2, 'fieldKEEP': 2, 'fieldREVISE': 0,
                  'findingResolved': 'A-V9-01', 'ownTargetedUnresolvedFindings': [],
                  'newNativeGateCompletions': 0, 'secondIndependentReviewClaim': False,
                  'activePriorBindingExactCount': active_exact_count,
                  'observedParallelActiveDeltaCount': len(active_deltas)})
assert all(verify(row) for row in read(HERE / freeze_name)['ownFiles'])
assert all(row['actualSameCaseValue'] for row in read(HERE / 'actual-two-field-delta-and-inherited-bindings.check.json')['inheritedElevenKEEPCaseBindings'])
print(json.dumps({'freeze': bind(HERE / freeze_name), 'ownedFileCount': len(owned), 'fieldKEEP': 2, 'resolvedFindingId': 'A-V9-01', 'unchangedWholeCases': 51, 'activePriorBindingExactCount': active_exact_count, 'parallelActiveDeltaCount': len(active_deltas), 'strictAdded': 0}))
