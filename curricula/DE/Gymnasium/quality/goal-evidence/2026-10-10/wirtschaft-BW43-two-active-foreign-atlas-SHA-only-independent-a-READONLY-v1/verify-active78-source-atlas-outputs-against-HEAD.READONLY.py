import datetime
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path.cwd()
OWN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-two-active-foreign-atlas-SHA-only-independent-a-READONLY-v1'
PRIOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-shared-policy-foreign-atlas-binding-only-READONLY-v1'
POLICY = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
ROOT_RUN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final702-stable-M6-CI-root-v1/publication-atlas-qualified-final.actual-command-receipts.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def artifact(path):
    path = pathlib.Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(data), 'bytes': len(data)}


def load(path):
    return json.loads(pathlib.Path(path).read_text())


def head_bytes(path):
    return subprocess.check_output(['git', 'show', baseline_commit + ':' + path], cwd=ROOT)


def differences(before, after, path=''):
    if before == after:
        return []
    if isinstance(before, dict) and isinstance(after, dict):
        result = []
        for key in sorted(set(before) | set(after)):
            result.extend(differences(before.get(key), after.get(key), path + '/' + key))
        return result
    if isinstance(before, list) and isinstance(after, list) and len(before) == len(after):
        return [difference for index, (old, new) in enumerate(zip(before, after))
                for difference in differences(old, new, path + '/' + str(index))]
    return [{'path': path, 'before': before, 'after': after}]


baseline_commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip()
prior_seal_path = PRIOR / 'SEALED-two-native-foreign-atlas-shared-policy-binding-only.READONLY.json'
assert sha(prior_seal_path.read_bytes()) == '6561da49ad949757b2d47a27be56bc3ba894a70b8939d2522da72a79ae3aeb22'
prior_seal = load(prior_seal_path)
for item in prior_seal['artifacts']:
    assert artifact(ROOT / item['path']) == item
prior = load(PRIOR / 'actual-two-foreign-native-source-atlases-shared-policy-binding-only.READONLY.json')
assert sha((ROOT / POLICY).read_bytes()) == '1bfb4a8fb052c9b0427719fb3d87206b1312e5e296e06fcf7f12e9b830c70c00'

mutable_phase_snapshot = load(ROOT_RUN)
expected_names = ['native-source-atlas-chemistry', 'native-source-atlas-biology',
                  'check-native-source-atlas-chemistry', 'check-native-source-atlas-biology']
completed_commands = []
for name in expected_names:
    matches = [item for item in mutable_phase_snapshot['results'] if item['name'] == name]
    assert len(matches) == 1
    command = matches[0]
    assert command['exitCode'] == 0
    assert sha((ROOT / command['rawOutputPath']).read_bytes()) == command['rawOutputSha256']
    assert command['command'][2] == 'app/scripts/buildGoalBookSourceAtlasInputs.ts'
    assert ('--check' in command['command']) == name.startswith('check-')
    completed_commands.append(command)
completed_path = OWN / 'actual-four-completed-native-generator-and-check-command-rows.EXACT.json'
completed_path.write_text(json.dumps({
    'sourcePathWithoutBindingMutableWholePhaseHash': str(ROOT_RUN.relative_to(ROOT)),
    'capturedCompletedRowsOnly': completed_commands,
    'sourcePhaseCompleteAtRead': mutable_phase_snapshot['phaseComplete'],
    'claim': 'These four completed rows and raw logs are immutable provenance; the continuing book/publication phase is not represented as complete.'
}, indent=2) + '\n')

active_paths = {POLICY, 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/buildGoalBookSourceAtlasInputs.ts'}
for book in prior['books']:
    active_paths.add(book['configBefore']['path'])
    active_paths.update(item['path'] for item in book['wholeUnchangedOutputs'])
    active_paths.update(item['path'] for item in book['changedOutputs'])
active_paths.update(item['rawOutputPath'] for item in completed_commands)
before_guards = [artifact(ROOT / path) for path in sorted(active_paths)]
books = []
unchanged_count = 0
for book in prior['books']:
    config_path = book['configBefore']['path']
    config_bytes = (ROOT / config_path).read_bytes()
    assert config_bytes == head_bytes(config_path)
    assert 'sha256:' + sha(config_bytes) == book['configBefore']['sha256']
    unchanged = []
    for item in book['wholeUnchangedOutputs']:
        path = item['path']
        current = (ROOT / path).read_bytes()
        original = head_bytes(path)
        assert current == original, path
        assert 'sha256:' + sha(current) == item['sha256'], path
        unchanged.append({**artifact(ROOT / path), 'wholeBytesExactToHEAD': True, 'wholeBytesExactToPriorNativeOutput': True})
    assert len(book['changedOutputs']) == 1
    expected = book['changedOutputs'][0]
    receipt_path = expected['path']
    current_bytes = (ROOT / receipt_path).read_bytes()
    original_bytes = head_bytes(receipt_path)
    assert 'sha256:' + sha(original_bytes) == expected['beforeSha256']
    assert 'sha256:' + sha(current_bytes) == expected['afterSha256']
    before = json.loads(original_bytes)
    after = json.loads(current_bytes)
    actual_delta = differences(before, after)
    assert actual_delta == expected['jsonDifferences']
    assert len(actual_delta) == 1
    delta = actual_delta[0]
    index = int(delta['path'].split('/')[2])
    assert before['inputBindings'][index]['path'] == after['inputBindings'][index]['path'] == POLICY
    assert delta['after'] == 'sha256:' + sha((ROOT / POLICY).read_bytes())
    assert original_bytes.count(delta['before'].encode()) == 1
    assert original_bytes.replace(delta['before'].encode(), delta['after'].encode()) == current_bytes
    assert before['counts'] == after['counts'] == book['nativeCurrentCounts']
    assert len(after['outputBindings']) == len(unchanged)
    binding_paths = {item['path'] for item in after['outputBindings']}
    assert binding_paths == {item['path'] for item in unchanged}
    for binding in after['outputBindings']:
        assert 'sha256:' + sha((ROOT / binding['path']).read_bytes()) == binding['sha256']
    config = json.loads(config_bytes)
    expected_direct_names = {pathlib.Path(item['path']).name for item in unchanged
                             if pathlib.Path(item['path']).parent == pathlib.Path(config['outputDirectory'])}
    expected_direct_names.add('source-projection.receipt.json')
    actual_direct_names = {path.name for path in (ROOT / config['outputDirectory']).iterdir() if path.is_file()}
    assert actual_direct_names == expected_direct_names
    books.append({
        'bookId': book['bookId'], 'config': artifact(ROOT / config_path),
        'changedReceipt': artifact(ROOT / receipt_path), 'headReceipt': {
            'path': receipt_path, 'commit': baseline_commit,
            'sha256': sha(original_bytes), 'bytes': len(original_bytes)},
        'onlyActualJSONDifference': actual_delta,
        'bindingPath': POLICY, 'rawWholeReceiptByteReplacementOnly': True,
        'compactWitnessGroupsAndAllOtherFieldsWholeExact': True,
        'countsWholeExact': after['counts'], 'claimsWholeExact': after['claims'],
        'wholeUnchangedGeneratedOutputs': unchanged,
        'outputBindingsAllMatchActualFiles': True, 'outputDirectoryNoExtraOrMissingFiles': True
    })
    unchanged_count += len(unchanged)
for path in ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/buildGoalBookSourceAtlasInputs.ts']:
    assert (ROOT / path).read_bytes() == head_bytes(path)
assert 'sha256:' + sha((ROOT / 'app/scripts/goalBookSourceAtlasInputs.ts').read_bytes()) == prior['nativeModule']['sha256']
assert unchanged_count == 76
assert len(books) == 2
end_guards = [artifact(ROOT / path) for path in sorted(active_paths)]
assert end_guards == before_guards
result = {
    'role': 'independent_readonly_actual_ACTIVE_foreign_atlas_output_binding_closure',
    'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'decision': 'KEEP', 'baselineHEADCommit': baseline_commit,
    'endHEADCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip(),
    'priorNativeReadOnlyPredictionSeal': artifact(prior_seal_path),
    'rootCompletedFourCommands': artifact(completed_path),
    'rawCompletedLogArtifacts': [artifact(ROOT / item['rawOutputPath']) for item in completed_commands],
    'sharedQualifiedPolicy': artifact(ROOT / POLICY),
    'actualOriginalNativeModuleAndCLI': [artifact(ROOT / path) for path in
        ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/buildGoalBookSourceAtlasInputs.ts']],
    'books': books, 'wholeGeneratedOutputCount': 78,
    'changedReceiptCount': 2, 'wholeUnchangedGeneratedOutputCount': unchanged_count,
    'all76OtherOutputsWholeByteExactToPinnedHEAD': True,
    'all78ActiveOutputsMatchQualifiedNativePrediction': True,
    'everyChangedReceiptOnlyOnePolicySHABindingField': True,
    'sourceViewScopesOmittedGoalsUnresolvedDecisionsCountsAndWitnessesExact': True,
    'allInputBindingsOtherThanQualifiedSharedPolicyExact': True,
    'allForeignSourceScienceAndSemanticClaimsUnchanged': True,
    'nativeCodeThresholdsAndGatesWholeBytesExactToHEAD': True,
    'activeBeforeGuards': before_guards, 'activeEndGuards': end_guards,
    'continuingRootBookAndPublicationPhaseNotClaimedComplete': True,
    'activeWrites': 0, 'agentNativeGeneratorsExecuted': 0,
    'agentBuildsOrGlobalChecksExecuted': 0, 'foreignScienceReviewClaim': False,
    'newM7OrHumanApprovalClaim': False,
    'reviewerBoundary': 'Independent of Root native regeneration and prior prediction author. Earlier A NAIRU/scope, BY/BB partial-source and local-practice authorship disclosed; none authored foreign atlases. This verifies actual generated bytes and bindings only, no fresh chemistry/biology science or scope approval.'
}
receipt_path = OWN / 'actual-independent-active78-foreign-atlas-outputs-two-policy-SHA-fields-only-KEEP.SEALED.receipt.json'
receipt_path.write_text(json.dumps(result, indent=2) + '\n')
assert [artifact(ROOT / path) for path in sorted(active_paths)] == before_guards
seal = {
    'role': 'SEALED_independent_actual_active_foreign_atlas_SHA_only_READONLY_KEEP',
    'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'decision': 'KEEP', 'receipt': artifact(receipt_path),
    'artifacts': [artifact(path) for path in sorted(OWN.iterdir()) if path.is_file()],
    'activeEndguards': end_guards,
    'sourceMutablePhaseReceiptNotHashBound': True,
    'activeWrites': 0, 'foreignScienceReviewClaim': False,
    'fullCIOrBookPublicationCompletionClaim': False,
    'sealRule': 'Immutable after this seal; subsequent changes require a separate additive evidence folder.'
}
seal_path = OWN / 'SEALED-independent-active-two-foreign-atlas-policy-SHA-only.READONLY.json'
seal_path.write_text(json.dumps(seal, indent=2) + '\n')
print(json.dumps({'decision': 'KEEP', 'outputs': 78, 'wholeUnchangedOutputs': 76,
                  'SHAOnlyReceiptChanges': 2, 'receipt': artifact(receipt_path),
                  'seal': artifact(seal_path), 'activeWrites': 0}, indent=2))
