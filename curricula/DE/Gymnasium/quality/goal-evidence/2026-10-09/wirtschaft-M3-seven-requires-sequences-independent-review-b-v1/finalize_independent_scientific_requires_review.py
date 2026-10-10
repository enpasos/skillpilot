import hashlib
import json
from fractions import Fraction
from pathlib import Path

repo = Path('.').resolve()
relative = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-seven-requires-sequences-independent-review-b-v1')
own = repo / relative
author = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-seven-nonuniversal-prerequisite-bounded-author-v1'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())
write = lambda p, d: p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
ref = lambda p: {'path': str(p.relative_to(repo)), 'sha256': sha(p), 'bytes': p.stat().st_size}
before = read(own / 'inputs/whole-CAN493-before-actual-reviewed-M2.json')
after_path = author / 'whole-current-CAN493.seven-requires-only.inert-author-candidate.json'
after = read(after_path)
assert sha(after_path) == '759245da9d52a38db6bb11532acdd954475f997a3d8f6b38e68e39a5a85356ff'
assert {k: v for k, v in before.items() if k != 'goals'} == {k: v for k, v in after.items() if k != 'goals'}
old_goals = {g['id']: g for g in before['goals']}
new_goals = {g['id']: g for g in after['goals']}
assert list(old_goals) == list(new_goals) and len(new_goals) == 493
changes = []
for goal_id, old in old_goals.items():
    new = new_goals[goal_id]
    fields = sorted(k for k in set(old) | set(new) if old.get(k) != new.get(k))
    if fields:
        assert fields == ['requires']
        assert new['requires'] == ['6bf2d1cc-e745-50dd-a617-71c06a6c6945']
        changes.append({'goalId': goal_id, 'oldRequires': old['requires'], 'newRequires': new['requires']})
assert len(changes) == 7 and sum(len(row['oldRequires']) for row in changes) == 9
context = read(own / 'inputs/whole-seventeen-goals-and-sixteen-positive-profiles.original.json')
assert len(context['goals']) == 17 and len(context['positiveRecords']) == 16
for goal in context['goals']:
    assert goal == old_goals[goal['id']]
profiles = {p['goalId']: p for p in context['positiveRecords']}
assert sum(len(p['profile']['applicationCaseBriefs']) for p in profiles.values()) == 32

reason_by_target = {
    'c9847c36-7a66-5cbd-9aee-60f71a8440de': ('Market dependencies and screening are the dependent contract. Its two full cases identify the political aim, critical input/control channel, replacement or conditioning options and economic side effects. Neither case requires a judgement about NGO representation, public-maintenance responsibility or donor accountability. Knowing that specific NGO competence can help a selected development context, but is not a universal precondition for the whole geoeconomic competence.', 'An export restriction can be analysed through buyer dependence, short-term stock limits, subsequent substitution and exporter losses. Infrastructure screening can compare concrete control risks, conditional approval and prohibition with financing/competition costs. Those complete answers do not certify the NGO water/cooperation or supply-chain-advocacy cases.', 'Everyday participation opens a reason to investigate market-power and security questions before the content is taught; the orientation does not test NGO knowledge or geopolitical analysis.'),
    '9a1a3f9b-909d-53d3-8851-759c416bd763': ('The GuV goal needs period-based income/expense distinctions, not mastery of the entire predecessor account organisation and closing-to-equity operation. The cafe and repair cases provide period data and can be fully solved without constructing or closing income/expense accounts. The predecessor remains a valid separate bookkeeping competence with its genuine66a0 prerequisite.', 'Cafe income8000 minus expenses7000 gives profit1000 despite unpaid earned revenue and noncash depreciation. Repair expenses4900 versus income4500 give loss400; collecting an earlier receivable does not create new period income. Explaining that loss reduces equity does not demonstrate classifying and closing all income/expense accounts.', 'The everyday/business orientation gives a reason to examine whether an enterprise succeeds; it is neither an accounting test nor prior certification of the GuV computation.'),
    '424bae9f-8f2e-5093-a17d-ee5eadb6edde': ('The dependent calculation uses supplied Lorenz/Gini rules and consistent ranked observations. Its limit statement about poverty or justice does not require first analysing a concrete social-policy efficiency/justice trade-off. Those are different whole performances; normative boundary awareness must stay in the target itself.', 'The two current datasets yield Gini2/5 and3/10 under the given scale and reranking. Their comparison establishes reduced relative inequality for that basis, while neither a poverty percentage nor a unique justice verdict follows. No benefit-withdrawal or childcare-efficiency case must be solved to produce that complete answer.', 'Participation provides a reason to read distribution information; orientation completion does not certify ranking, Gini or a social-policy judgement.'),
    '6f1f4654-35ab-5ba6-a329-b19b994e84cc': ('Applying the supplied statutory four-goal framework to supplied observations differs from evaluating forecast approaches, intervals, data revisions and scenario assumptions. All four legal objectives and a justified conflict/compatibility judgement remain required in both dependent cases. The whole forecast competence is therefore not a universal hard gate.', 'A recovery case can connect growth, employment, price pressure and the specified external deficit to all four objectives and assess magnitudes. A weak-demand case rejects the claim that low inflation alone meets the other objectives and examines the external surplus conditionally. Neither complete answer evaluates a forecasting method or interval.', 'Orientation gives a meaningful entry through prices, jobs and economic development. It has no legal-detail or macroeconomic-indicator quiz.'),
    '6e138ab0-4f2b-52f9-8cd6-660051d60fba': ('Creating reasoned audience-specific written, visual and actual oral recommendations is not universally preceded by analysis of all film, literature and nonfiction forms. The two recommendation cases supply or generate economic findings and require their actual communication and conditional reasoning. All three presentation forms remain substantive target requirements.', 'A youth-group repair recommendation explains the35/90 comparison and conditional use time in actual written/media/oral outputs without a guarantee. A management brief compares600/500 with the delivery/deadline/storage conditions and unknown failure probabilities, including an actual simulated oral response. Neither performance needs a film/literature/nonfiction analysis first.', 'The existing orientation connects economic learning with practical decisions and communication; it supplies a learner-facing entry rather than media-analysis certification.'),
    '596c02e3-6263-5084-8593-c5f51808326b': ('The project target permits a selected economics/law question and requires actual planning, execution, method revision and evaluation. Payment-method selection, household spreadsheet budgeting and credit-risk appraisal each require separate entire performances. The two actual complete project cases demonstrate that none of those three specific topic contracts is universally necessary. Their removal does not waive actual execution or subject-based evaluation.', 'A completed reuse-cost investigation documents its chosen initial day extrapolation, actually recalculates both days and compares the changed method/results. A completed law-information project creates its own product and replaces general yes/no self-report with actually applied case-specific scoring under supplied norms. Neither selects payment mechanisms, constructs a household-saving spreadsheet or appraises credit/overindebtedness risks.', 'Everyday, study and career possibilities give reasons to select a bounded project question. Orientation does not certify private-budget performance or create observations of real pupils or firms.'),
    'b2419b68-8e21-5cee-8afc-34e3b07d2a87': ('Using a supplied model and explaining its assumptions/limits is possible without prior mastery of the entire764 growth-and-employment competence. The dependent cases require multiplier/income interpretation and time/capacity/sales limitations. The full precursor requires independent labour-demand and realised-employment explanations. The previously scientifically rejected764→b241 source-surrogate claim remains rejected.', 'The supplied consumption propensity yields multiplier4 and model income40; imports and used capacity prevent an unconditional real forecast. The training model supports conditional potential200 after12 months, not certain next-month sales. Those full answers explain model usefulness and limits without showing the whole precursor employment analysis.', 'Orientation gives a reason to investigate how policy models inform decisions, without testing a multiplier or assuming certified employment modelling.'),
}
edge_decisions = []
orientation_decisions = []
for change in changes:
    target = change['goalId']
    reason, counterexample, orientation_reason = reason_by_target[target]
    for predecessor in change['oldRequires']:
        edge_decisions.append({'goalId': target, 'removedRequiredGoalId': predecessor, 'decision': 'KEEP_REMOVAL_OF_NONUNIVERSAL_WHOLE_COMPETENCE_GATE', 'actualWholeDependentAndPredecessorDEENAndPRead': True, 'actualTargetCaseIds': [c['id'] for c in profiles[target]['profile']['applicationCaseBriefs']], 'actualPredecessorCaseIds': [c['id'] for c in profiles[predecessor]['profile']['applicationCaseBriefs']], 'independentReasonEn': reason, 'independentCompletePerformanceCounterexampleEn': counterexample, 'observedLearnerEvidenceClaim': False, 'sourceCoverageAbsenceUsedAsScientificReason': False})
    orientation_decisions.append({'goalId': target, 'requiredGoalId': '6bf2d1cc-e745-50dd-a617-71c06a6c6945', 'decision': 'KEEP_BOUNDED_MOTIVATIONAL_ENTRY_SEQUENCE', 'specificReasonEn': orientation_reason, 'orientationNumericCompletionDoesNotCertifyKnowledge': True, 'requiresDirectionOrMasteryPropagationChanged': False, 'sourceTargetRoleInferredFromOrientationEdge': False})
assert len(edge_decisions) == 9 and len(orientation_decisions) == 7
write(own / 'actual-nine-independent-whole-competence-REMOVE-and-seven-orientation-KEEP.scientific-decisions.json', {'reviewAuthority': 'ai_candidate', 'reviewScope': 'Independent actual prerequisite necessity and entry sequencing, not a goal-description or positive-profile reapproval', 'wholeOriginalInput': ref(own / 'inputs/whole-seventeen-goals-and-sixteen-positive-profiles.original.json'), 'wholeGoalsReadDEEN': 17, 'wholeCurrentPositiveProfilesRead': 16, 'wholeCurrentCasesReadDEEN': 32, 'removedGateDecisions': edge_decisions, 'separateOrientationSequenceDecisions': orientation_decisions, 'humanReviewOrObservedLearnerClaim': False})

def gini(values):
    return sum((abs(Fraction(x) - Fraction(y)) for x in values for y in values), Fraction()) / (2 * len(values) * sum(values))
assert gini([10, 10, 20, 60]) == Fraction(2, 5)
assert gini([10, 20, 20, 50]) == Fraction(3, 10)
assert 8000 - sum([3000, 2500, 1000, 500]) == 1000
assert 4500 - sum([1800, 2200, 800, 100]) == -400
assert 1 / (1 - Fraction(3, 4)) == 4
assert sum(Fraction(1, 5) * n for n in [100, 40]) == 28
assert sum(12 + Fraction(1, 20) * n for n in [100, 40]) == 31
write(own / 'actual-independent-counterexample-arithmetic.checks.json', {'method': 'Exact rational arithmetic; Gini independently checked by pairwise-income difference, not merely repeated supplied trapezoid formula', 'GiniInitial': '2/5', 'GiniAfterFundedTransfer': '3/10', 'cafeProfit': 1000, 'repairLoss': -400, 'modelMultiplier': 4, 'modelIncomeImpulse': 40, 'actualTwoDayDisposableCost': 28, 'actualTwoDayReusableCost': 31, 'fictionalCounterexamplesNotObservedLearnerEvidence': True})
native_path = own / 'actual-seven-requires-only-native-graph-source-route-and-material-followup.json'
native = read(native_path)
assert read(own / 'actual-seven-requires-native.command-exit.json')['actualNativeProcessExitCode'] == 0
assert read(own / 'actual-currentP336-native-current-resource-digests-validation.command-exit.json')['actualNativeProcessExitCode'] == 0
positive = read(own / 'actual-currentP336-and-seven-context-native-current-resource-digests-validation.json')
assert positive['currentBeforeErrors'] == [] and len(positive['originalAgainstCandidateStaleNegatives']) == 7
assert native['actualSourceCoverage']['unsupportedAssignedAtomicGoals'] == 3
route = next(rule for rule in native['actualNativeRouteScope']['rules'] if rule['id'] == 'CQR-101')
assert route['status'] == 'fail' and route['metrics']['missingTerminalPath'] == 4
owner_impact = read(author / 'actual-current336-native-owner-page-impact.individual-whole-before-after.json')
assert owner_impact['changedOwnerPages'] == 16 and owner_impact['exactOwnerPages'] == 320
for impact in owner_impact['impacts']:
    assert set(impact['changedFields']) <= {'requires', 'reverseRequires', 'externalPrerequisites', 'evidenceReview', 'pageFingerprint'}
    assert impact['beforePage']['description'] == impact['proposedPage']['description']
    if 'externalPrerequisites' in impact['changedFields']:
        assert impact['beforePage']['externalPrerequisites'] == []
        assert [entry['goalId'] for entry in impact['proposedPage']['externalPrerequisites']] == ['6bf2d1cc-e745-50dd-a617-71c06a6c6945']
    if 'evidenceReview' in impact['changedFields']:
        before_review = impact['beforePage']['evidenceReview']
        proposed_review = impact['proposedPage']['evidenceReview']
        assert {key: value for key, value in before_review.items() if key != 'reviewInputFingerprint'} == {key: value for key, value in proposed_review.items() if key != 'reviewInputFingerprint'}
write(own / 'actual-seven-requires-and-nine-removals-independent-bounded-KEEP.receipt.json', {
    'decision': 'KEEP_BOUNDED_SEVEN_REQUIRES_SCIENCE_AND_ENTRY_SEQUENCES_ONLY; source and terminal remedies remain open',
    'reviewAuthority': 'ai_candidate',
    'wholeFrozenCandidate': ref(after_path),
    'scientificDecisions': ref(own / 'actual-nine-independent-whole-competence-REMOVE-and-seven-orientation-KEEP.scientific-decisions.json'),
    'actualCandidateOnlyChanges': changes,
    'allOther486WholeGoalsExactAndAllDescriptionsDEENExact': True,
    'globalCurrentCurricularAtomic': 336,
    'newScientificDescriptionOrPositiveGoalClosures': 0,
    'newMemoryOrImageApprovals': 0,
    'strictFiveGateNetGain': 0,
    'actualNativeGraphAndTypes': 'PASS',
    'actualNativeSourceFollowup': {'unsupported': 3, 'reverseUnmapped': 0, 'country': 'DE-NI', 'noOverallM2Approval': True},
    'actualNativeRouteFollowup': {'CQR101': 'FAIL', 'CQR102': 'WARN', 'missingTerminalPathCount': 4, 'actualMissingTerminalPaths': route['details']},
    'dependentMaterialFollowup': native['wholeCoveredOutsideRequires'],
    'separateFourAPV203M5DebtRemains': True,
    'actualNativeProof': ref(native_path),
    'actualP336And685CasesNativeProof': ref(own / 'actual-currentP336-and-seven-context-native-current-resource-digests-validation.json'),
    'firstIncompleteNoResourceDigestProbe': {'command': ref(own / 'actual-currentP336-native-validation.command-exit.json'), 'countedAsPASS': False, 'reason': 'Initial probe omitted the existing goal-book QA asset digests. The additive correct native probe includes those exact existing resources; no image was edited or reviewed.'},
    'requiresInputBindingsAfterActualScience': {'sevenCurrentConditionalPInputFingerprintsValid': True, 'whole336ProfilesAnd685CasesAndStatusesUnchanged': True, 'changedOwnerPages': 16, 'otherOwnerPagesExact': 320, 'newDReviewClaim': False},
    'minimumBeforeAnyIntegration': ['Resolve actual NI3 source/role effects through independently reviewed evidence; no source-floor regression.', 'Restore actual four terminal routes with fitting material prerequisites or whole new reviewed tasks; do not reinstall false whole-competence gates.', 'Validate all actual covered material goals and local support after the prerequisite change.', 'Integrate only separately reviewed candidates and rerun current central gates and protected floors at a stable combined stand.'],
    'activeM3M4M6Approval': False,
    'humanReleaseOrTrialApproval': False,
    'activeCANViewsConfigEdits': [],
})
for path in own.rglob('*.json'):
    read(path)
assert not any(path.is_symlink() for path in own.rglob('*'))
files = [ref(path) for path in sorted(own.rglob('*')) if path.is_file() and path.name != 'actual-independent-seven-requires-science-b-final.seal.json']
write(own / 'actual-independent-seven-requires-science-b-final.seal.json', {'role': 'Actual additive independent B seven-requires science review seal; no whole-course approval', 'files': files, 'actualSuccessfulNativeRuns': 2, 'initialOmittedResourceDigestsProbePreservedAsFailed': True, 'wholeOriginalDEENProfilesReadNotReplacedByHashes': True, 'strictGain': 0, 'activeM3M4M6Approval': False, 'productionWrites': 0})
print(json.dumps({'receipt': ref(own / 'actual-seven-requires-and-nine-removals-independent-bounded-KEEP.receipt.json'), 'seal': ref(own / 'actual-independent-seven-requires-science-b-final.seal.json'), 'files': len(files)}))
