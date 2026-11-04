"""Copy a finite Q3 candidate only after genuine independent source acceptance."""
from pathlib import Path, PurePosixPath
import hashlib
import importlib.util
import json
import shutil
import subprocess

ROOT = Path('/home/enpasos/projects/skillpilot')
HERE = Path(__file__).resolve().parent
DATA = HERE / 'candidate-data'
BASE = ROOT / 'tmp/approach-review-20261101/geometry-six-dgl1-existing-routes-native-20261104-v2'
AM = ROOT / 'tmp/approach-review-20261101/astra-q3-integration-independent-review-20261104-v1/manifest.genuine-am-four-leaves.json'
BASE_ARCHIVE_SHA = 'f72905184ef1c9b7ce98b3c9aacdb58d0e45ac5759fe26e4618097d4691b14b3'
BASE_INPUT_SHA = '76855b65857d0edf8a9009ebc81d827efc96ee31dadc06aa86239c9e94d6e71e'
AM_SHA = 'a7f2d78ffa47012b6e1fb80dd4ad29a4f2e0c2bca55915ab485028649580396e'
AM_RECEIPT_SHA = '32f1648a33ce4fea211544168f5a5f64a3cc4c5106533dcc7c4e81e32baeeaaa'
OWNED_QA = ['app/scripts/testHessenMathQ21Scope.ts', 'app/scripts/testCompositionProjectionRoles.ts',
            'scripts/curriculum_completion_inputs.py', 'scripts/test_curriculum_completion_integrity_report.py']

def sha(path):
    with Path(path).open('rb') as handle:
        return hashlib.file_digest(handle, 'sha256').hexdigest()

def write(path, value):
    with path.open('x') as handle:
        json.dump(value, handle, indent=2)
        handle.write('\n')

def relative(value):
    assert isinstance(value, str) and value and '\\' not in value, value
    path = PurePosixPath(value)
    assert not path.is_absolute() and '..' not in path.parts and path.as_posix() == value, value
    return value

def guarded_load(binding):
    path = ROOT / relative(binding['path'])
    assert path.is_file() and sha(path) == binding['sha256'], str(path)
    return path, json.loads(path.read_text())

def verify_map(name):
    values = json.loads((BASE / name).read_text())
    for path, digest in values.items():
        assert sha(Path(path)) == digest, path
    return values

def jsonl_refs(value):
    if isinstance(value, str) and value.endswith('.jsonl'):
        yield relative(value)
    elif isinstance(value, dict):
        for item in value.values():
            yield from jsonl_refs(item)
    elif isinstance(value, list):
        for item in value:
            yield from jsonl_refs(item)

def main():
    assert not DATA.exists(), 'Never overwrite an existing candidate freeze'
    auth = json.loads((HERE / 'authorization.json').read_text())
    source_path, manifest = guarded_load(auth['sourceManifest'])
    review_path, review = guarded_load(auth['independentSourceReview'])
    assert review[auth['sourceVerdictField']] == auth['sourceVerdictValue']
    assert 'PASS' in auth['sourceVerdictValue'] or 'ACCEPTED' in auth['sourceVerdictValue']
    assert auth['independentSourceManifestSha256'] == sha(source_path)
    assert review['sourceInventory'] == auth['sourceManifest']
    assert review['sourceAuthorization']['isolatedActualNativeMeasurementAuthorized'] is True
    source_receipt_path, source_receipt = guarded_load(review['sourceAuthorizationReceipt'])
    assert source_receipt['authorIndependent'] is True
    assert source_receipt['sourceAuthorization']['isolatedActualNativeMeasurementAuthorized'] is True
    assert source_receipt['sourceInventory'] == auth['sourceManifest']
    effective_path, effective = guarded_load(review['effectiveSourceAndAMInputMap'])
    assert sha(AM) == AM_SHA
    am = json.loads(AM.read_text())
    receipt_path, _ = guarded_load(am['receipt'])
    assert sha(receipt_path) == AM_RECEIPT_SHA and len(am['files']) == 4
    assert sha(BASE / 'candidate.json.gz') == BASE_ARCHIVE_SHA
    assert sha(BASE / 'candidate-input-hashes.json') == BASE_INPUT_SHA
    old_inputs = json.loads((BASE / 'candidate-input-hashes.json').read_text())
    assert len(old_inputs) == 11118
    runtime_origin = json.loads((BASE / 'runtime-origin.json').read_text())
    runtime_maps = {name: verify_map(name) for name in [
        'main-source-hashes.json',
        'runtime-class-hashes.json', 'runtime-resource-hashes.json', 'dependency-jar-hashes.json']}
    # All frozen test sources match the genuine full compile's input map. The
    # current producer has since advanced as reviewed data; it is never called
    # by this sampler. Bind that difference without claiming a fresh compile.
    frozen_test_sources = json.loads((BASE / 'test-support-source-hashes.json').read_text())
    full = ROOT / runtime_origin['reusedActualFullOrdinaryBackendBuild']
    assert sha(full / 'input-hashes.before.json') == runtime_origin['fullBackendInputMapSha256']
    assert sha(full / 'result.json') == runtime_origin['fullBackendResultSha256']
    full_inputs = json.loads((full / 'input-hashes.before.json').read_text())
    for path, digest in frozen_test_sources.items():
        assert full_inputs[str(Path(path).relative_to(ROOT))] == digest, path
    current_test_sources = {str(path): sha(path) for path in (ROOT / 'backend/src/test/java').rglob('*.java')}
    assert set(current_test_sources) == set(frozen_test_sources)
    test_source_deltas = {path: {'frozenCompileSha256': digest, 'currentRootSha256': current_test_sources[path]}
                          for path, digest in frozen_test_sources.items() if current_test_sources[path] != digest}
    producer = str(ROOT / 'backend/src/test/java/com/skillpilot/backend/composition/MaterializeMathContextualCombinedViews.java')
    assert set(test_source_deltas) <= {producer}, 'Unexpected changed test support used by the sampler'
    assert 'MaterializeMathContextualCombinedViews' not in (BASE / 'MatrixFiniteNativeProbe.java').read_text()
    main_sources = runtime_maps['main-source-hashes.json']
    assert len(main_sources) == 482
    assert {str(path) for path in (ROOT / 'backend/src/main/java').rglob('*.java')} == set(main_sources)
    cp = (BASE / 'classpath-current.txt').read_text().strip().split(':')
    directories = [Path(path) for path in cp if not path.endswith('.jar')]
    assert len(directories) == 4
    actual_classes = {str(path) for directory in directories for path in directory.rglob('*.class')}
    actual_resources = {str(path) for directory in directories for path in directory.rglob('*')
                        if path.is_file() and path.suffix != '.class'}
    assert actual_classes == set(runtime_maps['runtime-class-hashes.json'])
    assert actual_resources == set(runtime_maps['runtime-resource-hashes.json'])
    assert {path for path in cp if path.endswith('.jar')} == set(runtime_maps['dependency-jar-hashes.json'])
    expected_sampler = json.loads((BASE / 'sampler-class-hashes.json').read_text())
    assert expected_sampler == {str(path.relative_to(BASE / 'classes')): sha(path)
                                for path in (BASE / 'classes').rglob('*.class')}
    previous_execution = json.loads((BASE / 'candidate.execution.json').read_text())
    assert previous_execution['exitCode'] == 0
    for name in ['MatrixFiniteNativeProbe.java', 'decisions.json', 'classpath-current.txt',
                 'sampler-class-hashes.json', 'runtime-origin.json', 'test-support-source-hashes.json', *runtime_maps]:
        assert sha(BASE / name) == previous_execution['ownSourceHashes'][name], name
    spec = importlib.util.spec_from_file_location('q3_current_inputs', ROOT / 'scripts/curriculum_completion_inputs.py')
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    ci = helper.current_input_paths(ROOT)
    overlay = {}
    for entry in manifest['files']:
        rel = relative(entry['path'])
        assert rel not in overlay, rel
        candidate = ROOT / relative(entry['candidatePath'])
        assert candidate.is_file() and not candidate.is_symlink()
        assert sha(candidate) == entry['candidateSha256'], rel
        root_path = ROOT / rel
        assert (sha(root_path) if root_path.exists() else None) == entry['beforeSha256'], rel
        assert not rel.startswith('backend/src/main/java/'), 'No new production compilation is claimed'
        if rel in OWNED_QA:
            assert sha(candidate) == sha(root_path), 'Do not import older owned QA bytes'
        overlay[rel] = (candidate, entry['candidateSha256'])
    for entry in am['files']:
        rel = relative(entry['path'])
        candidate = ROOT / relative(entry['candidatePath'])
        assert candidate.is_file() and not candidate.is_symlink() and sha(candidate) == entry['sha256'], rel
        assert rel not in overlay or overlay[rel][1] == entry['sha256'], rel
        overlay[rel] = (candidate, entry['sha256'])
    assert len(effective['files']) == effective['fileCount'] == len(overlay)
    assert {entry['path']: entry['sha256'] for entry in effective['files']} == {
        rel: digest for rel, (_, digest) in overlay.items()}
    configs = [f'curricula/DE/Gymnasium/quality/{lane}/canonical-math-full.config.json'
               for lane in ['semantic-atomicity', 'memory-card-review']]
    refs = set()
    for rel in configs:
        refs.update(jsonl_refs(json.loads((ROOT / rel).read_text())))
        refs.update(jsonl_refs(json.loads(overlay.get(rel, (ROOT / rel, None))[0].read_text())))
    base_paths = set(old_inputs) | ci | set(OWNED_QA) | set(configs) | refs
    root_map = {}
    for rel in sorted(base_paths):
        relative(rel)
        source = ROOT / rel
        if not source.is_file():
            assert rel in overlay, f'Missing required Root or reviewed overlay input: {rel}'
            continue
        assert not source.is_symlink(), rel
        root_map[rel] = sha(source)
        if rel in old_inputs and rel.startswith('curricula/'):
            assert root_map[rel] == old_inputs[rel], f'Root G5 data changed before Q3 freeze: {rel}'
    estimated_bytes = sum((ROOT / rel).stat().st_size for rel in root_map)
    estimated_bytes += sum(path.stat().st_size for path, _ in overlay.values())
    free = shutil.disk_usage(HERE).free
    assert free > estimated_bytes + 1024**3, 'Insufficient free space with a 1 GiB reserve'
    DATA.mkdir()
    for rel, digest in root_map.items():
        target = DATA / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / rel, target)
        assert sha(target) == digest, rel
    for rel, (source, digest) in overlay.items():
        target = DATA / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        assert sha(target) == digest, rel
    for rel in refs:
        assert (DATA / rel).is_file(), rel
    for rel in OWNED_QA:
        assert sha(DATA / rel) == sha(ROOT / rel), rel
    (DATA / 'backend').mkdir(exist_ok=True)
    for target, source in [
        ('source-manifest.frozen.json', source_path), ('source-review.frozen.json', review_path),
        ('source-authorization.frozen.json', source_receipt_path),
        ('effective-source-and-am-inputs.frozen.json', effective_path),
        ('am-manifest.frozen.json', AM), ('am-receipt.frozen.json', receipt_path),
        ('test-support-source-hashes.json', BASE / 'test-support-source-hashes.json'),
        *[(name, BASE / name) for name in ['MatrixFiniteNativeProbe.java', 'decisions.json',
          'classpath-current.txt', 'sampler-class-hashes.json', *runtime_maps]]]:
        shutil.copyfile(source, HERE / target)
    shutil.copytree(BASE / 'classes', HERE / 'classes')
    inputs = {str(path.relative_to(DATA)): sha(path) for path in DATA.rglob('*') if path.is_file()}
    assert set(old_inputs) <= set(inputs)
    write(HERE / 'candidate-input-hashes.json', inputs)
    write(HERE / 'root-copy-input-hashes.json', root_map)
    write(HERE / 'current-root-ci-input-hashes.json', {rel: root_map[rel] for rel in sorted(ci)})
    write(HERE / 'current-root-test-source-hashes.json', current_test_sources)
    write(HERE / 'test-source-runtime-boundary.json', {'frozenSourcesByteEqualToActualFullCompileInputs': True,
          'fullCompileInputMapSha256': sha(full / 'input-hashes.before.json'),
          'currentRootDeltasFromFrozenCompile': test_source_deltas,
          'changedProducerIsCopiedCandidateDataAndNotExecutedBySampler': True,
          'newCompilationClaim': False})
    before_delta = {rel: {'n5Sha256': digest, 'currentRootSha256': root_map.get(rel)}
                    for rel, digest in old_inputs.items() if root_map.get(rel) != digest}
    candidate_delta = {rel: {'n5Sha256': digest, 'q3Sha256': inputs[rel]}
                       for rel, digest in old_inputs.items() if inputs[rel] != digest}
    write(HERE / 'n5-input-deltas.json', {'rootUpdatesBeforeOverlay': before_delta,
          'q3CandidateChangedPriorInputs': candidate_delta, 'additionalInputPaths': sorted(set(inputs) - set(old_inputs))})
    write(HERE / 'runtime-origin.json', {**runtime_origin,
        'newProductionMainCompilationClaim': False, 'samplerRecompiledAgainstFreshFullBackend': False,
        'samplerCompilationReusedFromActualNative5': str(BASE.relative_to(ROOT)),
        'frozenTestSourcesMatchActualFullCompileInputs': True,
        'currentProducerSourceDelta': test_source_deltas,
        'candidateProducerSourcesAreBoundDataNotExecutedSamplerClasses': True})
    original_bindings = {str(source_path): sha(source_path), str(review_path): sha(review_path),
                         str(source_receipt_path): sha(source_receipt_path), str(effective_path): sha(effective_path),
                         str(AM): sha(AM), str(receipt_path): sha(receipt_path),
                         str(full / 'input-hashes.before.json'): sha(full / 'input-hashes.before.json'),
                         str(full / 'result.json'): sha(full / 'result.json'),
                         str(BASE / 'candidate.json.gz'): BASE_ARCHIVE_SHA,
                         str(BASE / 'candidate-input-hashes.json'): BASE_INPUT_SHA}
    original_bindings.update({str(path): digest for path, digest in overlay.values()})
    for name in ['MatrixFiniteNativeProbe.java', 'decisions.json', 'classpath-current.txt',
                 'sampler-class-hashes.json', 'test-support-source-hashes.json', *runtime_maps]:
        original_bindings[str(BASE / name)] = sha(BASE / name)
    write(HERE / 'preserved-source-bindings.json', original_bindings)
    write(HERE / 'preparation.json', {
        'status': 'PREPARED_AFTER_GENUINE_SOURCE_PRODUCER_PASS_WITH_QA4_NOT_NATIVE_ACCEPTANCE',
        'rootHead': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'sourceManifestSha256': sha(source_path), 'sourceLeafCount': len(manifest['files']),
        'independentSourceReviewSha256': sha(review_path), 'genuineAM4ManifestSha256': AM_SHA,
        'genuineAM4ReceiptSha256': AM_RECEIPT_SHA, 'baselineActualNative5Sha256': BASE_ARCHIVE_SHA,
        'baselineInputMapSha256': BASE_INPUT_SHA, 'baselineInputCount': len(old_inputs),
        'rootCIInputCount': len(ci), 'copiedRootInputCount': len(root_map), 'candidateInputCount': len(inputs),
        'candidateBytes': sum((DATA / rel).stat().st_size for rel in inputs), 'diskFreeBeforeCopyBytes': free,
        'currentOwnedQAInputs': {rel: sha(DATA / rel) for rel in OWNED_QA},
        'currentAndSuccessorAMJsonlRefs': sorted(refs),
        'runtimeCounts': {name: len(values) for name, values in runtime_maps.items()},
        'copiedRuntimeResourcesOrJars': False, 'newCompilationClaim': False,
        'candidateContainsOnlyRegularCopiedLeaves': all(not (DATA / rel).is_symlink() for rel in inputs),
        'noRootGitDbOrPreviewMutation': True})
    print(json.dumps({'prepared': str(HERE), 'candidateInputs': len(inputs),
                      'candidateBytes': sum((DATA / rel).stat().st_size for rel in inputs)}), flush=True)

if __name__ == '__main__':
    main()
