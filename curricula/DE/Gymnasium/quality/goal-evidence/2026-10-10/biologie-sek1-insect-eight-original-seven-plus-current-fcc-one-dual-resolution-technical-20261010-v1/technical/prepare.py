from pathlib import Path
import datetime
import hashlib
import json
import os

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
OUT = BASE / 'biologie-sek1-insect-eight-original-seven-plus-current-fcc-one-dual-resolution-technical-20261010-v1'
ORIGINAL = BASE / 'biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1'
CURRENT = BASE / 'biologie-sek1-insect-eight-frog-adult-targeted-raster-native-author-successor-v2'
A = BASE / 'biologie-sek1-insect-eight-current-native-and-raster-independent-a-20261010-v1'
B = BASE / 'biologie-sek1-insect-eight-current-native-and-raster-independent-b-20261010-v1'


def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    data = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    if path.exists():
        assert path.read_bytes() == data, str(path)
    else:
        path.write_bytes(data)
    return data


sealed = [
    (A / 'completed-original8-plus-current-fcc1-independent-a.entry.json', 'ae4e66a546e7bbedce903b47f987ed467e48434fe690af3a107ec64d11db9dcb'),
    (A / 'FINAL.original8-plus-current-fcc1-independent-a.freeze.json', 'ecd24de17faa3b83702084b9f62b899053d3ead5dc2d83a30374c4ca00dda4d6'),
    (B / 'independent-b.final.entry.json', '57411e92f1eb9fa50a5cf6d13ceae5966e49d05516c2b4bd2fc5f411c00430a7'),
    (B / 'independent-b.final.freeze.json', 'e3cefacb0aebcd49affb02aff10cf38933b4f71182525b34e579a84832ee230a'),
    (ORIGINAL / 'author.final.freeze.json', '94330c850a3dee01b2e14e2471fa2b81ba409c19bc7908901a1efbb1d2a7a11b'),
    (CURRENT / 'author.targeted.final.freeze.json', '88a42a42dcc988b99fbd836352459920994dea11df97e53b8861aaecc5a3d0bc'),
]
verified = {}


def verify_bindings(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            path = Path(value['path'])
            assert not path.is_absolute(), str(path)
            data = path.read_bytes()
            assert sha(data).removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), str(path)
            if isinstance(value.get('bytes'), int):
                assert len(data) == value['bytes'], str(path)
            verified[str(path)] = {'path': str(path), 'sha256': sha(data), 'bytes': len(data)}
        for child in value.values():
            verify_bindings(child)
    elif isinstance(value, list):
        for child in value:
            verify_bindings(child)


for path, digest in sealed:
    data = path.read_bytes()
    assert sha(data) == 'sha256:' + digest, str(path)
    verify_bindings(json.loads(data))

copies = []
links = []
groups = []


def copy(source, target):
    data = source.read_bytes()
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        assert target.read_bytes() == data, str(target)
    else:
        target.write_bytes(data)
    copies.append({'sourcePath': str(source), 'targetPath': str(target), 'sha256': sha(data), 'bytes': len(data)})


specs = [
    ('original-eight-seven-resolved-one-historical-deferred', ORIGINAL,
     'eight-current-P', A / 'results-original8', B / 'round-b/results'),
    ('current-fcc-one', CURRENT,
     'one-fcc-current-P', A / 'results-current-fcc1', B / 'fcc-successor/round-b/results'),
]
for name, author, native, first, second in specs:
    source = author / 'native' / native
    target = OUT / name
    target.mkdir(parents=True, exist_ok=True)
    source_config = author / 'native' / (native + '.prerequisite-safe.batch.config.json')
    config = json.loads(source_config.read_text())
    original_config = dict(config)
    config['outputDirectory'] = str(target)
    config_path = target / 'batch.config.json'
    config_bytes = dump(config_path, config)
    manifest = json.loads((source / 'batch-manifest.json').read_text())
    original_manifest = dict(manifest)
    manifest['configPath'] = str(config_path)
    manifest['configDigest'] = sha(config_bytes)
    dump(target / 'batch-manifest.json', manifest)
    assert [key for key in config if config[key] != original_config[key]] == ['outputDirectory']
    assert set(key for key in manifest if manifest[key] != original_manifest[key]) == {'configPath', 'configDigest'}
    link = target / 'bundle'
    relative = os.path.relpath(source / 'bundle', target)
    if link.is_symlink():
        assert os.readlink(link) == relative
    else:
        link.symlink_to(relative, target_is_directory=True)
    assert link.resolve().is_relative_to(Path.cwd().resolve())
    links.append({'path': str(link), 'relativeTarget': relative, 'resolvedRepositoryTarget': str(source / 'bundle'),
                  'manifestSha256': sha((source / 'bundle/manifest.json').read_bytes()),
                  'bookModelSha256': sha((source / 'bundle/book-model.json').read_bytes())})
    for round_name, results in [('round-a', first), ('round-b', second)]:
        for path in sorted((source / round_name).rglob('*')):
            if path.is_file() and 'results' not in path.relative_to(source / round_name).parts:
                copy(path, target / round_name / path.relative_to(source / round_name))
        files = [path for path in sorted(results.iterdir()) if path.is_file()
                 and (path.name.endswith('.records.jsonl') or path.name.endswith('.run.json'))]
        assert len(files) == 2, (results, files)
        for path in files:
            copy(path, target / round_name / 'results' / path.name)
    groups.append({'group': name, 'configPath': str(config_path), 'batchId': manifest['batchId'],
                   'goalIds': manifest['goalIds'], 'firstResultsSource': str(first), 'secondResultsSource': str(second),
                   'configTechnicalChangeOnly': ['outputDirectory'],
                   'manifestTechnicalChangeOnly': ['configPath', 'configDigest']})

dump(OUT / 'exact-native-copy-and-scientific-freeze-verification.actual.json', {
    'schemaVersion': 1, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Technical exact-byte synthesis by the existing independent A reviewer after sealed A/B FIRSTs; no third scientific review',
    'immutableSeals': [{'path': str(path), 'sha256': 'sha256:' + digest} for path, digest in sealed],
    'scientificBoundArtifactsVerified': list(verified.values()), 'copies': copies,
    'portableBundleLinks': links, 'groups': groups,
    'originalFCC': {'firstDecision': 'block', 'secondDecision': 'keep', 'deferred': True,
                    'reason': 'Actual original image/native-context dissent preserved, not overwritten by corrected successor'},
    'currentFCC': {'firstDecision': 'keep', 'secondDecision': 'keep', 'separateSuccessor': True},
    'operativePositiveReviewIds': 'Author exact P7 and targeted-current P1 remain unchanged; independent A/B P judgments are supplementary',
    'semanticDescriptionsChanged': False, 'newWholeSourceOrCourseApproval': False,
    'protectedExistingStrictIDs': 327, 'activeChanges': False,
    'strictNewCompletions': 0, 'strictRestoredBindings': 0, 'strictNetGain': 0,
    'humanApproval': False, 'humanTrial': False, 'allCheckersUnchanged': True,
    'modelParameters': {'provider': 'OpenAI', 'execution': 'Codex existing A agent',
                        'exactModelVersion': 'unknown', 'samplingParameters': 'unknown'},
})
dump(OUT / 'native-groups.technical.json', groups)
print(f'Prepared two separate normal groups; copied {len(copies)} exact files; verified {len(verified)} immutable bindings; active net0')
