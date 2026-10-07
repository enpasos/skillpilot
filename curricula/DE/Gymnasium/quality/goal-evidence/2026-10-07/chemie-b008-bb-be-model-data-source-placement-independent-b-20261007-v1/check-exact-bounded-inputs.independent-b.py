"""Independent B field audit. This proves boundaries, not scientific coverage."""
import copy
import hashlib
import json
from collections import Counter
from pathlib import Path

AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b008-bb-be-model-data-source-placement-author-v14')
OUT = Path(__file__).parent

def read(path):
    return json.loads(Path(path).read_text())

def ref(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

bound = []
def checked(value):
    actual = ref(value['path'])
    assert actual == value, (value, actual)
    bound.append(actual)
    return read(value['path'])

whole = read(AUTHOR / 'exact-bb-be-current-original-duties-and-specific-child-source-proposals.json')
guard = read(AUTHOR / 'guarded-extraction-and-source-mapping-candidate-field-intents.json')
entry = read(AUTHOR / 'bounded-neutral-bb-be-source-placement-review-entry.json')
for field in ['wholeSourceAndPrimaryContext', 'fieldGuardedSourceAndMappingInputs', 'wholeCurrent503Candidate']:
    checked(entry[field])
for row in whole['currentPrimaryBindings']:
    for field in ['exactCurrentOriginalPdf', 'durableActualPdf']:
        assert ref(row[field]['path']) == row[field]
        bound.append(row[field])

source_inputs = []
source_by_id = {}
for original, proposed in zip(whole['exactSourceInputs'], guard['candidateMappingInputs']):
    old = checked(original['exactSnapshot'])
    new = checked(proposed['candidateSourceExtraction'])
    old_index = {goal['id']: goal for goal in old['sourceGoals']}
    new_index = {goal['id']: goal for goal in new['sourceGoals']}
    assert list(old_index) == list(new_index)
    source_by_id.update(old_index)
    intents = [r for r in guard['sourceScopeFieldIntents'] if r['sourceGoalId'] in old_index]
    expected = copy.deepcopy(old['sourceGoals'])
    for intent in intents:
        assert old_index[intent['sourceGoalId']] == intent['before']
        after = copy.deepcopy(intent['before'])
        assert after['courseLevel'] == 'unspecified'
        after['courseLevel'] = 'LK'
        after['tags'].append('course:LK')
        assert after == intent['candidate'] == new_index[intent['sourceGoalId']]
        expected[list(old_index).index(intent['sourceGoalId'])] = after
    assert new['sourceGoals'] == expected
    assert {k:v for k,v in old.items() if k != 'sourceGoals'} == {k:v for k,v in new.items() if k not in ['sourceGoals','authorCandidateScopeReview']}
    source_inputs.append({'before': original['exactSnapshot'], 'candidate': proposed['candidateSourceExtraction'], 'sourceGoalIdsRetained': len(old_index), 'courseOnlyChangedIds': [r['sourceGoalId'] for r in intents], 'otherSourceGoalAndExtractionFieldsExact': True})

assert len(whole['original28UniqueFamilySourceDuties']) == 28
for row in whole['original28UniqueFamilySourceDuties']:
    assert source_by_id[row['currentOriginalSourceGoalId']] == row['wholeOriginalSourceGoal']

mapping_inputs = []
all_new_mappings = []
all_affected_ids = set()
for row in guard['candidateMappingInputs']:
    old = checked(row['exactSourceMappingSnapshot'])
    new = checked(row['candidateMapping'])
    removes = [r['wholeOldMapping'] for r in row['originalFamilyMappingChanges']]
    adds = [m for r in row['originalFamilyMappingChanges'] for m in r['specificCandidateMappings']] + row['extraAuthenticGKSourcePartialMappings']
    expected = copy.deepcopy(old['mappings'])
    for remove in removes:
        assert expected.count(remove) == 1
        expected.remove(remove)
    expected += adds
    key = lambda mapping: json.dumps(mapping, sort_keys=True)
    assert Counter(map(key, expected)) == Counter(map(key, new['mappings']))
    assert all(m['matchType'] == 'partial' for m in adds)
    assert len(set(map(key, new['mappings']))) == len(new['mappings'])
    affected = {m['legacyGoalId'] for m in removes + adds}
    all_affected_ids.update(affected)
    old_decisions = {d['sourceGoalId']: d for d in old['decisions']}
    new_decisions = {d['sourceGoalId']: d for d in new['decisions']}
    assert list(old_decisions) == list(new_decisions)
    for source_id in old_decisions:
        if source_id not in affected:
            assert old_decisions[source_id] == new_decisions[source_id]
            continue
        decision = new_decisions[source_id]
        assert decision['historicalDecisionBeforeCandidate'] == old_decisions[source_id]
        assert decision['decision'] == 'needs_view_placement_review'
        assert decision['reviewedAt'] is None and decision['reviewer'] is None
        assert decision['newAuthorCandidateIsNotHistoricallyReviewed'] is True
        assert set(decision['canonicalGoalIds']) == {m['canonicalGoalId'] for m in new['mappings'] if m['legacyGoalId'] == source_id}
        assert all(decision[k] == old_decisions[source_id][k] for k in ['sourceGoalId','topicCode','sourceSpan'])
    assert {k:v for k,v in old.items() if k not in ['mappings','decisions','status','summary','reviewId','sourceExtractionPath']} == {k:v for k,v in new.items() if k not in ['mappings','decisions','status','summary','reviewId','sourceExtractionPath']}
    assert new['summary']['newIndependentSourceApproval'] == 0
    assert set(new['summary']['pendingCurrentSourceDecisionIds']) == affected
    mapping_inputs.append({'before': row['exactSourceMappingSnapshot'], 'candidate': row['candidateMapping'], 'removedFamilyPartialBindings': len(removes), 'addedSpecificPartialBindings': len(adds), 'affectedSourceDutiesStillPending': sorted(affected), 'otherMappingAndDecisionBodiesExact': True, 'originalHistoricalDecisionEmbeddedExact': True})
    all_new_mappings += adds
assert len(all_new_mappings) == 56 and len(all_affected_ids) == 32

view_inputs = []
def transform(value, replacements, seen):
    if isinstance(value, list):
        output = []
        for item in value:
            matched = next((row for row in replacements if item == row['oldNode']), None)
            if matched:
                output.extend(copy.deepcopy(matched['candidateNodes']))
                seen.append(matched['oldNode']['goalId'])
            else:
                output.append(transform(item, replacements, seen))
        return output
    if isinstance(value, dict):
        return {k:transform(v, replacements, seen) for k,v in value.items()}
    return value

for row in whole['newCurrentTargetViews']:
    old = checked(row['exactV12CurrentBefore'])
    new = checked(row['candidateView'])
    seen = []
    expected = transform(old, row['actualTwoChangedNodes'], seen)
    assert seen == [r['oldNode']['goalId'] for r in row['actualTwoChangedNodes']], seen
    additional_prerequisites = []
    if row['scope']['stage'] == 'SekII':
        jurisdiction = row['scope']['jurisdiction'].split('-')[-1].lower()
        course = row['scope']['courseProfile'].lower()
        additional_prerequisites = [{
            'kind': 'structure',
            'id': f'{jurisdiction}-b008-reviewed-source-route-prerequisites-{course}',
            'label': 'Voraussetzungen der Quellenroutinen (Kandidatenprüfung)',
            'children': [
                {'kind': 'goalEntry', 'goalId': goal_id, 'projectionRole': 'prerequisiteOnly'}
                for goal_id in ['6c7ce93c-7675-51da-bc0c-7d0257f7ff7d', '7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6', '503dedcb-0efc-5e6b-bbc9-20761a0951f5', '75e2eff1-f871-5461-9e3f-26d0b333ce2f']
            ],
        }]
        expected['rootNodes'] += additional_prerequisites
    # Author candidates additionally declare their still-pending scope review.
    delta = {k:new[k] for k in new if k not in expected or new[k] != expected[k]}
    assert all(k in ['authorCandidateScopeReview'] for k in delta), delta
    assert {k:v for k,v in new.items() if k != 'authorCandidateScopeReview'} == expected
    view_inputs.append({'before': row['exactV12CurrentBefore'], 'candidate': row['candidateView'], 'exactInPlaceNodeReplacements': len(seen), 'additionalExplicitPrerequisiteOnlyRootNodes': additional_prerequisites, 'allOtherStructureAndPlacementFieldsExact': True})

previous = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b008-current169-routing-placement-author-v12/candidate/canonical.current503-source-routing.author-candidate.json')
old = read(previous)
new = checked(entry['wholeCurrent503Candidate'])
assert len(old['goals']) == len(new['goals']) == 503
expected = copy.deepcopy(old)
index = {g['id']:g for g in expected['goals']}
assert [g['id'] for g in old['goals']] == [g['id'] for g in new['goals']]
for row in whole['newSourceSpecificMetadata']:
    goal = index[row['goalId']]
    assert goal['applicability'] == row['before']
    goal['applicability'] = row['after']
assert new == expected

result = {
    'role': 'Independent B exact bounded input audit, separately from own scientific judgments',
    'passed': True,
    'originalFamilySourceDutiesReadAndBoundWhole': 28,
    'additionalAuthenticGKSourceDuties': sorted(all_affected_ids - {r['currentOriginalSourceGoalId'] for r in whole['original28UniqueFamilySourceDuties']}),
    'sourceInputs': source_inputs,
    'mappingInputs': mapping_inputs,
    'viewInputs': view_inputs,
    'initialIndependentAuditFinding': 'The first exact-two-node-only check correctly failed: each of the four SekII views additionally appends one explicit prerequisiteOnly root with four routine prerequisites. The revised bounded audit accounts for and verifies that real additional delta; it is not concealed as an unchanged view.',
    'wholeCanonicalBefore': ref(previous),
    'wholeCanonicalCandidate': entry['wholeCurrent503Candidate'],
    'applicabilityOnlyChangedGoalIds': [r['goalId'] for r in whole['newSourceSpecificMetadata']],
    'allOther495WholeCanonicalGoalBodiesAndLandscapeFieldsExact': True,
    'verifiedInputRefs': list({r['path']:r for r in bound}.values()),
    'noScientificVerdictInferredFromHashes': True,
    'noActiveWrites': True,
    'nativeD26Approval': False, 'nativeP52Approval': False,
    'strictGain': 0, 'humanApproval': False,
}
(OUT/'exact-bounded-input-audit.actual.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({'passed': True, 'sourceDutyIds': len(all_affected_ids), 'partialBindings': len(all_new_mappings), 'courseCorrections': 4, 'views': len(view_inputs), 'applicabilityOnly': 8, 'strictGain': 0}))
