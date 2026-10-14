# Apache-2.0. Seal an actual independent code review; do not apply the candidate.
from pathlib import Path
from datetime import datetime, timezone
import difflib
import hashlib
import json
import subprocess

BASE = Path('tmp/cross-subject-requires/runtime-quality-directory-guard-20261013')
MAIN = 'backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java'
TEST = 'backend/src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java'
EVIDENCE = Path('tmp/cross-subject-requires/runtime-quality-guard-independent-evidence-20261013-ewb9jbjo/test-compile-execution.independent-review-v1.json')
OUT = Path('tmp/cross-subject-requires/runtime-quality-directory-guard.independent-code-review-20261013-v1.json')

def binding(p):
    p = Path(p)
    data = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'byteLength': len(data)}

def check(row):
    assert binding(row['path']) == row, row['path']

index_path = BASE / 'author-candidate.index.json'
index = json.loads(index_path.read_bytes())
assert binding(index_path)['sha256'] == 'sha256:c33c348ef55a98e989b5ab245f197114c776489096151ab6f7993be4b62367f6'
assert binding(BASE / 'quality-directory-guard.patch')['sha256'] == 'sha256:9ef8c4d67cf4e310a4296bc829af3fad9a2907003931b68430ea94cf5fba7e50'
assert binding(EVIDENCE)['sha256'] == 'sha256:62c089449edef30530947396d0f5838eba67f5849fab2dd4b21a7466990bb3cd'
evidence = json.loads(EVIDENCE.read_bytes())
named_bindings = [*index['entryPoints'].values(), *index['originalTargetBindings'],
                  *index['candidateBindings'], *index['actualTestResultBindings'],
                  *index['actualCompiledClassBindings']]
for row in named_bindings:
    check(row)

recursive_bindings = []
def inspect(value):
    if isinstance(value, dict):
        if set(value) == {'path', 'sha256', 'byteLength'}:
            check(value)
            recursive_bindings.append(value)
        else:
            for item in value.values():
                inspect(item)
    elif isinstance(value, list):
        for item in value:
            inspect(item)
inspect(evidence)
assert evidence['results']['freshCandidate'] == {'tests': 8, 'failures': 0, 'errors': 0, 'skipped': 0}
assert evidence['results']['freshOriginalControl'] == {'tests': 4, 'failures': 3, 'errors': 0, 'skipped': 0}
assert evidence['results']['bothVariantMainAndTestClassesMatchAuthorBytes']
assert evidence['freshReplay']['identicalRegressionTestClassAcrossVariants']['byteIdentical']

patch = ''
diff_ops = {}
for rel in [MAIN, TEST]:
    original = (BASE / 'original' / rel).read_text()
    candidate = (BASE / 'candidate' / rel).read_text()
    patch += ''.join(difflib.unified_diff(original.splitlines(keepends=True), candidate.splitlines(keepends=True),
                      fromfile='a/' + rel, tofile='b/' + rel))
    diff_ops[rel] = [dict(operation=op, originalStart=i + 1, originalEnd=j,
                         candidateStart=a + 1, candidateEnd=b)
                    for op, i, j, a, b in difflib.SequenceMatcher(None, original.splitlines(), candidate.splitlines(), autojunk=False).get_opcodes()
                    if op != 'equal']
assert patch.encode() == (BASE / 'quality-directory-guard.patch').read_bytes()
patch_command = ['git', 'apply', '--check', '--directory=' + str(BASE / 'original'), str(BASE / 'quality-directory-guard.patch')]
patch_result = subprocess.run(patch_command, capture_output=True, text=True)
assert patch_result.returncode == 0, patch_result.stderr
verify_command = ['python3', str(BASE / 'verify-isolation.py')]
verify_result = subprocess.run(verify_command, capture_output=True, text=True)
assert verify_result.returncode == 0, verify_result.stderr
verification = json.loads(verify_result.stdout)
assert verification['activeOriginalInputsUnchanged'] == 14
assert verification['allCurrentProductionJavaInputsUnchanged'] == 444

full_reads = []
for source, line_count, chunks in [
        (BASE / 'original' / MAIN, 2151, [[1, 700], [701, 1400], [1401, 2151]]),
        (BASE / 'candidate' / MAIN, 2160, [[1, 700], [701, 1400], [1401, 2160]]),
        (BASE / 'original' / TEST, 166, [[1, 166]]),
        (BASE / 'candidate' / TEST, 252, [[1, 252]])]:
    assert len(source.read_text().splitlines()) == line_count
    full_reads.append(dict(**binding(source), fullActualTextRead=True, lineCount=line_count,
                           personallyReadInclusiveRanges=chunks,
                           method='Complete bounded tool outputs read by /root/requires_parallel_review; no truncated range or title/manifest-only inference.'))

findings = [
    {
        'id': 'relative-directory-boundary', 'decision': 'approved',
        'candidateLines': [864, 870],
        'reason': 'The helper iterates dir.relativize(directory), matching only a complete segment whose text is exactly lowercase quality. The normalized absolute configured root and all of its ancestors are outside that relative path. No substring, case-folding, filename, source subject or semantic-role inference occurs. The empty relative path for the root has no quality segment.',
        'actualRegression': 'acceptsQualityNamedRootNeighborDirectoriesAndJsonFilenameWithoutChangingOtherSourceScopes: configured quality/quality root accepted, nested relative quality excluded, quality-neighbor, nested quality-neighbor, Quality, quality.json, input and archive all accepted.'
    },
    {
        'id': 'three-admission-sites', 'decision': 'approved',
        'candidateLines': [725, 854, 1854],
        'reason': 'loadLandscapes and getLatestTimestamp prune with the same helper, and isRuntimeLandscapeJson checks the lexical file parent with that helper. Consequently excluded real landscape payloads never enter ordinary parsing, duplicate resolution or the goal index, and excluded JSON metadata never raises the ordinary reload watermark. The file predicate keeps the same regular-file and lowercase .json checks.',
        'actualRegression': 'Global quality, other/quality, DE/Gymnasium/quality and deeply nested DE/BY/FOS/nested/quality real landscapes and their goal ownership entries are absent. Metadata becoming a valid landscape remains absent.'
    },
    {
        'id': 'cache-and-timestamp-sequence', 'decision': 'approved',
        'candidateLines': [100, 149], 'lineOwner': 'candidate CurriculumDirectoryScanTest',
        'reason': 'The real service fixture starts with allowed mtime 10000 and excluded mtimes 30000. Excluded real-source edits become 40000 and excluded metadata becomes a landscape at 50000. After resetting only the check throttle, the actual cached SkillLandscape remains the identical object and both scanner/watermark stay 10000. A subsequent allowed edit at 20000 replaces that object, changes its title and moves the watermark to 20000 despite being older than all excluded files. This checks cache behavior and an observable accepted update, not just a helper-return assertion.',
        'controlLimit': 'Original-code controls fail first at catalog contents; they prove real original-code regressions but do not individually isolate the timestamp branch as a mutation test. The passing fresh candidate runs the entire timestamp sequence.'
    },
    {
        'id': 'walker-and-symlinks', 'decision': 'approved',
        'reason': 'PrunedFileTree itself is unchanged. Directory links remain untraversed; regular-file links remain lexically admitted and retain target-mtime reload behavior. No toRealPath or link-target quality exclusion is added. The helper is safe at the scan root, including unreadable root handling, because the relative path is empty rather than quality. Current walker paths are rooted under the same normalized absolute directory, so relativize receives compatible path kinds and providers.',
        'actualRegression': 'Sorted duplicate preference and file-link reload pass. All four permission/link PrunedFileTree tests execute without skips, including excluded unreadable directory, included unreadable directory and unreadable root.'
    },
    {
        'id': 'narrow-runtime-scope', 'decision': 'approved',
        'reason': 'The exact source delta deletes the single fixed-path constant, replaces the two ordinary prune lambdas and the file admission clause, and adds the helper. Sorting, putIfAbsent duplicate preference, goal IDs, source registry loading, explicit archived-source routes, package-backed constructor, source/applicability/provenance logic, localization, closure and search behavior are unchanged. This is an ordinary filesystem discovery guard, not an owner-conflict resolution, symlink sandbox or explicit registry activation policy.'
    },
    {
        'id': 'regression-test-quality', 'decision': 'approved',
        'reason': 'The old test now explicitly rejects other/quality, matching the intended policy instead of keeping its prior accidental admission. Two added full service tests separately assert catalog/goal-index exclusion with cache behavior and the permitted root/filename/case/neighbor/source boundaries. The mapping compatibility test remains byte-for-byte unchanged. Identical extended scan-test bytecode is used with the original and candidate service, preventing changed test expectations between controls.'
    },
    {
        'id': 'actual-replay-and-artifact-integrity', 'decision': 'approved',
        'reason': 'A distinct technical reviewer compiled the frozen complete source inputs and exact tests into fresh isolated source/build/project-cache trees. Candidate and original control produced the recorded 8/8 and 3/4 results; actual classes reproduce the author bytes, including identical scan-test classes across variants. Root source/CI output paths are not the compiled output or source paths. All named manifest, log, XML, class and pre/post input bindings were audited; this reviewer additionally checked the exact patch reconstruction and current author verifier.'
    }
]

review = {
    'schemaVersion': 1,
    'artifactId': 'runtime-quality-directory-guard-independent-code-review-20261013-v1',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'approved_exact_isolated_code_candidate_not_applied',
    'decision': 'approved',
    'reviewer': {'agent': '/root/requires_parallel_review', 'role': 'INDEPENDENT_CODE_REVIEWER',
                 'model': 'gpt-6.1-sol', 'reasoningEffort': 'ultra'},
    'authorAgent': '/root/requires_runtime_path',
    'independentFromAuthor': True,
    'approvalScope': 'Exactly the bound two-file code candidate: root-relative lowercase quality-directory exclusion for ordinary discovery/admission/reload scanning and its focused regression tests. Approval is code correctness and focused regression sufficiency only; no integration or full-suite/host/package/native acceptance is inferred.',
    'reviewedAuthorManifest': binding(index_path),
    'exactPatch': binding(BASE / 'quality-directory-guard.patch'),
    'originalActiveSourceAndTest': index['originalTargetBindings'],
    'candidateSourceAndTest': index['candidateBindings'][:2],
    'fullReadWitnesses': full_reads,
    'additionalCompletelyReadInputs': [binding(p) for p in [
        'backend/src/main/java/com/skillpilot/backend/landscape/PrunedFileTree.java',
        'backend/src/test/java/com/skillpilot/backend/landscape/PrunedFileTreeTest.java',
        BASE / 'prepare-candidate.py', BASE / 'verify-isolation.py',
        BASE / 'isolated.init.gradle', BASE / 'run-isolated-tests.sh',
        BASE / 'candidate-tests.log', BASE / 'original-control-tests.log',
        BASE / 'author-validation.json', BASE / 'INTEGRATION.md', EVIDENCE]],
    'exactFullFileDeltaOperations': diff_ops,
    'findings': findings,
    'blockingFindings': [],
    'freshIndependentExecutionReview': binding(EVIDENCE),
    'technicalReplayReviewer': evidence['reviewer'],
    'actualFreshReplayResults': evidence['results'],
    'authorManifestRowsAdditionallyCheckedByMainReviewer': len(named_bindings),
    'recursiveEvidenceRowsAdditionallyHashAndByteChecked': len(recursive_bindings),
    'recursiveEvidenceDistinctPathsAdditionallyChecked': len({r['path'] for r in recursive_bindings}),
    'actualReadOnlyChecks': [
        {'command': patch_command, 'exitCode': patch_result.returncode, 'exactPatchReconstructedFromEntireOriginalAndCandidate': True},
        {'command': verify_command, 'exitCode': verify_result.returncode,
         'activeOriginalInputsUnchanged': 14, 'allCurrentProductionJavaInputsUnchanged': 444}
    ],
    'remainingIntegrationGates': {
        'rootCurrentOriginalCodeCICompletion': 'pending; controlled by root, not inferred here',
        'activeBaselineFreshnessImmediatelyBeforeApplyingExactPatch': 'pending',
        'candidateAppliedToActiveCode': False,
        'postIntegrationFocusedAndRequiredBroaderChecks': 'pending',
        'nativeGoalOrSourceOwnerOrPlacementOrRequiresApproval': 'not granted',
        'hostOrPackageAcceptance': 'not granted',
        'publicationOrDeployment': 'not performed'
    },
    'isolation': {
        'reviewWrittenOnlyUnderTmp': True, 'sealedAuthorArtifactsOverwritten': False,
        'activeSourceTestsViewsNativeGatesLearnerStateChanged': False,
        'rootRunningCIIndexReadOrWritten': False, 'patchApplied': False,
        'noGoalIdsOwnersMasteryProviderOrPublicationChanged': True,
        'archiveWrittenByThisReview': False
    },
    'licensing': 'Apache-2.0 technical code-review and verification metadata; no third-party dependency rights are changed.',
    'sealHelper': binding(Path(__file__).relative_to(Path.cwd()) if Path(__file__).is_absolute() else Path(__file__)),
}
with OUT.open('x') as f:
    f.write(json.dumps(review, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(binding(OUT), indent=2))
