#!/usr/bin/env python3
"""One-way technical input seal; no scientific approval or active writes."""
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
OLD = HERE.with_name('chemie-b007-two-current206-targeted-author-successor-20261010-v1')
ENTRY = HERE / 'neutral-current206-two-B007-technical-successor.entry.json'
SEAL = HERE / 'FINAL.current206-two-B007-technical-successor.freeze.json'
assert not ENTRY.exists() and not SEAL.exists(), 'Never overwrite a sealed entry or freeze'


def read(path):
    return json.loads(path.read_text())


def bind(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(row):
    path = ROOT / row['path']
    assert path.is_file() and not path.is_symlink(), row['path']
    actual = bind(path)
    assert actual['sha256'] == row['sha256'].removeprefix('sha256:'), row['path']
    if 'bytes' in row:
        assert actual['bytes'] == row['bytes'], row['path']
    return actual


old_seal_path = OLD / 'AUTHOR.current206-two-B007.final.freeze.json'
old_seal = read(old_seal_path)
old_files = [verify(row) for row in old_seal['files']]
assert len(old_files) == 125
old56 = [verify(row) for row in old_seal['currentSourceInputBindings']]
assert len(old56) == 56
old_required = [verify(row) for row in old_seal['requiredPortableInputs']]
result = read(HERE / 'checks/normal-current-atlas-native-contexts.result.json')
actual_inputs = [verify(row) for row in result['currentByteInputBindings']]
delta = read(HERE / 'checks/original56-and-additive-BY-main-delta.actual.json')
verify(delta['byMainCurrent'])
verify(delta['byMainPortableCurrentSnapshot'])
source_rows = read(HERE / 'checks/original413-current-whole-values.still-exact.json')
assert source_rows['sourceRowsChecked'] == 413 and source_rows['distinctSourceGoalIds'] == 403
assert not source_rows['newRestoredBYSourceIdsOverlappingOriginal413B007Duties']
overlap = read(HERE / 'checks/current-operative-BY-main-vs-original-B007-overlay.full-value-deltas.json')
assert overlap['originalBYB007Rows'] == overlap['originalReferenceRowsStillOperativelyPresent'] == 8
assert len(overlap['wholeOperativeMappingOrDecisionDifferences']) == 2
checks = []
for name in ['normal-current-atlas-native-contexts.attempt2', 'normal-source-atlas-regressions', 'normal-current-native-description-check', 'normal-current-positive-v2-verify']:
    path = HERE / f'checks/{name}.terminal.actual.json'
    assert read(path)['exitCode'] == 0
    checks.append(bind(path))

# The normal repository guard is used directly, without any path exemption.
spec = importlib.util.spec_from_file_location('normal_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
link_errors = module.curriculum_symlink_errors(ROOT)
assert not link_errors, link_errors
required = list({row['path']: row for row in old_files + old_required + old56 + actual_inputs + [bind(old_seal_path), verify(delta['rootRestorationProof'])] + [verify(row) for row in delta['originalIndependentScienceProofs']]}.values())
own_before = [path for path in HERE.rglob('*') if path.is_file()]
assert not any(path.is_symlink() for path in HERE.rglob('*'))
all_paths = [row['path'] for row in required] + [path.relative_to(ROOT).as_posix() for path in own_before]
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(all_paths) + '\n', text=True, capture_output=True, cwd=ROOT)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
parsed = []
for path in own_before:
    if path.suffix == '.json':
        read(path)
        parsed.append(bind(path))
portability = {
    'schemaVersion': 1, 'role': 'normal symlink guard and exact whole-byte dependency verification; no independent review',
    'originalOwnFrozenFilesVerified': 125, 'original56SourceBindingsExact': True,
    'normalCurriculumSymlinkErrors': link_errors, 'ownSymlinks': [], 'requiredIgnoredPaths': [],
    'ownJsonFilesFullyParsedBeforeSeal': parsed, 'requiredPortableInputs': required,
    'normalCurrentChecks': checks, 'requiredScratchSourceDocuments': [],
    'sourceSnapshotDocumentsAreNormalDeclaredOfflineContracts': True,
    'oldScratchDependentPlanningScriptIsHistoricalOnlyAndNotExecuted': True,
    'activeWrites': False, 'strictGain': 0, 'independentScientificReview': False, 'humanApproval': False,
}
portability_path = HERE / 'checks/current-technical-portability-and-normal-symlink-guard.actual.json'
portability_path.write_text(json.dumps(portability, ensure_ascii=False, indent=2) + '\n')
old_entry = read(OLD / 'neutral-current206-two-B007-author.entry.json')
entry = {
    'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'sealed inactive additive technical successor for fresh independent B007 author reviews; not a scientific approval',
    'oldAuthorPackage': OLD.relative_to(ROOT).as_posix(), 'oldAuthorEntry': bind(OLD / 'neutral-current206-two-B007-author.entry.json'),
    'oldAuthorFreeze': bind(old_seal_path), 'oldAuthorOwnFilesExact': 125, 'old56DeclaredSourceBindingsExact': True,
    'actualChangedAmongOriginal56Bindings': 0, 'addedOperativeBindingCoverage': 'Current BY main mapping and full current normal source-atlas dependencies; original56 binds an older BY overlay.',
    'currentWholeGoals': 517, 'currentCurricularAtomic': 398, 'currentStrictCheckpoint': 206,
    'candidateWholeGoals': 523, 'candidateCurricularAtomicIntent': 402,
    'originalTwoGoalIds': old_entry['originalTwoGoalIds'], 'candidateAtomicRoles': old_entry['candidateAtomicRoles'],
    'descriptionConfig': old_entry['descriptionConfig'], 'descriptionNativeBundle': old_entry['descriptionNativeBundle'],
    'unchangedPriorIndependentReviewScope': old_entry['independentReviewScopeAndFindings'],
    'fullCandidatePConfig': old_entry['fullCandidatePConfig'], 'fullCases': old_entry['fullCases'],
    'currentWholeSourceDutyInventory': old_entry['currentWholeSourceDutyInventory'],
    'currentImageKeepDecision': old_entry['currentImageKeepDecision'],
    'currentOperativeBYMainMapping': delta['byMainCurrent'], 'portableBYMain483Snapshot': delta['byMainPortableCurrentSnapshot'],
    'actualBYTwoRestorations': bind(HERE / 'checks/original56-and-additive-BY-main-delta.actual.json'),
    'original413CurrentWholeValuesStillExact': bind(HERE / 'checks/original413-current-whole-values.still-exact.json'),
    'additionalExistingOperativeBYB007OverlapFindings': bind(HERE / 'checks/current-operative-BY-main-vs-original-B007-overlay.full-value-deltas.json'),
    'additionalWholeDecisionOverlapSourceIds': [row['sourceGoalId'] for row in overlap['wholeOperativeMappingOrDecisionDifferences']],
    'overlapStatus': 'HOLD; existing Source24 authorCandidateBoundary fields retained and pending independent review; no technical whole-source/course approval',
    'freshNormalAtlasAndNativeContextProof': bind(HERE / 'checks/normal-current-atlas-native-contexts.result.json'),
    'normalCurrentAtlasReceipt': bind(HERE / 'checks/current-chemistry-source-atlas.compact.actual.json'),
    'normalTargetedCheckReceipts': checks, 'portabilityAndNormalSymlinkGuard': bind(portability_path),
    'allOriginal517IdsRetained': True, 'strict206DPGoalFingerprintsExact': True, 'strictWholeGoalObjectsExact': 201,
    'protectedPageContextsStillNeedingReview': 8, 'unchangedProtectedContextsNotRescheduled': 198,
    'candidateScientificMaterialUnchangedFromAuthorV1': True, 'nativeWholeSelectedPagesAndContextObjectsExactFromAuthorV1': True,
    'actualRestoredBYTargetsOverlappingChangedB007PageContexts': [],
    'normalCandidatePStatus': 'needs_human_review/ai_candidate/E1/G1; approved0',
    'remainingRegionalSourceViews': 39, 'remainingActualSourceCPV009': 70,
    'newAtomicImageBindingsMissing': 6, 'newRequiredPrimaryCardsPendingVisibility': 2,
    'independentSuccessorReviewsCompleted': 0, 'genuineNewIndependentApproval': False,
    'sourceHoldsCleared': 0, 'strictGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindingsByThisPackage': 0,
    'activeWrites': False, 'runtimeChanges': False, 'GitMutations': False, 'GitHubWrites': False,
    'wholeCentralExecuted': False, 'fullBuildExecuted': False, 'humanApproval': False, 'humanTrial': False,
    'reviewInstructions': 'Independently review the full current B007 author candidate plus the current operative source inputs and both whole BY overlap decisions. Prior science is reference only. Preserve original source/course duties; do not grant new independent approval from this technical seal.',
    'integrationAuthority': 'ROOT-ONLY after all required fresh findings and D/P/A/M/V/source/context bindings resolve',
}
with ENTRY.open('x') as handle:
    handle.write(json.dumps(entry, ensure_ascii=False, indent=2) + '\n')
read(ENTRY)
files = [bind(path) for path in sorted(HERE.rglob('*')) if path.is_file() and path != SEAL]
seal = {
    'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'immutable technical successor input seal, not scientific approval or active M7 completion',
    'entry': bind(ENTRY), 'files': files, 'ownRegularFileCountExcludingSeal': len(files),
    'ownRegularFileBytesExcludingSeal': sum(row['bytes'] for row in files),
    'requiredPortableInputs': required, 'sourceSnapshotContracts': result['sourceSnapshotContractsFromNormalConfig'],
    'activeWrites': False, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
}
with SEAL.open('x') as handle:
    handle.write(json.dumps(seal, ensure_ascii=False, indent=2) + '\n')
read(SEAL)
for row in files + required:
    verify(row)
print(json.dumps({'entry': bind(ENTRY), 'freeze': bind(SEAL), 'ownFilesIncludingSeal': len(files) + 1, 'ownBytesIncludingSeal': seal['ownRegularFileBytesExcludingSeal'] + SEAL.stat().st_size, 'requiredPortableInputs': len(required), 'normalCurriculumSymlinkErrors': [], 'strictGain': 0, 'activeWrites': False}))
