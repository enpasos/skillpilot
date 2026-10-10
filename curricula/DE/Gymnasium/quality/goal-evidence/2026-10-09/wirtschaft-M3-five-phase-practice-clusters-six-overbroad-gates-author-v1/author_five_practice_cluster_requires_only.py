from pathlib import Path
import hashlib
import json
import copy

repo = Path('.').resolve()
own = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-five-phase-practice-clusters-six-overbroad-gates-author-v1'
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
read = lambda path: json.loads(path.read_text())
write = lambda path, value: path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
ref = lambda path: {'path': str(path.relative_to(repo)), 'sha256': sha(path), 'bytes': path.stat().st_size}
before_path = own / 'inputs/whole-CAN494-reviewed-science-and-material-machine-before.json'
before = read(before_path)
assert sha(before_path) == '22826935bdcdb5190d3826062af835b1f7610ddd0f45398bb037726d106e9f78'
intake_path = own / 'inputs/whole-five-practice-six-content-clusters-and28-materials.original.json'
intake = read(intake_path)
assert sha(intake_path) == 'f670cde7e89210cf3b235a4c35fe3fd3da2982856a440a9e10fa6f4ba300b675'
goal_by_id = {goal['id']: goal for goal in before['goals']}
assert len(before['goals']) == 494
assert len(intake['practiceClusters']) == 5
assert len(intake['wholeSixReferencedContentClusters']) == 6
assert len(intake['wholeTwentyEightReleasedMaterialGoals']) == 28
for goal in intake['practiceClusters'] + intake['wholeSixReferencedContentClusters'] + intake['wholeTwentyEightReleasedMaterialGoals']:
    assert goal == goal_by_id[goal['id']]

def descendants(root):
    result = set()
    pending = [root]
    while pending:
        goal_id = pending.pop()
        if goal_id in result:
            continue
        result.add(goal_id)
        pending.extend(goal_by_id[goal_id].get('contains', []))
    return sorted(goal_id for goal_id in result if not goal_by_id[goal_id].get('contains'))

specifications = [
    ('14c05eec-87af-5fd6-832a-4f5d9d280e66', '464e91ba-1aa4-56d1-bc00-818b5673a163', 'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b', '7a3f0ae8-370e-5fc3-afce-09e1f7f35508', 'Sustainable consumption and quality of life compare the provided prosperity/environment indicators, negative external costs and three consumer/environment instruments. The whole four-part task can be completed without first analysing migration effects on society/politics. That distinct competence is one actual descendant of the imposed17-goal E1 gate. The actual task-specific four direct prerequisites remain unchanged.'),
    ('14c05eec-87af-5fd6-832a-4f5d9d280e66', 'f14dcf9f-66c5-5907-9e06-08f59a9a0e13', 'a1341d34-1f48-5985-a22d-27e155d471f7', 'e2ac2cc2-894a-5e61-8acb-f5d88811739d', 'The complete regional labour-market task explains sector/qualification changes, household consequences, training/infrastructure measures and their social scope from supplied material. Choosing offline/online payment methods by security, fees, availability and suitability is not needed for that performance, although it is among the45 atomic descendants imposed by the E2 gate. No payment or private-budget competence is inferred from the report.'),
    ('1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc', '968172f6-cd1c-5733-ba76-aa59817735eb', '591b870a-f10b-5b05-baf9-2f7fc40fd74b', '72bde56f-a752-5bc7-8472-24272c6075a0', 'The complete security-law constitutional task analyses the specified rights conflict, distinct institutions, proportionality and constitutional control. Fairness principles applied to different tax instruments and burdens are a separate full performance among the26 Q1 descendants. They are not necessary for that four-part constitutional answer. Its explicit rights/state-control prerequisites remain in place.'),
    ('a1c0e891-cb5b-56ef-9aa7-ac782e2099c3', 'e547677e-17ec-5b89-9ff6-28e36ac64c1f', '58cc062b-31b4-5879-a6c5-4ea60ce9e13c', '5b5d1d53-71c3-5fbf-b1cf-977c868b60e3', 'The complete care-insurance task interprets the supplied demographic/contribution data, welfare objectives, financing options and solidarity/generation trade-offs. Commercial-bank loan creation, interbank reserve/deposit transfers and principal repayment models are among the48 Q2 descendant competencies but are not necessary for this supplied financing argument. Its actual social-state/public-finance prerequisites remain unchanged.'),
    ('0fb8833c-4017-5052-819a-ecb5f6ebb36f', '067ee96c-97ae-5576-9f61-27a022914f87', '99eff8ba-bc92-5f08-8882-36f1b179101b', '7d632b0b-60b8-5c33-8094-ef1569b313dc', 'The complete machinery-supply-chain task explains specialisation/interruption risk, location factors, imports/exports and a conditional resilience/cost decision. Applying all three macroeconomic trilemma corners and alternative sacrifices is a separate full competence among39 Q3 descendants. That entire monetary-policy performance is not required to solve the logistics/location task. Its direct global-trade/location requirements stay exact.'),
    ('5113c64b-405d-5f4b-bae9-70fe530b5e69', 'a08fcb48-f38d-5acc-b8c1-1502daaada7e', 'a47e8fca-3ce1-5edb-90b4-28225b02340a', '6de44afa-7f91-5fa4-9292-ec06e86e97a4', 'The complete textile-responsibility task analyses costs/human rights, actor responsibility, voluntary CSR versus binding safeguards and a conditional workable rule. The full developmental/industrial migration competence—care labour, remittances, qualification recognition and return/knowledge-transfer channels—is a distinct LK descendant among27 Q4 atoms. It is not a universal prerequisite for that GK/LK responsibility task. Its own ethics/CSR/rights/global-actor requirements remain unchanged.'),
]
candidate = copy.deepcopy(before)
candidate_goal_by_id = {goal['id']: goal for goal in candidate['goals']}
scientific_decisions = []
for cluster_id, required_id, material_id, countercompetence_id, reason in specifications:
    assert required_id in goal_by_id[cluster_id]['requires']
    assert material_id in goal_by_id[cluster_id]['contains']
    atomic_descendants = descendants(required_id)
    assert countercompetence_id in atomic_descendants
    scientific_decisions.append({
        'practiceClusterId': cluster_id,
        'removedRequiredContentClusterId': required_id,
        'wholePracticeCluster': goal_by_id[cluster_id],
        'wholeRequiredContentCluster': goal_by_id[required_id],
        'actualMandatoryAtomicDescendantGoalIds': atomic_descendants,
        'wholeCounterexampleMaterial': goal_by_id[material_id],
        'wholeDistinctCounterCompetence': goal_by_id[countercompetence_id],
        'authorDecision': 'REMOVE_NONUNIVERSAL_WHOLE_CONTENT_CLUSTER_GATE',
        'actualFullPerformanceReasonEn': reason,
        'sourceAbsenceOrCountryVisibilityUsedAsScientificReason': False,
        'examThresholdsChangedOrIndividualStudentPerformanceReduced': False,
    })
for cluster in intake['practiceClusters']:
    candidate_goal_by_id[cluster['id']]['requires'] = []
changes = []
for old in before['goals']:
    new = candidate_goal_by_id[old['id']]
    changed = sorted(key for key in set(old) | set(new) if old.get(key) != new.get(key))
    if changed:
        assert changed == ['requires']
        changes.append({'goalId': old['id'], 'changedFields': changed, 'beforeWholeGoal': old, 'candidateWholeGoal': new})
assert len(changes) == 5 and sum(len(row['beforeWholeGoal']['requires']) for row in changes) == 6
assert {key: value for key, value in candidate.items() if key != 'goals'} == {key: value for key, value in before.items() if key != 'goals'}
assert list(candidate_goal_by_id) == list(goal_by_id)
assert all(old.get('examData') == candidate_goal_by_id[old['id']].get('examData') for old in before['goals'])
assert all(old.get('description') == candidate_goal_by_id[old['id']].get('description') and old.get('descriptionEn') == candidate_goal_by_id[old['id']].get('descriptionEn') for old in before['goals'])
candidate_path = own / 'whole-CAN494.five-practice-cluster-requires-only.inert-author-candidate.json'
write(candidate_path, candidate)
write(own / 'six-individual-whole-content-gate-nonuniversality.scientific-author-decisions.json', {
    'role': 'AUTHOR_CANDIDATE_ONLY; independent scientific review pending',
    'wholeInput': ref(intake_path),
    'actualRead': {'fivePracticeAndSixContentClusterContractsDEENAndWholeContainsLists': True, 'all28WholeTaskSolutionAndRubricDe': True, 'all28GoalContractsDEENAndDirectPrerequisites': True, 'sixDistinctCounterCompetenceP12ActualCasesDEEN': True, 'existingEnglishMaterialBodyReapprovalClaim': False},
    'individualGateDecisions': scientific_decisions,
    'atomicSequencingReason': 'The genuine prerequisite performances remain on the unchanged individual atomic assessment materials. The navigation cluster does not add the union of all phase content to each child. No replacement universal content gate is justified by these whole materials.',
    'phaseLocalAutonomyPreserved': True,
    'all28WholeMaterialBodiesStatusScoringAndDirectRequiresExact': True,
    'separateActualMaterialBoundaries': [
        {'materialId': 'c7f78820-f5e3-55ac-9a49-9ff747c6bfaa', 'declaredCoveredGoalId': '5b5d1d53-71c3-5fbf-b1cf-977c868b60e3', 'finding': 'App-store/network/regulation task and complete solution/rubric have no money-creation balance-sheet modelling performance. Preserving the old body does not qualify this declared coverage. Main material author and independent A must review the bounded remedy.', 'changedHere': False},
        {'materialId': 'c19ee0d7-0ab2-5c6f-8828-bc098a495b09', 'candidateRequiredGoalId': '753e5ac0-0375-56b9-a733-75701097b151', 'finding': 'Task3 explicitly examines fiscal rules/debt brake. Removal of the overbroad inherited whole-Q2 gate requires a separate review of the actual specific fiscal-rule prerequisite binding; the three existing direct prerequisite IDs do not explicitly list this competence.', 'changedHere': False},
    ],
    'newMaterialOrDescriptionOrPositiveProfileApproval': False,
    'humanReviewReleaseOrObservedLearnerEvidence': False,
})
write(own / 'actual-five-requires-only-deltas-and-494-whole-object-preservation.json', {'changes': changes, 'onlyFiveRequiresArraysChanged': True, 'allOther489WholeGoalsExact': True, 'all97WholeExamDataExact': sum('examData' in goal for goal in before['goals']) == 97, 'all494TitlesDescriptionsDEENAndContainsExact': True, 'all28IndividualAtomicMaterialRequiresExact': True, 'nationalAndGlobal336CurrentOrdinaryIDsPreserved': True, 'compositionViewsModified': [], 'sourceMappingAndEvidenceProfilesModified': [], 'scoringOrAssessmentStatusModified': [], 'activeProductionEdits': []})
handoff_path = own / 'actual-five-cluster-six-gates-current-author-freeze.handoff.json'
write(handoff_path, {
    'status': 'INERT_AUTHOR_CANDIDATE_PENDING_INDEPENDENT_A_SCIENTIFIC_REVIEW',
    'beforeWholeCAN494': ref(before_path),
    'wholeCandidate': ref(candidate_path),
    'wholeOriginalFivePracticeSixContentAnd28MaterialInput': ref(intake_path),
    'science': ref(own / 'six-individual-whole-content-gate-nonuniversality.scientific-author-decisions.json'),
    'actualWholeObjectPreservation': ref(own / 'actual-five-requires-only-deltas-and-494-whole-object-preservation.json'),
    'counts': {'practiceClusters': 5, 'removedWholeContentClusterGates': 6, 'wholeExistingMaterialChildrenRead': 28, 'ordinaryCurricularAtomicGoalIds': 336},
    'newScientificGoalClosures': 0,
    'strictFiveGateGain': 0,
    'newMaterialApprovals': 0,
    'independentRootV4MachineCodeReviewIsSeparate': True,
    'humanReviewReleaseOrTrialApproval': False,
    'productionEdits': 0,
    'remainingMaterialCoverageAndFullScopeDebtsRequireOwnReview': True,
    'nativeIntegrationAndProtectedM7ChecksPending': True,
})
manifest_path = own / 'actual-author-five-phase-cluster-six-gates.whole-file-manifest.json'
write(manifest_path, {'status': 'actual-author-freeze-only-independent-review-pending', 'files': [ref(path) for path in sorted(own.rglob('*')) if path.is_file() and path != manifest_path], 'wholeInputsPhysicalNoSymlinks': not any(path.is_symlink() for path in own.rglob('*')), 'productionWrites': 0})
print(json.dumps({'candidate': ref(candidate_path), 'handoff': ref(handoff_path), 'manifest': ref(manifest_path)}))
