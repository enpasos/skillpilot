# SPDX-License-Identifier: Apache-2.0
"""Read frozen public inputs; write only this reviewer's new actual evidence."""
import hashlib
import json
from datetime import datetime, timezone
from fractions import Fraction
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.parent / 'chemie-q3-three-BW-practical-terminal-route-author-candidate-v1'


def read(path):
    return json.loads((AUTHOR / path).read_text())


def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def page_map(model):
    return {p['goalId']: p for p in model['pages']}


binding = read('inputs/actual-start-bindings.json')
before = read('inputs/whole484-active-canonical.exact.json')
after = read('candidate/whole487-381-plus-three-practical-terminals.inactive.json')
old = {g['id']: g for g in before['goals']}
new = {g['id']: g for g in after['goals']}
assert len(old) == 484 and len(new) == 487
assert set(new) - set(old) == set(binding['assessmentGoalIds'])
assert not set(old) - set(new)
changed_old = [i for i in old if old[i] != new[i]]
assert changed_old == [binding['soleChangedExistingGoalId']]
cluster_id = changed_old[0]
changed_fields = sorted(k for k in set(old[cluster_id]) | set(new[cluster_id])
                        if old[cluster_id].get(k) != new[cluster_id].get(k))
assert changed_fields == ['applicability', 'contains']
assert new[cluster_id]['contains'] == old[cluster_id]['contains'] + binding['assessmentGoalIds']
assert old[cluster_id]['applicability'] == {'jurisdiction': ['DE-BY', 'DE-HE']}
assert new[cluster_id]['applicability'] == {'jurisdiction': ['DE-BW', 'DE-BY', 'DE-HE']}
assert {k: v for k, v in old[cluster_id].items() if k not in changed_fields} == {
    k: v for k, v in new[cluster_id].items() if k not in changed_fields}

kinds = read('candidate/whole487-381.semantic-kinds.inactive.json')
cur_ids = {d['goalId'] for d in kinds['decisions'] if d['semanticKind'] == 'curricularAtomic'}
assert len(cur_ids) == 381
assert all(old[i] == new[i] for i in cur_ids)
for i in binding['assessmentGoalIds']:
    d = next(d for d in kinds['decisions'] if d['goalId'] == i)
    assert d['semanticKind'] == 'practiceAssessment' and i not in cur_ids

protected = next(s for s in read('inputs/protected-177-baseline-current-and-strict-ID-sets.exact.json')['subjects']
                 if s['subject'] == 'chemie')['strictCompleteGoalIds']
assert len(protected) == 177 and all(old[i] == new[i] for i in protected)
bp = page_map(read('native/before381.actual-model.json'))
ap = page_map(read('native/after381.actual-model.json'))
assert set(bp) == set(ap) == cur_ids
changed_pages = [i for i in bp if bp[i] != ap[i]]
assert set(changed_pages) == set(binding['goalIds'])
page_deltas = []
for ordinary, endpoint in zip(binding['goalIds'], binding['assessmentGoalIds']):
    o, n = bp[ordinary], ap[ordinary]
    fields = sorted(k for k in set(o) | set(n) if o.get(k) != n.get(k))
    assert fields == ['externalReverseRequires', 'pageFingerprint']
    assert n['externalReverseRequires'][-1]['goalId'] == endpoint
    assert {k: v for k, v in o.items() if k not in fields} == {
        k: v for k, v in n.items() if k not in fields}
    page_deltas.append({'goalId': ordinary, 'newExternalPracticeGoalId': endpoint,
                        'changedFields': fields, 'beforePageFingerprint': o['pageFingerprint'],
                        'currentPageFingerprint': n['pageFingerprint']})
assert all(bp[i] == ap[i] for i in protected)

source = read('inputs/whole-BW126-current-source-extraction.exact.json')
mapping = read('inputs/whole-BW-current-active-source-mapping.exact.json')
frame = read('inputs/whole-BW126-source220-and-all-partner-bodies.exact.json')
assert source == frame['sourceExtraction'] and mapping == frame['wholeSourceMapping']
assert len(source['sourceGoals']) == 126 and len(source['passages']) == 13
assert len(mapping['mappings']) == 220 and len(mapping['decisions']) == 126
assert len(frame['wholeCurrentPartnerBodies']) == 100
assert all(new[g['id']] == g for g in frame['wholeCurrentPartnerBodies'])
partial = [m for m in mapping['mappings'] if m['canonicalGoalId'] == binding['goalIds'][0]]
assert partial and all(m['matchType'] == 'partial' for m in partial)
assert all(not any(m['canonicalGoalId'] == i for m in mapping['mappings'])
           for i in binding['assessmentGoalIds'])

pairs = read('tasks/whole-three-task-and-original-case-pairings.author.json')
assert len(pairs) == 3
tasks = []
for pair, ordinary, endpoint in zip(pairs, binding['goalIds'], binding['assessmentGoalIds']):
    g = pair['wholeAssessmentCandidate']
    assert g == new[endpoint]
    assert pair['assessmentGoalId'] == endpoint and pair['ordinaryCoveredGoalId'] == ordinary
    assert g['requires'] == g['examData']['coveredGoalIds'] == [ordinary]
    assert g['extendedData']['applicabilityFromRequires'] is True
    assert g['applicability'] == {'jurisdiction': ['DE-BW']}
    assert g['examData']['reviewStatus'] == 'needs_review'
    assert pair['wholeSourceCase']['goalId'] == ordinary
    assert pair['wholeSourceCase']['actualStudentPerformance'] is False
    assert pair['wholeSourceCase']['humanApproval'] is False
    for k in ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn']:
        assert len(g['examData'][k]) > 1000
    scoring = g['examData']['scoring']
    assert scoring['maxPoints'] == scoring['passingPoints'] == 10
    assert len(scoring['steps']) == 5
    assert [s['points'] for s in scoring['steps']] == [2] * 5
    assert all('Tatsächlich überprüfbare praktische Leistung' in s['description']
               for s in scoring['steps'][:2])
    tasks.append({'assessmentGoalId': endpoint, 'coveredOrdinaryGoalId': ordinary,
                  'wholeBilingualTaskAndSolutionPresent': True, 'passingPoints': 10,
                  'maximumWithoutBothMandatoryPracticalCriteria': 6,
                  'candidateStatus': 'needs_review', 'actualLearnerPerformanceClaimed': False})

# Independent finite reconstruction of every supplied ideal exchange row.
rows = pairs[1]['wholeSourceCase']['syntheticData']['idealModelRounds']
A, B = Fraction(90), Fraction(0)
recomputed, max_error = [], 0.0
for row in rows:
    if row['round'] == 0:
        expected = {'A_mL': float(A), 'B_mL': float(B)}
    else:
        forward, reverse = A / 3, B / 6
        A, B = A - forward + reverse, B + forward - reverse
        expected = {'A_mL': float(A), 'B_mL': float(B),
                    'forward_mL': float(forward), 'reverse_mL': float(reverse)}
    assert A + B == 90
    errors = {k: abs(row[k] - v) for k, v in expected.items()}
    max_error = max(max_error, *errors.values())
    assert max(errors.values()) <= 0.00000051
    recomputed.append({'round': row['round'], **expected, 'roundingErrors': errors})
assert len(recomputed) == 13
stationary_A = Fraction(90, 3)
stationary_B = Fraction(90) - stationary_A
assert stationary_A / 3 == stationary_B / 6 == 10
# Deliberately changed sequential transfer: reverse uses B AFTER forward.
sequential_A1 = Fraction(90) - Fraction(90, 3) + Fraction(90, 3) / 6
sequential_B1 = 90 - sequential_A1
sequential_stationary_A = Fraction(90) * Fraction(3, 8)
assert sequential_A1 == 65 and sequential_B1 == 25
assert sequential_stationary_A == Fraction(135, 4)

volt = pairs[2]['wholeSourceCase']['syntheticData']
voltage_values = [Fraction(str(x)) for x in volt['readingsV']]
mean = sum(voltage_values) / len(voltage_values)
spread = max(voltage_values) - min(voltage_values)
delta = abs(mean - Fraction(str(volt['conditionReferenceV'])))
tolerance = Fraction(str(volt['comparisonToleranceV']))
assert mean == Fraction(3253, 3000) and spread == Fraction(4, 1000)
assert delta < tolerance
carrier_expected_absorbance = Fraction(3, 10) * Fraction(5) / Fraction(51, 10)
carrier_supplied = pairs[0]['wholeSourceCase']['syntheticData']['blankCorrectedAbsorbance']['K30_60_90s']
assert all(abs(float(carrier_expected_absorbance) - x) < 0.0002 for x in carrier_supplied)

receipt = {
    'schemaVersion': 1, 'checkedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Independent actual frozen-input comparison and finite reconstruction; not scientific approval from hashes',
    'authorEntry': {'path': str((AUTHOR / 'neutral-three-BW-practical-terminal-current-native.independent-review.entry.json').relative_to(ROOT)),
                    'sha256': sha(AUTHOR / 'neutral-three-BW-practical-terminal-current-native.independent-review.entry.json')},
    'wholeBeforeNodeCount': 484, 'wholeCandidateNodeCount': 487,
    'actualOldChangedNodeId': cluster_id, 'actualOldChangedFields': changed_fields,
    'actualClusterJurisdictionDelta': {'before': ['DE-BY', 'DE-HE'], 'after': ['DE-BW', 'DE-BY', 'DE-HE']},
    'existingWhole483NodesExact': True, 'whole381CurricularBodiesExact': True,
    'whole177ProtectedBodiesExact': True, 'whole177CrossStagePagesExact': True,
    'whole378OtherNativePagesExact': True, 'currentThreeNativePageDeltas': page_deltas,
    'originalSourceDuties': 126, 'originalSourcePassages': 13, 'originalCurrentMappingEdges': 220,
    'wholePartnerBodyCount': 100, 'SOURCE002ConcentrationContributionRemainsPartial': True,
    'newAssessmentRequiresAreNotSourceMappingEdges': True,
    'wholeTasks': tasks,
    'finiteReconstruction': {
        'all13ExchangeRows': recomputed, 'maximumSixDecimalRoundingError_mL': max_error,
        'simultaneousStationaryAmounts_mL': [float(stationary_A), float(stationary_B)],
        'simultaneousStationaryOpposedTransfers_mL': [10, 10],
        'wrongSequentialFirstRound_mL': [float(sequential_A1), float(sequential_B1)],
        'wrongSequentialStationaryAmounts_mL': [float(sequential_stationary_A), float(90-sequential_stationary_A)],
        'galvanicMeanV': float(mean), 'galvanicRangeV': float(spread),
        'galvanicReferenceDifferenceV': float(delta), 'suppliedConditionToleranceV': float(tolerance),
        'carrierOnlyVolumeDilutionAbsorbance': float(carrier_expected_absorbance),
        'syntheticValuesAreNotActualPracticalPerformance': True,
    },
    'peerCurrentJudgmentsRead': False, 'activeWrites': 0, 'wholeM7OrProtectedFloorPassClaimed': False,
}
(OWN / 'current-whole-candidate-and-finite-data.independent.actual.json').write_text(
    json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'check': 'PASS', 'actualOldClusterChangedFields': changed_fields,
                  'protectedBodies': 177, 'ordinaryBodies': 381, 'ordinaryPagesExact': 378,
                  'syntheticExchangeRowsRecomputed': 13, 'threeWholeTasksChecked': 3}))
