from pathlib import Path
import hashlib
import json
import difflib

repo = Path('.').resolve()
own = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M4-full-prerequisite-closure-successor-independent-review-b-v1'
root_author = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M4-whole-CrossStage-machine-QS-root-author-v1'
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
read = lambda path: json.loads(path.read_text())
ref = lambda path: {'path': str(path.relative_to(repo)), 'sha256': sha(path), 'bytes': path.stat().st_size}
write = lambda path, value: path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
v3_own = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M4-whole-CrossStage-QS-independent-review-b-v1'
v3_seal_path = v3_own / 'actual-independent-v3-machine-policy-REVISE.seal.json'
assert sha(v3_seal_path) == '974e4575e9d240a265e9090da5683b6a6b87be3e97636776bd9279b812aed08f'
for row in read(v3_seal_path)['files']:
    assert sha(repo / row['path']) == row['sha256']
assert sha(root_author / 'whole-current-checker.Economics-whole-CrossStage.inert-candidate.ts') == 'd7dc95ca78b904af080b3b2297a74ee586a249fd91c76fd7e33961f23d21578f'
assert sha(root_author / 'course-compatible-expected-terminals-successor-v2/whole-current-checker.Economics-whole-CrossStage-course-compatible.inert-candidate.ts') == '53c567b0ce9fc1612d5eb58431c76c2f3d2259d9e8045e1e09160de809c6f76a'
v3 = v3_own / 'inputs/whole-current-checker.Economics-whole-CrossStage-and-whole-material.inert-candidate.ts'
v4 = own / 'inputs/whole-current-checker.Economics-whole-CrossStage-complete-material-closure.inert-candidate.ts'
assert sha(v4) == '30467748de45b99e5d27cc63ddaace2430359ed4983aaf03964310d93f90f6b0'
active = repo / 'app/scripts/generateCurriculumQualityStatus.ts'
assert sha(active) == '44992052fe9610afdf6ab25979659fa26978c313efb9068b7878d711e831e062'
full_patch = ''.join(difflib.unified_diff(active.read_text().splitlines(True), v4.read_text().splitlines(True), fromfile='a/app/scripts/generateCurriculumQualityStatus.ts', tofile='b/app/scripts/generateCurriculumQualityStatus.ts'))
assert full_patch == (own / 'inputs/exact-Economics-whole-CrossStage-complete-material-closure-machine-QS.patch').read_text()
successor_patch_path = own / 'actual-independent-v3-to-v4-only-full-prerequisite-closure.patch'
successor_patch_path.write_text(''.join(difflib.unified_diff(v3.read_text().splitlines(True), v4.read_text().splitlines(True), fromfile='reviewed-v3-with-two-REVISE-findings', tofile='additive-v4-full-prerequisite-closure')))
native_path = own / 'actual-independent-v4-complete-fixture-applicability-full-closure-challenges-and34-whole-view-invariance.json'
native = read(native_path)
assert len(native['outcomes']) == 10 and all(row['matchesExpected'] for row in native['outcomes'])
assert len(native['actual34WholeProjectionComparisons']) == 34 and native['allForeignProfileDefinitionsExact']
assert read(own / 'actual-independent-v4-complete-fixture-applicability-policy-native.command-exit.json')['actualNativeProcessExitCode'] == 0
receipt_path = own / 'actual-independent-v4-complete-material-prerequisite-closure-bounded-KEEP.receipt.json'
write(receipt_path, {
    'decision': 'KEEP_BOUNDED_ROOT_INERT_V4_MACHINE_POLICY; no overall current material or M4 approval',
    'reviewAuthority': 'ai_candidate',
    'wholeCandidate': ref(v4),
    'exactFullProductionPatchIndependentlyReproduced': True,
    'actualV3ToV4PatchRead': ref(successor_patch_path),
    'historicalV1V2CandidatesAndSealedV3REVISEWholeFilesExact': True,
    'actualOwnNativeProof': ref(native_path),
    'actualOwnNativeContracts': 10,
    'resolvedV3Findings': [
        {'id': 'B-M4-QS-FOREIGN-HARDREQUIRES', 'decision': 'RESOLVED_BY_ACTUAL_V4_FAIL_NEGATIVE', 'wholeScience': 'Nonlocal and missing references are retained as unresolved references; they do not disappear through a local-reference filter.'},
        {'id': 'B-M4-QS-HIDDEN-REQUIRED-BRANCH', 'decision': 'RESOLVED_BY_ACTUAL_V4_FAIL_NEGATIVE', 'wholeScience': 'Every mandatory branch is collected transitively; availability of one path does not substitute for the conjunction of all hard prerequisites.'},
    ],
    'additionalIndependentlyCheckedSemantics': [
        'Actual contains ancestors contribute inherited hard prerequisites for the terminal and each subsequently required node.',
        'A required cluster means the complete set of its actual atomic contains descendants; unseen descendants cannot be ignored as metadata.',
        'A complete inherited mandatory-cluster support set can still PASS when its actual local atomic references are all present.',
        'Closure checks cover every actually visible Economics terminal, even without applicabilityFromRequires; they are not limited to a convenient expected endpoint.',
        'Original current-goal/local/visible coveredGoalIds path checks remain separate and strict.',
        'Source applicability, native course/duration matching, all projected-target route checks and explicit projection roles remain intact.',
    ],
    'actual34TargetAndSupportSetsExact': True,
    'allForeignProfileDefinitionsExact': True,
    'wholeActiveCheckerUnchangedDuringReview': True,
    'initialIncompleteFixtureProbe': {'command': ref(own / 'actual-independent-v4-policy-native.command-exit.json'), 'actualExit': 1, 'countedAsPASS': False, 'reason': 'Initial artificial positive fixture added q but omitted its current applicability record, so the native country filter correctly hid it. The additive successor supplies the full fixture current-goal applicability set. Both original failed probe and corrected successful probe are retained.'},
    'notClaimedClosed': [
        'Actual current country material/terminal route and full prerequisite debts exposed by this stricter policy.',
        'Scientific universal necessity of six legacy phase-practice-cluster gates; these require a separate real review.',
        'Scientific review and release status of new Book3 material and f80 binding successor.',
        'Stable combined central native integration and protected Mathematics/Physics M7 floors.',
    ],
    'newScientificGoalClosures': 0,
    'newStrictBindingRestorations': 0,
    'strictNetGain': 0,
    'overallM4M6Approval': False,
    'humanReviewReleaseOrTrialApproval': False,
    'activeProductionEdits': [],
})
assert not any(path.is_symlink() for path in own.rglob('*'))
seal_path = own / 'actual-independent-v4-machine-policy-followup-KEEP.seal.json'
write(seal_path, {'role': 'Additive actual independent B v4 review seal; historical v3 REVISE preserved', 'files': [ref(path) for path in sorted(own.rglob('*')) if path.is_file() and path != seal_path], 'successfulOwnNativeRuns': 1, 'failedIncompleteFixtureProbePreserved': True, 'productionEdits': 0, 'overallM4Approval': False})
print(json.dumps({'receipt': ref(receipt_path), 'seal': ref(seal_path)}))
