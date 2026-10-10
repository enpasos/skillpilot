#!/usr/bin/env python3
"""One-way inactive author input seal; no review verdict and no activation."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
SEAL = HERE / 'AUTHOR.current206-two-B007.final.freeze.json'
ENTRY = HERE / 'neutral-current206-two-B007-author.entry.json'
assert not SEAL.exists() and not ENTRY.exists(), 'Never overwrite a sealed author package'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

checks = read(HERE / 'checks/targeted-author-portability-lineage-and-schemas.actual.json')
assert checks['normalPRecords'] == 6 and checks['PApproved'] == 0 and not checks['requiredIgnoredInputs']
native = read(HERE / 'checks/actual-native-routes-source-view-and-protected206.result.json')
assert native['nativePurePageCounts'] == {'current': 398, 'candidate': 402}
assert native['protected206GoalFingerprintExactCount'] == 206
assert native['targetedExistingHEView']['findings'] == []
for path in [
    'checks/current-native-402-atomic-routes.attempt3.terminal.actual.json',
    'checks/native-six-description-batch-prepare.terminal.actual.json',
    'checks/native-six-description-batch-check.terminal.actual.json',
    'checks/native-contexts-bounded-render.attempt2.terminal.actual.json',
    'checks/positive-v2-materialization-final-verify.terminal.actual.json',
    'checks/targeted-portability-and-lineage.attempt2.terminal.actual.json',
]:
    assert read(HERE / path)['exitCode'] == 0, path
for row in read(HERE / 'sources/current-original-whole-source-row-preservation-and-real-deltas.actual.json')['currentFileBindings']:
    assert bind(ROOT / row['path']) == row, row['path']

# Inspect only this namespace's process matches, avoiding unrelated command lines.
own_running = []
for item in Path('/proc').iterdir():
    if not item.name.isdigit() or int(item.name) == os.getpid():
        continue
    try:
        argv = (item / 'cmdline').read_bytes().split(b'\0')
    except (FileNotFoundError, PermissionError, ProcessLookupError):
        continue
    # The wrapper waiting for this seal is not a package writer.
    executable = Path(os.fsdecode(argv[0])).name if argv and argv[0] else ''
    if executable not in {'python', 'python3', 'node', 'tsx'}:
        continue
    if any(HERE.as_posix().encode() in arg or HERE.relative_to(ROOT).as_posix().encode() in arg for arg in argv[1:]):
        if any(b'seal-neutral-author-inputs.py' in arg for arg in argv):
            continue
        own_running.append({'pid': int(item.name), 'executable': executable})
assert not own_running, own_running

paths = [path for path in HERE.rglob('*') if path.is_file()]
assert not any(path.is_symlink() for path in HERE.rglob('*'))
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(path.relative_to(ROOT).as_posix() for path in paths) + '\n', text=True, capture_output=True, cwd=ROOT)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
stamp = datetime.now(timezone.utc).isoformat()
write(ENTRY, {
    'schemaVersion': 1, 'createdAtUTC': stamp,
    'role': 'sealed inactive author successor input entry for two independent targeted reviews; no gate approval',
    'authorPackagePath': HERE.relative_to(ROOT).as_posix(),
    'originalTwoGoalIds': ['7be6f951-a614-52dc-94d3-2ce0d33765ff', '53fd1bfd-facb-54ae-b2dc-f667ed1414fc'],
    'currentWholeGoals': 517, 'currentCurricularAtomic': 398, 'currentStrictCheckpoint': 206,
    'candidateWholeGoals': 523, 'candidateCurricularAtomicIntent': 402,
    'candidateAtomicRoles': read(HERE / 'current-inputs-and-preservation.author.json')['sixPriorCandidateGoalIds'],
    'descriptionConfig': bind(HERE / 'candidate/candidate-six.batch.config.json'),
    'descriptionNativeBundle': bind(HERE / 'native/six-candidate/bundle/manifest.json'),
    'independentReviewScopeAndFindings': bind(HERE / 'native/independent-review-scope-and-open-finding-list.neutral.json'),
    'fullCandidatePConfig': bind(HERE / 'materials/six-positive-evidence-v2.config.json'),
    'fullCases': bind(HERE / 'materials/twelve-whole-cases.de-en.unchanged.json'),
    'currentWholeSourceDutyInventory': bind(HERE / 'sources/current-original-whole-source-row-preservation-and-real-deltas.actual.json'),
    'normalTargetedChecks': bind(HERE / 'checks/targeted-author-portability-lineage-and-schemas.actual.json'),
    'currentNativeRouteAndContextProof': bind(HERE / 'checks/actual-native-routes-source-view-and-protected206.result.json'),
    'normalNativeContextRenderProof': bind(HERE / 'checks/native-affected-context-render-and-responsive-captures.actual.json'),
    'currentImageKeepDecision': bind(HERE / 'image-preservation-and-actual-responsive-inspection.author.json'),
    'allOriginal517IDsRetained': True, 'allCurrent206StrictIDsRetained': True,
    'current206SemanticFingerprintsExact': True, 'currentStrictWholeObjectsExact': 201,
    'protectedCurrentPageContextsNeedingReview': 8, 'unchangedProtectedContextsNotRescheduled': 198,
    'normalCandidatePStatus': 'needs_human_review/ai_candidate/E1/G1; approved0',
    'remainingRegionalSourceViews': 39, 'remainingActualSourceCPV009': 70,
    'newAtomicImageBindingsMissing': 6, 'newRequiredPrimaryCardsPendingVisibility': 2,
    'independentSuccessorReviewsCompleted': 0, 'genuineNewIndependentApproval': False,
    'historicalOwnFrozenFilesVerified': 98, 'priorSourceReviewOwnFilesVerified': 33,
    'requiredIgnoredPaths': [], 'requiredScratchPrimarySources': [], 'ownRunningWriterProcesses': [],
    'originalFailureArtifactsPreserved': True,
    'sourceHoldsCleared': 0, 'strictGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindings': 0,
    'activeWrites': False, 'humanApproval': False, 'humanTrial': False,
    'integrationAuthority': 'ROOT-ONLY after all current original source/course/native D/P/A/M/V findings and protected bindings are resolved',
})
files = [bind(path) for path in sorted(HERE.rglob('*')) if path.is_file()]
write(SEAL, {
    'schemaVersion': 1, 'sealedAtUTC': stamp,
    'role': 'immutable author input seal; no scientific approval or M7 activation',
    'entry': bind(ENTRY), 'files': files,
    'ownRegularFileCount': len(files), 'ownRegularFileBytes': sum(row['bytes'] for row in files),
    'requiredPortableInputs': checks['requiredPortableInputBindings'],
    'currentSourceInputBindings': read(HERE / 'sources/current-original-whole-source-row-preservation-and-real-deltas.actual.json')['currentFileBindings'],
    'activeWrites': False, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'entry': bind(ENTRY), 'seal': bind(SEAL), 'ownRegularFilesExcludingSeal': len(files), 'ownRegularFileBytesExcludingSeal': sum(row['bytes'] for row in files), 'requiredIgnoredInputs': [], 'activeWrites': False, 'strictGain': 0}))
