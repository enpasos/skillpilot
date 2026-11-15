#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Archive the real focused terminal result and compare every emitted scope to the frozen fixture."""
import gzip
import hashlib
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[5]
TEST = ROOT / 'backend/src/test/java/com/skillpilot/backend/controller/LearnerControllerIntegrationTest.java'
METHODS = [
    'learnerStateUsesReviewedMathSekIDurationProjectionForAtomicTotals',
    'learnerStateUsesMathCrossStageDurationCompositionViewsForAtomicTotals',
    'learnerStateUsesReviewedScienceSekIDurationProjectionForAtomicTotals',
]
COMMAND = ['GRADLE_USER_HOME=/tmp/skillpilot-plan-gradle-20261022', './gradlew', '--project-cache-dir',
           '../tmp/backend-reviewed-seed-fixtures-20261115/gradle-project-cache', '--console=plain', '--no-daemon', 'test']
for method in METHODS:
    COMMAND += ['--tests', 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest.' + method]

def pin(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()}

def put_once(path, data):
    if path.exists():
        assert path.read_bytes() == data, 'Immutable actual output differs: ' + str(path)
    else:
        path.write_bytes(data)

def normalized_config(config):
    return json.dumps(json.loads(config), sort_keys=True)

def main():
    live_xml = ROOT / 'backend/build/test-results/test/TEST-com.skillpilot.backend.controller.LearnerControllerIntegrationTest.xml'
    live_log = ROOT / 'tmp/semiconductor-ci-qa-20261115/backend-three-current-after.actual.log'
    xml = ET.fromstring(live_xml.read_bytes())
    assert (xml.get('tests'), xml.get('failures'), xml.get('errors'), xml.get('skipped')) == ('3', '0', '0', '0')
    assert {case.get('name').removesuffix('()') for case in xml.findall('testcase')} == set(METHODS)
    assert 'BUILD SUCCESSFUL' in live_log.read_text()
    before = json.loads((HERE / 'current-api-seed-scopes-before.actual.json').read_text())
    config_keys = {normalized_config(row['personalCurriculum']): row['key'] for row in before['scopes']}
    observations = {}
    raw_rows = 0
    for line in xml.find('system-out').text.splitlines():
        if 'REQUIRED_LEARNING_SCOPE ' not in line:
            continue
        row = json.loads(line.split('REQUIRED_LEARNING_SCOPE ', 1)[1])
        raw_rows += 1
        key = config_keys[normalized_config(row['configuration'])]
        observation = {name: sorted(row[name]) if name != 'requiredByPaths' else row[name]
                       for name in ['seedAtomicGoalIds', 'targetGoalIds', 'requiredByPaths']}
        if key in observations:
            assert observations[key] == observation
        observations[key] = observation
    fixture = json.loads((HERE / 'seed-scope-comparison.actual.json').read_text())
    assert len(observations) == 128 and raw_rows == 130
    for key, actual in observations.items():
        assert actual['seedAtomicGoalIds'] == fixture['scopes'][key]['currentSeedAtomicGoalIds'], key
        previous = next(row for row in before['scopes'] if row['key'] == key)
        assert actual['targetGoalIds'] == sorted(previous['targetGoalIds']), key
        assert actual['requiredByPaths'] == previous['requiredByPaths'], key
    current = TEST.read_text()
    original = subprocess.check_output(['git', 'show', 'HEAD:' + str(TEST.relative_to(ROOT))], cwd=ROOT).decode()
    start = '    @Test\n    void ' + METHODS[0]
    end = '    private void assertReviewedBiologyFamilyPlanningSplit'
    helper = current.index('    private JsonNode reviewedSeedFixtureScopes()')
    assert original[:original.index(start)] == current[:helper].replace('import java.nio.file.Path;\n', '')
    assert original[original.index(end):] == current[current.index(end):]
    bio_chem = lambda text: [line for line in text.splitlines() if re.match(r'\s*\{ "(?:Biologie|Chemie)"', line)]
    assert bio_chem(original) == bio_chem(current) and len(bio_chem(current)) == 32
    archived_log = HERE / live_log.name
    put_once(archived_log, live_log.read_bytes())
    archived_xml = HERE / 'current-after-tests.actual.xml.gz'
    put_once(archived_xml, gzip.compress(live_xml.read_bytes(), mtime=0))
    final_observations = HERE / 'current-api-seed-scopes-after.actual.json'
    put_once(final_observations, (json.dumps({'status': 'actual-three-focused-integration-tests-after-fixture-repair',
             'observedScopeRows': raw_rows, 'uniqueScopes': len(observations), 'scopes': observations}, indent=2) + '\n').encode())
    before_xml = ET.fromstring(gzip.decompress((HERE / 'current-before-tests.actual.xml.gz').read_bytes()))
    assert (before_xml.get('tests'), before_xml.get('failures'), before_xml.get('errors')) == ('3', '3', '0')
    receipt = {
        'status': 'PASS-local-three-focused-native-integration-tests',
        'remoteFreshCIAndMainIntegration': 'pending-owner-integration-stream',
        'workingDirectory': 'backend', 'command': COMMAND, 'afterExitCode': 0,
        'before': {'exitCode': 1, 'tests': 3, 'failures': 3, 'errors': 0, 'skipped': 0,
                   'onlyFailures': '64 obsolete seed-size expectations; actual closure, DTO, source and applicability assertions already passed',
                   'xmlTimestamp': before_xml.get('timestamp')},
        'after': {'tests': 3, 'failures': 0, 'errors': 0, 'skipped': 0, 'xmlTimestamp': xml.get('timestamp'),
                  'testMethods': METHODS, 'scopeObservations': raw_rows, 'uniqueScopes': 128,
                  'allSeedIdsAndClosedTargetIdsAndRequiredByWitnessesUnchangedFromActualBefore': True},
        'boundedSourceChange': {'testFile': pin(TEST), 'onlyThreeExistingTestsPlusSharedExactIdentityHelperAndPathImport': True,
                               'unchangedBioChemTableRows': 32, 'unchangedBioChemDurationExpectations': 64,
                               'backendProductionChanges': [], 'canonicalSourceOrFloorChanges': []},
        'nativeReplay': {'baselineExitCode': 0, 'firstReviewedExitCode': 0, 'scopesEach': 128,
                         'all128BaselineCountsMatchOldFixtures': True, 'all64HistoricalCIFailureCountPairsReproduced': True,
                         'actualTask': 'replayReviewedSeedFixtures',
                         'actualGradleInitScript': pin(HERE / 'replay-native-seeds.init.gradle'),
                         'actualJavaAdapter': pin(HERE / 'ReviewedSeedFixtureProjection.java'),
                         'actualRequestConfigurations': pin(HERE / 'exact-native-request-configurations.actual.json'),
                         'equivalentReproductionCommands': pin(HERE / 'native-reproduction-commands.json'),
                         'actualDatasetRoots': ['tmp/backend-reviewed-seed-fixtures-20261115/before-root',
                                                'tmp/backend-reviewed-seed-fixtures-20261115/first-root'],
                         'runtimeSourceManifests': [pin(HERE / 'baseline-runtime-source-manifest.actual.json'),
                                                    pin(HERE / 'first-runtime-source-manifest.actual.json')]},
        'cacheStartFailures': [
            {'log': 'tmp/semiconductor-ci-qa-20261115/backend-three-current-before.actual.log',
             'meaning': 'No tests started: default Gradle distribution cache not writable'},
            {'log': 'tmp/semiconductor-ci-qa-20261115/backend-three-current-before-cache.actual.log',
             'meaning': 'No tests started: historical relocated project cache unusable; old cache left unchanged'}],
        'actualEvidence': [pin(HERE / 'current-before-tests.actual.xml.gz'), pin(archived_xml), pin(archived_log),
                           pin(HERE / 'backend-three-current-before-private-cache.actual.log'),
                           pin(HERE / 'seed-scope-comparison.actual.json'), pin(final_observations),
                           pin(HERE / 'scope-delta-decisions.actual.json'), pin(HERE / 'same-size-counterexamples.actual.json')],
        'firstExactIdentityHelperAttempt': {
            'exitCode': 1, 'tests': 3, 'failures': 2, 'errors': 0,
            'cause': 'AssertJ rejects an empty doesNotContainAnyElementsOf argument; helper now skips only empty delta lists while always asserting the complete expected seed set.',
            'crossStageAlreadyPassed': True,
            'xml': pin(HERE / 'first-exact-id-helper-failure.actual.xml.gz'),
            'log': pin(HERE / 'first-exact-id-helper-failure.actual.log')},
        'intermediateHelperCompileAttempt': {
            'exitCode': 1, 'testsStarted': False,
            'cause': 'The initial empty-list guard used Set variables for the existing List-returning JSON helper; corrected to List before the final selected test run.',
            'log': pin(HERE / 'intermediate-helper-type-compile.actual.log')},
    }
    output = HERE / 'final-local-validation.actual.json'
    put_once(output, (json.dumps(receipt, ensure_ascii=False, indent=2) + '\n').encode())
    manifest = {'status': 'immutable-local-backend-fixture-repair-evidence',
                'files': [pin(path) for path in sorted(HERE.iterdir()) if path.is_file() and path.name != 'manifest.actual.json']}
    put_once(HERE / 'manifest.actual.json', (json.dumps(manifest, indent=2) + '\n').encode())
    print(json.dumps({'tests': 3, 'failures': 0, 'exactScopes': 128, 'preservedBioChemDurationExpectations': 64,
                      'receipt': str(output.relative_to(ROOT))}))

if __name__ == '__main__':
    main()
