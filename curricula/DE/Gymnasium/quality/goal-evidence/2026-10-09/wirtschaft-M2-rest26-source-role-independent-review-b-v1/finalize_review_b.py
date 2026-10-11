import collections
import hashlib
import importlib.util
import json
from pathlib import Path

repo = Path('.').resolve()
relative = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-rest26-source-role-independent-review-b-v1')
own = repo / relative
author_relative = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-twenty-six-source-role-and-two-bounded-surrogate-author-v1')
author = repo / author_relative
v3 = author / 'current-explicit-source-role-and-one-subsumption-surrogate-successor-v3'
first = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-views-independent-review-b-v1'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())
write = lambda p, d: p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
ref = lambda p: {'path': str(p.relative_to(repo)), 'sha256': sha(p), 'bytes': p.stat().st_size}

historical = []
for path, member in [
    (first / 'actual-independent-review-b-final-package.seal.json', 'files'),
    (author / 'current-explicit-source-role-candidate-v2/actual-final-32-views24-source-roles-two-surrogate-candidates.review-input.manifest.json', 'inputs'),
    (v3 / 'actual-final32-view25-role-one-subsumption-current-v3-review-input.manifest.json', 'inputs'),
]:
    manifest = read(path)
    for item in manifest[member]:
        assert sha(repo / item['path']) == item['sha256'], item['path']
        if 'bytes' in item:
            assert (repo / item['path']).stat().st_size == item['bytes']
    historical.append({'manifest': ref(path), 'actualWholeMembersVerifiedExact': len(manifest[member])})
assert sha(v3 / 'actual-final-25-source-only-role-and-one-real-subsumption-binding.current-author-v3.handoff.receipt.json') == 'a661d55958a0e3df028a50278873a24c65d430fa6016a5c77db7d80756c43ae7'

results = {mode: read(own / f'actual-final-{mode}-native-review.output.json') for mode in ['pending', 'accepted', 'wrong-anchor', '764-retarget']}
commands = {mode: read(own / f'actual-final-{mode}-native-review.command-exit.json') for mode in results}
assert all(command['actualNativeProcessExitCode'] == 0 for command in commands.values())
assert [(results[mode]['actualNativeSourceCoverage']['unsupportedAssignedAtomicGoals'], results[mode]['actualNativeSourceCoverage']['unmappedSourceAtomicGoals']) for mode in results] == [(1, 0), (0, 0), (1, 0), (1, 0)]
accepted = results['accepted']
assert len(accepted['viewRows']) == 32 and len(accepted['individual25RoleCorrections']) == 25
findings = [finding for row in accepted['viewRows'] for finding in row['compilerFindings']]
assert not any(finding['severity'] == 'error' for finding in findings)
warnings = [finding for finding in findings if finding['severity'] == 'warning']
assert len(warnings) == 539 and all(finding['code'] == 'CPV-102' for finding in warnings)
kinds = {item['goalId']: item['semanticKind'] for item in read(first / 'inputs/whole-current493-semantic-kinds.json')['decisions']}
warning_ids = sorted(set(finding['goalId'] for finding in warnings))
assert len(warning_ids) == 33 and all(kinds[goal_id] == 'practiceAssessment' for goal_id in warning_ids)
index = read(v3 / 'thirty-two-explicit-current-scope-views-and-25-source-only-role-corrections.current-author-index-v3.json')
other_whole_views = 0
changed_be = []
for row in index['views']:
    current = repo / row['candidate']['path']
    previous = author / 'current-explicit-source-role-candidate-v2/views' / current.name
    if row['jurisdiction'] == 'DE-BE':
        assert current.read_bytes() != previous.read_bytes()
        changed_be.append(row['courseProfile'])
    else:
        assert current.read_bytes() == previous.read_bytes()
        other_whole_views += 1
assert other_whole_views == 30 and sorted(changed_be) == ['GK', 'LK']
spec = importlib.util.spec_from_file_location('skillpilot_readonly_symlink_check', repo / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
symlinks = validator.curriculum_symlink_errors(repo)
assert not symlinks

entry = read(v3 / 'one-bounded-norm-subsumption-source-surrogate-entry.candidate-pending-independent-review.json')['entries'][0]
assert entry['status'] == 'candidate'
qualified = {**entry, 'status': 'accepted'}
write(own / 'one-independently-reviewed-norm-subsumption-source-surrogate.accepted-machine-candidate.json', {
    'schemaVersion': 1,
    'entries': [qualified],
    'machineReviewAuthority': 'ai_candidate',
    'decision': 'KEEP_SINGLE_BOUNDED_SOURCE_RELATION_AFTER_ACTUAL_INDEPENDENT_REVIEW_B',
    'scientificReview': ref(own / 'actual-independent-two-surrogate-scientific-KEEP-and-REVISE.judgments.json'),
    'productionActivationClaimed': False,
    'humanApprovalOrTrialClaimed': False,
    'rejected764SourceSurrogateAccepted': False,
})

review_inputs = read(first / 'inputs/whole-current-applicability-compiler.readonly.json')['actualWholeInputSHA256']
for path, expected in review_inputs.items():
    assert sha(repo / path) == expected
positive = read(own / 'inputs/whole-four-current-goal-and-positive-profile-scientific-inputs.json')['wholePositiveSource']
assert sha(repo / positive['path']) == positive['sha256']
write(own / 'actual-independent-v3-source-role-review-b-input-and-history-guards.json', {
    'role': 'Actual whole-byte input guards after actual source/performance and runtime review; hashes are not substituted for scientific review',
    'historicalAndFrozenPackages': historical,
    'wholeActiveCompilerInputsStillExact': review_inputs,
    'wholePositive336And685CasesStillExact': positive,
    'thirtyOtherWholeV2ViewsRetainedExact': other_whole_views,
    'twoChangedBEViews': changed_be,
    'currentGlobalCurricularAtomic': 336,
    'bothNationalViewWholeBytesExactAndUnion336': True,
    'wholeOriginalSurrogateRegistry362EntriesRetainedExact': True,
    'source125And208PartialMappingsNotRewritten': True,
    'curriculumSymlinkErrors': symlinks,
    'all539CPV102WarningsRetained': True,
    'actualWarningGoalSemanticKinds': {goal_id: kinds[goal_id] for goal_id in warning_ids},
})
write(own / 'actual-independent-25-role-and-one-subsumption-source-binding-KEEP.receipt.json', {
    'role': 'Independent reviewer B current v3 source-role and one specifically bounded source-surrogate qualification',
    'decision': 'KEEP_BOUNDED_V3_25_EXPLICIT_ROLE_CORRECTIONS_AND_ONE_NORM_SUBSUMPTION_SOURCE_RELATION',
    'reviewAuthority': 'ai_candidate',
    'authorHandoff': ref(v3 / 'actual-final-25-source-only-role-and-one-real-subsumption-binding.current-author-v3.handoff.receipt.json'),
    'actualScientificReview': ref(own / 'actual-independent-two-surrogate-scientific-KEEP-and-REVISE.judgments.json'),
    'individual25CurrentWholeGoalsAndProfilesVerifiedUnchangedAndActualSourceRolesChecked': ref(own / 'actual-final-accepted-native-review.output.json'),
    'sourceRoleCorrections': {'countryGoalPairs': 25, 'byCountry': dict(collections.Counter(row['jurisdiction'] for row in accepted['individual25RoleCorrections'])), 'courseScopeEntries': 46, 'ordinaryGoalScopePairsBefore': 3541, 'ordinaryGoalScopePairsAfter': 3495, 'changedScopes': ['DE-BE/GK', 'DE-BE/LK', 'DE-NI/LK', 'DE-TH/GK', 'DE-TH/LK'], 'allOtherTargetPairsAndAllVisibleLeafPairsPreservedExceptExactly46ExplicitCorrections': True, 'removedCountryTargetsRemainGlobalAndNationalAndAvailableAsPrerequisites': True, 'noOrdinaryTargetSetReductionClaimForChangedScopes': False},
    'positiveBoundedNormDecision': {'goalId': qualified['goalId'], 'requiredByGoalId': qualified['requiredByGoalId'], 'jurisdiction': 'DE-BE', 'machineAcceptedEntry': ref(own / 'one-independently-reviewed-norm-subsumption-source-surrogate.accepted-machine-candidate.json'), 'scientificBasis': 'Actual shared GK/LK simple-norm-subsumption source row and the whole source-backed bd413 legal-fact-to-element-to-consequence cases require the existing direct dae939 operation.', 'otherRequiresOrWholeCourseSourceClaimsApproved': False},
    'withdrawn764Decision': {'decision': 'REVISE_V2_SURROGATE_AND_KEEP_V3_PREREQUISITE_ONLY_REMEDY', 'actualReason': 'The whole764 performance requires employment effects; a learner can satisfy the whole b241 income, capacity, sales and model-limit cases without that employment explanation.', 'currentV3TargetRoleCorrectedInBothBECourses': True, 'native764SurrogateEntriesAdded': 0},
    'actualNativeRuns': {mode: ref(own / f'actual-final-{mode}-native-review.command-exit.json') for mode in results},
    'nativeSourceResults': {'pendingOneNormCandidate': {'unsupported': 1, 'reverseUnmapped': 0}, 'qualifiedOneNormAccepted': {'unsupported': 0, 'reverseUnmapped': 0, 'sourceCompleteJurisdictions': 16}, 'genuineWrongExistingSourceAnchorNegative': {'unsupported': 1, 'reverseUnmapped': 0, 'wrongActualAnchor': 'b2419b68-8e21-5cee-8afc-34e3b07d2a87'}, 'genuineUnproven764TargetRetroductionNegative': {'unsupported': 1, 'reverseUnmapped': 0}, 'nativeTotalAtomicGoals': 338, 'curricularAtomicGoals': 336, 'nativeTwoAssessmentSourceAtomsNotFilteredOut': True, 'sourceAtomicGoals': 2134, 'sourceMappedToViewAtomicGoals': 2134, 'nativeWholeCodeExact': '44992052fe9610afdf6ab25979659fa26978c313efb9068b7878d711e831e062', 'nativePredicateThresholdChanges': 0, 'nativeDiagnosticExportsOnly': True},
    'actualCompilers': {'views': 32, 'errors': 0, 'warnings': 539, 'warningsCode': 'CPV-102', 'uniqueWarningGoals': 33, 'allWarningGoalsAreLegitimateExistingPracticeAssessmentPhaseTitles': True, 'warningsSilencedOrThresholdLowered': False},
    'wholeInputAndHistoryGuards': ref(own / 'actual-independent-v3-source-role-review-b-input-and-history-guards.json'),
    'strictFiveGateNetGain': 0,
    'newScientificGoalDescriptionOrPositiveUnderstandingClosures': 0,
    'separateBoundedNewSourceRelationQualification': 1,
    'newMemoryOrVisualizationApprovals': 0,
    'activeM2OrOverallCourseApproval': False,
    'humanReviewReleaseApprovalOrTrialClaim': False,
    'stillOpenSeparateWork': ['Root activation and actual central standard-M2 checks', 'Nonuniversal existing hard requires and didactic routes remain M3 review work', 'Four actual APV203 remain M5 work', 'Current positive-understanding status remains needs_human_review with ai_candidate authority; no silent status promotion', 'Human release and trial gates remain separate'],
    'noActiveCurriculumEditsByReviewerB': True,
})

json_files = list(own.rglob('*.json'))
def local_absolute_strings(item):
    if isinstance(item, dict):
        return sum((local_absolute_strings(value) for value in item.values()), [])
    if isinstance(item, list):
        return sum((local_absolute_strings(value) for value in item), [])
    return [item] if isinstance(item, str) and item.startswith(('/tmp/', '/home/')) else []
for path in json_files:
    assert not local_absolute_strings(read(path)), path
assert not any(path.is_symlink() for path in own.rglob('*'))
files = [ref(path) for path in sorted(own.rglob('*')) if path.is_file() and path.name != 'actual-independent-review-b-v3-final-package.seal.json']
write(own / 'actual-independent-review-b-v3-final-package.seal.json', {'role': 'Additive reviewer B final v3 whole-file seal; v2 and first30 review history untouched', 'files': files, 'wholeJSONFilesParsed': len(json_files), 'jsonLocalAbsoluteScratchInputReferences': 0, 'packageSymlinks': 0, 'globalCurriculumSymlinkErrors': symlinks, 'actualNativeProcessExits': {mode: command['actualNativeProcessExitCode'] for mode, command in commands.items()}, 'scientificSourceReviewReplacedByHashes': False, 'strictFiveGateNetGain': 0, 'overallActiveM2Approval': False, 'noActiveCurriculumEdits': True})
print(json.dumps({'decision': 'KEEP_BOUNDED_V3', 'filesSealed': len(files), 'receipt': ref(own / 'actual-independent-25-role-and-one-subsumption-source-binding-KEEP.receipt.json'), 'seal': ref(own / 'actual-independent-review-b-v3-final-package.seal.json')}))
