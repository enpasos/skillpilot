import collections
import hashlib
import json
from pathlib import Path

repo = Path('.').resolve()
relative = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-current34-country-terminal-and-route-intake-independent-b-v1')
own = repo / relative
root_m2 = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-standard-source-availability-and-current-boundary-root-v1/actual-reviewed-M2-activation'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())
write = lambda p, d: p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
ref = lambda p: {'path': str(p.relative_to(repo)), 'sha256': sha(p), 'bytes': p.stat().st_size}
d = read(own / 'actual-whole90-by34-view-native-route-and-source-binding-intake.json')
command = read(own / 'actual-native-route-and-terminal-intake.command-exit.json')
assert command['actualNativeProcessExitCode'] == 0
compiler_command = read(root_m2 / 'actual-current-CAN493-native-applicability.command-exit.json')
assert compiler_command['exitCode'] == 0 and compiler_command['nativeCompilerModified'] is False
for item in compiler_command['actualInputs']:
    assert sha(repo / item['path']) == item['sha256'], item['path']
production = repo / 'app/scripts/generateCurriculumQualityStatus.ts'
assert sha(production) == '44992052fe9610afdf6ab25979659fa26978c313efb9068b7878d711e831e062'
assert sha(production) == sha(own / 'inputs/whole-native-CQR-production-source.readonly.txt')
capsule = Path(Path('/tmp/skillpilot-economics-M3-M4-independent-B-capsule-root.txt').read_text().strip())
assert (capsule / 'app/scripts/generateCurriculumQualityStatus.ts').read_bytes() == production.read_bytes() + b'\nexport { routeProfiles, evaluateRouteProfile, collectRenderedAtomicGoalIdsFromCompositionView, buildAtomicDirectRequiresEdges, buildEffectiveRequiresEdges, createPathChecker, isProjectedRouteTargetGoal };\n'
for path in (own / 'inputs/whole-current-views').glob('*.json'):
    assert path.read_bytes() == (repo / 'curricula/DE/Gymnasium/composition-views/wirtschaft' / path.name).read_bytes()
assert len(d['viewRows']) == 34
assert len(d['terminalBindingRows']) == 90
assert not any(t['coveredGoalsOutsideTransitiveRequires'] for t in d['terminalBindingRows'])
summary_rows = []
for row in d['viewRows']:
    summary_rows.append({
        'viewPath': row['viewPath'],
        'scope': row['scope'],
        'actualOrdinaryTargets': len(row['actualOrdinaryTargets']),
        'currentCourseCountryFilteredTerminals': len(row['currentVisibleTerminalIds']),
        'nativeUnfiltered104MissingTerminals': len(row['currentNative104MissingTerminalIds']),
        'targetPureWholeReferenceCandidates': len(row['existingTargetPureWholeMaterialCandidateIds']),
        'supportCompleteWholeReferenceCandidates': len(row['existingSupportCompleteWholeMaterialCandidateIds']),
        'visibleTerminalBindingsNeedingSpecificScopeReview': len(row['currentVisibleWholeMaterialsOutsideScope']),
        'targetsWithoutLocalDirectRouteToTargetPureReference': len(row['actualOrdinaryTargetsWithoutLocalDirectRouteToTargetPureWholeMaterial']),
        'targetsWithoutLocalDirectRouteToSupportedReference': len(row['actualOrdinaryTargetsWithoutLocalDirectRouteToSupportedWholeMaterial']),
        'actualTargetsWithoutLocalDirectMotivationRoute': row['actualOrdinaryTargetsWithoutLocalDirectMotivationRoute'],
        'noNewScopeOrMaterialApproval': True,
    })
motivation_ids = sorted(set(goal_id for row in d['viewRows'] for goal_id in row['actualOrdinaryTargetsWithoutLocalDirectMotivationRoute']))
write(own / 'actual34-current-scope-and-whole90-terminal-binding-summary.independent-b.json', {
    'role': 'Current whole-material and local-route binding intake; candidate counts are not completed work',
    'nativeCQR104UnchangedReproducedExactly': True,
    'nativeProfileRequires90InEachOf34CrossStageViews': True,
    'nativeProfileScopeMissingTerminals': 33,
    'nativeProfileCurrentlyChecksLocalAtomicRoutes': False,
    'wholeNativeRegisteredTerminalsReleasedAsExistingMachineReferences': 90,
    'wholeCoveredGoalsOutsideTransitiveMaterialRequires': 0,
    'threeDirectVsCoveredArrayDifferencesAreTransitivelyBound': [t['goalId'] for t in d['terminalBindingRows'] if t['coveredGoalsNotDirectRequires']],
    'wholeScopeMaterialBindingCandidates': summary_rows,
    'visibleTerminalScopeBindingsNeedingSpecificReview': sum(row['visibleTerminalBindingsNeedingSpecificScopeReview'] for row in summary_rows),
    'ofThoseMissingCurrentCompiledJurisdiction': sum(not terminal['compiledJurisdictionMatches'] for row in d['viewRows'] for terminal in row['currentVisibleWholeMaterialsOutsideScope']),
    'localDirectMotivationGapOccurrences': sum(len(row['actualTargetsWithoutLocalDirectMotivationRoute']) for row in summary_rows),
    'localDirectMotivationGapGoalIds': motivation_ids,
    'intakeIsNot890NewMaterialContentFailures': True,
    'countryAndCoursePoliciesNeedActualIndependentCandidateReview': True,
    'strictGain': 0,
})
write(own / 'actual-CQR104-current-policy-cause-and-stronger-scope-requirements.independent-b.json', {
    'decision': 'ACTUAL_M3_M4_SCOPE_POLICY_AND_MATERIAL_BINDING_INTAKE_READY; no active candidate approval',
    'currentNativeProfile': d['currentNativeProfilePolicy'],
    'productionNativeWholeFile': ref(own / 'inputs/whole-native-CQR-production-source.readonly.txt'),
    'existingRelevantPolicyFields': {
        'compositionViewApplicabilityMode': 'compiled-jurisdiction',
        'compositionViewRoutePathMode': 'visible-atomic',
        'compositionViewStage': ['SekI', 'SekII', 'CrossStage'],
        'practiceAssessmentDataField': 'extendedData.applicabilityFromRequires',
    },
    'actualRestrictionsNotSafeToBypass': [
        'Economics currently enables neither applicability nor projection-local atomic-route policy, so expected90 ignores course and country boundaries.',
        'Native compositionStructureStage and collectCompositionStageStructures recognise only SekI/SekII. Economics CrossStage trees have no recognised CrossStage structure. Enabling visible-atomic alone would empty the stage projection.',
        'Native exact assessment-prerequisite expectation currently activates only for Physics. Economics practice applicabilityFromRequires is present in the data but is not automatically proof of a Country/GK/LK endpoint.',
        'Current Economics country trees include existing reference materials without all current compiled source or exact whole-material support bindings. Global released status is not whole Country/GK/LK approval.',
        'CQR104 details are limited to20 messages by makeRule. The independent34-view matrix retains all scope IDs and does not mistake missing displayed diagnostics for a clean scope.',
    ],
    'minimumSemanticsForAnIndependentlyReviewableSuccessor': [
        'Retain all current336 global curricularAtomic IDs and all reviewed Country/course targets; do not hide ordinary targets through profile selectors or route filters.',
        'Define actual reviewed stage authority before applying strict stage projections. Do not infer a target/prerequisite role from year, phase, tags or requires.',
        'Keep each full existing qualified task/solution/scoring body unchanged unless a specific scientific fault requires its correction. Bind the whole covered goal contract, direct and transitive material prerequisites, course and current compiled jurisdiction separately.',
        'Every projected ordinary target must retain a local atomic route from the actual motivation anchor and to a complete fitting autonomy task; global canonical paths through unavailable goals do not suffice.',
        'Explicit prerequisite-only support may preserve necessary foundation access, but neither generic requires closure nor shared vocabulary proves an independent source target or extra whole assessment duty.',
        'Do not import all90 national materials into each country tree. Exact country/course endpoint sets must follow actual reviewed whole-material performances and available goal/support contracts.',
        'New or corrected whole materials need independent scientific task, solution, rubric and counteranswer review before machine release. A generated task or a native probe is not that review.',
        'Any Economics-specific QS-profile successor must strengthen scope checks without changing protected Math/Physics semantics, lowering thresholds, silencing diagnostics or modifying runtime.',
    ],
    'independentDetailedMatrix': ref(own / 'actual-whole90-by34-view-native-route-and-source-binding-intake.json'),
    'currentCompiled493Report': ref(root_m2 / 'whole-actual-current-CAN493.native-applicability-report.json'),
    'actualCompilerCommandAndInputBindings': ref(root_m2 / 'actual-current-CAN493-native-applicability.command-exit.json'),
    'actualOwnNativeCommand': ref(own / 'actual-native-route-and-terminal-intake.command-exit.json'),
    'scopeSummary': ref(own / 'actual34-current-scope-and-whole90-terminal-binding-summary.independent-b.json'),
    'allFourAPV203RemainSeparateM5': True,
    'sourceM2NotReopenedByThisIntake': True,
    'activeM4M6Claim': False,
    'strictFiveGateNetGain': 0,
    'newScientificFiveGateClosures': 0,
    'newMaterialOrWholeCountryApproval': False,
    'humanReleaseOrTrialApproval': False,
    'activeCANViewsConfigEdits': [],
    'reviewerRemainsIndependentOfFollowingAuthorCandidate': True,
})
files = [ref(path) for path in sorted(own.rglob('*')) if path.is_file() and path.name != 'actual-readonly-M3-M4-intake.independent-b.seal.json']
for path in own.rglob('*.json'):
    read(path)
assert not any(path.is_symlink() for path in own.rglob('*'))
write(own / 'actual-readonly-M3-M4-intake.independent-b.seal.json', {'role': 'Actual readonly baseline intake seal; future author candidates are separately reviewed', 'files': files, 'actualNativeExit': command['actualNativeProcessExitCode'], 'actualFreshCompilerExit': compiler_command['exitCode'], 'snapshotViews': 35, 'CrossStageViewsActuallyChecked': 34, 'registeredWholeTerminalReferences': 90, 'nativePredicatesThresholdsChanged': False, 'reviewInputSymlinks': 0, 'productionWrites': 0, 'strictFiveGateNetGain': 0, 'activeM4M6HumanReleaseApproval': False})
print(json.dumps({'receipt': ref(own / 'actual-CQR104-current-policy-cause-and-stronger-scope-requirements.independent-b.json'), 'seal': ref(own / 'actual-readonly-M3-M4-intake.independent-b.seal.json'), 'snapshotFiles': len(files), 'localMotivationGapIDs': motivation_ids}))
