"""Scoped, byte-exact native staging; no science synthesis or resolution writes."""
import collections
import datetime
import hashlib
import json
import subprocess
import sys
from pathlib import Path

O = Path(__file__).resolve().parent
B = O.parent
N = O / 'capsule'
SPECS = [
    {'key': 'Requires20-A-B2', 'goalCount': 20,
     'input': ('current439-requires-only-native20-preparation-technical-c-v1/SELECTOR.clean-current-native20-reviewer-inputs.sealed.json', '1d7d28b1ca939583b38a2760e871746770fa4d0920b482b1443c326f1bb79e6d'),
     'round-a': ('chemie-current439-requires20-independent-a-v1/SELECTOR.independent-a-description-output.with-provenance.sealed.json', 'eb2ba8ecb7a04c64452a21dee94be09803607573afd25f76ad2ddce192bc0540'),
     'round-b': ('chemie-current439-requires20-fresh-independent-b2-v1/SELECTOR.current439-requires20-fresh-independent-b2.sealed.json', 'faf54795d8a9b98e2bea9b9c6a11d982bc820d37192cec54125f10c6d03e1988')},
    {'key': 'Mixed18-A-B', 'goalCount': 18,
     'input': ('current439-remaining-mixed18-preparation-technical-c-v1/SELECTOR.clean-current-native18-reviewer-inputs.sealed.json', 'b31969c32adc7b450881d87d6f7243bc6150194febfcbc979b79fe5c1f774492'),
     'round-a': ('chemie-current439-mixed18-independent-a-v1/SELECTOR.current439-mixed18-independent-a.sealed.json', '5971aed881d7ff0e9a4ffeffe922a36093b770d7627f2c236d274d26cc60fe9a'),
     'round-b': ('chemie-current439-mixed18-independent-b-v1/SELECTOR.independent-b18.sealed.json', '0a5777e2210dada6292ff4d769f3017a7ec271eaa54afc9589a867585b515c41')},
]

def pin(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def load(path):
    return json.loads(Path(path).read_text())

def all_embedded_pins(value):
    result = []
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            result.append(value)
        for child in value.values():
            result.extend(all_embedded_pins(child))
    elif isinstance(value, list):
        for child in value:
            result.extend(all_embedded_pins(child))
    return result

def own_dir(path, localized):
    assert path == N or N in path.parents, str(path)
    if path == N:
        assert path.is_dir() and not path.is_symlink()
        return
    own_dir(path.parent, localized)
    if path.is_symlink():
        original = path.resolve(strict=True)
        assert original.is_dir()
        path.unlink()
        path.mkdir()
        for child in original.iterdir():
            (path / child.name).symlink_to(child, target_is_directory=child.is_dir())
        localized.append({'path': str(path), 'previousAliasTarget': str(original)})
    elif not path.exists():
        path.mkdir()
        localized.append({'path': str(path), 'newLocalDirectory': True})
    assert path.is_dir() and not path.is_symlink(), str(path)

def new_file(path, raw):
    assert not path.exists() and not path.is_symlink(), str(path)
    with path.open('xb') as stream:
        stream.write(raw)
    return pin(path)

def stage(spec):
    key = spec['key']
    receipt_path = O / f'RECEIPT.{key}.exact-native-staging-and-stock-checks.json'
    before_path = O / f'GUARDS.{key}.before.json'
    assert not receipt_path.exists() and not before_path.exists(), 'Operation already started or sealed: ' + key
    guards = {}
    local_guards = {}
    snapshots = []
    copied = []
    localized = []
    relative_pin_resolutions = []
    selectors = {}
    selector_paths = {}

    def guard(expected, origin=None):
        path = Path(expected['path'])
        if not path.is_absolute():
            roots = [N, Path('/home/enpasos/projects/skillpilot')]
            if 'input' in selectors:
                roots.append(Path(selectors['input']['capsule']))
            if origin is not None:
                roots.append(Path(origin).parent)
            matches = []
            for root in dict.fromkeys(roots):
                candidate = root / path
                if candidate.is_file() and pin(candidate)['sha256'] == expected['sha256'].removeprefix('sha256:'):
                    matches.append(candidate)
            assert matches, ('No exact file for relative source pin', str(path), str(origin))
            relative_pin_resolutions.append({'inputPinPath': str(path), 'resolvedExactFile': str(matches[0]), 'originPinDocument': str(origin) if origin else None})
            path = matches[0]
        assert '/chemie-current439-requires20-independent-b-v1/' not in str(path), 'Nonblind original B20 must not be used'
        actual = pin(path)
        assert actual['sha256'] == expected['sha256'].removeprefix('sha256:'), str(path)
        if 'bytes' in expected:
            assert actual['bytes'] == expected['bytes'], str(path)
        if str(path) in guards:
            assert guards[str(path)] == actual, str(path)
        guards[str(path)] = actual

    for label in ['input', 'round-a', 'round-b']:
        relative, expected_sha = spec[label]
        path = B / relative
        guard({'path': str(path), 'sha256': expected_sha})
        selectors[label] = load(path)
        selector_paths[label] = path
        for item in all_embedded_pins(selectors[label]):
            guard(item)

    clean = selectors['input']
    original_root = Path(clean['nativeRoot'])
    relative_root = original_root.relative_to(Path(clean['capsule']))
    native = N / relative_root
    assert native.is_symlink() and native.resolve(strict=True) == original_root.resolve(strict=True)
    manifest = load(original_root / 'batch-manifest.json')
    config_relative = manifest['configPath']
    assert pin(N / config_relative)['sha256'] == manifest['configDigest'].removeprefix('sha256:')
    assert manifest['goalIds'] == clean['goalIds'] and len(manifest['goalIds']) == spec['goalCount']
    assert not (original_root / 'dual-summary.json').exists()
    assert not (native / 'dual-summary.json').exists()
    original_resolution_dir = original_root / 'resolutions'
    assert original_resolution_dir.is_dir() and not list(original_resolution_dir.iterdir())
    for name in ['round-a/results', 'round-b/results']:
        assert not list((original_root / name).iterdir()), 'Frozen result directories must remain empty'

    # Guard all original native preparation files in addition to its explicit pins.
    original_file_list = []
    for path in sorted(original_root.rglob('*')):
        if path.is_file():
            original_file_list.append(str(path.relative_to(original_root)))
            guard(pin(path))

    # Source documents below are traversed for pin structures only. No scientific
    # verdict is interpreted, changed or synthesized by this script.
    pin_documents = [Path(x['path']) for x in clean['cleanSupplementPins'] if x['path'].endswith('.json')]
    for round_name in ['round-a', 'round-b']:
        reviewer = selectors[round_name]
        for item in all_embedded_pins(reviewer):
            path = Path(item['path'])
            name = path.name.lower()
            if path.suffix == '.json' and not name.startswith('first.') and any(token in name for token in ['pin', 'input', 'binding', 'coverage', 'visual', 'source-material', 'material-file', 'primary.actual', 'fetch.']):
                pin_documents.append(path)
    for path in dict.fromkeys(pin_documents):
        for item in all_embedded_pins(load(path)):
            guard(item, path)

    for name in ['in-flight-work-ledger.json', 'in-flight-work-ledger.md']:
        path = N / 'curricula/DE/Gymnasium/quality/goal-description-review' / name
        if path.is_file():
            local_guards[str(path)] = pin(path)

    rounds = []
    for round_name, binding_key in [('round-a', 'first'), ('round-b', 'second')]:
        reviewer = selectors[round_name]
        items = all_embedded_pins(reviewer)
        records = reviewer.get('records') or next(x for x in items if x['path'].endswith(('.records.jsonl', '/description-records.jsonl')))
        run_pin = reviewer.get('runManifest') or next(x for x in items if x['path'].endswith(('.run.json', '/run-manifest.json')))
        run = load(run_pin['path'])
        binding = manifest['artifacts']['rounds'][binding_key]
        for field in ['campaignId', 'roundId', 'batchId', 'batchInputFingerprint', 'independenceGroupId']:
            assert run[field] == binding[field], (round_name, field)
        assert run['goalIds'] == manifest['goalIds']
        assert run['blindToOtherRuns'] is True
        entries = [json.loads(line) for line in Path(records['path']).read_text().splitlines() if line.strip()]
        assert len(entries) == spec['goalCount']
        assert [entry['goalId'] for entry in entries] == manifest['goalIds']
        assert all(entry['recordStatus'] == 'candidate' and entry['reviewAuthority'] == 'ai_candidate' for entry in entries)
        rounds.append({'directory': round_name, 'selector': pin(selector_paths[round_name]), 'preparedBinding': binding,
                       'recordsSource': records, 'runSource': run_pin,
                       'preservedRunIdentity': {field: run[field] for field in ['runId', 'provider', 'model', 'startedAt', 'completedAt', 'blindToOtherRuns']},
                       'recordCount': len(entries), 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
                       'unalteredDecisionCounts': dict(collections.Counter(entry['decision'] for entry in entries)),
                       'unalteredProfileRecommendationCounts': dict(collections.Counter(entry['evidenceProfileRecommendation'] for entry in entries))})

    before = {'role': 'Pre-write exact source/input/native-output guards; technical only', 'key': key,
              'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'sourceGuards': list(guards.values()), 'relativePinResolutions': relative_pin_resolutions, 'localCentralGuards': list(local_guards.values()),
              'originalNativeFileList': original_file_list}
    new_file(before_path, (json.dumps(before, ensure_ascii=False, indent=2) + '\n').encode())

    def copy_exact(source_pin, destination):
        source = Path(source_pin['path'])
        assert pin(source) == guards[str(source)]
        raw = source.read_bytes()
        assert native in destination.parents
        own_dir(destination.parent, localized)
        assert not destination.exists() and not destination.is_symlink(), str(destination)
        for ancestor in destination.parents:
            assert not ancestor.is_symlink(), ('Write-through alias', str(ancestor))
            if ancestor == N:
                break
        result = new_file(destination, raw)
        assert result['sha256'] == source_pin['sha256'].removeprefix('sha256:')
        copied.append({'source': guards[str(source)], 'destination': result, 'byteExact': True})

    own_dir(native, localized)
    for round_spec in rounds:
        round_name = round_spec['directory']
        batch_id = round_spec['preparedBinding']['batchId']
        copy_exact(round_spec['recordsSource'], native / round_name / 'results' / f'{batch_id}.records.jsonl')
        copy_exact(round_spec['runSource'], native / round_name / 'results' / f'{batch_id}.run.json')
        reviewer = selectors[round_name]
        candidates = [pin(selector_paths[round_name])]
        for item in all_embedded_pins(reviewer):
            path = Path(item['path'])
            # Copy only own review provenance/parameters/checks, not the input
            # source bodies or an unrelated older review referenced in a check.
            if not path.is_relative_to(selector_paths[round_name].parent):
                continue
            name = path.name
            if name.startswith(('FIRST.', 'CHECK.', 'PROVENANCE.', 'generation-parameters', 'execution-declaration', 'validation', 'SELECTOR.')):
                candidates.append(item)
        seen_proofs = set()
        for item in candidates:
            name = Path(item['path']).name
            if name in seen_proofs:
                continue
            seen_proofs.add(name)
            copy_exact(item, native / 'independent-review-original-bytes' / round_name / name)

    # The preparation's empty resolution alias is preserved without writing to it.
    resolution_alias = native / 'resolutions'
    assert resolution_alias.is_symlink()
    assert resolution_alias.resolve(strict=True) == original_resolution_dir.resolve(strict=True)
    assert not list(resolution_alias.iterdir())

    stock_checks = []
    tool = N / 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'
    tool_before = pin(tool)
    for label, mode, write in [('prepared-check', 'check', False), ('dual-summary-write', 'summarize', True), ('dual-summary-check', 'summarize', False)]:
        argv = ['node', '--preserve-symlinks', '--preserve-symlinks-main', '--import', 'tsx', str(tool), mode, '--config', config_relative]
        if write:
            argv.append('--write')
        completed = subprocess.run(argv, cwd=N / 'app', text=True, capture_output=True, check=False)
        stdout_path = O / f'STOCK.{key}.{label}.stdout.txt'
        stderr_path = O / f'STOCK.{key}.{label}.stderr.txt'
        stock_checks.append({'check': label, 'argv': argv, 'cwd': str(N / 'app'), 'exitCode': completed.returncode,
                             'stdout': new_file(stdout_path, completed.stdout.encode()), 'stderr': new_file(stderr_path, completed.stderr.encode()),
                             'actualStdout': completed.stdout, 'actualStderr': completed.stderr})
        assert completed.returncode == 0, (label, completed.stderr)

    summary_path = native / 'dual-summary.json'
    assert not summary_path.is_symlink()
    summary = load(summary_path)
    assert summary['goalCount'] == spec['goalCount'] and summary['automaticAcceptance'] is False
    assert [row['goalId'] for row in summary['goals']] == manifest['goalIds']
    assert not (original_root / 'dual-summary.json').exists()
    assert original_file_list == [str(path.relative_to(original_root)) for path in sorted(original_root.rglob('*')) if path.is_file()]
    assert not list(original_resolution_dir.iterdir()) and not list(resolution_alias.iterdir())
    assert not list(native.glob('**/*.resolution.json'))
    for name in ['synthesis-manifest.json', 'synthesis-decision-manifest.json', 'standalone-resolution-index.json', 'standalone-batch-resolution-index.json']:
        assert not (native / name).exists(), name
    for path, expected in guards.items():
        assert pin(path) == expected, ('Changed source', path)
    for path, expected in local_guards.items():
        assert pin(path) == expected, ('Changed central file', path)
    assert pin(tool) == tool_before
    for item in copied:
        assert pin(item['destination']['path']) == item['destination']

    receipt = {'role': 'Pure technical byte-exact paired native staging and prepared/dual-summary stock checks; no synthesis',
               'key': key, 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
               'script': pin(Path(__file__)), 'beforeGuards': pin(before_path), 'rootCapsule': str(N),
               'configRelativePath': config_relative, 'nativeRootRelativePath': str(relative_root),
               'originalInputSelector': pin(selector_paths['input']), 'goalCount': spec['goalCount'], 'goalIds': manifest['goalIds'],
               'rounds': rounds, 'byteExactCopies': copied, 'localizedWriteDirectories': localized,
               'allNativeWritesInsideThisNativeRoot': True,
               'stockChecks': stock_checks, 'actualDualSummary': pin(summary_path),
               'actualStockSummary': {field: value for field, value in summary.items() if field != 'goals'},
               'sourceGuardsBeforeAndAfterIdentical': True, 'verifiedSourceGuardCount': len(guards), 'sourceGuards': list(guards.values()),
               'relativePinResolutions': relative_pin_resolutions,
               'originalNativeFileListBeforeAndAfterIdentical': True, 'originalNativeFileList': original_file_list,
               'localCentralGuardsBeforeAndAfterIdentical': list(local_guards.values()),
               'stockToolBeforeAndAfterIdentical': tool_before,
               'preExistingEmptyResolutionAliasPreserved': {'path': str(resolution_alias), 'target': str(original_resolution_dir), 'fileCount': 0},
               'scope': {'originalFirstsAndScienceUnchanged': True, 'recordDecisionsAndRecommendationsUnchanged': True,
                         'scientificSynthesisPerformed': False, 'resolutionsWritten': False, 'synthesisManifestWritten': False,
                         'resolutionIndexWritten': False, 'centralRegistryWritten': False, 'centralLedgerWritten': False,
                         'canonicalOrProfileOrImageWrites': False, 'foreignSourceWrites': False,
                         'humanApproval': False, 'humanTrial': False, 'globalVisualOrM7Approval': False,
                         'nonblindOriginalRequiresB20Used': False, 'openFindingsRemainOpen': True}}
    new_file(receipt_path, (json.dumps(receipt, ensure_ascii=False, indent=2) + '\n').encode())
    for path in [receipt_path, before_path] + [Path(check[field]['path']) for check in stock_checks for field in ['stdout', 'stderr']]:
        path.chmod(0o444)
    print(json.dumps({'key': key, 'receipt': pin(receipt_path), 'configRelativePath': config_relative,
                      'verifiedSourceGuards': len(guards), 'byteExactCopyCount': len(copied), 'rounds': [{field: r[field] for field in ['directory', 'recordCount', 'unalteredDecisionCounts', 'unalteredProfileRecommendationCounts']} for r in rounds],
                      'actualDualSummary': pin(summary_path), 'actualStockCounts': summary['counts'],
                      'stockChecks': [{'check': check['check'], 'exitCode': check['exitCode'], 'stdout': check['actualStdout']} for check in stock_checks]}, ensure_ascii=False), flush=True)

selected = sys.argv[1:]
assert not selected or all(key in {spec['key'] for spec in SPECS} for key in selected)
for specification in SPECS:
    if not selected or specification['key'] in selected:
        stage(specification)
