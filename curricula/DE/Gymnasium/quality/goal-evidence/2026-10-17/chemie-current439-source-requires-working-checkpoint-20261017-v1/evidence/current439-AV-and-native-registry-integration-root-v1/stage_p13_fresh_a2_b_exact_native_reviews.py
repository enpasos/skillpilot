"""Stage sealed P13 A2/B bytes only; run prepared-batch/dual-summary stock checks."""
import datetime
import hashlib
import json
import subprocess
from pathlib import Path

O = Path(__file__).resolve().parent
B = O.parent
N = O / 'capsule'
SPECS = {
    'input': (B / 'current439-P13-native-preparation-technical-root-v1/SELECTOR.clean-current-native13-reviewer-inputs.sealed.json', '45ac7189db1533bbda09ca83b03f007a78269903a57db3e80b51cd4e855be3c7'),
    'a2': (B / 'chemie-current439-P13-fresh-independent-a2-v1/SELECTOR.sealed.json', '8fbe90eda7d91c1e1e0e8191f9bdbac0a70cc03fbf3521743a961d8a85ca0092'),
    'b': (B / 'chemie-current439-P13-independent-b-v1/SELECTOR.independent-b13.sealed.json', 'e5706547f2b75f27dbecfba2af663f5c54dd380740bcb9114ce3f7aec627a7c5'),
}
Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1/independent-review-original-bytes/native13-fresh-a2-b')
RECEIPT = O / 'RECEIPT.P13-fresh-A2-B.exact-native-staging-and-stock-checks.json'
BEFORE = O / 'GUARDS.P13-fresh-A2-B.before.json'

def pin(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def json_read(path):
    return json.loads(Path(path).read_text())

guards = {}
def add_guard(expected):
    path = Path(expected['path'])
    assert path.is_absolute(), ('Unresolved pin path', str(path))
    actual = pin(path)
    assert actual['sha256'] == expected['sha256'].removeprefix('sha256:'), str(path)
    if 'bytes' in expected:
        assert actual['bytes'] == expected['bytes'], str(path)
    if str(path) in guards:
        assert guards[str(path)] == actual, str(path)
    guards[str(path)] = actual

def verify_embedded_pins(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            add_guard(value)
        for child in value.values():
            verify_embedded_pins(child)
    elif isinstance(value, list):
        for child in value:
            verify_embedded_pins(child)

def exact_new(path, raw):
    if path.exists():
        assert not path.is_symlink() and path.read_bytes() == raw, str(path)
    else:
        with path.open('xb') as stream:
            stream.write(raw)
    return pin(path)

localized = []
def own_dir(path):
    assert path == N or N in path.parents, str(path)
    if path == N:
        assert path.is_dir() and not path.is_symlink()
        return
    own_dir(path.parent)
    if path.is_symlink():
        source = path.resolve(strict=True)
        assert source.is_dir()
        path.unlink()
        path.mkdir()
        for child in source.iterdir():
            (path / child.name).symlink_to(child, target_is_directory=child.is_dir())
        localized.append({'path': str(path), 'previousAliasTarget': str(source)})
    elif not path.exists():
        path.mkdir()
        localized.append({'path': str(path), 'createdLocalDirectory': True})
    assert path.is_dir() and not path.is_symlink(), str(path)

copies = []
def copy_exact(source, destination):
    add_guard(pin(source))
    raw = Path(source).read_bytes()
    own_dir(destination.parent)
    if destination.is_symlink():
        assert destination.read_bytes() == raw, str(destination)
        destination.unlink()
    for ancestor in destination.parents:
        if ancestor == N:
            break
        assert not ancestor.is_symlink(), str(ancestor)
    result = exact_new(destination, raw)
    assert result['sha256'] == pin(source)['sha256']
    copies.append({'source': pin(source), 'destination': result, 'byteExact': True})

assert not RECEIPT.exists(), 'This uniquely named staging operation already has a receipt'
selectors = {}
for label, (path, sha) in SPECS.items():
    add_guard({'path': str(path), 'sha256': sha})
    selectors[label] = json_read(path)
    verify_embedded_pins(selectors[label])

clean = selectors['input']
original_root = Path(clean['nativeRoot'])
root_relative = original_root.relative_to(Path(clean['capsule']))
manifest = json_read(original_root / 'batch-manifest.json')
config_relative = Path(manifest['configPath'])
assert pin(N / config_relative)['sha256'] == manifest['configDigest'].removeprefix('sha256:')
assert (N / root_relative).resolve(strict=True) == original_root.resolve(strict=True), 'Expected untouched native13 input alias'

# Inspect only pin structures in current whole-source input and the existing own
# binding receipts. These are guards, not new scientific judgments.
pin_documents = [Path(x['path']) for x in clean['cleanSupplementPins'] if x['path'].endswith('.json')]
for label in ['a2', 'b']:
    reviewer = selectors[label]
    for item in reviewer.get('files', reviewer.get('artifacts', [])):
        name = Path(item['path']).name
        if name.endswith('.json') and any(token in name for token in ['pin-verification', 'input-pins', 'input-bindings', 'FIRST.exposure']):
            pin_documents.append(Path(item['path']))
for path in pin_documents:
    verify_embedded_pins(json_read(path))

# Guard local central files explicitly while leaving them outside the write set.
central_guards = []
for name in ['in-flight-work-ledger.json', 'in-flight-work-ledger.md']:
    path = N / 'curricula/DE/Gymnasium/quality/goal-description-review' / name
    if path.is_file():
        central_guards.append(pin(path))
        add_guard(pin(path))

round_specs = []
for label, round_name, binding_key in [('a2', 'round-a', 'first'), ('b', 'round-b', 'second')]:
    reviewer = selectors[label]
    items = reviewer.get('files', reviewer.get('artifacts', []))
    if label == 'b':
        records = reviewer['records']
        run = reviewer['runManifest']
    else:
        records = next(x for x in items if x['path'].endswith('.records.jsonl'))
        run = next(x for x in items if x['path'].endswith('.run.json'))
    binding = manifest['artifacts']['rounds'][binding_key]
    run_data = json_read(run['path'])
    assert run_data['campaignId'] == binding['campaignId']
    assert run_data['roundId'] == binding['roundId']
    assert run_data['batchId'] == binding['batchId']
    assert run_data['batchInputFingerprint'] == binding['batchInputFingerprint']
    assert run_data['goalIds'] == manifest['goalIds']
    lines = [json.loads(line) for line in Path(records['path']).read_text().splitlines() if line.strip()]
    assert len(lines) == 13
    assert all(x['recordStatus'] == 'candidate' and x['reviewAuthority'] == 'ai_candidate' for x in lines)
    round_specs.append({'sourceLabel': label, 'roundDirectory': round_name,
                       'binding': binding, 'recordsSource': records, 'runSource': run,
                       'preservedRunIdentity': {key: run_data[key] for key in ['runId', 'model', 'startedAt', 'completedAt', 'provider', 'blindToOtherRuns']}})

before = {'role': 'Pre-write exact P13 source/input/output guards; technical only',
          'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'guards': list(guards.values()), 'centralFiles': central_guards}
exact_new(BEFORE, (json.dumps(before, ensure_ascii=False, indent=2) + '\n').encode())

own_dir(N / root_relative)
for spec in round_specs:
    label = spec['sourceLabel']
    dest = N / root_relative / spec['roundDirectory'] / 'results'
    own_dir(dest)
    batch_id = spec['binding']['batchId']
    copy_exact(spec['recordsSource']['path'], dest / f'{batch_id}.records.jsonl')
    copy_exact(spec['runSource']['path'], dest / f'{batch_id}.run.json')
    reviewer = selectors[label]
    items = reviewer.get('files', reviewer.get('artifacts', []))
    proof_sources = [SPECS[label][0]]
    for item in items:
        name = Path(item['path']).name
        if name.startswith(('FIRST.', 'CHECK.', 'validation', 'execution-declaration', 'native-generation-parameters', 'native-own-evidence', 'stock-validation', 'verification.own-first', 'separate-current-image-findings')):
            proof_sources.append(Path(item['path']))
    for source in dict.fromkeys(proof_sources):
        copy_exact(source, N / Q / spec['roundDirectory'] / source.name)

stock = []
tool = N / 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'
add_guard(pin(tool))
for key, mode, write in [('prepared-check', 'check', False), ('dual-summary-write', 'summarize', True), ('dual-summary-check', 'summarize', False)]:
    argv = ['node', '--preserve-symlinks', '--preserve-symlinks-main', '--import', 'tsx', str(tool), mode, '--config', str(config_relative)]
    if write:
        argv.append('--write')
    completed = subprocess.run(argv, cwd=N / 'app', text=True, capture_output=True, check=False)
    stdout = O / f'STOCK.P13-fresh-A2-B.{key}.stdout.txt'
    stderr = O / f'STOCK.P13-fresh-A2-B.{key}.stderr.txt'
    exact_new(stdout, completed.stdout.encode())
    exact_new(stderr, completed.stderr.encode())
    stock.append({'check': key, 'argv': argv, 'cwd': str(N / 'app'), 'exitCode': completed.returncode,
                  'stdout': pin(stdout), 'stderr': pin(stderr), 'actualStdout': completed.stdout, 'actualStderr': completed.stderr})
    if completed.returncode:
        raise RuntimeError(f'Stock {key} failed: {completed.stderr}')

summary_path = N / root_relative / 'dual-summary.json'
assert not summary_path.is_symlink()
summary = json_read(summary_path)
assert summary['goalCount'] == 13
assert [x['goalId'] for x in summary['goals']] == manifest['goalIds']
for name in ['resolutions', 'synthesis-manifest.json', 'synthesis-decision-manifest.json', 'standalone-resolution-index.json']:
    assert not (N / root_relative / name).exists(), name
for path, expected in guards.items():
    assert pin(path) == expected, ('Changed source guard', path)

receipt = {
    'role': 'Technical byte-exact staging of actual P13 fresh A2 and independent B; stock prepared/dual-summary checks only',
    'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'script': pin(Path(__file__)), 'beforeGuards': pin(BEFORE),
    'rootCapsule': str(N), 'configRelativePath': str(config_relative), 'nativeRootRelativePath': str(root_relative),
    'goalCount': 13, 'goalIds': manifest['goalIds'], 'originalInputSelector': pin(SPECS['input'][0]),
    'independentSelectors': {'freshA2': pin(SPECS['a2'][0]), 'b': pin(SPECS['b'][0])},
    'localizedWriteDirectories': localized, 'byteExactCopies': copies, 'rounds': round_specs,
    'stockChecks': stock, 'actualDualSummary': pin(summary_path),
    'actualStockSummary': {key: value for key, value in summary.items() if key != 'goals'},
    'sourceGuardsBeforeAndAfterIdentical': True, 'verifiedSourceGuardCount': len(guards), 'sourceGuards': list(guards.values()),
    'centralFilesBeforeAndAfterIdentical': central_guards,
    'separateImageFindingsPreservedOpen': True,
    'scope': {'scientificSynthesisPerformed': False, 'synthesisManifestWritten': False,
              'resolutionsWritten': False, 'resolutionIndexWritten': False,
              'centralRegistryWritten': False, 'centralLedgerWritten': False,
              'newDescriptionOrProfileOrImageAuthored': False, 'sourceCapsulesWritten': False,
              'humanApproval': False, 'humanTrial': False, 'globalVisualOrM7Approval': False,
              'oldNonblindA13Used': False, 'mixed18Staged': False},
}
exact_new(RECEIPT, (json.dumps(receipt, ensure_ascii=False, indent=2) + '\n').encode())
print(json.dumps({'receipt': pin(RECEIPT), 'configRelativePath': str(config_relative),
                  'sourceGuards': len(guards), 'copies': len(copies), 'stockChecks': [{'check': x['check'], 'exitCode': x['exitCode'], 'stdout': x['actualStdout']} for x in stock],
                  'actualDualSummary': pin(summary_path), 'actualStockSummary': receipt['actualStockSummary']}, ensure_ascii=False))
