"""Finish the P13 technical receipt after preserving the pre-existing empty alias."""
import datetime
import hashlib
import json
import subprocess
from pathlib import Path

O = Path(__file__).resolve().parent
B = O.parent
N = O / 'capsule'
REL = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-P13-native-preparation-technical-root-v1/native13')
ORIGINAL = B / 'current439-P13-native-preparation-technical-root-v1/capsule' / REL
PROOF = N / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1/independent-review-original-bytes/native13-fresh-a2-b'
RECEIPT = O / 'RECEIPT.P13-fresh-A2-B.exact-native-staging-and-stock-checks.json'
BEFORE = O / 'GUARDS.P13-fresh-A2-B.before.json'

def pin(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def read_json(path):
    return json.loads(Path(path).read_text())

def new_file(path, raw):
    assert not path.exists() and not path.is_symlink(), str(path)
    with path.open('xb') as stream:
        stream.write(raw)
    return pin(path)

assert not RECEIPT.exists()
before = read_json(BEFORE)
guards = {x['path']: x for x in before['guards']}
for path, expected in guards.items():
    assert pin(path) == expected, ('Changed pre-write guard', path)
manifest = read_json(ORIGINAL / 'batch-manifest.json')
config_relative = manifest['configPath']
assert pin(N / config_relative)['sha256'] == manifest['configDigest'].removeprefix('sha256:')
assert not (N / REL).is_symlink()

selectors = {
    'round-a': B / 'chemie-current439-P13-fresh-independent-a2-v1/SELECTOR.sealed.json',
    'round-b': B / 'chemie-current439-P13-independent-b-v1/SELECTOR.independent-b13.sealed.json',
}
copies = []
rounds = []
localized = []
for round_name, selector_path in selectors.items():
    reviewer = read_json(selector_path)
    items = reviewer.get('files', reviewer.get('artifacts', []))
    records_pin = reviewer.get('records') or next(x for x in items if x['path'].endswith('.records.jsonl'))
    run_pin = reviewer.get('runManifest') or next(x for x in items if x['path'].endswith('.run.json'))
    run = read_json(run_pin['path'])
    binding = manifest['artifacts']['rounds']['first' if round_name == 'round-a' else 'second']
    assert run['batchId'] == binding['batchId'] and run['campaignId'] == binding['campaignId']
    assert run['roundId'] == binding['roundId'] and run['batchInputFingerprint'] == binding['batchInputFingerprint']
    assert run['goalIds'] == manifest['goalIds']
    for source, suffix in [(records_pin, '.records.jsonl'), (run_pin, '.run.json')]:
        destination = N / REL / round_name / 'results' / (binding['batchId'] + suffix)
        assert not destination.is_symlink()
        assert destination.read_bytes() == Path(source['path']).read_bytes()
        assert pin(destination)['sha256'] == source['sha256']
        copies.append({'source': source, 'destination': pin(destination), 'byteExact': True})
    by_name = {Path(x['path']).name: x for x in items}
    by_name[selector_path.name] = pin(selector_path)
    for destination in sorted((PROOF / round_name).iterdir()):
        assert destination.is_file() and not destination.is_symlink()
        source = by_name[destination.name]
        assert destination.read_bytes() == Path(source['path']).read_bytes()
        copies.append({'source': source, 'destination': pin(destination), 'byteExact': True})
    records = [json.loads(line) for line in Path(records_pin['path']).read_text().splitlines() if line.strip()]
    assert len(records) == 13
    assert all(x['reviewAuthority'] == 'ai_candidate' and x['recordStatus'] == 'candidate' for x in records)
    rounds.append({'directory': round_name, 'sourceSelector': pin(selector_path), 'preparedBinding': binding,
                   'records': records_pin, 'run': run_pin,
                   'preservedRunIdentity': {key: run[key] for key in ['runId', 'provider', 'model', 'startedAt', 'completedAt', 'blindToOtherRuns']},
                   'recordCount': len(records), 'allCandidateAiCandidate': True})

for copy in copies:
    destination = Path(copy['destination']['path'])
    for ancestor in destination.parents:
        assert not ancestor.is_symlink(), ('Write-through alias', str(ancestor))
        if ancestor == N:
            break
for rel in [REL, REL / 'round-a', REL / 'round-a/results', REL / 'round-b', REL / 'round-b/results']:
    path = N / rel
    assert path.is_dir() and not path.is_symlink()
    localized.append({'localDirectory': str(path), 'originalReadOnlyCounterpart': str(ORIGINAL / path.relative_to(N / REL))})

original_resolutions = ORIGINAL / 'resolutions'
target_resolutions = N / REL / 'resolutions'
assert original_resolutions.is_dir() and not list(original_resolutions.iterdir())
assert target_resolutions.is_symlink() and target_resolutions.resolve(strict=True) == original_resolutions.resolve(strict=True)
assert not list(target_resolutions.iterdir())
assert not list((N / REL).glob('**/*.resolution.json'))
for name in ['synthesis-manifest.json', 'synthesis-decision-manifest.json', 'standalone-resolution-index.json', 'standalone-batch-resolution-index.json']:
    assert not (N / REL / name).exists()

stock = []
tool = N / 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'
for key, mode in [('final-prepared-check', 'check'), ('final-dual-summary-check', 'summarize')]:
    argv = ['node', '--preserve-symlinks', '--preserve-symlinks-main', '--import', 'tsx', str(tool), mode, '--config', config_relative]
    completed = subprocess.run(argv, cwd=N / 'app', text=True, capture_output=True, check=False)
    stdout = new_file(O / f'STOCK.P13-fresh-A2-B.{key}.stdout.txt', completed.stdout.encode())
    stderr = new_file(O / f'STOCK.P13-fresh-A2-B.{key}.stderr.txt', completed.stderr.encode())
    stock.append({'check': key, 'argv': argv, 'cwd': str(N / 'app'), 'exitCode': completed.returncode,
                  'stdout': stdout, 'stderr': stderr, 'actualStdout': completed.stdout, 'actualStderr': completed.stderr})
    assert completed.returncode == 0, completed.stderr

prior_logs = []
for key in ['prepared-check', 'dual-summary-write', 'dual-summary-check']:
    stdout = O / f'STOCK.P13-fresh-A2-B.{key}.stdout.txt'
    stderr = O / f'STOCK.P13-fresh-A2-B.{key}.stderr.txt'
    assert not stderr.read_text()
    prior_logs.append({'check': key, 'stdout': pin(stdout), 'stderr': pin(stderr), 'actualStdout': stdout.read_text(),
                       'exitCode': 0, 'exitCodeEvidence': 'Initial staging control flow completed all three subprocess return-code gates and reached its later pre-existing-directory assertion.'})

summary_path = N / REL / 'dual-summary.json'
assert summary_path.is_file() and not summary_path.is_symlink()
summary = read_json(summary_path)
assert summary['goalCount'] == 13 and [x['goalId'] for x in summary['goals']] == manifest['goalIds']
assert summary['automaticAcceptance'] is False
assert not (ORIGINAL / 'dual-summary.json').exists()
for path, expected in guards.items():
    assert pin(path) == expected, ('Changed post-write guard', path)

receipt = {
    'role': 'Technical byte-exact staging of actual P13 fresh A2 and independent B; stock prepared/dual-summary checks only',
    'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'stagingScript': pin(O / 'stage_p13_fresh_a2_b_exact_native_reviews.py'), 'completionScript': pin(Path(__file__)),
    'beforeGuards': pin(BEFORE), 'rootCapsule': str(N), 'configRelativePath': config_relative,
    'nativeRootRelativePath': str(REL), 'goalCount': 13, 'goalIds': manifest['goalIds'],
    'rounds': rounds, 'byteExactCopies': copies, 'localizedWriteDirectories': localized,
    'initialStockChecks': prior_logs, 'finalStockChecks': stock,
    'actualDualSummary': pin(summary_path), 'actualStockSummary': {k: v for k, v in summary.items() if k != 'goals'},
    'preExistingEmptyResolutionsAliasPreserved': {'path': str(target_resolutions), 'target': str(original_resolutions), 'fileCount': 0},
    'initialTechnicalAssertionCorrection': 'The initial script expected no resolutions directory; frozen preparation already contained an empty one. Its exact empty read-only alias was preserved. No resolution file or directory was created by this staging.',
    'sourceGuardsBeforeAndAfterIdentical': True, 'verifiedSourceGuardCount': len(guards), 'sourceGuards': list(guards.values()),
    'centralFilesBeforeAndAfterIdentical': before['centralFiles'],
    'separateImageFindingsPreservedOpen': True,
    'separateImageFindings': next(x for x in copies if Path(x['source']['path']).name == 'separate-current-image-findings.json'),
    'scope': {'scientificSynthesisPerformed': False, 'synthesisManifestWritten': False, 'resolutionsWritten': False,
              'resolutionIndexWritten': False, 'centralRegistryWritten': False, 'centralLedgerWritten': False,
              'newDescriptionOrProfileOrImageAuthored': False, 'sourceCapsulesWritten': False,
              'humanApproval': False, 'humanTrial': False, 'globalVisualOrM7Approval': False,
              'oldNonblindA13Used': False, 'mixed18Staged': False},
}
new_file(RECEIPT, (json.dumps(receipt, ensure_ascii=False, indent=2) + '\n').encode())
print(json.dumps({'receipt': pin(RECEIPT), 'configRelativePath': config_relative, 'sourceGuards': len(guards),
                  'copies': len(copies), 'actualDualSummary': pin(summary_path), 'actualStockSummary': receipt['actualStockSummary'],
                  'stockChecks': [{'check': x['check'], 'exitCode': x['exitCode'], 'stdout': x['actualStdout']} for x in stock]}, ensure_ascii=False))
