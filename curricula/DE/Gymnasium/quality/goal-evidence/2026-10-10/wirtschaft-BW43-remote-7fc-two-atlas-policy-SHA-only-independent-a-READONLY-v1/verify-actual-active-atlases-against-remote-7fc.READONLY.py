import datetime
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path.cwd()
OWN = pathlib.Path(__file__).resolve().parent
REMOTE = '7fc85cee30efe35eb9f85be8e05be31a92edda1c'
ECONOMICS = 'f1e452067771291acc02ac0b99b6dcc3f3cb08ed'
POLICY = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
REGISTRY = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
ECONOMICS_CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
COMMAND_PATH = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final702-stable-M6-CI-root-v1/remote-7fc-targeted-merge-final.actual-command-receipts.json'
PREVIOUS = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-remote-cd7-two-atlas-policy-SHA-only-independent-a-READONLY-v1'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git_bytes(rev, path):
    return subprocess.check_output(['git', 'show', rev + ':' + path], cwd=ROOT)


def artifact(path):
    path = pathlib.Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(data), 'bytes': len(data)}


def current(path):
    return (ROOT / path).read_bytes()


def write_json(name, value):
    path = OWN / name
    assert not path.exists(), 'Additive artifacts must never overwrite a prior seal.'
    path.write_text(json.dumps(value, indent=2) + '\n')
    return artifact(path)


previous_manifest = json.loads(current(PREVIOUS + '/actual-remote-cd7-native78-output-baseline.EXACT.json'))
remote_tracked_paths = set(subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', REMOTE], cwd=ROOT).decode().splitlines())
previous_seal = PREVIOUS + '/SEALED-independent-post-cd7-active-two-foreign-atlas-SHA-only.READONLY.json'
assert sha(current(previous_seal)) == '8a9ddc79686f71e21069b38a787b7c63107fca7c20e5f2e2b4dea47d22911eac'
assert previous_manifest['totalOutputs'] == 78
policy_bytes = current(POLICY)
assert policy_bytes == git_bytes(ECONOMICS, POLICY)
assert sha(policy_bytes) == '1bfb4a8fb052c9b0427719fb3d87206b1312e5e296e06fcf7f12e9b830c70c00'
assert current(REGISTRY) == git_bytes(ECONOMICS, REGISTRY)
assert current(ECONOMICS_CANONICAL) == git_bytes(ECONOMICS, ECONOMICS_CANONICAL)

phase = json.loads(current(COMMAND_PATH))
expected_command_names = ['native-chemistry-atlas-regenerate', 'native-chemistry-atlas-check', 'native-atlas-regression', 'remote-qualified-chemistry-evidence-watch']
completed = []
for name in expected_command_names:
    matches = [row for row in phase['results'] if row['name'] == name]
    assert len(matches) == 1
    row = matches[0]
    assert row['exitCode'] == 0
    assert sha(current(row['rawOutputPath'])) == row['rawOutputSha256']
    completed.append(row)
assert '--check' not in completed[0]['command'] and '--check' in completed[1]['command']
assert 'app/scripts/buildGoalBookSourceAtlasInputs.ts' in completed[0]['command']
assert 'app/scripts/buildGoalBookSourceAtlasInputs.ts' in completed[1]['command']
assert any('testGoalBookSourceAtlasInputs' in part for part in completed[2]['command'])

active_paths = {POLICY, REGISTRY, ECONOMICS_CANONICAL}
code_paths = ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/buildGoalBookSourceAtlasInputs.ts', 'app/scripts/testGoalBookSourceAtlasInputs.ts']
active_paths.update(code_paths)
active_paths.update(row['rawOutputPath'] for row in completed)
remote_baseline_books = []
for previous_book in previous_manifest['books']:
    receipt_path = previous_book['receipt']['path']
    receipt_bytes = git_bytes(REMOTE, receipt_path)
    receipt = json.loads(receipt_bytes)
    config_path = previous_book['config']['path']
    remote_outputs = [{'path': item['path'], 'sha256': sha(git_bytes(REMOTE, item['path'])), 'bytes': len(git_bytes(REMOTE, item['path']))} for item in receipt['outputBindings']]
    assert len(remote_outputs) == len(previous_book['otherNativeGeneratedOutputs'])
    assert {item['path'] for item in remote_outputs} == {item['path'] for item in previous_book['otherNativeGeneratedOutputs']}
    remote_baseline_books.append({'subject': previous_book['subject'], 'bookId': receipt['bookId'], 'config': {'path': config_path, 'sha256': sha(git_bytes(REMOTE, config_path)), 'bytes': len(git_bytes(REMOTE, config_path))}, 'receipt': {'path': receipt_path, 'sha256': sha(receipt_bytes), 'bytes': len(receipt_bytes)}, 'counts': receipt['counts'], 'claims': receipt['claims'], 'otherNativeGeneratedOutputs': remote_outputs})
    active_paths.update(item['path'] for item in receipt['inputBindings'] if (ROOT / item['path']).exists())
    active_paths.update(item['path'] for item in receipt['outputBindings'])
    active_paths.update([receipt_path, config_path])
before_guards = [artifact(ROOT / path) for path in sorted(active_paths)]

books = []
for book in remote_baseline_books:
    config_path = book['config']['path']
    assert current(config_path) == git_bytes(REMOTE, config_path)
    before_bytes = git_bytes(REMOTE, book['receipt']['path'])
    after_bytes = current(book['receipt']['path'])
    before = json.loads(before_bytes)
    after = json.loads(after_bytes)
    config = json.loads(current(config_path))
    snapshots = {row['path']: row for row in config.get('sourceDocumentSnapshots', [])}
    indexes = [i for i, row in enumerate(before['inputBindings']) if row['path'] == POLICY]
    assert len(indexes) == 1
    index = indexes[0]
    old_sha = before['inputBindings'][index]['sha256']
    new_sha = 'sha256:' + sha(policy_bytes)
    expected = json.loads(before_bytes)
    expected['inputBindings'][index]['sha256'] = new_sha
    assert after == expected
    assert old_sha != new_sha and before_bytes.count(old_sha.encode()) == 1
    assert before_bytes.replace(old_sha.encode(), new_sha.encode()) == after_bytes
    input_guards = []
    for row in after['inputBindings']:
        path = row['path']
        if not (ROOT / path).exists():
            assert path in snapshots and snapshots[path]['sha256'] == row['sha256']
            assert row == before['inputBindings'][next(i for i, item in enumerate(before['inputBindings']) if item['path'] == path)]
            input_guards.append({'path': path, 'sha256': row['sha256'], 'actualCachedFilePresent': False, 'nativeConfigBoundSnapshot': snapshots[path], 'configWholeExactToRemote7fc': True, 'bindingWholeExactToRemote7fc': True, 'cachedWholeBytesReadClaim': False})
            continue
        assert row['sha256'] == 'sha256:' + sha(current(path))
        if path != POLICY and path in remote_tracked_paths:
            assert current(path) == git_bytes(REMOTE, path), path
        if path != POLICY and path not in remote_tracked_paths:
            old_row = next(item for item in before['inputBindings'] if item['path'] == path)
            assert row == old_row
            if path in snapshots:
                assert snapshots[path]['sha256'] == row['sha256']
            input_guards.append({**artifact(ROOT / path), 'actualCachedFilePresent': True, 'actualCachedSHAExactlyRemoteReceiptBinding': True, 'nativeConfigSnapshotWhenConfigured': snapshots.get(path), 'wholeRemoteGitFileComparisonClaim': False})
        else:
            input_guards.append({**artifact(ROOT / path), 'wholeExactToRemote7fc': path != POLICY, 'wholeExactToQualifiedEconomicsF1': path == POLICY})
    output_guards = []
    for row in after['outputBindings']:
        path = row['path']
        assert current(path) == git_bytes(REMOTE, path), path
        assert row['sha256'] == 'sha256:' + sha(current(path))
        output_guards.append({**artifact(ROOT / path), 'wholeExactToRemote7fc': True})
    expected_names = {pathlib.Path(row['path']).name for row in output_guards if pathlib.Path(row['path']).parent == pathlib.Path(config['outputDirectory'])}
    expected_names.add('source-projection.receipt.json')
    assert expected_names == {path.name for path in (ROOT / config['outputDirectory']).iterdir() if path.is_file()}
    if book['subject'] == 'biology':
        assert after_bytes == git_bytes(ECONOMICS, book['receipt']['path'])
        assert all(current(row['path']) == git_bytes(ECONOMICS, row['path']) for row in output_guards)
    books.append({'subject': book['subject'], 'bookId': book['bookId'], 'remoteReceipt': book['receipt'], 'activeReceipt': artifact(ROOT / book['receipt']['path']), 'onlyJSONDelta': {'path': '/inputBindings/' + str(index) + '/sha256', 'before': old_sha, 'after': new_sha}, 'wholeReceiptBytesRemoteExactExceptOnePolicySHA': True, 'countsWholeExact': after['counts'], 'claimsWholeExact': after['claims'], 'allOtherScopeWitnessAndOmissionFieldsWholeExact': True, 'allNativeInputBindingsMatchActualOrNativeSnapshotAndRemoteBindingsExceptPolicy': input_guards, 'allOtherNativeGeneratedOutputsWholeRemoteExact': output_guards, 'biologyAllOutputsAdditionallyWholeExactToEconomicsF1': book['subject'] == 'biology', 'noExtraOrMissingNativeOutputFiles': True})
assert sum(len(book['allOtherNativeGeneratedOutputsWholeRemoteExact']) for book in books) == 76
for path in code_paths:
    assert current(path) == git_bytes(REMOTE, path)
for path in code_paths[:2]:
    assert git_bytes(REMOTE, path) == git_bytes('cd7f5d3455676954d43d34743d659cf86388fbbd', path)
end_guards = [artifact(ROOT / path) for path in sorted(active_paths)]
assert before_guards == end_guards

baseline_artifact = write_json('actual-remote7fc-native78-output-baseline.EXACT.json', {'remoteCommit': REMOTE, 'books': remote_baseline_books, 'totalOutputs': 78, 'notRelativeToObsoleteChemistry381Baseline': True})
command_artifact = write_json('actual-four-completed-targeted-merge-native-command-rows.EXACT.json', {'sourcePathOnlyMutablePhaseReceiptNotHashBound': COMMAND_PATH, 'completedRows': completed, 'fullCIOrContinuingCentralReportCompletionClaim': False})
receipt_artifact = write_json('actual-independent-remote7fc-active78-atlas-two-policy-SHA-only-KEEP.SEALED.receipt.json', {
    'role': 'independent_READONLY_actual_remote7fc_native_atlas_binding_closure', 'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'decision': 'KEEP',
    'remoteBaselineCommit': REMOTE, 'qualifiedEconomicsBaselineCommit': ECONOMICS, 'observedHEAD': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip(),
    'remoteNative78OutputBaseline': baseline_artifact, 'completedFourTargetedRootCommandsOnly': command_artifact, 'immutableCompletedRawLogs': [artifact(ROOT / row['rawOutputPath']) for row in completed],
    'previousCd7KEEPImmutable': artifact(ROOT / previous_seal), 'books': books, 'totalActualNativeOutputs': 78, 'wholeRemoteExactNonReceiptOutputs': 76, 'onlyPolicySHAChangedReceipts': 2,
    'wholeRegistryAndEconomicsCanonicalExactToQualifiedF1': [artifact(ROOT / REGISTRY), artifact(ROOT / ECONOMICS_CANONICAL)], 'wholeQualifiedPolicyExactToF1': artifact(ROOT / POLICY),
    'wholeNativeAtlasCodeAndRegressionTestExactToRemote7fc': [artifact(ROOT / path) for path in code_paths],
    'reviewedRemoteTestDelta': 'Exactly24 added lines require direct BY C10 child mappings597ac03c partial/9751b6d8 exact, whole parent+child decisions without sibling import and direct source-metadata witnesses. No gate/threshold changes. Remote source science preserved as history, not reviewed again.',
    'activeBeforeGuards': before_guards, 'activeEndGuards': end_guards, 'activeWrites': 0, 'agentNativeGeneratorsChecksOrBuildsExecuted': 0,
    'newForeignScientificOrHumanApprovalClaim': False, 'globalCIOrContinuingReportCompletionClaim': False, 'mutableWholeRootPhaseReceiptNotHashBound': True,
    'reviewerBoundary': 'Technical exact-output integration verification only. Remote Chemistry source-repair scientific state and existing Biology scientific state are preserved, with no new content/source/scope/threshold approval. Previous own Economics NAIRU/scope/partial-source/practice authorship disclosed and unrelated to foreign atlas authorship.'
})
assert [artifact(ROOT / path) for path in sorted(active_paths)] == before_guards
seal_artifact = write_json('SEALED-independent-remote7fc-native78-output-two-policy-SHA-only.READONLY.json', {'role': 'SEALED_independent_remote7fc_atlas_READONLY_KEEP', 'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'decision': 'KEEP', 'receipt': receipt_artifact, 'artifacts': [artifact(path) for path in sorted(OWN.iterdir()) if path.is_file()], 'activeEndGuards': end_guards, 'activeWrites': 0, 'agentGeneratorsGlobalChecksOrBuilds': 0, 'foreignScienceOrHumanApprovalClaim': False, 'mutablePhaseReceiptNotHashBound': True, 'sealRule': 'Immutable after seal; further changes need a new additive directory.'})
print(json.dumps({'decision': 'KEEP', 'outputs': 78, 'wholeRemoteExactNonReceiptOutputs': 76, 'onlyTwoPolicySHAChanges': True, 'guardedActivePaths': len(before_guards), 'receipt': receipt_artifact, 'seal': seal_artifact, 'activeWrites': 0}, indent=2))
