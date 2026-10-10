import datetime
import hashlib
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path.cwd()
OWN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-remote-cd7-two-atlas-policy-SHA-only-independent-a-READONLY-v1'
REMOTE = 'cd7f5d3455676954d43d34743d659cf86388fbbd'
POLICY = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
assert len(sys.argv) == 2, 'The actual completed Root command receipt path is required; wait for Root completion.'
COMMAND_PATH = ROOT / sys.argv[1]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def artifact(path):
    path = pathlib.Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(data), 'bytes': len(data)}


def load(path):
    return json.loads(pathlib.Path(path).read_text())


def remote(path):
    return subprocess.check_output(['git', 'show', REMOTE + ':' + path], cwd=ROOT)


def differences(before, after, path=''):
    if before == after:
        return []
    if isinstance(before, dict) and isinstance(after, dict):
        return [delta for key in sorted(set(before) | set(after))
                for delta in differences(before.get(key), after.get(key), path + '/' + key)]
    if isinstance(before, list) and isinstance(after, list) and len(before) == len(after):
        return [delta for index, (old, new) in enumerate(zip(before, after))
                for delta in differences(old, new, path + '/' + str(index))]
    return [{'path': path, 'before': before, 'after': after}]


baseline_path = OWN / 'actual-remote-cd7-native78-output-baseline.EXACT.json'
baseline = load(baseline_path)
assert baseline['remoteCommit'] == REMOTE and baseline['totalOutputs'] == 78
policy_sha = sha((ROOT / POLICY).read_bytes())
assert policy_sha == '1bfb4a8fb052c9b0427719fb3d87206b1312e5e296e06fcf7f12e9b830c70c00'
command_snapshot = load(COMMAND_PATH)
completed_commands = []
for book in baseline['books']:
    config_path = book['config']['path']
    for check_mode in [False, True]:
        matches = [row for row in command_snapshot['results']
                   if 'app/scripts/buildGoalBookSourceAtlasInputs.ts' in row['command']
                   and config_path in row['command']
                   and ('--check' in row['command']) == check_mode]
        assert len(matches) == 1, (book['subject'], check_mode, 'Exactly one actual completed generator/check command required')
        row = matches[0]
        assert row['exitCode'] == 0
        assert sha((ROOT / row['rawOutputPath']).read_bytes()) == row['rawOutputSha256']
        completed_commands.append(row)
completed_path = OWN / 'actual-four-completed-post-merge-native-generator-check-rows.EXACT.json'
completed_path.write_text(json.dumps({
    'sourcePathOnlyMutableWholePhaseNotHashBound': str(COMMAND_PATH.relative_to(ROOT)),
    'completedRows': completed_commands,
    'sourcePhaseCompleteAtRead': command_snapshot['phaseComplete'],
    'fullCIOrContinuingBookPhaseCompletionClaim': False
}, indent=2) + '\n')

active_paths = {POLICY, 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/buildGoalBookSourceAtlasInputs.ts'}
for book in baseline['books']:
    active_paths.add(book['config']['path'])
    active_paths.add(book['receipt']['path'])
    active_paths.update(item['path'] for item in book['otherNativeGeneratedOutputs'])
active_paths.update(row['rawOutputPath'] for row in completed_commands)
before_guards = [artifact(ROOT / path) for path in sorted(active_paths)]
books = []
unchanged_count = 0
for book in baseline['books']:
    config_path = book['config']['path']
    config_bytes = (ROOT / config_path).read_bytes()
    assert config_bytes == remote(config_path)
    assert artifact(ROOT / config_path) == book['config']
    unchanged = []
    for item in book['otherNativeGeneratedOutputs']:
        current_bytes = (ROOT / item['path']).read_bytes()
        assert current_bytes == remote(item['path']), item['path']
        assert artifact(ROOT / item['path']) == item
        unchanged.append({**item, 'wholeBytesExactToRemoteCd7': True})
    receipt_path = book['receipt']['path']
    original_bytes = remote(receipt_path)
    current_bytes = (ROOT / receipt_path).read_bytes()
    assert sha(original_bytes) == book['receipt']['sha256']
    before = json.loads(original_bytes)
    after = json.loads(current_bytes)
    deltas = differences(before, after)
    assert len(deltas) == 1
    delta = deltas[0]
    index = int(delta['path'].split('/')[2])
    assert delta['path'] == '/inputBindings/' + str(index) + '/sha256'
    assert before['inputBindings'][index]['path'] == after['inputBindings'][index]['path'] == POLICY
    assert delta['before'] == 'sha256:2b6185cd2c2f257a2410a36617f1d24b6e2e5a19bb40dcdab82d32786b0878d9'
    assert delta['after'] == 'sha256:' + policy_sha
    assert original_bytes.count(delta['before'].encode()) == 1
    assert original_bytes.replace(delta['before'].encode(), delta['after'].encode()) == current_bytes
    assert before['counts'] == after['counts'] == book['counts']
    assert before['claims'] == after['claims'] == book['claims']
    assert {item['path'] for item in after['outputBindings']} == {item['path'] for item in unchanged}
    for binding in after['outputBindings']:
        assert 'sha256:' + sha((ROOT / binding['path']).read_bytes()) == binding['sha256']
    config = json.loads(config_bytes)
    direct_names = {pathlib.Path(item['path']).name for item in unchanged
                    if pathlib.Path(item['path']).parent == pathlib.Path(config['outputDirectory'])}
    direct_names.add('source-projection.receipt.json')
    assert direct_names == {path.name for path in (ROOT / config['outputDirectory']).iterdir() if path.is_file()}
    books.append({
        'subject': book['subject'], 'bookId': book['bookId'], 'configWholeExactToRemote': artifact(ROOT / config_path),
        'remoteReceipt': book['receipt'], 'activeReceipt': artifact(ROOT / receipt_path),
        'onlyJSONDelta': deltas, 'bindingPath': POLICY,
        'rawEntireReceiptBytesExactExceptOnePolicySHA': True,
        'countsWholeExactToRemote': after['counts'], 'claimsWholeExactToRemote': after['claims'],
        'scopeWitnessOutputBindingOmissionAndUnresolvedDecisionFieldsExact': True,
        'otherNativeGeneratedOutputsWholeExactToRemote': unchanged,
        'outputBindingsAllMatchActualFiles': True, 'outputDirectoriesNoExtraOrMissingFiles': True
    })
    unchanged_count += len(unchanged)
assert unchanged_count == 76
for path in ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/buildGoalBookSourceAtlasInputs.ts']:
    assert (ROOT / path).read_bytes() == remote(path)
end_guards = [artifact(ROOT / path) for path in sorted(active_paths)]
assert before_guards == end_guards
prior_seal_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-two-active-foreign-atlas-SHA-only-independent-a-READONLY-v1/SEALED-independent-active-two-foreign-atlas-policy-SHA-only.READONLY.json'
assert sha(prior_seal_path.read_bytes()) == 'b5d1fcf722c08047d63681dbbd1a5673103741f02ae13b2f0df10144f07bd690'
result = {
    'role': 'independent_READONLY_actual_post_merge_remote_native_atlas_output_binding_closure',
    'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'decision': 'KEEP',
    'remoteBaselineCommit': REMOTE,
    'observedMergedHEADAtReview': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip(),
    'remoteOutputBaseline': artifact(baseline_path), 'prior6438KEEPHistoryUnchanged': artifact(prior_seal_path),
    'rootCompletedFourNativeCommands': artifact(completed_path),
    'immutableCompletedRawLogs': [artifact(ROOT / row['rawOutputPath']) for row in completed_commands],
    'sharedQualifiedPolicy': artifact(ROOT / POLICY),
    'wholeNativeCodeExactToRemote': [artifact(ROOT / path) for path in
        ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/buildGoalBookSourceAtlasInputs.ts']],
    'books': books, 'totalActualOutputs': 78, 'wholeOutputsExactToRemoteCd7': 76,
    'onlyChangedOutputCount': 2, 'eachReceiptOnlyOneSharedPolicySHAField': True,
    'remoteWholeScientificStatePreservedInAllGeneratedOutputs': True,
    'noNewForeignSourceScopeThresholdOrSemanticClaim': True,
    'activeBeforeGuards': before_guards, 'activeEndGuards': end_guards,
    'activeWrites': 0, 'agentGeneratorsExecuted': 0, 'agentBuildsOrGlobalChecksExecuted': 0,
    'newForeignScientificReviewOrHumanApprovalClaim': False,
    'fullCIOrOngoingBookPublicationCompletionClaim': False,
    'mutableRootPhaseReceiptNotHashBound': True,
    'reviewerBoundary': 'Independent technical active-output verification only; Chemistry398/378 and Biology394/394 are accepted as exact cd7 scientific input history. No new scientific approval or reuse of the obsolete381 baseline. Previous A NAIRU/scope/BY-BBpartial/localPractice authorship disclosed and unrelated to foreign atlas authorship.'
}
receipt_path = OWN / 'actual-independent-post-cd7-active78-foreign-atlas-output-two-SHA-only-KEEP.SEALED.receipt.json'
receipt_path.write_text(json.dumps(result, indent=2) + '\n')
assert [artifact(ROOT / path) for path in sorted(active_paths)] == before_guards
seal_path = OWN / 'SEALED-independent-post-cd7-active-two-foreign-atlas-SHA-only.READONLY.json'
seal_path.write_text(json.dumps({
    'role': 'SEALED_independent_post_cd7_foreign_atlas_output_SHA_only_READONLY_KEEP',
    'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'decision': 'KEEP',
    'receipt': artifact(receipt_path),
    'artifacts': [artifact(path) for path in sorted(OWN.iterdir()) if path.is_file()],
    'activeEndguards': end_guards, 'activeWrites': 0, 'agentGeneratorsOrBuilds': 0,
    'foreignScienceReviewClaim': False, 'mutableRootPhaseReceiptNotHashBound': True,
    'sealRule': 'Immutable after this seal. Further changes require a new additive folder.'
}, indent=2) + '\n')
print(json.dumps({'decision': 'KEEP', 'outputs': 78, 'wholeRemoteExactOutputs': 76,
                  'onlyTwoPolicySHAChanges': True, 'receipt': artifact(receipt_path),
                  'seal': artifact(seal_path), 'activeWrites': 0}, indent=2))
