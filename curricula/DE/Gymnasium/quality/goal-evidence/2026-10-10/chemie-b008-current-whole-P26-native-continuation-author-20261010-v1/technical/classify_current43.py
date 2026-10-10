# SPDX-License-Identifier: Apache-2.0
"""Classify exact unchanged-assertion source membership, without source approval."""
from pathlib import Path
import hashlib
import json
import shutil

R = Path.cwd()
P = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
def read(q): return json.loads((R / q).read_text())
def ref(q):
    b = (R / q).read_bytes()
    return {'path': str(q), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
def put(q, body):
    assert q.is_relative_to(P)
    (R / q).parent.mkdir(parents=True, exist_ok=True)
    (R / q).write_text(json.dumps(body, ensure_ascii=False, indent=2) + '\n')

original_receipt = Path('app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json')
own_receipt = P / 'source/current-active381-362-source-projection.receipt.exact.json'
shutil.copyfile(R / original_receipt, R / own_receipt)
old = read(own_receipt)
observed = read(P / 'checks/actual-normal-source-union-before-unchanged-failing-count-assertion.observed.json')
before_model = read(P / 'native/before-whole-normal-book-model.actual.json')
after_model = read(P / 'native/after-whole-normal-book-model.actual.json')
before_atoms = {x['goalId'] for x in before_model['pages']}
after_atoms = {x['goalId'] for x in after_model['pages']}
old_union = set().union(*(set(x['goalIds']) for x in old['scopes']))
new_union = set(observed['actualSourceUnionGoalIds'])
retained_families_now_area = before_atoms - after_atoms
new_children = after_atoms - before_atoms
old_omitted = {x['goalId'] for x in old['omittedGoals']}
omitted = {x['goalId'] for x in observed['wholeOmittedGoalBodies']}
assert len(before_atoms) == 381 and len(after_atoms) == 398
assert len(old_union) == 362 and len(new_union) == 355
assert len(retained_families_now_area) == 7 and len(new_children) == 24
assert new_union == old_union - retained_families_now_area
assert len(old_omitted) == 19 and len(omitted) == 43
assert omitted == old_omitted | new_children
assert not old_omitted.intersection(new_children)
assert observed['actualUnresolvedScopeCount'] == old['counts']['unresolvedSourceScopeDecisions'] == 496
goals = {x['id']: x for x in read(P / 'candidate/current-whole511-398-B008.inactive.json')['goals']}
before_goals = {x['id']: x for x in read(P / 'inputs/current-whole-active-canonical.exact.json')['goals']}
parents = {id_: [] for id_ in goals}
landscape_id = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
for node in goals.values():
    for child in node.get('contains', []):
        child = child.replace(landscape_id + ':', '')
        parents[child].append(node['id'])
index = read(P / 'source/whole-current-source-documents-extractions-partners-and-holds.actual-index.json')
targets = retained_families_now_area | old_omitted
partners = {id_: [] for id_ in targets}
for pair in index['wholeCurrentMappingExtractionPairs']:
    map_ref = pair['wholeCurrentMapping']['ownExactCopy']
    source_ref = pair['wholeCurrentExtraction']['ownExactCopy']
    mapping = read(Path(map_ref['path']))
    extraction = read(Path(source_ref['path']))
    sources = {x['id']: x for x in extraction['sourceGoals']}
    passages = extraction.get('passages', [])
    if isinstance(passages, dict): passage_by_id = passages
    else: passage_by_id = {x.get('id', x.get('passageId')): x for x in passages}
    decisions = mapping.get('decisions', [])
    for edge in mapping['mappings']:
        target = edge['canonicalGoalId'].replace(landscape_id + ':', '')
        if target not in targets: continue
        source_id = edge['legacyGoalId'].replace(mapping['sourceLandscapeId'] + ':', '')
        whole_source = sources[source_id]
        partners[target].append({'wholeCurrentMappingFile': map_ref, 'wholeCurrentExtractionFile': source_ref, 'wholeOriginalMappingPartnerEdge': edge, 'wholeOriginalSourceBody': whole_source, 'wholeOriginalPassageBodyIfProvided': passage_by_id.get(whole_source.get('passageId')), 'wholeAssociatedOperativeDecisionBodies': [x for x in decisions if x.get('id') == edge.get('reviewDecisionId') or x.get('decisionId') == edge.get('reviewDecisionId') or x.get('legacyGoalId') == edge.get('legacyGoalId') or x.get('sourceGoalId') == edge.get('legacyGoalId')], 'mappingToRetainedAreaIsNotNewChildSourceApproval': True})
family_frames = [{'retainedOriginalGoalId': id_, 'wholePreviousAtomicFamilyBody': before_goals[id_], 'wholeCurrentRetainedAreaBody': goals[id_], 'wholeCurrentDeclaredChildIds': goals[id_].get('contains', []), 'wholeExistingDirectOriginalSourcePartners': partners[id_], 'oldBroadANDMappingIsNotNewChildCoverage': True} for id_ in sorted(retained_families_now_area)]
family_path = P / 'source/whole-seven-retained-families-and-existing-original-source-partner-frames.actual.json'
put(family_path, {'schemaVersion': 1, 'role': 'Exact whole original direct family partner bodies; no inherited or newly reviewed child evidence', 'wholeFamilies': family_frames, 'allOriginal1646DutiesAlsoBoundWhole': ref(P / 'inputs/whole-original1646-B008-source-duty-inventory.exact.json'), 'newSourceJudgments': 0, 'humanApproval': False, 'strictGain': 0})
rows = []
for record in observed['wholeOmittedGoalBodies']:
    id_ = record['goalId']
    family_ids = [parent for parent in parents[id_] if parent in retained_families_now_area]
    assert (len(family_ids) >= 1) if id_ in new_children else True
    rows.append({'goalId': id_, 'mechanicalCategory': 'new-child-source-binding-missing' if id_ in new_children else 'already-omitted-current-active-goal', 'wholeCurrentGoalBody': goals[id_], 'ordinaryOmissionReason': record['reason'], 'wholePreviousGoalBodyIfAlreadyExisting': before_goals.get(id_), 'wholeCurrentImmediateParentGoalIds': parents[id_], 'retainedOriginalFamilySourcePartnerFrameIds': family_ids, 'wholeRetainedFamilyPartnerFrames': ref(family_path), 'wholeDirectOldGoalSourcePartnersIfAny': partners.get(id_, []), 'completeCurrent32MappingAndExtractionInventory': ref(P / 'source/whole-current-source-documents-extractions-partners-and-holds.actual-index.json'), 'allOriginal1646SourceDuties': ref(P / 'inputs/whole-original1646-B008-source-duty-inventory.exact.json'), 'currentNormalSourceBindingApproval': False, 'requiresActualBoundedSourceReviewBeforeApproval': True})
result = {'schemaVersion': 1, 'role': 'Actual exact-set mechanical classification355=362-7,43=19+24; not scientific review, compiler PASS, source approval or strict completion', 'wholeCurrentSourceMembershipObservedBeforeUnchangedFailing398Assertion': ref(P / 'checks/actual-normal-source-union-before-unchanged-failing-count-assertion.observed.json'), 'wholeActive381362ReceiptOriginal': ref(original_receipt), 'wholeActive381362ReceiptExactCopy': ref(own_receipt), 'actualBefore381AtomicGoalIds': sorted(before_atoms), 'actualAfter398AtomicGoalIds': sorted(after_atoms), 'actualOld362SourceGoalIds': sorted(old_union), 'actualCandidate355SourceGoalIds': sorted(new_union), 'actualSevenOriginalIDsRetainedNowAreas': sorted(retained_families_now_area), 'actual24NewChildrenMissingCurrentSourceBinding': sorted(new_children), 'actual19CurrentAlreadyOmittedGoalIds': sorted(old_omitted), 'actual43CurrentMissingSourceGoalIds': sorted(omitted), 'sourceUnion355EqualsPrior362Minus7ExactSet': True, 'missing43EqualsExisting19UnionNew24ExactDisjointSets': True, 'unresolvedScopeCount496Exact': True, 'whole43MissingGoalBodiesAndOriginalPartnerFrames': rows, 'wholeMappingAndSourceDutyScienceRestart': False, 'nextBoundedChildSourceScope': sorted(new_children), 'old19SourceHoldScopeRemainsSeparate': sorted(old_omitted), 'wholeSource19CourseSLTHRPSNHoldsRemain': True, 'activeWrites': [], 'strictGain': 0, 'humanApproval': False}
put(P / 'source/exact-current43-source-HOLD-19-existing-and24-new-child-classification.actual.json', result)
print(json.dumps({'actualSourceUnion': 355, 'wholeMissingSourceGoals': 43, 'sameOldOmissions': 19, 'newChildMissingBindings': 24, 'oldRetainedAreaPartnerEdgeCount': sum(len(x['wholeExistingDirectOriginalSourcePartners']) for x in family_frames), 'exactSetsConfirmed': True, 'newSourceJudgments': 0, 'strictGain': 0}))
