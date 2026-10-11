from pathlib import Path
import hashlib
import json
import difflib

repo = Path('.').resolve()
own = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M4-whole-CrossStage-QS-independent-review-b-v1'
current = repo / 'app/scripts/generateCurriculumQualityStatus.ts'
candidate = own / 'inputs/whole-current-checker.Economics-whole-CrossStage-and-whole-material.inert-candidate.ts'
patch = own / 'inputs/exact-Economics-whole-CrossStage-and-whole-material-machine-QS.patch'
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
actual = ''.join(difflib.unified_diff(current.read_text().splitlines(True), candidate.read_text().splitlines(True), fromfile='a/app/scripts/generateCurriculumQualityStatus.ts', tofile='b/app/scripts/generateCurriculumQualityStatus.ts'))
assert actual == patch.read_text()
assert sha(current) == '44992052fe9610afdf6ab25979659fa26978c313efb9068b7878d711e831e062'
result = json.loads((own / 'actual-independent-policy-contract-challenges-and34-whole-view-invariance.json').read_text())
receipt = {
    'decision': 'REVISE_ROOT_INERT_V3_SCOPE_POLICY',
    'reviewAuthority': 'ai_candidate',
    'wholeCandidateSha256': sha(candidate),
    'exactPatchRecomputedAgainstCurrentPredecessor': True,
    'readActualChangedCodeAndWholeRouteCollectorHelpers': True,
    'wholeActiveProductionCheckerUnchanged': True,
    'actualNativeProcessExitCode': json.loads((own / 'actual-independent-policy-native.command-exit.json').read_text())['actualNativeProcessExitCode'],
    'actualContracts': [{'name': row['name'], 'actualCQR104': row['actualScopeRule']['status'], 'expected': row['scientificallyExpectedScopeResult'], 'matchesExpected': row['matchesExpected']} for row in result['outcomes']],
    'independentPolicyFindings': [
        {'id': 'B-M4-QS-FOREIGN-HARDREQUIRES', 'decision': 'REVISE', 'reason': 'The explicitly claimed complete local material prerequisite check discards nonlocal requires before visibility verification. A declared foreign prerequisite is neither represented nor independently satisfied by this local view; even an unresolved foreign reference yields CQR104 PASS. It must remain a scope error until an explicit supported full binding exists.', 'codeLocation': 'missingTerminalPrerequisiteIds and applicabilityFromRequires use local-ref filtering', 'actualProbeIndex': 1},
        {'id': 'B-M4-QS-HIDDEN-REQUIRED-BRANCH', 'decision': 'REVISE', 'reason': 'Existence of one visible route to motivation and to a terminal is existential; a requires array is conjunctive. The whole terminal directly requires b, whose actual requires are a and p. Only the a route is visible. Checking just the terminal direct array and coveredGoalIds leaves the mandatory p side branch absent while CQR104 reports PASS. Full required support must be proven, without silently inferring mastered prerequisites from mastery of the dependent goal.', 'actualProbeIndex': 2},
    ],
    'acceptedBoundedPolicies': [
        'CrossStage means the entire actual authored runtime-rendered tree, including explicit prerequisiteOnly entries across stages.',
        'Expected whole-material endpoints must fit actual country and native course/duration filters; LK material cannot satisfy GK.',
        'All visible ordinary targets participate in route checks regardless of profile-selector metadata.',
        'Declared coveredGoalIds must remain actual, local, visible and on the terminal prerequisite route; this is a machine binding, not a whole-task scientific review.',
        'A single actual whole-view structure root is required; labels do not infer stage.',
    ],
    'actual34TargetAndSupportWholeSetsExact': True,
    'foreignProfileDefinitionsExact': True,
    'root13TestsDoNotOverrideIndependentNegativeFindings': True,
    'overallM4M6Approval': False,
    'strictGain': 0,
    'newScientificClosures': 0,
    'humanOrTrialApproval': False,
    'productionEdits': [],
}
receipt_path = own / 'actual-independent-v3-machine-policy-REVISE.receipt.json'
receipt_path.write_text(json.dumps(receipt, indent=2, ensure_ascii=False) + '\n')
seal_path = own / 'actual-independent-v3-machine-policy-REVISE.seal.json'
files = [{'path': str(path.relative_to(repo)), 'sha256': sha(path), 'bytes': path.stat().st_size} for path in sorted(own.rglob('*')) if path.is_file() and path != seal_path]
seal_path.write_text(json.dumps({'reviewedV3Only': True, 'files': files, 'productionWrites': 0, 'actualNativeRuns': 1, 'nativeExit0DoesNotMeanPolicyPASS': True, 'v3RejectedNegativeFindingsRemainForAdditiveSuccessor': True}, indent=2) + '\n')
print(json.dumps({'receiptSHA': sha(receipt_path), 'receiptPath': str(receipt_path.relative_to(repo)), 'sealSHA': sha(seal_path)}))
