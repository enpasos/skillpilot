"""One actual Q3 JVM invocation; finite measurements, never global acceptance."""
from pathlib import Path
import gzip
import hashlib
import json
import re
import subprocess
import time

HERE = Path(__file__).resolve().parent
ROOT = Path('/home/enpasos/projects/skillpilot')
DATA = HERE / 'candidate-data'
BASE = ROOT / 'tmp/approach-review-20261101/geometry-six-dgl1-existing-routes-native-20261104-v2'
JAVA = Path('/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1/bin/java')

def sha(path):
    with Path(path).open('rb') as handle:
        return hashlib.file_digest(handle, 'sha256').hexdigest()

def write(path, value):
    with path.open('x') as handle:
        json.dump(value, handle, indent=2)
        handle.write('\n')

def load(name):
    return json.loads((HERE / name).read_text())

def inventory():
    return sorted(str(path.relative_to(DATA)) for path in DATA.rglob('*') if path.is_file())

def main():
    started = time.monotonic()
    preparation = load('preparation.json')
    inputs = load('candidate-input-hashes.json')
    maps = {name: load(name) for name in ['main-source-hashes.json', 'current-root-test-source-hashes.json',
            'runtime-class-hashes.json', 'runtime-resource-hashes.json', 'dependency-jar-hashes.json']}
    external = {path: digest for values in maps.values() for path, digest in values.items()}
    originals = load('preserved-source-bindings.json')
    cp = (HERE / 'classpath-current.txt').read_text().strip()
    directories = [Path(path) for path in cp.split(':') if not path.endswith('.jar')]
    sampler = load('sampler-class-hashes.json')
    names = ['prepare.py', 'run.py', 'supervise.py', 'launch.py', 'preparation-script-seal.json',
             'authorization.json', 'candidate-input-hashes.json', 'root-copy-input-hashes.json',
             'current-root-ci-input-hashes.json', 'n5-input-deltas.json', 'preparation.json',
             'test-support-source-hashes.json', 'test-source-runtime-boundary.json',
             'source-manifest.frozen.json', 'source-review.frozen.json', 'am-manifest.frozen.json',
             'source-authorization.frozen.json', 'effective-source-and-am-inputs.frozen.json',
             'am-receipt.frozen.json', 'preserved-source-bindings.json', 'runtime-origin.json',
             'classpath-current.txt', 'MatrixFiniteNativeProbe.java', 'decisions.json',
             'sampler-class-hashes.json', *maps]
    own = {name: sha(HERE / name) for name in names}
    seal = load('preparation-script-seal.json')
    for name, digest in seal['scripts'].items():
        assert own[name] == digest, name

    def guard():
        assert inventory() == sorted(inputs), 'Candidate input inventory changed'
        for rel, digest in inputs.items():
            assert not (DATA / rel).is_symlink() and sha(DATA / rel) == digest, rel
        for path, digest in {**external, **originals}.items():
            assert sha(Path(path)) == digest, path
        assert {str(path) for directory in directories for path in directory.rglob('*.class')} == set(maps['runtime-class-hashes.json'])
        assert {str(path) for directory in directories for path in directory.rglob('*')
                if path.is_file() and path.suffix != '.class'} == set(maps['runtime-resource-hashes.json'])
        assert {str(path) for path in (ROOT / 'backend/src/main/java').rglob('*.java')} == set(maps['main-source-hashes.json'])
        assert sampler == {str(path.relative_to(HERE / 'classes')): sha(path)
                           for path in (HERE / 'classes').rglob('*.class')}
        for name, digest in own.items():
            assert sha(HERE / name) == digest, name

    archive = HERE / 'candidate.json.gz'
    assert not archive.exists(), 'A new measurement must not replace any prior actual archive'
    origin = load('runtime-origin.json')
    class_log = HERE / 'class-load.actual.log'
    assert not class_log.exists()
    command = [str(JAVA), '-Xmx1800m', f'-Xlog:class+load=info:file={class_log}:uptime,level,tags',
               '-cp', str(HERE / 'classes') + ':' + cp,
               'com.skillpilot.backend.completion.MatrixFiniteNativeProbe', str(DATA), str(archive),
               str(HERE / 'decisions.json'), origin['mainClasses']]
    guard()
    write(HERE / 'guard.before-invocation.json', {'status': 'PASS', 'inputCount': len(inputs),
          'inputMapSha256': sha(HERE / 'candidate-input-hashes.json'),
          'sourceManifestSha256': preparation['sourceManifestSha256'], 'ownSourceHashes': own,
          'runtimeMaps': {name: {'count': len(values), 'sha256': sha(HERE / name)} for name, values in maps.items()}})
    phase_start = time.monotonic()
    with gzip.open(HERE / 'candidate.log.gz', 'xb') as log:
        process = subprocess.Popen(command, cwd=DATA / 'backend', stdout=subprocess.PIPE,
                                   stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL)
        write(HERE / 'candidate.started.json', {'pid': process.pid, 'argv': command,
              'cwd': str(DATA / 'backend'), 'javaVersionBoundByBaselineClasspathAndExplicitJdk': str(JAVA)})
        print(json.dumps({'phase': 'actual-jvm', 'pid': process.pid}), flush=True)
        for block in iter(lambda: process.stdout.read(65536), b''):
            log.write(block)
        code = process.wait()
    guard()
    execution = {'exitCode': code, 'seconds': round(time.monotonic() - phase_start, 2),
                 'inputCount': len(inputs), 'inputMapSha256': sha(HERE / 'candidate-input-hashes.json'),
                 'inputsSourcesClassesJarsResourcesAndOriginalFreezesUnchanged': True,
                 'ownSourceHashes': own, 'newCompilationClaim': False}
    write(HERE / 'candidate.execution.json', execution)
    print(json.dumps({'phase': 'actual-jvm', 'exitCode': code, 'seconds': execution['seconds']}), flush=True)
    if code:
        raise RuntimeError(f'Actual Q3 JVM exited {code}; preserve this attempt')
    loaded = [match.groups() for line in class_log.read_text().splitlines()
              if (match := re.search(r'\[class,load\]\s+(\S+)\s+source:\s+(.*)', line))]
    producer = 'com.skillpilot.backend.composition.MaterializeMathContextualCombinedViews'
    producer_loads = [(name, source) for name, source in loaded if name == producer or name.startswith(producer + '$')]
    assert not producer_loads, 'The changed producer must not be loaded by the reused runtime'
    required_loaded = [
        'com.skillpilot.backend.service.LearnerService',
        'com.skillpilot.backend.landscape.LandscapeService',
        'com.skillpilot.backend.landscape.GoalMappingService',
        'com.skillpilot.backend.service.CompositionViewService',
        'com.skillpilot.backend.completion.CompletionProfileCompiler',
        'com.skillpilot.backend.completion.CurriculumCompletionIntegrityTest',
        'com.skillpilot.backend.completion.MatrixFiniteNativeProbe']
    assert set(required_loaded) <= {name for name, _ in loaded}, 'Class-load logging must capture the actual sampler and helpers'
    class_load_proof = {'status': 'PASS_CHANGED_PRODUCER_NOT_LOADED_IN_ACTUAL_JVM',
        'classLoadLogSha256': sha(class_log), 'classLoadEntries': len(loaded),
        'changedProducerClass': producer, 'changedProducerAndNestedClassLoads': producer_loads,
        'requiredActualLoadedClasses': {name: [source for candidate, source in loaded if candidate == name]
                                       for name in required_loaded},
        'allActualLoadedBackendClasses': [(name, source) for name, source in loaded
                                         if name.startswith('com.skillpilot.backend.')],
        'newCompilationClaim': False}
    write(HERE / 'class-load.actual.json', class_load_proof)
    with gzip.open(archive, 'rt') as handle:
        report = json.load(handle)
    with gzip.open(BASE / 'candidate.json.gz', 'rt') as handle:
        baseline = json.load(handle)
    rows = report['scopes']
    assert len(rows) == report['actualScopeCount'] == 161
    assert report['actualUnionCount'] == 46
    assert report['measurementRepositoryMutationCount'] == report['measurementEventCount'] == 0
    assert report['inertLearnerUnchanged'] and report['publicFocusClaimsExcluded']
    assert {row['scope'] for row in rows} == {row['scope'] for row in baseline['scopes']}
    assert preparation['genuineAM4ManifestSha256'] == 'a7f2d78ffa47012b6e1fb80dd4ad29a4f2e0c2bca55915ab485028649580396e'
    def pairs(items, field):
        return {(row['scope'], goal) for row in items for goal in row[field]}
    actual_u = pairs(rows, 'uncoveredTargetGoalIds')
    actual_e = pairs(rows, 'uncoveredEndpointGoalIds')
    baseline_u = pairs(baseline['scopes'], 'uncoveredTargetGoalIds')
    baseline_e = pairs(baseline['scopes'], 'uncoveredEndpointGoalIds')
    changes = {'newUncoveredTargetPairs': sorted(actual_u - baseline_u),
               'closedUncoveredTargetPairs': sorted(baseline_u - actual_u),
               'newUncoveredEndpointPairs': sorted(actual_e - baseline_e),
               'closedUncoveredEndpointPairs': sorted(baseline_e - actual_e)}
    write(HERE / 'actual-uncovered-delta-vs-native5.json', changes)
    summary = {'status': 'ACTUAL_Q3_FINITE_NATIVE_MEASUREMENT_COMPLETE_NOT_GLOBAL_ACCEPTANCE',
        'archiveSha256': sha(archive), 'inputMapSha256': sha(HERE / 'candidate-input-hashes.json'),
        'inputCount': len(inputs), 'scopeCount': 161, 'unionCount': 46,
        'failedScopes': report['failedScopes'],
        'uncoveredTargetUniquePairs': [len({goal for _, goal in actual_u}), len(actual_u)],
        'uncoveredEndpointUniquePairs': [len({goal for _, goal in actual_e}), len(actual_e)],
        'baselineUncoveredTargetUniquePairs': [len({goal for _, goal in baseline_u}), len(baseline_u)],
        'baselineUncoveredEndpointUniquePairs': [len({goal for _, goal in baseline_e}), len(baseline_e)],
        'deltaCountsComparedWithActualNative5': {key: len(value) for key, value in changes.items()},
        'unreadyAssessmentScopePairs': sum(len(row['unreadyAssessmentGoalIds']) for row in rows),
        'duplicateVisibleGoalPathScopes': sum(bool(row['duplicateVisibleGoalPaths']) for row in rows),
        'duplicateStructureScopes': sum(bool(row['duplicateStructureIds']) for row in rows),
        'missingVisibleGoalScopePairs': sum(len(row['missingVisibleGoalIds']) for row in rows),
        'unexpectedVisibleGoalScopePairs': sum(len(row['unexpectedVisibleGoalIds']) for row in rows),
        'measurementRepositoryMutationCount': report['measurementRepositoryMutationCount'],
        'measurementEventCount': report['measurementEventCount'],
        'separateInventoryMockSetupSaves': report['separateInventoryMockSetupSaves'],
        'separateInventoryMockSetupEvents': report['separateInventoryMockSetupEvents'],
        'masteryScenarioCount': report['masteryScenarioCount'], 'inertLearnerUnchanged': True,
        'runtimeClassOrigins': report['runtimeClassOrigins'], 'samplerClassHashes': sampler,
        'classLoadProofSha256': sha(HERE / 'class-load.actual.json'),
        'actualClassLoadLogSha256': sha(class_log), 'changedProducerNotLoadedInActualJvm': True,
        'samplerSourceSha256': sha(HERE / 'MatrixFiniteNativeProbe.java'),
        'sourceManifestSha256': preparation['sourceManifestSha256'],
        'genuineIndependentAM4IncludedBeforeFreeze': True, 'allBeforeAfterHashGuardsPassed': True,
        'originalNative5Unchanged': True, 'newCompilationClaim': False,
        'runtimeCounts': {name: len(values) for name, values in maps.items()},
        'seconds': round(time.monotonic() - started, 2),
        'doesNotClaimM7StageNormalChecksDeploymentOrRemoteCI': True}
    guard()
    write(HERE / 'guard.after-invocation.json', {'status': 'PASS', 'candidateArchiveSha256': sha(archive),
          'sameGuardedInputsSourcesClassesJarsResourcesOriginalFreezesAndOwnScripts': True})
    write(HERE / 'candidate.summary.json', summary)
    write(HERE / 'result.json', summary)
    print(json.dumps(summary), flush=True)

if __name__ == '__main__':
    main()
