"""Package actual terminal proof without changing the measured runtime leaves."""
from pathlib import Path
import datetime
import hashlib
import json

R = Path('/home/enpasos/projects/skillpilot')
G = Path(__file__).resolve().parent
O = G / 'overlay'
C = G / 'check-host'
N = R / 'tmp/approach-review-20261101/math-context-he-three-joint-native-20261104-v1'
Q = json.loads((G / 'joint-integration-config.json').read_text())['qualityRoot']

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def read(path):
    return json.loads(Path(path).read_text())

def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

frozen = read(G / 'manifest.json')
extended = read(G / 'manifest.quality-stage-adopted-458.json')
assert sha(G / 'manifest.json') == '7fc47cbdc2c786a46235b58c058bc016815b3f4622730b2336ce3b9a361fa3c0'
assert sha(G / 'manifest.quality-stage-adopted-458.json') == '27af66b8267d9113b1d0cf8418ec3f95e56a0edbfe156a6c1763d4c9f7089f80'
assert len(frozen['files']) == 450 and len(extended['files']) == 458
leaves = {row['path']: row for row in extended['files']}
assert all(leaves[row['path']] == row for row in frozen['files'])
for row in extended['files']:
    assert sha(O / row['path']) == row['candidateSha256'], row['path']
    assert sha(C / row['path']) == row['candidateSha256'], row['path']

execution = read(G / 'final-bound-checks/execution.json')
expected = {'stage-policy', 'duration18', 'source-coverage', 'hard-routes', 'phase-compatibility',
            'python-population', 'country88', 'atomicity-current-config', 'memory-current-config',
            'goalbook-model', 'stage-country'}
latest = {row['name']: row for row in execution['commands']}
assert set(latest) == expected
assert all(row['exitCode'] == 0 for row in latest.values())
assert execution['allFinalExitCodesZero'] and execution['payloadDrift'] == []
assert execution['completedDistinctCommands'] == execution['exactAgreedCommands'] == 11

additions = []
relocations = []

def adopt(source, suffix):
    source = Path(source)
    relative = f'{Q}/{suffix}'
    target = O / relative
    assert relative not in leaves, f'Existing frozen/reviewer leaf must never be overwritten: {relative}'
    data = source.read_bytes()
    if target.exists():
        assert target.read_bytes() == data, f'New proof unexpectedly changed: {relative}'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    row = {'path': relative, 'candidatePath': str(target.relative_to(R)),
           'candidateSha256': sha(target), 'beforeSha256': sha(R / relative) if (R / relative).exists() else None,
           'bytes': len(data)}
    leaves[relative] = row
    additions.append(relative)
    relocation = {'sourcePath': str(source.relative_to(R)), 'importPath': relative,
                  'sha256': row['candidateSha256'], 'bytes': len(data)}
    relocations.append(relocation)
    return relocation

adopt(G / 'manifest.json', 'producer-evidence/final-bound-checks/native-runtime-manifest.frozen.json')
adopt(G / 'manifest.quality-stage-adopted-458.json', 'producer-evidence/final-bound-checks/stage-quality-manifest.frozen.json')
adopt(G / 'manifest-relocation.binding.actual.json', 'producer-evidence/final-bound-checks/manifest-relocation.binding.actual.json')
for row in execution['commands']:
    assert row['inputManifestSha256'] == sha(G / 'manifest.quality-stage-adopted-458.json')
    for stream in ['stdout', 'stderr']:
        log = R / row[stream]['path']
        assert sha(log) == row[stream]['sha256'] and log.stat().st_size == row[stream]['bytes']
        adopt(log, f'producer-evidence/final-bound-checks/{log.name}')
terminal = adopt(G / 'final-bound-checks/execution.json', 'producer-evidence/final-bound-checks/execution.actual.json')
for name in ['normal-check-code-bindings.actual.json', 'final-root-quality-consumer-code-sync.actual.json',
             'goalbook-profile-consumer-fix.actual.json', 'stage-country-fixture-input-fix.actual.json',
             'run-normal-checks.py', 'run-normal-checks-preserved458.py', 'finalize-import-quality.py']:
    adopt(G / name, f'producer-evidence/final-bound-checks/{name}')

graph = read(G / 'current-graph-validation.actual.json')
assert sha(G / 'current-graph-validation.actual.json') == '1c9ecd6f6b4d9a3a7b7d3b9b15a44d47d0dd62c2250ee8afcd552f817c2c350b'
assert graph['exitCode'] == 1 and graph['errors'] == 12 and graph['warnings'] == 0 and graph['byCode'] == {'GVR-012': 12}
graph_binding = adopt(G / 'current-graph-validation.actual.json', 'producer-evidence/final-bound-checks/current-graph-validation.actual.json')
for stream in ['stdout', 'stderr']:
    source = R / graph[stream]['path']
    assert sha(source) == graph[stream]['sha256']
    adopt(source, f'producer-evidence/final-bound-checks/{source.name}')

native_summary = read(N / 'candidate.summary.json')
native_delta = read(N / 'finite-delta.actual.json')
assert native_summary['archiveSha256'] == 'e412662ca5720f4b5d52046cf283484604eb691201eee0e3c52e9dbb4402eea4'
assert sha(N / 'candidate.json.gz') == native_summary['archiveSha256']
assert native_delta['scopeCount'] == 161 and native_delta['unionCount'] == 46
assert native_delta['exactAdditionalTargetPairs'] == 532 + 36 + 4
assert native_delta['after'] == {'uncoveredUnique': 261, 'uncoveredPairs': 2982, 'endpointUnique': 169, 'endpointPairs': 1987, 'failedScopes': 144}
assert native_delta['delta']['newUncovered'] == native_delta['delta']['newEndpoints'] == 0
for name in ['candidate.summary.json', 'candidate.execution.json', 'finite-delta.actual.json']:
    adopt(N / name, f'producer-evidence/final-bound-checks/root-native-{name}')

code = read(G / 'normal-check-code-bindings.actual.json')['bindings']
code += [{'path': read(G / name)['path'], 'sha256': read(G / name)[field]}
         for name, field in [('goalbook-profile-consumer-fix.actual.json', 'sha256'),
                             ('stage-country-fixture-input-fix.actual.json', 'afterSha256')]]
for binding in code:
    assert sha(R / binding['path']) == sha(C / binding['path']) == binding['sha256']
proof = {'status': 'ELEVEN_NORMAL_COMMANDS_PASS_FROZEN_RUNTIME_UNCHANGED_GRAPH_DEBT_RETAINED',
         'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
         'actualTerminalExecution': terminal,
         'finalPasses': [{'name': name, 'attempt': latest[name]['attempt'], 'exitCode': 0} for name in sorted(expected)],
         'allFailedAttemptsAndExactLogsRetained': True,
         'historicalManifestReferenceRelocations': relocations,
         'separateRootQualityAndFixtureCodeBindings': code,
         'frozenRuntimeLeaves': 450, 'frozenRuntimeManifestSha256': sha(G / 'manifest.json'),
         'all450RuntimeAndMeasuredCodeLeavesUnchanged': True,
         'genuineStageReceipt': extended['genuineStageReceipt'],
         'rootNative': {'archivePath': str((N / 'candidate.json.gz').relative_to(R)),
                        'archiveSha256': native_summary['archiveSha256'], 'after': native_delta['after'],
                        'exactAdditionalTargetPairs': native_delta['exactAdditionalTargetPairs'],
                        'targetPairPartition': {'newProxy': 532, 'existingB2Additional': 36, 'ordinaryHE': 4},
                        'newUncovered': 0, 'newEndpoints': 0, 'actualMeasurementRerun': False},
         'currentGraphValidation': graph_binding,
         'currentGraphValidationIsPass': False, 'currentGraphErrors': 12, 'currentGraphWarnings': 0,
         'legacyB2CQR203MissingFourReleaseCoverageFieldsRetained': True,
         'oldMergedFocusRequiresExplicitSelectionWithZeroWrites': True,
         'noNewJvmOrGeneralM7Review': True, 'rootGitWrites': False,
         'rootImportStillRequired': True}
proof_path = G / 'final-import-quality.actual.json'
write(proof_path, proof)
proof_binding = adopt(proof_path, 'producer-evidence/final-bound-checks/final-import-quality.actual.json')

final = dict(extended)
final.update({'status': 'IMPORT_READY_ELEVEN_NORMAL_PASSES_GENUINE_STAGE_NATIVE_FINITE_DELTA_GRAPH_DEBT_RETAINED',
              'files': sorted(leaves.values(), key=lambda row: row['path']),
              'nativeRuntimeManifestPreserved': {'path': str((G / 'manifest.json').relative_to(R)),
                                                 'sha256': sha(G / 'manifest.json'), 'leaves': 450},
              'previousQualityExtendedManifest': {'path': str((G / 'manifest.quality-stage-adopted-458.json').relative_to(R)),
                                                  'sha256': sha(G / 'manifest.quality-stage-adopted-458.json'), 'leaves': 458},
              'finalImportQualityProof': proof_binding, 'laterQualityOnlyFinalProofLeaves': additions,
              'all450RuntimeAndMeasuredCodeLeavesUnchanged': True,
              'currentGraphValidationIsPass': False, 'currentGraphErrors': 12, 'currentGraphWarnings': 0,
              'pending': ['Root import and Root Git operations'], 'rootOrRootGitWrites': False})
write(G / 'manifest.import-ready.json', final)
assert all(final['files'][next(i for i, row in enumerate(final['files']) if row['path'] == original['path'])] == original for original in frozen['files'])
print(json.dumps({'status': final['status'], 'manifestPath': str((G / 'manifest.import-ready.json').relative_to(R)),
                  'manifestSha256': sha(G / 'manifest.import-ready.json'), 'leaves': len(final['files']),
                  'frozen450Unchanged': True, 'qualityOnlyAdditions': len(additions),
                  'graphErrorsRetained': 12, 'graphWarnings': 0}))
